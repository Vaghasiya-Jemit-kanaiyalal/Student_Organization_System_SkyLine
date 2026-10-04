import uuid
import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from volunteers.models import Event, Ticket
from volunteers.serializers import TicketSerializer
from .models import Payment, MerchandiseProduct, MerchandiseOrder, Transaction
from .serializers import (
    PaymentSerializer,
    MerchandiseProductSerializer,
    MerchandiseOrderSerializer
)
from .razorpay_service import (
    create_razorpay_order,
    verify_razorpay_payment_signature,
    verify_webhook_signature,
    RAZORPAY_KEY_ID
)
from .qr_utils import generate_qr_image_file
from .pdf_utils import generate_ticket_pdf, generate_merchandise_pdf
from .payment_service import get_payment_service

from django.conf import settings
from accounts.services.email_service import (
    send_event_payment_success_email,
    send_merchandise_payment_success_email
)

logger = logging.getLogger(__name__)


class EventCreatePaymentView(APIView):
    """
    POST /api/events/<int:event_id>/create-payment/
    Validates event, checks capacity, computes authoritative backend price based on student membership,
    creates pending Payment record in PostgreSQL, creates Razorpay Order, and returns checkout credentials.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        user = request.user
        try:
            event = Event.objects.get(pk=event_id)
        except (Event.DoesNotExist, ValueError):
            return Response(
                {"error": f"Event #{event_id} not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not event.is_active or event.status != Event.Status.PUBLISHED:
            return Response(
                {"error": "This event is currently inactive or not open for ticket reservations."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check capacity
        confirmed_tickets_count = event.tickets.filter(status='Confirmed').count()
        if confirmed_tickets_count >= event.capacity:
            return Response(
                {"error": "This event is completely sold out. Attendee capacity reached."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent duplicate tickets for same event
        already_booked = event.tickets.filter(
            student=user,
            status=Ticket.Status.CONFIRMED
        ).first()
        if already_booked:
            return Response(
                {
                    "error": f"You are already registered for '{event.title}'. Duplicate registrations are not permitted.",
                    "already_registered": True,
                    "ticket_id": already_booked.ticket_id
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine price authoritatively on backend based on student membership status
        is_member = (
            getattr(user, 'membership_status', 'NONE') == 'ACTIVE'
            or getattr(user, 'is_active_member', False)
        )
        if is_member:
            tier = 'Member Pass'
            final_price = Decimal(str(event.member_ticket_price))
        else:
            tier = 'Standard Pass'
            final_price = Decimal(str(event.non_member_ticket_price or event.ticket_price))

        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            quantity = 1
        total_amount = final_price * quantity

        # Create Razorpay Order
        receipt_ref = f"ev_{event.id}_u{user.id}_{uuid.uuid4().hex[:6]}"
        rzp_order = create_razorpay_order(
            amount=total_amount,
            currency='INR',
            receipt=receipt_ref,
            notes={
                'user_id': user.id,
                'user_email': user.email,
                'event_id': event.id,
                'event_title': event.title,
                'tier': tier,
                'quantity': quantity
            }
        )

        # Create pending Payment record in database
        payment = Payment.objects.create(
            user=user,
            amount=total_amount,
            currency='INR',
            razorpay_order_id=rzp_order['id'],
            status=Payment.Status.PENDING,
            payment_type=Payment.PaymentType.EVENT_TICKET,
            metadata={
                'event_id': event.id,
                'tier': tier,
                'quantity': quantity,
                'unit_price': str(final_price),
                'receipt': receipt_ref,
                'is_simulated': rzp_order.get('is_simulated', False)
            }
        )

        return Response({
            'payment_id': payment.id,
            'razorpay_order_id': rzp_order['id'],
            'amount': rzp_order['amount'], # in paise
            'amount_in_rupees': float(total_amount),
            'currency': rzp_order['currency'],
            'key_id': rzp_order['key_id'],
            'tier': tier,
            'event': {
                'id': event.id,
                'title': event.title,
                'venue': event.venue or event.location,
                'date': str(event.date),
                'image': event.image
            },
            'user': {
                'name': user.full_name,
                'email': user.email,
                'phone': getattr(user, 'phone', '+91 9876543210')
            },
            'is_simulated': rzp_order.get('is_simulated', False)
        }, status=status.HTTP_201_CREATED)


class MerchandiseOrderCreatePaymentView(APIView):
    """
    POST /api/merchandise/orders/create-payment/ or POST /api/merchandise/orders/
    Validates merchandise, size stock availability, computes backend price,
    creates pending MerchandiseOrder and Payment record, creates Razorpay Order,
    and returns checkout credentials to frontend.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id=None):
        user = request.user
        product_id = request.data.get('product_id') or request.data.get('productId') or request.data.get('merchandise_id')
        size = str(request.data.get('size') or request.data.get('variant') or 'M').strip()
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"error": "Product ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        if quantity < 1:
            return Response({"error": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = MerchandiseProduct.objects.get(pk=product_id)
        except MerchandiseProduct.DoesNotExist:
            return Response({"error": f"Merchandise item '{product_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

        if not product.is_active:
            return Response({"error": "This merchandise item is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock for requested size
        size_stock = product.size_stock or {}
        available_for_size = int(size_stock.get(size, 0))
        if available_for_size < quantity:
            return Response({
                "error": f"Insufficient stock for size {size}. Available: {available_for_size} unit(s)."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authoritative backend pricing based on student membership
        is_member = (
            getattr(user, 'membership_status', 'NONE') == 'ACTIVE'
            or getattr(user, 'is_active_member', False)
        )
        unit_price = Decimal(str(product.member_price if is_member else product.regular_price))
        total_amount = unit_price * quantity

        # Generate unique order id
        generated_order_id = f"ORD-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"

        # Create Razorpay Order
        rzp_order = create_razorpay_order(
            amount=total_amount,
            currency='INR',
            receipt=f"mch_{generated_order_id}",
            notes={
                'user_id': user.id,
                'order_id': generated_order_id,
                'product_id': product.id,
                'variant': size,
                'quantity': quantity
            }
        )

        # Database transaction for pending order & payment
        with transaction.atomic():
            payment = Payment.objects.create(
                user=user,
                amount=total_amount,
                currency='INR',
                razorpay_order_id=rzp_order['id'],
                status=Payment.Status.PENDING,
                payment_type=Payment.PaymentType.MERCHANDISE,
                metadata={
                    'order_id': generated_order_id,
                    'product_id': product.id,
                    'size': size,
                    'quantity': quantity,
                    'unit_price': str(unit_price),
                    'is_simulated': rzp_order.get('is_simulated', False)
                }
            )

            order = MerchandiseOrder.objects.create(
                order_id=generated_order_id,
                user=user,
                merchandise=product,
                variant=size,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=total_amount,
                payment=payment,
                order_status=MerchandiseOrder.OrderStatus.PENDING,
                collection_status=MerchandiseOrder.CollectionStatus.PENDING,
                pickup_location='Student Union Desk - Campus Hub',
                notes=request.data.get('notes', 'Campus merchandise pickup order')
            )

        return Response({
            'order_id': order.order_id,
            'payment_id': payment.id,
            'razorpay_order_id': rzp_order['id'],
            'amount': rzp_order['amount'], # in paise
            'amount_in_rupees': float(total_amount),
            'currency': rzp_order['currency'],
            'key_id': rzp_order['key_id'],
            'product': {
                'id': product.id,
                'name': product.name,
                'size': size,
                'quantity': quantity,
                'image': product.image
            },
            'user': {
                'name': user.full_name,
                'email': user.email,
                'phone': getattr(user, 'phone', '+91 9876543210')
            },
            'is_simulated': rzp_order.get('is_simulated', False)
        }, status=status.HTTP_201_CREATED)


class RazorpayPaymentVerifyView(APIView):
    """
    POST /api/payments/razorpay/verify/
    Verifies Razorpay payment signature cryptographically on Django backend.
    Enforces idempotency:
      - If already verified and ticket/order generated, returns the existing record without duplicates.
      - Upon successful verification:
        1. Updates Payment status to SUCCESS.
        2. Generates secure QR token.
        3. Generates high-res QR code image file.
        4. Generates professional PDF Ticket or Collection Pass.
        5. Deducts inventory / records transaction in Finance ledger.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not razorpay_order_id or not razorpay_payment_id:
            return Response(
                {"error": "Missing razorpay_order_id or razorpay_payment_id in verification payload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find corresponding pending or existing Payment record
        payment = Payment.objects.filter(razorpay_order_id=razorpay_order_id).first()
        if not payment:
            return Response(
                {"error": f"No payment order found for ID '{razorpay_order_id}'."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Idempotency check: If payment was already verified and ticket/order was issued, return it directly
        if payment.status == Payment.Status.SUCCESS:
            if payment.payment_type == Payment.PaymentType.EVENT_TICKET:
                ticket = Ticket.objects.filter(payment=payment).first()
                if ticket:
                    return Response({
                        'success': True,
                        'message': 'Payment already verified previously.',
                        'payment_type': 'EVENT_TICKET',
                        'ticket': TicketSerializer(ticket).data
                    }, status=status.HTTP_200_OK)
            elif payment.payment_type == Payment.PaymentType.MERCHANDISE:
                order = MerchandiseOrder.objects.filter(payment=payment).first()
                if order:
                    return Response({
                        'success': True,
                        'message': 'Merchandise payment already verified previously.',
                        'payment_type': 'MERCHANDISE',
                        'order': MerchandiseOrderSerializer(order).data
                    }, status=status.HTTP_200_OK)

        # Check for simulated demo payment signature
        if razorpay_signature in ['simulated_success', 'demo_success']:
            service = get_payment_service()
            result = service.complete_payment(payment.id, user)
            return Response(result, status=status.HTTP_201_CREATED)

        # Cryptographic Razorpay Signature Verification
        is_valid_sig = verify_razorpay_payment_signature(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature or ''
        )

        if not is_valid_sig:
            payment.status = Payment.Status.FAILED
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature or ''
            payment.save(update_fields=['status', 'razorpay_payment_id', 'razorpay_signature', 'updated_at'])
            logger.warning(f"Razorpay signature verification failed for payment #{payment.id}")
            return Response(
                {"error": "Cryptographic payment verification failed. Invalid Razorpay signature."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atomically confirm payment, update inventory, and generate secure QR + PDF
        with transaction.atomic():
            payment.status = Payment.Status.SUCCESS
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature or ''
            payment.save()

            # Record in Finance General Ledger
            Transaction.objects.create(
                title=f"Razorpay Payment ({payment.payment_type}) - #{payment.id}",
                amount=payment.amount,
                transaction_type=Transaction.Type.INCOME,
                category=Transaction.Category.MERCHANDISE if payment.payment_type == Payment.PaymentType.MERCHANDISE else Transaction.Category.OTHER,
                description=f"Automated payment confirmation: Order #{razorpay_order_id}, Payment #{razorpay_payment_id}",
                date=timezone.now().date(),
                recorded_by=user
            )

            # -------------------------------------------------------------
            # CASE A: EVENT TICKET
            # -------------------------------------------------------------
            if payment.payment_type == Payment.PaymentType.EVENT_TICKET:
                event_id = payment.metadata.get('event_id')
                tier = payment.metadata.get('tier', 'Standard Pass')
                event = Event.objects.select_for_update().get(pk=event_id)

                # Prevent duplicate tickets for same event
                already_booked = event.tickets.filter(
                    student=user,
                    status=Ticket.Status.CONFIRMED
                ).exists()
                if already_booked:
                    payment.status = Payment.Status.FAILED
                    payment.save(update_fields=['status'])
                    return Response({
                        "error": f"You are already registered for '{event.title}'. Duplicate registrations are not permitted."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Generate secure verification URL for event admission
                ticket_uuid = uuid.uuid4()
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                verification_url = f"{frontend_url}/ticket/{ticket_uuid}"

                ticket = Ticket.objects.create(
                    student=user,
                    event=event,
                    payment=payment,
                    tier=tier,
                    price_paid=payment.amount,
                    status=Ticket.Status.CONFIRMED,
                    ticket_uuid=ticket_uuid,
                    qr_token=str(ticket_uuid),
                    qr_code_data=verification_url
                )

                # Generate QR code PNG encoding verification URL
                qr_file = generate_qr_image_file(verification_url, filename=f"{ticket.ticket_id}_qr.png")
                ticket.qr_code.save(f"{ticket.ticket_id}_qr.png", qr_file, save=False)

                # Generate Ticket PDF
                pdf_file = generate_ticket_pdf(ticket)
                ticket.pdf_file.save(f"{ticket.ticket_id}.pdf", pdf_file, save=False)
                ticket.save()
                payment.ticket = ticket
                payment.status = Payment.Status.SUCCESS
                payment.save(update_fields=['ticket', 'status'])

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Event Ticket - {event.title} ({tier})",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.EVENT_TICKET,
                    reference_type=Transaction.ReferenceType.EVENT_TICKET,
                    reference_id=ticket.ticket_id,
                    party_name=user.full_name or 'Student Member',
                    description=f"Ticket #{ticket.ticket_id} via Online Payment {razorpay_payment_id or payment.razorpay_payment_id or payment.transaction_id}",
                    date=timezone.now().date(),
                    recorded_by=user
                )

                # Dispatch official event ticket confirmation email
                try:
                    send_event_payment_success_email(
                        user=user,
                        event_name=event.title,
                        event_date=str(event.date),
                        event_time=getattr(event, 'time_display', '10:00 AM') or '10:00 AM',
                        event_venue=getattr(event, 'venue', '') or getattr(event, 'location', '') or 'Skyline University Campus',
                        ticket_id=ticket.ticket_id,
                        amount_paid=str(payment.amount),
                        payment_id=razorpay_payment_id or payment.razorpay_payment_id or str(payment.id),
                        ticket_url=f"{frontend_url}/ticket/{ticket.ticket_uuid}"
                    )
                except Exception as email_err:
                    logger.error(f"Failed to dispatch event ticket confirmation email: {email_err}")

                return Response({
                    'success': True,
                    'message': 'Payment verified and official ticket issued.',
                    'payment_type': 'EVENT_TICKET',
                    'ticket': TicketSerializer(ticket).data
                }, status=status.HTTP_201_CREATED)

            # -------------------------------------------------------------
            # CASE B: MERCHANDISE ORDER
            # -------------------------------------------------------------
            elif payment.payment_type == Payment.PaymentType.MERCHANDISE:
                order_id = payment.metadata.get('order_id')
                order = MerchandiseOrder.objects.select_for_update().filter(order_id=order_id).first()
                if not order:
                    order = MerchandiseOrder.objects.filter(payment=payment).first()

                # Generate secure QR token for merchandise collection
                qr_token = f"SKYLINE-MERCH:{uuid.uuid4()}"

                order.order_status = MerchandiseOrder.OrderStatus.CONFIRMED
                order.collection_status = MerchandiseOrder.CollectionStatus.READY
                order.qr_token = qr_token

                # Deduct inventory stock for the purchased size
                product = order.merchandise
                if product:
                    product = MerchandiseProduct.objects.select_for_update().get(pk=product.id)
                    size_map = product.size_stock or {}
                    curr_stock = int(size_map.get(order.variant, 0))
                    new_stock = max(0, curr_stock - order.quantity)
                    size_map[order.variant] = new_stock
                    product.size_stock = size_map
                    product.save(update_fields=['size_stock'])

                # Generate QR code PNG
                qr_file = generate_qr_image_file(qr_token, filename=f"{order.order_id}_qr.png")
                order.qr_code.save(f"{order.order_id}_qr.png", qr_file, save=False)

                # Generate Merchandise Collection Pass PDF
                pdf_file = generate_merchandise_pdf(order)
                order.pdf_file.save(f"{order.order_id}.pdf", pdf_file, save=False)
                order.save()
                payment.merchandise_order = order
                payment.status = Payment.Status.SUCCESS
                payment.save(update_fields=['merchandise_order', 'status'])

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Merchandise Order - {product.name if product else 'Merchandise'} ({order.variant})",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.MERCHANDISE,
                    reference_type=Transaction.ReferenceType.MERCHANDISE,
                    reference_id=order.order_id,
                    party_name=user.full_name or 'Student Customer',
                    description=f"Order #{order.order_id} ({order.quantity}x {order.variant}) via Online Payment {razorpay_payment_id or payment.razorpay_payment_id or payment.transaction_id}",
                    date=timezone.now().date(),
                    recorded_by=user
                )

                # Dispatch official merchandise order confirmation email
                try:
                    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                    product_name = product.name if product else 'Skyline Official Merchandise'
                    image_url = product.image if product and product.image else ''
                    send_merchandise_payment_success_email(
                        user=user,
                        order_id=order.order_id,
                        item_name=product_name,
                        amount_paid=str(payment.amount),
                        quantity=order.quantity,
                        variant=order.variant,
                        image_url=image_url,
                        payment_id=razorpay_payment_id or payment.razorpay_payment_id or str(payment.id),
                        collection_status=order.collection_status,
                        order_url=f"{frontend_url}/member/dashboard?tab=merchandise"
                    )
                except Exception as email_err:
                    logger.error(f"Failed to dispatch merchandise confirmation email: {email_err}")

                return Response({
                    'success': True,
                    'message': 'Merchandise payment verified and collection pass issued.',
                    'payment_type': 'MERCHANDISE',
                    'order': MerchandiseOrderSerializer(order).data
                }, status=status.HTTP_201_CREATED)

        return Response({"error": "Unknown payment type."}, status=status.HTTP_400_BAD_REQUEST)


class RazorpayWebhookView(APIView):
    """
    POST /api/payments/razorpay/webhook/
    Webhook endpoint for asynchronous payment confirmation and reconciliation.
    Validates webhook signature against RAZORPAY_WEBHOOK_SECRET.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature')
        body_bytes = request.body

        if not verify_webhook_signature(body_bytes, signature):
            return Response({"error": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)

        event_data = request.data
        event_name = event_data.get('event')

        if event_name == 'payment.captured':
            payment_entity = event_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')

            if order_id and payment_id:
                payment = Payment.objects.filter(razorpay_order_id=order_id).first()
                if payment and payment.status != Payment.Status.SUCCESS:
                    payment.status = Payment.Status.SUCCESS
                    payment.razorpay_payment_id = payment_id
                    payment.save(update_fields=['status', 'razorpay_payment_id', 'updated_at'])

        return Response({"status": "received"}, status=status.HTTP_200_OK)


class MerchandiseProductListView(APIView):
    """
    GET /api/merchandise/products/
    Lists all active merchandise products with current real-time stock.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        products = MerchandiseProduct.objects.filter(is_active=True).order_by('name')
        serializer = MerchandiseProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MerchandiseOrderListView(APIView):
    """
    GET /api/merchandise/orders/
    Lists merchandise orders:
      - Normal students: only their own orders.
      - Organizers / Admins / Treasurers: can view all orders or filter by query params.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        is_admin_or_treasurer = (
            user.role in [User.Role.ADMIN, User.Role.TREASURER]
            or user.is_staff
            or user.is_superuser
        )

        if is_admin_or_treasurer and request.query_params.get('scope') == 'all':
            orders = MerchandiseOrder.objects.all().select_related('merchandise', 'user', 'payment')
        else:
            orders = MerchandiseOrder.objects.filter(user=user).select_related('merchandise', 'user', 'payment')

        collection_filter = request.query_params.get('collection_status')
        if collection_filter:
            orders = orders.filter(collection_status__iexact=collection_filter)

        serializer = MerchandiseOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MerchandiseOrderDetailView(APIView):
    """
    GET /api/merchandise/orders/<str:order_id>/
    Returns single merchandise order details with security check (only owner or admin).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        user = request.user
        order = get_object_or_404(MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment'), order_id=order_id)

        # Role-based authorization
        is_authorized = (
            order.user == user
            or user.role in [User.Role.ADMIN, User.Role.TREASURER]
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({"error": "Unauthorized to access this merchandise order."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MerchandiseOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MerchandiseOrderPdfDownloadView(APIView):
    """
    GET /api/merchandise/orders/<str:order_id>/pdf/
    Downloads the official Merchandise Collection Pass PDF.
    Regenerates if file missing.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        user = request.user
        order = get_object_or_404(MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment'), order_id=order_id)

        is_authorized = (
            order.user == user
            or user.role in [User.Role.ADMIN, User.Role.TREASURER]
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({"error": "Unauthorized to access this collection pass."}, status=status.HTTP_403_FORBIDDEN)

        if not order.pdf_file or not order.pdf_file.storage.exists(order.pdf_file.name):
            pdf_file = generate_merchandise_pdf(order)
            order.pdf_file.save(f"{order.order_id}.pdf", pdf_file, save=True)

        return FileResponse(
            order.pdf_file.open('rb'),
            content_type='application/pdf',
            filename=f"Skyline_Collection_Pass_{order.order_id}.pdf"
        )


class MerchandiseOrderQrVerifyView(APIView):
    """
    POST /api/merchandise/orders/verify-qr/
    Organizer / Admin scanner endpoint to verify merchandise collection QR token.
    Validates:
      - Valid token exists
      - Payment verified (PAID)
      - Order status
      - Collection status (ALREADY_COLLECTED check)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        is_authorized = (
            user.role in [User.Role.ADMIN, User.Role.TREASURER]
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({"error": "Access denied. Only authorized staff and organizers can scan collection passes."}, status=status.HTTP_403_FORBIDDEN)

        qr_token = (request.data.get('qr_token') or request.data.get('token') or request.data.get('order_id') or '').strip()
        if not qr_token:
            return Response({"error": "QR token is required."}, status=status.HTTP_400_BAD_REQUEST)

        order = MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment').filter(
            models_q = None
        ) if False else None

        # Look up by qr_token or order_id
        order = MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment').filter(
            qr_token=qr_token
        ).first()

        if not order:
            # Also try matching by order_id or stripping prefix
            clean_token = qr_token.replace('SKYLINE-MERCH:', '').strip()
            order = MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment').filter(
                order_id__iexact=clean_token
            ).first() or MerchandiseOrder.objects.select_related('merchandise', 'user', 'payment').filter(
                qr_token__icontains=clean_token
            ).first()

        if not order:
            return Response({
                'is_valid': False,
                'verification_status': 'INVALID_ORDER_QR',
                'title': 'INVALID ORDER QR',
                'message': 'No merchandise order found matching this QR code token.',
                'order': None
            }, status=status.HTTP_200_OK)

        # Check Payment Status
        if order.payment and order.payment.status != Payment.Status.SUCCESS:
            return Response({
                'is_valid': False,
                'verification_status': 'PAYMENT_NOT_VERIFIED',
                'title': 'PAYMENT NOT VERIFIED',
                'message': f"Payment for order #{order.order_id} has not been verified.",
                'order': MerchandiseOrderSerializer(order).data
            }, status=status.HTTP_200_OK)

        # Check Order Status
        if order.order_status == MerchandiseOrder.OrderStatus.CANCELLED:
            return Response({
                'is_valid': False,
                'verification_status': 'ORDER_CANCELLED',
                'title': 'ORDER CANCELLED',
                'message': f"Order #{order.order_id} was cancelled.",
                'order': MerchandiseOrderSerializer(order).data
            }, status=status.HTTP_200_OK)

        # Check if Already Collected
        if order.collection_status == MerchandiseOrder.CollectionStatus.COLLECTED:
            collected_time_str = order.collected_at.strftime('%b %d, %Y • %I:%M %p') if order.collected_at else 'Earlier'
            collected_by_str = order.collected_by.full_name if order.collected_by else 'Desk Staff'
            return Response({
                'is_valid': False,
                'verification_status': 'ALREADY_COLLECTED',
                'collection_status': order.collection_status,
                'title': 'ALREADY COLLECTED',
                'message': f"This merchandise order was already collected on {collected_time_str} by {collected_by_str}.",
                'order': MerchandiseOrderSerializer(order).data,
                'collected_at': str(order.collected_at),
                'collected_by': collected_by_str
            }, status=status.HTTP_200_OK)

        # Valid and ready for collection!
        return Response({
            'is_valid': True,
            'verification_status': 'VALID',
            'collection_status': order.collection_status,
            'title': 'MERCHANDISE ORDER VERIFIED',
            'message': 'Order is paid, verified, and ready for item collection.',
            'order': MerchandiseOrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class MerchandiseOrderCollectView(APIView):
    """
    POST /api/merchandise/orders/<str:order_id>/collect/
    Organizer / Admin confirms item handover and marks collection status as COLLECTED.
    Prevents duplicate collection!
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        user = request.user
        is_authorized = (
            user.role in [User.Role.ADMIN, User.Role.TREASURER]
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({"error": "Unauthorized to record collections."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            order = get_object_or_404(MerchandiseOrder.objects.select_for_update(), order_id=order_id)

            if order.collection_status == MerchandiseOrder.CollectionStatus.COLLECTED:
                return Response({
                    "error": f"Order #{order.order_id} has already been marked as collected on {order.collected_at}."
                }, status=status.HTTP_400_BAD_REQUEST)

            order.collection_status = MerchandiseOrder.CollectionStatus.COLLECTED
            order.collected_at = timezone.now()
            order.collected_by = user
            order.save(update_fields=['collection_status', 'collected_at', 'collected_by', 'updated_at'])

        return Response({
            'success': True,
            'collection_status': order.collection_status,
            'message': f"Order #{order.order_id} successfully marked as COLLECTED.",
            'order': MerchandiseOrderSerializer(order).data
        }, status=status.HTTP_200_OK)


class DemoPaymentCreateView(APIView):
    """
    POST /api/payments/demo/create/
    Initializes a simulated demo payment.
    Accepts:
      - payment_type: EVENT_TICKET, MERCHANDISE, MEMBERSHIP, DONATION
      - event_id, quantity (for EVENT_TICKET)
      - product_id, size, quantity (for MERCHANDISE)
      - amount, plan (for MEMBERSHIP)
      - amount, fundraiser_title, fundraiser_id (for DONATION)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        payment_type = data.get('payment_type', 'EVENT_TICKET')
        amount = data.get('amount')
        if amount is not None:
            try:
                amount = Decimal(str(amount))
            except Exception:
                amount = None

        metadata = data.copy()
        try:
            service = get_payment_service()
            result = service.create_payment(
                user=user,
                payment_type=payment_type,
                amount=amount,
                metadata=metadata
            )
            return Response(result, status=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error creating demo payment: {e}", exc_info=True)
            return Response({"error": f"Failed to initialize payment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DemoPaymentProcessView(APIView):
    """
    POST /api/payments/demo/process/
    Transitions payment to PROCESSING state.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        payment_id = request.data.get('payment_id')
        if not payment_id:
            return Response({"error": "payment_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = get_payment_service()
            result = service.process_payment(payment_id=payment_id, user=user)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error processing demo payment: {e}", exc_info=True)
            return Response({"error": f"Failed to process payment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DemoPaymentCompleteView(APIView):
    """
    POST /api/payments/demo/complete/
    Authoritatively completes the demo payment:
      - Marks payment status as SUCCESS
      - Confirms ticket or order or donation
      - Generates QR and PDF
      - Decrements inventory / updates capacity
      - Dispatches email
      - Records ledger entry
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        payment_id = request.data.get('payment_id')
        transaction_id = request.data.get('transaction_id')

        if not payment_id and not transaction_id:
            return Response({"error": "Either payment_id or transaction_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not payment_id and transaction_id:
            payment = Payment.objects.filter(transaction_id=transaction_id, user=user).first()
            if payment:
                payment_id = payment.id
            else:
                return Response({"error": f"Transaction '{transaction_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            service = get_payment_service()
            result = service.complete_payment(payment_id=payment_id, user=user, payload=request.data)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as val_err:
            return Response({"error": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error completing demo payment: {e}", exc_info=True)
            return Response({"error": f"Failed to complete payment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTransactionListView(APIView):
    """
    GET /api/payments/transactions/
    Returns full history of payments/transactions for the requesting user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        service = get_payment_service()
        transactions = service.get_user_transactions(user)
        return Response(transactions, status=status.HTTP_200_OK)

