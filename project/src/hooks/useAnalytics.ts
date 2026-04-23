import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SESSION_KEY = 'bh_session_id';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function getOrCreateSessionId(): string {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

function extractPostId(path: string): string | null {
  const match = path.match(/^\/biography\/(.+)$/);
  return match ? match[1] : null;
}

async function trackEvent(type: 'pageview' | 'click', payload: Record<string, string>) {
  const sessionId = getOrCreateSessionId();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    await fetch(`${supabaseUrl}/functions/v1/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ type, payload: { ...payload, sessionId } }),
    });
  } catch {
    // Analytics should never break the user experience
  }
}

export function usePageTracking() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    const postId = extractPostId(location.pathname);
    trackEvent('pageview', {
      path: location.pathname,
      referrer: document.referrer,
      postId: postId || '',
    });
  }, [location.pathname]);

  // Track initial page load
  useEffect(() => {
    const postId = extractPostId(location.pathname);
    trackEvent('pageview', {
      path: location.pathname,
      referrer: document.referrer,
      postId: postId || '',
    });
  }, []);
}

export function trackClick(elementType: 'ad' | 'internal_link' | 'external_link', elementId: string, path: string) {
  trackEvent('click', { elementType, elementId, path });
}

// Auto-track clicks on elements with data-track attribute
export function useClickTracking() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-track]');
      if (target) {
        const el = target as HTMLElement;
        const elementType = (el.dataset.trackType || 'ad') as 'ad' | 'internal_link' | 'external_link';
        const elementId = el.dataset.track || el.id || '';
        trackClick(elementType, elementId, window.location.pathname);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);
}
