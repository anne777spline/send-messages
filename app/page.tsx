'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Building2,
  Send,
  RefreshCw,
  CheckCircle,
  Upload,
  FileText,
  X,
  Copy,
  Check,
  AlertCircle,
  LogOut,
  Smartphone,
  ShieldCheck,
  QrCode as QrCodeIcon
} from 'lucide-react';
import { createClientBrowser } from '@/lib/supabaseBrowser';

type WhatsAppStatus = 'not_created' | 'connecting' | 'connected' | 'disconnected' | 'error';

export default function Home() {
  const [supabase] = useState(() => createClientBrowser());
  const [session, setSession] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // WhatsApp Connection State
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>('not_created');
  const [waInstanceName, setWaInstanceName] = useState<string>('');
  const [waQrCode, setWaQrCode] = useState<string | null>(null);
  const [waQrExpiresAt, setWaQrExpiresAt] = useState<number | null>(null);
  const [waQrCountdown, setWaQrCountdown] = useState<number>(0);
  const [waLoading, setWaLoading] = useState<boolean>(false);
  const [waError, setWaError] = useState<string | null>(null);

  // Properties & Messaging State
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [template, setTemplate] = useState<string>(
    "Good day {owner_name}, I hope you're doing well. Reaching out regarding your property in {building_name} (Unit {unit_number})."
  );
  const [results, setResults] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [buildingsLoading, setBuildingsLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Session Check, URL Code Handler & Auth Listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        window.location.href = `/api/auth/callback?code=${code}`;
        return;
      }
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 2. Fetch WhatsApp Status
  const checkWhatsAppStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data.status);
        if (data.instanceName) setWaInstanceName(data.instanceName);
        if (data.status === 'connected') {
          setWaQrCode(null);
          setWaQrExpiresAt(null);
        }
      }
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
    }
  }, []);

  // 3. Polling WhatsApp Status when connecting
  useEffect(() => {
    if (!session) return;
    checkWhatsAppStatus();

    let interval: NodeJS.Timeout | null = null;
    if (waStatus === 'connecting') {
      interval = setInterval(() => {
        checkWhatsAppStatus();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, waStatus, checkWhatsAppStatus]);

  // 4. QR Countdown Timer
  useEffect(() => {
    if (!waQrExpiresAt) {
      setWaQrCountdown(0);
      return;
    }

    const updateTimer = () => {
      const rem = Math.max(0, Math.floor((waQrExpiresAt - Date.now()) / 1000));
      setWaQrCountdown(rem);
      if (rem === 0) {
        setWaQrCode(null);
        setWaQrExpiresAt(null);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [waQrExpiresAt]);

  // 5. Connect WhatsApp Action
  const handleConnectWhatsApp = async () => {
    setWaLoading(true);
    setWaError(null);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect WhatsApp');
      }

      setWaStatus(data.status);
      if (data.status === 'connected') {
        setWaQrCode(null);
        setWaQrExpiresAt(null);
      } else if (data.qrCode) {
        setWaQrCode(data.qrCode);
        const expTime = data.expiresAt ? new Date(data.expiresAt).getTime() : Date.now() + 60000;
        setWaQrExpiresAt(expTime);
      }
      if (data.instanceName) {
        setWaInstanceName(data.instanceName);
      }
    } catch (err: any) {
      setWaError(err.message || 'Error connecting to WhatsApp');
      setWaStatus('error');
    } finally {
      setWaLoading(false);
    }
  };

  // 6. Buildings Loader
  const loadBuildings = useCallback(async () => {
    setBuildingsLoading(true);
    try {
      const res = await fetch('/api/properties?action=buildings');
      const data = await res.json();
      if (data.success && Array.isArray(data.buildings)) {
        setBuildings(data.buildings);
      }
    } catch (err) {
      console.error('Error loading buildings:', err);
    } finally {
      setBuildingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadBuildings();
    }
  }, [session, loadBuildings]);

  // 7. Search Properties
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setDispatchResult(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedBuilding.trim()) params.append('building', selectedBuilding.trim());
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const rows = data.data || [];
        setResults(rows);
        setSelectedIds(new Set(rows.map((r: any) => r.id)));
      } else {
        setResults([]);
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Error executing search:', err);
      setResults([]);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedBuilding('');
    setSearchTerm('');
    setResults([]);
    setSelectedIds(new Set());
    setHasSearched(false);
    setDispatchResult(null);
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        await loadBuildings();
        handleSearch();
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message || 'Error uploading file' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDispatch = async () => {
    if (selectedIds.size === 0) return;
    if (waStatus !== 'connected') {
      setDispatchResult({
        success: false,
        error: 'Please link your WhatsApp account before sending messages.'
      });
      return;
    }

    setSending(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building: selectedBuilding,
          phoneSearch: searchTerm,
          template,
          selectedIds: Array.from(selectedIds)
        })
      });
      const data = await res.json();
      setDispatchResult(data);
    } catch (err: any) {
      setDispatchResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`
      }
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const insertTag = (tag: string) => {
    setTemplate(prev => `${prev} {${tag}}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const isAllSelected = results.length > 0 && selectedIds.size === results.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < results.length;

  // --- Render Auth Loading ---
  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-[#888888]">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium">Checking session...</p>
        </div>
      </main>
    );
  }

  // --- Render Login Screen if Not Authenticated ---
  if (!session) {
    return (
      <main className="min-h-screen bg-[#121212] text-[#e1e1e1] flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Center Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Broker Assistant</h1>
              <p className="text-sm text-[#999999]">
                Search property owners, manage building portfolios, and send direct WhatsApp messages.
              </p>
            </div>

            <div className="p-4 bg-[#252525] rounded-xl border border-[#333333] space-y-2 text-xs text-[#aaaaaa]">
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Private & Secure Workspace</span>
              </div>
              <p>
                Your property listings, owner contacts, and WhatsApp messages are strictly private to your broker account.
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-3 transition shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        {/* Minimalist Footer like Google Labs */}
        <footer className="w-full max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#777777] border-t border-[#1f1f1f]">
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
            <a
              href="https://sixtenet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              About
            </a>
            <span>·</span>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <span>·</span>
            <a href="mailto:legal@sixtenet.com" className="hover:text-white transition">Help</a>
          </div>
        </footer>
      </main>
    );
  }

  // --- Render Authenticated Dashboard ---
  return (
    <main className="min-h-screen bg-[#181818] text-[#e1e1e1] p-4 md:p-8 font-sans text-base flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-6 flex-1">

        {/* Top Header with User Info & Sign Out */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#2e2e2e] gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <span>Broker Assistant</span>
            </h1>
            <p className="text-[#999999] text-sm md:text-base mt-1">
              Search property owners, filter buildings, and deliver direct WhatsApp messages.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#222222] border border-[#333333] px-3.5 py-2 rounded-xl text-xs">
            <div className="flex flex-col text-right">
              <span className="text-white font-medium truncate max-w-[220px]">{session.user.email}</span>
              <span className="text-[#888888] text-[11px] flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Broker Account
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-[#888888] hover:text-red-400 hover:bg-[#2b2b2b] rounded-lg transition ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: WhatsApp Status, Import Listings & Message Template */}
          <div className="lg:col-span-1 space-y-6">

            {/* WhatsApp Connection Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp Connection</span>
                </h2>
                {waStatus === 'connected' ? (
                  <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                ) : waStatus === 'connecting' ? (
                  <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" /> Waiting for scan...
                  </span>
                ) : (
                  <span className="text-xs bg-[#2b2b2b] text-[#888888] px-2.5 py-1 rounded-full font-medium">
                    Not Connected
                  </span>
                )}
              </div>

              {waStatus === 'connected' ? (
                <div className="bg-[#1b2a1e] border border-[#2e5235] rounded-lg p-3 text-xs text-[#a3e635] space-y-1">
                  <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" /> WhatsApp connected & ready
                  </p>
                  <p className="text-[#888888]">
                    Messages will be sent directly from your linked phone number.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#888888]">
                  Link your phone to send messages directly to property owners from your WhatsApp account.
                </p>
              )}

              {/* QR Code Display when Connecting */}
              {waStatus === 'connecting' && waQrCode && (
                <div className="bg-[#181818] border border-[#3a3a3a] rounded-xl p-4 flex flex-col items-center space-y-3 text-center">
                  <div className="bg-white p-3 rounded-lg shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={waQrCode.startsWith('data:') ? waQrCode : `data:image/png;base64,${waQrCode}`}
                      alt="WhatsApp QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white font-medium flex items-center justify-center gap-1.5">
                      <QrCodeIcon className="w-4 h-4 text-blue-400" /> Scan QR with WhatsApp
                    </p>
                    <p className="text-[11px] text-[#888888]">
                      WhatsApp → Settings → Linked Devices → Link a Device
                    </p>
                    {waQrCountdown > 0 && (
                      <p className="text-[11px] text-amber-400 font-mono">
                        Expires in {waQrCountdown}s
                      </p>
                    )}
                  </div>
                </div>
              )}

              {waError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  <span>{waError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConnectWhatsApp}
                disabled={waLoading}
                className="w-full bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#3a3a3a] border border-[#444444] text-white font-medium py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {waLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Connecting to WhatsApp...</span>
                  </>
                ) : waStatus === 'connected' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Linked (Click to Refresh)</span>
                  </>
                ) : waStatus === 'connecting' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-blue-400" />
                    <span>Refresh QR Code</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Link WhatsApp Account</span>
                  </>
                )}
              </button>
            </div>

            {/* CSV Import Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  <span>Import Property Listings</span>
                </h2>
                <span className="text-xs bg-[#2b2b2b] text-[#888888] px-2 py-0.5 rounded">CSV Spreadsheet</span>
              </div>
              <p className="text-xs text-[#888888]">
                Upload your CSV spreadsheet to add or update your property and owner listings.
              </p>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#3a3a3a] border border-[#444444] text-white font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Processing & Importing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Upload CSV File</span>
                  </>
                )}
              </button>

              {importResult && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-start gap-2.5 ${importResult.success
                    ? 'bg-[#1b2a1e] border border-[#2e5235] text-[#7ce090]'
                    : 'bg-[#2d1b1b] border border-[#542828] text-[#f87171]'
                    }`}
                >
                  {importResult.success ? (
                    <>
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-300">Properties Imported!</p>
                        <p className="text-xs text-[#a3e635] mt-0.5">
                          {importResult.total_processed} record(s) processed and added to your portfolio.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-300">Import Failed</p>
                        <p className="text-xs text-red-200 mt-0.5">{importResult.error}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Template Editor Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white">Message Template</h2>
              <p className="text-xs text-[#888888]">
                Click tags to insert owner or property details automatically:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'owner_name', label: '+ Owner Name' },
                  { tag: 'building_name', label: '+ Building' },
                  { tag: 'unit_number', label: '+ Unit' },
                  { tag: 'rooms', label: '+ Rooms' }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => insertTag(item.tag)}
                    className="bg-[#2b2b2b] hover:bg-[#383838] text-blue-400 text-xs px-2.5 py-1.5 rounded border border-[#3d3d3d] transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                value={template}
                onChange={e => setTemplate(e.target.value)}
                className="w-full bg-[#181818] border border-[#3a3a3a] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleDispatch}
                disabled={sending || selectedIds.size === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>
                  {sending
                    ? 'Sending Messages...'
                    : `Send WhatsApp Messages (${selectedIds.size.toLocaleString()} selected)`}
                </span>
              </button>

              {dispatchResult && (
                <div
                  className={`p-3.5 rounded-lg text-xs ${dispatchResult.success
                    ? 'bg-[#1b2a1e] border border-[#2e5235] text-[#7ce090]'
                    : 'bg-[#2d1b1b] border border-[#542828] text-[#f87171]'
                    }`}
                >
                  {dispatchResult.success ? (
                    <div className="space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle className="w-4 h-4" /> Messages successfully sent!
                      </p>
                      <p>Total: {dispatchResult.total_sent} messages queued for delivery.</p>
                      <p className="text-[#888888] italic truncate">Sample: &quot;{dispatchResult.sample_message}&quot;</p>
                    </div>
                  ) : (
                    <p>Error sending messages: {dispatchResult.error}</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Search Bar & Results Table */}
          <div className="lg:col-span-2 space-y-6">

            {/* Inline Search Bar */}
            <form onSubmit={handleSearch} className="bg-[#222222] border border-[#333333] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by building, owner name, phone, unit..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#181818] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Exact Building Select Dropdown */}
              <div className="w-full sm:w-64 flex-shrink-0">
                <select
                  value={selectedBuilding}
                  onChange={e => setSelectedBuilding(e.target.value)}
                  className="w-full bg-[#181818] border border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 text-ellipsis"
                >
                  <option value="">
                    {buildingsLoading ? 'Loading buildings...' : `All Buildings (${buildings.length.toLocaleString()})`}
                  </option>
                  {buildings.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                title="Search Properties"
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-lg flex items-center justify-center transition shadow-sm flex-shrink-0 w-full sm:w-11 h-10 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>

              {/* Clear button if search is active */}
              {(searchTerm || selectedBuilding) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  title="Clear all filters"
                  className="text-[#888888] hover:text-white hover:bg-[#2d2d2d] p-2.5 rounded-lg transition flex items-center justify-center flex-shrink-0 w-full sm:w-10 h-10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Results & Checkbox Table Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 flex flex-col min-h-[500px] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2d2d2d] pb-4 gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>Properties Found</span>
                    <span className="text-xs bg-[#2b2b2b] text-blue-400 px-2.5 py-0.5 rounded-full font-mono">
                      {results.length.toLocaleString()}
                    </span>
                  </h2>
                  {results.length > 0 && (
                    <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                      {selectedIds.size} of {results.length} selected
                    </span>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs bg-[#2d2d2d] hover:bg-[#383838] border border-[#444444] px-2.5 py-1 rounded text-[#cccccc] hover:text-white transition cursor-pointer"
                    >
                      {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-xs text-[#888888] hover:text-white transition ml-2 cursor-pointer"
                    >
                      Clear results
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#888888] space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                  <p className="text-sm">Loading properties...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#777777] space-y-3">
                  <Search className="w-12 h-12 stroke-[1.5] text-[#444444]" />
                  <p className="text-base text-[#aaaaaa]">
                    {hasSearched
                      ? 'No properties found matching your search.'
                      : 'Search by keyword (e.g. building name, owner, phone) or select a building above.'}
                  </p>
                  <p className="text-xs text-[#666666] max-w-sm text-center">
                    Tip: Select properties using the checkboxes to send them a personalized message.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1 max-h-[650px] overflow-y-auto rounded-lg border border-[#2d2d2d]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-[#1a1a1a] text-[#aaaaaa] border-b border-[#2d2d2d] z-10 shadow-sm">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={input => {
                              if (input) input.indeterminate = isPartiallySelected;
                            }}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-[#444444] bg-[#222222] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4 font-medium">Owner Name</th>
                        <th className="py-3 px-4 font-medium">Phone Number</th>
                        <th className="py-3 px-4 font-medium">Building</th>
                        <th className="py-3 px-4 font-medium">Unit</th>
                        <th className="py-3 px-4 font-medium">Rooms</th>
                        <th className="py-3 px-4 font-medium">Message Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2a2a] bg-[#1f1f1f]">
                      {results.map((row: any) => {
                        const isSelected = selectedIds.has(row.id);
                        const msg = template
                          .replace(/{owner_name}/gi, row.owner_name || '')
                          .replace(/{building_name}/gi, row.building_name || '')
                          .replace(/{unit_number}/gi, row.unit_number || '')
                          .replace(/{rooms}/gi, row.rooms || '')
                          .replace(/[ \t]+/g, ' ')
                          .trim();

                        return (
                          <tr
                            key={row.id}
                            onClick={() => toggleSelectRow(row.id)}
                            className={`transition cursor-pointer group ${isSelected ? 'bg-[#1e293b]/50 hover:bg-[#1e293b]/70' : 'hover:bg-[#282828]'
                              }`}
                          >
                            <td className="py-3 px-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(row.id)}
                                className="w-4 h-4 rounded border-[#444444] bg-[#222222] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                              {row.owner_name || <span className="text-[#666666] italic">Unknown</span>}
                            </td>
                            <td className="py-3 px-4 font-mono text-blue-400 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{row.phone}</span>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    copyToClipboard(row.phone);
                                  }}
                                  title="Copy phone number"
                                  className="opacity-0 group-hover:opacity-100 text-[#888888] hover:text-white transition p-1"
                                >
                                  {copiedPhone === row.phone ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[#cccccc] whitespace-nowrap">
                              {row.building_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-[#cccccc] whitespace-nowrap">
                              <span className="bg-[#2a2a2a] px-2 py-0.5 rounded text-xs">
                                {row.unit_number || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[#888888] whitespace-nowrap">
                              {row.rooms || '-'}
                            </td>
                            <td className="py-3 px-4 text-[#aaaaaa] max-w-xs truncate" title={msg}>
                              <span className="text-xs bg-[#181818] border border-[#2e2e2e] px-2.5 py-1 rounded block truncate">
                                {msg}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Subtle Footer on Dashboard */}
      <footer className="w-full max-w-7xl mx-auto pt-8 pb-2 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#666666]">
        <div>
          <span>Developed by </span>
          <a
            href="https://sixtenet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888888] hover:text-white hover:underline transition font-medium"
          >
            Six Tenet LLC
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://sixtenet.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            About
          </a>
          <span>·</span>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-white transition">Terms</Link>
          <span>·</span>
          <a href="mailto:legal@sixtenet.com" className="hover:text-white transition">Help</a>
        </div>
      </footer>
    </main>
  );
}
