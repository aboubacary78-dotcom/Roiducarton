import { useGame, LOCATIONS } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import StatBars from './StatBars';
import CardboardAvatar from './CardboardAvatar';
import { WEATHER_TYPES, getNextWeather } from '@/contexts/GameContext';

interface Enemy {
  name: string;
  emoji: string;
  health: number;
  attack: number;
  description: string;
  image?: string;
  loot?: { money?: number; respect?: number };
}

function getLocationEnemies(location: string): Enemy[] {
  const allEnemies: Record<string, Enemy[]> = {
    'parc': [
      { name: 'Pigeon Alpha', emoji: '🐦', health: 15, attack: 6, description: 'Le chef du gang de pigeons.', loot: { money: 1, respect: 1 } },
      { name: 'Mouette Furibonde', emoji: '🦅', health: 20, attack: 8, description: 'Elle veut votre sandwich.', loot: { respect: 2 } },
      { name: 'Chat de Gouttière', emoji: '🐱', health: 18, attack: 9, description: 'Petit mais vicieux.', loot: { money: 1 } },
    ],
    'centre-ville': [
      { name: 'Voyou du Coin', emoji: '🧔', health: 55, attack: 18, description: 'Un type louche qui veut votre spot.', loot: { money: 8, respect: 5 } },
      { name: 'Agent de Sécurité', emoji: '👮', health: 45, attack: 14, description: 'Il fait du zèle.', loot: { respect: 4 } },
      { name: 'Ivrogne Agressif', emoji: '🍺', health: 35, attack: 20, description: 'Il titube mais frappe fort.', loot: { money: 3 } },
    ],
    'zone-industrielle': [
      { name: 'Rat Géant', emoji: '🐀', health: 25, attack: 10, description: 'Un rat de la taille d\'un chihuahua.', loot: { money: 2, respect: 1 } },
      { name: 'Chien Errant', emoji: '🐕', health: 40, attack: 15, description: 'Un molosse sans collier.', loot: { money: 3, respect: 3 } },
      { name: 'Raton Laveur', emoji: '🦝', health: 30, attack: 12, description: 'Il fouille VOTRE poubelle.', loot: { money: 3, respect: 2 } },
      { name: 'Squatteur Territorial', emoji: '😠', health: 50, attack: 16, description: 'Ce hangar est à lui.', loot: { money: 5, respect: 4 } },
    ],
    'gare': [
      { name: 'Voyou du Coin', emoji: '🧔', health: 55, attack: 18, description: 'Un type louche.', loot: { money: 8, respect: 5 } },
      { name: 'Rat Géant', emoji: '🐀', health: 25, attack: 10, description: 'Les rats de la gare sont agressifs.', loot: { money: 2, respect: 1 } },
      { name: 'Pickpocket', emoji: '🤏', health: 20, attack: 8, description: 'Il veut vos poches.', loot: { money: 6, respect: 2 } },
    ],
    'marche': [
      { name: 'Chat de Gouttière', emoji: '🐱', health: 18, attack: 9, description: 'Il garde le poisson.', loot: { money: 1 } },
      { name: 'Mouette Furibonde', emoji: '🦅', health: 20, attack: 8, description: 'Attirée par l\'odeur du poisson.', loot: { respect: 2 } },
      { name: 'Concurrent Agressif', emoji: '💢', health: 35, attack: 12, description: 'Un autre sans-abri qui veut votre coin.', loot: { money: 4, respect: 3 } },
    ],
  };
  return allEnemies[location] || allEnemies['parc'];
}

