import api from './api';
import { User, PageableResponse, QueryParams } from '@/types';

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'OPERATOR';
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'OPERATOR';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

const userService = {
  getUsers: async (params?: QueryParams): Promise<PageableResponse<User>> => {
    const { data } = await api.get<PageableResponse<User>>('/api/users', { params });
    return data;
  },

  getUserById: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`/api/users/${id}`);
    return data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await api.post<User>('/api/users', payload);
    return data;
  },

  updateUser: async (id: number, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.put<User>(`/api/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/api/users/change-password', { currentPassword, newPassword });
  },
};

export default userService;
