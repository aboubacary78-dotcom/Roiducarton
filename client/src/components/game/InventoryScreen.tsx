import { useGame, getSellPrice, hasTrait, STAT_META, craftableRecipes, recipeCost, materialCount, canCraft, type Stats } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useLang, tr, tc } from '@/lib/lang';
import LocationBackdrop from './LocationBackdrop';
import SafeImg from './SafeImg';
import { playCraft, playMoneyIn, playGaugeFilled } from '@/lib/sound';

const TYPE_LABELS: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  food: { label: 'Nourriture', labelEn: 'Food', color: '#4A9B5F', bg: '#4A9B5F15' },
  weapon: { label: 'Arme', labelEn: 'Weapon', color: '#D94F4F', bg: '#D94F4F15' },
  armor: { label: 'Armure', labelEn: 'Armor', color: '#4A8FBF', bg: '#4A8FBF15' },
  tool: { label: 'Outil', labelEn: 'Tool', color: '#D4874D', bg: '#D4874D15' },
  junk: { label: 'Bazar', labelEn: 'Junk', color: '#B8860B', bg: '#B8860B15' },
  special: { label: 'Spécial', labelEn: 'Special', color: '#7B68EE', bg: '#7B68EE15' },
};


export default function InventoryScreen() {
  const { state, dispatch } = useGame();
  const en = useLang() === 'en';
  const char = state.character!;
  const recipes = craftableRecipes(char);
  const materials = materialCount(char);
  const isBricoleur = hasTrait(char, 'bricoleur');

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
            <h2 className="text-xl text-[#2A1F1A]">{tr('Inventaire', 'Inventory')}</h2>
            <span className="text-xs text-[#A08B70] font-mono font-medium">{char.inventory.length}/20</span>
          </div>
        </div>
      </motion.div>

      {char.inventory.length === 0 ? (
        <div className="craft-card p-8 text-center">
          <p className="text-3xl mb-2">🕳️</p>
          <p className="text-sm text-[#8B6B4A]">{tr('Votre sac est vide. Comme votre estomac.', 'Your bag is empty. Like your stomach.')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {char.inventory.map((item, i) => {
            const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.junk;
            // Ventre sur Pattes : le bric-à-brac devient « mangeable ».
            const edibleJunk = item.type === 'junk' && !item.effect && hasTrait(char, 'ventre-pattes');
            const hasEffect = (item.effect && Object.keys(item.effect).length > 0) || edibleJunk;
            return (
              <motion.div
                key={`${item.id}-${i}`}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="craft-card p-3 flex items-center gap-3"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: typeInfo.bg, border: `1px solid ${typeInfo.color}20` }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#2A1F1A]">{tc(item.name)}</span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                    >
                      {tr(typeInfo.label, typeInfo.labelEn)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#6B5740] mt-0.5 font-mono">
                    {item.attackBonus && <span className="text-[#B84A3A]">🥊 +{item.attackBonus} att.</span>}
                    {item.defenseBonus && <span className="text-[#4A8FBF]">🛡️ +{item.defenseBonus} déf.</span>}
                    {item.effect && Object.entries(item.effect).map(([k, v]) => {
                      const meta = STAT_META[k as keyof Stats];
                      return (
                        <span key={k} className={v! > 0 ? 'text-[#3d8b4f]' : 'text-[#B84A3A]'}>
                          {meta ? meta.emoji : ''} {meta ? meta.label : k} {v! > 0 ? '+' : ''}{v}
                        </span>
                      );
                    })}
                  </div>
                  {/* Un objet passif n'a pas de bouton : cette ligne est le seul
                      endroit où le joueur apprend ce qu'il lui apporte. */}
                  {item.passive && (
                    <p className="text-[10px] text-[#3d8b4f] leading-snug mt-1">
                      ✦ {en ? (item.passiveEn ?? item.passive) : item.passive}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col gap-1.5">
                  {hasEffect && (
                    <button
                      onClick={() => { playGaugeFilled(); dispatch({ type: 'USE_ITEM', itemId: item.id }); }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-white rounded-lg"
                      style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)', boxShadow: '0 2px 6px rgba(74, 155, 95, 0.25)' }}
                    >
                      {edibleJunk ? tr('Manger ?!', 'Eat?!') : tr('Utiliser', 'Use')}
                    </button>
                  )}
                  <button
                    onClick={() => { playMoneyIn(getSellPrice(item)); dispatch({ type: 'SELL_ITEM', itemId: item.id }); }}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-[#8B6B4A]"
                    style={{ background: '#F5EDE4', border: '1px solid #E8D5C0' }}
                  >
                    {tr('Vendre', 'Sell')} {getSellPrice(item)}€
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Établi : transformer le bazar en objets utiles */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="craft-card p-3.5 flex flex-col gap-2.5"
      >
        {/* Bandeau de l'établi (atelier.webp) ; masqué tant que l'image n'existe pas */}
        <SafeImg src="/assets/atelier.webp" className="w-full h-16 object-cover rounded-lg -mt-0.5" />
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#2A1F1A] flex items-center gap-1.5">
            🔨 {tr('Établi', 'Workbench')}
          </h3>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium"
            style={{ backgroundColor: '#B8860B15', color: '#B8860B' }}
          >
            🧩 {materials} {tr('bazar', 'junk')}
          </span>
        </div>
        <p className="text-[11px] text-[#8B6B4A] -mt-1.5 leading-snug">
          {isBricoleur
            ? tr('Vos mains d\'or : un objet de moins par recette, et ce que vous fabriquez tient deux fois plus longtemps.',
                 'Your golden hands: one fewer item per recipe, and what you build lasts twice as long.')
            : tr('L\'échoppe vend de quoi remplir vos jauges. L\'établi fabrique ce qu\'elle ne vend pas : des nuits qui ne coûtent rien.',
                 'The shop sells things to refill your gauges. The workbench builds what it doesn\'t sell: nights that cost you nothing.')}
        </p>

        {materials === 0 ? (
          <p className="text-xs text-[#A08B70] italic py-1">
            {tr('Ramassez du bazar (objets sans usage) pour bricoler.', 'Pick up junk (useless items) to start tinkering.')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recipes.map((recipe) => {
              const cost = recipeCost(recipe, char);
              const ok = canCraft(recipe, char);
              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-2.5 rounded-lg p-2"
                  style={{ background: '#F5EDE4', border: '1px solid #E8D5C0', opacity: ok ? 1 : 0.55 }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: '#fff', border: '1px solid #E8D5C0' }}>
                    {recipe.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#2A1F1A]">{tc(recipe.name)}</span>
                      {recipe.advanced && (
                        <span className="text-[8px] px-1 py-0.5 rounded-full font-bold" style={{ background: '#7B68EE20', color: '#6A57DD' }}>
                          🔨 {tr('Bricoleur', 'Tinkerer')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#8B6B4A] leading-snug mt-0.5">{en ? recipe.hintEn : recipe.hint}</p>
                  </div>
                  <button
                    onClick={() => { if (!ok) return; playCraft(); dispatch({ type: 'CRAFT', recipeId: recipe.id }); }}
                    disabled={!ok}
                    className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg shrink-0 disabled:cursor-not-allowed"
                    style={ok
                      ? { background: 'linear-gradient(135deg, #D4874D, #B86B34)', color: '#fff', boxShadow: '0 2px 6px rgba(184,107,52,0.25)' }
                      : { background: '#EDE2D4', color: '#B0A088' }}
                  >
                    {tr('Bricoler', 'Craft')} · 🧩{cost}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="mt-auto action-btn py-3 text-sm font-semibold text-[#6B5740] flex items-center justify-center gap-1.5"
      >
        ← {tr('Retour', 'Back')}
      </button>
    </div>
  );
}
