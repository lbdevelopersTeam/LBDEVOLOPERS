import { Link } from 'react-router-dom';

const tools = ['Shopify', 'WordPress', 'React', 'Node.js', 'Cloudflare'];

export default function PartnerShowcase() {
  return <section className="mt-10 border-t border-white/15 pt-8" aria-label="Tools selected for the work">
    <div className="flex flex-wrap justify-between items-center gap-6"><div><p className="eyebrow !mb-3">Tools, chosen around the product</p><ul className="flex flex-wrap gap-x-6 gap-y-3 text-base text-white/80">{tools.map((name) => <li key={name}>{name}</li>)}</ul></div><Link to="/tech" className="studio-text-link">How we choose technology ↗</Link></div>
  </section>;
}
