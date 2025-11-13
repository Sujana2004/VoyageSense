import axios from 'axios';

const API_BASE_URL = 'http://localhost:8089/api';

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

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerAdmin: (userData) => api.post('/auth/register-admin', userData),
};

// Trip APIs
export const tripAPI = {
  create: (tripData) => api.post('/trips', tripData),
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (message, conversationId) => 
    api.post('/chat', { message, conversationId }),
  getHistory: (conversationId) => 
    api.get('/chat/history', { params: { conversationId } }),
};

// Places APIs
export const placesAPI = {
  getAll: () => api.get('/places'),
  getByCity: (city) => api.get(`/places/city/${city}`),
  getByCategory: (city, category) => 
    api.get(`/places/city/${city}/category/${category}`),
  getTopRated: (city) => api.get(`/places/city/${city}/top-rated`),
  getAIRecommendations: (params) => 
    api.get('/places/ai-recommendations', { params }),
};

// Admin APIs
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  getAllTrips: () => api.get('/admin/trips'),
  getAllChats: () => api.get('/admin/chats'),
  getUserTrips: (userId) => api.get(`/admin/users/${userId}/trips`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  deleteChat: (chatId) => api.delete(`/admin/chats/${chatId}`),
  deleteConversation: (conversationId) => api.delete(`/admin/conversations/${conversationId}`),
  getConversationDetails: (conversationId) => api.get(`/admin/conversations/${conversationId}/details`),
  deleteTrip: (tripId) => api.delete(`/admin/trips/${tripId}`),
};

export default api;