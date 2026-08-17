/*
 * LE BANC D'ESSAI AUDIO.
 *
 * Quarante-neuf sons se rencontrent en jouant, mais pas en une session : la
 * mort du personnage, le sacre, le palier de Dignité franchi, la fin inédite
 * arrivent une fois par partie ou jamais. Un testeur qui joue une heure en
 * entend peut-être la moitié.
 *
 * Cet écran les rend tous atteignables, et surtout il rend l'avis RENVOYABLE.
 * Trois choses le distinguent d'un simple jukebox :
 *
 *   1. CHAQUE SON DIT SON INTENTION ET SON MOMENT. « J'aime / j'aime pas » ne
 *      sert à rien ; « ça ressemble à un coup alors que c'est censé être du
 *      frottement » se corrige.
 *   2. LA RÈGLE DE LA FAMILLE EST ÉCRITE. C'est elle qu'on demande de juger,
 *      pas le son isolé : un bruitage peut être joli et faux.
 *   3. LE VERDICT SE RECOPIE. Un testeur qui signale six sons doit pouvoir
 *      nous envoyer la liste sans la retaper.
 *
 * Les avis sont gardés en local : un testeur peut y revenir en plusieurs fois.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { useLang, tr } from '@/lib/lang';
import { CATALOGUE_SONS, compterFichiers, type SonDuCatalogue } from '@/lib/catalogueSons';
import { playFile } from '@/lib/audioFiles';
import { isMuted, playBack, playTab, playUnlock, setMuted } from '@/lib/sound';
import { pushToast } from '@/lib/toast';
import { haptic } from '@/lib/haptics';

const CLE_AVIS = 'roi-du-carton-avis-audio';

type Avis = Record<string, 'bon' | 'revoir'>;

function chargerAvis(): Avis {
  try { return JSON.parse(localStorage.getItem(CLE_AVIS) || '{}'); } catch { return {}; }
}
function garderAvis(a: Avis): void {
  try { localStorage.setItem(CLE_AVIS, JSON.stringify(a)); } catch { /* silent */ }
}

