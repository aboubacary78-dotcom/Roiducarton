/*
 * L'ÉTIQUETTE DE LA TÊTE INACHEVÉE.
 *
 * Elle ne paraît que si trois choses sont vraies en même temps : un visage a
 * été composé pendant l'essai libre sans être payé, il appartient au
 * personnage actuellement vivant, et le joueur n'a pas encore écarté
 * l'étiquette. Voir `lib/etabli` pour ce qui est gardé et pourquoi.
 *
 * POURQUOI CETTE PHRASE-LÀ.
 *
 * La première version disait « une tête vous attend à l'Atelier ». C'est du
 * vocabulaire de gestionnaire : ça décrit un état, et une tête n'attend
 * personne. Il faut QUELQU'UN, et il faut qu'il lui manque quelque chose,
 * sinon rien ne tire.
 *
 * « Sèche » fait tout le travail de fabrication en un mot, la colle, le
 * feutre, le carton posé à plat, sans avoir à dire « en cours ». Et « il ne
 * lui manque que vous » est la seule chose vraie de la phrase : le visage
 * existe, la personne non.
 *
 * UNE FOIS DANS LA VIE DU JEU, et c'est la règle qui compte le plus. Écartée,
 * elle ne revient jamais, y compris pour une autre composition abandonnée.
 * Touchée, elle est également consommée : revoir la même étiquette après une
 * visite à la boutique, c'est réclamer, et une note du Play Store se souvient
 * de ça plus longtemps qu'une conversion.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { cequiSechePour, ecarterEtiquette, etiquetteEcartee } from '@/lib/etabli';
import { isAtelierOwned } from '@/lib/ads';
import { mesurer, versLaBoutique } from '@/lib/mesures';
import { playCard, playToggle } from '@/lib/sound';
import { tr } from '@/lib/lang';
import CardboardAvatar from './CardboardAvatar';

export default function EtiquetteEtabli() {
  const { state, dispatch } = useGame();
  const char = state.character;
  /*
   * L'état est figé au montage : lire le localStorage à chaque rendu du hub
   * ferait réapparaître l'étiquette entre deux actions, et disparaître celle
   * qu'on est en train de regarder au moment où on la touche.
   */
  const [etabli] = useState(() => (
    isAtelierOwned() || etiquetteEcartee() ? null : cequiSechePour(char?.seed)
  ));
  const [visible, setVisible] = useState(true);

  if (!etabli || !char) return null;

  const feminin = etabli.genre === 'f';

  const partir = () => {
    playCard();
    ecarterEtiquette();
    mesurer('etabli_suivi');
    versLaBoutique('hub');
    dispatch({ type: 'SET_SCREEN', screen: 'marche-noir' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="craft-card p-3 flex items-center gap-3"
        >
          {/*
            LE VISAGE COMPOSÉ, DESSINÉ À L'INSTANT.
            Une illustration générique à cet endroit dirait « quelqu'un » sans
            montrer personne. Celui-ci est exactement la tête que le joueur a
            fabriquée, et c'est tout l'argument.
          */}
          <div className="rounded-xl overflow-hidden shadow-sm shrink-0">
            <CardboardAvatar
              seed={etabli.seed}
              gender={etabli.genre}
              size={48}
              visage={etabli.visage}
              jauges={{ health: 100, mental: 100, hunger: 100, thirst: 100, sleep: 100 }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#2A1F1A] leading-tight">
              {tr('Quelqu\'un sèche sur l\'établi.', 'Someone is drying on the bench.')}
            </p>
            <p className="text-[11px] text-[#8B6B4A] leading-tight mt-0.5 italic">
              {tr('Il ne lui manque que vous.', 'All they lack is you.')}
            </p>
            <button
              onClick={partir}
              className="mt-2 text-[11px] font-semibold text-[#2A1F1A] px-3 py-1.5 rounded-lg active:scale-[0.98]"
              style={{ background: '#F2E14C', boxShadow: '0 2px 0 #C9B62A' }}
            >
              {feminin ? tr('Aller la chercher', 'Go and get her') : tr('Aller le chercher', 'Go and get him')}
            </button>
          </div>
          {/* Écarter est définitif, et c'est écrit dans `ecarterEtiquette`. */}
          <button
            onClick={() => { playToggle(); ecarterEtiquette(); setVisible(false); }}
            className="self-start w-7 h-7 rounded-lg flex items-center justify-center text-sm text-[#A08B70]"
            aria-label={tr('Écarter', 'Dismiss')}
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
