import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MapPin, CreditCard, Check, AlertCircle } from 'lucide-react';
import API from '../api/client';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', district: '', ward: '' });
  const [payment, setPayment] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) setAddress(a => ({
      ...a,
      fullName: a.fullName || user.name || '',
      phone: a.phone || user.phone || '',
    }));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0 && !order) return <Navigate to="/cart" replace />;

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = 'Vui lòng nhập họ và tên';
    if (!address.phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9+\-() ]{8,15}$/.test(address.phone.trim())) errs.phone = 'Số điện thoại không hợp lệ';
    if (!address.street.trim()) errs.street = 'Vui lòng nhập địa chỉ';
    if (!address.city.trim()) errs.city = 'Vui lòng nhập thành phố';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check cart items have valid IDs
    const invalidItems = items.filter(i => !i.id);
    if (invalidItems.length > 0) {
      setError('Một số sản phẩm trong giỏ hàng không hợp lệ. Vui lòng xóa giỏ hàng và thêm lại.');
      return;
    }

    setError(''); setLoading(true);
    try {
      const res = await API.post('/orders', {
        items: items.map(i => ({
          product: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          color: i.color,
          storage: i.storage,
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
      });
      setOrder(res.data.data);
      clearCart();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đặt hàng';
      setError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setLoading(false); }
  };

  if (order) return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '0 22px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Check size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1d1d1f' }}>Đã xác nhận đơn hàng!</h1>
        <p style={{ fontSize: '17px', color: '#6e6e73', marginTop: '8px' }}>Đơn hàng biểu số #{order.orderNumber}</p>
        <p style={{ fontSize: '15px', color: '#86868b', marginTop: '12px' }}>Cảm ơn bạn đã mua hàng. Chúng tôi sẽ sớm gửi cho bạn một email xác nhận.</p>
        <Link to="/" style={{ display: 'inline-block', marginTop: '28px', padding: '14px 28px', background: '#0071e3', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    </main>
  );

  const inputStyle = (field) => ({
    width: '100%', padding: '12px 16px',
    border: fieldErrors[field] ? '2px solid #ff3b30' : '1.5px solid #d2d2d7',
    borderRadius: '12px', fontSize: '15px', outline: 'none',
    transition: 'border-color 0.2s',
  });



  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#1d1d1f', textAlign: 'center', marginBottom: '40px' }}>Thanh toán</h1>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', fontSize: '14px', color: '#e03e3e' }}>
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          <div>
            {/* Address */}
            <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}><MapPin size={18} /> Địa chỉ giao hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[['fullName', 'Họ và tên *'], ['phone', 'Số điện thoại *'], ['street', 'Địa chỉ *'], ['city', 'Thành phố *'], ['district', 'Quận/Huyện'], ['ward', 'Phường/Xã']].map(([k, label]) => (
                  <div key={k} style={{ gridColumn: ['street'].includes(k) ? '1 / -1' : undefined }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>{label}</label>
                    <input
                      style={inputStyle(k)}
                      value={address[k] || ''}
                      onChange={e => {
                        setAddress(a => ({ ...a, [k]: e.target.value }));
                        if (fieldErrors[k]) setFieldErrors(fe => { const n = { ...fe }; delete n[k]; return n; });
                      }}
                      onFocus={e => { if (!fieldErrors[k]) e.target.style.borderColor = '#0071e3'; }}
                      onBlur={e => { if (!fieldErrors[k]) e.target.style.borderColor = '#d2d2d7'; }}
                    />
                    {fieldErrors[k] && <span style={{ fontSize: '12px', color: '#ff3b30', marginTop: '4px', display: 'block' }}>{fieldErrors[k]}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div style={{ background: '#fff', borderRadius: '18px', padding: '28px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}><CreditCard size={18} /> Phương thức thanh toán</h3>
              {[['cod', 'Thanh toán khi nhận hàng', '💵'], ['credit_card', 'Thẻ tín dụng', '💳'], ['bank_transfer', 'Chuyển khoản ngân hàng', '🏦']].map(([val, label, icon]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: payment === val ? '2px solid #0071e3' : '1.5px solid #e8e8ed', marginBottom: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <input type="radio" name="payment" value={val} checked={payment === val} onChange={() => setPayment(val)} style={{ accentColor: '#0071e3' }} />
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: '#1d1d1f' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Tóm tắt đơn hàng</h3>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', color: '#1d1d1f' }}>
                <span style={{ flex: 1, paddingRight: '8px' }}>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #e8e8ed', marginTop: '12px', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}><span>Tạm tính</span><span>${subtotal.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#34c759', marginBottom: '8px' }}><span>Vận chuyển</span><span>Miễn phí</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#86868b', marginBottom: '12px' }}><span>Thuế (9%)</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div style={{ borderTop: '1px solid #e8e8ed', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
              <span>Tổng cộng</span><span>${total.toFixed(2)}</span>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', marginTop: '20px', padding: '16px', background: loading ? '#86868b' : '#0071e3', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
            <p style={{ fontSize: '12px', color: '#86868b', textAlign: 'center', marginTop: '12px' }}>Bằng cách đặt hàng, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
