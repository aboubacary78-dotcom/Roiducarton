/*
 * LES VISUELS DE LA FICHE PLAY, COMPOSÉS ICI PLUTÔT QU'ACHETÉS AILLEURS.
 *
 *     pnpm visuels-store                  français
 *     LANG_FICHE=en pnpm visuels-store    anglais
 *
 * (`LANG_FICHE` et non `LANG` : `LANG` est la variable de langue du système, et
 * l'écraser pour un script de mise en page change le comportement de tout ce
 * qu'il lance.)
 *
 * CE QUE C'EST. Une capture brute ne vend rien : dans la grille de résultats
 * du Play Store elle fait deux centimètres de haut, et personne ne lit une
 * interface à cette taille. Ce qui se lit, c'est UNE PHRASE et une image. Ces
 * visuels posent donc la capture dans un cadre et lui mettent une phrase
 * au-dessus, assez grosse pour survivre à la vignette.
 *
 * POURQUOI ON NE PREND PAS UN GABARIT. Les gabarits vendus au forfait posent
 * un téléphone en biais sur un dégradé violet, et ça se voit. Le jeu a déjà
 * une direction artistique — le carton, ses polices, sa palette — et un visuel
 * de boutique qui ne lui ressemble pas promet un autre jeu que celui qu'on
 * télécharge. Tout ce qui suit reprend le carton de l'ouverture, ligne pour
 * ligne, et les polices sont celles du jeu, servies par son propre serveur.
 *
 * CE QU'ON NE FAIT PAS, ET C'EST DÉLIBÉRÉ.
 *
 *   · PAS DE CADRE DE TÉLÉPHONE. Il mange un cinquième de la surface pour
 *     illustrer une information que le joueur a déjà : il est sur un
 *     téléphone. La capture déborde par le bas, ce qui rend la même place au
 *     jeu et laisse entendre qu'il continue.
 *
 *   · PAS DE PROMESSE INVÉRIFIABLE. Chaque phrase chiffrée est comptée dans
 *     les sources avant d'être écrite, et arrondie VERS LE BAS. Une fiche qui
 *     annonce plus que le jeu ne tient se paie en notes à une étoile.
 *
 * Sortie : visuels-store/, ignoré par git (régénérable, pas une source).
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const L = 1440, H = 2880;                       // rapport 2:1, dans les clous
const LANG = process.env.LANG_FICHE || 'fr';
const BRUTES = process.env.BRUTES || join(process.cwd(), 'captures-brutes');
const SORTIE = process.env.OUT || join(process.cwd(), `visuels-store/${LANG}`);
/*
 * ON VIDE LE DOSSIER AVANT D'ÉCRIRE, ET C'EST UNE CORRECTION.
 *
 * Les noms de sortie sont numérotés d'après l'ORDRE des planches. Changer une
 * planche de source renomme donc son fichier, et l'ancien restait sur le
 * disque : la planche de contrôle a montré un mini-jeu qui n'était plus dans
 * la liste, sous le titre de la planche qui l'avait remplacé. Un dossier de
 * sortie qui garde des restes ne représente plus ce que le script produit.
 */
rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });

/*
 * LES SIX PHRASES, ET L'ORDRE EST LE SUJET.
 *
 * La première est vue par tout le monde, la deuxième par la moitié, la sixième
 * par presque personne. On ne met donc pas la plus jolie en tête, on met celle
 * qui dit DE QUOI IL S'AGIT : trois candidats, un seul survivant. Le reste
 * descend par ordre de ce qu'il promet, et la dernière est celle qui rassure
 * sur le modèle économique — c'est la question que se pose quelqu'un qui a
 * déjà décidé d'installer.
 *
 * Les phrases sont courtes parce qu'elles seront lues en vignette. Deux lignes
 * au plus, la seconde plus petite : le regard prend la première d'un bloc.
 */
