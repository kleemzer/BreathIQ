// Cloudflare Pages Function — réception d'une déclaration syndromique.
// Exigences : jeton Pro Santé Connect valide (vérifié auprès de l'ANS à chaque appel), profession
// autorisée, charge utile strictement validée (listes fermées), pseudonymisation du déclarant,
// limitation de débit. Stockage : KV binding `DECL` (TTL 120 jours).
import { validateDeclaration, isAllowedProfessional, DEFAULT_ALLOWED_PROFESSIONS } from '../_lib/decl-schema.js';

const DEFAULT_USERINFO = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo';
const TTL_SECONDS = 120 * 24 * 3600;
const MAX_PER_DAY = 20;

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.DECL) return json(503, { error: 'storage_not_configured', message: 'KV binding DECL manquant.' });
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json(401, { error: 'psc_required', message: 'Authentification Pro Santé Connect requise.' });

  // Vérification du jeton auprès de l'ANS — jamais de confiance au seul contenu du JWT côté client
  const infoResp = await fetch(env.PSC_USERINFO_ENDPOINT || DEFAULT_USERINFO, { headers: { Authorization: `Bearer ${token}` } });
  if (!infoResp.ok) return json(401, { error: 'psc_invalid_token' });
  const info = await infoResp.json();

  const allowed = (env.PSC_ALLOWED_PROFESSIONS || DEFAULT_ALLOWED_PROFESSIONS.join(',')).split(',').map(s => s.trim());
  if (!isAllowedProfessional(info, allowed)) return json(403, { error: 'profession_not_allowed' });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'invalid_json' }); }
  const v = validateDeclaration(body);
  if (!v.ok) return json(400, { error: 'invalid_declaration', fields: v.errors });

  // Pseudonyme stable du déclarant (sel serveur) : limite de débit et dédoublonnage sans identifier
  const subject = String(info.sub || info.SubjectNameID || '');
  if (!subject) return json(401, { error: 'psc_no_subject' });
  const pseudo = (await sha256Hex(`${env.DECL_SALT || 'breathiq'}|${subject}`)).slice(0, 24);

  const day = new Date().toISOString().slice(0, 10);
  const rateKey = `rate:${pseudo}:${day}`;
  const used = Number(await env.DECL.get(rateKey)) || 0;
  if (used >= MAX_PER_DAY) return json(429, { error: 'rate_limited' });
  await env.DECL.put(rateKey, String(used + 1), { expirationTtl: 2 * 24 * 3600 });

  const id = crypto.randomUUID();
  const record = { ...v.value, id, declarant: pseudo, ts: Date.now() };
  await env.DECL.put(`decl:${v.value.week}:${id}`, JSON.stringify(record), { expirationTtl: TTL_SECONDS });

  return json(201, { ok: true, id, week: v.value.week });
}
