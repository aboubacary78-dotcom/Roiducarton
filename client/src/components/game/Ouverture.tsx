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
 * LE LOGO EST ARRIVÉ, ET IL CHANGE LA FRAPPE EN DEUX FRAPPES.
 *
 * Cette page disait « pas de logo, pas d'image : le studio n'en a pas ». Il en
 * a un maintenant, et il est en deux parties évidentes : un raton qui tient un
 * A et un T à bout de bras, et « DEUX MAIN » écrit dessous. Le prendre comme
 * un seul bloc qui tombe aurait gâché ce que le dessin raconte déjà.
 *
 * On frappe donc DEUX FOIS. Le raton et ses lettres s'écrasent les premiers,
 * l'écran encaisse, la poussière saute. Puis, 340 ms plus tard, « DEUX MAIN »
 * claque dessous, d'un coup plus sec et venu de moins haut : la deuxième
 * frappe de la même main. Une seule chute aurait posé une image ; deux temps
 * font une signature.
 *
 * CE QUE ÇA COÛTE, ET COMMENT ON LE PAIE. Une image peut manquer à l'appel, et
 * un tampon qui s'écrase sur rien serait pire que pas de tampon du tout. Trois
 * garde-fous : `index.html` demande les deux fichiers pendant la lecture du
 * HTML, l'horloge de la séquence n'est lancée qu'une fois les deux décodées
 * (avec un plafond, on ne bloque pas une ouverture derrière un réseau mort), et
 * si l'une d'elles manque vraiment, le nom écrit reprend sa place. Les deux
 * pèsent 91 ko à elles deux, et le nom reste écrit exactement comme il est
 * déposé, jeu de mots compris : on ne l'explique pas, on ne le corrige pas.
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
 * LES DEUX MORCEAUX DU LOGO.
 *
 * Découpés du fichier maître par `scripts/detourer-logo.py`, qui détoure le
 * fond crème sans crever les yeux du raton et ajoure les contre-poinçons des
 * lettres, pour que le carton se voie à travers le A plutôt qu'un aplat clair.
 *
 * Les proportions viennent du logo d'origine et ne sont pas décidées ici : le
 * mot fait toute la largeur de référence, l'emblème en fait 80,9 %, et l'espace
 * qui les sépare vaut la fente mesurée entre eux dans le fichier. Poser deux
 * images « à peu près » aurait redessiné la composition du logo au jugé.
 */
