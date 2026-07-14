import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X, Calendar, Image, Paperclip, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getData, postData, putData, deleteData } from '../../utils/ApiCall';
import { ROUTES } from '../../utils/Routes';

// Notification Management Component for Admin Panel

interface ClassData {
  id: string;
  name: string;
}

interface StudentData {
  studentId: string;
  name: string;
  classId: string;
}

interface NotificationData {
  id: string;
  title: string;
  description: string;
  facultyName: string;
  category: string;
  dateTime: string;
  targetType: 'class' | 'student';
  classId: string | null;
  studentId: string | null;
  status: 'draft' | 'published';
  scheduledFor: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null; // MIME type: 'image/jpeg', 'application/pdf', etc.
  subject?: string | null;
  isDelivered?: boolean;
  isSeen?: boolean;
  deliveredAt?: string | null;
  seenAt?: string | null;
}

interface NotificationManagementProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const NotificationManagement: React.FC<NotificationManagementProps> = ({ showToast }) => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [category, setCategory] = useState('general');

  
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');
  
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [scheduledFor, setScheduledFor] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAttachmentUrl, setCurrentAttachmentUrl] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState('');
  const [viewNotice, setViewNotice] = useState<NotificationData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const openViewModal = (notice: NotificationData) => {
    setViewNotice(notice);
    setIsViewModalOpen(true);
  };

  // Server-side Pagination (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Debounce search input (500ms) to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // 1. Fetch Notifications with backend filters + pagination
  const notifQueryParams: Record<string, any> = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  };
  if (search) notifQueryParams.search = search;
  if (categoryFilter) notifQueryParams.category = categoryFilter;
  if (statusFilter) notifQueryParams.status = statusFilter;
  if (classFilter) notifQueryParams.classId = classFilter;

  interface PaginatedNotifications {
    notifications: NotificationData[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    uniqueSubjects?: string[];
  }

  const { data: notifData, isLoading: isLoadingNotifications, isFetching: isFetchingNotifications } = useQuery<PaginatedNotifications>({
    queryKey: ['notifications', currentPage, search, categoryFilter, statusFilter, classFilter],
    queryFn: () => getData<PaginatedNotifications>(ROUTES.notifications, notifQueryParams),
    placeholderData: (prev) => prev, // Keep old data while fetching new page
  });

  const isQueryLoading = isLoadingNotifications || isFetchingNotifications;

  const notifications = notifData?.notifications ?? [];
  const totalPages = notifData?.totalPages ?? 1;
  const totalCount = notifData?.totalCount ?? 0;
  const uniqueSubjects = notifData?.uniqueSubjects ?? [];

  const { data: classes = [] } = useQuery<ClassData[]>({
    queryKey: ['classes'],
    queryFn: () => getData<ClassData[]>(ROUTES.classes),
  });

  const { data: students = [] } = useQuery<StudentData[]>({
    queryKey: ['students'],
    queryFn: () => getData<StudentData[]>(ROUTES.students),
  });

  // 2. Save Mutation
  const saveMutation = useMutation({
    mutationFn: ({ id, formData, isEdit }: { id: string; formData: FormData; isEdit: boolean }) => {
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (!isEdit) {
        return postData(ROUTES.notifications, formData, headers);
      } else {
        return putData(`${ROUTES.notifications}/${id}`, formData, headers);
      }
    },
    onSuccess: () => {
      showToast(modalMode === 'create' ? 'Notification published!' : 'Notification updated successfully!', 'success');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to save notification';
      showToast(msg, 'error');
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteData(`${ROUTES.notifications}/${id}`),
    onSuccess: () => {
      showToast('Notification deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to delete notification';
      showToast(msg, 'error');
    }
  });

  // Notifications are already filtered/paginated by the server
  const currentNotices = notifications;

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId('');
    setTitle('');
    setDescription('');
    setFacultyName('');
    setCategory('general');
    setTargetType('class');
    setTargetClassId(classes[0]?.id || '');
    setTargetStudentId(students[0]?.studentId || '');
    setStatus('published');
    setScheduledFor('');
    setSelectedFile(null);
    setCurrentAttachmentUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (n: NotificationData) => {
    setModalMode('edit');
    setSelectedId(n.id);
    setTitle(n.title);
    setDescription(n.description);
    setFacultyName(n.facultyName);
    setCategory(n.category);
    setTargetType(n.targetType);
    setTargetClassId(n.classId || classes[0]?.id || '');
    setTargetStudentId(n.studentId || students[0]?.studentId || '');
    setStatus(n.status);
    
    // Format scheduled time for datetime-local input
    if (n.scheduledFor) {
      const date = new Date(n.scheduledFor);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setScheduledFor(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setScheduledFor('');
    }
    
    setSelectedFile(null);
    setCurrentAttachmentUrl(n.attachmentUrl);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !facultyName) {
      showToast('Title, description and faculty name are required', 'error');
      return;
    }

    if (targetType === 'class' && !targetClassId) {
      showToast('Please select a target class', 'error');
      return;
    }

    if (targetType === 'student' && !targetStudentId) {
      showToast('Please select a target student', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('facultyName', facultyName);
    formData.append('category', category);
    formData.append('targetType', targetType);
    
    if (targetType === 'class') {
      formData.append('classId', targetClassId);
    } else {
      const student = students.find(s => s.studentId === targetStudentId);
      if (student) {
        formData.append('studentId', targetStudentId);
        formData.append('classId', student.classId); // Also link student class for quick filtering
      }
    }

    formData.append('status', status);
    if (scheduledFor) {
      formData.append('scheduledFor', new Date(scheduledFor).toISOString());
    }

    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    saveMutation.mutate({
      id: selectedId,
      formData,
      isEdit: modalMode === 'edit'
    });
  };

  const handleDelete = (id: string) => {
    setNoticeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(noticeToDelete);
    setDeleteConfirmOpen(false);
  };

  const loading = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="dashboard-view">
      <div className="table-card">
        <div className="table-header">
          <h2>Notification Logs</h2>
          <div className="table-filters" style={{ flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            <select
              className="select-filter"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="academic">Academic</option>
              <option value="fees">Fees</option>
              <option value="events">Events</option>
              <option value="transport">Transport</option>
              <option value="general">General</option>
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft / Scheduled</option>
            </select>

            <select
              className="select-filter"
              value={classFilter}
              onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>

            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} /> Create Notice
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No</th>
                <th>Details</th>
                <th>Category</th>
                <th>Target</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isQueryLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : currentNotices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No announcements found.
                  </td>
                </tr>
              ) : (
                currentNotices.map((n, index) => {
                  const serialNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr key={n.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{serialNumber}</td>
                      <td style={{ maxWidth: '250px' }}>
                      <div 
                        style={{ 
                          fontWeight: 600, 
                          fontSize: '15px', 
                          marginBottom: '4px', 
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} 
                        title={n.title}
                      >
                        {n.title}
                      </div>
                      <div 
                        style={{ 
                          fontSize: '13px', 
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} 
                        title={n.description}
                      >
                        {n.description}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'capitalize' }}>
                        Faculty: {n.facultyName}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${
                        n.category === 'academic' ? 'purple' :
                        n.category === 'fees' ? 'green' :
                        n.category === 'events' ? 'yellow' :
                        n.category === 'transport' ? 'red' : 'gray'
                      }`}>
                        {n.category}
                      </span>
                    </td>
                    <td>
                      {n.targetType === 'class' ? (
                        <div>
                          <span className="badge badge-blue">Class: {n.classId}</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="badge badge-purple">Student: {n.studentId}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', paddingLeft: '4px' }}>Class: {n.classId}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {new Date(n.dateTime).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      {n.status === 'published' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span className="badge badge-green">Published</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: n.isSeen ? '#2563EB' : 'var(--text-tertiary)' }}>
                            {n.isSeen ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12l5.25 5 2.625-3M8 12l5.25 5L22 7" />
                                </svg>
                                <span>Seen</span>
                              </>
                            ) : n.isDelivered ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M2 12l5.25 5 2.625-3M8 12l5.25 5L22 7" />
                                </svg>
                                <span>Delivered</span>
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Sent</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-yellow">Draft / Scheduled</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => openViewModal(n)} title="View Notice">
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => openEditModal(n)} title="Edit Notice">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(n.id)} title="Delete Notice">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ); })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side Pagination controls */}
        <div className="pagination">
          <span className="pagination-info">
            {totalCount > 0
              ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of ${totalCount} notices`
              : 'No notices found'}
          </span>
          <div className="pagination-buttons" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary"
              disabled={currentPage <= 1 || isQueryLoading}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-tertiary)' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`btn ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={isQueryLoading}
                    onClick={() => setCurrentPage(p as number)}
                    style={{ padding: '6px 10px', minWidth: '36px' }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="btn btn-secondary"
              disabled={currentPage >= totalPages || isQueryLoading}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Announcement Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{modalMode === 'create' ? 'Post New Announcement' : 'Edit Announcement'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="title">Notice Title</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. End Semester Exam Fee submission date"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Notice Description</label>
                  <textarea
                    id="description"
                    className="form-control"
                    rows={4}
                    placeholder="Provide full description of the announcement..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="facultyName">Faculty Name / Sender</label>
                    <input
                      id="facultyName"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Ramesh Kumar"
                      value={facultyName}
                      onChange={(e) => setFacultyName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={loading}
                    >
                      <option value="academic">Academic</option>
                      <option value="fees">Fees</option>
                      <option value="events">Events</option>
                      <option value="transport">Transport</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>



                <div className="form-row">
                  <div className="form-group">
                    <label>Target Audience</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="targetType"
                          checked={targetType === 'class'}
                          onChange={() => setTargetType('class')}
                          disabled={loading}
                        />
                        Entire Class
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="targetType"
                          checked={targetType === 'student'}
                          onChange={() => setTargetType('student')}
                          disabled={loading}
                        />
                        Individual Student
                      </label>
                    </div>
                  </div>

                  {targetType === 'class' ? (
                    <div className="form-group">
                      <label htmlFor="targetClass">Select Class</label>
                      <select
                        id="targetClass"
                        className="form-control"
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        disabled={loading}
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id} style={{ textTransform: 'capitalize' }}>
                            {c.id} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="form-group">
                      <label htmlFor="targetStudent">Select Student</label>
                      <select
                        id="targetStudent"
                        className="form-control"
                        value={targetStudentId}
                        onChange={(e) => setTargetStudentId(e.target.value)}
                        disabled={loading}
                      >
                        {students.map((s) => (
                          <option key={s.studentId} value={s.studentId} style={{ textTransform: 'capitalize' }}>
                            {s.studentId} - {s.name} ({s.classId})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Publish Action</label>
                    <select
                      id="status"
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      disabled={loading}
                    >
                      <option value="published">Publish Now</option>
                      <option value="draft">Save as Draft / Schedule</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="scheduled">Schedule Publication (Optional)</label>
                    <input
                      id="scheduled"
                      type="datetime-local"
                      className="form-control"
                      value={scheduledFor}
                      onChange={(e) => {
                        setScheduledFor(e.target.value);
                        if (e.target.value) setStatus('draft'); // Auto switch to draft if scheduled
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Attachment (Image or Document)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    disabled={loading}
                  />
                  
                  {selectedFile ? (
                    <div className="file-preview">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{selectedFile.name}</span>
                      </div>
                      <button type="button" className="btn-icon btn-icon-danger" onClick={() => setSelectedFile(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : currentAttachmentUrl ? (
                    <div className="file-preview">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={18} style={{ color: 'var(--success)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Existing Attachment Attached</span>
                      </div>
                      <button type="button" className="btn-icon btn-icon-danger" onClick={() => setCurrentAttachmentUrl(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="file-uploader" onClick={() => fileInputRef.current?.click()}>
                      <Image size={24} style={{ color: 'var(--text-tertiary)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Click to browse file</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Supports PNG, JPG, PDF up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : (modalMode === 'create' ? 'Publish notice' : 'Save changes')}
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
                Are you sure you want to delete this notification? This action cannot be undone.
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
      {/* View Details Modal */}
      {isViewModalOpen && viewNotice && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Announcement Details</h3>
              <button className="btn-icon" onClick={() => setIsViewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
              
              {/* Title & Category Badge */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge badge-${
                    viewNotice.category === 'academic' ? 'purple' :
                    viewNotice.category === 'fees' ? 'green' :
                    viewNotice.category === 'events' ? 'yellow' :
                    viewNotice.category === 'transport' ? 'red' : 'gray'
                  }`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                    {viewNotice.category}
                  </span>
                  
                  {viewNotice.status === 'published' ? (
                    <span className="badge badge-green">Published</span>
                  ) : (
                    <span className="badge badge-yellow">Draft / Scheduled</span>
                  )}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {viewNotice.title}
                </h2>
              </div>

              {/* Full Description */}
              <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Description
                </h4>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {viewNotice.description}
                </p>
              </div>

              {/* Metadata Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Target Audience</h5>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {viewNotice.targetType === 'class' ? `Class Wide (${viewNotice.classId})` : `Specific Student (${viewNotice.studentId})`}
                  </p>
                </div>

                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Published By</h5>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    Faculty: {viewNotice.facultyName}
                  </p>
                </div>
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Date & Time</h5>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(viewNotice.dateTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Delivery Status</h5>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>
                    {viewNotice.isSeen ? (
                      <span style={{ color: '#2563EB' }}>Seen by student</span>
                    ) : viewNotice.isDelivered ? (
                      <span style={{ color: 'var(--text-secondary)' }}>Delivered to device</span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>Sent / Published</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Attachment preview if exists */}
              {viewNotice.attachmentUrl && (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-color)' }}>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Attachment</h5>
                  {viewNotice.attachmentType?.startsWith('image/') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <img 
                        src={viewNotice.attachmentUrl} 
                        alt="attachment preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                      />
                      <a 
                        href={viewNotice.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary" 
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', fontSize: '13px' }}
                      >
                        <Eye size={14} /> View Full Image
                      </a>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Paperclip size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Document Attachment</span>
                      </div>
                      <a 
                        href={viewNotice.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Open File
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
