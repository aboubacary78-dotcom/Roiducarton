/*
 * LE ROI DU CARTON, Service de publicités (AdMob)
 *
 * Cette couche centralise toute la logique des pubs Google AdMob.
 * - Sur mobile (Android/iOS via Capacitor) : vraies publicités.
 * - Sur le web (navigateur, dev) : tout est en "no-op" et résout
 *   immédiatement, pour ne jamais bloquer ni casser le jeu pendant
 *   le développement.
 *
 * IMPORTANT, avant publication sur les stores :
 * 1. Crée un compte AdMob (https://admob.google.com).
 * 2. Crée une app AdMob pour Android et une pour iOS.
 * 3. Remplace les ID de TEST ci-dessous par tes vrais ID de blocs d'annonces.
 * 4. Renseigne ton App ID AdMob dans les fichiers natifs
 *    (voir STORE_PUBLISHING.md).
 *
 * Tant que tu utilises les ID de test, Google n'affiche que des pubs
 * de démonstration : ne JAMAIS cliquer dessus avec ton vrai compte en
 * production, ça peut faire bannir le compte AdMob.
 */

import { Capacitor } from '@capacitor/core';
import { acheter, brancherLivraison, restaurer, type Produit } from './facturation';

// ─────────────────────────────────────────────────────────────────────────
// Achat "Sans pub" : supprime les pubs intrusives (interstitielles + bannière).
// Les pubs récompensées (facultatives, choisies par le joueur pour un bonus)
// restent disponibles.
// ─────────────────────────────────────────────────────────────────────────
const NOADS_KEY = 'roi-du-carton-noads';
let adsRemoved = (() => {
  try { return localStorage.getItem(NOADS_KEY) === '1'; } catch { return false; }
})();

export function isAdsRemoved(): boolean {
  return adsRemoved;
}

