import { motion, useReducedMotion } from 'motion/react';
import { Button, SectionHeader, BentoCard } from '../components/common/UI';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Code, Palette, Gauge, Globe, Cpu, Smartphone, BarChart as ChartBar, Send, Shield, Activity, Rocket, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DeferredVideo, Magnetic, TextReveal, LetterReveal } from '../components/common/Animations';
import type { BlogPost, Paginated, Project } from '../lib/content';
import { cachedPublicFetch } from '../lib/public-api';
import { homeFallbackBlogs, homeFallbackProjects } from '../lib/home-content';
import { useContactEmail } from '../lib/site-settings';
import { DeliveryRoadmap, HomeCapabilities, PlatformMatrix, ResultsDashboard, ServiceMatrix, StrategyTimeline, StudioProofPanel, WorkShowcase } from '../components/common/StudioVisuals';

// HeroScene3D removed to use a solid black hero background per request

const capabilityTracks = [
  {
    icon: Palette,
    title: 'Brand Platforms',
    description: 'Clear brand and content systems for websites that need to explain, persuade, and convert.',
  },
  {
    icon: Gauge,
    title: 'Product Experiences',
    description: 'Commerce and product journeys designed around real customer decisions.',
  },
  {
    icon: Cpu,
    title: 'Interactive Media',
    description: '3D and motion used selectively to clarify ideas and give the brand a distinct point of view.',
  },
];

const operatingModel = [
  {
    icon: Code,
    title: 'Approach',
    description: 'We start with the audience, the business goal, and the constraints before choosing a solution.',
  },
  {
    icon: ChartBar,
    title: 'Outcomes',
    description: 'Fast, legible products with a clear route from first visit to meaningful action.',
  },
  {
    icon: Globe,
    title: 'Stack',
    description: 'React, Shopify, WordPress, Vercel, AWS, Cloudflare, and practical AI integrations.',
  },
  {
    icon: Shield,
    title: 'Support',
    description: 'Maintenance, monitoring, and iterative growth after launch.',
  },
];

const ContactForm = lazy(() => import('../components/common/ContactForm'));
const ClientReviews = lazy(() => import('../components/common/ClientReviews'));
const PartnerShowcase = lazy(() => import('../components/common/PartnerShowcase'));

