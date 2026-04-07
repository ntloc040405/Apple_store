import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {  motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { SlidersHorizontal, Plus, ChevronRight, Info } from 'lucide-react';
import API from '../api/client';

export default function ShopCategory() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [catInfo, setCatInfo] = useState(null);
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      // Fixed cascading setState by wrapping in timeout
      setTimeout(() => { if (isMounted) setLoading(true); }, 0);
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
    <main style={{ paddingTop: '44px', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* ── EDITORIAL HEADER ── */}
      <section style={{ overflow: 'hidden', position: 'relative', background: '#000', color: '#fff', padding: '120px 0 100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 22px', position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="mono-display" style={{ color: '#0071e3', fontSize: '12px', marginBottom: '24px', letterSpacing: '0.3em' }}>{category?.toUpperCase()} // CATEGORY_EXPLORER</p>
            <h1 style={{ fontSize: 'clamp(56px, 12vw, 120px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.85 }}>
              {catInfo?.name || category}.
            </h1>
            <div style={{ display: 'flex', gap: '40px', marginTop: '40px', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '24px', color: '#86868b', maxWidth: '500px', lineHeight: 1.3 }}>
                {catInfo?.description || 'Trải nghiệm đỉnh cao của công nghệ và thời thượng. Thiết kế không chỉ là diện mạo, mà là cách nó vận hành.'}
              </p>
              <div style={{ height: '100px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ color: '#86868b' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>HỖ TRỢ TRỰC TUYẾN</p>
                <p style={{ fontSize: '13px' }}>Chuyên gia luôn sẵn sàng giúp bạn chọn lựa.</p>
                <Link to="/support" style={{ fontSize: '13px', color: '#0071e3', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontWeight: 600 }}>Liên hệ tư vấn <ChevronRight size={14} /></Link>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Background Accent */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '140%', background: 'radial-gradient(circle, rgba(0,113,227,0.08) 0%, transparent 70%)', transform: 'rotate(-15deg)' }} />
      </section>

      {/* ── STICKY FILTER BAR ── */}
      <div style={{ position: 'sticky', top: '44px', zIndex: 100, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #f5f5f7' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            <Link to={`/shop/${category}`}
              style={{ padding: '8px 22px', borderRadius: '40px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.3s', background: !sub ? '#1d1d1f' : '#f5f5f7', color: !sub ? '#fff' : '#1d1d1f', border: '1px solid transparent' }}>
              Tất cả
            </Link>
            {catInfo?.subCategories?.map(s => (
              <Link key={s.slug} to={`/shop/${category}?sub=${s.slug}`}
                style={{ padding: '8px 22px', borderRadius: '40px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.3s', background: sub === s.slug ? '#1d1d1f' : '#f5f5f7', color: sub === s.slug ? '#fff' : '#1d1d1f', border: '1px solid transparent' }}>
                {s.name}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <SlidersHorizontal size={14} color="#86868b" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ border: 'none', background: 'none', fontSize: '14px', color: '#1d1d1f', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="featured">Phổ biến</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="newest">Ngày ra mắt</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCT DISCOVERY GRID ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 22px 120px' }}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ fontSize: '17px', color: '#86868b', fontWeight: 500 }}>{filtered.length} sản phẩm phù hợp</p>
          <div style={{ display: 'flex', gap: '8px', color: '#0066cc', fontSize: '14px', fontWeight: 600, cursor: 'help' }}>
             <Info size={16} /> Thông tin vận chuyển miễn phí
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '120px', textAlign: 'center' }}><div className="animate-spin inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => (
                <motion.div 
                  key={p._id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}
                >
                  <Link to={`/product/${p.slug}`} 
                    className="card-premium"
                    style={{ 
                      display: 'block', height: '620px', padding: '48px', background: '#fbfbfd', textDecoration: 'none', 
                      position: 'relative', borderRadius: '28px', border: '1px solid transparent', transition: 'all 0.4s' 
                    }}>
                    <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }} className="product-card-img">
                      <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '100%', maxWidth: '85%', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 380px)' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {p.isNewProduct && <span className="mono-display" style={{ fontSize: '10px', background: '#bf4800', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Mới</span>}
                        {p.isFeatured && <span className="mono-display" style={{ fontSize: '10px', background: '#0071e3', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>Bán chạy</span>}
                      </div>
                      
                      <h3 style={{ fontSize: '26px', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: '8px' }}>{p.name}</h3>
                      <p style={{ fontSize: '15px', color: '#6e6e73', lineHeight: 1.4, maxWidth: '280px' }}>{p.tagline}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '2px' }}>Giá từ</p>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#1d1d1f' }}>${p.price.toLocaleString()}</span>
                        </div>
                        <div style={{ width: '44px', height: '44px', background: '#1d1d1f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          <Plus size={24} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '140px 20px', color: '#86868b' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1d1d1f' }}>Không tìm thấy sản phẩm.</h3>
            <p style={{ marginTop: '12px' }}>Thử thay đổi bộ lọc hoặc xem các danh mục khác.</p>
            <Link to="/store" style={{ display: 'inline-block', marginTop: '32px', color: '#0071e3', textDecoration: 'none', fontWeight: 600 }}>Quay lại cửa hàng</Link>
          </motion.div>
        )}
      </section>

      <style>{`
        .product-card-img img { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .card-premium:hover .product-card-img img { transform: scale(1.06); }
        .card-premium:hover { border-color: #d2d2d7 !important; background: #fff !important; boxShadow: 0 10px 30px rgba(0,0,0,0.03) !important; }
      `}</style>
    </main>
  );
}
