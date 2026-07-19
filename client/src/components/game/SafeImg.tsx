import { useState } from 'react';

/*
 * Image « sûre » : s'affiche si le fichier existe, disparaît sans bruit sinon.
 * Sert à poser des emplacements d'illustrations livrées au fil de l'eau :
 * tant que le fichier n'est pas là, l'interface (ou la scène dessinée en
 * dessous) reste seule visible, rien ne casse.
 */
export default function SafeImg({ src, className, alt = '' }: { src: string; className?: string; alt?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src={src} alt={alt} className={className} onError={() => setOk(false)} loading="lazy" />;
}
