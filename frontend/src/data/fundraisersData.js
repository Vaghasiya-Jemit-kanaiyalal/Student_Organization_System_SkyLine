/**
 * Initial Fundraisers Mock Data for Skyline Student Organization System
 * Realistic SaaS administration records matching user specifications.
 */

export const INITIAL_FUNDRAISERS = [
  {
    id: 'fnd-1',
    title: 'Annual Charity Drive',
    description: 'Campus Food Drive and community winter care package initiative in partnership with local food banks.',
    category: 'Community Charity',
    goal: 5000,
    raised: 3750,
    startDate: '2026-09-15',
    endDate: '2026-10-25',
    status: 'Active',
    onTrack: true,
    contributions: [
      { id: 'c-101', donor: 'Campus Alumni Network', amount: 1500, date: '2026-09-20', method: 'Direct Bank Transfer', receipt: 'REC-ALM-101' },
      { id: 'c-102', donor: 'Student Senate Civic Fund', amount: 1000, date: '2026-09-28', method: 'Senate Grant', receipt: 'REC-SNT-102' },
      { id: 'c-103', donor: 'Engineering Faculty Club', amount: 750, date: '2026-10-01', method: 'Credit Card', receipt: 'REC-FAC-103' },
      { id: 'c-104', donor: 'Anonymous Student Micro-donations', amount: 500, date: '2026-10-02', method: 'Cash / Venmo Box', receipt: 'REC-STD-104' },
    ],
    tasks: [
      { id: 't-1', title: 'Contact Sponsors', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-10-10', status: 'Completed' },
      { id: 't-2', title: 'Arrange Venue & Loading Bay', volunteer: 'Priya Patel', volunteerEmail: 'priya.p@university.edu', studentId: 'STU-2026-7832', dueDate: '2026-10-12', status: 'In Progress' },
      { id: 't-3', title: 'Promotional Material & Flyers', volunteer: 'Jay Verma', volunteerEmail: 'jay.v@university.edu', studentId: 'STU-2026-4401', dueDate: '2026-10-14', status: 'Pending' },
      { id: 't-4', title: 'Coordinate Collection Bins at Dorms', volunteer: 'Elena Rostova', volunteerEmail: 'elena.r@university.edu', studentId: 'STU-2026-3021', dueDate: '2026-10-08', status: 'Completed' },
      { id: 't-5', title: 'Digital Social Media Campaign', volunteer: 'Sophia Montgomery', volunteerEmail: 's.montgomery@university.edu', studentId: 'STU-2026-8842', dueDate: '2026-10-05', status: 'Completed' },
      { id: 't-6', title: 'Volunteer Shift Schedule Allocation', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-10-09', status: 'Completed' },
      { id: 't-7', title: 'Faculty Association Outreach', volunteer: 'Julian Vance', volunteerEmail: 'julian.v@university.edu', studentId: 'STU-2026-1049', dueDate: '2026-10-04', status: 'Completed' },
      { id: 't-8', title: 'Safety & Hygiene Protocol Checklist', volunteer: 'Priya Patel', volunteerEmail: 'priya.p@university.edu', studentId: 'STU-2026-7832', dueDate: '2026-10-07', status: 'Completed' },
      { id: 't-9', title: 'Transportation Van Booking', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-10-06', status: 'Completed' },
      { id: 't-10', title: 'Post-Drive Donor Acknowledgment Letters', volunteer: 'Jay Verma', volunteerEmail: 'jay.v@university.edu', studentId: 'STU-2026-4401', dueDate: '2026-10-24', status: 'Pending' },
    ]
  },
  {
    id: 'fnd-2',
    title: 'Student Cultural Fest Fundraiser',
    description: 'Event sponsorship, merchandise stalls, and campus community donations for the annual multicultural gala.',
    category: 'Cultural Events',
    goal: 10000,
    raised: 4200,
    startDate: '2026-09-01',
    endDate: '2026-11-15',
    status: 'Active',
    onTrack: true,
    contributions: [
      { id: 'c-201', donor: 'Metropolitan Arts Foundation', amount: 2000, date: '2026-09-12', method: 'Sponsorship Grant', receipt: 'REC-ART-201' },
      { id: 'c-202', donor: 'Campus Bookshop Corporate Match', amount: 1200, date: '2026-09-22', method: 'Corporate Match', receipt: 'REC-BKS-202' },
      { id: 'c-203', donor: 'Alumni Cultural Council', amount: 1000, date: '2026-10-01', method: 'Direct Bank Transfer', receipt: 'REC-CUL-203' }
    ],
    tasks: [
      { id: 't-201', title: 'Corporate Title Sponsorship Pitch', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-09-25', status: 'Completed' },
      { id: 't-202', title: 'Local Restaurant Catering Partnership', volunteer: 'Priya Patel', volunteerEmail: 'priya.p@university.edu', studentId: 'STU-2026-7832', dueDate: '2026-10-02', status: 'Completed' },
      { id: 't-203', title: 'Sound & Lighting Rig Quotations', volunteer: 'Julian Vance', volunteerEmail: 'julian.v@university.edu', studentId: 'STU-2026-1049', dueDate: '2026-10-05', status: 'Completed' },
      { id: 't-204', title: 'Print Festival Badges & Passes', volunteer: 'Jay Verma', volunteerEmail: 'jay.v@university.edu', studentId: 'STU-2026-4401', dueDate: '2026-10-08', status: 'Completed' },
      { id: 't-205', title: 'Artist Honorarium Invoices Verification', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-10-11', status: 'Completed' },
      { id: 't-206', title: 'Security & Campus Police Liaison', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-10-18', status: 'In Progress' },
      { id: 't-207', title: 'Merchandise Booth Logistics', volunteer: 'Sophia Montgomery', volunteerEmail: 's.montgomery@university.edu', studentId: 'STU-2026-8842', dueDate: '2026-10-20', status: 'In Progress' },
      { id: 't-208', title: 'Raffle Ticket Printing & Regulatory Permit', volunteer: 'Priya Patel', volunteerEmail: 'priya.p@university.edu', studentId: 'STU-2026-7832', dueDate: '2026-10-22', status: 'Pending' },
      { id: 't-209', title: 'Photography & Videography Crew Schedule', volunteer: 'Jay Verma', volunteerEmail: 'jay.v@university.edu', studentId: 'STU-2026-4401', dueDate: '2026-10-25', status: 'Pending' },
      { id: 't-210', title: 'VIP Guest Seating Coordination', volunteer: 'Elena Rostova', volunteerEmail: 'elena.r@university.edu', studentId: 'STU-2026-3021', dueDate: '2026-10-28', status: 'Pending' },
      { id: 't-211', title: 'Social Media Live Stream Setup', volunteer: 'Sophia Montgomery', volunteerEmail: 's.montgomery@university.edu', studentId: 'STU-2026-8842', dueDate: '2026-10-30', status: 'Pending' },
      { id: 't-212', title: 'Final Financial Reconciliation Pack', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-11-16', status: 'Pending' }
    ]
  },
  {
    id: 'fnd-3',
    title: 'Robotics Regional Championship Travel',
    description: 'Travel stipends, freight crates for autonomous quadcopters, and lodging for the Midwest Collegiate Finals.',
    category: 'Competition & Travel',
    goal: 6000,
    raised: 4800,
    startDate: '2026-08-20',
    endDate: '2026-10-18',
    status: 'Active',
    onTrack: true,
    contributions: [
      { id: 'c-301', donor: 'Dean STEM Innovation Grant', amount: 2500, date: '2026-08-28', method: 'Institutional Grant', receipt: 'REC-DEAN-301' },
      { id: 'c-302', donor: 'Skyline Alumni In Tech', amount: 1500, date: '2026-09-15', method: 'Direct Bank Transfer', receipt: 'REC-ALM-302' },
      { id: 'c-303', donor: 'Department Robotics Lab Match', amount: 800, date: '2026-09-29', method: 'Department Transfer', receipt: 'REC-LAB-303' }
    ],
    tasks: [
      { id: 't-301', title: 'Book Airline Group Reservation', volunteer: 'Julian Vance', volunteerEmail: 'julian.v@university.edu', studentId: 'STU-2026-1049', dueDate: '2026-09-05', status: 'Completed' },
      { id: 't-302', title: 'Submit University Travel Liability Forms', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-09-12', status: 'Completed' },
      { id: 't-303', title: 'Assemble Lithium Battery Shipping Enclosures', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-09-20', status: 'Completed' },
      { id: 't-304', title: 'Reserve Cargo Van in Chicago', volunteer: 'Priya Patel', volunteerEmail: 'priya.p@university.edu', studentId: 'STU-2026-7832', dueDate: '2026-09-25', status: 'Completed' },
      { id: 't-305', title: 'Team Branded Tracksuits & Gear Handout', volunteer: 'Sophia Montgomery', volunteerEmail: 's.montgomery@university.edu', studentId: 'STU-2026-8842', dueDate: '2026-10-02', status: 'Completed' },
      { id: 't-306', title: 'Emergency Contact Directory Dispatch', volunteer: 'Elena Rostova', volunteerEmail: 'elena.r@university.edu', studentId: 'STU-2026-3021', dueDate: '2026-10-06', status: 'Completed' },
      { id: 't-307', title: 'Post-Championship Receipts Audit', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-10-22', status: 'In Progress' }
    ]
  },
  {
    id: 'fnd-4',
    title: 'Autonomous AI Hardware Lab Gear Fund',
    description: 'Procuring NVIDIA Jetson Orin edge computing kits, LiDAR sensory units, and soldering testbenches for student labs.',
    category: 'Lab Equipment',
    goal: 3500,
    raised: 3500,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Completed',
    onTrack: true,
    contributions: [
      { id: 'c-401', donor: 'Silicon Valley Alumni Guild', amount: 2000, date: '2026-07-15', method: 'Direct Bank Transfer', receipt: 'REC-SVAL-401' },
      { id: 'c-402', donor: 'Robotics Department Seed Fund', amount: 1500, date: '2026-08-01', method: 'Institutional Grant', receipt: 'REC-SEED-402' }
    ],
    tasks: [
      { id: 't-401', title: 'Vendor Price Comparison Spreadsheet', volunteer: 'Julian Vance', volunteerEmail: 'julian.v@university.edu', studentId: 'STU-2026-1049', dueDate: '2026-07-10', status: 'Completed' },
      { id: 't-402', title: 'Faculty Lab Safety Officer Clearance', volunteer: 'Elena Rostova', volunteerEmail: 'elena.r@university.edu', studentId: 'STU-2026-3021', dueDate: '2026-07-20', status: 'Completed' },
      { id: 't-403', title: 'Execute Hardware Purchase Orders', volunteer: 'Marcus Sterling', volunteerEmail: 'm.sterling@university.edu', studentId: 'STU-2026-4419', dueDate: '2026-08-05', status: 'Completed' },
      { id: 't-404', title: 'Asset Tagging & Serial Number Registry', volunteer: 'Rahul Sharma', volunteerEmail: 'rahul.s@university.edu', studentId: 'STU-2026-5120', dueDate: '2026-08-25', status: 'Completed' }
    ]
  }
];

export const VOLUNTEER_ROSTER_OPTIONS = [
  { name: 'Rahul Sharma', email: 'rahul.s@university.edu', studentId: 'STU-2026-5120' },
  { name: 'Priya Patel', email: 'priya.p@university.edu', studentId: 'STU-2026-7832' },
  { name: 'Jay Verma', email: 'jay.v@university.edu', studentId: 'STU-2026-4401' },
  { name: 'Elena Rostova', email: 'elena.r@university.edu', studentId: 'STU-2026-3021' },
  { name: 'Sophia Montgomery', email: 's.montgomery@university.edu', studentId: 'STU-2026-8842' },
  { name: 'Marcus Sterling', email: 'm.sterling@university.edu', studentId: 'STU-2026-4419' },
  { name: 'Julian Vance', email: 'julian.v@university.edu', studentId: 'STU-2026-1049' }
];
