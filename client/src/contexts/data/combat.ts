// ============ COMBAT : SIGNES, COUPS SPÉCIAUX, CARTES & MISE EN PLACE ============
import type {
  Character, CombatState, CombatCard, SignDef, SignId, SpecialDef, InventoryItem, Enemy,
} from '../types';
import { ENEMIES, COMBAT_IMAGES, getPattern, rollSignRound } from './enemies';
import { getLang } from '@/lib/lang';

// ---- Duel de signes ----
// Triangle façon baston : Châtaigne bat Feinte, Feinte bat Garde,
// Garde bat Châtaigne. Les « tells » sont les indices affichés avant la manche.
export const SIGNS: Record<SignId, SignDef> = {
  strike: {
    id: 'strike', name: 'Châtaigne', nameEn: 'Haymaker', emoji: '👊', beats: 'feint',
    tells: ['Il serre le poing…', 'Ses épaules se bandent…'],
    tellsEn: ['It clenches a fist…', 'Its shoulders coil…'],
  },
  feint: {
    id: 'feint', name: 'Feinte', nameEn: 'Feint', emoji: '🎭', beats: 'guard',
    tells: ['Son regard glisse de côté…', 'Il esquisse un pas chaloupé…'],
    tellsEn: ['Its gaze slides sideways…', 'It sways, shifting its weight…'],
  },
  guard: {
    id: 'guard', name: 'Garde', nameEn: 'Block', emoji: '📦', beats: 'strike',
    tells: ['Il se ramasse derrière sa garde…', 'Il recule d\'un pas, bien couvert…'],
    tellsEn: ['It hunkers behind its guard…', 'It steps back, covered up…'],
  },
};

// Coups spéciaux : un seul par personnage (premier trait correspondant),
// chargé en gagnant une manche au signe, 2 usages max par combat.
export const SPECIAL_DEFS: SpecialDef[] = [
  {
    id: 'haleine', traitId: 'haleine', name: 'Haleine Redoutable', nameEn: 'Dreadful Breath', emoji: '💨',
    desc: 'Bat Châtaigne et Feinte (il suffoque), mais perd contre Garde. S\'il encaisse : sonné, son prochain signe est télégraphié.',
    descEn: 'Beats Haymaker and Feint (the foe gags), but loses to Block. If it lands: stunned, the foe\'s next sign is telegraphed.',
  },
  {
    id: 'piege', traitId: 'bricoleur', name: 'Piège à Carton', nameEn: 'Cardboard Trap', emoji: '🪤',
    desc: 'Pose un piège pour 2 manches : à sa prochaine Châtaigne, l\'ennemi se blesse tout seul.',
    descEn: 'Sets a trap for 2 rounds: on its next Haymaker, the foe hurts itself.',
  },
  {
    id: 'pas-de-cote', traitId: 'agile', name: 'Pas de Côté', nameEn: 'Side Step', emoji: '🌀',
    desc: 'Annule la manche et révèle à coup sûr le signe de l\'ennemi.',
    descEn: 'Cancels the round and reveals the foe\'s sign for certain.',
  },
  {
    id: 'desescalade', traitId: 'charismatique', name: 'Désescalade', nameEn: 'De-escalation', emoji: '🕊️',
    desc: 'Conclure en parlant : selon votre dignité et votre respect, le combat peut s\'arrêter là, avec le respect en prime.',
    descEn: 'Talk it out: with enough dignity and respect the fight may end right here, with extra respect on top.',
  },
];

