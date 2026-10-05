import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { SectionHeader, Button } from '../components/common/UI';
import { ArrowRight, ArrowLeft, CheckCircle2, Layout, Monitor, Smartphone, Palette, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    id: 'type',
    question: "What type of product are we building?",
    options: [
      { id: 'new', label: 'New Website Design', icon: <Palette className="w-6 h-6" /> },
      { id: 'redesign', label: 'Website Redesign', icon: <Zap className="w-6 h-6" /> },
      { id: 'app', label: 'Mobile Application', icon: <Smartphone className="w-6 h-6" /> },
      { id: 'ecommerce', label: 'E-commerce Platform', icon: <Layout className="w-6 h-6" /> },
    ]
  },
  {
    id: 'focus',
    question: "What is your primary focus?",
    options: [
      { id: 'speed', label: 'Velocity & Performance', icon: <Zap className="w-6 h-6" /> },
      { id: 'aesthetic', label: 'Visual Storytelling', icon: <Palette className="w-6 h-6" /> },
      { id: 'conversion', label: 'Conversion & Growth', icon: <Monitor className="w-6 h-6" /> },
      { id: 'architect', label: 'Technical Infrastructure', icon: <Globe className="w-6 h-6" /> },
    ]
  },
  {
    id: 'budget',
    question: "What is your estimated investment tier?",
    options: [
      { id: 'essential', label: '$2.5k - $5k (Essential)', icon: null },
      { id: 'premium', label: '$7.5k - $15k (Premium)', icon: null },
      { id: 'elite', label: '$20k+ (Enterprise)', icon: null },
      { id: 'discuss', label: 'Let\'s Discuss', icon: null },
    ]
  }
];

export default function ProjectPlanner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: optionId });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 md:pt-32 pb-16 md:pb-20 px-6 sm:px-8 md:px-12 lg:px-24 bg-brand-dark"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="sr-only">Project planner</h1>
        {!isFinished ? (
          <>
            <div className="mb-10 md:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i <= currentStep ? 'w-12 bg-brand-primary' : 'w-4 bg-white/10'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10 md:space-y-12"
              >
                <header>
                  <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight leading-tight mb-4">
                    {steps[currentStep].question}
                  </h2>
                  <p className="text-white/60 text-base">Choose the option that best reflects your project.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps[currentStep].options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id)}
                    className={`group p-5 sm:p-7 border text-left transition-colors duration-300 hover:border-brand-primary/50 relative overflow-hidden ${
                        answers[steps[currentStep].id] === option.id 
                          ? 'border-brand-primary bg-brand-primary/10' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 relative z-10">
                        <div className="flex min-w-0 items-center gap-4">
                          {option.icon && <div className="text-brand-primary">{option.icon}</div>}
                          <span className="text-base sm:text-lg font-bold uppercase tracking-tight">{option.label}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-brand-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>

                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                  >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-[#0c0c0c] border border-white/10 p-6 sm:p-10 md:p-16"
          >
            <div className="w-24 h-24 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-10">
              <CheckCircle2 className="w-12 h-12 text-brand-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-5 tracking-tight">Plan complete.</h2>
            <p className="text-white/60 text-base md:text-xl font-light mb-10 md:mb-12 max-w-xl mx-auto leading-relaxed">
              Your project outline is ready. Share it with us or book a call to discuss the next step.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="w-full md:w-auto">Submit Specification</Button>
              </Link>
              <Link to="/booking">
                <Button size="lg" variant="outline" className="w-full md:w-auto">Book Strategy Session</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
