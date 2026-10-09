import { MemberProfile, SectionHeading } from './shared';

export default function MemberTestimonials({
  member,
  sectionIndex,
}: {
  member: MemberProfile;
  sectionIndex?: string;
}) {
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

        <div className="member-testimonial-grid">
          {testimonials.map((item, index) => (
            <article key={item.id || index} className="member-testimonial member-glass">
              <div className="member-testimonial-meta">
                <span className="member-testimonial-index">{String(index + 1).padStart(2, '0')}</span>
                {item.project && <span className="member-testimonial-project">{item.project}</span>}
              </div>

              <blockquote className="member-testimonial-quote">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <div className="member-testimonial-author">
                <span className="member-testimonial-avatar" aria-hidden="true">
                  {item.author.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="member-testimonial-author-name">{item.author}</p>
                  <p className="member-testimonial-author-role">
                    {item.role}
                    {item.company ? ` · ${item.company}` : ''}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
