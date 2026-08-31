/*
 * L'ATELIER — composer un visage et choisir ses deux traits.
 *
 * Il se pose PAR-DESSUS l'écran de choix, sur le candidat qu'on vient de
 * retenir, plutôt que d'être un écran séparé avant lui. La raison est simple :
 * on ne compose pas une tête dans le vide, on retouche quelqu'un. Le portrait
 * du candidat est déjà là, avec son nom et son métier, et chaque réglage se
 * voit immédiatement dessus.
 *
 * DEUX PARTIES, ET ELLES NE SE VALENT PAS.
 *
 *   · LE VISAGE est purement cosmétique. On peut tout laisser au hasard :
 *     chaque trait non choisi reste dérivé de la graine, donc « ne rien
 *     toucher » donne exactement le personnage tiré au sort.
 *   · LES TRAITS touchent au jeu. On en choisit EXACTEMENT deux, comme le jeu
 *     en donne deux à tout le monde — l'Atelier ouvre lesquels, jamais combien.
 *
 * Rien n'est appliqué tant qu'on n'a pas validé : la croix rend le candidat
 * intact, et c'est ce qui permet d'essayer sans s'engager.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * L'ESSAI LIBRE, ET POURQUOI IL EST ANNONCÉ
 *
 * L'écran ne s'ouvrait pas sans l'achat : le joueur ne voyait jamais ce qu'il
 * n'avait pas. On lui vendait donc une fonctionnalité décrite par trois puces.
 *
 * Il compose maintenant d'abord, et le paiement tombe au moment de VALIDER. À
 * cet instant on ne lui vend plus une fonctionnalité, on lui vend CE
 * PERSONNAGE-LÀ, celui qu'il vient de fabriquer et qui le regarde depuis
 * l'écran. On surévalue nettement ce qu'on a assemblé soi-même, et ça ne se
 * déclenche que par le faire.
 *
 * MAIS C'EST ÉCRIT DÈS L'OUVERTURE. Un péage qui tombe à la fin sans prévenir
 * se lit comme un traquenard : quarante secondes de composition, et la
 * découverte qu'on vous a fait perdre votre temps. Pour un jeu dont tout le
 * ton repose sur « on ne vous ment pas », ce serait cher payé — et le bandeau
 * n'enlève rien au levier, puisqu'on compose quand même.
 *
 * Le bouton dit aussi ce qui va se passer : « Le prendre — 4,99 € », pas
 * « Commencer ». Un bouton qui annonce autre chose que ce qu'il fait est la
 * définition du piège, quelle que soit la note en petit.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character, Trait } from '@/contexts/types';
import { TRAITS, nomMetier } from '@/contexts/GameContext';
import CardboardAvatar, { SKIN, HAIR, BG, HAT_COLORS } from './CardboardAvatar';
import { traitsPour, nbChoix, nomValeur, type Visage } from '@/lib/visage';
import { playCard, playClick, playObjetEquipe, playToggle } from '@/lib/sound';
import { tc, tr, useLang } from '@/lib/lang';
import { prixAffiche } from '@/lib/facturation';

export default function AtelierOverlay({ char, essai = false, onAnnuler, onValider }: {
  char: Character;
  /** L'Atelier n'est pas acheté : on compose, et on paie à la validation. */
  essai?: boolean;
  onAnnuler: () => void;
  onValider: (visage: Visage, traits: [Trait, Trait]) => void;
}) {
  const en = useLang() === 'en';
  const [visage, setVisage] = useState<Visage>({});
  // On part des traits du candidat : ne rien changer donne le personnage tel
  // qu'il s'est présenté, ce qui doit rester un choix possible et gratuit.
  const [choisis, setChoisis] = useState<string[]>(char.traits.map(t => t.id));
  const [onglet, setOnglet] = useState<'visage' | 'traits'>('visage');

  const traits = traitsPour(char.gender);

  const regler = (cle: string, v: number) => {
    playClick();
    setVisage(prev => ({ ...prev, [cle]: v }));
  };

  /*
   * EXACTEMENT DEUX, ET LE PLUS ANCIEN CÈDE LA PLACE.
   *
   * Obliger à décocher avant de cocher est la façon la plus sûre de faire
   * abandonner quelqu'un devant quarante et un traits. On garde donc toujours
   * deux cases pleines : choisir un troisième pousse le premier dehors.
   */
  const basculer = (id: string) => {
    setChoisis(prev => {
      if (prev.includes(id)) { playToggle(); return prev; }   // déjà pris : on n'en retire pas
      playObjetEquipe();
      return [prev[1], id];
    });
  };

  const valider = () => {
    const paire = choisis
      .map(id => TRAITS.find(t => t.id === id))
      .filter((t): t is Trait => !!t);
    if (paire.length !== 2) return;
    playCard();
    onValider(visage, [paire[0], paire[1]]);
  };

  // Aperçu vivant : le portrait se redessine à chaque réglage.
  const apercu = (
    <CardboardAvatar
      seed={char.seed}
      gender={char.gender}
      size={112}
      visage={visage}
      /*
       * L'aperçu reste au repos : on compose un visage, pas un malade. Les
       * cinq jauges au maximum plutôt qu'une moyenne à 1 — même intention,
       * mais elle passe désormais par le même chemin que le vrai portrait.
       */
      jauges={{ health: 100, mental: 100, hunger: 100, thirst: 100, sleep: 100 }}
      dignity={char.stats.dignity}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      /*
       * AU-DESSUS DU CARTON DU MATIN (z-75), et c'est délibéré.
       *
       * Le carton quotidien passe volontairement par-dessus tout, y compris
       * l'écran-titre : c'est un rendez-vous, pas une notification. Mais il
       * tombait aussi par-dessus l'Atelier, en plein milieu d'une composition
       * — le joueur voyait sa retouche disparaître derrière un cadeau.
       *
       * L'Atelier est une tâche que le joueur a ouverte lui-même : il passe
       * donc devant, et le carton l'attend en dessous. Il sera vu à la
       * validation, sans avoir rien interrompu.
       */
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: 'rgba(42,31,26,0.72)' }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card m-3 p-4 flex flex-col gap-3 overflow-hidden max-h-[92vh]"
      >
        {/* Le portrait, et le nom de celui qu'on retouche */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl overflow-hidden shadow-sm shrink-0">{apercu}</div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#2A1F1A] truncate">{char.name}</h2>
            <p className="text-xs text-[#8B6B4A]">{char.job.emoji} {tc(nomMetier(char.job, char.gender))}</p>
            <p className="text-[11px] text-[#A08B70] mt-1 leading-snug">
              {tr('Ce que vous ne touchez pas reste tiré au sort.',
                  'Anything you leave alone stays randomly drawn.')}
            </p>
          </div>
          <button
            onClick={onAnnuler}
            className="ml-auto self-start action-btn w-9 h-9 flex items-center justify-center text-lg shrink-0"
            aria-label={tr('Fermer l\'atelier', 'Close the workshop')}
          >
            ✕
          </button>
        </div>

        {/* Deux onglets : la tête, puis ce qu'il a dans le ventre */}
        <div className="flex gap-2">
          {(['visage', 'traits'] as const).map(o => (
            <button
              key={o}
              onClick={() => { playToggle(); setOnglet(o); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                onglet === o ? 'btn-primary' : 'action-btn text-[#6B5740]'
              }`}
            >
              {o === 'visage' ? tr('🎨 Visage', '🎨 Face') : tr('🎭 Traits', '🎭 Traits')}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex flex-col gap-3 pr-0.5" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {onglet === 'visage' ? (
              <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-3">
                {traits.map(t => {
                  const n = nbChoix(t);
                  const actuel = visage[t.cle];
                  // La pastille montre la VRAIE couleur, prise dans la palette
                  // que le dessin utilise. Une copie locale dériverait le jour
                  // où l'une des deux bouge.
                  const palette = t.palette === 'skin' ? SKIN
                    : t.palette === 'hair' ? HAIR
                    : t.palette === 'hat' ? HAT_COLORS
                    : t.palette === 'bg' ? BG : null;
                  return (
                    <div key={t.cle}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-semibold text-[#2A1F1A]">{en ? t.en : t.fr}</span>
                        {actuel === undefined && (
                          <span className="text-[10px] text-[#A08B70]">{tr('au hasard', 'random')}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: n }, (_, v) => palette ? (
                          <button
                            key={v}
                            onClick={() => regler(t.cle, v)}
                            aria-label={`${en ? t.en : t.fr} ${v + 1}`}
                            className={`w-9 h-9 rounded-lg transition-all ${
                              actuel === v ? 'ring-2 ring-offset-2 ring-[#B8860B]' : ''
                            }`}
                            style={{ background: palette[v], border: '1px solid rgba(58,42,30,0.35)' }}
                          />
                        ) : (
                          <button
                            key={v}
                            onClick={() => regler(t.cle, v)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              actuel === v
                                ? 'btn-primary'
                                : 'action-btn text-[#6B5740]'
                            }`}
                          >
                            {nomValeur(t, v, en)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-2">
                <p className="text-xs text-[#8B6B4A] leading-snug">
                  {tr('Deux traits, comme tout le monde. Toucher un troisième remplace le plus ancien.',
                      'Two traits, like everyone else. Tapping a third replaces the oldest.')}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {TRAITS.map(t => {
                    const pris = choisis.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => basculer(t.id)}
                        className={`craft-card p-2 flex items-start gap-2 text-left transition-all ${
                          pris ? 'ring-2 ring-[#B8860B] bg-[#B8860B]/5' : 'active:scale-[0.99]'
                        }`}
                      >
                        <span className="text-xl leading-none mt-0.5">{t.emoji}</span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-[#2A1F1A]">
                            {t.name}
                            {!t.positive && (
                              <span className="ml-1.5 text-[10px] font-normal text-[#B84A3A]">
                                {tr('handicap', 'drawback')}
                              </span>
                            )}
                          </span>
                          <span className="block text-[11px] text-[#6B5740] leading-snug">{t.description}</span>
                        </span>
                        {pris && <span className="ml-auto text-[#B8860B] text-sm shrink-0">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {essai && (
          /*
           * Posé JUSTE au-dessus du bouton, pas en tête d'écran : c'est là
           * qu'on regarde au moment de décider, et une mention lue au début
           * puis oubliée ne prévient personne.
           */
          <p className="text-[11px] text-[#8B6B4A] text-center leading-snug shrink-0 -mb-1">
            {tr('Essai libre. L\'Atelier se paie au moment de valider — et ce visage-ci vous attend.',
                'Free trial. The Workshop is paid for on validation — and this face is waiting for you.')}
          </p>
        )}
        <button
          onClick={valider}
          className={`w-full py-3 font-semibold shrink-0 rounded-xl ${essai ? 'text-[#2A1F1A]' : 'btn-primary'}`}
          style={essai ? { background: '#F2E14C', boxShadow: '0 3px 0 #C9B62A' } : undefined}
        >
          {essai
            ? `${tr('Le prendre', 'Take this one')} — ${prixAffiche('atelier')}`
            /* L'accord suit le personnage : « c'est lui » sur Simone se voit. */
            : char.gender === 'f'
              ? tr('C\'est elle. Commencer.', 'That\'s her. Start.')
              : tr('C\'est lui. Commencer.', 'That\'s him. Start.')}
        </button>
      </motion.div>
    </motion.div>
  );
}
