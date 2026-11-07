import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDatabase } from './database.js';

const port = Number(process.env.PORT) || 5000;
if (!process.env.MONGODB_URI) {
  console.error('Thiếu MONGODB_URI. Hãy cấu hình server/.env.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  console.error('Thiếu AUTH_SECRET. Hãy cấu hình một khóa bí mật trước khi chạy production.');
  process.exit(1);
}
try {
  await connectDatabase();
  console.log('Đã kết nối MongoDB.');
  const server = app.listen(port, () => console.log(`Vịtiu đang chạy trên cổng ${port}.`));

  const shutdown = (signal) => {
    console.log(`Nhận ${signal}, đang đóng máy chủ an toàn...`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    const timeout = setTimeout(() => process.exit(1), 25000);
    timeout.unref();
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error('Không thể kết nối MongoDB:', error.message);
  process.exit(1);
}
