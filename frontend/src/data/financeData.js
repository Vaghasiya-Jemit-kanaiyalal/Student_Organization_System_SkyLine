/**
 * Shared Finance Data Model & Skyline Treasurer Ledger
 * Currency: Indian Rupee (INR - ₹)
 */

export const INITIAL_FINANCE_DATA = {
  academicYear: 'Academic Year 2026–2027',
  openingBalance: 0,
  incomes: [
    {
      id: 'TXN-INC-1001',
      title: 'Annual Student Membership Dues (Batch 1)',
      category: 'Membership Fees',
      amount: 32000,
      date: '2026-09-08',
      displayDate: '08 Sep 2026',
      source: 'Student Affairs Portal',
      status: 'Cleared',
      month: 'September'
    },
    {
      id: 'TXN-INC-1002',
      title: 'Robotics Workshop Ticket Sales (120 Seats)',
      category: 'Event Ticket Sales',
      amount: 24000,
      date: '2026-09-22',
      displayDate: '22 Sep 2026',
      source: 'Ticket Counter & Online',
      status: 'Cleared',
      month: 'September'
    },
    {
      id: 'TXN-INC-1003',
      title: 'Autumn Bake Sale & Snack Stall',
      category: 'Fundraisers',
      amount: 9000,
      date: '2026-09-28',
      displayDate: '28 Sep 2026',
      source: 'Campus Quadrangle Fundraiser',
      status: 'Cleared',
      month: 'September'
    },
    {
      id: 'TXN-INC-1004',
      title: 'AI Symposium 2026 Early Bird Registration',
      category: 'Event Ticket Sales',
      amount: 35000,
      date: '2026-10-05',
      displayDate: '05 Oct 2026',
      source: 'Skyline Registration Desk',
      status: 'Cleared',
      month: 'October'
    },
    {
      id: 'TXN-INC-1005',
      title: 'Official Embroidered Hoodie Presales (Batch 1)',
      category: 'Merchandise Sales',
      amount: 17000,
      date: '2026-10-18',
      displayDate: '18 Oct 2026',
      source: 'Online Merchandise Store',
      status: 'Cleared',
      month: 'October'
    },
    {
      id: 'TXN-INC-1006',
      title: 'Annual Student Membership Dues (Batch 2)',
      category: 'Membership Fees',
      amount: 18500,
      date: '2026-11-04',
      displayDate: '04 Nov 2026',
      source: 'Direct Dean Bursar Deposit',
      status: 'Cleared',
      month: 'November'
    },
    {
      id: 'TXN-INC-1007',
      title: 'Tech Expo & Showcase Entry Passes',
      category: 'Event Ticket Sales',
      amount: 18000,
      date: '2026-11-15',
      displayDate: '15 Nov 2026',
      source: 'Online Gate Terminal',
      status: 'Cleared',
      month: 'November'
    },
    {
      id: 'TXN-INC-1008',
      title: 'Alumni Association Student Innovation Grant',
      category: 'Donations',
      amount: 11500,
      date: '2026-11-26',
      displayDate: '26 Nov 2026',
      source: 'Alumni Foundation Office',
      status: 'Cleared',
      month: 'November'
    },
    {
      id: 'TXN-INC-1009',
      title: 'Official Society T-Shirt Sales (Counter)',
      category: 'Merchandise Sales',
      amount: 23400,
      date: '2026-12-08',
      displayDate: '08 Dec 2026',
      source: 'Club Office Counter',
      status: 'Cleared',
      month: 'December'
    },
    {
      id: 'TXN-INC-1010',
      title: 'Winter Charity Hackathon Registration Fees',
      category: 'Event Ticket Sales',
      amount: 14000,
      date: '2026-12-19',
      displayDate: '19 Dec 2026',
      source: 'Online Gateways',
      status: 'Cleared',
      month: 'December'
    }
  ],

  expenses: [
    {
      id: 'TXN-EXP-2001',
      vendor: 'Turing Science Auditorium Management',
      description: 'Grand Auditorium & Stage Venue Booking (3 Days)',
      category: 'Venue',
      amount: 30000,
      date: '2026-09-14',
      displayDate: '14 Sep 2026',
      receipt: 'REC-VEN-2026-01.pdf',
      receiptStatus: 'Verified',
      status: 'Audited',
      month: 'September'
    },
    {
      id: 'TXN-EXP-2002',
      vendor: 'University Central Print Press',
      description: 'Glossy Posters, Directional Signage & Event Schedules',
      category: 'Marketing / Printing',
      amount: 2500,
      date: '2026-09-20',
      displayDate: '20 Sep 2026',
      receipt: 'REC-PRN-2026-02.pdf',
      receiptStatus: 'Verified',
      status: 'Audited',
      month: 'September'
    },
    {
      id: 'TXN-EXP-2003',
      vendor: 'Metro Custom Apparels Ltd.',
      description: 'Bulk Production: 80 Custom Embroidered T-Shirts',
      category: 'Merchandise Expenses',
      amount: 12000,
      date: '2026-10-10',
      displayDate: '10 Oct 2026',
      receipt: 'REC-APP-2026-03.pdf',
      receiptStatus: 'Verified',
      status: 'Audited',
      month: 'October'
    },
    {
      id: 'TXN-EXP-2004',
      vendor: 'Campus Mart & Grocery',
      description: 'Bake Sale Organic Ingredients & Beverage Cups',
      category: 'Fundraiser Expenses',
      amount: 1200,
      date: '2026-10-24',
      displayDate: '24 Oct 2026',
      receipt: 'REC-GRC-2026-04.pdf',
      receiptStatus: 'Verified',
      status: 'Audited',
      month: 'October'
    },
    {
      id: 'TXN-EXP-2005',
      vendor: 'TechZone Pro AV & Lab Supplies',
      description: 'High-Torque Servos, Breadboards & PA Microphone Set',
      category: 'Equipment',
      amount: 16300,
      date: '2026-11-18',
      displayDate: '18 Nov 2026',
      receipt: 'REC-EQP-2026-05.pdf',
      receiptStatus: 'Missing Receipt',
      status: 'Audited',
      month: 'November'
    }
  ],

  reimbursements: [
    {
      id: 'RR-1024',
      claimant: 'Rahul Mehta',
      studentId: 'STU-2026-1049',
      description: 'Bake Sale Ingredients',
      item: 'Butter, flour, food colorings, paper trays & sugar syrups',
      category: 'Fundraiser Expenses',
      amount: 1200,
      submittedDate: '01 Oct 2026',
      receiptStatus: 'Receipt Attached',
      receiptFile: 'receipt_rahul_bakesale.jpg',
      status: 'Pending',
      notes: 'Purchased for the freshman welcome charity booth.'
    },
    {
      id: 'RR-1025',
      claimant: 'Priya Shah',
      studentId: 'STU-2026-2184',
      description: 'Poster Printing & Lamination',
      item: 'A1 gloss promotional flyers and campus board badges',
      category: 'Marketing / Printing',
      amount: 800,
      submittedDate: '02 Oct 2026',
      receiptStatus: 'Receipt Attached',
      receiptFile: 'receipt_priya_print.pdf',
      status: 'Pending',
      notes: 'Express prints needed for the AI Symposium announcements.'
    },
    {
      id: 'RR-1026',
      claimant: 'Sneha Desai',
      studentId: 'STU-2026-3401',
      description: 'Craft Supplies & Ribbons',
      item: 'Award ribbons, name tags, and ceremony certificate folders',
      category: 'Event Expenses',
      amount: 600,
      submittedDate: '02 Oct 2026',
      receiptStatus: 'Receipt Attached',
      receiptFile: 'receipt_sneha_ribbons.jpg',
      status: 'Pending',
      notes: 'Used during the Robothon awards ceremony check-in.'
    }
  ],

  budgets: [
    {
      category: 'Events',
      budget: 80000,
      spent: 52000,
      remaining: 28000,
      color: 'bg-primary'
    },
    {
      category: 'Fundraisers',
      budget: 30000,
      spent: 18000,
      remaining: 12000,
      color: 'bg-accent'
    },
    {
      category: 'Merchandise',
      budget: 25000,
      spent: 12000,
      remaining: 13000,
      color: 'bg-indigo-600'
    },
    {
      category: 'Marketing & Operations',
      budget: 15000,
      spent: 4500,
      remaining: 10500,
      color: 'bg-emerald-600'
    }
  ],

  monthlyStats: [
    {
      month: 'September',
      income: 65000,
      expenses: 32500,
      net: 32500,
      transactions: 5
    },
    {
      month: 'October',
      income: 52000,
      expenses: 13200,
      net: 38800,
      transactions: 4
    },
    {
      month: 'November',
      income: 48000,
      expenses: 16300,
      net: 31700,
      transactions: 4
    },
    {
      month: 'December',
      income: 37000,
      expenses: 0,
      net: 37000,
      transactions: 2
    }
  ],

  alerts: [
    {
      id: 'alt-1',
      type: 'warning',
      title: '3 reimbursement requests awaiting approval',
      description: 'Rahul Mehta, Priya Shah, and Sneha Desai submitted claims totaling ₹2,600.',
      actionLabel: 'Review Requests',
      actionTab: 'reimbursements'
    },
    {
      id: 'alt-2',
      type: 'info',
      title: '2 expenses missing verified tax receipts',
      description: 'TechZone Pro AV purchase (₹16,300) requires university comptroller tax invoice.',
      actionLabel: 'Request Receipts',
      actionTab: 'expenses'
    },
    {
      id: 'alt-3',
      type: 'urgent',
      title: 'Event expense approaching 70% threshold',
      description: 'Auditorium and venue expenses are at 65% of allocated semester quota.',
      actionLabel: 'View Event Budget',
      actionTab: 'overview'
    }
  ]
};

/**
 * Format number into Indian Rupee format (e.g. ₹2,02,000)
 */
export const formatINR = (value) => {
  if (value === undefined || value === null) return '₹0';
  const num = Math.round(Number(value));
  return '₹' + num.toLocaleString('en-IN');
};
