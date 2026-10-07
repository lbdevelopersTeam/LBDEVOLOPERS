import { Link } from 'react-router-dom';
import { useContactEmail } from '../../lib/site-settings';
import { Mail, Phone, MapPin, ArrowRight, MessageCircle } from 'lucide-react';

export default function Footer() {
  const contactEmail = useContactEmail();
  const contactChannels = [
    { icon: Mail, href: `mailto:${contactEmail}`, label: 'Email LB CodeBase' },
    { icon: MessageCircle, href: 'https://wa.me/923489077329?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.', label: 'Chat with LB CodeBase on WhatsApp' },
  ];
  return (
    <footer className="bg-brand-dark pt-20 pb-10 px-6 border-t border-white/5 relative overflow-hidden md:pt-32 md:pb-12">
      <div className="max-w-[1600px] mx-auto">
        {/* Large Cinematic Background Text */}
        <div aria-hidden="true" className="absolute top-20 left-0 right-0 hidden pointer-events-none select-none overflow-hidden opacity-[0.02] whitespace-nowrap sm:block">
          <span className="text-[7rem] md:text-[12rem] lg:text-[18rem] font-display font-black tracking-tighter uppercase leading-none">LB CODEBASE</span>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:grid-cols-12 lg:gap-20 mb-20 md:mb-32 relative z-10">
          <div className="lg:col-span-5">
            <Link to="/" className="brand-logo mb-10">
              <div className="brand-mark">LB</div>
              <span className="brand-text">CodeBase</span>
            </Link>
            <p className="text-white/70 text-base leading-relaxed mb-10 max-w-md font-light md:text-xl md:mb-12">
              LB CodeBase designs and builds websites, commerce platforms, and digital products from our studio in Swat, Pakistan.
            </p>
            <div className="flex flex-wrap gap-4">
              {contactChannels.map((channel) => (
                <a 
                  key={channel.label}
                  href={channel.href}
                  target={channel.href.startsWith('https://') ? '_blank' : undefined}
                  rel={channel.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                  aria-label={channel.label}
                  className="flex h-12 w-12 items-center justify-center rounded-md border border-white/10 text-white/65 transition-colors duration-300 hover:border-brand-primary hover:text-white"
                >
                  <channel.icon aria-hidden="true" className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-black mb-6 md:mb-10 text-blue-300 uppercase tracking-[0.25em] sm:tracking-[0.4em]">Navigation</h2>
            <ul className="space-y-4 md:space-y-6">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Team', href: '/about#team-directory' },
                { label: 'Services', href: '/services' },
                { label: 'Portfolio', href: '/portfolio' },
                { label: 'Reviews', href: '/#reviews' },
                { label: 'Journal', href: '/blog' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-white/70 hover:text-white text-sm transition-all duration-300 font-bold uppercase tracking-widest block hover:translate-x-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-black mb-6 md:mb-10 text-blue-300 uppercase tracking-[0.25em] sm:tracking-[0.4em]">Support</h2>
            <ul className="space-y-4 md:space-y-6">
              {[
                { label: 'Inquiry', href: '/contact' },
                { label: 'Careers', href: '/careers' },
                { label: 'FAQs', href: '/faq' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-white/70 hover:text-white text-sm transition-all duration-300 font-bold uppercase tracking-widest block hover:translate-x-2">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-[10px] font-black mb-6 md:mb-10 text-blue-300 uppercase tracking-[0.25em] sm:tracking-[0.4em]">Start a Project</h2>
            <p className="text-white/70 text-sm mb-6 md:mb-10 font-light leading-relaxed">Share your goals, constraints, and launch window. We will reply with a clear next step.</p>
            <Link
              to="/contact"
              className="inline-flex min-h-14 w-full items-center justify-between rounded-md border border-white/10 px-6 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-brand-primary hover:bg-brand-primary/10"
            >
              Send a project brief
              <ArrowRight aria-hidden="true" className="h-5 w-5 text-brand-primary" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 py-10 md:py-16 border-y border-white/5 mb-10 md:mb-16 relative z-10">
          <div className="flex items-start gap-4 sm:gap-6 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[9px] font-black text-white/55 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1">Email</div>
              <a href={`mailto:${contactEmail}`} className="break-all text-sm font-bold tracking-tight text-white hover:text-brand-primary">{contactEmail}</a>
            </div>
          </div>
          <div className="flex items-start gap-4 sm:gap-6 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[9px] font-black text-white/55 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1">Phone / WhatsApp</div>
              <a href="tel:+923489077329" className="text-white text-sm font-bold tracking-tight hover:text-brand-primary">+92 348 9077329</a>
            </div>
          </div>
          <div className="flex items-start gap-4 sm:gap-6 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-white/5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[9px] font-black text-white/55 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1">Studio</div>
              <div className="text-white text-sm font-bold tracking-tight">Mingora, Swat, Pakistan</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-white/65 relative z-10">
          <p>© {new Date().getFullYear()} LB CODEBASE. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 lg:gap-10">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="#top" className="hover:text-white transition-colors">Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
