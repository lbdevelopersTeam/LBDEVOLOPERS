import { useContactEmail } from '../lib/site-settings';
import { motion } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Heart, Globe, Target } from 'lucide-react';
import { LetterReveal, TextReveal, HeroBackground } from '../components/common/Animations';

const positions = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote / Dubai',
    type: 'Full-time'
  },
  {
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    title: 'Product Manager',
    department: 'Product',
    location: 'Dubai',
    type: 'Full-time'
  },
  {
    title: 'Backend specialist (Node.js)',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time'
  }
];

export default function Careers() {
  const email = useContactEmail();
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-12 px-6 sm:px-8 md:px-12 lg:px-24"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Proper Careers Hero */}
        <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
          <HeroBackground poster="/images/thesearchforabsolutesection.jpg" />

          <div className="relative z-10 max-w-5xl w-full">
            <motion.div
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal
                text="OPPORTUNITIES"
                className="text-xs font-semibold normal-case tracking-[0.1em] text-white/75"
              />
            </motion.div>

            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={false}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="fluid-display font-display font-semibold max-w-5xl normal-case leading-none"
              >
                Make useful <br />
                <span className="text-white/75 italic tracking-tighter">things together.</span>
              </motion.h1>
            </div>

            <TextReveal
              text="We work across design, development, and commerce. Share the work you care about and how you approach collaboration."
              className="text-white/75 text-xl md:text-2xl max-w-3xl leading-relaxed font-normal"
            />
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs normal-case tracking-[0.1em] text-white/75">Join Us</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        {/* Culture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-16 md:mb-24">
          {[
            { icon: <Zap className="text-blue-300" />, title: 'Thoughtful choices', desc: 'Choose tools around the product and the people maintaining it.' },
            { icon: <Heart className="text-blue-300" />, title: 'Culture of Trust', desc: 'We value autonomy and transparency above all.' },
            { icon: <Globe className="text-blue-300" />, title: 'Practical work', desc: 'Work on websites, commerce flows, and digital products.' },
            { icon: <Target className="text-blue-300" />, title: 'Keep learning', desc: 'Review decisions, share feedback, and learn from the work.' },
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-10 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
              <div className="mb-6">{item.icon}</div>
              <h4 className="text-xl font-bold mb-4">{item.title}</h4>
              <p className="text-white/75 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Positions */}
        <section className="mb-24">
          <h2 className="section-heading mb-6">Roles to discuss</h2><p className="reading-copy mb-10">Ask us for the current opening status, full role brief, salary range, timezone expectations, and application process before applying.</p>
          <div className="space-y-6">
            {positions.map((job, i) => (
              <motion.div
                key={i}
                initial={false}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group p-5 sm:p-8 bg-brand-gray border border-white/5 rounded-[1.5rem] md:rounded-[2rem] hover:border-brand-primary/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-300" />
                    <span className="text-xs font-bold normal-case tracking-widest text-white/75">{job.department}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold group-hover:text-blue-300 transition-colors normal-case tracking-tight">{job.title}</h4>
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-2 text-white/75 text-sm">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-white/75 text-sm">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  <a href={`mailto:${email}?subject=${encodeURIComponent(`Role inquiry: ${job.title}`)}`} aria-label={`Ask about the ${job.title} role`} className="studio-text-link">Ask about this role <ArrowRight className="w-5 h-5" /></a>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 sm:p-10 md:p-24 bg-brand-primary rounded-[1.5rem] md:rounded-[3.5rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-white/75 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
            <Zap className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-white mb-8 normal-case tracking-tighter leading-none">Don't see a fit?</h2>
            <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-10 font-normal">
              Send your CV, portfolio, and a short note about the kind of work you want to do. Include your location, timezone, and availability.
            </p>
            <a href={`mailto:${email}?subject=Portfolio%20and%20CV`} className="studio-button studio-button-secondary">Send your portfolio and CV</a>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
