/*
 * LE CULOT — l'écran de marchandage.
 *
 * Deux boutons, jamais plus : INSISTER (gratuit, il grogne, ça grignote) et
 * UN ARGUMENT (ça engage quelque chose de vrai). Plus la poignée de main, qui
 * est disponible en permanence — c'est elle, la vraie décision.
 *
 * Ce que le joueur voit, et rien d'autre :
 *   - le prix de départ barré, la remise en cours en gros, le prix qu'il paiera
 *   - le visage du commerçant (cinq humeurs), pas un compteur — sauf s'il a du
 *     flair (nez sensible / paranoïaque), auquel cas la jauge est chiffrée
 *   - ce que chaque argument engage, écrit noir sur blanc avant de cliquer
 *
 * On affiche la remise en pourcentage ET en euros parce que les prix du jeu
 * sont de petits entiers : sans le pourcentage, la moitié des coups sembleraient
 * ne rien faire (voir l'en-tête de data/haggle.ts).
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { tr, tc } from '@/lib/lang';
import type { ShopItem } from '@/contexts/types';
import {
  ARGUMENTS, HAGGLE_TUNING, argumentGain, argumentLands, availableArguments,
  costMultiplier, grumbleLine, haggleMods, insistGain, keeperMood, maxCutFor,
  moves, openingPrice, priceFor, startingPatience, tradeCandidate,
  type ArgumentId, type Shopkeeper,
} from '@/contexts/GameContext';
import { playClick, playGoodOutcome, playHandshake, playTurnedAway } from '@/lib/sound';
import MinigameIntro, { introSeen } from './MinigameIntro';
import MinigameHelpButton from './MinigameHelpButton';
import { setAmbience, type AmbienceId } from '@/lib/ambience';

type Phase = 'talk' | 'deal' | 'broken';

export default function HaggleMinigame({ keeper, item, asking, onClose }: {
  /** Le patron est fourni par la boutique, qui a déjà vérifié qu'il existe :
   *  toutes les enseignes n'ont pas d'humain derrière (voir NO_HAGGLE). */
  keeper: Shopkeeper; item: ShopItem; asking: number;
  /** `price` vaut null si la négociation a cassé : rien n'est acheté. */
  onClose: (result: { price: number | null; cut: number; spent: Partial<Record<'dignity' | 'sleep', number>>; tradedItemId?: string }) => void;
}) {
  const { state } = useGame();
  const char = state.character!;
  const mods = useRef(haggleMods(char)).current;
  const maxCut = useRef(maxCutFor(keeper, mods)).current;
  const maxPatience = useRef(startingPatience(keeper, mods)).current;
  const open = useRef(openingPrice(asking, mods)).current;
  const pool = useRef(availableArguments(char, state.weather, mods)).current;

  const [patience, setPatience] = useState(maxPatience);
  const [cut, setCut] = useState(0);
  const [insists, setInsists] = useState(0);
  const [used, setUsed] = useState<ArgumentId[]>([]);
  // La phrase d'accroche est construite ici avec le nom déjà traduit : `tc`
  // travaille sur des chaînes connues du dictionnaire, pas sur du texte monté
  // à la volée.
  const [line, setLine] = useState(`« ${tc(item.name)} ? C'est ${open} €. »`);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const [phase, setPhase] = useState<Phase>('talk');
  const [showArgs, setShowArgs] = useState(false);
  const spent = useRef<{ dignity?: number; sleep?: number }>({});
  const traded = useRef<string | undefined>(undefined);
  // Comme les autres mini-jeux : les règles une seule fois, à la première
  // négociation de la partie.
  const [intro, setIntro] = useState(!introSeen('haggle1'));

  // Le marchandage se joue dans la boutique, pas sur un écran à lui : c'est
  // donc ici qu'on pose son lit sonore, et qu'on le retire en sortant.
  useEffect(() => {
    if (intro) return;
    setAmbience('mg-marchandage');
    // En sortant on rend la boutique à son quartier : la couper au silence
    // laisserait l'écran muet jusqu'au prochain changement d'écran.
    return () => { setAmbience(char.location as AmbienceId); };
  }, [intro, char.location]);

  const price = priceFor(open, cut);
  const mood = keeperMood(patience, maxPatience);
  const trade = tradeCandidate(char);

  function spendPatience(amount: number): boolean {
    const left = patience - amount;
    setPatience(Math.max(0, left));
    if (left <= 0) {
      setPhase('broken');
      setLine(keeper.snap);
      playTurnedAway();
      return false;
    }
    return true;
  }

  function doInsist() {
    if (phase !== 'talk') return;
    playClick();
    const gain = insistGain(keeper, cut, maxCut, insists) * mods.bindMul;
    const moved = moves(gain);
    const cost = keeper.insistCost * costMultiplier(cut, maxCut) * (moved ? 1 : HAGGLE_TUNING.deadInsistMul);
    if (moved) {
      setCut(c => c + gain);
      setLine(grumbleLine(keeper));
      setFlash('good');
    } else {
      // Le TIC : il ne bougera plus par la parole. C'est l'information la plus
      // utile du jeu, et elle est gratuite.
      setLine(keeper.tell);
      setFlash(null);
    }
    setInsists(n => n + 1);
    spendPatience(cost);
    setTimeout(() => setFlash(null), 420);
  }

  function doArgument(id: ArgumentId) {
    if (phase !== 'talk' || used.includes(id)) return;
    playClick();
    setShowArgs(false);
    setUsed(u => [...u, id]);
    const arg = ARGUMENTS[id];
    // Le coût est payé quoi qu'il arrive : on a montré son jeu.
    if (id === 'fierte') spent.current.dignity = (spent.current.dignity || 0) + HAGGLE_TUNING.fierteCost;
    if (id === 'service') spent.current.sleep = (spent.current.sleep || 0) + HAGGLE_TUNING.serviceCost;

    if (argumentLands(id, char, state.weather, keeper)) {
      if (id === 'objet' && trade) traded.current = trade.id;
      const gain = argumentGain(arg, keeper, cut, maxCut, mods);
      setCut(c => c + gain);
      setInsists(0);          // un argument neuf lui redonne de quoi réfléchir
      setLine(arg.line);
      setFlash('good');
      playGoodOutcome();
      spendPatience(HAGGLE_TUNING.argCost * costMultiplier(cut, maxCut));
    } else {
      setLine(refusalFor(id, keeper));
      setFlash('bad');
      spendPatience(arg.backfire);
    }
    setTimeout(() => setFlash(null), 420);
  }

  function shake() {
    if (phase !== 'talk') return;
    playHandshake();
    setPhase('deal');
    setLine(keeper.deal);
  }

  const argOpen = phase === 'talk' && showArgs;

  if (intro) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-texture">
        <MinigameIntro
          id="haggle1" emoji="🤝" title="Le Culot" titleEn="Nerve"
          scene="shop"
          image="/assets/intro-marchandage.webp"
          onStart={() => setIntro(false)}
          lines={[
            { emoji: '💬', fr: "INSISTER ne coûte rien et fait grignoter le prix. Mais à force d'entendre la même chose, il cesse de bouger — et il vous le dira.", en: "PUSHING is free and shaves the price. Hear the same line too often and he stops budging — and he'll tell you." },
            { emoji: '🗣️', fr: "UN ARGUMENT engage quelque chose de vrai : un objet du sac, votre réputation, la pluie dehors, votre fierté. Ça paie gros — ou ça se retourne.", en: "AN ARGUMENT stakes something real: an item from your bag, your reputation, the rain outside, your pride. It pays big — or it backfires." },
            { emoji: '😒', fr: "Sa patience se lit sur son visage. Plus il a déjà lâché, plus le coup suivant lui coûte cher.", en: "His patience shows on his face. The more he's already given, the dearer the next step costs him." },
            { emoji: '🤝', fr: "Serrez la main quand vous voulez : le prix affiché est acquis.", en: "Shake on it whenever you like: the shown price is yours." },
            { emoji: '🚪', fr: "S'il craque, il ne vous sert plus de la journée. Une porte qui se ferme, pas une amende.", en: "If he snaps, he won't serve you today. A door closing, not a fine." },
          ]}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px]"
      onClick={() => { if (phase !== 'talk') finish(); }}
      role="dialog" aria-label={tr('Marchandage', 'Haggling')}
    >
      {/* Le « ? » rouvre les règles : Le Culot est le mini-jeu le plus espacé
          du jeu, c'est celui qu'on oublie en premier. */}
      <MinigameHelpButton onOpen={() => setIntro(true)} />
      <motion.div
        initial={{ y: 40 }} animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="craft-card-solid w-full max-w-sm p-4 pb-5 rounded-b-none"
        onClick={e => e.stopPropagation()}
      >
        {/* ---- Le comptoir : qui, quoi, combien ---- */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            key={mood.emoji}
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="text-4xl leading-none"
          >
            {mood.emoji}
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#4A3B28] truncate">{tc(keeper.role)}</p>
            <p className="text-[11px] text-[#A08B70] truncate">{tc(mood.label)}</p>
          </div>
          {/* Le prix de départ ne s'affiche que s'il a bougé : barrer « 5 € »
              à côté d'un « 5 € » bien vivant n'apprend rien à personne. */}
          {price < open && (
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-[#A08B70]">{tr('Au départ', 'Started at')}</p>
              <p className="text-xs text-[#A08B70] line-through">{open} €</p>
            </div>
          )}
        </div>

        {/* Le flair permet de LIRE la patience au lieu de la deviner. C'est le
            seul endroit du jeu où un trait donne de l'information plutôt qu'un
            bonus chiffré, et c'est très largement le plus utile. */}
        {mods.readsPatience && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-[#A08B70] mb-1">
              <span>👃 {tr('Vous sentez son agacement', 'You sense his irritation')}</span>
              <span className="font-bold">{Math.max(0, Math.round((patience / maxPatience) * 100))} %</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#E8D5C0] overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#C4703A]"
                animate={{ width: `${Math.max(0, (patience / maxPatience) * 100)}%` }} />
            </div>
          </div>
        )}

        {/* ---- L'étiquette de prix ---- */}
        <div className="rounded-2xl px-4 py-3 mb-3 text-center relative overflow-hidden"
          style={{ background: '#F5EDE4', border: '1.5px solid #E8D5C0' }}>
          <AnimatePresence>
            {flash && (
              <motion.div
                key={flash + cut}
                initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.42 }}
                className="absolute inset-0"
                style={{ background: flash === 'good' ? '#4A9B5F' : '#C4553A' }}
              />
            )}
          </AnimatePresence>
          <p className="relative text-[10px] uppercase tracking-wider text-[#A08B70] mb-0.5">
            {item.emoji} {tc(item.name)}
          </p>
          <div className="relative flex items-baseline justify-center gap-2">
            <motion.span key={price} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="text-3xl font-black text-[#4A3B28]">
              {price} €
            </motion.span>
            <span className={`text-sm font-bold ${cut > 0.005 ? 'text-[#4A9B5F]' : 'text-[#A08B70]'}`}>
              −{Math.round(cut * 100)} %
            </span>
          </div>
          {/* La barre de remise : c'est elle qui bouge à chaque coup, même quand
              l'euro reste au même chiffre. Sans elle, la moitié des actions
              sembleraient sans effet. */}
          {/* La barre dit ce qu'on a OBTENU, jamais ce qui reste à obtenir.
              Elle est calée sur une échelle fixe (voir barScale) et non sur le
              plancher du commerçant : sinon elle trahirait jusqu'où il peut
              descendre, et personne ne vous souffle ça dans une vraie
              négociation. Le tic du commerçant reste le seul signal, et il ne
              parle que du présent. */}
          <div className="relative h-1.5 mt-2 rounded-full bg-[#E8D5C0] overflow-hidden">
            <motion.div className="h-full rounded-full bg-[#4A9B5F]"
              animate={{ width: `${Math.min(100, (cut / HAGGLE_TUNING.barScale) * 100)}%` }} />
          </div>
        </div>

        {/* ---- Ce qu'il dit ---- */}
        <div className="min-h-[3.2rem] px-1 mb-3 flex items-center">
          <motion.p key={line} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-[13px] leading-snug text-[#6B5740] italic">
            {tc(line)}
          </motion.p>
        </div>

        {/* ---- Les deux verbes, ou la sortie ---- */}
        {phase === 'talk' ? (
          <>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={doInsist} className="action-btn py-3 text-sm font-bold text-[#6B5740]">
                💬 {tr('Insister', 'Push')}
                <span className="block text-[10px] font-normal text-[#A08B70]">{tr('gratuit', 'free')}</span>
              </button>
              <button
                onClick={() => { playClick(); setShowArgs(v => !v); }}
                disabled={pool.every(a => used.includes(a))}
                className="action-btn py-3 text-sm font-bold text-[#6B5740] disabled:opacity-40"
              >
                🗣️ {tr('Un argument', 'An argument')}
                <span className="block text-[10px] font-normal text-[#A08B70]">
                  {pool.filter(a => !used.includes(a)).length} {tr('restants', 'left')}
                </span>
              </button>
            </div>
            <button onClick={shake} className="btn-primary w-full py-3 text-sm">
              🤝 {tr('Serrer la main', 'Shake on it')} — {price} €
            </button>
          </>
        ) : (
          <button onClick={finish} className="btn-primary w-full py-3 text-sm">
            {phase === 'deal'
              ? `🤝 ${tr('Payer', 'Pay')} ${price} €`
              : tr('Sortir de la boutique', 'Leave the shop')}
          </button>
        )}

        {/* ---- Le tiroir des arguments ---- */}
        <AnimatePresence>
          {argOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-1.5 max-h-[34vh] overflow-y-auto">
                {pool.map(id => {
                  const a = ARGUMENTS[id];
                  const done = used.includes(id);
                  return (
                    <button
                      key={id} onClick={() => doArgument(id)} disabled={done}
                      className="w-full text-left rounded-xl px-3 py-2 flex items-center gap-2.5 disabled:opacity-35"
                      style={{ background: '#F5EDE4', border: '1px solid #E8D5C0' }}
                    >
                      <span className="text-lg shrink-0">{a.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold text-[#4A3B28]">
                          {tc(a.label)}{id === 'objet' && trade ? ` — ${trade.emoji} ${tc(trade.name)}` : ''}
                        </span>
                        <span className="block text-[10px] text-[#A08B70]">{tc(a.cost)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  function finish() {
    onClose({
      price: phase === 'deal' ? price : null,
      cut: phase === 'deal' ? cut : 0,
      spent: spent.current,
      tradedItemId: phase === 'deal' ? traded.current : undefined,
    });
  }
}

/** Ce qu'il répond à un argument qui tombe à plat. Chaque refus dit POURQUOI :
 *  le joueur doit pouvoir apprendre, pas seulement encaisser. */
function refusalFor(id: ArgumentId, k: Shopkeeper): string {
  if (k.hard.includes(id)) {
    switch (id) {
      case 'reputation': return '« Connu ? Par qui, exactement ? Non, ne répondez pas. »';
      case 'objet': return '« Je ne prends pas ça. Je ne prends rien du tout, d\'ailleurs. »';
      case 'meteo': return '« Il pleut sur tout le monde. Sur moi aussi, figurez-vous. »';
      case 'fierte': return '« Arrêtez ça tout de suite. Ça ne marche pas avec moi. »';
      default: return '« Non. Passons à autre chose. »';
    }
  }
  switch (id) {
    case 'reputation': return '« Je ne vous ai jamais vu de ma vie. »';
    case 'meteo': return '« Il fait un temps splendide. Essayez encore. »';
    case 'objet': return '« Vous n\'avez rien qui m\'intéresse. »';
    case 'service': return '« Vous tenez à peine debout. Rentrez vous coucher. »';
    default: return '« Non. »';
  }
}
