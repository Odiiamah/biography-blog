import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PostWithCategory, Category } from '../types/database';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import AdSlot from '../components/AdSlot';
import SEOHead from '../components/SEOHead';

const PAGE_SIZE = 8;

export default function HomePage() {
  const [featured, setFeatured] = useState<PostWithCategory[]>([]);
  const [latest, setLatest] = useState<PostWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [postsRes, catsRes, countRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .range(0, 2),
        supabase.from('categories').select('*').order('name'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
      ]);
      if (postsRes.data) setFeatured(postsRes.data as PostWithCategory[]);
      if (catsRes.data) setCategories(catsRes.data);
      if (countRes.count !== null) setTotalPosts(countRes.count);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadPage = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (data) setLatest(data as PostWithCategory[]);
    };
    if (page > 0) loadPage();
  }, [page]);

  useEffect(() => {
    const loadFirstPage = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);
      if (data) setLatest(data as PostWithCategory[]);
    };
    loadFirstPage();
  }, []);

  const totalPages = Math.ceil(totalPosts / PAGE_SIZE);

  const categoryColors: Record<string, string> = {
    actors: 'bg-rose-50 text-rose-700 border-rose-200',
    musicians: 'bg-violet-50 text-violet-700 border-violet-200',
    politicians: 'bg-blue-50 text-blue-700 border-blue-200',
    entrepreneurs: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    athletes: 'bg-orange-50 text-orange-700 border-orange-200',
    scientists: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="BiographyHub — Life Stories of Influential People"
        description="Discover in-depth biographies of the world's most influential people — actors, musicians, politicians, entrepreneurs, athletes, and scientists."
        keywords="biography, biographies, life stories, famous people, influential people, actors, musicians, politicians, entrepreneurs, athletes, scientists"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Life Stories Worth Reading
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
            Discover the People Who<br />
            <span className="text-amber-400">Shaped Our World</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            In-depth, factual biographies of the world's most influential people across entertainment, politics, business, sports, and science.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="px-4 py-2 bg-white/10 hover:bg-amber-500 text-white text-sm font-medium rounded-full transition-colors border border-white/20 hover:border-amber-500"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AdSlot type="leaderboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link to="/" className="px-4 py-1.5 rounded-full text-sm font-medium bg-amber-500 text-white border border-amber-500 transition-colors">All</Link>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors hover:bg-slate-100 ${categoryColors[cat.slug] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{cat.name}</Link>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            {/* Featured posts */}
            {featured.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <TrendingUp size={20} className="text-amber-500" /> Featured Biographies
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  {featured.slice(0, 2).map((post) => (
                    <PostCard key={post.id} post={post} featured />
                  ))}
                </div>
                {featured[2] && (
                  <div className="mt-5">
                    <PostCard post={featured[2]} featured />
                  </div>
                )}
              </section>
            )}

            <AdSlot type="rectangle" />

            {/* Latest Biographies — Grid with pagination */}
            {latest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Latest Biographies</h2>
                  <span className="text-sm text-slate-500">{totalPosts} biograph{totalPosts === 1 ? 'y' : 'ies'}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  {latest.map((post) => (
                    <PostCard key={post.id} post={post} featured />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={15} /> Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === i
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </section>
            )}

            {featured.length === 0 && latest.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg font-medium">No biographies published yet.</p>
                <p className="text-sm mt-2">Check back soon!</p>
              </div>
            )}
          </div>

          <div className="mt-10 lg:mt-0">
            <Sidebar />
          </div>
        </div>

        {/* Browse by category */}
        <section className="mt-16 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-md ${categoryColors[cat.slug] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                <span className="font-semibold text-sm">{cat.name}</span>
                <ChevronRight size={14} className="mt-1 opacity-60" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
