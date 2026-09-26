import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, CheckCircle, Code2, Layers, Wrench } from 'lucide-react';
import { MemberProfile, SectionHeading } from './shared';

const categoryIcons: Record<string, typeof Layers> = {
  'Automation & Workflows': Wrench,
  'Commerce & Infrastructure': Layers,
  'Advisory & Strategy': CheckCircle,
  'Brand Systems & Identity': Layers,
  'Product & Visual Production': Code2,
  'Design Mastery & Tools': Wrench,
  'Frontend Architecture': Code2,
  'Motion & 3D Engineering': Layers,
  'Performance & Full-Stack': Wrench,
  'User Experience & Strategy': Layers,
  'Interface & Design Systems': Code2,
  'Research & Collaboration': CheckCircle,
  'Product Design': Layers,
  'Experience & Conversion': CheckCircle,
  'Design Systems': Code2,
  'Technical Knowledge': Wrench,
};

export default function MemberExpertise({ member }: { member: MemberProfile }) {
  const reducedMotion = useReducedMotion();
  const groups = member.skillGroups?.length
    ? member.skillGroups
    : member.skills.length
      ? [{ category: 'Core Practice Disciplines', skills: member.skills }]
      : [];

  if (!groups.length) return null;

  const projectRoles = Array.from(new Set(member.projects.map((project) => project.memberRole).filter(Boolean))) as string[];

  return (
    <section id="skills" className="scroll-mt-28 border-b border-white/10 bg-[#080808] px-5 py-20 md:px-8 md:py-28 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="02"
          label="Expertise"
          description="A structured breakdown of core competencies, frameworks, and credited technical roles across live deployments."
        >
          Tools serve the work.<br />
          <span className="text-white/28">The thinking comes first.</span>
        </SectionHeading>

        <div className="mt-14 space-y-4 md:mt-20">
          {groups.map((group, groupIndex) => {
            const Icon = categoryIcons[group.category] || Layers;
            return (
              <motion.div
                key={`${group.category}-${groupIndex}`}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reducedMotion ? 0 : groupIndex * 0.08, duration: 0.5 }}
                className="member-glass grid gap-6 rounded-xl p-6 sm:p-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-black text-black"
                      style={{ backgroundColor: 'var(--member-accent)' }}
                    >
                      {String(groupIndex + 1).padStart(2, '0')}
                    </span>
                    <Icon className="h-4 w-4 text-[var(--member-accent)]" />
                  </div>
                  <h3 className="mt-4 font-display text-sm font-black uppercase tracking-[0.14em] text-white">
                    {group.category}
                  </h3>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/35">
                    {group.skills.length} Capabilities
                  </p>
                </div>

                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {group.skills.map((skill, index) => (
                    <motion.li
                      key={skill}
                      initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.03, 0.2) }}
                      className="group flex min-h-14 items-center justify-between border-b border-white/8 py-3 pr-2 font-display text-base font-bold uppercase text-white/80 transition-colors hover:text-white md:text-lg"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full opacity-40 transition-opacity group-hover:opacity-100"
                          style={{ backgroundColor: 'var(--member-accent)' }}
                        />
                        {skill}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--member-accent)]" />
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          {projectRoles.length > 0 && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="member-glass member-glass-strong grid gap-6 rounded-xl p-6 sm:p-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10"
            >
              <div>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-black text-black"
                  style={{ backgroundColor: 'var(--member-accent)' }}
                >
                  {String(groups.length + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-sm font-black uppercase tracking-[0.14em] text-white">
                  Credited Roles
                </h3>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/35">
                  Published In Projects
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {projectRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded-lg border px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white/90"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--member-accent) 35%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--member-accent) 8%, transparent)',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
