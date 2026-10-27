import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../.local/', import.meta.url));
await mkdir(root + 'data', { recursive: true });
const db = await MongoMemoryServer.create({
  binary: { version: '7.0.14', downloadDir: root + 'mongodb-binaries', checkMD5: true },
  instance: {
    dbPath: root + 'data',
    storageEngine: 'wiredTiger',
    ip: '127.0.0.1',
    port: 27017,
    dbName: 'kwis',
  },
});
console.log(
  'Local development MongoDB ready on 127.0.0.1:27017 (disk-backed, no authentication; never expose publicly).',
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    void db.stop({ doCleanup: false }).then(() => process.exit(0));
  });
