import { useGame, computeScore, loadHighScores } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { showInterstitial, showRewarded } from '@/lib/ads';
import CardboardAvatar from './CardboardAvatar';
import { useLang, tr, tc } from '@/lib/lang';

const DEATH_MESSAGES: { fr: string; en: string }[] = [
  { fr: 'La rue a eu raison de vous. Mais votre légende perdure.', en: 'The street got the better of you. But your legend lives on.' },
  { fr: 'Votre aventure se termine ici. Le carton retourne au carton.', en: 'Your journey ends here. Cardboard returns to cardboard.' },
  { fr: 'Vous avez survécu plus longtemps que la plupart. Respect.', en: 'You lasted longer than most. Respect.' },
  { fr: 'Le Roi du Carton est tombé. Vive le prochain Roi !', en: 'The Cardboard King has fallen. Long live the next King!' },
  { fr: 'La ville vous a oublié. Comme elle oublie tout le monde.', en: 'The city forgot you. Like it forgets everyone.' },
];

export default function GameOverScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const [deathMsgIdx] = useState(() => Math.floor(Math.random() * DEATH_MESSAGES.length));
  const deathMsg = tr(DEATH_MESSAGES[deathMsgIdx].fr, DEATH_MESSAGES[deathMsgIdx].en);
  const [reviving, setReviving] = useState(false);
  const [deathImgOk, setDeathImgOk] = useState(true);

  // Catégorie de mort → image (diorama) personnalisée. Repli sur le 💀 si le
  // fichier n'existe pas encore.
  const deathCat = state.deathCause ? 'combat'
    : !char ? 'injury'
    : char.stats.mental <= 0 ? 'despair'
    : char.stats.hunger <= 8 ? 'hunger'
    : char.stats.thirst <= 8 ? 'thirst'
    : char.stats.sleep <= 8 ? 'exhaustion'
    : (state.weather === 'snow' || state.weather === 'storm') ? 'cold'
    : 'injury';
  const deathImg = `/assets/death-${deathCat}.webp`;

  // Pub interstitielle à l'arrivée sur l'écran de fin (entre deux parties).
  useEffect(() => {
    showInterstitial();
  }, []);

  const canRevive = !!char && !char.activeFlags.includes('revived');

  async function handleRevive() {
    if (reviving) return;
    setReviving(true);
    const rewarded = await showRewarded();
    if (rewarded) {
      dispatch({ type: 'REVIVE' });
    } else {
      setReviving(false);
    }
  }

  if (!char) return null;

  // Cause de mort : soit posée par le jeu (ex. l'ennemi qui vous a achevé au
  // combat), soit déduite de l'état dans lequel vous partez.
  function inferCause(): string {
    if (char!.stats.mental <= 0) {
      return tr('Votre esprit a lâché avant votre corps. La rue a fini par avoir votre moral.', 'Your mind gave out before your body. The street finally broke your spirit.');
    }
    if (char!.stats.hunger <= 8) return tr('Le ventre vide a eu le dernier mot. On ne survit pas longtemps à jeun.', 'An empty stomach had the last word. You don\'t last long unfed.');
    if (char!.stats.thirst <= 8) return tr('La soif a fini le travail. Trouver de l\'eau, ça compte plus qu\'on ne croit.', 'Thirst finished the job. Finding water matters more than you\'d think.');
    if (char!.stats.sleep <= 8) return tr('L\'épuisement vous a rattrapé. Le corps réclame son dû, toujours.', 'Exhaustion caught up with you. The body always claims its due.');
    if ((state.weather === 'snow' || state.weather === 'storm') && char!.stats.health <= 0) {
      return tr('Le froid a eu raison de vous cette nuit. La rue est glaciale avec ses rois.', 'The cold got you tonight. The street is icy to its kings.');
    }
    return tr('Votre corps a lâché. Trop de coups, pas assez de soins.', 'Your body gave out. Too many blows, not enough care.');
  }
  const deathCause = state.deathCause || inferCause();

  // Même formule que les meilleurs scores enregistrés (computeScore) :
  // l'écran de fin et le tableau des scores affichent le même chiffre.
  const score = computeScore(char.day, char.respect, char.money);

  // Lecture fraîche du classement (la partie qui vient de se terminer a déjà
  // été enregistrée dans localStorage par le reducer, mais state.highScores
  // n'est rafraîchi qu'au redémarrage) : on l'affiche donc à jour, run inclus.
  const highScores = loadHighScores();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-5 flex flex-col items-center justify-center gap-4"
      style={{ background: 'radial-gradient(95% 45% at 50% 0%, rgba(217,79,79,0.16), transparent 60%), linear-gradient(180deg, #3A2436 0%, #1C1322 100%)' }}
    >
      {/* Image de mort personnalisée (diorama) si disponible, sinon 💀 */}
      {deathImgOk ? (
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, delay: 0.15 }}
          className="w-full max-w-sm h-40 rounded-xl overflow-hidden relative shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
        >
          <img src={deathImg} alt="" onError={() => setDeathImgOk(false)} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <span className="absolute bottom-2 right-3 text-2xl drop-shadow">💀</span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="text-5xl"
        >
          💀
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl text-[#D94F4F] text-center"
      >
        {tr('Fin de l\'Aventure', 'End of the Road')}
      </motion.h1>

      {/* Death cause */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-[#E8A87C]/70 text-center max-w-xs"
      >
        {deathCause}
      </motion.p>

      {/* Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-[#A08060]/50 text-center italic max-w-xs"
      >
        "{deathMsg}"
      </motion.p>

      {/* Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm rounded-xl p-4 border border-[#4A3048]"
        style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-2 border border-[#4A3048]">
          <CardboardAvatar seed={char.seed} gender={char.gender} size={56} />
        </div>
        <h3 className="text-base font-semibold text-[#F0D9C4] text-center mb-1">
          {char.job.emoji} {char.name}
        </h3>
        <p className="text-[10px] text-[#A08060] text-center mb-3">
          {tc(char.job.name)} · {char.traits.map(t => `${t.emoji} ${tc(t.name)}`).join(' · ')}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#231525' }}>
            <p className="text-xl font-bold text-[#E8A87C]">{char.day}</p>
            <p className="text-[10px] text-[#A08060]">{tr('Jours', 'Days')}</p>
          </div>
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#231525' }}>
            <p className="text-xl font-bold text-[#7B68EE]">{char.respect}</p>
            <p className="text-[10px] text-[#A08060]">{tr('Respect', 'Respect')}</p>
          </div>
          <div className="p-2.5 rounded-lg text-center" style={{ background: '#231525' }}>
            <p className="text-xl font-bold text-[#B8860B]">{char.money}€</p>
            <p className="text-[10px] text-[#A08060]">{tr('Fortune', 'Money')}</p>
          </div>
          <div className="p-2.5 rounded-lg text-center border border-[#D4874D]/30" style={{ background: '#231525' }}>
            <p className="text-xl font-bold text-[#D4874D]">{score}</p>
            <p className="text-[10px] text-[#A08060]">{tr('Score', 'Score')}</p>
          </div>
        </div>
      </motion.div>

      {/* High Scores */}
      {highScores.length > 0 && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
          style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
        >
          <h4 className="text-sm font-semibold text-[#F0D9C4] text-center mb-2">
            🏆 {tr('Plus longues survies', 'Longest survivals')}
          </h4>
          <div className="flex flex-col gap-1.5">
            {highScores.slice(0, 5).map((hs, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#A08060]'}>
                  {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {hs.name}
                </span>
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#E8A87C] font-semibold'}>
                  {hs.days} {tr(hs.days > 1 ? 'jours' : 'jour', hs.days > 1 ? 'days' : 'day')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Seconde chance (pub récompensée) — une fois par partie */}
      {canRevive && (
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={reviving}
          onClick={handleRevive}
          className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)',
            boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
          }}
        >
          {reviving ? tr('⏳ Chargement…', '⏳ Loading…') : tr('🎬 Seconde chance (regarder une pub)', '🎬 Second chance (watch an ad)')}
        </motion.button>
      )}

      {/* Restart */}
      <motion.button
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => dispatch({ type: 'RESTART' })}
        className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
          boxShadow: '0 4px 16px rgba(212, 135, 77, 0.3)',
        }}
      >
        {tr('Recommencer', 'Play Again')}
      </motion.button>
    </motion.div>
  );
}
