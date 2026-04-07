import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { MapPin, CreditCard, Check, AlertCircle, ArrowLeft, ShieldCheck, ChevronRight, Truck, Info } from 'lucide-react';
import API from '../api/client';

// ── Components ──


const FormField = ({ label, id, value, onChange, error, type = 'text', placeholder, ...props }) => (
  <div style={{ marginBottom: '24px' }}>
    <label 
      htmlFor={id} 
      style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px', marginLeft: '4px' }}
    >
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '16px 20px', borderRadius: '14px', background: '#fff', 
          border: error ? '1.5px solid #ff3b30' : '1.5px solid #d2d2d7',
          fontSize: '17px', color: '#1d1d1f', outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = '#0071e3'; e.target.style.boxShadow = '0 0 0 4px rgba(0,113,227,0.1)'; }}
        onBlur={(e) => { if (!error) e.target.style.borderColor = '#d2d2d7'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff3b30', fontSize: '12px', marginTop: '6px', fontWeight: 500, marginLeft: '4px' }}
          >
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

const PriceRow = ({ label, value, bold = false, success = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
    <span style={{ fontSize: '15px', color: '#86868b', fontWeight: bold ? 600 : 400 }}>{label}</span>
    <span style={{ 
      fontSize: bold ? '17px' : '15px', 
      fontWeight: bold ? 700 : 600, 
      color: success ? '#34c759' : '#1d1d1f' 
    }}>
      {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
    </span>
  </div>
);

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', district: '', ward: '' });
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) setAddress(a => ({
      ...a,
      fullName: a.fullName || user.name || '',
      phone: a.phone || user.phone || '',
    }));
  }, [user]);

  // Derived Values
  const shippingFee = subtotal > 1000 ? 0 : 15;
  const displayTotal = total + shippingFee;

  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0 && !order) return <Navigate to="/cart" replace />;

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!address.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9+\-() ]{8,15}$/.test(address.phone.trim())) errs.phone = 'Số điện thoại không hợp lệ';
    if (!address.street.trim()) errs.street = 'Vui lòng nhập địa chỉ cụ thể';
    if (!address.city.trim()) errs.city = 'Vui lòng nhập tỉnh thành';
    return errs;
  };

  const handleFieldChange = (field, val) => {
    setAddress(prev => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setServerError('Vui lòng kiểm tra lại thông tin giao hàng.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setServerError(''); 
    setLoading(true);
    
    try {
      const payload = {
        items: items.map(i => ({
          product: i.id || i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          color: i.color,
          storage: i.storage,
          thumbnail: i.thumbnail || i.image
        })),
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          district: address.district.trim(),
          ward: address.ward.trim(),
        },
        paymentMethod: payment,
      };

      const res = await API.post('/orders', payload);
      if (res.data.success) {
        setOrder(res.data.data);
        clearCart();
      }
    } catch (err) {
      console.error('Checkout error:', err.response?.data || err.message);
      setServerError(err.response?.data?.message || 'Giao dịch không thành công. Vui lòng thử lại sau.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { 
      setLoading(false); 
    }
  };

  // ── Success State ──
  if (order) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}
      >
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <Check size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>Cảm ơn bạn đã đặt hàng.</h1>
        <p style={{ fontSize: '19px', color: '#86868b', lineHeight: 1.5, marginBottom: '32px' }}>
          Mã đơn hàng: <span style={{ color: '#1d1d1f', fontWeight: 600 }}>#{order.orderNumber}</span>. 
          Chúng tôi đã gửi email xác nhận cho bạn.
        </p>
        <div style={{ background: '#f5f5f7', borderRadius: '20px', padding: '24px', textAlign: 'left', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <Truck size={20} color="#0071e3" />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Dự kiến giao hàng</span>
          </div>
          <p style={{ fontSize: '15px', color: '#424245' }}>Đơn hàng của bạn đang được xử lý và sẽ được giao trong vòng 2-4 ngày làm việc.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/" style={{ padding: '16px', borderRadius: '12px', background: '#0071e3', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '17px' }}>Tiếp tục mua sắm</Link>
          <Link to="/account" style={{ padding: '16px', borderRadius: '12px', color: '#0071e3', textDecoration: 'none', fontWeight: 500, fontSize: '16px' }}>Xem lịch sử đơn hàng</Link>
        </div>
      </motion.div>
    </main>
  );

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px 100px' }}>
        <header style={{ marginBottom: '48px' }}>
          <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0066cc', textDecoration: 'none', fontSize: '15px', fontWeight: 500, marginBottom: '24px', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Quay lại giỏ hàng
          </Link>
          <h1 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: '#1d1d1f' }}>Thanh toán.</h1>
        </header>

        {serverError && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderLeft: '4px solid #ff3b30', borderRadius: '12px', padding: '20px', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <AlertCircle size={20} color="#ff3b30" />
            <span style={{ fontWeight: 600, color: '#1d1d1f' }}>{serverError}</span>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '60px', alignItems: 'start' }}>
          {/* Main Checkout Flow */}
          <div style={{ display: 'grid', gap: '40px' }}>
            
            {/* Step 1: Shipping */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1d1d1f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700 }}>1</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Địa chỉ giao hàng</h2>
              </div>
              
              <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                  <div style={{ gridColumn: 'span 1' }}>
                    <FormField label="Họ tên" id="fullName" value={address.fullName} onChange={e => handleFieldChange('fullName', e.target.value)} error={fieldErrors.fullName} placeholder="Nguyễn Văn A" />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <FormField label="Số điện thoại" id="phone" value={address.phone} onChange={e => handleFieldChange('phone', e.target.value)} error={fieldErrors.phone} placeholder="0901234567" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <FormField label="Địa chỉ" id="street" value={address.street} onChange={e => handleFieldChange('street', e.target.value)} error={fieldErrors.street} placeholder="Số nhà, tên đường..." />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <FormField label="Tỉnh / Thành phố" id="city" value={address.city} onChange={e => handleFieldChange('city', e.target.value)} error={fieldErrors.city} placeholder="VD: Hà Nội" />
                  </div>
                  <div style={{ gridColumn: 'span 1' }}>
                    <FormField label="Quận / Huyện (Tùy chọn)" id="district" value={address.district} onChange={e => handleFieldChange('district', e.target.value)} placeholder="VD: Cầu Giấy" />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Payment */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1d1d1f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700 }}>2</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Phương thức thanh toán</h2>
              </div>

              <div style={{ background: '#fff', borderRadius: '24px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                {[
                  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵', desc: 'Thanh toán bằng tiền mặt khi shipper giao hàng đến.' },
                  { id: 'bank_transfer', label: 'Chuyển khoản ngân hàng', icon: '🏦', desc: 'Chuyển khoản qua ứng dụng ngân hàng hoặc QR Code.' },
                  { id: 'apple_pay', label: 'Apple Pay', icon: '', desc: 'Thanh toán nhanh chóng và bảo mật với Apple Pay.', disabled: true }
                ].map((pm) => {
                  const active = payment === pm.id;
                  return (
                    <div 
                      key={pm.id}
                      onClick={() => !pm.disabled && setPayment(pm.id)}
                      style={{
                        padding: '24px', borderRadius: '14px', cursor: pm.disabled ? 'not-allowed' : 'pointer',
                        background: active ? '#f5f5f7' : 'transparent',
                        opacity: pm.disabled ? 0.5 : 1, transition: 'all 0.2s',
                        display: 'flex', gap: '20px', alignItems: 'center'
                      }}
                    >
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', border: active ? '7px solid #0071e3' : '2px solid #d2d2d7',
                        transition: 'all 0.2s', flexShrink: 0 
                      }} />
                      <div style={{ fontSize: '28px' }}>{pm.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '17px', color: '#1d1d1f' }}>{pm.label}</div>
                        <div style={{ fontSize: '14px', color: '#86868b', marginTop: '2px' }}>{pm.desc}</div>
                      </div>
                      {pm.disabled && <span style={{ fontSize: '11px', fontWeight: 700, color: '#86868b', background: '#e8e8ed', padding: '4px 8px', borderRadius: '6px' }}>SẮP CÓ</span>}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Tóm tắt đơn hàng</h3>
              
              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }} className="custom-scrollbar">
                {items.map(item => (
                  <div key={item.id || item._id} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', p: '8px', flexShrink: 0 }}>
                      <img src={item.image || item.thumbnail} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: '13px', color: '#86868b' }}>SL: {item.quantity} • {item.color || 'Mặc định'}</p>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f5f5f7', paddingTop: '24px' }}>
                <PriceRow label="Tạm tính" value={subtotal} />
                <PriceRow label="Vận chuyển" value={shippingFee === 0 ? 'Miễn phí' : shippingFee} success={shippingFee === 0} />
                <PriceRow label="Thuế ước tính" value={tax || 0} />
                
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #d2d2d7', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>Tổng cộng</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#1d1d1f' }}>${displayTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`apple-btn-primary`}
                style={{ 
                  width: '100%', marginTop: '32px', height: '58px', borderRadius: '16px', fontSize: '17px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  background: loading ? '#86868b' : '#0071e3', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {loading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="dot-pulse" /> Đang xử lý...
                  </motion.div>
                ) : (
                  <>Xác nhận đặt hàng <ChevronRight size={18} /></>
                )}
              </button>

              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '12px', background: '#f5f5f7', borderRadius: '12px' }}>
                <ShieldCheck size={18} color="#34c759" />
                <span style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: 500 }}>Thanh toán an toàn 100%</span>
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', color: '#86868b', fontSize: '12px', lineHeight: 1.4 }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Bằng cách hoàn tất đặt hàng, bạn đồng ý với các điều khoản dịch vụ của Apple.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .dot-pulse {
          position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: #fff; color: #fff;
          animation: dot-pulse 1.5s infinite linear;
        }
        .dot-pulse::before, .dot-pulse::after { content: ''; display: inline-block; position: absolute; top: 0; width: 6px; height: 6px; border-radius: 5px; background-color: #fff; color: #fff; }
        .dot-pulse::before { left: -10px; animation: dot-pulse-before 1.5s infinite linear; }
        .dot-pulse::after { left: 10px; animation: dot-pulse-after 1.5s infinite linear; }
        @keyframes dot-pulse-before { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes dot-pulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes dot-pulse-after { 0% { opacity: 0; } 70% { opacity: 1; } 100% { opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d2d2d7; border-radius: 10px; }
      `}</style>
    </main>
  );
}
