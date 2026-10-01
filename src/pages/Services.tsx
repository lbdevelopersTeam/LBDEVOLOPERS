import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { Layout, Smartphone, Search, Database, BarChart, HardDrive, Shield, Layers, Palette, Code, Cpu, ArrowRight, Zap } from 'lucide-react';
import { TextReveal, LetterReveal, Magnetic, ImageReveal, ParallaxSection, HeroBackground } from '../components/common/Animations';
import ProjectCalculator from '../components/common/ProjectCalculator';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { cachedFetch } from '../lib/content';

const fallbackServiceList = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "New website design",
    desc: "For a new brand or launch: clarify your offer and create a credible first experience. Includes content structure, responsive layouts, and prototypes to review before development.",
    features: ["Custom UI Kit", "Mobile-First Design", "Brand Guidelines", "Purposeful motion"],
    image: "/images/designwebsiteservice.png"
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: "Website redesign",
    desc: "For a website that has outgrown its original design: identify friction, preserve useful content, and plan the migration. Includes a UX review, redesign, and SEO migration planning.",
    features: ["UX Audit & Research", "Modern Tech Migration", "SEO Preservation", "Performance Overhaul"],
    image: "/images/websiteredesignservice.webp"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Web development",
    desc: "For teams needing a maintainable site or application: build responsive interfaces and dependable integrations. Includes components, API connections, testing, and handover.",
    features: ["Next.js App Router", "Full-Stack Node.js", "Performance Optimization", "Secure Architecture"],
    image: "/images/webdevolopmentservice.webp"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "App development",
    desc: "For a validated product flow that needs a mobile experience: connect clear journeys with dependable functionality. Includes interaction design, integrations, testing, and release planning.",
    features: ["React Native", "Firebase Integration", "App Store Deployment", "Push Cloud Services"],
    image: "/images/appdevolopmentservice.jpeg"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Shopify and commerce",
    desc: "For stores that need clearer discovery and smoother operations: Wajid Hussain leads our commerce work. Includes storefront design, product navigation, theme development, and integrations.",
    features: ["Custom Liquid Themes", "Checkout Optimization", "API Integrations", "CRO Strategy"],
    image: "/images/shopifyecommerseservice.jpg"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "Digital audit",
    desc: "For teams deciding where to invest next: find the most useful improvements before committing to a rebuild. Includes performance checks, UX review, security review, and a prioritized roadmap.",
    features: ["Performance Profiling", "Security Scanning", "UX Friction Analysis", "Strategic Roadmap"],
    image: "/images/digitalauditservice.webp"
  },
  {
    icon: <BarChart className="w-8 h-8" />,
    title: "Growth and maintenance",
    desc: "For products already in use: keep the site healthy and improve it as needs change. Includes agreed updates, monitoring, maintenance, and feature improvements.",
    features: ["Agreed support hours", "Conversion Rate Optimization (CRO)", "Security Monitoring", "Feature Iteration"],
    image: "/images/growthandmintainenceservice.jpg"
  }
];

