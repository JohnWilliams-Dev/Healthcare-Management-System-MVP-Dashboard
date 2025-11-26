import { apiClient } from './api';
import { Patient, PatientPayload } from '../types';

export const patientService = {
  getPatients: async (): Promise<Patient[]> => {
    const response = await apiClient.get<Patient[]>('/patients');
    return response.data;
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  createPatient: async (payload: PatientPayload): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/patients', payload);
    return response.data;
  },

  updatePatient: async (id: number, payload: PatientPayload): Promise<Patient> => {
    const response = await apiClient.put<Patient>(`/patients/${id}`, payload);
    return response.data;
  },

  deletePatient: async (id: number): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },
};
