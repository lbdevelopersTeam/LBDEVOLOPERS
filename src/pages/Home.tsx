import { motion } from 'motion/react';
import { Button, SectionHeader, BentoCard } from '../components/common/UI';
import { useEffect, useState } from 'react';
import ContactForm from '../components/common/ContactForm';
import ClientReviews from '../components/common/ClientReviews';
import PartnerShowcase from '../components/common/PartnerShowcase';
import { ArrowRight, Code, Palette, Zap, Globe, Cpu, Smartphone, BarChart as ChartBar, Send, Shield, Activity, Rocket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DeferredVideo, Magnetic, TextReveal, LetterReveal } from '../components/common/Animations';
import { BlogPost, cachedFetch, fallbackBlogs, fallbackProjects, mergeCuratedProjects, Paginated, Project } from '../lib/content';
import { useContactEmail } from '../lib/site-settings';

// HeroScene3D removed to use a solid black hero background per request

const capabilityTracks = [
  {
    icon: Palette,
    title: 'Brand Platforms',
    description: 'Cohesive digital platforms focused on conversion and storytelling.',
  },
  {
    icon: Zap,
    title: 'Product Experiences',
    description: 'E-commerce and product systems optimized for trust and velocity.',
  },
  {
    icon: Cpu,
    title: 'Interactive Media',
    description: 'Immersive 3D, animation, and motion that elevate brand perception.',
  },
];

const operatingModel = [
  {
    icon: Code,
    title: 'Approach',
    description: 'We combine human-centered strategy with deterministic engineering to ship experiences that scale.',
  },
  {
    icon: ChartBar,
    title: 'Outcomes',
    description: 'Faster load times, higher conversions, and infrastructure ready for global distribution.',
  },
  {
    icon: Globe,
    title: 'Tooling',
    description: 'Vercel, Netlify, AWS, Cloudflare, Shopify Plus, OpenAI integrations.',
  },
  {
    icon: Shield,
    title: 'Support',
    description: 'Maintenance, monitoring, and iterative growth after launch.',
  },
];

const featuredFallbackProjects = fallbackProjects.slice(0, 4);

