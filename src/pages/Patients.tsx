import React, { useEffect, useMemo, useState } from 'react';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { Patient, PatientPayload, Appointment, Doctor } from '../types';
import { Table, Column } from '../components/Table';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ResourceHeader } from '../components/ResourceHeader';
import { Pagination } from '../components/Pagination';
import '../styles/ResourceList.css';
import '../styles/ResourceForm.css';
import '../styles/ResourceView.css';

const emptyForm: PatientPayload = {
  name: '',
  age: undefined,
  gender: '',
  medicalHistory: '',
};

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientPayload>(emptyForm);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [doctorsById, setDoctorsById] = useState<Record<number, Doctor>>({});

  const columns: Column<Patient>[] = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      {
        key: 'age',
        header: 'Age',
        render: (patient) => (patient.age !== undefined ? patient.age : 'N/A'),
      },
      { key: 'gender', header: 'Gender', render: (patient) => patient.gender || 'N/A' },
      {
        key: 'medicalHistory',
        header: 'Medical History',
        render: (patient) =>
          patient.medicalHistory
            ? `${patient.medicalHistory.slice(0, 60)}${patient.medicalHistory.length > 60 ? '...' : ''}`
            : 'N/A',
      },
    ],
    []
  );

  const appointmentColumns: Column<Appointment>[] = useMemo(
    () => [
      {
        key: 'dateTime',
        header: 'Date & Time',
        render: (appointment) => new Date(appointment.dateTime).toLocaleString(),
      },
      {
        key: 'doctorId',
        header: 'Doctor',
        render: (appointment) =>
          doctorsById[appointment.doctorId]?.name || `Doctor #${appointment.doctorId}`,
      },
      {
        key: 'reason',
        header: 'Reason',
        render: (appointment) =>
          appointment.reason
            ? `${appointment.reason.slice(0, 60)}${appointment.reason.length > 60 ? '...' : ''}`
            : 'N/A',
      },
    ],
    [doctorsById]
  );

  const sortPatients = (list: Patient[]) =>
    [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const mapDoctorsById = (list: Doctor[]) => {
    const mapped: Record<number, Doctor> = {};
    list.forEach((doc) => {
      mapped[doc.id] = doc;
    });
    return mapped;
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const [patientData, doctorData] = await Promise.all([
        patientService.getPatients(),
        doctorService.getDoctors(),
      ]);
      const sortedPatients = sortPatients(patientData);
      setPatients(sortedPatients);
      setDoctorsById(mapDoctorsById(doctorData));
      if (sortedPatients.length > 0) {
        const existing = selectedPatient
          ? sortedPatients.find((p) => p.id === selectedPatient.id)
          : null;
        setSelectedPatient(existing ?? sortedPatients[0]);
      } else {
        setSelectedPatient(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (patientId: number) => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError('');
      const data = await appointmentService.getAppointments({ patientId });
      setAppointments(data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
    } catch (err: any) {
      setAppointmentsError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(patients.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [patients, currentPage, pageSize]);

  useEffect(() => {
    if (selectedPatient?.id) {
      loadAppointments(selectedPatient.id);
    } else {
      setAppointments([]);
    }
  }, [selectedPatient?.id]);

  const openCreate = () => {
    setEditingPatient(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: patient.medicalHistory,
    });
    setIsFormOpen(true);
  };

  const openView = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(true);
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewOpen(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPatient) {
        const updated = await patientService.updatePatient(editingPatient.id, formData);
        setPatients((prev) => sortPatients([updated, ...prev.filter((p) => p.id !== updated.id)]));
        if (selectedPatient?.id === updated.id) {
          setSelectedPatient(updated);
        }
      } else {
        const created = await patientService.createPatient(formData);
        setPatients((prev) => sortPatients([created, ...prev]));
        setSelectedPatient(created);
        setAppointments([]);
      }
      setIsFormOpen(false);
      setEditingPatient(null);
      setFormData(emptyForm);
      setCurrentPage(1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePatient) return;
    try {
      await patientService.deletePatient(deletePatient.id);
      const remaining = patients.filter((p) => p.id !== deletePatient.id);
      setPatients(remaining);
      if (selectedPatient?.id === deletePatient.id) {
        setSelectedPatient(remaining[0] ?? null);
        if (remaining.length === 0) {
          setAppointments([]);
        }
      }
      setDeletePatient(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const totalPages = Math.max(1, Math.ceil(patients.length / pageSize));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return patients.slice(start, start + pageSize);
  }, [patients, currentPage, pageSize]);

  return (
    <div className="resource-list">
      <ResourceHeader title="Patients" actionLabel="Add Patient" onAction={openCreate} />

      {error && <div className="error-message">{error}</div>}

      <div className="patient-layout">
        <div className="patient-list-panel">
          <div className="patient-list">
            {loading && <div className="table-loading">Loading...</div>}
            {!loading && patients.length === 0 && (
              <div className="table-empty">No patients available</div>
            )}
            {paginatedPatients.map((patient) => (
              <div
                key={patient.id}
                className={`patient-list-item ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
              >
                <button className="patient-select" onClick={() => selectPatient(patient)}>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-meta">
                    {patient.age !== undefined ? `Age ${patient.age}` : 'Age N/A'} ·{' '}
                    {patient.gender || 'Gender N/A'}
                  </div>
                </button>
                <div className="patient-actions">
                  <button className="btn-edit" onClick={() => openEdit(patient)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => setDeletePatient(patient)}>
                    Delete
                  </button>
                  <button className="btn-view" onClick={() => openView(patient)}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!loading && patients.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <div className="patient-detail-panel">
          {selectedPatient ? (
            <>
              <h2>Patient Details</h2>
              <div className="resource-view">
                <div className="view-field">
                  <label>Name:</label>
                  <span>{selectedPatient.name}</span>
                </div>
                <div className="view-field">
                  <label>Age:</label>
                  <span>{selectedPatient.age ?? 'N/A'}</span>
                </div>
                <div className="view-field">
                  <label>Gender:</label>
                  <span>{selectedPatient.gender || 'N/A'}</span>
                </div>
                <div className="view-field">
                  <label>Medical History:</label>
                  <span>{selectedPatient.medicalHistory || 'N/A'}</span>
                </div>
              </div>

              <div className="appointments-section">
                <ResourceHeader
                  title="Appointments"
                  headingLevel="h2"
                  style={{ marginTop: 0 }}
                />
                {appointmentsError && <div className="error-message">{appointmentsError}</div>}
                {appointmentsLoading && <div className="table-loading">Loading appointments...</div>}
                {!appointmentsLoading && appointments.length === 0 && (
                  <div className="table-empty">No appointments for this patient</div>
                )}
                {!appointmentsLoading && appointments.length > 0 && (
                  <Table data={appointments} columns={appointmentColumns} />
                )}
              </div>
            </>
          ) : (
            <div className="table-empty">Select a patient to view details and appointments</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPatient(null);
          setFormData(emptyForm);
        }}
        title={editingPatient ? 'Edit Patient' : 'Add Patient'}
      >
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleFormChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              value={formData.age ?? ''}
              onChange={handleFormChange}
              min={0}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleFormChange}
              disabled={submitting}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="medicalHistory">Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory || ''}
              onChange={handleFormChange}
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsFormOpen(false);
                setEditingPatient(null);
                setFormData(emptyForm);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingPatient ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Patient Details">
        {selectedPatient ? (
          <div className="resource-view">
            <div className="view-field">
              <label>ID:</label>
              <span>{selectedPatient.id}</span>
            </div>
            <div className="view-field">
              <label>Name:</label>
              <span>{selectedPatient.name}</span>
            </div>
            <div className="view-field">
              <label>Age:</label>
              <span>{selectedPatient.age ?? 'N/A'}</span>
            </div>
            <div className="view-field">
              <label>Gender:</label>
              <span>{selectedPatient.gender || 'N/A'}</span>
            </div>
            <div className="view-field">
              <label>Medical History:</label>
              <span>{selectedPatient.medicalHistory || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div className="loading">No patient selected</div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePatient}
        onClose={() => setDeletePatient(null)}
        onConfirm={handleDelete}
        title="Delete Patient"
        message={`Are you sure you want to delete patient "${deletePatient?.name}"?`}
        confirmText="Delete"
      />
    </div>
  );
};
