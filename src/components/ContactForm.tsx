import React, { useState } from 'react';
import type { SocialLink } from '../lib/data';

interface ContactFormProps {
  socialLinks?: SocialLink[];
  contactHeading?: string;
  contactSubtitle?: string;
  email?: string;
  sectionTag?: string;
}

export default function ContactForm({
  socialLinks = [],
  contactHeading = "let's talk.",
  contactSubtitle = "Whether you have a software engineering opportunity, a technical collaboration, or an architecture inquiry, my inbox is open.",
  email = "crischarlesgarcia345@gmail.com",
  sectionTag = "06 — contact"
}: ContactFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', _hp_website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [dailySentCount, setDailySentCount] = useState(0);
  const [isDailyLimitReached, setIsDailyLimitReached] = useState(false);

  const refreshRateLimitState = () => {
    if (typeof window === 'undefined') return;

    let storedId = localStorage.getItem('portfolio_device_id');
    if (!storedId) {
      storedId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('portfolio_device_id', storedId);
    }
    setDeviceId(storedId);

    try {
      const storedLog = localStorage.getItem('portfolio_contact_log');
      const timestamps: number[] = storedLog ? JSON.parse(storedLog) : [];
      const now = Date.now();
      const valid = timestamps.filter(t => typeof t === 'number' && now - t < 24 * 60 * 60 * 1000);
      localStorage.setItem('portfolio_contact_log', JSON.stringify(valid));
      setDailySentCount(valid.length);
      setIsDailyLimitReached(valid.length >= 5);
    } catch {
      setDailySentCount(0);
      setIsDailyLimitReached(false);
    }
  };

  React.useEffect(() => {
    refreshRateLimitState();
  }, []);

  const linksToRender = (socialLinks.length > 0
    ? socialLinks.filter(l => l.url && l.url !== '#' && !l.url.includes('/N/A'))
    : [
        { platform: 'Email', url: `mailto:${email}`, icon: 'mail', order: 1 },
        { platform: 'GitHub', url: 'https://github.com/ssbg04', icon: 'github', order: 2 },
        { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/cris-charles-garcia/', icon: 'linkedin', order: 3 },
      ]
  ).filter(l => !['facebook', 'tiktok'].includes(l.platform.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData._hp_website) return;
    if (isDailyLimitReached) return;

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deviceId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch message.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '', _hp_website: '' });

      // Record timestamp
      try {
        const storedLog = localStorage.getItem('portfolio_contact_log');
        const timestamps: number[] = storedLog ? JSON.parse(storedLog) : [];
        timestamps.push(Date.now());
        localStorage.setItem('portfolio_contact_log', JSON.stringify(timestamps));
        refreshRateLimitState();
      } catch (e) {
        console.error('Failed to update contact log:', e);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 border-b border-border-custom bryl-entrance">
      <div className="max-w-[56rem] mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="pb-4 mb-6 sm:mb-8 border-b border-border-custom">
          <span className="section-marker mb-1 block">
            {sectionTag.toLowerCase()}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-foreground-custom lowercase">
            direct outreach
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Context & Direct Channels */}
          <div className="md:col-span-5 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-display text-xl sm:text-2xl text-foreground-custom lowercase mb-3">
                {contactHeading.toLowerCase()}
              </h3>
              <p className="text-muted-foreground-custom text-[14px] leading-relaxed mb-6 font-normal">
                {contactSubtitle}
              </p>

              <div className="flex flex-col gap-2 pt-2 border-t border-border-custom">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle-custom mb-1">
                  direct channels:
                </span>
                <div className="flex flex-col gap-2">
                  <a
                    href={`mailto:${email}`}
                    className="text-xs font-mono text-foreground-custom hover:underline transition-all inline-flex items-center gap-1.5"
                  >
                    <span>{email}</span>
                    <span className="text-[10px] opacity-60">↗</span>
                  </a>
                  {linksToRender.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-xs font-mono text-muted-foreground-custom hover:text-foreground-custom transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{link.platform.toLowerCase()}</span>
                      <span className="text-[10px] opacity-60">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-border-custom">
              <span className="text-[10px] font-mono text-subtle-custom block">
                laguna, philippines · utc+8
              </span>
            </div>
          </div>

          {/* Right Column: Form (bryl-minimal input styling) */}
          <div className="md:col-span-7">
            <div className="bryl-card p-6 sm:p-7">
              {status === 'success' ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <span className="chip-inverted text-[10px] mb-4">
                    message dispatched
                  </span>
                  <h4 className="font-display text-xl text-foreground-custom lowercase mb-2">
                    received.
                  </h4>
                  <p className="text-xs text-muted-foreground-custom max-w-xs mb-6 font-mono">
                    Thanks for reaching out. I will respond to your note within 24 to 48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="bryl-btn-secondary text-xs cursor-pointer"
                  >
                    send another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Honeypot */}
                  <div className="opacity-0 absolute -z-50 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                    <input
                      type="text"
                      name="_hp_website"
                      id="_hp_website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData._hp_website}
                      onChange={handleChange}
                    />
                  </div>

                  {(status === 'error' || isDailyLimitReached) && (
                    <div className="p-3 rounded-md bg-elevated-custom border border-border-strong text-foreground-custom text-xs font-mono">
                      {errorMessage || 'Notice: Daily message limit reached for this session.'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="name" className="micro-label">
                        name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="your name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={status === 'sending'}
                        className="bryl-input"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="micro-label">
                        email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={status === 'sending'}
                        className="bryl-input"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="micro-label">
                      message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      required
                      placeholder="write your message..."
                      value={formData.message}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                      className="bryl-input resize-y min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-mono text-subtle-custom">
                      {isDailyLimitReached ? 'limit reached' : `${5 - dailySentCount} remaining today`}
                    </span>

                    <button
                      type="submit"
                      disabled={status === 'sending' || isDailyLimitReached}
                      className="bryl-btn-primary cursor-pointer disabled:opacity-50"
                    >
                      <span>{status === 'sending' ? 'dispatching...' : 'send message'}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
