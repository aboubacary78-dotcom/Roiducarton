import { useGame, HERITAGE_KITS, JOBS } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLang, tr, tc } from '@/lib/lang';
import CardboardAvatar from './CardboardAvatar';
import { pushToast } from '@/lib/toast';
import { playCoin, playFail } from '@/lib/sound';
import {
  loadGraves, loadKarma, loadHeritage,
  spendKarma, unlockJob, addKit, setGoldenEpitaph,
} from '@/lib/necrology';

/*
 * Le Cimetière des Cartons : toutes les runs passées dressées en tombes de
 * carton — et, au milieu des tombes, L'HÉRITAGE : la petite échoppe où le
 * Karma de Rue s'échange contre des débloquages LATÉRAUX (métiers en plus
 * dans le tirage, kits de départ, vanités). Jamais de puissance brute :
 * la rue reste dure, on élargit le jeu, on ne l'adoucit pas.
 */

export default function CimetiereScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const [, refresh] = useState(0);
  const karma = loadKarma();
  const heritage = loadHeritage();
  const graves = loadGraves();
  const lockedJobs = JOBS.filter(j => j.locked);

  const back = () => {
    const target = state.character && !state.character.alive ? 'game-over' : 'title';
    dispatch({ type: 'SET_SCREEN', screen: target });
  };

  function buy(cost: number, apply: () => void, label: string) {
    if (!spendKarma(cost)) {
      playFail();
      pushToast(tr('Pas assez de Karma de Rue.', 'Not enough Street Karma.'), { emoji: '👑', tone: 'bad' });
      return;
    }
    apply();
    playCoin();
    pushToast(label, { emoji: '⚰️', tone: 'good' });
    refresh(n => n + 1);
  }

  const kitCount = (id: string) => heritage.kits.filter(k => k === id).length;

  return (
    <div
      className="min-h-screen p-4 flex flex-col gap-3"
      style={{ background: 'linear-gradient(180deg, #22301F 0%, #131C12 100%)' }}
    >
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button onClick={back} className="w-10 h-10 flex items-center justify-center text-lg rounded-xl border border-[#3A4838] text-[#C8D4B8]" aria-label={tr('Retour', 'Back')}>
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-xl text-[#E8EDD8] font-bold leading-tight">⚰️ {tr('Cimetière des Cartons', 'Cardboard Cemetery')}</h1>
          <p className="text-[11px] text-[#8FA080] font-mono">
            {graves.length} {tr(graves.length > 1 ? 'tombes' : 'tombe', graves.length > 1 ? 'graves' : 'grave')} · 👑 {karma} {tr('karma', 'karma')}
          </p>
        </div>
      </div>

      {/* ---- L'HÉRITAGE (boutique du Karma) ---- */}
      <div className="rounded-xl p-3 border border-[#3A4838]" style={{ background: 'linear-gradient(135deg, #2A3826, #1C2818)' }}>
        <p className="text-[10px] tracking-widest uppercase text-[#B8C89B] font-semibold mb-0.5">👑 {tr('L\'Héritage', 'The Heritage')}</p>
        <p className="text-[10px] text-[#8FA080] mb-2.5">
          {tr('Le Karma de vos morts s\'échange ici. Rien qui adoucisse la rue — juste de quoi l\'aborder autrement.', 'Your deaths\' Karma is traded here. Nothing that softens the street — just new ways to face it.')}
        </p>

        {/* Kits consommables */}
        <div className="flex flex-col gap-1.5 mb-2.5">
          {HERITAGE_KITS.map(kit => (
            <div key={kit.id} className="flex items-center gap-2.5 bg-black/25 rounded-lg px-2.5 py-2">
              <span className="text-xl">{kit.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#E8EDD8] capitalize">
                  {tr(kit.name, kit.nameEn)}
                  {kitCount(kit.id) > 0 && <span className="ml-1.5 text-[9px] text-[#F2C14E] font-mono">×{kitCount(kit.id)} {tr('en attente', 'pending')}</span>}
                </p>
                <p className="text-[10px] text-[#8FA080] leading-snug">{tr(kit.desc, kit.descEn)} <em>{tr('(pour le prochain personnage)', '(for your next character)')}</em></p>
              </div>
              <button
                onClick={() => buy(kit.cost, () => addKit(kit.id), tr('Kit réservé au prochain !', 'Kit reserved for the next one!'))}
                className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1C2818] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #F2C14E, #D9A73E)' }}
                disabled={karma < kit.cost}
              >
                {kit.cost} 👑
              </button>
            </div>
          ))}
        </div>

        {/* Métiers à débloquer */}
        <div className="flex flex-col gap-1.5 mb-2.5">
          {lockedJobs.map(job => {
            const owned = heritage.jobs.includes(job.id);
            return (
              <div key={job.id} className="flex items-center gap-2.5 bg-black/25 rounded-lg px-2.5 py-2">
                <span className="text-xl">{job.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#E8EDD8]">{tc(job.name)}</p>
                  <p className="text-[10px] text-[#8FA080] leading-snug">{tc(job.description)} <em>{tr('(rejoint le tirage des personnages)', '(joins the character pool)')}</em></p>
                </div>
                {owned ? (
                  <span className="shrink-0 text-[10px] font-bold text-[#9BC88B]">✓ {tr('Débloqué', 'Unlocked')}</span>
                ) : (
                  <button
                    onClick={() => buy(40, () => unlockJob(job.id), tr(`${job.name} rejoint la rue !`, `${job.name} joins the street!`))}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1C2818] disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #F2C14E, #D9A73E)' }}
                    disabled={karma < 40}
                  >
                    40 👑
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Vanité : l'épitaphe dorée */}
        <div className="flex items-center gap-2.5 bg-black/25 rounded-lg px-2.5 py-2">
          <span className="text-xl">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#E8EDD8]">{tr('L\'Épitaphe Dorée', 'The Golden Epitaph')}</p>
            <p className="text-[10px] text-[#8FA080] leading-snug">
              {tr('Votre PROCHAINE tombe sera dorée. Ça ne sert à rien. C\'est magnifique.', 'Your NEXT grave will be golden. It does nothing. It\'s magnificent.')}
            </p>
          </div>
          {heritage.goldenEpitaph ? (
            <span className="shrink-0 text-[10px] font-bold text-[#F2C14E]">✓ {tr('Réservée', 'Reserved')}</span>
          ) : (
            <button
              onClick={() => buy(25, () => setGoldenEpitaph(true), tr('Votre prochaine tombe brillera.', 'Your next grave will shine.'))}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#1C2818] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #F2C14E, #D9A73E)' }}
              disabled={karma < 25}
            >
              25 👑
            </button>
          )}
        </div>
      </div>

      {/* ---- LES TOMBES ---- */}
      <p className="text-[10px] tracking-widest uppercase text-[#8FA080] font-semibold mt-1">
        🪦 {tr('Ils ont régné avant vous', 'They reigned before you')}
      </p>
      {graves.length === 0 ? (
        <div className="rounded-xl p-6 text-center border border-[#3A4838] bg-black/20">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-[12px] text-[#8FA080]">
            {tr('Personne n\'est encore tombé. Ça viendra — la rue est patiente.', 'Nobody has fallen yet. It\'ll come — the street is patient.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pb-6">
          {graves.map((g, i) => (
            <motion.div
              key={`${g.seed}-${g.at}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: Math.min(0.4, 0.04 * i) }}
              className="rounded-t-[18px] rounded-b-md px-2.5 pt-3 pb-2 text-center border"
              style={{
                background: g.golden
                  ? 'linear-gradient(180deg, #4A3E1E, #33290F)'
                  : 'linear-gradient(180deg, #374230, #242E1E)',
                borderColor: g.golden ? '#F2C14E' : '#4A5844',
                boxShadow: g.golden ? '0 0 14px rgba(242,193,78,0.25)' : undefined,
              }}
            >
              <div className={`w-11 h-11 rounded-full overflow-hidden mx-auto mb-1 border ${g.golden ? 'border-[#F2C14E]' : 'border-[#4A5844]'} grayscale-[45%]`}>
                <CardboardAvatar seed={g.seed} gender={g.gender as 'm' | 'f'} size={44} />
              </div>
              <p className={`text-[12px] font-bold leading-tight ${g.golden ? 'text-[#F2C14E]' : 'text-[#D8E0C8]'}`}>
                {g.golden ? '✨ ' : ''}{g.jobEmoji} {g.name}
              </p>
              <p className="text-[9px] text-[#8FA080] font-mono mb-1">
                {g.day} {tr(g.day > 1 ? 'jours' : 'jour', g.day > 1 ? 'days' : 'day')} {tr('de règne', 'of reign')}
              </p>
              <p className="text-[9px] text-[#7A8A6C] italic leading-snug line-clamp-3">« {g.cause} »</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
