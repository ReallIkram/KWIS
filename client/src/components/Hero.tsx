import { useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { useContent } from '../content';
import { useCopy } from '../copy';
import { ButtonLink, Reveal } from './UI';
import { ArrowDown, ArrowUpRight, Play, Pause } from 'lucide-react';
export default function Hero() {
  const copy = useCopy();
  const slides = useContent()
    .list('hero')
    .filter((s) => s.data.enabled !== false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (slides.length < 2 || paused || reduced) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [slides.length, paused, reduced]);
  const slide = slides[index % slides.length];
  if (!slide) return null;
  const d = slide.data;
  const highlight = d.highlight;
  const parts = highlight ? slide.title.split(highlight) : [slide.title];
  return (
    <section
      className={'hero ' + (d.alignment === 'center' ? 'centered' : '')}
      style={{ minHeight: d.height === 'compact' ? '65vh' : '88vh' }}
    >
      {d.video && !reduced ? (
        <video
          key={d.video}
          src={d.video}
          poster={d.poster}
          autoPlay={d.autoplay !== false}
          muted={d.muted !== false}
          loop={d.loop !== false}
          playsInline
          controls
          aria-label="KWIS hero video"
        />
      ) : d.image ? (
        <picture>
          {d.mobileImage && <source media="(max-width: 640px)" srcSet={d.mobileImage} />}
          <img className="hero-bg" src={d.image} alt={d.alt || ''} />
        </picture>
      ) : null}
      {(d.video || d.image) && (
        <div
          className="hero-overlay"
          style={{ opacity: Math.min(1, Math.max(0, Number(d.overlay) || 0)) }}
        />
      )}
      <div className="hero-grid" aria-hidden="true" />
      <div className="container hero-inner">
        <Reveal className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            {d.eyebrow}
          </p>
          <h1>
            {parts[0]}
            {highlight && parts.length > 1 && (
              <>
                <span className="gradient-text">{highlight}</span>
                {parts.slice(1).join(highlight)}
              </>
            )}
          </h1>
          <p className="hero-description">{d.description}</p>
          <div className="hero-actions">
            {d.ctaText && <ButtonLink to={d.ctaUrl || '/services'}>{d.ctaText}</ButtonLink>}
            {d.secondaryCtaText && (
              <ButtonLink secondary to={d.secondaryCtaUrl || '/contact'}>
                {d.secondaryCtaText}
              </ButtonLink>
            )}
          </div>
          <div className="hero-caption">
            <span className="mini-line" /> {copy('hero.caption')}
          </div>
        </Reveal>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orb">
            <div className="orb-core">
              k
              <span>
                <ArrowUpRight size={120} />
              </span>
            </div>
          </div>
          <span className="art-tag tag-one">
            <i />
            {copy('hero.artTag')}
          </span>
          <span className="art-tag tag-two">{copy('hero.possibility')}</span>
          <span className="art-cross cross-one">+</span>
          <span className="art-cross cross-two">+</span>
          <div className="art-coordinate">
            {copy('hero.coordinate')}
            <br />
            {copy('hero.coordinateSubtitle')}
          </div>
        </div>
      </div>
      <div className="container hero-bottom">
        <button
          onClick={() =>
            document
              .querySelector('.hero')
              ?.nextElementSibling?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
          }
        >
          <ArrowDown size={16} /> {copy('hero.scroll')}
        </button>
        <span>{copy('hero.disciplines')}</span>
        {slides.length > 1 && (
          <div className="slide-controls">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Show slide ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
            <button
              aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
