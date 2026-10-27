import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useContent } from '../content';
export default function SEO() {
  const { pathname } = useLocation();
  const { one } = useContent();
  const slug = pathname.split('/').filter(Boolean).at(-1) || 'home';
  const page =
    one('seo', slug) ||
    one('pages', slug) ||
    one('blog', slug) ||
    one('services', slug) ||
    one('projects', slug) ||
    one('team', slug) ||
    one('careers', slug) ||
    one('hero', 'home');
  const settings = one('settings')?.data;
  useEffect(() => {
    const admin = pathname.startsWith('/admin');
    const title = admin
      ? 'KWIS Workspace'
      : page?.data.seoTitle || `${page?.title || 'KWIS'} · KWIS`;
    document.title = title;
    const set = (key: string, value: string, property = false) => {
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${property ? 'property' : 'name'}="${key}"]`,
      );
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(property ? 'property' : 'name', key);
        document.head.appendChild(el);
      }
      el.content = value;
    };
    const description =
      page?.data.seoDescription || page?.data.description || settings?.description || '';
    set('description', description);
    set('robots', admin || page?.data.noindex ? 'noindex,nofollow' : 'index,follow');
    set('og:title', title, true);
    set('og:description', description, true);
    set('og:type', page?.kind === 'blog' ? 'article' : 'website', true);
    set('og:image', page?.data.ogImage || page?.data.image || '', true);
    set('twitter:card', 'summary_large_image');
    const canonical =
      page?.data.canonical || `${location.origin}${import.meta.env.BASE_URL}#${pathname}`;
    set('og:url', canonical, true);
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname, page, settings]);
  return null;
}
