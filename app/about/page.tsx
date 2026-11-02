'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, ShieldCheck, BrainCircuit, Globe, ArrowRight } from 'lucide-react';

export default function AboutPage() {
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

        {/* Page Hero Header: Title on Left, Subtitle on Right (Matches Features & Services) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-pagani text-4xl sm:text-5xl lg:text-6xl font-light text-gray-950 leading-[1.1] tracking-tight">
              Built For Global <br />
              <span className="font-serif-accent italic font-normal text-gray-950 text-[1.08em]">Real Estate</span> <br />
              <span className="font-normal text-gray-900">Professionals</span>
            </h1>
          </div>
          <div className="lg:col-span-5 pb-1">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal border-l-2 border-gray-950/20 pl-5">
              Developed and operated by Six Tenet LLC, Broker Assistant helps property consultants worldwide turn owner spreadsheets into direct, personal WhatsApp conversations in seconds.
            </p>
          </div>
        </div>

        {/* Premium 2x2 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Our Mission</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Real estate brokers shouldn&apos;t spend hours fixing spreadsheets or copying and pasting phone numbers one by one. We built Broker Assistant so you can organize entire buildings, filter units effortlessly, and reach landlords directly from your own phone line.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-xs text-gray-700 font-medium flex items-center justify-between">
              <span>From raw spreadsheet to live outreach in seconds</span>
              <span className="bg-gray-900 text-white font-bold px-3 py-1 rounded-full text-[10px]">Zero Friction</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Intelligent &amp; Easy to Use</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                No technical skills required. Upload your property file in any language or format and our built-in AI assistant automatically recognizes your columns, cleans out empty rows, and prepares your contacts for instant outreach—no matter how large the file is.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-xs text-gray-700 font-medium flex items-center justify-between">
              <span>Works with spreadsheets from any country</span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md">AI Powered</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Strict Contact Privacy</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We know how valuable your landlord database is. Every broker operates inside an isolated, private account. Six Tenet LLC never sells, shares, or exposes your property portfolios or contact lists to third parties or other brokers.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-xs text-gray-700 font-medium flex items-center justify-between">
              <span>100% isolated workspace per broker</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-1 rounded-md">Private Vault</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-md">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Backed by Six Tenet LLC</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                For brokerage partnerships, team onboarding, or questions, reach our team anytime at{' '}
                <a
                  href="mailto:legal@sixtenet.com"
                  className="text-gray-950 underline decoration-gray-400 hover:decoration-gray-950 font-semibold transition"
                >
                  legal@sixtenet.com
                </a>{' '}
                or visit{' '}
                <a
                  href="https://sixtenet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-950 underline decoration-gray-400 hover:decoration-gray-950 font-semibold transition"
                >
                  Six Tenet LLC
                </a>.
              </p>
            </div>
            <div className="flex items-center justify-between bg-gray-900 text-white p-4 rounded-2xl text-xs font-medium">
              <span>Ready to organize your portfolio?</span>
              <Link
                href="/?login=true"
                className="bg-white text-gray-950 hover:bg-gray-100 font-bold px-3.5 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 transition"
              >
                <span>Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
