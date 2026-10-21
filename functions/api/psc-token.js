// Cloudflare Pages Function — échange du code d'autorisation Pro Santé Connect.
// Le client_secret et le jeton d'accès ne quittent jamais le serveur : le jeton est conservé dans le
// KV (`DECL`, clé sess:*) pour sa durée de validité, et le navigateur ne reçoit qu'un cookie de
// session HttpOnly + le profil nécessaire à l'affichage.
//
// Variables d'environnement (Pages → Settings → Environment variables) :
//   PSC_CLIENT_ID, PSC_CLIENT_SECRET            (obligatoires)
//   PSC_TOKEN_ENDPOINT, PSC_USERINFO_ENDPOINT   (défaut : bac à sable ANS)
//   PSC_ALLOWED_REDIRECTS                       (liste séparée par des virgules)
import { professionCodes, categoryFor, DEFAULT_ALLOWED_PROFESSIONS } from '../_lib/decl-schema.js';
import { json, sameOrigin, sessionCookie, randomId } from '../_lib/http.js';

const DEFAULT_TOKEN = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/token';
const DEFAULT_USERINFO = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json(403, { error: 'forbidden' });
  if (!env.PSC_CLIENT_ID || !env.PSC_CLIENT_SECRET || !env.DECL) {
    return json(503, { error: 'service_unavailable', message: 'Connexion Pro Santé Connect indisponible pour le moment.' });
  }
  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'invalid_request' }); }
  const { code, code_verifier, redirect_uri } = body || {};
  if (!code || !code_verifier || !redirect_uri) return json(400, { error: 'invalid_request' });

  const allowed = (env.PSC_ALLOWED_REDIRECTS || `${new URL(request.url).origin}/psc-callback.html`).split(',').map(s => s.trim());
  if (!allowed.includes(redirect_uri)) return json(400, { error: 'invalid_request' });

  const tokenResp = await fetch(env.PSC_TOKEN_ENDPOINT || DEFAULT_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri, code_verifier,
      client_id: env.PSC_CLIENT_ID, client_secret: env.PSC_CLIENT_SECRET,
    }),
  });
  if (!tokenResp.ok) return json(401, { error: 'authentication_failed' });
  const tokens = await tokenResp.json();

  const infoResp = await fetch(env.PSC_USERINFO_ENDPOINT || DEFAULT_USERINFO, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!infoResp.ok) return json(401, { error: 'authentication_failed' });
  const info = await infoResp.json();
  const ex = Array.isArray(info?.SubjectRefPro?.exercices) ? info.SubjectRefPro.exercices[0] : null;

  const ttl = Math.min(3600, Math.max(60, Number(tokens.expires_in) || 300));
  const sid = randomId();
  await env.DECL.put(`sess:${sid}`, JSON.stringify({ token: tokens.access_token, exp: Date.now() + ttl * 1000 }), { expirationTtl: Math.max(60, ttl) });

  // Le navigateur ne reçoit que le strict nécessaire à l'affichage (ni jeton, ni RPPS)
  return json(200, {
    expires_in: ttl,
    professional: {
      displayName: [ex?.prenomDexercice || info.given_name, ex?.nomDexercice || info.family_name].filter(Boolean).join(' '),
      professionCodes: professionCodes(info),
      // Catégorie de signalement autorisée (clinical | field | null) — revérifiée côté serveur à chaque envoi
      category: categoryFor(professionCodes(info), (env.PSC_ALLOWED_PROFESSIONS || DEFAULT_ALLOWED_PROFESSIONS.join(',')).split(',').map(s => s.trim())),
      specialtyCode: ex?.codeSavoirFaire || null,
    },
  }, { 'Set-Cookie': sessionCookie(sid, ttl) });
}
