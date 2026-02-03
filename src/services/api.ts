import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if session was replaced (logged in from another device)
      if (error.response?.data?.code === 'SESSION_REPLACED') {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('auth-storage');
        
        // Show alert to user
        alert('آپ کو کسی اور ڈیوائس سے لاگ آؤٹ کر دیا گیا ہے۔ براہ کرم دوبارہ لاگ ان کریں۔\n\nYou have been logged out because your account was accessed from another device. Please login again.');
        
        // Redirect to appropriate login page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/lms') || currentPath.includes('/student')) {
          window.location.href = '/lms/login';
        } else {
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
