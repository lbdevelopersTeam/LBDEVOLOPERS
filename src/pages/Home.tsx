import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers, ShoppingBag, RefreshCw } from 'lucide-react';
import { DeferredVideo } from '../components/common/Animations';
import type { BlogPost, Paginated, Project } from '../lib/content';
import { cachedPublicFetch } from '../lib/public-api';
import { homeFallbackBlogs, homeFallbackProjects } from '../lib/home-content';
const ContactForm = lazy(() => import('../components/common/ContactForm'));
const ClientReviews = lazy(() => import('../components/common/ClientReviews'));
const PartnerShowcase = lazy(() => import('../components/common/PartnerShowcase'));

function DeferredMount({ children, minHeight = 320 }: { children: React.ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (active || !ref.current) return;
    if (!('IntersectionObserver' in window)) { setActive(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); observer.disconnect(); }
    }, { rootMargin: '400px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [active]);
  return <div ref={ref} style={active ? undefined : { minHeight }}>{active ? <Suspense fallback={<p className="reading-copy" role="status">Loading…</p>}>{children}</Suspense> : null}</div>;
}

const capabilities = [
  ['Strategy', 'Find the clearest opportunity.'],
  ['Design', 'Make the product easy to understand and want.'],
  ['Engineering', 'Build it to load, scale, and stay maintainable.'],
  ['Growth', 'Improve what happens after launch.'],
];
const problems = [
  { icon: Layers, title: 'Launching a new brand', body: 'Bring your identity, message, and website together into a clear first experience.', detail: 'Identity · content direction · website · launch' },
  { icon: RefreshCw, title: 'Replacing an outdated site', body: 'Remove the friction while keeping useful content and planning your migration carefully.', detail: 'UX audit · redesign · migration · SEO' },
  { icon: ShoppingBag, title: 'Growing commerce', body: 'Help customers find the right product and move through checkout with confidence.', detail: 'Discovery · storefront · integrations · analytics' },
];
const process = [
  ['Understand', 'Goals, audience, constraints, and the information you already have.'],
  ['Shape', 'Sitemap, content direction, wireframes, and a visual route to review together.'],
  ['Build', 'Components, integrations, content editing, analytics, and quality checks.'],
  ['Launch and learn', 'Deployment, documentation, handover, and a plan for the next improvements.'],
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>(homeFallbackProjects);
  const [blogs, setBlogs] = useState<BlogPost[]>(homeFallbackBlogs);
  useEffect(() => {
    let active = true;
    cachedPublicFetch<Paginated<Project>>('/api/v2/projects?limit=8', 'public.projects.featured.v2', { items: homeFallbackProjects, nextCursor: null, total: homeFallbackProjects.length })
      .then((data) => { if (active && data.items.length) setProjects(data.items); });
    cachedPublicFetch<Paginated<BlogPost>>('/api/v2/blog?limit=3', 'public.blog.latest.v2', { items: homeFallbackBlogs, nextCursor: null, total: homeFallbackBlogs.length })
      .then((data) => { if (active && data.items.length) setBlogs(data.items); });
    return () => { active = false; };
  }, []);
  const note = blogs[0];
  return <div className="studio-page">
    <section id="home-hero" className="studio-container home-opening">
      <div>
        <p className="eyebrow">Design & development · LB CodeBase</p>
        <h1 className="display-heading">Digital products.<br /><span className="accent-text">Built with care.</span></h1>
        <p className="reading-copy">We design and build fast, thoughtful digital products for brands that are ready to grow.</p>
        <p className="hero-proof">Based in Swat, working with teams across commerce, services, and technology.</p>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/portfolio" className="studio-button">See our work <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link to="/contact" className="studio-button studio-button-secondary">Talk about your project</Link>
        </div>
      </div>
      <figure className="home-film">
        <DeferredVideo src="/videos/home-hero-side.mp4" poster="/images/home-hero-side-poster.webp" className="h-full w-full object-cover" />
        <figcaption>Design, engineering, and the details in between.</figcaption>
      </figure>
    </section>

    <section className="studio-section">
      <div className="studio-container">
        <p className="eyebrow">A connected approach</p>
        <h2 className="section-heading max-w-3xl">From the first question<br />to a product people can use.</h2>
        <div className="capability-strip">{capabilities.map(([title, body]) => <Link key={title} to="/services"><h3>{title} <ArrowUpRight size={16} className="inline accent-text" aria-hidden="true" /></h3><p>{body}</p></Link>)}</div>
        <a href="#how-we-work" className="studio-text-link mt-6">How we work <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </section>

    <section className="studio-section bg-brand-gray">
      <div className="studio-container">
        <p className="eyebrow">Start with the problem</p>
        <h2 className="section-heading">What are you trying to improve?</h2>
        <div className="problem-grid">{problems.map(({ icon: Icon, title, body, detail }) => <article key={title} className="problem-panel"><Icon size={28} className="accent-text" aria-hidden="true" /><h3>{title}</h3><p className="reading-copy">{body}</p><p className="project-meta">{detail}</p><Link to="/services" className="studio-text-link mt-4">Explore the services <ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>
      </div>
    </section>

    <section className="studio-section">
      <div className="studio-container">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">Selected work</p><h2 className="section-heading">Different businesses.<br />Specific problems to solve.</h2></div><Link to="/portfolio" className="studio-text-link">See all our work <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        <div className="project-index">{projects.slice(0, 4).map((project) => <Link to={`/portfolio/${project.slug}`} key={project.id}><div className="project-image"><img src={project.image || project.thumbnail} alt={`${project.title} website preview`} loading="lazy" decoding="async" width={1460} height={913} /></div><h3>{project.title} <ArrowUpRight className="inline accent-text" size={20} aria-hidden="true" /></h3><p className="reading-copy">{project.shortDescription || project.description}</p>{project.results?.[0] && <p className="project-meta">Delivered: {project.results[0]}</p>}<p className="project-meta">{project.technologies.slice(0, 3).join(' · ')}</p></Link>)}</div>
      </div>
    </section>

    <section className="studio-section bg-brand-gray">
      <div className="studio-container"><p className="eyebrow">What we care about</p><h2 className="section-heading">Clear. Fast. Built to keep growing.</h2>
        <div className="capability-strip lg:!grid-cols-3">
          {[
            ['Clarity', 'People should understand the offer and the next step. We review journeys and content with that in mind.'],
            ['Performance', 'Pages should load quickly on real networks. We check media, loading behavior, and responsive delivery.'],
            ['Care', 'Your team should be able to maintain the product. We plan access, documentation, and handover alongside the build.'],
          ].map(([title, body]) => <div key={title} className="border-t-2 border-brand-primary pt-6"><h3 className="font-display text-2xl mb-4">{title}</h3><p className="reading-copy">{body}</p></div>)}
        </div>
      </div>
    </section>

    <section id="how-we-work" className="studio-section scroll-mt-28"><div className="studio-container"><p className="eyebrow">How we work</p><h2 className="section-heading">From first conversation to launch.</h2><ol className="process-list">{process.map(([title, body]) => <li key={title}><h3>{title}</h3><p className="reading-copy">{body}</p></li>)}</ol><Link to="/about#team-directory" className="studio-text-link mt-4">Meet the people behind the work <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>

    <section id="reviews" className="studio-section"><div className="studio-container"><DeferredMount minHeight={400}><ClientReviews /></DeferredMount><DeferredMount minHeight={180}><PartnerShowcase /></DeferredMount></div></section>

    {note && <section className="studio-section"><div className="studio-container grid gap-8 md:grid-cols-2"><div><p className="eyebrow">From the studio</p><h2 className="section-heading">A note on the work.</h2><p className="reading-copy mt-6">Decisions, lessons, and ideas from building digital products.</p></div><article className="editorial-callout"><p className="eyebrow">{note.category} · {note.time || note.readingTime}</p><h3 className="font-display text-2xl mb-4">{note.title}</h3><p className="reading-copy">{note.excerpt}</p><p className="project-meta">{note.author} · {note.date}</p><Link to={`/blog/${note.slug}`} className="studio-text-link mt-4">Read the note <ArrowUpRight size={18} aria-hidden="true" /></Link></article></div></section>}

    <section className="studio-section"><div className="studio-container contact-layout"><div><p className="eyebrow">Start a conversation</p><h2 className="section-heading">Tell us what you’re<br /><span className="accent-text">trying to improve.</span></h2><p className="reading-copy mt-6">We usually reply within one business day with a clear next step.</p><ul className="reading-copy mt-6 space-y-3"><li>Share your goals, even if the scope is still taking shape.</li><li>We’ll review the brief and discuss what comes next.</li><li>Prefer a quick message? <a href="https://wa.me/923489077329" target="_blank" rel="noreferrer" className="studio-text-link">Talk on WhatsApp</a></li></ul></div><div className="contact-form-panel"><DeferredMount minHeight={560}><ContactForm /></DeferredMount></div></div></section>
  </div>;
}
