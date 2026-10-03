import React, { useState, useEffect } from 'react';
import { AnnouncementsSubNav } from './AnnouncementsSubNav';
import { AllAnnouncementsView } from './AllAnnouncementsView';
import { CreateAnnouncementView } from './CreateAnnouncementView';
import { ScheduledAnnouncementsView } from './ScheduledAnnouncementsView';
import { announcementsApi } from '../../services/api';

/**
 * AnnouncementsManagementModule Component
 * Parent orchestrator for the Announcement Management module in ConnectU Portal.
 * Manages shared state, lifecycle workflows (Draft -> Scheduled -> Sent -> Cancelled),
 * and client-side sub-navigation.
 */
export const AnnouncementsManagementModule = ({
  announcements,
  setAnnouncements,
  initialSubTab = 'all'
}) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'all');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Sync with Backend
  const refreshAnnouncements = async () => {
    try {
      const data = await announcementsApi.getAll();
      const list = Array.isArray(data) ? data : data?.results || [];
      if (list.length > 0 && setAnnouncements) {
        setAnnouncements(list);
      }
    } catch (err) {
      console.warn('Announcements fetch warning:', err);
    }
  };

  useEffect(() => {
    refreshAnnouncements();
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Active scheduled count for sub-nav badge
  const scheduledCount = announcements.filter((a) => a.status === 'Scheduled').length;

  // Save/Update Handler
  const handleSaveAnnouncement = (announcementData) => {
    setAnnouncements((prev) => {
      const exists = prev.some((a) => a.id === announcementData.id);
      if (exists) {
        return prev.map((a) => (a.id === announcementData.id ? announcementData : a));
      }
      return [announcementData, ...prev];
    });

    setEditingAnnouncement(null);

    // Navigate to appropriate tab after creation
    if (announcementData.status === 'Scheduled') {
      setActiveSubTab('scheduled');
    } else {
      setActiveSubTab('all');
    }
  };

  // Edit action
  const handleEdit = (item) => {
    setEditingAnnouncement(item);
    setActiveSubTab('create');
  };

  // Duplicate action
  const handleDuplicate = (item) => {
    const duplicatedCopy = {
      ...item,
      id: `anc-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: 'Draft',
      sentDate: null,
      scheduledDate: null,
      scheduledTime: null,
      deliveryStats: null
    };
    setEditingAnnouncement(duplicatedCopy);
    setActiveSubTab('create');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub Navigation Bar */}
      <AnnouncementsSubNav
        activeSubTab={activeSubTab}
        setActiveSubTab={(tab) => {
          if (tab !== 'create') setEditingAnnouncement(null);
          setActiveSubTab(tab);
        }}
        scheduledCount={scheduledCount}
      />

      {/* View 1: All Announcements */}
      {activeSubTab === 'all' && (
        <AllAnnouncementsView
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          onNavigateToCreate={() => {
            setEditingAnnouncement(null);
            setActiveSubTab('create');
          }}
          onEditAnnouncement={handleEdit}
          onDuplicateAnnouncement={handleDuplicate}
        />
      )}

      {/* View 2: Create Announcement */}
      {activeSubTab === 'create' && (
        <CreateAnnouncementView
          initialData={editingAnnouncement}
          onSaveAnnouncement={handleSaveAnnouncement}
          onCancel={() => {
            setEditingAnnouncement(null);
            setActiveSubTab('all');
          }}
        />
      )}

      {/* View 3: Scheduled Announcements */}
      {activeSubTab === 'scheduled' && (
        <ScheduledAnnouncementsView
          announcements={announcements}
          setAnnouncements={setAnnouncements}
          onNavigateToCreate={() => {
            setEditingAnnouncement(null);
            setActiveSubTab('create');
          }}
          onEditAnnouncement={handleEdit}
        />
      )}
    </div>
  );
};

export default AnnouncementsManagementModule;
