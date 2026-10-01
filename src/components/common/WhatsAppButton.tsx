import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "923489077329";
  const message = encodeURIComponent("Hello, I would like to discuss a project.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with LB CodeBase on WhatsApp"
      initial={false}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
    </motion.a>
  );
}
