// E-run.mjs — relecteur E : passe 90 vignettes dans arbre-fusion.json (ne modifie pas l'arbre)
// Usage : node E-run.mjs   -> écrit E-vignettes.json à côté
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const A = JSON.parse(fs.readFileSync(path.join(dir, 'arbre-fusion.json'), 'utf8'));
const N = Object.fromEntries(A.noeuds.map(n => [n.id, n]));
const LV = ['autosoins_surveillance','consultation_programmee','consultation_rapide','consultation_urgente','urgence_vitale'];
const L = x => LV.indexOf(x);
const AGE = {n:'Moins de 3 mois', b:'De 3 mois à 2 ans', e:'De 2 à 15 ans', a:'De 16 à 64 ans', v:'65 ans ou plus', '?':'Je ne sais pas'};
const POPS = {chimio:'Chimiothérapie', pp:'Accouchement', diad:'Diabète avec soif', cir:'Cirrhose', chute:'65 ans ou plus : chute', imm:'Cancer ou hémopathie', vih:'Infection par le VIH', greffe:'Greffe', bio:'Biothérapie', asp:'Rate retirée', gro:'Grossesse', dia:'Diabète', ic:'Insuffisance cardiaque', ir:'Insuffisance respiratoire', irn:'Insuffisance rénale', jnsp:'Je ne sais pas'};
// Vignettes : attendu FIGÉ avant tout test (copié de vignettes-attendu, rédigé avant lecture de l'arbre).
// age, pops, f = flags modulation (fev 1|0|'?', resp, uri, erupt, conf, chute, pied, ess, desh), a = réponses {noeud: début de libellé}, amb = ambiguïté notée
const V = [
['V01','Homme 30 ans, fièvre 38,3 °C depuis 24 h, bon état général, aucun autre signe','autosoins_surveillance',0,'a',[],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V02',"Femme 40 ans, fièvre 38,5 °C depuis 4 jours sans point d'appel, bon état général",'consultation_rapide',0,'a',[],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'72'}],
['V03','Homme 25 ans, syndrome grippal (fièvre 39, courbatures, toux sèche) depuis 2 jours, bien toléré','autosoins_surveillance',0,'a',[],{fev:1,resp:1},{T00:'Fièvre avec',G04:'Moins'}],
['V04','Femme 70 ans, syndrome grippal depuis 24 h, sans signe de gravité','consultation_rapide',0,'v',[],{fev:1,resp:1},{T00:'Fièvre avec',G04:'Moins'}],
['V05','Homme 50 ans, grippe, essoufflement au moindre effort, lèvres bleutées','urgence_vitale',1,'a',[],{fev:1,resp:1,ess:1},{U05:'Oui'}],
['V06','Femme 28 ans, rhinopharyngite banale 3 jours, pas de fièvre','autosoins_surveillance',0,'a',[],{fev:0,resp:1},{T00:'Toux, nez',R01:'Nez',R02:'Non'}],
['V07','Homme 35 ans, angine fièvre 38,5, douleur à la déglutition, peut avaler','consultation_programmee',0,'a',[],{fev:1},{T00:'Gorge, oreille',O03:'Gorge',O04:'Oui'}],
['V08','Homme 30 ans, mal de gorge intense, ne peut plus avaler sa salive, bave, voix étouffée','urgence_vitale',1,'a',[],{fev:1},{T00:'Gorge, oreille',O01:'Oui'},'U05 répondu Non : la gêne est ressentie à la déglutition, pas comme dyspnée'],
['V09','Femme 45 ans, toux fébrile 39 °C depuis 3 jours, douleur thoracique en respirant, gêne respiratoire modérée','consultation_urgente',1,'a',[],{fev:1,resp:1},{T00:'Toux, nez',R01:'Toux',R03:'Je ne sais pas',R04:'38 °C ou plus, depuis 3'},"T00 : choix entre 'Fièvre avec … toux' (branche G, pose dyspnée/douleur pleurale) et 'Toux… gêne pour respirer' (branche R, ne les pose pas) ; lecture retenue = R (libellé contient 'gêne pour respirer') ; U16 Non (douleur pleurale ≠ oppression)"],
['V10','Homme 60 ans, toux + fièvre, confusion récente, respiration rapide','urgence_vitale',1,'a',[],{fev:1,resp:1,conf:1},{U08:'Oui'}],
['V11','Femme 30 ans, toux sans fièvre depuis 10 jours, bon état général','consultation_programmee',0,'a',[],{fev:0,resp:1},{T00:'Toux, nez',R01:'Toux',R03:'Je ne sais pas',R04:'Moins de 38 °C, toux depuis moins',R07:'Non'}],
['V12','Homme 55 ans BPCO, aggravation de la toux et de l\'essoufflement, crachats purulents, fièvre 38,4','consultation_urgente',1,'a',['ir'],{fev:1,resp:1,ess:1},{T00:'Toux, nez',R01:'Toux',R03:'Je ne sais pas',R04:'38 °C ou plus, depuis moins',R07:'Non'}],
['V13','Femme 35 ans, gastro-entérite 24 h, boit bien, urine normalement','autosoins_surveillance',0,'a',[],{fev:0},{T00:'Ventre',D04:'Moins',D05:'Moins'}],
['V14',"Homme 80 ans, diarrhée 2 jours, ne boit plus, somnolent, n'urine plus",'urgence_vitale',1,'v',[],{fev:0,desh:1},{U04:'Oui'}],
['V15','Femme 25 ans, vomissements incoercibles 24 h, ne garde rien, vertiges','consultation_urgente',1,'a',[],{fev:0,desh:1},{T00:'Ventre',D01:'Oui'},'U12 : vertiges mais tient debout → Non'],
['V16','Homme 40 ans, diarrhée sanglante + fièvre 39 °C','consultation_urgente',1,'a',[],{fev:1},{T00:'Ventre',D02:'Oui'},'U15 « sang dans les selles » : un patient moyen répondra Oui → U00 ; lecture retenue Non pour tester la branche D (sinon sur-triage)'],
['V17','Homme 20 ans, douleur fosse iliaque droite + fièvre 38,2, vomissements','consultation_urgente',1,'a',[],{fev:1},{T00:'Ventre',D02:'Oui'}],
['V18',"Femme 50 ans, plaque rouge chaude douloureuse de la jambe qui s'étend, fièvre 38,5",'consultation_urgente',1,'a',[],{fev:1},{T00:'Peau',C01:'Oui',C02:'Non'}],
['V19','Homme 60 ans diabétique, rougeur jambe extensive très douloureuse, douleur disproportionnée, taches violacées, fièvre','urgence_vitale',1,'a',['dia'],{fev:1,pied:1},{T00:'Peau',C01:'Oui',C02:'Oui'}],
['V20','Enfant 6 ans, varicelle typique, bon état général','autosoins_surveillance',0,'e',[],{fev:1,erupt:1},{T00:'Peau',C01:'Non',C03:'Oui',C04:'Non'}],
['V21',"Homme 19 ans, fièvre 39,5 + taches violacées qui ne s'effacent pas à la pression",'urgence_vitale',1,'a',[],{fev:1,erupt:1},{U09:'Oui'}],
['V22','Femme 30 ans, petit bouton infecté (furoncle) sans fièvre','autosoins_surveillance',0,'a',[],{fev:0},{T00:'Peau',C01:'Non',C03:'Non',C05:'Non'}],
['V23','Femme 28 ans, brûlures urinaires sans fièvre, pas enceinte','consultation_programmee',0,'a',[],{fev:0,uri:1},{T00:'Brûlures',UR01:'Non',UR03:'Non',UR05:'Non',UR06:'Une femme'}],
['V24','Femme 34 ans, 30 SA, fièvre 38,6 depuis 24 h, brûlures urinaires, douleur lombaire droite','consultation_urgente',1,'a',['gro'],{fev:1,uri:1},{T00:'Brûlures',UR01:'Oui',UR02:'Oui'}],
['V25','Femme 30 ans, fièvre 39 + douleur lombaire gauche + brûlures urinaires, non enceinte','consultation_urgente',1,'a',[],{fev:1,uri:1},{T00:'Brûlures',UR01:'Non',UR03:'Oui',UR04:'Oui'}],
['V26','Homme 65 ans, brûlures urinaires + fièvre 38,8','consultation_urgente',1,'v',[],{fev:1,uri:1},{T00:'Brûlures',UR01:'Non concerné',UR03:'Non',UR05:'Oui'}],
['V27','Femme 24 ans, 12 SA, brûlures urinaires sans fièvre','consultation_rapide',0,'a',['gro'],{fev:0,uri:1},{T00:'Brûlures',UR01:'Oui',UR02:'Non'}],
['V28','Homme 45 ans, ne peut plus uriner, fièvre, douleur pelvienne','consultation_urgente',1,'a',[],{fev:1,uri:1},{T00:'Brûlures',UR01:'Non concerné',UR03:'Non',UR05:'Oui'},'Aucune entrée T00 pour rétention ; U14 Non (urine par petites quantités < 12 h)'],
['V29','Enfant 4 ans, otalgie fébrile 38,5, bon état','consultation_programmee',0,'e',[],{fev:1},{T00:'Gorge, oreille',O03:'Oreille',O05:'Non'}],
['V30',"Enfant 3 ans, gonflement rouge derrière l'oreille, oreille décollée, fièvre",'consultation_urgente',1,'e',[],{fev:1},{T00:'Gorge, oreille',O02:'Oui'}],
['V31','Femme 40 ans, sinusite (douleur faciale, nez bouché) 5 jours sans fièvre','consultation_programmee',0,'a',[],{fev:0},{T00:'Gorge, oreille',O03:'Nez',O06:'Non'}],
['V32','Homme 35 ans, gonflement de la paupière, œil rouge, douleur, vision trouble, fièvre','urgence_vitale',1,'a',[],{fev:1},{T00:'Gorge, oreille',O02:'Oui'},'T00 ambigu (pas d\'entrée « œil ») ; trouble visuel jamais posé hors branche N'],
['V33','Femme 22 ans, fièvre 39,5 + céphalées intenses + raideur de nuque','urgence_vitale',1,'a',[],{fev:1},{U10:'Oui'}],
['V34','Homme 70 ans, fièvre + confusion soudaine','urgence_vitale',1,'v',[],{fev:1,conf:1},{U08:'Oui'}],
['V35','Homme 30 ans, fièvre + convulsion','urgence_vitale',1,'a',[],{fev:1},{U11:'Oui'}],
['V36','Femme 45 ans, fièvre 38,5 + mal de tête modéré, pas de raideur, bon état','consultation_rapide',0,'a',[],{fev:1},{T00:'Maux de tête',N03:'38',N04:'Non'}],
['V37','Homme 60 ans, fièvre 39, frissons, marbrures des genoux, pâle, très faible','urgence_vitale',1,'a',[],{fev:1},{U13:'Oui'}],
['V38','Femme 55 ans, fièvre + tension basse ressentie, malaise, respiration rapide','urgence_vitale',1,'a',[],{fev:1},{U12:'Oui'}],
['V39','Homme 50 ans, fièvre 38,5 + frissons intenses, très fatigué, sans autre signe','consultation_urgente',1,'a',[],{fev:1},{T00:'Frissons',S01:'Je ne sais pas',S02B:'Non',S03B:'Je ne sais pas'}],
['V40','Homme 35 ans, retour du Mali il y a 10 jours, fièvre 39 sans autre signe','consultation_urgente',1,'a',[],{fev:1},{T_PALU:'Oui',V01:'Oui',V02:'Oui'}],
['V41',"Femme 30 ans, retour Côte d'Ivoire il y a 2 mois, fièvre 38,5",'consultation_urgente',1,'a',[],{fev:1},{T_PALU:'Oui',V01:'Oui',V02:'Oui'}],
['V42','Homme 40 ans, retour Guinée il y a 8 jours (contact cas Ebola), fièvre + saignements gencives','urgence_vitale',1,'a',[],{fev:1},{U15:'Oui'}],
['V43','Femme 28 ans, retour Thaïlande il y a 5 jours, fièvre, douleurs musculaires, éruption','consultation_rapide',0,'a',[],{fev:1,erupt:1},{T_PALU:'Non',T00:'Retour',V01:'Oui',V02:'Non',V03:'Non',V04:'Oui'},'Zone palustre Thaïlande : le patient ne sait pas → aurait pu répondre JNSP'],
['V44','Homme 45 ans, retour Afrique, fièvre + confusion','urgence_vitale',1,'a',[],{fev:1,conf:1},{U08:'Oui'}],
['V45','Homme 25 ans, écoulement urétral purulent, brûlures','consultation_rapide',0,'a',[],{fev:0},{T00:'Symptôme génital',I01:'Non',I02:'Non',I03:'Oui'},'T00 ambigu avec « Brûlures en urinant »'],
['V46','Femme 30 ans, rapport non protégé il y a 24 h avec partenaire VIH+','consultation_urgente',1,'a',[],{fev:0},{T00:'Symptôme génital',I01:'Oui'}],
['V47','Femme 25 ans, douleur pelvienne + fièvre + pertes anormales','consultation_urgente',1,'a',[],{fev:1},{T00:'Symptôme génital',I01:'Non',I02:'Oui'}],
['V48','Homme 30 ans, ulcération génitale indolore','consultation_programmee',0,'a',[],{fev:0},{T00:'Symptôme génital',I01:'Non',I02:'Non',I03:'Oui'}],
['V49','Homme 40 ans, morsure de chien à la main il y a 2 h, plaie profonde','consultation_urgente',1,'a',[],{fev:0},{T00:'Morsure',M01:'Morsure',M02:'Oui'}],
['V50','Femme 50 ans, morsure de chat main, doigt gonflé rouge 24 h après','consultation_urgente',1,'a',[],{fev:0},{T00:'Morsure',M01:'Morsure',M02:'Oui'}],
['V51','Homme 35 ans, morsure de chien errant au Maroc, plaie superficielle de la jambe','consultation_urgente',1,'a',[],{fev:0},{T00:'Morsure',M01:'Morsure',M02:'Non',M03:'Oui'}],
['V52','Femme 40 ans, tique retirée il y a 2 jours, pas de symptôme','autosoins_surveillance',0,'a',[],{fev:0},{T00:'Morsure',M01:'Piqûre',M05:'Non',M06:'Non'}],
['V53',"Homme 55 ans, plaque rouge qui s'étend autour d'une piqûre de tique il y a 10 jours",'consultation_programmee',0,'a',[],{fev:0},{T00:'Morsure',M01:'Piqûre',M05:'Oui'}],
['V54','Homme 60 ans, tique + paralysie faciale','consultation_rapide',0,'a',[],{fev:0},{T00:'Morsure',M01:'Piqûre',M05:'Non',M06:'Oui'}],
['V55','Nourrisson 6 semaines, fièvre 38,2 °C, tète bien','urgence_vitale',1,'n',[],{fev:1},{U01:'Oui',U02:'38'}],
['V56','Nourrisson 2 mois, température 38,0 rectale, un peu grognon','urgence_vitale',1,'n',[],{fev:1},{U01:'Oui',U02:'38'}],
['V57','Nourrisson 10 semaines, hypothermie 35,8, mou, tète mal','urgence_vitale',1,'n',[],{fev:0},{U01:'Oui',U02:'Moins',U03:'Non',T00:'Je ne sais pas',S01:'Je ne sais pas',S02B:'Oui'},'Hypothermie jamais posée ; U04 « ne réagit pas normalement » : lecture patient moyen = Non pour un bébé « mou »'],
['V58','Enfant 14 mois, fièvre 39 depuis 24 h, joue, boit bien','consultation_programmee',0,'b',[],{fev:1},{U03:'Non',T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V59','Enfant 18 mois, fièvre 39,5, geignard, ne réagit presque pas, teint gris','urgence_vitale',1,'b',[],{fev:1},{U03:'Non',U04:'Oui'}],
['V60','Enfant 8 mois, diarrhée + vomissements, couches sèches depuis 8 h','consultation_urgente',1,'b',[],{fev:0,desh:1},{U03:'Non',T00:'Ventre',D01:'Non',D04:'Moins',D05:'Moins'},'D01 : vomit mais garde un peu → Non'],
['V61','Enfant 1 an, bronchiolite, tirage, ne boit plus que la moitié des biberons','consultation_urgente',1,'b',[],{fev:0,resp:1,desh:1},{U03:'Non',U05:'Oui'}],
['V62','Enfant 5 ans, fièvre 39 depuis 6 jours, yeux rouges, lèvres rouges, éruption','consultation_urgente',1,'e',[],{fev:1,erupt:1},{T00:'Peau',C01:'Non',C03:'Oui',C04:'Oui'},'Si T00 = « Fièvre sans autre symptôme » → RF_24H (sous-triage)'],
['V63','Enfant 7 ans, fièvre 38,5 depuis 24 h, toux, bon état','autosoins_surveillance',0,'e',[],{fev:1,resp:1},{T00:'Fièvre avec',G04:'Moins'}],
['V64','Enfant 10 ans, fièvre + taches violacées','urgence_vitale',1,'e',[],{fev:1,erupt:1},{U09:'Oui'}],
['V65','Femme 32 ans, 20 SA, fièvre 38,5 isolée','consultation_urgente',1,'a',['gro'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V66','Femme 29 ans, 34 SA, fièvre + contractions + pertes liquides','urgence_vitale',1,'a',['gro'],{fev:1},{T00:'Ventre',D01:'Non',D02:'Non',D04:'38,5'},'Aucune question obstétricale ; T00 sans entrée adaptée'],
['V67','Femme 30 ans, 8 SA, rhume sans fièvre','autosoins_surveillance',0,'a',['gro'],{fev:0,resp:1},{T00:'Toux, nez',R01:'Nez',R02:'Non'}],
['V68','Femme 26 ans, enceinte 3 mois, syndrome grippal','consultation_rapide',0,'a',['gro'],{fev:1,resp:1},{T00:'Fièvre avec',G04:'Moins'}],
['V69','Femme 31 ans, accouchée il y a 5 jours, fièvre 39, douleur pelvienne','consultation_urgente',1,'a',[],{fev:1},{T00:'Ventre',D02:'Non',D04:'38,5'},'Post-partum absent de POP01 (répond « Aucune »)'],
['V70','Homme 78 ans, fatigue inhabituelle, chutes, sans fièvre, depuis 24 h, toux légère','consultation_urgente',1,'v',[],{fev:0,chute:1,resp:1},{T00:'Frissons',S01:'Je ne sais pas',S02B:'Non',S03B:'Je ne sais pas'},'Chute jamais posée (MOD11 inopérant)'],
['V71','Femme 85 ans, ne mange plus, plus confuse que d\'habitude, pas de fièvre','urgence_vitale',1,'v',[],{fev:0,conf:1},{U08:'Oui'}],
['V72','Homme 70 ans, fièvre 38,2 isolée, bon état','consultation_rapide',0,'v',[],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V73','Femme 55 ans sous chimiothérapie, fièvre 38,3','urgence_vitale',1,'a',['imm'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V74','Homme 45 ans greffé rénal, fièvre 38,5 + toux','consultation_urgente',1,'a',['greffe'],{fev:1,resp:1},{T00:'Fièvre avec',G04:'Moins'}],
['V75','Homme 40 ans VIH non traité, fièvre + toux 2 semaines','consultation_urgente',1,'a',['vih'],{fev:1,resp:1},{T00:'Toux, nez',R01:'Toux',R03:'Je ne sais pas',R04:'38 °C ou plus, depuis 3'}],
['V76','Femme 35 ans sous anti-TNF, fièvre 38,4 isolée','consultation_urgente',1,'a',['bio'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V77','Homme 40 ans splénectomisé, fièvre 38,5 + frissons','urgence_vitale',1,'a',['asp'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F03:'Oui'}],
['V78','Femme 60 ans asplénie (drépanocytose), fièvre 38 isolée','consultation_urgente',1,'a',['asp'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V79','Homme 58 ans diabétique, plaie du pied rouge gonflée, fièvre','consultation_urgente',1,'a',['dia'],{fev:1,pied:1},{T00:'Peau',C01:'Oui',C02:'Non'}],
['V80','Femme 65 ans diabétique, vomissements, très soif, fièvre','consultation_urgente',1,'v',['dia'],{fev:1,desh:1},{T00:'Ventre',D01:'Non',D04:'Moins',D05:'Moins'},'Fièvre « sensation » sans chiffre : D04 = Moins de 38,5'],
['V81','Homme 70 ans insuffisant rénal dialysé, fièvre 38,5','consultation_urgente',1,'v',['irn'],{fev:1},{T00:'Fièvre sans',F01:'38 à',F02:'Moins',F04:'Boit et'}],
['V82','Homme 65 ans insuffisant cardiaque, toux fébrile + essoufflement aggravé','consultation_urgente',1,'v',['ic'],{fev:1,resp:1,ess:1},{T00:'Toux, nez',R01:'Toux',R03:'Je ne sais pas',R04:'38 °C ou plus, depuis moins',R07:'Non'}],
['V83','Homme 60 ans cirrhotique, fièvre + ventre gonflé douloureux','consultation_urgente',1,'a',[],{fev:1},{T00:'Ventre',D01:'Non',D02:'Oui'},'Cirrhose absente de POP01 ; D02 « intense et permanente » interprété Oui'],
['V84','Femme 50 ans, répond « Je ne sais pas » à toutes les questions, fièvre 39','consultation_rapide',0,'?',['jnsp'],{fev:'?'},'JNSP'],
['V85','Homme 80 ans, « Je ne sais pas » répété, fièvre','consultation_urgente',1,'?',['jnsp'],{fev:'?'},'JNSP'],
['V86','Femme 75 ans, pas de fièvre, brûlures urinaires, désorientée depuis ce matin','urgence_vitale',1,'v',[],{fev:0,uri:1,conf:1},{U08:'Oui'}],
['V87','Homme 30 ans, fièvre tombée sous paracétamol mais frissons, se sent très mal, extrémités froides','urgence_vitale',1,'a',[],{fev:1},{U13:'Oui'}],
['V88','Femme 40 ans, retour Mali il y a 10 jours, se dit « juste fatiguée », température 37,8','consultation_urgente',1,'a',[],{fev:0},{T_PALU:'Non',T00:'Retour',V01:'Non',V05:'Non'},'Fébricule 37,8 < 38 : patient répond Non à la fièvre'],
['V89','Homme 50 ans, douleur thoracique + fièvre','urgence_vitale',1,'a',[],{fev:1},{U16:'Oui'}],
['V90','Enfant 3 ans, pétéchies + fièvre, mais joue normalement','urgence_vitale',1,'e',[],{fev:1,erupt:1},{U09:'Oui'}],
];
// ---- Cycle 2 : re-routage des CHEMINS uniquement (vignette, attendu, gravité inchangés). pops/flags = faits de la vignette mappés sur les nouveaux choix.
const ROUTE2 = {
  V08:{a:{O01:'Impossible'}}, V09:{a:{R01B:'Essoufflement'}}, V11:{a:{R01B:'Aucun de ces signes, pas'}},
  V12:{a:{R01B:'Essoufflement'}}, V75:{a:{R01B:'Aucun de ces signes, pas'}}, V82:{a:{R01B:'Essoufflement'}},
  V18:{a:{C02F:'Oui'}}, V19:{}, V79:{a:{C02F:'Oui'}},
  V23:{a:{UR05:'Pas de fièvre, chez une femme'}}, V26:{a:{UR05:'Fièvre, chez un homme'}}, V28:{a:{UR00:'Oui'}},
  V30:{a:{O02:'Derrière'}}, V32:{a:{T00:'Gorge, oreille',O02:"Autour de l'œil, avec"}},
  V57:{a:{U02:'Moins de 36'}}, V65:{a:{U_GRO01:'Non'}}, V66:{a:{U_GRO01:'Oui'}}, V67:{a:{U_GRO01:'Non'}}, V68:{a:{U_GRO01:'Non'}},
  V24:{a:{U_GRO01:'Non'}}, V27:{a:{U_GRO01:'Non'}},
  V69:{pops:['pp']}, V70:{pops:['chute']}, V73:{pops:['chimio']}, V77:{f:{frissons:1}}, V80:{pops:['dia','diad']}, V83:{pops:['cir']},
  V88:{a:{T_PALU:'Oui',V01:'Oui',V02:'Oui'}, amb:'T_PALU inclut désormais la fatigue : le patient répond Oui'},
  V29:{a:{O05:'Enfant de moins'}}, V45:{a:{I03:'Écoulement de pus'}}, V48:{a:{I03:'Oui, autre'}}, V55:{a:{U02:'38'}}, V56:{a:{U02:'38'}},
};
function defaultChoice(n, age, jnsp) {
  const by = p => n.choix.find(c => c.libelle.startsWith(p));
  if (jnsp) return by('Je ne sais pas') || n.choix[n.choix.length - 1];
  if (n.id === 'U01') return by(age === 'n' ? 'Oui' : 'Non');
  if (n.id === 'U02') return by('36 à');
  if (n.id === 'U03') return by(age === 'n' || age === 'b' ? 'Non' : 'Non concerné');
  if (['U06','U07','R03','S01','S05'].includes(n.id)) return by('Je ne sais pas');
  if (n.id === 'S03A') return by('Pas de tensiomètre'); if (n.id === 'S03B') return by('Je ne sais pas');
  if (n.id === 'O01') return by('Aucun');
  return by('Non') || null;
}
// ---- Cycle 3 : moteur de modulation = évaluation du champ "condition" (tokens posés par les choix du chemin uniquement)
const GROUPES = [['pop_chimio','pop_immunodeprime'],['pop_asplenie'],['pop_grossesse','pop_post_partum'],['pop_65_plus'],['pop_diabete','pop_diabete_desequilibre'],['pop_insuffisance_organe'],['pop_nourrisson_moins_3m']];
function evalCond(expr, P) {
  const js = expr.replace(/[A-Za-z_][A-Za-z_0-9]*/g, t => t === 'true' || t === 'false' ? t : t === 'cumul_2_groupes' ? String(GROUPES.filter(g => g.some(P)).length >= 2) : String(P(t)));
  return Function('return (' + js + ')')();
}
function moduler(clin, P) {
  let lvl = clin, rel = 0; const mods = [];
  for (const r of A.regles_modulation) {
    if (r.id === 'MODG' || !r.condition || !evalCond(r.condition, P)) continue;
    if (r.effet === 'plancher' && LV.includes(r.valeur)) { lvl = Math.max(lvl, L(r.valeur)); mods.push(r.id); }
    else if (r.effet === 'relever') { rel = 1; mods.push(r.id); }
  }
  // regle_fusion : relèvement au plus +1, plafonné à consultation_urgente
  const relLvl = Math.min(L('consultation_urgente'), clin + rel);
  return { lvl: Math.max(lvl, rel ? relLvl : lvl), mods };
}
function run([id, vignette, attendu, grave, age, pops, f, ans, amb]) {
  const r2 = ROUTE2[id] || {};
  const jnsp = ans === 'JNSP'; ans = jnsp ? {} : { ...ans, ...(r2.a || {}) };
  pops = [...pops, ...(r2.pops || [])]; f = { ...f, ...(r2.f || {}) }; amb = r2.amb || amb;
  const chemin = []; const poses = new Set(); let cur = A.racine, steps = 0, res = null, issue = null;
  while (steps++ < 200) {
    const n = N[cur]; if (!n) { issue = 'impasse:' + cur; break; }
    if (n.type !== 'question') { res = n; chemin.push(cur); break; }
    let c;
    if (n.id === 'POP00') c = n.choix.find(x => x.libelle === AGE[age]);
    else if (n.id === 'POP01') { // réponses multiples : toutes les poses ; on suit le choix le plus spécifique (grossesse → U_GRO01)
      const sel = pops.length ? pops.map(p => n.choix.find(x => x.libelle.startsWith(POPS[p]))) : [n.choix.find(x => x.libelle.startsWith('Aucune'))];
      sel.forEach(x => x.pose && [].concat(x.pose).forEach(t => poses.add(t))); c = sel.find(x => x.vers !== 'T_PALU') || sel[0];
    } else c = ans[n.id] ? n.choix.find(x => x.libelle.startsWith(ans[n.id])) : defaultChoice(n, age, jnsp);
    if (!c) { issue = 'pas de choix pour ' + n.id; break; }
    if (c.pose && n.id !== 'POP01') [].concat(c.pose).forEach(t => poses.add(t));
    chemin.push(`${n.id}=${c.libelle.slice(0, 30)}`); cur = c.vers;
    if (chemin.filter(x => x.startsWith(n.id + '=')).length > 1) { issue = 'boucle:' + n.id; break; }
  }
  if (!res) return { id, vignette, attendu, obtenu: null, chemin, ecart: issue, gravite_ecart: 'IMPASSE' };
  const clin = L(res.niveau_orientation); const { lvl, mods } = moduler(clin, t => poses.has(t));
  const obtenu = LV[lvl], d = lvl - L(attendu);
  const ecart = d === 0 ? null : d < 0 ? 'sous-triage' : 'sur-triage';
  const gravite_ecart = d < 0 && grave ? 'FAUX NEGATIF GRAVE' : d < 0 ? 'sous-triage' : d > 0 ? 'sur-triage' : null;
  return { id, vignette, attendu, obtenu, grave: !!grave, chemin: [...chemin, `resultat:${res.id}(${res.niveau_orientation})`, ...mods.map(m => 'mod:' + m)], ecart, gravite_ecart, ambiguite: amb || null };
}
const out = V.map(run);
const outFile = process.argv[2] || 'E-vignettes-final.json';
fs.writeFileSync(path.join(dir, outFile), JSON.stringify(out, null, 2));
const g = out.filter(o => o.grave).length, fn = out.filter(o => o.gravite_ecart === 'FAUX NEGATIF GRAVE');
console.log('vignettes', out.length, 'graves', g, 'resultat atteint', out.filter(o => o.obtenu).length, 'FNG', fn.length,
  'sous', out.filter(o => o.gravite_ecart === 'sous-triage').length, 'sur', out.filter(o => o.ecart === 'sur-triage').length, 'concordants', out.filter(o => !o.ecart).length);
for (const o of out) if (o.ecart || process.env.ALL) console.log(o.id, o.gravite_ecart, o.attendu, '->', o.obtenu, '|', o.chemin.slice(-4).join(' '));