export function setAdsRemoved(v: boolean): void {
  adsRemoved = v;
  try { localStorage.setItem(NOADS_KEY, v ? '1' : '0'); } catch { /* silent */ }
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LA LIVRAISON : ce qu'un produit payé ouvre dans le jeu
 *
 * `facturation.ts` sait encaisser ; il ne sait pas ce que le jeu vend. C'est
 * cette fonction-ci qui traduit un identifiant de produit en droits, et elle
 * est le SEUL endroit où un achat s'active. Qu'il vienne d'un paiement qu'on
 * vient de faire, d'une restauration, ou du démarrage sur un téléphone neuf,
 * il passe par ici.
 *
 * Elle rend `true` quand elle a ouvert quelque chose qui ne l'était pas,
 * c'est ce qui permet à l'écran de restauration de distinguer « j'ai retrouvé
 * votre achat » de « le compte n'a rien acheté ».
 * ═══════════════════════════════════════════════════════════════════════════ */
function livrer(p: Produit): boolean {
  let nouveau = false;
  if (p === 'noads' || p === 'pack_complet') {
    if (!adsRemoved) { setAdsRemoved(true); nouveau = true; }
  }
  if (p === 'atelier' || p === 'pack_complet') {
    if (!atelierOwned) { setAtelierOwned(true); nouveau = true; }
  }
  return nouveau;
}
brancherLivraison(livrer);

/*
 * LA PORTE DE DÉVELOPPEMENT, ET POURQUOI ELLE NE PEUT PAS FUIR.
 *
 * Il faut bien pouvoir essayer les écrans d'achat dans un navigateur, où
 * aucune facturation n'existe. Mais c'est exactement le trou qu'on est en
 * train de boucher : jusqu'à cette version, appuyer sur « Acheter » ouvrait
 * le produit gratuitement, PARTOUT.
 *
 * `import.meta.env.DEV` est remplacé par `false` à la compilation, et le bloc
 * disparaît du paquet livré : il n'existe ni dans l'APK, ni dans un site
 * construit avec `pnpm build`. Ce n'est pas une garde qu'on peut oublier
 * d'activer, elle est absente ou elle n'est pas là.
 */
async function acheterProduit(p: Produit): Promise<boolean> {
  if (import.meta.env.DEV && !isNative()) {
    console.warn(`[ads] achat simulé de « ${p} » (développement seulement)`);
    livrer(p);
    return true;
  }
  return acheter(p);
}

/** Lance l'achat « Sans pub ». Rend true seulement si Google a confirmé. */
export async function purchaseRemoveAds(): Promise<boolean> {
  return acheterProduit('noads');
}

/* ═══════════════════════════════════════════════════════════════════════════
 * L'ATELIER : le second achat, et il ne touche pas à la publicité
 *
 * « Sans pub » retire les interruptions. L'Atelier, lui, ouvre deux choses que
 * le jeu tirait au sort : le VISAGE du personnage, et ses TRAITS de départ.
 *
 * Les deux achats sont indépendants, on peut vouloir composer sa tête sans
 * vouloir payer pour la publicité, et l'inverse. Les vendre liés ferait payer
 * à chacun la moitié qui ne l'intéresse pas.
 *
 * ⚠️ PRODUCTION : comme `purchaseRemoveAds`, la fonction ci-dessous ouvre
 * l'accès sans passer par un vrai achat. À brancher sur un produit non
 * consommable « atelier » avant publication.
 * ═══════════════════════════════════════════════════════════════════════════ */

const ATELIER_KEY = 'roi-du-carton-atelier';
let atelierOwned = (() => {
  try { return localStorage.getItem(ATELIER_KEY) === '1'; } catch { return false; }
})();

export function isAtelierOwned(): boolean {
  return atelierOwned;
}

export function setAtelierOwned(v: boolean): void {
  atelierOwned = v;
  try { localStorage.setItem(ATELIER_KEY, v ? '1' : '0'); } catch { /* silent */ }
}

export async function purchaseAtelier(): Promise<boolean> {
  return acheterProduit('atelier');
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LE PACK : les deux ensemble, et il doit être VISIBLEMENT moins cher
 *
 * Un lot qui coûte la somme de ses parties n'est pas un lot, c'est une
 * quatrième façon de dire la même chose. Il faut qu'on voie l'économie sans
 * calculer : d'où la grille retenue (voir docs/design/prix.md).
 *
 *   Sans pub   2,99 €
 *   Atelier    4,99 €
 *   Pack       6,99 €, 1,00 € de moins que les deux séparément
 *
 * ET ON NE LE PROPOSE PAS À QUI POSSÈDE DÉJÀ UNE MOITIÉ. Lui vendre le lot
 * lui ferait racheter ce qu'il a ; l'écran ne montre alors que la pièce qui
 * lui manque, à son prix. C'est `packUtile()` qui tranche.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Le pack a-t-il encore un sens pour ce joueur ? (il ne possède rien) */
export function packUtile(): boolean {
  return !adsRemoved && !atelierOwned;
}

export async function purchasePack(): Promise<boolean> {
  return acheterProduit('pack_complet');
}

/* ═══════════════════════════════════════════════════════════════════════════
 * RESTAURER SES ACHATS : obligatoire, et pas seulement poli
 *
 * Les trois produits sont NON CONSOMMABLES : achetés une fois, acquis pour
 * toujours. Or ce qui les mémorise ici est le `localStorage`, c'est-à-dire le
 * téléphone, pas le compte Google. Trois situations très ordinaires effacent
 * donc un achat payé :
 *
 *   · on change de téléphone ;
 *   · on désinstalle et on réinstalle ;
 *   · le système vide les données de l'application pour faire de la place.
 *
 * Sans un moyen de récupérer, la seule issue du joueur est de repayer ou de
 * demander un remboursement. Google le sait, et l'absence de restauration est
 * le premier motif de rejet des applications à achats non consommables.
 *
 * C'EST BRANCHÉ. `facturation.restaurer()` rejoue les transactions du compte
 * Google, puis relit ce que le magasin dit posséder ; chaque produit retrouvé
 * repasse par `livrer()`, comme un achat neuf. Les trois réponses possibles
 * sont distinctes, et l'écran les distingue :
 *
 *   · retrouve, quelque chose s'est rouvert ;
 *   · ni l'un ni l'autre, le compte a répondu, il n'avait rien ;
 *   · indisponible, on n'a pas pu demander (hors ligne, web, panne).
 *
 * La troisième compte autant que les deux autres : dire « aucun achat » à
 * quelqu'un qu'on n'a pas réussi à interroger, c'est lui affirmer qu'il n'a
 * rien payé.
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface Restauration {
  /** Un achat au moins a été retrouvé et réactivé. */
  retrouve: boolean;
  /** L'achat n'a pas pu être interrogé (hors ligne, service indisponible). */
  indisponible: boolean;
}

export async function restaurerAchats(): Promise<Restauration> {
  if (!isNative()) {
    // Sur le web il n'y a pas de facturation : on ne prétend pas le contraire.
    return { retrouve: false, indisponible: true };
  }
  return restaurer();
}

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION DES BLOCS D'ANNONCES
//
// ANDROID : les vrais blocs du compte AdMob du jeu. L'App ID qui va avec
// (…~8445598624) est déclaré dans android/app/src/main/AndroidManifest.xml,
// les deux appartiennent au même éditeur, ca-app-pub-6336322065829631, et
// c'est ce que vérifie scripts/verifie-android.py.
//
// Ces identifiants ne sont PAS des secrets : ils partent dans chaque APK
// distribué et s'en extraient en une commande. Google les écrit lui-même en
// clair dans ses exemples. Rien à cacher ici.
//
// iOS : encore les blocs de démonstration de Google, faute d'application iOS.
// Elle demande un Mac ; le jour où elle existera, il faudra créer une SECONDE
// application dans AdMob (les blocs ne se partagent pas entre plates-formes)
// et remplacer les six lignes ci-dessous.
// ─────────────────────────────────────────────────────────────────────────
const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-6336322065829631/1688618582',
    interstitial: 'ca-app-pub-6336322065829631/5639366683',
    rewarded: 'ca-app-pub-6336322065829631/8014353783',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

/*
 * LE MODE TEST RESTE ALLUMÉ, AVEC LES VRAIS BLOCS. CE N'EST PAS UN OUBLI.
 *
 * On pourrait croire qu'installer ses vrais identifiants veut dire couper le
 * mode test. C'est le contraire : la bonne façon de se relire, c'est de
 * demander des annonces de DÉMONSTRATION à TRAVERS ses vrais blocs. On vérifie
 * ainsi le vrai chemin (le bon compte, le bon bloc, le bon format) sans
 * jamais faire d'impression réelle.
 *
 * Le danger est là et il est sérieux : voir une vraie annonce dans sa propre
 * application, c'est finir par cliquer dessus, et Google ferme les comptes
 * pour ça. Ce n'est pas un avertissement de principe, c'est le motif de
 * fermeture le plus courant chez les nouveaux éditeurs.
 *
 * À passer à `false` AU MOMENT de fabriquer le paquet qu'on téléverse, et pas
 * avant. De toute façon rien ne serait diffusé d'ici là : AdMob n'ouvre les
 * annonces réelles qu'après avoir examiné l'application, ce qui suppose
 * qu'elle soit d'abord sur le Play Store.
 */
const USE_TEST_ADS = true;

function platform(): 'android' | 'ios' | 'web' {
  const p = Capacitor.getPlatform();
  if (p === 'android') return 'android';
  if (p === 'ios') return 'ios';
  return 'web';
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

function unit(kind: 'banner' | 'interstitial' | 'rewarded'): string {
  const p = platform();
  if (p === 'web') return AD_UNITS.android[kind];
  return AD_UNITS[p][kind];
}

// ─────────────────────────────────────────────────────────────────────────
// CONSENTEMENT
//
// Deux obligations distinctes, souvent confondues :
//
//   1. L'EUROPE (RGPD/ePrivacy). Depuis janvier 2024, Google exige une
//      plateforme de consentement certifiée pour diffuser de la publicité aux
//      utilisateurs de l'EEE, du Royaume-Uni et de la Suisse. Le SDK UMP de
//      Google en est une : il détermine tout seul si l'utilisateur est
//      concerné, et n'affiche le formulaire que dans ce cas.
//
//   2. iOS (App Tracking Transparency). Apple exige une demande explicite
//      avant tout suivi entre applications. Le SDK UMP la déclenche à notre
//      place, à condition d'avoir configuré un message ATT dans la console
//      AdMob, d'où l'ordre : on demande le consentement AVANT d'initialiser
//      la publicité.
//
// Si l'utilisateur refuse, on ne coupe pas la publicité : on la sert
// NON PERSONNALISÉE. Le jeu continue, il rapporte moins, et c'est le
// comportement attendu.
// ─────────────────────────────────────────────────────────────────────────

/** Ce que l'utilisateur a accepté. `null` tant qu'on n'a pas demandé. */
let consentStatus: string | null = null;

/**
 * Le consentement autorise-t-il la publicité personnalisée ?
 *
 * Prudent par construction : tant que le consentement n'est pas explicitement
 * obtenu ou déclaré non requis, on répond non. Une erreur du SDK, un réseau
 * coupé, un formulaire abandonné, tous ces cas mènent à de la publicité non
 * personnalisée, jamais l'inverse.
 */
export function personalizedAdsAllowed(): boolean {
  return consentStatus === 'OBTAINED' || consentStatus === 'NOT_REQUIRED';
}

/** État du consentement, pour l'écran des Options. */
export function consentState(): 'inconnu' | 'accepte' | 'refuse' | 'non-requis' {
  switch (consentStatus) {
    case 'OBTAINED': return 'accepte';
    case 'NOT_REQUIRED': return 'non-requis';
    case 'REQUIRED': return 'refuse';
    default: return 'inconnu';
  }
}

/**
 * Demande le consentement, et affiche le formulaire s'il y a lieu.
 *
 * Ne bloque jamais le jeu : la moindre erreur laisse simplement le
 * consentement à « inconnu », donc en publicité non personnalisée.
 */
async function requestConsent(): Promise<void> {
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    let info = await AdMob.requestConsentInfo();
    consentStatus = info.status;

    // Le formulaire ne s'ouvre que si l'utilisateur est concerné ET qu'un
    // formulaire existe. Ailleurs qu'en Europe, on ne dérange personne.
    if (info.status === 'REQUIRED' && info.isConsentFormAvailable) {
      info = await AdMob.showConsentForm();
      consentStatus = info.status;
    }
  } catch (e) {
    console.warn('[ads] Consentement indisponible, publicité non personnalisée :', e);
  }
}

/**
 * Rouvre le formulaire de consentement, pour que l'utilisateur puisse changer
 * d'avis. Obligatoire en Europe : un consentement doit être retirable aussi
 * facilement qu'il a été donné.
 */
export async function reopenConsentForm(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.resetConsentInfo();
    const info = await AdMob.requestConsentInfo();
    consentStatus = info.status;
    if (info.isConsentFormAvailable) {
      const after = await AdMob.showConsentForm();
      consentStatus = after.status;
    }
    return true;
  } catch (e) {
    console.warn('[ads] Impossible de rouvrir le formulaire de consentement :', e);
    return false;
  }
}

