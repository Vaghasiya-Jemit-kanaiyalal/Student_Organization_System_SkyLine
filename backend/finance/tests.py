from django.urls import reverse
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Transaction, ReimbursementRequest

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
            email='treasurer_fin@studentorg.edu',
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

    def test_treasurer_can_view_finance_dashboard(self):
        refresh = RefreshToken.for_user(self.treasurer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('finance-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_income', response.data['data'])
        self.assertIn('net_balance', response.data['data'])

    def test_member_cannot_view_finance_dashboard(self):
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('finance-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_treasurer_can_create_transaction(self):
        refresh = RefreshToken.for_user(self.treasurer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

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

    def test_member_can_submit_reimbursement(self):
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('finance-reimbursements')
        data = {
            'title': 'Flyers Printing',
            'amount': 45.00,
            'description': 'Printed 100 event promotional flyers.',
            'receipt_reference': 'RCPT-001'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')

    def test_treasurer_can_approve_reimbursement(self):
        claim = ReimbursementRequest.objects.create(
            requested_by=self.member,
            title='Balloons and Decor',
            amount=50.00,
            description='Party decor',
            status=ReimbursementRequest.Status.PENDING
        )

        refresh = RefreshToken.for_user(self.treasurer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('finance-reimbursement-approve', kwargs={'pk': claim.id})
        response = self.client.post(url, {'treasurer_notes': 'Verified receipt.'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        claim.refresh_from_db()
        self.assertEqual(claim.status, ReimbursementRequest.Status.APPROVED)
        self.assertEqual(claim.reviewed_by, self.treasurer)

        # Check that automatic transaction was created
        self.assertTrue(Transaction.objects.filter(category=Transaction.Category.REIMBURSEMENT).exists())
