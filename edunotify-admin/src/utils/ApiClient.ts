import axios from 'axios';

const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject Admin Token from localStorage if exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Normalize API errors
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
        error.message = 'Forbidden. Access denied.';
      } else if (status === 401) {
        error.message = 'Unauthorized session. Please log in again.';
      } else {
        error.message = 'An unexpected error occurred.';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
