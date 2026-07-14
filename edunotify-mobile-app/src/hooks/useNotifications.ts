import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
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
import { Notification } from '../types/notification';

const PAGE_SIZE = 10;

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { items: reduxNotifications, readNotificationIds, loading, error, filter } = useAppSelector(state => state.notifications);

  // ── Infinite / paginated query ──────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['notifications-paged'],
    queryFn: ({ pageParam = 1 }) => api.fetchNotificationsPaged(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined;
    },
    enabled: !!user,
  });

  // Flatten all pages into one flat list and sync to Redux
  const pagedNotifications: Notification[] = useMemo(
    () => data?.pages.flatMap(p => p?.notifications ?? []) ?? [],
    [data]
  );

  const totalCount = data?.pages[data.pages.length - 1]?.totalCount ?? 0;
  const totalPages = data?.pages[data.pages.length - 1]?.totalPages ?? 1;
  const currentPage = data?.pages[data.pages.length - 1]?.currentPage ?? 1;

  // ── Sync to Redux ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) {
      dispatch(setNotificationsStart());
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (data) {
      dispatch(setNotificationsSuccess(pagedNotifications));
    }
  }, [pagedNotifications, data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(setNotificationsFailure('Failed to fetch notifications'));
    }
  }, [isError, dispatch]);

  // ── Notifications visible to this student ────────────────────────────────────
  // The backend already filters by classId/studentId, but we do a client-side
  // defensive check to ensure no cross-student data leaks in.
  const studentNotifications = useMemo(
    () =>
      reduxNotifications.filter(item => {
        if (!user || !user.classId || !user.studentId || !item || !item.classId) return false;
        const isSameClass = item.classId.toUpperCase() === user.classId.toUpperCase();
        const isClassWide = item.studentId === null;
        const isPersonalToMe =
          item.studentId !== null &&
          item.studentId.toUpperCase() === user.studentId.toUpperCase();
        return isSameClass && (isClassWide || isPersonalToMe);
      }),
    [reduxNotifications, user]
  );

  // ── Category filter (All / Class Broadcasts / Personal) ─────────────────────
  const viewNotifications = useMemo(
    () =>
      studentNotifications.filter(item => {
        if (filter === 'class') return item.studentId === null;
        if (filter === 'personal') return item.studentId !== null;
        return true; // 'all'
      }),
    [studentNotifications, filter]
  );

  // ── Unread count ─────────────────────────────────────────────────────────────
  const unreadCount = useMemo(
    () => studentNotifications.filter(item => !readNotificationIds.includes(item.id)).length,
    [studentNotifications, readNotificationIds]
  );

  // ── Auto-mark as delivered on load ──────────────────────────────────────────
  useEffect(() => {
    if (studentNotifications.length > 0) {
      studentNotifications.forEach(async (notice) => {
        if (!notice.isDelivered) {
          try {
            await api.markNotificationDelivered(notice.id);
          } catch (err) {
            console.warn(`Failed to auto-mark notice ${notice.id} as delivered:`, err);
          }
        }
      });
    }
  }, [studentNotifications]);

  // ── Mark as read (seen) ──────────────────────────────────────────────────────
  const handleMarkAsRead = async (id: string) => {
    dispatch(markAsRead(id));
    try {
      await api.markNotificationSeen(id);
    } catch (err) {
      console.warn(`Failed to mark notice ${id} as seen:`, err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = studentNotifications
      .filter(item => !readNotificationIds.includes(item.id))
      .map(item => item.id);
    dispatch(markAllAsRead(unreadIds));
    unreadIds.forEach(async (id) => {
      try {
        await api.markNotificationSeen(id);
      } catch (err) {
        console.warn(`Failed to mark notice ${id} as seen in bulk:`, err);
      }
    });
  };

  const handleSetFilter = (newFilter: 'all' | 'class' | 'personal') => {
    dispatch(setFilter(newFilter));
  };

  return {
    notifications: viewNotifications,           // Filtered list for current view
    allAllowedNotifications: studentNotifications, // All notifications visible to the student
    unreadCount,
    readNotificationIds,
    isLoading: loading || isLoading,
    isFetchingNextPage,
    isRefetching,
    error,
    filter,
    setFilter: handleSetFilter,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: refetch,
    loadMore: fetchNextPage,                    // Call this when user reaches end of list
    hasMore: hasNextPage ?? false,
    totalCount,
    totalPages,
    currentPage,
  };
};
