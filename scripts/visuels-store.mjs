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
const PORTRAITS = process.env.PORTRAITS || join(process.cwd(), `portraits-store/${LANG === 'en' ? 'en' : 'fr'}`);
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
    // La première porte le NOM DU JEU en plus de son accroche : c'est la seule
    // que tout le monde voit, et une fiche sans marque ne se retient pas.
    couverture: true,    // pas d'écran : la key art, le nom, et les visages
    depart: 0.10,
  },
  {
    /*
     * LA RÉPLIQUE, ET POURQUOI ELLE ARRIVE EN DEUXIÈME.
     *
     * Le différenciateur de ce jeu est son écriture : un humour sec, jamais aux
     * dépens de ses personnages. Il était invisible sur la fiche — enfoui dans
     * des textes d'interface de dix pixels, c'est-à-dire nulle part. Une fiche
     * qui ne montre pas ce qui distingue le produit vend un produit ordinaire.
     *
     * Cette planche ne montre donc AUCUN écran : un visage, une phrase du jeu
     * en grand, et le nom de qui la porte. Elle rompt aussi le gabarit des
     * autres, ce qui donne une raison de faire défiler : six images bâties
     * pareil apprennent au visiteur que la suivante ne dira rien de neuf.
     *
     * En deuxième position, c'est-à-dire au premier balayage : la première
     * planche doit encore dire de quoi il s'agit.
     */
    replique: true,
    fond: 'scene-centre-ville.webp',
    fr: [], en: [],
  },
  {
    fichier: '04-hub',
    fr: ['Manger, boire, dormir.', 'Chaque jour se paie.'],
    en: ['Eat, drink, sleep.', 'Every day has a price.'],
    depart: 0.37,        // à partir des six jauges, jusqu'aux quatre actions
    fond: 'scene-parc.webp',
  },
  {
    fichier: '07-rencontre',
    fr: ['Plus de 250 rencontres', 'écrites à la main.'],
    en: ['Over 250 encounters,', 'every one hand-written.'],
    depart: 0.22,        // à partir du titre de la rencontre
    fond: 'exp-cinema-sauvage.webp',
  },
  {
    fichier: '08-bagarre',
    fr: ['La rue négocie', 'rarement.'],
    en: ['The street rarely', 'negotiates.'],
    depart: 0.00,        // à partir de l'adversaire
    fond: 'scene-zone-industrielle.webp',
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
    depart: 0.02,        // à partir du titre du mini-jeu
    fond: 'exp-metro-oXzk6PRiafCRXLVLnLSSVq.webp',
  },
  {
    fichier: '09-garde-robe',
    fr: ['51 accessoires à gagner.', 'Aucun à acheter.'],
    en: ['51 accessories to earn.', 'None for sale.'],
    depart: 0.37,        // à partir de la grille d'accessoires
    fond: 'exp-vide-grenier.webp',
  },
];

