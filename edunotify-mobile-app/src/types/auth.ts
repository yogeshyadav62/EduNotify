export interface User {
  studentId: string;
  classId: string;
  name: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
