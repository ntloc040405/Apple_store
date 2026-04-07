/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  useEffect(() => {
    console.log('AuthContext: Checking token on mount');
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('AuthContext: Token found, verifying...');
      API.get('/auth/profile')
        .then(res => {
          const userRole = res.data.data.role;
          if (userRole !== 'admin' && userRole !== 'staff') {
            console.log('AuthContext: User is not admin/staff, logging out');
            logout();
            return;
          }
          console.log('AuthContext: User verified', res.data.data);
          setUser(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.log('AuthContext: Profile fetch failed:', err.message);
          logout();
          setLoading(false);
        });
    } else {
      console.log('AuthContext: No token found, setting loading to false');
      // Fixed cascading setState by wrapping in timeout
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { user: u, token } = res.data.data;
    if (u.role !== 'admin' && u.role !== 'staff') throw new Error('Tài khoản không có quyền truy cập vào bảng quản trị.');
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
