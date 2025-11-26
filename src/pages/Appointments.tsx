import React, { useEffect, useMemo, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, AppointmentPayload } from '../types';
import { Table, Column } from '../components/Table';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ResourceHeader } from '../components/ResourceHeader';
import { Pagination } from '../components/Pagination';
import '../styles/ResourceList.css';
import '../styles/ResourceForm.css';
import '../styles/ResourceView.css';

const emptyForm: AppointmentPayload = {
  patientId: 0,
  doctorId: 0,
  dateTime: '',
  reason: '',
};

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentPayload>(emptyForm);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const pageSize = 10;

  const columns: Column<Appointment>[] = useMemo(
    () => [
      { key: 'patientId', header: 'Patient ID' },
      { key: 'doctorId', header: 'Doctor ID' },
      {
        key: 'dateTime',
        header: 'Date & Time',
        render: (appointment) => new Date(appointment.dateTime).toLocaleString(),
      },
      {
        key: 'reason',
        header: 'Reason',
        render: (appointment) =>
          appointment.reason ? `${appointment.reason.slice(0, 60)}${appointment.reason.length > 60 ? '…' : ''}` : '—',
      },
    ],
    []
  );

  const sortAppointments = (list: Appointment[]) =>
    [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const loadAppointments = async (patientId?: number, doctorId?: number) => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments({ patientId, doctorId });
      setAppointments(sortAppointments(data));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(appointments.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [appointments, currentPage, pageSize]);

  const openCreate = () => {
    setEditingAppointment(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      dateTime: appointment.dateTime.slice(0, 16),
      reason: appointment.reason,
    });
    setIsFormOpen(true);
  };

  const openView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'patientId' || name === 'doctorId'
          ? value === ''
            ? 0
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!formData.patientId || !formData.doctorId || !formData.dateTime) {
        setError('Patient ID, Doctor ID, and Date/Time are required');
        setSubmitting(false);
        return;
      }

      const payload: AppointmentPayload = {
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        dateTime: formData.dateTime,
        reason: formData.reason,
      };

      if (editingAppointment) {
        const updated = await appointmentService.updateAppointment(editingAppointment.id, payload);
        setAppointments((prev) =>
          sortAppointments([updated, ...prev.filter((a) => a.id !== updated.id)])
        );
      } else {
        const created = await appointmentService.createAppointment(payload);
        setAppointments((prev) => sortAppointments([created, ...prev]));
      }

      setIsFormOpen(false);
      setEditingAppointment(null);
      setFormData(emptyForm);
      setCurrentPage(1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAppointment) return;
    try {
      await appointmentService.deleteAppointment(deleteAppointment.id);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteAppointment.id));
      setDeleteAppointment(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const applyFilters = () => {
    const patientId = patientFilter ? Number(patientFilter) : undefined;
    const doctorId = doctorFilter ? Number(doctorFilter) : undefined;
    loadAppointments(patientId, doctorId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setPatientFilter('');
    setDoctorFilter('');
    loadAppointments();
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(appointments.length / pageSize));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return appointments.slice(start, start + pageSize);
  }, [appointments, currentPage, pageSize]);

  return (
    <div className="resource-list">
      <ResourceHeader title="Appointments" actionLabel="Add Appointment" onAction={openCreate} />

      <div className="filter-row">
        <div className="filter-group">
          <label htmlFor="patientFilter">Patient ID</label>
          <input
            id="patientFilter"
            type="number"
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            placeholder="e.g., 1"
          />
        </div>
        <div className="filter-group">
          <label htmlFor="doctorFilter">Doctor ID</label>
          <input
            id="doctorFilter"
            type="number"
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            placeholder="e.g., 2"
          />
        </div>
        <div className="filter-actions">
          <button className="btn-primary" onClick={applyFilters} disabled={loading}>
            Apply
          </button>
          <button className="btn-secondary" onClick={clearFilters} disabled={loading}>
            Clear
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        data={paginatedAppointments}
        columns={columns}
        loading={loading}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteAppointment}
      />

      {!loading && appointments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAppointment(null);
          setFormData(emptyForm);
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Add Appointment'}
      >
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patientId">Patient ID</label>
            <input
              id="patientId"
              name="patientId"
              type="number"
              value={formData.patientId || ''}
              onChange={handleFormChange}
              required
              min={1}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="doctorId">Doctor ID</label>
            <input
              id="doctorId"
              name="doctorId"
              type="number"
              value={formData.doctorId || ''}
              onChange={handleFormChange}
              required
              min={1}
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateTime">Date & Time</label>
            <input
              id="dateTime"
              name="dateTime"
              type="datetime-local"
              value={formData.dateTime}
              onChange={handleFormChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason || ''}
              onChange={handleFormChange}
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsFormOpen(false);
                setEditingAppointment(null);
                setFormData(emptyForm);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingAppointment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Appointment Details"
      >
        {selectedAppointment ? (
          <div className="resource-view">
            <div className="view-field">
              <label>ID:</label>
              <span>{selectedAppointment.id}</span>
            </div>
            <div className="view-field">
              <label>Patient ID:</label>
              <span>{selectedAppointment.patientId}</span>
            </div>
            <div className="view-field">
              <label>Doctor ID:</label>
              <span>{selectedAppointment.doctorId}</span>
            </div>
            <div className="view-field">
              <label>Date & Time:</label>
              <span>{new Date(selectedAppointment.dateTime).toLocaleString()}</span>
            </div>
            <div className="view-field">
              <label>Reason:</label>
              <span>{selectedAppointment.reason || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="loading">No appointment selected</div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteAppointment}
        onClose={() => setDeleteAppointment(null)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        message={`Are you sure you want to delete appointment ID "${deleteAppointment?.id}"?`}
        confirmText="Delete"
      />
    </div>
  );
};
