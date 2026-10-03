from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        # Create Admin
        self.admin = User.objects.create_superuser(
            email='admin_test@studentorg.edu',
            password='AdminPassword123!',
            full_name='Test Admin',
            role=User.Role.ADMIN
        )

        # Create Treasurer
        self.treasurer = User.objects.create_user(
            email='treasurer_test@studentorg.edu',
            password='TreasurerPassword123!',
            full_name='Test Treasurer',
            role=User.Role.TREASURER
        )

        # Create Member
        self.member = User.objects.create_user(
            email='member_test@studentorg.edu',
            password='MemberPassword123!',
            full_name='Test Member',
            student_id='STU-TEST-001',
            role=User.Role.MEMBER
        )

    def test_member_registration_success(self):
        url = reverse('auth-register')
        data = {
            'full_name': 'New Student',
            'student_id': 'STU-TEST-002',
            'email': 'new_student@studentorg.edu',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'MEMBER')
        self.assertEqual(response.data['user']['email'], 'new_student@studentorg.edu')

    def test_member_registration_duplicate_email(self):
        url = reverse('auth-register')
        data = {
            'full_name': 'Duplicate Email',
            'student_id': 'STU-TEST-999',
            'email': 'member_test@studentorg.edu',  # Already exists
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_registration_duplicate_student_id(self):
        url = reverse('auth-register')
        data = {
            'full_name': 'Duplicate ID',
            'student_id': 'STU-TEST-001',  # Already exists
            'email': 'unique_email@studentorg.edu',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_login_success(self):
        url = reverse('auth-login')
        data = {
            'email': 'member_test@studentorg.edu',
            'password': 'MemberPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'MEMBER')
        self.assertEqual(response.data['user']['email'], 'member_test@studentorg.edu')

    def test_admin_login_success(self):
        url = reverse('auth-login')
        data = {
            'email': 'admin_test@studentorg.edu',
            'password': 'AdminPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'ADMIN')

    def test_treasurer_login_success(self):
        url = reverse('auth-login')
        data = {
            'email': 'treasurer_test@studentorg.edu',
            'password': 'TreasurerPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'TREASURER')

    def test_login_invalid_password(self):
        url = reverse('auth-login')
        data = {
            'email': 'member_test@studentorg.edu',
            'password': 'WrongPassword!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_and_token_blacklist(self):
        refresh = RefreshToken.for_user(self.member)
        url = reverse('auth-logout')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        response = self.client.post(url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Trying to refresh using blacklisted token must fail
        refresh_url = reverse('token-refresh')
        ref_response = self.client.post(refresh_url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(ref_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        refresh = RefreshToken.for_user(self.member)
        url = reverse('auth-change-password')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'old_password': 'MemberPassword123!',
            'new_password': 'NewMemberPassword456!',
            'confirm_new_password': 'NewMemberPassword456!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify login with new password
        login_url = reverse('auth-login')
        login_resp = self.client.post(login_url, {
            'email': 'member_test@studentorg.edu',
            'password': 'NewMemberPassword456!'
        }, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_admin_create_treasurer(self):
        refresh = RefreshToken.for_user(self.admin)
        url = reverse('admin-create-treasurer')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'full_name': 'New Finance Head',
            'email': 'finance_new@studentorg.edu',
            'password': 'FinancePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['role'], 'TREASURER')

    def test_member_cannot_create_treasurer(self):
        refresh = RefreshToken.for_user(self.member)
        url = reverse('admin-create-treasurer')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'full_name': 'Malicious Treasurer',
            'email': 'bad_treasurer@studentorg.edu',
            'password': 'FinancePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
