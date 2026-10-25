// Extrait de psc-callback.html (script en ligne → fichier, pour une CSP sans 'unsafe-inline')
(async () => {
      const params = new URLSearchParams(window.location.search);
      const code  = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        showError('La connexion Pro Santé Connect a été annulée ou refusée.');
        return;
      }
      if (!code || !state) {
        showError('Paramètres manquants — retournez à la page d\'accueil.');
        return;
      }

      try {
        // Échange du code et lecture du profil côté serveur (/api/psc-token) — rien d'autre en clair ici
        const data = await BIQ_PSC.exchangeCode(code, state);
        BIQ_PSC.saveSession(data);
        const returnTo = sessionStorage.getItem('psc_return') || '/?psc=success#declaration';
        sessionStorage.removeItem('psc_return');
        // Chemin local uniquement : « //domaine » ou « /\domaine » seraient des redirections externes
        const safe = /^\/(?![\/\\])/.test(returnTo) ? returnTo : '/?psc=success#declaration';
        window.location.href = safe;
      } catch (err) {
        showError('Connexion impossible pour le moment. Réessayez dans quelques minutes.');
      }
    })();

    function showError(msg) {
      document.getElementById('spinner').style.display = 'none';
      const box = document.getElementById('errorBox');
      box.textContent = msg;
      box.style.display = 'block';
      setTimeout(() => { window.location.href = '/'; }, 5000);
    }
