import { Dribbble, Github, Globe2, Instagram, Linkedin, Palette, Twitter } from 'lucide-react';
import { CSSProperties, ReactNode } from 'react';
import { Project, TeamMember } from '../../../lib/content';

export const MEMBER_PORTFOLIO_ACCENT = '#93c9ff';
export const memberPortfolioTheme = {
  '--member-accent': MEMBER_PORTFOLIO_ACCENT,
} as CSSProperties;
export const memberPortfolioClassName = 'member-portfolio min-h-screen overflow-clip bg-brand-dark text-white';

export type MemberProfile = TeamMember & {
  projects: Project[];
  stats?: {
    projectsCount?: number;
    skillsCount?: number;
    experienceCount?: number;
    certificationsCount?: number;
  };
};

/** Keep public profiles usable while older API records are being migrated. */
export function normalizeMemberProfile(member: MemberProfile): MemberProfile {
  return {
    ...member,
    skills: Array.isArray(member.skills) ? member.skills : [],
    skillGroups: Array.isArray(member.skillGroups) ? member.skillGroups.filter((group) => Array.isArray(group.skills)) : [],
    projects: Array.isArray(member.projects) ? member.projects.map((project) => ({
      ...project,
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      gallery: Array.isArray(project.gallery) ? project.gallery : [],
    })) : [],
    experience: Array.isArray(member.experience) ? member.experience : [],
    education: Array.isArray(member.education) ? member.education : [],
    certifications: Array.isArray(member.certifications) ? member.certifications : [],
    testimonials: Array.isArray(member.testimonials) ? member.testimonials : [],
    languages: Array.isArray(member.languages) ? member.languages : [],
    socialLinks: member.socialLinks && typeof member.socialLinks === 'object' ? member.socialLinks : {},
  };
}

export const usableLink = (value?: string) => {
  if (!value || value === '#') return false;
  if (value.startsWith('/')) return true;
  if (!value.includes(':')) return true;
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const whatsAppNumber = (phone?: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
};

export const socialPlatforms = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter },
  { key: 'behance', label: 'Behance', icon: Palette },
  { key: 'dribbble', label: 'Dribbble', icon: Dribbble },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
  { key: 'website', label: 'Website', icon: Globe2 },
] as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function memberSectionIndices({
  hasCareer,
  hasTestimonials,
}: {
  hasCareer: boolean;
  hasTestimonials: boolean;
}) {
  let nextIndex = 4;
  const career = hasCareer ? String(nextIndex++).padStart(2, '0') : undefined;
  const testimonials = hasTestimonials ? String(nextIndex++).padStart(2, '0') : undefined;
  const contact = String(nextIndex).padStart(2, '0');

  return { career, testimonials, contact };
}

export function SectionHeading({
  index,
  label,
  children,
  description,
}: {
  index: string;
  label: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <header className="member-section-heading">
      <p className="member-section-kicker"><span>{index}</span> / {label}</p>
      <h2 className="member-section-title">{children}</h2>
      {description && <p className="member-section-description">{description}</p>}
    </header>
  );
}
