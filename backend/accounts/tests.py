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


class MembershipEmailNotificationTests(APITestCase):
    """
    Unit & Integration tests for Membership Expiry Reminders and Expired Notices.
    """
    def setUp(self):
        from django.core import mail
        mail.outbox.clear()
        self.today = timezone.now().date()

        # Active member expiring in 30 days
        self.member_30d = User.objects.create_user(
            email='member_30d@studentorg.edu',
            password='Password123!',
            full_name='Member 30d',
            student_id='STU-30D',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL,
            membership_start_date=self.today - timedelta(days=335),
            membership_end_date=self.today + timedelta(days=30)
        )

        # Active member expiring in 7 days
        self.member_7d = User.objects.create_user(
            email='member_7d@studentorg.edu',
            password='Password123!',
            full_name='Member 7d',
            student_id='STU-7D',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL,
            membership_start_date=self.today - timedelta(days=358),
            membership_end_date=self.today + timedelta(days=7)
        )

        # Active member expiring in 1 day
        self.member_1d = User.objects.create_user(
            email='member_1d@studentorg.edu',
            password='Password123!',
            full_name='Member 1d',
            student_id='STU-1D',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL,
            membership_start_date=self.today - timedelta(days=364),
            membership_end_date=self.today + timedelta(days=1)
        )

        # Active member expiring in 60 days (far away - no reminder)
        self.member_60d = User.objects.create_user(
            email='member_60d@studentorg.edu',
            password='Password123!',
            full_name='Member 60d',
            student_id='STU-60D',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL,
            membership_start_date=self.today - timedelta(days=305),
            membership_end_date=self.today + timedelta(days=60)
        )

        # Member whose membership expired yesterday
        self.member_expired = User.objects.create_user(
            email='member_expired@studentorg.edu',
            password='Password123!',
            full_name='Member Expired',
            student_id='STU-EXP',
            role=User.Role.STUDENT,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL,
            membership_start_date=self.today - timedelta(days=366),
            membership_end_date=self.today - timedelta(days=1)
        )

    def test_membership_checker_dispatches_reminders_and_expired(self):
        from accounts.services.email_service import process_membership_checks
        from accounts.models import MembershipNotificationLog
        from django.core import mail

        stats = process_membership_checks(reminder_days=[30, 7, 1])

        # 3 reminders (30d, 7d, 1d) + 1 expired notice = 4 emails sent
        self.assertEqual(stats['reminders_sent'], 3)
        self.assertEqual(stats['expired_sent'], 1)
        self.assertEqual(len(mail.outbox), 4)

        # Check notification log records
        self.assertEqual(MembershipNotificationLog.objects.filter(status='SENT').count(), 4)

        # Verify expired member status was updated
        self.member_expired.refresh_from_db()
        self.assertEqual(self.member_expired.membership_status, User.MembershipStatus.EXPIRED)

    def test_duplicate_reminder_suppression(self):
        from accounts.services.email_service import process_membership_checks
        from django.core import mail

        # First run: dispatches emails
        process_membership_checks(reminder_days=[30, 7, 1])
        first_count = len(mail.outbox)

        # Second run: should suppress duplicates and send 0 new emails
        stats2 = process_membership_checks(reminder_days=[30, 7, 1])
        self.assertEqual(stats2['reminders_sent'], 0)
        self.assertEqual(stats2['expired_sent'], 0)
        self.assertGreaterEqual(stats2['already_sent'], 4)
        self.assertEqual(len(mail.outbox), first_count)

    def test_renewal_allows_future_reminders_for_new_period(self):
        from accounts.services.email_service import process_membership_checks
        from accounts.models import MembershipNotificationLog
        from django.core import mail

        # 1. First run sends 30d reminder for member_30d
        process_membership_checks(reminder_days=[30, 7, 1])
        initial_log_count = MembershipNotificationLog.objects.filter(user=self.member_30d).count()
        self.assertEqual(initial_log_count, 1)

        # 2. Member renews: end_date becomes today + 365 days
        self.member_30d.membership_status = User.MembershipStatus.ACTIVE
        self.member_30d.membership_end_date = self.today + timedelta(days=365)
        self.member_30d.save()

        # 3. Simulate time passing until 7 days before the NEW expiry date
        self.member_30d.membership_end_date = self.today + timedelta(days=7)
        self.member_30d.save()

        mail.outbox.clear()
        stats = process_membership_checks(reminder_days=[30, 7, 1])

        # New reminder for the new expiry date should be sent
        self.assertIn(self.member_30d.email, [m.to[0] for m in mail.outbox])


class PasswordResetFlowTests(APITestCase):
    """
    Unit & Integration tests for the full Forgot Password & Password Reset flow.
    """
    def setUp(self):
        from django.core import mail
        mail.outbox.clear()
        self.user = User.objects.create_user(
            email='reset_user@studentorg.edu',
            password='InitialPassword123!',
            full_name='Reset User',
            student_id='STU-RESET-01',
            role=User.Role.STUDENT
        )

    def test_forgot_password_valid_email_dispatches_email(self):
        from django.core import mail
        url = reverse('auth-forgot-password')
        response = self.client.post(url, {'email': 'reset_user@studentorg.edu'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('If an account exists', response.data['message'])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['reset_user@studentorg.edu'])
        self.assertIn('/reset-password?uid=', mail.outbox[0].body)

    def test_forgot_password_unregistered_email_prevents_enumeration(self):
        from django.core import mail
        url = reverse('auth-forgot-password')
        response = self.client.post(url, {'email': 'nonexistent@studentorg.edu'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('If an account exists', response.data['message'])
        # No email sent for non-existent user
        self.assertEqual(len(mail.outbox), 0)

    def test_validate_reset_token_endpoint(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        token = default_token_generator.make_token(self.user)
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))

        url = reverse('auth-validate-reset-token')
        response = self.client.post(url, {'uidb64': uidb64, 'token': token}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['email'], self.user.email)

    def test_validate_reset_token_invalid_or_expired(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        url = reverse('auth-validate-reset-token')
        response = self.client.post(url, {'uidb64': uidb64, 'token': 'invalid-token-123'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['valid'])

    def test_complete_password_reset_and_login_flow(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        token = default_token_generator.make_token(self.user)
        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))

        # 1. Reset password
        reset_url = reverse('auth-reset-password')
        response = self.client.post(reset_url, {
            'uidb64': uidb64,
            'token': token,
            'new_password': 'BrandNewPassword123!',
            'confirm_new_password': 'BrandNewPassword123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # 2. Token reuse prevention: same token should now be rejected
        validate_url = reverse('auth-validate-reset-token')
        reuse_response = self.client.post(validate_url, {'uidb64': uidb64, 'token': token}, format='json')
        self.assertEqual(reuse_response.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Log in with the new password
        login_url = reverse('auth-login')
        login_response = self.client.post(login_url, {
            'email': self.user.email,
            'password': 'BrandNewPassword123!'
        }, format='json')

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)

        # 4. Old password should fail
        old_login_response = self.client.post(login_url, {
            'email': self.user.email,
            'password': 'InitialPassword123!'
        }, format='json')
        self.assertEqual(old_login_response.status_code, status.HTTP_401_UNAUTHORIZED)

