/*
 * L'OUVERTURE : un tampon, une déchirure, un bout de scotch.
 *
 * DEUX TEMPS, DEUX RÈGLES DIFFÉRENTES.
 *
 *   ① LA SIGNATURE « AT DEUX MAIN » passe à chaque lancement. C'est ce que
 *     fait une signature : elle se répète, sinon elle n'en est pas une.
 *
 *   ② L'AVERTISSEMENT ne passe qu'UNE FOIS, à la première ouverture. Un texte
 *     légal a besoin d'être lu, pas récité : le remontrer à chaque lancement
 *     apprendrait à le sauter des yeux. Il se range ensuite dans les Options,
 *     à côté de la politique de confidentialité.
 *
 * CE QUI A CHANGÉ, ET POURQUOI.
 *
 * La première version était honnête et morte : un fond beige uni, trois mots
 * qui montaient, un bouton jaune d'application. Rien n'y avait de matière, et
 * un jeu dont toute la direction artistique tient dans une matière ne peut pas
 * s'ouvrir sur son absence. Trois choses manquaient, et ce sont les trois
 * seules qui comptent :
 *
 *   · UN POIDS. Le nom ne paraît plus, il est FRAPPÉ. Il tombe de trop haut,
 *     trop gros, flou, et s'écrase d'un coup. L'écran encaisse, la poussière
 *     saute, l'encre part dans la fibre. La courbe de la chute fait tout le
 *     travail : molle au début, brutale à la fin.
 *
 *   · UNE DÉCHIRURE. On ne fait pas un fondu entre deux écrans de carton, on
 *     arrache le premier. Deux moitiés découpées le long d'une ligne dentée,
 *     qui partent en tournant et découvrent le texte posé dessous.
 *
 *   · DU SCOTCH, PAS UN BOUTON. Un rectangle jaune arrondi appartient au
 *     vocabulaire des formulaires. On appuie ici sur un morceau de gaffer gris,
 *     déchiré aux deux bouts, posé de travers, avec la phrase écrite au
 *     marqueur dessus. Il s'écrase sous le doigt, puis se décolle.
 *
 * PAS DE LOGO, ET PAS D'IMAGE. Le studio n'en a pas, on n'en invente pas un, et
 * tout ce qui suit est dessiné en code : rien à charger, rien à décliner par
 * résolution, et l'ouverture ne peut pas se retrouver un jour à attendre un
 * fichier. Le nom est écrit exactement comme il est déposé, jeu de mots
 * compris ; on ne l'explique pas et on ne le corrige pas.
 *
 * TOUT SE SAUTE D'UN DOIGT, et le voile est posé PAR-DESSUS l'écran-titre déjà
 * monté : quand il se lève, le jeu est là, sans chargement ajouté.
 */
import { useEffect, useState } from 'react';
import { tr } from '@/lib/lang';

const CLE_AVERTISSEMENT = 'roi-du-carton-avertissement-lu';

/*
 * L'OUVERTURE S'EFFACE SOUS AUTOMATISATION, ET IL FAUT DIRE POURQUOI.
 *
 * Elle recouvre tout l'écran, puis attend un geste sur l'avertissement. Les
 * suites démarrent en vidant le stockage et en cliquant aussitôt : trois
 * d'entre elles se sont mises à échouer sur des boutons parfaitement
 * fonctionnels mais recouverts, et les autres ne passaient que parce que leurs
 * temporisations dépassaient l'animation. C'est-à-dire par chance.
 *
 * Deux mauvaises réponses ont été écartées. Ajouter le bouton au vocabulaire
 * de fermeture de dix-huit fichiers laisse l'animation bloquer les premières
 * centaines de millisecondes, donc laisse la chance décider. Et raccourcir
 * l'ouverture pour arranger les tests reviendrait à laisser l'outil de mesure
 * dessiner le produit.
 *
 * `navigator.webdriver` ne vaut `true` que sous pilotage automatique : jamais
 * dans un navigateur ordinaire, jamais dans la WebView de l'application. Et
 * pour que ce raccourci ne serve pas à cacher une ouverture cassée,
 * `test-ouverture.mjs` repose le drapeau ci-dessous et éprouve la vraie chose.
 */
