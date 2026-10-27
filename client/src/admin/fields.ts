export type Field = {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'textarea'
    | 'rich'
    | 'number'
    | 'boolean'
    | 'media'
    | 'tags'
    | 'select'
    | 'array'
    | 'color';
  options?: string[];
  fields?: Field[];
  hint?: string;
};
const f = (
  key: string,
  label: string,
  type: Field['type'] = 'text',
  extra: Partial<Field> = {},
): Field => ({ key, label, type, ...extra });
const linkFields = [f('label', 'Label'), f('url', 'Link URL')];
const imageFields = [f('url', 'Image URL', 'media'), f('alt', 'Alternative text')];
const common = [
  f('description', 'Short description', 'textarea'),
  f('body', 'Main content', 'rich'),
  f('image', 'Cover image', 'media'),
  f('alt', 'Image alternative text'),
  f('category', 'Category'),
  f('featured', 'Featured', 'boolean'),
  f('example', 'Label as example content', 'boolean'),
];
const seo = [
  f('seoTitle', 'SEO title'),
  f('seoDescription', 'Meta description', 'textarea'),
  f('ogImage', 'Social sharing image', 'media'),
  f('canonical', 'Canonical URL'),
  f('noindex', 'Hide from search engines', 'boolean'),
  f('excludeSitemap', 'Exclude from sitemap', 'boolean'),
];
const cta = [f('ctaText', 'Button text'), f('ctaUrl', 'Button link')];
const options = (key: string, label: string, values: string[]) =>
  f(key, label, 'select', { options: values });