let initialized = false;

/**
 * Initialise le SDK AdMob. À appeler une seule fois au démarrage de l'app.
 * Sur le web, ne fait rien.
 *
 * L'ordre compte : le consentement d'abord, la publicité ensuite. C'est lui
 * qui déclenche au passage la demande de suivi iOS.
 */
export async function initAds(): Promise<void> {
  if (!isNative() || initialized) return;
  try {
    await requestConsent();
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.initialize({
      initializeForTesting: USE_TEST_ADS,
    });
    initialized = true;
  } catch (e) {
    console.warn('[ads] Échec de l\'initialisation AdMob:', e);
  }
}

/**
 * Affiche une bannière en bas de l'écran.
 * Sur le web : no-op.
 */
export async function showBanner(): Promise<void> {
  if (adsRemoved || !isNative()) return;
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: unit('banner'),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: USE_TEST_ADS,
      // Refus, ou consentement inconnu : publicité NON personnalisée.
      // Sans cette ligne, le formulaire de consentement ne servirait à rien.
      npa: !personalizedAdsAllowed(),
    });
  } catch (e) {
    console.warn('[ads] showBanner:', e);
  }
}

/** Cache la bannière (ex : pendant les écrans plein-écran). */
export async function hideBanner(): Promise<void> {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.hideBanner();
  } catch (e) {
    console.warn('[ads] hideBanner:', e);
  }
}