const AMBIENT_TEXTS: Record<string, string[]> = {
  'parc': [
    'Les pigeons vous observent avec un intérêt suspect.',
    'Un écureuil vous nargue depuis un arbre.',
    'Le vent souffle doucement à travers les feuilles.',
    'Un jogger passe devant vous sans vous voir.',
  ],
  'centre-ville': [
    'L\'odeur des croissants du boulanger vous torture.',
    'Un homme en costume parle fort au téléphone.',
    'Les néons des magasins clignotent dans la nuit.',
    'Les passants accélèrent en vous voyant.',
  ],
  'zone-industrielle': [
    'Des bruits métalliques résonnent dans le silence.',
    'Un chat errant vous fixe depuis un conteneur.',
    'L\'odeur de rouille et d\'huile flotte dans l\'air.',
    'Des rats courent entre les palettes.',
  ],
  'gare': [
    'Les annonces de trains résonnent dans le hall.',
    'Des voyageurs pressés vous bousculent.',
    'L\'odeur de café du kiosque est enivrante.',
    'Un musicien joue de l\'accordéon au loin.',
  ],
  'marche': [
    'Les étals colorés débordent de fruits.',
    'Un poissonnier crie ses prix.',
    'L\'odeur de poulet rôti vous fait saliver.',
    'Les commerçants rangent. Bientôt les restes.',
  ],
};

function getAmbientText(location: string, day: number): string {
  const texts = AMBIENT_TEXTS[location] || AMBIENT_TEXTS['parc'];
  return texts[day % texts.length];
}

