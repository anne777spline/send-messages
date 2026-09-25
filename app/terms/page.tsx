import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Broker Assistant',
  description: 'Terms of Service for Broker Assistant by Six Tenet LLC',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#fafafd] text-gray-900 font-sans flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Soft Pastel Color Blurs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#dbeafe]/70 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#ffedd5]/80 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 right-0 w-[520px] h-[520px] bg-[#fce7f3]/70 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Header Navigation */}
        <header className="flex items-center justify-between pb-6 border-b border-gray-200/80">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-lg">Broker Assistant</span>
          </div>
        </header>

        {/* Content Container */}
        <article className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl p-8 md:p-10 shadow-xl space-y-8 text-gray-800">
          <div className="space-y-2 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
            <p className="text-xs text-gray-500 font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">1. Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Six Tenet LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), the creator and operator of Broker Assistant. By accessing or using Broker Assistant, you acknowledge that it is a product of Six Tenet LLC and agree to be bound by these terms concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">2. Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">3. User Representations</h2>
              <p>
                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">4. Prohibited Activities</h2>
              <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">5. Contact Us</h2>
              <p>
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:{' '}
                <a
                  href="mailto:legal@sixtenet.com"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  legal@sixtenet.com
                </a>.
              </p>
            </section>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#777777] border-t border-gray-200/80 mt-8 relative z-10">
        <div>
          <span>Developed by </span>
          <a
            href="https://sixtenet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#555555] hover:text-gray-900 hover:underline transition font-medium"
          >
            Six Tenet LLC
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://sixtenet.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition">About</a>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="text-gray-900 font-bold">Terms</Link>
          <span>·</span>
          <a href="mailto:legal@sixtenet.com" className="hover:text-gray-900 transition">Help</a>
        </div>
      </footer>
    </main>
  );
}
