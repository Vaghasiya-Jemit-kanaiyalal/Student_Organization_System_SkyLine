import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_FUNDRAISERS } from '../data/fundraisersData';

const FundraiserContext = createContext(null);

const STORAGE_KEY = 'skyline_fundraisers_data_v1';

export const FundraiserProvider = ({ children }) => {
  const [fundraisers, setFundraisers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to load fundraisers from localStorage, using defaults', err);
    }
    return INITIAL_FUNDRAISERS;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fundraisers));
    } catch (err) {
      console.error('Failed to save fundraisers to localStorage', err);
    }
  }, [fundraisers]);

  // Create a new fundraiser
  const createFundraiser = (data) => {
    const newFundraiser = {
      id: `fnd-${Date.now()}`,
      title: data.title?.trim() || 'Untitled Fundraiser',
      description: data.description?.trim() || '',
      category: data.category || 'General Campaign',
      goal: Number(data.goal) || 1000,
      raised: Number(data.initialRaised) || 0,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      status: data.status || 'Active', // 'Planning' | 'Active' | 'Completed' | 'Cancelled'
      onTrack: true,
      contributions: Number(data.initialRaised) > 0 ? [
        {
          id: `c-init-${Date.now()}`,
          donor: 'Initial Seed Funding',
          amount: Number(data.initialRaised),
          date: new Date().toISOString().split('T')[0],
          method: 'Seed Allocation',
          receipt: `REC-INIT-${Math.floor(100 + Math.random() * 900)}`
        }
      ] : [],
      tasks: data.initialTasks || []
    };

    setFundraisers((prev) => [newFundraiser, ...prev]);
    return newFundraiser;
  };

  // Update an existing fundraiser
  const updateFundraiser = (id, updatedFields) => {
    setFundraisers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updatedFields } : f))
    );
  };

  // Delete a fundraiser
  const deleteFundraiser = (id) => {
    setFundraisers((prev) => prev.filter((f) => f.id !== id));
  };

  // Add a task to a fundraiser
  const addTask = (fundraiserId, taskData) => {
    const newTask = {
      id: `t-${Date.now()}`,
      title: taskData.title?.trim() || 'Untitled Task',
      volunteer: taskData.volunteer?.trim() || 'Unassigned',
      volunteerEmail: taskData.volunteerEmail || '',
      studentId: taskData.studentId || '',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      status: taskData.status || 'Pending' // 'Pending' | 'In Progress' | 'Completed'
    };

    setFundraisers((prev) =>
      prev.map((f) => {
        if (f.id === fundraiserId) {
          return {
            ...f,
            tasks: [...(f.tasks || []), newTask]
          };
        }
        return f;
      })
    );
    return newTask;
  };

  // Update a task within a fundraiser
  const updateTask = (fundraiserId, taskId, updatedFields) => {
    setFundraisers((prev) =>
      prev.map((f) => {
        if (f.id === fundraiserId) {
          return {
            ...f,
            tasks: (f.tasks || []).map((t) =>
              t.id === taskId ? { ...t, ...updatedFields } : t
            )
          };
        }
        return f;
      })
    );
  };

  // Quick-update task status
  const updateTaskStatus = (fundraiserId, taskId, newStatus) => {
    updateTask(fundraiserId, taskId, { status: newStatus });
  };

  // Delete a task
  const deleteTask = (fundraiserId, taskId) => {
    setFundraisers((prev) =>
      prev.map((f) => {
        if (f.id === fundraiserId) {
          return {
            ...f,
            tasks: (f.tasks || []).filter((t) => t.id !== taskId)
          };
        }
        return f;
      })
    );
  };

  // Record a financial contribution / donation
  const recordContribution = (fundraiserId, contributionData) => {
    const amount = Number(contributionData.amount) || 0;
    const newContribution = {
      id: `c-${Date.now()}`,
      donor: contributionData.donor?.trim() || 'Anonymous Supporter',
      amount,
      date: contributionData.date || new Date().toISOString().split('T')[0],
      method: contributionData.method || 'Direct Bank Transfer',
      receipt: `REC-${Date.now().toString().slice(-6)}`,
      note: contributionData.note || ''
    };

    setFundraisers((prev) =>
      prev.map((f) => {
        if (f.id === fundraiserId) {
          const newRaised = (Number(f.raised) || 0) + amount;
          const isCompleted = newRaised >= (Number(f.goal) || 0) && f.status === 'Active';
          return {
            ...f,
            raised: newRaised,
            status: isCompleted ? 'Completed' : f.status,
            contributions: [newContribution, ...(f.contributions || [])]
          };
        }
        return f;
      })
    );
    return newContribution;
  };

  // Reset to sample initial data
  const resetToDefault = () => {
    setFundraisers(INITIAL_FUNDRAISERS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Summary Metrics calculations
  const activeFundraisersCount = fundraisers.filter((f) => f.status === 'Active').length;
  const totalRaised = fundraisers.reduce((acc, f) => acc + (Number(f.raised) || 0), 0);
  const totalGoal = fundraisers.reduce((acc, f) => acc + (Number(f.goal) || 0), 0);
  
  // Total pending/in-progress tasks across all fundraisers
  const totalPendingTasks = fundraisers.reduce((acc, f) => {
    const pendingInFundraiser = (f.tasks || []).filter(
      (t) => t.status === 'Pending' || t.status === 'In Progress'
    ).length;
    return acc + pendingInFundraiser;
  }, 0);

  const value = {
    fundraisers,
    createFundraiser,
    updateFundraiser,
    deleteFundraiser,
    addTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    recordContribution,
    resetToDefault,
    metrics: {
      activeFundraisersCount,
      totalRaised,
      totalGoal,
      totalPendingTasks
    }
  };

  return (
    <FundraiserContext.Provider value={value}>
      {children}
    </FundraiserContext.Provider>
  );
};

export const useFundraiser = () => {
  const context = useContext(FundraiserContext);
  if (!context) {
    throw new Error('useFundraiser must be used within a FundraiserProvider');
  }
  return context;
};
