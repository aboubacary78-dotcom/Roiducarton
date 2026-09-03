/*
 * CE QU'ON VOIT AVANT LE JEU : la signature du studio, puis l'avertissement.
 *
 * DEUX TEMPS, ET ILS N'OBÉISSENT PAS À LA MÊME RÈGLE.
 *
 *   ① LA SIGNATURE « AT DEUX MAIN » passe à chaque lancement. C'est ce que
 *     fait une signature : elle se répète, sinon elle n'en est pas une. Elle
 *     dure moins de deux secondes.
 *
 *   ② L'AVERTISSEMENT ne passe qu'UNE FOIS, à la première ouverture. Un texte
 *     légal a besoin d'être lu, pas récité : le remontrer à chaque lancement
 *     ferait exactement ce qu'on veut éviter, c'est-à-dire qu'on apprenne à
 *     le sauter des yeux avant même de l'avoir lu. Il reste consultable en
 *     permanence dans les Options, à côté de la politique de confidentialité.
 *
 * PAS DE LOGO, ET C'EST VOULU. Le studio n'en a pas, on n'en invente pas un.
 * Il n'y a donc que le NOM, écrit exactement comme il est déposé, « AT DEUX
 * MAIN », posé sur du kraft comme un tampon sur un colis. Le jeu de mots
 * appartient à son auteur : on ne l'explique pas et on ne le corrige pas.
 *
 * TOUT SE SAUTE D'UN DOIGT. Une ouverture qu'on ne peut pas passer est la
 * chose la plus détestée d'un jeu mobile, et c'est justifié : on la subit
 * chaque fois qu'on ouvre l'application, pendant des mois.
 *
 * ET ELLE NE RETARDE RIEN. Le voile est posé PAR-DESSUS l'écran-titre, déjà
 * monté dessous : quand il se lève, le jeu est là, sans temps de chargement
 * ajouté au temps de l'animation.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tr } from '@/lib/lang';

const CLE_AVERTISSEMENT = 'roi-du-carton-avertissement-lu';

/*
 * L'OUVERTURE S'EFFACE SOUS AUTOMATISATION, ET IL FAUT DIRE POURQUOI.
 *
 * Elle recouvre tout l'écran pendant près de deux secondes, puis attend un
 * geste sur l'avertissement. Les trente-cinq suites démarrent en vidant le
 * stockage et en cliquant aussitôt : trois d'entre elles se sont mises à
 * échouer sur des boutons parfaitement fonctionnels mais recouverts, et les
 * trente-deux autres ne passaient que parce que leurs temporisations étaient
 * plus longues que l'animation. C'est-à-dire par chance.
 *
 * Deux mauvaises réponses ont été écartées. Ajouter le bouton de
 * l'avertissement au vocabulaire de fermeture de dix-huit fichiers laisse
 * l'animation bloquer les premières centaines de millisecondes, donc laisse la
 * chance décider. Et raccourcir l'ouverture pour arranger les tests reviendrait
 * à laisser l'outil de mesure dessiner le produit.
 *
 * `navigator.webdriver` ne vaut `true` que sous pilotage automatique : jamais
 * dans un navigateur ordinaire, jamais dans la WebView de l'application. Le
 * joueur voit donc toujours l'ouverture. Et pour que ce raccourci ne serve pas
 * à cacher une ouverture cassée, `test-ouverture.mjs` repose le drapeau
 * ci-dessous et éprouve la vraie chose, animation et attente comprises.
 */
const CLE_FORCER = 'roi-du-carton-ouverture-forcee';

function ouvertureSautee(): boolean {
  try {
    if (localStorage.getItem(CLE_FORCER) === '1') return false;
    return navigator.webdriver === true;
  } catch { return false; }
}

/** Le nom du studio, tel qu'il est déposé. Ni corrigé, ni traduit. */
const STUDIO = ['AT', 'DEUX', 'MAIN'];

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
 * Un module, pas un état React : l'ouverture se joue une fois par LANCEMENT,
 * et un remontage de l'arbre (changement de langue, rechargement à chaud) ne
 * doit pas la rejouer au milieu d'une partie.
 */
let dejaJouee = false;