function DeferredMount({ children, minHeight = 320 }: { children: React.ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (active || !ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [active]);
  return <div ref={ref} style={active ? undefined : { minHeight }}>{active ? <Suspense fallback={null}>{children}</Suspense> : null}</div>;
}

const featuredFallbackProjects = homeFallbackProjects;
const responsiveProjectImages = new Set([
  '/images/voguedecor.com.webp',
  '/images/americandreamautoprotect.com.webp',
  '/images/pedroclavero.com.webp',
  '/images/Riaz Crockery.webp',
]);

const projectImageSrcSet = (src: string) => responsiveProjectImages.has(src)
  ? `${encodeURI(src.replace('.webp', '-480.webp'))} 480w, ${encodeURI(src.replace('.webp', '-800.webp'))} 800w, ${encodeURI(src)} 1460w`
  : undefined;

function FeaturedProjectCarousel({ projects }: { projects: Project[] }) {
  const slides = projects.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || interacting || reducedMotion || slides.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reducedMotion, slides.length]);

  if (!slides.length) return null;
  const safeIndex = Math.min(activeIndex, slides.length - 1);
  const project = slides[safeIndex];
  const image = project.image || project.thumbnail;

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <section className="studio-project-carousel" aria-labelledby="featured-carousel-heading"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="studio-container">
        <div className="studio-carousel-heading">
          <div>
            <p className="studio-eyebrow">Selected work / swipe through</p>
            <h2 id="featured-carousel-heading">A closer look at<br /><span className="studio-gradient-text">what we make.</span></h2>
          </div>
          <div className="studio-carousel-controls">
            <span aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => move(-1)} aria-label="Previous featured project"><ChevronLeft size={19} aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next featured project"><ChevronRight size={19} aria-hidden="true" /></button>
          </div>
        </div>

        <div className="studio-carousel-frame" role="region" aria-roledescription="carousel" aria-label="Featured portfolio projects">
          <div className="studio-carousel-glow" aria-hidden="true" />
          <div className="studio-carousel-image">
            <img key={image} src={image} srcSet={projectImageSrcSet(image)} sizes="(max-width: 767px) 100vw, 58vw" alt={project.title} />
            <span className="studio-carousel-image-label">{project.category || 'Selected project'}</span>
          </div>
          <div className="studio-carousel-copy" aria-live={paused || interacting || reducedMotion ? 'polite' : 'off'}>
            <span className="studio-carousel-index">Case study {String(activeIndex + 1).padStart(2, '0')}</span>
            <h3>{project.title}</h3>
            <p>{project.shortDescription || project.description}</p>
            <div className="studio-carousel-tags">{project.technologies.slice(0, 3).map((technology) => <span key={technology}>{technology}</span>)}</div>
            <Link to={`/portfolio/${project.slug}`} className="studio-text-link">View case study <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className="studio-carousel-footer">
          <div className="studio-carousel-dots" role="group" aria-label="Choose featured project">
            {slides.map((item, index) => <button key={item.id} type="button" aria-pressed={safeIndex === index} aria-label={`Show ${item.title}`} onClick={() => setActiveIndex(index)}><span /></button>)}
          </div>
          {!reducedMotion && <button type="button" className="carousel-pause" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? 'Resume slideshow' : 'Pause slideshow'}</button>}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const contactEmail = useContactEmail();
  const [projects, setProjects] = useState<Project[]>(featuredFallbackProjects);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>(homeFallbackBlogs);

  useEffect(() => {
    let active = true;
    cachedPublicFetch<Paginated<Project>>('/api/v2/projects?limit=8', 'public.projects.featured.v2', {
      items: featuredFallbackProjects,
      nextCursor: null,
      total: featuredFallbackProjects.length,
    }).then((data) => {
      if (active) setProjects(data.items.length ? data.items : featuredFallbackProjects);
    });
    cachedPublicFetch<Paginated<BlogPost>>('/api/v2/blog?limit=3', 'public.blog.latest.v2', {
      items: homeFallbackBlogs,
      nextCursor: null,
      total: homeFallbackBlogs.length,
    }).then((data) => {
      if (active) setLatestBlogs(data.items.length ? data.items : homeFallbackBlogs);
    });
    return () => { active = false; };
  }, []);

  const featuredProject = projects[0] || homeFallbackProjects[0];
  const supportingProjects = projects.slice(1, 4);
  const portfolioCategories = Array.from(new Set(projects.map((project) => project.category))).slice(0, 3);

  return (
    <div className="relative overflow-hidden bg-brand-dark">
      {/* Hero Section */}
      <section id="home-hero" className="section-transition relative isolate flex min-h-[760px] items-center overflow-hidden bg-[#03030b] pb-16 pt-32 sm:min-h-[820px] sm:pt-36 lg:min-h-[900px] lg:pt-40">
        <video className="home-hero-bg-video" autoPlay muted loop playsInline preload="metadata" poster="/images/home-hero-side-poster.webp" aria-hidden="true">
          <source src="/videos/other-pages-hero.mp4" type="video/mp4" />
        </video>
        <div className="home-hero-glass" aria-hidden="true" />
        <div className="home-hero-ambient" aria-hidden="true" />
        <motion.div className="home-hero-content relative z-20 mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="max-w-3xl lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="mb-7 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/65"
              >
                <span className="h-px w-9 bg-brand-primary" />
                <LetterReveal text="DESIGN + ENGINEERING STUDIO" />
              </motion.div>
              
              <div className="mb-8 max-w-4xl overflow-hidden sm:mb-10">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="text-[clamp(2.75rem,7vw,6.75rem)] font-display font-black uppercase leading-[0.9] tracking-[-0.07em] text-white drop-shadow-[0_8px_34px_rgba(0,0,0,0.35)]"
                >
                  We design and build <br />
                  <span className="bg-gradient-to-r from-[#31d7ff] via-[#31a8ff] to-[#6e7cff] bg-clip-text text-transparent">digital products.</span>
                </motion.h1>
              </div>
              
              <TextReveal 
                text="LB CodeBase builds websites, commerce platforms, and product experiences for teams that care about clarity, performance, and craft."
                className="mb-9 max-w-xl text-base font-normal leading-7 text-white/70 sm:mb-11 sm:text-lg sm:leading-8"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col gap-3 sm:flex-row sm:gap-4"
              >
                <Magnetic strength={0.2}>
                  <Button size="lg" className="w-full shadow-[0_0_30px_rgba(61,90,254,0.28)] sm:w-auto" onClick={() => navigate('/contact')}>
                    Start a project
                  </Button>
                </Magnetic>
                <Magnetic strength={0.1}>
                  <Button variant="outline" size="lg" className="w-full border-white/25 bg-white/[0.03] sm:w-auto" onClick={() => navigate('/portfolio')}>
                    View selected work
                  </Button>
                </Magnetic>
              </motion.div>

            </div>

            <div className="home-hero-floating-stage relative z-30 order-last flex min-h-[280px] items-center justify-center lg:col-span-5 lg:min-h-[560px]">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(73,93,255,0.3),transparent_62%)] blur-3xl" />
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
                tabIndex={-1}
                aria-hidden="true"
                poster="/images/home-hero-side-poster.webp"
                className="home-hero-floating-video relative z-10 h-full w-full object-contain object-center"
              >
                <source src="/videos/lb-codebase-hero-transparent.webm" type="video/webm" />
              </video>
            </div>
          </div>
        </motion.div>

        {/* System status removed site-wide */}
      </section>

      <section className="trusted-by-strip" aria-label="Trusted by teams across sectors">
        <div className="trusted-by-inner"><span className="trusted-by-label">Trusted by teams building what’s next</span><div className="trusted-by-list"><span>VOGUE DECOR</span><span>SPARKALADS</span><span>NOOR GEMSTONE</span><span>GAO TEK</span><span>JUGO</span></div></div>
      </section>

      {/* Capabilities - Brand-Led Systems */}
      <section className="relative overflow-hidden border-y border-white/5 bg-brand-gray px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
        <DeferredVideo
          src="/videos/important-sections-bg.mp4"
          allowCoarsePointer
          className="section-background-video absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/75 to-brand-dark" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:88px_88px]" />

        <HomeCapabilities />
        <div className="home-capabilities-old relative z-10 mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex min-h-[360px] flex-col justify-between border-t border-white/15 py-7 md:min-h-[430px] md:py-10 lg:pr-12"
            >
              <div className="relative z-10">
                <div className="mb-7 inline-flex items-center gap-3">
                  <span className="h-px w-8 bg-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">Capabilities</span>
                </div>

                <h2 className="max-w-3xl font-display text-3xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl md:text-5xl">
                  One team <span className="studio-highlight">from product thinking to production code.</span>
                </h2>
                <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-white/55 md:text-base">
                  We connect the work that is often split between agencies: structure, interface design, frontend engineering, commerce, and launch support.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {['Strategy', 'Design', 'Engineering', 'Growth'].map((item) => (
                    <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-brand-primary bg-brand-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-[#526bff]"
                >
                  View Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 rounded-md border border-white/15 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:border-white/30 hover:bg-white/5"
                >
                  Start a Project
                  <Send className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"
            >
              {[
                { value: 'Fast', label: 'Load experience', body: 'Lean frontends, smart media, and responsive delivery.' },
                { value: 'Clear', label: 'User journeys', body: 'Simple paths from first impression to qualified action.' },
                { value: 'Built', label: 'Scalable systems', body: 'Content, commerce, and infrastructure ready to grow.' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="group relative border-t border-white/10 py-6 transition-colors duration-300 hover:border-white/25 md:px-2 md:py-7"
                >
                  <div className="absolute right-5 top-5 font-display text-5xl font-black leading-none text-white/[0.04] group-hover:text-brand-primary/10">
                    0{index + 1}
                  </div>
                  <div className="relative z-10 max-w-sm">
                    <div className="mb-4 h-px w-16 bg-brand-primary/60" />
                    <h3 className="font-display text-3xl font-black uppercase leading-none tracking-tighter text-white">{item.value}</h3>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">{item.label}</div>
                    <p className="mt-5 text-sm font-light leading-6 text-white/70">{item.body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3 md:mt-8">
            {capabilityTracks.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: index * 0.08 }}
                  className="group relative flex min-h-[250px] flex-col border-t border-white/10 py-7 transition-colors duration-300 hover:border-brand-primary/50 md:min-h-[290px] md:px-2"
                >
                  <div className="absolute -right-7 -top-7 font-display text-[6rem] font-black leading-none text-white/[0.035] transition-colors duration-500 group-hover:text-brand-primary/10 md:text-[7rem]">
                    0{index + 1}
                  </div>
                  <div className="relative z-10 mb-10 text-white/45 transition-colors duration-300 group-hover:text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="relative z-10 mt-auto">
                    <h3 className="mb-4 font-display text-2xl font-black uppercase leading-none tracking-tighter text-white transition-colors duration-500 group-hover:text-brand-primary">
                      {item.title}
                    </h3>
                    <p className="text-sm font-light leading-6 text-white/50">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {operatingModel.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: index * 0.06 }}
                  className="group border-l border-white/10 py-3 pl-5 transition-colors duration-300 hover:border-brand-primary/60"
                >
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="text-white/45 transition-colors duration-300 group-hover:text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">0{index + 1}</span>
                  </div>
                  <h3 className="mb-3 font-display text-base font-black uppercase text-white">{item.title}</h3>
                  <p className="text-sm font-light leading-6 text-white/70">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partners - Infinite Marquee */}
      <DeferredMount minHeight={240}><PartnerShowcase /></DeferredMount>
      <FeaturedProjectCarousel projects={projects} />
      <WorkShowcase />
      <ServiceMatrix />
      <StrategyTimeline />
      <ResultsDashboard />
      <PlatformMatrix />

      {/* Services - The Bento Grid */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-dark">
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            badge="Services"
            title={<>Focused digital work, <br/> built end to end.</>}
            description="Design and engineering support for websites, stores, business platforms, automation, and AI agents."
            align="left"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:min-h-[600px]">
            <BentoCard span="col-span-1 md:col-span-2 md:row-span-2" className="border-t-brand-primary/70">
              <div className="h-full flex flex-col justify-between">
                <div className="p-4 bg-brand-primary/10 rounded-2xl w-fit mb-8">
                  <Globe className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-black mb-4 uppercase tracking-tighter">Web Engineering</h3>
                  <p className="text-white/60 text-lg font-normal leading-relaxed mb-8">
                    React and Next.js products, from focused websites to portals, booking systems, and content platforms.
                  </p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link to="/services" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary group">
                      See our web work
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <Link to="/services#specialist-builds" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/75 transition-colors hover:text-white group">
                      Explore platforms
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </BentoCard>

            <BentoCard span="col-span-1 md:col-span-2" className="flex-row items-center gap-8">
              <div className="p-4 bg-brand-purple/10 rounded-2xl w-fit">
                <Smartphone className="w-8 h-8 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-2">Mobile Apps</h3>
                <p className="text-white/60 text-sm font-normal">Responsive mobile products with clear flows and platform-aware interaction.</p>
              </div>
            </BentoCard>

            <BentoCard span="col-span-1" className="justify-center items-center text-center">
              <Palette className="w-10 h-10 text-brand-accent mb-6" />
              <h3 className="text-lg font-display font-black uppercase tracking-tighter">Product Design</h3>
            </BentoCard>

            <BentoCard span="col-span-1" className="justify-center items-center text-center">
              <Gauge className="w-10 h-10 text-brand-primary mb-6" />
              <h3 className="text-lg font-display font-black uppercase tracking-tighter">E-commerce</h3>
            </BentoCard>

            <BentoCard span="col-span-1 md:col-span-2" className="bg-brand-gray/50 border-brand-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-2">Cloud Infrastructure</h3>
                  <p className="text-white/60 text-sm font-normal">Practical AWS and Vercel deployments with monitoring and room to grow.</p>
                </div>
                <Shield className="w-8 h-8 text-brand-primary/50" />
              </div>
            </BentoCard>

            <BentoCard span="col-span-1 md:col-span-2" className="border-brand-primary/20 bg-brand-primary/[0.04]">
              <div className="flex h-full flex-col justify-between gap-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-primary/25 bg-brand-primary/10 text-brand-primary">
                  <Bot className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-black uppercase tracking-tighter text-white">Automation & AI agents</h3>
                  <p className="max-w-lg text-sm font-normal leading-6 text-white/60">n8n workflows, practical AI integrations, and custom chat or voice agents connected to your business systems.</p>
                  <Link to="/services#automation-ai" className="group mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary">
                    Explore automation services
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Manifesto Section - Optimized */}
      <section className="home-manifesto-old py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary mb-8"
              >
                HOW WE WORK
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.95] tracking-tighter uppercase mb-8 gradient-text">
                CLEAR DECISIONS, <br /> CAREFUL EXECUTION.
              </h2>
              <p className="text-white/50 text-xl font-light leading-relaxed mb-12">
                We reduce noise early, document the important decisions, and build interfaces that stay coherent as the product grows.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'CLARITY', desc: 'Content and navigation organized around what visitors need to understand next.', icon: <Shield className="w-5 h-5" /> },
                  { title: 'MEASUREMENT', desc: 'Performance, accessibility, and conversion paths reviewed before and after launch.', icon: <Activity className="w-5 h-5" /> }
                ].map((v, i) => (
                  <div key={i}>
                    <div className="text-brand-primary mb-4">{v.icon}</div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">{v.title}</h3>
                    <p className="text-white/70 font-light text-xs leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/images/sectionimage1.webp"
                srcSet="/images/sectionimage1-480.webp 480w, /images/sectionimage1-800.webp 800w, /images/sectionimage1.webp 1264w"
                sizes="(max-width: 1023px) calc(100vw - 48px), 50vw"
                alt="LB CodeBase design and engineering work"
                loading="lazy"
                decoding="async"
                width={1264}
                height={844}
                className="relative z-10 w-full rounded-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section - Tiny Blog */}
      <section className="home-insights-old py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 border-t border-white/5 bg-brand-dark/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
            {[
              { value: 'Strategy', label: 'Scope and priorities' },
              { value: 'Design', label: 'Flows and interface' },
              { value: 'Build', label: 'Frontend and commerce' },
              { value: 'Support', label: 'Launch and iteration' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="mb-3 font-display text-2xl font-bold leading-none tracking-tight text-white md:text-3xl">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects - Curated Archive */}
      <section className="relative overflow-hidden border-t border-white/5 bg-brand-dark py-24 md:py-32">
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:96px_96px]" />

        <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              badge="Selected work"
              title={<>Recent products, <br/> <span className="text-white/55">explained clearly.</span></>}
              description="A selection of commerce, service, and product work with the problem, approach, and implementation behind each build."
              align="left"
              className="mb-0"
            />
            <Link
              to="/portfolio"
              className="inline-flex w-fit items-center justify-center gap-3 rounded-full border border-white/10 px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-white transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-white/5"
            >
              Full Portfolio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <Link
              to={`/portfolio/${featuredProject.slug}`}
              className="project-3d-card group relative min-h-[480px] overflow-hidden rounded-lg border border-white/10 bg-brand-gray lg:col-span-7 lg:min-h-[640px]"
            >
              <img
                src={featuredProject.image || featuredProject.thumbnail}
                srcSet={projectImageSrcSet(featuredProject.image || featuredProject.thumbnail)}
                sizes="(max-width: 1023px) calc(100vw - 48px), 58vw"
                alt={featuredProject.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-8">
                <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary backdrop-blur-md">
                  Featured case study
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:bg-brand-primary">
                  <ArrowRight className="h-5 w-5 text-white transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">{featuredProject.category}</span>
                  <span className="h-px w-10 bg-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
                    {featuredProject.completionDate || 'Live System'}
                  </span>
                </div>
                <h3 className="max-w-3xl font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">
                  {featuredProject.title}
                </h3>
                <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/55 md:text-lg">
                  {featuredProject.shortDescription || featuredProject.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {featuredProject.technologies?.slice(0, 4).map((technology) => (
                    <span key={technology} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/55">
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            <div className="grid gap-6 lg:col-span-5">
              {supportingProjects.map((project, index) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.slug}`}
                  className={cn(
                    'group grid min-h-[210px] overflow-hidden border-t border-white/10 transition-colors duration-300 hover:border-brand-primary/60 md:grid-cols-[180px_1fr]',
                    index === 0 && 'lg:min-h-[250px]',
                  )}
                >
                  <div className="relative min-h-[180px] overflow-hidden">
                    <img
                      src={project.image || project.thumbnail}
                      srcSet={projectImageSrcSet(project.image || project.thumbnail)}
                      sizes="(max-width: 767px) calc(100vw - 48px), 180px"
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">{project.category}</span>
                        <ArrowRight className="h-4 w-4 text-white/20 transition-all duration-500 group-hover:translate-x-1 group-hover:text-brand-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-black uppercase leading-none text-white transition-colors duration-500 group-hover:text-brand-primary">
                        {project.title}
                      </h3>
                      <p className="mt-4 line-clamp-2 text-sm font-light leading-relaxed text-white/70">
                        {project.shortDescription || project.description}
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.technologies?.slice(0, 2).map((technology) => (
                        <span key={technology} className="text-[10px] font-black uppercase tracking-[0.25em] text-white/65">
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                to="/portfolio"
                className="group flex min-h-[190px] flex-col justify-between border-t border-brand-primary/50 py-7 transition-colors duration-300 hover:border-brand-primary"
              >
                <div className="flex items-center justify-between">
                  <Rocket className="h-6 w-6 text-brand-primary" />
                  <ArrowRight className="h-5 w-5 text-brand-primary transition-transform duration-500 group-hover:translate-x-2" />
                </div>
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-brand-primary">Explore Archive</div>
                  <h3 className="font-display text-2xl font-black uppercase leading-none text-white">
                    See the complete portfolio system.
                  </h3>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 border-y border-white/5 py-6 sm:grid-cols-3 sm:gap-4">
            {[
              { label: 'Featured systems', value: projects.length.toString().padStart(2, '0') },
              { label: 'Primary categories', value: portfolioCategories.join(' / ') || 'Digital' },
              { label: 'Archive status', value: 'Live' },
            ].map((item) => (
                  <div key={item.label} className="min-w-0 border-l border-white/10 py-2 pl-4">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/65 sm:text-[10px]">{item.label}</div>
                <div className="mt-3 break-words font-display text-lg font-black uppercase leading-tight text-white sm:text-xl">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DeliveryRoadmap />
      <StudioProofPanel />

      <DeferredMount minHeight={520}><ClientReviews /></DeferredMount>

      {/* Latest Blog - Compact Engineering Lab */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-dark overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8">
            <SectionHeader 
              badge="Journal"
              title="Notes from the work."
              description="Practical writing about frontend engineering, performance, product design, and delivery."
              className="mb-0"
            />
            <Button variant="outline" size="md" className="flex-shrink-0" onClick={() => navigate('/blog')}>Read all posts</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 group cursor-pointer relative rounded-lg overflow-hidden border border-white/10 aspect-[16/9] lg:aspect-auto h-[200px] sm:h-[250px] md:h-[400px] w-full"
            >
              {latestBlogs[0] && (
                <Link to={`/blog/${latestBlogs[0].slug}`} className="absolute inset-0 z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-primary" aria-label={`Read ${latestBlogs[0].title}`} />
              )}
              <img 
                src={latestBlogs[0]?.image || latestBlogs[0]?.coverImage || '/images/webdevolopmentservice.webp'}
                alt={latestBlogs[0]?.title || 'Main post'} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent p-8 md:p-12 flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl md:text-4xl font-display font-black text-white mb-4 uppercase tracking-tighter max-w-xl text-center lg:text-left">{latestBlogs[0]?.title || 'THE ARCHITECTURE OF A $100M APP.'}</h3>
                <div className="flex items-center justify-center gap-3 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                  Read article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              {(latestBlogs.length > 1 ? latestBlogs.slice(1, 3) : homeFallbackBlogs.slice(0, 2)).map((post, i) => (
                <Link
                  key={post.id || i}
                  to={`/blog/${post.slug}`}
                  className="group flex cursor-pointer items-center gap-4 border-t border-white/10 py-5 transition-colors hover:border-brand-primary/50 sm:gap-6"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={post.image || post.coverImage || (i % 2 === 0 ? '/images/designwebsiteservice.webp' : '/images/digitalauditservice.webp')}
                      alt={post.title || 'Side post'} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-all duration-700" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-display font-black text-white group-hover:text-brand-primary transition-colors leading-tight uppercase mb-2">{post.title}</h3>
                    <div className="text-[10px] text-white/65 font-black uppercase tracking-widest">{post.time || post.readingTime}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form - Professional Glass */}
      <section className="home-contact-section py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader 
              badge="Contact"
              title={<>Tell us what <br/> you need to build.</>}
              description="Share the product, audience, current constraints, and timeline. We will reply with focused next steps."
              className="mb-10"
            />
            <div className="space-y-8">
              {[
                { label: 'Direct Email', val: contactEmail },
                { label: 'Engineering Hub', val: 'Mingora, Swat, Pakistan' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="text-[10px] uppercase font-black tracking-[0.4em] text-blue-300 mb-2">{item.label}</div>
                  <div className="text-sm sm:text-base md:text-xl lg:text-2xl font-display font-black tracking-tighter uppercase break-all">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative border-t border-white/15 py-6 sm:py-8 md:px-8 md:py-10">
            <DeferredMount minHeight={520}><ContactForm /></DeferredMount>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-final-cta py-24 px-6 md:px-20">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-lg border border-brand-primary/50 bg-[#111633] p-8 text-center sm:p-10 md:p-16 lg:p-20"
        >
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 sm:mb-8 lg:mb-10 leading-[0.9] tracking-tighter uppercase">
              Have a product in mind?
            </h2>
            <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed">
              Tell us what needs to work, who it is for, and where the current experience falls short.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 sm:px-16" onClick={() => navigate('/contact')}>
                Start a conversation
              </Button>
              <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/30 px-8 sm:px-16" onClick={() => window.location.href=`mailto:${contactEmail}`}>
                Email us
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
