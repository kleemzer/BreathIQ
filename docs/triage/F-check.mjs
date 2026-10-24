#!/usr/bin/env node
// F-check.mjs — contrôles automatiques accessibilité / séparation patient-soignant.
// Usage : node F-check.mjs [arbre.json] [textes.json]   (code retour 1 si erreur)
// Lecture seule : ne modifie aucun fichier.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arbre = JSON.parse(readFileSync(process.argv[2] || join(here, 'arbre-fusion.json'), 'utf8'));
const textes = JSON.parse(readFileSync(process.argv[3] || join(here, 'D-textes.json'), 'utf8'));

const out = { ERREUR: [], ALERTE: [] };
const err = (c, m) => out.ERREUR.push(`[${c}] ${m}`);
const warn = (c, m) => out.ALERTE.push(`[${c}] ${m}`);

// Disclaimer attendu (FR / EN), tolérant sur la formulation.
const DISCLAIMER = {
  fr: /ne remplace pas (un |l')?avis (médical|d'un médecin)|outil d'information/i,
  en: /does not replace (medical|a doctor)|information tool|not (a substitute|medical advice)/i,
};
// Questions chiffrées : chiffres + unité, ou vocabulaire de mesure.
const CHIFFRE = /(\d+\s*(°C|%|\/min|mmHg|battements|respirations|ans|mois|jours|h\b|heures|kg))|température|fréquence|saturation|SpO2|tension|combien/i;
const NSP = /je ne sais pas|ne sais pas|pas compté|pas mesuré|pas de thermomètre|inconnu|don't know|not sure/i;
const COULEUR = /\b(rouge|vert|verte|orange|jaune|red|green|amber|yellow)\b(?!s? (ou|or) (violet|purple))/i;
const COULEUR_OK = /taches? rouges?|red or purple|rouges? ou violett|peau|skin|yeux rouges|red eyes|gorge rouge|red throat|plaque|patch|rash|éruption|rougeur|urine|zone|bosse|area|swelling|lump|gonfl/i;
const PRECOCHE = ['defaut', 'default', 'selected', 'checked', 'preselection', 'coche'];

// Lexique clinique interdit dans les textes patient (extensible).
const CLINIQUE = [
  'purpura', 'méningé', 'anurie', 'oligurie', 'dyspnée', 'tachypnée', 'polypnée', 'tachycardie', 'bradycardie',
  'hypotension', 'hypoxémie', 'désaturation', 'SpO2', 'qSOFA', 'sepsis', 'septique', 'choc septique',
  'immunodéprimé', 'immunodépression', 'neutropénie', 'aplasie', 'corticothérapie', 'chimiothérapie',
  'syndrome', 'hémorragique', 'marbrures', 'aréactif', 'geignement', 'tirage', 'cyanose', 'FHV', 'TPE',
  'prophylaxie', 'chorioamniotite', 'listériose', 'pyélonéphrite', 'méningite', 'érythème', 'exanthème',
  'pharyngite', 'otite', 'fébrile', 'hyperthermie', 'hypothermie', 'PCIME', 'NICE', 'MOD\\d+',
  'non effaçable', 'raideur méningée', 'altération de l\'état général',
  // EN
  'purpura', 'meningeal', 'anuria', 'dyspnoea', 'dyspnea', 'tachypnoea', 'tachycardia', 'hypotension',
  'hypoxaemia', 'immunocompromised', 'neutropenia', 'non-blanching', 'mottling', 'red-flag', 'febrile', 'PEP',
];
const RX_CLIN = new RegExp(`(^|[^\\p{L}])(${CLINIQUE.join('|')})(?=$|[^\\p{L}])`, 'iu');
// Sigles : sensibles à la casse (évite « pas » = PAS).
const RX_SIGLE = /(^|[^\p{L}])(AEG|FR|FC|PA|PAS|SpO2|TPE|FHV|PEP)(?=$|[^\p{L}])/u;

const strs = (o) => [o?.texte, o?.aide, ...(o?.choix || []).map((c) => (typeof c === 'string' ? c : c?.libelle)), ...(o?.signes_reconsultation || []), o?.rappel].filter(Boolean);

