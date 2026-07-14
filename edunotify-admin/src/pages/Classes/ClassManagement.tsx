import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { getData, postData, putData, deleteData } from '../../utils/ApiCall';
import { ROUTES } from '../../utils/Routes';

interface ClassData {
  id: string;
  name: string;
}

interface ClassManagementProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ showToast }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [className, setClassName] = useState('');
  const [classIdInput, setClassIdInput] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState('');

  // 1. Fetch Query
  const { data: classes = [], isLoading } = useQuery<ClassData[]>({
    queryKey: ['classes'],
    queryFn: () => getData<ClassData[]>(ROUTES.classes),
  });

  // 2. Save Mutation
  const saveMutation = useMutation({
    mutationFn: ({ id, name, isEdit }: { id: string; name: string; isEdit: boolean }) => {
      if (!isEdit) {
        return postData(ROUTES.classes, { id, name });
      } else {
        return putData(`${ROUTES.classes}/${id}`, { name });
      }
    },
    onSuccess: () => {
      showToast(modalMode === 'create' ? 'Class created successfully!' : 'Class updated successfully!', 'success');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to save class';
      showToast(msg, 'error');
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`${ROUTES.classes}/${id}`),
    onSuccess: () => {
      showToast('Class deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to delete class';
      showToast(msg, 'error');
    }
  });

  // Filter classes by search query
  const filteredClasses = classes.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setModalMode('create');
    setClassIdInput('');
    setClassName('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClassData) => {
    setModalMode('edit');
    setClassIdInput(c.id); // Readonly
    setClassName(c.name);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create' && !classIdInput) {
      showToast('Class ID is required (e.g. CS-202)', 'error');
      return;
    }
    if (!className) {
      showToast('Class Name is required (e.g. Computer Science)', 'error');
      return;
    }

    saveMutation.mutate({
      id: classIdInput,
      name: className,
      isEdit: modalMode === 'edit'
    });
  };

  const handleDelete = (id: string) => {
    setClassToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(classToDelete);
    setDeleteConfirmOpen(false);
  };

  const loading = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="dashboard-view">
      <div className="table-card">
        <div className="table-header">
          <h2>Class Management</h2>
          <div className="table-filters">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> Add Class
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th>Class ID</th>
                <th>Class Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No classes found. Add a class to get started!
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c, index) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{index + 1}</td>
                    <td>
                      <span className="badge badge-blue">{c.id}</span>
                    </td>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{c.name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => openEditModal(c)} title="Edit Class">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(c.id)} title="Delete Class">
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
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{modalMode === 'create' ? 'Create New Class' : 'Edit Class Details'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="classId">Class ID</label>
                  <input
                    id="classId"
                    type="text"
                    className="form-control"
                    placeholder="e.g. CS-202"
                    value={classIdInput}
                    onChange={(e) => setClassIdInput(e.target.value)}
                    disabled={modalMode === 'edit' || loading}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {modalMode === 'create' && (
                    <small style={{ color: 'var(--text-tertiary)' }}>Format: XX-XXX (e.g. CS-101, BCA-2A)</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="className">Class Name</label>
                  <input
                    id="className"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Computer Science - Year 2"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Class'}
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
                Are you sure you want to delete class <strong>{classToDelete}</strong>? This action cannot be undone and will fail if there are active students assigned to this class.
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