// Épitaphe contextuelle quand on tombe au combat : une pique selon l'ennemi.
export function combatDeathMessage(enemy: string): string {
  const n = enemy.toLowerCase();
  const en = getLang() === 'en';
  if (n.includes('chat')) return en ? `Finished off by ${enemy}. A cat. The street will remember this moment of glory.` : `Achevé par ${enemy}. Un chat. La rue retiendra ce moment de gloire.`;
  if (n.includes('écureuil')) return en ? `Beaten by ${enemy}. You didn't even have any nuts to give it.` : `Vaincu par ${enemy}. Vous n'aviez même pas de noisettes à lui donner.`;
  if (n.includes('pigeon') || n.includes('mouette') || n.includes('corbeau') || n.includes('cygne') || n.includes('oie') || n.includes('canard') || n.includes('coq')) {
    return en ? `${enemy} got the better of you. Taken down by a bird: the local flock will remember this for a long time.` : `${enemy} a eu votre peau. Terrassé par un volatile : les oiseaux du quartier s'en souviendront longtemps.`;
  }
  if (n.includes('rat') || n.includes('raton')) return en ? `${enemy} came out on top. Even the rodents look down on you now.` : `${enemy} a eu le dessus. Même les rongeurs vous regardent de haut désormais.`;
  if (n.includes('clown')) return en ? `${enemy} got the last laugh. And nobody was laughing already.` : `${enemy} a eu le dernier rire. Et personne ne riait déjà.`;
  if (n.includes('ivrogne')) return en ? `${enemy} was staggering. He still swung straighter than you.` : `${enemy} titubait. Il frappait quand même plus droit que vous.`;
  if (n.includes('commerçant') || n.includes('vigile') || n.includes('agent') || n.includes('sécurité')) {
    return en ? `${enemy} was defending their turf. You're not defending anything anymore.` : `${enemy} défendait son territoire. Vous, vous ne défendez plus rien.`;
  }
  if (n.includes('voyou') || n.includes('chien')) return en ? `${enemy} wanted your corner. They got it.` : `${enemy} voulait votre coin de rue. Il l'a eu.`;
  return en ? `${enemy} got the better of you. The street carries on, indifferent.` : `${enemy} a eu raison de vous. La rue continue, indifférente.`;
}

// ============ CARTES DE RIPOSTE (phase « Draw ») ============
// Chaque carte a une disponibilité (selon inventaire / stats / traits / métier)
// et une estimation de dégâts affichée. L'effet réel est appliqué par le
// reducer (PLAY_CARD), unique source de vérité.

// Dégâts de base à mains nues (métier + buff temporaire).
export function unarmedDamage(c: Character, combat: CombatState): number {
  return 7 + (c.job.id === 'militaire' ? 3 : 0) + (c.job.id === 'boxeur' ? 2 : 0) + combat.atkBuff;
}
// Meilleure arme portée (bonus le plus élevé). Son style compte au combat :
// « heavy » fait tourner les accrochages (égalités) en votre faveur,
// « precise » donne 20 % de coup critique ×2 au Coup d'Arme.
export function bestWeapon(c: Character): InventoryItem | undefined {
  let best: InventoryItem | undefined;
  for (const i of c.inventory) {
    if (i.type !== 'weapon') continue;
    if (!best || (i.attackBonus ?? 4) > (best.attackBonus ?? 4)) best = i;
  }
  return best;
}
export function bestWeaponBonus(c: Character): number {
  const w = bestWeapon(c);
  return w ? (w.attackBonus ?? 4) : 0;
}

/*
 * LA DÉFENSE, ENFIN.
 *
 * Vingt-cinq objets du jeu annoncent « 🛡️ +N déf. » à l'inventaire et à
 * l'échoppe, le gilet de chantier à douze euros en promet cinq. Aucune ligne
 * de combat ne lisait ce nombre : les dégâts encaissés ne dépendaient que de
 * l'attaque de l'adversaire. Le joueur payait une promesse.
 *
 * On garde la règle des armes : SEULE la meilleure pièce compte, pour qu'un
 * sac de cinq manteaux ne rende pas invincible. La réduction est douce et
 * n'atteint jamais zéro, une armure rend les coups supportables, elle
 * n'annule pas la bagarre.
 *   +1 → −8 %   +3 → −20 %   +5 → −29 %
 */
export function bestArmor(c: Character): InventoryItem | undefined {
  let best: InventoryItem | undefined;
  for (const i of c.inventory) {
    if (!i.defenseBonus) continue;
    if (!best || i.defenseBonus > (best.defenseBonus ?? 0)) best = i;
  }
  return best;
}

