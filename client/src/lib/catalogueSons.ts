/*
 * LE CATALOGUE DES SONS, POUR LE BANC D'ESSAI.
 *
 * Quarante-neuf bruitages rangés en neuf familles. Chaque entrée dit ce que le
 * son est censé faire ENTENDRE, et où le joueur le rencontre dans le jeu :
 * sans ça, un testeur ne peut dire que « j'aime / j'aime pas », alors qu'on a
 * besoin de savoir si le son fait son travail à l'endroit où il tombe.
 *
 * Les familles ne sont pas un rangement d'archiviste : chacune tient une règle
 * qui la rend reconnaissable sans qu'on y pense, et cette règle est écrite ici
 * parce que c'est elle qu'on demande au testeur de juger.
 */

export interface SonDuCatalogue {
  /** Nom de base du fichier, sans le suffixe de variante ni l'extension. */
  fichier: string;
  /** Nombre de prises différentes. 1 = pas de variante. */
  prises?: number;
  /** Ce qu'on doit entendre. */
  fr: string;
  en: string;
  /** Où le joueur le rencontre. */
  quandFr: string;
  quandEn: string;
  /**
   * Ces sons-là sont très transitoires : leur crête est bonne mais leur sonie
   * moyenne sort du lot. La mesure ne tranche pas, l'oreille si — on le
   * signale au testeur au lieu de le lui cacher.
   */
  aVerifier?: boolean;
}

export interface FamilleDeSons {
  id: string;
  titreFr: string;
  titreEn: string;
  /** La règle interne à la famille, celle qu'on demande de juger. */
  regleFr: string;
  regleEn: string;
  sons: SonDuCatalogue[];
}

