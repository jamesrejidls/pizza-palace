import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pizzaToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pizzaToken');
      localStorage.removeItem('pizzaUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  resendVerification: (email) => API.post('/auth/resend-verification', { email })
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => API.get('/inventory', { params }),
  getById: (id) => API.get(`/inventory/${id}`),
  create: (data) => API.post('/inventory', data),
  update: (id, data) => API.put(`/inventory/${id}`, data),
  delete: (id) => API.delete(`/inventory/${id}`),
  restock: (id, quantity) => API.post(`/inventory/${id}/restock`, { quantity }),
  getSummary: () => API.get('/inventory/summary')
};

// Orders
export const ordersAPI = {
  createRazorpayOrder: (amount) => API.post('/orders/create-razorpay-order', { amount }),
  placeOrder: (data) => API.post('/orders/place', data),
  simulateSuccess: (data) => API.post('/orders/simulate-success', data),
  getMyOrders: () => API.get('/orders/my-orders'),
  getOrder: (id) => API.get(`/orders/${id}`),
  getAllOrders: (params) => API.get('/orders/all', { params }),
  updateStatus: (id, status, note) => API.put(`/orders/${id}/status`, { status, note })
};

export default API;
