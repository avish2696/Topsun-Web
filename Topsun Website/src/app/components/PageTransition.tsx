import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition Component - Wraps page content with smooth entrance/exit animations
 * Usage: Wrap page content with <PageTransition>{content}</PageTransition>
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatePresence wrapper for route transitions
 * Use this in your router setup for automatic page transitions
 */
export default PageTransition;
