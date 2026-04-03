import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  banner: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    bgColor: { type: String, default: '#000000' },
  },
  subCategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: '' },
  }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// slug already indexed via unique:true
categorySchema.index({ order: 1 });

export default mongoose.model('Category', categorySchema);
