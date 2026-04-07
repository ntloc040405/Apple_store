import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, tax, total } = useCart();

  if (items.length === 0) {
    return (
      <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '0 22px' }}>
          <ShoppingBag size={80} color="#d2d2d7" strokeWidth={1} style={{ marginBottom: '32px' }} />
          <h2 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '16px' }}>Túi của bạn đang trống.</h2>
          <p style={{ fontSize: '21px', color: '#6e6e73', marginBottom: '40px' }}>Những điều tuyệt vời đang chờ bạn tại cửa hàng.</p>
          <Link to="/store" className="apple-btn apple-btn-primary" style={{ padding: '16px 32px', fontSize: '17px' }}>
            Bắt đầu mua sắm <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 22px' }}>
        <header style={{ marginBottom: '60px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.03em' }}>Túi đồ.</h1>
          <p style={{ fontSize: '21px', color: '#6e6e73', marginTop: '12px' }}>Kiểm tra lại các lựa chọn của bạn trước khi hoàn tất.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '60px', alignItems: 'start' }}>
          {/* List of Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {items.map((item, i) => (
              <motion.div 
                key={`${item._id}-${i}`} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', gap: '32px', paddingBottom: '40px', borderBottom: '1px solid #f5f5f7' }}
              >
                <div style={{ width: '180px', height: '180px', borderRadius: '24px', background: '#fbfbfb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {item.thumbnail && <img src={item.thumbnail} alt={item.name} style={{ maxHeight: '140px', maxWidth: '140px', objectFit: 'contain' }} />}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Link to={`/product/${item.slug}`} style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f', textDecoration: 'none', lineHeight: 1.2 }}>{item.name}</Link>
                      <span style={{ fontSize: '20px', fontWeight: 600 }}>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '15px', color: '#86868b', marginTop: '8px' }}>{[item.color?.name, item.storage?.capacity].filter(Boolean).join(' — ')}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f7', borderRadius: '100px', padding: '4px' }}>
                      <button onClick={() => updateQuantity(i, Math.max(1, item.quantity - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                      <span style={{ padding: '0 12px', fontSize: '15px', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(i, item.quantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkout Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(251,251,253,0.8)', 
              backdropFilter: 'blur(20px)', 
              borderRadius: '32px', 
              padding: '40px', 
              position: 'sticky', 
              top: '100px',
              border: '1px solid #f5f5f7'
            }}
          >
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Tổng kết.</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ color: '#6e6e73' }}>Tạm tính</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ color: '#6e6e73' }}>Vận chuyển</span>
                <span style={{ color: '#34c759', fontWeight: 600 }}>Miễn phí</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ color: '#6e6e73' }}>Thuế</span>
                <span style={{ fontWeight: 600 }}>${tax.toFixed(2).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #d2d2d7', paddingTop: '24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <span style={{ fontSize: '21px', fontWeight: 700 }}>Tổng cộng</span>
               <span style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>${total.toLocaleString()}</span>
            </div>

            <Link to="/checkout" className="apple-btn apple-btn-primary" 
              style={{ width: '100%', padding: '20px', borderRadius: '100px', fontSize: '17px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              Thanh toán <ArrowRight size={20} />
            </Link>
            
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#86868b', marginTop: '24px', lineHeight: 1.5 }}>
              Giao hàng miễn phí cho mọi đơn hàng. <br/> Đổi trả dễ dàng trong 14 ngày.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
