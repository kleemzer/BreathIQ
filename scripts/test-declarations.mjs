import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  validateDeclaration, isAllowedProfessional, professionCodes, categoryFor, aggregateDeclarations,
  PATHOLOGIES, SYNDROMES, AGES, SEVERITIES, LABS, COUNT_CLASSES, REGIONS,
} from '../functions/_lib/decl-schema.js';

let failures = 0;
const check = (label, cond) => { if (!cond) failures++; console.log(`${cond ? '✅' : '❌'} ${label}`); };

// ── 0. Le schéma serveur doit correspondre EXACTEMENT aux valeurs du formulaire (index.html) ──
const html = readFileSync(join(new URL('..', import.meta.url).pathname, 'index.html'), 'utf8');
const form = html.match(/<form[^>]*id="declForm"[\s\S]*?<\/form>/)?.[0] || '';
const valuesOf = name => {
  const out = new Set();
  for (const m of form.matchAll(new RegExp(`<input[^>]*name="${name}"[^>]*value="([^"]+)"`, 'g'))) out.add(m[1]);
  const sel = form.match(new RegExp(`<select[^>]*name="${name}"[\\s\\S]*?</select>`))?.[0] || '';
  for (const m of sel.matchAll(/<option[^>]*value="([^"]+)"/g)) out.add(m[1]);
  return out;
};
const same = (label, formSet, schemaSet) => {
  const missing = [...formSet].filter(v => !schemaSet.has(v));
  check(`formulaire ↔ serveur : ${label}${missing.length ? ` (refusées par le serveur : ${missing.join(', ')})` : ''}`, formSet.size > 0 && missing.length === 0);
};
same('pathologie', valuesOf('pathologie'), PATHOLOGIES);
same('syndrome', valuesOf('syndrome'), SYNDROMES);
same('age', valuesOf('age'), AGES);
same('severity', valuesOf('severity'), SEVERITIES);
same('lab', valuesOf('lab'), LABS);
same('count', valuesOf('count'), COUNT_CLASSES);
same('region_code', valuesOf('region_code'), REGIONS);

// ── 1. Validation ──
const good = { pathologie: 'grippe', syndrome: 'grippal', age: 'adult', severity: 'modérée', lab: 'unknown', count: '1-5', week: '2026-S41', onset: '2026-10-06', region_code: 'IDF' };
check('signalement valide accepté', validateDeclaration(good).ok);
check('pathologie hors liste refusée', !validateDeclaration({ ...good, pathologie: 'peste noire <script>' }).ok);
check('classe de cas libre refusée', !validateDeclaration({ ...good, count: 'beaucoup' }).ok);
check('semaine ISO malformée refusée', !validateDeclaration({ ...good, week: '2026-W41' }).ok);
check('date de début future refusée', !validateDeclaration({ ...good, onset: '2099-01-01' }).ok);
check('région inconnue refusée', !validateDeclaration({ ...good, region_code: 'PARIS' }).ok);
check('région manquante refusée (France d\'abord)', !validateDeclaration({ ...good, region_code: '' }).ok);
check('« Hors France » refusé pour l\'instant', !validateDeclaration({ ...good, region_code: 'HORS' }).ok);
check('DROM (La Réunion) accepté', validateDeclaration({ ...good, region_code: 'REU' }).ok);
check('aucune position conservée', !('region' in (validateDeclaration({ ...good, region: '48.5,2.5' }).value || {})));
check('champ inattendu ignoré (pas de fuite)', !('nom' in (validateDeclaration({ ...good, nom: 'Dupont' }).value || {})));
check('suspicion clinique : pathologie obligatoire', !validateDeclaration({ ...good, pathologie: '' }, 'clinical').ok);
check('signal de terrain : pathologie facultative (« autre »)', validateDeclaration({ ...good, pathologie: '' }, 'field').value?.pathologie === 'autre');
check('catégorie enregistrée dans le signalement', validateDeclaration(good, 'field').value?.category === 'field');

// ── 2. Professions et catégories ──
const pro = code => ({ sub: 'x', SubjectRefPro: { exercices: [{ codeProfession: code }] } });
check('médecin (10) → suspicion clinique', categoryFor(professionCodes(pro('10'))) === 'clinical');
check('sage-femme (50) → suspicion clinique', categoryFor(professionCodes(pro('50'))) === 'clinical');
check('pharmacien (21) → signal de terrain', categoryFor(professionCodes(pro('21'))) === 'field');
check('infirmier (60) → signal de terrain', categoryFor(professionCodes(pro('60'))) === 'field');
check('masseur-kinésithérapeute (70) → signal de terrain', categoryFor(professionCodes(pro('70'))) === 'field');
check('chirurgien-dentiste (40) refusé', !isAllowedProfessional(pro('40')));
check('userinfo sans exercice refusé', !isAllowedProfessional({ sub: 'zzz' }));
check('double exercice médecin + pharmacien → clinique', categoryFor(['21', '10']) === 'clinical');
check('liste restreinte respectée', categoryFor(['21'], ['10']) === null);

// ── 3. Agrégat : k-anonymat, séparation des catégories, participants, pas d'alerte ──
const mk = (o, who) => ({ ...good, category: 'clinical', declarant: who, ...o });
const decls = [
  mk({}, 'a'), mk({}, 'b'), mk({}, 'c'),
  mk({}, 'a'), mk({}, 'a'), mk({ pathologie: 'mpox' }, 'a'),
  mk({ category: 'field' }, 'p1'), mk({ category: 'field' }, 'p2'), mk({ category: 'field' }, 'p3'),
  mk({ pathologie: 'covid19', severity: 'hospitalisation' }, 'd'), mk({ pathologie: 'covid19' }, 'd'), mk({ pathologie: 'covid19' }, 'd'),
];
const agg = aggregateDeclarations(decls);
const cell = (cat, p) => agg.cells.find(c => c.category === cat && c.pathologie === p);
check('catégories jamais additionnées', cell('clinical', 'grippe')?.signalements === 5 && cell('field', 'grippe')?.signalements === 3);
check('professionnels distincts comptés', cell('clinical', 'grippe')?.professionnels === 3);
check('cellule d\'un seul déclarant supprimée même si ≥ 3 signalements', !cell('clinical', 'covid19'));
check('cellule unique (mpox) supprimée', !cell('clinical', 'mpox'));
check('participation publiée par catégorie', agg.participation.some(p => p.category === 'field' && p.professionnels === 3));
check('phase pilote : aucune alerte', agg.alertes === false && agg.phase === 'pilote');
check('aucun identifiant dans l\'agrégat', !JSON.stringify(agg).includes('declarant') && !JSON.stringify(agg).includes('"a"'));

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests signalements passent');
process.exit(failures ? 1 : 0);
