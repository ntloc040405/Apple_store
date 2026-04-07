import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  image: { type: String, default: '' },
  author: { type: String, default: 'Apple Editorial' },
  category: { type: String, default: 'Trends' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

blogSchema.index({ createdAt: -1 });
blogSchema.index({ isFeatured: 1 });

export default mongoose.model('Blog', blogSchema);
