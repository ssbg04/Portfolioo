/**
 * Ultra-smooth Theme Switching Utility.
 * 
 * Uses hardware-accelerated View Transitions API for a clean, basic cross-fade animation
 * while suppressing individual node CSS transitions to eliminate lag and frame drops.
 */

export type ResolvedTheme = 'light' | 'dark';

export function switchTheme(nextTheme: ResolvedTheme): ResolvedTheme {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return nextTheme;
  }

  const root = document.documentElement;

  const applyThemeUpdate = () => {
    // 1. Temporarily suppress individual node CSS transitions so snapshot captures crisp state
    root.classList.add('disable-transitions');

    // 2. Persist to localStorage
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Local storage unavailable (private browsing quota)
    }

    // 3. Update DOM class and mobile status bar color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      metaThemeColor?.setAttribute('content', '#0c0c0f');
    } else {
      root.classList.remove('dark');
      metaThemeColor?.setAttribute('content', '#ffffff');
    }

    // 4. Force synchronous style recalculation while transitions are disabled
    void root.offsetHeight;

    // 5. Safely re-enable normal transitions after layout flushes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('disable-transitions');
      });
    });

    // 6. Broadcast custom event to notify listeners
    window.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: { theme: nextTheme }
      })
    );
  };

  // If the browser supports View Transitions API and user does not prefer reduced motion,
  // execute theme switch inside startViewTransition for a smooth 0.22s GPU cross-fade animation!
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    (document as any).startViewTransition(() => {
      applyThemeUpdate();
    });
  } else {
    applyThemeUpdate();
  }

  return nextTheme;
}

export function getCurrentTheme(): ResolvedTheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