/**
 * Affiche une publicité interstitielle (plein écran).
 * Idéal entre deux parties (ex : sur l'écran de Game Over).
 * Résout toujours, même en cas d'erreur, pour ne jamais bloquer le jeu.
 */
/* ═══════════════════════════════════════════════════════════════════════════
 * LA DISCIPLINE DE L'INTERSTITIEL
 *
 * C'est le placement le plus rentable du jeu et le plus dangereux, pour la
 * même raison : il part à la fin d'une partie, et une partie dure quatre
 * minutes. Quatre cents parties simulées donnent une survie médiane de cinq
 * jours ; dans une session d'un quart d'heure, le joueur meurt trois à cinq
 * fois. Sans garde-fou, il encaisse trois à cinq pleins écrans qu'il n'a pas
 * demandés, et l'association qui s'installe est « mourir = pub ».
 *
 * Or on meurt tout le temps : c'est le principe du jeu.
 *
 * Trois règles, dans l'ordre où elles s'appliquent.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Délai minimum entre deux interstitiels. Supprime les doublons rapprochés. */
const DELAI_INTERSTITIEL_MS = 90_000;

/**
 * Parties à laisser passer chez un joueur qui découvre le jeu.
 *
 * Le premier jour décide du septième. Un nouveau venu qui prend un plein écran
 * à sa première mort n'a encore rien investi : il n'a aucune raison de rester.
 */