export const fields: Record<string, Field[]> = {
  settings: [
    f('companyName', 'Company name'),
    f('fullName', 'Full company name'),
    f('tagline', 'Tagline'),
    f('description', 'Company description', 'textarea'),
    f('logo', 'Logo', 'media'),
    f('favicon', 'Favicon', 'media'),
    ...cta,
    f('email', 'Contact email'),
    f('phone', 'Phone'),
    f('whatsapp', 'WhatsApp (international format)'),
    f('hours', 'Office hours'),
    f('copyright', 'Copyright text'),
    f('socials', 'Social links', 'array', { fields: linkFields }),
    f('labels', 'Public website labels', 'array', {
      fields: [f('key', 'Label key (see admin guide)'), f('text', 'Display text')],
    }),
    f('budgetOptions', 'Contact budget options', 'tags'),
  ],
  navigation: [
    f('url', 'Destination'),
    f('enabled', 'Show in navigation', 'boolean'),
    f('children', 'Dropdown links', 'array', { fields: linkFields }),
  ],
  footer: [
    f('description', 'Description', 'textarea'),
    ...cta,
    f('columns', 'Footer columns', 'array', {
      fields: [f('title', 'Column heading'), f('links', 'Links', 'array', { fields: linkFields })],
    }),
  ],
  pages: [f('eyebrow', 'Small heading'), ...common, ...seo],
  hero: [
    f('eyebrow', 'Small heading'),
    f('highlight', 'Highlighted words (match heading exactly)'),
    f('description', 'Description', 'textarea'),
    f('image', 'Background image', 'media'),
    f('mobileImage', 'Mobile background image', 'media'),
    f('video', 'Background video', 'media'),
    f('poster', 'Video poster', 'media'),
    f('alt', 'Image alternative text'),
    f('autoplay', 'Autoplay video', 'boolean'),
    f('muted', 'Mute video', 'boolean'),
    f('loop', 'Loop video', 'boolean'),
    f('overlay', 'Overlay opacity (0–1)', 'number'),
    options('alignment', 'Text alignment', ['left', 'center']),
    options('height', 'Hero height', ['large', 'compact']),
    f('enabled', 'Enable slide', 'boolean'),
    ...cta,
    f('secondaryCtaText', 'Second button text'),
    f('secondaryCtaUrl', 'Second button URL'),
    ...seo,
  ],
  sections: [
    options('type', 'Section component', [
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
    ]),
    f('page', 'Page slug (home, about, or another page slug)'),
    f('enabled', 'Show section', 'boolean'),
    f('eyebrow', 'Small heading'),
    f('description', 'Description', 'textarea'),
    f('body', 'Content', 'rich'),
    f('image', 'Image', 'media'),
    f('alt', 'Image alternative text'),
    f('video', 'Video', 'media'),
    f('poster', 'Poster', 'media'),
    f('background', 'Background color', 'color'),
    options('layout', 'Layout', ['default', 'alternate']),
    ...cta,
    f('items', 'FAQ items', 'array', {
      fields: [f('question', 'Question'), f('answer', 'Answer', 'textarea')],
    }),
    f('images', 'Gallery images', 'array', { fields: imageFields }),
    f('cards', 'Custom cards', 'array', {
      fields: [
        f('title', 'Title'),
        f('description', 'Description', 'textarea'),
        f('image', 'Image', 'media'),
      ],
    }),
  ],
  services: [
    ...common,
    options('icon', 'Icon', ['code', 'mobile', 'layers', 'pen', 'sparkles', 'cloud', 'globe']),
    f('features', 'Features', 'tags'),
    f('benefits', 'Benefits', 'tags'),
    f('technologies', 'Technologies', 'tags'),
    f('relatedProjects', 'Related project slugs', 'tags'),
    ...cta,
    ...seo,
  ],
  projects: [
    ...common,
    f('overview', 'Project overview', 'rich'),
    f('challenges', 'Challenges', 'rich'),
    f('solutions', 'Solutions', 'rich'),
    f('results', 'Verified results', 'rich'),
    f('technologies', 'Technologies', 'tags'),
    f('images', 'Gallery images', 'array', { fields: imageFields }),
    f('video', 'Video', 'media'),
    f('liveUrl', 'Live project URL'),
    f('github', 'GitHub URL'),
    ...seo,
  ],
  team: [
    f('position', 'Job title'),
    f('department', 'Department'),
    f('bio', 'Biography', 'textarea'),
    f('experience', 'Experience summary', 'rich'),
    f('skills', 'Skills', 'tags'),
    f('image', 'Photograph', 'media'),
    f('alt', 'Photo alternative text'),
    f('linkedin', 'LinkedIn URL'),
    f('github', 'GitHub URL'),
    f('portfolio', 'Portfolio URL'),
    f('featured', 'Featured', 'boolean'),
    ...seo,
  ],
  technologies: [
    f('category', 'Category'),
    f('image', 'Icon image', 'media'),
    f('description', 'Description', 'textarea'),
    f('example', 'Example technology', 'boolean'),
  ],
  testimonials: [
    f('description', 'Testimonial', 'textarea'),
    f('company', 'Company'),
    f('position', 'Designation'),
    f('image', 'Client photo', 'media'),
    f('video', 'Video testimonial', 'media'),
    f('rating', 'Rating (1–5)', 'number'),
    f('featured', 'Featured', 'boolean'),
  ],
  blog: [
    ...common,
    f('author', 'Author'),
    f('tags', 'Tags', 'tags'),
    f('images', 'Additional images', 'array', { fields: imageFields }),
    ...seo,
  ],
  careers: [
    ...common,
    f('department', 'Department'),
    options('type', 'Job type', ['Full time', 'Part time', 'Contract', 'Internship']),
    f('location', 'Location'),
    options('workMode', 'Work arrangement', ['Remote', 'On-site', 'Hybrid']),
    f('requirements', 'Requirements', 'rich'),
    f('responsibilities', 'Responsibilities', 'rich'),
    f('deadline', 'Application deadline (YYYY-MM-DD)'),
    f('closed', 'Close applications', 'boolean'),
    ...seo,
  ],
  industries: [...common],
  process: [
    f('description', 'Description', 'textarea'),
    options('icon', 'Icon', ['code', 'mobile', 'layers', 'pen', 'sparkles', 'cloud', 'globe']),
  ],
  statistics: [
    f('number', 'Verified number', 'number'),
    f('suffix', 'Suffix'),
    options('icon', 'Icon', ['code', 'mobile', 'layers', 'pen', 'sparkles', 'cloud', 'globe']),
  ],
  faq: [f('description', 'Answer', 'textarea')],
  seo: [...seo],
  theme: [
    f('accent', 'Primary accent', 'color'),
    f('secondary', 'Secondary accent', 'color'),
    f('background', 'Page background', 'color'),
    options('font', 'Font family', ['Inter', 'Arial', 'Georgia', 'system-ui']),
    f('radius', 'Corner radius', 'number'),
    options('mode', 'Theme mode', ['dark', 'light']),
  ],
  locations: [
    f('country', 'Country'),
    f('province', 'Province'),
    f('city', 'City'),
    f('address', 'Full street address'),
    f('latitude', 'Latitude'),
    f('longitude', 'Longitude'),
    f('mapUrl', 'Map link'),
    f('mapEmbed', 'Google Maps embed URL (https://www.google.com/maps/embed…)'),
    f('phone', 'Office phone'),
    f('email', 'Office email'),
    f('hours', 'Working hours'),
  ],
};
export const modules = [
  ['dashboard', 'Overview'],
  ['content', 'Website content'],
  ['homepage', 'Homepage builder'],
  ['pages', 'Pages'],
  ['hero', 'Hero slides'],
  ['media', 'Media library'],
  ['services', 'Services'],
  ['projects', 'Portfolio projects'],
  ['team', 'Team members'],
  ['technologies', 'Technologies'],
  ['testimonials', 'Testimonials'],
  ['industries', 'Industries'],
  ['process', 'Development process'],
  ['statistics', 'Statistics'],
  ['faq', 'FAQs'],
  ['blog', 'Blog posts'],
  ['careers', 'Careers'],
  ['applications', 'Applications'],
  ['messages', 'Contact inbox'],
  ['subscribers', 'Subscribers'],
  ['navigation', 'Navigation'],
  ['footer', 'Footer'],
  ['seo', 'SEO manager'],
  ['theme', 'Theme & branding'],
  ['locations', 'Office locations'],
  ['settings', 'Website settings'],
  ['users', 'User management'],
  ['activity', 'Activity log'],
  ['profile', 'My profile'],
];
