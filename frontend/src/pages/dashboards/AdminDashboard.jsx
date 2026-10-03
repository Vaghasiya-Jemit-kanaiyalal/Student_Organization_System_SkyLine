import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MemberManagementPage from '../admin/MemberManagementPage';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { EventsManagementModule } from '../../components/events/EventsManagementModule';
import { AnnouncementsManagementModule } from '../../components/announcements/AnnouncementsManagementModule';
import { AdminMerchManager } from '../../components/merchandise/AdminMerchManager';
import {
  CLUB_MEMBERS_ADMIN,
  CAMPUS_EVENTS,
  ANNOUNCEMENTS,
  MERCHANDISE_ITEMS
} from '../../data/mockData';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  ShoppingBag,
  DollarSign,
  HeartHandshake,
  FileText,
  UserPlus,
  ShieldPlus,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Check,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const normalizeTab = (t) => {
    if (t === 'roster') return 'members';
    if (t === 'broadcasts' || t === 'broadcast') return 'announcements';
    if (t === 'store') return 'merchandise';
    return t;
  };

  const queryParams = new URLSearchParams(location.search);
  const initialTab = normalizeTab(queryParams.get('tab') || 'overview');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [eventsSubTab, setEventsSubTab] = useState('all');
  const [announcementsSubTab, setAnnouncementsSubTab] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(normalizeTab(tab));
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  // Master Data State
  const [memberRoster, setMemberRoster] = useState(CLUB_MEMBERS_ADMIN);
  const [events, setEvents] = useState(CAMPUS_EVENTS);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);

  // Modals state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateTreasurerModalOpen, setIsCreateTreasurerModalOpen] = useState(false);

  // Overview Governance Log Filter
  const [governanceFilter, setGovernanceFilter] = useState('ALL');

  // Merchandise State
  const [merchSearch, setMerchSearch] = useState('');
  const [merchCategoryFilter, setMerchCategoryFilter] = useState('ALL');

  // Volunteers State
  const [volunteerHours, setVolunteerHours] = useState([
    {
      id: 'vol-1',
      studentName: 'Julian Vance',
      studentId: 'STU-2026-1049',
      role: 'Hardware Lab Volunteer',
      event: 'Autonomous Quadcopter Workshop',
      hours: 8,
      date: 'Oct 01, 2026',
      status: 'VERIFIED',
      supervisor: 'Dr. Alexander Vance'
    },
    {
      id: 'vol-2',
      studentName: 'Elena Rostova',
      studentId: 'STU-2026-3021',
      role: 'Guest Speaker Coordinator',
      event: 'AI Ethics Symposium 2026',
      hours: 6,
      date: 'Sep 28, 2026',
      status: 'VERIFIED',
      supervisor: 'Dr. Alexander Vance'
    },
    {
      id: 'vol-3',
      studentName: 'Marcus Sterling',
      studentId: 'STU-2026-4419',
      role: 'Check-in Desk Lead',
      event: 'Annual Robotics Showcase 2026',
      hours: 10,
      date: 'Sep 25, 2026',
      status: 'VERIFIED',
      supervisor: 'Prof. Alistair Finch'
    },
    {
      id: 'vol-4',
      studentName: 'Devon Martinez',
      studentId: 'STU-2026-7890',
      role: 'Stage & Audio Tech',
      event: 'Freshman Orientation Hackathon',
      hours: 4,
      date: 'Oct 02, 2026',
      status: 'PENDING',
      supervisor: 'Student Council Rep'
    }
  ]);

  // New Treasurer Form State
  const [newTreasurer, setNewTreasurer] = useState({
    name: '',
    email: '',
    studentId: '',
    password: 'password123',
    department: 'School of Engineering & Applied Sciences'
  });
  const [treasurerCreatedSuccess, setTreasurerCreatedSuccess] = useState(false);

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    studentId: '',
    role: 'Member'
  });

  // Navigation Helpers
  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/dashboard?tab=${tabId}`);
  };

  const navigateToEvents = (subTab = 'all') => {
    setEventsSubTab(subTab);
    setActiveTab('events');
    navigate('/admin/dashboard?tab=events');
  };

  const navigateToAnnouncements = (subTab = 'all') => {
    setAnnouncementsSubTab(subTab);
    setActiveTab('announcements');
    navigate('/admin/dashboard?tab=announcements');
  };

  const handleCreateTreasurer = (e) => {
    e.preventDefault();
    if (!newTreasurer.name || !newTreasurer.email || !newTreasurer.studentId) return;

    const newRosterEntry = {
      id: `mem-${Date.now().toString().slice(-3)}`,
      name: newTreasurer.name,
      studentId: newTreasurer.studentId,
      email: newTreasurer.email,
      role: 'Treasurer (Appointed)',
      duesStatus: 'PAID',
      attendance: '100%',
      joinDate: 'Oct 03, 2026'
    };

    setMemberRoster([newRosterEntry, ...memberRoster]);
    setTreasurerCreatedSuccess(true);
    setTimeout(() => {
      setTreasurerCreatedSuccess(false);
      setIsCreateTreasurerModalOpen(false);
      setNewTreasurer({
        name: '',
        email: '',
        studentId: '',
        password: 'password123',
        department: 'School of Engineering & Applied Sciences'
      });
    }, 2000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name || !newMemberForm.email) return;

    setMemberRoster([
      {
        id: `mem-${Date.now().toString().slice(-3)}`,
        name: newMemberForm.name,
        studentId: newMemberForm.studentId || `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        email: newMemberForm.email,
        role: newMemberForm.role,
        duesStatus: 'PAID',
        attendance: '90%',
        joinDate: 'Oct 03, 2026'
      },
      ...memberRoster
    ]);
    setIsAddMemberModalOpen(false);
    setNewMemberForm({ name: '', email: '', studentId: '', role: 'Member' });
  };

  const handleToggleVolunteerApproval = (id) => {
    setVolunteerHours((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const scheduledAnnouncementsCount = announcements.filter((a) => a.status === 'Scheduled').length;


  // Governance Log Mock Data
  const governanceLogs = [
    {
      id: 'gov-1',
      category: 'GRANTS',
      title: 'Dean Student Activity Grant Credited ($4,500.00)',
      description: 'Official semester funding verified and deposited into treasury balance by Dean of Student Affairs.',
      date: 'Oct 01, 2026 • 11:30 AM',
      refCode: 'GRT-2026-99',
      badge: 'Dean Ratified',
      badgeClass: 'bg-status-success-bg text-status-success border-status-success/30'
    },
    {
      id: 'gov-2',
      category: 'APPOINTMENTS',
      title: 'Marcus Sterling Appointed as Treasurer',
      description: 'Cryptographic fiscal ledger signing credentials issued under authority of Dr. Alexander Vance.',
      date: 'Aug 20, 2026 • 02:15 PM',
      refCode: 'AUTH-TREAS-01',
      badge: 'Role Ratified',
      badgeClass: 'bg-accent-light text-accent-700 border-accent-300'
    },
    {
      id: 'gov-3',
      category: 'EVENTS',
      title: 'Annual Robotics Showcase 2026 Published',
      description: 'Venue confirmed at Grand Hall, Turing Science Quad. 142 student tickets reserved within first 4 hours.',
      date: 'Sep 15, 2026 • 09:40 AM',
      refCode: 'EVT-101-PUB',
      badge: 'Live on Campus',
      badgeClass: 'bg-primary/10 text-primary border-primary/30'
    },
    {
      id: 'gov-4',
      category: 'NOTICES',
      title: 'Fall General Assembly Schedule Dispatched',
      description: 'Official academic broadcast transmitted to 184 active club members across Engineering & Computing.',
      date: 'Oct 02, 2026 • 04:00 PM',
      refCode: 'ANC-2026-44',
      badge: 'Transmitted',
      badgeClass: 'bg-status-info-bg text-status-info border-status-info/30'
    }
  ];

  const filteredGovernanceLogs = governanceLogs.filter((log) => {
    if (governanceFilter === 'ALL') return true;
    return log.category === governanceFilter;
  });

  // Filtered Merchandise
  const filteredMerchandise = MERCHANDISE_ITEMS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(merchSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(merchSearch.toLowerCase());
    const matchesCategory = merchCategoryFilter === 'ALL' || item.category === merchCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Members */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-primary/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Enrolled Members
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {memberRoster.length}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-success font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>+14 joined this term</span>
                    <span className="text-text-muted">• 94.2% retention</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Quorum Reached</span>
                  <button
                    onClick={() => handleTabSelect('members')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>Member Management</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 2: Events */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-accent/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Campus Events
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {events.length}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
                    <span className="font-semibold text-primary">450+ Attendees</span>
                    <span className="text-text-muted">registered this semester</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Ticketing Active</span>
                  <button
                    onClick={() => navigateToEvents('all')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>Manage Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 3: Treasury */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-status-success/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Treasury Balance
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center text-status-success">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    $8,345.50
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-status-success font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Dean Audited & Balanced</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Dues 92% Collected</span>
                  <button
                    onClick={() => handleTabSelect('fundraisers')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>View Funds</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 4: Announcements & Scheduled */}
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle hover:border-status-warning/40 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Announcements Center
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-ivory-200 flex items-center justify-center text-text-secondary">
                      <Megaphone className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {announcements.length}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                      {scheduledAnnouncementsCount} Scheduled
                    </span>
                    <span className="text-text-muted">Ready to dispatch</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Channel: Official</span>
                  <button
                    onClick={() => navigateToAnnouncements('all')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition"
                  >
                    <span>Announcement</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Overview Split: Society Governance Log + Executive Command Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Society Governance Activity Ledger (2 Cols) */}
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <span>Society Governance & Ledger Log</span>
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Immutable record of officer ratifications, council grants, and official broadcasts
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-border text-xs">
                    {['ALL', 'GRANTS', 'APPOINTMENTS', 'EVENTS', 'NOTICES'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setGovernanceFilter(category)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${governanceFilter === category
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
                  {filteredGovernanceLogs.map((log) => (
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
                            <span className="text-[10px] font-mono text-accent">
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
                  <span>Cryptographic Checksum: SHA-256 Verified by University Council</span>
                  <span className="text-status-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Records Ratified
                  </span>
                </div>
              </div>

              {/* Right Column: Executive Command Center & University Compliance */}
              <div className="space-y-6">

                {/* Quick Launch Card */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-border">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-lg font-bold text-text-primary">
                      Executive Launcher
                    </h3>
                  </div>

                  <p className="text-xs text-text-secondary">
                    Immediate administrative triggers for society leadership and faculty coordination.
                  </p>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => navigateToAnnouncements('create')}
                      className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5 text-accent" />
                        <span>Schedule Announcement</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => navigateToEvents('create')}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>Publish Campus Event</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => setIsCreateTreasurerModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldPlus className="w-3.5 h-3.5 text-accent" />
                        <span>Provision Treasurer</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="w-full py-2.5 px-3 rounded-lg bg-ivory-100 hover:bg-ivory-200 text-text-primary text-xs font-semibold border border-border transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-text-muted" />
                        <span>Export Council Audit Pack</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </div>
                </div>

                {/* University Senate Standing Checklist */}
                <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-border">
                    <Award className="w-4 h-4 text-primary" />
                    <h3 className="text-lg font-bold text-text-primary">
                      Council Accreditation
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Faculty Endorsement:</span>
                      <span className="font-semibold text-status-success flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Certified
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Roster Quorum (min 50):</span>
                      <span className="font-semibold text-text-primary">184 Members (368%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Fiscal Audit Standing:</span>
                      <span className="font-semibold text-status-success">Dean Approved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Next Senate Review:</span>
                      <span className="font-mono text-accent">Nov 14, 2026</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MEMBERS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'members' && (
          <div className="space-y-4 animate-fadeIn">
            <MemberManagementPage />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EVENTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'events' && (
          <EventsManagementModule
            events={events}
            setEvents={setEvents}
            initialSubTab={eventsSubTab}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 4: ANNOUNCEMENTS MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'announcements' && (
          <AnnouncementsManagementModule
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            initialSubTab={announcementsSubTab}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 5: MERCHANDISE STOCK & ONLINE ORDERS */}
        {/* ========================================================= */}
        {(activeTab === 'merchandise' || activeTab === 'store') && (
          <AdminMerchManager />
        )}

        {/* ========================================================= */}
        {/* TAB 6: FUNDRAISERS */}
        {/* ========================================================= */}
        {activeTab === 'fundraisers' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Society Endowments & Fundraisers
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official crowdfunding campaigns for robotic competition chassis, symposium travel, and hardware lab gear
                  </p>
                </div>
                <button
                  onClick={() => alert('Opening Council Initiative Proposal Submission...')}
                  className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Launch Fundraiser</span>
                </button>
              </div>

              {/* 3 Active Campaigns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* Campaign 1 */}
                <div className="p-5 rounded-xl bg-ivory-100 border border-border flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                        72% Funded
                      </span>
                      <span className="text-[11px] text-text-muted">14 Days Remaining</span>
                    </div>
                    <h3 className="text-base font-bold text-primary">
                      Robotics Regional Championship Travel
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Funding flights, competition registration dues, and transport crates for national competition in Chicago.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="w-full bg-ivory-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '72%' }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Raised: <strong className="text-primary">$4,320.00</strong></span>
                      <span className="text-text-muted">Goal: $6,000.00</span>
                    </div>
                    <span className="text-[10px] text-text-muted block">48 Alumni & Faculty Donors</span>
                  </div>
                </div>

                {/* Campaign 2 */}
                <div className="p-5 rounded-xl bg-ivory-100 border border-border flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                        85% Funded
                      </span>
                      <span className="text-[11px] text-text-muted">22 Days Remaining</span>
                    </div>
                    <h3 className="text-base font-bold text-primary">
                      Autonomous Sensor & AI Hardware Lab
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Procuring NVIDIA Jetson Orin compute units and LiDAR sensory kits for student machine learning projects.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="w-full bg-ivory-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Raised: <strong className="text-accent">$8,500.00</strong></span>
                      <span className="text-text-muted">Goal: $10,000.00</span>
                    </div>
                    <span className="text-[10px] text-text-muted block">92 Corporate & Student Donors</span>
                  </div>
                </div>

                {/* Campaign 3 */}
                <div className="p-5 rounded-xl bg-ivory-100 border border-border flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                        70% Funded
                      </span>
                      <span className="text-[11px] text-text-muted">30 Days Remaining</span>
                    </div>
                    <h3 className="text-base font-bold text-primary">
                      Undergraduate STEM Diversity Grant
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Scholarships and conference stipends for underrepresented undergraduate students presenting research.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="w-full bg-ivory-300 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '70%' }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Raised: <strong className="text-primary">$2,100.00</strong></span>
                      <span className="text-text-muted">Goal: $3,000.00</span>
                    </div>
                    <span className="text-[10px] text-text-muted block">31 Contributing Donors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: VOLUNTEER CONTROL */}
        {/* ========================================================= */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Volunteer Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface rounded-xl border border-border p-5 shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Certified Hours
                </span>
                <p className="text-2xl font-bold text-primary mt-1">
                  420 Hours
                </p>
                <span className="text-[11px] text-status-success font-medium">Ratified under Dean Honor Program</span>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5 shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Pending Verification
                </span>
                <p className="text-2xl font-bold text-accent mt-1">
                  {volunteerHours.filter(v => v.status === 'PENDING').reduce((acc, curr) => acc + curr.hours, 0)} Hours
                </p>
                <span className="text-[11px] text-text-muted">Awaiting Advisor Signature</span>
              </div>
              <div className="bg-surface rounded-xl border border-border p-5 shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Registrar Credits
                </span>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  28 Students Awarded
                </p>
                <span className="text-[11px] text-text-muted">Official academic transcript notation</span>
              </div>
            </div>

            {/* Volunteer Control Table */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Volunteer Verification & Hour Allocation
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Review student community service submissions and certify official transcript credits
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Student Volunteer</th>
                      <th className="py-3 px-4">Initiative / Event</th>
                      <th className="py-3 px-4">Hours Logged</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {volunteerHours.map((vol) => (
                      <tr key={vol.id} className="hover:bg-ivory-50 transition">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">{vol.studentName}</p>
                          <p className="text-[10px] font-mono text-text-muted">{vol.studentId}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-text-primary">{vol.event}</p>
                          <p className="text-[10px] text-text-secondary">{vol.role}</p>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-primary">
                          {vol.hours} hrs
                        </td>
                        <td className="py-3 px-4 text-text-muted">{vol.date}</td>
                        <td className="py-3 px-4">
                          {vol.status === 'VERIFIED' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                              Dean Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleVolunteerApproval(vol.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition ${vol.status === 'VERIFIED'
                              ? 'bg-ivory-200 hover:bg-ivory-300 text-text-secondary border border-border'
                              : 'bg-primary hover:bg-primary-hover text-white shadow-xs'
                              }`}
                          >
                            {vol.status === 'VERIFIED' ? 'Revoke Credit' : 'Certify Credit'}
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
        {/* TAB 8: COUNCIL REPORTS */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Administrative Reports & Audit Exports
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Generate compliance dossiers for the University Council Office of Student Life
                  </p>
                </div>
                <button
                  onClick={() => alert('Exporting Official Council Compliance Pack (CSV)...')}
                  className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Annual Report (CSV)</span>
                </button>
              </div>

              {/* Report Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Membership Retention Rate</span>
                  <p className="text-2xl font-bold text-primary mt-1">94.2%</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Top 5% among engineering campus societies.</p>
                </div>

                <div className="p-4 rounded-xl bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Total Verified Service Hours</span>
                  <p className="text-2xl font-bold text-accent mt-1">420 Hours</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Ratified under University Dean Honor Program.</p>
                </div>

                <div className="p-4 rounded-xl bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Fiscal Ledger Balance</span>
                  <p className="text-2xl font-bold text-status-success mt-1">$8,345.50</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Zero outstanding auditor reconciliation flags.</p>
                </div>

                <div className="p-4 rounded-xl bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Total Campus Events Hosted</span>
                  <p className="text-2xl font-bold text-text-primary mt-1">{events.length} Events</p>
                  <p className="text-[11px] text-text-muted mt-0.5">100% safety & room reservation clearance.</p>
                </div>
              </div>

              {/* Downloadable Dossiers */}
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-base font-bold text-text-primary">
                  Official Dossier Exports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg border border-border bg-surface hover:bg-ivory-50 transition flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-text-primary">Council Quorum Roster</p>
                      <p className="text-[11px] text-text-muted">184 Verified Student IDs</p>
                    </div>
                    <button
                      onClick={() => alert('Downloading Council Quorum Roster (CSV)...')}
                      className="p-1.5 rounded-md hover:bg-ivory-200 text-primary"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surface hover:bg-ivory-50 transition flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-text-primary">Treasury Audit Ledger</p>
                      <p className="text-[11px] text-text-muted">Reconciled Cash & Card Flows</p>
                    </div>
                    <button
                      onClick={() => alert('Downloading Treasury Audit Ledger (CSV)...')}
                      className="p-1.5 rounded-md hover:bg-ivory-200 text-primary"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surface hover:bg-ivory-50 transition flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-text-primary">Volunteer Registrar Credits</p>
                      <p className="text-[11px] text-text-muted">Signed by Dr. Vance</p>
                    </div>
                    <button
                      onClick={() => alert('Downloading Volunteer Transcript Credits (PDF)...')}
                      className="p-1.5 rounded-md hover:bg-ivory-200 text-primary"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: APPOINT / CREATE TREASURER CREDENTIALS */}
        {/* ========================================================= */}
        {isCreateTreasurerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <UniversityCrest className="w-6 h-6" variant="burgundy" />
                  <h3 className="text-lg font-bold text-text-primary">
                    Appoint Society Treasurer
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateTreasurerModalOpen(false)}
                  className="text-text-muted hover:text-text-primary font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-accent-light border border-accent-300 rounded-lg text-[11px] text-text-secondary leading-relaxed">
                <strong>System Security Policy:</strong> Treasurer accounts cannot be self-registered by students. Club Administrators appoint and generate fiscal credentials here.
              </div>

              {treasurerCreatedSuccess ? (
                <div className="p-4 rounded-lg bg-status-success-bg border border-status-success/30 text-status-success text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="font-bold text-sm">Treasurer Appointed & Credentials Generated!</p>
                  <p className="text-xs text-text-secondary">
                    Account provisioned with fiscal ledger signing permissions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateTreasurer} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Treasurer Student Full Name <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTreasurer.name}
                      onChange={(e) => setNewTreasurer({ ...newTreasurer, name: e.target.value })}
                      placeholder="e.g. Marcus Sterling"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Student ID Number <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newTreasurer.studentId}
                      onChange={(e) => setNewTreasurer({ ...newTreasurer, studentId: e.target.value })}
                      placeholder="e.g. STU-2026-4419"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      University Email <span className="text-status-error">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newTreasurer.email}
                      onChange={(e) => setNewTreasurer({ ...newTreasurer, email: e.target.value })}
                      placeholder="xyz@treasurer.gmail.com"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-text-muted mt-1">Must end with @treasurer.gmail.com</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Temporary Provisioning Password
                    </label>
                    <input
                      type="text"
                      value={newTreasurer.password}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-border bg-ivory-100 text-text-secondary font-mono"
                    />
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      Default initial password: password123 (Changeable upon first login)
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateTreasurerModalOpen(false)}
                      className="px-3 py-2 rounded-lg border border-border bg-surface hover:bg-ivory-100 text-text-secondary font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-sm transition"
                    >
                      Grant Treasurer Authority
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: ADD / ENROLL MEMBER */}
        {/* ========================================================= */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <h3 className="text-lg font-bold text-text-primary">
                  Enroll Student Member
                </h3>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="text-text-muted hover:text-text-primary font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    placeholder="Student Name"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="student@university.edu"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Assigned Role</label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="Member">Regular Member</option>
                    <option value="Hardware Team Lead">Committee Officer</option>
                    <option value="Research Fellow">Research Fellow</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="px-3 py-2 rounded-lg border border-border bg-surface text-text-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition"
                  >
                    Enroll to Roster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
