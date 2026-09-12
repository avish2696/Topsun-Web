import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const COOKIE_KEY = 'topsun_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:pb-6"
        >
          <div
            className="max-w-3xl mx-auto bg-[#121518] text-white rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-xl bg-[#009FE3]/15 flex items-center justify-center border border-[#009FE3]/25 mt-0.5">
                <Cookie size={18} className="text-[#009FE3]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug mb-1">
                  We use cookies 🍪
                </p>
                <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                  TOPSUN uses essential cookies to keep your cart active and optional analytics
                  cookies (Meta Pixel, Google Analytics) to improve our store. By clicking{' '}
                  <strong className="text-white/80">Accept All</strong>, you consent to our{' '}
                  <Link
                    to="/privacy-policy"
                    className="text-[#009FE3] underline underline-offset-2 hover:text-[#38bdf8] transition-colors"
                    onClick={() => setVisible(false)}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={accept}
                    className="px-4 py-2 bg-[#009FE3] hover:bg-[#008bc5] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Shield size={12} />
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={decline}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95"
                  >
                    Essential Only
                  </button>
                  <Link
                    to="/privacy-policy"
                    onClick={() => setVisible(false)}
                    className="text-[11px] text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors ml-1"
                  >
                    Learn more
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={decline}
                aria-label="Dismiss cookie banner"
                className="shrink-0 w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer rounded-lg hover:bg-white/10"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieBanner;
