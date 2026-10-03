import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import MemberManagementPage from '../admin/MemberManagementPage';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import {
  CLUB_MEMBERS_ADMIN,
  CAMPUS_EVENTS,
  ANNOUNCEMENTS,
  MERCHANDISE_ITEMS,
  TREASURY_DATA
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
  AlertCircle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, users } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [memberRoster, setMemberRoster] = useState(CLUB_MEMBERS_ADMIN);
  const [events, setEvents] = useState(CAMPUS_EVENTS);
  const [announcements, setAnnouncements] = useState(ANNOUNCEMENTS);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDues, setFilterDues] = useState('ALL');

  // Modals state
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateTreasurerModalOpen, setIsCreateTreasurerModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // New Treasurer Form State
  const [newTreasurer, setNewTreasurer] = useState({
    name: '',
    email: '',
    studentId: '',
    password: 'password123',
    department: 'School of Business & Finance'
  });
  const [treasurerCreatedSuccess, setTreasurerCreatedSuccess] = useState(false);

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    studentId: '',
    role: 'Member'
  });

  // New Announcement Form State
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'GENERAL'
  });

  // New Event Form State
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    date: '',
    location: '',
    capacity: 100,
    price: 'Free for Members'
  });

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
        department: 'School of Business & Finance'
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

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncementForm.title || !newAnnouncementForm.content) return;

    setAnnouncements([
      {
        id: `anc-${Date.now()}`,
        title: newAnnouncementForm.title,
        author: user?.name || 'Dr. Alexander Vance (Organizer)',
        date: 'Today',
        priority: newAnnouncementForm.priority,
        content: newAnnouncementForm.content
      },
      ...announcements
    ]);
    setIsAnnouncementModalOpen(false);
    setNewAnnouncementForm({ title: '', content: '', priority: 'GENERAL' });
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventForm.title || !newEventForm.date) return;

    setEvents([
      {
        id: `evt-${Date.now()}`,
        title: newEventForm.title,
        date: newEventForm.date,
        location: newEventForm.location || 'Engineering Commons',
        category: 'Campus Event',
        organizer: user?.clubName || 'Robotics & AI Society',
        attendees: 0,
        capacity: Number(newEventForm.capacity),
        price: newEventForm.price,
        badge: 'New Event',
        description: 'Newly created official club event.',
        userRsvp: false
      },
      ...events
    ]);
    setIsCreateEventModalOpen(false);
    setNewEventForm({ title: '', date: '', location: '', capacity: 100, price: 'Free for Members' });
  };

  // Filtered roster
  const filteredRoster = memberRoster.filter((mem) => {
    const matchesSearch =
      mem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDues = filterDues === 'ALL' || mem.duesStatus === filterDues;
    return matchesSearch && matchesDues;
  });

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Member Management', icon: Users },
    { id: 'events', label: 'Events Management', icon: Calendar, badge: events.length },
    { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
    { id: 'merchandise', label: 'Merchandise Stock', icon: ShoppingBag },
    { id: 'fundraisers', label: 'Fundraisers', icon: DollarSign },
    { id: 'volunteers', label: 'Volunteer Control', icon: HeartHandshake },
    { id: 'reports', label: 'Council Reports', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Admin Header Card */}
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="flex items-center space-x-4 z-10">
            <div className="relative">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"}
                alt={user?.name}
                className="w-16 h-16 rounded-full border-2 border-primary object-cover shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border border-surface">
                <UniversityCrest className="w-4 h-4" variant="gold" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-academic text-2xl sm:text-3xl font-bold text-text-primary">
                  {user?.name || 'Dr. Alexander Vance'}
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-primary text-white">
                  Lead Organizer & Faculty Advisor
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-primary">Robotics & AI Society</span>
                <span>•</span>
                <span>Council Chapter #SOC-2026-ENG</span>
                <span>•</span>
                <span className="font-mono text-accent">ID: {user?.studentId || 'FAC-2026-1049'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 z-10">
            <button
              onClick={() => setIsCreateTreasurerModalOpen(true)}
              className="px-3 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center gap-1.5"
            >
              <ShieldPlus className="w-3.5 h-3.5" />
              <span>Appoint Treasurer</span>
            </button>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-3 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition-campus flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Member</span>
            </button>
            <button
              onClick={() => setIsCreateEventModalOpen(true)}
              className="px-3 py-2 rounded bg-ivory-200 hover:bg-ivory-300 text-text-primary text-xs font-semibold border border-border transition-campus flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-surface rounded-lg p-1.5 shadow-subtle overflow-x-auto">
          <nav className="flex space-x-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded text-xs font-semibold transition-campus ${isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-primary-hover text-accent' : 'bg-ivory-200 text-text-secondary'
                        }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-text-secondary">Enrolled Members</span>
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="font-serif-academic text-2xl font-bold text-text-primary mt-2">184</p>
                <span className="text-[10px] text-status-success font-medium">↑ +14 new this semester</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-text-secondary">Active Campus Events</span>
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <p className="font-serif-academic text-2xl font-bold text-text-primary mt-2">{events.length}</p>
                <span className="text-[10px] text-text-muted">450+ attendees registered</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-text-secondary">Treasury Vault</span>
                  <DollarSign className="w-4 h-4 text-status-success" />
                </div>
                <p className="font-serif-academic text-2xl font-bold text-text-primary mt-2">$8,345.50</p>
                <span className="text-[10px] text-status-success font-medium">Audited & Verified</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-text-secondary">Pending Action Queue</span>
                  <Clock className="w-4 h-4 text-status-warning" />
                </div>
                <p className="font-serif-academic text-2xl font-bold text-status-warning mt-2">3 Requests</p>
                <span className="text-[10px] text-text-muted">2 reimbursements, 1 guest pass</span>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <h2 className="font-serif-academic text-lg font-bold text-text-primary">
                    Recent Society Governance Log
                  </h2>
                  <span className="text-xs text-text-muted">Cryptographic Ledger</span>
                </div>

                <div className="divide-y divide-border text-xs space-y-3 pt-1">
                  <div className="pt-2 flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text-primary">Council Grant Approved ($4,500.00)</p>
                      <p className="text-text-muted text-[11px]">Official funding credited to club balance by Dean of Student Affairs.</p>
                      <span className="text-[10px] font-mono text-accent">Oct 01, 2026 • Ref: GRT-2026-99</span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-start space-x-3">
                    <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text-primary">Marcus Sterling Appointed as Treasurer</p>
                      <p className="text-text-muted text-[11px]">Financial authority credentials issued by Dr. Alexander Vance.</p>
                      <span className="text-[10px] font-mono text-accent">Aug 20, 2023 • Ref: AUTH-TREAS-01</span>
                    </div>
                  </div>

                  <div className="pt-3 flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-text-primary">Annual Robotics Showcase 2026 Published</p>
                      <p className="text-text-muted text-[11px]">Venue booked at Grand Hall, Turing Science Quad. 142 tickets reserved.</p>
                      <span className="text-[10px] font-mono text-accent">Sep 15, 2026 • Ref: EVT-101-PUB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Broadcast Card */}
              <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 pb-3 border-b border-border">
                    <Megaphone className="w-4 h-4 text-primary" />
                    <h2 className="font-serif-academic text-lg font-bold text-text-primary">
                      Society Broadcast
                    </h2>
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Transmit an immediate notification or academic notice to all 184 registered members.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsAnnouncementModalOpen(true)}
                    className="w-full py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Post Official Announcement</span>
                  </button>
                  <button
                    onClick={() => setIsCreateTreasurerModalOpen(true)}
                    className="w-full py-2 rounded bg-ivory-200 hover:bg-ivory-300 text-text-primary text-xs font-medium border border-border transition flex items-center justify-center gap-1.5"
                  >
                    <ShieldPlus className="w-3.5 h-3.5 text-accent" />
                    <span>Provision Treasurer Credentials</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <MemberManagementPage />
          </div>
        )}

        {/* Tab 3: EVENTS MANAGEMENT */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Campus Events Administration
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Schedule lectures, hackathons, and exhibitions with venue reservations
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateEventModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-lg bg-ivory-50 border border-border space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-light text-primary">
                        {evt.category}
                      </span>
                      <span className="text-xs font-semibold text-accent">{evt.price}</span>
                    </div>
                    <h3 className="font-serif-academic text-base font-bold text-text-primary">{evt.title}</h3>
                    <p className="text-xs text-text-secondary">{evt.date} • {evt.location}</p>
                    <div className="pt-2 text-xs flex justify-between items-center text-text-muted">
                      <span>RSVPs: <strong className="text-text-primary">{evt.attendees}</strong> / {evt.capacity}</span>
                      <span className="text-status-success font-medium">Published & Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Broadcast Announcements Feed
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official communications displayed to all registered students
                  </p>
                </div>
                <button
                  onClick={() => setIsAnnouncementModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>New Broadcast</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {announcements.map((anc) => (
                  <div key={anc.id} className="p-4 rounded-lg bg-ivory-100 border border-border space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif-academic text-base font-bold text-primary">{anc.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface border border-border font-mono">
                        {anc.priority}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{anc.content}</p>
                    <p className="text-[11px] text-text-muted pt-1">
                      Author: <strong className="text-text-primary">{anc.author}</strong> • {anc.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: MERCHANDISE */}
        {activeTab === 'merchandise' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Society Merchandise Inventory & Sales
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Track stock levels, sales proceeds, and campus distribution
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Current Stock</th>
                      <th className="py-2.5 px-3">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MERCHANDISE_ITEMS.map((item) => (
                      <tr key={item.id} className="hover:bg-ivory-50 transition">
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{item.name}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{item.category}</td>
                        <td className="py-2.5 px-3 font-bold text-primary">${item.price.toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono">{item.inStock} units</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                            Available for Order
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

        {/* Tab 6: FUNDRAISERS */}
        {activeTab === 'fundraisers' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border">
                <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                  Society Endowments & Fundraisers
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Crowdfunded campaigns for student hardware labs, research travel, and guest symposia
                </p>
              </div>

              <div className="p-5 rounded-lg bg-ivory-100 border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif-academic text-base font-bold text-primary">
                    Robotics Regional Championship Travel Fund
                  </h3>
                  <span className="text-xs font-semibold text-status-success">Active Campaign</span>
                </div>
                <p className="text-xs text-text-secondary">
                  Goal: $6,000 for team flights, robotic chassis crating, and competition entry dues in Chicago.
                </p>
                <div className="w-full bg-ivory-300 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Raised: <strong className="text-primary">$4,320.00</strong></span>
                  <span>Target: $6,000.00 (72%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: VOLUNTEERS */}
        {activeTab === 'volunteers' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border">
                <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                  Volunteer Verification & Hour Allocation
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Review student service submissions and certify official transcript credits
                </p>
              </div>

              <div className="p-4 bg-status-success-bg/50 border border-status-success/30 rounded text-xs text-status-success">
                All 28 student volunteer hours for this quarter have been verified and submitted to the Registrar.
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Administrative Reports & Audit Exports
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Generate compliance reports for the University Council Office of Student Life
                  </p>
                </div>
                <button
                  onClick={() => alert('Exporting Roster CSV and Financial Summary for University Council...')}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Annual Report (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Membership Retention Rate</span>
                  <p className="font-serif-academic text-2xl font-bold text-primary mt-1">94.2%</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Top 5% among engineering campus societies.</p>
                </div>
                <div className="p-4 rounded bg-ivory-100 border border-border">
                  <span className="font-semibold text-text-primary">Total Verified Service Hours</span>
                  <p className="font-serif-academic text-2xl font-bold text-accent mt-1">420 Hours</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Ratified under University Dean Honor Program.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: APPOINT / CREATE TREASURER CREDENTIALS (Strict prompt rule!) */}
        {isCreateTreasurerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div className="flex items-center space-x-2">
                  <UniversityCrest className="w-6 h-6" variant="burgundy" />
                  <h3 className="font-serif-academic text-lg font-bold text-text-primary">
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

              <div className="p-3 bg-accent-light border border-accent-300 rounded text-[11px] text-text-secondary">
                <strong>System Security Policy:</strong> Treasurer accounts cannot be self-registered by students. Club Administrators appoint and generate fiscal credentials here.
              </div>

              {treasurerCreatedSuccess ? (
                <div className="p-4 rounded bg-status-success-bg border border-status-success/30 text-status-success text-center space-y-2">
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
                      className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
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
                      className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary font-mono"
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
                      placeholder="treasurer@university.edu"
                      className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-primary mb-1">
                      Temporary Provisioning Password
                    </label>
                    <input
                      type="text"
                      value={newTreasurer.password}
                      readOnly
                      className="w-full px-3 py-2 rounded border border-border bg-ivory-100 text-text-secondary font-mono"
                    />
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      Default initial password: password123 (Changeable upon first login)
                    </span>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateTreasurerModalOpen(false)}
                      className="px-3 py-2 rounded border border-border bg-surface hover:bg-ivory-100 text-text-secondary font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold shadow-sm transition"
                    >
                      Grant Treasurer Authority
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL 2: ADD MEMBER */}
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <h3 className="font-serif-academic text-lg font-bold text-text-primary">
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
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
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
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Assigned Role</label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
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
                    className="px-3 py-2 rounded border border-border bg-surface text-text-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold transition"
                  >
                    Enroll to Roster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CREATE EVENT */}
        {isCreateEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <h3 className="font-serif-academic text-lg font-bold text-text-primary">
                  Publish Campus Event
                </h3>
                <button
                  onClick={() => setIsCreateEventModalOpen(false)}
                  className="text-text-muted hover:text-text-primary font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEventForm.title}
                    onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                    placeholder="e.g. AI Symposium 2026"
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Date & Time</label>
                  <input
                    type="text"
                    required
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    placeholder="e.g. Nov 24, 2026 • 3:00 PM"
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Location / Venue</label>
                  <input
                    type="text"
                    value={newEventForm.location}
                    onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                    placeholder="Grand Hall or Auditorium"
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-text-primary mb-1">Capacity</label>
                    <input
                      type="number"
                      value={newEventForm.capacity}
                      onChange={(e) => setNewEventForm({ ...newEventForm, capacity: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-primary mb-1">Pricing / Ticket</label>
                    <input
                      type="text"
                      value={newEventForm.price}
                      onChange={(e) => setNewEventForm({ ...newEventForm, price: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateEventModalOpen(false)}
                    className="px-3 py-2 rounded border border-border bg-surface text-text-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold transition"
                  >
                    Publish Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: POST ANNOUNCEMENT */}
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-xs">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-elevated p-6 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <h3 className="font-serif-academic text-lg font-bold text-text-primary">
                  Transmit Society Broadcast
                </h3>
                <button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="text-text-muted hover:text-text-primary font-bold text-lg"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={newAnnouncementForm.title}
                    onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, title: e.target.value })}
                    placeholder="Broadcast Subject"
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Priority</label>
                  <select
                    value={newAnnouncementForm.priority}
                    onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  >
                    <option value="GENERAL">General Society News</option>
                    <option value="URGENT">Urgent Action Required</option>
                    <option value="OFFICIAL">Official Dean Ratification</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text-primary mb-1">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={newAnnouncementForm.content}
                    onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, content: e.target.value })}
                    placeholder="Write your campus communication..."
                    className="w-full px-3 py-2 rounded border border-border bg-surface text-text-primary"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnouncementModalOpen(false)}
                    className="px-3 py-2 rounded border border-border bg-surface text-text-secondary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-semibold transition"
                  >
                    Broadcast to Members
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
