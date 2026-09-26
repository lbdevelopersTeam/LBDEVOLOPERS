import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component ensures that the page scrolls to the top whenever
 * the user navigates to a new route.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const isSamePageAnchor = previousPathname.current === pathname && Boolean(hash);
    root.style.scrollBehavior = 'auto';

    let anchorId = '';
    if (hash) {
      try {
        anchorId = decodeURIComponent(hash.slice(1));
      } catch {
        anchorId = hash.slice(1);
      }
    }
    const anchor = anchorId ? document.getElementById(anchorId) : null;
    if (anchor) {
      const scrollLocked = root.style.overflow === 'hidden' || document.body.style.overflow === 'hidden';
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      anchor.scrollIntoView({
        behavior: isSamePageAnchor && !scrollLocked && !prefersReducedMotion ? 'smooth' : 'auto',
        block: 'start',
      });
    } else if (previousPathname.current !== pathname || !hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    root.style.scrollBehavior = previousScrollBehavior;
    previousPathname.current = pathname;
  }, [hash, pathname]);

  return null;
}
