import { motion } from 'motion/react';
import { Button } from '../components/common/UI';
import { Users } from 'lucide-react';
import { ParallaxSection, ImageReveal, TextReveal, LetterReveal, HeroBackground } from '../components/common/Animations';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import TeamMemberCard from '../components/team/TeamMemberCard';
import MemberPortrait from '../components/team/MemberPortrait';
import { applyCuratedProfileFallback, cachedFetch, fallbackTeam, TeamMember } from '../lib/content';
import { useSeo } from '../lib/seo';

export default function About() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(fallbackTeam);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    cachedFetch<{ items: TeamMember[] }>('/api/v2/team?limit=50', 'public.team.v2', { items: fallbackTeam }).then((data) => {
      if (active) setTeamMembers((data.items.length ? data.items : fallbackTeam).map(applyCuratedProfileFallback));
    });
    return () => { active = false; };
  }, []);

  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LB CodeBase',
    description: 'Learn about LB CodeBase and meet the specialists behind its digital work.',
    mainEntity: {
      '@type': 'Organization',
      name: 'LB CodeBase',
      employee: teamMembers.map((member) => ({
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
        url: `${window.location.origin}/team/${member.slug}`,
      })),
    },
  }), [teamMembers]);

  useSeo({
    title: 'About & Team | LB CodeBase',
    description: 'Learn about LB CodeBase and meet the engineering, design, automation, and strategy specialists behind the work.',
    canonicalPath: '/about',
    schema,
  });

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
        
        <div className="max-w-[1600px] mx-auto w-full relative z-10 px-6">
          <div className="min-w-0 max-w-4xl">
              <motion.div
                initial={false}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                <LetterReveal 
                  text="OUR GENESIS" 
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" 
                />
              </motion.div>
              
              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={false}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter uppercase leading-[0.95]"
                >
                  ENGINEERING <br />
                  <span className="text-brand-primary italic">THE FUTURE.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="LB CodeBase is a high-fidelity digital engineering agency founded by Wajid Hussain. We define the intersection of cinematic design and absolute technical performance."
                className="mb-16 max-w-full text-lg font-light leading-snug text-white/60 sm:text-xl md:max-w-3xl md:text-3xl md:leading-tight"
              />
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 border-t border-white/5 pt-10 sm:flex sm:flex-wrap sm:gap-12 sm:pt-12">
                <div>
                  <div className="mb-2 font-display text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">2022</div>
                  <div className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">Foundation</div>
                </div>
                <div>
                  <div className="mb-2 font-display text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">Global</div>
                  <div className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">Operations</div>
                </div>
                <div>
                  <div className="mb-2 font-display text-3xl font-black uppercase tracking-tighter text-white sm:text-4xl">50+</div>
                  <div className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em]">Masterworks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative spinning badge */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-12 -right-12 hidden w-64 h-64 border border-white/5 rounded-full items-center justify-center p-6 backdrop-blur-md bg-white/[0.01] z-20 pointer-events-none md:flex md:w-80 md:h-80 lg:w-96 lg:h-96 md:p-8"
          >
            <div className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/10 text-center leading-relaxed">
              PREMIUM • DIGITAL • ENGINEERING • BUREAU • LB • CODEBASE •
            </div>
          </motion.div>
        </section>

        {/* Studio practice */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20">
              <div className="relative min-w-0">
                <ParallaxSection offset={20}>
                  <ImageReveal 
                    src="/images/thesearchforabsolutesection1.webp"
                    alt="LB CodeBase studio work and creative direction"
                    className="aspect-[4/3] rounded-lg border border-white/10 object-cover lg:aspect-[4/5]"
                  />
                </ParallaxSection>
                <p className="mt-3 border-t border-white/10 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Design and engineering / LB CodeBase</p>
              </div>
              
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">OUR PRACTICE</div>
                <h2 className="mt-5 font-display text-3xl font-black uppercase leading-[1.02] tracking-tighter sm:text-4xl md:text-5xl">Clear thinking.<br /><span className="text-white/40">Careful delivery.</span></h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/60 md:text-lg md:leading-8">
                  We work across product strategy, interface design, and engineering. That means the people shaping the experience stay close to the people building it.
                </p>
                
                <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
                  {[
                    { title: "Understand the brief", desc: "We establish who the product serves and what the next action should be." },
                    { title: "Make the work usable", desc: "We test structure, content, interaction, and implementation together." }
                  ].map((item, i) => (
                    <div key={i} className="grid gap-2 py-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                      <h3 className="font-display text-sm font-black uppercase text-white">{item.title}</h3>
                      <p className="text-sm leading-6 text-white/55">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="team-directory" className="scroll-mt-28 border-y border-white/5 bg-black py-20 md:py-28">
          <div className="mx-auto max-w-[1500px] px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end lg:pb-20">
              <div>
                <div className="mb-7 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">
                  <Users className="h-4 w-4" /> The people behind the work
                </div>
                <h2 className="max-w-5xl font-display text-4xl font-black uppercase leading-[1.02] tracking-normal sm:text-5xl lg:text-[3.5rem]">
                  Meet the <span className="text-white/25">team.</span>
                </h2>
                <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/50 md:text-xl">
                  A multidisciplinary group building high-performance digital products through engineering, design, automation, and focused strategy.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2" aria-label="Team portraits">
                {teamMembers.slice(0, 4).map((member, index) => (
                  <div key={member.id} className={`overflow-hidden rounded-md border border-white/10 bg-white/5 ${index % 2 ? 'translate-y-4' : '-translate-y-2'}`}>
                    {member.avatar ? <MemberPortrait src={member.avatar} alt="" sizes="(min-width: 1024px) 100px, 22vw" loading="lazy" decoding="async" className="aspect-[4/5] h-full w-full object-cover object-center grayscale transition duration-500 hover:grayscale-0" /> : <div className="aspect-[4/5]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10 mt-14 flex flex-col justify-between gap-4 md:mt-20 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Team directory</p>
                <h3 className="font-display text-3xl font-black uppercase tracking-normal md:text-5xl">Individual expertise.<br /><span className="text-white/25">Shared standard.</span></h3>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/30">{teamMembers.length} active {teamMembers.length === 1 ? 'member' : 'members'}</p>
            </div>

            <div>
              {teamMembers.map((member, index) => <TeamMemberCard key={member.id} member={member} index={index} />)}
            </div>
          </div>
        </section>

        {/* Global CTA - Epic Transformation */}
        <section className="py-20 relative">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-lg border border-brand-primary/40 bg-[#111633] p-8 text-center sm:p-12 md:p-16 lg:p-20"
            >
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="mb-6 text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Start a conversation</div>
              <h2 className="mb-8 font-display text-3xl font-black uppercase leading-[1.02] tracking-tighter text-white sm:text-4xl md:text-5xl">Tell us what you need to build.</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:bg-white" onClick={() => navigate('/contact')}>
                  Initiate Project
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20 text-white" onClick={() => navigate('/portfolio')}>
                  Explore Archive
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
