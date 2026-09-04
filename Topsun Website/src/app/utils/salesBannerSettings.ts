import { useState, useEffect } from 'react';

export interface SalesBannerConfig {
  title: string;
  targetDate: string; // ISO string e.g. "2026-09-02T18:00:00.000Z"
  enabled: boolean;
  highlightText: string;
}

const STORAGE_KEY = 'topsun_sales_banner_config';

// Fixed baseline target date: September 2, 2026 23:59:59 (constant for all visitors)
const FIXED_GLOBAL_TARGET = '2026-09-02T18:29:59.000Z';

// Static default configuration (does NOT recompute from Date.now() on each visit)
const getDefaultConfig = (): SalesBannerConfig => ({
  title: 'Comfort Rush Deals',
  targetDate: FIXED_GLOBAL_TARGET,
  enabled: true,
  highlightText: 'Ends In:',
});

export const getSalesBannerSettings = (): SalesBannerConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...getDefaultConfig(), ...parsed };
    }
  } catch (e) {
    // Ignore parse error
  }
  return getDefaultConfig();
};

export const saveSalesBannerSettings = (config: SalesBannerConfig) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('topsun_sales_banner_update', { detail: config }));
  } catch (e) {
    console.error('Failed to save sales banner config', e);
  }
};

export function useSalesBanner() {
  const [config, setConfig] = useState<SalesBannerConfig>(getSalesBannerSettings);
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 12,
    minutes: 16,
    seconds: 17,
    isExpired: false,
  });

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SalesBannerConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getSalesBannerSettings());
      }
    };

    window.addEventListener('topsun_sales_banner_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('topsun_sales_banner_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(config.targetDate).getTime();
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config.targetDate]);

  return {
    ...config,
    ...timeLeft,
  };
}
