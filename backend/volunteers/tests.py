from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Event, VolunteerApplication

User = get_user_model()


class VolunteerFlowTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@studentorg.edu',
            password='AdminPassword123!',
            full_name='Test Admin',
            role=User.Role.ADMIN
        )
        self.member = User.objects.create_user(
            email='member@studentorg.edu',
            password='MemberPassword123!',
            full_name='Student Member',
            student_id='STU-VOL-01',
            role=User.Role.MEMBER
        )
        self.treasurer = User.objects.create_user(
            email='treasurer@treasurer.gmail.com',
            password='TreasurerPassword123!',
            full_name='Organization Treasurer',
            role=User.Role.TREASURER
        )

        self.event = Event.objects.create(
            title='Tech Fair 2026',
            description='Annual university tech fair.',
            date=timezone.now() + timedelta(days=7),
            venue='Main Campus Auditorium',
            volunteers_required=True,
            volunteer_roles_required=['Registration Desk', 'Photography Team'],
            status=Event.Status.PUBLISHED,
            created_by=self.admin
        )

    def test_member_can_apply_as_volunteer(self):
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('volunteer-apply')
        data = {
            'event': self.event.id,
            'preferred_role': 'Stage Management',
            'reason': 'Excited to help with stage management.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['status'], VolunteerApplication.Status.PENDING)
        self.assertEqual(response.data['data']['event'], self.event.id)

    def test_member_cannot_apply_twice_to_same_event(self):
        VolunteerApplication.objects.create(
            student=self.member,
            event=self.event,
            status=VolunteerApplication.Status.PENDING
        )

        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('volunteer-apply')
        data = {'event': self.event.id, 'notes': 'Applying again'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_treasurer_cannot_apply_as_volunteer(self):
        refresh = RefreshToken.for_user(self.treasurer)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('volunteer-apply')
        data = {'event': self.event.id, 'notes': 'I want to volunteer'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_approve_volunteer(self):
        app = VolunteerApplication.objects.create(
            student=self.member,
            event=self.event,
            status=VolunteerApplication.Status.PENDING
        )

        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('admin-volunteer-approve', kwargs={'pk': app.id})
        response = self.client.post(url, {'admin_feedback': 'Welcome aboard!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        app.refresh_from_db()
        self.assertEqual(app.status, VolunteerApplication.Status.APPROVED)
        self.assertEqual(app.reviewed_by, self.admin)

    def test_member_cannot_access_admin_volunteer_list(self):
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('admin-volunteers-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approving_creates_active_assignment_and_certificate(self):
        app = VolunteerApplication.objects.create(
            student=self.member,
            event=self.event,
            preferred_role='Stage Management',
            status=VolunteerApplication.Status.PENDING
        )

        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        # Approve application
        url = reverse('admin-volunteer-approve', kwargs={'pk': app.id})
        approve_data = {
            'assigned_role': 'Stage Management',
            'duration': '6 Hours',
            'notes': 'Great match'
        }
        res = self.client.post(url, approve_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Check Active assignment
        active_url = reverse('volunteers-active')
        active_res = self.client.get(active_url)
        self.assertEqual(active_res.status_code, status.HTTP_200_OK)
        assignments = active_res.data.get('results', active_res.data)
        self.assertTrue(any(a['student'] == self.member.id for a in assignments))

        # Mark event completed
        self.event.status = Event.Status.COMPLETED
        self.event.save()

        # Generate certificate
        gen_cert_url = reverse('certificates-generate')
        cert_data = {
            'event_id': self.event.id,
            'student_ids': [self.member.id]
        }
        cert_res = self.client.post(gen_cert_url, cert_data, format='json')
        self.assertEqual(cert_res.status_code, status.HTTP_201_CREATED)
        self.assertIn('certificates', cert_res.data)
        self.assertEqual(len(cert_res.data['certificates']), 1)
        self.assertEqual(cert_res.data['certificates'][0]['student_name'], self.member.full_name)
