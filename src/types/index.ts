// Patient Types
export interface Patient {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  medicalHistory?: string;
}

export interface PatientPayload {
  name?: string;
  age?: number;
  gender?: string;
  medicalHistory?: string;
}

// Doctor Types
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  bio?: string;
}

export interface DoctorPayload {
  name: string;
  specialty: string;
  bio?: string;
}

// Appointment Types
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  reason?: string;
}

export interface AppointmentPayload {
  patientId: number;
  doctorId: number;
  dateTime: string;
  reason?: string;
}
