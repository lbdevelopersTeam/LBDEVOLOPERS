import { Marquee } from './Animations';
import BrandLogo from './BrandLogo';
import { getBrandLogo } from '../../lib/brand-logos';

const partners = [
  { name: 'AWS' },
  { name: 'Shopify' },
  { name: 'Google Cloud' },
  { name: 'Vercel' },
  { name: 'Netlify' },
  { name: 'Stripe' },
  { name: 'Cloudflare' },
  { name: 'OpenAI' },
  { name: 'eBay' },
  { name: 'PostgreSQL' },
];

export default function PartnerShowcase() {
  return (
    <section id="technology-partners" aria-label="Technologies we work with" className="technology-logo-strip py-6 border-t border-b border-white/5 bg-black/40 backdrop-blur-md relative z-20 flex items-center overflow-hidden">
      <div className="flex-shrink-0 px-10 border-r border-white/10 hidden lg:block">
         <div className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-1">Our toolkit</div>
         <h3 className="text-sm font-display font-black tracking-tight uppercase text-white/90">Built with proven tools.</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Marquee speed={30}>
          {partners.map((partner) => (
            <a
              key={partner.name} 
              href={getBrandLogo(partner.name)?.href}
              aria-label={partner.name}
              className="technology-logo-item group flex items-center gap-3 whitespace-nowrap px-6 py-2 transition-opacity duration-300 hover:opacity-100"
            >
              <BrandLogo name={partner.name} variant="wordmark" className="technology-wordmark" />
              {partner.name === 'PostgreSQL' && <span className="technology-logo-label">PostgreSQL</span>}
            </a>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
