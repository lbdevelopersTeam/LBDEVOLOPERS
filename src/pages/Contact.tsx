import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { LetterReveal, TextReveal, HeroBackground } from '../components/common/Animations';
import ContactForm from '../components/common/ContactForm';
import { useContactEmail } from '../lib/site-settings';

export default function Contact() {
  const contactEmail = useContactEmail();
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
                  text="INITIATION" 
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
                  LET'S DEFINE <br />
                  <span className="text-brand-primary italic">THE NEXT.</span>
                </motion.h1>
              </div>

              <TextReveal 
                text="Ready to engineer your digital evolution? Secure your position in the next generation of global market leaders. Initiate the connection below."
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

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 sm:gap-12 lg:gap-20 mb-16 sm:mb-24 lg:mb-32">
          {/* Contact Info */}
          <div className="min-w-0 space-y-10 sm:space-y-12">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.3em] text-brand-primary mb-7">CONTACT DETAILS</div>
              
              <div className="space-y-8 md:space-y-10">
                {[
                  { icon: Mail, label: "Email", val: contactEmail },
                  { icon: Phone, label: "Phone", val: "+92 348 9077329" },
                  { icon: MapPin, label: "Location", val: "Mingora, Swat, Pakistan" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="flex items-start gap-4 sm:gap-6 group"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-brand-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.18em] sm:tracking-[0.3em] mb-2">{item.label}</div>
                      <div className="text-base sm:text-lg md:text-xl font-display font-semibold tracking-tight break-all">{item.val}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.3em] text-brand-primary mb-6">PREFERRED CHANNELS</div>
              <div className="flex gap-6">
                {contactChannels.map((channel) => (
                  <a 
                    key={channel.label}
                    href={channel.href}
                    target={channel.href.startsWith('https://') ? '_blank' : undefined}
                    rel={channel.href.startsWith('https://') ? 'noopener noreferrer' : undefined}
                    aria-label={channel.label}
                    className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary transition-colors group duration-300"
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
              className="p-5 sm:p-8 lg:p-12 bg-brand-gray border border-white/10 relative overflow-hidden"
            >
              <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-8">Tell us about your <span className="text-brand-primary">project.</span></h3>
              
              <ContactForm variant="cinematic" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
