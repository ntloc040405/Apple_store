import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import API from '../api/client';

export default function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get(`/categories/${slug}`).catch(() => null),
      API.get(`/products/category/${slug}`).catch(() => ({ data: { data: [] } })),
    ]).then(([catRes, prodRes]) => {
      setCategory(catRes?.data?.data || { name: slug, description: '' });
      setProducts(prodRes.data.data);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#86868b' }}>Đang tải...</p></main>;

  return (
    <main style={{ paddingTop: '44px' }}>
      <section style={{ width: '100%', background: '#f5f5f7' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '80px 22px 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 56px)', fontWeight: 600, color: '#1d1d1f' }}>{category?.name || slug}</h1>
          {category?.description && <p style={{ fontSize: '21px', color: '#6e6e73', marginTop: '8px' }}>{category.description}</p>}
          <Link to={`/shop/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '17px', color: '#2997ff', textDecoration: 'none', marginTop: '16px' }}>
            Mua tất cả {category?.name} <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* Sub-categories */}
      {category?.subCategories?.length > 0 && (
        <section style={{ width: '100%', background: '#fff' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 22px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {category.subCategories.map(sub => (
              <Link key={sub.slug} to={`/shop/${slug}?sub=${sub.slug}`}
                style={{ padding: '10px 20px', background: '#f5f5f7', borderRadius: '100px', textDecoration: 'none', fontSize: '14px', fontWeight: 500, color: '#1d1d1f', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e8ed'}
                onMouseLeave={e => e.currentTarget.style.background = '#f5f5f7'}>
                {sub.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '40px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {products.map(p => (
            <Link key={p._id} to={`/product/${p.slug}`}
              style={{ display: 'block', background: '#f5f5f7', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.3s, transform 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>
                {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '180px', objectFit: 'contain' }} onError={e => { e.target.style.opacity = '0'; }} />}
              </div>
              <div style={{ padding: '16px 20px 24px' }}>
                {p.isNewProduct && <span style={{ fontSize: '12px', fontWeight: 500, color: '#bf4800' }}>Mới</span>}
                <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.tagline}</p>
                <p style={{ fontSize: '14px', color: '#1d1d1f', marginTop: '12px' }}>Từ <strong>${p.price?.toLocaleString()}</strong></p>
                {p.colors?.length > 1 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                    {p.colors.slice(0, 5).map(c => <span key={c.name} style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #d2d2d7', background: c.hex }} />)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        {products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#86868b' }}>
            <p style={{ fontSize: '17px' }}>Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
      </section>
    </main>
  );
}
