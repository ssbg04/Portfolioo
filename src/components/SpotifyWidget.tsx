import React, { useState, useEffect } from 'react';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

const defaultTrack: Track = {
  title: 'Coding & Lo-Fi Flow',
  artist: 'Spotify Vibes',
  albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
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
      } catch (e) {
        // Fallback to default
      }
    };

    fetchNowPlaying();
    interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-2xl glass-card border border-border-custom p-3 sm:p-3.5 flex items-center gap-3.5 shadow-sm group hover:border-[#1DB954]/40 transition-all">
      {/* Album Art with Green Glow */}
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-muted-custom/40 border border-border-custom shadow-xs group-hover:scale-105 transition-transform duration-300">
        <img
          src={track.albumArt}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-black/80 border border-white/30" />
      </div>

      {/* Track Info & Progress */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Top Tag: Now Playing / Spotify Badge */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2.5 bg-[#1DB954] rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-[#1DB954] rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse delay-150" />
              </div>
            ) : (
              <span className="w-2 h-2 rounded-full bg-muted-foreground-custom/60" />
            )}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1DB954]">
              {isPlaying ? 'Now Playing' : 'Recently Played'}
            </span>
          </div>

          <svg className="w-3.5 h-3.5 text-[#1DB954] shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
          </svg>
        </div>

        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold font-heading text-foreground-custom truncate hover:text-[#1DB954] transition-colors leading-tight"
          title={track.title}
        >
          {track.title}
        </a>

        <p className="text-[11px] text-muted-foreground-custom truncate leading-tight mt-0.5">
          {track.artist}
        </p>

        <div className="w-full h-1 bg-foreground-custom/10 rounded-full mt-1.5 overflow-hidden">
          <div
            className="h-full bg-[#1DB954] rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
