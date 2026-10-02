import { motion, useReducedMotion } from 'motion/react';
import { Award, Briefcase, CheckCircle2, ExternalLink, FileText, GraduationCap } from 'lucide-react';
import { MemberProfile, SectionHeading, usableLink } from './shared';

export default function MemberCareer({
  member,
  sectionIndex = '04',
  onOpenCv,
}: {
  member: MemberProfile;
  sectionIndex?: string;
  onOpenCv?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const hasExperience = Boolean(member.experience?.length);
  const hasEducation = Boolean(member.education?.length);
  const hasCertifications = Boolean(member.certifications?.length);

  if (!hasExperience && !hasEducation && !hasCertifications) return null;

  return (
    <section id="experience" className="scroll-mt-28 border-b border-white/10 bg-[#080808] px-5 py-14 sm:py-16 md:px-8 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index={sectionIndex}
          label="Career & Credentials"
          description="A chronological account of leadership roles, engineering milestones, verified certifications, and academic foundations."
        >
          Professional record.<br />
          <span className="text-white/28">Roles and milestones.</span>
        </SectionHeading>

        {/* Experience Timeline Header & CV Action */}
        {hasExperience && (
          <div className="mt-10 space-y-6 md:mt-14">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                <Briefcase className="h-4 w-4 text-[var(--member-accent)]" />
                <span>Experience & Leadership</span>
              </div>

              {onOpenCv ? (
                <button
                  type="button"
                  onClick={onOpenCv}
                  className="member-glass inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--member-accent)]" />
                  <span>Open Full CV</span>
                </button>
              ) : (
                <a
                  href={`/team/${member.slug}/cv`}
                  className="member-glass inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50 transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--member-accent)]" />
                  <span>Open Full CV</span>
                </a>
              )}
            </div>

            {member.experience!.map((item, index) => (
              <motion.article
                key={item.id || index}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reducedMotion ? 0 : index * 0.08, duration: 0.5 }}
                className="member-glass relative grid gap-6 rounded-xl p-6 sm:p-8 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,0.85fr)] md:gap-10 md:p-10"
              >
                {/* Left Date & Tenure */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-black text-black"
                      style={{ backgroundColor: 'var(--member-accent)' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.current && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                        Present
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
                    {item.startDate} — {item.current ? 'Present' : item.endDate || 'Present'}
                  </p>
                </div>

                {/* Center Role & Overview */}
                <div>
                  <h3 className="font-display text-xl font-black uppercase text-white md:text-2xl">
                    {item.position}
                  </h3>
                  <p
                    className="mt-1.5 text-sm font-bold tracking-wide"
                    style={{ color: 'var(--member-accent)' }}
                  >
                    {item.company}
                  </p>
                  {item.description && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/55 md:text-base md:leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {Boolean(item.technologies?.length) && (
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {item.technologies!.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/45"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Achievements & Responsibilities */}
                <div>
                  {Boolean(item.responsibilities?.length) && (
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                        Key Responsibilities
                      </p>
                      <ul className="space-y-2">
                        {item.responsibilities!.map((resp) => (
                          <li
                            key={resp}
                            className="border-l-2 border-white/15 pl-3.5 text-xs leading-relaxed text-white/60 md:text-sm"
                          >
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Boolean(item.achievements?.length) && (
                    <div className="mt-6 space-y-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                        Quantifiable Impact
                      </p>
                      <ul className="space-y-2.5">
                        {item.achievements!.map((ach) => (
                          <li
                            key={ach}
                            className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.02] p-3 text-xs leading-relaxed text-white/75 md:text-sm"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0"
                              style={{ color: 'var(--member-accent)' }}
                            />
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Education & Certifications Side-by-Side */}
        {(hasEducation || hasCertifications) && (
          <div className="mt-12 grid gap-8 md:mt-14 lg:grid-cols-2 lg:gap-12">
            {/* Education Card */}
            {hasEducation && (
              <div>
                <h3 className="mb-6 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                  <GraduationCap className="h-4 w-4 text-[var(--member-accent)]" />
                  <span>Academic Foundations</span>
                </h3>

                <div className="member-glass divide-y divide-white/8 rounded-xl p-6 sm:p-8">
                  {member.education!.map((item) => (
                    <article key={item.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-display text-base font-black uppercase text-white sm:text-lg">
                          {item.degree}
                          {item.field ? ` — ${item.field}` : ''}
                        </h4>
                        {(item.startDate || item.endDate) && (
                          <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-white/35">
                            {item.startDate} - {item.endDate}
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-1.5 text-sm font-bold"
                        style={{ color: 'var(--member-accent)' }}
                      >
                        {item.institution}
                      </p>
                      {item.description && (
                        <p className="mt-3 text-xs leading-relaxed text-white/50 sm:text-sm">
                          {item.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Card */}
            {hasCertifications && (
              <div>
                <h3 className="mb-6 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                  <Award className="h-4 w-4 text-[var(--member-accent)]" />
                  <span>Verified Credentials</span>
                </h3>

                <div className="member-glass divide-y divide-white/8 rounded-xl p-6 sm:p-8">
                  {member.certifications!.map((item) => (
                    <article key={item.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-display text-base font-black uppercase text-white sm:text-lg">
                            {item.title}
                          </h4>
                          <p
                            className="mt-1 text-sm font-bold"
                            style={{ color: 'var(--member-accent)' }}
                          >
                            {item.organization}
                          </p>
                        </div>
                        {item.issueDate && (
                          <span className="shrink-0 rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white/50">
                            {item.issueDate}
                          </span>
                        )}
                      </div>

                      {item.credentialId && (
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-white/35">
                          ID: {item.credentialId}
                        </p>
                      )}

                      {usableLink(item.credentialUrl) && (
                        <a
                          href={item.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white"
                        >
                          <span style={{ color: 'var(--member-accent)' }}>Verify Credential</span>
                          <ExternalLink className="h-3 w-3 text-white/40 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
