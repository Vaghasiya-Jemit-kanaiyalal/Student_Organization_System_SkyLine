import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UniversityCrest } from './UniversityCrest';
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, triggerSessionExpired, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setRoleSwitcherOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (targetRole) => {
    const switchedUser = quickSwitchRole(targetRole);
    setRoleSwitcherOpen(false);
    if (switchedUser) {
      if (targetRole === 'ADMIN') navigate('/admin/dashboard');
      else if (targetRole === 'TREASURER') navigate('/treasurer/dashboard');
      else navigate('/member/dashboard');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white border border-primary-700">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5"></span>
            Club Admin
          </span>
        );
      case 'TREASURER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-light text-accent-700 border border-accent-300">
            <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5"></span>
            Treasurer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ivory-200 text-text-primary border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success mr-1.5"></span>
            Student Member
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border shadow-subtle" ref={menuRef}>
      {/* Top Academic Ribbon */}
      <div className="bg-primary text-white text-[11px] font-medium tracking-wide py-1 px-4 sm:px-8 flex justify-between items-center border-b border-primary-700">
        <div className="flex items-center space-x-2">
          <span className="text-accent font-semibold">CONNECTU</span>
          <span className="text-primary-300">|</span>
          <span className="hidden sm:inline text-primary-100">Official Student Organization Administration Portal</span>
          <span className="sm:hidden text-primary-100">Student Portal</span>
        </div>
        <div className="flex items-center space-x-4 text-primary-200 text-[11px]">
          <span className="hidden md:inline font-mono">Academic Year 2026–2027</span>
          <span className="text-accent font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-success inline-block"></span>
            University Verified
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <UniversityCrest className="w-9 h-9 transition-transform group-hover:scale-105" variant="navy" />
          <div className="flex flex-col text-left">
            <span className="font-serif-academic text-xl font-bold tracking-tight text-primary leading-none group-hover:text-primary-hover">
              ConnectU
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-muted mt-0.5">
              Campus Organizations
            </span>
          </div>
        </Link>

        {/* Center Navigation when logged in */}
        {isAuthenticated && user && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {user.role === 'MEMBER' && (
              <>
                <Link
                  to="/member/dashboard"
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-campus ${
                    location.pathname.startsWith('/member')
                      ? 'text-primary bg-primary-light font-semibold'
                      : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
                  }`}
                >
                  Member Hub
                </Link>
                <Link
                  to="/member/dashboard?tab=events"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Events & Tickets
                </Link>
                <Link
                  to="/member/dashboard?tab=store"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Merchandise
                </Link>
              </>
            )}

            {user.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-campus ${
                    location.pathname.startsWith('/admin')
                      ? 'text-primary bg-primary-light font-semibold'
                      : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
                  }`}
                >
                  Organizer Console
                </Link>
                <Link
                  to="/admin/dashboard?tab=members"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Roster
                </Link>
                <Link
                  to="/admin/dashboard?tab=announcements"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Announcements
                </Link>
              </>
            )}

            {user.role === 'TREASURER' && (
              <>
                <Link
                  to="/treasurer/dashboard"
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-campus ${
                    location.pathname.startsWith('/treasurer')
                      ? 'text-primary bg-primary-light font-semibold'
                      : 'text-text-secondary hover:text-primary hover:bg-ivory-100'
                  }`}
                >
                  Fiscal Ledger
                </Link>
                <Link
                  to="/treasurer/dashboard?tab=reimbursements"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Reimbursements
                </Link>
                <Link
                  to="/treasurer/dashboard?tab=reports"
                  className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-ivory-100 rounded transition-campus"
                >
                  Audit Reports
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Quick Role Switcher Button for judges */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                  className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 border border-accent-300 bg-accent-light/50 hover:bg-accent-light text-accent-700 text-xs font-medium rounded transition-campus"
                  title="Switch between Member, Admin, and Treasurer roles for demonstration"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Demo Roles</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>

                {roleSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-card bg-surface border border-border py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border bg-ivory-100">
                      <p className="font-semibold text-text-primary">Simulate User Roles</p>
                      <p className="text-[11px] text-text-secondary">Instant role testing for judges</p>
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('MEMBER')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-ivory-100 ${
                        user.role === 'MEMBER' ? 'bg-primary-light/50 font-semibold text-primary' : 'text-text-primary'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Student Member</span>
                        <span className="text-[10px] text-text-muted">Sophia Montgomery (Junior)</span>
                      </div>
                      {user.role === 'MEMBER' && <span className="text-primary font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('ADMIN')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-ivory-100 ${
                        user.role === 'ADMIN' ? 'bg-primary-light/50 font-semibold text-primary' : 'text-text-primary'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Club Admin / Organizer</span>
                        <span className="text-[10px] text-text-muted">Dr. Alexander Vance</span>
                      </div>
                      {user.role === 'ADMIN' && <span className="text-primary font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('TREASURER')}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-ivory-100 ${
                        user.role === 'TREASURER' ? 'bg-primary-light/50 font-semibold text-primary' : 'text-text-primary'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>Club Treasurer</span>
                        <span className="text-[10px] text-text-muted">Marcus Sterling (Finance)</span>
                      </div>
                      {user.role === 'TREASURER' && <span className="text-primary font-bold">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-ivory-200 rounded transition-campus relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-surface"></span>
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md shadow-card bg-surface border border-border py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-border flex justify-between items-center">
                      <span className="font-semibold text-text-primary">Campus Notices</span>
                      <span className="text-[10px] text-accent font-medium">3 unread</span>
                    </div>
                    <div className="divide-y divide-border">
                      <div className="p-3 hover:bg-ivory-100 transition cursor-pointer">
                        <p className="font-medium text-text-primary">Robotics Showcase registration confirmed</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Your ticket is ready in Ticket Wallet</p>
                      </div>
                      <div className="p-3 hover:bg-ivory-100 transition cursor-pointer">
                        <p className="font-medium text-text-primary">Council Budget Update</p>
                        <p className="text-[10px] text-text-muted mt-0.5">$4,500 grant approved for Q4 equipment</p>
                      </div>
                      <div className="p-3 hover:bg-ivory-100 transition cursor-pointer">
                        <p className="font-medium text-text-primary">Membership Lapel Pins in Office</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Collect from Student Union Building, Rm 204</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Role badge */}
              <div className="hidden lg:block">
                {getRoleBadge(user.role)}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded hover:bg-ivory-200 transition-campus border border-transparent hover:border-border"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="text-xs font-semibold text-text-primary truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {user.studentId}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-card bg-surface border border-border py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border bg-ivory-100">
                      <p className="font-semibold text-text-primary">{user.name}</p>
                      <p className="text-[11px] text-text-secondary font-mono">{user.email}</p>
                      <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={
                          user.role === 'ADMIN'
                            ? '/admin/dashboard'
                            : user.role === 'TREASURER'
                            ? '/treasurer/dashboard'
                            : '/member/dashboard'
                        }
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 flex items-center space-x-2 hover:bg-ivory-100 text-text-primary"
                      >
                        <User className="w-4 h-4 text-primary" />
                        <span>Go to My Dashboard</span>
                      </Link>

                      {/* Demo testing shortcuts */}
                      <Link
                        to="/unauthorized"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 flex items-center space-x-2 hover:bg-ivory-100 text-text-secondary"
                      >
                        <ShieldAlert className="w-4 h-4 text-status-warning" />
                        <span>Preview 403 Forbidden Screen</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          triggerSessionExpired();
                          navigate('/session-expired');
                        }}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-ivory-100 text-text-secondary"
                      >
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span>Simulate Session Inactivity Timeout</span>
                      </button>
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 flex items-center space-x-2 text-status-error hover:bg-status-error-bg font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of University Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary-light hover:bg-primary-100 border border-primary-200 rounded transition-campus"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded shadow-sm transition-campus"
              >
                Member Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
