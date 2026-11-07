import 'dotenv/config';
import readline from 'node:readline/promises';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { hashPassword } from '../utils/passwords.js';

async function askHidden(prompt) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    const fallback = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await fallback.question(prompt);
    fallback.close();
    return answer;
  }
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise(resolve => {
    let answer = '';
    const onData = chunk => {
      for (const char of chunk.toString()) {
        if (char === '\u0003') {
          process.stdin.setRawMode(false);
          process.exit(130);
        } else if (char === '\r' || char === '\n') {
          process.stdin.off('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(answer);
        } else if (char === '\u007f' || char === '\b') {
          answer = answer.slice(0, -1);
        } else {
          answer += char;
        }
      }
    };
    process.stdin.on('data', onData);
  });
}

if (!process.env.MONGODB_URI) {
  console.error('Thiếu MONGODB_URI trong server/.env.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  if (await User.exists({ role: 'admin' })) {
    console.error('Đã có tài khoản Admin. Không tạo thêm để tránh cấp quyền nhầm.');
    process.exitCode = 1;
  } else {
    const prompts = readline.createInterface({ input: process.stdin, output: process.stdout });
    const name = (await prompts.question('Tên Admin: ')).trim();
    const email = (await prompts.question('Email Admin: ')).trim().toLowerCase();
    prompts.close();
    const password = await askHidden('Mật khẩu Admin (ít nhất 8 ký tự): ');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128) {
      throw new Error('Tên, email hoặc mật khẩu không hợp lệ.');
    }
    await User.create({ name, email, passwordHash: await hashPassword(password), role: 'admin' });
    console.log(`Đã tạo tài khoản quản trị cho ${email}.`);
  }
} catch (error) {
  console.error('Không thể tạo tài khoản Admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
