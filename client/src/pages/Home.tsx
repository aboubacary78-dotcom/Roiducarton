/*
 * LE ROI DU CARTON - Home Page
 * Design: Carton Craft, textures carton chaudes, UI feutre, direction ludique.
 * Polices : Fredoka (titres/boutons), Outfit (corps), JetBrains Mono (stats).
 */
import { useGame } from '@/contexts/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, lazy, Suspense } from 'react';
import { installerClicParDefaut } from '@/lib/sound';
import { hideBanner, showBanner } from '@/lib/ads';
import { screenIn } from '@/lib/anim';
import { tapOrigin } from '@/lib/tapOrigin';
import { setAmbience, setWeatherLayer, weatherLayerFor, type AmbienceId } from '@/lib/ambience';
import TitleScreen from '@/components/game/TitleScreen';
import OffreDeLaRue from '@/components/game/OffreDeLaRue';
import CharacterSelect from '@/components/game/CharacterSelect';
import MainScreen from '@/components/game/MainScreen';
import EventScreen from '@/components/game/EventScreen';
import TravelScreen from '@/components/game/TravelScreen';
import InventoryScreen from '@/components/game/InventoryScreen';
import EventResultOverlay from '@/components/game/EventResultOverlay';
import OriginStoryOverlay from '@/components/game/OriginStoryOverlay';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import WeatherOverlay from '@/components/game/WeatherOverlay';
import AchievementToast from '@/components/game/AchievementToast';
import Toaster from '@/components/game/Toaster';
import DaySummaryOverlay from '@/components/game/DaySummaryOverlay';
import CartonMatinOverlay from '@/components/game/CartonMatinOverlay';
import { noteSessionHour, rescheduleAll } from '@/lib/notifications';
import { bumpSession } from '@/components/game/MinigameIntro';
import { loadDaily } from '@/lib/daily';

/* ═══════════════════════════════════════════════════════════════════════════
 * CE QU'ON NE VOIT PAS AU LANCEMENT NE DOIT PAS RETARDER LE LANCEMENT.
 *
 * Les mini-jeux, la boutique, l'écran de mort, le registre, le cimetière, la
 * penderie et les options représentent le plus gros morceau de code de
 * l'application — et aucun d'eux n'est le premier écran. Ils partaient
 * pourtant dans le même paquet que l'écran-titre : le joueur téléchargeait la
 * bagarre, le casse et la fin de partie avant même d'avoir choisi son
 * personnage.
 *
 * Ils sont donc découpés en morceaux séparés, puis RÉCHAUFFÉS dès que le
 * navigateur souffle (voir `prechargerEcrans`). Le gain est pris au démarrage,
 * et l'attente qu'un découpage crée d'ordinaire n'arrive jamais : le morceau
 * est déjà là quand on appuie sur « Bagarre ».
 * ═══════════════════════════════════════════════════════════════════════════ */
const charge = {
  combat: () => import('@/components/game/CombatScreen'),
  vol: () => import('@/components/game/StealHeist'),
  manche: () => import('@/components/game/BegMinigame'),
  recup: () => import('@/components/game/SalvageMinigame'),
  boutique: () => import('@/components/game/ShopScreen'),
  fin: () => import('@/components/game/GameOverScreen'),
  options: () => import('@/components/game/SettingsScreen'),
  penderie: () => import('@/components/game/WardrobeScreen'),
  registre: () => import('@/components/game/DeathRegistryScreen'),
  cimetiere: () => import('@/components/game/CimetiereScreen'),
  marcheNoir: () => import('@/components/game/MarcheNoirScreen'),
};

const CombatScreen = lazy(charge.combat);
const StealHeist = lazy(charge.vol);
const BegMinigame = lazy(charge.manche);
const SalvageMinigame = lazy(charge.recup);
const ShopScreen = lazy(charge.boutique);
const GameOverScreen = lazy(charge.fin);
const SettingsScreen = lazy(charge.options);
const WardrobeScreen = lazy(charge.penderie);
const DeathRegistryScreen = lazy(charge.registre);
const CimetiereScreen = lazy(charge.cimetiere);
const MarcheNoirScreen = lazy(charge.marcheNoir);

