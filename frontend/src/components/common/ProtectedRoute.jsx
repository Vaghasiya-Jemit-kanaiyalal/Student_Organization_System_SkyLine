import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login page and preserve requested destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = String(user.role || '').toUpperCase();
  const normalizedAllowedRoles = allowedRoles?.map((r) => String(r).toUpperCase());

  // Handle student role synonymity (Membership is a property of Student)
  const effectiveAllowedRoles = normalizedAllowedRoles ? [...normalizedAllowedRoles] : null;
  if (effectiveAllowedRoles) {
    if (effectiveAllowedRoles.includes('MEMBER') && !effectiveAllowedRoles.includes('STUDENT')) {
      effectiveAllowedRoles.push('STUDENT');
    }
    if (effectiveAllowedRoles.includes('STUDENT') && !effectiveAllowedRoles.includes('MEMBER')) {
      effectiveAllowedRoles.push('MEMBER');
    }
  }

  if (effectiveAllowedRoles && !effectiveAllowedRoles.includes(userRole)) {
    // Automatically redirect users to their assigned role dashboard
    if (userRole === 'TREASURER') {
      return <Navigate to="/treasurer/dashboard" replace />;
    }
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === 'STUDENT' || userRole === 'MEMBER') {
      return <Navigate to="/member/dashboard" replace />;
    }

    return (
      <Navigate
        to="/unauthorized"
        state={{
          attemptedPath: location.pathname,
          requiredRoles: allowedRoles,
          currentRole: user.role
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
