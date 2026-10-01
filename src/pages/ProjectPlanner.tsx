import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { useContactEmail } from '../lib/site-settings';

const steps = [
  { id: 'type', label: 'Type', question: 'What are you planning?', help: 'Next, we’ll ask what you want the project to improve.', options: ['A new website', 'A website redesign', 'A mobile app', 'A commerce store', 'Not sure yet'] },
  { id: 'goal', label: 'Goals', question: 'What matters most?', help: 'Next, review your answers and choose how to contact us.', options: ['More qualified leads', 'Better product discovery', 'A faster site', 'Launching something new', 'Internal efficiency', 'Not sure yet'] },
];

export default function ProjectPlanner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const email = useContactEmail();
  const goTo = (next: number) => { setStep(next); requestAnimationFrame(() => heading.current?.focus()); };
  const summary = `Project starting point\n\nType: ${answers.type || 'Not decided'}\nMain goal: ${answers.goal || 'Not decided'}\n\nCompany / business:\nExisting website and assets:\nPages or features needed:\nTarget launch:\nBudget range (if known):`;
  return <div className="studio-page"><div className="studio-container compact-hero max-w-4xl">
    <p className="eyebrow">Project starting-point planner</p>
    <h1 className="display-heading">Let’s shape your brief.</h1>
    <p className="reading-copy mb-10">You don’t need a technical specification. Start with the kind of work and the outcome you need.</p>
    <ol className="planner-progress" aria-label="Planner progress">{['Type', 'Goals', 'Contact'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}{step > index && <Check size={16} className="inline ml-2" aria-label="Complete" />}</li>)}</ol>
    {step < steps.length ? <section aria-label={steps[step].label}>
      <h2 ref={heading} tabIndex={-1} className="section-heading mb-4">{steps[step].question}</h2>
      <p className="reading-copy mb-8">{steps[step].help}</p>
      <div className="grid gap-4 sm:grid-cols-2">{steps[step].options.map((option) => <button type="button" key={option} className="planner-choice" aria-pressed={answers[steps[step].id] === option} onClick={() => setAnswers((previous) => ({ ...previous, [steps[step].id]: option }))}><span className="flex-1">{option}</span>{answers[steps[step].id] === option && <Check size={20} className="accent-text" aria-hidden="true" />}</button>)}</div>
      <div className="flex justify-between items-center gap-4 mt-8">{step > 0 ? <button type="button" className="studio-text-link" onClick={() => goTo(step - 1)}><ArrowLeft size={16} />Back</button> : <span />}<button type="button" className="studio-button disabled:opacity-50 disabled:cursor-not-allowed" disabled={!answers[steps[step].id]} onClick={() => goTo(step + 1)}>Continue <ArrowRight size={16} /></button></div>
    </section> : <section className="editorial-callout">
      <h2 ref={heading} tabIndex={-1} className="section-heading">Your starting point.</h2>
      <dl className="mt-6 space-y-4"><div><dt className="eyebrow !mb-2">Type</dt><dd>{answers.type}</dd></div><div><dt className="eyebrow !mb-2">Main goal</dt><dd>{answers.goal}</dd></div></dl>
      <p className="reading-copy">Nothing has been sent yet. Your answers will be included in the inquiry form, where you can add scope, budget, and timing.</p>
      <div className="flex flex-wrap gap-4 mt-8"><Link to="/contact" state={{ projectBrief: summary }} className="studio-button">Continue to contact</Link><a href={`mailto:${email}?subject=Project%20starting%20point&body=${encodeURIComponent(summary)}`} className="studio-button studio-button-secondary">Email your brief</a></div>
      <a href={`https://wa.me/923489077329?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer" className="studio-text-link mt-4">Send it on WhatsApp</a>
      <div><button type="button" onClick={() => goTo(1)} className="studio-text-link mt-4"><ArrowLeft size={16} />Edit your answers</button></div>
    </section>}
  </div></div>;
}
