/*
 * LA FACTURATION GOOGLE PLAY — l'argent réel, enfin branché.
 *
 * Jusqu'ici, `purchaseRemoveAds()` faisait `setAdsRemoved(true); return true`.
 * Autrement dit : les trois produits du jeu s'ouvraient GRATUITEMENT à qui
 * appuyait sur le bouton. C'était voulu pendant qu'on construisait le reste —
 * on ne branche pas une caisse sur un magasin qui n'existe pas — mais c'est
 * évidemment la dernière chose à corriger avant de publier.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POURQUOI cordova-plugin-purchase ET PAS AUTRE CHOSE
 *
 * Le commentaire qu'on remplace citait `@capacitor-community/in-app-purchases`.
 * Ce paquet N'EXISTE PAS sur npm (404) — c'était une piste écrite de mémoire,
 * jamais vérifiée. Deux candidats réels :
 *
 *   · RevenueCat (`@revenuecat/purchases-capacitor`). Excellent, mais il
 *     impose un compte tiers, une clé d'API, et un serveur dans la boucle. Et
 *     surtout : ses versions récentes exigent Capacitor 8 ; la dernière
 *     compatible avec le Capacitor 6 du projet est la 9, plus ancienne.
 *
 *   · cordova-plugin-purchase 13.18. Autonome, aucun compte à créer, et il
 *     embarque la Google Play Billing Library 9.0.0 — la version courante.
 *     Capacitor charge les greffons Cordova nativement, sans adaptateur.
 *
 * D'où le choix. Une conséquence : la Billing Library 9 réclame
 * minSdkVersion 23, contre 22 dans le projet. On abandonne Android 5.1, que
 * plus personne n'utilise ; c'est écrit dans android/variables.gradle.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DEUX RÈGLES DE SÉCURITÉ, ET ELLES NE SONT PAS SYMÉTRIQUES
 *
 * ① ON N'OUVRE JAMAIS UN ACCÈS SANS LE MAGASIN. Sur le web, il n'y a pas de
 *   facturation : `acheter()` échoue, franchement, plutôt que d'offrir le
 *   produit. C'est exactement le défaut qu'on corrige.
 *
 * ② ON NE REFERME JAMAIS UN ACCÈS DÉJÀ OUVERT. Le magasin peut répondre
 *   « rien » pour des raisons qui n'ont rien à voir avec l'achat : hors
 *   ligne, service Play en panne, compte Google momentanément déconnecté. Si
 *   on recopiait cette réponse telle quelle, un client qui a payé perdrait ce
 *   qu'il a acheté parce qu'il a pris le métro. Le magasin ne peut donc
 *   qu'AJOUTER un droit, jamais en retirer un.
 *
 *   Le prix à payer est connu et assumé : un remboursement ne referme pas
 *   l'accès. Pour un jeu à trois euros, se tromper dans ce sens-là est
 *   infiniment moins grave que dans l'autre.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ET L'ACQUITTEMENT, QU'ON OUBLIE TOUJOURS
 *
 * Google exige qu'un achat soit ACQUITTÉ dans les trois jours. Passé ce
 * délai, il est remboursé d'office et le joueur perd son produit — sans que
 * rien, nulle part, n'ait signalé d'erreur. C'est `transaction.finish()` qui
 * acquitte, dans le gestionnaire `approved` ci-dessous. Cette ligne-là n'est
 * pas un détail d'implémentation : c'est elle qui fait que l'argent arrive.
 */

import { Capacitor } from '@capacitor/core';

/** Les trois produits, tels qu'ils seront créés dans la Play Console. */
export type Produit = 'noads' | 'atelier' | 'pack_complet';
export const PRODUITS: Produit[] = ['noads', 'atelier', 'pack_complet'];

/*
 * LES PRIX DE SECOURS, ET POURQUOI CE SONT DES SECOURS.
 *
 * Le vrai prix vient du magasin, converti dans la monnaie du joueur : un
 * Canadien ne voit pas « 2,99 € ». Ces chaînes-ci ne servent donc que le
 * temps où le magasin n'a pas encore répondu, et sur le web où il n'existe
 * pas. Elles doivent rester alignées sur docs/design/prix.md.
 */
const PRIX_DE_SECOURS: Record<Produit, string> = {
  noads: '2,99 €',
  atelier: '4,99 €',
  pack_complet: '6,99 €',
};

/** Ce que le magasin a fini par dire, pour l'écran des Options. */
export interface EtatMagasin {
  /** Le magasin a répondu et les produits sont connus. */
  pret: boolean;
  /** Aucun magasin joignable (web, ou échec d'initialisation). */
  indisponible: boolean;
}

