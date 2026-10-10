// Test du parseur sur un extrait verbatim du bulletin SPF du 7 octobre 2026 (texte pdftotext).
import { parseArboBulletin } from './lib/spf-arbo-parse.mjs';

const EXTRAIT = `Arboviroses - Hexagone
Semaine 40-2026 (28 septembre au 4 octobre 2026). Date de publication :
7 octobre 2026
Points clés au 5 octobre 2026
Au 5 octobre 2026, 24 épisodes (+1 nouvel épisode par rapport à la semaine précédente) de
transmission vectorielle autochtone ont été identifiés en France hexagonale :
 • 20 épisodes de chikungunya (+1 nouvel épisode par rapport à la semaine précédente)
 totalisant 146 cas (1 à 34 cas par épisode) dans le Tarn, le Lot ;
 • 4 épisodes de dengue (aucun nouvel épisode par rapport à la semaine précédente) totalisant
 6 cas (1 à 2 cas par épisode) dans le Tarn.
Cas importés
 • 156 cas importés de chikungunya
 • 437 cas importés de dengue
 • 17 cas importés de Zika
Infections à virus West Nile
Cas autochtones
Au 5 octobre 2026, 161 cas autochtones d’infection à virus West Nile (+16 par rapport à la semaine
précédente) ont été identifiés en France hexagonale. Ils se situent dans les régions Provence-Alpes-
Côte d'Azur (3 départements concernés), Occitanie (7 départements concernés), Île-de-France (7
départements concernés), Auvergne-Rhône-Alpes (4 départements concernés), Nouvelle-Aquitaine
(département de la Gironde), Pays de la Loire (3 départements concernés) et Centre-Val de Loire
(département du Loiret). Pour 15 cas, aucun lieu précis de contamination n’a pu être identifié.
Infections à virus West-Nile
Transmission autochtone
Parmi les 161 cas autochtones d’infection à virus West Nile signalés jusqu’à ce jour en 2026, 28
étaient asymptomatiques (détectés lors du dépistage systématique des dons de sang mis en place
dans certains départements) et 133 étaient symptomatiques. Ces derniers comprenaient 60 (37%,
60/161) formes neuro-invasives, parmi lesquelles figurent 5 décès (3%, 5/161).`;

let failures = 0;
const eq = (label, a, b) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) failures++; console.log(`${ok ? '✅' : '❌'} ${label}${ok ? '' : ` — obtenu ${JSON.stringify(a)}, attendu ${JSON.stringify(b)}`}`); };

const r = parseArboBulletin(EXTRAIT);
eq('date de publication', r.publicationDate, '2026-10-07');
eq('semaine épidémiologique', r.epiWeek, '2026-S40');
eq('données au', r.dataAsOf, '2026-10-05');
eq('West Nile — cas autochtones', r.westNile.autochthonousCases, 161);
eq('West Nile — évolution hebdomadaire', r.westNile.weeklyChange, 16);
eq('West Nile — asymptomatiques', r.westNile.asymptomatic, 28);
eq('West Nile — symptomatiques', r.westNile.symptomatic, 133);
eq('West Nile — neuro-invasives', r.westNile.neuroinvasive, 60);
eq('West Nile — décès', r.westNile.deaths, 5);
eq('West Nile — cas sans lieu identifié', r.westNile.casesWithoutKnownPlace, 15);
eq('West Nile — régions (noms complets)', r.westNile.regions.map(x => x.region), ["Provence-Alpes-Côte d'Azur", 'Occitanie', 'Île-de-France', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Pays de la Loire', 'Centre-Val de Loire']);
eq('West Nile — Île-de-France : 7 départements', r.westNile.regions.find(x => x.region === 'Île-de-France')?.departements, 7);
eq('chikungunya — épisodes / cas', [r.chikungunya.autochthonousEpisodes, r.chikungunya.autochthonousCases], [20, 146]);
eq('dengue — épisodes / cas', [r.dengue.autochthonousEpisodes, r.dengue.autochthonousCases], [4, 6]);
eq('cas importés chik / dengue / Zika', [r.chikungunya.importedCases, r.dengue.importedCases, r.zika.importedCases], [156, 437, 17]);
eq('Zika autochtone absent du texte → null (jamais 0 inventé)', r.zika.autochthonousCases, null);
eq('texte vide → tout à null', parseArboBulletin('').westNile.autochthonousCases, null);

console.log(failures ? `\n${failures} échec(s)` : '\nTous les tests du bulletin arboviroses passent');
process.exit(failures ? 1 : 0);
