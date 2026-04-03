import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Image, Star, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { section: 'CHÍNH', items: [
    { to: '/', icon: LayoutDashboard, label: 'Bảng điều khiển' },
  ]},
  { section: 'QUẢN LÝ', items: [
    { to: '/products', icon: Package, label: 'Sản phẩm' },
    { to: '/categories', icon: FolderTree, label: 'Danh mục' },
    { to: '/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { to: '/users', icon: Users, label: 'Khách hàng' },
    { to: '/banners', icon: Image, label: 'Banners (Quảng cáo)' },
    { to: '/reviews', icon: Star, label: 'Đánh giá' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="28" height="34" viewBox="0 0 814 1000" fill="#f5f5f7">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.6-104.7-207.8-104.7-328.1 0-192.8 125.2-295.4 248.4-295.4 65.5 0 120 43.4 161.1 43.4 39.2 0 100.3-46 175.1-46 28.3 0 130 2.5 197.7 95.5zm-283-89.8c30.7-36.7 52.5-87.5 52.5-138.3 0-7-0.6-14.2-1.9-20-50.1 1.9-109.6 33.3-145.5 75.1-25.7 29.5-53.2 80.3-53.2 131.9 0 7.7 1.3 15.4 1.9 17.9 3.2 0.6 8.4 1.3 13.5 1.3 45.2 0 102.5-30.1 132.7-67.9z"/>
        </svg>
        <div><h1>Apple Store</h1><span>Trang Quản Trị</span></div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <NavLink key={item.to} to={item.to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} /> {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.[0] || 'A'}</div>
          <div className="sidebar-user-info">
            <h4>{user?.name || 'Admin'}</h4>
            <p>{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#ff453a', background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: '8px 0' }}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
