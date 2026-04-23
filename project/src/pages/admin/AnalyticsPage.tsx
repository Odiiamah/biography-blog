import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogOut, BarChart3, Eye, MousePointerClick, Globe as Globe2, TrendingUp, Monitor, Search, Clock, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import SEOHead from '../../components/SEOHead';

interface TimeRange {
  label: string;
  hours: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
  { label: '90d', hours: 2160 },
];

interface PostViewCount {
  post_id: string;
  title: string;
  slug: string;
  views: number;
  clicks: number;
}

interface CountryData {
  country: string;
  views: number;
}

interface ReferrerData {
  referrer_source: string;
  views: number;
}

interface DeviceData {
  device_type: string;
  count: number;
}

interface TrendData {
  date: string;
  views: number;
  sessions: number;
}

export default function AnalyticsPage() {
  const { user, signOut } = useAuth();
  const [range, setRange] = useState(24);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [postViews, setPostViews] = useState<PostViewCount[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [referrers, setReferrers] = useState<ReferrerData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [prevViews, setPrevViews] = useState(0);

  useEffect(() => {
    load();
  }, [range]);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - range * 3600000).toISOString();
    const prevSince = new Date(Date.now() - range * 2 * 3600000).toISOString();

    const [viewsRes, sessionsRes, clicksRes, liveRes, prevRes] = await Promise.all([
      supabase.from('page_views').select('id, path, post_id, country, referrer_source, device_type, created_at').gte('created_at', since),
      supabase.from('visitor_sessions').select('id, country, device_type, referrer_source').gte('created_at', since),
      supabase.from('click_events').select('id, element_type').gte('created_at', since),
      supabase.from('visitor_sessions').select('id').gte('last_activity', new Date(Date.now() - 5 * 60000).toISOString()),
      supabase.from('page_views').select('id').gte('created_at', prevSince).lt('created_at', since),
    ]);

    const views = viewsRes.data || [];
    const sessions = sessionsRes.data || [];
    const clicks = clicksRes.data || [];
    const live = liveRes.data || [];
    const prev = prevRes.data || [];

    setTotalViews(views.length);
    setTotalSessions(sessions.length);
    setTotalClicks(clicks.length);
    setLiveVisitors(live.length);
    setPrevViews(prev.length);

    // Post views with click data
    const postViewMap = new Map<string, { title: string; slug: string; views: number }>();
    const postsRes = await supabase.from('posts').select('id, title, slug');
    const postsMap = new Map((postsRes.data || []).map((p) => [p.id, p]));

    for (const v of views) {
      if (!v.post_id) continue;
      const existing = postViewMap.get(v.post_id);
      if (existing) existing.views++;
      else {
        const post = postsMap.get(v.post_id);
        if (post) postViewMap.set(v.post_id, { title: post.title, slug: post.slug, views: 1 });
      }
    }

    const clickRes2 = await supabase.from('click_events').select('path').gte('created_at', since);
    const clickCounts = new Map<string, number>();
    for (const c of clickRes2.data || []) {
      const slug = c.path?.replace('/biography/', '');
      if (slug) clickCounts.set(slug, (clickCounts.get(slug) || 0) + 1);
    }

    const pvArr = Array.from(postViewMap.entries())
      .map(([id, data]) => ({
        post_id: id,
        title: data.title,
        slug: data.slug,
        views: data.views,
        clicks: clickCounts.get(data.slug) || 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    setPostViews(pvArr);

    // Countries
    const countryMap = new Map<string, number>();
    for (const v of views) {
      const c = v.country || 'Unknown';
      countryMap.set(c, (countryMap.get(c) || 0) + 1);
    }
    setCountries(Array.from(countryMap.entries()).map(([country, views]) => ({ country, views })).sort((a, b) => b.views - a.views).slice(0, 10));

    // Referrers
    const refMap = new Map<string, number>();
    for (const v of views) {
      const r = v.referrer_source || 'direct';
      refMap.set(r, (refMap.get(r) || 0) + 1);
    }
    setReferrers(Array.from(refMap.entries()).map(([referrer_source, views]) => ({ referrer_source, views })).sort((a, b) => b.views - a.views));

    // Devices
    const devMap = new Map<string, number>();
    for (const s of sessions) {
      const d = s.device_type || 'unknown';
      devMap.set(d, (devMap.get(d) || 0) + 1);
    }
    setDevices(Array.from(devMap.entries()).map(([device_type, count]) => ({ device_type, count })).sort((a, b) => b.count - a.count));

    // Trend data (daily buckets)
    const dayMap = new Map<string, { views: number; sessions: number }>();
    for (const v of views) {
      const day = v.created_at?.slice(0, 10) || '';
      const d = dayMap.get(day) || { views: 0, sessions: 0 };
      d.views++;
      dayMap.set(day, d);
    }
    for (const s of sessions) {
      const day = (s as any).created_at?.slice(0, 10) || '';
      const d = dayMap.get(day) || { views: 0, sessions: 0 };
      d.sessions++;
      dayMap.set(day, d);
    }
    setTrend(Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date)));

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews * 100).toFixed(1) : null;

  const referrerLabels: Record<string, string> = {
    google: 'Google Search',
    bing: 'Bing',
    yahoo: 'Yahoo',
    duckduckgo: 'DuckDuckGo',
    baidu: 'Baidu',
    facebook: 'Facebook',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    pinterest: 'Pinterest',
    reddit: 'Reddit',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    direct: 'Direct',
    other: 'Other',
  };

  const maxTrendViews = Math.max(...trend.map((t) => t.views), 1);

  return (
    <>
      <SEOHead title="Analytics — BiographyHub Admin" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center"><BookOpen size={14} /></div>
            <span className="font-bold text-sm">BiographyHub Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:block">{user?.email}</span>
            <Link to="/" className="text-slate-400 hover:text-white text-xs transition-colors" target="_blank">View Site</Link>
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"><LogOut size={13} /> Sign Out</button>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 size={24} className="text-amber-500" /> Analytics</h1>
              <p className="text-slate-500 text-sm mt-1">Real-time visitor and content performance insights</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {TIME_RANGES.map((r) => (
                <button key={r.label} onClick={() => setRange(r.hours)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r.hours ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>
          ) : (
            <>
              {/* Live + Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50"><Eye size={18} /></div>
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{liveVisitors}</p>
                  <p className="text-slate-500 text-sm mt-0.5">Active Now</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 mb-3"><BarChart3 size={18} /></div>
                  <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-slate-500 text-sm">Page Views</p>
                    {viewsChange && (
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${Number(viewsChange) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Number(viewsChange) >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(Number(viewsChange))}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-600 bg-amber-50 mb-3"><Users size={18} /></div>
                  <p className="text-2xl font-bold text-slate-900">{totalSessions.toLocaleString()}</p>
                  <p className="text-slate-500 text-sm mt-0.5">Sessions</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 mb-3"><MousePointerClick size={18} /></div>
                  <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</p>
                  <p className="text-slate-500 text-sm mt-0.5">Ad Clicks</p>
                  {totalViews > 0 && <p className="text-xs text-slate-400 mt-0.5">CTR: {((totalClicks / totalViews) * 100).toFixed(2)}%</p>}
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> Traffic Trend</h2>
                {trend.length > 0 ? (
                  <div className="flex items-end gap-1 h-40">
                    {trend.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '130px' }}>
                          <div className="w-full bg-amber-400 rounded-t-sm transition-all" style={{ height: `${(d.views / maxTrendViews) * 100}%`, minHeight: '2px' }} title={`${d.views} views`} />
                        </div>
                        <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No traffic data yet for this period.</p>
                )}
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Top Posts */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> Top Biographies by Views</h2>
                  {postViews.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 border-b border-slate-100">
                        <span className="col-span-2">Post</span><span className="text-center">Views</span><span className="text-center">Clicks</span><span className="text-center">CTR</span>
                      </div>
                      {postViews.map((p, i) => (
                        <div key={p.post_id} className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="col-span-2 flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                            <Link to={`/biography/${p.slug}`} target="_blank" className="text-sm font-medium text-slate-800 hover:text-amber-600 truncate">{p.title}</Link>
                          </div>
                          <span className="text-sm text-slate-700 text-center font-medium">{p.views}</span>
                          <span className="text-sm text-slate-700 text-center">{p.clicks}</span>
                          <span className="text-sm text-center font-medium">{p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(1) : 0}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">No post view data yet.</p>
                  )}
                </div>

                {/* Search Engine Traffic */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Search size={18} className="text-amber-500" /> Traffic Sources</h2>
                  {referrers.length > 0 ? (
                    <div className="space-y-2">
                      {referrers.map((r) => {
                        const pct = totalViews > 0 ? (r.views / totalViews * 100) : 0;
                        return (
                          <div key={r.referrer_source} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-700 truncate">{referrerLabels[r.referrer_source] || r.referrer_source}</span>
                                <span className="text-xs text-slate-500">{r.views}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-500 min-w-[2.5rem] text-right">{pct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">No referrer data yet.</p>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Countries */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Globe2 size={18} className="text-amber-500" /> Countries</h2>
                  {countries.length > 0 ? (
                    <div className="space-y-2">
                      {countries.map((c) => {
                        const pct = totalViews > 0 ? (c.views / totalViews * 100) : 0;
                        return (
                          <div key={c.country} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700 w-20 truncate">{c.country || 'Unknown'}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-500 min-w-[3rem] text-right">{c.views} ({pct.toFixed(0)}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">No country data yet.</p>
                  )}
                </div>

                {/* Devices */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Monitor size={18} className="text-amber-500" /> Devices</h2>
                  {devices.length > 0 ? (
                    <div className="space-y-4">
                      {devices.map((d) => {
                        const pct = totalSessions > 0 ? (d.count / totalSessions * 100) : 0;
                        const icon = d.device_type === 'mobile' ? 'Mobile' : d.device_type === 'tablet' ? 'Tablet' : 'Desktop';
                        return (
                          <div key={d.device_type}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-slate-700">{icon}</span>
                              <span className="text-xs text-slate-500">{d.count} sessions ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${d.device_type === 'desktop' ? 'bg-blue-500' : d.device_type === 'mobile' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">No device data yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
