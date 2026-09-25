import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, MessageSquare, ShieldCheck, CheckCircle2, ArrowRight, Building2, Zap, Layers } from 'lucide-react';

export const metadata = {
  title: 'Overview | Broker Assistant',
  description: 'Overview of Broker Assistant platform for real estate brokers',
};

export default function OverviewPage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#fce7f3]/70 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 flex-1 space-y-20">

        {/* Page Hero Header */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
            Built Specifically For Modern Real Estate Brokers
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Broker Assistant replaces manual spreadsheet dialing with a centralized contact directory, instant building portfolio search, and automated WhatsApp delivery directly from your own phone number.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/?login=true"
              className="bg-gray-900 hover:bg-black text-white font-medium px-8 py-3.5 rounded-full text-sm flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <span>Access Broker Portal</span>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </Link>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4 group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold border border-blue-100 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Instant Building Search</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Filter across 60,000+ property records by building name, owner name, unit number, or room count in milliseconds.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4 group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold border border-emerald-100 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Direct WhatsApp Outreach</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Send personalized outreach campaigns to verified property owners directly through your linked WhatsApp account.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4 group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold border border-purple-100 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">100% Private Database</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your uploaded listings and owner contacts are isolated with row-level encryption. Only your brokerage account can view or access them.
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
