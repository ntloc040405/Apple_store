import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '/' },
  shopLink: { type: String, default: '/store' },
  bgColor: { type: String, default: '#000000' },
  textColor: { type: String, enum: ['light', 'dark'], default: 'light' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

bannerSchema.index({ order: 1 });

export default mongoose.model('Banner', bannerSchema);
