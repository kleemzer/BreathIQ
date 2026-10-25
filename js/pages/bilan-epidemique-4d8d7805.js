// Extrait de bilan-epidemique.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
// Avertissement automatique si le bilan a plus de 45 jours (date lue dans le JSON-LD datePublished)
(function () {
  try {
    const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => { try { return JSON.parse(s.textContent); } catch { return null; } }).find(j => j && j.datePublished);
    const published = ld && new Date(ld.datePublished);
    if (!published || isNaN(published)) return;
    const days = Math.floor((Date.now() - published.getTime()) / 86400000);
    if (days <= 45) return;
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.style.cssText = 'margin:1rem auto;max-width:900px;padding:.85rem 1.1rem;border-radius:.75rem;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);font-size:.9rem;line-height:1.5';
    box.innerHTML = `⏳ <strong>Bilan daté du ${published.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> — il a ${days} jours. Pour la situation actuelle, consultez la <a href="/#virusSaison">page d'accueil</a> (données mises à jour quotidiennement).`;
    const main = document.querySelector('main') || document.body;
    main.insertAdjacentElement('afterbegin', box);
  } catch (e) { /* silencieux */ }
})();
