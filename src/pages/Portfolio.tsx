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

function FloatingProjectCard({ project, index }: { project: Project; index: number; featured?: boolean }) {
  return <motion.article initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
    <Link to={`/portfolio/${project.slug}`} className="group block">
      <div className="project-image"><img src={project.image || project.thumbnail} alt={`${project.title} website preview`} width={1460} height={913} loading={index > 1 ? 'lazy' : 'eager'} decoding="async" className="aspect-[16/10] w-full object-cover transition-transform duration-200 group-hover:scale-[1.025]" /></div>
      <p className="project-meta mt-5">{project.category}</p>
      <h3 className="font-display text-2xl mt-2 mb-4">{project.title} <ArrowRight className="inline accent-text" size={20} aria-hidden="true" /></h3>
      <p className="reading-copy">{project.shortDescription || project.description}</p>
      {project.results?.[0] && <p className="project-meta">Delivered: {project.results[0]}</p>}
      <p className="project-meta">{project.technologies.slice(0, 4).join(' · ')}</p>
    </Link>
  </motion.article>;
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
      <section className="section-transition relative flex min-h-[65svh] items-center overflow-hidden pt-36 pb-16">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
        <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6">
          <div className="max-w-4xl">
            <motion.div initial={false} animate={{ opacity: 1, x: 0 }} className="mb-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
              <LetterReveal text="Selected work" className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75" />
            </motion.div>
            <SplitTextReveal
              text="Work that had a job to do."
              as="h1"
              className="mb-12 font-display text-4xl font-semibold normal-case leading-[0.95] tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            />
            <TextReveal
              text="Websites, commerce stores, and digital products. Explore the brief, the decisions, and what was delivered."
              className="max-w-3xl text-xl font-normal leading-tight text-white/75 md:text-3xl"
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
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                  className={cn(
                    'rounded-full border px-5 py-3 text-xs font-semibold normal-case tracking-[0.1em] transition-all duration-500 sm:px-7',
                    filter === category
                      ? 'border-brand-primary bg-brand-primary text-white underline underline-offset-4 shadow-[0_0_40px_rgba(61,90,254,0.3)]'
                      : 'border-white/10 text-white/75 hover:border-white/20 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="text-center text-xs font-semibold normal-case tracking-[0.1em] text-blue-300 md:text-right">
              {filteredProjects.length} projects shown · {categories.length - 1} categories
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
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/75">
            No projects found for this filter.
          </div>
        )}

        <section className="mt-20 border-t border-white/5 py-16 md:py-20">
          <SectionHeader
            badge="Studio"
            title={<>Capabilities <br /> <span className="text-white/75 italic normal-case">& Tools</span></>}
            description="Design, development, and commerce skills chosen around the needs of the project."
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
                <h4 className="mb-4 font-display text-xl font-semibold normal-case tracking-tighter text-white">{item.title}</h4>
                <div className="text-sm font-normal leading-6 text-white/75">{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-brand-primary p-8 text-center shadow-[0_0_100px_-20px_rgba(61,90,254,0.45)] md:rounded-[4rem] md:p-14">
            <h3 className="mb-4 font-display text-2xl font-semibold normal-case tracking-tighter text-white md:text-4xl">Like what you see?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-sm font-normal leading-7 text-white/70 md:text-base">
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
