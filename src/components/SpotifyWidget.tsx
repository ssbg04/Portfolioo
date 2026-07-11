import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

export default function SpotifyWidget({ className = '' }: { className?: string }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isApiActive, setIsApiActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live or recently played song details from our secure API endpoint
  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/now-playing');
        if (response.ok) {
          const data = await response.json();
          
          if (data.currentPlaying) {
            setTrack({
              title: data.currentPlaying.title,
              artist: data.currentPlaying.artist,
              albumArt: data.currentPlaying.albumArt,
              spotifyUrl: data.currentPlaying.spotifyUrl
            });
            setIsPlaying(data.currentPlaying.isPlaying);
            setProgress(data.currentPlaying.progressPercent || 0);
            setIsApiActive(true);
            return;
          } else if (data.recentlyPlayed) {
            setTrack({
              title: data.recentlyPlayed.title,
              artist: data.recentlyPlayed.artist,
              albumArt: data.recentlyPlayed.albumArt,
              spotifyUrl: data.recentlyPlayed.spotifyUrl
            });
            setIsPlaying(false);
            setProgress(0);
            setIsApiActive(true);
            return;
          }
        }
      } catch (error) {
        console.warn("Spotify API unavailable.", error);
      }
      setIsApiActive(false);
    };

    fetchNowPlaying();
    // Poll API every 7 seconds for track changes
    const apiPollInterval = setInterval(fetchNowPlaying, 7000);
    return () => clearInterval(apiPollInterval);
  }, []);

  if (!track) return null;

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Trigger Icon */}
      <motion.div
        className="cursor-pointer flex items-center justify-center relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Album Art spinning vinyl */}
        <motion.div
          className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 shadow-md"
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        >
          <img
            src={track.albumArt}
            alt="Album art"
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable="false"
          />
          {/* Vinyl center cutout gap */}
          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#121212] border border-white/20" />
        </motion.div>

        {/* Live Indicator Dot */}
        <div 
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background-custom animate-pulse ${isPlaying ? 'bg-[#1DB954]' : 'bg-red-500'}`} 
        />
      </motion.div>

      {/* Notification Box Modal - Rendered via Portal to escape navbar backdrop-filter stacking context */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(2px)" }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed top-[88px] md:top-24 left-1/2 -translate-x-1/2 w-[260px] glass-nav border border-white/10 rounded-2xl p-4 shadow-2xl z-[100] pointer-events-auto"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isPlaying ? 'text-[#1DB954]' : 'text-muted-foreground-custom'}`}>
                    {isPlaying ? "Playing Now" : "Last Played"}
                    {/* Jumping sound equalizers */}
                    {isPlaying && (
                      <div className="flex items-end gap-[2px] h-2.5 pr-1 flex-shrink-0">
                        <motion.div className="w-[2px] bg-[#1DB954] rounded-t" animate={{ height: [3, 10, 3] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} />
                        <motion.div className="w-[2px] bg-[#1DB954] rounded-t" animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.15 }} />
                        <motion.div className="w-[2px] bg-[#1DB954] rounded-t" animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut", delay: 0.3 }} />
                      </div>
                    )}
                  </span>
                  
                  {/* Minimize Icon */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                    className="text-muted-foreground-custom hover:text-foreground-custom transition-all p-1.5 rounded-full bg-white/5 hover:bg-white/15"
                    aria-label="Minimize Spotify Widget"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col mt-1">
                  <span className="text-sm font-bold text-foreground-custom truncate leading-tight">
                    {track.title}
                  </span>
                  <span className="text-xs text-muted-foreground-custom truncate mt-0.5">
                    {track.artist}
                  </span>
                </div>

                {/* Horizontal slider tracking */}
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${isPlaying ? 'bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.6)]' : 'bg-muted-foreground-custom'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-1.5 mt-2 py-1.5 rounded-lg text-xs font-bold transition-all ${isPlaying ? 'bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954]/20' : 'bg-white/5 text-foreground-custom hover:bg-white/10'}`}
                >
                  Listen on Spotify
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .007c-6.627 0-12 5.371-12 12s5.373 12 12 12 12-5.371 12-12-5.373-12-12-12zm5.49 17.31c-.22.361-.69.479-1.05.261-2.91-1.781-6.57-2.181-10.89-1.191-.41.09-.82-.17-.91-.58-.09-.41.17-.82.58-.91 4.73-1.08 8.77-.63 12.01 1.35.36.21.48.68.26 1.04zm1.04-3.261c-.28.45-.87.6-1.32.32-3.33-2.04-8.41-2.64-12.35-1.45-.51.15-1.04-.14-1.2-.65-.15-.51.14-1.04.65-1.2 4.51-1.37 10.11-.7 13.9 1.62.45.28.6.87.32 1.32zm.09-3.38c-3.99-2.37-10.58-2.59-14.39-1.43-.61.19-1.26-.14-1.45-.75-.19-.61.14-1.26.75-1.45 4.38-1.33 11.64-1.08 16.23 1.65.55.33.73 1.04.4 1.59-.33.55-1.04.73-1.59.4z" />
                  </svg>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
