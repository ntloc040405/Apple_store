import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/account" replace />;

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (form.name.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) return 'Vui lòng nhập địa chỉ email hợp lệ';
    if (form.phone && !/^[0-9+\-() ]{8,15}$/.test(form.phone)) return 'Vui lòng nhập số điện thoại hợp lệ (8-15 chữ số)';
    if (form.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(form.password)) return 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa';
    if (!/[0-9]/.test(form.password)) return 'Mật khẩu phải chứa ít nhất một chữ số';
    if (form.password !== form.confirm) return 'Mật khẩu xác nhận không khớp';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);
    try { await register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.phone.trim()); }
    catch (err) { setError(err.response?.data?.message || 'Đăng ký thất bại'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' };

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '60px 22px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f' }}>Tạo ID Apple của bạn</h1>
          <p style={{ fontSize: '15px', color: '#6e6e73', marginTop: '8px' }}>Một tài khoản cho tất cả dịch vụ Apple.</p>
        </div>

        {error && <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#e03e3e', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {[['name', 'Họ và tên', 'text'], ['email', 'Email', 'email'], ['phone', 'Số điện thoại (tùy chọn)', 'tel'], ['password', 'Mật khẩu', 'password'], ['confirm', 'Xác nhận mật khẩu', 'password']].map(([k, label, type]) => (
            <div key={k} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>{label}</label>
              <input type={type} value={form[k]} onChange={e => onChange(k, e.target.value)} required={k !== 'phone'} style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0071e3'} onBlur={e => e.target.style.borderColor = '#d2d2d7'} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: '#0071e3', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#6e6e73', marginTop: '24px' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}
