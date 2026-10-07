import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { SectionHeader, Button } from '../components/common/UI';
import { HeroBackground, LetterReveal, SplitTextReveal, TextReveal } from '../components/common/Animations';
import { cachedFetch, fallbackProjects, mergeCuratedProjects, Paginated, Project } from '../lib/content';
import { cn } from '../lib/utils';
import { PortfolioBreakdown, PortfolioStandards } from '../components/common/StudioVisuals';

const categories = ['All', 'Web', 'Mobile', 'E-commerce', 'Custom'];

function ProjectSkeleton() {
  return <div className="aspect-[16/10] animate-pulse rounded-lg bg-white/5" />;
}

function FloatingProjectCard({ project, index, featured }: { project: Project; index: number; featured?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.14), ease: [0.22, 1, 0.36, 1] }}
      className={cn('group block h-full', featured && 'lg:col-span-2')}
    >
      <Link to={`/portfolio/${project.slug}`} className="block h-full">
        <article className="project-card relative h-full">
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border border-white/10 bg-brand-dark/50',
              featured ? 'aspect-[16/11] lg:aspect-[21/10]' : 'aspect-[16/10]',
            )}
          >
            <img
              src={project.image || project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
              loading={index > 1 ? 'lazy' : 'eager'}
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-md border border-white/15 bg-black/70 text-white transition-colors group-hover:border-brand-primary group-hover:bg-brand-primary md:bottom-6 md:right-6">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <div className="pt-6 sm:pt-7">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.24em]">
              <span className="text-brand-primary">{project.category}</span>
              <span className="text-white/25">/</span>
              <span className="text-white/40">{project.client || 'LB CodeBase project'}</span>
              <span className="ml-auto text-white/25">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 className={cn('font-display font-bold leading-none tracking-[-0.04em] text-white transition-colors duration-300 group-hover:text-brand-primary', featured ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl')}>
              {project.title}
            </h3>
            <p className={cn('mt-4 max-w-3xl text-sm font-normal leading-6 text-white/55', !featured && 'line-clamp-3')}>
              {project.shortDescription || project.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {project.technologies.slice(0, 4).map((technology) => (
                <span key={technology} className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export default function Portfolio() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(false);

  const loadProjects = (isActive: () => boolean = () => mounted.current) => {
    setLoading(true);
    setError('');
    cachedFetch<Paginated<Project>>('/api/v2/projects?limit=50', 'public.projects.v2', {
      items: fallbackProjects,
      nextCursor: null,
      total: fallbackProjects.length,
    })
      .then((data) => {
        if (isActive()) setProjects(mergeCuratedProjects(data.items.length ? data.items : fallbackProjects));
      })
      .catch(() => {
        if (isActive()) setError('Unable to load live portfolio data.');
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    mounted.current = true;
    loadProjects(() => active);
    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => filter === 'All' || project.category === filter),
    [filter, projects],
  );

  return (
    <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
      <section className="section-transition relative flex min-h-screen items-center overflow-hidden pt-32 pb-24">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-7 inline-flex items-center gap-3">
              <span className="h-px w-9 bg-brand-primary" />
              <LetterReveal text="SELECTED WORK" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55" />
            </motion.div>
            <SplitTextReveal
              text="Real work. Clear context."
              as="h1"
              className="mb-12 font-display text-4xl font-black uppercase leading-[0.95] tracking-tighter text-3d sm:text-5xl md:text-6xl lg:text-7xl"
            />
            <TextReveal
              text="A selection of commerce, service, and product work—what was built, the problem it addressed, and the choices behind it."
              className="max-w-3xl text-xl font-normal leading-8 text-white/58 md:text-2xl md:leading-9"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
        <PortfolioBreakdown projects={projects} />
        <PortfolioStandards />
        <section className="mb-12 border-y border-white/10 py-5 md:mb-16">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  aria-pressed={filter === category}
                  className={cn(
                    'min-h-11 border-b px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 sm:px-5',
                    filter === category
                      ? 'border-brand-primary text-white'
                      : 'border-transparent text-white/40 hover:border-white/30 hover:text-white',
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="text-center text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60 md:text-right">
              {filteredProjects.length} case {filteredProjects.length === 1 ? 'study' : 'studies'}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
            {error}
            <button onClick={() => loadProjects()} className="ml-4 inline-flex items-center gap-2 font-bold text-white">
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        )}

        {loading && projects.length === 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            {Array.from({ length: 6 }).map((_, index) => <ProjectSkeleton key={index} />)}
          </div>
        ) : filteredProjects.length ? (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {filteredProjects.map((project, index) => (
              <FloatingProjectCard key={project.id} project={project} index={index} featured={index === 0} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/50">
            No projects found for this filter.
          </div>
        )}

        <section className="mt-20 border-t border-white/5 py-16 md:py-20">
          <SectionHeader
            badge="Studio"
            title={<>Capabilities <br /> <span className="text-white/20 italic uppercase">& Tools</span></>}
            description="Core competencies and technology stack we use to build premium, conversion-ready digital experiences."
            align="left"
            className="mb-12"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: 'Commerce', body: 'Catalog structure, product discovery, checkout paths, storefront trust, and performance.' },
              { title: 'Product Design', body: 'User flows, information hierarchy, responsive interface systems, and accessible interaction.' },
              { title: 'Engineering', body: 'React, Tailwind, Shopify, WordPress, infrastructure, analytics, and deployment support.' },
            ].map((item) => (
              <div key={item.title} className="border-t border-white/10 py-7 transition-colors hover:border-brand-primary/60 md:px-2">
                <h4 className="mb-4 font-display text-xl font-black uppercase tracking-tighter text-white">{item.title}</h4>
                <div className="text-sm font-light leading-6 text-white/50">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-5xl rounded-lg border border-brand-primary/40 bg-[#111633] p-8 text-center md:p-14">
            <h3 className="mb-4 font-display text-2xl font-bold tracking-tight text-white md:text-4xl">Have a project to discuss?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-normal leading-7 text-white/60 md:text-base">
              Share the current situation and what needs to improve. We will help shape a realistic scope and next step.
            </p>
            <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
              Start a conversation
            </Button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
