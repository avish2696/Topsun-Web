import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [mounted, setMounted] = useState(false);

  // Sync state and apply class to document
  const applyTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    setMounted(true);
    // Read current state from DOM or localStorage
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeDark = saved === 'dark' || (!saved && prefersDark) || document.documentElement.classList.contains('dark');
    applyTheme(activeDark);

    // Listen to theme changes dispatched from other toggles or tabs
    const handleCustomThemeChange = (e: any) => {
      const next = e.detail?.isDark !== undefined ? e.detail.isDark : document.documentElement.classList.contains('dark');
      setIsDark(next);
    };

    window.addEventListener('topsun-theme-change', handleCustomThemeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        applyTheme(e.newValue === 'dark');
      }
    });

    return () => {
      window.removeEventListener('topsun-theme-change', handleCustomThemeChange);
    };
  }, []);

  const toggleTheme = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const nextDark = !isDark;
    applyTheme(nextDark);

    // Broadcast change to all other toggle components
    window.dispatchEvent(
      new CustomEvent('topsun-theme-change', { detail: { isDark: nextDark } })
    );
  };

  if (!mounted) {
    return (
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full ${className}`} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden border shadow-xs active:scale-90 ${
        isDark
          ? 'bg-zinc-800 border-zinc-700 text-amber-300 hover:bg-zinc-700 hover:border-zinc-600 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
          : 'bg-white border-[#e4ded5] text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
      } ${className}`}
      aria-label={isDark ? 'Switch to day theme (Light mode)' : 'Switch to night theme (Dark mode)'}
      title={isDark ? 'Switch to Day Theme' : 'Switch to Night Theme'}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun size={19} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
        ) : (
          <Moon size={19} className="text-zinc-800" />
        )}
      </motion.div>
    </button>
  );
}

export default ThemeToggle;
