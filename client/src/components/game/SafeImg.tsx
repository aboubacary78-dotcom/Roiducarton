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
 */
export default function SafeImg({
  src, className, alt = '', priority = false,
}: { src: string; className?: string; alt?: string; priority?: boolean }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setOk(false)}
      loading={priority ? 'eager' : 'lazy'}
      // @ts-expect-error — attribut standard, pas encore typé par React.
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
