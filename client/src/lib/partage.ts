/*
 * LE PARTAGE DE LA UNE.
 *
 * L'écran de mort produit une une de journal illustrée, avec le nom du
 * personnage, la cause de sa mort et le nombre de jours tenus. C'est un objet
 * de partage idéal (spécifique, drôle, différent à chaque fois) et rien ne
 * permettait de l'envoyer.
 *
 * Deux règles tiennent ce fichier :
 *
 * 1. ON NE PROPOSE PAS À CHAQUE MORT. Un partage proposé systématiquement
 *    n'est plus proposé, il est subi, et le joueur apprend à ignorer le
 *    bouton. On ne le montre que sur les morts qui valent le coup d'œil :
 *    une fin inédite, un record battu, ou une des morts remarquables.
 *
 * 2. LA RÉCOMPENSE EST QUOTIDIENNE, PAS PAR PARTAGE. Sinon il suffirait de
 *    mourir en boucle pour faire du Karma, et le partage deviendrait une
 *    corvée à farmer plutôt qu'une envie.
 */
import { Capacitor } from '@capacitor/core';

const JOUR_KEY = 'roi-du-carton-partage-jour';

/** Cette mort mérite-t-elle qu'on propose de la montrer ? */
export function worthSharing(opts: {
  newEndings: number;
  day: number;
  bestDay: number;
  money: number;
  crowned?: boolean;
}): boolean {
  if (opts.newEndings > 0) return true;          // une fin inédite se montre
  if (opts.day > opts.bestDay) return true;      // un record battu aussi
  if (opts.day <= 1) return true;                // mourir le premier jour est une performance
  if (opts.day >= 10) return true;               // dix jours de règne, forcément
  if (opts.money >= 30) return true;             // riche et mort quand même
  return !!opts.crowned;
}

/** Le Karma du partage n'est dû qu'une fois par jour calendaire. */
export function shareRewardAvailable(now = new Date()): boolean {
  try {
    const p = (n: number) => String(n).padStart(2, '0');
    const jour = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
    return localStorage.getItem(JOUR_KEY) !== jour;
  } catch { return false; }
}

export function markShareRewarded(now = new Date()): void {
  try {
    const p = (n: number) => String(n).padStart(2, '0');
    localStorage.setItem(JOUR_KEY, `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`);
  } catch { /* silent */ }
}

/**
 * Transforme le bloc de la une en image, puis l'envoie par le partage natif.
 * Renvoie `true` si le partage est réellement parti.
 *
 * Sur le web, on passe par l'API de partage du navigateur quand elle existe ;
 * sinon on ouvre l'image dans un onglet, ce qui reste utilisable.
 */
export async function shareFrontPage(node: HTMLElement, texte: string): Promise<boolean> {
  let dataUrl: string;
  try {
    const { toPng } = await import('html-to-image');
    dataUrl = await toPng(node, {
      pixelRatio: 2,
      // Le fond du journal doit être opaque : sans ça, l'image partagée
      // arrive en transparence sur fond noir dans la plupart des messageries.
      backgroundColor: '#F4EBD8',
      cacheBust: true,
    });
  } catch {
    return false;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const [{ Share }, { Filesystem, Directory }] = await Promise.all([
        import('@capacitor/share'),
        import('@capacitor/filesystem'),
      ]);
      const nom = `gazette-${Date.now()}.png`;
      const written = await Filesystem.writeFile({
        path: nom,
        data: dataUrl.split(',')[1],
        directory: Directory.Cache,
      });
      await Share.share({ text: texte, files: [written.uri] });
      return true;
    } catch {
      // Partage refusé, annulé, ou module absent : on ne fait pas semblant.
      return false;
    }
  }

  // Web : l'API de partage si elle accepte les fichiers, sinon un onglet.
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'gazette.png', { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ text: texte, files: [file] });
      return true;
    }
    window.open(dataUrl, '_blank');
    return true;
  } catch {
    return false;
  }
}