const CLE_FORCER = 'roi-du-carton-ouverture-forcee';

function ouvertureSautee(): boolean {
  try {
    if (localStorage.getItem(CLE_FORCER) === '1') return false;
    return navigator.webdriver === true;
  } catch { return false; }
}

/** Le nom du studio, tel qu'il est déposé. Ni corrigé, ni traduit. */
const STUDIO = 'AT DEUX MAIN';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TABLE DES TEMPS, ET C'EST LA SEULE.
 *
 * Une chorégraphie décrite dans un commentaire et jouée par des nombres
 * dispersés dans le fichier diverge à la première retouche. Tout ce qui suit
 * lit ces valeurs, y compris les retards passés au CSS : le plan EST le code.
 *
 *      0 ms   le carton, vide, son grain qui respire
 *    140 ms   l'ombre du tampon grossit : quelque chose approche par-dessus
 *    300 ms   IMPACT. Le nom s'écrase, l'écran encaisse, la poussière saute
 *    360 ms   l'encre commence à partir dans la fibre
 *    620 ms   le trait de marqueur se tire sous le nom
 *   1900 ms   ARRACHAGE. Les deux moitiés partent, le texte est dessous
 *   2120 ms   les lignes de l'avertissement remontent, l'une après l'autre
 *   2500 ms   le scotch claque en travers
 *   2960 ms   on peut appuyer
 *
 * Quand l'avertissement a déjà été lu, la séquence s'arrête à l'arrachage et
 * rend la main au jeu : 2 520 ms en tout, dont la moitié est sautable d'un
 * doigt.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const T = {
  approche: 140,
  impact: 300,
  encre: 360,
  trait: 620,
  arrachage: 1900,
  dureeArrachage: 620,
  texte: 2120,
  scotch: 2500,
  jouable: 2960,
} as const;

/**
 * Le texte de l'avertissement, sorti du composant pour que les Options
 * puissent le réafficher sans le recopier : deux versions d'un même texte
 * finissent toujours par diverger, et c'est celui-là qu'on ne veut pas voir
 * diverger.
 */
export function texteAvertissement(): { titre: string; corps: string[] } {
  return {
    titre: tr('Une fiction', 'A work of fiction'),
    corps: [
      tr('Le Roi du Carton est une fiction. Ses personnages, ses lieux et ses situations sont inventés, et ses événements sont tirés au sort à chaque partie. Toute ressemblance avec des personnes ou des faits réels serait fortuite.',
         'Cardboard King is a work of fiction. Its characters, places and situations are invented, and its events are drawn at random in every run. Any resemblance to real people or events is coincidental.'),
      tr('Le jeu rit des institutions et de l\'absurde. Jamais de ceux qui dorment dehors.',
         'The game laughs at institutions and at the absurd. Never at those sleeping outside.'),
    ],
  };
}

/*
 * LES FILTRES, POSÉS UNE FOIS ET JAMAIS ANIMÉS.
 *
 * `#ouv-bave` casse le bord des lettres pour qu'elles aient été encrées et non
 * imprimées, `#ouv-grain` fabrique le grain du papier. Un `feTurbulence` est
 * cher à calculer, mais il ne l'est qu'UNE fois tant que l'élément filtré ne
 * bouge pas : c'est pour ça que ce sont toujours les parents qui s'animent.
 */
function Filtres() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <filter id="ouv-bave" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="7" result="b" />
          <feDisplacementMap in="SourceGraphic" in2="b" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="ouv-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope="0.5" /></feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}

/*
 * LE CARTON LUI-MÊME.
 *
 * Quatre couches, et aucune n'est décorative : le kraft de fond, la cannelure
 * en biais, deux taches d'humidité, et le grain par-dessus tout. Un aplat beige
 * uni ne fait pas du carton, il fait un fond beige.
 */
