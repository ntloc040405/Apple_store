/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

const MAX_COMPARE = 6;

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState(() => {
    const saved = localStorage.getItem('apple-compare');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('apple-compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product) => {
    if (compareItems.length >= MAX_COMPARE) return false;
    if (compareItems.find(p => p._id === product._id)) return false;
    setCompareItems(prev => [...prev, {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      thumbnail: product.thumbnail,
      price: product.price,
      salePrice: product.salePrice,
    }]);
    return true;
  };

  const removeFromCompare = (id) => {
    setCompareItems(prev => prev.filter(p => p._id !== id));
  };

  const isInCompare = (id) => compareItems.some(p => p._id === id);

  const clearCompare = () => setCompareItems([]);

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, isInCompare, clearCompare, maxItems: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within CompareProvider');
  return context;
};