// 1. Arbre : questions, choix, pré-cochage, résultats.
for (const n of arbre.noeuds) {
  const libs = (n.choix || []).map((c) => c.libelle || '');
  if (n.type === 'question') {
    if (!libs.length) err('A11Y-CHOIX', `${n.id} : question sans choix`);
    libs.forEach((l, i) => { if (!l.trim()) err('A11Y-LIBELLE', `${n.id} choix ${i} : libellé vide (lecteur d'écran)`); });
    if (new Set(libs).size !== libs.length) err('A11Y-LIBELLE', `${n.id} : libellés en double`);
    if (CHIFFRE.test(`${n.texte} ${libs.join(' ')}`) && !libs.some((l) => NSP.test(l)))
      err('A11Y-NSP', `${n.id} : question chiffrée sans « Je ne sais pas » — ${n.texte.slice(0, 70)}`);
    else if (!libs.some((l) => NSP.test(l) || /non concerné/i.test(l)))
      warn('A11Y-NSP', `${n.id} : pas d'option « Je ne sais pas » (question non chiffrée)`);
  }
  for (const c of n.choix || []) for (const k of PRECOCHE) if (k in c) err('A11Y-PRECOCHE', `${n.id} : choix « ${c.libelle} » porte « ${k} »`);
  for (const k of PRECOCHE) if (k in n) err('A11Y-PRECOCHE', `${n.id} : nœud porte « ${k} »`);
}

// 2. Textes D : couleur seule, disclaimer, séparation patient/soignant, couverture.
const ids = new Set(arbre.noeuds.map((n) => n.id));
const typeOf = Object.fromEntries(arbre.noeuds.map((n) => [n.id, n.type]));
for (const id of ids) if (!textes[id]) warn('COUVERTURE', `${id} : absent de D-textes.json`);

for (const [id, t] of Object.entries(textes)) {
  if (id.startsWith('_')) continue;
  if (!t.patient || !t.soignant) { err('SEPARATION', `${id} : version patient ou soignant manquante`); continue; }
  for (const lang of ['fr', 'en']) {
    const p = t.patient[lang], s = t.soignant[lang];
    if (!p) { err('SEPARATION', `${id} : patient.${lang} manquant`); continue; }
    for (const str of strs(p)) {
      const m = str.match(RX_CLIN) || str.match(RX_SIGLE);
      if (m) err('SEPARATION', `${id} patient.${lang} : terme clinique « ${m[2]} » — ${str.slice(0, 70)}`);
      if (COULEUR.test(str) && !COULEUR_OK.test(str)) warn('A11Y-COULEUR', `${id} patient.${lang} : couleur citée, vérifier qu'elle n'est pas seule porteuse d'info — ${str.slice(0, 70)}`);
    }
    if (s && JSON.stringify(p) === JSON.stringify(s)) warn('SEPARATION', `${id}.${lang} : textes patient et soignant identiques`);
    if (['resultat', 'urgence'].includes(typeOf[id])) {
      for (const [who, o] of [['patient', p], ['soignant', s]]) {
        if (!o) continue;
        if (!DISCLAIMER[lang].test(strs(o).join(' ')))
          err('DISCLAIMER', `${id} ${who}.${lang} : rappel « outil d'information, ne remplace pas un avis médical » absent`);
      }
    }
  }
}
// Arbre aussi : couleur seule dans les textes de base.
for (const n of arbre.noeuds) for (const str of [n.texte, n.aide]) if (str && COULEUR.test(str) && !COULEUR_OK.test(str)) warn('A11Y-COULEUR', `${n.id} (arbre) : ${str.slice(0, 70)}`);

// Rapport.
const by = (arr) => arr.reduce((m, l) => ((m[l.slice(1, l.indexOf(']'))] = (m[l.slice(1, l.indexOf(']'))] || 0) + 1), m), {});
for (const lvl of ['ERREUR', 'ALERTE']) {
  console.log(`\n== ${lvl} (${out[lvl].length}) ${JSON.stringify(by(out[lvl]))}`);
  out[lvl].forEach((l) => console.log('  ' + l));
}
console.log('\nNote : contrôle statique des données ; à compléter par un test RGAA/WCAG sur le rendu HTML (contraste, focus, fieldset/legend, aria-live).');
process.exit(out.ERREUR.length ? 1 : 0);
