import { Content } from './models.js';
import { defaultCopy } from './default-copy.js';
export const seedRows: {
  kind: string;
  slug: string;
  title: string;
  order?: number;
  data: Record<string, unknown>;
}[] = [
  {
    kind: 'settings',
    slug: 'global',
    title: 'KWIS',
    data: {
      companyName: 'KWIS',
      fullName: 'Knowlege Web Innovative Solutions',
      tagline: 'Innovating the Web. Engineering the Future.',
      description:
        'A software studio in Abbottabad, Pakistan. We bring thoughtful design and purposeful engineering to your next digital idea.',
      ctaText: 'Let’s talk',
      ctaUrl: '/contact',
      logo: '',
      favicon: '',
      email: '',
      phone: '',
      whatsapp: '',
      hours: '',
      socials: [],
      labels: Object.entries(defaultCopy).map(([key, text]) => ({ key, text })),
      budgetOptions: ['Under $5,000', '$5,000–$15,000', '$15,000–$50,000', '$50,000+'],
      copyright: 'KWIS. All rights reserved.',
    },
  },
  {
    kind: 'theme',
    slug: 'global',
    title: 'Brand identity',
    data: {
      accent: '#5de1cf',
      secondary: '#818cf8',
      background: '#060b17',
      font: 'Inter',
      radius: '20',
      mode: 'dark',
    },
  },
  {
    kind: 'locations',
    slug: 'abbottabad',
    title: 'Abbottabad, Pakistan',
    data: {
      city: 'Abbottabad',
      province: 'Khyber Pakhtunkhwa',
      country: 'Pakistan',
      address: '',
      latitude: '',
      longitude: '',
      mapUrl: '',
      mapEmbed: '',
      phone: '',
      email: '',
      hours: '',
    },
  },
  {
    kind: 'hero',
    slug: 'home',
    title: 'Building digital experiences that shape tomorrow.',
    data: {
      eyebrow: 'YOUR NEXT CHAPTER, ENGINEERED.',
      description:
        'From the first spark to the final pixel. We turn ambitious ideas into thoughtful digital products, made to move your business forward.',
      highlight: 'shape tomorrow.',
      ctaText: 'Explore our services',
      ctaUrl: '/services',
      secondaryCtaText: 'Start a conversation',
      secondaryCtaUrl: '/contact',
      image: '',
      mobileImage: '',
      video: '',
      poster: '',
      autoplay: true,
      muted: true,
      loop: true,
      overlay: 0.65,
      alignment: 'left',
      height: 'large',
      enabled: true,
    },
  },
  {
    kind: 'pages',
    slug: 'about',
    title: 'Good people. Thoughtful technology.',
    data: {
      eyebrow: 'MEET KWIS',
      description:
        'We are Knowlege Web Innovative Solutions, a software studio based in Abbottabad, Khyber Pakhtunkhwa, Pakistan. We believe the best digital experiences begin with understanding people.',
      body: '<h2>Built around your next idea.</h2><p>Our purpose is to help businesses explore what technology can make possible. We start by listening, work with transparency, and give every detail the attention it deserves.</p><h2>Our mission</h2><p>To transform meaningful ideas into useful, accessible digital experiences.</p><h2>Our vision</h2><p>A future where thoughtful technology helps businesses and communities thrive.</p>',
    },
  },
  {
    kind: 'pages',
    slug: 'contact',
    title: 'Great things begin with a conversation.',
    data: {
      eyebrow: 'LET’S BUILD SOMETHING',
      description: 'Tell us what you have in mind. We would love to explore it with you.',
    },
  },
  {
    kind: 'pages',
    slug: 'services',
    title: 'Ideas into impact.',
    data: {
      eyebrow: 'OUR CAPABILITIES',
      description:
        'Explore a starting point for your next digital project. These proposed capabilities are example content, pending confirmation by KWIS.',
      example: true,
    },
  },
  {
    kind: 'pages',
    slug: 'portfolio',
    title: 'Work with purpose.',
    data: {
      eyebrow: 'SELECTED WORK',
      description:
        'A space for the digital experiences we build. Verified projects will be shared here.',
    },
  },
  {
    kind: 'pages',
    slug: 'team',
    title: 'The minds behind what’s next.',
    data: {
      eyebrow: 'OUR PEOPLE',
      description: 'Meet the people shaping KWIS. Team profiles will appear here when published.',
    },
  },
  {
    kind: 'pages',
    slug: 'technologies',
    title: 'The right tools for the right idea.',
    data: {
      eyebrow: 'OUR TOOLKIT',
      description:
        'Technology choices begin with your goals. Example tools below are illustrative, not a verified list of company expertise.',
      example: true,
    },
  },
  {
    kind: 'pages',
    slug: 'industries',
    title: 'Different worlds. Shared possibilities.',
    data: {
      eyebrow: 'INDUSTRIES',
      description: 'Tell us about your industry and the challenges you want to solve.',
    },
  },
  {
    kind: 'pages',
    slug: 'blog',
    title: 'A little perspective goes a long way.',
    data: {
      eyebrow: 'INSIGHTS & IDEAS',
      description: 'Notes on design, engineering, and building things that matter.',
    },
  },
  {
    kind: 'pages',
    slug: 'careers',
    title: 'Build your next chapter.',
    data: {
      eyebrow: 'CAREERS AT KWIS',
      description:
        'Curious minds and thoughtful makers. Discover opportunities when positions are published.',
    },
  },
  {
    kind: 'pages',
    slug: 'privacy-policy',
    title: 'Privacy policy',
    data: {
      description: 'Draft policy — requires company and legal review before launch.',
      body: '<p>KWIS collects information submitted through contact, newsletter, and job application forms to respond to inquiries and evaluate applications. Do not submit sensitive personal information.</p><p>Administrator authentication uses essential session cookies. Contact KWIS to request access, correction, or deletion of your submitted information. Retention periods, contact details, processors, and applicable legal rights must be finalized before production launch.</p>',
      example: true,
    },
  },
  {
    kind: 'pages',
    slug: 'terms-and-conditions',
    title: 'Terms & conditions',
    data: {
      description: 'Draft terms — requires company and legal review before launch.',
      body: '<p>Website content is provided for general information. Project engagements require a separate written agreement. Service availability and any example content do not constitute an offer or guarantee.</p><p>These draft terms must be reviewed and completed with applicable business details and governing law before launch.</p>',
      example: true,
    },
  },
  {
    kind: 'footer',
    slug: 'global',
    title: 'Have something in mind?',
    data: {
      description: 'Let’s make something that matters.',
      ctaText: 'Start a conversation',
      ctaUrl: '/contact',
      columns: [
        {
          title: 'Explore',
          links: [
            { label: 'About KWIS', url: '/about' },
            { label: 'Our services', url: '/services' },
            { label: 'Our work', url: '/portfolio' },
          ],
        },
        {
          title: 'Connect',
          links: [
            { label: 'Our people', url: '/team' },
            { label: 'Careers', url: '/careers' },
            { label: 'Contact', url: '/contact' },
          ],
        },
      ],
    },
  },
  ...[
    'Home',
    'About',
    'Services',
    'Portfolio',
    'Our Team',
    'Technologies',
    'Careers',
    'Blog',
    'Contact',
  ].map((title, i) => ({
    kind: 'navigation',
    slug: title.toLowerCase().replace(/ /g, '-'),
    title,
    order: i,
    data: {
      url: [
        '/',
        '/about',
        '/services',
        '/portfolio',
        '/team',
        '/technologies',
        '/careers',
        '/blog',
        '/contact',
      ][i],
      enabled: true,
      children: [],
    },
  })),
  ...[
    'Web development',
    'Mobile applications',
    'Custom software',
    'UI / UX design',
    'Artificial intelligence',
    'Cloud & DevOps',
    'Digital solutions',
  ].map((title, i) => ({
    kind: 'services',
    slug: [
      'web-development',
      'mobile-applications',
      'custom-software',
      'ui-ux-design',
      'artificial-intelligence',
      'cloud-devops',
      'digital-solutions',
    ][i],
    title,
    order: i,
    data: {
      description: [
        'Fast, intuitive websites and web applications built around the people who use them.',
        'Meaningful mobile experiences, thoughtfully designed for life on the move.',
        'Software shaped around your workflows, your people, and your next stage of growth.',
        'Clear, considered interfaces that make complex things feel effortless.',
        'Explore practical ways to bring intelligence and automation into your products.',
        'Reliable foundations for products that are ready to grow.',
        'Connect your systems and move your business into its next digital chapter.',
      ][i],
      category: 'Proposed capabilities',
      body: '<p>This is an illustrative service description. KWIS will confirm capabilities, scope, deliverables, and timelines during consultation.</p>',
      features: ['Discovery & strategy', 'Purposeful design', 'Quality-focused delivery'],
      technologies: [],
      featured: true,
      example: true,
      icon: ['code', 'mobile', 'layers', 'pen', 'sparkles', 'cloud', 'globe'][i],
      ctaText: 'Discuss your project',
      ctaUrl: '/contact',
    },
  })),
  ...['React', 'TypeScript', 'Node.js', 'MongoDB', 'Figma', 'Docker'].map((title, i) => ({
    kind: 'technologies',
    slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    title,
    order: i,
    data: {
      category: ['Frontend', 'Frontend', 'Backend', 'Database', 'Design', 'DevOps'][i],
      example: true,
    },
  })),
  ...['Discovery', 'Strategy', 'Design', 'Development', 'Quality assurance', 'Launch & evolve'].map(
    (title, i) => ({
      kind: 'process',
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      order: i,
      data: {
        description: [
          'We listen, ask questions, and get to the heart of your idea.',
          'We connect your goals to a clear, practical roadmap.',
          'We shape intuitive experiences with people at the center.',
          'We bring the details together through careful engineering.',
          'We test what matters, from everyday use to edge cases.',
          'We help your product take its first step, and its next.',
        ][i],
        example: true,
      },
    }),
  ),
  ...['People before pixels', 'Clarity at every step', 'Built for what’s next'].map((title, i) => ({
    kind: 'sections',
    slug: 'value-' + i,
    title,
    order: i + 3,
    data: {
      type: 'text',
      page: 'about',
      description: [
        'Thoughtful experiences begin with understanding the people who use them.',
        'Open conversations, shared expectations, and a clear path forward.',
        'Decisions today should make tomorrow easier.',
      ][i],
      enabled: true,
    },
  })),
  {
    kind: 'sections',
    slug: 'home-hero',
    title: 'Homepage hero',
    order: 0,
    data: { type: 'hero', page: 'home', enabled: true },
  },
  {
    kind: 'sections',
    slug: 'home-services',
    title: 'From possibility to powerful.',
    order: 1,
    data: {
      type: 'services',
      page: 'home',
      eyebrow: 'WHAT WE CAN BUILD TOGETHER',
      description: 'A considered approach to every digital challenge.',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-about',
    title: 'Small details. Bigger possibilities.',
    order: 2,
    data: {
      type: 'image-text',
      page: 'home',
      eyebrow: 'THOUGHTFUL BY DESIGN',
      description:
        'Based in Abbottabad. Thinking beyond boundaries. We bring curiosity, craft, and a collaborative spirit to every conversation.',
      ctaText: 'Get to know KWIS',
      ctaUrl: '/about',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-process',
    title: 'A clear path from idea to impact.',
    order: 3,
    data: {
      type: 'process',
      page: 'home',
      eyebrow: 'HOW WE WORK',
      description: 'Great outcomes start with a shared understanding.',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-projects',
    title: 'Purpose in every pixel.',
    order: 4,
    data: {
      type: 'projects',
      page: 'home',
      eyebrow: 'SELECTED WORK',
      description: 'Real work. Meaningful challenges. Our project stories will live here.',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-technologies',
    title: 'Thoughtfully chosen. Carefully connected.',
    order: 5,
    data: {
      type: 'technologies',
      page: 'home',
      eyebrow: 'THE TOOLKIT',
      description: 'An illustrative selection of modern technologies.',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-testimonials',
    title: 'Good work starts with trust.',
    order: 6,
    data: {
      type: 'testimonials',
      page: 'home',
      eyebrow: 'CLIENT PERSPECTIVES',
      description: 'Verified client stories will be published here.',
      enabled: true,
    },
  },
  {
    kind: 'sections',
    slug: 'home-cta',
    title: 'Your next big idea starts here.',
    order: 7,
    data: {
      type: 'cta',
      page: 'home',
      description: 'Let’s turn “what if” into what’s next.',
      ctaText: 'Let’s build together',
      ctaUrl: '/contact',
      enabled: true,
    },
  },
];
export async function seed() {
  let count = 0;
  for (const row of seedRows) {
    const order = row.order || 0;
    const result = await Content.updateOne(
      { kind: row.kind, slug: row.slug },
      {
        $setOnInsert: {
          ...row,
          order,
          published: { title: row.title, slug: row.slug, order, data: row.data },
          publishedAt: new Date(),
        },
      },
      { upsert: true },
    );
    count += result.upsertedCount;
  }
  return count;
}
