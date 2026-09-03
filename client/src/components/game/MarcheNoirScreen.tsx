/*
 * LE MARCHÉ NOIR : l'écran qui vend.
 *
 * Les trois produits vivaient au fond des Options, entre le volume sonore et
 * le formulaire de consentement : l'endroit où l'on va quand quelque chose ne
 * va pas, pas quand on a envie de quelque chose. Ils ont maintenant leur écran.
 *
 * La conception, les textes et les biais activés sont dans
 * docs/design/boutique.md. Quatre règles gouvernent le rendu, et elles sont
 * plus importantes que le détail des couleurs :
 *
 *   ① UN SEUL ACCENT CHAUD SUR TOUT L'ÉCRAN. Le jaune fluo n'apparaît que sur
 *     les boutons d'achat et le scotch du titre. Un accent dilué sur six
 *     éléments ne guide plus rien : c'est la règle qui compte, pas la teinte.
 *
 *   ② LE BOUTON EST LE POINT LE PLUS CONTRASTÉ DE SA TUILE. Contrainte
 *     mesurable, donc contrainte qui tient dans le temps.
 *
 *   ③ LE CONTRASTE DE VALEUR PORTE LA HIÉRARCHIE. La tuile du lot est sur un
 *     kraft plus foncé. L'œil va au contraste avant d'aller au grand.
 *
 *   ④ AUCUNE ANIMATION EN BOUCLE. Une seule au montage, puis plus rien. Le
 *     clignotement permanent est la signature du free-to-play prédateur, et un
 *     jeu qui se moque de tout perd le droit de le faire s'il y ressemble.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import {
  isAdsRemoved, isAtelierOwned, packUtile, TREVE_MS,
  purchaseAtelier, purchasePack, purchaseRemoveAds, restaurerAchats,
} from '@/lib/ads';
import { cequiSechePour, viderEtabli } from '@/lib/etabli';
import { loadGraves } from '@/lib/necrology';
import { offrirAccessoire } from '@/lib/profile';
import { mesurer, noterAchatApresDegustation, porteEmpruntee } from '@/lib/mesures';
import { etatMagasin, prixAffiche, surMagasinChange, totalBarre } from '@/lib/facturation';
import { playBack, playMoneyOut, playToggle, playCard } from '@/lib/sound';
import { tr } from '@/lib/lang';
import { pushToast } from '@/lib/toast';
import SafeImg from './SafeImg';
import PlayerFace from './PlayerFace';
import CardboardAvatar from './CardboardAvatar';
import { Barre, Scotch, Etiquette, RubanAngle } from './boutique/textures';

const FLUO = '#F2E14C';

/** Le cadeau du vendeur : l'unique accessoire qu'aucun succès ne donne. */
const CADEAU = 'jeton-marche';
const CLE_CADEAU = 'roi-du-carton-cadeau-vendeur';

/*
 * LA PREUVE SOCIALE, SANS INVENTER PERSONNE.
 *
 * « 12 483 joueurs ont acheté » est un mensonge quand c'est faux, et c'est
 * une donnée qu'on n'a pas. Le jeu en détient une meilleure, parce qu'elle est
 * PERSONNELLE et vérifiable par le joueur lui-même : son cimetière. Elle ne
 * prouve rien sur les autres, elle lui rappelle ce que LUI a subi, et c'est
 * strictement plus fort qu'une statistique inventée sur des inconnus.
 *
 * Les nombres sont écrits en toutes lettres jusqu'à quarante, ce qui est le
 * plafond du cimetière. « Onze morts » se lit comme une phrase, « 11 morts »
 * comme un relevé de compteur, et l'un des deux vend.
 */
/*
 * AU MASCULIN, ET CE N'EST PAS UN DÉTAIL.
 *
 * La première version écrivait « vingt et une » et « trente et une », au
 * féminin, parce qu'on pense d'abord à « la mort ». Mais la ligne compte des
 * MORTS, c'est-à-dire des personnes, et elle compte ensuite des VISAGES : deux
 * noms masculins. Un joueur arrivé à sa vingt et unième partie lisait donc
 * « Vingt et une morts. Vingt et une visages tirés au sort. », faux deux fois
 * dans la même phrase, sur le seul écran du jeu qui vende quelque chose.
 *
 * Vingt et un et trente et un sont les deux seuls rangs où l'accord se voit.
 * Le cimetière en garde quarante au plus, d'où l'arrêt de la table.
 */
