import axios from 'axios';

// Use env variable for backend URL and handle trailing slashes
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_URL); // DEBUG LOG

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', config.url); // DEBUG LOG
    } else {
      console.log('⚠️ No token found for request:', config.url); // DEBUG LOG
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status); // DEBUG LOG
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error (No Response):', {
        url: error.config?.url,
        request: error.request
      });
    } else {
      // Something else happened
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;