import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, UserX, UserCheck, Plus, Trash2 } from 'lucide-react';
import API from '../api/client';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', phone: '' });

  const fetchStaff = useCallback(() => {
    setLoading(true);
    API.get('/admin/users', { params: { page, limit: 20, search, role: 'staff' } })
      .then(res => {
        setStaff(res.data.data.users);
        setPagination(res.data.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    // Fixed cascading setState by wrapping in timeout
    const timer = setTimeout(fetchStaff, 0);
    return () => clearTimeout(timer);
  }, [fetchStaff]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleToggleActive = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/toggle-active`);
      showToast(res.data.message);
      fetchStaff();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      showToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    try {
      const res = await API.post('/admin/staff', staffForm);
      showToast(res.data.message);
      setStaffForm({ name: '', email: '', password: '', phone: '' });
      setShowCreateStaff(false);
      setPage(1);
      fetchStaff();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài khoản nhân viên này?')) return;
    try {
      const res = await API.delete(`/admin/staff/${staffId}`);
      showToast(res.data.message);
      fetchStaff();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>🔐 Ban quản trị</h2>
          <p style={{ fontSize: 14, color: '#86868b' }}>{pagination.total || 0} nhân viên</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar">
            <Search size={16} />
            <input 
              placeholder="Tìm tên hoặc email..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateStaff(!showCreateStaff)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {showCreateStaff && (
        <div className="card" style={{ marginBottom: 24, background: '#f5f5f7', padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>✨ Tạo tài khoản nhân viên</h3>
          <form onSubmit={handleCreateStaff}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label className="form-label">Họ tên *</label><input className="form-input" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} required /></div>
              <div><label className="form-label">Email *</label><input className="form-input" type="email" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} required /></div>
              <div><label className="form-label">Mật khẩu *</label><input className="form-input" type="password" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} required /></div>
              <div><label className="form-label">Số điện thoại</label><input className="form-input" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Tạo tài khoản</button>
              <button type="button" className="btn btn-outline" style={{ padding: '8px 24px' }} onClick={() => setShowCreateStaff(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>Đang tải...</td></tr> :
              staff.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Chưa có nhân viên nào</td></tr> :
              staff.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#5e5ce6,#0071e3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{s.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 12, color: '#86868b' }}>{s.email}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{s.phone || '—'}</td>
                  <td><span className={`status-badge ${s.isActive ? 'active' : 'inactive'}`}>{s.isActive ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-icon" title={s.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} onClick={() => handleToggleActive(s._id)} style={{ color: s.isActive ? '#ff3b30' : '#34c759' }}>
                        {s.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button className="btn-icon" title="Xóa nhân viên" onClick={() => handleDeleteStaff(s._id)} style={{ color: '#ff3b30' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">Trang {pagination.page} / {pagination.totalPages}</span>
          <div className="pagination-btns">
            <button className="page-btn" disabled={page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }}>Trước</button>
            <button className="page-btn" disabled={page >= pagination.totalPages} onClick={() => { setLoading(true); setPage(page + 1); }}>Sau</button>
          </div>
        </div>
      )}

      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}>{toast.msg}</div></div>}
    </div>
  );
}
