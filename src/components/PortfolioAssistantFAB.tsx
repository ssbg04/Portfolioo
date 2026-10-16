import React, { useState, useRef, useEffect } from 'react';
import haptic from '../lib/haptics';
import { switchTheme } from '../lib/theme';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

function parseTokens(text: string): React.ReactNode {
  // Matches **bold**, `code`, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground-custom">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <span
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-foreground-custom/10 text-primary-custom font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const isExt = linkMatch[2].startsWith('http') || linkMatch[2].startsWith('mailto:');
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target={isExt ? '_blank' : undefined}
          rel={isExt ? 'noopener noreferrer' : undefined}
          className="text-primary-custom underline underline-offset-2 font-medium hover:opacity-80"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

function renderMessageContent(text: string, isUser: boolean) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  const lines = text.split('\n');

  return (
    <div className="flex flex-col gap-1 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet item: • or -
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          const content = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-custom shrink-0 mt-1.5" />
              <span className="flex-1">{parseTokens(content)}</span>
            </div>
          );
        }

        // Numbered list item: 1. 2. etc
        const numMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="font-mono text-[10px] font-bold text-primary-custom shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{parseTokens(numMatch[2])}</span>
            </div>
          );
        }

        // Section header line (short and ends with a colon, e.g. "Featured Projects:")
        if (/^[A-Za-z\s&–—]+:$/.test(trimmed) && trimmed.length < 40) {
          return (
            <div key={idx} className="font-semibold text-foreground-custom tracking-tight mt-1">
              {parseTokens(trimmed)}
            </div>
          );
        }

        // Standard line
        return (
          <p key={idx} className="leading-relaxed">
            {parseTokens(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function PortfolioAssistantFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hello! I'm Cris's Portfolio Assistant.\n\nAsk me anything about Cris's projects, technical skills, certifications, work experience, or contact information."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamNotice, setSpamNotice] = useState<string | null>(null);
  const [isBtnHidden, setIsBtnHidden] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateDark();
    window.addEventListener('theme-change', updateDark);
    return () => window.removeEventListener('theme-change', updateDark);
  }, []);

  const toggleTheme = (explicitMode?: 'light' | 'dark') => {
    haptic.tap();
    const currentDark = document.documentElement.classList.contains('dark');
    const nextTheme = explicitMode || (currentDark ? 'light' : 'dark');
    switchTheme(nextTheme);
    setIsDark(nextTheme === 'dark');
    return nextTheme;
  };

  // Hide on scroll down, show on scroll up in mobile view
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const onScroll = () => {
      if (window.innerWidth >= 768) {
        setIsBtnHidden(false);
        return;
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // Always show at top of page or negative bounce
          if (currentY <= 20) {
            setIsBtnHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          // Keep button visible while chat is open
          if (isOpen) {
            setIsBtnHidden(false);
            lastY = currentY;
            ticking = false;
            return;
          }

          const diff = currentY - lastY;

          // Scrolling down: hide
          if (diff > 8 && currentY > 60) {
            setIsBtnHidden(true);
          } else if (diff < -8) {
            // Scrolling up: reveal
            setIsBtnHidden(false);
          }

          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsBtnHidden(false);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleRoute = () => {
      setIsBtnHidden(false);
    };
    document.addEventListener('astro:page-load', handleRoute);
    document.addEventListener('astro:after-swap', handleRoute);
    return () => {
      document.removeEventListener('astro:page-load', handleRoute);
      document.removeEventListener('astro:after-swap', handleRoute);
    };
  }, []);

  // Anti-spam countdown timer for pre-selections
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Auto-open if query param ?assistant=open is in URL
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('assistant=open')) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const recentSubmits = useRef<number[]>([]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    // 1. Anti-spam: Active cooldown check
    if (cooldown > 0) {
      haptic.tap();
      setSpamNotice(`Please wait ${cooldown}s before sending another message.`);
      setTimeout(() => setSpamNotice(null), 2500);
      return;
    }

    // 2. Anti-spam: Large paste dump limit
    if (query.length > 250) {
      haptic.tap();
      setSpamNotice("Query too long (max 250 characters). Please keep it brief.");
      setTimeout(() => setSpamNotice(null), 3000);
      return;
    }

    // 3. Anti-spam: Duplicate copy-paste detection against recent queries
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg && lastUserMsg.text.trim().toLowerCase() === query.toLowerCase()) {
      haptic.tap();
      setSpamNotice("Duplicate question! Review the answer above.");
      setTimeout(() => setSpamNotice(null), 2500);
      return;
    }

    // 4. Anti-spam: Repetitive characters or words spam
    if (/(.)\1{9,}/.test(query)) {
      haptic.tap();
      setSpamNotice("Excessive repeating characters detected.");
      setTimeout(() => setSpamNotice(null), 2500);
      return;
    }
    const words = query.toLowerCase().split(/\s+/);
    if (words.length >= 4 && new Set(words).size <= 2) {
      haptic.tap();
      setSpamNotice("Repeated word copy-paste detected.");
      setTimeout(() => setSpamNotice(null), 2500);
      return;
    }

    // 5. Anti-spam: Sliding-window rapid flood prevention (max 3 submits in 8s)
    const now = Date.now();
    recentSubmits.current = recentSubmits.current.filter(t => now - t < 8000);
    if (recentSubmits.current.length >= 3) {
      haptic.tap();
      setCooldown(8); // 8-second penalty cooldown
      setSpamNotice("Slow down! Too many rapid requests (8s pause).");
      setTimeout(() => setSpamNotice(null), 3500);
      return;
    }
    // Direct Assistant Action: Theme switching
    const lower = query.toLowerCase();
    if (
      lower === 'dark' ||
      lower === 'light' ||
      lower.includes('dark mode') ||
      lower.includes('light mode') ||
      lower.includes('switch theme') ||
      lower.includes('toggle theme') ||
      lower.includes('change theme')
    ) {
      const targetMode: 'dark' | 'light' = lower.includes('dark')
        ? 'dark'
        : lower.includes('light')
        ? 'light'
        : isDark
        ? 'light'
        : 'dark';

      toggleTheme(targetMode);
      setInput('');
      requestAnimationFrame(() => {
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: query },
          {
            role: 'assistant',
            text: targetMode === 'dark'
              ? "Switched to **Dark Mode** (AMOLED `#000000`). Enjoy deep pitch black."
              : "Switched to **Light Mode**. Enjoy the clean minimal aesthetic."
          }
        ]);
      });
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setLoading(true);
    setCooldown(3); // 3-second cooldown across all query methods
    setSpamNotice(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (res.ok) {
        const data = await res.json();
        haptic.tick();
        setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        const errData = await res.json().catch(() => null);
        const errorText = errData?.text || "Unable to retrieve records right now. Please try searching another keyword or contact Cris directly.";
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: errorText }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Network error occurred while fetching information." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <>
      {/* ─── Floating Action Button (FAB) ─── */}
      <div
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-7 z-40"
        style={{
          transform: isBtnHidden && !isOpen ? 'translateY(calc(100% + 2rem))' : 'translateY(0)',
          opacity: isBtnHidden && !isOpen ? 0 : 1,
          pointerEvents: isBtnHidden && !isOpen ? 'none' : 'auto',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          willChange: 'transform, opacity',
        }}
      >
        <button
          onClick={() => {
            haptic.tap();
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? "Close Portfolio Assistant" : "Open Portfolio Assistant"}
          aria-expanded={isOpen}
          className="relative group p-3 sm:px-4 sm:py-3 rounded-full bg-primary-custom/95 backdrop-blur-md text-white shadow-lg hover:bg-primary-custom hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-primary-custom/80 font-medium"
        >
          {/* Animated ping badge */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background-custom animate-pulse" />
          )}

          {isOpen ? (
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.154-.63 4.887 4.887 0 0 0 1.28-3.138A7.834 7.834 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <span className="hidden md:inline landscape:hidden lg:landscape:inline text-xs font-mono tracking-wide pr-0.5">
                Assistant
              </span>
            </>
          )}
        </button>
      </div>

      {/* ─── Ambient Backdrop Blur Overlay (Mobile Screen Focus) ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden transition-opacity"
          onClick={() => {
            haptic.tap();
            setIsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Popup Assistant Modal / Drawer with Deep Glass Blur ─── */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-7 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[530px] rounded-2xl bg-card-custom/85 dark:bg-black/85 border border-border-custom/80 shadow-[0_20px_50px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden animate-modal-scale"
          style={{
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >
          {/* Header with Quick Theme Switcher */}
          <div className="p-3.5 border-b border-border-custom/70 bg-muted-custom/20 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary-custom/15 text-primary-custom border border-primary-custom/30 flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                PA
              </div>
              <div>
                <h3 className="text-xs font-semibold font-heading text-foreground-custom tracking-tight">
                  Portfolio Assistant
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground-custom">
                  Fast Keyword Knowledge Search
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Theme Toggle Button in Assistant Header - Smooth rotation micro-animation */}
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                }}
                aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-1.5 rounded-md bg-background-custom/80 border border-border-custom text-muted-foreground-custom hover:text-foreground-custom hover:border-primary-custom/50 active:scale-95 transition-all cursor-pointer shadow-xs flex items-center justify-center relative overflow-hidden group"
              >
                <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                  {/* Sun Icon (Rotates & scales in dark mode) */}
                  <svg
                    className={`w-3.5 h-3.5 text-amber-400 absolute transition-all duration-300 ease-out transform ${
                      isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                  {/* Moon Icon (Rotates & scales in light mode) */}
                  <svg
                    className={`w-3.5 h-3.5 text-slate-700 dark:text-slate-300 absolute transition-all duration-300 ease-out transform ${
                      isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  haptic.tap();
                  setIsOpen(false);
                }}
                aria-label="Close Assistant"
                className="p-1.5 rounded-md bg-background-custom/80 border border-border-custom text-muted-foreground-custom hover:text-foreground-custom transition-all cursor-pointer shadow-xs flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area with Translucent Backdrop */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs leading-relaxed bg-transparent">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[88%] text-xs backdrop-blur-sm ${
                      isUser
                        ? 'bg-primary-custom text-white font-normal rounded-br-xs shadow-xs'
                        : 'bg-card-custom/90 dark:bg-card-custom/75 text-foreground-custom border border-border-custom/70 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {renderMessageContent(msg.text, isUser)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card-custom/85 backdrop-blur-sm border border-border-custom/80 shadow-xs w-fit text-xs text-foreground-custom">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce delay-200" />
                <span className="text-[10px] font-mono text-muted-foreground-custom ml-1">Searching records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips with Theme Switcher Chip */}
          <div className="px-3 py-2 border-t border-border-custom/60 bg-muted-custom/20 backdrop-blur-md flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[9px] font-mono font-medium text-muted-foreground-custom uppercase tracking-wider">
                Quick Topics
              </span>
              {cooldown > 0 ? (
                <span className="text-[9px] font-mono text-amber-500 flex items-center gap-1 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Cooldown ({cooldown}s)
                </span>
              ) : spamNotice ? (
                <span className="text-[9px] font-mono text-rose-500 font-medium truncate max-w-[200px]">
                  {spamNotice}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {/* Theme Toggle Quick Chip */}
              <button
                type="button"
                disabled={loading || cooldown > 0}
                onClick={() => {
                  const newTheme = toggleTheme();
                  requestAnimationFrame(() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        role: 'assistant',
                        text: newTheme === 'dark'
                          ? "Switched to **Dark Mode** (AMOLED `#000000`)."
                          : "Switched to **Light Mode**."
                      }
                    ]);
                  });
                }}
                className="shrink-0 text-[10px] font-mono font-medium px-2.5 py-1 rounded-md border border-primary-custom/40 bg-primary-custom/15 text-primary-custom hover:bg-primary-custom/25 shadow-xs active:scale-95 disabled:opacity-40 cursor-pointer transition-all flex items-center gap-1"
                title="Toggle Theme"
              >
                <span>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
              </button>

              {['Skills', 'Projects', 'Experience', 'Education', 'Contact'].map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleQuickPrompt(q)}
                  className="shrink-0 text-[10px] font-mono font-normal px-2.5 py-1 rounded-md border border-border-custom/80 bg-card-custom/80 text-muted-foreground-custom hover:text-foreground-custom hover:border-primary-custom/40 shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form with Translucent Glass */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border-custom/60 flex flex-col gap-1.5 bg-muted-custom/25 backdrop-blur-md"
          >
            {spamNotice && (
              <div className="text-[10px] font-mono text-rose-500 px-1 truncate flex items-center gap-1.5 animate-pulse">
                <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span>{spamNotice}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                maxLength={250}
                value={input}
                disabled={loading || cooldown > 0}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  cooldown > 0
                    ? `Cooldown active (${cooldown}s)...`
                    : "Type keyword (e.g. dark mode, skills)..."
                }
                className="flex-1 bg-background-custom/80 border border-border-custom rounded-lg px-3 py-1.5 text-xs text-foreground-custom placeholder:text-muted-foreground-custom font-mono focus:outline-none focus:border-primary-custom focus:ring-1 focus:ring-primary-custom shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || cooldown > 0}
                aria-label="Send query"
                className="p-2 rounded-lg bg-primary-custom text-white border border-primary-custom hover:bg-primary-custom/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
