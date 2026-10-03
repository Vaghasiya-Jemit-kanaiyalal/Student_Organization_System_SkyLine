/**
 * Mock Data for ConnectU University Student Organization Management System
 * Classical & Modern University Theme
 */

export const INITIAL_USERS = [
  {
    id: 'usr-member-001',
    name: 'Sophia Montgomery',
    studentId: 'STU-2026-8842',
    email: 'student@university.edu',
    password: 'password123', // Demo simplified / validated
    role: 'MEMBER',
    department: 'School of Computer Science & Engineering',
    semester: 'Junior (Year 3)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    joinedDate: 'Sep 12, 2024',
    status: 'ACTIVE',
    memberships: [
      { clubId: 'club-1', clubName: 'Robotics & AI Society', role: 'Active Member', duesPaid: true },
      { clubId: 'club-2', clubName: 'University Debate Union', role: 'Research Lead', duesPaid: true },
      { clubId: 'club-3', clubName: 'Campus Environmental Alliance', role: 'Volunteer', duesPaid: true }
    ],
    volunteerHours: 28,
    ticketsCount: 3
  },
  {
    id: 'usr-admin-001',
    name: 'Dr. Alexander Vance',
    studentId: 'FAC-2026-1049',
    email: 'admin@university.edu',
    password: 'password123',
    role: 'ADMIN',
    department: 'Department of Electrical & Computer Engineering',
    semester: 'Lead Faculty Advisor & Council Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    joinedDate: 'Jan 15, 2022',
    status: 'ACTIVE',
    clubName: 'Robotics & AI Society (Lead Chapter)',
    volunteerHours: 120,
    ticketsCount: 0
  },
  {
    id: 'usr-treasurer-001',
    name: 'Marcus Sterling',
    studentId: 'STU-2026-4419',
    email: 'treasurer@university.edu',
    password: 'password123',
    role: 'TREASURER',
    department: 'School of Business & Finance',
    semester: 'Senior (Year 4)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    joinedDate: 'Aug 20, 2023',
    status: 'ACTIVE',
    clubName: 'Robotics & AI Society',
    volunteerHours: 45,
    ticketsCount: 2
  }
];

export const CAMPUS_EVENTS = [
  {
    id: 'evt-101',
    title: 'Annual Autonomous Robotics Showcase 2026',
    date: 'Oct 14, 2026 • 2:00 PM - 6:00 PM',
    location: 'Grand Hall, Turing Science Quad',
    category: 'Competition & Exhibition',
    organizer: 'Robotics & AI Society',
    attendees: 142,
    capacity: 200,
    price: 'Free for Members',
    badge: 'Flagship Event',
    description: 'Demonstrations of student-built autonomous rovers, drone swarms, and AI vision systems with industry judges.',
    userRsvp: true
  },
  {
    id: 'evt-102',
    title: 'Inter-Collegiate Oxford Debate Championship',
    date: 'Oct 22, 2026 • 5:30 PM - 8:30 PM',
    location: 'Auditorium C, Chancellor Building',
    category: 'Debate & Public Forum',
    organizer: 'University Debate Union',
    attendees: 88,
    capacity: 120,
    price: '$5.00 Public / Free Student',
    badge: 'Open Registration',
    description: 'Quarter-finals debating ethical AI governance and autonomous decision systems.',
    userRsvp: false
  },
  {
    id: 'evt-103',
    title: 'Fall Campus Arboretum Restoration Drive',
    date: 'Nov 02, 2026 • 9:00 AM - 1:00 PM',
    location: 'North Campus Botanical Reserve',
    category: 'Community Service',
    organizer: 'Campus Environmental Alliance',
    attendees: 64,
    capacity: 80,
    price: 'Volunteer Hours: 4h',
    badge: 'Volunteering',
    description: 'Native flora planting, invasive species clearing, and soil sampling for the campus ecological archive.',
    userRsvp: true
  },
  {
    id: 'evt-104',
    title: 'HackConnect 2026: 24h University Hackathon',
    date: 'Nov 18, 2026 • Starts 10:00 AM',
    location: 'Engineering Commons Labs 1-4',
    category: 'Hackathon',
    organizer: 'Robotics & AI Society',
    attendees: 210,
    capacity: 250,
    price: 'Free + Swag Bag',
    badge: 'High Demand',
    description: 'Build open-source solutions for university campus life, mobility, and community management.',
    userRsvp: false
  }
];

