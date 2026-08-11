/*
 * LE CULOT — marchander un prix.
 *
 * Modèle : Ace Attorney, pas SteamWorld Dig. La Récup' est déjà un jeu de
 * « jusqu'où je pousse ma chance » ; en refaire un ici donnerait deux fois le
 * même squelette. Le marchandage n'est pas une affaire d'adresse du pouce,
 * c'est une affaire de culot et de lecture. D'où deux verbes, et deux
 * seulement :
 *
 *   INSISTER   — gratuit, illimité tant qu'il reste de la patience. Ça grignote
 *                le prix s'il reste de la marge, et surtout ça RENSEIGNE : la
 *                réplique du commerçant dit s'il peut encore descendre.
 *   UN ARGUMENT — ça engage quelque chose de vrai (un objet du sac, votre
 *                réputation, la pluie dehors, votre fierté). Bien placé, le prix
 *                s'effondre. Mal placé, il se braque et vous coûte cher.
 *
 * La ressource dépensée n'est pas de l'argent, c'est la patience d'en face. Et
 * la patience se lit sur un visage, pas sur un compteur — sauf si le
 * personnage a le nez creux (voir `haggleMods`).
 *
 * Trois règles de conception :
 *   1. Chaque argument s'appuie sur un fait que le joueur voit déjà à l'écran
 *      (la météo, son respect, son sac). On ne devine pas, on observe.
 *   2. Chaque commerçant a son seuil, sa patience et son TIC — la phrase qu'il
 *      sort quand on a touché son plancher. On apprend des gens, pas des
 *      chiffres.
 *   3. Casser la négociation ne coûte pas d'argent : il ne vous sert plus de la
 *      journée. Une porte qui se ferme, pas une amende (leçon d'Hotel Dusk).
 */
import type { Character, InventoryItem, WeatherType } from '../types';
import { hasTrait } from './world';
import { randomFromArray } from './util';

// ---- Les commerçants ------------------------------------------------------

export interface Shopkeeper {
  /** Identifiant de la boutique (voir SHOPS). */
  shopId: string;
  /** Comment il appelle son métier, à l'affichage. */
  role: string;
  /** Plancher : fraction du prix affiché en dessous de laquelle il ne descend
   *  jamais. 0.55 = il lâche 45 % au maximum. */
  floor: number;
  /** Patience de départ, en points. Chaque insistance en croque. */
  patience: number;
  /** Ce qu'une insistance coûte de patience. */
  insistCost: number;
  /** Ce qu'une insistance fait gagner, en fraction de la marge restante. */
  insistBite: number;
  /** Arguments auxquels il est particulièrement sensible (effet renforcé). */
  soft: string[];
  /** Arguments qui le hérissent (effet inversé, quoi qu'il arrive). */
  hard: string[];
  /** Sa phrase quand on insiste et qu'il reste de la marge. */
  grumble: string[];
  /** Son TIC : la phrase du plancher. L'entendre, c'est savoir qu'il faut
   *  serrer la main ou sortir un argument. */
  tell: string;
  /** Ce qu'il dit en claquant la porte. */
  snap: string;
  /** Ce qu'il dit en topant. */
  deal: string;
  /** Le motif affiché sur le rideau baissé, quand on l'a poussé à bout. Il
   *  doit dire QUE c'est le marchandage qui a mis le feu aux poudres : sinon
   *  le joueur retrouve une boutique fermée sans faire le lien. */
  closure: [fr: string, en: string];
}

