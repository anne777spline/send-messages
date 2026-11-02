'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Globe, MapPin, CheckCircle2, Send, Headset, Loader2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field for spam prevention
  const [mountedAt, setMountedAt] = useState<number>(Date.now());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMountedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const elapsedMs = Date.now() - mountedAt;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          website, // honeypot
          elapsedMs,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Hubo un error al procesar el mensaje');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setWebsite('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'No se pudo enviar el mensaje. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#fce7f3]/70 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-10 md:pt-16 pb-12 relative z-10 flex-1 my-auto space-y-10 md:space-y-12">
        {/* Page Hero Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-pagani text-4xl sm:text-5xl lg:text-6xl font-light text-gray-950 leading-[1.1] tracking-tight">
              Get in Touch <br />
              <span className="font-serif-accent italic font-normal text-gray-950 text-[1.08em]">With Our Team</span> <br />
              <span className="font-normal text-gray-900">Six Tenet LLC</span>
            </h1>
          </div>
          <div className="lg:col-span-5 pb-1">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal border-l-2 border-gray-950/20 pl-5">
              Have questions about Broker Assistant, bulk plans for your brokerage, or custom enterprise setups? We are here to help your team close deals faster.
            </p>
          </div>
        </div>

        {/* Content Section: 2 Columns (Contact Form + Direct Info Cards Swapped) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Message Box */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-2">Send us a direct message</h2>
            <p className="text-sm text-gray-600 mb-6">
              Write your inquiry below and we will get back to you within 24 business hours at your email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot anti-spam (hidden from users, targeted by bots) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website-field">Website</label>
                <input
                  id="website-field"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Vance"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. michael@brokerage.com"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  disabled={isSubmitting}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your team size, properties, or any questions you have..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white resize-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-medium px-8 py-4 rounded-full text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <span>Send message</span>
                    <Send className="w-4 h-4 text-gray-300" />
                  </>
                )}
              </button>

              {status === 'success' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Your message has been sent successfully. We will reply within 24 business hours!</span>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Direct Contact & Info Cards (Styled with Landing Branding) */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4 sm:py-6">
            {/* Green Organic Blob #89c900 */}
            <div className="absolute -top-4 -right-2 sm:right-2 w-64 h-64 sm:w-72 sm:h-72 bg-[#89c900] rounded-[60px] transform rotate-12 opacity-95 shadow-lg pointer-events-none transition-transform duration-700 hover:scale-105" />

            {/* Yellow Organic Blob #d8e454 */}
            <div className="absolute -bottom-4 -left-2 sm:left-2 w-64 h-64 sm:w-72 sm:h-72 bg-[#d8e454] rounded-[60px] transform -rotate-12 opacity-95 shadow-lg pointer-events-none transition-transform duration-700 hover:scale-105" />

            {/* Black Card (#000000) Overlapping Shapes */}
            <div className="w-full max-w-[400px] bg-black text-white rounded-[36px] p-6 sm:p-7 shadow-2xl relative z-10 border border-gray-800 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3.5 border-b border-gray-800 pb-4">
                <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shrink-0">
                  <Headset className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Broker Assistant</h2>
                  <p className="text-[11px] text-gray-400">Official Product Support by Six Tenet LLC</p>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="space-y-3">
                <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Direct Channels</p>

                {/* Email White Card */}
                <a
                  href="mailto:info@sixtenet.com"
                  className="bg-white text-gray-900 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 group transition-transform hover:-translate-y-0.5 cursor-pointer block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Direct Email</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">info@sixtenet.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full shrink-0">24h reply</span>
                </a>

                {/* Website White Card */}
                <a
                  href="https://sixtenet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-gray-900 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 group transition-transform hover:-translate-y-0.5 cursor-pointer block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#89c900]/15 text-gray-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Globe className="w-4 h-4 text-[#89c900]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Website</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#89c900] transition truncate">sixtenet.com</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#89c900]/15 text-gray-900 font-semibold px-2 py-0.5 rounded-full shrink-0">Official</span>
                </a>
              </div>

              {/* Security & Data note badge */}
              <div className="p-3 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between text-xs text-gray-300">
                <span className="text-[11px] text-gray-400">Response time</span>
                <span className="text-[11px] font-semibold text-white">&lt; 24 business hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
