import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {  motion, useInView } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronRight, Laptop, Smartphone, Tablet, Watch, Headphones, MapPin, LayoutGrid, Glasses, Plus, ArrowRight } from 'lucide-react';
import API from '../api/client';
import Carousel from '../components/common/Carousel';

const catIcons = { mac: Laptop, iphone: Smartphone, ipad: Tablet, watch: Watch, airpods: Headphones, airtag: MapPin, accessories: LayoutGrid, vision: Glasses };

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 30 }} 
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

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

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mono-display" style={{ color: '#fff', fontSize: '12px', letterSpacing: '0.4em' }}>LOCATING_INVENTORY_V4</motion.div>
    </div>
  );

  return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* ── CINEMATIC HEADER ── */}
      <section style={{ background: '#000', color: '#fff', padding: '120px 20px 100px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <FadeIn>
            <p className="mono-display" style={{ color: '#0071e3', fontSize: '12px', marginBottom: '24px', letterSpacing: '0.4em' }}>THE_APPLE_STORE</p>
            <h1 style={{ fontSize: 'clamp(56px, 12vw, 120px)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.85, marginBottom: '40px' }}>
              Cửa hàng.
            </h1>
            <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '26px', color: '#86868b', maxWidth: '600px', lineHeight: 1.3, fontWeight: 500 }}>
                Cách tốt nhất để mua các sản phẩm bạn yêu thích. Trực tiếp từ Apple hoặc các đối tác ủy quyền.
              </p>
              <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                <p style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>Cần hỗ trợ chuyên sâu?</p>
                <Link to="/support" style={{ fontSize: '15px', color: '#0071e3', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Tư vấn với chuyên gia <ChevronRight size={16} /></Link>
              </div>
            </div>
          </FadeIn>
        </div>
        {/* Visual Flair */}
        <div style={{ position: 'absolute', bottom: '-40%', left: '-5%', width: '50%', height: '80%', background: 'radial-gradient(circle, rgba(0,113,227,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </section>

      {/* ── PREMIUM CATEGORY NAV ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #f5f5f7', position: 'sticky', top: '44px', zIndex: 100 }}>
        <div className="hide-scrollbar" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 22px', display: 'flex', gap: '32px', overflowX: 'auto', justifyContent: 'center' }}>
          {categories.map(cat => {
            const Icon = catIcons[cat.slug] || LayoutGrid;
            return (
              <Link key={cat._id} to={`/shop/${cat.slug}`}
                className="category-pill"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '90px', textDecoration: 'none', textAlign: 'center', transition: 'all 0.4s' }}>
                <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#f5f5f7', marginBottom: '4px', transition: 'all 0.3s' }} className="cat-icon-container">
                  <Icon size={24} strokeWidth={1.5} color="#1d1d1f" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f' }}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── HIGHLIGHT CAROUSEL ── */}
      {featured.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <Carousel title="Nổi bật." subtitle="LATEST_SENSATIONS">
            {featured.map(p => (
              <Link key={p._id} to={`/product/${p.slug}`} className="card-premium" style={{ width: '420px', height: '580px', background: '#f5f5f7', borderRadius: '28px', padding: '48px', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: '#1d1d1f', position: 'relative', overflow: 'hidden' }}>
                <div style={{ zIndex: 2 }}>
                   <p className="mono-display" style={{ fontSize: '11px', color: '#bf4800', marginBottom: '12px', letterSpacing: '0.1em' }}>{p.isNewProduct ? 'MỚI' : 'POPULAR'}</p>
                   <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>{p.name}</h3>
                   <p style={{ fontSize: '17px', color: '#86868b', lineHeight: 1.3, maxWidth: '240px' }}>{p.tagline}</p>
                </div>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <motion.img 
                    whileHover={{ scale: 1.08 }} 
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    src={p.thumbnail} alt="" style={{ height: '240px', objectFit: 'contain' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                   <span style={{ fontSize: '18px', fontWeight: 600 }}>${p.price.toLocaleString()}</span>
                   <div style={{ width: '40px', height: '40px', background: '#1d1d1f', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Plus size={20} />
                   </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </section>
      )}

      {/* ── ACCESSORIES HIGHLIGHT ── */}
      <section style={{ padding: '100px 22px', borderTop: '1px solid #f5f5f7' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <FadeIn>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
                 <div>
                    <h2 style={{ fontSize: '48px', fontWeight: 700 }}>Phụ kiện.</h2>
                    <p style={{ fontSize: '21px', color: '#86868b', marginTop: '8px' }}>Làm việc hiệu quả hơn, phong cách hơn.</p>
                 </div>
                 <Link to="/shop/accessories" style={{ fontSize: '17px', color: '#0066cc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>Xem tất cả <ArrowRight size={18} /></Link>
              </div>
              <div style={{ height: '500px', background: '#f5f5f7', borderRadius: '40px', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 80px', position: 'relative' }}>
                 <div style={{ maxWidth: '400px', position: 'relative', zIndex: 2 }}>
                    <h3 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>Mang theo Apple bên mình.</h3>
                    <p style={{ fontSize: '18px', color: '#6e6e73', marginBottom: '32px' }}>Khám phá các phụ kiện MagSafe, ốp lưng tỉ mỉ, và tai nghe Beats thế hệ mới nhất.</p>
                    <Link to="/shop/accessories" className="apple-btn apple-btn-dark" style={{ padding: '14px 40px', fontSize: '16px' }}>Khám phá ngay</Link>
                 </div>
                 <img src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=1170&auto=format&fit=crop" alt="" style={{ position: 'absolute', right: 0, top: 0, width: '60%', height: '100%', objectFit: 'cover' }} />
              </div>
            </FadeIn>
         </div>
      </section>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .category-pill:hover .cat-icon-container {
          background: #1d1d1f !important;
          transform: translateY(-4px);
        }
        .category-pill:hover .cat-icon-container svg {
          color: #fff !important;
        }
        .category-pill:hover span {
          color: #0071e3 !important;
        }
      `}</style>
    </main>
  );
}