const PLANCHES = [
  {
    fichier: '02-choix-personnage',
    fr: ['Trois âmes perdues.', 'Un seul survivant.'],
    en: ['Three lost souls.', 'Only one survivor.'],
  },
  {
    fichier: '04-hub',
    fr: ['Manger, boire, dormir.', 'Chaque jour se paie.'],
    en: ['Eat, drink, sleep.', 'Every day has a price.'],
  },
  {
    fichier: '07-rencontre',
    fr: ['Plus de 250 rencontres', 'écrites à la main.'],
    en: ['Over 250 encounters,', 'every one hand-written.'],
  },
  {
    fichier: '08-bagarre',
    fr: ['La rue négocie', 'rarement.'],
    en: ['The street rarely', 'negotiates.'],
  },
  {
    /*
     * ON A ÉCHANGÉ LE MINI-JEU CONTRE LA MANCHE, ET C'EST UNE CORRECTION.
     *
     * La fouille est un damier sombre : à la taille d'une vignette, elle se lit
     * comme un rectangle noir, c'est-à-dire comme rien. Une capture doit être
     * reconnaissable À DEUX CENTIMÈTRES DE HAUT ou elle ne sert à rien, si
     * jolie soit-elle en grand.
     */
    fichier: '05-mendier',
    fr: ['Tendre la main,', 'et voir qui s\'arrête.'],
    en: ['Hold out your hand,', 'and see who stops.'],
  },
  {
    fichier: '09-garde-robe',
    fr: ['51 accessoires à gagner.', 'Aucun à acheter.'],
    en: ['51 accessories to earn.', 'None for sale.'],
  },
];

for (const pl of PLANCHES) {
  const src = join(BRUTES, `${pl.fichier}.png`);
  if (!existsSync(src)) {
    console.log(`ARRÊT : ${src} manque. Lancer d'abord : PX=1440 pnpm captures-store`);
    process.exit(1);
  }
}

const b = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await b.newPage();
await p.setViewport({ width: L, height: H, deviceScaleFactor: 1 });
/*
 * ON SE PLACE D'ABORD SUR LE SERVEUR DU JEU, ET C'EST NÉCESSAIRE.
 *
 * `setContent` seul laisse la page sur `about:blank`. La feuille de polices est
 * alors demandée depuis une origine opaque, la requête n'aboutit jamais, et
 * l'attente du réseau expire au bout de trente secondes sans rien dire d'utile.
 * En partant de `localhost:8099`, le document garde cette origine et les
 * polices du jeu arrivent comme pour n'importe quelle page du jeu.
 */
await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded' });

/*
 * LE CARTON, REPRIS DE L'OUVERTURE SANS UNE VIRGULE DE DIFFÉRENCE.
 * Le kraft, la cannelure de biais, deux auréoles d'humidité, les bords mangés.
 * Un aplat beige ne fait pas du carton, il fait un fond beige — et la fiche
 * doit ressembler au jeu, sinon elle promet un autre jeu.
 */
const CARTON = `
  background: linear-gradient(163deg, #D2B187 0%, #C4A277 46%, #B08F63 100%);`;
const COUCHES = `
  <div class="c" style="opacity:.22;background-image:repeating-linear-gradient(97deg,rgba(88,62,38,.5) 0 2px,transparent 2px 14px)"></div>
  <div class="c" style="opacity:.30;background:
      radial-gradient(58% 34% at 22% 26%, rgba(120,86,52,.55) 0%, transparent 62%),
      radial-gradient(44% 28% at 82% 72%, rgba(104,74,44,.42) 0%, transparent 66%)"></div>
  <div class="c" style="background:radial-gradient(128% 84% at 50% 46%, transparent 52%, rgba(58,42,30,.42) 100%)"></div>`;

