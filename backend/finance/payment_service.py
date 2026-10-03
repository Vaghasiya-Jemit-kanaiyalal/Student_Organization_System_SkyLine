import uuid
import random
import logging
from abc import ABC, abstractmethod
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.conf import settings

from accounts.models import User
from volunteers.models import Event, Ticket
from volunteers.serializers import TicketSerializer
from .models import Payment, MerchandiseProduct, MerchandiseOrder, Transaction
from .serializers import MerchandiseOrderSerializer
from .qr_utils import generate_qr_image_file
from .pdf_utils import generate_ticket_pdf, generate_merchandise_pdf
from accounts.services.email_service import (
    send_event_payment_success_email,
    send_merchandise_payment_success_email
)

logger = logging.getLogger(__name__)


class BasePaymentService(ABC):
    """
    Abstract Base Payment Service.
    Defines the contract for both simulated demo payments and production payment gateways (e.g., Razorpay).
    """

    @abstractmethod
    def create_payment(self, user: User, payment_type: str, amount: Decimal, metadata: dict) -> dict:
        """Create a pending payment transaction."""
        pass

    @abstractmethod
    def process_payment(self, payment_id: int, user: User) -> dict:
        """Transition payment to PROCESSING state."""
        pass

    @abstractmethod
    def complete_payment(self, payment_id: int, user: User, payload: dict = None) -> dict:
        """Atomically complete payment, issue tickets/orders, generate QR/PDF, send email, and update ledger."""
        pass


