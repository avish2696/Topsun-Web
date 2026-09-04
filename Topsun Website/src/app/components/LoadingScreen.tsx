import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TopsunLogoImg from '@/imports/TOPSUN png 1.webp';

interface LoadingScreenProps {
  fullScreen?: boolean;
  minDuration?: number; // Minimum time to display in ms
  onComplete?: () => void;
}

export default function LoadingScreen({
  fullScreen = true,
  minDuration = 1200,
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Smooth progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / minDuration) * 100), 100);
      setProgress(pct);

      if (elapsed >= minDuration) {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 200);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`${
          fullScreen ? 'fixed inset-0 z-[9999]' : 'relative min-h-[60vh] w-full'
        } flex flex-col items-center justify-center bg-[#0c0c0c] select-none`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-[#009FE3]/15 rounded-full blur-[90px] animate-pulse" />
        </div>

        {/* Center Container */}
        <div className="relative z-10 flex flex-col items-center max-w-xs px-6 text-center">
          {/* TOPSUN Logo with gentle breathing pulse & glow */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-6"
          >
            <div className="w-36 sm:w-44 h-16 sm:h-20 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(0,159,227,0.45)]">
              <img
                src={TopsunLogoImg}
                alt="TOPSUN"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#009FE3]" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em] text-[#009FE3]">
              PERFORMANCE FOOTWEAR
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#009FE3]" />
          </motion.div>

          {/* Ultra-sleek Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="w-48 sm:w-56 h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-inner"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#009FE3] via-[#38bdf8] to-[#009FE3] rounded-full shadow-[0_0_12px_#009FE3]"
              style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
            />
          </motion.div>

          {/* Loading status */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10.5px] font-semibold text-gray-400 mt-3 tracking-widest uppercase"
          >
            {progress < 100 ? 'Engineering Comfort...' : 'Ready'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
