import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import type { SocialLink } from '../lib/data';

const getContactIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    );
  }
  if (p.includes('facebook')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (p.includes('linkedin')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.09-1.03-1.87-1.09-2.93-3.16-2.61-5.25.38-2.52 2.5-4.46 5.04-4.46.73 0 1.43.16 2.07.46.06.03.11.05.16.08v4.18c-1.38-.24-2.81-.19-4.16.14-1.12.28-2.12 1.05-2.67 2.06-.55 1.01-.58 2.22-.09 3.25.48 1.01 1.41 1.72 2.49 2.03 1.1.32 2.27.32 3.37.01.69-.2 1.34-.55 1.87-.99.53-.44.97-.99 1.25-1.61.28-.62.43-1.28.46-1.95.06-2.69.02-5.38.02-8.07z"/>
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
};

interface ContactFormProps {
  socialLinks?: SocialLink[];
  contactHeading?: string;
  contactSubtitle?: string;
  email?: string;
}

export default function ContactForm({
  socialLinks = [],
  contactHeading = "Let's create something amazing.",
  contactSubtitle = "Whether you have a question, a project idea, or just want to say hi, my inbox is always open. I'll try my best to get back to you!",
  email = "crischarlesgarcia345@gmail.com"
}: ContactFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const linksToRender = socialLinks.length > 0
    ? socialLinks.filter(l => l.url && l.url !== '#' && !l.url.includes('/N/A'))
    : [
        { platform: 'Email', url: `mailto:${email}`, icon: 'mail', order: 1 },
        { platform: 'GitHub', url: 'https://github.com/ssbg04', icon: 'github', order: 2 },
        { platform: 'Facebook', url: 'https://www.facebook.com/kristyarls345/', icon: 'facebook', order: 3 },
        { platform: 'TikTok', url: 'https://www.tiktok.com/@sisibigi', icon: 'tiktok', order: 4 }
      ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start">
          
          {/* Left Side: Info */}
          <div className="lg:col-span-2 flex flex-col justify-center h-full">
            <ScrollReveal variant="fade-right">
              <h2 className="text-4xl md:text-5xl font-black font-heading mb-6 text-glow bg-clip-text text-transparent bg-gradient-to-r from-foreground-custom to-primary-custom/80">
                {contactHeading}
              </h2>
              <p className="text-muted-foreground-custom text-base md:text-lg mb-8 leading-relaxed">
                {contactSubtitle}
              </p>
              
              <div className="flex flex-col gap-4">
                <p className="text-sm font-bold uppercase tracking-widest text-foreground-custom/50 mb-2">Connect with me</p>
                <div className="flex flex-wrap gap-3">
                  {linksToRender.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground-custom/5 border border-border-hover/10 text-foreground-custom/70 hover:text-primary-custom hover:bg-primary-custom/10 hover:scale-105 active:scale-95 transition-all shadow-sm"
                      aria-label={link.platform}
                      title={link.platform}
                    >
                      {getContactIcon(link.platform)}
                    </a>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-3">
            <ScrollReveal variant="fade-left" delay={150}>
              <div className="glass-card p-8 md:p-10 rounded-3xl border border-border-hover/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="text-center py-12 flex flex-col items-center justify-center min-h-[400px]"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-black font-heading text-foreground-custom mb-4">
                        Message Received!
                      </h3>
                      <p className="text-base text-muted-foreground-custom leading-relaxed max-w-sm mb-8">
                        Thanks for reaching out! I'm thrilled to hear from you and will respond as soon as I can.
                      </p>
                      <button
                        onClick={() => setStatus('idle')}
                        className="px-8 py-3.5 rounded-full bg-foreground-custom/5 hover:bg-foreground-custom/10 text-foreground-custom text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Send Another
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="flex flex-col gap-8"
                    >
                      {status === 'error' && (
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium">
                          {errorMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Floating Name */}
                        <div className="relative z-0 w-full group">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            className="block py-3 px-0 w-full text-base text-foreground-custom bg-transparent border-0 border-b-2 border-border-hover/30 appearance-none focus:outline-none focus:ring-0 focus:border-primary-custom peer transition-colors"
                            placeholder=" "
                            required
                            value={formData.name}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                          />
                          <label
                            htmlFor="name"
                            className="peer-focus:font-medium absolute text-sm text-muted-foreground-custom duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-custom peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Full Name
                          </label>
                        </div>

                        {/* Floating Email */}
                        <div className="relative z-0 w-full group">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="block py-3 px-0 w-full text-base text-foreground-custom bg-transparent border-0 border-b-2 border-border-hover/30 appearance-none focus:outline-none focus:ring-0 focus:border-primary-custom peer transition-colors"
                            placeholder=" "
                            required
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                          />
                          <label
                            htmlFor="email"
                            className="peer-focus:font-medium absolute text-sm text-muted-foreground-custom duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-custom peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Email Address
                          </label>
                        </div>
                      </div>

                      {/* Floating Message */}
                      <div className="relative z-0 w-full group mt-2">
                        <textarea
                          name="message"
                          id="message"
                          rows={4}
                          className="block py-3 px-0 w-full text-base text-foreground-custom bg-transparent border-0 border-b-2 border-border-hover/30 appearance-none focus:outline-none focus:ring-0 focus:border-primary-custom peer transition-colors resize-none"
                          placeholder=" "
                          required
                          value={formData.message}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                        />
                        <label
                          htmlFor="message"
                          className="peer-focus:font-medium absolute text-sm text-muted-foreground-custom duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-custom peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                        >
                          How can I help you?
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="group relative w-full sm:w-auto self-end mt-4 px-8 py-4 rounded-full bg-primary-custom text-white font-bold text-sm shadow-xl shadow-primary-custom/20 hover:shadow-primary-custom/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {status === 'sending' ? 'Sending...' : 'Send Message'}
                          {status !== 'sending' && (
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                            </svg>
                          )}
                          {status === 'sending' && (
                            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          )}
                        </span>
                        {/* Hover flare effect */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
