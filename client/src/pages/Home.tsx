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
import WeatherOverlay from '@/components/game/WeatherOverlay';

export default function Home() {
  const { state } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center"
      style={{
        backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/IEX0yCKgQPAC1tCVyeLNRB/sandbox/5lqRDFcTLj7trFCP2zuZbn-img-5_1770979935000_na1fn_a3JhZnQtcGFwZXItYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUVYMHlDS2dRUEFDMXRDVnllTE5SQi9zYW5kYm94LzVscVJERmNUTGo3dHJGQ1AyenVaYm4taW1nLTVfMTc3MDk3OTkzNTAwMF9uYTFmbl9hM0poWm5RdGNHRndaWEl0WW1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Ml21UVq7Qq~IDHfTvmsCbJd4fSpuRdeoqO~-tQy6urpSg4E8xWXf55UhTUND7ZezZCm~pwSdX9cu~d6jsZF9ITgf~x8~XnlLRqio-9D1hh3WoVeoN~jLZmBVRlhkYygbydq-9EWVJ8mx7NflzYal68WbUWCc2PFbDiRaYj2UbXAV72cbVKXEhw9gyRhdy~Dv-lVTIRSdxjGEB-8dPlQI8~A8iGRM2-LGE5qd14bIXzsL1VuRZYf8wDS1DXNYWid2DOtJ0HYgWvGwBR7tXJMxiaLUv8LIR5tMo8E7g5fIElDYXfQ7v4d0nmi2Spn5dLTDKEa1EJhFO2T1BnhCViXXdA__')`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md mx-auto min-h-screen relative">
        {state.screen === 'title' && <TitleScreen />}
        {state.screen === 'character-select' && <CharacterSelect />}
        {state.screen === 'main' && <MainScreen />}
        {state.screen === 'event' && <EventScreen />}
        {state.screen === 'travel' && <TravelScreen />}
        {state.screen === 'inventory' && <InventoryScreen />}
        {state.screen === 'combat' && <CombatScreen />}
        {state.screen === 'shop' && <ShopScreen />}
        {state.screen === 'game-over' && <GameOverScreen />}

        {/* Overlay météo : actif sur tous les écrans de jeu sauf titre et sélection */}
        {state.character && !['title', 'character-select', 'game-over'].includes(state.screen) && (
          <WeatherOverlay />
        )}

        {state.eventResult && state.screen !== 'game-over' && <EventResultOverlay />}
      </div>
    </div>
  );
}