export const MEMBER_TICKETS = [
  {
    id: 'TCK-8829-01',
    eventTitle: 'Annual Autonomous Robotics Showcase 2026',
    date: 'Oct 14, 2026 • 2:00 PM',
    venue: 'Grand Hall, Turing Science Quad',
    seat: 'Section A - Academic Pass #42',
    qrCode: 'CONNECTU-ROBOTICS-8829-01-VERIFIED',
    status: 'Confirmed'
  },
  {
    id: 'TCK-8829-02',
    eventTitle: 'Fall Campus Arboretum Restoration Drive',
    date: 'Nov 02, 2026 • 9:00 AM',
    venue: 'North Campus Botanical Reserve',
    seat: 'Volunteer Crew B (Forestry)',
    qrCode: 'CONNECTU-ENVIRO-8829-02-VERIFIED',
    status: 'Confirmed'
  },
  {
    id: 'TCK-8829-03',
    eventTitle: 'HackConnect 2026: Keynote Address & Mixer',
    date: 'Nov 18, 2026 • 10:00 AM',
    venue: 'Engineering Commons Hall',
    seat: 'Hacker Pass #078',
    qrCode: 'CONNECTU-HACK-8829-03-VERIFIED',
    status: 'Confirmed'
  }
];

export const MERCHANDISE_ITEMS = [
  {
    id: 'mch-1',
    name: 'Academic Crest Heavyweight Burgundy Hoodie',
    price: 38.00,
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: 45,
    tag: 'Official Heritage',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mch-2',
    name: 'Embossed Leather Journal & University Gold Pen',
    price: 18.50,
    category: 'Stationery',
    sizes: ['One Size'],
    inStock: 80,
    tag: 'Classic Academic',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mch-3',
    name: 'Robotics Society Laser-Cut Metal Lapel Pin',
    price: 8.00,
    category: 'Accessories',
    sizes: ['Standard'],
    inStock: 120,
    tag: 'Member Collectible',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mch-4',
    name: 'Canvas Field Tote with Gold University Seal',
    price: 15.00,
    category: 'Accessories',
    sizes: ['Standard'],
    inStock: 65,
    tag: 'Eco-Friendly',
    image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&w=400&q=80'
  }
];

export const VOLUNTEER_OPPORTUNITIES = [
  {
    id: 'vol-1',
    title: 'Robotics Showcase Registration Desk Lead',
    date: 'Oct 14, 2026',
    hours: 4,
    slotsLeft: 3,
    department: 'Robotics & AI Society',
    perks: 'Event T-Shirt, Certificate, 4 Service Hours',
    status: 'OPEN'
  },
  {
    id: 'vol-2',
    title: 'Freshman Academic Peer Tutoring (Python/Data Structures)',
    date: 'Weekly Tuesdays',
    hours: 2,
    slotsLeft: 6,
    department: 'School of Engineering',
    perks: 'Academic Honor Roll Mention, Dean Recommendation Letter',
    status: 'OPEN'
  },
  {
    id: 'vol-3',
    title: 'Campus Sustainability Tree Tagging and Mapping',
    date: 'Nov 02, 2026',
    hours: 4,
    slotsLeft: 8,
    department: 'Campus Environmental Alliance',
    perks: 'Botanical Field Credit, 4 Service Hours',
    status: 'OPEN'
  }
];

export const CLUB_MEMBERS_ADMIN = [
  {
    id: 'mem-101',
    name: 'Sophia Montgomery',
    studentId: 'STU-2026-8842',
    email: 'student@university.edu',
    role: 'Member',
    duesStatus: 'PAID',
    attendance: '92%',
    joinDate: 'Sep 12, 2024'
  },
  {
    id: 'mem-102',
    name: 'Marcus Sterling',
    studentId: 'STU-2026-4419',
    email: 'treasurer@university.edu',
    role: 'Treasurer',
    duesStatus: 'PAID',
    attendance: '98%',
    joinDate: 'Aug 20, 2023'
  },
  {
    id: 'mem-103',
    name: 'Ethan Blackwood',
    studentId: 'STU-2026-1184',
    email: 'ethan.b@university.edu',
    role: 'Hardware Team Lead',
    duesStatus: 'PAID',
    attendance: '88%',
    joinDate: 'Jan 10, 2025'
  },
  {
    id: 'mem-104',
    name: 'Elena Rostova',
    studentId: 'STU-2026-6733',
    email: 'elena.r@university.edu',
    role: 'Member',
    duesStatus: 'PENDING',
    attendance: '75%',
    joinDate: 'Feb 02, 2026'
  },
  {
    id: 'mem-105',
    name: 'Julian Chen',
    studentId: 'STU-2026-9021',
    email: 'julian.c@university.edu',
    role: 'Software Sub-team',
    duesStatus: 'PAID',
    attendance: '95%',
    joinDate: 'Oct 05, 2024'
  }
];

