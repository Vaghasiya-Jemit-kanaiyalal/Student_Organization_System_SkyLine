import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://127.0.0.1:8000/api';

const normalizeUser = (u) => {
  if (!u) return null;
  const rawStatus = String(u.membership_status || u.membershipStatus || (u.memberships?.length > 0 ? 'ACTIVE' : 'NONE')).toUpperCase();
  const rawEndDate = u.membership_end_date || u.membershipEndDate;
  const todayStr = new Date().toISOString().split('T')[0];
  // Automatically discard membership if finish duration has passed
  const isFinished = rawEndDate && rawEndDate < todayStr;
  const membershipStatus = (rawStatus === 'ACTIVE' && isFinished) ? 'EXPIRED' : rawStatus;

  const rawType = u.membership_type || u.membershipType || (u.memberships?.[0]?.membership_type);
  const membershipType = rawType ? String(rawType).toUpperCase() : (membershipStatus === 'ACTIVE' ? 'ANNUAL' : null);
  const isMember = membershipStatus === 'ACTIVE';

  let badge = 'Student';
  if (isMember) {
    badge = membershipType === 'SEMESTER' ? 'Semester Member' : 'Annual Member';
  } else if (membershipStatus === 'EXPIRED') {
    badge = 'Student';
  }

  return {
    ...u,
    id: u.id,
    name: u.full_name || u.name || 'Student',
    fullName: u.full_name || u.name || 'Student',
    studentId: u.student_id || u.studentId || '',
    student_id: u.student_id || u.studentId || '',
    role: u.role || 'STUDENT',
    email: u.email,
    membership_status: membershipStatus,
    membershipStatus: membershipStatus,
    membership_type: membershipType,
    membershipType: membershipType,
    membership_start_date: u.membership_start_date || u.membershipStartDate || null,
    membership_end_date: u.membership_end_date || u.membershipEndDate || null,
    membershipBadge: badge,
    is_active_member: isMember,
    isActiveMember: isMember,
    department: u.department || 'Computer Science & Software Engineering',
    semester: u.semester || 'Semester 4 • 2026',
    phone: u.phone || '+1 (555) 234-8910',
    avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Oct 2026',
    status: u.is_active !== false ? 'ACTIVE' : 'INACTIVE',
    memberships: u.memberships || [],
    volunteerHours: u.volunteerHours || 18,
    ticketsCount: u.ticketsCount || 2
  };
};

