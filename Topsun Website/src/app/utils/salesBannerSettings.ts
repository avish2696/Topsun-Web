import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Lazy supabase client (only if env vars are available)
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) _supabase = createClient(url, key);
  }
  return _supabase;
}

export interface SalesBannerConfig {
  title: string;
  targetDate: string; // ISO string
  enabled: boolean;
  highlightText: string;
}

const STORAGE_KEY = 'topsun_sales_banner_config';
const BANNER_EVENT = 'topsun_sales_banner_update';

// Dynamic default: always 2 days from now
const getDefaultConfig = (): SalesBannerConfig => ({
  title: 'Comfort Rush Deals',
  targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  enabled: true,
  highlightText: 'Ends In:',
});

function localGet(): SalesBannerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultConfig(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultConfig();
}

function localSet(config: SalesBannerConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export const getSalesBannerSettings = localGet;

// ─── Fetch from Supabase → merge into local cache ──────────────────────────
export async function fetchRemoteBannerSettings(): Promise<SalesBannerConfig | null> {
  try {
    const sb = getSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from('sales_banner_settings')
      .select('offer_title, offer_subtitle, end_time, is_active')
      .eq('id', 'default')
      .single();
    if (error || !data) return null;
    const config: SalesBannerConfig = {
      title: data.offer_title || 'Flash Deal',
      highlightText: data.offer_subtitle || 'Ends In:',
      targetDate: data.end_time || getDefaultConfig().targetDate,
      enabled: data.is_active ?? true,
    };
    localSet(config);
    window.dispatchEvent(new CustomEvent(BANNER_EVENT, { detail: config }));
    return config;
  } catch {
    return null;
  }
}

// ─── Save to Supabase + local ───────────────────────────────────────────────
export const saveSalesBannerSettings = async (config: SalesBannerConfig): Promise<boolean> => {
  localSet(config);
  window.dispatchEvent(new CustomEvent(BANNER_EVENT, { detail: config }));
  try {
    const sb = getSupabase();
    if (!sb) return false;
    const { error } = await sb
      .from('sales_banner_settings')
      .upsert({
        id: 'default',
        offer_title: config.title,
        offer_subtitle: config.highlightText,
        end_time: config.targetDate,
        is_active: config.enabled,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
};

// ─── React hook: subscribes to local events + Supabase Realtime ────────────
export function useSalesBanner() {
  const [config, setConfig] = useState<SalesBannerConfig>(localGet);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    // Fetch latest from Supabase on mount
    fetchRemoteBannerSettings().then(remote => {
      if (remote) setConfig(remote);
    });

    // Local event listener (same tab, instant update)
    const handleUpdate = (e: Event) => {
      const ev = e as CustomEvent<SalesBannerConfig>;
      if (ev.detail) setConfig(ev.detail);
      else setConfig(localGet());
    };
    window.addEventListener(BANNER_EVENT, handleUpdate);

    // Supabase Realtime subscription
    const sb = getSupabase();
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
    if (sb) {
      channel = sb
        .channel('sales_banner_rt')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'sales_banner_settings',
          filter: "id=eq.default",
        }, (payload: any) => {
          const d = payload.new;
          if (!d) return;
          const updated: SalesBannerConfig = {
            title: d.offer_title || 'Flash Deal',
            highlightText: d.offer_subtitle || 'Ends In:',
            targetDate: d.end_time,
            enabled: d.is_active ?? true,
          };
          localSet(updated);
          setConfig(updated);
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener(BANNER_EVENT, handleUpdate);
      channel?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(config.targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        isExpired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.targetDate]);

  return { ...config, ...timeLeft };
}
