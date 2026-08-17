import { bagCapacity } from '@/contexts/GameContext';
import { useState, useEffect } from 'react';
import { useGame, getShopsForLocation, marketPrice, getBraderie, isSolidarityDay, SOLIDARITY_FLAG, getDiscountLabel, getNextDiscountTier, getShopEvent, shopClosure, absurdReopen, STAT_META, shopkeeperFor, HAGGLED_FLAG, HAGGLE_TUNING, haggleReopen } from '@/contexts/GameContext';
import { showRewarded } from '@/lib/ads';
import type { Shop, ShopItem, ShopEvent, Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { playClick, playMoneyOut, playShare } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import LocationBackdrop from './LocationBackdrop';
import { pushToast } from '@/lib/toast';
import SafeImg from './SafeImg';
import HaggleMinigame from './HaggleMinigame';

const CATEGORY_COLORS: Record<string, { bg: string; color: string; label: string; labelEn: string }> = {
  food: { bg: '#4A9B5F15', color: '#4A9B5F', label: 'Nourriture', labelEn: 'Food' },
  drink: { bg: '#4A8FBF15', color: '#4A8FBF', label: 'Boisson', labelEn: 'Drink' },
  medicine: { bg: '#D94F4F15', color: '#D94F4F', label: 'Soin', labelEn: 'Medicine' },
  weapon: { bg: '#8B451315', color: '#8B4513', label: 'Arme', labelEn: 'Weapon' },
  tool: { bg: '#D4874D15', color: '#D4874D', label: 'Outil', labelEn: 'Tool' },
  clothing: { bg: '#7B68EE15', color: '#7B68EE', label: 'Vêtement', labelEn: 'Clothing' },
  special: { bg: '#B8860B15', color: '#B8860B', label: 'Service', labelEn: 'Service' },
};

// Compteur d'argent qui « roule » d'une valeur à l'autre : l'œil suit la
// dépense au lieu de voir le chiffre sauter d'un coup.
function MoneyCounter({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 0.45, ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{display}€</>;
}

export default function ShopScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character!;
  const shops = getShopsForLocation(char.location);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [buyAnimation, setBuyAnimation] = useState<string | null>(null);
  const [shopEvent, setShopEvent] = useState<ShopEvent | null>(null);
  const [reopeningId, setReopeningId] = useState<string | null>(null);
  // Combien de fois chaque article a été acheté dans cette visite (badge ×N).
  const [bought, setBought] = useState<Record<string, number>>({});
  // Total dépensé pendant cette visite de boutique (barre d'argent).
  const [spent, setSpent] = useState(0);
  // Petites étiquettes « -X€ » qui s'envolent depuis l'argent à chaque achat.
  const [deltas, setDeltas] = useState<{ id: number; amt: number }[]>([]);
  // Fontaine du parc en cours de chargement de pub (anti-exploit eau gratuite).
  const [fountainBusy, setFountainBusy] = useState(false);
  // Négociation en cours : l'article discuté et le prix demandé au départ.
  const [haggling, setHaggling] = useState<{ item: ShopItem; asking: number } | null>(null);

  // « Coup de main » via pub récompensée : la boutique rouvre, avec une
  // résolution aussi absurde que la panne.
  async function reopenWithAd(shop: Shop) {
    if (reopeningId) return;
    setReopeningId(shop.id);
    const rewarded = await showRewarded({ exempt: true });
    if (rewarded) {
      // Brouille de marchandage : on se réconcilie. Panne : on répare.
      const closed = shopClosure(char, shop.id);
      const reason = closed?.fromHaggle ? haggleReopen() : absurdReopen(shop.id);
      dispatch({ type: 'REOPEN_SHOP', shopId: shop.id });
      pushToast(`${tc(shop.name)} : ${tr(reason.fr, reason.en)}`, { emoji: '🔓', tone: 'good' });
    }
    setReopeningId(null);
  }

  const discountLabel = getDiscountLabel(char.respect);
  const nextTier = getNextDiscountTier(char.respect);

  useEffect(() => {
    if (selectedShop) {
      const event = getShopEvent(selectedShop.id);
      if (event) setShopEvent(event);
    } else {
      setShopEvent(null);
    }
    // Nouvelle boutique = nouvelle visite : on repart de zéro.
    setBought({});
    setSpent(0);
    setDeltas([]);
  }, [selectedShop]);

  // Résumé compact des effets d'un achat, pour le toast de confirmation.
  function buyToast(item: ShopItem) {
    if (item.giveItem) {
      pushToast(`${item.emoji} ${tr('Ajouté au sac', 'Added to bag')} : ${tc(item.name)}`, { emoji: '🛍️', tone: 'good' });
      return;
    }
    const parts = Object.entries(item.effect || {})
      .filter(([, v]) => !!v)
      .map(([k, v]) => `${STAT_META[k as keyof Stats]?.emoji ?? ''}${v! > 0 ? '+' : ''}${v}`);
    pushToast(`${item.emoji} ${tc(item.name)}${parts.length ? ' · ' + parts.join(' ') : ''}`, { emoji: '🛍️', tone: 'good' });
  }

  const handleBuy = async (item: ShopItem) => {
    // Fontaine du parc : l'eau est gratuite, mais toutes les 3 gorgées elle
    // fait des siennes — on regarde une pub pour que ça se débloque.
    if (item.id === 'eau-fontaine' && (char.fountainUses || 0) % 3 === 2) {
      if (fountainBusy) return;
      setFountainBusy(true);
      pushToast(tr('La fontaine tousse, crachote… et un attroupement se forme.', 'The fountain sputters, coughs… and a crowd gathers.'), { emoji: '⛲' });
      const ok = await showRewarded({ exempt: true });
      setFountainBusy(false);
      if (!ok) {
        pushToast(tr('Tant pis : vous restez sur votre soif pour l\'instant.', 'Too bad: you stay thirsty for now.'), { emoji: '😩', tone: 'bad' });
        return;
      }
    }

    const actualPrice = marketPrice(item, selectedShop!.id, char.respect, char.day).final;
    if (char.money < actualPrice) return;
    if (item.giveItem && char.inventory.length >= bagCapacity(char)) return;

    setBuyAnimation(item.id);
    setTimeout(() => setBuyAnimation(null), 350);
    setBought((b) => ({ ...b, [item.id]: (b[item.id] || 0) + 1 }));
    setSpent((s) => s + actualPrice);
    if (actualPrice > 0) {
      const id = Date.now() + Math.random();
      setDeltas((d) => [...d, { id, amt: actualPrice }]);
      setTimeout(() => setDeltas((d) => d.filter((x) => x.id !== id)), 1000);
    }
    playMoneyOut();
    buyToast(item);
    dispatch({ type: 'BUY_ITEM', shopItem: item, actualPrice });
  };

  const handleShopEvent = () => {
    if (shopEvent) {
      dispatch({ type: 'TRIGGER_SHOP_EVENT', event: shopEvent });
      setShopEvent(null);
    }
  };

  // Distribution solidaire du jour : une part gratuite via pub récompensée,
  // une seule fois par jour (mémorisée par un drapeau daté).
  const solidarityDay = isSolidarityDay(char.day);
  const solidarityDone = char.activeFlags.includes(SOLIDARITY_FLAG(char.day));
  const [claimingSolid, setClaimingSolid] = useState(false);
  async function claimSolidarity() {
    if (claimingSolid || solidarityDone) return;
    setClaimingSolid(true);
    const rewarded = await showRewarded({ exempt: true });
    if (rewarded) {
      playShare();
      dispatch({ type: 'CLAIM_SOLIDARITY' });
      pushToast(tr('Distribution solidaire : soupe, pain et eau. Ça tiendra au chaud.', 'Food bank: soup, bread and water. That\'ll keep you going.'), { emoji: '🥣', tone: 'good' });
    }
    setClaimingSolid(false);
  }

  // Barre d'argent : argent animé + étiquettes qui s'envolent + total dépensé
  // + remise fidélité.
  const moneyBar = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-base">💰</span>
        <span className="relative font-mono font-bold text-[#B8860B] text-lg leading-none">
          <MoneyCounter value={char.money} />
          <AnimatePresence>
            {deltas.map((d) => (
              <motion.span
                key={d.id}
                initial={{ y: 0, opacity: 0.9, scale: 0.9 }}
                animate={{ y: -22, opacity: 0, scale: 1 }}
                transition={{ duration: 1 }}
                className="absolute left-full ml-1 top-0 text-xs font-bold text-[#B84A3A] pointer-events-none whitespace-nowrap"
              >
                −{d.amt}€
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {spent > 0 && (
          <span className="text-[10px] font-semibold text-[#8B6B4A] font-mono">
            🛍️ {tr('dépensé', 'spent')} {spent}€
          </span>
        )}
        {discountLabel && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4A9B5F]/15 text-[#3d8b4f]">
            ⭐ {discountLabel}
          </span>
        )}
      </div>
    </div>
  );

  // Shop detail view
  if (selectedShop) {
    // Le marchandage : y a-t-il un patron derrière ce comptoir, et lui a-t-on
    // déjà pris la tête aujourd'hui ? (voir data/haggle.ts)
    const keeper = shopkeeperFor(selectedShop.id);
    const alreadyHaggled = char.activeFlags.includes(HAGGLED_FLAG(selectedShop.id, char.day));

    return (
      <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
        {/* Shop Header */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="craft-card p-0 overflow-hidden shrink-0"
        >
          <div className="relative h-24 w-full">
            <SafeImg src={`/assets/shop-${selectedShop.id}.webp`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            {/* La porte de sortie, en haut à droite comme dans un vrai magasin :
                elle rend la rue en un seul geste, sans repasser par la liste. */}
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#2A1F1A] shadow-md active:scale-95 transition-transform"
              style={{ background: 'rgba(247,238,226,0.94)', border: '1.5px solid #3A2A1E' }}
            >
              🚪 {tr('Retour au trottoir', 'Back to the pavement')}
            </button>
            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2.5 p-3">
              <span className="text-2xl drop-shadow">{selectedShop.emoji}</span>
              <div className="min-w-0">
                <h2 className="text-lg text-white drop-shadow leading-tight">{tc(selectedShop.name)}</h2>
                <p className="text-[11px] text-white/85 drop-shadow leading-snug line-clamp-1">{tc(selectedShop.description)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barre d'argent (toujours visible au-dessus de la liste) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="craft-card px-3.5 py-2.5 shrink-0"
        >
          {moneyBar}
          {nextTier && (
            <div className="mt-2 pt-2 border-t border-[#E8D5C0] flex items-center gap-1.5 text-[10px] text-[#8B6B4A]">
              <span>⭐</span>
              <span>
                {tr('Encore', 'Just')} <strong className="text-[#B8860B]">{nextTier.needed}</strong> {tr('respect pour', 'more respect for')}{' '}
                <strong className="text-[#4A9B5F]">-{Math.round(nextTier.discount * 100)}%</strong>
              </span>
            </div>
          )}
        </motion.div>

        {/* Bandeau braderie : cette boutique est en promo aujourd'hui */}
        {getBraderie(selectedShop.id, char.day) > 0 && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 py-2 px-3 rounded-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #D9743E15, #B8860B15)', border: '1px solid #D9743E40' }}
          >
            <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
              <span className="text-lg">🏷️</span>
              <SafeImg src="/assets/braderie.webp" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-[#B8541E]">
              {tr('Braderie du jour', 'Today\'s clearance sale')} · −{Math.round(getBraderie(selectedShop.id, char.day) * 100)}% {tr('sur tout !', 'on everything!')}
            </p>
          </motion.div>
        )}

        {/* Shop Event */}
        <AnimatePresence>
          {shopEvent && (
            <motion.button
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={handleShopEvent}
              className="w-full craft-card p-3 text-left border-[#D4874D]/30 bg-[#D4874D]/5 shrink-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#D4874D]">{tr('Événement spécial', 'Special event')}</p>
                  <p className="text-xs text-[#6B5740]">{shopEvent.text}</p>
                </div>
                <span className="text-xs text-[#D4874D]">→</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Items */}
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto -mx-1 px-1">
          {selectedShop.items.map((item, i) => {
            const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.special;
            const { base, final: actualPrice, braderie: itemBraderie } = marketPrice(item, selectedShop.id, char.respect, char.day);
            const hasDiscount = actualPrice < base;
            const canAfford = char.money >= actualPrice;
            const inventoryFull = !!(item.giveItem && char.inventory.length >= bagCapacity(char));
            const isBuying = buyAnimation === item.id;
            const count = bought[item.id] || 0;
            const shortfall = actualPrice - char.money;

            return (
              <motion.div
                key={item.id}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.035 }}
                className="craft-card p-0 overflow-hidden relative"
              >
                {/* Liseré de catégorie à gauche */}
                <span className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: cat.color }} />
                {/* Flash vert bref à l'achat */}
                <AnimatePresence>
                  {isBuying && (
                    <motion.span
                      initial={{ opacity: 0.35 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-[#4A9B5F] pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className={`flex items-start gap-2.5 p-3 pl-4 ${inventoryFull ? 'opacity-60' : ''}`}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: cat.bg, border: `1px solid ${cat.color}25` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-[#2A1F1A]">{tc(item.name)}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        {tr(cat.label, cat.labelEn)}
                      </span>
                      {itemBraderie > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#D9743E]/15 text-[#B8541E]">
                          🏷️ {tr('promo', 'sale')} −{Math.round(itemBraderie * 100)}%
                        </span>
                      )}
                      {count > 0 && (
                        <motion.span
                          key={count}
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#4A9B5F]/15 text-[#3d8b4f]"
                        >
                          ✓ ×{count}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B5740] mt-0.5 leading-snug">{tc(item.description)}</p>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {item.effect && Object.entries(item.effect).map(([key, val]) => {
                        const stat = STAT_META[key as keyof Stats];
                        if (!stat || !val) return null;
                        return (
                          <span
                            key={key}
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                              val > 0 ? 'bg-[#4A9B5F]/10 text-[#3d8b4f]' : 'bg-[#D94F4F]/10 text-[#B84A3A]'
                            }`}
                          >
                            {stat.emoji} {val > 0 ? '+' : ''}{val}
                          </span>
                        );
                      })}
                      {item.giveItem?.attackBonus && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium bg-[#D4874D]/10 text-[#D4874D]">
                          ⚔️ +{item.giveItem.attackBonus}
                        </span>
                      )}
                      {item.giveItem?.defenseBonus && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium bg-[#4A8FBF]/10 text-[#4A8FBF]">
                          🛡️ +{item.giveItem.defenseBonus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bouton d'achat / état */}
                  {inventoryFull ? (
                    <div className="shrink-0 self-center px-3 py-2 rounded-lg bg-[#E8D5C0] text-center">
                      <span className="text-[10px] font-semibold text-[#8B6B4A]">{tr('Sac plein', 'Bag full')}</span>
                    </div>
                  ) : !canAfford ? (
                    <div className="shrink-0 self-center px-3 py-2 rounded-lg bg-[#D94F4F]/8 border border-[#D94F4F]/20 text-center flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold text-[#B84A3A] font-mono">{actualPrice}€</span>
                      <span className="text-[9px] font-medium text-[#B84A3A] whitespace-nowrap">
                        {tr('manque', 'need')} {shortfall}€
                      </span>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleBuy(item)}
                      whileTap={{ scale: 0.9 }}
                      className="shrink-0 self-center btn-primary px-3.5 py-2 rounded-xl flex flex-col items-center leading-none gap-0.5"
                    >
                      {hasDiscount ? (
                        <>
                          <span className="text-[9px] line-through opacity-60 font-mono">{base}€</span>
                          <span className="text-sm font-bold font-mono">{actualPrice}€</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold font-mono">{actualPrice === 0 ? tr('Gratuit', 'Free') : `${actualPrice}€`}</span>
                      )}
                      <span className="text-[8px] opacity-85">🛒 {tr('Acheter', 'Buy')}</span>
                    </motion.button>
                  )}
                </div>

                {/* Marchander : proposé sous l'article, jamais imposé. Une fois
                    par jour et par boutique, et seulement quand il y a
                    réellement quelque chose à discuter (voir minToHaggle). */}
                {keeper && !alreadyHaggled && !inventoryFull && actualPrice >= HAGGLE_TUNING.minToHaggle && (
                  <button
                    onClick={() => { playClick(); setHaggling({ item, asking: actualPrice }); }}
                    className="w-full py-2 text-[11px] font-semibold text-[#8B6B4A] flex items-center justify-center gap-1.5 border-t"
                    style={{ borderColor: '#E8D5C0', background: '#FBF6F0' }}
                  >
                    🤝 {tr('Marchander', 'Haggle')}
                    <span className="font-normal text-[#A08B70]">· {tc(keeper.role)}</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* La sortie vers la rue est en haut de l'écran (voir l'en-tête) ;
            ici, on ne propose que de retourner choisir une autre boutique. */}
        <button
          onClick={() => setSelectedShop(null)}
          className="action-btn py-3 text-sm font-semibold text-[#6B5740] flex items-center justify-center gap-1.5 shrink-0"
        >
          ← {tr('Autres boutiques', 'Other shops')}
        </button>

        <AnimatePresence>
          {haggling && (
            <HaggleMinigame
              keeper={keeper!}
              item={haggling.item}
              asking={haggling.asking}
              onClose={(res) => {
                const { item } = haggling;
                setHaggling(null);
                // Ce qu'on a engagé se paie dans tous les cas : dignité, fatigue,
                // objet troqué, et la porte close si on a tiré sur la corde.
                dispatch({
                  type: 'RESOLVE_HAGGLE', shopId: selectedShop.id,
                  broken: res.price === null, cut: res.cut,
                  spent: res.spent as Partial<Stats>, tradedItemId: res.tradedItemId,
                });
                if (res.price === null) {
                  pushToast(tr('Vous avez trop tiré sur la corde. Il ne vous sert plus aujourd\'hui.',
                    'You pushed too far. He won\'t serve you today.'), { emoji: '🚪', tone: 'bad' });
                  setSelectedShop(null);
                  return;
                }
                if (char.money < res.price) {
                  pushToast(tr('Beau marchandage… mais vous n\'avez même pas ça.',
                    'Nice haggling… but you don\'t even have that.'), { emoji: '💸', tone: 'bad' });
                  return;
                }
                setBought(b => ({ ...b, [item.id]: (b[item.id] || 0) + 1 }));
                setSpent(s => s + res.price!);
                playMoneyOut();
                buyToast(item);
                if (res.cut > 0.005) {
                  pushToast(`${tr('Négocié', 'Haggled')} −${Math.round(res.cut * 100)} % · ${haggling.asking}€ → ${res.price}€`,
                    { emoji: '🤝', tone: 'good' });
                }
                dispatch({ type: 'BUY_ITEM', shopItem: item, actualPrice: res.price });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Shop list view
  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-0 overflow-hidden"
      >
        <div className="relative h-20 w-full">
          <LocationBackdrop location={char.location} />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/75 to-white/15" />
          <div className="absolute inset-0 flex justify-between items-center px-3.5">
            <div>
              <h2 className="text-xl text-[#2A1F1A]">{tr('Boutiques', 'Shops')}</h2>
              <p className="text-xs text-[#8B6B4A]">{tr('Dépensez votre argent durement gagné', 'Spend your hard-earned money')}</p>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-semibold text-[#B8860B]">{char.money}€</div>
              {discountLabel && (
                <div className="text-[10px] text-[#4A9B5F] font-medium">{discountLabel}</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {(discountLabel || nextTier) && (
        <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-[#4A9B5F]/6 border border-[#4A9B5F]/15">
          <span className="text-sm mt-0.5">⭐</span>
          <div className="text-xs text-[#4A9B5F] font-medium leading-relaxed">
            {discountLabel ? (
              <p>{tr('Votre réputation vous précède !', 'Your reputation precedes you!')} {discountLabel} {tr('sur tous les achats.', 'off everything.')}</p>
            ) : (
              <p>{tr('Gagnez du respect pour débloquer des remises en boutique.', 'Earn respect to unlock shop discounts.')}</p>
            )}
            {nextTier && (
              <p className="text-[#8B6B4A]">
                {tr('Encore', 'Just')} <strong className="text-[#B8860B]">{nextTier.needed}</strong> {tr('respect pour', 'more respect for')}{' '}
                <strong>-{Math.round(nextTier.discount * 100)}%</strong>.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Distribution solidaire du jour (part gratuite via pub) */}
      {solidarityDay && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="craft-card p-3.5 flex items-center gap-3"
          style={{ border: '1px solid #4A9B5F40', background: 'linear-gradient(135deg, #4A9B5F10, transparent)' }}
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#4A9B5F]/10">
            <span className="text-2xl">🥣</span>
            <SafeImg src="/assets/solidarite.webp" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2A1F1A]">{tr('Distribution solidaire', 'Food bank today')}</p>
            <p className="text-[11px] text-[#6B5740] leading-snug">
              {tr('Une tournée passe aujourd\'hui : repartez avec soupe, pain et eau.', 'A round is passing today: leave with soup, bread and water.')}
            </p>
          </div>
          {solidarityDone ? (
            <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#4A9B5F]/15 text-[#3d8b4f]">
              {tr('✅ Récupéré', '✅ Claimed')}
            </span>
          ) : (
            <button
              onClick={claimSolidarity}
              disabled={claimingSolid}
              className="shrink-0 py-2 px-3 text-xs font-semibold text-white rounded-lg disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)' }}
            >
              {claimingSolid ? tr('⏳', '⏳') : tr('🎬 Ma part (pub)', '🎬 My share (ad)')}
            </button>
          )}
        </motion.div>
      )}

      {shops.length === 0 ? (
        <div className="craft-card p-8 text-center">
          <p className="text-3xl mb-2">🏜️</p>
          <p className="text-sm text-[#8B6B4A]">{tr('Aucune boutique ici. Essayez un autre quartier.', 'No shops here. Try another neighborhood.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {shops.map((shop, i) => {
            const prices = shop.items.map(it => marketPrice(it, shop.id, char.respect, char.day).final);
            const cheapest = Math.min(...prices);
            const mostExpensive = Math.max(...prices);
            const canAffordSomething = prices.some(p => char.money >= p);
            const shopBraderie = getBraderie(shop.id, char.day);
            // Boutique en panne/fermée : raison loufoque + « coup de main » via pub.
            const closed = shopClosure(char, shop.id);
            const daysLeft = closed ? closed.untilDay - char.day : 0;

            if (closed) {
              return (
                <motion.div
                  key={shop.id}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="craft-card p-3.5 flex flex-col gap-2.5 opacity-90"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#D4B896] grayscale flex items-center justify-center text-2xl shadow-sm shrink-0 relative">
                      {shop.emoji}
                      <span className="absolute -bottom-1 -right-1 text-sm">🚫</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-[#2A1F1A] block">{tc(shop.name)}</span>
                      <span className="text-xs text-[#B84A3A] font-semibold block leading-snug">
                        {tr(`Fermé (${daysLeft} j)`, `Closed (${daysLeft}d)`)} : {tr(closed.reason, closed.reasonEn)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => reopenWithAd(shop)}
                    disabled={reopeningId === shop.id}
                    className="w-full py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)' }}
                  >
                    {reopeningId === shop.id
                      ? tr('⏳ Chargement…', '⏳ Loading…')
                      : tr('🎬 Filer un coup de main (pub)', '🎬 Lend a hand (watch an ad)')}
                  </button>
                </motion.div>
              );
            }

            return (
              <motion.button
                key={shop.id}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedShop(shop)}
                className={`craft-card p-3.5 text-left flex items-center gap-3 ${!canAffordSomething ? 'opacity-50' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8D5C0] to-[#D4B896] flex items-center justify-center text-2xl shadow-sm shrink-0">
                  {shop.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#2A1F1A]">{tc(shop.name)}</span>
                    {shopBraderie > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#D9743E]/15 text-[#B8541E] whitespace-nowrap">
                        🏷️ {tr('braderie', 'sale')} −{Math.round(shopBraderie * 100)}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6B5740] block">{tc(shop.description)}</span>
                  <span className="text-[10px] font-mono text-[#A08B70]">
                    {shop.items.length} {tr('articles', 'items')} · {cheapest === mostExpensive ? `${cheapest}€` : `${cheapest}€ – ${mostExpensive}€`}
                  </span>
                </div>
                <span className="text-[#A08B70]">→</span>
              </motion.button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="mt-auto action-btn py-3 text-sm font-semibold text-[#6B5740] flex items-center justify-center gap-1.5"
      >
        ← {tr('Retour', 'Back')}
      </button>
    </div>
  );
}
