import React, { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setShowToast(true);
      setHasChanged(true);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setHasChanged(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      setHasChanged(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast || !hasChanged) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border border-border-custom shadow-lg backdrop-blur-md flex items-center gap-2.5 text-xs font-mono font-medium transition-all duration-300 pointer-events-none select-none bg-card-custom/95 text-foreground-custom ${
        isOnline ? '' : 'text-amber-500'
      }`}
      style={{ animation: 'bentoReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'
        }`}
      />
      <span>
        {isOnline
          ? 'ONLINE • Live Updates Synced'
          : 'OFFLINE • Browsing Cached Portfolio'}
      </span>
    </div>
  );
}
