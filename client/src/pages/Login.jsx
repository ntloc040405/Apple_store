import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { setError('Vui lòng nhập địa chỉ email hợp lệ'); return; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setError(''); setLoading(true);
    try { await login(email.trim().toLowerCase(), password); }
    catch (err) { setError(err.response?.data?.message || 'Đăng nhập thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '80px 22px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <svg width="44" height="52" viewBox="0 0 814 1000" fill="#1d1d1f" style={{ display: 'block', margin: '0 auto 16px' }}>
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.6-104.7-207.8-104.7-328.1 0-192.8 125.2-295.4 248.4-295.4 65.5 0 120 43.4 161.1 43.4 39.2 0 100.3-46 175.1-46 28.3 0 130 2.5 197.7 95.5zm-283-89.8c30.7-36.7 52.5-87.5 52.5-138.3 0-7-0.6-14.2-1.9-20-50.1 1.9-109.6 33.3-145.5 75.1-25.7 29.5-53.2 80.3-53.2 131.9 0 7.7 1.3 15.4 1.9 17.9 3.2 0.6 8.4 1.3 13.5 1.3 45.2 0 102.5-30.1 132.7-67.9z"/>
          </svg>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f' }}>Đăng nhập vào Apple Store</h1>
        </div>

        {error && <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#e03e3e', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#d2d2d7'} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>Mật khẩu</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#d2d2d7'} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#0071e3', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6e6e73', marginTop: '24px' }}>
          Chưa có tài khoản? <Link to="/register" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>Tạo tài khoản</Link>
        </p>
      </div>
    </main>
  );
}
