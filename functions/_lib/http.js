// Utilitaires communs aux Pages Functions : réponses JSON, contrôle d'origine, session PSC en cookie.
export const SESSION_COOKIE = 'biq_psc';

export const json = (status, body, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
});

// Les POST ne sont acceptés que depuis l'origine du site (protection CSRF complémentaire au SameSite)
export function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

export function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

export function sessionCookie(id, maxAge) {
  return `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function randomId() {
  const a = new Uint8Array(32); crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}
