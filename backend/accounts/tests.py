from datetime import timedelta

from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Club, ClubMembership

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
            email='treasurer_test@treasurer.gmail.com',
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
        self.assertEqual(response.data['role'], 'STUDENT')
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
            'email': 'treasurer_test@treasurer.gmail.com',
            'password': 'TreasurerPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'TREASURER')

    def test_treasurer_login_invalid_email_domain_fails(self):
        # Create a treasurer with an invalid email domain directly in DB
        invalid_treasurer = User.objects.create_user(
            email='illegal_treasurer@gmail.com',
            password='TreasurerPassword123!',
            full_name='Illegal Treasurer',
            role=User.Role.TREASURER
        )
        url = reverse('auth-login')
        data = {
            'email': 'illegal_treasurer@gmail.com',
            'password': 'TreasurerPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

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
            'email': 'finance_new@treasurer.gmail.com',
            'password': 'FinancePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['role'], 'TREASURER')

    def test_admin_create_treasurer_invalid_domain_fails(self):
        refresh = RefreshToken.for_user(self.admin)
        url = reverse('admin-create-treasurer')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'full_name': 'Invalid Domain Treasurer',
            'email': 'finance_new@gmail.com',  # Does not end with @treasurer.gmail.com
            'password': 'FinancePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_cannot_create_treasurer(self):
        refresh = RefreshToken.for_user(self.member)
        url = reverse('admin-create-treasurer')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        data = {
            'full_name': 'Malicious Treasurer',
            'email': 'bad_treasurer@treasurer.gmail.com',
            'password': 'FinancePassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class MembershipTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            email='membership_student@studentorg.edu',
            password='MemberPassword123!',
            full_name='Membership Test Student',
            student_id='STU-MEM-001',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.NONE,
        )
        self.club = Club.objects.create(
            id='club-test-001',
            name='Test Robotics Society',
            semester_fee=299.00,
            annual_fee=499.00,
        )
        refresh = RefreshToken.for_user(self.student)
        self.access = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')

    def test_registration_starts_with_none_membership(self):
        self.assertEqual(self.student.membership_status, User.MembershipStatus.NONE)

    def test_purchase_membership_activates_student(self):
        url = reverse('membership-purchase')
        response = self.client.post(
            url,
            {
                'club_id': self.club.id,
                'membership_type': 'ANNUAL',
                'payment_method': 'Student Account (Bursar)',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.student.refresh_from_db()
        self.assertEqual(self.student.membership_status, User.MembershipStatus.ACTIVE)
        self.assertEqual(self.student.membership_type, User.MembershipType.ANNUAL)
        self.assertTrue(self.student.is_active_member)
        self.assertEqual(ClubMembership.objects.filter(student=self.student, status='ACTIVE').count(), 1)

    def test_renew_membership_after_expiry(self):
        past_end = timezone.now().date() - timedelta(days=1)
        self.student.membership_status = User.MembershipStatus.EXPIRED
        self.student.membership_type = User.MembershipType.SEMESTER
        self.student.membership_start_date = past_end - timedelta(days=180)
        self.student.membership_end_date = past_end
        self.student.save()

        url = reverse('membership-renew')
        response = self.client.post(
            url,
            {'club_id': self.club.id, 'membership_type': 'SEMESTER'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.student.refresh_from_db()
        self.assertEqual(self.student.membership_status, User.MembershipStatus.ACTIVE)
        self.assertEqual(self.student.membership_type, User.MembershipType.SEMESTER)

    def test_my_membership_status_endpoint(self):
        url = reverse('membership-my-status')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membership_status'], 'NONE')
        self.assertFalse(response.data['is_active_member'])

    def test_expired_membership_auto_updates_on_profile_fetch(self):
        self.student.membership_status = User.MembershipStatus.ACTIVE
        self.student.membership_type = User.MembershipType.ANNUAL
        self.student.membership_start_date = timezone.now().date() - timedelta(days=400)
        self.student.membership_end_date = timezone.now().date() - timedelta(days=1)
        self.student.save()

        url = reverse('auth-me')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['membership_status'], 'EXPIRED')
        self.assertFalse(response.data['is_active_member'])
