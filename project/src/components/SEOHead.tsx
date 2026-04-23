import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string;
  publishedTime?: string;
}

export default function SEOHead({ title, description, image, url, type = 'website', keywords, publishedTime }: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const removeMeta = (name: string, property = false) => {
      const attr = property ? 'property' : 'name';
      const el = document.querySelector(`meta[${attr}="${name}"]`);
      if (el) el.remove();
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }
    if (image) {
      setMeta('og:image', image, true);
      setMeta('twitter:image', image);
    }
    if (url) setMeta('og:url', url, true);
    if (keywords) {
      setMeta('keywords', keywords);
    } else {
      removeMeta('keywords');
    }
    if (publishedTime) {
      setMeta('article:published_time', publishedTime, true);
    } else {
      removeMeta('article:published_time', true);
    }
    setMeta('og:title', title, true);
    setMeta('og:type', type, true);
    setMeta('twitter:title', title);
    setMeta('twitter:card', 'summary_large_image');
  }, [title, description, image, url, type, keywords, publishedTime]);

  return null;
}
