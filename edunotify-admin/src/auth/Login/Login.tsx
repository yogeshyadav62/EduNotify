import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { postData } from '../../utils/ApiCall';
import { ROUTES } from '../../utils/Routes';

interface LoginProps {
  onLoginSuccess: (token: string, adminName: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface LoginResponse {
  token: string;
  user: {
    name: string;
    username: string;
    role: string;
  };
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => postData<LoginResponse>(ROUTES.login, { username, password }),
    onSuccess: (data) => {
      if (data && data.token) {
        showToast('Logged in successfully!', 'success');
        onLoginSuccess(data.token, data.user.name);
      } else {
        showToast('Invalid response from server', 'error');
      }
    },
    onError: (error: any) => {
      const msg = error.message || 'Login failed. Check your connection.';
      showToast(msg, 'error');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter both username and password', 'error');
      return;
    }
    loginMutation.mutate();
  };

  const loading = loginMutation.isPending;

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} />
            <span>EduNotify Admin</span>
          </div>
          <p className="login-subtitle">Sign in to manage classes, students and notifications</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Enter username (admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', height: '45px' }} disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
