import { validateDeclaration, isAllowedProfessional, professionCodes, aggregateDeclarations } from '../functions/_lib/decl-schema.js';

let failures = 0;
const check = (label, cond) => { if (!cond) failures++; console.log(`${cond ? '✅' : '❌'} ${label}`); };

const good = { pathologie: 'grippe', syndrome: 'grippal', age: '15-44', severity: 'ambulatoire', lab: 'pending', count: 3, week: '2026-S41', onset: '2026-10-06', region_code: 'IDF', region: '48.5,2.5' };
check('déclaration valide acceptée', validateDeclaration(good).ok);
check('pathologie hors liste refusée', !validateDeclaration({ ...good, pathologie: 'peste noire <script>' }).ok);
check('texte libre dans count refusé', !validateDeclaration({ ...good, count: 'beaucoup' }).ok);
check('count > 50 refusé', !validateDeclaration({ ...good, count: 51 }).ok);
check('semaine ISO malformée refusée', !validateDeclaration({ ...good, week: '2026-W41' }).ok);
check('date de début future refusée', !validateDeclaration({ ...good, onset: '2099-01-01' }).ok);
check('région inconnue refusée', !validateDeclaration({ ...good, region_code: 'PARIS' }).ok);
check('région manquante refusée (France d\'abord)', !validateDeclaration({ ...good, region_code: '' }).ok);
check('« Hors France » refusé pour l\'instant', !validateDeclaration({ ...good, region_code: 'HORS' }).ok);
check('DROM (La Réunion) accepté', validateDeclaration({ ...good, region_code: 'REU' }).ok);
check('position précise (non arrondie) refusée', !validateDeclaration({ ...good, region: '48.8566,2.3522' }).ok);
check('position au demi-degré acceptée', validateDeclaration({ ...good, region: '48.5,2.5' }).ok);
check('champ inattendu ignoré (pas de fuite)', !('nom' in (validateDeclaration({ ...good, nom: 'Dupont' }).value || {})));

const medecin = { sub: 'abc', SubjectRefPro: { exercices: [{ codeProfession: '10', nomDexercice: 'X' }] } };
const pharmacien = { SubjectRefPro: { exercices: [{ codeProfession: '21' }] } };
const kine = { SubjectRefPro: { exercices: [{ codeProfession: '70' }] } };
const patient = { sub: 'zzz' };
check('médecin (10) autorisé', isAllowedProfessional(medecin));
check('pharmacien (21) autorisé', isAllowedProfessional(pharmacien));
check('kinésithérapeute (70) refusé par défaut', !isAllowedProfessional(kine));
check('userinfo sans exercice refusé', !isAllowedProfessional(patient));
check('liste restreinte respectée (médecins seuls)', !isAllowedProfessional(pharmacien, ['10']));
check('codes profession extraits', professionCodes(medecin).join() === '10');

const decls = [
  ...Array.from({ length: 3 }, () => ({ ...good })),
  { ...good, pathologie: 'mpox' },
  { ...good, pathologie: 'covid19', severity: 'hospitalisation' }, { ...good, pathologie: 'covid19' }, { ...good, pathologie: 'covid19' },
];
const agg = aggregateDeclarations(decls);
check('cellules ≥ 3 publiées', agg.cells.length === 2);
check('cellule unique (mpox) supprimée — k-anonymat', agg.suppressedCells === 1 && !agg.cells.some(c => c.pathologie === 'mpox'));
check('cas additionnés', agg.cells.find(c => c.pathologie === 'grippe').cases === 9);
check('formes sévères comptées', agg.cells.find(c => c.pathologie === 'covid19').severe === 1);
check('aucun identifiant dans l\'agrégat', !JSON.stringify(agg).includes('declarant'));

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests déclarations passent');
process.exit(failures ? 1 : 0);
