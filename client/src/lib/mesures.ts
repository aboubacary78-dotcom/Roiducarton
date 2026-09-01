/*
 * CE QU'ON COMPTE, ET CE QU'ON N'ENVOIE NULLE PART.
 *
 * Sans mesure, docs/design/boutique.md n'est qu'une opinion bien écrite : on
 * ne saura jamais laquelle des cinq portes travaille, ni si l'essai libre
 * convertit, ni si la dégustation sert à autre chose qu'à faire plaisir.
 *
 * DEUX DÉCISIONS, ET LA SECONDE EST LA PLUS IMPORTANTE.
 *
 *   ① Les points de mesure sont posés MAINTENANT, dans le même geste que le
 *     code qu'ils observent. C'est la partie chère : retrouver plus tard les
 *     douze endroits exacts où il fallait compter demande de relire tout
 *     l'écran de vente. Le collecteur, lui, se remplace en une fonction.
 *
 *   ② RIEN NE SORT DE L'APPAREIL. Les compteurs vivent dans le localStorage
 *     du joueur, et personne ne les lit à part lui. Le jeu déclare dans sa
 *     politique de confidentialité qu'il n'embarque ni Analytics, ni Firebase,
 *     ni Sentry : brancher un envoi ici démentirait ce texte, obligerait à
 *     repasser par le formulaire de consentement, et changerait la déclaration
 *     de sécurité des données du Play Store. Le jour où l'on voudra vraiment
 *     un tableau de bord, `brancherMesures()` existe pour ça, et ce jour-là il
 *     faudra mettre à jour les trois documents avant la première ligne de code.
 *
 * Un compteur local n'est donc pas un pis-aller : c'est exactement ce qu'on a
 * le droit de faire aujourd'hui, et c'est déjà lisible sur son propre
 * téléphone après une semaine de parties.
 */

const CLE = 'roi-du-carton-mesures';

/** Les événements du plan de mesure. Un nom qui n'est pas là ne se compte pas. */
export type Mesure =
  | 'boutique_vue'
  | 'tuile_vue'
  | 'achat_lance'
  | 'achat_abouti'
  | 'atelier_essai_valide'
  | 'degustation_offerte'
  | 'achat_dans_les_10_min'
  | 'etabli_pose'
  | 'etabli_suivi'
  | 'cadeau_vendeur';

export type Compteurs = Record<string, number>;

/*
 * La clé est `nom` ou `nom:précision`. La précision est ce qui TRANCHE une
 * question : la provenance dit quelle porte travaille, le produit dit ce qu'on
 * regarde sans l'acheter. Deux dimensions sur le même événement donneraient un
 * tableau croisé qu'aucun de nous ne lira jamais sur un téléphone.
 */
function cle(nom: Mesure, precision?: string): string {
  return precision ? `${nom}:${precision}` : nom;
}

let sortie: ((nom: Mesure, precision?: string) => void) | null = null;

/**
 * Branche un collecteur externe. Rien n'appelle ça aujourd'hui, et c'est
 * volontaire, voir l'en-tête.
 */
export function brancherMesures(f: ((nom: Mesure, precision?: string) => void) | null): void {
  sortie = f;
}

export function lireMesures(): Compteurs {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) || '{}');
    return brut && typeof brut === 'object' ? brut as Compteurs : {};
  } catch { return {}; }
}

/**
 * Compte un événement. Ne lève jamais : une mesure qui casse un achat serait
 * une mesure qui coûte plus qu'elle ne rapporte.
 */
export function mesurer(nom: Mesure, precision?: string): void {
  try {
    const c = lireMesures();
    const k = cle(nom, precision);
    c[k] = (c[k] ?? 0) + 1;
    localStorage.setItem(CLE, JSON.stringify(c));
  } catch { /* stockage plein ou refusé : on continue */ }
  try { sortie?.(nom, precision); } catch { /* le collecteur ne fait pas tomber le jeu */ }
}

/*
 * LA PROVENANCE.
 *
 * Cinq portes mènent à la boutique, et « laquelle travaille » est la seule
 * question du document dont la réponse change ce qu'on construit ensuite. Le
 * `SET_SCREEN` ne transporte pas cette information, et l'y ajouter obligerait
 * chaque écran du jeu à connaître un champ qui ne le regarde pas. On la pose
 * donc juste avant de naviguer, et la boutique la ramasse au montage.
 */
export type PorteBoutique = 'hub' | 'mort' | 'interstitiel' | 'garde-robe' | 'options' | 'inconnue';
let porte: PorteBoutique = 'inconnue';

export function versLaBoutique(depuis: PorteBoutique): void { porte = depuis; }

/** Rend la provenance, et la consomme : un retour arrière ne la recompte pas. */
export function porteEmpruntee(): PorteBoutique {
  const p = porte;
  porte = 'inconnue';
  return p;
}

/*
 * LA DÉGUSTATION, ET LE SEUL CHIFFRE QUI VAILLE POUR ELLE.
 *
 * « Combien de trêves offertes » ne dit rien. « Combien d'achats DANS les dix
 * minutes qui ont suivi » dit tout : c'est la fenêtre où l'effet de dotation
 * agit, et un achat qui tombe trois jours plus tard n'en vient pas.
 */
const CLE_DEGUSTATION = 'roi-du-carton-degustation-a';

export function noterDegustation(maintenant = Date.now()): void {
  try { localStorage.setItem(CLE_DEGUSTATION, String(maintenant)); } catch { /* silent */ }
  mesurer('degustation_offerte');
}

/** À appeler à chaque achat abouti : compte celui qui suit une dégustation. */
export function noterAchatApresDegustation(fenetreMs: number, maintenant = Date.now()): void {
  try {
    const t = Number(localStorage.getItem(CLE_DEGUSTATION) || 0);
    if (t && maintenant - t <= fenetreMs) mesurer('achat_dans_les_10_min');
  } catch { /* silent */ }
}
