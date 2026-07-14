import React from 'react';
import { LayoutDashboard, GraduationCap, Users, Megaphone, LogOut, Shield, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  adminName,
  isOpen = false,
  onClose
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={26} />
          <span>EduNotify</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="theme-toggle sidebar-close-btn" 
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        <ul className="sidebar-menu">
          <li>
            <button
              className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); onClose?.(); }}
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => { setActiveTab('classes'); onClose?.(); }}
            >
              <GraduationCap size={20} />
              <span>Classes</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => { setActiveTab('students'); onClose?.(); }}
            >
              <Users size={20} />
              <span>Students</span>
            </button>
          </li>
          <li>
            <button
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notifications'); onClose?.(); }}
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
