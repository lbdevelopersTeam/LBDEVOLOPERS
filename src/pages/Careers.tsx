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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal 
                text="OPPORTUNITIES" 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60" 
              />
            </motion.div>

            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="fluid-display font-display font-black max-w-5xl uppercase leading-none"
              >
                SHAPE THE <br />
                <span className="text-white/20 italic tracking-tighter">FUTURE.</span>
              </motion.h1>
            </div>

            <TextReveal 
              text="Join a culture of engineering excellence and aesthetic obsession. We're looking for extraordinary talent to build world-class products."
              className="text-white/40 text-xl md:text-2xl max-w-3xl leading-relaxed font-light"
            />
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Join Us</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        {/* Culture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-16 md:mb-24">
          {[
            { icon: <Zap className="text-brand-primary" />, title: 'Innovation First', desc: 'We experiment with the latest tech to stay ahead.' },
            { icon: <Heart className="text-brand-primary" />, title: 'Culture of Trust', desc: 'We value autonomy and transparency above all.' },
            { icon: <Globe className="text-brand-primary" />, title: 'Global Impact', desc: 'Work on products used by millions worldwide.' },
            { icon: <Target className="text-brand-primary" />, title: 'Growth Mindset', desc: 'Continuous learning is part of our DNA.' },
          ].map((item, i) => (
            <div key={i} className="p-6 md:p-10 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5">
              <div className="mb-6">{item.icon}</div>
              <h4 className="text-xl font-bold mb-4">{item.title}</h4>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Positions */}
        <section className="mb-24">
          <h3 className="text-3xl font-display font-black mb-10 uppercase tracking-tight">Open Positions</h3>
          <div className="space-y-6">
            {positions.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group p-5 sm:p-8 bg-brand-gray border border-white/5 rounded-[1.5rem] md:rounded-[2rem] hover:border-brand-primary/50 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">{job.department}</span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold group-hover:text-brand-primary transition-colors uppercase tracking-tight">{job.title}</h4>
                </div>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary transition-all">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 sm:p-10 md:p-24 bg-brand-primary rounded-[1.5rem] md:rounded-[3.5rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
            <Zap className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-8 uppercase tracking-tighter leading-none">Don't see a fit?</h2>
            <p className="text-white/80 text-base md:text-xl max-w-2xl mx-auto mb-10 font-light">
              We're always looking for extraordinary talent. Send us your CV and we'll keep you in mind for future openings.
            </p>
            <Button variant="secondary" size="lg" className="bg-brand-dark text-white hover:bg-brand-dark/90">Send spontaneous application</Button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
