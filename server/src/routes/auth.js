import { Router } from 'express';
import User from '../models/User.js';
import { clearSessionCookie, requireAuth, setSessionCookie } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';

const router = Router();
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email, role: user.role });

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || name.length > 80 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: 'Nhập tên, email hợp lệ và mật khẩu từ 8 ký tự.' });
    }
    if (await User.exists({ email })) return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: 'customer' });
    setSessionCookie(res, user._id);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Email này đã được đăng ký.' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu chưa chính xác.' });
    }
    setSessionCookie(res, user._id);
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

router.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Đã đăng xuất.' });
});

export default router;
