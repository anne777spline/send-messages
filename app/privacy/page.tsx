'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-gray-500 font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">1. Introduction</h2>
              <p>
                Welcome to Broker Assistant, a product developed and operated by Six Tenet LLC. As a Six Tenet LLC product, Broker Assistant is governed by our company&apos;s overarching policies. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">2. The Data We Collect About You</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Technical Data, Usage Data, and Marketing and Communications Data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">3. How We Use Your Personal Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you;</li>
                <li>Where it is necessary for our legitimate interests;</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at{' '}
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
