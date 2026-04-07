import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Heart, GitCompareArrows } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import API from '../../api/client';

const navLinks = [
  { name: 'Cửa hàng', href: '/store', dropdown: null },
  {
    name: 'Mac', href: '/shop/mac',
    dropdown: {
      title: 'Khám phá Mac',
      links: [
        { name: 'MacBook Air', href: '/shop/mac?sub=macbook-air' },
        { name: 'MacBook Pro', href: '/shop/mac?sub=macbook-pro' },
        { name: 'iMac', href: '/shop/mac?sub=imac' },
        { name: 'Mac mini', href: '/shop/mac?sub=mac-mini' },
        { name: 'Mac Studio', href: '/shop/mac?sub=mac-studio' },
      ],
      shopLinks: [
        { name: 'Tất cả Mac', href: '/shop/mac' },
        { name: 'So sánh Mac', href: '/compare' },
        { name: 'Phụ kiện Mac', href: '/shop/accessories?sub=mac' },
      ],
    },
  },
  {
    name: 'iPad', href: '/shop/ipad',
    dropdown: {
      title: 'Khám phá iPad',
      links: [
        { name: 'iPad Pro', href: '/shop/ipad?sub=ipad-pro' },
        { name: 'iPad Air', href: '/shop/ipad?sub=ipad-air' },
        { name: 'iPad', href: '/shop/ipad?sub=ipad' },
        { name: 'iPad mini', href: '/shop/ipad?sub=ipad-mini' },
      ],
      shopLinks: [
        { name: 'Tất cả iPad', href: '/shop/ipad' },
        { name: 'So sánh iPad', href: '/compare' },
        { name: 'Phụ kiện iPad', href: '/shop/accessories?sub=ipad' },
      ],
    },
  },
  {
    name: 'iPhone', href: '/shop/iphone',
    dropdown: {
      title: 'Khám phá iPhone',
      links: [
        { name: 'iPhone 17 Pro', href: '/shop/iphone?sub=iphone-17-pro' },
        { name: 'iPhone 17', href: '/shop/iphone?sub=iphone-17' },
        { name: 'iPhone 16', href: '/shop/iphone?sub=iphone-16' },
        { name: 'iPhone SE', href: '/shop/iphone?sub=iphone-se' },
      ],
      shopLinks: [
        { name: 'Tất cả iPhone', href: '/shop/iphone' },
        { name: 'So sánh iPhone', href: '/compare' },
        { name: 'Phụ kiện iPhone', href: '/shop/accessories?sub=iphone' },
      ],
    },
  },
  {
    name: 'Watch', href: '/shop/watch',
    dropdown: {
      title: 'Khám phá Watch',
      links: [
        { name: 'Apple Watch Ultra 2', href: '/shop/watch?sub=ultra' },
        { name: 'Apple Watch Series 10', href: '/shop/watch?sub=series-10' },
        { name: 'Apple Watch SE', href: '/shop/watch?sub=watch-se' },
      ],
      shopLinks: [
        { name: 'Tất cả Watch', href: '/shop/watch' },
        { name: 'So sánh Watch', href: '/compare' },
        { name: 'Dây đeo & Phụ kiện', href: '/shop/accessories?sub=watch' },
      ],
    },
  },
  {
    name: 'AirPods', href: '/shop/airpods',
    dropdown: {
      title: 'Khám phá AirPods',
      links: [
        { name: 'AirPods Pro 2', href: '/shop/airpods?sub=airpods-pro' },
        { name: 'AirPods 4', href: '/shop/airpods?sub=airpods-4' },
        { name: 'AirPods Max', href: '/shop/airpods?sub=airpods-max' },
      ],
      shopLinks: [
        { name: 'Tất cả AirPods', href: '/shop/airpods' },
        { name: 'So sánh AirPods', href: '/compare' },
      ],
    },
  },
  { name: 'Phụ kiện', href: '/category/accessories', dropdown: null },
  { name: 'Hỗ trợ', href: '/support', dropdown: null },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { compareItems } = useCompare();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownTimeout = useRef(null);
  const searchRef = useRef(null);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMobileOpen(false);
    setSearchOpen(false);
    setActiveDropdown(null);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  const handleMouseEnter = (name) => {
    clearTimeout(dropdownTimeout.current);
    const link = navLinks.find(l => l.name === name);
    if (link?.dropdown) setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const handleDropdownEnter = () => clearTimeout(dropdownTimeout.current);
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await API.get(`/products/suggestions?q=${searchQuery}`);
          setSuggestions(res.data.data || []);
          setSelectedIndex(-1);
        } catch (err) {
          console.error('Suggestions error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setSuggestions([]);
      setSearchQuery('');
      setSelectedIndex(-1);
    }
  }, [searchOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex !== -1 && suggestions[selectedIndex]) {
        e.preventDefault();
        navigate(`/product/${suggestions[selectedIndex].slug}`);
        setSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const HighlightMatch = ({ text, query }) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <strong key={i} style={{ color: '#fff' }}>{part}</strong> 
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  const activeLink = navLinks.find(l => l.name === activeDropdown);
  const dropdown = activeLink?.dropdown;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: '44px',
        backgroundColor: 'rgba(22,22,23,0.8)', backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 22px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Apple logo */}
          <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.8, transition: 'opacity 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; setActiveDropdown(null); }}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
            <svg height="44" viewBox="0 0 14 44" width="14" fill="#f5f5f7">
              <path d="m13.0729 17.6825a3.61 3.61 0 0 0-1.7248 3.0365 3.5132 3.5132 0 0 0 2.1379 3.2223 8.394 8.394 0 0 1-1.0948 2.2618c-.6816.9812-1.3943 1.9623-2.4787 1.9623s-1.3633-.63-2.613-.63c-1.2187 0-1.6525.6507-2.644.6507s-1.6834-.8981-2.4787-2.0041a9.7842 9.7842 0 0 1-1.6013-5.1312 4.2707 4.2707 0 0 1 3.9825-4.5765 3.5571 3.5571 0 0 1 2.6028 1.1431c.3335.3251.7373.37 1.0836.37.3151 0 .7061-.0618 1.0733-.3571a4.0791 4.0791 0 0 1 2.1482-.6818 4.3423 4.3423 0 0 1 1.5529.3081zm-3.0563-2.3283a3.4545 3.4545 0 0 0 .8469-2.5089 1.3 1.3 0 0 0-.0313-.2949 3.5 3.5 0 0 0-2.3147 1.195 3.2342 3.2342 0 0 0-.8634 2.3927 1.2144 1.2144 0 0 0 .0313.2744 1.1258 1.1258 0 0 0 .2153.0207 3.0668 3.0668 0 0 0 2.1159-1.1389z" />
            </svg>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, justifyContent: 'center' }}
            className="hidden lg:flex">
            {navLinks.map(l => (
              <Link key={l.name} to={l.href}
                style={{
                  fontSize: '12px', lineHeight: '44px', color: '#f5f5f7',
                  opacity: activeDropdown === l.name ? 1 : 0.8, padding: '0 10px',
                  transition: 'opacity 0.3s', textDecoration: 'none',
                }}
                onMouseEnter={() => handleMouseEnter(l.name)}
                onMouseLeave={handleMouseLeave}>
                {l.name}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <button onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); setActiveDropdown(null); }}
              style={{ color: '#f5f5f7', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              <Search size={15} strokeWidth={1.8} />
            </button>
            <Link to="/compare" style={{ color: '#f5f5f7', opacity: 0.8, position: 'relative', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              <GitCompareArrows size={15} strokeWidth={1.8} />
              {compareItems?.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  minWidth: '14px', height: '14px', lineHeight: '14px',
                  background: '#0071e3', color: '#fff', fontSize: '8px', fontWeight: 700,
                  borderRadius: '7px', textAlign: 'center', padding: '0 3px',
                }}>{compareItems.length}</span>
              )}
            </Link>
            <Link to="/cart" style={{ color: '#f5f5f7', opacity: 0.8, position: 'relative', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              <ShoppingBag size={15} strokeWidth={1.8} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  minWidth: '14px', height: '14px', lineHeight: '14px',
                  background: '#0071e3', color: '#fff', fontSize: '8px', fontWeight: 700,
                  borderRadius: '7px', textAlign: 'center', padding: '0 3px',
                }}>{itemCount}</span>
              )}
            </Link>
            <Link to={user ? '/wishlist' : '/login'}
              style={{ color: '#f5f5f7', opacity: 0.8, textDecoration: 'none', display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              <Heart size={15} strokeWidth={1.8} />
            </Link>
            <Link to={user ? '/account' : '/login'}
              style={{ color: '#f5f5f7', opacity: 0.8, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              <User size={15} strokeWidth={1.8} />
            </Link>
            <button onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); setActiveDropdown(null); }}
              className="lg:hidden"
              style={{ color: '#f5f5f7', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── DROPDOWN MEGA MENU ── */}
      {dropdown && (
        <div
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
          style={{
            position: 'fixed', top: '44px', left: 0, right: 0, zIndex: 9998,
            backgroundColor: 'rgba(22,22,23,0.98)',
            backdropFilter: 'saturate(180%) blur(20px)',
            animation: 'navDropIn 0.25s ease-out',
          }}>
          <div style={{ maxWidth: '980px', margin: '0 auto', padding: '28px 22px 36px', display: 'flex', gap: '80px' }}>
            {/* Main links */}
            <div>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dropdown.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dropdown.links.map(link => (
                  <Link key={link.name} to={link.href}
                    onClick={() => setActiveDropdown(null)}
                    style={{
                      fontSize: '24px', fontWeight: 600, color: '#f5f5f7', textDecoration: 'none',
                      lineHeight: 1.4, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2997ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#f5f5f7'}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div>
              <p style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mua sắm</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dropdown.shopLinks.map(link => (
                  <Link key={link.name} to={link.href}
                    onClick={() => setActiveDropdown(null)}
                    style={{ fontSize: '12px', color: '#86868b', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f5f5f7'}
                    onMouseLeave={e => e.currentTarget.style.color = '#86868b'}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrim */}
      {dropdown && (
        <div onClick={() => setActiveDropdown(null)}
          style={{ position: 'fixed', inset: 0, top: '44px', zIndex: 9997, background: 'rgba(0,0,0,0.4)', animation: 'navFadeIn 0.2s ease' }} />
      )}

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, animation: 'navFadeIn 0.3s ease' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', cursor: 'default' }} onClick={() => setSearchOpen(false)} />
          <div className="glass-dropdown" style={{ position: 'relative', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 22px 40px' }}>
              <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={20} color="#86868b" style={{ position: 'absolute', left: '0' }} />
                <input 
                  ref={searchRef} 
                  type="text" 
                  placeholder="Tìm kiếm trên apple.com" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ 
                    width: '100%', background: 'none', border: 'none', outline: 'none', 
                    fontSize: '24px', fontWeight: 500, color: '#f5f5f7', padding: '0 40px',
                    letterSpacing: '-0.02em'
                  }} 
                />
                <div style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {isSearching && (
                    <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  )}
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} style={{ color: '#86868b', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  )}
                </div>
              </form>
 
              {/* Suggestions List */}
              <div style={{ marginTop: '40px' }}>
                {suggestions.length > 0 ? (
                  <div>
                    <p className="mono-display" style={{ color: '#86868b', marginBottom: '20px' }}>Gợi ý kết quả</p>
                    <div 
                      className="hide-scrollbar" 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '20px',
                        maxHeight: '480px',
                        overflowY: 'auto',
                        paddingRight: '10px'
                      }}
                    >
                      {suggestions.map((s, idx) => (
                        <Link 
                          key={s._id} 
                          to={`/product/${s.slug}`} 
                          onClick={() => setSearchOpen(false)}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', 
                            borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s',
                            background: selectedIndex === idx ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                            transform: selectedIndex === idx ? 'translateX(4px)' : 'none',
                            border: selectedIndex === idx ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <div style={{ width: '50px', height: '50px', background: '#fff', borderRadius: '8px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={s.thumbnail} alt={s.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#f5f5f7', fontSize: '15px', fontWeight: 600 }}>
                              <HighlightMatch text={s.name} query={searchQuery} />
                            </div>
                            <div className="mono-display" style={{ color: '#86868b', marginTop: '2px', fontSize: '10px' }}>
                              {s.category?.name} — From ${s.price}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mono-display" style={{ color: '#86868b', marginBottom: '15px' }}>Xem nhanh</p>
                    {['iPhone 17 Pro', 'MacBook Air', 'iPad Pro', 'Apple Watch'].map(q => (
                      <Link key={q} to={`/search?q=${q}`} onClick={() => setSearchOpen(false)}
                        style={{ display: 'block', fontSize: '15px', color: '#f5f5f7', padding: '8px 0', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#2997ff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#f5f5f7'}>
                        {q}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, top: '44px', zIndex: 9998, background: '#161617' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 48px' }}>
            {navLinks.map(l => (
              <Link key={l.name} to={l.href}
                style={{ display: 'block', borderBottom: '1px solid #424245', padding: '10px 0', textDecoration: 'none' }}>
                <span style={{ fontSize: '28px', fontWeight: 600, color: '#f5f5f7' }}>{l.name}</span>
              </Link>
            ))}
            <Link to={user ? '/account' : '/login'}
              style={{ display: 'block', borderBottom: '1px solid #424245', padding: '10px 0', textDecoration: 'none' }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: '#f5f5f7' }}>{user ? 'Tài khoản' : 'Đăng nhập'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes navDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes navFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
