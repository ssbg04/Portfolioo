import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I am Cris Charles's AI assistant. Ask me anything about Cris's projects, experience, skills, or background!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Map previous history for context
      const chatHistory = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: "Sorry, I encountered an error. Please try again." }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "Network error. Please check your connection and try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl glass-card rounded-[32px] border border-border/20 shadow-2xl overflow-hidden flex flex-col h-[600px] relative">
      {/* Accent gradients */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-custom to-secondary-custom" />
      
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-border/10 flex items-center gap-3 bg-muted-custom/10">
        <div className="relative flex">
          <span className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-custom to-secondary-custom flex items-center justify-center text-white font-bold text-sm shadow-md">
            AI
          </span>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background-custom" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground-custom font-heading">
            Cris's Portfolio Assistant
          </h3>
          <p className="text-[10px] text-muted-foreground-custom font-semibold">
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary-custom text-primary-foreground rounded-br-none shadow-md'
                    : 'glass-card border border-border/15 text-foreground-custom/95 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex w-full justify-start">
            <div className="glass-card border border-border/15 px-5 py-4 rounded-2xl rounded-bl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-custom animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-primary-custom animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-primary-custom animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Form Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-border/10 flex items-center gap-2 bg-muted-custom/10"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about projects, work history, skills..."
          disabled={loading}
          className="flex-1 px-4.5 py-3.5 rounded-2xl bg-background-custom border border-border/15 focus:border-primary-custom/40 outline-none text-sm text-foreground-custom placeholder-muted-foreground-custom/50 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3.5 rounded-2xl bg-primary-custom hover:bg-primary-custom-hover text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          aria-label="Send message"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