export default function AudioTestScreen() {
  const { dispatch } = useGame();
  useLang();
  const [avis, setAvis] = useState<Avis>(chargerAvis);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [ouverte, setOuverte] = useState<string | null>(CATALOGUE_SONS[0].id);
  const minuteur = useRef<number | null>(null);

  /*
   * Un banc d'essai en sourdine ne joue rien et n'explique pas pourquoi. On
   * lève la sourdine à l'entrée, et on la remet en sortant si elle y était :
   * le testeur retrouve son réglage.
   */
  const etaitMuet = useRef(isMuted());
  useEffect(() => {
    if (etaitMuet.current) setMuted(false);
    return () => { if (etaitMuet.current) setMuted(true); };
  }, []);

  useEffect(() => () => { if (minuteur.current) clearTimeout(minuteur.current); }, []);

  const total = useMemo(() => compterFichiers(), []);
  const juges = Object.keys(avis).length;
  const aRevoir = Object.entries(avis).filter(([, v]) => v === 'revoir').map(([k]) => k);

  function jouer(son: SonDuCatalogue, prise?: number) {
    const nom = prise ? `${son.fichier}-${prise}` : son.fichier;
    setEnCours(nom);
    haptic('light');
    playFile(`/audio/${nom}.mp3`, 0.9).then(ok => {
      if (!ok) pushToast(tr(`Fichier introuvable : ${nom}.mp3`, `Missing file: ${nom}.mp3`), { emoji: '⚠️', tone: 'bad' });
    });
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = window.setTimeout(() => setEnCours(null), 900);
  }

  /** Toute la famille, dans l'ordre — c'est comme ça qu'on juge une échelle. */
  function jouerFamille(sons: SonDuCatalogue[]) {
    haptic('medium');
    sons.forEach((s, i) => {
      window.setTimeout(() => jouer(s, s.prises ? 1 : undefined), i * 1100);
    });
  }

  function noter(fichier: string, verdict: 'bon' | 'revoir') {
    playTab();
    setAvis(cur => {
      const next = { ...cur };
      if (next[fichier] === verdict) delete next[fichier];
      else next[fichier] = verdict;
      garderAvis(next);
      return next;
    });
    haptic('light');
  }

  /** Le verdict, en texte brut, prêt à coller dans un message. */
  function copierVerdict() {
    playUnlock();
    const lignes: string[] = [
      tr('Avis audio — Le Roi du Carton', 'Audio feedback — King of Cardboard'),
      tr(`${juges} son(s) jugé(s) sur ${CATALOGUE_SONS.reduce((t, f) => t + f.sons.length, 0)}.`,
         `${juges} sound(s) judged out of ${CATALOGUE_SONS.reduce((t, f) => t + f.sons.length, 0)}.`),
      '',
    ];
    if (aRevoir.length === 0) {
      lignes.push(tr('Aucun son à revoir.', 'No sounds flagged.'));
    } else {
      lignes.push(tr('À REVOIR :', 'TO REDO:'));
      for (const famille of CATALOGUE_SONS) {
        const dedans = famille.sons.filter(s => avis[s.fichier] === 'revoir');
        if (!dedans.length) continue;
        lignes.push(`  ${tr(famille.titreFr, famille.titreEn)}`);
        for (const s of dedans) lignes.push(`    · ${s.fichier} — ${tr(s.fr, s.en)}`);
      }
    }
    const texte = lignes.join('\n');
    navigator.clipboard?.writeText(texte)
      .then(() => pushToast(tr('Avis copié. Colle-le dans ton message.', 'Feedback copied. Paste it in your message.'), { emoji: '📋', tone: 'good' }))
      .catch(() => pushToast(tr('Copie impossible sur cet appareil.', 'Copy failed on this device.'), { emoji: '⚠️', tone: 'bad' }));
  }

  return (
    <div className="min-h-screen bg-texture p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { playBack(); dispatch({ type: 'SET_SCREEN', screen: 'settings' }); }}
          className="action-btn w-10 h-10 flex items-center justify-center text-lg"
          aria-label={tr('Retour', 'Back')}
        >
          ←
        </button>
        <h1 className="text-2xl text-[#2A1F1A]">{tr('Banc d’essai audio', 'Audio test bench')}</h1>
      </div>

      {/* La consigne. Sans elle, tout le monde teste au casque et rate la
          moitié des défauts. */}
      <div className="craft-card p-4 flex flex-col gap-2">
        <p className="text-sm text-[#2A1F1A] leading-relaxed">
          {tr(
            'Écoutez sur le haut-parleur du téléphone, pas au casque : c’est là que le jeu sera joué, et la moitié des défauts ne s’entendent que là.',
            'Listen on the phone speaker, not headphones: that is where the game will be played, and half the flaws only show up there.',
          )}
        </p>
        <p className="text-xs text-[#8B6B4A] leading-relaxed">
          {tr(
            `Chaque famille suit une règle, écrite en tête. Jugez le son sur cette règle, pas sur « joli / pas joli » : un bruitage peut être réussi et faux. ${total} fichiers en tout.`,
            `Each family follows a rule, written at the top. Judge the sound against that rule, not on “nice / not nice”: a sound can be well made and wrong. ${total} files in total.`,
          )}
        </p>
      </div>

      {/* L'avancement, et de quoi renvoyer le verdict. */}
      <div className="craft-card p-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#2A1F1A] tabular-nums">
            {juges} / {CATALOGUE_SONS.reduce((t, f) => t + f.sons.length, 0)}
          </span>
          <span className="text-xs text-[#8B6B4A]">
            {aRevoir.length > 0
              ? tr(`${aRevoir.length} à revoir`, `${aRevoir.length} flagged`)
              : tr('sons jugés', 'sounds judged')}
          </span>
        </div>
        <button
          onClick={copierVerdict}
          disabled={juges === 0}
          className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #D4874D, #9B5B3A)' }}
        >
          {tr('Copier mon avis', 'Copy my feedback')}
        </button>
      </div>

      {CATALOGUE_SONS.map(famille => {
        const deplie = ouverte === famille.id;
        const notesFamille = famille.sons.filter(s => avis[s.fichier]).length;
        return (
          <div key={famille.id} className="craft-card overflow-hidden">
            <button
              onClick={() => { playTab(); setOuverte(deplie ? null : famille.id); }}
              className="w-full p-4 flex items-center justify-between gap-3 text-left"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-[#2A1F1A]">{tr(famille.titreFr, famille.titreEn)}</span>
                <span className="text-[11px] text-[#8B6B4A] tabular-nums">
                  {famille.sons.length} {tr('sons', 'sounds')} · {notesFamille} {tr('jugés', 'judged')}
                </span>
              </div>
              <span className="text-[#8B6B4A] text-sm">{deplie ? '▾' : '▸'}</span>
            </button>

            {deplie && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4 flex flex-col gap-3 border-t border-[#E8D5C0] pt-3"
              >
                <p className="text-xs text-[#6B5740] leading-relaxed italic">{tr(famille.regleFr, famille.regleEn)}</p>
                <button
                  data-sans-son
                  onClick={() => jouerFamille(famille.sons)}
                  className="self-start text-xs font-semibold text-[#9B5B3A] underline underline-offset-2"
                >
                  {tr('▶ Écouter la famille dans l’ordre', '▶ Play the family in order')}
                </button>

                {famille.sons.map(son => {
                  const verdict = avis[son.fichier];
                  return (
                    <div key={son.fichier} className="flex flex-col gap-2 rounded-xl bg-[#FBF6EE] p-3 border border-[#E8D5C0]">
                      <div className="flex items-start gap-3">
                        <button
                          data-sans-son
                          onClick={() => jouer(son, son.prises ? 1 : undefined)}
                          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white text-base"
                          style={{
                            background: enCours?.startsWith(son.fichier)
                              ? 'linear-gradient(135deg, #4A9B5F, #3d8b4f)'
                              : 'linear-gradient(135deg, #D4874D, #9B5B3A)',
                          }}
                          aria-label={tr(`Écouter ${son.fichier}`, `Play ${son.fichier}`)}
                        >
                          ▶
                        </button>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-sm font-semibold text-[#2A1F1A] leading-snug">{tr(son.fr, son.en)}</span>
                          <span className="text-[11px] text-[#8B6B4A] leading-snug">{tr(son.quandFr, son.quandEn)}</span>
                          {son.aVerifier && (
                            <span className="text-[11px] text-[#9B5B3A] leading-snug mt-0.5">
                              {tr('⚑ Celui-ci sort du lot à la mesure — dites-nous s’il vous paraît trop faible.',
                                  '⚑ This one measures out of line — tell us if it sounds too quiet to you.')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Les prises multiples : c'est leur DIFFÉRENCE qu'on
                          juge, donc on les rend écoutables une à une. */}
                      {son.prises && son.prises > 1 && (
                        <div className="flex items-center gap-2 pl-14">
                          <span className="text-[11px] text-[#8B6B4A]">{tr('Prises', 'Takes')}</span>
                          {Array.from({ length: son.prises }, (_, i) => i + 1).map(n => (
                            <button
                              key={n}
                              data-sans-son
                              onClick={() => jouer(son, n)}
                              className={`w-8 h-8 rounded-lg text-xs font-semibold border ${
                                enCours === `${son.fichier}-${n}`
                                  ? 'bg-[#4A9B5F] text-white border-[#4A9B5F]'
                                  : 'bg-white text-[#8B6B4A] border-[#E8D5C0]'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pl-14">
                        <button
                          onClick={() => noter(son.fichier, 'bon')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                            verdict === 'bon'
                              ? 'bg-[#4A9B5F] text-white border-[#4A9B5F]'
                              : 'bg-white text-[#8B6B4A] border-[#E8D5C0]'
                          }`}
                        >
                          {tr('Ça marche', 'Works')}
                        </button>
                        <button
                          onClick={() => noter(son.fichier, 'revoir')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                            verdict === 'revoir'
                              ? 'bg-[#D94F4F] text-white border-[#D94F4F]'
                              : 'bg-white text-[#8B6B4A] border-[#E8D5C0]'
                          }`}
                        >
                          {tr('À revoir', 'Needs work')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        );
      })}

      <div className="h-4" />
    </div>
  );
}
