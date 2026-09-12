import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

export default function FloatingWhatsApp() {
  const location = useLocation();

  // Hide on admin routes and admin login
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const defaultMessage = encodeURIComponent(
    "Hi TOPSUN Team! I'm browsing your footwear on topsun.in and have a question."
  );
  const waUrl = `https://wa.me/917485006659?text=${defaultMessage}`;

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2 pointer-events-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with TOPSUN on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)] transition-shadow duration-300"
      >
        {/* Animated Green Ripple Ring 1 (continuous ping) */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none"
          style={{ animationDuration: '2.4s' }}
        />

        {/* Animated Green Pulse Ring 2 (soft expanding pulse) */}
        <span
          className="absolute -inset-1.5 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none"
          style={{ animationDuration: '2s' }}
        />

        {/* Inner Official WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10 transition-transform duration-300 group-hover:scale-110 shrink-0 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z" />
        </svg>

        {/* Active Online Indicator Dot */}
        <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-400 border-2 border-white z-20 shadow-xs" />

        {/* Hover Tooltip for Desktop */}
        <span className="hidden sm:group-hover:inline-flex items-center gap-1.5 absolute left-full ml-3 px-3 py-1.5 bg-zinc-900/95 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap z-30 transition-all pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          Chat with us on WhatsApp
        </span>
      </motion.a>
    </div>
  );
}
