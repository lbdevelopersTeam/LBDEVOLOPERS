import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './UI';
import { Send, CheckCircle2 } from 'lucide-react';
import { apiRequestUrl, publicApiEnabled } from '../../lib/content';
import { useContactEmail } from '../../lib/site-settings';
import { Link } from 'react-router-dom';

interface ContactFormProps {
  memberId?: string;
  memberName?: string;
  variant?: 'panel' | 'editorial' | 'cinematic';
  initialMessage?: string;
}

export default function ContactForm({ memberId, memberName, variant = 'panel', initialMessage = '' }: ContactFormProps = {}) {
  const fieldId = useId();
  const contactEmail = useContactEmail();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: initialMessage,
    website: '',
  });
  const submissionController = useRef<AbortController | null>(null);

  useEffect(() => () => submissionController.current?.abort(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    if (!publicApiEnabled) {
      const recipient = memberName ? `${memberName} at LB CodeBase` : 'LB CodeBase';
      const body = [`Hello ${recipient},`, '', formData.message, '', `From: ${formData.name}`, `Reply to: ${formData.email}`].join('\n');
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
      setStatus('success');
      return;
    }

    submissionController.current?.abort();
    const controller = new AbortController();
    submissionController.current = controller;

    try {
      const res = await fetch(apiRequestUrl('/api/v2/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, memberId }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      } else {
        setStatus('error');
      }
    } catch {
      if (!controller.signal.aborted) setStatus('error');
    } finally {
      if (submissionController.current === controller) submissionController.current = null;
    }
  };

  if (status === 'success') {
    return (
      <motion.div role="status" tabIndex={-1} ref={(node) => node?.focus()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={variant === 'editorial' ? 'border-y border-white/12 py-12 text-left' : variant === 'cinematic' ? 'rounded-3xl border border-brand-primary/20 bg-brand-primary/10 p-8 text-left' : 'p-12 text-center bg-brand-primary/10 border border-brand-primary/20 rounded-3xl'}
      >
        <CheckCircle2 className={`mb-6 h-12 w-12 ${variant === 'editorial' ? 'text-[var(--member-accent)]' : 'mx-auto text-brand-primary'}`} />
        <h3 className="mb-4 font-display text-2xl font-semibold">{publicApiEnabled ? 'Message received' : 'Your email draft is ready'}</h3>
        <p className="text-white/70 mb-8">
          {publicApiEnabled
            ? `Your message has been sent${memberName ? ` to ${memberName}` : ''}. We usually reply within one business day using the email you provided, with a clear next step.`
            : `Your email app has been opened with the message ready for ${memberName || 'LB CodeBase'}. Send it there to complete your inquiry.`}
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline">Send another message</Button>
      </motion.div>
    );
  }

  const labelClass = variant === 'editorial'
    ? 'text-sm font-medium text-white/70'
    : variant === 'cinematic'
      ? 'px-2 text-sm font-medium text-white/70 '
      : 'text-sm font-medium text-white/60';
  const fieldClass = variant === 'editorial'
    ? 'w-full rounded-none border-0 border-b border-white/14 bg-transparent px-0 py-4 text-white outline-none transition-colors placeholder:text-white/55 focus:border-[var(--member-accent)]'
    : variant === 'cinematic'
      ? 'w-full border-0 border-b border-white/10 bg-transparent px-2 py-4 text-lg text-white outline-none transition-colors placeholder:text-white/55 focus:border-brand-primary'
      : 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors glass';

  return (
    <form className="space-y-6" onSubmit={handleSubmit} aria-busy={status === 'submitting'}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-name`} className={labelClass}>Full name *</label>
          <input
            type="text"
            id={`${fieldId}-name`}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-email`} className={labelClass}>Email address *</label>
          <input
            type="email"
            id={`${fieldId}-email`}
            required
            maxLength={254}
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${fieldId}-subject`} className={labelClass}>Service *</label>
        <select
          id={`${fieldId}-subject`}
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={`${fieldClass} appearance-none`}
        >
          <option className="bg-brand-dark" value="">Choose a service</option>
          <option className="bg-brand-dark" value="Web development">Web development</option>
          <option className="bg-brand-dark" value="Design or redesign">Design or redesign</option>
          <option className="bg-brand-dark" value="Mobile app">Mobile app</option>
          <option className="bg-brand-dark" value="Commerce">Shopify and commerce</option>
          <option className="bg-brand-dark" value="Audit and support">Audit and support</option>
          <option className="bg-brand-dark" value="Not sure yet">Not sure yet</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${fieldId}-message`} className={labelClass}>Your project *</label>
        <textarea
          placeholder="What are you trying to launch, improve, or fix?"
          id={`${fieldId}-message`}
          rows={4}
          required
          minLength={10}
          maxLength={5000}
          autoComplete="off"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      <Button className={`w-full py-4 group ${variant === 'editorial' ? '!rounded-none !bg-[var(--member-accent)] !text-black' : ''} ${variant === 'cinematic' ? 'shadow-2xl shadow-brand-primary/20' : ''}`} disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send your project details'}
        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Button>
      {status === 'error' && <p role="alert" className="text-red-200 text-base mt-2">Your message could not be sent. Your details are still here; try again or <a className="underline" href={`mailto:${contactEmail}`}>email us directly</a>.</p>}
      <p className="text-sm leading-relaxed text-white/75">We use these details to reply to your inquiry. Read our <Link to="/privacy" className="underline underline-offset-4">privacy policy</Link>.</p>
    </form>
  );
}
