import React, { useState, useEffect } from 'react';
import haptic from '../lib/haptics';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

const defaultTrack: Track = {
  title: 'Coding & Lo-Fi Flow',
  artist: 'Spotify Vibes',
  albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  spotifyUrl: 'https://open.spotify.com'
};

interface SpotifyWidgetProps {
  isOpen?: boolean;
}

export default function SpotifyWidget({ isOpen = true }: SpotifyWidgetProps) {
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [hasUserManuallyPaused, setHasUserManuallyPaused] = useState(false);
  const [progress, setProgress] = useState(45);

  useEffect(() => {
    if (!isOpen) return;

    let interval: NodeJS.Timeout;
    const controller = new AbortController();

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing', { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          if (data.currentPlaying) {
            setTrack({
              title: data.currentPlaying.title,
              artist: data.currentPlaying.artist,
              albumArt: data.currentPlaying.albumArt || defaultTrack.albumArt,
              spotifyUrl: data.currentPlaying.spotifyUrl || defaultTrack.spotifyUrl
            });
            setIsLivePlaying(true);
            if (!hasUserManuallyPaused) {
              setIsPlaying(Boolean(data.currentPlaying.isPlaying));
            }
            setProgress(data.currentPlaying.progressPercent || 50);
            return;
          } else if (data.recentlyPlayed) {
            setTrack({
              title: data.recentlyPlayed.title,
              artist: data.recentlyPlayed.artist,
              albumArt: data.recentlyPlayed.albumArt || defaultTrack.albumArt,
              spotifyUrl: data.recentlyPlayed.spotifyUrl || defaultTrack.spotifyUrl
            });
            setIsLivePlaying(false);
            // Fix: Keep vinyl spinning for recently played tracks unless user manually paused!
            if (!hasUserManuallyPaused) {
              setIsPlaying(true);
            }
            setProgress(60);
            return;
          }
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          // Fallback to default
        }
      }
    };

    fetchNowPlaying();
    interval = setInterval(fetchNowPlaying, 10000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [isOpen, hasUserManuallyPaused]);

  const togglePlay = () => {
    haptic.tap();
    const next = !isPlaying;
    setIsPlaying(next);
    setHasUserManuallyPaused(!next);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3.5 py-1 select-none">
      {/* ─── Sleeve & Vinyl Disc Showcase ─── */}
      <div className="relative w-56 sm:w-64 h-40 sm:h-44 flex items-center justify-start my-1">
        
        {/* 1. Realistic Black Vinyl Disc (Behind Sleeve, Emerging Right) */}
        <div
          onClick={togglePlay}
          title={isPlaying ? 'Click to pause spinning' : 'Click to spin vinyl'}
          className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#0a0a0e] border border-zinc-800 flex items-center justify-center cursor-pointer transition-all duration-300 z-0 group-hover:translate-x-2 ${
            isPlaying ? 'animate-spin' : 'rotate-12'
          }`}
          style={{
            animationDuration: '5s',
            animationTimingFunction: 'linear',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.75), inset 0 0 12px rgba(0, 0, 0, 0.95)'
          }}
        >
          {/* Concentric Sound Groove Rings */}
          <div className="absolute inset-1.5 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-3 rounded-full border border-white/[0.07] pointer-events-none" />
          <div className="absolute inset-4.5 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-6 rounded-full border border-white/[0.07] pointer-events-none" />
          <div className="absolute inset-7.5 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute inset-9 rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute inset-11 rounded-full border border-white/[0.05] pointer-events-none" />

          {/* Conic Lighting Sheen Reflection */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-45 mix-blend-screen"
            style={{
              background:
                'conic-gradient(from 45deg, rgba(255,255,255,0.18) 0deg, transparent 35deg, transparent 180deg, rgba(255,255,255,0.18) 215deg, transparent 250deg, transparent 360deg)'
            }}
          />

          {/* Center Circular Album Art Label */}
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 border-zinc-700 bg-black flex items-center justify-center shadow-lg pointer-events-none">
            <img
              src={track.albumArt}
              alt={track.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Center Spindle Hole */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#111116] border border-white/50 z-10 shadow-inner" />
        </div>

        {/* 2. Album Cover Sleeve (In Front, Covering Left Half of Disc) */}
        <div
          className="relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-xl overflow-hidden bg-card-custom border border-border-custom shadow-md shrink-0 group/sleeve cursor-pointer"
          onClick={togglePlay}
        >
          {/* Full Cover Art */}
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/sleeve:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Top-left Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause vinyl rotation' : 'Spin vinyl'}
            className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-xs text-white border border-white/20 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            {isPlaying ? (
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Bottom Dark Vignette Gradient for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Bottom-left Overlaid Track Title & Artist */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex flex-col text-left pointer-events-none">
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto text-sm sm:text-base font-semibold text-white leading-tight truncate hover:underline hover:text-primary-custom transition-colors"
              title={track.title}
            >
              {track.title}
            </a>
            <p className="text-[11px] sm:text-xs text-white/90 font-bold leading-tight truncate mt-0.5">
              {track.artist}
            </p>
          </div>

          {/* Right Edge Inner Spine/Slit Shadow */}
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ─── Track Status, Progress & Spotify Action ─── */}
      <div className="w-full pt-1 flex flex-col gap-2.5">
        {/* Status indicator and Spotify Link */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-1 h-2.5 bg-foreground-custom" />
                <span className="w-1 h-3.5 bg-foreground-custom" />
                <span className="w-1 h-1.5 bg-foreground-custom" />
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-muted-foreground-custom border border-border-custom" />
            )}
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-foreground-custom">
              {isPlaying ? (isLivePlaying ? 'now playing' : 'recently played') : 'paused'}
            </span>
          </div>

          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic.tap()}
            className="flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border border-border-custom bg-card-custom text-foreground-custom hover:border-foreground-custom active:translate-y-px transition-all"
          >
            <span>spotify ↗</span>
          </a>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-muted-custom border border-border-custom rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground-custom transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
