import { Link, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import ContactForm from '../components/common/ContactForm';
import { useContactEmail } from '../lib/site-settings';

export default function Contact() {
  const email = useContactEmail();
  const location = useLocation();
  const state = location.state as { projectBrief?: unknown } | null;
  const brief = typeof state?.projectBrief === 'string' ? state.projectBrief : '';
  return <div className="studio-page">
    <header className="studio-container compact-hero"><p className="eyebrow">Start a conversation</p><h1 className="display-heading">Tell us what<br /><span className="accent-text">you’re building.</span></h1><p className="reading-copy">A new launch, a better storefront, or a product that needs some care. Tell us what you’re trying to improve.</p></header>
    <div className="studio-container contact-layout">
      <aside>
        <h2 className="font-display text-2xl mb-6">Let’s work out the next step.</h2>
        <p className="reading-copy">We usually reply within one business day. We’ll review your message and discuss the scope before preparing a proposal.</p>
        <div className="space-y-6 mt-8">
          <a href={`mailto:${email}`} className="flex min-h-12 items-center gap-4 break-all"><Mail className="accent-text shrink-0" size={22} aria-hidden="true" />{email}</a>
          <a href="tel:+923489077329" className="flex min-h-12 items-center gap-4"><Phone className="accent-text" size={22} aria-hidden="true" />+92 348 9077329</a>
          <a href="https://wa.me/923489077329" target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-4"><MessageCircle className="accent-text" size={22} aria-hidden="true" />Talk on WhatsApp</a>
          <p className="flex items-center gap-4 reading-copy"><MapPin className="accent-text shrink-0" size={22} aria-hidden="true" />Mingora, Swat, Pakistan</p>
        </div>
        <Link to="/planner" className="studio-text-link mt-8">Need a starting point? Try the project planner</Link>
      </aside>
      <section className="contact-form-panel" aria-label="Project inquiry"><h2 className="font-display text-2xl mb-6">A few details to get started.</h2><ContactForm key={brief} initialMessage={brief} /></section>
    </div>
  </div>;
}