/**
 * Va chercher tous les écrans découpés pendant que le joueur lit l'écran-titre.
 * `requestIdleCallback` attend un vrai temps mort : le réchauffage ne dispute
 * jamais la bande passante à l'image du quartier, qui, elle, est à l'écran.
 */
function prechargerEcrans(): void {
  const suite = Object.values(charge);
  let i = 0;
  const suivant = () => {
    if (i >= suite.length) return;
    suite[i++]().catch(() => { /* le morceau se rechargera à l'usage */ });
    planifier();
  };
  const planifier = () => {
    const ric = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (ric) ric(suivant); else setTimeout(suivant, 300);
  };
  planifier();
}

/*
 * Le temps d'aller chercher un morceau, on garde le fond de carton plutôt
 * qu'une page blanche. En pratique le réchauffage fait que ce voile n'est
 * presque jamais vu — il n'existe que pour le cas où l'on appuie plus vite que
 * le réseau.
 */
const VOILE = <div className="min-h-screen bg-texture" aria-busy="true" />;

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
    case 'game-over': return <GameOverScreen />;
    case 'registre': return <DeathRegistryScreen />;
    case 'cimetiere': return <CimetiereScreen />;
    case 'marche-noir': return <MarcheNoirScreen />;
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

  // Les écrans découpés se réchauffent pendant qu'on lit le titre : le
  // découpage allège le démarrage sans jamais faire attendre à l'usage.
  useEffect(() => { prechargerEcrans(); }, []);


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
    // Les mini-jeux ont leur propre lit (pack son 2).
    else if (s === 'combat') setAmbience('mg-bagarre');
    else if (s === 'steal-game') setAmbience('mg-casse');
    else if (s === 'beg-game') setAmbience('mg-manche');
    else if (s === 'salvage-game') setAmbience('mg-recup');
    // L'écran de fin n'était pas silencieux par choix esthétique mais faute de
    // musique : elle arrive maintenant, en fondu long derrière la résonance.
    else if (s === 'game-over') setAmbience('mort');
    else if (location) setAmbience(location as AmbienceId);
    else setAmbience(null);
  }, [state.screen, location]);

  /*
   * LA BANNIÈRE, ET SEULEMENT LÀ OÙ ELLE NE GÊNE RIEN.
   *
   * Elle ne s'affiche que sur les écrans de LECTURE : le Registre, le
   * Cimetière, la boutique, l'écran de fin. Ce sont les seuls endroits où le
   * joueur ne fait rien d'autre que lire, et où trente pixels en bas ne
   * coûtent aucun geste.
   *
   * Jamais en jeu, jamais sur un mini-jeu : le pouce y travaille, et une
   * bannière sous le pouce ne produit pas de la frustration mais des clics
   * accidentels — que les régies sanctionnent, et qui font désinstaller.
   */
  useEffect(() => {
    /*
     * Le marché noir n'est PAS dans cette liste, et c'est délibéré : poser une
     * bannière publicitaire sur l'écran qui vend « plus de publicité » serait
     * la meilleure démonstration qu'on ne croit pas à ce qu'on vend.
     */
    const ECRANS_DE_LECTURE = ['registre', 'cimetiere', 'shop', 'game-over'];
    if (ECRANS_DE_LECTURE.includes(state.screen)) showBanner();
    else hideBanner();
  }, [state.screen]);

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
            <Suspense fallback={VOILE}>{renderScreen(state.screen)}</Suspense>
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
        {state.character && !['title', 'character-select', 'game-over', 'settings', 'shop', 'inventory', 'travel', 'steal-game', 'beg-game', 'salvage-game', 'wardrobe'].includes(state.screen) && (
          <WeatherOverlay />
        )}

        {/* Le carton du matin : première ouverture d'un jour calendaire. Passe
            au-dessus de tout, y compris de l'écran-titre — c'est le rendez-vous
            quotidien, il ne dépend pas d'une partie en cours. */}
        <CartonMatinOverlay />

        {/*
          CE QU'ON PROPOSE APRÈS UNE PUBLICITÉ.

          Posé ici et pas dans un écran : l'interstitiel part de l'écran de
          fin, mais la trêve qu'il ouvre dure dix minutes et se termine
          n'importe où. Accroché à un écran, le cadeau se serait annoncé et
          n'aurait jamais eu de fin.
        */}
        <OffreDeLaRue />

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
