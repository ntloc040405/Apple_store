import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {  motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ArrowRight, Apple } from 'lucide-react';

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
          left: '-10%', 
          width: '50%', 
          height: '50%', 
          background: 'radial-gradient(circle, rgba(0,242,255,0.15) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite'
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '-20%', 
          right: '-10%', 
          width: '50%', 
          height: '50%', 
          background: 'radial-gradient(circle, rgba(255,0,127,0.08) 0%, transparent 70%)',
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
            <Apple size={80} color="#fff" style={{ marginBottom: '40px', opacity: 0.9 }} />
            <h1 style={{ fontSize: '72px', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '20px' }}>
              Smarter.<br/>Better.<br/>Stronger.
            </h1>
            <p style={{ fontSize: '21px', color: '#a1a1a6', maxWidth: '400px', margin: '30px auto 0' }}>
              Chào mừng bạn trở lại với trải nghiệm mua sắm đẳng cấp nhất.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Form Side */}
      <div style={{ flex: '0 0 540px', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderLeft: '1px solid #f5f5f7' }}>
        <div style={{ width: '100%', maxWidth: '380px', padding: '40px 22px' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f' }}>Đăng nhập</h2>
              <p style={{ color: '#86868b', marginTop: '8px' }}>Quản lý đơn hàng và sở thích của bạn.</p>
            </div>

            {error && <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#e03e3e' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1d1d1f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Địa chỉ Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '16px', background: '#f5f5f7', border: '1.5px solid transparent', borderRadius: '14px', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                  onFocus={e => { e.target.style.borderColor = '#0071e3'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f7'; }} />
              </div>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mật khẩu</label>
                  <Link to="/forgot-password" style={{ fontSize: '12px', color: '#0066cc', textDecoration: 'none' }}>Quên mật khẩu?</Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '16px', background: '#f5f5f7', border: '1.5px solid transparent', borderRadius: '14px', fontSize: '16px', outline: 'none', transition: 'all 0.3s' }}
                  onFocus={e => { e.target.style.borderColor = '#0071e3'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f7'; }} />
              </div>

              <button type="submit" disabled={loading} className="apple-btn apple-btn-dark"
                style={{ width: '100%', padding: '16px', fontSize: '17px', borderRadius: '14px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {loading ? 'Đang xác thực...' : 'Vào tài khoản'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            <div style={{ marginTop: '40px', textAlign: 'center', pt: '40px', borderTop: '1px solid #f5f5f7' }}>
              <p style={{ fontSize: '15px', color: '#6e6e73' }}>
                Chưa phải là thành viên? <Link to="/register" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 600 }}>Tạo ID mới</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
