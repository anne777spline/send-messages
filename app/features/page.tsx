'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileSpreadsheet, MessageSquare, Smartphone, Filter, CheckCheck } from 'lucide-react';

export default function FeaturesPage() {
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
              Engineered For <br />
              <span className="font-serif-accent italic font-normal text-gray-950 text-[1.08em]">Daily Execution</span> <br />
              <span className="font-normal text-gray-900">for Brokers</span>
            </h1>
          </div>
          <div className="lg:col-span-5 pb-1">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal border-l-2 border-gray-950/20 pl-5">
              Everything real estate professionals need to import owner lists from any country, organize building portfolios, and start direct WhatsApp conversations effortlessly.
            </p>
          </div>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">AI-Powered Universal Import</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload any CSV spreadsheet in any language or column order. Our built-in AI automatically identifies Owner Names, Phone Numbers, Buildings, Units, and Sizes—while cleaning up blank rows and formatting local phone numbers for you.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 font-mono text-xs text-gray-600 flex items-center justify-between">
              <span>Any spreadsheet layout &bull; Any country</span>
              <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-[10px]">AI Auto-Mapped</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Filter className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Smart Preview &amp; Unlimited File Size</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Preview your clean contacts before saving, convert Square Feet to Square Meters with one click, or filter a huge city-wide file to import only a single building—all without file size limits or browser freezes.
              </p>
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-700 font-medium">
              <span>Import 50 or 100,000+ properties smoothly</span>
              <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-[10px]">No Size Limits</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Dynamic Personal Templates</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Write natural outreach messages using smart tags like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;owner_name&#125;</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;building_name&#125;</code>, and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;unit_number&#125;</code> so every landlord receives a message tailored to their exact property.
              </p>
            </div>
            <div className="bg-gray-900 text-gray-200 rounded-2xl p-4 border border-gray-800 text-xs leading-relaxed">
              &quot;Good day <span className="text-blue-400 font-bold">&#123;owner_name&#125;</span>, reaching out regarding your property in <span className="text-emerald-400 font-bold">&#123;building_name&#125;</span> (Unit <span className="text-amber-300 font-bold">&#123;unit_number&#125;</span>)...&quot;
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Direct WhatsApp QR Pairing</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect your own WhatsApp number in seconds by scanning a QR code. Select individual landlords or an entire building and launch your outreach directly from your trusted personal or business line.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-700 font-medium">
              <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Higher response rates — messages arrive directly from your own phone number.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
