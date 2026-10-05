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
    icon: <Zap className="w-8 h-8" />,
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
      className="relative overflow-x-clip"
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

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.95] tracking-tighter"
                >
                  DESIGN, BUILD, <br />
                  <span className="text-brand-primary">AND SUPPORT.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="A multidisciplinary team for websites, stores, applications, and the systems that keep them useful after launch."
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

        {/* Cinematic Service List */}
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="space-y-16 md:space-y-24 mb-20 md:mb-32">
          {serviceList.map((s, i) => (
            <motion.div
              key={i}
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
              
              <div className={`lg:col-span-6 space-y-7 md:space-y-10 ${i % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
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
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">{f}</span>
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

        {/* Pricing tiers */}
        <section className="py-20 md:py-32 border-t border-white/5">
          <SectionHeader 
            badge="Investment"
            title={<>Starting points <br /> <span className="text-white/45">for common scopes.</span></>}
            description="Indicative packages for early planning. Final scope depends on content, integrations, and delivery requirements."
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
                      <Zap className={cn("w-4 h-4", p.popular ? "text-white" : "text-brand-primary")} />
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
        <section className="py-20 md:py-32 lg:py-40 border-t border-white/5">
          <SectionHeader 
             badge="Project Estimator"
             title={<>Plan an initial <br /><span className="text-white/45">project range.</span></>}
             description="Choose the type of work and core requirements to create a useful starting brief."
             align="center"
          />
          <div className="mt-12 md:mt-24 w-full">
            <ProjectCalculator />
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-20 sm:py-32 lg:py-40 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg border border-brand-primary/40 bg-[#111633] p-8 text-center sm:p-12 md:p-16 lg:p-20"
          >
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="mb-8 font-display text-3xl font-bold leading-[0.95] tracking-tight text-white sm:text-4xl md:text-5xl">Have a defined problem?</h2>
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
