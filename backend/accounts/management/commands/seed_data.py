from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from volunteers.models import Event, VolunteerApplication
from finance.models import Transaction, ReimbursementRequest


class Command(BaseCommand):
    help = 'Seeds initial users (Admin, Treasurer, Members), Events, Volunteers, and Finance data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding student organization system data...'))

        # 1. Create System Admin
        admin_email = 'admin@studentorg.edu'
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': 'System Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        if created:
            admin.set_password('AdminPassword123!')
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Created Admin: {admin_email} / AdminPassword123!"))
        else:
            self.stdout.write(f"Admin already exists: {admin_email}")

        # 2. Create Treasurer
        treasurer_email = 'treasurer@studentorg.edu'
        treasurer, created = User.objects.get_or_create(
            email=treasurer_email,
            defaults={
                'full_name': 'Marcus Vance',
                'role': User.Role.TREASURER,
                'is_staff': False,
                'is_active': True,
            }
        )
        if created:
            treasurer.set_password('TreasurerPassword123!')
            treasurer.save()
            self.stdout.write(self.style.SUCCESS(f"Created Treasurer: {treasurer_email} / TreasurerPassword123!"))
        else:
            self.stdout.write(f"Treasurer already exists: {treasurer_email}")

        # 3. Create Organization Members
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

        members = []
        for m_data in members_data:
            member, created = User.objects.get_or_create(
                email=m_data['email'],
                defaults={
                    'full_name': m_data['full_name'],
                    'student_id': m_data['student_id'],
                    'role': User.Role.MEMBER,
                    'is_active': True,
                }
            )
            if created:
                member.set_password(m_data['password'])
                member.save()
                self.stdout.write(self.style.SUCCESS(f"Created Member: {m_data['email']} / {m_data['password']}"))
            members.append(member)

        # 4. Create Events
        now = timezone.now()
        event1, _ = Event.objects.get_or_create(
            title='SkyLine Annual Hackathon 2026',
            defaults={
                'description': '48-hour student hackathon with workshops, mentors, and prizes.',
                'date': now + timedelta(days=14),
                'location': 'Student Union - Hall A',
                'max_volunteers': 15,
                'is_active': True,
                'created_by': admin,
            }
        )

        event2, _ = Event.objects.get_or_create(
            title='Tech Career & Networking Night',
            defaults={
                'description': 'Networking session connecting computer science and engineering students with tech employers.',
                'date': now + timedelta(days=30),
                'location': 'University Innovation Hub',
                'max_volunteers': 8,
                'is_active': True,
                'created_by': admin,
            }
        )

        # 5. Create Volunteer Applications
        app1, _ = VolunteerApplication.objects.get_or_create(
            student=members[0],
            event=event1,
            defaults={
                'notes': 'Experienced with event registration desk and audio-visual setups.',
                'status': VolunteerApplication.Status.APPROVED,
                'reviewed_by': admin,
                'reviewed_at': now,
                'admin_feedback': 'Approved. Assigned to Reception Desk.'
            }
        )

        app2, _ = VolunteerApplication.objects.get_or_create(
            student=members[1],
            event=event1,
            defaults={
                'notes': 'Interested in mentoring freshmen and guiding participants.',
                'status': VolunteerApplication.Status.PENDING,
            }
        )

        # 6. Create Financial Transactions
        Transaction.objects.get_or_create(
            title='Spring Semester Membership Dues',
            defaults={
                'amount': 2500.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.MEMBERSHIP_FEE,
                'description': 'Aggregated student organization membership registrations.',
                'date': now.date() - timedelta(days=10),
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
                'date': now.date() - timedelta(days=5),
                'recorded_by': treasurer,
            }
        )

        Transaction.objects.get_or_create(
            title='Hackathon Venue & Security Deposit',
            defaults={
                'amount': 1200.00,
                'transaction_type': Transaction.Type.EXPENSE,
                'category': Transaction.Category.EVENT_EXPENSE,
                'description': 'Student Union hall rental fee.',
                'date': now.date() - timedelta(days=3),
                'recorded_by': treasurer,
            }
        )

        # 7. Create Reimbursement Request
        ReimbursementRequest.objects.get_or_create(
            requested_by=members[0],
            title='Workshop Supplies & Name Badges',
            defaults={
                'amount': 145.50,
                'description': 'Purchased 200 attendee name badges and markers for orientation.',
                'receipt_reference': 'INV-2026-9812',
                'status': ReimbursementRequest.Status.PENDING,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded all sample data!'))
