import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PostWithCategory } from '../types/database';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import SEOHead from '../components/SEOHead';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<PostWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    setInputValue(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('published', true)
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) setResults(data as PostWithCategory[]);
      setLoading(false);
    };
    load();
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setSearchParams({ q: inputValue.trim() });
  };

  return (
    <>
      <SEOHead
        title={q ? `"${q}" — Search Results — BiographyHub` : 'Search — BiographyHub'}
        description={`Search results for "${q}" on BiographyHub.`}
      />

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 pt-28 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-white mb-6">Search Biographies</h1>
          <form onSubmit={handleSearch} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search by name, category..."
              className="w-full pl-11 pr-28 py-4 rounded-xl text-slate-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white font-semibold text-sm px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            {q && (
              <p className="text-slate-500 text-sm mb-6">
                {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for`}{' '}
                {!loading && <strong className="text-slate-900">"{q}"</strong>}
              </p>
            )}

            {loading && (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-3">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {!loading && q && results.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <Search size={40} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-slate-600">No results found for "{q}"</p>
                <p className="text-sm mt-2">Try a different search term or browse by category.</p>
                <Link to="/" className="text-amber-600 text-sm mt-4 inline-block hover:underline font-medium">
                  Browse all biographies
                </Link>
              </div>
            )}

            {!q && (
              <div className="text-center py-20 text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-600">Enter a search term above</p>
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
