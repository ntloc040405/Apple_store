import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Check, ChevronRight, ShoppingBag, Heart, GitCompareArrows } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../api/client';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setLoading(true);
    setAdded(false);
  }

  useEffect(() => {
    let isMounted = true;
    API.get(`/products/${slug}`).then(res => {
      if (!isMounted) return;
      const p = res.data.data;
      setProduct(p);
      setSelectedColor(p.colors?.[0] || null);
      setSelectedStorage(p.storageOptions?.[0] || null);
      if (p._id) API.get(`/products/${p._id}/related`).then(r => {
        if (isMounted) setRelated(r.data.data || []);
      }).catch(() => {});
    }).catch(console.error).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) return <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#86868b' }}>Đang tải...</p></main>;
  if (!product) return <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Không tìm thấy sản phẩm</p></main>;

  const price = (product.salePrice || product.price) + (selectedStorage?.priceAdd || 0);

  const handleAdd = () => {
    addItem(product, selectedColor, selectedStorage);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main style={{ paddingTop: '44px' }}>
      {/* Hero */}
      <section style={{ width: '100%', background: '#fafafa' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            {product.thumbnail && <img src={product.thumbnail} alt={product.name} style={{ maxHeight: '360px', maxWidth: '100%', objectFit: 'contain' }} />}
          </div>
          <div>
            {product.isNewProduct && <span style={{ fontSize: '14px', fontWeight: 500, color: '#bf4800' }}>Mới</span>}
            <h1 style={{ fontSize: '40px', fontWeight: 600, lineHeight: 1.1, color: '#1d1d1f', margin: '4px 0 8px' }}>{product.name}</h1>
            <p style={{ fontSize: '17px', color: '#6e6e73', lineHeight: 1.4 }}>{product.tagline}</p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < Math.round(product.rating) ? '#ff9500' : 'none'} color={i < Math.round(product.rating) ? '#ff9500' : '#d2d2d7'} />)}
              </div>
              <span style={{ fontSize: '13px', color: '#86868b' }}>{product.rating} ({product.reviewCount} đánh giá)</span>
            </div>

            {/* Price */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f' }}>${price.toLocaleString()}</span>
              {product.salePrice && <span style={{ fontSize: '16px', color: '#86868b', textDecoration: 'line-through', marginLeft: '8px' }}>${product.price.toLocaleString()}</span>}
              {product.monthlyPrice && <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>hoặc ${product.monthlyPrice}/tháng trong 24 tháng</p>}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>Màu sắc — <span style={{ fontWeight: 400, color: '#6e6e73' }}>{selectedColor?.name}</span></p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c)}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.hex, border: selectedColor?.name === c.name ? '2px solid #0071e3' : '2px solid transparent', outline: selectedColor?.name === c.name ? '2px solid #0071e3' : 'none', outlineOffset: '2px', cursor: 'pointer', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Storage */}
            {product.storageOptions?.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>Dung lượng</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.storageOptions.map(s => (
                    <button key={s.capacity} onClick={() => setSelectedStorage(s)}
                      style={{ padding: '10px 20px', borderRadius: '12px', border: selectedStorage?.capacity === s.capacity ? '2px solid #0071e3' : '1.5px solid #d2d2d7', background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#1d1d1f', transition: 'border-color 0.2s' }}>
                      {s.capacity}
                      {s.priceAdd > 0 && <span style={{ display: 'block', fontSize: '11px', color: '#86868b' }}>+${s.priceAdd}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to bag */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button onClick={handleAdd} disabled={product.stock <= 0}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: added ? '#34c759' : '#0071e3', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: product.stock > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.3s' }}>
                {added ? <><Check size={18} /> Đã thêm!</> : product.stock > 0 ? <><ShoppingBag size={18} /> Thêm vào giỏ hàng</> : 'Hết hàng'}
              </button>
              <button onClick={() => addToCompare(product)}
                style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: isInCompare(product._id) ? '2px solid #0071e3' : '1.5px solid #d2d2d7', background: isInCompare(product._id) ? '#e8f4fd' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                title={isInCompare(product._id) ? 'Đã thêm vào so sánh' : 'Thêm vào so sánh'}>
                <GitCompareArrows size={20} color={isInCompare(product._id) ? '#0071e3' : '#1d1d1f'} />
              </button>
              <button onClick={async () => {
                  const result = await toggleWishlist(product._id);
                  if (result.needLogin) navigate('/login');
                }}
                style={{ width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: isInWishlist(product._id) ? '2px solid #ff2d55' : '1.5px solid #d2d2d7', background: isInWishlist(product._id) ? '#fff0f3' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}
                title={isInWishlist(product._id) ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}>
                <Heart size={20} color="#ff2d55" fill={isInWishlist(product._id) ? '#ff2d55' : 'none'} />
              </button>
            </div>
            {product.stock > 0 && product.stock <= 10 && <p style={{ fontSize: '13px', color: '#bf4800', marginTop: '8px' }}>Chỉ còn {product.stock} sản phẩm trong kho</p>}
          </div>
        </div>
      </section>

      {/* Specs */}
      {product.specs && Object.keys(product.specs).some(k => product.specs[k]) && (
        <section style={{ width: '100%', background: '#fff' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', marginBottom: '32px', textAlign: 'center' }}>Thông số kỹ thuật</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
              {Object.entries(product.specs).filter(([, v]) => v).map(([key, val]) => (
                <div key={key} style={{ textAlign: 'center', padding: '24px', background: '#f5f5f7', borderRadius: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#86868b', textTransform: 'capitalize', marginBottom: '6px' }}>{key}</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlights */}
      {product.highlights?.length > 0 && (
        <section style={{ width: '100%', background: '#f5f5f7' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', marginBottom: '24px' }}>Đặc điểm nổi bật</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {product.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', background: '#fff', borderRadius: '14px' }}>
                  <Check size={18} color="#34c759" />
                  <span style={{ fontSize: '15px', color: '#1d1d1f' }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', marginBottom: '24px' }}>Có thể bạn cũng thích</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {related.map(p => (
              <Link key={p._id} to={`/product/${p.slug}`}
                style={{ display: 'block', background: '#f5f5f7', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '120px', objectFit: 'contain' }} />}
                </div>
                <div style={{ padding: '12px 16px 16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                  <p style={{ fontSize: '13px', color: '#1d1d1f', marginTop: '4px' }}>${p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
