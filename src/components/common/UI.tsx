import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';
import React, { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-brand-primary text-white hover:shadow-[0_0_40px_-10px_rgba(61,90,254,0.6)] border border-brand-primary/50',
    secondary: 'bg-white text-brand-dark hover:bg-white/90',
    outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5 active:bg-white/10 hover:border-white/20',
    ghost: 'bg-transparent text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] sm:px-6 sm:tracking-[0.2em]',
    md: 'px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.18em] sm:px-8 md:px-10 md:py-4 md:text-xs md:tracking-[0.3em]',
    lg: 'px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] sm:px-10 sm:py-5 md:px-14 md:py-6 md:text-sm md:tracking-[0.4em]',
  };

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-cursor={(props as any)['data-cursor'] || "CLICK"}
      className={cn(
        'max-w-full rounded-full transition-all duration-500 inline-flex items-center justify-center gap-3 active:scale-95 whitespace-normal text-center leading-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({ 
  badge, 
  title, 
  description, 
  align = 'left',
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      'mb-12 md:mb-20 lg:mb-24',
      align === 'center' ? 'text-center mx-auto max-w-4xl' : 'text-left max-w-4xl',
      className
    )}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300 sm:tracking-[0.4em] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          {badge}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black mb-6 tracking-tighter leading-[0.95] uppercase gradient-text break-words"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-white/70 text-base md:text-xl leading-relaxed font-light max-w-2xl"
          style={{ margin: align === 'center' ? '0 auto' : '0' }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: string;
}

export function BentoCard({ children, className, span = 'col-1' }: BentoCardProps) {
  const spans = {
    'col-1': 'col-span-1',
    'col-2': 'col-span-2',
    'col-3': 'col-span-3',
    'col-4': 'col-span-4',
    'row-1': 'row-span-1',
    'row-2': 'row-span-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'premium-card p-6 md:p-8 flex flex-col justify-between group',
        spans[span as keyof typeof spans] || span,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
