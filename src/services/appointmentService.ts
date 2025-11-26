import { apiClient } from './api';
import { Appointment, AppointmentPayload } from '../types';

type AppointmentQuery = {
  patientId?: number;
  doctorId?: number;
};

export const appointmentService = {
  getAppointments: async (params: AppointmentQuery = {}): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/appointments', params);
    return response.data;
  },

  getAppointmentById: async (id: number): Promise<Appointment> => {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (payload: AppointmentPayload): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>('/appointments', payload);
    return response.data;
  },

  updateAppointment: async (id: number, payload: AppointmentPayload): Promise<Appointment> => {
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, payload);
    return response.data;
  },

  deleteAppointment: async (id: number): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },
};
