import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import MemberNotFound from '../components/team/MemberNotFound';
import MemberCvView from '../components/team/portfolio/MemberCvView';
import MemberPageHeader from '../components/team/portfolio/MemberPageHeader';
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
      <MemberPageHeader member={member} pageLabel="Curriculum vitae" />

      {/* Main CV Content */}
      <main className="relative pb-4 pt-24 sm:pb-8 sm:pt-28 print:p-0">
        <MemberCvView member={member} />
      </main>
    </motion.div>
  );
}
