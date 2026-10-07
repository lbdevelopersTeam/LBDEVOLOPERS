import { ArrowDown, ArrowUpRight, BarChart3, Check, Code2, Compass, Layers, Rocket, Gauge, Route, PanelsTopLeft, ShoppingBag, Orbit } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../lib/content';
import BrandLogo from './BrandLogo';

const deliverySteps = [
  { icon: Compass, title: 'Discover', detail: 'Audience, goals & a clear brief', output: 'An agreed direction' },
  { icon: Layers, title: 'Design', detail: 'User journeys & working prototypes', output: 'A product you can explore' },
  { icon: Code2, title: 'Develop', detail: 'Reusable code & connected content', output: 'A tested, working build' },
  { icon: Rocket, title: 'Deliver', detail: 'Launch checks, handover & support', output: 'A foundation for growth' },
];

export function DeliveryRoadmap() {
  return (
    <section className="studio-section studio-process-reference" aria-labelledby="delivery-heading">
      <div className="studio-container">
        <div className="studio-section-heading studio-centered-heading">
          <div><p className="studio-eyebrow">From first conversation to launch</p><h2 id="delivery-heading">Good work starts with<br /><span className="studio-gradient-text">a clear way forward.</span></h2></div>
          <p>How we take a product from spark to something people can use, trust, and grow.</p>
        </div>
        <ol className="studio-roadmap">
          {deliverySteps.map(({ icon: Icon, title, detail, output }, index) => (
            <li key={title} style={{ '--step': index } as React.CSSProperties}>
              <div className="studio-roadmap-top"><span className="studio-roadmap-number">0{index + 1}</span><Icon aria-hidden="true" size={22} /></div>
              <h3>{title}</h3><p>{detail}</p><div className="studio-roadmap-output"><ArrowUpRight size={16} aria-hidden="true" />{output}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function WorkShowcase() {
  return (
    <section className="studio-section studio-work-showcase studio-work-reference" aria-labelledby="work-showcase-heading">
      <div className="studio-container">
        <div className="studio-work-intro"><div><p className="studio-eyebrow">Design with a purpose</p><h2 id="work-showcase-heading">Different businesses.<br /><span className="studio-gradient-text">The same attention to detail.</span></h2><p>We build the story, system, and interface together—so the work looks distinctive and makes sense to the people using it.</p></div><Link to="/portfolio" className="studio-text-link">Explore our portfolio <ArrowUpRight size={20} aria-hidden="true" /></Link></div>
        <div className="studio-work-feature"><figure><img src="/images/voguemockup.webp" alt="Vogue Decor website presented across desktop and mobile devices" width="1200" height="800" loading="lazy" decoding="async" /><figcaption><span>01 · Vogue Decor</span><span>Commerce experience</span></figcaption></figure><div className="studio-work-side"><div className="studio-work-side-copy"><p className="studio-eyebrow">Selected system</p><h3>Make the next action obvious.</h3><p>Clear product discovery, a stronger content hierarchy, and a storefront that gives the brand room to sell.</p><Link to="/portfolio" className="studio-text-link">Read the case study <ArrowUpRight size={18} aria-hidden="true" /></Link></div><figure><img src="/images/pedroclaveromockup.webp" alt="Pedro Clavero website design and device mockups" width="1200" height="800" loading="lazy" decoding="async" /><figcaption><span>02 · Pedro Clavero</span><span>Brand & digital presence</span></figcaption></figure></div></div>
      </div>
    </section>
  );
}

export function HomeCapabilities() {
  const signalCards = [{ icon: Gauge, value: 'Fast', label: 'Load experience', body: 'Lean frontends, smart media, and responsive delivery.' }, { icon: Route, value: 'Clear', label: 'User journeys', body: 'Simple paths from first impression to qualified action.' }, { icon: Layers, value: 'Built', label: 'Scalable systems', body: 'Content, commerce, and infrastructure ready to grow.' }];
  const capabilityCards = [{ icon: PanelsTopLeft, title: 'Brand Platforms', body: 'Clear brand and content systems for websites that need to explain, persuade, and convert.' }, { icon: ShoppingBag, title: 'Product Experiences', body: 'Commerce and product journeys designed around real customer decisions.' }, { icon: Orbit, title: 'Interactive Media', body: '3D and motion used selectively to clarify ideas and give the brand a distinct point of view.' }];
return <div className="studio-home-capabilities"><div className="studio-capability-lead"><p className="studio-eyebrow">Capabilities</p><h2>One team from <span className="studio-gradient-text">product thinking to production code.</span></h2><p>We connect structure, interface design, frontend engineering, commerce, and launch support in one clear system.</p><div className="studio-chip-row"><span>Strategy</span><span>Design</span><span>Engineering</span><span>Growth</span></div><div className="studio-micro-actions"><Link to="/portfolio">View portfolio <ArrowUpRight size={16} /></Link><Link to="/contact">Start a project <ArrowUpRight size={16} /></Link></div></div><div className="studio-signal-cards">{signalCards.map(({ icon: Icon, ...item }, index) => <article key={item.label}><div className="studio-card-icon studio-card-icon-cyan"><Icon size={19} aria-hidden="true" /></div><span>0{index + 1}</span><strong>{item.value}</strong><em>{item.label}</em><p>{item.body}</p></article>)}</div><div className="studio-capability-cards">{capabilityCards.map(({ icon: Icon, ...item }, index) => <article key={item.title}><Icon className="brand-watermark" aria-hidden="true" /><div className="studio-card-icon studio-card-icon-violet"><Icon size={20} aria-hidden="true" /></div><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.body}</p><ArrowUpRight size={18} aria-hidden="true" /></article>)}</div></div>;
}

export function PortfolioBreakdown({ projects }: { projects: Project[] }) {
  const counts = new Map<string, number>();
  projects.forEach(project => counts.set(project.category || 'Other', (counts.get(project.category || 'Other') || 0) + 1));
  const categories = [...counts].sort((a, b) => b[1] - a[1]);
  if (!projects.length) return null;
  return (
    <section className="studio-portfolio-breakdown" aria-labelledby="portfolio-mix-heading">
      <div><p className="studio-eyebrow">The work at a glance</p><h2 id="portfolio-mix-heading">A considered mix<br />of digital experiences.</h2><p>Categories across the {projects.length} projects currently in this portfolio.</p></div>
      <figure aria-label="Project count by category">
        <figcaption className="studio-chart-caption">Portfolio composition <span>Number of projects</span></figcaption>
        <ul>{categories.map(([category, count]) => <li key={category}><div><span>{category}</span><strong>{count}</strong></div><div className="studio-chart-track" aria-hidden="true"><span style={{ width: `${count / projects.length * 100}%` }} /></div></li>)}</ul>
      </figure>
    </section>
  );
}

export function ArchitectureMap() {
  return (
    <section className="studio-section" aria-labelledby="architecture-heading">
      <div className="studio-container studio-architecture">
        <div><p className="studio-eyebrow">How the pieces connect</p><h2 id="architecture-heading">One experience.<br /><span className="studio-gradient-text">Connected at every layer.</span></h2><p>We choose the stack around your product, then connect the interface, business logic, and content into a maintainable system.</p><Link to="/contact" className="studio-text-link">Discuss your requirements <ArrowUpRight size={20} aria-hidden="true" /></Link></div>
        <ol className="studio-stack-map">
          {[
            ['Experience', 'Websites · Storefronts · Mobile apps'],
            ['Application', 'Components · APIs · Business workflows'],
            ['Foundation', 'Content · Data · Hosting & monitoring'],
          ].map(([title, detail], index) => <li key={title}><span className="studio-stack-index">0{index + 1}</span><div><h3>{title}</h3><p>{detail}</p></div>{index < 2 && <ArrowDown className="studio-stack-arrow" aria-hidden="true" size={20} />}</li>)}
        </ol>
      </div>
    </section>
  );
}

export function StudioMetrics({ items }: { items: { value: string; label: string; detail?: string }[] }) {
  return (
    <div className="studio-metrics" aria-label="Studio highlights">
      {items.map((item) => (
        <div className="studio-metric" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          {item.detail && <small>{item.detail}</small>}
        </div>
      ))}
    </div>
  );
}

export function ServiceMatrix() {
  const rows = [
    ['01', 'Digital products', 'Websites, platforms, and conversion-led experiences', 'Strategy · UX · Engineering'],
    ['02', 'Commerce systems', 'Storefronts that make discovery and checkout feel effortless', 'Architecture · Shopify · Optimization'],
    ['03', 'Growth infrastructure', 'Content, analytics, automation, and systems that scale', 'Integrations · AI · Support'],
  ];
  return (
    <section className="studio-section studio-service-matrix" aria-labelledby="service-matrix-heading">
      <div className="studio-container">
        <div className="studio-section-heading">
          <div><p className="studio-eyebrow">A focused set of capabilities</p><h2 id="service-matrix-heading">Everything your next<br /><span className="studio-gradient-text">digital move needs.</span></h2></div>
          <p>Bring us a product, a bottleneck, or simply a direction. We shape the right mix of thinking and making around it.</p>
        </div>
        <div className="studio-service-rows">
          {rows.map(([number, title, detail, tags]) => <article key={number}>
            <span className="studio-service-number">{number}</span>
            <div><h3>{title}</h3><p>{detail}</p></div>
            <span className="studio-service-tags">{tags}</span>
            <ArrowUpRight aria-hidden="true" size={22} />
          </article>)}
        </div>
      </div>
    </section>
  );
}

export function StudioProofPanel() {
  return (
    <section className="studio-proof-panel" aria-labelledby="proof-heading">
      <div className="studio-proof-glow" aria-hidden="true" />
      <div className="studio-proof-copy"><p className="studio-eyebrow">The standard we work to</p><h2 id="proof-heading">Clear thinking.<br /><span className="studio-gradient-text">Visible progress.</span></h2><p>Good digital work should feel considered before it feels impressive. We make the decisions, trade-offs, and next steps easy to see.</p></div>
      <div className="studio-proof-list">
        {['A brief everyone can repeat', 'A system your team can extend', 'A launch that earns attention'].map((item, index) => <div key={item}><span>0{index + 1}</span><Check size={17} aria-hidden="true" /><p>{item}</p></div>)}
      </div>
    </section>
  );
}

export function EditorialSignal() {
  return (
    <aside className="studio-editorial-signal">
      <div className="studio-signal-icon"><Gauge size={18} aria-hidden="true" /></div>
      <p className="studio-eyebrow">Studio note</p>
      <h3>Useful beats loud.</h3>
      <p>We care about the detail people feel: faster paths, clearer choices, and interfaces that make the work easier.</p>
    </aside>
  );
}

export function FAQGuide() {
  return (
    <aside className="studio-faq-guide">
      <div className="studio-signal-icon"><BarChart3 size={18} aria-hidden="true" /></div>
      <p className="studio-eyebrow">Before we begin</p>
      <h3>Start with the situation, not the solution.</h3>
      <p>Tell us what is stuck, what is changing, and what a better outcome would look like. We will help you find the right next step.</p>
      <Link to="/contact" className="studio-text-link">Talk to the studio <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </aside>
  );
}

export function StrategyTimeline() {
  const steps = [
    ['01', 'Discovery', 'We learn the business, audience, constraints, and the opportunity worth pursuing.'],
    ['02', 'Strategy', 'We turn the brief into a practical roadmap with priorities, milestones, and measures.'],
    ['03', 'Execution', 'Design and engineering move together through visible, reviewable increments.'],
    ['04', 'Optimization', 'After launch, we refine the experience around real usage and useful signals.'],
  ];
  return <section className="studio-section studio-strategy" aria-labelledby="strategy-heading"><div className="studio-container"><div className="studio-section-heading studio-centered-heading"><div><p className="studio-eyebrow">A proven way to move forward</p><h2 id="strategy-heading">From a spark to<br /><span className="studio-gradient-text">something people use.</span></h2></div><p>Strategy is not a presentation at the start. It is the thread that keeps every design and development decision connected.</p></div><ol className="studio-strategy-line">{steps.map(([number, title, detail]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div></li>)}</ol></div></section>;
}

export function ResultsDashboard() {
  const stats = [['50+', 'Projects shipped'], ['7+', 'Years building'], ['4', 'Core disciplines'], ['01', 'Shared standard']];
  const points = [30, 42, 36, 58, 48, 74, 66, 92];
  return <section className="studio-section studio-results" aria-labelledby="results-heading"><div className="studio-container"><div className="studio-section-heading studio-centered-heading"><div><p className="studio-eyebrow">Signals, not slogans</p><h2 id="results-heading">Make progress<br /><span className="studio-gradient-text">easy to see.</span></h2></div><p>We define the right measures for the work, then make the movement visible—from clearer journeys to faster, more dependable systems.</p></div><div className="studio-results-grid"><div className="studio-stat-grid">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="studio-chart"><div className="studio-chart-header"><span>Delivery momentum</span><strong>+68%</strong></div><svg viewBox="0 0 560 220" role="img" aria-label="An upward delivery momentum chart"><defs><linearGradient id="studio-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#1cc8ff" stopOpacity=".38" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs><path d={`M0 190 ${points.map((point, index) => `L${index * 80} ${220 - point * 1.9}`).join(' ')} L560 220 L0 220 Z`} fill="url(#studio-chart-fill)" /><path d={`M0 190 ${points.map((point, index) => `L${index * 80} ${220 - point * 1.9}`).join(' ')}`} fill="none" stroke="#28d7ff" strokeWidth="4" strokeLinecap="round" /></svg><div className="studio-chart-axis"><span>Brief</span><span>Build</span><span>Launch</span><span>Learn</span></div></div></div></div></section>;
}

export function FounderProfile() {
  return <section className="studio-section studio-founder" aria-labelledby="founder-heading"><div className="studio-container studio-founder-grid"><img src="/images/Wajid Hussain.png" alt="Wajid Hussain, CEO of LB CodeBase" loading="lazy" /><div><p className="studio-eyebrow">The person behind the standard</p><h2 id="founder-heading">Built with a<br /><span className="studio-gradient-text">technical point of view.</span></h2><p>Wajid Hussain is the CEO of LB CodeBase. He leads the studio’s strategy, systems thinking, and engineering direction—connecting business goals to dependable digital delivery.</p><p>His role is simple: make the work clearer, make the systems stronger, and keep the team close to the outcome.</p><div className="studio-founder-signature"><strong>Wajid Hussain</strong><span>CEO · Strategy & Technical Direction</span></div></div></div></section>;
}

export function JourneyTimeline() {
  const milestones = [['2022', 'The foundation', 'LB CodeBase begins with a focus on thoughtful digital products and dependable engineering.'], ['2023', 'The system grows', 'Commerce, product design, and automation become one connected studio practice.'], ['2024', 'More useful work', 'The portfolio expands across retail, professional services, products, and platforms.'], ['Now', 'The next chapter', 'A clearer studio for teams who want to build, improve, and keep moving.']];
  return (
    <section className="studio-section studio-journey" aria-labelledby="journey-heading">
      <div className="studio-container">
        <div className="studio-section-heading studio-centered-heading">
          <div>
            <p className="studio-eyebrow">The LB CodeBase journey</p>
            <h2 id="journey-heading">A practice in<br /><span className="studio-gradient-text">constant motion.</span></h2>
          </div>
        </div>
        <ol className="studio-journey-track">
          {milestones.map(([year, title, detail], index) => (
            <li className="studio-journey-item" key={year}>
              <div className="studio-journey-card" data-step={`0${index + 1}`}>
                <span className="studio-journey-year">{year}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
              <span className="studio-journey-dot" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PlatformMatrix() {
  const platforms = [
    ['MERN stack', 'Product interfaces, portals, APIs', 'React · Node · MongoDB', 'React'],
    ['Shopify', 'Commerce journeys and storefronts', 'Theme systems · Apps · CRO', 'Shopify'],
    ['WordPress', 'Content-led sites and publishing', 'Blocks · SEO · Editorial', 'WordPress'],
    ['AI & automation', 'Agents, workflows, and operations', 'n8n · APIs · LLM systems', 'n8n'],
  ];
  return (
    <section className="studio-section studio-platforms" aria-labelledby="platform-heading">
      <div className="studio-container">
        <div className="studio-section-heading">
          <div><p className="studio-eyebrow">What we build with</p><h2 id="platform-heading">The right stack for<br /><span className="studio-gradient-text">the real job.</span></h2></div>
          <p>Technology should follow the product, not the other way around. We choose the tools that make your experience faster to ship and easier to own.</p>
        </div>
        <div className="studio-platform-grid">
          {platforms.map(([title, detail, stack, brand], index) => (
            <article key={title}>
              <span className="platform-card-index">0{index + 1}</span>
              <BrandLogo name={brand} className="platform-card-monogram" />
              <div className="studio-card-icon platform-brand-icon"><BrandLogo name={brand} /></div>
              <h3>{title}</h3><p>{detail}</p><small>{stack}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PortfolioStandards() {
  return <section className="studio-section studio-standards" aria-labelledby="standards-heading"><div className="studio-container"><div className="studio-section-heading studio-centered-heading"><div><p className="studio-eyebrow">How we show the work</p><h2 id="standards-heading">Good work has<br /><span className="studio-gradient-text">a point of view.</span></h2></div><p>Every case study should tell you what changed, why it mattered, and what we learned—not just show a polished screenshot.</p></div><div className="studio-standards-grid"><article><span className="studio-standard-good">Good work</span><h3>Context before gloss.</h3><p>Clear problem, considered decisions, visible progress, and outcomes people can understand.</p><ul><li>What needed to improve</li><li>What we changed</li><li>What the work made possible</li></ul></article><article><span className="studio-standard-bad">Avoided work</span><h3>Noise without direction.</h3><p>Decorative interfaces, unexplained metrics, and technology chosen because it sounds impressive.</p><ul><li>No vanity metrics</li><li>No hidden handoffs</li><li>No black-box delivery</li></ul></article></div></div></section>;
}

export function ContactFlow() {
  const steps = [['01', 'Share the context', 'What are you building, changing, or trying to make easier?'], ['02', 'Shape the scope', 'We identify the right people, priorities, and first useful milestone.'], ['03', 'Start with clarity', 'You leave with a practical next step—not a vague sales pitch.']];
  return <section className="studio-section studio-contact-flow" aria-labelledby="contact-flow-heading"><div className="studio-container"><div className="studio-section-heading"><div><p className="studio-eyebrow">A better first conversation</p><h2 id="contact-flow-heading">Bring the problem.<br /><span className="studio-gradient-text">We’ll find the shape.</span></h2></div><p>No perfect brief required. A useful starting point is enough.</p></div><div className="studio-contact-flow-grid">{steps.map(([number, title, detail]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p><ArrowUpRight size={19} aria-hidden="true" /></article>)}</div></div></section>;
}
