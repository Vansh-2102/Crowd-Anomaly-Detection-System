import api from './api';
import { Camera, CameraFormData, PageableResponse, QueryParams } from '@/types';

const cameraService = {
  getCameras: async (params?: QueryParams): Promise<PageableResponse<Camera>> => {
    const { data } = await api.get<PageableResponse<Camera>>('/api/cameras', { params });
    return data;
  },

  getCameraById: async (id: number): Promise<Camera> => {
    const { data } = await api.get<Camera>(`/api/cameras/${id}`);
    return data;
  },

  createCamera: async (payload: CameraFormData): Promise<Camera> => {
    const { data } = await api.post<Camera>('/api/cameras', payload);
    return data;
  },

  updateCamera: async (id: number, payload: Partial<CameraFormData>): Promise<Camera> => {
    const { data } = await api.put<Camera>(`/api/cameras/${id}`, payload);
    return data;
  },

  deleteCamera: async (id: number): Promise<void> => {
    await api.delete(`/api/cameras/${id}`);
  },

  getAllCameras: async (): Promise<Camera[]> => {
    const { data } = await api.get<Camera[]>('/api/cameras/all');
    return data;
  },
};

export default cameraService;
