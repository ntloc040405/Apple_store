import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, ChevronLeft, Laptop, Smartphone, Tablet, Watch, Headphones, MapPin, Grid3x3, Glasses } from 'lucide-react';
import API from '../api/client';

const catIcons = { mac: Laptop, iphone: Smartphone, ipad: Tablet, watch: Watch, airpods: Headphones, airtag: MapPin, accessories: Grid3x3, vision: Glasses };

function FadeIn({ children, style = {}, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} style={style}>
      {children}
    </motion.div>
  );
}

/* ═══════════════ HERO ═══════════════ */
function Hero({ banners }) {
  const [i, setI] = useState(0);
  const items = banners.length > 0 ? banners : [{ title: 'Apple Store', subtitle: 'Cách tốt nhất để mua các sản phẩm bạn yêu thích.', link: '/store', shopLink: '/store', textColor: 'light', bgColor: '#000' }];
  const b = items[i % items.length];

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setI(c => (c + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const bgs = [
    'radial-gradient(ellipse at 50% 30%, #1b2838 0%, #0d1117 70%, #000 100%)',
    'linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)',
    'radial-gradient(ellipse at 50% 30%, #1a1a3e 0%, #0f0f2d 70%, #050510 100%)',
  ];
  const isLight = b.textColor !== 'dark';

  return (
    <section style={{ width: '100%', overflow: 'hidden', position: 'relative', background: b.bgColor || bgs[i % bgs.length], transition: 'background 0.7s' }}>
      <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', padding: '96px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '580px' }}>
        <motion.h2 key={`t${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.05, color: isLight ? '#f5f5f7' : '#1d1d1f' }}>
          {b.title}
        </motion.h2>
        <motion.p key={`s${i}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 'clamp(21px, 3vw, 28px)', marginTop: '6px', color: isLight ? '#86868b' : '#6e6e73' }}>
          {b.subtitle}
        </motion.p>
        <motion.div key={`l${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
          <Link to={b.link || '/store'} style={{ fontSize: '21px', color: '#2997ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            Tìm hiểu thêm <ChevronRight size={16} />
          </Link>
          <Link to={b.shopLink || '/store'} style={{ fontSize: '21px', color: '#2997ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            Mua <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
        {items.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            style={{ width: idx === i ? '24px' : '6px', height: '6px', borderRadius: '3px', border: 'none', cursor: 'pointer', background: idx === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', transition: 'all 0.4s' }} />
        ))}
      </div>
      {items.length > 1 && <>
        <button onClick={() => setI(c => (c - 1 + items.length) % items.length)}
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setI(c => (c + 1) % items.length)}
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={18} />
        </button>
      </>}
    </section>
  );
}

/* ═══════════════ CATEGORY NAV ═══════════════ */
function CategoryNav({ categories }) {
  return (
    <div style={{ width: '100%', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', padding: '16px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', overflowX: 'auto' }} className="hide-scrollbar">
          {categories.map(cat => {
            const Icon = catIcons[cat.slug] || Grid3x3;
            return (
              <Link key={cat._id || cat.slug} to={`/category/${cat.slug}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0, opacity: 0.75, textDecoration: 'none', transition: 'opacity 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}>
                <Icon size={24} strokeWidth={1.5} color="#1d1d1f" />
                <span style={{ fontSize: '11px', color: '#1d1d1f', whiteSpace: 'nowrap' }}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PROMO CARD ═══════════════ */
function PromoCard({ product, dark }) {
  const bg = dark ? '#000' : '#f5f5f7';
  const textMain = dark ? '#f5f5f7' : '#1d1d1f';
  const textSub = dark ? '#86868b' : '#6e6e73';

  return (
    <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none', background: bg, width: '100%' }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '52px 24px 40px', minHeight: '540px' }}>
        <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 600, letterSpacing: '-0.003em', lineHeight: 1.07, color: textMain }}>
          {product.name}
        </h2>
        <p style={{ fontSize: '17px', marginTop: '4px', color: textSub }}>{product.tagline}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
          <span style={{ fontSize: '17px', color: '#2997ff', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>Tìm hiểu thêm <ChevronRight size={13} /></span>
          <span style={{ fontSize: '17px', color: '#2997ff', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>Mua <ChevronRight size={13} /></span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '24px', width: '100%', maxWidth: '400px' }}>
          {product.thumbnail && <img src={product.thumbnail} alt={product.name}
            style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain', transition: 'transform 0.7s' }}
            onError={e => { e.target.onerror = null; e.target.style.opacity = '0'; }} />}
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════ LATEST SCROLL ═══════════════ */
function LatestScroll({ products }) {
  const ref = useRef(null);
  const scroll = d => ref.current?.scrollBy({ left: d * 320, behavior: 'smooth' });

  if (!products.length) return null;

  return (
    <section style={{ width: '100%', background: '#f5f5f7' }}>
      <div style={{ width: '100%', maxWidth: '980px', margin: '0 auto', padding: '64px 22px 80px' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.1 }}>
            <span style={{ color: '#1d1d1f' }}>Mới nhất. </span>
            <span style={{ color: '#6e6e73' }}>Xem ngay những gì vừa ra mắt.</span>
          </h2>
        </FadeIn>
        <div style={{ position: 'relative', marginTop: '32px' }}>
          <button onClick={() => scroll(-1)} style={{ position: 'absolute', left: '-12px', top: '38%', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}><ChevronLeft size={18} /></button>
          <button onClick={() => scroll(1)} style={{ position: 'absolute', right: '-12px', top: '38%', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}><ChevronRight size={18} /></button>
          <div ref={ref} className="hide-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollBehavior: 'smooth', paddingBottom: '8px' }}>
            {products.map((p, idx) => (
              <FadeIn key={p._id || idx} delay={idx * 0.05}>
                <Link to={`/product/${p.slug}`}
                  style={{ display: 'block', flexShrink: 0, width: '310px', background: '#fff', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ height: '240px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ maxHeight: '200px', width: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.opacity = '0'; }} />}
                  </div>
                  <div style={{ padding: '12px 20px 20px' }}>
                    {p.isNewProduct && <span style={{ fontSize: '12px', fontWeight: 500, color: '#bf4800' }}>Mới</span>}
                    <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.21 }}>{p.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '2px', lineHeight: 1.28, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.tagline}</p>
                    <p style={{ fontSize: '14px', color: '#1d1d1f', marginTop: '12px' }}>
                      Từ <strong>${p.price?.toLocaleString()}</strong>
                      {p.monthlyPrice && <span style={{ color: '#6e6e73' }}> hoặc ${p.monthlyPrice}/tháng.</span>}
                    </p>
                    {p.colors?.length > 1 && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                        {p.colors.slice(0, 4).map(c => (
                          <span key={c.name} style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid #d2d2d7', background: c.hex }} />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ HOME ═══════════════ */
export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/banners').catch(() => ({ data: { data: [] } })),
      API.get('/categories').catch(() => ({ data: { data: [] } })),
      API.get('/products/featured').catch(() => ({ data: { data: { highlights: [], newArrivals: [] } } })),
    ]).then(([bannersRes, catsRes, featuredRes]) => {
      setBanners(bannersRes.data.data);
      setCategories(catsRes.data.data);
      setHighlights(featuredRes.data.data.highlights || []);
      setNewArrivals(featuredRes.data.data.newArrivals || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main style={{ paddingTop: '44px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#86868b' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e8e8ed', borderTopColor: '#1d1d1f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        Đang tải...
      </div>
    </main>
  );

  const cards = highlights.slice(0, 6);

  return (
    <main style={{ paddingTop: '44px' }}>
      <Hero banners={banners} />
      <CategoryNav categories={categories} />
      <section style={{ width: '100%' }}>
        {Array.from({ length: Math.ceil(cards.length / 2) }, (_, row) => {
          const pair = cards.slice(row * 2, row * 2 + 2);
          return (
            <div key={row} style={{ display: 'grid', gridTemplateColumns: pair.length === 2 ? '1fr 1fr' : '1fr', gap: '12px', marginBottom: '12px' }}>
              {pair.map((p, col) => (
                <FadeIn key={p._id} delay={col * 0.08}>
                  <PromoCard product={p} dark={(row + col) % 2 === 0} />
                </FadeIn>
              ))}
            </div>
          );
        })}
      </section>
      <LatestScroll products={newArrivals} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
