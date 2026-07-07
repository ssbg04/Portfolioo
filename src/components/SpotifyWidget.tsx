import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

// Brand-aligned developer playlist (fallback when API is inactive or offline)
const fallbackPlaylist: Track[] = [
  {
    title: "Resonance",
    artist: "Home",
    albumArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=80&h=80&q=80",
    spotifyUrl: "https://open.spotify.com/track/1y7R1Cj8vt1w1w2y8B8b8B"
  },
  {
    title: "Midnight City",
    artist: "M83",
    albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=80&h=80&q=80",
    spotifyUrl: "https://open.spotify.com/track/1eyzQal24xyZ7vscCYKjFB"
  },
  {
    title: "Intro",
    artist: "The xx",
    albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=80&h=80&q=80",
    spotifyUrl: "https://open.spotify.com/track/2usrT8Standard"
  },
  {
    title: "Strobe",
    artist: "Deadmau5",
    albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=80&h=80&q=80",
    spotifyUrl: "https://open.spotify.com/track/Standard"
  }
];

export default function SpotifyWidget() {
  const [track, setTrack] = useState<Track>(fallbackPlaylist[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(30);
  const [isApiActive, setIsApiActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const currentTrackIndexRef = useRef(0);

  // 1. Fetch live song details from our secure API endpoint
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing');
        if (response.ok) {
          const data = await response.json();
          // If song details exist and isPlaying is returned
          if (data.title) {
            setTrack({
              title: data.title,
              artist: data.artist,
              albumArt: data.albumArt || fallbackPlaylist[0].albumArt,
              spotifyUrl: data.spotifyUrl || fallbackPlaylist[0].spotifyUrl
            });
            setIsPlaying(data.isPlaying);
            setProgress(data.progressPercent || 0);
            setIsApiActive(true);
            return;
          }
        }
      } catch (error) {
        console.warn("Spotify API unavailable, falling back to simulated tracks.", error);
      }
      setIsApiActive(false);
    };

    fetchNowPlaying();
    // Poll API every 7 seconds for track changes
    const apiPollInterval = setInterval(fetchNowPlaying, 7000);
    return () => clearInterval(apiPollInterval);
  }, []);

  // 2. Simulated playlist progress and cycle logic (runs only when live API is unavailable)
  useEffect(() => {
    if (isApiActive || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Cycle to the next track in fallback list
          const nextIndex = (currentTrackIndexRef.current + 1) % fallbackPlaylist.length;
          currentTrackIndexRef.current = nextIndex;
          setTrack(fallbackPlaylist[nextIndex]);
          return 0;
        }
        return prev + 1.6; // Increment simulated progress
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isApiActive]);

  return (
    <div className="fixed top-[82px] sm:top-[98px] left-0 w-full z-40 pointer-events-none flex justify-start">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full flex justify-start">
        <motion.div
          className="select-none cursor-pointer flex items-center pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.8 }}
        >
      <motion.div
        layout
        className="glass-card border border-white/20 bg-white/5 backdrop-blur-xl rounded-full p-2 flex items-center gap-3 shadow-lg shadow-black/10 overflow-hidden"
        style={{
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
          maxWidth: isHovered ? '280px' : '150px'
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
      >
        {/* Album Art spinning vinyl */}
        <motion.div
          className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10"
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "linear"
          }}
        >
          <img
            src={track.albumArt}
            alt="Album art"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable="false"
          />
          {/* Vinyl center cutout gap */}
          <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-[#121212] border border-white/20" />
        </motion.div>

        {/* Track Title and Artist */}
        <motion.div layout className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[8px] font-bold text-[#1DB954] uppercase tracking-widest flex-shrink-0 animate-pulse">
              ● {isApiActive ? "Live" : "Loop"}
            </span>
            <span className="text-[10px] font-bold text-foreground-custom truncate max-w-[100px]">
              {track.title}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground-custom truncate max-w-[100px]">
            {track.artist}
          </span>

          {/* Expanded progress information on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 w-32 overflow-hidden"
              >
                {/* Horizontal slider tracking */}
                <div className="w-full h-1 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-[#1DB954] rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Listen connection anchor link */}
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-[8px] font-bold text-[#1DB954] hover:underline"
                >
                  Listen on Spotify
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z"/>
                  </svg>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Jumping sound equalizers */}
        <div className="flex items-end gap-0.5 h-3 pr-1 flex-shrink-0">
          <motion.div
            className="w-0.5 bg-[#1DB954] rounded-t"
            animate={isPlaying ? { height: [3, 11, 3] } : { height: 3 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
          />
          <motion.div
            className="w-0.5 bg-[#1DB954] rounded-t"
            animate={isPlaying ? { height: [4, 15, 4] } : { height: 4 }}
            transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.15 }}
          />
          <motion.div
            className="w-0.5 bg-[#1DB954] rounded-t"
            animate={isPlaying ? { height: [3, 9, 3] } : { height: 3 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut", delay: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
      </div>
    </div>
  );
}
