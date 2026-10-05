import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader, Button } from '../components/common/UI';
import React, { useState } from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { TextReveal, LetterReveal, Magnetic, HeroBackground } from '../components/common/Animations';

const faqs = [
  {
    question: "WHAT INDUSTRIES DO YOU DOMINATE?",
    answer: "We work with clients across various sectors, including luxury retail, fintech, AI startups, and enterprise software. Our versatile team adapts to the unique needs of each industry while maintaining our commitment to premium quality."
  },
  {
    question: "HOW LONG IS THE PATH TO PERFECTION?",
    answer: "Project timelines vary depending on complexity. A premium landing page might take 2-4 weeks, while a comprehensive SaaS platform could range from 3-6 months. We prioritize quality and precision over speed."
  },
  {
    question: "WHAT HAPPENS AFTER THE LAUNCH?",
    answer: "Yes, we provide ongoing maintenance and support packages to ensure your digital products stay secure, updated, and high-performing as your business grows."
  },
  {
    question: "DO YOU RECONSTRUCT EXISTING BRANDS?",
    answer: "We offer full brand strategy and identity services. Whether you need a fresh start or want to evolve an existing brand, we help define your visual language and digital presence."
  }
];

const FAQItem: React.FC<{ question: string; answer: string; i: number }> = ({ question, answer, i }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-white/5 last:border-none group"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-7 md:py-10 flex justify-between items-center gap-5 text-left focus:outline-none"
      >
        <span className={cn(
          "text-lg md:text-2xl font-display font-bold tracking-tight transition-colors duration-300",
          isOpen ? "text-brand-primary" : "text-white/80 group-hover:text-white"
        )}>{question}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center border transition-all duration-300",
            isOpen ? "bg-brand-primary border-brand-primary text-white" : "border-white/10 text-white/40 group-hover:border-white/30"
          )}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/60 text-base md:text-lg leading-relaxed pb-8 md:pb-10 max-w-3xl font-light">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-12 px-6 sm:px-8 md:px-12 lg:px-24"
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Proper FAQ Hero */}
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
                text="ASSISTANCE" 
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
                YOUR <br />
                <span className="text-white/10 uppercase italic tracking-tighter">ANSWERS.</span>
              </motion.h1>
            </div>

            <TextReveal 
              text="Everything you need to know about working with LB CodeBase. If you can't find your answer here, feel free to reach out to our engineering team."
              className="text-white/40 text-xl md:text-2xl leading-relaxed font-light"
            />
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/20">Expand</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-brand-primary/40 to-transparent" />
          </motion.div>
        </section>

        <div className="max-w-5xl mt-8 border-t border-white/5">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} i={i} />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 md:mt-28 px-6 py-12 sm:px-10 md:py-16 bg-brand-gray text-center relative overflow-hidden border border-white/10"
        >
            <h3 className="text-3xl md:text-5xl font-display font-black mb-5 tracking-tighter uppercase">Still curious?</h3>
            <p className="text-white/60 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light">Tell us what you are planning, and we can help identify a practical next step.</p>
            <Magnetic strength={0.2}>
              <Button size="lg" data-cursor="TALK">
                Get in touch
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Magnetic>
        </motion.div>
      </div>
    </motion.div>
  );
}
