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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Automatically redirect users to their assigned role dashboard
    if (user.role === 'TREASURER') {
      return <Navigate to="/treasurer/dashboard" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'MEMBER') {
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
