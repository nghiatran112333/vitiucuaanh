import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';
import { createRateLimit } from './middleware/requestProtection.js';
import { connectDatabase } from './database.js';

export function createApp(expressRuntime = express) {
  const app = expressRuntime();
  if (process.env.TRUST_PROXY === 'true' || process.env.VERCEL === '1') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
  }

  app.use('/api', createRateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3000,
    message: 'Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau ít phút.',
  }));
  app.use('/api/auth', createRateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: 'Bạn đã thử đăng nhập hoặc đăng ký nhiều lần. Vui lòng chờ ít phút rồi thử lại.',
  }));
  app.use(expressRuntime.json({ limit: '64kb' }));

  app.use('/api', async (_req, res, next) => {
    try {
      await connectDatabase();
      next();
    } catch (error) {
      console.error('Không thể kết nối MongoDB:', error.message);
      res.status(503).json({ message: 'Dữ liệu tạm thời chưa sẵn sàng. Vui lòng thử lại sau.' });
    }
  });

  app.get('/api/health', (_req, res) => res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  }));
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Không tìm thấy API này.' }));

  if (process.env.VERCEL === '1') {
    const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const publicDirectory = resolve(projectRoot, 'public');
    app.use(expressRuntime.static(publicDirectory));
    app.get('*', (_req, res) => res.sendFile(resolve(publicDirectory, 'index.html')));
  } else if (process.env.NODE_ENV === 'production') {
    const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const clientDist = resolve(projectRoot, 'client', 'dist');
    app.use(expressRuntime.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(resolve(clientDist, 'index.html')));
  }

  app.use((error, _req, res, _next) => {
    console.error(error.message);
    const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500);
    res.status(status).json({ message: status < 500 ? error.message : 'Đã có lỗi xảy ra.' });
  });

  return app;
}
