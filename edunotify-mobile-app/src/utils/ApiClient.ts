import axios from 'axios';
import { BASE_URL } from './Routes';
import { getItem } from './MMKVStorage';
import { TOKEN_STORAGE_KEY } from './MMKVStorage';

let store: any = null;

export const injectStore = (_store: any) => {
  store = _store;
};

const getStoredToken = (): string | null => {
  return getItem(TOKEN_STORAGE_KEY);
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Always use the latest token from storage
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors and format them
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.message = 'Connection timed out. Please try again.';
      } else {
        error.message = 'Network error. Please check your internet connection.';
      }
    } else {
      const isHtml = typeof data === 'string' && 
        (data.trim().startsWith('<') || data.toLowerCase().includes('<html>') || data.toLowerCase().includes('<!doctype'));
      
      const serverMessage = data?.message || data?.error || (typeof data === 'string' && !isHtml ? data : null);

      if (serverMessage && typeof serverMessage === 'string') {
        error.message = serverMessage;
      } else if (status >= 500) {
        error.message = 'Internal server error. Please try again later.';
      } else if (status === 404) {
        error.message = 'Requested resource not found.';
      } else if (status === 403) {
        error.message = 'Forbidden. You do not have permission.';
      } else if (status === 401) {
        error.message = 'Unauthorized. Please log in again.';
      } else {
        error.message = 'An unexpected error occurred.';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
