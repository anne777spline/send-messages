import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, ShieldCheck, Zap, Globe } from 'lucide-react';

export const metadata = {
  title: 'About | Broker Assistant',
  description: 'About Broker Assistant by Six Tenet LLC',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-16 relative z-10 flex-1 space-y-8">
        
        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm inline-block">
            Company &amp; Governance
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 tracking-tight">About Broker Assistant</h1>
          <p className="text-sm text-gray-500 font-medium">Developed &amp; Operated by Six Tenet LLC</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 md:p-10 shadow-xl space-y-8 text-gray-800">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Broker Assistant was engineered to solve a fundamental challenge faced by real estate professionals: reaching verified property landlords directly, swiftly, and without friction. We build specialized software that enables brokers to organize large building portfolios, filter contact data with precision, and initiate outreach campaigns seamlessly.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Tenant Data Isolation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every brokerage tenant operates within an isolated database sandbox protected by strict Row-Level Security (RLS).
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">High-Velocity Operations</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Perform instant queries across 60,000+ property records and dispatch targeted WhatsApp campaigns in seconds.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Governance &amp; Corporate Standards</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              As a product developed and operated by Six Tenet LLC, Broker Assistant adheres strictly to international data protection principles, corporate compliance standards, and responsible communication policies. We do not sell user data, harvest contact lists, or share tenant databases with third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Corporate Inquiries</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              For enterprise partnerships, custom dataset onboarding, or compliance questions, reach our team at{' '}
              <a
                href="mailto:legal@sixtenet.com"
                className="text-blue-600 hover:underline font-semibold"
              >
                legal@sixtenet.com
              </a>{' '}
              or visit{' '}
              <a
                href="https://sixtenet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold"
              >
                Six Tenet LLC
              </a>.
            </p>
          </section>
        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
