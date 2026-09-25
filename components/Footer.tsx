'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#777777] relative z-20 flex-shrink-0 border-t border-gray-200/60 mt-auto">
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
        <Link href="/about" className="hover:text-gray-900 transition">About</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
        <span>·</span>
        <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
        <span>·</span>
        <Link href="/help" className="hover:text-gray-900 transition">Help</Link>
      </div>
    </footer>
  );
}
