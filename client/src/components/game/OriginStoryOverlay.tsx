import { useVerrouScroll } from '@/lib/verrouScroll';
import { useGame, generateOrigin } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { playCard, playPage } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import SceneIllustration from './SceneIllustration';
import SafeImg from './SafeImg';
import PlayerFace from './PlayerFace';

/*
 * Récit d'origine « La Chute de… » : carte d'intro montrée UNE fois au départ
 * de chaque partie (drapeau 'origin-vu' posé à la fermeture). Le texte est
 * généré depuis le métier + les traits (voir data/backstory.ts). L'image :
 * l'illustration dédiée du métier si elle existe (le perso « encore
 * présentable », juste avant la rue), sinon une scène de rue dessinée.
 */
export default function OriginStoryOverlay() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  /*
   * LE RÉCIT ARRIVE AVANT LA PREMIÈRE ACTION.
   *
   * Il avait été repoussé après le premier geste, pour raccourcir le chemin
   * entre le lancement et la première décharge : neuf écrans étaient devenus
   * trois. Mais à l'essai, le décalage se remarque — on choisit un personnage,
   * on agit, et le jeu explique seulement ensuite qui on est. La question
   * « pourquoi je suis là ? » arrive naturellement au moment où on découvre le
   * personnage, pas une action plus tard.
   *
   * On revient donc au départ, en gardant le reste du raccourcissement : le
   * récit est un écran de plus, mais il est à sa place.
   */
  const visible = !!char
    && state.screen === 'main'
    // Le résultat d'une action passe d'abord : quand les deux tombent au même
    // instant, le récit se posait par-dessus le butin qu'on venait de faire.
    && !state.eventResult
    && !char.activeFlags?.includes('origin-vu');
  // Froissement de vieux papier quand le récit se déplie (hook AVANT tout
  // retour anticipé : l'ordre des hooks doit rester stable).
  useEffect(() => { if (visible) playPage(); }, [visible]);
  useVerrouScroll(visible);
  if (!char || !visible) return null;

  const story = generateOrigin(char);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 overlay-backdrop"
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 340 }}
          className="craft-card-solid p-5 max-w-sm w-full"
        >
          {/* Illustration : image dédiée du métier, sinon scène de rue */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.05 }}
            className="relative w-full h-40 rounded-xl overflow-hidden mb-4 shadow-[0_3px_12px_rgba(58,42,30,0.15)]"
          >
            <SceneIllustration theme="street" mood="bad" className="absolute inset-0 w-full h-full" sway />
            <SafeImg src={`/assets/origin-${char.job.id}.webp`} className="absolute inset-0 w-full h-full object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            {/* Le visage carton du personnage, coin bas-gauche */}
            <div className="absolute bottom-2 left-2 w-12 h-12 rounded-lg overflow-hidden border-2 border-white/80 shadow-md">
              <PlayerFace char={char} size={48} />
            </div>
            <span className="absolute top-2 right-2 text-2xl drop-shadow">{char.job.emoji}</span>
          </motion.div>

          {/* Titre */}
          <h2 className="text-xl text-[#2A1F1A] text-center leading-tight">
            {tr(story.titleFr, story.titleEn)}
          </h2>
          <p className="text-[11px] text-[#8B6B4A] text-center mb-3 mt-0.5">
            {char.job.emoji} {tc(char.job.name)}
          </p>

          {/* Le récit */}
          <p className="text-sm text-[#3D3020] leading-relaxed mb-4 text-center italic">
            « {tr(story.textFr, story.textEn)} »
          </p>

          <p className="text-[11px] text-[#A08B70] text-center mb-4">
            {tr('Aujourd\'hui, il ne reste que le carton. Et vous.', 'Today, only the cardboard is left. And you.')}
          </p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { playCard(); dispatch({ type: 'DISMISS_ORIGIN' }); }}
            className="btn-primary w-full py-3 text-sm"
          >
            {tr('Commencer à survivre', 'Start surviving')}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
