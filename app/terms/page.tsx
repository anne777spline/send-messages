import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Broker Assistant',
  description: 'Terms of Service for Broker Assistant by Six Tenet LLC',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#121212] text-[#e1e1e1] font-sans flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Header Navigation */}
        <header className="flex items-center justify-between pb-6 border-b border-[#2e2e2e]">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#888888] hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-semibold text-white tracking-tight text-lg">Broker Assistant</span>
          </div>
        </header>

        {/* Content Container */}
        <article className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-8 md:p-10 shadow-2xl space-y-8">
          <div className="space-y-2 border-b border-[#2e2e2e] pb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
            <p className="text-xs text-[#888888] font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-[#cccccc]">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) and Six Tenet LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), the creator and operator of Broker Assistant. By accessing or using Broker Assistant, you acknowledge that it is a product of Six Tenet LLC and agree to be bound by these terms concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. Intellectual Property Rights</h2>
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, international copyright laws, and international conventions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. User Representations</h2>
              <p>
                By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Prohibited Activities</h2>
              <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Contact Us</h2>
              <p>
                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:{' '}
                <a
                  href="mailto:legal@sixtenet.com"
                  className="text-blue-400 hover:underline font-medium"
                >
                  legal@sixtenet.com
                </a>.
              </p>
            </section>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#777777] border-t border-[#1f1f1f] mt-8">
        <div>
          <span>Developed by </span>
          <a
            href="https://sixtenet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#999999] hover:text-white hover:underline transition font-medium"
          >
            Six Tenet LLC
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://sixtenet.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">About</a>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="text-white font-medium">Terms</Link>
          <span>·</span>
          <a href="mailto:legal@sixtenet.com" className="hover:text-white transition">Help</a>
        </div>
      </footer>
    </main>
  );
}
