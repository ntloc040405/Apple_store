import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, GitCompareArrows } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import API from '../api/client';

export default function ShopCategory() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [catInfo, setCatInfo] = useState(null);
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const { addToCompare, isInCompare } = useCompare();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) setLoading(true);
      try {
        const sortMap = { featured: 'popular', 'price-asc': 'price_asc', 'price-desc': 'price_desc', newest: 'newest' };
        const [catRes, prodRes] = await Promise.all([
          API.get(`/categories/${category}`).catch(() => null),
          API.get('/products', { params: { category, sort: sortMap[sort] || '-isFeatured', limit: 50 } }),
        ]);
        if (isMounted) {
          setCatInfo(catRes?.data?.data || null);
          const d = prodRes.data.data;
          setProducts(Array.isArray(d) ? d : d.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [category, sort]);

  const sub = searchParams.get('sub');
  const filtered = sub ? products.filter(p => p.subCategory === sub) : products;

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh' }}>
      <section style={{ width: '100%', background: '#f5f5f7' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '60px 22px 24px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 600, color: '#1d1d1f' }}>Mua sắm {catInfo?.name || category}</h1>
          <p style={{ fontSize: '17px', color: '#6e6e73', marginTop: '4px' }}>Tất cả các dòng máy. Hãy chọn cho mình một chiếc.</p>
        </div>
      </section>

      {/* Filters */}
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link to={`/shop/${category}`}
            style={{ padding: '8px 16px', borderRadius: '100px', border: !sub ? '2px solid #1d1d1f' : '1px solid #d2d2d7', background: !sub ? '#1d1d1f' : '#fff', color: !sub ? '#fff' : '#1d1d1f', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
            Tất cả
          </Link>
          {catInfo?.subCategories?.map(s => (
            <Link key={s.slug} to={`/shop/${category}?sub=${s.slug}`}
              style={{ padding: '8px 16px', borderRadius: '100px', border: sub === s.slug ? '2px solid #1d1d1f' : '1px solid #d2d2d7', background: sub === s.slug ? '#1d1d1f' : '#fff', color: sub === s.slug ? '#fff' : '#1d1d1f', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              {s.name}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} color="#86868b" />
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ border: 'none', background: 'none', fontSize: '14px', color: '#1d1d1f', fontWeight: 500, cursor: 'pointer', outline: 'none' }}>
            <option value="featured">Nổi bật</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '8px 22px 60px' }}>
        {loading ? <p style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>Đang tải...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(p => (
              <Link key={p._id} to={`/product/${p.slug}`}
                style={{ display: 'block', background: '#fff', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', border: '1px solid #e8e8ed', transition: 'box-shadow 0.3s, transform 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>
                  {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '180px', objectFit: 'contain' }} onError={e => { e.target.style.opacity = '0'; }} />}
                </div>
                <div style={{ padding: '16px 20px 24px' }}>
                  {p.isNewProduct && <span style={{ fontSize: '12px', fontWeight: 500, color: '#bf4800' }}>Mới</span>}
                  <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#1d1d1f' }}>{p.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>{p.tagline}</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1d1d1f', marginTop: '12px' }}>
                    {p.salePrice ? <><span style={{ color: '#bf4800' }}>${p.salePrice.toLocaleString()}</span> <span style={{ textDecoration: 'line-through', color: '#86868b', fontSize: '14px' }}>${p.price.toLocaleString()}</span></> : `$${p.price?.toLocaleString()}`}
                  </p>
                  {p.monthlyPrice && <p style={{ fontSize: '12px', color: '#6e6e73', marginTop: '2px' }}>hoặc ${p.monthlyPrice}/tháng.</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    {p.colors?.length > 1 ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {p.colors.slice(0, 5).map(c => <span key={c.name} style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #d2d2d7', background: c.hex }} />)}
                      </div>
                    ) : <div />}
                    <button
                      onClick={e => { e.preventDefault(); e.stopPropagation(); addToCompare(p); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', border: isInCompare(p._id) ? '1px solid #0071e3' : '1px solid #d2d2d7', background: isInCompare(p._id) ? '#e8f4fd' : '#fff', color: isInCompare(p._id) ? '#0071e3' : '#86868b', fontSize: '11px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <GitCompareArrows size={12} />
                      {isInCompare(p._id) ? 'Đã thêm' : 'So sánh'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', padding: '60px', color: '#86868b' }}>Không tìm thấy sản phẩm nào.</p>}
      </section>
    </main>
  );
}
