import { useState, useEffect, useCallback } from 'react';
import { Search, UserX, UserCheck } from 'lucide-react';
import API from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    API.get('/admin/users', { params: { page, limit: 20, search, role: 'user' } })
      .then(res => {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    // Fixed cascading setState by wrapping in timeout
    const timer = setTimeout(fetchUsers, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleToggleActive = async (userId) => {
    try {
      const res = await API.put(`/admin/users/${userId}/toggle-active`);
      showToast(res.data.message);
      fetchUsers();
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>👥 Khách hàng</h2>
          <p style={{ fontSize: 14, color: '#86868b' }}>{pagination.total || 0} người dùng</p>
        </div>
        <div className="search-bar">
          <Search size={16} />
          <input 
            placeholder="Tìm tên hoặc email..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Số điện thoại</th>
              <th>Đơn hàng</th>
              <th>Tổng chi tiêu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải...</td></tr> :
              users.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#86868b' }}>Không tìm thấy người dùng nào</td></tr> :
              users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8e8ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase()}</div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div><div style={{ fontSize: 12, color: '#86868b' }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{u.orderCount || 0}</td>
                  <td style={{ fontWeight: 600 }}>${(u.totalSpent || 0).toLocaleString()}</td>
                  <td><span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                  <td>
                    <button className="btn-icon" title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'} onClick={() => handleToggleActive(u._id)} style={{ color: u.isActive ? '#ff3b30' : '#34c759' }}>
                      {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
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
