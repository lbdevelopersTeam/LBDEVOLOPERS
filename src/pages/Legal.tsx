import { motion } from 'motion/react';
import { SectionHeader } from '../components/common/UI';
import { useLocation } from 'react-router-dom';
import { LetterReveal, TextReveal, HeroBackground } from '../components/common/Animations';

export default function Legal() {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-12"
    >
      <div>
        {/* Proper Legal Hero */}
        <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
          <HeroBackground poster="/images/thesearchforabsolutesection.jpg" />
          
          <div className="relative z-10 max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-8 overflow-hidden backdrop-blur-sm"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
              <LetterReveal 
                text="COMPLIANCE" 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60" 
              />
            </motion.div>

            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="fluid-display font-display font-black uppercase leading-none"
              >
                {isPrivacy ? 'Privacy policy' : 'Terms of service'}
              </motion.h1>
            </div>

            <TextReveal 
              text={`Last updated: April 20, 2026. Please read our ${isPrivacy ? "privacy" : "service"} terms carefully.`}
              className="text-white/40 text-xl font-light"
            />
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Security</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        <div className="max-w-4xl mx-auto mt-8 px-6 sm:px-8 md:px-12">
          <div className="prose prose-invert prose-base md:prose-lg max-w-none space-y-10 md:space-y-12 text-white/60">
          <section>
            <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, request a quote, or communicate with us. This information may include your name, email address, phone number, and company details.
            </p>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">2. How We Use Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect LB CodeBase and our users. We also use the information to communicate with you about products, services, and events.
            </p>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">3. Data Security</h3>
            <p>
              We use a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. These measures include advanced encryption and secure server environments.
            </p>
          </section>

          <section>
            <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">4. Third-Party Services</h3>
            <p>
              Our website may contain links to other websites. Please be aware that we are not responsible for the content or privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.
            </p>
          </section>

          {isPrivacy ? (
             <section>
               <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">5. Cookies Policy</h3>
               <p>
                 We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.
               </p>
             </section>
          ) : (
            <section>
               <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-5 md:mb-6">5. Limitation of Liability</h3>
               <p>
                 In no event shall LB CodeBase be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LB CodeBase' website.
               </p>
            </section>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  );
}
