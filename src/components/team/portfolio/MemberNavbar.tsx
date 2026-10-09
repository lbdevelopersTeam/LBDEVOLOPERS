import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Menu, X } from 'lucide-react';
import { MemberProfile } from './shared';

export default function MemberNavbar({ member }: { member: MemberProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('member-home');
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navLinks = useMemo(() => [
    { href: '#member-home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Expertise' },
    { href: '#projects', label: 'Work' },
    ...(member.experience?.length || member.education?.length || member.certifications?.length
      ? [{ href: '#experience', label: 'Career' }] : []),
    ...(member.testimonials?.length ? [{ href: '#testimonials', label: 'Reviews' }] : []),
    { href: '#contact', label: 'Contact' },
  ], [member.experience?.length, member.education?.length, member.certifications?.length, member.testimonials?.length]);

  useEffect(() => setIsOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const current = [...navLinks].reverse().find(({ href }) => {
        const section = document.getElementById(href.slice(1));
        return section && section.getBoundingClientRect().top <= 140;
      });
      setActiveSection(current?.href.slice(1) || 'member-home');
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [navLinks]);

  return (
    <nav ref={navRef} className={`member-nav${scrolled ? ' member-nav-scrolled' : ''}`} aria-label={`${member.name} portfolio navigation`}>
      <div className="member-nav-inner">
        <div className="member-nav-brand-group">
          <Link to="/" className="member-nav-brand" aria-label="LB CodeBase home" onClick={() => setIsOpen(false)}>
            <img src="/images/LB CodeBase Logo.webp" alt="LB CodeBase" width="144" height="32" decoding="async" />
          </Link>
          <span className="member-nav-context" title={`${member.name} portfolio`}>{member.name}</span>
        </div>

        <div className="member-nav-links">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} aria-current={activeSection === href.slice(1) ? 'location' : undefined}>
              {label}
            </a>
          ))}
        </div>

        <div className="member-nav-actions">
          <Link to="/about#team-directory" className="member-nav-back">
            <ArrowLeft size={15} aria-hidden="true" /> <span>All team</span>
          </Link>
          <a href="#contact" className="member-nav-contact">
            Start a project <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="member-nav-toggle"
            aria-label={isOpen ? 'Close portfolio menu' : 'Open portfolio menu'}
            aria-expanded={isOpen}
            aria-controls="member-nav-menu"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="member-nav-menu" className="member-nav-menu">
          <p className="member-nav-menu-title">{member.name}</p>
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} onClick={() => setIsOpen(false)} aria-current={activeSection === href.slice(1) ? 'location' : undefined}>
              {label}
            </a>
          ))}
          <Link to={`/team/${member.slug}/cv`} onClick={() => setIsOpen(false)}>View CV</Link>
          <Link to="/about#team-directory" onClick={() => setIsOpen(false)}>All team members</Link>
        </div>
      )}
    </nav>
  );
}
