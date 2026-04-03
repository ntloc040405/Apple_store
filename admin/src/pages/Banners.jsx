import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import API from '../api/client';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchBanners = useCallback(() => {
    // setLoading(true);
    API.get('/banners').then(r => setBanners(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (b) => {
    if (!confirm(`Xóa banner "${b.title}"?`)) return;
    try {
      await API.delete(`/banners/${b._id}`);
      showToast('Đã xóa!');
      fetchBanners();
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleSave = async (data) => {
    try {
      if (modal === 'create') await API.post('/banners', data);
      else await API.put(`/banners/${selected._id}`, data);
      showToast(modal === 'create' ? 'Đã tạo!' : 'Đã cập nhật!');
      setModal(null);
      setSelected(null);
      fetchBanners();
    } catch (e) {
      showToast(e.response?.data?.message || 'Lỗi', 'error');
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Banner Quảng cáo</h2>
          <p style={{ fontSize: 14, color: '#86868b' }}>{banners.length} banner</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('create'); }}>
          <Plus size={16} /> Thêm Banner
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Đang tải banner...</div> :
          banners.map(b => (
          <div key={b._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              height: 140, background: b.bgColor || '#000',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '0 24px', color: b.textColor === 'dark' ? '#1d1d1f' : '#fff'
            }}>
              <h3 style={{ fontSize: 24, fontWeight: 700 }}>{b.title}</h3>
              <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>{b.subtitle}</p>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#86868b' }}>
                Thứ tự: {b.order} · {b.isActive ? '✅ Đang hiện' : '❌ Đang ẩn'}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" onClick={() => { setSelected(b); setModal('edit'); }}><Edit2 size={14} /></button>
                <button className="btn-icon" style={{ color: '#ff3b30' }} onClick={() => handleDelete(b)}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => { setModal(null); setSelected(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{modal === 'create' ? '✨ Banner mới' : '✏️ Chỉnh sửa Banner'}</h3>
              <button className="btn-icon" onClick={() => { setModal(null); setSelected(null); }}><X size={18} /></button>
            </div>
            <BannerForm initial={selected} onSave={handleSave} onClose={() => { setModal(null); setSelected(null); }} />
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}

function BannerForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', subtitle: '', link: '/', shopLink: '/store',
    bgColor: '#000000', textColor: 'light', order: 0, isActive: true,
    ...(initial || {}),
  });

  const onChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, order: Number(form.order) }); }}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Tiêu đề *</label>
          <input className="form-input" value={form.title} onChange={e => onChange('title', e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Tiêu đề phụ (Subtitle)</label>
          <input className="form-input" value={form.subtitle} onChange={e => onChange('subtitle', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Đường dẫn (Link)</label>
            <input className="form-input" value={form.link} onChange={e => onChange('link', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Link cửa hàng (Shop Link)</label>
            <input className="form-input" value={form.shopLink} onChange={e => onChange('shopLink', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Màu nền (BG Color)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="color" value={form.bgColor} onChange={e => onChange('bgColor', e.target.value)} style={{ width: 40, height: 36, border: 'none', cursor: 'pointer' }} />
              <input className="form-input" value={form.bgColor} onChange={e => onChange('bgColor', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Màu chữ (Text Color)</label>
            <select className="form-select" value={form.textColor} onChange={e => onChange('textColor', e.target.value)}>
              <option value="light">Sáng (Trắng)</option>
              <option value="dark">Tối (Đen)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thứ tự</label>
            <input className="form-input" type="number" min="0" value={form.order} onChange={e => onChange('order', e.target.value)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'end', paddingBottom: 8 }}>
            <label className="toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => onChange('isActive', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span style={{ marginLeft: 8, fontSize: 13 }}>Kích hoạt</span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
        <button type="submit" className="btn btn-primary">{initial ? 'Lưu' : 'Tạo mới'}</button>
      </div>
    </form>
  );
}
