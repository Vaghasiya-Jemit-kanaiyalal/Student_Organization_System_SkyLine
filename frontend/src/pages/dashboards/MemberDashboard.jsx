import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  HeartHandshake,
  Award,
  Megaphone,
  User,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Download,
  QrCode,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  FileText,
  AlertCircle,
  Bell,
  LogOut,
  KeyRound,
  Edit3,
  Phone,
  Mail,
  GraduationCap,
  Building,
  ChevronDown,
  Printer,
  BadgeCheck,
  Send,
  Eye,
  TrendingUp,
  ArrowRight,
  ShieldPlus,
  DollarSign
} from 'lucide-react';

export const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read active tab from query params
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    navigate(`/member/dashboard?tab=${tabId}`);
  };

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Overview Activity Log Filter
  const [activityFilter, setActivityFilter] = useState('ALL');

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState({
    name: user?.name || user?.full_name || 'Rohan Sharma',
    studentId: user?.studentId || user?.student_id || 'STU-2026-905',
    email: user?.email || 'rohan.sharma@studentorg.edu',
    phone: '+1 (555) 234-8910',
    department: 'Computer Science & Software Engineering',
    semester: 'Junior (Year 3, Semester 5)',
    membershipType: 'Annual Academic Member',
    membershipStatus: 'Active',
    joinDate: 'Oct 01, 2026',
    expiryDate: 'June 30, 2027',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Undergraduate student passionate about robotics, autonomous systems, and student community coordination.'
  });

  // Events Master State
  const [eventsList, setEventsList] = useState([
    {
      id: 'evt-1',
      title: 'SkyLine Annual Robotics Showcase 2026',
      date: 'Oct 14, 2026 • 2:00 PM – 6:00 PM',
      venue: 'Grand Hall, Turing Science Quad',
      availableSeats: 48,
      totalSeats: 200,
      memberPrice: '$0.00 (Free for Members)',
      nonMemberPrice: '$15.00',
      status: 'Upcoming',
      category: 'Flagship Event',
      description: 'Demonstrations of student-built autonomous rovers, drone swarms, and AI vision systems with industry evaluators and alumni.'
    },
    {
      id: 'evt-2',
      title: 'Full-Stack Web3 & Cloud Hackathon',
      date: 'Oct 28, 2026 • 9:00 AM – 8:00 PM',
      venue: 'Innovation Center, Room 402',
      availableSeats: 22,
      totalSeats: 120,
      memberPrice: '$5.00 (75% Member Discount)',
      nonMemberPrice: '$20.00',
      status: 'Upcoming',
      category: 'Hackathon',
      description: '11-hour intensive team hackathon building microservices, AI pipelines, and cloud web architectures with cash prizes.'
    },
    {
      id: 'evt-3',
      title: 'Career & Industry Networking Night',
      date: 'Nov 05, 2026 • 5:30 PM – 8:30 PM',
      venue: 'Student Union Ballroom',
      availableSeats: 65,
      totalSeats: 250,
      memberPrice: '$0.00 (Free for Members)',
      nonMemberPrice: '$10.00',
      status: 'Registration Open',
      category: 'Career Networking',
      description: 'Connect directly with hiring managers, software architects, and engineering directors from top regional tech employers.'
    },
    {
      id: 'evt-4',
      title: 'Hands-on Microcontroller & IoT Workshop',
      date: 'Nov 18, 2026 • 1:00 PM – 4:00 PM',
      venue: 'Makerspace Lab 108',
      availableSeats: 12,
      totalSeats: 40,
      memberPrice: '$10.00 (Kit included)',
      nonMemberPrice: '$35.00',
      status: 'Limited Seats',
      category: 'Technical Workshop',
      description: 'Build connected sensor nodes using ESP32, MQTT protocols, and telemetry dashboards. Hardware kits provided.'
    }
  ]);

  // Tickets Master State
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TCK-2026-8812',
      eventTitle: 'SkyLine Annual Robotics Showcase 2026',
      date: 'Oct 14, 2026 • 2:00 PM – 6:00 PM',
      venue: 'Grand Hall, Turing Science Quad',
      seat: 'Member General Admission • Section B-14',
      pricePaid: '$0.00 (Member Pass)',
      purchaseDate: 'Oct 02, 2026',
      status: 'Confirmed',
      qrCodeData: 'CONNECTU-ROBOTICS-ROH-8812'
    },
    {
      id: 'TCK-2026-9043',
      eventTitle: 'Full-Stack Web3 & Cloud Hackathon',
      date: 'Oct 28, 2026 • 9:00 AM – 8:00 PM',
      venue: 'Innovation Center, Room 402',
      seat: 'Hacker Pass • Team Table #06',
      pricePaid: '$5.00',
      purchaseDate: 'Oct 03, 2026',
      status: 'Confirmed',
      qrCodeData: 'CONNECTU-HACK-ROH-9043'
    }
  ]);

  // Volunteer Opportunities State
  const [volunteerOpportunities, setVolunteerOpportunities] = useState([
    {
      id: 'vol-opp-1',
      eventName: 'SkyLine Annual Robotics Showcase 2026',
      roleNeeded: 'Hardware Demo Assistant & Stage Proctor',
      duration: '4 Hours (2:00 PM – 6:00 PM)',
      credits: '4 Certified Service Hours',
      deadline: 'Oct 10, 2026',
      slotsAvailable: 3
    },
    {
      id: 'vol-opp-2',
      eventName: 'Full-Stack Web3 & Cloud Hackathon',
      roleNeeded: 'Registration Desk & Logistics Coordinator',
      duration: '6 Hours (8:30 AM – 2:30 PM)',
      credits: '6 Certified Service Hours + Free Meal',
      deadline: 'Oct 20, 2026',
      slotsAvailable: 4
    },
    {
      id: 'vol-opp-3',
      eventName: 'Career & Industry Networking Night',
      roleNeeded: 'Speaker Usher & Audio/Visual Handler',
      duration: '3.5 Hours (5:00 PM – 8:30 PM)',
      credits: '3.5 Certified Service Hours',
      deadline: 'Oct 30, 2026',
      slotsAvailable: 2
    }
  ]);

  // Volunteer Applications State
  const [volunteerApplications, setVolunteerApplications] = useState([
    {
      id: 'app-101',
      eventName: 'SkyLine Annual Robotics Showcase 2026',
      roleApplied: 'Hardware Demo Assistant',
      appliedDate: 'Oct 02, 2026',
      status: 'Approved',
      feedback: 'Approved by Dr. Vance. Please attend the pre-event briefing at 1:30 PM.'
    },
    {
      id: 'app-102',
      eventName: 'Campus Tech Orientation Workshop',
      roleApplied: 'Freshman Guide',
      appliedDate: 'Sep 24, 2026',
      status: 'Approved',
      feedback: 'Successfully completed on Sep 28. Service hours verified.'
    },
    {
      id: 'app-103',
      eventName: 'Full-Stack Web3 & Cloud Hackathon',
      roleApplied: 'Registration Desk & Logistics',
      appliedDate: 'Oct 03, 2026',
      status: 'Pending',
      feedback: 'Application received and currently under executive committee review.'
    }
  ]);

  // Active Volunteer Work State
  const [activeVolunteerWork, setActiveVolunteerWork] = useState([
    {
      id: 'act-1',
      event: 'SkyLine Annual Robotics Showcase 2026',
      assignedRole: 'Hardware Demo Assistant',
      supervisor: 'Dr. Alexander Vance (Faculty Advisor)',
      scheduledTime: 'Oct 14, 2026 • 1:30 PM – 6:00 PM',
      duration: '4.5 Hours',
      status: 'Assigned'
    },
    {
      id: 'act-2',
      event: 'Campus Tech Orientation Workshop',
      assignedRole: 'Freshman Guide',
      supervisor: 'Elena Rostova (Council Rep)',
      scheduledTime: 'Sep 28, 2026 • 10:00 AM – 3:00 PM',
      duration: '5.0 Hours',
      status: 'Completed'
    }
  ]);

  // Certificates State
  const [certificatesList, setCertificatesList] = useState([
    {
      id: 'CERT-2026-ENG-441',
      title: 'Distinguished Student Volunteer Certificate',
      eventName: 'Campus Tech Orientation & Mentorship Program',
      issueDate: 'Sep 29, 2026',
      authorizedSigner: 'Dr. Alexander Vance, Dean of Engineering',
      credentialHash: 'sha256-e9b48c17a812df69c4a8'
    },
    {
      id: 'CERT-2026-MEM-009',
      title: 'Member in Good Standing 2026–2027',
      eventName: 'SkyLine Student Organization Annual Ratification',
      issueDate: 'Oct 01, 2026',
      authorizedSigner: 'Marcus Sterling, Chief Registrar',
      credentialHash: 'sha256-4f7b2c991a03e5898bc1'
    }
  ]);

  // Announcements State
  const [announcementsList, setAnnouncementsList] = useState([
    {
      id: 'anc-1',
      title: 'Annual Budget Grant Ratified: $4,500 Allocated for Robotics Components',
      category: 'Finance & Grants',
      publishedDate: 'Oct 01, 2026 • 11:30 AM',
      author: 'Office of Student Affairs',
      summary: 'The University Student Council has officially approved our student organization semester grant. High-power batteries, brushless motors, and test equipment orders are underway.',
      fullContent: 'We are thrilled to announce that the Office of Student Affairs has officially ratified our $4,500 semester grant allocation. Funds will be deployed directly towards hardware inventory, subsidizing hackathon refreshments, and acquiring digital lab oscilloscopes.\n\nAll active organization members in good standing may request component loans starting next Monday through the Makerspace desk.'
    },
    {
      id: 'anc-2',
      title: 'Call for Volunteer Marshals: Annual Robotics Showcase 2026',
      category: 'Volunteer',
      publishedDate: 'Sep 28, 2026 • 02:15 PM',
      author: 'Executive Committee',
      summary: 'We are recruiting 8 additional student volunteers to coordinate guest speakers, check in attendees, and assist demonstration teams. Verified service hours awarded.',
      fullContent: 'The Annual Robotics Showcase is our flagship academic event featuring over 300 student and faculty attendees. Volunteers receive certified academic service hours, an exclusive organization technical polo shirt, and priority registration for spring hackathons.\n\nPlease submit your application under the Volunteer tab.'
    },
    {
      id: 'anc-3',
      title: 'Fall General Assembly & Project Demo Night Schedule',
      category: 'General Assembly',
      publishedDate: 'Oct 02, 2026 • 09:00 AM',
      author: 'Academic Council Rep',
      summary: 'Mark your calendars for November 12th. All active members will review club treasury reports, vote on constitution amendments, and preview senior capstone projects.',
      fullContent: 'Our Fall General Assembly will convene at the Student Union Auditorium on November 12 at 6:00 PM. In compliance with student council bylaws, annual members will cast votes on constitutional amendments and review the treasurer fiscal audit.\n\nRefreshments and networking will follow the formal meeting.'
    }
  ]);

  // Membership History State
  const [membershipHistory, setMembershipHistory] = useState([
    {
      term: 'Academic Year 2026–2027',
      plan: 'Full Annual Student Membership',
      amount: '$35.00',
      paymentDate: 'Oct 01, 2026',
      receiptId: 'RCP-2026-98102',
      status: 'Paid & Active'
    },
    {
      term: 'Academic Year 2025–2026',
      plan: 'Semester Membership (Spring)',
      amount: '$20.00',
      paymentDate: 'Jan 15, 2026',
      receiptId: 'RCP-2026-10492',
      status: 'Completed'
    }
  ]);

  // Student Governance / Activity Log (Matches Admin Dashboard Log style)
  const studentActivityLogs = [
    {
      id: 'act-log-1',
      category: 'TICKETS',
      title: 'Admission Confirmed: Annual Robotics Showcase 2026',
      description: 'Digital general admission pass generated with verified QR credentials. Seat allocated in Turing Quad Hall.',
      date: 'Oct 02, 2026 • 11:30 AM',
      refCode: 'TCK-2026-8812',
      badge: 'Confirmed Pass',
      badgeClass: 'bg-status-success-bg text-status-success border-status-success/30'
    },
    {
      id: 'act-log-2',
      category: 'VOLUNTEER',
      title: 'Stage Logistics Volunteer Role Approved',
      description: 'Application ratified by Dr. Alexander Vance. Assigned 4.5 service hours under faculty supervision.',
      date: 'Oct 02, 2026 • 03:45 PM',
      refCode: 'VOL-ROB-44',
      badge: 'Approved Volunteer',
      badgeClass: 'bg-accent-light text-accent-700 border-accent-300'
    },
    {
      id: 'act-log-3',
      category: 'EVENTS',
      title: 'Hacker Team Registration: Web3 & Cloud Hackathon',
      description: 'Team seat reserved at Table #06 in Innovation Center Lab. Subsidized member entry fee processed.',
      date: 'Oct 03, 2026 • 09:15 AM',
      refCode: 'EVT-HCK-9043',
      badge: 'Registered',
      badgeClass: 'bg-primary/10 text-primary border-primary/30'
    },
    {
      id: 'act-log-4',
      category: 'NOTICES',
      title: 'Fall General Assembly Notice Dispatched',
      description: 'Official student agenda transmitted to active members regarding constitutional voting and committee reports.',
      date: 'Oct 02, 2026 • 04:00 PM',
      refCode: 'ANC-2026-44',
      badge: 'Transmitted',
      badgeClass: 'bg-status-info-bg text-status-info border-status-info/30'
    }
  ];

  const filteredActivityLogs = studentActivityLogs.filter(log => {
    if (activityFilter === 'ALL') return true;
    return log.category === activityFilter;
  });

  // Modals State
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [buyTicketModalEvent, setBuyTicketModalEvent] = useState(null);
  const [applyVolunteerModalEvent, setApplyVolunteerModalEvent] = useState(null);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState(null);
  const [renewMembershipModalOpen, setRenewMembershipModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Forms State
  const [volunteerMotivation, setVolunteerMotivation] = useState('');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [editProfileForm, setEditProfileForm] = useState({ ...studentProfile });
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL');

  // Interactive Form Handlers
  const handleBuyTicketSubmit = (e) => {
    e.preventDefault();
    if (!buyTicketModalEvent) return;

    const newTicket = {
      id: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventTitle: buyTicketModalEvent.title,
      date: buyTicketModalEvent.date,
      venue: buyTicketModalEvent.venue,
      seat: `General Admission Pass • Seat #${Math.floor(10 + Math.random() * 90)}`,
      pricePaid: buyTicketModalEvent.memberPrice.includes('$0.00') ? '$0.00 (Member Pass)' : '$5.00',
      purchaseDate: 'Oct 03, 2026',
      status: 'Confirmed',
      qrCodeData: `CONNECTU-${buyTicketModalEvent.id.toUpperCase()}-${studentProfile.studentId}`
    };

    setTicketsList(prev => [newTicket, ...prev]);
    setBuyTicketModalEvent(null);
    showToast(`Ticket for "${newTicket.eventTitle}" reserved successfully!`);
  };

  const handleApplyVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!applyVolunteerModalEvent) return;

    const newApplication = {
      id: `app-${Math.floor(200 + Math.random() * 800)}`,
      eventName: applyVolunteerModalEvent.eventName || applyVolunteerModalEvent.title,
      roleApplied: applyVolunteerModalEvent.roleNeeded || 'Event Operations & Logistics',
      appliedDate: 'Oct 03, 2026',
      status: 'Pending',
      feedback: 'Application submitted successfully. Awaiting administrator review.'
    };

    setVolunteerApplications(prev => [newApplication, ...prev]);
    setApplyVolunteerModalEvent(null);
    setVolunteerMotivation('');
    showToast('Volunteer application submitted successfully!');
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('connectu_jwt_token');
      if (token) {
        const res = await fetch('http://127.0.0.1:8000/api/auth/change-password/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            old_password: passwordForm.oldPassword,
            new_password: passwordForm.newPassword,
            confirm_new_password: passwordForm.confirmPassword
          })
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.details || 'Password change failed.', 'error');
          return;
        }
      }
    } catch {
      // Mock fallback
    }

    setChangePasswordModalOpen(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully!');
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    setStudentProfile({ ...editProfileForm });
    setEditProfileModalOpen(false);
    showToast('Student profile updated successfully!');
  };

  const handleRenewMembershipConfirm = () => {
    setStudentProfile(prev => ({
      ...prev,
      expiryDate: 'June 30, 2028',
      membershipStatus: 'Active'
    }));

    const newHistoryRecord = {
      term: 'Academic Year 2027–2028',
      plan: 'Full Annual Student Membership (Early Renewal)',
      amount: '$35.00',
      paymentDate: 'Oct 03, 2026',
      receiptId: `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Paid & Active'
    };

    setMembershipHistory(prev => [newHistoryRecord, ...prev]);
    setRenewMembershipModalOpen(false);
    showToast('Membership renewed through June 2028!');
  };

  // Filtered Events
  const filteredEvents = eventsList.filter(evt => {
    const matchesQuery = evt.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
                         evt.venue.toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesCategory = eventCategoryFilter === 'ALL' || evt.category.toLowerCase().includes(eventCategoryFilter.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-elevated border flex items-center space-x-2 text-xs font-semibold animate-bounce ${
          toast.type === 'error'
            ? 'bg-status-error-bg text-status-error border-status-error/30'
            : 'bg-status-success-bg text-status-success border-status-success/30'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW (Identical Structure to Admin) */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Membership Standing */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-primary/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Membership Standing
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    Active
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-success font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Dues Ratified</span>
                    <span className="text-text-muted">• Valid thru June 2027</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Annual Member</span>
                  <button
                    onClick={() => handleTabSelect('membership')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>View Membership</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 2: Campus Events */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-accent/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Campus Events
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {eventsList.length}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
                    <span className="font-semibold text-primary">2 Passes Reserved</span>
                    <span className="text-text-muted">• Live registrations</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Ticketing Active</span>
                  <button
                    onClick={() => handleTabSelect('events')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>Manage Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 3: Digital Wallet & Tickets */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-status-info/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      My Event Tickets
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-status-info-bg flex items-center justify-center text-status-info">
                      <Ticket className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {ticketsList.length}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-info font-medium">
                    <QrCode className="w-3 h-3 text-primary" />
                    <span className="text-primary font-semibold">QR Passes Confirmed</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Ready for Entry</span>
                  <button
                    onClick={() => handleTabSelect('tickets')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>My Tickets</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 4: Volunteer & Service Hours */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-status-warning/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Volunteer & Honors
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-status-warning-bg flex items-center justify-center text-status-warning">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    9.5 <span className="text-sm font-semibold text-text-muted">Hrs</span>
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      1 Approved
                    </span>
                    <span className="text-text-muted">1 Under review</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Transcript Certified</span>
                  <button
                    onClick={() => handleTabSelect('volunteer')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>Volunteer Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Overview Split: Student Activity Ledger + Student Quick Launcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Student Governance & Participation Ledger (2 Cols) */}
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span>Society Governance & Ledger Log</span>
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Verified student event participation, ticket check-ins, and official academic notices
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-border text-xs">
                    {['ALL', 'TICKETS', 'VOLUNTEER', 'EVENTS', 'NOTICES'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setActivityFilter(category)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          activityFilter === category
                            ? 'bg-primary text-white shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Items */}
                <div className="divide-y divide-border space-y-3 pt-1">
                  {filteredActivityLogs.map((log) => (
                    <div key={log.id} className="pt-3 flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-text-primary text-xs sm:text-sm">
                            {log.title}
                          </p>
                          <p className="text-text-secondary text-xs leading-relaxed max-w-xl">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-text-muted font-medium">
                              {log.date}
                            </span>
                            <span className="text-[10px] text-text-muted">•</span>
                            <span className="text-[10px] font-mono text-accent text-primary">
                              REF: {log.refCode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${log.badgeClass}`}>
                        {log.badge}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-xs text-text-muted">
                  <span>Cryptographic Checksum: SHA-256 Verified by Student Senate</span>
                  <span className="text-status-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Records Ratified
                  </span>
                </div>
              </div>

              {/* Right Column: Student Launcher & Council Accreditation */}
              <div className="space-y-6">

                {/* Student Quick Launcher */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-border">
                    <Sparkles className="w-4 h-4 text-accent text-primary" />
                    <h3 className="text-lg font-bold text-text-primary">
                      Student Quick Launcher
                    </h3>
                  </div>

                  <p className="text-xs text-text-secondary">
                    Immediate triggers for campus events, admission passes, and volunteer opportunities.
                  </p>

                  <div className="space-y-2.5">
                    {/* Top primary button */}
                    <button
                      onClick={() => handleTabSelect('events')}
                      className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>Reserve Event Ticket</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    {/* Secondary button 1 */}
                    <button
                      onClick={() => handleTabSelect('tickets')}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5 text-primary" />
                        <span>View My Digital Tickets (QR)</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    {/* Secondary button 2 */}
                    <button
                      onClick={() => handleTabSelect('volunteer')}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <HeartHandshake className="w-3.5 h-3.5 text-primary" />
                        <span>Apply as Volunteer</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    {/* Secondary button 3 */}
                    <button
                      onClick={() => handleTabSelect('certificates')}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span>Download Verified Certificate</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* Council Accreditation Card */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-border">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">
                      Council Accreditation
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Faculty Endorsement:</span>
                      <span className="font-semibold text-status-success flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Certified
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Student ID:</span>
                      <span className="font-mono font-bold text-primary">{studentProfile.studentId}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Fiscal Dues Standing:</span>
                      <span className="font-semibold text-status-success">Dean Approved</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Next Senate Review:</span>
                      <span className="text-text-primary font-medium">Nov 14, 2026</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MEMBERSHIP */}
        {/* ========================================================= */}
        {activeTab === 'membership' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Membership Standing & Subscription</h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Official student affiliation with ConnectU Campus Organizations.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success-bg text-status-success border border-status-success/30">
                    Active Dues Paid
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted font-medium">Membership Type</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.membershipType}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted font-medium">Affiliation Status</span>
                    <p className="text-sm font-bold text-status-success">In Good Academic Standing</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted font-medium">Enrolled Since</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.joinDate}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted font-medium">Renewal Due Date</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.expiryDate}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-text-primary text-sm mb-3">Included Membership Privileges</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-text-secondary">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-status-success flex-shrink-0" />
                      <span>Free admission to all general campus showcases</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-status-success flex-shrink-0" />
                      <span>Up to 75% discount on flagship technical hackathons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-status-success flex-shrink-0" />
                      <span>Voting rights at the semester General Assembly</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-status-success flex-shrink-0" />
                      <span>Priority registration for volunteer honor positions</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                  <button
                    onClick={() => setRenewMembershipModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-subtle transition flex items-center"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Renew Membership
                  </button>
                </div>
              </div>

              {/* Digital Member Card */}
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-[#0F2942] to-[#1557B0] p-6 text-white shadow-elevated flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UniversityCrest className="w-8 h-8 text-white" variant="white" />
                    <div>
                      <div className="text-xs font-bold tracking-wider uppercase">ConnectU Identity</div>
                      <div className="text-[10px] text-white/70">Student Organization Society</div>
                    </div>
                  </div>
                  <BadgeCheck className="w-6 h-6 text-[#58A6FF]" />
                </div>

                <div className="my-6 space-y-1">
                  <div className="text-[11px] text-white/70">Member Name</div>
                  <div className="text-xl font-bold tracking-tight">{studentProfile.name}</div>
                  <div className="text-xs text-[#58A6FF] font-mono tracking-widest mt-0.5">
                    ID: {studentProfile.studentId}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20 flex items-center justify-between text-[11px] text-white/80">
                  <div>
                    <span>Valid: </span>
                    <span className="font-semibold text-white">2026–2027</span>
                  </div>
                  <div className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded">
                    VERIFIED
                  </div>
                </div>
              </div>
            </div>

            {/* Membership Payment History Table */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
              <h3 className="font-bold text-text-primary text-base">Membership Payment History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-text-secondary">
                      <th className="py-2.5 px-3 font-semibold">Academic Term</th>
                      <th className="py-2.5 px-3 font-semibold">Plan Description</th>
                      <th className="py-2.5 px-3 font-semibold">Amount Paid</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Receipt Code</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {membershipHistory.map((hist, idx) => (
                      <tr key={idx} className="hover:bg-canvas/40 transition">
                        <td className="py-3 px-3 font-semibold text-text-primary">{hist.term}</td>
                        <td className="py-3 px-3 text-text-secondary">{hist.plan}</td>
                        <td className="py-3 px-3 font-bold text-text-primary">{hist.amount}</td>
                        <td className="py-3 px-3 text-text-muted">{hist.paymentDate}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-primary">{hist.receiptId}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-success-bg text-status-success">
                            {hist.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => showToast(`Receipt ${hist.receiptId} downloaded.`)}
                            className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EVENTS */}
        {/* ========================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Campus Events & Academic Showcases</h2>
                <p className="text-xs text-text-secondary">Register for student competitions, technical symposiums, and networking.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search events or venues..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Flagship">Flagship Events</option>
                  <option value="Hackathon">Hackathons</option>
                  <option value="Career">Career & Networking</option>
                  <option value="Workshop">Workshops</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/70 text-text-secondary">
                      <th className="py-3 px-4 font-semibold">Event Name</th>
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Venue</th>
                      <th className="py-3 px-4 font-semibold">Available Seats</th>
                      <th className="py-3 px-4 font-semibold">Member Price</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEvents.map(evt => (
                      <tr key={evt.id} className="hover:bg-canvas/40 transition">
                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          <div>{evt.title}</div>
                          <span className="text-[10px] text-primary font-normal">{evt.category}</span>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                          {evt.date}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-text-muted flex-shrink-0" />
                          <span>{evt.venue}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-text-primary">{evt.availableSeats}</span>
                          <span className="text-text-muted"> / {evt.totalSeats}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-status-success">
                          {evt.memberPrice}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary">
                            {evt.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setBuyTicketModalEvent(evt)}
                              className="px-3 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition"
                            >
                              Buy Ticket
                            </button>
                            <button
                              onClick={() => setApplyVolunteerModalEvent(evt)}
                              className="px-2.5 py-1 rounded border border-border bg-surface hover:bg-canvas text-text-primary text-xs font-semibold transition"
                            >
                              Apply Volunteer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY TICKETS */}
        {/* ========================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">My Event Tickets & Passes</h2>
                <p className="text-xs text-text-secondary">Present QR codes at entry checkpoints for verified admission.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary">
                {ticketsList.length} Active Tickets
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/70 text-text-secondary">
                      <th className="py-3 px-4 font-semibold">Ticket ID</th>
                      <th className="py-3 px-4 font-semibold">Event Name</th>
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Venue & Seat</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-center">QR Pass</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ticketsList.map(tck => (
                      <tr key={tck.id} className="hover:bg-canvas/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          {tck.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          {tck.eventTitle}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary whitespace-nowrap">
                          {tck.date}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">
                          <div>{tck.venue}</div>
                          <span className="text-[11px] text-text-muted">{tck.seat}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-success-bg text-status-success">
                            {tck.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedTicketModal(tck)}
                            className="inline-flex items-center px-2 py-1 rounded border border-border bg-surface hover:bg-canvas text-xs font-medium text-text-primary"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1 text-primary" /> View
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedTicketModal(tck)}
                            className="px-3 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition"
                          >
                            View Ticket
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: VOLUNTEER */}
        {/* ========================================================= */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Subsection A: Available Opportunities */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-text-primary">A. Available Opportunities</h3>
                </div>
                <span className="text-xs text-text-muted">Earn official certified service hours</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {volunteerOpportunities.map(opp => (
                  <div key={opp.id} className="p-4 rounded-xl border border-border bg-canvas/30 hover:border-primary/40 transition flex flex-col justify-between space-y-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary">
                        {opp.credits}
                      </span>
                      <h4 className="font-bold text-text-primary text-sm mt-2">{opp.eventName}</h4>
                      <p className="text-xs text-primary font-medium mt-1">Roles: {opp.roleNeeded}</p>
                      <p className="text-[11px] text-text-muted mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {opp.duration}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">{opp.slotsAvailable} spots left</span>
                      <button
                        onClick={() => setApplyVolunteerModalEvent(opp)}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition"
                      >
                        Apply Button
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsection B: My Applications */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-text-primary pb-3 border-b border-border">
                B. My Applications
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-text-secondary">
                      <th className="py-2.5 px-3 font-semibold">Event Name</th>
                      <th className="py-2.5 px-3 font-semibold">Applied Date</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Administrator Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {volunteerApplications.map(app => (
                      <tr key={app.id} className="hover:bg-canvas/40 transition">
                        <td className="py-3 px-3 font-bold text-text-primary">{app.eventName}</td>
                        <td className="py-3 px-3 text-text-muted">{app.appliedDate}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'Approved'
                              ? 'bg-status-success-bg text-status-success'
                              : app.status === 'Rejected'
                              ? 'bg-status-error-bg text-status-error'
                              : 'bg-status-warning-bg text-status-warning'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-text-muted text-[11px] max-w-xs">{app.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subsection C: Active Volunteer Work */}
            <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-4">
              <h3 className="text-base font-bold text-text-primary pb-3 border-b border-border">
                C. Active Volunteer Work
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-text-secondary">
                      <th className="py-2.5 px-3 font-semibold">Event</th>
                      <th className="py-2.5 px-3 font-semibold">Assigned Role</th>
                      <th className="py-2.5 px-3 font-semibold">Duration</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeVolunteerWork.map(act => (
                      <tr key={act.id} className="hover:bg-canvas/40 transition">
                        <td className="py-3 px-3 font-bold text-text-primary">{act.event}</td>
                        <td className="py-3 px-3 text-text-secondary font-medium">{act.assignedRole}</td>
                        <td className="py-3 px-3 font-bold text-text-primary">{act.duration}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            act.status === 'Completed'
                              ? 'bg-status-success-bg text-status-success'
                              : 'bg-primary-light text-primary'
                          }`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CERTIFICATES */}
        {/* ========================================================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Certificates & Academic Credentials</h2>
                <p className="text-xs text-text-secondary">Official institutional awards issued by the Student Organization Senate.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success-bg text-status-success">
                {certificatesList.length} Verified Credentials
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/70 text-text-secondary">
                      <th className="py-3 px-4 font-semibold">Certificate Name</th>
                      <th className="py-3 px-4 font-semibold">Event Name</th>
                      <th className="py-3 px-4 font-semibold">Issue Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {certificatesList.map(cert => (
                      <tr key={cert.id} className="hover:bg-canvas/40 transition">
                        <td className="py-3.5 px-4 font-bold text-text-primary">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{cert.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">{cert.eventName}</td>
                        <td className="py-3.5 px-4 text-text-muted">{cert.issueDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedCertificateModal(cert)}
                              className="px-3 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Certificate
                            </button>
                            <button
                              onClick={() => showToast(`Certificate ${cert.id} downloaded as PDF.`)}
                              className="px-3 py-1 rounded border border-border bg-surface hover:bg-canvas text-text-primary text-xs font-semibold transition flex items-center"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: ANNOUNCEMENTS */}
        {/* ========================================================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Official Announcements</h2>
                <p className="text-xs text-text-secondary">Formal broadcasts from club advisors, executive senate, and student affairs.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary">
                {announcementsList.length} Announcements
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcementsList.map(anc => (
                <div
                  key={anc.id}
                  className="rounded-xl border border-border bg-surface p-5 shadow-subtle hover:border-primary/40 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                        {anc.category}
                      </span>
                      <span className="text-[11px] text-text-muted">{anc.publishedDate}</span>
                    </div>

                    <h3 className="font-bold text-text-primary text-base leading-snug">
                      {anc.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {anc.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">By: {anc.author}</span>
                    <button
                      onClick={() => setSelectedAnnouncementModal(anc)}
                      className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center"
                    >
                      Read More <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PROFILE */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="rounded-xl border border-border bg-surface p-6 shadow-subtle text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={studentProfile.avatar}
                    alt={studentProfile.name}
                    className="w-28 h-28 rounded-2xl mx-auto object-cover border-2 border-primary/20 shadow-md"
                  />
                  <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-status-success border-2 border-surface"></span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-text-primary">{studentProfile.name}</h3>
                  <p className="text-xs font-semibold text-primary font-mono">{studentProfile.studentId}</p>
                  <p className="text-xs text-text-secondary mt-1">{studentProfile.department}</p>
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <button
                    onClick={() => setEditProfileModalOpen(true)}
                    className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setChangePasswordModalOpen(true)}
                    className="w-full py-2 rounded-lg border border-border bg-surface hover:bg-canvas text-text-primary text-xs font-semibold transition flex items-center justify-center"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5 text-text-muted" /> Change Password
                  </button>
                </div>
              </div>

              {/* Comprehensive Academic Details */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-subtle space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-base font-bold text-text-primary">Academic & Contact Information</h3>
                  <span className="text-xs text-text-muted font-medium">FERPA Verified Record</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><User className="w-3.5 h-3.5 mr-1 text-primary" /> Student Name</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.name}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1 text-primary" /> Student ID</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.studentId}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-primary" /> University Email</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.email}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-primary" /> Phone Number</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.phone}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><Building className="w-3.5 h-3.5 mr-1 text-primary" /> Department</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.department}</p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                    <span className="text-text-muted flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-primary" /> Semester</span>
                    <p className="text-sm font-bold text-text-primary">{studentProfile.semester}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-canvas/40 space-y-1">
                  <span className="text-text-muted text-xs font-semibold">Student Bio & Academic Focus</span>
                  <p className="text-xs text-text-secondary leading-relaxed">{studentProfile.bio}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: VIEW TICKET & QR CODE */}
      {/* ========================================================= */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary mb-2">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Digital Admission Pass</h3>
              <p className="text-xs text-text-muted">Present this pass at the gate for electronic scan</p>
            </div>

            {/* Ticket Card */}
            <div className="p-4 rounded-xl border border-border bg-canvas text-center space-y-3">
              <div className="p-3 bg-white rounded-lg inline-block shadow-subtle border border-border">
                <div className="w-36 h-36 mx-auto bg-slate-900 rounded flex flex-col items-center justify-center text-white p-2">
                  <QrCode className="w-24 h-24 text-white" />
                  <span className="text-[8px] font-mono mt-1 text-slate-300">{selectedTicketModal.id}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-text-primary text-sm">{selectedTicketModal.eventTitle}</h4>
                <p className="text-xs text-text-secondary mt-0.5">{selectedTicketModal.venue}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{selectedTicketModal.date}</p>
              </div>

              <div className="pt-3 border-t border-border text-xs flex justify-between text-text-secondary">
                <span>Attendee: <strong>{studentProfile.name}</strong></span>
                <span>Seat: <strong>{selectedTicketModal.seat}</strong></span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  showToast('Ticket pass downloaded successfully.');
                  setSelectedTicketModal(null);
                }}
                className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download Ticket (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: BUY TICKET CONFIRMATION */}
      {/* ========================================================= */}
      {buyTicketModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setBuyTicketModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Reserve Event Ticket</h3>
              <p className="text-xs text-text-muted mt-0.5">Confirm your admission seat with verified member pricing</p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-canvas/40 space-y-2 text-xs">
              <div className="font-bold text-text-primary text-sm">{buyTicketModalEvent.title}</div>
              <div className="text-text-secondary flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-primary" /> {buyTicketModalEvent.date}</div>
              <div className="text-text-secondary flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-primary" /> {buyTicketModalEvent.venue}</div>
              <div className="pt-2 border-t border-border flex justify-between font-bold">
                <span>Member Rate:</span>
                <span className="text-status-success">{buyTicketModalEvent.memberPrice}</span>
              </div>
            </div>

            <form onSubmit={handleBuyTicketSubmit} className="space-y-4">
              <div className="text-[11px] text-text-muted">
                By confirming, a digital ticket with verified QR credentials will be generated immediately into your "My Tickets" tab.
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setBuyTicketModalEvent(null)}
                  className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center shadow-subtle"
                >
                  Confirm & Reserve Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: APPLY AS VOLUNTEER */}
      {/* ========================================================= */}
      {applyVolunteerModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setApplyVolunteerModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Apply as Volunteer</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Event: {applyVolunteerModalEvent.eventName || applyVolunteerModalEvent.title}
              </p>
            </div>

            <form onSubmit={handleApplyVolunteerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Why do you want to volunteer for this role?
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your relevant skills, past event experience, or availability..."
                  value={volunteerMotivation}
                  onChange={(e) => setVolunteerMotivation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="p-3 rounded-lg bg-canvas text-[11px] text-text-muted space-y-1">
                <p>• Verified student members receive priority assignment.</p>
                <p>• Service hours are logged automatically to your institutional transcript upon completion.</p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setApplyVolunteerModalEvent(null)}
                  className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center shadow-subtle"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VIEW CERTIFICATE MODAL */}
      {/* ========================================================= */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-2xl w-full rounded-2xl border-4 border-[#C5A059] bg-[#FFFDF9] shadow-elevated p-8 space-y-6 relative text-center text-[#1A2E40]">
            <button
              onClick={() => setSelectedCertificateModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#1A2E40]/60 hover:text-[#1A2E40] hover:bg-black/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center">
              <UniversityCrest className="w-16 h-16 text-[#0F2942]" variant="navy" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] tracking-widest uppercase font-bold text-[#C5A059]">
                Division of Student Affairs & Campus Organizations
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#0F2942]">Certificate of Merit & Service</h2>
              <p className="text-xs text-text-secondary italic">This official credential certifies that</p>
            </div>

            <div className="py-2 border-b-2 border-[#C5A059]/40 max-w-sm mx-auto">
              <h3 className="text-2xl font-bold text-primary tracking-wide">{studentProfile.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">Student ID: {studentProfile.studentId}</p>
            </div>

            <p className="text-xs leading-relaxed max-w-md mx-auto text-text-secondary">
              has completed all requirements for the credential <span className="font-semibold text-text-primary">"{selectedCertificateModal.title}"</span> in connection with <span className="font-semibold text-text-primary">{selectedCertificateModal.eventName}</span>.
            </p>

            <div className="pt-6 border-t border-[#C5A059]/30 flex items-center justify-between text-left text-xs">
              <div>
                <p className="font-bold text-text-primary">{selectedCertificateModal.authorizedSigner}</p>
                <p className="text-[11px] text-text-muted">Dean & Faculty Supervisor</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-text-muted">Credential ID:</p>
                <p className="text-xs font-mono font-bold text-primary">{selectedCertificateModal.id}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => {
                  showToast('Certificate downloaded in high resolution PDF format.');
                  setSelectedCertificateModal(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center shadow-subtle"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: READ ANNOUNCEMENT MODAL */}
      {/* ========================================================= */}
      {selectedAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedAnnouncementModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                {selectedAnnouncementModal.category}
              </span>
              <h3 className="text-lg font-bold text-text-primary leading-snug mt-2">
                {selectedAnnouncementModal.title}
              </h3>
              <p className="text-xs text-text-muted">
                Published {selectedAnnouncementModal.publishedDate} by {selectedAnnouncementModal.author}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-canvas/40 text-xs text-text-secondary leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
              {selectedAnnouncementModal.fullContent}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedAnnouncementModal(null)}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
              >
                Close Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: RENEW MEMBERSHIP MODAL */}
      {/* ========================================================= */}
      {renewMembershipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setRenewMembershipModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-primary">Renew Academic Membership</h3>
              <p className="text-xs text-text-muted">Extend your affiliation and maintain voting & event privileges</p>
            </div>

            <div className="p-4 rounded-xl border-2 border-primary bg-primary-light/40 space-y-2 text-xs">
              <div className="flex justify-between items-center font-bold">
                <span className="text-sm text-text-primary">Full Academic Year 2027–2028</span>
                <span className="text-primary text-base">$35.00</span>
              </div>
              <p className="text-text-secondary">Includes free showcase passes, 75% hackathon subsidy, and verified certificate issuance.</p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-semibold text-text-primary">Payment Method</span>
              <div className="p-3 rounded-lg border border-border bg-canvas flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-medium text-text-primary">University Student Bursar Account</span>
                </div>
                <span className="text-[10px] text-status-success font-bold">Pre-Authorized</span>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRenewMembershipModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRenewMembershipConfirm}
                className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center shadow-subtle"
              >
                Confirm Renewal ($35)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: EDIT PROFILE MODAL */}
      {/* ========================================================= */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setEditProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Edit Student Profile</h3>
              <p className="text-xs text-text-muted mt-0.5">Update contact details and academic statement</p>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Department</label>
                <input
                  type="text"
                  value={editProfileForm.department}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Student Bio</label>
                <textarea
                  rows="2"
                  value={editProfileForm.bio}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: CHANGE PASSWORD MODAL */}
      {/* ========================================================= */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-5 relative">
            <button
              onClick={() => setChangePasswordModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-text-primary">Change Account Password</h3>
              <p className="text-xs text-text-muted mt-0.5">Protect your student organization access credentials</p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">New Password (min. 8 characters)</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberDashboard;
