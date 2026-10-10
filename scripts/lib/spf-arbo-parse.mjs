// Extraction des chiffres du bulletin national SPF « Chikungunya, dengue, Zika et West Nile en France
// hexagonale » (texte issu de pdftotext). Principe : on ne garde que ce que le texte dit explicitement ;
// une valeur introuvable reste null (jamais estimée). Testé par scripts/test-spf-arbo.mjs.

const MOIS = { janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12 };

const flat = s => s.replace(/ /g, ' ').replace(/[ \t]*\n[ \t]*/g, ' ').replace(/\s+/g, ' ').replace(/(\w)- (\w)/g, '$1-$2');
const int = s => (s == null ? null : Number(String(s).replace(/\s/g, '')));
const frDate = (d, m, y) => (MOIS[m?.toLowerCase()] ? `${y}-${String(MOIS[m.toLowerCase()]).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null);

export function parseArboBulletin(rawText) {
  const t = flat(rawText);
  const m = (re) => t.match(re);

  const pub = m(/Date de publication\s*:\s*(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i) || m(/Publication\s*:\s*(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
  const week = m(/Semaine\s+(\d{1,2})-(\d{4})/i);
  const asOf = m(/Points clés au\s+(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);

  // West Nile
  const wnv = m(/(\d[\d\s]*)\s+cas autochtones d.infection à virus West Nile(?:\s*\(([+-]\s*\d+)[^)]*\))?/i);
  const wnvBlock = (() => { const i = t.search(/Infections à virus West[- ]Nile\s+Transmission autochtone/i); return i >= 0 ? t.slice(i, i + 2500) : t; })();
  const asym = wnvBlock.match(/(\d+)\s+étaient asymptomatiques/i);
  const sym = wnvBlock.match(/(\d+)\s+étaient symptomatiques/i);
  const neuro = wnvBlock.match(/(\d+)\s*\([^)]*\)\s*formes neuro-invasives/i);
  const deaths = wnvBlock.match(/(\d+)\s+décès\s*\(/i);
  const regionsSentence = m(/cas autochtones d.infection à virus West Nile[^.]*?identifiés en France hexagonale\.\s*Ils se situent dans les régions\s+([^.]+)\./i);
  const regions = [];
  if (regionsSentence) {
    // « Région A (3 départements concernés), Région B (département du Loiret) et Région C (…) »
    for (const part of regionsSentence[1].split(/\),\s*|\)\s+et\s+/)) {
      const r = part.match(/^\s*(?:et\s+)?(.+?)\s*\((?:(\d+)\s+départements?|département)/i);
      if (r) regions.push({ region: r[1].trim(), departements: r[2] ? int(r[2]) : 1 });
    }
  }
  const unknownPlace = m(/Pour\s+(\d+)\s+cas,\s+aucun lieu précis de contamination/i);

  // Chikungunya / dengue / Zika autochtones
  const chik = m(/(\d+)\s+épisodes? de chikungunya[^;]*?totalisant\s+(\d+)\s+cas/i);
  const dengue = m(/(\d+)\s+épisodes? de dengue[^;.]*?totalisant\s+(\d+)\s+cas/i);
  const zika = m(/(\d+)\s+épisodes? de Zika[^;.]*?totalisant\s+(\d+)\s+cas/i);

  // Cas importés
  const imp = name => int(m(new RegExp(`(\\d[\\d\\s]*)\\s+cas importés de ${name}`, 'i'))?.[1]);

  return {
    publicationDate: pub ? frDate(pub[1], pub[2], pub[3]) : null,
    epiWeek: week ? `${week[2]}-S${String(week[1]).padStart(2, '0')}` : null,
    dataAsOf: asOf ? frDate(asOf[1], asOf[2], asOf[3]) : null,
    westNile: {
      autochthonousCases: int(wnv?.[1]),
      weeklyChange: wnv?.[2] ? int(wnv[2].replace(/\s/g, '')) : null,
      asymptomatic: int(asym?.[1]),
      symptomatic: int(sym?.[1]),
      neuroinvasive: int(neuro?.[1]),
      deaths: int(deaths?.[1]),
      deathsNote: deaths ? 'Données du signalement initial, susceptibles d\'être incomplètes ; ne permettent pas de déterminer si ces décès sont imputables au virus (SPF).' : null,
      regions,
      casesWithoutKnownPlace: int(unknownPlace?.[1]),
    },
    chikungunya: { autochthonousEpisodes: int(chik?.[1]), autochthonousCases: int(chik?.[2]), importedCases: imp('chikungunya') },
    dengue: { autochthonousEpisodes: int(dengue?.[1]), autochthonousCases: int(dengue?.[2]), importedCases: imp('dengue') },
    zika: { autochthonousEpisodes: int(zika?.[1]), autochthonousCases: int(zika?.[2]), importedCases: imp('Zika') },
  };
}