let pret = false;
let indisponible = !Capacitor.isNativePlatform();
const prix: Partial<Record<Produit, string>> = {};

export function etatMagasin(): EtatMagasin {
  return { pret, indisponible };
}

/** Le prix à afficher pour un produit : celui du magasin, sinon le secours. */
export function prixAffiche(p: Produit): string {
  return prix[p] ?? PRIX_DE_SECOURS[p];
}

/*
 * LE MAGASIN RÉPOND APRÈS L'ÉCRAN.
 *
 * Les prix arrivent de Google une à deux secondes après le lancement. Un
 * écran d'options ouvert entre-temps afficherait les prix de secours et ne
 * les corrigerait jamais — un Canadien y lirait « 2,99 € » pour toujours.
 * D'où cet abonnement : l'écran se redessine quand le magasin a parlé.
 */
const abonnes = new Set<() => void>();
export function surMagasinChange(cb: () => void): () => void {
  abonnes.add(cb);
  return () => abonnes.delete(cb);
}
function prevenir(): void {
  abonnes.forEach(cb => { try { cb(); } catch { /* un écran démonté */ } });
}

/*
 * CE QUE LE JEU FAIT D'UN ACHAT.
 *
 * La facturation ne connaît pas le jeu : elle lui rend un identifiant de
 * produit, et c'est `ads.ts` qui sait ce que ça ouvre. On lui laisse donc
 * poser sa fonction ici plutôt que d'importer `ads.ts` — sans quoi les deux
 * modules s'importeraient l'un l'autre.
 */
type Livraison = (p: Produit) => boolean;
let livrer: Livraison = () => false;
/**
 * `f` rend `true` si l'achat a réellement ouvert quelque chose de nouveau.
 * C'est ce booléen qui permet à la restauration de distinguer « j'ai retrouvé
 * un achat » de « le magasin a répondu, et il n'y avait rien ».
 */
export function brancherLivraison(f: Livraison): void {
  livrer = f;
}

/*
 * LES COMMANDES EN COURS.
 *
 * `store.order()` ne rend pas le résultat de l'achat : il ouvre la fenêtre de
 * Google et rend la main. Le verdict arrive plus tard, dans un gestionnaire
 * d'événement. On garde donc, par produit, la promesse à résoudre quand il
 * tombe — et un minuteur, parce qu'un joueur qui ferme la fenêtre de paiement
 * d'un geste ne produit pas toujours d'événement.
 */
const enCours = new Map<Produit, { resoudre: (ok: boolean) => void; minuteur: number }>();

function conclure(p: Produit, ok: boolean): void {
  const attente = enCours.get(p);
  if (!attente) return;
  clearTimeout(attente.minuteur);
  enCours.delete(p);
  attente.resoudre(ok);
}

/** Le magasin du greffon Cordova, présent seulement dans l'application. */
function magasin(): typeof CdvPurchase.store | null {
  const g = globalThis as unknown as { CdvPurchase?: typeof CdvPurchase };
  return g.CdvPurchase?.store ?? null;
}

let demarre = false;

/**
 * Ouvre la connexion au magasin, déclare les trois produits, et rétablit ce
 * qui a déjà été payé. À appeler une fois au démarrage.
 *
 * Ne lève jamais : un magasin injoignable laisse le jeu parfaitement jouable,
 * simplement sans possibilité d'acheter.
 */
