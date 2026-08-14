/*
 * RÉCHAUFFER LES IMAGES AVANT QU'ON EN AIT BESOIN.
 *
 * Chaque illustration pèse une centaine de kilo-octets et n'était demandée
 * qu'au moment de l'afficher. Le joueur touchait une action, l'écran de
 * résultat s'ouvrait, et l'image arrivait après — plusieurs secondes sur une
 * connexion mobile, à chaque fois.
 *
 * Or on sait à l'avance ce qui va s'afficher. Depuis l'écran principal, les
 * six actions ne peuvent mener qu'à un petit jeu d'images de résultat, et le
 * décor du quartier courant est certain. On les demande donc pendant que le
 * joueur lit son écran, au lieu d'attendre qu'il ait choisi.
 *
 * Deux précautions. Le navigateur garde ces images en cache : une URL déjà
 * réchauffée ne l'est pas deux fois. Et on ne réchauffe QUE des images que le
 * joueur va probablement voir dans la minute — précharger les mille images du
 * jeu ferait exactement le mal qu'on cherche à éviter.
 */

const dejaVues = new Set<string>();

/** Demande les images en arrière-plan, sans bloquer ni rien afficher. */
export function precharger(urls: (string | undefined | null)[]): void {
  if (typeof window === 'undefined') return;
  for (const url of urls) {
    if (!url || dejaVues.has(url)) continue;
    dejaVues.add(url);
    const img = new Image();
    // Basse priorité : ces images ne sont pas encore à l'écran, elles ne
    // doivent pas passer devant celle que le joueur regarde en ce moment.
    img.fetchPriority = 'low';
    img.decoding = 'async';
    img.src = url;
  }
}

/*
 * Les images de résultat des six actions. Elles sont peu nombreuses et
 * reviennent à chaque partie : c'est le meilleur rapport entre le poids
 * préchargé et le nombre de fois où l'attente est évitée.
 */
const RESULTATS_ACTIONS = [
  '/assets/result-beg-police.webp',
  '/assets/result-steal-success.webp',
  '/assets/result-steal-fail.webp',
  '/assets/result-steal-police.webp',
  '/assets/result-objet-utilise.webp',
  '/assets/result-objet-vendu.webp',
  '/assets/result-recup-vide.webp',
  '/assets/result-cadeau-carton.webp',
];

/** À appeler quand l'écran principal s'installe. */
export function prechargerActions(location: string): void {
  precharger([...RESULTATS_ACTIONS, `/assets/scene-${location}.webp`]);
}
