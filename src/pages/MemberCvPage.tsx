import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User } from 'lucide-react';
import MemberNotFound from '../components/team/MemberNotFound';
import MemberCvView from '../components/team/portfolio/MemberCvView';
import {
  MemberProfile,
  memberPortfolioClassName,
  memberPortfolioTheme,
  normalizeMemberProfile,
} from '../components/team/portfolio/shared';
import { applyCuratedProfileFallback, fallbackTeam, mergeCuratedMemberProjects, Project } from '../lib/content';
import { useSeo } from '../lib/seo';
import { memberPortraitUrl } from '../components/team/MemberPortrait';

const fallbackMemberFor = (slug?: string): MemberProfile | null => {
  const member = fallbackTeam.find((item) => item.slug === slug);
  return member ? normalizeMemberProfile(mergeCuratedMemberProjects({ ...member, projects: [] as Project[] })) : null;
};

export default function MemberCvPage() {
  const { slug } = useParams();
  const [member, setMember] = useState<MemberProfile | null>(() => fallbackMemberFor(slug));
  const [loading, setLoading] = useState(() => !fallbackMemberFor(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const fallback = fallbackMemberFor(slug);
    setMember(fallback);
    setLoading(!fallback);
    setNotFound(false);

    fetch(`/api/v2/team/${encodeURIComponent(slug || '')}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) throw new Error('not-found');
        if (!response.ok) throw new Error('request-failed');
        return response.json() as Promise<MemberProfile>;
      })
      .then((data) => {
        if (!cancelled) {
          const resolvedMember = applyCuratedProfileFallback(normalizeMemberProfile(data));
          setMember(
            normalizeMemberProfile(mergeCuratedMemberProjects({
              ...resolvedMember,
              email: resolvedMember.email?.trim() || fallback?.email || '',
              phone: resolvedMember.phone?.trim() || fallback?.phone || '',
            }))
          );
        }
      })
      .catch((error: Error) => {
        if (cancelled) return;
        if (fallback) setMember(fallback);
        else setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [slug]);

  useSeo({
    title: member ? `${member.name} — Curriculum Vitae | LB CodeBase` : 'Curriculum Vitae | LB CodeBase',
    description: member ? `Official Curriculum Vitae and professional record for ${member.name}, ${member.role} at LB CodeBase.` : 'Team member curriculum vitae.',
    image: member?.avatar ? memberPortraitUrl(member.avatar) : undefined,
    canonicalPath: member ? `/team/${member.slug}/cv` : `/team/${slug || ''}/cv`,
  });

  if (loading) {
    return (
      <div
        style={memberPortfolioTheme}
        className={`${memberPortfolioClassName} member-grid-surface flex min-h-screen items-center justify-center`}
        role="status"
        aria-label="Loading curriculum vitae"
      >
        <div className="h-10 w-10 animate-spin rounded-full border border-white/10 border-t-[var(--member-accent)]" />
      </div>
    );
  }

  if (notFound || !member) return <MemberNotFound />;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={memberPortfolioTheme}
      className={`${memberPortfolioClassName} cv-page-backdrop`}
    >
      {/* Top Page Header (Hidden in print) */}
      <header className="cv-page-header print:hidden border-b border-white/10 px-4 pb-4 pt-28 backdrop-blur-xl sm:px-8 sm:pt-32">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            to={`/team/${member.slug}`}
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to {member.name}&apos;s Portfolio</span>
          </Link>

          <Link
            to={`/team/${member.slug}`}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:border-white/20 hover:text-white transition-colors"
          >
            <User className="h-3.5 w-3.5" style={{ color: 'var(--member-accent)' }} />
            <span>Profile Page</span>
          </Link>
        </div>
      </header>

      {/* Main CV Content */}
      <main className="relative py-4 sm:py-8">
        <MemberCvView member={member} />
      </main>
    </motion.div>
  );
}
