import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteSettings {
  site_name: string;
  tagline: string;
  announcement_text: string;
  footer_about: string;
  footer_copyright: string;
  header_show_announcement: string;
}

const DEFAULTS: SiteSettings = {
  site_name: 'BiographyHub',
  tagline: 'Life Stories',
  announcement_text: 'Discover the lives of the world\'s most influential people — Updated daily',
  footer_about: 'BiographyHub is dedicated to publishing accurate, in-depth biographies of the world\'s most influential people across politics, entertainment, science, and business.',
  footer_copyright: 'BiographyHub. All rights reserved.',
  header_show_announcement: 'true',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) map[row.key] = row.value;
      setSettings({
        site_name: map.site_name || DEFAULTS.site_name,
        tagline: map.tagline || DEFAULTS.tagline,
        announcement_text: map.announcement_text || DEFAULTS.announcement_text,
        footer_about: map.footer_about || DEFAULTS.footer_about,
        footer_copyright: map.footer_copyright || DEFAULTS.footer_copyright,
        header_show_announcement: map.header_show_announcement ?? DEFAULTS.header_show_announcement,
      });
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used inside SiteSettingsProvider');
  return ctx;
}
