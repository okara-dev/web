// lib/api.js
import axios from 'axios';
import { authStorage } from './auth';

// 🔥 In Expo: process.env.EXPO_PUBLIC_* wird zur Build-Zeit ersetzt
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Request-Interceptor: Token automatisch anhängen
api.interceptors.request.use(
  async (config) => {
    const token = await authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response-Interceptor: 401 → Logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig → Session löschen
      await authStorage.clearSession();
      // Event feuern, damit AuthContext reagieren kann
      // (AuthContext hört auf dieses Event)
    }
    return Promise.reject(error);
  }
);

// ========== API-METHODEN ==========

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

export const entriesApi = {
  getAll: () => api.get('/entries'),
  getByDate: (date) => api.get(`/entries/${date}`),
  save: (data) => api.post('/entries', data),
  delete: (id) => api.delete(`/entries/${id}`),
};

export const todosApi = {
  getAll: () => api.get('/todos'),
  create: (data) => api.post('/todos', data),
  toggle: (id) => api.put(`/todos/${id}/toggle`),
  delete: (id) => api.delete(`/todos/${id}`),
};

export const passionsApi = {
  getAll: () => api.get('/passions'),
  create: (data) => api.post('/passions', data),
  toggle: (id) => api.put(`/passions/${id}/toggle`),
  delete: (id) => api.delete(`/passions/${id}`),
};

export const lettersApi = {
  getAll: () => api.get('/letters'),
  create: (data) => api.post('/letters', data),
  open: (id) => api.put(`/letters/${id}/open`),
  delete: (id) => api.delete(`/letters/${id}`),
};

export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  insights: () => api.get('/ai/insights'),
};

export const statisticsApi = {
  get: () => api.get('/statistics'),
};