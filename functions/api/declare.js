// Cloudflare Pages Function — réception d'un signalement.
// Exigences : session Pro Santé Connect (cookie HttpOnly → jeton conservé côté serveur, revérifié
// auprès de l'ANS à chaque appel), profession autorisée (elle détermine la catégorie : suspicion
// clinique ou signal de terrain), charge utile strictement validée, pseudonymisation du déclarant,
// limitation de débit. Les suspicions à haut risque sont refusées : appel 15 + ARS.
// Stockage : KV binding `DECL`, suppression automatique après 120 jours.
// La limitation de débit KV n'est pas atomique : la compléter par une règle WAF Cloudflare sur /api/*.
import { validateDeclaration, professionCodes, categoryFor, isHighConsequence, DEFAULT_ALLOWED_PROFESSIONS } from '../_lib/decl-schema.js';
import { json, sameOrigin, readCookie, SESSION_COOKIE } from '../_lib/http.js';

const DEFAULT_USERINFO = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo';
const TTL_SECONDS = 120 * 24 * 3600;
const MAX_PER_DAY = 20;
const MAX_PER_IP_PER_HOUR = 30;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function bump(kv, key, ttl) {
  const used = Number(await kv.get(key)) || 0;
  await kv.put(key, String(used + 1), { expirationTtl: ttl });
  return used + 1;
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json(403, { error: 'forbidden' });
  if (!env.DECL || !env.DECL_SALT) return json(503, { error: 'service_unavailable', message: 'Signalement indisponible pour le moment.' });

  // Limite par adresse IP (hachée) avant tout appel à l'ANS
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const hour = new Date().toISOString().slice(0, 13);
  const ipKey = `rateip:${(await sha256Hex(`${env.DECL_SALT}|ip|${ip}`)).slice(0, 24)}:${hour}`;
  if (await bump(env.DECL, ipKey, 7200) > MAX_PER_IP_PER_HOUR) return json(429, { error: 'rate_limited' });

  const sid = readCookie(request, SESSION_COOKIE);
  const sess = sid ? JSON.parse((await env.DECL.get(`sess:${sid}`)) || 'null') : null;
  if (!sess?.token || sess.exp <= Date.now()) return json(401, { error: 'psc_required', message: 'Session Pro Santé Connect absente ou expirée.' });

  // Vérification du jeton auprès de l'ANS — jamais de confiance au seul contenu côté client
  const infoResp = await fetch(env.PSC_USERINFO_ENDPOINT || DEFAULT_USERINFO, { headers: { Authorization: `Bearer ${sess.token}` } });
  if (!infoResp.ok) return json(401, { error: 'psc_required' });
  const info = await infoResp.json();

  const allowed = (env.PSC_ALLOWED_PROFESSIONS || DEFAULT_ALLOWED_PROFESSIONS.join(',')).split(',').map(s => s.trim());
  const category = categoryFor(professionCodes(info), allowed);
  if (!category) return json(403, { error: 'profession_not_allowed' });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'invalid_declaration' }); }
  const v = validateDeclaration(body, category);
  if (!v.ok) return json(400, { error: 'invalid_declaration', fields: v.errors });
  if (isHighConsequence(v.value)) return json(422, { error: 'call_15_now' });

  const subject = String(info.sub || info.SubjectNameID || '');
  if (!subject) return json(401, { error: 'psc_required' });
  const pseudo = (await sha256Hex(`${env.DECL_SALT}|${subject}`)).slice(0, 24);

  const day = new Date().toISOString().slice(0, 10);
  if (await bump(env.DECL, `rate:${pseudo}:${day}`, 2 * 24 * 3600) > MAX_PER_DAY) return json(429, { error: 'rate_limited' });

  const id = crypto.randomUUID();
  const record = { ...v.value, id, declarant: pseudo, ts: Date.now() };
  await env.DECL.put(`decl:${v.value.week}:${id}`, JSON.stringify(record), { expirationTtl: TTL_SECONDS });

  return json(201, { ok: true, id, week: v.value.week, category });
}
