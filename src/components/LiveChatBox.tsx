import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'cris';
  text: string;
  time: number;
}

export default function LiveChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize or retrieve visitor session ID
  useEffect(() => {
    let id = sessionStorage.getItem('cris_live_chat_session');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('cris_live_chat_session', id);
    }
    setSessionId(id);

    // Initial greeting message
    setMessages([
      {
        id: 'welcome',
        sender: 'cris',
        text: "Hey there! 👋 Welcome to my live desk. Leave a quick message here or ask about projects and availability—I'll receive it directly on my phone!",
        time: Date.now(),
      },
    ]);
  }, []);

  // Poll for replies while chat is active
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      fetch(`/api/live-chat?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res?.messages && res.messages.length > 0) {
            setMessages((prev) => {
              const welcome = prev.find((m) => m.id === 'welcome');
              const combined = welcome ? [welcome, ...res.messages] : res.messages;
              return combined;
            });
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !sessionId) return;

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic user bubble
    const tempMsg: ChatMessage = {
      id: 'opt_' + Date.now(),
      sender: 'user',
      text: userText,
      time: Date.now(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch('/api/live-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userText,
        }),
      });
    } catch (err) {
      console.error('Failed to send live chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full bento-card p-4 sm:p-6 flex flex-col h-full min-h-[420px] max-h-[560px] border border-border-custom bg-card-custom rounded-2xl shadow-sm">
      {/* ── Chat Header ── */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border-custom shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary-custom/10 border border-primary-custom/30 flex items-center justify-center font-bold text-xs text-primary-custom font-heading">
              CG
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card-custom" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-heading text-foreground-custom flex items-center gap-1.5 leading-tight">
              <span>Cris Charles</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                DIRECT
              </span>
            </h4>
            <p className="text-[11px] font-mono text-muted-foreground-custom">
              Instant mobile push • Replies within minutes
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-muted-foreground-custom px-2 py-1 rounded-md bg-foreground-custom/5 border border-border-custom">
          TELEGRAM LINKED
        </span>
      </div>

      {/* ── Messages Feed ── */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-3 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-foreground-custom text-background-custom font-medium rounded-br-xs'
                    : 'bg-elevated-custom text-foreground-custom border border-border-custom rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] font-mono text-muted-foreground-custom mt-1 px-1">
                {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Chat Input Form ── */}
      <form onSubmit={handleSend} className="relative mt-auto shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a direct message to Cris..."
          disabled={isSending}
          className="flex-1 bg-background-custom/80 border border-border-custom rounded-xl px-3.5 py-2.5 text-xs text-foreground-custom placeholder:text-muted-foreground-custom focus:outline-none focus:border-primary-custom focus:ring-1 focus:ring-primary-custom transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-4 py-2.5 rounded-xl bg-primary-custom text-white text-xs font-semibold hover:bg-primary-custom/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Send</span>
          <span className="text-xs">→</span>
        </button>
      </form>
    </div>
  );
}