export default function Services() {
  const navigate = useNavigate();
  const [serviceList, setServiceList] = useState(fallbackServiceList);

  useEffect(() => {
    let active = true;
    cachedFetch<{ items: { id: string; slug: string; title: string; shortDescription: string; image: string; features: string[] }[] }>(
      '/api/v2/services',
      'public.services.v2',
      { items: [] },
    )
      .then(({ items }) => {
        if (!active || !items.length) return;
        setServiceList(items.map((item, index) => {
          const editorial = fallbackServiceList.find((service) => service.title.toLowerCase() === item.title.toLowerCase() || ({ 'DESIGN A WEBSITE': 'New website design', 'RE-DESIGN A WEBSITE': 'Website redesign', 'SHOPIFY & E-COM': 'Shopify and commerce', 'GROWTH & MAINTENANCE': 'Growth and maintenance' } as Record<string, string>)[item.title.toUpperCase()] === service.title);
          return {
            icon: editorial?.icon || fallbackServiceList[index % fallbackServiceList.length].icon,
            title: editorial?.title || item.title,
            desc: editorial?.desc || item.shortDescription,
            features: editorial?.features || item.features,
            image: item.image || editorial?.image || '',
          };
        }));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative overflow-x-clip"
    >
      {/* Proper Services Hero */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />

          <div className="max-w-[1600px] mx-auto w-full px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                <LetterReveal
                  text="CAPABILITIES"
                  className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75"
                />
              </motion.div>

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={false}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold normal-case leading-[0.95] tracking-tighter"
                >
                  Design, build, <br />
                  <span className="text-blue-300 italic">and improve.</span>
                </motion.h1>
              </div>

              <TextReveal
                text="We help growing brands redesign, build, and improve the digital products their customers rely on."
                className="text-white/75 text-xl md:text-3xl max-w-3xl leading-tight font-normal"
              />
            </div>
          </div>

          <div className="absolute bottom-12 right-12 z-20 hidden lg:block">
            <div className="p-10 rounded-[3rem] glass border-white/5 space-y-8 w-80">
              {[
                { label: 'Speed', value: 'Real networks' },
                { label: 'Reliability', value: 'Maintainable' },
                { label: 'Delivery', value: 'With care' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-xs font-semibold text-white/75 normal-case tracking-widest">{stat.label}</span>
                  <span className="text-2xl font-display font-semibold text-white">{stat.value}</span>
                </div>
              ))}
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

        {/* Cinematic Service List */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="space-y-16 md:space-y-24 mb-20 md:mb-32">
          {serviceList.map((s, i) => (
            <motion.div
              key={i}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20 items-center"
            >
              <div className={`lg:col-span-6 ${i % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                <ParallaxSection offset={30}>
                  <div className="relative group">
                    <div className="absolute -inset-10 bg-brand-primary/5 blur-[100px] rounded-full group-hover:bg-brand-primary/10 transition-all duration-1000" />
                    <ImageReveal
                      src={s.image}
                      alt={s.title}
                      className="rounded-[1rem] md:rounded-[2rem] aspect-[16/10] object-cover border border-white/5 relative z-10"
                    />
                  </div>
                </ParallaxSection>
              </div>

              <div className={`lg:col-span-6 space-y-7 md:space-y-10 ${i % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-blue-300 border border-brand-primary/20">
                    {s.icon}
                  </div>
                  <div className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75">Service 0{i + 1}</div>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold normal-case tracking-tighter leading-none group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h2>

                <p className="text-white/75 text-base sm:text-lg md:text-xl leading-relaxed font-normal max-w-xl">
                  {s.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                  {s.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(61,90,254,0.5)] group-hover/item:scale-150 transition-transform" />
                      <span className="text-sm font-bold normal-case tracking-widest text-white/75">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 md:pt-8">
                  <Magnetic strength={0.2}>
                    <Button variant="outline" size="lg" className="rounded-2xl border-white/10 hover:border-brand-primary hover:text-white" onClick={() => navigate('/contact')}>
                      Discuss this service
                    </Button>
                  </Magnetic>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Tiers Section - Ultra Premium */}
        <section className="py-20 md:py-32 border-t border-white/5">
          <SectionHeader
            badge="Investment"
            title={<>How we scope <br /> <span className="text-white/75 normal-case italic">the work.</span></>}
            description="Each proposal sets out deliverables, revisions, timing, and handover. Hosting, content creation, and ongoing support are discussed separately."
            align="left"
            className="mb-24"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                tier: 'Launch',
                price: 'Scoped quote',
                desc: 'A focused website or landing page for a new offer.',
                features: ['Responsive design', 'Agreed page scope', 'Content integration', 'Launch and handover']
              },
              {
                tier: 'Improve',
                price: 'Scoped quote',
                desc: 'A redesign or rebuild shaped by the problems in your current product.',
                features: ['UX review', 'Design and development', 'Migration planning', 'Agreed launch checks'],
                popular: false
              },
              {
                tier: 'Ongoing',
                price: 'Custom',
                desc: 'An agreed support and improvement plan for an existing product.',
                features: ['Planned updates', 'Monitoring', 'Feature improvements', 'Documented support scope']
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "p-4 sm:p-6 md:p-8 rounded-[1rem] md:rounded-[2rem] border relative group glass transition-all duration-700",
                  p.popular ? 'bg-brand-primary border-brand-primary text-white shadow-2xl md:scale-105 z-10' : 'bg-white/[0.02] border-white/5 text-white'
                )}
              >
                {p.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 bg-white text-blue-300 text-xs font-semibold normal-case tracking-[0.1em] rounded-full shadow-2xl whitespace-nowrap">
                    POPULAR CHOICE
                  </div>
                )}

                <div className={cn("text-xs font-semibold normal-case tracking-[0.1em] mb-4 sm:mb-6 md:mb-12", p.popular ? "text-white/75" : "text-blue-300")}>
                  {p.tier}
                </div>

                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold tracking-tighter mb-4 sm:mb-6 md:mb-8 leading-none">
                  {p.price}
                </div>

                <p className={cn("text-sm sm:text-base md:text-lg leading-relaxed font-normal mb-8 sm:mb-10 md:mb-12", p.popular ? "text-white/80" : "text-white/75")}>
                  {p.desc}
                </p>

                <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-8 sm:mb-10 md:mb-16">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Zap className={cn("w-4 h-4", p.popular ? "text-white" : "text-blue-300")} />
                      <span className={cn("text-xs md:text-sm font-bold normal-case tracking-widest", p.popular ? "text-white/90" : "text-white/75")}>{f}</span>
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
        <section className="py-20 md:py-32 lg:py-40 border-t border-white/5">
          <SectionHeader
             badge="Project planner"
             title={<>A starting point <br /><span className="text-white/75 normal-case italic">for your project.</span></>}
             description="Share the scope, timing, and assets you have. Take a useful brief into the conversation."
             align="center"
          />
          <div className="mt-12 md:mt-24 w-full">
            <ProjectCalculator />
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-20 sm:py-32 lg:py-40 relative">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 sm:p-12 md:p-16 lg:p-24 rounded-[1rem] md:rounded-[5rem] bg-brand-primary overflow-hidden relative shadow-2xl text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-purple opacity-90" />
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-semibold text-white tracking-tighter normal-case mb-8 sm:mb-10 lg:mb-12 leading-[0.9]">Build something <br /> your team can grow.</h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl lg:text-2xl mb-10 sm:mb-12 lg:mb-16 font-normal">Let’s discuss what your product needs and how we can help.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/booking')}>
                  Book a conversation
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20 text-white" onClick={() => navigate('/portfolio')}>
                  See our work
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
