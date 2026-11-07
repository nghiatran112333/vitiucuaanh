import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildOutput = resolve(projectRoot, 'client', 'dist');
const publicDirectory = resolve(projectRoot, 'public');

await mkdir(publicDirectory, { recursive: true });
await cp(buildOutput, publicDirectory, { recursive: true, force: true });
console.log('Đã chuẩn bị giao diện Vịtiu cho Vercel.');
