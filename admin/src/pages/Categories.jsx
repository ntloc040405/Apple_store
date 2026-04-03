import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, GripVertical } from 'lucide-react';
import API from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const fetch = () => { setLoading(true); API.get('/categories/admin/all').then(res => setCategories(res.data.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleToggle = async (id) => { try { const r = await API.put(`/categories/${id}/toggle-active`); showToast(r.data.message); fetch(); } catch (e) { showToast(e.response?.data?.message || 'Error', 'error'); } };
  const handleDelete = async (cat) => { if (!confirm(`Delete "${cat.name}"?`)) return; try { const r = await API.delete(`/categories/${cat._id}`); showToast(r.data.message); fetch(); } catch (e) { showToast(e.response?.data?.message || 'Error', 'error'); } };
  const handleSave = async (data) => {
    try {
      if (modal === 'create') await API.post('/categories', data);
      else await API.put(`/categories/${selected._id}`, data);
      showToast(modal === 'create' ? 'Đã tạo xong!' : 'Đã cập nhật!');
      setModal(null); setSelected(null); fetch();
    } catch (e) { showToast(e.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div><h2 style={{ fontSize: 28, fontWeight: 700 }}>Danh mục Sản phẩm</h2><p style={{ fontSize: 14, color: '#86868b' }}>{categories.length} danh mục</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('create'); }}><Plus size={16} /> Thêm Danh mục</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Sắp xếp</th><th>Danh mục</th><th>Đường dẫn (Slug)</th><th>Sản phẩm</th><th>Danh mục phụ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>Đang tải...</td></tr> :
              categories.map(c => (
                <tr key={c._id}>
                  <td style={{ width: 60, textAlign: 'center', color: '#86868b' }}><GripVertical size={14} style={{ display: 'inline' }} /> {c.order}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontSize: 13, color: '#86868b' }}>{c.slug}</td>
                  <td><span style={{ fontWeight: 600 }}>{c.productCount || 0}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.subCategories || []).map(s => (
                        <span key={s.slug} style={{ fontSize: 11, background: '#f5f5f7', padding: '2px 8px', borderRadius: 6 }}>{s.name}</span>
                      ))}
                    </div>
                  </td>
                  <td><span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'Hiện' : 'Ẩn'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" title="Sửa" onClick={() => { setSelected(c); setModal('edit'); }}><Edit2 size={14} /></button>
                      <button className="btn-icon" title={c.isActive ? 'Ẩn' : 'Hiện'} onClick={() => handleToggle(c._id)}>{c.isActive ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                      <button className="btn-icon" title="Xóa" style={{ color: '#ff3b30' }} onClick={() => handleDelete(c)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { setModal(null); setSelected(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3>{modal === 'create' ? '✨ Danh mục mới' : `✏️ Chỉnh sửa: ${selected?.name}`}</h3><button className="btn-icon" onClick={() => { setModal(null); setSelected(null); }}><X size={18} /></button></div>
            <CategoryForm initial={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />
          </div>
        </div>
      )}
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}

function CategoryForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', order: 0, isActive: true, ...initial });
  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, order: Number(form.order) }); }}>
      <div className="modal-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Tên danh mục *</label><input className="form-input" value={form.name} onChange={e => onChange('name', e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Đường dẫn (Slug) *</label><input className="form-input" value={form.slug} onChange={e => onChange('slug', e.target.value)} required /></div>
        </div>
        <div className="form-group"><label className="form-label">Mô tả (Description)</label><textarea className="form-textarea" value={form.description} onChange={e => onChange('description', e.target.value)} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Biểu tượng (Icon)</label><input className="form-input" value={form.icon} onChange={e => onChange('icon', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Thứ tự hiển thị (Order)</label><input className="form-input" type="number" min="0" value={form.order} onChange={e => onChange('order', e.target.value)} /></div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Lưu' : 'Tạo mới'}</button>
      </div>
    </form>
  );
}
