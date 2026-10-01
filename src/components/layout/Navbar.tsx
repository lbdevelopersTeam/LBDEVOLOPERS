import { useState, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Magnetic } from '../common/Animations';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/portfolio' },
  { name: 'Services', href: '/services' },
  { name: 'Tech', href: '/tech' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuExiting, setIsMenuExiting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pendingNavigation = useRef<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('button')?.focus());
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !menuRef.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !menuRef.current?.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', trapFocus); (previousFocus || toggleRef.current)?.focus(); };
  }, [isOpen]);

  useEffect(() => {
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      setScrolled(window.scrollY > 20);
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    setScrolled(window.scrollY > 20);
  }, [location.pathname]);

  useEffect(() => {
    pendingNavigation.current = null;
    if (isOpen) {
      setIsMenuExiting(true);
      setIsOpen(false);
    }
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const desktopViewport = window.matchMedia('(min-width: 1024px)');
    const closeAtDesktopBreakpoint = () => {
      if (!desktopViewport.matches) return;
      const pendingHref = pendingNavigation.current;
      pendingNavigation.current = null;
      setIsOpen(false);
      setIsMenuExiting(false);
      if (pendingHref) navigate(pendingHref);
    };

    desktopViewport.addEventListener('change', closeAtDesktopBreakpoint);
    closeAtDesktopBreakpoint();
    return () => desktopViewport.removeEventListener('change', closeAtDesktopBreakpoint);
  }, [navigate]);

  const menuIsActive = isOpen || isMenuExiting;

  useEffect(() => {
    if (!menuIsActive) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuExiting(true);
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuIsActive]);

  const isActiveLink = (name: string, href: string) => {
    if (name === 'About') {
      return location.pathname === '/about' || location.pathname.startsWith('/team/');
    }
    return location.pathname === href;
  };

  const beginMenuClose = () => {
    if (!isOpen) return;
    setIsMenuExiting(true);
    setIsOpen(false);
  };

  const closeThenNavigate = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      pendingNavigation.current = null;
      beginMenuClose();
      return;
    }

    event.preventDefault();
    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    pendingNavigation.current = href === currentUrl ? null : href;
    beginMenuClose();
  };

  const finishMenuClose = () => {
    const href = pendingNavigation.current;
    pendingNavigation.current = null;
    setIsMenuExiting(false);
    if (href) navigate(href);
    else toggleRef.current?.focus();
  };

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] px-3 transition-[padding] duration-300 sm:px-6',
        scrolled ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-8'
      )}
    >
      <motion.div
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "max-w-[1400px] mx-auto rounded-[2rem] transition-[background-color,border-color,box-shadow,padding] duration-300 border border-transparent",
          scrolled ? "bg-brand-dark/40 backdrop-blur-2xl border-white/10 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:px-8" : "px-3 py-3 sm:px-4 sm:py-4"
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="brand-logo-image-frame"
            aria-label="LB CodeBase home"
          >
            <img
              src="/images/LB CodeBase Logo.webp"
              alt="LB CodeBase"
              width="144"
              height="32"
              decoding="async"
              className="brand-logo-image"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/5 rounded-full px-2 py-1 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                aria-current={isActiveLink(link.name, link.href) ? 'page' : undefined}
                className={cn(
                  'text-sm font-medium transition-colors duration-200 px-3 xl:px-4 py-3 rounded-full relative group overflow-hidden',
                  isActiveLink(link.name, link.href) ? 'text-white font-semibold' : 'text-white/75 hover:text-white'
                )}
              >
                <span className="relative z-10">{link.name}</span>
                {isActiveLink(link.name, link.href) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/documents/LB-CodeBase-Company-Profile.pdf"
              download="LB-CodeBase-Company-Profile.pdf"
              className="hidden xl:flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-white"
              aria-label="Download the LB CodeBase company profile PDF"
            >
              <Download className="h-3 w-3" />
              Company profile
            </a>

            <Magnetic strength={0.1}>
              <Link
                to="/contact"
                className="hidden lg:flex min-h-11 px-5 py-3 bg-brand-primary text-white rounded-full text-sm font-medium transition-colors items-center gap-3 group"
              >
                Start a project
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>

            <button
              ref={toggleRef}
              type="button"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-disabled={isMenuExiting}
              className="lg:hidden w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white relative z-[120]"
              onClick={() => {
                if (isMenuExiting) return;
                if (isOpen) beginMenuClose();
                else {
                  pendingNavigation.current = null;
                  setIsOpen(true);
                }
              }}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence initial={false} onExitComplete={finishMenuClose}>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={beginMenuClose}
            className="fixed inset-0 z-[110] bg-black/80 px-3 pb-4 pt-20 lg:hidden"
          >
            <div className="absolute inset-x-4 top-24 h-40 rounded-full bg-brand-primary/10 blur-[90px]" />

            <div onClick={(event) => event.stopPropagation()} className="glass relative z-10 mx-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-[2rem] border border-white/10 bg-brand-dark/90 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                <Link to="/" onClick={(event) => closeThenNavigate(event, '/')} className="brand-logo-image-frame" aria-label="LB CodeBase home">
                  <img src="/images/LB CodeBase Logo.webp" alt="LB CodeBase" width="144" height="32" decoding="async" className="brand-logo-image" />
                </Link>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={beginMenuClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      aria-current={isActiveLink(link.name, link.href) ? 'page' : undefined}
                      to={link.href}
                      onClick={(event) => closeThenNavigate(event, link.href)}
                      className={cn(
                        'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black normal-case tracking-[0.1em] transition-all',
                        isActiveLink(link.name, link.href)
                          ? 'border-brand-primary/35 bg-brand-primary/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/75 hover:border-white/20 hover:text-white'
                      )}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-brand-primary" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <a
                  href="/documents/LB-CodeBase-Company-Profile.pdf"
                  download="LB-CodeBase-Company-Profile.pdf"
                  onClick={beginMenuClose}
                  className="mb-2 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-sm font-medium normal-case tracking-[0.1em] text-white/75 transition-colors hover:border-brand-primary/40 hover:text-white"
                  aria-label="Download the LB CodeBase company profile PDF"
                >
                  <Download className="h-4 w-4 text-brand-primary" />
                  Company profile
                </a>
                <Link
                  to="/contact"
                  onClick={(event) => closeThenNavigate(event, '/contact')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-center text-xs font-black normal-case tracking-[0.1em] text-white shadow-2xl shadow-brand-primary/30"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
