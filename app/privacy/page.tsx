import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Broker Assistant',
  description: 'Privacy Policy for Broker Assistant by Six Tenet LLC',
};

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-gray-500 font-mono">Last updated: 9/25/2026</p>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-gray-700">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">1. Introduction</h2>
              <p>
                Welcome to Broker Assistant, a product developed and operated by Six Tenet LLC. As a Six Tenet LLC product, Broker Assistant is governed by our company&apos;s overarching policies. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">2. The Data We Collect About You</h2>
              <p>
                Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Technical Data, Usage Data, and Marketing and Communications Data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">3. How We Use Your Personal Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you;</li>
                <li>Where it is necessary for our legitimate interests;</li>
                <li>Where we need to comply with a legal or regulatory obligation.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">5. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at{' '}
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
          <Link href="/privacy" className="text-gray-900 font-bold">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
          <span>·</span>
          <a href="mailto:legal@sixtenet.com" className="hover:text-gray-900 transition">Help</a>
        </div>
      </footer>
    </main>
  );
}
