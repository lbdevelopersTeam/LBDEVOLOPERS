import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, ExternalLink, Github, Layers, CircleHelp, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MemberNotFound from '../components/team/MemberNotFound';
import MemberPageHeader from '../components/team/portfolio/MemberPageHeader';
import MemberFooter from '../components/team/portfolio/MemberFooter';
import { HeroBackground } from '../components/common/Animations';
import { memberPortfolioClassName, memberPortfolioTheme, normalizeMemberProfile, usableLink } from '../components/team/portfolio/shared';
import { fallbackTeam, mergeCuratedMemberProjects, Project, TeamMember } from '../lib/content';
import { sanitizeHtml } from '../lib/sanitize';
import { useSeo } from '../lib/seo';

interface CaseStudyResponse {
  project: Project;
  member: TeamMember;
  related: Project[];
}

function fallbackCaseStudyFor(memberSlug?: string, projectIdentifier?: string): CaseStudyResponse | null {
  const member = fallbackTeam.find((item) => item.slug === memberSlug);
  if (!member) return null;
  const profile = mergeCuratedMemberProjects({ ...member, projects: [] as Project[] });
  const project = profile.projects.find((item) => item.slug === projectIdentifier || item.id === projectIdentifier);
  if (!project) return null;
  return {
    project,
    member,
    related: profile.projects.filter((item) => item.id !== project.id).slice(0, 3),
  };
}

function CaseSection({
  index,
  label,
  title,
  body,
}: {
  index: string;
  label: string;
  title: string;
  body?: string;
}) {
  if (!body) return null;
  return (
    <section className="grid gap-6 border-t border-white/12 py-10 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8 md:py-14">
      <div>
        <span className="text-[10px] font-black text-[var(--member-accent)]">{index}</span>
        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">{label}</p>
      </div>
      <div className="max-w-4xl">
        <h2 className="font-display text-2xl font-black uppercase leading-tight text-white md:text-3xl">{title}</h2>
        <p className="mt-5 whitespace-pre-line text-base leading-7 text-white/60 md:text-lg md:leading-8">{body}</p>
      </div>
    </section>
  );
}

