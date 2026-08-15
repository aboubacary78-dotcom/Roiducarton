import { bagCapacity } from '@/contexts/GameContext';
import { useGame, type StreetNpc } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang, tr, tc } from '@/lib/lang';
import { pushToast } from '@/lib/toast';
import { playShare, playCoin } from '@/lib/sound';
import CardboardAvatar from './CardboardAvatar';

/*
 * Rencontre d'un PNJ errant (niveau « B ») : on découvre sa chute, puis on
 * peut partager à manger, troquer, ou passer son chemin. Retour non bloquant
 * (toast), comme le reste du jeu — pas d'overlay de résultat par-dessus.
 */
export default function StreetEncounter({ npc, onClose }: { npc: StreetNpc; onClose: () => void }) {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character!;
  const hasFood = char.inventory.some((it) => it.type === 'food');
  const offer = npc.offer;
  const canTrade = offer && char.money >= offer.price && char.inventory.length < bagCapacity(char);

  function share() {
    if (!hasFood) return;
    playShare();
    dispatch({ type: 'RESOLVE_ENCOUNTER', kind: 'share' });
    pushToast(tr(`Vous partagez avec ${npc.name}. Un peu d'humanité, ça se rend.`, `You share with ${npc.name}. A bit of humanity goes around.`), { emoji: '🤝', tone: 'good' });
    onClose();
  }
  function trade() {
    if (!offer || !canTrade) return;
    playCoin();
    dispatch({ type: 'RESOLVE_ENCOUNTER', kind: 'trade', offer });
    pushToast(`${offer.item.emoji} ${tr('Troc conclu', 'Deal done')} : ${tc(offer.item.name)}`, { emoji: '🔄', tone: 'good' });
    onClose();
  }
  function pass() {
    dispatch({ type: 'RESOLVE_ENCOUNTER', kind: 'pass' });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[55] flex items-center justify-center p-4 overlay-backdrop"
        onClick={pass}
      >
        <motion.div
          initial={{ scale: 0.9, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 340 }}
          className="craft-card-solid p-5 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Le PNJ */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E8D5C0] shrink-0">
              <CardboardAvatar seed={npc.seed} gender={npc.gender} size={56} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg text-[#2A1F1A] leading-tight">{npc.name}</h2>
              <p className="text-[11px] text-[#8B6B4A]">{npc.job.emoji} {tc(npc.job.name)}</p>
            </div>
          </div>

          {/* Ce qu'il/elle est en train de faire */}
          <p className="text-xs text-[#6B5740] mb-3">{tr(npc.situationFr, npc.situationEn)}</p>

          {/* Sa chute */}
          <div className="rounded-lg bg-[#F5EDE4] border border-[#E8D5C0] p-3 mb-4">
            <p className="text-[10px] font-semibold text-[#A08B70] mb-1 uppercase tracking-wide">
              {tr(npc.story.titleFr, npc.story.titleEn)}
            </p>
            <p className="text-sm text-[#3D3020] leading-relaxed italic">« {tr(npc.story.textFr, npc.story.textEn)} »</p>
          </div>

          {/* Proposition de troc */}
          {offer && (
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-[#7B68EE]/6 border border-[#7B68EE]/15">
              <span className="text-lg shrink-0">{offer.item.emoji}</span>
              <p className="text-[11px] text-[#6B5740] flex-1 leading-snug">
                {tr(`« Je te laisse ma ${tc(offer.item.name).toLowerCase()} contre ${offer.price}€, j'ai besoin de liquide. »`,
                    `"I'll let my ${tc(offer.item.name).toLowerCase()} go for €${offer.price}, I need cash."`)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={share}
              disabled={!hasFood}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)' }}
            >
              🤝 {hasFood ? tr('Partager à manger', 'Share some food') : tr('Partager (aucun aliment)', 'Share (no food)')}
            </button>
            {offer && (
              <button
                onClick={trade}
                disabled={!canTrade}
                className="w-full py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50"
                style={{ background: '#EDE7FA', color: '#5A4ABB', border: '1px solid #7B68EE30' }}
              >
                🔄 {tr('Troquer', 'Trade')} · {offer.price}€
              </button>
            )}
            <button
              onClick={pass}
              className="w-full py-2 text-sm font-medium text-[#A08B70] hover:text-[#6B5740] transition-colors"
            >
              {tr('Passer son chemin', 'Move along')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
