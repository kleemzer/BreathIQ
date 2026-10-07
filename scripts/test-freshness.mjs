import { computeStale, isExpired } from './lib/freshness.mjs';

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` (obtenu ${actual}, attendu ${expected})`}`);
};

const next = Date.parse('2026-08-17T09:00:00Z');
const H = 3600 * 1000, D = 24 * H;

check('avant la date attendue → frais',            computeStale(next, next - D), false);
check('à la date attendue → frais',                computeStale(next, next), false);
check('+47 h → encore frais (délai de grâce)',     computeStale(next, next + 47 * H), false);
check('+48 h exactement → frais (strictement >)',  computeStale(next, next + 48 * H), false);
check('+49 h → périmé',                            computeStale(next, next + 49 * H), true);
check('date absente → périmé par prudence',        computeStale(undefined, next), true);
check('date invalide → périmé par prudence',       computeStale('n/a', next), true);
check('+13 j → pas expiré pour la CI',             isExpired(next, next + 13 * D), false);
check('+15 j → expiré, la CI doit échouer',        isExpired(next, next + 15 * D), true);
check('cas réel : SPF 17/08 lu le 07/10 → périmé', computeStale('2026-08-17T09:00:00Z', Date.parse('2026-10-07T12:00:00Z')), true);

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests de fraîcheur passent');
process.exit(failures ? 1 : 0);
