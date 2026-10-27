import { z } from 'zod';
import sanitize from 'sanitize-html';
import { Content } from './models.js';
export const contentInput = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(160),
  order: z.number().int().min(0).max(10000).default(0),
  data: z.record(z.string(), z.unknown()).default({}),
});
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
const richFields = new Set([
  'body',
  'overview',
  'challenges',
  'solutions',
  'results',
  'requirements',
  'responsibilities',
  'experience',
]);
export function clean(value: unknown, depth = 0, field?: string): unknown {
  if (depth > 12) throw new Error('Content is nested too deeply');
  if (typeof value === 'string' && field && !richFields.has(field)) return value;
  if (typeof value === 'string')
    return sanitize(value, {
      allowedTags: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'h2',
        'h3',
        'h4',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'a',
      ],
      allowedAttributes: { a: ['href', 'target', 'rel'] },
      allowedSchemes: ['https', 'http', 'mailto', 'tel'],
      transformTags: { a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }) },
    });
  if (Array.isArray(value)) return value.slice(0, 300).map((v) => clean(v, depth + 1, field));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !forbidden.has(k) && !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, clean(v, depth + 1, k)]),
    );
  return value;
}
export async function publicContent(kind?: string) {
  const rows = await Content.find({ published: { $ne: null }, ...(kind ? { kind } : {}) }).lean();
  return rows
    .map((r) => ({ id: String(r._id), kind: r.kind, ...r.published }))
    .sort((a, b) => a.order - b.order);
}

const booleans = new Set([
  'enabled',
  'featured',
  'example',
  'autoplay',
  'muted',
  'loop',
  'noindex',
  'excludeSitemap',
  'closed',
]);
const tagLists = new Set([
  'skills',
  'technologies',
  'tags',
  'features',
  'benefits',
  'relatedProjects',
  'budgetOptions',
]);
const objectLists = new Set([
  'labels',
  'children',
  'socials',
  'columns',
  'links',
  'images',
  'cards',
  'items',
]);
const urlKeys = new Set([
  'url',
  'ctaUrl',
  'secondaryCtaUrl',
  'image',
  'mobileImage',
  'video',
  'poster',
  'logo',
  'favicon',
  'ogImage',
  'linkedin',
  'github',
  'portfolio',
  'liveUrl',
  'mapUrl',
  'mapEmbed',
  'canonical',
]);
export function validateData(kind: string, data: Record<string, unknown>) {
  const problems: string[] = [];
  function visit(value: Record<string, unknown>) {
    for (const [key, v] of Object.entries(value)) {
      if (booleans.has(key) && typeof v !== 'boolean')
        problems.push(`${key} must be true or false`);
      if (tagLists.has(key) && (!Array.isArray(v) || v.some((i) => typeof i !== 'string')))
        problems.push(`${key} must be a list of text values`);
      if (
        objectLists.has(key) &&
        (!Array.isArray(v) || v.some((i) => !i || typeof i !== 'object' || Array.isArray(i)))
      )
        problems.push(`${key} must be a list of items`);
      if (
        urlKeys.has(key) &&
        v !== '' &&
        (typeof v !== 'string' || !/^(https?:\/\/|mailto:|tel:|\/[^/]|\/$|#)/i.test(v))
      )
        problems.push(`${key} must be a safe URL or local path`);
      if (Array.isArray(v))
        for (const item of v)
          if (item && typeof item === 'object' && !Array.isArray(item))
            visit(item as Record<string, unknown>);
    }
  }
  visit(data);
  if (
    data.overlay !== undefined &&
    (typeof data.overlay !== 'number' || data.overlay < 0 || data.overlay > 1)
  )
    problems.push('Overlay must be between 0 and 1');
  if (
    kind === 'testimonials' &&
    data.rating !== undefined &&
    (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5)
  )
    problems.push('Rating must be between 1 and 5');
  for (const [key, max] of [
    ['latitude', 90],
    ['longitude', 180],
  ] as const) {
    const v = data[key];
    if (v !== undefined && v !== '' && (!Number.isFinite(Number(v)) || Math.abs(Number(v)) > max))
      problems.push(`${key} is outside its valid range`);
  }
  if (problems.length) throw Object.assign(new Error(problems.join('; ')), { status: 400 });
  return clean(data);
}
