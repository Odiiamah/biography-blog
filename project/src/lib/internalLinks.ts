import type { PostWithCategory } from '../types/database';

interface LinkCandidate {
  slug: string;
  title: string;
  keywords: string[];
}

function extractKeywords(post: PostWithCategory): string[] {
  const kws: string[] = [];
  if (post.keywords) {
    kws.push(...post.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean));
  }
  // Also use the person's name from the title (before the colon)
  const colonIdx = post.title.indexOf(':');
  if (colonIdx > 0) {
    kws.push(post.title.slice(0, colonIdx).trim().toLowerCase());
  }
  // Use the slug as a keyword too
  kws.push(post.slug.replace(/-/g, ' ').toLowerCase());
  return [...new Set(kws)];
}

export function buildLinkCandidates(posts: PostWithCategory[]): LinkCandidate[] {
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    keywords: extractKeywords(p),
  }));
}

export function applyInternalLinks(html: string, candidates: LinkCandidate[], currentSlug: string): string {
  // Work on text nodes only — don't break existing HTML tags
  // We'll process paragraph text content between > and <
  let result = html;

  for (const candidate of candidates) {
    if (candidate.slug === currentSlug) continue;

    for (const kw of candidate.keywords) {
      if (kw.length < 3) continue; // Skip very short keywords

      // Match the keyword in text nodes (not inside HTML tags or existing links)
      // This regex finds the keyword when it's NOT inside an HTML tag
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?<![<\\w/])\\b(${escaped})\\b(?![^<]*>|<\\/a)`, 'gi');

      let count = 0;
      result = result.replace(pattern, (match) => {
        count++;
        if (count > 2) return match; // Max 2 links per keyword per article
        return `<a href="/biography/${candidate.slug}" class="internal-link" title="${candidate.title}">${match}</a>`;
      });
    }
  }

  return result;
}
