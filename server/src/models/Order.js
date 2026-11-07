import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], validate: rows => rows.length > 0 },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true }
  },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0, default: 0 },
  shipping: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  coupon: { type: String, default: '' },
  payment: { type: String, enum: ['COD', 'Bank transfer', 'E-wallet'], default: 'COD' },
  bankName: { type: String, enum: ['', 'Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'MB Bank', 'Techcombank', 'ACB', 'VPBank', 'Sacombank'], default: '' },
  status: { type: String, enum: ['Đang xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'], default: 'Đang xác nhận', index: true }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
