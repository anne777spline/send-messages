import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Smartphone, FileSpreadsheet, ShieldCheck, HelpCircle, Mail } from 'lucide-react';

export const metadata = {
  title: 'Help & Support | Broker Assistant',
  description: 'Help Center and FAQs for Broker Assistant by Six Tenet LLC',
};

export default function HelpPage() {
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
          <span className="text-xs font-semibold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-100 shadow-sm inline-block">
            Support Center
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-950 tracking-tight">Help &amp; Support</h1>
          <p className="text-sm text-gray-500 font-medium">Guides and instructions for managing your portfolio and WhatsApp campaigns.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-8 md:p-10 shadow-xl space-y-8 text-gray-800">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>1. How do I link my WhatsApp account?</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Once logged into the Broker Portal, click the <strong>&quot;Link WhatsApp Account&quot;</strong> button in the left panel. A secure QR code will generate on your screen. Open WhatsApp on your mobile phone, go to <strong>Settings &rarr; Linked Devices &rarr; Link a Device</strong>, and scan the QR code. Once paired, all campaign messages will dispatch directly from your linked phone number.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>2. How do I upload my property listings?</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Click <strong>&quot;Upload CSV File&quot;</strong> in the portal sidebar. Your CSV file should contain columns for landlord name, phone number, building name, unit number, and rooms. The platform automatically parses and upserts these records into your dedicated tenant database.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>3. Are my uploaded contacts kept private?</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Yes, 100%. Every brokerage account is protected by strict database Row-Level Security (RLS). Your listings, owner phone numbers, and campaign logs can only be accessed by authenticated users belonging to your specific tenant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span>4. What dynamic tags can I use in my message template?</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              You can personalize outreach messages using the following live placeholder tags:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm text-gray-700">
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;owner_name&#125;</code> — Inserts the landlord&apos;s full name.</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;building_name&#125;</code> — Inserts the target building name.</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;unit_number&#125;</code> — Inserts the specific property unit number.</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">&#123;rooms&#125;</code> — Inserts the room configuration (e.g. 1 B/R, 2 B/R).</li>
            </ul>
          </section>

          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-6 text-blue-900 space-y-3 mt-8">
            <h3 className="font-bold flex items-center gap-2 text-base text-blue-950">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Need Direct Assistance?</span>
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              If you encounter any issues with QR code pairing, CSV importing, or account access, our technical team is here to assist you.
            </p>
            <div>
              <a
                href="mailto:legal@sixtenet.com"
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-black transition shadow-md"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Contact Support (legal@sixtenet.com)</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Footer */}
      <Footer />
    </main>
  );
}
