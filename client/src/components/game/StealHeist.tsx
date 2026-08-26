import { useGame, LOCATIONS, heistTargetsFor, HEIST_TUNING, type HeistTarget } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playCard, playCrit, playHit, playHurt, playPickUp, playSpotted, playStep, playTensionPalier, playTurnedAway, playUnlock } from '@/lib/sound';
import { bonusEn, bonusFr, canOfferRewarded, showRewarded } from '@/lib/ads';
import { useLang, tr } from '@/lib/lang';
import PlayerFace from './PlayerFace';
import MinigameIntro, { introSeen } from './MinigameIntro';
import MinigameHelpButton from './MinigameHelpButton';
import SafeImg from './SafeImg';
import LocationBackdrop from './LocationBackdrop';
import { pushToast } from '@/lib/toast';

/*
 * Mini-jeu de vol « casse en grille » (façon Pac-Man) : on entre dans un lieu,
 * on récupère l'objet convoité, puis on file vers la sortie 🚪 en évitant les
 * gardiens qui patrouillent. Se faire toucher = pris → conséquences
 * existantes (RESOLVE_STEAL) : bagarre, garde à vue, ou raclée.
 *
 * Jauge d'alerte à paliers-cliquets (0-100, ne redescend jamais sous le
 * palier atteint) : être adjacent à un gardien ou dans sa ligne de vue fait
 * monter la jauge (ramasser le butin aussi), se planquer la fait décroître.
 *   P0 Discret , comportement de base.
 *   P1 Méfiance, les gardiens EXISTANTS accélèrent et collent davantage.
 *   P2 Alerte  , un renfort-chasseur entre par un bord (télégraphié 🚨).
 *   P3 Bouclage, un vigile vient camper autour de la sortie.
 * Règles d'équité : un renfort n'apparaît jamais à côté du joueur, il est
 * annoncé un tick à l'avance, et l'escalade ne vient QUE du bruit du joueur,
 * rester furtif = difficulté de base pour toujours.
 * Sortir en P0 = coup de maître (jackpot) ; en P3 = « sortie à chaud »
 * (gains normaux + bonus de respect : le culot, ça se respecte).
 */

const GRID_W = 7;
const GRID_H = 9;

type Cell = { x: number; y: number };
type GuardKind = 'patrol' | 'chaser' | 'camper';
type Guard = Cell & { kind: GuardKind };
type Pending = Cell & { kind: 'chaser' | 'camper'; ticks: number };
type Status = 'playing' | 'caught' | 'escaped';
type Tier = 0 | 1 | 2 | 3;
type EndTier = 'fail' | 'ok' | 'jackpot' | 'hot';

const k = (x: number, y: number) => `${x},${y}`;
// Libellé d'accessibilité de la case voisine que l'on peut atteindre.
const STEP_LABEL = (dx: number, dy: number) =>
  dy < 0 ? 'Monter' : dy > 0 ? 'Descendre' : dx < 0 ? 'Aller à gauche' : 'Aller à droite';
const manhattan = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const cheby = (a: Cell, b: Cell) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Paliers de la jauge d'alerte (cliquets : on ne redescend jamais en dessous).
const TIER_FLOORS = [0, 40, 70, 100];
const tierOf = (a: number): Tier => (a >= 100 ? 3 : a >= 70 ? 2 : a >= 40 ? 1 : 0);

const TIER_UI = [
  { emoji: '🤫', fr: 'Discret', en: 'Unseen', chip: 'bg-[#4A9B5F]/10 text-[#3d8b4f]', bar: '#4A9B5F' },
  { emoji: '❓', fr: 'Méfiance', en: 'Wary', chip: 'bg-[#F2C14E]/20 text-[#8B6B4A]', bar: '#D9A73E' },
  { emoji: '⚠️', fr: 'Alerte', en: 'Alert', chip: 'bg-[#E8842C]/15 text-[#B8641A]', bar: '#E8842C' },
  { emoji: '🚨', fr: 'Bouclage', en: 'Lockdown', chip: 'bg-[#D94F4F]/15 text-[#B84A3A]', bar: '#D94F4F' },
] as const;

// Ligne de vue : même ligne/colonne, à 3 cases max, sans caisse entre les deux.
function inSight(g: Cell, p: Cell, blocked: Set<string>): boolean {
  if (g.x !== p.x && g.y !== p.y) return false;
  const d = manhattan(g, p);
  if (d === 0 || d > 3) return false;
  const sx = Math.sign(p.x - g.x), sy = Math.sign(p.y - g.y);
  for (let i = 1; i < d; i++) if (blocked.has(k(g.x + sx * i, g.y + sy * i))) return false;
  return true;
}

