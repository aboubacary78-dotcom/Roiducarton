import { useGame, streetTitleFor, getContract, LOCATIONS, npcAt, encounterFlag, pickFightEnemy, STREET_TITLES } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import StatBars from './StatBars';
import CoachTip from './CoachTip';
import { loadCommande, commandeDef, markClaimed, daysLeft } from '@/lib/commande';
import { addKarma } from '@/lib/necrology';
import { pushToast } from '@/lib/toast';
import CardboardAvatar from './CardboardAvatar';
import PlayerFace, { faceCondition } from './PlayerFace';
import StreetEncounter from './StreetEncounter';
import { WEATHER_TYPES, getNextWeather } from '@/contexts/GameContext';
import { playBag, playCard, playClick, playFightStart, playNextDay, playTab, playUnlock } from '@/lib/sound';
import { useLang, tr, tc } from '@/lib/lang';
import LocationBackdrop from './LocationBackdrop';
import { stampTap, liftHover } from '@/lib/anim';
import { noteTap } from '@/lib/tapOrigin';
import { prechargerActions } from '@/lib/precharge';

// Couleur du voile de lumière selon l'avancement de la journée : or du matin,
// plein jour transparent, orange du soir, bleu de nuit. Interpolation linéaire
// entre ces étapes (r, g, b, alpha).
const DAY_VEILS: Array<[number, number, number, number, number]> = [
  [0.0, 255, 214, 140, 0.14],  // matin doré
  [0.35, 255, 255, 255, 0],    // plein jour
  [0.7, 224, 122, 60, 0.16],   // fin d'après-midi
  [0.9, 96, 62, 96, 0.24],     // crépuscule
  [1.0, 22, 30, 68, 0.42],     // nuit, plus d'action restante
];
function dayVeil(p: number): string {
  let i = 0;
  while (i < DAY_VEILS.length - 2 && DAY_VEILS[i + 1][0] < p) i++;
  const a = DAY_VEILS[i], b = DAY_VEILS[i + 1];
  const k = Math.min(1, Math.max(0, (p - a[0]) / (b[0] - a[0] || 1)));
  const mix = (x: number, y: number) => Math.round(x + (y - x) * k);
  const alpha = a[4] + (b[4] - a[4]) * k;
  return `rgba(${mix(a[1], b[1])}, ${mix(a[2], b[2])}, ${mix(a[3], b[3])}, ${alpha.toFixed(3)})`;
}


const AMBIENT_TEXTS: Record<string, string[]> = {
  'parc': [
    'Les pigeons vous observent avec un intérêt suspect.',
    'Un écureuil vous nargue depuis un arbre.',
    'Le vent souffle doucement à travers les feuilles.',
    'Un jogger passe devant vous sans vous voir.',
  ],
  'centre-ville': [
    'L\'odeur des croissants du boulanger vous torture.',
    'Un homme en costume parle fort au téléphone.',
    'Les néons des magasins clignotent dans la nuit.',
    'Les passants accélèrent en vous voyant.',
  ],
  'zone-industrielle': [
    'Des bruits métalliques résonnent dans le silence.',
    'Un chat errant vous fixe depuis un conteneur.',
    'L\'odeur de rouille et d\'huile flotte dans l\'air.',
    'Des rats courent entre les palettes.',
  ],
  'gare': [
    'Les annonces de trains résonnent dans le hall.',
    'Des voyageurs pressés vous bousculent.',
    'L\'odeur de café du kiosque est enivrante.',
    'Un musicien joue de l\'accordéon au loin.',
  ],
  'marche': [
    'Les étals colorés débordent de fruits.',
    'Un poissonnier crie ses prix.',
    'L\'odeur de poulet rôti vous fait saliver.',
    'Les commerçants rangent. Bientôt les restes.',
  ],
};

function getAmbientText(location: string, day: number): string {
  const texts = AMBIENT_TEXTS[location] || AMBIENT_TEXTS['parc'];
  return texts[day % texts.length];
}

