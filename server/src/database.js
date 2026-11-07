import mongoose from 'mongoose';

let connectionAttempt;

const isVercel = process.env.VERCEL === '1';
const connectionOptions = {
  maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE) || (isVercel ? 5 : 20),
  minPoolSize: 0,
  maxConnecting: isVercel ? 1 : 2,
  waitQueueTimeoutMS: 8000,
  serverSelectionTimeoutMS: 10000,
  maxIdleTimeMS: 60000,
};

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('Thiếu MONGODB_URI.');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoose.connection.readyState === 2 && connectionAttempt) return connectionAttempt;

  connectionAttempt = mongoose.connect(process.env.MONGODB_URI, connectionOptions)
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionAttempt = undefined;
      throw error;
    });

  return connectionAttempt;
}
