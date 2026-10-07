// Règle unique de fraîcheur des données (partagée par le validateur CI et les tests).
// stale = now > nextUpdateExpected + 48 h   ·   expired = now > nextUpdateExpected + 14 jours
export const STALE_GRACE_MS = 48 * 3600 * 1000;
export const EXPIRED_AFTER_MS = 14 * 24 * 3600 * 1000;

export function computeStale(nextUpdateExpected, now = Date.now()) {
  const next = new Date(nextUpdateExpected).getTime();
  if (!Number.isFinite(next)) return true; // date absente ou invalide : on ne peut pas garantir la fraîcheur
  return now > next + STALE_GRACE_MS;
}

export function isExpired(nextUpdateExpected, now = Date.now()) {
  const next = new Date(nextUpdateExpected).getTime();
  if (!Number.isFinite(next)) return true;
  return now > next + EXPIRED_AFTER_MS;
}