class DemoPaymentService(BasePaymentService):
    """
    Realistic Demo / Simulated Payment Service for Skyline.
    Simulates the full payment lifecycle with:
      - Unique transaction IDs (e.g., SKY-DEMO-20261004-891234)
      - Zero real-money movement
      - Multi-stage lifecycle: PENDING -> PROCESSING -> SUCCESS
      - Strict stock & capacity protection (inventory/tickets only confirmed on SUCCESS)
      - Entry & Collection QR generation
      - Official PDF generation
      - Automatic general ledger synchronization
      - Email notification dispatch
    """

    def generate_transaction_id(self) -> str:
        """Generates a realistic, collision-free transaction ID."""
        today_str = timezone.now().strftime('%Y%m%d')
        rand_code = f"{random.randint(100000, 999999)}"
        return f"SKY-DEMO-{today_str}-{rand_code}"

    def create_payment(self, user: User, payment_type: str, amount: Decimal = None, metadata: dict = None) -> dict:
        """
        Validates request and creates a PENDING Payment record without consuming inventory or capacity.
        """
        metadata = metadata or {}
        payment_type = payment_type.upper()

        if payment_type not in Payment.PaymentType.values:
            raise ValueError(f"Invalid payment type '{payment_type}'. Must be one of {Payment.PaymentType.values}.")

        event = None
        merchandise_product = None
        item_title = "Skyline Purchase"
        calculated_amount = amount or Decimal('0.00')

        # ---------------------------------------------------------
        # Case A: EVENT TICKET
        # ---------------------------------------------------------
        if payment_type == Payment.PaymentType.EVENT_TICKET:
            event_id = metadata.get('event_id')
            if not event_id:
                raise ValueError("Missing 'event_id' in payment metadata.")

            try:
                event = Event.objects.get(pk=event_id)
            except Event.DoesNotExist:
                raise ValueError(f"Event #{event_id} not found.")

            if not event.is_active or event.status != Event.Status.PUBLISHED:
                raise ValueError("This event is currently inactive or not open for ticket reservations.")

            # Validate capacity before creating payment
            confirmed_tickets_count = event.tickets.filter(status='Confirmed').count()
            if confirmed_tickets_count >= event.capacity:
                raise ValueError("This event is completely sold out. Attendee capacity reached.")

            # Authoritative pricing
            is_member = (
                getattr(user, 'membership_status', 'NONE') == 'ACTIVE'
                or getattr(user, 'is_active_member', False)
            )
            unit_price = Decimal(str(event.member_ticket_price if is_member else (event.non_member_ticket_price or event.ticket_price)))
            quantity = int(metadata.get('quantity', 1))
            if quantity < 1:
                quantity = 1

            calculated_amount = unit_price * quantity
            tier = 'Member Pass' if is_member else 'Standard Pass'
            item_title = f"{event.title} ({tier})"

            metadata['event_id'] = event.id
            metadata['event_title'] = event.title
            metadata['tier'] = tier
            metadata['unit_price'] = str(unit_price)
            metadata['quantity'] = quantity

        # ---------------------------------------------------------
        # Case B: MERCHANDISE
        # ---------------------------------------------------------
        elif payment_type == Payment.PaymentType.MERCHANDISE:
            product_id = metadata.get('product_id')
            size = str(metadata.get('size') or 'M').strip()
            quantity = int(metadata.get('quantity', 1))

            if not product_id:
                raise ValueError("Missing 'product_id' in payment metadata.")

            try:
                merchandise_product = MerchandiseProduct.objects.get(pk=product_id)
            except MerchandiseProduct.DoesNotExist:
                raise ValueError(f"Merchandise item '{product_id}' not found.")

            if not merchandise_product.is_active:
                raise ValueError(f"Merchandise item '{merchandise_product.name}' is currently unavailable.")

            # Stock check
            size_stock = merchandise_product.size_stock or {}
            available = int(size_stock.get(size, 0))
            if available < quantity:
                raise ValueError(f"Insufficient stock for size {size}. Available: {available} unit(s).")

            is_member = (
                getattr(user, 'membership_status', 'NONE') == 'ACTIVE'
                or getattr(user, 'is_active_member', False)
            )
            unit_price = Decimal(str(merchandise_product.member_price if is_member else merchandise_product.regular_price))
            calculated_amount = unit_price * quantity
            item_title = f"{merchandise_product.name} (Size: {size}, Qty: {quantity})"

            metadata['product_id'] = merchandise_product.id
            metadata['product_name'] = merchandise_product.name
            metadata['size'] = size
            metadata['quantity'] = quantity
            metadata['unit_price'] = str(unit_price)

        # ---------------------------------------------------------
        # Case C: MEMBERSHIP
        # ---------------------------------------------------------
        elif payment_type == Payment.PaymentType.MEMBERSHIP:
            plan = str(metadata.get('plan') or metadata.get('membership_type') or 'ANNUAL').upper()
            unit_price = Decimal(str(amount or (499.00 if plan == 'ANNUAL' else 299.00)))
            calculated_amount = unit_price
            item_title = f"Skyline Membership - {plan}"
            metadata['plan'] = plan

        # ---------------------------------------------------------
        # Case D: DONATION / OTHER
        # ---------------------------------------------------------
        else:
            if not amount or Decimal(str(amount)) <= 0:
                raise ValueError("Donation or contribution amount must be greater than zero.")
            calculated_amount = Decimal(str(amount))
            fundraiser_title = metadata.get('fundraiser_title') or metadata.get('title') or 'General Campus Fund'
            item_title = f"Contribution to {fundraiser_title}"

        # Generate unique transaction ID
        txn_id = self.generate_transaction_id()
        while Payment.objects.filter(transaction_id=txn_id).exists():
            txn_id = self.generate_transaction_id()

        # Create Pending Payment
        payment = Payment.objects.create(
            transaction_id=txn_id,
            user=user,
            amount=calculated_amount,
            currency='INR',
            payment_mode=Payment.PaymentMode.DEMO,
            razorpay_order_id=f"order_{txn_id}",
            status=Payment.Status.PENDING,
            payment_type=payment_type,
            event=event,
            metadata=metadata
        )

        return {
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'payment_type': payment.payment_type,
            'payment_mode': payment.payment_mode,
            'status': payment.status,
            'item_title': item_title,
            'metadata': payment.metadata,
            'created_at': payment.created_at.isoformat()
        }

    def process_payment(self, payment_id: int, user: User) -> dict:
        """
        Transitions payment from PENDING to PROCESSING state.
        """
        payment = Payment.objects.filter(pk=payment_id, user=user).first()
        if not payment:
            raise ValueError(f"Payment #{payment_id} not found.")

        if payment.status in [Payment.Status.SUCCESS, Payment.Status.CANCELLED]:
            return {
                'payment_id': payment.id,
                'transaction_id': payment.transaction_id,
                'status': payment.status,
                'message': f"Payment is already in final state: {payment.status}"
            }

        payment.status = Payment.Status.PROCESSING
        payment.save(update_fields=['status', 'updated_at'])
        return {
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'status': payment.status,
            'message': 'Payment is now processing.'
        }

    def complete_payment(self, payment_id: int, user: User, payload: dict = None) -> dict:
        """
        Completes the simulated payment:
          1. Atomically marks Payment as SUCCESS.
          2. Issues confirmed Ticket, confirmed MerchandiseOrder, or records Donation.
          3. Generates QR and official PDF.
          4. Updates inventory or event capacity.
          5. Dispatches email confirmation.
          6. Records transaction in Finance General Ledger.
        """
        with transaction.atomic():
            payment = Payment.objects.select_for_update().filter(pk=payment_id, user=user).first()
            if not payment:
                raise ValueError(f"Payment #{payment_id} not found.")

            # Idempotency check: If already completed, return existing issued assets
            if payment.status == Payment.Status.SUCCESS:
                return self._build_completion_response(payment, is_repeat=True)

            # Set SUCCESS
            payment.status = Payment.Status.SUCCESS
            payment.completed_at = timezone.now()
            payment.razorpay_payment_id = f"pay_{payment.transaction_id}"
            payment.save()

            ticket_data = None
            order_data = None
            membership_data = None
            donation_data = None

            # -------------------------------------------------------------
            # ACTION 1: EVENT TICKET
            # -------------------------------------------------------------
            if payment.payment_type == Payment.PaymentType.EVENT_TICKET:
                event_id = payment.metadata.get('event_id') or (payment.event.id if payment.event else None)
                event = Event.objects.select_for_update().get(pk=event_id)

                # Final capacity check
                confirmed_tickets_count = event.tickets.filter(status='Confirmed').count()
                if confirmed_tickets_count >= event.capacity:
                    payment.status = Payment.Status.FAILED
                    payment.save(update_fields=['status'])
                    raise ValueError("Event reached full capacity before checkout finished.")

                tier = payment.metadata.get('tier', 'Standard Pass')
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

                # Generate QR code PNG encoding the frontend verification URL
                try:
                    qr_file = generate_qr_image_file(verification_url, filename=f"{ticket.ticket_id}_qr.png")
                    ticket.qr_code.save(f"{ticket.ticket_id}_qr.png", qr_file, save=False)
                except Exception as qr_err:
                    logger.warning(f"Error generating QR image for ticket {ticket.ticket_id}: {qr_err}")

                # Generate Ticket PDF
                try:
                    pdf_file = generate_ticket_pdf(ticket)
                    ticket.pdf_file.save(f"{ticket.ticket_id}.pdf", pdf_file, save=False)
                except Exception as pdf_err:
                    logger.warning(f"Error generating PDF for ticket {ticket.ticket_id}: {pdf_err}")

                ticket.save()
                payment.ticket = ticket
                payment.event = event
                payment.save(update_fields=['ticket', 'event'])

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Event Ticket - {event.title} ({tier})",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.EVENT_TICKET,
                    reference_type=Transaction.ReferenceType.EVENT_TICKET,
                    reference_id=ticket.ticket_id,
                    party_name=user.full_name or 'Student Member',
                    description=f"Ticket #{ticket.ticket_id} ({ticket.seat}) via Demo Payment {payment.transaction_id}",
                    date=timezone.now().date(),
                    recorded_by=user
                )

                # Dispatch Email Notification
                try:
                    send_event_payment_success_email(
                        user=user,
                        event_name=event.title,
                        event_date=str(event.date),
                        event_time=getattr(event, 'time_display', '10:00 AM'),
                        event_venue=event.venue or event.location or 'Campus Main Auditorium',
                        ticket_id=ticket.ticket_id,
                        amount_paid=str(payment.amount),
                        payment_id=payment.transaction_id
                    )
                except Exception as email_err:
                    logger.warning(f"Ticket payment email could not be sent: {email_err}")

                ticket_data = TicketSerializer(ticket).data

            # -------------------------------------------------------------
            # ACTION 2: MERCHANDISE ORDER
            # -------------------------------------------------------------
            elif payment.payment_type == Payment.PaymentType.MERCHANDISE:
                product_id = payment.metadata.get('product_id')
                size = str(payment.metadata.get('size') or 'M').strip()
                quantity = int(payment.metadata.get('quantity', 1))

                product = MerchandiseProduct.objects.select_for_update().get(pk=product_id)

                # Stock deduction upon success
                size_map = product.size_stock or {}
                curr_stock = int(size_map.get(size, 0))
                new_stock = max(0, curr_stock - quantity)
                size_map[size] = new_stock
                product.size_stock = size_map
                product.save(update_fields=['size_stock'])

                generated_order_id = f"ORD-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
                qr_token = f"SKYLINE-MERCH:{uuid.uuid4()}"

                order = MerchandiseOrder.objects.create(
                    order_id=generated_order_id,
                    user=user,
                    merchandise=product,
                    variant=size,
                    quantity=quantity,
                    unit_price=Decimal(str(payment.metadata.get('unit_price', product.regular_price))),
                    total_amount=payment.amount,
                    payment=payment,
                    order_status=MerchandiseOrder.OrderStatus.CONFIRMED,
                    collection_status=MerchandiseOrder.CollectionStatus.READY,
                    qr_token=qr_token,
                    pickup_location='Student Union Desk - Campus Hub',
                    notes=payment.metadata.get('notes', 'Campus merchandise pickup pass')
                )

                # Generate QR code PNG
                try:
                    qr_file = generate_qr_image_file(qr_token, filename=f"{order.order_id}_qr.png")
                    order.qr_code.save(f"{order.order_id}_qr.png", qr_file, save=False)
                except Exception as qr_err:
                    logger.warning(f"Error generating QR image for merchandise order {order.order_id}: {qr_err}")

                # Generate Collection Pass PDF
                try:
                    pdf_file = generate_merchandise_pdf(order)
                    order.pdf_file.save(f"{order.order_id}.pdf", pdf_file, save=False)
                except Exception as pdf_err:
                    logger.warning(f"Error generating PDF for merchandise order {order.order_id}: {pdf_err}")

                order.save()
                payment.merchandise_order = order
                payment.save(update_fields=['merchandise_order'])

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Merchandise Order - {product.name} ({size})",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.MERCHANDISE,
                    reference_type=Transaction.ReferenceType.MERCHANDISE,
                    reference_id=order.order_id,
                    party_name=user.full_name or 'Student Customer',
                    description=f"Order #{order.order_id} ({quantity}x {size}) via Demo Payment {payment.transaction_id}",
                    date=timezone.now().date(),
                    recorded_by=user
                )

                # Dispatch Email Notification
                try:
                    send_merchandise_payment_success_email(
                        user=user,
                        order_id=order.order_id,
                        item_name=product.name,
                        amount_paid=str(payment.amount),
                        quantity=quantity,
                        variant=size,
                        image_url=product.image,
                        payment_id=payment.transaction_id,
                        collection_status='READY FOR COLLECTION'
                    )
                except Exception as email_err:
                    logger.warning(f"Merchandise payment email could not be sent: {email_err}")

                order_data = MerchandiseOrderSerializer(order).data

            # -------------------------------------------------------------
            # ACTION 3: MEMBERSHIP FEE
            # -------------------------------------------------------------
            elif payment.payment_type == Payment.PaymentType.MEMBERSHIP:
                plan = str(payment.metadata.get('plan') or 'ANNUAL').upper()
                today = timezone.now().date()
                from datetime import timedelta
                end_date = today + timedelta(days=365 if plan == 'ANNUAL' else 180)

                # Update user's membership
                user.membership_status = 'ACTIVE'
                user.membership_type = plan
                user.membership_start_date = today
                user.membership_end_date = end_date
                user.save(update_fields=['membership_status', 'membership_type', 'membership_start_date', 'membership_end_date'])

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Membership Fee - {plan} ({user.full_name})",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.MEMBERSHIP_FEE,
                    reference_type=Transaction.ReferenceType.MEMBERSHIP,
                    reference_id=payment.transaction_id,
                    party_name=user.full_name or 'Student Member',
                    description=f"Membership plan {plan} activated via Demo Payment {payment.transaction_id}",
                    date=today,
                    recorded_by=user
                )

                membership_data = {
                    'status': 'ACTIVE',
                    'membership_type': plan,
                    'start_date': str(today),
                    'end_date': str(end_date),
                    'transaction_id': payment.transaction_id
                }

            # -------------------------------------------------------------
            # ACTION 4: DONATION / FUNDRAISER
            # -------------------------------------------------------------
            else:
                fundraiser_title = payment.metadata.get('fundraiser_title') or 'Campus Fund'
                fundraiser_id = payment.metadata.get('fundraiser_id', 'general')

                # Record in Finance General Ledger
                Transaction.objects.create(
                    title=f"Fundraiser Donation - {fundraiser_title}",
                    amount=payment.amount,
                    transaction_type=Transaction.Type.INCOME,
                    category=Transaction.Category.FUNDRAISER,
                    reference_type=Transaction.ReferenceType.FUNDRAISER,
                    reference_id=payment.transaction_id,
                    party_name=user.full_name or 'Anonymous Supporter',
                    description=f"Donation to {fundraiser_title} via Demo Payment {payment.transaction_id}",
                    date=timezone.now().date(),
                    recorded_by=user
                )

                donation_data = {
                    'fundraiser_id': fundraiser_id,
                    'fundraiser_title': fundraiser_title,
                    'amount': float(payment.amount),
                    'transaction_id': payment.transaction_id,
                    'status': 'SUCCESS'
                }

            return {
                'success': True,
                'message': 'Payment successfully completed (Demo Mode).',
                'payment_id': payment.id,
                'transaction_id': payment.transaction_id,
                'payment_mode': payment.payment_mode,
                'payment_type': payment.payment_type,
                'payment_status': payment.status,
                'amount': float(payment.amount),
                'currency': payment.currency,
                'completed_at': payment.completed_at.isoformat() if payment.completed_at else None,
                'ticket': ticket_data,
                'order': order_data,
                'membership': membership_data,
                'donation': donation_data
            }

    def _build_completion_response(self, payment: Payment, is_repeat: bool = False) -> dict:
        """Helper to build idempotent response for already-completed payment."""
        ticket_data = None
        order_data = None
        if payment.ticket:
            ticket_data = TicketSerializer(payment.ticket).data
        if payment.merchandise_order:
            order_data = MerchandiseOrderSerializer(payment.merchandise_order).data

        return {
            'success': True,
            'message': 'Payment already verified previously.' if is_repeat else 'Payment completed.',
            'payment_id': payment.id,
            'transaction_id': payment.transaction_id,
            'payment_mode': payment.payment_mode,
            'payment_type': payment.payment_type,
            'payment_status': payment.status,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'completed_at': payment.completed_at.isoformat() if payment.completed_at else None,
            'ticket': ticket_data,
            'order': order_data
        }

    def get_user_transactions(self, user: User) -> list:
        """
        Returns list of all payment transactions for the specified user.
        """
        payments = (
            Payment.objects
            .filter(user=user)
            .select_related('event', 'ticket', 'merchandise_order')
            .order_by('-created_at')
        )

        results = []
        for p in payments:
            # Determine appropriate item title and download links
            item_title = p.metadata.get('event_title') or p.metadata.get('product_name') or p.metadata.get('fundraiser_title') or p.payment_type
            reference_code = ''
            pdf_url = None
            qr_url = None

            if p.ticket:
                item_title = p.ticket.event.title
                reference_code = f"Ticket #{p.ticket.ticket_id}"
                if p.ticket.pdf_file:
                    pdf_url = p.ticket.pdf_file.url
                if p.ticket.qr_code:
                    qr_url = p.ticket.qr_code.url
            elif p.merchandise_order:
                item_title = p.merchandise_order.merchandise.name
                reference_code = f"Order #{p.merchandise_order.order_id}"
                if p.merchandise_order.pdf_file:
                    pdf_url = p.merchandise_order.pdf_file.url
                if p.merchandise_order.qr_code:
                    qr_url = p.merchandise_order.qr_code.url
            elif p.payment_type == Payment.PaymentType.MEMBERSHIP:
                item_title = f"Membership Plan ({p.metadata.get('plan', 'Annual')})"
                reference_code = p.transaction_id

            results.append({
                'id': p.id,
                'transaction_id': p.transaction_id,
                'date': p.created_at.strftime('%d %b %Y • %I:%M %p') if p.created_at else '',
                'date_short': p.created_at.strftime('%d %b %Y') if p.created_at else '',
                'payment_type': p.payment_type,
                'payment_mode': p.payment_mode,
                'status': p.status,
                'amount': float(p.amount),
                'currency': p.currency,
                'item_title': item_title,
                'reference_code': reference_code,
                'pdf_url': pdf_url,
                'qr_url': qr_url,
                'metadata': p.metadata,
                'completed_at': p.completed_at.isoformat() if p.completed_at else None
            })

        return results


def get_payment_service() -> BasePaymentService:
    """
    Factory function returning the active Payment Service.
    Currently returns DemoPaymentService.
    In future, if settings.PAYMENT_GATEWAY == 'RAZORPAY', return RazorpayPaymentService() seamlessly.
    """
    return DemoPaymentService()
