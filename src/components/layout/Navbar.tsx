import { useState, useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Download, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Magnetic } from '../common/Animations';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Services', href: '/services' },
  { name: 'Tech', href: '/tech' },
  { name: 'Consultancy', href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuExiting, setIsMenuExiting] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pendingNavigation = useRef<string | null>(null);

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto max-w-[1400px] rounded-xl border border-transparent transition-[background-color,border-color,padding] duration-300",
          scrolled ? "border-white/10 bg-black/82 px-4 py-3 backdrop-blur-xl sm:px-6" : "px-3 py-3 sm:px-4 sm:py-4"
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
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'group relative border-b px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] transition-colors duration-300',
                  isActiveLink(link.name, link.href) ? 'border-brand-primary text-white' : 'border-transparent text-white/45 hover:border-white/20 hover:text-white'
                )}
              >
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/documents/LB-CodeBase-Company-Profile.pdf"
              download="LB-CodeBase-Company-Profile.pdf"
              className="hidden items-center gap-2 border-b border-white/15 px-2 py-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/60 transition-colors hover:border-brand-primary hover:text-white lg:flex"
              aria-label="Download the LB CodeBase company profile PDF"
            >
              <Download className="h-3 w-3" />
              Company Profile
            </a>

            <Magnetic strength={0.1}>
              <Link
                to="/contact"
                className="group hidden items-center gap-3 rounded-md bg-brand-primary px-7 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#526bff] xl:flex"
              >
                Start a project
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>

            <button
              type="button"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              disabled={isMenuExiting}
              className="lg:hidden w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 text-white relative z-[120]"
              onClick={() => {
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
            <div onClick={(event) => event.stopPropagation()} className="relative z-10 mx-auto flex max-h-[calc(100dvh-6rem)] w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#080808] p-4">
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
                      to={link.href}
                      onClick={(event) => closeThenNavigate(event, link.href)}
                      className={cn(
                        'flex items-center justify-between border-b px-2 py-3.5 text-sm font-black uppercase tracking-[0.14em] transition-colors',
                        isActiveLink(link.name, link.href)
                          ? 'border-brand-primary text-white'
                          : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white'
                      )}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-brand-primary" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <a
                  href="/documents/LB-CodeBase-Company-Profile.pdf"
                  download="LB-CodeBase-Company-Profile.pdf"
                  onClick={beginMenuClose}
                  className="group mb-2 flex min-h-16 w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] p-2.5 pr-3 text-left transition-colors hover:border-brand-primary/40 active:scale-[0.99]"
                  aria-label="Download the LB CodeBase company profile PDF"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-primary/25 bg-brand-primary/15 text-brand-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-white">
                      Company Profile
                    </span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">
                      PDF document · Download
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition-all group-hover:border-brand-primary/30 group-hover:bg-brand-primary group-hover:text-white">
                    <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                  </span>
                </a>
                <Link
                  to="/contact"
                  onClick={(event) => closeThenNavigate(event, '/contact')}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-brand-primary px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white"
                >
                  Let's Talk
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
