import axios from 'axios';

const API_URL = "http://localhost:8000/api";

// ✅ Axios instance with token for authenticated requests
const authAxios = axios.create({
  baseURL: API_URL,
});

// 🔐 Attach token from localStorage automatically
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ❌ Public APIs (No token required)
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const register = (data) => axios.post(`${API_URL}/register`, data);

// ✅ Protected APIs (Token required)
export const getTasks = () => authAxios.get('/tasks');
export const getTaskById = (id) => authAxios.get(`/tasks/${id}`);
export const createTasks = (data) => authAxios.post('/tasks', data);
export const updateTasks = (id, data) => authAxios.post(`/tasks/${id}`, data);
export const deleteTasks = (id) => authAxios.delete(`/tasks/${id}`);