const LETTRES_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
  'vingt et un', 'vingt-deux', 'vingt-trois', 'vingt-quatre', 'vingt-cinq', 'vingt-six', 'vingt-sept',
  'vingt-huit', 'vingt-neuf', 'trente', 'trente et un', 'trente-deux', 'trente-trois', 'trente-quatre',
  'trente-cinq', 'trente-six', 'trente-sept', 'trente-huit', 'trente-neuf', 'quarante'];
const LETTRES_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
  'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six',
  'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty', 'thirty-one', 'thirty-two', 'thirty-three',
  'thirty-four', 'thirty-five', 'thirty-six', 'thirty-seven', 'thirty-eight', 'thirty-nine', 'forty'];

function LigneDuCimetiere({ morts }: { morts: number }) {
  /*
   * Sous deux morts, on se tait. « Une mort. Un visage tiré au sort. » ne pèse
   * rien, et le joueur qui vient de commencer n'a pas encore de quoi trouver
   * le tirage pesant : lui dire qu'il devrait serait le lui apprendre.
   */
  if (morts < 2) return null;
  const fr = LETTRES_FR[Math.min(morts, 40)];
  const en = LETTRES_EN[Math.min(morts, 40)];
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  return (
    <p className="text-[11px] text-[#8B6B4A] italic leading-snug mt-2">
      {tr(`${cap(fr)} morts. ${cap(fr)} visages tirés au sort.`,
          `${cap(en)} deaths. ${cap(en)} faces dealt by the draw.`)}
    </p>
  );
}

/*
 * LES DEUX RÉPONSES AUX OBJECTIONS, ET UNE SEULE FOIS.
 *
 * C'est le levier le moins cher de tout le document et le plus négligé :
 * personne n'achète avec une question sans réponse. Les deux sont vraies,
 * les produits sont non consommables, et la possession est relue depuis le
 * compte Google au lancement.
 *
 * Elles étaient d'abord collées sous CHAQUE bouton. Deux phrases identiques à
 * trois centimètres d'écart se lisent comme un copier-coller, et une règle de
 * boutique répétée trois fois inspire moins confiance qu'énoncée une. Elle est
 * donc posée une fois, sous les trois tuiles, là où elle se lit pour ce
 * qu'elle est : les conditions de la maison.
 *
 * La troisième objection (« et si je regrette ? ») n'a délibérément PAS de
 * réponse. Le Play Store accorde son délai qu'on le dise ou non, celui qui se
 * pose la question trouve seul, et l'écrire introduirait le mot « regret » à
 * l'endroit précis où l'on veut qu'il n'y pense pas.
 */
function Objections() {
  return (
    <p className="text-center text-[11px] leading-snug text-[#8B6B4A] px-4">
      {tr('Une fois. Jamais deux. Ça suit votre compte, pas l\'appareil.',
          'Once. Never twice. It follows your account, not the device.')}
    </p>
  );
}

/*
 * LE BOUTON D'ACHAT, ET POURQUOI ILS NE SONT PLUS TOUS PAREILS.
 *
 * Les trois étaient identiques : même jaune, même hauteur, même graisse. Trois
 * appels visuels de force égale ne hiérarchisent rien, ils se concurrencent, et
 * l'ancrage voulu par le document (le premier prix lu sert de référence aux
 * suivants) ne se voyait nulle part.
 *
 * La couleur, elle, ne change pas : le fluo reste le seul accent chaud de
 * l'écran, et chaque bouton reste le point le plus contrasté DE SA TUILE, ce
 * qui est une règle par tuile et non par écran. Ce qui change, c'est le POIDS :
 * la tuile de tête est plus haute et sa lettre plus grande. On hiérarchise par
 * la taille, pas en éteignant deux boutons sur trois, ce qui aurait fait payer
 * la lisibilité de l'offre pour un effet de mise en page.
 */
function BoutonAchat({ libelle, prix, occupe, onClick, tete = false }: {
  libelle: string; prix: string; occupe: boolean; onClick: () => void;
  /** Tuile de tête : celle que le joueur lit en premier sur cet écran-ci. */
  tete?: boolean;
}) {
  return (
    <button
      onClick={() => { if (!occupe) { playMoneyOut(); onClick(); } }}
      disabled={occupe}
      className={`w-full rounded-xl font-bold text-[#2A1F1A] disabled:opacity-60 active:scale-[0.98] transition-transform ${
        tete ? 'py-4 text-base' : 'py-3 text-sm'
      }`}
      style={{
        background: FLUO,
        boxShadow: tete
          ? '0 4px 0 #C9B62A, 0 8px 18px rgba(0,0,0,0.20)'
          : '0 2px 0 #C9B62A, 0 4px 10px rgba(0,0,0,0.14)',
      }}
    >
      {occupe ? tr('⏳ Achat en cours…', '⏳ Purchasing…') : `${libelle} · ${prix}`}
    </button>
  );
}

