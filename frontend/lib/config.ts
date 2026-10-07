/** Backend origin for SSR and when NEXT_PUBLIC_API_URL is set. */
const FALLBACK_API = "http://127.0.0.1:8000";

/**
 * API base URL.
 * - If NEXT_PUBLIC_API_URL is set → use it (production / explicit override).
 * - In the browser otherwise → same-origin "" so Next.js rewrites proxy to the backend (avoids CORS / Private Network Access errors).
 * - On the server otherwise → direct backend URL.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "";
  return FALLBACK_API;
}

export function getBackendOrigin(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || FALLBACK_API;
}
