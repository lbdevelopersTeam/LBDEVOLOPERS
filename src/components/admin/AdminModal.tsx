import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const widthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: AdminModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
        >
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full overflow-hidden rounded-[2rem] border border-white/12 bg-[#0d0e15]/95 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.8),0_0_40px_rgba(61,90,254,0.1)] backdrop-blur-2xl sm:p-8',
              widthClasses[maxWidth]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top ambient glow header accent */}
            <div className="pointer-events-none absolute -top-24 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-brand-primary/20 blur-3xl" />

            {/* Header */}
            <div className="relative mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {icon && (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand-primary">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 id="admin-modal-title" className="font-display text-xl font-black tracking-[-0.02em] text-white sm:text-2xl">
                    {title}
                  </h3>
                  {subtitle && <p className="mt-1 text-xs text-white/45">{subtitle}</p>}
                </div>
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-white/40 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="relative text-sm text-white/70">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const icon =
    tone === 'danger' ? (
      <AlertTriangle className="h-5 w-5 text-red-400" />
    ) : tone === 'warning' ? (
      <AlertTriangle className="h-5 w-5 text-amber-400" />
    ) : (
      <Info className="h-5 w-5 text-brand-primary" />
    );

  const confirmBtnClass =
    tone === 'danger'
      ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500 hover:text-white'
      : tone === 'warning'
      ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500 hover:text-black'
      : 'bg-brand-primary text-white hover:bg-brand-primary/90';

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} icon={icon} maxWidth="sm">
      <p className="leading-relaxed text-white/60">{message}</p>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
        >
          {cancelText}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            await onConfirm();
            onClose();
          }}
          className={cn(
            'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-50',
            confirmBtnClass
          )}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </AdminModal>
  );
}

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  subtitle?: string;
  placeholder?: string;
  initialValue?: string;
  label?: string;
  submitText?: string;
  inputType?: string;
}

export function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  placeholder = 'Enter value...',
  initialValue = '',
  label = 'Value',
  submitText = 'Insert',
  inputType = 'text',
}: PromptModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [initialValue, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          {label && (
            <label className="block text-[9px] font-black uppercase tracking-[0.24em] text-white/40">
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/50 transition hover:border-white/20 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(61,90,254,0.3)] transition hover:bg-brand-primary/90"
          >
            {submitText}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
