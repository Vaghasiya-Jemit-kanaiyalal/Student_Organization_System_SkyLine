import uuid
from datetime import timedelta, date, time
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Club, ClubMembership
from volunteers.models import Event, VolunteerApplication, VolunteerAssignment, Certificate, Announcement, Ticket
from finance.models import Transaction, ReimbursementRequest, Payment, MerchandiseProduct, MerchandiseOrder


class Command(BaseCommand):
    help = 'Purges dummy/test data and seeds relevant, high-quality production-grade data for Skyline Student Organization System.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('=== Starting Skyline Data Cleanup & Professional Seeding ==='))

        today = timezone.now().date()

        # ====================================================================
        # 1. PURGE DUMMY / TEST / PLACEHOLDER DATA
        # ====================================================================
        self.stdout.write('Purging placeholder and dummy records...')

        # Remove dummy test users (e.g. abc, xyz)
        dummy_users = User.objects.filter(email__in=['24dit010@charusat.edu.in', '24dit009@charusat.edu.in'])
        for du in dummy_users:
            self.stdout.write(f'  - Deleting dummy user: {du.email} ({du.full_name})')
            du.delete()

        # Remove test announcements (e.g. "meet for SGP")
        dummy_announcements = Announcement.objects.filter(title__icontains='meet for sgp')
        for da in dummy_announcements:
            self.stdout.write(f'  - Deleting dummy announcement: {da.title}')
            da.delete()

        # Remove test/dummy events (e.g. "Youth fest", duplicate "Tech Career & Networking Night", etc.)
        dummy_events = Event.objects.filter(title__in=[
            'Youth fest',
            'Tech Career & Networking Night',
            'SkyLine Annual Hackathon 2026',
            'SkyLine Annual Robotics Showcase 2026',
            'Full-Stack Web3 & Cloud Hackathon',
            'Career & Industry Networking Night',
            'Hands-on Microcontroller & IoT Workshop'
        ])
        for de in dummy_events:
            self.stdout.write(f'  - Deleting dummy/duplicate event: {de.title}')
            # Clean up tickets and applications linked to this event first if any
            Ticket.objects.filter(event=de).delete()
            VolunteerApplication.objects.filter(event=de).delete()
            VolunteerAssignment.objects.filter(event=de).delete()
            de.delete()

        # ====================================================================
        # 2. SEED SYSTEM ADMINISTRATORS & OFFICERS
        # ====================================================================
        self.stdout.write('Configuring system administrators and officers...')

        admin, _ = User.objects.get_or_create(
            email='admin@studentorg.edu',
            defaults={
                'full_name': 'Dr. Alexander Vance',
                'student_id': 'FAC-2026-1049',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        admin.full_name = 'Dr. Alexander Vance'
        admin.role = User.Role.ADMIN
        admin.set_password('AdminPassword123!')
        admin.save()

        demo_admin, _ = User.objects.get_or_create(
            email='admin@university.edu',
            defaults={
                'full_name': 'Dr. Alexander Vance',
                'student_id': 'FAC-2026-1049',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        demo_admin.full_name = 'Dr. Alexander Vance'
        demo_admin.role = User.Role.ADMIN
        demo_admin.set_password('password123')
        demo_admin.save()

        treasurer, _ = User.objects.get_or_create(
            email='treasurer@treasurer.gmail.com',
            defaults={
                'full_name': 'Marcus Vance',
                'student_id': 'STU-2026-4419',
                'role': User.Role.TREASURER,
                'is_staff': False,
                'is_active': True,
            }
        )
        treasurer.full_name = 'Marcus Vance'
        treasurer.role = User.Role.TREASURER
        treasurer.set_password('TreasurerPassword123!')
        treasurer.save()

        # Update yug user if present to have clean profile
        yug_admin = User.objects.filter(email='yug@gmail.com').first()
        if yug_admin:
            yug_admin.full_name = 'Yug Patel'
            yug_admin.save()

        yug_student = User.objects.filter(email='24dit005@charusat.edu.in').first()
        if yug_student:
            yug_student.full_name = 'Yug Patel'
            yug_student.student_id = 'STU-2026-9901'
            yug_student.role = User.Role.MEMBER
            yug_student.membership_status = User.MembershipStatus.ACTIVE
            yug_student.membership_type = User.MembershipType.ANNUAL
            yug_student.membership_start_date = today - timedelta(days=30)
            yug_student.membership_end_date = today + timedelta(days=335)
            yug_student.save()

        # ====================================================================
        # 3. SEED CAMPUS CLUBS
        # ====================================================================
        self.stdout.write('Seeding Skyline campus clubs...')

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
                    '50% discount on all campus flagship technical showcase tickets',
                    'Direct access to Turing Quad Robotics Lab & 3D Printing suite',
                    'Certified Academic Volunteer & Technical Service Hours',
                    'Subsidized components budget for approved student hardware projects',
                    'Exclusive Skyline club crest apparel and discount at merch store'
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
                    'Free admission to Career & Industry Networking Gala (Save ₹150)',
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

        # ====================================================================
        # 4. SEED STUDENTS & ACTIVE CLUB MEMBERSHIPS
        # ====================================================================
        self.stdout.write('Seeding student profiles and memberships...')

        students_info = [
            {
                'email': 'student@university.edu',
                'full_name': 'Sophia Montgomery',
                'student_id': 'STU-2026-101',
                'role': User.Role.STUDENT,
                'password': 'password123',
                'membership_status': User.MembershipStatus.ACTIVE,
                'membership_type': User.MembershipType.ANNUAL,
                'start_date': today - timedelta(days=60),
                'end_date': today + timedelta(days=305),
                'club_id': 'club-robotics'
            },
            {
                'email': 'alex.rivera@studentorg.edu',
                'full_name': 'Alex Rivera',
                'student_id': 'STU-2026-102',
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
                'student_id': 'STU-2026-103',
                'role': User.Role.STUDENT,
                'password': 'MemberPassword123!',
                'membership_status': User.MembershipStatus.ACTIVE,
                'membership_type': User.MembershipType.ANNUAL,
                'start_date': today - timedelta(days=45),
                'end_date': today + timedelta(days=320),
                'club_id': 'club-robotics'
            },
            {
                'email': 'jordan.taylor@studentorg.edu',
                'full_name': 'Jordan Taylor',
                'student_id': 'STU-2026-104',
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
                'student_id': 'STU-2026-105',
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
            stu.full_name = sinfo['full_name']
            stu.student_id = sinfo['student_id']
            stu.set_password(sinfo['password'])
            stu.membership_status = sinfo['membership_status']
            stu.membership_type = sinfo['membership_type']
            stu.membership_start_date = sinfo['start_date']
            stu.membership_end_date = sinfo['end_date']
            stu.save()
            created_students[sinfo['email']] = stu

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

        # ====================================================================
        # 5. SEED CURATED SKYLINE EVENTS
        # ====================================================================
        self.stdout.write('Seeding curated Skyline events...')

        # Event 1: Flagship Showcase (Future)
        event_robotics, _ = Event.objects.update_or_create(
            title='Skyline Annual Robotics & Autonomous Systems Showcase 2026',
            defaults={
                'description': 'High-energy demonstration of autonomous rovers, drone swarms, humanoid robotics, and edge AI vision systems developed by student engineering squads. Featuring guest technology keynotes and innovation awards.',
                'event_type': Event.EventType.FLAGSHIP,
                'venue': 'Grand Hall, Turing Science Quad',
                'date': today + timedelta(days=18),
                'start_time': time(14, 0),
                'end_time': time(18, 0),
                'capacity': 250,
                'ticket_price': 200.00,
                'non_member_ticket_price': 200.00,
                'member_ticket_price': 100.00,
                'image': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 12,
                'volunteer_deadline': today + timedelta(days=15),
                'volunteer_roles_required': 'Registration Desk, Technical Support, Hospitality, Stage Management, Media Team',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        # Event 2: Hackathon (Future)
        event_hackathon, _ = Event.objects.update_or_create(
            title='Skyline 24-Hour Inter-Collegiate AI & Cloud Hackathon',
            defaults={
                'description': '24-hour sprint building AI agents, cloud architectures, and developer tooling. Free cloud credits, mentor guidance, and ₹1,00,000 in grand prize pool for top student solutions.',
                'event_type': Event.EventType.HACKATHON,
                'venue': 'Innovation Center - Level 4 Tech Hub',
                'date': today + timedelta(days=32),
                'start_time': time(9, 0),
                'end_time': time(21, 0),
                'capacity': 150,
                'ticket_price': 300.00,
                'non_member_ticket_price': 300.00,
                'member_ticket_price': 150.00,
                'image': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 10,
                'volunteer_deadline': today + timedelta(days=28),
                'volunteer_roles_required': 'Hackathon Mentor, Check-in Coordinator, Hardware Desk, Refreshment Crew',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        # Event 3: Networking Gala (Future)
        event_gala, _ = Event.objects.update_or_create(
            title='Skyline Tech & Corporate Leadership Networking Gala',
            defaults={
                'description': 'Connect directly with senior technology directors, engineering managers, alumni founders, and recruitment teams. Includes dinner, portfolio feedback, and professional headshot booth.',
                'event_type': Event.EventType.NETWORKING,
                'venue': 'Student Union Grand Ballroom',
                'date': today + timedelta(days=45),
                'start_time': time(17, 30),
                'end_time': time(21, 0),
                'capacity': 200,
                'ticket_price': 250.00,
                'non_member_ticket_price': 250.00,
                'member_ticket_price': 100.00,
                'image': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 8,
                'volunteer_deadline': today + timedelta(days=40),
                'volunteer_roles_required': 'Guest Reception, Registration Desk, Executive Escort, Audio-Visual Coordinator',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        # Event 4: Arts & Cultural Festival (Future)
        event_cultural, _ = Event.objects.update_or_create(
            title='Skyline Horizon Campus Arts & Cultural Festival',
            defaults={
                'description': 'Annual student festival featuring musical performances, dance competitions, live art installations, student organization kiosks, food trucks, and evening light show.',
                'event_type': Event.EventType.SOCIAL,
                'venue': 'Fine Arts Amphitheater & Plaza',
                'date': today + timedelta(days=58),
                'start_time': time(16, 0),
                'end_time': time(22, 0),
                'capacity': 350,
                'ticket_price': 200.00,
                'non_member_ticket_price': 200.00,
                'member_ticket_price': 100.00,
                'image': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 15,
                'volunteer_deadline': today + timedelta(days=52),
                'volunteer_roles_required': 'Stage Management, Crowd Operations, Photography Team, Artist Liaison',
                'status': Event.Status.PUBLISHED,
                'created_by': admin,
            }
        )

        # Event 5: Completed Workshop (Past)
        event_workshop, _ = Event.objects.update_or_create(
            title='Hands-on Embedded Systems & IoT Masterclass',
            defaults={
                'description': 'Practical laboratory building ESP32 microcontroller nodes with MQTT telemetry. All participants built connected hardware prototypes and received verified digital credentials.',
                'event_type': Event.EventType.WORKSHOP,
                'venue': 'Makerspace Suite 108',
                'date': today - timedelta(days=14),
                'start_time': time(10, 0),
                'end_time': time(14, 0),
                'capacity': 60,
                'ticket_price': 100.00,
                'non_member_ticket_price': 100.00,
                'member_ticket_price': 50.00,
                'image': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
                'volunteers_required': True,
                'volunteer_count_required': 4,
                'volunteer_deadline': today - timedelta(days=18),
                'volunteer_roles_required': 'Lab Assistant, Hardware Inventory, Check-in Coordinator',
                'status': Event.Status.COMPLETED,
                'created_by': admin,
            }
        )

        # ====================================================================
        # 6. SEED MERCHANDISE PRODUCTS
        # ====================================================================
        self.stdout.write('Seeding official Skyline merchandise catalog...')

        merch_products = [
            {
                'id': 'mch-101',
                'name': 'Skyline SSA Heavyweight Crest Hoodie',
                'type': 'Hoodie',
                'category': 'Hoodies',
                'regular_price': 1000.00,
                'member_price': 800.00,
                'tag': 'Official Skyline',
                'description': 'Collegiate heavyweight fleece hoodie with embroidered Skyline Student Association crest, warm front pouch pocket, and ribbed cuffs.',
                'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'S': 12, 'M': 24, 'L': 18, 'XL': 8, '2XL': 4},
                'is_active': True,
            },
            {
                'id': 'mch-102',
                'name': 'Skyline Club Signature Cotton T-Shirt',
                'type': 'T-Shirt',
                'category': 'T-Shirts',
                'regular_price': 500.00,
                'member_price': 350.00,
                'tag': 'Bestseller',
                'description': '100% ring-spun organic cotton breathable T-shirt featuring the Skyline modern club emblem on the chest and athletic fit.',
                'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'XS': 6, 'S': 20, 'M': 35, 'L': 25, 'XL': 15, '2XL': 8},
                'is_active': True,
            },
            {
                'id': 'mch-103',
                'name': 'Skyline Athletic Zip-Up Tech Hoodie',
                'type': 'Hoodie',
                'category': 'Hoodies',
                'regular_price': 1200.00,
                'member_price': 950.00,
                'tag': 'New Release',
                'description': 'Performance stretch thermal zip-up hoodie with Skyline Association badge, zippered phone pocket, and athletic drawstrings.',
                'image': 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'S': 8, 'M': 16, 'L': 14, 'XL': 5, '2XL': 2},
                'is_active': True,
            },
            {
                'id': 'mch-104',
                'name': 'Skyline Vintage Campus Graphic T-Shirt',
                'type': 'T-Shirt',
                'category': 'T-Shirts',
                'regular_price': 600.00,
                'member_price': 450.00,
                'tag': 'Limited Edition',
                'description': 'Vintage washed relaxed-fit graphic tee celebrating the Skyline student society community with retro collegiate typography.',
                'image': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'S': 10, 'M': 30, 'L': 24, 'XL': 12, '2XL': 3},
                'is_active': True,
            },
            {
                'id': 'mch-105',
                'name': 'Skyline Double-Walled Thermal Travel Tumbler',
                'type': 'Accessories',
                'category': 'Drinkware',
                'regular_price': 750.00,
                'member_price': 550.00,
                'tag': 'Eco-Friendly',
                'description': 'Matte-finish 500ml food-grade stainless steel vacuum tumbler with laser-engraved Skyline crest. Keeps drinks hot for 12h or cold for 24h.',
                'image': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'Standard': 50},
                'is_active': True,
            },
            {
                'id': 'mch-106',
                'name': 'Skyline Commuter Water-Resistant Tech Backpack',
                'type': 'Gear',
                'category': 'Bags',
                'regular_price': 1800.00,
                'member_price': 1400.00,
                'tag': 'Premium',
                'description': 'Durable ballistic nylon backpack with 16-inch padded laptop sleeve, waterproof zippers, hidden passport pocket, and Skyline metal insignia.',
                'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
                'size_stock': {'OneSize': 30},
                'is_active': True,
            }
        ]

        for mdata in merch_products:
            MerchandiseProduct.objects.update_or_create(
                id=mdata['id'],
                defaults=mdata
            )

        # ====================================================================
        # 7. SEED ANNOUNCEMENTS
        # ====================================================================
        self.stdout.write('Seeding official Skyline announcements...')

        # Clean existing announcements to replace with high quality ones
        Announcement.objects.all().delete()

        announcements = [
            {
                'title': 'Academic Year 2026–2027: Club Enrollments & Membership Portal Open',
                'content': 'Welcome back! All students can now enroll in semester or annual club memberships to unlock 50% discount on event passes, exclusive merchandise pricing, 24/7 maker lab access, and certified volunteer leadership credits.',
                'category': 'Membership Notice',
                'priority': 'Important',
                'status': Announcement.Status.SENT,
                'author': 'Dr. Alexander Vance (Faculty Advisor)',
                'pinned': True,
                'sent_date': today - timedelta(days=5),
                'created_by': admin,
            },
            {
                'title': 'Volunteer Recruitment: Skyline Annual Robotics & Autonomous Showcase',
                'content': 'Student volunteers are needed for our flagship showcase on November 15. Roles include Registration Desk, Technical Support, Hospitality, and Stage Management. Volunteers receive formal certificates and service hours.',
                'category': 'Volunteer',
                'priority': 'Important',
                'status': Announcement.Status.SENT,
                'author': 'Marcus Vance (Treasurer & Operations)',
                'pinned': True,
                'sent_date': today - timedelta(days=2),
                'created_by': admin,
            },
            {
                'title': 'University Student Council: Annual Budget Grant Allocation Ratified',
                'content': 'The Student Affairs Council has approved our ₹1,50,000 annual budget grant for technology workshops, inter-collegiate hackathon sponsorships, and community STEM initiatives across campus clubs.',
                'category': 'Finance & Grants',
                'priority': 'General',
                'status': Announcement.Status.SENT,
                'author': 'Marcus Vance (Treasurer)',
                'pinned': False,
                'sent_date': today - timedelta(days=10),
                'created_by': admin,
            },
            {
                'title': 'Official Skyline Heritage Hoodies & Apparel Collection Released',
                'content': 'The new collection of official Skyline heavyweight fleece hoodies, organic cotton tees, and commuter backpacks is now live in the Merchandise Store with special member pricing.',
                'category': 'General',
                'priority': 'General',
                'status': Announcement.Status.SENT,
                'author': 'Student Association Executive Board',
                'pinned': False,
                'sent_date': today - timedelta(days=7),
                'created_by': admin,
            }
        ]

        for adata in announcements:
            Announcement.objects.create(**adata)

        # ====================================================================
        # 8. SEED TICKETS WITH VALID VERIFIED QR URLS
        # ====================================================================
        self.stdout.write('Seeding verified admission tickets...')

        # Clean existing tickets
        Ticket.objects.all().delete()

        student_sophia = created_students.get('student@university.edu')
        student_alex = created_students.get('alex.rivera@studentorg.edu')

        if student_sophia:
            ticket_uuid_1 = uuid.uuid4()
            Ticket.objects.create(
                ticket_id=f"TCK-2026-{uuid.uuid4().hex[:6].upper()}",
                ticket_uuid=ticket_uuid_1,
                qr_token=f"https://localhost:8000/tickets/verify/{ticket_uuid_1}",
                student=student_sophia,
                event=event_robotics,
                tier='Member Pass',
                price_paid=100.00,
                seat='Section A • Row 2, Seat #14',
                status=Ticket.Status.CONFIRMED
            )

        if student_alex:
            ticket_uuid_2 = uuid.uuid4()
            Ticket.objects.create(
                ticket_id=f"TCK-2026-{uuid.uuid4().hex[:6].upper()}",
                ticket_uuid=ticket_uuid_2,
                qr_token=f"https://localhost:8000/tickets/verify/{ticket_uuid_2}",
                student=student_alex,
                event=event_hackathon,
                tier='Member Pass',
                price_paid=150.00,
                seat='Team Workstation #12',
                status=Ticket.Status.CONFIRMED
            )

        if yug_student:
            ticket_uuid_3 = uuid.uuid4()
            Ticket.objects.create(
                ticket_id=f"TCK-2026-{uuid.uuid4().hex[:6].upper()}",
                ticket_uuid=ticket_uuid_3,
                qr_token=f"https://localhost:8000/tickets/verify/{ticket_uuid_3}",
                student=yug_student,
                event=event_robotics,
                tier='Member Pass',
                price_paid=100.00,
                seat='Section B • Row 4, Seat #08',
                status=Ticket.Status.CONFIRMED
            )

        # ====================================================================
        # 9. SEED VOLUNTEER APPLICATIONS, ASSIGNMENTS & CERTIFICATES
        # ====================================================================
        self.stdout.write('Seeding volunteer applications, assignments, and certificates...')

        VolunteerApplication.objects.all().delete()
        VolunteerAssignment.objects.all().delete()
        Certificate.objects.all().delete()

        # Application 1: Sophia for Robotics Showcase (Approved)
        if student_sophia:
            app1 = VolunteerApplication.objects.create(
                student=student_sophia,
                event=event_robotics,
                preferred_role='Registration Desk',
                reason='Experienced in managing event guest registries and student credentials.',
                experience='Volunteered at regional robotics league for 2 seasons.',
                status=VolunteerApplication.Status.APPROVED,
                applied_at=timezone.now() - timedelta(days=3),
                reviewed_by=admin,
                reviewed_at=timezone.now() - timedelta(days=2),
                admin_feedback='Approved. Assigned to Lead Registration Coordinator.'
            )
            VolunteerAssignment.objects.create(
                application=app1,
                student=student_sophia,
                event=event_robotics,
                assigned_role='Lead Registration Coordinator',
                duration='4 Hours',
                notes='Report to Grand Hall foyer at 1:00 PM for badge and scanner equipment check.',
                status=VolunteerAssignment.Status.ACTIVE,
                approved_at=timezone.now() - timedelta(days=2)
            )

        # Application 2: Alex for Hackathon (Pending)
        if student_alex:
            VolunteerApplication.objects.create(
                student=student_alex,
                event=event_hackathon,
                preferred_role='Hackathon Mentor',
                reason='Senior CS student passionate about helping beginner teams debug REST APIs and Docker deployments.',
                experience='Built 3 full-stack hackathon projects.',
                status=VolunteerApplication.Status.PENDING,
                applied_at=timezone.now() - timedelta(days=1)
            )

        # Application 3: Sarah Chen for Past Workshop (Completed with Certificate)
        student_sarah = created_students.get('sarah.chen@studentorg.edu')
        if student_sarah:
            app3 = VolunteerApplication.objects.create(
                student=student_sarah,
                event=event_workshop,
                preferred_role='Lab Assistant',
                reason='Assisted students with breadboard wiring and firmware flashing.',
                status=VolunteerApplication.Status.APPROVED,
                applied_at=timezone.now() - timedelta(days=20),
                reviewed_by=admin,
                reviewed_at=timezone.now() - timedelta(days=19),
                admin_feedback='Approved and successfully completed.'
            )
            asg3 = VolunteerAssignment.objects.create(
                application=app3,
                student=student_sarah,
                event=event_workshop,
                assigned_role='Lab Technical Assistant',
                duration='4 Hours',
                notes='Excellent performance assisting attendees with sensor wiring.',
                status=VolunteerAssignment.Status.COMPLETED,
                approved_at=timezone.now() - timedelta(days=19),
                completed_at=timezone.now() - timedelta(days=14)
            )
            Certificate.objects.create(
                student=student_sarah,
                event=event_workshop,
                assignment=asg3,
                volunteer_role='Lab Technical Assistant',
                duration='4 Hours',
                issue_date=today - timedelta(days=13),
                verification_hash=uuid.uuid4().hex[:16].upper()
            )

        # ====================================================================
        # 10. SEED FINANCIAL TRANSACTIONS & REIMBURSEMENTS
        # ====================================================================
        self.stdout.write('Seeding realistic financial ledger transactions...')

        Transaction.objects.all().delete()
        Payment.objects.all().delete()

        transactions_data = [
            {
                'transaction_id': f"TXN-INC-{uuid.uuid4().hex[:8].upper()}",
                'title': 'University Student Affairs Annual Grant 2026–2027',
                'amount': 150000.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.OTHER,
                'description': 'Annual ratified operating and technical budget grant from University Council.',
                'party_name': 'University Office of Student Affairs',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=25),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-INC-{uuid.uuid4().hex[:8].upper()}",
                'title': 'Student Club Annual Membership Registrations (Batch 1)',
                'amount': 24950.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.MEMBERSHIP_FEE,
                'description': 'Aggregated annual membership fees for 50 student enrollments.',
                'party_name': 'Campus Bursar Student Portal',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=15),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-INC-{uuid.uuid4().hex[:8].upper()}",
                'title': 'Corporate Main Stage Sponsorship - AI Cloud Hackathon',
                'amount': 50000.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.SPONSORSHIP,
                'description': 'Platinum sponsor grant for inter-collegiate hackathon student prize pool.',
                'party_name': 'Apex Cloud Solutions Inc.',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=8),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-INC-{uuid.uuid4().hex[:8].upper()}",
                'title': 'Official Collegiate Apparel & Hoodie Presales',
                'amount': 18500.00,
                'transaction_type': Transaction.Type.INCOME,
                'category': Transaction.Category.MERCHANDISE,
                'description': 'Batch 1 store pre-orders for embroidered heavyweight crest hoodies.',
                'party_name': 'Skyline Merch Store',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=4),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-EXP-{uuid.uuid4().hex[:8].upper()}",
                'title': 'Grand Hall Audiovisual & Lighting Rigging Rental',
                'amount': 18000.00,
                'transaction_type': Transaction.Type.EXPENSE,
                'category': Transaction.Category.EVENT_EXPENSE,
                'description': 'High-definition laser projectors, stage trussing, and audio system rental for Robotics Showcase.',
                'party_name': 'Campus Pro AV Services',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=6),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-EXP-{uuid.uuid4().hex[:8].upper()}",
                'title': 'ESP32 Microcontroller Dev Boards & Sensor Kits',
                'amount': 12500.00,
                'transaction_type': Transaction.Type.EXPENSE,
                'category': Transaction.Category.OPERATIONAL,
                'description': '60 hardware development kits with environmental sensors for IoT Masterclass.',
                'party_name': 'RoboLab Component Supplies Ltd.',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=16),
                'recorded_by': treasurer
            },
            {
                'transaction_id': f"TXN-EXP-{uuid.uuid4().hex[:8].upper()}",
                'title': 'Apparel Batch 1 Screen Printing & Embroidery Production',
                'amount': 22000.00,
                'transaction_type': Transaction.Type.EXPENSE,
                'category': Transaction.Category.MERCHANDISE,
                'description': 'Manufacturing and crest embroidery for 100 hoodies and 150 signature t-shirts.',
                'party_name': 'Campus Textile & Merch Press',
                'status': Transaction.Status.PAID,
                'date': today - timedelta(days=9),
                'recorded_by': treasurer
            }
        ]

        for tdata in transactions_data:
            Transaction.objects.create(**tdata)

        self.stdout.write(self.style.SUCCESS('\n=== Successfully Purged Dummy Data and Seeded Relevant Skyline Database! ===\n'))
