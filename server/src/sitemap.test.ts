import { describe, it, expect } from 'vitest';
import { sitemapXml } from './sitemap.js';
describe('published sitemap inventory', () => {
  it('includes published routes, respects SEO exclusions, and escapes XML', () => {
    const xml = sitemapXml(
      [
        { kind: 'pages', slug: 'about', data: {} },
        {
          kind: 'blog',
          slug: 'article',
          data: { canonical: 'https://example.com/KWIS/article?a=1&b=2' },
        },
        { kind: 'team', slug: 'hidden', data: { excludeSitemap: true } },
        { kind: 'services', slug: 'private', data: {} },
        { kind: 'seo', slug: 'private', data: { noindex: true } },
        { kind: 'settings', slug: 'global', data: {} },
      ],
      'https://example.com/KWIS/',
    );
    expect(xml).toContain('https://example.com/KWIS/#/about');
    expect(xml).toContain('a=1&amp;b=2');
    expect(xml).not.toMatch(/hidden|private|global/);
  });
});
