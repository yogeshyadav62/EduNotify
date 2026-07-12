import axios from 'axios';
import { User } from '../types/auth';
import { Notification } from '../types/notification';
import mockNotifications from '../data/notifications.json';
import { API_BASE_URL } from '../utils/constants';

// Create Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set authorization token for future requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async login(studentId: string, classId: string): Promise<{ user: User; token: string }> {
    const id = studentId.toUpperCase().trim();
    const cls = classId.toUpperCase().trim();

    try {
      // Axios POST Request with async/await
      const response = await axiosInstance.post('/auth/login', { studentId: id, classId: cls });
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        return response.data;
      }
      throw new Error('Invalid response structure from server');
    } catch (error: any) {
      console.warn('Backend API Login failed, falling back to mock data:', error.message);
      
      // Fallback to Mock response to ensure app doesn't break
      await delay(1200);

      // Mock accounts based on requirements
      if (id === 'STU-101' && cls === 'CS-202') {
        const mockResult = {
          user: {
            studentId: 'STU-101',
            classId: 'CS-202',
            name: 'Aarav Sharma',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120',
          },
          token: 'token-stu-101-cs-202',
        };
        setAuthToken(mockResult.token);
        return mockResult;
      } else if (id === 'STU-102' && cls === 'CS-202') {
        const mockResult = {
          user: {
            studentId: 'STU-102',
            classId: 'CS-202',
            name: 'Neha Patel',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120',
          },
          token: 'token-stu-102-cs-202',
        };
        setAuthToken(mockResult.token);
        return mockResult;
      } else if (id === 'STU-301' && cls === 'CS-101') {
        const mockResult = {
          user: {
            studentId: 'STU-301',
            classId: 'CS-101',
            name: 'Rohan Das',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120',
          },
          token: 'token-stu-301-cs-101',
        };
        setAuthToken(mockResult.token);
        return mockResult;
      } else {
        const mockResult = {
          user: {
            studentId: id,
            classId: cls,
            name: `Student (${id})`,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120',
          },
          token: `token-dynamic-${id}-${cls}`,
        };
        setAuthToken(mockResult.token);
        return mockResult;
      }
    }
  },

  async fetchNotifications(): Promise<Notification[]> {
    try {
      // Axios GET Request with async/await
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.warn('Backend API fetchNotifications failed, falling back to mock data:', error.message);
      
      // Fallback to local mock notifications
      await delay(1000);
      return mockNotifications as Notification[];
    }
  }
};
