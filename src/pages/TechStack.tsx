import { motion } from 'motion/react';
import { useContactEmail } from '../lib/site-settings';
import { HeroBackground, LetterReveal, TextReveal } from '../components/common/Animations';
import { SectionHeader, Button } from '../components/common/UI';
import { Cpu, Globe, Database, Smartphone, Shield, Zap, Layout, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cachedFetch } from '../lib/content';
import { useNavigate } from 'react-router-dom';

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
  }
];

export default function TechStack() {
  const navigate = useNavigate();
  const contactEmail = useContactEmail();
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
        setTechnologies([...grouped.entries()].map(([category, techs], index) => ({
          category,
          icon: fallbackTechnologies.find((group) => group.category === category)?.icon || fallbackTechnologies[index % fallbackTechnologies.length].icon,
          techs,
        })));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <div className="relative min-h-screen">
      <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />

      <section className="relative z-10 max-w-[1600px] mx-auto pt-32 pb-24 px-6 flex flex-col justify-center min-h-screen">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal text="OUR ARSENAL" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" />
            </motion.div>
            
            <div className="overflow-hidden mb-12">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[0.95]"
              >
                THE STACK <br />
                <span className="text-brand-primary italic">DEFINED.</span>
              </motion.h1>
            </div>
            
            <TextReveal 
              text="Our technical repertoire is surgically selected for maximum performance, extreme scalability, and zero latency. We don't follow trends; we architect standards."
              className="text-white/60 text-xl md:text-3xl max-w-3xl leading-tight font-light"
            />
          </div>
        </section>

        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
          {/* Tech Grid */}
          <div className="space-y-16 md:space-y-24">
          {technologies.map((group, groupIdx) => (
            <section key={group.category} className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 mb-10 md:mb-20">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-brand-primary shadow-[0_0_50px_rgba(61,90,254,0.1)]">
                  {group.icon}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-brand-primary/40 mb-2">Layer 0{groupIdx + 1}</div>
                  <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase">{group.category}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                {group.techs.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="p-4 sm:p-6 md:p-8 lg:p-10 rounded-[0.75rem] md:rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-brand-primary/40 transition-all duration-700 group relative overflow-hidden glass"
                  >
                    <div className="absolute top-0 right-0 p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-brand-primary animate-pulse" />
                    </div>

                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mb-2 sm:mb-4 md:mb-8">{tech.level}</div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-display font-black mb-1 sm:mb-2 md:mb-4 uppercase tracking-tight group-hover:text-brand-primary transition-colors">{tech.name}</h3>
                    <p className="text-white/40 text-[10px] sm:text-xs md:text-sm leading-relaxed font-light">{tech.description}</p>
                    
                    <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-12 pt-2 sm:pt-4 md:pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Operational</span>
                      <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(61,90,254,1)]" />
                    </div>
                  </motion.div>
                ))}
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
              <p className="text-white/80 text-base md:text-2xl mb-10 md:mb-16 max-w-2xl mx-auto font-light">Join the elite brands that trust our architectural absolute.</p>
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
