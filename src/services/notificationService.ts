import { api } from './api';
import { store } from '../redux/store';
import {
  setNotificationsStart,
  setNotificationsSuccess,
  setNotificationsFailure,
  markAsRead,
  markAllAsRead,
} from '../redux/slices/notificationSlice';

export const notificationService = {
  async loadNotifications(): Promise<void> {
    store.dispatch(setNotificationsStart());
    try {
      const data = await api.fetchNotifications();
      store.dispatch(setNotificationsSuccess(data));
    } catch (error: any) {
      store.dispatch(setNotificationsFailure(error.message || 'Failed to fetch notifications'));
    }
  },

  markNotificationRead(id: string): void {
    store.dispatch(markAsRead(id));
  },

  markAllRead(ids: string[]): void {
    store.dispatch(markAllAsRead(ids));
  }
};
