'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Globe,
  Building2,
  Filter
} from 'lucide-react';
import type { DetectedSchema } from '@/app/api/import/detect-schema/route';

interface AiImportModalProps {
  isOpen: boolean;
  fileName: string;
  allCleanLines: string[];
  initialSchema: DetectedSchema;
  provider: string;
  onClose: () => void;
  onImportSuccess: (totalImported: number) => void;
}

function parseCSVLineClient(text: string): string[] {
  const result: string[] = [];
  let cell = '',
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

function cleanPhoneClient(rawPhone: string, defaultDialCode: string = ''): string {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim();
  if (!str) return '';
  const lower = str.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'none' || lower === '-') {
    return '';
  }

  if (/^\d+\.\d+e\+\d+$/i.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) str = String(Math.round(num));
  }

  const hadPlus = str.startsWith('+');
  let digits = str.replace(/\D/g, '');
  if (!digits || digits.length < 6) return '';

  const dialCode = String(defaultDialCode || '').replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
    return '+' + digits;
  }

  if (hadPlus) {
    if (digits.startsWith('0') && dialCode) {
      digits = dialCode + digits.slice(1);
    }
    return '+' + digits;
  }

  if (digits.startsWith('0') && dialCode) {
    digits = dialCode + digits.slice(1);
    return '+' + digits;
  }

  if (dialCode && !digits.startsWith(dialCode) && digits.length <= 10) {
    digits = dialCode + digits;
  }

  return '+' + digits;
}

