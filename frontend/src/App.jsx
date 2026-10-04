import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MerchandiseProvider } from './context/MerchandiseContext';
import { FinanceProvider } from './context/FinanceContext';
import { FundraiserProvider } from './context/FundraiserContext';
import { TreasurerProvider } from './context/TreasurerContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { UniversityCrest } from './components/common/UniversityCrest';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { EmailVerificationSuccessPage } from './pages/auth/EmailVerificationSuccessPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { SessionExpiredPage } from './pages/auth/SessionExpiredPage';

// Dashboards
import { MemberDashboard } from './pages/dashboards/MemberDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { TreasurerDashboard } from './pages/dashboards/TreasurerDashboard';
import MemberManagementPage from './pages/admin/MemberManagementPage';
import { TicketVerificationPage } from './pages/tickets/TicketVerificationPage';

// Index root router redirector
const RootRedirector = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const cleanRole = String(user.role || '').toUpperCase();
  if (cleanRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (cleanRole === 'TREASURER') return <Navigate to="/treasurer/dashboard" replace />;
  return <Navigate to="/member/dashboard" replace />;
};

// University Footer
const UniversityFooter = () => {
  return (
    <footer className="mt-auto bg-surface border-t border-border py-8 px-4 sm:px-6 lg:px-8 text-xs text-text-secondary">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <UniversityCrest className="w-8 h-8" variant="navy" />
          <div>
            <p className="font-bold text-text-primary text-sm">
              ConnectU Student Organization System
            </p>
            <p className="text-[11px] text-text-muted">
              Division of Student Affairs & Campus Life • Academic Year 2026–2027
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
          <span className="text-text-muted">University Honor Code</span>
          <span className="text-border">•</span>
          <span className="text-text-muted">FERPA Compliance</span>
          <span className="text-border">•</span>
          <span className="text-text-muted">Bursar Office Accounting</span>
          <span className="text-border">•</span>
          <span className="text-accent font-semibold">Institutional Security Verified</span>
        </div>

        <div className="text-right text-[11px] text-text-muted">
          <span>Classical Campus Theme • Deep Burgundy & Warm Ivory</span>
        </div>
      </div>
    </footer>
  );
};

// Main App Layout that conditionally hides Navbar and Footer on public auth pages
const AppContent = () => {
  const location = useLocation();
  const authRoutes = [
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-success',
    '/session-expired',
    '/unauthorized'
  ];
  const isTicketRoute = location.pathname.startsWith('/ticket/');
  const isAuthRoute = authRoutes.includes(location.pathname) || isTicketRoute;

  return (
    <div className={`min-h-screen flex flex-col text-text-primary antialiased selection:bg-emerald-100 selection:text-emerald-900 ${isAuthRoute ? 'bg-slate-50' : 'bg-slate-50'}`}>
      {!isAuthRoute && <Navbar />}
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Root default */}
          <Route path="/" element={<RootRedirector />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-success" element={<EmailVerificationSuccessPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />

          {/* Public Dynamic QR Ticket Verification Route */}
          <Route path="/ticket/:ticket_uuid" element={<TicketVerificationPage />} />

          {/* Protected Role-Based Routes */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'MEMBER', 'ADMIN', 'TREASURER']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/student/dashboard" element={<Navigate to="/member/dashboard" replace />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/members"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MemberManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/treasurer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TREASURER']}>
                <TreasurerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      {!isAuthRoute && <UniversityFooter />}
    </div>
  );
};

// Global Error Boundary Component to prevent blank screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SkyLine UI Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('connectu_active_user');
      localStorage.removeItem('connectu_jwt_token');
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Error Encountered</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected display issue occurred ({this.state.error?.message || 'Rendering error'}). Click below to reload or reset session.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Reset & Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <MerchandiseProvider>
            <FinanceProvider>
              <FundraiserProvider>
                <TreasurerProvider>
                  <AppContent />
                </TreasurerProvider>
              </FundraiserProvider>
            </FinanceProvider>
          </MerchandiseProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
