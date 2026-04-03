import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  color: { type: String, default: null },
  storage: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    ward: { type: String, default: '' },
  },
  paymentMethod: { type: String, enum: ['credit_card', 'apple_pay', 'cod', 'bank_transfer'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  shippingMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], default: 'pending' },
  note: { type: String, default: '' },
}, { timestamps: true });

// Generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `APL-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
// orderNumber already indexed via unique:true
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
