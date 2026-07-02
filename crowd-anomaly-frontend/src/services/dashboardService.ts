import api from './api';
import { DashboardData } from '@/types';

const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get<DashboardData>('/api/dashboard');
    return data;
  },
};

export default dashboardService;
