import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationState } from '../../types/notification';

const initialState: NotificationState = {
  items: [],
  readNotificationIds: [],
  loading: false,
  error: null,
  filter: 'all',
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationsStart(state) {
      state.loading = true;
      state.error = null;
    },
    setNotificationsSuccess(state, action: PayloadAction<Notification[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.readNotificationIds.includes(id)) {
        state.readNotificationIds.push(id);
      }
    },
    markAllAsRead(state, action: PayloadAction<string[]>) {
      action.payload.forEach(id => {
        if (!state.readNotificationIds.includes(id)) {
          state.readNotificationIds.push(id);
        }
      });
    },
    setFilter(state, action: PayloadAction<'all' | 'class' | 'personal'>) {
      state.filter = action.payload;
    },
    clearNotificationsState(state) {
      state.items = [];
      state.readNotificationIds = [];
      state.filter = 'all';
    }
  },
});

export const {
  setNotificationsStart,
  setNotificationsSuccess,
  setNotificationsFailure,
  markAsRead,
  markAllAsRead,
  setFilter,
  clearNotificationsState,
} = notificationSlice.actions;

export default notificationSlice.reducer;