export function bestArmorBonus(c: Character): number {
  return bestArmor(c)?.defenseBonus ?? 0;
}

/** Dégâts réellement encaissés, une fois l'armure prise en compte. */
export function soakDamage(c: Character, dmg: number): number {
  const def = bestArmorBonus(c);
  if (def <= 0) return dmg;
  return Math.max(1, Math.round(dmg * (12 / (12 + def))));
}
function hasHealingItem(c: Character): boolean {
  return c.inventory.some(i => (i.effect?.health ?? 0) > 0);
}
export function firstJunk(c: Character): InventoryItem | undefined {
  return c.inventory.find(i => i.type === 'junk');
}

const dmgLabel = (n: number, extra = '') => `≈ ${n} ${getLang() === 'en' ? 'dmg' : 'dég.'}${extra}`;

export const CARD_DEFS: CombatCard[] = [
  {
    id: 'punch', name: 'Coup de Poing', nameEn: 'Punch', emoji: '👊', kind: 'attack',
    desc: 'Un direct honnête. Toujours disponible.', descEn: 'An honest jab. Always available.',
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k))),
    available: () => true,
  },
  {
    id: 'bottle', name: 'Coup d\'Arme', nameEn: 'Weapon Blow', emoji: '🍾', kind: 'attack',
    desc: 'Frappe avec votre arme la plus solide. Gros dégâts.', descEn: 'Hit with your sturdiest weapon. Big damage.',
    estimate: (c, k) => dmgLabel(
      Math.round((unarmedDamage(c, k) + bestWeaponBonus(c)) * 1.35),
      bestWeapon(c)?.combatStyle === 'precise' ? (getLang() === 'en' ? ' ⚡20% crit' : ' ⚡20% crit.') : '',
    ),
    available: (c) => bestWeaponBonus(c) > 0,
  },
  {
    id: 'insult', name: 'Insulte Ciblée', nameEn: 'Targeted Insult', emoji: '🗯️', kind: 'debuff',
    desc: 'Sape le moral de l\'ennemi : il frappe moins fort ensuite.', descEn: 'Saps the foe\'s morale: it hits softer afterwards.',
    estimate: () => getLang() === 'en' ? '−enemy atk' : '−atk ennemi',
    available: (c) => c.stats.dignity > 30 || c.traits.some(t => t.id === 'charismatique'),
  },
  {
    id: 'combo', name: 'Feinte + Coup Bas', nameEn: 'Feint + Low Blow', emoji: '🎭', kind: 'attack',
    desc: 'Combo dévastateur : l\'ennemi sonné télégraphie son prochain signe.', descEn: 'Devastating combo: the stunned foe telegraphs its next sign.',
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.6), getLang() === 'en' ? ' + stun' : ' + sonné'),
    available: () => true,
  },
  {
    id: 'warcry', name: 'Cri de Guerre', nameEn: 'War Cry', emoji: '📣', kind: 'buff',
    desc: 'Vous vous galvanisez : votre prochaine attaque frappe plus fort.', descEn: 'You psych yourself up: your next attack hits harder.',
    estimate: () => getLang() === 'en' ? '+attack' : '+attaque',
    available: (c) => c.stats.mental > 15,
  },
  {
    id: 'fortune', name: 'Arme de Fortune', nameEn: 'Makeshift Weapon', emoji: '🔧', kind: 'attack',
    desc: 'Bricole une arme d\'un objet du sac. Gros dégâts, consomme l\'objet.', descEn: 'Rig a weapon from a bag item. Big damage, consumes the item.',
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.7)),
    available: (c) => c.traits.some(t => t.id === 'bricoleur') && !!firstJunk(c),
  },
  {
    id: 'military', name: 'Coup Réglementaire', nameEn: 'Regulation Strike', emoji: '🎖️', kind: 'attack',
    desc: 'Technique militaire propre et efficace.', descEn: 'Clean, efficient military technique.',
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.5)),
    available: (c) => c.job.id === 'militaire',
  },
  {
    id: 'bandage', name: 'Répit', nameEn: 'Breather', emoji: '🩹', kind: 'heal',
    desc: 'Utilise un soin du sac au lieu de frapper. Rend de la santé.', descEn: 'Use a healing item instead of striking. Restores health.',
    estimate: () => getLang() === 'en' ? '+health' : '+santé',
    available: (c) => hasHealingItem(c),
  },
  {
    id: 'flee', name: 'Fuite', nameEn: 'Flee', emoji: '🏃', kind: 'flee',
    desc: 'Tenter de fuir. Plus l\'ennemi est brutal, plus c\'est risqué.', descEn: 'Try to run. The more brutal the foe, the riskier.',
    estimate: (c) => c.traits.some(t => t.id === 'agile') ? (getLang() === 'en' ? 'flee (agile)' : 'fuite (agile)') : (getLang() === 'en' ? 'flee' : 'fuite'),
    available: () => true,
  },
];

