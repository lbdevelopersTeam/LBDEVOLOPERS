import { motion } from 'motion/react';
import { useContactEmail } from '../lib/site-settings';
import { HeroBackground, LetterReveal, TextReveal } from '../components/common/Animations';
import { SectionHeader, Button } from '../components/common/UI';
import { Globe, Smartphone, Layout, Server } from 'lucide-react';
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
      <section className="relative z-10 max-w-[1600px] mx-auto pt-32 pb-24 px-6 flex flex-col justify-center min-h-screen overflow-hidden">
          <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
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
          {/* Connected technology layers, based on published stack data */}
          <div className="border-t border-white/10">
          {technologies.map((group, groupIdx) => (
            <section key={group.category} className="grid gap-7 border-b border-white/10 py-10 md:py-14 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
              <div className="flex items-start gap-4 lg:sticky lg:top-32 lg:self-start">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-brand-primary/25 bg-brand-primary/10 text-brand-primary">{group.icon}</span>
                <div>
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">Layer 0{groupIdx + 1}</div>
                  <h2 className="font-display text-2xl font-black uppercase leading-tight tracking-tighter text-white sm:text-3xl">{group.category}</h2>
                </div>
              </div>

              <div className="divide-y divide-white/10 border-t border-white/10">
                {group.techs.map((tech) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="grid gap-2 py-5 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] sm:gap-8"
                  >
                    <h3 className="font-display text-base font-black uppercase text-white sm:text-lg">{tech.name}</h3>
                    <p className="text-sm leading-6 text-white/55">{tech.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <section className="my-20 md:my-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-lg border border-brand-primary/40 bg-[#111633] p-8 text-center sm:p-12 md:p-16"
          >
            <div className="relative z-10">
              <h2 className="mb-5 font-display text-3xl font-black uppercase leading-tight tracking-tighter text-white sm:text-4xl md:text-5xl">Choose the right tools for the job.</h2>
              <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-white/65">Tell us what your team needs to build. We will recommend a stack that fits the product and the people maintaining it.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/contact')}>
                  Discuss a project
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20" onClick={() => window.location.href=`mailto:${contactEmail}`}>
                  Email a brief
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
