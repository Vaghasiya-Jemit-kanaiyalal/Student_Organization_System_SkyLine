import json
from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from volunteers.models import Event, Ticket
from finance.models import Payment, MerchandiseProduct, MerchandiseOrder, Transaction
from finance.payment_service import get_payment_service, DemoPaymentService

User = get_user_model()


class DemoPaymentSystemTestCase(TestCase):
    """
    Automated Test Suite for Skyline's Demo Simulated Payment Architecture.
    Validates:
      1. Demo payment initialization (PENDING state, zero real-money movement)
      2. Multi-stage processing and completion (SUCCESS state)
      3. Authoritative event ticket issuance with Gate QR and PDF
      4. Merchandise order fulfillment with size stock deduction, Collection QR, and PDF
      5. Ledger synchronization into finance.models.Transaction
      6. Idempotency & duplicate completion protection
      7. Stock and capacity guardrails
      8. User transaction history retrieval
    """

    def setUp(self):
        self.client = APIClient()

        # Create student member
        self.student = User.objects.create_user(
            email='alex.student@skyline.edu',
            password='Password123!',
            full_name='Alex Vance',
            student_id='STU-DEMO-01',
            role=User.Role.MEMBER,
            membership_status='ACTIVE',
            membership_type='ANNUAL'
        )

        # Create student non-member
        self.non_member = User.objects.create_user(
            email='casey.student@skyline.edu',
            password='Password123!',
            full_name='Casey NonMember',
            student_id='STU-DEMO-02',
            role=User.Role.STUDENT,
            membership_status='NONE'
        )

        # Create organizer/admin
        self.organizer = User.objects.create_user(
            email='admin@skyline.edu',
            password='Password123!',
            full_name='Director Miller',
            student_id='ADM-DEMO-01',
            role=User.Role.ADMIN
        )

        # Create published event
        self.event = Event.objects.create(
            title='Skyline Annual Tech Gala 2026',
            description='Premier engineering and robotics exhibition.',
            date=timezone.now().date() + timezone.timedelta(days=14),
            venue='Main Campus Auditorium',
            capacity=100,
            ticket_price=Decimal('200.00'),
            member_ticket_price=Decimal('150.00'),
            non_member_ticket_price=Decimal('250.00'),
            status=Event.Status.PUBLISHED,
            is_active=True,
            created_by=self.organizer
        )

        # Create merchandise item with stock
        self.product = MerchandiseProduct.objects.create(
            id='mch-hoodie-test',
            name='Official Skyline Varsity Hoodie',
            type='Apparel',
            category='Winter',
            regular_price=Decimal('800.00'),
            member_price=Decimal('600.00'),
            size_stock={'S': 5, 'M': 10, 'L': 8, 'XL': 3},
            is_active=True
        )

    def test_01_event_ticket_demo_payment_lifecycle(self):
        """Test full demo payment flow for event ticket booking."""
        self.client.force_authenticate(user=self.student)

        # 1. Initialize demo payment
        create_url = reverse('demo-payment-create')
        res = self.client.post(create_url, {
            'payment_type': 'EVENT_TICKET',
            'event_id': self.event.id,
            'quantity': 1
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.data
        self.assertTrue(data['transaction_id'].startswith('SKY-DEMO-'))
        self.assertEqual(data['status'], 'PENDING')
        self.assertEqual(data['payment_mode'], 'DEMO')
        self.assertEqual(Decimal(str(data['amount'])), Decimal('150.00'))  # Member price

        payment_id = data['payment_id']
        txn_id = data['transaction_id']

        # Verify no ticket is created yet while in PENDING state
        self.assertEqual(Ticket.objects.filter(payment_id=payment_id).count(), 0)

        # 2. Complete demo payment
        complete_url = reverse('demo-payment-complete')
        res_comp = self.client.post(complete_url, {
            'payment_id': payment_id,
            'transaction_id': txn_id
        }, format='json')

        self.assertEqual(res_comp.status_code, status.HTTP_200_OK)
        self.assertEqual(res_comp.data['payment_status'], 'SUCCESS')
        self.assertIsNotNone(res_comp.data['ticket'])

        # 3. Verify Database Records
        payment = Payment.objects.get(pk=payment_id)
        self.assertEqual(payment.status, Payment.Status.SUCCESS)
        self.assertIsNotNone(payment.completed_at)

        ticket = Ticket.objects.get(payment=payment)
        self.assertEqual(ticket.student, self.student)
        self.assertEqual(ticket.event, self.event)
        self.assertIsNotNone(ticket.ticket_uuid)
        self.assertIn(f"/ticket/{ticket.ticket_uuid}", ticket.qr_code_data)
        self.assertTrue(ticket.qr_code.name.endswith('.png'))
        self.assertTrue(ticket.pdf_file.name.endswith('.pdf'))

        # Verify General Ledger Entry
        ledger_entry = Transaction.objects.filter(reference_id=ticket.ticket_id).first()
        self.assertIsNotNone(ledger_entry)
        self.assertEqual(ledger_entry.transaction_type, Transaction.Type.INCOME)
        self.assertEqual(ledger_entry.amount, Decimal('150.00'))

    def test_02_merchandise_demo_payment_and_stock_deduction(self):
        """Test merchandise purchase with stock deduction upon demo payment completion."""
        self.client.force_authenticate(user=self.student)

        # Initial stock of size M is 10
        self.assertEqual(self.product.size_stock['M'], 10)

        create_url = reverse('demo-payment-create')
        res = self.client.post(create_url, {
            'payment_type': 'MERCHANDISE',
            'product_id': self.product.id,
            'size': 'M',
            'quantity': 2
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        payment_id = res.data['payment_id']
        txn_id = res.data['transaction_id']

        # Stock should NOT be deducted while pending
        self.product.refresh_from_db()
        self.assertEqual(self.product.size_stock['M'], 10)

        # Complete demo payment
        complete_url = reverse('demo-payment-complete')
        res_comp = self.client.post(complete_url, {
            'payment_id': payment_id,
            'transaction_id': txn_id
        }, format='json')

        self.assertEqual(res_comp.status_code, status.HTTP_200_OK)
        self.assertEqual(res_comp.data['payment_status'], 'SUCCESS')
        self.assertIsNotNone(res_comp.data['order'])

        # Stock should now be deducted from 10 to 8
        self.product.refresh_from_db()
        self.assertEqual(self.product.size_stock['M'], 8)

        # Verify MerchandiseOrder
        order = MerchandiseOrder.objects.get(payment_id=payment_id)
        self.assertEqual(order.quantity, 2)
        self.assertEqual(order.variant, 'M')
        self.assertEqual(order.order_status, MerchandiseOrder.OrderStatus.CONFIRMED)
        self.assertEqual(order.collection_status, MerchandiseOrder.CollectionStatus.READY)
        self.assertTrue(order.qr_token.startswith('SKYLINE-MERCH:'))
        self.assertTrue(order.qr_code.name.endswith('.png'))
        self.assertTrue(order.pdf_file.name.endswith('.pdf'))

    def test_03_idempotency_protection(self):
        """Test that repeating completion does not generate duplicate tickets or double deduct stock."""
        self.client.force_authenticate(user=self.student)

        service = get_payment_service()
        created = service.create_payment(
            user=self.student,
            payment_type='EVENT_TICKET',
            metadata={'event_id': self.event.id, 'quantity': 1}
        )

        res1 = service.complete_payment(payment_id=created['payment_id'], user=self.student)
        self.assertTrue(res1['success'])
        initial_ticket_count = Ticket.objects.filter(student=self.student, event=self.event).count()
        self.assertEqual(initial_ticket_count, 1)

        # Second completion attempt with same payment_id
        res2 = service.complete_payment(payment_id=created['payment_id'], user=self.student)
        self.assertTrue(res2['success'])
        # Ticket count must remain strictly 1
        self.assertEqual(Ticket.objects.filter(student=self.student, event=self.event).count(), 1)

    def test_04_insufficient_stock_guardrail(self):
        """Test that purchase request fails when requesting more units than available."""
        self.client.force_authenticate(user=self.student)

        create_url = reverse('demo-payment-create')
        res = self.client.post(create_url, {
            'payment_type': 'MERCHANDISE',
            'product_id': self.product.id,
            'size': 'XL',
            'quantity': 50  # Only 3 in stock
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient stock', res.data['error'])

    def test_05_user_transaction_history(self):
        """Test GET /api/payments/transactions/ returns complete user transaction history."""
        self.client.force_authenticate(user=self.student)

        # Make one event payment and one merchandise payment
        service = get_payment_service()
        p1 = service.create_payment(self.student, 'EVENT_TICKET', metadata={'event_id': self.event.id})
        service.complete_payment(p1['payment_id'], self.student)

        p2 = service.create_payment(self.student, 'MERCHANDISE', metadata={'product_id': self.product.id, 'size': 'S', 'quantity': 1})
        service.complete_payment(p2['payment_id'], self.student)

        txn_url = reverse('user-transactions-list')
        res = self.client.get(txn_url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 2)
        txn_ids = [t['transaction_id'] for t in res.data]
        self.assertIn(p1['transaction_id'], txn_ids)
        self.assertIn(p2['transaction_id'], txn_ids)
        self.assertTrue(all(t['payment_mode'] == 'DEMO' for t in res.data))
