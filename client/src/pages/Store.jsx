import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Laptop, Smartphone, Tablet, Watch, Headphones, MapPin, Grid3x3, Glasses } from 'lucide-react';
import API from '../api/client';

const catIcons = { mac: Laptop, iphone: Smartphone, ipad: Tablet, watch: Watch, airpods: Headphones, airtag: MapPin, accessories: Grid3x3, vision: Glasses };

export default function Store() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/categories').catch(() => ({ data: { data: [] } })),
      API.get('/products/featured').catch(() => ({ data: { data: { highlights: [] } } })),
    ]).then(([catsRes, featRes]) => {
      setCategories(catsRes.data.data);
      setFeatured(featRes.data.data.highlights || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#86868b' }}>Đang tải...</p></main>;

  return (
    <main style={{ paddingTop: '44px' }}>
      {/* Hero */}
      <section style={{ width: '100%', background: '#f5f5f7' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '80px 22px 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 64px)', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.015em' }}>Cửa hàng.</h1>
          <p style={{ fontSize: '21px', color: '#6e6e73', marginTop: '8px' }}>Cách tốt nhất để mua các sản phẩm bạn yêu thích.</p>
        </div>
      </section>

      {/* Categories */}
      <section style={{ width: '100%', background: '#fff' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '40px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {categories.map(cat => {
              const Icon = catIcons[cat.slug] || Grid3x3;
              return (
                <Link key={cat._id} to={`/shop/${cat.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: '#f5f5f7', borderRadius: '18px', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <Icon size={28} strokeWidth={1.5} color="#1d1d1f" />
                  <div>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#1d1d1f' }}>{cat.name}</span>
                    <ChevronRight size={14} color="#86868b" style={{ marginLeft: '4px' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ width: '100%' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', padding: '40px 22px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#1d1d1f', marginBottom: '24px' }}>
              <span style={{ color: '#1d1d1f' }}>Nổi bật. </span>
              <span style={{ color: '#6e6e73' }}>Xem các điểm nhấn.</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {featured.map(p => (
                <Link key={p._id} to={`/product/${p.slug}`}
                  style={{ display: 'block', background: '#f5f5f7', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>
                    {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '160px', objectFit: 'contain' }} onError={e => { e.target.style.opacity = '0'; }} />}
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>{p.tagline}</p>
                    <p style={{ fontSize: '14px', color: '#1d1d1f', marginTop: '12px' }}>Từ <strong>${p.price?.toLocaleString()}</strong></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
