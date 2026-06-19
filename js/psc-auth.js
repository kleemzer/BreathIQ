// ============================================================
// BreathIQ — Module Pro Santé Connect (PSC) OIDC
// Authentification des professionnels de santé via carte CPS / e-CPS
//
// Prérequis (variables à définir dans Netlify env vars) :
//   PSC_CLIENT_ID     : client_id obtenu après demande ANS iSC
//   PSC_CLIENT_SECRET : client_secret (géré via Netlify function /psc-token)
//   PSC_REDIRECT_URI  : https://breathiq.fr/psc-callback.html
//
// Flux OIDC Authorization Code :
//   1. Bouton → redirectToLogin() → ANS auth endpoint
//   2. Callback → psc-callback.html → exchangeCode() → Netlify function
//   3. Token JWT → getProfessionalInfo() → affichage section soignant
//
// Documentation ANS PSC :
//   https://industriels.esante.gouv.fr/produits-et-services/pro-sante-connect
// ============================================================
(function initPSCAuth(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BIQ_PSC = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function pscAuthFactory() {
  'use strict';

  // ── Configuration PSC ──────────────────────────────────────
  // ATTENTION : client_id uniquement (jamais client_secret côté client)
  const PSC_CONFIG = {
    // Bac à sable ANS (tests) — remplacer par production après validation
    authEndpoint:  'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/auth',
    tokenEndpoint: '/.netlify/functions/psc-token', // proxy sécurisé Netlify
    userInfoEndpoint: 'https://auth.bas.psc.esante.gouv.fr/auth/realms/esante-wallet/protocol/openid-connect/userinfo',
    // TODO: remplacer par ton client_id après demande ANS
    clientId: window.__PSC_CLIENT_ID__ || 'BREATHIQ_CLIENT_ID_TODO',
    redirectUri: window.location.origin + '/psc-callback.html',
    scope: 'openid scope_all',
    responseType: 'code',
    // PKCE (recommandé pour SPA)
    codeChallengeMethod: 'S256',
  };

  // ── PKCE helpers ───────────────────────────────────────────
  async function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  // ── State CSRF ─────────────────────────────────────────────
  function generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Lancer le login PSC ────────────────────────────────────
  async function redirectToLogin() {
    const verifier   = await generateCodeVerifier();
    const challenge  = await generateCodeChallenge(verifier);
    const state      = generateState();

    // Stocker en sessionStorage pour le callback
    sessionStorage.setItem('psc_verifier', verifier);
    sessionStorage.setItem('psc_state', state);

    const params = new URLSearchParams({
      response_type: PSC_CONFIG.responseType,
      client_id:     PSC_CONFIG.clientId,
      redirect_uri:  PSC_CONFIG.redirectUri,
      scope:         PSC_CONFIG.scope,
      state,
      code_challenge:        challenge,
      code_challenge_method: PSC_CONFIG.codeChallengeMethod,
    });

    window.location.href = `${PSC_CONFIG.authEndpoint}?${params.toString()}`;
  }

  // ── Échanger le code contre un token (via Netlify function) ─
  async function exchangeCode(code, state) {
    const savedState    = sessionStorage.getItem('psc_state');
    const codeVerifier  = sessionStorage.getItem('psc_verifier');

    if (state !== savedState) throw new Error('CSRF state mismatch');

    const resp = await fetch(PSC_CONFIG.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri:  PSC_CONFIG.redirectUri,
      }),
    });

    if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
    return resp.json(); // { access_token, id_token, expires_in }
  }

  // ── Récupérer les infos du professionnel ───────────────────
  async function getProfessionalInfo(accessToken) {
    const resp = await fetch(PSC_CONFIG.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!resp.ok) throw new Error(`UserInfo failed: ${resp.status}`);
    const info = await resp.json();

    return {
      rpps:         info.SubjectNameID || info.preferred_username || '',
      firstName:    info.given_name || '',
      lastName:     info.family_name || '',
      profession:   info.SubjectProfessionalType || '',
      specialty:    info.SubjectSpeciality || '',
      workPlace:    info.SubjectOrganization || '',
      practiceMode: info.SubjectRefpro_typeCode || '',
      raw: info,
    };
  }

  // ── Déconnexion ────────────────────────────────────────────
  function logout() {
    sessionStorage.removeItem('psc_verifier');
    sessionStorage.removeItem('psc_state');
    sessionStorage.removeItem('psc_token');
    sessionStorage.removeItem('psc_professional');
  }

  // ── Vérifier si connecté ───────────────────────────────────
  function isLoggedIn() {
    const token = sessionStorage.getItem('psc_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  // ── Rendu bouton PSC (HTML) ────────────────────────────────
  function renderLoginButton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <button
        onclick="BIQ_PSC.redirectToLogin()"
        style="
          display:inline-flex;align-items:center;gap:0.6rem;
          background:#0e4a96;color:#fff;border:none;border-radius:0.6rem;
          padding:0.75rem 1.25rem;font-size:0.9rem;font-weight:600;
          cursor:pointer;transition:background 0.2s;
        "
        onmouseover="this.style.background='#0a3873'"
        onmouseout="this.style.background='#0e4a96'"
      >
        <img src="https://esante.gouv.fr/sites/default/files/media_entity/articles/psc-logo.png"
             alt="Pro Santé Connect" width="24" height="24"
             onerror="this.style.display='none'">
        Se connecter avec Pro Santé Connect
      </button>
      <p style="font-size:0.75rem;color:#6b7280;margin-top:0.4rem;">
        Authentification sécurisée ANS — Carte CPS / e-CPS
      </p>
    `;
  }

  return {
    redirectToLogin,
    exchangeCode,
    getProfessionalInfo,
    logout,
    isLoggedIn,
    renderLoginButton,
    config: PSC_CONFIG,
  };
});
