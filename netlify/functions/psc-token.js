// ============================================================
// BreathIQ — Netlify Function : Échange de token PSC
// Proxy sécurisé pour l'échange code → token Pro Santé Connect
// Le client_secret ne quitte jamais ce serveur.
//
// Variables d'environnement Netlify requises :
//   PSC_CLIENT_ID     : client_id fourni par ANS
//   PSC_CLIENT_SECRET : client_secret fourni par ANS
// ============================================================
'use strict';

const PSC_TOKEN_ENDPOINT =
  'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/token';

exports.handler = async function (event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://breathiq.fr',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const clientId     = process.env.PSC_CLIENT_ID;
  const clientSecret = process.env.PSC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 503,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'psc_not_configured', message: 'PSC credentials not set in environment' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  const { code, code_verifier, redirect_uri } = body;
  if (!code || !code_verifier || !redirect_uri) {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'missing_params' }) };
  }

  const params = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri,
    client_id:     clientId,
    client_secret: clientSecret,
    code_verifier,
  });

  try {
    const resp = await fetch(PSC_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(10000),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: data.error || 'token_error', description: data.error_description }),
      };
    }

    // On ne renvoie que ce dont le client a besoin (pas le refresh_token)
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        access_token: data.access_token,
        id_token:     data.id_token,
        expires_in:   data.expires_in,
        token_type:   data.token_type,
      }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'upstream_error', message: err.message }),
    };
  }
};
