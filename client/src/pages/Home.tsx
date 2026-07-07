/*
 * LE ROI DU CARTON - Home Page
 * Design: Carton Craft — textures carton chaudes, UI feutre, direction ludique.
 * Polices : Fredoka (titres/boutons), Outfit (corps), JetBrains Mono (stats).
 */
import { useGame } from '@/contexts/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import { screenIn } from '@/lib/anim';
import TitleScreen from '@/components/game/TitleScreen';
import CharacterSelect from '@/components/game/CharacterSelect';
import MainScreen from '@/components/game/MainScreen';
import EventScreen from '@/components/game/EventScreen';
import TravelScreen from '@/components/game/TravelScreen';
import InventoryScreen from '@/components/game/InventoryScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import CombatScreen from '@/components/game/CombatScreen';
import EventResultOverlay from '@/components/game/EventResultOverlay';
import ShopScreen from '@/components/game/ShopScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import StealHeist from '@/components/game/StealHeist';
import BegMinigame from '@/components/game/BegMinigame';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import WeatherOverlay from '@/components/game/WeatherOverlay';
import WardrobeScreen from '@/components/game/WardrobeScreen';
import AchievementToast from '@/components/game/AchievementToast';
import Toaster from '@/components/game/Toaster';

// Rendu de l'écran courant. Les superpositions (résultat, météo, tutoriel,
// succès) sont gérées à part pour ne pas être rejouées à chaque transition.
function renderScreen(screen: string) {
  switch (screen) {
    case 'title': return <TitleScreen />;
    case 'character-select': return <CharacterSelect />;
    case 'main': return <MainScreen />;
    case 'event': return <EventScreen />;
    case 'travel': return <TravelScreen />;
    case 'inventory': return <InventoryScreen />;
    case 'combat': return <CombatScreen />;
    case 'shop': return <ShopScreen />;
    case 'steal-game': return <StealHeist />;
    case 'beg-game': return <BegMinigame />;
    case 'settings': return <SettingsScreen />;
    case 'wardrobe': return <WardrobeScreen />;
    case 'game-over': return <GameOverScreen />;
    default: return <MainScreen />;
  }
}

export default function Home() {
  const { state } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{
        background:
          'radial-gradient(ellipse at 15% 0%, rgba(196,114,58,0.10) 0%, transparent 45%),' +
          'radial-gradient(ellipse at 85% 100%, rgba(155,91,58,0.10) 0%, transparent 45%),' +
          'linear-gradient(180deg, #FBF6F0 0%, #F3E7D8 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen relative safe-area">
        {/* Transition douce entre écrans : chaque changement d'écran fond en
            fondu + léger glissé, pour que la navigation « réponde » au clic. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial={screenIn.initial}
            animate={screenIn.animate}
            exit={screenIn.exit}
            transition={screenIn.transition}
            className="w-full"
          >
            {renderScreen(state.screen)}
          </motion.div>
        </AnimatePresence>

        {/* Tutoriel guidé (écran principal uniquement) */}
        {state.screen === 'main' && <TutorialOverlay />}

        {/* Overlay météo : actif sur tous les écrans de jeu sauf titre et sélection */}
        {state.character && !['title', 'character-select', 'game-over', 'settings', 'shop', 'inventory', 'travel', 'steal-game', 'beg-game', 'wardrobe'].includes(state.screen) && (
          <WeatherOverlay />
        )}

        {/* Notification de succès (accessoire débloqué), au-dessus de tout écran */}
        <AchievementToast />

        {/* Retours flash (toasts) des actions */}
        <Toaster />

        {state.eventResult && state.screen !== 'game-over' && <EventResultOverlay />}
      </div>
    </div>
  );
}
