import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MemberManagementPage from '../admin/MemberManagementPage';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { EventsManagementModule } from '../../components/events/EventsManagementModule';
import { AnnouncementsManagementModule } from '../../components/announcements/AnnouncementsManagementModule';
import { AdminMerchManager } from '../../components/merchandise/AdminMerchManager';
import { FundraisersManagementModule } from '../../components/fundraisers/FundraisersManagementModule';
import { useTreasurer } from '../../context/TreasurerContext';
import { TreasurerModal } from '../../components/admin/TreasurerModal';
import { AdminVolunteerControl } from '../../components/volunteers/AdminVolunteerControl';
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
  const { currentTreasurer } = useTreasurer();
  const location = useLocation();
  const navigate = useNavigate();

  const [isTreasurerModalOpen, setIsTreasurerModalOpen] = useState(false);

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
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'gov-2',
      category: 'APPOINTMENTS',
      title: 'Marcus Sterling Appointed as Treasurer',
      description: 'Cryptographic fiscal ledger signing credentials issued under authority of Dr. Alexander Vance.',
      date: 'Aug 20, 2026 • 02:15 PM',
      refCode: 'AUTH-TREAS-01',
      badge: 'Role Ratified',
      badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200'
    },
    {
      id: 'gov-3',
      category: 'EVENTS',
      title: 'Annual Robotics Showcase 2026 Published',
      description: 'Venue confirmed at Grand Hall, Turing Science Quad. 142 student tickets reserved within first 4 hours.',
      date: 'Sep 15, 2026 • 09:40 AM',
      refCode: 'EVT-101-PUB',
      badge: 'Live on Campus',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'gov-4',
      category: 'NOTICES',
      title: 'Fall General Assembly Schedule Dispatched',
      description: 'Official academic broadcast transmitted to 184 active club members across Engineering & Computing.',
      date: 'Oct 02, 2026 • 04:00 PM',
      refCode: 'ANC-2026-44',
      badge: 'Transmitted',
      badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-200'
    }
  ];

  const filteredGovernanceLogs = governanceLogs.filter((log) => {
    if (governanceFilter === 'ALL') return true;
    return log.category === governanceFilter;
  });

  // Filtered Merchandise
  const filteredMerchandise = MERCHANDISE_ITEMS.filter((item) => {
    const q = (merchSearch || '').toLowerCase().trim();
    const itemName = String(item.name || '').toLowerCase();
    const itemCat = String(item.category || '').toLowerCase();

    const matchesSearch = !q || itemName.includes(q) || itemCat.includes(q);
    const matchesCategory = merchCategoryFilter === 'ALL' || item.category === merchCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Top Header Card with Appointed Treasurer Button */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                SkyLine Admin Panel
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 text-white font-mono uppercase tracking-wider">
                Official Governance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Society administration, member quorum, events, merchandise, and fundraising oversight
            </p>
          </div>

          {/* Appointed Treasurer Status & Assign Button */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsTreasurerModalOpen(true)}
              className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-zinc-900 transition shadow-2xs group"
              title="Click to view appointed treasurer details or assign a new treasurer"
            >
              <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Treasurer:</span>
                  <span className="text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition">
                    {currentTreasurer?.name || 'Marcus Sterling'}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-semibold">
                    {currentTreasurer?.studentId || 'STU-2026-4419'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Serving since: <strong className="text-zinc-700 font-mono">{currentTreasurer?.startDate || 'Aug 20, 2026'}</strong>
                </div>
              </div>
              <span className="ml-1 text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-white font-semibold">
                Manage
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Members */}
              <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Enrolled Members
                    </span>
                    <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 mt-1.5">
                    {memberRoster.length}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>+14 joined this term</span>
                    <span className="text-slate-400">• 94.2% retention</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Quorum Reached</span>
                  <button
                    onClick={() => handleTabSelect('members')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <span>Member Management</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 2: Events */}
              <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Campus Events
                    </span>
                    <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 mt-1.5">
                    {events.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="font-semibold text-zinc-800">450+ Attendees</span>
                    <span className="text-slate-400">registered</span>
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Ticketing Active</span>
                  <button
                    onClick={() => navigateToEvents('all')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <span>Manage Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 3: Treasury */}
              <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Treasury Balance
                    </span>
                    <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1.5">
                    $8,345.50
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Dean Audited & Balanced</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Dues 92% Collected</span>
                  <button
                    onClick={() => handleTabSelect('fundraisers')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <span>View Funds</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Card 4: Announcements & Scheduled */}
              <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Announcements Center
                    </span>
                    <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <Megaphone className="w-4 h-4 text-zinc-800" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 mt-1.5">
                    {announcements.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[10px]">
                      {scheduledAnnouncementsCount} Scheduled
                    </span>
                    <span className="text-slate-400">Ready</span>
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Channel: Official</span>
                  <button
                    onClick={() => navigateToAnnouncements('all')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <span>Announcement</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Overview Split: Society Governance Log + Executive Command Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Left Column: Society Governance Activity Ledger (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <span>Society Governance & Ledger Log</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Immutable record of officer ratifications, council grants, and official broadcasts
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
                    {['ALL', 'GRANTS', 'APPOINTMENTS', 'EVENTS', 'NOTICES'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setGovernanceFilter(category)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${governanceFilter === category
                          ? 'bg-zinc-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-zinc-900'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Items */}
                <div className="divide-y divide-slate-100 space-y-2.5 pt-1">
                  {filteredGovernanceLogs.map((log) => (
                    <div key={log.id} className="pt-2.5 flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-900 text-xs sm:text-sm">
                            {log.title}
                          </p>
                          <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {log.date}
                            </span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[10px] font-mono text-zinc-700 font-semibold">
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

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
                  <span>Cryptographic Checksum: SHA-256 Verified by University Council</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Records Ratified
                  </span>
                </div>
              </div>

              {/* Right Column: Executive Command Center & University Compliance */}
              <div className="space-y-4">

                {/* Quick Launch Card */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                      Executive Launcher
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500">
                    Immediate administrative triggers for society leadership and faculty coordination.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigateToAnnouncements('create')}
                      className="w-full h-9 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Schedule Announcement</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => navigateToEvents('create')}
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-zinc-900 text-xs font-semibold border border-slate-200 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Publish Campus Event</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    <button
                      onClick={() => setIsTreasurerModalOpen(true)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-zinc-900 text-xs font-semibold border border-slate-200 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldPlus className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Provision Treasurer</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
                      className="w-full h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-zinc-900 text-xs font-semibold border border-slate-200 transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export Council Audit Pack</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </div>
                </div>

                {/* University Senate Standing Checklist */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-200">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                      Council Accreditation
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Faculty Endorsement:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Certified
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Roster Quorum (min 50):</span>
                      <span className="font-semibold text-zinc-900">184 Members (368%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Fiscal Audit Standing:</span>
                      <span className="font-semibold text-emerald-700">Dean Approved</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Next Senate Review:</span>
                      <span className="font-mono text-zinc-900 font-semibold">Nov 14, 2026</span>
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
          <FundraisersManagementModule />
        )}

        {/* ========================================================= */}
        {/* TAB 7: VOLUNTEER CONTROL */}
        {/* ========================================================= */}
        {activeTab === 'volunteers' && (
          <div className="space-y-6 animate-fadeIn">
            <AdminVolunteerControl onNavigateToEvents={() => navigateToEvents('all')} />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: COUNCIL REPORTS */}
        {/* ========================================================= */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900">
                    Administrative Reports & Audit Exports
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate compliance dossiers for the University Council Office of Student Life
                  </p>
                </div>
                <button
                  onClick={() => alert('Exporting Official Council Compliance Pack (CSV)...')}
                  className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Annual Report (CSV)</span>
                </button>
              </div>

              {/* Report Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-zinc-900">Membership Retention Rate</span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">94.2%</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Top 5% among campus societies.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-zinc-900">Total Verified Service Hours</span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 mt-1">420 Hours</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ratified under Dean Honor Program.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-zinc-900">Fiscal Ledger Balance</span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1">$8,345.50</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Zero outstanding auditor flags.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-zinc-900">Campus Events Hosted</span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 mt-1">{events.length} Events</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">100% safety & room clearance.</p>
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

        {/* Appointed Treasurer Management Modal */}
        <TreasurerModal
          isOpen={isTreasurerModalOpen}
          onClose={() => setIsTreasurerModalOpen(false)}
        />

      </div>
    </div>
  );
};

export default AdminDashboard;