export default function MainScreen() {
  const { state, dispatch } = useGame();
  const char = state.character!;
  const loc = LOCATIONS[char.location];
  const actionsLeft = state.maxDayActions - state.dayActions;
  const weather = WEATHER_TYPES[state.weather];
  const nextWeatherType = getNextWeather(state.weather);
  const nextWeather = WEATHER_TYPES[nextWeatherType];

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      {/* Top Bar */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-3"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-[#E8D5C0]">
              <CardboardAvatar seed={char.seed} size={40} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2A1F1A]">{char.name}</h2>
              <p className="text-xs text-[#8B6B4A]">
                {loc.emoji} {loc.name} · Jour {char.day}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right font-mono flex flex-col items-end gap-0.5">
              <div className="text-sm font-semibold text-[#B8860B]">{char.money}€</div>
              <div className="text-[10px] text-[#7B68EE] font-medium">⭐ {char.respect}</div>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#8B6B4A] hover:bg-[#F5EDE4] transition-colors"
              aria-label="Options"
            >
              ⚙️
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="craft-card p-3"
      >
        <StatBars stats={char.stats} />
      </motion.div>

      {/* Météo */}
      <motion.div
        key={state.weather}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="craft-card p-2.5 flex items-center gap-2.5"
        style={{
          background: state.weather === 'storm' ? 'linear-gradient(135deg, #1a1f3a, #2a2f4a)'
            : state.weather === 'snow' ? 'linear-gradient(135deg, #e8eff8, #d8e8f5)'
            : state.weather === 'heatwave' ? 'linear-gradient(135deg, #3a1a0a, #4a2a0a)'
            : undefined,
        }}
      >
        <span className="text-2xl">{weather.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{
              color: state.weather === 'storm' ? '#a0b0e0'
                : state.weather === 'snow' ? '#3060a0'
                : state.weather === 'heatwave' ? '#ff8040'
                : '#2A1F1A'
            }}>
              {weather.label}
            </span>
            {/* Pénalités météo */}
            {Object.entries(weather.dailyPenalty).filter(([, v]) => v !== 0).map(([key, val]) => (
              <span key={key} className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-[#D94F4F]/10 text-[#D94F4F]">
                {key === 'health' ? '❤️' : key === 'mental' ? '🧠' : key === 'hunger' ? '🍖' : key === 'thirst' ? '💧' : key === 'sleep' ? '😴' : '👑'} {val}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#8B6B4A]">{weather.description}</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#A08B70]">demain</div>
          <div className="text-base">{nextWeather.emoji}</div>
        </div>
      </motion.div>

      {/* Ambient */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-[#A08B70] italic text-center px-4"
      >
        "{getAmbientText(char.location, char.day)}"
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col gap-2 flex-1"
      >
        {/* Actions counter */}
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: state.maxDayActions }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < actionsLeft
                  ? 'bg-[#C4723A] shadow-[0_0_4px_rgba(196,114,58,0.4)]'
                  : 'bg-[#E8D5C0]'
              }`}
            />
          ))}
          <span className="text-[10px] text-[#A08B70] font-mono ml-1.5">
            {actionsLeft} action{actionsLeft > 1 ? 's' : ''}
          </span>
        </div>

        {/* Main actions grid */}
        <div className="grid grid-cols-2 gap-2">
          <ActionTile emoji="🔍" title="Explorer" desc="Tenter une rencontre" accent="#4A8FBF" disabled={actionsLeft <= 0} onClick={() => dispatch({ type: 'EXPLORE' })} />
          <ActionTile emoji="🙏" title="Mendier" desc="Récolter des pièces" accent="#B8860B" disabled={actionsLeft <= 0} onClick={() => dispatch({ type: 'BEG' })} />
          <ActionTile emoji="😴" title="Dormir" desc="Récupérer du sommeil" accent="#7B68EE" disabled={actionsLeft <= 0} onClick={() => dispatch({ type: 'REST' })} />
          <ActionTile
            emoji="🥊" title="Bagarre" desc="Provoquer un combat" accent="#D94F4F" disabled={actionsLeft <= 0} danger
            onClick={() => {
              const enemies = getLocationEnemies(char.location);
              if (enemies.length > 0) {
                const enemy = enemies[Math.floor(Math.random() * enemies.length)];
                dispatch({ type: 'START_COMBAT', enemy });
              }
            }}
          />
        </div>

        {/* Action risquée : Voler */}
        <motion.button
          whileHover={actionsLeft <= 0 ? {} : { scale: 1.01 }}
          whileTap={actionsLeft <= 0 ? {} : { scale: 0.98 }}
          onClick={actionsLeft <= 0 ? undefined : () => dispatch({ type: 'STEAL' })}
          disabled={actionsLeft <= 0}
          className={`action-btn p-2.5 flex items-center justify-center gap-2 border-[#D94F4F]/30 ${
            actionsLeft <= 0 ? 'opacity-35 pointer-events-none' : ''
          }`}
        >
          <span className="text-lg">🥷</span>
          <span className="text-xs font-medium text-[#3D3020]">Voler</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#D94F4F]/10 text-[#D94F4F] font-mono">risqué</span>
        </motion.button>

        {/* Secondary actions */}
        <div className="flex gap-2">
          <ActionTile emoji="🛒" title="Achats" disabled={false} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'shop' })} small />
          <ActionTile emoji="🗺️" title="Voyager" disabled={false} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'travel' })} small />
          <ActionTile emoji="🎒" title={`Sac (${char.inventory.length})`} disabled={false} onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'inventory' })} small />
        </div>
      </motion.div>

      {/* Next Day */}
      <motion.button
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => dispatch({ type: 'NEXT_DAY' })}
        className="btn-primary w-full py-3.5 text-sm"
      >
        Jour Suivant
      </motion.button>
    </div>
  );
}

function ActionTile({ emoji, title, desc, accent, disabled, onClick, danger, small }: {
  emoji: string; title: string; desc?: string; accent?: string; disabled: boolean; onClick: () => void; danger?: boolean; small?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`action-btn ${small ? 'p-2.5 flex-1' : 'p-3'} flex flex-col items-center justify-center gap-1 ${
        disabled ? 'opacity-35 pointer-events-none' : ''
      } ${danger && !disabled ? 'border-[#D94F4F]/30' : ''}`}
    >
      {accent && !small ? (
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-0.5"
          style={{ background: `${accent}1A` }}
        >
          {emoji}
        </span>
      ) : (
        <span className={small ? 'text-lg' : 'text-xl'}>{emoji}</span>
      )}
      <span className={`${small ? 'text-[10px]' : 'text-sm'} font-semibold text-[#3D3020] text-center leading-tight`}>
        {title}
      </span>
      {desc && !small && (
        <span className="text-[10px] text-[#A08B70] text-center leading-tight">{desc}</span>
      )}
    </motion.button>
  );
}
