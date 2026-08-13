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

/**
 * Lance l'achat "Sans pub". Renvoie true si l'achat a réussi.
 *
 * ⚠️ PRODUCTION : brancher ici un vrai achat in-app (RevenueCat ou
 * @capacitor-community/in-app-purchases) avec un produit non consommable
 * « remove_ads », puis appeler setAdsRemoved(true) seulement après confirmation.
 * En l'état, la fonction active directement le mode sans pub (placeholder de
 * démonstration), À REMPLACER avant publication (voir STORE_PUBLISHING.md).
 */
export async function purchaseRemoveAds(): Promise<boolean> {
  setAdsRemoved(true);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────
// Configuration des blocs d'annonces
// Les ID ci-dessous sont les ID de TEST officiels de Google.
// Remplace-les par les tiens pour la production.
// ─────────────────────────────────────────────────────────────────────────
const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

/** Passe à false quand tu publies avec tes vrais ID AdMob. */
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
//      AdMob — d'où l'ordre : on demande le consentement AVANT d'initialiser
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
 * coupé, un formulaire abandonné — tous ces cas mènent à de la publicité non
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
export async function showInterstitial(): Promise<void> {
  if (adsRemoved || !isNative()) return;
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
 * voir un distributeur — et c'est la session SUIVANTE qu'on perd. Le compteur
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
 * qu'il vient chercher lui-même — relancer le trio de personnages, rouvrir une
 * boutique, la fontaine, la distribution solidaire — passe en `exempt` et
 * reste toujours disponible. Barrer un service qu'on est venu demander serait
 * une punition, pas une limite.
 */
export function canOfferRewarded(): boolean {
  return offresFaites < MAX_OFFRES_PAR_SESSION;
}

/**
 * `exempt` : la seconde chance à la mort échappe au plafond. C'est le meilleur
 * emplacement du jeu — une vidéo restaure bien mieux une perte qu'elle
 * n'offre un gain — et il est déjà limité à une fois par partie. Le priver
 * parce que le joueur a doublé trois gains dans la journée serait absurde.
 */
export async function showRewarded(opts?: { exempt?: boolean }): Promise<boolean> {
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
