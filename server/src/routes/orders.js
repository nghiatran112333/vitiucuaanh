import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();
const allowedStatuses = ['Đang xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã hủy'];
const allowedBanks = ['Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'MB Bank', 'Techcombank', 'ACB', 'VPBank', 'Sacombank'];
const orderView = order => ({
  _id: String(order._id),
  id: order.orderNumber,
  createdAt: order.createdAt,
  status: order.status,
  items: order.items.map(item => ({ id: String(item.product), name: item.name, brand: item.brand, image: item.image, price: item.price, qty: item.qty })),
  customer: order.customer,
  subtotal: order.subtotal,
  discount: order.discount,
  shipping: order.shipping,
  total: order.total,
  payment: order.payment,
  bankName: order.bankName || '',
  coupon: order.coupon
});

const httpError = (status, message) => Object.assign(new Error(message), { status });

router.post('/', requireAuth, async (req, res, next) => {
  let session;
  try {
    session = await mongoose.startSession();
    const requestedItems = req.body.items;
    const customerInput = req.body.customer || {};
    const payment = req.body.payment;
    const bankName = payment === 'Bank transfer' ? String(req.body.bankName || '') : '';
    if (!Array.isArray(requestedItems) || requestedItems.length < 1 || requestedItems.length > 50) {
      throw httpError(400, 'Giỏ hàng không hợp lệ.');
    }
    if (!['COD', 'Bank transfer', 'E-wallet'].includes(payment)) throw httpError(400, 'Phương thức thanh toán không hợp lệ.');
    if (payment === 'Bank transfer' && !allowedBanks.includes(bankName)) throw httpError(400, 'Vui lòng chọn ngân hàng chuyển khoản.');
    const customer = {
      name: String(customerInput.name || '').trim(),
      phone: String(customerInput.phone || '').trim(),
      email: String(customerInput.email || req.user.email || '').trim().toLowerCase(),
      address: String(customerInput.address || '').trim(),
      ward: String(customerInput.ward || '').trim(),
      district: String(customerInput.district || '').trim(),
      city: String(customerInput.city || '').trim(),
      note: String(customerInput.note || '').trim()
    };
    if (!customer.name || !/^[0-9+() -]{9,15}$/.test(customer.phone) || !customer.address || !customer.ward || !customer.district || !customer.city) {
      throw httpError(400, 'Vui lòng kiểm tra đầy đủ thông tin nhận hàng.');
    }
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) throw httpError(400, 'Email nhận thông tin chưa hợp lệ.');

    let createdOrder;
    await session.withTransaction(async () => {
      const items = [];
      let subtotal = 0;
      for (const requested of requestedItems) {
        const productId = String(requested.productId || requested.id || '');
        const qty = Number(requested.qty);
        if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 99) throw httpError(400, 'Số lượng sản phẩm không hợp lệ.');
        const productFilter = mongoose.isValidObjectId(productId) ? { _id: productId } : { legacyId: productId };
        const product = await Product.findOneAndUpdate(
          { ...productFilter, active: true, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true, session }
        );
        if (!product) throw httpError(409, 'Sản phẩm đã hết hàng hoặc không còn trong cửa hàng. Vui lòng cập nhật giỏ hàng.');
        subtotal += product.price * qty;
        items.push({ product: product._id, name: product.name, brand: product.brand, image: product.image, price: product.price, qty });
      }
      const coupon = String(req.body.coupon || '').trim().toUpperCase() === 'VITIU10' ? 'VITIU10' : '';
      const discount = coupon ? Math.round(subtotal * 0.1) : 0;
      const shipping = subtotal - discount >= 499000 ? 0 : 30000;
      const orderNumber = `VT${Date.now().toString().slice(-8)}${randomBytes(2).toString('hex').toUpperCase()}`;
      const [order] = await Order.create([{
        orderNumber,
        user: req.user._id,
        items,
        customer,
        subtotal,
        discount,
        shipping,
        total: subtotal - discount + shipping,
        coupon,
        payment,
        bankName,
        status: 'Đang xác nhận'
      }], { session });
      createdOrder = order;
    });
    res.status(201).json({ order: orderView(createdOrder) });
  } catch (error) {
    next(error);
  } finally {
    await session?.endSession();
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ orders: orders.map(orderView) });
  } catch (error) { next(error); }
});

router.get('/:orderNumber', requireAuth, async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này.' });
    }
    res.json({ order: orderView(order) });
  } catch (error) { next(error); }
});

router.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json({ orders: orders.map(orderView) });
  } catch (error) { next(error); }
});

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.body.status || '');
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Mã đơn hàng không hợp lệ.' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).lean();
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    res.json({ order: orderView(order) });
  } catch (error) { next(error); }
});

export default router;
