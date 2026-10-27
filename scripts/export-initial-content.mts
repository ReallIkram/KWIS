import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { seedRows } from '../server/src/seed.js';
// Only explicitly authored initial public content. Never export users, submissions or env values.
const target = fileURLToPath(new URL('../client/public/', import.meta.url));
await mkdir(target, { recursive: true });
const data = seedRows
  .map((r, i) => ({
    id: `initial-${i}`,
    kind: r.kind,
    slug: r.slug,
    title: r.title,
    order: r.order || 0,
    data: r.data,
  }))
  .sort((a, b) => a.order - b.order);
await writeFile(target + 'initial-content.json', JSON.stringify({ data }));
console.log(`Prepared ${data.length} initial public content records for standalone hosting.`);
