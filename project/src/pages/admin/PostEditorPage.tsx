import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, BookOpen, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Category, Post } from '../../types/database';
import SEOHead from '../../components/SEOHead';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function analyzeKeywordDensity(content: string, keywords: string): { keyword: string; count: number; density: number; status: 'low' | 'good' | 'high' }[] {
  if (!keywords.trim()) return [];
  const text = stripHtml(content).toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return [];

  return keywords
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
    .map((keyword) => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      const density = (count / wordCount) * 100;
      let status: 'low' | 'good' | 'high' = 'low';
      if (density >= 0.5 && density <= 2.5) status = 'good';
      else if (density > 2.5) status = 'high';
      return { keyword, count, density, status };
    });
}

export default function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState<Omit<Post, 'id' | 'created_at' | 'updated_at' | 'author_id'>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category_id: null,
    meta_title: '',
    meta_description: '',
    keywords: '',
    published: false,
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);

      if (!isNew && id) {
        const { data: post } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
        if (post) {
          setForm({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featured_image: post.featured_image,
            category_id: post.category_id,
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            keywords: post.keywords || '',
            published: post.published,
          });
          setSlugManuallyEdited(true);
        }
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const keywordAnalysis = useMemo(() => {
    return analyzeKeywordDensity(form.content, form.keywords);
  }, [form.content, form.keywords]);

  const wordCount = useMemo(() => {
    return stripHtml(form.content).split(/\s+/).filter(Boolean).length;
  }, [form.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'title' && !slugManuallyEdited) {
      setForm((f) => ({ ...f, title: value, slug: slugify(value) }));
    } else if (name === 'slug') {
      setSlugManuallyEdited(true);
      setForm((f) => ({ ...f, slug: slugify(value) }));
    } else {
      setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSave = async (publish?: boolean) => {
    setError(null);
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    setSaving(true);

    const payload = {
      ...form,
      published: publish !== undefined ? publish : form.published,
      author_id: user?.id ?? null,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (isNew) {
      const res = await supabase.from('posts').insert(payload).select('id').single();
      err = res.error;
      if (!err && res.data) navigate(`/admin/posts/${res.data.id}/edit`, { replace: true });
    } else {
      const res = await supabase.from('posts').update(payload).eq('id', id!);
      err = res.error;
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    if (publish !== undefined) setForm((f) => ({ ...f, published: publish }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={`${isNew ? 'New Biography' : 'Edit Biography'} — BiographyHub Admin`} />

      {/* Admin header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen size={14} />
            </div>
            <span className="font-bold text-sm">BiographyHub Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(form.published ? false : undefined)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              {form.published ? <><EyeOff size={13} />Unpublish</> : <><Eye size={13} />Draft</>}
            </button>
            <button
              onClick={() => handleSave(!form.published ? true : undefined)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save size={13} />
              )}
              {form.published ? 'Save' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/admin/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">{isNew ? 'New Biography' : 'Edit Biography'}</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main editor */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Chadwick Boseman: From Howard to Hollywood"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">URL Slug *</label>
                  <div className="flex items-center gap-0">
                    <span className="bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 text-slate-400 text-sm rounded-l-lg">/biography/</span>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 rounded-r-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={3}
                    placeholder="A compelling 1–2 sentence summary shown on listing pages and in search results..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Content (HTML supported)</label>
                  <span className="text-xs text-slate-400">{wordCount} words</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Use HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={24}
                  placeholder="<h2>Introduction</h2>&#10;<p>...</p>&#10;&#10;<h2>Early Life</h2>&#10;<p>...</p>"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y"
                />
              </div>

              {/* SEO */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-slate-900">SEO Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
                  <input
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    placeholder="Defaults to post title if empty"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.meta_title.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
                  <textarea
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Compelling description for search engine results (150–160 chars)..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">{form.meta_description.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Focus Keywords</label>
                  <input
                    name="keywords"
                    value={form.keywords}
                    onChange={handleChange}
                    placeholder="e.g., leonardo dicaprio, titanic, oscar, net worth"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma-separated. Used for meta keywords tag and density analysis.</p>
                </div>

                {/* Keyword density analysis */}
                {keywordAnalysis.length > 0 && (
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-3">
                      <Search size={14} className="text-amber-500" />
                      Keyword Density Analysis
                    </h4>
                    <div className="space-y-2">
                      {keywordAnalysis.map((kw) => (
                        <div key={kw.keyword} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 font-medium">&ldquo;{kw.keyword}&rdquo;</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 text-xs">{kw.count} occurrence{kw.count !== 1 ? 's' : ''}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    kw.status === 'good' ? 'bg-emerald-500' : kw.status === 'high' ? 'bg-red-500' : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${Math.min(kw.density * 20, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium min-w-[3rem] text-right ${
                                kw.status === 'good' ? 'text-emerald-600' : kw.status === 'high' ? 'text-red-600' : 'text-amber-600'
                              }`}>
                                {kw.density.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Low (&lt;0.5%)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Good (0.5–2.5%)</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High (&gt;2.5%)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Publish */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Publish Settings</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="published"
                      checked={form.published}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {form.published ? 'Published (live)' : 'Draft (hidden)'}
                  </span>
                </label>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60 text-sm"
                  >
                    {saving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={15} />}
                    Save Changes
                  </button>
                  {!isNew && (
                    <Link
                      to={`/biography/${form.slug}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                      <Eye size={15} />
                      View Post
                    </Link>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">Category</h3>
                <select
                  name="category_id"
                  value={form.category_id ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Featured Image */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">Featured Image</h3>
                <input
                  name="featured_image"
                  value={form.featured_image}
                  onChange={handleChange}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-xs text-slate-400 mt-2">Paste a Pexels image URL for best quality.</p>
                {form.featured_image && (
                  <img
                    src={form.featured_image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg mt-3"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              {/* SEO Score */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3">SEO Score</h3>
                {(() => {
                  const checks = [
                    { label: 'Title (30–60 chars)', pass: form.title.length >= 30 && form.title.length <= 60 },
                    { label: 'Meta title set', pass: form.meta_title.length > 0 },
                    { label: 'Meta description (120–160)', pass: form.meta_description.length >= 120 && form.meta_description.length <= 160 },
                    { label: 'Focus keywords set', pass: form.keywords.length > 0 },
                    { label: 'Content 1000+ words', pass: wordCount >= 1000 },
                    { label: 'Excerpt set', pass: form.excerpt.length > 0 },
                    { label: 'Featured image set', pass: form.featured_image.length > 0 },
                    { label: 'Category assigned', pass: form.category_id !== null },
                  ];
                  const passed = checks.filter((c) => c.pass).length;
                  const score = Math.round((passed / checks.length) * 100);
                  const color = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
                  const bgColor = score >= 80 ? 'bg-emerald-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50';

                  return (
                    <div>
                      <div className={`text-3xl font-bold ${color} mb-1`}>{score}%</div>
                      <p className="text-xs text-slate-500 mb-3">{passed}/{checks.length} checks passed</p>
                      <div className="space-y-1.5">
                        {checks.map((c) => (
                          <div key={c.label} className="flex items-center gap-2 text-xs">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${c.pass ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {c.pass ? '\u2713' : '\u2022'}
                            </span>
                            <span className={c.pass ? 'text-slate-700' : 'text-slate-400'}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
