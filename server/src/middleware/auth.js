import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import User from '../models/User.js';

const sessionSecret = process.env.AUTH_SECRET || randomBytes(32).toString('hex');
const cookieName = 'vitiu_session';
const sessionSeconds = 60 * 60 * 24 * 7;

function signature(payload) {
  return createHmac('sha256', sessionSecret).update(payload).digest('base64url');
}

function readCookie(req) {
  const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
  return cookie?.slice(cookieName.length + 1) || '';
}

export function setSessionCookie(res, userId) {
  const payload = Buffer.from(JSON.stringify({ sub: String(userId), exp: Math.floor(Date.now() / 1000) + sessionSeconds })).toString('base64url');
  const token = `${payload}.${signature(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionSeconds}${secure}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

function verifySession(req) {
  const [payload, supplied = ''] = readCookie(req).split('.');
  if (!payload || !supplied) return null;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(supplied);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
}

export async function requireAuth(req, res, next) {
  try {
    const session = verifySession(req);
    if (!session) return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục.' });
    const user = await User.findById(session.sub).select('name email role').lean();
    if (!user) return res.status(401).json({ message: 'Phiên đăng nhập không còn hợp lệ.' });
    req.user = user;
    next();
  } catch (error) { next(error); }
}

export async function requireAdmin(req, res, next) {
  try {
    const session = verifySession(req);
    if (!session) return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục.' });
    const user = await User.findById(session.sub).select('name email role').lean();
    if (!user) return res.status(401).json({ message: 'Phiên đăng nhập không còn hợp lệ.' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Tài khoản này không có quyền quản trị.' });
    req.user = user;
    next();
  } catch (error) { next(error); }
}
