import { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { syncRecords, recordGameEnd } from '@/lib/profile';
import { getLang, tc } from '@/lib/lang';
import { peekLegacy, clearLegacy, takePendingKits } from '@/lib/necrology';

// ============================================================================
// LE MONOLITHE, DÉCOUPÉ
// ----------------------------------------------------------------------------
// Les types et les données (événements, boutiques, ennemis, combat, monde…)
// vivent désormais dans ./types et ./data/*. Ce fichier ne garde que le cœur
// dynamique : le reducer, la persistance et le contexte React. On importe ce
// dont le reducer a besoin, et on RÉ-EXPORTE tout le reste pour que les
// composants continuent d'importer depuis '@/contexts/GameContext'.
// ============================================================================
import type {
  GameState, GameScreen, Character, Stats, GameEvent, CombatState, Enemy, SignId,
  ShopItem, ShopEvent, EventOutcome, InventoryItem,
} from './types';
import { randomFromArray, L } from './data/util';
import { generateCharacterTrio, hasTrait, computeScore, genderFromName, HERITAGE_KITS, STARTING_ITEMS } from './data/world';
import { SALVAGE_JUNK, SALVAGE_TUNING, salvagePayout, trouvailleById, piegeHurts, salvageResultImage } from './data/salvage';
import { enemyByName, BEG_TUNING } from './data/passersby';
import { WEATHER_TYPES, getNextWeather, getInitialWeather } from './data/weather';
import { CONTRACTS, getContract, streetTitleFor, STREET_TITLES } from './data/progression';
import { ENEMIES, rollSignRound } from './data/enemies';
import { SHOPS, shopClosure, rollShopClosure, getSellPrice, SOLIDARITY_GIFT, SOLIDARITY_FLAG } from './data/shops';
import { HAGGLE_TUNING, HAGGLED_FLAG, shopkeeperFor } from './data/haggle';
import { takePendingGifts } from '@/lib/daily';
import { DIGNITY_TIERS } from './data/dignity';
import {
  generateEvents, generateBegEvents, generateRestEvents, generateTravelEvent,
  freshPool, rememberEvent, flavorFrom, makeLegendEvent, dueSursaut,
  SURSAUT_EVENT, BEG_EVENTS, STEAL_EVENTS,
} from './data/events';
import {
  makeCombatState, generateHand, getCard, unarmedDamage, bestWeapon, bestWeaponBonus, firstJunk,
  combatDeathMessage, SIGNS, SPECIAL_DEFS,
} from './data/combat';
import { getHeistTarget, HEIST_TARGETS } from './data/heist';
import { RECIPES, recipeCost, pickMaterials } from './data/crafting';
import { encounterFlag } from './data/npc';

// Façade stable : ré-exporte types & données pour les composants existants.
export * from './types';
export * from './data/util';
export * from './data/world';
export * from './data/weather';
export * from './data/progression';
export * from './data/enemies';
export * from './data/shops';
export * from './data/events';
export * from './data/combat';
export * from './data/heist';
export * from './data/crafting';
export * from './data/backstory';
export * from './data/npc';
export * from './data/dodge';
export * from './data/salvage';
export * from './data/passersby';
export * from './data/haggle';
export * from './data/dignity';

// ============ HELPERS DE JAUGES (cœur du reducer) ============

// Applique un delta de stats puis borne le résultat (motif répété du reducer).
function applyStatDelta(stats: Stats, delta: Partial<Stats>): Stats {
  const s = { ...stats };
  Object.entries(delta).forEach(([k, v]) => { if (v) s[k as keyof Stats] += v; });
  return clampStats(s);
}

/** Retire UN exemplaire d'un objet, pas toute la pile : troquer une conserve
 *  ne doit pas vider le sac de toutes les conserves. */
function removeOne(inv: InventoryItem[], id: string): InventoryItem[] {
  const i = inv.findIndex(it => it.id === id);
  return i < 0 ? inv : [...inv.slice(0, i), ...inv.slice(i + 1)];
}

function clampStats(stats: Stats): Stats {
  return {
    health: Math.max(0, Math.min(100, stats.health)),
    mental: Math.max(0, Math.min(100, stats.mental)),
    hunger: Math.max(0, Math.min(100, stats.hunger)),
    thirst: Math.max(0, Math.min(100, stats.thirst)),
    sleep: Math.max(0, Math.min(100, stats.sleep)),
    dignity: Math.max(0, Math.min(100, stats.dignity)),
  };
}

function applyDailyDecay(stats: Stats): Stats {
  // HARD MODE: aggressive daily decay
  return clampStats({
    health: stats.health - (stats.hunger < 15 ? 12 : 2) - (stats.thirst < 15 ? 14 : 2) - (stats.sleep < 15 ? 6 : 0),
    mental: stats.mental - 5 - (stats.dignity < 25 ? 8 : 0) - (stats.hunger < 20 ? 3 : 0),
    hunger: stats.hunger - 18,
    thirst: stats.thirst - 22,
    sleep: stats.sleep - 15,
    dignity: stats.dignity - 4,
  });
}

// ============ LOCAL STORAGE ============
const SAVE_KEY = 'roi-du-carton-save';
const SCORES_KEY = 'roi-du-carton-scores';

function saveGame(state: GameState) {
  try {
    if (state.character && state.character.alive && state.screen !== 'title' && state.screen !== 'character-select') {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        character: state.character,
        dayActions: state.dayActions,
        screen: 'main',
      }));
    }
  } catch { /* silent fail */ }
}

function loadGame(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.character && data.character.alive) {
        // Ensure activeFlags exists for old saves
        if (!data.character.activeFlags) data.character.activeFlags = [];
        if (!data.character.seed) data.character.seed = `${data.character.name || 'sdf'}-${data.character.job?.id || 'x'}`;
        if (!data.character.gender) data.character.gender = genderFromName(data.character.name || '');
        return {
          character: data.character,
          dayActions: data.dayActions || 0,
          screen: 'main',
        };
      }
    }
  } catch { /* silent fail */ }
  return null;
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* silent fail */ }
}

