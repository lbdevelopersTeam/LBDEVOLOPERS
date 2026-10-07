import { motion, useReducedMotion } from 'motion/react';
import { useContactEmail } from '../lib/site-settings';
import { HeroBackground, LetterReveal, TextReveal } from '../components/common/Animations';
import { Button } from '../components/common/UI';
import { Globe, Database, Smartphone, Layout, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cachedFetch } from '../lib/content';
import { useNavigate } from 'react-router-dom';
import { ArchitectureMap } from '../components/common/StudioVisuals';
import BrandLogo from '../components/common/BrandLogo';
import { getTechnologyLogos } from '../lib/brand-logos';
import { withPhpSystems } from '../lib/technology-groups';

const fallbackTechnologies = [
  { 
    category: 'Frontend Architecture',
    icon: <Layout className="w-6 h-6" />,
    techs: [
      { name: 'React 18+', level: 'Mastery', description: 'Advanced state management & concurrent rendering.' },
      { name: 'Next.js 14', level: 'Full Stack', description: 'Server action integration & edge computing.' },
      { name: 'Tailwind CSS', level: 'Expert', description: 'Atomic styling with design system precision.' },
      { name: 'Framer Motion', level: 'Mastery', description: 'Production-grade physics-based animations.' },
    ]
  },
  { 
    category: 'Backend & Infrastructure',
    icon: <Server className="w-6 h-6" />,
    techs: [
      { name: 'Node.js / Bun', level: 'High Velocity', description: 'Scalable runtime for microservices.' },
      { name: 'PostgreSQL', level: 'Architect', description: 'Complex relational modeling & optimization.' },
      { name: 'Redis', level: 'Elite', description: 'Sub-millisecond latency for real-time features.' },
      { name: 'Docker / K8s', level: 'Enterprise', description: 'Containerized orchestration for global scale.' },
    ]
  },
  { 
    category: 'Cloud Ecosystem',
    icon: <Globe className="w-6 h-6" />,
    techs: [
      { name: 'AWS', level: 'Certified', description: 'Global infrastructure deployment & management.' },
      { name: 'Vercel', level: 'Partner', description: 'Frontend cloud for high-performance apps.' },
      { name: 'Supabase', level: 'Expert', description: 'Real-time database and auth infrastructure.' },
      { name: 'Cloudflare', level: 'Shield', description: 'Edge security & content delivery.' },
    ]
  },
  { 
    category: 'Mobile & Emerging',
    icon: <Smartphone className="w-6 h-6" />,
    techs: [
      { name: 'React Native', level: 'Mastery', description: 'Cross-platform native performance apps.' },
      { name: 'Swift / Kotlin', level: 'Native', description: 'Optimized performance for OS-level features.' },
      { name: 'Pinecone / Vector', level: 'AI Ready', description: 'Semantic search and LLM infrastructure.' },
      { name: 'OpenAI / Gemini', level: 'Advanced', description: 'Integration of custom intelligence layers.' },
    ]
  },
  {
    category: 'PHP Systems',
    icon: <Database className="w-6 h-6" />,
    techs: [
      { name: 'PHP', level: 'Application systems', description: 'Custom portals, business applications, and APIs built around your workflows.' },
      { name: 'Laravel', level: 'Backend framework', description: 'Structured applications with authentication, queues, and maintainable business logic.' },
      { name: 'MySQL', level: 'Relational data', description: 'Reliable data models, reporting queries, and database connections for PHP applications.' },
      { name: 'WordPress', level: 'Content systems', description: 'Custom themes, plugins, and publishing tools your team can manage.' },
    ],
  },
];
const phpSystems = fallbackTechnologies[fallbackTechnologies.length - 1];

