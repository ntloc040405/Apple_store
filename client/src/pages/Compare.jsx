import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { X, Plus, Search as SearchIcon, Check, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import API from '../api/client';

export default function Compare() {
  const { compareItems, addToCompare, removeFromCompare, clearCompare, maxItems } = useCompare();
  const [fullProducts, setFullProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Lock category if we already have items being compared
  const lockedCat = fullProducts.length > 0 && fullProducts[0]?.category?.slug ? fullProducts[0].category.slug : null;

  const fetchFullData = useCallback(async () => {
    if (compareItems.length === 0) {
      setFullProducts([]);
      return;
    }
    setLoading(true);
    const slugs = compareItems.map(p => p.slug);
    try {
      const results = await Promise.all(slugs.map(slug =>
        API.get(`/products/${slug}`).then(r => r.data.data).catch(() => null)
      ));
      setFullProducts(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [compareItems]);

  useEffect(() => {
    fetchFullData();
  }, [fetchFullData]);

  useEffect(() => {
    if (!modalOpen) return;
    const delay = setTimeout(() => {
      setIsSearching(true);
      API.get('/products', { params: { search: searchQ, category: lockedCat, limit: 12 } })
        .then(res => setSearchResults(res.data.data?.products || []))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQ, lockedCat, modalOpen]);

  const handleAdd = (product) => {
    if (addToCompare(product)) {
      setModalOpen(false);
      setSearchQ('');
    }
  };

  const isSelected = (id) => compareItems.some(p => p._id === id);

  const specGroups = [
    { title: 'Tổng quan', keys: ['tagline', 'price', 'colors', 'rating'] },
    { title: 'Màn hình & Đồ họa', keys: ['display', 'graphics'] },
    { title: 'Bộ nhớ & Hiệu năng', keys: ['chip', 'storage', 'authentication'] },
    { title: 'Camera & Âm thanh', keys: ['camera', 'audio'] },
    { title: 'Pin & Sạc', keys: ['battery', 'charging'] },
    { title: 'Kết nối', keys: ['connectivity', 'ports'] },
    { title: 'Thiết kế & Kháng nước', keys: ['weight', 'dimensions', 'waterResistance', 'sensors'] },
  ];

  const specLabels = {
    tagline: 'Slogan', price: 'Giá khởi điểm', colors: 'Tùy chọn màu', rating: 'Đánh giá',
    display: 'Công nghệ màn hình', graphics: 'Đồ họa (GPU)',
    chip: 'Vi xử lý (CPU)', storage: 'Dung lượng lưu trữ', authentication: 'Bảo mật',
    camera: 'Hệ thống Camera', audio: 'Âm thanh',
    battery: 'Pin', charging: 'Sạc',
    connectivity: 'Kết nối không dây', ports: 'Cổng kết nối',
    waterResistance: 'Kháng nước & bụi', weight: 'Trọng lượng', dimensions: 'Kích thước',
    sensors: 'Cảm biến'
  };

  if (loading && fullProducts.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: '#fff', paddingTop: '44px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 22px' }}>
        
        <header style={{ marginBottom: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '56px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '12px' }}>So sánh.</h1>
            <p style={{ fontSize: '21px', color: '#6e6e73' }}>Tìm người đồng hành hoàn hảo cho bạn.</p>
          </div>
          {fullProducts.length > 0 && (
            <button onClick={() => { clearCompare(); setFullProducts([]); }}
              style={{ background: 'none', border: 'none', color: '#0066cc', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={16} /> Xóa tất cả
            </button>
          )}
        </header>

        {fullProducts.length === 0 ? (
          <section style={{ textAlign: 'center', padding: '100px 0', background: '#f5f5f7', borderRadius: '32px' }}>
             <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>Sẵn sàng so sánh?</h2>
                <p style={{ color: '#6e6e73', marginBottom: '40px' }}>Thêm ít nhất hai thiết bị để thấy sự khác biệt về hiệu năng và thiết kế.</p>
                <button onClick={() => setModalOpen(true)} className="apple-btn apple-btn-primary" style={{ padding: '16px 32px' }}>
                  <Plus size={20} /> Chọn máy
                </button>
             </div>
          </section>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', tableLayout: 'fixed', minWidth: '800px' }}>
              <thead style={{ position: 'sticky', top: 40, zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
                <tr>
                  <th style={{ width: '220px', borderBottom: '1px solid #d2d2d7' }}></th>
                  {fullProducts.map(p => (
                    <th key={p._id} style={{ padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #d2d2d7' }}>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => removeFromCompare(p._id)}
                          style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'rgba(245,245,247,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 11 }}>
                          <X size={14} />
                        </button>
                        <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={p.thumbnail} alt="" style={{ height: '140px', objectFit: 'contain', marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '19px', fontWeight: 700, margin: 0 }}>{p.name}</h3>
                        <p style={{ fontSize: '13px', color: '#0066cc', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }} onClick={() => navigate(`/product/${p.slug}`)}>Xem chi tiết</p>
                      </div>
                    </th>
                  ))}
                  {fullProducts.length < maxItems && (
                    <th style={{ padding: '30px 20px', borderBottom: '1px solid #d2d2d7' }}>
                      <button onClick={() => setModalOpen(true)} style={{ width: '100%', height: '200px', border: '1px dashed #d2d2d7', borderRadius: '24px', background: 'transparent', color: '#0066cc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                        <Plus size={28} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Thêm máy</span>
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {specGroups.map(group => (
                  <React.Fragment key={group.title}>
                    <tr>
                      <td colSpan={fullProducts.length + 2} style={{ padding: '60px 0 20px', borderBottom: '1px solid #1d1d1f' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1d1d1f' }}>{group.title}</h2>
                      </td>
                    </tr>
                    {group.keys.map(key => (
                      <tr key={key}>
                        <td style={{ padding: '24px 0', verticalAlign: 'top', color: '#86868b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {specLabels[key] || key}
                        </td>
                        {fullProducts.map(p => {
                          let value = p.specs?.[key] || p[key];
                          if (key === 'price') value = p.salePrice ? `$${p.salePrice}` : `$${p.price}`;
                          if (key === 'rating') value = p.rating ? `★ ${p.rating.toFixed(1)}` : '—';
                          if (key === 'tagline') value = p.tagline || '—';
                          
                          return (
                            <td key={p._id} style={{ padding: '24px 20px', textAlign: 'center', verticalAlign: 'top', fontSize: '15px', fontWeight: 600, color: '#1d1d1f' }}>
                              {key === 'colors' ? (
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                  {p.colors?.map(c => <span key={c.name} title={c.name} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c.hex, border: '1px solid #d2d2d7' }} />)}
                                </div>
                              ) : (
                                <div style={{ whiteSpace: 'pre-line', maxWidth: '200px', margin: '0 auto' }}>{value || '—'}</div>
                              )}
                            </td>
                          );
                        })}
                        {fullProducts.length < maxItems && <td></td>}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SEARCH MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(15px)' }} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '580px', background: '#fff', borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh', boxShadow: '0 50px 150px rgba(0,0,0,0.25)' }}>
              
              <div style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f7' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Chọn thiết bị để so sánh</h3>
                <button onClick={() => setModalOpen(false)} style={{ background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '20px 30px' }}>
                 <div style={{ position: 'relative' }}>
                    <SearchIcon size={16} color="#86868b" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                    <input type="text" placeholder="Tìm kiếm máy..." value={searchQ} onChange={e => setSearchQ(e.target.value)} autoFocus
                      style={{ width: '100%', padding: '12px 12px 12px 42px', background: '#f5f5f7', border: 'none', borderRadius: '12px', fontSize: '15px' }} />
                 </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px 30px' }}>
                 {isSearching ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mx-auto" /></div>
                 ) : searchResults.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {searchResults.map(p => {
                          const selected = isSelected(p._id);
                          return (
                            <button key={p._id} disabled={selected} onClick={() => handleAdd(p)}
                              style={{ display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '16px', border: '1px solid #f5f5f7', background: '#fff', textAlign: 'left', cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s', opacity: selected ? 0.5 : 1 }}>
                               <img src={p.thumbnail} alt="" style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '16px' }} />
                               <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                                  <div style={{ fontSize: '12px', color: '#86868b' }}>{p.tagline || 'Sản phẩm Apple'}</div>
                               </div>
                               {selected ? <Check color="#34c759" size={18} /> : <Plus size={16} color="#0066cc" />}
                            </button>
                          )
                       })}
                    </div>
                 ) : (
                    <div style={{ textAlign: 'center', color: '#86868b', padding: '40px' }}>
                      <p style={{ margin: 0 }}>Không tìm thấy sản phẩm nào phù hợp.</p>
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
