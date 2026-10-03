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
            location='Main Campus Auditorium',
            created_by=self.admin
        )

    def test_member_can_apply_as_volunteer(self):
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('volunteer-apply')
        data = {
            'event': self.event.id,
            'notes': 'Excited to help with stage management.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['status'], 'PENDING')
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
