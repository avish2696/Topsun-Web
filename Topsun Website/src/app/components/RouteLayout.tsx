import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

interface RouteLayoutProps {
  children: ReactNode;
}

/**
 * RouteLayout - Provides smooth page transitions with location awareness
 * Automatically animates between route changes
 */
export function RouteLayout({ children }: RouteLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change for better UX
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.25,
        ease: [0.23, 1, 0.320, 1], // easeOutCirc
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default RouteLayout;
