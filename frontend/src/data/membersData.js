/**
 * ConnectU Member Management Data Module
 * Clean, structured records for All Members, Renewals, and Member Details Modal
 */

export const INITIAL_MEMBERS_DATA = [
  {
    id: 'mem-101',
    name: 'Sophia Montgomery',
    studentId: 'STU-2026-8842',
    email: 's.montgomery@university.edu',
    phone: '+1 (555) 234-8842',
    membershipType: 'Annual',
    membershipStatus: 'Active',
    joinDate: '2024-09-12',
    expiryDate: '2027-09-12',
    totalRenewals: 2,
    lastRenewalDate: '2026-09-10',
    renewalHistory: [
      { id: 'REN-8842-1', renewalDate: '2025-09-10', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-8842.pdf', approvedBy: 'Dr. Alexander Vance' },
      { id: 'REN-8842-2', renewalDate: '2026-09-10', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2026-8842.pdf', approvedBy: 'Dr. Alexander Vance' }
    ],
    eventHistory: [
      { id: 'eh-1', name: 'Annual Autonomous Robotics Showcase 2026', date: 'Oct 14, 2026', role: 'Competitor / Pass #42', checkIn: 'Checked In' },
      { id: 'eh-2', name: 'Inter-Collegiate Oxford Debate Championship', date: 'Oct 22, 2026', role: 'Audience Delegate', checkIn: 'Registered' },
      { id: 'eh-3', name: 'HackConnect 2025 24h Hackathon', date: 'Nov 14, 2025', role: 'Competitor (Track 2 Winner)', checkIn: 'Completed' },
      { id: 'eh-4', name: 'Collegiate AI & Ethics Symposium', date: 'Mar 15, 2025', role: 'Panel Participant', checkIn: 'Completed' }
    ],
    volunteerHistory: [
      { id: 'vh-1', project: 'Robotics Showcase Registration Desk Marshal', hours: 4, date: 'Oct 14, 2026', supervisor: 'Dr. Alexander Vance', status: 'Approved' },
      { id: 'vh-2', project: 'Freshman Peer Python Tutoring Lab', hours: 20, date: 'Spring 2026', supervisor: 'Prof. Miller', status: 'Approved' },
      { id: 'vh-3', project: 'Campus Arboretum Ecological Tagging', hours: 4, date: 'Nov 02, 2025', supervisor: 'Environmental Chair', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-1', title: 'Robotics Society Certified Junior Fellow', date: 'May 2025', credentialHash: 'HASH-SOC-2025-SF-8842', issuedBy: 'Robotics & AI Society' },
      { id: 'cert-2', title: 'HackConnect 2025 Innovation Award', date: 'Nov 2025', credentialHash: 'HASH-HACK-2025-02-8842', issuedBy: 'Engineering Student Council' },
      { id: 'cert-3', title: 'Dean Civic Service Honor Certificate', date: 'Dec 2025', credentialHash: 'HASH-UNIV-SRV-2025-8842', issuedBy: 'Office of Student Affairs' }
    ]
  },
  {
    id: 'mem-102',
    name: 'Marcus Sterling',
    studentId: 'STU-2026-4419',
    email: 'm.sterling@university.edu',
    phone: '+1 (555) 345-4419',
    membershipType: 'Annual',
    membershipStatus: 'Active',
    joinDate: '2023-08-20',
    expiryDate: '2027-08-20',
    totalRenewals: 3,
    lastRenewalDate: '2026-08-15',
    renewalHistory: [
      { id: 'REN-4419-1', renewalDate: '2024-08-18', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2024-4419.pdf', approvedBy: 'Faculty Advisor' },
      { id: 'REN-4419-2', renewalDate: '2025-08-19', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-4419.pdf', approvedBy: 'Faculty Advisor' },
      { id: 'REN-4419-3', renewalDate: '2026-08-15', plan: 'Annual Membership (Officer Waiver)', amount: 0.00, receipt: 'REC-2026-4419.pdf', approvedBy: 'Dr. Alexander Vance' }
    ],
    eventHistory: [
      { id: 'eh-5', name: 'Annual Autonomous Robotics Showcase 2026', date: 'Oct 14, 2026', role: 'Comptroller & Organizer', checkIn: 'Checked In' },
      { id: 'eh-6', name: 'University Budget Congress', date: 'Sep 25, 2026', role: 'Society Treasurer', checkIn: 'Checked In' }
    ],
    volunteerHistory: [
      { id: 'vh-4', project: 'Society Accounting System Modernization', hours: 25, date: 'Fall 2025', supervisor: 'Dr. Alexander Vance', status: 'Approved' },
      { id: 'vh-5', project: 'Campus Financial Literacy Week Lead', hours: 20, date: 'Spring 2026', supervisor: 'Dean of Student Life', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-4', title: 'Certified Student Organization Comptroller', date: 'Sep 2024', credentialHash: 'HASH-TREAS-2024-4419', issuedBy: 'University Bursar Office' }
    ]
  },
  {
    id: 'mem-103',
    name: 'Elena Rostova',
    studentId: 'STU-2026-6733',
    email: 'e.rostova@university.edu',
    phone: '+1 (555) 789-6733',
    membershipType: 'Semester',
    membershipStatus: 'Active',
    joinDate: '2026-01-15',
    expiryDate: '2026-10-28', // Expiring in 25 days -> Expiring Soon!
    totalRenewals: 1,
    lastRenewalDate: '2026-06-15',
    renewalHistory: [
      { id: 'REN-6733-1', renewalDate: '2026-06-15', plan: 'Semester Membership', amount: 25.00, receipt: 'REC-2026-6733.pdf', approvedBy: 'Marcus Sterling' }
    ],
    eventHistory: [
      { id: 'eh-7', name: 'Introduction to Embedded Firmware Lab', date: 'Oct 02, 2026', role: 'Participant', checkIn: 'Checked In' }
    ],
    volunteerHistory: [
      { id: 'vh-6', project: 'Lab Component Inventory Audit', hours: 6, date: 'Oct 02, 2026', supervisor: 'Ethan Blackwood', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-5', title: 'Embedded Systems Workshop Completion', date: 'Feb 2026', credentialHash: 'HASH-EMB-2026-6733', issuedBy: 'Robotics & AI Society' }
    ]
  },
  {
    id: 'mem-104',
    name: 'Ethan Blackwood',
    studentId: 'STU-2026-1184',
    email: 'e.blackwood@university.edu',
    phone: '+1 (555) 456-1184',
    membershipType: 'Annual',
    membershipStatus: 'Active',
    joinDate: '2023-01-10',
    expiryDate: '2027-01-10',
    totalRenewals: 3,
    lastRenewalDate: '2026-01-08',
    renewalHistory: [
      { id: 'REN-1184-1', renewalDate: '2024-01-10', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2024-1184.pdf', approvedBy: 'Faculty Advisor' },
      { id: 'REN-1184-2', renewalDate: '2025-01-12', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-1184.pdf', approvedBy: 'Faculty Advisor' },
      { id: 'REN-1184-3', renewalDate: '2026-01-08', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2026-1184.pdf', approvedBy: 'Dr. Alexander Vance' }
    ],
    eventHistory: [
      { id: 'eh-8', name: 'Annual Autonomous Robotics Showcase 2026', date: 'Oct 14, 2026', role: 'Hardware Team Lead', checkIn: 'Checked In' },
      { id: 'eh-9', name: 'CAD/CAM SolidWorks Masterclass', date: 'Feb 12, 2026', role: 'Student Instructor', checkIn: 'Completed' }
    ],
    volunteerHistory: [
      { id: 'vh-7', project: 'Robotics Fabrication Lab Equipment Maintenance', hours: 30, date: 'Summer 2026', supervisor: 'Dr. Alexander Vance', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-6', title: 'Master Fabricator Safety Certification', date: 'Mar 2024', credentialHash: 'HASH-FAB-2024-1184', issuedBy: 'College of Engineering' }
    ]
  },
  {
    id: 'mem-105',
    name: 'Julian Chen',
    studentId: 'STU-2026-9021',
    email: 'j.chen@university.edu',
    phone: '+1 (555) 890-9021',
    membershipType: 'Semester',
    membershipStatus: 'Active',
    joinDate: '2024-10-05',
    expiryDate: '2027-03-05',
    totalRenewals: 2,
    lastRenewalDate: '2026-09-20',
    renewalHistory: [
      { id: 'REN-9021-1', renewalDate: '2025-03-01', plan: 'Semester Membership', amount: 25.00, receipt: 'REC-2025-9021.pdf', approvedBy: 'Marcus Sterling' },
      { id: 'REN-9021-2', renewalDate: '2026-09-20', plan: 'Semester Membership', amount: 25.00, receipt: 'REC-2026-9021.pdf', approvedBy: 'Marcus Sterling' }
    ],
    eventHistory: [
      { id: 'eh-10', name: 'HackConnect 2026: 24h University Hackathon', date: 'Nov 18, 2026', role: 'Vision Software Competitor', checkIn: 'Registered' }
    ],
    volunteerHistory: [
      { id: 'vh-8', project: 'Open Source Vision ROS2 Library Maintenance', hours: 20, date: 'Spring 2026', supervisor: 'Dr. Alexander Vance', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-7', title: 'Autonomous Navigation ROS2 Specialist', date: 'May 2026', credentialHash: 'HASH-NAV-2026-9021', issuedBy: 'Robotics & AI Society' }
    ]
  },
  {
    id: 'mem-106',
    name: 'Chloe Davenport',
    studentId: 'STU-2025-7729',
    email: 'c.davenport@university.edu',
    phone: '+1 (555) 321-7729',
    membershipType: 'Annual',
    membershipStatus: 'Expired',
    joinDate: '2024-08-15',
    expiryDate: '2026-08-15', // Expired
    totalRenewals: 1,
    lastRenewalDate: '2025-08-15',
    renewalHistory: [
      { id: 'REN-7729-1', renewalDate: '2025-08-15', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-7729.pdf', approvedBy: 'Dr. Vance' }
    ],
    eventHistory: [
      { id: 'eh-11', name: 'AI Ethics and Linguistics Colloquium', date: 'Apr 20, 2026', role: 'Student Speaker', checkIn: 'Completed' }
    ],
    volunteerHistory: [
      { id: 'vh-9', project: 'Department Library Archive Digitization', hours: 12, date: 'Fall 2025', supervisor: 'Dept. Chair', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-8', title: 'NLP Research Society Scholar', date: 'May 2025', credentialHash: 'HASH-NLP-2025-7729', issuedBy: 'School of Humanities & AI' }
    ]
  },
  {
    id: 'mem-107',
    name: 'Amara Okafor',
    studentId: 'STU-2026-3391',
    email: 'a.okafor@university.edu',
    phone: '+1 (555) 678-3391',
    membershipType: 'Semester',
    membershipStatus: 'Active',
    joinDate: '2026-02-01',
    expiryDate: '2026-11-01', // Expiring in 29 days -> Expiring Soon!
    totalRenewals: 0,
    lastRenewalDate: '2026-02-01',
    renewalHistory: [],
    eventHistory: [
      { id: 'eh-12', name: 'Biomedical Prosthetics Tech Talk', date: 'Sep 10, 2026', role: 'Attendee', checkIn: 'Checked In' }
    ],
    volunteerHistory: [
      { id: 'vh-10', project: 'Campus Health & Prosthetics Drive', hours: 8, date: 'Sep 15, 2026', supervisor: 'Dr. Vance', status: 'Approved' }
    ],
    certificates: []
  },
  {
    id: 'mem-108',
    name: 'Maya Lin-Peterson',
    studentId: 'STU-2026-9923',
    email: 'm.peterson@university.edu',
    phone: '+1 (555) 998-9923',
    membershipType: 'Annual',
    membershipStatus: 'Active',
    joinDate: '2024-10-12',
    expiryDate: '2026-10-20', // Expiring in 17 days -> Expiring Soon!
    totalRenewals: 1,
    lastRenewalDate: '2025-10-12',
    renewalHistory: [
      { id: 'REN-9923-1', renewalDate: '2025-10-12', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-9923.pdf', approvedBy: 'Marcus Sterling' }
    ],
    eventHistory: [
      { id: 'eh-13', name: 'Autonomous Drone Flight Trials', date: 'Sep 28, 2026', role: 'Flight Marshal', checkIn: 'Checked In' }
    ],
    volunteerHistory: [
      { id: 'vh-11', project: 'High School Aerospace STEM Outreach', hours: 16, date: 'July 2026', supervisor: 'Aerospace Chair', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-9', title: 'FAA Certified Campus Drone Operator', date: 'Aug 2025', credentialHash: 'HASH-FAA-2025-9923', issuedBy: 'Aeronautical Society' }
    ]
  },
  {
    id: 'mem-109',
    name: 'Tariq Al-Mansoor',
    studentId: 'STU-2026-4402',
    email: 't.mansoor@university.edu',
    phone: '+1 (555) 876-4402',
    membershipType: 'Semester',
    membershipStatus: 'Expired',
    joinDate: '2025-09-10',
    expiryDate: '2026-06-10', // Expired
    totalRenewals: 1,
    lastRenewalDate: '2026-01-10',
    renewalHistory: [
      { id: 'REN-4402-1', renewalDate: '2026-01-10', plan: 'Semester Membership', amount: 25.00, receipt: 'REC-2026-4402.pdf', approvedBy: 'Marcus Sterling' }
    ],
    eventHistory: [],
    volunteerHistory: [],
    certificates: []
  },
  {
    id: 'mem-110',
    name: 'David K. Larson',
    studentId: 'STU-2025-5512',
    email: 'd.larson@university.edu',
    phone: '+1 (555) 123-5512',
    membershipType: 'Annual',
    membershipStatus: 'Active',
    joinDate: '2023-09-01',
    expiryDate: '2027-09-01',
    totalRenewals: 3,
    lastRenewalDate: '2026-08-30',
    renewalHistory: [
      { id: 'REN-5512-1', renewalDate: '2024-09-01', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2024-5512.pdf', approvedBy: 'Dr. Alexander Vance' },
      { id: 'REN-5512-2', renewalDate: '2025-08-28', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2025-5512.pdf', approvedBy: 'Dr. Alexander Vance' },
      { id: 'REN-5512-3', renewalDate: '2026-08-30', plan: 'Annual Membership', amount: 45.00, receipt: 'REC-2026-5512.pdf', approvedBy: 'Dr. Alexander Vance' }
    ],
    eventHistory: [
      { id: 'eh-14', name: 'Alumni Mentorship Roundtable', date: 'Sep 19, 2026', role: 'Alumni Mentor', checkIn: 'Completed' }
    ],
    volunteerHistory: [
      { id: 'vh-12', project: 'Engineering Career Panelist', hours: 6, date: 'Sep 2026', supervisor: 'Student Life', status: 'Approved' }
    ],
    certificates: [
      { id: 'cert-10', title: 'Distinguished Society Alumnus Award', date: 'May 2025', credentialHash: 'HASH-ALUM-2025-5512', issuedBy: 'Office of Student Affairs' }
    ]
  }
];
