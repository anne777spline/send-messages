'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Upload, MessageSquare, Smartphone, Users, CheckCheck, ArrowRight, FileSpreadsheet, ShieldCheck } from 'lucide-react';

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
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 flex-1 space-y-20">

        {/* Page Hero Header */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
            Engineered For Daily Broker Execution
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Everything real estate brokers need to locate property owners, parse portfolio spreadsheets, and initiate direct conversations without third-party fees.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">1-Click CSV Portfolio Import</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Upload raw CSV files containing landlord names, phone numbers, unit numbers, and building details. Our automated parser organizes and updates your dedicated broker database instantly.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 font-mono text-xs text-gray-600 flex items-center justify-between">
              <span>owner_name, phone, building, unit</span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md">Auto-Parsed</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Dynamic Variable Templates</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Craft personalized outreach templates using live tags like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;owner_name&#125;</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;building_name&#125;</code>, and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;unit_number&#125;</code> for tailored owner communication.
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
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Dedicated WhatsApp QR Pairing</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Link your own WhatsApp phone number in seconds by scanning an encrypted QR code. No third-party phone numbers or untrusted sender aliases are used.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-700 font-medium">
              <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>Direct sender reputation — messages appear as originating directly from your personal or business line.</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Multi-Select Campaign Dispatch</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select specific property owners or select an entire building with a single click. Dispatch campaigns to 10 or 500 owners with real-time status feedback.
              </p>
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 p-4 rounded-2xl text-xs text-gray-700 font-medium">
              <span>Batch Outreach Control</span>
              <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-[10px]">100% Delivery Tracked</span>
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
