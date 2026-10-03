import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { MemberMerchStore } from '../../components/merchandise/MemberMerchStore';
import {
  CAMPUS_EVENTS,
  MEMBER_TICKETS,
  MERCHANDISE_ITEMS,
  VOLUNTEER_OPPORTUNITIES,
  ANNOUNCEMENTS
} from '../../data/mockData';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ShoppingBag,
  HeartHandshake,
  Award,
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
  Filter
} from 'lucide-react';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Read tab from URL query if present
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
  const [eventsList, setEventsList] = useState(CAMPUS_EVENTS);
  const [ticketsList, setTicketsList] = useState(MEMBER_TICKETS);
  const [cartSuccess, setCartSuccess] = useState(null);
  const [activeTicketModal, setActiveTicketModal] = useState(null);
  const [certificateModal, setCertificateModal] = useState(false);

  // RSVP toggle
  const handleRsvp = (eventId) => {
    setEventsList((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const newStatus = !evt.userRsvp;
          if (newStatus) {
            // Generate ticket
            const newTicket = {
              id: `TCK-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-2)}`,
              eventTitle: evt.title,
              date: evt.date,
              venue: evt.location,
              seat: `General Admission Pass #${Math.floor(Math.random() * 200)}`,
              qrCode: `CONNECTU-${evt.id.toUpperCase()}-VERIFIED`,
              status: 'Confirmed'
            };
            setTicketsList((t) => [newTicket, ...t]);
          }
          return {
            ...evt,
            userRsvp: newStatus,
            attendees: newStatus ? evt.attendees + 1 : evt.attendees - 1
          };
        }
        return evt;
      })
    );
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'membership', label: 'My Membership', icon: Users },
    { id: 'events', label: 'Events & RSVPs', icon: Calendar },
    { id: 'tickets', label: 'My Tickets', icon: Ticket, badge: ticketsList.length },
    { id: 'store', label: 'Merchandise Store', icon: ShoppingBag },
    { id: 'volunteer', label: 'Volunteer Hours', icon: HeartHandshake },
    { id: 'certificates', label: 'My Certificates', icon: Award },
    { id: 'profile', label: 'Student Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">





        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Next Upcoming Event */}
              <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h2 className="font-serif-academic text-lg font-bold text-text-primary">
                      Upcoming Featured Event
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-wider bg-accent-light px-2.5 py-0.5 rounded border border-accent-300">
                    Flagship Event
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif-academic text-xl text-primary font-bold">
                    Annual Autonomous Robotics Showcase 2026
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Demonstrations of student-built autonomous rovers, drone swarms, and AI vision systems with industry evaluators.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-text-secondary">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Oct 14, 2026 • 2:00 PM - 6:00 PM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>Grand Hall, Turing Science Quad</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center text-xs font-semibold text-status-success bg-status-success-bg px-2.5 py-1 rounded border border-status-success/30">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Admission Confirmed (#42)
                  </span>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                  >
                    <span>View Digital Ticket in Wallet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Verified Membership Status */}
              <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-border">
                  <UniversityCrest className="w-5 h-5" variant="burgundy" />
                  <h2 className="font-serif-academic text-lg font-bold text-text-primary">
                    Membership Standing
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded bg-ivory-100 border border-border">
                    <p className="text-xs font-semibold text-text-primary">Robotics & AI Society</p>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="text-text-muted">Semester Dues</span>
                      <span className="font-semibold text-status-success">Paid ($30.00)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-ivory-100 border border-border">
                    <p className="text-xs font-semibold text-text-primary">University Debate Union</p>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="text-text-muted">Semester Dues</span>
                      <span className="font-semibold text-status-success">Paid ($25.00)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded bg-ivory-100 border border-border">
                    <p className="text-xs font-semibold text-text-primary">Campus Environmental Alliance</p>
                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span className="text-text-muted">Volunteer Standing</span>
                      <span className="font-semibold text-accent">Active Contributor</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('membership')}
                  className="w-full py-2 rounded bg-ivory-200 hover:bg-ivory-300 text-text-primary text-xs font-semibold transition"
                >
                  Manage Memberships & Certificates
                </button>
              </div>

            </div>

            {/* Official University Announcements Board */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="font-serif-academic text-lg font-bold text-text-primary">
                  Official Campus Announcements
                </h2>
                <span className="text-xs text-text-muted">Office of Student Affairs & Club Councils</span>
              </div>

              <div className="divide-y divide-border">
                {ANNOUNCEMENTS.map((anc) => (
                  <div key={anc.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-academic text-sm sm:text-base font-bold text-primary">
                        {anc.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-ivory-200 text-text-secondary border border-border font-mono">
                        {anc.date}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {anc.content}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Published by: <span className="font-medium text-text-primary">{anc.author}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: MY MEMBERSHIP */}
        {activeTab === 'membership' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Enrolled Organizations & Societies
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Verified clubs accredited under the University Student Council
                  </p>
                </div>
                <button
                  onClick={() => setCertificateModal(true)}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-accent" />
                  <span>View Member Credentials</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-ivory-100 border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-academic text-base font-bold text-primary">
                        Robotics & AI Society
                      </h3>
                      <p className="text-[11px] text-text-muted">Chapter ID: SOC-2026-ENG</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p><strong>Designation:</strong> Active Member</p>
                    <p><strong>Dues Status:</strong> Paid (Fall 2026)</p>
                    <p><strong>Attendance:</strong> 92% (11/12 Sessions)</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="w-full py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-medium text-text-primary transition"
                  >
                    View Club Events
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-ivory-100 border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-academic text-base font-bold text-primary">
                        University Debate Union
                      </h3>
                      <p className="text-[11px] text-text-muted">Chapter ID: SOC-2026-HUM</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p><strong>Designation:</strong> Research Lead</p>
                    <p><strong>Dues Status:</strong> Paid (Fall 2026)</p>
                    <p><strong>Attendance:</strong> 88% (8/9 Debates)</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="w-full py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-medium text-text-primary transition"
                  >
                    View Club Events
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-ivory-100 border border-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-academic text-base font-bold text-primary">
                        Campus Environmental Alliance
                      </h3>
                      <p className="text-[11px] text-text-muted">Chapter ID: SOC-2026-SCI</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p><strong>Designation:</strong> Volunteer Contributor</p>
                    <p><strong>Dues Status:</strong> No Dues Required</p>
                    <p><strong>Logged Hours:</strong> 28 Service Hours</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('volunteer')}
                    className="w-full py-1.5 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-medium text-text-primary transition"
                  >
                    View Volunteer Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EVENTS & RSVPs */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Campus Organization Events Calendar
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Browse workshops, hackathons, guest lectures, and community service drives
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-text-muted">Total Events: {eventsList.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {eventsList.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-lg border border-border bg-ivory-50 hover:bg-surface transition-campus space-y-3 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-light text-primary border border-primary-200">
                          {evt.category}
                        </span>
                        <span className="text-xs font-semibold text-accent">{evt.price}</span>
                      </div>

                      <h3 className="font-serif-academic text-lg font-bold text-text-primary mt-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {evt.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-border/70 space-y-1.5 text-xs text-text-secondary">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <span>{evt.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <span>{evt.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          <span>Organizer: {evt.organizer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">
                        Attendees: <strong className="text-text-primary">{evt.attendees}</strong> / {evt.capacity}
                      </span>
                      <button
                        onClick={() => handleRsvp(evt.id)}
                        className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-campus flex items-center gap-1.5 ${
                          evt.userRsvp
                            ? 'bg-status-success text-white hover:bg-status-success/90'
                            : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                        }`}
                      >
                        {evt.userRsvp ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>RSVP Confirmed</span>
                          </>
                        ) : (
                          <>
                            <span>Register & Claim Pass</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: MY TICKETS WALLET */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Digital Student Passes & Ticket Wallet
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Present these digital QR passes at campus venue entrances for attendance scanning
                  </p>
                </div>
                <span className="text-xs text-accent font-semibold">{ticketsList.length} Active Passes</span>
              </div>

              {ticketsList.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  You have not registered for any events yet. Check out the Events calendar to RSVP.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {ticketsList.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border-2 border-border rounded-xl bg-surface overflow-hidden shadow-subtle hover:border-primary/50 transition-campus flex flex-col justify-between"
                    >
                      {/* Ticket Header */}
                      <div className="bg-primary text-white p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UniversityCrest className="w-6 h-6" variant="gold" />
                          <span className="font-serif-academic font-bold text-sm tracking-wide">CONNECTU PASS</span>
                        </div>
                        <span className="text-[10px] font-mono bg-primary-hover text-accent px-2 py-0.5 rounded border border-accent/30">
                          {ticket.status}
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-4 space-y-3">
                        <h4 className="font-serif-academic text-base font-bold text-text-primary leading-tight">
                          {ticket.eventTitle}
                        </h4>
                        <div className="text-xs text-text-secondary space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            <span>{ticket.date}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span className="truncate">{ticket.venue}</span>
                          </p>
                          <p className="text-[11px] text-text-muted pt-1">
                            Seat/Badge: <strong className="text-primary">{ticket.seat}</strong>
                          </p>
                        </div>

                        {/* Simulated QR Code */}
                        <div className="p-3 bg-ivory-100 rounded-lg border border-dashed border-border text-center space-y-1.5">
                          <div className="w-20 h-20 mx-auto bg-surface border border-border p-1.5 rounded flex items-center justify-center">
                            <QrCode className="w-full h-full text-text-primary" />
                          </div>
                          <p className="font-mono text-[9px] text-text-muted">{ticket.id}</p>
                        </div>
                      </div>

                      {/* Ticket Footer Action */}
                      <div className="p-3 bg-ivory-100 border-t border-border flex justify-between items-center text-xs">
                        <span className="text-[10px] text-text-muted">Authorized by University</span>
                        <button
                          onClick={() => setActiveTicketModal(ticket)}
                          className="font-semibold text-primary hover:text-primary-hover underline text-xs"
                        >
                          Enlarge Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: MERCHANDISE STORE */}
        {activeTab === 'store' && (
          <MemberMerchStore />
        )}

        {/* Tab 6: VOLUNTEER HOURS */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Civic Service & Volunteer Ledger
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official record of community service hours ratified by Faculty Advisors
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-text-muted font-semibold">Total Approved Hours</span>
                  <p className="font-serif-academic text-2xl font-bold text-accent">28 Hours</p>
                </div>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Open Campus Service Opportunities
                </h3>
                {VOLUNTEER_OPPORTUNITIES.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-lg bg-ivory-100 border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif-academic text-base font-bold text-primary">
                          {opp.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface border border-border text-text-secondary">
                          {opp.hours} Service Hours
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Department: <strong className="text-text-primary">{opp.department}</strong> • Date: {opp.date}
                      </p>
                      <p className="text-[11px] text-accent font-medium">Perks: {opp.perks}</p>
                    </div>

                    <button
                      onClick={() => alert(`Enrolled for ${opp.title}! The lead organizer has been notified.`)}
                      className="px-3.5 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition self-start sm:self-auto"
                    >
                      Sign Up for Shift
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Official University Society Credentials & Certificates
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Dean & Faculty ratified extracurricular credentials with cryptographic verification hash
                  </p>
                </div>
              </div>

              {/* Certificate Canvas Preview */}
              <div className="max-w-2xl mx-auto p-8 rounded-lg border-4 border-double border-accent/40 bg-surface shadow-card text-center space-y-4 my-4 relative">
                <div className="flex justify-center">
                  <UniversityCrest className="w-14 h-14" variant="burgundy" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-accent font-semibold font-mono">
                    Official Certificate of Organization Standing
                  </p>
                  <h3 className="font-serif-academic text-2xl font-bold text-primary mt-1">
                    ConnectU Student Leadership Honor
                  </h3>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed max-w-lg mx-auto">
                  This certifies that <strong className="text-text-primary">{user?.name || 'Sophia Montgomery'}</strong> (Student ID: <span className="font-mono text-primary font-semibold">{user?.studentId || 'STU-2026-8842'}</span>) is a member in good academic and disciplinary standing of the <strong className="text-primary">Robotics & AI Society</strong> and has fulfilled all civic service requirements.
                </p>

                <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-text-muted">
                  <div className="text-left">
                    <p className="font-serif-academic font-bold text-text-primary">Dr. Alexander Vance</p>
                    <p className="text-[10px]">Faculty Advisor & Lead</p>
                  </div>
                  <div className="text-center font-mono text-[10px] text-accent font-semibold">
                    <ShieldCheck className="w-5 h-5 mx-auto text-status-success mb-0.5" />
                    VERIFIED HASH: #ACAD-2026-8842-RATIFIED
                  </div>
                  <div className="text-right">
                    <p className="font-serif-academic font-bold text-text-primary">Marcus Sterling</p>
                    <p className="text-[10px]">Society Comptroller</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: STUDENT PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border">
                <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                  Student Member Directory Profile
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Institutional record synchronized with Registrar Student Information System
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">Full Name</span>
                  <p className="font-semibold text-text-primary mt-0.5">{user?.name || 'Sophia Montgomery'}</p>
                </div>
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">Student ID</span>
                  <p className="font-mono font-semibold text-primary mt-0.5">{user?.studentId || 'STU-2026-8842'}</p>
                </div>
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">University Email</span>
                  <p className="font-mono font-semibold text-text-primary mt-0.5">{user?.email || 'student@university.edu'}</p>
                </div>
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">Academic Department</span>
                  <p className="font-semibold text-text-primary mt-0.5">{user?.department || 'School of Computer Science & Engineering'}</p>
                </div>
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">Account Clearance Level</span>
                  <p className="font-semibold text-status-success mt-0.5">MEMBER (Student Body Verified)</p>
                </div>
                <div className="p-3 bg-ivory-100 rounded border border-border">
                  <span className="text-text-muted">Member Since</span>
                  <p className="font-semibold text-text-primary mt-0.5">{user?.joinedDate || 'Sep 12, 2024'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;
