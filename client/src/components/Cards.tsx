import type { Entry } from '../types';
import { SafeLink, ArrowUpRight, icons, Reveal, Notice, RichText, Empty } from './UI';
const routes: Record<string, string> = {
  services: 'services',
  projects: 'portfolio',
  team: 'team',
  blog: 'blog',
  careers: 'careers',
};
export function ContentCard({ entry, index = 0 }: { entry: Entry; index?: number }) {
  const { data: d, kind, title, slug } = entry;
  const Icon = icons[d.icon] || icons.code;
  const url = routes[kind] ? `/${routes[kind]}/${slug}` : undefined;
  return (
    <Reveal className={'content-card ' + kind}>
      <div className="card-top">
        {d.image ? (
          <img src={d.image} alt={d.alt || title} loading="lazy" />
        ) : kind === 'services' ? (
          <Icon size={27} />
        ) : kind === 'team' ? (
          <div className="avatar">
            {title
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
        ) : (
          <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
        )}
        {url && (
          <SafeLink to={url} className="card-arrow" aria-label={`View ${title}`}>
            <ArrowUpRight size={19} />
          </SafeLink>
        )}
      </div>
      {d.example && <span className="example">EXAMPLE CONTENT</span>}
      {d.category && <p className="eyebrow small">{d.category}</p>}
      <h3>{url ? <SafeLink to={url}>{title}</SafeLink> : title}</h3>
      {d.position && <p className="position">{d.position}</p>}
      <p>{d.description || d.bio}</p>
      {d.technologies?.length > 0 && (
        <div className="tags">
          {d.technologies.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      {kind === 'careers' && (
        <div className="tags">
          {[d.type, d.location, d.workMode].filter(Boolean).map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      {kind === 'testimonials' && (
        <>
          <RichText html={d.body} />
          <p>
            {d.company} · {d.rating}/5
          </p>
        </>
      )}
    </Reveal>
  );
}
export function CardGrid({ rows, limit }: { rows: Entry[]; limit?: number }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="card-grid">
      {rows.slice(0, limit).map((entry, i) => (
        <ContentCard key={entry.id || entry._id} entry={entry} index={i} />
      ))}
    </div>
  );
}
export function ExampleNotice({ show }: { show?: boolean }) {
  return show ? (
    <Notice>
      Illustrative content — capabilities and details are pending confirmation by KWIS.
    </Notice>
  ) : null;
}
