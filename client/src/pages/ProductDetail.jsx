import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Star, Heart, MessageSquare, ChevronRight, ShieldCheck, Info, CheckCircle2, Award, Zap, ShoppingCart, Truck, RefreshCw, Smartphone, Cpu, Camera, Monitor, Battery, HardDrive, Share2, Layers } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

const SPEC_LABELS = {
  display: { label: 'Màn hình & Hiển thị', icon: Monitor },
  chip: { label: 'Vi xử lý (Chip)', icon: Cpu },
  camera: { label: 'Hệ thống Camera', icon: Camera },
  battery: { label: 'Năng lượng & Pin', icon: Battery },
  storage: { label: 'Dung lượng lưu trữ', icon: HardDrive },
  connectivity: { label: 'Kết nối không dây', icon: Smartphone },
  waterResistance: { label: 'Độ bền & Chống nước', icon: ShieldCheck },
  authentication: { label: 'Bảo mật an toàn', icon: Award },
  ports: { label: 'Cổng kết nối mở rộng', icon: Share2 },
  graphics: { label: 'Hiệu năng Đồ họa', icon: Layers },
  weight: { label: 'Trọng lượng thiết bị', icon: Info },
  dimensions: { label: 'Kích thước vật lý', icon: Info },
  audio: { label: 'Âm thanh & Loa', icon: Zap }
};

