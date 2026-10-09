// Validation et agrégation des signalements — logique pure, testée par scripts/test-declarations.mjs
// (qui vérifie aussi que ces listes correspondent exactement aux valeurs du formulaire d'index.html).
// Aucune donnée identifiante : listes fermées uniquement, pas de texte libre, pas de position.

export const PATHOLOGIES = new Set([
  'grippe', 'covid19', 'rsv', 'mpox', 'dengue', 'cholera', 'rougeole', 'meningo', 'enceph',
  'chikungunya', 'typhus', 'autre', 'ebola', 'h5n1', 'mers', 'anthrax', 'botulisme',
]);
export const SYNDROMES = new Set(['grippal', 'respiratoire', 'diarrhéique', 'fébrile', 'neurologique', 'hémorragique', 'cutané']);
export const AGES = new Set(['child', 'adult', 'senior', 'mixed']);
export const SEVERITIES = new Set(['légère', 'modérée', 'sévère', 'hospitalisation']);
export const SEVERE = new Set(['sévère', 'hospitalisation']);
export const LABS = new Set(['yes', 'no', 'unknown']);
export const COUNT_CLASSES = new Set(['1-5', '6-20', '21-50', '50+']);
export const REGIONS = new Set([
  'IDF', 'ARA', 'BFC', 'BRE', 'CVL', 'COR', 'GES', 'HDF', 'NOR', 'NAQ', 'OCC', 'PDL', 'PAC',
  'GUA', 'MAR', 'GUY', 'REU', 'MAY',
]);

// Catégorie déduite de la profession d'exercice (codeProfession RPPS transmis par Pro Santé Connect)
//   suspicion clinique : 10 médecin · 50 sage-femme
//   signal de terrain  : 21 pharmacien · 60 infirmier · 70 masseur-kinésithérapeute
export const CLINICAL_PROFESSIONS = ['10', '50'];
export const FIELD_PROFESSIONS = ['21', '60', '70'];
export const DEFAULT_ALLOWED_PROFESSIONS = [...CLINICAL_PROFESSIONS, ...FIELD_PROFESSIONS];

export const K_ANONYMITY = 3;

const ISO_WEEK_RE = /^\d{4}-S(0[1-9]|[1-4]\d|5[0-3])$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDeclaration(input, category = 'clinical') {
  const errors = [];
  const d = input && typeof input === 'object' ? input : {};
  const str = v => (typeof v === 'string' ? v.trim() : '');

  // La pathologie suspectée relève du diagnostic : obligatoire pour la suspicion clinique,
  // facultative pour un signal de terrain (« autre » par défaut)
  let pathologie = str(d.pathologie);
  if (!pathologie && category === 'field') pathologie = 'autre';
  if (!PATHOLOGIES.has(pathologie)) errors.push('pathologie');

  const syndrome = str(d.syndrome);
  if (!SYNDROMES.has(syndrome)) errors.push('syndrome');
  const age = str(d.age);
  if (!AGES.has(age)) errors.push('age');
  const severity = str(d.severity);
  if (!SEVERITIES.has(severity)) errors.push('severity');
  const lab = str(d.lab) || 'unknown';
  if (!LABS.has(lab)) errors.push('lab');
  const count = str(d.count);
  if (!COUNT_CLASSES.has(count)) errors.push('count');

  const week = str(d.week);
  if (!ISO_WEEK_RE.test(week)) errors.push('week');
  const onset = str(d.onset);
  if (!ISO_DATE_RE.test(onset) || Number.isNaN(Date.parse(onset)) || Date.parse(onset) > Date.now() + 86400000) errors.push('onset');

  // France métropolitaine et DROM uniquement pour l'instant
  const region_code = str(d.region_code);
  if (!REGIONS.has(region_code)) errors.push('region_code');

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { pathologie, syndrome, age, severity, lab, count, week, onset, region_code, category } };
}

// Codes profession d'un userinfo Pro Santé Connect (SubjectRefPro.exercices[].codeProfession)
export function professionCodes(userinfo) {
  const ex = userinfo?.SubjectRefPro?.exercices;
  const codes = Array.isArray(ex) ? ex.map(e => String(e?.codeProfession ?? '').trim()).filter(Boolean) : [];
  const legacy = String(userinfo?.SubjectProfessionalType ?? '').trim();
  if (legacy) codes.push(legacy);
  return [...new Set(codes)];
}

// 'clinical' | 'field' | null (profession non autorisée). Un exercice clinique prime.
export function categoryFor(codes, allowed = DEFAULT_ALLOWED_PROFESSIONS) {
  const allow = new Set(allowed.map(String));
  const ok = codes.filter(c => allow.has(c));
  if (ok.some(c => CLINICAL_PROFESSIONS.includes(c))) return 'clinical';
  if (ok.some(c => FIELD_PROFESSIONS.includes(c))) return 'field';
  return null;
}

export function isAllowedProfessional(userinfo, allowed = DEFAULT_ALLOWED_PROFESSIONS) {
  return categoryFor(professionCodes(userinfo), allowed) !== null;
}

// Agrégat anonymisé : semaine × région × catégorie × pathologie.
// Une cellule n'est publiée que si elle compte ≥ K signalements ET ≥ K professionnels distincts.
export function aggregateDeclarations(decls, k = K_ANONYMITY) {
  const cells = new Map();
  const participants = new Map(); // semaine × région × catégorie → professionnels distincts
  for (const d of decls) {
    const key = `${d.week}|${d.region_code}|${d.category || 'clinical'}|${d.pathologie}`;
    const cell = cells.get(key) || { week: d.week, region_code: d.region_code, category: d.category || 'clinical', pathologie: d.pathologie, signalements: 0, severe: 0, countClasses: {}, _who: new Set() };
    cell.signalements += 1;
    if (SEVERE.has(d.severity)) cell.severe += 1;
    cell.countClasses[d.count] = (cell.countClasses[d.count] || 0) + 1;
    if (d.declarant) cell._who.add(d.declarant);
    cells.set(key, cell);
    const pk = `${d.week}|${d.region_code}|${d.category || 'clinical'}`;
    if (!participants.has(pk)) participants.set(pk, new Set());
    if (d.declarant) participants.get(pk).add(d.declarant);
  }
  const all = [...cells.values()];
  const published = all
    .filter(c => c.signalements >= k && c._who.size >= k)
    .map(({ _who, ...c }) => ({ ...c, professionnels: _who.size }))
    .sort((a, b) => b.week.localeCompare(a.week) || b.signalements - a.signalements);
  const participation = [...participants.entries()]
    .map(([pk, set]) => { const [week, region_code, category] = pk.split('|'); return { week, region_code, category, professionnels: set.size }; })
    .filter(p => p.professionnels >= k);
  return { k, phase: 'pilote', alertes: false, cells: published, participation, suppressedCells: all.length - published.length, totalSignalements: decls.length };
}