export const SHOPKEEPERS: Shopkeeper[] = [
  {
    shopId: 'boulangerie', role: 'La boulangère', floor: 0.62, patience: 112, insistCost: 18, insistBite: 0.17,
    soft: ['meteo', 'service'], hard: ['reputation'],
    grumble: ['« Bon… allez. Mais c\'est bien parce que c\'est vous. »', '« Vous savez que je vends à perte, là ? »', '« Ma marge, elle est où, dans cette histoire ? »'],
    tell: '« Là je ne peux plus. La farine, elle ne se donne pas non plus. »',
    snap: '« Écoutez, revenez demain. Là, j\'ai du monde. »',
    deal: '« Tenez. Et mangez-le, ne le revendez pas. »',
    closure: ['vous avez tellement discuté le prix d\'un sandwich que la boulangère a mis la pancarte « FERMÉ » en vous regardant dans les yeux.',
      'you haggled so hard over a sandwich that the baker flipped the CLOSED sign while looking you in the eye.'],
  },
  {
    shopId: 'epicerie', role: "L'épicier de nuit", floor: 0.7, patience: 88, insistCost: 20, insistBite: 0.15,
    soft: ['objet'], hard: ['fierte'],
    grumble: ['« C\'est ouvert la nuit, ça se paie, la nuit. »', '« Vous avez vu l\'heure ? Moi non plus. »', '« Un euro. Un. Et on n\'en parle plus. »'],
    tell: '« Non. À ce prix-là j\'éteins et je rentre chez moi. »',
    snap: '« Bon. La caisse est fermée pour vous aujourd\'hui. »',
    deal: '« Marché conclu. Et refermez la porte en sortant. »',
    closure: ['vous avez marchandé jusqu\'à ce que l\'épicier éteigne l\'enseigne. Il a dit que ça lui coûtait moins cher que de vous écouter.',
      'you haggled until the grocer killed the neon sign. He said it was cheaper than listening to you.'],
  },
  {
    shopId: 'pharmacie', role: 'Le pharmacien', floor: 0.58, patience: 132, insistCost: 15, insistBite: 0.16,
    soft: ['fierte', 'meteo'], hard: ['objet'],
    grumble: ['« La santé n\'a pas de prix, mais elle a un coût. »', '« Je peux faire un geste. Un petit. »', '« Vous toussez depuis tout à l\'heure, d\'ailleurs. »'],
    tell: '« En dessous, c\'est moi qui rembourse la Sécu. »',
    snap: '« Je préfère qu\'on en reste là. Prenez soin de vous. »',
    deal: '« Voilà. Et buvez de l\'eau avec, hein. »',
    closure: ['le pharmacien a fini par vous tendre un verre d\'eau et vous montrer la porte. Il paraît que vous parliez très fort du prix du sirop.',
      'the pharmacist ended up handing you a glass of water and pointing at the door. Apparently you were quite loud about the price of cough syrup.'],
  },
  {
    shopId: 'marche-aux-puces', role: 'La brocanteuse de l\'étal', floor: 0.5, patience: 104, insistCost: 16, insistBite: 0.19,
    soft: ['objet', 'reputation'], hard: [],
    grumble: ['« Vous marchandez ? Enfin quelqu\'un de sérieux. »', '« Allez, je descends. Mais vous êtes dur. »', '« Ça vaut trois fois ça et vous le savez. »'],
    tell: '« Là non. En dessous je perds de l\'argent à vous le vendre. »',
    snap: '« Circulez. J\'ai d\'autres clients, moi. »',
    deal: '« Adjugé. Vous m\'aurez bien eue. »',
    closure: ['la brocanteuse a replié son étal plutôt que de vous entendre proposer un prix de plus. Les autres vendeurs ont applaudi.',
      'the stallholder packed up rather than hear you name one more price. The other sellers applauded.'],
  },
  {
    shopId: 'brocanteur', role: 'Le brocanteur louche', floor: 0.45, patience: 70, insistCost: 24, insistBite: 0.2,
    soft: ['objet'], hard: ['reputation', 'meteo'],
    grumble: ['« Hé. On se calme. »', '« T\'as de la chance que je t\'aime bien. »', '« Encore un mot et je remonte. »'],
    tell: '« Non. Celui-là, c\'est ce prix ou rien. Pas de question. »',
    snap: '« Dehors. Et t\'as rien vu ici. »',
    deal: '« Prends et disparais. On s\'est jamais parlé. »',
    closure: ['le brocanteur a baissé le rideau au milieu de votre phrase. On ne marchande pas deux fois avec lui le même jour.',
      'the dealer rolled the shutters down mid-sentence. You don\'t haggle with him twice in one day.'],
  },
  {
    shopId: 'kebab', role: 'Le kebabier', floor: 0.6, patience: 122, insistCost: 14, insistBite: 0.18,
    soft: ['service', 'reputation'], hard: [],
    grumble: ['« Ouais, ouais, ouais. Je t\'ajoute des frites, ça va ? »', '« Toi tu reviens souvent, c\'est pour ça. »', '« Bon. Mais tu dis à personne. »'],
    tell: '« Là c\'est la viande qui coûte, mon frère. Je peux rien. »',
    snap: '« Va manger ailleurs aujourd\'hui. Sans rancune. »',
    deal: '« Tiens. Et mets de la sauce, ça fait pas de mal. »',
    closure: ['vous avez négocié le kebab si longtemps que la broche a refroidi. Le patron vous a gentiment mis dehors.',
      'you haggled over the kebab so long the skewer went cold. The owner politely showed you out.'],
  },
  {
    shopId: 'laverie', role: 'La gérante de la laverie', floor: 0.66, patience: 108, insistCost: 17, insistBite: 0.16,
    soft: ['fierte', 'service'], hard: [],
    grumble: ['« La machine, elle consomme pareil pour tout le monde. »', '« Allez, je vous mets le programme court. »', '« Vous me faites de la peine, mais quand même. »'],
    tell: '« En dessous, c\'est l\'électricité que je paie de ma poche. »',
    snap: '« Revenez demain, là je ferme les machines. »',
    deal: '« Allez-y. Et prenez le tambour du fond, il chauffe mieux. »',
    closure: ['la gérante a coupé les machines. Elle dit qu\'un lavage se paie, et qu\'elle n\'a pas que ça à faire.',
      'the manager shut the machines off. She says a wash costs what it costs, and she has other things to do.'],
  },
  {
    shopId: 'herboriste', role: "L'herboriste", floor: 0.56, patience: 144, insistCost: 12, insistBite: 0.14,
    soft: ['meteo', 'fierte', 'pigeon'], hard: ['objet'],
    grumble: ['« L\'argent circule, comme la sève. »', '« Je sens que vous en avez besoin. »', '« Prenons le temps. Rien ne presse. »'],
    tell: '« Non. La plante a mis six mois à pousser, elle vaut ça. »',
    snap: '« Je crois qu\'il vaut mieux se quitter là. Respirez. »',
    deal: '« Emportez-la. Elle vous attendait, je crois. »',
    closure: ['l\'herboriste a fermé les yeux, respiré très lentement, puis fermé la boutique. Votre marchandage avait « troublé l\'équilibre ».',
      'the herbalist closed her eyes, breathed very slowly, then closed the shop. Your haggling had \'disturbed the balance\'.'],
  },
];

