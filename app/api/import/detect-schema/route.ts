import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';

export interface DetectedSchema {
  headerRowIndex: number;
  columns: string[];
  mapping: {
    phone: number | null;
    owner_name: number | null;
    email: number | null;
    building_name: number | null;
    project_fallback: number | null;
    unit_number: number | null;
    rooms: number | null;
    size: number | null;
    plot_number: number | null;
    land_number: number | null;
    area_en: number | null;
  };
  sizeUnit: 'sqm' | 'sqft';
  roleFilter: {
    columnIndex: number | null;
    allowedValues: string[];
  };
  inferredCountryName: string;
  defaultDialCode: string;
  defaultBuildingName: string;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

function parseCSVLine(text: string): string[] {
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

function buildFallbackSchema(sampleLines: string[], fileName: string): DetectedSchema {
  // Find the first line that looks like a real header (at least 3 non-empty cells)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(sampleLines.length, 4); i++) {
    const cells = parseCSVLine(sampleLines[i]).filter(Boolean);
    if (cells.length >= 3) {
      headerRowIndex = i;
      break;
    }
  }

  const columns = parseCSVLine(sampleLines[headerRowIndex] || '');
  const lowerCols = columns.map(c => c.toLowerCase().trim());

  const findCol = (patterns: RegExp[]): number | null => {
    for (const pat of patterns) {
      const idx = lowerCols.findIndex(c => pat.test(c));
      if (idx !== -1) return idx;
    }
    return null;
  };

  const phone = findCol([
    /mobile|phone|tel|celular|movil|móvil|whatsapp|contact.*number|owner.*number|téléphone|telefone|handy/i
  ]);
  const owner_name = findCol([
    /owner.*name|name.*en|propietario|titular|owner|buyer|landlord|client|nombre|nom|propriétaire|eigentümer/i
  ]);
  const email = findCol([/email|e-mail|correo|mail/i]);
  const building_name = findCol([
    /building.*name|building\/villa|building|edificio|torre|condominio|complex|immeuble|residence|property.*name/i
  ]);
  const project_fallback = findCol([/^project$|master.*project|proyecto|desarrollo|development/i]);
  const unit_number = findCol([
    /unit.*no|unit.*number|unit|apto|apartamento|depto|piso|puerta|flat|suite|villa.*no/i
  ]);
  const rooms = findCol([/rooms|bedrooms|beds|habitaciones|dormitorios|recamaras|recámaras|pièces|zimmer|property.*type/i]);
  const size = findCol([/size|area.*sqm|area.*sqft|sqm|sqft|superficie|metraje|m2|metros/i]);
  const plot_number = findCol([/plot|parcel|catastro/i]);
  const land_number = findCol([/land.*no|land.*number|municipality/i]);
  const area_en = findCol([/^area|area.*en|city|district|zona|barrio|ciudad|location|master.*project/i]);
  const roleCol = findCol([/party.*type|procedure.*party|role|tipo.*parte|rol/i]);

  const cleanFileName = fileName
    .replace(/\.csv$/i, '')
    .replace(/\(sheet\d*\)/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  return {
    headerRowIndex,
    columns,
    mapping: {
      phone,
      owner_name,
      email,
      building_name,
      project_fallback,
      unit_number,
      rooms,
      size,
      plot_number,
      land_number,
      area_en
    },
    sizeUnit: lowerCols.some(c => /sqft|sq\.?\s*ft|feet/i.test(c)) ? 'sqft' : 'sqm',
    roleFilter: {
      columnIndex: roleCol,
      allowedValues: roleCol !== null ? ['Buyer', 'Owner', 'Landlord', 'Comprador', 'Propietario'] : []
    },
    inferredCountryName: 'Global / Auto',
    defaultDialCode: '',
    defaultBuildingName: cleanFileName || 'Imported Building',
    confidence: 'medium',
    explanation: 'Detected using smart heuristic column matching.'
  };
}

export async function POST(request: Request) {
  try {
    await getAuthenticatedTenant();
  } catch (e) {
    if (isAuthError(e)) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sampleLines: string[] = Array.isArray(body.sampleLines) ? body.sampleLines.slice(0, 10) : [];
    const fileName: string = body.fileName || 'properties.csv';

    if (sampleLines.length === 0) {
      return NextResponse.json({ success: false, error: 'No sample lines provided.' }, { status: 400 });
    }

    const fallback = buildFallbackSchema(sampleLines, fileName);
    const mistralKey = process.env.MISTRAL_API_KEY;

    if (!mistralKey) {
      return NextResponse.json({ success: true, schema: fallback, provider: 'heuristic' });
    }

    // Prepare structured sample for Mistral AI
    const parsedSample = sampleLines.map((line, idx) => ({
      rowIndex: idx,
      cells: parseCSVLine(line).map((cell, cIdx) => `[${cIdx}] ${cell}`)
    }));

    const systemPrompt = `You are an expert global real estate data ingestion AI for a multi-tenant PropTech SaaS used worldwide.
Your job is to inspect the first few rows of a user-uploaded CSV file (in ANY language: English, Spanish, French, Portuguese, Arabic, German, Russian, etc.) and return a JSON object mapping the CSV column indices to our database schema.

Our database table 'properties' has these target fields:
- phone (REQUIRED: mobile/telephone/WhatsApp number of the property owner/buyer)
- owner_name (Full name of the owner, landlord, or buyer)
- email (Email address if present, otherwise null)
- building_name (Name of the building, tower, condominium, residence, or sub-project)
- project_fallback (Secondary column for project/development name if building_name is empty or generic)
- unit_number (Apartment, unit, flat, suite, puerta, or villa number)
- rooms (Number of bedrooms/rooms or unit layout like Studio, 1BR, 2, etc.)
- size (Property area/surface numeric value)
- plot_number (Plot or parcel identifier if present)
- land_number (Land or registration number if present)
- area_en (District, neighborhood, city, or master community name)

Carefully check:
1. "headerRowIndex": Sometimes row 0 is a title banner (e.g. "JVC,,,,") and row 1 is the actual header row. Identify the exact 0-based rowIndex of the header row.
2. "roleFilter": Some government/registry exports (like DLD or land registries) list both "Seller" (developer) and "Buyer" (actual current owner) on separate rows. If there is a column indicating party role (e.g., ProcedurePartyTypeNameEn, Party Type, Rol), set "columnIndex" to that column's index and "allowedValues" to ["Buyer", "Owner", "Landlord", "Comprador", "Propietario", "Purchaser"]. Otherwise set "columnIndex": null and "allowedValues": [].
3. "sizeUnit": Set to "sqft" if the header or values clearly indicate square feet, otherwise "sqm".
4. "inferredCountryName" & "defaultDialCode": Infer the country from location names, project names, or phone numbers (e.g., Dubai/JVC -> "United Arab Emirates" and defaultDialCode "971"; Spain -> "34"; USA -> "1"; UK -> "44"; Mexico -> "52"). Use digits only for defaultDialCode (no + sign). If international/mixed, use "".
5. "defaultBuildingName": Clean human-readable building name inferred from the filename "${fileName}" or sample rows in case a row has no building name.

Return ONLY a valid JSON object matching this exact structure:
{
  "headerRowIndex": number,
  "mapping": {
    "phone": number | null,
    "owner_name": number | null,
    "email": number | null,
    "building_name": number | null,
    "project_fallback": number | null,
    "unit_number": number | null,
    "rooms": number | null,
    "size": number | null,
    "plot_number": number | null,
    "land_number": number | null,
    "area_en": number | null
  },
  "sizeUnit": "sqm" | "sqft",
  "roleFilter": {
    "columnIndex": number | null,
    "allowedValues": string[]
  },
  "inferredCountryName": string,
  "defaultDialCode": string,
  "defaultBuildingName": string,
  "confidence": "high" | "medium" | "low",
  "explanation": string
}`;

    const userPrompt = `File Name: "${fileName}"
Sample CSV Rows (with 0-based column indices in brackets):
${JSON.stringify(parsedSample, null, 2)}`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mistralKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      console.warn('Mistral API non-200 status:', response.status);
      return NextResponse.json({ success: true, schema: fallback, provider: 'heuristic_fallback' });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ success: true, schema: fallback, provider: 'heuristic_fallback' });
    }

