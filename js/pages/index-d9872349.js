// Extrait de index.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
// ── Écran épidémio pré-wizard ──────────────────────────────
function showEpiAlert(type) {
  const el = document.getElementById('epiResult' + type.charAt(0).toUpperCase() + type.slice(1));
  if (el) { el.hidden = false; el.scrollIntoView({behavior:'smooth', block:'nearest'}); }
}
function hideEpiAlert(type) {
  const el = document.getElementById('epiResult' + type.charAt(0).toUpperCase() + type.slice(1));
  if (el) el.hidden = true;
}

// ── Overlay score non-respiratoire si PHEIC Ebola actif ───
// Appelé par loadPheicAlert() uniquement quand une alerte sourcée est active (plus de note codée en dur)
window.syncPheicScoreOverlay = function(lang, alert) {
  const scoreCard = document.getElementById('dailyScore');
  if (!scoreCard) return;
  const existing = scoreCard.querySelector('.ebola-pheic-overlay');
  if (!alert) { existing?.remove(); return; }
  const fr = lang === 'fr';
  const name = alert.shortName ? (alert.shortName[lang] || alert.shortName.fr) : alert.disease;
  const html = fr
    ? `<strong>⚠️ Note — alerte internationale active : ${name}</strong><p>Le score affiché concerne la qualité de l'air et les virus respiratoires ; cette alerte n'y est pas intégrée. Consultez la section « Alertes épidémiques » pour savoir si vous êtes concerné(e).</p><a href="#epidemioAlert" data-onclick="return navTo(event,'#epidemioAlert')">Suis-je concerné(e) ? →</a>`
    : `<strong>⚠️ Note — active international alert: ${name}</strong><p>The score shown covers air quality and respiratory viruses; this alert is not part of it. See the "Epidemic alerts" section to find out whether it concerns you.</p><a href="#epidemioAlert" data-onclick="return navTo(event,'#epidemioAlert')">Does it concern me? →</a>`;
  if (existing) { existing.innerHTML = html; return; }
  const overlay = document.createElement('div');
  overlay.className = 'ebola-pheic-overlay';
  overlay.setAttribute('role', 'note');
  overlay.innerHTML = html;
  scoreCard.insertAdjacentElement('afterbegin', overlay);
};
