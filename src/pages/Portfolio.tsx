import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { SectionHeader, Button } from '../components/common/UI';
import { HeroBackground, LetterReveal, SplitTextReveal, TextReveal } from '../components/common/Animations';
import { cachedFetch, fallbackProjects, mergeCuratedProjects, Paginated, Project } from '../lib/content';
import { cn } from '../lib/utils';

const categories = ['All', 'Web', 'Mobile', 'E-commerce', 'Custom'];

function ProjectSkeleton() {
  return <div className="aspect-[16/10] animate-pulse rounded-[1.75rem] bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] md:rounded-[3rem]" />;
}

function FloatingProjectCard({ project, index, featured }: { project: Project; index: number; featured?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
      className={cn('group block h-full cursor-pointer transition-all duration-500 hover:scale-[1.01]', featured && 'lg:col-span-2')}
    >
      <Link to={`/portfolio/${project.slug}`} className="block h-full">
        <article className="project-card relative h-full">
        <div
          className={cn(
            'relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-brand-dark/50 md:rounded-[3.5rem]',
            featured ? 'aspect-[16/11] lg:aspect-[21/10]' : 'aspect-[16/10]',
          )}
        >
          <img
            src={project.image || project.thumbnail}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading={index > 1 ? 'lazy' : 'eager'}
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/75 via-black/15 to-black/5 p-5 sm:p-7 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
                Case Study
              </span>
              <span className="font-display text-4xl font-black leading-none text-white/10 md:text-6xl">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-end justify-between gap-5">
              <div className="min-w-0">
                <span className="mb-3 block text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">{project.category}</span>
                <h4 className={cn('font-display font-black uppercase leading-none tracking-tighter text-white', featured ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl')}>
                  {project.title}
                </h4>
                <p className="mt-4 line-clamp-2 max-w-2xl text-sm font-light leading-6 text-white/50">
                  {project.shortDescription || project.description}
                </p>
              </div>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-[0_0_40px_-12px_rgba(61,90,254,0.9)] md:h-14 md:w-14">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pt-6 sm:px-5 md:px-8">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary">{project.category}</span>
            <div className="h-px flex-grow bg-white/5" />
          </div>
          <h3 className="font-display text-2xl font-black uppercase leading-none tracking-tighter transition-colors duration-700 group-hover:text-brand-primary md:text-3xl">
            {project.title}
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((technology) => (
              <span key={technology} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
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
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
              <LetterReveal text="THE ARCHIVE" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" />
            </motion.div>
            <SplitTextReveal
              text="CRAFTING LEGACIES."
              as="h1"
              className="mb-12 font-display text-4xl font-black uppercase leading-[0.95] tracking-tighter text-3d sm:text-5xl md:text-6xl lg:text-7xl"
            />
            <TextReveal
              text="Explore our archive of high-performance digital ecosystems. We build platforms that command authority and define market leadership through surgical engineering."
              className="max-w-3xl text-xl font-light leading-tight text-white/60 md:text-3xl"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
        <section className="glass mb-12 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4 md:mb-16 md:rounded-[2.5rem] md:p-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={cn(
                    'rounded-full border px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] transition-all duration-500 sm:px-7',
                    filter === category
                      ? 'border-brand-primary bg-brand-primary text-white shadow-[0_0_40px_rgba(61,90,254,0.3)]'
                      : 'border-white/10 text-white/40 hover:border-white/20 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="text-center text-[10px] font-black uppercase tracking-[0.32em] text-brand-primary/60 md:text-right">
              {filteredProjects.length} Selected Masterworks
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
              { title: 'Commerce', body: 'Product flows, checkout paths, storefront trust, and performance budgets.' },
              { title: 'Brand Systems', body: 'Visual direction, message hierarchy, content structure, and launch-ready UI.' },
              { title: 'Motion & Build', body: 'React, Tailwind, GSAP, CDN strategy, analytics, and deployment support.' },
            ].map((item) => (
              <div key={item.title} className="glass rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/30 md:rounded-[2.5rem] md:p-8">
                <h4 className="mb-4 font-display text-xl font-black uppercase tracking-tighter text-white">{item.title}</h4>
                <div className="text-sm font-light leading-6 text-white/50">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-brand-primary p-8 text-center shadow-[0_0_100px_-20px_rgba(61,90,254,0.45)] md:rounded-[4rem] md:p-14">
            <h3 className="mb-4 font-display text-2xl font-black uppercase tracking-tighter text-white md:text-4xl">Like what you see?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-light leading-7 text-white/70 md:text-base">
              Start a conversation and we will shape a precise scope, timeline, and launch path.
            </p>
            <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
              Request A Quote
            </Button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
