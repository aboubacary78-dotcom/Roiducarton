import { useGame, nomMetier, type Character } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PlayerFace from './PlayerFace';
import { useLang, tr, tc } from '@/lib/lang';
import { playBack, playCard, playPickCharacter, playReroll } from '@/lib/sound';
import { bonusEn, bonusFr, isAdsRemoved, isAtelierOwned, purchaseAtelier, showRewarded } from '@/lib/ads';
import AtelierOverlay from './AtelierOverlay';
import { pushToast } from '@/lib/toast';

function CharacterCard({ char, index, onSelect, onComposer }: {
  char: Character; index: number; onSelect: () => void;
  /** Ouvre l'Atelier en essai. Absent pour qui l'a acheté : choisir suffit. */
  onComposer?: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { playPickCharacter(); onSelect(); }}
      className="craft-card p-4 cursor-pointer"
    >
      {/* Character header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E8D5C0]">
          <PlayerFace char={char} size={48} />
        </div>
        <div>
          <h3 className="text-xl text-[#2A1F1A]">{char.name}</h3>
          <p className="text-xs text-[#8B6B4A]">{char.job.emoji} {tc(nomMetier(char.job, char.gender))}</p>
        </div>
        {/*
          LE CRAYON, ET POURQUOI IL EST À CÔTÉ ET NON À LA PLACE.

          La première version faisait ouvrir l'Atelier à TOUT LE MONDE en
          touchant un candidat. C'était le chemin le plus direct vers l'effet
          recherché, et une faute : le joueur qui ne veut rien acheter se
          retrouvait avec un écran de composition et un péage entre lui et sa
          partie. On ne met pas une boutique sur le trajet de tout le monde
          pour convertir les curieux.

          Le geste principal reste donc « je prends celui-là, on joue ». Le
          crayon, discret, est pour qui a envie de regarder — et c'est
          exactement le public que l'essai libre vise.
        */}
        {onComposer && (
          <button
            onClick={(e) => { e.stopPropagation(); onComposer(); }}
            className="ml-auto self-start w-9 h-9 rounded-xl flex items-center justify-center text-sm text-[#B8860B] bg-[#B8860B]/10 active:scale-95 shrink-0"
            aria-label={tr('Composer son visage', 'Compose their face')}
          >
            ✎
          </button>
        )}
      </div>

      {/* Job description */}
      <p className="text-xs text-[#6B5740] italic mb-3 pb-2 border-b border-[#E8D5C0]">
        "{tc(char.job.description)}"
      </p>

      {/* Traits */}
      <div className="flex flex-col gap-1.5 mb-3">
        {char.traits.map((trait, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span>{trait.emoji}</span>
            <span className={`font-medium ${trait.positive ? 'text-[#4A9B5F]' : 'text-[#D94F4F]'}`}>
              {tc(trait.name)}
            </span>
            <span className="text-[#A08B70]">· {tc(trait.description)}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-[#6B5740]">
        <span>❤️ {char.stats.health}</span>
        <span>🧠 {char.stats.mental}</span>
        <span>🍖 {char.stats.hunger}</span>
        <span>💧 {char.stats.thirst}</span>
        <span>😴 {char.stats.sleep}</span>
        <span>👑 {char.stats.dignity}</span>
      </div>

      {/* Money */}
      <div className="mt-2 text-right text-xs font-semibold text-[#B8860B] font-mono">
        {char.money}€
      </div>
    </motion.div>
  );
}

export default function CharacterSelect() {
  const { state, dispatch } = useGame();
  useLang();
  // Le premier relancer du tirage est offert ; les suivants passent par une
  // pub récompensée (gratuits si le joueur a acheté « Sans pub »).
  const [rerolls, setRerolls] = useState(0);
  const [loadingAd, setLoadingAd] = useState(false);
  /*
   * L'ATELIER S'OUVRE POUR TOUT LE MONDE, ET SE PAIE À LA VALIDATION.
   *
   * Avant, ce chemin n'existait pas sans l'achat : le joueur ne voyait jamais
   * ce qu'il n'avait pas, et on lui vendait une fonctionnalité décrite par
   * trois puces. Il compose maintenant d'abord — et à la validation, on ne lui
   * vend plus une fonctionnalité, on lui vend CE personnage-là.
   *
   * `atelier` est relu après un achat réussi, d'où l'état local : la valeur
   * vit dans `ads.ts` et change sous nos pieds pendant que l'écran est ouvert.
   */
  const [retouche, setRetouche] = useState<number | null>(null);
  const [atelier, setAtelier] = useState(isAtelierOwned());
  const [enPaiement, setEnPaiement] = useState(false);
  const freeReroll = rerolls === 0 || isAdsRemoved();

  async function handleReroll() {
    if (loadingAd) return;
    if (freeReroll) {
      playReroll();
      setRerolls((n) => n + 1);
      dispatch({ type: 'GENERATE_CHARACTERS' });
      return;
    }
    setLoadingAd(true);
    const ok = await showRewarded({ exempt: true });
    setLoadingAd(false);
    if (ok) {
      playReroll();
      setRerolls((n) => n + 1);
      dispatch({ type: 'GENERATE_CHARACTERS' });
    }
  }

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-4">
      {/* Header */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center pt-2"
      >
        <h2 className="text-2xl text-[#2A1F1A]">{tr('Choisissez votre Destin', 'Choose Your Fate')}</h2>
        <p className="text-xs text-[#8B6B4A] mt-1">
          {tr('3 âmes perdues. 1 seul survivant.', '3 lost souls. Only 1 survivor.')}
        </p>
      </motion.div>

      {/* Character Cards */}
      <div className="flex flex-col gap-3">
        {state.characterChoices.map((char, i) => (
          <CharacterCard
            key={i}
            char={char}
            index={i}
            /*
             * DEUX GESTES DISTINCTS, ET C'EST UNE CORRECTION.
             *
             *   · Toucher la carte : on part avec, tout de suite. C'est le
             *     chemin de l'immense majorité, et rien ne doit s'y mettre.
             *   · Le crayon : on ouvre l'Atelier. Acheté, il compose et valide ;
             *     sinon, il compose en essai et paie à la validation.
             *
             * Pour qui possède l'Atelier, toucher la carte ouvre directement la
             * composition : il l'a payée, il n'a pas à chercher un crayon.
             */
            onSelect={() => {
              if (atelier) { playCard(); setRetouche(i); return; }
              dispatch({ type: 'SELECT_CHARACTER', index: i });
            }}
            onComposer={atelier ? undefined : () => { playCard(); setRetouche(i); }}
          />
        ))}
      </div>

      {/* Reroll : 1er offert, puis pub récompensée */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={handleReroll}
        disabled={loadingAd}
        className="text-sm text-[#A08B70] font-medium text-center py-2 hover:text-[#6B5740] transition-colors disabled:opacity-60"
      >
        {loadingAd
          ? tr('⏳ Chargement…', '⏳ Loading…')
          : freeReroll
            ? tr('🎲 Relancer les dés', '🎲 Reroll')
            : tr(bonusFr('Relancer les dés'), bonusEn('Reroll'))}
      </motion.button>

      {/* Le bandeau qui renvoyait vers les Options n'a plus lieu d'être :
          l'Atelier s'ouvre en touchant un candidat, et il dit lui-même ce
          qu'il coûte au moment de valider. */}

      <AnimatePresence>
        {retouche !== null && state.characterChoices[retouche] && (
          <AtelierOverlay
            char={state.characterChoices[retouche]}
            essai={!atelier}
            onAnnuler={() => { playBack(); setRetouche(null); }}
            onValider={async (visage, traits) => {
              const i = retouche;
              if (atelier) {
                dispatch({ type: 'SELECT_CHARACTER', index: i, visage, traits });
                return;
              }
              /*
               * LE PAIEMENT, ET CE QUI SE PASSE S'IL ÉCHOUE.
               *
               * Refus, fenêtre fermée d'un geste, magasin injoignable : la
               * partie démarre quand même, avec le personnage TEL QU'IL S'EST
               * PRÉSENTÉ. Bloquer quelqu'un devant un écran parce qu'il n'a pas
               * payé transformerait un essai en otage — et il n'aurait pas
               * tort de le dire dans son commentaire.
               *
               * La composition est simplement perdue, ce qui est la seule
               * chose honnête : c'est elle qu'on vendait.
               */
              if (enPaiement) return;
              setEnPaiement(true);
              const ok = await purchaseAtelier();
              setEnPaiement(false);
              if (ok) {
                setAtelier(true);
                dispatch({ type: 'SELECT_CHARACTER', index: i, visage, traits });
                return;
              }
              pushToast(
                tr('Le vendeur n\'est pas à son carton. On part avec celui-là.',
                   'Nobody at the stall. We go with this one.'),
                { emoji: 'ℹ️', tone: 'info' },
              );
              setRetouche(null);
              dispatch({ type: 'SELECT_CHARACTER', index: i });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
