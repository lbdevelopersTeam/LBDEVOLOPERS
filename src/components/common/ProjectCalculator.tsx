import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContactEmail } from '../../lib/site-settings';

export default function ProjectCalculator() {
  const id = useId();
  const email = useContactEmail();
  const [scope, setScope] = useState({ type: 'Website', business: '', features: '', deadline: '', assets: 'Not sure yet' });
  const fields = [
    { key: 'business' as const, label: 'Business or brand', placeholder: 'Who is the product for?' },
    { key: 'features' as const, label: 'Pages or features', placeholder: 'For example: a catalogue, bookings, or a customer portal' },
    { key: 'deadline' as const, label: 'Target launch', placeholder: 'A date, a rough timeframe, or flexible' },
  ];
  const brief = `Project starting point\n\nProduct: ${scope.type}\nBusiness: ${scope.business || 'To discuss'}\nPages / features: ${scope.features || 'To discuss'}\nTarget launch: ${scope.deadline || 'Flexible'}\nExisting assets: ${scope.assets}`;
  return <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
    <div className="contact-form-panel space-y-6">
      <div><label htmlFor={`${id}-type`} className="block mb-2">What do you need?</label><select id={`${id}-type`} value={scope.type} onChange={(event) => setScope({ ...scope, type: event.target.value })} className="w-full rounded-xl border border-white/20 bg-brand-dark p-3">{['Website', 'Redesign', 'Commerce store', 'Mobile app', 'Not sure yet'].map((type) => <option key={type}>{type}</option>)}</select></div>
      {fields.map(({ key, label, placeholder }) => <div key={key}><label htmlFor={`${id}-${key}`} className="block mb-2">{label} <span className="text-white/65 text-sm">(optional)</span></label><input id={`${id}-${key}`} value={scope[key]} onChange={(event) => setScope({ ...scope, [key]: event.target.value })} maxLength={300} placeholder={placeholder} className="w-full rounded-xl border border-white/20 bg-brand-dark p-3 placeholder:text-white/55" /></div>)}
      <div><label htmlFor={`${id}-assets`} className="block mb-2">What is ready already?</label><select id={`${id}-assets`} value={scope.assets} onChange={(event) => setScope({ ...scope, assets: event.target.value })} className="w-full rounded-xl border border-white/20 bg-brand-dark p-3">{['Not sure yet', 'Brand assets and content', 'An existing website', 'Starting from scratch'].map((value) => <option key={value}>{value}</option>)}</select></div>
    </div>
    <aside className="editorial-callout"><h3 className="font-display text-2xl">A useful starting point.</h3><p className="reading-copy">Cost and timing depend on scope, integrations, content, and support. We’ll review your brief before giving a quote.</p><p className="reading-copy">The proposal will explain what is included, review rounds, handover, and any separate hosting or maintenance costs.</p><pre className="whitespace-pre-wrap break-words font-sans text-base text-white/80 my-6">{brief}</pre><Link to="/contact" state={{ projectBrief: brief }} className="studio-button">Discuss this brief</Link><a className="studio-text-link mt-4" href={`mailto:${email}?subject=Project%20starting%20point&body=${encodeURIComponent(brief)}`}>Open an email draft ↗</a><p className="text-sm text-white/75 mt-4">Nothing is submitted until you send the inquiry or email.</p></aside>
  </div>;
}
