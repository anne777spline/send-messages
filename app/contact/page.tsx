'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Globe, CheckCircle2, Send, Loader2, AlertCircle } from 'lucide-react';

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

      {/* Page Content Container matching Hero 2-column layout */}
      <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start lg:items-center relative z-10 flex-1 my-auto">
        
        {/* Left Column: Titles, Descriptions & Discrete Contact Info */}
        <div className="lg:col-span-6 space-y-6 md:space-y-8">
          <div className="space-y-3">
            <h1 className="font-pagani text-4xl sm:text-5xl lg:text-6xl font-light text-gray-950 leading-[1.12] tracking-tight">
              Get in Touch <br />
              <span className="font-serif-accent italic font-normal text-gray-950 text-[1.08em]">With Our Team</span> <br />
              <span className="font-normal text-gray-900">Six Tenet LLC</span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed">
            Have questions about Broker Assistant, bulk plans for your brokerage, or custom enterprise setups? We are here to help your team close deals faster.
          </p>

          {/* Discrete Contact Details */}
          <div className="pt-4 border-t border-gray-200/80 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Direct Inquiries</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-700">
              <a
                href="mailto:info@sixtenet.com"
                className="inline-flex items-center gap-2.5 hover:text-black transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center text-gray-700 group-hover:text-black group-hover:border-gray-300 transition">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">info@sixtenet.com</span>
              </a>

              <a
                href="https://sixtenet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 hover:text-black transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-gray-200/80 flex items-center justify-center text-gray-700 group-hover:text-black group-hover:border-gray-300 transition">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">sixtenet.com</span>
              </a>

              <span className="text-xs text-gray-500 pl-2 border-l border-gray-200">
                Replies within 24 business hours
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Message Form with Organic Branding Blobs behind */}
        <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:ml-auto relative flex justify-center items-center py-2 sm:py-4">
          {/* Top-Right Green Blob #89c900 */}
          <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-60 h-60 sm:w-72 sm:h-72 bg-[#89c900] rounded-[60px] transform rotate-12 opacity-95 shadow-lg pointer-events-none transition-transform duration-700 hover:scale-105 z-0" />

          {/* Bottom-Left Lime/Yellow Blob #d8e454 */}
          <div className="absolute -bottom-3 -left-3 sm:-bottom-5 sm:-left-5 w-60 h-60 sm:w-72 sm:h-72 bg-[#d8e454] rounded-[60px] transform -rotate-12 opacity-95 shadow-lg pointer-events-none transition-transform duration-700 hover:scale-105 z-0" />

          {/* Contact Message Form Container */}
          <div className="w-full bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-[32px] p-7 sm:p-9 shadow-2xl relative z-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Send us a direct message</h2>
              <p className="text-sm text-gray-600 mt-1">
                Write your inquiry below and we will get back to you within 24 business hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full sm:w-auto bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-medium px-8 py-3.5 rounded-full text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
