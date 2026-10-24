// Construit data/triage.json à partir de la source clinique (docs/triage/arbre-fusion.json)
// et des textes patient / soignant (docs/triage/D-textes.json).
// Usage : node scripts/build-triage.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(new URL('..', import.meta.url).pathname);
const tree = JSON.parse(readFileSync(join(root, 'docs/triage/arbre-fusion.json'), 'utf8'));
const texts = JSON.parse(readFileSync(join(root, 'docs/triage/D-textes.json'), 'utf8'));

const missing = tree.noeuds.filter(n => !texts[n.id]).map(n => n.id);
if (missing.length) { console.error(`❌ textes manquants : ${missing.join(', ')}`); process.exit(1); }

const pickText = t => ({ texte: t?.texte || '', aide: t?.aide || '', choix: t?.choix || [], signes: t?.signes_reconsultation || [], rappel: t?.rappel || '' });

const out = {
  version: tree.version,
  date: tree.date,
  statut: 'brouillon — à valider par le médecin validateur avant mise en ligne',
  racine: tree.racine,
  niveaux_ordre: tree.niveaux_ordre,
  niveaux_delai: tree.niveaux_delai,
  regles_modulation: tree.regles_modulation.map(({ id, effet, valeur, condition, resultat, source }) => ({ id, effet, valeur, condition, resultat, source })),
  numeros_urgence: texts._numeros_urgence || null,
  numeros_garde: texts._numeros_garde || null,
  noeuds: tree.noeuds.map(n => {
    for (const who of ['patient', 'soignant']) for (const lang of ['fr', 'en']) {
      const c = texts[n.id]?.[who]?.[lang]?.choix || [];
      if (c.length !== (n.choix || []).length) throw new Error(`${n.id} ${who}.${lang} : ${c.length} libellés pour ${(n.choix || []).length} choix`);
    }
    return {
      id: n.id,
      type: n.type,
      selection: n.selection || 'unique',
      condition_activation: n.condition_activation || null,
      niveau_orientation: n.niveau_orientation || null,
      delai_action: n.delai_action || null,
      source: n.source || 'à valider',
      choix: (n.choix || []).map(c => ({ libelle: c.libelle, vers: c.vers, pose: c.pose || null, condition_activation: c.condition_activation || null })),
      t: {
        patient: { fr: pickText(texts[n.id].patient.fr), en: pickText(texts[n.id].patient.en) },
        soignant: { fr: pickText(texts[n.id].soignant.fr), en: pickText(texts[n.id].soignant.en) },
      },
    };
  }),
};

writeFileSync(join(root, 'data/triage.json'), JSON.stringify(out));
console.log(`✅ data/triage.json — ${out.noeuds.length} nœuds, version ${out.version}`);
