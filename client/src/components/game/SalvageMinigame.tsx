import {
  useGame, LAYERS, SALVAGE_TUNING, rollLayerFinds, nextLayerRisk, salvagePayout,
  BUST_REASONS, salvageMods, piegeCostFor, randomFromArray, CONSIGNE_FINDS, loadHighScores,
} from '@/contexts/GameContext';
import type { SalvageFind } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { playCollapse, playCrit, playDig, playFind, playPickUp, playSaleteRecup, playStep, playTensionRisque, playUnlock } from '@/lib/sound';
import { bonusEn, bonusFr, canOfferRewarded, showRewarded } from '@/lib/ads';
import { haptic } from '@/lib/haptics';
import { isFirstEverRun } from '@/lib/coach';
import { loadGraves } from '@/lib/necrology';
import { useLang, tr, tc } from '@/lib/lang';
import MinigameIntro, { introSeen } from './MinigameIntro';
import MinigameHelpButton from './MinigameHelpButton';
import LocationBackdrop from './LocationBackdrop';
import SafeImg from './SafeImg';

/*
 * LA RÉCUP' — le fond du container.
 *
 * On déblaie une couche de détritus du doigt ; ce qu'elle cachait apparaît et
 * tombe dans les poches. Puis vient la seule vraie question du jeu :
 *
 *      remonter avec ce qu'on a, ou descendre d'une couche ?
 *
 * Plus bas ça vaut plus cher, et le tas s'agite. S'il se réveille avant qu'on
 * soit ressorti, on perd TOUT — d'où le fait que renoncer soit l'action
 * principale. Voir data/salvage pour les couches et le réglage.
 */

const T = SALVAGE_TUNING;
const CELLS = T.gridW * T.gridH;

// La couche de détritus qui recouvre tout. ATTENTION : surtout pas d'emoji
// ici. La première version en mettait — journal, œuf, banane — et le joueur
// ne pouvait pas distinguer ce qu'il devait DÉBLAYER de ce qu'il devait
// TROUVER : les deux étaient des petits dessins. On ne comprenait rien.
// Le tas est donc une matière : des nuances de brun sale, sans forme lisible.
const MUCK_TONES = ['#6B5B45', '#5E4F3C', '#75634A', '#544733', '#6F5E46'];

interface Cell { tone: string; tilt: number; cleared: boolean; find?: SalvageFind; revealed?: boolean }

export default function SalvageMinigame() {
  const [ready, setReady] = useState(() => introSeen('recup2'));
  if (!ready) {
    return (
      <MinigameIntro
        id="recup2"
        emoji="♻️"
        title="La Récup'"
        titleEn="Salvage"
        lines={[
          { emoji: '🫳', fr: 'Frottez le doigt sur les détritus pour déblayer. Ce qui est dessous apparaît et part dans vos poches.', en: 'Rub your finger over the rubbish to clear it. What\'s underneath appears and goes into your pockets.' },
          { emoji: '⬇️', fr: 'Une couche déblayée, vous choisissez : REMONTER avec le butin, ou CREUSER encore.', en: 'Once a layer is cleared you choose: CLIMB OUT with the haul, or DIG deeper.' },
          { emoji: '💎', fr: 'Plus bas, ça vaut plus cher. Les vraies trouvailles — manteau, barre de fer, duvet — sont tout au fond.', en: 'The deeper you go, the better it gets. The real finds — a coat, an iron bar, a sleeping bag — are at the very bottom.' },
          { emoji: '🐀', fr: 'Mais le tas s\'agite : à chaque couche, et à chaque saleté que vous réveillez.', en: 'But the pile stirs: with every layer, and every nasty thing you wake up.' },
          { emoji: '💀', fr: 'S\'il se réveille avant que vous soyez ressorti, vous perdez TOUT. Savoir s\'arrêter, c\'est le jeu.', en: 'If it wakes before you\'re out, you lose EVERYTHING. Knowing when to stop is the game.' },
        ]}
        image="/assets/intro-recup.webp"
        scene="discovery"
        onStart={() => setReady(true)}
      />
    );
  }
  // Le « ? » rouvre la carte des règles à tout moment.
  return (
    <>
      <MinigameHelpButton onOpen={() => setReady(false)} />
      <SalvageInner />
    </>
  );
}

