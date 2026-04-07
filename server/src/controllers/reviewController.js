import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// GET /api/reviews/product/:productId
export const getByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    // For now, let's fetch all and nested in memory (reasonable for product detail)
    const allReviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    
    // Grouping
    const roots = allReviews.filter(r => !r.parentId);
    const children = allReviews.filter(r => r.parentId);
    
    const nested = roots.map(root => ({
      ...root,
      replies: children.filter(c => String(c.parentId) === String(root._id)).reverse() // oldest reply first
    }));

    res.json({ success: true, data: { reviews: nested, total: roots.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/admin/all (admin only)
export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, productId, rating, search } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (rating) filter.rating = Number(rating);
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: 'i' } }, { comment: { $regex: search, $options: 'i' } }];
    }

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug thumbnail')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      data: {
        reviews: reviews.map(r => ({ ...r, productName: r.product?.name, productSlug: r.product?.slug })),
        pagination: { total, page: Number(page), totalPages: Math.ceil(total / limit), limit: Number(limit) }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/check-eligibility/:productId
export const checkEligibility = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if user has a delivered order containing this product
    const order = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.product': productId
    });

    res.json({ 
      success: true, 
      data: { 
        canReview: !!order,
        message: !!order ? 'Bạn có thể đánh giá sản phẩm này.' : 'Bạn cần mua sản phẩm này để có thể đánh giá.'
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews
export const create = async (req, res) => {
  try {
    let { productId, rating, title, comment, parentId } = req.body;
    const userId = req.user._id;

    // Validation - Comment (required and min 3 chars)
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ success: false, message: 'Nội dung không được trống.' });
    }
    
    const commentTrimmed = comment.trim();
    if (commentTrimmed.length < 3) {
      return res.status(400).json({ success: false, message: 'Nội dung phải ít nhất 3 ký tự.' });
    }

    // Validation - ProductID (required and valid ObjectId)
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    // Convert to string if it's an object
    const productIdStr = productId.toString ? productId.toString() : String(productId);
    
    if (!mongoose.Types.ObjectId.isValid(productIdStr)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
    }

    // Check if product exists
    const productExists = await Product.findById(productIdStr);
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại.' });
    }

    // Check if user has purchased (for verified badge & star gating)
    const hasPurchased = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.product': productIdStr
    });

    // Rule: Star rating (>0) on root review requires purchase
    if (!parentId && Number(rating) > 0 && !hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn cần mua sản phẩm này để có thể đánh giá số sao.' 
      });
    }

    // Rule: Only 1 star rating (rating > 0) per user per product on root review
    if (!parentId && Number(rating) > 0) {
      const existingRating = await Review.findOne({
        product: productIdStr,
        user: userId,
        parentId: null,
        rating: { $gt: 0 }
      });
      if (existingRating) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bạn đã đánh giá sản phẩm này rồi. Chỉ được đánh giá một lần.' 
        });
      }
    }

    const review = await Review.create({ 
      product: productIdStr, 
      user: userId, 
      parentId: parentId || null,
      rating: Number(rating) || 0, 
      title: title || '', 
      comment: commentTrimmed,
      images: req.files && req.files.length > 0 ? req.files.map(f => f.path) : [],
      isVerifiedPurchase: !!hasPurchased
    });

    // Populate user info before returning
    await review.populate('user', 'name');

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Review create error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Lỗi tạo đánh giá. Vui lòng thử lại.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// PUT /api/reviews/:id
export const update = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    Object.assign(review, req.body);
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:id
export const remove = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') filter.user = req.user._id;
    const review = await Review.findOneAndDelete(filter);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
