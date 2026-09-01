/*
 * CE QUI SÈCHE SUR L'ÉTABLI.
 *
 * L'Atelier s'essaie librement : on compose, et le paiement tombe au moment de
 * valider. Quand ce paiement n'aboutit pas, la partie démarre quand même avec
 * le personnage tel qu'il s'est présenté, et la composition était jusqu'ici
 * jetée sur-le-champ.
 *
 * C'est ce qu'il y avait de plus honnête tant qu'on ne savait pas quoi en
 * faire. Mais une tâche interrompue occupe l'esprit bien plus qu'une tâche
 * jamais commencée, et celle-ci l'est vraiment : quelqu'un a passé quarante
 * secondes sur une tête, il connaît sa couleur d'yeux, et le jeu l'a effacée
 * pendant qu'il regardait ailleurs.
 *
 * On la garde donc, et surtout ON LA REND. Le visage a été composé sur le
 * personnage que le joueur a fini par emmener, la graine est la même : payer
 * l'Atelier plus tard le repose sur SON personnage, celui qui est vivant à
 * l'écran. Ce n'est pas un teaser, c'est la chose elle-même, livrée en retard.
 *
 * TROIS GARDE-FOUS, PARCE QUE C'EST LE GENRE DE MÉCANIQUE QUI DÉRAPE.
 *
 *   ① LE VISAGE SEUL. Les traits choisis pendant l'essai ne sont PAS gardés :
 *     ils touchent aux règles, et les changer au milieu d'une partie déjà
 *     entamée réécrirait après coup la difficulté de cette partie. On rend ce
 *     qu'on vendait, c'est-à-dire la tête.
 *
 *   ② L'ÉTIQUETTE DU HUB NE PARAÎT QU'UNE FOIS DANS LA VIE DU JEU. Écartée,
 *     elle ne revient jamais, même pour une nouvelle composition abandonnée.
 *     Un rappel est utile, trois sont du harcèlement, et le Play Store s'en
 *     souvient plus longtemps que la conversion.
 *
 *   ③ RIEN NE SURVIT À LA MORT DU PERSONNAGE. La graine change, le visage ne
 *     correspond plus à personne : l'établi se vide de lui-même à la lecture
 *     plutôt que de garder une promesse qu'on ne peut plus tenir.
 */

const CLE = 'roi-du-carton-etabli';
const CLE_ECARTEE = 'roi-du-carton-etabli-ecartee';

export interface Etabli {
  /** La graine du personnage sur lequel la composition a été faite. */
  seed: string;
  /** Son prénom, pour que l'étiquette parle de quelqu'un et pas d'un objet. */
  nom: string;
  /** 'f' ou 'm' : l'étiquette s'accorde, comme partout ailleurs dans le jeu. */
  genre: 'm' | 'f';
  visage: Record<string, number>;
}

export function poserSurEtabli(e: Etabli): void {
  if (!e.seed || !e.visage || Object.keys(e.visage).length === 0) return;
  try { localStorage.setItem(CLE, JSON.stringify(e)); } catch { /* silent */ }
}

export function cequiSeche(): Etabli | null {
  try {
    const e = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (!e || typeof e.seed !== 'string' || !e.visage) return null;
    return e as Etabli;
  } catch { return null; }
}

export function viderEtabli(): void {
  try { localStorage.removeItem(CLE); } catch { /* silent */ }
}

/**
 * Ce qui sèche, à condition que ce soit encore la tête de QUELQU'UN. Une
 * graine qui ne correspond plus au personnage vivant est une promesse morte :
 * on la retire au lieu de l'afficher.
 */
export function cequiSechePour(seed: string | undefined): Etabli | null {
  const e = cequiSeche();
  if (!e) return null;
  if (!seed) return e;
  if (e.seed !== seed) { viderEtabli(); return null; }
  return e;
}

export function etiquetteEcartee(): boolean {
  try { return localStorage.getItem(CLE_ECARTEE) === '1'; } catch { return false; }
}

export function ecarterEtiquette(): void {
  try { localStorage.setItem(CLE_ECARTEE, '1'); } catch { /* silent */ }
}