// Un chemin existe-t-il entre deux cases en contournant les obstacles ? (BFS)
function reachable(start: Cell, goal: Cell, blocked: Set<string>): boolean {
  const q: Cell[] = [start];
  const seen = new Set([k(start.x, start.y)]);
  while (q.length) {
    const c = q.shift()!;
    if (c.x === goal.x && c.y === goal.y) return true;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
      const nk = k(nx, ny);
      if (seen.has(nk) || blocked.has(nk)) continue;
      seen.add(nk);
      q.push({ x: nx, y: ny });
    }
  }
  return false;
}

interface Layout {
  player: Cell;
  exit: Cell;
  loot: Cell;
  blocked: Set<string>;
  guards: Cell[];
}

function makeLayout(guardCount: number): Layout {
  const exit: Cell = { x: 3, y: GRID_H - 1 };
  const player: Cell = { x: 3, y: GRID_H - 1 };
  const loot: Cell = { x: 1 + Math.floor(Math.random() * (GRID_W - 2)), y: Math.floor(Math.random() * 3) };

  for (let attempt = 0; attempt < 40; attempt++) {
    const blocked = new Set<string>();
    while (blocked.size < 7) {
      const x = Math.floor(Math.random() * GRID_W);
      const y = 1 + Math.floor(Math.random() * (GRID_H - 2));
      const kk = k(x, y);
      if (kk === k(exit.x, exit.y) || kk === k(loot.x, loot.y) || kk === k(player.x, player.y)) continue;
      blocked.add(kk);
    }
    if (!reachable(player, loot, blocked) || !reachable(loot, exit, blocked)) continue;

    const guards: Cell[] = [];
    let tries = 0;
    while (guards.length < guardCount && tries < 200) {
      tries++;
      const x = Math.floor(Math.random() * GRID_W);
      const y = Math.floor(Math.random() * (GRID_H - 3)); // moitié haute
      const kk = k(x, y);
      if (blocked.has(kk) || kk === k(loot.x, loot.y)) continue;
      if (cheby({ x, y }, player) < 3) continue;
      if (guards.some((g) => g.x === x && g.y === y)) continue;
      guards.push({ x, y });
    }
    if (guards.length < guardCount) continue;
    return { player, exit, loot, blocked, guards };
  }
  // Repli sans obstacles (toujours résoluble)
  return {
    player, exit, loot, blocked: new Set<string>(),
    guards: Array.from({ length: guardCount }, (_, i) => ({ x: i * 2, y: 0 })),
  };
}

export default function StealHeist() {
  const [ready, setReady] = useState(() => introSeen('steal3'));
  const [target, setTarget] = useState<HeistTarget | null>(null);
  if (!ready) {
    return (
      <MinigameIntro
        id="steal3"
        emoji="🗝️"
        title="Le casse"
        titleEn="The Heist"
        lines={[
          { emoji: '🗺️', fr: 'D\'abord, le repérage : choisissez votre cible parmi celles du quartier. Petit coup tranquille ou grand coup gardé, à vous de voir.', en: 'First, the casing: pick your target among the neighborhood\'s. Quiet small job or heavily guarded big score, your call.' },
          { emoji: '🎯', fr: 'Récupérez l\'objet convoité, puis filez jusqu\'à la sortie 🚪 pour l\'emporter.', en: 'Grab the coveted item, then slip to the exit 🚪 to make off with it.' },
          { emoji: '👁️', fr: 'Frôler un gardien ou traverser sa ligne de vue fait monter l\'alerte. Planqué, elle retombe, mais jamais sous le palier atteint.', en: 'Brushing past a guard or crossing its line of sight raises the alert. Hidden, it drops, but never below the tier you reached.' },
          { emoji: '🚨', fr: 'Repéré = des renforts débarquent, et plus la cible est grosse, plus il en vient. Au bouclage, un vigile campe la sortie.', en: 'Spotted = reinforcements arrive, and the bigger the target, the more of them come. At lockdown, a watchman camps the exit.' },
          { emoji: '💎', fr: 'Sortir sans alerte = coup de maître (butin max). Sortir en plein bouclage = bonus de respect, le culot, ça se respecte.', en: 'Escape with zero alert = masterstroke (max loot). Escape mid-lockdown = respect bonus, nerve earns respect.' },
          { emoji: '👆', fr: 'Touchez une case voisine pour y faire un pas (ou glissez le doigt). Toucher un gardien = pris.', en: 'Tap a neighbouring tile to step there (or swipe). Touching a guard = caught.' },
        ]}
        image="/assets/intro-casse.webp"
        scene="street"
        onStart={() => setReady(true)}
      />
    );
  }
  return (
    <>
      <MinigameHelpButton onOpen={() => setReady(false)} />
      {!target ? <HeistCasing onPick={setTarget} /> : <StealHeistInner target={target} />}
    </>
  );
}

