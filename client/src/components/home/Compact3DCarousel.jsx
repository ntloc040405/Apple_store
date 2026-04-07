import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Compact3DCarousel({ products }) {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex((prev) => (prev + 1) % products.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (!products?.length) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <AnimatePresence initial={false} mode="popLayout">
        {[-1, 0, 1].map((offset) => {
          const itemIndex = (index + offset + products.length) % products.length;
          const item = products[itemIndex];
          
          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: offset * 300, scale: 0.8, zIndex: 0 }}
              animate={{ 
                opacity: offset === 0 ? 1 : 0.4, 
                x: offset * 360, 
                scale: offset === 0 ? 1 : 0.85,
                rotateY: offset * 15,
                zIndex: offset === 0 ? 10 : 5,
              }}
              exit={{ opacity: 0, scale: 0.5, x: offset * -300 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                width: '320px',
                height: '420px',
                background: '#fff',
                borderRadius: '32px',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: offset === 0 ? '0 50px 100px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.03)',
                cursor: offset === 0 ? 'pointer' : 'default',
                perspective: '1000px',
              }}
              whileHover={offset === 0 ? { scale: 1.05, y: -10, boxShadow: '0 60px 120px rgba(0,0,0,0.12)' } : {}}
            >
              <Link to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                  <img 
                    src={item.thumbnail} 
                    alt="" 
                    style={{ 
                      maxHeight: '180px', 
                      maxWidth: '100%', 
                      objectFit: 'contain',
                      filter: offset === 0 ? 'none' : 'grayscale(100%) brightness(0.9)',
                      transition: 'filter 0.5s'
                    }} 
                  />
                </div>
                <div>
                   <p className="mono-display" style={{ fontSize: '10px', color: '#86868b', marginBottom: '8px', letterSpacing: '0.2em' }}>TRENDING_NOW</p>
                   <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{item.name}</h3>
                   <p style={{ fontSize: '15px', color: '#86868b' }}>Từ ${item.price.toLocaleString()}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', zIndex: 20 }}>
        <button onClick={prev} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: '1px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', border: '1px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
