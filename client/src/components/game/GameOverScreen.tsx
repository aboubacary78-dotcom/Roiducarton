import { useGame, computeScore, hasTrait, poissardMerite, loadHighScores, knownEnemyNames } from '@/contexts/GameContext';
import type { InventoryItem } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { bonusEn, bonusFr, partieTerminee, showInterstitial, showRewarded } from '@/lib/ads';
import PlayerFace from './PlayerFace';
import KenBurnsImage from './KenBurnsImage';
import { useLang, tr, tc } from '@/lib/lang';
import { DEATH_DEFS, recordDeath, setLegacy, clearLegacy, setCrown, loadDeathBook, enemyDeathImages } from '@/lib/necrology';
import { STREET_TITLES } from '@/contexts/data/progression';
import { pushToast } from '@/lib/toast';
import { playBack, playBequeath, playCard, playDeath, playFind, playNewEnding, resetGaugeAlerts } from '@/lib/sound';
import { reinitialiserPiques } from '@/contexts/data/piques';
import { haptic } from '@/lib/haptics';
import { rememberSuccessor } from '@/lib/notifications';
import { worthSharing, shareRewardAvailable, markShareRewarded, shareFrontPage } from '@/lib/partage';
import { addKarma } from '@/lib/necrology';

/*
 * L'écran de fin est une « une de journal » : la mort du personnage devient
 * un fait divers avec gros titre, photo, nécrologie, et surtout la récolte
 * méta : fins découvertes (Registre des Morts), Karma de Rue gagné, et les
 * Dernières Volontés (l'objet légué au prochain personnage).
 */

/*
 * LE « PRESQUE ».
 *
 * Un écran de fin qui ne montre que ce qui a été obtenu se referme. On cherche
 * donc, parmi tout ce qui progresse, ce dont le joueur s'est le plus approché
 * SANS l'atteindre, et on le lui dit. Rien n'est fabriqué : on ne retient que
 * des écarts réels, et on garde le plus petit.
 */
