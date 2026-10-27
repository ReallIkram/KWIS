import 'dotenv/config';
import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { User } from '../src/models.js';
import { passwordHash } from '../src/auth.js';
import { z } from 'zod';
const rl = createInterface({ input: stdin, output: stdout });
try {
  const email = z
    .email()
    .parse(process.env.ADMIN_EMAIL || (await rl.question('Admin email: ')))
    .toLowerCase();
  const name = process.env.ADMIN_NAME || (await rl.question('Admin name: '));
  if (!process.env.ADMIN_PASSWORD)
    throw new Error(
      'Set ADMIN_PASSWORD securely in your shell (read -rs ADMIN_PASSWORD; export ADMIN_PASSWORD). It is never stored in source.',
    );
  const password = z
    .string()
    .min(12)
    .max(72)
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72)
    .parse(process.env.ADMIN_PASSWORD);
  await mongoose.connect(process.env.MONGODB_URI!);
  if (await User.exists({ email })) throw new Error('Account already exists; use password reset');
  await User.create({ name, email, password: await passwordHash(password), role: 'admin' });
  console.log('Administrator created.');
} finally {
  rl.close();
  await mongoose.disconnect();
}
