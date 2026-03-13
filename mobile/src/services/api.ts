import axios from 'axios';

// Backend API URL - change this if your backend is on a different address
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: any) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getProfile: async (token: string) => {
    try {
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
};

// Traffic API
export const trafficAPI = {
  getTrafficData: async () => {
    try {
      const response = await api.get('/traffic');
      return response.data;
    } catch (error) {
      console.error('Get traffic error:', error);
      throw error;
    }
  },

  reportTraffic: async (data: any, token: string) => {
    try {
      const response = await api.post('/traffic', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Report traffic error:', error);
      throw error;
    }
  },
};

// Issue API
export const issueAPI = {
  getIssues: async () => {
    try {
      const response = await api.get('/issues');
      return response.data;
    } catch (error) {
      console.error('Get issues error:', error);
      throw error;
    }
  },

  reportIssue: async (data: any, token: string) => {
    try {
      const response = await api.post('/issues', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Report issue error:', error);
      throw error;
    }
  },
};

// Emergency API
export const emergencyAPI = {
  createAlert: async (data: any, token: string) => {
    try {
      const response = await api.post('/emergency', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Create emergency error:', error);
      throw error;
    }
  },

  getActiveEmergencies: async () => {
    try {
      const response = await api.get('/emergency');
      return response.data;
    } catch (error) {
      console.error('Get emergencies error:', error);
      throw error;
    }
  },
};

// Rewards API
export const rewardsAPI = {
  getCoupons: async () => {
    try {
      const response = await api.get('/rewards/coupons');
      return response.data;
    } catch (error) {
      console.error('Get coupons error:', error);
      throw error;
    }
  },

  redeemCoupon: async (couponId: string, token: string) => {
    try {
      const response = await api.post(
        '/rewards/redeem',
        { couponId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Redeem coupon error:', error);
      throw error;
    }
  },

  getMyCoupons: async (token: string) => {
    try {
      const response = await api.get('/rewards/my-coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Get my coupons error:', error);
      throw error;
    }
  },
};

export default api;
