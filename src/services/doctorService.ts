import { apiClient } from './api';
import { Doctor, DoctorPayload } from '../types';

export const doctorService = {
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get<Doctor[]>('/doctors');
    return response.data;
  },

  getDoctorById: async (id: number): Promise<Doctor> => {
    const response = await apiClient.get<Doctor>(`/doctors/${id}`);
    return response.data;
  },

  createDoctor: async (payload: DoctorPayload): Promise<Doctor> => {
    const response = await apiClient.post<Doctor>('/doctors', payload);
    return response.data;
  },

  updateDoctor: async (id: number, payload: DoctorPayload): Promise<Doctor> => {
    const response = await apiClient.put<Doctor>(`/doctors/${id}`, payload);
    return response.data;
  },

  deleteDoctor: async (id: number): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  },
};
