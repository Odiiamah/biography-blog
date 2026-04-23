import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Calendar, Tag, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PostWithCategory } from '../types/database';
import { buildLinkCandidates, applyInternalLinks } from '../lib/internalLinks';
import Sidebar from '../components/Sidebar';
import AdSlot from '../components/AdSlot';
import SEOHead from '../components/SEOHead';
import PostCard from '../components/PostCard';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostWithCategory | null>(null);
  const [related, setRelated] = useState<PostWithCategory[]>([]);
  const [allPosts, setAllPosts] = useState<PostWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      const [postRes, allRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle(),
        supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('published', true)
          .order('created_at', { ascending: false }),
      ]);

      if (!postRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(postRes.data as PostWithCategory);
      if (allRes.data) setAllPosts(allRes.data as PostWithCategory[]);

      if (postRes.data.category_id) {
        const { data: rel } = await supabase
          .from('posts')
          .select('*, categories(*)')
          .eq('category_id', postRes.data.category_id)
          .eq('published', true)
          .neq('id', postRes.data.id)
          .order('created_at', { ascending: false })
          .limit(3);
        if (rel) setRelated(rel as PostWithCategory[]);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const processedContent = useMemo(() => {
    if (!post) return '';
    const candidates = buildLinkCandidates(allPosts);
    return applyInternalLinks(post.content, candidates, post.slug);
  }, [post, allPosts]);

  if (notFound) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        image={post.featured_image}
        type="article"
        keywords={post.keywords}
        publishedTime={post.created_at}
      />

      {/* Hero image */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden">
        <img
          src={post.featured_image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
          <ChevronRight size={12} />
          {post.categories && (
            <>
              <Link to={`/category/${post.categories.slug}`} className="hover:text-amber-600 transition-colors">
                {post.categories.name}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-slate-700 font-medium line-clamp-1">{post.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Article */}
          <article className="lg:col-span-2">
            {post.categories && (
              <Link
                to={`/category/${post.categories.slug}`}
                className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 hover:bg-amber-200 transition-colors"
              >
                <Tag size={11} />
                {post.categories.name}
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-slate-300">|</span>
              <span>Updated {new Date(post.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* In-article ad */}
            <AdSlot type="banner" label="728×90 In-Article Ad" />

            {/* Content */}
            <div
              className="prose prose-slate prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-slate-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-slate-700 prose-p:leading-[1.8]
                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                prose-li:text-slate-700 prose-li:leading-relaxed
                prose-strong:text-slate-900
                prose-ul:my-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Bottom ad */}
            <div className="mt-10">
              <AdSlot type="rectangle" label="In-Article Rectangle Ad" />
            </div>

            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft size={15} />
              Back to all biographies
            </Link>

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 mb-5">More in {post.categories?.name}</h2>
                <div className="space-y-3">
                  {related.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <div className="mt-10 lg:mt-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
