/*
 * LA VOIX DU PERSONNAGE — ce qui sort d'un corps, et de QUEL corps.
 *
 * Tout le reste du jeu est du carton manipulé. Ces sons-là sont les seuls qui
 * sortent de quelqu'un, et c'est précisément ce qui les rend fragiles :
 *
 *   · LE TIMBRE. Le genre est tiré au sort avec le personnage. Jouer la
 *     mauvaise voix ne casse rien, ne lève aucune erreur, et annule tout le
 *     travail que le jeu fait pour qu'on s'attache à celui-là. C'est le bug
 *     type qu'aucune pile d'exceptions ne signalera jamais.
 *   · LA SUPERPOSITION. Un combat enchaîne les coups et la Récup' peut
 *     réveiller deux saletés d'un même geste. Deux grimaces qui se chevauchent
 *     ne font pas un personnage qui souffre deux fois : elles font entendre
 *     l'échantillon.
 *   · LE REPLI. Aucun de ces fichiers n'est livré à ce jour. Le jeu doit
 *     tourner exactement pareil sans eux — c'est la règle de tout le pack son,
 *     et c'est celle qu'on casse le plus facilement en ajoutant une famille.
 *
 * On écoute les requêtes réseau : c'est la seule preuve de ce que le jeu a
 * VOULU jouer, indépendamment de ce qui existe sur le disque.
 */
import puppeteer from 'puppeteer-core';

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844 });

const erreurs = [];
p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));
/** Tout ce que le jeu a demandé dans /audio/, dans l'ordre. */
const demandes = [];
p.on('request', r => {
  const u = r.url();
  if (u.includes('/audio/')) demandes.push(u.split('/audio/')[1].replace('.mp3', ''));
});

const pause = ms => new Promise(r => setTimeout(r, ms));
let echecs = 0;
const verifier = (nom, ok, detail) => {
  console.log(`${ok ? '  ok  ' : ' RATÉ '} ${nom}${detail ? ` — ${detail}` : ''}`);
  if (!ok) echecs++;
};

await p.goto('http://localhost:8099/', { waitUntil: 'networkidle2' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('roi-du-carton-lang', 'fr');
  localStorage.setItem('roi-du-carton-scores', JSON.stringify([{ name: 'Feu Robert', days: 3, score: 40 }]));
});

const clic = m => p.evaluate(s => {
  const r = new RegExp(s, 'i');
  const e = [...document.querySelectorAll('button')].find(x => r.test(x.textContent || '') && x.offsetWidth);
  if (e) { e.click(); return true; }
  return false;
}, m);

await p.reload({ waitUntil: 'networkidle2' }); await pause(500);
await clic('Nouvelle|New Game'); await pause(900);
await p.evaluate(() => {
  const c = [...document.querySelectorAll('[class*="cursor-pointer"]')].find(e => /Ancien|Former/i.test(e.textContent || ''));
  c?.click();
});
await pause(1500);
await clic('Commencer|Start surviving'); await pause(900);
await clic('Regarder|Take a look'); await pause(400);
await clic('Merci|Thanks'); await pause(800);

/**
 * Met le personnage dans un état donné, recharge, et rend la main sur le hub.
 * Le rechargement est ce qui rejoue `reglerVoix` depuis la sauvegarde : c'est
 * le chemin qu'emprunte un vrai joueur qui reprend sa partie.
 */
async function situer(patch) {
  await p.evaluate((j) => {
    const s = JSON.parse(localStorage.getItem('roi-du-carton-save'));
    Object.assign(s.character, j);
    s.character.activeFlags = ['origin-vu'];
    s.dayActions = 0;
    localStorage.setItem('roi-du-carton-save', JSON.stringify(s));
  }, patch);
  await p.reload({ waitUntil: 'networkidle2' }); await pause(900);
  await clic('Reprendre|Continue'); await pause(1000);
  await clic('Regarder|Take a look'); await pause(300);
  await clic('Merci|Thanks'); await pause(500);
}

const BASSES = { health: 70, mental: 8, hunger: 70, thirst: 70, sleep: 70, dignity: 70 };

