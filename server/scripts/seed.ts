import 'dotenv/config';
import mongoose from 'mongoose';
import { seed } from '../src/seed.js';
try {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log(`Inserted ${await seed()} initial records. Existing content was preserved.`);
} finally {
  await mongoose.disconnect();
}
