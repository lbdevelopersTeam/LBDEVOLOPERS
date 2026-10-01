import { Link } from 'react-router-dom';
import Accordion from '../components/common/Accordion';

const answers = [
  ['businesses', 'What kinds of businesses do you work best with?', 'We work on websites, commerce stores, and digital products for growing brands. The best starting point is a clear problem: a new launch, confusing navigation, a slow site, or a product that needs to be easier to maintain.'],
  ['timeline', 'How long does a project take?', 'Timing depends on the scope, integrations, content readiness, and review cycles. We agree on milestones after reviewing your brief. Share any fixed launch date early so we can discuss what is realistic.'],
  ['feedback', 'How do feedback and revisions work?', 'We agree on review stages and revision rounds in the proposal. Bring feedback together from your team at each stage, so decisions stay clear and work keeps moving.'],
  ['content', 'Who provides the content and owns the finished work?', 'We identify the copy, images, and brand assets needed before building. Content creation, asset licensing, ownership, and handover are set out in the project agreement; we explain any third-party licenses separately.'],
  ['hosting', 'Can you help with hosting and ongoing maintenance?', 'Hosting, monitoring, updates, and maintenance can be discussed alongside the build. Your proposal will separate these ongoing costs from project delivery and explain who manages accounts and access.'],
  ['seo', 'What happens to our SEO during a redesign?', 'We review useful content, existing URLs, metadata, and redirects before migration. Preserving these signals is part of planning a redesign; rankings also depend on factors outside a website rebuild.'],
  ['payments', 'How are pricing and payment stages agreed?', 'We prepare a scoped proposal after understanding the project. It explains deliverables, exclusions, payment stages, and any ongoing costs. Planning estimates are not final quotes.'],
  ['scope', 'What if the scope changes?', 'We discuss the impact on cost and timing before starting additional work. Changes should be agreed in writing so both teams understand what is included.'],
  ['handover', 'What happens after launch?', 'We plan deployment, access, documentation, and handover as part of delivery. If you need ongoing support or future improvements, we can discuss a separate arrangement.'],
];

export default function FAQ() {
  return <div className="studio-page">
    <header className="studio-container compact-hero">
      <p className="eyebrow">Working with us</p>
      <h1 className="display-heading">A little clarity,<br /><span className="accent-text">before we begin.</span></h1>
      <p className="reading-copy">Practical answers about planning, feedback, delivery, and what happens after launch.</p>
    </header>
    <section className="studio-container pb-24" aria-label="Frequently asked questions">
      <Accordion items={answers.map(([id, title, answer]) => ({ id, title, content: <><p>{answer}</p><Link to={id === 'seo' ? '/services' : '/contact'} className="studio-text-link mt-4">{id === 'seo' ? 'Explore our services' : 'Discuss your project'} ↗</Link></> }))} />
      <div className="editorial-callout mt-16"><h2 className="section-heading">Something else on your mind?</h2><p className="reading-copy">Tell us what you need to know. We’ll help you work out the next step.</p><Link to="/contact" className="studio-button mt-6">Ask us a question</Link></div>
    </section>
  </div>;
}
