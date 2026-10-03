import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MerchandiseProvider } from './context/MerchandiseContext';
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

// Index root router redirector
const RootRedirector = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'TREASURER') return <Navigate to="/treasurer/dashboard" replace />;
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
              SkyLine Student Organization System
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

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MerchandiseProvider>
          <FundraiserProvider>
            <TreasurerProvider>
              <div className="min-h-screen flex flex-col bg-ivory text-text-primary antialiased selection:bg-primary-100 selection:text-primary-800">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Root default */}
                    <Route path="/" element={<RootRedirector />} />

                    {/* Public Auth Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-success" element={<EmailVerificationSuccessPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="/session-expired" element={<SessionExpiredPage />} />

                    {/* Protected Role-Based Routes */}
                    <Route
                      path="/member/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['MEMBER', 'ADMIN', 'TREASURER']}>
                          <MemberDashboard />
                        </ProtectedRoute>
                      }
                    />

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
                <UniversityFooter />
              </div>
            </TreasurerProvider>
          </FundraiserProvider>
        </MerchandiseProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
