import { fitImageWithin } from './image';

export const AGENCY_EMAIL = 'lbdevelopers.agency@gmail.com';
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

/**
 * Static Vite deployments have no same-origin API. Keeping the API opt-in in
 * production prevents avoidable 404s while still allowing a separate backend.
 */
export const publicApiEnabled = import.meta.env.DEV
  || import.meta.env.VITE_PUBLIC_API_ENABLED === 'true'
  || Boolean(API_BASE_URL);

export function apiRequestUrl(url: string) {
  if (!API_BASE_URL || !url.startsWith('/api/')) return url;
  return `${API_BASE_URL}${url}`;
}

export type ProjectStatus = 'draft' | 'published' | 'archived';
export type BlogStatus = 'draft' | 'published' | 'scheduled';

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface Certification {
  id: string;
  title: string;
  organization?: string;
  type?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  project?: string;
  avatar?: string;
}

export interface ProjectContributor {
  memberId: string;
  role: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  thumbnailMediaId?: string | null;
  gallery: string[];
  galleryMediaIds?: string[];
  category: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  status: ProjectStatus;
  completionDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder: number;
  memberId?: string;
  memberRole?: string;
  contributors?: ProjectContributor[];
  client?: string;
  industry?: string;
  problem?: string;
  challenge?: string;
  solution?: string;
  process?: string[];
  results?: string[];
  achievements?: string[];
  image?: string;
  description?: string;
}

