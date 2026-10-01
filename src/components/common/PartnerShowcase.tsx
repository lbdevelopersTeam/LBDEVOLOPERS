import { Marquee } from './Animations';

const partners = [
  { name: 'AWS', mark: 'AWS' },
  { name: 'Shopify Plus', mark: 'S+' },
  { name: 'Google Cloud', mark: 'GCP' },
  { name: 'Vercel', mark: '▲' },
  { name: 'Netlify', mark: 'N' },
  { name: 'Stripe', mark: 'S' },
  { name: 'Cloudflare', mark: 'CF' },
  { name: 'OpenAI', mark: 'AI' },
  { name: 'eBay', mark: 'eB' },
  { name: 'PostgreSQL', mark: 'PG' },
];

export default function PartnerShowcase() {
  return (
    <section id="technology-partners" aria-label="Technology partners" className="py-6 border-t border-b border-white/5 bg-black/40 backdrop-blur-md relative z-20 flex items-center overflow-hidden">
      <div className="flex-shrink-0 px-10 border-r border-white/10 hidden lg:block">
         <div className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-1">Strategic Infrastructure</div>
         <h3 className="text-sm font-display font-black tracking-tight uppercase text-white/90">POWERING ELITE ECOSYSTEMS.</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Marquee speed={30}>
          {partners.map((partner) => (
            <div 
              key={partner.name} 
              aria-label={partner.name}
              className="group flex items-center gap-3 whitespace-nowrap px-8 py-2 opacity-90 transition-opacity duration-300 hover:opacity-100"
            >
              <span aria-hidden="true" className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] px-2 font-display text-[10px] font-black text-white/75">
                {partner.mark}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75 transition-colors group-hover:text-white">{partner.name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
