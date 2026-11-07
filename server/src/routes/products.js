import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const editableFields = ['brand', 'name', 'category', 'price', 'oldPrice', 'badge', 'rating', 'reviews', 'image', 'type', 'description', 'stock', 'active', 'legacyId'];
const productInput = body => Object.fromEntries(editableFields.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
const findByIdentifier = identifier => mongoose.isValidObjectId(identifier)
  ? { _id: identifier }
  : { legacyId: identifier };

router.get('/', async (_req, res, next) => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (error) { next(error); }
});
router.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (error) { next(error); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: true }).lean();
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    res.json(product);
  } catch (error) { next(error); }
});

router.post('/import-demo', requireAdmin, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || req.body.length > 500) {
      return res.status(400).json({ message: 'Danh sách sản phẩm mẫu không hợp lệ.' });
    }
    if (await Product.exists()) {
      return res.status(409).json({ message: 'MongoDB đã có sản phẩm; không nhập trùng dữ liệu mẫu.' });
    }
    const rows = req.body.map(row => productInput({ ...row, legacyId: String(row.legacyId ?? row._id ?? '') }));
    const products = await Product.insertMany(rows, { ordered: true });
    res.status(201).json(products);
  } catch (error) { next(error); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.create(productInput(req.body));
    res.status(201).json(product);
  } catch (error) { next(error); }
});

router.put('/:identifier', requireAdmin, async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    const fields = productInput(req.body);
    const filter = findByIdentifier(identifier);
    if (!mongoose.isValidObjectId(identifier)) fields.legacyId = identifier;
    const product = await Product.findOneAndUpdate(filter, { $set: fields }, {
      new: true,
      upsert: !mongoose.isValidObjectId(identifier),
      runValidators: true,
      setDefaultsOnInsert: true
    });
    res.json(product);
  } catch (error) { next(error); }
});

export default router;
