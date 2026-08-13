import { useGame, computeScore, hasTrait, loadHighScores, knownEnemyNames } from '@/contexts/GameContext';
import type { InventoryItem } from '@/contexts/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { showInterstitial, showRewarded } from '@/lib/ads';
import PlayerFace from './PlayerFace';
import KenBurnsImage from './KenBurnsImage';
import { useLang, tr, tc } from '@/lib/lang';
import { DEATH_DEFS, recordDeath, setLegacy, clearLegacy, setCrown, loadDeathBook } from '@/lib/necrology';
import { STREET_TITLES } from '@/contexts/data/progression';
import { getEquipped } from '@/lib/profile';
import { pushToast } from '@/lib/toast';
import { playDeath } from '@/lib/sound';

/*
 * L'écran de fin est une « une de journal » : la mort du personnage devient
 * un fait divers avec gros titre, photo, nécrologie, et surtout la récolte
 * méta : fins découvertes (Registre des Morts), Karma de Rue gagné, et les
 * Dernières Volontés (l'objet légué au prochain personnage).
 */

/*
 * LE « PRESQUE ».
 *
 * Un écran de fin qui ne montre que ce qui a été obtenu se referme. On cherche
 * donc, parmi tout ce qui progresse, ce dont le joueur s'est le plus approché
 * SANS l'atteindre, et on le lui dit. Rien n'est fabriqué : on ne retient que
 * des écarts réels, et on garde le plus petit.
 */
function nearestMiss(day: number, bestDay: number, found: number, total: number): { fr: string; en: string } | null {
  const candidates: { gap: number; fr: string; en: string }[] = [];

  // Le prochain titre de rue.
  const nextTitle = STREET_TITLES.find(t => t.day > day);
  if (nextTitle) {
    const d = nextTitle.day - day;
    candidates.push({
      gap: d,
      fr: `Il vous manquait ${d} jour${d > 1 ? 's' : ''} pour devenir ${nextTitle.fr}.`,
      en: `You were ${d} day${d > 1 ? 's' : ''} short of becoming ${nextTitle.en}.`,
    });
  }

  // Le record personnel, tant qu'il n'est pas battu.
  if (bestDay > day) {
    const d = bestDay - day;
    candidates.push({
      gap: d,
      fr: `Il vous manquait ${d} jour${d > 1 ? 's' : ''} pour battre votre record.`,
      en: `You were ${d} day${d > 1 ? 's' : ''} short of your own record.`,
    });
  }

  // Le prochain palier du Registre (par cinquièmes, puis la complétion).
  if (found < total) {
    const step = Math.ceil(total / 5);
    const next = Math.min(total, (Math.floor(found / step) + 1) * step);
    const d = next - found;
    candidates.push({
      gap: d,
      fr: next >= total
        ? `Il vous manque ${d} fin${d > 1 ? 's' : ''} pour compléter le Registre.`
        : `Il vous manque ${d} fin${d > 1 ? 's' : ''} pour atteindre ${next} sur ${total}.`,
      en: next >= total
        ? `You are ${d} ending${d > 1 ? 's' : ''} from completing the Book.`
        : `You are ${d} ending${d > 1 ? 's' : ''} from reaching ${next} of ${total}.`,
    });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.gap - b.gap);
  return candidates[0];
}

// Gros titre selon la catégorie de mort (l'ennemi a le sien, voir plus bas).
const HEADLINES: Record<string, { fr: string; en: string }> = {
  despair: { fr: 'IL AVAIT TOUT, SAUF LE MORAL', en: 'HE HAD EVERYTHING BUT HOPE' },
  hunger: { fr: 'MORT LE VENTRE VIDE DANS UNE VILLE PLEINE', en: 'STARVED IN A CITY FULL OF FOOD' },
  thirst: { fr: 'ASSOIFFÉ AU PAYS DES FONTAINES', en: 'PARCHED IN THE LAND OF FOUNTAINS' },
  exhaustion: { fr: 'IL VOULAIT JUSTE DORMIR UN PEU', en: 'HE JUST WANTED SOME SLEEP' },
  cold: { fr: 'LA NUIT LA PLUS FROIDE DE L\'ANNÉE', en: 'THE COLDEST NIGHT OF THE YEAR' },
  injury: { fr: 'TROP DE COUPS, PAS ASSEZ DE PANSEMENTS', en: 'TOO MANY BLOWS, TOO FEW BANDAGES' },
};

