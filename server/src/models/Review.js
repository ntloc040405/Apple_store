import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  images: [{ type: String }], // Array of image URLs
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

// Allow multiple reviews/comments per user per product
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ parentId: 1 });

// After save/remove, update product rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, parentId: null, rating: { $gt: 0 } } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const Product = mongoose.model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, { rating: Math.round(stats[0].avgRating * 10) / 10, reviewCount: stats[0].count });
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, reviewCount: 0 });
  }
};

reviewSchema.post('save', function () { this.constructor.calcAverageRating(this.product); });
reviewSchema.post('findOneAndDelete', function (doc) { if (doc) doc.constructor.calcAverageRating(doc.product); });

export default mongoose.model('Review', reviewSchema);
