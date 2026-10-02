import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemberProfile, memberPortfolioClassName, memberPortfolioTheme } from './shared';
import MemberCvView from './MemberCvView';

interface MemberCvModalProps {
  member: MemberProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberCvModal({ member, isOpen, onClose }: MemberCvModalProps) {
  // Lock body scroll when modal is active
  useEffect(() => {
    if (!isOpen) return undefined;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto print:static print:z-auto print:overflow-visible"
          role="dialog"
          aria-modal="true"
          aria-label={`Curriculum Vitae of ${member.name}`}
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl print:hidden"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative min-h-screen px-3 py-6 sm:px-6 sm:py-12 flex items-center justify-center print:min-h-0 print:p-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={memberPortfolioTheme}
              className={`${memberPortfolioClassName} relative z-10 w-full max-w-5xl rounded-3xl print:p-0 print:bg-transparent`}
              onClick={(e) => e.stopPropagation()}
            >
              <MemberCvView member={member} isModal onClose={onClose} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
