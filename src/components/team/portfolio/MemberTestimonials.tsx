import { motion, useReducedMotion } from 'motion/react';
import { MessageSquareText, Quote } from 'lucide-react';
import { MemberProfile, SectionHeading } from './shared';

export default function MemberTestimonials({
  member,
  sectionIndex,
}: {
  member: MemberProfile;
  sectionIndex?: string;
}) {
  const reducedMotion = useReducedMotion();
  const testimonials = member.testimonials || [];

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" className="scroll-mt-28 border-b border-white/10 px-5 py-14 md:px-8 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeading
          index={sectionIndex || '04'}
          label="Endorsements"
          description={`Feedback on projects delivered with ${member.name}.`}
        >
          Client feedback.
        </SectionHeading>

        <div className="mt-9 grid gap-6 md:mt-12 md:grid-cols-2 lg:gap-8">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.id || index}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: reducedMotion ? 0 : index * 0.1, duration: 0.5 }}
              className="member-glass relative flex flex-col justify-between rounded-xl p-6 sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-[var(--member-accent)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">Client Feedback</span>
                </div>
                {item.project && (
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--member-accent)]">
                    {item.project}
                  </span>
                )}
              </div>

              <div className="relative my-4">
                <Quote className="pointer-events-none absolute -left-2 -top-3 h-8 w-8 text-white/[0.05]" aria-hidden="true" />
                <p className="relative z-10 text-base font-normal leading-7 text-white/80 md:text-lg md:leading-8">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <footer className="mt-8 flex items-center gap-4 border-t border-white/10 pt-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-black"
                  style={{ backgroundColor: 'var(--member-accent)' }}
                >
                  {item.author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-white">{item.author}</p>
                  <p className="text-xs font-semibold text-white/45">
                    {item.role}
                    {item.company ? ` • ${item.company}` : ''}
                  </p>
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
