/*
 * LE ROI DU CARTON - Home Page
 * Design: Carton Craft, textures carton chaudes, UI feutre, direction ludique.
 * Polices : Fredoka (titres/boutons), Outfit (corps), JetBrains Mono (stats).
 */
import { useGame } from '@/contexts/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { installerClicParDefaut } from '@/lib/sound';
import { screenIn } from '@/lib/anim';
import { tapOrigin } from '@/lib/tapOrigin';
import { setAmbience, setWeatherLayer, weatherLayerFor, type AmbienceId } from '@/lib/ambience';
import TitleScreen from '@/components/game/TitleScreen';
import CharacterSelect from '@/components/game/CharacterSelect';
import MainScreen from '@/components/game/MainScreen';
import EventScreen from '@/components/game/EventScreen';
import TravelScreen from '@/components/game/TravelScreen';
import InventoryScreen from '@/components/game/InventoryScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import CombatScreen from '@/components/game/CombatScreen';
import EventResultOverlay from '@/components/game/EventResultOverlay';
import OriginStoryOverlay from '@/components/game/OriginStoryOverlay';
import ShopScreen from '@/components/game/ShopScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import StealHeist from '@/components/game/StealHeist';
import BegMinigame from '@/components/game/BegMinigame';
import SalvageMinigame from '@/components/game/SalvageMinigame';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import WeatherOverlay from '@/components/game/WeatherOverlay';
import WardrobeScreen from '@/components/game/WardrobeScreen';
import AudioTestScreen from '@/components/game/AudioTestScreen';
import AchievementToast from '@/components/game/AchievementToast';
import Toaster from '@/components/game/Toaster';
import DaySummaryOverlay from '@/components/game/DaySummaryOverlay';
import DeathRegistryScreen from '@/components/game/DeathRegistryScreen';
import CimetiereScreen from '@/components/game/CimetiereScreen';
import CartonMatinOverlay from '@/components/game/CartonMatinOverlay';
import { noteSessionHour, rescheduleAll } from '@/lib/notifications';
import { bumpSession } from '@/components/game/MinigameIntro';
import { loadDaily } from '@/lib/daily';

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
    case 'salvage-game': return <SalvageMinigame />;
    case 'settings': return <SettingsScreen />;
    case 'wardrobe': return <WardrobeScreen />;
    case 'audio-test': return <AudioTestScreen />;
    case 'game-over': return <GameOverScreen />;
    case 'registre': return <DeathRegistryScreen />;
    case 'cimetiere': return <CimetiereScreen />;
    default: return <MainScreen />;
  }
}

export default function Home() {
  /*
   * Le filet sonore, posé une fois pour toute la session : aucun appui de
   * bouton ne peut rester muet, même sur un écran ajouté plus tard. Les sons
   * posés explicitement gagnent toujours — celui-ci ne comble que les trous.
   */
  useEffect(() => { installerClicParDefaut(); }, []);


  /*
   * L'heure de cette session est notée à l'ouverture, et tout le calendrier de
   * rappels est reprogrammé quand l'application passe en arrière-plan : les
   * rappels partent ainsi toujours du dernier moment où le joueur était là,
   * et à l'heure où il joue d'habitude.
   */
  useEffect(() => {
    noteSessionHour();
    // Un lancement de plus : sert à savoir quand une règle de mini-jeu
    // commence à s'oublier (voir MinigameIntro).
    bumpSession();
    const replanifier = () => {
      if (document.visibilityState === 'hidden') {
        rescheduleAll({ fr: !document.documentElement.lang.startsWith('en'), streak: loadDaily().streak });
      }
    };
    document.addEventListener('visibilitychange', replanifier);
    window.addEventListener('pagehide', replanifier);
    return () => {
      document.removeEventListener('visibilitychange', replanifier);
      window.removeEventListener('pagehide', replanifier);
    };
  }, []);
  const { state } = useGame();

  // Ambiance sonore continue selon l'écran : thème musical sur le titre,
  // lit sonore du lieu en jeu, silence pendant combat/mini-jeux (leurs effets
  // portent la tension) et sur l'écran de fin.
  const location = state.character?.location;
  useEffect(() => {
    const s = state.screen;
    if (s === 'title' || s === 'character-select') setAmbience('title');
    // Les mini-jeux ont désormais leur propre lit (pack son 2). L'écran de fin
    // reste silencieux : la résonance de mort s'y suffit.
    else if (s === 'combat') setAmbience('mg-bagarre');
    else if (s === 'steal-game') setAmbience('mg-casse');
    else if (s === 'beg-game') setAmbience('mg-manche');
    else if (s === 'salvage-game') setAmbience('mg-recup');
    else if (s === 'game-over') setAmbience(null);
    else if (location) setAmbience(location as AmbienceId);
    else setAmbience(null);
  }, [state.screen, location]);

  // La météo se pose PAR-DESSUS le quartier : il peut pleuvoir au parc comme
  // à la gare. Un ciel dégagé ou nuageux ne fait pas de bruit, d'où le null.
  useEffect(() => {
    setWeatherLayer(weatherLayerFor(state.weather));
  }, [state.weather]);

  useEffect(() => () => { setAmbience(null); setWeatherLayer(null); }, []);

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
          {/* L'écran s'ouvre depuis l'endroit où le doigt s'est posé : la
              transition suit le geste au lieu de le subir (voir lib/tapOrigin). */}
          <motion.div
            key={state.screen}
            initial={screenIn.initial}
            animate={screenIn.animate}
            exit={screenIn.exit}
            transition={screenIn.transition}
            className="w-full"
            style={{ transformOrigin: tapOrigin() }}
          >
            {renderScreen(state.screen)}
          </motion.div>
        </AnimatePresence>

        {/* Récit d'origine « La Chute de… », une fois au départ de la partie */}
        <OriginStoryOverlay />

        {/* La visite guidée en huit écrans n'est plus imposée au premier
            lancement : elle reste disponible depuis les Options pour qui la
            veut. Au premier lancement, les conseils contextuels prennent le
            relais (voir CoachTip) — une phrase quand elle sert, au lieu de
            huit écrans avant la première action. */}
        {state.screen === 'main' && <TutorialOverlay />}

        {/* Overlay météo : actif sur tous les écrans de jeu sauf titre et sélection */}
        {state.character && !['title', 'character-select', 'game-over', 'settings', 'shop', 'inventory', 'travel', 'steal-game', 'beg-game', 'salvage-game', 'wardrobe', 'audio-test'].includes(state.screen) && (
          <WeatherOverlay />
        )}

        {/* Le carton du matin : première ouverture d'un jour calendaire. Passe
            au-dessus de tout, y compris de l'écran-titre — c'est le rendez-vous
            quotidien, il ne dépend pas d'une partie en cours. */}
        <CartonMatinOverlay />

        {/* Notification de succès (accessoire débloqué), au-dessus de tout écran */}
        <AchievementToast />

        {/* Retours flash (toasts) des actions */}
        <Toaster />

        {state.eventResult && state.screen !== 'game-over' && <EventResultOverlay />}

        {/* Bilan de la nuit (pop-up après « Jour suivant ») */}
        {state.daySummary && state.screen === 'main' && <DaySummaryOverlay />}
      </div>
    </div>
  );
}
