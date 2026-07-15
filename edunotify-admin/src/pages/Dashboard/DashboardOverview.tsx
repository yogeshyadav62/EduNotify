import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Users, Megaphone, Clock, Calendar, Loader2 } from 'lucide-react';
import { getData } from '../../utils/ApiCall';
import { ROUTES } from '../../utils/Routes';

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
}

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
  // Fetch overview metrics via TanStack Query
  const { data: classes = [], isLoading: loadingClasses } = useQuery<ClassData[]>({
    queryKey: ['classes'],
    queryFn: () => getData<ClassData[]>(ROUTES.classes),
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery<StudentData[]>({
    queryKey: ['students'],
    queryFn: () => getData<StudentData[]>(ROUTES.students),
  });

  const { data: notifications = [], isLoading: loadingNotices } = useQuery<NotificationData[]>({
    queryKey: ['notifications'],
    queryFn: () => getData<NotificationData[]>(ROUTES.notifications),
  });

  const totalClasses = Array.isArray(classes) ? classes.length : 0;
  const totalStudents = Array.isArray(students) ? students.length : 0;
  const totalNotices = Array.isArray(notifications) ? notifications.length : 0;
  const publishedNotices = Array.isArray(notifications) ? notifications.filter((n) => n.status === 'published').length : 0;
  const scheduledNotices = Array.isArray(notifications) ? notifications.filter((n) => n.status === 'draft' && n.scheduledFor).length : 0;

  const recentNotices = Array.isArray(notifications)
    ? notifications.filter((n) => n.status === 'published').slice(0, 3)
    : [];

  const isLoading = loadingClasses || loadingStudents || loadingNotices;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <div className="stats-grid">
        <div 
          className="stat-card" 
          onClick={() => setActiveTab('classes')} 
          style={{ 
            cursor: 'pointer', 
            backgroundColor: 'var(--primary-light)', 
            borderColor: 'rgba(37, 99, 235, 0.2)' 
          }}
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Classes</span>
            <span className="stat-value" style={{ color: 'var(--primary)' }}>{totalClasses}</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
            <GraduationCap size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => setActiveTab('students')} 
          style={{ 
            cursor: 'pointer', 
            backgroundColor: 'var(--accent-light)', 
            borderColor: 'rgba(139, 92, 246, 0.2)' 
          }}
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Total Students</span>
            <span className="stat-value" style={{ color: 'var(--accent)' }}>{totalStudents}</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>
            <Users size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => setActiveTab('notifications')} 
          style={{ 
            cursor: 'pointer', 
            backgroundColor: 'var(--success-light)', 
            borderColor: 'rgba(16, 185, 129, 0.2)' 
          }}
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Announcements</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>{totalNotices}</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success)', color: '#ffffff' }}>
            <Megaphone size={24} />
          </div>
        </div>

        <div 
          className="stat-card" 
          onClick={() => setActiveTab('notifications')} 
          style={{ 
            cursor: 'pointer', 
            backgroundColor: 'var(--warning-light)', 
            borderColor: 'rgba(245, 158, 11, 0.2)' 
          }}
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Scheduled / Drafts</span>
            <span className="stat-value" style={{ color: 'var(--warning)' }}>{scheduledNotices}</span>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning)', color: '#ffffff' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Recent Notifications Feed */}
        <div className="table-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="table-header">
            <h3>Recent Announcements</h3>
            <button className="btn btn-secondary" onClick={() => setActiveTab('notifications')}>
              View All
            </button>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, maxHeight: '380px', overflowY: 'auto' }}>
            {recentNotices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                No announcements published yet.
              </div>
            ) : (
              recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '14px' }}>{notice.title}</h4>
                    <span className={`badge badge-${
                      notice.category === 'academic' ? 'purple' :
                      notice.category === 'fees' ? 'green' :
                      notice.category === 'events' ? 'yellow' :
                      notice.category === 'transport' ? 'red' : 'gray'
                    }`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {notice.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {notice.description.length > 100 ? notice.description.substring(0, 100) + '...' : notice.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    <span style={{ textTransform: 'capitalize' }}>By: {notice.facultyName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} />
                      {new Date(notice.dateTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>System Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Published Notices:</span>
                <strong style={{ color: 'var(--success)' }}>{publishedNotices}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Scheduled Notices:</span>
                <strong style={{ color: 'var(--warning)' }}>{scheduledNotices}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connected Sockets:</span>
                <strong style={{ color: 'var(--primary)' }}>Active</strong>
              </div>
            </div>
          </div>

          <div className="table-card" style={{ padding: '24px', backgroundColor: 'var(--primary-light)', borderColor: 'rgba(37, 99, 235, 0.2)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontWeight: 700 }}>Real-time Delivery Active</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Notifications published here will instantly sync with the student mobile app. Make sure the server and client are connected to the same network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
