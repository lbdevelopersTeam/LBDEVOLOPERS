import { useState, useRef, useEffect } from 'react';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Printer,
  Quote,
  Share2,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { MemberProfile, initials, socialPlatforms, usableLink } from './shared';
import MemberPortrait from '../MemberPortrait';
import { cn } from '../../../lib/utils';

interface MemberCvViewProps {
  member: MemberProfile;
  isModal?: boolean;
  onClose?: () => void;
}

export default function MemberCvView({ member, isModal = false, onClose }: MemberCvViewProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopyEmail = async () => {
    if (!member.email) return;
    try {
      await navigator.clipboard.writeText(member.email);
      setCopiedEmail(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      setCopiedEmail(false);
    }
  };

  const handleCopyCvLink = async () => {
    const cvUrl = `${window.location.origin}/team/${member.slug}/cv`;
    try {
      await navigator.clipboard.writeText(cvUrl);
      setCopiedLink(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasExperience = Boolean(member.experience?.length);
  const hasEducation = Boolean(member.education?.length);
  const hasCertifications = Boolean(member.certifications?.length);
  const hasSkillGroups = Boolean(member.skillGroups?.length);
  const hasProjects = Boolean(member.projects?.length);
  const hasTestimonials = Boolean(member.testimonials?.length);
  const hasLanguages = Boolean(member.languages?.length);

  const primaryAccent = 'var(--member-accent, #3D5AFE)';

  return (
    <div
      className={cn(
        'cv-document-container relative w-full text-white',
        isModal ? 'max-w-5xl mx-auto' : 'max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8'
      )}
    >
      {/* Printable CSS style sheet override for crisp PDF print outs */}
      <style>{`
        @media print {
          @page {
            margin: 12mm;
            size: A4 portrait;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide Web UI overlays, headers, floating buttons */
          .print\\:hidden,
          nav,
          footer,
          .whatsapp-button,
          .floating-shapes,
          header.print\\:hidden,
          button:not(.cv-print-keep) {
            display: none !important;
          }
          .cv-document-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
            color: #0f172a !important;
          }
          .cv-paper-surface {
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            color: #0f172a !important;
            padding: 0 !important;
          }
          .cv-text-muted {
            color: #475569 !important;
          }
          .cv-text-subtle {
            color: #64748b !important;
          }
          .cv-text-heading {
            color: #0f172a !important;
          }
          .cv-badge {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
          }
          .cv-accent-text {
            color: #1e40af !important;
          }
          .cv-accent-bg {
            background-color: #eff6ff !important;
            border-color: #93c5fd !important;
            color: #1e40af !important;
          }
          .cv-glass-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            color: #0f172a !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .cv-timeline-line {
            background-color: #cbd5e1 !important;
          }
          .cv-print-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Control Action Toolbar (Hidden in print) */}
      <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" style={{ color: primaryAccent }} />
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-white">
              Curriculum Vitae
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
              {member.name} — {member.role}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--member-accent)] px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition-transform hover:scale-105 shadow-lg"
            title="Print or Save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCvLink}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:border-white/20 hover:text-white transition-colors"
            title="Copy Direct Share Link"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-white/50" />
                <span>Share Link</span>
              </>
            )}
          </button>

          {member.email && (
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:border-white/20 hover:text-white transition-colors"
              title="Copy Email Address"
            >
              {copiedEmail ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-white/50" />
                  <span>Copy Email</span>
                </>
              )}
            </button>
          )}

          <a
            href={`/api/v2/team/${member.slug}/vcard`}
            download={`${member.slug}.vcf`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:border-white/20 hover:text-white transition-colors"
            title="Download vCard (.vcf)"
          >
            <Download className="h-4 w-4 text-white/50" />
            <span>vCard</span>
          </a>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white transition-colors"
              aria-label="Close CV Modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN CV PAPER SURFACE */}
      <div className="cv-paper-surface member-glass relative rounded-3xl border border-white/10 bg-[#0c0c0e]/95 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-2xl">
        {/* Decorative Top Accent Bar */}
        <div
          className="absolute inset-x-0 top-0 h-2.5 rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, ${primaryAccent} 0%, color-mix(in srgb, ${primaryAccent} 40%, #000) 100%)`,
          }}
        />

        {/* HEADER SECTION */}
        <header className="border-b border-white/10 pb-8 pt-2">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: Avatar + Title block */}
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {member.avatar ? (
                <div className="relative shrink-0">
                  <MemberPortrait
                    src={member.avatar}
                    alt={member.name}
                    sizes="110px"
                    className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/15 sm:h-28 sm:w-28 shadow-xl"
                  />
                  <div
                    className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-black text-[10px] font-black text-white shadow-lg"
                    aria-hidden="true"
                  >
                    {initials(member.name)}
                  </div>
                </div>
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-black sm:h-28 sm:w-28 shadow-xl"
                  style={{ backgroundColor: primaryAccent }}
                >
                  {initials(member.name)}
                </div>
              )}

              <div className="space-y-2">
                {/* Availability status badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="cv-accent-bg inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {member.availability || 'Available for Engagements'}
                  </span>

                  <span className="cv-badge inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white/50">
                    <UserCheck className="h-3 w-3 text-white/40" />
                    Verified Practitioner
                  </span>
                </div>

                <h1 className="cv-text-heading font-display text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                  {member.name}
                </h1>

                <p
                  className="cv-accent-text font-display text-base font-black uppercase tracking-wide sm:text-lg"
                  style={{ color: primaryAccent }}
                >
                  {member.role}
                </p>

                {member.tagline && (
                  <p className="cv-text-muted max-w-xl text-xs leading-relaxed text-white/65 sm:text-sm">
                    {member.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Highlights Badges */}
            <div className="flex flex-row md:flex-col flex-wrap gap-2.5 shrink-0">
              <div className="cv-glass-card rounded-xl border border-white/10 bg-white/[0.03] p-3 text-right">
                <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-white/35">
                  Experience Record
                </span>
                <span className="mt-0.5 block font-display text-base font-black text-white">
                  {member.yearsExperience || `${member.experience?.length || 4}+ Years`}
                </span>
              </div>

              {member.location && (
                <div className="cv-glass-card rounded-xl border border-white/10 bg-white/[0.03] p-3 text-right">
                  <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-white/35">
                    Location Base
                  </span>
                  <span className="mt-0.5 block font-display text-xs font-black uppercase text-white/80">
                    {member.location}
                  </span>
                </div>
              )}

              <div className="cv-glass-card rounded-xl border border-white/10 bg-white/[0.03] p-3 text-right">
                <span className="block text-[8px] font-black uppercase tracking-[0.16em] text-white/35">
                  Affiliation
                </span>
                <span
                  className="mt-0.5 block font-display text-xs font-black uppercase"
                  style={{ color: primaryAccent }}
                >
                  LB CodeBase Team
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-white/8 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="cv-glass-card flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/75 transition-colors hover:border-white/20 hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0" style={{ color: primaryAccent }} />
                <span className="truncate font-medium">{member.email}</span>
              </a>
            )}

            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="cv-glass-card flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/75 transition-colors hover:border-white/20 hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" style={{ color: primaryAccent }} />
                <span className="truncate font-medium">{member.phone}</span>
              </a>
            )}

            {member.location && (
              <div className="cv-glass-card flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/75">
                <MapPin className="h-4 w-4 shrink-0" style={{ color: primaryAccent }} />
                <span className="truncate font-medium">{member.location}</span>
              </div>
            )}

            <a
              href={`${window.location.origin}/team/${member.slug}`}
              target="_blank"
              rel="noreferrer"
              className="cv-glass-card flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs text-white/75 transition-colors hover:border-white/20 hover:text-white"
            >
              <Globe className="h-4 w-4 shrink-0" style={{ color: primaryAccent }} />
              <span className="truncate font-medium">Interactive Portfolio</span>
            </a>
          </div>

          {/* Social Links Row */}
          {socialPlatforms.some(({ key }) => usableLink(member.socialLinks[key])) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
              <span className="mr-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/35">
                Verified Handles
              </span>
              {socialPlatforms.map(
                ({ key, label, icon: Icon }) =>
                  usableLink(member.socialLinks[key]) && (
                    <a
                      key={key}
                      href={member.socialLinks[key]}
                      target="_blank"
                      rel="noreferrer"
                      className="cv-glass-card inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </a>
                  )
              )}
            </div>
          )}
        </header>

        {/* BODY CONTENT SECTIONS */}
        <div className="mt-8 space-y-10">
          {/* Executive Summary / Full Bio */}
          <section className="cv-print-break-avoid">
            <h2 className="cv-text-heading mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
              <Sparkles className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
              Executive Profile Summary
            </h2>
            <div className="cv-glass-card rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <p className="cv-text-muted text-sm leading-relaxed text-white/80 sm:text-base sm:leading-relaxed">
                {member.fullBio || member.bio}
              </p>
              {member.specialization && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-3.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                    Core Specialization:
                  </span>
                  <span
                    className="cv-accent-bg rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--member-accent) 40%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--member-accent) 12%, transparent)',
                      color: primaryAccent,
                    }}
                  >
                    {member.specialization}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Technical Skills & Competencies */}
          <section className="cv-print-break-avoid">
            <h2 className="cv-text-heading mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
              <Award className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
              Technical Capabilities & Expertise
            </h2>

            {hasSkillGroups ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {member.skillGroups!.map((group, idx) => (
                  <div
                    key={idx}
                    className="cv-glass-card flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <div>
                      <h3
                        className="cv-accent-text font-display text-xs font-black uppercase tracking-wider"
                        style={{ color: primaryAccent }}
                      >
                        {group.category}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {group.skills.map((skill) => (
                          <span
                            key={skill}
                            className="cv-badge rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cv-glass-card rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span
                      key={skill}
                      className="cv-badge rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/75"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Professional Work Experience */}
          {hasExperience && (
            <section>
              <h2 className="cv-text-heading mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                <Briefcase className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                Professional Work Experience
              </h2>

              <div className="relative space-y-6">
                {member.experience!.map((item, index) => (
                  <article
                    key={item.id || index}
                    className="cv-glass-card cv-print-break-avoid relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="cv-text-heading font-display text-lg font-black uppercase text-white sm:text-xl">
                            {item.position}
                          </h3>
                          {item.current && (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-400">
                              Current Role
                            </span>
                          )}
                        </div>

                        <p
                          className="cv-accent-text mt-1 text-sm font-bold tracking-wide"
                          style={{ color: primaryAccent }}
                        >
                          {item.company}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/60 shrink-0 self-start">
                        <Calendar className="h-3 w-3 text-white/40" />
                        <span>
                          {item.startDate} — {item.current ? 'Present' : item.endDate || 'Present'}
                        </span>
                      </div>
                    </div>

                    {/* Overview description */}
                    {item.description && (
                      <p className="cv-text-muted mt-4 text-xs leading-relaxed text-white/65 sm:text-sm">
                        {item.description}
                      </p>
                    )}

                    {/* Responsibilities & Impact Grid */}
                    <div className="mt-5 grid gap-6 lg:grid-cols-2 border-t border-white/8 pt-4">
                      {Boolean(item.responsibilities?.length) && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35 mb-2">
                            Key Responsibilities & Deliverables
                          </p>
                          <ul className="space-y-1.5">
                            {item.responsibilities!.map((resp, i) => (
                              <li
                                key={i}
                                className="cv-text-muted flex items-start gap-2 text-xs leading-relaxed text-white/70"
                              >
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Boolean(item.achievements?.length) && (
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/35 mb-2">
                            Quantifiable Impact
                          </p>
                          <ul className="space-y-2">
                            {item.achievements!.map((ach, i) => (
                              <li
                                key={i}
                                className="cv-accent-bg flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs leading-relaxed text-white/80"
                              >
                                <CheckCircle2
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                  style={{ color: primaryAccent }}
                                />
                                <span>{ach}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Tech Badges */}
                    {Boolean(item.technologies?.length) && (
                      <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/8 pt-3.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/35 mr-1">
                          Stack:
                        </span>
                        {item.technologies!.map((tech) => (
                          <span
                            key={tech}
                            className="cv-badge rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Key Contributed Projects / Portfolio Highlights */}
          {hasProjects && (
            <section className="cv-print-break-avoid">
              <h2 className="cv-text-heading mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                <Building2 className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                Featured Project Contributions
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {member.projects.slice(0, 4).map((project) => (
                  <div
                    key={project.id}
                    className="cv-glass-card flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="cv-text-heading font-display text-base font-black uppercase text-white">
                          {project.title}
                        </h3>
                        <span className="cv-badge shrink-0 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/50">
                          {project.category}
                        </span>
                      </div>

                      <p className="cv-text-muted mt-2 text-xs leading-relaxed text-white/60 line-clamp-2">
                        {project.shortDescription}
                      </p>

                      {Boolean(project.technologies?.length) && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="cv-badge rounded px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white/45 bg-white/[0.03] border border-white/5"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {usableLink(project.liveUrl) && (
                      <div className="mt-4 pt-3 border-t border-white/8">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-colors hover:text-white"
                          style={{ color: primaryAccent }}
                        >
                          <span>Live Deployment Case</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic Foundations & Certifications */}
          {(hasEducation || hasCertifications) && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Education */}
              {hasEducation && (
                <section className="cv-print-break-avoid">
                  <h2 className="cv-text-heading mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                    <GraduationCap className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                    Academic Background
                  </h2>

                  <div className="space-y-4">
                    {member.education!.map((edu) => (
                      <div
                        key={edu.id}
                        className="cv-glass-card rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                      >
                        <h3 className="cv-text-heading font-display text-base font-black uppercase text-white">
                          {edu.degree} {edu.field ? `— ${edu.field}` : ''}
                        </h3>
                        <p
                          className="cv-accent-text mt-1 text-xs font-bold"
                          style={{ color: primaryAccent }}
                        >
                          {edu.institution}
                        </p>
                        {edu.description && (
                          <p className="cv-text-muted mt-2 text-xs leading-relaxed text-white/55">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {hasCertifications && (
                <section className="cv-print-break-avoid">
                  <h2 className="cv-text-heading mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                    <Award className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                    Verified Certifications
                  </h2>

                  <div className="space-y-4">
                    {member.certifications!.map((cert) => (
                      <div
                        key={cert.id}
                        className="cv-glass-card rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="cv-text-heading font-display text-base font-black uppercase text-white">
                              {cert.title}
                            </h3>
                            <p
                              className="cv-accent-text mt-0.5 text-xs font-bold"
                              style={{ color: primaryAccent }}
                            >
                              {cert.organization}
                            </p>
                          </div>
                          {cert.issueDate && (
                            <span className="cv-badge shrink-0 rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white/50">
                              {cert.issueDate}
                            </span>
                          )}
                        </div>

                        {cert.credentialId && (
                          <p className="cv-text-subtle mt-2 text-[9px] font-bold uppercase tracking-wider text-white/40">
                            Credential ID: {cert.credentialId}
                          </p>
                        )}

                        {usableLink(cert.credentialUrl) && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider hover:text-white"
                            style={{ color: primaryAccent }}
                          >
                            <span>Verify Credential</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Languages & Methodologies */}
          {hasLanguages && (
            <section className="cv-print-break-avoid">
              <h2 className="cv-text-heading mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                <Languages className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                Languages & Communication
              </h2>
              <div className="cv-glass-card rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-wrap gap-2">
                  {member.languages!.map((lang) => (
                    <span
                      key={lang}
                      className="cv-badge rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/70"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Testimonials / Endorsements */}
          {hasTestimonials && (
            <section className="cv-print-break-avoid">
              <h2 className="cv-text-heading mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                <Quote className="h-3.5 w-3.5" style={{ color: primaryAccent }} />
                Professional Endorsements
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {member.testimonials!.map((t) => (
                  <div
                    key={t.id}
                    className="cv-glass-card flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <p className="cv-text-muted text-xs italic leading-relaxed text-white/70">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-4 border-t border-white/8 pt-3">
                      <p className="cv-text-heading font-display text-xs font-black uppercase text-white">
                        {t.author}
                      </p>
                      <p className="cv-text-subtle text-[9px] font-bold uppercase tracking-wider text-white/40">
                        {t.role} {t.company ? `— ${t.company}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER VERIFICATION BAR */}
        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-bold uppercase tracking-widest text-white/35">
          <div className="flex items-center gap-2">
            <span className="brand-mark !text-[9px] !h-5 !w-5 !rounded-md">LB</span>
            <span>LB CodeBase Verified Portfolio Document</span>
          </div>

          <div>
            <span>Generated for {member.name}</span>
            <span className="mx-2">•</span>
            <span>https://lbcodebase.com</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
