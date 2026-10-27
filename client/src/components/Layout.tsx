import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, MapPin, ArrowRight } from 'lucide-react';
import { useContent } from '../content';
import { useCopy } from '../copy';
import { SafeLink, ButtonLink } from './UI';
import { request, send } from '../api';
import type { LinkItem } from '../types';
export default function Layout({ children }: { children?: ReactNode }) {
  const { list, one, isLoading, error } = useContent();
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = one('settings')?.data || {};
  const footer = one('footer')?.data || {};
  const theme = one('theme')?.data || {};
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.mode === 'light' ? 'light' : 'dark';
    root.style.setProperty(
      '--radius',
      Math.min(32, Math.max(0, Number(theme.radius) || 12)) + 'px',
    );
    const color = /^#[0-9a-f]{6}$/i;
    for (const [key, value] of Object.entries({
      accent: theme.accent,
      secondary: theme.secondary,
      bg: theme.background,
    })) {
      if (typeof value === 'string' && color.test(value)) root.style.setProperty('--' + key, value);
    }
    root.style.fontFamily = ['Inter', 'Arial', 'Georgia', 'system-ui'].includes(theme.font)
      ? theme.font === 'Inter'
        ? 'Arial, system-ui, sans-serif'
        : theme.font
      : 'Arial, system-ui, sans-serif';
    if (settings.favicon && /^https:\/\//.test(settings.favicon)) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }
    return () => {
      delete root.dataset.theme;
    };
  }, [theme, settings.favicon]);
  if (isLoading)
    return (
      <div className="screen-state">
        <span className="loader" />
        Loading KWIS…
      </div>
    );
  if (error)
    return (
      <div className="screen-state">
        <h1>We’ll be right back.</h1>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  const nav = list('navigation').filter((n) => n.data.enabled !== false);
  return (
    <>
      <a
        href="#main"
        className="skip"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
          document.getElementById('main')?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label={settings.companyName || 'KWIS'}>
            {settings.logo ? (
              <img src={settings.logo} alt={settings.companyName} />
            ) : (
              <>
                <span className="brand-symbol">
                  k
                  <span>
                    <ArrowUpRight size={18} />
                  </span>
                </span>
                <strong>{settings.companyName || 'KWIS'}</strong>
              </>
            )}
          </Link>
          <nav aria-label="Main navigation" className={open ? 'open' : ''}>
            {nav.map((n) => (
              <div className="nav-group" key={n.id}>
                <NavLink to={n.data.url || '/'} end={n.data.url === '/'}>
                  {n.title}
                </NavLink>
                {n.data.children?.length > 0 && (
                  <div className="dropdown">
                    {n.data.children.map((l: LinkItem) => (
                      <SafeLink key={l.url} to={l.url}>
                        {l.label}
                      </SafeLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <ButtonLink to={settings.ctaUrl || '/contact'}>
            {settings.ctaText || 'Let’s talk'}
          </ButtonLink>
          <button
            className="icon-button mobile-menu"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {children || <Outlet />}
      </main>
      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <p className="eyebrow">{copy('footer.eyebrow')}</p>
              <h2>{one('footer')?.title || 'Have something in mind?'}</h2>
              <p>{footer.description}</p>
              <ButtonLink to={footer.ctaUrl || '/contact'}>
                {footer.ctaText || 'Start a conversation'}
              </ButtonLink>
            </div>
            <div className="footer-orbit" aria-hidden="true">
              <ArrowUpRight size={80} />
            </div>
          </div>
          <div className="footer-grid">
            <div>
              <Link className="brand" to="/">
                <strong>{settings.companyName || 'KWIS'}</strong>
              </Link>
              <p>{settings.description}</p>
              <p className="location">
                <MapPin size={14} />
                {one('locations')?.title}
              </p>
              <div className="socials">
                {settings.socials?.map((l: LinkItem) => (
                  <SafeLink key={l.url} to={l.url}>
                    {l.label}
                    <ArrowUpRight size={12} />
                  </SafeLink>
                ))}
              </div>
            </div>
            {footer.columns?.map((column: { title: string; links: LinkItem[] }) => (
              <div key={column.title}>
                <h4>{column.title}</h4>
                {column.links.map((l) => (
                  <SafeLink key={l.url} to={l.url}>
                    {l.label}
                  </SafeLink>
                ))}
              </div>
            ))}
            <div>
              <h4>{copy('footer.newsletterTitle')}</h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setStatus('Subscribing…');
                  try {
                    await request('/public/newsletter', send('POST', { email, website: '' }));
                    setStatus('You’re on the list. Thank you!');
                    setEmail('');
                  } catch (e) {
                    setStatus((e as Error).message);
                  }
                }}
              >
                <label className="sr-only" htmlFor="newsletter">
                  Email address
                </label>
                <div className="newsletter">
                  <input
                    id="newsletter"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                  />
                  <button aria-label="Subscribe">
                    <ArrowRight size={18} />
                  </button>
                </div>
                <small role="status">{status || copy('footer.newsletterNote')}</small>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} {settings.copyright}
            </span>
            <div>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms-and-conditions">Terms</Link>
              <a href={import.meta.env.VITE_ADMIN_URL || '#/admin/login'}>Admin</a>
            </div>
            <span>{copy('footer.signature')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
