import { motion } from 'motion/react';
import { Button } from '../components/common/UI';
import { Target, Users } from 'lucide-react';
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
                  text="Our studio"
                  className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75"
                />
              </motion.div>

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={false}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tighter normal-case leading-[0.95]"
                >
                  A team behind <br />
                  <span className="text-blue-300 italic">every detail.</span>
                </motion.h1>
              </div>

              <TextReveal
                text="LB CodeBase was founded by Wajid Hussain in 2022. Based in Swat, we bring design, development, and commerce experience together to help teams launch and improve their digital products."
                className="mb-16 max-w-full text-lg font-normal leading-snug text-white/75 sm:text-xl md:max-w-3xl md:text-3xl md:leading-tight"
              />

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 border-t border-white/5 pt-10 sm:flex sm:flex-wrap sm:gap-12 sm:pt-12">
                <div>
                  <div className="mb-2 font-display text-3xl font-semibold normal-case tracking-tighter text-white sm:text-4xl">2022</div>
                  <div className="text-xs text-white/75 normal-case font-semibold tracking-[0.1em]">Foundation</div>
                </div>
                <div>
                  <div className="mb-2 font-display text-3xl font-semibold normal-case tracking-tighter text-white sm:text-4xl">Swat</div>
                  <div className="text-xs text-white/75 normal-case font-semibold tracking-[0.1em]">Based in Pakistan</div>
                </div>
                <div>
                  <div className="mb-2 font-display text-3xl font-semibold normal-case tracking-tighter text-white sm:text-4xl">Design + code</div>
                  <div className="text-xs text-white/75 normal-case font-semibold tracking-[0.1em]">Working together</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cinematic Narrative */}
        <section className="py-20">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-8 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-24 items-center">
              <div className="relative min-w-0">
                <ParallaxSection offset={50}>
                  <ImageReveal
                    src="/images/thesearchforabsolutesection1.webp"
                    alt="Design and development work at LB CodeBase"
                    className="aspect-[4/3] rounded-[1.5rem] border border-white/5 object-cover shadow-2xl md:rounded-[3.5rem] lg:aspect-[4/5]"
                  />
                </ParallaxSection>
                <div className="absolute -bottom-6 -right-4 p-6 bg-brand-primary rounded-[1.5rem] text-white shadow-2xl z-20 md:-bottom-10 md:-right-10 md:p-12 md:rounded-[3rem]">
                  <Target className="w-8 h-8 md:w-12 md:h-12" />
                </div>
              </div>

              <div className="min-w-0 space-y-10 md:space-y-16">
                <div className="text-xs font-semibold normal-case tracking-[0.1em] text-blue-300">Our approach</div>
                <h2 className="text-4xl md:text-5xl font-display font-semibold tracking-tighter normal-case leading-[0.95]">How we work <br /><span className="text-white/75 normal-case italic">together.</span></h2>
                <p className="text-white/75 text-xl md:text-2xl leading-relaxed font-normal">
                  Good work starts with understanding the problem. We connect content, design, and engineering decisions, review the details together, and keep the handover in view from the beginning.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-8">
                  {[
                    { title: "Maintainable by design", desc: "Clear components, thoughtful integrations, and documentation your team can use." },
                    { title: "Design with a purpose", desc: "A visual direction shaped by the audience, the content, and the task at hand." }
                  ].map((item, i) => (
                    <div key={i} className="space-y-6 group">
                      <div className="h-px w-12 bg-brand-primary transition-[width] duration-500 group-hover:w-full" />
                      <h4 className="text-xl font-display font-semibold normal-case tracking-tight">{item.title}</h4>
                      <p className="text-white/75 text-sm font-normal leading-relaxed">{item.desc}</p>
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
                <div className="mb-7 inline-flex items-center gap-3 text-xs font-semibold normal-case tracking-[0.1em] text-blue-300">
                  <Users className="h-4 w-4" /> The people behind the work
                </div>
                <h2 className="max-w-5xl font-display text-4xl font-semibold normal-case leading-[0.94] tracking-normal sm:text-5xl md:text-6xl lg:text-7xl">
                  Meet the <span className="text-white/75">team.</span>
                </h2>
                <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 md:text-xl">
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
                <p className="mb-3 text-xs font-semibold normal-case tracking-[0.1em] text-blue-300">Team directory</p>
                <h3 className="font-display text-3xl font-semibold normal-case tracking-normal md:text-5xl">Individual expertise.<br /><span className="text-white/75">Shared standard.</span></h3>
              </div>
              <p className="text-sm font-bold normal-case tracking-[0.1em] text-white/75">{teamMembers.length} active {teamMembers.length === 1 ? 'member' : 'members'}</p>
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
              initial={false}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 sm:p-12 md:p-16 lg:p-32 rounded-[2rem] md:rounded-[5rem] bg-brand-primary overflow-hidden relative shadow-[0_0_100px_rgba(61,90,254,0.3)] text-center"
            >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-purple opacity-90" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75 mb-8 sm:mb-10 lg:mb-12">Have a project in mind?</div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-display font-semibold text-white tracking-tighter normal-case mb-8 sm:mb-10 lg:mb-12 leading-[0.9]">Let’s build <br /> something useful.</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:bg-white" onClick={() => navigate('/contact')}>
                  Start a project
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto border border-white/20 text-white" onClick={() => navigate('/portfolio')}>
                  See our work
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
