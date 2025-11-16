// // services/adminAuth.js
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/admin';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const adminAuthService = {
//   registerAdmin: async (adminData) => {
//     const response = await api.post('/register', adminData);
//     return response.data;
//   },
// };

// export default adminAuthService;

// services/adminAuth.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors for better error handling
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Admin Auth Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Admin Auth Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const adminAuthService = {
  registerAdmin: async (adminData) => {
    try {
      const response = await api.post('/register-admin', adminData);
      return response.data;
    } catch (error) {
      console.error('🔥 Admin Registration API Error:', error);
      throw error;
    }
  },
};

export default adminAuthService;