// ── La tête qui lâche a maintenant une voix, et c'est la bonne ─────────────
for (const [genre, attendu, refuse] of [['m', 'voix-h-tete', 'voix-f-tete'], ['f', 'voix-f-tete', 'voix-h-tete']]) {
  demandes.length = 0;
  // Mental haut d'abord : `playGaugeLow` ne sonne qu'au FRANCHISSEMENT du
  // seuil, donc arriver directement à 8 ne prouverait rien.
  await situer({ day: 4, gender: genre, stats: { ...BASSES, mental: 80 } });
  await situer({ day: 4, gender: genre, stats: BASSES });
  await pause(600);
  const voulues = demandes.filter(d => d.startsWith('voix-'));
  verifier(`mental à 8 : le personnage ${genre === 'm' ? 'masculin' : 'féminin'} respire mal`,
    voulues.some(d => d.startsWith(attendu)), voulues.join(', ') || 'aucune voix demandée');
  verifier(`  …et jamais avec le timbre de l'autre`,
    !voulues.some(d => d.startsWith(refuse)), voulues.join(', '));
}

// ── La Récup' : chaque saleté a son bruit à elle ───────────────────────────
// La carte des règles est marquée « vue » à ce lancement-ci, sinon elle
// s'interpose et le test ne touche jamais la grille.
demandes.length = 0;
await situer({ day: 4, gender: 'f', stats: { health: 90, mental: 90, hunger: 70, thirst: 70, sleep: 70, dignity: 70 } });
await p.evaluate(() => {
  const n = Number(localStorage.getItem('roi-du-carton-lancements') || 0) || 0;
  localStorage.setItem('roi-du-carton-minigame-intro-v2', JSON.stringify({ recup2: n }));
});
// La carte du tutoriel couvre le hub au premier jour et avale le clic.
await clic('compris|Got it'); await pause(500);
await clic('La Récup|Salvage'); await pause(1300);
/*
 * On descend jusqu'au fond en déblayant chaque couche.
 *
 * La surface est presque propre — 5 % de saletés sur quatre objets — et une
 * seule passe ne prouverait donc rien la plupart du temps. Les saletés vivent
 * en bas : c'est tout le principe du mini-jeu, et c'est là qu'il faut aller
 * les chercher pour vérifier qu'elles sonnent.
 */
async function frotterLaGrille() {
  return p.evaluate(async () => {
    const g = document.querySelector('[aria-label*="détritus"], [aria-label*="rubbish"]');
    if (!g) return false;
    const r = g.getBoundingClientRect();
    const env = (t, x, y) => g.dispatchEvent(new PointerEvent(t, {
      clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true,
    }));
    env('pointerdown', r.left + 4, r.top + 4);
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 6; x++) {
        env('pointermove', r.left + (r.width * (x + 0.5)) / 6, r.top + (r.height * (y + 0.5)) / 7);
        await new Promise(res => setTimeout(res, 10));
      }
    }
    env('pointerup', r.left + 4, r.top + 4);
    return true;
  });
}

for (let couche = 0; couche < 5; couche++) {
  if (!await frotterLaGrille()) break;   // le tas s'est réveillé, on est sorti
  await pause(350);
  if (!await clic('Creuser|Dig deeper')) break;
  await pause(450);
}
await pause(900);
const recup = demandes.filter(d => d.startsWith('recup-') || d.startsWith('voix-'));
verifier('fouiller réveille des saletés qui ont chacune leur son',
  recup.some(d => d.startsWith('recup-')), recup.join(', ') || 'aucune saleté réveillée');
// La réaction du corps est facultative ici (un rat n'en déclenche pas), mais
// si une voix est demandée, elle doit rester dans le bon timbre.
verifier('  …et la réaction du corps garde le timbre du personnage',
  !recup.some(d => d.startsWith('voix-h-')), recup.filter(d => d.startsWith('voix-')).join(', ') || 'aucune réaction');

/* ── LA MANCHE : ce qu'on entend quand on retient quelqu'un ────────────────
 *
 * Deux choses se vérifient ici, et toutes deux étaient invisibles avant :
 *
 *   · CE QUI TOMBE DANS LE CHAPEAU. Le gain s'annonçait avec le détail qui
 *     sert à RECONNAÎTRE le passant — « 🛍️ +1 », « 👶 +2 ». Collé devant un
 *     « +1 », il se lit comme ce qu'on vient de recevoir, et le joueur croyait
 *     empocher un sac de courses. Ce sont des pièces, et rien d'autre.
 *   · LE PASSANT QUI GROGNE. Insister est la seule vraie décision du mini-jeu,
 *     et elle ne s'entendait pas.
 *
 * On suit un passant en lisant sa position dans le DOM, image par image :
 * c'est exactement ce que fait le pouce d'un joueur.
 */
