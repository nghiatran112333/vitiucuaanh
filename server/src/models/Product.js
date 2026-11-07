import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  legacyId: { type: String, default: '', index: true },
  brand: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: 0, min: 0 },
  badge: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  type: { type: String, enum: ['bestseller', 'new', 'sale'], default: 'new' },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
