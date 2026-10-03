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
    // Redirect to academic unauthorized screen with contextual role info
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
