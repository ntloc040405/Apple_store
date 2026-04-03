import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const MAX_QUANTITY_PER_ITEM = 10;

// Helper: calculate summary
const calcSummary = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = 0;
  const tax = Math.round(subtotal * 0.09 * 100) / 100;
  return { itemCount: items.reduce((s, i) => s + i.quantity, 0), subtotal, shipping, tax, total: Math.round((subtotal + shipping + tax) * 100) / 100 };
};

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug thumbnail price stock isActive');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    // ⚠️ Auto-clean: remove items whose product has been deactivated or deleted
    const validItems = cart.items.filter(i => i.product && i.product.isActive);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({ success: true, data: { items: cart.items, summary: calcSummary(cart.items) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/cart/add
export const addItem = async (req, res) => {
  try {
    const { productId, quantity = 1, color, storage } = req.body;

    // ⚠️ Basic validation
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID là bắt buộc.' });
    if (quantity < 1) return res.status(400).json({ success: false, message: 'Số lượng phải >= 1.' });
    if (quantity > MAX_QUANTITY_PER_ITEM) return res.status(400).json({ success: false, message: `Tối đa ${MAX_QUANTITY_PER_ITEM} sản phẩm mỗi loại.` });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });

    // ⚠️ CONSTRAINT: Product must be active
    if (!product.isActive) return res.status(400).json({ success: false, message: 'Sản phẩm này hiện không còn bán.' });

    // ⚠️ CONSTRAINT: Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho.` });
    }

    // ⚠️ Validate color if product has colors
    if (product.colors.length > 0 && color) {
      const validColor = product.colors.find(c => c.name === color);
      if (!validColor) return res.status(400).json({ success: false, message: `Màu "${color}" không hợp lệ cho sản phẩm này.` });
    }

    // ⚠️ Validate storage if product has storage options
    let price = product.price;
    if (product.storageOptions.length > 0 && storage) {
      const opt = product.storageOptions.find(o => o.capacity === storage);
      if (!opt) return res.status(400).json({ success: false, message: `Dung lượng "${storage}" không hợp lệ cho sản phẩm này.` });
      price += opt.priceAdd;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId && i.color === color && i.storage === storage);
    if (existing) {
      const newQty = existing.quantity + quantity;
      // ⚠️ Max quantity check
      if (newQty > MAX_QUANTITY_PER_ITEM) {
        return res.status(400).json({ success: false, message: `Tối đa ${MAX_QUANTITY_PER_ITEM} sản phẩm mỗi loại. Hiện có ${existing.quantity} trong giỏ.` });
      }
      // ⚠️ Stock check for total quantity
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Không đủ hàng. Tồn kho: ${product.stock}, trong giỏ: ${existing.quantity}.` });
      }
      existing.quantity = newQty;
      existing.price = price;
    } else {
      cart.items.push({ product: productId, quantity, color, storage, price });
    }

    await cart.save();
    res.json({ success: true, message: 'Đã thêm vào giỏ hàng', data: calcSummary(cart.items) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/cart/update/:itemId
export const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ success: false, message: 'Quantity is required.' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ.' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        return res.status(400).json({ success: false, message: `Tối đa ${MAX_QUANTITY_PER_ITEM} sản phẩm mỗi loại.` });
      }
      // ⚠️ Check stock
      const product = await Product.findById(item.product);
      if (product && quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho.` });
      }
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', data: calcSummary(cart.items) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/remove/:itemId
export const removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ success: true, message: 'Đã xóa khỏi giỏ hàng', data: calcSummary(cart.items) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.items = []; await cart.save(); }
    res.json({ success: true, message: 'Giỏ hàng đã được xóa.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
