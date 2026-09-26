import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  BarChart3,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Calendar,
  CircleAlert,
  Eye,
  EyeOff,
  Edit3,
  Filter,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Reply,
  Save,
  Search,
  Settings,
  Trash2,
  Users,
  FolderKanban,
  Newspaper,
  ExternalLink,
  Mail,
  Boxes,
  Images,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Copy,
  Send,
  Check,
  X,
} from 'lucide-react';
import RichTextEditor from '../components/admin/RichTextEditor';
import AccountManager from '../components/admin/AccountManager';
import ContentManager from '../components/admin/ContentManager';
import MediaManager from '../components/admin/MediaManager';
import SettingsManager from '../components/admin/SettingsManager';
import MediaUploadButton from '../components/admin/MediaUploadButton';
import { ConfirmModal } from '../components/admin/AdminModal';
import { Button } from '../components/common/UI';
import {
  AGENCY_EMAIL,
  BlogPost,
  BlogStatus,
  ApiRequestError,
  Project,
  ProjectStatus,
  TeamMember,
  blogStatuses,
  fetchJson,
  projectCategories,
  projectStatuses,
  slugify,
  setAdminCsrfToken,
  tagsFromString,
} from '../lib/content';
import { cn } from '../lib/utils';

type AdminTab = 'dashboard' | 'projects' | 'team' | 'messages' | 'blog' | 'catalog' | 'media' | 'settings' | 'accounts';
type AdminRole = 'super_admin' | 'admin' | 'editor' | 'team_member';
type Notice = { tone: 'success' | 'error'; message: string } | null;

const adminTabs = [
  { id: 'dashboard' as const, name: 'Dashboard', description: 'Performance, activity, and publishing overview', icon: LayoutDashboard },
  { id: 'projects' as const, name: 'Projects', description: 'Case studies, portfolio links, and project ownership', icon: FolderKanban },
  { id: 'team' as const, name: 'Team', description: 'Profiles, expertise, credentials, and availability', icon: Users },
  { id: 'messages' as const, name: 'Messages', description: 'Review, route, and respond to client inquiries', icon: Mail },
  { id: 'blog' as const, name: 'Blog', description: 'Draft, optimize, and publish agency insights', icon: Newspaper },
  { id: 'catalog' as const, name: 'Content', description: 'Services, testimonials, technologies, and skills', icon: Boxes },
  { id: 'media' as const, name: 'Media', description: 'Manage optimized images and documents', icon: Images },
  { id: 'settings' as const, name: 'Settings', description: 'Control public site configuration', icon: Settings },
  { id: 'accounts' as const, name: 'Accounts', description: 'Manage access, roles, and administrator security', icon: ShieldCheck },
];

const adminTabIds = new Set<AdminTab>(adminTabs.map((tab) => tab.id));

const adminTabFromPath = (pathname: string): AdminTab => {
  const segment = pathname.replace(/^\/admin\/?/, '').split('/')[0] as AdminTab;
  return adminTabIds.has(segment) ? segment : 'dashboard';
};

const canAccessAdminTab = (role: AdminRole, tab: AdminTab) => {
  if (role === 'team_member') return tab === 'team';
  if (tab === 'accounts') return role === 'super_admin';
  if (tab === 'settings') return role === 'super_admin' || role === 'admin';
  return true;
};

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  memberName?: string;
  memberSlug?: string;
  status: 'new' | 'read' | 'replied' | 'archived' | 'spam';
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  publishedBlogs: number;
  teamMembers: number;
  totalViews: number;
  activity: { id: string; label: string; createdAt: string }[];
}

interface EmailTemplateOptions {
  type?: 'quick' | 'proposal' | 'meeting' | 'general';
}

const generateReplyBody = (message: ContactMessage, type: EmailTemplateOptions['type'] = 'general') => {
  const firstName = message.name.trim().split(/\s+/)[0] || message.name;
  
  if (type === 'meeting') {
    return [
      `Hi ${firstName},`,
      '',
      `Thank you for reaching out to LB CodeBase regarding "${message.subject}".`,
      '',
      'We would love to schedule a brief discovery call to discuss your project scope, goals, and technical requirements in detail.',
      '',
      'Please let us know which of the following times work best for you this week, or feel free to share your preferred availability.',
      '',
      'Best regards,',
      'LB CodeBase Team',
      'https://lbcodebase.com',
      '',
      '—',
      `Original Inquiry (${new Date(message.createdAt).toLocaleDateString()}):`,
      `"${message.message}"`,
    ].join('\n');
  }

  if (type === 'proposal') {
    return [
      `Hi ${firstName},`,
      '',
      `Thank you for contacting LB CodeBase regarding "${message.subject}".`,
      '',
      'Our team has reviewed your inquiry and would be glad to prepare a preliminary proposal and project roadmap for you.',
      '',
      'To ensure our estimate is tailored accurately to your needs, could you please confirm:',
      '1. Target launch timeline',
      '2. Any reference designs or existing repositories',
      '3. Estimated budget or milestone preferences',
      '',
      'Looking forward to collaborating with you!',
      '',
      'Best regards,',
      'LB CodeBase Team',
      'https://lbcodebase.com',
      '',
      '—',
      `Original Inquiry: ${message.subject}`,
    ].join('\n');
  }

  return [
    `Hi ${firstName},`,
    '',
    `Thank you for contacting LB CodeBase regarding "${message.subject}".`,
    '',
    'We have received your message and are reviewing the details.',
    '',
    'One of our leads will follow up with you shortly.',
    '',
    'Best regards,',
    'LB CodeBase Team',
    'https://lbcodebase.com',
    '',
    '—',
    `Original Inquiry Reference:`,
    `"${message.message}"`,
  ].join('\n');
};

const replyGmailComposeHref = (message: ContactMessage, type: EmailTemplateOptions['type'] = 'general') => {
  const subject = message.subject.toLowerCase().startsWith('re:') ? message.subject : `Re: ${message.subject}`;
  const body = generateReplyBody(message, type);

  const parameters = new URLSearchParams({
    authuser: AGENCY_EMAIL,
    view: 'cm',
    fs: '1',
    to: message.email,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${parameters.toString()}`;
};

const replyMailtoHref = (message: ContactMessage, type: EmailTemplateOptions['type'] = 'general') => {
  const subject = message.subject.toLowerCase().startsWith('re:') ? message.subject : `Re: ${message.subject}`;
  const body = generateReplyBody(message, type);

  return `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const officialGmailInboxHref = `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(AGENCY_EMAIL)}`;

const fieldClass =
  'w-full rounded-xl border border-white/[0.09] bg-white/[0.028] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const labelClass = 'block text-[9px] font-black uppercase tracking-[0.24em] text-white/40';

const emptyProject = (): Partial<Project> => ({
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '<p></p>',
  thumbnail: '/images/webdevolopmentservice.webp',
  gallery: [],
  category: 'Web',
  technologies: [],
  liveUrl: '',
  githubUrl: '',
  featured: false,
  status: 'published',
  completionDate: '',
  metaTitle: '',
  metaDescription: '',
  sortOrder: 1,
  memberId: '',
  memberRole: '',
  contributors: [],
  client: '',
  industry: '',
  problem: '',
  challenge: '',
  solution: '',
  process: [],
  results: [],
  achievements: [],
});

const emptyTeamMember = (): Partial<TeamMember> => ({
  slug: '',
  name: '',
  role: '',
  bio: '',
  fullBio: '',
  specialization: '',
  tagline: '',
  avatar: '',
  coverImage: '',
  email: '',
  location: '',
  availability: '',
  yearsExperience: '',
  languages: [],
  cvUrl: '',
  accentColor: '#3D5AFE',
  skills: [],
  skillGroups: [],
  experience: [],
  education: [],
  certifications: [],
  socialLinks: { linkedin: '', github: '', twitter: '', behance: '', dribbble: '', instagram: '', website: '' },
  active: true,
  displayOrder: 1,
});

const serializeSkillGroups = (member: Partial<TeamMember>) =>
  (member.skillGroups || []).map((group) => `${group.category}: ${group.skills.join(', ')}`).join('\n');

const parseSkillGroups = (value: string) => value.split('\n').map((line) => {
  const [category, ...skills] = line.split(':');
  return { category: category.trim(), skills: tagsFromString(skills.join(':')) };
}).filter((group) => group.category && group.skills.length);

const serializeExperience = (member: Partial<TeamMember>) =>
  (member.experience || []).map((item) => [item.company, item.position, item.startDate, item.current ? 'Present' : item.endDate, item.description, item.technologies?.join(', '), item.responsibilities?.join('; '), item.achievements?.join('; ')].join(' | ')).join('\n');

const parseExperience = (value: string) => value.split('\n').map((line, index) => {
  const [company = '', position = '', startDate = '', endDate = '', description = '', technologies = '', responsibilities = '', achievements = ''] = line.split('|').map((part) => part.trim());
  return { id: `experience-${index + 1}`, company, position, startDate, endDate: endDate === 'Present' ? '' : endDate, current: endDate === 'Present', description, responsibilities: responsibilities.split(';').map((item) => item.trim()).filter(Boolean), achievements: achievements.split(';').map((item) => item.trim()).filter(Boolean), technologies: tagsFromString(technologies) };
}).filter((item) => item.company && item.position);

const serializeEducation = (member: Partial<TeamMember>) =>
  (member.education || []).map((item) => [item.institution, item.degree, item.field, item.startDate, item.endDate, item.description, item.achievements?.join('; ')].join(' | ')).join('\n');

const parseEducation = (value: string) => value.split('\n').map((line, index) => {
  const [institution = '', degree = '', field = '', startDate = '', endDate = '', description = '', achievements = ''] = line.split('|').map((part) => part.trim());
  return { id: `education-${index + 1}`, institution, degree, field, startDate, endDate, description, achievements: achievements.split(';').map((item) => item.trim()).filter(Boolean) };
}).filter((item) => item.institution && item.degree);

const serializeCertifications = (member: Partial<TeamMember>) =>
  (member.certifications || []).map((item) => [item.title, item.organization, item.type, item.issueDate, item.credentialUrl, item.credentialId, item.image].join(' | ')).join('\n');

const parseCertifications = (value: string) => value.split('\n').map((line, index) => {
  const [title = '', organization = '', type = 'Certification', issueDate = '', credentialUrl = '', credentialId = '', image = ''] = line.split('|').map((part) => part.trim());
  return { id: `certification-${index + 1}`, title, organization, type, issueDate, credentialUrl, credentialId, image };
}).filter((item) => item.title);

const structuredTeamText = (member: Partial<TeamMember> = {}) => ({
  skills: serializeSkillGroups(member),
  experience: serializeExperience(member),
  education: serializeEducation(member),
  certifications: serializeCertifications(member),
});

const serializeContributors = (project: Partial<Project>) =>
  (project.contributors || []).map((contributor) => `${contributor.memberId} | ${contributor.role}`).join('\n');

const parseContributors = (value: string) => value.split('\n').map((line) => {
  const [memberId = '', role = ''] = line.split('|').map((part) => part.trim());
  return { memberId, role };
}).filter((contributor) => contributor.memberId && contributor.role);

const emptyBlogPost = (): Partial<BlogPost> => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '<p></p>',
  coverImage: '/images/designwebsiteservice.png',
  category: 'Development',
  tags: [],
  author: 'Wajid Hussain',
  status: 'draft',
  publishedAt: new Date().toISOString().slice(0, 16),
  liveUrl: '',
  metaTitle: '',
  metaDescription: '',
});

function useAdminResource<T>(resource: 'projects' | 'team' | 'blog', enabled: boolean, itemId = '') {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (itemId) {
        const data = await fetchJson<T>(`/api/v2/admin/${resource}/${itemId}`);
        setItems([data]);
      } else {
        const data = await fetchJson<{ items: T[] }>(`/api/v2/admin/${resource}?limit=50`);
        setItems(data.items);
      }
    } catch {
      setError('Unable to sync admin data.');
    } finally {
      setLoading(false);
    }
  }, [enabled, itemId, resource]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, setItems, loading, error, refresh };
}

