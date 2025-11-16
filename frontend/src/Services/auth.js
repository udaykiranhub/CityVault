// services/auth.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  verifyOtp: async (otpData) => {
    const response = await api.post('/verify-otp', otpData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // Verify token with backend
  verifyToken: async () => {
    const response = await api.get('/me');
    return response.data;
  }
};

export default authService;