await p.evaluate(() => {
  const n = Number(localStorage.getItem('roi-du-carton-lancements') || 0) || 0;
  const l = JSON.parse(localStorage.getItem('roi-du-carton-minigame-intro-v2') || '{}');
  l.beg2 = n;
  localStorage.setItem('roi-du-carton-minigame-intro-v2', JSON.stringify(l));
});
demandes.length = 0;
await situer({ day: 4, gender: 'f', stats: { health: 90, mental: 90, hunger: 70, thirst: 70, sleep: 70, dignity: 70 } });
await clic('compris|Got it'); await pause(400);
await clic('Mendier|Beg'); await pause(1300);

/** Attrape le passant le plus proche du centre et ne le lâche plus. */
const manche = await p.evaluate(async () => {
  const rue = document.querySelector('[aria-label*="Rue"], [aria-label*="Street"]');
  if (!rue) return { ouvert: false };
  const env = (t, x, y) => rue.dispatchEvent(new PointerEvent(t, {
    clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true,
  }));
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const passants = () => [...rue.querySelectorAll('div')].filter((e) => {
    const st = e.getAttribute('style') || '';
    return st.includes('position: absolute') && st.includes('z-index') && st.includes('left:');
  });

  const vus = [];   // tout ce que le bandeau de gain a annoncé au passage
  let attrape = false;
  // Jusqu'à douze secondes : il faut qu'un passant traverse, qu'on l'accroche,
  // que l'anneau se remplisse, PUIS qu'on insiste au-delà.
  for (let i = 0; i < 240; i++) {
    const liste = passants();
    if (liste.length) {
      const c = centre(liste[0]);
      env(attrape ? 'pointermove' : 'pointerdown', c.x, c.y);
      attrape = true;
    }
    const t = rue.querySelector('span[style*="rgba(24, 18, 14"]');
    if (t && /\+\d/.test(t.textContent || '')) vus.push(t.textContent.trim());
    await new Promise(r => setTimeout(r, 50));
  }
  return { ouvert: true, gains: [...new Set(vus)] };
});

await pause(600);
const voixRue = demandes.filter(d => d.startsWith('passant-'));
verifier('la manche s\'ouvre', manche.ouvert === true);
verifier('retenir un passant le fait grogner',
  voixRue.length > 0, voixRue.slice(0, 4).join(', ') || 'aucun grognement');
// Son timbre vient de LUI, pas du personnage joué (qui est une femme ici) :
// une rue où tout le monde a la même voix que le joueur n'est pas une rue.
verifier('  …avec sa voix à lui, pas celle du personnage',
  voixRue.some(d => d.startsWith('passant-h-')) || voixRue.some(d => d.startsWith('passant-f-')),
  [...new Set(voixRue.map(d => d.replace(/-\d+$/, '')))].join(', '));

verifier('quelqu\'un a fini par donner', (manche.gains || []).length > 0,
  (manche.gains || []).join(' · ') || 'aucun gain annoncé');
verifier('le gain s\'annonce en pièces, jamais avec l\'objet du passant',
  (manche.gains || []).length > 0 && manche.gains.every(g => g.startsWith('🪙')),
  (manche.gains || []).join(' · '));

// ── Rien de tout ça n'existe encore sur le disque ──────────────────────────
const manquants = await p.evaluate(async (liste) => {
  const out = [];
  for (const f of liste) {
    const r = await fetch(`/audio/${f}.mp3`, { method: 'HEAD' });
    if (!r.ok) out.push(f);
  }
  return out;
}, ['voix-h-tete-1', 'voix-f-douleur-1', 'recup-rat-1', 'passant-f-agace-1']);
verifier('les prises ne sont pas encore livrées, et le jeu tourne quand même',
  manquants.length === 4, `${manquants.length}/4 absentes, aucune erreur de page`);

verifier('aucune erreur de page', erreurs.length === 0, erreurs[0] || '');

await b.close();
console.log(echecs
  ? `\n${echecs} vérification(s) en échec.`
  : '\nLe corps parle, et c\'est le bon corps.');
process.exit(echecs ? 1 : 0);