// Couleur d'état de l'avatar : du vert (en forme) au rouge (au plus mal).
function conditionColor(c: number): string {
  if (c >= 0.56) return '#4A9B5F';
  if (c >= 0.4) return '#D9A73E';
  if (c >= 0.24) return '#E8842C';
  return '#D94F4F';
}

export default function MainScreen() {
  const { state, dispatch } = useGame();
  useLang();
  const char = state.character!;
  const loc = LOCATIONS[char.location];
  // État général (0 = à l'agonie, 1 = en pleine forme) : moyenne des jauges
  // vitales, hors dignité (plus sociale). Nourrit le visage et le liseré de
  // l'avatar pour rendre lisible la dégradation ou le mieux-être.
  const condition = faceCondition(char);
  const actionsLeft = state.maxDayActions - state.dayActions;
  // Avancement de la journée (0 = matin frais, 1 = nuit tombée) : ce sont les
  // actions consommées qui font tourner la lumière sur la scène du quartier.
  const dayProgress = state.maxDayActions > 0 ? state.dayActions / state.maxDayActions : 0;
  // Titre de rue (palier de jours) et contrat du matin.
  const streetTitle = streetTitleFor(char.day);
  // Le titre SUIVANT, annoncé dès le deuxième jour. Une progression ne tire
  // que si on voit le but : jusqu'ici le titre n'apparaissait qu'une fois
  // obtenu, et toute la montée était perdue.
  const nextTitle = char.day >= 2 ? STREET_TITLES.find(t => t.day > char.day) : undefined;
  // Une action qui ferait descendre d'un palier de Dignité se signale AVANT
  // d'être touchée : c'est le moment où la mécanique centrale du jeu devient
  // visible. Le texte dit « peut », jamais « va » — le coût exact dépend du
  // déroulement du mini-jeu, et une annonce qui promet plus qu'elle ne sait se
  // repère tout de suite.
  // Les images de résultat des actions sont demandées pendant que le joueur
  // lit son écran, pas au moment où il faut les montrer.
  useEffect(() => { prechargerActions(char.location); }, [char.location]);


  /*
   * LA COMMANDE DE LA SEMAINE.
   *
   * L'horizon long, celui qui traverse les parties. Elle est affichée en
   * permanence à côté du contrat du jour : deux buts visibles à tout instant,
   * un court et un long, pour qu'aucun moment du jeu ne soit jamais loin de
   * quelque chose.
   */
  const [, refreshCommande] = useState(0);
  const commande = loadCommande();
  const commandeD = commandeDef(commande);
  const commandeFaite = commande.count >= commandeD.target;

  function encaisserCommande() {
    if (!commandeFaite || commande.claimed) return;
    addKarma(commandeD.karma);
    markClaimed();
    playUnlock();
    pushToast(
      tr(`Commande honorée : +${commandeD.karma} karma.`, `Order filled: +${commandeD.karma} karma.`),
      { emoji: commandeD.emoji, tone: 'good' },
    );
    refreshCommande(n => n + 1);
  }

  const contractDef = state.contract ? getContract(state.contract.id) : undefined;
  const contractDone = !!state.contract?.done || (contractDef?.check ? contractDef.check(char) : false);
  const weather = WEATHER_TYPES[state.weather];
  const nextWeatherType = state.nextWeather;
  const nextWeather = WEATHER_TYPES[nextWeatherType];

  // PNJ errant du jour (lieux sociaux) : présent tant qu'on ne l'a pas
  // rencontré. Déterministe par jour/lieu, donc il « bouge » d'un jour à l'autre.
  const [encounterOpen, setEncounterOpen] = useState(false);
  const streetNpc = npcAt(char.day, char.location, char.seed);
  const encounterDone = char.activeFlags?.includes(encounterFlag(char.day, char.location));
  const showNpc = !!streetNpc && !encounterDone;

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      {/* Le conseil du moment : une phrase, au moment où elle sert. */}
      <CoachTip ctx={{ char, actionsLeft, weather: state.weather }} />

      {/* Top Bar */}
      <motion.div
        id="tuto-header"
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="craft-card p-3"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { playClick(); dispatch({ type: 'SET_SCREEN', screen: 'wardrobe' }); }}
              className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform"
              style={{ border: `2px solid ${conditionColor(condition)}`, transition: 'border-color 0.6s' }}
              aria-label="Personnaliser mon personnage"
            >
              <PlayerFace char={char} size={40} />
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#B8860B] text-white text-[9px] flex items-center justify-center shadow">✎</span>
            </button>
            <div>
              <h2 className="text-base font-semibold text-[#2A1F1A]">{char.name}</h2>
              <p className="text-xs text-[#8B6B4A]">
                {loc.emoji} {tr(loc.name, loc.nameEn || loc.name)} · {tr('Jour', 'Day')} {char.day}{streetTitle ? ` · ${streetTitle.emoji} ${tr(streetTitle.fr, streetTitle.en)}` : ''}
              </p>
              {nextTitle && (
                <p className="text-[10px] text-[#B8860B] font-medium leading-tight">
                  {nextTitle.emoji} {tr(
                    `${nextTitle.fr} dans ${nextTitle.day - char.day} jour${nextTitle.day - char.day > 1 ? 's' : ''}`,
                    `${nextTitle.en} in ${nextTitle.day - char.day} day${nextTitle.day - char.day > 1 ? 's' : ''}`,
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right font-mono flex flex-col items-end gap-0.5">
              <div className="text-sm font-semibold text-[#B8860B]">{char.money}€</div>
              <div className="text-[10px] text-[#7B68EE] font-medium">⭐ {char.respect}</div>
            </div>
            <button
              onClick={() => { playTab(); dispatch({ type: 'SET_SCREEN', screen: 'settings' }); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-[#8B6B4A] hover:bg-[#F5EDE4] transition-colors"
              aria-label="Options"
            >
              ⚙️
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---- LES DEUX BUTS, EN TÊTE ----
           Le contrat du jour donne sa direction à la journée entière, et il
           était rendu en 10 px, en gris, entre les pastilles et les boutons :
           le plus faible poids visuel de l'écran pour l'information la plus
           structurante. Il monte donc sous l'identité, en taille de corps, avec
           la commande de la semaine juste dessous — deux horizons visibles à
           tout instant, un court et un long. */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.04 }}
        className="craft-card p-3 flex flex-col gap-2.5"
      >
        {contractDef && (
          <div className="flex items-start gap-2.5">
            <span className="text-lg leading-none mt-0.5">{contractDone ? '✅' : '📋'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-widest uppercase text-[#A08B70] font-mono">
                {tr('Contrat du jour', "Today's contract")}
              </p>
              <p className={`text-[13px] font-semibold leading-snug ${contractDone ? 'text-[#3d8b4f]' : 'text-[#3D3020]'}`}>
                {tr(contractDef.label, contractDef.labelEn)}
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#B8860B] shrink-0 mt-0.5">
              {tr(contractDef.rewardLabel, contractDef.rewardLabelEn)}
            </span>
          </div>
        )}

        {/* La commande de la semaine : l'horizon long, toujours visible. */}
        <button
          onClick={commandeFaite && !commande.claimed ? encaisserCommande : undefined}
          disabled={!commandeFaite || commande.claimed}
          className={`w-full rounded-xl px-3 py-2 border text-left ${
            commande.claimed
              ? 'border-[#E8D5C0] opacity-60'
              : commandeFaite
                ? 'border-[#3d8b4f]/45 bg-[#4A9B5F]/8'
                : 'border-[#E8D5C0]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{commandeD.emoji}</span>
            <span className="flex-1 text-[10px] text-[#6B5740] leading-snug">
              {tr(commandeD.fr, commandeD.en)}
            </span>
            <span className="text-[10px] font-mono text-[#8B6B4A] shrink-0">
              {commande.claimed
                ? '✓'
                : `${commande.count}/${commandeD.target}`}
            </span>
          </div>
          <div className="h-1 rounded-full bg-[#E8D5C0] overflow-hidden mt-1.5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: commandeFaite ? 'linear-gradient(90deg,#4A9B5F,#7BD48A)' : 'linear-gradient(90deg,#B8860B,#F2C14E)' }}
              animate={{ width: `${Math.min(100, (commande.count / commandeD.target) * 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="text-[9px] text-[#A08B70] mt-1">
            {commande.claimed
              ? tr('Encaissée. Nouvelle commande lundi.', 'Filled. New order on Monday.')
              : commandeFaite
                ? tr(`Terminée — toucher pour encaisser +${commandeD.karma} 👑`, `Done — tap to collect +${commandeD.karma} 👑`)
                : tr(`+${commandeD.karma} 👑 · ${daysLeft()} jour${daysLeft() > 1 ? 's' : ''} restant${daysLeft() > 1 ? 's' : ''}`,
                     `+${commandeD.karma} 👑 · ${daysLeft()} day${daysLeft() > 1 ? 's' : ''} left`)}
          </p>
        </button>
      </motion.div>

      {/* Météo */}
      <motion.div
        id="tuto-weather"
        key={state.weather}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="craft-card p-2.5 flex items-center gap-2.5"
        style={{
          background: state.weather === 'storm' ? 'linear-gradient(135deg, #1a1f3a, #2a2f4a)'
            : state.weather === 'snow' ? 'linear-gradient(135deg, #e8eff8, #d8e8f5)'
            : state.weather === 'heatwave' ? 'linear-gradient(135deg, #3a1a0a, #4a2a0a)'
            : undefined,
        }}
      >
        <span className="text-2xl">{weather.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{
              color: state.weather === 'storm' ? '#a0b0e0'
                : state.weather === 'snow' ? '#3060a0'
                : state.weather === 'heatwave' ? '#ff8040'
                : '#2A1F1A'
            }}>
              {tr(weather.label, weather.labelEn)}
            </span>
            {/* Pénalités météo */}
            {Object.entries(weather.dailyPenalty).filter(([, v]) => v !== 0).map(([key, val]) => (
              <span key={key} className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-[#D94F4F]/10 text-[#D94F4F]">
                {key === 'health' ? '❤️' : key === 'mental' ? '🧠' : key === 'hunger' ? '🍖' : key === 'thirst' ? '💧' : key === 'sleep' ? '😴' : '👑'} {val}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#8B6B4A]">{tr(weather.description, weather.descriptionEn)}</p>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#A08B70]">{tr('demain', 'tomorrow')}</div>
          <div className="text-base">{nextWeather.emoji}</div>
        </div>
      </motion.div>

      {/* Décor du quartier + ambiance (illustration générée, DA carton).
          La journée PASSE sur la scène : chaque action consommée fait glisser
          le décor, tourner la lumière (matin → midi → soir → nuit) et avancer
          le soleil, remplacé par la lune quand il ne reste plus d'action. */}
      <motion.div
        key={char.location}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative w-full h-28 rounded-xl overflow-hidden craft-card p-0"
      >
        <motion.div
          className="w-full h-full"
          style={{ scale: 1.15, willChange: 'transform' }}
          animate={{ x: -6 - dayProgress * 30 }}
          transition={{ type: 'spring', stiffness: 55, damping: 20 }}
        >
          <LocationBackdrop location={char.location} />
        </motion.div>
        {/* Voile de lumière du moment de la journée */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ backgroundColor: dayVeil(dayProgress) }}
          transition={{ duration: 0.8 }}
        />
        {/* Étoiles quand la nuit tombe (plus d'action restante) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: actionsLeft === 0 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {[[12, 18], [32, 10], [55, 16], [74, 9], [88, 20]].map(([l, t], i) => (
            <span key={i} className="absolute w-1 h-1 rounded-full bg-[#F5EEDC]" style={{ left: `${l}%`, top: `${t}%`, opacity: i % 2 ? 0.7 : 1 }} />
          ))}
        </motion.div>
        {/* Course du soleil, puis lever de lune */}
        <motion.span
          className="absolute text-lg drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] pointer-events-none"
          animate={{ left: `${6 + dayProgress * 80}%`, top: `${30 - Math.sin(dayProgress * Math.PI) * 22}%` }}
          transition={{ type: 'spring', stiffness: 55, damping: 18 }}
        >
          {actionsLeft === 0 ? '🌙' : '☀️'}
        </motion.span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <p className="absolute bottom-0 left-0 right-0 px-3 pb-2 text-[11px] text-white/95 italic leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          "{tc(getAmbientText(char.location, char.day))}"
        </p>
      </motion.div>

      {/* PNJ errant : une autre âme de la rue traîne dans le coin */}
      {showNpc && streetNpc && (
        <motion.button
          initial={{ x: -12, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playCard(); setEncounterOpen(true); }}
          className="craft-card p-2.5 flex items-center gap-2.5 text-left"
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#E8D5C0] shrink-0">
            <CardboardAvatar seed={streetNpc.seed} gender={streetNpc.gender} size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#2A1F1A] leading-tight">
              👋 {tr(`${streetNpc.name} traîne dans le coin`, `${streetNpc.name} is hanging around`)}
            </p>
            <p className="text-[10px] text-[#8B6B4A] leading-snug line-clamp-1">{tr(streetNpc.situationFr, streetNpc.situationEn)}</p>
          </div>
          <span className="text-[10px] font-semibold text-[#C4723A] shrink-0">{tr('Aller voir', 'Go see')} →</span>
        </motion.button>
      )}

      {encounterOpen && streetNpc && (
        <StreetEncounter npc={streetNpc} onClose={() => setEncounterOpen(false)} />
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex flex-col gap-2 flex-1"
      >
      {/* ---- LES JAUGES, EN VEILLE ----
           Descendues sous la météo : elles n'ont pas besoin d'être lues, mais
           d'être vues quand ça va mal. Le seuil de danger les fait pulser et
           fait apparaître leur chiffre — c'est ce rappel-là qui compte, pas
           leur place en haut de l'écran. */}
      <motion.div
        id="tuto-stats"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="craft-card p-3"
      >
        <StatBars stats={char.stats} />
      </motion.div>

        {/* Actions counter */}
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: state.maxDayActions }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < actionsLeft
                  ? 'bg-[#C4723A] shadow-[0_0_4px_rgba(196,114,58,0.4)]'
                  : 'bg-[#E8D5C0]'
              }`}
            />
          ))}
          <span className="text-[10px] text-[#A08B70] font-mono ml-1.5">
            {actionsLeft} {tr(`action${actionsLeft > 1 ? 's' : ''}`, `action${actionsLeft > 1 ? 's' : ''}`)}
          </span>
        </div>

        {/* Main actions grid */}
        <div id="tuto-actions" className="grid grid-cols-2 gap-2">
          <ActionTile emoji="🔍" title={tr('Explorer', 'Explore')} desc={tr('Tenter une rencontre', 'Look for an encounter')} accent="#4A8FBF" disabled={actionsLeft <= 0} onClick={() => { playClick(); dispatch({ type: 'EXPLORE' }); }} />
          <ActionTile
            emoji="🙏" title={tr('Mendier', 'Beg')} desc={tr('Récolter des pièces', 'Collect coins')} accent="#B8860B"
            disabled={actionsLeft <= 0} onClick={() => { playClick(); dispatch({ type: 'BEG' }); }}
          />
          <ActionTile emoji="😴" title={tr('Dormir', 'Sleep')} desc={tr('Récupérer du sommeil', 'Recover sleep')} accent="#7B68EE" disabled={actionsLeft <= 0} onClick={() => { playClick(); dispatch({ type: 'REST' }); }} />
          <ActionTile
            emoji="🥊" title={tr('Bagarre', 'Fight')} desc={tr('Provoquer un combat', 'Pick a fight')} accent="#D94F4F" disabled={actionsLeft <= 0} danger
            onClick={() => {
              // Adversaire tiré dans le CATALOGUE du quartier (et, rarement,
              // le Roi Déchu si vous avez survécu assez longtemps).
              const enemy = pickFightEnemy(char.location, char.day, char.respect);
              playFightStart();
              dispatch({ type: 'START_COMBAT', enemy });
            }}
          />
        </div>

        {/* La Récup' : la source de matière première de l'atelier. Elle paie
            mal et coûte à la fierté, mais elle ne dépend de personne. */}
        <motion.button
          whileHover={actionsLeft <= 0 ? {} : liftHover}
          whileTap={actionsLeft <= 0 ? {} : stampTap}
          onClick={actionsLeft <= 0 ? undefined : (e) => { noteTap(e); playClick(); dispatch({ type: 'SALVAGE' }); }}
          disabled={actionsLeft <= 0}
          className={`action-btn p-2.5 flex items-center justify-center gap-2 border-[#7C8B5A]/30 ${
            actionsLeft <= 0 ? 'opacity-35 pointer-events-none' : ''
          }`}
        >
          <span className="text-lg">♻️</span>
          <span className="text-xs font-medium text-[#3D3020]">{tr('La Récup\'', 'Salvage')}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-[#7C8B5A]/12 text-[#5E7A3A]">
            {tr('matériaux', 'materials')}
          </span>
        </motion.button>

        {/* Action risquée : Voler */}
        <motion.button
          whileHover={actionsLeft <= 0 ? {} : liftHover}
          whileTap={actionsLeft <= 0 ? {} : stampTap}
          onClick={actionsLeft <= 0 ? undefined : (e) => { noteTap(e); playClick(); dispatch({ type: 'STEAL' }); }}
          disabled={actionsLeft <= 0}
          className={`action-btn p-2.5 flex items-center justify-center gap-2 border-[#D94F4F]/30 ${
            actionsLeft <= 0 ? 'opacity-35 pointer-events-none' : ''
          }`}
        >
          <span className="text-lg">🥷</span>
          <span className="text-xs font-medium text-[#3D3020]">{tr('Voler', 'Steal')}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono bg-[#D94F4F]/10 text-[#D94F4F]">
            {tr('risqué', 'risky')}
          </span>
        </motion.button>

        {/* Secondary actions */}
        <div id="tuto-secondary" className="flex gap-2">
          <ActionTile emoji="🛒" title={tr('Achats', 'Shop')} disabled={false} onClick={() => { playCard(); dispatch({ type: 'SET_SCREEN', screen: 'shop' }); }} small />
          <ActionTile emoji="🗺️" title={tr('Voyager', 'Travel')} disabled={false} onClick={() => { playCard(); dispatch({ type: 'SET_SCREEN', screen: 'travel' }); }} small />
          <ActionTile emoji="🎒" title={`${tr('Sac', 'Bag')} (${char.inventory.length})`} disabled={false} onClick={() => { playBag(); dispatch({ type: 'SET_SCREEN', screen: 'inventory' }); }} small />
        </div>
      </motion.div>

      {/* Next Day */}
      <motion.button
        id="tuto-nextday"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={liftHover}
        whileTap={stampTap}
        onClick={() => { playNextDay(); dispatch({ type: 'NEXT_DAY' }); }}
        className="btn-primary w-full py-3.5 text-sm"
      >
        {tr('Jour Suivant', 'Next Day')}
      </motion.button>
    </div>
  );
}

function ActionTile({ emoji, title, desc, accent, disabled, onClick, danger, small }: {
  emoji: string; title: string; desc?: string; accent?: string; disabled: boolean; onClick: () => void; danger?: boolean; small?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : liftHover}
      whileTap={disabled ? {} : stampTap}
      onClick={disabled ? undefined : (e) => { noteTap(e); playClick(); onClick(); }}
      disabled={disabled}
      className={`action-btn ${small ? 'p-2.5 flex-1' : 'p-3'} flex flex-col items-center justify-center gap-1 ${
        disabled ? 'opacity-35 pointer-events-none' : ''
      } ${danger && !disabled ? 'border-[#D94F4F]/30' : ''}`}
    >
      {accent && !small ? (
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-0.5"
          style={{ background: `${accent}1A` }}
        >
          {emoji}
        </span>
      ) : (
        <span className={small ? 'text-lg' : 'text-xl'}>{emoji}</span>
      )}
      <span className={`${small ? 'text-[10px]' : 'text-sm'} font-semibold text-[#3D3020] text-center leading-tight`}>
        {title}
      </span>
      {desc && !small && (
        <span className="text-[10px] text-[#A08B70] text-center leading-tight">{desc}</span>
      )}
    </motion.button>
  );
}
