import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cachedFetch } from '../lib/content';

type Technology = { id: string; name: string; category: string; description: string };

const choices = [
  { title: 'Fast, clear interfaces', tools: 'React · Next.js · Tailwind CSS · Motion', when: 'Interactive products with reusable interfaces and a clear performance budget.', tradeoff: 'Match rendering and animation to the content. A simple site does not need a complex application stack.' },
  { title: 'Content your team can edit', tools: 'WordPress · Custom CMS integrations', when: 'Teams need to update pages and publish without a developer for every change.', tradeoff: 'Balance editing freedom with a structure that keeps the design consistent.' },
  { title: 'Commerce that fits operations', tools: 'Shopify · Liquid · WooCommerce · Storefront API', when: 'Product discovery, merchandising, and checkout need to work together.', tradeoff: 'Choose a theme or custom storefront around the catalogue, integrations, and maintenance capacity.' },
  { title: 'Data and integrations', tools: 'Node.js · Relational databases · APIs', when: 'The product needs dependable records, permissions, and connections to other systems.', tradeoff: 'Start with a clear data model and ownership. Add infrastructure when the requirements justify it.' },
  { title: 'Delivery and operations', tools: 'Cloud hosting · CDN · Monitoring', when: 'The product needs repeatable deployment, reliable delivery, and visibility after launch.', tradeoff: 'Consider running costs, the team managing the system, and recovery alongside performance.' },
  { title: 'Useful automation', tools: 'AI integrations · Search · Content workflows', when: 'Search, support, or repetitive work can benefit from a focused integration.', tradeoff: 'Define data access, human review, and a fallback before introducing automated output.' },
];

export default function TechStack() {
  const [catalog, setCatalog] = useState<Technology[]>([]);
  useEffect(() => {
    let active = true;
    cachedFetch<{ items: Technology[] }>('/api/v2/technologies', 'public.technologies.v2', { items: [] })
      .then(({ items }) => { if (active) setCatalog(items); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return <div className="studio-page">
    <header className="studio-container compact-hero"><p className="eyebrow">Technology & decisions</p><h1 className="display-heading">Technology that<br /><span className="accent-text">fits the job.</span></h1><p className="reading-copy">We choose technology based on the product, the team maintaining it, and the performance it needs. The requirements come first.</p></header>
    <section className="studio-container pb-20" aria-label="How we choose technology"><div className="grid gap-x-12 gap-y-10 md:grid-cols-2">{choices.map((choice) => <article key={choice.title} className="border-t border-white/20 pt-6"><h2 className="font-display text-2xl mb-4">{choice.title}</h2><p className="project-meta !mb-6">{choice.tools}</p><h3 className="font-semibold mb-2">When we choose it</h3><p className="reading-copy mb-6">{choice.when}</p><h3 className="font-semibold mb-2">The decision to make</h3><p className="reading-copy">{choice.tradeoff}</p></article>)}</div></section>
    {catalog.length > 0 && <section className="studio-section"><div className="studio-container"><h2 className="section-heading mb-8">Tools in our kit.</h2><p className="reading-copy mb-8">The project requirements determine which of these tools belong in the final solution.</p><ul className="grid gap-x-12 gap-y-6 md:grid-cols-2">{catalog.map((tool) => <li key={tool.id} className="border-t border-white/20 pt-5"><h3 className="font-display text-xl mb-2">{tool.name}</h3><p className="project-meta">{tool.category}</p><p className="reading-copy mt-3">{tool.description}</p></li>)}</ul></div></section>}
    <section className="studio-section bg-brand-gray"><div className="studio-container"><p className="eyebrow">A representative pattern</p><h2 className="section-heading">How a commerce product connects.</h2><p className="reading-copy mt-6">An illustrative architecture for a storefront. The final choices depend on the catalogue, content workflow, and integrations.</p><ol className="architecture-flow" aria-label="Illustrative commerce architecture"><li><strong>1. Customer interface</strong><span>Responsive storefront and product discovery</span></li><li><strong>2. Commerce services</strong><span>Catalogue, cart, and checkout</span></li><li><strong>3. Team workflows</strong><span>Content, orders, and integrations</span></li><li><strong>4. Delivery & feedback</strong><span>Hosting, analytics, and monitoring</span></li></ol><Link to="/portfolio" className="studio-text-link">See how this appears in the work <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
    <section className="studio-container studio-section"><div className="editorial-callout"><h2 className="section-heading">Start with what the product needs.</h2><p className="reading-copy">Tell us about the team, the workflow, and the problem. We’ll discuss the technology with those in mind.</p><Link to="/contact" className="studio-button mt-6">Discuss your project</Link></div></section>
  </div>;
}
