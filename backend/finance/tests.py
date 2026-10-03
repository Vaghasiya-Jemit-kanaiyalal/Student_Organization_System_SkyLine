from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Transaction, ReimbursementRequest
from .services import record_income_payment

User = get_user_model()


class FinanceFlowTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin_fin@studentorg.edu',
            password='AdminPassword123!',
            full_name='Finance Admin',
            role=User.Role.ADMIN
        )
        self.treasurer = User.objects.create_user(
            email='treasurer_fin@treasurer.gmail.com',
            password='TreasurerPassword123!',
            full_name='Head Treasurer',
            role=User.Role.TREASURER
        )
        self.member = User.objects.create_user(
            email='member_fin@studentorg.edu',
            password='MemberPassword123!',
            full_name='Org Member',
            student_id='STU-FIN-01',
            role=User.Role.MEMBER
        )

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_treasurer_can_view_finance_dashboard(self):
        self._auth(self.treasurer)
        url = reverse('finance-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertIn('total_income', data)
        self.assertIn('net_balance', data)
        self.assertIn('revenue_breakdown', data)
        self.assertIn('monthly_trend', data)

    def test_member_cannot_view_finance_dashboard(self):
        self._auth(self.member)
        url = reverse('finance-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_member_cannot_view_reports(self):
        self._auth(self.member)
        response = self.client.get(reverse('finance-reports'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_treasurer_can_create_transaction(self):
        self._auth(self.treasurer)
        url = reverse('finance-transactions')
        data = {
            'title': 'Sponsorship Tech Co',
            'amount': 3000.00,
            'transaction_type': 'INCOME',
            'category': 'SPONSORSHIP',
            'description': 'Direct bank deposit from sponsor',
            'date': str(timezone.now().date())
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)
        self.assertTrue(Transaction.objects.first().transaction_id)

    def test_negative_amount_rejected(self):
        self._auth(self.treasurer)
        response = self.client.post(reverse('finance-transactions'), {
            'title': 'Bad',
            'amount': -10,
            'transaction_type': 'INCOME',
            'category': 'OTHER',
            'date': str(timezone.now().date()),
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_can_submit_reimbursement(self):
        self._auth(self.member)
        url = reverse('finance-reimbursements')
        data = {
            'title': 'Flyers Printing',
            'amount': 45.00,
            'description': 'Printed 100 event promotional flyers.',
            'receipt_reference': 'RCPT-001',
            'related_activity': 'Welcome Week',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')

    def test_reimbursement_approve_then_mark_paid_creates_single_expense(self):
        claim = ReimbursementRequest.objects.create(
            requested_by=self.member,
            title='Balloons and Decor',
            amount=50.00,
            description='Party decor',
            status=ReimbursementRequest.Status.PENDING
        )

        self._auth(self.treasurer)

        approve_url = reverse('finance-reimbursement-approve', kwargs={'pk': claim.id})
        response = self.client.post(approve_url, {'treasurer_notes': 'Verified receipt.'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, ReimbursementRequest.Status.APPROVED)
        self.assertEqual(Transaction.objects.filter(category=Transaction.Category.REIMBURSEMENT).count(), 0)

        paid_url = reverse('finance-reimbursement-mark-paid', kwargs={'pk': claim.id})
        response = self.client.post(paid_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, ReimbursementRequest.Status.PAID)
        self.assertEqual(Transaction.objects.filter(category=Transaction.Category.REIMBURSEMENT).count(), 1)

        # Idempotent second mark-paid
        response = self.client.post(paid_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Transaction.objects.filter(category=Transaction.Category.REIMBURSEMENT).count(), 1)

    def test_cannot_pay_rejected_reimbursement(self):
        claim = ReimbursementRequest.objects.create(
            requested_by=self.member,
            title='Rejected Claim',
            amount=20.00,
            description='Nope',
            status=ReimbursementRequest.Status.REJECTED,
        )
        self._auth(self.treasurer)
        response = self.client.post(
            reverse('finance-reimbursement-mark-paid', kwargs={'pk': claim.id}),
            {},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_approve_already_rejected(self):
        claim = ReimbursementRequest.objects.create(
            requested_by=self.member,
            title='Already Rejected',
            amount=20.00,
            description='Nope',
            status=ReimbursementRequest.Status.REJECTED,
        )
        self._auth(self.treasurer)
        response = self.client.post(
            reverse('finance-reimbursement-approve', kwargs={'pk': claim.id}),
            {},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_payment_record_is_idempotent(self):
        self._auth(self.member)
        url = reverse('finance-record-payment')
        payload = {
            'title': 'Annual Membership',
            'amount': 500,
            'reference_type': 'MEMBERSHIP',
            'reference_id': 'mem-skyline-001',
            'description': 'Club dues',
            'party_name': self.member.full_name,
        }
        first = self.client.post(url, payload, format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertTrue(first.data['created'])

        second = self.client.post(url, payload, format='json')
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertFalse(second.data['created'])
        self.assertEqual(Transaction.objects.filter(reference_id='mem-skyline-001').count(), 1)

    def test_dashboard_balance_from_real_transactions(self):
        record_income_payment(
            title='Membership',
            amount=500,
            reference_type=Transaction.ReferenceType.MEMBERSHIP,
            reference_id='bal-mem-1',
            recorded_by=self.member,
        )
        record_income_payment(
            title='Ticket',
            amount=200,
            reference_type=Transaction.ReferenceType.EVENT_TICKET,
            reference_id='bal-tix-1',
            recorded_by=self.member,
        )
        Transaction.objects.create(
            title='Venue',
            amount=150,
            transaction_type=Transaction.Type.EXPENSE,
            category=Transaction.Category.EVENT_EXPENSE,
            date=timezone.now().date(),
            recorded_by=self.treasurer,
            status=Transaction.Status.PAID,
        )

        self._auth(self.treasurer)
        response = self.client.get(reverse('finance-dashboard'))
        data = response.data['data']
        self.assertEqual(data['total_income'], 700.0)
        self.assertEqual(data['total_expenses'], 150.0)
        self.assertEqual(data['current_balance'], 550.0)
        self.assertEqual(data['revenue_breakdown']['membership'], 500.0)
        self.assertEqual(data['revenue_breakdown']['events'], 200.0)

    def test_refund_keeps_history_and_excludes_from_income(self):
        txn, _ = record_income_payment(
            title='Merch Hoodie',
            amount=800,
            reference_type=Transaction.ReferenceType.MERCHANDISE,
            reference_id='ord-refund-1',
            recorded_by=self.member,
        )
        self._auth(self.treasurer)
        response = self.client.post(
            reverse('finance-transaction-refund', kwargs={'pk': txn.id}),
            {'notes': 'Customer returned item'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        txn.refresh_from_db()
        self.assertEqual(txn.status, Transaction.Status.REFUNDED)
        self.assertTrue(Transaction.objects.filter(pk=txn.pk).exists())

        dash = self.client.get(reverse('finance-dashboard')).data['data']
        self.assertEqual(dash['total_income'], 0.0)

    def test_reports_semester_summary(self):
        record_income_payment(
            title='Fall Dues',
            amount=1000,
            reference_type=Transaction.ReferenceType.MEMBERSHIP,
            reference_id='fall-dues-1',
            date=timezone.now().date().replace(month=9, day=15) if timezone.now().month >= 8 else timezone.now().date(),
            recorded_by=self.member,
        )
        self._auth(self.treasurer)
        year = timezone.now().year
        response = self.client.get(reverse('finance-reports'), {'semester': 'fall', 'year': year})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('semester_summary', response.data['data'])
        self.assertIn('income_summary', response.data['data'])

    def test_treasurer_denied_event_create(self):
        """Treasurer must not manage events (admin-only write)."""
        self._auth(self.treasurer)
        # Event create endpoint uses IsAdminOrReadOnly — POST should be forbidden
        response = self.client.post('/api/events/', {
            'title': 'Unauthorized Event',
            'description': 'Should fail',
            'event_type': 'WORKSHOP',
            'date': str(timezone.now().date()),
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'location': 'Hall',
            'max_participants': 10,
            'ticket_price': 0,
        }, format='json')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_405_METHOD_NOT_ALLOWED])
