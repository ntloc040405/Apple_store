import { useReducer, useEffect } from 'react';
import { cartReducer } from './CartReducer';
import { CartContext, useCart } from './CartContextUI';

export { useCart };

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    const saved = localStorage.getItem('apple-cart');
    return saved ? JSON.parse(saved) : { items: [] };
  });

  useEffect(() => {
    localStorage.setItem('apple-cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product, color, storage) => {
    const basePrice = product.salePrice || product.price;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product._id || product.id,
        name: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        price: basePrice + (storage?.priceAdd || 0),
        color: color?.name || null,
        storage: storage?.capacity || null,
        quantity: 1,
      },
    });
  };

  const removeItem = (index) => dispatch({ type: 'REMOVE_ITEM', payload: index });
  const updateQuantity = (index, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, tax, total }}>
      {children}
    </CartContext.Provider>
  );
}

