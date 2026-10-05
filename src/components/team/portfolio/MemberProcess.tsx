import { MemberProfile, SectionHeading } from './shared';

export default function MemberProcess({ member, sectionIndex = '04' }: { member: MemberProfile; sectionIndex?: string }) {
  const project = member.projects.find((item) => item.process?.length);
  const steps = project?.process?.slice(0, 5) || [];
  if (!steps.length) return null;

  const isDesigner = /design|visual|brand/i.test(member.role);

  return (
    <section id="process" className="scroll-mt-28 border-b border-white/10 px-5 py-14 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index={sectionIndex}
          label={isDesigner ? 'Design process' : 'Delivery process'}
          description={`A documented sequence from ${project?.title || 'a published project'}, shown in the order the work was approached.`}
        >
          The work, step by step.<br />
          <span className="text-white/28">From brief to delivery.</span>
        </SectionHeading>

        <ol className="mt-10 grid gap-0 border-t border-white/10 md:mt-12 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={`${step}-${index}`} className="relative border-l border-white/10 py-5 pl-7 last:pb-0 md:border-l-0 md:border-t md:px-4 md:pb-0 md:pt-7 first:md:pl-0 last:md:pr-0">
              <span className="absolute -left-[5px] top-7 h-2 w-2 rounded-full bg-[var(--member-accent)] md:-top-[5px] md:left-4 first:md:left-0" aria-hidden="true" />
              <span className="font-display text-xl font-black text-[var(--member-accent)]">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-3 text-sm leading-6 text-white/65">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