    const parsedAI = JSON.parse(rawContent);
    const headerIdx =
      typeof parsedAI.headerRowIndex === 'number' &&
      parsedAI.headerRowIndex >= 0 &&
      parsedAI.headerRowIndex < sampleLines.length
        ? parsedAI.headerRowIndex
        : fallback.headerRowIndex;

    const columns = parseCSVLine(sampleLines[headerIdx] || '');

    const finalSchema: DetectedSchema = {
      headerRowIndex: headerIdx,
      columns,
      mapping: {
        phone: parsedAI.mapping?.phone ?? fallback.mapping.phone,
        owner_name: parsedAI.mapping?.owner_name ?? fallback.mapping.owner_name,
        email: parsedAI.mapping?.email ?? fallback.mapping.email,
        building_name: parsedAI.mapping?.building_name ?? fallback.mapping.building_name,
        project_fallback: parsedAI.mapping?.project_fallback ?? fallback.mapping.project_fallback,
        unit_number: parsedAI.mapping?.unit_number ?? fallback.mapping.unit_number,
        rooms: parsedAI.mapping?.rooms ?? fallback.mapping.rooms,
        size: parsedAI.mapping?.size ?? fallback.mapping.size,
        plot_number: parsedAI.mapping?.plot_number ?? fallback.mapping.plot_number,
        land_number: parsedAI.mapping?.land_number ?? fallback.mapping.land_number,
        area_en: parsedAI.mapping?.area_en ?? fallback.mapping.area_en
      },
      sizeUnit: parsedAI.sizeUnit === 'sqft' ? 'sqft' : 'sqm',
      roleFilter: {
        columnIndex:
          typeof parsedAI.roleFilter?.columnIndex === 'number' ? parsedAI.roleFilter.columnIndex : null,
        allowedValues: Array.isArray(parsedAI.roleFilter?.allowedValues)
          ? parsedAI.roleFilter.allowedValues
          : []
      },
      inferredCountryName: parsedAI.inferredCountryName || fallback.inferredCountryName,
      defaultDialCode: String(parsedAI.defaultDialCode || '').replace(/\D/g, ''),
      defaultBuildingName: parsedAI.defaultBuildingName || fallback.defaultBuildingName,
      confidence: parsedAI.confidence || 'high',
      explanation: parsedAI.explanation || 'Columns automatically mapped by Mistral AI.'
    };

    return NextResponse.json({ success: true, schema: finalSchema, provider: 'mistral-ai' });
  } catch (err: any) {
    console.error('Error in detect-schema:', err);
    return NextResponse.json({ success: false, error: err.message || 'Schema detection failed' }, { status: 500 });
  }
}
