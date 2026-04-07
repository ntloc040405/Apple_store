import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom';
import API from '../api/client';
import { ChevronRight, ArrowRight, Laptop, Smartphone, Tablet, Watch, Headphones, LayoutGrid, Sparkles, ChevronLeft } from 'lucide-react';
import Carousel from '../components/common/Carousel';



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

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState({ highlights: [], newArrivals: [] });
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bnRes, featRes] = await Promise.all([
          API.get('/banners'),
          API.get('/products/featured')
        ]);
        setBanners(bnRes.data.data);
        setFeatured(featRes.data.data);
      } catch (err) {
        console.error('Home data error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-slide for Hero
  useEffect(() => {
    if (!loading && banners.filter(b => b.type === 'main').length > 1) {
      const timer = setInterval(() => {
        setHeroIndex(prev => (prev + 1) % banners.filter(b => b.type === 'main').length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [loading, banners]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <motion.div 
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mono-display"
        style={{ color: '#fff', fontSize: '14px', letterSpacing: '0.5em' }}
      >
        INIT_SYSTEM_V.4.2
      </motion.div>
    </div>
  );

  const mainBanners = banners.filter(b => b.type === 'main');
  const secondaryBanners = banners.filter(b => b.type === 'secondary');
  const extraBanner = banners.find(b => b.type === 'extra');

  return (
    <main style={{ backgroundColor: '#fff' }}>
      {/* ── HERO BANNER SLIDER (CINEMATIC) ── */}
      {mainBanners.length > 0 && (
        <section style={{ height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={mainBanners[heroIndex]._id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{ 
                position: 'absolute', inset: 0, 
                backgroundColor: mainBanners[heroIndex].bgColor || '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', color: mainBanners[heroIndex].textColor || '#fff'
              }}
            >
              <div style={{ zIndex: 10, maxWidth: '1000px', padding: '0 24px', position: 'relative' }}>
                <FadeIn>
                  <p className="mono-display" style={{ marginBottom: '32px', opacity: 0.8, letterSpacing: '0.6em', fontSize: '12px' }}>THE_NEXT_FRONTIER</p>
                  <h1 style={{ fontSize: 'clamp(56px, 12vw, 120px)', lineHeight: 0.82, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '40px', maxWidth: '900px' }}>
                    {mainBanners[heroIndex].title}
                  </h1>
                  <p style={{ fontSize: '24px', opacity: 0.8, fontWeight: 500, marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>{mainBanners[heroIndex].subtitle}</p>
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                    <Link to={mainBanners[heroIndex].link} className="apple-btn apple-btn-primary" style={{ padding: '20px 56px', fontSize: '18px' }}>Trải nghiệm ngay</Link>
                    {mainBanners[heroIndex].shopLink && (
                      <Link to={mainBanners[heroIndex].shopLink} style={{ display: 'flex', alignItems: 'center', color: mainBanners[heroIndex].textColor === 'dark' ? '#1d1d1f' : '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: 600, border: '1px solid currentColor', padding: '0 32px', borderRadius: '40px' }}>
                        Khám phá thêm <ChevronRight size={20} />
                      </Link>
                    )}
                  </div>
                </FadeIn>
              </div>
              {mainBanners[heroIndex].image && (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <img 
                    src={mainBanners[heroIndex].image.startsWith('/') ? 'http://localhost:5000' + mainBanners[heroIndex].image : mainBanners[heroIndex].image} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                  />
                </div>
              )}
              {/* Smooth Transition Overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20vh', background: `linear-gradient(to top, rgba(255,255,255,1), transparent)`, zIndex: 2 }} />
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls - Moved up to avoid overlap */}
          {mainBanners.length > 1 && (
            <div style={{ position: 'absolute', bottom: '100px', right: '60px', zIndex: 100, display: 'flex', gap: '12px' }}>
              {mainBanners.map((_, i) => (
                <button 
                  key={i}
                  onMouseEnter={() => setHeroIndex(i)}
                  style={{ 
                    width: '40px', height: '3px', background: i === heroIndex ? '#0071e3' : 'rgba(255,255,255,0.4)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.3s', borderRadius: '10px'
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── PROMO GRID ── */}
      {secondaryBanners.length > 0 && (
        <section style={{ 
          padding: '80px 20px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
          gap: '30px', 
          position: 'relative', 
          zIndex: 10 
        }}>
          {secondaryBanners.map((bn, i) => (
            <FadeIn key={bn._id} delay={i * 0.1}>
              <div style={{ 
                height: '640px', borderRadius: '32px', overflow: 'hidden', position: 'relative', 
                backgroundColor: bn.bgColor || '#f5f5f7', color: bn.textColor || '#1d1d1f',
                padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '16px' }}>{bn.title}</h2>
                  <p style={{ fontSize: '21px', opacity: 0.8, marginBottom: '32px', maxWidth: '400px' }}>{bn.subtitle}</p>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <Link to={bn.link} style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: bn.textColor || '#0066cc', fontWeight: 600, fontSize: '19px' }}>Mua <ChevronRight size={18} /></Link>
                    <Link to={bn.shopLink} style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: bn.textColor || '#0066cc', fontWeight: 600, fontSize: '19px' }}>Xem thêm <ChevronRight size={18} /></Link>
                  </div>
                </div>
                {bn.image && <img src={bn.image.startsWith('/') ? 'http://localhost:5000' + bn.image : bn.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, zIndex: 1 }} />}
              </div>
            </FadeIn>
          ))}
        </section>
      )}

      {/* ── LATEST PRODUCTS SLIDER ── */}
      <Carousel title="Sản phẩm mới nhất." subtitle="CRAFTED_FOR_PERFECTION">
        {featured.newArrivals.map((prod) => (
          <Link key={prod._id} to={`/product/${prod.slug}`} className="card-premium" style={{ width: '400px', height: '540px', background: '#f5f5f7', color: '#1d1d1f', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '40px', textDecoration: 'none', position: 'relative' }}>
            <div style={{ zIndex: 2 }}>
               <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{prod.name}</h3>
               <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '40px' }}>{prod.tagline}</p>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <img src={prod.thumbnail} alt="" style={{ height: '220px', objectFit: 'contain' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 2 }}>
               <span className="apple-btn apple-btn-dark" style={{ padding: '8px 24px', borderRadius: '100px', fontSize: '13px' }}>Mua ngay</span>
            </div>
          </Link>
        ))}
      </Carousel>




      {/* ── EXTRA PROMO ── */}
      {extraBanner && (
        <section style={{ padding: '80px 20px' }}>
          <FadeIn>
            <Link to={extraBanner.link} style={{ display: 'block', height: '600px', background: extraBanner.bgColor || '#000', borderRadius: '40px', overflow: 'hidden', position: 'relative', textDecoration: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: extraBanner.textColor || '#fff', zIndex: 2, padding: '40px' }}>
                <div>
                  <Sparkles size={40} style={{ marginBottom: '24px', opacity: 0.8 }} color="#0071e3" />
                  <h2 style={{ fontSize: '64px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.04em' }}>{extraBanner.title}</h2>
                  <p style={{ fontSize: '24px', opacity: 0.8, maxWidth: '600px' }}>{extraBanner.subtitle}</p>
                </div>
              </div>
              {extraBanner.image && <img src={extraBanner.image.startsWith('/') ? 'http://localhost:5000' + extraBanner.image : extraBanner.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
            </Link>
          </FadeIn>
        </section>
      )}



      <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .link-hover:hover { text-decoration: underline !important; }
      `}</style>
    </main>
  );
}
