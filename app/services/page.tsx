import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Upload, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Services | Broker Assistant',
  description: 'Enterprise support and infrastructure for Broker Assistant by Six Tenet LLC',
};

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
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10 flex-1 space-y-16">
        
        {/* Page Hero Header */}
        <div className="max-w-3xl space-y-6">
          <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-100/80 shadow-sm inline-block">
            Services &amp; Infrastructure
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]">
            Enterprise Support &amp; Data Security
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed font-normal">
            Backed by Six Tenet LLC engineering, ensuring high availability, strict Row-Level Security isolation, and seamless portfolio migration.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center font-bold border border-amber-100">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Tenant Data Isolation</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Database Row-Level Security (RLS) policies guarantee that your brokerage portfolio remains strictly confidential and accessible only by your tenant.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-bold border border-blue-100">
              <Upload className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Portfolio Migration Service</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Assistance with large-scale CSV cleanups, building name standardization, and phone number formatting prior to initial import.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold border border-emerald-100">
              <Smartphone className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">Dedicated Instance Routing</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              High-deliverability WhatsApp instance management ensures campaigns are dispatched smoothly without rate-limit throttling.
            </p>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