const PARTIES_DE_GRACE = 3;
const CLE_PARTIES = 'roi-du-carton-parties-finies';

let dernierInterstitiel = 0;
let premiereMortDeLaSession = true;

/* ═══════════════════════════════════════════════════════════════════════════
 * LA TRÊVE : dix minutes offertes, et c'est le meilleur argument de vente
 *
 * On ne vend pas « la paix » en la décrivant : on la fait ESSAYER. Après le
 * deuxième plein écran d'une session, le jeu offre dix minutes sans aucune
 * publicité, annoncées comme un cadeau. À l'expiration, il le dit, et c'est
 * ce moment-là, pas la carte d'ouverture, qui vend.
 *
 * Une chose possédée puis retirée pèse environ le double d'une chose jamais
 * eue : c'est le seul levier de tout le dossier qui passe par l'expérience et
 * non par un texte. Ce qu'il coûte est connu et minuscule, deux impressions
 * chez quelqu'un qui n'achètera jamais.
 *
 * Et il ne se déclenche qu'UNE FOIS par session : le répéter en ferait une
 * mécanique de jeu, donc quelque chose qu'on attend au lieu de quelque chose
 * qu'on regrette.
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * La durée de la trêve, exportée parce que c'est aussi la FENÊTRE DE MESURE
 * de la dégustation : un achat qui tombe dedans vient de l'effet de dotation,
 * un achat trois jours plus tard n'en vient pas. Deux constantes séparées se
 * seraient désynchronisées à la première retouche.
 */
export const TREVE_MS = 10 * 60_000;
/** Après combien de pleins écrans la trêve est offerte. */
const TREVE_APRES = 2;

let interstitielsDeLaSession = 0;
let treveJusqua = 0;
let treveDejaOfferte = false;

/** La trêve court-elle en ce moment ? */
export function enTreve(maintenant = Date.now()): boolean {
  return maintenant < treveJusqua;
}

/** Ce qu'il reste de trêve, en millisecondes. Zéro si elle est finie. */
export function resteDeTreve(maintenant = Date.now()): number {
  return Math.max(0, treveJusqua - maintenant);
}

/*
 * CE QUI ÉCOUTE LES PLEINS ÉCRANS.
 *
 * Les deux propositions qui suivent une publicité, l'offre de trêve, puis la
 * carte « c'était ça, tout le temps », n'ont rien à faire dans ce module :
 * elles sont visuelles. Il rend donc un signal, et l'interface s'y abonne.
 *
 * `n` est le rang du plein écran dans la session. C'est lui qui décide : on ne
 * propose jamais rien après le PREMIER, parce qu'à ce moment-là le joueur n'a
 * pas encore de raison de trouver ça pénible.
 */
export type SignalPub = { n: number; treveOfferte: boolean };
const auditeurs = new Set<(s: SignalPub) => void>();
export function surInterstitiel(cb: (s: SignalPub) => void): () => void {
  auditeurs.add(cb);
  return () => auditeurs.delete(cb);
}

/** Remet la session à zéro. Sert aux tests. */
export function reinitialiserTreve(): void {
  interstitielsDeLaSession = 0;
  treveJusqua = 0;
  treveDejaOfferte = false;
}

/** Combien de parties ce joueur a-t-il terminées, toutes sessions confondues ? */
function partiesFinies(): number {
  try { return Number(localStorage.getItem(CLE_PARTIES) || '0'); } catch { return 0; }
}
function noterPartieFinie(): void {
  try { localStorage.setItem(CLE_PARTIES, String(partiesFinies() + 1)); } catch { /* silent */ }
}

/**
 * Une partie vient de se terminer. À appeler à CHAQUE mort, même quand aucune
 * publicité ne part : c'est ce compteur qui fait sortir le joueur de la
 * période de grâce.
 */
export function partieTerminee(): void {
  noterPartieFinie();
}

/**
 * L'interstitiel peut-il partir maintenant, et pourquoi ?
 *
 * La règle est ici, en un seul endroit, et elle ne modifie rien, c'est ce qui
 * la rend vérifiable : un test peut l'interroger sans réseau publicitaire et
 * sans provoquer d'effet de bord.
 */