export function loadHighScores(): { name: string; days: number; score: number }[] {
  try {
    const saved = localStorage.getItem(SCORES_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* silent fail */ }
  return [];
}

function saveHighScore(name: string, days: number, score: number) {
  try {
    const scores = loadHighScores();
    scores.push({ name, days, score });
    // Classement par jours de survie (le score départage les ex æquo).
    scores.sort((a, b) => b.days - a.days || b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch { /* silent fail */ }
}

// Le « recordman » : celui qui a survécu le plus longtemps. Sert aux clins
// d'œil semés dans le jeu (voir makeLegendEvent, TitleScreen). On n'en fait
// une légende qu'à partir de 4 jours pour éviter les références triviales.
export function getLegend(scores: { name: string; days: number; score: number }[]): { name: string; days: number } | null {
  if (!scores || scores.length === 0) return null;
  const top = [...scores].sort((a, b) => b.days - a.days || b.score - a.score)[0];
  if (!top || top.days < 4) return null;
  return { name: top.name, days: top.days };
}

// ============ REDUCER ============
type GameAction =
  | { type: 'START_GAME' }
  | { type: 'GENERATE_CHARACTERS' }
  // Tire le personnage suivant PENDANT l'écran de mort, pour pouvoir
  // l'annoncer par son nom : on ne quitte plus une partie finie, on quitte une
  // partie déjà commencée (voir GameOverScreen).
  | { type: 'PREPARE_SUCCESSOR' }
  | { type: 'SELECT_CHARACTER'; index: number }
  | { type: 'EXPLORE' }
  | { type: 'BEG' }
  | { type: 'STEAL' }
  | { type: 'RESOLVE_STEAL'; tier: 'fail' | 'ok' | 'jackpot' | 'hot'; targetId: string }
  | { type: 'RESOLVE_BEG'; coins: number; copTapped: boolean; dignitySpent?: number; fightWith?: string }
  | { type: 'SALVAGE' }
  | { type: 'RESOLVE_SALVAGE'; centimes: number; bazar: number; trouvailles: string[]; depth: number; busted: boolean; hurts: string[]; extraKept: number }
  | { type: 'REST' }
  | { type: 'DOUBLE_REWARD' }
  // Rachète la dignité tout juste perdue, juste assez pour ne pas quitter son
  // palier : une pub restaure une perte bien mieux qu'elle n'offre un gain.
  | { type: 'KEEP_FACE' }
  // Le carton du matin dépose son cadeau dans le sac quand une partie est en
  // cours (sinon il attend le prochain personnage, voir lib/daily).
  | { type: 'CLAIM_CARTON'; item: InventoryItem }
  | { type: 'TRAVEL'; location: string }
  | { type: 'CHOOSE_EVENT'; choiceIndex: number; boosted?: boolean }
  | { type: 'DISMISS_RESULT' }
  | { type: 'DISMISS_DAY_SUMMARY' }
  | { type: 'NEXT_DAY' }
  | { type: 'SET_SCREEN'; screen: GameScreen }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'SELL_ITEM'; itemId: string }
  | { type: 'CRAFT'; recipeId: string }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART' }
  | { type: 'REVIVE' }
  | { type: 'RESET_SCORES' }
  | { type: 'CONTINUE_SAVE' }
  | { type: 'START_COMBAT'; enemy: Enemy }
  | { type: 'PLAY_SIGN'; sign: SignId | 'special' }
  | { type: 'FLEE_ATTEMPT' }
  | { type: 'DODGE_RESULT'; hits: number }
  | { type: 'PLAY_CARD'; cardId: string; junkItemId?: string }
  | { type: 'BUY_ITEM'; shopItem: ShopItem; actualPrice: number }
  | { type: 'RESOLVE_HAGGLE'; shopId: string; broken: boolean; cut: number; spent: Partial<Stats>; tradedItemId?: string }
  | { type: 'REOPEN_SHOP'; shopId: string }
  | { type: 'CLAIM_SOLIDARITY' }
  | { type: 'DISMISS_ORIGIN' }
  | { type: 'RESOLVE_ENCOUNTER'; kind: 'share' | 'trade' | 'pass'; offer?: { item: InventoryItem; price: number } }
  | { type: 'TRIGGER_SHOP_EVENT'; event: ShopEvent };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      clearSave();
      return { ...state, screen: 'character-select', characterChoices: generateCharacterTrio(), deathCause: null };

    case 'GENERATE_CHARACTERS':
      return { ...state, characterChoices: generateCharacterTrio() };

    case 'PREPARE_SUCCESSOR':
      // Une seule fois par mort : le successeur annoncé doit rester le même
      // tant que le joueur est sur l'écran de fin.
      if (state.characterChoices.length > 0) return state;
      return { ...state, characterChoices: generateCharacterTrio() };

    case 'SELECT_CHARACTER': {
      const char = state.characterChoices[action.index];
      // Dernières volontés + kits de L'Héritage : tout ce qui attendait le
      // prochain personnage est déposé sur son carton au départ.
      const legacy = peekLegacy();
      clearLegacy();
      const kits = takePendingKits();
      const cartons = takePendingGifts();
      const firstContract = { id: randomFromArray(CONTRACTS).id, done: false };
      let inventory = [...char.inventory];
      let money = char.money;
      const gifts: string[] = [];
      // Le Sceptre du Roi ne se transmet jamais, même par un legs enregistré
      // avant cette règle : la couronne s'arrache, elle ne s'hérite pas.
      if (legacy && legacy.item?.id !== 'sceptre-roi' && inventory.length < 20) {
        inventory.push(legacy.item);
        gifts.push(L(`${legacy.item.name}, l'héritage de ${legacy.from}`, `the ${tc(legacy.item.name)}, ${legacy.from}'s legacy`));
      }
      // Ce que le carton du matin a laissé pendant qu'aucune partie ne tournait.
      for (const id of cartons) {
        const def = SALVAGE_JUNK.find(i => i.id === id) || trouvailleById(id);
        if (!def || inventory.length >= 20) continue;
        inventory.push({ ...def });
        gifts.push(L(def.name, tc(def.name)));
      }
      for (const kit of kits) {
        const def = HERITAGE_KITS.find(k => k.id === kit);
        if (!def) continue;
        def.items.forEach(it => { if (inventory.length < 20) inventory.push({ ...it }); });
        money += def.money;
        gifts.push(L(def.name, def.nameEn));
      }
      if (gifts.length > 0) {
        return {
          ...state, screen: 'main', dayActions: 0, contract: firstContract,
          // Le trio est consommé : sans ça, la mort suivante annoncerait comme
          // successeur un personnage de ce trio-ci, déjà joué.
          characterChoices: [],
          character: { ...char, inventory, money },
          eventResult: {
            text: L(
              `🎁 Sur votre carton, quelqu'un a déposé : ${gifts.join(', ')}. La rue se souvient.`,
              `🎁 Left on your cardboard: ${gifts.join(', ')}. The street remembers.`,
            ),
            image: '/assets/result-cadeau-carton.webp',
          },
        };
      }
      return { ...state, screen: 'main', character: char, characterChoices: [], dayActions: 0, contract: firstContract };
    }

    case 'CONTINUE_SAVE': {
      const saved = loadGame();
      if (saved && saved.character) {
        return { ...state, ...saved, weather: (saved as Partial<GameState>).weather || getInitialWeather(), contract: { id: randomFromArray(CONTRACTS).id, done: false } };
      }
      return state;
    }

    case 'EXPLORE': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      // Au bord du gouffre, le Sursaut passe avant tout (une fois par run).
      if (dueSursaut(state.character)) {
        return { ...state, screen: 'event', currentEvent: SURSAUT_EVENT, dayActions: state.dayActions + 1 };
      }
      // De temps en temps (~8 %), la rue évoque le recordman.
      const legend = getLegend(state.highScores);
      if (legend && Math.random() < 0.08) {
        return { ...state, screen: 'event', currentEvent: makeLegendEvent(legend), dayActions: state.dayActions + 1 };
      }
      const events = generateEvents(state.character.location, state.character);
      if (events.length === 0) return state;
      const event = randomFromArray(events);
      return { ...state, screen: 'event', currentEvent: event, dayActions: state.dayActions + 1,
        character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, event.id) } };
    }

    case 'BEG': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      // Le mini-jeu "attraper les pièces" reste la voie principale (~3 fois
      // sur 4) ; l'événement narratif de mendicité est l'exception qui garde
      // le contenu écrit vivant.
      if (Math.random() < 0.28) {
        const begEvents = generateBegEvents(state.character.location, state.character);
        if (begEvents.length > 0) {
          const begEvt = randomFromArray(begEvents);
          return { ...state, screen: 'event', currentEvent: begEvt, dayActions: state.dayActions + 1,
            character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, begEvt.id) } };
        }
      }
      return { ...state, screen: 'beg-game', dayActions: state.dayActions + 1 };
    }

    case 'RESOLVE_BEG': {
      if (!state.character) return state;
      const c = state.character;
      // La météo module la générosité des passants (comme les anciens events).
      const modifier = WEATHER_TYPES[state.weather].actionModifier;

      // Répercussion : le policier vous verbalise pour mendicité (amende),
      // et confisque la récolte du jour.
      if (action.copTapped) {
        const amende = Math.min(c.money, 4 + Math.floor(Math.random() * 4)); // 4-7€ selon les moyens
        const statDelta: Partial<Stats> = { dignity: -10, mental: -6 };
        const newStats = applyStatDelta(c.stats, statDelta);
        const isAlive = newStats.health > 0 && newStats.mental > 0;
        if (!isAlive) { saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money - amende, hasTrait(c, 'poissard'))); clearSave(); }
        return {
          ...state,
          character: { ...c, stats: newStats, money: c.money - amende, alive: isAlive },
          eventResult: {
            text: L(`👮 « Mendicité sur la voie publique, circulez ! » Le policier confisque votre récolte${amende > 0 ? ` et vous colle ${amende}€ d'amende` : ', insolvable, vous repartez avec un avertissement'}.`, `👮 "Begging in public, move along!" The cop confiscates your takings${amende > 0 ? ` and slaps you with a €${amende} fine` : ', broke, so you leave with a warning'}.`),
            statChanges: statDelta, moneyChange: -amende, image: '/assets/result-beg-police.webp',
          },
          screen: isAlive ? 'main' : 'game-over',
        };
      }

      // L'allure compte : les passants donnent plus à qui garde sa dignité
      // (×0,7 à 0 de dignité → ×1,2 à 100).
      const dignityMod = 0.7 + (c.stats.dignity / 100) * 0.5;
      const money = Math.round(action.coins * modifier * dignityMod);
      // La fierté qu'on a laissée en insistant, passant par passant, s'ajoute
      // au coût de base de la manche. Forcer le regard, ça se paie.
      const insisted = Math.min(BEG_TUNING.maxDignitySpent, Math.max(0, Math.round(action.dignitySpent || 0)));
      const statDelta: Partial<Stats> = money >= 6
        ? { dignity: -3 - insisted, mental: 6 }
        : { dignity: -4 - insisted, mental: money > 0 ? 2 : -4 };
      const respectDelta = money >= 8 ? 1 : 0;
      const newStats = applyStatDelta(c.stats, statDelta);
      const isAlive = newStats.health > 0 && newStats.mental > 0;
      const prefix = money >= 8 ? L('🎩 Manche exceptionnelle ! ', '🎩 An exceptional haul! ')
        : money > 0 ? L('🪙 Quelques pièces au fond du chapeau. ', '🪙 A few coins in the bottom of the hat. ')
        : L('💨 Pas un sou aujourd\'hui. ', '💨 Not a penny today. ');
      const weatherNote = modifier !== 1 ? (modifier > 1 ? L(' Le beau temps a rendu les passants généreux.', ' The good weather made passers-by generous.') : L(' Le mauvais temps a fait fuir les passants.', ' The bad weather scared off passers-by.')) : '';
      const dignityNote = c.stats.dignity >= 70 ? L(' Votre allure soignée a inspiré confiance.', ' Your neat appearance inspired trust.')
        : c.stats.dignity < 25 ? L(' Votre allure négligée a fait fuir plus d\'un passant.', ' Your unkempt look scared off more than one passer-by.') : '';
      const insistNote = insisted >= 8 ? L(' Vous avez retenu des manches un peu trop longtemps : ça se paie en fierté.', ' You held on to a few sleeves a bit too long: that costs pride.')
        : insisted >= 3 ? L(' Vous avez un peu insisté.', ' You pushed it a little.') : '';
      if (!isAlive) {
        saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money + money, hasTrait(c, 'poissard')));
        clearSave();
      }
      // Variante réussite/échec par scène de manche (result-beg-<id>-good/bad),
      // avec repli sur l'image de base de la scène.
      const begEvt = randomFromArray(BEG_EVENTS);
      const cUpd = { ...c, stats: newStats, money: c.money + money, respect: c.respect + respectDelta, alive: isAlive };

      // On a poussé quelqu'un à bout : il ne s'en va pas, il se retourne.
      // La récolte est acquise, mais la journée continue les poings serrés.
      if (isAlive && action.fightWith) {
        const foe = enemyByName(action.fightWith);
        if (foe) {
          return {
            ...state,
            character: cUpd,
            screen: 'combat',
            currentCombat: makeCombatState(foe, cUpd),
            combatLog: [L(
              `${foe.emoji} Vous avez insisté une seconde de trop. ${foe.name} se retourne : « tu me lâches, oui ? »`,
              `${foe.emoji} You pushed it one second too far. ${tc(foe.name)} turns around: "will you get off my back?"`,
            )],
          };
        }
      }

      return {
        ...state,
        character: cUpd,
        eventResult: { text: prefix + tc(flavorFrom(BEG_EVENTS, money > 0)) + weatherNote + dignityNote + insistNote, statChanges: statDelta, moneyChange: money, respectChange: respectDelta, image: `/assets/result-${begEvt.id}-${money > 0 ? 'good' : 'bad'}.webp`, fallbackImage: begEvt.image },
        screen: isAlive ? 'main' : 'game-over',
      };
    }

    case 'SALVAGE': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      return { ...state, screen: 'salvage-game', dayActions: state.dayActions + 1 };
    }

    case 'RESOLVE_SALVAGE': {
      if (!state.character) return state;
      const c = state.character;
      const money = salvagePayout(action.centimes);
      // Le Bricoleur sait quoi garder : une bricole de plus dans les poches.
      // Le Collectionneur et le Bricoleur repartent les poches plus pleines.
      const wanted = action.bazar + (action.bazar > 0 ? action.extraKept : 0);
      const kept = Math.min(SALVAGE_TUNING.maxKept + action.extraKept, Math.max(0, wanted));
      const inventory = [...c.inventory];
      let added = 0;
      for (let i = 0; i < kept && inventory.length < 20; i++) {
        inventory.push({ ...randomFromArray(SALVAGE_JUNK) });
        added++;
      }
      // Les trouvailles du fond passent avant les bricoles dans le sac ; si
      // l'inventaire déborde, c'est la ferraille qu'on laisse, pas le manteau.
      const found: string[] = [];
      for (const id of action.trouvailles) {
        const item = trouvailleById(id);
        if (!item) continue;
        if (inventory.length >= 20) {
          const junkIdx = inventory.findIndex(i => i.type === 'junk');
          if (junkIdx === -1) break;
          inventory.splice(junkIdx, 1);
          if (added > 0) added--;
        }
        inventory.push({ ...item });
        found.push(tc(item.name));
      }

      // Fouiller les poubelles coûte à la fierté, et d'autant plus qu'on est
      // descendu bas. Se faire surprendre les bras dedans achève le moral.
      const deep = action.depth;
      // Ce que les saletés réveillées ont fait AU CORPS : les os en mousse se
      // coupent sur les tessons, le ventre sur pattes mange ce qu'il déterre.
      const bodily = action.hurts.reduce((acc, id) => {
        const h = piegeHurts(c, id);
        return { health: acc.health + h.health, hunger: acc.hunger + h.hunger };
      }, { health: 0, hunger: 0 });
      // L'Optimiste ne se laisse pas abattre par une fouille ratée.
      const moralMul = hasTrait(c, 'optimiste') ? 0.5 : 1;
      // Un métabolisme rapide transforme la fouille en fringale.
      const hungerMul = hasTrait(c, 'metabolisme') ? 2 : 1;
      const statDelta: Partial<Stats> = action.busted
        ? {
            dignity: -6 - deep,
            mental: Math.round(-9 * moralMul),
            health: -4 + bodily.health,
            hunger: Math.round(-4 * hungerMul) + bodily.hunger,
          }
        : {
            dignity: -4 - Math.floor(deep / 2),
            mental: money > 0 || added > 0 || found.length > 0 ? 3 : Math.round(-3 * moralMul),
            health: bodily.health,
            hunger: Math.round(-3 * hungerMul) + bodily.hunger,
          };
      const newStats = applyStatDelta(c.stats, statDelta);
      const isAlive = newStats.health > 0 && newStats.mental > 0;
      if (!isAlive) { saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money + money, hasTrait(c, 'poissard'))); clearSave(); }

      const haul = [
        money > 0 ? L(`${money}€ de consigne`, `€${money} of deposit`) : '',
        added > 0 ? L(`${added} bricole${added > 1 ? 's' : ''}`, `${added} part${added > 1 ? 's' : ''}`) : '',
        found.length > 0 ? found.join(', ') : '',
      ].filter(Boolean).join(L(', ', ', '));

      const savedNote = action.busted && (money > 0 || added > 0)
        ? L(' Vous avez quand même filé avec ce que vous teniez.', ' You still legged it with what was in your hands.')
        : '';
      const text = action.busted
        ? L(
            `🐀 Le tas a gagné. Ce que vous aviez sorti est resté au fond, avec le reste.${savedNote} ${deep >= 3 ? 'Il fallait remonter plus tôt.' : 'Ça arrive.'}`,
            `🐀 The pile won. What you'd pulled out stayed down there with the rest.${savedNote} ${deep >= 3 ? 'You should have climbed out sooner.' : 'It happens.'}`,
          )
        : haul === ''
          ? L('🗑️ Vingt minutes les bras dans les ordures pour rien. Même les rats vous ont regardé avec pitié.',
              '🗑️ Twenty minutes elbow-deep in rubbish for nothing. Even the rats looked at you with pity.')
          : L(
              `♻️ Vous ressortez avec ${haul}.${deep >= 3 ? ' Vous êtes descendu loin, et vous êtes remonté à temps.' : ''}`,
              `♻️ You come out with ${haul}.${deep >= 3 ? ' You went deep, and you got out in time.' : ''}`,
            );

      return {
        ...state,
        character: { ...c, stats: newStats, money: c.money + money, inventory, alive: isAlive },
        eventResult: { text, statChanges: statDelta, moneyChange: money, ...salvageResultImage(action.busted, haul === '') },
        screen: isAlive ? 'main' : 'game-over',
      };
    }

    case 'STEAL': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      // Chaque tentative incrémente le compteur (durcit le mini-jeu).
      const stealChar = { ...state.character, stealCount: (state.character.stealCount ?? 0) + 1 };
      // 1 fois sur 3 : un vol « à texte » (choix + risque) au lieu du mini-jeu,
      // pour varier les occasions de voler.
      if (Math.random() < 0.34) {
        const stealEvt = randomFromArray(freshPool(STEAL_EVENTS, stealChar.recentEvents));
        return {
          ...state,
          character: { ...stealChar, recentEvents: rememberEvent(stealChar.recentEvents, stealEvt.id) },
          screen: 'event',
          currentEvent: stealEvt,
          dayActions: state.dayActions + 1,
        };
      }
      // Sinon : le mini-jeu du casse (voir StealHeist).
      return {
        ...state,
        character: stealChar,
        screen: 'steal-game',
        dayActions: state.dayActions + 1,
      };
    }

    case 'RESOLVE_STEAL': {
      if (!state.character) return state;
      const c = state.character;
      const target = getHeistTarget(action.targetId) || HEIST_TARGETS[0];

      // Échec : répercussions selon qui vous attrape.
      if (action.tier === 'fail') {
        const repercussion = Math.random();
        if (target.catcher === 'vigile' && repercussion < 0.7) {
          // La société de gardiennage envoie son mur : combat très difficile.
          const enemy = ENEMIES.find(e => e.name === 'Vigile de Choc')!;
          return {
            ...state,
            screen: 'combat',
            currentCombat: makeCombatState(enemy, c),
            combatLog: [
              L(`🦺 Pris la main sur ${target.label} ! Une ombre massive bouche la sortie : le Vigile de Choc. Il craque ses cervicales.`, `🦺 Caught with your hand on ${target.labelEn}! A massive shadow blocks the exit: the Shock Guard. He cracks his neck.`),
              L('⚠️ Celui-là ne plaisante pas. La fuite est peut-être la meilleure carte.', '⚠️ This one isn\'t joking. Fleeing might be your best card.'),
            ],
          };
        }
        if (target.catcher === 'commercant' && repercussion < 0.5) {
          // Le commerçant veut en découdre : bagarre immédiate !
          const enemy = ENEMIES.find(e => e.name === 'Commerçant Furieux')!;
          return {
            ...state,
            screen: 'combat',
            currentCombat: makeCombatState(enemy, c),
            combatLog: [L(`😡 Vous êtes surpris la main sur ${target.label} ! Le commerçant retrousse ses manches...`, `😡 You're caught with your hand on ${target.labelEn}! The shopkeeper rolls up his sleeves...`)],
          };
        }
        if (target.catcher === 'police' && repercussion < 0.5) {
          // La police vous embarque : garde à vue, journée finie + amende
          // (proportionnelle à l'ambition du coup).
          const amende = Math.min(c.money, target.difficulty === 'grand' ? 12 : target.difficulty === 'risque' ? 5 : 3);
          const statDelta: Partial<Stats> = { dignity: -15, mental: -8 };
          const newStats = applyStatDelta(c.stats, statDelta);
          const isAlive = newStats.health > 0 && newStats.mental > 0;
          if (!isAlive) { saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money - amende, hasTrait(c, 'poissard'))); clearSave(); }
          return {
            ...state,
            character: { ...c, stats: newStats, money: c.money - amende, respect: c.respect - 3, alive: isAlive },
            dayActions: state.maxDayActions,
            eventResult: {
              text: L(`🚔 Un policier vous cueille la main sur ${target.label}. Garde à vue ! Vous perdez le reste de la journée${amende > 0 ? ` et ${amende}€ d'amende` : ', insolvable, il vous laisse filer avec un avertissement'}.`, `🚔 A cop nabs you with your hand on ${target.labelEn}. Held in custody! You lose the rest of the day${amende > 0 ? ` and a €${amende} fine` : ', broke, so he lets you off with a warning'}.`),
              statChanges: statDelta, moneyChange: -amende, respectChange: -3, image: '/assets/result-steal-police.webp',
            },
            screen: isAlive ? 'main' : 'game-over',
          };
        }
        // Sinon : raclée / fuite honteuse (plus brutale si c'était des vigiles).
        const rossee = target.catcher === 'vigile';
        const statDelta: Partial<Stats> = rossee
          ? { dignity: -14, health: -12, mental: -8 }
          : { dignity: -12, health: -6, mental: -6 };
        const newStats = applyStatDelta(c.stats, statDelta);
        const isAlive = newStats.health > 0 && newStats.mental > 0;
        if (!isAlive) { saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money, hasTrait(c, 'poissard'))); clearSave(); }
        return {
          ...state,
          character: { ...c, stats: newStats, respect: c.respect - 2, alive: isAlive },
          eventResult: {
            text: rossee
              ? L(`🦺 Raté ! Les vigiles vous « raccompagnent » loin de ${target.label}, réglementairement mais très fermement. Tout fait mal.`, `🦺 Failed! The guards "escort" you away from ${target.labelEn}, by the book but very firmly. Everything hurts.`)
              : L(`🚨 Raté ! Repéré en tentant de voler ${target.label}, vous fuyez sous les insultes, un peu amoché.`, `🚨 Failed! Spotted trying to steal ${target.labelEn}, you flee amid insults, a little battered.`),
            statChanges: statDelta, respectChange: -2, image: '/assets/result-steal-fail.webp',
          },
          screen: isAlive ? 'main' : 'game-over',
        };
      }

      // Réussite (ok / jackpot / sortie à chaud) : le butin suit le profil de
      // la cible. Objet : garanti au coup de maître, une chance sur deux sinon.
      const jackpot = action.tier === 'jackpot';
      const hot = action.tier === 'hot';
      const roll = target.moneyMin + Math.floor(Math.random() * (target.moneyMax - target.moneyMin + 1));
      const moneyDelta = jackpot ? target.moneyMax + 3 : hot ? Math.min(target.moneyMax, roll + 2) : roll;
      const respectDelta = hot ? (target.difficulty === 'grand' ? 3 : 2) : jackpot ? 2 : 0;
      const gotItem = target.item && (jackpot || Math.random() < 0.5) ? target.item : undefined;
      const statDelta: Partial<Stats> = jackpot ? { dignity: -4, mental: 6 } : hot ? { dignity: -5, mental: 5 } : { dignity: -6, mental: 2 };
      const newStats = applyStatDelta(c.stats, statDelta);
      const itemNote = gotItem ? L(` Et dans le sac : ${gotItem.name} ${gotItem.emoji}.`, ` And into the bag: ${gotItem.name} ${gotItem.emoji}.`) : '';
      const text = (jackpot
        ? L(`💎 Coup de maître ! Vous repartez avec ${target.label} sans que personne ne remarque rien : ${moneyDelta}€.`, `💎 Masterstroke! You walk off with ${target.labelEn} without anyone noticing a thing: €${moneyDelta}.`)
        : hot
          ? L(`🚨 Sortie en plein bouclage ! Vous filez avec ${target.label} sous le nez des renforts. Le quartier ne parle que de votre culot : ${moneyDelta}€.`, `🚨 Out mid-lockdown! You slip away with ${target.labelEn} right under the reinforcements' noses. The block talks of nothing but your nerve: €${moneyDelta}.`)
          : L(`🤫 Vol réussi. Vous filez avec ${target.label}, le cœur battant. Ça vaut bien ${moneyDelta}€.`, `🤫 Theft successful. You slip away with ${target.labelEn}, heart pounding. Worth a good €${moneyDelta}.`)) + itemNote;
      return {
        ...state,
        character: {
          ...c, stats: newStats, money: c.money + moneyDelta, respect: c.respect + respectDelta,
          inventory: gotItem ? [...c.inventory, gotItem] : c.inventory,
        },
        eventResult: { text, statChanges: statDelta, moneyChange: moneyDelta, respectChange: respectDelta, image: '/assets/result-steal-success.webp' },
        screen: 'main',
      };
    }

    case 'REST': {
      if (!state.character || state.dayActions >= state.maxDayActions) return state;
      if (dueSursaut(state.character)) {
        return { ...state, screen: 'event', currentEvent: SURSAUT_EVENT, dayActions: state.dayActions + 1 };
      }
      const restEvents = generateRestEvents(state.character.location, state.character);
      if (restEvents.length === 0) return state;
      const restEvent = randomFromArray(restEvents);
      return { ...state, screen: 'event', currentEvent: restEvent, dayActions: state.dayActions + 1,
        character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, restEvent.id) } };
    }

    case 'CLAIM_CARTON': {
      if (!state.character) return state;
      const c = state.character;
      if (c.inventory.length >= 20) return state;
      return { ...state, character: { ...c, inventory: [...c.inventory, { ...action.item }] } };
    }

    case 'KEEP_FACE': {
      if (!state.character || !state.eventResult || state.eventResult.faceKept) return state;
      const c = state.character;
      // On remonte au plancher du palier qu'on vient de quitter — pas plus.
      // L'offre restaure une allure, elle ne fabrique pas de la fierté.
      const perdu = Math.abs(state.eventResult.statChanges?.dignity ?? 0);
      const avant = Math.min(100, c.stats.dignity + perdu);
      const cible = DIGNITY_TIERS.find(t => avant >= t.min);
      if (!cible || c.stats.dignity >= cible.min) return state;
      return {
        ...state,
        character: { ...c, stats: { ...c.stats, dignity: cible.min } },
        eventResult: { ...state.eventResult, faceKept: true },
      };
    }

    case 'DOUBLE_REWARD': {
      // Doubler les gains via pub récompensée : ajoute une seconde fois
      // l'argent gagné dans le résultat courant. Utilisable une fois par résultat.
      if (!state.character || !state.eventResult) return state;
      const gain = state.eventResult.moneyChange || 0;
      if (gain <= 0 || state.eventResult.doubled) return state;
      return {
        ...state,
        character: { ...state.character, money: state.character.money + gain },
        eventResult: { ...state.eventResult, doubled: true },
      };
    }

    case 'TRAVEL': {
      if (!state.character) return state;
      const travelEvent = generateTravelEvent(state.character.location, action.location, state.character);
      // Sens de l'Orientation : connaître les raccourcis rend le trajet moins
      // pénible, petit regain de moral à chaque voyage.
      const hasOrientation = state.character.traits.some(t => t.id === 'orientation');
      const movedStats = hasOrientation
        ? clampStats({ ...state.character.stats, mental: state.character.stats.mental + 2 })
        : state.character.stats;
      const newChar = { ...state.character, location: action.location, stats: movedStats };
      if (travelEvent) {
        return { ...state, character: { ...newChar, recentEvents: rememberEvent(newChar.recentEvents, travelEvent.id) }, screen: 'event', currentEvent: travelEvent };
      }
      return { ...state, character: newChar, screen: 'main' };
    }

    case 'CHOOSE_EVENT': {
      if (!state.currentEvent || !state.character) return state;
      const choice = state.currentEvent.choices[action.choiceIndex];

      let outcome = choice.outcomes[0];
      // Valeur « heureuse » d'une issue (sert au coup de pouce et au Poissard).
      const outcomeScore = (o: EventOutcome) =>
        (o.moneyChange || 0) + (o.respectChange || 0) * 2 +
        Object.values(o.statChanges || {}).reduce((a, b) => a + (b || 0), 0) +
        (o.itemGain ? 5 : 0) - (o.itemLoss ? 3 : 0);
      if (action.boosted) {
        // Coup de pouce (pub) : on force la meilleure issue du choix.
        outcome = [...choice.outcomes].sort((a, b) => outcomeScore(b) - outcomeScore(a))[0];
      } else {
        const roll = Math.random();
        let cumProb = 0;
        for (const o of choice.outcomes) {
          cumProb += o.probability;
          if (roll <= cumProb) { outcome = o; break; }
        }
        // Poissard : une fois sur quatre, le destin rechoisit… la pire issue.
        // (Contrepartie du score ×2, voir computeScore.)
        if (choice.outcomes.length > 1 && state.character.traits.some(t => t.id === 'poissard') && Math.random() < 0.25) {
          outcome = [...choice.outcomes].sort((a, b) => outcomeScore(a) - outcomeScore(b))[0];
        }
      }

      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      let newMoney = Math.max(0, state.character.money + (outcome.moneyChange || 0));
      if (newMoney < 0) newMoney = 0;
      const newRespect = state.character.respect + (outcome.respectChange || 0);

      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < 20) {
        newInventory.push(outcome.itemGain);
      }
      if (outcome.itemLoss) {
        newInventory = newInventory.filter(i => i.id !== outcome.itemLoss);
      }

      // Handle flags for event chains
      let newFlags = [...state.character.activeFlags];
      if (outcome.addFlag && !newFlags.includes(outcome.addFlag)) {
        newFlags.push(outcome.addFlag);
      }
      if (outcome.removeFlag) {
        newFlags = newFlags.filter(f => f !== outcome.removeFlag);
      }

      // Handle follow-up events

      const isAlive = newStats.health > 0 && newStats.mental > 0;

      if (!isAlive) {
        const score = computeScore(state.character.day, newRespect, newMoney, hasTrait(state.character, 'poissard'));
        saveHighScore(state.character.name, state.character.day, score);
        clearSave();
      }

      // Image du résultat : d'abord la VARIANTE réussite/échec de l'événement
      // (result-<id>-good/bad.webp, générée par vagues), sinon l'image de la
      // rencontre, sinon la scène dessinée (chaîne de replis côté overlay).
      const resultValue = (outcome.moneyChange || 0) +
        Object.values(outcome.statChanges || {}).reduce((a, b) => a + (b || 0), 0) +
        (outcome.respectChange || 0);
      const variant = `/assets/result-${state.currentEvent.id}-${resultValue > 0 ? 'good' : 'bad'}.webp`;

      return {
        ...state,
        screen: isAlive ? 'event' : 'game-over',
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory, alive: isAlive, activeFlags: newFlags },
        currentEvent: null,
        eventResult: { text: outcome.text, statChanges: outcome.statChanges, moneyChange: outcome.moneyChange, respectChange: outcome.respectChange, image: variant, fallbackImage: state.currentEvent.image },
      };
    }

    case 'DISMISS_RESULT':
      return { ...state, eventResult: null, screen: state.character?.alive ? 'main' : 'game-over' };

    case 'DISMISS_DAY_SUMMARY':
      return { ...state, daySummary: null };

    case 'NEXT_DAY': {
      if (!state.character) return state;
      const ch = state.character;
      const nextWeather = getNextWeather(state.weather);
      const weatherData = WEATHER_TYPES[state.weather];
      const weatherPenalty = weatherData.dailyPenalty;
      const traits = new Set(ch.traits.map(t => t.id));
      const cold = state.weather === 'snow' || state.weather === 'storm' || state.weather === 'cloudy';

      // Decay de base, puis météo.
      const baseDecayed = applyDailyDecay(ch.stats);
      const s = {
        health: baseDecayed.health + (weatherPenalty.health || 0),
        mental: baseDecayed.mental + (weatherPenalty.mental || 0),
        hunger: baseDecayed.hunger + (weatherPenalty.hunger || 0),
        thirst: baseDecayed.thirst + (weatherPenalty.thirst || 0),
        sleep: baseDecayed.sleep + (weatherPenalty.sleep || 0),
        dignity: baseDecayed.dignity + (weatherPenalty.dignity || 0),
      };

      // ---- Effets passifs de traits, appliqués chaque nuit ----
      const notes: string[] = [];
      const notesEn: string[] = [];
      let inventory = ch.inventory;
      let bonusMoney = 0;

      if (traits.has('metabolisme')) s.health += 6;                    // Guérit vite
      if (traits.has('estomac-acier')) s.hunger += 5;                  // Digère lentement : moins faim
      if (traits.has('optimiste')) s.mental += 5;                      // Le mental remonte plus vite
      if (traits.has('insomniaque')) s.sleep += 8;                     // Moins de sommeil requis
      if (traits.has('sommeil-plomb')) s.sleep += 6;                   // Récupère mieux la nuit
      if (traits.has('resistant-froid') && cold) {                     // Dort dehors sans souffrir du froid
        s.health += Math.abs(weatherPenalty.health || 0);
        notes.push('❄️ Le froid ne vous atteint pas.'); notesEn.push('❄️ The cold doesn\'t touch you.');
      }
      if (traits.has('collectionneur') && ch.inventory.length >= 18) { // Bonus moral si sac plein
        s.mental += 6; notes.push('📦 Votre collection vous réconforte.'); notesEn.push('📦 Your hoard comforts you.');
      }
      if (traits.has('phobie-rats') && ch.location === 'zone-industrielle') { // Panique en zone industrielle
        s.mental -= 8; notes.push('🐀 Les rats du coin vous rongent le moral.'); notesEn.push('🐀 The local rats gnaw at your nerves.');
      }
      if (traits.has('main-verte') && Math.random() < 0.5) {           // Fait pousser des choses
        s.hunger += 12; notes.push('🌿 Vos plants ont donné : un petit repas gratuit.'); notesEn.push('🌿 Your plants bore fruit: a small free meal.');
      }
      if (traits.has('ami-pigeons')) {                                 // Les oiseaux apportent des choses
        const roll = Math.random();
        if (roll < 0.35 && inventory.length < 20) {
          const gift = STARTING_ITEMS[randomFromArray(['cable-usb', 'crayon', 'graines', 'harmonica-casse'])];
          if (gift) { inventory = [...inventory, { ...gift }]; notes.push(`🐦 Un pigeon vous dépose : ${gift.name}.`); notesEn.push(`🐦 A pigeon drops off: ${tc(gift.name)}.`); }
        } else if (roll < 0.6) {
          bonusMoney += 2; notes.push('🐦 Vos pigeons vous rapportent 2€ de bricoles brillantes.'); notesEn.push('🐦 Your pigeons bring you €2 of shiny trinkets.');
        }
      }

      // ---- Contrat du matin : verdict de la journée écoulée ----
      let respectBonus = 0;
      const cDef = state.contract ? getContract(state.contract.id) : undefined;
      if (cDef) {
        const success = cDef.needsFlag ? state.contract!.done : !!cDef.check?.(ch);
        if (success) {
          if (cDef.reward.stats) Object.entries(cDef.reward.stats).forEach(([k, v]) => { if (v) (s as unknown as Record<string, number>)[k] += v; });
          bonusMoney += cDef.reward.money || 0;
          respectBonus += cDef.reward.respect || 0;
          notes.push(`${cDef.emoji} Contrat rempli (${cDef.rewardLabel}) : ${cDef.label}.`);
          notesEn.push(`${cDef.emoji} Contract fulfilled (${cDef.rewardLabelEn}): ${cDef.labelEn}.`);
        } else {
          notes.push(`${cDef.emoji} Contrat manqué : ${cDef.label}. Demain, peut-être.`);
          notesEn.push(`${cDef.emoji} Contract missed: ${cDef.labelEn}. Tomorrow, maybe.`);
        }
      }
      // Le contrat du nouveau jour, annoncé dans le bilan de la nuit.
      const nextContract = { id: randomFromArray(CONTRACTS).id, done: false };
      const nextDef = getContract(nextContract.id)!;
      notes.push(`📋 Contrat du jour : ${nextDef.label} (${nextDef.rewardLabel}).`);
      notesEn.push(`📋 Today's contract: ${nextDef.labelEn} (${nextDef.rewardLabelEn}).`);

      // ---- Titre de rue : franchit-on un palier de jours ? ----
      const crossed = STREET_TITLES.find(t => t.day === ch.day + 1);
      if (crossed) {
        respectBonus += crossed.respect;
        notes.push(`🏅 La rue vous appelle désormais « ${crossed.fr} » (+${crossed.respect} respect).`);
        notesEn.push(`🏅 The street now calls you "${crossed.en}" (+${crossed.respect} respect).`);
      }

      // ---- Pannes & fermetures de boutiques (imprévu qui monte avec les jours) ----
      const newDay = ch.day + 1;
      const prevClosures = ch.shopClosures || [];
      // Réouvertures : on annonce ce qui rouvre aujourd'hui.
      prevClosures.filter(c => c.untilDay === newDay).forEach(c => {
        const sh = SHOPS.find(s => s.id === c.shopId);
        if (sh) {
          notes.push(`🔓 ${sh.emoji} ${sh.name} a rouvert. La vie reprend.`);
          notesEn.push(`🔓 ${sh.emoji} ${tc(sh.name)} has reopened. Life goes on.`);
        }
      });
      let shopClosures = prevClosures.filter(c => c.untilDay > newDay);
      // Nouvelle panne ? Probabilité croissante, 2 fermetures simultanées max.
      const closureChance = Math.min(0.55, 0.12 + newDay * 0.03);
      if (shopClosures.length < 2 && Math.random() < closureChance) {
        const nc = rollShopClosure(shopClosures, newDay);
        if (nc) {
          shopClosures = [...shopClosures, nc];
          const sh = SHOPS.find(s => s.id === nc.shopId)!;
          const days = nc.untilDay - newDay;
          notes.push(`🚫 ${sh.emoji} ${sh.name} est fermé (${days} j) : ${nc.reason}`);
          notesEn.push(`🚫 ${sh.emoji} ${tc(sh.name)} is closed (${days}d): ${nc.reasonEn}`);
        }
      }

      const decayedStats = clampStats(s);
      const isAlive = decayedStats.health > 0 && decayedStats.mental > 0;

      if (!isAlive) {
        const score = computeScore(ch.day, ch.respect, ch.money, hasTrait(ch, 'poissard'));
        saveHighScore(ch.name, ch.day, score);
        clearSave();
      }

      // Bilan de la nuit : variations de jauges (par rapport à avant la nuit).
      const deltas: Partial<Stats> = {};
      (Object.keys(decayedStats) as (keyof Stats)[]).forEach((k) => {
        const d = decayedStats[k] - ch.stats[k];
        if (d !== 0) deltas[k] = d;
      });

      return {
        ...state,
        character: { ...ch, stats: decayedStats, day: ch.day + 1, alive: isAlive, inventory, money: ch.money + bonusMoney, respect: ch.respect + respectBonus, shopClosures },
        dayActions: 0,
        screen: isAlive ? 'main' : 'game-over',
        weather: nextWeather,
        contract: isAlive ? nextContract : null,
        daySummary: isAlive
          ? { day: ch.day + 1, weather: nextWeather, deltas, moneyChange: bonusMoney, notes, notesEn }
          : null,
      };
    }

    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'USE_ITEM': {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex(i => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      const gourmand = hasTrait(state.character, 'ventre-pattes');
      // Ventre sur Pattes : « mange n'importe quoi », le bric-à-brac se croque.
      if (!item.effect && gourmand && item.type === 'junk') {
        const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
        const junkDelta: Partial<Stats> = { hunger: 10, dignity: -2 };
        return {
          ...state,
          character: { ...state.character, stats: applyStatDelta(state.character.stats, junkDelta), inventory: newInv },
          eventResult: { text: L(`Vous mangez… ${item.name}. Oui, ça se mange. Enfin, VOUS, vous le mangez.`, `You eat… the ${tc(item.name)}. Yes, it's edible. Well, YOU eat it.`), statChanges: junkDelta, image: '/assets/result-objet-mange.webp' },
        };
      }
      if (!item.effect) return state;
      // Ventre sur Pattes : « en grande quantité », la nourriture cale +25 %.
      const effect: Partial<Stats> = { ...item.effect };
      if (gourmand && (effect.hunger ?? 0) > 0) effect.hunger = Math.round(effect.hunger! * 1.25);
      let newStats = { ...state.character.stats };
      Object.entries(effect).forEach(([key, val]) => {
        if (val) newStats[key as keyof Stats] += val;
      });
      newStats = clampStats(newStats);
      // Retire un seul exemplaire (pas tous les objets du même type).
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, stats: newStats, inventory: newInv },
        eventResult: { text: L(`Vous utilisez ${item.name}. Ça fait du bien !`, `You use the ${tc(item.name)}. That feels good!`), statChanges: effect, image: '/assets/result-objet-utilise.webp' },
      };
    }

    case 'SELL_ITEM': {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex(i => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      const price = getSellPrice(item);
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, money: state.character.money + price, inventory: newInv },
        eventResult: { text: L(`Vous revendez ${item.name} pour ${price}€. Chaque euro compte.`, `You sell the ${tc(item.name)} for €${price}. Every euro counts.`), moneyChange: price, image: '/assets/result-objet-vendu.webp' },
      };
    }

    case 'CRAFT': {
      if (!state.character) return state;
      const c = state.character;
      const recipe = RECIPES.find(r => r.id === action.recipeId);
      if (!recipe) return state;
      // Les recettes avancées demandent le trait Bricoleur.
      if (recipe.advanced && !hasTrait(c, 'bricoleur')) return state;
      const cost = recipeCost(recipe, c);
      // Consomme les objets « bazar » les moins précieux d'abord (par index).
      const rmIdx = pickMaterials(c, cost);
      if (rmIdx.length < cost) return state;
      const rm = new Set(rmIdx);
      const result = recipe.make();
      // On retire au moins un objet avant d'en ajouter un : jamais de débordement.
      const newInv = c.inventory.filter((_, i) => !rm.has(i));
      newInv.push(result);
      return {
        ...state,
        character: { ...c, inventory: newInv },
        eventResult: {
          text: L(
            `Vos mains se souviennent : vous bricolez ${recipe.name} ! Rien ne se perd, tout se transforme.`,
            `Your hands remember: you tinker up ${tc(recipe.name)}! Nothing is lost, everything gets remade.`,
          ),
          // L'objet fabriqué (craft-<id>.webp) ; repli scène dessinée si absent.
          image: `/assets/${result.id}.webp`,
        },
      };
    }

    case 'START_COMBAT': {
      if (!state.character) return state;
      return {
        ...state,
        screen: 'combat',
        currentCombat: makeCombatState(action.enemy, state.character),
        combatLog: [L(`${action.enemy.emoji} ${action.enemy.name} apparaît ! ${action.enemy.description}`, `${action.enemy.emoji} ${tc(action.enemy.name)} appears! ${tc(action.enemy.description)}`)],
      };
    }

    // Duel de signes : résout la manche (triangle, coup spécial, piège) et
    // oriente la suite, riposte (gagnée), esquive (perdue), manche suivante
    // (égalité ou effet neutre).
    case 'PLAY_SIGN': {
      if (!state.character || !state.currentCombat || state.currentCombat.phase !== 'sign') return state;
      const c = state.character;
      const combat = state.currentCombat;
      const logs = [...state.combatLog];
      const eSign = combat.enemySign;
      const eDef = SIGNS[eSign];
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      // Signe que le JOUEUR vient de jouer : les adversaires humains s'en
      // servent pour anticiper la manche suivante (voir rollSignRound).
      const playerSign: SignId | null = action.sign === 'special' ? (combat.lastPlayerSign ?? null) : action.sign;
      // Le piège se dégrade à chaque manche résolue (posé = 2 manches de vie).
      const trapAfter = Math.max(0, combat.trapRounds - 1);

      // Cartes d'une riposte, bonus de traits compris.
      const drawCount = (base: number, cap: number) => {
        let d = base;
        if (c.traits.some(t => t.id === 'collectionneur') && c.inventory.length >= 18) d += 1;
        if (c.traits.some(t => t.id === 'optimiste') && c.stats.mental < 30) d += 1;
        return Math.min(cap, d);
      };
      // Une manche gagnée recharge le coup spécial (2 usages max par combat).
      const rechargedSpecial = () => combat.specialCharged || (combat.specialId != null && combat.specialUses < 2);

      // Entrée dans la manche suivante : l'ennemi rechoisit un signe.
      const nextSignCombat = (over: Partial<CombatState>, guaranteedTell = false): CombatState => ({
        ...combat,
        hand: [],
        phase: 'sign',
        round: combat.round + 1,
        signNonce: combat.signNonce + 1,
        enemyStunned: false,
        trapRounds: trapAfter,
        lastPlayerSign: playerSign,
        ...rollSignRound(enemyLike, c, guaranteedTell, playerSign),
        ...over,
      });

      const victoryState = (cUpd: Character): GameState => {
        const lootMoney = combat.loot?.money || 0;
        const lootRespect = combat.loot?.respect || 0;
        // L'ennemi lâche parfois un objet à son image (sandwich, couteau…).
        const drop = combat.loot?.item && cUpd.inventory.length < 20 ? combat.loot.item : undefined;
        const en = tc(combat.enemyName);
        logs.push(L(`🎉 Victoire ! Vous avez vaincu ${combat.enemyName} !`, `🎉 Victory! You defeated ${en}!`));
        if (drop) logs.push(L(`${drop.emoji} Il lâche : ${drop.name} !`, `${drop.emoji} It drops: ${tc(drop.name)}!`));
        // Avoir battu le Roi en place, c'est ceindre la couronne.
        const wasKing = combat.enemyEmoji === '\u{1F451}';
        if (wasKing) logs.push(L('\u{1F451} La couronne vous revient : vous êtes le Roi du Carton !', '\u{1F451} The crown is yours: you are the Cardboard King!'));
        return {
          ...state,
          contract: state.contract?.id === 'contrat-combatif' ? { id: state.contract.id, done: true } : state.contract,
          character: { ...cUpd, money: cUpd.money + lootMoney, respect: cUpd.respect + lootRespect, inventory: drop ? [...cUpd.inventory, drop] : cUpd.inventory,
            ...(wasKing ? { crowned: true, kingsBeaten: (cUpd.kingsBeaten ?? 0) + 1 } : {}) },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `${L(`Victoire contre ${combat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}€` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`.trim(), `Victory over ${en}! ${lootMoney > 0 ? `+€${lootMoney}` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`.trim())}${drop ? L(` Il lâche ${drop.name} ${drop.emoji} !`, ` It drops the ${tc(drop.name)} ${drop.emoji}!`) : ''}`, moneyChange: lootMoney, respectChange: lootRespect, image: combat.image },
          screen: 'main',
        };
      };

      // Le piège à carton se déclenche avant tout : l'ennemi charge dedans.
      if (combat.trapRounds > 0 && eSign === 'strike') {
        const trapDmg = 9;
        const hp = Math.max(0, combat.enemyHealth - trapDmg);
        logs.push(L(`🪤 CLAC ! ${combat.enemyName} charge et marche en plein dans le piège à carton : ${trapDmg} dégâts, sonné !`, `🪤 SNAP! ${tc(combat.enemyName)} charges straight into the cardboard trap: ${trapDmg} damage, stunned!`));
        if (hp <= 0) return victoryState(c);
        return {
          ...state,
          currentCombat: { ...combat, enemyHealth: hp, trapRounds: 0, phase: 'draw', hand: generateHand(c, combat, drawCount(2, 3)), enemyStunned: true, specialCharged: rechargedSpecial() },
          combatLog: logs,
        };
      }

      // Coup spécial (4e signe, hors triangle) : chargé par les manches gagnées.
      if (action.sign === 'special') {
        const sp = combat.specialId ? SPECIAL_DEFS.find(s => s.id === combat.specialId) : undefined;
        if (!sp || !combat.specialCharged || combat.specialUses >= 2) return state;
        const spent = { specialCharged: false, specialUses: combat.specialUses + 1 };
        switch (sp.id) {
          case 'haleine': {
            if (eSign === 'guard') {
              logs.push(L('💨 Il se pince le nez derrière sa garde : l\'haleine se dissipe et il contre-attaque, furieux !', '💨 It pinches its nose behind its guard: the breath disperses and it counter-attacks, furious!'));
              return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: 'dodge', hand: [], dodgePenalty: 1.2 }, combatLog: logs };
            }
            logs.push(L('💨 HALEINE REDOUTABLE ! L\'ennemi suffoque, sonné, son prochain coup sera télégraphié.', '💨 DREADFUL BREATH! The foe gags, stunned, its next move will be telegraphed.'));
            return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: 'draw', hand: generateHand(c, combat, 3), enemyStunned: true }, combatLog: logs };
          }
          case 'piege': {
            if (eSign === 'strike') {
              const trapDmg = 9;
              const hp = Math.max(0, combat.enemyHealth - trapDmg);
              logs.push(L(`🪤 À peine posé, CLAC ! ${combat.enemyName} charge dedans : ${trapDmg} dégâts, sonné !`, `🪤 Barely set, SNAP! ${tc(combat.enemyName)} charges right in: ${trapDmg} damage, stunned!`));
              if (hp <= 0) return victoryState(c);
              return { ...state, currentCombat: { ...combat, ...spent, enemyHealth: hp, trapRounds: 0, phase: 'draw', hand: generateHand(c, combat, drawCount(2, 3)), enemyStunned: true }, combatLog: logs };
            }
            logs.push(L('🪤 Vous restez hors de portée et tendez un piège à carton. Deux manches pour qu\'il fonce dedans…', '🪤 You stay out of reach and set a cardboard trap. Two rounds for the foe to blunder in…'));
            return { ...state, currentCombat: nextSignCombat({ ...spent, trapRounds: 2 }), combatLog: logs };
          }
          case 'pas-de-cote': {
            logs.push(L('🌀 Pas de côté ! Vous tournez autour de lui : son jeu est lu à livre ouvert.', '🌀 Side step! You circle the foe: its game is an open book.'));
            return { ...state, currentCombat: { ...combat, ...spent, tellSign: eSign, tellSure: true, signNonce: combat.signNonce + 1, hand: [] }, combatLog: logs };
          }
          case 'desescalade': {
            const chance = Math.min(0.85, 0.35 + c.stats.dignity * 0.004 + c.respect * 0.01);
            if (Math.random() < chance) {
              logs.push(L('🕊️ Vous trouvez les mots justes. L\'affaire se règle sans un coup de plus.', '🕊️ You find the right words. The matter settles without another blow.'));
              return {
                ...state,
                character: { ...c, respect: c.respect + 2 },
                currentCombat: null,
                combatLog: logs,
                eventResult: { text: L(`Vous désamorcez l'affrontement avec ${combat.enemyName}, à la parole. La rue apprécie le style.`, `You talk ${tc(combat.enemyName)} down, word by word. The street appreciates the style.`), respectChange: 2, image: combat.image },
                screen: 'main',
              };
            }
            logs.push(L('🕊️ « On peut en discuter, non ? » Apparemment, non. Il charge !', '🕊️ "Can\'t we talk this over?" Apparently not. It charges!'));
            return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: 'dodge', hand: [] }, combatLog: logs };
          }
        }
        return state;
      }

      // Triangle : Châtaigne > Feinte > Garde > Châtaigne.
      const pDef = SIGNS[action.sign];
      if (pDef.beats === eSign) {
        logs.push(L(`${pDef.emoji} ${pDef.name} bat ${eDef.name} : vous prenez l'initiative !`, `${pDef.emoji} ${pDef.nameEn} beats ${eDef.nameEn}: you seize the initiative!`));
        return {
          ...state,
          currentCombat: { ...combat, trapRounds: trapAfter, phase: 'draw', hand: generateHand(c, combat, drawCount(2, 3)), specialCharged: rechargedSpecial() },
          combatLog: logs,
        };
      }
      if (action.sign === eSign) {
        // Égalité : accrochage, petits dégâts des deux côtés, on rejoue.
        // Une arme lourde fait tourner l'échange : c'est lui qui encaisse.
        const weapon = bestWeapon(c);
        const heavy = weapon?.combatStyle === 'heavy';
        const pDmg = heavy ? 0 : 2, eDmg = heavy ? 5 : 3;
        const hp = Math.max(0, c.stats.health - pDmg);
        const eHp = Math.max(0, combat.enemyHealth - eDmg);
        if (heavy) logs.push(L(`🏏 Accrochage, ${weapon!.name} fait la différence : c'est lui qui encaisse ! (−${eDmg} pour lui)`, `🏏 Clash, ${tc(weapon!.name)} makes the difference: the foe takes the hit! (−${eDmg} foe)`));
        else logs.push(L(`⚡ ${pDef.name} contre ${eDef.name} : accrochage ! (−${pDmg} pour vous, −${eDmg} pour lui)`, `⚡ ${pDef.nameEn} meets ${eDef.nameEn}: clash! (−${pDmg} you, −${eDmg} foe)`));
        const cUpd = { ...c, stats: clampStats({ ...c.stats, health: hp }) };
        if (eHp <= 0) return victoryState(cUpd);
        if (hp <= 0) {
          return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, L('💀 Vous vous écroulez dans l\'accrochage...', '💀 You collapse in the scuffle...')], deathCause: combatDeathMessage(combat.enemyName) };
        }
        return {
          ...state,
          character: cUpd,
          currentCombat: { ...combat, enemyHealth: eHp, trapRounds: trapAfter, signNonce: combat.signNonce + 1, hand: [], ...rollSignRound(enemyLike, c, false, combat.lastPlayerSign) },
          combatLog: logs,
        };
      }
      // Manche perdue : l'ennemi presse, place à l'esquive de rattrapage.
      logs.push(L(`${eDef.emoji} Sa ${eDef.name.toLowerCase()} prend votre ${pDef.name.toLowerCase()} de vitesse : esquivez !`, `${eDef.emoji} Its ${eDef.nameEn.toLowerCase()} beats your ${pDef.nameEn.toLowerCase()}: dodge!`));
      return { ...state, currentCombat: { ...combat, trapRounds: trapAfter, phase: 'dodge', hand: [] }, combatLog: logs };
    }

    // Fuite tentée depuis le duel de signes (soupape quand tout va mal :
    // pas besoin de gagner une manche pour avoir le droit de renoncer).
    case 'FLEE_ATTEMPT': {
      if (!state.character || !state.currentCombat || state.currentCombat.phase !== 'sign') return state;
      const c = state.character;
      const combat = state.currentCombat;
      const logs = [...state.combatLog];
      const hasAgile = c.traits.some(t => t.id === 'agile');
      const isCascadeur = c.job.id === 'cascadeur';
      const fleeChance = Math.min(0.85, 0.5 - combat.enemyAttack * 0.012 + (hasAgile ? 0.25 : 0) + (isCascadeur ? 0.12 : 0));
      if (Math.random() < fleeChance) {
        const newStats = clampStats({ ...c.stats, dignity: c.stats.dignity - 5 });
        return {
          ...state, character: { ...c, stats: newStats }, currentCombat: null,
          combatLog: [...logs, L('🏃 Vous filez avant l\'échange ! Fuite réussie !', '🏃 You bolt before the exchange! Escape successful!')],
          eventResult: { text: L('Vous avez fui le combat. Votre dignité en prend un coup...', 'You fled the fight. Your dignity takes a hit...'), statChanges: { dignity: -5 }, image: combat.image },
          screen: 'main',
        };
      }
      const dmg = Math.max(2, Math.round(combat.enemyAttack * (0.5 + Math.random() * 0.4)));
      const hp = Math.max(0, c.stats.health - dmg);
      if (hp <= 0) return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, L(`❌ Fuite ratée ! ${combat.enemyName} vous rattrape ! ${dmg} dégâts.`, `❌ Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`), L('💀 Vous succombez à vos blessures...', '💀 You succumb to your wounds...')], deathCause: combatDeathMessage(combat.enemyName) };
      logs.push(L(`❌ Fuite ratée ! ${combat.enemyName} vous rattrape ! ${dmg} dégâts.`, `❌ Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`));
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      return {
        ...state,
        character: { ...c, stats: clampStats({ ...c.stats, health: hp, dignity: c.stats.dignity - 3 }) },
        currentCombat: { ...combat, phase: 'sign', round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], ...rollSignRound(enemyLike, c, false, combat.lastPlayerSign) },
        combatLog: logs,
      };
    }

    // Fin de l'esquive de rattrapage (manche perdue au signe) : on encaisse.
    // Parfaite (0 touche) = contre-tempo, une riposte réduite. Sinon, retour
    // au duel de signes.
    case 'DODGE_RESULT': {
      if (!state.character || !state.currentCombat) return state;
      const c = state.character;
      const combat = state.currentCombat;
      const hasOsMousse = c.traits.some(t => t.id === 'os-mousse');
      const hasFroid = c.traits.some(t => t.id === 'resistant-froid');
      // Dégâts par touche : basés sur l'attaque de l'ennemi, réduits par un
      // éventuel malus (Insulte) et par la résistance, aggravés par Os en Mousse.
      const effAtk = Math.max(3, combat.enemyAttack - combat.enemyAtkDebuff);
      const perHit = Math.max(2, Math.round(effAtk * 0.5 * (hasOsMousse ? 1.5 : 1) * (hasFroid ? 0.8 : 1)));
      const totalDmg = action.hits * perHit;
      const newHp = Math.max(0, c.stats.health - totalDmg);
      if (newHp <= 0) {
        return {
          ...state, screen: 'game-over', currentCombat: null,
          combatLog: [...state.combatLog, L(`💥 ${action.hits} coup(s) encaissé(s)... ${totalDmg} dégâts.`, `💥 Took ${action.hits} hit(s)... ${totalDmg} damage.`), L('💀 Vous succombez à vos blessures...', '💀 You succumb to your wounds...')],
          deathCause: combatDeathMessage(combat.enemyName),
        };
      }
      const newStats = clampStats({ ...c.stats, health: newHp });
      const cUpd = { ...c, stats: newStats };
      const logs = [...state.combatLog];
      if (action.hits === 0) {
        // Contre-tempo : le rattrapage récompense le skill sans annuler la
        // défaite au signe (1 carte de base contre 2 pour une manche gagnée).
        let draw = 1;
        if (c.traits.some(t => t.id === 'collectionneur') && c.inventory.length >= 18) draw += 1;
        if (c.traits.some(t => t.id === 'optimiste') && c.stats.mental < 30) draw += 1;
        draw = Math.min(2, draw);
        logs.push(L(`✨ Esquive parfaite ! Contre-tempo : vous volez une riposte (${draw} carte${draw > 1 ? 's' : ''}).`, `✨ Flawless dodge! Counter-tempo: you steal a riposte (${draw} card${draw > 1 ? 's' : ''}).`));
        return {
          ...state,
          character: cUpd,
          currentCombat: { ...combat, phase: 'draw', hand: generateHand(cUpd, combat, draw), enemyAtkDebuff: 0, dodgePenalty: 1, enemyStunned: false },
          combatLog: logs,
        };
      }
      logs.push(L(`💥 ${action.hits} touche(s) encaissée(s), ${totalDmg} dégâts. Retour au face-à-face.`, `💥 Took ${action.hits} hit(s), ${totalDmg} damage. Back to the standoff.`));
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      return {
        ...state,
        character: cUpd,
        currentCombat: { ...combat, phase: 'sign', round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], enemyAtkDebuff: 0, dodgePenalty: 1, enemyStunned: false, ...rollSignRound(enemyLike, cUpd, false, combat.lastPlayerSign) },
        combatLog: logs,
      };
    }

    // Le joueur joue une carte de riposte : on applique son effet, puis on
    // enchaîne (victoire, fuite, ou manche suivante → nouveau duel de signes).
    case 'PLAY_CARD': {
      if (!state.character || !state.currentCombat) return state;
      const c = state.character;
      const combat = state.currentCombat;
      const card = getCard(action.cardId);
      if (!card || !combat.hand.includes(action.cardId)) return state;
      const logs = [...state.combatLog];
      const rnd = (min: number, range: number) => min + Math.random() * range;
      const base = unarmedDamage(c, combat);
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };

      // Fuite : probabilité selon la brutalité de l'ennemi (+ trait agile).
      if (card.id === 'flee') {
        const hasAgile = c.traits.some(t => t.id === 'agile');
        const isCascadeur = c.job.id === 'cascadeur';
        const fleeChance = Math.min(0.85, 0.5 - combat.enemyAttack * 0.012 + (hasAgile ? 0.25 : 0) + (isCascadeur ? 0.12 : 0));
        if (Math.random() < fleeChance) {
          const newStats = clampStats({ ...c.stats, dignity: c.stats.dignity - 5 });
          return {
            ...state, character: { ...c, stats: newStats }, currentCombat: null,
            combatLog: [...logs, L('🏃 Vous prenez vos jambes à votre cou ! Fuite réussie !', '🏃 You take to your heels! Escape successful!')],
            eventResult: { text: L('Vous avez fui le combat. Votre dignité en prend un coup...', 'You fled the fight. Your dignity takes a hit...'), statChanges: { dignity: -5 }, image: combat.image },
            screen: 'main',
          };
        }
        // Fuite ratée : l'ennemi place un coup, on repart en esquive.
        const dmg = Math.max(2, Math.round(combat.enemyAttack * rnd(0.5, 0.4)));
        const hp = Math.max(0, c.stats.health - dmg);
        if (hp <= 0) return { ...state, screen: 'game-over', currentCombat: null, combatLog: [...logs, L(`❌ Fuite ratée ! ${combat.enemyName} vous rattrape ! ${dmg} dégâts.`, `❌ Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`), L('💀 Vous succombez à vos blessures...', '💀 You succumb to your wounds...')], deathCause: combatDeathMessage(combat.enemyName) };
        logs.push(L(`❌ Fuite ratée ! ${combat.enemyName} vous rattrape ! ${dmg} dégâts.`, `❌ Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`));
        return {
          ...state,
          character: { ...c, stats: clampStats({ ...c.stats, health: hp, dignity: c.stats.dignity - 3 }) },
          currentCombat: { ...combat, phase: 'dodge', round: combat.round + 1, hand: [], atkBuff: 0 },
          combatLog: logs,
        };
      }

      // Soin : on consomme un objet de soin, pas de dégâts.
      if (card.id === 'bandage') {
        const heal = c.inventory.find(i => (i.effect?.health ?? 0) > 0);
        if (!heal) return state;
        const gain = heal.effect!.health!;
        const newInv = c.inventory.filter(i => i !== heal);
        logs.push(L(`🩹 Vous utilisez ${heal.name} : +${gain} santé.`, `🩹 You use ${tc(heal.name)}: +${gain} health.`));
        return {
          ...state,
          character: { ...c, inventory: newInv, stats: clampStats({ ...c.stats, health: c.stats.health + gain }) },
          currentCombat: { ...combat, phase: 'sign', round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], atkBuff: 0, enemyStunned: false, ...rollSignRound(enemyLike, c, combat.enemyStunned, combat.lastPlayerSign) },
          combatLog: logs,
        };
      }

      // Cri de Guerre : buff d'attaque, retour au duel (pas de dégâts).
      if (card.id === 'warcry') {
        logs.push(L('📣 CRI DE GUERRE ! Vous vous galvanisez pour le prochain coup.', '📣 WAR CRY! You psych yourself up for the next blow.'));
        return {
          ...state,
          currentCombat: { ...combat, phase: 'sign', round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], atkBuff: combat.atkBuff + 6, enemyStunned: false, ...rollSignRound(enemyLike, c, combat.enemyStunned, combat.lastPlayerSign) },
          combatLog: logs,
        };
      }

      // Cartes d'attaque / debuff : on calcule les dégâts et effets.
      let dmg = 0;
      let stun = false;
      let atkDebuff = 0;
      let consumeJunk: InventoryItem | undefined;
      switch (card.id) {
        case 'punch': dmg = Math.round(base * rnd(0.85, 0.35)); logs.push(L(`👊 Coup de poing ! ${dmg} dégâts.`, `👊 Punch! ${dmg} damage.`)); break;
        case 'bottle': {
          // Arme précise : 20 % de coup critique ×2 (« critiques dévastateurs »).
          const weapon = bestWeapon(c);
          const crit = weapon?.combatStyle === 'precise' && Math.random() < 0.2;
          dmg = Math.round((base + bestWeaponBonus(c)) * rnd(1.15, 0.4) * (crit ? 2 : 1));
          if (crit) logs.push(L(`🔪 COUP CRITIQUE ! ${weapon!.name} trouve la faille : ${dmg} dégâts !`, `🔪 CRITICAL HIT! ${tc(weapon!.name)} finds the gap: ${dmg} damage!`));
          else logs.push(L(`🍾 Coup d'arme ! ${dmg} dégâts.`, `🍾 Weapon blow! ${dmg} damage.`));
          break;
        }
        case 'military': dmg = Math.round(base * rnd(1.4, 0.3)); logs.push(L(`🎖️ Coup réglementaire ! ${dmg} dégâts.`, `🎖️ Regulation strike! ${dmg} damage.`)); break;
        case 'combo': dmg = Math.round(base * rnd(1.5, 0.4)); stun = true; logs.push(L(`🎭 Feinte + coup bas ! ${dmg} dégâts, et vous voilà en position.`, `🎭 Feint + low blow! ${dmg} damage, and you're in position.`)); break;
        case 'insult': dmg = Math.round(base * rnd(0.4, 0.3)); atkDebuff = 4; logs.push(L(`🗯️ Insulte ciblée ! ${dmg} dégâts, ${combat.enemyName} perd ses moyens.`, `🗯️ Targeted insult! ${dmg} damage, ${tc(combat.enemyName)} loses its cool.`)); break;
        case 'fortune': {
          consumeJunk = firstJunk(c);
          dmg = Math.round(base * rnd(1.55, 0.4));
          logs.push(L(`🔧 Arme de fortune${consumeJunk ? ` (${consumeJunk.name})` : ''} ! ${dmg} dégâts.`, `🔧 Makeshift weapon${consumeJunk ? ` (${tc(consumeJunk.name)})` : ''}! ${dmg} damage.`));
          break;
        }
        default: dmg = Math.round(base); break;
      }

      const newEnemyHp = Math.max(0, combat.enemyHealth - dmg);
      const inventory = consumeJunk ? c.inventory.filter(i => i !== consumeJunk) : c.inventory;

      // Victoire ?
      if (newEnemyHp <= 0) {
        const lootMoney = combat.loot?.money || 0;
        const lootRespect = combat.loot?.respect || 0;
        // L'ennemi lâche parfois un objet à son image (sandwich, couteau…).
        const drop = combat.loot?.item && inventory.length < 20 ? combat.loot.item : undefined;
        const en = tc(combat.enemyName);
        logs.push(L(`🎉 Victoire ! Vous avez vaincu ${combat.enemyName} !`, `🎉 Victory! You defeated ${en}!`));
        if (drop) logs.push(L(`${drop.emoji} Il lâche : ${drop.name} !`, `${drop.emoji} It drops: ${tc(drop.name)}!`));
        // Avoir battu le Roi en place, c'est ceindre la couronne.
        const wonCrown = combat.enemyEmoji === '\u{1F451}';
        if (wonCrown) logs.push(L('\u{1F451} La couronne vous revient : vous êtes le Roi du Carton !', '\u{1F451} The crown is yours: you are the Cardboard King!'));
        return {
          ...state,
          contract: state.contract?.id === 'contrat-combatif' ? { id: state.contract.id, done: true } : state.contract,
          character: { ...c, inventory: drop ? [...inventory, drop] : inventory, money: c.money + lootMoney, respect: c.respect + lootRespect,
            ...(wonCrown ? { crowned: true, kingsBeaten: (c.kingsBeaten ?? 0) + 1 } : {}) },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `${L(`Victoire contre ${combat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}€` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`.trim(), `Victory over ${en}! ${lootMoney > 0 ? `+€${lootMoney}` : ''} ${lootRespect > 0 ? `+${lootRespect} respect` : ''}`.trim())}${drop ? L(` Il lâche ${drop.name} ${drop.emoji} !`, ` It drops the ${tc(drop.name)} ${drop.emoji}!`) : ''}`, moneyChange: lootMoney, respectChange: lootRespect, image: combat.image },
          screen: 'main',
        };
      }

      // Sinon : manche suivante, retour au duel de signes. Un ennemi sonné
      // (combo, haleine, piège) télégraphie son prochain signe à coup sûr.
      return {
        ...state,
        character: { ...c, inventory },
        currentCombat: {
          ...combat,
          enemyHealth: newEnemyHp,
          phase: 'sign',
          round: combat.round + 1,
          signNonce: combat.signNonce + 1,
          hand: [],
          atkBuff: 0,
          enemyStunned: false,
          enemyAtkDebuff: combat.enemyAtkDebuff + atkDebuff,
          ...rollSignRound(enemyLike, c, stun || combat.enemyStunned, combat.lastPlayerSign),
        },
        combatLog: logs,
      };
    }

    case 'REOPEN_SHOP': {
      // « Coup de main » (via pub) : la boutique en panne rouvre séance tenante.
      if (!state.character) return state;
      return {
        ...state,
        character: {
          ...state.character,
          shopClosures: (state.character.shopClosures || []).filter(c => c.shopId !== action.shopId),
        },
      };
    }

    case 'RESOLVE_HAGGLE': {
      // Suite d'un marchandage (voir HaggleMinigame). Ce qu'on a engagé est
      // payé dans tous les cas — on a montré son jeu, gagné ou perdu.
      if (!state.character) return state;
      const c = state.character;
      const stats = clampStats(
        Object.entries(action.spent).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: acc[k as keyof Stats] - (v || 0) }),
          { ...c.stats },
        ),
      );
      // Sanction d'une négociation cassée : il ne vous sert plus aujourd'hui.
      // Une porte qui se ferme, pas une amende (voir data/haggle.ts).
      const closures = [...(c.shopClosures || [])];
      if (action.broken) {
        const [reason, reasonEn] = shopkeeperFor(action.shopId)?.closure
          ?? ['vous avez trop tiré sur la corde pendant le marchandage.',
              'you pushed the haggling too far.'];
        closures.push({ shopId: action.shopId, untilDay: c.day + 1, reason, reasonEn, fromHaggle: true });
      }
      // Une vraie affaire se sait dans le quartier.
      const gained = !action.broken && action.cut >= HAGGLE_TUNING.goodDealCut
        ? HAGGLE_TUNING.respectOnGoodDeal : 0;
      // On ne marchande qu'une fois par jour et par boutique : sans ça, on
      // recommencerait jusqu'à tomber sur une bonne série.
      const haggleFlag = HAGGLED_FLAG(action.shopId, c.day);
      return {
        ...state,
        character: {
          ...c,
          stats,
          shopClosures: closures,
          respect: Math.max(0, c.respect + gained),
          activeFlags: c.activeFlags.includes(haggleFlag) ? c.activeFlags : [...c.activeFlags, haggleFlag],
          inventory: action.tradedItemId
            ? removeOne(c.inventory, action.tradedItemId)
            : c.inventory,
        },
      };
    }

    case 'BUY_ITEM': {
      if (!state.character) return state;
      const shopItem = action.shopItem;
      const actualPrice = action.actualPrice;
      if (state.character.money < actualPrice) return state;
      if (shopItem.giveItem && state.character.inventory.length >= 20) return state;

      let newStats = { ...state.character.stats };
      if (shopItem.effect) {
        Object.entries(shopItem.effect).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      let newInventory = [...state.character.inventory];
      if (shopItem.giveItem) {
        newInventory.push(shopItem.giveItem);
      }

      const newMoney = state.character.money - actualPrice;
      // Compte les gorg\u00e9es de fontaine (eau gratuite) pour l'anti-exploit.
      const fountainBump = shopItem.id === 'eau-fontaine'
        ? { fountainUses: (state.character.fountainUses || 0) + 1 }
        : {};

      // Pas d'overlay bloquant \u00e0 l'achat : la boutique donne un retour INLINE
      // (argent anim\u00e9, -X\u20ac qui s'envole, badge \u00d7N, toast d'effet). On veut
      // pouvoir encha\u00eener les achats sans qu'un pop-up coupe le geste.
      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, inventory: newInventory, ...fountainBump },
      };
    }

    case 'DISMISS_ORIGIN': {
      // Le récit d'origine ne se montre qu'au départ : on pose un drapeau
      // (sauvegardé avec le personnage) pour ne plus le rejouer.
      if (!state.character) return state;
      if (state.character.activeFlags.includes('origin-vu')) return state;
      return {
        ...state,
        character: { ...state.character, activeFlags: [...state.character.activeFlags, 'origin-vu'] },
      };
    }

    case 'RESOLVE_ENCOUNTER': {
      if (!state.character) return state;
      const c = state.character;
      const flag = encounterFlag(c.day, c.location);
      // Déjà rencontré ce PNJ aujourd'hui ici.
      if (c.activeFlags.includes(flag)) return state;

      let stats = { ...c.stats };
      let money = c.money;
      let inventory = [...c.inventory];

      if (action.kind === 'share') {
        // Partager à manger : on sacrifie un aliment (le moins précieux).
        const foodIdx = inventory
          .map((it, i) => ({ it, i }))
          .filter((x) => x.it.type === 'food')
          .sort((a, b) => (a.it.value || 0) - (b.it.value || 0))[0]?.i;
        if (foodIdx === undefined) return state; // rien à partager
        inventory = [...inventory.slice(0, foodIdx), ...inventory.slice(foodIdx + 1)];
        stats = applyStatDelta(stats, { mental: 6, dignity: 2 });
      } else if (action.kind === 'trade') {
        // Troc : on achète l'objet proposé par le PNJ.
        if (!action.offer || money < action.offer.price || inventory.length >= 20) return state;
        money -= action.offer.price;
        inventory = [...inventory, { ...action.offer.item }];
      }
      // 'pass' : on ne fait que poser le drapeau (rencontre consommée).

      const respectGain = action.kind === 'share' ? 3 : 0;
      return {
        ...state,
        character: {
          ...c,
          stats,
          money,
          inventory,
          respect: c.respect + respectGain,
          activeFlags: [...c.activeFlags, flag],
        },
      };
    }

    case 'CLAIM_SOLIDARITY': {
      if (!state.character) return state;
      const c = state.character;
      const flag = SOLIDARITY_FLAG(c.day);
      // Une seule part par jour.
      if (c.activeFlags.includes(flag)) return state;
      // On ajoute les dons dans la limite du sac (20).
      const newInventory = [...c.inventory];
      for (const gift of SOLIDARITY_GIFT) {
        if (newInventory.length >= 20) break;
        newInventory.push({ ...gift });
      }
      return {
        ...state,
        character: { ...c, inventory: newInventory, activeFlags: [...c.activeFlags, flag] },
      };
    }

    case 'TRIGGER_SHOP_EVENT': {
      if (!state.character) return state;
      const shopEvt = action.event;
      const outcome = shopEvt.outcomes[Math.floor(Math.random() * shopEvt.outcomes.length)];

      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key as keyof Stats] += val;
        });
      }
      newStats = clampStats(newStats);

      const newMoney = state.character.money + (outcome.moneyChange || 0);
      const newRespect = state.character.respect + (outcome.respectChange || 0);
      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < 20) {
        newInventory.push(outcome.itemGain);
      }

      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory },
        eventResult: {
          text: `\ud83c\udf1f ${shopEvt.text}\n\n${outcome.text}`,
          statChanges: outcome.statChanges,
          moneyChange: outcome.moneyChange,
          respectChange: outcome.respectChange,
          // Une scène de boutique se passe DANS la boutique : sa devanture
          // vaut mieux qu'une scène dessinée en repli.
          image: `/assets/shop-${shopEvt.shopId}.webp`,
        },
      };
    }

    case 'REVIVE': {
      // Seconde chance (via pub récompensée) : on remet le personnage
      // dans un état survivable et on relance la journée. Utilisable
      // une seule fois par partie (flag 'revived'). Le legs éventuellement
      // choisi sur l'écran de fin est annulé : le défunt n'est plus défunt.
      if (!state.character) return state;
      clearLegacy();
      const revivedStats: Stats = {
        ...state.character.stats,
        health: Math.max(state.character.stats.health, 50),
        mental: Math.max(state.character.stats.mental, 50),
        hunger: Math.max(state.character.stats.hunger, 40),
        thirst: Math.max(state.character.stats.thirst, 40),
        sleep: Math.max(state.character.stats.sleep, 40),
      };
      return {
        ...state,
        screen: 'main',
        currentCombat: null,
        combatLog: [],
        deathCause: null,
        eventResult: { text: '🌅 Une âme charitable vous a porté secours. Vous reprenez vos esprits. La rue ne vous a pas encore eu...', image: '/assets/result-seconde-chance.webp' },
        character: {
          ...state.character,
          stats: revivedStats,
          alive: true,
          activeFlags: [...state.character.activeFlags, 'revived'],
        },
      };
    }

    case 'RESET_SCORES': {
      try { localStorage.removeItem(SCORES_KEY); } catch { /* silent */ }
      return { ...state, highScores: [] };
    }

    case 'RESTART':
      clearSave();
      // On repart directement sur le choix du personnage, avec le successeur
      // déjà annoncé en tête : le joueur reprend là où l'écran de fin l'a
      // laissé, sans repasser par l'écran-titre.
      return {
        ...initialState,
        highScores: loadHighScores(),
        screen: state.characterChoices.length > 0 ? 'character-select' : 'title',
        characterChoices: state.characterChoices,
      };

    default:
      return state;
  }
}

const initialState: GameState = {
  screen: 'title',
  character: null,
  characterChoices: [],
  currentEvent: null,
  currentCombat: null,
  eventResult: null,
  daySummary: null,
  contract: null,
  combatLog: [],
  dayActions: 0,
  maxDayActions: 3,
  highScores: loadHighScores(),
  weather: getInitialWeather(),
  deathCause: null,
};

// ============ CONTEXT ============
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Accessoires cosmétiques tout juste débloqués, à notifier (voir AchievementToast).
  newlyUnlocked: string[];
  dismissUnlock: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const prevScreen = useRef(state.screen);
  // Empêche de comptabiliser deux fois la même partie (ex. mort → seconde
  // chance par pub → nouvelle mort). Remis à zéro à chaque nouvelle partie.
  const gameCounted = useRef(false);

  const dismissUnlock = useCallback((id: string) => {
    setNewlyUnlocked((prev) => prev.filter((x) => x !== id));
  }, []);

  // Auto-save on state changes
  useEffect(() => {
    if (state.character && state.character.alive && state.screen === 'main') {
      saveGame(state);
    }
  }, [state]);

  // Met à jour les records permanents du profil et débloque les accessoires
  // correspondants (succès). Séparé de la sauvegarde de partie.
  useEffect(() => {
    const c = state.character;
    const unlocked: string[] = [];
    if (c && c.alive) {
      const balanced =
        c.stats.health >= 60 && c.stats.mental >= 60 && c.stats.hunger >= 60 &&
        c.stats.thirst >= 60 && c.stats.sleep >= 60 && c.stats.dignity >= 60;
      unlocked.push(...syncRecords({
        bestDay: c.day,
        bestRespect: c.respect,
        bestMoney: c.money,
        bestDignity: c.stats.dignity,
        balancedDay: balanced,
        lowDignity: c.stats.dignity <= 10,
        brokeDay: c.money === 0 && c.day >= 4,
        ironMental: c.stats.mental <= 12,
      }));
    }
    // Une nouvelle partie (passage par l'écran de sélection) réarme le compteur.
    if (state.screen === 'character-select') gameCounted.current = false;
    // Comptabilise la partie une seule fois, même si le joueur reprend via
    // une pub (seconde chance) puis meurt à nouveau.
    if (state.screen === 'game-over' && prevScreen.current !== 'game-over' && !gameCounted.current) {
      gameCounted.current = true;
      unlocked.push(...recordGameEnd(state.character?.day ?? 0));
    }
    prevScreen.current = state.screen;
    if (unlocked.length) setNewlyUnlocked((prev) => [...prev, ...unlocked.filter((id) => !prev.includes(id))]);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch, newlyUnlocked, dismissUnlock }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
