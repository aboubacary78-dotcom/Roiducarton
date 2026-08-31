/*
 * DEUX CHOSES QU'AUCUNE ERREUR NE SIGNALE.
 *
 * ① L'ACCORD DES MÉTIERS. Les dix-sept métiers étaient écrits au masculin et
 *    rien d'autre : Simone s'affichait « Ancien Militaire » au choix du
 *    personnage, sur le hub, au cimetière et à l'écran de fin. Une partie sur
 *    deux, donc, et ça se lisait comme une faute de frappe.
 *
 *    Le piège en le corrigeant : chaque nom de métier est aussi une CLÉ DE
 *    TRADUCTION. Une forme féminine sans son entrée anglaise laisse « Ancienne
 *    Sommelière » au milieu d'un écran en anglais, ce qui remplace une faute
 *    par une autre. On vérifie donc les deux moitiés.
 *
 * ② LA RESTAURATION DES ACHATS. Obligatoire pour des produits non
 *    consommables, et premier motif de rejet sur ce type d'application. Le
 *    bouton doit exister AVANT la publication : c'est lui que cherche un
 *    joueur qui vient de changer de téléphone, et c'est lui que cherche
 *    l'examinateur de Google.
 *
 *     node scripts/test-metiers-restauration.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

// ── ① Les métiers, à la source ────────────────────────────────────────────
const world = readFileSync('client/src/contexts/data/world.ts', 'utf8');
const en = readFileSync('client/src/lib/content-en.ts', 'utf8');

// On ne lit que le bloc JOBS : `TRAITS` et les kits ont aussi des `name:`.
const blocJobs = world.split('export const JOBS')[1].split('export const TRAITS')[0];
const metiers = [...blocJobs.matchAll(/name: '([^']+)', nameF: '([^']+)'/g)]
  .map(m => ({ m: m[1], f: m[2] }));
const sansFeminin = [...blocJobs.matchAll(/\{ id: '[^']+', name: '([^']+)', description:/g)].map(m => m[1]);

verifier(`les ${metiers.length} métiers ont une forme féminine`,
  metiers.length === 17 && sansFeminin.length === 0,
  sansFeminin.length ? `sans féminin : ${sansFeminin.join(', ')}` : '');

// Le masculin ne doit pas se glisser dans le féminin, « Ancien Ouvrière ».
const malAccordes = metiers.filter(j => !j.f.startsWith('Ancienne '));
verifier('  …et toutes commencent par « Ancienne »',
  malAccordes.length === 0, malAccordes.map(j => j.f).join(', '));

// Chaque forme féminine doit avoir SA clé de traduction, sinon l'anglais
// retombe en français pour la moitié des personnages.
const nonTraduites = metiers.filter(j => !en.includes(`'${j.f}':`));
verifier('  …et chacune a sa traduction anglaise',
  nonTraduites.length === 0, nonTraduites.map(j => j.f).join(', '));

// Et elles doivent rendre la MÊME chose que le masculin : l'anglais ne
// s'accorde pas, deux traductions différentes seraient une divergence à venir.
const divergentes = [];
for (const j of metiers) {
  const t = (s) => en.split(`'${s}': `)[1]?.split('\n')[0]?.trim().replace(/,$/, '');
  if (t(j.m) && t(j.f) && t(j.m) !== t(j.f)) divergentes.push(`${j.f} → ${t(j.f)} ≠ ${t(j.m)}`);
}
verifier('  …identique à celle du masculin (l\'anglais ne s\'accorde pas)',
  divergentes.length === 0, divergentes.join(' · '));

// ── Dans le jeu ───────────────────────────────────────────────────────────
const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));
const pause = ms => new Promise(r => setTimeout(r, ms));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(700);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(400);

/*
 * On relance le tirage jusqu'à voir une femme : le trio est aléatoire, et
 * chercher l'accord sur un tirage entièrement masculin ne prouverait rien.
 */
await clic('Nouvelle|New Game'); await pause(1000);
let vue = null;
for (let essai = 0; essai < 12 && !vue; essai++) {
  vue = await p.evaluate(() => {
    const t = document.body.innerText;
    // Un « Ancien » suivi du prénom d'une femme, c'est la faute qu'on traque.
    const fautes = t.match(/Ancien [A-ZÉ][^\n]*/g) ?? [];
    const feminins = t.match(/Ancienne [A-ZÉ][^\n]*/g) ?? [];
    return feminins.length ? { fautes, feminins } : null;
  });
  if (!vue) { await clic('Relancer|Reroll'); await pause(900); }
}
verifier('une femme apparaît au tirage, accordée', !!vue,
  vue ? vue.feminins.slice(0, 2).join(' · ') : 'aucune femme en douze tirages');

// ── ② La restauration ─────────────────────────────────────────────────────
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(800);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(400);
await clic('Options|Settings'); await pause(1000);

const bouton = await p.evaluate(() =>
  [...document.querySelectorAll('button')].some(x => /Restaurer mes achats|Restore purchases/i.test(x.textContent || '')));
verifier('le bouton de restauration existe dans les Options', bouton);

/*
 * Il doit rester visible pour QUI POSSÈDE DÉJÀ : sur un nouveau téléphone,
 * justement, le jeu ne sait plus qu'il possède quoi que ce soit. Le cacher aux
 * propriétaires serait le cacher exactement à ceux qui en ont besoin.
 */
await p.evaluate(() => {
  localStorage.setItem('roi-du-carton-noads', '1');
  localStorage.setItem('roi-du-carton-atelier', '1');
});
await p.reload({ waitUntil: 'networkidle2' }); await pause(900);
await clic('Reprendre|Continue'); await pause(800);
await clic('Options|Settings'); await pause(1000);
const encore = await p.evaluate(() =>
  [...document.querySelectorAll('button')].some(x => /Restaurer mes achats|Restore purchases/i.test(x.textContent || '')));
verifier('  …et il reste visible pour qui possède déjà tout', encore);

// Il doit répondre quelque chose plutôt que de rester muet : un bouton sans
// retour se retouche cinq fois, et se signale comme cassé.
await p.evaluate(() => {
  [...document.querySelectorAll('button')]
    .find(x => /Restaurer mes achats|Restore purchases/i.test(x.textContent || ''))?.click();
});
await pause(1500);
const repond = await p.evaluate(() => /restaur|achat|purchase/i.test(document.body.innerText));
verifier('  …et il répond au joueur', repond);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nChacune son métier, et ce qui est payé se retrouve.');
process.exit(echecs ? 1 : 0);
