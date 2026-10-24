// Usage : node check-tree.mjs B-arbre.json
import fs from 'node:fs';
const f=process.argv[2]; if(!f){console.error('usage: node check-tree.mjs <arbre.json>');process.exit(2);}
const t=JSON.parse(fs.readFileSync(f,'utf8')); const err=[]; const M=new Map();
for(const n of t.noeuds){ if(M.has(n.id)) err.push('doublon '+n.id); M.set(n.id,n); }
const KEYS=['id','type','texte','aide','choix','condition_activation','niveau_orientation','delai_action','signes_reconsultation','source','a_valider_clinicien'];
const NIV={urgence_vitale:'immediat',urgence_sans_delai:'moins_de_2h',consultation_urgente:'moins_de_6h',consultation_rapide:'moins_de_24h',consultation_programmee:'moins_de_48h',autosoins_surveillance:'surveillance'};
if(!M.has(t.racine)) err.push('racine absente');
for(const n of M.values()){
  for(const k of KEYS) if(!(k in n)) err.push(`${n.id}: champ ${k} manquant`);
  if(n.a_valider_clinicien!==true) err.push(n.id+': a_valider_clinicien != true');
  if(!['question','resultat','urgence'].includes(n.type)) err.push(n.id+': type invalide');
  for(const c of n.choix||[]) if(!M.has(c.vers)) err.push(`${n.id}: vers absent ${c.vers}`);
  if(n.type==='question'&&!n.choix.length) err.push(n.id+': question sans choix');
  if(n.type!=='question'){ if(n.choix.length) err.push(n.id+': terminal avec choix');
    if(NIV[n.niveau_orientation]!==n.delai_action) err.push(n.id+': niveau/délai incohérents');
    if(n.modulable!==true) err.push(n.id+': modulable manquant'); }
  if(n.type==='question'&&/(°C|%|\/min|mmHg)/.test(n.texte+n.choix.map(c=>c.libelle).join(' '))&&n.id!=='T_PALU'&&!n.choix.some(c=>/ne sais pas/i.test(c.libelle))) err.push(n.id+': question chiffrée sans « Je ne sais pas »');
  if(/aucun risque/i.test(JSON.stringify(n))) err.push(n.id+': formulation « aucun risque »');
}
// atteignabilité
const seen=new Set(); const st=[t.racine];
while(st.length){const id=st.pop(); if(seen.has(id)||!M.has(id)) continue; seen.add(id); for(const c of M.get(id).choix) st.push(c.vers);}
for(const id of M.keys()) if(!seen.has(id)) err.push('inatteignable '+id);
// boucles (les arêtes vers U00 sont des retours volontaires)
const col=new Map(); let maxQ=0; const memo=new Map();
const isCounted=id=>M.get(id).type==='question'&&!id.startsWith('U')&&id!=='POP00';
function dfs(id,stack){ col.set(id,1);
  for(const c of M.get(id).choix){ if(c.vers==='U00') continue;
    if(col.get(c.vers)===1) err.push('boucle: '+[...stack,id,c.vers].join(' > '));
    else if(!col.get(c.vers)) dfs(c.vers,[...stack,id]); }
  col.set(id,2); }
if(M.has(t.racine)) dfs(t.racine,[]);
// nb max de questions hors urgence avant un résultat
function depth(id){ if(memo.has(id)) return memo.get(id); const n=M.get(id); let d=0;
  for(const c of n.choix) if(c.vers!=='U00') d=Math.max(d,depth(c.vers)); d+=isCounted(id)?1:0; memo.set(id,d); return d; }
if(!err.some(e=>e.startsWith('boucle'))){ maxQ=depth(t.racine); if(maxQ>7) err.push('chemin de '+maxQ+' questions hors urgence (> 7)'); }
const cnt=[...M.values()].reduce((a,n)=>(a[n.type]=(a[n.type]||0)+1,a),{});
console.log(`${M.size} nœuds`,cnt,`max questions hors urgence: ${maxQ}`);
if(err.length){console.error(err.join('\n'));process.exit(1);} console.log('OK : références, atteignabilité, absence de boucle, format.');
