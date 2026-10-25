// Extrait de index.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
// Synchronise l'attribut lang du document avec la langue choisie (accessibilité lecteurs d'écran)
(function(){
  const RTL = ['ar','he','fa','ur'];
  function applyLang(l){
    if(!l) return;
    document.documentElement.lang = l;
    document.documentElement.dir = RTL.includes(l) ? 'rtl' : 'ltr';
  }
  // Appliquer au chargement
  applyLang(localStorage.getItem('biq-lang') || 'fr');
  // Patcher setLang pour mettre à jour en temps réel
  const _orig = window.setLang;
  window.setLang = function(l){ applyLang(l); if(_orig) _orig(l); };
  // Observer le select au cas où setLang n'est pas encore défini
  document.getElementById('langSelect')?.addEventListener('change', function(){ applyLang(this.value); });
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const n = document.createElement('div');
          n.style.cssText='position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:.6rem 1.2rem;border-radius:.5rem;font-size:.85rem;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,.2)';
          n.textContent='✅ Site disponible hors-ligne';
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 4000);
        });
      });
  });
}
