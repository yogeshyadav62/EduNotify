// Change this to your computer's local IP (e.g., http://192.168.1.15:4500) if testing on a physical device / emulator
export const BASE_URL = 'https://edunotify-r1pc.onrender.com';
// export const BASE_URL = 'http://10.219.33.132:4500';

export const ROUTES = Object.freeze({
  LOGIN: '/api/student/auth/login',
  NOTIFICATIONS: '/api/student/notifications',
  UPDATE_FCM_TOKEN: '/api/student/fcm-token',
  MARK_DELIVERED: (id: string) => `/api/student/notifications/${id}/delivered`,
  MARK_SEEN: (id: string) => `/api/student/notifications/${id}/seen`,
  PROFILE: '/api/student/profile',
  AVATAR: '/api/student/profile/avatar',
});