// ---- Le Repérage : choisir sa cible dans le quartier ----
const CATCHER_UI: Record<HeistTarget['catcher'], { fr: string; en: string }> = {
  commercant: { fr: '😡 Si pris : le proprio vous tombe dessus', en: '😡 If caught: the owner comes at you' },
  police: { fr: '🚔 Si pris : garde à vue et amende', en: '🚔 If caught: custody and a fine' },
  vigile: { fr: '🦺 Si pris : le Vigile de Choc (très, très costaud)', en: '🦺 If caught: the Shock Guard (very, very tough)' },
};

function HeistCasing({ onPick }: { onPick: (t: HeistTarget) => void }) {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const location = char?.location ?? 'parc';
  const loc = LOCATIONS[location];
  const targets = heistTargetsFor(location);
  const steals = char?.stealCount ?? 1;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-3">
      <div className="text-center">
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Le Repérage', 'The Casing')}</h1>
        <p className="text-sm text-[#6B5740] mt-1">
          {loc.emoji} {tr(loc.name, loc.nameEn)} · {tr('Trois cibles repérées. Laquelle ?', 'Three targets cased. Which one?')}
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2.5">
        {targets.map((t, i) => {
          const tune = HEIST_TUNING[t.difficulty];
          // Un grand coup par jour : après un gros casse réussi, la ville
          // entière garde un œil sur ses caisses jusqu'au lendemain.
          const verrouille = t.difficulty === 'grand' && char?.bigScoreDay !== undefined && char.bigScoreDay === char.day;
          return (
            <motion.button
              key={t.id}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => { if (!verrouille) { playCard(); onPick(t); } }}
              disabled={verrouille}
              aria-disabled={verrouille}
              className={`craft-card p-3 text-left flex flex-col gap-1.5 ${verrouille ? 'opacity-55' : ''}`}
            >
              <SafeImg src={`/assets/${t.id}.webp`} className="w-full h-20 object-cover rounded-lg -mb-0.5" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#2A1F1A]">{t.emoji} {tr(t.label, t.labelEn)}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-[#6B5740]">
                  {tune.stars} {tr(tune.fr, tune.en)}
                </span>
              </div>
              <p className="text-xs text-[#6B5740] leading-snug">{tr(t.desc, t.descEn)}</p>
              {verrouille ? (
                <p className="text-[11px] font-medium text-[#B84A3A] leading-snug">
                  🔒 {tr('Fermé pour aujourd\'hui : après votre coup de ce matin, toute la ville compte sa caisse deux fois. Revenez demain.', 'Closed for today: after your job this morning, the whole city counts its till twice. Come back tomorrow.')}
                </p>
              ) : (
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-[#3d8b4f]">
                    💶 ≈ {t.moneyMin}-{t.moneyMax}€{t.item ? ` + ${t.item.emoji}` : ''}
                  </span>
                  <span className="text-[#B84A3A]">{tr(CATCHER_UI[t.catcher].fr, CATCHER_UI[t.catcher].en)}</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-[11px] text-[#8B6B4A] text-center max-w-xs">
        {steals > 1
          ? tr(`Casier de la partie : ${steals - 1} casse${steals > 2 ? 's' : ''} déjà tenté${steals > 2 ? 's' : ''}. La surveillance s'en souvient.`, `This run's record: ${steals - 1} heist${steals > 2 ? 's' : ''} already attempted. Security remembers.`)
          : tr('Premier casse de la partie : la surveillance ne vous connaît pas encore.', 'First heist of the run: security doesn\'t know you yet.')}
      </p>

      {/* Se dégonfler : rebrousser chemin sans rien tenter. */}
      <button
        onClick={() => {
          playTurnedAway();
          pushToast(
            tr('Vous réalisez que vous n\'avez pas le cran ce soir. Vous rebroussez chemin.', 'You realize you don\'t have the guts tonight. You turn back.'),
            { emoji: '😰' },
          );
          dispatch({ type: 'SET_SCREEN', screen: 'main' });
        }}
        className="mt-1 py-2.5 px-4 text-sm text-[#A08B70] font-medium hover:text-[#6B5740] transition-colors"
      >
        ← {tr('Pas ce soir… rebrousser chemin', 'Not tonight… turn back')}
      </button>
    </div>
  );
}

function StealHeistInner({ target }: { target: HeistTarget }) {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const tuning = HEIST_TUNING[target.difficulty];
  const day = char?.day ?? 1;
  const guardEmoji = target.catcher === 'police' ? '👮' : target.catcher === 'vigile' ? '🦺' : '🧑‍🍳';
  const chaserEmoji = target.catcher === 'police' ? '🚓' : target.catcher === 'vigile' ? '🕶️' : '🧹';

  // Traits qui résonnent ici comme au combat : l'agile fait retomber la
  // pression plus vite, le flair révèle les lignes de vue, l'haleine se sent.
  const hasAgile = char?.traits.some((t) => t.id === 'agile') ?? false;
  const hasFlair = char?.traits.some((t) => t.id === 'nez-sensible' || t.id === 'paranoiaque') ?? false;
  const hasHaleine = char?.traits.some((t) => t.id === 'haleine') ?? false;

  // Difficulté d'ENTRÉE : la CIBLE choisie fixe le niveau de base (gardiens,
  // sensibilité de l'alerte, rythme), puis le « casier » (casses déjà tentés)
  // et les jours écoulés durcissent la surveillance par-dessus.
  // L'escalade EN COURS de partie, elle, ne dépend que de la jauge d'alerte.
  const steals = char?.stealCount ?? 1;
  const heat = (steals - 1) + Math.floor(day / 5);
  const guardCount = Math.min(tuning.guards + Math.floor(heat / 3), tuning.guards + 2);
  const tickMs = Math.max(640 - heat * 45 - tuning.tickBonus, 280);
  const chaseProb = Math.min(0.42 + heat * 0.045 + (target.difficulty === 'grand' ? 0.06 : 0), 0.9);

  const [layout] = useState(() => makeLayout(guardCount));
  const [player, setPlayer] = useState<Cell>(layout.player);
  const [guards, setGuards] = useState<Guard[]>(layout.guards.map((g) => ({ ...g, kind: 'patrol' as const })));
  const [hasLoot, setHasLoot] = useState(false);
  const [status, setStatus] = useState<Status>('playing');
  const [endTier, setEndTier] = useState<EndTier | null>(null);
  const [alert, setAlert] = useState(0);
  const [tier, setTier] = useState<Tier>(0);
  const [pending, setPending] = useState<Pending[]>([]);

  const playerRef = useRef(player);
  const guardsRef = useRef<Guard[]>(guards);
  const hasLootRef = useRef(false);
  const statusRef = useRef<Status>('playing');
  const alertRef = useRef(0);
  const tierRef = useRef<Tier>(0);
  const pendingRef = useRef<Pending[]>([]);
  const spawnedRef = useRef({ chaser: false, camper: false });
  /*
   * EFFACER UN PALIER — vidéo récompensée du casse.
   *
   * La jauge est à cliquets : elle ne redescend jamais sous le palier atteint,
   * et le joueur le sait — c'est écrit dans les règles du mini-jeu. Rendre
   * réversible ce qu'on a présenté comme irréversible est le seul cas où une
   * publicité ressemble à un cadeau plutôt qu'à un péage.
   *
   * UNE SEULE FOIS PAR CASSE, et ce n'est pas négociable : deux effacements et
   * la tension qui fait le mini-jeu disparaît. Un mini-jeu sans tension ne se
   * rejoue pas, et un mini-jeu qu'on ne rejoue pas ne rapporte plus rien.
   *
   * Le monde se fige pendant la vidéo : se faire prendre par une ronde qui a
   * continué derrière l'écran de publicité serait la pire seconde du jeu.
   */
  const geleRef = useRef(false);
  const [palierEfface, setPalierEfface] = useState(false);
  const [effacant, setEffacant] = useState(false);
  const tickCount = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Le glissé déclenche aussi un clic fantôme sur la case de départ : on le
  // neutralise pendant un court instant pour ne pas avancer deux fois.
  const swipedAt = useRef(0);
  // Premier pas effectué : les cases voisines cessent de clignoter.
  const [moved, setMoved] = useState(false);

  const finish = useCallback((result: EndTier) => {
    if (statusRef.current !== 'playing') return;
    statusRef.current = result === 'fail' ? 'caught' : 'escaped';
    setStatus(statusRef.current);
    setEndTier(result);
    /*
     * Se faire prendre a son son, et ce n'est pas un coup encaissé : c'est la
     * main sur l'épaule. `moment-attrape` servait jusqu'ici aux paliers
     * d'alerte, où il faisait doublon ; il retrouve ici le seul instant qu'il
     * décrit vraiment.
     */
    if (result === 'fail') {
      playSpotted(); playHurt();
      /*
       * Ce que la rue en pense est maintenant DANS le texte du résultat (voir
       * le reducer, RESOLVE_STEAL), et plus en bandeau par-dessus l'écran.
       */
    }
    else if (result === 'jackpot' || result === 'hot') playCrit();
    else playHit();
    setTimeout(() => dispatch({ type: 'RESOLVE_STEAL', tier: result, targetId: target.id }), 1200);
  }, [dispatch, target.id]);

  // Choisit la case d'entrée d'un renfort : jamais à côté du joueur, jamais
  // sur un mur/le butin/la sortie, et d'où le joueur reste atteignable.
  const queueSpawn = useCallback((kind: 'chaser' | 'camper') => {
    const p = playerRef.current;
    const base: Cell[] = kind === 'camper'
      ? ([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]] as const)
        .map(([dx, dy]) => ({ x: layout.exit.x + dx, y: layout.exit.y + dy }))
      : [{ x: 3, y: 0 }, { x: 0, y: 0 }, { x: GRID_W - 1, y: 0 }, { x: 0, y: 4 }, { x: GRID_W - 1, y: 4 }];
    const ok = base.filter((cl) =>
      cl.x >= 0 && cl.y >= 0 && cl.x < GRID_W && cl.y < GRID_H &&
      !layout.blocked.has(k(cl.x, cl.y)) &&
      !(cl.x === layout.exit.x && cl.y === layout.exit.y) &&
      !(cl.x === layout.loot.x && cl.y === layout.loot.y) &&
      !guardsRef.current.some((g) => g.x === cl.x && g.y === cl.y) &&
      cheby(cl, p) >= (kind === 'camper' ? 2 : 3) &&
      reachable(cl, p, layout.blocked));
    if (ok.length === 0) return;
    const cell = ok[Math.floor(Math.random() * ok.length)];
    pendingRef.current = [...pendingRef.current, { ...cell, kind, ticks: 1 }];
    setPending(pendingRef.current);
  }, [layout]);

  // Monte la jauge (sensibilité selon la cible), franchit les paliers
  // (cliquets) et déclenche les renforts : plus la cible est grosse, plus il
  // débarque de monde quand on se fait repérer.
  const raiseAlert = useCallback((pts: number) => {
    if (statusRef.current !== 'playing' || pts <= 0) return;
    const scaled = Math.max(1, Math.round(pts * tuning.alertMult));
    const after = Math.min(100, alertRef.current + scaled);
    if (after === alertRef.current) return;
    alertRef.current = after;
    setAlert(after);
    const t = tierOf(after);
    if (t > tierRef.current) {
      tierRef.current = t;
      setTier(t);
      // Un son par palier, et non trois fois le même de plus en plus fort :
      // le joueur doit savoir OÙ il en est sans quitter la grille des yeux.
      playTensionPalier(t);
      if (t >= 2 && !spawnedRef.current.chaser) {
        spawnedRef.current.chaser = true;
        for (let i = 0; i < tuning.spawnP2; i++) queueSpawn('chaser');
      }
      if (t >= 3 && !spawnedRef.current.camper) {
        spawnedRef.current.camper = true;
        queueSpawn('camper');
        for (let i = 0; i < tuning.spawnP3; i++) queueSpawn('chaser');
      }
    }
  }, [queueSpawn, tuning]);

  /*
   * SORTIR SANS JOUER — « personne ne vous a vu ».
   *
   * Le casse est le mini-jeu le plus exigeant du jeu : une grille, des rondes,
   * une jauge qui ne redescend pas. Certains n'y arriveront jamais, et la
   * cible qu'ils convoitaient leur restera fermée pour toujours. Ce bouton
   * leur ouvre la porte.
   *
   * Il rend `ok`, jamais `jackpot`. La distinction est tout l'équilibre de la
   * chose : on peut ACHETER un vol propre, on ne peut pas acheter un coup
   * d'éclat. Le gros lot reste ce qu'on va chercher soi-même, sinon jouer
   * proprement ne rapporte plus rien de particulier.
   *
   * Il n'apparaît qu'avant le premier pas. Après, on est engagé — le proposer
   * au bord de la catastrophe en ferait un filet de rattrapage, et c'est déjà
   * le rôle d'« effacer un palier ».
   */
  const [filantDoux, setFilantDoux] = useState(false);
  async function filerEnDouce() {
    if (filantDoux || statusRef.current !== 'playing') return;
    setFilantDoux(true);
    geleRef.current = true;
    const vue = await showRewarded({ famille: 'vol' });
    geleRef.current = false;
    setFilantDoux(false);
    if (vue) { playUnlock(); finish('ok'); }
  }

  async function effacerUnPalier() {
    if (effacant || palierEfface || statusRef.current !== 'playing') return;
    setEffacant(true);
    geleRef.current = true;
    const vue = await showRewarded({ famille: 'vol' });
    if (vue) {
      setPalierEfface(true);
      const cible = Math.max(0, tierRef.current - 1) as Tier;
      tierRef.current = cible;
      setTier(cible);
      alertRef.current = TIER_FLOORS[cible];
      setAlert(TIER_FLOORS[cible]);
      /*
       * Les renforts appelés par le palier qu'on efface repartent, et le jeu
       * oublie les avoir appelés. Sans ça, « effacer un palier » ne serait
       * qu'un chiffre qui baisse pendant que quatre chasseurs continuent de
       * traquer : le joueur aurait payé pour une décoration.
       */
      spawnedRef.current = { chaser: false, camper: false };
      pendingRef.current = [];
      setPending([]);
      guardsRef.current = guardsRef.current.filter(g => g.kind === 'patrol');
      setGuards(guardsRef.current);
      playUnlock();
    }
    geleRef.current = false;
    setEffacant(false);
  }

  const move = useCallback((dx: number, dy: number) => {
    if (statusRef.current !== 'playing' || geleRef.current) return;
    const p = playerRef.current;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) return;
    if (layout.blocked.has(k(nx, ny))) return;
    const np = { x: nx, y: ny };
    playerRef.current = np;
    setPlayer(np);
    playStep();

    let got = hasLootRef.current;
    if (!got && nx === layout.loot.x && ny === layout.loot.y) {
      got = true; hasLootRef.current = true; setHasLoot(true); playPickUp();
      raiseAlert(20); // l'étal remarque le trou : le retour est plus chaud que l'aller
    }
    if (guardsRef.current.some((g) => g.x === nx && g.y === ny)) { finish('fail'); return; }
    // Se déplacer sous le nez d'un gardien nourrit l'alerte (taux réduit).
    let gain = 0;
    for (const g of guardsRef.current) {
      if (cheby(g, np) <= 1) gain += hasHaleine ? 11 : 8;
      else if (inSight(g, np, layout.blocked)) gain += 4;
    }
    if (gain > 0) raiseAlert(gain);
    if (got && nx === layout.exit.x && ny === layout.exit.y) {
      finish(tierRef.current === 0 ? 'jackpot' : tierRef.current >= 3 ? 'hot' : 'ok');
    }
  }, [layout, finish, raiseAlert, hasHaleine]);

  // Ronde des gardiens (temps réel). Recréée quand le palier change : dès la
  // Méfiance (P1), les gardiens accélèrent (tick −20 %) et collent davantage.
  useEffect(() => {
    const effTick = Math.max(240, Math.round(tickMs * (tier >= 1 ? 0.8 : 1)));
    const id = setInterval(() => {
      if (statusRef.current !== 'playing' || geleRef.current) return;
      tickCount.current += 1;
      const p = playerRef.current;

      // Renforts : le télégraphe 🚨 dure un tick, puis entrée en scène.
      if (pendingRef.current.length > 0) {
        const still: Pending[] = [];
        let arrived = false;
        for (const pd of pendingRef.current) {
          if (pd.ticks > 0) { still.push({ ...pd, ticks: pd.ticks - 1 }); continue; }
          arrived = true;
          if (guardsRef.current.length < 6 && !guardsRef.current.some((g) => g.x === pd.x && g.y === pd.y)) {
            guardsRef.current = [...guardsRef.current, { x: pd.x, y: pd.y, kind: pd.kind }];
          }
        }
        pendingRef.current = still;
        setPending(still);
        if (arrived) setGuards(guardsRef.current);
      }

      const effChase = Math.min(0.9, chaseProb + (tierRef.current >= 1 ? 0.15 : 0));
      const next = guardsRef.current.map((g): Guard => {
        // Le campeur rôde autour de la sortie (jamais dessus) : il faut ruser.
        if (g.kind === 'camper') {
          const zone = ([[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]] as const)
            .map(([dx, dy]) => ({ x: g.x + dx, y: g.y + dy }))
            .filter((c2) => c2.x >= 0 && c2.y >= 0 && c2.x < GRID_W && c2.y < GRID_H
              && !layout.blocked.has(k(c2.x, c2.y))
              && cheby(c2, layout.exit) <= 1
              && !(c2.x === layout.exit.x && c2.y === layout.exit.y));
          if (zone.length === 0) return g;
          const z = zone[Math.floor(Math.random() * zone.length)];
          return { ...z, kind: g.kind };
        }
        // Le chasseur traque sans relâche mais est lent : un tick sur deux.
        if (g.kind === 'chaser' && tickCount.current % 2 === 1) return g;
        const cands = ([[0, 1], [0, -1], [1, 0], [-1, 0]] as const)
          .map(([dx, dy]) => ({ x: g.x + dx, y: g.y + dy }))
          .filter((c2) => c2.x >= 0 && c2.y >= 0 && c2.x < GRID_W && c2.y < GRID_H && !layout.blocked.has(k(c2.x, c2.y)));
        if (cands.length === 0) return g;
        const chasing = g.kind === 'chaser' || Math.random() < effChase;
        if (chasing) {
          const best = cands.reduce((b, c2) => (manhattan(c2, p) < manhattan(b, p) ? c2 : b), cands[0]);
          return { ...best, kind: g.kind };
        }
        const r = cands[Math.floor(Math.random() * cands.length)];
        return { ...r, kind: g.kind };
      });
      guardsRef.current = next;
      setGuards(next);

      if (next.some((g) => g.x === p.x && g.y === p.y)) { finish('fail'); return; }

      // Pression : adjacence et lignes de vue nourrissent l'alerte ; sinon
      // décrue, jamais sous le palier atteint (cliquet).
      let gain = 0;
      for (const g of next) {
        if (cheby(g, p) <= 1) gain += hasHaleine ? 20 : 15;
        else if (inSight(g, p, layout.blocked)) gain += 8;
      }
      if (gain > 0) raiseAlert(gain);
      else {
        const floor = TIER_FLOORS[tierRef.current];
        const dec = Math.max(floor, alertRef.current - (hasAgile ? 3 : 2));
        if (dec !== alertRef.current) { alertRef.current = dec; setAlert(dec); }
      }
    }, effTick);
    return () => clearInterval(id);
  }, [layout, chaseProb, tickMs, finish, tier, hasHaleine, hasAgile, raiseAlert]);

  // Un pas, quelle que soit la façon dont il a été demandé (touche, glissé,
  // clavier). Le premier pas calme le clignotement des cases voisines.
  const stepTo = useCallback((dx: number, dy: number) => {
    setMoved(true);
    move(dx, dy);
  }, [move]);

  // Flèches du clavier (confort sur ordinateur).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      };
      const d = map[e.key];
      if (d) { e.preventDefault(); stepTo(d[0], d[1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    touchStart.current = null;
    // En dessous du seuil, c'est une tape : la case touchée s'en charge.
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    // Un vrai glissé : on avance, et on empêche la tape de rejouer le coup.
    swipedAt.current = Date.now();
    if (Math.abs(dx) > Math.abs(dy)) stepTo(dx > 0 ? 1 : -1, 0);
    else stepTo(0, dy > 0 ? 1 : -1);
  };

  if (!char) return null;

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) cells.push({ x, y });

  const guardAt = (x: number, y: number) => guards.find((g) => g.x === x && g.y === y);
  const pendingAt = (x: number, y: number) => pending.some((pd) => pd.x === x && pd.y === y);

  // Le flair (nez sensible / paranoïaque) révèle les lignes de vue des gardiens.
  const sightKeys = new Set<string>();
  if (hasFlair && status === 'playing') {
    for (const g of guards) {
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]] as const) {
        for (let i = 1; i <= 3; i++) {
          const cx = g.x + dx * i, cy = g.y + dy * i;
          if (cx < 0 || cy < 0 || cx >= GRID_W || cy >= GRID_H) break;
          if (layout.blocked.has(k(cx, cy))) break;
          sightKeys.add(k(cx, cy));
        }
      }
    }
  }

  const instruction = hasLoot ? tr('Filez vers la sortie 🚪 !', 'Get to the exit 🚪 !') : `${tr('Récupérez', 'Grab')} ${target.emoji}`;
  const ui = TIER_UI[tier];

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col items-center gap-3">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Le casse', 'The Heist')}</h1>
        <p className="text-sm text-[#6B5740] mt-1 max-w-xs mx-auto">
          {tr('Vous tentez de subtiliser', 'You try to swipe')} <strong>{tr(target.label, target.labelEn)}</strong>.
        </p>
      </div>

      {/* Bandeau d'état + jauge d'alerte */}
      <div className={`w-full max-w-sm rounded-xl px-3 pt-2 pb-1.5 flex flex-col gap-1.5 transition-colors ${ui.chip}`}>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{instruction}</span>
          <span className="text-xs">{ui.emoji} {tr(ui.fr, ui.en)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-black/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: ui.bar }}
            animate={{ width: `${alert}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>

        {/* L'avant-dernier palier : le bouclage est le cran suivant, et la
            jauge ne redescend pas toute seule. Le bouton dit ce qu'il rend —
            un palier — parce que c'est exactement le mot que le mini-jeu a
            employé pour dire qu'on ne le récupérerait jamais. */}
        {status === 'playing' && !palierEfface && tier === 2 && canOfferRewarded('vol') && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            disabled={effacant}
            onClick={effacerUnPalier}
            className="w-full mt-0.5 py-2 text-[12px] font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #6B7FA8, #4C5F84)', boxShadow: '0 3px 12px rgba(76,95,132,0.3)' }}
          >
            {effacant ? tr('⏳ Chargement…', '⏳ Loading…') : tr(bonusFr('Effacer un palier d\'alerte'), bonusEn('Clear one alert tier'))}
          </motion.button>
        )}

        {/* Avant le premier pas seulement : passé ça, on est engagé. */}
        {status === 'playing' && !moved && canOfferRewarded('vol') && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            disabled={filantDoux}
            onClick={filerEnDouce}
            className="w-full mt-0.5 py-2 text-[12px] font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #6E8F6A, #4E6B4B)', boxShadow: '0 3px 12px rgba(78,107,75,0.3)' }}
          >
            {filantDoux ? tr('⏳ Chargement…', '⏳ Loading…')
              : tr(bonusFr('Personne ne vous voit : prendre et filer'),
                   bonusEn('Nobody sees you: grab it and go'))}
          </motion.button>
        )}
      </div>

      {/* Grille, posée sur le quartier où l'on est en train de voler. Le décor
          reste très en retrait : la grille doit rester lisible au premier coup
          d'œil, c'est un jeu de placement, pas un tableau. */}
      <div
        className="w-full max-w-sm craft-card p-2 relative overflow-hidden"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <LocationBackdrop location={char.location} />
        </div>
        <div className="grid gap-1 relative" style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)` }}>
          {cells.map(({ x, y }) => {
            const isPlayer = player.x === x && player.y === y;
            const guard = guardAt(x, y);
            const isPending = pendingAt(x, y);
            const isLoot = !hasLoot && layout.loot.x === x && layout.loot.y === y;
            const isExit = layout.exit.x === x && layout.exit.y === y;
            const isWall = layout.blocked.has(k(x, y));
            // Les quatre cases atteignables : elles se touchent du doigt, et
            // le liseré pointillé le dit sans avoir besoin d'une croix.
            const dx = x - player.x, dy = y - player.y;
            const isStep = status === 'playing' && !isWall && Math.abs(dx) + Math.abs(dy) === 1;
            let bg = '#F0E2CE';
            if (isWall) bg = '#DCC4A6';
            else if (isExit) bg = hasLoot ? '#CDE8C6' : '#E4EAD8';
            else if (sightKeys.has(k(x, y))) bg = '#F0D6C4';
            return (
              <div
                key={k(x, y)}
                onClick={isStep ? () => { if (Date.now() - swipedAt.current < 400) return; stepTo(dx, dy); } : undefined}
                role={isStep ? 'button' : undefined}
                aria-label={isStep ? STEP_LABEL(dx, dy) : undefined}
                className={`relative aspect-square rounded-md flex items-center justify-center text-lg select-none ${isStep ? 'cursor-pointer' : ''}`}
                style={{ background: bg, boxShadow: 'inset 0 0 0 1px rgba(58,42,30,0.06)' }}
              >
                {isStep && (
                  <motion.span
                    className="absolute inset-0.5 rounded-md pointer-events-none"
                    style={{ border: '2px dashed rgba(184,134,11,0.55)' }}
                    animate={moved ? { opacity: 0.55 } : { opacity: [0.3, 1, 0.3] }}
                    transition={moved ? { duration: 0.2 } : { repeat: Infinity, duration: 1.3 }}
                  />
                )}
                {isPlayer ? (
                  <motion.span
                    key="player"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    className="drop-shadow flex items-center justify-center"
                  >
                    <PlayerFace char={char} size={30} />
                  </motion.span>
                ) : guard ? (
                  <span>{guard.kind === 'camper' ? '🔦' : guard.kind === 'chaser' ? chaserEmoji : guardEmoji}</span>
                ) : isPending ? (
                  <motion.span animate={{ opacity: [1, 0.25, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>🚨</motion.span>
                ) : isLoot ? (
                  <span>{target.emoji}</span>
                ) : isExit ? (
                  <span className={hasLoot ? '' : 'opacity-40'}>🚪</span>
                ) : isWall ? (
                  <span className="opacity-70">📦</span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Overlay résultat */}
        <AnimatePresence>
          {status !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(42,31,26,0.55)' }}
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center px-4"
              >
                <div className="text-4xl mb-1">
                  {endTier === 'fail' ? '🚨' : endTier === 'jackpot' ? '💎' : endTier === 'hot' ? '🔥' : '🤫'}
                </div>
                <p className="text-xl font-bold text-white">
                  {endTier === 'fail'
                    ? tr('Pris sur le fait !', 'Caught red-handed!')
                    : endTier === 'jackpot'
                      ? tr('Coup de maître !', 'Masterstroke!')
                      : endTier === 'hot'
                        ? tr('Sortie à chaud !', 'Out mid-lockdown!')
                        : tr('Filé de justesse !', 'Slipped away!')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[11px] text-[#8B6B4A] text-center">
        {tr('Touchez une case voisine pour y aller (ou glissez le doigt).', 'Tap a neighbouring tile to step there (or swipe).')} {guardEmoji} {tr('patrouille, restez hors de vue, la jauge monte vite.', 'is on patrol, stay out of sight, the gauge climbs fast.')}
      </p>
    </div>
  );
}
