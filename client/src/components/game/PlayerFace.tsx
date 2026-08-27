/*
 * LE visage du personnage joué, rendu de la même façon PARTOUT.
 *
 * Le portrait carton dépend de trois choses : la graine du personnage, les
 * accessoires équipés dans la garde-robe, et son état (dérivé des jauges).
 * Quand un écran en oubliait une, le joueur voyait soudain une autre tête que
 * la sienne — sans casquette en plein combat, par exemple — et croyait
 * retrouver un ancien personnage. Un seul composant, plus de dérive possible.
 */
import type { Character } from '@/contexts/types';
import CardboardAvatar from './CardboardAvatar';

/** État général du personnage, de 0 (à l'agonie) à 1 (en pleine forme). */
export function faceCondition(char: Character): number {
  const s = char.stats;
  return (s.health + s.mental + s.hunger + s.thirst + s.sleep) / 500;
}

export default function PlayerFace({
  char,
  size = 40,
  className = '',
}: {
  char: Character;
  size?: number;
  className?: string;
}) {
  return (
    <CardboardAvatar
      seed={char.seed}
      gender={char.gender}
      size={size}
      className={className}
      // Sa tenue à lui : deux personnages successifs n'ont plus la même tête.
      accessories={char.equipped ?? {}}
      // Ce qui a été composé dans l'Atelier ; le reste vient de la graine.
      visage={char.visage}
      /*
       * LES CINQ JAUGES ENTIÈRES, PAS LEUR MOYENNE.
       *
       * `faceCondition` reste exportée — d'autres écrans s'en servent pour
       * autre chose — mais le portrait ne la reçoit plus : une moyenne ne
       * peut dire que la gravité, jamais la cause. Avec les jauges séparées,
       * le sommeil tombe sur les paupières, la faim creuse les joues, la soif
       * gerce les lèvres. On lit CE QUI manque.
       */
      jauges={char.stats}
      // Le second axe : la tenue, pilotée par la Dignité. Le corps et
      // l'allure se dégradent séparément, et c'est tout l'intérêt.
      dignity={char.stats.dignity}
    />
  );
}
