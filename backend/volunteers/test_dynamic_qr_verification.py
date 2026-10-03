import uuid
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from volunteers.models import Event, Ticket


class DynamicQRTicketVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create two distinct students
        self.student_1 = User.objects.create_user(
            email='alice@university.edu',
            password='TestPassword123!',
            full_name='Alice Wonderland',
            student_id='STD-2026-0001',
            role=User.Role.STUDENT,
            membership_status='ACTIVE'
        )
        self.student_2 = User.objects.create_user(
            email='bob@university.edu',
            password='TestPassword123!',
            full_name='Bob Builder',
            student_id='STD-2026-0002',
            role=User.Role.STUDENT,
            membership_status='NONE'
        )

        # Create two distinct events
        self.event_hackathon = Event.objects.create(
            title='AI & Cloud Hackathon 2026',
            description='Flagship collegiate hacking competition.',
            event_type='Hackathon',
            venue='Tech Innovation Center Hall A',
            date=timezone.now().date() + timezone.timedelta(days=10),
            start_time='09:00:00',
            end_time='18:00:00',
            capacity=200,
            status=Event.Status.PUBLISHED,
            ticket_price=Decimal('250.00'),
            member_ticket_price=Decimal('150.00')
        )
        self.event_culture = Event.objects.create(
            title='Annual Cultural Gala Night',
            description='Music, drama, and cultural festival.',
            event_type='Social & Culture',
            venue='Grand Campus Amphitheatre',
            date=timezone.now().date() + timezone.timedelta(days=20),
            start_time='18:30:00',
            end_time='22:30:00',
            capacity=500,
            status=Event.Status.PUBLISHED,
            ticket_price=Decimal('100.00'),
            member_ticket_price=Decimal('50.00')
        )

        # Create tickets for each student & event
        self.ticket_1 = Ticket.objects.create(
            student=self.student_1,
            event=self.event_hackathon,
            tier='Member Pass',
            price_paid=Decimal('150.00'),
            status=Ticket.Status.CONFIRMED,
            seat='Member Pass • Row A, Seat #12'
        )
        self.ticket_2 = Ticket.objects.create(
            student=self.student_2,
            event=self.event_culture,
            tier='Standard Pass',
            price_paid=Decimal('100.00'),
            status=Ticket.Status.CONFIRMED,
            seat='Standard Pass • Row F, Seat #44'
        )

    def test_qr_generation_encodes_frontend_verification_url(self):
        """Ticket QR generation should embed frontend verification URL instead of raw token."""
        self.assertIsNotNone(self.ticket_1.ticket_uuid)
        self.assertTrue(bool(self.ticket_1.qr_code))
        verification_url = self.ticket_1.get_verification_url()
        self.assertIn(f"/ticket/{self.ticket_1.ticket_uuid}", verification_url)
        self.assertEqual(self.ticket_1.qr_code_data, verification_url)

    def test_different_tickets_show_different_student_and_event_data(self):
        """Requirement 1 & 2: Different tickets show their respective student & event data."""
        # Verify Ticket 1 (Alice @ Hackathon)
        res_1 = self.client.get(f'/api/tickets/verify/{self.ticket_1.ticket_uuid}/')
        self.assertEqual(res_1.status_code, status.HTTP_200_OK)
        data_1 = res_1.data
        self.assertTrue(data_1['valid'])
        self.assertEqual(data_1['student_name'], 'Alice Wonderland')
        self.assertEqual(data_1['student_id'], 'STD-2026-0001')
        self.assertEqual(data_1['university_email'], 'alice@university.edu')
        self.assertEqual(data_1['event_name'], 'AI & Cloud Hackathon 2026')
        self.assertEqual(data_1['venue'], 'Tech Innovation Center Hall A')
        self.assertEqual(data_1['ticket_type'], 'Member Pass')
        self.assertEqual(data_1['status'], 'Confirmed')

        # Verify Ticket 2 (Bob @ Cultural Gala)
        res_2 = self.client.get(f'/api/tickets/verify/{self.ticket_2.ticket_uuid}/')
        self.assertEqual(res_2.status_code, status.HTTP_200_OK)
        data_2 = res_2.data
        self.assertTrue(data_2['valid'])
        self.assertEqual(data_2['student_name'], 'Bob Builder')
        self.assertEqual(data_2['student_id'], 'STD-2026-0002')
        self.assertEqual(data_2['university_email'], 'bob@university.edu')
        self.assertEqual(data_2['event_name'], 'Annual Cultural Gala Night')
        self.assertEqual(data_2['venue'], 'Grand Campus Amphitheatre')
        self.assertEqual(data_2['ticket_type'], 'Standard Pass')
        self.assertEqual(data_2['status'], 'Confirmed')

    def test_invalid_uuid_returns_invalid_ticket(self):
        """Requirement 3: An unmapped or invalid UUID returns valid=False and Invalid Ticket."""
        fake_uuid = str(uuid.uuid4())
        res = self.client.get(f'/api/tickets/verify/{fake_uuid}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data['valid'])
        self.assertEqual(res.data['message'], 'Invalid Ticket')

        # Also test gibberish string
        res_gibberish = self.client.get('/api/tickets/verify/non-existent-ticket-id/')
        self.assertEqual(res_gibberish.status_code, status.HTTP_200_OK)
        self.assertFalse(res_gibberish.data['valid'])
        self.assertEqual(res_gibberish.data['message'], 'Invalid Ticket')

    def test_direct_tickets_verify_route_compatibility(self):
        """Verify that /tickets/verify/<uuid>/ also responds to requests without /api/ prefix."""
        res = self.client.get(f'/tickets/verify/{self.ticket_1.ticket_uuid}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['valid'])
        self.assertEqual(res.data['ticket_id'], self.ticket_1.ticket_id)

    def test_organizer_scanner_compatibility_with_url_qr(self):
        """Organizer gate scanner can scan the URL-based QR directly without error."""
        organizer = User.objects.create_user(
            email='gate_admin@university.edu',
            password='Password123!',
            full_name='Gate Admin',
            role=User.Role.ADMIN
        )
        self.client.force_authenticate(user=organizer)

        # Scan with full URL as emitted by camera
        verification_url = self.ticket_1.get_verification_url()
        res = self.client.post('/api/tickets/verify-qr/', {
            'qr_token': verification_url,
            'event_id': self.event_hackathon.id
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get('is_valid'))
        self.assertEqual(res.data.get('ticket', {}).get('ticket_id'), self.ticket_1.ticket_id)
