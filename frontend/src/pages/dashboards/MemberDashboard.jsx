import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { CAMPUS_CLUBS } from '../../data/clubsData';
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
  ChevronRight,
  Download,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  FileText,
  AlertCircle,
  KeyRound,
  BadgeCheck,
  Send,
  Eye,
  ArrowRight,
  Camera,
  Upload
} from 'lucide-react';

export const MemberDashboard = () => {
  const { user, buyClubMembership, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active user's memberships
  const userMemberships = user?.memberships || [];
  const hasAnyClubMembership = userMemberships.length > 0;
  const isClubMember = (clubId) => userMemberships.some((m) => m.clubId === clubId && m.duesPaid);
  const isEligibleForMemberPrice = () => hasAnyClubMembership;

  // Active tab synchronized with URL query params
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

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState(() => ({
    name: user?.name || user?.fullName || 'Rohan Sharma',
    studentId: user?.studentId || user?.student_id || 'STU-2026-905',
    email: user?.email || 'rohan.sharma@studentorg.edu',
    phone: '+1 (555) 234-8910',
    department: user?.department || 'Computer Science & Software Engineering',
    semester: user?.semester || 'Junior (Year 3, Semester 5)',
    membershipType: hasAnyClubMembership
      ? userMemberships.map((m) => m.clubName).join(', ')
      : 'General Student (Non-Member)',
    membershipStatus: hasAnyClubMembership ? 'Active' : 'Non-Member',
    joinDate: hasAnyClubMembership ? userMemberships[0]?.joinDate || 'Oct 01, 2026' : 'Not Enrolled',
    expiryDate: hasAnyClubMembership ? userMemberships[0]?.expiryDate || 'June 30, 2027' : 'N/A',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Undergraduate student passionate about robotics, software architecture, and campus leadership.'
  }));

  // Sync profile when user changes
  useEffect(() => {
    if (user) {
      setStudentProfile((prev) => ({
        ...prev,
        name: user.name || user.fullName || prev.name,
        studentId: user.studentId || user.student_id || prev.studentId,
        email: user.email || prev.email,
        membershipType:
          user.memberships && user.memberships.length > 0
            ? user.memberships.map((m) => m.clubName).join(', ')
            : 'General Student (Non-Member)',
        membershipStatus: user.memberships && user.memberships.length > 0 ? 'Active' : 'Non-Member',
        joinDate:
          user.memberships && user.memberships.length > 0
            ? user.memberships[0]?.joinDate || prev.joinDate
            : 'Not Enrolled',
        expiryDate:
          user.memberships && user.memberships.length > 0
            ? user.memberships[0]?.expiryDate || prev.expiryDate
            : 'N/A'
      }));
    }
  }, [user]);

  // Events Master State
  const [eventsList] = useState([
    {
      id: 'evt-1',
      clubId: 'club-robotics',
      clubName: 'Skyline Robotics & AI Society',
      title: 'SkyLine Annual Robotics Showcase 2026',
      month: 'OCT',
      day: '14',
      date: 'Oct 14, 2026 • 2:00 PM – 6:00 PM',
      time: '2:00 PM – 6:00 PM',
      venue: 'Grand Hall, Turing Science Quad',
      availableSeats: 48,
      totalSeats: 200,
      memberPrice: '$0.00 (Free for Members)',
      memberPriceNum: 0,
      nonMemberPrice: '$15.00',
      nonMemberPriceNum: 15,
      savingsText: 'Save $15.00 (100% OFF)',
      status: 'Upcoming',
      category: 'Flagship Event',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Demonstrations of student-built autonomous rovers, drone swarms, and AI vision systems with industry evaluators.'
    },
    {
      id: 'evt-2',
      clubId: 'club-coding',
      clubName: 'Skyline Coding & Hackathon Guild',
      title: 'Full-Stack Web3 & Cloud Hackathon',
      month: 'OCT',
      day: '28',
      date: 'Oct 28, 2026 • 9:00 AM – 8:00 PM',
      time: '9:00 AM – 8:00 PM',
      venue: 'Innovation Center, Room 402',
      availableSeats: 22,
      totalSeats: 120,
      memberPrice: '$5.00 (75% Member Discount)',
      memberPriceNum: 5,
      nonMemberPrice: '$20.00',
      nonMemberPriceNum: 20,
      savingsText: 'Save $15.00 (75% OFF)',
      status: 'Registration Open',
      category: 'Hackathon',
      badgeColor: 'bg-zinc-900 text-white border-zinc-800',
      description: '11-hour intensive team hackathon building microservices, AI pipelines, and cloud web architectures with cash prizes.'
    },
    {
      id: 'evt-3',
      clubId: 'club-finance',
      clubName: 'Skyline Business & Investment League',
      title: 'Career & Industry Networking Night',
      month: 'NOV',
      day: '05',
      date: 'Nov 05, 2026 • 5:30 PM – 8:30 PM',
      time: '5:30 PM – 8:30 PM',
      venue: 'Student Union Ballroom',
      availableSeats: 65,
      totalSeats: 250,
      memberPrice: '$0.00 (Free for Members)',
      memberPriceNum: 0,
      nonMemberPrice: '$10.00',
      nonMemberPriceNum: 10,
      savingsText: 'Save $10.00 (100% OFF)',
      status: 'Registration Open',
      category: 'Career Networking',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Connect directly with hiring managers, software architects, and engineering directors from top regional tech employers.'
    },
    {
      id: 'evt-4',
      clubId: 'club-robotics',
      clubName: 'Skyline Robotics & AI Society',
      title: 'Hands-on Microcontroller & IoT Workshop',
      month: 'NOV',
      day: '18',
      date: 'Nov 18, 2026 • 1:00 PM – 4:00 PM',
      time: '1:00 PM – 4:00 PM',
      venue: 'Makerspace Lab 108',
      availableSeats: 12,
      totalSeats: 40,
      memberPrice: '$10.00 (Kit included)',
      memberPriceNum: 10,
      nonMemberPrice: '$35.00',
      nonMemberPriceNum: 35,
      savingsText: 'Save $25.00 (71% OFF)',
      status: 'Limited Seats',
      category: 'Technical Workshop',
      badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300',
      description: 'Build connected sensor nodes using ESP32, MQTT protocols, and telemetry dashboards. Hardware kits provided.'
    },
    {
      id: 'evt-5',
      clubId: 'club-arts',
      clubName: 'Campus Cultural & Creative Arts Society',
      title: 'Campus Cultural Gala & Music Festival',
      month: 'NOV',
      day: '26',
      date: 'Nov 26, 2026 • 6:30 PM – 10:00 PM',
      time: '6:30 PM – 10:00 PM',
      venue: 'Fine Arts Amphitheater',
      availableSeats: 90,
      totalSeats: 350,
      memberPrice: '$0.00 (Free for Members)',
      memberPriceNum: 0,
      nonMemberPrice: '$18.00',
      nonMemberPriceNum: 18,
      savingsText: 'Save $18.00 (100% OFF)',
      status: 'Registration Open',
      category: 'Cultural Gala',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Live musical performances, theatrical recitals, dance troupes, and culinary showcases celebrating campus student diversity.'
    }
  ]);

  // Tickets Master State
  const [ticketsList, setTicketsList] = useState(() => {
    if (user?.memberships && user.memberships.length > 0) {
      return [
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
      ];
    }
    return [];
  });

  // Volunteer Opportunities State
  const [volunteerOpportunities] = useState([
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

  // Certificates State
  const [certificatesList] = useState([
    {
      id: 'CERT-2026-ROB-104',
      title: 'Outstanding Technical Service & Showcase Marshal',
      eventName: 'SkyLine Annual Robotics Showcase 2026',
      issueDate: 'Oct 02, 2026',
      authorizedSigner: 'Dr. Alexander Vance',
      credentialHash: 'sha256-8a71d990bc02e12f'
    },
    {
      id: 'CERT-2026-VOL-048',
      title: 'Verified Civic Volunteer Service: 28 Hours',
      eventName: 'Office of Campus Student Affairs',
      issueDate: 'Sep 28, 2026',
      authorizedSigner: 'Dean of Student Affairs',
      credentialHash: 'sha256-11b93f77ea94c031'
    }
  ]);

  // Announcements State
  const [announcementsList] = useState([
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

  // Membership Payment History State
  const [membershipHistory, setMembershipHistory] = useState(() => {
    if (user?.memberships && user.memberships.length > 0) {
      return user.memberships.map((m, idx) => ({
        term: m.plan || 'Academic Year 2026–2027',
        plan: `${m.clubName} (${m.plan || 'Annual Membership'})`,
        amount: m.amount || '$35.00',
        paymentDate: m.paymentDate || 'Oct 01, 2026',
        receiptId: m.receiptId || `RCP-2026-${98100 + idx}`,
        status: m.status || 'Paid & Active'
      }));
    }
    return [];
  });

  // Recent Student Activity
  const recentActivities = [
    { id: 'act-1', text: 'Admitted to Annual Robotics Showcase 2026', time: 'Oct 02 • 11:30 AM', icon: Ticket, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'act-2', text: 'Hardware Demo Volunteer Role Approved', time: 'Oct 02 • 03:45 PM', icon: HeartHandshake, color: 'text-zinc-900 bg-zinc-100' },
    { id: 'act-3', text: 'Registered for Web3 & Cloud Hackathon', time: 'Oct 03 • 09:15 AM', icon: Calendar, color: 'text-emerald-700 bg-emerald-50' }
  ];

  // Filters & Search State
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('ALL');
  const [selectedClubCategory, setSelectedClubCategory] = useState('ALL');
  const [clubSearchQuery, setClubSearchQuery] = useState('');

  // Modals State
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [buyTicketModalEvent, setBuyTicketModalEvent] = useState(null);
  const [applyVolunteerModalEvent, setApplyVolunteerModalEvent] = useState(null);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Membership Purchase Modal State
  const [selectedClubForPurchase, setSelectedClubForPurchase] = useState(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState('Annual');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Student Account (Bursar)');

  const [volunteerMotivation, setVolunteerMotivation] = useState('');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [editProfileForm, setEditProfileForm] = useState({ ...studentProfile });
  const avatarInputRef = useRef(null);

  // Handle Photo Upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const newAvatarUrl = loadEvent.target.result;
      setStudentProfile((prev) => ({ ...prev, avatar: newAvatarUrl }));
      setEditProfileForm((prev) => ({ ...prev, avatar: newAvatarUrl }));
      if (updateUserProfile) {
        updateUserProfile({ avatar: newAvatarUrl });
      }
      showToast('Profile photo updated successfully!');
    };
    reader.readAsDataURL(file);
  };
  const handleBuyTicketSubmit = (e) => {
    e.preventDefault();
    if (!buyTicketModalEvent) return;

    const isMemberEligible = isEligibleForMemberPrice();
    const finalPricePaid = isMemberEligible ? buyTicketModalEvent.memberPrice : buyTicketModalEvent.nonMemberPrice;

    const newTicket = {
      id: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventTitle: buyTicketModalEvent.title,
      date: buyTicketModalEvent.date,
      venue: buyTicketModalEvent.venue,
      seat: isMemberEligible
        ? `Member Pass • Row B, Seat #${Math.floor(10 + Math.random() * 90)}`
        : `Standard Pass • Row D, Seat #${Math.floor(10 + Math.random() * 90)}`,
      pricePaid: finalPricePaid,
      purchaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Confirmed',
      qrCodeData: `CONNECTU-${buyTicketModalEvent.id.toUpperCase()}-${studentProfile.studentId}`
    };

    setTicketsList((prev) => [newTicket, ...prev]);
    setBuyTicketModalEvent(null);
    showToast(`Ticket for "${newTicket.eventTitle}" reserved successfully at ${finalPricePaid}!`);
  };

  const handleConfirmBuyMembership = () => {
    if (!selectedClubForPurchase) return;
    const duesAmount =
      selectedPlanForPurchase === 'Annual'
        ? selectedClubForPurchase.annualDues
        : selectedClubForPurchase.semesterDues;

    const result = buyClubMembership(
      selectedClubForPurchase,
      selectedPlanForPurchase,
      duesAmount,
      selectedPaymentMethod
    );

    if (result.success) {
      const newHistoryItem = {
        term: `Academic Year 2026–2027`,
        plan: `${selectedClubForPurchase.name} (${selectedPlanForPurchase} Membership)`,
        amount: `$${duesAmount.toFixed(2)}`,
        paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        receiptId: result.membership.receiptId,
        status: 'Paid & Active'
      };
      setMembershipHistory((prev) => [newHistoryItem, ...prev]);

      setStudentProfile((prev) => ({
        ...prev,
        membershipStatus: 'Active',
        membershipType: `${selectedClubForPurchase.shortName} (${selectedPlanForPurchase})`,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        expiryDate: selectedPlanForPurchase === 'Annual' ? 'June 30, 2027' : 'Dec 31, 2026'
      }));

      setSelectedClubForPurchase(null);
      showToast(`🎉 Welcome to ${selectedClubForPurchase.name}! Your membership is active. Membered prices are now unlocked across all events!`);
    } else {
      showToast(result.error || 'Failed to activate membership.', 'error');
    }
  };

  const handleApplyVolunteerSubmit = (e) => {
    e.preventDefault();
    if (!applyVolunteerModalEvent) return;

    const newApplication = {
      id: `app-${Math.floor(200 + Math.random() * 800)}`,
      eventName: applyVolunteerModalEvent.eventName || applyVolunteerModalEvent.title,
      roleApplied: applyVolunteerModalEvent.roleNeeded || 'Event Operations & Logistics',
      appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending',
      feedback: 'Application submitted successfully. Awaiting administrator review.'
    };

    setVolunteerApplications((prev) => [newApplication, ...prev]);
    setApplyVolunteerModalEvent(null);
    setVolunteerMotivation('');
    showToast('Volunteer application submitted successfully!');
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    setChangePasswordModalOpen(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully!');
  };

  const handleEditProfileSubmit = (e) => {
    e.preventDefault();
    setStudentProfile({ ...editProfileForm });
    if (updateUserProfile) {
      updateUserProfile({
        name: editProfileForm.name,
        phone: editProfileForm.phone,
        department: editProfileForm.department,
        avatar: editProfileForm.avatar
      });
    }
    setEditProfileModalOpen(false);
    showToast('Student profile updated successfully!');
  };

  // Filtered Events
  const filteredEvents = eventsList.filter((evt) => {
    const matchesQuery =
      evt.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.clubName.toLowerCase().includes(eventSearchQuery.toLowerCase());
    const matchesCategory =
      eventCategoryFilter === 'ALL' ||
      evt.category.toLowerCase().includes(eventCategoryFilter.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-md border flex items-center space-x-2 text-xs font-semibold animate-fadeIn ${toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW (Purpose = Quick Overview)     */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Student Dashboard
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Welcome back, <strong className="text-slate-700">{studentProfile.name}</strong>. Here is your campus activity overview.
                </p>
              </div>

              {/* Status Indicator */}
              <div>
                {hasAnyClubMembership ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Active Member ({userMemberships.length} Society)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-300">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-zinc-600" />
                    Standard Student (Non-Member)
                  </span>
                )}
              </div>
            </div>

            {/* 4 Crisp Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Membership Standing */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Membership Standing</span>
                    <ShieldCheck className={`w-4 h-4 ${hasAnyClubMembership ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    {hasAnyClubMembership ? 'Active Member' : 'Non-Member'}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hasAnyClubMembership ? `${userMemberships.length} society dues paid` : 'Regular rates apply'}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('membership')}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>{hasAnyClubMembership ? 'Manage Clubs' : 'Join a Club'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 2: Available Campus Events */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Upcoming Events</span>
                    <Calendar className="w-4 h-4 text-zinc-700" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    {eventsList.length} Events
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open for student registration
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('events')}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Browse Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 3: Active Event Tickets */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>My Tickets</span>
                    <Ticket className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    {ticketsList.length} Active Passes
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ready for gate scan
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('tickets')}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Passes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 4: Volunteer Service Hours */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Volunteer Hours</span>
                    <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    9.5 Hours
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Certified on transcript
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('volunteer')}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Volunteer Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2-Column Main Section (60% / 40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column (7 of 12 cols): Next Upcoming Events & My Passes */}
              <div className="lg:col-span-7 space-y-5">

                {/* Upcoming Events Box */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Next Upcoming Events</h2>
                      <p className="text-xs text-slate-500">Discover and register for upcoming campus programs</p>
                    </div>
                    <button
                      onClick={() => handleTabSelect('events')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {eventsList.slice(0, 3).map((evt) => (
                      <div key={evt.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              {evt.category}
                            </span>
                            <span className="text-xs text-slate-500">{evt.clubName}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                            {evt.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {evt.date.split('•')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.venue}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                          <div className="text-left sm:text-right">
                            {isEligibleForMemberPrice() ? (
                              <div>
                                <span className="text-xs font-semibold text-emerald-700">{evt.memberPrice.split(' ')[0]}</span>
                                <span className="text-[10px] text-slate-400 line-through ml-1.5">{evt.nonMemberPrice}</span>
                                <span className="block text-[10px] text-emerald-600 font-medium">Member Rate</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs font-semibold text-slate-900">{evt.nonMemberPrice}</span>
                                <span className="block text-[10px] text-slate-500">Member: {evt.memberPrice.split(' ')[0]}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => setBuyTicketModalEvent(evt)}
                            className="px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
                          >
                            Reserve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* My Active Passes Preview */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">My Active Admission Passes</h2>
                      <p className="text-xs text-slate-500">Digital tickets verified for gate check-in</p>
                    </div>
                    <button
                      onClick={() => handleTabSelect('tickets')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      All Tickets ({ticketsList.length})
                    </button>
                  </div>

                  {ticketsList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      You have no active event tickets. Browse upcoming events to reserve your seat.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 pt-1">
                      {ticketsList.slice(0, 2).map((tck) => (
                        <div key={tck.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-slate-400">{tck.id}</span>
                            <p className="text-xs font-semibold text-slate-900">{tck.eventTitle}</p>
                            <p className="text-[11px] text-slate-500">{tck.venue} • {tck.seat}</p>
                          </div>
                          <button
                            onClick={() => setSelectedTicketModal(tck)}
                            className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1 transition"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            <span>QR Pass</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (5 of 12 cols): Quick Actions & Recent Activity */}
              <div className="lg:col-span-5 space-y-5">

                {/* Quick Actions */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleTabSelect('membership')}
                      className="w-full px-3 py-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>Explore & Join Campus Clubs</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabSelect('events')}
                      className="w-full px-3 py-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-700" />
                        <span>Discover Campus Events</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabSelect('volunteer')}
                      className="w-full px-3 py-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-emerald-700" />
                        <span>Apply for Volunteer Service</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Recent Activity
                  </h3>
                  <div className="space-y-3 text-xs">
                    {recentActivities.map((act) => {
                      const Icon = act.icon;
                      return (
                        <div key={act.id} className="flex items-start space-x-2.5">
                          <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${act.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 leading-snug">{act.text}</p>
                            <span className="text-[10px] text-slate-400">{act.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Notice */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {announcementsList[0].category}
                    </span>
                    <span className="text-[10px] text-slate-400">{announcementsList[0].publishedDate.split('•')[0]}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                    {announcementsList[0].title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {announcementsList[0].summary}
                  </p>
                  <button
                    onClick={() => setSelectedAnnouncementModal(announcementsList[0])}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline block pt-1 cursor-pointer"
                  >
                    Read Full Notice →
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CLUBS & MEMBERSHIPS (Purpose = View & Join Clubs) */}
        {/* ========================================================= */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Clubs & Memberships
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Join campus societies, compare membership dues, and unlock verified member discounts.
              </p>
            </div>

            {/* Current Affiliation Status Banner */}
            {hasAnyClubMembership ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-900 block">
                      Active Member Privileges Unlocked
                    </span>
                    <span className="text-emerald-700">
                      You are an enrolled member of: <strong>{userMemberships.map((m) => m.clubName).join(', ')}</strong>. You receive free passes ($0.00) or up to 75% subsidies across campus events!
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleTabSelect('events')}
                  className="px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-medium whitespace-nowrap transition cursor-pointer"
                >
                  View Discounted Events
                </button>
              </div>
            ) : (
              <div className="bg-zinc-900 text-white rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-white block">
                      Standard Student Rate Active (Non-Member)
                    </span>
                    <span className="text-zinc-300">
                      You do not have an active club membership. Non-members pay regular admission prices ($15–$35). Enroll in a club below to unlock membered pricing!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Clubs Catalog Filter Toolbar */}
            <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Category:
                </span>
                {['ALL', 'Engineering & Technology', 'Computer Science', 'Finance & Business', 'Arts & Media', 'Civic & Ecology'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedClubCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap cursor-pointer ${selectedClubCategory === cat
                        ? 'bg-zinc-900 text-white font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                  >
                    {cat === 'ALL' ? 'All Clubs' : cat.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={clubSearchQuery}
                  onChange={(e) => setClubSearchQuery(e.target.value)}
                  placeholder="Search clubs, advisors..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Clubs Grid (6 Available Clubs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CAMPUS_CLUBS.filter((club) => {
                const matchesCat =
                  selectedClubCategory === 'ALL' ||
                  club.category.toLowerCase().includes(selectedClubCategory.toLowerCase());
                const matchesSearch =
                  club.name.toLowerCase().includes(clubSearchQuery.toLowerCase()) ||
                  club.tagline.toLowerCase().includes(clubSearchQuery.toLowerCase());
                return matchesCat && matchesSearch;
              }).map((club) => {
                const isEnrolled = isClubMember(club.id);

                return (
                  <div
                    key={club.id}
                    className={`bg-white rounded-lg border transition flex flex-col justify-between shadow-xs overflow-hidden ${isEnrolled ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div>
                      {/* Club Image Banner */}
                      <div className="relative h-36 bg-slate-100 overflow-hidden">
                        <img
                          src={club.image}
                          alt={club.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900/90 text-white">
                            {club.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/95 text-slate-800 shadow-xs">
                            {club.availableSeats} spots open
                          </span>
                        </div>
                      </div>

                      {/* Club Details */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                              {club.name}
                            </h3>
                            {isEnrolled && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex-shrink-0">
                                Enrolled
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {club.tagline}
                          </p>
                        </div>

                        {/* Meeting Schedule */}
                        <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{club.meetingTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{club.advisor}</span>
                          </div>
                        </div>

                        {/* Perks */}
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-700 block">Member Benefits:</span>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {club.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Dues & Action */}
                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Annual Dues</span>
                        <span className="text-sm font-semibold text-slate-900">${club.annualDues.toFixed(2)}/yr</span>
                      </div>

                      {isEnrolled ? (
                        <span className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active Member</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedClubForPurchase(club);
                            setSelectedPlanForPurchase('Annual');
                          }}
                          className="px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                        >
                          Join Club (${club.annualDues.toFixed(0)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Membership Payment History Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Membership Dues Payment Ledger</h3>
                  <p className="text-xs text-slate-500">Official student affiliation receipts</p>
                </div>
                <span className="text-xs text-slate-400">{membershipHistory.length} Record(s)</span>
              </div>

              {membershipHistory.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No membership dues transactions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                        <th className="py-2.5 px-3 font-semibold">Academic Term</th>
                        <th className="py-2.5 px-3 font-semibold">Society / Plan</th>
                        <th className="py-2.5 px-3 font-semibold">Amount Paid</th>
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Receipt ID</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {membershipHistory.map((hist, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{hist.term}</td>
                          <td className="py-2.5 px-3 text-slate-600">{hist.plan}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{hist.amount}</td>
                          <td className="py-2.5 px-3 text-slate-500">{hist.paymentDate}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{hist.receiptId}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => showToast(`Receipt ${hist.receiptId} downloaded.`)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EVENTS (Purpose = Discover & Register)             */}
        {/* ========================================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Header & Status Banner */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                    Campus Events & Experiences
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse verified student competitions, hackathons, and guest symposiums with automatic member discounts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Available
                  </span>
                </div>
              </div>

              {/* Member Benefit Banner (Clean, light SaaS styling) */}
              {hasAnyClubMembership ? (
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Active Member Benefits Unlocked</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Subsidized
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your society standing unlocks <strong className="text-emerald-700 font-semibold">$0.00 Free admission</strong> or up to 75% discounts across all campus events.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <span className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg font-medium text-slate-700 border border-slate-200">
                      Total Unlocked Savings: <strong className="text-emerald-700 font-semibold">$78.00</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Unlock 100% Free Campus Event Passes</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Students enrolled in any campus society get free passes ($0.00) or heavy subsidies. Join any club to activate discounts!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTabSelect('membership')}
                    className="h-9 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    <span>Browse Clubs & Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Filter Toolbar (Chips + Search + Category Select) */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search events by title, venue, or host society..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={eventCategoryFilter}
                  onChange={(e) => setEventCategoryFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Flagship">Flagship Events</option>
                  <option value="Hackathon">Hackathons</option>
                  <option value="Career">Career & Networking</option>
                  <option value="Workshop">Workshops</option>
                  <option value="Cultural">Cultural Gala</option>
                </select>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                <span className="text-slate-400 text-xs font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {[
                  { label: 'All Events', val: 'ALL' },
                  { label: 'Flagship Showcases', val: 'Flagship' },
                  { label: 'Hackathons', val: 'Hackathon' },
                  { label: 'Career Networking', val: 'Career' },
                  { label: 'Workshops', val: 'Workshop' },
                  { label: 'Cultural & Arts', val: 'Cultural' }
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => setEventCategoryFilter(f.val)}
                    className={`h-7 px-2.5 rounded-md text-xs font-medium transition whitespace-nowrap cursor-pointer ${eventCategoryFilter === f.val
                        ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List Cards */}
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No events found matching "{eventSearchQuery}". Try clearing filters.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const qualifiesForMemberPrice = isEligibleForMemberPrice();

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 group"
                    >
                      {/* Left: Date Block & Core Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Calendar Date Block */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden text-center shadow-2xs">
                          <div className="w-full bg-zinc-900 text-[10px] font-bold tracking-wider text-white py-0.5 uppercase">
                            {evt.month}
                          </div>
                          <div className="w-full py-1 text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                            {evt.day}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${evt.badgeColor}`}>
                              {evt.category}
                            </span>
                            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                              {evt.clubName}
                            </span>
                            {evt.availableSeats <= 15 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                                ⚡ Only {evt.availableSeats} Seats Left!
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                            {evt.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {evt.time}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.venue}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full"
                                  style={{ width: `${Math.round(((evt.totalSeats - evt.availableSeats) / evt.totalSeats) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                <strong className="text-slate-800">{evt.availableSeats}</strong>/{evt.totalSeats} seats open
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Sleek Compact Price Display & Single Standard Action Button */}
                      <div className="flex flex-col sm:items-end justify-between w-full lg:w-60 gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0">
                        {/* Compact Sleek Price Block */}
                        <div
                          className={`w-full px-3 py-2 rounded-lg border transition-all ${qualifiesForMemberPrice
                              ? 'bg-emerald-50/70 border-emerald-200/80 text-left sm:text-right'
                              : 'bg-slate-50 border-slate-200 text-left sm:text-right'
                            }`}
                        >
                          {qualifiesForMemberPrice ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center sm:justify-end gap-1.5">
                                <span className="text-base font-bold text-emerald-800">
                                  {evt.memberPriceNum === 0 ? 'FREE' : `$${evt.memberPriceNum.toFixed(2)}`}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  {evt.nonMemberPrice}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-700 text-white shadow-2xs">
                                  Member
                                </span>
                              </div>
                              <div className="text-[10px] font-medium text-emerald-700 sm:text-right">
                                ✓ {evt.savingsText}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="flex items-center sm:justify-end gap-1.5">
                                <span className="text-base font-bold text-slate-900">
                                  {evt.nonMemberPrice}
                                </span>
                                <span className="text-xs text-slate-400">Regular</span>
                              </div>
                              <div className="text-[10px] text-slate-600 sm:text-right">
                                Club price: <strong className="text-emerald-700">{evt.memberPriceNum === 0 ? 'FREE' : `$${evt.memberPriceNum.toFixed(2)}`}</strong> •{' '}
                                <button
                                  onClick={() => handleTabSelect('membership')}
                                  className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
                                >
                                  Join →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Single Standard Action Button */}
                        <button
                          onClick={() => setBuyTicketModalEvent(evt)}
                          className={`h-9 px-4 w-full rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-[0.98] cursor-pointer ${qualifiesForMemberPrice
                              ? 'bg-emerald-700 hover:bg-emerald-800'
                              : 'bg-zinc-900 hover:bg-black'
                            }`}
                        >
                          <Ticket className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            {qualifiesForMemberPrice
                              ? evt.memberPriceNum === 0
                                ? 'Claim Free Pass'
                                : 'Reserve Member Pass'
                              : 'Buy Admission Ticket'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY TICKETS (Purpose = Manage Passes & QR Check-in) */}
        {/* ========================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                My Event Tickets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Present QR credentials at the door for electronic attendee verification.
              </p>
            </div>

            {ticketsList.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-10 text-center space-y-2">
                <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-800">No Tickets Reserved Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse campus events and reserve your digital admission ticket.
                </p>
                <button
                  onClick={() => handleTabSelect('events')}
                  className="mt-2 px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Explore Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ticketsList.map((tck) => (
                  <div
                    key={tck.id}
                    className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-semibold text-zinc-900">{tck.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tck.status}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 leading-snug">
                        {tck.eventTitle}
                      </h3>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tck.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tck.venue}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                        <span>Seat: <strong>{tck.seat}</strong></span>
                        <span>Rate: <strong>{tck.pricePaid}</strong></span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedTicketModal(tck)}
                        className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Pass QR</span>
                      </button>
                      <button
                        onClick={() => showToast(`Ticket ${tck.id} downloaded.`)}
                        className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: VOLUNTEER (Purpose = Opportunities & Hours)       */}
        {/* ========================================================= */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Volunteer Hub
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign up for verified campus service roles and log academic honors hours.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                9.5 Certified Hours Recorded
              </div>
            </div>

            {/* Available Roles */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">Available Volunteer Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {volunteerOpportunities.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {opp.credits}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900">{opp.eventName}</h3>
                      <p className="text-xs text-slate-600">Role: <strong>{opp.roleNeeded}</strong></p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {opp.duration}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                      <span className="text-slate-400 text-[11px]">{opp.slotsAvailable} spots remaining</span>
                      <button
                        onClick={() => setApplyVolunteerModalEvent(opp)}
                        className="px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Volunteer Applications Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">My Applications & History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="py-2.5 px-3 font-semibold">Event Name</th>
                      <th className="py-2.5 px-3 font-semibold">Role Applied</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold">Administrator Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {volunteerApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-800">{app.eventName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{app.roleApplied}</td>
                        <td className="py-2.5 px-3 text-slate-500">{app.appliedDate}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${app.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                              }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs">{app.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CERTIFICATES (Purpose = Verified Credentials)     */}
        {/* ========================================================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Academic Certificates & Credentials
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Official certificates awarded by faculty advisors and the Student Affairs Senate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificatesList.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <span className="font-mono text-[10px] text-slate-400">{cert.id}</span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-600">{cert.eventName}</p>

                    <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                      <span>Issued: <strong>{cert.issueDate}</strong></span>
                      <span>By: <strong>{cert.authorizedSigner}</strong></span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedCertificateModal(cert)}
                      className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Credential</span>
                    </button>
                    <button
                      onClick={() => showToast(`Certificate ${cert.id} downloaded.`)}
                      className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: ANNOUNCEMENTS (Purpose = Campus Bulletins Feed)    */}
        {/* ========================================================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Announcements
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Official broadcasts from student council, faculty advisors, and executive leaders.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100">
              {announcementsList.map((anc) => (
                <div key={anc.id} className="p-4 sm:p-5 space-y-2 hover:bg-slate-50/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {anc.category}
                    </span>
                    <span className="text-xs text-slate-400">{anc.publishedDate}</span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {anc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {anc.summary}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Published by: {anc.author}</span>
                    <button
                      onClick={() => setSelectedAnnouncementModal(anc)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Read Full Notice →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PROFILE (Purpose = Student Records & Credentials)  */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Student Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your academic record, contact details, and account credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs text-center space-y-3">
                {/* Photo Upload Input (hidden) */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                {/* Avatar with Camera upload trigger */}
                <div className="relative w-24 h-24 mx-auto group">
                  <img
                    src={studentProfile.avatar}
                    alt={studentProfile.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-slate-200 shadow-2xs group-hover:brightness-95 transition"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-900 hover:bg-black text-white shadow-xs border-2 border-white transition flex items-center justify-center cursor-pointer"
                    title="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" /> Upload Photo
                  </button>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 5MB)</p>
                </div>

                <div className="pt-1">
                  <h3 className="text-base font-semibold text-slate-900">{studentProfile.name}</h3>
                  <p className="text-xs font-mono text-slate-500">{studentProfile.studentId}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{studentProfile.department}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => setEditProfileModalOpen(true)}
                    className="w-full h-9 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    Edit Profile Details
                  </button>
                  <button
                    onClick={() => setChangePasswordModalOpen(true)}
                    className="w-full h-9 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>

              {/* Academic Details */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
                  Academic & Registration Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-medium text-slate-800">{studentProfile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone Number</span>
                    <span className="font-medium text-slate-800">{studentProfile.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Academic Standing</span>
                    <span className="font-medium text-emerald-700">Good Standing (FERPA Verified)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Semester Term</span>
                    <span className="font-medium text-slate-800">{studentProfile.semester}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block">Student Statement</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{studentProfile.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL 1: VIEW TICKET QR PASS                             */}
      {/* ========================================================= */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-sm w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Digital Admission Pass</h3>
              <p className="text-xs text-slate-500">Present at entrance gate for scanner</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg text-center space-y-3 border border-slate-200">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded border border-slate-200 flex flex-col items-center justify-center">
                <QrCode className="w-24 h-24 text-slate-800" />
                <span className="text-[9px] font-mono text-slate-400 mt-1">{selectedTicketModal.id}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs">{selectedTicketModal.eventTitle}</p>
                <p className="text-[11px] text-slate-500">{selectedTicketModal.venue}</p>
                <p className="text-[11px] text-slate-600 font-medium">{selectedTicketModal.date}</p>
              </div>
            </div>

            <button
              onClick={() => {
                showToast('Ticket PDF downloaded.');
                setSelectedTicketModal(null);
              }}
              className="w-full py-2 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              Download PDF Pass
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: BUY TICKET CONFIRMATION                         */}
      {/* ========================================================= */}
      {buyTicketModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setBuyTicketModalEvent(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-semibold text-slate-900">Reserve Event Admission</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEligibleForMemberPrice() ? 'Active member rate applied' : 'Standard student rate applied'}
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">{buyTicketModalEvent.title}</div>
              <div className="text-slate-500 text-[11px]">{buyTicketModalEvent.clubName}</div>
              <div className="text-slate-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {buyTicketModalEvent.date}</div>
              <div className="text-slate-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {buyTicketModalEvent.venue}</div>

              <div className="pt-2 border-t border-slate-200">
                {isEligibleForMemberPrice() ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-900 block">Member Price:</span>
                      <span className="text-[10px] text-emerald-700 font-medium">✓ Active Society Member</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through block">{buyTicketModalEvent.nonMemberPrice}</span>
                      <span className="text-sm font-semibold text-emerald-700">{buyTicketModalEvent.memberPrice}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Standard Rate:</span>
                      <span className="text-sm font-semibold text-slate-900">{buyTicketModalEvent.nonMemberPrice}</span>
                    </div>
                    <div className="p-2 rounded bg-zinc-100 border border-zinc-200 text-[11px] text-zinc-800">
                      Club members pay only <strong>{buyTicketModalEvent.memberPrice}</strong>!{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setBuyTicketModalEvent(null);
                          handleTabSelect('membership');
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                      >
                        Join a club first →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleBuyTicketSubmit} className="space-y-3">
              <p className="text-[11px] text-slate-500">
                A verified QR admission ticket will be generated into your "My Tickets" tab.
              </p>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBuyTicketModalEvent(null)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 h-9 rounded-lg text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs ${
                    isEligibleForMemberPrice() ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-zinc-900 hover:bg-black'
                  }`}
                >
                  {isEligibleForMemberPrice() ? 'Confirm (Member Rate)' : 'Confirm & Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: APPLY AS VOLUNTEER                              */}
      {/* ========================================================= */}
      {applyVolunteerModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setApplyVolunteerModalEvent(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-semibold text-slate-900">Volunteer Application</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {applyVolunteerModalEvent.eventName || applyVolunteerModalEvent.title}
              </p>
            </div>

            <form onSubmit={handleApplyVolunteerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Relevant Experience or Availability:
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Mention previous campus volunteer roles or availability..."
                  value={volunteerMotivation}
                  onChange={(e) => setVolunteerMotivation(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                ></textarea>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setApplyVolunteerModalEvent(null)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VIEW CERTIFICATE                                */}
      {/* ========================================================= */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-xl w-full rounded-lg bg-white border-2 border-emerald-600/40 shadow-md p-8 space-y-5 relative text-center">
            <button
              onClick={() => setSelectedCertificateModal(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <UniversityCrest className="w-12 h-12 mx-auto text-zinc-900" variant="black" />

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Official Credential of Student Merit
              </span>
              <h2 className="text-xl font-semibold text-slate-900">Certificate of Service & Leadership</h2>
              <p className="text-xs text-slate-500">This certifies that</p>
            </div>

            <div className="py-2 border-b border-emerald-300 max-w-xs mx-auto">
              <span className="text-lg font-bold text-slate-900">{studentProfile.name}</span>
              <p className="text-xs text-slate-400 mt-0.5">{studentProfile.studentId}</p>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              has completed all requirements for "{selectedCertificateModal.title}" during {selectedCertificateModal.eventName}.
            </p>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 text-left">
              <div>
                <p className="font-semibold text-slate-800">{selectedCertificateModal.authorizedSigner}</p>
                <p className="text-[10px] text-slate-400">Faculty Supervisor</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-slate-400">{selectedCertificateModal.id}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">VERIFIED</p>
              </div>
            </div>

            <button
              onClick={() => {
                showToast('Certificate PDF downloaded.');
                setSelectedCertificateModal(null);
              }}
              className="w-full py-2 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: READ ANNOUNCEMENT                               */}
      {/* ========================================================= */}
      {selectedAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-lg w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-3.5 relative">
            <button
              onClick={() => setSelectedAnnouncementModal(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {selectedAnnouncementModal.category}
              </span>
              <h3 className="text-base font-semibold text-slate-900 leading-snug pt-1">
                {selectedAnnouncementModal.title}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedAnnouncementModal.publishedDate} by {selectedAnnouncementModal.author}
              </p>
            </div>

            <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
              {selectedAnnouncementModal.fullContent}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedAnnouncementModal(null)}
                className="px-4 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: JOIN CLUB & BUY MEMBERSHIP                      */}
      {/* ========================================================= */}
      {selectedClubForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-lg w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedClubForPurchase(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {selectedClubForPurchase.category}
              </span>
              <h3 className="text-base font-semibold text-slate-900 leading-snug pt-1">
                {selectedClubForPurchase.name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedClubForPurchase.tagline}
              </p>
            </div>

            {/* Term Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Choose Membership Term:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForPurchase('Annual')}
                  className={`p-3 rounded-md border text-left transition cursor-pointer ${
                    selectedPlanForPurchase === 'Annual'
                      ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                    <span>Full Year</span>
                    {selectedPlanForPurchase === 'Annual' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    ${selectedClubForPurchase.annualDues.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Valid thru June 2027</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlanForPurchase('Semester')}
                  className={`p-3 rounded-md border text-left transition cursor-pointer ${
                    selectedPlanForPurchase === 'Semester'
                      ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                    <span>Single Semester</span>
                    {selectedPlanForPurchase === 'Semester' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    ${selectedClubForPurchase.semesterDues.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Valid thru Dec 2026</span>
                </button>
              </div>
            </div>

            {/* Instant Benefits */}
            <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <span className="font-semibold block">Member Privileges:</span>
              <p>• 100% Free or subsidized passes across events</p>
              <p>• Official digital society credential & voting seat</p>
            </div>

            {/* Payment Method */}
            <div className="space-y-1 text-xs">
              <label className="block font-medium text-slate-700">Payment Account:</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
              >
                <option value="Student Account (Bursar)">Student ID Bursar Account (Pre-Authorized)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Campus Pay / Mobile Wallet">Campus Pay</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClubForPurchase(null)}
                className="flex-1 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBuyMembership}
                className="flex-1 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                Pay ${selectedPlanForPurchase === 'Annual' ? selectedClubForPurchase.annualDues.toFixed(2) : selectedClubForPurchase.semesterDues.toFixed(2)} & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: EDIT PROFILE                                    */}
      {/* ========================================================= */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setEditProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-semibold text-slate-900">Edit Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update contact details</p>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-3.5 text-xs">
              {/* Photo Upload Section */}
              <div className="flex items-center space-x-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <img
                  src={editProfileForm.avatar || studentProfile.avatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-8 px-3 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                  </button>
                  <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG or WEBP (Max 5MB)</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editProfileForm.phone}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editProfileForm.department}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, department: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: CHANGE PASSWORD                                 */}
      {/* ========================================================= */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 shadow-md p-6 space-y-4 relative">
            <button
              onClick={() => setChangePasswordModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update account login password</p>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="flex-1 h-9 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs"
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
