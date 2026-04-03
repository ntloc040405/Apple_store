import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, itemCount, subtotal, tax, total } = useCart();

  if (items.length === 0) {
    return (
      <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7' }}>
        <div style={{ textAlign: 'center' }}>
          <ShoppingBag size={64} color="#d2d2d7" strokeWidth={1} />
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', marginTop: '20px' }}>Túi hàng của bạn đang trống.</h2>
          <p style={{ fontSize: '17px', color: '#6e6e73', marginTop: '8px' }}>Khám phá các sản phẩm bạn yêu thích tại cửa hàng.</p>
          <Link to="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '24px', padding: '14px 28px', background: '#0071e3', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>
            <ShoppingBag size={18} /> Mua sắm ngay
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 600, color: '#1d1d1f', textAlign: 'center', marginBottom: '8px' }}>Túi hàng của bạn</h1>
        <p style={{ textAlign: 'center', color: '#6e6e73', fontSize: '17px', marginBottom: '40px' }}>{itemCount} sản phẩm</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', padding: '24px', background: '#fff', borderRadius: i === 0 ? '18px 18px 0 0' : i === items.length - 1 ? '0 0 18px 18px' : '0' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.thumbnail && <img src={item.thumbnail} alt={item.name} style={{ maxHeight: '80px', objectFit: 'contain' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.slug}`} style={{ fontSize: '17px', fontWeight: 600, color: '#1d1d1f', textDecoration: 'none' }}>{item.name}</Link>
                  <p style={{ fontSize: '13px', color: '#86868b', marginTop: '4px' }}>{[item.color, item.storage].filter(Boolean).join(' · ')}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d2d2d7', borderRadius: '8px' }}>
                      <button onClick={() => updateQuantity(i, item.quantity - 1)} style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ padding: '0 8px', fontSize: '14px', fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(i, item.quantity + 1)} style={{ padding: '6px 10px', border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(i)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#0071e3', cursor: 'pointer', fontSize: '14px' }}>
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '17px', fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: '#fff', borderRadius: '18px', padding: '28px', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f', marginBottom: '20px' }}>Tóm tắt đơn hàng</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#1d1d1f', marginBottom: '12px' }}>
              <span>Tạm tính</span><span>${subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#6e6e73', marginBottom: '12px' }}>
              <span>Vận chuyển</span><span style={{ color: '#34c759' }}>Miễn phí</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#6e6e73', marginBottom: '20px' }}>
              <span>Thuế</span><span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid #e8e8ed', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700, color: '#1d1d1f' }}>
              <span>Tổng cộng</span><span>${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', padding: '16px', background: '#0071e3', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>
              Thanh toán <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