function Carton({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(163deg, #D2B187 0%, #C4A277 46%, #B08F63 100%)' }} />
      {/* La cannelure : jamais d'équerre, sinon c'est du papier peint. */}
      <div className="absolute inset-0 opacity-[0.22]" style={{
        backgroundImage: 'repeating-linear-gradient(97deg, rgba(88,62,38,0.5) 0 1px, transparent 1px 7px)',
      }} />
      {/* Deux auréoles, parce qu'un carton qui a servi a pris l'eau. */}
      <div className="absolute inset-0 opacity-[0.30]" style={{
        background: 'radial-gradient(58% 34% at 22% 26%, rgba(120,86,52,0.55) 0%, transparent 62%),'
          + 'radial-gradient(44% 28% at 82% 72%, rgba(104,74,44,0.42) 0%, transparent 66%)',
      }} />
      {/* Les bords mangés par l'usure. */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(128% 84% at 50% 46%, transparent 52%, rgba(58,42,30,0.42) 100%)',
      }} />
      {/*
        LE GRAIN QUI RESPIRE, EN DEUX ÉLÉMENTS ET PAS UN.
        La première version portait le filtre ET l'animation sur le même div.
        C'est précisément ce que l'en-tête de ce fichier interdit : un
        `feTurbulence` posé sur un élément qui bouge se recalcule à chaque
        image. Le parent porte donc le mouvement, l'enfant porte le filtre et
        ne bouge jamais.
      */}
      <div className="absolute -inset-8 ouv-grain">
        <div className="absolute inset-0 opacity-[0.16] mix-blend-multiply"
          style={{ filter: 'url(#ouv-grain)' }} />
      </div>
    </div>
  );
}

/*
 * Un module, pas un état React : l'ouverture se joue une fois par LANCEMENT, et
 * un remontage de l'arbre ne doit pas la rejouer au milieu d'une partie.
 */
let dejaJouee = false;

