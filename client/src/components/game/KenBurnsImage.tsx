import { motion } from 'framer-motion';

/*
 * Lent travelling « Ken Burns » sur une image : léger sur-zoom + dérive
 * latérale en aller-retour permanent. La scène semble filmée au lieu d'être
 * figée. Le sens de la dérive est déduit du chemin du fichier pour varier
 * d'une image à l'autre sans paramétrage.
 */
export default function KenBurnsImage({ src, alt = '', onError, className = '' }: {
  src: string;
  alt?: string;
  onError?: () => void;
  className?: string;
}) {
  let sum = 0;
  for (let i = 0; i < src.length; i++) sum += src.charCodeAt(i);
  const dx = sum % 2 === 0 ? 3.5 : -3.5;   // % de dérive horizontale
  const dy = sum % 3 === 0 ? 1.5 : -1.5;   // % de dérive verticale
  return (
    <motion.img
      key={src}
      src={src}
      alt={alt}
      onError={onError}
      // Cette image est le sujet de l'écran qui vient de s'ouvrir : elle passe
      // devant le reste, et se décode hors du fil principal pour ne pas
      // saccader l'animation d'entrée.
      fetchPriority="high"
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
      style={{ scale: 1.12, willChange: 'transform' }}
      initial={{ x: `${dx}%`, y: `${dy}%` }}
      animate={{ x: `${-dx}%`, y: `${-dy}%` }}
      transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    />
  );
}
