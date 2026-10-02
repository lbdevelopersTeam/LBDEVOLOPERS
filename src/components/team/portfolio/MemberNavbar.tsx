import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Download, FileText, Menu, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MemberProfile, initials } from './shared';
import MemberPortrait from '../MemberPortrait';

export default function MemberNavbar({ member }: { member: MemberProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuExiting, setIsMenuExiting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('member-home');
  const location = useLocation();
  const navigate = useNavigate();
  const pendingTarget = useRef<{ type: 'anchor' | 'route'; href: string } | null>(null);

  const hasCareer = Boolean(member.experience?.length || member.education?.length || member.certifications?.length);
  const hasTestimonials = Boolean(member.testimonials?.length);

  const navLinks = [
    { href: '#member-home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Expertise' },
    { href: '#projects', label: 'Work' },
    ...(hasCareer ? [{ href: '#experience', label: 'Career' }] : []),
    ...(hasTestimonials ? [{ href: '#testimonials', label: 'Endorsements' }] : []),
    { href: '#contact', label: 'Contact' },
  ];

  const beginMenuClose = () => {
    if (!isOpen) return;
    setIsMenuExiting(true);
    setIsOpen(false);
  };

  const commitPendingTarget = useCallback(() => {
    const pending = pendingTarget.current;
    pendingTarget.current = null;
    if (!pending) return;
    if (pending.type === 'anchor') navigate({ pathname: location.pathname, search: location.search, hash: pending.href });
    else navigate(pending.href);
  }, [location.pathname, location.search, navigate]);

  const closeThenScroll = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      pendingTarget.current = null;
      beginMenuClose();
      return;
    }
    event.preventDefault();
    pendingTarget.current = location.hash === href ? null : { type: 'anchor', href };
    beginMenuClose();
  };

  const closeThenNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      pendingTarget.current = null;
      beginMenuClose();
      return;
    }
    event.preventDefault();
    pendingTarget.current = { type: 'route', href };
    beginMenuClose();
  };

  const finishMenuClose = () => {
    setIsMenuExiting(false);
    commitPendingTarget();
  };

  useEffect(() => {
    pendingTarget.current = null;
    if (isOpen) {
      setIsMenuExiting(true);
      setIsOpen(false);
    }
  }, [location.pathname, location.search, location.hash]);

  const menuIsActive = isOpen || isMenuExiting;

  useEffect(() => {
    if (!menuIsActive) return undefined;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [menuIsActive]);

  useEffect(() => {
    const desktopViewport = window.matchMedia('(min-width: 1024px)');
    const closeAtDesktopBreakpoint = () => {
      if (!desktopViewport.matches) return;
      setIsOpen(false);
      setIsMenuExiting(false);
      commitPendingTarget();
    };

    desktopViewport.addEventListener('change', closeAtDesktopBreakpoint);
    closeAtDesktopBreakpoint();
    return () => desktopViewport.removeEventListener('change', closeAtDesktopBreakpoint);
  }, [commitPendingTarget]);

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.slice(1));
    let frame = 0;

    const updateScrollState = () => {
      frame = 0;
      setScrolled(window.scrollY > 20);

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(sectionIds[i]);
        if (element && element.getBoundingClientRect().top <= 200) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    updateScrollState();
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hasCareer, hasTestimonials]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] px-3 transition-[padding] duration-300 sm:px-6',
        scrolled ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-8'
      )}
    >
      <motion.div
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'max-w-[1400px] mx-auto rounded-[2rem] border border-transparent transition-[background-color,border-color,box-shadow,padding] duration-300',
          scrolled
            ? 'bg-brand-dark/40 backdrop-blur-2xl border-white/10 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:px-8'
            : 'px-3 py-3 sm:px-4 sm:py-4'
        )}
      >
        <div className="flex items-center justify-between">
          {/* Left: Member Brand */}
          <a href="#member-home" className="flex items-center gap-3 group">
            {member.avatar ? (
              <MemberPortrait
                src={member.avatar}
                alt={member.name}
                sizes="36px"
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/15 transition-transform group-hover:scale-105"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black text-black transition-transform group-hover:scale-105"
                style={{ backgroundColor: 'var(--member-accent)' }}
              >
                {initials(member.name)}
              </div>
            )}
            <div className="hidden sm:block">
              <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-white leading-none">
                {member.name}
              </span>
              <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white/35">
                {member.role}
              </span>
            </div>
          </a>

          {/* Center: Desktop Nav Pill */}
          <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/5 rounded-full px-2 py-1 backdrop-blur-sm">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 px-5 py-2.5 rounded-full relative group overflow-hidden',
                    isActive ? 'text-white' : 'text-white/40 hover:text-white'
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="member-nav-pill"
                      className="absolute inset-0 rounded-full border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--member-accent) 20%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--member-accent) 30%, transparent)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </a>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Back to LB CodeBase */}
            <Link
              to="/about#team-directory"
              className="hidden sm:flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/40 hover:text-white transition-colors"
            >
              <span className="brand-mark !text-[10px] !h-6 !w-6 !rounded-lg">LB</span>
              <span className="hidden xl:inline">Team</span>
            </Link>

            {/* Curriculum Vitae Link */}
            <a
              href="#cv"
              className="hidden lg:flex px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.16em] items-center gap-2 border border-white/10 bg-white/[0.03] text-white/80 hover:text-white hover:border-[var(--member-accent)]/50 transition-all"
            >
              <FileText className="w-3 h-3 text-[var(--member-accent)]" />
              CV
            </a>

            {/* vCard download */}
            <a
              href={`/api/v2/team/${member.slug}/vcard`}
              download={`${member.slug}.vcf`}
              className="hidden xl:flex px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.16em] items-center gap-2 border border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              <Download className="w-3 h-3" style={{ color: 'var(--member-accent)' }} />
              Save Contact
            </a>

            {/* CTA */}
            <a
              href="#contact"
              className="hidden xl:flex px-8 py-2.5 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all items-center gap-3 group"
              style={{
                backgroundColor: 'var(--member-accent)',
                boxShadow: '0 0 30px color-mix(in srgb, var(--member-accent) 40%, transparent)',
              }}
            >
              Let's Talk
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label={isOpen ? 'Close portfolio navigation menu' : 'Open portfolio navigation menu'}
              aria-expanded={isOpen}
              aria-controls="member-mobile-navigation"
              disabled={isMenuExiting}
              className="lg:hidden w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white relative z-[120]"
              onClick={() => {
                if (isOpen) beginMenuClose();
                else {
                  pendingTarget.current = null;
                  setIsOpen(true);
                }
              }}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu — matches main Navbar drawer style */}
      <AnimatePresence initial={false} onExitComplete={finishMenuClose}>
        {isOpen && (
          <motion.div
            id="member-mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio navigation"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={beginMenuClose}
            className="fixed inset-0 z-[110] bg-black/45 px-3 pb-4 pt-20 backdrop-blur-sm lg:hidden"
          >
            <div
              className="absolute inset-x-4 top-24 h-40 rounded-full blur-[90px]"
              style={{ backgroundColor: 'color-mix(in srgb, var(--member-accent) 10%, transparent)' }}
            />

            <div onClick={(event) => event.stopPropagation()} className="glass relative z-10 mx-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-md flex-col overflow-y-auto rounded-[2rem] border border-white/10 bg-brand-dark/85 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <a href="#member-home" onClick={(event) => closeThenScroll(event, '#member-home')} className="flex items-center gap-3">
                  {member.avatar ? (
                    <MemberPortrait
                      src={member.avatar}
                      alt={member.name}
                      sizes="32px"
                      className="h-8 w-8 rounded-xl object-cover ring-2 ring-white/15"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-[9px] font-black text-black"
                      style={{ backgroundColor: 'var(--member-accent)' }}
                    >
                      {initials(member.name)}
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wide text-white">{member.name}</span>
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-white/35">{member.role}</span>
                  </div>
                </a>
                <button
                  type="button"
                  aria-label="Close portfolio navigation menu"
                  onClick={beginMenuClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="grid gap-2">
                {navLinks.map((link, i) => {
                  const sectionId = link.href.replace('#', '');
                  const isActive = activeSection === sectionId;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <a
                        href={link.href}
                        onClick={(event) => closeThenScroll(event, link.href)}
                        className={cn(
                          'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition-all',
                          isActive
                            ? 'text-white'
                            : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white'
                        )}
                        style={isActive ? {
                          borderColor: 'color-mix(in srgb, var(--member-accent) 35%, transparent)',
                          backgroundColor: 'color-mix(in srgb, var(--member-accent) 15%, transparent)',
                        } : undefined}
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--member-accent)' }} />
                      </a>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="mt-4 grid gap-2">
                <a
                  href="#cv"
                  onClick={(event) => closeThenScroll(event, '#cv')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 hover:border-[var(--member-accent)]/50"
                >
                  <FileText className="h-3.5 w-3.5" style={{ color: 'var(--member-accent)' }} />
                  Curriculum Vitae
                </a>

                <a
                  href={`/api/v2/team/${member.slug}/vcard`}
                  download={`${member.slug}.vcf`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/70"
                >
                  <Download className="h-3.5 w-3.5" style={{ color: 'var(--member-accent)' }} />
                  Save Contact
                </a>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <a
                    href="#contact"
                    onClick={(event) => closeThenScroll(event, '#contact')}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white shadow-2xl"
                    style={{
                      backgroundColor: 'var(--member-accent)',
                      boxShadow: '0 10px 40px color-mix(in srgb, var(--member-accent) 30%, transparent)',
                    }}
                  >
                    Let's Talk
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </motion.div>

                <Link
                  to="/about#team-directory"
                  onClick={(event) => closeThenNavigate(event, '/about#team-directory')}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50"
                >
                  <span className="brand-mark !text-[9px] !h-5 !w-5 !rounded-md">LB</span>
                  Back to LB CodeBase
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
