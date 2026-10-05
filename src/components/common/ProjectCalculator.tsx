import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Globe, Smartphone, Palette, Shield, Search } from 'lucide-react';
import { Button } from './UI';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'web', name: 'Web Development', icon: <Globe className="w-4 h-4" />, basePrice: 200 },
  { id: 'app', name: 'Mobile App', icon: <Smartphone className="w-4 h-4" />, basePrice: 200 },
  { id: 'ecom', name: 'E-commerce', icon: <Zap className="w-4 h-4" />, basePrice: 200 },
];

const ADDONS = [
  { id: 'design', name: 'Premium UI/UX Design', price: 80, icon: <Palette className="w-4 h-4" /> },
  { id: 'seo', name: 'SEO Optimization', price: 50, icon: <Search className="w-4 h-4" /> },
  { id: 'security', name: 'Elite Security Hardening', price: 100, icon: <Shield className="w-4 h-4" /> },
  { id: 'speed', name: 'Extreme Performance Optimization', price: 70, icon: <Zap className="w-4 h-4" /> },
];

export default function ProjectCalculator() {
  const navigate = useNavigate();
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const totalPrice = (CATEGORIES.find(c => c.id === category)?.basePrice || 0) + 
    selectedAddons.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price || 0), 0);

  return (
    <div className="w-full py-8 px-3 sm:px-4 relative overflow-hidden transition-all duration-1000">
      {/* Background Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.02] whitespace-nowrap">
        <div className="text-8xl md:text-[12rem] lg:text-[18rem] font-display font-black leading-none">ESTIMATE</div>
      </div>
      
      <div className="max-w-[1800px] mx-auto relative z-10 glass p-4 md:p-6 rounded-[2rem] border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-6 mb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.5em] lg:tracking-[0.8em] text-brand-primary mb-3">ALGORITHMIC ESTIMATOR</div>
            <h3 className="text-2xl md:text-4xl font-display font-black tracking-tighter uppercase leading-[0.9] md:leading-[0.8]">DEFINE YOUR <br /><span className="text-white/10 italic">MISSION.</span></h3>
          </div>
          <div className="flex items-center gap-4 px-4 sm:px-6 md:px-8 py-3 md:py-4 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5 backdrop-blur-3xl">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-brand-primary animate-pulse shadow-[0_0_20px_rgba(61,90,254,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] md:tracking-[0.4em] text-white/40">Real-time Calculation Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            {/* Category Selection */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.5em] md:tracking-[0.6em] text-white/20 mb-4 block underline decoration-brand-primary/40 underline-offset-4">Architecture Selection</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={category === cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-[1.25rem] md:rounded-[2rem] border transition-colors duration-200 [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark",
                      category === cat.id 
                        ? 'border-brand-primary bg-brand-primary/5 text-white' 
                        : 'border-white/5 bg-white/[0.01] text-white/20 hover:border-white/20'
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
                      category === cat.id ? "bg-brand-primary text-white shadow-[0_0_30px_rgba(61,90,254,0.4)]" : "bg-white/5"
                    )}>
                      {cat.icon}
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.3em] text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Addons */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.22em] sm:tracking-[0.5em] md:tracking-[0.6em] text-white/20 mb-4 block underline decoration-brand-primary/40 underline-offset-4">Technical Parameters</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {ADDONS.map((addon) => (
                  <button
                    key={addon.id}
                    type="button"
                    aria-pressed={selectedAddons.includes(addon.id)}
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "flex items-center justify-between gap-4 p-4 rounded-[1.25rem] md:rounded-[2.5rem] border transition-all duration-700 group relative overflow-hidden [-webkit-tap-highlight-color:transparent]",
                      selectedAddons.includes(addon.id)
                        ? 'border-brand-primary bg-brand-primary/5 text-white'
                        : 'border-white/5 bg-white/[0.01] text-white/20 hover:border-white/20'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
                        selectedAddons.includes(addon.id) ? "text-brand-primary" : "text-white/10"
                      )}>
                        {addon.icon}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.2em] mb-0">{addon.name}</span>
                        <div className="text-[10px] font-black text-brand-primary/60">+${addon.price}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-700",
                      selectedAddons.includes(addon.id) ? "bg-brand-primary border-brand-primary scale-110 shadow-lg shadow-brand-primary/20" : "border-white/10"
                    )}>
                      {selectedAddons.includes(addon.id) && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full p-5 sm:p-8 md:p-10 rounded-[1.5rem] md:rounded-[2rem] bg-brand-primary relative overflow-hidden flex flex-col justify-between shadow-3xl group/card">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-purple opacity-95" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.2),transparent_50%)]" />
              
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.5em] md:tracking-[0.6em] text-white/40 mb-8">PROJECT VALUATION</div>
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-end border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.4em] text-white/60">Base Engine</span>
                    <span className="text-2xl font-display font-black text-white tracking-tighter">${CATEGORIES.find(c => c.id === category)?.basePrice}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.4em] text-white/60">Addons ({selectedAddons.length})</span>
                    <span className="text-2xl font-display font-black text-white tracking-tighter">${selectedAddons.reduce((sum, id) => sum + (ADDONS.find(a => a.id === id)?.price || 0), 0)}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] sm:tracking-[0.5em] md:tracking-[0.6em] text-white/40 mb-4">ESTIMATED TOTAL</div>
                <motion.div 
                  key={totalPrice}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter mb-8 leading-none"
                >
                  ${totalPrice.toLocaleString()}
                </motion.div>
                
                <Button variant="secondary" size="lg" className="w-full hover:bg-white hover:text-brand-primary transition-all duration-700 shadow-2xl" onClick={() => navigate('/contact')}>
                  Initiate Project
                </Button>
                <p className="text-[8px] text-center text-white/40 mt-4 uppercase tracking-[0.4em] font-medium italic">Final quote subject to mission briefing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
