import Review from '../models/Review.js';

// GET /api/reviews/product/:productId
export const getByProduct = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, rating_high: { rating: -1 }, rating_low: { rating: 1 } };
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit)).lean();
    const total = await Review.countDocuments({ product: req.params.productId });
    res.json({ success: true, data: { reviews, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews
export const create = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi.' });
    res.status(500).json({ success: false, message: err.message });
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
