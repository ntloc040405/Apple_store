import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { User, Package, LogOut, ChevronRight, Bell } from 'lucide-react';
import API from '../api/client';

const STATUS_LABELS = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao hàng', delivered: 'Đã giao hàng', cancelled: 'Đã hủy' };
const STATUS_COLORS = { pending: '#ff9f0a', confirmed: '#0071e3', shipping: '#af52de', delivered: '#34c759', cancelled: '#ff3b30' };

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  }));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (tab === 'orders' && user) {
      // Data fetching is already async, the warning is likely due to the sync UI trigger 
      // We keep the fetch logic but ensure it's robust
      API.get('/orders/my').then(r => {
        const d = r.data.data;
        if (isMounted) setOrders(Array.isArray(d) ? d : d.orders || []);
      }).catch(() => {
        if (isMounted) setOrders([]);
      }).finally(() => {
        if (isMounted) setLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [tab, user]);

  if (!user) return <Navigate to="/login" replace />;

  const handleProfileSave = async () => {
    const newErrors = {};
    
    // Validate name
    if (!profile.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (profile.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    } else if (profile.name.trim().length > 50) {
      newErrors.name = 'Tên không được vượt quá 50 ký tự';
    }

    // Validate phone (optional, nhưng nếu có thì phải hợp lệ)
    if (profile.phone && !/^\d{10,11}$/.test(profile.phone.replaceAll(/[-()\s]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const res = await API.put('/auth/profile', profile);
      updateUser(res.data.data);
      setMsg({ text: 'Hồ sơ đã được cập nhật thành công.', type: 'success' });
      setEditMode(false);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) { 
      setMsg({ text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.', type: 'error' }); 
    }
  };

  const handleCancel = () => {
    setProfile({ name: user.name, phone: user.phone || '' });
    setErrors({});
    setEditMode(false);
  };

  const tabs = [
    { key: 'profile', label: 'Tài khoản', icon: User },
    { key: 'orders', label: 'Đơn hàng', icon: Package }
  ];

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
      <header style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 22px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.03em' }}
            >
              ID Apple.
            </motion.h1>
            <p style={{ fontSize: '19px', color: '#86868b', marginTop: '8px' }}>Quản lý thông tin và trải nghiệm Apple của bạn.</p>
          </div>
          <button onClick={logout} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '40px', border: '1px solid #d2d2d7', background: 'transparent', color: '#ff3b30', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Đăng xuất <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 22px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '48px' }}>
        <aside>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button 
                  key={t.key} 
                  onClick={() => setTab(t.key)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderRadius: '12px', border: 'none', 
                    background: isActive ? '#fff' : 'transparent', color: isActive ? '#0071e3' : '#1d1d1f', 
                    fontSize: '16px', fontWeight: isActive ? 600 : 500, cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>

        <section>
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'grid', gap: '24px' }}
              >
                <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700 }}>Thông tin cá nhân</h3>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f', fontSize: '32px', fontWeight: 800 }}>{user.name?.[0]?.toUpperCase()}</div>
                  </div>

                  {msg && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '16px', background: msg.type === 'error' ? '#fff5f5' : '#f0f9ff', borderRadius: '12px', marginBottom: '32px', fontSize: '14px', color: msg.type === 'error' ? '#e03e3e' : '#0071e3', border: '1px solid', borderColor: msg.type === 'error' ? '#ffc9c9' : '#0071e330', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bell size={18} /> {msg.text}
                    </motion.div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                    <div>
                      <label htmlFor="name" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#86868b', marginBottom: '8px', textTransform: 'uppercase' }}>Họ và tên</label>
                      <input id="name" disabled={!editMode} value={profile.name} onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setErrors(err => ({ ...err, name: '' })); }}
                        style={{ width: '100%', padding: '14px 18px', border: errors.name ? '2px solid #ff3b30' : '1px solid #d2d2d7', borderRadius: '14px', fontSize: '16px', outline: 'none', transition: 'border 0.2s', background: editMode ? '#fff' : '#fbfbfd', color: editMode ? '#1d1d1f' : '#86868b', cursor: editMode ? 'text' : 'not-allowed', opacity: editMode ? 1 : 0.6 }} />
                      {errors.name && <p style={{ fontSize: '13px', color: '#ff3b30', marginTop: '6px' }}>{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#86868b', marginBottom: '8px', textTransform: 'uppercase' }}>Số điện thoại</label>
                      <input id="phone" disabled={!editMode} value={profile.phone} onChange={e => { setProfile(p => ({ ...p, phone: e.target.value })); setErrors(err => ({ ...err, phone: '' })); }}
                        style={{ width: '100%', padding: '14px 18px', border: errors.phone ? '2px solid #ff3b30' : '1px solid #d2d2d7', borderRadius: '14px', fontSize: '16px', outline: 'none', transition: 'border 0.2s', background: editMode ? '#fff' : '#fbfbfd', color: editMode ? '#1d1d1f' : '#86868b', cursor: editMode ? 'text' : 'not-allowed', opacity: editMode ? 1 : 0.6 }} />
                      {errors.phone && <p style={{ fontSize: '13px', color: '#ff3b30', marginTop: '6px' }}>{errors.phone}</p>}
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="email" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#86868b', marginBottom: '8px', textTransform: 'uppercase' }}>Địa chỉ Email</label>
                      <input id="email" value={user.email} disabled style={{ width: '100%', padding: '14px 18px', border: '1px solid #e8e8ed', borderRadius: '14px', fontSize: '16px', background: '#fbfbfd', color: '#86868b' }} />
                      <p style={{ fontSize: '13px', color: '#86868b', marginTop: '6px' }}>Email không thể thay đổi</p>
                    </div>
                  </div>
                  
                  {editMode ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={handleProfileSave} className="apple-btn apple-btn-primary" style={{ padding: '14px 40px', fontSize: '16px', flex: 1 }}>Lưu</button>
                      <button onClick={handleCancel} className="apple-btn" style={{ padding: '14px 40px', fontSize: '16px', flex: 1, background: '#f5f5f7', color: '#1d1d1f', border: 'none' }}>Hủy</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditMode(true)} className="apple-btn apple-btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>Cập nhật ID</button>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {loading && (
                  <div style={{ padding: '100px', textAlign: 'center' }}><div className="animate-spin inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>
                )}
                {!loading && orders.length === 0 && (
                  <div style={{ background: '#fff', borderRadius: '24px', padding: '100px 40px', textAlign: 'center' }}>
                    <Package size={64} color="#d2d2d7" style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: 700 }}>Không tìm thấy đơn hàng.</h3>
                    <p style={{ color: '#86868b', marginTop: '8px', marginBottom: '32px' }}>Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống.</p>
                    <Link to="/store" className="apple-btn apple-btn-primary" style={{ padding: '12px 32px' }}>Bắt đầu mua sắm</Link>
                  </div>
                )}
                {!loading && orders.length > 0 && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {orders.map(o => (
                      <div key={o._id} className="card-premium" style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid transparent', transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <h4 style={{ fontSize: '20px', fontWeight: 700 }}>Order #{o.orderNumber || o._id.slice(-8)}</h4>
                              <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 14px', borderRadius: '40px', color: STATUS_COLORS[o.status], background: `${STATUS_COLORS[o.status]}15`, textTransform: 'capitalize' }}>{STATUS_LABELS[o.status]}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#86868b', marginTop: '6px' }}>{new Date(o.createdAt).toLocaleDateString()} — {o.items?.length || 0} sản phẩm</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '24px', fontWeight: 700 }}>${o.total?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }} className="hide-scrollbar">
                          {o.items?.map((item) => (
                            <div key={item._id || item.productId} style={{ flex: '0 0 80px', height: '80px', background: '#f5f5f7', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={item.name}>
                              <img src={item.image || item.thumbnail} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ marginTop: '24px', pt: '24px', borderTop: '1px solid #f5f5f7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: '14px', color: '#86868b' }}>Phí vận chuyển: Miễn phí</p>
                          <Link to={`/account/orders/${o._id}`} style={{ fontSize: '14px', color: '#0066cc', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>Chi tiết đơn hàng <ChevronRight size={14} /></Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