export const AuthProvider = ({ children }) => {
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

  // Sync active user from /api/auth/me/ upon load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('connectu_jwt_token');
      if (!savedToken || savedToken.startsWith('mock-jwt-token-')) return;

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
          logout();
        }
      } catch (err) {
        console.warn('Backend reach check failed:', err);
      }
    };

    fetchCurrentUser();

    const handleExternalUserUpdate = () => {
      try {
        const saved = localStorage.getItem('connectu_active_user');
        if (saved) {
          setUser(normalizeUser(JSON.parse(saved)));
        }
      } catch {}
    };

    window.addEventListener('storage', handleExternalUserUpdate);
    window.addEventListener('skyline-user-updated', handleExternalUserUpdate);
    return () => {
      window.removeEventListener('storage', handleExternalUserUpdate);
      window.removeEventListener('skyline-user-updated', handleExternalUserUpdate);
    };
  }, []);

  /**
   * Universal Login Handler
   */
  const login = async (email, password, rememberMe = true) => {
    const cleanEmail = email.trim().toLowerCase();

    // Direct Instant Student Login for Yug (Annual Member)
    if (cleanEmail === 'yug@gmail.com' && password === 'Yug@123') {
      const studentUser = normalizeUser({
        id: 'stu-yug-01',
        name: 'Yug',
        fullName: 'Yug',
        full_name: 'Yug',
        studentId: 'STU-2026-9901',
        student_id: 'STU-2026-9901',
        email: 'yug@gmail.com',
        role: 'STUDENT',
        membership_status: 'ACTIVE',
        membership_type: 'ANNUAL',
        membership_start_date: '2026-09-01',
        membership_end_date: '2027-08-31',
        department: 'Computer Science & Software Engineering',
        semester: 'Semester 4 • 2026',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        status: 'ACTIVE',
        is_active: true,
        memberships: [
          {
            id: 'mem-skyline-01',
            club_name_snapshot: 'Skyline Robotics & AI Society',
            clubName: 'Skyline Robotics & AI Society',
            membership_type: 'ANNUAL',
            status: 'ACTIVE',
            fee: 499.00,
            start_date: '2026-09-01',
            end_date: '2027-08-31',
            expiryDate: 'Aug 31, 2027'
          }
        ],
        volunteerHours: 18,
        ticketsCount: 2
      });

      const mockToken = 'mock-jwt-token-yug-student-2026';
      setUser(studentUser);
      setToken(mockToken);
      setSessionExpiredNotice(false);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('connectu_active_user', JSON.stringify(studentUser));
      storage.setItem('connectu_jwt_token', mockToken);

      return {
        success: true,
        user: studentUser,
        role: 'STUDENT'
      };
    }

    // Direct Instant Treasurer Login (amit@treasurer.gmail.com)
    if (cleanEmail === 'amit@treasurer.gmail.com' && password === 'Treas@123') {
      const fallbackTreasurer = normalizeUser({
        id: '2',
        name: 'Amit Treasurer',
        fullName: 'Amit Treasurer',
        full_name: 'Amit Treasurer',
        email: 'amit@treasurer.gmail.com',
        role: 'TREASURER',
        status: 'ACTIVE',
        is_active: true,
      });

      try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeUser(data.user || fallbackTreasurer);
          setUser(normalized);
          setToken(data.access);
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('connectu_active_user', JSON.stringify(normalized));
          storage.setItem('connectu_jwt_token', data.access);
          if (data.refresh) storage.setItem('connectu_refresh_token', data.refresh);
          return { success: true, user: normalized, role: 'TREASURER' };
        }
      } catch {
        // Use offline fallback below
      }

      setUser(fallbackTreasurer);
      setToken('mock-jwt-token-treasurer-amit');
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('connectu_active_user', JSON.stringify(fallbackTreasurer));
      storage.setItem('connectu_jwt_token', 'mock-jwt-token-treasurer-amit');
      return { success: true, user: fallbackTreasurer, role: 'TREASURER' };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
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
   * Member / Student Self-Registration
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

    if (refreshToken && savedToken && !savedToken.startsWith('mock-')) {
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
    } else if (targetRole === 'SEMESTER_MEMBER') {
      demoEmail = 'alex.rivera@studentorg.edu';
      demoPass = 'MemberPassword123!';
    } else if (targetRole === 'EXPIRED_MEMBER') {
      demoEmail = 'sarah.chen@studentorg.edu';
      demoPass = 'MemberPassword123!';
    } else if (targetRole === 'NON_MEMBER') {
      demoEmail = 'rohan.sharma@studentorg.edu';
      demoPass = 'MemberPassword123!';
    } else {
      demoEmail = 'student@university.edu';
      demoPass = 'password123';
    }

    const res = await login(demoEmail, demoPass, true);
    if (res.success) {
      return res.user;
    }
    return null;
  };

  /**
   * Purchase / Join a Club Membership (SEMESTER or ANNUAL)
   */
  const buyClubMembership = async (club, plan = 'ANNUAL', amount = 499.00, paymentMethod = 'Student Account (Bursar)') => {
    if (!user) return { success: false, error: 'User is not logged in.' };

    const normalizedPlan = String(plan).toUpperCase().includes('SEMESTER') ? 'SEMESTER' : 'ANNUAL';
    const savedToken = token || localStorage.getItem('connectu_jwt_token');

    const targetClubId = (typeof club === 'string' ? club : club?.id) || 'club-robotics';
    const targetClubName = (typeof club === 'object' ? club?.name : null) || 'Skyline Student Association';

    // Attempt backend sync
    if (savedToken && !savedToken.startsWith('mock-')) {
      try {
        const response = await fetch(`${API_BASE}/membership/purchase/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            club_id: targetClubId,
            membership_type: normalizedPlan,
            payment_method: paymentMethod
          })
        });
        if (response.ok) {
          const data = await response.json();
          const updatedUser = normalizeUser(data.user);
          setUser(updatedUser);
          localStorage.setItem('connectu_active_user', JSON.stringify(updatedUser));
          return { success: true, membership: data.membership, user: updatedUser };
        } else {
          const errorData = await response.json().catch(() => null);
          console.warn('Backend membership purchase failed with status:', response.status, errorData);
        }
      } catch (err) {
        console.warn('Backend purchase call failed, using client-side fallback:', err);
      }
    }

    // Client-side state fallback
    const today = new Date();
    const expiryDate = new Date();
    if (normalizedPlan === 'ANNUAL') {
      expiryDate.setFullYear(today.getFullYear() + 1);
    } else {
      expiryDate.setMonth(today.getMonth() + 6);
    }

    const todayStr = today.toISOString().split('T')[0];
    const expiryStr = expiryDate.toISOString().split('T')[0];
    const receiptCode = `RCP-${today.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newMembership = {
      id: `mem-${Math.floor(1000 + Math.random() * 9000)}`,
      club: targetClubId,
      clubId: targetClubId,
      club_id: targetClubId,
      club_name_snapshot: targetClubName,
      clubName: targetClubName,
      membership_type: normalizedPlan,
      fee: typeof amount === 'number' ? amount : 499.00,
      start_date: todayStr,
      end_date: expiryStr,
      status: 'ACTIVE',
      payment_method: paymentMethod,
      transaction_id: receiptCode,
      expiryDate: expiryDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    const existingMemberships = (user.memberships || []).filter(m => {
      const mClubId = m.clubId || m.club_id || (typeof m.club === 'object' ? m.club?.id : m.club);
      return mClubId !== targetClubId;
    });
    const updatedMemberships = [newMembership, ...existingMemberships];

    const updatedUser = normalizeUser({
      ...user,
      membership_status: 'ACTIVE',
      membershipStatus: 'ACTIVE',
      membership_type: normalizedPlan,
      membershipType: normalizedPlan,
      membership_start_date: todayStr,
      membership_end_date: expiryStr,
      memberships: updatedMemberships,
    });

    setUser(updatedUser);
    localStorage.setItem('connectu_active_user', JSON.stringify(updatedUser));

    // Synchronize master member roster in localStorage
    try {
      const savedRoster = localStorage.getItem('skyline_members_roster');
      if (savedRoster) {
        const roster = JSON.parse(savedRoster);
        const updatedRoster = roster.map((m) => {
          if (m.id === user.id || m.email?.toLowerCase() === user.email?.toLowerCase() || m.studentId === user.student_id || m.studentId === user.studentId) {
            return {
              ...m,
              membershipStatus: 'Active',
              membershipType: normalizedPlan === 'SEMESTER' ? 'Semester' : 'Annual',
              joinDate: m.joinDate || todayStr,
              expiryDate: expiryStr,
              totalRenewals: (m.totalRenewals || 0) + 1,
              lastRenewalDate: todayStr,
            };
          }
          return m;
        });
        localStorage.setItem('skyline_members_roster', JSON.stringify(updatedRoster));
      }
    } catch (e) {
      console.warn('Failed to update member roster:', e);
    }

    return { success: true, membership: newMembership, user: updatedUser };
  };

  /**
   * Renew Membership
   */
  const renewMembership = async (plan = 'ANNUAL', paymentMethod = 'Student Account (Bursar)') => {
    return buyClubMembership(user?.memberships?.[0] || { id: 'club-robotics', name: 'Skyline Robotics & AI Society' }, plan, plan === 'ANNUAL' ? 499.00 : 299.00, paymentMethod);
  };

  /**
   * Update User Profile
   */
  const updateUserProfile = async (updatedFields) => {
    if (!user) return;
    const savedToken = token || localStorage.getItem('connectu_jwt_token');

    if (savedToken && !savedToken.startsWith('mock-')) {
      try {
        const response = await fetch(`${API_BASE}/auth/me/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedFields)
        });
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeUser(data);
          setUser(normalized);
          localStorage.setItem('connectu_active_user', JSON.stringify(normalized));
          return normalized;
        }
      } catch (err) {
        console.warn('Backend profile update failed:', err);
      }
    }

    const updated = normalizeUser({
      ...user,
      ...updatedFields
    });
    setUser(updated);
    localStorage.setItem('connectu_active_user', JSON.stringify(updated));
    return updated;
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
        renewMembership,
        updateUserProfile,
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

export default AuthContext;
