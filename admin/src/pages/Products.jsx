import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import API from '../api/client';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    API.get('/products/admin/all', { params: { page, limit: 15, search } })
      .then(res => { setProducts(res.data.data.products); setPagination(res.data.data.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page, search]);

  const fetchCategories = useCallback(() => API.get('/categories/admin/all').then(res => setCategories(res.data.data)), []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleToggle = async (id) => {
    try {
      const res = await API.put(`/products/${id}/toggle-active`);
      showToast(res.data.message);
      fetchProducts();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Xóa "${product.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      const res = await API.delete(`/products/${product._id}`);
      showToast(res.data.message);
      fetchProducts();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleSave = async (data) => {
    try {
      if (modal === 'create') {
        await API.post('/products', data);
        showToast('Sản phẩm đã được tạo!');
      } else {
        await API.put(`/products/${selected._id}`, data);
        showToast('Sản phẩm đã được cập nhật!');
      }
      setModal(null); setSelected(null); fetchProducts();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 28, fontWeight: 700 }}>Danh sách Sản phẩm</h2><p style={{ fontSize: 14, color: '#86868b' }}>Tổng cộng {pagination.total || 0} sản phẩm</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar"><Search size={16} /><input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('create'); }}><Plus size={16} /> Thêm Sản phẩm</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th style={{ width: 120 }}>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải...</td></tr> :
              products.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Không tìm thấy sản phẩm</td></tr> :
              products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={`http://localhost:5001${p.thumbnail}`} alt="" className="product-thumb" onError={e => { e.target.style.opacity = 0; }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: '#86868b' }}>{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.category?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>${p.price?.toLocaleString()}</td>
                  <td><span style={{ fontWeight: 600, color: p.stock <= 5 ? '#ff3b30' : p.stock <= 10 ? '#ff9f0a' : '#1d1d1f' }}>{p.stock}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className={`status-badge ${p.isActive ? 'active' : 'inactive'}`}>{p.isActive ? 'Hiện' : 'Ẩn'}</span>
                      {p.isFeatured && <span className="status-badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>Nổi bật</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Sửa" onClick={() => { setSelected(p); setModal('edit'); }}><Edit2 size={14} /></button>
                      <button className="btn-icon" title={p.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(p._id)}>{p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      <button className="btn-icon" title="Xóa" onClick={() => handleDelete(p)} style={{ color: '#ff3b30' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">Trang {pagination.page} / {pagination.totalPages} ({pagination.total} mục)</span>
          <div className="pagination-btns">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => (
              <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Sau</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && <ProductModal mode={modal} product={selected} categories={categories} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />}
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}

function ProductModal({ mode, product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', slug: '', tagline: '', description: '', category: '', subCategory: '',
    price: '', salePrice: '', monthlyPrice: '', stock: 100,
    thumbnail: '', isFeatured: false, isNewProduct: false, isActive: true,
    colors: [], storageOptions: [], highlights: [],
    specs: { display: '', chip: '', camera: '', battery: '', storage: '', weight: '' },
    ...(product || {}),
  });
  const [error, setError] = useState('');

  const onChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const onSpecChange = (field, value) => setForm(f => ({ ...f, specs: { ...f.specs, [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const price = Number(form.price);
    const sale = form.salePrice ? Number(form.salePrice) : null;
    const monthly = form.monthlyPrice ? Number(form.monthlyPrice) : null;
    if (!price || price <= 0) { setError('Giá bán phải lớn hơn 0'); return; }
    if (sale !== null && sale <= 0) { setError('Giá khuyến mãi phải lớn hơn 0'); return; }
    if (sale !== null && sale >= price) { setError('Giá khuyến mãi phải nhỏ hơn giá gốc'); return; }
    if (monthly !== null && monthly <= 0) { setError('Giá trả góp phải lớn hơn 0'); return; }
    const data = { ...form, price, stock: Number(form.stock) };
    if (sale) data.salePrice = sale; else data.salePrice = null;
    if (monthly) data.monthlyPrice = monthly; else data.monthlyPrice = null;
    if (form.category?._id) data.category = form.category._id;
    onSave(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h3>{mode === 'create' ? '✨ Sản phẩm mới' : `✏️ Chỉnh sửa: ${product?.name}`}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div style={{ padding: '10px 16px', background: '#fff5f5', borderRadius: 8, color: '#e03e3e', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div className="form-row">
              <div className="form-group"><label className="form-label">Tên sản phẩm *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Đường dẫn (Slug) *</label><input className="form-input" value={form.slug} onChange={e => onChange('slug', e.target.value)} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Slogan (Tagline)</label><input className="form-input" value={form.tagline} onChange={e => onChange('tagline', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select className="form-select" value={form.category?._id || form.category} onChange={e => onChange('category', e.target.value)} required>
                  <option value="">Chọn...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Đường dẫn ảnh (Thumbnail URL)</label><input className="form-input" value={form.thumbnail} onChange={e => onChange('thumbnail', e.target.value)} /></div>
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Giá chuẩn ($) *</label>
                <input className="form-input" style={{ borderColor: (form.price && Number(form.price) <= 0) ? '#ff3b30' : undefined }} type="number" min="0.01" step="0.01" value={form.price} onChange={e => onChange('price', e.target.value)} required />
                <span style={{ fontSize: 11, color: (form.price && Number(form.price) <= 0) ? '#ff3b30' : '#86868b' }}>Phải &gt; 0</span>
              </div>
              <div className="form-group">
                <label className="form-label">Giá sale ($)</label>
                <input className="form-input" style={{ borderColor: (form.salePrice && (Number(form.salePrice) >= Number(form.price) || Number(form.salePrice) <= 0)) ? '#ff3b30' : undefined }} type="number" min="0.01" step="0.01" value={form.salePrice || ''} onChange={e => onChange('salePrice', e.target.value)} placeholder="0.00" />
                <span style={{ fontSize: 11, color: (form.salePrice && (Number(form.salePrice) >= Number(form.price) || Number(form.salePrice) <= 0)) ? '#ff3b30' : '#86868b' }}>Phải &lt; Giá gốc và &gt; 0</span>
              </div>
              <div className="form-group">
                <label className="form-label">12 tháng trả góp ($)</label>
                <input className="form-input" style={{ borderColor: (form.monthlyPrice && Number(form.monthlyPrice) <= 0) ? '#ff3b30' : undefined }} type="number" min="0.01" step="0.01" value={form.monthlyPrice || ''} onChange={e => onChange('monthlyPrice', e.target.value)} placeholder="10.00" />
                <span style={{ fontSize: 11, color: (form.monthlyPrice && Number(form.monthlyPrice) <= 0) ? '#ff3b30' : '#86868b' }}>Phải &gt; 0</span>
              </div>
              <div className="form-group">
                <label className="form-label">Tồn kho</label>
                <input className="form-input" type="number" min="0" value={form.stock} onChange={e => onChange('stock', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              {[['isFeatured', 'Sản phẩm Nổi bật'], ['isNewProduct', 'Tem Hàng mới'], ['isActive', 'Đang bán']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onChange(k, !form[k])}>
                  <div className="toggle" style={{ pointerEvents: 'none' }}>
                    <input type="checkbox" checked={form[k] || false} readOnly />
                    <span className="toggle-slider" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, paddingTop: 8, borderTop: '1px solid #e8e8ed' }}>Thông số kỹ thuật</h4>
            <div className="form-row">
              {[['display', 'Màn hình'], ['chip', 'Chip/Vi xử lý'], ['camera', 'Camera'], ['battery', 'Pin'], ['storage', 'Lưu trữ (Dung lượng)'], ['weight', 'Trọng lượng']].map(([k, l]) => (
                <div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" value={form.specs?.[k] || ''} onChange={e => onSpecChange(k, e.target.value)} /></div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bõ</button>
            <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Tạo Sản phẩm' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