export interface TeamMember {
  id: string;
  slug?: string;
  name: string;
  role: string;
  bio: string;
  fullBio?: string;
  specialization?: string;
  tagline?: string;
  avatar: string;
  avatarMediaId?: string | null;
  coverImage?: string;
  coverMediaId?: string | null;
  img?: string;
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
  yearsExperience?: string;
  languages?: string[];
  cvUrl?: string;
  cvMediaId?: string | null;
  accentColor?: string;
  skills: string[];
  skillGroups?: SkillGroup[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  testimonials?: Testimonial[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    behance?: string;
    dribbble?: string;
    instagram?: string;
    website?: string;
  };
  active: boolean;
  displayOrder: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverMediaId?: string | null;
  image?: string;
  category: string;
  tags: string[];
  author: string;
  status: BlogStatus;
  publishedAt?: string;
  liveUrl?: string;
  readingTime: string;
  time?: string;
  date?: string;
  metaTitle?: string;
  metaDescription?: string;
  related?: BlogPost[];
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

export const projectCategories = ['Web', 'Mobile', 'E-commerce', 'Custom'];
export const projectStatuses: ProjectStatus[] = ['draft', 'published', 'archived'];
export const blogStatuses: BlogStatus[] = ['draft', 'published', 'scheduled'];

export const fallbackProjects: Project[] = [
  {
    id: 'project-albawabaa',
    title: 'albawabaa.shop',
    slug: 'albawabaa-shop',
    shortDescription: 'Arabic-first WPC door storefront combining premium product presentation with localized commerce journeys.',
    fullDescription: '<p>Albawaba needed an Arabic-first commerce experience that could introduce WPC doors as a premium, practical choice for homes and commercial interiors. The platform had to explain material advantages such as water resistance, durability, sound insulation, and low maintenance without slowing down product discovery.</p><p>We organized the experience around clear RTL navigation, benefit-led storytelling, visual product comparison, and direct shopping paths. Strong imagery and concise merchandising help customers understand finish options while the responsive catalog keeps the journey comfortable on mobile.</p><p>The resulting storefront balances architectural presentation with everyday purchase clarity, giving the brand a credible digital showroom for customers in Saudi Arabia.</p>',
    thumbnail: '/images/albawabaa.shop.png',
    gallery: [],
    category: 'E-commerce',
    technologies: ['Shopify', 'RTL Commerce', 'Localization', 'Product Catalog'],
    liveUrl: 'https://albawabaa.shop/',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '',
    metaTitle: 'albawabaa.shop case study',
    metaDescription: 'Arabic WPC door commerce experience by LB CodeBase.',
    sortOrder: 1,
    image: '/images/albawabaa.shop.png',
    description: 'Arabic-first WPC door storefront with localized shopping and premium product presentation.',
    client: 'Albawaba',
    industry: 'WPC Doors & Interiors',
    problem: 'Customers needed a clear way to understand WPC door benefits, compare available finishes, and purchase from an Arabic-first storefront built around their language and browsing habits.',
    challenge: 'The interface had to support right-to-left content, communicate technical product advantages in approachable language, and preserve a premium architectural feel across desktop and mobile.',
    solution: 'We created a localized commerce journey with RTL navigation, benefit-led content blocks, visual product merchandising, best-seller discovery, and direct calls to shop. The layout gives product imagery room to lead while keeping specifications and purchase actions easy to scan.',
    process: ['Mapped Arabic customer journeys from material education to product selection.', 'Structured RTL navigation and a clear catalog hierarchy.', 'Designed benefit-led modules for durability, water resistance, maintenance, and comfort.', 'Built responsive product discovery and merchandising patterns.', 'Refined mobile browsing, calls to action, and storefront consistency.'],
    results: ['Established a focused Arabic digital showroom for the WPC door range.', 'Made key product advantages immediately understandable before purchase.', 'Created a responsive catalog journey that connects education directly to shopping.'],
    achievements: ['Arabic-first RTL commerce experience.', 'Benefit-led WPC product merchandising system.', 'Responsive storefront optimized for mobile product discovery.'],
    contributors: [{ memberId: 'team-wajid', role: 'Commerce Strategy & Technical Consulting' }, { memberId: 'team-laiba', role: 'Frontend Development & Responsive Implementation' }, { memberId: 'team-mohsin', role: 'Visual Direction & Product Presentation' }, { memberId: 'team-ibad', role: 'Lead UI/UX Design & RTL Commerce Experience' }],
  },
  {
    id: 'project-vogue-decor',
    title: 'Vogue Decor',
    slug: 'vogue-decor',
    shortDescription: 'Commercial furniture storefront built for polished discovery across seating, tables, outdoor collections, and trade buyers.',
    fullDescription: '<p>Vogue Decor serves hospitality operators, designers, and commercial buyers looking for durable seating, table systems, and outdoor furniture. The digital experience needed to make a large product catalog feel curated while still supporting fast category-based shopping.</p><p>We developed a clean commerce hierarchy around chairs, barstools, table tops, table bases, booths, bundles, and outdoor collections. Editorial campaign areas support seasonal merchandising, while clear product groupings reduce the effort required to move from inspiration to specification.</p><p>The final experience combines premium visual restraint with the practical information architecture expected by trade customers, remaining approachable for direct retail shoppers across Canada.</p>',
    thumbnail: '/images/voguedecor.com.png',
    gallery: ['/images/voguemockup.jpeg'],
    category: 'E-commerce',
    technologies: ['Shopify', 'E-commerce UX', 'Product Catalog', 'Responsive Design'],
    liveUrl: 'https://www.voguedecor.com/',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '',
    metaTitle: 'Vogue Decor case study',
    metaDescription: 'Commercial furniture e-commerce experience by LB CodeBase.',
    sortOrder: 2,
    image: '/images/voguedecor.com.png',
    description: 'Commercial furniture storefront with premium collection discovery and responsive shopping.',
    client: 'Vogue Decor',
    industry: 'Commercial Furniture',
    problem: 'A broad commercial furniture range needed a digital storefront that could serve hospitality, design, and direct-buy customers without making catalog discovery feel dense or transactional.',
    challenge: 'The experience had to balance premium brand presentation with practical navigation across numerous furniture types, seasonal campaigns, financing, and high-value purchasing considerations.',
    solution: 'We shaped a collection-led storefront with prominent category navigation, editorial merchandising, campaign visibility, and reassuring purchase information. Responsive layouts preserve product discovery and promotional clarity across screen sizes.',
    process: ['Audited the catalog structure and primary trade-buyer journeys.', 'Defined navigation for seating, table systems, outdoor furniture, and bundles.', 'Created an editorial merchandising hierarchy for collections and seasonal campaigns.', 'Designed trust and purchase-support messaging for high-value orders.', 'Optimized responsive discovery across desktop, tablet, and mobile.'],
    results: ['Unified a wide commercial catalog under a clear collection-based structure.', 'Improved the visibility of seasonal products and high-priority shopping paths.', 'Delivered a polished experience suited to both commercial and direct customers.'],
    achievements: ['Scalable catalog navigation for multiple furniture families.', 'Premium seasonal merchandising and campaign system.', 'Responsive commerce experience for Canadian customers.'],
    contributors: [{ memberId: 'team-wajid', role: 'Commerce Strategy & Technical Consulting' }, { memberId: 'team-laiba', role: 'Frontend Development & Storefront Performance' }, { memberId: 'team-mohsin', role: 'Brand Presentation & Visual Direction' }, { memberId: 'team-ibad', role: 'Lead Product Design & E-Commerce UX' }],
  },
  {
    id: 'project-american-dream-auto-protect',
    title: 'American Dream Auto Protect',
    slug: 'american-dream-auto-protect',
    shortDescription: 'Conversion-focused vehicle protection platform with clear plan education and a streamlined quote journey.',
    fullDescription: '<p>American Dream Auto Protect needed to turn a complex, trust-sensitive service into a clear digital decision journey. Visitors arrive with different vehicles, coverage needs, and levels of familiarity, so the platform had to educate without creating friction before the quote request.</p><p>We structured the experience around confidence: prominent customer proof, straightforward protection-plan explanations, scannable coverage comparisons, and a focused vehicle-and-contact quote flow. Repeated conversion paths remain visible throughout the page without competing with the educational content.</p><p>The completed platform brings brand credibility, plan discovery, and lead capture into one responsive system designed to help drivers move from uncertainty to an informed conversation.</p>',
    thumbnail: '/images/americandreamautoprotect.com.png',
    gallery: [],
    category: 'Web',
    technologies: ['Lead Generation', 'Quote Funnel', 'Responsive Design', 'Conversion Optimization'],
    liveUrl: 'https://americandreamautoprotect.com/',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '',
    metaTitle: 'American Dream Auto Protect case study',
    metaDescription: 'Vehicle protection and quote-generation platform by LB CodeBase.',
    sortOrder: 3,
    image: '/images/americandreamautoprotect.com.png',
    description: 'Vehicle protection website focused on credibility, plan clarity, and qualified quote requests.',
    client: 'American Dream Auto Protect',
    industry: 'Vehicle Protection',
    problem: 'Drivers needed an understandable way to compare vehicle protection options and request a personalized quote without navigating dense coverage language or disconnected forms.',
    challenge: 'The platform had to establish credibility quickly, explain multiple plan levels, capture detailed vehicle data, and keep the quote journey focused across long-form responsive content.',
    solution: 'We created a conversion-led information architecture combining social proof, benefit-driven messaging, plan comparison, educational resources, and a streamlined quote funnel. Calls to action are repeated at natural decision points while maintaining a consistent visual hierarchy.',
    process: ['Mapped visitor questions and the complete quote-conversion journey.', 'Prioritized trust signals, reviews, licensing context, and contact access.', 'Structured protection-plan education and coverage comparison.', 'Designed the vehicle and customer information form for clarity.', 'Optimized responsive content flow and conversion touchpoints.'],
    results: ['Consolidated plan education and quote capture into one coherent journey.', 'Made coverage options and customer trust signals easier to scan.', 'Created consistent conversion paths throughout the responsive experience.'],
    achievements: ['Structured multi-step quote acquisition experience.', 'Clear protection-plan comparison and educational hierarchy.', 'Trust-led responsive interface for a high-consideration service.'],
    contributors: [{ memberId: 'team-wajid', role: 'Lead-Flow Strategy & Technical Consulting' }, { memberId: 'team-laiba', role: 'Frontend Development & Form Implementation' }, { memberId: 'team-mohsin', role: 'Graphic Systems & Brand Presentation' }, { memberId: 'team-ibad', role: 'Lead UX Design & Conversion Optimization' }],
  },
  {
    id: 'project-pedro-clavero',
    title: 'Pedro Clavero Design',
    slug: 'pedro-clavero-design',
    shortDescription: 'Luxury weddings and events portfolio shaped around visual storytelling, service discovery, and elegant inquiries.',
    fullDescription: '<p>Pedro Clavero Design needed a digital presence capable of communicating the emotion, craft, and personal attention behind luxury weddings and events. The website had to feel editorial and atmospheric while still explaining a broad offering that includes fashion, event planning, and interior styling.</p><p>We centered the experience on immersive photography, elegant typography, and paced storytelling. Gallery, studio background, service content, and contact paths are arranged to let prospective clients move naturally from visual inspiration to practical understanding.</p><p>The finished portfolio gives the brand a distinctive stage for its work while keeping navigation and inquiries accessible across devices.</p>',
    thumbnail: '/images/pedroclavero.com.png',
    gallery: ['/images/pedroclaveromockup.jpeg'],
    category: 'Web',
    technologies: ['Luxury Branding', 'Editorial UI', 'Event Portfolio', 'Responsive Design'],
    liveUrl: 'https://pedroclavero.com/',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '',
    metaTitle: 'Pedro Clavero Design case study',
    metaDescription: 'Luxury wedding and event design portfolio by LB CodeBase.',
    sortOrder: 4,
    image: '/images/pedroclavero.com.png',
    description: 'Luxury wedding and event-design portfolio with cinematic visual storytelling.',
    client: 'Pedro Clavero Design',
    industry: 'Weddings, Fashion & Events',
    problem: 'A multidisciplinary luxury studio needed to present weddings, fashion, event management, and interior design through one emotionally coherent digital portfolio.',
    challenge: 'The site had to let rich imagery lead without obscuring service information, brand personality, navigation, or the path to a qualified inquiry.',
    solution: 'We created an editorial portfolio experience that combines cinematic imagery, refined typography, gallery-led discovery, and structured service narratives. The visual rhythm supports inspiration first, followed by context and clear contact opportunities.',
    process: ['Defined the studio narrative and primary prospective-client journeys.', 'Curated a visual hierarchy around signature wedding and event imagery.', 'Structured gallery, service, about, editorial, and contact content.', 'Refined typography and pacing to support a luxury presentation.', 'Adapted the experience for responsive browsing and inquiry access.'],
    results: ['Unified multiple creative services within one recognizable portfolio experience.', 'Established a stronger visual stage for weddings, fashion, and event work.', 'Connected inspiration-led browsing with clear studio and contact information.'],
    achievements: ['Cinematic hero and editorial portfolio direction.', 'Unified service storytelling across weddings, fashion, and interiors.', 'Responsive visual experience centered on premium imagery.'],
    contributors: [{ memberId: 'team-wajid', role: 'Digital Strategy & Technical Consulting' }, { memberId: 'team-laiba', role: 'Frontend Development & Responsive Delivery' }, { memberId: 'team-mohsin', role: 'Lead Visual Direction & Brand Presentation' }, { memberId: 'team-ibad', role: 'UI/UX Design & Service Journey Architecture' }],
  },
  {
    id: 'project-zeroma',
    title: 'zeroma.pk',
    slug: 'zeroma-pk',
    shortDescription: 'A high-performance marketplace redefining the shopping experience.',
    fullDescription: '<p>A high-performance marketplace with polished commerce flows.</p>',
    thumbnail: '/images/Zeroma.pk.png',
    gallery: ['/images/zeromamockup.jpeg'],
    category: 'E-commerce',
    technologies: ['React', 'Shopify', 'Tailwind CSS'],
    liveUrl: 'https://zeroma.pk',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-10-15',
    metaTitle: 'zeroma.pk',
    metaDescription: 'E-commerce case study.',
    sortOrder: 5,
    image: '/images/Zeroma.pk.png',
    description: 'A high-performance marketplace redefining the shopping experience.',
  },
  {
    id: 'project-mobixa',
    title: 'mobixa.pk',
    slug: 'mobixa-pk',
    shortDescription: 'Premium electronics storefront with seamless mobile shopping.',
    fullDescription: '<p>A mobile-first commerce experience for electronics customers.</p>',
    thumbnail: '/images/Mobixa.png',
    gallery: [],
    category: 'E-commerce',
    technologies: ['React', 'Express', 'Analytics'],
    liveUrl: 'https://mobixa.pk',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-08-18',
    metaTitle: 'mobixa.pk',
    metaDescription: 'Commerce case study.',
    sortOrder: 6,
    image: '/images/Mobixa.png',
    description: 'Premium electronics storefront with seamless mobile shopping.',
  },
  {
    id: 'project-jugo',
    title: 'jugo.pk',
    slug: 'jugo-pk',
    shortDescription: 'Clean, modern digital identity for a health-focused beverage brand.',
    fullDescription: '<p>A compact brand and web presence for a beverage company.</p>',
    thumbnail: '/images/Jugo.pk.png',
    gallery: ['/images/jugomockup.jpeg'],
    category: 'Custom',
    technologies: ['Brand Systems', 'React', 'Motion'],
    liveUrl: 'https://jugo.pk',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-06-21',
    metaTitle: 'jugo.pk',
    metaDescription: 'Brand case study.',
    sortOrder: 7,
    image: '/images/Jugo.pk.png',
    description: 'Clean, modern identity for a health-focused beverage brand.',
  },
  {
    id: 'project-sparkalads',
    title: 'sparkalads.com',
    slug: 'sparkalads-com',
    shortDescription: 'Dynamic portfolio and lead-generation engine for a marketing agency.',
    fullDescription: '<p>A fast, animated agency platform designed around proof, clarity, and conversion.</p>',
    thumbnail: '/images/Sparkalads.com.png',
    gallery: ['/images/sparkleadsmockup.jpeg'],
    category: 'Web',
    technologies: ['React', 'GSAP', 'Three.js', 'SEO'],
    liveUrl: 'https://sparkalads.com',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-04-05',
    metaTitle: 'sparkalads.com',
    metaDescription: 'Marketing agency website by LB CodeBase.',
    sortOrder: 8,
    image: '/images/Sparkalads.com.png',
    description: 'Dynamic portfolio and lead-generation engine for a marketing agency.',
  },
  {
    id: 'project-noor-gemstone',
    title: 'noorgemstone.com',
    slug: 'noorgemstone-com',
    shortDescription: 'Premium gemstone storefront shaped around trust, detail, and product discovery.',
    fullDescription: '<p>A refined commerce experience for a gemstone brand, built with clear product storytelling and fast browsing.</p>',
    thumbnail: '/images/Noorgemstone.com.png',
    gallery: ['/images/Noorgemstoneslaptopmockup.jpeg'],
    category: 'E-commerce',
    technologies: ['Shopify', 'Product Storytelling', 'SEO', 'Performance'],
    liveUrl: 'https://noorgemstone.com',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-03-12',
    metaTitle: 'noorgemstone.com',
    metaDescription: 'Premium gemstone commerce experience by LB CodeBase.',
    sortOrder: 9,
    image: '/images/Noorgemstone.com.png',
    description: 'Premium gemstone storefront shaped around trust, detail, and product discovery.',
  },
  {
    id: 'project-zaroofragrances',
    title: 'zaroofragrances.com',
    slug: 'zaroofragrances-com',
    shortDescription: 'Elegant fragrance storefront with polished browsing and premium product positioning.',
    fullDescription: '<p>A fragrance commerce platform focused on sensory storytelling, mobile shopping, and confident purchasing.</p>',
    thumbnail: '/images/ZarooFragrances.pk.png',
    gallery: [],
    category: 'E-commerce',
    technologies: ['Shopify', 'Fragrance Merchandising', 'Analytics', 'Tailwind CSS'],
    liveUrl: 'https://zaroofragrances.pk',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-02-08',
    metaTitle: 'zaroofragrances.com',
    metaDescription: 'Premium fragrance storefront by LB CodeBase.',
    sortOrder: 10,
    image: '/images/ZarooFragrances.pk.png',
    description: 'Elegant fragrance storefront with polished browsing and premium product positioning.',
  },
  {
    id: 'project-premium-wild-morels',
    title: 'premiumwildmorels.com',
    slug: 'premiumwildmorels-com',
    shortDescription: 'Specialty food storefront built for product education, seasonal demand, and ordering clarity.',
    fullDescription: '<p>A premium product site for wild morels with focused content, fast navigation, and clear conversion paths.</p>',
    thumbnail: '/images/PremiumWildMorels.com.png',
    gallery: ['/images/premiumwildmorelsmockup.jpeg'],
    category: 'E-commerce',
    technologies: ['Catalog UX', 'Content Strategy', 'SEO', 'Performance'],
    liveUrl: 'https://premiumwildmorels.com',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-01-17',
    metaTitle: 'premiumwildmorels.com',
    metaDescription: 'Specialty food commerce platform by LB CodeBase.',
    sortOrder: 11,
    image: '/images/PremiumWildMorels.com.png',
    description: 'Specialty food storefront built for product education, seasonal demand, and ordering clarity.',
  },
  {
    id: 'project-gulf-legal-consultant',
    title: 'Gulf Legal Consultant',
    slug: 'gulf-legal-consultant',
    shortDescription: 'Professional legal consultancy platform built for credibility, clarity, and qualified inquiries.',
    fullDescription: '<p>A polished legal consultancy website focused on trust, service clarity, and direct client inquiry paths.</p>',
    thumbnail: '/images/Gulflegalconsultant.com.png',
    gallery: ['/images/Strategiclegalcouncilmockup.jpeg'],
    category: 'Web',
    technologies: ['Legal Website', 'Lead Generation', 'SEO', 'Performance'],
    liveUrl: 'https://gulflegalconsultant.com',
    githubUrl: '',
    featured: true,
    status: 'published',
    completionDate: '2024-01-04',
    metaTitle: 'Gulf Legal Consultant',
    metaDescription: 'Legal consultancy platform by LB CodeBase.',
    sortOrder: 12,
    image: '/images/Gulflegalconsultant.com.png',
    description: 'Professional legal consultancy platform built for credibility, clarity, and qualified inquiries.',
  },
];

const curatedProjectIds = new Set([
  'project-albawabaa',
  'project-vogue-decor',
  'project-american-dream-auto-protect',
  'project-pedro-clavero',
]);

export function mergeCuratedProjects(projects: Project[]): Project[] {
  const available = new Set(projects.flatMap((project) => [project.id, project.slug]));
  const missing = fallbackProjects.filter((project) => (
    curatedProjectIds.has(project.id) && !available.has(project.id) && !available.has(project.slug)
  ));
  return missing.length ? [...missing, ...projects] : projects;
}

export function mergeCuratedMemberProjects<T extends TeamMember & { projects: Project[] }>(member: T): T {
  const existing = member.projects.map((project) => {
    const contribution = project.contributors?.find((item) => item.memberId === member.id);
    return contribution ? { ...project, memberId: member.id, memberRole: contribution.role } : project;
  });
  const available = new Set(existing.flatMap((project) => [project.id, project.slug]));
  const missing = fallbackProjects.flatMap((project) => {
    if (!curatedProjectIds.has(project.id) || available.has(project.id) || available.has(project.slug)) return [];
    const contribution = project.contributors?.find((item) => item.memberId === member.id);
    return contribution ? [{ ...project, memberId: member.id, memberRole: contribution.role }] : [];
  });

  return missing.length || existing.some((project, index) => project !== member.projects[index])
    ? { ...member, projects: [...missing, ...existing] }
    : member;
}

export const fallbackTeam: TeamMember[] = [
  {
    id: 'team-wajid',
    slug: 'wajid-hussain',
    name: 'Wajid Hussain',
    role: 'CEO, LB CodeBase',
    tagline: 'Architecting high-concurrency workflows, commerce automation, and robust cloud systems that scale without friction.',
    bio: 'Automation expert and technical consultant shaping efficient digital systems, enterprise commerce integrations, and high-velocity cloud delivery.',
    fullBio: 'With over 7 years of engineering and technical consulting experience, Wajid specializes in architecting enterprise-grade automation workflows, robust cloud infrastructures, and high-performance headless commerce platforms. He bridges strategic business objectives and high-throughput technical delivery, ensuring systems operate reliably under massive peak loads.',
    specialization: 'Enterprise Automation, Headless Commerce Architecture & Cloud Systems',
    avatar: '/lbt/Wajid Hussain.png',
    coverImage: '/images/Zeroma.pk.png',
    img: '/lbt/Wajid Hussain.png',
    email: 'wajidhussain.dev@gmail.com',
    phone: '03489077329',
    location: 'Islamabad, PK (UTC+5)',
    availability: 'Available for Advisory & Architecture Engagements',
    yearsExperience: '7+ Years',
    languages: ['English (Fluent)', 'Urdu (Native)'],
    accentColor: '#3D5AFE',
    skills: ['Automation Strategy', 'Technical Consulting', 'Commerce Systems', 'Cloud Architecture', 'DevOps & CI/CD', 'API Gateway Integration', 'Performance Tuning'],
    skillGroups: [
      {
        category: 'Automation & Workflows',
        skills: ['Zapier / Make / n8n Enterprise', 'Custom Webhook Pipelines', 'Automated Billing & Invoicing', 'CRM / ERP Synchronization', 'Error Handling & Retry Queues'],
      },
      {
        category: 'Commerce & Infrastructure',
        skills: ['Shopify Plus / Headless Commerce', 'Node.js & Express Architecture', 'Microservices & Docker', 'Redis Caching & CDN Optimization', 'SQL & NoSQL Performance Tuning'],
      },
      {
        category: 'Advisory & Strategy',
        skills: ['System Architecture Review', 'Tech Stack Selection', 'Security & Compliance Audits', 'Scalability Roadmaps', 'Vendor Integration Strategy'],
      },
    ],
    experience: [
      {
        id: 'wajid-exp-1',
        company: 'LB CodeBase',
        position: 'Chief Executive Officer',
        startDate: '2022',
        current: true,
        description: 'Leading technical strategy, cloud infrastructure design, and commerce automation systems across flagship client builds.',
        responsibilities: [
          'Designed headless architecture for zeroma.pk and mobixa.pk, achieving sub-100ms API response times.',
          'Automated vendor onboarding and inventory synchronization across multi-channel retail systems.',
          'Implemented CI/CD pipelines reducing deployment friction by 75%.',
        ],
        achievements: [
          'Orchestrated the architectural rollout for 5 enterprise commerce platforms.',
          'Engineered real-time order processing pipelines supporting 10,000+ daily transactions.',
        ],
        technologies: ['Node.js', 'Express', 'Shopify API', 'Docker', 'Redis', 'PostgreSQL', 'AWS'],
      },
      {
        id: 'wajid-exp-2',
        company: 'Nexus Digital Solutions',
        position: 'Senior Cloud & Automation Engineer',
        startDate: '2019',
        endDate: '2022',
        current: false,
        description: 'Architected custom API middleware and automated data transformation pipelines for enterprise clients.',
        responsibilities: [
          'Constructed automated CRM sync workflows connecting Salesforce and legacy ERPs.',
          'Maintained 99.98% uptime across microservices infrastructure.',
        ],
        achievements: [
          'Reduced manual data reconciliation hours by over 30 hours per week for logistics clients.',
        ],
        technologies: ['Python', 'Node.js', 'Docker', 'Kubernetes', 'REST APIs', 'GraphQL'],
      },
    ],
    education: [
      {
        id: 'wajid-edu-1',
        institution: 'Government Degree College Mingora',
        degree: 'Intermediate',
        field: 'Computer Science (ICS)',
        startDate: '',
        endDate: '',
        description: 'Currently enrolled in the Intermediate in Computer Science program.',
      },
    ],
    certifications: [
      {
        id: 'wajid-cert-1',
        title: 'AWS Certified Solutions Architect – Associate',
        organization: 'Amazon Web Services',
        type: 'Professional Certification',
        issueDate: '2023',
        credentialId: 'AWS-SAA-882194',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
      {
        id: 'wajid-cert-2',
        title: 'Shopify Advanced Commerce & API Specialist',
        organization: 'Shopify Academy',
        type: 'Specialist Credential',
        issueDate: '2022',
        credentialId: 'SHPFY-ADV-4190',
        credentialUrl: 'https://shopify.com',
      },
    ],
    testimonials: [
      {
        id: 'wajid-test-1',
        quote: 'Wajid restructured our entire inventory sync and commerce architecture. Our site load time plummeted and we haven\'t suffered a single outage during peak sales.',
        author: 'Zeeshan Sardar',
        role: 'Founder',
        company: 'Zeroma Retail',
        project: 'zeroma.pk',
      },
      {
        id: 'wajid-test-2',
        quote: 'Exceptional clarity on system design. Wajid identified scalability bottlenecks in our API layer within days and delivered an airtight automation blueprint.',
        author: 'Zaim Communication Pvt Limited',
        role: 'Client',
        company: 'Gulf Legal Consultant',
        project: 'gulflegalconsultant.com',
      },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/wajid-hussain-lb',
      github: 'https://github.com/wajidhussain',
      twitter: 'https://twitter.com/wajid_dev',
      website: 'https://lbcodebase.com/team/wajid-hussain',
    },
    active: true,
    displayOrder: 1,
  },
  {
    id: 'team-mohsin',
    slug: 'mohsin-bilal',
    name: 'Mohsin Bilal',
    role: 'Lead Brand & Graphics Designer',
    tagline: 'Translating brand vision into distinctive visual systems, tactile product packaging, and high-impact digital identity.',
    bio: 'Graphics designer shaping brand systems, product visuals, and digital art direction with timeless aesthetic authority.',
    fullBio: 'Mohsin is a senior visual designer and brand strategist with 5+ years of experience crafting unmistakable identities for forward-thinking consumer brands, specialty commerce, and digital agencies. His work unites typography, color psychology, 3D product rendering, and layout craft to build enduring visual equity.',
    specialization: 'Brand Identity Systems, Visual Art Direction & Packaging Design',
    avatar: '/lbt/Mohsin.png',
    coverImage: '/images/Jugo.pk.png',
    img: '/lbt/Mohsin.png',
    email: 'mohsinbilal.dev@gmail.com',
    phone: '03425124134',
    location: 'Lahore, PK (UTC+5)',
    availability: 'Available for Brand Identity & Visual Direction Projects',
    yearsExperience: '5+ Years',
    languages: ['English (Fluent)', 'Urdu (Native)'],
    accentColor: '#FF5C7A',
    skills: ['Graphic Design', 'Brand Systems', 'Visual Direction', 'Product Visuals', '3D Rendering', 'Typography', 'Packaging Design'],
    skillGroups: [
      {
        category: 'Brand Systems & Identity',
        skills: ['Comprehensive Brand Guidelines', 'Custom Logomarks & Wordmarks', 'Typography Systems & Hierarchies', 'Palette Strategy & Color Tokens', 'Brand Collateral & Iconography'],
      },
      {
        category: 'Product & Visual Production',
        skills: ['High-Fidelity 3D Product Visuals', 'Packaging & Label Engineering', 'Marketing Asset Toolkits', 'Vector Art & Editorial Illustrations', 'Social Identity Kits'],
      },
      {
        category: 'Design Mastery & Tools',
        skills: ['Figma & FigJam', 'Adobe Illustrator & Photoshop', 'Adobe InDesign & After Effects', 'Blender (3D Modeling & Lighting)', 'Cinema 4D Basics'],
      },
    ],
    experience: [
      {
        id: 'mohsin-exp-1',
        company: 'LB CodeBase',
        position: 'Lead Brand & Graphics Designer',
        startDate: '2023',
        current: true,
        description: 'Directing visual identity design and product imagery for premier commerce and digital agency clients.',
        responsibilities: [
          'Crafted the complete digital brand identity and packaging visual system for jugo.pk.',
          'Created photorealistic product renders and merchandising guidelines for zaroofragrances.com and noorgemstone.com.',
          'Developed brand guidelines ensuring 100% visual consistency across omnichannel collateral.',
        ],
        achievements: [
          'Elevated brand perception leading to a 40% increase in brand recall for client product launches.',
          'Delivered complete visual identity packages for 12+ international brands.',
        ],
        technologies: ['Adobe Illustrator', 'Photoshop', 'Figma', 'Blender', 'InDesign'],
      },
      {
        id: 'mohsin-exp-2',
        company: 'Aura Creative Studio',
        position: 'Senior Brand Designer',
        startDate: '2020',
        endDate: '2023',
        current: false,
        description: 'Crafted comprehensive branding, editorial publications, and advertising assets for FMCG and luxury brands.',
        responsibilities: [
          'Designed over 25 distinctive brand identities from conceptual sketches to finished assets.',
          'Collaborated with marketing directors to produce high-converting campaign visuals.',
        ],
        achievements: [
          'Featured in regional design showcases for excellence in packaging design.',
        ],
        technologies: ['Adobe Creative Suite', 'Figma', 'After Effects'],
      },
    ],
    education: [
      {
        id: 'mohsin-edu-1',
        institution: 'Hadaf College',
        degree: 'Intermediate',
        field: 'Computer Science (ICS)',
        startDate: '',
        endDate: '',
        description: 'Currently enrolled in the Intermediate in Computer Science program.',
      },
    ],
    certifications: [
      {
        id: 'mohsin-cert-1',
        title: 'Advanced Brand Identity & Design Systems',
        organization: 'Design Mastery Guild',
        type: 'Professional Certificate',
        issueDate: '2023',
        credentialId: 'DMG-BID-9014',
        credentialUrl: 'https://behance.net',
      },
      {
        id: 'mohsin-cert-2',
        title: 'Adobe Certified Professional in Visual Design',
        organization: 'Adobe Systems',
        type: 'Professional Credential',
        issueDate: '2021',
        credentialId: 'ADOBE-DES-7731',
        credentialUrl: 'https://adobe.com',
      },
    ],
    testimonials: [
      {
        id: 'mohsin-test-1',
        quote: 'Mohsin gave Jugo an identity that completely captivated our customers. The product renders and vibrant brand language set us apart on crowded retail shelves.',
        author: 'Zaid Farooq',
        role: 'Founder & Brand Lead',
        company: 'Jugo Beverage Co.',
        project: 'jugo.pk',
      },
      {
        id: 'mohsin-test-2',
        quote: 'The visual luxury and detail Mohsin brought to Zaroo Fragrances exceeded all expectations. Our bottles look majestic online and in print.',
        author: 'Malak Haroon',
        role: 'Founder',
        company: 'Zaroo Fragrances',
        project: 'zaroofragrances.com',
      },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/mohsin-bilal-design',
      behance: 'https://behance.net/mohsinbilal',
      dribbble: 'https://dribbble.com/mohsinbilal',
      instagram: 'https://instagram.com/mohsin.visuals',
      website: 'https://lbcodebase.com/team/mohsin-bilal',
    },
    active: true,
    displayOrder: 2,
  },
  {
    id: 'team-laiba',
    slug: 'laiba-sahibzada',
    name: 'Laiba Sahibzada',
    role: 'Senior Frontend & Full-Stack Developer',
    tagline: 'Building lightning-fast, accessible, and kinetic digital products that turn complex software into effortless user experiences.',
    bio: 'Developer building responsive frontend experiences, headless architectures, and high-performance digital products.',
    fullBio: 'Laiba is a Senior Frontend & Full-Stack Engineer with 5+ years of experience engineering high-velocity web applications, complex design systems, and responsive interfaces. With a deep passion for web performance, WebGL interactions, and bulletproof TypeScript architectures, she turns ambitious product designs into polished, pixel-perfect software.',
    specialization: 'Modern React/Next.js Engineering, Kinetic UI & Web Performance',
    avatar: '/lbt/Laiba.png',
    coverImage: '/images/Sparkalads.com.png',
    img: '/lbt/Laiba.png',
    email: 'Laibakhan4455k@gmail.com',
    phone: '03429656779',
    location: 'Peshawar, PK (UTC+5)',
    availability: 'Available for Web Applications & Performance Overhauls',
    yearsExperience: '5+ Years',
    languages: ['English (Fluent)', 'Urdu (Native)', 'Pashto (Native)'],
    accentColor: '#12B8A6',
    skills: ['Frontend Development', 'React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'WebGL / Three.js', 'Performance Optimization'],
    skillGroups: [
      {
        category: 'Frontend Architecture',
        skills: ['React 19 & Next.js App Router', 'TypeScript Strict Systems', 'Tailwind CSS & CSS Architecture', 'State Management (Zustand / Redux)', 'Component Driven Architecture'],
      },
      {
        category: 'Motion & 3D Engineering',
        skills: ['GSAP & ScrollTrigger Timelines', 'Framer Motion / Motion One', 'Three.js & React Three Fiber', 'Shader Micro-interactions', 'Canvas & SVG Animations'],
      },
      {
        category: 'Performance & Full-Stack',
        skills: ['Core Web Vitals 95+ Tuning', 'Node.js & Express REST APIs', 'Bundle Optimization & Code Splitting', 'Accessibility (WCAG AA Compliance)', 'Vite Build Pipelines & CI'],
      },
    ],
    experience: [
      {
        id: 'laiba-exp-1',
        company: 'LB CodeBase',
        position: 'Senior Frontend & Full-Stack Engineer',
        startDate: '2023',
        current: true,
        description: 'Architecting flagship client frontends, performance-critical interactive systems, and responsive web platforms.',
        responsibilities: [
          'Engineered the frontend for zeroma.pk and mobixa.pk with zero-layout-shift and sub-second page loads.',
          'Built sparkalads.com featuring immersive GSAP animations and responsive 3D elements.',
          'Authored reusable UI component libraries reducing delivery time on subsequent client projects by 40%.',
        ],
        achievements: [
          'Consistently delivered 98+ Google Lighthouse scores across desktop and mobile storefronts.',
          'Engineered high-concurrency client portals processing over 50,000 monthly active users.',
        ],
        technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Three.js', 'Vite', 'Node.js'],
      },
      {
        id: 'laiba-exp-2',
        company: 'Veloce Interactive',
        position: 'Frontend Developer',
        startDate: '2021',
        endDate: '2023',
        current: false,
        description: 'Developed responsive single-page web applications and interactive landing experiences.',
        responsibilities: [
          'Implemented fluid responsive designs across 20+ web applications.',
          'Optimized JavaScript bundles reducing initial page weight by 55%.',
        ],
        achievements: [
          'Recognized for best frontend engineering practices across the development department.',
        ],
        technologies: ['React', 'JavaScript (ES6+)', 'Sass', 'REST APIs', 'Webpack'],
      },
    ],
    education: [
      {
        id: 'laiba-edu-1',
        institution: 'Jahanzeb College, Swat',
        degree: 'Bachelor of Science (BS)',
        field: 'Computer Science',
        startDate: '',
        endDate: '',
        description: 'Currently enrolled in the BS Computer Science program.',
      },
    ],
    certifications: [
      {
        id: 'laiba-cert-1',
        title: 'Meta Certified Senior Front-End Developer',
        organization: 'Meta',
        type: 'Professional Credential',
        issueDate: '2023',
        credentialId: 'META-FED-55219',
        credentialUrl: 'https://coursera.org',
      },
      {
        id: 'laiba-cert-2',
        title: 'Web Performance & Core Vitals Masterclass',
        organization: 'Web Performance Institute',
        type: 'Specialist Credential',
        issueDate: '2022',
        credentialId: 'WPI-OPT-3091',
        credentialUrl: 'https://web.dev',
      },
    ],
    testimonials: [
      {
        id: 'laiba-test-1',
        quote: 'Laiba\'s technical standard is world-class. She turned our complex interactive designs for Sparkalads into silky-smooth animations that load instantly on mobile.',
        author: 'Zakir Ullah Afarin',
        role: 'Founder and CEO',
        company: 'Sparkalads Agency',
        project: 'sparkalads.com',
      },
      {
        id: 'laiba-test-2',
        quote: 'Working with Laiba was a masterclass in frontend speed. The Mobixa storefront runs flawlessly with zero lag, directly driving our checkout conversions.',
        author: 'Saqib Fazal',
        role: 'IT Manager',
        company: 'Mobixa Electronics',
        project: 'mobixa.pk',
      },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/laiba-sahibzada-dev',
      github: 'https://github.com/laibasahibzada',
      twitter: 'https://twitter.com/laiba_codes',
      website: 'https://lbcodebase.com/team/laiba-sahibzada',
    },
    active: true,
    displayOrder: 3,
  },
  {
    id: 'team-ibad',
    slug: 'ibad-ullah',
    name: 'Ibad Ullah',
    role: 'Lead UI/UX & Product Designer',
    tagline: 'Designing high-converting digital products through user-centered UX, scalable design systems, intuitive interfaces, and conversion-focused experiences.',
    bio: 'Lead UI/UX and product designer creating intuitive digital products, scalable design systems, and conversion-focused e-commerce experiences.',
    fullBio: 'Ibad is LB CodeBase’ Lead UI/UX & Product Designer, with 4+ years of experience shaping digital products and conversion-optimized storefronts. He connects product strategy, user research, interaction design, and scalable design systems to turn complex requirements into clear, accessible experiences that support both user needs and business outcomes.',
    specialization: 'Digital Product Design, E-Commerce UX & Conversion-Focused Design Systems',
    avatar: '/lbt/Ibdullah.png',
    coverImage: '/images/Noorgemstone.com.png',
    img: '/lbt/Ibdullah.png',
    email: 'ibadullah2005h@icloud.com',
    phone: '03487047866',
    location: 'Islamabad, PK (UTC+5)',
    availability: 'Available for Product Discovery, UI/UX Audits & Design Systems',
    yearsExperience: '4+ Years',
    languages: ['English (Fluent)', 'Urdu (Native)'],
    accentColor: '#F4B740',
    skills: ['UI/UX Design', 'Product Design', 'Product Strategy', 'User Experience Strategy', 'User Interface Design', 'E-Commerce UX', 'Conversion Rate Optimization (CRO)', 'Design Systems', 'User Journey Mapping', 'Wireframing & Prototyping', 'Responsive Web & Mobile Design', 'Interaction Design', 'Information Architecture', 'UX Research', 'Usability Optimization'],
    skillGroups: [
      {
        category: 'Product Design',
        skills: ['UI/UX Design', 'Product Design', 'Product Strategy', 'Product Discovery', 'Design Thinking & Ideation', 'User Experience Strategy', 'User Interface Design', 'User Journey Mapping', 'Wireframing & Prototyping', 'Interaction Design', 'Information Architecture', 'UX Research'],
      },
      {
        category: 'Experience & Conversion',
        skills: ['E-Commerce UX', 'Conversion Rate Optimization (CRO)', 'Usability Optimization', 'Customer Journey Optimization', 'Landing Page Design', 'E-Commerce Conversion Optimization', 'User Flow Optimization', 'Design Audits', 'Heuristic Evaluation', 'A/B Test Planning', 'UX Problem Solving', 'Data-Informed Design Decisions'],
      },
      {
        category: 'Design Systems',
        skills: ['Scalable Design Systems', 'Component Libraries', 'Design Token Architecture', 'Figma Component Architecture', 'Visual Design & Brand Consistency', 'Responsive Web & Mobile Design', 'Accessibility & Responsive Design'],
      },
      {
        category: 'Technical Knowledge',
        skills: ['Next.js', 'React', 'Modern Frontend Design Principles', 'Developer Handoff', 'Design-to-Development Workflow', 'Responsive Implementation', 'Component-Based UI Architecture', 'Frontend Collaboration', 'HTML & CSS Design Fluency', 'UI Implementation QA'],
      },
    ],
    experience: [
      {
        id: 'ibad-exp-1',
        company: 'LB CodeBase',
        position: 'Lead UI/UX & Product Designer',
        startDate: '2023',
        current: true,
        description: 'Architecting intuitive user journeys, wireframes, and design systems for enterprise e-commerce and web platforms.',
        responsibilities: [
          'Designed end-to-end commerce UX for noorgemstone.com, zaroofragrances.com, and premiumwildmorels.com.',
          'Streamlined product discovery and checkout flows, improving mobile completion rates by 32%.',
          'Created comprehensive Figma design systems ensuring seamless engineering handoff.',
        ],
        achievements: [
          'Redesigned checkout flows resulting in an average 24% reduction in cart abandonment.',
          'Authored 4 complete multi-platform design systems.',
        ],
        technologies: ['Figma', 'FigJam', 'Maze', 'Protopie', 'Adobe XD'],
      },
      {
        id: 'ibad-exp-2',
        company: 'PixelCraft Digital',
        position: 'UI/UX Designer',
        startDate: '2021',
        endDate: '2023',
        current: false,
        description: 'Conducted user research, wireframed digital experiences, and crafted responsive prototypes for SaaS startups.',
        responsibilities: [
          'Designed responsive SaaS dashboard interfaces and client portals.',
          'Executed moderated user tests to iterate rapidly on feature usability.',
        ],
        achievements: [
          'Awarded Top Product Designer for simplifying a complex logistics dashboard.',
        ],
        technologies: ['Figma', 'Miro', 'InVision', 'Illustrator'],
      },
    ],
    education: [
      {
        id: 'ibad-edu-1',
        institution: 'Pak-Austria Fachhochschule Institute of Applied Sciences and Technology (PAF-IAST), Haripur, KPK',
        degree: 'Bachelor of Science (BS)',
        field: 'Artificial Intelligence',
        startDate: '',
        endDate: '',
        description: 'Currently enrolled in the BS Artificial Intelligence program.',
      },
    ],
    certifications: [
      {
        id: 'ibad-cert-1',
        title: 'Google UX Design Professional Certificate',
        organization: 'Google',
        type: 'Professional Credential',
        issueDate: '2022',
        credentialId: 'GGL-UXD-98124',
        credentialUrl: 'https://coursera.org',
      },
      {
        id: 'ibad-cert-2',
        title: 'Nielsen Norman Group UX Master Certification',
        organization: 'NN/g',
        type: 'Master Credential',
        issueDate: '2023',
        credentialId: 'NNG-UXM-1120',
        credentialUrl: 'https://nngroup.com',
      },
    ],
    testimonials: [
      {
        id: 'ibad-test-1',
        quote: 'Ibad completely transformed our customer shopping experience on Noor Gemstone. High-value gems require immense trust and detail, and his layout guided buyers effortlessly to inquiry.',
        author: 'Noor Muhammad',
        role: 'Owner',
        company: 'Noor Gemstones',
        project: 'noorgemstone.com',
      },
      {
        id: 'ibad-test-2',
        quote: 'Ibad possesses a rare intuition for commerce hierarchy. The wild morels storefront required educating buyers before purchasing, and his flow made it feel natural and premium.',
        author: 'Nazir Ahmad',
        role: 'Manager',
        company: 'Premium Wild Morels',
        project: 'premiumwildmorels.com',
      },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/ibadullah-ux',
      dribbble: 'https://dribbble.com/ibadux',
      behance: 'https://behance.net/ibadullah',
      twitter: 'https://twitter.com/ibad_ux',
      website: 'https://lbcodebase.com/team/ibad-ullah',
    },
    active: true,
    displayOrder: 4,
  },
];

export const fallbackTestimonials: Testimonial[] = fallbackTeam.flatMap((member) => member.testimonials || []);

export function applyCuratedProfileFallback<T extends TeamMember>(member: T): T {
  if (member.slug !== 'ibad-ullah') return member;

  const categories = new Set((member.skillGroups || []).map((group) => group.category));
  const hasCurrentDesignProfile = member.skills.length > 1
    && categories.has('Product Design')
    && categories.has('Experience & Conversion')
    && categories.has('Design Systems')
    && categories.has('Technical Knowledge');
  if (hasCurrentDesignProfile) return member;

  const curated = fallbackTeam.find((item) => item.slug === member.slug);
  if (!curated) return member;

  return {
    ...member,
    role: curated.role,
    tagline: curated.tagline,
    bio: curated.bio,
    fullBio: curated.fullBio,
    specialization: curated.specialization,
    availability: curated.availability,
    skills: curated.skills,
    skillGroups: curated.skillGroups,
  };
}

export const fallbackBlogs: BlogPost[] = [
  {
    id: '1713801600000',
    title: 'Engineering for Velocity: Why Speed is a Feature',
    slug: 'engineering-for-velocity-why-speed-is-a-feature',
    excerpt: "Speed isn't just about loading charts. It's about reducing friction between the user and their goals.",
    content: '<p>Speed is a foundation for trust, clarity, and conversion.</p>',
    coverImage: '/images/webdevolopmentservice.webp',
    image: '/images/webdevolopmentservice.webp',
    category: 'Architecture',
    tags: ['Performance'],
    author: 'Laiba Sahibzada',
    status: 'published',
    publishedAt: '2026-04-18T00:00:00.000Z',
    readingTime: '8 min read',
    time: '8 min read',
    date: 'April 18, 2026',
  },
];

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled';

export const tagsFromString = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

let adminCsrfToken = '';

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string[]> = {},
    public readonly requestId = '',
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export interface AdminMediaUpload {
  id: string;
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  byteSize: number;
  altText?: string;
  reused?: boolean;
}

interface AdminMediaUploadResponse {
  success: true;
  file: AdminMediaUpload;
}

export function setAdminCsrfToken(token: string) {
  adminCsrfToken = token;
}

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const method = (options?.method || 'GET').toUpperCase();
  if (adminCsrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method) && (url.startsWith('/api/v2/admin') || url === '/api/v2/auth/logout')) {
    headers.set('X-CSRF-Token', adminCsrfToken);
  }
  if (url.startsWith('/api/') && !publicApiEnabled) {
    throw new ApiRequestError(503, 'API_DISABLED', 'The content API is not enabled for this static deployment.');
  }

  const requestUrl = apiRequestUrl(url);
  let response: Response;
  try {
    response = await fetch(requestUrl, { credentials: 'include', ...options, headers });
  } catch (caught) {
    if (import.meta.env.DEV) console.error('[api] network request failed', { method, url, error: caught instanceof Error ? caught.message : String(caught) });
    const timedOut = caught instanceof DOMException && caught.name === 'AbortError';
    throw new ApiRequestError(0, timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR', timedOut ? 'The server took too long to respond. Please try again.' : 'Could not reach the server. Check your connection and deployment API configuration.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: string; message?: string; fields?: Record<string, string[]>; requestId?: string } } | null;
    const fields = body?.error?.fields || {};
    const firstFieldError = Object.entries(fields).find(([, messages]) => messages.length);
    const baseMessage = body?.error?.message || `Request failed: ${response.status}`;
    const message = firstFieldError ? `${baseMessage} ${firstFieldError[0]}: ${firstFieldError[1][0]}` : baseMessage;
    if (import.meta.env.DEV) console.error('[api] request rejected', { method, url, status: response.status, code: body?.error?.code || 'REQUEST_FAILED', message: baseMessage, requestId: body?.error?.requestId || response.headers.get('X-Request-Id') || '' });
    throw new ApiRequestError(response.status, body?.error?.code || 'REQUEST_FAILED', message, fields, body?.error?.requestId || response.headers.get('X-Request-Id') || '');
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function uploadAdminMedia(file: File, altText = ''): Promise<AdminMediaUpload> {
  const body = new FormData();
  body.append('file', file);
  body.append('altText', altText);
  const controller = new AbortController();
  const configuredTimeout = Number(import.meta.env.VITE_UPLOAD_TIMEOUT_MS || 45_000);
  const timeout = globalThis.setTimeout(() => controller.abort(), Number.isFinite(configuredTimeout) ? Math.max(10_000, configuredTimeout) : 45_000);
  try {
    const response = await fetchJson<AdminMediaUploadResponse>('/api/v2/admin/media', { method: 'POST', body, signal: controller.signal });
    if (!response.success || !response.file?.url || !response.file?.id) throw new ApiRequestError(502, 'UPLOAD_RESPONSE_INVALID', 'The server returned an invalid upload response.');
    return response.file;
  } catch (caught) {
    if (caught instanceof ApiRequestError && ['NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(caught.code)) {
      throw new ApiRequestError(caught.status, 'UPLOAD_NETWORK_ERROR', caught.code === 'REQUEST_TIMEOUT' ? 'The image upload timed out. Please retry.' : 'Could not reach the image upload service. Check the deployment API configuration and try again.');
    }
    throw caught;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

const publicRequestsInFlight = new Map<string, Promise<unknown>>();
const publicMemoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const PUBLIC_REQUEST_TIMEOUT_MS = 8_000;
const PUBLIC_MEMORY_CACHE_MS = 30_000;

export async function cachedFetch<T>(url: string, cacheKey: string, fallback: T): Promise<T> {
  if (url.startsWith('/api/') && !publicApiEnabled) return fallback;

  const requestKey = `${url}::${cacheKey}`;
  const memoryEntry = publicMemoryCache.get(requestKey);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) return memoryEntry.value as T;
  if (memoryEntry) publicMemoryCache.delete(requestKey);

  const activeRequest = publicRequestsInFlight.get(requestKey) as Promise<T> | undefined;
  if (activeRequest) return activeRequest;

  const request = (async () => {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), PUBLIC_REQUEST_TIMEOUT_MS);

    try {
      const data = await fetchJson<T>(url, { signal: controller.signal });
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // Persistence is optional; a valid network response remains authoritative.
      }
      return data;
    } catch {
      let cached: string | null = null;
      try {
        cached = localStorage.getItem(cacheKey);
      } catch {
        return fallback;
      }
      if (!cached) return fallback;
      try {
        return JSON.parse(cached) as T;
      } catch {
        try {
          localStorage.removeItem(cacheKey);
        } catch {
          // Storage can be unavailable in privacy-restricted browser contexts.
        }
        return fallback;
      }
    } finally {
      globalThis.clearTimeout(timeout);
    }
  })();

  publicRequestsInFlight.set(requestKey, request);
  try {
    const result = await request;
    publicMemoryCache.set(requestKey, { value: result, expiresAt: Date.now() + PUBLIC_MEMORY_CACHE_MS });
    return result;
  } finally {
    if (publicRequestsInFlight.get(requestKey) === request) publicRequestsInFlight.delete(requestKey);
  }
}

export async function optimizeImage(file: File, maxWidth = 2560, maxHeight = 2560, quality = 0.86): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  let image: HTMLImageElement;
  try {
    image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () => reject(new Error('This image format could not be processed by your browser. Try PNG, JPEG, WebP, GIF, AVIF, or BMP.'));
      candidate.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error('The selected image has invalid dimensions.');
  const { width: outputWidth, height: outputHeight } = fitImageWithin(sourceWidth, sourceHeight, maxWidth, maxHeight);
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not initialize image processing.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('Your browser could not convert this image to WebP.');
  return blob;
}
