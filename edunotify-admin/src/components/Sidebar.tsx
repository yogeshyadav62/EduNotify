import React from 'react';
import { LayoutDashboard, GraduationCap, Users, Megaphone, LogOut, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, adminName }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Shield size={26} />
        <span>EduNotify</span>
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <GraduationCap size={20} />
              <span>Classes</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={20} />
              <span>Students</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Megaphone size={20} />
              <span>Notifications</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '16px', padding: '0 16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Signed in as</p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>{adminName}</p>
        </div>
        <button className="sidebar-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
