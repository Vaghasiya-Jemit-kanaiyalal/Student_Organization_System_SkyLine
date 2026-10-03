import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://127.0.0.1:8000/api';

const normalizeUser = (u) => {
  if (!u) return null;
  return {
    ...u,
    id: u.id,
    name: u.full_name || u.name || 'Student',
    fullName: u.full_name || u.name || 'Student',
    studentId: u.student_id || u.studentId || '',
    student_id: u.student_id || u.studentId || '',
    role: u.role || 'MEMBER',
    email: u.email,
    department: u.department || 'General Undergraduate Studies',
    semester: u.semester || 'Academic Year 2026',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 2026',
    status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
    memberships: u.memberships || [],
    volunteerHours: u.volunteerHours || 0,
    ticketsCount: u.ticketsCount || 0
  };
};

export const AuthProvider = ({ children }) => {
  // Current authenticated user state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('connectu_active_user');
      const savedToken = localStorage.getItem('connectu_jwt_token');
      if (savedUser && savedToken) {
        return normalizeUser(JSON.parse(savedUser));
      }
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('connectu_jwt_token') || null;
    } catch {
      return null;
    }
  });

  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Sync active user to /api/auth/me/ upon initial load if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('connectu_jwt_token');
      if (!savedToken) return;

      try {
        const response = await fetch(`${API_BASE}/auth/me/`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const normalized = normalizeUser(userData);
          setUser(normalized);
          localStorage.setItem('connectu_active_user', JSON.stringify(normalized));
        } else if (response.status === 401) {
          // Token expired
          logout();
        }
      } catch (err) {
        console.warn('Backend reach check failed:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * Universal Login Handler
   * Connects to Django SimpleJWT backend: POST /api/auth/login/
   */
  const login = async (email, password, rememberMe = true) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = 'Authentication failed. Please verify your credentials.';
        if (data.details) {
          if (typeof data.details === 'string') {
            errorMsg = data.details;
          } else if (data.details.detail) {
            errorMsg = data.details.detail;
          } else if (data.details.non_field_errors) {
            errorMsg = data.details.non_field_errors.join(' ');
          }
        }
        return {
          success: false,
          error: errorMsg
        };
      }

      const normalized = normalizeUser(data.user || { email, role: data.role });
      const accessToken = data.access;
      const refreshToken = data.refresh;

      setUser(normalized);
      setToken(accessToken);
      setSessionExpiredNotice(false);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('connectu_active_user', JSON.stringify(normalized));
      storage.setItem('connectu_jwt_token', accessToken);
      if (refreshToken) {
        storage.setItem('connectu_refresh_token', refreshToken);
      }

      return {
        success: true,
        user: normalized,
        role: data.role
      };
    } catch (err) {
      console.error('Login network error:', err);
      return {
        success: false,
        error: 'Unable to connect to the backend authentication server. Ensure Django server is running.'
      };
    }
  };

  /**
   * Member Self-Registration
   * Connects to Django DRF backend: POST /api/auth/register/
   */
  const registerMember = async ({ name, studentId, email, password }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: name.trim(),
          student_id: studentId.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          password: password,
          password_confirm: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = 'Registration failed. Please check the provided information.';
        if (data.details) {
          if (typeof data.details === 'string') {
            errorMsg = data.details;
          } else if (typeof data.details === 'object') {
            const firstKey = Object.keys(data.details)[0];
            const val = data.details[firstKey];
            if (Array.isArray(val)) {
              errorMsg = val[0];
            } else if (typeof val === 'string') {
              errorMsg = val;
            }
          }
        }
        return {
          success: false,
          error: errorMsg
        };
      }

      const normalized = normalizeUser(data.user);
      const accessToken = data.access;
      const refreshToken = data.refresh;

      // Save tokens so user is immediately authenticated
      if (accessToken) {
        setUser(normalized);
        setToken(accessToken);
        localStorage.setItem('connectu_active_user', JSON.stringify(normalized));
        localStorage.setItem('connectu_jwt_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('connectu_refresh_token', refreshToken);
        }
      }

      return {
        success: true,
        user: normalized
      };
    } catch (err) {
      console.error('Registration network error:', err);
      return {
        success: false,
        error: 'Network error: could not connect to backend server.'
      };
    }
  };

  /**
   * Password Reset
   */
  const resetPassword = async (email, newPassword) => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      return { success: response.ok };
    } catch {
      return { success: false, error: 'Could not contact server.' };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem('connectu_refresh_token') || sessionStorage.getItem('connectu_refresh_token');
    const savedToken = token || localStorage.getItem('connectu_jwt_token');

    if (refreshToken && savedToken) {
      try {
        await fetch(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
      } catch (err) {
        console.warn('Backend logout call failed:', err);
      }
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem('connectu_active_user');
    localStorage.removeItem('connectu_jwt_token');
    localStorage.removeItem('connectu_refresh_token');
    sessionStorage.removeItem('connectu_active_user');
    sessionStorage.removeItem('connectu_jwt_token');
    sessionStorage.removeItem('connectu_refresh_token');
  };

  /**
   * Simulate Session Expiration
   */
  const triggerSessionExpired = () => {
    logout();
    setSessionExpiredNotice(true);
  };

  /**
   * Quick demo credentials login
   */
  const quickSwitchRole = async (targetRole) => {
    let demoEmail = '';
    let demoPass = '';

    if (targetRole === 'ADMIN') {
      demoEmail = 'admin@studentorg.edu';
      demoPass = 'AdminPassword123!';
    } else if (targetRole === 'TREASURER') {
      demoEmail = 'treasurer@treasurer.gmail.com';
      demoPass = 'TreasurerPassword123!';
    } else {
      demoEmail = 'alex.rivera@studentorg.edu';
      demoPass = 'MemberPassword123!';
    }

    const res = await login(demoEmail, demoPass, true);
    if (res.success) {
      return res.user;
    }
    return null;
  };

  /**
   * Purchase / Join a Club Membership
   */
  const buyClubMembership = (club, plan = 'Annual', amount = 35.00, paymentMethod = 'Student Account (Bursar)') => {
    if (!user) return { success: false, error: 'User is not logged in.' };

    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const receiptCode = `RCP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newMembership = {
      clubId: club.id,
      clubName: club.name,
      plan: `${plan} Membership`,
      amount: typeof amount === 'number' ? `$${amount.toFixed(2)}` : amount,
      rawAmount: typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')),
      role: 'Active Member',
      duesPaid: true,
      paymentMethod: paymentMethod,
      paymentDate: todayStr,
      receiptId: receiptCode,
      status: 'Paid & Active',
      expiryDate: plan === 'Annual' ? 'June 30, 2027' : 'Dec 31, 2026'
    };

    const existingMemberships = (user.memberships || []).filter(m => m.clubId !== club.id);
    const updatedMemberships = [newMembership, ...existingMemberships];

    const updatedUser = {
      ...user,
      memberships: updatedMemberships,
      membershipStatus: 'Active',
      membershipType: `${club.shortName || club.name} (${plan})`
    };

    setUser(updatedUser);
    localStorage.setItem('connectu_active_user', JSON.stringify(updatedUser));
    return { success: true, membership: newMembership, user: updatedUser };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        sessionExpiredNotice,
        login,
        registerMember,
        resetPassword,
        logout,
        triggerSessionExpired,
        quickSwitchRole,
        buyClubMembership,
        users: []
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
