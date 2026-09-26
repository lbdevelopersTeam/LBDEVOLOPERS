import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './UI';
import { Send, CheckCircle2 } from 'lucide-react';
import { apiRequestUrl, publicApiEnabled } from '../../lib/content';
import { useContactEmail } from '../../lib/site-settings';

interface ContactFormProps {
  memberId?: string;
  memberName?: string;
  variant?: 'panel' | 'editorial' | 'cinematic';
}

export default function ContactForm({ memberId, memberName, variant = 'panel' }: ContactFormProps = {}) {
  const fieldId = useId();
  const contactEmail = useContactEmail();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'High-Performance Web Ecosystem',
    message: '',
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
        setFormData({ name: '', email: '', subject: 'High-Performance Web Ecosystem', message: '', website: '' });
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={variant === 'editorial' ? 'border-y border-white/12 py-12 text-left' : variant === 'cinematic' ? 'rounded-3xl border border-brand-primary/20 bg-brand-primary/10 p-8 text-left' : 'p-12 text-center bg-brand-primary/10 border border-brand-primary/20 rounded-3xl'}
      >
        <CheckCircle2 className={`mb-6 h-12 w-12 ${variant === 'editorial' ? 'text-[var(--member-accent)]' : 'mx-auto text-brand-primary'}`} />
        <h3 className="mb-4 font-display text-2xl font-black uppercase tracking-normal">Message received</h3>
        <p className="text-white/70 mb-8">
          {publicApiEnabled
            ? `Your message has been sent${memberName ? ` to ${memberName}` : ''}. The team will follow up using the email you provided.`
            : `Your email app has been opened with the message ready for ${memberName || 'LB CodeBase'}. Send it there to complete your inquiry.`}
        </p>
        <Button onClick={() => setStatus('idle')} variant="outline">Send Another Message</Button>
      </motion.div>
    );
  }

  const labelClass = variant === 'editorial'
    ? 'text-[9px] font-black uppercase tracking-[0.15em] text-white/70'
    : variant === 'cinematic'
      ? 'px-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/70 sm:tracking-[0.4em]'
      : 'text-sm font-medium text-white/60';
  const fieldClass = variant === 'editorial'
    ? 'w-full rounded-none border-0 border-b border-white/14 bg-transparent px-0 py-4 text-white outline-none transition-colors placeholder:text-white/18 focus:border-[var(--member-accent)]'
    : variant === 'cinematic'
      ? 'w-full border-0 border-b border-white/10 bg-transparent px-2 py-4 text-lg text-white outline-none transition-colors placeholder:text-white/10 focus:border-brand-primary'
      : 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors glass';

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-name`} className={labelClass}>Full Name</label>
          <input
            type="text"
            id={`${fieldId}-name`}
            required
            minLength={2}
            maxLength={120}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={fieldClass}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${fieldId}-email`} className={labelClass}>Email Address</label>
          <input
            type="email"
            id={`${fieldId}-email`}
            required
            maxLength={254}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={fieldClass}
            placeholder="john@example.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor={`${fieldId}-subject`} className={labelClass}>Subject</label>
        <select
          id={`${fieldId}-subject`}
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={`${fieldClass} appearance-none`}
        >
          <option className="bg-brand-dark" value="High-Performance Web Ecosystem">Web Development</option>
          <option className="bg-brand-dark" value="Brand Authority Definition">UI/UX Design</option>
          <option className="bg-brand-dark" value="Next-Gen Mobile Architecture">Mobile App</option>
          <option className="bg-brand-dark" value="Strategic Engineering Consultancy">Engineering Consultancy</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${fieldId}-message`} className={labelClass}>Message</label>
        <textarea
          id={`${fieldId}-message`}
          rows={4}
          required
          minLength={10}
          maxLength={5000}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${fieldClass} resize-none`}
          placeholder="Tell us about your project..."
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
        {status === 'submitting' ? 'Transmitting...' : variant === 'cinematic' ? 'Initiate Transmission' : 'Send Message'}
        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Button>
      {status === 'error' && <p className="text-red-500 text-xs mt-2 uppercase tracking-widest font-black">Error in transmission. Try again.</p>}
    </form>
  );
}
