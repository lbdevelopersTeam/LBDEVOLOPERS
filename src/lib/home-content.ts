import type { BlogPost, Project } from './content';

const project = (
  id: string,
  title: string,
  slug: string,
  shortDescription: string,
  image: string,
  category: string,
  technologies: string[],
): Project => ({
  id, title, slug, shortDescription, image, thumbnail: image, category, technologies,
  fullDescription: '', gallery: [], featured: true, status: 'published', sortOrder: 0,
  description: shortDescription,
});

// Exactly the records rendered by the existing curated merge on the homepage,
// without shipping full case studies, team biographies, and galleries at startup.
export const homeFallbackProjects: Project[] = [
  project('project-vogue-decor', 'Vogue Decor', 'vogue-decor', 'A furniture storefront connecting collection discovery with responsive shopping through Shopify and a custom interface.', '/images/voguedecor.com.webp', 'E-commerce', ['React', 'Shopify', 'Headless Commerce', 'Storefront API']),
  project('project-american-dream-auto-protect', 'American Dream Auto Protect', 'american-dream-auto-protect', 'Vehicle protection website focused on credibility, plan clarity, and qualified quote requests.', '/images/americandreamautoprotect.com.webp', 'Web', ['WordPress', 'Lead Generation', 'Quote Funnel', 'Responsive Design']),
  project('project-pedro-clavero', 'Pedro Clavero', 'pedro-clavero', 'A professional website that brings services, educational content, and inquiries into a clear WordPress experience.', '/images/pedroclavero.com.webp', 'Web', ['WordPress', 'Custom Theme', 'Responsive Design', 'SEO']),
  project('project-riaz-crockery', 'Riaz Crockery', 'riaz-crockery', 'A crockery storefront built around category-led shopping and responsive product discovery.', '/images/Riaz Crockery.webp', 'E-commerce', ['Shopify', 'Liquid', 'E-commerce UX', 'Responsive Design']),
];

export const homeFallbackBlogs: BlogPost[] = [{
  id: '1713801600000',
  title: 'Engineering for Velocity: Why Speed is a Feature',
  slug: 'engineering-for-velocity-why-speed-is-a-feature',
  excerpt: "Speed isn't just about loading charts. It's about reducing friction between the user and their goals.",
  content: '<p>Speed is a foundation for trust, clarity, and conversion.</p>',
  coverImage: '/images/webdevolopmentservice.webp',
  image: '/images/webdevolopmentservice.webp',
  category: 'Architecture', tags: ['Performance'], author: 'Laiba Sahibzada', status: 'published',
  publishedAt: '2026-04-18T00:00:00.000Z', readingTime: '8 min read', time: '8 min read', date: 'April 18, 2026',
}];