export default function Ouverture() {
  const [vivante, setVivante] = useState(() => {
    if (dejaJouee || ouvertureSautee()) return false;
    dejaJouee = true;
    return true;
  });
  const [t, setT] = useState(0);
  const [arrache, setArrache] = useState(false);
  /*
   * LES MOITIÉS ARRACHÉES SORTENT DU DOCUMENT UNE FOIS PARTIES.
   *
   * Elles s'immobilisent hors de l'écran à la fin de leur animation, ce qui
   * les laisse coûter deux couches filtrées pour rien, et surtout ce qui garde
   * le nom du studio dans le texte de la page alors que personne ne le voit
   * plus. Un contrôle qui demandait « la signature s'efface » le trouvait donc
   * encore là et concluait qu'elle ne s'effaçait pas.
   */
  const [parties, setParties] = useState(false);
  const [decolle, setDecolle] = useState(false);

  const avertissementLu = () => {
    try { return localStorage.getItem(CLE_AVERTISSEMENT) === '1'; } catch { return true; }
  };
  const [aLire] = useState(() => !avertissementLu());

  // L'horloge de la séquence. Une seule, remise à zéro au montage.
  useEffect(() => {
    if (!vivante) return;
    const debut = performance.now();
    let brut = 0;
    const battre = () => {
      setT(performance.now() - debut);
      brut = requestAnimationFrame(battre);
    };
    brut = requestAnimationFrame(battre);
    return () => cancelAnimationFrame(brut);
  }, [vivante]);

  /*
   * L'ARRACHAGE part tout seul. Il découvre soit l'avertissement, soit le jeu :
   * dans le second cas la séquence s'arrête là, et rendre la main est la seule
   * chose à faire.
   */
  useEffect(() => {
    if (!vivante || arrache) return;
    const id = window.setTimeout(() => {
      setArrache(true);
      window.setTimeout(() => setParties(true), T.dureeArrachage);
      if (!aLire) window.setTimeout(() => setVivante(false), T.dureeArrachage);
    }, T.arrachage);
    return () => window.clearTimeout(id);
  }, [vivante, arrache, aLire]);

  const sauter = () => {
    if (arrache) return;
    setArrache(true);
    window.setTimeout(() => setParties(true), T.dureeArrachage);
    if (!aLire) window.setTimeout(() => setVivante(false), T.dureeArrachage);
  };

  const terminer = () => {
    if (decolle) return;
    setDecolle(true);
    try { localStorage.setItem(CLE_AVERTISSEMENT, '1'); } catch { /* silent */ }
    // Le scotch se décolle avant que l'écran parte : on ne coupe pas un geste.
    window.setTimeout(() => setVivante(false), 380);
  };

  if (!vivante) return null;

  const { titre, corps } = texteAvertissement();
  const frappe = t >= T.impact;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-hidden"
      style={{ background: '#1A120C' }}
      /*
       * L'HORLOGE DE LA SÉQUENCE, LISIBLE DEPUIS LE DEHORS.
       *
       * Photographier une chorégraphie en comptant les millisecondes depuis le
       * chargement de la page mesure le chargement, pas la chorégraphie : la
       * première planche de contrôle a montré l'avertissement là où le tampon
       * devait tomber, et l'animation n'y était pour rien. Un observateur doit
       * pouvoir attendre l'instant VOULU, pas un instant supposé.
       */
      data-ouverture={Math.round(t)}
    >
      <Filtres />

      {/* ── CE QUI EST DESSOUS : l'avertissement, découvert par la déchirure ── */}
      {aLire && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <Carton />
          {arrache && (
            <div className="relative max-w-sm">
              <h2 className="ouv-remonte text-2xl font-bold text-[#2A1F1A]"
                style={{ animationDelay: `${T.texte - T.arrachage}ms` }}>
                {titre}
              </h2>
              <p className="ouv-remonte text-sm text-[#4A3728] leading-relaxed mt-3"
                style={{ animationDelay: `${T.texte - T.arrachage + 90}ms` }}>
                {corps[0]}
              </p>
              {/*
                LA SECONDE PHRASE N'EST PAS UNE FORMULE JURIDIQUE.
                Elle dit où le jeu place sa moquerie, et c'est la seule ligne
                de tout ce texte qui engage vraiment son auteur.
              */}
              <p className="ouv-remonte text-base font-bold text-[#2A1F1A] leading-relaxed mt-4"
                style={{ animationDelay: `${T.texte - T.arrachage + 200}ms` }}>
                {corps[1]}
              </p>

              <Scotch
                libelle={tr('J\'AI COMPRIS', 'UNDERSTOOD')}
                retard={T.scotch - T.arrachage}
                actif={t >= T.jouable}
                decolle={decolle}
                onAppui={terminer}
              />
            </div>
          )}
        </div>
      )}

      {/* ── LE CARTON DU DESSUS, celui qu'on arrache ─────────────────────── */}
      {/*
        DEUX MOITIÉS, LE MÊME CONTENU, DEUX DÉCOUPES COMPLÉMENTAIRES.

        La ligne de déchirure est un `clip-path` en dents irrégulières, et son
        exact complément est appliqué à l'autre moitié. Dessiner le nom une
        seule fois et le couper en deux est ce qui rend l'illusion : les
        lettres se séparent au milieu d'elles-mêmes, ce qu'aucun fondu ne fait.
      */}
      {!parties && ['haut', 'bas'].map(cote => (
        <div
          key={cote}
          onClick={sauter}
          className={`absolute inset-0 ${arrache ? (cote === 'haut' ? 'ouv-haut' : 'ouv-bas') : ''}`}
          style={{
            clipPath: cote === 'haut'
              ? 'polygon(0 0, 100% 0, 100% 47%, 88% 51%, 76% 46%, 63% 52%, 51% 47%, 38% 53%, 26% 48%, 13% 52%, 0 48%)'
              : 'polygon(0 48%, 13% 52%, 26% 48%, 38% 53%, 51% 47%, 63% 52%, 76% 46%, 88% 51%, 100% 47%, 100% 100%, 0 100%)',
          }}
        >
          <Carton />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Signature t={t} frappe={frappe} />
          </div>
        </div>
      ))}

      {/* LA SECOUSSE. Un voile transparent qui porte l'animation et fait bouger
          tout ce qu'il contient : le choc se sent sur l'écran entier, pas sur
          le seul mot frappé. */}
      {frappe && t < T.impact + 400 && (
        <div className="ouv-secousse absolute inset-0 pointer-events-none" />
      )}
    </div>
  );
}

