import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token })
};

// Cards API calls
export const cardsAPI = {
  getAll: () => api.get('/cards'),
  getById: (id) => api.get(`/cards/${id}`),
  create: (cardData) => api.post('/cards', cardData),
  update: (id, cardData) => api.put(`/cards/${id}`, cardData),
  delete: (id) => api.delete(`/cards/${id}`),
  loadBalance: (id, data) => api.post(`/cards/${id}/load`, data)
};

// Transactions API calls
export const transactionsAPI = {
  getAll: (filters) => api.get('/transactions', { params: filters }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transactionData) => api.post('/transactions', transactionData),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: (dateRange) => api.get('/transactions/summary', { params: dateRange })
};

// Subscriptions API calls
export const subscriptionsAPI = {
  getAll: (status) => api.get('/subscriptions', { params: { status } }),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (subscriptionData) => api.post('/subscriptions', subscriptionData),
  update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
  cancel: (id) => api.post(`/subscriptions/${id}/cancel`),
  incrementUsage: (id) => api.post(`/subscriptions/${id}/usage`),
  getSummary: () => api.get('/subscriptions/summary')
};

// Analytics API calls
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSpendingTrends: (period) => api.get('/analytics/spending-trends', { params: { period } })
};

// Statements API calls
export const statementsAPI = {
  generate: (data) => api.post('/statements/generate', data, { responseType: 'blob' })
};

export const exchangeRateAPI = {
  getLatestRate: () => api.get('/exchange-rate')  
};

export default api;