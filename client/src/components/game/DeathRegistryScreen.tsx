import { useEffect } from 'react';
import SafeImg from './SafeImg';
import { useGame, knownEnemyNames } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useLang, tr, tc } from '@/lib/lang';
import { playLedger, playBack } from '@/lib/sound';
import { DEATH_DEFS, loadDeathBook, loadKarma } from '@/lib/necrology';

/*
 * LE REGISTRE DES MORTS — le catalogue à trous qui donne envie de mourir
 * autrement.
 *
 * Deux principes gouvernent cet écran, et ils tirent tous les deux dans le
 * même sens :
 *
 * 1. UNE CASE VIDE NE RETIENT RIEN. Les fins pas encore trouvées affichaient
 *    « ❓ », « ??? » et « Fin non découverte » : trois façons de ne rien dire.
 *    Or on ne reste en tension que sur une tâche dont on a déjà une
 *    représentation — une absence, on la range. Chaque fin verrouillée montre
 *    donc son AMORCE : la condition, jamais la chute. Le joueur sait quoi
 *    tenter en sortant d'ici.
 *
 * 2. DEUX COLLECTIONS, DEUX PSYCHOLOGIES. Les dix fins nommées relèvent de la
 *    découverte (on ignore qu'elles existent) ; les adversaires relèvent de la
 *    complétion (on sait exactement ce qui reste à faire). Les fondre dans un
 *    seul « 14/36 » dilue les deux, et donne un dénominateur décourageant. Le
 *    compteur de tête ne porte donc que sur les fins, et le tableau de chasse
 *    a le sien.
 */
export default function DeathRegistryScreen() {
  // Le Registre s'ouvre : un classeur à levier, mécanisme métallique.
  useEffect(() => { playLedger(); }, []);
  const { state, dispatch } = useGame();
  useLang();
  const book = loadDeathBook();
  const karma = loadKarma();
  const enemies = knownEnemyNames();

  const finsTrouvees = DEATH_DEFS.filter(d => book[d.id]).length;

  /*
   * Les fins encore scellées passent devant, et parmi elles celles qu'on peut
   * tenter dès ce soir. Ce qui est déjà trouvé descend en bas : le haut de
   * l'écran doit être un reste à faire, pas une vitrine.
   */
  const finsTriees = [...DEATH_DEFS].sort((a, b) => {
    const va = book[a.id] ? 1 : 0;
    const vb = book[b.id] ? 1 : 0;
    if (va !== vb) return va - vb;
    return a.reach - b.reach;
  });
  const ennemisTombes = enemies.filter(n => book[`mort-ennemi-${n}`]).length;

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
      <SafeImg src="/assets/registre-hub.webp" className="w-full h-24 object-cover rounded-xl" />
      <div className="flex items-center gap-3">
        <button onClick={() => { playBack(); back(); }} className="w-10 h-10 flex items-center justify-center text-lg rounded-xl border border-[#4A3048] text-[#E8A87C]" aria-label={tr('Retour', 'Back')}>
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl text-[#F0D9C4] font-bold leading-tight">📕 {tr('Registre des Morts', 'Book of the Dead')}</h1>
          <p className="text-[11px] text-[#A08060] font-mono">
            {finsTrouvees}/{DEATH_DEFS.length} {tr('fins', 'endings')} · 👑 {karma} {tr('karma', 'karma')}
          </p>
        </div>
      </div>

      {/* Jauge de collection — sur les fins seules : un dénominateur à 10 est
          atteignable, à 36 il décourage. */}
      <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #B8860B, #F2C14E)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(finsTrouvees / DEATH_DEFS.length) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* ---- LES FINS : la collection de découverte ---- */}
      <div className="flex items-baseline justify-between mt-1">
        <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-semibold">
          {tr('Les fins', 'The endings')}
        </p>
        {finsTrouvees < DEATH_DEFS.length && (
          <p className="text-[10px] text-[#C89B5A] font-mono">
            {tr(
              `${DEATH_DEFS.length - finsTrouvees} à trouver`,
              `${DEATH_DEFS.length - finsTrouvees} to find`,
            )}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {finsTriees.map((d, i) => {
          const e = book[d.id];
          return (
            <motion.div
              key={d.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.03 * i }}
              className={`rounded-xl p-2.5 border ${e ? 'border-[#B8860B]/50' : 'border-[#4A3048]'}`}
              style={{ background: e ? 'linear-gradient(135deg, #3A2822, #2A1C24)' : '#231A28' }}
            >
              <div className="text-xl leading-none mb-1">{e ? d.emoji : '🕯️'}</div>
              {e ? (
                <>
                  <p className="text-[12px] font-bold leading-tight text-[#F0D9C4]">{tr(d.title, d.titleEn)}</p>
                  <p className="text-[10px] text-[#A08060] leading-snug mt-1">{tr(d.epitaph, d.epitaphEn)}</p>
                  <p className="text-[9px] text-[#8B6B4A] font-mono mt-1">
                    † {e.name} · {tr(`jour ${e.day}`, `day ${e.day}`)}
                  </p>
                </>
              ) : (
                <>
                  {/* L'amorce, à la place du néant : de quoi savoir quoi tenter. */}
                  <p className="text-[10px] tracking-widest uppercase text-[#6B5768] font-mono leading-tight">
                    {tr('Fin scellée', 'Sealed ending')}
                  </p>
                  <p className="text-[11px] text-[#C89B5A] leading-snug mt-1">{tr(d.hint, d.hintEn)}</p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ---- TOMBÉS AU COMBAT : la collection de complétion ----
           Affichage inverse : ceux qui restent à affronter sont lisibles, pour
           que la liste se lise comme un reste à faire et non comme un trophée. */}
      <div className="flex items-baseline justify-between mt-3">
        <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-semibold">
          ⚔️ {tr('Tombés au combat', 'Fallen in battle')}
        </p>
        <p className="text-[10px] text-[#A08060] font-mono">{ennemisTombes}/{enemies.length}</p>
      </div>
      <div className="flex flex-wrap gap-1.5 pb-6">
        {enemies.map((n) => {
          const e = book[`mort-ennemi-${n}`];
          return (
            <span
              key={n}
              className={`px-2 py-1 rounded-full text-[10px] border font-medium ${
                e ? 'border-[#D94F4F]/50 text-[#E8A87C] bg-[#D94F4F]/10' : 'border-[#4A3048] text-[#8B6B4A]'
              }`}
              title={e ? `† ${e.name}` : tr('Pas encore tombé face à lui', 'Not yet fallen to this one')}
            >
              {e ? `💀 ${tc(n)}` : tc(n)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
