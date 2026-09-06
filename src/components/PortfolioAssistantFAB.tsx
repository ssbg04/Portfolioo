import React, { useState, useRef, useEffect } from 'react';
import haptic from '../lib/haptics';

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
      text: "👋 Hello! I'm Cris's Portfolio Assistant.\n\nAsk me anything about Cris's projects, technical skills, certifications, work experience, or contact information."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [spamNotice, setSpamNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setSpamNotice("⚠️ Slow down! Too many rapid requests (8s pause).");
      setTimeout(() => setSpamNotice(null), 3500);
      return;
    }
    recentSubmits.current.push(now);

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
      <div className="fixed bottom-6 right-5 sm:right-7 z-40">
        <button
          onClick={() => {
            haptic.tap();
            setIsOpen(!isOpen);
          }}
          aria-label={isOpen ? "Close Portfolio Assistant" : "Open Portfolio Assistant"}
          aria-expanded={isOpen}
          className="relative group p-3.5 rounded-2xl bg-primary-custom text-white shadow-xl hover:bg-primary-custom/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-white/20"
        >
          {/* Animated ping circle */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background-custom animate-pulse" />
          )}

          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.154-.63 4.887 4.887 0 0 0 1.28-3.138A7.834 7.834 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              <span className="hidden sm:inline text-xs font-bold font-heading pr-0.5">
                Portfolio Assistant
              </span>
            </>
          )}
        </button>
      </div>

      {/* ─── Popup Assistant Modal / Drawer ─── */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-7 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[520px] rounded-3xl bg-white dark:bg-[#11131c] border border-border-custom shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: 'bentoReveal 0.25s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border-custom bg-muted-custom/30 dark:bg-zinc-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-custom/10 text-primary-custom border border-primary-custom/20 flex items-center justify-center font-bold text-xs">
                PA
              </div>
              <div>
                <h3 className="text-xs font-bold font-heading text-foreground-custom">
                  Portfolio Assistant
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground-custom">
                  Fast Keyword Knowledge Search
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                haptic.tap();
                setIsOpen(false);
              }}
              aria-label="Close Assistant"
              className="p-1.5 rounded-lg text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs leading-relaxed">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[88%] ${
                      isUser
                        ? 'bg-primary-custom text-white rounded-br-xs shadow-xs'
                        : 'bg-foreground-custom/[0.04] dark:bg-zinc-800/70 text-foreground-custom rounded-bl-xs border border-border-custom/80'
                    }`}
                  >
                    {renderMessageContent(msg.text, isUser)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-foreground-custom/[0.04] border border-border-custom w-fit text-xs text-muted-foreground-custom">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-bounce delay-200" />
                <span className="text-[10px] font-mono ml-1">Searching records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips with Anti-Spam Cooldown */}
          <div className="px-3 py-2 border-t border-border-custom/50 bg-foreground-custom/[0.02] flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[9px] font-mono text-muted-foreground-custom uppercase tracking-wider">
                Quick Topics
              </span>
              {cooldown > 0 ? (
                <span className="text-[9px] font-mono font-semibold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Cooldown ({cooldown}s)
                </span>
              ) : spamNotice ? (
                <span className="text-[9px] font-mono text-rose-500 dark:text-rose-400 font-semibold truncate max-w-[200px]">
                  {spamNotice}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['Skills', 'Projects', 'Experience', 'Education', 'Contact'].map((q) => (
                <button
                  key={q}
                  disabled={loading || cooldown > 0}
                  onClick={() => handleQuickPrompt(q)}
                  className="shrink-0 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-border-custom text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form with Anti-Spam & Copy-Paste Throttling */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border-custom flex flex-col gap-1.5 bg-white dark:bg-[#11131c]"
          >
            {spamNotice && (
              <div className="text-[10px] font-mono font-medium text-rose-500 dark:text-rose-400 px-1 truncate flex items-center gap-1 animate-pulse">
                <span>⚠️</span> {spamNotice}
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
                    : "Type a keyword (e.g. skills, projects)..."
                }
                className="flex-1 bg-foreground-custom/5 dark:bg-zinc-900 border border-border-custom rounded-xl px-3 py-2 text-xs text-foreground-custom placeholder:text-muted-foreground-custom focus:outline-none focus:ring-1 focus:ring-primary-custom disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || cooldown > 0}
                aria-label="Send query"
                className="p-2 rounded-xl bg-primary-custom text-white hover:bg-primary-custom/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
