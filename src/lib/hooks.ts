import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    // Set initial value
    setIsMobile(mql.matches);

    // Event listener for changes
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    // Support for older browsers that don't have addEventListener on MediaQueryList
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      mql.addListener(handler);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, [breakpoint]);

  return isMobile;
}
