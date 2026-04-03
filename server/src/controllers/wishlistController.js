import Wishlist from '../models/Wishlist.js';

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name slug thumbnail price salePrice monthlyPrice tagline rating reviewCount isActive stock colors');
    if (!wishlist) wishlist = { products: [] };
    // Filter out inactive products
    const products = (wishlist.products || []).filter(p => p.isActive);
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wishlist/toggle
export const toggle = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

    const index = wishlist.products.indexOf(productId);
    let added;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }
    await wishlist.save();

    res.json({ success: true, data: { added, count: wishlist.products.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
