import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2 } from 'lucide-react';
import API from '../api/client';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchReviews = useCallback(() => {
    // setLoading(true); // Remove synchronous setState to avoid cascading renders
    API.get('/products/admin/all', { params: { limit: 100 } }).then(async res => {
      const products = res.data.data.products;
      const allReviews = [];
      for (const p of products.slice(0, 20)) {
        try {
          const r = await API.get(`/reviews/product/${p._id}`, { params: { limit: 50 } });
          const enriched = (r.data.data.reviews || []).map(rv => ({ ...rv, productName: p.name, productSlug: p.slug }));
          allReviews.push(...enriched);
        } catch (err) {
          console.error('Error fetching reviews for product', p._id, err);
        }
      }
      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(allReviews);
      setTotal(allReviews.length);
      setLoading(false);
    });
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try { await API.delete(`/reviews/${id}`); showToast('Đã xóa!'); fetchReviews(); }
    catch (e) { showToast(e.response?.data?.message || 'Lỗi', 'error'); }
  };

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} fill={i < n ? '#ff9f0a' : 'none'} color={i < n ? '#ff9f0a' : '#d2d2d7'} />
  ));

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700 }}>Đánh giá của khách hàng</h2>
        <p style={{ fontSize: 14, color: '#86868b' }}>{total} đánh giá</p>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Sản phẩm</th><th>Khách hàng</th><th>Xếp hạng</th><th>Nhận xét</th><th>Ngày gửi</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải...</td></tr> :
              reviews.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Chưa có đánh giá nào</td></tr> :
              reviews.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{r.productName}</td>
                  <td style={{ fontSize: 13 }}>{r.user?.name || '—'}</td>
                  <td><div style={{ display: 'flex', gap: 2 }}>{stars(r.rating)}</div></td>
                  <td style={{ fontSize: 13, maxWidth: 300 }}>
                    {r.title && <strong>{r.title}</strong>}
                    {r.comment && <p style={{ color: '#86868b', marginTop: 2 }}>{r.comment.substring(0, 100)}</p>}
                  </td>
                  <td style={{ fontSize: 12, color: '#86868b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn-icon" style={{ color: '#ff3b30' }} onClick={() => handleDelete(r._id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
