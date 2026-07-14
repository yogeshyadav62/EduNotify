import { postData, getData, putData } from '../utils/APiCall';
import apiClient from '../utils/ApiClient';
import { ROUTES } from '../utils/Routes';
import { User } from '../types/auth';
import { Notification } from '../types/notification';

export const setAuthToken = (token: string | null) => {
  // Handled automatically by ApiClient.ts requests interceptor
};

export const api = {
  async login(studentId: string, classId: string): Promise<{ user: User; token: string }> {
    const id = studentId.toUpperCase().trim();
    const cls = classId.toUpperCase().trim();

    try {
      const response = await postData<{ user: User; token: string }>(ROUTES.LOGIN, {
        studentId: id,
        classId: cls,
      });

      if (response && response.token) {
        return response;
      }
      throw new Error('Invalid response structure from server');
    } catch (error: any) {
      console.warn('API login failed:', error.message || error);
      throw error;
    }
  },

  async fetchNotifications(): Promise<Notification[]> {
    try {
      const response = await getData<Notification[]>(ROUTES.NOTIFICATIONS);
      if (response) return response;
      return [];
    } catch (error: any) {
      console.warn('API fetchNotifications failed:', error.message || error);
      throw error;
    }
  },

  async fetchNotificationsPaged(page: number, limit = 10): Promise<{
    notifications: Notification[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
  }> {
    try {
      const response = await getData<{
        notifications: Notification[];
        currentPage: number;
        totalPages: number;
        totalCount: number;
      }>(ROUTES.NOTIFICATIONS, { page, limit });
      if (!response) throw new Error('Empty response from server');
      return response;
    } catch (error: any) {
      console.warn('API fetchNotificationsPaged failed:', error.message || error);
      throw error;
    }
  },

  async updateFCMToken(fcmToken: string): Promise<any> {
    try {
      const response = await putData<any>(ROUTES.UPDATE_FCM_TOKEN, { fcmToken });
      return response;
    } catch (error: any) {
      console.warn('API updateFCMToken failed:', error.message || error);
      throw error;
    }
  },

  async markNotificationDelivered(id: string): Promise<any> {
    try {
      const response = await putData<any>(ROUTES.MARK_DELIVERED(id));
      return response;
    } catch (error: any) {
      console.warn(`API markNotificationDelivered failed for ${id}:`, error.message || error);
      throw error;
    }
  },

  async markNotificationSeen(id: string): Promise<any> {
    try {
      const response = await putData<any>(ROUTES.MARK_SEEN(id));
      return response;
    } catch (error: any) {
      console.warn(`API markNotificationSeen failed for ${id}:`, error.message || error);
      throw error;
    }
  },

  async fetchProfile(): Promise<User> {
    try {
      const response = await getData<User>(ROUTES.PROFILE);
      if (!response) throw new Error('Empty response from server');
      return response;
    } catch (error: any) {
      console.warn('API fetchProfile failed:', error.message || error);
      throw error;
    }
  },

  async updateProfile(name: string, email: string, mobile: string): Promise<User> {
    try {
      const response = await putData<User>(ROUTES.PROFILE, { name, email, mobile });
      if (!response) throw new Error('Empty response from server');
      return response;
    } catch (error: any) {
      console.warn('API updateProfile failed:', error.message || error);
      throw error;
    }
  },

  async updateAvatar(uri: string): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const { data } = await apiClient.put<{ avatarUrl: string }>(ROUTES.AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!data) throw new Error('Empty response from server');
      return data;
    } catch (error: any) {
      console.warn('API updateAvatar failed:', error.message || error);
      throw error;
    }
  }
};
