import { useState, useEffect } from 'react';
import { Star, Trash2, Search, Filter } from 'lucide-react';
import API from '../api/client';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]); // For filtering
  const [toast, setToast] = useState(null);

  // Fetch products once for the filter dropdown
  useEffect(() => {
    API.get('/products/admin/all', { params: { limit: 100 } })
      .then(res => setProducts(res.data.data.products || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let isMounted = true;
    API.get('/reviews/admin/all', { 
      params: { page, limit: 10, productId, rating: ratingFilter, search } 
    }).then(res => {
      if (!isMounted) return;
      setReviews(res.data.data.reviews || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
    })
    .catch(console.error)
    .finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, [page, productId, ratingFilter, search]);

  const fetchReviews = () => {
    setLoading(true);
    API.get('/reviews/admin/all', { 
      params: { page, limit: 10, productId, rating: ratingFilter, search } 
    }).then(res => {
      setReviews(res.data.data.reviews || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  };

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try { 
      await API.delete(`/reviews/${id}`); 
      showToast('Đã xóa đánh giá thành công!'); 
      fetchReviews(); 
    } catch (e) { 
      showToast(e.response?.data?.message || 'Lỗi khi xóa', 'error'); 
    }
  };

  const stars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={14} fill={i < n ? '#ff9f0a' : 'none'} color={i < n ? '#ff9f0a' : '#d2d2d7'} />
  ));

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Đánh giá từ khách hàng</h2>
          <p style={{ fontSize: 14, color: '#86868b' }}>{pagination.total} đánh giá</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={16} />
          <input 
            placeholder="Tìm nội dung nhận xét..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); setLoading(true); }} 
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select 
            className="form-select" 
            style={{ width: 200 }}
            value={productId}
            onChange={e => { setProductId(e.target.value); setPage(1); setLoading(true); }}
          >
            <option value="">Tất cả sản phẩm</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: 140 }}
            value={ratingFilter}
            onChange={e => { setRatingFilter(e.target.value); setPage(1); setLoading(true); }}
          >
            <option value="">Mọi xếp hạng</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Xếp hạng</th>
              <th style={{ width: '40%' }}>Nhận xét</th>
              <th>Ngày gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải đánh giá...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Không tìm thấy đánh giá nào</td></tr>
            ) : reviews.map(r => (
              <tr key={r._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={r.product?.thumbnail} style={{ width: 32, height: 32, objectFit: 'contain' }} alt="" />
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{r.productName}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 13 }}>{r.user?.name || '—'}</div>
                  <div style={{ fontSize: 11, color: '#86868b' }}>{r.user?.email}</div>
                </td>
                <td><div style={{ display: 'flex', gap: 2 }}>{stars(r.rating)}</div></td>
                <td style={{ fontSize: 13 }}>
                  {r.title && <div style={{ fontWeight: 600, marginBottom: 2 }}>{r.title}</div>}
                  {r.comment && <p style={{ color: '#86868b', lineHeight: 1.4 }}>{r.comment}</p>}
                </td>
                <td style={{ fontSize: 12, color: '#86868b' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-icon" style={{ color: '#ff3b30' }} onClick={() => handleDelete(r._id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 24 }}>
          <span className="pagination-info">Trang {pagination.page} / {pagination.totalPages}</span>
          <div className="pagination-btns">
            <button className="page-btn" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }}>Trước</button>
            <button className="page-btn" disabled={page >= pagination.totalPages} onClick={() => { setPage(page + 1); setLoading(true); }}>Sau</button>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
