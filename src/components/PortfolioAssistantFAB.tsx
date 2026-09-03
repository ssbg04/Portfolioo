import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function PortfolioAssistantFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "👋 **Hello! I'm Cris's Portfolio Assistant.**\n\nAsk me anything about Cris's projects, technical skills, certifications, work experience, or contact information."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: "Unable to retrieve records right now. Please try searching another keyword or contact Cris directly." }
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
          onClick={() => setIsOpen(!isOpen)}
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
              onClick={() => setIsOpen(false)}
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
                    className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                      isUser
                        ? 'bg-primary-custom text-white rounded-br-xs shadow-xs'
                        : 'bg-foreground-custom/[0.04] dark:bg-zinc-800/70 text-foreground-custom rounded-bl-xs border border-border-custom/80'
                    }`}
                  >
                    {msg.text}
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

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 border-t border-border-custom/50 bg-foreground-custom/[0.02] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['Skills', 'Projects', 'Experience', 'Education', 'Contact'].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickPrompt(q)}
                className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-lg border border-border-custom text-muted-foreground-custom hover:text-foreground-custom hover:bg-foreground-custom/5 cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border-custom flex items-center gap-2 bg-white dark:bg-[#11131c]"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a keyword (e.g. skills, projects)..."
              className="flex-1 bg-foreground-custom/5 dark:bg-zinc-900 border border-border-custom rounded-xl px-3 py-2 text-xs text-foreground-custom placeholder:text-muted-foreground-custom focus:outline-none focus:ring-1 focus:ring-primary-custom"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send query"
              className="p-2 rounded-xl bg-primary-custom text-white hover:bg-primary-custom/90 disabled:opacity-40 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
