type Entry = { kind: string; slug: string; data: Record<string, any> };
// The public inventory is computed from published snapshots on every request.
export function sitemapXml(rows: Entry[], site: string) {
  const base = new URL(site);
  base.hash = '';
  if (!['https:', 'http:'].includes(base.protocol)) throw new Error('Invalid public site URL');
  if (!base.pathname.endsWith('/')) base.pathname += '/';
  const prefixes: Record<string, string> = {
    services: 'services',
    projects: 'portfolio',
    team: 'team',
    blog: 'blog',
    careers: 'careers',
  };
  const seo = new Map(rows.filter((r) => r.kind === 'seo').map((r) => [r.slug, r.data]));
  const urls = new Set<string>();
  const rootSeo = seo.get('home');
  if (!rootSeo?.excludeSitemap && !rootSeo?.noindex) urls.add(base.href);
  for (const row of rows) {
    if (row.kind !== 'pages' && !prefixes[row.kind]) continue;
    const metadata = seo.get(row.slug) || row.data;
    if (metadata.excludeSitemap || metadata.noindex) continue;
    const path = row.kind === 'pages' ? '/' + row.slug : `/${prefixes[row.kind]}/${row.slug}`;
    let url = base.href + '#' + path;
    if (metadata.canonical) {
      try {
        const canonical = new URL(metadata.canonical);
        if (canonical.origin === base.origin) url = canonical.href;
      } catch {
        /* Invalid canonicals cannot replace the derived URL. */
      }
    }
    urls.add(url);
  }
  const escape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map((url) => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>`;
}
