// Extrait de ebola-en.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
// Mesure d'audience uniquement si le visiteur l'a acceptée sur l'accueil (biq-consent = accepted) — RGPD
  try { if (localStorage.getItem('biq-consent') === 'accepted') { var u = document.createElement('script'); u.defer = true; u.src = 'https://cloud.umami.is/script.js'; u.setAttribute('data-website-id', '6ddfd578-3f85-41a4-a987-8768ada1d2aa'); document.head.appendChild(u); } } catch (e) {}
