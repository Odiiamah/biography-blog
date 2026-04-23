import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogOut, KeyRound, BarChart3, Save, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/SEOHead';

interface Setting {
  key: string;
  value: string;
}

export default function SiteSettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data as Setting[]) map[row.key] = row.value;
      setSettings(map);
    }
    setLoading(false);
  };

  const handleChange = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    for (const [key, value] of Object.entries(settings)) {
      const { error: err } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false);
    setSaved(true);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  const fields = [
    { key: 'site_name', label: 'Site Name', description: 'Displayed in the header logo and browser title', type: 'text' },
    { key: 'tagline', label: 'Tagline', description: 'Short text below the site name in the header', type: 'text' },
    { key: 'header_show_announcement', label: 'Show Announcement Bar', description: 'Toggle the top announcement bar in the header', type: 'toggle' },
    { key: 'announcement_text', label: 'Announcement Bar Text', description: 'Text shown in the dark top bar of the header', type: 'textarea' },
    { key: 'footer_about', label: 'Footer About Text', description: 'About paragraph shown in the footer brand column', type: 'textarea' },
    { key: 'footer_copyright', label: 'Footer Copyright Text', description: 'Copyright line at the bottom of the footer (year is auto-prepended)', type: 'text' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Site Settings — BiographyHub Admin" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center"><BookOpen size={14} /></div>
            <span className="font-bold text-sm">BiographyHub Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:block">{user?.email}</span>
            <Link to="/admin/analytics" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"><BarChart3 size={13} /> Analytics</Link>
            <Link to="/admin/change-password" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"><KeyRound size={13} /> Password</Link>
            <Link to="/" className="text-slate-400 hover:text-white text-xs transition-colors" target="_blank">View Site</Link>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"><LogOut size={13} /> Sign Out</button>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
              <p className="text-slate-500 text-sm mt-1">Customize the header and footer of your website</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60 text-sm shadow-sm"
            >
              {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

          {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
          {saved && <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">Settings saved successfully. Changes are live.</div>}

          {/* Header Settings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Header Settings</h2>
            <p className="text-slate-500 text-sm mb-5">Control what appears in the site header</p>
            <div className="space-y-5">
              {fields.filter((f) => f.key.startsWith('header') || f.key === 'site_name' || f.key === 'tagline' || f.key === 'announcement').map((field) => (
                <div key={field.key}>
                  {field.type === 'toggle' ? (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings[field.key] === 'true'}
                          onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${settings[field.key] === 'true' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings[field.key] === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700">{field.label}</span>
                        <p className="text-xs text-slate-400">{field.description}</p>
                      </div>
                    </label>
                  ) : field.type === 'textarea' ? (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <textarea
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">{field.description}</p>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-400 mt-1">{field.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Settings */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Footer Settings</h2>
            <p className="text-slate-500 text-sm mb-5">Control what appears in the site footer</p>
            <div className="space-y-5">
              {fields.filter((f) => f.key.startsWith('footer')).map((field) => (
                <div key={field.key}>
                  {field.type === 'textarea' ? (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <textarea
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1">{field.description}</p>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={settings[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-400 mt-1">{field.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>

            {/* Header preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
              <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center">
                {settings.header_show_announcement === 'true' ? (settings.announcement_text || 'Announcement text') : <span className="text-slate-500 italic">Announcement bar hidden</span>}
              </div>
              <div className="bg-white px-4 py-3 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                  <BookOpen size={12} className="text-white" />
                </div>
                <div className="leading-tight">
                  <span className="block text-sm font-bold text-slate-900">{settings.site_name || 'Site Name'}</span>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-widest">{settings.tagline || 'Tagline'}</span>
                </div>
              </div>
            </div>

            {/* Footer preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
                    <BookOpen size={10} className="text-white" />
                  </div>
                  <span className="text-white font-bold text-sm">{settings.site_name || 'Site Name'}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{settings.footer_about || 'Footer about text'}</p>
                <div className="border-t border-slate-800 pt-2 text-xs text-slate-500">
                  &copy; {new Date().getFullYear()} {settings.footer_copyright || 'Copyright text'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
