/*
 * LES QUATRE TEXTURES DE LA BOUTIQUE.
 *
 * Elles ne sont pas décoratives : chacune remplace un élément d'interface qui,
 * rendu au CSS, trahirait la direction artistique du jeu. C'est le seul écran
 * qui demande de l'argent, donc le seul où l'on ne peut pas se permettre de
 * ressembler à un formulaire.
 *
 * Tout est en SVG et sans dépendance : ces objets se dessinent à toutes les
 * tailles, se teintent depuis la palette, et ne coûtent aucun fichier de plus.
 */

/*
 * LE TRAIT SUR L'ANCIEN PRIX.
 *
 * `text-decoration: line-through` trace une droite parfaite, centrée au pixel,
 * de l'épaisseur exacte de la police. C'est une rature de tableur. Un prix
 * barré au marqueur ne l'est jamais : le trait déborde, il monte, il tremble,
 * il appuie plus fort au départ qu'à l'arrivée.
 *
 * D'où un chemin dessiné à la main, posé PAR-DESSUS le texte en position
 * absolue. Le texte, lui, garde sa hauteur de ligne normale — c'est ce qui
 * permet au barré de dépasser sans décaler quoi que ce soit.
 */
export function Barre({ couleur = '#3A2A1E' }: { couleur?: string }) {
  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className="absolute inset-x-[-8%] top-1/2 w-[116%] h-[128%] -translate-y-[62%] pointer-events-none"
      aria-hidden="true"
    >
      <path
        d="M2 14 Q16 8.5 31 12 T58 10.5 Q74 13 98 7.5"
        fill="none"
        stroke={couleur}
        strokeWidth="2.9"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

/*
 * LE SCOTCH.
 *
 * Deux bandes posées en biais aux coins d'une carte. Le jaune fluo est la
 * SEULE couleur vive de l'écran — voir docs/design/boutique.md : un accent
 * dilué sur six éléments ne guide plus rien.
 *
 * Les bords sont déchirés (clip-path irrégulier) parce qu'un rectangle net
 * fait autocollant d'imprimante, pas ruban arraché à la main.
 */
export function Scotch({ cote, className = '' }: { cote: 'gauche' | 'droite'; className?: string }) {
  const gauche = cote === 'gauche';
  return (
    <span
      aria-hidden="true"
      className={`absolute w-16 h-6 pointer-events-none ${gauche ? '-left-3 -top-2 -rotate-[38deg]' : '-right-3 -top-2 rotate-[38deg]'} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #F7EC6A 0%, #EFD93C 55%, #E3C92C 100%)',
        opacity: 0.86,
        clipPath: 'polygon(0% 12%, 6% 0%, 14% 14%, 26% 2%, 38% 16%, 52% 3%, 66% 15%, 80% 2%, 92% 14%, 100% 4%, 100% 88%, 93% 100%, 80% 86%, 67% 99%, 53% 85%, 39% 98%, 26% 84%, 13% 97%, 5% 86%, 0% 96%)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
      }}
    />
  );
}

/*
 * L'ÉTIQUETTE PENDUE.
 *
 * Un prix dans un cadre gris se lit comme une donnée. Une étiquette cartonnée
 * percée d'un œillet et penchée se lit comme une marchandise — et c'est tout
 * l'objet de cet écran.
 *
 * Elle ne tourne QU'AU MONTAGE (voir l'appelant) : rien ne clignote ici. Une
 * animation en boucle est la signature du free-to-play prédateur, et un jeu
 * qui se moque de tout ne peut pas se permettre d'y ressembler.
 */
export function Etiquette({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 pl-5 pr-3 py-1.5 text-sm font-mono font-semibold text-[#3A2A1E] ${className}`}
      style={{
        background: 'linear-gradient(160deg, #E4CFAA 0%, #D6BC90 100%)',
        clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)',
        boxShadow: '0 2px 5px rgba(58,42,30,0.22)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-[7px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full"
        style={{ background: '#FBF6F0', boxShadow: 'inset 0 0 0 1px rgba(58,42,30,0.45)' }}
      />
      {children}
    </span>
  );
}

/*
 * LE RUBAN D'ANGLE.
 *
 * Il ne sert qu'au lot, et il porte le seul mot qui doit se lire de loin.
 * Rendu par rotation dans un conteneur qui déborde, comme un ruban cousu au
 * coin d'une carte.
 */
export function RubanAngle({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="false" className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none rounded-tr-2xl">
      <span
        className="absolute top-[16px] right-[-30px] w-[120px] text-center rotate-45 py-1 text-[10px] font-bold tracking-widest text-[#FBF6F0]"
        style={{ background: '#B84A3A', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
      >
        {children}
      </span>
    </span>
  );
}
