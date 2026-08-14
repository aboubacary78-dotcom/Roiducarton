/*
 * À quoi ressemble l'écriture du jeu, vue de loin ?
 *
 * « Beaucoup de passages font IA. » Pour agir dessus il faut savoir CE QUI
 * fait IA. On extrait tous les textes français des données du jeu et on
 * cherche des tics de forme — pas des mots interdits, des STRUCTURES qui se
 * répètent. Une bonne formule employée trois fois est un style ; employée
 * deux cents fois, c'est une machine.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'client/src/contexts/data';
const fichiers = readdirSync(DATA).filter(f => f.endsWith('.ts'));

// On récupère les littéraux français : les chaînes assez longues pour être de
// la prose, en écartant les clés techniques et les chaînes anglaises.
const textes = [];
for (const f of fichiers) {
  const src = readFileSync(join(DATA, f), 'utf8');
  const re = /(?:^|[\s:{,(])(?:text|desc|hint|name|label|result|description)\s*:\s*(['"`])((?:\\.|(?!\1).){25,400})\1/gms;
  let m;
  while ((m = re.exec(src))) {
    const brut = m[2].replace(/\\'/g, "'").replace(/\\n/g, ' ').trim();
    // On saute l'anglais : les clés *En sont capturées séparément, mais
    // certaines chaînes anglaises passent par 'name'. Heuristique simple.
    if (/\b(the|you|your|with|and then|of the)\b/i.test(brut) && !/[àâçéèêëîïôùûü]/.test(brut)) continue;
    textes.push({ fichier: f, texte: brut });
  }
}

console.log(`Corpus : ${textes.length} passages français dans ${fichiers.length} fichiers.\n`);

const mots = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z']{4,}/g) || [];
const phrases = s => s.split(/(?<=[.!?…])\s+/).filter(p => p.trim().length > 1);

// --- Tic n°1 : la chute courte qui reprend un mot de la phrase d'avant -----
// « Le glacier tourne le dos à sa caisse à chaque cornet. Trois secondes par
//   cornet. » — la blague atterrit toujours de la même façon.
let echo = 0; const exemplesEcho = [];
// --- Tic n°2 : la chute courte tout court (fragment final < 6 mots) --------
let fragment = 0; const exemplesFragment = [];
// --- Tic n°3 : deux-points suivis d'une chute -----------------------------
let deuxPoints = 0; const exemplesDeuxPoints = [];
// --- Tic n°4 : énumération de trois ---------------------------------------
let regleDeTrois = 0; const exemplesTrois = [];
// --- Tic n°5 : négation-parallèle « ce n'est pas X, c'est Y » -------------
let paraNeg = 0; const exemplesPara = [];

for (const t of textes) {
  const ph = phrases(t.texte);
  if (ph.length >= 2) {
    const derniere = ph[ph.length - 1];
    const avant = ph[ph.length - 2];
    const nbMots = (derniere.match(/\S+/g) || []).length;
    if (nbMots <= 6) {
      fragment++;
      if (exemplesFragment.length < 5) exemplesFragment.push(t);
      const communs = mots(derniere).filter(w => mots(avant).includes(w));
      if (communs.length > 0) {
        echo++;
        if (exemplesEcho.length < 6) exemplesEcho.push({ ...t, mot: communs[0] });
      }
    }
  }
  const dp = t.texte.match(/[^.!?]{10,}\s?:\s[^.!?]{3,60}[.!?]?$/);
  if (dp) { deuxPoints++; if (exemplesDeuxPoints.length < 5) exemplesDeuxPoints.push(t); }
  if (/\b\w+, \w[^,.]{2,25}, (?:et |puis )?\w[^,.]{2,25}[.!]/.test(t.texte)) {
    regleDeTrois++; if (exemplesTrois.length < 4) exemplesTrois.push(t);
  }
  if (/n[e'’]\s?\w*\s?(?:pas|plus) [^,.]{3,40}, (?:c'est|mais) /i.test(t.texte)) {
    paraNeg++; if (exemplesPara.length < 4) exemplesPara.push(t);
  }
}

const pc = n => `${((n / textes.length) * 100).toFixed(1)} %`;
const bloc = (titre, n, ex, cle) => {
  console.log(`${titre} : ${n} passages (${pc(n)})`);
  for (const e of ex) console.log(`   · ${e.texte.slice(0, 118)}${e.texte.length > 118 ? '…' : ''}${cle && e[cle] ? `   [${e[cle]}]` : ''}`);
  console.log();
};

bloc('Chute courte qui répète un mot de la phrase précédente', echo, exemplesEcho, 'mot');
bloc('Chute courte finale (≤ 6 mots), tous cas', fragment, exemplesFragment);
bloc('Deux-points suivis d\'une chute', deuxPoints, exemplesDeuxPoints);
bloc('Énumération de trois', regleDeTrois, exemplesTrois);
bloc('« ne … pas X, c\'est Y »', paraNeg, exemplesPara);

// --- Répartition par fichier de la structure dominante ---------------------
const parFichier = {};
for (const t of textes) {
  const ph = phrases(t.texte);
  const dernier = ph[ph.length - 1] || '';
  const court = ph.length >= 2 && (dernier.match(/\S+/g) || []).length <= 6;
  parFichier[t.fichier] ??= { total: 0, court: 0 };
  parFichier[t.fichier].total++;
  if (court) parFichier[t.fichier].court++;
}
console.log('Part de passages finissant sur une chute courte, par fichier :');
Object.entries(parFichier)
  .filter(([, v]) => v.total >= 12)
  .sort((a, b) => b[1].court / b[1].total - a[1].court / a[1].total)
  .slice(0, 14)
  .forEach(([f, v]) => console.log(`  ${((v.court / v.total) * 100).toFixed(0).padStart(3)} %  ${String(v.court).padStart(3)}/${String(v.total).padEnd(4)} ${f}`));