/** Le nom frappé, avec son ombre d'approche, sa bave et sa poussière. */
function Signature({ t, frappe }: { t: number; frappe: boolean }) {
  return (
    <div className="relative">
      {/* L'OMBRE QUI APPROCHE : le tampon vu de dessous, avant qu'il touche. */}
      {t >= T.approche && !frappe && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: Math.min(0.36, (t - T.approche) / (T.impact - T.approche) * 0.36),
            transform: `scale(${1.9 - (t - T.approche) / (T.impact - T.approche) * 0.55})`,
            filter: 'blur(12px)',
          }}
        >
          <span className="text-3xl font-bold tracking-[0.16em] text-[#1A120C] whitespace-nowrap">{STUDIO}</span>
        </div>
      )}

      {frappe && (
        <>
          {/* L'encre qui part dans la fibre : le même mot, flou, derrière. */}
          <span
            className="ouv-bave absolute inset-0 flex items-center justify-center text-3xl font-bold tracking-[0.16em] text-[#2A1F1A] whitespace-nowrap pointer-events-none"
            style={{ animationDelay: `${T.encre - T.impact}ms`, filter: 'blur(3px)' }}
            aria-hidden
          >
            {STUDIO}
          </span>
          {/* Le nom net. Le filtre est posé ici, sur un élément que RIEN
              n'anime : c'est le parent qui porte la chute. */}
          <div className="ouv-tampon">
            <span
              className="block text-3xl font-bold tracking-[0.16em] text-[#241A12] whitespace-nowrap"
              style={{ filter: 'url(#ouv-bave)', textShadow: '0 1px 0 rgba(255,255,255,0.16)' }}
            >
              {STUDIO}
            </span>
          </div>

          {/* LE TRAIT DE MARQUEUR, tiré une fois, jamais droit. */}
          <svg width="196" height="14" viewBox="0 0 196 14"
            className="mx-auto mt-3 overflow-visible block" aria-hidden>
            <path
              d="M5 8 Q50 3 99 7 T191 5"
              fill="none" stroke="#241A12" strokeWidth="2.8" strokeLinecap="round"
              style={{
                filter: 'url(#ouv-bave)',
                strokeDasharray: 200,
                strokeDashoffset: t >= T.trait ? Math.max(0, 200 - (t - T.trait) * 0.6) : 200,
                opacity: 0.82,
              }}
            />
          </svg>

          {/* LA POUSSIÈRE soulevée par le coup. Sept grains, sept trajets. */}
          <div className="absolute inset-x-0 top-1/2 pointer-events-none" aria-hidden>
            {[-64, -41, -19, 4, 26, 48, 70].map((x, i) => (
              <span
                key={x}
                className="ouv-poussiere absolute block rounded-full bg-[#6B5033]"
                style={{
                  left: `calc(50% + ${x}px)`,
                  width: 2 + (i % 3), height: 2 + (i % 3),
                  ['--dx' as string]: `${x * 0.22}px`,
                  animationDelay: `${(i % 4) * 26}ms`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/*
 * LE SCOTCH, ET POURQUOI CE N'EST PAS UN BOUTON.
 *
 * Un rectangle jaune arrondi appartient au vocabulaire des formulaires : on le
 * lit comme une case à cocher, on l'oublie en le touchant. Un morceau de gaffer
 * gris, déchiré aux deux bouts, posé de travers, avec la phrase écrite au
 * marqueur dessus, appartient au monde du jeu. Il s'écrase sous le doigt parce
 * qu'un adhésif s'écrase, puis il se décolle en tournant.
 *
 * Il reste un vrai `<button>` : les dents et le grain sont du décor, pas une
 * excuse pour perdre le clavier, le focus et les lecteurs d'écran.
 */
function Scotch({ libelle, retard, actif, decolle, onAppui }: {
  libelle: string; retard: number; actif: boolean; decolle: boolean; onAppui: () => void;
}) {
  const [presse, setPresse] = useState(false);
  return (
    <button
      onClick={onAppui}
      onPointerDown={() => setPresse(true)}
      onPointerUp={() => setPresse(false)}
      onPointerLeave={() => setPresse(false)}
      disabled={!actif}
      aria-label={libelle}
      className="ouv-scotch relative block w-full mx-auto mt-9 px-6 py-5 disabled:cursor-default"
      style={{
        animationDelay: `${retard}ms`,
        /*
          LES DEUX BOUTS DÉCHIRÉS.
          La première version avait des dents timides et la bande était étroite :
          ça donnait un autocollant, pas un morceau arraché au rouleau. Les
          dents mordent maintenant jusqu'à un dixième de la largeur, et de
          façon inégale des deux côtés, parce qu'on ne déchire pas deux fois
          pareil.
        */
        clipPath: 'polygon(0 18%, 6% 4%, 10% 21%, 5% 34%, 9% 48%, 4% 63%, 8% 78%, 3% 92%, 90% 100%, 95% 84%, 91% 70%, 96% 55%, 92% 40%, 97% 26%, 93% 12%)',
        /*
          LE GRIS DU GAFFER, ET IL N'EST PAS BLEU.
          Le premier mélange tirait vers le bleu et se lisait comme du plastique.
          Un adhésif toilé est un gris CHAUD, cassé de brun, et plus sombre
          qu'on ne le croit : il faut qu'il pèse sur le carton, pas qu'il flotte
          dessus.
        */
        background: 'linear-gradient(177deg, #6E6A62 0%, #5C5851 34%, #4E4A44 66%, #66625B 100%)',
        boxShadow: presse
          ? 'inset 0 3px 7px rgba(0,0,0,0.5)'
          : '0 7px 16px rgba(26,18,12,0.42), inset 0 1px 0 rgba(255,255,255,0.10)',
        transform: decolle
          ? 'translate3d(22px, -34px, 0) rotate(13deg)'
          : presse ? 'translate3d(0, 2px, 0) rotate(-2deg) scaleY(0.93)' : undefined,
        opacity: decolle ? 0 : undefined,
        transition: decolle
          ? 'transform 380ms cubic-bezier(0.4,0,0.2,1), opacity 380ms ease-out'
          : 'transform 90ms ease-out, box-shadow 90ms ease-out',
      }}
    >
      {/*
        LA TRAME DU GAFFER.
        Une grille fine et régulière se lisait comme du papier millimétré. Un
        adhésif toilé a des fils SERRÉS dans un sens, LÂCHES dans l'autre, et
        c'est ce déséquilibre qui le rend reconnaissable. Plus un reflet en
        biais, parce que la toile accroche la lumière par bandes.
      */}
      <span className="absolute inset-0 opacity-[0.34] pointer-events-none" aria-hidden style={{
        backgroundImage: 'repeating-linear-gradient(90deg, rgba(22,20,18,0.75) 0 1px, transparent 1px 3px),'
          + 'repeating-linear-gradient(0deg, rgba(22,20,18,0.32) 0 1px, transparent 1px 7px)',
      }} />
      <span className="absolute inset-0 pointer-events-none" aria-hidden style={{
        background: 'linear-gradient(101deg, transparent 18%, rgba(255,255,255,0.11) 34%, transparent 46%)',
      }} />
      <span className="relative block text-base font-bold tracking-[0.16em] text-[#EDE7DC]"
        style={{ filter: 'url(#ouv-bave)', textShadow: '0 1px 1px rgba(0,0,0,0.45)' }}>
        {libelle}
      </span>
    </button>
  );
}

/** L'avertissement seul, sans mise en scène : c'est la version des Options. */
export function Avertissement({ onFermer }: { onFermer?: () => void }) {
  const { titre, corps } = texteAvertissement();
  return (
    <div>
      <h2 className="text-xl font-bold text-[#2A1F1A] mb-3">{titre}</h2>
      <p className="text-sm text-[#4A3728] leading-relaxed">{corps[0]}</p>
      <p className="text-sm font-semibold text-[#2A1F1A] leading-relaxed mt-3">{corps[1]}</p>
      {onFermer && (
        <button onClick={onFermer} className="action-btn mt-4 px-5 py-2.5 text-sm font-semibold text-[#3D3020]">
          {tr('Fermer', 'Close')}
        </button>
      )}
    </div>
  );
}
