export const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(
        (item) => item.id === action.payload.id && item.color === action.payload.color && item.storage === action.payload.storage
      );
      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing].quantity += action.payload.quantity || 1;
        return { ...state, items: updated };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((_, i) => i !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const updated = [...state.items];
      updated[action.payload.index].quantity = Math.max(1, action.payload.quantity);
      return { ...state, items: updated };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};
