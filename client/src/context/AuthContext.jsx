import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('apple_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('apple_token');
    if (token) {
      API.get('/auth/profile')
        .then(res => {
          setUser(res.data.data);
          localStorage.setItem('apple_user', JSON.stringify(res.data.data));
        })
        .catch(() => {
          localStorage.removeItem('apple_token');
          localStorage.removeItem('apple_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem('apple_token', token);
    localStorage.setItem('apple_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });
    const { user: u, token } = res.data.data;
    localStorage.setItem('apple_token', token);
    localStorage.setItem('apple_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('apple_token');
    localStorage.removeItem('apple_user');
    setUser(null);
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem('apple_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
