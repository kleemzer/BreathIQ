// Cloudflare Pages Function — fin de session Pro Santé Connect (suppression du jeton côté serveur).
import { json, sameOrigin, readCookie, sessionCookie, SESSION_COOKIE } from '../_lib/http.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json(403, { error: 'forbidden' });
  const sid = readCookie(request, SESSION_COOKIE);
  if (sid && env.DECL) await env.DECL.delete(`sess:${sid}`);
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
}
