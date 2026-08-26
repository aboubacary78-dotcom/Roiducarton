import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import CardboardAvatar from './CardboardAvatar';
import { faceCondition } from './PlayerFace';
import { playBack, playClick, playObjetEquipe, playTab } from '@/lib/sound';
import {
  ACCESSORIES,
  ACHIEVEMENTS,
  SLOT_LABELS,
  SLOT_ORDER,
  TIER_META,
  achievementForAccessory,
  getAccessory,
  accessoryName,
  achievementName,
  achievementDesc,
  type AccessorySlot,
} from '@/lib/cosmetics';
import { loadProfile, type PlayerProfile } from '@/lib/profile';
import { useLang, tr } from '@/lib/lang';
import { pushToast } from '@/lib/toast';

export default function WardrobeScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character;
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [tab, setTab] = useState<'accessoires' | 'succes'>('accessoires');

  const seed = char?.seed || 'apercu';
  const gender = char?.gender;
  const unlockedCount = profile.unlocked.length;

  // La tenue appartient au personnage : c'est lui qui la porte, et c'est lui
  // qui l'emporte dans la tombe. Le profil ne garde que ce qui est débloqué.
  const tenue = char?.equipped ?? {};

  const equip = (slot: AccessorySlot, id: string) => {
    const wasEquipped = tenue[slot] === id;
    /*
     * S'habiller a son son : tissu qu'on enfile et boucle qu'on serre d'un
     * cran. Le clic générique convenait pour ouvrir un onglet, pas pour le
     * seul geste du jeu où l'on prend soin de soi. Retirer garde le clic —
     * on ne fait pas une cérémonie d'un accessoire qu'on enlève.
     */
    if (wasEquipped) playClick(); else playObjetEquipe();
    dispatch({ type: 'EQUIPER', slot, id });
    pushToast(
      wasEquipped ? tr('Accessoire retiré', 'Accessory removed') : tr('Accessoire équipé !', 'Accessory equipped!'),
      { emoji: wasEquipped ? '👕' : '✨', tone: wasEquipped ? 'info' : 'good' },
    );
  };

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playBack(); dispatch({ type: 'SET_SCREEN', screen: 'main' }); }}
          className="action-btn w-10 h-10 flex items-center justify-center text-lg"
          aria-label="Retour"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl text-[#2A1F1A] leading-tight">{tr('Garde-robe', 'Wardrobe')}</h1>
          <p className="text-xs text-[#8B6B4A]">
            {unlockedCount}/{ACCESSORIES.length} {tr('accessoires débloqués', 'accessories unlocked')}
          </p>
        </div>
      </div>

      {/* Aperçu du personnage */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-4 flex items-center gap-4"
      >
        <div className="shrink-0 rounded-2xl overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
          {/* Le grand aperçu montre l'état RÉEL : c'est l'écran où l'on se
              regarde le plus longtemps, et un visage pimpant ici pendant que
              la tenue s'effondre ailleurs annulerait tout le signal. */}
          <CardboardAvatar
            seed={seed} gender={gender} size={96} accessories={tenue}
            condition={char ? faceCondition(char) : undefined}
            dignity={char?.stats.dignity}
          />
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-[#2A1F1A]">{char?.name || tr('Votre personnage', 'Your character')}</p>
          <p className="text-xs text-[#8B6B4A] leading-relaxed mt-1">
            {tr(
              'Équipez les accessoires gagnés par vos succès. Ils vous suivent d\'une partie à l\'autre. Touchez un accessoire équipé pour le retirer.',
              'Equip accessories earned from achievements. They carry over between runs. Tap an equipped accessory to remove it.',
            )}
          </p>
        </div>
      </motion.div>

      {/* Onglets */}
      <div className="flex gap-2">
        {(['accessoires', 'succes'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { playTab(); setTab(t); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'btn-primary' : 'action-btn text-[#6B5740]'
            }`}
          >
            {t === 'accessoires' ? tr('🎽 Accessoires', '🎽 Accessories') : tr('🏆 Succès', '🏆 Achievements')}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {tab === 'accessoires' ? (
        <div className="flex flex-col gap-4">
          {SLOT_ORDER.map((slot) => {
            const items = ACCESSORIES.filter((a) => a.slot === slot);
            const meta = SLOT_LABELS[slot];
            return (
              <div key={slot}>
                <h2 className="text-sm font-semibold text-[#5C4A38] mb-2 flex items-center gap-1.5">
                  <span>{meta.emoji}</span> {tr(meta.label, meta.labelEn)}
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {items.map((acc) => {
                    const unlocked = profile.unlocked.includes(acc.id);
                    const equipped = tenue[slot] === acc.id;
                    const ach = achievementForAccessory(acc.id);
                    return (
                      <button
                        key={acc.id}
                        onClick={unlocked ? () => equip(slot, acc.id) : undefined}
                        disabled={!unlocked}
                        className={`craft-card p-2 flex flex-col items-center text-center gap-1 transition-all ${
                          equipped ? 'ring-2 ring-[#B8860B] bg-[#B8860B]/5' : ''
                        } ${unlocked ? 'active:scale-95' : 'opacity-70'}`}
                      >
                        <span className="text-2xl leading-none mt-1">{unlocked ? acc.emoji : '🔒'}</span>
                        <span className="text-[10px] font-medium text-[#3D3020] leading-tight line-clamp-2 min-h-[24px] flex items-center">
                          {accessoryName(acc, en)}
                        </span>
                        {equipped ? (
                          <span className="text-[9px] font-semibold text-[#B8860B]">{tr('Équipé', 'Equipped')}</span>
                        ) : unlocked ? (
                          <span className="text-[9px] text-[#A08B70]">{tr('Toucher', 'Tap')}</span>
                        ) : (
                          <span className="text-[9px] text-[#B84A3A] leading-tight line-clamp-2">
                            {ach ? achievementName(ach, en) : ''}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = profile.unlocked.includes(ach.reward);
            const cur = Math.min(ach.progress(profile.records), ach.goal);
            const pct = Math.round((cur / ach.goal) * 100);
            const acc = getAccessory(ach.reward);
            const tier = TIER_META[ach.tier];
            return (
              <div
                key={ach.id}
                className={`craft-card p-3 ${unlocked ? '' : 'opacity-95'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{unlocked ? ach.icon : '🔒'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#2A1F1A]">{achievementName(ach, en)}</span>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: tier.color }}
                      >
                        {tr(tier.label, tier.labelEn)}
                      </span>
                      {unlocked && <span className="text-[10px] font-semibold text-[#3d8b4f]">{tr('✅ Débloqué', '✅ Unlocked')}</span>}
                    </div>
                    <p className="text-xs text-[#6B5740] mt-0.5">{achievementDesc(ach, en)}</p>
                    <p className="text-[11px] text-[#8B6B4A] mt-1">
                      {tr('Récompense', 'Reward')} : <span className="font-medium text-[#B8860B]">{acc?.emoji} {acc ? accessoryName(acc, en) : ''}</span>
                    </p>
                    {!unlocked && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-[#E8D5C0] overflow-hidden">
                          <div className="h-full rounded-full bg-[#B8860B]" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] text-[#A08B70] mt-0.5 font-mono">{cur} / {ach.goal}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
