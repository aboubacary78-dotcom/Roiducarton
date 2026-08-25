import {
  useGame, BEG_SPOTS, randomFromArray,
  BEG_TUNING, rollPasserByFor, passerByEnemy, gazeSpeed, begMods, voixPassant,
} from '@/contexts/GameContext';
import type { PasserBy } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playCoin, playHurt, playMiss, playPassantAgace, playPassantRefus, playPoliceApproche, playPoliceIntervention, playPolicePresence, playStep, playTensionTic } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import MinigameIntro, { introSeen } from './MinigameIntro';
import MinigameHelpButton from './MinigameHelpButton';
import CardboardAvatar from './CardboardAvatar';
import LocationBackdrop from './LocationBackdrop';

/*
 * LA MANCHE — « tenir le regard ».
 *
 * L'ancien mini-jeu consistait à taper des pièces qui apparaissaient au
 * hasard : aucune décision, aucun rapport avec le fait de mendier. Celui-ci
 * part du sujet. Mendier, c'est :
 *   - se faire voir (l'anneau qui se remplit pendant qu'on tient le regard) ;
 *   - CHOISIR qui solliciter, puisqu'on ne peut en suivre qu'un à la fois ;
 *   - insister, ou pas — ça rapporte plus et ça coûte de la dignité ;
 *   - savoir s'arrêter quand la ronde passe ;
 *   - et savoir à qui on s'adresse : certains, poussés à bout, ne se
 *     contentent pas de râler (voir data/passersby).
 *
 * La rue est celle du quartier où l'on mendie (LocationBackdrop) et la foule
 * aussi : la gare a ses touristes, la zone industrielle a surtout des ennuis.
 */

const W = 320;          // largeur logique de la rue
const H = 300;          // hauteur logique
const LANES = [0.34, 0.52, 0.7, 0.86]; // hauteurs de marche (perspective)

interface Walker {
  id: number;
  def: PasserBy;
  seed: string;
  lane: number;
  dir: 1 | -1;          // sens de marche
  born: number;
  gaze: number;         // 0..1 : le regard accroché
  insistS: number;      // secondes d'insistance au-delà de l'anneau plein
  done?: 'gave' | 'left' | 'angry';
  gain: number;         // ce qu'on lui a soutiré
  dernierRale: number;  // secondes d'insistance au dernier grognement
}

/*
 * TOUTES LES COMBIEN IL RÂLE.
 *
 * La patience la plus courte du jeu est de 1,1 s et la plus longue de 5 s. Un
 * grognement toutes les 0,9 s donne donc au moins UN son à tout le monde — y
 * compris au gars à la casquette qu'on ne retient jamais longtemps — sans
 * transformer le retraité du banc en boucle de râles.
 */
const RALE_TOUS_LES_S = 0.9;

export default function BegMinigame() {
  const [ready, setReady] = useState(() => introSeen('beg2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="beg2"
        emoji="🎩"
        title="La manche"
        titleEn="Begging"
        lines={[
          { emoji: '👆', fr: 'Posez le doigt sur un passant et SUIVEZ-LE sans lâcher : l\'anneau se remplit tant que vous tenez son regard.', en: 'Put a finger on a passer-by and FOLLOW them without letting go: the ring fills while you hold their gaze.' },
          { emoji: '🎯', fr: 'Vous ne pouvez en suivre qu\'un. Lâcher quelqu\'un à mi-anneau pour un meilleur passant, c\'est tout le jeu.', en: 'You can only follow one. Dropping someone half-way for a better mark is the whole game.' },
          { emoji: '👑', fr: 'Une allure soignée vous fait remarquer plus vite. Débraillé, on regarde ailleurs.', en: 'A tidy look gets you noticed faster. Unkempt, people look away.' },
          { emoji: '😤', fr: 'Continuez APRÈS l\'anneau plein et vous soutirez davantage — mais vous y laissez votre dignité, et certains se braquent.', en: 'Keep going AFTER the ring fills and you squeeze out more — but it costs your dignity, and some people snap.' },
          { emoji: '👮', fr: 'Quand la ronde passe, LÂCHEZ TOUT LE MONDE. Ne rien faire, à ce moment-là, c\'est jouer.', en: 'When the patrol goes by, LET GO OF EVERYONE. Doing nothing, right then, is playing.' },
        ]}
        image="/assets/intro-manche.webp"
        scene="friend"
        onStart={() => setReady(true)}
      />
    );
  }
  return (
    <>
      <MinigameHelpButton onOpen={() => setReady(false)} />
      <BegMinigameInner />
    </>
  );
}

function BegMinigameInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  // Tout ce que le caractère change dans la rue, en un endroit (data/passersby).
  const mods = useState(() => begMods(state.character!))[0];
  const location = char?.location || 'centre-ville';

  const T = BEG_TUNING;
  // Par mauvais temps, tout le monde rentre. Le Résistant au Froid, lui, reste
  // planté là : sa session dure plus longtemps là où les autres abandonnent.
  const roughWeather = state.weather === 'rainy' || state.weather === 'snow' || state.weather === 'storm';
  const roundMs = T.roundMs * (mods.coldProof && roughWeather ? 1.35 : 1);
  const [spot] = useState(() => randomFromArray(BEG_SPOTS));
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [coins, setCoins] = useState(0);
  const [dignitySpent, setDignitySpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const [copOn, setCopOn] = useState(false);
  const [copX, setCopX] = useState(-0.2);
  const [copSoon, setCopSoon] = useState(false);
  const [held, setHeld] = useState<number | null>(null);
  const [ended, setEnded] = useState<null | 'time' | 'cop' | 'fight'>(null);
  // Dernière seconde annoncée, pour ne pas rejouer le tic à chaque image.
  const dernierTicRef = useRef<number | null>(null);
  const [toast, setToast] = useState<{ txt: string; tone: 'good' | 'bad'; key: number } | null>(null);

  const walkersRef = useRef<Walker[]>([]);
  const idRef = useRef(0);
  const coinsRef = useRef(0);
  const dignityRef = useRef(0);
  const heldRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  const copRef = useRef(false);
  const warnRef = useRef(false);
  const fightRef = useRef<string | null>(null);
  const streetRef = useRef<HTMLDivElement | null>(null);

  // L'allure fait l'essentiel ; le caractère module (charisme, haleine).
  const speed = gazeSpeed(char?.stats.dignity ?? 40, false) * mods.gazeMul;

  function finish(reason: 'time' | 'cop' | 'fight') {
    if (endedRef.current) return;
    endedRef.current = true;
    setEnded(reason);
    if (reason === 'cop') playPoliceIntervention();
    else if (reason !== 'time') playHurt();
    setTimeout(() => dispatch({
      type: 'RESOLVE_BEG',
      coins: Math.round(coinsRef.current),
      copTapped: reason === 'cop',
      dignitySpent: Math.round(dignityRef.current),
      fightWith: reason === 'fight' ? fightRef.current || undefined : undefined,
    }), 1300);
  }

  function say(txt: string, tone: 'good' | 'bad') {
    setToast({ txt, tone, key: Date.now() });
  }

  // ---- Boucle de jeu ----
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let last = start;
    let nextSpawn = start + 400;
    let nextCop = start + T.copEveryMs;
    let copUntil = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const elapsed = now - start;
      setTimeLeft(Math.max(0, 1 - elapsed / roundMs));

      // La ronde de police : elle traverse, et pendant ce temps il faut
      // avoir les mains dans les poches.
      if (now >= nextCop && elapsed < roundMs - 2000) {
        copUntil = now + T.copStayMs;
        nextCop = now + T.copEveryMs + Math.random() * 3000;
      }
      // Le nez sensible et le paranoïaque sentent la ronde arriver : ils ont
      // le temps de retirer la main, les autres se font cueillir.
      const warn = mods.copWarnMs > 0 && now >= nextCop - mods.copWarnMs && now < nextCop;
      if (warn !== warnRef.current) {
        warnRef.current = warn;
        setCopSoon(warn);
        // Le flair sert enfin à quelque chose sans regarder l'écran.
        if (warn) playPoliceApproche();
      }
      const copHere = now < copUntil;
      if (copHere !== copRef.current) {
        copRef.current = copHere;
        setCopOn(copHere);
        // Elle entre par le bord de l'écran, là où le joueur ne regarde pas :
        // il suit un passant du doigt. L'oreille est le seul canal libre.
        if (copHere) playPolicePresence();
      }
      if (copHere) setCopX(1 - (copUntil - now) / T.copStayMs);

      // Arrivée des passants.
      const alive = walkersRef.current.filter(w => !w.done);
      if (now >= nextSpawn && elapsed < roundMs - 1500 && alive.length < T.maxOnScreen) {
        const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
        walkersRef.current = [...walkersRef.current, {
          id: ++idRef.current,
          def: rollPasserByFor(location, mods),
          seed: `passant-${idRef.current}-${Math.random().toString(36).slice(2, 7)}`,
          lane: LANES[Math.floor(Math.random() * LANES.length)],
          dir, born: now,
          // Un pigeon sur l'épaule et certains s'arrêtent d'eux-mêmes : le
          // regard est déjà à moitié accroché avant même qu'on les touche.
          gaze: mods.autoStop > 0 && Math.random() < mods.autoStop ? 0.6 : 0,
          insistS: 0, gain: 0, dernierRale: -RALE_TOUS_LES_S,
        }];
        nextSpawn = now + T.spawnMs;
      }

      const heldId = heldRef.current;
      walkersRef.current = walkersRef.current.filter(w => {
        if (w.done) return now - w.born < 60000; // gardés le temps de l'animation de sortie
        const t = (now - w.born) / (w.def.crossS * 1000);
        if (t >= 1) { w.done = 'left'; return true; }

        if (w.id === heldId && !copRef.current) {
          if (w.gaze < 1) {
            // On tient son regard : l'anneau se remplit.
            w.gaze = Math.min(1, w.gaze + (dt / w.def.holdS) * speed);
            if (w.gaze >= 1) {
              w.gain += w.def.give;
              coinsRef.current += w.def.give;
              setCoins(coinsRef.current);
              playCoin();
              /*
               * ON REÇOIT DE LA MONNAIE, PAS UN CABAS.
               *
               * Le gain s'annonçait avec le `tell` du passant — « 🛍️ +1 »,
               * « 👶 +2 ». Ce détail sert à RECONNAÎTRE quelqu'un dans la rue
               * d'un coup d'œil, et il continue de le faire sur son avatar.
               * Collé devant un « +1 », il se lit comme ce qu'on vient de
               * recevoir : le joueur croyait empocher un sac de courses ou un
               * bébé. Ici, dans le chapeau, il ne tombe que des pièces.
               */
              say(`🪙 +${w.def.give}`, 'good');
            }
          } else {
            // Anneau plein et on ne lâche pas : on insiste.
            w.insistS += dt;
            const add = w.def.insistGive * dt;
            w.gain += add;
            coinsRef.current += add;
            dignityRef.current += w.def.insistCost * dt;
            setCoins(coinsRef.current);
            setDignitySpent(dignityRef.current);
            // Il grogne pendant qu'on le retient. C'est le seul retour qui dise
            // que la dignité part MAINTENANT, sans quitter la rue des yeux.
            if (w.insistS - w.dernierRale >= RALE_TOUS_LES_S) {
              w.dernierRale = w.insistS;
              playPassantAgace(voixPassant(w.def, w.seed));
            }
            if (w.insistS >= w.def.patienceS) {
              // La patience est finie. Certains râlent, d'autres cognent.
              w.done = 'angry';
              heldRef.current = null; setHeld(null);
              const enemy = passerByEnemy(w.def);
              if (enemy && Math.random() < (w.def.fightChance ?? 0)) {
                fightRef.current = enemy.name;
                // Il se braque D'ABORD, il frappe ensuite (`finish` joue le
                // coup). Les deux playHurt d'affilée d'avant ne racontaient
                // rien : c'était le même bruit deux fois.
                playPassantRefus(voixPassant(w.def, w.seed));
                finish('fight');
                return true;
              }
              dignityRef.current += 4;
              setDignitySpent(dignityRef.current);
              // Sa voix, pas un coup encaissé : personne ne vous a touché.
              playPassantRefus(voixPassant(w.def, w.seed));
              say(tr('« Lâchez-moi ! »', '"Leave me alone!"'), 'bad');
            }
          }
        }
        return true;
      });

      setWalkers([...walkersRef.current]);

      /*
       * LES DIX DERNIÈRES SECONDES SE COMPTENT À L'OREILLE.
       *
       * La barre de temps est en haut de l'écran, et le pouce du joueur est en
       * bas, sur les passants. Il ne la regarde jamais : la manche se
       * terminait donc toujours par surprise. Un tic par seconde sur la fin,
       * et le dernier geste devient un choix au lieu d'un hasard.
       *
       * Le fichier ne contient qu'un tic — c'est ici qu'on décide du tempo.
       */
      const resteS = Math.max(0, (roundMs - elapsed) / 1000);
      if (resteS <= 10) {
        const tic = Math.ceil(resteS);
        if (tic !== dernierTicRef.current) {
          dernierTicRef.current = tic;
          playTensionTic();
        }
      }

      if (elapsed >= roundMs) { finish('time'); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position horizontale d'un passant, 0..1 dans le sens de sa marche.
  const posX = (w: Walker) => {
    const t = Math.min(1, (performance.now() - w.born) / (w.def.crossS * 1000));
    return w.dir === 1 ? t : 1 - t;
  };

  function toStreet(clientX: number, clientY: number) {
    const el = streetRef.current; if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * W, y: ((clientY - r.top) / r.height) * H };
  }

  function grab(clientX: number, clientY: number) {
    if (endedRef.current) return;
    const p = toStreet(clientX, clientY); if (!p) return;
    // Solliciter pendant la ronde, c'est chercher les ennuis.
    if (copRef.current) {
      finish('cop');
      return;
    }
    let best: Walker | null = null, bestD = Infinity;
    for (const w of walkersRef.current) {
      if (w.done) continue;
      const d = Math.hypot(posX(w) * W - p.x, w.lane * H - p.y);
      if (d < T.grabR && d < bestD) { best = w; bestD = d; }
    }
    if (!best) return;
    heldRef.current = best.id;
    setHeld(best.id);
    playStep();
  }

  function track(clientX: number, clientY: number) {
    const id = heldRef.current; if (id === null) return;
    const p = toStreet(clientX, clientY); if (!p) return;
    const w = walkersRef.current.find(x => x.id === id);
    // On perd le regard si le doigt décroche de la personne.
    if (!w || w.done || Math.hypot(posX(w) * W - p.x, w.lane * H - p.y) > T.grabR + 18 + mods.extraGrab) {
      heldRef.current = null; setHeld(null);
      if (w && !w.done && w.gaze > 0 && w.gaze < 1) playMiss();
    }
  }

  if (!char) return null;

  const heldWalker = walkers.find(w => w.id === held);

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-2.5 select-none">
      {/* En-tête */}
      <div className="text-center shrink-0">
        <h1 className="text-2xl text-[#2A1F1A]">{tr('La manche', 'Begging')}</h1>
        <p className="text-xs text-[#8B6B4A] mt-0.5">{tc(spot)}</p>
      </div>

      {/* Récolte + dignité dépensée */}
      <div className="w-full max-w-sm flex gap-2 shrink-0">
        <div className="flex-1 craft-card px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B5740]">🎩 {tr('Chapeau', 'Hat')}</span>
          <span className="text-sm font-mono font-bold text-[#B8860B]">{Math.round(coins)}</span>
        </div>
        <div className="flex-1 craft-card px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B5740]">👑 {tr('Fierté laissée', 'Pride spent')}</span>
          <span className="text-sm font-mono font-bold text-[#B84A3A]">−{Math.round(dignitySpent)}</span>
        </div>
      </div>

      {/* La rue du quartier */}
      <div
        ref={streetRef}
        role="application"
        aria-label={tr('Rue : suivez un passant du doigt pour tenir son regard', 'Street: follow a passer-by with your finger to hold their gaze')}
        className="relative rounded-xl overflow-hidden shrink-0"
        style={{
          width: 'min(320px, 90vw)', aspectRatio: '320 / 300', touchAction: 'none',
          border: '3px solid #3A2A1E',
        }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); grab(e.clientX, e.clientY); }}
        onPointerMove={(e) => track(e.clientX, e.clientY)}
        onPointerUp={() => { heldRef.current = null; setHeld(null); }}
        onPointerCancel={() => { heldRef.current = null; setHeld(null); }}
      >
        {/* Le décor DU QUARTIER où l'on a choisi de mendier */}
        <div className="absolute inset-0">
          <LocationBackdrop location={location} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
        </div>

        {/* jauge de temps */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/35 z-20">
          <div className="h-full bg-[#F2C14E]" style={{ width: `${timeLeft * 100}%` }} />
        </div>

        {/* les passants */}
        {walkers.map((w) => {
          const x = posX(w);
          const size = 30 + w.lane * 18;      // plus bas = plus près = plus grand
          const isHeld = held === w.id;
          const R = size * 0.78;
          const circ = 2 * Math.PI * R;
          return (
            /*
             * LE PASSANT EST DESSINÉ LÀ OÙ IL EST, PAS À CÔTÉ.
             *
             * Le centrage (`translate(-50%,-50%)`) vivait sur le motion.div,
             * en même temps qu'une animation d'échelle. À l'échelle 1 —
             * c'est-à-dire tout le temps — framer-motion réécrit la propriété
             * `transform` en `none` et emporte le centrage avec elle : le
             * passant s'affichait donc en bas à droite de sa vraie position,
             * d'une demi-vignette. Le doigt devait viser à côté du dessin.
             *
             * Le placement va sur un div ordinaire, l'animation reste sur le
             * motion.div à l'intérieur. Chacun sa propriété, plus de conflit.
             */
            <div
              key={w.id}
              style={{
                position: 'absolute',
                left: `${x * 100}%`, top: `${w.lane * 100}%`,
                transform: 'translate(-50%,-50%)',
                zIndex: Math.round(w.lane * 10),
              }}
            >
            <motion.div
              animate={{ opacity: w.done ? 0 : 1, scale: w.done === 'angry' ? 1.15 : 1 }}
              transition={{ duration: 0.35 }}
              style={{ position: 'relative' }}
            >
              {/* l'anneau du regard */}
              {(isHeld || w.gaze > 0) && !w.done && (
                <svg
                  className="absolute pointer-events-none"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-90deg)' }}
                  width={R * 2 + 8} height={R * 2 + 8} viewBox={`0 0 ${R * 2 + 8} ${R * 2 + 8}`}
                >
                  <circle cx={R + 4} cy={R + 4} r={R} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4" />
                  <circle
                    cx={R + 4} cy={R + 4} r={R} fill="none"
                    stroke={w.gaze >= 1 ? '#D94F4F' : '#F2C14E'} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - (w.gaze >= 1 ? Math.min(1, w.insistS / w.def.patienceS) : w.gaze))}
                  />
                </svg>
              )}
              <div
                className="rounded-full overflow-hidden border-2 shadow-md"
                style={{ width: size, height: size, borderColor: isHeld ? '#F2C14E' : 'rgba(58,42,30,0.5)' }}
              >
                <CardboardAvatar seed={w.seed} size={size} />
              </div>
              {/* le détail qu'on lit d'un coup d'œil */}
              <span
                className="absolute -bottom-1 -right-1 text-sm drop-shadow"
                style={{ fontSize: size * 0.42 }}
              >
                {w.def.tell}
              </span>
              {w.done === 'angry' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">💢</span>
              )}
            </motion.div>
            </div>
          );
        })}

        {/* Le flair : « ça sent le flic ». Un temps d'avance, rien de plus. */}
        <AnimatePresence>
          {copSoon && !copOn && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute top-4 left-0 right-0 text-center text-[11px] font-black tracking-wider text-[#F2C14E] z-30 pointer-events-none"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
            >
              {tr('👃 ÇA SENT LE FLIC…', '👃 SMELLS LIKE COPS…')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* la ronde : tant qu'elle est là, on ne touche à personne */}
        <AnimatePresence>
          {copOn && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 pointer-events-none"
            >
              <div className="absolute inset-0 bg-[#4A6FA5]/20" />
              <div
                className="absolute text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                style={{ left: `${copX * 100}%`, top: '78%', transform: 'translate(-50%,-50%)' }}
              >
                👮
              </div>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="absolute top-4 left-0 right-0 text-center text-[11px] font-black tracking-wider text-white"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {tr('LA RONDE PASSE · MAINS DANS LES POCHES', 'PATROL PASSING · HANDS IN POCKETS')}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* petit retour du dernier geste */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.key}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute left-0 right-0 top-8 text-center pointer-events-none z-30"
            >
              <span
                className="text-sm font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(24,18,14,0.72)', color: toast.tone === 'good' ? '#7BD48A' : '#F09A8A' }}
              >
                {toast.txt}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* fin de session */}
        <AnimatePresence>
          {ended && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-5"
              style={{ background: 'rgba(24,18,14,0.9)' }}
            >
              <div className="text-5xl mb-2">
                {ended === 'cop' ? '👮' : ended === 'fight' ? '🥊' : '🎩'}
              </div>
              <p className="text-lg font-bold text-white">
                {ended === 'cop' ? tr('Pris la main tendue.', 'Caught with your hand out.')
                  : ended === 'fight' ? tr('Vous avez trop insisté.', 'You pushed it too far.')
                  : tr('La rue se vide.', 'The street empties out.')}
              </p>
              {ended !== 'cop' && (
                <p className="text-xs text-white/80 mt-1">🎩 {Math.round(coins)} · 👑 −{Math.round(dignitySpent)}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Qui est-ce qu'on tient, au juste ? */}
      <div className="h-8 flex items-center">
        {heldWalker ? (
          <p className="text-[11px] font-semibold text-[#3D3020]">
            {heldWalker.def.tell} {tc(heldWalker.def.label)}
            {heldWalker.gaze >= 1 && (
              <span className="text-[#B84A3A]"> · {tr('vous insistez…', 'you\'re pushing it…')}</span>
            )}
          </p>
        ) : (
          <p className="text-[11px] text-[#8B6B4A]">
            {tr('Posez le doigt sur quelqu\'un et suivez-le.', 'Put a finger on someone and follow them.')}
          </p>
        )}
      </div>
    </div>
  );
}
