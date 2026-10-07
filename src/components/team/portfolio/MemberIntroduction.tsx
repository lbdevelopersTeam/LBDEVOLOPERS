import { motion, useReducedMotion } from 'motion/react';
import { Award, BriefcaseBusiness, CheckCircle2, Globe, MapPin, TrendingUp, UserCheck, Gauge } from 'lucide-react';
import { MemberProfile, SectionHeading } from './shared';

export default function MemberIntroduction({ member }: { member: MemberProfile }) {
  const reducedMotion = useReducedMotion();
  const projectDisciplines = Array.from(new Set(member.projects.map((project) => project.category).filter(Boolean)));

  const facts = [
    { label: 'Practice', value: member.role, icon: UserCheck },
    { label: 'Specialization', value: member.specialization, icon: BriefcaseBusiness },
    { label: 'Track Record', value: member.yearsExperience, icon: Award },
    { label: 'Location', value: member.location, icon: MapPin },
    { label: 'Availability', value: member.availability, icon: Gauge },
    { label: 'Languages', value: member.languages?.join(', '), icon: Globe },
    { label: 'Project Disciplines', value: projectDisciplines.join(' / '), icon: CheckCircle2 },
  ].filter((item) => Boolean(item.value));

  return (
    <section id="about" className="scroll-mt-28 border-b border-white/10 px-5 py-14 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index="01"
          label="About"
          description={`A strategic look into ${member.name}'s engineering and design philosophies, client accomplishments, and working standards at LB CodeBase.`}
        >
          A focused practice.<br />
          <span className="text-white/28">Built around real work.</span>
        </SectionHeading>

        <div className="mt-9 grid gap-8 md:mt-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="member-intro-copy font-display font-black uppercase leading-[1.1] text-white"
            >
              {member.tagline || member.bio}
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1 }}
              className="mt-7 space-y-4 text-base leading-7 text-white/60 md:text-lg md:leading-8"
            >
              <p>{member.fullBio || member.bio}</p>
              <p className="text-sm leading-relaxed text-white/45 md:text-base">
                Every project published in this portfolio is an engineered solution delivered in collaboration with the LB CodeBase team. The credited roles and responsibilities showcase hands-on individual contribution to production architectures.
              </p>
            </motion.div>

            {/* Impact Highlights */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="member-glass rounded-xl p-5">
                <div className="flex items-center gap-3 text-[var(--member-accent)]">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-display text-sm font-black uppercase text-white">Production-Tested</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Architectures engineered for high uptime, fast rendering, and zero-compromise security.
                </p>
              </div>

              <div className="member-glass rounded-xl p-5">
                <div className="flex items-center gap-3 text-[var(--member-accent)]">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-display text-sm font-black uppercase text-white">Conversion-Focused</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  Every interaction, layout hierarchy, and micro-motion is shaped to guide user intent to action.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Facts Matrix Card */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="member-glass member-glass-strong rounded-xl p-6 sm:p-7">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Profile Specifications</p>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--member-accent)' }}
                />
              </div>

              <dl className="space-y-4">
                {facts.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border-b border-white/8 pb-4 last:border-0 last:pb-0">
                    <dt className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                      <Icon className="h-3.5 w-3.5 text-[var(--member-accent)]" />
                      {label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-semibold leading-relaxed text-white/85">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