const EMBLEME = '/assets/studio-embleme.webp';
const MOT = '/assets/studio-mot.webp';
const PART_EMBLEME = '80.9%';
const ECART = '1.4%';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TABLE DES TEMPS, ET C'EST LA SEULE.
 *
 * Une chorégraphie décrite dans un commentaire et jouée par des nombres
 * dispersés dans le fichier diverge à la première retouche. Tout ce qui suit
 * lit ces valeurs, y compris les retards passés au CSS : le plan EST le code.
 *
 *      0 ms   le carton, vide, son grain qui respire
 *    140 ms   l'ombre du raton grossit : quelque chose approche par-dessus
 *    300 ms   IMPACT ①. Le raton et ses lettres s'écrasent, l'écran encaisse,
 *             la poussière saute
 *    360 ms   l'encre commence à partir dans la fibre
 *    640 ms   IMPACT ②. « DEUX MAIN » claque dessous, plus sec, moins haut
 *    900 ms   le trait de marqueur se tire sous le mot
 *   2150 ms   ARRACHAGE. Les deux moitiés partent, le texte est dessous
 *   2370 ms   les lignes de l'avertissement remontent, l'une après l'autre
 *   2750 ms   le scotch claque en travers
 *   3210 ms   on peut appuyer
 *
 * ENTRE 900 ET 2150 MS, RIEN NE BOUGE, ET C'EST VOULU. Le logo complet tient
 * l'écran une seconde et quart avant d'être déchiré. Sans ce temps mort, on
 * n'aurait jamais vu le logo, seulement son arrivée et son départ.
 *
 * Quand l'avertissement a déjà été lu, la séquence s'arrête à l'arrachage et
 * rend la main au jeu : 2 770 ms en tout, sautables d'un doigt à tout instant.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const T = {
  approche: 140,
  impact: 300,
  encre: 360,
  mot: 640,
  trait: 900,
  arrachage: 2150,
  dureeArrachage: 620,
  texte: 2370,
  scotch: 2750,
  jouable: 3210,
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

  /*
   * ON N'OUVRE PAS L'HORLOGE AVANT D'AVOIR LE LOGO EN MAIN.
   *
   * Le tampon tombe à 300 ms. Si les deux fichiers ne sont pas décodés à cet
   * instant, l'écran encaisse un choc et la poussière saute pour RIEN : on aura
   * dépensé toute la mise en scène sur un vide, et l'appareil où ça se produit
   * est le plus lent, donc celui d'un vrai joueur.
   *
   * `decode()` attend le décodage, pas seulement le téléchargement : une image
   * reçue mais pas encore décodée s'affiche quand même une image trop tard, et
   * c'est exactement l'image de l'impact.
   *
   * LE PLAFOND EST LA PARTIE IMPORTANTE. Un réseau mort, un fichier absent, un
   * `decode()` qui n'aboutit jamais : la course contre 700 ms garantit que
   * l'ouverture démarre de toute façon. Une animation d'accueil qui attend
   * indéfiniment un ornement transformerait un ornement en panne.
   */
  const [logoPret, setLogoPret] = useState(false);
  const [logoManque, setLogoManque] = useState(false);
  useEffect(() => {
    if (!vivante) return;
    let vif = true;
    const charger = (src: string) => {
      const i = new Image();
      i.src = src;
      return i.decode().then(() => true).catch(() => false);
    };
    const plafond = new Promise<null>(r => window.setTimeout(() => r(null), 700));
    Promise.race([Promise.all([charger(EMBLEME), charger(MOT)]), plafond])
      .then(res => {
        if (!vif) return;
        if (Array.isArray(res) && !res.every(Boolean)) setLogoManque(true);
        setLogoPret(true);
      });
    return () => { vif = false; };
  }, [vivante]);

  // L'horloge de la séquence. Une seule, lancée dès que le logo est là.
  useEffect(() => {
    if (!vivante || !logoPret) return;
    const debut = performance.now();
    let brut = 0;
    const battre = () => {
      setT(performance.now() - debut);
      brut = requestAnimationFrame(battre);
    };
    brut = requestAnimationFrame(battre);
    return () => cancelAnimationFrame(brut);
  }, [vivante, logoPret]);

  /*
   * L'ARRACHAGE part tout seul. Il découvre soit l'avertissement, soit le jeu :
   * dans le second cas la séquence s'arrête là, et rendre la main est la seule
   * chose à faire.
   */
  useEffect(() => {
    // Il part de l'INSTANT OÙ L'HORLOGE PART, pas du montage : sans cette
    // condition, une image lente ferait arracher un carton encore vierge.
    if (!vivante || arrache || !logoPret) return;
    const id = window.setTimeout(() => {
      setArrache(true);
      window.setTimeout(() => setParties(true), T.dureeArrachage);
      if (!aLire) window.setTimeout(() => setVivante(false), T.dureeArrachage);
    }, T.arrachage);
    return () => window.clearTimeout(id);
  }, [vivante, arrache, aLire, logoPret]);

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
          className={`absolute inset-0 ${arrache ? (cote === 'haut' ? 'ouv-haut' : 'ouv-bas') : ''}`}
          style={{
            clipPath: cote === 'haut'
              ? 'polygon(0 0, 100% 0, 100% 47%, 88% 51%, 76% 46%, 63% 52%, 51% 47%, 38% 53%, 26% 48%, 13% 52%, 0 48%)'
              : 'polygon(0 48%, 13% 52%, 26% 48%, 38% 53%, 51% 47%, 63% 52%, 76% 46%, 88% 51%, 100% 47%, 100% 100%, 0 100%)',
          }}
        >
          <Carton />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Signature t={t} frappe={frappe} manque={logoManque} />
          </div>
        </div>
      ))}

      {/*
        LE NOM DU STUDIO, DIT UNE FOIS ET UNE SEULE.

        Il était écrit en toutes lettres à l'écran, donc lisible par tout le
        monde. Le logo l'a remplacé par une image, et une image ne se lit pas
        toute seule. Deux `alt` auraient réglé la question et créé la suivante :
        la signature est dessinée DEUX FOIS, une par moitié de déchirure, et
        une synthèse vocale aurait annoncé le studio en double.

        Les deux moitiés sont donc muettes, et le nom vit ici, hors du découpage,
        énoncé une seule fois. Il disparaît avec elles : une signature qui reste
        dans la page après avoir été arrachée n'est plus une signature.
      */}
      {!parties && <h1 className="sr-only">{STUDIO}</h1>}

      {/*
        PASSER : UN VRAI BOUTON, ET PAS DEUX MOITIÉS DE CARTON.

        Le geste était porté par les deux moitiés arrachables, qui sont des
        `div`. Ça marche au doigt et nulle part ailleurs : ni au clavier, ni à
        la synthèse vocale, alors qu'on demande précisément au joueur d'appuyer
        pour passer. Et comme ces `div` n'ont aucune identité propre, la seule
        façon de les désigner était le texte qu'elles contenaient — le nom du
        studio. Le jour où ce nom est devenu une image, le geste est devenu
        introuvable, pour un observateur comme pour une aide technique.

        Un seul bouton transparent, posé par-dessus, réglé les deux : il porte
        le nom de ce qu'il fait, il se déclenche à l'entrée comme au doigt, et
        il se retire dès l'arrachage pour rendre l'écran au scotch qui suit.
      */}
      {!arrache && (
        <button
          onClick={sauter}
          aria-label={tr('Passer l\'introduction', 'Skip the intro')}
          className="absolute inset-0 w-full h-full cursor-default"
        />
      )}

      {/* LA SECOUSSE. Un voile transparent qui porte l'animation et fait bouger
          tout ce qu'il contient : le choc se sent sur l'écran entier, pas sur
          le seul mot frappé. */}
      {frappe && t < T.impact + 400 && (
        <div className="ouv-secousse absolute inset-0 pointer-events-none" />
      )}
    </div>
  );
}

