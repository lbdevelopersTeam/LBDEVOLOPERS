import { Link } from 'react-router-dom';
import { useContactEmail } from '../../lib/site-settings';

export default function Footer() {
  const email = useContactEmail();
  return <footer className="border-t border-white/15 bg-brand-dark pt-16 pb-28 text-white">
    <div className="studio-container">
      <Link to="/" className="brand-logo-image-frame mb-6" aria-label="LB CodeBase home"><img src="/images/LB CodeBase Logo.webp" alt="LB CodeBase" width={144} height={32} /></Link>
      <p className="reading-copy mb-12">Design, build, improve, and support digital products.<br />A team based in Swat, with care for the work and the people using it.</p>
      <div className="grid gap-10 sm:grid-cols-3">
        <div><h2 className="eyebrow">Explore</h2><ul className="space-y-1">{[['Home', '/'], ['About', '/about'], ['Work', '/portfolio'], ['Services', '/services'], ['Tech', '/tech'], ['Studio notes', '/blog']].map(([label, path]) => <li key={path}><Link to={path} className="inline-flex min-h-11 items-center text-white/80 hover:text-white">{label}</Link></li>)}</ul></div>
        <div><h2 className="eyebrow">Work with us</h2><ul className="space-y-1">{[['Start a project', '/contact'], ['Project planner', '/planner'], ['FAQ', '/faq'], ['Careers', '/careers']].map(([label, path]) => <li key={path}><Link to={path} className="inline-flex min-h-11 items-center text-white/80 hover:text-white">{label}</Link></li>)}<li><a href="/documents/LB-CodeBase-Company-Profile.pdf" download className="inline-flex min-h-11 items-center text-white/80 hover:text-white">Company profile ↓</a></li></ul></div>
        <div><h2 className="eyebrow">Contact</h2><a href={`mailto:${email}`} className="flex min-h-11 items-center break-all text-white/80 hover:text-white">{email}</a><a href="tel:+923489077329" className="flex min-h-11 items-center text-white/80 hover:text-white">+92 348 9077329</a><a href="https://wa.me/923489077329" target="_blank" rel="noreferrer" className="studio-text-link">Talk on WhatsApp ↗</a><p className="text-white/75 mt-4">Mingora, Swat, Pakistan</p></div>
      </div>
      <div className="flex flex-wrap justify-between gap-6 mt-12 pt-6 border-t border-white/15 text-sm text-white/75"><p>© {new Date().getFullYear()} LB CodeBase. All rights reserved.</p><div className="flex gap-6"><Link to="/privacy" className="inline-flex min-h-11 items-center hover:text-white">Privacy</Link><Link to="/terms" className="inline-flex min-h-11 items-center hover:text-white">Terms</Link></div></div>
    </div>
  </footer>;
}
