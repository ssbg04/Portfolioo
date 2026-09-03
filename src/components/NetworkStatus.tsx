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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-medium transition-all duration-300 pointer-events-none select-none ${
        isOnline
          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-200'
          : 'bg-zinc-900/90 border border-amber-500/40 text-amber-200'
      }`}
      style={{ animation: 'bentoReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
    >
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
        }`}
      />
      <span>
        {isOnline
          ? 'Connected • Fresh updates synced'
          : 'Offline Mode • Browsing saved portfolio'}
      </span>
    </div>
  );
}
