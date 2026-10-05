import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import MemberNotFound from '../components/team/MemberNotFound';
import MemberHero from '../components/team/portfolio/MemberHero';
import MemberIntroduction from '../components/team/portfolio/MemberIntroduction';
import MemberExpertise from '../components/team/portfolio/MemberExpertise';
import MemberWork from '../components/team/portfolio/MemberWork';
import MemberProcess from '../components/team/portfolio/MemberProcess';
import MemberCareer from '../components/team/portfolio/MemberCareer';
import MemberTestimonials from '../components/team/portfolio/MemberTestimonials';
import MemberContactSection from '../components/team/portfolio/MemberContactSection';
import MemberCvModal from '../components/team/portfolio/MemberCvModal';
import {
  MemberProfile,
  memberPortfolioClassName,
  memberPortfolioTheme,
  memberSectionIndices,
  socialPlatforms,
  usableLink,
} from '../components/team/portfolio/shared';
import { memberPortraitUrl } from '../components/team/MemberPortrait';
import { applyCuratedProfileFallback, fallbackTeam, mergeCuratedMemberProjects, Project } from '../lib/content';
import { useSeo } from '../lib/seo';

const fallbackMemberFor = (slug?: string): MemberProfile | null => {
  const member = fallbackTeam.find((item) => item.slug === slug);
  return member ? mergeCuratedMemberProjects({ ...member, projects: [] as Project[] }) : null;
};

export default function MemberPortfolio() {
  const { slug } = useParams();
  const { hash } = useLocation();
  const handledAnchor = useRef<string | null>(null);
  const previousHash = useRef(hash);
  const [member, setMember] = useState<MemberProfile | null>(() => fallbackMemberFor(slug));
  const [loading, setLoading] = useState(() => !fallbackMemberFor(slug));
  const [notFound, setNotFound] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  useEffect(() => {
    if (hash === '#cv') {
      setCvModalOpen(true);
    }
  }, [hash]);

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
          const resolvedMember = applyCuratedProfileFallback(data);
          setMember(mergeCuratedMemberProjects({
            ...resolvedMember,
            email: resolvedMember.email?.trim() || fallback?.email || '',
            phone: resolvedMember.phone?.trim() || fallback?.phone || '',
          }));
        }
      })
      .catch((error: Error) => {
        if (cancelled) return;
        if (error.message !== 'not-found' && fallback) setMember(fallback);
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

  useLayoutEffect(() => {
    const hashChanged = previousHash.current !== hash;
    previousHash.current = hash;
    if (!member || !hash) return;
    const anchorKey = `${slug || ''}${hash}:${member.projects.length}`;
    if (handledAnchor.current === anchorKey) return;
    if (hashChanged) {
      // ScrollToTop owns live same-page hash navigation; this effect only
      // covers direct URLs whose async member content was not present yet.
      handledAnchor.current = anchorKey;
      return;
    }
    let targetId = '';
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      targetId = hash.slice(1);
    }
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
    handledAnchor.current = anchorKey;
  }, [hash, member, slug]);

  const schema = useMemo(() => member ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.role,
    description: member.tagline || member.bio,
    image: member.avatar ? memberPortraitUrl(member.avatar) : undefined,
    email: member.email || undefined,
    telephone: member.phone || undefined,
    address: member.location ? { '@type': 'PostalAddress', addressLocality: member.location } : undefined,
    sameAs: socialPlatforms.map(({ key }) => member.socialLinks[key]).filter(usableLink),
    url: `${window.location.origin}/team/${member.slug}`,
    worksFor: { '@type': 'Organization', name: 'LB CodeBase', url: window.location.origin },
  } : undefined, [member]);

  useSeo({
    title: member ? `${member.name} — ${member.role} | LB CodeBase` : 'Team Member | LB CodeBase',
    description: member?.tagline || member?.bio || 'Professional profile at LB CodeBase.',
    image: member?.avatar ? memberPortraitUrl(member.avatar) : undefined,
    canonicalPath: member ? `/team/${member.slug}` : `/team/${slug || ''}`,
    schema,
  });

  if (loading) {
    return (
      <div style={memberPortfolioTheme} className={`${memberPortfolioClassName} member-grid-surface flex items-center justify-center`} role="status" aria-label="Loading member portfolio">
        <div className="h-10 w-10 animate-spin rounded-full border border-white/10 border-t-[var(--member-accent)]" />
      </div>
    );
  }
  if (notFound || !member) return <MemberNotFound />;

  const hasCareer = Boolean(member.experience?.length || member.education?.length || member.certifications?.length);
  const hasProcess = member.projects.some((project) => Boolean(project.process?.length));
  const hasTestimonials = Boolean(member.testimonials?.length);

  const sectionIndices = memberSectionIndices({ hasProcess, hasCareer, hasTestimonials });

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={memberPortfolioTheme}
      className={memberPortfolioClassName}
    >
      <MemberHero member={member} onOpenCv={() => setCvModalOpen(true)} />
      <div>
        <MemberIntroduction member={member} />
        <MemberExpertise member={member} />
        <MemberWork member={member} />
        <MemberProcess member={member} sectionIndex={sectionIndices.process} />
        <MemberCareer member={member} sectionIndex={sectionIndices.career} onOpenCv={() => setCvModalOpen(true)} />
        <MemberTestimonials member={member} sectionIndex={sectionIndices.testimonials} />
        <MemberContactSection member={member} sectionIndex={sectionIndices.contact} />
      </div>

      {/* Interactive CV Modal */}
      <MemberCvModal
        member={member}
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
      />
    </motion.div>
  );
}
