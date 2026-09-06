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

export default function SpotifyWidget() {
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing');
        if (response.ok) {
          const data = await response.json();
          if (data.currentPlaying) {
            setTrack({
              title: data.currentPlaying.title,
              artist: data.currentPlaying.artist,
              albumArt: data.currentPlaying.albumArt || defaultTrack.albumArt,
              spotifyUrl: data.currentPlaying.spotifyUrl || defaultTrack.spotifyUrl
            });
            setIsPlaying(Boolean(data.currentPlaying.isPlaying));
            setProgress(data.currentPlaying.progressPercent || 50);
            return;
          } else if (data.recentlyPlayed) {
            setTrack({
              title: data.recentlyPlayed.title,
              artist: data.recentlyPlayed.artist,
              albumArt: data.recentlyPlayed.albumArt || defaultTrack.albumArt,
              spotifyUrl: data.recentlyPlayed.spotifyUrl || defaultTrack.spotifyUrl
            });
            setIsPlaying(false);
            setProgress(100);
            return;
          }
        }
      } catch {
        // Fallback to default
      }
    };

    fetchNowPlaying();
    interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    haptic.tap();
    setIsPlaying(!isPlaying);
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
            />
          </div>

          {/* Center Spindle Hole */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-[#111116] border border-white/50 z-10 shadow-inner" />
        </div>

        {/* 2. Album Cover Sleeve (In Front, Covering Left Half of Disc) */}
        <div
          className="relative z-10 w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl shrink-0 group/sleeve cursor-pointer"
          onClick={togglePlay}
          style={{
            boxShadow: '4px 10px 30px -2px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Full Cover Art */}
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/sleeve:scale-105"
            loading="lazy"
          />

          {/* Top-left Translucent Play/Pause Pill Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause vinyl rotation' : 'Spin vinyl'}
            className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-xl bg-white/35 hover:bg-white/55 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 text-white"
          >
            {isPlaying ? (
              <svg className="w-3 h-3 fill-current drop-shadow-xs" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3 fill-current ml-0.5 drop-shadow-xs" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Bottom Dark Vignette Gradient for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

          {/* Bottom-left Overlaid Track Title & Artist */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex flex-col text-left pointer-events-none">
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md truncate hover:underline hover:text-[#1DB954] transition-colors"
              title={track.title}
            >
              {track.title}
            </a>
            <p className="text-[11px] sm:text-xs text-white/85 font-medium leading-tight drop-shadow-sm truncate mt-0.5">
              {track.artist}
            </p>
          </div>

          {/* Right Edge Inner Spine/Slit Shadow (Gives realistic sleeve pocket look) */}
          <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ─── Track Status, Progress & Spotify Action ─── */}
      <div className="w-full pt-1 flex flex-col gap-2">
        {/* Status indicator and Spotify Link */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2.5 bg-[#1DB954] rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-[#1DB954] rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse delay-150" />
              </div>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground-custom/60" />
            )}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1DB954]">
              {isPlaying ? 'Now Playing' : 'Paused / Recent'}
            </span>
          </div>

          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptic.tap()}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground-custom hover:text-[#1DB954] transition-colors"
          >
            <span>Open on Spotify</span>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
            </svg>
          </a>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-foreground-custom/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
