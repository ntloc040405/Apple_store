/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API from '../api/client';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchWishlist = useCallback(async () => {
    if (!user) { 
      setWishlistIds([]); 
      return; 
    }
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/wishlist');
      const products = res.data.data || [];
      setWishlistIds(products.map(p => p._id));
    } catch (err) {
      const message = err.response?.data?.message || 'Không thể tải danh sách yêu thích';
      setError(message);
      showToast(message, 'error');
      setWishlistIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào yêu thích', 'warning');
      return { needLogin: true };
    }

    // Optimistic update
    const previousWishlist = wishlistIds;
    
    try {
      const res = await API.post('/wishlist/toggle', { productId });
      const { added } = res.data.data;
      
      // Update state based on actual response
      setWishlistIds(prev =>
        added ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      
      const message = added ? '✓ Thêm vào yêu thích' : '✓ Xóa khỏi yêu thích';
      showToast(message, 'success');
      setError('');
      return { added };
    } catch (err) {
      // Revert to previous state on error
      setWishlistIds(previousWishlist);
      
      const message = err.response?.data?.message || 'Lỗi khi cập nhật yêu thích';
      setError(message);
      showToast(message, 'error');
      console.error('Wishlist toggle failed:', err);
      return { error: true };
    }
  };

  const isInWishlist = (id) => wishlistIds.includes(id);

  return (
    <WishlistContext.Provider value={{ 
      wishlistIds, 
      toggleWishlist, 
      isInWishlist, 
      loading, 
      error,
      refreshWishlist: fetchWishlist,
      toast,
      showToast
    }}>
      {children}
      {/* Toast Notification */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          background: toast.type === 'error' ? '#ff3b30' : toast.type === 'warning' ? '#ff9500' : '#34c759',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
        }}>
          {toast.message}
        </div>
      )}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