function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5% 0px -5% 0px' });
  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 15 }} 
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async (productId) => {
    try {
      const res = await API.get(`/reviews/product/${productId}`);
      setReviews(res.data.data.reviews || []);
      setReviewCount(res.data.data.total || 0);
    } catch (err) {
      console.error('Review fetch failed:', err);
    }
  }, []);

  const checkEligibility = useCallback(async (productId) => {
    if (!user) return;
    try {
      const res = await API.get(`/reviews/check-eligibility/${productId}`);
      setCanReview(res.data.data.canReview);
    } catch (err) {
      console.error('Eligibility check failed:', err);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    API.get(`/products/${slug}`).then(res => {
      if (!isMounted) return;
      const p = res.data.data;
      setProduct(p);
      setSelectedColor(p.colors?.[0] || null);
      setSelectedStorage(p.storageOptions?.[0] || null);
      setActiveImage(p.thumbnail || p.images?.[0]);
      
      fetchReviews(p._id);
      if (user) checkEligibility(p._id);

      if (p.category?.slug) API.get(`/products/category/${p.category.slug}`).then(r => {
        if (isMounted) {
           const filtered = (r.data.data || []).filter(item => item._id !== p._id);
           setRelated(filtered.slice(0, 4));
        }
      }).catch(err => console.error('Related fetch error:', err));
    }).catch(err => {
      console.error('Product fetch failed:', err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [slug, user, checkEligibility, fetchReviews]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mono-display" style={{ color: '#fff', fontSize: '11px', letterSpacing: '0.4em' }}>LOADING_PRO_ENGINE_v4.1</motion.div>
    </div>
  );
  if (!product) return <div style={{ padding: '60px', textAlign: 'center' }}>Sản phẩm không có thực.</div>;

  const price = (product.salePrice || product.price) + (selectedStorage?.priceAdd || 0);

  const handleAdd = (redirect = false) => {
    addItem(product, selectedColor, selectedStorage);
    setAdded(true);
    if (redirect) {
      navigate('/cart');
    } else {
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleToggleWishlist = async (e) => {
    e?.preventDefault?.();
    setWishlistLoading(true);
    try {
      const result = await toggleWishlist(product._id);
      if (result?.needLogin) {
        navigate('/login');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e, pId = null) => {
    if (e) e.preventDefault();
    if (!user) return navigate('/login');
    if (!newReview.comment.trim()) return setError('Vui lòng nhập nội dung.');
    if (newReview.comment.trim().length < 3) return setError('Nội dung phải ít nhất 3 ký tự.');
    
    setSubmitting(true);
    setError('');
    const submitRating = pId ? 0 : (canReview ? newReview.rating : 0);
    
    try {
      const formData = new FormData();
      formData.append('productId', product._id);
      formData.append('rating', submitRating);
      formData.append('title', pId ? '' : newReview.title);
      formData.append('comment', newReview.comment.trim());
      formData.append('parentId', pId || null);
      
      // Append images
      reviewImages.forEach(img => {
        if (img instanceof File) {
          formData.append('images', img);
        }
      });
      
      await API.post('/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await fetchReviews(product._id);
      const pRes = await API.get(`/products/${slug}`);
      setProduct(pRes.data.data);
      
      setShowReviewForm(false);
      setReplyTo(null);
      setNewReview({ rating: 5, title: '', comment: '' });
      setReviewImages([]);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Lỗi xử lý. Vui lòng thử lại.';
      setError(message);
      console.error('Review submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (n, interactive = false) => {
    const val = isNaN(n) ? 0 : n;
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={interactive ? 20 : 13} fill={i <= val ? '#f5c518' : 'none'} color={i <= val ? '#f5c518' : '#e0e0e3'} style={{ cursor: interactive ? 'pointer' : 'default' }} onClick={() => interactive && setNewReview({ ...newReview, rating: i })} />
        ))}
      </div>
    );
  };

  return (
    <main style={{ backgroundColor: '#fff' }}>
      {/* ── BREADCRUMBS ── */}
      <nav style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', fontSize: '12px', color: '#86868b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Cửa hàng</Link>
          <ChevronRight size={10} />
          {product.category && (
            <>
              <Link to={`/shop/${product.category.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category.name}</Link>
              <ChevronRight size={10} />
            </>
          )}
          <span style={{ color: '#1d1d1f' }}>{product.name}</span>
        </div>
      </nav>

      {/* ── STICKY PRODUCT HEADER ── */}
      <div style={{ position: 'sticky', top: '44px', zIndex: 100, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f' }}>{product.name}</h2>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>${price.toLocaleString()}</span>
            <button onClick={() => handleAdd(true)} className="apple-btn apple-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>{added ? 'Đã thêm' : 'Mua ngay'}</button>
          </div>
        </div>
      </div>

      {/* ── HERO GRID ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '60px' }}>
         {/* Left Side: High-Res Gallery */}
         <div>
            <div style={{ position: 'sticky', top: '150px' }}>
               <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                  <div style={{ background: '#fcfcfd', borderRadius: '32px', height: '580px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden' }}>
                     <AnimatePresence mode="wait">
                        <motion.img 
                           key={activeImage}
                           src={activeImage} 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           alt="" 
                           style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                           onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1074&auto=format&fit=crop'; }} 
                        />
                     </AnimatePresence>
                  </div>
               </motion.div>
               
               {product.images?.length > 1 && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
                     {product.images.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveImage(img)}
                           style={{ 
                              width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', padding: '4px', 
                              background: activeImage === img ? '#0071e3' : '#f5f5f7', 
                              border: activeImage === img ? '2px solid #0071e3' : '1px solid transparent', 
                              cursor: 'pointer', transition: 'all 0.2s' 
                           }}>
                           <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Right Side: Selection Column (Sticky) */}
         <div style={{ alignSelf: 'start' }}>
            <FadeIn>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Zap size={14} color="#bf4800" fill="#bf4800" />
                  <p style={{ color: '#bf4800', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Tối tân nhất</p>
               </div>
               
               <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '12px', lineHeight: 1.1 }}>{product.name}</h1>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                  {renderStars(product.rating)}
                  <span style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: 700 }}>{product.rating?.toFixed(1) || '0.0'} <span style={{ color: '#86868b', fontWeight: 400 }}>({reviewCount} nhận xét)</span></span>
               </div>
               
               <p style={{ fontSize: '18px', color: '#1d1d1f', marginBottom: '48px', fontWeight: 500, lineHeight: 1.4 }}>{product.tagline}</p>
               
               <div style={{ display: 'grid', gap: '28px' }}>
                  {product.colors?.length > 0 && (
                    <div id="color-select">
                       <p style={{ fontSize: '12px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', marginBottom: '12px' }}>Màu sắc. <span style={{ color: '#1d1d1f' }}>{selectedColor?.name}</span></p>
                       <div style={{ display: 'flex', gap: '12px' }}>
                          {product.colors.map(c => (
                            <button key={c.name} onClick={() => setSelectedColor(c)} 
                              style={{ width: '36px', height: '36px', borderRadius: '50%', background: c.hex, border: selectedColor?.name === c.name ? '3px solid #0071e3' : '1px solid rgba(0,0,0,0.1)', outline: selectedColor?.name === c.name ? '2px solid #fff' : 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
                          ))}
                       </div>
                    </div>
                  )}

                  {product.storageOptions?.length > 0 && (
                    <div id="storage-select">
                       <p style={{ fontSize: '12px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', marginBottom: '12px' }}>Bộ nhớ.</p>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                          {product.storageOptions.map(s => (
                            <button key={s.capacity} onClick={() => setSelectedStorage(s)}
                              style={{ padding: '12px 14px', borderRadius: '12px', border: selectedStorage?.capacity === s.capacity ? '2px solid #0071e3' : '1px solid #d2d2d7', background: selectedStorage?.capacity === s.capacity ? '#f9faff' : '#fff', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d1d1f' }}>{s.capacity}</div>
                              <div style={{ fontSize: '11px', color: s.priceAdd > 0 ? '#0071e3' : '#86868b', marginTop: '2px' }}>{s.priceAdd > 0 ? `+$${s.priceAdd}` : 'Cơ bản'}</div>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div style={{ padding: '32px', background: '#fafafb', borderRadius: '28px', marginTop: '60px', border: '1px solid #f2f2f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                     <span style={{ fontSize: '32px', fontWeight: 800 }}>${price.toLocaleString()}</span>
                     <span style={{ fontSize: '13px', color: '#34c759', fontWeight: 700 }}>● Sẵn có</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.4fr', gap: '12px' }}>
                     <button onClick={() => handleAdd(false)} className="apple-btn apple-btn-primary" style={{ padding: '18px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <ShoppingCart size={20} /> {added ? 'Đã thêm' : 'Mua ngay'}
                     </button>
                     <button onClick={handleToggleWishlist} disabled={wishlistLoading} style={{ padding: '16px', borderRadius: '14px', background: isInWishlist(product._id) ? '#ffe0e6' : '#fff', border: `2px solid ${isInWishlist(product._id) ? '#ff2d55' : '#d2d2d7'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s', cursor: wishlistLoading ? 'not-allowed' : 'pointer', opacity: wishlistLoading ? 0.6 : 1 }}>
                        <Heart size={18} fill={isInWishlist(product._id) ? '#ff2d55' : 'none'} color={isInWishlist(product._id) ? '#ff2d55' : '#1d1d1f'} style={{ transition: 'all 0.3s' }} />
                        {wishlistLoading ? 'Đang cập nhật...' : (isInWishlist(product._id) ? 'Đã yêu' : 'Thích')}
                     </button>
                  </div>
                  
                  <div style={{ marginTop: '32px', display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                       <Truck size={18} color="#0071e3" />
                       <p style={{ fontSize: '13px', color: '#424245' }}>Giao hàng hỏa tốc trong 2h.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                       <Award size={18} color="#0071e3" />
                       <p style={{ fontSize: '13px', color: '#424245' }}>Chính hãng Apple Authorized.</p>
                    </div>
                  </div>
               </div>
            </FadeIn>
         </div>
      </section>

      {/* ── CINEMATIC HIGHLIGHTS (Exactly 6 Boxes) ── */}
      {product.highlights?.length > 0 && (
         <section style={{ padding: '100px 20px', background: '#000', color: '#fff', textAlign: 'center' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
               <FadeIn>
                  <p style={{ color: '#0071e3', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase' }}>Tuyệt tác công nghệ</p>
                  <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '80px', letterSpacing: '-0.04em' }}>Giá trị thuần khiết.</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                     {product.highlights.slice(0, 6).map((h, i) => (
                       <div key={i} style={{ padding: '40px', background: '#161617', borderRadius: '32px', textAlign: 'left', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <CheckCircle2 color="#0071e3" size={24} />
                          <h4 style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.3, marginTop: '20px' }}>{h}</h4>
                       </div>
                     ))}
                  </div>
               </FadeIn>
            </div>
         </section>
      )}

      {/* ── PRO-GRADE TECHNICAL SPECS ── */}
      <section style={{ padding: '100px 20px', background: '#f5f5f7' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px', marginBottom: '80px' }}>
               <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.04em' }}>Thông số chuyên sâu.</h2>
               <p style={{ fontSize: '18px', color: '#86868b' }}>Chi tiết đến từng linh kiện.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px 60px' }}>
               {Object.entries(SPEC_LABELS).map(([key, config]) => {
                 const value = product.specs?.[key];
                 if (!value || String(value).trim() === '') return null;
                 const Icon = config.icon;
                 
                 return (
                   <div key={key} style={{ borderTop: '1px solid #d2d2d7', paddingTop: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                         <Icon size={16} color="#0071e3" />
                         <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase' }}>{config.label}</h5>
                      </div>
                      <p style={{ fontSize: '17px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4 }}>{value}</p>
                   </div>
                 );
               })}
            </div>
         </div>
      </section>

      {/* ── REVIEWS HUB ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
         <div style={{ background: '#fff', borderRadius: '40px', padding: '60px', border: '1px solid #f2f2f2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
               <div>
                  <h2 style={{ fontSize: '42px', fontWeight: 800 }}>Tiếng nói cộng đồng.</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
                     <span style={{ fontSize: '64px', fontWeight: 800 }}>{product.rating?.toFixed(1) || '0.0'}</span>
                     <div>
                        {renderStars(product.rating)}
                        <p style={{ fontSize: '14px', color: '#86868b', marginTop: '8px' }}>Từ {reviewCount} nhận xét</p>
                     </div>
                  </div>
               </div>
               <button onClick={() => setShowReviewForm(true)} className="apple-btn apple-btn-dark" style={{ padding: '14px 32px' }}>Viết đánh giá</button>
            </div>

            <AnimatePresence>
               {showReviewForm && (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '60px', padding: '40px', background: '#f5f5f7', borderRadius: '32px' }}>
                    <form onSubmit={(e) => handleReviewSubmit(e, replyTo?._id)}>
                       {!replyTo && canReview && <div style={{ marginBottom: '32px' }}>{renderStars(newReview.rating, true)}</div>}
                       {!replyTo && <input type="text" placeholder="Tiêu đề..." className="apple-input" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #d2d2d7', marginBottom: '16px' }} value={newReview.title} onChange={e => setNewReview({ ...newReview, title: e.target.value })} />}
                       <textarea rows={5} placeholder="Nội dung thảo luận..." style={{ width: '100%', padding: '20px', borderRadius: '12px', border: '1px solid #d2d2d7', marginBottom: '24px' }} value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} />
                       
                       {/* Image Upload Section */}
                       <div style={{ marginBottom: '24px' }}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#1d1d1f' }}>📸 Thêm ảnh sản phẩm (tối đa 5 ảnh)</label>
                          <input 
                             type="file" 
                             multiple 
                             accept="image/*" 
                             onChange={(e) => {
                               const files = Array.from(e.target.files || []);
                               if (reviewImages.length + files.length > 5) {
                                 setError('Tối đa 5 ảnh');
                                 return;
                               }
                               setReviewImages([...reviewImages, ...files]);
                             }}
                             style={{ display: 'none' }} 
                             id="review-image-input" 
                          />
                          <label htmlFor="review-image-input" style={{ display: 'inline-block', padding: '12px 20px', background: '#fff', border: '2px dashed #d2d2d7', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#0071e3' }}>
                             + Chọn ảnh
                          </label>
                          
                          {/* Image Preview */}
                          {reviewImages.length > 0 && (
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginTop: '16px' }}>
                                {reviewImages.map((img, idx) => (
                                   <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                                      <img 
                                         src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                                         alt={`preview-${idx}`} 
                                         style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                                      />
                                      <button 
                                         type="button"
                                         onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                                         style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      >
                                         ✕
                                      </button>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                       
                       {error && <div style={{ padding: '16px', background: '#fff1f0', color: '#f5222d', borderRadius: '12px', marginBottom: '24px' }}>{error}</div>}
                       <div style={{ display: 'flex', gap: '12px' }}>
                          <button type="submit" disabled={submitting} className="apple-btn apple-btn-dark" style={{ padding: '12px 40px' }}>Gửi đi</button>
                          <button type="button" onClick={() => { setShowReviewForm(false); setReplyTo(null); setError(''); setReviewImages([]); }} className="apple-btn" style={{ background: '#fff', border: '1px solid #d2d2d7' }}>Hủy</button>
                       </div>
                    </form>
                 </motion.div>
               )}
            </AnimatePresence>

            <div style={{ display: 'grid', gap: '60px' }}>
               {reviews.map(r => (
                 <div key={r._id}>
                    {/* Main Review */}
                    <div style={{ borderLeft: '3px solid #0071e3', paddingLeft: '24px', marginBottom: r.replies?.length > 0 ? '32px' : '0' }}>
                       <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0071e3, #00d4ff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>{r.user?.name?.charAt(0)}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                             <div>
                                <p style={{ fontWeight: 700, fontSize: '16px' }}>{r.user?.name}</p>
                                <p style={{ fontSize: '12px', color: '#86868b' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                             </div>
                             {r.isVerifiedPurchase && <span style={{ fontSize: '11px', fontWeight: 700, color: '#34c759', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>✓ Mua xác thực</span>}
                          </div>
                       </div>
                       <div>
                          {r.rating > 0 && <div style={{ marginBottom: '12px' }}>{renderStars(r.rating)}</div>}
                          {r.title && <h5 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1d1d1f' }}>{r.title}</h5>}
                          <p style={{ color: '#424245', lineHeight: 1.6, fontSize: '15px', marginBottom: '16px' }}>{r.comment}</p>
                          
                          {/* Images Gallery */}
                          {r.images && r.images.length > 0 && (
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                                {r.images.map((img, idx) => (
                                   <a 
                                      key={idx} 
                                      href={img} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      style={{ borderRadius: '8px', overflow: 'hidden', display: 'block' }}
                                   >
                                      <img 
                                         src={img} 
                                         alt={`review-${idx}`} 
                                         style={{ width: '100%', height: '100px', objectFit: 'cover', transition: 'transform 0.2s' }}
                                         onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                         onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                      />
                                   </a>
                                ))}
                             </div>
                          )}
                          
                          <button onClick={() => setReplyTo(r)} style={{ fontSize: '13px', fontWeight: 700, color: '#0071e3', background: 'none', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}>
                             Trả lời
                          </button>
                       </div>
                    </div>

                    {/* Nested Replies */}
                    {r.replies?.length > 0 && (
                       <div style={{ marginTop: '24px', paddingLeft: '44px', display: 'grid', gap: '24px' }}>
                          {r.replies.map(reply => (
                             <div key={reply._id} style={{ borderLeft: '2px solid #e5e5e7', paddingLeft: '20px', position: 'relative' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                   <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f5f5f7', color: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{reply.user?.name?.charAt(0)}</div>
                                   <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                         <p style={{ fontWeight: 700, fontSize: '14px' }}>{reply.user?.name}</p>
                                         <p style={{ fontSize: '11px', color: '#86868b' }}>{new Date(reply.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      {reply.isVerifiedPurchase && <span style={{ fontSize: '10px', fontWeight: 700, color: '#34c759', background: '#f0fdf4', padding: '1px 6px', borderRadius: '2px' }}>✓</span>}
                                   </div>
                                </div>
                                <p style={{ color: '#424245', lineHeight: 1.6, fontSize: '14px', marginLeft: '0px', marginBottom: '12px' }}>{reply.comment}</p>
                                
                                {/* Reply Images */}
                                {reply.images && reply.images.length > 0 && (
                                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                      {reply.images.map((img, idx) => (
                                         <a 
                                            key={idx} 
                                            href={img} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ borderRadius: '6px', overflow: 'hidden', display: 'block' }}
                                         >
                                            <img 
                                               src={img} 
                                               alt={`reply-${idx}`} 
                                               style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                            />
                                         </a>
                                      ))}
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>
                    )}

                    {/* Inline Reply Form */}
                    {replyTo?._id === r._id && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '24px', paddingLeft: '44px', paddingTop: '24px', borderTop: '1px solid #f2f2f2' }}>
                          <form onSubmit={(e) => handleReviewSubmit(e, r._id)} style={{ background: '#f9f9fb', padding: '20px', borderRadius: '16px', border: '1px solid #e5e5e7' }}>
                             <textarea rows={3} placeholder="Viết trả lời..." style={{ width: '100%', padding: '16px', borderRadius: '10px', border: '1px solid #d2d2d7', marginBottom: '16px', fontSize: '14px' }} value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} />
                             
                             {/* Image Upload for Reply */}
                             <div style={{ marginBottom: '16px' }}>
                                <input 
                                   type="file" 
                                   multiple 
                                   accept="image/*" 
                                   onChange={(e) => {
                                     const files = Array.from(e.target.files || []);
                                     if (reviewImages.length + files.length > 5) {
                                       setError('Tối đa 5 ảnh');
                                       return;
                                     }
                                     setReviewImages([...reviewImages, ...files]);
                                   }}
                                   style={{ display: 'none' }} 
                                   id={`reply-image-input-${r._id}`} 
                                />
                                <label htmlFor={`reply-image-input-${r._id}`} style={{ display: 'inline-block', padding: '8px 14px', background: '#fff', border: '1px solid #d2d2d7', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#0071e3' }}>
                                   📸 Ảnh
                                </label>
                                
                                {/* Reply Image Preview */}
                                {reviewImages.length > 0 && (
                                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '12px' }}>
                                      {reviewImages.map((img, idx) => (
                                         <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                                            <img 
                                               src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                                               alt={`preview-${idx}`} 
                                               style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} 
                                            />
                                            <button 
                                               type="button"
                                               onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                                               style={{ position: 'absolute', top: '0px', right: '0px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                               ✕
                                            </button>
                                         </div>
                                      ))}
                                   </div>
                                )}
                             </div>
                             
                             {error && <div style={{ padding: '12px', background: '#fff1f0', color: '#f5222d', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}
                             <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" disabled={submitting} className="apple-btn apple-btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>
                                   {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                                </button>
                                <button type="button" onClick={() => { setReplyTo(null); setError(''); setNewReview({ rating: 5, title: '', comment: '' }); setReviewImages([]); }} className="apple-btn" style={{ background: '#fff', border: '1px solid #d2d2d7', padding: '10px 24px', fontSize: '13px' }}>
                                   Hủy
                                </button>
                             </div>
                          </form>
                       </motion.div>
                    )}

                    <div style={{ borderBottom: '1px solid #f2f2f2', marginTop: '40px' }} />
                 </div>
               ))}
               {reviews.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#86868b' }}>
                     <p style={{ fontSize: '16px' }}>Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận!</p>
                  </div>
               )}
            </div>
         </div>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Sản phẩm tương tự.</h2>
            <Link to="/shop" style={{ color: '#0071e3', textDecoration: 'none', fontSize: '17px' }}>Xem tất cả</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {related.map(item => (
              <Link key={item._id} to={`/product/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#f5f5f7', borderRadius: '24px', padding: '30px', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                   <img src={item.thumbnail} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '20px' }} />
                   <h4 style={{ fontSize: '17px', fontWeight: 700 }}>{item.name}</h4>
                   <p style={{ fontSize: '14px', color: '#86868b', marginTop: '4px' }}>${item.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ background: '#000', color: '#fff', padding: '100px 20px', textAlign: 'center' }}>
         <ShieldCheck size={48} color="#0071e3" style={{ margin: '0 auto 24px' }} />
         <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Dẫn đầu về sự tin cậy.</h2>
         <p style={{ fontSize: '17px', color: '#86868b', maxWidth: '700px', margin: '16px auto 0' }}>Bảo hành 12 tháng chính hãng tại tất cả các trung tâm Apple ủy quyền trên toàn quốc.</p>
      </section>
    </main>
  );
}