export default function TechStack() {
  const navigate = useNavigate();
  const contactEmail = useContactEmail();
  const reducedMotion = useReducedMotion();
  const [technologies, setTechnologies] = useState(fallbackTechnologies);

  useEffect(() => {
    let active = true;
    cachedFetch<{ items: { id: string; name: string; category: string; proficiency: string; description: string }[] }>(
      '/api/v2/technologies',
      'public.technologies.v2',
      { items: [] },
    )
      .then(({ items }) => {
        if (!active || !items.length) return;
        const grouped = new Map<string, typeof fallbackTechnologies[number]['techs']>();
        for (const item of items) {
          const group = grouped.get(item.category) || [];
          group.push({ name: item.name, level: item.proficiency, description: item.description });
          grouped.set(item.category, group);
        }
        setTechnologies(withPhpSystems([...grouped.entries()].map(([category, techs], index) => ({
          category,
          icon: fallbackTechnologies.find((group) => group.category === category)?.icon || fallbackTechnologies[index % fallbackTechnologies.length].icon,
          techs,
        })), phpSystems));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <div className="relative min-h-screen">
      <section className="relative isolate mx-auto pt-32 pb-24 px-6 flex flex-col justify-center min-h-screen overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
          <div className="relative z-10 w-full max-w-[1352px] mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal text="OUR TOOLKIT" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" />
            </motion.div>
            
            <div className="mb-12">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[0.95]"
              >
                The right tools.<br />
                <span className="text-brand-primary">Built to work together.</span>
              </motion.h1>
            </div>
            
            <TextReveal 
              text="The right tools for your product, chosen for performance, maintainability, and room to grow. Every layer has a purpose, from the interface to the infrastructure."
              className="text-white/60 text-xl md:text-3xl max-w-3xl leading-tight font-light"
            />
          </div>
        </section>
        <ArchitectureMap />

        <div className="tech-content max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
          {/* Tech Grid */}
          <div className="space-y-16 md:space-y-24">
          {technologies.map((group, groupIdx) => (
            <section key={group.category} className="tech-layer relative" aria-labelledby={`tech-layer-${groupIdx}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 mb-10 md:mb-20">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-brand-primary shadow-[0_0_50px_rgba(61,90,254,0.1)]">
                  {group.icon}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-brand-primary/40 mb-2">Layer 0{groupIdx + 1}</div>
                  <h2 id={`tech-layer-${groupIdx}`} className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase">{group.category}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {group.techs.map((tech, i) => {
                  const logos = getTechnologyLogos(tech.name);
                  return (
                  <motion.div
                    key={tech.name}
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reducedMotion ? 0 : i * 0.04, duration: reducedMotion ? 0 : 0.35 }}
                    className="tech-card p-4 sm:p-6 md:p-8 lg:p-10 rounded-[0.75rem] md:rounded-[1.5rem] bg-white/[0.02] border border-white/5 group relative overflow-hidden glass"
                  >
                    <div className="tech-card-watermarks" aria-hidden="true">
                      {logos.map(brand => <BrandLogo key={brand.mark} name={brand.label} className="tech-card-monogram" />)}
                    </div>
                    <div className="tech-card-topline">
                      <div className="tech-brand-badges" aria-hidden="true">
                        {logos.length ? logos.map(brand => <span className="tech-brand-badge" key={brand.mark}>
                          <BrandLogo name={brand.label} />
                        </span>) : <span className="tech-brand-badge"><Server size={28} /></span>}
                      </div>
                      <span className="tech-card-level">{tech.level}</span>
                    </div>
                    <h3>{tech.name}</h3>
                    <p className="tech-card-description">{tech.description}</p>
                    
                    <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-12 pt-2 sm:pt-4 md:pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Part of our toolkit</span>
                      <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(61,90,254,1)]" />
                    </div>
                  </motion.div>
                );})}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA - Optimized Impact */}
        <section className="mt-24 md:mt-40 lg:mt-60 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 md:p-20 lg:p-32 rounded-[1.5rem] md:rounded-[4rem] bg-brand-primary overflow-hidden relative text-center shadow-[0_0_100px_rgba(61,90,254,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-purple opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-display font-black text-white tracking-tighter uppercase mb-8 md:mb-12 leading-[0.9] md:leading-[0.8]">Build the <br /> extraordinary.</h2>
              <p className="text-white text-base md:text-2xl mb-10 md:mb-16 max-w-2xl mx-auto font-light">Join the elite brands that trust our architectural absolute.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/contact')}>
                  Consultancy
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20" onClick={() => window.location.href=`mailto:${contactEmail}`}>
                  Technical Brief
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
