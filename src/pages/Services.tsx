import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { Layout, Smartphone, Search, Database, BarChart, HardDrive, Shield, Layers, Palette, Code, Cpu, ArrowRight, CheckCircle2, Bot, Workflow, Mic2, Cable, PanelsTopLeft, Gauge, ShoppingBag, CalendarDays, LayoutDashboard, BookOpenText, Shapes, type LucideIcon } from 'lucide-react';
import { TextReveal, LetterReveal, Magnetic, ImageReveal, ParallaxSection, HeroBackground } from '../components/common/Animations';
import ProjectCalculator from '../components/common/ProjectCalculator';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useEffect, useState, type CSSProperties } from 'react';
import { cachedFetch } from '../lib/content';
import BrandLogo from '../components/common/BrandLogo';

const fallbackServiceList = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "DESIGN A WEBSITE",
    desc: "A new website shaped around your audience, content, and business goals, with responsive prototypes before development begins.",
    features: ["Interface System", "Mobile-First Design", "Content Hierarchy", "Interaction Design"],
    image: "/images/designwebsiteservice.png"
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: "RE-DESIGN A WEBSITE",
    desc: "A focused audit and redesign of an existing website, preserving what works while improving navigation, performance, and conversion paths.",
    features: ["UX Audit & Research", "Modern Tech Migration", "SEO Preservation", "Performance Overhaul"],
    image: "/images/websiteredesignservice.webp"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "WEB DEVELOPMENT",
    desc: "Production web applications built with React, Next.js, and Node.js, with maintainable components and performance considered from the start.",
    features: ["Next.js App Router", "Full-Stack Node.js", "Performance Optimization", "Secure Architecture"],
    image: "/images/webdevolopmentservice.webp"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "APP DEVELOPMENT",
    desc: "Cross-platform mobile products with clear flows, responsive feedback, and the platform integrations needed for release.",
    features: ["React Native", "Firebase Integration", "App Store Deployment", "Push Cloud Services"],
    image: "/images/appdevolopmentservice.jpeg"
  },
  {
    icon: <BrandLogo name="Shopify" className="h-8 w-8" />,
    title: "SHOPIFY & E-COM",
    desc: "Shopify and WooCommerce stores with practical catalog structure, custom themes, useful integrations, and a clear route to checkout.",
    features: ["Custom Liquid Themes", "Checkout Optimization", "API Integrations", "CRO Strategy"],
    image: "/images/shopifyecommerseservice.jpg"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "DIGITAL AUDIT",
    desc: "A review of the current experience across usability, performance, accessibility, search visibility, and security, followed by a prioritized roadmap.",
    features: ["Performance Profiling", "Security Scanning", "UX Friction Analysis", "Strategic Roadmap"],
    image: "/images/digitalauditservice.webp"
  },
  {
    icon: <BarChart className="w-8 h-8" />,
    title: "GROWTH & MAINTENANCE",
    desc: "Ongoing maintenance, measurement, security updates, and product iteration after launch.",
    features: ["Priority Support", "Conversion Review", "Security Monitoring", "Feature Iteration"],
    image: "/images/growthandmintainenceservice.jpg"
  }
];

function ServicePageDirectory({ onStart }: { onStart: (index: number) => void }) {
return <section className="services-directory" aria-labelledby="services-directory-heading"><div className="services-page-container"><div className="services-section-intro"><div><span className="services-kicker">What we can take off your plate</span><h2 id="services-directory-heading">Choose the<br /><em>right starting point.</em></h2></div><p>Some teams need a new experience. Others need a better system behind the one they already have. Start with the problem, then choose the depth of support.</p></div><div className="services-directory-grid">{fallbackServiceList.map((service, index) => <button type="button" key={service.title} onClick={() => onStart(index)} className="services-directory-card"><span className="services-directory-number">0{index + 1}</span><span className="services-directory-icon">{service.icon}</span><strong>{service.title}</strong><small>{service.desc}</small><span className="services-directory-link">Explore service <ArrowRight size={15} aria-hidden="true" /></span></button>)}</div></div></section>;
}

