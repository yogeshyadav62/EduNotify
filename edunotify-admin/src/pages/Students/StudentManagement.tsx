import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X, GraduationCap, Loader2 } from 'lucide-react';
import { getData, postData, putData, deleteData } from '../../utils/ApiCall';
import { ROUTES } from '../../utils/Routes';

interface ClassData {
  id: string;
  name: string;
}

interface StudentData {
  studentId: string;
  name: string;
  classId: string;
  email?: string;
  mobile?: string;
  Class?: ClassData;
}

interface StudentManagementProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ showToast }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Form State
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Fetch Students & Classes Queries
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<StudentData[]>({
    queryKey: ['students'],
    queryFn: () => getData<StudentData[]>(ROUTES.students),
  });

  const { data: classes = [] } = useQuery<ClassData[]>({
    queryKey: ['classes'],
    queryFn: () => getData<ClassData[]>(ROUTES.classes),
  });

  // 2. Save Mutation
  const saveMutation = useMutation({
    mutationFn: ({ id, payload, isEdit }: { id: string; payload: any; isEdit: boolean }) => {
      if (!isEdit) {
        return postData(ROUTES.students, payload);
      } else {
        return putData(`${ROUTES.students}/${id}`, payload);
      }
    },
    onSuccess: () => {
      showToast(modalMode === 'create' ? 'Student added successfully!' : 'Student details updated successfully!', 'success');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to save student';
      showToast(msg, 'error');
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`${ROUTES.students}/${id}`),
    onSuccess: () => {
      showToast('Student deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to delete student';
      showToast(msg, 'error');
    }
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.mobile && s.mobile.includes(search));

    const matchesClass = classFilter === '' || s.classId === classFilter;

    return matchesSearch && matchesClass;
  });

  // Calculate paginated students
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const openCreateModal = () => {
    if (classes.length === 0) {
      showToast('Create a class first before adding students', 'info');
      return;
    }
    setModalMode('create');
    setStudentId('');
    setStudentName('');
    setSelectedClassId(classes[0]?.id || '');
    setEmail('');
    setMobile('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: StudentData) => {
    setModalMode('edit');
    setStudentId(s.studentId);
    setStudentName(s.name);
    setSelectedClassId(s.classId);
    setEmail(s.email || '');
    setMobile(s.mobile || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create' && !studentId) {
      showToast('Student ID is required', 'error');
      return;
    }
    if (!studentName) {
      showToast('Student Name is required', 'error');
      return;
    }
    if (!selectedClassId) {
      showToast('Class ID is required', 'error');
      return;
    }

    // Pattern validation (Student ID format: STU-XXXX)
    const stuIdRegex = /^STU-\d+$/i;
    if (modalMode === 'create' && !stuIdRegex.test(studentId)) {
      showToast('Student ID must follow pattern STU-101', 'error');
      return;
    }

    const payload = {
      studentId,
      name: studentName,
      classId: selectedClassId,
      email: email || undefined,
      mobile: mobile || undefined,
    };

    saveMutation.mutate({
      id: studentId,
      payload,
      isEdit: modalMode === 'edit'
    });
  };

  const handleDelete = (id: string) => {
    setStudentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(studentToDelete);
    setDeleteConfirmOpen(false);
  };

  const loading = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="dashboard-view">
      <div className="table-card">
        <div className="table-header">
          <h2>Student Management</h2>
          <div className="table-filters">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <select
              className="select-filter"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} style={{ textTransform: 'capitalize' }}>
                  {c.id} - {c.name}
                </option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> Add Student
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Assigned Class</th>
                <th>Email</th>
                <th>Mobile Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                currentStudents.map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <span className="badge badge-purple">{s.studentId}</span>
                    </td>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.name}</td>
                    <td>
                      <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={12} />
                        {s.classId}
                      </span>
                    </td>
                    <td>{s.email || '-'}</td>
                    <td>{s.mobile || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => openEditModal(s)} title="Edit Student">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(s.studentId)} title="Delete Student">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
            </span>
            <div className="pagination-buttons">
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ padding: '6px 12px' }}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ padding: '6px 12px' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{modalMode === 'create' ? 'Add Student' : 'Update Student Details'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    id="studentId"
                    type="text"
                    className="form-control"
                    placeholder="e.g. STU-101"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={modalMode === 'edit' || loading}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {modalMode === 'create' && (
                    <small style={{ color: 'var(--text-tertiary)' }}>Pattern: STU-XXXX (e.g. STU-101)</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="studentName">Student Name</label>
                  <input
                    id="studentName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="classSelect">Assign Class</label>
                  <select
                    id="classSelect"
                    className="form-control"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={loading}
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id} style={{ textTransform: 'capitalize' }}>
                        {c.id} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="aarav@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number (Optional)</label>
                    <input
                      id="mobile"
                      type="text"
                      className="form-control"
                      placeholder="+919876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Confirm Deletion</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                Are you sure you want to delete student <strong>{studentToDelete}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirmOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