for (const pl of PLANCHES) {
  // Ni la réplique ni la couverture ne montrent d'écran : rien à vérifier.
  if (pl.replique || pl.couverture) continue;
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
/*
 * LA SCÈNE SOUS LE CARTON, ET POURQUOI ELLE MANQUAIT.
 *
 * Le kraft seul faisait des planches propres et plates : « trop simple, trop
 * fade », et le mot est juste. Un aplat, même texturé, ne raconte pas où se
 * passe le jeu — or ce jeu a quatre-vingt-six décors photographiés en carton,
 * qui ne servaient qu'à l'intérieur.
 *
 * Chacun s'installe donc derrière sa planche, choisi pour ce qu'elle dit : un
 * parc pour les jauges du quotidien, une zone industrielle pour la bagarre, le
 * métro pour la manche. Désaturé, assombri et laissé à 34 % pour qu'il donne
 * de la PROFONDEUR sans jamais concurrencer l'écran posé dessus : on doit le
 * sentir plus que le regarder.
 */
const scene = (data) => data ? `
  <div class="c" style="background:url(data:image/webp;base64,${data}) center/cover no-repeat;
    opacity:.34;filter:saturate(.62) contrast(1.06) brightness(.92)"></div>
  <div class="c" style="background:linear-gradient(178deg, rgba(196,162,119,.42) 0%, rgba(176,143,99,.70) 62%, rgba(140,110,74,.86) 100%)"></div>` : '';

const COUCHES = `
  <div class="c" style="opacity:.22;background-image:repeating-linear-gradient(97deg,rgba(88,62,38,.5) 0 2px,transparent 2px 14px)"></div>
  <div class="c" style="opacity:.30;background:
      radial-gradient(58% 34% at 22% 26%, rgba(120,86,52,.55) 0%, transparent 62%),
      radial-gradient(44% 28% at 82% 72%, rgba(104,74,44,.42) 0%, transparent 66%)"></div>
  <div class="c" style="background:radial-gradient(122% 80% at 50% 44%, transparent 44%, rgba(48,34,22,.56) 100%)"></div>`;

/*
 * LES HABITANTS, ET POURQUOI ILS MANQUAIENT.
 *
 * Les six visuels ne montraient qu'un écran de téléphone posé sur du carton.
 * C'était propre, exact, et mort : rien n'y regardait le visiteur. Or le jeu
 * parle de GENS — un ancien bibliothécaire, une ancienne avocate, un musicien
 * qui a connu de meilleurs jours — et aucun n'apparaissait sur la fiche censée
 * les vendre.
 *
 * Deux portraits par visuel, posés de travers en bas, débordant du cadre comme
 * des photos qu'on aurait laissées là. Ils viennent du jeu lui-même
 * (`pnpm portraits-store`), avec leur nom et leur ancien métier : c'est la
 * phrase la plus courte qui dise ce qu'est ce jeu — quelqu'un qui avait une vie
 * avant.
 *
 * ILS SONT DIFFÉRENTS D'UN VISUEL À L'AUTRE. Deux fois la même tête sur six
 * images donnerait l'impression d'un jeu à trois personnages ; le décalage par
 * l'index de la planche garantit douze visages pour six visuels.
 */
/*
 * L'ATTROUPEMENT, ET POURQUOI IL EST EN BAS ET COUPÉ.
 *
 * Premier essai : deux portraits posés de travers, avec leur nom et leur ancien
 * métier. Ils ont apporté de la vie et deux défauts. Ils tombaient AU MILIEU de
 * l'écran du téléphone, cachant une carte de personnage ici, un bouton là —
 * c'est-à-dire ce que le visuel est censé montrer. Et leurs noms, écrits à 34 px
 * sur 1440, disparaissaient de toute façon dès la vignette, tout en coûtant la
 * place qui les faisait déborder du cadre.
 *
 * Deuxième parti, celui-ci : TROIS figures alignées au bas de l'image, qui se
 * chevauchent un peu et que le bord coupe à mi-hauteur. On ne les lit plus une
 * par une, on lit un attroupement — des gens devant l'écran plutôt que des
 * autocollants dessus. Le rognage par le bas est VOULU, ce qui règle du même
 * coup le problème des noms coupés : il n'y a plus de nom à couper.
 *
 * Ils gardent leur ombre portée, qui est ce qui les décolle du téléphone.
 */
function attroupement(gens) {
  const poses = [
    { g: 0, style: 'left:38px;bottom:-118px;transform:rotate(-7deg)', cote: 430, z: 3 },
    { g: 1, style: 'left:50%;margin-left:-230px;bottom:-150px;transform:rotate(3deg)', cote: 460, z: 2 },
    { g: 2, style: 'right:34px;bottom:-126px;transform:rotate(6deg)', cote: 420, z: 3 },
  ];
  return poses.map(({ g, style, cote, z }) => `
  <img src="data:image/png;base64,${gens[g].data}"
    style="position:absolute;${style};width:${cote}px;z-index:${z};
      filter:drop-shadow(0 -6px 22px rgba(38,26,16,.42)) drop-shadow(0 10px 20px rgba(38,26,16,.5))">`).join('');
}

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
 * ON NE MONTRE PLUS L'ÉCRAN ENTIER : ON CADRE SUR CE QUE LA PHRASE ANNONCE.
 *
 * Le reproche est juste et il est mesurable. Un visuel du Play Store est vu
 * pour la première fois à 112 px de large dans la grille de résultats. À cette
 * taille, un écran de téléphone entier — six jauges, quatre tuiles, deux
 * bandeaux, une carte météo — devient une texture grise. Le visiteur n'y voit
 * pas ce qu'on fait dans ce jeu, il y voit « une application avec des menus ».
 *
 * Chaque planche déclare donc le MORCEAU qui correspond à sa phrase, mesuré
 * sur la capture : les six jauges et les quatre actions pour « chaque jour se
 * paie », les trois coups et la barre de santé pour « la rue négocie rarement ».
 * Le cadre est plus large (1380 au lieu de 1240) et ne contient plus que la
 * moitié de l'écran : l'élément à lire occupe environ deux fois plus de
 * surface, ce qui est exactement ce qu'on veut dire par « zoomer ».
 *
 * ET LA PLACE LIBÉRÉE VA AU TITRE. C'est l'autre moitié de la correction : la
 * ligne d'accroche passe de 106 à 148 px, parce qu'elle est la seule chose
 * qu'on peut lire sans cliquer. Elle ne partage plus l'image avec un écran
 * qui la remplissait de haut en bas.
 */
/*
 * LE CADRE A UNE HAUTEUR FIXE, ET LA PLANCHE NE DIT QUE PAR OÙ COMMENCER.
 *
 * Première version : chaque planche déclarait un début ET une fin. Les six
 * fenêtres ont donc fini de six hauteurs différentes, et sous les plus courtes
 * s'ouvrait une plage de carton vide de six cents pixels — le défaut qu'on
 * venait justement de corriger sur les captures au bas creux, réintroduit par
 * la main gauche.
 *
 * Le cadre va maintenant du titre à l'attroupement, toujours. La planche dit
 * seulement OÙ commencer à regarder, et la fenêtre qui suit est la même pour
 * tout le monde : environ 60 % de l'écran au lieu de 100 %, ce qui double la
 * surface qu'occupe l'élément à lire. On borne le départ pour ne jamais
 * demander une fenêtre qui dépasse le bas de la capture.
 */
const BAS_CADRE = 2300;
function cadre(depart, haut) {
  const largeur = 1380;
  const echelle = largeur / L;                   // la capture fait L de large
  const hauteur = BAS_CADRE - haut;
  const fenetre = hauteur / echelle / H;         // en fraction de la capture
  const y0 = Math.min(Math.max(depart ?? 0, 0), Math.max(0, 1 - fenetre));
  return { largeur, hauteur, y0, fenetre,
           decalage: Math.round(H * y0 * echelle), hauteurImage: Math.round(H * echelle) };
}

/*
 * LA FONTE SUIT LA LONGUEUR DE LA PHRASE.
 *
 * À 148 px, « 51 accessoires à gagner. » passait à la ligne et le titre
 * mangeait le cadre. Agrandir un titre n'a d'intérêt que s'il tient sur sa
 * ligne : au-delà, la seconde ligne coûte plus de lisibilité que les pixels
 * n'en gagnent.
 */
const taille = (texte, grand, moyen, petit) =>
  texte.length <= 20 ? grand : texte.length <= 23 ? moyen : petit;

/*
 * ON CHOISIT LA RÉPLIQUE PAR L'ÉMOJI DU MÉTIER, ET NON PAR SON TEXTE.
 *
 * Le tirage des candidats est aléatoire : demander une phrase par son libellé
 * français la rendrait introuvable une fois sur deux, et introuvable en anglais
 * toujours. L'émoji, lui, est le même dans les deux langues et identifie le
 * métier — on classe donc par émoji, du plus mordant au moins, et on prend le
 * premier des douze portraits qui tombe dessus.
 */
const REPLIQUES_PREFEREES = ['👨‍🍳', '🚗', '🍷', '🌱', '🧮', '💻'];
function choisirReplique(gensDispo) {
  for (const emoji of REPLIQUES_PREFEREES) {
    const t = gensDispo.find(g => g.metier.includes(emoji) && g.citation);
    if (t) return t;
  }
  return gensDispo.find(g => g.citation) || gensDispo[0];
}

/*
 * LA COUVERTURE, ET POURQUOI CE N'EST PLUS UN TITRE POSÉ SUR DU CARTON.
 *
 * La première planche portait le nom du jeu écrit en Fredoka sur le kraft, au-
 * dessus d'une capture. C'était lisible et sans valeur : un nom en caractères
 * ordinaires sur un fond uni ne dit rien de ce qu'on achète, et c'est la seule
 * image que TOUT LE MONDE voit.
 *
 * Elle reprend donc la key art du jeu — la ville en carton photographiée, celle
 * de l'écran-titre et du visuel de mise en avant — en plein cadre. Le nom se
 * pose dessus sur un voile sombre monté du bas, et trois habitants ferment
 * l'image. Le visiteur voit un décor, un titre et des gens : de quoi savoir en
 * une seconde à quoi ressemble ce jeu.
 */
function pageCouverture(lignes, heroData, gens, fondData) {
  /*
   * LA KEY ART EST UNE BANDE, ET C'EST UNE CONTRAINTE, PAS UN CHOIX.
   *
   * Elle mesure 1200 × 670, très large. La première version l'a étirée sur
   * 1560 px de haut puis laissée mourir dans un aplat noir : un tiers de
   * l'image ne contenait rien du tout. Et la faire couvrir toute la hauteur
   * demanderait de l'agrandir trois fois pour n'en montrer qu'une tranche de
   * 480 px — on vendrait une image floue de deux immeubles.
   *
   * Elle occupe donc le haut à une échelle raisonnable et se fond dans le
   * carton par une déchirure. Le nom du jeu se pose SUR elle, en clair sur le
   * voile sombre : c'est le geste du visuel de mise en avant, celui qui
   * marchait. Le carton reprend dessous pour l'accroche et les habitants.
   */
  /*
   * LA BANDE MONTE UN PEU, ET LE RESTE SE REMPLIT DE MATIÈRE, PAS DE PIXELS.
   *
   * Le creux entre l'accroche et les habitants demandait soit une image plus
   * haute, soit autre chose dedans. Plus haute, il faudrait l'agrandir 2,2 fois
   * depuis une source de 1200 px : molle exactement là où elle doit convaincre.
   * On lui met donc un décor de rue sous le carton, comme aux autres planches,
   * et on remonte les visages jusqu'à toucher l'accroche.
   */
  const ART = 1340;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:8099/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${L}px;height:${H}px;overflow:hidden;position:relative;${CARTON}}
  .c{position:absolute;inset:0}
  .art{position:absolute;left:0;right:0;top:0;height:${ART}px;
    background:url(data:image/png;base64,${heroData}) center 38%/cover no-repeat}
  .voile{position:absolute;left:0;right:0;top:${ART - 620}px;height:620px;
    background:linear-gradient(180deg, rgba(24,16,10,0) 0%, rgba(24,16,10,.56) 46%, rgba(24,16,10,.88) 100%)}
  /* La couture entre la photo et le carton : une déchirure, pas un trait net. */
  .couture{position:absolute;left:-20px;right:-20px;top:${ART - 30}px;height:64px;
    background:linear-gradient(180deg, rgba(26,18,12,.92) 0%, rgba(150,120,84,0) 100%);
    clip-path:polygon(0 0,7% 42%,14% 8%,22% 50%,31% 14%,39% 54%,48% 12%,57% 48%,66% 10%,75% 52%,84% 16%,92% 46%,100% 6%,100% 100%,0 100%)}
  .titre{position:absolute;left:60px;right:60px;top:${ART - 340}px;text-align:center;
    font-family:'Fredoka',system-ui,sans-serif;font-weight:600;font-size:162px;
    color:#F7EBDB;line-height:1;letter-spacing:-.025em;
    text-shadow:0 8px 30px rgba(0,0,0,.8), 0 2px 0 rgba(0,0,0,.45)}
  .accroche{position:absolute;left:70px;right:70px;top:${ART + 150}px;text-align:center;
    font-family:'Fredoka',system-ui,sans-serif;font-weight:600;font-size:118px;
    color:#2A1F1A;line-height:1.05;text-shadow:0 2px 0 rgba(255,255,255,.18)}
  .accroche em{display:block;font-style:normal;font-size:86px;color:#4A3728;margin-top:14px}
  .gens img{position:absolute;filter:drop-shadow(0 -8px 26px rgba(38,26,16,.45)) drop-shadow(0 14px 26px rgba(38,26,16,.5))}
</style></head><body>
  ${scene(fondData)}
  ${COUCHES}
  <div class="art"></div><div class="voile"></div><div class="couture"></div>
  <div class="titre">${LANG === 'en' ? 'Cardboard King' : 'Le Roi du Carton'}</div>
  <svg width="700" height="30" viewBox="0 0 196 14" style="position:absolute;top:${ART - 132}px;left:50%;margin-left:-350px" aria-hidden>
    <path d="M5 8 Q50 3 99 7 T191 5" fill="none" stroke="#E8D2A8" stroke-width="2.6"
      stroke-linecap="round" opacity=".85"/>
  </svg>
  <div class="accroche">${lignes[0]}<em>${lignes[1]}</em></div>
  <div class="gens">
    <img src="data:image/png;base64,${gens[0].data}" style="left:-36px;bottom:20px;width:660px;transform:rotate(-8deg)">
    <img src="data:image/png;base64,${gens[1].data}" style="left:50%;margin-left:-355px;bottom:-40px;width:710px;transform:rotate(3deg)">
    <img src="data:image/png;base64,${gens[2].data}" style="right:-42px;bottom:8px;width:650px;transform:rotate(7deg)">
  </div>
</body></html>`;
}

function pageReplique(g, fondData) {
  /*
   * LE VISAGE D'ABORD, LA PHRASE ENSUITE, et c'est une correction.
   *
   * La première version posait la citation en haut et le portrait tout en bas :
   * mille pixels de carton vide entre les deux, et l'ordre de lecture à
   * l'envers. On voit quelqu'un, PUIS on lit ce qu'il dit — c'est comme ça
   * qu'une réplique s'attribue, et ça remplit la planche par la même occasion.
   *
   * La phrase est en serif italique quand tout le reste de la fiche est en
   * Fredoka : le changement de voix se voit avant d'être lu.
   */
  const longue = g.citation.length > 48;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:8099/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${L}px;height:${H}px;overflow:hidden;position:relative;${CARTON}}
  .c{position:absolute;inset:0}
  .qui{position:absolute;left:0;right:0;top:360px;text-align:center}
  .qui img{width:660px;filter:drop-shadow(0 18px 34px rgba(38,26,16,.55))}
  .nom{margin-top:26px;font-family:'Fredoka',system-ui,sans-serif;font-weight:600;
    font-size:92px;color:#2A1F1A;line-height:1.04;
    text-shadow:0 2px 0 rgba(255,255,255,.18)}
  .metier{font-family:'Fredoka',system-ui,sans-serif;font-weight:400;
    font-size:50px;color:#5A4632;margin-top:6px}
  /* LES GUILLEMETS : ils disent « quelqu'un parle » avant qu'on ait lu un mot. */
  .guillemet{position:absolute;font-family:'DM Serif Display',Georgia,serif;
    font-size:480px;color:#8A6C48;opacity:.30;line-height:.8}
  .phrase{position:absolute;left:104px;right:104px;top:1330px;text-align:center;
    font-family:'DM Serif Display',Georgia,serif;font-style:italic;
    font-size:${longue ? 116 : 132}px;line-height:1.18;color:#241A12;
    text-shadow:0 2px 0 rgba(255,255,255,.18)}
</style></head><body>
  ${fondData ? `
  <div class="c" style="background:url(data:image/webp;base64,${fondData}) center/cover no-repeat;
    opacity:.55;filter:saturate(.66) contrast(1.08) brightness(.88)"></div>
  <div class="c" style="background:linear-gradient(178deg, rgba(196,162,119,.32) 0%, rgba(176,143,99,.58) 44%, rgba(120,94,62,.82) 100%)"></div>` : ''}
  ${COUCHES}
  <div class="qui">
    <img src="data:image/png;base64,${g.data}">
    <div class="nom">${g.nom}</div>
    <div class="metier">${g.metier}</div>
  </div>
  <div class="guillemet" style="left:40px;top:1190px">&ldquo;</div>
  <div class="guillemet" style="right:40px;bottom:400px">&rdquo;</div>
  <div class="phrase">${g.citation}</div>
</body></html>`;
}

function page(lignes, imageDataURI, gens, pl, fondData) {
  // L'enseigne a disparu d'ici : le nom du jeu vit maintenant sur la
  // couverture, sur la key art, où il vaut autre chose qu'un mot posé.
  const haut = 560;
  const c = cadre(pl.depart, haut);
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:8099/fonts/fonts.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${L}px;height:${H}px;overflow:hidden;position:relative;${CARTON}}
  .c{position:absolute;inset:0}
  .titre{position:absolute;left:0;right:0;text-align:center;
    font-family:'Fredoka',system-ui,sans-serif;font-weight:600;color:#2A1F1A;
    line-height:1.04;letter-spacing:-.015em;
    text-shadow:0 2px 0 rgba(255,255,255,.16)}
  .l1{font-size:${taille(lignes[0], 148, 126, 108)}px}
  .l2{font-size:${taille(lignes[1], 104, 92, 82)}px;color:#4A3728;margin-top:8px}
  .ecran{position:absolute;left:50%;top:${haut}px;width:${c.largeur}px;height:${c.hauteur}px;
    transform:translateX(-50%) rotate(-1.2deg);
    border-radius:30px;overflow:hidden;
    box-shadow:0 34px 70px rgba(38,26,16,.5), 0 0 0 10px rgba(58,42,30,.30)}
  .ecran img{position:absolute;left:0;top:${-c.decalage}px;width:100%;height:${c.hauteurImage}px}
</style></head><body>
  ${scene(fondData)}
  ${COUCHES}
  <div class="titre" style="top:116px">
    <div class="l1">${lignes[0]}</div><div class="l2">${lignes[1]}</div>
  </div>
  <div class="ecran"><img src="${imageDataURI}"></div>
  ${scotch(`left:118px;top:${haut - 46}px;transform:rotate(-7deg)`)}
  ${scotch(`right:112px;top:${haut - 22}px;transform:rotate(5deg)`)}
  ${attroupement(gens)}
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

/*
 * On charge les portraits une fois : douze images de 1280 px encodées à chaque
 * planche coûteraient six fois le même travail pour le même résultat.
 */
if (!existsSync(join(PORTRAITS, 'fiches.json'))) {
  console.log(`ARRÊT : ${PORTRAITS}/fiches.json manque. Lancer d'abord : pnpm portraits-store`);
  process.exit(1);
}
const gensDispo = JSON.parse(readFileSync(join(PORTRAITS, 'fiches.json'), 'utf8'))
  .map(f => ({ ...f, data: readFileSync(join(PORTRAITS, f.fichier)).toString('base64') }));
console.log(`  ${gensDispo.length} portraits chargés depuis ${PORTRAITS}`);

const faites = [];
/* Les décors sont lus une fois chacun, pas une fois par planche. */
const fonds = new Map();
const lireFond = (nom) => {
  if (!nom) return null;
  if (!fonds.has(nom)) fonds.set(nom, readFileSync(join('client/public/assets', nom)).toString('base64'));
  return fonds.get(nom);
};
const HERO = readFileSync('client/public/assets/hero-cardboard-city.png').toString('base64');

for (const pl of PLANCHES) {
  if (pl.couverture) {
    const trois = [0, 1, 2].map(k => gensDispo[k % gensDispo.length]);
    await p.setContent(pageCouverture(pl[LANG], HERO, trois, lireFond('scene-gare.webp')), { waitUntil: 'load' });
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });
    const nom = `${String(faites.length + 1).padStart(2, '0')}-couverture.png`;
    await p.screenshot({ path: join(SORTIE, nom) });
    console.log(`  ok   ${nom.padEnd(28)} couverture        « ${pl[LANG][0]} ${pl[LANG][1]} »`);
    faites.push(nom);
    continue;
  }
  if (pl.replique) {
    const g = choisirReplique(gensDispo);
    await p.setContent(pageReplique(g, lireFond(pl.fond)), { waitUntil: 'load' });
    await p.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });
    const nom = `${String(faites.length + 1).padStart(2, '0')}-replique.png`;
    await p.screenshot({ path: join(SORTIE, nom) });
    console.log(`  ok   ${nom.padEnd(28)} réplique          « ${g.citation} » — ${g.nom}`);
    faites.push(nom);
    continue;
  }
  const brut = readFileSync(join(BRUTES, `${pl.fichier}.png`)).toString('base64');
  const uri = `data:image/png;base64,${brut}`;
  const contenu = await hauteurDuContenu(uri);
  // Trois par planche, six planches : les douze visages tournent sans qu'aucun
  // ne revienne deux fois côte à côte.
  const gens = [0, 1, 2].map(k => gensDispo[(faites.length * 3 + k) % gensDispo.length]);
  await p.setContent(page(pl[LANG], uri, gens, pl, lireFond(pl.fond)), { waitUntil: 'load' });
  // Les polices ET l'image, décodées : capturer avant, c'est photographier
  // une police de repli et un cadre vide.
  await p.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  });
  const nom = `${String(faites.length + 1).padStart(2, '0')}-${pl.fichier.replace(/^\d+-/, '')}.png`;
  await p.screenshot({ path: join(SORTIE, nom) });
  const c = cadre(pl.depart, 560);
  console.log(`  ok   ${nom.padEnd(28)} fenêtre ${(c.y0 * 100).toFixed(0).padStart(3)}–${((c.y0 + c.fenetre) * 100).toFixed(0)} %  « ${pl[LANG][0]} ${pl[LANG][1]} »`);
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
