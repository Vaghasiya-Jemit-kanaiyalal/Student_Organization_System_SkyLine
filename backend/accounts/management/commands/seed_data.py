from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from accounts.models import User
from volunteers.models import Event, VolunteerApplication, VolunteerAssignment, Certificate
from finance.models import Transaction, ReimbursementRequest


class Command(BaseCommand):
    help = 'Seeds initial users (Admin, Treasurer, Members), Events, Volunteers, Assignments, and Certificates.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding student organization system data...'))

        # 1. Create System Admin
        admin_email = 'admin@studentorg.edu'
        admin, _ = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': 'System Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        admin.set_password('AdminPassword123!')
        admin.save()

        # Demo Admin: admin@university.edu
        demo_admin, _ = User.objects.get_or_create(
            email='admin@university.edu',
            defaults={
                'full_name': 'Dr. Alexander Vance',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        demo_admin.set_password('password123')
        demo_admin.save()

        # 2. Create Treasurer
        treasurer_email = 'treasurer@treasurer.gmail.com'
        treasurer, _ = User.objects.get_or_create(
            email=treasurer_email,
            defaults={
                'full_name': 'Marcus Vance',
                'role': User.Role.TREASURER,
                'is_staff': False,
                'is_active': True,
            }
        )
        treasurer.set_password('TreasurerPassword123!')
        treasurer.save()

        # 3. Create Organization Members
        demo_student, _ = User.objects.get_or_create(
            email='student@university.edu',
            defaults={
                'full_name': 'Sophia Montgomery',
                'student_id': 'STU-2026-100',
                'role': User.Role.MEMBER,
                'is_active': True,
            }
        )
        demo_student.set_password('password123')
        demo_student.save()

        members_data = [
            {
                'email': 'alex.rivera@studentorg.edu',
                'full_name': 'Alex Rivera',
                'student_id': 'STU-2026-001',
                'password': 'MemberPassword123!'
            },
            {
                'email': 'sarah.chen@studentorg.edu',
                'full_name': 'Sarah Chen',
                'student_id': 'STU-2026-002',
                'password': 'MemberPassword123!'
            },
            {
                'email': 'jordan.taylor@studentorg.edu',
                'full_name': 'Jordan Taylor',
                'student_id': 'STU-2026-003',
                'password': 'MemberPassword123!'
            }
        ]

        members = [demo_student]
        for m_data in members_data:
            member, _ = User.objects.get_or_create(
                email=m_data['email'],
                defaults={
                    'full_name': m_data['full_name'],
                    'student_id': m_data['student_id'],
                    'role': User.Role.MEMBER,
                    'is_active': True,
                }
            )
            member.set_password(m_data['password'])
            member.save()
            members.append(member)

        # 4. Create Events with Volunteer Configuration
        today = timezone.now().date()

        event1, _ = Event.objects.get_or_create(
            title='SkyLine Annual Robotics Showcase 2026',
            defaults={
                'description': 'Live autonomous rovers, drone swarms, and AI vision systems demonstration with industry judges and awards.',
                'event_type': Event.EventType.FLAGSHIP,
                'venue': 'Grand Hall, Turing Science Quad',
                'date': today + timedelta(days=11),
                'start_time': time(14, 0),
                'end_time': time(18, 0),
                'capacity': 200,
                'ticket_price': 0.00,
                'image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 12,
                'volunteer_deadline': today + timedelta(days=9),
                'volunteer_roles_required': 'Registration Desk, Technical Support, Stage Management, Photography Team, Hospitality',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        event2, _ = Event.objects.get_or_create(
            title='Full-Stack Web3 & Cloud Hackathon',
            defaults={
                'description': '11-hour intensive team hackathon building microservices, AI pipelines, and decentralized systems.',
                'event_type': Event.EventType.HACKATHON,
                'venue': 'Innovation Center, Room 402',
                'date': today + timedelta(days=25),
                'start_time': time(9, 0),
                'end_time': time(20, 0),
                'capacity': 120,
                'ticket_price': 5.00,
                'image': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 8,
                'volunteer_deadline': today + timedelta(days=20),
                'volunteer_roles_required': 'Registration Desk, Technical Support, Event Coordinator, Photography Team',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        event3, _ = Event.objects.get_or_create(
            title='Career & Industry Networking Night',
            defaults={
                'description': 'Connect directly with engineering directors and software architects from regional tech employers.',
                'event_type': Event.EventType.NETWORKING,
                'venue': 'Student Union Ballroom',
                'date': today + timedelta(days=32),
                'start_time': time(17, 30),
                'end_time': time(20, 30),
                'capacity': 250,
                'ticket_price': 0.00,
                'image': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 6,
                'volunteer_deadline': today + timedelta(days=28),
                'volunteer_roles_required': 'Hospitality, Registration Desk, Event Coordinator',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        event4, _ = Event.objects.get_or_create(
            title='Hands-on Microcontroller & IoT Workshop',
            defaults={
                'description': 'ESP32 microcontroller sensor nodes and real-time MQTT telemetry lab. Completed event with certified service.',
                'event_type': Event.EventType.WORKSHOP,
                'venue': 'Makerspace Lab 108',
                'date': today - timedelta(days=5),
                'start_time': time(13, 0),
                'end_time': time(16, 0),
                'capacity': 40,
                'ticket_price': 10.00,
                'image': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 4,
                'volunteer_deadline': today - timedelta(days=7),
                'volunteer_roles_required': 'Technical Support, Registration Desk',
                'status': Event.Status.COMPLETED,
                'created_by': admin,
            }
        )

        # 5. Volunteer Applications
        # Pending Application from demo student (Rohan Sharma) for Robotics Showcase
        app_rohan, _ = VolunteerApplication.objects.update_or_create(
            student=demo_student,
            event=event1,
            defaults={
                'preferred_role': 'Technical Support',
                'reason': 'I have built ROS 2 robots and want to manage the stage and obstacle arena.',
                'experience': 'Volunteered at high school science expo; 2 years robotics lab experience.',
                'status': VolunteerApplication.Status.PENDING,
            }
        )

        # Pending Application from Jordan Taylor for Hackathon
        app_jordan, _ = VolunteerApplication.objects.update_or_create(
            student=members[3],
            event=event2,
            defaults={
                'preferred_role': 'Event Coordinator',
                'reason': 'Want to guide teams, distribute sponsor swag, and assist with schedule timing.',
                'experience': 'Coordinated departmental orientation week.',
                'status': VolunteerApplication.Status.PENDING,
            }
        )

        # Approved Application from Alex Rivera for Robotics Showcase
        app_alex, _ = VolunteerApplication.objects.update_or_create(
            student=members[1],
            event=event1,
            defaults={
                'preferred_role': 'Registration Desk',
                'reason': 'Fast typist, verified 500+ attendees at last semester showcase.',
                'experience': 'Student Senate ambassador.',
                'status': VolunteerApplication.Status.APPROVED,
                'reviewed_by': admin,
                'reviewed_at': timezone.now() - timedelta(days=1),
                'admin_feedback': 'Approved for Primary Registration Desk. Check-in starts at 1:30 PM.'
            }
        )

        # Active Volunteer Assignment for Alex Rivera
        assign_alex, _ = VolunteerAssignment.objects.update_or_create(
            student=members[1],
            event=event1,
            defaults={
                'application': app_alex,
                'assigned_role': 'Registration Desk Lead',
                'duration': '4 Hours (1:30 PM - 5:30 PM)',
                'notes': 'Responsible for iPad QR scanning kiosk at Entrance A.',
                'status': VolunteerAssignment.Status.ACTIVE,
                'approved_at': timezone.now() - timedelta(days=1)
            }
        )

        # Completed Application and Assignment for Sarah Chen (IoT Workshop)
        app_sarah, _ = VolunteerApplication.objects.update_or_create(
            student=members[2],
            event=event4,
            defaults={
                'preferred_role': 'Technical Support',
                'reason': 'Proficient with ESP-IDF and Arduino IDE hardware debugging.',
                'experience': 'Electronics lab TA.',
                'status': VolunteerApplication.Status.APPROVED,
                'reviewed_by': admin,
                'reviewed_at': timezone.now() - timedelta(days=6),
                'admin_feedback': 'Approved. Assigned as Hardware Bench Facilitator.'
            }
        )

        assign_sarah, _ = VolunteerAssignment.objects.update_or_create(
            student=members[2],
            event=event4,
            defaults={
                'application': app_sarah,
                'assigned_role': 'Hardware Bench Facilitator',
                'duration': '3 Hours (1:00 PM - 4:00 PM)',
                'notes': 'Distributed hardware kits and debugged wiring issues.',
                'status': VolunteerAssignment.Status.COMPLETED,
                'approved_at': timezone.now() - timedelta(days=6),
                'completed_at': timezone.now() - timedelta(days=5)
            }
        )

        # Completed Assignment for Demo Student on IoT Workshop with Certificate
        assign_rohan_comp, _ = VolunteerAssignment.objects.update_or_create(
            student=demo_student,
            event=event4,
            defaults={
                'assigned_role': 'Lab Coordinator & Registration',
                'duration': '3.5 Hours',
                'notes': 'Managed attendee check-in and inventory tracking.',
                'status': VolunteerAssignment.Status.COMPLETED,
                'approved_at': timezone.now() - timedelta(days=6),
                'completed_at': timezone.now() - timedelta(days=5)
            }
        )

        # 6. Official Certificates
        cert1, _ = Certificate.objects.update_or_create(
            student=demo_student,
            event=event4,
            defaults={
                'assignment': assign_rohan_comp,
                'volunteer_role': 'Lab Coordinator & Registration',
                'duration': '3.5 Certified Hours',
                'issue_date': today - timedelta(days=4),
            }
        )

        cert2, _ = Certificate.objects.update_or_create(
            student=members[2],
            event=event4,
            defaults={
                'assignment': assign_sarah,
                'volunteer_role': 'Hardware Bench Facilitator',
                'duration': '3.0 Certified Hours',
                'issue_date': today - timedelta(days=4),
            }
        )

        # 7. Financial Transactions
        Transaction.objects.get_or_create(
            title='Spring Semester Membership Dues',
            defaults={
                'amount': 2500.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.MEMBERSHIP_FEE,
                'description': 'Aggregated student organization membership registrations.',
                'date': today - timedelta(days=10),
                'recorded_by': treasurer,
            }
        )

        Transaction.objects.get_or_create(
            title='Title Sponsorship from Tech Corp',
            defaults={
                'amount': 5000.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.SPONSORSHIP,
                'description': 'Annual hackathon main stage sponsorship.',
                'date': today - timedelta(days=5),
                'recorded_by': treasurer,
            }
        )

        Transaction.objects.get_or_create(
            title='Robotics Lab Hardware Components',
            defaults={
                'amount': 1200.00,
                'transaction_type': Transaction.Type.EXPENSE,
                'category': Transaction.Category.EVENT_EXPENSE,
                'description': 'Sensors and microcontrollers for upcoming competition.',
                'date': today - timedelta(days=3),
                'recorded_by': treasurer,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all Events, Volunteers, Assignments, and Certificates!'))
