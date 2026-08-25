import { useGame, PROJECTILE_PATTERNS, getCard, SIGNS, SPECIAL_DEFS, bestWeapon, ARENA, spawnWave, stepProjectiles } from '@/contexts/GameContext';
import type { Character, CombatState, CombatCard, SignId, DodgeProj } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { playBack, playCard, playCombatCharge, playCombatEsquive, playCombatEsquiveParfaite, playCrit, playEnemyCry, playFightStart, playHit, playHurt, playKingArrival, playTurnedAway, playVoix } from '@/lib/sound';
import { setAmbience } from '@/lib/ambience';
import { kingIsHeir } from '@/contexts/GameContext';
import { useLang, tr, tc } from '@/lib/lang';
import PlayerFace from './PlayerFace';
import MinigameIntro, { introSeen } from './MinigameIntro';
import MinigameHelpButton from './MinigameHelpButton';
import SafeImg from './SafeImg';
import { stampTap, liftHover } from '@/lib/anim';
import { pushToast } from '@/lib/toast';

/*
 * Combat « Signe, Esquive & Riposte ».
 * Chaque manche : (0) duel de signes, triangle Châtaigne/Feinte/Garde, informé
 * par les tendances de l'ennemi et un indice faillible ; manche gagnée →
 * (2) riposte aux cartes ; manche perdue → (1) esquive de rattrapage en temps
 * réel (une esquive parfaite vole une riposte réduite). Voir le reducer
 * (PLAY_SIGN / DODGE_RESULT / PLAY_CARD) pour la résolution, ici on ne fait
 * que jouer et remonter le choix.
 */

const DURATION = 3900;      // durée d'une esquive de rattrapage (ms) — un peu plus longue
const IFRAME = 440;         // invulnérabilité après une touche (ms) — moins clémente

type Dir = 'up' | 'down' | 'left' | 'right';

const KIND_STYLE: Record<string, { color: string; shape: 'circle' | 'rect' }> = {
  feather: { color: '#7B68A8', shape: 'circle' },
  fist: { color: '#C4723A', shape: 'rect' },
  claw: { color: '#D94F4F', shape: 'circle' },
  bottle: { color: '#6B8E5A', shape: 'circle' },
  dash: { color: '#B8860B', shape: 'rect' },
  peck: { color: '#4A8FBF', shape: 'circle' },
};

// « Comment la bagarre a commencé » : une amorce d'humour noir montrée à
// l'ouverture de chaque combat (tirée au hasard, stable pour ce combat).
const BRAWL_STARTS: { fr: string; en: string }[] = [
  { fr: 'Un mot de trop, un regard de travers, et voilà.', en: 'One word too many, one wrong look, and here we are.' },
  { fr: "Personne ne sait qui a commencé. Ça n'a plus d'importance.", en: "Nobody knows who started it. Doesn't matter now." },
  { fr: 'Il voulait votre coin de trottoir. Vous y teniez.', en: 'It wanted your patch of pavement. You were attached to it.' },
  { fr: 'Vous vous êtes croisés au pire moment possible.', en: 'You crossed paths at the worst possible moment.' },
  { fr: "Il n'a pas apprécié votre existence, tout simplement.", en: "It simply didn't appreciate your existence." },
  { fr: 'Une histoire de regard mal interprété. Un classique.', en: 'A misread glance. A classic.' },
  { fr: 'Ça devait mal tourner. Ça tourne toujours mal.', en: 'It was bound to go wrong. It always does.' },
  { fr: 'Vous avez dit bonjour. C\'était visiblement de trop.', en: 'You said hello. Apparently that was too much.' },
  { fr: 'Vous étiez là avant lui. Ou l\'inverse. Bref, ça cogne.', en: 'You were there first. Or it was. Either way, fists fly.' },
];

export default function CombatScreen() {
  const [ready, setReady] = useState(() => introSeen('combat2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="combat2"
        emoji="🥊"
        title="La bagarre"
        titleEn="The Fight"
        lines={[
          { emoji: '✊', fr: 'Chaque manche s\'ouvre sur un duel de signes : 👊 Châtaigne bat 🎭 Feinte, qui bat 📦 Garde, qui bat 👊 Châtaigne.', en: 'Each round opens with a sign duel: 👊 Haymaker beats 🎭 Feint, which beats 📦 Block, which beats 👊 Haymaker.' },
          { emoji: '👀', fr: 'Guettez les indices (« Il serre le poing… ») : chaque ennemi a ses habitudes, mais un indice peut mentir.', en: 'Watch the tells ("It clenches a fist…"): every foe has habits, but a tell can lie.' },
          { emoji: '🃏', fr: 'Manche gagnée : piochez des cartes et ripostez. Manche perdue : esquivez la riposte ennemie, parfaite, elle vous rend un contre.', en: 'Win the round: draw cards and strike back. Lose it: dodge the foe\'s onslaught, a flawless dodge steals a counter back.' },
          { emoji: '⚡', fr: 'Vos traits débloquent un coup spécial (haleine, piège…) : gagnez des manches pour le charger, 2 usages par combat.', en: 'Your traits unlock a special move (breath, trap…): win rounds to charge it, 2 uses per fight.' },
          { emoji: '💀', fr: 'Les touches entament votre vraie santé. Videz les PV de l\'ennemi avant que les vôtres tombent à zéro.', en: 'Hits chip your real health. Empty the enemy\'s HP before yours drops to zero.' },
        ]}
        image="/assets/intro-bagarre.webp"
        scene="fight"
        onStart={() => setReady(true)}
      />
    );
  }
  return (
    <>
      <MinigameHelpButton onOpen={() => setReady(false)} />
      <CombatScreenInner />
    </>
  );
}