/** Deux bouts de gaffer, découpés en dents inégales, jamais d'équerre. */
const scotch = (style) => `
  <div style="position:absolute;${style};width:230px;height:74px;
    background:linear-gradient(177deg,#6E6A62 0%,#5C5851 34%,#4E4A44 66%,#66625B 100%);
    box-shadow:0 8px 18px rgba(26,18,12,.4);
    clip-path:polygon(0 18%,4% 3%,7% 21%,3% 36%,6% 50%,2% 65%,5% 80%,1% 94%,96% 100%,99% 84%,96% 68%,100% 54%,97% 39%,100% 24%,97% 10%)">
    <div style="position:absolute;inset:0;opacity:.34;background-image:
      repeating-linear-gradient(90deg,rgba(22,20,18,.75) 0 2px,transparent 2px 6px),
      repeating-linear-gradient(0deg,rgba(22,20,18,.32) 0 2px,transparent 2px 14px)"></div>
  </div>`;

/*
 * DEUX MISES EN PAGE, CHOISIES PAR LA MESURE ET NON AU JUGÉ.
 *
 * Toutes les captures ne remplissent pas leur écran. `hauteurDuContenu` plus bas
 * mesure jusqu'où descend celui de chacune, et les chiffres sont nets :
 * le choix des personnages occupe 100 % de la hauteur, la garde-robe 99 %,
 * mais l'écran de combat s'arrête à 54 % et la manche à 58 %. Le reste est du
 * fond, parce que c'est un écran de téléphone dont le contenu tient en haut.
 *
 * Étalées dans un cadre qui déborde, ces trois-là donnaient un tiers d'image
 * vide, et ça se lisait comme un bug de composition. Les zoomer aurait rogné
 * les côtés, où passent justement les boutons d'action : mesuré, il n'y a que
 * 4,1 % de marge, soit un zoom maximal de 1,09 qui ne récupère presque rien.
 *
 *   · CONTENU ≥ 85 % → LE CADRE DÉBORDE PAR LE BAS. Le jeu continue hors de
 *     l'image, et on ne dépense pas 300 px à dessiner un téléphone que le
 *     joueur tient déjà dans la main.
 *
 *   · CONTENU < 85 % → UNE CARTE SCOTCHÉE. On coupe la capture à la hauteur de
 *     son contenu et on la pose sur le carton, entière, avec sa marge autour.
 *     Le vide devient alors du carton, c'est-à-dire de la matière du jeu, au
 *     lieu d'être du blanc d'application.
 */
