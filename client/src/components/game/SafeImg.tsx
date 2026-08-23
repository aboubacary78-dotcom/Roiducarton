import { useState } from 'react';

/*
 * Image « sûre » : s'affiche si le fichier existe, disparaît sans bruit sinon.
 * Sert à poser des emplacements d'illustrations livrées au fil de l'eau :
 * tant que le fichier n'est pas là, l'interface (ou la scène dessinée en
 * dessous) reste seule visible, rien ne casse.
 *
 * LE CHARGEMENT PARESSEUX ÉTAIT LE DÉFAUT PAR DÉFAUT, ET C'ÉTAIT UNE ERREUR.
 * Toutes les images passaient en `loading="lazy"`, y compris l'illustration
 * qui occupe le haut de l'écran au moment même où l'écran s'ouvre. Le
 * navigateur ne commençait donc à la télécharger qu'une fois la mise en page
 * faite : sur une image de cent kilo-octets, ça se voyait — quelques secondes
 * de vide avant que la scène apparaisse.
 *
 * `priority` marque les images qu'on voit tout de suite : téléchargement
 * immédiat, priorité haute, décodage hors du fil principal. Les autres — les
 * vignettes d'une liste qu'il faut faire défiler — restent paresseuses, c'est
 * là que le chargement différé sert vraiment.
 *
 * ON RETIENT L'IMAGE QUI A MANQUÉ, PAS « UNE IMAGE A MANQUÉ ».
 * L'échec était mémorisé dans un simple booléen. Or React réutilise la même
 * instance quand seule l'adresse change : une illustration absente condamnait
 * définitivement l'emplacement, et TOUTES les images affichées ensuite au même
 * endroit restaient invisibles — un fichier manquant en effaçait cent. En
 * gardant l'adresse fautive, l'oubli se limite exactement à celle-ci.
 */
export default function SafeImg({
  src, className, alt = '', priority = false,
}: { src: string; className?: string; alt?: string; priority?: boolean }) {
  const [manquante, setManquante] = useState<string | null>(null);
  if (manquante === src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setManquante(src)}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
