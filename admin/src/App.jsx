import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import NotificationCenter from './components/NotificationCenter';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import UsersPage from './pages/UsersPage';
import Staff from './pages/Staff';
import Banners from './pages/Banners';
import Reviews from './pages/Reviews';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#86868b' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
}

function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <NotificationCenter />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/staff" element={<AdminOnlyRoute><Staff /></AdminOnlyRoute>} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
