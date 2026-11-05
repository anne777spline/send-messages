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
  const dataRows = sampleLines.slice(headerRowIndex + 1).map(line => parseCSVLine(line));

  const findCol = (
    headerPatterns: RegExp[],
    excludePatterns: RegExp[] = [],
    valueValidator?: (val: string) => boolean
  ): number | null => {
    // 1. Direct match with header and negative pattern filtering
    for (let c = 0; c < lowerCols.length; c++) {
      const colHeader = lowerCols[c];
      if (excludePatterns.some(ex => ex.test(colHeader))) continue;
      if (headerPatterns.some(pat => pat.test(colHeader))) {
        if (!valueValidator) return c;
        // Verify against sample values
        const sampleVals = dataRows.map(row => (row[c] || '').trim()).filter(Boolean);
        if (sampleVals.length === 0 || sampleVals.some(v => valueValidator(v))) {
          return c;
        }
      }
    }
    return null;
  };

  // Negative patterns for countries/nationalities to never confuse with owner_name
  const nationalityHeaderPat = /nationality|nacionalidad|citizenship|country|país|pais/i;
  const areaHeaderPat = /^area$|area\s*en|master\s*project|district|city|location|comunidad/i;

  const phone = findCol(
    [/mobile|phone|tel|celular|movil|móvil|whatsapp|contact.*number|owner.*number|téléphone|telefone|handy/i],
    [/fax|passport|birth/i],
    val => /\d{5,}/.test(val)
  );

  // Specific building/tower name (priority to exact building name headers, excluding numeric/ID/district columns)
  const building_name =
    findCol(
      [/building.*name|edificio.*nombre|nom.*immeuble|property.*name/i],
      [/no$|number$|id$|area|project|master/i]
    ) ??
    findCol(
      [/building\/villa|building|edificio|torre|condominio|complex|immeuble|residence/i],
      [/no$|number$|id$|code$|area/i, /master.*project/i, /room/i, /bed/i, /unit/i]
    );

  // Buyer/Owner full human name (must exclude building/project/property names, party roles, and nationalities)
  const owner_name =
    findCol(
      [/owner.*name|titular|^owner$|^buyer$|^landlord$|^client$|^nombre$|^nom$|propriétaire|eigentümer/i],
      [nationalityHeaderPat, /company/i, /developer/i, /agent/i, /broker/i, /building/i, /project/i, /property/i, /party/i]
    ) ??
    findCol(
      [/name.*en|^name$|^nombre_completo$|full.*name/i],
      [nationalityHeaderPat, /company/i, /developer/i, /agent/i, /broker/i, /building/i, /project/i, /property/i, /country/i, /procedure/i, /party/i]
    );

  const email = findCol([/email|e-mail|correo|mail/i]);

  const project_fallback = findCol(
    [/^project$|master.*project|proyecto|desarrollo|development/i],
    [/unit/i, /room/i]
  );

  const unit_number = findCol(
    [/unit.*no|unit.*number|^unit$|apto|apartamento|depto|piso|puerta|flat|suite|villa.*no/i],
    [/rooms/i, /bedrooms/i, /type/i, /building/i, /area/i]
  );

  const rooms =
    findCol(
      [/^beds$|^bedrooms$|^rooms$|^bed$|^dormitorios$|^recamaras$|^habitaciones$/i],
      [/building/i, /project/i, /area/i, /name/i, /mobile/i, /phone/i, /unit/i]
    ) ??
    findCol(
      [/property.*type|sub.*type|^type$/i],
      [/building/i, /project/i, /area/i, /name/i, /mobile/i, /phone/i, /unit/i]
    );

  const size = findCol(
    [/^size$|area.*sqm|area.*sqft|sqm|sqft|superficie|metraje|m2|metros/i],
    [/master/i, /^area$/i, /building/i]
  );

  const plot_number = findCol([/plot|parcel|catastro/i]);
  const land_number = findCol([/land.*no|land.*number|municipality/i]);
  const area_en = findCol([areaHeaderPat]);
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
- phone (REQUIRED: mobile/telephone/WhatsApp number of the property owner/buyer. Must be a contact phone column, NEVER a plot or land number).
- owner_name (REQUIRED: Full name of the human person or company owner/buyer/landlord. NEVER map a "Nationality", "Citizenship", "Country" or "Passport" column to owner_name!).
- email (Email address if present, otherwise null)
- building_name (Name of the specific building or tower, e.g., "LUMA PARK VIEWS", "ABJAR TOWER", "BLOOM TOWERS A". NEVER map a broad city district, neighborhood or master community like "Jumeirah Village Circle", "JVC", "Downtown", "Al Barsha" to building_name; those belong to area_en!).
- project_fallback (Secondary column for project/development name if building_name is empty or generic)
- unit_number (Apartment, unit, flat, suite, or villa number, e.g. "101", "204", "1A")
- rooms (Number of bedrooms/rooms or unit layout like "Studio", "1BR", "1", "2", "3", "Office", "Retail", "Penthouse". NEVER map a building or tower name to rooms!).
- size (Property area/surface numeric value in sqm or sqft)
- plot_number (Plot or parcel identifier if present)
- land_number (Land or registration number if present)
- area_en (District, neighborhood, city, or master community name, e.g. "Jumeirah Village Circle", "JVC", "Business Bay", "Downtown Dubai", "Al Barsha", "Dubai Marina")

Strict Anti-Confusion Rules:
1. "building_name" vs "area_en":
   - "Jumeirah Village Circle", "JVC", "Al Barsha", "Business Bay", "Downtown" are master communities/districts -> ALWAYS area_en.
   - Specific residential/commercial buildings like "LUMA PARK VIEWS", "ABJAR TOWER", "BINGHATTI EMERALD", "GHALIA" -> ALWAYS building_name.
2. "rooms" vs "building_name":
   - "rooms" is ONLY for bedroom counts (1, 2, 3) or unit typologies (Studio, 1BR, 2BR, Penthouse, Office, Retail, Apartment). If a column contains building names (e.g., "LUMA PARK VIEWS"), it is NEVER rooms!
3. "owner_name" vs "nationality":
   - If a column contains country names like "Egypt", "Russian Federation", "KYRGYZ REPUBLIC", "Lebanon", "United Kingdom", that column is Nationality, NOT owner_name! Map owner_name to the actual person's name column (e.g. "NameEn", "Owner Name", "Client Name", "Purchaser Name").
4. "headerRowIndex": Sometimes row 0 is a title banner (e.g. "JVC,,,,") and row 1 is the actual header row. Identify the exact 0-based rowIndex of the header row.
5. "roleFilter": If there is a column indicating party role (e.g., ProcedurePartyTypeNameEn, Party Type, Rol), set "columnIndex" to that column's index and "allowedValues" to ["Buyer", "Owner", "Landlord", "Comprador", "Propietario", "Purchaser"]. Otherwise set "columnIndex": null and "allowedValues": [].
6. "sizeUnit": Set to "sqft" if the header or values clearly indicate square feet, otherwise "sqm".
7. "inferredCountryName" & "defaultDialCode": Infer the country from location names, project names, or phone numbers (e.g., Dubai/JVC -> "United Arab Emirates" and defaultDialCode "971"). Use digits only for defaultDialCode (no + sign).
8. "defaultBuildingName": Clean human-readable building name inferred from the filename "${fileName}" or sample rows in case a row has no building name.

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