/*
 * LA SIGNATURE FRAPPÉE, EN DEUX TEMPS.
 *
 * L'emblème d'abord, le mot ensuite. Chacun porte son ombre d'approche, son
 * encre qui bave et, pour le premier seulement, la poussière du choc : le
 * second coup est plus léger, lui donner la même poussière ferait deux fois le
 * même événement.
 *
 * `brightness(0)` sert deux fois et mérite son mot : il écrase toutes les
 * couleurs de l'image sur le noir en gardant sa transparence. C'est ce qui
 * transforme un logo en couleurs en une SILHOUETTE, donc en ombre portée puis
 * en tache d'encre, sans avoir à livrer deux fichiers de plus.
 */
function Signature({ t, frappe, manque }: { t: number; frappe: boolean; manque: boolean }) {
  const avance = Math.min(1, Math.max(0, (t - T.approche) / (T.impact - T.approche)));
  const motFrappe = t >= T.mot;

  /*
   * LE REPLI, QUI N'EST PAS DÉCORATIF.
   *
   * Si les fichiers manquent vraiment, l'ouverture retombe sur le nom écrit,
   * c'est-à-dire sur ce qu'elle faisait avant d'avoir un logo. Un studio dont
   * la signature ne s'affiche pas est un studio qui n'a pas signé.
   */
  if (manque) {
    return (
      <div className="relative">
        {frappe && (
          <div className="ouv-tampon">
            <span className="block text-3xl font-bold tracking-[0.16em] text-[#241A12] whitespace-nowrap"
              style={{ filter: 'url(#ouv-bave)', textShadow: '0 1px 0 rgba(255,255,255,0.16)' }}>
              {STUDIO}
            </span>
          </div>
        )}
      </div>
    );
  }

  /*
   * TOUT EST DANS LE DOCUMENT DÈS LA PREMIÈRE IMAGE, ET RIEN NE BOUGE ENSUITE.
   *
   * La première version montait chaque morceau au moment de sa frappe. La boîte
   * grandissait donc à chaque arrivée, et comme elle est centrée, L'EMBLÈME
   * REMONTAIT : la planche de contrôle le montre à 25 % de la hauteur quand il
   * est seul, puis à 45 % une fois le mot et le trait posés. Un tampon qui
   * dérive après avoir frappé annule tout ce que la chute vient de raconter.
   *
   * On réserve donc la place tout de suite et on ne joue que sur la visibilité :
   * la hauteur est définitive dès l'image zéro, et ce qui s'écrase reste où il
   * s'est écrasé.
   */
  const cache = (visible: boolean) => ({ visibility: visible ? 'visible' : 'hidden' } as const);

  return (
    <div className="relative w-[68%] max-w-[300px]" aria-hidden>
      {/* L'OMBRE QUI APPROCHE : l'emblème vu de dessous, avant qu'il touche. */}
      {t >= T.approche && !frappe && (
        <div
          className="absolute inset-0 flex items-start justify-center pointer-events-none"
          style={{
            opacity: avance * 0.36,
            transform: `scale(${1.9 - avance * 0.55})`,
            filter: 'blur(12px) brightness(0)',
          }}
        >
          <img src={EMBLEME} alt="" style={{ width: PART_EMBLEME }} />
        </div>
      )}

      {/*
        ── ① L'EMBLÈME ────────────────────────────────────────────────────────

        L'ENCRE EST IMBRIQUÉE DANS LA CHUTE, ET C'EST UNE CORRECTION.

        Elle était posée à côté du tampon, en frère. Or `carton-tampon` finit sur
        `rotate(-1.2deg)` : la tache restait donc droite pendant que la forme
        nette penchait, et le décalage se lisait comme un DÉFAUT DE REPÉRAGE,
        une impression ratée sur deux passages, plutôt que comme de l'encre qui
        s'étale. En la mettant DANS le tampon, elle subit exactement la même
        chute, la même inclinaison, et ne se distingue plus que par son flou.

        Elle vaut aussi 55 % de sa valeur d'origine : `carton-bave` a été réglée
        pour du TEXTE, où elle ne déborde que d'un contour de lettre. Derrière
        une image pleine, la même opacité cernait le raton d'un halo continu.
      */}
      <div className="relative flex justify-center" style={cache(frappe)}>
        <div className="ouv-tampon w-full flex justify-center relative">
          <span className="absolute inset-0 flex justify-center pointer-events-none" style={{ opacity: 0.55 }}>
            <img
              src={EMBLEME} alt="" className="ouv-bave"
              style={{ width: PART_EMBLEME, animationDelay: `${T.encre - T.impact}ms`, filter: 'blur(3px) brightness(0)' }}
            />
          </span>
          {/* L'emblème net. Le filtre de bave est posé ICI, sur un élément que
              rien n'anime : c'est le parent qui porte la chute. */}
          <img
            src={EMBLEME} alt=""
            style={{ width: PART_EMBLEME, filter: 'url(#ouv-bave) drop-shadow(0 2px 3px rgba(40,26,14,0.34))' }}
          />
        </div>
      </div>

      {/* ── ② LE MOT, 340 ms plus tard ────────────────────────────────────── */}
      <div className="relative flex justify-center" style={{ marginTop: ECART, ...cache(motFrappe) }}>
        <div className="ouv-tampon-mot w-full relative">
          <span className="absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }}>
            <img src={MOT} alt="" className="ouv-bave w-full"
              style={{ animationDelay: '60ms', filter: 'blur(3px) brightness(0)' }} />
          </span>
          <img src={MOT} alt="" className="w-full"
            style={{ filter: 'url(#ouv-bave) drop-shadow(0 2px 3px rgba(40,26,14,0.34))' }} />
        </div>
      </div>

      {/* LE TRAIT DE MARQUEUR, tiré une fois, jamais droit. */}
      <svg viewBox="0 0 196 14" className="mx-auto mt-3 overflow-visible block w-3/4">
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

      {/* LA POUSSIÈRE soulevée par le premier coup, et par lui seul : le second
          est plus léger, lui donner la même poussière ferait deux fois le même
          événement. Absolue, donc sans effet sur la hauteur de la boîte. */}
      {frappe && (
        <div className="absolute inset-x-0 top-1/2 pointer-events-none">
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