export function shopkeeperFor(shopId: string): Shopkeeper | null {
  return SHOPKEEPERS.find(s => s.shopId === shopId) || null;
}

/** Drapeau « déjà marchandé ici aujourd'hui ». On ne recommence pas jusqu'à
 *  tomber sur une bonne série : une tentative par jour et par boutique. */
export const HAGGLED_FLAG = (shopId: string, day: number) => `haggle-${shopId}-${day}`;

/** Les boutiques sans humain derrière : on ne marchande pas avec une machine
 *  ni avec une fontaine. C'est une caractérisation, pas un oubli. */
export const NO_HAGGLE: Record<string, string> = {
  distributeur: 'On ne marchande pas avec un distributeur. On le secoue, et encore.',
  fontaine: "L'eau est déjà gratuite. Difficile de faire baisser ce prix-là.",
};

/** Réouverture après une brouille de marchandage. `absurdReopen` ne convient
 *  pas ici : il raconte une panne réparée (« vous rallumez le four »), alors
 *  qu'il n'y a rien à réparer — juste quelqu'un à qui reparler. */
const HAGGLE_REOPEN: Array<[string, string]> = [
  ['Vous revenez la tête basse et vous payez le prix affiché sans un mot. Le rideau se relève.',
   'You come back sheepish and pay the asking price without a word. The shutters roll up.'],
  ['Vous présentez des excuses maladroites mais sincères. On vous refait une place.',
   'You offer clumsy but honest apologies. Room is made for you again.'],
  ['Un client témoigne que vous n\'êtes « pas si pénible que ça ». Le patron soupire et rouvre.',
   'A customer testifies you\'re "not that bad really". The owner sighs and reopens.'],
  ['Vous ne dites rien du tout, cette fois. C\'est exactement ce qu\'il fallait faire.',
   'You say nothing at all this time. That was exactly the right move.'],
];

export function haggleReopen(): { fr: string; en: string } {
  const [fr, en] = randomFromArray(HAGGLE_REOPEN);
  return { fr, en };
}

// ---- Les arguments --------------------------------------------------------

export type ArgumentId = 'objet' | 'reputation' | 'meteo' | 'fierte' | 'pigeon' | 'service';

