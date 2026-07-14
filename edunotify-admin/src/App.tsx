import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './pages/Dashboard/DashboardOverview';
import { ClassManagement } from './pages/Classes/ClassManagement';
import { StudentManagement } from './pages/Students/StudentManagement';
import { NotificationManagement } from './pages/Notifications/NotificationManagement';
import { Sun, Moon, Info, LogOut } from 'lucide-react';
import { Login } from './auth/Login/Login';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('admin_name') || 'Administrator');
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'light');
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Apply Theme on load/change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Real-time Socket.IO Sync
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize Socket connection
    const newSocket = io('http://localhost:4500');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to backend Socket.IO server');
      newSocket.emit('join:admin');
    });

    // When student joins or something publishes, we trigger TanStack cache invalidation
    newSocket.on('notification:new', (notice) => {
      // Only show toast if it's a brand new announcement (not a delivery/seen status update)
      if (!notice.isDelivered && !notice.isSeen) {
        showToast(`📢 Live Notice Broadcasted: "${notice.title}"`, 'info');
      }
      
      // Optimistically update React Query cache for instant visual feedback (ticks)
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // If it's the paginated object structure
        if (oldData && typeof oldData === 'object' && Array.isArray(oldData.notifications)) {
          const exists = oldData.notifications.some((item: any) => item.id === notice.id);
          if (exists) {
            return {
              ...oldData,
              notifications: oldData.notifications.map((item: any) => {
                if (item.id === notice.id) {
                  return {
                    ...item,
                    isDelivered: notice.isDelivered ?? item.isDelivered,
                    isSeen: notice.isSeen ?? item.isSeen,
                    deliveredAt: notice.deliveredAt ?? item.deliveredAt,
                    seenAt: notice.seenAt ?? item.seenAt,
                    updatedAt: notice.updatedAt ?? item.updatedAt
                  };
                }
                return item;
              })
            };
          } else {
            return {
              ...oldData,
              notifications: [notice, ...oldData.notifications].slice(0, 10), // Limit to page size
              totalCount: (oldData.totalCount || 0) + 1
            };
          }
        }
        
        // If it's a plain array fallback
        if (Array.isArray(oldData)) {
          const exists = oldData.some(item => item.id === notice.id);
          if (exists) {
            return oldData.map((item) => {
              if (item.id === notice.id) {
                return {
                  ...item,
                  isDelivered: notice.isDelivered ?? item.isDelivered,
                  isSeen: notice.isSeen ?? item.isSeen,
                  deliveredAt: notice.deliveredAt ?? item.deliveredAt,
                  seenAt: notice.seenAt ?? item.seenAt,
                  updatedAt: notice.updatedAt ?? item.updatedAt
                };
              }
              return item;
            });
          } else {
            return [notice, ...oldData];
          }
        }
        
        return oldData;
      });

      // Invalidate ALL notification query variants (includes paginated keys like ['notifications', page, ...])
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleLoginSuccess = (newToken: string, name: string) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_name', name);
    setToken(newToken);
    setAdminName(name);
  };

  const triggerLogoutConfirm = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    setToken(null);
    setLogoutConfirmOpen(false);
    showToast('Logged out successfully', 'info');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!token) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        {/* Floating alerts */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Info size={16} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={triggerLogoutConfirm} adminName={adminName} />

      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'classes' && 'Class Management'}
            {activeTab === 'students' && 'Student Management'}
            {activeTab === 'notifications' && 'Notification Logs'}
          </div>

          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                AD
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <DashboardOverview
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'classes' && (
          <ClassManagement showToast={showToast} />
        )}

        {activeTab === 'students' && (
          <StudentManagement
            showToast={showToast}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationManagement
            showToast={showToast}
          />
        )}
      </main>

      {/* Floating alerts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Info size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
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
                <LogOut size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Confirm Logout</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
                Are you sure you want to log out of the Admin Dashboard? You will need to enter your credentials to log in again.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setLogoutConfirmOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmLogout}
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
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
