'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Globe, MapPin, CheckCircle2, Send, Building2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepara enlace mailto directo a info@sixtenet.com
    const subject = encodeURIComponent(`Broker Assistant Inquiry from ${name || 'Broker'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:info@sixtenet.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
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
              <span className="font-serif-accent italic font-normal text-black text-[1.08em]">With Our Team</span> <br />
              <span className="font-normal text-gray-900">Six Tenet LLC</span>
            </h1>
          </div>
          <div className="lg:col-span-5 pb-1">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal border-l-2 border-gray-950/20 pl-5">
              Have questions about Broker Assistant, bulk plans for your brokerage, or custom enterprise setups? We are here to help your team close deals faster.
            </p>
          </div>
        </div>

        {/* Content Section: 2 Columns (Direct Info + Contact Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Contact & Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-950 tracking-tight">Six Tenet LLC</h2>
                  <p className="text-xs text-gray-500">Official Product Support &amp; Partnerships</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <a
                  href="mailto:info@sixtenet.com"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/90 border border-gray-200/70 transition group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct Email</div>
                    <div className="text-base font-bold text-gray-950 group-hover:text-blue-600 transition">info@sixtenet.com</div>
                    <div className="text-xs text-gray-500 mt-0.5">Quick responses within 24 business hours</div>
                  </div>
                </a>

                <a
                  href="https://sixtenet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/90 border border-gray-200/70 transition group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Website</div>
                    <div className="text-base font-bold text-gray-950 group-hover:text-emerald-700 transition">sixtenet.com</div>
                    <div className="text-xs text-gray-500 mt-0.5">Learn more about Six Tenet technologies</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-xs text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Dedicated onboarding available for real estate agencies and broker networks worldwide.</span>
            </div>
          </div>

          {/* Right Column: Contact Message Box */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight mb-2">Send us a direct message</h2>
            <p className="text-sm text-gray-600 mb-6">
              Write your inquiry below and click send to open your email client pre-filled to <strong className="text-gray-900">info@sixtenet.com</strong>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Michael Vance"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. michael@brokerage.com"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your team size, properties, or any questions you have..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm outline-none transition bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white font-medium px-8 py-4 rounded-full text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Send to info@sixtenet.com</span>
                <Send className="w-4 h-4 text-gray-300" />
              </button>

              {submitted && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Opening your email client to send to info@sixtenet.com. Thank you!</span>
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
