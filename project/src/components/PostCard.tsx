import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import type { PostWithCategory } from '../types/database';

interface PostCardProps {
  post: PostWithCategory;
  featured?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <Link to={`/biography/${post.slug}`} className="block">
          <div className="relative overflow-hidden aspect-[16/9]">
            <img
              src={post.featured_image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            {post.categories && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {post.categories.name}
              </span>
            )}
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-shadow duration-200 border border-slate-100">
      <Link to={`/biography/${post.slug}`} className="flex-shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg">
          <img
            src={post.featured_image || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        {post.categories && (
          <Link
            to={`/category/${post.categories.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1.5 hover:text-amber-700"
          >
            <Tag size={11} />
            {post.categories.name}
          </Link>
        )}
        <Link to={`/biography/${post.slug}`}>
          <h3 className="font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-amber-600 transition-colors line-clamp-2 text-sm sm:text-base">
            {post.title}
          </h3>
        </Link>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-2">{post.excerpt}</p>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={11} />
          {formatDate(post.created_at)}
        </span>
      </div>
    </article>
  );
}
