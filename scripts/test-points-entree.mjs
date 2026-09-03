/*
 * LES POINTS D'ENTRÉE : proposer la chose AU MOMENT où elle manque.
 *
 * L'écran du marché noir ne convertit presque personne : pour y aller, il faut
 * avoir déjà décidé. Ce qui convertit, ce sont les quatre moments ci-dessous,
 * et ils ont tous la même fragilité, ils dépendent d'un état qu'aucun écran
 * n'affiche. Une carte qui ne s'ouvre plus ne casse rien, ne lève rien, et ne
 * se remarque jamais : il n'y a pas d'écran vide à voir, il n'y a rien du tout.
 *
 *   ① LA TRÊVE. Dix minutes sans publicité offertes au DEUXIÈME plein écran.
 *     Jamais au premier, à ce moment-là le joueur n'a pas encore de raison de
 *     trouver la publicité pénible, et lui vendre la solution avant qu'il ait
 *     le problème lui apprend qu'on en a fabriqué un.
 *
 *   ② SON EXPIRATION. C'est elle qui vend, pas le cadeau. Et pendant qu'elle
 *     court, aucune publicité ne doit passer : une seule annulerait tout.
 *
 *   ③ LA MORT. Le seul instant où « je recommence » est actif, donc le seul
 *     où l'Atelier répond à une question déjà posée.
 *
 *   ④ LA GARDE-ROBE. On s'y regarde : le contexte d'identité.
 *
 * ET LE PIÈGE DE CE TEST, ÉVITÉ ICI : vérifier qu'une carte s'affiche ne prouve
 * rien si elle s'affiche TOUJOURS. Chaque contrôle vérifie donc aussi le cas où
 * elle ne DOIT PAS apparaître, après le premier plein écran, et chez qui a
 * déjà payé.
 *
 *     node scripts/test-points-entree.mjs
 */
import puppeteer from 'puppeteer-core';

