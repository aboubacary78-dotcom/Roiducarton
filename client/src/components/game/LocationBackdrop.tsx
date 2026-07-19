import SceneIllustration, { sceneForLocation } from './SceneIllustration';
import SafeImg from './SafeImg';

/*
 * Toile de fond d'un quartier : le diorama photo (scene-<quartier>.webp) s'il
 * existe, par-dessus la scène dessinée qui reste le repli permanent.
 */
export default function LocationBackdrop({ location }: { location: string }) {
  return (
    <div className="w-full h-full relative">
      <SceneIllustration theme={sceneForLocation(location)} className="w-full h-full" rounded={false} align="bottom" sway />
      <SafeImg src={`/assets/scene-${location}.webp`} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}