function makeLayer(depth: number, mods: ReturnType<typeof salvageMods>): Cell[] {
  let finds = rollLayerFinds(depth, mods.malus, mods.greenThumb);
  /*
   * LA TOUTE PREMIÈRE FOUILLE NE REPART JAMAIS BREDOUILLE.
   *
   * Une première partie qui commence par vingt minutes les bras dans les
   * ordures pour rien enseigne exactement la mauvaise chose. On garantit donc
   * au moins une consigne dans la première couche de la première partie — pas
   * un trésor, juste de quoi comprendre que ça peut payer.
   */
  if (depth === 0 && isFirstEverRun(loadHighScores().length, loadGraves().length)
      && !finds.some(f => f.kind === 'consigne' || f.kind === 'trouvaille')) {
    finds = [randomFromArray(CONSIGNE_FINDS), ...finds.slice(1)];
  }
  const cells: Cell[] = Array.from({ length: CELLS }, () => ({
    tone: MUCK_TONES[Math.floor(Math.random() * MUCK_TONES.length)],
    tilt: Math.random() * 30 - 15,
    cleared: false,
  }));
  // Les objets sont placés au hasard, jamais sur la première rangée : sinon
  // un simple effleurement suffirait et il n'y aurait rien à fouiller.
  const spots = Array.from({ length: CELLS - T.gridW }, (_, i) => i + T.gridW).sort(() => Math.random() - 0.5);
  finds.forEach((f, i) => { if (spots[i] !== undefined) cells[spots[i]].find = f; });
  // Les pigeons grattent avec vous, et le sens de l'orientation dit de quel
  // côté chercher : quelques cases sont déjà dégagées à l'arrivée.
  const free = cells.map((_, i) => i).filter(i => !cells[i].find).sort(() => Math.random() - 0.5);
  for (let i = 0; i < mods.freeReveals && free[i] !== undefined; i++) cells[free[i]].cleared = true;
  return cells;
}