/** L'état « déjà payé » : court, et sans jamais redemander. */
function DejaPaye({ titre }: { titre: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base font-semibold text-[#2A1F1A]">{titre}</span>
      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4A9B5F]/15 text-[#3d8b4f]">
        {tr('✅ Payé. On ne vous embêtera plus.', '✅ Paid. We won\'t ask again.')}
      </span>
    </div>
  );
}

export default function MarcheNoirScreen() {
  const { state, dispatch } = useGame();
  const char = state.character;

  const [noAds, setNoAds] = useState(isAdsRemoved());
  const [atelier, setAtelier] = useState(isAtelierOwned());
  const [pack, setPack] = useState(packUtile());
  const [occupe, setOccupe] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState(false);
  const [recu, setRecu] = useState(false);
  const [cadeau, setCadeau] = useState(false);
  const [rendu, setRendu] = useState(false);

  /*
   * PAR OÙ LE JOUEUR EST ENTRÉ, ET CE QUE ÇA CHANGE À L'ORDRE DES TUILES.
   *
   * La provenance se consomme à la lecture : on la retient donc une fois, au
   * montage, plutôt que de la relire à chaque rendu, où elle vaudrait déjà
   * « inconnue ».
   *
   * L'ordre par défaut met le LOT en tête, parce qu'il ancre : le premier prix
   * lu sert de référence à tous les suivants, et fait lire l'Atelier seul comme
   * un repli raisonnable. C'est juste pour quelqu'un qui furète.
   *
   * Mais celui qui arrive APRÈS UNE PUBLICITÉ n'est pas en train de furèter :
   * il vient de toucher « qu'on me fiche la paix », et la mesure disait que
   * cette tuile-là se trouvait à 269 px sous la ligne de flottaison. On lui
   * faisait défiler un écran pour retrouver la chose qu'il venait chercher.
   * L'ancrage est un effet ; l'intention déclarée en est un plus fort.
   */
  const [porte] = useState(() => porteEmpruntee());
  const ordre: ('pack' | 'atelier' | 'paix')[] =
    porte === 'interstitiel' ? ['paix', 'pack', 'atelier'] : ['pack', 'atelier', 'paix'];

  const morts = loadGraves().length;
  /* Le visage qui sèche, s'il appartient encore au personnage vivant. */
  const etabli = char && !atelier ? cequiSechePour(char.seed) : null;

  /*
   * LA RÉCIPROCITÉ, ET POURQUOI LE CADEAU N'EST ASSORTI DE RIEN.
   *
   * À la première ouverture de la boutique, le vendeur met un jeton au cou du
   * joueur. Gratuitement, sans condition, et sans le rappeler ensuite. Ce qui
   * déclenche la réciprocité, c'est le don SANS contrepartie : un cadeau
   * conditionné à un achat n'en est pas un, et ça se lit en une seconde.
   *
   * Il est donné au montage, avant même que le joueur ait regardé un prix.
   * L'attendre au premier scroll ou au premier renoncement en ferait une
   * monnaie d'échange, ce qui est exactement le contraire de l'intention.
   */
  useEffect(() => {
    mesurer('boutique_vue', porte);
    if (!noAds) mesurer('tuile_vue', 'noads');
    if (!atelier) mesurer('tuile_vue', 'atelier');
    if (packUtile()) mesurer('tuile_vue', 'pack_complet');
    try {
      if (localStorage.getItem(CLE_CADEAU) === '1') return;
      localStorage.setItem(CLE_CADEAU, '1');
      if (offrirAccessoire(CADEAU)) {
        mesurer('cadeau_vendeur');
        setCadeau(true);
        playCard();
      }
    } catch { /* stockage refusé : pas de cadeau, pas de plantage */ }
    // Volontairement au montage seulement : le cadeau se donne une fois.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Le magasin répond une à deux secondes après le lancement, donc parfois
   * après l'ouverture de cet écran. Sans cet abonnement, un joueur canadien
   * lirait les prix de secours en euros jusqu'à ce qu'il ressorte et revienne.
   */
  const [, redessiner] = useState(0);
  useEffect(() => surMagasinChange(() => redessiner(n => n + 1)), []);
  const muet = etatMagasin().indisponible;

  function echec() {
    pushToast(
      muet
        ? tr('Le vendeur n\'est pas à son carton. Repassez plus tard.', 'Nobody at the stall. Come back later.')
        : tr('La boutique fait la sourde. Réessayez.', 'The stall isn\'t listening. Try again.'),
      { emoji: 'ℹ️', tone: 'info' },
    );
  }

  /*
   * LE PIC ET LA FIN.
   *
   * L'achat réussi n'avait aucun moment : le bouton cessait de tourner, et
   * c'était tout. Le vendeur tend maintenant un reçu en carton, une fois,
   * huit dixièmes de seconde. C'est le souvenir qui restera de la transaction,
   * et il ne coûte rien.
   */
  async function acheter(quoi: 'pack' | 'atelier' | 'noads') {
    if (occupe) return;
    const produit = quoi === 'pack' ? 'pack_complet' : quoi;
    setOccupe(quoi);
    mesurer('achat_lance', produit);
    const ok = await (quoi === 'pack' ? purchasePack() : quoi === 'atelier' ? purchaseAtelier() : purchaseRemoveAds());
    setOccupe(null);
    if (!ok) { echec(); return; }
    mesurer('achat_abouti', produit);
    noterAchatApresDegustation(TREVE_MS);
    setNoAds(isAdsRemoved());
    setAtelier(isAtelierOwned());
    setPack(packUtile());

    /*
     * CE QUI SÉCHAIT SUR L'ÉTABLI EST RENDU ICI, ET TOUT DE SUITE.
     *
     * Le joueur a composé ce visage pendant l'essai libre et n'a pas payé ce
     * jour-là. Il vient de payer. Le rendre plus tard, ou lui demander de
     * rouvrir quelque chose, transformerait une livraison en démarche : ce
     * qu'il a acheté était CETTE tête, elle se pose sur son personnage avant
     * même qu'il ait refermé l'écran.
     */
    if (etabli && char && (quoi === 'atelier' || quoi === 'pack')) {
      dispatch({ type: 'POSER_VISAGE', seed: etabli.seed, visage: etabli.visage });
      viderEtabli();
      setRendu(true);
    }

    playCard();
    setRecu(true);
    setTimeout(() => setRecu(false), 1800);
  }

  const barre = totalBarre('noads', 'atelier');

  return (
    <div className="min-h-screen bg-texture pb-8">
      {/* ── L'ENSEIGNE ──────────────────────────────────────────────────────
          L'image ne porte aucun mot : le jeu existe en deux langues, et un
          texte peint dans un fichier ne se traduit jamais. Le titre est écrit
          par-dessus, dans la police du jeu. */}
      <div className="relative">
        <SafeImg src="/assets/boutique-enseigne.webp" alt="" priority
          className="w-full h-24 object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10"
          style={{ background: 'linear-gradient(180deg, rgba(26,18,12,0.10) 0%, rgba(26,18,12,0.55) 100%)' }}>
          <h1 className="text-2xl font-bold tracking-wide text-[#FBF6F0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {tr('LE MARCHÉ NOIR', 'THE BLACK MARKET')}
          </h1>
          <p className="text-[11px] text-[#E8DCC8] mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
            {tr('Deux choses à vendre. Prenez, ou passez votre chemin.',
                'Two things for sale. Take them, or move along.')}
          </p>
        </div>
        <button
          onClick={() => { playBack(); dispatch({ type: 'SET_SCREEN', screen: char ? 'main' : 'title' }); }}
          className="absolute left-3 top-3 w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-[#FBF6F0]/85 text-[#3A2A1E] active:scale-95"
          aria-label={tr('Retour', 'Back')}
        >
          ←
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* ── LE VENDEUR ────────────────────────────────────────────────────
            Un visage vend mieux qu'un étal, et le regard caméra est tout le
            levier : on n'achète pas à un comptoir, on achète à quelqu'un. */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <SafeImg src="/assets/boutique-vendeur.webp" alt=""
            className="w-16 h-16 rounded-xl object-cover shadow-[0_3px_10px_rgba(0,0,0,0.16)] shrink-0" />
          <p className="text-xs text-[#6B5740] leading-relaxed italic">
            {tr('« Tout est d\'occasion, ici. Sauf ce que je vends : ça, c\'est pour toujours. »',
                '"Everything here is second-hand. Except what I sell. That\'s for good."')}
          </p>
        </motion.div>

        {/* ── LE CADEAU DU VENDEUR ──────────────────────────────────────────
            Il n'a pas de bouton, pas de prix, et ne renvoie vers rien. Un
            présent assorti d'une offre n'est pas un présent. */}
        {cadeau && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="craft-card p-3 flex items-center gap-3"
          >
            <div className="rounded-xl overflow-hidden shadow-sm shrink-0">
              <CardboardAvatar
                seed={char?.seed ?? 'apercu'}
                gender={char?.gender}
                size={44}
                accessories={{ neck: CADEAU }}
                jauges={{ health: 100, mental: 100, hunger: 100, thirst: 100, sleep: 100 }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2A1F1A] leading-tight">
                {tr('« Tenez. C\'est la maison. »', '"Here. On the house."')}
              </p>
              <p className="text-[11px] text-[#8B6B4A] leading-snug mt-0.5">
                {tr('Un jeton du marché, à votre cou. Il est dans la garde-robe.',
                    'A market token, round your neck. It\'s in the wardrobe.')}
              </p>
            </div>
          </motion.div>
        )}

        {/*
          LES TROIS TUILES, RENDUES DANS L'ORDRE DÉCIDÉ PLUS HAUT.

          Elles étaient écrites en dur les unes sous les autres. Les sortir en
          variables était la seule façon de changer l'ordre sans dupliquer deux
          cents lignes, et donc sans qu'une retouche finisse un jour appliquée
          à une seule des deux copies.

          La première de la liste porte le bouton de tête. Ce n'est pas
          toujours le lot : ça dépend d'où l'on vient.
        */}
        {ordre.map((quoi, rang) => {
          const tete = rang === 0;
          const delai = rang * 0.05;

          // ── LE LOT ─────────────────────────────────────────────────────────
          if (quoi === 'pack') {
            if (!pack) return null;
            return (
              <motion.section
                key="pack"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delai }}
                className="relative rounded-2xl p-3.5 overflow-hidden"
                style={{ background: '#C9A97E', boxShadow: '0 4px 16px rgba(58,42,30,0.22)' }}
              >
                <RubanAngle>{tr('LES DEUX', 'BOTH')}</RubanAngle>
                <Scotch cote="gauche" />

                <SafeImg src="/assets/boutique-lot.webp" alt=""
                  className="w-full h-24 object-cover rounded-xl mb-2.5" />

                <h2 className="text-lg font-bold text-[#2A1F1A]">{tr('TOUT LE CARTON', 'THE WHOLE BOX')}</h2>
                <p className="text-xs text-[#4A3728] mb-2">{tr('La paix, et une tête à vous.', 'Peace, and a face of your own.')}</p>

                {/*
                  LE PRIX BARRÉ N'EST PAS UNE FAUSSE PROMOTION.
                  C'est le total EXACT des deux pièces vendues à côté, au même
                  instant, donc un prix réellement pratiqué, ce qu'exige
                  l'article L.112-1-1. Il se calcule, et il disparaît quand le
                  magasin n'a pas répondu : mieux vaut ne rien barrer que
                  barrer un montant inventé.

                  Il ne s'affiche que COMPLET. `totalBarre` rend `null` sur le
                  web ou pendant la première seconde, et l'étiquette seule
                  renverrait alors vers quelque chose d'absent.
                */}
                {barre ? (
                  <div className="flex items-baseline gap-3 mb-2.5">
                    <span className="relative inline-block text-sm font-mono text-[#6B5740]">
                      {barre}
                      <Barre />
                    </span>
                    <Etiquette>{prixAffiche('pack_complet')}</Etiquette>
                  </div>
                ) : (
                  /* Sans barré, l'argument du lot doit être dit en toutes
                     lettres, sinon plus rien ne le distingue d'une troisième
                     offre posée là. */
                  <p className="text-xs text-[#4A3728] mb-2.5">
                    ✦ {tr('Moins cher que les deux séparément.', 'Cheaper than the two apart.')}
                  </p>
                )}

                <BoutonAchat
                  libelle={tr('JE PRENDS TOUT', 'I\'LL TAKE IT ALL')}
                  prix={prixAffiche('pack_complet')}
                  occupe={occupe === 'pack'}
                  onClick={() => acheter('pack')}
                  tete={tete}
                />
                {barre && (
                  <p className="mt-2 text-[10px] leading-snug text-[#5E4A38]">
                    {tr('Le prix barré, c\'est le total des deux pièces vendues à part. On ne vous invente pas de réduction.',
                        'The struck-out price is the total of the two items sold separately. We don\'t make up discounts.')}
                  </p>
                )}
              </motion.section>
            );
          }

          // ── L'ATELIER ──────────────────────────────────────────────────────
          // L'argument de tête n'est pas cosmétique : deux traits CHOISIS. On
          // paie plus volontiers pour décider que pour décorer.
          if (quoi === 'atelier') {
            return (
              <motion.section
                key="atelier"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delai }}
                className="craft-card p-3.5"
              >
                {atelier ? (
                  <DejaPaye titre={tr('🎨 L\'Atelier', '🎨 The Workshop')} />
                ) : (
                  <>
                    <div className="flex gap-3 mb-2.5">
                      <SafeImg src="/assets/boutique-atelier.webp" alt=""
                        className="w-24 h-20 object-cover rounded-xl shrink-0" />
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-[#2A1F1A] leading-tight">{tr('L\'ATELIER', 'THE WORKSHOP')}</h2>
                        <p className="text-xs text-[#6B5740] leading-snug mt-0.5">
                          {tr('On ne choisit pas où on tombe. On peut choisir avec quoi.',
                              'You don\'t choose where you land. You can choose what with.')}
                        </p>
                        {/*
                          LE VISAGE VIVANT, ET PAS UNE ILLUSTRATION. C'est la
                          tête du personnage en cours, dessinée à l'instant.
                          Une image de catalogue contredirait la promesse
                          (« votre tête, pas celle du tirage »).

                          ET QUAND UNE TÊTE SÈCHE SUR L'ÉTABLI, C'EST ELLE
                          qu'on montre : celle que le joueur a faite, et qu'il
                          n'a pas eue.
                        */}
                        {etabli ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="rounded-lg overflow-hidden shadow-sm shrink-0">
                              <CardboardAvatar
                                seed={etabli.seed}
                                gender={etabli.genre}
                                size={34}
                                visage={etabli.visage}
                                jauges={{ health: 100, mental: 100, hunger: 100, thirst: 100, sleep: 100 }}
                              />
                            </div>
                            <span className="text-[10px] text-[#A08B70] leading-tight">
                              {tr('Celle-ci, c\'est vous qui l\'avez faite. Elle sèche encore.',
                                  'This one you made yourself. It\'s still drying.')}
                            </span>
                          </div>
                        ) : char && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="rounded-lg overflow-hidden shadow-sm shrink-0">
                              <PlayerFace char={char} size={34} />
                            </div>
                            <span className="text-[10px] text-[#A08B70] leading-tight">
                              {tr('Celle-ci, c\'est la rue qui l\'a faite.', 'This one, the street made.')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="text-xs text-[#4A3728] space-y-0.5 mb-2.5">
                      <li>🎯 {tr('Deux traits choisis, pas subis.', 'Two traits chosen, not dealt.')}</li>
                      <li>🪪 {tr('Votre tête. Pas celle du tirage.', 'Your face. Not the draw\'s.')}</li>
                      <li>⚰️ {tr('Ça survit à vos morts. Le personnage, non.', 'It outlives your deaths. The character doesn\'t.')}</li>
                    </ul>

                    <LigneDuCimetiere morts={morts} />

                    <BoutonAchat
                      libelle={tr('ME FAIRE UNE TÊTE', 'GIVE ME A FACE')}
                      prix={prixAffiche('atelier')}
                      occupe={occupe === 'atelier'}
                      onClick={() => acheter('atelier')}
                      tete={tete}
                    />
                  </>
                )}
              </motion.section>
            );
          }

          // ── LA PAIX ────────────────────────────────────────────────────────
          // Ton FROID, volontairement : les deux autres tuiles vendent de
          // l'identité, celle-ci vend un outil. Sans cette séparation, trois
          // offres se lisent comme trois cartes interchangeables.
          //
          // Et le titre ne dit pas ce qu'on RETIRE : « Sans pub » vend une
          // absence, « La paix » vend un état.
          return (
            <motion.section
              key="paix"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delai }}
              className="rounded-2xl p-3.5"
              style={{ background: '#EDE9F7', boxShadow: '0 3px 12px rgba(90,74,187,0.14)' }}
            >
              {noAds ? (
                <DejaPaye titre={tr('🕯️ La paix', '🕯️ Peace')} />
              ) : (
                <>
                  <SafeImg src="/assets/boutique-paix.webp" alt=""
                    className="w-full h-24 object-cover rounded-xl mb-2.5" />
                  <h2 className="text-lg font-bold text-[#2A1F1A]">{tr('LA PAIX', 'PEACE')}</h2>
                  <p className="text-xs text-[#5A4ABB] mb-2">
                    {tr('Tout le monde vous prend quelque chose. Eux aussi.',
                        'Everyone takes something from you. Them too.')}
                  </p>
                  <ul className="text-xs text-[#4A3728] space-y-0.5 mb-2.5">
                    <li>🚫 {tr('Plus rien qui se met en travers.', 'Nothing gets in the way any more.')}</li>
                    {/* Tout le bénéfice ADDITIF du produit, sans nommer une
                        seule pièce du moteur. Le joueur n'achète pas un
                        système. */}
                    <li>✨ {tr('Les coups de main viennent tout seuls.', 'The helping hands come on their own.')}</li>
                  </ul>
                  <BoutonAchat
                    libelle={tr('QU\'ON ME FICHE LA PAIX', 'LEAVE ME ALONE')}
                    prix={prixAffiche('noads')}
                    occupe={occupe === 'noads'}
                    onClick={() => acheter('noads')}
                    tete={tete}
                  />
                </>
              )}
            </motion.section>
          );
        })}

        {/* Les conditions de la maison n'ont plus rien à rassurer quand tout
            est déjà payé : elles ne s'adressent qu'à qui hésite encore. */}
        {!(noAds && atelier) && <Objections />}

        {/* ── LA RESTAURATION ───────────────────────────────────────────────
            Texte seul, gris, jamais mise en avant, et jamais cachée non plus :
            c'est le bouton que cherche quelqu'un qui vient de changer de
            téléphone, et c'est celui que cherche l'examinateur de Google.

            « Restaurer mes achats » est le vocabulaire de l'éditeur. La phrase
            ci-dessous est celle que le joueur a dans la tête. */}
        <button
          onClick={async () => {
            if (restaurant) return;
            playToggle();
            setRestaurant(true);
            const r = await restaurerAchats();
            setRestaurant(false);
            setNoAds(isAdsRemoved());
            setAtelier(isAtelierOwned());
            setPack(packUtile());
            pushToast(
              r.retrouve
                ? tr('Retrouvé. C\'est à vous.', 'Found it. It\'s yours.')
                : r.indisponible
                  ? tr('Impossible de vérifier pour l\'instant.', 'Can\'t check right now.')
                  : tr('Rien à retrouver sur ce compte.', 'Nothing to restore on this account.'),
              { emoji: r.retrouve ? '✅' : 'ℹ️', tone: r.retrouve ? 'good' : 'info' },
            );
          }}
          disabled={restaurant}
          className="text-xs text-[#8B6B4A] underline underline-offset-2 disabled:opacity-60 py-2"
        >
          ♻️ {restaurant ? tr('Vérification…', 'Checking…') : tr('J\'ai déjà payé, sur un autre téléphone', 'I already paid, on another phone')}
        </button>
      </div>

      {/* ── LE REÇU ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {recu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1A120C]/70 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -8, y: 20 }}
              animate={{ scale: 1, rotate: -3, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="text-center"
            >
              <SafeImg src="/assets/boutique-recu.webp" alt=""
                className="w-56 h-56 object-cover rounded-2xl shadow-2xl" />
              <p className="mt-3 text-base font-bold text-[#FBF6F0]">{tr('C\'est à vous.', 'It\'s yours.')}</p>
              {/* La livraison de l'établi se dit, sinon elle passe inaperçue :
                  le joueur a payé une tête, il doit savoir qu'il l'a. */}
              {rendu && (
                <p className="mt-1 text-xs text-[#E8DCC8]">
                  {char?.gender === 'f'
                    ? tr('Elle est sortie de l\'établi. Elle vous attend dehors.',
                         'She\'s off the bench. Waiting for you outside.')
                    : tr('Il est sorti de l\'établi. Il vous attend dehors.',
                         'He\'s off the bench. Waiting for you outside.')}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
