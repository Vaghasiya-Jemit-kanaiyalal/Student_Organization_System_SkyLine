import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMerchandise } from '../../context/MerchandiseContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { eventsApi, volunteerApi, certificateApi, announcementsApi, clubsApi, membershipApi, financeApi } from '../../services/api';
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
  Upload,
  Printer,
  ShoppingBag,
  RotateCw,
  Tag,
  Share2,
  ExternalLink,
  Trash2,
  Package,
  GraduationCap
} from 'lucide-react';
import { StudentMerchStore } from '../../components/merchandise/StudentMerchStore';

export const MemberDashboard = () => {
  const { user, buyClubMembership, renewMembership, updateUserProfile } = useAuth();
  const { products, getProductPricing, placeOrder } = useMerchandise();
  const location = useLocation();
  const navigate = useNavigate();

  // Derived student membership properties (auto-discard if finish duration has passed)
  const rawStatus = user?.membership_status || user?.membershipStatus || (user?.memberships?.length > 0 ? 'ACTIVE' : 'NONE');
  const rawEndDate = user?.membership_end_date || user?.membershipEndDate;
  const todayStr = new Date().toISOString().split('T')[0];
  const isFinished = rawEndDate && rawEndDate < todayStr;
  const membershipStatus = (String(rawStatus).toUpperCase() === 'ACTIVE' && isFinished) ? 'EXPIRED' : String(rawStatus).toUpperCase();
  const isMember = membershipStatus === 'ACTIVE';
  const rawType = user?.membership_type || user?.membershipType || (user?.memberships?.[0]?.membership_type);
  const membershipType = rawType ? String(rawType).toUpperCase() : (isMember ? 'ANNUAL' : 'NONE');

  // Badge based on membership status
  let membershipBadge = 'Student';
  if (isMember) {
    membershipBadge = membershipType === 'SEMESTER' ? 'Semester Member' : 'Annual Member';
  }

  // Active user's memberships list
  const userMemberships = user?.memberships || [];
  const isClubMember = (clubId) => {
    if (!isMember && userMemberships.length === 0) return false;
    return userMemberships.some((m) => {
      const mClubId = m.clubId || m.club_id || (typeof m.club === 'object' ? m.club?.id : m.club);
      const isActive = String(m.status || 'ACTIVE').toUpperCase() === 'ACTIVE' || m.duesPaid === true;
      return mClubId === clubId && isActive;
    });
  };
  const hasAnyClubMembership = isMember && userMemberships.some((m) => String(m.status || 'ACTIVE').toUpperCase() === 'ACTIVE');
  const isEligibleForMemberPrice = () => isMember;

  // Active tab synchronized with URL query params
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Merchandise modal & active category
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);
  const [selectedProductSize, setSelectedProductSize] = useState('M');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [merchCategory, setMerchCategory] = useState('ALL');

  // Club purchase plan modal state: 'Semester' | 'Annual'
  const [selectedClubForPurchase, setSelectedClubForPurchase] = useState(null);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState('Annual');

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
    phone: user?.phone || '+1 (555) 234-8910',
    department: user?.department || 'Computer Science & Software Engineering',
    semester: user?.semester || 'Semester 4 • 2026',
    membershipStatus: membershipStatus,
    membershipType: isMember ? (membershipType === 'SEMESTER' ? 'Semester' : 'Annual') : 'None',
    membershipBadge: membershipBadge,
    membershipStartDate: user?.membership_start_date || user?.membershipStartDate || (isMember ? '2026-09-01' : 'N/A'),
    membershipEndDate: user?.membership_end_date || user?.membershipEndDate || (isMember ? '2027-08-31' : 'N/A'),
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Undergraduate student passionate about robotics, software architecture, and campus leadership.'
  }));

  // Sync profile when user changes
  useEffect(() => {
    if (user) {
      const uStatus = String(user.membership_status || user.membershipStatus || 'NONE').toUpperCase();
      const uIsMember = uStatus === 'ACTIVE';
      const uType = user.membership_type || user.membershipType || (uIsMember ? 'ANNUAL' : 'NONE');
      const uBadge = uIsMember ? (String(uType).toUpperCase() === 'SEMESTER' ? 'Semester Member' : 'Annual Member') : 'Student';

      setStudentProfile((prev) => ({
        ...prev,
        name: user.name || user.fullName || prev.name,
        studentId: user.studentId || user.student_id || prev.studentId,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        department: user.department || prev.department,
        semester: user.semester || prev.semester,
        membershipStatus: uStatus,
        membershipType: uIsMember ? (String(uType).toUpperCase() === 'SEMESTER' ? 'Semester' : 'Annual') : 'None',
        membershipBadge: uBadge,
        membershipStartDate: user.membership_start_date || user.membershipStartDate || (uIsMember ? '2026-09-01' : 'N/A'),
        membershipEndDate: user.membership_end_date || user.membershipEndDate || (uIsMember ? '2027-08-31' : 'N/A'),
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  // Campus Clubs State
  const [clubsList, setClubsList] = useState([]);

  // Events State
  const [eventsList, setEventsList] = useState([]);

  // Tickets State with localStorage persistence (empty by default until reserved)
  const [ticketsList, setTicketsList] = useState(() => {
    try {
      const saved = localStorage.getItem('skyline_my_tickets_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading saved tickets:', e);
    }
    return [];
  });

  // Sync ticketsList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('skyline_my_tickets_v1', JSON.stringify(ticketsList));
    } catch (e) {
      console.warn('Failed saving tickets:', e);
    }
  }, [ticketsList]);

  // Volunteer Applications & Assignments State
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [activeVolunteerWork, setActiveVolunteerWork] = useState([]);

  // Certificates State
  const [certificatesList, setCertificatesList] = useState([]);

  // Announcements State
  const [announcementsList, setAnnouncementsList] = useState([]);

  // Membership Payment History State
  const [membershipHistory, setMembershipHistory] = useState(() => {
    if (user?.memberships && user.memberships.length > 0) {
      return user.memberships.map((m, idx) => ({
        term: m.plan || 'Academic Year 2026–2027',
        plan: `${m.clubName} (${m.plan || 'Annual Membership'})`,
        amount: m.amount || '₹499.00',
        paymentDate: m.paymentDate || 'Oct 01, 2026',
        receiptId: m.receiptId || `RCP-2026-${98100 + idx}`,
        status: m.status || 'Paid & Active'
      }));
    }
    return [];
  });

  // Recent Student Activity dynamically derived from real user state
  const recentActivities = useMemo(() => {
    const list = [];
    ticketsList.slice(0, 2).forEach((tck) => {
      list.push({
        id: `tck-${tck.id}`,
        text: `Reserved pass for "${tck.eventTitle}"`,
        time: tck.purchaseDate || 'Recent',
        icon: Ticket,
        color: 'text-emerald-700 bg-emerald-50'
      });
    });
    volunteerApplications.slice(0, 2).forEach((app) => {
      list.push({
        id: `app-${app.id}`,
        text: `Applied for ${app.roleApplied || 'Volunteer'} @ ${app.eventName}`,
        time: app.appliedDate || 'Recent',
        icon: HeartHandshake,
        color: 'text-zinc-900 bg-zinc-100'
      });
    });
    certificatesList.slice(0, 1).forEach((cert) => {
      list.push({
        id: `cert-${cert.id}`,
        text: `Earned Certificate for "${cert.eventName}"`,
        time: cert.issueDate || 'Recent',
        icon: Award,
        color: 'text-amber-700 bg-amber-50'
      });
    });
    if (list.length === 0) {
      list.push({
        id: 'welcome',
        text: 'Welcome to SkyLine Student Organization Portal',
        time: 'Active Term',
        icon: GraduationCap,
        color: 'text-emerald-700 bg-emerald-50'
      });
    }
    return list;
  }, [ticketsList, volunteerApplications, certificatesList]);

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
  const [viewEventDetailsModal, setViewEventDetailsModal] = useState(null);
  const [renewMembershipModalOpen, setRenewMembershipModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Tickets Page State
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('ALL');
  const [transferTicketModal, setTransferTicketModal] = useState(null);
  const [transferRecipientEmail, setTransferRecipientEmail] = useState('');
  const [cancelTicketModal, setCancelTicketModal] = useState(null);

  // Volunteer Sub-Tab Navigation: 1. Available Opportunities, 2. My Applications, 3. My Volunteer Assignments
  const [volunteerSubTab, setVolunteerSubTab] = useState('opportunities');

  // Membership Purchase Modal State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Student Account (Bursar)');
  const [volunteerMotivation, setVolunteerMotivation] = useState('');
  const [volunteerPreferredRole, setVolunteerPreferredRole] = useState('');
  const [volunteerExperience, setVolunteerExperience] = useState('');
  const [applying, setApplying] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [editProfileForm, setEditProfileForm] = useState({ ...studentProfile });
  const avatarInputRef = useRef(null);

  // Fetch live backend data for Published Events, Applications, Assignments, and Certificates
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const [eventsRes, appsRes, activeRes, certsRes, announcementsRes, clubsRes] = await Promise.all([
          eventsApi.getAll().catch(() => null),
          volunteerApi.getApplications().catch(() => null),
          volunteerApi.getActive().catch(() => null),
          certificateApi.getStudentCertificates().catch(() => null),
          announcementsApi.getAll({ status: 'Sent' }).catch(() => null),
          clubsApi.getAll().catch(() => null),
        ]);

        if (clubsRes) {
          const rawClubs = Array.isArray(clubsRes) ? clubsRes : clubsRes?.results || [];
          if (rawClubs.length > 0) {
            const mappedClubs = rawClubs.map((c) => {
              const matchedFallback = CAMPUS_CLUBS.find((fc) => String(fc.id) === String(c.id) || fc.name.toLowerCase() === c.name.toLowerCase()) || {};
              return {
                ...matchedFallback,
                id: c.id,
                name: c.name,
                category: c.category || matchedFallback.category || 'General Club',
                tagline: c.description ? c.description.slice(0, 80) : (matchedFallback.tagline || 'Student organization'),
                description: c.description || matchedFallback.description || '',
                semester_fee: c.semester_fee !== undefined ? Number(c.semester_fee) : (matchedFallback.semester_fee || 299),
                annual_fee: c.annual_fee !== undefined ? Number(c.annual_fee) : (matchedFallback.annual_fee || 499),
                semesterFee: c.semester_fee !== undefined ? Number(c.semester_fee) : (matchedFallback.semesterFee || 299),
                annualFee: c.annual_fee !== undefined ? Number(c.annual_fee) : (matchedFallback.annualFee || 499),
                image: c.image || matchedFallback.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
                availableSeats: c.capacity || matchedFallback.availableSeats || 30
              };
            });
            setClubsList(mappedClubs);
          }
        }

        if (eventsRes) {
          const rawEvents = Array.isArray(eventsRes) ? eventsRes : eventsRes?.results || [];
          if (rawEvents.length > 0) {
            const mapped = rawEvents.map((evt) => {
              const mPriceNum = evt.member_price !== undefined ? Number(evt.member_price) : Number(evt.ticket_price || 0);
              const nmPriceNum = evt.non_member_price !== undefined ? Number(evt.non_member_price) : (mPriceNum === 0 ? 15.0 : mPriceNum * 1.5);
              return {
                id: evt.id,
                title: evt.title || 'Campus Event',
                clubId: evt.club || 'club-default',
                clubName: evt.club_name || evt.club_details?.name || 'SkyLine Organization',
                date: evt.date && evt.start_time ? `${new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • ${evt.start_time} – ${evt.end_time || ''}` : (evt.date || 'TBD'),
                rawDate: evt.date,
                venue: evt.venue || evt.location || 'Campus Center',
                availableSeats: evt.capacity || 100,
                totalSeats: evt.capacity || 100,
                memberPrice: mPriceNum === 0 ? '$0.00 (Free for Members)' : `₹${mPriceNum.toFixed(2)}`,
                nonMemberPrice: `₹${nmPriceNum.toFixed(2)}`,
                memberPriceNum: mPriceNum,
                nonMemberPriceNum: nmPriceNum,
                member_price: mPriceNum,
                non_member_price: nmPriceNum,
                status: evt.status || 'Published',
                category: evt.event_type || 'Campus Event',
                description: evt.description || '',
                image: evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80',
                volunteers_required: evt.volunteers_required,
                volunteersRequired: evt.volunteers_required,
                volunteer_count_required: evt.volunteer_count_required,
                volunteer_slots_remaining: evt.volunteer_slots_remaining ?? evt.volunteer_count_required ?? 5,
                roles_list: evt.roles_list || evt.volunteer_roles_required || ['General Volunteer'],
                volunteer_roles_required: evt.volunteer_roles_required || evt.roles_list || ['General Volunteer'],
                volunteer_deadline: evt.volunteer_deadline,
              };
            });
            setEventsList(mapped);
          }
        }

        if (appsRes) {
          const rawApps = Array.isArray(appsRes) ? appsRes : appsRes?.results || [];
          if (rawApps.length > 0) {
            const mappedApps = rawApps.map((a) => ({
              id: a.id,
              eventName: a.event_details?.title || `Event #${a.event}`,
              roleApplied: a.preferred_role,
              preferred_role: a.preferred_role,
              appliedDate: new Date(a.applied_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              status: a.status,
              feedback: a.admin_feedback || (a.status === 'Approved' ? 'Application Approved. Assignment active.' : a.status === 'Pending' ? 'Application received and under review.' : 'Application declined.'),
            }));
            setVolunteerApplications(mappedApps);
          }
        }

        if (activeRes) {
          const rawActive = Array.isArray(activeRes) ? activeRes : activeRes?.results || [];
          if (rawActive.length > 0) {
            const mappedActive = rawActive.map((item) => ({
              id: item.id,
              event: item.event_details?.title || `Event #${item.event}`,
              assignedRole: item.assigned_role,
              duration: item.duration || '4 Hours',
              status: item.status || 'Active',
              notes: item.notes,
              approvedDate: new Date(item.approved_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            }));
            setActiveVolunteerWork(mappedActive);
          }
        }

        if (certsRes) {
          const rawCerts = Array.isArray(certsRes) ? certsRes : certsRes?.results || [];
          if (rawCerts.length > 0) {
            const mappedCerts = rawCerts.map((c) => ({
              id: c.certificate_id,
              title: `${c.volunteer_role} Certificate of Service`,
              eventName: c.event_name || c.event_title || c.event_details?.title || 'Campus Event',
              volunteerRole: c.volunteer_role,
              studentName: c.student_name || studentProfile.name,
              duration: c.duration,
              issueDate: new Date(c.issue_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
              authorizedSigner: 'Dr. Alexander Vance, Faculty Sponsor',
              credentialHash: c.verification_hash || `sha256-${String(c.certificate_id || '').toLowerCase()}`,
            }));
            setCertificatesList(mappedCerts);
          }
        }

        if (announcementsRes) {
          const rawAnc = Array.isArray(announcementsRes) ? announcementsRes : announcementsRes?.results || [];
          if (rawAnc.length > 0) {
            const mappedAnc = rawAnc.map((anc) => ({
              id: anc.id,
              title: anc.title,
              category: anc.category || 'General',
              publishedDate: anc.publishedDate || anc.sentDate || (anc.created_at ? new Date(anc.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
              author: anc.author || 'Office of Student Affairs',
              summary: anc.summary || (anc.content ? (anc.content.length > 180 ? anc.content.slice(0, 180) + '...' : anc.content) : ''),
              fullContent: anc.fullContent || anc.content || '',
              priority: anc.priority || 'Normal',
            }));
            setAnnouncementsList(mappedAnc);
          }
        }
      } catch (err) {
        console.warn('Error loading member data from backend:', err);
      }
    };

    fetchMemberData();
  }, [studentProfile.name]);

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

  // Open Volunteer Modal with role prefill
  const openVolunteerApplication = (evt) => {
    setApplyVolunteerModalEvent(evt);
    const availableRoles = evt.roles_list || evt.volunteer_roles_required || [];
    setVolunteerPreferredRole(availableRoles[0] || 'Registration Desk');
    setVolunteerMotivation('');
    setVolunteerExperience('');
  };
  const handleBuyTicketSubmit = (e) => {
    e.preventDefault();
    if (!buyTicketModalEvent) return;

    const isMemberEligible = isEligibleForMemberPrice();
    const finalPricePaid = isMemberEligible ? buyTicketModalEvent.memberPrice : buyTicketModalEvent.nonMemberPrice;

    const newTicket = {
      id: `TCK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      eventTitle: buyTicketModalEvent.title,
      date: buyTicketModalEvent.dateDisplay || buyTicketModalEvent.date,
      venue: buyTicketModalEvent.venue,
      seat: isMemberEligible
        ? `Member Pass • Row B, Seat #${Math.floor(10 + Math.random() * 90)}`
        : `Standard Pass • Row D, Seat #${Math.floor(10 + Math.random() * 90)}`,
      gate: 'Main Entrance (Gate 1)',
      pricePaid: typeof finalPricePaid === 'number' ? `₹${finalPricePaid}` : (finalPricePaid || '₹100'),
      purchaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Confirmed',
      tier: isMemberEligible ? 'Member Pass' : 'Standard Pass',
      category: buyTicketModalEvent.category || 'Campus Event',
      qrCodeData: `CONNECTU-${buyTicketModalEvent.id}-${studentProfile.studentId}`,
      image: buyTicketModalEvent.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80'
    };

    setTicketsList((prev) => [newTicket, ...prev]);
    setBuyTicketModalEvent(null);
    showToast(`🎉 Ticket for "${newTicket.eventTitle}" reserved successfully! Added to My Tickets.`);

    // Synchronize ticket payment into finance ledger
    const numericPrice = parseFloat(String(finalPricePaid).replace(/[^0-9.]/g, '')) || 0;
    if (numericPrice > 0) {
      try {
        financeApi.recordPayment({
          title: `Event Ticket - ${newTicket.eventTitle}`,
          amount: numericPrice,
          reference_type: 'EVENT_TICKET',
          reference_id: newTicket.id,
          party_name: studentProfile.name || 'Student Member',
          description: `Event Admission Ticket ${newTicket.id} (${newTicket.seat}). Event: ${newTicket.eventTitle}`,
          category: 'EVENT_TICKET',
        }).catch(() => {});
      } catch {
        // Handled silently
      }
    }
  };

  // Ticket Operations
  const handlePrintOrDownloadTicket = (ticket) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented ticket print view. Please allow popups.', 'warning');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket Pass - ${ticket.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; padding: 40px; color: #0f172a; }
          .pass { max-width: 520px; margin: 0 auto; background: white; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .header { background: #090d14; color: white; padding: 24px; text-align: left; }
          .header h2 { margin: 0; font-size: 20px; font-weight: 700; }
          .badge { display: inline-block; background: #059669; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
          .body { padding: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
          .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
          .value { font-size: 14px; color: #0f172a; font-weight: 600; }
          .qr-box { background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; border: 2px dashed #cbd5e1; margin-top: 16px; }
          .barcode { font-family: monospace; letter-spacing: 4px; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 12px; }
          .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="pass">
          <div class="header">
            <span class="badge">OFFICIAL ADMISSION PASS</span>
            <h2>${ticket.eventTitle}</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">${ticket.venue}</p>
          </div>
          <div class="body">
            <div class="grid">
              <div><div class="label">Date & Time</div><div class="value">${ticket.date}</div></div>
              <div><div class="label">Seat / Tier</div><div class="value">${ticket.seat}</div></div>
              <div><div class="label">Ticket Ref</div><div class="value" style="font-family: monospace;">${ticket.id}</div></div>
              <div><div class="label">Attendee</div><div class="value">${studentProfile.name || user?.full_name || 'Student'} (${studentProfile.studentId})</div></div>
              <div><div class="label">Status</div><div class="value" style="color: #059669;">${ticket.status}</div></div>
              <div><div class="label">Admission Rate</div><div class="value">${ticket.pricePaid}</div></div>
            </div>
            <div class="qr-box">
              <div style="font-size: 13px; font-weight: 700; color: #059669;">SCAN AT GATE: ${ticket.gate || 'Main Entrance'}</div>
              <div class="barcode">||| | | |||| ||| |||| | ||| |</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px; font-family: monospace;">${ticket.qrCodeData || ticket.id}</div>
            </div>
          </div>
          <div class="footer">SkyLine Student Organization Management System • Validated University QR Pass</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddToCalendar = (ticket) => {
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.eventTitle)}&location=${encodeURIComponent(ticket.venue)}&details=${encodeURIComponent('Ticket Pass: ' + ticket.id + ' • Seat: ' + ticket.seat)}`;
    window.open(calendarUrl, '_blank');
  };

  const handleTransferTicket = () => {
    if (!transferTicketModal || !transferRecipientEmail) return;
    setTicketsList(prev => prev.map(t => {
      if (t.id === transferTicketModal.id) {
        return {
          ...t,
          status: 'Transferred',
          transferredTo: transferRecipientEmail
        };
      }
      return t;
    }));
    showToast(`Ticket ${transferTicketModal.id} transferred to ${transferRecipientEmail}!`);
    setTransferTicketModal(null);
    setTransferRecipientEmail('');
  };

  const handleCancelTicket = () => {
    if (!cancelTicketModal) return;
    setTicketsList(prev => prev.map(t => {
      if (t.id === cancelTicketModal.id) {
        return {
          ...t,
          status: 'Cancelled'
        };
      }
      return t;
    }));
    showToast(`Ticket ${cancelTicketModal.id} cancelled. Seat released.`);
    setCancelTicketModal(null);
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return ticketsList.filter((tck) => {
      const q = ticketSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (tck.eventTitle && tck.eventTitle.toLowerCase().includes(q)) ||
        (tck.venue && tck.venue.toLowerCase().includes(q)) ||
        (tck.id && tck.id.toLowerCase().includes(q));

      const matchesFilter =
        ticketFilterStatus === 'ALL' ||
        (ticketFilterStatus === 'CONFIRMED' && tck.status === 'Confirmed') ||
        (ticketFilterStatus === 'TRANSFERRED' && tck.status === 'Transferred') ||
        (ticketFilterStatus === 'CANCELLED' && tck.status === 'Cancelled');

      return matchesSearch && matchesFilter;
    });
  }, [ticketsList, ticketSearchQuery, ticketFilterStatus]);


  const [isActivatingMembership, setIsActivatingMembership] = useState(false);

  const handleConfirmBuyMembership = async () => {
    if (!selectedClubForPurchase || isActivatingMembership) return;
    setIsActivatingMembership(true);

    const duesAmount = selectedPlanForPurchase === 'Annual'
      ? (Number(selectedClubForPurchase.annual_fee) || Number(selectedClubForPurchase.annualFee) || 499.00)
      : (Number(selectedClubForPurchase.semester_fee) || Number(selectedClubForPurchase.semesterFee) || 299.00);

    try {
      const result = await buyClubMembership(
        selectedClubForPurchase,
        selectedPlanForPurchase,
        duesAmount,
        selectedPaymentMethod
      );

      if (result && result.success) {
        const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const expiryFormatted = selectedPlanForPurchase === 'Annual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

        const newHistoryItem = {
          term: `Academic Year 2026–2027`,
          plan: `${selectedClubForPurchase.name} (${selectedPlanForPurchase} Membership)`,
          amount: `₹${duesAmount.toFixed(0)}`,
          paymentDate: todayFormatted,
          receiptId: result.membership?.transaction_id || result.membership?.receiptId || `RCP-${Date.now().toString().slice(-5)}`,
          status: 'Paid & Active'
        };
        setMembershipHistory((prev) => [newHistoryItem, ...prev]);

        // Synchronize membership fee into finance ledger
        if (duesAmount > 0) {
          try {
            financeApi.recordPayment({
              title: `Membership - ${selectedClubForPurchase.name} (${selectedPlanForPurchase})`,
              amount: duesAmount,
              reference_type: 'MEMBERSHIP',
              reference_id: result.membership?.transaction_id || result.membership?.receiptId || `MBR-${Date.now()}`,
              party_name: studentProfile.name || user?.full_name || 'Student Member',
              description: `Club membership fee for ${selectedClubForPurchase.name} (${selectedPlanForPurchase})`,
              category: 'MEMBERSHIP_FEE',
            }).catch(() => {});
          } catch {
            // Handled silently
          }
        }

        setStudentProfile((prev) => ({
          ...prev,
          membershipStatus: 'Active',
          membershipType: `${selectedClubForPurchase.shortName || selectedClubForPurchase.name} (${selectedPlanForPurchase})`,
          joinDate: todayFormatted,
          expiryDate: expiryFormatted
        }));

        setSelectedClubForPurchase(null);
        showToast(`🎉 Welcome to ${selectedClubForPurchase.name}! Your ${selectedPlanForPurchase} membership is now active!`);
      } else {
        showToast(result?.error || 'Failed to activate membership.', 'error');
      }
    } catch (err) {
      console.error('Error activating membership:', err);
      showToast('Failed to activate membership. Please try again.', 'error');
    } finally {
      setIsActivatingMembership(false);
    }
  };

  const handleApplyVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!applyVolunteerModalEvent) return;

    setApplying(true);
    const eventId = applyVolunteerModalEvent.id;

    try {
      // Backend API call
      let resData = null;
      try {
        resData = await volunteerApi.apply({
          event: eventId,
          preferred_role: volunteerPreferredRole || 'Registration Desk',
          reason: volunteerMotivation,
          experience: volunteerExperience,
        });
      } catch (apiErr) {
        console.warn('Backend volunteer apply error / fallback:', apiErr);
      }

      const newApplication = {
        id: resData?.data?.id || `app-${Math.floor(200 + Math.random() * 800)}`,
        eventName: applyVolunteerModalEvent.title || applyVolunteerModalEvent.eventName,
        roleApplied: volunteerPreferredRole || 'Registration Desk',
        preferred_role: volunteerPreferredRole || 'Registration Desk',
        appliedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'Pending',
        feedback: 'Application submitted successfully. Awaiting administrator review in Admin Volunteer Requests.'
      };

      setVolunteerApplications((prev) => [newApplication, ...prev]);
      setApplyVolunteerModalEvent(null);
      setVolunteerMotivation('');
      setVolunteerExperience('');
      showToast('Volunteer application submitted! Status: PENDING.');
    } catch (err) {
      console.error(err);
      showToast('Error submitting volunteer application.', 'error');
    } finally {
      setApplying(false);
    }
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
    const q = (eventSearchQuery || '').toLowerCase().trim();
    const cat = (eventCategoryFilter || 'ALL').toLowerCase().trim();

    const titleStr = String(evt?.title || '').toLowerCase();
    const venueStr = String(evt?.venue || '').toLowerCase();
    const clubStr = String(evt?.clubName || '').toLowerCase();
    const categoryStr = String(evt?.category || '').toLowerCase();

    const matchesQuery = !q || titleStr.includes(q) || venueStr.includes(q) || clubStr.includes(q);
    const matchesCategory = cat === 'all' || categoryStr.includes(cat);
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
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Student Dashboard</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Welcome back, <strong className="text-slate-800">{studentProfile.name}</strong> • ID: <span className="font-mono text-slate-600 font-semibold">{studentProfile.studentId}</span>
                </p>
              </div>

              {/* Clean Student Indicators */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{studentProfile.department || 'Computer Science & Software Engineering'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Academic Year 2026–2027</span>
                </span>
              </div>
            </div>

            {/* 4 Clean Student KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Campus Events */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs group">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Upcoming Events</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {eventsList.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Published & open for registration
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('events')}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Browse Events</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 2: Active Event Tickets */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs group">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium text-slate-600">My Tickets</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Ticket className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {ticketsList.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ticketsList.length === 1 ? '1 active gate pass' : `${ticketsList.length} active passes`}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('tickets')}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Passes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 3: Volunteer Roles */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs group">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Volunteer Roles</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {eventsList.filter(e => e.volunteers_required || e.volunteersRequired).length}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeVolunteerWork.length} active • {volunteerApplications.length} applied
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('volunteer')}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Volunteer Hub</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Metric 4: Certificates Earned */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-emerald-300 transition shadow-xs group">
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Certificates</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {certificatesList.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified student credentials
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => handleTabSelect('certificates')}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Certificates</span>
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

                  {eventsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No events published yet</p>
                      <p className="text-slate-400 mt-0.5">Check back soon for upcoming campus gatherings and workshops.</p>
                    </div>
                  ) : (
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
                                {evt.date?.split('•')[0] || evt.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {evt.venue}
                              </span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-semibold text-slate-900">{evt.nonMemberPrice || evt.memberPrice || 'Free'}</span>
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
                  )}
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

                    <button
                      onClick={() => handleTabSelect('merchandise')}
                      className="w-full px-3 py-2 rounded-md bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 text-xs font-medium text-emerald-900 transition flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-700" />
                        <span>Order Hoodies & T-Shirts</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
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
                    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Campus Notice
                    </span>
                    {announcementsList.length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {announcementsList[0].category || 'Official'}
                      </span>
                    )}
                  </div>
                  {announcementsList.length > 0 ? (
                    <>
                      <div className="text-[10px] text-slate-400">{announcementsList[0].publishedDate?.split('•')[0] || 'Recent'}</div>
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
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">
                      No new announcements posted at this time. All official broadcasts will appear here.
                    </p>
                  )}
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
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Campus Clubs & Societies
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore student organizations, technical chapters, and creative societies.
              </p>
            </div>

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

            {/* Clubs Grid (Available Clubs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {clubsList.filter((club) => {
                const catFilter = (selectedClubCategory || 'ALL').toLowerCase();
                const q = (clubSearchQuery || '').toLowerCase().trim();
                const clubCat = String(club.category || '').toLowerCase();
                const clubName = String(club.name || '').toLowerCase();
                const clubTag = String(club.tagline || '').toLowerCase();

                const matchesCat = catFilter === 'all' || clubCat.includes(catFilter);
                const matchesSearch = !q || clubName.includes(q) || clubTag.includes(q);
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
                            {club.availableSeats || 25} spots open
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
                            {club.description || club.tagline}
                          </p>
                        </div>

                        {/* Advisor & Schedule */}
                        <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                            <span><strong className="text-slate-700">Advisor:</strong> {club.facultyAdvisor || club.advisor || 'Faculty Lead'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span><strong className="text-slate-700">Schedule:</strong> {club.meetingSchedule || club.meetingTime || 'Weekly on Thursdays'}</span>
                          </div>
                        </div>

                        {/* Member Benefits Checklist */}
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[11px] font-bold text-slate-800 block">Member Benefits:</span>
                          <ul className="text-xs text-slate-600 space-y-1">
                            <li className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>Event Ticket Discounts (₹100 Member Pass)</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>Merchandise Discounts (Save ₹200)</span>
                            </li>
                            <li className="flex items-center gap-1.5 text-[11px]">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>Priority Registration & Lab Privileges</span>
                            </li>
                          </ul>
                        </div>

                        {/* Membership Fee Options */}
                        <div className="pt-2.5 border-t border-slate-100 bg-slate-50/80 p-2.5 rounded-lg text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Membership Plans</span>
                          <div className="flex justify-between items-center text-slate-700">
                            <span>1. Semester Membership:</span>
                            <strong className="text-slate-900 font-bold">₹{club.semester_fee || club.semesterFee || 299}</strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-700">
                            <span>2. Annual Membership:</span>
                            <strong className="text-emerald-700 font-bold">₹{club.annual_fee || club.annualFee || 499}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dues & Action */}
                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Spots Available</span>
                        <span className="text-xs font-semibold text-slate-700">{club.availableSeats || 28} Open</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEnrolled ? (
                          <button
                            onClick={() => {
                              setSelectedClubForPurchase(club);
                              setSelectedPlanForPurchase(membershipType === 'SEMESTER' ? 'Semester' : 'Annual');
                            }}
                            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Renew Membership</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedClubForPurchase(club);
                              setSelectedPlanForPurchase('Annual');
                            }}
                            className="px-3.5 py-1.5 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <span>Join Club</span>
                          </button>
                        )}
                      </div>
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

            {/* STUDENT EVENT CARDS GRID */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(evt => {
                  const hasVolunteers = evt.volunteers_required || evt.volunteersRequired;
                  return (
                    <div
                      key={evt.id}
                      className="bg-surface rounded-xl border border-border shadow-subtle hover:shadow-card transition overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Event Banner */}
                        <div className="relative h-44 w-full overflow-hidden bg-ivory-200">
                          <img
                            src={evt.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"}
                            alt={evt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-2">
                            <span className="bg-surface/90 text-primary text-[11px] font-semibold px-2.5 py-1 rounded border border-border shadow-xs backdrop-blur-xs truncate max-w-[55%]">
                              {evt.category}
                            </span>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {hasVolunteers && (
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1 animate-pulse">
                                  <HeartHandshake className="w-3 h-3" />
                                  <span>Volunteers Needed</span>
                                </span>
                              )}

                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30 backdrop-blur-xs">
                                {evt.status || 'Published'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition leading-snug">
                              {evt.title}
                            </h3>
                            {evt.description && (
                              <p className="text-xs text-text-secondary line-clamp-2">
                                {evt.description}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-text-secondary pt-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              <span>{evt.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="truncate">{evt.venue}</span>
                            </div>
                          </div>

                          {/* Available Seats & Ticket Price Logic */}
                          <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-500">
                              <span className="text-[11px]">Available Capacity</span>
                              <span className="font-semibold text-slate-800">
                                {evt.availableSeats || 48} / {evt.totalSeats || evt.capacity || 200}
                              </span>
                            </div>

                            <div className="pt-1 border-t border-slate-50 flex items-start justify-between">
                              <span className="text-slate-500 text-[11px] pt-0.5">Admission:</span>
                              {isEligibleForMemberPrice() ? (
                                <div className="text-right space-y-0.5">
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <span className="text-[11px] text-slate-400 line-through">
                                      ₹{evt.non_member_ticket_price || evt.nonMemberPriceNum || 200}
                                    </span>
                                    <span className="font-bold text-emerald-700 text-sm">
                                      ₹{evt.member_ticket_price !== undefined ? evt.member_ticket_price : (evt.memberPriceNum !== undefined ? evt.memberPriceNum : 100)}
                                    </span>
                                  </div>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    <span>Member Discount Applied</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="text-right space-y-0.5">
                                  <span className="font-bold text-slate-900 text-sm">
                                    ₹{evt.non_member_ticket_price || evt.nonMemberPriceNum || evt.ticketPrice || 200}
                                  </span>
                                  <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium mt-0.5">
                                    Become a member to unlock discounted pricing.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-4 bg-ivory-50 border-t border-border flex flex-col gap-2">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setViewEventDetailsModal(evt)}
                            className="flex-1 py-1.5 px-3 rounded bg-surface hover:bg-ivory-200 border border-border text-xs font-semibold text-text-primary transition text-center"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setBuyTicketModalEvent(evt)}
                            className="flex-1 py-1.5 px-3 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition text-center"
                          >
                            Buy Ticket
                          </button>
                        </div>

                        {/* Apply as Volunteer Button if volunteers_required */}
                        {hasVolunteers && (
                          <button
                            type="button"
                            onClick={() => openVolunteerApplication(evt)}
                            className="w-full py-1.5 px-3 rounded bg-[#EBF3FC] hover:bg-[#DCEBFB] text-[#1557B0] border border-[#1557B0]/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Apply as Volunteer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-text-muted text-xs bg-surface rounded-xl border border-border">
                No events match your current search query.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MY TICKETS (Purpose = Manage Passes & QR Check-in) */}
        {/* ========================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Page Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    My Event Tickets & Passes
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live digital admissions, fast QR door validation, and transfer management.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTabSelect('events')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Browse More Events</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Confirmed Passes</span>
                  <Ticket className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
                  {ticketsList.filter(t => t.status === 'Confirmed').length} Active
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Ready for Entrance Scanner</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Member Savings</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
                  {isMember ? '₹350 Saved' : '₹0 (Join for ₹350+ Savings)'}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">VIP Student Membership Rate</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex justify-between items-center text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Next Event Date</span>
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900 truncate">
                  {ticketsList.find(t => t.status === 'Confirmed')?.eventTitle || 'No upcoming event'}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {ticketsList.find(t => t.status === 'Confirmed')?.date?.split('•')[0] || 'Browse campus events'}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: 'ALL', label: 'All Tickets', count: ticketsList.length },
                  { id: 'CONFIRMED', label: 'Confirmed', count: ticketsList.filter(t => t.status === 'Confirmed').length },
                  { id: 'TRANSFERRED', label: 'Transferred', count: ticketsList.filter(t => t.status === 'Transferred').length },
                  { id: 'CANCELLED', label: 'Cancelled', count: ticketsList.filter(t => t.status === 'Cancelled').length },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTicketFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      ticketFilterStatus === f.id
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      ticketFilterStatus === f.id ? 'bg-zinc-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search event, venue, or ID..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Tickets Grid */}
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-semibold text-slate-800">No Tickets Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {ticketSearchQuery || ticketFilterStatus !== 'ALL'
                    ? 'No passes match your selected filter criteria. Try resetting filters.'
                    : 'You haven\'t reserved any event tickets yet. Explore campus events and reserve your seat!'}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  {(ticketSearchQuery || ticketFilterStatus !== 'ALL') ? (
                    <button
                      onClick={() => {
                        setTicketSearchQuery('');
                        setTicketFilterStatus('ALL');
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTabSelect('events')}
                      className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      Explore Campus Events
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredTickets.map((tck) => {
                  const isConfirmed = tck.status === 'Confirmed';
                  const isTransferred = tck.status === 'Transferred';
                  const isCancelled = tck.status === 'Cancelled';

                  return (
                    <div
                      key={tck.id}
                      className={`bg-white rounded-xl border transition shadow-xs flex flex-col justify-between overflow-hidden ${
                        isConfirmed
                          ? 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                          : isTransferred
                          ? 'border-purple-200 bg-purple-50/20'
                          : 'border-rose-200 bg-rose-50/20 opacity-80'
                      }`}
                    >
                      {/* Top Header Banner */}
                      <div className="p-4 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">{tck.id}</span>
                          <span className="text-[10px] text-zinc-400">• {tck.category || 'Campus Event'}</span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isConfirmed
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : isTransferred
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {tck.status}
                        </span>
                      </div>

                      {/* Ticket Body Content */}
                      <div className="p-5 space-y-3.5">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {tck.eventTitle}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                              {tck.tier || 'Pass'}
                            </span>
                            <span>• Reserved on {tck.purchaseDate}</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span className="truncate">{tck.date}</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue</span>
                            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span className="truncate">{tck.venue}</span>
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Seat / Gate</span>
                            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                              {tck.seat}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Price Paid</span>
                            <span className="font-bold text-emerald-700 font-mono mt-0.5 block">
                              {tck.pricePaid}
                            </span>
                          </div>
                        </div>

                        {/* Transferred Notice */}
                        {isTransferred && tck.transferredTo && (
                          <div className="p-2.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-200 text-xs flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span>Transferred to: <strong>{tck.transferredTo}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Footer Action Buttons */}
                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAddToCalendar(tck)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            title="Add event to Google Calendar"
                          >
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Calendar</span>
                          </button>

                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => setTransferTicketModal(tck)}
                                className="px-2.5 py-1 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Transfer pass to a student"
                              >
                                <Share2 className="w-3 h-3 text-purple-600" />
                                <span>Transfer</span>
                              </button>

                              <button
                                onClick={() => setCancelTicketModal(tck)}
                                className="px-2.5 py-1 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                title="Cancel pass reservation"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePrintOrDownloadTicket(tck)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Print PDF</span>
                          </button>

                          <button
                            onClick={() => setSelectedTicketModal(tck)}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View Pass QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: VOLUNTEER (3 SUB-TABS) */}
        {/* ========================================================= */}
        {activeTab === 'volunteer' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Volunteer Header Card */}
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-text-primary">Student Volunteer Portal</h2>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Browse community opportunities, track application statuses, and manage your active event deployments.
                </p>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex items-center gap-1 bg-ivory-100 p-1 rounded-lg border border-border text-xs w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setVolunteerSubTab('opportunities')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${volunteerSubTab === 'opportunities'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <span>1. Opportunities</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${volunteerSubTab === 'opportunities' ? 'bg-white/20 text-white' : 'bg-canvas text-text-muted'}`}>
                    {eventsList.filter(e => e.volunteers_required || e.volunteersRequired).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVolunteerSubTab('applications')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${volunteerSubTab === 'applications'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <span>2. My Applications</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${volunteerSubTab === 'applications' ? 'bg-white/20 text-white' : 'bg-canvas text-text-muted'}`}>
                    {volunteerApplications.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVolunteerSubTab('assignments')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${volunteerSubTab === 'assignments'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  <span>3. My Assignments</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${volunteerSubTab === 'assignments' ? 'bg-white/20 text-white' : 'bg-canvas text-text-muted'}`}>
                    {activeVolunteerWork.length}
                  </span>
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 1: AVAILABLE OPPORTUNITIES (volunteers_required = TRUE) */}
            {/* ------------------------------------------------------------- */}
            {volunteerSubTab === 'opportunities' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">
                    Active Volunteer Openings
                  </h3>
                  <span className="text-xs text-text-muted">
                    Events currently accepting student applications
                  </span>
                </div>

                {eventsList.filter(e => e.volunteers_required || e.volunteersRequired).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {eventsList
                      .filter(e => e.volunteers_required || e.volunteersRequired)
                      .map(opp => {
                        const roles = opp.roles_list || opp.volunteer_roles_required || ['Registration Desk', 'Hospitality'];
                        return (
                          <div
                            key={opp.id}
                            className="bg-surface rounded-xl border border-border p-5 shadow-subtle hover:border-primary/40 transition flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                  {opp.volunteer_slots_remaining || opp.volunteerCountRequired || 5} Slots Remaining
                                </span>
                                <span className="text-[11px] text-text-muted">
                                  Deadline: {opp.volunteer_deadline || 'Open'}
                                </span>
                              </div>

                              <h4 className="font-bold text-text-primary text-base leading-snug">
                                {opp.title || opp.eventName}
                              </h4>

                              <div className="space-y-1 text-xs text-text-secondary">
                                <div className="flex items-center space-x-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                  <span>{opp.date}</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                  <span className="truncate">{opp.venue}</span>
                                </div>
                              </div>

                              {/* Required Roles Chips */}
                              <div className="pt-2">
                                <span className="text-[11px] font-semibold text-text-muted block mb-1">
                                  Required Roles:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {roles.map((r, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-canvas text-text-primary text-[11px] border border-border font-medium"
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-border flex items-center justify-between">
                              <span className="text-[11px] text-text-muted font-medium">
                                Quota: {opp.volunteer_count_required || 10} volunteers
                              </span>
                              <button
                                type="button"
                                onClick={() => openVolunteerApplication(opp)}
                                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                              >
                                <HeartHandshake className="w-3.5 h-3.5" />
                                <span>Apply</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-text-muted text-xs bg-surface rounded-xl border border-border">
                    No active volunteer opportunities available at this time. Check back soon!
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 2: MY APPLICATIONS                                    */}
            {/* ------------------------------------------------------------- */}
            {volunteerSubTab === 'applications' && (
              <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="text-base font-bold text-text-primary">
                    My Volunteer Applications
                  </h3>
                  <span className="text-xs text-text-muted">
                    Status updates directly reflect administrative review
                  </span>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-canvas/70 text-text-secondary font-semibold">
                        <th className="py-2.5 px-3">Event Name</th>
                        <th className="py-2.5 px-3">Applied Date</th>
                        <th className="py-2.5 px-3">Preferred Role</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Administrator Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {volunteerApplications.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-text-muted text-xs">
                            You have not submitted any volunteer applications yet.
                          </td>
                        </tr>
                      ) : (
                        volunteerApplications.map(app => (
                          <tr key={app.id} className="hover:bg-canvas/40 transition">
                            <td className="py-3 px-3 font-bold text-text-primary">
                              {app.eventName}
                            </td>
                            <td className="py-3 px-3 text-text-muted whitespace-nowrap">
                              {app.appliedDate}
                            </td>
                            <td className="py-3 px-3 font-semibold text-primary">
                              {app.preferred_role || app.roleApplied}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${app.status === 'Approved'
                                  ? 'bg-status-success-bg text-status-success'
                                  : app.status === 'Rejected'
                                    ? 'bg-status-error-bg text-status-error'
                                    : 'bg-status-warning-bg text-status-warning'
                                }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-text-secondary text-[11px] max-w-sm">
                              {app.feedback}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-TAB 3: MY VOLUNTEER ASSIGNMENTS                           */}
            {/* ------------------------------------------------------------- */}
            {volunteerSubTab === 'assignments' && (
              <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <h3 className="text-base font-bold text-text-primary">
                    My Volunteer Assignments
                  </h3>
                  <span className="text-xs text-text-muted">
                    Official deployments created upon administrator approval
                  </span>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-canvas/70 text-text-secondary font-semibold">
                        <th className="py-2.5 px-3">Event Name</th>
                        <th className="py-2.5 px-3">Assigned Role</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeVolunteerWork.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-text-muted text-xs">
                            No approved volunteer assignments yet. Apply for upcoming opportunities to participate!
                          </td>
                        </tr>
                      ) : (
                        activeVolunteerWork.map(act => (
                          <tr key={act.id} className="hover:bg-canvas/40 transition">
                            <td className="py-3 px-3 font-bold text-text-primary">
                              {act.event}
                            </td>
                            <td className="py-3 px-3 font-semibold text-primary">
                              {act.assignedRole}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-text-primary">
                              {act.duration}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${act.status === 'Completed'
                                  ? 'bg-status-success-bg text-status-success'
                                  : 'bg-[#EBF3FC] text-[#1557B0]'
                                }`}>
                                {act.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CERTIFICATES (Purpose = Verified Credentials)     */}
        {/* ========================================================= */}
        {activeTab === 'certificates' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Certificates & Verified Credentials</h2>
                <p className="text-xs text-text-secondary">Official institutional service awards issued after event completion by the Organization Administration.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success-bg text-status-success border border-status-success/30">
                {certificatesList.length} Verified Credentials
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-canvas/70 text-text-secondary font-semibold">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Event Name</th>
                      <th className="py-3 px-4">Volunteer Role</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {certificatesList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-text-muted text-xs">
                          No certificates issued yet. Complete active volunteer assignments to earn official credentials.
                        </td>
                      </tr>
                    ) : (
                      certificatesList.map(cert => (
                        <tr key={cert.id} className="hover:bg-canvas/40 transition">
                          <td className="py-3.5 px-4 font-bold text-text-primary">
                            {cert.studentName || studentProfile.name}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-text-primary">
                            {cert.eventName}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-primary">
                            {cert.volunteerRole || 'Volunteer'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary">
                            {cert.duration || '4 Hours'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-primary text-[11px]">
                            {cert.id}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted whitespace-nowrap">
                            {cert.issueDate}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setSelectedCertificateModal(cert)}
                                className="px-2.5 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center shadow-xs"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCertificateModal(cert);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="px-2.5 py-1 rounded border border-border bg-surface hover:bg-canvas text-text-primary text-xs font-semibold transition flex items-center"
                              >
                                <Download className="w-3.5 h-3.5 mr-1" /> Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
        {/* TAB: MERCHANDISE STORE (Purpose = Exclusive Member Deals) */}
        {/* ========================================================= */}
        {activeTab === 'merchandise' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Promo Banner */}
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Official Campus Merchandise
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exclusive student organization apparel, gear, and accessories with member discounts.
                </p>
              </div>

              {/* Status Indicator */}
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  isMember
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {isMember ? (
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  ) : (
                    <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  )}
                  {isMember ? 'Member Discounts Active (Save ₹200+)' : 'Standard Pricing Active'}
                </span>
              </div>
            </div>

            {/* Member Discount Status Card */}
            {isMember ? (
              <div className="rounded-xl border p-4 bg-gradient-to-r from-[#0B1A14] to-[#0A1610] text-white border-emerald-500/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Member Tier Pricing Active</h3>
                    <p className="text-xs text-emerald-200/80">
                      As an active <strong className="text-emerald-300">{membershipBadge}</strong>, you save up to ₹200 on every official gear item!
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex-shrink-0">
                  ✓ Discounts Applied Automatically
                </span>
              </div>
            ) : (
              <div className="rounded-xl border p-4 bg-white border-amber-200 text-slate-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Member Discounts Available</h3>
                    <p className="text-xs text-slate-600">
                      Active society members save ₹200 on Club Hoodies and apparel. Join a society today to unlock member pricing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleTabSelect('membership')}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition flex-shrink-0 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Purchase Membership</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Merchandise Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const pricing = getProductPricing ? getProductPricing(product, isMember) : {
                  regularPrice: product.regularPrice || product.price || 1000,
                  memberPrice: product.memberPrice || 800,
                  effectivePrice: isMember ? (product.memberPrice || 800) : (product.regularPrice || product.price || 1000),
                  discountAmount: (product.regularPrice || 1000) - (product.memberPrice || 800),
                  isMemberDiscountApplied: isMember
                };

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900/90 text-white">
                            {product.category || 'Apparel'}
                          </span>
                        </div>
                        {isMember && pricing.discountAmount > 0 && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                              Save ₹{pricing.discountAmount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {product.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {product.description || 'Premium official student organization edition with embroidered crest.'}
                          </p>
                        </div>

                        {/* Pricing Logic Container */}
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                          {isMember ? (
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-emerald-700">
                                  ₹{pricing.memberPrice}
                                </span>
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{pricing.regularPrice}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                                  You saved ₹{pricing.discountAmount}
                                </span>
                                <span className="text-[10px] text-emerald-800 font-semibold">
                                  Member Discount Applied
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-slate-900">
                                  ₹{pricing.regularPrice}
                                </span>
                              </div>
                              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium mt-1">
                                Member discount available: Save ₹{pricing.discountAmount}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Action */}
                    <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Stock: <strong className="text-slate-800">{product.inStock ? `${product.stock || 24} left` : 'Out of stock'}</strong>
                      </span>

                      <button
                        onClick={() => {
                          const order = placeOrder ? placeOrder({ productId: product.id, size: 'M', quantity: 1, member: user }) : null;
                          showToast(`Ordered ${product.name} successfully at ₹${pricing.effectivePrice}! Order receipt generated.`);
                        }}
                        className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: PROFILE (Purpose = Student Records & Credentials)  */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Student Profile
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic credentials, membership status, and verified institutional affiliation.
                </p>
              </div>

              {/* Top Membership Badge */}
              <div>
                <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                  isMember
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : membershipStatus === 'EXPIRED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {isMember ? (
                    <BadgeCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                  ) : (
                    <User className="w-4 h-4 mr-1.5 text-slate-500" />
                  )}
                  {membershipBadge}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Photo & Actions Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-center space-y-3">
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
                  <h3 className="text-base font-bold text-slate-900">{studentProfile.name}</h3>
                  <p className="text-xs font-mono font-semibold text-slate-500">{studentProfile.studentId}</p>
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

              {/* SPECIFICATION-COMPLIANT STUDENT PROFILE CARD */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Student Profile Information</h2>
                    <p className="text-xs text-slate-500">Official university registration and membership status</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                    isMember
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : membershipStatus === 'EXPIRED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {membershipBadge}
                  </span>
                </div>

                {/* 7 Required Profile Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Field 1: Student Name */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{studentProfile.name}</span>
                  </div>

                  {/* Field 2: Student ID */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{studentProfile.studentId}</span>
                  </div>

                  {/* Field 3: University Email */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">University Email</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{studentProfile.email}</span>
                  </div>

                  {/* Field 4: Membership Status */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Membership Status</span>
                    <span className={`font-bold mt-0.5 inline-flex items-center gap-1.5 ${
                      membershipStatus === 'ACTIVE'
                        ? 'text-emerald-700'
                        : membershipStatus === 'EXPIRED'
                        ? 'text-rose-700'
                        : 'text-slate-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        membershipStatus === 'ACTIVE' ? 'bg-emerald-500' : membershipStatus === 'EXPIRED' ? 'bg-rose-500' : 'bg-slate-400'
                      }`} />
                      {membershipStatus}
                    </span>
                  </div>

                  {/* Field 5: Membership Type */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Membership Type</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">
                      {studentProfile.membershipType || (isMember ? 'Annual' : 'None')}
                    </span>
                  </div>

                  {/* Field 6: Membership Start Date */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Membership Start Date</span>
                    <span className="font-mono font-medium text-slate-700 mt-0.5 block">
                      {studentProfile.membershipStartDate || (isMember ? '2026-09-01' : 'N/A')}
                    </span>
                  </div>

                  {/* Field 7: Membership Expiry Date */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Membership Expiry Date</span>
                    <span className="font-mono font-medium text-slate-700 mt-0.5 block">
                      {studentProfile.membershipEndDate || (isMember ? '2027-08-31' : 'N/A')}
                    </span>
                  </div>
                </div>

                {/* Additional Academic Context */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
                  <span>Department: <strong className="text-slate-700">{studentProfile.department}</strong></span>
                  <span>Semester: <strong className="text-slate-700">{studentProfile.semester}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: MERCHANDISE & APPAREL STORE                     */}
        {/* ========================================================= */}
        {(activeTab === 'merchandise' || activeTab === 'store' || activeTab === 'apparel') && (
          <StudentMerchStore
            studentProfile={studentProfile}
            isClubMember={isEligibleForMemberPrice()}
          />
        )}

      </div>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MODAL 1: VIEW TICKET QR PASS                             */}
      {/* ========================================================= */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-sm w-full rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden relative">
            {/* Pass Top Banner */}
            <div className="p-5 bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-900 text-white relative">
              <button
                onClick={() => setSelectedTicketModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Campus Admission Pass
              </span>
              <h3 className="text-base font-bold text-white mt-1.5 leading-snug">
                {selectedTicketModal.eventTitle}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{selectedTicketModal.venue}</p>
            </div>

            {/* Notch Cutout Styling */}
            <div className="relative flex justify-between -mt-3 px-0">
              <div className="w-6 h-6 rounded-full bg-slate-900/60 -ml-3" />
              <div className="flex-1 border-b-2 border-dashed border-slate-200 my-auto mx-2" />
              <div className="w-6 h-6 rounded-full bg-slate-900/60 -mr-3" />
            </div>

            {/* QR Scan Area with animated line */}
            <div className="p-6 text-center space-y-4">
              <div className="relative w-44 h-44 mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-inner overflow-hidden">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[10px] font-mono font-bold text-emerald-700 mt-1">{selectedTicketModal.id}</span>
                {/* Laser scan line effect */}
                <div className="absolute inset-x-2 top-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              </div>

              {/* Details List */}
              <div className="grid grid-cols-2 gap-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendee</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {studentProfile.name || user?.full_name || 'Student'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">
                    {studentProfile.studentId || user?.student_id || 'STU-2026-101'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Seat / Gate</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {selectedTicketModal.seat}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-bold text-emerald-700 block">
                    {selectedTicketModal.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handlePrintOrDownloadTicket(selectedTicketModal)}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save Ticket PDF</span>
                </button>

                <button
                  onClick={() => handleAddToCalendar(selectedTicketModal)}
                  className="w-full py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add to Google Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1B: TRANSFER TICKET MODAL */}
      {transferTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-purple-700">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Transfer Event Ticket</h3>
            </div>

            <p className="text-xs text-slate-600">
              Transfer admission pass for <strong>{transferTicketModal.eventTitle}</strong> ({transferTicketModal.id}) to another registered university student.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Recipient University Email:</label>
              <input
                type="email"
                placeholder="student@university.edu"
                value={transferRecipientEmail}
                onChange={(e) => setTransferRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
              <span className="text-[10px] text-slate-400">Note: Once transferred, this ticket pass cannot be retrieved by your account.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferTicketModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!transferRecipientEmail}
                onClick={handleTransferTicket}
                className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1C: CANCEL TICKET MODAL */}
      {cancelTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center space-x-2 text-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Cancel Pass Reservation</h3>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your pass reservation for <strong>{cancelTicketModal.eventTitle}</strong> ({cancelTicketModal.id})? Your seat will be released back to other students.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelTicketModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleCancelTicket}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Release & Cancel Pass
              </button>
            </div>
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
                  className={`flex-1 h-9 rounded-lg text-white text-xs font-semibold transition flex items-center justify-center cursor-pointer shadow-2xs ${isEligibleForMemberPrice() ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-zinc-900 hover:bg-black'
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
      {/* MODAL 2.5: VIEW EVENT DETAILS MODAL */}
      {/* ========================================================= */}
      {viewEventDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-xl w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative text-xs">
            <button
              onClick={() => setViewEventDetailsModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner preview */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden bg-ivory-200">
              <img
                src={viewEventDetailsModal.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"}
                alt={viewEventDetailsModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-surface/90 text-primary text-[11px] font-bold px-2.5 py-1 rounded backdrop-blur-xs shadow-xs">
                {viewEventDetailsModal.category}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-text-primary">
                {viewEventDetailsModal.title}
              </h3>
              <p className="text-text-secondary mt-1 leading-relaxed">
                {viewEventDetailsModal.description || 'Join fellow students for this campus organization event.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-canvas/50">
              <div className="space-y-1">
                <span className="text-text-muted text-[11px] block">Date & Time</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {viewEventDetailsModal.date}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted text-[11px] block">Venue</span>
                <span className="font-semibold text-text-primary flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" /> {viewEventDetailsModal.venue}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted text-[11px] block">Available Seats</span>
                <span className="font-bold text-text-primary">
                  {viewEventDetailsModal.availableSeats} / {viewEventDetailsModal.totalSeats || viewEventDetailsModal.capacity || 100}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-text-muted text-[11px] block">Member Price</span>
                <span className="font-bold text-status-success">
                  {viewEventDetailsModal.memberPrice}
                </span>
              </div>
            </div>

            {/* Volunteer Opportunity Info if required */}
            {(viewEventDetailsModal.volunteers_required || viewEventDetailsModal.volunteersRequired) && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Volunteers Needed for this Event!</span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Open Roles: {(viewEventDetailsModal.roles_list || viewEventDetailsModal.volunteer_roles_required || []).join(', ') || 'Registration, Technical, Stage Management'}.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setViewEventDetailsModal(null)}
                className="px-3.5 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas font-semibold"
              >
                Close
              </button>
              {(viewEventDetailsModal.volunteers_required || viewEventDetailsModal.volunteersRequired) && (
                <button
                  type="button"
                  onClick={() => {
                    const evt = viewEventDetailsModal;
                    setViewEventDetailsModal(null);
                    openVolunteerApplication(evt);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#EBF3FC] hover:bg-[#DCEBFB] text-[#1557B0] border border-[#1557B0]/20 font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <HeartHandshake className="w-3.5 h-3.5" /> Apply as Volunteer
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const evt = viewEventDetailsModal;
                  setViewEventDetailsModal(null);
                  setBuyTicketModalEvent(evt);
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-xs"
              >
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: APPLY AS VOLUNTEER (COMPLETE SPECIFICATION)      */}
      {/* ========================================================= */}
      {/* MODAL 3: APPLY AS VOLUNTEER (COMPLETE SPECIFICATION)      */}
      {/* ========================================================= */}
      {applyVolunteerModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full rounded-2xl border border-border bg-surface shadow-elevated p-6 space-y-4 relative">
            <button
              onClick={() => setApplyVolunteerModalEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-canvas transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-text-primary">Apply as Volunteer</h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Submit your official volunteer application for review by the organization organizers.
              </p>
            </div>

            <form onSubmit={handleApplyVolunteerSubmit} className="space-y-3.5 text-xs">
              {/* Auto-filled Student & Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-canvas/50">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-0.5">
                    Student Name (Auto-filled)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={studentProfile.name}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-ivory-100 text-text-primary font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-0.5">
                    Student ID (Auto-filled)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={studentProfile.studentId}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-ivory-100 font-mono text-text-primary font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-0.5">
                    University Email (Auto-filled)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={studentProfile.email}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-ivory-100 text-text-primary cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-0.5">
                    Event Name (Auto-filled)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={applyVolunteerModalEvent.title || applyVolunteerModalEvent.eventName}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-border bg-ivory-100 text-text-primary font-semibold truncate cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Preferred Role Selection */}
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Preferred Volunteer Role <span className="text-status-error">*</span>
                </label>
                <select
                  value={volunteerPreferredRole}
                  onChange={(e) => setVolunteerPreferredRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                  required
                >
                  {(applyVolunteerModalEvent.roles_list || applyVolunteerModalEvent.volunteer_roles_required || [
                    'Registration Desk',
                    'Photography Team',
                    'Technical Support',
                    'Stage Management',
                    'Hospitality',
                    'Event Coordinator'
                  ]).map((role, idx) => (
                    <option key={idx} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Select your strongest area of contribution. Final assignment is confirmed upon administrator review.
                </span>
              </div>

              {/* Why do you want to volunteer? */}
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Why do you want to volunteer? <span className="text-status-error">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share your motivation, enthusiasm, or what you hope to contribute to this event..."
                  value={volunteerMotivation}
                  onChange={(e) => setVolunteerMotivation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>

              {/* Previous Experience (Optional) */}
              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Previous Experience <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="List any past volunteer roles, campus club events, technical skills, or certifications..."
                  value={volunteerExperience}
                  onChange={(e) => setVolunteerExperience(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-lg bg-status-info-bg text-status-info text-[11px] space-y-0.5 border border-status-info/20">
                <p className="font-semibold">Application Workflow:</p>
                <p>• Initial submission status will be set to <strong>Pending</strong>.</p>
                <p>• Appears immediately in Admin Volunteer Requests for review and role confirmation.</p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyVolunteerModalEvent(null)}
                  className="flex-1 py-2 rounded-lg border border-border bg-surface text-text-secondary hover:bg-canvas text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{applying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VIEW CERTIFICATE MODAL (OFFICIAL CREDENTIAL)     */}
      {/* ========================================================= */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-2xl w-full rounded-2xl border-4 border-[#C5A059] bg-[#FFFDF9] shadow-elevated p-8 space-y-5 relative text-center text-[#1A2E40] print:border-none print:shadow-none">
            <button
              onClick={() => setSelectedCertificateModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#1A2E40]/60 hover:text-[#1A2E40] hover:bg-black/5 transition print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <UniversityCrest className="w-12 h-12 mx-auto text-zinc-900" variant="black" />

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                Official Credential of Student Merit
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#0F2942]">Certificate of Volunteer Service</h2>
              <p className="text-xs text-text-secondary italic">This official institutional credential certifies that</p>
            </div>

            <div className="py-2 border-b-2 border-[#C5A059]/40 max-w-sm mx-auto">
              <h3 className="text-2xl font-bold text-primary tracking-wide">
                {selectedCertificateModal.studentName || studentProfile.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Student ID: {studentProfile.studentId}</p>
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto text-xs text-text-secondary leading-relaxed">
              <p>
                has served with distinction as <strong className="text-text-primary text-sm font-bold">"{selectedCertificateModal.volunteerRole || selectedCertificateModal.title}"</strong> for a total verified duration of <strong className="text-text-primary font-bold">{selectedCertificateModal.duration || '4 Hours'}</strong> in support of:
              </p>
              <p className="text-sm font-bold text-[#0F2942]">
                {selectedCertificateModal.eventName}
              </p>
            </div>

            <div className="pt-6 border-t border-[#C5A059]/30 grid grid-cols-2 gap-4 text-left text-xs">
              <div>
                <p className="font-bold text-text-primary">{selectedCertificateModal.authorizedSigner || 'Dr. Alexander Vance'}</p>
                <p className="text-[10px] text-text-muted">Faculty Advisor & Student Senate</p>
                <p className="text-[10px] text-text-muted mt-0.5">Issue Date: <strong>{selectedCertificateModal.issueDate}</strong></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-text-muted uppercase">Certificate ID:</p>
                <p className="text-xs font-mono font-bold text-primary">{selectedCertificateModal.id}</p>
                <p className="text-[9px] font-mono text-text-muted truncate mt-0.5">
                  Hash: {selectedCertificateModal.credentialHash || 'Verified SHA-256'}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-center space-x-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-text-primary hover:bg-canvas text-xs font-semibold flex items-center transition"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Certificate
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Certificate ${selectedCertificateModal.id} downloaded in high-resolution PDF.`);
                  setSelectedCertificateModal(null);
                }}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center shadow-subtle transition"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
              </button>
            </div>
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
                          Choose Membership Plan:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedPlanForPurchase('Semester')}
                            className={`p-3 rounded-md border text-left transition cursor-pointer ${selectedPlanForPurchase === 'Semester'
                                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                                : 'border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                              <span>1. Semester Membership</span>
                              {selectedPlanForPurchase === 'Semester' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                            </div>
                            <div className="text-base font-bold text-emerald-700 mt-1">
                              ₹{selectedClubForPurchase.semester_fee || selectedClubForPurchase.semesterFee || 299}
                            </div>
                            <span className="text-[10px] text-slate-500">Single Semester Plan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPlanForPurchase('Annual')}
                            className={`p-3 rounded-md border text-left transition cursor-pointer ${selectedPlanForPurchase === 'Annual'
                                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                                : 'border-slate-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                              <span>2. Annual Membership</span>
                              {selectedPlanForPurchase === 'Annual' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                            </div>
                            <div className="text-base font-bold text-emerald-700 mt-1">
                              ₹{selectedClubForPurchase.annual_fee || selectedClubForPurchase.annualFee || 499}
                            </div>
                            <span className="text-[10px] text-slate-500">Full Year (Best Value)</span>
                          </button>
                        </div>
                      </div>

                      {/* Instant Benefits */}
                      <div className="p-3 bg-emerald-50 rounded-md border border-emerald-200 text-xs text-emerald-800 space-y-1">
                        <span className="font-semibold block">Member Privileges:</span>
                        <p>✓ Event Ticket Discounts (₹100 Member Pass vs ₹200 Regular)</p>
                        <p>✓ Merchandise Discounts (Save ₹200 on Hoodies)</p>
                        <p>✓ Priority Registration & Exclusive Club Activities</p>
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
                          <option value="UPI / Online Payment">UPI / QR Payment</option>
                          <option value="Credit / Debit Card">Credit / Debit Card</option>
                        </select>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          type="button"
                          disabled={isActivatingMembership}
                          onClick={() => setSelectedClubForPurchase(null)}
                          className="flex-1 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isActivatingMembership}
                          onClick={handleConfirmBuyMembership}
                          className="flex-1 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {isActivatingMembership ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Activating...</span>
                            </>
                          ) : (
                            <span>Pay {selectedPlanForPurchase === 'Annual' ? '₹499' : '₹299'} & Activate</span>
                          )}
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