let echecs = 0;
const verifier = (nom, ok, detail = '') => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` · ${detail}` : ''}`);
  if (!ok) echecs++;
};

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });
const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));
const pause = ms => new Promise(r => setTimeout(r, ms));
const ecran = () => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x =>
    r.test((x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')) && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('roi-du-carton-lang', 'fr'); });
await p.reload({ waitUntil: 'networkidle2' }); await pause(800);

/*
 * ── ① et ② LA TRÊVE, INTERROGÉE DIRECTEMENT ──────────────────────────────
 *
 * On ne joue pas quatre parties pour déclencher quatre pleins écrans : ce
 * serait long, et surtout ça mesurerait le chemin plutôt que la règle. Le
 * banc d'essai `window.__pub` expose exactement ce qu'un joueur peut déjà
 * provoquer lui-même, ni plus.
 *
 * La période de grâce est neutralisée par le compteur de parties : c'est elle
 * que le jeu applique aux nouveaux venus, et elle n'est pas le sujet ici.
 */
const treve = await p.evaluate(async () => {
  const P = window.__pub;
  localStorage.setItem('roi-du-carton-parties-finies', '99');
  P.reinitialiserTreve();
  const vu = [];
  const attendre = () => new Promise(r => setTimeout(r, 30));

  /*
   * ON AVANCE L'HORLOGE PLUTÔT QUE D'ATTENDRE.
   *
   * Le jeu impose quatre-vingt-dix secondes entre deux pleins écrans. Enchaîner
   * deux appels dans la même milliseconde ne produit donc qu'UN seul écran,
   * la première version de ce test le faisait, et concluait tranquillement que
   * la trêve ne s'ouvrait pas. Elle s'ouvrait très bien ; c'est le second écran
   * qui n'était jamais parti.
   *
   * Et le tout premier appel de la session est toujours refusé : on offre sa
   * première mort au joueur. Il en faut donc trois pour en voir deux.
   */
  const t0 = Date.now();
  for (let i = 0; i < 3; i++) {
    await P.showInterstitial(t0 + i * 100_000);
    const t = t0 + i * 100_000;
    vu.push({ appel: i, enTreve: P.enTreve(t), reste: Math.round(P.resteDeTreve(t) / 1000) });
    await attendre();
  }
  return { vu, t0 };
});
// L'appel 0 est offert (première mort de la session), l'appel 1 est le
// PREMIER vrai plein écran, l'appel 2 le deuxième, celui qui ouvre la trêve.
verifier('après le PREMIER plein écran, aucune trêve',
  treve.vu[1] && !treve.vu[1].enTreve, JSON.stringify(treve.vu[1]));
verifier('après le DEUXIÈME, la trêve court',
  treve.vu[2] && treve.vu[2].enTreve && treve.vu[2].reste > 540,
  treve.vu[2] ? `${treve.vu[2].reste} s restantes` : 'pas de second passage');

/*
 * Et pendant la trêve, aucune publicité ne passe. C'est la moitié du cadeau :
 * l'offrir puis interrompre le joueur trois minutes plus tard reviendrait à
 * lui démontrer l'inverse de ce qu'on lui vend.
 */
const pendant = await p.evaluate((t) => window.__pub.verdictInterstitiel(t + 200_001), treve.t0);
verifier('  …et elle bloque les pleins écrans', pendant.montrer === false,
  pendant.raison);

/*
 * PIÈGE ÉVITÉ : la trêve pourrait bloquer parce qu'un AUTRE garde-fou parle en
 * premier, le délai de 90 secondes, par exemple. On vérifie donc que c'est
 * bien ELLE qui refuse, et pas quelque chose d'autre qui passait par là.
 */
verifier('  …et c\'est bien la trêve qui refuse, pas un autre garde-fou',
  /trêve/i.test(pendant.raison), pendant.raison);

// Une fois expirée, le jeu reprend son cours normal.
const apres = await p.evaluate((t) => {
  const dans11min = t + 200_000 + 11 * 60_000;
  return { enTreve: window.__pub.enTreve(dans11min), verdict: window.__pub.verdictInterstitiel(dans11min) };
}, treve.t0);
verifier('la trêve finit, et la publicité peut reprendre',
  !apres.enTreve && apres.verdict.montrer === true, apres.verdict.raison);

// ── ③ LA MORT PROPOSE L'ATELIER ──────────────────────────────────────────
async function nouvellePartie() {
  await p.evaluate(() => { const l = localStorage.getItem('roi-du-carton-lang'); localStorage.clear(); localStorage.setItem('roi-du-carton-lang', l); });
  await p.reload({ waitUntil: 'networkidle2' }); await pause(700);
  for (const m of ['Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
  await clic('Nouvelle|New Game'); await pause(900);
  await p.evaluate(() => { [...document.querySelectorAll('[class*="cursor-pointer"]')][0]?.click(); });
  await pause(1200);
  /*
   * AVEC L'ATELIER ACHETÉ, LE CHEMIN N'EST PAS LE MÊME.
   *
   * Choisir un candidat ouvre la composition du visage, et la partie ne
   * démarre qu'après « C'est lui / C'est elle. Commencer. », accordé en genre.
   * Sans cette ligne, la seconde partie du test ne démarrait jamais, et le
   * contrôle qui suit se déclarait vide plutôt que de mentir. C'est exactement
   * ce qu'on lui demande de faire.
   */
  await clic('C\'est (lui|elle)\\. Commencer|That\'s (him|her)\\. Start'); await pause(700);
  await clic('Commencer|Start'); await pause(900);
  for (let i = 0; i < 8; i++) {
    let f = false;
    for (const m of ['Continuer|Continue', 'Commencer à survivre|Start surviving', 'compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) {
      if (await clic(m)) { f = true; await pause(380); }
    }
    if (!f) break;
  }
}

/**
 * Tue le personnage et va jusqu'à l'écran de fin, seconde chance refusée.
 *
 * UNE SEULE NUIT NE SUFFIT PAS, et c'est ce qui a fait échouer la première
 * version : santé à 1, jauges au plancher, le personnage passait la nuit et se
 * réveillait au jour 2. Les pertes nocturnes sont modestes, et la santé ne
 * tombe pas d'un coup, c'est le jeu qui est clément, pas le test qui est
 * faux. On dort donc jusqu'à ce que ça arrive, en remettant la santé à 1 à
 * chaque fois, avec une limite pour ne pas boucler sans fin si un jour le jeu
 * cessait de tuer.
 */
let dernierEcran = '';
async function mourir() {
  /*
   * SIX NUITS NE SUFFISAIENT PAS TOUJOURS.
   *
   * Deux passages complets ont vu le personnage arriver VIVANT au jour 7,
   * santé forcée à 1 et jauges à zéro à chaque nuit. Le jeu est plus clément
   * que prévu par endroits, et la marge était trop juste : on double, et
   * l'échec dit maintenant combien de nuits ont été dépensées et sur quel
   * écran on s'est arrêté, pour que la prochaine occurrence se lise au lieu de
   * se deviner.
   *
   * ET DOUZE NE SUFFISENT PAS NON PLUS, une fois sur deux. Le message d'échec
   * disait alors « douze nuits sans mourir » et l'écran du jour 13, ce qui
   * laisse le choix entre deux explications opposées : ou bien l'écriture
   * forcée n'a jamais pris, et le personnage a simplement vécu douze journées
   * normales ; ou bien elle a pris et la nuit ne coûte pas toujours de la
   * santé. Un message qui n'arbitre pas entre les deux ne sert à rien : on
   * relit donc la santé DANS L'ÉCRITURE ELLE-MÊME, sans tour de page
   * supplémentaire, et on la garde pour le rapport. Le compte rendu dit
   * maintenant laquelle des deux s'est produite.
   */
  /*
   * ON DÉSARME D'ABORD LE FILET DU PREMIER JOUR.
   *
   * `survivesFirstDay` (GameContext) empêche toute mort au jour 1 de la
   * TOUTE PREMIÈRE partie : tant qu'il n'existe ni score ni tombe, les jauges
   * vitales ne descendent pas sous 1. C'est voulu, et c'est bien, mourir avant
   * d'avoir rien vu du jeu ne donne envie de rien.
   *
   * Mais `nouvellePartie()` vide le stockage, donc chaque appel de `mourir()`
   * repart en « toute première partie » : mesuré, la première nuit ne tue
   * JAMAIS, dix fois sur dix, la santé reste bloquée à 1. Le test dépensait
   * ainsi sa première nuit à coup sûr, et le reste de sa marge à la merci du
   * hasard. On pose une tombe, le filet se retire, et la nuit reprend ses
   * droits dès la première.
   */
  await p.evaluate(() => {
    if (!JSON.parse(localStorage.getItem('roi-du-carton-cimetiere') || '[]').length)
      localStorage.setItem('roi-du-carton-cimetiere',
        JSON.stringify([{ seed: 'filet-desarme', name: 'Anonyme', day: 1 }]));
  });
  const journal = [];
  for (let nuit = 0; nuit < 12; nuit++) {
    const pose = await p.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('roi-du-carton-save') || 'null');
      if (!s?.character) return 'aucune sauvegarde à forcer';
      const avant = s.character.stats?.health;
      s.dayActions = 3;
      s.character.stats = { health: 1, mental: 40, hunger: 0, thirst: 0, sleep: 0, dignity: 20 };
      s.character.inventory = [];
      /*
       * ET ON RETIRE « MÉTABOLISME », QUI RENDAIT CE TEST IMMORTEL.
       *
       * Le trait rend 6 points de santé chaque nuit (NEXT_DAY, effets passifs).
       * Un personnage tiré avec lui se couchait à 1 et se relevait à 6, douze
       * nuits de suite : le compte rendu le montre noir sur blanc, « n3 santé
       * 6→1 · n4 santé 6→1 … ». Ce n'était donc ni le hasard de la nuit ni une
       * écriture perdue, c'était un trait qui fait exactement son travail, et
       * le test échouait une fois sur deux selon le tirage.
       *
       * On ne retire que celui-là : le sujet ici est l'écran de mort, pas
       * l'équilibrage des traits, et vider la liste entière changerait un
       * personnage en fiche vide.
       */
      s.character.traits = (s.character.traits || []).filter(t => t.id !== 'metabolisme');
      localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
      const relu = JSON.parse(localStorage.getItem('roi-du-carton-save')).character.stats.health;
      return relu === 1 ? `santé ${avant}→1` : `ÉCRITURE PERDUE (relu ${relu})`;
    });
    journal.push(`n${nuit + 1} ${pose}`);
    await p.reload({ waitUntil: 'networkidle2' }); await pause(800);
    if (!(await clic('Reprendre|Continue'))) { journal.push('plus de bouton de reprise'); break; }
    await pause(900);
    for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(280); }
    await clic('Jour Suivant|Next Day'); await pause(2200);
    await clic('compris|Got it'); await pause(1200);

    const vu = await ecran();
    dernierEcran = `${journal.join(' · ')} · écran ${vu.slice(0, 70)}`;
    /*
     * La seconde chance s'interpose, et c'est normal : tomber à zéro n'ouvre
     * pas l'écran de fin. Le refus se fait en DEUX temps, comme pour un joueur.
     */
    if (/Pas tout de suite|Not just yet/i.test(vu)) {
      await clic('Non, c\'est fini|No, it\'s over'); await pause(600);
      await clic('Laisser .* partir|Let .* go'); await pause(2000);
      return true;
    }
    if (/Recommencer|Play Again|Reprendre la rue|Take the street/i.test(vu)) return true;
  }
  return false;
}

await nouvellePartie();
const bienMort = await mourir();
verifier('le personnage meurt et l\'écran de fin s\'ouvre', bienMort,
  bienMort ? '' : `douze nuits sans mourir · ${dernierEcran}`);
const mort = await ecran();
verifier('à la mort, l\'Atelier est proposé',
  /c'est vous qui le faites|you make yourself/i.test(mort),
  /c'est vous qui le faites|you make yourself/i.test(mort) ? '' : mort.slice(0, 130));

/*
 * ET IL DISPARAÎT POUR QUI L'A DÉJÀ PAYÉ.
 *
 * Sans ce second cas, le contrôle passerait aussi bien si la carte s'affichait
 * TOUJOURS : c'est-à-dire si elle vendait à ses propres clients ce qu'ils ont
 * acheté, ce qui est la façon la plus sûre de faire désinstaller un jeu.
 *
 * IL FAUT REMOURIR. La première version se contentait de poser l'achat puis de
 * recharger la page : on se retrouvait sur l'ÉCRAN-TITRE, où la carte est
 * évidemment absente. Le contrôle était vert parce qu'il ne regardait plus rien,
 * exactement le défaut qu'il était censé attraper.
 */
await p.evaluate(() => localStorage.setItem('roi-du-carton-atelier', '1'));
await nouvellePartie();
await p.evaluate(() => localStorage.setItem('roi-du-carton-atelier', '1'));
const remort = await mourir();
const mortPaye = await ecran();
verifier('  …et il disparaît pour qui l\'a déjà payé',
  remort && /Composer une nouvelle âme perdue|Compose a new lost soul|Reprendre la rue|Take the street/i.test(mortPaye)
    && !/c'est vous qui le faites|you make yourself/i.test(mortPaye),
  remort ? '' : `la seconde mort n'a pas abouti · ${dernierEcran}`);