export function verdictInterstitiel(maintenant = Date.now()): { montrer: boolean; raison: string } {
  if (adsRemoved) return { montrer: false, raison: 'sans-pub acheté' };
  /*
   * La trêve passe avant tout le reste : une publicité pendant les dix minutes
   * offertes annulerait le cadeau, et surtout la démonstration.
   */
  if (enTreve(maintenant)) return { montrer: false, raison: 'trêve en cours' };
  if (partiesFinies() <= PARTIES_DE_GRACE) {
    return { montrer: false, raison: `période de grâce (${partiesFinies()}/${PARTIES_DE_GRACE} parties)` };
  }
  if (premiereMortDeLaSession) return { montrer: false, raison: 'première mort de la session' };
  const attente = maintenant - dernierInterstitiel;
  if (attente < DELAI_INTERSTITIEL_MS) {
    return { montrer: false, raison: `trop tôt (${Math.round(attente / 1000)} s sur ${DELAI_INTERSTITIEL_MS / 1000})` };
  }
  return { montrer: true, raison: 'ok' };
}

/** Remet les compteurs de session à zéro. Sert aux tests. */
export function reinitialiserInterstitiel(): void {
  dernierInterstitiel = 0;
  premiereMortDeLaSession = true;
}

/*
 * `maintenant` n'est pas un caprice de test : c'est la MÊME couture que celle
 * de `verdictInterstitiel`, et pour la même raison. Le jeu impose quatre-vingt
 * -dix secondes entre deux pleins écrans ; sans pouvoir avancer l'horloge, la
 * seule façon d'observer le deuxième, donc la trêve, donc tout ce qui en
 * dépend, serait d'attendre une minute et demie par vérification.
 */
export async function showInterstitial(maintenant = Date.now()): Promise<void> {
  const verdict = verdictInterstitiel(maintenant);

  /*
   * Le drapeau de première mort tombe même quand rien ne part : c'est la
   * PREMIÈRE mort qu'on offre, pas la première publicité réussie. Sinon un
   * joueur en période de grâce garderait son laissez-passer indéfiniment et
   * prendrait son premier plein écran bien plus tard que prévu.
   */
  premiereMortDeLaSession = false;

  if (!verdict.montrer) return;

  /*
   * LE COMPTEUR MONTE MÊME SUR LE WEB.
   *
   * `isNative()` gardait autrefois toute la suite, donc le rang du plein écran
   * ne s'incrémentait jamais dans un navigateur : la trêve et la proposition
   * qui la suit étaient invisibles en développement comme en test, c'est-à-dire
   * partout où on aurait pu les voir. La publicité elle-même reste, elle, bien
   * réservée à l'application.
   */
  dernierInterstitiel = maintenant;
  interstitielsDeLaSession++;

  const offrirLaTreve = interstitielsDeLaSession === TREVE_APRES && !treveDejaOfferte;
  if (offrirLaTreve) {
    treveDejaOfferte = true;
    treveJusqua = maintenant + TREVE_MS;
  }
  const signal: SignalPub = { n: interstitielsDeLaSession, treveOfferte: offrirLaTreve };
  auditeurs.forEach(cb => { try { cb(signal); } catch { /* un écran démonté */ } });

  if (!isNative()) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({
      adId: unit('interstitial'),
      isTesting: USE_TEST_ADS,
      // Refus, ou consentement inconnu : publicité NON personnalisée.
      // Sans cette ligne, le formulaire de consentement ne servirait à rien.
      npa: !personalizedAdsAllowed(),
    });
    await AdMob.showInterstitial();
  } catch (e) {
    console.warn('[ads] showInterstitial:', e);
  }
}

/**
 * Affiche une publicité récompensée. Renvoie true si l'utilisateur
 * a regardé la pub jusqu'au bout et mérite sa récompense.
 *
 * Sur le web : renvoie true immédiatement (pour tester la mécanique de
 * récompense sans pub réelle).
 */
/*
 * LE PLAFOND DE SOLLICITATIONS.
 *
 * Une vidéo récompensée se propose, elle ne se subit pas. Au-delà de trois
 * offres dans la même session, le joueur cesse de voir un jeu et commence à
 * voir un distributeur, et c'est la session SUIVANTE qu'on perd. Le compteur
 * vit en mémoire : il repart à zéro à chaque lancement de l'application, ce
 * qui est exactement ce qu'on veut.
 */
const MAX_OFFRES_PAR_SESSION = 3;
let offresFaites = 0;

/*
 * Reste-t-il de la place pour PROPOSER une vidéo ?
 *
 * Le plafond ne concerne que ce que le jeu met devant le joueur sans qu'il ait
 * rien demandé : doubler ses gains, forcer un résultat, garder son allure. Ce
 * qu'il vient chercher lui-même, relancer le trio de personnages, rouvrir une
 * boutique, la fontaine, la distribution solidaire, passe en `exempt` et
 * reste toujours disponible. Barrer un service qu'on est venu demander serait
 * une punition, pas une limite.
 */
