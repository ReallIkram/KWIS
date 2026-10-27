import { useContent } from '../content';
import { useCopy } from '../copy';
import type { Entry } from '../types';
import { SectionHeading, ButtonLink, RichText, Reveal } from './UI';
import { CardGrid } from './Cards';
import ContactForm from './ContactForm';
import Hero from './Hero';
export const sectionTypes = [
  'hero',
  'text',
  'image-text',
  'services',
  'team',
  'projects',
  'testimonials',
  'statistics',
  'cta',
  'faq',
  'gallery',
  'video',
  'technologies',
  'contact',
  'cards',
  'process',
];
export function Section({ entry }: { entry: Entry }) {
  const { list } = useContent();
  const copy = useCopy();
  const d = entry.data;
  if (d.enabled === false) return null;
  if (d.type === 'hero') return <Hero />;
  const background = /^#[0-9a-f]{6}$/i.test(d.background || '') ? d.background : undefined;
  const type = d.type;
  return (
    <section
      className={
        'section ' +
        (type === 'cta' ? 'cta-section ' : '') +
        (d.layout === 'alternate' ? 'alternate' : '')
      }
      style={{ background }}
    >
      <div className="container">
        <SectionHeading eyebrow={d.eyebrow} title={entry.title} description={d.description} />
        {['services', 'team', 'projects', 'testimonials', 'cards'].includes(type) && (
          <CardGrid
            rows={
              type === 'cards'
                ? (d.cards || []).map((c: any, i: number) => ({
                    id: String(i),
                    title: c.title,
                    data: c,
                    kind: 'cards',
                  }))
                : list(type)
            }
            limit={type === 'services' ? 6 : undefined}
          />
        )}
        {type === 'image-text' && (
          <div className="image-text">
            {d.image ? (
              <img loading="lazy" src={d.image} alt={d.alt || entry.title} />
            ) : (
              <div className="abstract-panel" aria-hidden="true">
                <span>{copy('about.word1')}</span>
                <span>{copy('about.word2')}</span>
                <span className="gradient-text">{copy('about.word3')}</span>
                <i>{copy('about.caption')}</i>
              </div>
            )}
            <div>
              <RichText html={d.body} />
              {d.ctaText && <ButtonLink to={d.ctaUrl || '/about'}>{d.ctaText}</ButtonLink>}
            </div>
          </div>
        )}
        {type === 'process' && (
          <div className="process-grid">
            {list('process').map((r, i) => (
              <Reveal key={r.id}>
                <span className="process-number">{String(i + 1).padStart(2, '0')}</span>
                <h3>{r.title}</h3>
                <p>{r.data.description}</p>
              </Reveal>
            ))}
          </div>
        )}
        {type === 'technologies' && (
          <div className="tech-grid">
            {list('technologies').map((t) => (
              <div key={t.id}>
                {t.data.image && <img src={t.data.image} alt="" loading="lazy" />}
                <strong>{t.title}</strong>
                <span>
                  {t.data.category}
                  {t.data.example ? ' · Example' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
        {type === 'statistics' && (
          <div className="stats-grid">
            {list('statistics').map((t) => (
              <div key={t.id}>
                <strong>
                  {t.data.number}
                  {t.data.suffix}
                </strong>
                <p>{t.title}</p>
              </div>
            ))}
          </div>
        )}
        {type === 'faq' && (
          <div className="faqs">
            {(
              d.items || list('faq').map((r) => ({ question: r.title, answer: r.data.description }))
            ).map((item: any, i: number) => (
              <details key={i}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        )}
        {type === 'gallery' && (
          <div className="gallery">
            {d.images?.map((image: any, i: number) => (
              <img key={i} src={image.url} alt={image.alt || ''} loading="lazy" />
            ))}
          </div>
        )}
        {type === 'video' && d.video && (
          <video className="section-video" controls src={d.video} poster={d.poster} playsInline />
        )}
        {type === 'text' && <RichText html={d.body} />} {type === 'contact' && <ContactForm />}
        {type === 'cta' && d.ctaText && (
          <ButtonLink to={d.ctaUrl || '/contact'}>{d.ctaText}</ButtonLink>
        )}
      </div>
    </section>
  );
}
export default function Sections({ page }: { page: string }) {
  const rows = useContent()
    .list('sections')
    .filter((r) => r.data.page === page);
  return (
    <>
      {rows.map((r) => (
        <Section key={r.id || r._id} entry={r} />
      ))}
    </>
  );
}