// ── ④ LA GARDE-ROBE ──────────────────────────────────────────────────────
await p.evaluate(() => { localStorage.setItem('roi-du-carton-atelier', '0'); });
await nouvellePartie();
await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')].find(x => /Personnaliser/i.test(x.getAttribute('aria-label') || ''));
  e?.click();
});
await pause(1100);
const penderie = await ecran();
// On exige d'ABORD d'être sur la garde-robe : chercher l'absence d'une carte
// sur un écran qu'on n'a pas ouvert ne prouve rien.
verifier('la garde-robe s\'ouvre', /Garde-robe|Wardrobe/i.test(penderie), penderie.slice(0, 80));
verifier('  …et elle renvoie vers l\'Atelier', /Et la tête|And the face/i.test(penderie));

await p.evaluate(() => localStorage.setItem('roi-du-carton-atelier', '1'));
await p.reload({ waitUntil: 'networkidle2' }); await pause(900);
await clic('Reprendre|Continue'); await pause(1000);
for (const m of ['compris|Got it', 'Regarder|Take a look', 'Merci|Thanks']) { if (await clic(m)) await pause(300); }
await p.evaluate(() => {
  const e = [...document.querySelectorAll('button')].find(x => /Personnaliser/i.test(x.getAttribute('aria-label') || ''));
  e?.click();
});
await pause(1100);
const penderiePayee = await ecran();
verifier('  …et se tait pour qui l\'a déjà payé',
  /Garde-robe|Wardrobe/i.test(penderiePayee) && !/Et la tête|And the face/i.test(penderiePayee),
  /Garde-robe|Wardrobe/i.test(penderiePayee) ? '' : 'pas sur la garde-robe : contrôle vide');

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nOn propose au bon moment, et on se tait quand c\'est déjà payé.');
process.exit(echecs ? 1 : 0);