export interface HaggleArgument {
  id: ArgumentId;
  label: string;
  emoji: string;
  /** Ce qu'on dit au commerçant. */
  line: string;
  /** Ce que ça coûte, décrit au joueur avant de cliquer. */
  cost: string;
  /** Part de la remise encore possible que ça emporte si ça touche. */
  bite: number;
  /** Patience perdue si ça tombe à plat. Un argument raté coûte bien plus
   *  qu'une insistance : on a montré son jeu pour rien. */
  backfire: number;
}

export const ARGUMENTS: Record<ArgumentId, HaggleArgument> = {
  objet: {
    id: 'objet', label: 'Troquer un objet', emoji: '🎒',
    line: '« Et si je vous laisse ça en plus ? »',
    cost: "vous perdez l'objet",
    bite: 0.42, backfire: 28,
  },
  reputation: {
    id: 'reputation', label: 'Votre réputation', emoji: '⭐',
    line: '« Tout le monde me connaît, dans le quartier. »',
    cost: 'ridicule si personne ne vous connaît',
    bite: 0.36, backfire: 36,
  },
  meteo: {
    id: 'meteo', label: 'Le temps qu\'il fait', emoji: '🌧️',
    line: '« Vous n\'allez pas me laisser repartir là-dedans. »',
    cost: 'ne marche pas par beau temps',
    bite: 0.32, backfire: 26,
  },
  fierte: {
    id: 'fierte', label: 'Ravaler sa fierté', emoji: '👑',
    line: '« S\'il vous plaît. Vraiment. »',
    cost: 'coûte de la dignité',
    bite: 0.4, backfire: 14,
  },
  pigeon: {
    id: 'pigeon', label: 'Le pigeon sur l\'épaule', emoji: '🐦',
    line: 'Un pigeon se pose sur le comptoir et incline la tête.',
    cost: 'aucun — mais on ne peut pas le rappeler',
    bite: 0.34, backfire: 10,
  },
  service: {
    id: 'service', label: 'Proposer un service', emoji: '🧹',
    line: '« Je vous sors vos cartons, si vous voulez. »',
    cost: 'fatigue',
    bite: 0.34, backfire: 20,
  },
};

// ---- Réglage --------------------------------------------------------------

export const HAGGLE_TUNING = {
  /** Prix minimal absolu : on ne descend jamais en dessous. */
  minPrice: 1,
  /** Ce qu'un argument coûte de patience, avant multiplicateur. */
  argCost: 20,
  /** Rampe : ce qu'il a déjà lâché renchérit la suite (voir costMultiplier). */
  ramp: 1.6,
  /** Vitesse d'extinction de l'insistance. */
  insistDecay: 1.5,
  /** Gain en dessous duquel « il ne bouge plus ». */
  deadGain: 0.012,
  /** Échelle fixe de la barre de remise à l'écran. Volontairement décorrélée
   *  du plancher du commerçant : la barre montre ce qu'on a arraché, pas ce
   *  qu'il reste à arracher. Rien ne doit souffler au joueur « encore un
   *  effort, il va lâcher ». */
  barScale: 0.5,
  /** Bonus quand l'argument touche la corde sensible du commerçant. */
  softBoost: 1.3,
  /** Dignité dépensée par « Ravaler sa fierté ». */
  fierteCost: 6,
  /** Sommeil dépensé par « Proposer un service ». */
  serviceCost: 8,
  /** Respect en dessous duquel l'argument « réputation » se retourne. */
  reputationNeeded: 25,
  /** Météos où l'argument « le temps qu'il fait » porte. */
  wetWeather: ['rainy', 'storm', 'snow', 'fog'] as WeatherType[],
  /** Valeur minimale d'un objet du sac pour qu'il fasse un troc crédible. */
  tradeMinValue: 3,
  /** Ce qu'on gagne en respect quand on décroche une vraie affaire. */
  respectOnGoodDeal: 1,
  /** Remise à partir de laquelle l'affaire compte comme « vraie ». */
  goodDealCut: 0.3,
  /** En dessous de ce prix, il n'y a rien à négocier et on le dit. On ne
   *  marchande pas un pain rassis à 1 €. */
  minToHaggle: 3,
  /** Patience coûtée par une insistance qui ne fait plus rien bouger : il
   *  hausse les épaules, ça n'use pas autant que d'être poussé. */
  deadInsistMul: 0.45,
} as const;

// ---- Ce que le caractère change au comptoir -------------------------------
//
// Même règle que pour la fouille et la manche : l'effet doit découler du trait,
// jamais être collé dessus. Le charismatique fait durer la conversation ;
// l'haleine redoutable la raccourcit — mais donne envie de céder pour qu'il
// s'en aille ; le nez creux LIT la patience au lieu de la deviner ; celui qui
// ne craint pas le froid ne peut pas jouer les transis sous la pluie ;
// l'ancien comptable sait ce que vaut une marge.

