import { useGame, knownEnemyNames } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useLang, tr, tc } from '@/lib/lang';
import { DEATH_DEFS, loadDeathBook, loadKarma } from '@/lib/necrology';

/*
 * Le Registre des Morts : le catalogue à trous qui donne envie de mourir
 * autrement. Les fins découvertes affichent leur épitaphe et le nom du
 * défunt ; les autres restent des silhouettes « ??? ».
 */
export default function DeathRegistryScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const book = loadDeathBook();
  const karma = loadKarma();
  const enemies = knownEnemyNames();

  const total = DEATH_DEFS.length + enemies.length;
  const found = Object.keys(book).length;

  const back = () => {
    const target = state.character && !state.character.alive ? 'game-over' : 'title';
    dispatch({ type: 'SET_SCREEN', screen: target });
  };

  return (
    <div
      className="min-h-screen p-4 flex flex-col gap-3"
      style={{ background: 'linear-gradient(180deg, #2A1D30 0%, #1C1322 100%)' }}
    >
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button onClick={back} className="w-10 h-10 flex items-center justify-center text-lg rounded-xl border border-[#4A3048] text-[#E8A87C]" aria-label={tr('Retour', 'Back')}>
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl text-[#F0D9C4] font-bold leading-tight">📕 {tr('Registre des Morts', 'Book of the Dead')}</h1>
          <p className="text-[11px] text-[#A08060] font-mono">
            {found}/{total} {tr('fins découvertes', 'endings discovered')} · 👑 {karma} {tr('karma', 'karma')}
          </p>
        </div>
      </div>

      {/* Jauge de collection */}
      <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #B8860B, #F2C14E)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(found / Math.max(1, total)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Les fins nommées */}
      <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-semibold mt-1">
        {tr('Les fins', 'The endings')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DEATH_DEFS.map((d, i) => {
          const e = book[d.id];
          return (
            <motion.div
              key={d.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.03 * i }}
              className={`rounded-xl p-2.5 border ${e ? 'border-[#B8860B]/50' : 'border-[#3A2A3E] opacity-70'}`}
              style={{ background: e ? 'linear-gradient(135deg, #3A2822, #2A1C24)' : '#231A28' }}
            >
              <div className="text-xl leading-none mb-1">{e ? d.emoji : '❓'}</div>
              <p className={`text-[12px] font-bold leading-tight ${e ? 'text-[#F0D9C4]' : 'text-[#6B5768]'}`}>
                {e ? tr(d.title, d.titleEn) : '???'}
              </p>
              {e ? (
                <>
                  <p className="text-[10px] text-[#A08060] leading-snug mt-1">{tr(d.epitaph, d.epitaphEn)}</p>
                  <p className="text-[9px] text-[#8B6B4A] font-mono mt-1">
                    † {e.name} · {tr(`jour ${e.day}`, `day ${e.day}`)}
                  </p>
                </>
              ) : (
                <p className="text-[10px] text-[#5A4858] italic mt-1">{tr('Fin non découverte…', 'Ending not yet found…')}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tombés au combat */}
      <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-semibold mt-2">
        ⚔️ {tr('Tombés au combat', 'Fallen in battle')} ({enemies.filter(n => book[`mort-ennemi-${n}`]).length}/{enemies.length})
      </p>
      <div className="flex flex-wrap gap-1.5 pb-6">
        {enemies.map((n) => {
          const e = book[`mort-ennemi-${n}`];
          return (
            <span
              key={n}
              className={`px-2 py-1 rounded-full text-[10px] border font-medium ${
                e ? 'border-[#D94F4F]/50 text-[#E8A87C] bg-[#D94F4F]/10' : 'border-[#3A2A3E] text-[#5A4858]'
              }`}
              title={e ? `† ${e.name}` : undefined}
            >
              {e ? `💀 ${tc(n)}` : '❓ ???'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
