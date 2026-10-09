// ============================================================
// BreathIQ — Module Pro Santé Connect (PSC) OIDC, Authorization Code + PKCE
//
// Le navigateur ne détient que le client_id. L'échange du code (client_secret) et la lecture
// du userinfo se font côté serveur : Cloudflare Pages Function /api/psc-token.
// La déclaration de cas (/api/declare) exige un jeton PSC valide, revérifié auprès de l'ANS
// à chaque envoi — une « porte » côté navigateur seule ne suffirait pas.
//
// Configuration : window.__PSC_CLIENT_ID__ (injecté dans index.html) ; endpoints bac à sable
// par défaut, production après homologation ANS.
// Documentation : https://industriels.esante.gouv.fr/produits-et-services/pro-sante-connect
// ============================================================
(function initPSCAuth(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_PSC = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function pscAuthFactory() {
  'use strict';

  const PSC_CONFIG = {
    authEndpoint: 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/auth',
    tokenEndpoint: '/api/psc-token',
    clientId: (typeof window !== 'undefined' && window.__PSC_CLIENT_ID__) || '',
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/psc-callback.html' : '',
    scope: 'openid scope_all',
    responseType: 'code',
    codeChallengeMethod: 'S256',
  };

  // Raccordement actif uniquement si un client_id a été fourni par l'ANS
  function isEnabled() { return !!PSC_CONFIG.clientId; }

  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  function generateCodeVerifier() { const a = new Uint8Array(32); crypto.getRandomValues(a); return b64url(a); }
  async function generateCodeChallenge(verifier) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return b64url(new Uint8Array(digest));
  }
  function generateState() { const a = new Uint8Array(16); crypto.getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); }

  async function redirectToLogin(returnTo) {
    if (!isEnabled()) throw new Error('PSC non configuré');
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();
    sessionStorage.setItem('psc_verifier', verifier);
    sessionStorage.setItem('psc_state', state);
    if (returnTo) sessionStorage.setItem('psc_return', returnTo);
    const params = new URLSearchParams({
      response_type: PSC_CONFIG.responseType, client_id: PSC_CONFIG.clientId, redirect_uri: PSC_CONFIG.redirectUri,
      scope: PSC_CONFIG.scope, state, code_challenge: challenge, code_challenge_method: PSC_CONFIG.codeChallengeMethod,
    });
    window.location.href = `${PSC_CONFIG.authEndpoint}?${params.toString()}`;
  }

  // Échange du code côté serveur ; renvoie { access_token, expires_in, professional }
  async function exchangeCode(code, state) {
    const savedState = sessionStorage.getItem('psc_state');
    const codeVerifier = sessionStorage.getItem('psc_verifier');
    if (!savedState || state !== savedState) throw new Error('état CSRF invalide');
    const resp = await fetch(PSC_CONFIG.tokenEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: PSC_CONFIG.redirectUri }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message || data.error || `échange de code refusé (${resp.status})`);
    sessionStorage.removeItem('psc_verifier');
    sessionStorage.removeItem('psc_state');
    return data;
  }

  function saveSession(data) {
    const expiresAt = Date.now() + Math.max(60, Number(data.expires_in) || 300) * 1000;
    sessionStorage.setItem('psc_session', JSON.stringify({ token: data.access_token, expiresAt, professional: data.professional || null }));
  }
  function getSession() {
    try {
      const s = JSON.parse(sessionStorage.getItem('psc_session') || 'null');
      if (!s || !s.token || s.expiresAt <= Date.now()) return null;
      return s;
    } catch { return null; }
  }
  function isLoggedIn() { return !!getSession(); }
  function logout() { ['psc_session', 'psc_verifier', 'psc_state', 'psc_return'].forEach(k => sessionStorage.removeItem(k)); }

  // Envoi authentifié d'une déclaration ; le serveur revalide le jeton auprès de l'ANS
  async function submitDeclaration(payload) {
    const s = getSession();
    if (!s) throw new Error('session PSC absente ou expirée');
    const resp = await fetch('/api/declare', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.token}` },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) { if (resp.status === 401) logout(); throw Object.assign(new Error(data.message || data.error || `refus (${resp.status})`), { code: data.error, status: resp.status }); }
    return data;
  }

  return { redirectToLogin, exchangeCode, saveSession, getSession, isLoggedIn, logout, submitDeclaration, isEnabled, config: PSC_CONFIG };
});
