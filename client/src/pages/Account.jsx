import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, MapPin, LogOut, ChevronRight } from 'lucide-react';
import API from '../api/client';

const STATUS_LABELS = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao hàng', delivered: 'Đã giao hàng', cancelled: 'Đã hủy' };
const STATUS_COLORS = { pending: '#ff9f0a', confirmed: '#0071e3', shipping: '#af52de', delivered: '#34c759', cancelled: '#ff3b30' };

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) setProfile({ name: user.name, phone: user.phone || '' });
  }

  const [prevTab, setPrevTab] = useState(tab);
  if (tab !== prevTab) {
    setPrevTab(tab);
    if (tab === 'orders') setLoading(true);
  }

  useEffect(() => {
    let isMounted = true;
    if (tab === 'orders' && user) {
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
  }, [tab, user]); // Still depends on tab/user but setLoading is handled in render phase for tab changes

  if (!user) return <Navigate to="/login" replace />;

  const handleProfileSave = async () => {
    try {
      const res = await API.put('/auth/profile', profile);
      updateUser(res.data.data);
      setMsg('Đã cập nhật hồ sơ!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg(err.response?.data?.message || 'Lỗi'); }
  };

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: User },
    { key: 'orders', label: 'Đơn hàng của tôi', icon: Package },
  ];

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0071e3, #af52de)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1d1d1f' }}>Xin chào, {user.name} 👋</h1>
            <p style={{ fontSize: '14px', color: '#86868b' }}>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', border: 'none', background: tab === t.key ? '#1d1d1f' : '#fff', color: tab === t.key ? '#fff' : '#1d1d1f', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
          <button onClick={logout} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', border: 'none', background: '#fff', color: '#ff3b30', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>

        {/* Profile */}
        {tab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: '18px', padding: '32px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>Thông tin cá nhân</h3>
            {msg && <div style={{ padding: '10px 16px', background: msg.includes('Lỗi') ? '#fff5f5' : '#e8f5e9', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', color: msg.includes('Lỗi') ? '#e03e3e' : '#2e7d32' }}>{msg}</div>}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Họ và tên</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
              <input value={user.email} disabled style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e8e8ed', borderRadius: '12px', fontSize: '15px', background: '#f5f5f7', color: '#86868b' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Số điện thoại</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #d2d2d7', borderRadius: '12px', fontSize: '15px', outline: 'none' }} />
            </div>
            <button onClick={handleProfileSave} style={{ padding: '12px 28px', background: '#0071e3', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Lưu thay đổi</button>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            {loading ? <p style={{ padding: '40px', textAlign: 'center', color: '#86868b' }}>Đang tải đơn hàng...</p> :
              orders.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '18px', padding: '60px', textAlign: 'center' }}>
                  <Package size={48} color="#d2d2d7" />
                  <p style={{ fontSize: '17px', color: '#86868b', marginTop: '16px' }}>Bạn chưa có đơn hàng nào</p>
                  <Link to="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px', color: '#0071e3', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>Bắt đầu mua sắm <ChevronRight size={14} /></Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map(o => (
                    <div key={o._id} style={{ background: '#fff', borderRadius: '18px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <span style={{ fontSize: '16px', fontWeight: 600 }}>Đơn hàng biểu số #{o.orderNumber}</span>
                          <span style={{ fontSize: '13px', color: '#86868b', marginLeft: '12px' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, padding: '4px 12px', borderRadius: '100px', color: STATUS_COLORS[o.status], background: `${STATUS_COLORS[o.status]}15` }}>{STATUS_LABELS[o.status]}</span>
                      </div>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderTop: '1px solid #f5f5f7' }}>
                          <span>{item.name} {item.color ? `(${item.color})` : ''} × {item.quantity}</span>
                          <span style={{ fontWeight: 500 }}>${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600, paddingTop: '12px', borderTop: '1px solid #e8e8ed', marginTop: '8px' }}>
                        <span>Tổng cộng</span><span>${o.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </main>
  );
}
