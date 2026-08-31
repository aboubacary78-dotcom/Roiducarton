/*
 * CE QU'ON PROPOSE APRÈS UN PLEIN ÉCRAN.
 *
 * Un onglet boutique ne convertit presque personne : pour y aller, il faut
 * avoir déjà décidé. Ce qui convertit, c'est de proposer la chose au moment
 * précis où elle manque, et pour « la paix », ce moment est unique et il
 * dure trois secondes : celui où le joueur vient de reprendre la main après
 * une publicité plein écran.
 *
 * Trois cartes, dans cet ordre, jamais deux dans la même session :
 *
 *   ① LE CADEAU. Au deuxième plein écran, dix minutes sans publicité, sans
 *     rien demander en échange. Ce n'est pas une réclame, c'est une
 *     dégustation : on ne vend pas la paix en la décrivant.
 *
 *   ② LA FIN DU CADEAU. Dix minutes plus tard, le jeu le dit. C'est CETTE
 *     carte qui vend, pas la première, une chose possédée puis retirée pèse
 *     environ le double d'une chose jamais eue.
 *
 *   ③ LE RAPPEL, une seule fois, pour qui n'a rien acheté après ça.
 *
 * ON NE PROPOSE JAMAIS RIEN APRÈS LE PREMIER PLEIN ÉCRAN. À ce moment-là, le
 * joueur n'a pas encore de raison de trouver la publicité pénible : lui vendre
 * une solution avant qu'il ait un problème, c'est lui apprendre qu'on en avait
 * fabriqué un.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { isAdsRemoved, surInterstitiel, resteDeTreve } from '@/lib/ads';
import { prixAffiche } from '@/lib/facturation';
import { playCard, playToggle } from '@/lib/sound';
import { tr } from '@/lib/lang';
import SafeImg from './SafeImg';

type Carte = 'cadeau' | 'fin-du-cadeau' | 'rappel';

export default function OffreDeLaRue() {
  const { dispatch } = useGame();
  const [carte, setCarte] = useState<Carte | null>(null);
  /*
   * Le rappel ne part qu'une fois par session, et seulement APRÈS la trêve :
   * proposer trois fois de suite ferait exactement ce qu'on essaie d'éviter.
   */
  const rappelFait = useRef(false);
  const minuteur = useRef<number | undefined>(undefined);

  useEffect(() => surInterstitiel(({ n, treveOfferte }) => {
    if (isAdsRemoved()) return;
    if (treveOfferte) {
      playCard();
      setCarte('cadeau');
      /*
       * LA FIN DE LA TRÊVE S'ANNONCE TOUTE SEULE.
       *
       * Elle ne peut pas attendre le plein écran suivant pour se signaler :
       * ce serait la publicité elle-même qui apprendrait au joueur que le
       * cadeau est terminé, et le geste perdrait tout son sens.
       */
      window.clearTimeout(minuteur.current);
      minuteur.current = window.setTimeout(() => {
        if (isAdsRemoved()) return;
        playCard();
        setCarte('fin-du-cadeau');
      }, resteDeTreve() + 400);
      return;
    }
    if (n > 2 && !rappelFait.current) {
      rappelFait.current = true;
      playCard();
      setCarte('rappel');
    }
  }), []);

  useEffect(() => () => window.clearTimeout(minuteur.current), []);

  if (!carte) return null;

  const fermer = () => { playToggle(); setCarte(null); };
  const versLaBoutique = () => {
    playToggle();
    setCarte(null);
    dispatch({ type: 'SET_SCREEN', screen: 'marche-noir' });
  };

  const contenu = {
    cadeau: {
      image: '/assets/boutique-degustation.webp',
      titre: tr('Dix minutes tranquilles.', 'Ten quiet minutes.'),
      texte: tr('Cadeau. On ne vous demande rien.', 'On the house. Nothing asked in return.'),
      action: null,
      fermeture: tr('Merci', 'Thanks'),
    },
    'fin-du-cadeau': {
      image: '/assets/boutique-paix.webp',
      titre: tr('C\'était ça, tout le temps.', 'That was it, all along.'),
      texte: tr('Les dix minutes sont finies.', 'The ten minutes are up.'),
      action: tr('Qu\'on me fiche la paix', 'Leave me alone'),
      fermeture: tr('Une autre fois', 'Another time'),
    },
    rappel: {
      image: '/assets/boutique-paix.webp',
      titre: tr('Encore un écran de perdu.', 'Another screen gone.'),
      texte: tr('Il y a moyen que ce soit le dernier.', 'There\'s a way to make it the last.'),
      action: tr('Voir', 'Have a look'),
      fermeture: tr('Non', 'No'),
    },
  }[carte];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-end justify-center p-4 bg-[#1A120C]/55"
        onClick={fermer}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md craft-card overflow-hidden"
        >
          <SafeImg src={contenu.image} alt="" priority className="w-full h-32 object-cover" />
          <div className="p-4">
            <h2 className="text-lg font-bold text-[#2A1F1A] leading-tight">{contenu.titre}</h2>
            <p className="text-sm text-[#6B5740] mt-1">{contenu.texte}</p>

            {contenu.action ? (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={fermer}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#6B5740] bg-[#EDE5DA] active:scale-[0.98]"
                >
                  {contenu.fermeture}
                </button>
                <button
                  onClick={versLaBoutique}
                  className="flex-[1.6] py-3 rounded-xl text-sm font-bold text-[#2A1F1A] active:scale-[0.98]"
                  style={{ background: '#F2E14C', boxShadow: '0 3px 0 #C9B62A' }}
                >
                  {contenu.action} · {prixAffiche('noads')}
                </button>
              </div>
            ) : (
              /*
               * LE CADEAU N'A PAS DE BOUTON D'ACHAT, ET C'EST TOUT SON INTÉRÊT.
               *
               * Un présent assorti d'une offre n'est pas un présent, c'est une
               * réclame, et ça se lit en une seconde. C'est la carte SUIVANTE,
               * dix minutes plus tard, qui a le droit de vendre.
               */
              <button
                onClick={fermer}
                className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-[#2A1F1A] bg-[#EDE5DA] active:scale-[0.98]"
              >
                {contenu.fermeture}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
