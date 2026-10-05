import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle, Code2, Layers, Wrench } from 'lucide-react';
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
    <section id="skills" className="scroll-mt-28 border-b border-white/10 bg-[#080808] px-5 py-14 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index="02"
          label="Expertise"
          description="Practice areas and tools drawn from this member's profile and credited project work."
        >
          Tools serve the work.<br />
          <span className="text-white/28">The thinking comes first.</span>
        </SectionHeading>

        <div className="mt-9 border-b border-white/10 md:mt-12">
          {groups.map((group, groupIndex) => {
            const Icon = categoryIcons[group.category] || Layers;
            return (
              <motion.div
                key={`${group.category}-${groupIndex}`}
                initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reducedMotion ? 0 : groupIndex * 0.08, duration: 0.5 }}
                className="grid gap-6 border-t border-white/10 py-7 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:gap-10 md:py-9"
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
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/35">
                    {group.skills.length} listed {group.skills.length === 1 ? 'capability' : 'capabilities'}
                  </p>
                </div>

                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="flex min-h-11 items-center border-b border-white/8 py-2.5 text-sm leading-5 text-white/75"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full opacity-60"
                          style={{ backgroundColor: 'var(--member-accent)' }}
                        />
                        {skill}
                      </span>
                    </li>
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
              className="grid gap-6 border-t border-white/10 py-7 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:gap-10 md:py-9"
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

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {projectRoles.map((role) => (
                  <span
                    key={role}
                    className="border-b border-white/15 py-2 text-sm leading-5 text-white/75"
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
