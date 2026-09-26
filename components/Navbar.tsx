'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      router.push('/?login=true');
    }
  };

  const navItems = [
    { label: 'Overview', href: '/overview' },
    { label: 'Features', href: '/features' },
    { label: 'Services', href: '/services' },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-4 md:py-5 flex items-center justify-between relative z-30 flex-shrink-0">
      <Link href="/" className="flex items-center gap-3 group">
        <img src="/logo.png" alt="Broker Assistant Logo" className="h-9 w-auto object-contain group-hover:scale-105 transition" />
        <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-black transition">
          Broker Assistant
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                isActive
                  ? 'text-gray-950 font-bold border-b-2 border-gray-950 pb-0.5'
                  : 'text-gray-600 hover:text-gray-950'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogin}
        className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-2.5 rounded-full text-sm flex items-center gap-2 transition shadow-md hover:shadow-lg cursor-pointer"
      >
        <span>Login</span>
        <ArrowRight className="w-4 h-4 text-gray-300" />
      </button>
    </header>
  );
}
