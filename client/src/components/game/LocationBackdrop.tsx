import { useState } from 'react';
import { motion } from 'framer-motion';
import SceneIllustration, { sceneForLocation } from './SceneIllustration';

/*
 * Toile de fond d'un quartier : le diorama photo (scene-<quartier>.webp) s'il
 * existe, par-dessus la scène dessinée qui reste le repli permanent.
 * Le diorama « respire » (lent zoom Ken Burns) ; sur l'écran principal, le
 * parent ajoute en plus le travelling du jour, le voile de lumière, les
 * étoiles et la course du soleil : l'image vit exactement comme la scène
 * dessinée qu'elle remplace.
 */
export default function LocationBackdrop({ location }: { location: string }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="w-full h-full relative overflow-hidden">
      <SceneIllustration theme={sceneForLocation(location)} className="w-full h-full" rounded={false} align="bottom" sway />
      {imgOk && (
        <motion.img
          src={`/assets/scene-${location}.webp`}
          alt=""
          loading="lazy"
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
        />
      )}
    </div>
  );
}
