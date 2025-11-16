// services/adminUserService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin/users';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminUserService = {
  getAllUsers: async () => {
    const response = await api.get('/');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/', userData);
    return response.data;
  },

toggleUserStatus: async (userId) => {
  const response = await api.patch(`/${userId}/toggle-status`);
  return response.data;
},

  getUserStatistics: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

export default adminUserService;