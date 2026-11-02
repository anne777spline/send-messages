'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#fce7f3]/70 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-10 md:pt-16 pb-6 relative z-10 flex-1 my-auto space-y-10 md:space-y-12">

        {/* Page Hero Header: Title on Left, Subtitle on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-pagani text-4xl sm:text-5xl lg:text-6xl font-light text-gray-950 leading-[1.1] tracking-tight">
              Effortless Onboarding &amp; <br />
              <span className="font-serif-accent italic font-normal text-gray-950 text-[1.08em]">Total Privacy</span> <br />
              <span className="font-normal text-gray-900">for Brokers</span>
            </h1>
          </div>
          <div className="lg:col-span-5 pb-1">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal border-l-2 border-gray-950/20 pl-5">
              Backed by Six Tenet LLC to give property consultants around the world seamless portfolio uploads, 100% contact privacy, and smooth daily outreach.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">100% Private Contact Vault</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your landlord relationships are your most valuable asset. Every broker works inside a strictly private workspace—your property lists and contacts are never shared or visible to anyone else.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Unlimited Portfolio Processing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Never worry about messy spreadsheets or large files again. Our intelligent importer automatically strips out empty Excel rows, filters out non-owners, and loads thousands of properties in seconds.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Global Market Readiness</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Designed for real estate markets worldwide. Automatically adapts local phone numbers to international WhatsApp format and converts property sizes between Square Feet and Square Meters.
            </p>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