export interface HaggleMods {
  /** Multiplie la patience de départ du commerçant. */
  patienceMul: number;
  /** Multiplie ce qu'une insistance grignote. */
  bindMul: number;
  /** Multiplie l'effet des arguments. */
  argMul: number;
  /** Affiche la jauge de patience chiffrée au lieu du seul visage. */
  readsPatience: boolean;
  /** Le plancher du commerçant descend d'autant (il lâche plus). */
  floorDrop: number;
  /** L'argument « pigeon » est disponible. */
  hasPigeon: boolean;
  /** L'argument « météo » est grillé (on voit bien qu'il ne craint rien). */
  weatherDead: boolean;
  /** Le prix de départ est majoré : il vous sent venir. */
  startPenalty: number;
}

export function haggleMods(c: Character): HaggleMods {
  const comptable = c.job.id === 'comptable';
  return {
    // On aime lui parler : il vous laisse insister plus longtemps.
    // L'haleine, elle, écourte l'entretien.
    patienceMul: (hasTrait(c, 'charismatique') ? 1.3 : 1) * (hasTrait(c, 'haleine') ? 0.7 : 1),
    // L'ancien comptable sait exactement où est la marge, et il tape dedans.
    bindMul: comptable ? 1.3 : 1,
    // Charisme : les arguments portent. Haleine : il cède pour qu'on parte.
    argMul: (hasTrait(c, 'charismatique') ? 1.2 : 1) * (hasTrait(c, 'haleine') ? 1.15 : 1),
    // Flairer l'humeur des gens, c'est le même nez que pour flairer les coups.
    readsPatience: hasTrait(c, 'nez-sensible') || hasTrait(c, 'paranoiaque'),
    // Qui connaît le quartier connaît les commerçants — et leurs vrais prix.
    floorDrop: hasTrait(c, 'orientation') ? 0.06 : 0,
    hasPigeon: hasTrait(c, 'ami-pigeons'),
    // Difficile de jouer les transis quand on dort dehors sans couverture.
    weatherDead: hasTrait(c, 'resistant-froid'),
    // Le poissard tombe toujours sur le jour où « les prix ont augmenté ».
    startPenalty: hasTrait(c, 'poissard') ? 0.12 : 0,
  };
}

// ---- Résolution -----------------------------------------------------------

/** L'objet du sac qu'on proposerait au troc : le moins précieux qui vaille
 *  encore quelque chose. On ne brade pas son manteau pour un croissant. */
export function tradeCandidate(c: Character): InventoryItem | null {
  const usable = c.inventory.filter(i => (i.value || 0) >= HAGGLE_TUNING.tradeMinValue);
  if (!usable.length) return null;
  return usable.reduce((a, b) => ((a.value || 0) <= (b.value || 0) ? a : b));
}

/** Les arguments disponibles pour cette négociation, dans l'ordre d'affichage. */
export function availableArguments(c: Character, weather: WeatherType, mods: HaggleMods): ArgumentId[] {
  const list: ArgumentId[] = [];
  if (tradeCandidate(c)) list.push('objet');
  list.push('reputation');
  if (!mods.weatherDead) list.push('meteo');
  list.push('fierte');
  if (mods.hasPigeon) list.push('pigeon');
  if (c.stats.sleep > HAGGLE_TUNING.serviceCost + 5) list.push('service');
  return list;
}

/** Un argument porte-t-il ? La condition est toujours quelque chose que le
 *  joueur a sous les yeux — sa météo, son respect, son sac. */
export function argumentLands(id: ArgumentId, c: Character, weather: WeatherType, k: Shopkeeper): boolean {
  if (k.hard.includes(id)) return false;
  switch (id) {
    case 'reputation': return c.respect >= HAGGLE_TUNING.reputationNeeded;
    case 'meteo': return (HAGGLE_TUNING.wetWeather as readonly WeatherType[]).includes(weather);
    case 'objet': return !!tradeCandidate(c);
    // Ravaler sa fierté marche toujours. C'est bien le problème.
    case 'fierte': return true;
    case 'pigeon': return true;
    case 'service': return c.stats.sleep > HAGGLE_TUNING.serviceCost + 5;
  }
}