function AdminTable<T extends Record<string, any>>({
  items,
  search,
  filter,
  columns,
  image,
  imageLabel = 'Thumbnail',
  imageVariant = 'thumbnail',
  onEdit,
  onDelete,
  onReorder,
}: {
  items: T[];
  search: string;
  filter: string;
  columns: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  image?: (item: T) => string | undefined;
  imageLabel?: string;
  imageVariant?: 'thumbnail' | 'avatar';
  onEdit: (item: T) => void;
  onDelete?: (item: T) => void;
  onReorder?: (item: T, direction: -1 | 1) => void;
}) {
  const [sortKey, setSortKey] = useState(columns[0]?.key || 'title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => {
    return items
      .filter((item) => {
        const text = JSON.stringify(item).toLowerCase();
        const matchesSearch = text.includes(search.toLowerCase());
        const matchesFilter = !filter || item.status === filter || item.category === filter || String(item.active) === filter;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const comparison = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [filter, items, search, sortDirection, sortKey]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 86,
    overscan: 6,
  });

  const itemLabel = (item: T) => String(item.title || item.name || 'record');

  const editItem = (item: T) => {
    onEdit(item);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const renderActions = (item: T) => (
    <div className="flex justify-end gap-2">
      {onReorder && (
        <>
          <button type="button" className="rounded-xl border border-white/10 bg-white/[0.035] p-2 text-white/40 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" onClick={() => onReorder(item, -1)} aria-label={`Move ${itemLabel(item)} up`}>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className="rounded-xl border border-white/10 bg-white/[0.035] p-2 text-white/40 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" onClick={() => onReorder(item, 1)} aria-label={`Move ${itemLabel(item)} down`}>
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
      <button type="button" className="rounded-xl border border-white/10 bg-white/[0.035] p-2 text-white/50 transition hover:border-brand-primary/35 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" onClick={() => editItem(item)} aria-label={`Edit ${itemLabel(item)}`}>
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </button>
      {onDelete && (
        <button type="button" className="rounded-xl border border-white/10 bg-white/[0.035] p-2 text-white/50 transition hover:border-red-400/30 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400" onClick={() => onDelete(item)} aria-label={`Archive ${itemLabel(item)}`}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );

  const renderRow = (item: T) => (
    <div
      key={item.id}
      className="grid min-w-[760px] grid-cols-[96px_1.3fr_0.8fr_0.7fr_180px] items-center gap-4 border-b border-white/[0.055] px-4 py-4 text-sm transition-colors hover:bg-white/[0.025]"
    >
      <RecordImage
        src={image ? image(item) : item.thumbnail || item.coverImage || item.avatar}
        alt={imageVariant === 'avatar' ? `${item.name} profile picture` : item.title || item.name || 'Record image'}
        fallbackLabel={item.name || item.title || ''}
        variant={imageVariant}
      />
      {columns.map((column) => (
        <div key={column.key} className="min-w-0 truncate text-white/70">
          {column.render ? column.render(item) : item[column.key]}
        </div>
      ))}
      <div className="hidden">
        {onReorder && (
          <>
            <button type="button" onClick={() => onReorder(item, -1)}>
              ↑
            </button>
            <button type="button" onClick={() => onReorder(item, 1)}>
              ↓
            </button>
          </>
        )}
        <button type="button" onClick={() => onEdit(item)}>
          <Edit3 className="h-4 w-4" />
        </button>
        {onDelete && <button type="button" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </button>}
      </div>
      {renderActions(item)}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.018] p-10 text-center">
        <CircleAlert className="mb-4 h-6 w-6 text-white/25" aria-hidden="true" />
        <p className="text-sm font-semibold text-white/55">No matching records</p>
        <p className="mt-1 text-xs text-white/30">Try a different search term or filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((item) => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
            <div className="flex items-start gap-4">
              <RecordImage
                src={image ? image(item) : item.thumbnail || item.coverImage || item.avatar}
                alt={imageVariant === 'avatar' ? `${item.name} profile picture` : item.title || item.name || 'Record image'}
                fallbackLabel={item.name || item.title || ''}
                variant={imageVariant}
              />
              <div className="min-w-0 flex-1 space-y-2">
                {columns.map((column, index) => (
                  <div key={column.key}>
                    <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/25">{column.label}</span>
                    <div className={cn('mt-0.5 truncate text-sm text-white/60', index === 0 && 'font-semibold text-white')}>
                      {column.render ? column.render(item) : item[column.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t border-white/[0.06] pt-3">{renderActions(item)}</div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.018] shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:block">
        <div className="grid min-w-[760px] grid-cols-[96px_1.3fr_0.8fr_0.7fr_180px] gap-4 border-b border-white/10 bg-white/[0.018] px-4 py-4 text-[9px] font-black uppercase tracking-[0.22em] text-white/30">
          <div>{imageLabel}</div>
          {columns.map((column) => {
            const active = sortKey === column.key;
            return (
              <button
                key={column.key}
                type="button"
                className="flex items-center gap-1.5 text-left transition hover:text-white focus-visible:outline-none focus-visible:text-white"
                onClick={() => {
                  setSortDirection(active && sortDirection === 'asc' ? 'desc' : 'asc');
                  setSortKey(column.key);
                }}
              >
                {column.label}
                {active && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
              </button>
            );
          })}
          <div className="text-right">Actions</div>
        </div>

        {rows.length > 20 ? (
          <div ref={parentRef} className="h-[620px] overflow-auto">
            <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                >
                  {renderRow(rows[virtualRow.index])}
                </div>
              ))}
            </div>
          </div>
        ) : rows.map((item) => renderRow(item))}
      </div>
    </>
  );
}

function RecordImage({
  src,
  alt,
  fallbackLabel,
  variant,
}: {
  src?: string;
  alt: string;
  fallbackLabel: string;
  variant: 'thumbnail' | 'avatar';
}) {
  const [failed, setFailed] = useState(false);
  const initials = fallbackLabel
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '—';
  const frameClass = variant === 'avatar'
    ? 'h-16 w-16 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-neutral-950'
    : 'h-14 w-20 rounded-xl';

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} unavailable`}
        className={cn(frameClass, 'flex items-center justify-center bg-brand-primary/15 font-display text-sm font-black text-brand-primary')}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(frameClass, 'object-cover')}
      referrerPolicy="no-referrer"
    />
  );
}

function AdminResponsiveMenu({
  tabs,
  activeTab,
  newMessageCount,
  onSelect,
}: {
  tabs: (typeof adminTabs)[number][];
  activeTab: AdminTab;
  newMessageCount: number;
  onSelect: (tab: AdminTab) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initialFocusRef = useRef(0);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const active = tabs[activeIndex] || tabs[0];
  const menuId = 'admin-responsive-navigation';

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => itemRefs.current[initialFocusRef.current]?.focus());
    const closeFromOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeFromEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, [open]);

  useEffect(() => setOpen(false), [activeTab]);

  const openAt = (index: number) => {
    initialFocusRef.current = index;
    setFocusedIndex(index);
    setOpen(true);
  };

  const moveFocus = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + tabs.length) % tabs.length;
    setFocusedIndex(normalizedIndex);
    itemRefs.current[normalizedIndex]?.focus();
  };

  const selectTab = (tab: AdminTab) => {
    setOpen(false);
    onSelect(tab);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  if (!active) return null;
  const ActiveIcon = active.icon;

  return (
    <div ref={rootRef} className="admin-nav-mobile">
      <button
        ref={triggerRef}
        type="button"
        className="admin-nav-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => open ? setOpen(false) : openAt(activeIndex)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openAt(activeIndex);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openAt(tabs.length - 1);
          }
        }}
      >
        <span className="admin-nav-trigger-icon"><ActiveIcon className="h-[17px] w-[17px]" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Current section</span>
          <span className="mt-0.5 block truncate text-xs font-semibold tracking-[0.01em] text-white">{active.name}</span>
        </span>
        {active.id === 'messages' && newMessageCount > 0 && <span className="admin-nav-count">{newMessageCount}</span>}
        <ChevronDown className="admin-nav-chevron h-4 w-4" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Scrim overlay for mobile menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              id={menuId}
              role="menu"
              aria-label="Admin sections"
              className="admin-nav-dropdown z-50"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.22, ease: [0.4, 0, 0.2, 1] }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                moveFocus(focusedIndex + 1);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                moveFocus(focusedIndex - 1);
              } else if (event.key === 'Home') {
                event.preventDefault();
                moveFocus(0);
              } else if (event.key === 'End') {
                event.preventDefault();
                moveFocus(tabs.length - 1);
              } else if (event.key === 'Tab') {
                setOpen(false);
              }
            }}
          >
            <div className="admin-nav-dropdown-heading">
              <span>Navigate workspace</span>
              <span>{tabs.length} sections</span>
            </div>
            <div className="admin-nav-menu-list">
              {tabs.map((tab, index) => {
                const selected = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    ref={(element) => { itemRefs.current[index] = element; }}
                    type="button"
                    role="menuitem"
                    tabIndex={index === focusedIndex ? 0 : -1}
                    className={cn('admin-nav-item', selected && 'is-active')}
                    aria-current={selected ? 'page' : undefined}
                    onFocus={() => setFocusedIndex(index)}
                    onClick={() => selectTab(tab.id)}
                  >
                    <span className="admin-nav-item-icon"><TabIcon className="h-[17px] w-[17px]" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block text-sm font-medium text-white/72">{tab.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-white/28">{tab.description}</span>
                    </span>
                    {tab.id === 'messages' && newMessageCount > 0 && <span className="admin-nav-count">{newMessageCount}</span>}
                    {selected && <span className="admin-nav-active-mark" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const operationRef = useRef(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');
  const [userRole, setUserRole] = useState<AdminRole>('editor');
  const [userTeamMemberId, setUserTeamMemberId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginPending, setLoginPending] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(() => adminTabFromPath(location.pathname));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [operation, setOperation] = useState('');
  const [mediaUploadsInProgress, setMediaUploadsInProgress] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, publishedBlogs: 0, teamMembers: 0, totalViews: 0, activity: [] });

  const handleMediaUploadingChange = useCallback((uploading: boolean) => {
    setMediaUploadsInProgress((current) => Math.max(0, current + (uploading ? 1 : -1)));
  }, []);

  const contentAccess = authenticated && userRole !== 'team_member';
  const projects = useAdminResource<Project>('projects', contentAccess);
  const team = useAdminResource<TeamMember>('team', authenticated, userRole === 'team_member' ? userTeamMemberId : '');
  const blog = useAdminResource<BlogPost>('blog', contentAccess);
  const refreshProjects = projects.refresh;
  const refreshTeam = team.refresh;
  const refreshBlog = blog.refresh;

  const [projectForm, setProjectForm] = useState<Partial<Project>>(emptyProject());
  const [contributorText, setContributorText] = useState('');
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>(emptyTeamMember());
  const [teamText, setTeamText] = useState(structuredTeamText());
  const [blogForm, setBlogForm] = useState<Partial<BlogPost>>(emptyBlogPost());
  const [editingProjectId, setEditingProjectId] = useState('');
  const [editingTeamId, setEditingTeamId] = useState('');
  const [editingBlogId, setEditingBlogId] = useState('');

  const refreshStats = useCallback(async () => {
    if (!contentAccess) return;
    try {
      setStats(await fetchJson<Stats>('/api/v2/admin/stats'));
    } catch {
      setStats((current) => current);
    }
  }, [contentAccess]);

  const refreshMessages = useCallback(async () => {
    if (!contentAccess) return;
    try {
      const data = await fetchJson<{ items: ContactMessage[] }>('/api/v2/admin/messages?limit=100');
      setMessages(data.items);
    } catch {
      setMessages((current) => current);
    }
  }, [contentAccess]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshProjects(), refreshTeam(), refreshBlog(), refreshStats(), refreshMessages()]);
    setLastSyncedAt(new Date());
  }, [refreshBlog, refreshMessages, refreshProjects, refreshStats, refreshTeam]);

  const performOperation = useCallback(async (key: string, successMessage: string, task: () => Promise<void>) => {
    if (operationRef.current) return false;
    operationRef.current = true;
    setOperation(key);
    setNotice(null);
    try {
      await task();
      setNotice({ tone: 'success', message: successMessage });
      return true;
    } catch (caught) {
      setNotice({ tone: 'error', message: caught instanceof Error ? caught.message : 'The request could not be completed.' });
      return false;
    } finally {
      operationRef.current = false;
      setOperation('');
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    fetchJson<{ authenticated: boolean; csrfToken: string; user: { name: string; role: AdminRole; teamMemberId?: string | null } }>('/api/v2/auth/session')
      .then((session) => {
        setAdminCsrfToken(session.csrfToken);
        setAdminName(session.user.name);
        setUserRole(session.user.role);
        setUserTeamMemberId(session.user.teamMemberId || '');
        const requestedTab = adminTabFromPath(location.pathname);
        const nextTab = canAccessAdminTab(session.user.role, requestedTab) ? requestedTab : session.user.role === 'team_member' ? 'team' : 'dashboard';
        setActiveTab(nextTab);
        setAuthenticated(true);
        if (location.pathname !== `/admin/${nextTab}`) navigate(`/admin/${nextTab}`, { replace: true });
      })
      .catch(() => {
        setAuthenticated(false);
        if (location.pathname !== '/admin/login') navigate('/admin/login', { replace: true });
      })
      .finally(() => setAuthChecked(true));
  // Session bootstrap runs once; route changes are synchronized separately below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!authenticated) return;
    const requestedTab = adminTabFromPath(location.pathname);
    const nextTab = canAccessAdminTab(userRole, requestedTab) ? requestedTab : userRole === 'team_member' ? 'team' : 'dashboard';
    setActiveTab(nextTab);
    if (location.pathname !== `/admin/${nextTab}`) navigate(`/admin/${nextTab}`, { replace: true });
  }, [authenticated, location.pathname, navigate, userRole]);

  useEffect(() => {
    if (authenticated) refreshAll();
  }, [authenticated, refreshAll]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setLoginPending(true);
    try {
      const session = await fetchJson<{ csrfToken: string; user: { name: string; role: AdminRole; teamMemberId?: string | null } }>('/api/v2/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      setAdminCsrfToken(session.csrfToken);
      setAdminName(session.user.name);
      setUserRole(session.user.role);
      setUserTeamMemberId(session.user.teamMemberId || '');
      const nextTab: AdminTab = session.user.role === 'team_member' ? 'team' : 'dashboard';
      setActiveTab(nextTab);
      setPassword('');
      setAuthenticated(true);
      navigate(`/admin/${nextTab}`, { replace: true });
    } catch (caught) {
      if (caught instanceof ApiRequestError && caught.status === 503) {
        setLoginError('ADMIN SERVICE TEMPORARILY UNAVAILABLE. PLEASE TRY AGAIN LATER.');
      } else if (caught instanceof ApiRequestError && caught.status === 429) {
        setLoginError('TOO MANY LOGIN ATTEMPTS. PLEASE WAIT AND TRY AGAIN.');
      } else {
        setLoginError('ACCESS DENIED. INVALID CREDENTIALS.');
      }
    } finally {
      setLoginPending(false);
    }
  };

  const logout = async () => {
    await performOperation('logout', 'Signed out securely.', async () => {
      await fetchJson('/api/v2/auth/logout', { method: 'POST' });
      setAdminCsrfToken('');
      setAuthenticated(false);
      navigate('/admin/login', { replace: true });
    });
  };

  useEffect(() => {
    if (userRole !== 'team_member' || team.items.length !== 1 || editingTeamId) return;
    const item = team.items[0];
    setTeamForm(item);
    setTeamText(structuredTeamText(item));
    setEditingTeamId(item.id);
  }, [editingTeamId, team.items, userRole]);

  const saveProject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mediaUploadsInProgress) { setNotice({ tone: 'error', message: 'Wait for the active image upload to finish before saving the project.' }); return; }
    const payload = {
      title: projectForm.title || '',
      slug: projectForm.slug || slugify(projectForm.title || ''),
      shortDescription: projectForm.shortDescription || '',
      fullDescription: projectForm.fullDescription || '<p></p>',
      thumbnail: projectForm.thumbnail || '',
      thumbnailMediaId: projectForm.thumbnailMediaId || null,
      gallery: projectForm.gallery || [],
      galleryMediaIds: projectForm.galleryMediaIds || [],
      category: projectForm.category || 'Web',
      technologies: projectForm.technologies || [],
      liveUrl: projectForm.liveUrl || '',
      githubUrl: projectForm.githubUrl || '',
      featured: Boolean(projectForm.featured),
      status: (projectForm.status || 'published') as ProjectStatus,
      completionDate: projectForm.completionDate || '',
      metaTitle: projectForm.metaTitle || '',
      metaDescription: projectForm.metaDescription || '',
      sortOrder: Number(projectForm.sortOrder || projects.items.length + 1),
      memberId: projectForm.memberId || '',
      memberRole: projectForm.memberRole || '',
      contributors: parseContributors(contributorText),
      client: projectForm.client || '',
      industry: projectForm.industry || '',
      problem: projectForm.problem || '',
      challenge: projectForm.challenge || '',
      solution: projectForm.solution || '',
      process: projectForm.process || [],
      results: projectForm.results || [],
      achievements: projectForm.achievements || [],
      ...(typeof (projectForm as Project & { version?: number }).version === 'number' ? { version: (projectForm as Project & { version?: number }).version } : {}),
    };
    const editing = Boolean(editingProjectId);
    await performOperation('project-save', editing ? 'Project updated.' : 'Project created.', async () => {
      await fetchJson(`/api/v2/admin/projects${editingProjectId ? `/${editingProjectId}` : ''}`, {
        method: editingProjectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setProjectForm(emptyProject());
      setContributorText('');
      setEditingProjectId('');
      await refreshAll();
    });
  };

  const saveTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mediaUploadsInProgress) { setNotice({ tone: 'error', message: 'Wait for the active media upload to finish before saving the member.' }); return; }
    const payload = {
      name: teamForm.name || '',
      slug: teamForm.slug || slugify(teamForm.name || ''),
      role: teamForm.role || '',
      tagline: teamForm.tagline || '',
      bio: teamForm.bio || '',
      fullBio: teamForm.fullBio || '',
      specialization: teamForm.specialization || '',
      avatar: teamForm.avatar || '',
      avatarMediaId: teamForm.avatarMediaId || null,
      coverImage: teamForm.coverImage || '',
      coverMediaId: teamForm.coverMediaId || null,
      email: teamForm.email || '',
      location: teamForm.location || '',
      availability: teamForm.availability || '',
      yearsExperience: teamForm.yearsExperience || '',
      languages: teamForm.languages || [],
      cvUrl: teamForm.cvUrl || '',
      cvMediaId: teamForm.cvMediaId || null,
      accentColor: teamForm.accentColor || '#3D5AFE',
      skills: teamForm.skills || [],
      skillGroups: parseSkillGroups(teamText.skills),
      experience: parseExperience(teamText.experience),
      education: parseEducation(teamText.education),
      certifications: parseCertifications(teamText.certifications),
      socialLinks: teamForm.socialLinks || {},
      active: Boolean(teamForm.active),
      displayOrder: Number(teamForm.displayOrder || team.items.length + 1),
    };
    const editing = Boolean(editingTeamId);
    await performOperation('team-save', editing ? 'Team profile updated.' : 'Team member created.', async () => {
      await fetchJson(`/api/v2/admin/team${editingTeamId ? `/${editingTeamId}` : ''}`, {
        method: editingTeamId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setTeamForm(emptyTeamMember());
      setTeamText(structuredTeamText());
      setEditingTeamId('');
      await refreshAll();
    });
  };

  const saveBlog = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mediaUploadsInProgress) { setNotice({ tone: 'error', message: 'Wait for the active image upload to finish before saving the blog post.' }); return; }
    const payload = {
      title: blogForm.title || '',
      slug: blogForm.slug || slugify(blogForm.title || ''),
      excerpt: blogForm.excerpt || '',
      content: blogForm.content || '<p></p>',
      coverImage: blogForm.coverImage || '',
      coverMediaId: blogForm.coverMediaId || null,
      category: blogForm.category || 'Development',
      tags: blogForm.tags || [],
      author: blogForm.author || 'Wajid Hussain',
      status: (blogForm.status || 'draft') as BlogStatus,
      publishedAt: blogForm.publishedAt ? new Date(blogForm.publishedAt).toISOString() : new Date().toISOString(),
      liveUrl: blogForm.liveUrl || '',
      metaTitle: blogForm.metaTitle || '',
      metaDescription: blogForm.metaDescription || '',
      sortOrder: Number((blogForm as BlogPost & { sortOrder?: number }).sortOrder || blog.items.length + 1),
      ...(typeof (blogForm as BlogPost & { version?: number }).version === 'number' ? { version: (blogForm as BlogPost & { version?: number }).version } : {}),
    };
    const editing = Boolean(editingBlogId);
    await performOperation('blog-save', editing ? 'Blog post updated.' : 'Blog post created.', async () => {
      await fetchJson(`/api/v2/admin/blog${editingBlogId ? `/${editingBlogId}` : ''}`, {
        method: editingBlogId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setBlogForm(emptyBlogPost());
      setEditingBlogId('');
      await refreshAll();
    });
  };

  const [deleteTarget, setDeleteTarget] = useState<{ resource: 'projects' | 'team' | 'blog'; item: { id: string; title?: string; name?: string } } | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const copyClientEmail = (messageId: string, email: string) => {
    void navigator.clipboard.writeText(email);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const confirmDeleteItem = async () => {
    if (!deleteTarget) return;
    const { resource, item } = deleteTarget;
    await performOperation(`${resource}-archive`, `${item.title || item.name || 'Record'} archived.`, async () => {
      await fetchJson(`/api/v2/admin/${resource}/${item.id}`, { method: 'DELETE' });
      await refreshAll();
    });
    setDeleteTarget(null);
  };

  const deleteItem = (resource: 'projects' | 'team' | 'blog', item: { id: string; title?: string; name?: string }) => {
    setDeleteTarget({ resource, item });
  };

  const reorderItem = async (resource: 'projects' | 'team', item: { id: string }, direction: -1 | 1) => {
    await performOperation(`${resource}-reorder`, 'Display order updated.', async () => {
      await fetchJson(`/api/v2/admin/${resource}/${item.id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      await refreshAll();
    });
  };

  const tabs = adminTabs.filter((tab) => canAccessAdminTab(userRole, tab.id));
  const activeTabMeta = adminTabs.find((tab) => tab.id === activeTab) || adminTabs[0];
  const newMessageCount = messages.filter((message) => message.status === 'new').length;
  const draftCount = projects.items.filter((project) => project.status === 'draft').length + blog.items.filter((post) => post.status === 'draft').length;
  const publishedProjectCount = projects.items.filter((project) => project.status === 'published').length;

  const changeTab = (tab: AdminTab) => {
    if (!canAccessAdminTab(userRole, tab)) return;
    setActiveTab(tab);
    setSearch('');
    setFilter('');
    navigate(`/admin/${tab}`);
  };

  const manualRefresh = () => performOperation('refresh', 'Admin data is up to date.', refreshAll);

  const cancelProjectEditing = () => {
    setProjectForm(emptyProject());
    setContributorText('');
    setEditingProjectId('');
  };

  const cancelTeamEditing = () => {
    setTeamForm(emptyTeamMember());
    setTeamText(structuredTeamText());
    setEditingTeamId('');
  };

  const cancelBlogEditing = () => {
    setBlogForm(emptyBlogPost());
    setEditingBlogId('');
  };

  if (!authChecked) {
    return (
      <div className="admin-console flex min-h-screen items-center justify-center bg-[#060608] text-white">
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10"><LoaderCircle className="h-5 w-5 animate-spin text-brand-primary" /></span>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/35">Securing workspace</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="admin-console relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] px-4 py-10 text-neutral-100 sm:px-6">
        <div className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-brand-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-14rem] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-brand-purple/10 blur-[120px]" />
        <motion.form
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={login}
          className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0b0b0f]/95 p-7 shadow-[0_40px_140px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-11"
        >
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-primary/20 bg-brand-primary/10">
            <Lock className="h-8 w-8 text-brand-primary" />
          </div>
          <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">LB CodeBase Workspace</p>
          <h1 className="mb-3 text-center font-display text-3xl font-black tracking-[-0.04em]">Welcome back</h1>
          <p className="mb-10 text-center text-sm leading-relaxed text-white/35">
            Sign in to manage publishing, projects, people, and client operations.
          </p>
          <label htmlFor="admin-username" className="sr-only">Admin username</label>
          <input
            id="admin-username"
            required
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Admin username"
            autoComplete="username"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 text-white outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
          />
          <label htmlFor="admin-password" className="sr-only">Password</label>
          <input
            id="admin-password"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-4 text-white outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
          />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="mb-6 ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/35 transition hover:text-white focus-visible:outline-none focus-visible:text-brand-primary">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
          {loginError && <div aria-live="polite" className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-red-400">{loginError}</div>}
          <Button type="submit" disabled={loginPending} className="w-full disabled:cursor-wait disabled:opacity-60">
            {loginPending ? 'Signing In…' : 'Login to Dashboard'}
          </Button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="admin-console min-h-screen bg-[#060608] text-neutral-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08080b]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.26em] text-brand-primary">LB CodeBase</div>
            <div className="truncate text-sm font-semibold text-white">{adminName}</div>
          </div>
          <AdminResponsiveMenu tabs={tabs} activeTab={activeTab} newMessageCount={newMessageCount} onSelect={changeTab} />
        </div>
      </header>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="sticky top-0 hidden h-screen w-[292px] shrink-0 flex-col border-r border-white/[0.08] bg-[#08080b] p-5 lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2 pt-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-primary/25 bg-brand-primary/10 text-brand-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary">LB CodeBase</div>
              <div className="mt-1 text-sm font-semibold text-white">Control center</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Admin navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  activeTab === tab.id ? 'bg-brand-primary text-white shadow-[0_12px_35px_rgba(61,90,254,0.24)]' : 'text-white/45 hover:bg-white/[0.045] hover:text-white',
                )}
              >
                <tab.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className="flex-1">{tab.name}</span>
                {tab.id === 'messages' && newMessageCount > 0 && <span className={cn('rounded-md px-1.5 py-0.5 text-[9px] font-black', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-brand-primary/15 text-brand-primary')}>{newMessageCount}</span>}
                {activeTab === tab.id && <ChevronRight className="h-4 w-4 text-white/70" aria-hidden="true" />}
              </button>
            ))}
          </nav>
          <div className="mt-5 border-t border-white/[0.08] pt-5">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.025] p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] font-display text-xs font-black text-white">{adminName.slice(0, 2).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-white">{adminName}</div>
                <div className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/30">{userRole.replace('_', ' ')}</div>
              </div>
            </div>
            <button onClick={logout} disabled={Boolean(operation)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400/65 transition hover:bg-red-400/[0.06] hover:text-red-300 disabled:opacity-40">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8 xl:p-10">
          <div className="mx-auto max-w-[1500px]">
          <div className="mb-8 border-b border-white/[0.08] pb-7">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-brand-primary"><span className="h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_14px_rgba(61,90,254,0.9)]" /> Operations workspace</div>
                <h2 className="font-display text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">{activeTabMeta.name}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/35">{activeTabMeta.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 hidden text-[10px] text-white/25 sm:inline">{lastSyncedAt ? `Synced ${lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Preparing workspace'}</span>
                <button type="button" onClick={() => void manualRefresh()} disabled={Boolean(operation)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[10px] font-black uppercase tracking-wider text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40">
                  <RefreshCw className={cn('h-3.5 w-3.5', operation === 'refresh' && 'animate-spin')} /> Refresh
                </button>
                <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-[10px] font-black uppercase tracking-wider text-white/50 transition hover:border-brand-primary/30 hover:text-white">
                  View site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            {(['projects', 'team', 'messages', 'blog'] as AdminTab[]).includes(activeTab) && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="relative min-w-0 flex-1 xl:max-w-sm">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} className={cn(fieldClass, 'bg-white/[0.028] pl-11')} placeholder={`Search ${activeTabMeta.name.toLowerCase()}...`} />
                </label>
                {activeTab !== 'messages' && <label className="relative sm:min-w-48">
                  <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <select value={filter} onChange={(event) => setFilter(event.target.value)} className={cn(fieldClass, 'bg-white/[0.028] pl-11')} aria-label={`Filter ${activeTabMeta.name}`}>
                    <option value="">All</option>
                    {activeTab === 'projects' && [...projectCategories, ...projectStatuses].map((item) => <option key={item}>{item}</option>)}
                    {activeTab === 'blog' && blogStatuses.map((item) => <option key={item}>{item}</option>)}
                    {activeTab === 'team' && (
                      <>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </>
                    )}
                  </select>
                </label>}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-8">
                <div className="grid gap-5 overflow-hidden rounded-3xl border border-brand-primary/15 bg-[linear-gradient(125deg,rgba(61,90,254,0.14),rgba(255,255,255,0.018)_44%,rgba(255,255,255,0.025))] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-brand-primary">Today at LB CodeBase</p>
                    <h3 className="mt-3 font-display text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">Your publishing pipeline is ready.</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/40">{draftCount > 0 ? `${draftCount} draft ${draftCount === 1 ? 'item needs' : 'items need'} review` : 'No draft content is waiting'} and {newMessageCount > 0 ? `${newMessageCount} new ${newMessageCount === 1 ? 'inquiry is' : 'inquiries are'} in the inbox.` : 'the client inbox is clear.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {draftCount > 0 && <button type="button" onClick={() => changeTab('projects')} className="rounded-xl bg-white px-4 py-3 text-[10px] font-black uppercase tracking-wider text-black transition hover:bg-white/90">Review drafts</button>}
                    <button type="button" onClick={() => changeTab('messages')} className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-white/65 transition hover:border-white/25 hover:text-white">Open inbox</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Published projects', value: publishedProjectCount, detail: `${stats.totalProjects} total`, icon: FolderKanban },
                    { label: 'Published insights', value: stats.publishedBlogs, detail: `${draftCount} drafts across content`, icon: Newspaper },
                    { label: 'Team members', value: stats.teamMembers, detail: 'Active directory', icon: Users },
                    { label: 'Recorded views', value: stats.totalViews, detail: 'All tracked pages', icon: BarChart3 },
                  ].map((stat, index) => (
                    <motion.div key={stat.label} initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: prefersReducedMotion ? 0 : index * 0.055 }} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-brand-primary/20 hover:bg-white/[0.035]">
                      <div className="mb-7 flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary"><stat.icon className="h-5 w-5" /></span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" /></div>
                      <div className="font-display text-4xl font-black tracking-[-0.04em]">{stat.value.toLocaleString()}</div>
                      <div className="mt-2 text-xs font-semibold text-white/60">{stat.label}</div>
                      <div className="mt-1 text-[10px] text-white/25">{stat.detail}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.022] p-6 sm:p-7">
                    <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-primary">Audit trail</p><h3 className="mt-2 font-display text-xl font-black tracking-[-0.025em]">Recent activity</h3></div><span className="text-[10px] text-white/25">Latest 10</span></div>
                    <div className="space-y-1">
                      {stats.activity.length === 0 ? (
                        <p className="text-sm text-white/35">No activity yet.</p>
                      ) : (
                        stats.activity.map((item) => (
                          <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl px-2 py-3 text-sm text-white/60 transition hover:bg-white/[0.025]">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-primary/70 shadow-[0_0_12px_rgba(61,90,254,0.55)]" />
                            <div className="min-w-0"><p className="truncate">{item.label}</p><time className="mt-1 block text-[10px] text-white/25">{new Date(item.createdAt).toLocaleString()}</time></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.022] p-6 sm:p-7">
                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-primary">Shortcuts</p>
                    <h3 className="mt-2 font-display text-xl font-black tracking-[-0.025em]">Quick actions</h3>
                    <div className="mt-6 grid gap-3">
                      {([
                        ['projects', 'Create project', 'Add a portfolio case study', FolderKanban],
                        ['blog', 'Write an insight', 'Start a new editorial draft', Newspaper],
                        ['team', 'Add team member', 'Create a professional profile', Users],
                      ] as const).map(([tab, label, description, Icon]) => (
                        <button key={String(tab)} onClick={() => changeTab(tab as AdminTab)} className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition hover:border-brand-primary/25 hover:bg-brand-primary/[0.055]">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.045] text-white/45 transition group-hover:bg-brand-primary/15 group-hover:text-brand-primary"><Icon className="h-5 w-5" /></span>
                          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{label}</span><span className="mt-1 block text-xs text-white/30">{description}</span></span>
                          <ChevronRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-brand-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-8 xl:grid-cols-[480px_1fr]">
                <form onSubmit={saveProject} className="h-fit space-y-6 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Plus className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase text-white">
                        {editingProjectId ? 'Edit Project' : 'New Project'}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/40">Portfolio case study specifications</p>
                    </div>
                  </div>

                  {/* Basic Project Info */}
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Project Title *</span>
                        <input
                          required
                          value={projectForm.title || ''}
                          onChange={(event) =>
                            setProjectForm({
                              ...projectForm,
                              title: event.target.value,
                              slug: editingProjectId ? projectForm.slug : slugify(event.target.value),
                            })
                          }
                          className={fieldClass}
                          placeholder="e.g. AI Financial Dashboard"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>URL Slug *</span>
                        <input
                          required
                          value={projectForm.slug || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, slug: slugify(event.target.value) })}
                          className={fieldClass}
                          placeholder="ai-financial-dashboard"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Category</span>
                        <input
                          list="project-category-options"
                          value={projectForm.category || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, category: event.target.value })}
                          className={fieldClass}
                          placeholder="Web, Mobile, AI..."
                        />
                        <datalist id="project-category-options">
                          {projectCategories.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </label>

                      <label className="space-y-2">
                        <span className={labelClass}>Publishing Status</span>
                        <select
                          value={projectForm.status || 'published'}
                          onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value as ProjectStatus })}
                          className={fieldClass}
                        >
                          {projectStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Team & Ownership */}
                  <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                    <label className="space-y-2">
                      <span className={labelClass}>Primary Lead / Owner</span>
                      <select
                        value={projectForm.memberId || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, memberId: event.target.value })}
                        className={fieldClass}
                      >
                        <option value="">Use contributors specified below</option>
                        {team.items.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} — {member.role}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Portfolio Contributors</span>
                      <textarea
                        rows={4}
                        value={contributorText}
                        onChange={(event) => setContributorText(event.target.value)}
                        className={fieldClass}
                        placeholder={'team-wajid | Automation Strategy & Technical Consulting\nteam-ibad | UI/UX Design'}
                      />
                      <p className="text-[11px] leading-relaxed text-white/30">
                        Format: <code className="text-brand-primary">member_id | role</code> (one per line).
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {team.items.map((member) => (
                          <code key={member.id} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/50">
                            {member.id}: {member.name}
                          </code>
                        ))}
                      </div>
                    </label>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <label className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={labelClass}>Short Summary *</span>
                        <span className="text-[10px] text-white/30">{projectForm.shortDescription?.length || 0}/150</span>
                      </div>
                      <textarea
                        maxLength={150}
                        required
                        rows={3}
                        value={projectForm.shortDescription || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, shortDescription: event.target.value })}
                        className={fieldClass}
                        placeholder="Brief teaser for portfolio grid cards and SEO..."
                      />
                    </label>

                    <label className="space-y-2">
                      <span className={labelClass}>Full Case Study Content</span>
                      <RichTextEditor
                        value={projectForm.fullDescription || ''}
                        onChange={(value) => setProjectForm({ ...projectForm, fullDescription: value })}
                      />
                    </label>
                  </div>

                  {/* Case Study Detailed Breakdown Accordion */}
                  <details className="rounded-2xl border border-white/[0.08] bg-black/30 p-4 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Structured Case Study Breakdown (Optional)
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input
                          value={projectForm.memberRole || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, memberRole: event.target.value })}
                          className={fieldClass}
                          placeholder="Your Role"
                        />
                        <input
                          value={projectForm.client || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, client: event.target.value })}
                          className={fieldClass}
                          placeholder="Client Name"
                        />
                        <input
                          value={projectForm.industry || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, industry: event.target.value })}
                          className={fieldClass}
                          placeholder="Industry"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={projectForm.problem || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, problem: event.target.value })}
                        className={fieldClass}
                        placeholder="Problem statement..."
                      />
                      <textarea
                        rows={3}
                        value={projectForm.challenge || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, challenge: event.target.value })}
                        className={fieldClass}
                        placeholder="Technical challenges faced..."
                      />
                      <textarea
                        rows={4}
                        value={projectForm.solution || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, solution: event.target.value })}
                        className={fieldClass}
                        placeholder="Innovative solution implemented..."
                      />
                      <textarea
                        rows={3}
                        value={(projectForm.process || []).join('\n')}
                        onChange={(event) =>
                          setProjectForm({
                            ...projectForm,
                            process: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                          })
                        }
                        className={fieldClass}
                        placeholder="Process steps (one per line)..."
                      />
                      <textarea
                        rows={3}
                        value={(projectForm.results || []).join('\n')}
                        onChange={(event) =>
                          setProjectForm({
                            ...projectForm,
                            results: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                          })
                        }
                        className={fieldClass}
                        placeholder="Quantitative results (one per line)..."
                      />
                      <textarea
                        rows={3}
                        value={(projectForm.achievements || []).join('\n')}
                        onChange={(event) =>
                          setProjectForm({
                            ...projectForm,
                            achievements: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean),
                          })
                        }
                        className={fieldClass}
                        placeholder="Key milestones / achievements (one per line)..."
                      />
                    </div>
                  </details>

                  {/* Thumbnail Section */}
                  <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                    <span className={labelClass}>Primary Cover Thumbnail</span>
                    {projectForm.thumbnail ? (
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                        <img
                          src={projectForm.thumbnail}
                          alt="Project thumbnail preview"
                          className="aspect-[16/10] w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 text-xs text-white/35">
                        No thumbnail assigned
                      </div>
                    )}
                    <input
                      value={projectForm.thumbnail || ''}
                      disabled={mediaUploadsInProgress > 0}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, thumbnail: event.target.value, thumbnailMediaId: null }))
                      }
                      className={fieldClass}
                      placeholder="Image URL or upload below"
                    />
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <MediaUploadButton
                        label="Upload Cover Image"
                        disabled={mediaUploadsInProgress > 0}
                        onUploadingChange={handleMediaUploadingChange}
                        onUpload={([upload]) =>
                          setProjectForm((current) => ({ ...current, thumbnail: upload.url, thumbnailMediaId: upload.id }))
                        }
                      />
                      {projectForm.thumbnail && (
                        <button
                          type="button"
                          disabled={mediaUploadsInProgress > 0 || Boolean(operation)}
                          onClick={() => setProjectForm((current) => ({ ...current, thumbnail: '', thumbnailMediaId: null }))}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-300 transition hover:border-red-400/40 hover:bg-red-400/10"
                        >
                          <X className="h-4 w-4" /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className={labelClass}>Project Gallery Images</span>
                      <span className="text-[10px] text-white/35">{(projectForm.gallery || []).length}/30 uploaded</span>
                    </div>

                    {(projectForm.gallery || []).length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {(projectForm.gallery || []).map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            type="button"
                            disabled={mediaUploadsInProgress > 0}
                            onClick={() =>
                              setProjectForm((current) => ({
                                ...current,
                                gallery: (current.gallery || []).filter((_, itemIndex) => itemIndex !== index),
                                galleryMediaIds: (current.galleryMediaIds || []).filter((_, itemIndex) => itemIndex !== index),
                              }))
                            }
                            className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 transition hover:border-red-400/50"
                            aria-label={`Remove gallery image ${index + 1}`}
                          >
                            <img src={image} alt={`Gallery preview ${index + 1}`} className="aspect-video w-full object-contain" />
                            <span className="absolute inset-0 flex items-center justify-center bg-red-950/80 text-[9px] font-black uppercase tracking-widest text-white opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                              Remove
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <MediaUploadButton
                      label={
                        (projectForm.gallery || []).length >= 30
                          ? 'Gallery limit reached'
                          : `Add Gallery Images (${30 - (projectForm.gallery || []).length} remaining)`
                      }
                      multiple
                      maxFiles={Math.min(20, Math.max(1, 30 - (projectForm.gallery || []).length))}
                      disabled={(projectForm.gallery || []).length >= 30 || mediaUploadsInProgress > 0}
                      onUploadingChange={handleMediaUploadingChange}
                      onUpload={(uploads) =>
                        setProjectForm((current) => {
                          const currentGallery = current.gallery || [];
                          const currentMediaIds = current.galleryMediaIds || [];
                          const uniqueUploads = uploads.filter(
                            (upload) => upload.url && !currentGallery.includes(upload.url) && !currentMediaIds.includes(upload.id)
                          );
                          return {
                            ...current,
                            gallery: [...currentGallery, ...uniqueUploads.map((upload) => upload.url)].slice(0, 30),
                            galleryMediaIds: [...currentMediaIds, ...uniqueUploads.map((upload) => upload.id)].slice(0, 30),
                          };
                        })
                      }
                    />
                  </div>

                  {/* Technologies & URLs */}
                  <div className="space-y-4">
                    <label className="space-y-2">
                      <span className={labelClass}>Tech Stack (Comma separated)</span>
                      <input
                        value={(projectForm.technologies || []).join(', ')}
                        onChange={(event) =>
                          setProjectForm({ ...projectForm, technologies: tagsFromString(event.target.value) })
                        }
                        className={fieldClass}
                        placeholder="React, Next.js, Node.js, TailwindCSS"
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Live Website URL</span>
                        <input
                          value={projectForm.liveUrl || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, liveUrl: event.target.value })}
                          className={fieldClass}
                          placeholder="https://example.com"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>GitHub Repository URL</span>
                        <input
                          value={projectForm.githubUrl || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, githubUrl: event.target.value })}
                          className={fieldClass}
                          placeholder="https://github.com/..."
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Completion Date</span>
                        <input
                          type="date"
                          value={projectForm.completionDate || ''}
                          onChange={(event) => setProjectForm({ ...projectForm, completionDate: event.target.value })}
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white/70 transition hover:border-brand-primary/30">
                        <input
                          type="checkbox"
                          checked={Boolean(projectForm.featured)}
                          onChange={(event) => setProjectForm({ ...projectForm, featured: event.target.checked })}
                          className="h-4 w-4 rounded accent-brand-primary"
                        />
                        <span className="font-semibold text-white">Featured Project</span>
                      </label>
                    </div>
                  </div>

                  {/* SEO Fields */}
                  <div className="space-y-4 border-t border-white/[0.08] pt-5">
                    <label className="space-y-2">
                      <span className={labelClass}>SEO Meta Title</span>
                      <input
                        value={projectForm.metaTitle || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, metaTitle: event.target.value })}
                        className={fieldClass}
                        placeholder="Custom page title for search engines..."
                      />
                    </label>
                    <label className="space-y-2">
                      <span className={labelClass}>SEO Meta Description</span>
                      <textarea
                        rows={2}
                        value={projectForm.metaDescription || ''}
                        onChange={(event) => setProjectForm({ ...projectForm, metaDescription: event.target.value })}
                        className={fieldClass}
                        placeholder="Custom description for Google snippet preview..."
                      />
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
                    <Button
                      disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                      className="flex-1 shadow-[0_0_24px_rgba(61,90,254,0.35)] disabled:cursor-wait disabled:opacity-50"
                    >
                      {operation === 'project-save' || mediaUploadsInProgress > 0 ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {mediaUploadsInProgress > 0
                        ? 'Uploading Media...'
                        : operation === 'project-save'
                        ? 'Saving Project...'
                        : 'Save Project'}
                    </Button>
                    {editingProjectId && (
                      <button
                        type="button"
                        onClick={cancelProjectEditing}
                        disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    )}
                    {projectForm.slug && (
                      <a
                        href={
                          projectForm.memberId
                            ? `/team/${team.items.find((member) => member.id === projectForm.memberId)?.slug}/projects/${projectForm.slug}`
                            : `/portfolio/${projectForm.slug}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-brand-primary/40 hover:text-white"
                      >
                        Live Preview <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </form>
                <AdminTable
                  items={projects.items}
                  search={search}
                  filter={filter}
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'status', label: 'Status' },
                  ]}
                  onEdit={(item) => {
                    setProjectForm(item);
                    setContributorText(serializeContributors(item));
                    setEditingProjectId(item.id);
                  }}
                  onDelete={(item) => deleteItem('projects', item)}
                  onReorder={(item, order) => reorderItem('projects', item, order)}
                />
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-8 xl:grid-cols-[480px_1fr]">
                <form onSubmit={saveTeam} className="h-fit space-y-6 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Users className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase text-white">
                        {userRole === 'team_member' ? 'My Profile' : editingTeamId ? 'Edit Member' : 'New Member'}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/40">Professional profile & credentials</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Full Name *</span>
                        <input
                          required
                          value={teamForm.name || ''}
                          onChange={(event) =>
                            setTeamForm({
                              ...teamForm,
                              name: event.target.value,
                              slug: editingTeamId ? teamForm.slug : slugify(event.target.value),
                            })
                          }
                          className={fieldClass}
                          placeholder="e.g. Wajid Hussain"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>Profile Slug *</span>
                        <input
                          required
                          value={teamForm.slug || ''}
                          onChange={(event) => setTeamForm({ ...teamForm, slug: slugify(event.target.value) })}
                          className={fieldClass}
                          placeholder="wajid-hussain"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Professional Role *</span>
                        <input
                          required
                          value={teamForm.role || ''}
                          onChange={(event) => setTeamForm({ ...teamForm, role: event.target.value })}
                          className={fieldClass}
                          placeholder="Full Stack Lead"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>Specialization</span>
                        <input
                          value={teamForm.specialization || ''}
                          onChange={(event) => setTeamForm({ ...teamForm, specialization: event.target.value })}
                          className={fieldClass}
                          placeholder="Web & AI Systems"
                        />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Personal Tagline</span>
                      <input
                        value={teamForm.tagline || ''}
                        onChange={(event) => setTeamForm({ ...teamForm, tagline: event.target.value })}
                        className={fieldClass}
                        placeholder="Crafting resilient web architectures..."
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Short Bio (SEO & Cards) *</span>
                      <textarea
                        required
                        maxLength={500}
                        rows={3}
                        value={teamForm.bio || ''}
                        onChange={(event) => setTeamForm({ ...teamForm, bio: event.target.value })}
                        className={fieldClass}
                        placeholder="Concise bio for team cards and metadata..."
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Full Professional Background</span>
                      <textarea
                        rows={5}
                        value={teamForm.fullBio || ''}
                        onChange={(event) => setTeamForm({ ...teamForm, fullBio: event.target.value })}
                        className={fieldClass}
                        placeholder="Detailed background, philosophy, and expertise..."
                      />
                    </label>
                  </div>

                  {/* Profile Media Section */}
                  <details open className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Profile Media & Accent
                    </summary>
                    <div className="mt-5 space-y-5 border-t border-white/[0.06] pt-4">
                      <div className="space-y-2">
                        <span className={labelClass}>Avatar Picture</span>
                        {teamForm.avatar && (
                          <div className="flex items-center gap-4">
                            <img
                              src={teamForm.avatar}
                              alt="Profile preview"
                              className="aspect-square h-20 w-20 rounded-2xl border border-white/10 object-cover"
                            />
                          </div>
                        )}
                        <input
                          required
                          value={teamForm.avatar || ''}
                          onChange={(event) =>
                            setTeamForm((current) => ({ ...current, avatar: event.target.value, avatarMediaId: null }))
                          }
                          className={fieldClass}
                          placeholder="Avatar URL or upload below"
                        />
                        <MediaUploadButton
                          label="Upload Profile Photo"
                          square
                          disabled={mediaUploadsInProgress > 0}
                          onUploadingChange={handleMediaUploadingChange}
                          onUpload={([upload]) =>
                            setTeamForm((current) => ({ ...current, avatar: upload.url, avatarMediaId: upload.id }))
                          }
                        />
                      </div>

                      <div className="space-y-2 border-t border-white/[0.06] pt-4">
                        <span className={labelClass}>Cover Hero Image</span>
                        {teamForm.coverImage && (
                          <img
                            src={teamForm.coverImage}
                            alt="Cover preview"
                            className="aspect-[16/7] w-full rounded-2xl border border-white/10 object-cover"
                          />
                        )}
                        <input
                          value={teamForm.coverImage || ''}
                          onChange={(event) =>
                            setTeamForm((current) => ({ ...current, coverImage: event.target.value, coverMediaId: null }))
                          }
                          className={fieldClass}
                          placeholder="Optional cover hero URL"
                        />
                        <MediaUploadButton
                          label="Upload Cover Image"
                          disabled={mediaUploadsInProgress > 0}
                          onUploadingChange={handleMediaUploadingChange}
                          onUpload={([upload]) =>
                            setTeamForm((current) => ({ ...current, coverImage: upload.url, coverMediaId: upload.id }))
                          }
                        />
                      </div>

                      <div className="flex items-center gap-4 border-t border-white/[0.06] pt-4">
                        <input
                          type="color"
                          value={teamForm.accentColor || '#3D5AFE'}
                          onChange={(event) => setTeamForm({ ...teamForm, accentColor: event.target.value })}
                          className="h-10 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                          aria-label="Portfolio accent color"
                        />
                        <div>
                          <span className={labelClass}>Portfolio Theme Accent</span>
                          <p className="text-xs text-white/40">{teamForm.accentColor || '#3D5AFE'}</p>
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Professional Details */}
                  <details className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Contact & Credentials
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className={labelClass}>Email Address</span>
                          <input
                            type="email"
                            value={teamForm.email || ''}
                            onChange={(event) => setTeamForm({ ...teamForm, email: event.target.value })}
                            className={fieldClass}
                            placeholder="name@lbdevelopers.com"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className={labelClass}>Location</span>
                          <input
                            value={teamForm.location || ''}
                            onChange={(event) => setTeamForm({ ...teamForm, location: event.target.value })}
                            className={fieldClass}
                            placeholder="Islamabad, PK"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className={labelClass}>Availability</span>
                          <input
                            value={teamForm.availability || ''}
                            onChange={(event) => setTeamForm({ ...teamForm, availability: event.target.value })}
                            className={fieldClass}
                            placeholder="Available for projects"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className={labelClass}>Years Experience</span>
                          <input
                            value={teamForm.yearsExperience || ''}
                            onChange={(event) => setTeamForm({ ...teamForm, yearsExperience: event.target.value })}
                            className={fieldClass}
                            placeholder="5+ Years"
                          />
                        </label>
                      </div>

                      <label className="space-y-2 block">
                        <span className={labelClass}>Languages</span>
                        <input
                          value={(teamForm.languages || []).join(', ')}
                          onChange={(event) => setTeamForm({ ...teamForm, languages: tagsFromString(event.target.value) })}
                          className={fieldClass}
                          placeholder="English, Urdu"
                        />
                      </label>

                      <div className="space-y-2">
                        <span className={labelClass}>Curriculum Vitae (PDF)</span>
                        <input
                          value={teamForm.cvUrl || ''}
                          onChange={(event) =>
                            setTeamForm((current) => ({ ...current, cvUrl: event.target.value, cvMediaId: null }))
                          }
                          className={fieldClass}
                          placeholder="CV URL or upload PDF below"
                        />
                        <MediaUploadButton
                          label="Upload CV PDF"
                          kind="pdf"
                          disabled={mediaUploadsInProgress > 0}
                          onUploadingChange={handleMediaUploadingChange}
                          onUpload={([upload]) =>
                            setTeamForm((current) => ({ ...current, cvUrl: upload.url, cvMediaId: upload.id }))
                          }
                        />
                      </div>
                    </div>
                  </details>

                  {/* Skills Section */}
                  <details className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Categorized Skills
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-4">
                      <label className="space-y-2 block">
                        <span className={labelClass}>Key Profile Card Skills</span>
                        <input
                          value={(teamForm.skills || []).join(', ')}
                          onChange={(event) => setTeamForm({ ...teamForm, skills: tagsFromString(event.target.value) })}
                          className={fieldClass}
                          placeholder="React, TypeScript, Node.js, UI/UX"
                        />
                      </label>
                      <label className="space-y-2 block">
                        <span className={labelClass}>Grouped Skills (Category: item, item)</span>
                        <textarea
                          rows={4}
                          value={teamText.skills}
                          onChange={(event) => setTeamText({ ...teamText, skills: event.target.value })}
                          className={fieldClass}
                          placeholder={'Frontend: React, Next.js, TailwindCSS\nBackend: Node.js, Express, PostgreSQL'}
                        />
                      </label>
                    </div>
                  </details>

                  {/* Experience and Certifications */}
                  <details className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Career History & Certifications
                    </summary>
                    <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-4">
                      <label className="space-y-2 block">
                        <span className={labelClass}>Experience</span>
                        <textarea
                          rows={4}
                          value={teamText.experience}
                          onChange={(event) => setTeamText({ ...teamText, experience: event.target.value })}
                          className={fieldClass}
                          placeholder="Company | Position | Start | End/Present | Description | Tools | Responsibilities | Achievements"
                        />
                      </label>
                      <label className="space-y-2 block">
                        <span className={labelClass}>Education</span>
                        <textarea
                          rows={4}
                          value={teamText.education}
                          onChange={(event) => setTeamText({ ...teamText, education: event.target.value })}
                          className={fieldClass}
                          placeholder="Institution | Degree | Field | Start | End | Description | Achievements"
                        />
                      </label>
                      <label className="space-y-2 block">
                        <span className={labelClass}>Certifications</span>
                        <textarea
                          rows={4}
                          value={teamText.certifications}
                          onChange={(event) => setTeamText({ ...teamText, certifications: event.target.value })}
                          className={fieldClass}
                          placeholder="Title | Organization | Type | Issue date | Credential URL | Credential ID | Image URL"
                        />
                      </label>
                    </div>
                  </details>

                  {/* Social Links */}
                  <details className="rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition-all">
                    <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
                      Social & Portfolio Links
                    </summary>
                    <div className="mt-5 grid gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2">
                      {(['linkedin', 'github', 'twitter', 'behance', 'dribbble', 'instagram', 'website'] as const).map(
                        (platform) => (
                          <label key={platform} className="space-y-1.5">
                            <span className={labelClass}>{platform}</span>
                            <input
                              value={teamForm.socialLinks?.[platform] || ''}
                              onChange={(event) =>
                                setTeamForm({
                                  ...teamForm,
                                  socialLinks: { ...teamForm.socialLinks, [platform]: event.target.value },
                                })
                              }
                              className={fieldClass}
                              placeholder={`https://${platform}.com/...`}
                            />
                          </label>
                        )
                      )}
                    </div>
                  </details>

                  {userRole !== 'team_member' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Display Order</span>
                        <input
                          type="number"
                          value={teamForm.displayOrder || 1}
                          onChange={(event) => setTeamForm({ ...teamForm, displayOrder: Number(event.target.value) })}
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={Boolean(teamForm.active)}
                          onChange={(event) => setTeamForm({ ...teamForm, active: event.target.checked })}
                          className="h-4 w-4 rounded accent-brand-primary"
                        />
                        <span className="font-semibold text-white">Active Profile</span>
                      </label>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
                    <Button
                      disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                      className="flex-1 shadow-[0_0_24px_rgba(61,90,254,0.35)] disabled:cursor-wait disabled:opacity-50"
                    >
                      {operation === 'team-save' || mediaUploadsInProgress > 0 ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {mediaUploadsInProgress > 0
                        ? 'Uploading Media...'
                        : operation === 'team-save'
                        ? 'Saving Member...'
                        : 'Save Member'}
                    </Button>
                    {editingTeamId && userRole !== 'team_member' && (
                      <button
                        type="button"
                        onClick={cancelTeamEditing}
                        disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    )}
                    {teamForm.slug && (
                      <a
                        href={`/team/${teamForm.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-brand-primary/40 hover:text-white"
                      >
                        Live Profile <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </form>

                <AdminTable
                  items={team.items}
                  search={search}
                  filter={filter}
                  image={(member) => member.avatar}
                  imageLabel="Picture"
                  imageVariant="avatar"
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'active', label: 'Status', render: (item) => (item.active ? 'Active' : 'Hidden') },
                  ]}
                  onEdit={(item) => {
                    setTeamForm(item);
                    setTeamText(structuredTeamText(item));
                    setEditingTeamId(item.id);
                  }}
                  onDelete={userRole === 'team_member' ? undefined : (item) => deleteItem('team', item)}
                  onReorder={userRole === 'team_member' ? undefined : (item, order) => reorderItem('team', item, order)}
                />
              </motion.div>
            )}

            {activeTab === 'blog' && (
              <motion.div key="blog" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid gap-8 xl:grid-cols-[480px_1fr]">
                <form onSubmit={saveBlog} className="h-fit space-y-6 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Newspaper className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-black uppercase text-white">
                        {editingBlogId ? 'Edit Article' : 'New Article'}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/40">Editorial and insights publishing</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Article Title *</span>
                        <input
                          required
                          value={blogForm.title || ''}
                          onChange={(event) =>
                            setBlogForm({
                              ...blogForm,
                              title: event.target.value,
                              slug: editingBlogId ? blogForm.slug : slugify(event.target.value),
                            })
                          }
                          className={fieldClass}
                          placeholder="e.g. Future of Next.js Architecture"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>Slug *</span>
                        <input
                          required
                          value={blogForm.slug || ''}
                          onChange={(event) => setBlogForm({ ...blogForm, slug: slugify(event.target.value) })}
                          className={fieldClass}
                          placeholder="future-of-nextjs-architecture"
                        />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Article Excerpt (Max 200)</span>
                      <textarea
                        maxLength={200}
                        rows={3}
                        value={blogForm.excerpt || ''}
                        onChange={(event) => setBlogForm({ ...blogForm, excerpt: event.target.value })}
                        className={fieldClass}
                        placeholder="Brief summary for blog cards and social sharing..."
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Full Article Content</span>
                      <RichTextEditor
                        value={blogForm.content || ''}
                        onChange={(value) => setBlogForm({ ...blogForm, content: value })}
                      />
                    </label>

                    <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                      <span className={labelClass}>Article Cover Image</span>
                      {blogForm.coverImage && (
                        <img
                          src={blogForm.coverImage}
                          alt="Blog cover preview"
                          className="aspect-[16/10] w-full rounded-2xl border border-white/10 object-cover"
                        />
                      )}
                      <input
                        value={blogForm.coverImage || ''}
                        onChange={(event) =>
                          setBlogForm((current) => ({ ...current, coverImage: event.target.value, coverMediaId: null }))
                        }
                        className={fieldClass}
                        placeholder="Cover image URL or upload below"
                      />
                      <MediaUploadButton
                        label="Upload Cover Image"
                        disabled={mediaUploadsInProgress > 0}
                        onUploadingChange={handleMediaUploadingChange}
                        onUpload={([upload]) =>
                          setBlogForm((current) => ({ ...current, coverImage: upload.url, coverMediaId: upload.id }))
                        }
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Category</span>
                        <input
                          required
                          value={blogForm.category || ''}
                          onChange={(event) => setBlogForm({ ...blogForm, category: event.target.value })}
                          className={fieldClass}
                          placeholder="Development, AI, Design"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>Publishing Status</span>
                        <select
                          value={blogForm.status || 'draft'}
                          onChange={(event) => setBlogForm({ ...blogForm, status: event.target.value as BlogStatus })}
                          className={fieldClass}
                        >
                          {blogStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className={labelClass}>Author</span>
                        <select
                          value={blogForm.author || 'Wajid Hussain'}
                          onChange={(event) => setBlogForm({ ...blogForm, author: event.target.value })}
                          className={fieldClass}
                        >
                          {team.items.map((member) => (
                            <option key={member.id} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                          {team.items.length === 0 && <option>Wajid Hussain</option>}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className={labelClass}>Publication Date</span>
                        <input
                          type="datetime-local"
                          value={(blogForm.publishedAt || '').slice(0, 16)}
                          onChange={(event) => setBlogForm({ ...blogForm, publishedAt: event.target.value })}
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Tags (Comma separated)</span>
                      <input
                        value={(blogForm.tags || []).join(', ')}
                        onChange={(event) => setBlogForm({ ...blogForm, tags: tagsFromString(event.target.value) })}
                        className={fieldClass}
                        placeholder="Next.js, TypeScript, Architecture"
                      />
                    </label>

                    <label className="space-y-2 block">
                      <span className={labelClass}>Canonical / External URL</span>
                      <input
                        value={blogForm.liveUrl || ''}
                        onChange={(event) => setBlogForm({ ...blogForm, liveUrl: event.target.value })}
                        className={fieldClass}
                        placeholder="https://..."
                      />
                    </label>

                    <div className="space-y-4 border-t border-white/[0.08] pt-5">
                      <label className="space-y-2 block">
                        <span className={labelClass}>SEO Meta Title</span>
                        <input
                          value={blogForm.metaTitle || ''}
                          onChange={(event) => setBlogForm({ ...blogForm, metaTitle: event.target.value })}
                          className={fieldClass}
                          placeholder="SEO title..."
                        />
                      </label>
                      <label className="space-y-2 block">
                        <span className={labelClass}>SEO Meta Description</span>
                        <textarea
                          rows={2}
                          value={blogForm.metaDescription || ''}
                          onChange={(event) => setBlogForm({ ...blogForm, metaDescription: event.target.value })}
                          className={fieldClass}
                          placeholder="SEO snippet description..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
                    <Button
                      disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                      className="flex-1 shadow-[0_0_24px_rgba(61,90,254,0.35)] disabled:cursor-wait disabled:opacity-50"
                    >
                      {operation === 'blog-save' || mediaUploadsInProgress > 0 ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {mediaUploadsInProgress > 0
                        ? 'Uploading Media...'
                        : operation === 'blog-save'
                        ? 'Saving Article...'
                        : 'Save Article'}
                    </Button>
                    {editingBlogId && (
                      <button
                        type="button"
                        onClick={cancelBlogEditing}
                        disabled={Boolean(operation) || mediaUploadsInProgress > 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    )}
                    {blogForm.slug && (
                      <a
                        href={`/blog/${blogForm.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:border-brand-primary/40 hover:text-white"
                      >
                        Live Preview <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </form>

                <AdminTable
                  items={blog.items}
                  search={search}
                  filter={filter}
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'status', label: 'Status' },
                  ]}
                  onEdit={(item) => {
                    setBlogForm({ ...item, publishedAt: (item.publishedAt || '').slice(0, 16) });
                    setEditingBlogId(item.id);
                  }}
                  onDelete={(item) => deleteItem('blog', item)}
                />
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                <div className="flex flex-col gap-5 rounded-3xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 via-[#0d0e17]/90 to-[#08080c] p-6 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary shadow-[0_0_24px_rgba(61,90,254,0.3)]">
                      <Mail className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Official Client Routing & Response Channel</p>
                      <div className="mt-1 flex items-center gap-3">
                        <a href={`mailto:${AGENCY_EMAIL}`} className="truncate text-base font-bold text-white transition-colors hover:text-brand-primary">
                          {AGENCY_EMAIL}
                        </a>
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Gmail Connected
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={officialGmailInboxHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-brand-primary shadow-md transition hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <Mail className="h-4 w-4" /> Open Web Gmail <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <p className="text-xs font-semibold text-white/40">Direct inquiries routed from client contact forms, booking planners, and team profiles.</p>
                  <span className="rounded-lg bg-brand-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">{messages.length} inquiries total</span>
                </div>

                {messages.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.015] p-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/30">No matching inquiries found.</div>
                ) : messages.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase())).map((item) => (
                  <article key={item.id} className="grid gap-6 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/80 p-6 shadow-xl backdrop-blur-xl transition hover:border-white/15 hover:bg-[#10121e] lg:grid-cols-[260px_minmax(0,1fr)_260px]">
                    {/* Left: Sender Details */}
                    <div className="space-y-3 border-b border-white/[0.06] pb-4 lg:border-b-0 lg:pb-0">
                      <div>
                        <h3 className="font-display text-lg font-black text-white">{item.name}</h3>
                        <div className="mt-1.5 flex items-center gap-2">
                          <a href={`mailto:${item.email}`} className="block truncate text-xs font-semibold text-brand-primary hover:underline" title={item.email}>
                            {item.email}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyClientEmail(item.id, item.email)}
                            title="Copy email address"
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/50 transition hover:border-white/20 hover:text-white"
                          >
                            {copiedMessageId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <time className="block text-[10px] text-white/35">Received: {new Date(item.createdAt).toLocaleString()}</time>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Routing: </span>
                          {item.memberName ? (
                            item.memberSlug ? (
                              <a href={`/team/${item.memberSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-brand-primary">
                                {item.memberName} <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs font-bold text-white">{item.memberName}</span>
                            )
                          ) : (
                            <span className="text-xs text-white/45">General Agency</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center: Message Body */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">Subject</span>
                        <h4 className="text-sm font-bold text-white">{item.subject}</h4>
                      </div>
                      <div className="rounded-2xl border border-white/[0.04] bg-black/30 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">{item.message}</p>
                      </div>
                    </div>

                    {/* Right: Quick Gmail Reachout & Status Actions */}
                    <div className="flex flex-col justify-between gap-4 border-t border-white/[0.06] pt-4 lg:border-t-0 lg:pt-0">
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Reachout Actions</span>
                        
                        {/* Primary Reachout: Gmail Web */}
                        <a
                          href={replyGmailComposeHref(item, 'general')}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-brand-primary/40 bg-brand-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(61,90,254,0.35)] transition hover:bg-brand-primary/90"
                          aria-label={`Reply to ${item.name} in Gmail`}
                        >
                          <Send className="h-3.5 w-3.5" /> Compose in Gmail
                        </a>

                        {/* Preset Quick Actions */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <a
                            href={replyGmailComposeHref(item, 'proposal')}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-[9px] font-bold uppercase tracking-wider text-white/70 transition hover:border-white/20 hover:text-white"
                            title="Open Gmail with structured proposal discovery template"
                          >
                            Proposal Draft
                          </a>
                          <a
                            href={replyGmailComposeHref(item, 'meeting')}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-2 text-[9px] font-bold uppercase tracking-wider text-white/70 transition hover:border-white/20 hover:text-white"
                            title="Open Gmail with meeting scheduling template"
                          >
                            Schedule Call
                          </a>
                        </div>
                        
                        {/* Default Mail Client Fallback */}
                        <a
                          href={replyMailtoHref(item, 'general')}
                          className="inline-flex w-full items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/35 transition hover:text-white/70"
                        >
                          <Mail className="h-3 w-3" /> Or open default mail app
                        </a>
                      </div>

                      <div className="space-y-1.5 border-t border-white/[0.06] pt-3">
                        <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Workflow Status</span>
                        <select
                          aria-label={`Status for message from ${item.name}`}
                          value={item.status}
                          onChange={async (event) => {
                            const status = event.target.value as ContactMessage['status'];
                            const previousStatus = item.status;
                            setMessages((current) => current.map((message) => message.id === item.id ? { ...message, status } : message));
                            const saved = await performOperation('message-status', 'Inquiry status updated.', async () => {
                              await fetchJson(`/api/v2/admin/messages/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
                            });
                            if (!saved) setMessages((current) => current.map((message) => message.id === item.id ? { ...message, status: previousStatus } : message));
                          }}
                          disabled={Boolean(operation)}
                          className={cn(fieldClass, 'py-2 text-xs font-semibold disabled:opacity-45')}
                        >
                          {(['new', 'read', 'replied', 'archived', 'spam'] as const).map((status) => <option key={status} value={status}>{status.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            )}

            {activeTab === 'catalog' && <motion.div key="catalog" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><ContentManager /></motion.div>}
            {activeTab === 'media' && <motion.div key="media" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><MediaManager /></motion.div>}
            {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><SettingsManager /></motion.div>}
            {activeTab === 'accounts' && <motion.div key="accounts" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><AccountManager /></motion.div>}
          </AnimatePresence>

          <ConfirmModal
            isOpen={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            onConfirm={confirmDeleteItem}
            title={deleteTarget ? `Archive ${deleteTarget.resource.slice(0, -1)}` : 'Archive Item'}
            message={`Are you sure you want to archive "${deleteTarget?.item.title || deleteTarget?.item.name || 'this item'}"? It will no longer be visible on the public website.`}
            confirmText="Archive Record"
            tone="danger"
          />

          <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col items-end gap-2.5 sm:bottom-6 sm:right-6">
            <AnimatePresence>
              {(operation || projects.loading || team.loading || blog.loading) && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="flex items-center gap-3 rounded-2xl border border-brand-primary/30 bg-[#0d0e17]/95 px-4 py-3 text-xs font-semibold text-white shadow-[0_16px_48px_rgba(0,0,0,0.7),0_0_24px_rgba(61,90,254,0.15)] backdrop-blur-2xl"
                >
                  <LoaderCircle className="h-4 w-4 animate-spin text-brand-primary" aria-hidden="true" />
                  {operation ? 'Applying changes...' : 'Syncing workspace...'}
                </motion.div>
              )}
              {notice && (
                <motion.div
                  key={notice.message}
                  role="status"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className={cn(
                    'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl',
                    notice.tone === 'success'
                      ? 'border-emerald-400/30 bg-[#0a1410]/95 text-emerald-100'
                      : 'border-red-400/30 bg-[#160d0f]/95 text-red-100'
                  )}
                >
                  {notice.tone === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <span className="min-w-0 flex-1 leading-relaxed text-xs sm:text-sm">{notice.message}</span>
                  <button
                    type="button"
                    onClick={() => setNotice(null)}
                    className="rounded-lg p-1 text-current/50 transition hover:bg-white/10 hover:text-current"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
              {(projects.error || team.error || blog.error) && !notice && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-[#160d0f]/95 px-4 py-3 text-xs font-semibold text-red-100 shadow-2xl backdrop-blur-2xl"
                >
                  <CircleAlert className="h-4 w-4 text-red-400" /> Workspace sync failed
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
