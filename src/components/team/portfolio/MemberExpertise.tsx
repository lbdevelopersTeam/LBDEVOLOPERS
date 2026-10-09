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
  const groups = member.skillGroups?.length
    ? member.skillGroups
    : member.skills.length
      ? [{ category: 'Core Practice Disciplines', skills: member.skills }]
      : [];

  const projectRoles = Array.from(new Set(member.projects.map((project) => project.memberRole).filter(Boolean))) as string[];

  return (
    <section id="skills" className="scroll-mt-28 border-b border-white/10 px-5 py-14 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index="02"
          label="Expertise"
          description="Core disciplines, tools, and responsibilities across published work."
        >
          Expertise and capabilities.
        </SectionHeading>

        <div className="mt-9 space-y-4 md:mt-12">
          {!groups.length && (
            <p className="member-glass rounded-xl p-6 text-base text-white/70">
              This profile's expertise is being updated. Explore the case studies below to see recent work.
            </p>
          )}
          {groups.map((group, groupIndex) => {
            const Icon = categoryIcons[group.category] || Layers;
            return (
              <div
                key={`${group.category}-${groupIndex}`}
                className="member-glass grid gap-6 rounded-xl p-6 sm:p-7 md:grid-cols-[190px_minmax(0,1fr)] md:gap-8"
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
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="flex min-h-12 items-center border-b border-white/8 py-2.5 pr-2 text-sm text-white/80 md:text-base"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full opacity-70"
                          style={{ backgroundColor: 'var(--member-accent)' }}
                        />
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {projectRoles.length > 0 && (
            <div
              className="member-glass member-glass-strong grid gap-6 rounded-xl p-6 sm:p-7 md:grid-cols-[190px_minmax(0,1fr)] md:gap-8"
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
