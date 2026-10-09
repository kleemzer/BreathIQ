// Cloudflare Pages Function — échange du code d'autorisation Pro Santé Connect.
// Le client_secret ne quitte jamais le serveur ; le navigateur reçoit un access_token à durée
// courte et le profil professionnel (userinfo lu ici, côté serveur).
//
// Variables d'environnement (Pages → Settings → Environment variables) :
//   PSC_CLIENT_ID, PSC_CLIENT_SECRET            (obligatoires)
//   PSC_TOKEN_ENDPOINT, PSC_USERINFO_ENDPOINT   (défaut : bac à sable ANS)
//   PSC_ALLOWED_REDIRECTS                       (liste séparée par des virgules)
import { professionCodes, categoryFor, DEFAULT_ALLOWED_PROFESSIONS } from '../_lib/decl-schema.js';

const DEFAULT_TOKEN = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/token';
const DEFAULT_USERINFO = 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo';

const json = (status, body) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  if (!env.PSC_CLIENT_ID || !env.PSC_CLIENT_SECRET) {
    return json(503, { error: 'psc_not_configured', message: 'Raccordement Pro Santé Connect non configuré sur ce déploiement.' });
  }
  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'invalid_json' }); }
  const { code, code_verifier, redirect_uri } = body || {};
  if (!code || !code_verifier || !redirect_uri) return json(400, { error: 'missing_parameters' });

  const allowed = (env.PSC_ALLOWED_REDIRECTS || `${new URL(request.url).origin}/psc-callback.html`).split(',').map(s => s.trim());
  if (!allowed.includes(redirect_uri)) return json(400, { error: 'redirect_uri_not_allowed' });

  const tokenResp = await fetch(env.PSC_TOKEN_ENDPOINT || DEFAULT_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri, code_verifier,
      client_id: env.PSC_CLIENT_ID, client_secret: env.PSC_CLIENT_SECRET,
    }),
  });
  if (!tokenResp.ok) return json(401, { error: 'token_exchange_failed', status: tokenResp.status });
  const tokens = await tokenResp.json();

  const infoResp = await fetch(env.PSC_USERINFO_ENDPOINT || DEFAULT_USERINFO, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  if (!infoResp.ok) return json(401, { error: 'userinfo_failed', status: infoResp.status });
  const info = await infoResp.json();
  const ex = Array.isArray(info?.SubjectRefPro?.exercices) ? info.SubjectRefPro.exercices[0] : null;

  // Le navigateur ne reçoit que le strict nécessaire à l'affichage (pas de RPPS complet, pas de raw)
  return json(200, {
    access_token: tokens.access_token,
    expires_in: tokens.expires_in,
    professional: {
      displayName: [ex?.prenomDexercice || info.given_name, ex?.nomDexercice || info.family_name].filter(Boolean).join(' '),
      professionCodes: professionCodes(info),
      // Catégorie de signalement autorisée (clinical | field | null) — revérifiée côté serveur à chaque envoi
      category: categoryFor(professionCodes(info), (env.PSC_ALLOWED_PROFESSIONS || DEFAULT_ALLOWED_PROFESSIONS.join(',')).split(',').map(s => s.trim())),
      specialtyCode: ex?.codeSavoirFaire || null,
    },
  });
}