function SalvageInner() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  // Tout ce que le caractère change ici, en un seul endroit (voir data/salvage).
  const mods = useState(() => salvageMods(state.character!))[0];
  const flair = mods.flair;
  const malus = mods.malus;
  const riskMul = mods.riskMul;

  const [depth, setDepth] = useState(0);
  const [cells, setCells] = useState<Cell[]>(() => makeLayer(0, salvageMods(state.character!)));
  const [risk, setRisk] = useState(0);
  const [centimes, setCentimes] = useState(0);
  const [bazar, setBazar] = useState(0);
  const [trouvailles, setTrouvailles] = useState<string[]>([]);
  const [ended, setEnded] = useState<null | { how: 'out' | 'bust'; reason?: typeof BUST_REASONS[number]; missed?: SalvageFind }>(null);
  const [pop, setPop] = useState<{ f: SalvageFind; key: number } | null>(null);
  // Tant que le doigt n'a rien frotté, on montre le geste au lieu de l'écrire.
  const [touched, setTouched] = useState(false);
  /*
   * LE TAS QUI SE CALME — vidéo récompensée de la Récup'.
   *
   * Elle se propose au dernier cran avant l'écroulement, jamais après. À cet
   * instant le joueur a encore ses trouvailles dans les mains : on protège
   * toujours plus fort ce qu'on tient déjà que ce qu'on espère. Une fois le
   * tas écroulé, la même offre devient une consolation, et une consolation ne
   * se vend pas.
   *
   * Une seule fois par fouille. Deux sauvetages et le mini-jeu n'a plus de
   * tension ; un mini-jeu sans tension ne se rejoue pas, et c'est le nombre de
   * parties qui fait le revenu, pas le nombre d'offres.
   */
  const [tasCalme, setTasCalme] = useState(false);
  const [calmant, setCalmant] = useState(false);

  const cellsRef = useRef(cells);
  const riskRef = useRef(0);
  const depthRef = useRef(0);
  const centimesRef = useRef(0);
  const bazarRef = useRef(0);
  const trouvaillesRef = useRef<string[]>([]);
  const endedRef = useRef(false);
  const rubbingRef = useRef(false);
  // Les saletés réveillées, transmises au reducer pour les dégâts au corps.
  const hurtsRef = useRef<string[]>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const layer = LAYERS[Math.min(depth, LAYERS.length - 1)];
  const clearedPct = cells.filter(c => c.cleared).length / CELLS;
  const canDig = clearedPct >= T.clearToDig && depth < LAYERS.length - 1;

  /*
   * CE QU'IL Y AVAIT JUSTE À CÔTÉ.
   *
   * Quand le tas s'écroule, on révèle la meilleure chose encore enfouie dans
   * la couche qu'on fouillait. C'est ce qui donne envie de recommencer tout de
   * suite — et c'est VRAI : l'objet était réellement dans la grille, à une
   * case près. On ne fabrique jamais ce regret, et s'il n'y avait plus rien à
   * trouver, on ne dit rien. Un presque-gagné inventé s'évente vite, et le jeu
   * en garde l'étiquette.
   */
  function bestMissed(): SalvageFind | undefined {
    const rang = { trouvaille: 3, consigne: 2, bazar: 1, piege: 0 } as const;
    let best: SalvageFind | undefined;
    for (const c of cellsRef.current) {
      if (c.cleared || !c.find || c.find.kind === 'piege') continue;
      if (!best || rang[c.find.kind] > rang[best.kind]
        || (rang[c.find.kind] === rang[best.kind] && (c.find.value ?? 0) > (best.value ?? 0))) {
        best = c.find;
      }
    }
    return best;
  }

  function finish(how: 'out' | 'bust') {
    if (endedRef.current) return;
    endedRef.current = true;
    const reason = how === 'bust' ? randomFromArray(BUST_REASONS) : undefined;
    setEnded({ how, reason, missed: how === 'bust' ? bestMissed() : undefined });
    // Le tas qui se réveille a son propre son : c'est le moment où tout se perd.
    if (how === 'bust') { playCollapse(); haptic('heavy'); } else { playCrit(); haptic('medium'); }
    /*
     * LE COMMENTAIRE SUR LA RÉCOLTE N'EST PLUS ICI.
     *
     * Il flottait en bandeau au-dessus de l'écran de fin. Il est maintenant
     * DANS le texte du résultat (voir le reducer), à côté de « Même les rats
     * vous ont regardé avec pitié » qui tenait déjà ce rôle depuis toujours —
     * c'est cet endroit-là qui fait la différence entre une vanne du jeu et
     * une notification posée dessus.
     */
    setTimeout(() => dispatch({
      type: 'RESOLVE_SALVAGE',
      // L'Agile ressort avec ce qu'il avait dans les mains, même quand tout
      // s'écroule : c'est sa fuite, pas sa chance.
      centimes: how === 'bust' ? Math.round(centimesRef.current * mods.saveOnBust) : centimesRef.current,
      bazar: how === 'bust' ? Math.floor(bazarRef.current * mods.saveOnBust) : bazarRef.current,
      trouvailles: how === 'bust' ? trouvaillesRef.current.slice(0, Math.floor(trouvaillesRef.current.length * mods.saveOnBust)) : trouvaillesRef.current,
      depth: depthRef.current,
      busted: how === 'bust',
      hurts: hurtsRef.current,
      extraKept: mods.extraKept,
    }), 1600);
  }

  // Le tas s'agite tant qu'on a les bras dedans. Fouiller coûte du temps, et
  // le temps coûte du risque : c'est ce qui empêche de tout déblayer tranquille.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      if (!endedRef.current && rubbingRef.current) {
        const l = LAYERS[Math.min(depthRef.current, LAYERS.length - 1)];
        const avant = riskRef.current;
        riskRef.current = Math.min(T.riskMax, riskRef.current + l.riskPerS * riskMul * dt);
        setRisk(riskRef.current);
        /*
         * Le tas prévient tous les quarts de jauge. On regardait jusqu'ici une
         * barre monter en silence, et le « bust » tombait d'un coup — ce qui
         * se lit comme une sanction arbitraire alors que le risque était
         * affiché. Par crans plutôt qu'en continu : un son qui suit la jauge
         * devient une alarme, et une alarme se fait couper.
         */
        const cran = (v: number) => Math.floor((v / T.riskMax) * 4);
        if (cran(riskRef.current) > cran(avant) && riskRef.current < T.riskMax) {
          playTensionRisque();
        }
        if (riskRef.current >= T.riskMax) { finish('bust'); return; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Le seuil d'offre, et le niveau où le tas retombe. En % de la jauge. */
  const SEUIL_SECOURS = 82;
  const REPLI_SECOURS = 50;

  async function calmerLeTas() {
    if (calmant || tasCalme) return;
    setCalmant(true);
    // Le doigt quitte le tas le temps de la vidéo : sans ça, la boucle
    // continuerait de monter le risque pendant qu'on regarde la publicité.
    rubbingRef.current = false;
    const vue = await showRewarded({ famille: 'recup' });
    if (vue) {
      setTasCalme(true);
      riskRef.current = T.riskMax * (REPLI_SECOURS / 100);
      setRisk(riskRef.current);
      playUnlock();
    }
    setCalmant(false);
  }

  function addRisk(n: number) {
    riskRef.current = Math.min(T.riskMax, riskRef.current + n);
    setRisk(riskRef.current);
    if (riskRef.current >= T.riskMax) finish('bust');
  }

  /** Déblaie la case sous le doigt et empoche ce qu'elle cachait. */
  function rubAt(clientX: number, clientY: number) {
    if (endedRef.current) return;
    const el = gridRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = Math.floor(((clientX - r.left) / r.width) * T.gridW);
    const cy = Math.floor(((clientY - r.top) / r.height) * T.gridH);
    if (cx < 0 || cy < 0 || cx >= T.gridW || cy >= T.gridH) return;
    const i = cy * T.gridW + cx;
    const cell = cellsRef.current[i];
    if (!cell || cell.cleared) return;

    setTouched(true);
    const next = [...cellsRef.current];
    next[i] = { ...cell, cleared: true, revealed: !!cell.find };
    cellsRef.current = next;
    setCells(next);

    if (!cell.find) { playStep(); haptic('light'); return; }
    const f = cell.find;
    setPop({ f, key: Date.now() });
    if (f.kind === 'consigne') {
      centimesRef.current += f.value; setCentimes(centimesRef.current); playPickUp(); haptic('medium');
    } else if (f.kind === 'bazar') {
      bazarRef.current += 1; setBazar(bazarRef.current); playPickUp(); haptic('medium');
    } else if (f.kind === 'trouvaille') {
      trouvaillesRef.current = [...trouvaillesRef.current, f.id];
      setTrouvailles(trouvaillesRef.current); playFind(); haptic('heavy');
    } else {
      /*
       * Ce qu'une saleté coûte dépend de qui fouille : l'haleine redoutable
       * fait fuir les rats, le phobique en fait une attaque de panique.
       *
       * Et maintenant elle SONNE comme elle-même. Les six saletés partageaient
       * un `playHurt` — un coup encaissé, alors que personne ne vous frappe.
       * Un rat qui détale, un tesson dans la paume et un yaourt devenu
       * autonome ne s'entendaient donc pas ; le joueur, qui a le doigt sur la
       * grille, apprenait ce qu'il avait touché en lisant l'étiquette.
       */
      playSaleteRecup(f.id); addRisk(piegeCostFor(state.character!, f.id));
      hurtsRef.current.push(f.id);
    }
  }

  function dig() {
    if (!canDig || endedRef.current) return;
    const d = depthRef.current + 1;
    depthRef.current = d; setDepth(d);
    const l = LAYERS[Math.min(d, LAYERS.length - 1)];
    const fresh = makeLayer(d, mods);
    cellsRef.current = fresh; setCells(fresh);
    playDig();
    addRisk(Math.round(l.entryRisk * mods.entryMul));
  }

  if (!char) return null;

  const riskPct = (risk / T.riskMax) * 100;
  const next = nextLayerRisk(depth);
  const held = salvagePayout(centimes);

  return (
    <div className="h-screen bg-texture p-3 flex flex-col items-center gap-2 select-none overflow-hidden">
      {/* Ce qu'on tient — et qu'on peut encore tout perdre */}
      <div className="w-full max-w-sm flex gap-1.5 shrink-0">
        {([
          ['♻️', tr('Consigne', 'Deposit'), held > 0 ? `${held}€` : `${centimes}c`, '#B8860B'],
          ['🔧', tr('Bricoles', 'Parts'), `×${bazar}`, '#8B6B4A'],
          ['💎', tr('Trouvailles', 'Finds'), `×${trouvailles.length}`, '#7B68EE'],
        ] as const).map(([emo, label, val, col], i) => (
          <div key={i} className="flex-1 craft-card px-1.5 py-1.5 text-center">
            <div className="text-[9px] text-[#8B6B4A] leading-tight">{emo} {label}</div>
            <div className="text-base font-mono font-bold leading-tight" style={{ color: col }}>{val}</div>
          </div>
        ))}
      </div>

      {/* L'agitation du tas : la seule jauge qui compte */}
      <div className="w-full max-w-sm shrink-0">
        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
          <span className="text-[#6B5740]">🐀 {tr('Le tas s\'agite', 'The pile stirs')}</span>
          <span className="font-mono" style={{ color: riskPct > 70 ? 'var(--carton-marqueur)' : '#6B5740' }}>{Math.round(riskPct)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#E9E0D4] overflow-hidden border border-[#3A2A1E]/20">
          <motion.div
            className={`h-full rounded-full ${riskPct > 70 ? 'ruban-chantier' : ''}`}
            /*
              LE DERNIER TIERS PASSE EN RUBAN DE CHANTIER.

              Les deux premiers crans gardent leurs dégradés : ils informent
              sans alarmer, et c'est ce qu'on veut tant qu'il reste de la
              marge. Au-delà de 70 %, la barre change de NATURE et pas
              seulement de teinte — la rayure apparaît, et c'est elle qui
              alerte. Un rouge de plus sur du carton n'aurait fait que
              s'ajouter au décor ; une rayure de chantier n'appartient à rien
              d'autre sur cet écran.
            */
            style={riskPct > 70 ? undefined : { background: riskPct > 40 ? 'linear-gradient(90deg,#D9A73E,#E8842C)' : 'linear-gradient(90deg,#7C8B5A,#4A9B5F)' }}
            animate={{ width: `${riskPct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Le dernier cran avant l'écroulement. Le bouton dit ce qu'on garde,
            pas ce qu'on gagne : « continuer » ne pèse rien face à « garder mes
            trois trouvailles ». */}
        {!ended && !tasCalme && riskPct >= SEUIL_SECOURS && canOfferRewarded('recup') && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            disabled={calmant}
            onClick={calmerLeTas}
            className="w-full mt-1.5 py-2 text-[12px] font-bold text-white rounded-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #B84A3A, #8E362A)', boxShadow: '0 3px 12px rgba(184,74,58,0.3)' }}
          >
            {calmant ? tr('⏳ Chargement…', '⏳ Loading…')
              : trouvailles.length > 0
                ? tr(bonusFr(`Garder mes ${trouvailles.length} trouvaille${trouvailles.length > 1 ? 's' : ''}`),
                     bonusEn(`Keep my ${trouvailles.length} find${trouvailles.length > 1 ? 's' : ''}`))
                : tr(bonusFr('Faire retomber le tas'), bonusEn('Settle the pile'))}
          </motion.button>
        )}
      </div>

      {/* Où l'on en est, et ce qu'il faut faire MAINTENANT. Une seule ligne,
          qui change avec l'état : c'est elle qui remplace le mode d'emploi. */}
      <div className="text-center shrink-0 leading-tight">
        <p className="text-[11px] font-bold text-[#3D3020]">
          {tr(layer.name, layer.nameEn)} · {tr('couche', 'layer')} {depth + 1}/{LAYERS.length}
        </p>
        <p className="text-[11px] text-[#8B6B4A]">
          {clearedPct < 0.1
            ? tr('👆 Frottez le tas pour fouiller dedans', '👆 Rub the pile to dig through it')
            : canDig
              ? tr('Assez fouillé : remontez, ou creusez plus bas', 'Dug enough: climb out, or go deeper')
              : depth >= LAYERS.length - 1
                ? tr('Vous êtes au fond. Chaque case peut être la bonne.', 'You\'re at the bottom. Any tile could be the one.')
                : tr(`Continuez, ${Math.round(T.clearToDig * 100)}% pour pouvoir creuser`, `Keep going, ${Math.round(T.clearToDig * 100)}% to be able to dig`)}
        </p>
      </div>

      {/* Le tas à déblayer */}
      <div
        ref={gridRef}
        role="application"
        aria-label={tr('Tas de détritus : frottez pour déblayer', 'Pile of rubbish: rub to clear it')}
        className="relative w-full max-w-sm flex-1 min-h-[260px] rounded-xl overflow-hidden"
        style={{ touchAction: 'none', border: '3px solid #3A2A1E', background: '#241E18' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); rubbingRef.current = true; rubAt(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (rubbingRef.current) rubAt(e.clientX, e.clientY); }}
        onPointerUp={() => { rubbingRef.current = false; }}
        onPointerCancel={() => { rubbingRef.current = false; }}
      >
        {/* Le fond du container : le diorama dédié s'il existe, sinon le
            quartier où l'on fouille. Très assombri dans les deux cas : la
            grille de détritus doit rester le sujet. */}
        <div className="absolute inset-0 opacity-40">
          <LocationBackdrop location={char.location} />
        </div>
        <SafeImg src="/assets/recup-container.webp" className="absolute inset-0 w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[#1C1710]/55" />

        <div
          className="absolute inset-0 grid"
          style={{ gridTemplateColumns: `repeat(${T.gridW}, 1fr)`, gridTemplateRows: `repeat(${T.gridH}, 1fr)` }}
        >
          {cells.map((c, i) => (
            <div key={`${depth}-${i}`} className="relative flex items-center justify-center">
              {/* Le trou, une fois la case déblayée : c'est lui qui montre
                  la progression d'un coup d'œil. */}
              {c.cleared && (
                <span className="absolute inset-0" style={{ background: 'rgba(10,7,4,0.55)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.6)' }} />
              )}
              {/* Ce que la case cachait : gros, net, avec un halo pour les
                  bonnes surprises. C'est LA récompense du geste. */}
              {c.cleared && c.find && (
                <motion.span
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                  className="relative text-2xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]"
                  style={{
                    filter: c.find.kind === 'trouvaille' ? 'drop-shadow(0 0 7px #C9B6FF)'
                      : c.find.kind === 'piege' ? 'drop-shadow(0 0 6px #D94F4F)' : 'drop-shadow(0 0 5px #7BD48A)',
                  }}
                >
                  {c.find.emoji}
                </motion.span>
              )}
              {/* La matière à déblayer : une croûte, pas un objet. */}
              <AnimatePresence>
                {!c.cleared && (
                  <motion.span
                    exit={{ opacity: 0, scale: 1.5, rotate: c.tilt * 2 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-[1px] rounded-[3px]"
                    style={{
                      background: `linear-gradient(${135 + c.tilt}deg, ${c.tone}, #3E3427)`,
                      boxShadow: 'inset 0 1px 0 rgba(255,240,210,0.10), inset 0 -2px 4px rgba(0,0,0,0.35)',
                      // Le flair fait verdir ce qui pue avant qu'on y touche.
                      outline: flair && c.find?.kind === 'piege' ? '2px dashed rgba(124,139,90,0.85)' : undefined,
                      outlineOffset: '-3px',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Le geste, montré : un doigt fantôme frotte le tas jusqu'à ce que
            le joueur prenne la main. Plus efficace qu'une phrase. */}
        <AnimatePresence>
          {!touched && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            >
              <motion.span
                className="text-4xl drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]"
                animate={{ x: [-70, 70, -70], y: [-20, 20, -20], rotate: [-8, 8, -8] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              >
                👆
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* le nom de ce qu'on vient de sortir */}
        <AnimatePresence>
          {pop && (
            <motion.div
              key={pop.key}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: -6 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute left-0 right-0 bottom-3 text-center pointer-events-none z-20"
            >
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(24,18,14,0.8)',
                  color: pop.f.kind === 'piege' ? '#F09A8A' : pop.f.kind === 'trouvaille' ? '#C9B6FF' : '#7BD48A',
                }}
              >
                {pop.f.emoji} {tc(pop.f.name)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* fin de fouille */}
        <AnimatePresence>
          {ended && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-5"
              style={{ background: 'rgba(20,15,11,0.94)' }}
            >
              <div className="text-5xl mb-2">{ended.how === 'bust' ? ended.reason?.emoji : '♻️'}</div>
              <p className="text-base font-bold text-white leading-snug">
                {ended.how === 'bust'
                  ? tr(ended.reason?.fr || '', ended.reason?.en || '')
                  : tr('Vous ressortez du container avec votre butin.', 'You climb out of the bin with your haul.')}
              </p>
              {ended.how === 'out' && (
                <p className="text-xs text-white/80 mt-2">
                  ♻️ {centimes}c · 🔧 ×{bazar}{trouvailles.length > 0 ? ` · 💎 ×${trouvailles.length}` : ''}
                </p>
              )}
              {/* Le presque : ce qui dormait à une case de là. */}
              {ended.how === 'bust' && ended.missed && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="text-xs mt-3 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(242,193,78,0.12)', color: '#F2C14E' }}
                >
                  {tr('Sous vos pieds, il y avait encore', 'Under your feet there was still')} {ended.missed.emoji} {tc(ended.missed.name)}.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LA décision, toujours à l'écran */}
      <div className="w-full max-w-sm flex gap-2 shrink-0">
        <button
          onClick={() => finish('out')}
          disabled={!!ended}
          className="flex-1 btn-primary py-3 text-sm font-bold flex flex-col items-center leading-tight disabled:opacity-50"
        >
          <span>🪜 {tr('Remonter', 'Climb out')}</span>
          <span className="text-[9px] font-normal opacity-90">{tr('le butin est acquis', 'the haul is yours')}</span>
        </button>
        <button
          onClick={dig}
          disabled={!canDig || !!ended}
          className={`flex-1 action-btn py-3 text-sm font-bold flex flex-col items-center leading-tight ${canDig && !ended ? 'border-[#B84A3A]/50 text-[#B84A3A]' : 'opacity-45 text-[#8B6B4A]'}`}
        >
          <span>⛏️ {tr('Creuser', 'Dig deeper')}</span>
          <span className="text-[9px] font-normal">
            {depth >= LAYERS.length - 1
              ? tr('c\'est le fond', 'this is the bottom')
              : canDig && next
                ? tr(`+${next.entry}% d'un coup`, `+${next.entry}% at once`)
                : tr(`déblayez ${Math.round(T.clearToDig * 100)}%`, `clear ${Math.round(T.clearToDig * 100)}%`)}
          </span>
        </button>
      </div>
      <p className="text-[10px] text-[#A08B70] text-center shrink-0">
        {tr(`Déblayé ${Math.round(clearedPct * 100)}% · si le tas se réveille, vous perdez TOUT`,
            `${Math.round(clearedPct * 100)}% cleared · if the pile wakes, you lose EVERYTHING`)}
      </p>
    </div>
  );
}