export async function initFacturation(): Promise<void> {
  if (demarre) return;
  demarre = true;
  if (!Capacitor.isNativePlatform()) return;

  /*
   * LE GREFFON ARRIVE APRÈS NOUS.
   *
   * `deviceready` est l'événement de Cordova : les greffons ne sont branchés
   * qu'après. Appeler `store.register()` avant, c'est appeler `undefined` — et
   * comme on avale les erreurs pour ne pas casser le jeu, ça donnerait un
   * magasin silencieusement mort. On attend donc, avec une limite : si
   * l'événement n'arrive jamais, mieux vaut un magasin indisponible qu'un
   * démarrage bloqué.
   */
  if (!magasin()) {
    await new Promise<void>(resoudre => {
      const fini = () => { clearTimeout(minuteur); document.removeEventListener('deviceready', fini); resoudre(); };
      const minuteur = window.setTimeout(fini, 8000);
      document.addEventListener('deviceready', fini);
    });
  }

  const store = magasin();
  if (!store) {
    console.warn('[facturation] greffon absent : achats indisponibles');
    indisponible = true;
    prevenir();
    return;
  }

  try {
    const { ProductType, Platform } = (globalThis as unknown as { CdvPurchase: typeof CdvPurchase }).CdvPurchase;

    store.register(PRODUITS.map(id => ({
      id,
      type: ProductType.NON_CONSUMABLE,
      platform: Platform.GOOGLE_PLAY,
    })));

    store.when()
      /*
       * APPROUVÉ = PAYÉ. C'est ici qu'on livre, et SURTOUT qu'on acquitte :
       * sans `finish()`, Google rembourse tout seul au bout de trois jours.
       */
      .approved(t => {
        for (const article of t.products) appliquer(article.id);
        void t.finish();
      })
      .finished(t => {
        for (const article of t.products) conclure(article.id as Produit, true);
      })
      /*
       * Le prix affiché vient du magasin, pas de nos chaînes en dur : Google
       * le convertit dans la monnaie du joueur, taxes locales comprises.
       */
      .productUpdated(produit => {
        if (produit.pricing?.price) {
          prix[produit.id as Produit] = produit.pricing.price;
          prevenir();
        }
      })
      /*
       * TOUS LES REÇUS SONT LÀ : c'est le moment de rendre au joueur ce qu'il
       * a déjà payé — sur un téléphone neuf, après une réinstallation, ou
       * simplement au lancement suivant.
       */
      .receiptsReady(() => {
        pret = true;
        appliquerLesPossessions(store);
        prevenir();
      });

    const erreurs = await store.initialize([Platform.GOOGLE_PLAY]);
    if (erreurs.length) {
      console.warn('[facturation] initialisation partielle :', erreurs);
    }
    indisponible = false;
  } catch (e) {
    console.warn('[facturation] magasin injoignable :', e);
    indisponible = true;
  }
  prevenir();
}

/**
 * Ce que le magasin dit posséder devient un droit dans le jeu.
 * Rend `true` si au moins un droit s'est ouvert qui ne l'était pas.
 */
function appliquerLesPossessions(store: typeof CdvPurchase.store): boolean {
  let ouvert = false;
  for (const p of PRODUITS) {
    try {
      if (store.owned(p) && appliquer(p)) ouvert = true;
    } catch { /* un produit inconnu du magasin n'est pas une erreur */ }
  }
  return ouvert;
}

function appliquer(id: string): boolean {
  return (PRODUITS as string[]).includes(id) ? livrer(id as Produit) : false;
}

/**
 * Lance l'achat d'un produit. Rend `true` seulement si Google a confirmé le
 * paiement — jamais par défaut, jamais par optimisme.
 */
export async function acheter(p: Produit): Promise<boolean> {
  const store = magasin();
  if (!store) return false;

  const produit = store.get(p);
  const offre = produit?.getOffer();
  if (!offre) {
    console.warn(`[facturation] produit « ${p} » absent du magasin`);
    return false;
  }

  // Une commande déjà en vol : on ne la double pas.
  if (enCours.has(p)) return false;

  const verdict = new Promise<boolean>(resoudre => {
    /*
     * DEUX MINUTES, PUIS ON REND LA MAIN.
     *
     * Fermer la feuille de paiement d'un balayage ne produit pas toujours
     * d'événement. Sans minuteur, le bouton tournerait indéfiniment et le
     * joueur croirait l'application figée. Rendre `false` ne perd rien : si le
     * paiement aboutit malgré tout, `approved` livrera le produit de son côté.
     */
    const minuteur = window.setTimeout(() => conclure(p, false), 120_000);
    enCours.set(p, { resoudre, minuteur });
  });

  const erreur = await store.order(offre);
  if (erreur) {
    console.warn('[facturation] commande refusée :', erreur);
    conclure(p, false);
  }
  return verdict;
}

/**
 * Redemande au compte Google ce qu'il possède.
 *
 * `retrouve` ne dit pas « le magasin a répondu », il dit « quelque chose s'est
 * rouvert ». Un joueur qui n'a jamais rien acheté doit lire « aucun achat »,
 * pas « restauré ».
 */
export async function restaurer(): Promise<{ retrouve: boolean; indisponible: boolean }> {
  const store = magasin();
  if (!store) return { retrouve: false, indisponible: true };
  try {
    const erreur = await store.restorePurchases();
    if (erreur) return { retrouve: false, indisponible: true };
    /*
     * On interroge la POSSESSION, pas le résultat du rejeu : `restorePurchases`
     * ne rend rien, il repasse les transactions dans les gestionnaires. C'est
     * `store.owned()` qui dit la vérité juste après.
     */
    return { retrouve: appliquerLesPossessions(store), indisponible: false };
  } catch (e) {
    console.warn('[facturation] restauration impossible :', e);
    return { retrouve: false, indisponible: true };
  }
}
