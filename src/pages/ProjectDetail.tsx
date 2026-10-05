import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Expand, ExternalLink, Github, Loader2, X } from 'lucide-react';
import { Button } from '../components/common/UI';
import { LetterReveal, TextReveal } from '../components/common/Animations';
import { fallbackProjects, fetchJson, Project } from '../lib/content';
import { sanitizeHtml } from '../lib/sanitize';
import { useSeo } from '../lib/seo';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [project, setProject] = useState<Project | null>(() => (
    fallbackProjects.find((item) => item.slug === id || item.id === id) || null
  ));
  const [loading, setLoading] = useState(() => !fallbackProjects.some((item) => item.slug === id || item.id === id));
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fallback = fallbackProjects.find((item) => item.slug === id || item.id === id) || null;
    setActiveGalleryIndex(null);
    setProject(fallback);
    setLoading(!fallback);

    fetchJson<Project>(`/api/v2/projects/${id}`, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setProject(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setProject(fallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (activeGalleryIndex === null || !project?.gallery.length) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveGalleryIndex(null);
      if (event.key === 'ArrowLeft') {
        setActiveGalleryIndex((current) => current === null ? null : (current - 1 + project.gallery.length) % project.gallery.length);
      }
      if (event.key === 'ArrowRight') {
        setActiveGalleryIndex((current) => current === null ? null : (current + 1) % project.gallery.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeGalleryIndex, project]);

  useSeo({
    title: project?.metaTitle || (project ? `${project.title} | LB CodeBase` : loading ? 'Loading Project | LB CodeBase' : 'Project Not Found | LB CodeBase'),
    description: project?.metaDescription || project?.shortDescription || project?.description || 'Explore a selected LB CodeBase project.',
    image: project?.thumbnail || project?.image,
    canonicalPath: project ? `/portfolio/${project.slug}` : `/portfolio/${id}`,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-dark">
        <Loader2 className="h-14 w-14 animate-spin text-brand-primary" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Loading case study...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark p-6 text-center">
        <h1 className="mb-6 font-display text-4xl font-black uppercase tracking-tighter">Project Not Found</h1>
        <Link to="/portfolio">
          <Button variant="outline">Return to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 sm:px-8 pt-24 pb-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1600px]">
        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-brand-dark pt-32 pb-12">
          <Link to="/portfolio" className="z-10 mb-12 inline-flex w-fit items-center gap-2 text-white/40 transition-colors hover:text-brand-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
          <div className="relative z-10 max-w-4xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-7 inline-flex items-center gap-3">
              <span className="h-px w-9 bg-brand-primary" />
              <LetterReveal text={project.category.toUpperCase()} className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55" />
            </motion.div>
            <div className="mb-10 overflow-hidden">
              <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} className="fluid-display font-display font-black uppercase leading-none text-3d">
                {project.title}
              </motion.h1>
            </div>
            <TextReveal text={project.shortDescription || project.description || ''} className="max-w-3xl text-xl font-normal leading-8 text-white/58 md:text-2xl md:leading-9" />
          </div>
        </section>

        <div className="mb-16 grid grid-cols-1 gap-6 border-y border-white/10 py-8 sm:grid-cols-2 md:mb-20 md:gap-8 lg:grid-cols-4">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Client</div>
            <div className="text-lg font-medium">{project.client || project.title}</div>
          </div>
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Industry</div>
            <div className="text-lg font-medium">{project.industry || project.category}</div>
          </div>
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Category</div>
            <div className="text-lg font-medium">{project.category}</div>
          </div>
          {project.completionDate && (
            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Completed</div>
              <div className="text-lg font-medium">{project.completionDate}</div>
            </div>
          )}
        </div>

        <div className="mb-20 overflow-hidden rounded-lg border border-white/10 bg-brand-gray md:mb-32">
          <img src={project.thumbnail || project.image} alt={project.title} className="h-auto w-full" referrerPolicy="no-referrer" />
        </div>

        {project.gallery.length > 0 && (
          <section className="mb-20 border-t border-white/5 pt-12 md:mb-32 md:pt-16" aria-labelledby="project-gallery-title">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Project Gallery</span>
                <h2 id="project-gallery-title" className="mt-4 font-display text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">
                  The work in context.
                </h2>
              </div>
              <p className="max-w-md text-sm font-light leading-6 text-white/45 sm:text-right">
                Select any mockup to inspect the full-size presentation.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {project.gallery.map((image, index) => (
                <motion.button
                  key={`${image}-${index}`}
                  type="button"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                  onClick={() => setActiveGalleryIndex(index)}
                  className={`group relative overflow-hidden rounded-lg border border-white/10 bg-brand-gray text-left outline-none transition-colors hover:border-brand-primary/40 focus-visible:ring-2 focus-visible:ring-brand-primary ${index === 0 && project.gallery.length > 1 ? 'md:col-span-2' : ''}`}
                  aria-label={`Open ${project.title} gallery image ${index + 1} of ${project.gallery.length}`}
                >
                  <img
                    src={image}
                    alt={`${project.title} website mockup ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover object-top transition duration-700 group-hover:scale-[1.02] ${index === 0 && project.gallery.length > 1 ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[16/10]'}`}
                  />
                  <span className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 bg-black/70 text-white transition group-hover:border-brand-primary/50 group-hover:bg-brand-primary" aria-hidden="true">
                    <Expand className="h-4 w-4" />
                  </span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        <div className="mb-20 md:mb-32 grid grid-cols-1 gap-12 lg:gap-20 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">
            <section>
              <h3 className="mb-6 font-display text-3xl md:text-4xl font-black uppercase tracking-tight">The Build</h3>
              {project.fullDescription ? (
                <div
                  className="prose prose-invert max-w-none text-lg font-normal leading-relaxed text-white/58"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.fullDescription) }}
                />
              ) : (
                <p className="max-w-3xl text-lg font-normal leading-8 text-white/58">{project.shortDescription || project.description}</p>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <div className="border-t border-white/15 py-6 md:py-8">
              <h4 className="mb-8 text-xl font-bold">Tech Stack</h4>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span key={tech} className="border-b border-white/10 py-2 text-xs text-white/60">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-brand-primary/50 py-6 md:py-8">
              <h4 className="mb-8 text-xl font-bold">Links</h4>
              <div className="space-y-3">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-white/70 hover:text-brand-primary">
                    <ExternalLink className="h-4 w-4" /> Live URL
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-white/70 hover:text-brand-primary">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>

        {Boolean(project.problem || project.challenge || project.solution) && (
          <section className="mb-20 border-t border-white/5 pt-12 md:mb-28 md:pt-16">
            <div className="mb-10 max-w-3xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Project Strategy</span>
              <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">From context to solution.</h2>
              <p className="mt-5 text-base font-light leading-7 text-white/50">The business need, experience constraint, and design response that shaped the final platform.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {[
                { index: '01', label: 'The Problem', body: project.problem },
                { index: '02', label: 'The Challenge', body: project.challenge },
                { index: '03', label: 'The Solution', body: project.solution },
              ].filter((item) => item.body).map((item) => (
                <article key={item.label} className="border-t border-white/12 py-7 lg:pr-6">
                  <div className="flex items-center justify-between pb-3">
                    <span className="font-display text-2xl font-black text-brand-primary">{item.index}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Strategy</span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-black uppercase text-white md:text-2xl">{item.label}</h3>
                  <p className="mt-4 text-sm font-light leading-7 text-white/55 md:text-base">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {Boolean(project.process?.length) && (
          <section className="mb-20 grid gap-10 border-t border-white/5 pt-12 md:mb-28 md:pt-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Delivery Process</span>
              <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">How the work moved.</h2>
              <p className="mt-5 max-w-xl text-base font-light leading-7 text-white/50">A deliberate sequence connecting discovery, structure, visual direction, implementation, and refinement.</p>
            </div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              {project.process!.map((step, index) => (
                <li key={`${step}-${index}`} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 py-6 md:grid-cols-[60px_minmax(0,1fr)] md:gap-6 md:py-7">
                  <span className="font-display text-xl font-black text-brand-primary">{String(index + 1).padStart(2, '0')}</span>
                  <p className="text-sm leading-7 text-white/65 md:text-base">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {Boolean(project.results?.length || project.achievements?.length) && (
          <section className="mb-20 border-t border-white/5 pt-12 md:mb-28 md:pt-16">
            <div className="mb-10 max-w-3xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Delivered Value</span>
              <h2 className="mt-4 font-display text-3xl font-black uppercase tracking-tighter text-white md:text-5xl">Outcomes & achievements.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...(project.results || []), ...(project.achievements || [])].map((result, index) => (
                <div key={`${result}-${index}`} className="flex gap-4 border-t border-white/10 py-5 md:pr-6">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand-primary" />
                  <p className="text-sm leading-6 text-white/65 md:text-base">{result}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-brand-primary/30 bg-[#111633] px-6 py-16 text-center md:py-24">
          <h2 className="mb-8 font-display text-3xl md:text-4xl font-bold">Have a similar project?</h2>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Let's discuss it
          </Button>
        </section>
      </div>

      {activeGalleryIndex !== null && project.gallery[activeGalleryIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} image preview`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 backdrop-blur-xl sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveGalleryIndex(null);
          }}
        >
          <button
            type="button"
            onClick={() => setActiveGalleryIndex(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition hover:border-brand-primary/60 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:right-8 sm:top-8"
            aria-label="Close image preview"
            autoFocus
          >
            <X className="h-5 w-5" />
          </button>

          {project.gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveGalleryIndex((activeGalleryIndex - 1 + project.gallery.length) % project.gallery.length)}
                className="absolute left-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition hover:border-brand-primary/60 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:left-8"
                aria-label="Previous gallery image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => setActiveGalleryIndex((activeGalleryIndex + 1) % project.gallery.length)}
                className="absolute right-3 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white transition hover:border-brand-primary/60 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:right-8"
                aria-label="Next gallery image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="flex h-full w-full max-w-[1600px] flex-col items-center justify-center gap-4">
            <img
              src={project.gallery[activeGalleryIndex]}
              alt={`${project.title} website mockup ${activeGalleryIndex + 1}`}
              className="max-h-[calc(100vh-7rem)] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              {activeGalleryIndex + 1} / {project.gallery.length}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