/* ═══════════════════════════════════════════════════════════════════════════
 * LA CADENCE DE L'ACHETEUR : comptée PAR ACTIVITÉ, et c'est tout le sujet
 *
 * Trois versions ont été nécessaires, et les deux ratées disent chacune
 * quelque chose.
 *
 *   1. AUCUNE LIMITE pour qui a payé, au motif qu'il n'y a plus de publicité
 *      à doser. Testé : « c'est trop cheater ». Le plafond de trois offres par
 *      session ne protégeait pas seulement le joueur de la publicité, il
 *      protégeait le JEU de ses propres bonus.
 *
 *   2. TROIS ACTIONS, toutes activités confondues. Testé : « ultra facile, il
 *      n'y avait plus rien à faire ». Le défaut est net une fois vu, trois
 *      actions quelconques rouvraient TOUS les bonus d'un coup. On mendiait
 *      trois fois, et l'extincteur, le vol tranquille et le coup de pouce
 *      étaient tous rechargés ensemble. Un compteur commun rend les activités
 *      interchangeables, alors que le joueur, lui, les vit séparément.
 *
 *   3. UN COMPTEUR PAR FAMILLE, celui-ci. Le raccourci d'un mini-jeu ne
 *      s'ouvre qu'en JOUANT CE MINI-JEU. Il faut deux combats pour avoir droit
 *      à l'extincteur au troisième, deux casses pour filer en douce au
 *      troisième. Ce qu'on paie n'est plus « attendre » ni « faire n'importe
 *      quoi », c'est « avoir joué la chose qu'on veut sauter ».
 *
 * Les rencontres sont à deux plutôt qu'à trois : elles arrivent bien plus
 * souvent, et un bonus visible une fois sur trois y serait invisible.
 * ═══════════════════════════════════════════════════════════════════════════ */

export type FamilleBonus = 'combat' | 'vol' | 'recup' | 'evenement' | 'nuit';

/** Combien de fois il faut engager l'activité avant que son bonus s'ouvre. */
const CADENCE: Record<FamilleBonus, number> = {
  combat: 3,
  vol: 3,
  recup: 3,
  evenement: 2,
  /*
   * LA NUIT A SA PROPRE CADENCE, ET C'EST UNE CORRECTION.
   *
   * Le bilan du matin, rattraper un contrat raté, dormir une heure de plus,
   * était compté avec les rencontres. Mais une nuit n'est pas une rencontre :
   * elle arrive UNE fois, à heure fixe, et son secours ne sert qu'à ce
   * moment-là. Un joueur qui dormait sans avoir déclenché deux résultats de
   * rencontre dans la journée trouvait le bouton absent, sans comprendre,
   * « tu l'as enlevé pour les personnes qui payent », et c'était vrai en
   * pratique.
   *
   * Deux nuits, donc : une nuit sur deux, ce qui se compte tout seul et ne
   * dépend plus de ce qu'on a fait dans la journée.
   */
  nuit: 2,
};

const engagements: Record<FamilleBonus, number> = {
  combat: 0, vol: 0, recup: 0, evenement: 0, nuit: 0,
};

/**
 * L'activité vient d'être engagée : un combat s'ouvre, un casse commence, une
 * rencontre rend son verdict. Appelé depuis le GameProvider, qui observe les
 * transitions d'état, et non depuis les écrans, où un montage double de React
 * compterait deux fois.
 */
export function noterEngagement(f: FamilleBonus): void {
  engagements[f] += 1;
}

/** Combien de fois il reste à jouer avant que le bonus de `f` s'ouvre. */
export function engagementsAvantBonus(f: FamilleBonus): number {
  return Math.max(0, CADENCE[f] - engagements[f]);
}

/**
 * Le bonus peut-il être proposé ?
 *
 * `famille` omise : on répond pour l'ancien régime seul (le plafond de
 * session). Les écrans qui gèrent une cadence la passent ; ceux qui offrent un
 * service demandé par le joueur passent par `exempt` et ne viennent pas ici.
 */
