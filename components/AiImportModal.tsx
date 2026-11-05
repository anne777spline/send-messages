'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Globe,
  Building2,
  Filter,
  ChevronDown,
  Check
} from 'lucide-react';
import type { DetectedSchema } from '@/app/api/import/detect-schema/route';

interface AiImportModalProps {
  isOpen: boolean;
  fileName: string;
  allCleanLines: string[];
  initialSchema: DetectedSchema;
  provider: string;
  isDark?: boolean;
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
  isDark = true,
  onClose,
  onImportSuccess
}: AiImportModalProps) {
  const [schema, setSchema] = useState<DetectedSchema>(initialSchema);
  const [buildingFilter, setBuildingFilter] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      <div
        className={`rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col border transition-colors ${
          isDark
            ? 'bg-[#1c1c1c] border-[#2e2e2e] text-[#e1e1e1]'
            : 'bg-white border-gray-200/90 text-gray-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between border-b pb-5 ${
            isDark ? 'border-[#2a2a2a]' : 'border-gray-100'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? 'bg-[#89c900]/15 text-[#d8e454] border-[#89c900]/30'
                    : 'bg-[#89c900]/15 text-gray-950 border-[#89c900]/40'
                }`}
              >
                {provider === 'mistral-ai' ? 'Mistral AI Schema Mapped' : 'Smart Auto-Mapped'}
              </span>
              <span className={`text-xs font-medium truncate max-w-sm ${isDark ? 'text-[#888888]' : 'text-gray-500'}`}>
                File: <span className={isDark ? 'text-gray-300' : 'text-gray-900 font-semibold'}>{fileName}</span>
              </span>
            </div>
            <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-950 font-pagani'}`}>
              AI Property Importer
            </h2>
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-[#888888]' : 'text-gray-600'}`}>
              {schema.explanation}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-[#777777] hover:text-white hover:bg-[#262626]'
                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="overflow-y-auto space-y-6 pr-1 flex-1">
          {/* Global Settings Row: Country Dial Code, Size Unit, Building Filter */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border transition-colors ${
              isDark
                ? 'bg-[#141414] border-[#282828]'
                : 'bg-gray-50/90 border-gray-200/80'
            }`}
          >
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                  isDark ? 'text-[#aaaaaa]' : 'text-gray-700'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${isDark ? 'text-[#888888]' : 'text-gray-400'}`} />
                Default Country Code (for local phones)
              </label>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-medium px-3 py-2 rounded-xl border ${
                    isDark
                      ? 'bg-[#1e1e1e] text-[#888888] border-[#2e2e2e]'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  +
                </span>
                <input
                  type="text"
                  placeholder="e.g. 971, 34, 1, 44"
                  value={schema.defaultDialCode}
                  onChange={e =>
                    setSchema(prev => ({ ...prev, defaultDialCode: e.target.value.replace(/\D/g, '') }))
                  }
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none transition ${
                    isDark
                      ? 'bg-[#1e1e1e] border-[#2e2e2e] text-white focus:border-[#89c900]'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-[#89c900] shadow-sm'
                  }`}
                />
              </div>
              <span className={`text-[11px] mt-1.5 block ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                Detected: {schema.inferredCountryName}
              </span>
            </div>

            {/* Custom Area Unit Dropdown */}
            <div className="relative">
              <label
                className={`block text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                  isDark ? 'text-[#aaaaaa]' : 'text-gray-700'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#888888]' : 'text-gray-400'}`} />
                Area Unit Conversion
              </label>
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'sizeUnit' ? null : 'sizeUnit')}
                className={`w-full rounded-xl px-3.5 py-2 text-xs flex justify-between items-center border transition focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-[#1e1e1e] border-[#2e2e2e] text-white hover:border-[#3a3a3a] focus:border-[#89c900]'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-[#89c900] shadow-sm'
                }`}
              >
                <span className="truncate">
                  {schema.sizeUnit === 'sqft'
                    ? 'Square Feet (SqFt ➔ auto-converts to m²)'
                    : 'Square Meters (m²)'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                    openDropdown === 'sizeUnit' ? 'rotate-180' : ''
                  } ${isDark ? 'text-[#888888]' : 'text-gray-400'}`}
                />
              </button>

              {openDropdown === 'sizeUnit' && (
                <div
                  className={`absolute top-full left-0 mt-1.5 w-full rounded-xl border shadow-2xl z-50 overflow-hidden py-1 ${
                    isDark ? 'bg-[#1e1e1e] border-[#333333]' : 'bg-white border-gray-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSchema(prev => ({ ...prev, sizeUnit: 'sqm' }));
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                      schema.sizeUnit === 'sqm'
                        ? isDark
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'bg-blue-50 text-blue-600 font-semibold'
                        : isDark
                        ? 'hover:bg-[#262626] text-white'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <span>Square Meters (m²)</span>
                    {schema.sizeUnit === 'sqm' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSchema(prev => ({ ...prev, sizeUnit: 'sqft' }));
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                      schema.sizeUnit === 'sqft'
                        ? isDark
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'bg-blue-50 text-blue-600 font-semibold'
                        : isDark
                        ? 'hover:bg-[#262626] text-white'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <span>Square Feet (SqFt ➔ auto-converts to m²)</span>
                    {schema.sizeUnit === 'sqft' && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                </div>
              )}
              <span className={`text-[11px] mt-1.5 block ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                Target storage: square meters
              </span>
            </div>

            <div>
              <label
                className={`block text-xs font-medium mb-1.5 flex items-center gap-1.5 ${
                  isDark ? 'text-[#aaaaaa]' : 'text-gray-700'
                }`}
              >
                <Filter className={`w-3.5 h-3.5 ${isDark ? 'text-[#888888]' : 'text-gray-400'}`} />
                Filter Specific Building (Optional)
              </label>
              <input
                type="text"
                list="csv-buildings-list"
                placeholder="Import all, or type e.g. BELGRAVIA SQUARE"
                value={buildingFilter}
                onChange={e => setBuildingFilter(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none transition ${
                  isDark
                    ? 'bg-[#1e1e1e] border-[#2e2e2e] text-white focus:border-[#89c900]'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-[#89c900] shadow-sm'
                }`}
              />
              <datalist id="csv-buildings-list">
                {availableBuildings.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <span className={`text-[11px] mt-1.5 block ${isDark ? 'text-[#666666]' : 'text-gray-500'}`}>
                Leave empty to import all buildings in file
              </span>
            </div>
          </div>

          {/* Column Mappings Grid with Custom Styled Dropdowns */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#777777]' : 'text-gray-500'}`}>
                Column Mapping (Select matching CSV header for each database field)
              </h3>
              <span className={`text-[11px] ${isDark ? 'text-[#888888]' : 'text-gray-500'}`}>
                Click any dropdown below to reassign or manually match columns
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mappingFields.map(field => {
                const selectedIdx = schema.mapping[field.key];
                const isOpen = openDropdown === field.key;
                const selectedColName =
                  selectedIdx !== null && selectedIdx !== undefined && columns[selectedIdx]
                    ? `[${selectedIdx}] ${columns[selectedIdx]}`
                    : '-- Not Mapped / Ignore --';

                return (
                  <div
                    key={field.key}
                    className={`rounded-2xl p-3 flex flex-col justify-between space-y-2 border transition relative ${
                      isDark
                        ? 'bg-[#222222] border-[#2e2e2e] hover:border-[#383838]'
                        : 'bg-white border-gray-200/90 shadow-sm hover:border-gray-300'
                    }`}
                  >
                    <label
                      className={`text-xs font-medium flex items-center justify-between ${
                        isDark ? 'text-[#cccccc]' : 'text-gray-800'
                      }`}
                    >
                      <span>{field.label}</span>
                      {field.required && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                            isDark
                              ? 'bg-red-950/80 text-red-400 border-red-800/50'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          Required
                        </span>
                      )}
                    </label>

                    {/* Custom Dropdown Trigger Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(isOpen ? null : field.key)}
                        className={`w-full rounded-xl px-3 py-2 text-xs flex justify-between items-center border transition focus:outline-none cursor-pointer text-left ${
                          isDark
                            ? 'bg-[#161616] border-[#333333] text-white hover:border-[#444444] focus:border-blue-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300 focus:border-blue-500'
                        }`}
                      >
                        <span
                          className={`truncate pr-2 ${
                            selectedIdx === null || selectedIdx === undefined
                              ? isDark
                                ? 'text-[#777777]'
                                : 'text-gray-400'
                              : 'font-medium'
                          }`}
                        >
                          {selectedColName}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          } ${isDark ? 'text-[#777777]' : 'text-gray-400'}`}
                        />
                      </button>

                      {/* Custom Dropdown List styled with dark scrollbars & active items */}
                      {isOpen && (
                        <div
                          className={`absolute top-full left-0 mt-1.5 w-full rounded-xl border shadow-2xl z-50 max-h-56 overflow-y-auto py-1 ${
                            isDark ? 'bg-[#1a1a1a] border-[#383838]' : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              updateMapping(field.key, '');
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                              selectedIdx === null || selectedIdx === undefined
                                ? isDark
                                  ? 'bg-blue-600/20 text-blue-400 font-semibold'
                                  : 'bg-blue-50 text-blue-600 font-semibold'
                                : isDark
                                ? 'hover:bg-[#252525] text-[#999999] hover:text-white'
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <span>-- Not Mapped / Ignore --</span>
                            {(selectedIdx === null || selectedIdx === undefined) && (
                              <Check className="w-3.5 h-3.5 text-blue-500" />
                            )}
                          </button>

                          {columns.map((colName, idx) => {
                            const isSelected = selectedIdx === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  updateMapping(field.key, String(idx));
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                                  isSelected
                                    ? isDark
                                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                                      : 'bg-blue-50 text-blue-600 font-semibold'
                                    : isDark
                                    ? 'hover:bg-[#252525] text-[#cccccc] hover:text-white'
                                    : 'hover:bg-gray-50 text-gray-800'
                                }`}
                              >
                                <span className="truncate pr-2">
                                  [{idx}] {colName || `(Column ${idx + 1})`}
                                </span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Extraction Preview */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#777777]' : 'text-gray-500'}`}>
                Live Data Preview (First 4 Valid Records)
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-[#89c900]/15 text-[#d8e454] border-[#89c900]/30'
                      : 'bg-[#89c900]/15 text-gray-950 border-[#89c900]/40'
                  }`}
                >
                  ✓ {mappedRows.length.toLocaleString()} valid properties ready
                </span>
                {skippedNoPhoneCount > 0 && (
                  <span className={isDark ? 'text-[#666666]' : 'text-gray-500'}>
                    ({skippedNoPhoneCount.toLocaleString()} rows without phone skipped)
                  </span>
                )}
              </div>
            </div>

            <div
              className={`overflow-x-auto rounded-2xl border transition-colors ${
                isDark ? 'border-[#2a2a2a] bg-[#141414]' : 'border-gray-200/90 bg-white shadow-sm'
              }`}
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead
                  className={`border-b font-medium ${
                    isDark
                      ? 'bg-[#1c1c1c] text-[#888888] border-[#2a2a2a]'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3.5">Owner Name</th>
                    <th className="py-2.5 px-3.5">Phone (E.164)</th>
                    <th className="py-2.5 px-3.5">Building</th>
                    <th className="py-2.5 px-3.5">Unit</th>
                    <th className="py-2.5 px-3.5">Rooms</th>
                    <th className="py-2.5 px-3.5">Size (m²)</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? 'divide-[#222222]' : 'divide-gray-100'
                  }`}
                >
                  {mappedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`py-8 text-center ${isDark ? 'text-[#666666]' : 'text-gray-400'}`}>
                        No valid records match the current column mapping or filter.
                      </td>
                    </tr>
                  ) : (
                    mappedRows.slice(0, 4).map((r, i) => (
                      <tr
                        key={i}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-[#1b1b1b]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className={`py-2.5 px-3.5 font-medium ${isDark ? 'text-white' : 'text-gray-950'}`}>
                          {r.owner_name || '-'}
                        </td>
                        <td className="py-2.5 px-3.5 text-blue-500 font-medium">{r.phone}</td>
                        <td className={`py-2.5 px-3.5 ${isDark ? 'text-[#cccccc]' : 'text-gray-700'}`}>
                          {r.building_name}
                        </td>
                        <td className={`py-2.5 px-3.5 ${isDark ? 'text-[#cccccc]' : 'text-gray-700'}`}>
                          {r.unit_number || '-'}
                        </td>
                        <td className={`py-2.5 px-3.5 ${isDark ? 'text-[#888888]' : 'text-gray-500'}`}>
                          {r.rooms || '-'}
                        </td>
                        <td className={`py-2.5 px-3.5 ${isDark ? 'text-[#888888]' : 'text-gray-500'}`}>
                          {r.size_sqm ?? '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                isDark
                  ? 'bg-red-950/40 border-red-800/50 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-end gap-3 border-t pt-5 ${
            isDark ? 'border-[#2a2a2a]' : 'border-gray-100'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className={`px-5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              isDark
                ? 'bg-[#242424] hover:bg-[#2d2d2d] text-[#cccccc] hover:text-white border-[#333333]'
                : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300 shadow-sm'
            }`}
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
};