export default function GameOverScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character;
  const [reviving, setReviving] = useState(false);
  const [deathImgOk, setDeathImgOk] = useState(true);
  const [legacyId, setLegacyId] = useState<string | null>(null);

  // Catégorie de mort → image (diorama) personnalisée. Repli sur le 💀 si le
  // fichier n'existe pas encore.
  const deathCat = state.deathCause ? 'combat'
    : !char ? 'injury'
    : char.stats.mental <= 0 ? 'despair'
    : char.stats.hunger <= 8 ? 'hunger'
    : char.stats.thirst <= 8 ? 'thirst'
    : char.stats.sleep <= 8 ? 'exhaustion'
    : (state.weather === 'snow' || state.weather === 'storm') ? 'cold'
    : 'injury';
  const deathImg = `/assets/death-${deathCat}.webp`;

  // L'ennemi vainqueur, retrouvé dans la cause de mort (elle contient son nom).
  const killerEnemy = useMemo(() => {
    if (!state.deathCause) return null;
    return knownEnemyNames().find(n => state.deathCause!.includes(n) || state.deathCause!.includes(tc(n))) || null;
  }, [state.deathCause]);

  // Gros titre de la une (sert aussi d'épitaphe sur la tombe du Cimetière).
  const headline = killerEnemy
    ? tr(`${tc(killerEnemy).toUpperCase()} TERRASSE UN HOMME EN PLEINE RUE`, `${tc(killerEnemy).toUpperCase()} FELLS A MAN IN BROAD DAYLIGHT`)
    : deathCat === 'combat'
      ? tr('RIXE FATALE DANS LE QUARTIER', 'FATAL BRAWL IN THE NEIGHBORHOOD')
      : tr(HEADLINES[deathCat].fr, HEADLINES[deathCat].en);

  // ---- Registre des Morts + Karma + tombe : enregistrés UNE fois par mort ----
  const harvest = useMemo(() => {
    if (!char) return null;
    const ids: string[] = [];
    if (killerEnemy) ids.push(`mort-ennemi-${killerEnemy}`);
    else if (deathCat !== 'combat') ids.push(`mort-${deathCat}`);
    if (char.day <= 1) ids.push('mort-jour-1');
    if (char.money >= 30) ids.push('mort-riche');
    if (state.weather === 'heatwave') ids.push('mort-canicule');
    if (char.day >= 10) ids.push('mort-doyen');
    // LA COURONNE SE TRANSMET : un personnage sacré Roi ne s'éteint pas, il
    // monte sur le trône et devient le boss des parties suivantes, jusqu'à ce
    // qu'un prochain personnage vienne le détrôner.
    if (char.crowned) {
      setCrown({
        name: char.name, seed: char.seed, gender: char.gender,
        jobName: char.job.name, jobEmoji: char.job.emoji,
        days: char.day, crownedAt: Date.now(), reigns: char.kingsBeaten ?? 1,
      });
    }
    return recordDeath({
      ids, name: char.name, day: char.day, respect: char.respect, seed: char.seed,
      grave: { name: char.name, seed: char.seed, gender: char.gender, day: char.day, jobEmoji: char.job.emoji, jobName: char.job.name, cause: headline, accessories: getEquipped() as Record<string, string> },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char?.seed]);

  // Le successeur est tiré AVANT le bilan : l'écran de fin ne clôt plus une
  // partie, il en ouvre une. Le joueur repart avec un nom en tête.
  useEffect(() => { dispatch({ type: 'PREPARE_SUCCESSOR' }); }, [dispatch]);
  const successor = state.characterChoices[0] ?? null;

  // Pub interstitielle à l'arrivée sur l'écran de fin (entre deux parties).
  useEffect(() => { showInterstitial(); }, []);
  // La résonance de fin : une seule fois, à l'ouverture de l'écran.
  useEffect(() => { playDeath(); }, []);

  const canRevive = !!char && !char.activeFlags.includes('revived');

  /*
   * LA SECONDE CHANCE SE PROPOSE AU PIC, PAS APRÈS LE BILAN.
   *
   * Une vidéo récompensée convertit bien mieux pour RESTAURER une perte que
   * pour offrir un gain. La perte est chaude à l'instant exact de la mort ;
   * dix secondes plus tard, le joueur a lu son récapitulatif, encaissé son
   * Karma et accepté sa fin — l'offre arrive alors sur quelqu'un qui a déjà
   * fait son deuil. L'offre passe donc devant tout le reste, une seule fois,
   * et se referme sans insister. Le bouton reste disponible plus bas pour qui
   * change d'avis.
   */
  const [peakOffer, setPeakOffer] = useState(true);

  async function handleRevive() {
    if (reviving) return;
    setReviving(true);
    // Exempté du plafond de sollicitations : c'est le meilleur emplacement du
    // jeu, et il est déjà limité à une fois par partie.
    const rewarded = await showRewarded({ exempt: true });
    if (rewarded) {
      dispatch({ type: 'REVIVE' });
    } else {
      setReviving(false);
      setPeakOffer(false);
    }
  }

  // Le Sceptre du Roi ne se lègue pas : la couronne se mérite au combat, elle
  // ne se transmet pas dans un testament.
  function isBequeathable(item: InventoryItem) {
    return item.id !== 'sceptre-roi';
  }

  function chooseLegacy(item: InventoryItem) {
    if (!isBequeathable(item)) {
      pushToast(
        tr('Le Sceptre ne se lègue pas : il faut prouver sa valeur en reprenant la couronne.',
           "The Sceptre cannot be bequeathed: you must prove your worth by taking the crown."),
        { emoji: '👑', tone: 'bad' },
      );
      return;
    }
    if (!char) return;
    if (legacyId === item.id) { setLegacyId(null); clearLegacy(); return; }
    setLegacyId(item.id);
    setLegacy(item, char.name);
  }

  if (!char) return null;

  function inferCause(): string {
    if (char!.stats.mental <= 0) {
      return tr('Votre esprit a lâché avant votre corps. La rue a fini par avoir votre moral.', 'Your mind gave out before your body. The street finally broke your spirit.');
    }
    if (char!.stats.hunger <= 8) return tr('Le ventre vide a eu le dernier mot. On ne survit pas longtemps à jeun.', 'An empty stomach had the last word. You don\'t last long unfed.');
    if (char!.stats.thirst <= 8) return tr('La soif a fini le travail. Trouver de l\'eau, ça compte plus qu\'on ne croit.', 'Thirst finished the job. Finding water matters more than you\'d think.');
    if (char!.stats.sleep <= 8) return tr('L\'épuisement vous a rattrapé. Le corps réclame son dû, toujours.', 'Exhaustion caught up with you. The body always claims its due.');
    if ((state.weather === 'snow' || state.weather === 'storm') && char!.stats.health <= 0) {
      return tr('Le froid a eu raison de vous cette nuit. La rue est glaciale avec ses rois.', 'The cold got you tonight. The street is icy to its kings.');
    }
    return tr('Votre corps a lâché. Trop de coups, pas assez de soins.', 'Your body gave out. Too many blows, not enough care.');
  }
  const deathCause = state.deathCause || inferCause();

  const score = computeScore(char.day, char.respect, char.money, hasTrait(char, 'poissard'));
  const highScores = loadHighScores();

  // Ce dont il s'est le plus approché sans l'avoir : l'écran ne se referme
  // jamais sur un bilan seulement positif.
  const book = loadDeathBook();
  const totalFins = DEATH_DEFS.length + knownEnemyNames().length;
  const miss = nearestMiss(
    char.day,
    highScores.length > 0 ? Math.max(...highScores.map(h => h.days)) : 0,
    Object.keys(book).length,
    totalFins,
  );

  // Fiches des fins découvertes pour l'encadré « inédit ».
  const newCards = (harvest?.newIds || []).map(id => {
    const def = DEATH_DEFS.find(d => d.id === id);
    if (def) return { emoji: def.emoji, title: tr(def.title, def.titleEn) };
    const enemy = id.replace('mort-ennemi-', '');
    return { emoji: '⚔️', title: tr(`Vaincu par ${tc(enemy)}`, `Slain by ${tc(enemy)}`) };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 flex flex-col items-center gap-3"
      style={{ background: 'radial-gradient(95% 45% at 50% 0%, rgba(217,79,79,0.16), transparent 60%), linear-gradient(180deg, #3A2436 0%, #1C1322 100%)' }}
    >
      {/* ---- L'OFFRE AU PIC : avant le bilan, tant que la perte est chaude ---- */}
      <AnimatePresence>
        {canRevive && peakOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-5"
            style={{ background: 'rgba(12,8,14,0.975)', backdropFilter: 'blur(3px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 22 }}
              className="w-full max-w-sm text-center"
            >
              <p className="text-4xl mb-3">🌅</p>
              <h2 className="text-xl font-bold text-[#F0D9C4] leading-tight mb-1.5">
                {tr('Pas tout de suite.', 'Not just yet.')}
              </h2>
              <p className="text-[13px] text-[#A08060] leading-snug mb-5">
                {tr(
                  `${char.name} est encore là, de justesse. Une âme charitable peut passer — mais une seule fois par partie.`,
                  `${char.name} is still here, barely. A kind soul may come by — but only once per game.`,
                )}
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={reviving}
                onClick={handleRevive}
                className="w-full py-3.5 text-[15px] font-bold text-white rounded-xl disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)', boxShadow: '0 4px 18px rgba(74,155,95,0.35)' }}
              >
                {reviving ? tr('⏳ Chargement…', '⏳ Loading…') : tr('🎬 Se relever (regarder une pub)', '🎬 Get back up (watch an ad)')}
              </motion.button>
              <button
                onClick={() => setPeakOffer(false)}
                className="w-full mt-2.5 py-2.5 text-[12px] font-semibold text-[#8B6B4A]"
              >
                {tr('Non, c\'est fini', 'No, it\'s over')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- LA UNE DE JOURNAL ---- */}
      <motion.div
        initial={{ y: 18, opacity: 0, rotate: -0.6 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm rounded-sm px-4 pt-3 pb-4 shadow-[0_10px_36px_rgba(0,0,0,0.45)]"
        style={{ background: 'linear-gradient(180deg, #F4EBD8, #EDE0C6)', border: '1px solid #D8C8A8' }}
      >
        {/* Manchette */}
        <div className="text-center border-b-2 border-[#2A1F1A] pb-1.5 mb-2">
          <p className="text-[9px] tracking-[0.35em] text-[#6B5740] font-mono uppercase">{tr('Édition nécrologie', 'Obituary edition')}</p>
          <h2 className="text-xl font-black text-[#2A1F1A] leading-none tracking-wide">{tr('LA GAZETTE DU CARTON', 'THE CARDBOARD GAZETTE')}</h2>
          <p className="text-[9px] text-[#8B6B4A] font-mono mt-0.5">
            {tr(`Jour ${char.day}`, `Day ${char.day}`)} · {tr('1 centime', '1 cent')} · {tr('tirage : personne', 'circulation: nobody')}
          </p>
        </div>

        {/* Gros titre */}
        <h1 className="text-lg font-black text-[#1A1310] leading-tight text-center mb-2">{headline}</h1>

        {/* Photo du drame */}
        {deathImgOk ? (
          <div className="w-full h-36 overflow-hidden relative mb-2 border border-[#B8A888]">
            <KenBurnsImage src={deathImg} onError={() => setDeathImgOk(false)} />
            <span className="absolute bottom-1 right-2 text-xl drop-shadow">💀</span>
          </div>
        ) : (
          <div className="w-full h-24 flex items-center justify-center text-5xl mb-2 border border-[#B8A888] bg-[#E4D6BC]">💀</div>
        )}

        {/* Nécrologie */}
        <p className="text-[12px] text-[#3D3020] leading-snug mb-2">{deathCause}</p>
        <div className="flex items-center gap-2.5 border-t border-[#C8B896] pt-2">
          <div className="w-11 h-11 rounded overflow-hidden border border-[#B8A888] shrink-0 grayscale-[35%]">
            <PlayerFace char={char} size={44} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-[#2A1F1A] truncate">{char.job.emoji} {char.name}</p>
            <p className="text-[10px] text-[#6B5740] truncate">{tc(char.job.name)} · {char.traits.map(t => t.emoji).join(' ')}</p>
          </div>
          <div className="text-right font-mono shrink-0">
            <p className="text-[11px] text-[#2A1F1A] font-bold">{char.day} {tr(char.day > 1 ? 'jours' : 'jour', char.day > 1 ? 'days' : 'day')} · {char.money}€</p>
            <p className="text-[10px] text-[#8B6B4A]">⭐ {char.respect} · {tr('score', 'score')} {score}</p>
          </div>
        </div>
      </motion.div>

      {/* ---- LE SUCCESSEUR : la partie suivante est déjà commencée ----
           Placé AVANT le bilan, et avant tout ce qui ressemble à une clôture.
           Le joueur ne quitte plus une partie finie, il quitte quelqu'un qui
           l'attend. C'est aussi le texte des rappels (voir lib/notifications). */}
      {successor && (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#5A3A28]"
          style={{ background: 'linear-gradient(135deg, #3A2A20, #241A16)' }}
        >
          {miss && (
            <p className="text-[11px] text-[#C89B5A] leading-snug mb-2.5">
              ↯ {tr(miss.fr, miss.en)}
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#6B4A32] shrink-0">
              <PlayerFace char={successor} size={44} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-widest uppercase text-[#8B6B4A] font-mono">
                {tr('Le suivant sur la liste', 'Next in line')}
              </p>
              <p className="text-[13px] font-bold text-[#F0D9C4] truncate">
                {successor.name} · {successor.job.emoji} {tc(successor.job.name)}
              </p>
              <p className="text-[10px] text-[#A08060] truncate">
                {successor.traits.map(t => `${t.emoji} ${tc(t.name)}`).join(' · ')}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => dispatch({ type: 'RESTART' })}
            className="w-full mt-3 py-3.5 text-[15px] font-bold text-white rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
              boxShadow: '0 4px 18px rgba(212, 135, 77, 0.35)',
            }}
          >
            {tr(`Reprendre la rue avec ${successor.name}`, `Take the street with ${successor.name}`)}
          </motion.button>
          <p className="text-[9px] text-[#8B6B4A] text-center mt-1.5">
            {tr('Vous pourrez encore changer d\'avis.', 'You can still change your mind.')}
          </p>
        </motion.div>
      )}

      {/* ---- LA RÉCOLTE : fins découvertes + Karma ---- */}
      <motion.div
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
        style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
      >
        {newCards.length > 0 && (
          <div className="mb-2.5">
            <p className="text-[10px] tracking-widest uppercase text-[#F2C14E] font-semibold mb-1.5">
              📕 {tr(newCards.length > 1 ? 'Nouvelles fins découvertes' : 'Nouvelle fin découverte', newCards.length > 1 ? 'New endings discovered' : 'New ending discovered')}
            </p>
            <div className="flex flex-col gap-1">
              {newCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-2 text-[12px] text-[#F0D9C4] bg-[#231525] rounded-lg px-2.5 py-1.5"
                >
                  <span>{c.emoji}</span>
                  <span className="flex-1 font-semibold">{c.title}</span>
                  <span className="text-[10px] text-[#F2C14E] font-mono">+10 👑</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#F0D9C4] font-semibold">👑 {tr('Karma de Rue gagné', 'Street Karma earned')}</span>
          <span className="text-base font-bold text-[#F2C14E] font-mono">+{harvest?.karmaGained ?? 0}</span>
        </div>
        <p className="text-[10px] text-[#A08060] text-right font-mono">{tr('total', 'total')} : {harvest?.karmaTotal ?? 0} 👑</p>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'registre' })}
          className="w-full mt-2 py-2 text-[11px] font-semibold text-[#E8A87C] rounded-lg border border-[#4A3048] hover:bg-white/5"
        >
          📕 {tr('Consulter le Registre des Morts', 'Open the Book of the Dead')}
        </button>
      </motion.div>

      {/* ---- DERNIÈRES VOLONTÉS ---- */}
      {char.inventory.length > 0 && (
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
          style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
        >
          <p className="text-[12px] text-[#F0D9C4] font-semibold mb-0.5">📜 {tr('Dernières volontés', 'Last will')}</p>
          <p className="text-[10px] text-[#A08060] mb-2">
            {tr('Léguez UN objet : il attendra votre prochain personnage, posé sur votre carton.', 'Bequeath ONE item: it will await your next character, left on your cardboard.')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {char.inventory.map((item, i) => {
              const locked = !isBequeathable(item);
              return (
                <button
                  key={`${item.id}-${i}`}
                  onClick={() => chooseLegacy(item)}
                  title={locked ? tr('Ne se lègue pas', 'Cannot be bequeathed') : undefined}
                  className={`px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 border transition-all ${
                    locked
                      ? 'border-[#5A4030] text-[#7A6450] opacity-70 cursor-not-allowed line-through decoration-[#7A6450]'
                      : legacyId === item.id
                        ? 'border-[#F2C14E] bg-[#F2C14E]/15 text-[#F2C14E] font-semibold'
                        : 'border-[#4A3048] text-[#C8B0A0] hover:bg-white/5'
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span className="max-w-28 truncate">{tc(item.name)}</span>
                  {locked && <span className="text-[10px]">🔒</span>}
                </button>
              );
            })}
          </div>
          {/* Le Sceptre est dans le sac : on explique pourquoi il reste au mort. */}
          {char.inventory.some((it) => !isBequeathable(it)) && (
            <p className="text-[10px] text-[#C89B5A] mt-1.5 leading-snug">
              👑 {tr('Le Sceptre du Roi part avec vous dans la tombe : la couronne ne s\'hérite pas, elle s\'arrache au combat.',
                     "The King's Sceptre goes to the grave with you: the crown isn't inherited, it's taken by force.")}
            </p>
          )}
          {legacyId && (
            <p className="text-[10px] text-[#F2C14E] mt-1.5">
              ✓ {tr('Posé sur votre tombe pour le prochain.', 'Left on your grave for the next one.')}
            </p>
          )}
        </motion.div>
      )}

      {/* High Scores */}
      {highScores.length > 0 && (
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-sm rounded-xl p-3 border border-[#4A3048]"
          style={{ background: 'linear-gradient(135deg, #362232, #26182A)' }}
        >
          <h4 className="text-sm font-semibold text-[#F0D9C4] text-center mb-2">
            🏆 {tr('Plus longues survies', 'Longest survivals')}
          </h4>
          <div className="flex flex-col gap-1.5">
            {highScores.slice(0, 5).map((hs, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#A08060]'}>
                  {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {hs.name}
                </span>
                <span className={i === 0 ? 'text-[#F2C14E] font-semibold' : 'text-[#E8A87C] font-semibold'}>
                  {hs.days} {tr(hs.days > 1 ? 'jours' : 'jour', hs.days > 1 ? 'days' : 'day')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Seconde chance (pub récompensée), une fois par partie */}
      {canRevive && (
        <motion.button
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={reviving}
          onClick={handleRevive}
          className="w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)',
            boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
          }}
        >
          {reviving ? tr('⏳ Chargement…', '⏳ Loading…') : tr('🎬 Seconde chance (regarder une pub)', '🎬 Second chance (watch an ad)')}
        </motion.button>
      )}

      {/* Reprise — répétée en bas de page pour qui a tout lu, et repli complet
          si le successeur n'a pas pu être tiré. */}
      <motion.button
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.85 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => dispatch({ type: 'RESTART' })}
        className={successor
          ? 'w-full max-w-sm py-2.5 text-[12px] font-semibold text-[#E8A87C] rounded-xl border border-[#4A3048]'
          : 'w-full max-w-sm py-3.5 text-sm font-semibold text-white rounded-xl'}
        style={successor ? undefined : {
          background: 'linear-gradient(135deg, #D4874D, #9B5B3A)',
          boxShadow: '0 4px 16px rgba(212, 135, 77, 0.3)',
        }}
      >
        {successor
          ? tr('↻ Reprendre la rue', '↻ Take the street')
          : tr('Recommencer', 'Play Again')}
      </motion.button>
    </motion.div>
  );
}
