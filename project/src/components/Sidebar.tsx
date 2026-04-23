import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, FolderOpen, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, PostWithCategory } from '../types/database';

export default function Sidebar() {
  const [recentPosts, setRecentPosts] = useState<PostWithCategory[]>([]);
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);

  useEffect(() => {
    const load = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (postsRes.data) setRecentPosts(postsRes.data as PostWithCategory[]);

      if (catsRes.data) {
        const withCounts = await Promise.all(
          catsRes.data.map(async (cat) => {
            const { count } = await supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', cat.id)
              .eq('published', true);
            return { ...cat, count: count ?? 0 };
          })
        );
        setCategories(withCounts);
      }
    };
    load();
  }, []);

  return (
    <aside className="space-y-6">
      {/* Ad slot — top */}
      <div className="bg-slate-100 border border-dashed border-slate-300 rounded-xl h-[250px] flex items-center justify-center text-slate-400 text-xs text-center px-4">
        <div>
          <div className="text-2xl mb-2">AD</div>
          <div>250×250 Ad Space</div>
          <div className="text-slate-300 mt-1">Google AdSense</div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
          <FolderOpen size={15} className="text-amber-500" />
          Categories
        </h3>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/category/${cat.slug}`}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-amber-50 group transition-colors"
              >
                <span className="text-sm text-slate-700 group-hover:text-amber-700 font-medium">{cat.name}</span>
                <span className="text-xs bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 px-2 py-0.5 rounded-full font-medium transition-colors">
                  {cat.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent posts */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">
          <TrendingUp size={15} className="text-amber-500" />
          Recent Biographies
        </h3>
        <ul className="space-y-3">
          {recentPosts.map((post) => (
            <li key={post.id}>
              <Link to={`/biography/${post.slug}`} className="flex gap-3 group">
                <img
                  src={post.featured_image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={post.title}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Calendar size={10} />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Ad slot — bottom */}
      <div className="bg-slate-100 border border-dashed border-slate-300 rounded-xl h-[300px] flex items-center justify-center text-slate-400 text-xs text-center px-4">
        <div>
          <div className="text-2xl mb-2">AD</div>
          <div>300×300 Ad Space</div>
          <div className="text-slate-300 mt-1">Google AdSense</div>
        </div>
      </div>
    </aside>
  );
}