export function canOfferRewarded(famille?: FamilleBonus): boolean {
  if (adsRemoved) {
    if (!famille) return true;
    return engagements[famille] >= CADENCE[famille];
  }
  return offresFaites < MAX_OFFRES_PAR_SESSION;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * « SANS PUB » NE DOIT PAS VOULOIR DIRE « SANS BONUS »
 *
 * Dans ce jeu, la vidéo facultative n'est pas une nuisance : c'est un LEVIER
 * DE JEU. Doubler un gain, forcer le meilleur résultat, garder son allure,
 * rouvrir une boutique, se relever à la mort. Le joueur qui paie pour retirer
 * les publicités achetait donc, sans le savoir, la disparition de la moitié de
 * ses outils, il payait pour être moins bien servi. C'est le contraire d'un
 * achat.
 *
 * La règle est donc : L'ACHAT RETIRE LA VIDÉO, PAS LA RÉCOMPENSE. Les boutons
 * restent en place, la récompense tombe immédiatement, et rien ne se joue.
 *
 * Une seule ligne suffit dans `showRewarded` parce que les trente et un points
 * d'appel du jeu passent tous par elle. C'est aussi la raison pour laquelle le
 * défaut a pu vivre si longtemps sans se voir : il n'était visible nulle part
 * en particulier.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Le bonus est-il acquis sans rien regarder ? (achat « Sans pub » effectué) */
export function bonusOffert(): boolean {
  return adsRemoved;
}

/** Libellé français d'un bouton de bonus, selon qu'il coûte une vidéo ou non. */
export function bonusFr(base: string): string {
  return adsRemoved ? `✨ ${base}` : `🎬 ${base} (pub)`;
}

/** Idem en anglais. */
export function bonusEn(base: string): string {
  return adsRemoved ? `✨ ${base}` : `🎬 ${base} (ad)`;
}

/**
 * `exempt` : la seconde chance à la mort échappe au plafond. C'est le meilleur
 * emplacement du jeu, une vidéo restaure bien mieux une perte qu'elle
 * n'offre un gain, et il est déjà limité à une fois par partie. Le priver
 * parce que le joueur a doublé trois gains dans la journée serait absurde.
 */
export async function showRewarded(opts?: { exempt?: boolean; famille?: FamilleBonus }): Promise<boolean> {
  /*
   * L'achat retire la vidéo, pas la récompense, voir le pavé plus haut.
   * Mais il ne retire pas la LIMITE : le compteur d'actions repart à zéro,
   * et il faudra rejouer trois actions avant le bonus suivant.
   *
   * `exempt` est honoré ici comme ailleurs : ce que le joueur vient chercher
   * lui-même, rouvrir la boutique, la distribution du jour, se relever à la
   * mort, n'entame pas sa cadence. Barrer un service qu'on est venu demander
   * serait une punition, pas une limite.
   */
  if (adsRemoved) {
    if (!opts?.exempt && opts?.famille) engagements[opts.famille] = 0;
    return true;
  }

  if (!opts?.exempt) offresFaites++;
  if (!isNative()) {
    // En dev/web, on considère la récompense acquise pour pouvoir tester.
    return true;
  }
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareRewardVideoAd({
      adId: unit('rewarded'),
      isTesting: USE_TEST_ADS,
      // Refus, ou consentement inconnu : publicité NON personnalisée.
      // Sans cette ligne, le formulaire de consentement ne servirait à rien.
      npa: !personalizedAdsAllowed(),
    });
    const reward = await AdMob.showRewardVideoAd();
    // Une récompense valide a un type et une quantité.
    return !!reward && reward.amount !== undefined;
  } catch (e) {
    console.warn('[ads] showRewarded:', e);
    return false;
  }
}

/*
 * PRISE DE MESURE : même raison que celle de `sound.ts`.
 *
 * Le défaut que ce module vient de corriger, « Sans pub » qui emportait les
 * bonus, était invisible : trente et un points d'appel, tous corrects pris
 * un par un, et une règle fausse au centre. Rien à l'écran ne pouvait le dire.
 * `scripts/test-bonus-pub.mjs` interroge donc la règle elle-même, sur le
 * BUILD DE PRODUCTION, seul état qui prouve quelque chose.
 *
 * Rien ici ne fait ce qu'un joueur ne peut déjà faire : lire son propre
 * réglage, ou consommer une offre qu'il aurait de toute façon consommée.
 */
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__pub = {
    canOfferRewarded, showRewarded, bonusFr, bonusEn, bonusOffert,
    isAdsRemoved, setAdsRemoved, noterEngagement, engagementsAvantBonus,
    isAtelierOwned, setAtelierOwned, packUtile,
    verdictInterstitiel, showInterstitial, enTreve, resteDeTreve, reinitialiserTreve,
  };
}
