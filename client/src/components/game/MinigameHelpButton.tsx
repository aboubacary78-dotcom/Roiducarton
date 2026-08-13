import { playClick } from '@/lib/sound';
import { useLang, tr } from '@/lib/lang';

/*
 * LE « ? » DES MINI-JEUX.
 *
 * La carte « comment jouer » se rouvre à la demande. Sans ça, un joueur qui a
 * lu les règles une fois il y a trois semaines se retrouve devant un mini-jeu
 * muet — et une règle oubliée casse le flow bien plus sûrement qu'une
 * explication de trop.
 *
 * Discret, en coin, hors du chemin du pouce : il ne coûte rien à ceux qui
 * savent déjà.
 */
export default function MinigameHelpButton({ onOpen }: { onOpen: () => void }) {
  useLang();
  return (
    <button
      onClick={() => { playClick(); onOpen(); }}
      className="fixed top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
      style={{ background: 'rgba(24,18,14,0.55)', color: '#E8D5C0', border: '1px solid rgba(232,213,192,0.28)' }}
      aria-label={tr('Revoir les règles', 'Show the rules')}
    >
      ?
    </button>
  );
}
