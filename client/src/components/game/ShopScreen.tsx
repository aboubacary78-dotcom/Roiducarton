import { useState, useEffect } from 'react';
import { useGame, getShopsForLocation, getDiscountedPrice, getDiscountLabel, getNextDiscountTier, getShopEvent, shopClosure, absurdReopen, STAT_META } from '@/contexts/GameContext';
import { showRewarded } from '@/lib/ads';
import type { Shop, ShopItem, ShopEvent, Stats } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { playCoin } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import SceneIllustration, { sceneForLocation } from './SceneIllustration';
import { pushToast } from '@/lib/toast';

const CATEGORY_COLORS: Record<string, { bg: string; color: string; label: string; labelEn: string }> = {
  food: { bg: '#4A9B5F15', color: '#4A9B5F', label: 'Nourriture', labelEn: 'Food' },
  drink: { bg: '#4A8FBF15', color: '#4A8FBF', label: 'Boisson', labelEn: 'Drink' },
  medicine: { bg: '#D94F4F15', color: '#D94F4F', label: 'Soin', labelEn: 'Medicine' },
  weapon: { bg: '#8B451315', color: '#8B4513', label: 'Arme', labelEn: 'Weapon' },
  tool: { bg: '#D4874D15', color: '#D4874D', label: 'Outil', labelEn: 'Tool' },
  clothing: { bg: '#7B68EE15', color: '#7B68EE', label: 'Vêtement', labelEn: 'Clothing' },
  special: { bg: '#B8860B15', color: '#B8860B', label: 'Service', labelEn: 'Service' },
};


export default function ShopScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character!;
  const shops = getShopsForLocation(char.location);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [buyAnimation, setBuyAnimation] = useState<string | null>(null);
  const [shopEvent, setShopEvent] = useState<ShopEvent | null>(null);
  const [reopeningId, setReopeningId] = useState<string | null>(null);

  // « Coup de main » via pub récompensée : la boutique rouvre, avec une
  // résolution aussi absurde que la panne.
  async function reopenWithAd(shop: Shop) {
    if (reopeningId) return;
    setReopeningId(shop.id);
    const rewarded = await showRewarded();
    if (rewarded) {
      const reason = absurdReopen(shop.id);
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
  }, [selectedShop]);

  const handleBuy = (item: ShopItem) => {
    const actualPrice = getDiscountedPrice(item.price, char.respect);
    if (char.money < actualPrice) return;
    if (item.giveItem && char.inventory.length >= 20) return;

    setBuyAnimation(item.id);
    setTimeout(() => setBuyAnimation(null), 600);
    playCoin();
    dispatch({ type: 'BUY_ITEM', shopItem: item, actualPrice });
    pushToast(
      `${tr('Acheté', 'Bought')} : ${tc(item.name)}${actualPrice > 0 ? ` (−${actualPrice}€)` : ''}`,
      { emoji: '🛍️', tone: 'good' },
    );
  };

  const handleShopEvent = () => {
    if (shopEvent) {
      dispatch({ type: 'TRIGGER_SHOP_EVENT', event: shopEvent });
      setShopEvent(null);
    }
  };

  // Shop detail view
  if (selectedShop) {
    return (
      <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
        {/* Shop Header */}
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="craft-card p-3.5"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{selectedShop.emoji}</span>
              <div>
                <h2 className="text-lg text-[#2A1F1A]">{tc(selectedShop.name)}</h2>
                <p className="text-xs text-[#8B6B4A]">{tc(selectedShop.description)}</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-sm font-semibold text-[#B8860B]">{char.money}€</div>
              {discountLabel && (
                <div className="text-[10px] text-[#4A9B5F] font-medium">{discountLabel}</div>
              )}
            </div>
          </div>
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

        {/* Shop Event */}
        <AnimatePresence>
          {shopEvent && (
            <motion.button
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onClick={handleShopEvent}
              className="w-full craft-card p-3 text-left border-[#D4874D]/30 bg-[#D4874D]/5"
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

        {/* Discount Banner */}
        {discountLabel && (
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#4A9B5F]/6 border border-[#4A9B5F]/15"
          >
            <span className="text-sm">⭐</span>
            <p className="text-xs text-[#4A9B5F] font-medium">
              Réduction fidélité : {discountLabel}
            </p>
          </motion.div>
        )}

        {/* Items */}
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {selectedShop.items.map((item, i) => {
            const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.special;
            const actualPrice = getDiscountedPrice(item.price, char.respect);
            const hasDiscount = actualPrice < item.price;
            const canAfford = char.money >= actualPrice;
            const inventoryFull = item.giveItem && char.inventory.length >= 20;
            const disabled = !canAfford || !!inventoryFull;
            const isBuying = buyAnimation === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1, scale: isBuying ? [1, 1.02, 1] : 1 }}
                transition={{ delay: i * 0.04 }}
                className={`craft-card p-3 ${disabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: cat.bg, border: `1px solid ${cat.color}20` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#2A1F1A]">{tc(item.name)}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        {tr(cat.label, cat.labelEn)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B5740] mt-0.5">{tc(item.description)}</p>
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
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={disabled}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      disabled
                        ? 'bg-[#E8D5C0] text-[#A08B70] cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {hasDiscount ? (
                      <span className="flex flex-col items-center">
                        <span className="text-[9px] line-through opacity-60">{item.price}€</span>
                        <span>{actualPrice}€</span>
                      </span>
                    ) : (
                      <span>{actualPrice === 0 ? tr('Gratuit', 'Free') : `${actualPrice}€`}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedShop(null)}
          className="py-2 text-sm text-[#A08B70] font-medium text-center hover:text-[#6B5740] transition-colors"
        >
          ← {tr('Autres boutiques', 'Other shops')}
        </button>
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
          <SceneIllustration theme={sceneForLocation(char.location)} className="w-full h-full" rounded={false} align="bottom" sway />
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

      {shops.length === 0 ? (
        <div className="craft-card p-8 text-center">
          <p className="text-3xl mb-2">🏜️</p>
          <p className="text-sm text-[#8B6B4A]">Aucune boutique ici. Essayez un autre quartier.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {shops.map((shop, i) => {
            const prices = shop.items.map(it => getDiscountedPrice(it.price, char.respect));
            const cheapest = Math.min(...prices);
            const mostExpensive = Math.max(...prices);
            const canAffordSomething = prices.some(p => char.money >= p);
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
                        {tr(`Fermé (${daysLeft} j)`, `Closed (${daysLeft}d)`)} — {tr(closed.reason, closed.reasonEn)}
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
                  <span className="text-sm font-semibold text-[#2A1F1A] block">{tc(shop.name)}</span>
                  <span className="text-xs text-[#6B5740] block">{tc(shop.description)}</span>
                  <span className="text-[10px] font-mono text-[#A08B70]">
                    {shop.items.length} articles · {cheapest === mostExpensive ? `${cheapest}€` : `${cheapest}€ – ${mostExpensive}€`}
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
        className="mt-auto py-2 text-sm text-[#A08B70] font-medium text-center hover:text-[#6B5740] transition-colors"
      >
        ← Retour
      </button>
    </div>
  );
}
