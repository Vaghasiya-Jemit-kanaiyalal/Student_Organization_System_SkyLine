import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from './UniversityCrest';
import {
  ChevronDown,
  LogOut,
  User,
  ShieldAlert,
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  ShoppingBag,
  DollarSign,
  HeartHandshake,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, triggerSessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const activeTab = searchParams.get('tab') || 'overview';

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

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1557B0] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF] mr-1.5"></span>
            Club Admin
          </span>
        );
      case 'TREASURER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#123552] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF] mr-1.5"></span>
            Treasurer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#15466A] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159947] mr-1.5"></span>
            Student Member
          </span>
        );
    }
  };

  // Compact tab definitions fitting cleanly without horizontal scroll
  const adminNavTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'roster', label: 'Roster', badge: 5, icon: Users },
    { id: 'events', label: 'Events', badge: 4, icon: Calendar },
    { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone },
    { id: 'store', label: 'Merch', icon: ShoppingBag },
    { id: 'fundraisers', label: 'Fundraisers', icon: DollarSign },
    { id: 'volunteers', label: 'Volunteers', icon: HeartHandshake },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const treasurerNavTabs = [
    { id: 'overview', label: 'Fiscal Ledger', icon: LayoutDashboard },
    { id: 'reimbursements', label: 'Reimbursements', badge: 3, icon: CreditCard },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
    { id: 'bank', label: 'Bank Verification', icon: Building2 },
  ];

  const memberNavTabs = [
    { id: 'overview', label: 'Member Hub', icon: LayoutDashboard },
    { id: 'events', label: 'Events & Tickets', badge: 2, icon: Calendar },
    { id: 'store', label: 'Merchandise', icon: ShoppingBag },
    { id: 'volunteer', label: 'Volunteers', icon: HeartHandshake },
  ];

  const currentTabs =
    user?.role === 'ADMIN'
      ? adminNavTabs
      : user?.role === 'TREASURER'
      ? treasurerNavTabs
      : memberNavTabs;

  const currentBasePath =
    user?.role === 'ADMIN'
      ? '/admin/dashboard'
      : user?.role === 'TREASURER'
      ? '/treasurer/dashboard'
      : '/member/dashboard';

  return (
    <header className="sticky top-0 z-40 bg-[#0F2942] text-white shadow-md border-b border-[#0C2135]" ref={menuRef}>
      {/* Full Width Header Container: Far Left Logo & Far Right Profile */}
      <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* VERY LEFT: Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
          <UniversityCrest className="w-8 h-8 sm:w-9 sm:h-9 transition-transform group-hover:scale-105" variant="navy" />
          <div className="flex flex-col text-left">
            <span className="font-serif-academic text-lg sm:text-xl font-bold tracking-tight text-white leading-none group-hover:text-[#58A6FF]">
              ConnectU
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-semibold tracking-wider text-[#98A2B3] mt-0.5">
              Campus Organizations
            </span>
          </div>
        </Link>

        {/* CENTER: Tab Navigation fitting cleanly without horizontal scrollbar */}
        {isAuthenticated && user && (
          <nav className="hidden md:flex items-center justify-center space-x-1 sm:space-x-1.5 flex-1 max-w-4xl mx-auto px-2">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = location.pathname.startsWith(currentBasePath) && activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`${currentBasePath}?tab=${tab.id}`}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-[11px] xl:text-xs font-semibold transition-campus ${
                    isTabActive
                      ? 'bg-[#1557B0] text-white shadow-sm'
                      : 'text-[#D9E2EC] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-white' : 'text-[#98A2B3]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isTabActive ? 'bg-[#104A96] text-white' : 'bg-white/20 text-[#D9E2EC]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* VERY RIGHT: User Profile Header Panel */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-[#123552] hover:bg-[#15466A] text-white border border-[#15466A] transition-campus"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-white/20"
                />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#98A2B3] truncate">
                    {user.role === 'ADMIN' ? 'Club Admin' : user.role === 'TREASURER' ? 'Treasurer' : 'Student Member'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-surface border border-border py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-border bg-[#F4F5F7]">
                    <p className="font-semibold text-text-primary">{user.name}</p>
                    <p className="text-[11px] text-text-secondary truncate">{user.email}</p>
                    <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={currentBasePath}
                      onClick={() => setMenuOpen(false)}
                      className="px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#F4F5F7] text-text-primary"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#1557B0]" />
                      <span>My Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        triggerSessionExpired();
                        navigate('/session-expired');
                      }}
                      className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 hover:bg-[#F4F5F7] text-text-secondary"
                    >
                      <ShieldAlert className="w-4 h-4 text-status-warning" />
                      <span>Simulate Session Expiry</span>
                    </button>
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 flex items-center space-x-2.5 hover:bg-red-50 text-status-error font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#1557B0] hover:bg-[#104A96] text-white text-xs font-semibold rounded-md shadow-sm transition-campus"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Sub-Header for Tab Links */}
      {isAuthenticated && user && (
        <div className="md:hidden bg-[#123552] border-t border-[#15466A] px-3 py-1.5 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 min-w-max">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              const isTabActive = location.pathname.startsWith(currentBasePath) && activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`${currentBasePath}?tab=${tab.id}`}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-campus ${
                    isTabActive
                      ? 'bg-[#1557B0] text-white'
                      : 'text-[#D9E2EC] hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
