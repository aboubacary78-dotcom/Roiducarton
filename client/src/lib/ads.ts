/*
 * LE ROI DU CARTON — Service de publicités (AdMob)
 *
 * Cette couche centralise toute la logique des pubs Google AdMob.
 * - Sur mobile (Android/iOS via Capacitor) : vraies publicités.
 * - Sur le web (navigateur, dev) : tout est en "no-op" et résout
 *   immédiatement, pour ne jamais bloquer ni casser le jeu pendant
 *   le développement.
 *
 * IMPORTANT — avant publication sur les stores :
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

let initialized = false;

/**
 * Initialise le SDK AdMob. À appeler une seule fois au démarrage de l'app.
 * Sur le web, ne fait rien.
 */
export async function initAds(): Promise<void> {
  if (!isNative() || initialized) return;
  try {
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
  if (!isNative()) return;
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: unit('banner'),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: USE_TEST_ADS,
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
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({
      adId: unit('interstitial'),
      isTesting: USE_TEST_ADS,
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
export async function showRewarded(): Promise<boolean> {
  if (!isNative()) {
    // En dev/web, on considère la récompense acquise pour pouvoir tester.
    return true;
  }
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareRewardVideoAd({
      adId: unit('rewarded'),
      isTesting: USE_TEST_ADS,
    });
    const reward = await AdMob.showRewardVideoAd();
    // Une récompense valide a un type et une quantité.
    return !!reward && reward.amount !== undefined;
  } catch (e) {
    console.warn('[ads] showRewarded:', e);
    return false;
  }
}