function page(lignes, imageDataURI, contenu) {
  const deborde = contenu >= 0.85;
  const largeur = 1240;
  /*
   * TROIS POUR CENT DE MARGE SOUS LE CONTENU, et ce n'est pas de l'esthétique.
   * Coupée pile à la dernière ligne, la carte donnait un texte collé au bord,
   * qu'on lit comme une image tronquée plutôt que comme une carte posée.
   */
  const hautCadre = deborde ? H - 500 + 60 : Math.round(largeur * 2 * Math.min(contenu + 0.03, 1));
  const haut = deborde ? 500 : 560;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:8099/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${L}px;height:${H}px;overflow:hidden;position:relative;${CARTON}}
  .c{position:absolute;inset:0}
  /* LE TITRE. Fredoka, la police des titres du jeu. Assez gros pour tenir en
     vignette : c'est la seule chose qui doit rester lisible à 2 cm de haut. */
  .titre{position:absolute;top:96px;left:0;right:0;text-align:center;
    font-family:'Fredoka',system-ui,sans-serif;font-weight:600;color:#2A1F1A;
    line-height:1.06;letter-spacing:-.01em;
    text-shadow:0 2px 0 rgba(255,255,255,.14)}
  .l1{font-size:106px}
  .l2{font-size:78px;color:#4A3728;margin-top:12px}
  .ecran{position:absolute;left:50%;top:${haut}px;width:${largeur}px;height:${hautCadre}px;
    transform:translateX(-50%) rotate(-1.4deg);
    border-radius:${deborde ? '34px 34px 0 0' : '34px'};overflow:hidden;
    box-shadow:0 34px 70px rgba(38,26,16,.5), 0 0 0 10px rgba(58,42,30,.30);}
  .ecran img{display:block;width:100%}
</style></head><body>
  ${COUCHES}
  <div class="titre"><div class="l1">${lignes[0]}</div><div class="l2">${lignes[1]}</div></div>
  <div class="ecran"><img src="${imageDataURI}"></div>
  ${scotch(`left:96px;top:${haut - 46}px;transform:rotate(-7deg)`)}
  ${scotch(`right:90px;top:${haut - 22}px;transform:rotate(5deg)`)}
</body></html>`;
}

/*
 * JUSQU'OÙ DESCEND LE CONTENU, MESURÉ ET NON RECOPIÉ.
 *
 * On aurait pu inscrire les six fractions en dur : elles ont été mesurées une
 * fois. Mais les captures se régénèrent à chaque changement du jeu, et une
 * table de chiffres figée deviendrait fausse en silence — la mise en page
 * choisirait alors le mauvais cadre pour une capture qui a changé, sans que
 * personne ne voie pourquoi.
 *
 * On échantillonne donc la couleur du fond dans un coin certainement vide, puis
 * on remonte l'image jusqu'à la dernière ligne qui s'en écarte. C'est la même
 * méthode que la mesure faite à la main, mais elle repart à chaque exécution.
 */
async function hauteurDuContenu(dataURI) {
  return p.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const px = (X, Y) => { const i = (Y * c.width + X) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const ref = px(14, Math.round(c.height * 0.97));
    const fond = p => Math.max(...p.map((v, i) => Math.abs(v - ref[i]))) < 22;
    for (let y = c.height - 1; y > 0; y -= 4) {
      let n = 0;
      for (let X = 0; X < c.width; X += 6) if (!fond(px(X, y))) n++;
      if (n > 4) return y / c.height;
    }
    return 1;
  }, dataURI);
}

const faites = [];
for (const pl of PLANCHES) {
  const brut = readFileSync(join(BRUTES, `${pl.fichier}.png`)).toString('base64');
  const uri = `data:image/png;base64,${brut}`;
  const contenu = await hauteurDuContenu(uri);
  await p.setContent(page(pl[LANG], uri, contenu), { waitUntil: 'load' });
  // Les polices ET l'image, décodées : capturer avant, c'est photographier
  // une police de repli et un cadre vide.
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  });
  const nom = `${String(faites.length + 1).padStart(2, '0')}-${pl.fichier.replace(/^\d+-/, '')}.png`;
  await p.screenshot({ path: join(SORTIE, nom) });
  console.log(`  ok   ${nom.padEnd(28)} contenu ${(contenu * 100).toFixed(0).padStart(3)} %  ${contenu >= 0.85 ? 'débordant' : 'carte    '}  « ${pl[LANG][0]} ${pl[LANG][1]} »`);
  faites.push(nom);
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LE VISUEL DE MISE EN AVANT — 1024 × 500, ET IL EST OBLIGATOIRE.
 *
 * Sans lui la fiche ne part pas, et c'est la pièce qu'on oublie parce qu'on ne
 * la voit nulle part pendant qu'on travaille : elle sert d'en-tête à la fiche
 * et de vignette dans les sélections éditoriales.
 *
 * DEUX CONTRAINTES QUI NE SE DISCUTENT PAS. Aucune transparence — un PNG à
 * canal alpha est refusé au téléversement. Et tout ce qui compte doit tenir
 * dans une zone sûre de 924 × 400 au centre : Google recadre les bords selon
 * les surfaces, et un titre calé au bord se retrouve coupé sans prévenir.
 *
 * On prend la key art du jeu, celle de l'écran-titre : une ville en carton,
 * photographiée, qui dit en une image de quoi il s'agit. Le titre se pose à
 * gauche sur un voile sombre, parce qu'un texte clair sur un ciel orange ne se
 * lit pas. Et la signature du studio en bas à droite, discrète.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const AL = 1024, AH = 500, MARGE = 50;        // zone sûre : 924 × 400
const hero = readFileSync('client/public/assets/hero-cardboard-city.png').toString('base64');
const emb = readFileSync('client/public/assets/studio-embleme.webp').toString('base64');
const TITRE = { fr: ['Le Roi du Carton', 'Une épopée urbaine'],
                en: ['Cardboard King', 'An urban epic'] }[LANG];

await p.setViewport({ width: AL, height: AH, deviceScaleFactor: 1 });
await p.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:8099/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${AL}px;height:${AH}px;overflow:hidden;position:relative;background:#1A120C}
  .art{position:absolute;inset:0;background:url(data:image/png;base64,${hero}) center/cover no-repeat}
  /* LE VOILE. Il n'assombrit pas l'image entière : il descend de la gauche et
     s'efface aux deux tiers, pour que le titre porte sans éteindre la ville. */
  .voile{position:absolute;inset:0;background:
    linear-gradient(90deg, rgba(24,16,10,.90) 0%, rgba(24,16,10,.72) 38%, rgba(24,16,10,.12) 66%, transparent 82%)}
  .txt{position:absolute;left:${MARGE + 18}px;top:44%;transform:translateY(-50%);
    font-family:'Fredoka',system-ui,sans-serif}
  .t1{font-size:72px;font-weight:600;color:#F6EADA;line-height:1.02;
    text-shadow:0 3px 14px rgba(0,0,0,.6)}
  .t2{margin-top:14px;font-size:29px;font-weight:400;color:#D8BF9C;letter-spacing:.10em;
    text-transform:uppercase;text-shadow:0 2px 8px rgba(0,0,0,.55)}
  /*
   * LA SIGNATURE DU STUDIO PASSE À GAUCHE, DANS LE VOILE.
   * Posée en bas à droite, elle tombait sur le banc et les immeubles : le raton
   * gris sur du carton brun et ses lettres noires sur des façades sombres se
   * lisaient comme un élément du décor, pas comme une signature. À gauche, le
   * voile lui fait un fond, et elle reste dans la zone sûre de 924 × 400.
   */
  .studio{position:absolute;left:${MARGE + 18}px;bottom:${MARGE + 8}px;
    display:flex;align-items:center;gap:12px;opacity:.95}
  .studio img{height:62px;filter:drop-shadow(0 3px 8px rgba(0,0,0,.6))}
  .studio span{font-family:'Fredoka',system-ui,sans-serif;font-size:18px;font-weight:500;
    color:#EBD9C0;letter-spacing:.09em;text-shadow:0 2px 6px rgba(0,0,0,.6)}
</style></head><body>
  <div class="art"></div><div class="voile"></div>
  <div class="txt"><div class="t1">${TITRE[0]}</div><div class="t2">${TITRE[1]}</div></div>
  <div class="studio"><img src="data:image/webp;base64,${emb}"><span>AT DEUX MAIN</span></div>
</body></html>`, { waitUntil: 'load' });
await p.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
});
// JPEG plutôt que PNG : le format ne PEUT pas porter de transparence, donc le
// refus le plus courant au téléversement devient impossible par construction.
await p.screenshot({ path: join(SORTIE, 'mise-en-avant-1024x500.jpg'), type: 'jpeg', quality: 94 });
console.log(`  ok   mise-en-avant-1024x500.jpg   ${AL} × ${AH}, sans transparence`);

await b.close();
console.log(`\n${faites.length} capture(s) + 1 visuel de mise en avant dans ${SORTIE}.`);
console.log(`Captures en ${L} × ${H} (rapport 2:1). Le Play Store en accepte huit au plus.`);
console.log('Reste l\'icône 512 × 512 : `python3 scripts/icone-store.py`.');
