const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const AGENCY_EMAIL = 'lbdevelopers.agency@gmail.com';
export const publicApiEnabled = import.meta.env.DEV
  || import.meta.env.VITE_PUBLIC_API_ENABLED === 'true'
  || Boolean(API_BASE_URL);

const requestsInFlight = new Map<string, Promise<unknown>>();
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();
const REQUEST_TIMEOUT_MS = 8_000;
const MEMORY_CACHE_MS = 30_000;

const requestUrl = (url: string) => API_BASE_URL && url.startsWith('/api/') ? `${API_BASE_URL}${url}` : url;

export async function cachedPublicFetch<T>(url: string, cacheKey: string, fallback: T): Promise<T> {
  if (url.startsWith('/api/') && !publicApiEnabled) return fallback;
  const key = `${url}::${cacheKey}`;
  const cached = memoryCache.get(key);
  if (cached?.expiresAt && cached.expiresAt > Date.now()) return cached.value as T;
  if (cached) memoryCache.delete(key);
  const active = requestsInFlight.get(key) as Promise<T> | undefined;
  if (active) return active;

  const request = (async () => {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(requestUrl(url), { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json() as T;
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* optional */ }
      return data;
    } catch {
      try {
        const persisted = localStorage.getItem(cacheKey);
        return persisted ? JSON.parse(persisted) as T : fallback;
      } catch {
        return fallback;
      }
    } finally {
      globalThis.clearTimeout(timeout);
    }
  })();

  requestsInFlight.set(key, request);
  try {
    const result = await request;
    memoryCache.set(key, { value: result, expiresAt: Date.now() + MEMORY_CACHE_MS });
    return result;
  } finally {
    if (requestsInFlight.get(key) === request) requestsInFlight.delete(key);
  }
}