export const ANNOUNCEMENTS = [
  {
    id: 'anc-1',
    title: 'University Council Approval: Annual Budget Grant Allocated',
    author: 'Alexander Vance (Faculty Advisor)',
    date: 'Oct 01, 2026',
    priority: 'OFFICIAL',
    content: 'The Office of Student Affairs has officially ratified our $4,500 semester grant for robotics components and regional travel.'
  },
  {
    id: 'anc-2',
    title: 'Call for Volunteer Marshals: Autonomous Robotics Showcase',
    author: 'Executive Committee',
    date: 'Sep 28, 2026',
    priority: 'URGENT',
    content: 'We need 8 additional student volunteers to coordinate guest speakers and registration tables. Earn 4 verified service hours.'
  },
  {
    id: 'anc-3',
    title: 'Fall Semester Dues & New Burgundy Lapel Pins Available',
    author: 'Marcus Sterling (Treasurer)',
    date: 'Sep 20, 2026',
    priority: 'GENERAL',
    content: 'All paid active members can collect their 2026 membership cards and laser-cut lapel pins from the club office.'
  }
];

export const TREASURY_DATA = {
  totalBudget: 14500.00,
  currentBalance: 8345.50,
  totalIncome: 11250.00,
  totalExpenses: 7404.50,
  pendingReimbursementsTotal: 485.00,
  incomes: [
    { id: 'INC-2026-01', source: 'University Student Council Grant', amount: 4500.00, date: 'Oct 01, 2026', category: 'Institutional Grant', status: 'Cleared' },
    { id: 'INC-2026-02', source: 'Fall Semester Member Dues (75 Members)', amount: 2250.00, date: 'Sep 25, 2026', category: 'Membership Fees', status: 'Cleared' },
    { id: 'INC-2026-03', source: 'Robotics Showcase Corporate Sponsorship (TechCorp)', amount: 3000.00, date: 'Sep 18, 2026', category: 'Sponsorship', status: 'Cleared' },
    { id: 'INC-2026-04', source: 'Official Merchandise & Hoodie Presales', amount: 1500.00, date: 'Sep 10, 2026', category: 'Merchandise', status: 'Cleared' }
  ],
  expenses: [
    { id: 'EXP-2026-01', vendor: 'MicroCenter Robotics Supplies', description: 'LiDAR sensors and microcontroller dev boards', amount: 1840.50, date: 'Sep 29, 2026', category: 'Lab Equipment', receipt: 'REC-0929-MC.pdf', status: 'Audited' },
    { id: 'EXP-2026-02', vendor: 'Campus Dining Services', description: 'Catering for 120 students - Welcome Orientation', amount: 920.00, date: 'Sep 15, 2026', category: 'Hospitality', receipt: 'REC-0915-CDS.pdf', status: 'Audited' },
    { id: 'EXP-2026-03', vendor: 'University Print Press', description: 'Academic posters, brochures, and directional banners', amount: 344.00, date: 'Sep 12, 2026', category: 'Marketing', receipt: 'REC-0912-UPP.pdf', status: 'Audited' },
    { id: 'EXP-2026-04', vendor: 'CustomApparel Co.', description: 'Batch 1 Burgundy Embroidered Hoodies & Totes', amount: 2400.00, date: 'Sep 05, 2026', category: 'Inventory', receipt: 'REC-0905-CAC.pdf', status: 'Audited' }
  ],
  reimbursements: [
    { id: 'RMB-101', claimant: 'Julian Chen', studentId: 'STU-2026-9021', item: '3D Printer PLA Filament (5kg Spools)', amount: 115.00, date: 'Oct 02, 2026', status: 'PENDING', receipt: 'Receipt-Amazon-3D.png' },
    { id: 'RMB-102', claimant: 'Sophia Montgomery', studentId: 'STU-2026-8842', item: 'Display Easels and Poster Foam Boards for Showcase', amount: 68.50, date: 'Oct 01, 2026', status: 'PENDING', receipt: 'Receipt-OfficeDepot-44.png' },
    { id: 'RMB-103', claimant: 'Ethan Blackwood', studentId: 'STU-2026-1184', item: 'Emergency Solder Wire & Flux Paste for Hardware Lab', amount: 42.00, date: 'Sep 27, 2026', status: 'APPROVED', receipt: 'Receipt-HardwareStore-09.png' },
    { id: 'RMB-104', claimant: 'Dr. Alexander Vance', studentId: 'FAC-2026-1049', item: 'Guest Keynote Speaker Refreshments & Parking Passes', amount: 120.00, date: 'Sep 24, 2026', status: 'APPROVED', receipt: 'Receipt-CampusParking.png' }
  ]
};
