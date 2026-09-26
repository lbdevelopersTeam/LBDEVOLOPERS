import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MemberProfile, SectionHeading, usableLink } from './shared';

export default function MemberWork({ member }: { member: MemberProfile }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const reducedMotion = useReducedMotion();
  const categories = useMemo(() => ['All', ...new Set(member.projects.map((project) => project.category))], [member.projects]);
  const projects = useMemo(
    () => member.projects.filter((project) => activeCategory === 'All' || project.category === activeCategory),
    [activeCategory, member.projects],
  );

  return (
    <section id="projects" className="scroll-mt-28 border-b border-white/10 px-5 py-20 md:px-8 md:py-28 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="03"
          label="Selected Work"
          description="Production case studies engineered in collaboration with LB CodeBase. Each project highlights specific individual contributions."
        >
          Projects with purpose.<br />
          <span className="text-white/28">Contribution in context.</span>
        </SectionHeading>

        {member.projects.length ? (
          <>
            {categories.length > 2 && (
              <div
                className="mt-12 flex gap-1.5 overflow-x-auto border-b border-white/10 pb-3 no-scrollbar [scrollbar-width:none] md:mt-16"
                role="tablist"
                aria-label="Filter selected projects"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={category === activeCategory}
                    onClick={() => setActiveCategory(category)}
                    className={`relative min-h-10 shrink-0 rounded-md px-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                      category === activeCategory
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {category}
                    {category === activeCategory && (
                      <motion.span
                        layoutId="work-filter"
                        className="absolute inset-x-3 -bottom-3 h-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--member-accent)' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <motion.div layout className="mt-10 space-y-16 md:mt-16 md:space-y-24">
              <AnimatePresence mode="popLayout">
                {projects.map((project, index) => {
                  const reverse = index % 2 === 1;
                  return (
                    <motion.article
                      layout
                      key={project.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: -16 }}
                      transition={{ duration: 0.5 }}
                      className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
                    >
                      {/* Project Image & Visual Anchor */}
                      <Link
                        to={`/team/${member.slug}/projects/${project.slug}`}
                        className={`member-glass group/image relative block overflow-hidden rounded-xl p-2.5 sm:p-3 lg:col-span-7 ${
                          reverse ? 'lg:col-start-6' : ''
                        }`}
                        aria-label={`View ${project.title} case study`}
                      >
                        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-black/40">
                          <img
                            src={project.thumbnail}
                            alt={`${project.title} project preview`}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.03]"
                          />
                        </div>
                        <span
                          className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-black/60 text-white backdrop-blur-xl transition-all group-hover/image:scale-110"
                          style={{
                            color: 'var(--member-accent)',
                          }}
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </Link>

                      {/* Project Meta & Narrative */}
                      <div
                        className={`member-glass rounded-xl p-6 sm:p-8 md:p-10 lg:col-span-5 ${
                          reverse ? 'lg:col-start-1 lg:row-start-1' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                          <span
                            className="font-display text-2xl font-black"
                            style={{ color: 'var(--member-accent)' }}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/60">
                            {project.category}
                          </span>
                        </div>

                        <h3 className="member-project-title mt-6 max-w-xl font-display font-black uppercase leading-tight text-white">
                          {project.title}
                        </h3>

                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 md:text-base md:leading-relaxed">
                          {project.shortDescription}
                        </p>

                        {/* Contribution Attribution Block */}
                        <div
                          className="mt-6 rounded-lg border-l-2 p-4"
                          style={{
                            borderLeftColor: 'var(--member-accent)',
                            backgroundColor: 'color-mix(in srgb, var(--member-accent) 6%, transparent)',
                          }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/40">
                            Credited Role & Contribution
                          </p>
                          <p className="mt-1 text-sm font-bold text-white/90">
                            {project.memberRole || member.role}
                          </p>
                        </div>

                        {/* Technologies Tags */}
                        {project.technologies.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-1.5">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/50"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Case study & live actions */}
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <Link
                            to={`/team/${member.slug}/projects/${project.slug}`}
                            className="inline-flex min-h-11 items-center gap-2.5 rounded-md px-5 text-[10px] font-black uppercase tracking-wider text-black shadow-md transition-transform hover:-translate-y-0.5"
                            style={{
                              backgroundColor: 'var(--member-accent)',
                            }}
                          >
                            Case Study <ArrowUpRight className="h-4 w-4" />
                          </Link>

                          {usableLink(project.liveUrl) && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="member-glass inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-[10px] font-bold uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50"
                              title="Visit Live URL"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-[var(--member-accent)]" />
                              <span>Live Site</span>
                            </a>
                          )}

                          {usableLink(project.githubUrl) && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="member-glass inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-[10px] font-bold uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50"
                              title="View Code Repository"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span>Code</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <div className="mt-14 flex flex-col justify-between gap-6 rounded-xl border border-white/10 bg-white/[0.02] p-8 md:flex-row md:items-center">
            <p className="max-w-xl text-base leading-relaxed text-white/50">
              No individual case studies are currently published for this profile.
            </p>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-[10px] font-black uppercase tracking-wider text-black"
              style={{ backgroundColor: 'var(--member-accent)' }}
            >
              Explore Agency Projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
