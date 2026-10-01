import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { Calendar, Clock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchJson } from '../lib/content';
import { useNavigate } from 'react-router-dom';

interface AvailableDate {
  value: string;
  day: string;
  date: string;
  label: string;
}

const buildAvailableDates = (): AvailableDate[] => {
  const options: AvailableDate[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (options.length < 5) {
    cursor.setDate(cursor.getDate() + 1);
    const weekday = cursor.getDay();
    if (weekday === 0 || weekday === 6) continue;

    options.push({
      value: cursor.toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(cursor).toUpperCase(),
      date: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(cursor),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(cursor),
    });
  }

  return options;
};

const fieldClass = 'w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';

export default function Booking() {
  const navigate = useNavigate();
  const dates = useMemo(buildAvailableDates, []);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState({ name: '', email: '', notes: '', website: '' });
  const submissionController = useRef<AbortController | null>(null);

  useEffect(() => () => submissionController.current?.abort(), []);

  const timeSlots = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
  const selectedDateOption = dates.find((option) => option.value === selectedDate);

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedDateOption || !selectedTime) return;

    setSubmitting(true);
    setError('');
    submissionController.current?.abort();
    const controller = new AbortController();
    submissionController.current = controller;
    try {
      await fetchJson<{ id: string }>('/api/v2/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          subject: `Strategy call request — ${selectedDateOption.label}`,
          message: `Requested time: ${selectedDateOption.label} at ${selectedTime} Pakistan Standard Time.\n\nProject context: ${details.notes}`,
          website: details.website,
        }),
      });
      if (!controller.signal.aborted) setStep(4);
    } catch {
      if (!controller.signal.aborted) setError('We could not send your request. Please try again or use the contact page.');
    } finally {
      if (submissionController.current === controller) {
        submissionController.current = null;
        if (!controller.signal.aborted) setSubmitting(false);
      }
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-brand-dark px-6 pb-16 pt-28 sm:px-8 md:px-12 md:pb-20 md:pt-32 lg:px-24"
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="sr-only">Request a strategy call</h1>
        <SectionHeader
          badge="Strategy Call"
          title="Request your 1:1 session."
          description="Choose a preferred time and share your contact details. We will confirm availability and send meeting details by email."
          align="center"
        />

        <div className="mt-10 grid min-h-[600px] grid-cols-1 overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#0c0c0c] md:mt-16 md:grid-cols-12 md:rounded-[2.5rem]">
          <div className="border-b border-white/5 bg-brand-gray p-6 md:col-span-4 md:border-b-0 md:border-r md:p-10">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary/10">
              <Globe aria-hidden="true" className="w-8 h-8 text-brand-primary animate-spin-slow" />
            </div>
            <h2 className="mb-4 font-display text-xl font-black uppercase tracking-tight">Strategy Audit</h2>
            <div className="space-y-6 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <Clock aria-hidden="true" className="w-4 h-4 text-brand-primary" />
                <span>15 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar aria-hidden="true" className="w-4 h-4 text-brand-primary" />
                <span>Video call after confirmation</span>
              </div>
              <p className="border-t border-white/5 pt-6 font-light leading-relaxed">
                We will discuss your goals, review the current experience, and identify the clearest next step. Times are shown in Pakistan Standard Time (UTC+5).
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:col-span-8 md:p-16">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="mb-8 flex items-center gap-3 text-base font-bold uppercase tracking-widest md:mb-10 md:text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs text-white">1</span>
                  Select a preferred date
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
                  {dates.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      aria-pressed={selectedDate === option.value}
                      onClick={() => setSelectedDate(option.value)}
                      className={`flex flex-col items-center rounded-2xl border p-4 transition-all duration-300 ${
                        selectedDate === option.value
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="mb-2 text-[10px] text-white/40">{option.day}</span>
                      <span className="text-lg font-bold">{option.date}</span>
                    </button>
                  ))}
                </div>
                {selectedDateOption && <p className="mt-5 text-sm text-white/50">Selected: {selectedDateOption.label}</p>}
                <div className="mt-10 flex justify-end md:mt-12">
                  <Button disabled={!selectedDate} onClick={() => setStep(2)} className="px-10">
                    Choose a time <ArrowRight aria-hidden="true" className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="mb-8 flex items-center gap-3 text-base font-bold uppercase tracking-widest md:mb-10 md:text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs text-white">2</span>
                  Select a preferred time
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      aria-pressed={selectedTime === time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-xl border p-4 text-center transition-all duration-300 ${
                        selectedTime === time
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="mt-10 flex flex-col-reverse justify-between gap-4 sm:flex-row md:mt-12">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button disabled={!selectedTime} onClick={() => setStep(3)} className="px-10">
                    Add contact details <ArrowRight aria-hidden="true" className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={submitRequest} autoComplete="off">
                <h2 className="mb-3 flex items-center gap-3 text-base font-bold uppercase tracking-widest md:text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs text-white">3</span>
                  Your details
                </h2>
                <p className="mb-8 text-sm leading-relaxed text-white/50">
                  Requesting {selectedDateOption?.label} at {selectedTime} Pakistan Standard Time.
                </p>
                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/45">Full name</span>
                    <input required minLength={2} maxLength={120} autoComplete="off" value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} className={fieldClass} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/45">Email address</span>
                    <input required type="email" maxLength={254} autoComplete="off" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} className={fieldClass} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/45">What should we prepare for?</span>
                    <textarea required minLength={10} maxLength={3000} rows={4} autoComplete="off" value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} className={fieldClass} />
                  </label>
                  <div className="hidden" aria-hidden="true">
                    <label>
                      Website
                      <input tabIndex={-1} autoComplete="off" value={details.website} onChange={(event) => setDetails({ ...details, website: event.target.value })} />
                    </label>
                  </div>
                </div>
                {error && <p role="alert" className="mt-5 text-sm text-red-400">{error}</p>}
                <div className="mt-8 flex flex-col-reverse justify-between gap-4 sm:flex-row">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button type="submit" disabled={submitting} className="px-10 disabled:cursor-wait disabled:opacity-60">
                    {submitting ? 'Sending request…' : 'Request this time'}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                  <CheckCircle2 aria-hidden="true" className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="mb-4 font-display text-3xl font-black uppercase">Request received</h2>
                <p className="mx-auto mb-10 max-w-md leading-relaxed text-white/60">
                  We received your request for <span className="font-bold text-white">{selectedDateOption?.label}</span> at <span className="font-bold text-white">{selectedTime}</span>. We will email you to confirm availability and meeting details.
                </p>
                <Button onClick={() => navigate('/')}>Return Home</Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
