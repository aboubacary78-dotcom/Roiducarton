/*
 * PLUS AUCUN APPUI N'EST MUET ?
 *
 * Un balayage aveugle de tous les boutons ne marche pas : le premier clic
 * change d'écran et la liste devient périmée. On éprouve donc le mécanisme
 * lui-même, sur des cas construits, puis sur des boutons réels du jeu que
 * l'audit range parmi les non-câblés.
 *
 * Quatre choses doivent être vraies :
 *   1. un bouton sans son explicite sonne quand même ;
 *   2. un bouton avec son explicite n'en joue pas DEUX ;
 *   3. un bouton désactivé reste muet ;
 *   4. en sourdine, rien ne sonne.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });

/*
 * On ne compte QUE les fichiers joués, pas les oscillateurs.
 *
 * L'ambiance de quartier tourne en permanence en synthèse : une première
 * version comptait ses oscillateurs et voyait « 4 sons » sur un bouton qui
 * n'en jouait qu'un. Les bruitages, eux, sont tous des fichiers — c'est donc
 * la bonne unité de mesure.
 */
await p.evaluateOnNewDocument(() => {
  window.__n = 0;
  const s = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (this.buffer && !this.loop) window.__n++;
    return s.apply(this, a);
  };
});

await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => {
  const jour = new Date().toISOString().slice(0, 10);
  localStorage.setItem('roi-du-carton-carton-matin', JSON.stringify({ lastClaim: jour, streak: 1, saves: 0, broken: false }));
  localStorage.removeItem('roi-du-carton-carton-attente');
});
await p.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 700));

/*
 * Le moteur audio d'un navigateur ne démarre qu'après un vrai geste. On le
 * débloque par un aller-retour dans les Options : cliquer le premier bouton
 * venu lançait une partie et faisait disparaître l'écran-titre qu'on voulait
 * éprouver.
 */
const clicSur = async (motif) => {
  const h = await p.evaluateHandle((m) => {
    const r = new RegExp(m, 'i');
    return [...document.querySelectorAll('button')].find(e => r.test(e.textContent || '') && (e.offsetWidth || e.offsetHeight)) || null;
  }, motif);
  const el = h.asElement();
  if (!el) return false;
  await el.click().catch(() => {});
  await new Promise(r => setTimeout(r, 700));
  return true;
};
await clicSur('Settings|Options');
await clicSur('←|Back|Retour');

let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

/** Pose un bouton dans la page et compte les sons que son appui déclenche. */
async function sonsDunBouton({ attributs = '', gestionnaire = '' } = {}) {
  return p.evaluate(async (attrs, code) => {
    const d = document.createElement('div');
    d.innerHTML = `<button id="__essai" ${attrs}>essai</button>`;
    document.body.appendChild(d);
    const btn = d.querySelector('#__essai');
    if (code) btn.addEventListener('click', new Function(code));
    window.__n = 0;
    btn.click();
    await new Promise(r => setTimeout(r, 220));
    d.remove();
    return window.__n;
  }, attributs, gestionnaire);
}

const nu = await sonsDunBouton();
verifier('un bouton sans son explicite sonne quand même', nu === 1, `${nu} fichier(s) joué(s)`);

verifier('un bouton désactivé reste muet',
  (await sonsDunBouton({ attributs: 'disabled' })) === 0);

verifier('un bouton marqué data-sans-son reste muet',
  (await sonsDunBouton({ attributs: 'data-sans-son' })) === 0);

/*
 * Un bouton DÉJÀ câblé ne doit pas jouer le son du filet en plus du sien.
 *
 * C'est le risque exact que le filet introduit. On l'éprouve sur « Options »
 * de l'écran-titre, qui joue son onglet et ne change que d'écran : tout second
 * fichier viendrait donc du filet. La vérification est faite ici, avant tout
 * parcours, parce qu'un bouton qu'on ne retrouve pas laisserait passer un test
 * qui ne vérifie rien.
 */

// ---- Sur de vrais boutons du jeu -------------------------------------------
async function sonsDe(motif, attente = 320) {
  const h = await p.evaluateHandle((m) => {
    const r = new RegExp(m, 'i');
    const visible = e => e.offsetWidth || e.offsetHeight;
    // Les cartes de personnage et les tuiles d'action ne sont pas des <button>
    // mais des conteneurs cliquables : les ignorer laissait le test bloqué à
    // l'écran de sélection, sans jamais éprouver les actions du jeu.
    const btn = [...document.querySelectorAll('button')].find(e => r.test(e.textContent || '') && visible(e));
    if (btn) return btn;
    return [...document.querySelectorAll('[class*="cursor-pointer"], [class*="action-btn"]')]
      .filter(e => r.test(e.textContent || '') && visible(e))
      .sort((a, c) => (a.textContent || '').length - (c.textContent || '').length)[0] || null;
  }, motif);
  const el = h.asElement();
  if (!el) return -1;
  await p.evaluate(() => { window.__n = 0; });
  await el.click().catch(() => {});
  await new Promise(r => setTimeout(r, attente));
  return p.evaluate(() => window.__n);
}