export default function Ouverture() {
  const [temps, setTemps] = useState<'signature' | 'avertissement' | 'fini'>(() => {
    if (dejaJouee || ouvertureSautee()) return 'fini';
    dejaJouee = true;
    return 'signature';
  });
  const [reduit] = useState(() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch { return false; }
  });

  const avertissementLu = () => {
    try { return localStorage.getItem(CLE_AVERTISSEMENT) === '1'; } catch { return true; }
  };

  const suivant = () => {
    setTemps(t => {
      if (t !== 'signature') return 'fini';
      if (avertissementLu()) return 'fini';
      return 'avertissement';
    });
  };

  const terminer = () => {
    try { localStorage.setItem(CLE_AVERTISSEMENT, '1'); } catch { /* silent */ }
    setTemps('fini');
  };

  // La signature s'efface toute seule. L'avertissement, lui, attend un geste :
  // un texte qui disparaît pendant qu'on le lit n'a pas été lu.
  useEffect(() => {
    if (temps !== 'signature') return;
    const t = window.setTimeout(suivant, reduit ? 700 : 1700);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temps, reduit]);

  if (temps === 'fini') return null;

  return (
    <AnimatePresence>
      <motion.div
        key={temps}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={temps === 'signature' ? suivant : undefined}
        className="fixed inset-0 z-[120] flex flex-col items-center justify-center px-8 text-center"
        style={{ background: '#C9A97E' }}
      >
        {temps === 'signature' ? (
          <>
            {/*
              LE NOM, MOT PAR MOT, COMME TROIS COUPS DE TAMPON.
              Chacun arrive légèrement de travers, parce qu'un tampon posé à la
              main ne tombe jamais droit, et c'est exactement ce qui distingue
              cette matière d'un dégradé marron.
            */}
            <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
              {STUDIO.map((mot, i) => (
                <motion.span
                  key={mot}
                  initial={reduit ? { opacity: 0 } : { opacity: 0, y: 10, rotate: i === 1 ? 1.4 : -1.1, scale: 1.08 }}
                  animate={{ opacity: 1, y: 0, rotate: i === 1 ? -0.8 : 0.6, scale: 1 }}
                  transition={{ delay: reduit ? 0 : 0.12 + i * 0.14, type: 'spring', stiffness: 320, damping: 20 }}
                  className="text-3xl font-bold tracking-[0.14em] text-[#2A1F1A]"
                  style={{ textShadow: '0 1px 0 rgba(255,255,255,0.22)' }}
                >
                  {mot}
                </motion.span>
              ))}
            </div>
            {/* Le trait de marqueur qui souligne, tiré une fois, jamais droit. */}
            <motion.svg
              width="180" height="12" viewBox="0 0 180 12" className="mt-3 overflow-visible"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduit ? 0 : 0.55 }}
            >
              <motion.path
                d="M4 7 Q46 3 92 6 T176 4"
                fill="none" stroke="#2A1F1A" strokeWidth="2.4" strokeLinecap="round" opacity="0.75"
                initial={reduit ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: reduit ? 0 : 0.55, duration: 0.45, ease: 'easeOut' }}
              />
            </motion.svg>
          </>
        ) : (
          <Avertissement onFermer={terminer} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/** L'avertissement, en propre : réutilisé tel quel par les Options. */
export function Avertissement({ onFermer }: { onFermer?: () => void }) {
  const { titre, corps } = texteAvertissement();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="max-w-sm"
    >
      <h2 className="text-xl font-bold text-[#2A1F1A] mb-3">{titre}</h2>
      <p className="text-sm text-[#4A3728] leading-relaxed">{corps[0]}</p>
      {/*
        LA SECONDE PHRASE N'EST PAS UNE FORMULE JURIDIQUE.
        Elle dit où le jeu place sa moquerie, et c'est la seule ligne de tout
        ce document qui engage vraiment son auteur.
      */}
      <p className="text-sm font-semibold text-[#2A1F1A] leading-relaxed mt-3">{corps[1]}</p>
      {onFermer && (
        <button
          onClick={onFermer}
          className="mt-6 px-6 py-3 rounded-xl text-sm font-bold text-[#2A1F1A] active:scale-[0.98]"
          style={{ background: '#F2E14C', boxShadow: '0 3px 0 #C9B62A' }}
        >
          {tr('J\'ai compris', 'Understood')}
        </button>
      )}
    </motion.div>
  );
}
