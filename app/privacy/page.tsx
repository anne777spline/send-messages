import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Broker Assistant',
  description: 'Privacy Policy for Broker Assistant by Six Tenet LLC',
};

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-[#888888] font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-[#cccccc]">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">1. Introduction</h2>
              <p>
                Welcome to Broker Assistant, a product developed and operated by Six Tenet LLC. As a Six Tenet LLC product, Broker Assistant is governed by our company&apos;s overarching policies. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">2. The Data We Collect About You</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Technical Data, Usage Data, and Marketing and Communications Data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">3. How We Use Your Personal Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#bbbbbb] pl-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you;</li>
                <li>Where it is necessary for our legitimate interests;</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at{' '}
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
          <Link href="/privacy" className="text-white font-medium">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <span>·</span>
          <a href="mailto:legal@sixtenet.com" className="hover:text-white transition">Help</a>
        </div>
      </footer>
    </main>
  );
}
