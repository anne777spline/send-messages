'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="w-full max-w-4xl mx-auto px-6 py-12 md:py-16 relative z-10 flex-1 space-y-8">
        
        {/* Content Container */}
        <article className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 md:p-10 shadow-xl space-y-8 text-gray-800">
          <div className="space-y-2 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
            <p className="text-xs text-gray-500 font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Broker Assistant, a product owned and operated by Six Tenet LLC, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">2. Use of Service</h2>
              <p>
                Broker Assistant provides property contact directory search and messaging integration services. You agree to use the service only for lawful real estate brokerage outreach and in compliance with all applicable communication and privacy laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">3. Account Responsibility</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">4. Intellectual Property</h2>
              <p>
                All content, features, and functionality of Broker Assistant are owned by Six Tenet LLC and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">5. Contact Us</h2>
              <p>
                For questions regarding these Terms of Service, please contact us at{' '}
                <a
                  href="mailto:legal@sixtenet.com"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  legal@sixtenet.com
                </a>.
              </p>
            </section>
          </div>
        </article>
      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
