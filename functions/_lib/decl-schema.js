// Validation et agrégation des déclarations syndromiques — logique pure, testée par
// scripts/test-declarations.mjs. Aucune donnée identifiante n'est acceptée : listes fermées
// uniquement, pas de texte libre, position arrondie au demi-degré.

export const PATHOLOGIES = new Set([
  'grippe', 'covid19', 'rsv', 'mpox', 'dengue', 'cholera', 'rougeole', 'meningite', 'encephalite',
  'chikungunya', 'typhoide', 'autre', 'ebola', 'h5n1', 'mers', 'anthrax', 'botulisme',
]);
export const SYNDROMES = new Set(['grippal', 'respiratoire', 'diarrheique', 'febrile', 'neurologique', 'hemorragique', 'cutane']);
export const AGES = new Set(['0-4', '5-14', '15-44', '45-64', '65+', 'mixte']);
export const SEVERITIES = new Set(['ambulatoire', 'hospitalisation', 'reanimation', 'deces']);
export const LABS = new Set(['confirmed', 'pending', 'unknown', 'none']);
export const REGIONS = new Set([
  'IDF', 'ARA', 'BFC', 'BRE', 'CVL', 'COR', 'GES', 'HDF', 'NOR', 'NAQ', 'OCC', 'PDL', 'PAC',
  'GUA', 'MTQ', 'GUF', 'REU', 'MAY', 'HORS',
]);

// Professions RPPS/ADELI autorisées à déclarer (codeProfession PSC) — À VALIDER par le Dr Médeau
// 10 médecin · 21 pharmacien · 40 chirurgien-dentiste · 50 sage-femme · 60 infirmier
export const DEFAULT_ALLOWED_PROFESSIONS = ['10', '21', '40', '50', '60'];

export const K_ANONYMITY = 3;

const ISO_WEEK_RE = /^\d{4}-S(0[1-9]|[1-4]\d|5[0-3])$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HALF_DEGREE_RE = /^-?\d{1,2}\.[05],-?\d{1,3}\.[05]$/;

export function validateDeclaration(input) {
  const errors = [];
  const d = input && typeof input === 'object' ? input : {};
  const str = v => (typeof v === 'string' ? v.trim() : '');

  const pathologie = str(d.pathologie);
  if (!PATHOLOGIES.has(pathologie)) errors.push('pathologie');
  const syndrome = str(d.syndrome);
  if (!SYNDROMES.has(syndrome)) errors.push('syndrome');
  const age = str(d.age);
  if (!AGES.has(age)) errors.push('age');
  const severity = str(d.severity);
  if (!SEVERITIES.has(severity)) errors.push('severity');
  const lab = str(d.lab) || 'unknown';
  if (!LABS.has(lab)) errors.push('lab');

  const count = Number(d.count);
  if (!Number.isInteger(count) || count < 1 || count > 50) errors.push('count');

  const week = str(d.week);
  if (!ISO_WEEK_RE.test(week)) errors.push('week');
  const onset = str(d.onset);
  if (!ISO_DATE_RE.test(onset) || Number.isNaN(Date.parse(onset)) || Date.parse(onset) > Date.now() + 86400000) errors.push('onset');

  // France d'abord (métropole + DROM) : région obligatoire ; « HORS » (autres pays) non accepté pour l'instant
  const region_code = str(d.region_code) || null;
  if (!region_code || !REGIONS.has(region_code) || region_code === 'HORS') errors.push('region_code');
  const region = str(d.region) || null;
  if (region && !HALF_DEGREE_RE.test(region)) errors.push('region');

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { pathologie, syndrome, age, severity, lab, count, week, onset, region_code, region } };
}

// Extrait les codes profession d'un userinfo Pro Santé Connect (structure SubjectRefPro.exercices[])
export function professionCodes(userinfo) {
  const ex = userinfo?.SubjectRefPro?.exercices;
  const codes = Array.isArray(ex) ? ex.map(e => String(e?.codeProfession ?? '').trim()).filter(Boolean) : [];
  const legacy = String(userinfo?.SubjectProfessionalType ?? '').trim();
  if (legacy) codes.push(legacy);
  return [...new Set(codes)];
}

export function isAllowedProfessional(userinfo, allowed = DEFAULT_ALLOWED_PROFESSIONS) {
  const allow = new Set(allowed.map(String));
  return professionCodes(userinfo).some(c => allow.has(c));
}

// Agrégation anonymisée : comptes par semaine × région × pathologie ; les cellules < K sont supprimées
export function aggregateDeclarations(decls, k = K_ANONYMITY) {
  const cells = new Map();
  for (const d of decls) {
    const key = `${d.week}|${d.region_code || 'NA'}|${d.pathologie}`;
    const cell = cells.get(key) || { week: d.week, region_code: d.region_code || null, pathologie: d.pathologie, declarations: 0, cases: 0, severe: 0 };
    cell.declarations += 1;
    cell.cases += Number(d.count) || 0;
    if (d.severity === 'hospitalisation' || d.severity === 'reanimation' || d.severity === 'deces') cell.severe += 1;
    cells.set(key, cell);
  }
  const all = [...cells.values()];
  const published = all.filter(c => c.declarations >= k).sort((a, b) => b.week.localeCompare(a.week) || b.cases - a.cases);
  const suppressed = all.length - published.length;
  return { k, cells: published, suppressedCells: suppressed, totalDeclarations: decls.length };
}
