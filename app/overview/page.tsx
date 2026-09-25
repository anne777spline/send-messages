'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Upload, MessageSquare, ShieldCheck, CheckCircle2, ArrowRight, Building2, Zap, Layers } from 'lucide-react';

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
      <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 flex-1 my-auto">

        {/* Left Column: Headline & Action */}
        <div className="lg:col-span-6 space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
            Built Specifically For Modern Real Estate Brokers
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed">
            Broker Assistant allows real estate brokers to upload their landlord contact databases via CSV, organize building portfolios, and send high-volume personalized WhatsApp campaigns directly from their own phone number.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/?login=true"
              className="bg-gray-900 hover:bg-black text-white font-medium px-8 py-4 rounded-full text-base flex items-center gap-2 transition shadow-xl hover:shadow-2xl cursor-pointer"
            >
              <span>Access Broker Portal</span>
              <ArrowRight className="w-5 h-5 text-gray-300" />
            </Link>
          </div>
        </div>

        {/* Right Column: Organic Shapes & Black/White Cards (Matches Landing Branding) */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center py-6 min-h-[440px]">

          {/* Top-Right Organic Shape: Green Blob #89c900 */}
          <div className="absolute top-0 right-2 sm:right-6 w-64 h-64 sm:w-80 sm:h-80 bg-[#89c900] rounded-[70px] transform rotate-12 opacity-95 shadow-xl pointer-events-none transition-transform duration-700 hover:scale-105 z-0" />

          {/* Bottom-Right Organic Shape: Yellow Blob #d8e454 */}
          <div className="absolute -bottom-4 right-8 sm:right-16 w-64 h-64 sm:w-80 sm:h-80 bg-[#d8e454] rounded-[70px] transform -rotate-12 opacity-95 shadow-xl pointer-events-none transition-transform duration-700 hover:scale-105 z-0" />

          {/* Cards Stack Container */}
          <div className="relative z-10 w-full max-w-[440px] space-y-5 my-auto">
            {/* Top Card: Black (#000000) matching Landing Page Card */}
            <div className="w-full bg-black text-white rounded-[32px] p-6 sm:p-7 shadow-2xl border border-gray-800 space-y-4 transform hover:-translate-y-1 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                  <Upload className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Bulk Portfolio CSV Import</h2>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Upload your landlord lists and building property records in bulk via CSV spreadsheets. Your contacts are parsed automatically and stored securely in your private tenant database.
              </p>
              <div className="bg-gray-900/90 border border-gray-800 p-3 rounded-xl font-mono text-[11px] text-gray-400 flex items-center justify-between">
                <span>owner_name, phone, building</span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold px-2 py-0.5 rounded">Auto-Parsed</span>
              </div>
            </div>

            {/* Bottom Card: White (#ffffff) overlapping slightly */}
            <div className="w-full bg-white text-gray-900 rounded-[32px] p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-4 transform hover:-translate-y-1 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-950 tracking-tight">Mass WhatsApp Outreach</h2>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Dispatch personalized bulk campaigns to hundreds of property owners simultaneously using dynamic variables (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;owner_name&#125;</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;unit_number&#125;</code>) directly from your linked WhatsApp line.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
