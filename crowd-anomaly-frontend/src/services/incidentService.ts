import api from './api';
import { Incident, IncidentFilters, PageableResponse } from '@/types';

const incidentService = {
  getIncidents: async (params?: IncidentFilters): Promise<PageableResponse<Incident>> => {
    const { data } = await api.get<PageableResponse<Incident>>('/api/incidents', { params });
    return data;
  },

  getIncidentById: async (id: number): Promise<Incident> => {
    const { data } = await api.get<Incident>(`/api/incidents/${id}`);
    return data;
  },

  deleteIncident: async (id: number): Promise<void> => {
    await api.delete(`/api/incidents/${id}`);
  },

  resolveIncident: async (id: number): Promise<Incident> => {
    const { data } = await api.patch<Incident>(`/api/incidents/${id}/resolve`);
    return data;
  },
};

export default incidentService;
