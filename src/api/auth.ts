import axios from 'axios';
import type { RegisterRequest } from '@/types/auth';
import type { AuthResponse } from '@/types/auth';

// 使用Vite代理配置，所以使用相对路径
const API_BASE_URL = 'http://localhost:8080/api';

export const authApi = {
  // (7�
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    return response.data;
  },

  // (7{U
  login: async (loginData: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    return response.data;
  },

  // �n��token
  setAuthToken: (token: string) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // �d��token
  removeAuthToken: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  },

  // �֤�token
  getAuthToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // ��/&�{U
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // {�
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    delete axios.defaults.headers.common['Authorization'];
  }
};