export function getCard(id: string): CombatCard | undefined {
  return CARD_DEFS.find(c => c.id === id);
}

// Pioche une main de `count` cartes : le Coup de Poing est toujours présent,
// et une arme portée garantit son Coup d'Arme (une arme achetée doit servir
// à chaque riposte, pas au hasard). Les places restantes sont tirées parmi
// les cartes disponibles. La Feinte (combo) ne peut sortir que si l'on
// pioche au moins 2 cartes (bonne performance).
export function generateHand(character: Character, combat: CombatState, count: number): string[] {
  const armed = bestWeaponBonus(character) > 0;
  // Riposte à 1 carte (contre-tempo) : l'arme prend le dessus si l'on en a une.
  if (count <= 1) return [armed ? 'bottle' : 'punch'];
  const guaranteed = armed ? ['punch', 'bottle'] : ['punch'];
  const pool = CARD_DEFS
    .filter(c => !guaranteed.includes(c.id) && c.available(character, combat))
    .filter(c => c.id !== 'combo' || count >= 2)
    .map(c => c.id);
  // Mélange simple.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...guaranteed, ...pool.slice(0, Math.max(0, count - guaranteed.length))];
}

// Construit l'état de combat pour un ennemi donné (utilisé par START_COMBAT
// et par les répercussions de vol), une seule source de vérité.
export function makeCombatState(enemy: Enemy, character: Character): CombatState {
  // Image de l'ennemi : la sienne, sinon la fiche canonique, sinon la table
  // COMBAT_IMAGES (ennemis de la « Bagarre » dont l'image est à générer).
  const image = enemy.image || ENEMIES.find(e => e.name === enemy.name)?.image || COMBAT_IMAGES[enemy.name];
  // Coup spécial du personnage : premier trait correspondant (voir SPECIAL_DEFS).
  const special = SPECIAL_DEFS.find(s => character.traits.some(t => t.id === s.traitId));
  return {
    enemyName: enemy.name,
    enemyEmoji: enemy.emoji,
    enemyHealth: enemy.health,
    enemyMaxHealth: enemy.health,
    enemyAttack: enemy.attack,
    description: enemy.description,
    loot: enemy.loot,
    image,
    round: 1,
    phase: 'sign',
    pattern: getPattern(enemy),
    hand: [],
    // L'arme de fortune ne ressemble pas à une arme : personne ne voit venir
    // un tuyau scotché. Le premier coup du combat part avec l'effet de
    // surprise, une fois, et l'avantage s'éteint après (atkBuff est consommé).
    atkBuff: character.inventory.some(i => i.id === 'craft-arme') ? 3 : 0,
    enemyStunned: false,
    enemyAtkDebuff: 0,
    ...rollSignRound(enemy, character, false),
    signNonce: 0,
    specialId: special?.id ?? null,
    specialCharged: false,
    specialUses: 0,
    trapRounds: 0,
    // Le Vigile de Choc est un vrai mur : sa phase d'esquive est nettement
    // plus dense (en plus de ses grosses stats).
    dodgePenalty: enemy.name === 'Vigile de Choc' ? 1.5 : 1,
  };
}
