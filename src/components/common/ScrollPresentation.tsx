import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Cpu, Layers3, Radar, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    eyebrow: '01 / Discovery',
    title: 'Strategy locks into place.',
    description:
      'The page stops behaving like a document and starts acting like a guided product launch. Every scroll step reveals the next business layer.',
    metric: '0.2s',
    metricLabel: 'decision feedback',
    accent: '#3D5AFE',
    icon: Radar,
    chips: ['Research', 'Positioning', 'Conversion Map'],
    visualTitle: 'Market Signal Grid',
  },
  {
    eyebrow: '02 / Interface',
    title: 'Screens assemble in motion.',
    description:
      'Layouts, cards, typography, and CTAs move as one cinematic system instead of floating randomly around the page.',
    metric: '3D',
    metricLabel: 'interface depth',
    accent: '#00E5FF',
    icon: Layers3,
    chips: ['Hero', 'Cards', 'Motion States'],
    visualTitle: 'UI Composition Engine',
  },
  {
    eyebrow: '03 / Commerce',
    title: 'Funnels become alive.',
    description:
      'Product flows, trust signals, and purchase paths transform with the scroll so users feel momentum without losing orientation.',
    metric: '+45%',
    metricLabel: 'conversion lift',
    accent: '#7C4DFF',
    icon: Zap,
    chips: ['Catalog', 'Checkout', 'Analytics'],
    visualTitle: 'Revenue Flow Model',
  },
  {
    eyebrow: '04 / Infrastructure',
    title: 'Systems reveal the engine.',
    description:
      'Performance, caching, APIs, admin control, and publishing pipelines become visible as a premium technical story.',
    metric: '99.9%',
    metricLabel: 'uptime target',
    accent: '#22C55E',
    icon: Cpu,
    chips: ['API', 'Cache', 'Admin'],
    visualTitle: 'Deployment Core',
  },
  {
    eyebrow: '05 / Launch',
    title: 'Everything snaps to launch.',
    description:
      'The final scroll state resolves into a clear action: consult, build, publish, and scale with confidence.',
    metric: '60fps',
    metricLabel: 'motion target',
    accent: '#F97316',
    icon: Rocket,
    chips: ['Staging', 'QA', 'Scale'],
    visualTitle: 'Launch Command',
  },
];

export default function ScrollPresentation() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex];
  const Icon = activeSlide.icon;

  return (
    <section
      className="relative py-24 md:py-32 bg-black text-white overflow-hidden border-t border-white/5"
      aria-label="Workflow presentation of LB CodeBase process"
    >
      {/* Background glow matching active slide */}
      <div
        className="absolute inset-0 transition-all duration-1000 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 50%, ${activeSlide.accent}33, transparent 50%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.03), transparent 40%)`
        }}
      />
      <div className="deck-grid absolute inset-0 opacity-20 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-12 lg:px-20">
        
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary block mb-3">Workflow Engine</span>
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.9]">
            LIKE A LAUNCH DECK.
          </h2>
          <p className="mt-4 text-white/50 font-light text-base md:text-lg">
            Our strategic pipeline turns standard web applications into highly coordinated product rollouts.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_1.1fr] gap-12 lg:gap-16 items-start">
          
          {/* Left: Tab selection track */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-4 pb-4 lg:pb-0 border-b border-white/5 lg:border-none no-scrollbar [scrollbar-width:none] snap-x">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                onClick={() => setActiveIndex(index)}
                className={`flex items-center gap-4 text-left py-3 px-4 rounded-xl border transition-all duration-500 min-w-[200px] lg:min-w-0 snap-center cursor-pointer ${
                  activeIndex === index
                    ? 'bg-white/[0.03] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                    : 'bg-transparent border-transparent hover:bg-white/[0.01]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center font-display font-black text-sm transition-all duration-500 ${
                    activeIndex === index
                      ? 'border-brand-primary/30 text-white'
                      : 'border-white/5 text-white/30'
                  }`}
                  style={{
                    backgroundColor: activeIndex === index ? `${slide.accent}22` : 'transparent',
                    color: activeIndex === index ? slide.accent : undefined
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${
                    activeIndex === index ? 'text-white' : 'text-white/30'
                  }`}>
                    {slide.eyebrow.split('/')[1].trim()}
                  </div>
                  <div className={`text-[11px] font-medium tracking-tight truncate max-w-[150px] lg:max-w-none ${
                    activeIndex === index ? 'text-white/80' : 'text-white/20'
                  }`}>
                    {slide.title}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Center: Slide Details */}
          <div className="min-h-[350px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-2xl">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeSlide.accent, boxShadow: `0 0 22px ${activeSlide.accent}` }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/55">{activeSlide.eyebrow}</span>
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-black uppercase leading-tight tracking-tighter">
                  {activeSlide.title}
                </h3>
                <p className="mt-6 text-sm md:text-base font-light leading-relaxed text-white/60">
                  {activeSlide.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                    <div className="font-display text-3xl font-black" style={{ color: activeSlide.accent }}>
                      {activeSlide.metric}
                    </div>
                    <div className="mt-1 text-[9px] font-black uppercase tracking-[0.3em] text-white/35">{activeSlide.metricLabel}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSlide.chips.map((chip) => (
                      <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                {activeIndex === slides.length - 1 && (
                  <Link
                    to="/contact"
                    className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white px-6 py-3.5 text-[9px] font-black uppercase tracking-[0.3em] text-black hover:bg-white/90 transition-all duration-300 shadow-lg"
                  >
                    Start the build <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Stage Visualization (Rings Mockup) */}
          <div className="relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
              >
                <div className="deck-stage relative w-full aspect-[4/3] sm:aspect-square md:aspect-[4/3] lg:aspect-square rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute -inset-6 rounded-full opacity-25 blur-[60px]" style={{ backgroundColor: activeSlide.accent }} />
                  <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">Live Module</div>
                        <h4 className="mt-1 font-display text-xl font-black uppercase tracking-tighter">{activeSlide.visualTitle}</h4>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10" style={{ color: activeSlide.accent }}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="relative mx-auto h-48 w-48 my-4">
                      <div className="deck-ring deck-ring-one" />
                      <div className="deck-ring deck-ring-two" />
                      <div className="deck-ring deck-ring-three" />
                      <div className="absolute inset-10 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="h-12 w-12" style={{ color: activeSlide.accent, filter: `drop-shadow(0 0 16px ${activeSlide.accent})` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {activeSlide.chips.map((chip, chipIndex) => (
                        <div key={chip} className="deck-mini-card rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                          <div className="mx-auto mb-2 h-1 rounded-full" style={{ width: `${45 + chipIndex * 15}%`, backgroundColor: activeSlide.accent }} />
                          <div className="text-[8px] font-black uppercase tracking-widest text-white/35 truncate">{chip}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
