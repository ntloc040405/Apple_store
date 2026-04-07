import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      // user state will update → re-render → Navigate
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <svg width="44" height="52" viewBox="0 0 814 1000" fill="#1d1d1f" style={{ display: 'block', margin: '0 auto' }}>
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.6-104.7-207.8-104.7-328.1 0-192.8 125.2-295.4 248.4-295.4 65.5 0 120 43.4 161.1 43.4 39.2 0 100.3-46 175.1-46 28.3 0 130 2.5 197.7 95.5zm-283-89.8c30.7-36.7 52.5-87.5 52.5-138.3 0-7-0.6-14.2-1.9-20-50.1 1.9-109.6 33.3-145.5 75.1-25.7 29.5-53.2 80.3-53.2 131.9 0 7.7 1.3 15.4 1.9 17.9 3.2 0.6 8.4 1.3 13.5 1.3 45.2 0 102.5-30.1 132.7-67.9z"/>
          </svg>
        </div>
        <h1>Trang Quản Trị</h1>
        <p className="subtitle">Đăng nhập tài khoản quản trị viên</p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#e03e3e' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email đăng nhập</label>
            <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@apple.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input id="password" className="form-input" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#86868b' }}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, marginTop: 8, borderRadius: 12 }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
