import hmac
import hashlib
from decimal import Decimal
from django.conf import settings
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from volunteers.models import Event, Ticket
from finance.models import Payment, MerchandiseProduct, MerchandiseOrder
from finance.razorpay_service import verify_razorpay_payment_signature, RAZORPAY_KEY_SECRET

User = get_user_model()


class PaymentAndTicketSystemTests(APITestCase):
    def setUp(self):
        # 1. Users
        self.admin = User.objects.create_superuser(
            email='admin_pay@studentorg.edu',
            password='AdminPassword123!',
            full_name='Gate Admin',
            role=User.Role.ADMIN
        )
        self.student = User.objects.create_user(
            email='student_pay@studentorg.edu',
            password='StudentPassword123!',
            full_name='Rahul Varma',
            student_id='STU-PAY-99',
            role=User.Role.MEMBER
        )

        # 2. Events
        self.event_a = Event.objects.create(
            title='Annual Hackathon 2026',
            date=timezone.now().date() + timezone.timedelta(days=7),
            start_time='10:00:00',
            end_time='18:00:00',
            venue='Skyline Auditorium Hall A',
            ticket_price=Decimal('199.00'),
            member_ticket_price=Decimal('99.00'),
            non_member_ticket_price=Decimal('199.00'),
            capacity=100,
            status=Event.Status.PUBLISHED,
            is_active=True
        )
        self.event_b = Event.objects.create(
            title='Robotics Exhibition 2026',
            date=timezone.now().date() + timezone.timedelta(days=14),
            start_time='11:00:00',
            end_time='16:00:00',
            venue='Robotics Lab Hall C',
            ticket_price=Decimal('150.00'),
            member_ticket_price=Decimal('75.00'),
            non_member_ticket_price=Decimal('150.00'),
            capacity=50,
            status=Event.Status.PUBLISHED,
            is_active=True
        )

        # 3. Merchandise
        self.merch = MerchandiseProduct.objects.create(
            id='mch-test-1',
            name='Skyline Varsity Jacket',
            type='Outerwear',
            category='Apparel',
            regular_price=Decimal('1200.00'),
            member_price=Decimal('999.00'),
            size_stock={'S': 10, 'M': 15, 'L': 5, 'XL': 0},
            is_active=True
        )

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def _generate_valid_signature(self, order_id, payment_id):
        secret = RAZORPAY_KEY_SECRET or 'skyline_razorpay_secret_key_9942'
        body = f"{order_id}|{payment_id}".encode('utf-8')
        return hmac.new(secret.encode('utf-8'), body, hashlib.sha256).hexdigest()

    def test_01_event_payment_order_creation_calculates_backend_price(self):
        """Backend must calculate actual payable price from database."""
        self._auth(self.student)
        url = reverse('event-create-payment', kwargs={'event_id': self.event_a.id})
        res = self.client.post(url, {'quantity': 1}, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('razorpay_order_id', res.data)
        # Non-member student pays regular price 199.00 = 19900 paise
        self.assertEqual(res.data['amount'], 19900)
        self.assertEqual(res.data['amount_in_rupees'], 199.00)

        # Verify Payment record in database
        payment = Payment.objects.get(razorpay_order_id=res.data['razorpay_order_id'])
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertEqual(payment.amount, Decimal('199.00'))

    def test_02_payment_verification_and_ticket_generation(self):
        """Verifying valid Razorpay signature creates confirmed ticket, QR code, and PDF."""
        self._auth(self.student)
        # 1. Create order
        create_res = self.client.post(
            reverse('event-create-payment', kwargs={'event_id': self.event_a.id}),
            {'quantity': 1},
            format='json'
        )
        rzp_order_id = create_res.data['razorpay_order_id']
        rzp_payment_id = 'pay_test_event_123456'
        signature = self._generate_valid_signature(rzp_order_id, rzp_payment_id)

        # 2. Verify payment
        verify_url = reverse('razorpay-verify')
        verify_res = self.client.post(verify_url, {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': rzp_payment_id,
            'razorpay_signature': signature
        }, format='json')

        self.assertEqual(verify_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(verify_res.data['success'])
        ticket_data = verify_res.data['ticket']
        self.assertTrue(ticket_data['ticket_id'].startswith('TCK-'))

        # Verify Ticket in database
        ticket = Ticket.objects.get(ticket_id=ticket_data['ticket_id'])
        self.assertEqual(ticket.ticket_status, Ticket.Status.CONFIRMED)
        self.assertTrue(ticket.qr_token.startswith('SKYLINE-TICKET:'))
        self.assertTrue(ticket.qr_code)
        self.assertTrue(ticket.pdf_file)

        # 3. Test PDF download endpoint
        pdf_url = reverse('ticket-pdf', kwargs={'ticket_id': ticket.ticket_id})
        pdf_res = self.client.get(pdf_url)
        self.assertEqual(pdf_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_res['Content-Type'], 'application/pdf')

    def test_03_payment_idempotency_prevents_duplicate_tickets(self):
        """Repeated verification of already paid order must be idempotent and not create duplicate tickets."""
        self._auth(self.student)
        create_res = self.client.post(
            reverse('event-create-payment', kwargs={'event_id': self.event_a.id}),
            {'quantity': 1},
            format='json'
        )
        rzp_order_id = create_res.data['razorpay_order_id']
        rzp_payment_id = 'pay_test_idem_123456'
        signature = self._generate_valid_signature(rzp_order_id, rzp_payment_id)

        verify_url = reverse('razorpay-verify')
        payload = {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': rzp_payment_id,
            'razorpay_signature': signature
        }
        res1 = self.client.post(verify_url, payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Call again
        res2 = self.client.post(verify_url, payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertIn('already verified', res2.data['message'])

        # Confirm exactly 1 ticket in database for this payment
        payment = Payment.objects.get(razorpay_order_id=rzp_order_id)
        self.assertEqual(Ticket.objects.filter(payment=payment).count(), 1)

    def test_04_tampered_signature_is_rejected(self):
        """Invalid Razorpay signature must be rejected and payment not marked as success."""
        self._auth(self.student)
        create_res = self.client.post(
            reverse('event-create-payment', kwargs={'event_id': self.event_a.id}),
            {'quantity': 1},
            format='json'
        )
        rzp_order_id = create_res.data['razorpay_order_id']

        verify_url = reverse('razorpay-verify')
        res = self.client.post(verify_url, {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': 'pay_fake_999',
            'razorpay_signature': 'tampered_invalid_signature_hex'
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        payment = Payment.objects.get(razorpay_order_id=rzp_order_id)
        self.assertEqual(payment.status, Payment.Status.FAILED)
        self.assertFalse(Ticket.objects.filter(payment=payment).exists())

    def test_05_gate_qr_scanner_validation_and_event_isolation(self):
        """Scanner must verify ticket, prevent cross-event entry, and prevent duplicate check-ins."""
        self._auth(self.student)
        # Create confirmed ticket for Event A
        create_res = self.client.post(
            reverse('event-create-payment', kwargs={'event_id': self.event_a.id}),
            {'quantity': 1},
            format='json'
        )
        rzp_order_id = create_res.data['razorpay_order_id']
        rzp_payment_id = 'pay_gate_scan_123'
        sig = self._generate_valid_signature(rzp_order_id, rzp_payment_id)

        verify_res = self.client.post(reverse('razorpay-verify'), {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': rzp_payment_id,
            'razorpay_signature': sig
        }, format='json')
        ticket = Ticket.objects.get(ticket_id=verify_res.data['ticket']['ticket_id'])

        # Now authenticate as Admin Gate Scanner
        self._auth(self.admin)
        qr_verify_url = reverse('ticket-verify-qr')

        # 1. Invalid QR token
        bad_qr = self.client.post(qr_verify_url, {'qr_token': 'SKYLINE-TICKET:fake-token'}, format='json')
        self.assertEqual(bad_qr.status_code, status.HTTP_200_OK)
        self.assertFalse(bad_qr.data['is_valid'])
        self.assertEqual(bad_qr.data['verification_status'], 'INVALID_TICKET')

        # 2. Cross-event rejection (Scanning Event A ticket at Event B gate)
        wrong_event_res = self.client.post(qr_verify_url, {
            'qr_token': ticket.qr_token,
            'event_id': self.event_b.id
        }, format='json')
        self.assertEqual(wrong_event_res.status_code, status.HTTP_200_OK)
        self.assertFalse(wrong_event_res.data['is_valid'])
        self.assertEqual(wrong_event_res.data['verification_status'], 'WRONG_EVENT')

        # 3. Valid ticket verification at Event A gate
        valid_res = self.client.post(qr_verify_url, {
            'qr_token': ticket.qr_token,
            'event_id': self.event_a.id
        }, format='json')
        self.assertEqual(valid_res.status_code, status.HTTP_200_OK)
        self.assertTrue(valid_res.data['is_valid'])
        self.assertEqual(valid_res.data['status'], 'VALID')

        # 4. Check In
        checkin_url = reverse('ticket-check-in', kwargs={'ticket_id': ticket.ticket_id})
        checkin_res = self.client.post(checkin_url, {}, format='json')
        self.assertEqual(checkin_res.status_code, status.HTTP_200_OK)
        self.assertTrue(checkin_res.data['success'])

        # 5. Duplicate Check In Rejection
        dup_checkin = self.client.post(checkin_url, {}, format='json')
        self.assertEqual(dup_checkin.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already checked in', dup_checkin.data['error'])

        # 6. Scanning again returns ALREADY_CHECKED_IN
        scan_again = self.client.post(qr_verify_url, {
            'qr_token': ticket.qr_token,
            'event_id': self.event_a.id
        }, format='json')
        self.assertEqual(scan_again.data['verification_status'], 'ALREADY_CHECKED_IN')
        self.assertFalse(scan_again.data['is_valid'])

    def test_06_merchandise_payment_and_collection_flow(self):
        """Merchandise order creation, payment verification, inventory deduction, and collection scanner."""
        self._auth(self.student)
        # 1. Create merchandise payment order for Size L (qty: 2)
        create_url = reverse('merchandise-create-payment')
        res = self.client.post(create_url, {
            'product_id': self.merch.id,
            'size': 'L',
            'quantity': 2
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # Non-member pays regular 1200 * 2 = 2400
        self.assertEqual(res.data['amount_in_rupees'], 2400.00)
        rzp_order_id = res.data['razorpay_order_id']
        order_id = res.data['order_id']

        # 2. Verify payment
        sig = self._generate_valid_signature(rzp_order_id, 'pay_merch_test_999')
        verify_res = self.client.post(reverse('razorpay-verify'), {
            'razorpay_order_id': rzp_order_id,
            'razorpay_payment_id': 'pay_merch_test_999',
            'razorpay_signature': sig
        }, format='json')
        self.assertEqual(verify_res.status_code, status.HTTP_201_CREATED)

        # 3. Check inventory deduction: Size L stock went from 5 to 3
        self.merch.refresh_from_db()
        self.assertEqual(self.merch.size_stock['L'], 3)

        # 4. Check Order record and collection pass PDF
        order = MerchandiseOrder.objects.get(order_id=order_id)
        self.assertEqual(order.collection_status, MerchandiseOrder.CollectionStatus.READY)
        self.assertTrue(order.qr_token.startswith('SKYLINE-MERCH:'))
        self.assertTrue(order.pdf_file)

        pdf_url = reverse('merchandise-order-pdf', kwargs={'order_id': order.order_id})
        pdf_res = self.client.get(pdf_url)
        self.assertEqual(pdf_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_res['Content-Type'], 'application/pdf')

        # 5. Organizer Collection Scanner
        self._auth(self.admin)
        qr_res = self.client.post(reverse('merchandise-verify-qr'), {
            'qr_token': order.qr_token
        }, format='json')
        self.assertEqual(qr_res.status_code, status.HTTP_200_OK)
        self.assertTrue(qr_res.data['is_valid'])
        self.assertEqual(qr_res.data['collection_status'], 'READY_FOR_COLLECTION')

        # 6. Mark as Collected
        collect_res = self.client.post(reverse('merchandise-order-collect', kwargs={'order_id': order.order_id}), {}, format='json')
        self.assertEqual(collect_res.status_code, status.HTTP_200_OK)
        self.assertEqual(collect_res.data['collection_status'], 'COLLECTED')

        # 7. Duplicate collection rejection
        dup_collect = self.client.post(reverse('merchandise-order-collect', kwargs={'order_id': order.order_id}), {}, format='json')
        self.assertEqual(dup_collect.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already been marked as collected', dup_collect.data['error'])
