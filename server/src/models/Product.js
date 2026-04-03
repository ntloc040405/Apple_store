import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String, default: '' },

  // Pricing
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  monthlyPrice: { type: Number, default: null },

  // Variants
  colors: [{
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, default: '' },
  }],
  storageOptions: [{
    capacity: { type: String, required: true },
    priceAdd: { type: Number, default: 0 },
  }],

  // Images
  images: [{ type: String }],
  thumbnail: { type: String, default: '' },

  // Specs
  specs: {
    display: { type: String, default: '' },
    chip: { type: String, default: '' },
    camera: { type: String, default: '' },
    battery: { type: String, default: '' },
    storage: { type: String, default: '' },
    connectivity: { type: String, default: '' },
    waterResistance: { type: String, default: '' },
    weight: { type: String, default: '' },
    dimensions: { type: String, default: '' },
  },

  highlights: [{ type: String }],

  // Reviews (denormalized for performance)
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // Status
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewProduct: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes (slug already indexed via unique:true)
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewProduct: 1 });
productSchema.index({ name: 'text', tagline: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
