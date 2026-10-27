import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Code2,
  Smartphone,
  Layers,
  PenTool,
  Sparkles,
  Cloud,
  Globe,
  Plus,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import DOMPurify from 'dompurify';
import type { ReactNode } from 'react';
import { useCopy } from '../copy';
export const icons: Record<string, typeof Code2> = {
  code: Code2,
  mobile: Smartphone,
  layers: Layers,
  pen: PenTool,
  sparkles: Sparkles,
  cloud: Cloud,
  globe: Globe,
};
export function SafeLink({
  to,
  children,
  className = '',
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const safe = /^(https?:\/\/|mailto:|tel:|\/[^/]|\/$|#)/i.test(to);
  if (!safe) return <span className={className}>{children}</span>;
  return /^https?:|^mailto:|^tel:/.test(to) ? (
    <a className={className} href={to} rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ) : (
    <Link className={className} to={to} {...props}>
      {children}
    </Link>
  );
}
export function ButtonLink({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <SafeLink to={to} className={'button ' + (secondary ? 'secondary' : '')}>
      {children}
      <ArrowUpRight size={17} />
    </SafeLink>
  );
}
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.55 }}
    >
      {children}
    </motion.div>
  );
}
export function RichText({ html }: { html?: string }) {
  return html ? (
    <div className="prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
  ) : null;
}
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="section-heading">
      {eyebrow && (
        <p className="eyebrow">
          <span />
          {eyebrow}
        </p>
      )}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
export function Empty({ title, text }: { title?: string; text?: string }) {
  const copy = useCopy();
  return (
    <div className="empty">
      <Plus size={24} />
      <h3>{title ?? copy('empty.title')}</h3>
      <p>{text ?? copy('empty.description')}</p>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}
export { ArrowRight, ArrowUpRight };