export const CATALOGUE_SONS: FamilleDeSons[] = [
  {
    id: 'argent',
    titreFr: "L'argent", titreEn: 'Money',
    regleFr: "Ce qui entre et ce qui sort doivent s'opposer à l'oreille. Et le son doit dire la somme avant que le chiffre s'affiche.",
    regleEn: 'Money coming in and going out must sound opposite. And the sound should tell you the amount before the number appears.',
    sons: [
      { fichier: 'argent-piece-entree', prises: 3, fr: 'Deux pièces au fond d’un gobelet presque vide', en: 'Two coins in a nearly empty cup', quandFr: 'On vous donne 1 à 3 €', quandEn: 'You receive €1–3' },
      { fichier: 'argent-poignee-entree', fr: 'Une poignée versée d’un coup', en: 'A handful poured at once', quandFr: 'On vous donne 4 à 15 €', quandEn: 'You receive €4–15' },
      { fichier: 'argent-liasse', fr: 'Des billets comptés au pouce — un billet ne tinte jamais', en: 'Notes thumbed through — paper never jingles', quandFr: 'Plus de 15 €', quandEn: 'Over €15' },
      { fichier: 'argent-sortie', fr: 'Des pièces raclées sur un comptoir, timbre descendant', en: 'Coins scraped off a counter, falling pitch', quandFr: 'Acheter, payer, dépenser du Karma', quandEn: 'Buying, paying, spending Karma' },
      { fichier: 'moment-piece', fr: 'Une pièce, une seule', en: 'One coin, just one', quandFr: 'Un passant lâche sa pièce, à la manche', quandEn: 'A passer-by drops a coin while begging' },
    ],
  },
  {
    id: 'effort',
    titreFr: "L'effort", titreEn: 'Effort',
    regleFr: 'Que du frottement, jamais de percussion. Si un de ces sons ressemble à un coup, il est raté.',
    regleEn: 'Friction only, never percussion. If one of these sounds like a blow, it has failed.',
    sons: [
      { fichier: 'geste-fouille', prises: 3, fr: 'Des mains qui écartent du carton humide', en: 'Hands pushing aside damp cardboard', quandFr: 'Creuser d’un cran dans la benne', quandEn: 'Digging a layer deeper in the bin' },
      { fichier: 'geste-ramasse', fr: 'Un objet décollé du carton, puis soulevé', en: 'An object peeled off cardboard and lifted', quandFr: 'Ramasser une trouvaille ou le butin', quandEn: 'Picking up a find or the loot' },
      { fichier: 'geste-bricole', fr: 'Du ruban adhésif déroulé, coupé aux dents', en: 'Packing tape unrolled, bitten off', quandFr: 'Fabriquer à l’Établi', quandEn: 'Crafting at the Workbench' },
      { fichier: 'moment-trouvaille', fr: 'Terne, pas cristallin : c’est de la récup’, pas un trésor', en: 'Dull, not sparkly — it is salvage, not treasure', quandFr: 'Une vraie trouvaille sort du tas', quandEn: 'A real find turns up' },
      { fichier: 'geste-usure', fr: 'Du carton mouillé qui se déchire lentement', en: 'Wet cardboard tearing slowly', quandFr: 'Un objet bricolé cède pendant la nuit', quandEn: 'A crafted item gives out overnight' },
      { fichier: 'geste-sac', fr: 'Une fermeture éclair fatiguée, qui accroche', en: 'A tired zipper, catching halfway', quandFr: 'Ouvrir le sac', quandEn: 'Opening the bag' },
      { fichier: 'moment-carton-matin', fr: 'Un rabat décollé, puis le silence — il fait partie du son', en: 'A flap peeled open, then silence — part of the sound', quandFr: 'Le carton du matin', quandEn: 'The morning box' },
      { fichier: 'moment-trajet', fr: 'Six pas sur du gravier mouillé, pas plus', en: 'Six steps on wet gravel, no more', quandFr: 'Changer de quartier', quandEn: 'Moving to another district' },
    ],
  },
  {
    id: 'corps',
    titreFr: 'Le corps', titreEn: 'The body',
    regleFr: 'La seule famille percussive du jeu. C’est ce qui la rend lisible instantanément — à condition que tout le reste ne frappe pas.',
    regleEn: 'The only percussive family. That is what makes it instantly readable — provided nothing else hits.',
    sons: [
      { fichier: 'geste-coup', prises: 3, fr: 'Un poing dans un annuaire, sourd', en: 'A fist into a phone book, dull', quandFr: 'Coup donné en combat', quandEn: 'Landing a blow in combat' },
      { fichier: 'geste-coup-fort', fr: 'Deux couches : le poing, puis une latte sur un mur', en: 'Two layers: the fist, then a slat on a wall', quandFr: 'Coup critique', quandEn: 'Critical hit' },
      { fichier: 'geste-encaisse', fr: 'Le son vient d’autour, pas de devant', en: 'The sound comes from around you, not in front', quandFr: 'Coup reçu', quandEn: 'Taking a hit' },
      { fichier: 'geste-pas', prises: 3, fr: 'Un pas sur du gravier mouillé', en: 'One step on wet gravel', quandFr: 'Se déplacer dans les mini-jeux', quandEn: 'Moving in the minigames' },
      { fichier: 'moment-ko', fr: 'Un carton à hauteur d’homme qui s’aplatit', en: 'A body-sized box collapsing flat', quandFr: 'Mise hors combat', quandEn: 'Knockout' },
    ],
  },
  {
    id: 'autres',
    titreFr: 'Les autres', titreEn: 'Other people',
    regleFr: 'Quatre sons dans toute une partie. Ils doivent être reconnaissables du premier coup : c’est le seul lien social du jeu.',
    regleEn: 'Four sounds in a whole run. They must be recognisable at once — this is the game’s only social contact.',
    sons: [
      { fichier: 'social-partage', fr: 'Un pain rompu à la main. Le geste le plus digne du jeu', en: 'A loaf torn by hand. The most dignified gesture in the game', quandFr: 'Partager à manger avec quelqu’un', quandEn: 'Sharing food with someone' },
      { fichier: 'moment-poignee-main', fr: 'Deux mains sèches qui claquent puis serrent', en: 'Two dry hands clapping then gripping', quandFr: 'Conclure un marchandage', quandEn: 'Closing a haggle', aVerifier: true },
      { fichier: 'social-econduit', fr: 'Trois pas qui s’éloignent, coupés net', en: 'Three steps walking away, cut off', quandFr: 'On vous éconduit', quandEn: 'You are turned away' },
      { fichier: 'geste-troc', fr: 'Un objet qui glisse d’une main à l’autre', en: 'An object sliding hand to hand', quandFr: 'Troquer un objet', quandEn: 'Trading an item' },
    ],
  },
  {
    id: 'perte',
    titreFr: 'La perte', titreEn: 'Loss',
    regleFr: 'Une échelle à cinq degrés : plus la perte est irréversible, plus le son est MOU. L’échec léger claque, l’échec grave s’affaisse. Écoutez-les dans l’ordre.',
    regleEn: 'A five-step scale: the more irreversible the loss, the SOFTER the sound. Light failure snaps, grave failure sags. Listen in order.',
    sons: [
      { fichier: 'perte-rate', prises: 3, fr: 'Un élastique qui claque dans le vide', en: 'A rubber band snapping onto nothing', quandFr: 'Degré 1 — le raté sans conséquence, entendu cent fois', quandEn: 'Step 1 — the harmless miss, heard a hundred times' },
      { fichier: 'moment-attrape', fr: 'Une chaise raclée derrière vous', en: 'A chair scraped behind you', quandFr: 'Degré 2 — repéré. Quelqu’un a levé la tête', quandEn: 'Step 2 — spotted. Someone looked up' },
      { fichier: 'moment-craquement', fr: 'Des cartons qui s’écroulent, et un qui roule à la fin', en: 'Boxes toppling, one rolling at the end', quandFr: 'Degré 3 — l’écroulement. Le rebond final fait la blague', quandEn: 'Step 3 — the collapse. The final bounce is the joke' },
      { fichier: 'perte-dignite', fr: 'De l’adhésif arraché, qui emporte la couche du dessus', en: 'Tape torn off, taking the top layer with it', quandFr: 'Degré 4 — l’humiliation. Aucun impact, que de l’arrachement', quandEn: 'Step 4 — humiliation. No impact, only tearing' },
      { fichier: 'perte-palier', fr: 'Le carton cède d’un coup, un objet tombe au loin', en: 'Cardboard gives way at once, something falls far off', quandFr: 'Degré 5 — un palier de Dignité franchi vers le bas', quandEn: 'Step 5 — a Dignity tier lost' },
    ],
  },
  {
    id: 'identite',
    titreFr: "L'identité", titreEn: 'Identity',
    regleFr: 'Les moments où le jeu parle de qui vous êtes, pas de ce que vous faites.',
    regleEn: 'The moments where the game speaks about who you are, not what you do.',
    sons: [
      { fichier: 'moment-choix-perso', fr: 'Une photo d’identité posée à plat sur du formica', en: 'An ID photo laid flat on formica', quandFr: 'Choisir son personnage', quandEn: 'Choosing your character' },
      { fichier: 'moment-relance', fr: 'Trois cartes battues maladroitement', en: 'Three cards shuffled clumsily', quandFr: 'Relancer le trio de personnages', quandEn: 'Rerolling the trio' },
      { fichier: 'moment-legs', fr: 'Une enveloppe kraft léchée et cachetée', en: 'A kraft envelope licked and sealed', quandFr: 'Léguer un objet au suivant', quandEn: 'Bequeathing an item' },
      { fichier: 'moment-registre', fr: 'Un classeur à levier qui s’ouvre', en: 'A lever arch binder snapping open', quandFr: 'Ouvrir le Registre ou le Cimetière', quandEn: 'Opening the Registry or Cemetery', aVerifier: true },
      { fichier: 'moment-fin-inedite', fr: 'Un tampon encreur, un coup net', en: 'A rubber stamp, one firm hit', quandFr: 'Une fin de mort découverte', quandEn: 'A new ending discovered' },
      { fichier: 'moment-mort', fr: 'Un carton qui s’affaisse sur lui-même, puis plus rien', en: 'A box collapsing in on itself, then nothing', quandFr: 'La mort. Un son trop petit pour l’événement', quandEn: 'Death. A sound too small for the occasion' },
      { fichier: 'moment-sacre', fr: 'Une couronne posée, un manche à balai frappé deux fois', en: 'A crown set down, a broom handle tapped twice', quandFr: 'Sacré Roi du Carton', quandEn: 'Crowned King of Cardboard', aVerifier: true },
      { fichier: 'moment-page', fr: 'Une feuille dépliée et lissée. Doit passer inaperçu', en: 'A sheet unfolded and smoothed. Should go unnoticed', quandFr: 'L’histoire du personnage s’ouvre', quandEn: 'The character’s story opens' },
    ],
  },
  {
    id: 'jour',
    titreFr: 'Le rythme du jour', titreEn: 'The rhythm of the day',
    regleFr: 'Ce qui découpe la partie en journées.',
    regleEn: 'What cuts the run into days.',
    sons: [
      { fichier: 'moment-reveil', fr: 'Une couverture repoussée, une inspiration', en: 'A blanket pushed off, one breath in', quandFr: 'Le bilan de la nuit s’ouvre', quandEn: 'The night summary opens' },
      { fichier: 'moment-jour-nouveau', fr: 'Une bâche tirée, deux moineaux, un rideau de fer', en: 'A tarp pulled aside, two sparrows, a shutter', quandFr: 'Le jour nouveau. Le seul son qui a droit d’être large', quandEn: 'A new day. The only sound allowed to be wide' },
      { fichier: 'moment-victoire', fr: 'Deux paumes qui claquent, un carton chassé du pied', en: 'Two palms clapping, a box kicked aside', quandFr: 'Victoire en combat', quandEn: 'Winning a fight' },
      { fichier: 'geste-gong', fr: 'Un couvercle de poubelle cabossé. Jamais un gong de studio', en: 'A dented bin lid. Never a studio gong', quandFr: 'Début de combat', quandEn: 'A fight begins' },
      { fichier: 'moment-souvenir', fr: 'Une photo qui glisse d’entre des pages', en: 'A photo slid out from between pages', quandFr: 'Un souvenir, un fantôme du Cimetière', quandEn: 'A memory, a ghost from the Cemetery' },
      { fichier: 'moment-resultat-bon', fr: 'Un rabat refermé, tapoté deux fois. Surtout pas une fanfare', en: 'A flap shut, patted twice. Certainly not a fanfare', quandFr: 'Un événement tourne bien', quandEn: 'An event goes well' },
    ],
  },
  {
    id: 'interface',
    titreFr: "L'interface", titreEn: 'The interface',
    regleFr: 'Elle doit disparaître : que du carton manipulé. Et surtout pas le même son pour toucher une action et pour changer d’onglet.',
    regleEn: 'It must disappear: handled cardboard, nothing else. And never the same sound for an action and for a tab.',
    sons: [
      { fichier: 'geste-clic', prises: 3, fr: 'Un ongle qui fait claquer une cannelure de carton', en: 'A fingernail clicking a cardboard flute', quandFr: 'Toucher une action. Le son le plus entendu du jeu', quandEn: 'Tapping an action. The most heard sound in the game' },
      { fichier: 'geste-retour', fr: 'Une carte reposée sur la pile. Plus grave que le clic', en: 'A card dropped back on the stack. Lower than the click', quandFr: 'Retour, fermer', quandEn: 'Back, close' },
      { fichier: 'geste-onglet', prises: 3, fr: 'Un intercalaire chassé de l’ongle', en: 'A paper tab flicked with a nail', quandFr: 'Changer d’onglet', quandEn: 'Switching tabs' },
      { fichier: 'geste-reglage', fr: 'Un interrupteur à bascule', en: 'A toggle switch', quandFr: 'Basculer un réglage', quandEn: 'Flipping a setting' },
      { fichier: 'geste-carte', prises: 3, fr: 'Une carte qui glisse sur une table et s’arrête', en: 'A card sliding across a table and stopping', quandFr: 'Changement d’écran', quandEn: 'Changing screen' },
      { fichier: 'geste-succes', fr: 'Une agrafeuse. Un coup, net, et c’est tout', en: 'A stapler. One hit, clean, and done', quandFr: 'Succès débloqué', quandEn: 'Achievement unlocked' },
    ],
  },
  {
    id: 'jauges',
    titreFr: 'Les jauges', titreEn: 'The gauges',
    regleFr: 'Le jeu demande d’en surveiller six et n’en signalait aucune à l’oreille. L’alerte ne doit sonner qu’au franchissement — jamais en boucle, sinon c’est une alarme, et une alarme on la coupe.',
    regleEn: 'The game asks you to watch six and signalled none of them. The alert must sound only on crossing — never on a loop, or it becomes an alarm, and alarms get muted.',
    sons: [
      { fichier: 'jauge-rouge', fr: 'Un élastique tendu jusqu’à ce qu’il grince', en: 'A rubber band stretched until it creaks', quandFr: 'Une jauge passe sous 25', quandEn: 'A gauge drops below 25', aVerifier: true },
      { fichier: 'jauge-remplie', fr: 'Une longue gorgée, la bouteille qui se regonfle', en: 'A long gulp, the bottle popping back', quandFr: 'Manger, boire, se soigner', quandEn: 'Eating, drinking, healing', aVerifier: true },
    ],
  },
];

/** Le nombre de sons du catalogue, variantes comprises. */
export function compterFichiers(): number {
  return CATALOGUE_SONS.reduce((t, f) => t + f.sons.reduce((s, x) => s + (x.prises ?? 1), 0), 0);
}
