import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize users from localStorage or fallback to INITIAL_USERS
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('connectu_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current authenticated user state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('connectu_active_user');
      const token = localStorage.getItem('connectu_jwt_token');
      if (savedUser && token) {
        return JSON.parse(savedUser);
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

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('connectu_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to sync users to localStorage', e);
    }
  }, [users]);

  // Generate simulated JWT token
  const generateJWT = (userData) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        studentId: userData.studentId,
        exp: Math.floor(Date.now() / 1000) + 3600 * 8, // 8 hour token
        iat: Math.floor(Date.now() / 1000),
        iss: 'connectu.university.edu'
      })
    );
    const signature = btoa('CONNECTU_ACADEMIC_SIGNATURE_' + userData.role);
    return `${header}.${payload}.${signature}`;
  };

  /**
   * Universal Login Handler
   * Role-based validation & JWT generation
   */
  const login = async (email, password, rememberMe = true) => {
    // Artificial small delay for realistic SaaS feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail
    );

    if (!foundUser) {
      return {
        success: false,
        error: 'University account not found. Please verify your student email address or register below.'
      };
    }

    if (foundUser.password !== password) {
      return {
        success: false,
        error: 'Invalid password. Please ensure correct capitalization or use the password recovery tool.'
      };
    }

    const jwtToken = generateJWT(foundUser);
    setUser(foundUser);
    setToken(jwtToken);
    setSessionExpiredNotice(false);

    if (rememberMe) {
      localStorage.setItem('connectu_active_user', JSON.stringify(foundUser));
      localStorage.setItem('connectu_jwt_token', jwtToken);
    } else {
      sessionStorage.setItem('connectu_active_user', JSON.stringify(foundUser));
      sessionStorage.setItem('connectu_jwt_token', jwtToken);
    }

    return {
      success: true,
      user: foundUser,
      role: foundUser.role
    };
  };

  /**
   * Member Self-Registration
   * Allowed ONLY for Member role
   */
  const registerMember = async ({ name, studentId, email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const trimmedEmail = email.trim().toLowerCase();
    const cleanStudentId = studentId.trim().toUpperCase();

    // Check if email already registered
    const emailExists = users.some((u) => u.email.toLowerCase() === trimmedEmail);
    if (emailExists) {
      return {
        success: false,
        error: 'This email is already associated with an existing university account.'
      };
    }

    // Check if Student ID already exists
    const idExists = users.some((u) => u.studentId.toUpperCase() === cleanStudentId);
    if (idExists) {
      return {
        success: false,
        error: 'This Student ID is already linked to a registered profile.'
      };
    }

    const newMember = {
      id: `usr-member-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      studentId: cleanStudentId,
      email: trimmedEmail,
      password: password,
      role: 'MEMBER',
      department: 'General Undergraduate Studies',
      semester: 'Freshman (Year 1)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'ACTIVE',
      memberships: [
        { clubId: 'club-1', clubName: 'Robotics & AI Society', role: 'Registered Member', duesPaid: false }
      ],
      volunteerHours: 0,
      ticketsCount: 0
    };

    setUsers((prev) => [...prev, newMember]);
    return {
      success: true,
      user: newMember
    };
  };

  /**
   * Password Reset
   */
  const resetPassword = async (email, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const trimmedEmail = email.trim().toLowerCase();
    const index = users.findIndex((u) => u.email.toLowerCase() === trimmedEmail);

    if (index === -1) {
      return { success: false, error: 'No account associated with that email.' };
    }

    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], password: newPassword };
    setUsers(updatedUsers);

    return { success: true };
  };

  /**
   * Logout
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('connectu_active_user');
    localStorage.removeItem('connectu_jwt_token');
    sessionStorage.removeItem('connectu_active_user');
    sessionStorage.removeItem('connectu_jwt_token');
  };

  /**
   * Simulate Session Expiration
   */
  const triggerSessionExpired = () => {
    logout();
    setSessionExpiredNotice(true);
  };

  /**
   * Switch Active Role for easy hackathon testing
   */
  const quickSwitchRole = (targetRole) => {
    const demoUser = users.find((u) => u.role === targetRole);
    if (demoUser) {
      const jwtToken = generateJWT(demoUser);
      setUser(demoUser);
      setToken(jwtToken);
      localStorage.setItem('connectu_active_user', JSON.stringify(demoUser));
      localStorage.setItem('connectu_jwt_token', jwtToken);
      return demoUser;
    }
    return null;
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
        users
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
