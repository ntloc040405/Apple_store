import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import API from '../api/client';

export default function Wishlist() {
  const { user } = useAuth();
  const { toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Fixed cascading setState by wrapping in timeout
      setTimeout(() => setLoading(false), 0);
      return;
    }

    let isMounted = true;
    const fetchWishlist = async () => {
      try {
        const res = await API.get('/wishlist');
        if (isMounted) setProducts(res.data.data || []);
      } catch {
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWishlist();
    return () => { isMounted = false; };
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handleAddToBag = (product) => {
    addItem(product, product.colors?.[0] || null, product.storageOptions?.[0] || null);
  };

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', background: '#f5f5f7' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#1d1d1f' }}>
            <Heart size={28} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#ff2d55' }} />
            Danh sách yêu thích
          </h1>
          <p style={{ fontSize: '15px', color: '#86868b', marginTop: '6px' }}>
            {products.length} sản phẩm đã lưu
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>Đang tải...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '56px', marginBottom: '16px' }}>💝</p>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f' }}>Danh sách yêu thích của bạn đang trống</h2>
            <p style={{ fontSize: '15px', color: '#86868b', marginTop: '8px' }}>
              Hãy xem các sản phẩm của chúng tôi và nhấn vào biểu tượng trái tim để lưu các sản phẩm yêu thích.
            </p>
            <Link to="/store" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '24px', padding: '12px 24px', background: '#0071e3', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
              Bắt đầu mua sắm <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p._id} style={{ background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #e8e8ed', transition: 'box-shadow 0.3s, transform 0.3s', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {/* Remove button */}
                <button onClick={() => handleRemove(p._id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  title="Xóa khỏi danh sách yêu thích">
                  <Trash2 size={14} color="#ff3b30" />
                </button>

                <Link to={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>
                    {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '160px', objectFit: 'contain' }} />}
                  </div>
                </Link>

                <div style={{ padding: '16px 20px 20px' }}>
                  <Link to={`/product/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                    <p style={{ fontSize: '13px', color: '#6e6e73', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.tagline}</p>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>
                        {p.salePrice ? <><span style={{ color: '#bf4800' }}>${p.salePrice.toLocaleString()}</span> <span style={{ textDecoration: 'line-through', color: '#86868b', fontSize: '13px' }}>${p.price.toLocaleString()}</span></> : `$${p.price?.toLocaleString()}`}
                      </p>
                      {p.monthlyPrice && <p style={{ fontSize: '11px', color: '#6e6e73' }}>hoặc ${p.monthlyPrice}/tháng</p>}
                    </div>
                    <button onClick={() => handleAddToBag(p)}
                      disabled={p.stock <= 0}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: p.stock > 0 ? '#0071e3' : '#d2d2d7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: p.stock > 0 ? 'pointer' : 'not-allowed' }}>
                      <ShoppingBag size={13} />
                      {p.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                    </button>
                  </div>

                  {/* Rating */}
                  {p.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                      <span style={{ color: '#ff9500', fontSize: '12px' }}>★</span>
                      <span style={{ fontSize: '12px', color: '#86868b' }}>{p.rating.toFixed(1)} ({p.reviewCount})</span>
                    </div>
                  )}

                  {/* Colors */}
                  {p.colors?.length > 1 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      {p.colors.slice(0, 6).map(c => <span key={c.name} style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #d2d2d7', background: c.hex }} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
