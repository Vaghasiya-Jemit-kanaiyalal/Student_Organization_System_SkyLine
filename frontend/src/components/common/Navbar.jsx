import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTreasurer } from '../../context/TreasurerContext';
import { UniversityCrest } from './UniversityCrest';
import { TreasurerModal } from '../admin/TreasurerModal';
import {
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  ShoppingBag,
  DollarSign,
  HeartHandshake,
  FileText,
  CreditCard,
  Ticket,
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentTreasurer } = useTreasurer();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [treasurerModalOpen, setTreasurerModalOpen] = useState(false);
  const menuRef = useRef(null);

  const rawTab = searchParams.get('tab') || 'overview';
  const normalizeTabId = (t) => {
    if (t === 'roster') return 'members';
    if (t === 'broadcasts' || t === 'broadcast') return 'announcements';
    if (t === 'store') return 'merchandise';
    return t;
  };
  const activeTab = normalizeTabId(rawTab);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student navigation items
  const studentNavTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'membership', label: 'Clubs & Memberships', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'merchandise', label: 'Merchandise', icon: ShoppingBag },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'announcements', label: 'Announcements', icon: Megaphone }
  ];

  // Admin navigation items
  const adminNavTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'merchandise', label: 'Merchandise', icon: ShoppingBag },
    { id: 'fundraisers', label: 'Fundraisers', icon: DollarSign },
    { id: 'volunteers', label: 'Volunteers', icon: HeartHandshake }
  ];

  // Treasurer navigation items
  const treasurerNavTabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'reimbursements', label: 'Reimbursements', badge: 3, icon: CreditCard },
    { id: 'merch', label: 'Merch Revenue', icon: ShoppingBag },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  const currentTabs =
    user?.role === 'ADMIN'
      ? adminNavTabs
      : user?.role === 'TREASURER'
      ? treasurerNavTabs
      : studentNavTabs;

  const currentBasePath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'TREASURER'
      ? '/treasurer/dashboard'
      : '/member/dashboard';

  // Format user role label cleanly according to membership specifications
  const getUserRoleLabel = () => {
    if (user?.role === 'ADMIN') return 'Club Administrator';
    if (user?.role === 'TREASURER') return 'Treasury Officer';
    
    // Student membership status check
    const status = String(user?.membership_status || user?.membershipStatus || '').toUpperCase();
    const type = String(user?.membership_type || user?.membershipType || '').toUpperCase();
    const isMember = status === 'ACTIVE' || (user?.memberships && user.memberships.length > 0 && user.memberships.some(m => m.status === 'ACTIVE' || m.duesPaid));

    if (isMember) {
      if (type.includes('SEMESTER')) return 'Semester Member';
      return 'Annual Member';
    }
    return 'Student';
  };

  const isGreenTheme = user?.role !== 'TREASURER';

  return (
    <header
      className={`sticky top-0 z-40 text-white transition-colors ${
        isGreenTheme
          ? 'bg-[#0B0F17] border-b border-zinc-800 shadow-xs'
          : 'bg-[#0F2942] border-b border-[#1A3A5A]'
      }`}
      ref={menuRef}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        
        {/* LEFT: Brand Logo, Name, Subtitle */}
        <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
          <UniversityCrest className="w-8 h-8 text-white transition-opacity group-hover:opacity-90" variant="white" />
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Skyline
            </span>
            <span className={`text-[10px] font-medium tracking-normal -mt-0.5 ${isGreenTheme ? 'text-zinc-400' : 'text-slate-300'}`}>
              Campus Organizations
            </span>
          </div>
        </Link>

        {/* CENTER: Main Navigation */}
        {isAuthenticated && user && (
          <nav className="hidden lg:flex items-center justify-center space-x-1 flex-1 px-2">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = location.pathname.startsWith(currentBasePath) && activeTab === tab.id;

              const activeClass = isGreenTheme
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-[#1D70B8] text-white shadow-xs font-semibold';

              const inactiveClass = isGreenTheme
                ? 'text-zinc-300 hover:text-white hover:bg-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/10';

              return (
                <Link
                  key={tab.id}
                  to={`${currentBasePath}?tab=${tab.id}`}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    isTabActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-white' : isGreenTheme ? 'text-zinc-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* RIGHT: User Profile & Actions */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          {/* Admin Treasurer Quick Action */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setTreasurerModalOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-zinc-800/90 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700 transition cursor-pointer"
              title="Manage Active Treasurer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-zinc-400">Treasurer:</span>
              <span className="text-[11px] font-semibold text-white max-w-[90px] truncate">
                {currentTreasurer?.name?.split(' ')[0] || 'Marcus'}
              </span>
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-white/10 transition text-left cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-white max-w-[130px] truncate">
                    {user.name}
                  </span>
                  <span className={`text-[10px] truncate ${isGreenTheme ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                    {getUserRoleLabel()}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-md bg-white border border-slate-200 py-1 z-50 text-xs animate-fadeIn text-slate-800">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50">
                    <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isGreenTheme ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {getUserRoleLabel()}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to={`${currentBasePath}?tab=profile`}
                      onClick={() => setMenuOpen(false)}
                      className="px-3.5 py-2 flex items-center space-x-2 hover:bg-slate-50 text-slate-700"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 flex items-center space-x-2 hover:bg-red-50 text-red-600 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`inline-flex items-center px-3.5 py-1.5 text-white text-xs font-semibold rounded-md transition shadow-xs ${
                isGreenTheme ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#1D70B8] hover:bg-[#1557B0]'
              }`}
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Sub-Bar */}
      {isAuthenticated && user && (
        <div className={`lg:hidden px-3 py-1.5 overflow-x-auto no-scrollbar ${
          isGreenTheme ? 'bg-[#080C14] border-t border-zinc-800' : 'bg-[#0C2135] border-t border-[#163656]'
        }`}>
          <nav className="flex space-x-1 min-w-max">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = location.pathname.startsWith(currentBasePath) && activeTab === tab.id;

              return (
                <Link
                  key={tab.id}
                  to={`${currentBasePath}?tab=${tab.id}`}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                    isTabActive
                      ? isGreenTheme ? 'bg-emerald-600 text-white font-semibold' : 'bg-[#1D70B8] text-white font-semibold'
                      : isGreenTheme ? 'text-zinc-300 hover:text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Admin Treasurer Modal */}
      {user?.role === 'ADMIN' && (
        <TreasurerModal
          isOpen={treasurerModalOpen}
          onClose={() => setTreasurerModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
