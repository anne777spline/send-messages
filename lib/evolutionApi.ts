const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const TIMEOUT_MS = 10_000; // 10 segundos

if (!EVOLUTION_URL || !EVOLUTION_KEY) {
  console.error('[EvolutionAPI] Missing EVOLUTION_API_URL or EVOLUTION_API_KEY');
}

export class EvolutionApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'EvolutionApiError';
  }
}

function evolutionHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: EVOLUTION_KEY!,
  };
}

async function evolutionFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new EvolutionApiError('Evolution API request timed out', 504);
    }
    throw new EvolutionApiError(`Evolution API network error: ${err.message}`, 503);
  } finally {
    clearTimeout(timeout);
  }
}

async function parseEvolutionResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok) {
    throw new EvolutionApiError(
      `Evolution API responded with ${res.status}`,
      res.status,
      body
    );
  }

  return body;
}

/**
 * Obtiene el estado de conexión de una instancia.
 * Devuelve null si la instancia no existe (404).
 * Lanza EvolutionApiError para otros errores HTTP o de red.
 */
export async function getInstanceStatus(instanceName: string): Promise<unknown | null> {
  const res = await evolutionFetch(
    `${EVOLUTION_URL}/instance/connectionState/${instanceName}`,
    { headers: evolutionHeaders() }
  );

  if (res.status === 404) return null;
  return parseEvolutionResponse(res);
}

/**
 * Crea una nueva instancia con QR code habilitado.
 * Lanza EvolutionApiError si falla.
 */
export async function createInstance(instanceName: string): Promise<any> {
  const res = await evolutionFetch(`${EVOLUTION_URL}/instance/create`, {
    method: 'POST',
    headers: evolutionHeaders(),
    body: JSON.stringify({ instanceName, qrcode: true }),
  });
  return parseEvolutionResponse(res);
}

/**
 * Solicita un nuevo QR para reconectar una instancia existente.
 * Lanza EvolutionApiError si falla.
 */
export async function fetchInstanceQR(instanceName: string): Promise<any> {
  const res = await evolutionFetch(
    `${EVOLUTION_URL}/instance/connect/${instanceName}`,
    { headers: evolutionHeaders() }
  );
  return parseEvolutionResponse(res);
}

/**
 * Elimina una instancia (usado en estado 'error' para recrear).
 * Lanza EvolutionApiError si falla.
 */
export async function deleteInstance(instanceName: string): Promise<any> {
  const res = await evolutionFetch(
    `${EVOLUTION_URL}/instance/delete/${instanceName}`,
    { method: 'DELETE', headers: evolutionHeaders() }
  );
  return parseEvolutionResponse(res);
}
