import { useGame, type Character } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PlayerFace from './PlayerFace';
import { useLang, tr, tc } from '@/lib/lang';
import { showRewarded, isAdsRemoved } from '@/lib/ads';

function CharacterCard({ char, index, onSelect }: { char: Character; index: number; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="craft-card p-4 cursor-pointer"
    >
      {/* Character header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-[#E8D5C0]">
          <PlayerFace char={char} size={48} />
        </div>
        <div>
          <h3 className="text-xl text-[#2A1F1A]">{char.name}</h3>
          <p className="text-xs text-[#8B6B4A]">{char.job.emoji} {tc(char.job.name)}</p>
        </div>
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
  const freeReroll = rerolls === 0 || isAdsRemoved();

  async function handleReroll() {
    if (loadingAd) return;
    if (freeReroll) {
      setRerolls((n) => n + 1);
      dispatch({ type: 'GENERATE_CHARACTERS' });
      return;
    }
    setLoadingAd(true);
    const ok = await showRewarded();
    setLoadingAd(false);
    if (ok) {
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
            onSelect={() => dispatch({ type: 'SELECT_CHARACTER', index: i })}
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
            : tr('🎬 Relancer les dés (pub)', '🎬 Reroll (ad)')}
      </motion.button>
    </div>
  );
}