/** Patience de départ, caractère et commerçant pris en compte. */
export function startingPatience(k: Shopkeeper, mods: HaggleMods): number {
  return Math.round(k.patience * mods.patienceMul);
}

/** Prix affiché au début de la négociation (le poissard paie son malheur). */
export function openingPrice(marketFinal: number, mods: HaggleMods): number {
  return Math.max(HAGGLE_TUNING.minPrice, Math.round(marketFinal * (1 + mods.startPenalty)));
}

/*
 * Le calcul de la remise, et pourquoi il est fait comme ça.
 *
 * Première tentative : faire baisser le prix en euros, coup par coup. Ça ne
 * marche pas. Les prix du jeu sont de petits entiers (5 à 12 €) et le plancher
 * est à ~55 % : la marge fait deux à cinq pas entiers. Le simulateur a montré
 * un jeu à cinq états, sans texture — trois profils de joueur très différents
 * obtenaient exactement le même résultat.
 *
 * D'où le modèle retenu : on ne négocie pas des euros, on négocie une REMISE
 * continue. L'euro ne s'arrondit qu'à la poignée de main. Le joueur voit les
 * deux (« −24 % · 4 € »), et chaque coup fait bouger quelque chose à l'écran,
 * même quand l'euro ne bouge pas encore.
 *
 * Deuxième correction : insister était trop rentable. À lui seul il atteignait
 * 25 % sur 45 % possibles, ce qui rendait les arguments décoratifs. Insister
 * plafonne maintenant vers 11 % et s'éteint au troisième coup — le commerçant
 * le dit, et c'est le signal qu'il faut sortir autre chose.
 *
 * Troisième règle : plus il a déjà lâché, plus le coup suivant lui coûte cher.
 * C'est là qu'est la tension. Au début il cède, à la fin il se braque.
 */

/** Ce qu'une insistance ajoute à la remise, après `n` insistances déjà faites
 *  sans argument neuf. Il se lasse d'entendre la même chose. */
export function insistGain(k: Shopkeeper, cut: number, maxCut: number, n: number): number {
  const room = Math.max(0, maxCut - cut);
  return room * k.insistBite / (1 + HAGGLE_TUNING.insistDecay * n);
}

/** Ce qu'un argument qui porte ajoute à la remise. */
export function argumentGain(a: HaggleArgument, k: Shopkeeper, cut: number, maxCut: number, mods: HaggleMods): number {
  const room = Math.max(0, maxCut - cut);
  return room * a.bite * (k.soft.includes(a.id) ? HAGGLE_TUNING.softBoost : 1) * mods.argMul;
}

/** En dessous de ce gain, le commerçant « ne bouge plus » : on l'affiche, et ça
 *  ne coûte presque rien — pas de coup qui prend de la patience pour zéro. */
export function moves(gain: number): boolean {
  return gain > HAGGLE_TUNING.deadGain;
}

/** Multiplicateur de coût : ce qu'il a déjà lâché rend la suite plus chère. */
export function costMultiplier(cut: number, maxCut: number): number {
  return 1 + HAGGLE_TUNING.ramp * (maxCut > 0 ? cut / maxCut : 0);
}

/** Remise maximale que ce commerçant peut consentir. */
export function maxCutFor(k: Shopkeeper, mods: HaggleMods): number {
  return Math.min(0.7, 1 - Math.max(0.3, k.floor - mods.floorDrop));
}

/** Le prix à payer pour une remise donnée. C'est le SEUL arrondi de toute la
 *  négociation, et il tombe à la poignée de main. */
export function priceFor(asking: number, cut: number): number {
  return Math.max(HAGGLE_TUNING.minPrice, Math.round(asking * (1 - cut)));
}

/** Une réplique d'insistance, tirée au sort. */
export function grumbleLine(k: Shopkeeper): string {
  return randomFromArray(k.grumble);
}

/** Le visage du commerçant, en fonction de ce qui lui reste de patience. */
export function keeperMood(patience: number, max: number): { emoji: string; label: string } {
  const r = max > 0 ? patience / max : 0;
  if (r > 0.75) return { emoji: '🙂', label: 'vous écoute volontiers' };
  if (r > 0.5) return { emoji: '😐', label: 'trouve le temps long' };
  if (r > 0.28) return { emoji: '😒', label: 'souffle par le nez' };
  if (r > 0.12) return { emoji: '😠', label: 'regarde la porte' };
  return { emoji: '🤬', label: 'la main sur le rideau' };
}

