import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp, logger } from './app.js';
const cfg = config();
await mongoose.connect(cfg.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const server = createApp().listen(cfg.PORT, '0.0.0.0', () =>
  logger.info({ port: cfg.PORT }, 'KWIS API ready'),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () =>
    server.close(() => {
      void mongoose.disconnect().then(() => process.exit(0));
    }),
  );
