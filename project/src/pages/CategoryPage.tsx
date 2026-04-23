import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, PostWithCategory } from '../types/database';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import AdSlot from '../components/AdSlot';
import SEOHead from '../components/SEOHead';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<PostWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setPage(0);
    const load = async () => {
      setLoading(true);
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(cat);

      const from = 0;
      const to = PAGE_SIZE - 1;
      const { data, count } = await supabase
        .from('posts')
        .select('*, categories(*)', { count: 'exact' })
        .eq('category_id', cat.id)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data) setPosts(data as PostWithCategory[]);
      if (count !== null) setTotal(count);
      setLoading(false);
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!category || page === 0) return;
    const load = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('category_id', category.id)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (data) setPosts((prev) => [...prev, ...data as PostWithCategory[]]);
    };
    load();
  }, [page, category]);

  if (notFound) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${category?.name} Biographies — BiographyHub`}
        description={category?.description || `Browse all ${category?.name} biographies on BiographyHub.`}
      />

      {/* Page header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-slate-200">{category?.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{category?.name} Biographies</h1>
          {category?.description && (
            <p className="text-slate-300 text-base max-w-2xl">{category.description}</p>
          )}
          <p className="text-slate-400 text-sm mt-3">{total} biograph{total === 1 ? 'y' : 'ies'} found</p>
        </div>
      </div>

      <AdSlot type="leaderboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            {posts.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-5 mb-6">
                  {posts.slice(0, 4).map((post) => (
                    <PostCard key={post.id} post={post} featured />
                  ))}
                </div>
                {posts.length > 4 && (
                  <div className="space-y-3">
                    {posts.slice(4).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                {posts.length < total && (
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="mt-8 w-full py-3 rounded-xl border-2 border-amber-400 text-amber-600 font-semibold text-sm hover:bg-amber-50 transition-colors"
                  >
                    Load More Biographies
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <p className="text-lg font-medium">No biographies in this category yet.</p>
                <Link to="/" className="text-amber-600 text-sm mt-2 inline-block hover:underline">
                  Browse all biographies
                </Link>
              </div>
            )}
          </div>
          <div className="mt-10 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