function CombatScreenInner() {
  const { state, dispatch } = useGame();
  useLang();
  const { currentCombat, character } = state;
  // Portrait (diorama) de l'ennemi ; repli sur l'emoji si le fichier manque.
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [currentCombat?.enemyName]);
  // Cri de l'ennemi à son entrée en scène (famille sonore = son pattern).
  // Cri d'entrée : la voix dépend de l'ESPÈCE (emoji), pas seulement du pattern.
  const pattern = currentCombat?.pattern;
  const enemyEmoji = currentCombat?.enemyEmoji;
  const enemyName = currentCombat?.enemyName;
  useEffect(() => { if (pattern) playEnemyCry(pattern, enemyEmoji, enemyName); }, [pattern, enemyEmoji, enemyName]);

  // L'esquive a son propre lit, plus nerveux que celui du duel de signes.
  // On revient à la bagarre dès que la manche est finie.
  useEffect(() => {
    setAmbience(currentCombat?.phase === 'dodge' ? 'mg-esquive' : 'mg-bagarre');
  }, [currentCombat?.phase]);
  // Ouverture du combat : petite mise en scène « VS » + comment ça a commencé.
  const [intro, setIntro] = useState(true);
  const brawl = useState(() => BRAWL_STARTS[Math.floor(Math.random() * BRAWL_STARTS.length)])[0];
  // Le Roi (boss) a droit à une entrée royale, plus longue et sonore.
  const isKing = currentCombat?.enemyEmoji === '👑';
  // Gong d'ouverture au tout premier rendu de la mise en scène.
  useEffect(() => { if (isKing) playKingArrival(); else playFightStart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!intro) return;
    const t = setTimeout(() => setIntro(false), isKing ? 4600 : 2500);
    return () => clearTimeout(t);
  }, [intro, isKing]);
  // Le coup qui porte. Il n'avait AUCUN son : on lançait la carte (un souffle),
  // puis les dégâts tombaient en silence. Or c'est le retour le plus important
  // d'une bagarre — savoir qu'on a touché. On surveille donc la santé de
  // l'adversaire, et on distingue le coup franc du coup décisif.
  // On mémorise AUSSI de qui il s'agissait : un nouvel adversaire moins
  // vaillant que le précédent aurait sinon déclenché un bruit de coup dès son
  // arrivée, alors que personne n'a encore frappé.
  const prevEnemyHp = useRef<{ name: string; hp: number } | null>(null);
  useEffect(() => {
    const hp = currentCombat?.enemyHealth;
    const name = currentCombat?.enemyName;
    if (hp == null || !name) { prevEnemyHp.current = null; return; }
    const before = prevEnemyHp.current;
    prevEnemyHp.current = { name, hp };
    // Premier rendu, ou changement d'adversaire : rien à annoncer.
    if (!before || before.name !== name || hp >= before.hp) return;
    const dmg = before.hp - hp;
    // « Gros coup » relatif à l'adversaire : un cygne et le Roi n'encaissent
    // pas la même chose, le seuil suit donc sa carrure.
    const big = dmg >= Math.max(6, (currentCombat?.enemyMaxHealth ?? 30) * 0.2);
    if (big) playCrit(); else playHit();
    // Le souffle qui sort tout seul, sur le gros coup uniquement. Sur chaque
    // coup, on entendrait l'échantillon plutôt que le personnage — et un
    // combat, c'est dix coups à la minute.
    if (big) playVoix('effort');
  }, [currentCombat?.enemyHealth, currentCombat?.enemyMaxHealth, currentCombat?.enemyName]);

  /*
   * ET CE QU'ON ENCAISSE.
   *
   * Le joueur perdait de la vie sans un bruit dans la phase au tour par tour :
   * seule la barre bougeait, et elle est en haut de l'écran alors que le pouce
   * est en bas. `playVoix` tient l'écart minimal entre deux réactions, donc
   * une volée serrée ne produit pas deux grimaces superposées.
   */
  const prevPvJoueur = useRef<number | null>(null);
  useEffect(() => {
    const pv = character?.stats.health;
    if (pv == null) { prevPvJoueur.current = null; return; }
    const avant = prevPvJoueur.current;
    prevPvJoueur.current = pv;
    if (avant != null && pv < avant) playVoix('douleur');
  }, [character?.stats.health]);

  // Toast quand le coup spécial vient d'être chargé (manche gagnée).
  const prevCharged = useRef(false);
  useEffect(() => {
    const charged = !!currentCombat?.specialCharged;
    if (charged && !prevCharged.current) {
      const sp = SPECIAL_DEFS.find(s => s.id === currentCombat?.specialId);
      if (sp) pushToast(tr(`${sp.name} chargé !`, `${sp.nameEn} charged!`), { emoji: sp.emoji, tone: 'good' });
    }
    prevCharged.current = charged;
  }, [currentCombat?.specialCharged, currentCombat?.specialId]);
  if (!currentCombat || !character) return null;

  const hpPercent = (currentCombat.enemyHealth / currentCombat.enemyMaxHealth) * 100;
  const playerHpPercent = character.stats.health;

  return (
    <div className="relative min-h-screen bg-texture p-4 flex flex-col items-center gap-3 select-none">
      {/* En-tête ennemi */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm craft-card p-3 flex items-center gap-3"
      >
        {currentCombat.image && !imgError ? (
          <motion.div
            animate={{ rotate: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2.6 }}
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 border-[#3A2A1E]/20 shadow"
          >
            <img src={currentCombat.image} alt="" onError={() => setImgError(true)} className="w-full h-full object-cover" />
          </motion.div>
        ) : (
          <motion.span className="text-4xl" animate={{ rotate: [0, -4, 4, 0] }} transition={{ repeat: Infinity, duration: 2.6 }}>
            {currentCombat.enemyEmoji}
          </motion.span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#2A1F1A] truncate">{tc(currentCombat.enemyName)}</h2>
            <span className="text-xs font-mono font-bold text-[#B84A3A] shrink-0">❤️ {currentCombat.enemyHealth}/{currentCombat.enemyMaxHealth}</span>
          </div>
          <div className="mt-1 h-3 bg-[#F0E0D2] rounded-full overflow-hidden border border-[#D94F4F]/20">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#D94F4F,#E86B5A)' }} animate={{ width: `${hpPercent}%` }} transition={{ duration: 0.35 }} />
          </div>
          <p className="text-[10px] text-[#8B6B4A] italic mt-1 truncate">{tr('Round', 'Round')} {currentCombat.round} · {tc(currentCombat.description)}</p>
        </div>
      </motion.div>

      {/* Barre de vie du JOUEUR : carte symétrique à l'ennemi, avec le visage
          du perso + « VOTRE SANTÉ », pour qu'on comprenne que c'est la sienne. */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="w-full max-w-sm craft-card p-2.5 flex items-center gap-2.5"
        style={{ borderColor: playerHpPercent <= 25 ? '#D94F4F' : undefined }}
      >
        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border-2 border-[#4A9B5F]/40">
          <PlayerFace char={character} size={44} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-[#2A1F1A]">🙂 {tr('VOTRE SANTÉ', 'YOUR HEALTH')}</span>
            <span className="text-sm font-mono font-bold text-[#3d8b4f] shrink-0">❤️ {Math.round(character.stats.health)}/100</span>
          </div>
          <div className="mt-1 h-3 bg-[#E9E0D4] rounded-full overflow-hidden border border-[#4A9B5F]/20">
            <motion.div className="h-full rounded-full" style={{ background: playerHpPercent > 40 ? 'linear-gradient(90deg,#4A9B5F,#5CB870)' : 'linear-gradient(90deg,#8B2020,#D94F4F)' }} animate={{ width: `${playerHpPercent}%` }} transition={{ duration: 0.35 }} />
          </div>
        </div>
      </motion.div>

      {/* Repère « qui est qui » */}
      <p className="-mt-1 text-[10px] text-[#A08B70] text-center">
        {tr('En haut : l\'adversaire · Ici : vous', 'Top: your opponent · Here: you')}
      </p>

      {/* Phase courante */}
      <AnimatePresence mode="wait">
        {currentCombat.phase === 'sign' ? (
          <SignPhase
            key={`sign-${currentCombat.round}-${currentCombat.signNonce}`}
            combat={currentCombat}
            character={character}
            onPick={(sign) => dispatch({ type: 'PLAY_SIGN', sign })}
            onFlee={() => dispatch({ type: 'FLEE_ATTEMPT' })}
          />
        ) : currentCombat.phase === 'dodge' ? (
          <DodgeArena
            key={`dodge-${currentCombat.round}`}
            combat={currentCombat}
            character={character}
            onDone={(hits) => {
              if (hits === 0) pushToast(tr('Esquive parfaite !', 'Flawless dodge!'), { emoji: '✨', tone: 'good' });
              else if (hits === 1) pushToast(tr('Bien esquivé !', 'Nicely dodged!'), { emoji: '🛡️', tone: 'good' });
              dispatch({ type: 'DODGE_RESULT', hits });
            }}
          />
        ) : (
          <CardHand
            key={`draw-${currentCombat.round}`}
            combat={currentCombat}
            character={character}
            onPlay={(cardId) => dispatch({ type: 'PLAY_CARD', cardId })}
          />
        )}
      </AnimatePresence>

      {/* Ouverture : le combat s'enclenche (VS + comment ça a commencé) */}
      <AnimatePresence>
        {intro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playBack(); setIntro(false); }}
            style={{ background: isKing ? 'rgba(12,8,5,0.985)' : 'rgba(24,18,14,0.94)' }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden"
          >
            {/* ---- ENTRÉE ROYALE : réservée au Roi, pour qu'on sente la rareté ---- */}
            {isKing && (
              <>
                {/* Halo doré qui pulse */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2.2, 1.8], opacity: [0, 0.5, 0.25] }}
                  transition={{ duration: 2.6, times: [0, 0.4, 1] }}
                  className="absolute w-72 h-72 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,211,78,0.55) 0%, transparent 70%)' }}
                />
                {/* Anneaux d'onde de choc */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.2, opacity: 0.8 }}
                    animate={{ scale: 3.2, opacity: 0 }}
                    transition={{ duration: 2, delay: 0.6 + i * 0.62, ease: 'easeOut' }}
                    className="absolute w-56 h-56 rounded-full border-2 border-[#FFD34E]/60 pointer-events-none"
                  />
                ))}
                {/* Pluie de paillettes dorées */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <motion.span
                    key={`s${i}`}
                    initial={{ y: -60, opacity: 0, rotate: 0 }}
                    animate={{ y: 520, opacity: [0, 1, 0], rotate: 420 }}
                    transition={{ duration: 3.4, delay: 0.9 + i * 0.13, ease: 'easeIn' }}
                    className="absolute text-sm pointer-events-none"
                    style={{ left: `${5 + i * 6.7}%` }}
                  >
                    ✨
                  </motion.span>
                ))}
                {/* Bandeau « RENCONTRE LÉGENDAIRE » */}
                <motion.div
                  initial={{ x: '-120%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.35 }}
                  className="absolute top-16 left-0 right-0 py-1.5 text-[11px] font-black tracking-[0.3em] text-[#2A1F1A]"
                  style={{ background: 'linear-gradient(90deg, transparent, #FFD34E, #FFB020, #FFD34E, transparent)' }}
                >
                  {tr('★ RENCONTRE LÉGENDAIRE ★', '★ LEGENDARY ENCOUNTER ★')}
                </motion.div>
              </>
            )}
            <motion.div
              initial={{ scale: 0.3, rotate: -14, y: -60, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 13 }}
              className="mb-3"
            >
              <motion.div
                animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="w-28 h-28 mx-auto rounded-2xl overflow-hidden border-4 border-[#D94F4F] shadow-[0_6px_24px_rgba(217,79,79,0.5)] flex items-center justify-center bg-[#2A1F1A]"
              >
                {currentCombat.image && !imgError ? (
                  <img src={currentCombat.image} alt="" onError={() => setImgError(true)} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">{currentCombat.enemyEmoji}</span>
                )}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ scale: 2.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.12 }}
              className={`font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] tracking-widest ${isKing ? 'text-3xl' : 'text-4xl'}`}
              style={isKing ? { color: '#FFD34E', WebkitTextStroke: '1px #8B5A00' } : { color: '#D94F4F' }}
            >
              {isKing ? tr('👑 LE ROI EN PERSONNE 👑', '👑 THE KING HIMSELF 👑') : `⚔️ ${tr('BAGARRE', 'FIGHT')} ⚔️`}
            </motion.div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="text-xl text-white font-bold mt-2 drop-shadow"
            >
              {currentCombat.enemyEmoji} {tc(currentCombat.enemyName)}
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="text-sm text-white/85 italic mt-2 max-w-xs leading-snug"
            >
              {isKing
                ? tc(currentCombat.description)
                : `« ${tr(brawl.fr, brawl.en)} »`}
            </motion.p>
            {/* L'enjeu, dit clairement : c'est la couronne qui se joue. */}
            {isKing && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-xs font-bold text-[#FFD34E] mt-3 max-w-xs leading-snug"
              >
                {kingIsHeir()
                  ? tr('Battez-le et la couronne vous revient. Perdez, et il règne encore.',
                       'Beat him and the crown is yours. Lose, and he reigns on.')
                  : tr('Le tout premier Roi du Carton. Personne ne l\'a jamais détrôné.',
                       'The very first Cardboard King. Nobody has ever dethroned him.')}
              </motion.p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1.1 }}
              className="text-[11px] text-white/60 mt-5"
            >
              {tr('Touchez pour commencer', 'Tap to begin')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 0, Duel de signes                                            */
/* ------------------------------------------------------------------ */
const SIGN_ORDER: SignId[] = ['strike', 'feint', 'guard'];

function SignPhase({ combat, character, onPick, onFlee }: {
  combat: CombatState;
  character: Character;
  onPick: (sign: SignId | 'special') => void;
  onFlee: () => void;
}) {
  const lang = useLang();
  const [choice, setChoice] = useState<SignId | 'special' | null>(null);
  const special = combat.specialId ? SPECIAL_DEFS.find(s => s.id === combat.specialId) : undefined;
  const usesLeft = 2 - combat.specialUses;
  // Arme lourde : les accrochages (égalités) tournent pour vous, affiché
  // pour que l'achat d'une batte se sente dès le duel de signes.
  const weapon = bestWeapon(character);
  const heavyWeapon = weapon?.combatStyle === 'heavy' ? weapon : undefined;

  // Indice de la manche : phrase piochée une fois pour toutes.
  const tellText = useMemo(() => {
    if (!combat.tellSign) return null;
    const def = SIGNS[combat.tellSign];
    const list = lang === 'en' ? def.tellsEn : def.tells;
    return list[Math.floor(Math.random() * list.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.signNonce, lang]);

  const pick = (s: SignId | 'special') => {
    if (choice) return;
    setChoice(s);
    playCard();
    setTimeout(() => onPick(s), 1350);
  };

  // Verdict affiché pendant la révélation (reflète la résolution du reducer).
  const verdict = ((): { txt: string; tone: 'good' | 'bad' | 'neutral' } | null => {
    if (!choice) return null;
    if (choice === 'special') {
      if (!special) return null;
      if (special.id === 'haleine') return combat.enemySign === 'guard' ? { txt: tr('Contré !', 'Countered!'), tone: 'bad' } : { txt: tr('Ça porte !', 'It lands!'), tone: 'good' };
      if (special.id === 'piege') return combat.enemySign === 'strike' ? { txt: tr('CLAC ! En plein dedans !', 'SNAP! Right in it!'), tone: 'good' } : { txt: tr('Piège posé…', 'Trap set…'), tone: 'neutral' };
      if (special.id === 'pas-de-cote') return { txt: tr('Son jeu est lu !', 'Its game is read!'), tone: 'good' };
      return { txt: tr('Vous parlementez…', 'You parley…'), tone: 'neutral' };
    }
    const p = SIGNS[choice];
    if (p.beats === combat.enemySign) return { txt: tr('Vous prenez l\'avantage !', 'You take the upper hand!'), tone: 'good' };
    if (choice === combat.enemySign) return { txt: tr('Égalité ! Accrochage !', 'Tie! Clash!'), tone: 'neutral' };
    return { txt: tr('Il vous a lu… Esquivez !', 'It read you… Dodge!'), tone: 'bad' };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm flex flex-col items-center gap-3 mt-1"
    >
      {/* Indice (tell) */}
      <div className={`w-full rounded-xl px-3 py-2 text-center text-sm ${combat.tellSign ? 'bg-[#F2C14E]/15 text-[#8B6B4A]' : 'bg-[#E9E0D4] text-[#A08B70]'}`}>
        {combat.tellSign ? (
          <>👁️ <em>{tellText}</em>{combat.tellSure && <span className="ml-1 text-[10px] font-bold text-[#3d8b4f]">{tr('(indice sûr)', '(sure tell)')}</span>}</>
        ) : (
          <>🃏 {tr('Il ne laisse rien paraître…', 'It gives nothing away…')}</>
        )}
      </div>

      {/* Les trois signes */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        {SIGN_ORDER.map((id, i) => {
          const s = SIGNS[id];
          const beats = SIGNS[s.beats];
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 16, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 22 }}
              whileHover={liftHover}
              whileTap={stampTap}
              disabled={!!choice}
              onClick={() => pick(id)}
              className="craft-card-solid p-3 flex flex-col items-center text-center gap-1 disabled:opacity-60"
              style={{ border: '2px solid #E0C9AC' }}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-sm font-bold text-[#2A1F1A] leading-tight">{lang === 'en' ? s.nameEn : s.name}</span>
              <span className="text-[10px] text-[#8B6B4A]">{tr('bat', 'beats')} {beats.emoji} {lang === 'en' ? beats.nameEn : beats.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Arme lourde : rappel de son effet sur les accrochages */}
      {heavyWeapon && (
        <div className="text-[10px] text-[#8B6B4A] bg-[#E9E0D4] rounded-full px-3 py-1">
          🏏 {tc(heavyWeapon.name)}, {tr('les accrochages tournent pour vous.', 'clashes turn in your favor.')}
        </div>
      )}

      {/* Coup spécial (traits) */}
      {special && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={stampTap}
          disabled={!combat.specialCharged || usesLeft <= 0 || !!choice}
          onClick={() => pick('special')}
          className="w-full craft-card-solid p-3 flex items-center gap-3 text-left disabled:opacity-55"
          style={{ border: combat.specialCharged && usesLeft > 0 ? '2px solid #F2C14E' : '2px dashed #D8C4A8' }}
        >
          <motion.span
            className="text-3xl"
            animate={combat.specialCharged && usesLeft > 0 ? { scale: [1, 1.18, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            {special.emoji}
          </motion.span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-[#2A1F1A]">{lang === 'en' ? special.nameEn : special.name}
              <span className="ml-1.5 text-[10px] font-normal text-[#A08B70]">{'●'.repeat(Math.max(0, usesLeft))}{'○'.repeat(Math.max(0, 2 - usesLeft))}</span>
            </span>
            <span className="block text-[10px] text-[#6B5740] leading-snug">{lang === 'en' ? special.descEn : special.desc}</span>
            <span className={`block text-[10px] font-semibold mt-0.5 ${combat.specialCharged && usesLeft > 0 ? 'text-[#B8860B]' : 'text-[#A08B70]'}`}>
              {usesLeft <= 0 ? tr('Épuisé pour ce combat', 'Spent for this fight') : combat.specialCharged ? tr('⚡ Chargé !', '⚡ Charged!') : tr('Gagnez une manche pour charger', 'Win a round to charge')}
            </span>
          </span>
        </motion.button>
      )}

      {/* Fuite (toujours possible avant l'échange) */}
      <button
        onClick={() => { if (!choice) { playTurnedAway(); onFlee(); } }}
        className="text-xs text-[#8B6B4A] underline underline-offset-2 decoration-[#D8C4A8]"
      >
        🏃 {tr('Tenter de fuir', 'Try to flee')}
      </button>

      {/* Révélation des signes */}
      <AnimatePresence>
        {choice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-6"
            style={{ background: 'rgba(42,31,26,0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="craft-card-solid p-5 flex flex-col items-center gap-3 w-full max-w-xs"
            >
              <div className="flex items-center justify-center gap-5">
                <div className="flex flex-col items-center">
                  <span className="text-4xl">{choice === 'special' ? special?.emoji : SIGNS[choice as SignId].emoji}</span>
                  <span className="text-[10px] text-[#8B6B4A] mt-1">{tr('Vous', 'You')}</span>
                </div>
                <span className="text-lg font-black text-[#B84A3A]">VS</span>
                <motion.div
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl">{SIGNS[combat.enemySign].emoji}</span>
                  <span className="text-[10px] text-[#8B6B4A] mt-1 max-w-20 truncate">{tc(combat.enemyName)}</span>
                </motion.div>
              </div>
              {verdict && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className={`text-base font-bold ${verdict.tone === 'good' ? 'text-[#3d8b4f]' : verdict.tone === 'bad' ? 'text-[#B84A3A]' : 'text-[#8B6B4A]'}`}
                >
                  {verdict.txt}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 1, Esquive                                                   */
/* ------------------------------------------------------------------ */
function DodgeArena({ combat, character, onDone }: { combat: CombatState; character: Character; onDone: (hits: number) => void }) {
  const lang = useLang();
  const pattern = PROJECTILE_PATTERNS[combat.pattern] || PROJECTILE_PATTERNS.brute;
  const hasAgile = character.traits.some((t) => t.id === 'agile');
  const telegraph = character.traits.some((t) => t.id === 'nez-sensible' || t.id === 'paranoiaque');

  const R = hasAgile ? 11 : 15;
  const SPEED = hasAgile ? 205 : 168;
  // Les ennemis qui cognent fort tirent plus dense : un adversaire à 17 d'attaque
  // (le Vigile de Choc) rend l'esquive nettement plus serrée qu'un pigeon.
  // La cadence de base est modérée parce que les tirs sont désormais ADRESSÉS
  // (voir data/dodge) : moins de projectiles, mais tous pour vous.
  const atkMul = 1 + Math.max(0, combat.enemyAttack - 8) * 0.035;
  const densityMul = 1.05 * atkMul * (1 + (combat.round - 1) * 0.14) * (combat.enemyStunned ? 0.5 : 1) * (combat.dodgePenalty || 1);
  const speedMul = 1.16 * (1 + (combat.round - 1) * 0.07) * (combat.enemyStunned ? 0.8 : 1);

  // On démarre au centre : tous les côtés de l'arène sont à portée, et aucun
  // coin ne peut plus servir d'abri.
  const posRef = useRef({ x: ARENA / 2, y: ARENA / 2 });
  const projRef = useRef<DodgeProj[]>([]);
  const keysRef = useRef<Set<Dir>>(new Set());
  const hitsRef = useRef(0);
  const iframeRef = useRef(0);
  const projId = useRef(0);
  // Prochain instant où un frôlement peut se faire entendre.
  const froleRef = useRef(0);
  const [, force] = useState(0);
  const [flash, setFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const doneRef = useRef(false);
  // Tant que le joueur n'a pas posé le doigt, on lui montre comment faire.
  const [touched, setTouched] = useState(false);

  const spawn = useCallback((now: number) => {
    const wave = spawnWave(
      pattern,
      posRef.current,
      pattern.speed * speedMul,
      () => ++projId.current,
      telegraph ? now + 420 : 0,
    );
    /*
     * L'ADVERSAIRE PREND SON ÉLAN, ET ON L'ENTEND.
     *
     * La volée arrivait en silence : on la voyait ou on la prenait. Le son
     * part À L'APPARITION de la vague, donc avant qu'elle traverse — c'est ce
     * qui en fait une information et non un commentaire. Le nez sensible et le
     * paranoïaque ont en plus leurs 420 ms d'avance visuelle ; les autres ont
     * au moins l'oreille.
     */
    playCombatCharge();
    projRef.current.push(...wave);
  }, [pattern, speedMul, telegraph]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const start = last;
    let nextSpawn = last + 300;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = now - start;
      setTimeLeft(Math.max(0, 1 - elapsed / DURATION));

      // Déplacement du joueur.
      let dx = 0, dy = 0;
      const k = keysRef.current;
      if (k.has('left')) dx -= 1; if (k.has('right')) dx += 1;
      if (k.has('up')) dy -= 1; if (k.has('down')) dy += 1;
      if (dx || dy) { const d = Math.hypot(dx, dy); const p = posRef.current; p.x += (dx / d) * SPEED * dt; p.y += (dy / d) * SPEED * dt; p.x = Math.max(R, Math.min(ARENA - R, p.x)); p.y = Math.max(R, Math.min(ARENA - R, p.y)); }

      // Apparition des projectiles.
      const interval = pattern.spawnMs / densityMul;
      while (now >= nextSpawn && elapsed < DURATION) { spawn(now); nextSpawn += interval; }

      // Déplacement + collisions.
      projRef.current = stepProjectiles(
        projRef.current, pattern, posRef.current, R, dt, now, () => iframeRef.current,
        () => {
          hitsRef.current += 1; iframeRef.current = now + IFRAME;
          setFlash(true); setTimeout(() => setFlash(false), 160); playHurt(); playVoix('douleur');
          // Un coup encaissé annule le frôlement : on ne frôle pas ce qui touche.
          froleRef.current = now + 500;
        },
      );

      /*
       * LE FRÔLEMENT — la récompense de l'esquive serrée.
       *
       * Passer à un cheveu d'un projectile ne produisait rien : esquiver de
       * justesse et esquiver largement se ressemblaient. Le souffle du tissu
       * qui passe transforme la seconde en exploit, sans rien changer aux
       * règles. Espacé d'un demi-tour de main pour qu'une volée dense ne le
       * transforme pas en crécelle.
       */
      if (now > froleRef.current) {
        const p = posRef.current;
        const frole = projRef.current.some(q => {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          return d > R && d < R * 2.1;
        });
        if (frole) { froleRef.current = now + 450; playCombatEsquive(); }
      }
      force((n) => n + 1);

      if (elapsed >= DURATION) {
        if (!doneRef.current) {
          doneRef.current = true;
          // Zéro coup encaissé. Le silence de l'impact était déjà la
          // récompense ; encore fallait-il que quelque chose la nomme.
          if (hitsRef.current === 0) playCombatEsquiveParfaite();
          setTimeout(() => onDone(hitsRef.current), 250);
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clavier (ZQSD / WASD / flèches).
  useEffect(() => {
    const map: Record<string, Dir> = {
      arrowup: 'up', z: 'up', w: 'up', arrowdown: 'down', s: 'down',
      arrowleft: 'left', q: 'left', a: 'left', arrowright: 'right', d: 'right',
    };
    const down = (e: KeyboardEvent) => { const dir = map[e.key.toLowerCase()]; if (dir) { e.preventDefault(); keysRef.current.add(dir); setTouched(true); } };
    const up = (e: KeyboardEvent) => { const dir = map[e.key.toLowerCase()]; if (dir) keysRef.current.delete(dir); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  /* ---- Le doigt, et rien d'autre ----------------------------------------
   * Plus de croix directionnelle : on tient le personnage et on le promène.
   * Le glissé est RELATIF (on garde l'écart entre le doigt et le personnage),
   * pour que la main ne vienne pas masquer ce qu'on essaie d'esquiver. Poser
   * le doigt loin du personnage l'amène quand même sous le doigt : ça évite
   * de chercher la « poignée » en pleine volée de projectiles.
   */
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const toArena = (clientX: number, clientY: number) => {
    const el = arenaRef.current; if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scale = ARENA / rect.width;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  };
  const place = (x: number, y: number) => {
    posRef.current.x = Math.max(R, Math.min(ARENA - R, x));
    posRef.current.y = Math.max(R, Math.min(ARENA - R, y));
  };
  const grab = (clientX: number, clientY: number) => {
    const a = toArena(clientX, clientY); if (!a) return;
    const p0 = posRef.current;
    const far = Math.hypot(a.x - p0.x, a.y - p0.y) > 62;
    if (far) { place(a.x, a.y); dragRef.current = { dx: 0, dy: 0 }; }
    else dragRef.current = { dx: p0.x - a.x, dy: p0.y - a.y };
    setTouched(true);
  };
  const drag = (clientX: number, clientY: number) => {
    const d = dragRef.current; if (!d) return;
    const a = toArena(clientX, clientY); if (!a) return;
    place(a.x + d.dx, a.y + d.dy);
  };

  const p = posRef.current;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-2 w-full"
    >
      <div className="text-xs font-semibold text-[#B84A3A]">{tr('Esquivez !', 'Dodge!')} <span className="text-[#8B6B4A] font-normal">· {lang === 'en' ? pattern.labelEn : pattern.label}{telegraph ? tr(' · 👃 danger flairé', ' · 👃 danger sensed') : ''}</span></div>

      {/* Arène */}
      <div
        ref={arenaRef}
        role="application"
        aria-label={tr('Arène d\'esquive : glissez le doigt pour déplacer votre personnage', 'Dodge arena: drag your finger to move your character')}
        className="relative rounded-xl overflow-hidden"
        style={{ width: 'min(300px, 82vw)', aspectRatio: '1 / 1', background: 'radial-gradient(circle at 50% 40%, #2E2438, #1C1622)', border: '3px solid #3A2A1E', touchAction: 'none' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); grab(e.clientX, e.clientY); }}
        onPointerMove={(e) => drag(e.clientX, e.clientY)}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        {/* Le sol de l'arène : diorama s'il existe, dégradé sinon. Volontairement
            en retrait — les projectiles doivent rester lisibles par-dessus. */}
        <SafeImg src="/assets/arene-esquive.webp" className="absolute inset-0 w-full h-full object-cover opacity-45" />

        {/* jauge de temps */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/30">
          <div className="h-full bg-[#F2C14E]" style={{ width: `${timeLeft * 100}%` }} />
        </div>

        {/* projectiles */}
        {projRef.current.map((pr) => {
          const st = KIND_STYLE[pr.kind] || KIND_STYLE.fist;
          const armed = pr.armUntil === 0 || performance.now() >= pr.armUntil;
          return (
            <div
              key={pr.id}
              style={{
                position: 'absolute',
                left: `${(pr.x / ARENA) * 100}%`, top: `${(pr.y / ARENA) * 100}%`,
                width: pr.size, height: st.shape === 'rect' ? pr.size * 0.7 : pr.size,
                transform: 'translate(-50%,-50%)',
                background: st.color, opacity: armed ? 0.95 : 0.35,
                borderRadius: st.shape === 'rect' ? 3 : '50%',
                border: '2px solid #3A2A1E',
              }}
            />
          );
        })}

        {/* joueur */}
        <motion.div
          style={{ position: 'absolute', left: `${(p.x / ARENA) * 100}%`, top: `${(p.y / ARENA) * 100}%`, transform: 'translate(-50%,-50%)', width: R * 2.4, height: R * 2.4 }}
          animate={{ opacity: flash ? [1, 0.2, 1] : 1 }}
          transition={{ duration: 0.16 }}
        >
          {/* Tant que le doigt n'est pas venu, un halo respire autour du
              personnage : c'est LUI qu'on attrape. */}
          {!touched && (
            <motion.span
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -14, border: '2px dashed rgba(242,193,78,0.85)' }}
              animate={{ scale: [1, 1.16, 1], opacity: [0.9, 0.35, 0.9] }}
              transition={{ repeat: Infinity, duration: 1.25 }}
            />
          )}
          <div className="w-full h-full rounded-full overflow-hidden" style={{ boxShadow: flash ? '0 0 0 3px #D94F4F' : '0 0 0 2px rgba(242,193,78,0.7)' }}>
            <PlayerFace char={character} size={Math.round(R * 2.4)} />
          </div>
        </motion.div>

        {/* Apprentissage sans texte : un doigt fantôme fait la démonstration
            du glissé, et disparaît dès que le joueur prend la main. */}
        <AnimatePresence>
          {!touched && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-3"
            >
              <motion.span
                className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                style={{ position: 'absolute', top: '50%', marginTop: R + 10 }}
                animate={{ x: [-52, 52, -52], opacity: [0.45, 1, 0.45] }}
                transition={{ repeat: Infinity, duration: 2.1, ease: 'easeInOut' }}
              >
                👆
              </motion.span>
              <span className="text-[11px] font-semibold text-[#F2C14E] bg-black/45 rounded-full px-2.5 py-1">
                {tr('Glissez le doigt pour esquiver', 'Drag your finger to dodge')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Phase 2, Riposte (cartes)                                          */
/* ------------------------------------------------------------------ */
function CardHand({ combat, character, onPlay }: { combat: CombatState; character: Character; onPlay: (cardId: string) => void }) {
  const lang = useLang();
  const [played, setPlayed] = useState(false);
  const cards = combat.hand.map((id) => getCard(id)).filter(Boolean) as CombatCard[];

  const play = (id: string) => { if (played) return; setPlayed(true); playCard(); setTimeout(() => onPlay(id), 220); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-sm flex flex-col items-center gap-3 mt-1"
    >
      <div className="text-sm font-semibold text-[#2A1F1A]">{tr('Ripostez !', 'Counter-attack!')} <span className="text-xs text-[#8B6B4A] font-normal">({cards.length} {tr('carte', 'card')}{cards.length > 1 ? 's' : ''})</span></div>
      <div className={`grid gap-2.5 w-full ${cards.length >= 3 ? 'grid-cols-3' : cards.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, y: 16, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.06 * i, type: 'spring', stiffness: 320, damping: 22 }}
            whileHover={liftHover}
            whileTap={stampTap}
            disabled={played}
            onClick={() => play(card.id)}
            className="craft-card-solid p-3 flex flex-col items-center text-center gap-1.5 disabled:opacity-60"
            style={{ border: '2px solid #E0C9AC' }}
          >
            <span className="text-3xl">{card.emoji}</span>
            <span className="text-sm font-bold text-[#2A1F1A] leading-tight">{lang === 'en' ? card.nameEn : card.name}</span>
            <span className="text-[10px] text-[#6B5740] leading-snug">{lang === 'en' ? card.descEn : card.desc}</span>
            <span className={`text-[10px] font-mono font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
              card.kind === 'attack' ? 'bg-[#D94F4F]/10 text-[#B84A3A]'
                : card.kind === 'heal' ? 'bg-[#4A9B5F]/10 text-[#3d8b4f]'
                : card.kind === 'flee' ? 'bg-[#8B6B4A]/10 text-[#8B6B4A]'
                : 'bg-[#7B68EE]/10 text-[#7B68EE]'
            }`}>
              {card.estimate(character, combat)}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
