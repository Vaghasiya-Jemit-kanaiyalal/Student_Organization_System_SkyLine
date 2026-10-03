import React, { createContext, useContext, useState, useEffect } from 'react';

const TreasurerContext = createContext(null);

const STORAGE_KEY = 'skyline_appointed_treasurer_v1';

const DEFAULT_TREASURER = {
  name: 'Marcus Sterling',
  studentId: 'STU-2026-4419',
  email: 'm.sterling@university.edu',
  department: 'School of Engineering & Applied Sciences',
  startDate: '2026-08-20',
  status: 'Active',
  appointedBy: 'Dr. Alexander Vance (Club President)'
};

export const TreasurerProvider = ({ children }) => {
  const [currentTreasurer, setCurrentTreasurer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to load treasurer from localStorage', err);
    }
    return DEFAULT_TREASURER;
  });

  const [appointmentHistory, setAppointmentHistory] = useState([
    {
      id: 'app-1',
      name: 'Marcus Sterling',
      studentId: 'STU-2026-4419',
      email: 'm.sterling@university.edu',
      startDate: '2026-08-20',
      appointedDate: '2026-08-20',
      status: 'Active'
    }
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTreasurer));
    } catch (err) {
      console.error('Failed to save treasurer to localStorage', err);
    }
  }, [currentTreasurer]);

  const assignNewTreasurer = ({ name, email, password, studentId, startDate, department }) => {
    const updated = {
      name: name.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
      password: password || 'password123',
      department: department || 'School of Engineering & Applied Sciences',
      startDate: startDate || new Date().toISOString().split('T')[0],
      status: 'Active',
      appointedBy: 'Dr. Alexander Vance (Club President)',
      updatedAt: new Date().toISOString()
    };

    setCurrentTreasurer(updated);
    setAppointmentHistory((prev) => [
      {
        id: `app-${Date.now()}`,
        name: updated.name,
        studentId: updated.studentId,
        email: updated.email,
        startDate: updated.startDate,
        appointedDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      },
      ...prev.map((item) => ({ ...item, status: 'Preceding Term' }))
    ]);

    return updated;
  };

  return (
    <TreasurerContext.Provider
      value={{
        currentTreasurer,
        appointmentHistory,
        assignNewTreasurer
      }}
    >
      {children}
    </TreasurerContext.Provider>
  );
};

export const useTreasurer = () => {
  const context = useContext(TreasurerContext);
  if (!context) {
    throw new Error('useTreasurer must be used within a TreasurerProvider');
  }
  return context;
};
