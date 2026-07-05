/*
 * LE ROI DU CARTON - Home Page
 * Design: Carton Craft - warm cardboard textures, marker-drawn UI, tape strips
 * Fonts: Caveat (titles), Patrick Hand (body), Courier Prime (stats)
 */
import { useGame } from '@/contexts/GameContext';
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
import StealMinigame from '@/components/game/StealMinigame';
import BegMinigame from '@/components/game/BegMinigame';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import WeatherOverlay from '@/components/game/WeatherOverlay';
import WardrobeScreen from '@/components/game/WardrobeScreen';
import AchievementToast from '@/components/game/AchievementToast';

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
        {state.screen === 'title' && <TitleScreen />}
        {state.screen === 'character-select' && <CharacterSelect />}
        {state.screen === 'main' && <MainScreen />}
        {state.screen === 'main' && <TutorialOverlay />}
        {state.screen === 'event' && <EventScreen />}
        {state.screen === 'travel' && <TravelScreen />}
        {state.screen === 'inventory' && <InventoryScreen />}
        {state.screen === 'combat' && <CombatScreen />}
        {state.screen === 'shop' && <ShopScreen />}
        {state.screen === 'steal-game' && <StealMinigame />}
        {state.screen === 'beg-game' && <BegMinigame />}
        {state.screen === 'settings' && <SettingsScreen />}
        {state.screen === 'wardrobe' && <WardrobeScreen />}
        {state.screen === 'game-over' && <GameOverScreen />}

        {/* Overlay météo : actif sur tous les écrans de jeu sauf titre et sélection */}
        {state.character && !['title', 'character-select', 'game-over', 'settings', 'shop', 'inventory', 'travel', 'steal-game', 'beg-game', 'wardrobe'].includes(state.screen) && (
          <WeatherOverlay />
        )}

        {/* Notification de succès (accessoire débloqué), au-dessus de tout écran */}
        <AchievementToast />

        {state.eventResult && state.screen !== 'game-over' && <EventResultOverlay />}
      </div>
    </div>
  );
}
