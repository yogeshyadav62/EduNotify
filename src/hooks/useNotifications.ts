import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { api } from '../services/api';
import {
  setNotificationsStart,
  setNotificationsSuccess,
  setNotificationsFailure,
  markAsRead,
  markAllAsRead,
  setFilter,
} from '../redux/slices/notificationSlice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { items: notifications, readNotificationIds, loading, error, filter } = useAppSelector(state => state.notifications);

  // Fetch all notifications using React Query
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: api.fetchNotifications,
    enabled: !!user && notifications.length === 0, // only fetch if user is logged in and store is empty
  });

  useEffect(() => {
    if (isLoading) {
      dispatch(setNotificationsStart());
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (data) {
      dispatch(setNotificationsSuccess(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(setNotificationsFailure('Failed to fetch notifications'));
    }
  }, [isError, dispatch]);

  // SECURE TARGET FILTERING (MANDATORY REQUIREMENT)
  // 1. Filter out notifications that don't belong to the student's class
  // 2. Filter out personal notifications belonging to other students
  const studentNotifications = notifications.filter(item => {
    if (!user || !user.classId || !user.studentId || !item || !item.classId) return false;
    
    const isSameClass = item.classId.toUpperCase() === user.classId.toUpperCase();
    const isClassWide = item.studentId === null;
    const isPersonalToMe = item.studentId !== null && item.studentId.toUpperCase() === user.studentId.toUpperCase();
    
    return isSameClass && (isClassWide || isPersonalToMe);
  });

  // Category Filtering for View (All / Class Broadcasts / Personal Notices)
  const viewNotifications = studentNotifications.filter(item => {
    if (filter === 'class') {
      return item.studentId === null;
    }
    if (filter === 'personal') {
      return item.studentId !== null;
    }
    return true; // 'all'
  });

  // Calculate unread count based strictly on student's allowed notifications
  const unreadCount = studentNotifications.filter(item => !readNotificationIds.includes(item.id)).length;

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = studentNotifications
      .filter(item => !readNotificationIds.includes(item.id))
      .map(item => item.id);
    dispatch(markAllAsRead(unreadIds));
  };

  const handleSetFilter = (newFilter: 'all' | 'class' | 'personal') => {
    dispatch(setFilter(newFilter));
  };

  return {
    notifications: viewNotifications,       // Filtered for active list view
    allAllowedNotifications: studentNotifications, // All notifications visible to the student
    unreadCount,
    readNotificationIds,
    isLoading: loading || isLoading,
    isRefetching,
    error,
    filter,
    setFilter: handleSetFilter,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: refetch,
  };
};