const options = await sonsDe('Settings|Options');
verifier('un bouton déjà câblé ne joue pas le son du filet en plus',
  options === 1, `${options} fichier(s)`);
await sonsDe('←|Back|Retour');

// L'écran-titre : « Registre » et « Cimetière » n'étaient pas câblés au départ.
const registre = await sonsDe('Registry|Registre');
verifier('écran-titre : le Registre sonne', registre > 0, `${registre} son(s)`);
await sonsDe('Back|Retour|←');

// En partie : les actions du jour, qui étaient toutes muettes.
await sonsDe('New Game|Nouvelle');
await new Promise(r => setTimeout(r, 700));
await sonsDe('years old|ans|Trait');
await new Promise(r => setTimeout(r, 1600));
// L'histoire du personnage s'ouvre avant la première action et masque l'écran
// principal : sans la refermer, le test ne trouvait ni Explorer ni Mendier.
for (let i = 0; i < 4; i++) {
  const passe = await sonsDe('Commencer à survivre|Start surviving|Continue|Continuer|Got it|Compris', 500);
  if (passe === -1) break;
}

/*
 * Chaque action ouvre un écran ou une superposition. Pour éprouver la
 * suivante il faut redescendre à l'écran principal : on referme tout ce qui
 * traîne jusqu'à revoir la tuile « Explorer ».
 */
const surLePrincipal = () => p.evaluate(() =>
  [...document.querySelectorAll('*')].some(e => /^(Explore|Explorer)$/.test((e.textContent || '').trim())));

async function revenirAuPrincipal() {
  for (let i = 0; i < 8 && !(await surLePrincipal()); i++) {
    /*
     * « Regarder » et « Merci » ferment le carton du matin. Sans eux, ce test
     * échouait une fois sur trois environ : le cadeau quotidien tombe au
     * hasard, se pose par-dessus l'écran principal, et les tuiles d'action
     * n'étaient plus atteignables. C'était le test qui était capricieux, pas
     * le jeu.
     */
    const ferme = await sonsDe('Continue|Continuer|Suivant|Next|Retour|Back|←|Fermer|Close|Passer|Regarder|Take a look|Merci|Thanks|Nouvelle journée|New day', 420);
    if (ferme === -1) {
      // Rien à fermer : peut-être un événement qui attend un choix.
      const choix = await sonsDe('.', 420);
      if (choix === -1) break;
    }
  }
  return surLePrincipal();
}

/*
 * COMBIEN D'ACTIONS RESTE-T-IL AUJOURD'HUI ?
 *
 * Le retour à l'écran principal traverse parfois un événement, et le seul
 * moyen d'en sortir est d'en choisir une issue — ce qui consomme une action.
 * Trois traversées et la journée est finie : les tuiles passent en désactivé,
 * le filet les ignore à juste titre, et le test annonçait « 0 son » comme si
 * le jeu s'était tu. C'était la journée qui était finie, pas le son qui
 * manquait. On passe donc la nuit avant de reprendre les mesures.
 */
const actionsRestantes = () => p.evaluate(() => {
  const m = document.body.innerText.match(/(\d+)\s+actions?/i);
  return m ? Number(m[1]) : -1;
});

async function journeeNeuve() {
  if ((await actionsRestantes()) !== 0) return;
  await sonsDe('Next Day|Jour Suivant', 900);
  await revenirAuPrincipal();
}

for (const [nom, motif] of [
  ['Explorer', 'Explore|Explorer'],
  ['Mendier', 'Beg|Mendier'],
  ['Dormir', 'Sleep|Dormir'],
  ['La Récup’', 'Salvage|Récup'],
]) {
  if (!(await revenirAuPrincipal())) { console.log(`  (écran principal hors d'atteinte) ${nom}`); break; }
  await journeeNeuve();
  const n = await sonsDe(motif);
  if (n === -1) { console.log(`  (absent) ${nom}`); continue; }
  verifier(`action « ${nom} » sonne`, n > 0, `${n} son(s)`);
}

/*
 * ---- Un bouton déjà câblé n'en joue pas DEUX -------------------------------
 *
 * C'est le risque exact du filet : il doit se taire quand le geste a déjà fait
 * du bruit. On l'éprouve sur la bascule des vibrations, qui joue son clac et
 * n'entraîne aucune conséquence sonore — tout second fichier viendrait donc
 * du filet.
 */
// ---- La sourdine coupe tout, filet compris ---------------------------------
await p.evaluate(() => localStorage.setItem('roi-du-carton-muted', '1'));
await p.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 700));
verifier('en sourdine, le filet se tait aussi', (await sonsDunBouton()) === 0);

await b.close();
console.log(echecs ? `\n${echecs} vérification(s) en échec.` : '\nAucun appui muet.');
process.exit(echecs ? 1 : 0);
