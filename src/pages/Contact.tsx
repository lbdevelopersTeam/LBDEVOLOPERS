import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { LetterReveal, TextReveal, HeroBackground } from '../components/common/Animations';
import ContactForm from '../components/common/ContactForm';
import { useContactEmail } from '../lib/site-settings';
import { ContactFlow } from '../components/common/StudioVisuals';
import { useLocation } from 'react-router-dom';

export default function Contact() {
  const contactEmail = useContactEmail();
  const { state } = useLocation();
  const brief = state?.projectBrief;
  const contactChannels = [
    { icon: Mail, href: `mailto:${contactEmail}`, label: 'Email LB CodeBase' },
    { icon: MessageSquare, href: 'https://wa.me/923489077329?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.', label: 'Chat with LB CodeBase on WhatsApp' },
  ];
  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      {/* Proper Contact Hero */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 overflow-hidden">
        <HeroBackground videoSrc="/videos/other-pages-hero.mp4" poster="/images/consultancyservice.jpg" />
          
          <div className="max-w-[1600px] mx-auto w-full px-6 relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
              >
                <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                <LetterReveal 
                  text="LET'S WORK TOGETHER"
                  className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60" 
                />
              </motion.div>

              <div className="overflow-hidden mb-12">
                <motion.h1
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.95] tracking-tighter"
                >
                  Your next idea.<br />
                  <span className="text-brand-primary">Starts here.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="Tell us what you are building, what needs to improve, and when you want to launch. We will help you work out the right next step."
                className="text-white/60 text-xl md:text-3xl max-w-3xl leading-tight font-light"
              />
            </div>
          </div>
          
          <div className="absolute bottom-12 right-12 z-20 hidden lg:block">
             <div className="relative aspect-video glass rounded-[3rem] border-white/5 overflow-hidden group w-96">
                <div className="absolute inset-0 bg-brand-primary/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/images/pakistanflag.jpg" alt="Pakistan flag" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                   <MapPin className="w-12 h-12 text-white shadow-2xl" />
                </div>
             </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 right-0 md:right-12 flex flex-col items-end gap-4"
          >
            <div className="w-[1px] h-32 bg-gradient-to-b from-brand-primary/50 via-brand-primary/10 to-transparent" />
          </motion.div>
        </section>

        <ContactFlow />

        <div className="max-w-[1600px] mx-auto px-4 py-16 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 sm:gap-12 lg:gap-24 mb-16 sm:mb-24 lg:mb-32">
          {/* Contact Info */}
          <div className="min-w-0 space-y-12 sm:space-y-16 lg:space-y-20">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.4em] text-brand-primary mb-8 md:mb-12">CONTACT DETAILS</div>
              
              <div className="space-y-10 md:space-y-16">
                {[
                  { icon: Mail, label: "Email", val: contactEmail },
                  { icon: Phone, label: "Phone / WhatsApp", val: "+92 348 9077329" },
                  { icon: MapPin, label: "Our studio", val: "Mingora, Swat, Pakistan" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="flex items-start gap-4 sm:gap-8 group cursor-crosshair"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-500 group-hover:scale-110">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.18em] sm:tracking-[0.3em] mb-2">{item.label}</div>
                      <div className="text-base sm:text-lg md:text-xl font-medium tracking-tight group-hover:text-brand-primary transition-colors break-words">{item.val}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-12 md:pt-20 border-t border-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.4em] text-brand-primary mb-8 md:mb-12">DIGITAL PRESENCE</div>
              <div className="flex gap-6">
                {contactChannels.map((channel) => (
                  <a 
                    key={channel.label}
                    href={channel.href}
                    target={channel.href.startsWith('https://') ? '_blank' : undefined}
                    rel={channel.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                    aria-label={channel.label}
                    className="w-14 h-14 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary transition-all group duration-500 hover:-translate-y-2 glass"
                  >
                    <channel.icon aria-hidden="true" className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="min-w-0">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-4 sm:p-6 md:p-8 lg:p-12 rounded-[1rem] md:rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden glass shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <Send className="w-40 h-40" />
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold tracking-tighter mb-8">Tell us about <span className="text-brand-primary">your project.</span></h3>
              
              <ContactForm variant="cinematic" initialSubject={typeof brief?.subject === 'string' ? brief.subject : ''} initialMessage={typeof brief?.message === 'string' ? brief.message : ''} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
