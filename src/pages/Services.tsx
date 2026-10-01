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
    desc: "Start your digital journey with a bespoke design that captures your brand essence. We create high-fidelity prototypes that define your market presence from day one.",
    features: ["Custom UI Kit", "Mobile-First Design", "Brand Guidelines", "Cinematic Animations"],
    image: "/images/designwebsiteservice.png"
  },
  {
    icon: <Layers className="w-8 h-8" />,
    title: "RE-DESIGN A WEBSITE",
    desc: "Transform your outdated platform into a modern masterwork. We audit your existing UX and rebuild it with performance and conversion at its core.",
    features: ["UX Audit & Research", "Modern Tech Migration", "SEO Preservation", "Performance Overhaul"],
    image: "/images/websiteredesignservice.webp"
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "WEB DEVELOPMENT",
    desc: "We build high-performance, scalable web applications using React, Next.js, and Node.js. Optimized for speed and AWWWARDS-level aesthetics.",
    features: ["Next.js App Router", "Full-Stack Node.js", "Performance Optimization", "Secure Architecture"],
    image: "/images/webdevolopmentservice.webp"
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "APP DEVELOPMENT",
    desc: "Cross-platform mobile solutions that provide native-level performance. We focus on seamless interactions and intuitive user journeys.",
    features: ["React Native", "Firebase Integration", "App Store Deployment", "Push Cloud Services"],
    image: "/images/appdevolopmentservice.jpeg"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "SHOPIFY & E-COM",
    desc: "Wajid Hussain leads our e-commerce division, building premium Shopify and WooCommerce stores that convert traffic into loyal customers.",
    features: ["Custom Liquid Themes", "Checkout Optimization", "API Integrations", "CRO Strategy"],
    image: "/images/shopifyecommerseservice.jpg"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "DIGITAL AUDIT",
    desc: "A surgical analysis of your current digital footprint. We identify security gaps, performance bottlenecks, and UX friction points to maximize your conversion potential.",
    features: ["Performance Profiling", "Security Scanning", "UX Friction Analysis", "Strategic Roadmap"],
    image: "/images/digitalauditservice.webp"
  },
  {
    icon: <BarChart className="w-8 h-8" />,
    title: "GROWTH & MAINTENANCE",
    desc: "Post-launch velocity is critical. We provide continuous iteration, security patches, and conversion optimization to ensure your digital legacy continues to expand.",
    features: ["24/7 Priority Support", "Conversion Rate Optimization (CRO)", "Security Monitoring", "Feature Iteration"],
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
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
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
                  ENGINEERING <br />
                  <span className="text-brand-primary italic">ABSOLUTE.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="We provide a surgical spectrum of digital engineering services. From cinematic art direction to battle-tested architectural ecosystems, we build for the top 1%."
                className="text-white/60 text-xl md:text-3xl max-w-3xl leading-tight font-light"
              />
            </div>
          </div>

          <div className="absolute bottom-12 right-12 z-20 hidden lg:block">
            <div className="p-10 rounded-[3rem] glass border-white/5 space-y-8 w-80">
              {[
                { label: 'Latency', value: '< 100ms' },
                { label: 'Uptime', value: '99.99%' },
                { label: 'Security', value: 'Level 4' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-2xl font-display font-black text-white">{stat.value}</span>
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
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
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
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-white/20">Service 0{i + 1}</div>
                </div>
                
                <h3 className="text-3xl sm:text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none group-hover:text-brand-primary transition-colors">
                  {s.title}
                </h3>
                
                <p className="text-white/40 text-base sm:text-lg md:text-xl leading-relaxed font-light max-w-xl">
                  {s.desc}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                  {s.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(61,90,254,0.5)] group-hover/item:scale-150 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-widest text-white/60">{f}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 md:pt-8">
                  <Magnetic strength={0.2}>
                    <Button variant="outline" size="lg" className="rounded-2xl border-white/10 hover:border-brand-primary hover:text-white" onClick={() => navigate('/contact')}>
                      Consultation Brief
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
            title={<>STRATEGIC <br /> <span className="text-white/20 uppercase italic">MODELS.</span></>}
            description="Clear, performance-driven investment structures for brands that value absolute quality."
            align="left"
            className="mb-24"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                tier: 'ESSENTIAL', 
                price: '$150', 
                desc: 'Artisanal digital foundation for emerging visionaries.',
                features: ['Custom Visual System', 'High-Velocity Build', 'Core Performance', 'Strategic Launch']
              },
              { 
                tier: 'PREMIUM', 
                price: '$200', 
                desc: 'The gold standard for market-leading digital ecosystems.',
                features: ['Deep Strategy Audit', 'Advanced React Architecture', 'SEO Authority', 'Post-Launch Velocity'],
                popular: true
              },
              { 
                tier: 'ELITE', 
                price: 'Custom', 
                desc: 'Enterprise-grade innovation for global dominance.',
                features: ['Continuous R&D', 'Scalable Cloud Ops', 'Dedicated Engineering Hub', 'Legacy Support']
              },
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "p-4 sm:p-6 md:p-8 rounded-[1rem] md:rounded-[2rem] border relative group glass transition-all duration-700",
                  p.popular ? 'bg-brand-primary border-brand-primary text-white shadow-2xl md:scale-105 z-10' : 'bg-white/[0.02] border-white/5 text-white'
                )}
              >
                {p.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 bg-white text-brand-primary text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.4em] rounded-full shadow-2xl whitespace-nowrap">
                    POPULAR CHOICE
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
                  Initiate {p.tier}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Project Calculator - Premium Wrapper */}
        <section className="py-20 md:py-32 lg:py-40 border-t border-white/5">
          <SectionHeader 
             badge="Project Estimator"
             title={<>ESTIMATE YOUR <br /><span className="text-white/20 uppercase italic">INVESTMENT.</span></>}
             description="Get a surgical calculation based on your specific mission parameters."
             align="center"
          />
          <div className="mt-12 md:mt-24 w-full">
            <ProjectCalculator />
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-20 sm:py-32 lg:py-40 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 sm:p-12 md:p-16 lg:p-24 rounded-[1rem] md:rounded-[5rem] bg-brand-primary overflow-hidden relative shadow-2xl text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-purple opacity-90" />
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tighter uppercase mb-8 sm:mb-10 lg:mb-12 leading-[0.9]">Build <br /> extraordinary.</h2>
              <p className="text-white/80 text-base sm:text-lg md:text-xl lg:text-2xl mb-10 sm:mb-12 lg:mb-16 font-light">Join elite brands that trust our architectural absolute.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/booking')}>
                  Booking Consultancy
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20 text-white" onClick={() => navigate('/portfolio')}>
                  Explore Archive
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
}
