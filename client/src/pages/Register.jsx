import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';

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

  return (
    <main style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#000' }}>
      {/* Left: Branding/Visual Side - Only on larger screens */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        display: window.innerWidth >= 1024 ? 'flex' : 'none', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 50%, #1d1d1f 100%)'
      }}>
        {/* Animated gradient blobs */}
        <div style={{ 
          position: 'absolute', 
          top: '-20%', 
          right: '-10%', 
          width: '50%', 
          height: '50%', 
          background: 'radial-gradient(circle, rgba(0,114,227,0.15) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite'
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '-20%', 
          left: '-10%', 
          width: '50%', 
          height: '50%', 
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite 2s'
        }} />
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(10px); }
          }
        `}</style>

        {/* Content */}
        <div style={{ zIndex: 10, textAlign: 'center', padding: '0 60px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
              <UserPlus size={60} color="#fff" style={{ opacity: 0.8 }} />
            </div>
            <h1 style={{ fontSize: '72px', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '20px' }}>
              Join the<br/>Evolution.
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '30px', color: '#a1a1a6' }}>
              <ShieldCheck size={18} />
              <span style={{ fontSize: '16px', fontWeight: 500 }}>Bảo mật & Riêng tư tuyệt đối.</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div style={{ flex: '0 0 580px', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderLeft: '1px solid #f5f5f7' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '40px 22px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f' }}>Tạo ID Apple</h2>
              <p style={{ color: '#86868b', marginTop: '8px' }}>Trải nghiệm dịch vụ cá nhân hóa hoàn hảo.</p>
            </div>

            {error && <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#e03e3e' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1d1d1f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Họ và tên</label>
                <input type="text" value={form.name} onChange={e => onChange('name', e.target.value)} required
                  style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '1px solid transparent', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1d1d1f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Địa chỉ Email</label>
                <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} required
                  style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '1px solid transparent', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1d1d1f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số điện thoại (Tùy chọn)</label>
                <input type="tel" value={form.phone} onChange={e => onChange('phone', e.target.value)}
                  style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '1px solid transparent', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1d1d1f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mật khẩu</label>
                <input type="password" value={form.password} onChange={e => onChange('password', e.target.value)} required
                  style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '1px solid transparent', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1d1d1f', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Xác nhận</label>
                <input type="password" value={form.confirm} onChange={e => onChange('confirm', e.target.value)} required
                  style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '1px solid transparent', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                <button type="submit" disabled={loading} className="apple-btn apple-btn-dark"
                  style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {loading ? 'Đang khởi tạo...' : 'Tiếp tục đăng ký'}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', pt: '32px', borderTop: '1px solid #f5f5f7' }}>
              <p style={{ fontSize: '14px', color: '#6e6e73' }}>
                Đã có tài khoản? <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập ngay</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
