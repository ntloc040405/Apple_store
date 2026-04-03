import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API from '../api/client';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds([]); return; }
    try {
      setLoading(true);
      const res = await API.get('/wishlist');
      const products = res.data.data || [];
      setWishlistIds(products.map(p => p._id));
    } catch {
      setWishlistIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) return { needLogin: true };
    try {
      const res = await API.post('/wishlist/toggle', { productId });
      const { added } = res.data.data;
      setWishlistIds(prev =>
        added ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      return { added };
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
      return { error: true };
    }
  };

  const isInWishlist = (id) => wishlistIds.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist, loading, refreshWishlist: fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
