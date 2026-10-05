import { motion } from 'motion/react';
import { Button, SectionHeader } from '../components/common/UI';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, Palette, Zap, Globe, Cpu, Smartphone, Send, Shield, Activity, Rocket, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DeferredVideo, Magnetic, TextReveal, LetterReveal } from '../components/common/Animations';
import type { BlogPost, Paginated, Project, TeamMember } from '../lib/content';
import { cachedPublicFetch } from '../lib/public-api';
import { homeFallbackBlogs, homeFallbackProjects } from '../lib/home-content';
import { useContactEmail } from '../lib/site-settings';
import MemberPortrait from '../components/team/MemberPortrait';

// HeroScene3D removed to use a solid black hero background per request

const capabilityTracks = [
  {
    icon: Palette,
    title: 'Brand Platforms',
    description: 'Clear brand and content systems for websites that need to explain, persuade, and convert.',
  },
  {
    icon: Zap,
    title: 'Product Experiences',
    description: 'Commerce and product journeys designed around real customer decisions.',
  },
  {
    icon: Cpu,
    title: 'Interactive Media',
    description: '3D and motion used selectively to clarify ideas and give the brand a distinct point of view.',
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
type HomeTeamMember = Pick<TeamMember, 'id' | 'slug' | 'name' | 'role' | 'specialization' | 'avatar'>;
const homeTeamFallback: HomeTeamMember[] = [
  { id: 'team-wajid', slug: 'wajid-hussain', name: 'Wajid Hussain', role: 'CEO, LB CodeBase', specialization: 'Automation, commerce architecture & cloud systems', avatar: '/lbt/Wajid Hussain.png' },
  { id: 'team-mohsin', slug: 'mohsin-bilal', name: 'Mohsin Bilal', role: 'Lead Brand & Graphics Designer', specialization: 'Visual identity & brand systems', avatar: '/lbt/Mohsin.png' },
  { id: 'team-laiba', slug: 'laiba-sahibzada', name: 'Laiba Sahibzada', role: 'Senior Frontend & Full-Stack Developer', specialization: 'Frontend engineering & web performance', avatar: '/lbt/Laiba.png' },
  { id: 'team-ibad', slug: 'ibad-ullah', name: 'Ibad Ullah', role: 'Lead UI/UX & Product Designer', specialization: 'Product design & user experience', avatar: '/lbt/Ibdullah.png' },
];
const responsiveProjectImages = new Set([
  '/images/voguedecor.com.webp',
  '/images/americandreamautoprotect.com.webp',
  '/images/pedroclavero.com.webp',
  '/images/Riaz Crockery.webp',
]);

const projectImageSrcSet = (src: string) => responsiveProjectImages.has(src)
  ? `${src.replace('.webp', '-480.webp')} 480w, ${src.replace('.webp', '-800.webp')} 800w, ${src} 1460w`
  : undefined;

export default function Home() {
  const navigate = useNavigate();
  const contactEmail = useContactEmail();
  const [projects, setProjects] = useState<Project[]>(featuredFallbackProjects);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>(homeFallbackBlogs);
  const [team, setTeam] = useState<HomeTeamMember[]>(homeTeamFallback);

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
    cachedPublicFetch<{ items: HomeTeamMember[] }>('/api/v2/team?limit=50', 'public.team.home.v2', { items: homeTeamFallback })
      .then(({ items }) => { if (active) setTeam(items.length ? items : homeTeamFallback); });
    return () => { active = false; };
  }, []);

  const featuredProject = projects[0] || homeFallbackProjects[0];
  const supportingProjects = projects.slice(1, 4);

  return (
    <div className="overflow-hidden relative bg-brand-dark">
      {/* Hero Section */}
      <section id="home-hero" className="section-transition relative min-h-screen flex items-center pt-32 sm:pt-36 md:pt-40 pb-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-black" />
        <motion.div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/55"
              >
                <span className="h-px w-9 bg-brand-primary" />
                <LetterReveal text="DESIGN + ENGINEERING STUDIO" />
              </motion.div>
              
              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[0.95] tracking-tighter uppercase"
                >
                  WE DESIGN AND BUILD <br />
                  <span className="text-brand-primary">DIGITAL PRODUCTS.</span>
                </motion.h1>
              </div>
              
              <TextReveal 
                text="LB CodeBase builds websites, commerce platforms, and product experiences for teams that care about clarity, performance, and craft."
                className="mb-12 max-w-2xl text-lg font-normal leading-7 text-white/58 md:text-xl md:leading-8"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <Magnetic strength={0.2}>
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/contact')}>
                    Start a project
                  </Button>
                </Magnetic>
                <Magnetic strength={0.1}>
                  <Button variant="outline" size="lg" className="w-full border-white/10 sm:w-auto" onClick={() => navigate('/portfolio')}>
                    View selected work
                  </Button>
                </Magnetic>
              </motion.div>
            </div>
            
            {/* Side Video */}
            <div className="lg:col-span-5 relative">
              <div className="home-hero-video-frame relative aspect-[4/3] overflow-hidden rounded-2xl bg-black sm:aspect-[16/10] md:rounded-3xl lg:aspect-[4/5]">
                <DeferredVideo
                  src="/videos/home-hero-side.mp4"
                  poster="/images/home-hero-side-poster.webp"
                  allowCoarsePointer
                  className="home-hero-video absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* System status removed site-wide */}
      </section>

      {/* Studio introduction */}
      <section className="relative overflow-hidden border-y border-white/5 bg-brand-gray px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
        <div className="relative z-10 mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col justify-between border-t border-white/15 py-7 lg:pr-12"
            >
              <div className="relative z-10">
                <div className="mb-7 inline-flex items-center gap-3">
                  <span className="h-px w-8 bg-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary">Capabilities</span>
                </div>

                <h2 className="max-w-3xl font-display text-3xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl md:text-5xl">
                  One team from product thinking to production code.
                </h2>
                <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-white/55 md:text-base">
                  We connect the work that is often split between agencies: structure, interface design, frontend engineering, commerce, and launch support.
                </p>

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

            <figure className="relative min-w-0">
              <img src="/images/jugomockup.webp" alt="Jugo project mockup from the LB CodeBase portfolio" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-lg border border-white/10 object-cover" />
              <figcaption className="mt-3 flex justify-between gap-4 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
                <span>One studio</span><span>Strategy / design / engineering</span>
              </figcaption>
            </figure>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 border-t border-white/10 md:mt-16 md:grid-cols-3">
            {capabilityTracks.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: index * 0.08 }}
                  className="group relative flex flex-col py-6 transition-colors duration-300 md:px-3 md:py-8"
                >
                  <div className="relative z-10 mb-5 flex items-center justify-between text-white/45 transition-colors duration-300 group-hover:text-brand-primary">
                    <Icon className="h-5 w-5" />
                    <span className="font-display text-sm font-black text-white/25">0{index + 1}</span>
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

        </div>
      </section>

      {/* Partners - Infinite Marquee */}
      <DeferredMount minHeight={240}><PartnerShowcase /></DeferredMount>

      {/* Services - The Bento Grid */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-dark">
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            badge="Services"
            title={<>Focused digital work, <br/> built end to end.</>}
            description="Design and engineering support for websites, stores, business platforms, automation, and AI agents."
            align="left"
          />
          
          <div className="grid gap-9 border-t border-white/10 pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                <img src="/images/voguedecor.com.webp" srcSet="/images/voguedecor.com-480.webp 480w, /images/voguedecor.com-800.webp 800w, /images/voguedecor.com.webp 1460w" sizes="(max-width: 1023px) calc(100vw - 48px), 48vw" alt="Vogue Decor commerce project" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover object-top" />
              </div>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Web engineering / commerce</p>
                  <h3 className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">Built for the real journey.</h3>
                </div>
                <Link to="/services" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-white">All services <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">From focused websites to portals and commerce platforms, we design the experience and build the systems behind it.</p>
            </div>

            <div className="divide-y divide-white/10 border-b border-white/10">
              {[
                { icon: Smartphone, title: 'Mobile applications', body: 'Clear flows and platform-aware interaction.', href: '/services' },
                { icon: Palette, title: 'Product design', body: 'Research, interfaces, and design systems built around the user.', href: '/services' },
                { icon: Zap, title: 'E-commerce', body: 'Product discovery, checkout, and storefront operations.', href: '/services' },
                { icon: Shield, title: 'Cloud infrastructure', body: 'Deployment and monitoring with room to grow.', href: '/tech' },
                { icon: Bot, title: 'Automation & AI agents', body: 'n8n workflows and custom chat or voice agents connected to business systems.', href: '/services#automation-ai' },
              ].map(({ icon: Icon, title, body, href }, index) => (
                <Link key={title} to={href} className="group grid grid-cols-[28px_minmax(0,1fr)_20px] items-start gap-4 py-5 transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:gap-6 sm:py-6">
                  <Icon className="mt-1 h-5 w-5 text-brand-primary" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">0{index + 1}</p>
                    <h3 className="mt-1 font-display text-lg font-black uppercase text-white sm:text-xl">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Section - Optimized */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray relative overflow-hidden">
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
                <h3 className="max-w-3xl font-display text-4xl font-black uppercase leading-none text-white md:text-5xl">
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

        </div>
      </section>

      {/* People behind the projects */}
      {team.length > 0 && (
        <section className="border-t border-white/10 bg-brand-gray px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between">
              <SectionHeader badge="The team" title={<>Different disciplines. <br /><span className="text-white/45">One shared standard.</span></>} description="Meet the people responsible for the strategy, design, and engineering behind the work." className="!mb-0" />
              <Link to="/about#team-directory" className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-primary transition-colors hover:text-white">Meet the full team <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
              <Link to={`/team/${team[0].slug}`} className="group grid overflow-hidden border border-white/10 bg-black sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
                <div className="h-[340px] overflow-hidden bg-white/[0.04] sm:h-auto sm:min-h-[380px]">
                  <MemberPortrait src={team[0].avatar} alt={`${team[0].name}, ${team[0].role}`} sizes="(max-width: 639px) 100vw, 35vw" loading="lazy" decoding="async" className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Featured profile / 01</span>
                  <div className="mt-12">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/50">{team[0].role}</p>
                    <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-white md:text-4xl">{team[0].name}</h3>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">{team[0].specialization}</p>
                    <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary">View portfolio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {team.slice(1, 4).map((member) => (
                  <Link key={member.id} to={`/team/${member.slug}`} className="group flex items-center gap-5 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:gap-7">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-white/[0.04] sm:h-28 sm:w-24">
                      <MemberPortrait src={member.avatar} alt="" sizes="96px" loading="lazy" decoding="async" className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">{member.role}</p>
                      <h3 className="mt-2 font-display text-lg font-black uppercase leading-tight text-white sm:text-xl">{member.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/50">{member.specialization}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-brand-primary" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Process Section - Cinematic Flow */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 relative overflow-hidden bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Process"
            title={<>A practical route <br /> <span className="text-white/55">from brief to launch.</span></>}
            description="A four-part process that keeps product decisions visible and gives design and engineering the same source of truth."
            align="left"
            className="mb-16"
          />
          
          <ol className="grid grid-cols-1 border-t border-white/10 md:grid-cols-4">
            {[
              { 
                step: '01', 
                title: 'DISCOVERY', 
                desc: 'We clarify the audience, business goal, content, constraints, and the decisions that matter most.'
              },
              { 
                step: '02', 
                title: 'ART DIRECTION', 
                desc: 'We define the information hierarchy, visual direction, and responsive behavior in working prototypes.'
              },
              { 
                step: '03', 
                title: 'ARCHITECTURE', 
                desc: 'We build reusable components, connect real content, and test the details across devices.'
              },
              { 
                step: '04', 
                title: 'DEPLOYMENT', 
                desc: 'We verify performance and accessibility, support launch, and prioritize the next iteration.'
              },
            ].map((p, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative border-l border-white/10 py-6 pl-7 transition-colors duration-300 md:border-l-0 md:border-t md:px-4 md:py-7 first:md:pl-0 last:md:pr-0"
              >
                <div>
                  <span className="absolute -left-[5px] top-8 h-2 w-2 rounded-full bg-brand-primary md:-top-[5px] md:left-4 first:md:left-0" aria-hidden="true" />
                  <div className="mb-6 flex items-center justify-between">
                    <div className="font-display text-2xl font-black text-brand-primary">
                      {p.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-black mb-4 tracking-tighter uppercase group-hover:text-brand-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

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
                <h3 className="text-2xl md:text-4xl font-display font-black text-white mb-4 uppercase tracking-tighter max-w-xl text-center lg:text-left">{latestBlogs[0]?.title || 'Notes from the work'}</h3>
                <div className="flex items-center justify-center gap-3 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                  Read article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              {latestBlogs.slice(1, 3).map((post, i) => (
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
              {latestBlogs.length < 2 && (
                <div className="flex flex-1 flex-col justify-between border-t border-white/10 py-6">
                  <p className="max-w-xs text-sm leading-6 text-white/55">Read more practical notes on design decisions, frontend engineering, and delivery.</p>
                  <Link to="/blog" className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary">Browse the journal <ArrowRight className="h-4 w-4" /></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form - Professional Glass */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray/50 border-y border-white/5 relative overflow-hidden">
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

    </div>
  );
}