export default function AiImportModal({
  isOpen,
  fileName,
  allCleanLines,
  initialSchema,
  provider,
  onClose,
  onImportSuccess
}: AiImportModalProps) {
  const [schema, setSchema] = useState<DetectedSchema>(initialSchema);
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => {
    return parseCSVLineClient(allCleanLines[schema.headerRowIndex] || '');
  }, [allCleanLines, schema.headerRowIndex]);

  // Process and preview rows in memory
  const { mappedRows, availableBuildings, skippedNoPhoneCount } = useMemo(() => {
    const rows: any[] = [];
    const bldgSet = new Set<string>();
    let noPhone = 0;

    const m = schema.mapping;
    const dialCode = schema.defaultDialCode || '';
    const roleCol = schema.roleFilter?.columnIndex;
    const allowedRoles = (schema.roleFilter?.allowedValues || []).map(v => v.toLowerCase().trim());

    for (let i = schema.headerRowIndex + 1; i < allCleanLines.length; i++) {
      const line = allCleanLines[i];
      if (!line) continue;
      const p = parseCSVLineClient(line);

      // Role filter check (e.g., Buyer vs Seller)
      if (typeof roleCol === 'number' && roleCol >= 0 && allowedRoles.length > 0) {
        const cellRole = (p[roleCol] || '').toLowerCase().trim();
        if (cellRole && !allowedRoles.some(ar => cellRole.includes(ar))) {
          continue;
        }
      }

      const bldgPrimary = m.building_name !== null ? (p[m.building_name] || '').trim() : '';
      const bldgFallback = m.project_fallback !== null ? (p[m.project_fallback] || '').trim() : '';
      const resolvedBldg = bldgPrimary || bldgFallback || schema.defaultBuildingName || 'Imported Building';

      if (resolvedBldg) bldgSet.add(resolvedBldg);
      if (bldgFallback) bldgSet.add(bldgFallback);

      if (buildingFilter.trim()) {
        const fUpper = buildingFilter.trim().toUpperCase();
        if (
          !resolvedBldg.toUpperCase().includes(fUpper) &&
          !bldgFallback.toUpperCase().includes(fUpper)
        ) {
          continue;
        }
      }

      const rawPhone = m.phone !== null ? p[m.phone] : '';
      const phone = cleanPhoneClient(rawPhone, dialCode);
      if (!phone || phone.length < 7) {
        noPhone++;
        continue;
      }

      let sizeVal = m.size !== null ? parseFloat(p[m.size]) : null;
      if (sizeVal !== null && !isNaN(sizeVal)) {
        if (schema.sizeUnit === 'sqft') {
          sizeVal = Number((sizeVal * 0.092903).toFixed(2));
        } else {
          sizeVal = Number(sizeVal.toFixed(2));
        }
      } else {
        sizeVal = null;
      }

      rows.push({
        phone,
        defaultDialCode: dialCode,
        owner_name: (m.owner_name !== null ? p[m.owner_name] || '' : '').trim(),
        email: (m.email !== null ? p[m.email] || '' : '').trim(),
        building_name: buildingFilter.trim() ? buildingFilter.trim() : resolvedBldg,
        unit_number: (m.unit_number !== null ? p[m.unit_number] || '' : '').trim(),
        rooms: (m.rooms !== null ? p[m.rooms] || '' : '').trim(),
        size_sqm: sizeVal,
        plot_number: (m.plot_number !== null ? p[m.plot_number] || '' : '').trim(),
        land_number: (m.land_number !== null ? p[m.land_number] || '' : '').trim(),
        area_en: (m.area_en !== null ? p[m.area_en] || '' : '').trim()
      });
    }

    // Deduplicate by phone + building + unit
    const uniqueMap = new Map();
    for (const r of rows) {
      const key = `${r.phone}|${r.building_name}|${r.unit_number}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    }

    return {
      mappedRows: Array.from(uniqueMap.values()),
      availableBuildings: Array.from(bldgSet).sort((a, b) => a.localeCompare(b)).slice(0, 300),
      skippedNoPhoneCount: noPhone
    };
  }, [allCleanLines, schema, buildingFilter]);

  if (!isOpen) return null;

  const updateMapping = (field: keyof DetectedSchema['mapping'], colIdxStr: string) => {
    const val = colIdxStr === '' ? null : parseInt(colIdxStr, 10);
    setSchema(prev => ({
      ...prev,
      mapping: {
        ...prev.mapping,
        [field]: val
      }
    }));
  };

  const handleConfirmImport = async () => {
    if (mappedRows.length === 0) {
      setError('No valid rows with phone numbers match your current selection.');
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const CHUNK_SIZE = 1000;
      const totalChunks = Math.ceil(mappedRows.length / CHUNK_SIZE);
      let totalSaved = 0;

      for (let c = 0; c < totalChunks; c++) {
        const chunk = mappedRows.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
        setProgressText(
          totalChunks > 1
            ? `Importing batch ${c + 1} of ${totalChunks} (${Math.round(((c + 1) / totalChunks) * 100)}%)...`
            : `Importing ${mappedRows.length.toLocaleString()} properties...`
        );

        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunk })
        });

        if (!res.ok) {
          let errMsg = `Server error (${res.status})`;
          try {
            const errJson = await res.json();
            if (errJson.error) errMsg = errJson.error;
          } catch {
            const errTxt = await res.text();
            if (errTxt) errMsg = errTxt.slice(0, 120);
          }
          throw new Error(errMsg);
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Import batch failed.');
        }

        totalSaved += data.total_processed ?? chunk.length;
      }

      onImportSuccess(totalSaved);
    } catch (err: any) {
      setError(err.message || 'Error during import');
    } finally {
      setImporting(false);
      setProgressText('');
    }
  };

  const mappingFields: { key: keyof DetectedSchema['mapping']; label: string; required?: boolean }[] = [
    { key: 'phone', label: 'Phone / Mobile Number', required: true },
    { key: 'owner_name', label: 'Owner / Landlord Name' },
    { key: 'building_name', label: 'Building / Tower Name' },
    { key: 'project_fallback', label: 'Project / Secondary Building' },
    { key: 'unit_number', label: 'Unit / Apartment Number' },
    { key: 'rooms', label: 'Rooms / Bedrooms / Type' },
    { key: 'size', label: 'Size / Surface Area' },
    { key: 'area_en', label: 'Area / City / Community' },
    { key: 'email', label: 'Email Address' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#e1e1e1] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2a2a2a] pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#89c900]/15 text-[#d8e454] border border-[#89c900]/30 flex items-center gap-1.5">
                {provider === 'mistral-ai' ? 'Mistral AI Schema Mapped' : 'Smart Auto-Mapped'}
              </span>
              <span className="text-xs text-[#888888] font-medium truncate max-w-sm">
                File: <span className="text-gray-300">{fileName}</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">AI Property Importer</h2>
            <p className="text-xs text-[#888888] max-w-2xl leading-relaxed">{schema.explanation}</p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-[#777777] hover:text-white p-2 rounded-xl hover:bg-[#262626] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {/* Global Settings Row: Country Dial Code, Size Unit, Building Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#141414] border border-[#282828] p-4 rounded-2xl">
            <div>
              <label className="block text-xs font-medium text-[#aaaaaa] mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#888888]" />
                Default Country Code (for local phones)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#888888] font-medium bg-[#1e1e1e] px-3 py-2 rounded-xl border border-[#2e2e2e]">
                  +
                </span>
                <input
                  type="text"
                  placeholder="e.g. 971, 34, 1, 44 (or empty)"
                  value={schema.defaultDialCode}
                  onChange={e =>
                    setSchema(prev => ({ ...prev, defaultDialCode: e.target.value.replace(/\D/g, '') }))
                  }
                  className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#89c900] transition"
                />
              </div>
              <span className="text-[11px] text-[#666666] mt-1.5 block">
                Detected: {schema.inferredCountryName}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#aaaaaa] mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                Area Unit Conversion
              </label>
              <select
                value={schema.sizeUnit}
                onChange={e =>
                  setSchema(prev => ({ ...prev, sizeUnit: e.target.value as 'sqm' | 'sqft' }))
                }
                className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#89c900] transition cursor-pointer"
              >
                <option value="sqm">Square Meters (m²)</option>
                <option value="sqft">Square Feet (SqFt ➔ auto-converts to m²)</option>
              </select>
              <span className="text-[11px] text-[#666666] mt-1.5 block">
                Target storage: square meters
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#aaaaaa] mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#888888]" />
                Filter Specific Building (Optional)
              </label>
              <input
                type="text"
                list="csv-buildings-list"
                placeholder="Import all, or type e.g. BELGRAVIA SQUARE"
                value={buildingFilter}
                onChange={e => setBuildingFilter(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#89c900] transition"
              />
              <datalist id="csv-buildings-list">
                {availableBuildings.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <span className="text-[11px] text-[#666666] mt-1.5 block">
                Leave empty to import all buildings in file
              </span>
            </div>
          </div>

          {/* Column Mappings Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
              AI Detected Column Mapping
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mappingFields.map(field => {
                const selectedIdx = schema.mapping[field.key];
                return (
                  <div
                    key={field.key}
                    className="bg-[#222222] border border-[#2e2e2e] rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-[#383838] transition"
                  >
                    <label className="text-xs font-medium text-[#cccccc] flex items-center justify-between">
                      <span>{field.label}</span>
                      {field.required && (
                        <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/50 px-1.5 py-0.5 rounded font-medium">
                          Required
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedIdx !== null && selectedIdx !== undefined ? String(selectedIdx) : ''}
                      onChange={e => updateMapping(field.key, e.target.value)}
                      className="w-full bg-[#161616] border border-[#333333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#89c900] cursor-pointer"
                    >
                      <option value="">-- Not Mapped / Ignore --</option>
                      {columns.map((colName, idx) => (
                        <option key={idx} value={String(idx)}>
                          [{idx}] {colName || `(Column ${idx + 1})`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Extraction Preview */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#777777]">
                Live Data Preview (First 4 Valid Records)
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#89c900]/15 text-[#d8e454] border border-[#89c900]/30">
                  ✓ {mappedRows.length.toLocaleString()} valid properties ready
                </span>
                {skippedNoPhoneCount > 0 && (
                  <span className="text-[#666666]">
                    ({skippedNoPhoneCount.toLocaleString()} rows without phone skipped)
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#2a2a2a] bg-[#141414]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#1c1c1c] text-[#888888] border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-2.5 px-3.5 font-medium">Owner Name</th>
                    <th className="py-2.5 px-3.5 font-medium">Phone (E.164)</th>
                    <th className="py-2.5 px-3.5 font-medium">Building</th>
                    <th className="py-2.5 px-3.5 font-medium">Unit</th>
                    <th className="py-2.5 px-3.5 font-medium">Rooms</th>
                    <th className="py-2.5 px-3.5 font-medium">Size (m²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {mappedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#666666]">
                        No valid records match the current column mapping or filter.
                      </td>
                    </tr>
                  ) : (
                    mappedRows.slice(0, 4).map((r, i) => (
                      <tr key={i} className="hover:bg-[#1b1b1b] transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-white">{r.owner_name || '-'}</td>
                        <td className="py-2.5 px-3.5 text-blue-400 font-medium">{r.phone}</td>
                        <td className="py-2.5 px-3.5 text-[#cccccc]">{r.building_name}</td>
                        <td className="py-2.5 px-3.5 text-[#cccccc]">{r.unit_number || '-'}</td>
                        <td className="py-2.5 px-3.5 text-[#888888]">{r.rooms || '-'}</td>
                        <td className="py-2.5 px-3.5 text-[#888888]">{r.size_sqm ?? '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#2a2a2a] pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="px-5 py-2.5 rounded-xl bg-[#242424] hover:bg-[#2d2d2d] text-xs font-medium text-[#cccccc] hover:text-white transition cursor-pointer border border-[#333333]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={importing || mappedRows.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[#89c900] hover:bg-[#7bb700] active:bg-[#6fa500] disabled:opacity-40 text-gray-950 font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            {importing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-gray-950" />
                <span>{progressText || 'Importing...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-gray-950" />
                <span>Confirm &amp; Import {mappedRows.length.toLocaleString()} Properties</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
