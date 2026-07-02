import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    // No backend endpoint needed; just clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/refresh', { refreshToken });
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data;
  },

  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};

export default authService;
