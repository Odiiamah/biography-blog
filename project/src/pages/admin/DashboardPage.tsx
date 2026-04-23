import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, LogOut, BarChart2, Mail, Tag, FileText, KeyRound, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { PostWithCategory, Category } from '../../types/database';
import SEOHead from '../../components/SEOHead';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'categories' | 'messages'>('posts');
  const [messages, setMessages] = useState<{ id: string; name: string; email: string; subject: string; message: string; created_at: string }[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const [postsRes, catsRes, msgRes] = await Promise.all([
      supabase.from('posts').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    if (postsRes.data) {
      const all = postsRes.data as PostWithCategory[];
      setPosts(all);
      setStats((s) => ({
        ...s,
        total: all.length,
        published: all.filter((p) => p.published).length,
        drafts: all.filter((p) => !p.published).length,
      }));
    }
    if (catsRes.data) setCategories(catsRes.data);
    if (msgRes.data) {
      setMessages(msgRes.data);
      setStats((s) => ({ ...s, messages: msgRes.data.length }));
    }
    setLoading(false);
  };

  const togglePublish = async (post: PostWithCategory) => {
    await supabase.from('posts').update({ published: !post.published }).eq('id', post.id);
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p));
    setStats((s) => ({
      ...s,
      published: s.published + (post.published ? -1 : 1),
      drafts: s.drafts + (post.published ? 1 : -1),
    }));
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    const removed = posts.find((p) => p.id === id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setStats((s) => ({
      ...s,
      total: s.total - 1,
      published: removed?.published ? s.published - 1 : s.published,
      drafts: !removed?.published ? s.drafts - 1 : s.drafts,
    }));
    setDeleteId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <>
      <SEOHead title="Admin Dashboard — BiographyHub" />

      {/* Admin header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookOpen size={14} />
            </div>
            <span className="font-bold text-sm">BiographyHub Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:block">{user?.email}</span>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <BarChart2 size={13} />
              Analytics
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <Settings size={13} />
              Settings
            </Link>
            <Link
              to="/admin/change-password"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <KeyRound size={13} />
              Password
            </Link>
            <Link
              to="/"
              className="text-slate-400 hover:text-white text-xs transition-colors"
              target="_blank"
            >
              View Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your biography blog content</p>
            </div>
            <Link
              to="/admin/posts/new"
              className="flex items-center gap-2 bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm shadow-sm"
            >
              <Plus size={16} />
              New Biography
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <FileText size={18} />, label: 'Total Posts', value: stats.total, color: 'text-blue-600 bg-blue-50' },
              { icon: <Eye size={18} />, label: 'Published', value: stats.published, color: 'text-emerald-600 bg-emerald-50' },
              { icon: <EyeOff size={18} />, label: 'Drafts', value: stats.drafts, color: 'text-slate-600 bg-slate-100' },
              { icon: <Mail size={18} />, label: 'Messages', value: stats.messages, color: 'text-amber-600 bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
            {(['posts', 'categories', 'messages'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'posts' && <span className="flex items-center gap-1.5"><BarChart2 size={14} />Posts</span>}
                {tab === 'categories' && <span className="flex items-center gap-1.5"><Tag size={14} />Categories</span>}
                {tab === 'messages' && <span className="flex items-center gap-1.5"><Mail size={14} />Messages</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Posts tab */}
              {activeTab === 'posts' && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                          <th className="text-left px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                          <th className="text-left px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                          <th className="text-left px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                          <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {posts.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-medium text-slate-900 line-clamp-1 max-w-xs">{post.title}</p>
                              <p className="text-slate-400 text-xs mt-0.5">/biography/{post.slug}</p>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className="text-slate-600 text-xs">{post.categories?.name ?? '—'}</span>
                            </td>
                            <td className="px-4 py-4 hidden md:table-cell text-slate-500 text-xs">
                              {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => togglePublish(post)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                  post.published
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {post.published ? <><Eye size={11} />Live</> : <><EyeOff size={11} />Draft</>}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/admin/posts/${post.id}/edit`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={15} />
                                </Link>
                                {deleteId === post.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => deletePost(post.id)}
                                      className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteId(null)}
                                      className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteId(post.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {posts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-400">
                              No posts yet. <Link to="/admin/posts/new" className="text-amber-600 hover:underline">Create your first biography</Link>.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Categories tab */}
              {activeTab === 'categories' && (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id} className="border border-slate-100 rounded-xl p-4">
                        <p className="font-semibold text-slate-900">{cat.name}</p>
                        <p className="text-slate-400 text-xs mt-1">/{cat.slug}</p>
                        {cat.description && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{cat.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages tab */}
              {activeTab === 'messages' && (
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
                      No messages yet.
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">{msg.name}</p>
                          <p className="text-slate-500 text-xs">{msg.email}</p>
                        </div>
                        <span className="text-slate-400 text-xs flex-shrink-0">
                          {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-amber-700 mb-1.5">{msg.subject}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}