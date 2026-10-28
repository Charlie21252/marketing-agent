// Shared-password gate. The password lives in the APP_PASSWORD env variable;
// the browser keeps a hash of it in a cookie, never the password itself.
// Uses Web Crypto so it runs in both middleware (edge) and API routes (node).

export const AUTH_COOKIE = 'leadflow_auth'
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`leadflow-auth:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Compares two strings in constant time so the check doesn't leak how close a guess was. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
