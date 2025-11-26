import React, { useEffect, useMemo, useState } from 'react';
import { doctorService } from '../services/doctorService';
import { Doctor, DoctorPayload } from '../types';
import { Table, Column } from '../components/Table';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ResourceHeader } from '../components/ResourceHeader';
import { Pagination } from '../components/Pagination';
import '../styles/ResourceList.css';
import '../styles/ResourceForm.css';
import '../styles/ResourceView.css';

const emptyForm: DoctorPayload = {
  name: '',
  specialty: '',
  bio: '',
};

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorPayload>(emptyForm);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const columns: Column<Doctor>[] = useMemo(
    () => [
      { key: 'name', header: 'Name' },
      { key: 'specialty', header: 'Specialty' },
      {
        key: 'bio',
        header: 'Bio',
        render: (doctor) =>
          doctor.bio ? `${doctor.bio.slice(0, 60)}${doctor.bio.length > 60 ? '…' : ''}` : '—',
      },
    ],
    []
  );

  const sortDoctors = (list: Doctor[]) =>
    [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors();
      setDoctors(sortDoctors(data));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(doctors.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [doctors, currentPage, pageSize]);

  const openCreate = () => {
    setEditingDoctor(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      bio: doctor.bio,
    });
    setIsFormOpen(true);
  };

  const openView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsViewOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!formData.name || !formData.specialty) {
        setError('Name and specialty are required');
        setSubmitting(false);
        return;
      }

      if (editingDoctor) {
        const updated = await doctorService.updateDoctor(editingDoctor.id, formData);
        setDoctors((prev) =>
          sortDoctors([updated, ...prev.filter((d) => d.id !== updated.id)])
        );
      } else {
        const created = await doctorService.createDoctor(formData);
        setDoctors((prev) => sortDoctors([created, ...prev]));
      }
      setIsFormOpen(false);
      setEditingDoctor(null);
      setFormData(emptyForm);
      setCurrentPage(1);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoctor) return;
    try {
      await doctorService.deleteDoctor(deleteDoctor.id);
      setDoctors((prev) => prev.filter((d) => d.id !== deleteDoctor.id));
      setDeleteDoctor(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const totalPages = Math.max(1, Math.ceil(doctors.length / pageSize));
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return doctors.slice(start, start + pageSize);
  }, [doctors, currentPage, pageSize]);

  return (
    <div className="resource-list">
      <ResourceHeader title="Doctors" actionLabel="Add Doctor" onAction={openCreate} />

      {error && <div className="error-message">{error}</div>}

      <Table
        data={paginatedDoctors}
        columns={columns}
        loading={loading}
        onView={openView}
        onEdit={openEdit}
        onDelete={setDeleteDoctor}
      />

      {!loading && doctors.length > 0 && (
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
          setEditingDoctor(null);
          setFormData(emptyForm);
        }}
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
      >
        <form className="resource-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialty">Specialty</label>
            <input
              id="specialty"
              name="specialty"
              type="text"
              value={formData.specialty}
              onChange={handleFormChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
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
                setEditingDoctor(null);
                setFormData(emptyForm);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingDoctor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Doctor Details"
      >
        {selectedDoctor ? (
          <div className="resource-view">
            <div className="view-field">
              <label>ID:</label>
              <span>{selectedDoctor.id}</span>
            </div>
            <div className="view-field">
              <label>Name:</label>
              <span>{selectedDoctor.name}</span>
            </div>
            <div className="view-field">
              <label>Specialty:</label>
              <span>{selectedDoctor.specialty}</span>
            </div>
            <div className="view-field">
              <label>Bio:</label>
              <span>{selectedDoctor.bio || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="loading">No doctor selected</div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteDoctor}
        onClose={() => setDeleteDoctor(null)}
        onConfirm={handleDelete}
        title="Delete Doctor"
        message={`Are you sure you want to delete doctor "${deleteDoctor?.name}"?`}
        confirmText="Delete"
      />
    </div>
  );
};
