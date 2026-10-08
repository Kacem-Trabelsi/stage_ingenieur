import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mern_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('mern_token');
        localStorage.removeItem('mern_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  getPendingUsers: () => api.get('/auth/pending-users'),
  getAllUsers: () => api.get('/auth/all-users'),
  approveUser: (id) => api.put(`/auth/users/${id}/approve`),
  rejectUser: (id, reason) => api.put(`/auth/users/${id}/reject`, { reason }),
};

// Contracts Endpoints (Juridique & Hébergement)
export const contractAPI = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  getUncontractedResidents: () => api.get('/contracts/uncontracted-residents'),
  create: (data) => api.post('/contracts', data),
  requestAmendment: (id, data) => api.post(`/contracts/${id}/amendments`, data),
  handleAmendment: (id, amendmentId, action) => api.put(`/contracts/${id}/amendments/${amendmentId}`, { action }),
};

// Invoices & Financial Endpoints
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getStats: () => api.get('/invoices/stats'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  generateFromContract: (contractId) => api.post(`/invoices/generate-from-contract/${contractId}`),
  updatePayment: (id, data) => api.put(`/invoices/${id}/payment`, data),
  sendReminder: (id, type) => api.post(`/invoices/${id}/remind`, { type }),
};

// Emails & Messaging Endpoints (Échange Admin <-> Résidents)
export const emailAPI = {
  getAll: (params) => api.get('/emails', { params }),
  getCounts: () => api.get('/emails/counts'),
  getById: (id) => api.get(`/emails/${id}`),
  send: (data) => api.post('/emails', data),
  toggleStar: (id) => api.put(`/emails/${id}/star`),
  markAsRead: (id, isRead = true) => api.put(`/emails/${id}/read`, { isRead }),
  delete: (id, permanent = false) => api.delete(`/emails/${id}`, { params: { permanent } }),
  restore: (id) => api.put(`/emails/${id}/restore`),
  getRecipients: () => api.get('/emails/recipients'),
};

// Notifications Endpoints (Alertes Réglementaires & Système)
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  toggleRead: (id, isRead) => api.put(`/notifications/${id}/read`, { isRead }),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: (readOnly = false) => api.delete('/notifications/clear-all', { params: { readOnly } }),
  create: (data) => api.post('/notifications', data),
};

// Chat & Instant Messaging Endpoints (Direction, Services S2T & Assistant IA)
export const chatAPI = {
  getChannels: () => api.get('/chat/channels'),
  getResidents: () => api.get('/chat/residents'),
  getMessages: (channelId, params) => api.get(`/chat/messages/${channelId}`, { params }),
  sendMessage: (data) => api.post('/chat/messages', data),
  markAsRead: (channelId) => api.put(`/chat/read/${channelId}`),
  clearHistory: (channelId) => api.delete(`/chat/clear/${channelId}`),
};

// Reunions & Meeting Room Booking Endpoints (Salles de Conférence S2T)
export const reunionAPI = {
  getAll: (params) => api.get('/reunions', { params }),
  getById: (id) => api.get(`/reunions/${id}`),
  getStats: () => api.get('/reunions/stats'),
  getRooms: (params) => api.get('/reunions/rooms', { params }),
  getBookedSlots: (params) => api.get('/reunions/booked-slots', { params }),
  create: (data) => api.post('/reunions', data),
  update: (id, data) => api.put(`/reunions/${id}`, data),
  updateStatus: (id, status, cancellationReason) => api.patch(`/reunions/${id}/status`, { status, cancellationReason }),
  delete: (id) => api.delete(`/reunions/${id}`),
  sendMinutes: (id, data) => api.post(id ? `/reunions/${id}/send-minutes` : '/reunions/send-minutes', data),
};

// Health Check
export const healthCheckAPI = () => api.get('/health');

export default api;



