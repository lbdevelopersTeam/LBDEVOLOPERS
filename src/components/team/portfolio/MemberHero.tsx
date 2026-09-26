import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Check, Copy, Download, Mail, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { HeroBackground } from '../../common/Animations';
import { MemberProfile, initials, socialPlatforms, usableLink, whatsAppNumber } from './shared';
import MemberPortrait from '../MemberPortrait';

export default function MemberHero({ member }: { member: MemberProfile }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const copyResetTimer = useRef<number | null>(null);
  const mounted = useRef(false);
  const reducedMotion = useReducedMotion();
  const nameParts = member.name.trim().split(/\s+/);
  const firstName = nameParts.shift();
  const restOfName = nameParts.join(' ');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
    };
  }, []);

  const handleCopyEmail = async () => {
    if (!member.email) return;
    try {
      await navigator.clipboard.writeText(member.email);
      if (!mounted.current) return;
      setCopiedEmail(true);
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => {
        copyResetTimer.current = null;
        setCopiedEmail(false);
      }, 2500);
    } catch {
      if (mounted.current) setCopiedEmail(false);
    }
  };

  return (
    <section id="member-home" className="member-grid-surface member-hero relative min-h-[92svh] overflow-hidden border-b border-white/10 px-5 pb-12 pt-28 sm:pt-32 md:px-8 md:pb-16 lg:pt-36">
      <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/thesearchforabsolutesection.jpg" />
      <div className="member-hero-light pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-24 overflow-hidden text-center" aria-hidden="true">
        <span className="member-hero-watermark font-display font-black uppercase text-white/[0.02]">{firstName}</span>
      </div>

      <div className="relative mx-auto grid min-h-[calc(92svh-9rem)] max-w-[1500px] items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 lg:col-span-7"
        >
          {/* Availability Status Badge */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {member.availability || 'Available for Engagements'}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
              <Sparkles className="h-3 w-3 text-[var(--member-accent)]" />
              LB Developers Team
            </span>
          </div>

          <h1 className="member-hero-name font-display font-black uppercase leading-[0.88] text-white">
            <span className="block">{firstName}</span>
            {restOfName && <span className="block text-white/30">{restOfName}</span>}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="member-glass rounded-md px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
              {member.role}
            </span>
            {member.specialization && (
              <span
                className="rounded-md border px-4 py-2 text-[10px] font-black uppercase tracking-wider"
                style={{
                  borderColor: 'color-mix(in srgb, var(--member-accent) 40%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--member-accent) 12%, transparent)',
                  color: 'var(--member-accent)',
                }}
              >
                {member.specialization}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-xl md:leading-relaxed">
            {member.tagline || member.bio}
          </p>

          {(member.email || member.phone) && (
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="member-glass group flex min-w-0 items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 hover:border-brand-primary/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/35">Direct Email</span>
                    <span className="mt-1 block break-all text-sm font-bold text-white group-hover:text-brand-accent">{member.email}</span>
                  </span>
                </a>
              )}

              {member.phone && (
                <div className="member-glass flex min-w-0 items-center gap-3 rounded-2xl p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                    <Phone className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/35">Phone / WhatsApp</span>
                    <a href={`tel:${member.phone}`} className="mt-1 block text-sm font-bold text-white hover:text-brand-accent">{member.phone}</a>
                  </span>
                  <a
                    href={`https://wa.me/${whatsAppNumber(member.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Message ${member.name} on WhatsApp`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition-colors hover:border-brand-primary/50 hover:bg-brand-primary hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#projects"
              className="group inline-flex min-h-12 items-center gap-3 rounded-md px-5 text-[10px] font-black uppercase tracking-wider text-black shadow-lg transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--member-accent)',
                boxShadow: '0 10px 30px color-mix(in srgb, var(--member-accent) 25%, transparent)',
              }}
            >
              View Case Studies <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>

            <a
              href="#contact"
              className="member-glass group inline-flex min-h-12 items-center gap-3 rounded-md px-5 text-[10px] font-black uppercase tracking-wider text-white hover:border-[var(--member-accent)]/50"
            >
              Let&apos;s Talk <Mail className="h-4 w-4 text-[var(--member-accent)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

            {member.email && (
              <button
                type="button"
                onClick={() => void handleCopyEmail()}
                className="member-glass group relative inline-flex min-h-12 items-center gap-2.5 rounded-md px-4 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:border-[var(--member-accent)]/50 hover:text-white"
                title="Copy Email Address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-white/40 group-hover:text-[var(--member-accent)]" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`/api/v2/team/${member.slug}/vcard`}
              download={`${member.slug}.vcf`}
              className="member-glass inline-flex min-h-12 items-center gap-2.5 rounded-md px-4 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:border-[var(--member-accent)]/50 hover:text-white"
              title="Download Contact (.vcf)"
            >
              <Download className="h-4 w-4 text-[var(--member-accent)]" />
              <span>Save Contact</span>
            </a>
          </div>

          {/* Social connections */}
          {socialPlatforms.some(({ key }) => usableLink(member.socialLinks[key])) && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/30">Connect</span>
              {socialPlatforms.map(
                ({ key, label, icon: Icon }) =>
                  usableLink(member.socialLinks[key]) && (
                    <a
                      key={key}
                      href={member.socialLinks[key]}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      aria-label={`${member.name} on ${label}`}
                      className="member-glass flex h-10 w-10 items-center justify-center rounded-md text-white/50 transition-all hover:-translate-y-0.5 hover:border-[var(--member-accent)]/50 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ),
              )}
            </div>
          )}
        </motion.div>

        {/* Hero Portrait Card & Quick Metrics */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: 28, rotateY: -4 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.85, delay: reducedMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto w-full max-w-[580px] lg:col-span-5 lg:mx-0 lg:justify-self-end"
        >
          <div className="member-glass member-glass-strong member-portrait-card relative rounded-xl p-3 sm:p-4">
            <div
              className="pointer-events-none absolute left-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-black/50 font-display text-xs font-black text-white backdrop-blur-xl"
              aria-hidden="true"
            >
              {initials(member.name)}
            </div>

            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white/[0.04]">
              {member.avatar ? (
                <MemberPortrait
                  src={member.avatar}
                  alt={`${member.name}, ${member.role}`}
                  sizes="(min-width: 1024px) 580px, 90vw"
                  className="h-full w-full object-cover object-center"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-8xl font-black text-white/12">
                  {initials(member.name)}
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/50">Core Practice</p>
                  <p className="mt-1.5 max-w-[280px] font-display text-lg font-black uppercase leading-tight text-white sm:text-xl">
                    {member.role}
                  </p>
                </div>
                <a
                  href="#about"
                  className="member-glass flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:border-[var(--member-accent)]/50"
                  aria-label={`About ${member.name}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <dl className="relative z-20 -mt-6 grid grid-cols-3 gap-2.5 px-3 sm:-mt-8 sm:px-6">
            <div className="member-glass member-glass-strong rounded-lg p-3.5 text-center sm:p-4">
              <dt className="text-[8px] font-black uppercase tracking-[0.15em] text-white/35">Work</dt>
              <dd className="mt-1.5 font-display text-xl font-black text-white sm:text-2xl">
                {String(member.projects.length).padStart(2, '0')}
              </dd>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40">Projects</p>
            </div>
            <div className="member-glass member-glass-strong rounded-lg p-3.5 text-center sm:p-4">
              <dt className="text-[8px] font-black uppercase tracking-[0.15em] text-white/35">Experience</dt>
              <dd className="mt-1.5 truncate font-display text-xl font-black text-white sm:text-2xl">
                {member.yearsExperience || `${member.experience?.length || 4}+ Yrs`}
              </dd>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40">Track Record</p>
            </div>
            <div className="member-glass member-glass-strong rounded-lg p-3.5 text-center sm:p-4">
              <dt className="text-[8px] font-black uppercase tracking-[0.15em] text-white/35">Team</dt>
              <dd
                className="mt-1.5 font-display text-xl font-black sm:text-2xl"
                style={{ color: 'var(--member-accent)' }}
              >
                LB
              </dd>
              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-white/40">Developers</p>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