function nearestMiss(day: number, bestDay: number, found: number, total: number): { fr: string; en: string } | null {
  const candidates: { gap: number; fr: string; en: string }[] = [];

  // Le prochain titre de rue.
  const nextTitle = STREET_TITLES.find(t => t.day > day);
  if (nextTitle) {
    const d = nextTitle.day - day;
    candidates.push({
      gap: d,
      fr: `Il vous manquait ${d} jour${d > 1 ? 's' : ''} pour devenir ${nextTitle.fr}.`,
      en: `You were ${d} day${d > 1 ? 's' : ''} short of becoming ${nextTitle.en}.`,
    });
  }

  // Le record personnel, tant qu'il n'est pas battu.
  if (bestDay > day) {
    const d = bestDay - day;
    candidates.push({
      gap: d,
      fr: `Il vous manquait ${d} jour${d > 1 ? 's' : ''} pour battre votre record.`,
      en: `You were ${d} day${d > 1 ? 's' : ''} short of your own record.`,
    });
  }

  // Le Registre : la fin suivante, ou la complétion s'il n'en manque qu'une.
  if (found < total) {
    const reste = total - found;
    candidates.push({
      gap: 1,
      fr: reste === 1
        ? 'Il ne vous manque qu\'une fin pour compléter le Registre.'
        : `Encore une fin et vous serez à ${found + 1} sur ${total}.`,
      en: reste === 1
        ? 'You are one ending from completing the Book.'
        : `One more ending puts you at ${found + 1} of ${total}.`,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.gap - b.gap);
  return candidates[0];
}

// Gros titre selon la catégorie de mort (l'ennemi a le sien, voir plus bas).
/*
 * Gros titres des FINS PARTICULIÈRES. Ils priment sur ceux de la cause, comme
 * l'image : le titre et la photo doivent raconter la même mort.
 */
const SPECIAL_HEADLINES: Record<string, { fr: string; en: string }> = {
  // Tournures sans pronom ni participe accordé : le personnage peut être de
  // n'importe quel genre, et une une de journal se passe très bien de sujet.
  'doyen': { fr: 'FIN DE RÈGNE SUR LE TROTTOIR', en: 'END OF A REIGN ON THE PAVEMENT' },
  'jour-1': { fr: 'VINGT-QUATRE HEURES, PAS UNE DE PLUS', en: 'TWENTY-FOUR HOURS, NOT ONE MORE' },
  'canicule': { fr: 'LE BITUME A GAGNÉ CE JOUR-LÀ', en: 'THE ASPHALT WON THAT DAY' },
  'riche': { fr: 'DE L\'ARGENT PLEIN LES POCHES, ET RIEN À FAIRE', en: 'POCKETS FULL OF MONEY, AND NOTHING IT COULD DO' },
};

/*
 * LES PHOTOS DONT LE SUJET EST EN BAS DU CADRE.
 *
 * La une découpe un bandeau dans une image en 3:2 : elle n'en montre que la
 * bande centrale, soit 40 % de la hauteur jetée. Toutes les photos de mort ont
 * leur sujet au milieu et traversent ce recadrage sans rien perdre.
 *
 * `death-dette` non. Son sujet — une chaussure abandonnée et une pièce par
 * terre, les deux seuls objets qui racontent quelque chose — est posé au sol,
 * donc dans le bas de l'image. Recadrée au centre, la une ne montrait qu'un
 * trottoir vide : la chaussure coupée en deux au bord inférieur, la pièce hors
 * champ. Une photo magnifique qui ne disait plus rien à l'endroit précis où
 * elle sert.
 *
 * La commande demandait pourtant de garder les 20 % du haut et du bas
 * dégagés ; c'est la photo qui s'en écarte. La corriger ici coûte une ligne et
 * garde l'image telle qu'elle est — plutôt que de la faire refaire.
 */
const CADRAGE_BAS = new Set(['/assets/death-dette.webp']);

const HEADLINES: Record<string, { fr: string; en: string }> = {
  despair: { fr: 'IL AVAIT TOUT, SAUF LE MORAL', en: 'HE HAD EVERYTHING BUT HOPE' },
  hunger: { fr: 'MORT LE VENTRE VIDE DANS UNE VILLE PLEINE', en: 'STARVED IN A CITY FULL OF FOOD' },
  thirst: { fr: 'ASSOIFFÉ AU PAYS DES FONTAINES', en: 'PARCHED IN THE LAND OF FOUNTAINS' },
  exhaustion: { fr: 'IL VOULAIT JUSTE DORMIR UN PEU', en: 'HE JUST WANTED SOME SLEEP' },
  cold: { fr: 'LA NUIT LA PLUS FROIDE DE L\'ANNÉE', en: 'THE COLDEST NIGHT OF THE YEAR' },
  injury: { fr: 'TROP DE COUPS, PAS ASSEZ DE PANSEMENTS', en: 'TOO MANY BLOWS, TOO FEW BANDAGES' },
  // Une une de fait divers : personne n'a rien vu, tout le monde était là.
  dette: { fr: 'QUINZE EUROS, ET PERSONNE N\'A RIEN VU', en: 'FIFTEEN EUROS, AND NOBODY SAW A THING' },
};

export default function GameOverScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const [reviving, setReviving] = useState(false);
  const [deathImgTry, setDeathImgTry] = useState(0);
  const [legacyId, setLegacyId] = useState<string | null>(null);

  // Catégorie de mort → image (diorama) personnalisée. Repli sur le 💀 si le
  // fichier n'existe pas encore.
  /*
   * L'ÉTIQUETTE PRIME SUR LA DÉDUCTION.
   *
   * La catégorie se devine d'ordinaire dans les jauges du cadavre, et c'est
   * juste : un ventre à zéro raconte la faim. Mais mourir sous les coups du
   * prêteur laisse une santé à zéro, exactement comme une bagarre — la une
   * annonçait donc « trop de coups » et effaçait la seule mort du jeu que le
   * joueur ait signée lui-même. Quand le reducer sait de quoi on est mort, il
   * le dit, et on ne redevine rien.
   */
  const deathCat = state.deathKind ? state.deathKind
    : state.deathCause ? 'combat'
    : !char ? 'injury'
    : char.stats.mental <= 0 ? 'despair'
    : char.stats.hunger <= 8 ? 'hunger'
    : char.stats.thirst <= 8 ? 'thirst'
    : char.stats.sleep <= 8 ? 'exhaustion'
    : (state.weather === 'snow' || state.weather === 'storm') ? 'cold'
    : 'injury';
  // L'ennemi vainqueur, retrouvé dans la cause de mort (elle contient son nom).
  const killerEnemy = useMemo(() => {
    if (!state.deathCause) return null;
    return knownEnemyNames().find(n => state.deathCause!.includes(n) || state.deathCause!.includes(tc(n))) || null;
  }, [state.deathCause]);

  /*
   * L'IMAGE DE LA UNE : la fin PARTICULIÈRE avant la cause générique.
   *
   * Le jeu reconnaît quatre morts remarquables — le premier jour, riche, cuit
   * par la canicule, tombé après dix jours de règne. Elles sont bien plus
   * racontables que « votre corps a lâché », et elles ne s'affichaient pas :
   * la photo était choisie sur la seule cause. On descend maintenant la chaîne
   * fin particulière → cause → tampon, un cran par échec de chargement, ce qui
   * laisse aussi les nouvelles images s'activer une par une à la livraison.
   *
   * L'ordre suit la rareté : dix jours de règne raconte plus qu'une mort au
   * premier jour, qui raconte plus qu'un portefeuille bien garni.
   */
  /*
   * La fin particulière, s'il y en a une, dans l'ordre de la rareté. Elle sert
   * à LA FOIS l'image et le gros titre : les faire choisir séparément donnait
   * une une qui se contredisait — un enterrement d'État en photo sous un titre
   * parlant de coups reçus.
   */
  const specialEnding = !char ? null
    // Une mort étiquetée par le reducer sait déjà ce qu'elle raconte : la
    // circonstance ne doit pas venir la recouvrir. Mourir riche sous les coups
    // du prêteur, c'est encore la dette qui a tué.
    : state.deathKind ? null
    : char.day >= 10 ? 'doyen'
    : char.day <= 1 ? 'jour-1'
    : state.weather === 'heatwave' ? 'canicule'
    : char.money >= 30 ? 'riche'
    : null;

  const deathCandidates = useMemo(() => {
    const out: string[] = [];
    // L'adversaire d'abord quand il y en a un : le gros titre le nomme, et
    // l'image doit dire la même chose que le titre.
    if (killerEnemy) out.push(...enemyDeathImages(killerEnemy));
    if (specialEnding) out.push(`/assets/death-${specialEnding}.webp`);
    out.push(`/assets/death-${deathCat}.webp`);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char?.seed, specialEnding, deathCat, killerEnemy]);

  // Gros titre de la une (sert aussi d'épitaphe sur la tombe du Cimetière).
  const headline = killerEnemy
    ? tr(`${tc(killerEnemy).toUpperCase()} TERRASSE UN HOMME EN PLEINE RUE`, `${tc(killerEnemy).toUpperCase()} FELLS A MAN IN BROAD DAYLIGHT`)
    : specialEnding
      ? tr(SPECIAL_HEADLINES[specialEnding].fr, SPECIAL_HEADLINES[specialEnding].en)
      : deathCat === 'combat'
        ? tr('RIXE FATALE DANS LE QUARTIER', 'FATAL BRAWL IN THE NEIGHBORHOOD')
        // Repli sur « trop de coups » : une étiquette inconnue ne doit pas
        // faire tomber l'écran de fin, qui est le pire moment pour planter.
        : tr((HEADLINES[deathCat] ?? HEADLINES.injury).fr, (HEADLINES[deathCat] ?? HEADLINES.injury).en);

  // ---- Registre des Morts + Karma + tombe : enregistrés UNE fois par mort ----
  const harvest = useMemo(() => {
    if (!char) return null;
    const ids: string[] = [];
    if (killerEnemy) ids.push(`mort-ennemi-${killerEnemy}`);
    else if (deathCat !== 'combat') ids.push(`mort-${deathCat}`);
    if (char.day <= 1) ids.push('mort-jour-1');
    if (char.money >= 30) ids.push('mort-riche');
    if (state.weather === 'heatwave') ids.push('mort-canicule');
    if (char.day >= 10) ids.push('mort-doyen');
    // LA COURONNE SE TRANSMET : un personnage sacré Roi ne s'éteint pas, il
    // monte sur le trône et devient le boss des parties suivantes, jusqu'à ce
    // qu'un prochain personnage vienne le détrôner.
    if (char.crowned) {
      setCrown({
        name: char.name, seed: char.seed, gender: char.gender,
        jobName: char.job.name, jobEmoji: char.job.emoji,
        days: char.day, crownedAt: Date.now(), reigns: char.kingsBeaten ?? 1,
      });
    }
    return recordDeath({
      ids, name: char.name, day: char.day, respect: char.respect, seed: char.seed,
      grave: { name: char.name, seed: char.seed, gender: char.gender, day: char.day, jobEmoji: char.job.emoji, jobName: char.job.name, cause: headline, accessories: (char.equipped ?? {}) as Record<string, string> },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char?.seed]);

  // Le successeur est tiré AVANT le bilan : l'écran de fin ne clôt plus une
  // partie, il en ouvre une. Le joueur repart avec un nom en tête.
  useEffect(() => { dispatch({ type: 'PREPARE_SUCCESSOR' }); }, [dispatch]);
  const successor = state.characterChoices[0] ?? null;
  // Le nom du successeur est le meilleur texte de rappel dont on dispose :
  // « Marcel attend toujours son tour » ouvre une boucle que « Revenez
  // jouer ! » n'ouvre pas.
  useEffect(() => { if (successor) rememberSuccessor(successor.name); }, [successor]);

  // Pub interstitielle à l'arrivée sur l'écran de fin (entre deux parties).
  /*
   * Une partie de plus au compteur. Il sert à la période de grâce des trois
   * premières parties : c'est le nombre de parties FINIES qui compte, pas le
   * nombre de publicités vues.
   */
  useEffect(() => { partieTerminee(); }, []);
  // La résonance de fin : une seule fois, à l'ouverture de l'écran.
  useEffect(() => { playDeath(); }, []);

  const canRevive = !!char && !char.activeFlags.includes('revived');

  /*
   * LA SECONDE CHANCE SE PROPOSE AU PIC, PAS APRÈS LE BILAN.
   *
   * Une vidéo récompensée convertit bien mieux pour RESTAURER une perte que
   * pour offrir un gain. La perte est chaude à l'instant exact de la mort ;
   * dix secondes plus tard, le joueur a lu son récapitulatif, encaissé son
   * Karma et accepté sa fin — l'offre arrive alors sur quelqu'un qui a déjà
   * fait son deuil. L'offre passe donc devant tout le reste, une seule fois,
   * et se referme sans insister. Le bouton reste disponible plus bas pour qui
   * change d'avis.
   */
  const [peakOffer, setPeakOffer] = useState(true);

  /*
   * DIX SECONDES, ET UNE BARRE QUI SE VIDE.
   *
   * Une offre sans horloge est une offre qu'on remet à plus tard, et « plus
   * tard », sur un écran de mort, veut dire jamais. Le compte à rebours ne
   * ferme aucune porte — le bouton reste plus bas pour qui change d'avis —
   * mais il transforme une décision reportable en décision présente.
   *
   * Il s'arrête pendant le chargement de la vidéo : sinon l'offre s'évanouit
   * sous les doigts de celui qui vient de l'accepter.
   */
  const DUREE_OFFRE = 10;
  const [secondes, setSecondes] = useState(DUREE_OFFRE);
  useEffect(() => {
    if (!canRevive || !peakOffer || reviving) return;
    if (secondes <= 0) { setPeakOffer(false); return; }
    const t = setTimeout(() => setSecondes(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [canRevive, peakOffer, reviving, secondes]);

  /*
   * LE REFUS DEMANDE UN GESTE DE PLUS.
   *
   * Pas un piège : un seul appui supplémentaire, et le second bouton dit
   * exactement ce qu'il fait — laisser partir quelqu'un qui a un nom. Un refus
   * réflexe et un refus décidé ne se valent pas, et seul le second mérite
   * d'être exaucé du premier coup.
   */
  const [refusAmorce, setRefusAmorce] = useState(false);

  /*
   * On fouille les poches une par une plutôt que d'annoncer un total. Même
   * montant, révélation fractionnée : chaque poche est une décharge séparée,
   * et le joueur reste sur l'écran au lieu de lire un nombre et de partir.
   */
  const [pochesOuvertes, setPochesOuvertes] = useState(0);

  /*
   * LA UNE SE PARTAGE — mais pas à chaque mort.
   *
   * Un partage proposé systématiquement n'est plus proposé, il est subi : le
   * joueur apprend à ignorer le bouton. On ne l'affiche que sur les morts qui
   * valent le coup d'œil, et le Karma qui va avec n'est dû qu'une fois par
   * jour, sinon il suffirait de mourir en boucle pour le farmer.
   */
  const uneRef = useRef<HTMLDivElement | null>(null);
  const [partage, setPartage] = useState<'idle' | 'busy' | 'done'>('idle');

  async function partagerLaUne() {
    if (!uneRef.current || partage === 'busy') return;
    setPartage('busy');
    const ok = await shareFrontPage(
      uneRef.current,
      tr(`${char!.name} a tenu ${char!.day} jour${char!.day > 1 ? 's' : ''} dans la rue. Le Roi du Carton.`,
         `${char!.name} lasted ${char!.day} day${char!.day > 1 ? 's' : ''} on the street. Cardboard King.`),
    );
    if (!ok) { setPartage('idle'); return; }
    if (shareRewardAvailable()) {
      addKarma(15);
      markShareRewarded();
      pushToast(tr('Merci pour la publicité : +15 karma.', 'Thanks for the publicity: +15 karma.'), { emoji: '📰', tone: 'good' });
    }
    setPartage('done');
  }

  // La poche des fins est toujours la dernière : tant qu'elle n'est pas
  // ouverte, les cartes « nouvelle fin » restent cachées.
  const poches = harvest?.pockets ?? [];
  const indexFins = poches.findIndex(p => p.id === 'fins');
  const finsRevelees = indexFins === -1 || pochesOuvertes > indexFins;

  /*
   * Une fin inédite se tamponne : c'est le son de la collection qui avance, et
   * le seul moment franchement bon d'un écran de mort. Il attend que la
   * dernière poche soit ouverte — avant, l'encadré n'est pas à l'écran.
   *
   * Ce hook DOIT rester au-dessus du `if (!char) return null` qui suit. Placé
   * dessous, il disparaissait du rendu dès que le personnage passait à null —
   * c'est-à-dire au moment précis où l'on repart pour une nouvelle vie — et
   * React refusait de rendre un composant qui compte soudain un hook de moins
   * (erreur #300). Le jeu plantait après le choix du personnage suivant.
   */
  const finsInedites = harvest?.newIds?.length ?? 0;
  useEffect(() => {
    if (finsInedites > 0 && finsRevelees) playNewEnding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finsInedites, finsRevelees]);

  function ouvrirPoche() {
    if (pochesOuvertes >= poches.length) return;
    playFind();
    haptic(poches[pochesOuvertes].id === 'bonus' ? 'heavy' : 'medium');
    setPochesOuvertes(n => n + 1);
  }

  async function handleRevive() {
    playCard();
    if (reviving) return;
    setReviving(true);
    // Exempté du plafond de sollicitations : c'est le meilleur emplacement du
    // jeu, et il est déjà limité à une fois par partie.
    const rewarded = await showRewarded({ exempt: true });
    if (rewarded) {
      dispatch({ type: 'REVIVE' });
    } else {
      setReviving(false);
      setPeakOffer(false);
    }
  }

  // Le Sceptre du Roi ne se lègue pas : la couronne se mérite au combat, elle
  // ne se transmet pas dans un testament.
  function isBequeathable(item: InventoryItem) {
    return item.id !== 'sceptre-roi';
  }

  function chooseLegacy(item: InventoryItem) {
    if (!isBequeathable(item)) {
      pushToast(
        tr('Le Sceptre ne se lègue pas : il faut prouver sa valeur en reprenant la couronne.',
           "The Sceptre cannot be bequeathed: you must prove your worth by taking the crown."),
        { emoji: '👑', tone: 'bad' },
      );
      return;
    }
    if (!char) return;
    if (legacyId === item.id) { playBack(); setLegacyId(null); clearLegacy(); return; }
    playBequeath();
    setLegacyId(item.id);
    setLegacy(item, char.name);
  }

  if (!char) return null;

  function inferCause(): string {
    if (char!.stats.mental <= 0) {
      return tr('Votre esprit a lâché avant votre corps. La rue a fini par avoir votre moral.', 'Your mind gave out before your body. The street finally broke your spirit.');
    }
    if (char!.stats.hunger <= 8) return tr('Le ventre vide a eu le dernier mot. On ne survit pas longtemps à jeun.', 'An empty stomach had the last word. You don\'t last long unfed.');
    if (char!.stats.thirst <= 8) return tr('La soif a fini le travail. Trouver de l\'eau, ça compte plus qu\'on ne croit.', 'Thirst finished the job. Finding water matters more than you\'d think.');
    if (char!.stats.sleep <= 8) return tr('L\'épuisement vous a rattrapé. Le corps réclame son dû, toujours.', 'Exhaustion caught up with you. The body always claims its due.');
    if ((state.weather === 'snow' || state.weather === 'storm') && char!.stats.health <= 0) {
      return tr('Le froid a eu raison de vous cette nuit. La rue est glaciale avec ses rois.', 'The cold got you tonight. The street is icy to its kings.');
    }
    return tr('Votre corps a lâché. Trop de coups, pas assez de soins.', 'Your body gave out. Too many blows, not enough care.');
  }
  const deathCause = state.deathCause || inferCause();

  /*
   * CE QUI PART AVEC LUI.
   *
   * On ne liste que ce que la mort emporte réellement. Le Karma de Rue, le
   * Registre et la série quotidienne survivent au personnage : les faire
   * figurer ici serait un mensonge, et un joueur qui s'en aperçoit ne croit
   * plus rien de ce que l'écran lui dit. Restent les jours, l'argent, le sac
   * et le respect — et on tait les lignes à zéro, qui affaibliraient les
   * autres.
   */
  const nbObjets = char.inventory.length;
  const cequonPerd = [
    { cle: 'jours', emoji: '🗓️', valeur: tr(`${char.day} jour${char.day > 1 ? 's' : ''}`, `${char.day} day${char.day > 1 ? 's' : ''}`), garder: true },
    { cle: 'argent', emoji: '💰', valeur: `${char.money} €`, garder: char.money > 0 },
    { cle: 'objets', emoji: '🎒', valeur: tr(`${nbObjets} objet${nbObjets > 1 ? 's' : ''}`, `${nbObjets} item${nbObjets > 1 ? 's' : ''}`), garder: nbObjets > 0 },
    { cle: 'respect', emoji: '⭐', valeur: `${char.respect}`, garder: char.respect > 0 },
  ].filter(p => p.garder);

  const score = computeScore(char.day, char.respect, char.money, poissardMerite(char));
  const highScores = loadHighScores();

  // Ce dont il s'est le plus approché sans l'avoir : l'écran ne se referme
  // jamais sur un bilan seulement positif.
  // Le compteur du « presque » porte sur les FINS seules, comme le Registre et
  // l'écran-titre depuis la scission des collections. Il annonçait encore un
  // total de 36, ce qui ne correspondait plus à rien de ce que le joueur voit.
  const book = loadDeathBook();
  const miss = nearestMiss(
    char.day,
    highScores.length > 0 ? Math.max(...highScores.map(h => h.days)) : 0,
    DEATH_DEFS.filter(d => book[d.id]).length,
    DEATH_DEFS.length,
  );

  // Fiches des fins découvertes pour l'encadré « inédit ».
  const newCards = (harvest?.newIds || []).map(id => {
    const def = DEATH_DEFS.find(d => d.id === id);
    if (def) return { emoji: def.emoji, title: tr(def.title, def.titleEn) };
    const enemy = id.replace('mort-ennemi-', '');
    return { emoji: '⚔️', title: tr(`Vaincu par ${tc(enemy)}`, `Slain by ${tc(enemy)}`) };
  });


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 flex flex-col items-center gap-3"
      style={{ background: 'radial-gradient(95% 45% at 50% 0%, rgba(217,79,79,0.16), transparent 60%), linear-gradient(180deg, #3A2436 0%, #1C1322 100%)' }}
    >
      {/* ---- L'OFFRE AU PIC : avant le bilan, tant que la perte est chaude ---- */}
      <AnimatePresence>
        {canRevive && peakOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            /*
             * z-80, au-dessus du carton du matin (z-75), et ce n'est pas un
             * détail : le cadeau quotidien s'affichait par-dessus cette offre
             * et la faisait expirer sans que personne l'ait vue. Le carton
             * peut attendre dix secondes — l'offre, non.
             */
            className="fixed inset-0 z-[80] flex items-center justify-center p-5"
            style={{ background: 'rgba(12,8,14,0.975)', backdropFilter: 'blur(3px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-w-sm text-center"
            >
              <p className="text-4xl mb-3">🌅</p>
              <h2 className="text-xl font-bold text-[#F0D9C4] leading-tight mb-1.5">
                {tr('Pas tout de suite.', 'Not just yet.')}
              </h2>
              <p className="text-[13px] text-[#A08060] leading-snug mb-4">
                {tr(
                  `${char.name} est encore là, de justesse. Une âme charitable peut passer — mais une seule fois par partie.`,
                  `${char.name} is still here, barely. A kind soul may come by — but only once per game.`,
                )}
              </p>

              {/* Ce qui part avec lui. Une perte se refuse mal quand elle est
                  chiffrée ; « recommencer » ne dit rien, « 7 jours, 34 € et
                  5 objets » dit tout. */}
              <div className="mb-4">
                {/* On nomme la personne plutôt que d'écrire « lui » : le jeu
                    tire des personnages des deux genres, et un pronom faux se
                    remarque tout de suite. */}
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#6B5140] mb-1.5">{tr(`Ce qui part avec ${char.name}`, `What goes with ${char.name}`)}</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {cequonPerd.map(p => (
                    <span key={p.cle} className="text-[11px] font-mono font-semibold px-2 py-1 rounded-full bg-[#D94F4F]/12 text-[#E0917F]">
                      {p.emoji} {p.valeur}
                    </span>
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={reviving}
                onClick={handleRevive}
                className="w-full py-3.5 text-[15px] font-bold text-white rounded-xl disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #2E7D46, #246237)', boxShadow: '0 4px 18px rgba(74,155,95,0.35)' }}
              >
                {reviving ? tr('⏳ Chargement…', '⏳ Loading…') : tr(bonusFr('Se relever'), bonusEn('Get back up'))}
              </motion.button>

              {/* La barre du temps qui reste. Elle se vide, elle n'accuse
                  personne : à zéro l'offre se referme sans rien fermer, le
                  bouton du bas reste là pour qui change d'avis. */}
              {!reviving && (
                <div className="h-[3px] w-full mt-2 rounded-full overflow-hidden bg-[#3A2A2A]">
                  <div
                    className="h-full bg-[#4A9B5F] transition-[width] duration-1000 ease-linear"
                    style={{ width: `${(secondes / DUREE_OFFRE) * 100}%` }}
                  />
                </div>
              )}

              <button
                onClick={() => {
                  playBack();
                  if (!refusAmorce) { setRefusAmorce(true); return; }
                  setPeakOffer(false);
                }}
                className="w-full mt-2.5 py-2.5 text-[12px] font-semibold text-[#8B6B4A]"
              >
                {refusAmorce
                  ? tr(`Laisser ${char.name} partir`, `Let ${char.name} go`)
                  : tr('Non, c\'est fini', 'No, it\'s over')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- LA UNE DE JOURNAL ---- */}
      <motion.div
        ref={uneRef}
        initial={{ y: 18, opacity: 0, rotate: -0.6 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm rounded-sm px-4 pt-3 pb-4 shadow-[0_10px_36px_rgba(0,0,0,0.45)]"
        style={{ background: 'linear-gradient(180deg, #F4EBD8, #EDE0C6)', border: '1px solid #D8C8A8' }}
      >
        {/* Manchette */}
        <div className="text-center border-b-2 border-[#2A1F1A] pb-1.5 mb-2">
          <p className="text-[9px] tracking-[0.35em] text-[#6B5740] font-mono uppercase">{tr('Édition nécrologie', 'Obituary edition')}</p>
          <h2 className="text-xl font-black text-[#2A1F1A] leading-none tracking-wide">{tr('LA GAZETTE DU CARTON', 'THE CARDBOARD GAZETTE')}</h2>
          <p className="text-[9px] text-[#8B6B4A] font-mono mt-0.5">
            {tr(`Jour ${char.day}`, `Day ${char.day}`)} · {tr('1 centime', '1 cent')} · {tr('tirage : personne', 'circulation: nobody')}
          </p>
        </div>

        {/* Gros titre */}
        <h1 className="text-lg font-black text-[#1A1310] leading-tight text-center mb-2">{headline}</h1>

        {/* Photo du drame */}
        {deathImgTry < deathCandidates.length ? (
          <div className="w-full h-36 overflow-hidden relative mb-2 border border-[#B8A888]">
            <KenBurnsImage
              key={deathCandidates[deathImgTry]}
              src={deathCandidates[deathImgTry]}
              position={CADRAGE_BAS.has(deathCandidates[deathImgTry]) ? 'bottom' : 'center'}
              onError={() => setDeathImgTry(n => n + 1)}
            />
            <span className="absolute bottom-1 right-2 text-xl drop-shadow">💀</span>
          </div>
        ) : (
          <div className="w-full h-24 flex items-center justify-center text-5xl mb-2 border border-[#B8A888] bg-[#E4D6BC]">💀</div>
        )}

        {/* Nécrologie */}
        <p className="text-[12px] text-[#3D3020] leading-snug mb-2">{deathCause}</p>
        <div className="flex items-center gap-2.5 border-t border-[#C8B896] pt-2">
          <div className="w-11 h-11 rounded overflow-hidden border border-[#B8A888] shrink-0 grayscale-[35%]">
            <PlayerFace char={char} size={44} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-[#2A1F1A] truncate">{char.job.emoji} {char.name}</p>
            <p className="text-[10px] text-[#6B5740] truncate">{tc(char.job.name)} · {char.traits.map(t => t.emoji).join(' ')}</p>
          </div>
          <div className="text-right font-mono shrink-0">
            <p className="text-[11px] text-[#2A1F1A] font-bold">{char.day} {tr(char.day > 1 ? 'jours' : 'jour', char.day > 1 ? 'days' : 'day')} · {char.money}€</p>
            <p className="text-[10px] text-[#8B6B4A]">⭐ {char.respect} · {tr('score', 'score')} {score}</p>
          </div>
        </div>
      </motion.div>

      {/* Le partage, seulement quand la mort vaut le coup d'œil. */}
      {worthSharing({
        newEndings: harvest?.newIds.length ?? 0,
        day: char.day,
        bestDay: highScores.length > 0 ? Math.max(...highScores.map(h => h.days)) : 0,
        money: char.money,
        crowned: char.crowned,
      }) && (
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          disabled={partage !== 'idle'}
          onClick={() => { playNewEnding(); partagerLaUne(); }}
          className="w-full max-w-sm py-2.5 text-[12px] font-semibold rounded-xl border disabled:opacity-60"
          style={{ borderColor: '#4A3048', color: '#E8A87C' }}
        >
          {partage === 'busy'
            ? tr('⏳ Préparation…', '⏳ Preparing…')
            : partage === 'done'
              ? tr('✓ Une envoyée', '✓ Front page sent')
              : tr('📰 Montrer cette une', '📰 Share this front page')}
        </motion.button>
      )}

      {/* ---- LE SUCCESSEUR : la partie suivante est déjà commencée ----
           Placé AVANT le bilan, et avant tout ce qui ressemble à une clôture.
           Le joueur ne quitte plus une partie finie, il quitte quelqu'un qui
           l'attend. C'est aussi le texte des rappels (voir lib/notifications). */}
      {successor && (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#5A3A28]"
          style={{ background: 'linear-gradient(135deg, #3A2A20, #241A16)' }}
        >
          {miss && (
            <p className="text-[11px] text-[#C89B5A] leading-snug mb-2.5">
              ↯ {tr(miss.fr, miss.en)}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#6B4A32] shrink-0">
              <PlayerFace char={successor} size={44} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-mono">
                {tr('Le suivant sur la liste', 'Next in line')}
              </p>
              <p className="text-[13px] font-bold text-[#F0D9C4] truncate">
                {successor.name} · {successor.job.emoji} {tc(successor.job.name)}
              </p>
              <p className="text-[10px] text-[#A08060] truncate">
                {successor.traits.map(t => `${t.emoji} ${tc(t.name)}`).join(' · ')}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playCard();
              resetGaugeAlerts();
              reinitialiserPiques();
              // L'interstitiel se pose ici, sur une transition VOULUE, et non
              // par-dessus le bilan qu'on est en train de lire : un plein écran
              // qui coupe une lecture se fait fermer en deux secondes.
              showInterstitial();
              dispatch({ type: 'RESTART' });
            }}
            className="w-full mt-3 py-3.5 text-[15px] font-bold text-white rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
              boxShadow: '0 4px 18px rgba(212, 135, 77, 0.35)',
            }}
          >
            {tr(`Reprendre la rue avec ${successor.name}`, `Take the street with ${successor.name}`)}
          </motion.button>
          <p className="text-[9px] text-[#8B6B4A] text-center mt-1.5">
            {tr('Vous pourrez encore changer d\'avis.', 'You can still change your mind.')}
          </p>
        </motion.div>
      )}

      {/* ---- LA RÉCOLTE : fins découvertes + Karma ---- */}
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
        style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
      >
        {/* ---- LA FOUILLE DES POCHES ---- */}
        <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-semibold mb-1.5">
          🧥 {tr('Fouiller les poches', 'Search the pockets')}
        </p>
        <div className="flex flex-col gap-1">
          {(harvest?.pockets ?? []).map((poche, i) => {
            const ouverte = i < pochesOuvertes;
            const suivante = i === pochesOuvertes;
            return (
              <motion.button
                key={poche.id}
                onClick={suivante ? ouvrirPoche : undefined}
                disabled={!suivante}
                whileTap={suivante ? { scale: 0.98 } : undefined}
                animate={suivante ? { scale: [1, 1.015, 1] } : { scale: 1 }}
                transition={suivante ? { duration: 1.6, repeat: Infinity } : undefined}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left border ${
                  ouverte ? 'border-[#4A3048] bg-[#231525]'
                    : suivante ? 'border-[#F2C14E]/45 bg-[#F2C14E]/8'
                      : 'border-[#3A2436] bg-[#1E1220] opacity-45'
                }`}
              >
                <span className="text-base">{ouverte ? poche.emoji : '🤚'}</span>
                <span className={`flex-1 text-[12px] font-semibold ${ouverte ? 'text-[#F0D9C4]' : 'text-[#8B6B4A]'}`}>
                  {ouverte
                    ? tr(poche.fr, poche.en)
                    : suivante ? tr('Fouiller', 'Search') : tr('…', '…')}
                </span>
                {ouverte && (
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14 }}
                    className={`text-[13px] font-bold font-mono ${poche.id === 'bonus' ? 'text-[#7BD48A]' : 'text-[#F2C14E]'}`}
                  >
                    +{poche.amount} 👑
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Le total ne s'affiche qu'une fois tout ouvert. */}
        {pochesOuvertes >= (harvest?.pockets ?? []).length && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mt-2 pt-2 border-t border-[#4A3048]"
          >
            <span className="text-[12px] text-[#F0D9C4] font-semibold">👑 {tr('Karma de Rue gagné', 'Street Karma earned')}</span>
            <span className="text-base font-bold text-[#F2C14E] font-mono">+{harvest?.karmaGained ?? 0}</span>
          </motion.div>
        )}
        {pochesOuvertes >= (harvest?.pockets ?? []).length && (
          <p className="text-[10px] text-[#A08060] text-right font-mono">{tr('total', 'total')} : {harvest?.karmaTotal ?? 0} 👑</p>
        )}

        {/* Les fins inédites ne se montrent qu'une fois la dernière poche
            ouverte : c'est le meilleur du bilan, il vient en dernier. */}
        {newCards.length > 0 && finsRevelees && (
          <div className="mb-2.5">
            <p className="text-[10px] tracking-widest uppercase text-[#F2C14E] font-semibold mb-1.5">
              📕 {tr(newCards.length > 1 ? 'Nouvelles fins découvertes' : 'Nouvelle fin découverte', newCards.length > 1 ? 'New endings discovered' : 'New ending discovered')}
            </p>
            <div className="flex flex-col gap-1">
              {newCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-2 text-[12px] text-[#F0D9C4] bg-[#231525] rounded-lg px-2.5 py-1.5"
                >
                  <span>{c.emoji}</span>
                  <span className="flex-1 font-semibold">{c.title}</span>
                  <span className="text-[10px] text-[#F2C14E] font-mono">+10 👑</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { playCard(); dispatch({ type: 'SET_SCREEN', screen: 'registre' }); }}
          className="w-full mt-2 py-2 text-[11px] font-semibold text-[#E8A87C] rounded-lg border border-[#4A3048] hover:bg-white/5"
        >
          📕 {tr('Consulter le Registre des Morts', 'Open the Book of the Dead')}
        </button>
      </motion.div>

      {/* ---- DERNIÈRES VOLONTÉS ---- */}
      {char.inventory.length > 0 && (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
          style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
        >
          <p className="text-[12px] text-[#F0D9C4] font-semibold mb-0.5">📜 {tr('Dernières volontés', 'Last will')}</p>
          <p className="text-[10px] text-[#A08060] mb-2">
            {tr('Léguez UN objet : il attendra votre prochain personnage, posé sur votre carton.', 'Bequeath ONE item: it will await your next character, left on your cardboard.')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {char.inventory.map((item, i) => {
              const locked = !isBequeathable(item);
              return (
                <button
                  key={`${item.id}-${i}`}
                  onClick={() => chooseLegacy(item)}
                  title={locked ? tr('Ne se lègue pas', 'Cannot be bequeathed') : undefined}
                  className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 border transition-all ${
                    locked
                      ? 'border-[#5A4030] text-[#7A6450] opacity-70 cursor-not-allowed line-through decoration-[#7A6450]'
                      : legacyId === item.id
                        ? 'border-[#F2C14E] bg-[#F2C14E]/15 text-[#F2C14E] font-semibold'
                        : 'border-[#4A3048] text-[#C8B0A0] hover:bg-white/5'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span className="max-w-28 truncate">{tc(item.name)}</span>
                  {locked && <span className="text-[10px]">🔒</span>}
                </button>
              );
            })}
          </div>
          {/* Le Sceptre est dans le sac : on explique pourquoi il reste au mort. */}
          {char.inventory.some((it) => !isBequeathable(it)) && (
            <p className="text-[10px] text-[#C89B5A] mt-1.5 leading-snug">
              👑 {tr('Le Sceptre du Roi part avec vous dans la tombe : la couronne ne s\'hérite pas, elle s\'arrache au combat.',
                     "The King's Sceptre goes to the grave with you: the crown isn't inherited, it's taken by force.")}
            </p>
          )}
          {legacyId && (
            <p className="text-[10px] text-[#F2C14E] mt-1.5">
              ✓ {tr('Posé sur votre tombe pour le prochain.', 'Left on your grave for the next one.')}
            </p>
          )}
        </motion.div>
      )}

      {/* High Scores */}
      {highScores.length > 0 && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
          style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
        >
          <h4 className="text-sm font-semibold text-[#F0D9C4] text-center mb-2">
            🏆 {tr('Plus longues survies', 'Longest survivals')}
          </h4>
          <div className="flex flex-col gap-1.5">
            {highScores.slice(0, 5).map((hs, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#A08060]'}>
                  {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {hs.name}
                </span>
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#E8A87C] font-semibold'}>
                  {hs.days} {tr(hs.days > 1 ? 'jours' : 'jour', hs.days > 1 ? 'days' : 'day')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Seconde chance (pub récompensée), une fois par partie */}
      {canRevive && (
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={reviving}
          onClick={handleRevive}
          className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #2E7D46, #246237)',
            boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
          }}
        >
          {reviving ? tr('⏳ Chargement…', '⏳ Loading…') : tr(bonusFr('Seconde chance'), bonusEn('Second chance'))}
        </motion.button>
      )}

      {/* Reprise — répétée en bas de page pour qui a tout lu, et repli complet
          si le successeur n'a pas pu être tiré. */}
      <motion.button
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.85 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
              playCard();
              resetGaugeAlerts();
              reinitialiserPiques();
              // L'interstitiel se pose ici, sur une transition VOULUE, et non
              // par-dessus le bilan qu'on est en train de lire : un plein écran
              // qui coupe une lecture se fait fermer en deux secondes.
              showInterstitial();
              dispatch({ type: 'RESTART' });
            }}
        className={successor
          ? 'w-full max-w-sm py-2.5 text-[12px] font-semibold text-[#E8A87C] rounded-xl border border-[#4A3048]'
          : 'w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl'}
        style={successor ? undefined : {
          background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
          boxShadow: '0 4px 16px rgba(212, 135, 77, 0.3)',
        }}
      >
        {successor
          ? tr('↻ Reprendre la rue', '↻ Take the street')
          : tr('Recommencer', 'Play Again')}
      </motion.button>
    </motion.div>
  );
}