export default function Home() {
  const navigate = useNavigate();
  const contactEmail = useContactEmail();
  const [projects, setProjects] = useState<Project[]>(featuredFallbackProjects);
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>(fallbackBlogs);

  useEffect(() => {
    let active = true;
    cachedFetch<Paginated<Project>>('/api/v2/projects?limit=8', 'public.projects.featured.v2', {
      items: featuredFallbackProjects,
      nextCursor: null,
      total: featuredFallbackProjects.length,
    }).then((data) => {
      if (active) setProjects(mergeCuratedProjects(data.items.length ? data.items : featuredFallbackProjects));
    });
    cachedFetch<Paginated<BlogPost>>('/api/v2/blog?limit=3', 'public.blog.latest.v2', {
      items: fallbackBlogs,
      nextCursor: null,
      total: fallbackBlogs.length,
    }).then((data) => {
      if (active) setLatestBlogs(data.items.length ? data.items : fallbackBlogs);
    });
    return () => { active = false; };
  }, []);

  const featuredProject = projects[0] || fallbackProjects[0];
  const supportingProjects = projects.slice(1, 4);
  const portfolioCategories = Array.from(new Set(projects.map((project) => project.category))).slice(0, 3);

  return (
    <div className="overflow-hidden relative bg-brand-dark">
      {/* Hero Section */}
      <section id="home-hero" className="section-transition relative min-h-screen flex items-center pt-24 sm:pt-28 md:pt-32 pb-12 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-black" />
        <motion.div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-3 px-5 py-2 bg-white/[0.03] rounded-full border border-white/10 mb-10 backdrop-blur-xl"
              >
                <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_15px_rgba(61,90,254,0.8)]" />
                <LetterReveal text="NEXT-GEN DIGITAL BUREAU" className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60" />
              </motion.div>
              
              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[0.95] tracking-tighter uppercase"
                >
                  ENGINEERING <br />
                  <span className="text-brand-primary italic">ABSOLUTE.</span>
                </motion.h1>
              </div>
              
              <TextReveal 
                text="We architect high-fidelity digital ecosystems for visionary brands. Defining the intersection of cinematic design and absolute technical performance."
                className="text-white/60 text-lg md:text-2xl max-w-2xl leading-tight font-light mb-16"
              />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <Magnetic strength={0.2}>
                  <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/contact')}>
                    Initiate Mission
                  </Button>
                </Magnetic>
                <Magnetic strength={0.1}>
                  <Button variant="outline" size="lg" className="w-full border-white/10 sm:w-auto" onClick={() => navigate('/portfolio')}>
                    Explore Archive
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
                  className="home-hero-video h-full w-full object-cover mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* System status removed site-wide */}
      </section>

      {/* Capabilities - Brand-Led Systems */}
      <section className="relative overflow-hidden border-y border-white/5 bg-brand-gray px-6 py-16 sm:px-8 md:px-12 md:py-20 lg:px-24">
        <DeferredVideo src="/videos/important-sections-bg.mp4" className="section-background-video absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/75 to-brand-dark" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:88px_88px]" />

        <div className="relative z-10 mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:min-h-[430px] md:rounded-[4rem] md:p-10"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/70 to-transparent" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-primary/15 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_18px_rgba(61,90,254,0.7)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-300">Capabilities</span>
                </div>

                <h2 className="max-w-3xl font-display text-3xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-4xl md:text-5xl">
                  Brand systems that move with precision.
                </h2>
                <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-white/55 md:text-base">
                  Strategy, design, engineering, and growth shaped into one fast, conversion-ready product system.
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
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-brand-primary/50 bg-brand-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_-10px_rgba(61,90,254,0.6)]"
                >
                  View Portfolio
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.24em] text-white transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/5"
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
                  className="glass group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-white/[0.045] md:rounded-[2.5rem] md:p-7"
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
                  className="glass group relative flex min-h-[270px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-brand-primary/40 hover:bg-white/[0.045] md:min-h-[320px] md:rounded-[3rem] md:p-8"
                >
                  <div className="absolute -right-7 -top-7 font-display text-[6rem] font-black leading-none text-white/[0.035] transition-colors duration-500 group-hover:text-brand-primary/10 md:text-[7rem]">
                    0{index + 1}
                  </div>
                  <div className="relative z-10 mb-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-primary transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white">
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
                  className="glass group rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/30 md:rounded-[2rem]"
                >
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-primary transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white">
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
      <PartnerShowcase />

      {/* Services - The Bento Grid */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-dark">
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            badge="Arsenal"
            title={<>Precision-crafted <br/> digital solutions.</>}
            description="We deploy high-end engineering and strategic design to solve complex business challenges."
            align="left"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:min-h-[600px]">
            <BentoCard span="col-span-1 md:col-span-2 md:row-span-2" className="bg-gradient-to-br from-brand-primary/10 to-transparent">
              <div className="h-full flex flex-col justify-between">
                <div className="p-4 bg-brand-primary/10 rounded-2xl w-fit mb-8">
                  <Globe className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-3xl font-display font-black mb-4 uppercase tracking-tighter">Web Engineering</h3>
                  <p className="text-white/70 text-lg font-light leading-relaxed mb-8">
                    Production-grade React, Next.js, and Three.js ecosystems built for extreme scale and zero latency.
                  </p>
                  <Link to="/services" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-primary group">
                    Full Stack Details
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </BentoCard>

            <BentoCard span="col-span-1 md:col-span-2" className="flex-row items-center gap-8">
              <div className="p-4 bg-brand-purple/10 rounded-2xl w-fit">
                <Smartphone className="w-8 h-8 text-brand-purple" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-2">Mobile Apps</h3>
                <p className="text-white/70 text-sm font-light">iOS & Android experiences that redefine interaction.</p>
              </div>
            </BentoCard>

            <BentoCard span="col-span-1" className="justify-center items-center text-center">
              <Palette className="w-10 h-10 text-brand-accent mb-6" />
              <h3 className="text-lg font-display font-black uppercase tracking-tighter">UI/UX Art</h3>
            </BentoCard>

            <BentoCard span="col-span-1" className="justify-center items-center text-center">
              <Zap className="w-10 h-10 text-brand-primary mb-6" />
              <h3 className="text-lg font-display font-black uppercase tracking-tighter">E-commerce</h3>
            </BentoCard>

            <BentoCard span="col-span-1 md:col-span-2" className="bg-brand-gray/50 border-brand-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-black uppercase tracking-tighter mb-2">Cloud Infrastructure</h3>
                  <p className="text-white/70 text-sm font-light">Bullet-proof AWS & Vercel deployments.</p>
                </div>
                <Shield className="w-8 h-8 text-brand-primary/50" />
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Manifesto Section - Optimized */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,rgba(61,90,254,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary mb-8"
              >
                OUR DNA
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-display font-black leading-[0.95] tracking-tighter uppercase mb-8 gradient-text">
                WE DON'T DO <br /> COMPROMISE.
              </h2>
              <p className="text-white/50 text-xl font-light leading-relaxed mb-12">
                Every pixel is intentional. Every line of code is architectural. We build platforms that command authority.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'AUTHORITY', desc: 'Platforms that command respect through elite design.', icon: <Shield className="w-5 h-5" /> },
                  { title: 'CONVERSION', desc: 'Data-driven psychology for exponential growth.', icon: <Activity className="w-5 h-5" /> }
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
              <div className="absolute -inset-10 bg-brand-primary/5 blur-[100px]" />
              <img 
                src="/images/sectionimage1.webp"
                alt="DNA" 
                loading="eager"
                fetchPriority="low"
                decoding="async"
                width={1264}
                height={844}
                className="relative z-10 w-full rounded-[1rem] md:rounded-[2rem] transition-all duration-1000 border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section - Tiny Blog */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 border-t border-white/5 bg-brand-dark/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
            {[
              { value: '22', label: 'Successful Launches' },
              { value: '16', label: 'Global Clients' },
              { value: '40%+', label: 'Conversion Lift' },
              { value: '99.9%', label: 'Uptime Reliability' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-3">
                  {stat.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects - Curated Archive */}
      <section className="relative overflow-hidden border-t border-white/5 bg-brand-dark py-24 md:py-32">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:96px_96px]" />

        <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader
              badge="Archive"
              title={<>Defining the <br/> <span className="text-white/65 italic uppercase">Next Standard.</span></>}
              description="A curated selection of our most impactful digital deployments."
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
              className="project-3d-card group relative min-h-[480px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-brand-gray lg:col-span-7 lg:min-h-[640px] md:rounded-[3rem]"
            >
              <img
                src={featuredProject.image || featuredProject.thumbnail}
                alt={featuredProject.title}
                loading="eager"
                fetchPriority="low"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 md:p-8">
                <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary backdrop-blur-md">
                  Featured Deployment
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
                    'group grid min-h-[210px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/30 hover:bg-white/[0.045] md:grid-cols-[180px_1fr] md:rounded-[2rem]',
                    index === 0 && 'lg:min-h-[250px]',
                  )}
                >
                  <div className="relative min-h-[180px] overflow-hidden">
                    <img
                      src={project.image || project.thumbnail}
                      alt={project.title}
                      loading="eager"
                      fetchPriority="low"
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
                className="group flex min-h-[190px] flex-col justify-between rounded-[1.5rem] border border-brand-primary/20 bg-brand-primary/10 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-brand-primary/50 hover:bg-brand-primary/15 md:rounded-[2rem]"
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
              <div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/65 sm:text-[10px]">{item.label}</div>
                <div className="mt-3 break-words font-display text-lg font-black uppercase leading-tight text-white sm:text-xl">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Cinematic Flow */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 relative overflow-hidden bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            badge="Workflow"
            title={<>THE ANATOMY OF <br /> <span className="text-white/65 italic uppercase">EXCELLENCE.</span></>}
            description="Our battle-tested workflow is designed for speed, quality, and extreme scalability."
            align="left"
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            {[
              { 
                step: '01', 
                title: 'DISCOVERY', 
                desc: 'We tear down your objectives to build a data-driven roadmap. Analysis of market gaps forms our strategy.' 
              },
              { 
                step: '02', 
                title: 'ART DIRECTION', 
                desc: 'Digital art directed by high-fidelity prototyping. We craft cinematic journeys that convert.' 
              },
              { 
                step: '03', 
                title: 'ARCHITECTURE', 
                desc: 'Full-stack engineering without compromises. We build scalable, bullet-proof codebases.' 
              },
              { 
                step: '04', 
                title: 'DEPLOYMENT', 
                desc: 'Zero-latency rollout with predictive monitoring. We optimize for global expansion.' 
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="group relative p-6 sm:p-8 md:p-10 bg-white/[0.02] border border-white/5 rounded-[1rem] md:rounded-[2.5rem] h-full flex flex-col justify-between hover:border-brand-primary/40 transition-all duration-500 glass"
              >
                <div>
                  <div className="flex items-center justify-between mb-12">
                    <div className="text-4xl font-display font-black text-white/5 group-hover:text-brand-primary/20 transition-colors">
                      {p.step}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-brand-primary transition-all duration-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:bg-white animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-black mb-4 tracking-tighter uppercase group-hover:text-brand-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ClientReviews />

      {/* Latest Blog - Compact Engineering Lab */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-dark overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8">
            <SectionHeader 
              badge="Journal"
              title="From our Lab."
              description="Latest trends in web engineering, 3D, and strategy."
              className="mb-0"
            />
            <Button variant="outline" size="md" className="flex-shrink-0">Read All Posts</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 group cursor-pointer relative rounded-[1rem] md:rounded-[3rem] overflow-hidden border border-white/5 aspect-[16/9] lg:aspect-auto h-[200px] sm:h-[250px] md:h-[400px] w-full"
            >
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
                  Read Case Study <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              {(latestBlogs.length > 1 ? latestBlogs.slice(1, 3) : fallbackBlogs.slice(0, 2)).map((post, i) => (
                <div
                  key={post.id || i}
                  className="group flex gap-4 sm:gap-6 items-center p-4 sm:p-6 bg-white/[0.02] rounded-[1rem] md:rounded-[2rem] border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer glass"
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form - Professional Glass */}
      <section className="py-16 px-6 sm:px-8 md:px-12 lg:px-24 md:py-20 bg-brand-gray/50 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeader 
              badge="Inquiry"
              title={<>Let's build <br/> something legacy.</>}
              description="Ready to elevate your digital presence? Our team will get back to you within 24 hours."
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
          
          <div className="p-5 sm:p-8 md:p-10 bg-brand-dark/40 rounded-[1.25rem] md:rounded-[3rem] border border-white/10 shadow-3xl relative glass">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Final CTA - Neon Impact */}
      <section className="py-24 px-6 md:px-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto rounded-[1rem] md:rounded-[4rem] bg-brand-primary overflow-hidden relative p-6 sm:p-8 md:p-20 lg:p-24 text-center shadow-[0_0_100px_-20px_rgba(61,90,254,0.4)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-purple opacity-50" />
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 sm:mb-8 lg:mb-10 leading-[0.9] tracking-tighter uppercase">
              Ready to create <br /> extraordinary?
            </h2>
            <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed">
              Join the elite brands who trust us for their digital expansion. Let's build the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 sm:px-16" onClick={() => navigate('/contact')}>
                Consultancy
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