function ServicePageProcess() {
  const steps = [
    { title: 'Frame', detail: 'Audience, business goals, constraints', output: 'A clear brief', icon: Search },
    { title: 'Shape', detail: 'Flows, content, and interface system', output: 'An agreed direction', icon: Palette },
    { title: 'Build', detail: 'Production code, integrations, and QA', output: 'A working system', icon: Code },
    { title: 'Improve', detail: 'Launch support, measurement, iteration', output: 'The next improvement', icon: Gauge },
  ];
  return (
    <section className="services-process" aria-labelledby="services-process-heading">
      <div className="services-page-container">
        <div className="services-section-intro services-section-intro-centered">
          <div><span className="services-kicker">A calmer way to ship</span><h2 id="services-process-heading">A clear path from<br /><em>brief to better.</em></h2></div>
          <p>Each stage has a decision to make and an artifact to review. You always know what is happening next.</p>
        </div>
        <ol className="services-process-grid">
          {steps.map(({ title, detail, output, icon: Icon }, index) => (
            <li key={title} style={{ '--process-step': index } as CSSProperties}>
              <div className="services-process-card" data-step={`0${index + 1}`}>
                <div className="services-process-card-top">
                  <span className="services-process-number">0{index + 1}</span>
                  <Icon aria-hidden="true" size={21} />
                </div>
                <h3>{title}</h3>
                <p>{detail}</p>
                <div className="services-process-output"><span>Outcome</span><strong>{output}</strong></div>
              </div>
              {index < steps.length - 1 && (
                <span className="services-process-connector" aria-hidden="true">
                  <svg className="desktop-flow-connector" viewBox="0 0 34 34" fill="none"><path d="M0 33H17V1H33M28 0L33 1L29 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  <ArrowRight className="mobile-flow-arrow" size={24} />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ServicePageFit() {
  const rows = [['New website', 'Brand system · UX · Frontend'], ['Existing website', 'Audit · Redesign · Migration'], ['Commerce', 'Catalog · Shopify · Checkout'], ['Operations', 'Automation · AI agents · Integrations']];
  return <section className="services-fit" aria-labelledby="services-fit-heading"><div className="services-page-container services-fit-grid"><div><span className="services-kicker">Pick the shape of the work</span><h2 id="services-fit-heading">The service<br /><em>fits the situation.</em></h2><p>We are comfortable entering early, in the middle of a redesign, or when the system needs to become more reliable after launch.</p></div><div className="services-fit-table">{rows.map(([need, answer], index) => <div key={need}><span>0{index + 1}</span><strong>{need}</strong><p>{answer}</p><ArrowRight size={18} aria-hidden="true" /></div>)}</div></div></section>;
}

type Capability = {
  icon: LucideIcon;
  brand?: string;
  title: string;
  description: string;
  examples: string[];
};

const specialistServices: Capability[] = [
  {
    icon: LayoutDashboard,
    title: 'Portals & dashboards',
    description: 'Secure spaces for customers and teams to manage the information and tasks that matter to them.',
    examples: ['Customer and student portals', 'Role-based admin panels', 'Reporting dashboards'],
  },
  {
    icon: CalendarDays,
    title: 'Booking & reservations',
    description: 'Clear scheduling journeys that connect availability, confirmations, and the tools behind your service.',
    examples: ['Appointment scheduling', 'Event reservations', 'Automated reminders'],
  },
  {
    icon: BookOpenText,
    title: 'CMS & content platforms',
    brand: 'WordPress',
    description: 'Easy-to-manage publishing experiences, built with WordPress or a custom content workflow when the brief calls for it.',
    examples: ['Editorial websites', 'Custom admin panels', 'Blog and resource libraries'],
  },
  {
    icon: Shapes,
    title: 'Brand identity systems',
    description: 'A coherent visual foundation that carries from a logo and color system into the website and product interface.',
    examples: ['Logo and visual direction', 'Color and type systems', 'Practical brand guidelines'],
  },
];

const automationServices: Capability[] = [
  {
    icon: PanelsTopLeft,
    title: 'Framer websites',
    brand: 'Framer',
    description: 'Fast, expressive marketing sites with a content system your team can update without rebuilding the experience.',
    examples: ['Campaign landing pages', 'CMS-driven portfolios', 'Responsive interactions'],
  },
  {
    icon: Workflow,
    title: 'n8n workflow automation',
    brand: 'n8n',
    description: 'Connected workflows that move information between the tools your team already uses, with clear failure handling.',
    examples: ['Lead routing into a CRM', 'Client onboarding flows', 'Order and status updates'],
  },
  {
    icon: Gauge,
    title: 'AI process automation',
    description: 'Practical AI steps inside existing operations, with human review where accuracy and judgment matter.',
    examples: ['Document intake', 'Support ticket triage', 'Content classification'],
  },
  {
    icon: Bot,
    title: 'Custom chat agents',
    description: 'Website and internal chat assistants grounded in your approved content, with a clear path to a person.',
    examples: ['Knowledge-base answers', 'Lead qualification', 'Support handoff'],
  },
  {
    icon: Mic2,
    title: 'Custom voice agents',
    description: 'Voice experiences for repeatable conversations, designed around your call flows and escalation rules.',
    examples: ['Call intake', 'Appointment requests', 'Conversation summaries'],
  },
  {
    icon: Cable,
    title: 'Systems & API integrations',
    description: 'Reliable connections between websites, stores, CRMs, and internal tools so data reaches the right place.',
    examples: ['Custom webhooks', 'Commerce and CRM sync', 'Reporting pipelines'],
  },
];

function CapabilityCard({ icon: Icon, brand, title, description, examples, index = 0 }: Capability & { index?: number }) {
  return (
    <article className="capability-card group flex h-full min-w-0 flex-col rounded-lg border border-white/10 bg-white/[0.025] p-6 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-white/[0.045] sm:p-7">
      {brand ? <BrandLogo name={brand} className="brand-watermark" /> : <Icon className="brand-watermark" aria-hidden="true" />}
      <div className="capability-card-top"><span className="capability-card-number">0{index + 1}</span><div className="capability-card-icon flex h-11 w-11 items-center justify-center rounded-lg border border-brand-primary/25 bg-brand-primary/10 text-brand-primary transition-colors group-hover:border-brand-primary/45 group-hover:bg-brand-primary/15">
        {brand ? <BrandLogo name={brand} className="h-6 w-6" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
      </div></div>
      <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/60">{description}</p>
      <div className="capability-card-usecases mt-7 border-t border-white/10 pt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Example use cases</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <li key={example} className="flex items-start gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs leading-5 text-white/70">
              <span>{example}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [serviceList, setServiceList] = useState(fallbackServiceList);

  useEffect(() => {
    if (hash !== '#automation-ai' && hash !== '#specialist-builds') return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash]);

  useEffect(() => {
    let active = true;
    cachedFetch<{ items: { id: string; slug: string; title: string; shortDescription: string; image: string; features: string[] }[] }>(
      '/api/v2/services',
      'public.services.v2',
      { items: [] },
    )
      .then(({ items }) => {
        if (!active || !items.length) return;
        setServiceList(items.map((item, index) => ({
          icon: fallbackServiceList.find((service) => service.title === item.title)?.icon || fallbackServiceList[index % fallbackServiceList.length].icon,
          title: item.title,
          desc: item.shortDescription,
          features: item.features,
          image: item.image,
      })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="services-page relative overflow-x-clip"
    >
      {/* Proper Services Hero */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
          
          <div className="max-w-[1600px] mx-auto w-full px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-7 inline-flex items-center gap-3"
              >
                <span className="h-px w-9 bg-brand-primary" />
                <LetterReveal 
                  text="CAPABILITIES" 
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" 
                />
              </motion.div>

              <div className="mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.95] tracking-tighter"
                >
                  Design, build,<br />
                  <span className="text-brand-primary">and support.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="A multidisciplinary team for websites, stores, platforms, automation, and AI-powered experiences that stay useful after launch."
                className="max-w-3xl text-xl font-normal leading-8 text-white/58 md:text-2xl md:leading-9"
              />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 right-1/2 translate-x-1/2 flex flex-col items-center gap-4"
          >
          </motion.div>
        </section>

        <ServicePageDirectory onStart={(index) => document.getElementById(`service-detail-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <ServicePageProcess />
        <div className="services-content">
          <div className="space-y-16 md:space-y-24 mb-20 md:mb-32">
          {serviceList.map((s, i) => (
            <motion.div
              key={i}
              id={`service-detail-${i}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20 items-center"
            >
              <div className={`lg:col-span-6 ${i % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                <ParallaxSection offset={30}>
                  <div className="relative group">
                    <ImageReveal 
                      src={s.image} 
                      alt={s.title} 
                      className="relative z-10 aspect-[16/10] rounded-lg border border-white/10 object-cover"
                    />
                  </div>
                </ParallaxSection>
              </div>
              
              <div className={`min-w-0 lg:col-span-6 space-y-7 md:space-y-10 ${i % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="text-brand-primary">
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-white/20">Service 0{i + 1}</div>
                </div>
                
                <h3 className="text-3xl sm:text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none group-hover:text-brand-primary transition-colors">
                  {s.title}
                </h3>
                
                <p className="max-w-xl text-base font-normal leading-relaxed text-white/55 sm:text-lg md:text-xl">
                  {s.desc}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                  {s.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4 group/item">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                      <span className="min-w-0 break-words text-sm font-bold uppercase tracking-widest text-white/60">{f}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 md:pt-8">
                  <Magnetic strength={0.2}>
                    <Button variant="outline" size="lg" className="border-white/10 hover:border-brand-primary hover:text-white" onClick={() => navigate('/contact')}>
                      Discuss this service
                    </Button>
                  </Magnetic>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        </div>

        {/* Full-width sections with their own content containers. */}
        <section id="specialist-builds" className="services-specialist scroll-mt-28 border-t border-white/10 py-20 md:py-28">
          <SectionHeader
            badge="Specialist builds"
            title={<>Useful digital systems. <br /><span className="text-white/45">Built around your work.</span></>}
            description="Beyond a standard website, we build the focused tools and identity systems that make a digital business easier to run and easier to recognize."
            className="mb-10 md:mb-14"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {specialistServices.map((service, index) => <CapabilityCard key={service.title} {...service} index={index} />)}
          </div>
        </section>

        {/* Automation and AI services remain available alongside CMS-managed services. */}
        <section id="automation-ai" className="services-automation scroll-mt-28 border-t border-white/10 py-20 md:py-28">
          <SectionHeader
            badge="Automation & AI"
            title={<>Make the work flow. <br /><span className="text-white/45">Keep people in control.</span></>}
            description="From a Framer launch to n8n workflows and custom agents, we design each system around the people, data, and decisions it needs to support."
            className="mb-10 md:mb-14"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {automationServices.map((service, index) => <CapabilityCard key={service.title} {...service} index={index} />)}
          </div>

          <div className="mt-9 flex flex-col gap-5 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-white/50">Have a workflow or customer conversation in mind? We can map the scope, integrations, and handoff points together.</p>
            <Link to="/contact" className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-md bg-brand-primary px-6 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#526bff]">
              Discuss automation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <ServicePageFit />

        <div className="services-content">

        {/* Pricing tiers */}
        <section className="services-investment py-20 md:py-32 border-t border-white/5">
          <SectionHeader 
            badge="Investment"
            title={<>Starting points <br /> <span className="text-white/45">for common scopes.</span></>}
            description="Indicative starting points for common website scopes. Portals, booking systems, automation, and custom agents receive a tailored quote after discovery."
            align="left"
            className="mb-24"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                tier: 'ESSENTIAL', 
                price: '$150', 
                desc: 'A focused starting point for a small website or landing experience.',
                features: ['Custom Visual System', 'High-Velocity Build', 'Core Performance', 'Strategic Launch']
              },
              { 
                tier: 'PREMIUM', 
                price: '$200', 
                desc: 'A broader website or product experience with deeper design and engineering needs.',
                features: ['Deep Strategy Audit', 'Advanced React Architecture', 'SEO Authority', 'Post-Launch Velocity'],
                popular: true
              },
              { 
                tier: 'ELITE', 
                price: 'Custom', 
                desc: 'Custom product, commerce, or platform work scoped around the actual requirements.',
                features: ['Continuous R&D', 'Scalable Cloud Ops', 'Dedicated Engineering Hub', 'Legacy Support']
              },
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "group relative border-t p-4 pt-8 transition-colors sm:p-6 sm:pt-9 md:p-8 md:pt-10",
                  p.popular ? 'border-brand-primary text-white' : 'border-white/10 text-white'
                )}
              >
                {p.popular && (
                  <div className="absolute right-4 top-3 text-[9px] font-black uppercase tracking-[0.18em] text-brand-primary sm:right-6">
                    Common scope
                  </div>
                )}
                
                <div className={cn("text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.4em] mb-4 sm:mb-6 md:mb-12", p.popular ? "text-white/60" : "text-brand-primary")}>
                  {p.tier}
                </div>
                
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black tracking-tighter mb-4 sm:mb-6 md:mb-8 leading-none">
                  {p.price}
                </div>
                
                <p className={cn("text-sm sm:text-base md:text-lg leading-relaxed font-light mb-8 sm:mb-10 md:mb-12", p.popular ? "text-white/80" : "text-white/40")}>
                  {p.desc}
                </p>
                
                <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-8 sm:mb-10 md:mb-16">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <CheckCircle2 className={cn("w-4 h-4 shrink-0", p.popular ? "text-white" : "text-brand-primary")} />
                      <span className={cn("text-xs md:text-sm font-bold uppercase tracking-widest", p.popular ? "text-white/90" : "text-white/60")}>{f}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant={p.popular ? 'secondary' : 'outline'} 
                  className="w-full"
                  onClick={() => navigate('/contact')}
                >
                  Discuss {p.tier.toLowerCase()}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Project Calculator - Premium Wrapper */}
        <section className="services-estimator py-20 md:py-32 lg:py-40 border-t border-white/5">
          <SectionHeader 
             badge="Project Estimator"
             title={<>Plan an initial <br /><span className="text-white/45">project range.</span></>}
             description="Estimate a common web, mobile, or commerce build. For specialist platforms, Framer, automation, or custom agents, share your workflow for a tailored scope."
             align="center"
          />
          <div className="mt-12 md:mt-24 w-full">
            <ProjectCalculator />
          </div>
        </section>

        {/* Global CTA */}
        <section className="services-final-cta py-20 sm:py-32 lg:py-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg border border-brand-primary/40 bg-[#111633] p-8 text-center sm:p-12 md:p-16 lg:p-20"
          >
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="mb-8 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">Have a defined problem?</h2>
              <p className="mb-10 text-base font-normal text-white/65 sm:mb-12 sm:text-lg md:text-xl">Share the current product, the people using it, and what needs to improve.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/booking')}>
                  Book a call
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20 text-white" onClick={() => navigate('/portfolio')}>
                  View selected work
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
