// Kill-switch : désinstalle l'ancien SW breathiq-v3 et force le rechargement
// Ce fichier remplace l'ancien service-worker.js défaillant
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.registration.unregister().then(() => {
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  });
});
