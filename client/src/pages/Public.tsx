import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { MapPin, ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { useContent } from '../content';
import { useCopy } from '../copy';
import { SectionHeading, ButtonLink, RichText, SafeLink, Notice } from '../components/UI';
import { CardGrid, ExampleNotice } from '../components/Cards';
import Sections from '../components/Sections';
import ContactForm from '../components/ContactForm';
import { request } from '../api';
export function Home() {
  return <Sections page="home" />;
}
const collection: Record<string, string> = {
  portfolio: 'projects',
  team: 'team',
  services: 'services',
  technologies: 'technologies',
  industries: 'industries',
  blog: 'blog',
  careers: 'careers',
};
export function PublicPage() {
  const location = useLocation();
  const slug = location.pathname.split('/')[1] || 'about';
  const { one, list } = useContent();
  const page = one('pages', slug);
  const kind = collection[slug];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [number, setNumber] = useState(1);
  const rows = kind ? list(kind) : [];
  const categories = [
    ...new Set(rows.map((r) => r.data.category || r.data.department).filter(Boolean)),
  ] as string[];
  const filtered = rows.filter(
    (r) =>
      (category === 'All' || (r.data.category || r.data.department) === category) &&
      `${r.title} ${r.data.description || ''}`.toLowerCase().includes(search.toLowerCase()),
  );
  if (!page) return <NotFound />;
  return (
    <>
      <div className="page-hero container">
        <p className="eyebrow">
          <span />
          {page.data.eyebrow || 'KWIS'}
        </p>
        <h1>{page.title}</h1>
        <p>{page.data.description}</p>
        <ExampleNotice show={page.data.example} />
      </div>
      <section className="section page-body">
        <div className="container">
          <RichText html={page.data.body} />
          {page.data.image && (
            <img className="page-cover" src={page.data.image} alt={page.data.alt || page.title} />
          )}{' '}
          {kind && (
            <>
              <div className="list-toolbar">
                <div className="filters">
                  {['All', ...categories].map((c) => (
                    <button
                      key={c}
                      className={category === c ? 'active' : ''}
                      onClick={() => {
                        setCategory(c);
                        setNumber(1);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="search">
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setNumber(1);
                    }}
                    placeholder={`Search ${slug}`}
                    aria-label={`Search ${slug}`}
                  />
                </label>
              </div>
              <CardGrid rows={filtered.slice((number - 1) * 9, number * 9)} />
              {filtered.length > 9 && (
                <div className="pagination">
                  <button disabled={number === 1} onClick={() => setNumber((n) => n - 1)}>
                    Previous
                  </button>
                  <span>
                    Page {number} of {Math.ceil(filtered.length / 9)}
                  </span>
                  <button
                    disabled={number * 9 >= filtered.length}
                    onClick={() => setNumber((n) => n + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          {slug === 'contact' && <Contact />}
        </div>
      </section>
      <Sections page={slug} />
    </>
  );
}
function Contact() {
  const copy = useCopy();
  const locations = useContent().list('locations');
  const settings = useContent().one('settings')?.data || {};
  return (
    <div className="contact-layout">
      <div>
        <h2>{copy('contact.heading')}</h2>
        <ContactForm />
      </div>
      <aside>
        {locations.map((l) => (
          <div className="contact-location" key={l.id}>
            <MapPin />
            <h3>{l.title}</h3>
            <p>
              {[l.data.address, l.data.city, l.data.province, l.data.country]
                .filter(Boolean)
                .join(', ')}
            </p>
            {(l.data.email || settings.email) && (
              <SafeLink to={'mailto:' + (l.data.email || settings.email)}>
                {l.data.email || settings.email}
              </SafeLink>
            )}
            {(l.data.phone || settings.phone) && (
              <SafeLink to={'tel:' + (l.data.phone || settings.phone)}>
                {l.data.phone || settings.phone}
              </SafeLink>
            )}
            <p>{l.data.hours || settings.hours}</p>
            <SafeLink to={l.data.mapUrl || locationMap(l.data, false)}>
              Open map <ArrowUpRight size={15} />
            </SafeLink>
            <iframe
              title={`Map of ${l.title}`}
              src={
                /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(l.data.mapEmbed || '')
                  ? l.data.mapEmbed
                  : locationMap(l.data, true)
              }
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
        {settings.whatsapp && (
          <SafeLink to={'https://wa.me/' + settings.whatsapp.replace(/\D/g, '')}>
            Chat on WhatsApp <ArrowUpRight size={15} />
          </SafeLink>
        )}
      </aside>
    </div>
  );
}
export function Detail() {
  const copy = useCopy();
  const { slug } = useParams();
  const path = useLocation().pathname.split('/')[1];
  const kind = collection[path];
  const { one, list } = useContent();
  const row = one(kind, slug);
  if (!row) return <NotFound />;
  const d = row.data;
  return (
    <article className="container detail">
      <Link to={'/' + path} className="back-link">
        <ArrowLeft size={15} />
        Back to {path}
      </Link>
      <p className="eyebrow">{d.category || d.department || path}</p>
      <h1>{row.title}</h1>
      <p className="detail-description">{d.description || d.position}</p>
      <ExampleNotice show={d.example} />
      {d.image && <img className="page-cover" src={d.image} alt={d.alt || row.title} />}
      <div className="detail-content">
        <RichText html={d.body} />
        {d.bio && <p>{d.bio}</p>}
        {[
          'overview',
          'challenges',
          'solutions',
          'results',
          'requirements',
          'responsibilities',
          'experience',
        ]
          .filter((k) => d[k])
          .map((k) => (
            <div key={k}>
              <h2>{k[0].toUpperCase() + k.slice(1)}</h2>
              <RichText html={d[k]} />
            </div>
          ))}
        {['features', 'benefits', 'skills', 'technologies', 'tags']
          .filter((k) => d[k]?.length)
          .map((k) => (
            <div key={k}>
              <h3>{k[0].toUpperCase() + k.slice(1)}</h3>
              <div className="tags">
                {d[k].map((v: string) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        {d.images?.length > 0 && (
          <div className="gallery">
            {d.images.map((img: any, i: number) => (
              <img key={i} src={img.url} alt={img.alt || row.title} loading="lazy" />
            ))}
          </div>
        )}
        {d.video && <video className="section-video" src={d.video} poster={d.poster} controls />}
        {d.author && <p className="byline">By {d.author}</p>}
        <div className="socials">
          {['linkedin', 'github', 'portfolio', 'liveUrl']
            .filter((k) => d[k])
            .map((k) => (
              <SafeLink key={k} to={d[k]}>
                {k}
                <ArrowUpRight size={14} />
              </SafeLink>
            ))}
        </div>
        {d.ctaText && <ButtonLink to={d.ctaUrl || '/contact'}>{d.ctaText}</ButtonLink>}
        {kind === 'careers' &&
          (d.closed || (d.deadline && new Date(d.deadline) < new Date()) ? (
            <Notice>{copy('application.closed')}</Notice>
          ) : (
            <Application job={row.slug} />
          ))}
        {kind === 'services' && d.relatedProjects?.length > 0 && (
          <>
            <SectionHeading title={copy('project.related')} />
            <CardGrid rows={list('projects').filter((p) => d.relatedProjects.includes(p.slug))} />
          </>
        )}
        {kind === 'blog' && (
          <>
            <SectionHeading title={copy('blog.related')} />
            <CardGrid
              rows={list('blog')
                .filter((b) => b.slug !== row.slug)
                .slice(0, 3)}
            />
          </>
        )}
      </div>
    </article>
  );
}
function Application({ job }: { job: string }) {
  const copy = useCopy();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="application-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        data.set('job', job);
        setBusy(true);
        try {
          await request('/public/applications', { method: 'POST', body: data });
          form.reset();
          setStatus('Application received. Thank you!');
        } catch (e) {
          setStatus((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>{copy('application.heading')}</h2>
      <div className="form-grid">
        {['name', 'email', 'phone', 'portfolio', 'linkedin'].map((k) => (
          <label key={k}>
            {k[0].toUpperCase() + k.slice(1)}
            {['name', 'email'].includes(k) ? ' *' : ''}
            <input
              name={k}
              type={
                k === 'email' ? 'email' : ['portfolio', 'linkedin'].includes(k) ? 'url' : 'text'
              }
              required={['name', 'email'].includes(k)}
              maxLength={k === 'name' ? 100 : 254}
            />
          </label>
        ))}
      </div>
      <label>
        Cover letter *<textarea name="message" minLength={10} maxLength={10000} required rows={5} />
      </label>
      <label>
        Resume (PDF, up to 5 MB) *
        <input type="file" name="resume" accept="application/pdf" required />
      </label>
      <input className="honeypot" name="website" tabIndex={-1} aria-hidden="true" />
      <button className="button" disabled={busy}>
        {busy ? 'Submitting…' : copy('application.submit')}
        <ArrowUpRight size={16} />
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
export function NotFound() {
  return (
    <div className="container not-found">
      <p className="eyebrow">404 / A DIFFERENT DIRECTION</p>
      <h1>This page hasn’t taken shape.</h1>
      <p>The page may have moved or isn’t published yet.</p>
      <ButtonLink to="/">Back to KWIS</ButtonLink>
    </div>
  );
}

function locationMap(data: Record<string, any>, embed: boolean) {
  const lat = Number(data.latitude),
    lon = Number(data.longitude);
  const coordinates =
    data.latitude !== '' &&
    data.latitude !== undefined &&
    data.longitude !== '' &&
    data.longitude !== undefined &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;
  const query = coordinates
    ? `${lat},${lon}`
    : [data.address, data.city, data.province, data.country].filter(Boolean).join(', ');
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}${embed ? '&output=embed' : ''}`;
}
