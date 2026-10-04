from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Event, VolunteerApplication, Ticket

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

    def test_member_cannot_apply_on_same_event_day(self):
        same_day_event = Event.objects.create(
            title='Same Day Event',
            description='Event happening today.',
            date=timezone.now().date(),
            venue='Auditorium B',
            volunteers_required=True,
            status=Event.Status.PUBLISHED,
            created_by=self.admin
        )
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('volunteer-apply')
        data = {
            'event': same_day_event.id,
            'preferred_role': 'Registration Desk',
            'reason': 'Want to help today.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("closed on the day of the event", str(response.data))

    def test_student_volunteers_filter_excludes_same_day_event(self):
        same_day_event = Event.objects.create(
            title='Same Day Volunteer Event',
            description='Happening today.',
            date=timezone.now().date(),
            venue='Campus Quad',
            volunteers_required=True,
            status=Event.Status.PUBLISHED,
            created_by=self.admin
        )
        refresh = RefreshToken.for_user(self.member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('event-list-create') + '?volunteers_required=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        event_ids = [e['id'] for e in results]
        # Future event should be included
        self.assertIn(self.event.id, event_ids)
        # Same-day event must NOT be visible to student
        self.assertNotIn(same_day_event.id, event_ids)

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


class TicketFlowTests(APITestCase):
    def setUp(self):
        self.active_member = User.objects.create_user(
            email='activemember@studentorg.edu',
            password='Password123!',
            full_name='Active Member Student',
            student_id='STU-MEM-01',
            role=User.Role.MEMBER,
            membership_status=User.MembershipStatus.ACTIVE,
            membership_type=User.MembershipType.ANNUAL
        )
        self.regular_student = User.objects.create_user(
            email='regularstudent@studentorg.edu',
            password='Password123!',
            full_name='Regular Student',
            student_id='STU-REG-01',
            role=User.Role.MEMBER,
            membership_status=User.MembershipStatus.NONE
        )
        self.event = Event.objects.create(
            title='Annual Gala 2026',
            description='Gala dinner and showcase.',
            date=timezone.now() + timedelta(days=10),
            venue='Student Union Grand Ballroom',
            ticket_price=200.00,
            non_member_ticket_price=200.00,
            member_ticket_price=100.00,
            status=Event.Status.PUBLISHED
        )

    def test_active_member_buys_ticket_at_member_price(self):
        refresh = RefreshToken.for_user(self.active_member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('event-buy-ticket', kwargs={'event_id': self.event.id})
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['tier'], 'Member Pass')
        self.assertEqual(float(response.data['price_paid']), 100.00)
        self.assertEqual(response.data['status'], 'Confirmed')

    def test_regular_student_buys_ticket_at_non_member_price(self):
        refresh = RefreshToken.for_user(self.regular_student)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('event-buy-ticket', kwargs={'event_id': self.event.id})
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['tier'], 'Standard Pass')
        self.assertEqual(float(response.data['price_paid']), 200.00)
        self.assertEqual(response.data['status'], 'Confirmed')

    def test_student_can_fetch_my_tickets(self):
        Ticket.objects.create(
            student=self.active_member,
            event=self.event,
            tier='Member Pass',
            price_paid=100.00,
            status=Ticket.Status.CONFIRMED
        )

        refresh = RefreshToken.for_user(self.active_member)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        url = reverse('student-my-tickets')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tickets = response.data.get('results', response.data)
        self.assertEqual(len(tickets), 1)
        self.assertEqual(tickets[0]['eventTitle'], 'Annual Gala 2026')

