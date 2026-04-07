import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Carousel({ children, title, subtitle }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section style={{ padding: '100px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 22px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mono-display" 
              style={{ color: '#86868b', marginBottom: '12px' }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.03em' }}
          >
            {title}
          </motion.h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
          <button 
            onClick={() => scroll('left')} 
            disabled={!canScrollLeft}
            style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: '#f5f5f7', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollLeft ? 'pointer' : 'default',
              opacity: canScrollLeft ? 1 : 0.3, transition: 'all 0.3s'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll('right')} 
            disabled={!canScrollRight}
            style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: '#f5f5f7', border: 'none', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canScrollRight ? 'pointer' : 'default',
              opacity: canScrollRight ? 1 : 0.3, transition: 'all 0.3s'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="hide-scrollbar"
        style={{ 
          display: 'flex', gap: '22px', overflowX: 'auto', padding: '0 5vw',
          scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch'
        }}
      >
        {React.Children.map(children, (child) => (
          <div style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}>
            {child}
          </div>
        ))}
        {/* Spacer for ending */}
        <div style={{ flex: '0 0 5vw' }} />
      </div>
    </section>
  );
}