export default function MemberProjectDetail() {
  const { slug, projectSlug } = useParams();
  const [data, setData] = useState<CaseStudyResponse | null>(() => fallbackCaseStudyFor(slug, projectSlug));
  const [loading, setLoading] = useState(() => !fallbackCaseStudyFor(slug, projectSlug));
  const [notFound, setNotFound] = useState(false);
  const reducedMotion = useReducedMotion();
  const fallbackMember = fallbackTeam.find((member) => member.slug === slug);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const fallback = fallbackCaseStudyFor(slug, projectSlug);
    setData(fallback);
    setLoading(!fallback);
    setNotFound(false);
    fetch(`/api/v2/team/${encodeURIComponent(slug || '')}/projects/${encodeURIComponent(projectSlug || '')}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) throw new Error('not-found');
        if (!response.ok) throw new Error('request-failed');
        return response.json() as Promise<CaseStudyResponse>;
      })
      .then((response) => {
        if (!cancelled) {
          const profile = normalizeMemberProfile({ ...response.member, projects: [response.project] });
          setData({
            ...response,
            member: profile,
            project: profile.projects[0],
            related: Array.isArray(response.related) ? response.related : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled && !fallback) setNotFound(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [projectSlug, slug]);

  const schema = useMemo(() => data ? {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.project.title,
    description: data.project.shortDescription,
    image: [data.project.thumbnail, ...(data.project.gallery || [])],
    creator: {
      '@type': 'Person',
      name: data.member.name,
      jobTitle: data.member.role,
      url: `${window.location.origin}/team/${data.member.slug}`,
    },
    url: window.location.href,
    dateCreated: data.project.completionDate || undefined,
  } : undefined, [data]);

  useSeo({
    title: data?.project.metaTitle || (data ? `${data.project.title} — ${data.member.name} | LB CodeBase` : 'Project Case Study | LB CodeBase'),
    description: data?.project.metaDescription || data?.project.shortDescription || 'Project case study by an LB CodeBase team member.',
    image: data?.project.thumbnail,
    canonicalPath: data ? `/team/${data.member.slug}/projects/${data.project.slug}` : window.location.pathname,
    schema,
  });

  if (loading) {
    if (fallbackMember) {
      return (
        <motion.article
          initial={false}
          animate={{ opacity: 1 }}
          style={memberPortfolioTheme}
          className={memberPortfolioClassName}
        >
          <main className="member-grid-surface min-h-[70svh] px-5 pb-16 pt-32 md:px-8 lg:pt-36" role="status" aria-label="Loading project case study">
            <div className="mx-auto max-w-[1400px] animate-pulse">
              <div className="h-3 w-36 rounded-full bg-white/10" />
              <div className="mt-10 h-14 max-w-3xl rounded-2xl bg-white/[0.07] sm:h-20" />
              <div className="mt-6 h-5 max-w-2xl rounded-full bg-white/5" />
              <div className="mt-16 aspect-[16/8] rounded-[2rem] border border-white/10 bg-white/[0.035]" />
            </div>
            <span className="sr-only">Loading {projectSlug?.replace(/-/g, ' ') || 'case study'}</span>
          </main>
        </motion.article>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-black" role="status" aria-label="Loading project case study">
        <div className="h-10 w-10 animate-spin rounded-full border border-white/10 border-t-brand-primary" />
      </div>
    );
  }
  if (notFound || !data) return <MemberNotFound project />;

  const { project, member, related } = data;
  const nextProject = related[0];
  const completedYear = project.completionDate && !Number.isNaN(new Date(project.completionDate).getTime())
    ? new Date(project.completionDate).getFullYear().toString()
    : '';

  const overviewItems = ([
    ['Contribution', project.memberRole || member.role],
    ['Project credit', 'LB CodeBase Collaboration'],
    ['Category', project.category],
    ['Client', project.client || ''],
    ['Industry', project.industry || ''],
    ['Completed', completedYear],
  ] as Array<[string, string]>).filter(([, value]) => Boolean(value));

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={memberPortfolioTheme}
      className={memberPortfolioClassName}
    >
      <MemberPageHeader member={member} pageLabel="Case study" />
      <header className="member-case-header relative px-5 pb-12 pt-28 sm:pt-32 md:px-8 md:pb-16 lg:pt-36">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />

        <div className="relative mx-auto max-w-[1400px]">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
            <Link to={`/team/${member.slug}`} className="hover:text-white">
              {member.name}
            </Link>
            <span>/</span>
            <span className="text-[var(--member-accent)]">Case Study</span>
          </div>

          <div className="grid items-end gap-10 lg:grid-cols-12">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-9"
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
                  {project.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Collaborative Deployment
                </span>
              </div>

              <h1 className="member-case-title max-w-6xl font-display font-black uppercase leading-[0.9] text-white">
                {project.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 md:text-lg md:leading-8">
                {project.shortDescription}
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-3 lg:col-span-3 lg:justify-end">
              {usableLink(project.liveUrl) && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-md px-5 text-[10px] font-black uppercase tracking-wider text-black shadow-lg transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--member-accent)' }}
                >
                  <span>Live Project</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {usableLink(project.githubUrl) && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="member-glass inline-flex min-h-12 items-center gap-2.5 rounded-md px-5 text-[10px] font-black uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50"
                >
                  <Github className="h-4 w-4" />
                  <span>Repository</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Thumbnail Figure */}
      <motion.figure
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.75, delay: reducedMotion ? 0 : 0.08 }}
        className="mx-auto max-w-[1760px] px-3 md:px-6"
      >
        <div className="member-glass member-glass-strong rounded-xl p-2.5 md:p-4">
          <img
            src={project.thumbnail}
            alt={`${project.title} case study hero`}
            fetchPriority="high"
            decoding="async"
            className="aspect-[16/10] max-h-[850px] w-full rounded-lg object-cover object-top"
          />
        </div>
      </motion.figure>

      {/* Narrative Section */}
      <main className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-18 lg:py-20">
        <section className="grid gap-10 pb-14 lg:grid-cols-12 lg:gap-8 lg:pb-20">
          <div className="lg:col-span-7">
            <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--member-accent)]">
              <Layers className="h-4 w-4" />
              <span>Project Executive Summary</span>
            </div>
            <div
              className="prose prose-invert max-w-none text-base leading-relaxed text-white/60 md:text-lg md:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.fullDescription) }}
            />
          </div>

          <dl className="member-glass h-fit rounded-xl p-6 lg:col-span-5">
            <div className="mb-4 border-b border-white/10 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Specifications</span>
            </div>
            {overviewItems.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 border-b border-white/8 py-3.5 last:border-0">
                <dt className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">{label}</dt>
                <dd className="text-sm font-semibold leading-relaxed text-white/80">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Individual Contribution Highlight Callout */}
        <aside className="member-glass member-glass-strong mb-14 rounded-xl p-6 sm:p-8 md:mb-20">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
            <UserCheck className="h-4 w-4 text-[var(--member-accent)]" />
            <span>Individual Role & Impact</span>
          </div>
          <p className="mt-4 max-w-5xl font-display text-xl font-black uppercase leading-tight text-white md:text-2xl">
            {member.name} served as{' '}
            <span style={{ color: 'var(--member-accent)' }}>
              {project.memberRole || member.role}
            </span>{' '}
            on this deployment for {project.client || 'the client'}.
          </p>
        </aside>

        <CaseSection index="01" label="Problem Discovery" title="The Problem" body={project.problem} />
        <CaseSection index="02" label="Technical Constraints" title="The Challenge" body={project.challenge} />
        <CaseSection index="03" label="Architectural Response" title="The Solution" body={project.solution} />

        {/* Process Steps */}
        {Boolean(project.process?.length) && (
          <section className="border-t border-white/12 py-10 md:py-14">
            <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8">
              <div>
                <span className="text-[10px] font-black text-[var(--member-accent)]">04</span>
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Implementation Process</p>
              </div>
              <ol className="member-glass divide-y divide-white/8 rounded-xl px-6 sm:px-8">
                {project.process!.map((step, index) => (
                  <li key={`${step}-${index}`} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[56px_minmax(0,1fr)] md:py-6">
                    <span className="font-display text-xl font-black text-[var(--member-accent)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base leading-7 text-white/65">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Outcomes & Metrics */}
        {Boolean(project.results?.length || project.achievements?.length) && (
          <section className="border-t border-white/12 py-10 md:py-14">
            <div className="grid gap-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8">
              <div>
                <span className="text-[10px] font-black text-[var(--member-accent)]">05</span>
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Business Outcomes</p>
              </div>
              <div className="member-glass grid rounded-xl p-6 sm:p-8 md:grid-cols-2 md:gap-6">
                {[...(project.results || []), ...(project.achievements || [])].map((result, index) => (
                  <div key={`${result}-${index}`} className="border-t border-white/10 py-5 first:border-0 md:border-t-0 md:pr-4">
                    <div className="flex items-center gap-2 text-[var(--member-accent)]">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">Result {index + 1}</span>
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-white/65">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technologies Breakdown */}
        {project.technologies.length > 0 && (
          <section className="grid gap-6 border-t border-white/12 py-10 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8 md:py-14">
            <div>
              <span className="text-[10px] font-black text-[var(--member-accent)]">TX</span>
              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">Tech Stack</p>
            </div>
            <ul className="member-glass grid rounded-xl p-6 sm:grid-cols-2 sm:p-8">
              {project.technologies.map((technology) => (
                <li
                  key={technology}
                  className="flex items-center gap-3 border-b border-white/8 py-4 font-display text-base font-bold uppercase text-white/80 last:border-0"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--member-accent)' }}
                  />
                  <span>{technology}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* Gallery Section */}
      {project.gallery.length > 0 && (
        <section className="border-y border-white/10 bg-[#080808] px-4 py-14 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-[1600px] gap-6 md:grid-cols-2">
            {project.gallery.map((image, index) => (
              <div key={`${image}-${index}`} className="member-glass overflow-hidden rounded-xl p-2.5">
                <img
                  src={image}
                  alt={`${project.title} screenshot ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] w-full rounded-lg object-cover object-top"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next Project Teaser */}
      {nextProject && (
        <Link
          to={`/team/${member.slug}/projects/${nextProject.slug}`}
          className="group relative block min-h-[360px] overflow-hidden border-b border-white/12 md:min-h-[440px]"
        >
          <img
            src={nextProject.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-top opacity-40 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          <div className="relative mx-auto flex min-h-[360px] max-w-[1400px] flex-col justify-end px-5 py-14 md:min-h-[440px] md:px-8 md:py-16">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--member-accent)]">
              <CircleHelp className="h-3.5 w-3.5" />
              <span>Next Case Study</span>
            </div>
            <div className="flex items-end justify-between gap-6">
              <h2 className="member-section-title max-w-5xl font-display font-black uppercase leading-none text-white">
                {nextProject.title}
              </h2>
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-black shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: 'var(--member-accent)' }}
              >
                <ArrowRight className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/50">
              {nextProject.memberRole || member.role} • {nextProject.category}
            </p>
          </div>
        </Link>
      )}

      {/* Back to Profile Footer Link Bar */}
      <div className="border-b border-white/12 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          <Link
            to={`/team/${member.slug}#projects`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--member-accent)]" />
            <span>All Projects by {member.name}</span>
          </Link>
          {usableLink(project.liveUrl) && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/70 hover:text-white sm:inline-flex"
            >
              <span>Visit Live Deployment</span>
              <ArrowUpRight className="h-4 w-4 text-[var(--member-accent)]" />
            </a>
          )}
        </div>
      </div>

      <MemberFooter memberName={member.name} />

    </motion.article>
  );
}
