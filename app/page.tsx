'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Building2,
  Send,
  Database,
  RefreshCw,
  CheckCircle,
  Upload,
  FileText,
  X,
  Copy,
  Check,
  Filter,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const [buildings, setBuildings] = useState<string[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [template, setTemplate] = useState<string>(
    "Good day {owner_name}, I hope you're doing well. Reaching out regarding your property in {building_name} (Unit {unit_number})."
  );
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [buildingsLoading, setBuildingsLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBuildings = async () => {
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
  };

  useEffect(() => {
    loadBuildings();
  }, []);

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
        setResults(data.data || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error executing search:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedBuilding('');
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
    setDispatchResult(null);
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
    if (results.length === 0) return;
    setSending(true);
    setDispatchResult(null);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building: selectedBuilding,
          phoneSearch: searchTerm,
          template
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

  const insertTag = (tag: string) => {
    setTemplate(prev => `${prev} {${tag}}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#181818] text-[#e1e1e1] p-4 md:p-8 font-sans text-base">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#2b2b2b] pb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <span>Broker Landlord Messenger</span>
            </h1>
            <p className="text-[#999999] text-sm md:text-base mt-1">
              Instant contact search, filtering by building, and an automated system for sending WhatsApp campaigns.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#222222] border border-[#333333] px-4 py-2 rounded-lg text-sm flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-[#cccccc]">Supabase: <strong className="text-white">Connected</strong></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Controls & Filters */}
          <div className="lg:col-span-1 space-y-6">

            {/* CSV Import Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Import CSV Listings
                </h2>
                <span className="text-xs bg-[#2b2b2b] text-[#888888] px-2 py-0.5 rounded">CSV only</span>
              </div>
              <p className="text-xs text-[#888888]">
                Upload CSV files to add or update landlords and properties directly in the database.
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
                className="w-full bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#3a3a3a] border border-[#444444] text-white font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2.5 transition shadow-sm"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Processing & Importing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>Select & Upload CSV File</span>
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
                        <p className="font-medium text-emerald-300">Import Successful!</p>
                        <p className="text-xs text-[#a3e635] mt-0.5">
                          {importResult.total_processed} record(s) processed and synced.
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

            {/* Search & Filters Card */}
            <form onSubmit={handleSearch} className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  Filters & Lookup
                </h2>
                {(searchTerm || selectedBuilding) && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-[#888888] hover:text-white flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
              </div>

              {/* Flexible Written Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#cccccc] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-400" />
                    Keyword Search (Contains)
                  </span>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-[#888888] hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by building (e.g. Luma, Binghatti), phone, name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[#181818] border border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#666666] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-[#777777]">
                  Search by building name, owner name, phone number, or unit.
                </p>
              </div>

              {/* Exact Building Select Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#cccccc] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Filter by Building Dropdown
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#888888]">
                      {buildingsLoading ? 'Loading...' : `${buildings.length.toLocaleString()} buildings`}
                    </span>
                    <button
                      type="button"
                      onClick={loadBuildings}
                      disabled={buildingsLoading}
                      title="Reload buildings list"
                      className="text-[#777777] hover:text-white transition disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${buildingsLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Dropdown with all 1,675 buildings */}
                <select
                  value={selectedBuilding}
                  onChange={e => setSelectedBuilding(e.target.value)}
                  className="w-full bg-[#181818] border border-[#3a3a3a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 text-ellipsis"
                >
                  <option value="">-- All Buildings ({buildings.length.toLocaleString()}) --</option>
                  {buildings.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-5 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? 'Searching Database...' : 'Search / Apply Filter'}</span>
              </button>
            </form>

            {/* Template Editor Card */}
            <div className="bg-[#222222] border border-[#333333] rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white">Message Template</h2>
              <p className="text-xs text-[#888888]">
                Insert dynamic variables into your message template:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: 'owner_name', label: '+ Landlord Name' },
                  { tag: 'building_name', label: '+ Building' },
                  { tag: 'unit_number', label: '+ Unit' },
                  { tag: 'rooms', label: '+ Rooms' }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => insertTag(item.tag)}
                    className="bg-[#2b2b2b] hover:bg-[#383838] text-blue-400 text-xs px-2.5 py-1.5 rounded border border-[#3d3d3d] transition"
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
                disabled={sending || results.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>
                  {sending
                    ? 'Dispatching via n8n...'
                    : `Send WhatsApp Campaign (${results.length.toLocaleString()} leads)`}
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
                        <CheckCircle className="w-4 h-4" /> Campaign successfully dispatched!
                      </p>
                      <p>Total sent: {dispatchResult.total_sent} leads to n8n webhook.</p>
                      <p className="text-[#888888] italic truncate">Sample: &quot;{dispatchResult.sample_message}&quot;</p>
                    </div>
                  ) : (
                    <p>Error dispatching campaign: {dispatchResult.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results & Instant Preview */}
          <div className="lg:col-span-2 bg-[#222222] border border-[#333333] rounded-xl p-5 flex flex-col min-h-[600px] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2d2d2d] pb-4 gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>Search Results</span>
                  <span className="text-xs bg-[#2b2b2b] text-blue-400 px-2.5 py-0.5 rounded-full font-mono">
                    {results.length.toLocaleString()} found
                  </span>
                </h2>
                {selectedBuilding && (
                  <p className="text-xs text-[#888888] mt-1">
                    Filtered by building: <strong className="text-[#cccccc]">{selectedBuilding}</strong>
                  </p>
                )}
              </div>

              {results.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-[#888888] hover:text-white transition"
                >
                  Clear results
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#888888] space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-sm">Querying database...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#777777] space-y-3">
                <Search className="w-12 h-12 stroke-[1.5] text-[#444444]" />
                <p className="text-base text-[#aaaaaa]">
                  {hasSearched ? 'No records match your search criteria.' : 'Search by keyword (e.g. Luma, Binghatti, phone) or select a building.'}
                </p>
                <p className="text-xs text-[#666666] max-w-sm text-center">
                  Tip: You can search by entering building names, landlord names, full or partial phone numbers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1 max-h-[700px] overflow-y-auto rounded-lg border border-[#2d2d2d]">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-[#1a1a1a] text-[#aaaaaa] border-b border-[#2d2d2d] z-10 shadow-sm">
                    <tr>
                      <th className="py-3 px-4 font-medium">Landlord Name</th>
                      <th className="py-3 px-4 font-medium">Phone Number</th>
                      <th className="py-3 px-4 font-medium">Building</th>
                      <th className="py-3 px-4 font-medium">Unit</th>
                      <th className="py-3 px-4 font-medium">Rooms</th>
                      <th className="py-3 px-4 font-medium">Message Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2a] bg-[#1f1f1f]">
                    {results.map((row: any) => {
                      const msg = template
                        .replace(/{owner_name}/gi, row.owner_name || '')
                        .replace(/{building_name}/gi, row.building_name || '')
                        .replace(/{unit_number}/gi, row.unit_number || '')
                        .replace(/{rooms}/gi, row.rooms || '')
                        .replace(/\s+/g, ' ')
                        .trim();

                      return (
                        <tr key={row.id} className="hover:bg-[#282828] transition group">
                          <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                            {row.owner_name || <span className="text-[#666666] italic">Unknown</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{row.phone}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(row.phone)}
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
    </main>
  );
}
