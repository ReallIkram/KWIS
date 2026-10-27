import { MongoBinary } from 'mongodb-memory-server';
import { fileURLToPath } from 'node:url';
await MongoBinary.getPath({
  version: '7.0.14',
  downloadDir: fileURLToPath(new URL('../../.local/mongodb-binaries', import.meta.url)),
  checkMD5: true,
});
console.log('Verified local development MongoDB binary is available.');
