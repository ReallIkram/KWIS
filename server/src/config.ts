import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  FRONTEND_ORIGIN: z.string().min(1),
  COOKIE_SAME_SITE: z.enum(['lax', 'none', 'strict']).default('lax'),
});
export function config() {
  return schema.parse(process.env);
}
export const kinds = [
  'settings',
  'navigation',
  'footer',
  'pages',
  'sections',
  'hero',
  'services',
  'projects',
  'team',
  'technologies',
  'testimonials',
  'blog',
  'careers',
  'industries',
  'process',
  'statistics',
  'faq',
  'seo',
  'theme',
  'locations',
] as const;
