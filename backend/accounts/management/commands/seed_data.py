from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from accounts.models import User, Club, ClubMembership
from volunteers.models import Event, VolunteerApplication, VolunteerAssignment, Certificate, Announcement
from finance.models import Transaction, ReimbursementRequest


class Command(BaseCommand):
    help = 'Seeds initial users, clubs, memberships, events, and student organization data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding complete student membership system data...'))

        today = timezone.now().date()

        # 1. Create System Admin
        admin, _ = User.objects.get_or_create(
            email='admin@studentorg.edu',
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

        # Demo Admin
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
        treasurer, _ = User.objects.get_or_create(
            email='treasurer@treasurer.gmail.com',
            defaults={
                'full_name': 'Marcus Vance',
                'role': User.Role.TREASURER,
                'is_staff': False,
                'is_active': True,
            }
        )
        treasurer.set_password('TreasurerPassword123!')
        treasurer.save()

        # 3. Create Campus Clubs
        clubs_data = [
            {
                'id': 'club-robotics',
                'name': 'Skyline Robotics & AI Society',
                'short_name': 'Robotics & AI',
                'tagline': 'Autonomous Systems, Rover Engineering & Neural Hardware',
                'category': 'Engineering & Technology',
                'badge': 'Flagship Chapter',
                'faculty_advisor': 'Dr. Alexander Vance (Faculty Advisor)',
                'meeting_schedule': 'Tuesdays & Thursdays • 5:30 PM (Turing Lab 108)',
                'available_spots': 28,
                'total_spots': 120,
                'annual_fee': 499.00,
                'semester_fee': 299.00,
                'banner_image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    '100% Free VIP admission to Annual Robotics Showcase (Save ₹100)',
                    'Subsidized entry to Web3 & Cloud Hackathons (Save ₹150)',
                    'Direct access to Turing Quad Robotics Lab & 3D Printing suite',
                    'Certified Academic Volunteer & Technical Service Hours',
                    'Exclusive club crest apparel and discount at merch store'
                ]
            },
            {
                'id': 'club-coding',
                'name': 'Skyline Coding & Hackathon Guild',
                'short_name': 'Coding & Dev',
                'tagline': 'Competitive Programming, Full-Stack Architecture & Cloud Ops',
                'category': 'Computer Science',
                'badge': 'Most Active',
                'faculty_advisor': 'Prof. Sarah Jenkins (Advisor)',
                'meeting_schedule': 'Wednesdays • 6:00 PM (Innovation Center 402)',
                'available_spots': 35,
                'total_spots': 150,
                'annual_fee': 499.00,
                'semester_fee': 299.00,
                'banner_image': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    '50% Member discount on 24h & 48h campus hackathon passes',
                    'Free GitHub Copilot & AWS Cloud credits for student teams',
                    'Mentorship & mock technical interviews with tech alumni',
                    'Priority registration for regional ACM-ICPC team qualifiers',
                    'Specialized software engineering workshops'
                ]
            },
            {
                'id': 'club-finance',
                'name': 'Skyline Business & Investment League',
                'short_name': 'Finance & League',
                'tagline': 'Corporate Finance, Venture Capital & Student Portfolio Fund',
                'category': 'Finance & Business',
                'badge': 'Career Accelerator',
                'faculty_advisor': 'Marcus Sterling & Dean of Business',
                'meeting_schedule': 'Mondays • 5:00 PM (Finance Hall Suite 201)',
                'available_spots': 18,
                'total_spots': 80,
                'annual_fee': 599.00,
                'semester_fee': 349.00,
                'banner_image': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    'Free admission to Career & Industry Networking Night (Save ₹150)',
                    'Access to Bloomberg Terminals & Mock Trading competitions',
                    'Invitation to exclusive Venture Capital & Private Equity dinners',
                    'Resume distribution to top corporate finance recruitment partners',
                    'Official Dean endorsement on graduating transcript'
                ]
            },
            {
                'id': 'club-arts',
                'name': 'Campus Cultural & Creative Arts Society',
                'short_name': 'Cultural & Arts',
                'tagline': 'Performing Arts, Cultural Festivals & Creative Media',
                'category': 'Arts & Media',
                'badge': 'Cultural Grant',
                'faculty_advisor': 'Sophia Montgomery (Creative Director)',
                'meeting_schedule': 'Fridays • 4:30 PM (Fine Arts Amphitheater)',
                'available_spots': 45,
                'total_spots': 160,
                'annual_fee': 399.00,
                'semester_fee': 249.00,
                'banner_image': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    'Complimentary passes to all University Gala & Music nights',
                    'Access to recording studio and rehearsal spaces',
                    'Subsidized festival tickets and artist meet-and-greets',
                    'Participation in annual inter-university cultural leagues',
                    'Special discount on limited-edition festival merchandise'
                ]
            },
            {
                'id': 'club-debate',
                'name': 'University Debate & Model UN Council',
                'short_name': 'Debate & MUN',
                'tagline': 'Parliamentary Debate, Global Policy & Rhetorical Strategy',
                'category': 'Leadership & Policy',
                'badge': 'National Finalist',
                'faculty_advisor': 'Julian Chen (President)',
                'meeting_schedule': 'Thursdays • 6:30 PM (Student Senate Chambers)',
                'available_spots': 20,
                'total_spots': 70,
                'annual_fee': 499.00,
                'semester_fee': 299.00,
                'banner_image': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    'Subsidized travel and accommodation for national competitions',
                    'Voting delegate seat at University Senate mock parliaments',
                    'Direct executive public speaking masterclasses',
                    'Access to constitutional law archives and research leads',
                    'Official leadership credentials for law/graduate school'
                ]
            },
            {
                'id': 'club-environment',
                'name': 'Campus Environmental & Sustainability Alliance',
                'short_name': 'Green Alliance',
                'tagline': 'Climate Action, Eco-Logistics & Community Solar Projects',
                'category': 'Civic & Ecology',
                'badge': 'Green Campus',
                'faculty_advisor': 'Priya Patel (Project Lead)',
                'meeting_schedule': 'Saturdays • 10:00 AM (Botanical Research Quad)',
                'available_spots': 50,
                'total_spots': 200,
                'annual_fee': 399.00,
                'semester_fee': 199.00,
                'banner_image': 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
                'benefits': [
                    'Certified Environmental Volunteer Hours for graduation honor cord',
                    'Free Organic Campus Farm produce and eco-starter kit',
                    'Community solar & recycling initiative management',
                    'Priority volunteer badge at university-wide clean drives',
                    'Free admission to sustainability conferences & banquets'
                ]
            }
        ]

        created_clubs = {}
        for cdata in clubs_data:
            c, _ = Club.objects.update_or_create(
                id=cdata['id'],
                defaults=cdata
            )
            created_clubs[c.id] = c

        # 4. Create Students with diverse Membership Statuses
        students_info = [
            {
                'email': 'student@university.edu',
                'full_name': 'Sophia Montgomery',
                'student_id': 'STU-2026-100',
                'role': User.Role.STUDENT,
                'password': 'password123',
                'membership_status': User.MembershipStatus.ACTIVE,
                'membership_type': User.MembershipType.ANNUAL,
                'start_date': today - timedelta(days=60),
                'end_date': today + timedelta(days=305),
                'club_id': 'club-robotics'
            },
            {
                'email': 'yug@gmail.com',
                'full_name': 'Yug',
                'student_id': 'STU-2026-9901',
                'role': User.Role.STUDENT,
                'password': 'Yug@123',
                'membership_status': User.MembershipStatus.ACTIVE,
                'membership_type': User.MembershipType.ANNUAL,
                'start_date': today - timedelta(days=30),
                'end_date': today + timedelta(days=335),
                'club_id': 'club-robotics'
            },
            {
                'email': 'alex.rivera@studentorg.edu',
                'full_name': 'Alex Rivera',
                'student_id': 'STU-2026-001',
                'role': User.Role.STUDENT,
                'password': 'MemberPassword123!',
                'membership_status': User.MembershipStatus.ACTIVE,
                'membership_type': User.MembershipType.SEMESTER,
                'start_date': today - timedelta(days=20),
                'end_date': today + timedelta(days=160),
                'club_id': 'club-coding'
            },
            {
                'email': 'sarah.chen@studentorg.edu',
                'full_name': 'Sarah Chen',
                'student_id': 'STU-2026-002',
                'role': User.Role.STUDENT,
                'password': 'MemberPassword123!',
                'membership_status': User.MembershipStatus.EXPIRED,
                'membership_type': User.MembershipType.SEMESTER,
                'start_date': today - timedelta(days=200),
                'end_date': today - timedelta(days=20),
                'club_id': 'club-robotics'
            },
            {
                'email': 'jordan.taylor@studentorg.edu',
                'full_name': 'Jordan Taylor',
                'student_id': 'STU-2026-003',
                'role': User.Role.STUDENT,
                'password': 'MemberPassword123!',
                'membership_status': User.MembershipStatus.NONE,
                'membership_type': None,
                'start_date': None,
                'end_date': None,
                'club_id': None
            },
            {
                'email': 'rohan.sharma@studentorg.edu',
                'full_name': 'Rohan Sharma',
                'student_id': 'STU-2026-905',
                'role': User.Role.STUDENT,
                'password': 'MemberPassword123!',
                'membership_status': User.MembershipStatus.NONE,
                'membership_type': None,
                'start_date': None,
                'end_date': None,
                'club_id': None
            }
        ]

        created_students = {}
        for sinfo in students_info:
            stu, _ = User.objects.get_or_create(
                email=sinfo['email'],
                defaults={
                    'full_name': sinfo['full_name'],
                    'student_id': sinfo['student_id'],
                    'role': sinfo['role'],
                    'membership_status': sinfo['membership_status'],
                    'membership_type': sinfo['membership_type'],
                    'membership_start_date': sinfo['start_date'],
                    'membership_end_date': sinfo['end_date'],
                    'is_active': True
                }
            )
            stu.set_password(sinfo['password'])
            stu.membership_status = sinfo['membership_status']
            stu.membership_type = sinfo['membership_type']
            stu.membership_start_date = sinfo['start_date']
            stu.membership_end_date = sinfo['end_date']
            stu.save()
            created_students[sinfo['email']] = stu

            # Create ClubMembership record if club is assigned
            if sinfo['club_id'] and sinfo['club_id'] in created_clubs:
                c = created_clubs[sinfo['club_id']]
                ClubMembership.objects.update_or_create(
                    student=stu,
                    club=c,
                    defaults={
                        'club_name_snapshot': c.name,
                        'membership_type': sinfo['membership_type'] or ClubMembership.MembershipType.ANNUAL,
                        'fee': c.annual_fee if sinfo['membership_type'] == User.MembershipType.ANNUAL else c.semester_fee,
                        'start_date': sinfo['start_date'] or today,
                        'end_date': sinfo['end_date'] or today + timedelta(days=365),
                        'status': ClubMembership.Status.ACTIVE if sinfo['membership_status'] == User.MembershipStatus.ACTIVE else ClubMembership.Status.EXPIRED,
                        'payment_method': 'Student ID Account (Bursar)'
                    }
                )

        # 5. Create Events with Member Ticket Price & Non-Member Ticket Price
        event1, _ = Event.objects.update_or_create(
            title='SkyLine Annual Robotics Showcase 2026',
            defaults={
                'description': 'Live autonomous rovers, drone swarms, and AI vision systems demonstration with industry judges and awards.',
                'event_type': Event.EventType.FLAGSHIP,
                'venue': 'Grand Hall, Turing Science Quad',
                'date': today + timedelta(days=11),
                'start_time': time(14, 0),
                'end_time': time(18, 0),
                'capacity': 200,
                'ticket_price': 200.00,
                'non_member_ticket_price': 200.00,
                'member_ticket_price': 100.00,
                'image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 12,
                'volunteer_deadline': today + timedelta(days=9),
                'volunteer_roles_required': 'Registration Desk, Technical Support, Stage Management, Photography Team, Hospitality',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        event2, _ = Event.objects.update_or_create(
            title='Full-Stack Web3 & Cloud Hackathon',
            defaults={
                'description': '11-hour intensive team hackathon building microservices, AI pipelines, and decentralized systems.',
                'event_type': Event.EventType.HACKATHON,
                'venue': 'Innovation Center, Room 402',
                'date': today + timedelta(days=25),
                'start_time': time(9, 0),
                'end_time': time(20, 0),
                'capacity': 120,
                'ticket_price': 300.00,
                'non_member_ticket_price': 300.00,
                'member_ticket_price': 150.00,
                'image': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 8,
                'volunteer_deadline': today + timedelta(days=20),
                'volunteer_roles_required': 'Registration Desk, Technical Support, Event Coordinator, Photography Team',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        event3, _ = Event.objects.update_or_create(
            title='Career & Industry Networking Night',
            defaults={
                'description': 'Connect directly with engineering directors and software architects from regional tech employers.',
                'event_type': Event.EventType.NETWORKING,
                'venue': 'Student Union Ballroom',
                'date': today + timedelta(days=32),
                'start_time': time(17, 30),
                'end_time': time(20, 30),
                'capacity': 250,
                'ticket_price': 250.00,
                'non_member_ticket_price': 250.00,
                'member_ticket_price': 100.00,
                'image': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 6,
                'volunteer_deadline': today + timedelta(days=28),
                'volunteer_roles_required': 'Hospitality, Registration Desk, Event Coordinator',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        # 6. Volunteer Applications & Announcements
        Announcement.objects.update_or_create(
            title='Welcome to Academic Year 2026–2027: Membership & Club Enrollments Now Open!',
            defaults={
                'content': 'All students can now enroll in semester or annual club memberships to unlock 50% event ticket discounts, merchandise savings, lab access, and certified service credits.',
                'category': 'Membership Notice',
                'priority': 'Important',
                'status': Announcement.Status.SENT,
                'author': 'Dr. Alexander Vance (Faculty Advisor)',
                'pinned': True,
                'created_by': admin
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded complete Student Membership System data!'))
