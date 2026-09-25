import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, Search, Filter, Send, Layers, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Workspace | Broker Assistant',
  description: 'Broker Workspace Console overview for real estate brokers',
};

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#dbeafe]/70 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-[#ffedd5]/80 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#fce7f3]/70 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 flex-1 space-y-16">
        
        {/* Page Hero Header */}
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-semibold tracking-widest text-purple-600 uppercase bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100/80 shadow-sm inline-block">
            Workspace Console
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
            An Intuitive Control Center For Your Brokerage
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Designed for clarity and speed. Manage building filters, inspect owner numbers, edit message templates, and dispatch outreach from a single unified screen.
          </p>
        </div>

        {/* Workspace Console Card Preview */}
        <div className="bg-gray-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 space-y-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Broker Workspace Console</h2>
                <p className="text-xs text-gray-400">Live Search &amp; Campaign Dispatch Interface</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-3.5 py-1 rounded-full font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Instance Active
              </span>
              <Link
                href="/?login=true"
                className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-gray-100 transition cursor-pointer flex items-center gap-2"
              >
                <span>Enter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <p className="text-white text-base font-bold">Instant Portfolio Lookup</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Select building name dropdowns or enter keyword queries to locate specific property owners instantly.
              </p>
            </div>

            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <p className="text-white text-base font-bold">Dynamic Variable Tagging</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Insert owner names, building names, and unit numbers automatically with zero manual copy-pasting.
              </p>
            </div>

            <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-6 space-y-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <p className="text-white text-base font-bold">Direct WhatsApp Delivery</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                One-click execution queues messages to selected owners through your verified WhatsApp account.
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
