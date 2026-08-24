// client/src/contexts/GameContext.tsx
import { createContext, useContext, useReducer as useReducer2, useEffect as useEffect2, useRef, useState, useCallback } from "react";

// client/src/lib/cosmetics.ts
var ACCESSORIES = [
  // Chapeaux (14)
  { id: "crown", name: "Couronne dor\xE9e", slot: "hat", emoji: "\u{1F451}" },
  { id: "halo", name: "Aur\xE9ole", slot: "hat", emoji: "\u{1F607}" },
  { id: "tophat", name: "Haut-de-forme", slot: "hat", emoji: "\u{1F3A9}" },
  { id: "santa", name: "Bonnet de No\xEBl", slot: "hat", emoji: "\u{1F385}" },
  { id: "cap-back", name: "Casquette \xE0 l'envers", slot: "hat", emoji: "\u{1F9E2}" },
  { id: "party", name: "Chapeau de f\xEAte", slot: "hat", emoji: "\u{1F973}" },
  { id: "beanie", name: "Bonnet \xE0 pompon", slot: "hat", emoji: "\u{1F9F6}" },
  { id: "cowboy", name: "Chapeau de cowboy", slot: "hat", emoji: "\u{1F920}" },
  { id: "wizard", name: "Chapeau de mage", slot: "hat", emoji: "\u{1F9D9}" },
  { id: "chef", name: "Toque de chef", slot: "hat", emoji: "\u{1F468}\u200D\u{1F373}" },
  { id: "flower-crown", name: "Couronne de fleurs", slot: "hat", emoji: "\u{1F338}" },
  { id: "pirate-hat", name: "Tricorne de pirate", slot: "hat", emoji: "\u{1F3F4}\u200D\u2620\uFE0F" },
  { id: "graduation", name: "Toque de dipl\xF4m\xE9", slot: "hat", emoji: "\u{1F393}" },
  { id: "beret", name: "B\xE9ret", slot: "hat", emoji: "\u{1F3A8}" },
  // Lunettes / yeux (9)
  { id: "monocle", name: "Monocle de gentleman", slot: "eyes", emoji: "\u{1F9D0}" },
  { id: "3d-glasses", name: "Lunettes 3D", slot: "eyes", emoji: "\u{1F913}" },
  { id: "eyepatch", name: "Cache-\u0153il de pirate", slot: "eyes", emoji: "\u{1F3F4}\u200D\u2620\uFE0F" },
  { id: "heart-glasses", name: "Lunettes en c\u0153ur", slot: "eyes", emoji: "\u{1F60D}" },
  { id: "star-glasses", name: "Lunettes \xE9toiles", slot: "eyes", emoji: "\u{1F929}" },
  { id: "sunglasses", name: "Lunettes de soleil", slot: "eyes", emoji: "\u{1F60E}" },
  { id: "nerd-glasses", name: "Lunettes d'intello", slot: "eyes", emoji: "\u{1F913}" },
  { id: "ski-goggles", name: "Masque de ski", slot: "eyes", emoji: "\u{1F97D}" },
  { id: "thug-glasses", name: "Lunettes pixel", slot: "eyes", emoji: "\u{1F576}\uFE0F" },
  // Visage (9)
  { id: "mustache", name: "Moustache guidon", slot: "face", emoji: "\u{1F468}" },
  { id: "warpaint", name: "Peinture de guerre", slot: "face", emoji: "\u{1F3A8}" },
  { id: "blush", name: "Joues roses", slot: "face", emoji: "\u263A\uFE0F" },
  { id: "clown-nose", name: "Nez de clown", slot: "face", emoji: "\u{1F921}" },
  { id: "bandage", name: "Pansement", slot: "face", emoji: "\u{1FA79}" },
  { id: "face-tattoo", name: "Tatouage larme", slot: "face", emoji: "\u{1F4A7}" },
  { id: "goatee", name: "Bouc", slot: "face", emoji: "\u{1F9D4}" },
  { id: "unibrow", name: "Monosourcil", slot: "face", emoji: "\u{1F928}" },
  { id: "star-cheeks", name: "\xC9toiles sur les joues", slot: "face", emoji: "\u2B50" },
  // Cou (9)
  { id: "scarf", name: "\xC9charpe ray\xE9e", slot: "neck", emoji: "\u{1F9E3}" },
  { id: "gold-medal", name: "M\xE9daille d'or", slot: "neck", emoji: "\u{1F947}" },
  { id: "bowtie", name: "N\u0153ud papillon", slot: "neck", emoji: "\u{1F380}" },
  { id: "gold-chain", name: "Cha\xEEne en or", slot: "neck", emoji: "\u{1F4FF}" },
  { id: "tie", name: "Cravate", slot: "neck", emoji: "\u{1F454}" },
  { id: "bandana", name: "Bandana", slot: "neck", emoji: "\u{1F534}" },
  { id: "cape", name: "Cape de h\xE9ros", slot: "neck", emoji: "\u{1F9B8}" },
  { id: "pearls", name: "Collier de perles", slot: "neck", emoji: "\u{1F4FF}" },
  { id: "whistle", name: "Sifflet d'arbitre", slot: "neck", emoji: "\u{1F4EF}" },
  // Fonds (9)
  { id: "gold-bg", name: "Aura dor\xE9e", slot: "bg", emoji: "\u2728" },
  { id: "rainbow-bg", name: "Fond arc-en-ciel", slot: "bg", emoji: "\u{1F308}" },
  { id: "stars-bg", name: "Nuit \xE9toil\xE9e", slot: "bg", emoji: "\u{1F319}" },
  { id: "flames-bg", name: "Fond enflamm\xE9", slot: "bg", emoji: "\u{1F525}" },
  { id: "hearts-bg", name: "Fond de c\u0153urs", slot: "bg", emoji: "\u{1F495}" },
  { id: "confetti-bg", name: "Fond confettis", slot: "bg", emoji: "\u{1F389}" },
  { id: "royal-bg", name: "Fond royal", slot: "bg", emoji: "\u{1F7E3}" },
  { id: "spotlight-bg", name: "Sous les projecteurs", slot: "bg", emoji: "\u{1F526}" },
  { id: "sunset-bg", name: "Coucher de soleil", slot: "bg", emoji: "\u{1F305}" }
];
var day = (n) => (r) => r.bestDay >= n ? n : r.bestDay;
var resp = (n) => (r) => r.bestRespect >= n ? n : r.bestRespect;
var money = (n) => (r) => r.bestMoney >= n ? n : r.bestMoney;
var dign = (n) => (r) => r.bestDignity >= n ? n : r.bestDignity;
var games = (n) => (r) => Math.min(r.totalGames, n);
var tdays = (n) => (r) => Math.min(r.totalDays, n);
var flag = (f) => (r) => f(r) ? 1 : 0;
var ACHIEVEMENTS = [
  // ===== Faciles =====
  { id: "first-game", name: "Premiers pas dans la rue", description: "Terminez votre premi\xE8re partie.", icon: "\u{1F463}", reward: "scarf", tier: "facile", goal: 1, progress: games(1) },
  { id: "survivor-2", name: "Deux jours", description: "Survivez jusqu'au jour 2.", icon: "\u{1F4C6}", reward: "beanie", tier: "facile", goal: 2, progress: day(2) },
  { id: "survivor-3", name: "Trois jours debout", description: "Survivez jusqu'au jour 3.", icon: "\u{1F4C5}", reward: "cap-back", tier: "facile", goal: 3, progress: day(3) },
  { id: "saver-20", name: "Premi\xE8re pi\xE8ce", description: "Amassez 20 \u20AC en une partie.", icon: "\u{1FA99}", reward: "bowtie", tier: "facile", goal: 20, progress: money(20) },
  { id: "respected-10", name: "On vous remarque", description: "Atteignez 10 de respect.", icon: "\u2B50", reward: "blush", tier: "facile", goal: 10, progress: resp(10) },
  { id: "respected-15", name: "R\xE9putation naissante", description: "Atteignez 15 de respect.", icon: "\u2728", reward: "star-cheeks", tier: "facile", goal: 15, progress: resp(15) },
  { id: "dignified-50", name: "La t\xEAte froide", description: "Montez votre dignit\xE9 \xE0 50.", icon: "\u{1F642}", reward: "bandana", tier: "facile", goal: 50, progress: dign(50) },
  { id: "saver-30", name: "Petit p\xE9cule", description: "Amassez 30 \u20AC en une partie.", icon: "\u{1F4B0}", reward: "tie", tier: "facile", goal: 30, progress: money(30) },
  { id: "survivor-5", name: "Cinq jours", description: "Survivez jusqu'au jour 5.", icon: "\u{1F5D3}\uFE0F", reward: "party", tier: "facile", goal: 5, progress: day(5) },
  { id: "respected-20", name: "On parle de vous", description: "Atteignez 20 de respect.", icon: "\u{1F31F}", reward: "star-glasses", tier: "facile", goal: 20, progress: resp(20) },
  { id: "dignified-60", name: "Pr\xE9sentable", description: "Montez votre dignit\xE9 \xE0 60.", icon: "\u{1F60A}", reward: "flower-crown", tier: "facile", goal: 60, progress: dign(60) },
  { id: "games-3", name: "Habitu\xE9 du bitume", description: "Jouez 3 parties.", icon: "\u{1F501}", reward: "warpaint", tier: "facile", goal: 3, progress: games(3) },
  { id: "saver-50", name: "Bas de laine", description: "Amassez 50 \u20AC en une partie.", icon: "\u{1F4B5}", reward: "nerd-glasses", tier: "facile", goal: 50, progress: money(50) },
  { id: "survivor-7", name: "Une semaine", description: "Survivez jusqu'au jour 7.", icon: "\u{1F4D6}", reward: "tophat", tier: "facile", goal: 7, progress: day(7) },
  { id: "tdays-25", name: "Du v\xE9cu", description: "Cumulez 25 jours de survie, toutes parties confondues.", icon: "\u23F3", reward: "sunset-bg", tier: "facile", goal: 25, progress: tdays(25) },
  { id: "balanced", name: "En pleine forme", description: "Tenez toutes vos jauges \xE0 60 ou plus le m\xEAme jour.", icon: "\u2696\uFE0F", reward: "3d-glasses", tier: "facile", goal: 1, progress: flag((r) => r.balancedDay) },
  // ===== Moyens =====
  { id: "survivor-8", name: "Huit jours", description: "Survivez jusqu'au jour 8.", icon: "\u{1F3A8}", reward: "beret", tier: "moyen", goal: 8, progress: day(8) },
  { id: "respected-25", name: "R\xE9putation qui monte", description: "Atteignez 25 de respect.", icon: "\u{1F4AB}", reward: "heart-glasses", tier: "moyen", goal: 25, progress: resp(25) },
  { id: "dignified-70", name: "Digne", description: "Montez votre dignit\xE9 \xE0 70.", icon: "\u{1F3A9}", reward: "pearls", tier: "moyen", goal: 70, progress: dign(70) },
  { id: "saver-80", name: "\xC9conome", description: "Amassez 80 \u20AC en une partie.", icon: "\u{1F4B8}", reward: "gold-chain", tier: "moyen", goal: 80, progress: money(80) },
  { id: "survivor-10", name: "Dizaine", description: "Survivez jusqu'au jour 10.", icon: "\u{1F920}", reward: "cowboy", tier: "moyen", goal: 10, progress: day(10) },
  { id: "respected-40", name: "Figure du quartier", description: "Atteignez 40 de respect.", icon: "\u{1F947}", reward: "gold-medal", tier: "moyen", goal: 40, progress: resp(40) },
  { id: "dignified-80", name: "T\xEAte haute", description: "Montez votre dignit\xE9 \xE0 80.", icon: "\u{1F451}", reward: "halo", tier: "moyen", goal: 80, progress: dign(80) },
  { id: "games-5", name: "R\xE9cidiviste", description: "Jouez 5 parties.", icon: "\u{1F60E}", reward: "sunglasses", tier: "moyen", goal: 5, progress: games(5) },
  { id: "saver-120", name: "Bon gestionnaire", description: "Amassez 120 \u20AC en une partie.", icon: "\u{1F4B6}", reward: "whistle", tier: "moyen", goal: 120, progress: money(120) },
  { id: "survivor-13", name: "Treize jours", description: "Survivez jusqu'au jour 13.", icon: "\u{1F468}\u200D\u{1F373}", reward: "chef", tier: "moyen", goal: 13, progress: day(13) },
  { id: "respected-50", name: "Respect\xE9", description: "Atteignez 50 de respect.", icon: "\u{1F9D4}", reward: "goatee", tier: "moyen", goal: 50, progress: resp(50) },
  { id: "low-dignity", name: "Le fond du trou", description: "Survivez un jour avec la dignit\xE9 au plus bas (10 ou moins).", icon: "\u{1FA79}", reward: "bandage", tier: "moyen", goal: 1, progress: flag((r) => r.lowDignity) },
  { id: "tdays-60", name: "Vieux de la rue", description: "Cumulez 60 jours de survie.", icon: "\u{1F319}", reward: "stars-bg", tier: "moyen", goal: 60, progress: tdays(60) },
  { id: "dignified-90", name: "Presque respectable", description: "Montez votre dignit\xE9 \xE0 90.", icon: "\u{1F393}", reward: "graduation", tier: "moyen", goal: 90, progress: dign(90) },
  { id: "games-10", name: "Increvable", description: "Jouez 10 parties.", icon: "\u{1F97D}", reward: "ski-goggles", tier: "moyen", goal: 10, progress: games(10) },
  { id: "survivor-16", name: "Seize jours", description: "Survivez jusqu'au jour 16.", icon: "\u{1F921}", reward: "clown-nose", tier: "moyen", goal: 16, progress: day(16) },
  { id: "broke-day", name: "Sans un rond", description: "Survivez fauch\xE9 (0 \u20AC) apr\xE8s le jour 4.", icon: "\u{1F4A7}", reward: "face-tattoo", tier: "moyen", goal: 1, progress: flag((r) => r.brokeDay) },
  // ===== Difficiles =====
  { id: "survivor-20", name: "Le Roi du Carton", description: "Survivez jusqu'au jour 20.", icon: "\u{1F451}", reward: "crown", tier: "difficile", goal: 20, progress: day(20) },
  { id: "respected-70", name: "Respect\xE9 de tous", description: "Atteignez 70 de respect.", icon: "\u{1F308}", reward: "rainbow-bg", tier: "difficile", goal: 70, progress: resp(70) },
  { id: "saver-160", name: "Magot", description: "Amassez 160 \u20AC en une partie.", icon: "\u{1F9B8}", reward: "cape", tier: "difficile", goal: 160, progress: money(160) },
  { id: "dignified-95", name: "Presque un notable", description: "Montez votre dignit\xE9 \xE0 95.", icon: "\u{1F9D0}", reward: "monocle", tier: "difficile", goal: 95, progress: dign(95) },
  { id: "survivor-25", name: "L\xE9gende de la rue", description: "Survivez jusqu'au jour 25.", icon: "\u{1F307}", reward: "gold-bg", tier: "difficile", goal: 25, progress: day(25) },
  { id: "respected-85", name: "Idole montante", description: "Atteignez 85 de respect.", icon: "\u{1F9D9}", reward: "wizard", tier: "difficile", goal: 85, progress: resp(85) },
  { id: "saver-220", name: "Petit tr\xE9sor", description: "Amassez 220 \u20AC en une partie.", icon: "\u{1F468}", reward: "mustache", tier: "difficile", goal: 220, progress: money(220) },
  { id: "games-20", name: "Pilier du bitume", description: "Jouez 20 parties.", icon: "\u{1F3F4}\u200D\u2620\uFE0F", reward: "eyepatch", tier: "difficile", goal: 20, progress: games(20) },
  { id: "survivor-30", name: "Trente jours", description: "Survivez jusqu'au jour 30.", icon: "\u2620\uFE0F", reward: "pirate-hat", tier: "difficile", goal: 30, progress: day(30) },
  { id: "respected-100", name: "Idole du bitume", description: "Atteignez 100 de respect.", icon: "\u{1F385}", reward: "santa", tier: "difficile", goal: 100, progress: resp(100) },
  { id: "dignified-100", name: "Irr\xE9prochable", description: "Montez votre dignit\xE9 \xE0 100.", icon: "\u{1F928}", reward: "unibrow", tier: "difficile", goal: 100, progress: dign(100) },
  { id: "tdays-120", name: "Une vie enti\xE8re", description: "Cumulez 120 jours de survie.", icon: "\u{1F525}", reward: "flames-bg", tier: "difficile", goal: 120, progress: tdays(120) },
  { id: "iron-mental", name: "Nerfs d'acier", description: "Survivez un jour avec le moral au plus bas (12 ou moins).", icon: "\u{1F576}\uFE0F", reward: "thug-glasses", tier: "difficile", goal: 1, progress: flag((r) => r.ironMental) },
  { id: "saver-300", name: "Fortune", description: "Amassez 300 \u20AC en une partie.", icon: "\u{1F7E3}", reward: "royal-bg", tier: "difficile", goal: 300, progress: money(300) },
  { id: "games-40", name: "\xC9ternel de la rue", description: "Jouez 40 parties.", icon: "\u{1F495}", reward: "hearts-bg", tier: "difficile", goal: 40, progress: games(40) },
  { id: "survivor-40", name: "Immortel du carton", description: "Survivez jusqu'au jour 40.", icon: "\u{1F389}", reward: "confetti-bg", tier: "difficile", goal: 40, progress: day(40) },
  { id: "tdays-250", name: "Monument vivant", description: "Cumulez 250 jours de survie.", icon: "\u{1F526}", reward: "spotlight-bg", tier: "difficile", goal: 250, progress: tdays(250) }
];
var ACCESSORY_BY_ID = new Map(ACCESSORIES.map((a) => [a.id, a]));
var ACHIEVEMENT_BY_REWARD = new Map(ACHIEVEMENTS.map((a) => [a.reward, a]));

// client/src/lib/lang.ts
import { useEffect, useReducer } from "react";
var dico = null;
var dico2 = null;
var LANG_KEY = "roi-du-carton-lang";
function detect() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "en") return saved;
    const nav = (typeof navigator !== "undefined" ? navigator.language : "fr") || "fr";
    return nav.toLowerCase().startsWith("en") ? "en" : "fr";
  } catch {
    return "fr";
  }
}
var current = detect();
function getLang() {
  return current;
}
function tc(fr) {
  if (!fr) return fr ?? "";
  if (current !== "en") return fr;
  return dico?.[fr] ?? dico2?.[fr] ?? fr;
}

// client/src/lib/necrology.ts
var LEGACY_KEY = "roi-du-carton-legacy";
var GRAVES_KEY = "roi-du-carton-cimetiere";
var HERITAGE_KEY = "roi-du-carton-heritage";
function loadGraves() {
  try {
    const raw = JSON.parse(localStorage.getItem(GRAVES_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    const bySeed = /* @__PURE__ */ new Map();
    for (const g of raw) {
      if (!g || !g.seed) continue;
      const prev = bySeed.get(g.seed);
      if (!prev || (g.day ?? 0) > (prev.day ?? 0)) bySeed.set(g.seed, prev ? { ...g, golden: g.golden || prev.golden } : g);
      else if (g.golden && !prev.golden) bySeed.set(g.seed, { ...prev, golden: true });
    }
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const g of raw) {
      if (!g || !g.seed || seen.has(g.seed)) continue;
      seen.add(g.seed);
      out.push(bySeed.get(g.seed));
    }
    return out;
  } catch {
    return [];
  }
}
function loadHeritage() {
  try {
    const h = JSON.parse(localStorage.getItem(HERITAGE_KEY) || "{}");
    return { jobs: h.jobs || [], kits: h.kits || [], goldenEpitaph: !!h.goldenEpitaph };
  } catch {
    return { jobs: [], kits: [] };
  }
}
function saveHeritage(h) {
  try {
    localStorage.setItem(HERITAGE_KEY, JSON.stringify(h));
  } catch {
  }
}
function takePendingKits() {
  const h = loadHeritage();
  const kits = h.kits;
  if (kits.length) {
    h.kits = [];
    saveHeritage(h);
  }
  return kits;
}
function peekLegacy() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const l = JSON.parse(raw);
    return l && l.item ? l : null;
  } catch {
    return null;
  }
}
function clearLegacy() {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
  }
}

// client/src/contexts/data/util.ts
function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
var L = (fr, en) => getLang() === "en" ? en : fr;

// client/src/contexts/data/world.ts
var NAMES = [
  "Marcel",
  "G\xE9rard",
  "Lucienne",
  "Albert",
  "Yvette",
  "Ren\xE9",
  "Josette",
  "Fernand",
  "Ginette",
  "Maurice",
  "Colette",
  "Raymond",
  "Simone",
  "Jean-Claude",
  "Bernadette",
  "Didier",
  "Monique",
  "Thierry",
  "Huguette",
  "Patrick"
];
var FEMALE_NAMES = /* @__PURE__ */ new Set([
  "Lucienne",
  "Yvette",
  "Josette",
  "Ginette",
  "Colette",
  "Simone",
  "Bernadette",
  "Monique",
  "Huguette"
]);
function genderFromName(name) {
  return FEMALE_NAMES.has(name) ? "f" : "m";
}
var JOBS = [
  { id: "comptable", name: "Ancien Comptable", description: "Les chiffres, \xE7a le conna\xEEt. Les poubelles, un peu moins.", bonusStats: { dignity: 10 }, startingItems: ["calculatrice"], emoji: "\u{1F9EE}" },
  { id: "ouvrier", name: "Ancien Ouvrier", description: "Des mains en or et un dos en compote.", bonusStats: { health: 10 }, startingItems: ["cle-molette"], emoji: "\u{1F527}" },
  { id: "professeur", name: "Ancien Professeur", description: "Il corrige encore les fautes sur les panneaux.", bonusStats: { mental: 15 }, startingItems: ["livre"], emoji: "\u{1F4DA}" },
  { id: "sommelier", name: "Ancien Sommelier", description: "Peut distinguer un Bordeaux d'un jus de poubelle. Parfois.", bonusStats: { hunger: 10 }, startingItems: ["tire-bouchon"], emoji: "\u{1F377}" },
  { id: "cascadeur", name: "Ancien Cascadeur", description: "Tombe de haut. Litt\xE9ralement et figurativement.", bonusStats: { health: 5 }, startingItems: ["genouillere"], emoji: "\u{1F938}" },
  { id: "informaticien", name: "Ancien Informaticien", description: "Cherche encore le WiFi gratuit.", bonusStats: { mental: 10 }, startingItems: ["cable-usb"], emoji: "\u{1F4BB}" },
  { id: "cuisinier", name: "Ancien Cuisinier", description: "Transforme un rat en ratatouille.", bonusStats: { hunger: 15 }, startingItems: ["couteau-suisse"], emoji: "\u{1F468}\u200D\u{1F373}" },
  { id: "infirmier", name: "Ancien Infirmier", description: "Se soigne avec des feuilles de journal.", bonusStats: { health: 15 }, startingItems: ["bandage"], emoji: "\u{1F3E5}" },
  { id: "artiste", name: "Ancien Artiste", description: "Son art n'a jamais \xE9t\xE9 compris. M\xEAme par lui.", bonusStats: { dignity: 15 }, startingItems: ["crayon"], emoji: "\u{1F3A8}" },
  { id: "militaire", name: "Ancien Militaire", description: "Dort debout et mange n'importe quoi.", bonusStats: { health: 10 }, startingItems: ["couverture-survie"], emoji: "\u{1F396}\uFE0F" },
  { id: "bibliothecaire", name: "Ancien Biblioth\xE9caire", description: "Conna\xEEt tous les recoins de la ville.", bonusStats: { mental: 10 }, startingItems: ["carte-ville"], emoji: "\u{1F4D6}" },
  { id: "vendeur", name: "Ancien Vendeur de Voitures", description: "Peut vendre un carton mouill\xE9 comme un loft.", bonusStats: { dignity: 5 }, startingItems: ["cravate"], emoji: "\u{1F697}" },
  { id: "jardinier", name: "Ancien Jardinier", description: "Fait pousser des tomates dans une chaussure.", bonusStats: { hunger: 10 }, startingItems: ["graines"], emoji: "\u{1F331}" },
  { id: "avocat", name: "Ancien Avocat", description: "Conna\xEEt ses droits. Et ceux des pigeons.", bonusStats: { dignity: 10, mental: 5 }, startingItems: ["code-civil"], emoji: "\u2696\uFE0F" },
  { id: "musicien", name: "Ancien Musicien", description: "Son harmonica a connu des jours meilleurs.", bonusStats: { mental: 10, dignity: 5 }, startingItems: ["harmonica-casse"], emoji: "\u{1F3B5}" },
  { id: "boxeur", name: "Ancien Boxeur", description: "Les poings se souviennent. Le reste a un peu oubli\xE9.", bonusStats: { health: 10 }, startingItems: ["gants-boxe"], emoji: "\u{1F94A}", locked: true },
  { id: "poete", name: "Ancien Po\xE8te", description: "Des vers plein la t\xEAte, des trous plein les poches.", bonusStats: { mental: 15 }, startingItems: ["carnet-poemes"], emoji: "\u{1F58B}\uFE0F", locked: true }
];
var TRAITS = [
  { id: "estomac-acier", name: "Estomac d'Acier", description: "Dig\xE8re tout : la faim vient plus lentement", positive: true, effects: { hunger: 5 }, emoji: "\u{1F9BE}" },
  { id: "optimiste", name: "Optimiste N\xE9", description: "La sant\xE9 mentale remonte plus vite", positive: true, effects: { mental: 10 }, emoji: "\u{1F60A}" },
  { id: "poissard", name: "Poissard", description: "Plus d'\xE9v\xE9nements n\xE9gatifs, score x2", positive: false, effects: { mental: -5 }, emoji: "\u{1F340}" },
  { id: "ami-pigeons", name: "Ami des Pigeons", description: "Les oiseaux apportent des objets", positive: true, effects: {}, emoji: "\u{1F426}" },
  { id: "sommeil-plomb", name: "Sommeil de Plomb", description: "R\xE9cup\xE8re plus vite en dormant", positive: true, effects: { sleep: 10 }, emoji: "\u{1F634}" },
  { id: "nez-sensible", name: "Nez Sensible", description: "Flaire les coups : projectiles annonc\xE9s au combat", positive: true, effects: { dignity: -5 }, emoji: "\u{1F443}" },
  { id: "insomniaque", name: "Insomniaque", description: "Moins de sommeil requis, mental fragile", positive: false, effects: { sleep: 10, mental: -10 }, emoji: "\u{1F319}" },
  { id: "paranoiaque", name: "Parano\xEFaque", description: "Toujours sur ses gardes : anticipe les coups, mais stress\xE9", positive: false, effects: { mental: -10 }, emoji: "\u{1F440}" },
  { id: "main-verte", name: "Main Verte", description: "Fait pousser des choses dans des pots", positive: true, effects: { hunger: 5 }, emoji: "\u{1F33F}" },
  { id: "charismatique", name: "Charismatique", description: "Les passants donnent plus facilement", positive: true, effects: { dignity: 5 }, emoji: "\u2728" },
  { id: "os-mousse", name: "Os en Mousse", description: "Subit plus de d\xE9g\xE2ts physiques", positive: false, effects: { health: -10 }, emoji: "\u{1F9B4}" },
  { id: "metabolisme", name: "M\xE9tabolisme Rapide", description: "Gu\xE9rit vite, mais toujours faim", positive: false, effects: { health: 5, hunger: -10 }, emoji: "\u26A1" },
  { id: "collectionneur", name: "Collectionneur", description: "Bonus moral si inventaire plein", positive: true, effects: { mental: 5 }, emoji: "\u{1F4E6}" },
  { id: "phobie-rats", name: "Phobie des Rats", description: "Panique en zone industrielle", positive: false, effects: { mental: -5 }, emoji: "\u{1F400}" },
  { id: "haleine", name: "Haleine Redoutable", description: "Bonus combat, malus social", positive: false, effects: { dignity: -10 }, emoji: "\u{1F4A8}" },
  { id: "agile", name: "Agile", description: "Excellente capacit\xE9 de fuite", positive: true, effects: {}, emoji: "\u{1F3C3}" },
  { id: "resistant-froid", name: "R\xE9sistant au Froid", description: "Dort dehors sans couverture", positive: true, effects: { health: 5 }, emoji: "\u2744\uFE0F" },
  { id: "bricoleur", name: "Bricoleur du Dimanche", description: "Bricole une arme de fortune au combat", positive: true, effects: {}, emoji: "\u{1F528}" },
  { id: "orientation", name: "Sens de l'Orientation", description: "Conna\xEEt les raccourcis : voyager remonte le moral", positive: true, effects: {}, emoji: "\u{1F9ED}" },
  { id: "ventre-pattes", name: "Ventre sur Pattes", description: "Mange n'importe quoi, en grande quantit\xE9", positive: false, effects: { hunger: -15 }, emoji: "\u{1F354}" }
];
var LOCATIONS = {
  "parc": { name: "Parc Municipal", nameEn: "City Park", emoji: "\u{1F333}", danger: 20, resources: 40, description: "Des bancs, des pigeons, et de l'herbe o\xF9 personne ne vient vous d\xE9loger avant midi.", descriptionEn: "Nature, pigeons, benches. A napper's paradise." },
  "centre-ville": { name: "Centre-Ville", nameEn: "Downtown", emoji: "\u{1F3D9}\uFE0F", danger: 30, resources: 60, description: "Du monde du matin au soir, des vitrines, et une patrouille qui repasse toutes les heures.", descriptionEn: "Passers-by, shops, police. A lot of people." },
  "zone-industrielle": { name: "Zone Industrielle", nameEn: "Industrial Zone", emoji: "\u{1F3ED}", danger: 60, resources: 80, description: "De la rouille, des rats, et ce que les entreprises jettent sans regarder.", descriptionEn: "Rats, rust and hidden treasure. Bring gloves." },
  "gare": { name: "Gare", nameEn: "Train Station", emoji: "\u{1F682}", danger: 40, resources: 50, description: "Un toit, du chauffage jusqu'\xE0 minuit, et des vigiles qui connaissent les visages.", descriptionEn: "Travelers, shelter, security. A temporary roof." },
  "marche": { name: "March\xE9", nameEn: "Market", emoji: "\u{1F6D2}", danger: 25, resources: 70, description: "De la nourriture partout, des commer\xE7ants press\xE9s, et des cagettes pleines \xE0 la fermeture.", descriptionEn: "Food, vendors. Watch out for guards." }
};
var HERITAGE_KITS = [
  {
    id: "kit-casse-croute",
    name: "le Casse-cro\xFBte du Souvenir",
    nameEn: "the Memorial Snack",
    emoji: "\u{1F956}",
    cost: 10,
    money: 0,
    desc: "Un sandwich et une gourde pleine pour bien commencer.",
    descEn: "A sandwich and a full flask for a decent start.",
    items: [
      { id: "kit-sandwich", name: "Sandwich emball\xE9", emoji: "\u{1F96A}", type: "food", value: 4, effect: { hunger: 15 } },
      { id: "kit-gourde", name: "Gourde pleine", emoji: "\u{1F964}", type: "food", value: 3, effect: { thirst: 14 } }
    ]
  },
  {
    id: "kit-pecule",
    name: "le P\xE9cule du D\xE9funt",
    nameEn: "the Departed's Nest Egg",
    emoji: "\u{1F4B6}",
    cost: 12,
    money: 8,
    desc: "8\u20AC de d\xE9part, \xE9conomis\xE9s pi\xE8ce par pi\xE8ce par vos pr\xE9d\xE9cesseurs.",
    descEn: "\u20AC8 to start, saved coin by coin by your predecessors.",
    items: []
  },
  {
    id: "kit-bricoleur",
    name: "la Trousse du Bricoleur",
    nameEn: "the Tinkerer's Pouch",
    emoji: "\u{1F9F0}",
    cost: 15,
    money: 0,
    desc: "Une cl\xE9 \xE0 molette et de quoi bricoler une arme de fortune.",
    descEn: "A wrench and something to rig a makeshift weapon from.",
    items: [
      { id: "kit-cle", name: "Cl\xE9 \xE0 molette rouill\xE9e", emoji: "\u{1F527}", type: "weapon", value: 8, attackBonus: 3, combatStyle: "heavy" },
      { id: "kit-ficelle", name: "Pelote de ficelle", emoji: "\u{1F9F5}", type: "junk", value: 2 }
    ]
  }
];
var STARTING_ITEMS = {
  "calculatrice": { id: "calculatrice", name: "Calculatrice solaire", emoji: "\u{1F9EE}", type: "tool", value: 5, effect: { mental: 8 } },
  "gants-boxe": { id: "gants-boxe", name: "Gants de boxe fatigu\xE9s", emoji: "\u{1F94A}", type: "weapon", value: 8, attackBonus: 3, combatStyle: "heavy" },
  "carnet-poemes": { id: "carnet-poemes", name: "Carnet de po\xE8mes", emoji: "\u{1F4D3}", type: "tool", value: 4, effect: { mental: 10 } },
  "cle-molette": { id: "cle-molette", name: "Cl\xE9 \xE0 molette rouill\xE9e", emoji: "\u{1F527}", type: "weapon", value: 8, attackBonus: 3, combatStyle: "heavy" },
  "livre": { id: "livre", name: "Livre de philo", emoji: "\u{1F4DA}", type: "tool", value: 3, effect: { mental: 5 } },
  "tire-bouchon": { id: "tire-bouchon", name: "Tire-bouchon de sommelier", emoji: "\u{1F377}", type: "tool", value: 6, effect: { thirst: 10, mental: 5 } },
  "genouillere": { id: "genouillere", name: "Genouill\xE8re us\xE9e", emoji: "\u{1F9B5}", type: "armor", value: 4, defenseBonus: 2 },
  "cable-usb": { id: "cable-usb", name: "C\xE2ble USB myst\xE9rieux", emoji: "\u{1F50C}", type: "junk", value: 2, effect: { mental: 4 } },
  "couteau-suisse": { id: "couteau-suisse", name: "Couteau suisse", emoji: "\u{1F52A}", type: "weapon", value: 12, attackBonus: 4, combatStyle: "precise" },
  "bandage": { id: "bandage", name: "Bandage propre", emoji: "\u{1FA79}", type: "tool", value: 5, effect: { health: 15 } },
  "crayon": { id: "crayon", name: "Crayon \xE0 papier", emoji: "\u270F\uFE0F", type: "tool", value: 1, effect: { mental: 6 } },
  "couverture-survie": { id: "couverture-survie", name: "Couverture de survie", emoji: "\u{1F6E1}\uFE0F", type: "armor", value: 10, defenseBonus: 3 },
  "carte-ville": { id: "carte-ville", name: "Carte de la ville", emoji: "\u{1F5FA}\uFE0F", type: "tool", value: 4, effect: { mental: 6 } },
  "cravate": { id: "cravate", name: "Cravate en soie", emoji: "\u{1F454}", type: "junk", value: 8, effect: { dignity: 10 } },
  "graines": { id: "graines", name: "Sachet de graines", emoji: "\u{1F331}", type: "tool", value: 3, effect: { hunger: 12, mental: 4 } },
  "code-civil": { id: "code-civil", name: "Code Civil (\xE9dition 1987)", emoji: "\u{1F4D5}", type: "weapon", value: 6, attackBonus: 2, combatStyle: "heavy" },
  "harmonica-casse": { id: "harmonica-casse", name: "Harmonica cass\xE9", emoji: "\u{1F3B5}", type: "special", value: 5, effect: { mental: 12 } }
};
var CAPACITE_BASE = 20;
var SACS_A_DOS = {
  "sac-dos-troue": 4,
  // celui de l'échoppe, 4 €
  "sac-dos": 5
  // celui qu'on trouve à la déchetterie
};
function bagCapacity(c) {
  let bonus = 0;
  for (const id of Object.keys(SACS_A_DOS)) {
    if (c.inventory.some((i) => i.id === id)) bonus = Math.max(bonus, SACS_A_DOS[id]);
  }
  return CAPACITE_BASE + bonus;
}
function generateCharacter(evite) {
  const unlockedJobs = loadHeritage().jobs;
  const jobsOuverts = JOBS.filter((j) => !j.locked || unlockedJobs.includes(j.id));
  const jobsLibres = jobsOuverts.filter((j) => !evite?.metiers?.includes(j.id));
  const job = randomFromArray(jobsLibres.length > 0 ? jobsLibres : jobsOuverts);
  const availableTraits = [...TRAITS];
  const trait1Index = Math.floor(Math.random() * availableTraits.length);
  const trait1 = availableTraits.splice(trait1Index, 1)[0];
  const trait2 = randomFromArray(availableTraits);
  const nomsLibres = NAMES.filter((n) => !evite?.prenoms?.includes(n));
  const name = randomFromArray(nomsLibres.length > 0 ? nomsLibres : NAMES);
  const baseStats = { health: 70, mental: 60, hunger: 50, thirst: 50, sleep: 60, dignity: 40 };
  Object.entries(job.bonusStats).forEach(([key, val]) => {
    if (val) baseStats[key] = Math.min(100, baseStats[key] + val);
  });
  [trait1, trait2].forEach((trait) => {
    Object.entries(trait.effects).forEach(([key, val]) => {
      if (val) baseStats[key] = Math.max(0, Math.min(100, baseStats[key] + val));
    });
  });
  const startingItems = job.startingItems.map((id) => STARTING_ITEMS[id]).filter(Boolean);
  const startingMoney = job.id === "comptable" ? 25 : job.id === "vendeur" ? 10 : 2;
  return {
    name,
    job,
    traits: [trait1, trait2],
    stats: baseStats,
    money: startingMoney,
    respect: 0,
    inventory: startingItems,
    day: 1,
    // Point de départ aléatoire : chaque partie commence dans un quartier
    // différent (parc, centre-ville, gare, marché, zone industrielle).
    location: randomFromArray(Object.keys(LOCATIONS)),
    alive: true,
    activeFlags: [],
    stealCount: 0,
    seed: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    gender: genderFromName(name)
  };
}
function generateCharacterTrio(evites = []) {
  const trio = [];
  const prenoms = [...evites];
  const metiers = [];
  for (let i = 0; i < 3; i++) {
    const c = generateCharacter({ prenoms, metiers });
    prenoms.push(c.name);
    metiers.push(c.job.id);
    trio.push(c);
  }
  return trio;
}
var TRAITS_PRETABLES = [
  "bricoleur",
  // bricole une arme au combat
  "charismatique",
  // les passants donnent plus
  "orientation",
  // voyager remonte le moral
  "nez-sensible",
  // les projectiles sont annoncés
  "ami-pigeons",
  // les oiseaux rapportent des objets
  "resistant-froid",
  // la nuit dehors coûte moins cher
  "agile"
  // on s'échappe mieux
];
function traitPretable(traits) {
  return traits.find((t) => TRAITS_PRETABLES.includes(t.id)) ?? null;
}
function hasTrait(c, id) {
  if (c.traits.some((t) => t.id === id)) return true;
  return c.compagnon?.traitId === id && c.compagnon.jour === c.day;
}
function computeScore(day2, respect, money2, poissard = false) {
  return (day2 * 10 + respect * 5 + money2 * 2) * (poissard ? 2 : 1);
}

// client/src/contexts/data/salvage.ts
var TROUVAILLES = [
  { id: "recup-manteau", name: "Manteau militaire (presque propre)", emoji: "\u{1F9E5}", type: "armor", value: 14, defenseBonus: 4 },
  { id: "recup-barre", name: "Barre de fer", emoji: "\u{1F527}", type: "weapon", value: 12, attackBonus: 5, combatStyle: "heavy" },
  { id: "recup-duvet", name: "Duvet oubli\xE9", emoji: "\u{1F6CC}", type: "tool", value: 11, effect: { sleep: 26, health: 5 } },
  { id: "recup-conserves", name: "Carton de conserves (p\xE9rim\xE9es de peu)", emoji: "\u{1F96B}", type: "food", value: 10, effect: { hunger: 30 } },
  { id: "recup-radio", name: "Radio qui gr\xE9sille", emoji: "\u{1F4FB}", type: "special", value: 9, effect: { mental: 16 } },
  { id: "recup-chaussures", name: "Chaussures \xE0 votre taille", emoji: "\u{1F45F}", type: "tool", value: 13, effect: { health: 10, dignity: 8 } }
];
var TROUVAILLE_VERTE = {
  id: "recup-basilic",
  name: "Pot de basilic (vivant, contre toute attente)",
  emoji: "\u{1FAB4}",
  type: "food",
  value: 8,
  effect: { hunger: 12, mental: 14 }
};
var SALVAGE_JUNK = [
  { id: "ferraille-recup", name: "Ferraille r\xE9cup\xE9r\xE9e", emoji: "\u{1F529}", type: "junk", value: 2 },
  { id: "cable-recup", name: "C\xE2ble r\xE9cup\xE9r\xE9", emoji: "\u{1F50C}", type: "junk", value: 2 },
  { id: "tissu-recup", name: "Tissu r\xE9cup\xE9r\xE9", emoji: "\u{1F9F5}", type: "junk", value: 1 },
  { id: "bache-recup", name: "B\xE2che r\xE9cup\xE9r\xE9e", emoji: "\u{1FA9F}", type: "junk", value: 2 },
  { id: "piece-recup", name: "Pi\xE8ces d\xE9tach\xE9es", emoji: "\u{1FA9B}", type: "junk", value: 2 }
];
var SALVAGE_TUNING = {
  riskMax: 100,
  // au-delà, le tas se réveille et on repart les mains vides
  piegeRisk: 10,
  // agitation gagnée en réveillant une saleté
  // Grille volontairement petite : à 7x9 les cases étaient minuscules et la
  // fouille interminable. Moins de cases, plus grandes, on voit ce qu'on fait.
  gridW: 6,
  // colonnes de détritus à déblayer
  gridH: 7,
  // lignes
  /** Part de la couche à déblayer avant de pouvoir descendre. */
  clearToDig: 0.55,
  maxKept: 6
  // on n'a que deux poches, et l'établi n'en demande pas plus
};
function trouvailleById(id) {
  if (id === TROUVAILLE_VERTE.id) return TROUVAILLE_VERTE;
  return TROUVAILLES.find((t) => t.id === id) || null;
}
function salvagePayout(centimes) {
  return Math.floor(centimes / 100);
}
var SOFT_PIEGES = ["poisson", "couche", "yaourt"];
function piegeHurts(c, findId) {
  const out = { health: 0, hunger: 0 };
  if (hasTrait(c, "os-mousse") && (findId === "verre-casse" || findId === "rat" || findId === "guepes")) out.health -= 2;
  if (hasTrait(c, "ventre-pattes") && SOFT_PIEGES.includes(findId)) out.hunger += 5;
  return out;
}
function salvageResultImage(busted, empty) {
  if (busted) return { image: "/assets/result-recup-bust.webp", fallbackImage: "/assets/result-exp-poubelle-bureau-bad.webp" };
  if (empty) return { image: "/assets/result-recup-vide.webp", fallbackImage: "/assets/result-exp-dechetterie-bad.webp" };
  return { image: "/assets/result-recup-good.webp", fallbackImage: "/assets/result-exp-dechetterie-good.webp" };
}

// client/src/contexts/data/enemies.ts
var ENEMIES = [
  { name: "Commer\xE7ant Furieux", emoji: "\u{1F621}", health: 32, attack: 11, description: "Il vous a pris la main dans le sac. Et il a de la poigne.", loot: { respect: 2, item: { id: "sandwich-confisque", name: "Sandwich de l'\xE9tal", emoji: "\u{1F96A}", type: "food", value: 5, effect: { hunger: 15 } } } },
  { name: "Rat G\xE9ant", emoji: "\u{1F400}", health: 20, attack: 8, description: "Un rat de la taille d'un chihuahua. Il n'a pas peur.", loot: { money: 2, respect: 1 } },
  { name: "Mouette Furibonde", emoji: "\u{1F985}", health: 15, attack: 6, description: "Elle veut votre sandwich. Elle aura votre sandwich.", loot: { respect: 2 } },
  { name: "Chien Errant", emoji: "\u{1F415}", health: 30, attack: 12, description: "Un molosse sans collier. Ses crocs brillent au clair de lune.", loot: { money: 3, respect: 3 } },
  { name: "Pigeon Alpha", emoji: "\u{1F426}", health: 10, attack: 4, description: "Le chef du gang de pigeons. Il roucoule avec menace.", loot: { money: 1, respect: 1 } },
  { name: "Voyou du Coin", emoji: "\u{1F9D4}", health: 40, attack: 15, description: "Un type louche qui veut votre spot et qui a d\xE9j\xE0 pos\xE9 son sac dessus.", loot: { money: 8, respect: 5, item: { id: "couteau-cran", name: "Couteau \xE0 cran us\xE9", emoji: "\u{1F52A}", type: "weapon", value: 9, attackBonus: 4, combatStyle: "precise" } } },
  { name: "Agent de S\xE9curit\xE9", emoji: "\u{1F46E}", health: 35, attack: 10, description: "Il fait du z\xE8le, et il a une lampe torche pour \xE7a.", loot: { respect: 4 } },
  { name: "Chat de Goutti\xE8re", emoji: "\u{1F431}", health: 12, attack: 7, description: "Petit mais vicieux. Ses griffes sont des rasoirs.", loot: { money: 1 } },
  { name: "Raton Laveur", emoji: "\u{1F99D}", health: 25, attack: 9, description: "Il fouille VOTRE poubelle, et il trie mieux que vous.", loot: { money: 3, respect: 2 } },
  { name: "Corbeau G\xE9ant", emoji: "\u{1F426}\u200D\u2B1B", health: 18, attack: 7, description: "Noir comme la nuit, m\xE9chant comme le jour.", image: "/assets/combat-corbeau-fjv5mmnWmHHKd72RfGopfD.webp", loot: { money: 2, respect: 2, item: { id: "bague-brillante", name: "Bague brillante (vol\xE9e ?)", emoji: "\u{1F48D}", type: "junk", value: 9 } } },
  { name: "Ivrogne Agressif", emoji: "\u{1F37A}", health: 35, attack: 11, description: "Il titube mais frappe fort. Tr\xE8s fort.", image: "/assets/combat-ivrogne-fnqUTa9w2g29Z7Y8UCPEJQ.webp", loot: { money: 5, respect: 3, item: { id: "bouteille-ivrogne", name: "Bouteille (presque) vide", emoji: "\u{1F37E}", type: "weapon", value: 4, attackBonus: 3, combatStyle: "heavy" } } },
  { name: "Vigile Z\xE9l\xE9", emoji: "\u{1F526}", health: 38, attack: 12, description: "Badge, lampe torche, ego surdimensionn\xE9.", image: "/assets/combat-vigile-8AYmxD2oRKZLSGj3y3tgdy.webp", loot: { money: 4, respect: 4, item: { id: "lampe-torche", name: "Lampe torche du vigile", emoji: "\u{1F526}", type: "tool", value: 7 } } },
  { name: "Cygne Furieux", emoji: "\u{1F9A2}", health: 22, attack: 9, description: "\xC9l\xE9gant mais mortel. Ne jamais sous-estimer un cygne.", image: "/assets/combat-cygne-Do53kfaKnGAeMKwxEmgUi4.webp", loot: { respect: 3 } },
  { name: "Clown Sinistre", emoji: "\u{1F921}", health: 28, attack: 10, description: "Son rire r\xE9sonne dans la nuit. Personne ne rit avec lui.", image: "/assets/combat-clown-Lauu92h5boZ4Z4nRnyDEaT.webp", loot: { money: 6, respect: 4 } },
  { name: "\xC9cureuil Enrag\xE9", emoji: "\u{1F43F}\uFE0F", health: 8, attack: 5, description: "Petit, rapide, et il veut vos noisettes. Vous avez pas de noisettes.", image: "/assets/combat-ecureuil-AN8vTTKVptLec9zLjTGRNw.webp", loot: { money: 1 } },
  { name: "Oie Territoriale", emoji: "\u{1FABF}", health: 16, attack: 8, description: "HONK. Elle d\xE9fend son territoire avec une rage ancestrale.", image: "/assets/combat-oie-LUVjnB536FgK83afqjVs7X.webp", loot: { respect: 2 } },
  { name: "Canard Psychopathe", emoji: "\u{1F986}", health: 14, attack: 6, description: "Coin coin... COIN COIN ! Il charge !", image: "/assets/combat-canard-gMZvQxLn7Yofnd5dnr3dZM.webp", loot: { money: 1, respect: 1 } },
  { name: "Coq de Combat", emoji: "\u{1F413}", health: 20, attack: 10, description: "R\xE9veill\xE9 \xE0 4h du matin. Et il est furieux.", image: "/assets/combat-coq-URw8wuYwXEgZPMq4wFjJu2.webp", loot: { money: 3, respect: 2 } },
  { name: "Chat Territorial", emoji: "\u{1F63E}", health: 15, attack: 8, description: "Ce coin est \xE0 LUI. Et il va vous le prouver.", image: "/assets/combat-chat-territorial-2N2qDLSJ5PEDpR4bibLqqR.webp", loot: { money: 2, respect: 1 } },
  { name: "Mouette G\xE9ante", emoji: "\u{1F985}", health: 24, attack: 11, description: "La m\xE8re de toutes les mouettes. Elle vous arrive \xE0 la taille.", image: "/assets/combat-mouette-geante-msASE7NG2HZ8VNUAwFqgA3.webp", loot: { money: 4, respect: 3 } },
  { name: "Raton Laveur Alpha", emoji: "\u{1F99D}", health: 30, attack: 10, description: "Le boss des ratons. Il porte un masque naturel de bandit.", image: "/assets/combat-raton-laveur-DV28WgnY4Dw7WEQpakPMzH.webp", loot: { money: 5, respect: 3, item: { id: "montre-cassee", name: "Montre cass\xE9e (butin du raton)", emoji: "\u231A", type: "junk", value: 6 } } },
  { name: "Chat Sauvage", emoji: "\u{1F408}", health: 18, attack: 9, description: "Pas de collier, pas de ma\xEEtre, pas de piti\xE9.", image: "/assets/combat-chat-sauvage-fFoiY6tVx6eNamsMbyGbNq.webp", loot: { money: 2, respect: 2 } },
  // Le boss des échecs de « grand coup » (voir data/heist.ts) : il ne rôde
  // nulle part ailleurs, on ne le croise qu'en ratant un casse gardé. Très
  // dur à battre, mais le vaincre paie en respect et en trophée.
  { name: "Vigile de Choc", emoji: "\u{1F9BA}", health: 95, attack: 21, description: "Ancien videur, actuel mur. Il ne court pas : il n'en a pas besoin.", image: "/assets/combat-vigile-choc.webp", loot: { money: 8, respect: 6, item: { id: "badge-vigile", name: "Badge de vigile (troph\xE9e)", emoji: "\u{1FAAA}", type: "junk", value: 12 } } },
  // Humains croisés par la « Bagarre » : ils ont désormais leur fiche (donc
  // leur motif d'esquive, leur voix et leur butin).
  { name: "Pickpocket", emoji: "\u{1F90F}", health: 22, attack: 9, description: "Il veut vos poches. Vous n'avez que des poches.", loot: { money: 6, respect: 2 } },
  { name: "Squatteur Territorial", emoji: "\u{1F620}", health: 52, attack: 17, description: "Ce hangar est \xE0 lui. Il l'a d\xE9cid\xE9 tout seul.", loot: { money: 5, respect: 4 } },
  { name: "Concurrent Agressif", emoji: "\u{1F4A2}", health: 38, attack: 13, description: "Un autre sans-abri qui veut votre coin. La rue est petite.", loot: { money: 4, respect: 3 } }
];
var COMBAT_IMAGES = {
  "Commer\xE7ant Furieux": "/assets/combat-commercant.webp",
  "Rat G\xE9ant": "/assets/combat-rat-geant.webp",
  "Mouette Furibonde": "/assets/combat-mouette-furibonde.webp",
  "Chien Errant": "/assets/combat-chien-errant.webp",
  "Pigeon Alpha": "/assets/combat-pigeon-alpha.webp",
  "Voyou du Coin": "/assets/combat-voyou.webp",
  "Agent de S\xE9curit\xE9": "/assets/combat-agent-securite.webp",
  "Chat de Goutti\xE8re": "/assets/combat-chat-gouttiere.webp",
  "Raton Laveur": "/assets/combat-raton.webp",
  "Concurrent Agressif": "/assets/combat-concurrent.webp",
  "Pickpocket": "/assets/combat-pickpocket.webp",
  "Squatteur Territorial": "/assets/combat-squatteur.webp"
};
var PATTERN_FAMILY = {
  bird: "bird",
  small: "small",
  beast: "beast",
  drunk: "drunk",
  brute: "brute",
  seagull: "bird",
  pigeon: "bird",
  crow: "bird",
  duck: "bird",
  goose: "bird",
  swan: "bird",
  rooster: "bird",
  cat: "small",
  rat: "small",
  squirrel: "small",
  dog: "beast",
  raccoon: "beast",
  clown: "brute",
  cop: "brute",
  bigguard: "brute",
  merchant: "brute",
  thug: "brute",
  pickpocket: "small",
  squatter: "brute",
  rival: "brute",
  king: "brute"
};
var SPECIES_PATTERN = {
  "\u{1F985}": "seagull",
  "\u{1F426}": "pigeon",
  "\u{1F426}\u200D\u2B1B": "crow",
  "\u{1F986}": "duck",
  "\u{1FABF}": "goose",
  "\u{1F9A2}": "swan",
  "\u{1F413}": "rooster",
  "\u{1F431}": "cat",
  "\u{1F63E}": "cat",
  "\u{1F408}": "cat",
  "\u{1F400}": "rat",
  "\u{1F43F}\uFE0F": "squirrel",
  "\u{1F415}": "dog",
  "\u{1F99D}": "raccoon",
  "\u{1F921}": "clown",
  "\u{1F46E}": "cop",
  "\u{1F526}": "cop",
  "\u{1F9BA}": "bigguard",
  "\u{1F621}": "merchant",
  "\u{1F9D4}": "thug",
  "\u{1F37A}": "drunk",
  "\u{1F37E}": "drunk",
  "\u{1F90F}": "pickpocket",
  "\u{1F620}": "squatter",
  "\u{1F4A2}": "rival",
  "\u{1F451}": "king"
};
function getPattern(enemy) {
  const species = SPECIES_PATTERN[enemy.emoji];
  if (species) return species;
  const birds = ["\u{1F426}", "\u{1F985}", "\u{1F9A2}", "\u{1FABF}", "\u{1F986}", "\u{1F413}", "\u{1F426}\u200D\u2B1B"];
  const cats = ["\u{1F431}", "\u{1F63E}", "\u{1F408}"];
  const small = ["\u{1F400}", "\u{1F43F}\uFE0F", "\u{1F426}"];
  if (birds.includes(enemy.emoji)) return "bird";
  if (/ivrogne/i.test(enemy.name)) return "drunk";
  if (cats.includes(enemy.emoji) || small.includes(enemy.emoji) || enemy.health <= 16) return "small";
  if (["\u{1F99D}", "\u{1F415}", "\u{1F400}"].includes(enemy.emoji)) return "beast";
  if (enemy.attack >= 11 || ["\u{1F9D4}", "\u{1F46E}", "\u{1F526}", "\u{1F921}"].includes(enemy.emoji)) return "brute";
  return "beast";
}
var HUMAN_EMOJIS = ["\u{1F9D4}", "\u{1F46E}", "\u{1F526}", "\u{1F9BA}", "\u{1F621}", "\u{1F921}", "\u{1F90F}", "\u{1F620}", "\u{1F4A2}", "\u{1F451}", "\u{1F37A}"];
function isHumanEnemy(enemy) {
  return HUMAN_EMOJIS.includes(enemy.emoji) || /vigile|agent|s[ée]curit|polic|voyou|squatteur|pickpocket|concurrent|roi/i.test(enemy.name);
}
function signTendency(enemy) {
  if (/vigile|agent|s[ée]curit|commer[çc]ant|polic|concierge/i.test(enemy.name)) {
    return { strike: 0.3, feint: 0.15, guard: 0.55 };
  }
  switch (PATTERN_FAMILY[getPattern(enemy)] ?? "brute") {
    case "bird":
      return { strike: 0.2, feint: 0.55, guard: 0.25 };
    case "small":
      return { strike: 0.3, feint: 0.5, guard: 0.2 };
    case "drunk":
      return { strike: 0.5, feint: 0.3, guard: 0.2 };
    case "beast":
      return { strike: 0.45, feint: 0.35, guard: 0.2 };
    default:
      return { strike: 0.55, feint: 0.25, guard: 0.2 };
  }
}
function rollSignRound(enemy, character, guaranteed, lastPlayerSign) {
  const all = ["strike", "feint", "guard"];
  const COUNTER = { feint: "strike", guard: "feint", strike: "guard" };
  const human = isHumanEnemy(enemy);
  let enemySign;
  const readChance = enemy.emoji === "\u{1F451}" ? 0.62 : 0.42;
  if (human && lastPlayerSign && Math.random() < readChance) {
    enemySign = COUNTER[lastPlayerSign];
  } else {
    const tendency = signTendency(enemy);
    let r = Math.random();
    enemySign = "strike";
    for (const id of all) {
      r -= tendency[id];
      if (r <= 0) {
        enemySign = id;
        break;
      }
    }
  }
  const sharp = character.traits.some((t) => t.id === "paranoiaque" || t.id === "nez-sensible");
  const tellChance = guaranteed ? 1 : (human ? 0.36 : 0.5) + (sharp ? 0.25 : 0);
  if (Math.random() >= tellChance) return { enemySign, tellSign: null, tellSure: false };
  const truthful = guaranteed || Math.random() < (human ? 0.5 : 0.7);
  const others = all.filter((s) => s !== enemySign);
  const tellSign = truthful ? enemySign : others[Math.floor(Math.random() * others.length)];
  return { enemySign, tellSign, tellSure: guaranteed };
}

// client/src/contexts/data/passersby.ts
function enemyByName(name) {
  return ENEMIES.find((e) => e.name === name) || null;
}
var BEG_TUNING = {
  roundMs: 24e3,
  // durée d'une session de mendicité
  spawnMs: 1400,
  // un passant toutes les ~1,4 s
  maxOnScreen: 4,
  // au-delà, la rue devient illisible au pouce
  copEveryMs: 8e3,
  // la ronde passe environ toutes les 8 s
  copStayMs: 3200,
  // et reste visible ce temps-là
  grabR: 34,
  // rayon de préhension, généreux : on joue au pouce
  // Plafond de fierté qu'une seule session peut coûter. Sans lui, un joueur
  // qui insiste sur tout le monde vidait sa jauge de dignité en une action
  // avant même d'avoir compris ce qu'il payait.
  maxDignitySpent: 12
};

// client/src/contexts/data/weather.ts
var WEATHER_TYPES = {
  sunny: {
    type: "sunny",
    label: "Ensoleill\xE9",
    labelEn: "Sunny",
    emoji: "\u2600\uFE0F",
    description: "Une belle journ\xE9e. Profitez-en, \xE7a ne dure pas.",
    descriptionEn: "A fine day. Enjoy it, it won't last.",
    dailyPenalty: { thirst: -5 },
    actionModifier: 1.2,
    filter: "rgba(255, 200, 50, 0)",
    filterOpacity: 0
  },
  cloudy: {
    type: "cloudy",
    label: "Nuageux",
    labelEn: "Cloudy",
    emoji: "\u2601\uFE0F",
    description: "Gris et bas. La lumi\xE8re ne change pas de toute la journ\xE9e.",
    descriptionEn: "Grey and dull. Like your mood.",
    dailyPenalty: { mental: -3 },
    actionModifier: 1,
    filter: "rgba(150, 150, 170, 0.12)",
    filterOpacity: 0.12
  },
  rainy: {
    type: "rainy",
    label: "Pluie",
    labelEn: "Rain",
    emoji: "\u{1F327}\uFE0F",
    description: "La pluie s'infiltre partout. Vos affaires sont tremp\xE9es.",
    descriptionEn: "Rain seeps in everywhere. Your things are soaked.",
    dailyPenalty: { sleep: -10, health: -5, dignity: -8 },
    actionModifier: 0.7,
    filter: "rgba(60, 100, 180, 0.18)",
    filterOpacity: 0.18
  },
  storm: {
    type: "storm",
    label: "Orage",
    labelEn: "Storm",
    emoji: "\u26C8\uFE0F",
    description: "Tonnerre et \xE9clairs. Impossible de rester dehors.",
    descriptionEn: "Thunder and lightning. No staying outside.",
    dailyPenalty: { sleep: -18, health: -10, mental: -12, dignity: -10 },
    actionModifier: 0.4,
    filter: "rgba(30, 50, 120, 0.28)",
    filterOpacity: 0.28
  },
  heatwave: {
    type: "heatwave",
    label: "Canicule",
    labelEn: "Heatwave",
    emoji: "\u{1F321}\uFE0F",
    description: "La chaleur est \xE9crasante. La soif vous d\xE9vore.",
    descriptionEn: "The heat is crushing. Thirst devours you.",
    dailyPenalty: { thirst: -20, health: -8, mental: -5 },
    actionModifier: 0.8,
    filter: "rgba(220, 80, 20, 0.15)",
    filterOpacity: 0.15
  },
  fog: {
    type: "fog",
    label: "Brouillard",
    labelEn: "Fog",
    emoji: "\u{1F32B}\uFE0F",
    description: "On ne voit pas \xE0 deux m\xE8tres. Les voitures arrivent avant leur bruit.",
    descriptionEn: "You can't see two metres ahead. Dangerous.",
    dailyPenalty: { mental: -6, sleep: -5 },
    actionModifier: 0.85,
    filter: "rgba(200, 200, 210, 0.22)",
    filterOpacity: 0.22
  },
  snow: {
    type: "snow",
    label: "Neige",
    labelEn: "Snow",
    emoji: "\u2744\uFE0F",
    description: "Le froid tue les gens qui dorment dehors. Aujourd'hui, rien d'autre ne compte.",
    descriptionEn: "The cold kills people on the street. Survive.",
    dailyPenalty: { health: -15, sleep: -20, hunger: -10, dignity: -5 },
    actionModifier: 0.5,
    filter: "rgba(180, 210, 240, 0.25)",
    filterOpacity: 0.25
  }
};
var WEATHER_TRANSITIONS = {
  sunny: [{ type: "sunny", weight: 30 }, { type: "cloudy", weight: 35 }, { type: "heatwave", weight: 15 }, { type: "fog", weight: 10 }, { type: "rainy", weight: 10 }],
  cloudy: [{ type: "cloudy", weight: 20 }, { type: "sunny", weight: 25 }, { type: "rainy", weight: 30 }, { type: "fog", weight: 15 }, { type: "storm", weight: 10 }],
  rainy: [{ type: "rainy", weight: 25 }, { type: "storm", weight: 20 }, { type: "cloudy", weight: 35 }, { type: "fog", weight: 15 }, { type: "sunny", weight: 5 }],
  storm: [{ type: "rainy", weight: 40 }, { type: "cloudy", weight: 35 }, { type: "storm", weight: 15 }, { type: "fog", weight: 10 }],
  heatwave: [{ type: "heatwave", weight: 35 }, { type: "sunny", weight: 30 }, { type: "storm", weight: 20 }, { type: "cloudy", weight: 15 }],
  fog: [{ type: "fog", weight: 20 }, { type: "cloudy", weight: 35 }, { type: "rainy", weight: 25 }, { type: "sunny", weight: 20 }],
  snow: [{ type: "snow", weight: 30 }, { type: "fog", weight: 25 }, { type: "cloudy", weight: 30 }, { type: "rainy", weight: 15 }]
};
var PREMIER_JOUR_DE_NEIGE = 6;
var OUVERTURE_NEIGE = {
  cloudy: 8,
  rainy: 6,
  fog: 10
};
function getNextWeather(current2, day2 = 1) {
  const transitions = [...WEATHER_TRANSITIONS[current2]];
  const poidsNeige = OUVERTURE_NEIGE[current2];
  if (poidsNeige && day2 >= PREMIER_JOUR_DE_NEIGE) transitions.push({ type: "snow", weight: poidsNeige });
  const totalWeight = transitions.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of transitions) {
    rand -= t.weight;
    if (rand <= 0) return t.type;
  }
  return "cloudy";
}
function getInitialWeather() {
  const types = ["sunny", "sunny", "cloudy", "cloudy", "rainy", "fog"];
  return types[Math.floor(Math.random() * types.length)];
}

// client/src/contexts/data/progression.ts
var STREET_TITLES = [
  { day: 3, fr: "Le D\xE9brouillard", en: "The Resourceful", respect: 1, emoji: "\u{1F9E6}" },
  { day: 5, fr: "L'Habitu\xE9", en: "The Regular", respect: 2, emoji: "\u{1FA91}" },
  { day: 8, fr: "Le Doyen", en: "The Elder", respect: 3, emoji: "\u{1F9D3}" },
  { day: 12, fr: "Le Roi du Carton", en: "The Cardboard King", respect: 5, emoji: "\u{1F451}" }
];
var CONTRACTS = [
  {
    id: "contrat-pecule",
    emoji: "\u{1F4B6}",
    label: "Finir la journ\xE9e avec au moins 12\u20AC",
    labelEn: "End the day with at least \u20AC12",
    rewardLabel: "+2 respect",
    rewardLabelEn: "+2 respect",
    check: (c) => c.money >= 12,
    progress: (c) => ({ valeur: c.money, cible: 12 }),
    reward: { respect: 2 }
  },
  {
    id: "contrat-forme",
    emoji: "\u{1F4AA}",
    label: "Finir la journ\xE9e avec toutes les jauges au-dessus de 30",
    labelEn: "End the day with every gauge above 30",
    rewardLabel: "+6 mental",
    rewardLabelEn: "+6 mind",
    check: (c) => Object.values(c.stats).every((v) => v > 30),
    // La jauge la plus basse décide : c'est elle qui a fait rater le contrat.
    progress: (c) => ({ valeur: Math.min(...Object.values(c.stats)), cible: 31 }),
    reward: { stats: { mental: 6 } }
  },
  {
    id: "contrat-digne",
    emoji: "\u{1F451}",
    label: "Finir la journ\xE9e avec 50 de dignit\xE9 ou plus",
    labelEn: "End the day with 50+ dignity",
    rewardLabel: "+2 respect",
    rewardLabelEn: "+2 respect",
    check: (c) => c.stats.dignity >= 50,
    progress: (c) => ({ valeur: c.stats.dignity, cible: 50 }),
    reward: { respect: 2 }
  },
  {
    id: "contrat-combatif",
    emoji: "\u{1F94A}",
    label: "Gagner un combat aujourd'hui",
    labelEn: "Win a fight today",
    rewardLabel: "+4 mental, +1 respect",
    rewardLabelEn: "+4 mind, +1 respect",
    needsFlag: true,
    reward: { stats: { mental: 4 }, respect: 1 }
  },
  {
    id: "contrat-fourmi",
    emoji: "\u{1F392}",
    label: "Finir la journ\xE9e avec 5 objets ou plus dans le sac",
    labelEn: "End the day with 5+ items in your bag",
    rewardLabel: "+3\u20AC",
    rewardLabelEn: "+\u20AC3",
    check: (c) => c.inventory.length >= 5,
    progress: (c) => ({ valeur: c.inventory.length, cible: 5 }),
    reward: { money: 3 }
  }
];
function getContract(id) {
  return CONTRACTS.find((c) => c.id === id);
}
function paquetDuPremierMatin(debutant) {
  return debutant ? CONTRACTS.filter((c) => !c.needsFlag) : CONTRACTS;
}

// client/src/contexts/data/shops.ts
var SHOPS = [
  {
    id: "boulangerie",
    name: "Boulangerie du Coin",
    emoji: "\u{1F956}",
    description: "Le pain de la veille, mais \xE0 prix cass\xE9.",
    locations: ["centre-ville", "marche", "gare"],
    items: [
      { id: "pain-rassis", name: "Pain rassis", emoji: "\u{1F956}", price: 1, description: "Dur comme la vie, mais nourrissant.", category: "food", effect: { hunger: 15 } },
      { id: "croissant", name: "Croissant du matin", emoji: "\u{1F950}", price: 2, description: "Encore ti\xE8de. Un luxe.", category: "food", effect: { hunger: 20, mental: 5 } },
      { id: "sandwich-jambon", name: "Sandwich jambon-beurre", emoji: "\u{1F96A}", price: 3, description: "Le classique ind\xE9modable.", category: "food", effect: { hunger: 30, mental: 3 } },
      { id: "gateau-sec", name: "G\xE2teau sec", emoji: "\u{1F36A}", price: 1, description: "Croquant et r\xE9confortant.", category: "food", effect: { hunger: 10, mental: 5 } }
    ]
  },
  {
    id: "epicerie",
    name: "\xC9picerie de Nuit",
    emoji: "\u{1F3EA}",
    description: "Ouverte 24h/24, avec la majoration de nuit affich\xE9e nulle part.",
    locations: ["centre-ville", "gare"],
    items: [
      { id: "bouteille-eau", name: "Bouteille d'eau", emoji: "\u{1F4A7}", price: 1, description: "De l'eau. Juste de l'eau. C'est d\xE9j\xE0 bien.", category: "drink", effect: { thirst: 25 } },
      { id: "canette-soda", name: "Canette de soda", emoji: "\u{1F964}", price: 2, description: "Sucr\xE9, p\xE9tillant, et plein de bulles.", category: "drink", effect: { thirst: 20, hunger: 5, mental: 3 } },
      { id: "conserve-ravioli", name: "Conserve de raviolis", emoji: "\u{1F96B}", price: 3, description: "Le repas du roi (du carton).", category: "food", effect: { hunger: 35 } },
      { id: "biere", name: "Bi\xE8re pas ch\xE8re", emoji: "\u{1F37A}", price: 2, description: "R\xE9chauffe le corps, embrume l'esprit.", category: "drink", effect: { thirst: 15, mental: 8, health: -3 } },
      { id: "briquet", name: "Briquet", emoji: "\u{1F525}", price: 2, description: "Indispensable pour les nuits froides.", category: "tool", giveItem: { id: "briquet", name: "Briquet", emoji: "\u{1F525}", type: "tool", value: 4 } },
      { id: "parapluie-casse", name: "Parapluie cass\xE9", emoji: "\u2602\uFE0F", price: 1, description: "Ne prot\xE8ge que la moiti\xE9. Mais quelle moiti\xE9 !", category: "tool", giveItem: { id: "parapluie-casse", name: "Parapluie cass\xE9", emoji: "\u2602\uFE0F", type: "tool", value: 2 } }
    ]
  },
  {
    id: "pharmacie",
    name: "Pharmacie Populaire",
    emoji: "\u{1F48A}",
    description: "Soins basiques \xE0 prix r\xE9duit.",
    locations: ["centre-ville"],
    items: [
      { id: "pansement", name: "Bo\xEEte de pansements", emoji: "\u{1FA79}", price: 3, description: "Pour les petits bobos du quotidien.", category: "medicine", effect: { health: 15 } },
      { id: "aspirine", name: "Aspirine", emoji: "\u{1F48A}", price: 2, description: "Contre les maux de t\xEAte et les coups.", category: "medicine", effect: { health: 10, mental: 5 } },
      { id: "sirop-toux", name: "Sirop pour la toux", emoji: "\u{1F36F}", price: 4, description: "Go\xFBt horrible, efficacit\xE9 prouv\xE9e.", category: "medicine", effect: { health: 20 } },
      { id: "creme-solaire", name: "Cr\xE8me solaire p\xE9rim\xE9e", emoji: "\u{1F9F4}", price: 1, description: "P\xE9rim\xE9e depuis 2019, mais \xE7a prot\xE8ge un peu.", category: "medicine", effect: { health: 5, dignity: 3 } }
    ]
  },
  {
    id: "marche-aux-puces",
    name: "March\xE9 aux Puces",
    emoji: "\u{1F9E5}",
    description: "V\xEAtements et objets de seconde main.",
    locations: ["marche", "zone-industrielle"],
    items: [
      { id: "manteau-occasion", name: "Manteau d'occasion", emoji: "\u{1F9E5}", price: 5, description: "Chaud et presque propre.", category: "clothing", effect: { health: 5, dignity: 10, sleep: 5 }, giveItem: { id: "manteau-occasion", name: "Manteau d'occasion", emoji: "\u{1F9E5}", type: "armor", value: 8, defenseBonus: 2 } },
      { id: "chaussures-usees", name: "Chaussures us\xE9es", emoji: "\u{1F45F}", price: 3, description: "Trou\xE9es mais fonctionnelles.", category: "clothing", effect: { dignity: 5, health: 3 } },
      { id: "bonnet-laine", name: "Bonnet en laine", emoji: "\u{1F9E2}", price: 2, description: "Tricot\xE9 main, dans une couleur que personne n'a choisie expr\xE8s.", category: "clothing", effect: { dignity: 3, mental: 3, sleep: 3 } },
      { id: "sac-dos-troue", name: "Sac \xE0 dos trou\xE9", emoji: "\u{1F392}", price: 4, description: "Quatre places de plus dans le sac. Les trous, on fait avec.", category: "tool", giveItem: { id: "sac-dos-troue", name: "Sac \xE0 dos trou\xE9", emoji: "\u{1F392}", type: "tool", value: 6 } }
    ]
  },
  {
    id: "brocanteur",
    name: "Le Brocanteur Louche",
    emoji: "\u{1F5E1}\uFE0F",
    description: "Il vend de tout. Surtout du n'importe quoi.",
    locations: ["zone-industrielle", "gare"],
    items: [
      { id: "batte-baseball", name: "Batte de baseball fissur\xE9e", emoji: "\u{1F3CF}", price: 6, description: "Arme lourde : m\xEAme un coup mal ajust\xE9 fait mal. Elle a connu des cr\xE2nes.", category: "weapon", giveItem: { id: "batte-baseball", name: "Batte de baseball fissur\xE9e", emoji: "\u{1F3CF}", type: "weapon", value: 10, attackBonus: 6, combatStyle: "heavy" } },
      { id: "couteau-rouille", name: "Couteau rouill\xE9", emoji: "\u{1F52A}", price: 4, description: "Arme pr\xE9cise : critiques d\xE9vastateurs, mais il faut viser juste. T\xE9tanos en bonus.", category: "weapon", giveItem: { id: "couteau-rouille", name: "Couteau rouill\xE9", emoji: "\u{1F52A}", type: "weapon", value: 7, attackBonus: 5, combatStyle: "precise" } },
      { id: "gilet-protection", name: "Gilet de protection", emoji: "\u{1F9BA}", price: 8, description: "Ancien gilet de chantier. Absorbe les coups.", category: "clothing", giveItem: { id: "gilet-protection", name: "Gilet de protection", emoji: "\u{1F9BA}", type: "armor", value: 12, defenseBonus: 5 } },
      { id: "lampe-torche", name: "Lampe torche", emoji: "\u{1F526}", price: 3, description: "Les piles sont presque mortes.", category: "tool", giveItem: { id: "lampe-torche", name: "Lampe torche", emoji: "\u{1F526}", type: "tool", value: 5 } }
    ]
  },
  {
    id: "fontaine",
    name: "Fontaine Publique",
    emoji: "\u26F2",
    description: "Gratuite. Enfin presque.",
    locations: ["parc"],
    items: [
      { id: "eau-fontaine", name: "Eau de la fontaine", emoji: "\u{1F4A6}", price: 0, description: "Gratuite et fra\xEEche. Un miracle urbain.", category: "drink", effect: { thirst: 15 } }
    ]
  },
  {
    id: "distributeur",
    name: "Distributeur Automatique",
    emoji: "\u{1F916}",
    description: "Accepte les pi\xE8ces. Parfois.",
    locations: ["gare", "centre-ville"],
    items: [
      { id: "cafe-machine", name: "Caf\xE9 de la machine", emoji: "\u2615", price: 1, description: "Imbuvable mais \xE7a r\xE9veille.", category: "drink", effect: { thirst: 10, sleep: -10, mental: 5 } },
      { id: "barre-chocolat", name: "Barre chocolat\xE9e", emoji: "\u{1F36B}", price: 2, description: "Calories et r\xE9confort en barre.", category: "food", effect: { hunger: 15, mental: 8 } },
      { id: "chips", name: "Paquet de chips", emoji: "\u{1F954}", price: 1, description: "Sal\xE9, croustillant, addictif.", category: "food", effect: { hunger: 10, thirst: -5 } }
    ]
  },
  {
    id: "kebab",
    name: "Kebab du Quartier",
    emoji: "\u{1F959}",
    description: "Le meilleur rapport qualit\xE9-prix de la ville.",
    locations: ["centre-ville", "gare", "zone-industrielle"],
    items: [
      { id: "kebab-frites", name: "Kebab-frites", emoji: "\u{1F959}", price: 5, description: "Le festin des rois. Du carton.", category: "food", effect: { hunger: 45, mental: 10, dignity: 3 } },
      { id: "frites-seules", name: "Cornet de frites", emoji: "\u{1F35F}", price: 2, description: "Grasses \xE0 souhait. D\xE9licieuses.", category: "food", effect: { hunger: 20, mental: 5 } },
      { id: "boisson-kebab", name: "Boisson fra\xEEche", emoji: "\u{1F964}", price: 1, description: "Pour faire passer le kebab.", category: "drink", effect: { thirst: 25 } }
    ]
  },
  {
    id: "laverie",
    name: "Laverie Automatique",
    emoji: "\u{1F9FA}",
    description: "Lavez vos v\xEAtements. Trente minutes, et vous ne sentez plus la rue.",
    locations: ["centre-ville", "gare"],
    items: [
      { id: "lavage-vetements", name: "Lavage de v\xEAtements", emoji: "\u{1F455}", price: 3, description: "Propre pendant au moins 2 jours.", category: "special", effect: { dignity: 20, mental: 5 } }
    ]
  },
  {
    id: "herboriste",
    name: "Herboriste du Parc",
    emoji: "\u{1F33F}",
    description: "Rem\xE8des naturels et tisanes.",
    locations: ["parc", "marche"],
    items: [
      { id: "tisane-calmante", name: "Tisane calmante", emoji: "\u{1F375}", price: 2, description: "Apaise les nerfs et r\xE9chauffe le c\u0153ur.", category: "drink", effect: { mental: 15, thirst: 10, sleep: 5 } },
      { id: "onguent-plantes", name: "Onguent de plantes", emoji: "\u{1F331}", price: 3, description: "\xC7a pique, \xE7a gratte, mais \xE7a soigne.", category: "medicine", effect: { health: 12 } },
      { id: "bouquet-fleurs", name: "Bouquet de fleurs sauvages", emoji: "\u{1F490}", price: 1, description: "Pour le moral. Ou pour revendre.", category: "special", effect: { mental: 10, dignity: 5 } }
    ]
  }
];
var CLOSURE_REASONS_BY_SHOP = {
  laverie: [
    ["une machine a aval\xE9 un pigeon entier, les pompiers sont sur place.", "a machine swallowed a whole pigeon, firefighters are on site."],
    ["le s\xE8che-linge tourne \xE0 l'envers depuis mardi. Personne ne sait pourquoi.", "the dryer has been spinning backwards since Tuesday. Nobody knows why."]
  ],
  fontaine: [
    ["un canard a \xE9lu domicile dans la tuyauterie. Elle est \xE0 sec.", "a duck moved into the plumbing. It ran dry."]
  ],
  distributeur: [
    ["il ne rend plus que des pi\xE8ces de Monopoly. Hors service.", "it only dispenses Monopoly coins now. Out of order."]
  ],
  boulangerie: [
    ["le four a rendu l'\xE2me en pleine fourn\xE9e. Deuil national du croissant.", "the oven died mid-batch. National croissant mourning."]
  ],
  kebab: [
    ["rupture de broche. Le patron est parti \xAB chercher de la viande \xBB. On l'attend.", 'out of skewer. The owner went to "get more meat". Still waiting.']
  ],
  pharmacie: [
    ["inventaire surprise : la pharmacienne compte les cotons-tiges un par un.", "surprise inventory: the pharmacist is counting cotton swabs one by one."]
  ],
  epicerie: [
    ["le g\xE9rant s'est enferm\xE9 dehors. Encore.", "the owner locked himself out. Again."]
  ],
  brocanteur: [
    ["le brocanteur a \xAB des ennuis \xBB. Rideau baiss\xE9, pas de questions.", 'the dealer has "trouble". Shutters down, no questions.']
  ],
  "marche-aux-puces": [
    ["grand vent : les \xE9tals se sont envol\xE9s vers le quartier d'\xE0 c\xF4t\xE9.", "windy day: the stalls blew off to the next neighborhood."]
  ],
  herboriste: [
    ["l'herboriste m\xE9dite. Ne pas d\xE9ranger avant l'illumination.", "the herbalist is meditating. Do not disturb before enlightenment."]
  ]
};
var CLOSURE_REASONS_GENERIC = [
  ["ferm\xE9 pour \xAB raisons personnelles \xBB. Personne ne sait lesquelles.", 'closed for "personal reasons". Nobody knows which.'],
  ["gr\xE8ve surprise. M\xEAme le patron fait gr\xE8ve.", "surprise strike. Even the owner is on strike."],
  ["un contr\xF4le sanitaire a mal tourn\xE9. Fermeture imm\xE9diate.", "a health inspection went sideways. Immediate closure."],
  ["panne de courant dans tout le p\xE2t\xE9 de maisons.", "power outage across the whole block."],
  ["le g\xE9rant a gagn\xE9 au Loto (petit lot) et f\xEAte \xE7a bruyamment.", "the owner won the lottery (small prize) and is loudly celebrating."]
];
function rollShopClosure(active, day2) {
  const open = SHOPS.filter((s) => !active.some((c) => c.shopId === s.id));
  if (open.length === 0) return null;
  const shop = randomFromArray(open);
  const specific = CLOSURE_REASONS_BY_SHOP[shop.id];
  const [reason, reasonEn] = specific && Math.random() < 0.7 ? randomFromArray(specific) : randomFromArray(CLOSURE_REASONS_GENERIC);
  const duration = 1 + Math.floor(Math.random() * 2);
  return { shopId: shop.id, untilDay: day2 + duration, reason, reasonEn };
}
function getSellPrice(item) {
  return Math.max(1, Math.round((item.value || 1) * 0.6));
}
var SOLIDARITY_FLAG = (day2) => `solidarite-${day2}`;
var SOLIDARITY_GIFT = [
  { id: "don-soupe", name: "Soupe populaire", emoji: "\u{1F963}", type: "food", value: 1, effect: { hunger: 25, health: 5 } },
  { id: "don-pain", name: "Pain solidaire", emoji: "\u{1F35E}", type: "food", value: 1, effect: { hunger: 18 } },
  { id: "don-eau", name: "Bouteille d'eau", emoji: "\u{1F4A7}", type: "food", value: 1, effect: { thirst: 22 } }
];

// client/src/contexts/data/haggle.ts
var SHOPKEEPERS = [
  {
    shopId: "boulangerie",
    role: "La boulang\xE8re",
    floor: 0.62,
    patience: 112,
    insistCost: 18,
    insistBite: 0.17,
    soft: ["meteo", "service"],
    hard: ["reputation"],
    grumble: ["\xAB Bon\u2026 allez. Mais c'est bien parce que c'est vous. \xBB", "\xAB Vous savez que je vends \xE0 perte, l\xE0 ? \xBB", "\xAB Ma marge, elle est o\xF9, dans cette histoire ? \xBB"],
    tell: "\xAB L\xE0 je ne peux plus. La farine, elle ne se donne pas non plus. \xBB",
    snap: "\xAB \xC9coutez, revenez demain. L\xE0, j'ai du monde. \xBB",
    deal: "\xAB Tenez. Et mangez-le, ne le revendez pas. \xBB",
    closure: [
      "vous avez tellement discut\xE9 le prix d'un sandwich que la boulang\xE8re a mis la pancarte \xAB FERM\xC9 \xBB en vous regardant dans les yeux.",
      "you haggled so hard over a sandwich that the baker flipped the CLOSED sign while looking you in the eye."
    ]
  },
  {
    shopId: "epicerie",
    role: "L'\xE9picier de nuit",
    floor: 0.7,
    patience: 88,
    insistCost: 20,
    insistBite: 0.15,
    soft: ["objet"],
    hard: ["fierte"],
    grumble: ["\xAB C'est ouvert la nuit, \xE7a se paie, la nuit. \xBB", "\xAB Vous avez vu l'heure ? Moi non plus. \xBB", "\xAB Un euro. Un. Et on n'en parle plus. \xBB"],
    tell: "\xAB Non. \xC0 ce prix-l\xE0 j'\xE9teins et je rentre chez moi. \xBB",
    snap: "\xAB Bon. La caisse est ferm\xE9e pour vous aujourd'hui. \xBB",
    deal: "\xAB March\xE9 conclu. Et refermez la porte en sortant. \xBB",
    closure: [
      "vous avez marchand\xE9 jusqu'\xE0 ce que l'\xE9picier \xE9teigne l'enseigne. Il a dit que \xE7a lui co\xFBtait moins cher que de vous \xE9couter.",
      "you haggled until the grocer killed the neon sign. He said it was cheaper than listening to you."
    ]
  },
  {
    shopId: "pharmacie",
    role: "Le pharmacien",
    floor: 0.58,
    patience: 132,
    insistCost: 15,
    insistBite: 0.16,
    soft: ["fierte", "meteo"],
    hard: ["objet"],
    grumble: ["\xAB La sant\xE9 n'a pas de prix, mais elle a un co\xFBt. \xBB", "\xAB Je peux faire un geste. Un petit. \xBB", "\xAB Vous toussez depuis tout \xE0 l'heure, d'ailleurs. \xBB"],
    tell: "\xAB En dessous, c'est moi qui rembourse la S\xE9cu. \xBB",
    snap: "\xAB Je pr\xE9f\xE8re qu'on en reste l\xE0. Prenez soin de vous. \xBB",
    deal: "\xAB Voil\xE0. Et buvez de l'eau avec, hein. \xBB",
    closure: [
      "le pharmacien a fini par vous tendre un verre d'eau et vous montrer la porte. Il para\xEEt que vous parliez tr\xE8s fort du prix du sirop.",
      "the pharmacist ended up handing you a glass of water and pointing at the door. Apparently you were quite loud about the price of cough syrup."
    ]
  },
  {
    shopId: "marche-aux-puces",
    role: "La brocanteuse de l'\xE9tal",
    floor: 0.5,
    patience: 104,
    insistCost: 16,
    insistBite: 0.19,
    soft: ["objet", "reputation"],
    hard: [],
    grumble: ["\xAB Vous marchandez ? Enfin quelqu'un de s\xE9rieux. \xBB", "\xAB Allez, je descends. Mais vous \xEAtes dur. \xBB", "\xAB \xC7a vaut trois fois \xE7a et vous le savez. \xBB"],
    tell: "\xAB L\xE0 non. En dessous je perds de l'argent \xE0 vous le vendre. \xBB",
    snap: "\xAB Circulez. J'ai d'autres clients, moi. \xBB",
    deal: "\xAB Adjug\xE9. Vous m'aurez bien eue. \xBB",
    closure: [
      "la brocanteuse a repli\xE9 son \xE9tal plut\xF4t que de vous entendre proposer un prix de plus. Les autres vendeurs ont applaudi.",
      "the stallholder packed up rather than hear you name one more price. The other sellers applauded."
    ]
  },
  {
    shopId: "brocanteur",
    role: "Le brocanteur louche",
    floor: 0.45,
    patience: 70,
    insistCost: 24,
    insistBite: 0.2,
    soft: ["objet"],
    hard: ["reputation", "meteo"],
    grumble: ["\xAB H\xE9. On se calme. \xBB", "\xAB T'as de la chance que je t'aime bien. \xBB", "\xAB Encore un mot et je remonte. \xBB"],
    tell: "\xAB Non. Celui-l\xE0, c'est ce prix ou rien. Pas de question. \xBB",
    snap: "\xAB Dehors. Et t'as rien vu ici. \xBB",
    deal: "\xAB Prends et disparais. On s'est jamais parl\xE9. \xBB",
    closure: [
      "le brocanteur a baiss\xE9 le rideau au milieu de votre phrase. On ne marchande pas deux fois avec lui le m\xEAme jour.",
      "the dealer rolled the shutters down mid-sentence. You don't haggle with him twice in one day."
    ]
  },
  {
    shopId: "kebab",
    role: "Le kebabier",
    floor: 0.6,
    patience: 122,
    insistCost: 14,
    insistBite: 0.18,
    soft: ["service", "reputation"],
    hard: [],
    grumble: ["\xAB Ouais, ouais, ouais. Je t'ajoute des frites, \xE7a va ? \xBB", "\xAB Toi tu reviens souvent, c'est pour \xE7a. \xBB", "\xAB Bon. Mais tu dis \xE0 personne. \xBB"],
    tell: "\xAB L\xE0 c'est la viande qui co\xFBte, mon fr\xE8re. Je peux rien. \xBB",
    snap: "\xAB Va manger ailleurs aujourd'hui. Sans rancune. \xBB",
    deal: "\xAB Tiens. Et mets de la sauce, \xE7a fait pas de mal. \xBB",
    closure: [
      "vous avez n\xE9goci\xE9 le kebab si longtemps que la broche a refroidi. Le patron vous a gentiment mis dehors.",
      "you haggled over the kebab so long the skewer went cold. The owner politely showed you out."
    ]
  },
  {
    shopId: "laverie",
    role: "La g\xE9rante de la laverie",
    floor: 0.66,
    patience: 108,
    insistCost: 17,
    insistBite: 0.16,
    soft: ["fierte", "service"],
    hard: [],
    grumble: ["\xAB La machine, elle consomme pareil pour tout le monde. \xBB", "\xAB Allez, je vous mets le programme court. \xBB", "\xAB Vous me faites de la peine, mais quand m\xEAme. \xBB"],
    tell: "\xAB En dessous, c'est l'\xE9lectricit\xE9 que je paie de ma poche. \xBB",
    snap: "\xAB Revenez demain, l\xE0 je ferme les machines. \xBB",
    deal: "\xAB Allez-y. Et prenez le tambour du fond, il chauffe mieux. \xBB",
    closure: [
      "la g\xE9rante a coup\xE9 les machines. Elle dit qu'un lavage se paie, et qu'elle n'a pas que \xE7a \xE0 faire.",
      "the manager shut the machines off. She says a wash costs what it costs, and she has other things to do."
    ]
  },
  {
    shopId: "herboriste",
    role: "L'herboriste",
    floor: 0.56,
    patience: 144,
    insistCost: 12,
    insistBite: 0.14,
    soft: ["meteo", "fierte", "pigeon"],
    hard: ["objet"],
    grumble: ["\xAB L'argent circule, comme la s\xE8ve. \xBB", "\xAB Je sens que vous en avez besoin. \xBB", "\xAB Prenons le temps. Rien ne presse. \xBB"],
    tell: "\xAB Non. La plante a mis six mois \xE0 pousser, elle vaut \xE7a. \xBB",
    snap: "\xAB Je crois qu'il vaut mieux se quitter l\xE0. Respirez. \xBB",
    deal: "\xAB Emportez-la. Elle vous attendait, je crois. \xBB",
    closure: [
      "l'herboriste a ferm\xE9 les yeux, respir\xE9 tr\xE8s lentement, puis ferm\xE9 la boutique. Votre marchandage avait \xAB troubl\xE9 l'\xE9quilibre \xBB.",
      "the herbalist closed her eyes, breathed very slowly, then closed the shop. Your haggling had 'disturbed the balance'."
    ]
  }
];
function shopkeeperFor(shopId) {
  return SHOPKEEPERS.find((s) => s.shopId === shopId) || null;
}
var HAGGLED_FLAG = (shopId, day2) => `haggle-${shopId}-${day2}`;
var HAGGLE_TUNING = {
  /** Prix minimal absolu : on ne descend jamais en dessous. */
  minPrice: 1,
  /** Ce qu'un argument coûte de patience, avant multiplicateur. */
  argCost: 20,
  /** Rampe : ce qu'il a déjà lâché renchérit la suite (voir costMultiplier). */
  ramp: 1.6,
  /** Vitesse d'extinction de l'insistance. */
  insistDecay: 1.5,
  /** Gain en dessous duquel « il ne bouge plus ». */
  deadGain: 0.012,
  /** Échelle fixe de la barre de remise à l'écran. Volontairement décorrélée
   *  du plancher du commerçant : la barre montre ce qu'on a arraché, pas ce
   *  qu'il reste à arracher. Rien ne doit souffler au joueur « encore un
   *  effort, il va lâcher ». */
  barScale: 0.5,
  /** Bonus quand l'argument touche la corde sensible du commerçant. */
  softBoost: 1.3,
  /** Dignité dépensée par « Ravaler sa fierté ». */
  fierteCost: 6,
  /** Sommeil dépensé par « Proposer un service ». */
  serviceCost: 8,
  /** Respect en dessous duquel l'argument « réputation » se retourne. */
  reputationNeeded: 25,
  /** Météos où l'argument « le temps qu'il fait » porte. */
  wetWeather: ["rainy", "storm", "snow", "fog"],
  /** Valeur minimale d'un objet du sac pour qu'il fasse un troc crédible. */
  tradeMinValue: 3,
  /** Ce qu'on gagne en respect quand on décroche une vraie affaire. */
  respectOnGoodDeal: 1,
  /** Remise à partir de laquelle l'affaire compte comme « vraie ». */
  goodDealCut: 0.3,
  /** En dessous de ce prix, il n'y a rien à négocier et on le dit. On ne
   *  marchande pas un pain rassis à 1 €. */
  minToHaggle: 3,
  /** Patience coûtée par une insistance qui ne fait plus rien bouger : il
   *  hausse les épaules, ça n'use pas autant que d'être poussé. */
  deadInsistMul: 0.45
};

// client/src/lib/daily.ts
var PENDING_KEY = "roi-du-carton-carton-attente";
function takePendingGifts() {
  try {
    const l = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    if (l.length) localStorage.removeItem(PENDING_KEY);
    return l;
  } catch {
    return [];
  }
}

// client/src/lib/coach.ts
function isFirstEverRun(scoreCount, graveCount) {
  return scoreCount === 0 && graveCount === 0;
}

// client/src/lib/commande.ts
var KEY = "roi-du-carton-commande";
var COMMANDES = [
  {
    id: "cuivre",
    emoji: "\u{1F50C}",
    metric: "bricoles",
    target: 25,
    karma: 60,
    fr: "Le brocanteur cherche de la ferraille : rapportez 25 bricoles.",
    en: "The junk dealer wants scrap: bring back 25 parts."
  },
  {
    id: "caisse",
    emoji: "\u{1F4B6}",
    metric: "euros",
    target: 60,
    karma: 60,
    fr: "Faire 60 \u20AC cette semaine, tous personnages confondus.",
    en: "Make \u20AC60 this week, across all characters."
  },
  {
    id: "endurance",
    emoji: "\u{1F5D3}\uFE0F",
    metric: "jours",
    target: 20,
    karma: 70,
    fr: "Tenir 20 jours au total, quel que soit celui qui tombe.",
    en: "Survive 20 days in total, whoever falls."
  },
  {
    id: "castagne",
    emoji: "\u{1F94A}",
    metric: "coups",
    target: 40,
    karma: 60,
    fr: "Placer 40 coups au cours de la semaine.",
    en: "Land 40 blows over the week."
  },
  {
    id: "fouineur",
    emoji: "\u267B\uFE0F",
    metric: "fouilles",
    target: 12,
    karma: 55,
    fr: "Descendre 12 fois dans un container.",
    en: "Go down into a bin 12 times."
  },
  {
    id: "culot",
    emoji: "\u{1F91D}",
    metric: "marchandages",
    target: 10,
    karma: 55,
    fr: "Emporter 10 marchandages.",
    en: "Win 10 haggles."
  }
];
function mondayOf(d = /* @__PURE__ */ new Date()) {
  const x = new Date(d);
  x.setDate(x.getDate() - (x.getDay() + 6) % 7);
  const p = (n) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
}
function pickFor(week) {
  let h = 0;
  for (let i = 0; i < week.length; i++) h = h * 31 + week.charCodeAt(i) >>> 0;
  return COMMANDES[h % COMMANDES.length];
}
function loadCommande(now = /* @__PURE__ */ new Date()) {
  const week = mondayOf(now);
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.week === week) return raw;
  } catch {
  }
  const frais = { id: pickFor(week).id, week, count: 0, claimed: false };
  try {
    localStorage.setItem(KEY, JSON.stringify(frais));
  } catch {
  }
  return frais;
}
function commandeDef(s) {
  return COMMANDES.find((c) => c.id === s.id) ?? COMMANDES[0];
}
function progress(metric, amount = 1, now = /* @__PURE__ */ new Date()) {
  if (amount <= 0) return;
  const s = loadCommande(now);
  const def = commandeDef(s);
  if (def.metric !== metric || s.claimed) return;
  const next = { ...s, count: Math.min(def.target, s.count + amount) };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
  }
}

// client/src/contexts/data/dignity.ts
var DIGNITY_TIERS = [
  { min: 75, fr: "Encore pr\xE9sentable", en: "Still presentable", color: "#D9B34A" },
  { min: 50, fr: "\xC7a commence \xE0 se voir", en: "It's starting to show", color: "#C4913A" },
  { min: 25, fr: "On change de trottoir", en: "People cross the street", color: "#B8703A" },
  { min: 0, fr: "Transparent", en: "Invisible", color: "#8B5A4A" }
];

// client/src/contexts/data/events2-explore.ts
var EXPLORE_EVENTS_2 = [
  {
    id: "exp-piscine-municipale",
    title: "La Piscine Municipale",
    type: "discovery",
    image: "/assets/exp-piscine-municipale.webp",
    description: "Le vestiaire de la piscine est mal surveill\xE9. Des douches chaudes \xE0 volont\xE9, pour qui marche d'un pas assur\xE9.",
    choices: [
      { text: "Entrer comme si de rien n'\xE9tait", risk: "normal", emoji: "\u{1F6BF}", outcomes: [
        { probability: 0.6, text: "Vingt minutes d'eau chaude. Vous ressortez rose, propre, et philosophiquement r\xE9concili\xE9 avec l'humanit\xE9.", statChanges: { dignity: 15, mental: 10, health: 5 } },
        { probability: 0.4, text: "Le ma\xEEtre-nageur vous rep\xE8re \xE0 votre absence de bonnet. Expuls\xE9, mais il vous laisse la serviette par piti\xE9.", statChanges: { dignity: -5, mental: -3 }, itemGain: { id: "serviette-piscine", name: "Serviette municipale", emoji: "\u{1F9FB}", type: "junk", value: 3 } }
      ] },
      { text: "Repartir, l'eau c'est surfait", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Vous passez votre chemin. Votre odeur aussi. Vous formez une belle \xE9quipe.", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "exp-canard-geant",
    title: "Le Canard G\xE9ant",
    type: "discovery",
    image: "/assets/exp-canard-geant.webp",
    description: "Un canard gonflable g\xE9ant, \xE9chapp\xE9 d'un festival, d\xE9rive majestueusement sur le canal. Les passants filment. Personne n'agit.",
    choices: [
      { text: "Le r\xE9cup\xE9rer \xE0 la perche", risk: "risky", emoji: "\u{1FA9D}", outcomes: [
        { probability: 0.5, text: "Capture h\xE9ro\xEFque sous les applaudissements. Le brocanteur vous le rach\xE8te sans poser de questions. Il ne pose jamais de questions.", moneyChange: 8, respectChange: 2, statChanges: { dignity: -5 } },
        { probability: 0.3, text: "La perche plie, vous plongez. Le canard vous regarde couler avec son sourire de canard.", statChanges: { health: -8, mental: -4, dignity: -6 } },
        { probability: 0.2, text: "Le canard cr\xE8ve sur un tesson. La foule vous hue comme si vous aviez tu\xE9 un vrai canard.", statChanges: { mental: -6, dignity: -4 } }
      ] },
      { text: "Le regarder passer, majestueux", risk: "safe", emoji: "\u{1F986}", outcomes: [
        { probability: 1, text: "Il glisse vers l'\xE9cluse, immense et serein. Il y a encore de la beaut\xE9 dans ce monde. Elle est en PVC.", statChanges: { mental: 8 } }
      ] }
    ]
  },
  {
    id: "exp-vide-grenier",
    title: "Le Vide-Grenier",
    type: "social",
    image: "/assets/exp-vide-grenier.webp",
    description: "Un vide-grenier s'installe sur la place. En fin de journ\xE9e, les invendus finissent souvent sur le trottoir. Vous connaissez le trottoir.",
    choices: [
      { text: "Aider \xE0 remballer les stands", risk: "safe", emoji: "\u{1F4AA}", outcomes: [
        { probability: 0.7, text: "Trois heures de cartons. On vous paie en pi\xE8ces, en quiche froide et en bibelots. L'\xE9conomie r\xE9elle.", moneyChange: 4, statChanges: { hunger: 10 }, itemGain: { id: "bibelot-chat", name: "Chat en porcelaine (\xE9br\xE9ch\xE9)", emoji: "\u{1F431}", type: "junk", value: 4 } },
        { probability: 0.3, text: "Beaucoup de merci, z\xE9ro pi\xE8ce. La gratitude ne se mange pas, mais elle tient chaud. Un peu.", statChanges: { mental: 4 }, respectChange: 1 }
      ] },
      { text: "Attendre les invendus du soir", risk: "normal", emoji: "\u23F3", outcomes: [
        { probability: 0.6, text: "Un carton entier abandonn\xE9 : vaisselle, lampe, roman de gare. No\xEBl en avance, version poussi\xE8re.", statChanges: { mental: 6 }, itemGain: { id: "lampe-chevet", name: "Lampe de chevet orpheline", emoji: "\u{1F6CB}\uFE0F", type: "junk", value: 5 } },
        { probability: 0.4, text: "Un autre connaisseur est pass\xE9 avant vous. Il a m\xEAme pris les cintres, et repli\xE9 le carton derri\xE8re lui.", statChanges: { mental: -4 } }
      ] }
    ]
  },
  {
    id: "exp-caddies",
    title: "Les Caddies Perdus",
    type: "discovery",
    image: "/assets/exp-caddies.webp",
    description: "Le parking du supermarch\xE9 est constell\xE9 de caddies abandonn\xE9s. Chacun est lest\xE9 d'une pi\xE8ce d'un euro. C'est presque un verger.",
    choices: [
      { text: "Les ramener un par un", risk: "safe", emoji: "\u{1F6D2}", outcomes: [
        { probability: 0.8, text: "Cinq caddies, cinq pi\xE8ces. Les clients vous regardent comme un service municipal. Vous \xEAtes un service municipal.", moneyChange: 5, statChanges: { dignity: -3 } },
        { probability: 0.2, text: "Le vigile trouve \xE7a louche, v\xE9rifie, puis vous laisse finir. Il vous doit trois caddies, il le sait.", moneyChange: 3, respectChange: 1 }
      ] },
      { text: "Construire un train de caddies", risk: "risky", emoji: "\u{1F682}", outcomes: [
        { probability: 0.5, text: "Huit caddies embo\xEEt\xE9s, une seule pouss\xE9e magistrale. Le rendement industriel appliqu\xE9 \xE0 la mis\xE8re.", moneyChange: 8, statChanges: { mental: 5 } },
        { probability: 0.5, text: "Le train d\xE9raille dans une Clio. Vous fuyez en abandonnant le convoi. Perte s\xE8che, alarme en prime.", statChanges: { mental: -5, health: -3 }, respectChange: -2 }
      ] }
    ]
  },
  {
    id: "exp-photomaton",
    title: "Le Photomaton",
    type: "narrative",
    image: "/assets/exp-photomaton.webp",
    description: "Un photomaton clignote dans la galerie. Une pi\xE8ce est coinc\xE9e dans la fente, et des photos oubli\xE9es pendent du bac.",
    choices: [
      { text: "R\xE9cup\xE9rer pi\xE8ce et photos", risk: "normal", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.6, text: "Une pi\xE8ce, et quatre portraits d'une inconnue qui rate son sourire quatre fois. Vous la comprenez tellement.", moneyChange: 1, statChanges: { mental: 4 } },
        { probability: 0.4, text: "La machine flashe toute seule : quatre portraits de vous, pas ras\xE9, surpris. \xC9trangement, vous \xEAtes photog\xE9nique.", statChanges: { mental: 6, dignity: 3 }, itemGain: { id: "photos-identite", name: "Photos d'identit\xE9 (les v\xF4tres)", emoji: "\u{1F4F7}", type: "junk", value: 2 } }
      ] },
      { text: "Passer son chemin, les machines vous jugent", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Le photomaton clignote dans votre dos comme un regret. Vous ne vous retournez pas.", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "exp-livreur-perdu",
    title: "Le Livreur Perdu",
    type: "social",
    image: "/assets/exp-livreur-perdu.webp",
    description: "Un livreur \xE0 v\xE9lo tourne en rond depuis vingt minutes. Sa sacoche fume doucement. Le GPS a gagn\xE9, lui a perdu.",
    choices: [
      { text: "Le guider dans le quartier", risk: "safe", emoji: "\u{1F9ED}", outcomes: [
        { probability: 0.7, text: "Trop tard, commande annul\xE9e. Il vous tend la pizza ti\xE8de : \xAB c'est toi le client maintenant \xBB, et remonte sur son scooter.", statChanges: { hunger: 22, mental: 6 } },
        { probability: 0.3, text: "Il arrive \xE0 temps gr\xE2ce \xE0 vous et revient partager son pourboire. Un homme d'honneur, \xE0 v\xE9lo.", moneyChange: 3, respectChange: 1, statChanges: { mental: 4 } }
      ] },
      { text: "Racheter la commande en retard", risk: "normal", emoji: "\u{1F4B6}", outcomes: [
        { probability: 0.5, text: "Deux euros pour un menu complet \xE0 peine froid. La meilleure affaire du trimestre.", moneyChange: -2, statChanges: { hunger: 28, thirst: 8, mental: 5 } },
        { probability: 0.5, text: "\xAB Je peux pas, c'est tra\xE7\xE9. \xBB Trac\xE9. M\xEAme les kebabs ont un flicage GPS maintenant.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-statue-vivante",
    title: "La Statue Vivante",
    type: "social",
    image: "/assets/exp-statue-vivante.webp",
    description: "L'artiste statue vivante de la place vient de s'\xE9vanouir de chaleur. Son chapeau \xE0 pi\xE8ces reste au sol, tr\xE8s vivant, lui.",
    choices: [
      { text: "Le secourir", risk: "safe", emoji: "\u{1F691}", outcomes: [
        { probability: 0.7, text: "Eau, ombre, \xE9ventail improvis\xE9. En rouvrant les yeux, il partage la recette : \xAB t'es le premier \xE0 pas m'avoir vol\xE9. \xBB", moneyChange: 5, respectChange: 3, statChanges: { mental: 5 } },
        { probability: 0.3, text: "Il se rel\xE8ve, s'\xE9poussette, repart poser sans un mot. Les statues, c'est pas causant, m\xEAme vivant.", statChanges: { mental: 2, dignity: 2 } }
      ] },
      { text: "Prendre la pose \xE0 sa place", risk: "risky", emoji: "\u{1F5FF}", outcomes: [
        { probability: 0.5, text: "Vous tenez la pose quarante minutes. Un touriste dit \xAB lui au moins il est r\xE9aliste \xBB. Il ne croit pas si bien dire.", moneyChange: 7, statChanges: { dignity: 5, mental: 8 } },
        { probability: 0.5, text: "Un enfant vous fait rire au bout de deux minutes. La magie tombe, les pi\xE8ces aussi, mais pas dans votre sens.", statChanges: { mental: -4, dignity: -4 } }
      ] }
    ]
  },
  {
    id: "exp-poubelle-bureau",
    title: "Les Poubelles du Bureau",
    type: "discovery",
    image: "/assets/exp-poubelle-bureau.webp",
    description: "Une entreprise d\xE9m\xE9nage. Les bennes d\xE9bordent de mat\xE9riel d\xE9cr\xE9t\xE9 \xAB obsol\xE8te \xBB par un tableur.",
    choices: [
      { text: "Fouiller m\xE9thodiquement", risk: "normal", emoji: "\u{1F5D1}\uFE0F", outcomes: [
        { probability: 0.5, text: "Un clavier, trois c\xE2bles, un t\xE9l\xE9phone fixe. Le brocanteur appelle \xE7a \xAB du vintage \xBB. Vous appelez \xE7a d\xEEner.", moneyChange: 2, itemGain: { id: "cables-bureau", name: "Poign\xE9e de c\xE2bles", emoji: "\u{1F50C}", type: "junk", value: 6 } },
        { probability: 0.3, text: "Une plante verte de bureau, aussi d\xE9prim\xE9e que vous. Vous l'adoptez. Vous vous comprenez.", statChanges: { mental: 6 }, itemGain: { id: "plante-bureau", name: "Ficus d\xE9pressif", emoji: "\u{1FAB4}", type: "junk", value: 3 } },
        { probability: 0.2, text: "Rien que des documents broy\xE9s et une agrafeuse sans agrafes. M\xEAme leurs d\xE9chets sont en burn-out.", statChanges: { mental: -3 } }
      ] },
      { text: "Demander directement aux d\xE9m\xE9nageurs", risk: "safe", emoji: "\u{1F91D}", outcomes: [
        { probability: 0.6, text: "\xAB Sers-toi, \xE7a part \xE0 la benne. \xBB Vous revendez une chaise de bureau \xE0 roulettes dans l'heure. Le march\xE9 est fluide.", moneyChange: 4, statChanges: { mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: "\xAB Touche pas, c'est inventori\xE9. \xBB Inventori\xE9 pour la destruction. La logistique a ses myst\xE8res.", statChanges: { mental: -2, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "exp-casting-sauvage",
    title: "Le Casting Sauvage",
    type: "social",
    image: "/assets/exp-casting-sauvage.webp",
    description: "Une r\xE9alisatrice arpente le quartier : elle cherche des \xAB gueules authentiques \xBB pour son documentaire sur la ville.",
    choices: [
      { text: "Raconter votre histoire", risk: "normal", emoji: "\u{1F3AC}", outcomes: [
        { probability: 0.6, text: "Elle filme, elle pleure, elle paie. Votre vie fait un excellent sc\xE9nario. Vous auriez pr\xE9f\xE9r\xE9 une meilleure vie et un mauvais film.", moneyChange: 6, statChanges: { dignity: 4, mental: 5 } },
        { probability: 0.4, text: "Elle voulait juste \xAB de l'ambiance \xBB. Vous \xEAtes un figurant flou derri\xE8re un lampadaire. Comme dans la vraie vie.", moneyChange: 1, statChanges: { mental: -2 } }
      ] },
      { text: "N\xE9gocier un cachet d'abord", risk: "risky", emoji: "\u{1F4B0}", outcomes: [
        { probability: 0.5, text: "\xAB Enfin quelqu'un qui conna\xEEt sa valeur. \xBB Elle paie le tarif syndical. Vous ignoriez avoir un syndicat.", moneyChange: 10, respectChange: 2 },
        { probability: 0.5, text: "Elle filme finalement quelqu'un de plus \xAB photog\xE9nique \xBB. Le mot poli pour dire avec moins de dents en moins.", statChanges: { mental: -4, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "exp-frigo-solidaire",
    title: "Le Frigo Solidaire",
    type: "discovery",
    image: "/assets/exp-frigo-solidaire.webp",
    description: "Un frigo solidaire flambant neuf vient d'\xEAtre inaugur\xE9, ruban tricolore et tout. Il est encore plein. \xC7a ne durera pas.",
    choices: [
      { text: "Se servir raisonnablement", risk: "safe", emoji: "\u{1F957}", outcomes: [
        { probability: 0.8, text: "Yaourts, pain, une soupe en brique. Vous laissez le reste, geste de gentleman. Le frigo appr\xE9cie, s\xFBrement.", statChanges: { hunger: 18, thirst: 6, mental: 4 } },
        { probability: 0.2, text: "Tout est au soja. Absolument tout. M\xEAme le jambon. La solidarit\xE9 a un go\xFBt, et c'est celui du soja.", statChanges: { hunger: 10, mental: -2 } }
      ] },
      { text: "Faire des r\xE9serves", risk: "normal", emoji: "\u{1F392}", outcomes: [
        { probability: 0.5, text: "Sac plein pour deux jours. La fourmi et la cigale, version bac \xE0 l\xE9gumes.", statChanges: { hunger: 15 }, itemGain: { id: "soupe-brique", name: "Soupe en brique", emoji: "\u{1F96B}", type: "food", value: 3, effect: { hunger: 12 } } },
        { probability: 0.5, text: "Une b\xE9n\xE9vole vous sermonne devant tout le monde sur le \xAB partage \xE9quitable \xBB. Vous repartez avec un yaourt et une le\xE7on.", statChanges: { dignity: -6, hunger: 8 } }
      ] }
    ]
  },
  {
    id: "exp-toilettes-payantes",
    title: "La Sanisette D\xE9traqu\xE9e",
    type: "discovery",
    image: "/assets/exp-toilettes-payantes.webp",
    description: "La sanisette municipale est en panne : porte grande ouverte, monnayeur qui clignote comme une machine \xE0 sous.",
    choices: [
      { text: "Secouer le monnayeur", risk: "risky", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.5, text: "Une pluie de pi\xE8ces jaunes. La machine rend dix ans de monnaie d'un coup, avec un r\xE2le de soulagement.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.3, text: "La porte se referme et le cycle de lavage se d\xE9clenche AVEC VOUS DEDANS. Traumatisant. Mais vous n'avez jamais \xE9t\xE9 aussi propre.", statChanges: { health: -3, mental: -6, dignity: 12 } },
        { probability: 0.2, text: "Rien. La machine clignote, nargue, et se rendort. M\xEAme les sanisettes vous font des promesses.", statChanges: { mental: -2 } }
      ] },
      { text: "Profiter des toilettes gratuites", risk: "safe", emoji: "\u{1F6BD}", outcomes: [
        { probability: 1, text: "Un moment d'intimit\xE9 avec verrou. Le grand luxe ne se raconte pas.", statChanges: { mental: 6, dignity: 4 } }
      ] }
    ]
  },
  {
    id: "exp-magicien-rate",
    title: "Le Magicien Rat\xE9",
    type: "social",
    image: "/assets/exp-magicien-rate.webp",
    description: "Un magicien de rue vient de rater son grand final : sa colombe s'est enfuie avec l'alliance d'une spectatrice, et il continue de sourire au public.",
    choices: [
      { text: "Traquer la colombe", risk: "normal", emoji: "\u{1F54A}\uFE0F", outcomes: [
        { probability: 0.6, text: "Vous la coincez sous votre veste au troisi\xE8me essai. Le couple vous r\xE9compense, le magicien vous embauche presque.", moneyChange: 8, respectChange: 3 },
        { probability: 0.4, text: "La colombe vous \xE9chappe et vous bombarde en repr\xE9sailles. Vous gagnez trois plumes et une r\xE9putation.", statChanges: { dignity: -5, mental: -3 } }
      ] },
      { text: "Proposer d'\xEAtre son assistant", risk: "risky", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.5, text: "Le duo fonctionne : vous \xAB disparaissez \xBB derri\xE8re un rideau, le public adore. Recette partag\xE9e moiti\xE9-moiti\xE9, enfin presque.", moneyChange: 5, statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: "Il vous \xAB scie en deux \xBB. Le tour rate \xE0 moiti\xE9. Vous ne saurez jamais quelle moiti\xE9. Le public s'en va.", statChanges: { mental: -4 } }
      ] }
    ]
  },
  {
    id: "exp-demenageurs",
    title: "Le Piano du Sixi\xE8me",
    type: "social",
    image: "/assets/exp-demenageurs.webp",
    description: "Deux d\xE9m\xE9nageurs contemplent un piano droit au pied d'un immeuble sans ascenseur. Sixi\xE8me \xE9tage. Aucun des deux ne parle en premier.",
    choices: [
      { text: "Proposer vos bras", risk: "normal", emoji: "\u{1F4AA}", outcomes: [
        { probability: 0.6, text: "Six \xE9tages, quarante marches de blasph\xE8mes, un billet \xE0 l'arriv\xE9e. Votre dos d\xE9posera plainte plus tard.", moneyChange: 10, respectChange: 2, statChanges: { health: -6 } },
        { probability: 0.4, text: "Au quatri\xE8me, le piano gagne. Il redescend deux \xE9tages tout seul, vous aussi. On vous paie quand m\xEAme \xAB pour le courage \xBB.", moneyChange: 4, statChanges: { health: -10, mental: -3 } }
      ] },
      { text: "Superviser depuis le trottoir", risk: "safe", emoji: "\u{1F5E3}\uFE0F", outcomes: [
        { probability: 0.7, text: "\xAB Plus \xE0 gauche. Non, l'autre gauche. \xBB Vos conseils valent un caf\xE9 et un pain au chocolat. Le management, c'est un don.", statChanges: { thirst: 8, hunger: 8, mental: 5 } },
        { probability: 0.3, text: "\xAB Tu aides ou tu d\xE9gages. \xBB Le monde du travail n'est pas pr\xEAt pour les consultants b\xE9n\xE9voles.", statChanges: { mental: -3, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "exp-jardins-ouvriers",
    title: "Les Jardins Ouvriers",
    type: "discovery",
    image: "/assets/exp-jardins-ouvriers.webp",
    description: "Derri\xE8re un grillage, des potagers en parcelles. Sur l'une d'elles, un \xE9criteau : \xAB R\xE9coltez-moi, je pars en maison de retraite. \xBB",
    choices: [
      { text: "R\xE9colter avec soin", risk: "safe", emoji: "\u{1F955}", outcomes: [
        { probability: 0.7, text: "Carottes, poireaux, et un mot scotch\xE9 sous une pierre : \xAB prenez soin des tomates, elles sont timides. \xBB Vous promettez.", statChanges: { hunger: 20, mental: 10 } },
        { probability: 0.3, text: "Les voisins de parcelle vous prennent pour un voleur. L'\xE9criteau les fait taire, mais les regards restent.", statChanges: { hunger: 10, mental: -4 }, respectChange: -1 }
      ] },
      { text: "R\xE9colter et laisser un po\xE8me", risk: "safe", emoji: "\u270D\uFE0F", outcomes: [
        { probability: 1, text: "Vous r\xE9coltez, et laissez trois vers sur les tomates timides. Quelque part en maison de retraite, quelqu'un sourira.", statChanges: { hunger: 15, mental: 12, dignity: 5 } }
      ] }
    ]
  },
  {
    id: "exp-boite-livres",
    title: "La Bo\xEEte \xE0 Livres",
    type: "discovery",
    image: "/assets/exp-boite-livres.webp",
    description: "Une bo\xEEte \xE0 livres d\xE9borde sur la place. Entre deux romans de gare, une enveloppe kraft d\xE9passe, ni timbr\xE9e ni ferm\xE9e.",
    choices: [
      { text: "Ouvrir l'enveloppe", risk: "normal", emoji: "\u2709\uFE0F", outcomes: [
        { probability: 0.5, text: "Un billet pli\xE9 dans un mot : \xAB pour celui qui lit encore. \xBB Vous lisez encore. Techniquement, vous venez de lire.", moneyChange: 5, statChanges: { mental: 8 } },
        { probability: 0.3, text: "Une liste de courses de 1997. \xAB Beurre, piles, cadeau Sylvie. \xBB Vous esp\xE9rez que Sylvie a eu son cadeau.", statChanges: { mental: 4 } },
        { probability: 0.2, text: "Des photos de vacances d'inconnus. Vous vous inventez leur vie enti\xE8re sur un banc. Belle vie, au demeurant.", statChanges: { mental: 6 } }
      ] },
      { text: "Prendre un livre pour la nuit", risk: "safe", emoji: "\u{1F4D6}", outcomes: [
        { probability: 1, text: "Un polar auquel il manque les dix derni\xE8res pages. Le suspense restera entier pour toujours. C'est peut-\xEAtre mieux.", statChanges: { mental: 8 }, itemGain: { id: "polar-ampute", name: "Polar sans fin", emoji: "\u{1F4D5}", type: "junk", value: 2, effect: { mental: 5 } } }
      ] }
    ]
  },
  {
    id: "exp-manif",
    title: "La Manifestation",
    type: "narrative",
    image: "/assets/exp-manif.webp",
    description: "Un cort\xE8ge traverse le quartier, banderoles au vent. Vous ne savez pas pour quoi ils manifestent, mais il y a un stand de merguez.",
    choices: [
      { text: "Suivre le cort\xE8ge", risk: "normal", emoji: "\u270A", outcomes: [
        { probability: 0.6, text: "Merguez solidaire, slogans entra\xEEnants, sentiment d'appartenance. Vous ne savez toujours pas pour quoi vous marchez. Peu importe.", statChanges: { hunger: 16, mental: 8 } },
        { probability: 0.3, text: "\xC7a d\xE9g\xE9n\xE8re juste quand vous arrivez \xE0 la merguez. Vous fuyez avec la moiti\xE9 d'un sandwich et des yeux qui piquent.", statChanges: { health: -6, mental: -5, hunger: 8 } },
        { probability: 0.1, text: "Une journaliste vous interviewe comme \xAB figure du mouvement \xBB. Vous improvisez. Vous passez au 20h, flou mais digne.", respectChange: 4, statChanges: { mental: 6, dignity: 5 } }
      ] },
      { text: "Regarder passer, en spectateur", risk: "safe", emoji: "\u{1F440}", outcomes: [
        { probability: 1, text: "Les gens crient pour leur avenir. Vous, vous n'avez plus que du pr\xE9sent. C'est d\xE9j\xE0 de l'organisation.", statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "exp-tournage",
    title: "Le Tournage",
    type: "social",
    image: "/assets/exp-tournage.webp",
    description: "Une \xE9quipe de cin\xE9ma a envahi votre rue. C\xE2bles, projecteurs, et surtout : un buffet r\xE9gie momentan\xE9ment sans surveillance.",
    choices: [
      { text: "S'incruster au buffet", risk: "risky", emoji: "\u{1F950}", outcomes: [
        { probability: 0.5, text: "Vous passez pour un machino. Vous mangez comme un machino. Vous repartez avant la question fatale : \xAB t'es sur quel poste ? \xBB", statChanges: { hunger: 25, thirst: 10, mental: 6 } },
        { probability: 0.5, text: "La r\xE9gisseuse vous d\xE9masque \xE0 la troisi\xE8me chouquette. Expulsion publique, mais elle vous laisse le croissant entam\xE9.", statChanges: { dignity: -6, mental: -4, hunger: 6 } }
      ] },
      { text: "Proposer d'\xEAtre figurant", risk: "normal", emoji: "\u{1F3AD}", outcomes: [
        { probability: 0.6, text: "Ils cherchaient justement \xAB quelqu'un de vrai \xBB. Vous traversez le champ douze fois, pay\xE9 \xE0 la travers\xE9e, nourri entre deux prises.", moneyChange: 8, statChanges: { dignity: 6, mental: 8 } },
        { probability: 0.4, text: "\xAB On a d\xE9j\xE0 nos SDF, merci. \xBB Ils ont des SDF de casting. Maquill\xE9s pour faire vrai. Le cin\xE9ma est un monde \xE9trange.", statChanges: { mental: -6, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-distributeur-fleurs",
    title: "Le Distributeur de Fleurs",
    type: "discovery",
    image: "/assets/exp-distributeur-fleurs.webp",
    description: "Un distributeur automatique de bouquets est d\xE9traqu\xE9 : il distribue une rose toutes les trois minutes, gratuitement, imperturbablement.",
    choices: [
      { text: "Faire la r\xE9colte et revendre", risk: "safe", emoji: "\u{1F339}", outcomes: [
        { probability: 0.6, text: "Douze roses vendues \xE0 l'unit\xE9 aux amoureux du parc. La machine produit, vous distribuez. Le capitalisme, enfin de votre c\xF4t\xE9.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Les roses fanent plus vite que vous ne vendez. Il vous reste un bouquet triste et des \xE9pines dans les poches.", statChanges: { mental: 3 }, itemGain: { id: "bouquet-fane", name: "Bouquet en fin de vie", emoji: "\u{1F940}", type: "junk", value: 2, effect: { mental: 4 } } }
      ] },
      { text: "Offrir les roses aux passants tristes", risk: "safe", emoji: "\u{1F490}", outcomes: [
        { probability: 1, text: "Des sourires, deux merci \xE9mus, une pi\xE8ce spontan\xE9e. Le luxe supr\xEAme : donner quelque chose, pour une fois.", statChanges: { mental: 12, dignity: 8 }, respectChange: 2, moneyChange: 1 }
      ] }
    ]
  },
  {
    id: "exp-pigeon-bague",
    title: "Le Pigeon Voyageur",
    type: "discovery",
    image: "/assets/exp-pigeon-bague.webp",
    description: "Un pigeon bagu\xE9 picore pr\xE8s de vous. Le petit tube fix\xE9 \xE0 sa patte contient visiblement un message. Le myst\xE8re \xE0 port\xE9e de main.",
    choices: [
      { text: "Attraper le pigeon", risk: "normal", emoji: "\u{1F426}", outcomes: [
        { probability: 0.5, text: "Le message dit : \xAB G\xE9rard, rends l'argent. \xBB C'est tout. Vous rel\xE2chez le pigeon vers son destin de cr\xE9ancier ail\xE9.", moneyChange: 2, statChanges: { mental: 6 } },
        { probability: 0.3, text: "Le pigeon se d\xE9bat comme un catcheur. Vous r\xE9coltez trois plumes, z\xE9ro message et le regard des passants.", statChanges: { dignity: -3, mental: -2 } },
        { probability: 0.2, text: "Son propri\xE9taire surgit, colombophile en larmes : \xAB Maurice ! \xBB Il vous r\xE9compense. Maurice, lui, ne vous remercie pas.", moneyChange: 7, respectChange: 2 }
      ] },
      { text: "Le laisser \xE0 sa mission", risk: "safe", emoji: "\u{1F54A}\uFE0F", outcomes: [
        { probability: 1, text: "Chacun son fardeau. Lui, au moins, il sait o\xF9 il va.", statChanges: { mental: 4 } }
      ] }
    ]
  },
  {
    id: "exp-egoutier",
    title: "L'\xC9goutier Philosophe",
    type: "social",
    image: "/assets/exp-egoutier.webp",
    description: "Un \xE9goutier en pause remonte de sa bouche d'\xE9gout, s'assoit sur le rebord et vous tend un gobelet de thermos, comme si c'\xE9tait pr\xE9vu.",
    choices: [
      { text: "Partager le caf\xE9 et la causerie", risk: "safe", emoji: "\u2615", outcomes: [
        { probability: 0.7, text: "Il conna\xEEt la ville par en dessous. Il vous indique une grille d'a\xE9ration ti\xE8de \xAB o\xF9 m\xEAme les rats sont polis \xBB, et vous fait r\xE9p\xE9ter la rue deux fois.", statChanges: { thirst: 8, mental: 8, sleep: 5 }, addFlag: "grille-egoutier" },
        { probability: 0.3, text: "Son caf\xE9 a un l\xE9ger go\xFBt de tuyau. Sa philosophie aussi. Les deux r\xE9chauffent quand m\xEAme.", statChanges: { thirst: 5, health: -2, mental: 4 } }
      ] },
      { text: "Demander ce qu'on trouve en bas", risk: "normal", emoji: "\u{1F40A}", outcomes: [
        { probability: 0.6, text: "\xAB Des alliances, surtout. Les gens jettent leur mariage aux toilettes. \xBB Il vous en donne une : \xAB porte-bonheur. \xBB", statChanges: { mental: 5 }, itemGain: { id: "alliance-egout", name: "Alliance rep\xEAch\xE9e", emoji: "\u{1F48D}", type: "junk", value: 8 } },
        { probability: 0.4, text: "\xAB Des choses qui remontent. \xBB Il n'en dira pas plus. Il redescend. Vous dormirez un peu moins bien.", statChanges: { mental: -4, sleep: -3 } }
      ] }
    ]
  },
  {
    id: "exp-cabine-ecoute",
    title: "La Cabine qui Sonne",
    type: "narrative",
    image: "/assets/exp-cabine-ecoute.webp",
    description: "La derni\xE8re cabine t\xE9l\xE9phonique du quartier se met \xE0 sonner pile quand vous passez devant. Personne d'autre dans la rue.",
    choices: [
      { text: "D\xE9crocher", risk: "normal", emoji: "\u{1F4DE}", outcomes: [
        { probability: 0.5, text: "\xAB Papi ? \xBB Une petite voix. Vous expliquez gentiment. Elle raconte sa journ\xE9e quand m\xEAme, jusqu'\xE0 ce que quelqu'un lui reprenne le t\xE9l\xE9phone.", statChanges: { mental: 10 } },
        { probability: 0.3, text: "Un d\xE9marchage pour des panneaux solaires. M\xEAme ici. M\xEAme vous. Vous n\xE9gociez par principe, pour rien.", statChanges: { mental: 3 } },
        { probability: 0.2, text: "Une voix : \xAB la consigne de la gare, casier 12. \xBB Puis bip. Vous n'irez jamais. Ou si ?", statChanges: { mental: 5, sleep: -2 } }
      ] },
      { text: "Laisser sonner, par prudence", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "La sonnerie s'\xE9teint derri\xE8re vous. Certains myst\xE8res font de meilleures histoires quand on ne les r\xE9sout pas.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-drone-crash",
    title: "Le Drone \xC9cras\xE9",
    type: "discovery",
    image: "/assets/exp-drone-crash.webp",
    description: "Un drone de livraison g\xEEt dans un buisson, h\xE9lices tordues, colis intact accroch\xE9 au ventre. Il clignote faiblement, comme un animal bless\xE9.",
    choices: [
      { text: "R\xE9cup\xE9rer le colis", risk: "risky", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.5, text: "Des chaussettes de luxe et une bougie parfum\xE9e \xAB Soir d'Automne \xBB. Le confort moderne tomb\xE9 du ciel, litt\xE9ralement.", statChanges: { mental: 6, dignity: 4 }, itemGain: { id: "bougie-luxe", name: "Bougie \xAB Soir d'Automne \xBB", emoji: "\u{1F56F}\uFE0F", type: "junk", value: 7 } },
        { probability: 0.3, text: "Le drone hurle \xAB TENTATIVE DE VOL D\xC9TECT\xC9E \xBB d'une voix synth\xE9tique. Tout le quartier regarde. Vous d\xE9talez.", statChanges: { mental: -5, dignity: -4 } },
        { probability: 0.2, text: "Le colis contient un autre drone, plus petit. C'est des poup\xE9es russes volantes. Vous le revendez sans chercher \xE0 comprendre.", moneyChange: 8 }
      ] },
      { text: "Signaler l'\xE9pave au num\xE9ro affich\xE9", risk: "safe", emoji: "\u{1F4F1}", outcomes: [
        { probability: 0.6, text: "Le service client vous remercie et vous cr\xE9dite un bon d'achat que vous ne pourrez jamais utiliser. On vous paie en pi\xE8ces \xE0 la place.", moneyChange: 4, respectChange: 1 },
        { probability: 0.4, text: "Vous restez 40 minutes en attente sur le t\xE9l\xE9phone d'un passant compatissant. La musique d'attente vous hante encore.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-caravane-voyante",
    title: "La Caravane de la Voyante",
    type: "social",
    image: "/assets/exp-caravane-voyante.webp",
    description: "Une caravane mauve s'est gar\xE9e sur le terrain vague. \xAB Madame Esperanza, avenir, pass\xE9, objets perdus. \xBB Elle vous fait signe d'entrer, gratuitement.",
    choices: [
      { text: "Se faire lire l'avenir", risk: "normal", emoji: "\u{1F52E}", outcomes: [
        { probability: 0.6, text: "\xAB Je vois... un toit. Pas tout de suite, mais je le vois. \xBB Elle vous offre le th\xE9. Un toit. Vous y pensez toute la journ\xE9e.", statChanges: { mental: 10, thirst: 6 }, addFlag: "prophetie-toit" },
        { probability: 0.4, text: "Elle p\xE2lit en regardant les cartes, les range, et vous donne un billet : \xAB revenez jamais. \xBB Elle ne dit pas ce qu'elle a vu.", moneyChange: 5, statChanges: { mental: -5, sleep: -3 } }
      ] },
      { text: "Lui proposer de rabattre des clients", risk: "normal", emoji: "\u{1F4E3}", outcomes: [
        { probability: 0.6, text: "Votre bagou attire trois curieux dans l'apr\xE8s-midi. Commission honn\xEAte, th\xE9 \xE0 volont\xE9, et une chaise pliante rien que pour vous.", moneyChange: 6, statChanges: { thirst: 8, mental: 4 } },
        { probability: 0.4, text: "Vous promettez trop : un client furieux r\xE9clame son \xAB grand amour \xBB sous 48h. Madame Esperanza vous cong\xE9die diplomatiquement.", statChanges: { mental: -3 }, respectChange: -1 }
      ] }
    ]
  },
  {
    id: "exp-atelier-velo",
    title: "L'Atelier V\xE9lo Associatif",
    type: "social",
    image: "/assets/exp-atelier-velo.webp",
    description: "Un atelier associatif r\xE9pare des v\xE9los dans une arri\xE8re-cour. \xC7a sent la graisse, le m\xE9tal et le caf\xE9. Quelqu'un jure contre un d\xE9railleur.",
    choices: [
      { text: "Donner un coup de main", risk: "safe", emoji: "\u{1F527}", outcomes: [
        { probability: 0.7, text: "Vous tenez, vous vissez, vous apprenez. On vous paie en caf\xE9, en sandwich, et on vous demande si vous revenez demain.", statChanges: { hunger: 12, thirst: 8, mental: 8, dignity: 5 } },
        { probability: 0.3, text: "Le d\xE9railleur gagne contre tout le monde. D\xE9faite collective, mais fraternelle. On vous garde une place pour la prochaine.", statChanges: { mental: 6 }, respectChange: 2 }
      ] },
      { text: "N\xE9gocier une roue pour votre caddie", risk: "normal", emoji: "\u{1F6DE}", outcomes: [
        { probability: 0.6, text: "On vous \xE9quipe gratuitement. Votre caddie roule maintenant comme une berline allemande. Enfin, presque.", statChanges: { mental: 8 }, itemGain: { id: "roue-velo", name: "Roue de v\xE9lo neuve", emoji: "\u{1F6DE}", type: "junk", value: 6 } },
        { probability: 0.4, text: "\xAB On r\xE9pare des v\xE9los, pas des caddies. \xBB Le sectarisme existe partout, m\xEAme chez les gens bien.", statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "exp-vernissage",
    title: "Le Vernissage",
    type: "social",
    image: "/assets/exp-vernissage.webp",
    description: "Une galerie inaugure une expo d'art contemporain. Porte ouverte, vin blanc \xE0 volont\xE9, et des \u0153uvres que personne ne comprend. Vous \xEAtes habill\xE9 pareil que l'artiste.",
    choices: [
      { text: "Entrer et se fondre dans la masse", risk: "normal", emoji: "\u{1F377}", outcomes: [
        { probability: 0.6, text: "Trois verres, six petits-fours, deux conversations sur \xAB la mat\xE9rialit\xE9 du vide \xBB. Vous improvisez. On vous trouve \xAB rafra\xEEchissant \xBB.", statChanges: { hunger: 12, thirst: 12, mental: 8, dignity: 5 } },
        { probability: 0.4, text: "On vous prend pour l'artiste. Vous signez deux catalogues avant que le vrai arrive. Sortie discr\xE8te, mais le vin \xE9tait bon.", statChanges: { thirst: 10, mental: 10, dignity: -2 } }
      ] },
      { text: "Critiquer les \u0153uvres depuis la vitrine", risk: "safe", emoji: "\u{1F9D0}", outcomes: [
        { probability: 0.7, text: "Un collectionneur sort fumer et vous demande votre avis. Votre franchise le ravit. Il vous paie \xAB la consultation \xBB.", moneyChange: 6, statChanges: { mental: 6 }, respectChange: 1 },
        { probability: 0.3, text: "Vous r\xE9alisez que l'\u0153uvre que vous critiquez est un extincteur. L'extincteur, lui, ne juge pas.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-colleur-affiches",
    title: "Le Colleur d'Affiches",
    type: "social",
    image: "/assets/exp-colleur-affiches.webp",
    description: "Un colleur d'affiches se bat seul contre le vent avec une affiche de cirque de quatre m\xE8tres. Le vent gagne, avec panache.",
    choices: [
      { text: "Tenir l'affiche", risk: "safe", emoji: "\u{1F932}", outcomes: [
        { probability: 0.7, text: "\xC0 deux, le vent perd. Le colleur partage son casse-cro\xFBte et deux invendues : des places de cirque p\xE9rim\xE9es \xAB pour le souvenir \xBB.", moneyChange: 3, statChanges: { hunger: 10, mental: 5 } },
        { probability: 0.3, text: "Une bourrasque vous emballe tous les deux dans l'affiche. Vous voil\xE0 coll\xE9s au lion du cirque Zavatta. On vous d\xE9colle en riant.", statChanges: { mental: 4, dignity: -4 } }
      ] },
      { text: "R\xE9cup\xE9rer les vieilles affiches arrach\xE9es", risk: "safe", emoji: "\u{1F4DC}", outcomes: [
        { probability: 1, text: "Le papier d'affiche, \xE9pais et enduit : deux couches sous le dos valent une couverture.", statChanges: { mental: 3, sleep: 5 }, itemGain: { id: "affiches-epaisses", name: "Liasse d'affiches (isolant)", emoji: "\u{1F4DC}", type: "junk", value: 3 } }
      ] }
    ]
  },
  {
    id: "exp-stand-hotdog",
    title: "Le Stand de Hot-Dogs Abandonn\xE9",
    type: "discovery",
    image: "/assets/exp-stand-hotdog.webp",
    description: "Un stand de hot-dogs fume tout seul au coin de la rue. Le vendeur est parti en courant vers une contractuelle, au loin. Les saucisses gr\xE9sillent, orphelines.",
    choices: [
      { text: "Surveiller le stand en attendant", risk: "safe", emoji: "\u{1F32D}", outcomes: [
        { probability: 0.7, text: "Le vendeur revient, PV \xE0 la main. Il vous offre le hot-dog du si\xE8cle : \xAB t'es le seul qui a rien vol\xE9. \xBB La barre \xE9tait basse.", statChanges: { hunger: 25, mental: 6 }, respectChange: 2 },
        { probability: 0.3, text: "Vous servez deux clients pendant l'absence, tarif exact, monnaie rendue. Le vendeur, bluff\xE9, partage la recette.", moneyChange: 5, statChanges: { hunger: 15, mental: 5 } }
      ] },
      { text: "Se servir, vite", risk: "risky", emoji: "\u{1F3C3}", outcomes: [
        { probability: 0.5, text: "Deux hot-dogs engloutis en marchant vite. La moutarde vous coule sur les doigts comme un remords ti\xE8de.", statChanges: { hunger: 22, mental: -3, dignity: -4 } },
        { probability: 0.5, text: "Le vendeur revient PILE \xE0 la saucisse. La poursuite est br\xE8ve, la honte durable. Il garde votre bonnet en otage.", statChanges: { health: -4, dignity: -6, mental: -4 }, addFlag: "bonnet-otage" }
      ] }
    ]
  },
  {
    id: "exp-cle-perdue",
    title: "Le Trousseau Perdu",
    type: "discovery",
    image: "/assets/exp-cle-perdue.webp",
    description: "Un trousseau de cl\xE9s g\xEEt sur le trottoir : sept cl\xE9s, une patte de lapin us\xE9e, et une \xE9tiquette \xAB si perdu, r\xE9compense \xBB. Sans adresse.",
    choices: [
      { text: "Le d\xE9poser au commissariat", risk: "normal", emoji: "\u{1F46E}", outcomes: [
        { probability: 0.6, text: "L'agent note tout, vous remercie, et le propri\xE9taire vous retrouve le soir m\xEAme : la r\xE9compense existe vraiment, en billets.", moneyChange: 10, respectChange: 3, statChanges: { mental: 6 } },
        { probability: 0.4, text: "On vous fait attendre une heure, puis on vous demande VOS papiers. Vous ressortez sans cl\xE9s, sans r\xE9compense, avec un doute.", statChanges: { mental: -4, dignity: -3 } }
      ] },
      { text: "Garder la patte de lapin", risk: "normal", emoji: "\u{1F430}", outcomes: [
        { probability: 0.5, text: "Vous accrochez les cl\xE9s bien en vue sur la grille et gardez le porte-bonheur. Le lapin a assez servi les autres.", statChanges: { mental: 5 }, itemGain: { id: "patte-lapin", name: "Patte de lapin us\xE9e", emoji: "\u{1F430}", type: "junk", value: 4, effect: { mental: 6 } } },
        { probability: 0.5, text: "La propri\xE9taire arrive pendant votre h\xE9sitation. Regard appuy\xE9 sur la patte de lapin dans votre main. R\xE9compense : divis\xE9e par deux.", moneyChange: 4, statChanges: { dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-consigne-verre",
    title: "La Consigne du Verre",
    type: "discovery",
    image: "/assets/exp-consigne-verre.webp",
    description: "Le nouveau supermarch\xE9 a install\xE9 une machine \xE0 consigne : chaque bouteille rapporte des centimes. Le quartier entier jette ses bouteilles n'importe o\xF9. Une mine \xE0 ciel ouvert.",
    choices: [
      { text: "Faire la tourn\xE9e des recoins", risk: "safe", emoji: "\u{1F37E}", outcomes: [
        { probability: 0.7, text: "Vingt-trois bouteilles, un sac qui tinte comme un carillon. La machine avale tout et crache un vrai billet. L'\xE9cologie paie enfin quelqu'un.", moneyChange: 6, statChanges: { mental: 5, dignity: -2 } },
        { probability: 0.3, text: "La machine refuse une bouteille sur deux avec un bip m\xE9prisant. \xAB CONTENANT NON RECONNU. \xBB Vous non plus, vous n'\xEAtes pas reconnu.", moneyChange: 3, statChanges: { mental: -2 } }
      ] },
      { text: "S'associer avec le clochard du parking", risk: "normal", emoji: "\u{1F91D}", outcomes: [
        { probability: 0.6, text: "Lui les bars, vous les parcs. L'accord est scell\xE9 d'une poign\xE9e de main collante. Premier jour de la coop\xE9rative : b\xE9n\xE9fice net.", moneyChange: 5, respectChange: 2, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Il conna\xEEt d\xE9j\xE0 TOUS les spots et vous le fait savoir. Vous h\xE9ritez de la zone industrielle. Deux bouteilles, dont une cass\xE9e.", moneyChange: 1, statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-ruche-urbaine",
    title: "Les Ruches du Toit",
    type: "discovery",
    image: "/assets/exp-ruche-urbaine.webp",
    description: "Sur le toit du gymnase, un apiculteur urbain en combinaison blanche s'agite entre ses ruches. Il vous aper\xE7oit et crie quelque chose d'inaudible.",
    choices: [
      { text: "Monter voir (prudemment)", risk: "risky", emoji: "\u{1F41D}", outcomes: [
        { probability: 0.5, text: "\xAB Tenez \xE7a ! \xBB Vous voil\xE0 assistant apicole. Une heure plus tard : deux piq\xFBres, un pot de miel, et une passion naissante.", statChanges: { health: -3, hunger: 10, mental: 8 }, itemGain: { id: "pot-miel", name: "Pot de miel urbain", emoji: "\u{1F36F}", type: "food", value: 8, effect: { hunger: 15, health: 5 } } },
        { probability: 0.5, text: "Les abeilles d\xE9cr\xE8tent que vous \xEAtes une menace. La descente d'escalier restera dans les annales du gymnase.", statChanges: { health: -8, mental: -4, dignity: -5 } }
      ] },
      { text: "Crier \xAB \xE7a va ? \xBB et attendre en bas", risk: "safe", emoji: "\u{1F4E3}", outcomes: [
        { probability: 1, text: "Il redescend une heure apr\xE8s et vous offre un rayon de miel \xAB pour la compagnie morale \xBB. Les gens seuls se reconnaissent.", statChanges: { hunger: 12, mental: 6 } }
      ] }
    ]
  },
  {
    id: "exp-machine-pince",
    title: "La Machine \xE0 Pince",
    type: "discovery",
    image: "/assets/exp-machine-pince.webp",
    description: "Dans le hall de la laverie, une machine \xE0 pince pleine de peluches d\xE9lav\xE9es. Un mot scotch\xE9 : \xAB pince d\xE9r\xE9gl\xE9e, jouez \xE0 vos risques. \xBB D\xE9r\xE9gl\xE9e dans quel sens ?",
    choices: [
      { text: "Tenter le coup avec votre derni\xE8re pi\xE8ce", risk: "risky", emoji: "\u{1F579}\uFE0F", outcomes: [
        { probability: 0.4, text: "La pince, effectivement d\xE9r\xE9gl\xE9e, attrape TROIS peluches d'un coup. Le patron de la laverie applaudit. Vous \xEAtes une l\xE9gende locale.", statChanges: { mental: 12 }, respectChange: 2, itemGain: { id: "peluche-lapin", name: "Lapin en peluche d\xE9lav\xE9", emoji: "\u{1F9F8}", type: "junk", value: 5, effect: { mental: 8 } } },
        { probability: 0.6, text: "La pince attrape le vide avec une pr\xE9cision remarquable. Trois fois. Elle est d\xE9r\xE9gl\xE9e dans le mauvais sens. Le v\xF4tre.", moneyChange: -1, statChanges: { mental: -4 } }
      ] },
      { text: "Secouer discr\xE8tement la machine", risk: "normal", emoji: "\u{1FAE8}", outcomes: [
        { probability: 0.5, text: "Une peluche bascule dans la trappe. Le crime parfait. La girafe borgne est \xE0 vous.", statChanges: { mental: 6 }, itemGain: { id: "girafe-borgne", name: "Girafe borgne", emoji: "\u{1F992}", type: "junk", value: 4, effect: { mental: 6 } } },
        { probability: 0.5, text: "L'alarme antivol de la machine hurle. Une machine \xE0 peluches avec une alarme. Le monde n'a plus confiance en personne.", statChanges: { mental: -4, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-cinema-sauvage",
    title: "Le Cin\xE9ma Sauvage",
    type: "social",
    image: "/assets/exp-cinema-sauvage.webp",
    description: "Quelqu'un projette un vieux film sur le mur aveugle de l'immeuble d'en face. Des transats, un drap tendu, un chapeau pour la monnaie. Le quartier s'assoit.",
    choices: [
      { text: "S'installer et regarder", risk: "safe", emoji: "\u{1F3AC}", outcomes: [
        { probability: 0.7, text: "Un western en noir et blanc, du popcorn qui circule, la nuit douce. Pendant deux heures, tout le monde a le m\xEAme toit : aucun.", statChanges: { mental: 14, hunger: 6 } },
        { probability: 0.3, text: "La police fait \xE9teindre au moment du duel final. Le projectionniste promet la suite demain. Tout le quartier conna\xEEt d\xE9sormais votre frustration.", statChanges: { mental: 6 } }
      ] },
      { text: "Aider \xE0 tenir le drap-\xE9cran", risk: "safe", emoji: "\u{1F3AA}", outcomes: [
        { probability: 1, text: "Deux heures \xE0 tenir un coin de drap. Bras morts, mais place d'honneur et part du chapeau. Technicien du r\xEAve, c'est un m\xE9tier.", moneyChange: 3, statChanges: { mental: 10 }, respectChange: 2 }
      ] }
    ]
  },
  {
    id: "exp-carton-chatons",
    title: "Le Carton qui Miaule",
    type: "discovery",
    image: "/assets/exp-carton-chatons.webp",
    description: "Un carton scotch\xE9 miaule pr\xE8s des poubelles. \xC0 l'int\xE9rieur : trois chatons et un mot immonde : \xAB d\xE9brouillez-vous. \xBB Le monde, parfois.",
    choices: [
      { text: "Les porter \xE0 l'animalerie du coin", risk: "safe", emoji: "\u{1F3EA}", outcomes: [
        { probability: 0.7, text: "La g\xE9rante fond en larmes, adopte les trois, et vous remplit un sac de conserves \xAB pour le d\xE9rangement \xBB. Les h\xE9ros mangent des raviolis.", statChanges: { mental: 10, hunger: 15 }, respectChange: 3 },
        { probability: 0.3, text: "L'animalerie est compl\xE8te, mais la vieille dame du troisi\xE8me prend tout le monde. Vous, elle vous prend en affection. \xC7a compte double.", statChanges: { mental: 8 }, respectChange: 2 }
      ] },
      { text: "En garder un, donner les autres", risk: "normal", emoji: "\u{1F408}", outcomes: [
        { probability: 0.6, text: "Le plus teigneux reste avec vous une journ\xE9e enti\xE8re, perch\xE9 sur votre \xE9paule comme un pirate. Puis il choisit une boulang\xE8re. Tra\xEEtre, mais bon go\xFBt.", statChanges: { mental: 12 }, addFlag: "chaton-boulangere" },
        { probability: 0.4, text: "Le chaton pleure toute la nuit. Vous ne dormez pas, mais vous \xEAtes deux \xE0 ne pas dormir. C'est d\xE9j\xE0 de la compagnie.", statChanges: { mental: 6, sleep: -8 } }
      ] }
    ]
  },
  {
    id: "exp-escalator-panne",
    title: "L'Escalator en Panne",
    type: "narrative",
    image: "/assets/exp-escalator-panne.webp",
    description: "L'escalator du centre commercial est en panne. Une foule attend devant, immobile, que quelqu'un r\xE9pare des marches. Qui fonctionnent. En tant qu'escalier.",
    choices: [
      { text: "Montrer l'exemple en montant \xE0 pied", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 0.7, text: "Vous gravissez l'escalator fig\xE9 sous les regards m\xE9dus\xE9s. Un \xE0 un, ils suivent. Vous venez de r\xE9inventer l'escalier. Un ancien vous glisse une pi\xE8ce.", moneyChange: 2, statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.3, text: "Arriv\xE9 en haut, un vigile vous demande ce que vous \xAB comptez faire l\xE0 \xBB. Redescendre, du coup. Par l'escalator d'\xE0 c\xF4t\xE9. En panne aussi.", statChanges: { mental: 3, dignity: -2 } }
      ] },
      { text: "Proposer un \xAB service de portage \xBB", risk: "normal", emoji: "\u{1F6CD}\uFE0F", outcomes: [
        { probability: 0.6, text: "Trois cabas de courses mont\xE9s pour trois dames. Pourboires, remerciements, et un cake offert. L'\xE9conomie de l'escalator cass\xE9.", moneyChange: 5, statChanges: { hunger: 8, mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: "La s\xE9curit\xE9 estime que vous \xAB exploitez la situation \xBB. Vous, vous appelez \xE7a de l'initiative. D\xE9bat \xE9court\xE9, sortie accompagn\xE9e.", statChanges: { mental: -3, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-billet-envole",
    title: "Le Billet dans le Vent",
    type: "discovery",
    image: "/assets/exp-billet-envole.webp",
    description: "Un billet de dix euros danse dans le vent, \xE0 deux m\xE8tres du sol, ivre de libert\xE9. Toute la rue l'a vu. Toute la rue s'est arr\xEAt\xE9e.",
    choices: [
      { text: "Le prendre en chasse", risk: "normal", emoji: "\u{1F3C3}", outcomes: [
        { probability: 0.5, text: "Trois cents m\xE8tres de course, un plongeon dans un massif de lavande, mais il est \xE0 VOUS. La rue applaudit. Vous saluez.", moneyChange: 10, statChanges: { mental: 8, health: -3 } },
        { probability: 0.3, text: "Un gamin en trottinette vous double au sprint final. La jeunesse. Il partage quand m\xEAme : \xAB t'as bien couru, papy. \xBB", moneyChange: 3, statChanges: { mental: -2, dignity: -3 } },
        { probability: 0.2, text: "Le billet finit dans une bouche d'\xE9gout, avec un dernier fr\xE9tillement narquois. L'\xE9gout, d\xE9cid\xE9ment, gagne toujours.", statChanges: { mental: -5, health: -2 } }
      ] },
      { text: "Calculer sa trajectoire, en strat\xE8ge", risk: "normal", emoji: "\u{1F9E0}", outcomes: [
        { probability: 0.5, text: "Vous l'attendez au coin, bras tendu. Il se pose dans votre main comme un oiseau dress\xE9. Les badauds sont sid\xE9r\xE9s. Vous aussi, mais chut.", moneyChange: 10, statChanges: { mental: 10 }, respectChange: 2 },
        { probability: 0.5, text: "Le vent tourne. Le billet aussi. Votre embuscade est un \xE9chec tactique complet, observ\xE9 par au moins douze personnes.", statChanges: { mental: -4, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-camion-invendus",
    title: "Le Camion des Invendus",
    type: "discovery",
    image: "/assets/exp-camion-invendus.webp",
    description: "Derri\xE8re le supermarch\xE9, un camion charge les invendus \xAB pour destruction \xBB. Des palettes enti\xE8res de nourriture \xE0 peine p\xE9rim\xE9e, condamn\xE9es par des dates.",
    choices: [
      { text: "N\xE9gocier avec le chauffeur", risk: "normal", emoji: "\u{1F91D}", outcomes: [
        { probability: 0.6, text: "\xAB De toute fa\xE7on \xE7a part au broyeur... \xBB Il d\xE9tourne le regard le temps que vous remplissiez un sac. Un juste, ce chauffeur.", statChanges: { hunger: 25, mental: 6 }, itemGain: { id: "yaourts-condamnes", name: "Pack de yaourts graci\xE9s", emoji: "\u{1F95B}", type: "food", value: 4, effect: { hunger: 12 } } },
        { probability: 0.4, text: "\xAB Interdit. Tra\xE7abilit\xE9. \xBB Il jette des tonnes de nourriture devant vous en s'excusant du regard. Le syst\xE8me a des yeux tristes.", statChanges: { mental: -6 } }
      ] },
      { text: "Noter les horaires du camion", risk: "safe", emoji: "\u{1F4DD}", outcomes: [
        { probability: 1, text: "Mardi et vendredi, 7h40. Une information qui vaut de l'or, grav\xE9e dans votre m\xE9moire \xE0 c\xF4t\xE9 des choses importantes.", statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "exp-cirque-installation",
    title: "Le Cirque s'Installe",
    type: "social",
    image: "/assets/exp-cirque-installation.webp",
    description: "Un petit cirque familial monte son chapiteau sur le terrain vague. \xC7a manque de bras, \xE7a crie en trois langues, et un lama observe la sc\xE8ne, blas\xE9.",
    choices: [
      { text: "Aider au montage", risk: "normal", emoji: "\u{1F3AA}", outcomes: [
        { probability: 0.6, text: "Une journ\xE9e \xE0 tirer des c\xE2bles et planter des pieux. Pay\xE9 en esp\xE8ces, nourri \xE0 la roulotte, adoub\xE9 par le lama. Une grande journ\xE9e.", moneyChange: 8, statChanges: { hunger: 18, mental: 8, health: -4 } },
        { probability: 0.4, text: "Le chapiteau s'effondre une fois, doucement, comme un souffl\xE9. Personne ne sait si c'est votre pieu. Le doute vous ronge, le d\xEEner vous console.", statChanges: { hunger: 12, mental: -2 } }
      ] },
      { text: "Divertir la file d'attente le soir", risk: "normal", emoji: "\u{1F939}", outcomes: [
        { probability: 0.5, text: "Vos jongleries avec trois canettes chauffent le public mieux que le clown officiel. Le directeur vous glisse un billet \xAB d'artiste \xBB.", moneyChange: 6, statChanges: { mental: 8, dignity: 4 } },
        { probability: 0.5, text: "Le clown officiel d\xE9fend son territoire. Une dispute entre un clown et vous, devant des enfants. Personne n'en sort grandi.", statChanges: { mental: -4, dignity: -4 } }
      ] }
    ]
  },
  {
    id: "exp-horodateur",
    title: "L'Horodateur Fou",
    type: "discovery",
    image: "/assets/exp-horodateur.webp",
    description: "Un horodateur imprime des tickets en continu, dans le vide, avec un petit bruit joyeux. Un automobiliste vient d'y renoncer, furieux.",
    choices: [
      { text: "Revendre des tickets aux automobilistes", risk: "risky", emoji: "\u{1F3AB}", outcomes: [
        { probability: 0.5, text: "Les tickets sont VALIDES. Vous les vendez \xE0 moiti\xE9 prix aux conducteurs ravis. L'horodateur imprime, vous encaissez. Une fintech est n\xE9e.", moneyChange: 8, statChanges: { mental: 6 } },
        { probability: 0.5, text: "Une contractuelle vous observe depuis dix minutes. Les tickets sont valides, votre commerce beaucoup moins. Elle confisque le fonds de caisse.", moneyChange: 1, statChanges: { mental: -4, dignity: -3 }, addFlag: "reperee-contractuelle" }
      ] },
      { text: "Pr\xE9venir la mairie, en bon citoyen", risk: "safe", emoji: "\u{1F4DE}", outcomes: [
        { probability: 0.6, text: "L'agent municipal arrive, constate, rigole, et vous laisse \xAB les tickets du sinistre \xBB : le rouleau entier. \xC7a fera de l'allume-feu de luxe.", statChanges: { mental: 4 }, itemGain: { id: "rouleau-tickets", name: "Rouleau de tickets", emoji: "\u{1F9FE}", type: "junk", value: 2 } },
        { probability: 0.4, text: "Le standard vous fait r\xE9p\xE9ter trois fois \xAB l'horodateur rit tout seul \xBB. On vous raccroche au nez. La R\xE9publique doute de vous.", statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "exp-depot-vente",
    title: "Les Bacs du D\xE9p\xF4t-Vente",
    type: "discovery",
    image: "/assets/exp-depot-vente.webp",
    description: "Le d\xE9p\xF4t-vente sort ses bacs \xAB tout \xE0 1\u20AC \xBB sur le trottoir. La g\xE9rante pr\xE9cise : \xAB et ce qui reste ce soir, c'est gratuit. \xBB Le soir, c'est dans dix heures.",
    choices: [
      { text: "Fouiller les bacs maintenant", risk: "normal", emoji: "\u{1F9E5}", outcomes: [
        { probability: 0.6, text: "Une veste en velours c\xF4tel\xE9, \xE0 peine \xE9lim\xE9e, exactement votre taille. Le destin a parfois du go\xFBt.", moneyChange: -1, statChanges: { dignity: 8, mental: 6 }, itemGain: { id: "veste-velours", name: "Veste en velours", emoji: "\u{1F9E5}", type: "armor", value: 6, defenseBonus: 1 } },
        { probability: 0.4, text: "Que des chargeurs Nokia et des VHS de fitness. Vous prenez une VHS. On ne sait jamais. Si, on sait. Mais quand m\xEAme.", moneyChange: -1, statChanges: { mental: 2 }, itemGain: { id: "vhs-fitness", name: "VHS \xAB Gym Tonic \xBB", emoji: "\u{1F4FC}", type: "junk", value: 1 } }
      ] },
      { text: "Revenir ce soir pour le gratuit", risk: "normal", emoji: "\u{1F319}", outcomes: [
        { probability: 0.5, text: "Il reste l'essentiel : un pull, une casserole, un parapluie qui s'ouvre presque. Le tout gratuit, comme promis. Parole de g\xE9rante.", statChanges: { mental: 6, dignity: 3 }, itemGain: { id: "casserole-depot", name: "Casserole vaillante", emoji: "\u{1F373}", type: "tool", value: 4 } },
        { probability: 0.5, text: "Tout est parti. Le quartier entier avait entendu \xAB gratuit \xBB. Il reste un cintre. Vous prenez le cintre. Par principe.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-serrurier",
    title: "Le Serrurier P\xE9dagogue",
    type: "social",
    image: "/assets/exp-serrurier.webp",
    description: "Un serrurier forme son apprenti sur une porte coch\xE8re. L'apprenti transpire. Le serrurier soupire. La serrure, elle, r\xE9siste aux deux.",
    choices: [
      { text: "Observer et apprendre", risk: "safe", emoji: "\u{1F440}", outcomes: [
        { probability: 0.7, text: "Deux heures de masterclass gratuite sur les gorges et les p\xEAnes. Une comp\xE9tence discr\xE8te mais pr\xE9cieuse s'installe dans un coin de votre t\xEAte.", statChanges: { mental: 8 } },
        { probability: 0.3, text: "Le serrurier vous rep\xE8re : \xAB toi, t'as des yeux qui apprennent trop vite. \xBB Compliment ou accusation, il vous offre le caf\xE9 dans le doute.", statChanges: { thirst: 8, mental: 5 } }
      ] },
      { text: "Sugg\xE9rer un truc de la rue", risk: "normal", emoji: "\u{1F4A1}", outcomes: [
        { probability: 0.5, text: "Votre astuce \xE0 la radio m\xE9dicale fonctionne. Le serrurier, vex\xE9 et admiratif, vous paie \xAB la consultation \xBB. L'apprenti vous v\xE9n\xE8re.", moneyChange: 6, respectChange: 2, statChanges: { mental: 6 } },
        { probability: 0.5, text: "\xAB Et tu sais \xE7a d'o\xF9, toi ? \xBB Question pi\xE8ge. Votre silence est \xE9loquent. Ils changent la serrure enti\xE8re, en vous surveillant.", statChanges: { mental: -3, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "exp-joueur-echecs",
    title: "Le Joueur d'\xC9checs",
    type: "social",
    image: "/assets/exp-joueur-echecs.webp",
    description: "Dans le parc, un vieux monsieur joue aux \xE9checs contre personne depuis des ann\xE9es. Aujourd'hui, il a sorti deux chaises.",
    choices: [
      { text: "S'asseoir et jouer", risk: "safe", emoji: "\u265F\uFE0F", outcomes: [
        { probability: 0.6, text: "Il vous bat en douze coups, trois parties de suite, avec une joie f\xE9roce. Puis il partage son thermos et ses madeleines. Rituel adopt\xE9.", statChanges: { mental: 12, thirst: 6, hunger: 6 } },
        { probability: 0.4, text: "Vous gagnez une partie. Le silence dure une minute enti\xE8re. Puis : \xAB revenez demain. \xBB C'est la plus belle victoire de votre ann\xE9e.", statChanges: { mental: 15, dignity: 5 }, respectChange: 2, addFlag: "rival-echecs" }
      ] },
      { text: "Parier une pi\xE8ce sur la partie", risk: "risky", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.4, text: "D\xE9faite h\xE9ro\xEFque mais honorable. Il refuse votre pi\xE8ce : \xAB on ne prend pas l'argent d'un joueur courageux. \xBB Et double la mise en madeleines.", statChanges: { hunger: 10, mental: 8 } },
        { probability: 0.6, text: "Massacre en huit coups. Il empoche votre pi\xE8ce avec une \xE9l\xE9gance de croupier. \xAB Les \xE9checs, c'est la vie. \xBB Merci, \xE7a vous saviez.", moneyChange: -1, statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-poissonnier",
    title: "La Fin du March\xE9 aux Poissons",
    type: "discovery",
    image: "/assets/exp-poissonnier.webp",
    description: "Le poissonnier remballe en gueulant contre la mar\xE9e, la mairie et le mois d'ao\xFBt. Sur l'\xE9tal fondent les derni\xE8res glaces, et trois maquereaux invendus.",
    choices: [
      { text: "Proposer d'aider \xE0 remballer", risk: "safe", emoji: "\u{1F41F}", outcomes: [
        { probability: 0.7, text: "Une heure de caisses et d'eau glac\xE9e. Salaire : les trois maquereaux et un cours magistral sur la fra\xEEcheur. Vous puez, mais vous d\xEEnez.", statChanges: { hunger: 20, dignity: -3, mental: 5 } },
        { probability: 0.3, text: "Il gueule aussi sur vous, par habitude, puis s'excuse avec une barquette de crevettes. Le c\u0153ur des poissonniers est un myst\xE8re iod\xE9.", statChanges: { hunger: 14, mental: 4 } }
      ] },
      { text: "Demander juste la glace pil\xE9e", risk: "normal", emoji: "\u{1F9CA}", outcomes: [
        { probability: 0.6, text: "\xAB La glace ? Prends tout. \xBB Un sac entier de fra\xEEcheur : de quoi garder vos trouvailles au frais deux jours. Le luxe logistique.", statChanges: { mental: 4, thirst: 8 } },
        { probability: 0.4, text: "\xAB La glace, elle est \xE0 la mar\xE9e. \xBB R\xE9ponse myst\xE9rieuse et d\xE9finitive. Le folklore maritime a ses r\xE8gles.", statChanges: { mental: -1 } }
      ] }
    ]
  },
  {
    id: "exp-bus-touristique",
    title: "Le Bus de Touristes \xC9gar\xE9",
    type: "social",
    image: "/assets/exp-bus-touristique.webp",
    description: "Un bus \xE0 imp\xE9riale plein de touristes s'est \xE9gar\xE9 dans la zone industrielle. Le guide, paniqu\xE9, improvise : \xAB ... et ici, le quartier authentique ! \xBB",
    choices: [
      { text: "Jouer l'attraction locale", risk: "normal", emoji: "\u{1F3AD}", outcomes: [
        { probability: 0.6, text: "Vous racontez trois anecdotes invent\xE9es sur \xAB l'usine hant\xE9e \xBB. Les appareils photo cr\xE9pitent, les pi\xE8ces pleuvent du deuxi\xE8me \xE9tage.", moneyChange: 7, statChanges: { mental: 8, dignity: -2 } },
        { probability: 0.4, text: "Un touriste vous demande un selfie \xAB avec le vrai local \xBB. Vous posez. Vous \xEAtes d\xE9sormais sur douze r\xE9seaux sociaux, l\xE9gend\xE9 \xAB authentic \xBB.", moneyChange: 3, statChanges: { dignity: -5, mental: 3 } }
      ] },
      { text: "Remettre le chauffeur sur la bonne route", risk: "safe", emoji: "\u{1F5FA}\uFE0F", outcomes: [
        { probability: 0.7, text: "Le guide, sauv\xE9, fait la qu\xEAte dans le bus \xAB pour le guide local \xBB. Un chapeau qui redescend plein. Le tourisme, \xE7a paie.", moneyChange: 6, respectChange: 2 },
        { probability: 0.3, text: "Le chauffeur suit vos indications... et se perd davantage. Vous montez \xE0 bord pour guider en direct. Visite improvis\xE9e, pourboire m\xE9rit\xE9.", moneyChange: 4, statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "exp-antiquaire-cave",
    title: "La Cave de l'Antiquaire",
    type: "discovery",
    image: "/assets/exp-antiquaire-cave.webp",
    description: "L'antiquaire vide sa cave sur le trottoir : \xAB je prends ma retraite, tout doit dispara\xEEtre. \xBB Il y a un scaphandre. Personne ne demande pourquoi.",
    choices: [
      { text: "Aider au tri contre r\xE9mun\xE9ration", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Vous remontez quarante ans de brocante. Il vous paie, vous raconte chaque objet, et vous offre une boussole \xAB pour retrouver votre nord \xBB.", moneyChange: 7, statChanges: { mental: 8 }, itemGain: { id: "boussole-laiton", name: "Boussole en laiton", emoji: "\u{1F9ED}", type: "junk", value: 7, effect: { mental: 5 } } },
        { probability: 0.3, text: "La cave n'a pas de fin. \xC0 18h, vous \xEAtes toujours dedans. Il vous paie double et jure qu'il ne descendra plus jamais. Vous non plus.", moneyChange: 10, statChanges: { health: -4, mental: 3 } }
      ] },
      { text: "Marchander le scaphandre", risk: "risky", emoji: "\u{1F93F}", outcomes: [
        { probability: 0.4, text: "Il vous le DONNE, les larmes aux yeux : \xAB il attendait quelqu'un comme vous. \xBB Le brocanteur louche vous le rach\xE8te une fortune le soir m\xEAme.", moneyChange: 12, statChanges: { mental: 6 } },
        { probability: 0.6, text: "\xAB Le scaphandre ? Jamais. \xBB Il le remporte chez lui, sous le bras. Certains liens ne s'expliquent pas.", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "exp-arbres-fruitiers",
    title: "Les Arbres de la Ville",
    type: "discovery",
    image: "/assets/exp-arbres-fruitiers.webp",
    description: "Les pommiers \xAB d\xE9coratifs \xBB plant\xE9s par la mairie croulent sous les fruits. Personne n'y touche : les gens croient que c'est du plastique. C'est des pommes.",
    choices: [
      { text: "Faire la r\xE9colte \xE0 mains nues", risk: "safe", emoji: "\u{1F34E}", outcomes: [
        { probability: 0.8, text: "Deux kilos de pommes municipales, sucr\xE9es comme un secret bien gard\xE9. Vous croquez la premi\xE8re devant un passant sid\xE9r\xE9 : \xAB ah, c'est des vraies ?! \xBB", statChanges: { hunger: 20, mental: 6 }, itemGain: { id: "pommes-mairie", name: "Pommes municipales", emoji: "\u{1F34E}", type: "food", value: 3, effect: { hunger: 12 } } },
        { probability: 0.2, text: "Un agent des espaces verts vous observe... puis vous tend un sac : \xAB au moins toi tu gaspilles pas. \xBB La complicit\xE9 des gens de terrain.", statChanges: { hunger: 22, mental: 5 }, respectChange: 1 }
      ] },
      { text: "Grimper pour les plus hautes", risk: "risky", emoji: "\u{1F9D7}", outcomes: [
        { probability: 0.5, text: "Les pommes du sommet, gorg\xE9es de soleil, valent l'escalade. Vous redescendez en h\xE9ros du verger urbain, les poches pleines.", statChanges: { hunger: 25, mental: 8 } },
        { probability: 0.5, text: "La branche d\xE9corative c\xE8de. Vous atterrissez dans le massif d\xE9coratif. Douleur non d\xE9corative.", statChanges: { health: -8, dignity: -4, hunger: 5 } }
      ] }
    ]
  },
  {
    id: "exp-etudiants-sociologie",
    title: "Les \xC9tudiants en Sociologie",
    type: "social",
    image: "/assets/exp-etudiants-sociologie.webp",
    description: "Deux \xE9tudiants en sociologie vous abordent avec un dictaphone et des mots compliqu\xE9s : ils font un m\xE9moire sur \xAB l'habiter pr\xE9caire \xBB. C'est vous, l'habiter pr\xE9caire.",
    choices: [
      { text: "R\xE9pondre \xE0 l'entretien", risk: "safe", emoji: "\u{1F399}\uFE0F", outcomes: [
        { probability: 0.6, text: "Deux heures d'entretien \xAB semi-directif \xBB. Ils paient en sandwich, caf\xE9 et g\xEAne polie. Votre vie devient une note de bas de page. Elle m\xE9ritait mieux.", statChanges: { hunger: 12, thirst: 8, mental: 5 }, moneyChange: 2 },
        { probability: 0.4, text: "Vous inventez la moiti\xE9 de vos r\xE9ponses pour voir. Ils notent tout avec gravit\xE9. La science sociale encaisse le choc sans broncher.", statChanges: { mental: 8 } }
      ] },
      { text: "Renverser l'entretien", risk: "normal", emoji: "\u{1F504}", outcomes: [
        { probability: 0.6, text: "Vous les interrogez sur LEUR pr\xE9carit\xE9 : loyers, stages, avenir. \xC0 la fin, l'un des deux pleure presque. Ils vous laissent leurs viennoiseries.", statChanges: { hunger: 10, mental: 8 }, respectChange: 1 },
        { probability: 0.4, text: "\xAB C'est pas le protocole. \xBB Le protocole. Vous \xEAtes face au protocole. L'entretien s'arr\xEAte, la viennoiserie reste. Victoire partielle.", statChanges: { hunger: 6, mental: 2 } }
      ] }
    ]
  },
  {
    id: "exp-chien-perdu",
    title: "Le Chien \xE0 R\xE9compense",
    type: "discovery",
    image: "/assets/exp-chien-perdu.webp",
    description: "Un carlin asthmatique erre, m\xE9daille au cou : \xAB Je m'appelle Churchill. Si perdu, GROSSE r\xE9compense. \xBB Churchill vous regarde. Vous regardez Churchill.",
    choices: [
      { text: "Ramener Churchill chez lui", risk: "safe", emoji: "\u{1F436}", outcomes: [
        { probability: 0.7, text: "La propri\xE9taire pleure sur son paillasson en marbre. La \xAB grosse r\xE9compense \xBB est r\xE9elle. Churchill, lui, semble d\xE9\xE7u de rentrer.", moneyChange: 15, respectChange: 2, statChanges: { mental: 6 } },
        { probability: 0.3, text: "Adresse introuvable, mais le v\xE9t\xE9rinaire scanne sa puce et pr\xE9vient la famille. On vous remet \xAB la commission du samaritain \xBB. Churchill ronfle d\xE9j\xE0.", moneyChange: 6, statChanges: { mental: 5 } }
      ] },
      { text: "Passer d'abord une journ\xE9e avec lui", risk: "normal", emoji: "\u{1F32D}", outcomes: [
        { probability: 0.6, text: "Churchill et vous partagez un hot-dog et un banc. Les passants donnent plus \xE0 un duo. Le soir, vous le ramenez, riches tous les deux.", moneyChange: 9, statChanges: { mental: 12 } },
        { probability: 0.4, text: "Churchill fugue AUSSI de chez vous. Ce chien fuit tout le monde. Vous le retrouvez chez la propri\xE9taire, qui vous soup\xE7onne vaguement.", moneyChange: 3, statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "exp-recycleur-metaux",
    title: "Le Roi du Cuivre",
    type: "social",
    image: "/assets/exp-recycleur-metaux.webp",
    description: "Un ferrailleur charge sa camionnette de m\xE9taux glan\xE9s. Il soup\xE8se chaque pi\xE8ce comme un bijoutier. \xAB Le cuivre, petit, c'est l'or du pauvre. \xBB",
    choices: [
      { text: "\xC9couter la le\xE7on de ferraille", risk: "safe", emoji: "\u{1F393}", outcomes: [
        { probability: 0.7, text: "Une heure de masterclass : o\xF9 chercher, quoi laisser, qui paie comptant. Il vous offre votre premier kilo de cuivre \xAB pour d\xE9marrer \xBB.", moneyChange: 4, statChanges: { mental: 8 } },
        { probability: 0.3, text: "La le\xE7on d\xE9rive sur sa belle-s\u0153ur, la CAF et un diff\xE9rend de 1998. Passionnant autrement. Il vous paie le caf\xE9 de la digression.", statChanges: { thirst: 8, mental: 4 } }
      ] },
      { text: "Lui vendre vos trouvailles en vrac", risk: "normal", emoji: "\u2696\uFE0F", outcomes: [
        { probability: 0.6, text: "Sa balance est honn\xEAte, chose rare. Vos fonds de sac deviennent des pi\xE8ces sonnantes. Il ajoute un \xAB bonus fid\xE9lit\xE9 \xBB. Vous reviendrez.", moneyChange: 7, respectChange: 1 },
        { probability: 0.4, text: "\xAB \xC7a, c'est de l'alu peint, pas du cuivre. \xBB Il a l'\u0153il, vous avez la na\xEFvet\xE9. Il paie quand m\xEAme le tarif alu, sans se moquer. Un seigneur.", moneyChange: 2, statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "exp-buffet-seminaire",
    title: "Le Buffet du S\xE9minaire",
    type: "discovery",
    image: "/assets/exp-buffet-seminaire.webp",
    description: "Par la baie vitr\xE9e de l'h\xF4tel d'affaires : un s\xE9minaire \xAB Excellence & Leadership \xBB vient de finir. Le buffet, intact, attend les serveurs. Les leaders n'avaient pas faim.",
    choices: [
      { text: "Entrer d'un pas de consultant", risk: "risky", emoji: "\u{1F4BC}", outcomes: [
        { probability: 0.5, text: "Badge imaginaire, regard occup\xE9, assiette pleine. Vous mangez des mini-quiches d'excellence en hochant la t\xEAte devant un paperboard. Personne ne doute.", statChanges: { hunger: 28, thirst: 12, mental: 8, dignity: 4 } },
        { probability: 0.5, text: "Le responsable s\xE9minaire vous demande votre soci\xE9t\xE9. \xAB Consulting ind\xE9pendant \xBB ne suffit pas. Sortie escort\xE9e, mais avec un wrap dans la manche.", statChanges: { hunger: 8, dignity: -5, mental: -3 } }
      ] },
      { text: "Attendre les serveurs et demander poliment", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.7, text: "Le ma\xEEtre d'h\xF4tel remplit deux barquettes : \xAB de toute fa\xE7on, la direction jette tout. \xBB L'excellence finit dans votre sac. Le leadership aussi.", statChanges: { hunger: 22, thirst: 8, mental: 5 } },
        { probability: 0.3, text: "\xAB C'est contre les normes. \xBB Les mini-quiches partent \xE0 la benne sous vos yeux. Vous et le serveur partagez un long regard de d\xE9faite.", statChanges: { mental: -4, hunger: 2 } }
      ] }
    ]
  },
  {
    id: "exp-lampadaire-morse",
    title: "Le Lampadaire qui Clignote",
    type: "narrative",
    image: "/assets/exp-lampadaire-morse.webp",
    description: "Le lampadaire du coin clignote depuis des semaines. Cette nuit, vous en \xEAtes s\xFBr : c'est du morse. Court-court-long. Quelqu'un doute de votre sant\xE9 mentale. Vous, un peu.",
    choices: [
      { text: "D\xE9coder le message", risk: "normal", emoji: "\u{1F4A1}", outcomes: [
        { probability: 0.5, text: "Trois heures d'observation : \xE7a \xE9pelle \xAB U-N-T-O-I-T \xBB. Un toit. Le lampadaire vous promet un toit, ou l'\xE9lectricit\xE9 municipale a de l'humour. Vous choisissez d'y croire.", statChanges: { mental: 10, sleep: -4 } },
        { probability: 0.3, text: "\xC7a n'\xE9pelle rien. C'est un condensateur fatigu\xE9, comme vous. Mais vous avez pass\xE9 la nuit avec une \xE9nigme, et c'est mieux que sans.", statChanges: { mental: 4, sleep: -5 } },
        { probability: 0.2, text: "Un \xE9lectricien de nuit s'arr\xEAte : \xAB vous aussi vous l'avez remarqu\xE9 ?! \xBB Vous n'\xEAtes pas fou, ou alors \xE0 deux. Il paie le caf\xE9 de la confr\xE9rie.", statChanges: { thirst: 8, mental: 8 } }
      ] },
      { text: "R\xE9pondre en morse avec votre briquet", risk: "safe", emoji: "\u{1F526}", outcomes: [
        { probability: 1, text: "Vous clignotez \xAB MERCI \xBB vers le lampadaire. Il clignote toujours pareil. Les grandes amiti\xE9s sont souvent \xE0 sens unique.", statChanges: { mental: 6 } }
      ] }
    ]
  }
];

// client/src/contexts/data/events2-rest.ts
var REST_EVENTS_2 = [
  {
    id: "rest-salle-attente",
    title: "La Salle d'Attente",
    type: "narrative",
    image: "/assets/rest-salle-attente.webp",
    description: "Les urgences sont ouvertes toute la nuit, et personne ne demande rien \xE0 celui qui attend. Vous \xEAtes tr\xE8s dou\xE9 pour attendre.",
    choices: [
      { text: "S'installer avec un vieux magazine", risk: "safe", emoji: "\u{1FA91}", outcomes: [
        { probability: 0.7, text: "Chauffage, distributeur, paix. Vous dormez assis, un \xAB Paris Match \xBB de 2016 sur les genoux. Personne ne vous r\xE9veille : vous avez l'air d'attendre des nouvelles.", statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: "\xC0 4h, un infirmier vous secoue doucement : \xAB on ferme pas, mais bougez un peu. \xBB Il glisse une brique de jus dans votre poche. Le personnel de nuit sait.", statChanges: { sleep: 12, thirst: 8, mental: 4 } }
      ] },
      { text: "Simuler une entorse pour un lit", risk: "risky", emoji: "\u{1F6CF}\uFE0F", outcomes: [
        { probability: 0.4, text: "Un brancard dans un couloir ti\xE8de. Techniquement un lit, techniquement un mensonge, mais quel sommeil.", statChanges: { sleep: 30, health: 5 } },
        { probability: 0.6, text: "L'interne de garde vous ausculte trente secondes : \xAB les lits, c'est pour les cass\xE9s. Le caf\xE9, c'est offert. \xBB Diagnostic sans appel, caf\xE9 correct.", statChanges: { dignity: -6, sleep: 6, thirst: 6, mental: -3 } }
      ] }
    ]
  },
  {
    id: "rest-cinema-permanent",
    title: "La Nuit des Nanars",
    type: "narrative",
    image: "/assets/rest-cinema-permanent.webp",
    description: "Le cin\xE9ma du quartier programme une nuit \xAB nanars cultes \xBB. Le caissier somnole d\xE9j\xE0. Trois films, une salle chauff\xE9e, des fauteuils profonds.",
    choices: [
      { text: "Se glisser dans la salle", risk: "normal", emoji: "\u{1F3AC}", outcomes: [
        { probability: 0.6, text: "Vous dormez \xE0 travers trois chefs-d'\u0153uvre du mauvais go\xFBt. Les explosions font office de berceuse. R\xE9veil au g\xE9n\xE9rique, repos\xE9 et culturellement enrichi.", statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.4, text: "Expuls\xE9 au deuxi\xE8me film \u2014 mais QUEL film. Un requin-tornade contre des cosmonautes. \xC7a valait la sortie escort\xE9e.", statChanges: { sleep: 8, mental: 3, dignity: -3 } }
      ] },
      { text: "Fouiller sous les si\xE8ges d'abord", risk: "normal", emoji: "\u{1F37F}", outcomes: [
        { probability: 0.5, text: "R\xE9colte : un demi-paquet de popcorn, de la monnaie tomb\xE9e et un gant. Puis dodo au fond de la salle. La totale.", statChanges: { hunger: 10, sleep: 10 }, moneyChange: 3 },
        { probability: 0.5, text: "Un chewing-gum mill\xE9sim\xE9 s'attache \xE0 votre manche pour la vie. Vous dormez quand m\xEAme. Lui aussi.", statChanges: { dignity: -3, sleep: 10 } }
      ] }
    ]
  },
  {
    id: "rest-confessionnal",
    title: "Le Confessionnal",
    type: "narrative",
    image: "/assets/rest-confessionnal.webp",
    description: "L'\xE9glise reste ouverte. Le confessionnal est capitonn\xE9, \xE0 taille humaine, et \xE9tonnamment douillet. Dieu ne ronfle pas, lui.",
    choices: [
      { text: "Y dormir humblement", risk: "normal", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.6, text: "Nuit de velours et d'encens. Vous dormez comme un secret bien gard\xE9. Au r\xE9veil, quelqu'un a laiss\xE9 un cierge allum\xE9 pour vous. Ou pour quelqu'un. Pour vous, d\xE9cidons.", statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.4, text: "Le cur\xE9 du matin ouvre la grille et attend. \xC0 moiti\xE9 endormi, vous confessez des choses. Notamment le sandwich de mardi. Il vous absout et vous paie un caf\xE9.", statChanges: { sleep: 15, mental: -2, dignity: -3, thirst: 6 }, respectChange: 1 }
      ] },
      { text: "Rester sur un banc, plus honn\xEAte", risk: "safe", emoji: "\u26EA", outcomes: [
        { probability: 1, text: "Le bois est dur mais le silence est doux. Les vitraux vous fabriquent des r\xEAves color\xE9s.", statChanges: { sleep: 12, mental: 5 } }
      ] }
    ]
  },
  {
    id: "rest-bus-nuit",
    title: "Le Bus de Nuit",
    type: "narrative",
    image: "/assets/rest-bus-nuit.webp",
    description: "La ligne N12 tourne en boucle jusqu'\xE0 l'aube. Chauffage poussif, ronron du moteur, banquette du fond libre. Le grand tour de la ville pour le prix d'un regard entendu.",
    choices: [
      { text: "Faire la boucle compl\xE8te", risk: "safe", emoji: "\u{1F68C}", outcomes: [
        { probability: 0.7, text: "Le chauffeur vous a vu, a hoch\xE9 la t\xEAte, et n'a rien dit. Quatre boucles plus tard, il annonce \xAB terminus, l'ami \xBB avec une douceur de r\xE9veil-matin humain.", statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: "Un contr\xF4leur monte \xE0 3h. Vous n'avez pas de titre de transport. Il regarde vos chaussures, soupire : \xAB cette nuit c'est gratuit, mais r\xEAve ailleurs demain. \xBB Un po\xE8te.", statChanges: { sleep: 12, mental: 6 } }
      ] },
      { text: "S'endormir sans se fixer de terminus", risk: "risky", emoji: "\u{1F634}", outcomes: [
        { probability: 0.5, text: "Vous vous r\xE9veillez au d\xE9p\xF4t, \xE0 huit kilom\xE8tres, frais comme un gardon. Un gardon \xE0 huit kilom\xE8tres de son carton, mais frais.", statChanges: { sleep: 25, mental: -4 } },
        { probability: 0.5, text: "Un enterrement de vie de gar\xE7on envahit le bus \xE0 2h. Ils chantent faux, mais ils paient votre \xAB p\xE9age de banquette \xBB en pi\xE8ces et en chips.", statChanges: { sleep: 6, hunger: 8 }, moneyChange: 2 }
      ] }
    ]
  },
  {
    id: "rest-showroom-matelas",
    title: "Le Magasin de Literie",
    type: "narrative",
    image: "/assets/rest-showroom-matelas.webp",
    description: "\xAB Essayez nos matelas, sans engagement ! \xBB claironne le vendeur. Sans engagement. Il ne sait pas \xE0 qui il parle.",
    choices: [
      { text: "Essayer TR\xC8S consciencieusement", risk: "normal", emoji: "\u{1F6CF}\uFE0F", outcomes: [
        { probability: 0.5, text: "Vingt minutes de m\xE9moire de forme avant le toussotement poli du vendeur. Votre dos se souviendra de ce matelas toute sa vie. C'est \xE7a, la m\xE9moire de forme.", statChanges: { sleep: 16, mental: 8, dignity: -2 } },
        { probability: 0.5, text: "Vous sombrez pour de bon. Un enfant vous prend en photo, le vendeur appelle son manager, le manager n'ose pas vous r\xE9veiller. Vous partez seul, repos\xE9, mythique.", statChanges: { sleep: 18, dignity: -6, mental: 4 } }
      ] },
      { text: "Demander le mod\xE8le d'expo d\xE9class\xE9", risk: "risky", emoji: "\u{1F4AC}", outcomes: [
        { probability: 0.4, text: "Le vendeur, un ancien de la rue lui aussi, vous donne un surmatelas \xAB tach\xE9 invendable \xBB. La tache est une l\xE9gende. Le confort est r\xE9el.", statChanges: { sleep: 10, mental: 10 }, respectChange: 1 },
        { probability: 0.6, text: "\xAB Monsieur, ici on VEND du sommeil. \xBB Vous, vous en cherchez juste. Vous sortez avant qu'il appelle quelqu'un.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "rest-carton-frigo",
    title: "Le Carton du Frigo Am\xE9ricain",
    type: "discovery",
    image: "/assets/rest-carton-frigo.webp",
    description: "La boutique d'\xE9lectrom\xE9nager jette LE carton : celui d'un frigo am\xE9ricain double porte. Double \xE9paisseur, taille XXL, \xE0 peine humide. Le penthouse du carton.",
    choices: [
      { text: "L'am\xE9nager en suite royale", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.8, text: "Porte d\xE9coup\xE9e, rabats en auvent, journal en isolation. La meilleure nuit du mois, dans un palace qui sent le polystyr\xE8ne neuf.", statChanges: { sleep: 22, mental: 10, dignity: 4 } },
        { probability: 0.2, text: "Un autre connaisseur arrive avec les m\xEAmes intentions. N\xE9gociation d'experts : il prend le carton du lave-linge, vous gardez le frigo. La hi\xE9rarchie est respect\xE9e.", statChanges: { sleep: 14, mental: 4 }, respectChange: 2 }
      ] },
      { text: "Le revendre \xE0 un \xE9tudiant qui d\xE9m\xE9nage", risk: "normal", emoji: "\u{1F4B6}", outcomes: [
        { probability: 0.6, text: "L'\xE9tudiant paie cash pour \xAB le carton parfait \xBB. Vous dormez \xE0 la dure, avec des pi\xE8ces qui tintent \xE0 chaque fois que vous vous retournez.", moneyChange: 5, statChanges: { sleep: 4, mental: 3 } },
        { probability: 0.4, text: "Il paie en pi\xE8ces rouges et en gratitude. Compter les centimes prend plus de temps que la vente. La nuit est courte et le carton est parti.", moneyChange: 2, statChanges: { sleep: 4, mental: -2 } }
      ] }
    ]
  },
  {
    id: "rest-hall-code",
    title: "Le Hall au Code Pr\xE9visible",
    type: "narrative",
    image: "/assets/rest-hall-code.webp",
    description: "Le code de l'immeuble est \xE9crit au feutre sur le mur d'\xE0 c\xF4t\xE9 : \xAB 1234 \xBB. Les gens sont pr\xE9visibles. Le radiateur du hall, lui, est une valeur s\xFBre.",
    choices: [
      { text: "Dormir sous les bo\xEEtes aux lettres", risk: "normal", emoji: "\u{1F3E2}", outcomes: [
        { probability: 0.6, text: "Radiateur, moquette, veilleuse. Le luxe discret d'un trois \xE9toiles vertical. Vous partez avant le premier travailleur, comme un gentleman cambrioleur du sommeil.", statChanges: { sleep: 18, health: 3 } },
        { probability: 0.4, text: "La femme de m\xE9nage de 6h vous d\xE9loge \xE0 la serpilli\xE8re, gentiment mais fermement. Elle vous laisse finir votre r\xEAve debout, dans l'encadrement.", statChanges: { sleep: 10, dignity: -3 } }
      ] },
      { text: "Monter au dernier palier", risk: "risky", emoji: "\u2B06\uFE0F", outcomes: [
        { probability: 0.5, text: "Sixi\xE8me \xE9tage, personne n'y passe jamais. Une lucarne, les \xE9toiles, le silence. La chambre avec vue la moins ch\xE8re de la ville.", statChanges: { sleep: 24, mental: 5 } },
        { probability: 0.5, text: "Un locataire insomniaque appelle \xAB la s\xE9curit\xE9 \xBB : son beau-fr\xE8re, qui descend en pyjama. La discussion en pyjama \xE0 3h a une dignit\xE9 tr\xE8s relative, pour tout le monde.", statChanges: { sleep: 6, mental: -4, health: -2 } }
      ] }
    ]
  },
  {
    id: "rest-serre-tropicale",
    title: "La Serre Tropicale",
    type: "discovery",
    image: "/assets/rest-serre-tropicale.webp",
    description: "La serre du jardin botanique ferme mal. \xC0 l'int\xE9rieur : 26 degr\xE9s toute l'ann\xE9e, hygrom\xE9trie parfaite, et un perroquet qui a tout vu.",
    choices: [
      { text: "Nuit sous les palmiers", risk: "normal", emoji: "\u{1F334}", outcomes: [
        { probability: 0.6, text: "Vous dormez dans un climat de carte postale, berc\xE9 par le goutte-\xE0-goutte automatique. Vous r\xEAvez de plage. Le r\xE9veil est rude mais bronz\xE9 de l'\xE2me.", statChanges: { sleep: 22, mental: 10, health: 3 } },
        { probability: 0.4, text: "Le perroquet r\xE9p\xE8te vos paroles de sommeil au gardien du matin : \xAB ENCORE CINQ MINUTES. ENCORE CINQ MINUTES. \xBB Trahison \xE0 plumes. Le gardien rit trop pour s\xE9vir.", statChanges: { sleep: 15, dignity: -4, mental: 4 } }
      ] },
      { text: "Trop beau pour \xEAtre vrai, repartir", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Vous refermez la porte sur l'\xE9t\xE9 perp\xE9tuel. Certains paradis sont des pi\xE8ges. D'autres ont juste un perroquet.", statChanges: { sleep: 6, mental: 2 } }
      ] }
    ]
  },
  {
    id: "rest-peniche",
    title: "La P\xE9niche Amarr\xE9e",
    type: "discovery",
    image: "/assets/rest-peniche.webp",
    description: "Une p\xE9niche de chantier hiverne le long du quai. Pont b\xE2ch\xE9, cale s\xE8che, clapotis en fond sonore. L'appel du large, version canal.",
    choices: [
      { text: "Dormir dans la cale", risk: "risky", emoji: "\u2693", outcomes: [
        { probability: 0.5, text: "Berc\xE9 par le clapotis, vous dormez comme un vieux loup de mer d'eau douce. Au matin, vous saluez les canards en capitaine.", statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.3, text: "Le batelier rentre \xE0 l'aube. Mais il a connu la gal\xE8re : caf\xE9 br\xFBlant, sermon ti\xE8de, et \xAB la prochaine fois, demande \xBB. Il y aura une prochaine fois.", statChanges: { sleep: 14, thirst: 8 }, respectChange: 1 },
        { probability: 0.2, text: "Le mal de mer. \xC0 QUAI. Vous ignoriez que c'\xE9tait physiquement possible. Votre estomac confirme que si.", statChanges: { sleep: 8, health: -4, mental: -3 } }
      ] },
      { text: "Dormir sur le quai, en terrien", risk: "safe", emoji: "\u{1F30A}", outcomes: [
        { probability: 1, text: "Le clapotis fait le travail m\xEAme depuis la rive. La mer, c'est bien aussi de loin. Surtout de loin.", statChanges: { sleep: 10, mental: 3 } }
      ] }
    ]
  },
  {
    id: "rest-tube-toboggan",
    title: "Le Tube du Toboggan",
    type: "narrative",
    image: "/assets/rest-tube-toboggan.webp",
    description: "Le toboggan tubulaire du square : abrit\xE9 du vent, inclin\xE9 juste ce qu'il faut, interdit aux plus de douze ans. Vous en avez quelques-uns de trop.",
    choices: [
      { text: "S'y glisser pour la nuit", risk: "normal", emoji: "\u{1F6DD}", outcomes: [
        { probability: 0.6, text: "Un cocon de plastique rouge qui amplifie les ronflements en \xE9cho industriel. Nuit correcte, r\xE9veil en douceur par glissade involontaire.", statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.4, text: "\xC0 7h pr\xE9cises, un enfant vous glisse DESSUS. Collision, cris, parents. Vous pr\xE9sentez des excuses depuis l'int\xE9rieur d'un tube. Point bas de la semaine.", statChanges: { sleep: 8, mental: -3, dignity: -6 } }
      ] },
      { text: "Le banc d'\xE0 c\xF4t\xE9, r\xE9glementaire", risk: "safe", emoji: "\u{1FA91}", outcomes: [
        { probability: 1, text: "Le banc est dur, l\xE9gal et venteux. Vous r\xEAvez du tube. On r\xEAve toujours du tube.", statChanges: { sleep: 8, mental: 2 } }
      ] }
    ]
  },
  {
    id: "rest-copyshop",
    title: "La Boutique de Photocopies",
    type: "narrative",
    image: "/assets/rest-copyshop.webp",
    description: "Le copy-shop \xE9tudiant reste ouvert toute la nuit en p\xE9riode de partiels. Des fauteuils, le ronron chaud des machines, et des gens trop paniqu\xE9s pour poser des questions.",
    choices: [
      { text: "Dormir entre deux \xE9tudiants en crise", risk: "safe", emoji: "\u{1F5A8}\uFE0F", outcomes: [
        { probability: 0.7, text: "Les photocopieuses ronronnent comme des chats de bureau. Autour de vous, on surligne fr\xE9n\xE9tiquement. Vous dormez pour eux tous. Quelqu'un devait le faire.", statChanges: { sleep: 14, mental: 4 } },
        { probability: 0.3, text: "Un \xE9tudiant vous paie pour surveiller ses affaires pendant sa pause kebab. Vous dormez dessus : s\xE9curit\xE9 maximale. Il approuve la m\xE9thode.", moneyChange: 3, statChanges: { sleep: 10 } }
      ] },
      { text: "Aider \xE0 agrafer des m\xE9moires", risk: "normal", emoji: "\u{1F4CE}", outcomes: [
        { probability: 0.6, text: "Cent vingt pages sur \xAB l'habitat modulaire \xBB, agraf\xE9es droit. Pay\xE9 en caf\xE9s et en pi\xE8ces par des gens aux yeux rouges. La nuit la plus productive du mois.", moneyChange: 4, statChanges: { thirst: 6, sleep: 6, mental: 4 } },
        { probability: 0.4, text: "Vous agrafez un chapitre \xE0 l'envers. Le propri\xE9taire du m\xE9moire prend \xE7a pour un \xAB geste dada \xBB. Il garde. Vous dormez, absous par l'art.", statChanges: { sleep: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "rest-ascenseur-condamne",
    title: "L'Ascenseur Condamn\xE9",
    type: "discovery",
    image: "/assets/rest-ascenseur-condamne.webp",
    description: "Dans le parking, un ascenseur \xAB en panne depuis 2019 \xBB. Propre, \xE9clair\xE9, avec un miroir pour se dire bonjour. Un studio d'un m\xE8tre carr\xE9, sans les charges.",
    choices: [
      { text: "Emm\xE9nager pour la nuit", risk: "normal", emoji: "\u{1F6D7}", outcomes: [
        { probability: 0.6, text: "Une chambre d'un m\xE8tre carr\xE9, mais UNE CHAMBRE. Porte qui ferme, lumi\xE8re qui marche, miroir qui ne juge pas. Le studio parisien, en mieux plac\xE9.", statChanges: { sleep: 18, mental: 6, dignity: 3 } },
        { probability: 0.4, text: "Le technicien vient ENFIN le r\xE9parer. \xC0 5h du matin. Apr\xE8s six ans. Le timing de la maintenance fran\xE7aise est une arme de pr\xE9cision.", statChanges: { sleep: 8, mental: -4 } }
      ] },
      { text: "M\xE9fiance : dormir devant", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 1, text: "Vous dormez sur le seuil, comme un chien de garde de votre propre prudence. L'ascenseur ne bouge pas de la nuit. \xC9videmment.", statChanges: { sleep: 10 } }
      ] }
    ]
  },
  {
    id: "rest-champignonniere",
    title: "La Cave \xE0 Champignons",
    type: "discovery",
    image: "/assets/rest-champignonniere.webp",
    description: "Une ancienne champignonni\xE8re, ti\xE8de, sombre et silencieuse. Odeur de terre riche, noir absolu, et quelques champignons nostalgiques qui poussent encore par habitude.",
    choices: [
      { text: "Dormir dans le noir absolu", risk: "normal", emoji: "\u{1F344}", outcomes: [
        { probability: 0.6, text: "Le meilleur noir de votre vie. Pas une lueur, pas un bruit, pas un jugement. Vous dormez comme une graine qui aurait renonc\xE9 \xE0 germer. C'est un compliment.", statChanges: { sleep: 24, mental: 4 } },
        { probability: 0.4, text: "Vous r\xEAvez que les champignons parlent. Ils donnent d'excellents conseils de placement immobilier. Au r\xE9veil, vous avez tout oubli\xE9 sauf \xAB creuse \xBB.", statChanges: { sleep: 18, mental: 7 } }
      ] },
      { text: "Cueillir de quoi d\xEEner d'abord", risk: "risky", emoji: "\u{1F37D}\uFE0F", outcomes: [
        { probability: 0.5, text: "Po\xEAl\xE9e improvis\xE9e sur bo\xEEte de conserve : un d\xEEner de bistrot dans une cave. Puis douze heures de sommeil, et de la terre dans les cheveux.", statChanges: { hunger: 18, sleep: 15 } },
        { probability: 0.5, text: "Ceux-l\xE0 n'\xE9taient PAS des champignons de Paris. La nuit est peupl\xE9e de couleurs in\xE9dites et de conversations avec le plafond. Mais QUELLES couleurs.", statChanges: { health: -8, mental: 8, sleep: 10 } }
      ] }
    ]
  },
  {
    id: "rest-bache-piscine",
    title: "Sous la B\xE2che de la Piscine",
    type: "discovery",
    image: "/assets/rest-bache-piscine.webp",
    description: "La piscine ext\xE9rieure est b\xE2ch\xE9e pour l'hiver. Entre la b\xE2che tendue et les transats empil\xE9s : une poche d'air ti\xE8de, \xE0 l'abri du monde.",
    choices: [
      { text: "Se faufiler dessous", risk: "risky", emoji: "\u{1F3CA}", outcomes: [
        { probability: 0.5, text: "Un hamac g\xE9ant qui sent le chlore et l'\xE9t\xE9 mort. Vous dormez suspendu, et la b\xE2che ne prend pas l'eau.", statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.5, text: "La b\xE2che c\xE8de \xE0 3h. Baignade de novembre, tout habill\xE9, dans le petit bain. Le ma\xEEtre-nageur aurait au moins ri.", statChanges: { health: -8, sleep: -4, dignity: -5, mental: -4 } }
      ] },
      { text: "B\xE2tir une cabane de transats", risk: "normal", emoji: "\u{1FA91}", outcomes: [
        { probability: 0.7, text: "Douze transats, une architecture douteuse, un abri r\xE9el. L'urbanisme sauvage a ses chefs-d'\u0153uvre \xE9ph\xE9m\xE8res.", statChanges: { sleep: 14, mental: 6 } },
        { probability: 0.3, text: "Effondrement \xE0 3h. Un domino de transats dans le silence municipal, et vous dessous. Personne n'a entendu. Votre coccyx, si.", statChanges: { sleep: 6, health: -3, mental: -2 } }
      ] }
    ]
  },
  {
    id: "rest-loge-theatre",
    title: "La Loge du Th\xE9\xE2tre",
    type: "discovery",
    image: "/assets/rest-loge-theatre.webp",
    description: "La porte de service du th\xE9\xE2tre est cal\xE9e avec un extincteur. Au bout du couloir : les loges. Canap\xE9s de velours, miroirs \xE0 ampoules, gloire en pointill\xE9s.",
    choices: [
      { text: "Dormir en vedette", risk: "risky", emoji: "\u{1F3AD}", outcomes: [
        { probability: 0.5, text: "Canap\xE9 de velours rouge, ampoules en veilleuse. Vous saluez un public imaginaire avant de sombrer. Standing ovation dans vos r\xEAves. Trois rappels.", statChanges: { sleep: 22, mental: 10, dignity: 5 } },
        { probability: 0.5, text: "La troupe r\xE9p\xE8te jusqu'\xE0 4h une pi\xE8ce exp\xE9rimentale o\xF9 le d\xE9cor \xAB respire \xBB. Vous \xEAtes le d\xE9cor. Vous respirez. La critique salue votre naturel.", statChanges: { sleep: 8, mental: 2 }, respectChange: 2 }
      ] },
      { text: "Rester dans le couloir chauff\xE9", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 1, text: "Le couloir sent la poussi\xE8re noble et le trac ancien. Vous dormez adoss\xE9 \xE0 cent ans de premi\xE8res. \xC7a tient chaud autrement.", statChanges: { sleep: 12, mental: 4 } }
      ] }
    ]
  },
  {
    id: "rest-bibliobus",
    title: "Le Bibliobus",
    type: "discovery",
    image: "/assets/rest-bibliobus.webp",
    description: "Le bibliobus municipal dort sur son parking, mal verrouill\xE9. \xC0 l'int\xE9rieur : moquette, coussins de l'heure du conte, et deux mille histoires qui ne demandent que \xE7a.",
    choices: [
      { text: "Nuit au rayon jeunesse", risk: "normal", emoji: "\u{1F4DA}", outcomes: [
        { probability: 0.7, text: "Endormi sur les coussins du conte, un album ouvert sur le ventre. Vous r\xEAvez en illustrations. Le r\xE9veil sent le papier et l'enfance des autres.", statChanges: { sleep: 18, mental: 9 } },
        { probability: 0.3, text: "La biblioth\xE9caire vous trouve au matin. Au lieu d'appeler qui que ce soit, elle vous inscrit : \xAB \xE7a vous fera une adresse. \xBB Une carte de biblioth\xE8que. Votre premier document officiel depuis longtemps.", statChanges: { sleep: 12, mental: 8, dignity: 4 }, respectChange: 2, addFlag: "carte-biblio" }
      ] },
      { text: "Lire jusqu'\xE0 l'aube", risk: "safe", emoji: "\u{1F4D6}", outcomes: [
        { probability: 1, text: "Vous d\xE9vorez un roman d'aventure entier, genoux repli\xE9s sous la veilleuse. Dormir peut attendre : vous \xE9tiez en mer de Chine.", statChanges: { sleep: 6, mental: 12 } }
      ] }
    ]
  },
  {
    id: "rest-cabine-grue",
    title: "La Cabine de la Grue",
    type: "discovery",
    image: "/assets/rest-cabine-grue.webp",
    description: "Trente m\xE8tres au-dessus du chantier endormi, la cabine de la grue. La cl\xE9 du grillage pend \xE0 un clou. Le vertige, lui, est fourni sans suppl\xE9ment.",
    choices: [
      { text: "Grimper dormir l\xE0-haut", risk: "risky", emoji: "\u{1F3D7}\uFE0F", outcomes: [
        { probability: 0.5, text: "La ville enti\xE8re \xE0 vos pieds, en silence, en lumi\xE8res. Vous dormez en roi du monde dans un fauteuil d'ouvrier. La plus belle chambre de la ville, sans exception.", statChanges: { sleep: 20, mental: 14, dignity: 6 } },
        { probability: 0.3, text: "\xC0 mi-\xE9chelle, les bras d\xE9clarent forfait. Redescente piteuse, \xE9chelon par \xE9chelon, en n\xE9gociant avec vos biceps. Le sol a du bon aussi.", statChanges: { sleep: 6, health: -4, mental: -4 } },
        { probability: 0.2, text: "Le gardien vous cueille \xE0 la descente, plus admiratif que f\xE2ch\xE9 : \xAB m\xEAme moi j'ose pas monter. \xBB Il partage son thermos en \xE9change du r\xE9cit.", statChanges: { sleep: 10, thirst: 8, mental: 3 }, respectChange: 3 }
      ] },
      { text: "Dormir dans la b\xE9tonni\xE8re (vide)", risk: "normal", emoji: "\u{1F300}", outcomes: [
        { probability: 0.6, text: "Un cocon d'acier \xE9trangement ergonomique. Vous dormez en position f\u0153tale industrielle. Le progr\xE8s a parfois des usages impr\xE9vus.", statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.4, text: "Un ouvrier matinal la met en route \xAB pour v\xE9rifier \xBB. Trois rotations avant vos hurlements. Vous sortez essor\xE9, au sens propre. Il paie le petit-d\xE9jeuner, traumatis\xE9 aussi.", statChanges: { health: -5, mental: -6, sleep: 4, hunger: 10 } }
      ] }
    ]
  },
  {
    id: "rest-aire-autoroute",
    title: "L'Aire d'Autoroute",
    type: "narrative",
    image: "/assets/rest-aire-autoroute.webp",
    description: "\xC0 la lisi\xE8re de la ville, une aire d'autoroute : douches \xE0 jeton, machine \xE0 caf\xE9, et des routiers qui ont le c\u0153ur proportionnel au tonnage.",
    choices: [
      { text: "Dormir entre deux poids lourds", risk: "normal", emoji: "\u{1F69B}", outcomes: [
        { probability: 0.6, text: "Les moteurs au ralenti ronronnent comme des chats de quarante tonnes. \xC0 l'abri du vent entre deux remorques, vous dormez en convoi exceptionnel.", statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.4, text: "Un routier vous secoue \xE0 l'aube... pour vous offrir jeton de douche et caf\xE9 : \xAB j'ai dormi dehors deux ans, moi. \xBB La confr\xE9rie des anciens du bitume existe, et elle a des jetons.", statChanges: { sleep: 14, dignity: 8, thirst: 8, mental: 8 } }
      ] },
      { text: "Squatter la salle des machines \xE0 caf\xE9", risk: "safe", emoji: "\u2615", outcomes: [
        { probability: 1, text: "N\xE9ons, chaleur, gobelet oubli\xE9 encore \xE0 moiti\xE9 plein. Le confort moderne dans sa version distributeur. Vous dormez assis entre deux \xAB expresso court \xBB.", statChanges: { sleep: 10, thirst: 5 } }
      ] }
    ]
  },
  {
    id: "rest-carrousel",
    title: "Le Man\xE8ge B\xE2ch\xE9",
    type: "discovery",
    image: "/assets/rest-carrousel.webp",
    description: "Le carrousel du parc est b\xE2ch\xE9 pour la nuit. Sous la toile : des chevaux de bois fig\xE9s en plein galop, et le carrosse de Cendrillon, libre jusqu'\xE0 minuit. Et m\xEAme apr\xE8s.",
    choices: [
      { text: "Dormir dans le carrosse", risk: "normal", emoji: "\u{1F3A0}", outcomes: [
        { probability: 0.7, text: "Nuit f\xE9erique dans un carrosse de contreplaqu\xE9 dor\xE9. Vous vous r\xE9veillez prince d'un royaume de chevaux immobiles. Le royaume est petit mais le sommeil fut royal.", statChanges: { sleep: 18, mental: 10, dignity: 3 } },
        { probability: 0.3, text: "Le forain lance le man\xE8ge \xE0 7h SANS regarder sous la b\xE2che. R\xE9veil rotatif, musique de limonaire \xE0 plein volume. Vous descendez en marche, dignit\xE9 centrifug\xE9e.", statChanges: { sleep: 10, health: -3, mental: -4, dignity: -4 } }
      ] },
      { text: "S'adosser \xE0 un cheval de bois", risk: "safe", emoji: "\u{1F434}", outcomes: [
        { probability: 1, text: "Vous dormez contre un cheval cabr\xE9 qui ne bronche pas. Le seul cheval du monde qui ne vous jugera jamais.", statChanges: { sleep: 12, mental: 5 } }
      ] }
    ]
  },
  {
    id: "rest-casse-limousine",
    title: "La Limousine de la Casse",
    type: "discovery",
    image: "/assets/rest-casse-limousine.webp",
    description: "La casse auto d\xE9borde d'\xE9paves ordinaires. Mais au milieu tr\xF4ne une limousine des ann\xE9es 80, si\xE8ges cuir intacts, mini-bar vide, gloire fan\xE9e.",
    choices: [
      { text: "Nuit en limousine", risk: "normal", emoji: "\u{1F697}", outcomes: [
        { probability: 0.7, text: "Cuir craquel\xE9, suspension morte, classe \xE9ternelle. Vous dormez en magnat d\xE9chu, ce qui est exactement votre situation. Le costume tombe parfaitement.", statChanges: { sleep: 18, mental: 8, dignity: 5 } },
        { probability: 0.3, text: "Le chien de la casse dort D\xC9J\xC0 dedans. N\xE9gociation territoriale : il garde l'avant, vous prenez l'arri\xE8re. Il ronfle. Vous aussi. L'accord tient.", statChanges: { sleep: 10, mental: 3, health: -2 } }
      ] },
      { text: "Choisir une modeste berline", risk: "safe", emoji: "\u{1F699}", outcomes: [
        { probability: 0.8, text: "Une familiale d\xE9fonc\xE9e mais honn\xEAte. Les si\xE8ges se rabattent presque \xE0 plat. Presque. Votre colonne vert\xE9brale valide \xE0 80 %.", statChanges: { sleep: 14 } },
        { probability: 0.2, text: "Le si\xE8ge se rabat d'un coup en pleine nuit : vous dormez en position \xAB coffre \xBB. R\xE9veil origami.", statChanges: { sleep: 8, health: -2 } }
      ] }
    ]
  },
  {
    id: "rest-chapiteau-cirque",
    title: "Sous les Gradins du Cirque",
    type: "discovery",
    image: "/assets/rest-chapiteau-cirque.webp",
    description: "Le cirque dort. Sous les gradins du chapiteau : de la paille propre, la chaleur des projecteurs \xE9teints, et une odeur de pop-corn fant\xF4me.",
    choices: [
      { text: "Se faire un nid de paille", risk: "normal", emoji: "\u{1F3AA}", outcomes: [
        { probability: 0.6, text: "La paille des artistes vaut mieux que le duvet des honn\xEAtes gens. Vous dormez dans les coulisses du r\xEAve, berc\xE9 par le ronflement lointain du lama.", statChanges: { sleep: 18, mental: 7 } },
        { probability: 0.4, text: "Le lama vous d\xE9couvre \xE0 l'aube et vous fixe pendant une heure. Vous vous r\xE9veillez sous surveillance cam\xE9lid\xE9e. Il ne dira rien. Les lamas ne disent jamais rien.", statChanges: { sleep: 14, mental: 4 } }
      ] },
      { text: "Dormir dans le canon (du num\xE9ro)", risk: "risky", emoji: "\u{1F4A3}", outcomes: [
        { probability: 0.5, text: "Le canon de l'homme-canon est capitonn\xE9 de l'int\xE9rieur. \xC9videmment : c'est fait pour contenir un homme. Nuit balistique parfaite.", statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.5, text: "R\xE9p\xE9tition matinale. On charge le ressort AVANT de v\xE9rifier le canon. Le filet vous rattrape, l'\xE9quipe vous applaudit. Embauche refus\xE9e, petit-d\xE9jeuner offert.", statChanges: { sleep: 6, health: -5, mental: 5, hunger: 12 } }
      ] }
    ]
  },
  {
    id: "rest-showroom-cuisine",
    title: "La Cuisine d'Exposition",
    type: "narrative",
    image: "/assets/rest-showroom-cuisine.webp",
    description: "Le magasin de cuisines expose un \xAB appartement t\xE9moin \xBB complet. Faux fruits, vraie banquette, lumi\xE8re d'ambiance. Une vie de catalogue, inoccup\xE9e.",
    choices: [
      { text: "Habiter le t\xE9moin pour une nuit", risk: "risky", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.5, text: "Vous d\xEEnez de vos provisions \xE0 la table en marbre reconstitu\xE9, puis dormez sur la banquette \xAB conviviale \xBB. Pendant huit heures, vous avez une vie de catalogue. Elle est reposante.", statChanges: { sleep: 20, mental: 12, dignity: 6 } },
        { probability: 0.5, text: "Le vigile de nuit vous trouve endormi, la t\xEAte sur un set de table. Il vous fait sortir... par la caf\xE9t\xE9ria du personnel, avec un chocolat chaud. Les vigiles de nuit comprennent la nuit.", statChanges: { sleep: 12, thirst: 8, mental: 4, dignity: -2 } }
      ] },
      { text: "Juste s'asseoir dans \xAB son \xBB salon", risk: "safe", emoji: "\u{1F6CB}\uFE0F", outcomes: [
        { probability: 1, text: "Une heure assis dans une vie qui pourrait \xEAtre la v\xF4tre, \xE0 un cr\xE9dit pr\xE8s. Vous remettez le coussin droit en partant. On est chez soi ou on ne l'est pas.", statChanges: { mental: 8, sleep: 6 } }
      ] }
    ]
  },
  {
    id: "rest-salle-sport",
    title: "La Salle de Sport 24h/24",
    type: "narrative",
    image: "/assets/rest-salle-sport.webp",
    description: "La salle de sport \xAB ouverte 24h/24 \xBB est d\xE9serte \xE0 3h. La porte battante bat. Au fond, le coin \xE9tirements : des tapis \xE9pais et personne pour s'\xE9tirer.",
    choices: [
      { text: "Dormir au coin \xE9tirements", risk: "normal", emoji: "\u{1F9D8}", outcomes: [
        { probability: 0.6, text: "Tapis de sol \xE9pais, musique motivante en sourdine, climat contr\xF4l\xE9. Vous dormez \xAB en r\xE9cup\xE9ration active \xBB. C'est le nom technique.", statChanges: { sleep: 17, health: 3 } },
        { probability: 0.4, text: "Un bodybuilder insomniaque s'entra\xEEne \xE0 c\xF4t\xE9 de vous toute la nuit en comptant \xE0 voix haute. Vous savez d\xE9sormais compter jusqu'\xE0 douze en grognant.", statChanges: { sleep: 10, mental: 2 } }
      ] },
      { text: "Douche d'abord, sommeil ensuite", risk: "risky", emoji: "\u{1F6BF}", outcomes: [
        { probability: 0.5, text: "Douche chaude illimit\xE9e + tapis moelleux : la nuit spa. Vous ressortez \xE0 l'aube, propre et repos\xE9, en saluant la cam\xE9ra. Elle a rien dit, elle non plus.", statChanges: { sleep: 15, dignity: 12, health: 4 } },
        { probability: 0.5, text: "Le g\xE9rant d\xE9barque pour son cardio de 5h. Explication en peignoir de fortune (une serviette de la salle). Il vous laisse finir la douche. Pas la nuit.", statChanges: { sleep: 5, dignity: 4, mental: -2 } }
      ] }
    ]
  },
  {
    id: "rest-parc-expo",
    title: "Le Parc des Expositions",
    type: "discovery",
    image: "/assets/rest-parc-expo.webp",
    description: "Entre le \xAB Salon de l'Habitat \xBB d\xE9mont\xE9 hier et la \xAB Foire du Camping \xBB mont\xE9e demain, le hall 3 du parc des expos est un d\xE9sert de moquette chauff\xE9e.",
    choices: [
      { text: "Dormir au milieu du hall 3", risk: "normal", emoji: "\u{1F3DF}\uFE0F", outcomes: [
        { probability: 0.6, text: "Dix mille m\xE8tres carr\xE9s pour vous seul. Vous dormez au centre exact, par principe. L'\xE9cho de vos ronflements remplit l'espace comme une \u0153uvre sonore.", statChanges: { sleep: 18, mental: 8 } },
        { probability: 0.4, text: "Les monteurs de la Foire du Camping arrivent \xE0 5h et montent une tente AUTOUR de vous, pour rire. Vous vous r\xE9veillez en d\xE9monstration. Vous jouez le jeu. Pourboire du chef d'\xE9quipe.", moneyChange: 4, statChanges: { sleep: 12, mental: 6, dignity: -2 } }
      ] },
      { text: "Chercher les restes du Salon de l'Habitat", risk: "safe", emoji: "\u{1F50D}", outcomes: [
        { probability: 1, text: "Butin : moquette de stand d\xE9coup\xE9e (isolant cinq \xE9toiles), flyers \xAB votre maison de demain \xBB (allume-feu d'aujourd'hui) et un stylo publicitaire qui marche.", statChanges: { sleep: 8, mental: 4 }, itemGain: { id: "moquette-stand", name: "Carr\xE9 de moquette de stand", emoji: "\u{1F7E9}", type: "junk", value: 3 } }
      ] }
    ]
  },
  {
    id: "rest-jacuzzi-expo",
    title: "Le Jacuzzi d'Exposition",
    type: "discovery",
    image: "/assets/rest-jacuzzi-expo.webp",
    description: "La jardinerie expose un jacuzzi dernier cri sur le parking, sous un barnum. Il est vide, sec, et exactement de la taille d'un lit rond.",
    choices: [
      { text: "Dormir dans le jacuzzi (vide)", risk: "normal", emoji: "\u{1F6C1}", outcomes: [
        { probability: 0.7, text: "Coque ergonomique, appuie-t\xEAtes int\xE9gr\xE9s, parois anti-vent. Les ing\xE9nieurs du bien-\xEAtre ont con\xE7u votre chambre sans le savoir. Nuit cinq \xE9toiles, z\xE9ro bulle.", statChanges: { sleep: 19, mental: 8 } },
        { probability: 0.3, text: "Le commercial fait sa d\xE9mo \xE0 9h et lance les jets... d'air. Vous \xE9mergez d'un typhon sec devant deux clients ravis. \xAB Et il est vendu avec l'occupant ? \xBB Tout le monde rit. Vous aussi, \xE0 retardement.", statChanges: { sleep: 12, dignity: -5, mental: 3 } }
      ] },
      { text: "Dormir dessous, entre les palettes", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 1, text: "Sous le jacuzzi, entre deux palettes : moins glamour, plus discret. Le luxe au-dessus, vous en dessous. Une m\xE9taphore confortable.", statChanges: { sleep: 12 } }
      ] }
    ]
  },
  {
    id: "rest-escalier-hopital",
    title: "La Cage d'Escalier de l'H\xF4pital",
    type: "narrative",
    image: "/assets/rest-escalier-hopital.webp",
    description: "L'escalier de service de l'h\xF4pital : chauff\xE9, silencieux, et personne ne prend jamais l'escalier dans un h\xF4pital. Les paliers du 4e sont r\xE9put\xE9s.",
    choices: [
      { text: "S'installer au 4e palier", risk: "safe", emoji: "\u{1F3E5}", outcomes: [
        { probability: 0.7, text: "Chaleur d'h\xF4pital, silence de linol\xE9um. Vous dormez adoss\xE9 au radiateur, berc\xE9 par les annonces lointaines. Personne n'est mont\xE9. Personne ne monte jamais.", statChanges: { sleep: 16, health: 2, mental: 4 } },
        { probability: 0.3, text: "Une aide-soignante en pause pleure doucement au 3e. Vous descendez, vous \xE9coutez, elle partage ses biscuits. Deux fatigues qui se tiennent compagnie, \xE7a repose autrement.", statChanges: { sleep: 10, mental: 8, hunger: 8 } }
      ] },
      { text: "Viser le toit-terrasse du personnel", risk: "risky", emoji: "\u{1F303}", outcomes: [
        { probability: 0.5, text: "Transats du personnel, plaid oubli\xE9, ville en contrebas. Les soignants ont le meilleur spot de la ville et le savent. Cette nuit, il est \xE0 vous.", statChanges: { sleep: 18, mental: 10 } },
        { probability: 0.5, text: "La porte du toit claque derri\xE8re vous. Verrouill\xE9e. Vous dormez sur le paillasson du ciel et attendez l'\xE9quipe de 6h, qui vous lib\xE8re en riant.", statChanges: { sleep: 8, mental: -3 } }
      ] }
    ]
  },
  {
    id: "rest-consigne-gare",
    title: "La Consigne de la Gare",
    type: "discovery",
    image: "/assets/rest-consigne-gare.webp",
    description: "La salle des consignes automatiques, au sous-sol de la gare : ti\xE8de, oubli\xE9e des cam\xE9ras, meubl\xE9e de casiers qui gardent les secrets des autres.",
    choices: [
      { text: "Dormir entre les casiers", risk: "normal", emoji: "\u{1F510}", outcomes: [
        { probability: 0.6, text: "Le ronron des ventilations, la chaleur des machines. Vous dormez gard\xE9 par cent casiers verrouill\xE9s, comme un lingot parmi les lingots.", statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.4, text: "Un voyageur vient r\xE9cup\xE9rer sa valise \xE0 2h et hurle en vous d\xE9couvrant. Vous hurlez aussi, par politesse. Il s'excuse, vous vous excusez, il vous laisse ses sandwichs de train.", statChanges: { sleep: 10, hunger: 12, mental: 2 } }
      ] },
      { text: "V\xE9rifier le casier 12 (l'appel de la cabine\u2026)", risk: "risky", emoji: "\u{1F5DD}\uFE0F", outcomes: [
        { probability: 0.3, text: "Le casier 12 est... entrouvert. Dedans : une couverture pli\xE9e et un mot : \xAB pour le suivant. \xBB La ville a des anges bizarres, mais elle en a.", statChanges: { sleep: 12, mental: 10 }, itemGain: { id: "couverture-casier", name: "Couverture du casier 12", emoji: "\u{1F9E3}", type: "armor", value: 6, defenseBonus: 1 } },
        { probability: 0.7, text: "Le casier 12 est verrouill\xE9, comme les casiers. Vous avez fix\xE9 une porte en m\xE9tal pendant dix minutes. Le myst\xE8re reste entier, votre sommeil aussi.", statChanges: { sleep: 10, mental: 2 } }
      ] }
    ]
  },
  {
    id: "rest-atelier-poterie",
    title: "L'Atelier de Poterie",
    type: "discovery",
    image: "/assets/rest-atelier-poterie.webp",
    description: "L'atelier de poterie associatif a laiss\xE9 son four allum\xE9 pour la cuisson de nuit. La pi\xE8ce enti\xE8re est un radiateur qui sent l'argile et la patience.",
    choices: [
      { text: "Dormir contre le four", risk: "safe", emoji: "\u{1F3FA}", outcomes: [
        { probability: 0.7, text: "Une chaleur de four \xE0 pain, un sol propre, l'odeur de la terre cuite. Vous dormez comme une poterie en cours : doucement solidifi\xE9 par la nuit.", statChanges: { sleep: 19, health: 3, mental: 5 } },
        { probability: 0.3, text: "La poti\xE8re de l'aube vous trouve lov\xE9 contre son four. Elle vous met un tablier d'office : \xAB tant qu'\xE0 \xEAtre l\xE0, tournez. \xBB Votre bol est difforme. Elle le garde \xAB pour l'expo \xBB.", statChanges: { sleep: 12, mental: 9, dignity: 3 } }
      ] },
      { text: "Essayer le tour de potier d'abord", risk: "normal", emoji: "\u{1F300}", outcomes: [
        { probability: 0.5, text: "\xC0 2h du matin, seul au monde, vous tournez un bol presque rond. Il y a une paix \xE9trange \xE0 faire na\xEEtre un objet. Vous dormez les mains sales et l'\xE2me propre.", statChanges: { sleep: 14, mental: 12 } },
        { probability: 0.5, text: "L'argile gicle partout. PARTOUT. Vous passez une heure \xE0 nettoyer et dormez d'un sommeil coupable mais chaud.", statChanges: { sleep: 12, mental: 2, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "rest-amphi-fac",
    title: "L'Amphi de la Fac",
    type: "narrative",
    image: "/assets/rest-amphi-fac.webp",
    description: "L'amphith\xE9\xE2tre B reste ouvert pour les \xAB r\xE9visions libres \xBB. Au dernier rang, dans la p\xE9nombre, des g\xE9n\xE9rations d'\xE9tudiants ont dormi avant vous, et le velours s'en souvient.",
    choices: [
      { text: "Dormir au dernier rang", risk: "safe", emoji: "\u{1F393}", outcomes: [
        { probability: 0.7, text: "Les si\xE8ges rabattables ont l'inclinaison exacte de la sieste acad\xE9mique. Vous dormez au milieu d'\xE9tudiants qui dorment sur leurs cours, et personne ne r\xE9veille personne.", statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.3, text: "Un cours de philo de 8h commence autour de vous. Th\xE8me : \xAB l'habiter \xBB. Vous levez la main sans r\xE9fl\xE9chir. Votre t\xE9moignage improvis\xE9 arrache des applaudissements. Le prof vous paie le caf\xE9.", statChanges: { sleep: 8, mental: 10, dignity: 6, thirst: 6 } }
      ] },
      { text: "Squatter le local des assos \xE9tudiantes", risk: "normal", emoji: "\u{1F6CB}\uFE0F", outcomes: [
        { probability: 0.6, text: "Canap\xE9 d\xE9fonc\xE9, affiches de soir\xE9es mortes, paquet de g\xE2teaux entam\xE9. Le luxe \xE9tudiant dans toute sa splendeur. Vous vous y fondez parfaitement.", statChanges: { sleep: 14, hunger: 8, mental: 4 } },
        { probability: 0.4, text: "L'asso \xAB Nuit du Jeu \xBB d\xE9barque \xE0 minuit pour un Loup-Garou marathon. Vous \xEAtes enr\xF4l\xE9 d'office. Vous gagnez deux parties. On vous surnomme \xAB le V\xE9t\xE9ran \xBB.", statChanges: { sleep: 4, mental: 12 }, respectChange: 2 }
      ] }
    ]
  },
  {
    id: "rest-foodtruck-tiede",
    title: "Le Food-Truck Endormi",
    type: "discovery",
    image: "/assets/rest-foodtruck-tiede.webp",
    description: "Le food-truck \xE0 burgers a ferm\xE9 \xE0 minuit. Sa plancha met des heures \xE0 refroidir : tout le flanc du camion est un mur ti\xE8de qui sent l'oignon grill\xE9.",
    choices: [
      { text: "Dormir coll\xE9 au flanc ti\xE8de", risk: "safe", emoji: "\u{1F354}", outcomes: [
        { probability: 0.7, text: "Le camion vous rend sa chaleur toute la nuit, avec suppl\xE9ment odeur de frites. Vous r\xEAvez de menus XL. Le r\xE9veil a un go\xFBt de faim heureuse.", statChanges: { sleep: 15, mental: 5, hunger: -3 } },
        { probability: 0.3, text: "Le patron revient \xE0 6h pr\xE9parer ses oignons. Il vous enjambe deux fois avant de vous tendre le \xAB burger du personnel \xBB : les chutes de la veille en sandwich. Somptueux.", statChanges: { sleep: 12, hunger: 20, mental: 5 } }
      ] },
      { text: "V\xE9rifier la trappe \xE0 pain", risk: "risky", emoji: "\u{1F956}", outcomes: [
        { probability: 0.5, text: "La trappe ext\xE9rieure contient les buns de la veille, \xAB bons pour les canards \xBB. Les canards vous pardonneront. Vous dormez le ventre plein contre le m\xE9tal ti\xE8de.", statChanges: { hunger: 16, sleep: 13 } },
        { probability: 0.5, text: "L'alarme du camion se d\xE9clenche. Le quartier entier sait maintenant qu'un homme voulait du pain \xE0 3h. Vous dormez ailleurs, poursuivi par la sir\xE8ne et le principe.", statChanges: { sleep: 6, mental: -4, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "rest-abri-jardin",
    title: "L'Abri de Jardin",
    type: "discovery",
    image: "/assets/rest-abri-jardin.webp",
    description: "Au fond des jardins ouvriers, un abri \xE0 outils au cadenas symbolique. Dedans : des sacs de terreau moelleux, des outils propres, et une odeur de tomate s\xE9ch\xE9e.",
    choices: [
      { text: "Dormir sur les sacs de terreau", risk: "normal", emoji: "\u{1F331}", outcomes: [
        { probability: 0.7, text: "Les sacs de terreau \xE9pousent le dos mieux qu'un matelas su\xE9dois. Vous dormez comme un semis sous serre : \xE0 l'abri, au chaud, plein d'avenir.", statChanges: { sleep: 18, mental: 6 } },
        { probability: 0.3, text: "Le jardinier du dimanche d\xE9barque t\xF4t. Silence. Puis : \xAB vous savez biner ? \xBB Matin\xE9e de binage contre panier de l\xE9gumes. L'\xE9conomie du potager est rude mais juste.", statChanges: { sleep: 10, hunger: 18, health: -2 }, respectChange: 1 }
      ] },
      { text: "Emprunter la brouette comme lit", risk: "normal", emoji: "\u{1F6DE}", outcomes: [
        { probability: 0.5, text: "La brouette, cal\xE9e contre le mur, se r\xE9v\xE8le un transat rustique acceptable. Vous dormez en \xE9quilibre, comme votre vie. La m\xE9taphore ne vous \xE9chappe pas.", statChanges: { sleep: 12, mental: 4 } },
        { probability: 0.5, text: "La brouette bascule \xE0 4h. Vous roulez dans les courgettes. Les courgettes n'avaient rien demand\xE9. Vous non plus.", statChanges: { sleep: 6, health: -2, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "rest-tracteur-foire",
    title: "Le Tracteur de la Foire Agricole",
    type: "discovery",
    image: "/assets/rest-tracteur-foire.webp",
    description: "La foire agricole s'installe demain. Les machines dorment d\xE9j\xE0 sur l'esplanade, dont un tracteur dernier cri : cabine suspendue, si\xE8ge pneumatique, GPS des champs.",
    choices: [
      { text: "Dormir dans la cabine high-tech", risk: "normal", emoji: "\u{1F69C}", outcomes: [
        { probability: 0.6, text: "Le si\xE8ge pneumatique du tracteur co\xFBte plus cher qu'une ann\xE9e de loyer. Vous comprenez pourquoi : c'est un nuage avec un volant. Meilleure nuit de l'ann\xE9e, cat\xE9gorie machines.", statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.4, text: "Le concessionnaire arrive \xE0 l'aube avec un client. Vous descendez du tracteur en saluant : \xAB suspension remarquable. \xBB Le client, convaincu par votre expertise, ach\xE8te. On vous glisse un billet de d\xE9monstrateur.", moneyChange: 6, statChanges: { sleep: 15, dignity: 2 } }
      ] },
      { text: "Se contenter de la remorque \xE0 paille", risk: "safe", emoji: "\u{1F33E}", outcomes: [
        { probability: 1, text: "La paille de d\xE9monstration est aussi confortable que la vraie. Vous dormez en produit du terroir, AOC fatigue de la rue.", statChanges: { sleep: 15, mental: 4 } }
      ] }
    ]
  },
  {
    id: "rest-chateau-gonflable",
    title: "Le Ch\xE2teau Gonflable D\xE9gonfl\xE9",
    type: "discovery",
    image: "/assets/rest-chateau-gonflable.webp",
    description: "Apr\xE8s la kermesse, le ch\xE2teau gonflable d\xE9gonfl\xE9 attend son camion sous une sangle. Trois cents m\xE8tres carr\xE9s de matelas pli\xE9. Les enfants partis, le royaume est vacant.",
    choices: [
      { text: "Se glisser dans les plis", risk: "normal", emoji: "\u{1F3F0}", outcomes: [
        { probability: 0.7, text: "Le PVC molletonn\xE9 pli\xE9 en douze \xE9paisseurs : le plus grand matelas du monde, rien que pour vous. Vous dormez en monarque d'un ch\xE2teau couch\xE9.", statChanges: { sleep: 21, mental: 9 } },
        { probability: 0.3, text: "Le forain le regonfle \xE0 7h SANS v\xE9rifier. Vous \xEAtes soulev\xE9, ballott\xE9, puis expuls\xE9 par la tourelle sud devant l'\xE9quipe hilare. Sortie de ch\xE2teau la plus m\xE9morable de l'histoire locale.", statChanges: { sleep: 12, dignity: -6, mental: 3, health: -2 }, respectChange: 1 }
      ] },
      { text: "Dormir dessus, en surface", risk: "safe", emoji: "\u{1F6CC}", outcomes: [
        { probability: 1, text: "M\xEAme d\xE9gonfl\xE9 et en surface, \xE7a reste mieux que le carton. Le luxe est relatif, votre dos est absolu.", statChanges: { sleep: 14 } }
      ] }
    ]
  },
  {
    id: "rest-pompes-funebres",
    title: "Le Magasin de Pompes Fun\xE8bres",
    type: "narrative",
    image: "/assets/rest-pompes-funebres.webp",
    description: "L'arri\xE8re-boutique des pompes fun\xE8bres est entrouverte. \xC0 l'int\xE9rieur, le showroom : des cercueils d'exposition, capitonn\xE9s, soyeux, terriblement confortables. Personne n'ose jamais y entrer. Justement.",
    choices: [
      { text: "Dormir dans le mod\xE8le \xAB Grand Repos \xBB", risk: "risky", emoji: "\u26B0\uFE0F", outcomes: [
        { probability: 0.5, text: "Capitonnage en satin, calme absolu, isolation parfaite. Vous comprenez enfin le marketing : c'est vraiment le grand repos. Vous laissez le couvercle OUVERT, tout de m\xEAme. Il y a des limites.", statChanges: { sleep: 25, mental: 6 } },
        { probability: 0.5, text: "Le thanatopracteur vous d\xE9couvre \xE0 7h et fr\xF4le l'infarctus quand vous vous redressez en le saluant. Une fois remis, il rit aux larmes et vous offre le caf\xE9 \xAB pour f\xEAter votre r\xE9surrection \xBB.", statChanges: { sleep: 18, thirst: 6, mental: 8, dignity: -3 }, respectChange: 2 }
      ] },
      { text: "Dormir sur les coussins de pr\xE9sentation", risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 1, text: "Les coussins d'exposition, moelleux et solennels, font un lit tr\xE8s digne. Vous dormez entour\xE9 de silence professionnel. Le m\xE9tier sait recevoir.", statChanges: { sleep: 16, mental: 3 } }
      ] }
    ]
  },
  {
    id: "rest-cabane-arbre",
    title: "La Cabane dans l'Arbre",
    type: "discovery",
    image: "/assets/rest-cabane-arbre.webp",
    description: "Au fond du parc, une cabane d'enfants dans un platane : planches de guingois, \xE9chelle \xE0 moiti\xE9 pourrie, panneau \xAB INTERDI AU ADULTE \xBB. L'orthographe est jeune, la cabane est solide.",
    choices: [
      { text: "Monter dormir l\xE0-haut", risk: "normal", emoji: "\u{1F333}", outcomes: [
        { probability: 0.6, text: "La cabane tient bon. Vous dormez dans les feuilles, berc\xE9 par le vent, redevenu un enfant de dix ans qui aurait beaucoup, beaucoup vieilli.", statChanges: { sleep: 17, mental: 11 } },
        { probability: 0.4, text: "Les propri\xE9taires (8 et 10 ans) vous d\xE9couvrent au matin. Conseil de guerre. Verdict : vous pouvez rester si vous \xEAtes \xAB le gardien du fort \xBB. Vous \xEAtes nomm\xE9. Salaire : deux BN et un Capri-Sun.", statChanges: { sleep: 12, hunger: 8, thirst: 6, mental: 12 }, respectChange: 1 }
      ] },
      { text: "Respecter le panneau, dormir au pied", risk: "safe", emoji: "\u{1F6E1}\uFE0F", outcomes: [
        { probability: 1, text: "Vous dormez au pied de l'arbre, en sentinelle du royaume d'en haut. Le panneau a parl\xE9. Un homme d'honneur respecte l'orthographe approximative.", statChanges: { sleep: 11, mental: 5 } }
      ] }
    ]
  },
  {
    id: "rest-sas-banque",
    title: "Le Sas de la Banque",
    type: "narrative",
    image: "/assets/rest-sas-banque.webp",
    description: "Le sas des distributeurs de la banque : chauff\xE9, \xE9clair\xE9, vitr\xE9. Le grand classique. Ce soir, il est libre, et la cam\xE9ra a l'air de dormir aussi.",
    choices: [
      { text: "S'installer pour la nuit", risk: "normal", emoji: "\u{1F3E6}", outcomes: [
        { probability: 0.6, text: "Le radiateur au sol, la lumi\xE8re tamis\xE9e par vos cartons : le studio bancaire dans toute sa gloire. Vous dormez sous l'\u0153il des distributeurs, gardien b\xE9n\xE9vole de l'argent des autres.", statChanges: { sleep: 16, mental: 4 } },
        { probability: 0.4, text: "Un client nocturne enjambe vos jambes pour retirer 50\u20AC, s'excuse, puis revient sur ses pas et vous en tend 5 : \xAB frais de d\xE9rangement. \xBB La banque n'a jamais aussi bien redistribu\xE9.", moneyChange: 5, statChanges: { sleep: 12, mental: 5 } }
      ] },
      { text: "Dormir dehors, contre la vitre", risk: "safe", emoji: "\u{1FA9F}", outcomes: [
        { probability: 1, text: "La vitre diffuse un peu de la chaleur du sas, comme une aum\xF4ne thermique. Dedans, dehors : toute votre vie tient dans cette \xE9paisseur de verre.", statChanges: { sleep: 10, mental: 2 } }
      ] }
    ]
  },
  {
    id: "rest-box-velo",
    title: "Le Box \xE0 V\xE9los S\xE9curis\xE9",
    type: "discovery",
    image: "/assets/rest-box-velo.webp",
    description: "La r\xE9sidence neuve a un box \xE0 v\xE9los dernier cri : badge, toit, \xE9clairage doux. Un v\xE9lo cargo y dort sous une housse. La housse est grande. Le cargo aussi.",
    choices: [
      { text: "Dormir dans la caisse du v\xE9lo cargo", risk: "normal", emoji: "\u{1F6B2}", outcomes: [
        { probability: 0.6, text: "La caisse en bois du cargo, sous la housse imperm\xE9able : un berceau pour adulte fatigu\xE9. Vous dormez pli\xE9 mais sec, comme une baguette bien rang\xE9e.", statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.4, text: "La propri\xE9taire part au march\xE9 \xE0 6h SANS soulever la housse. Vous vous r\xE9veillez en mouvement, place du march\xE9. Elle crie, vous criez, puis elle vous paie un caf\xE9 \xAB pour l'histoire \xE0 raconter \xBB.", statChanges: { sleep: 10, thirst: 6, mental: 4, dignity: -4 } }
      ] },
      { text: "Dormir sur le banc du box", risk: "safe", emoji: "\u{1FA91}", outcomes: [
        { probability: 1, text: "Le banc du box, sous le n\xE9on doux, \xE0 l'abri du vent. Les v\xE9los ne ronflent pas, et le badge de la porte fait clic toutes les deux heures.", statChanges: { sleep: 12 } }
      ] }
    ]
  },
  {
    id: "rest-quai-chargement",
    title: "Le Quai de Chargement",
    type: "discovery",
    image: "/assets/rest-quai-chargement.webp",
    description: "Derri\xE8re le grand magasin, le quai de chargement est d\xE9sert jusqu'\xE0 6h. Des balles de carton compress\xE9 y font des murailles moelleuses, ti\xE8des de la journ\xE9e.",
    choices: [
      { text: "Se creuser un nid dans les balles", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Une alc\xF4ve de carton compress\xE9 : isolation record, odeur de papier neuf. Le carton vous a toujours port\xE9. Cette nuit, litt\xE9ralement.", statChanges: { sleep: 17, mental: 6 } },
        { probability: 0.3, text: "Le cariste de 6h vous trouve encastr\xE9 dans sa mati\xE8re premi\xE8re. Il vous extrait \xE0 la main, mort de rire : \xAB t'es le meilleur truc que j'aie trouv\xE9 dans le carton. \xBB Caf\xE9 offert au local.", statChanges: { sleep: 12, thirst: 6, mental: 5 } }
      ] },
      { text: "Dormir sur le monte-charge", risk: "risky", emoji: "\u2B06\uFE0F", outcomes: [
        { probability: 0.5, text: "La plateforme du monte-charge, \xE0 mi-hauteur : imprenable, invisible, a\xE9r\xE9e. Le donjon du quai. Vous dormez en ch\xE2telain logistique.", statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.5, text: "Quelqu'un appelle le monte-charge \xE0 5h. Vous descendez, majestueux et horizontal, devant trois manutentionnaires. L'un applaudit. Les deux autres aussi, finalement.", statChanges: { sleep: 10, dignity: -4, mental: 4 } }
      ] }
    ]
  },
  {
    id: "rest-terrasse-chauffee",
    title: "La Terrasse au Chauffage Oubli\xE9",
    type: "discovery",
    image: "/assets/rest-terrasse-chauffee.webp",
    description: "Le caf\xE9 a ferm\xE9 en oubliant d'\xE9teindre un parasol chauffant. Une colonne de chaleur ronronne au-dessus des banquettes de la terrasse, pour personne.",
    choices: [
      { text: "S'allonger sous le champignon chauffant", risk: "normal", emoji: "\u{1F344}", outcomes: [
        { probability: 0.6, text: "La banquette, le plaid publicitaire oubli\xE9, et 2000 watts de bienveillance au gaz. Vous dormez comme un client qui aurait pay\xE9. Mieux, m\xEAme : eux se plaignent toujours.", statChanges: { sleep: 18, health: 3, mental: 6 } },
        { probability: 0.4, text: "Le patron rouvre \xE0 6h30, vous d\xE9couvre, et coupe le chauffage... apr\xE8s vous avoir servi un express. \xAB T'as gard\xE9 la terrasse, c'est un service. \xBB La comptabilit\xE9 du c\u0153ur.", statChanges: { sleep: 14, thirst: 5, mental: 5 }, respectChange: 1 }
      ] },
      { text: "Profiter juste une heure puis filer", risk: "safe", emoji: "\u23F1\uFE0F", outcomes: [
        { probability: 1, text: "Une heure de chaleur vol\xE9e, puis la nuit normale. Il faut savoir quitter la table quand la chance vous chauffe.", statChanges: { sleep: 8, health: 2 } }
      ] }
    ]
  },
  {
    id: "rest-bus-scolaire",
    title: "Le Bus Scolaire au D\xE9p\xF4t",
    type: "discovery",
    image: "/assets/rest-bus-scolaire.webp",
    description: "Le bus scolaire dort sur son parking, porte arri\xE8re mal ferm\xE9e. \xC0 l'int\xE9rieur flotte une odeur de go\xFBter et de mercredi. La banquette du fond vous tend les bras.",
    choices: [
      { text: "La banquette du fond, \xE9videmment", risk: "normal", emoji: "\u{1F68C}", outcomes: [
        { probability: 0.7, text: "La place mythique. Vous dormez l\xE0 o\xF9 trois g\xE9n\xE9rations de gamins ont r\xE9gn\xE9. Sous le si\xE8ge : un paquet de g\xE2teaux entam\xE9 et un Pok\xE9mon holographique. Le tr\xE9sor de guerre.", statChanges: { sleep: 16, hunger: 6, mental: 8 } },
        { probability: 0.3, text: "Le chauffeur monte \xE0 6h45 et d\xE9marre. Vous vous r\xE9veillez au premier arr\xEAt, entour\xE9 d'enfants hilares qui vous adoptent imm\xE9diatement. La ma\xEEtresse, moins. Descente au deuxi\xE8me arr\xEAt, escort\xE9 par des \xAB au revoir monsieur ! \xBB", statChanges: { sleep: 11, mental: 8, dignity: -5 } }
      ] },
      { text: "Dormir sur les marches, pr\xEAt \xE0 filer", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 1, text: "Les marches en caoutchouc, ti\xE8des et discr\xE8tes. Sortie garantie en deux secondes. La prudence est un oreiller dur mais fiable.", statChanges: { sleep: 10 } }
      ] }
    ]
  },
  {
    id: "rest-clocher",
    title: "Le Clocher",
    type: "discovery",
    image: "/assets/rest-clocher.webp",
    description: "L'escalier du clocher est ouvert pour cause de \xAB travaux campanaires \xBB. Cent vingt marches plus haut : les cloches, les poutres centenaires, et la ville en contrebas.",
    choices: [
      { text: "Dormir sous les cloches", risk: "risky", emoji: "\u{1F514}", outcomes: [
        { probability: 0.5, text: "Les poutres, la pierre, les \xE9toiles par les abat-sons. Vous dormez dans le grenier de Dieu. Les cloches sont d\xE9branch\xE9es pour les travaux : le destin a coup\xE9 le r\xE9veil.", statChanges: { sleep: 20, mental: 12 } },
        { probability: 0.5, text: "Les cloches n'\xE9taient PAS d\xE9branch\xE9es. L'ang\xE9lus de 7h vous traverse le squelette. Vous descendez les 120 marches en vibrant encore, sourd d'une oreille et mystique de l'autre.", statChanges: { sleep: 10, health: -4, mental: -5 } }
      ] },
      { text: "S'arr\xEAter \xE0 mi-hauteur, petite salle", risk: "safe", emoji: "\u{1FA9C}", outcomes: [
        { probability: 1, text: "La salle du sonneur, \xE0 mi-clocher : un banc, une chaise, un calme d'avant les horloges. Vous dormez dans l'\xE9paisseur du temps.", statChanges: { sleep: 14, mental: 6 } }
      ] }
    ]
  },
  {
    id: "rest-couloir-hotel",
    title: "Le Couloir de l'H\xF4tel",
    type: "narrative",
    image: "/assets/rest-couloir-hotel.webp",
    description: "La porte de service de l'h\xF4tel trois \xE9toiles b\xE2ille. Au deuxi\xE8me, un couloir moquett\xE9, des plateaux room-service \xE0 moiti\xE9 pleins devant les portes, et un silence luxueux.",
    choices: [
      { text: "D\xEEner des plateaux, dormir au bout du couloir", risk: "risky", emoji: "\u{1F37D}\uFE0F", outcomes: [
        { probability: 0.5, text: "Un demi-club sandwich, des frites ti\xE8des, une cr\xE8me br\xFBl\xE9e intacte (les gens sont fous). Puis dodo dans l'alc\xF4ve de la fen\xEAtre. Trois \xE9toiles au m\xE9rite.", statChanges: { hunger: 22, sleep: 15, mental: 8 } },
        { probability: 0.5, text: "Le veilleur de nuit vous surprend \xE0 la cr\xE8me br\xFBl\xE9e. Moment de flottement. \xAB ... Prenez au moins la cuill\xE8re propre. \xBB Il vous laisse finir dans l'escalier de service. Palace clandestin.", statChanges: { hunger: 15, sleep: 8, dignity: -3, mental: 4 } }
      ] },
      { text: "Viser la lingerie et ses piles de draps", risk: "normal", emoji: "\u{1F6CF}\uFE0F", outcomes: [
        { probability: 0.6, text: "La lingerie : des tours de draps propres jusqu'au plafond. Vous dormez SUR une pile, comme une princesse au petit pois qui aurait tout perdu sauf le sens du confort.", statChanges: { sleep: 20, dignity: 4, mental: 6 } },
        { probability: 0.4, text: "La gouvernante de 5h30 vous trouve enroul\xE9 dans un drap-housse. Elle vous fait plier quinze parures en \xE9change de son silence. Vous savez maintenant faire les coins carr\xE9s. Comp\xE9tence h\xF4teli\xE8re acquise.", statChanges: { sleep: 12, mental: 4, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "rest-tunnel-lavage",
    title: "Le Tunnel de Lavage",
    type: "discovery",
    image: "/assets/rest-tunnel-lavage.webp",
    description: "La station de lavage auto est ferm\xE9e. Dans le tunnel, les rouleaux g\xE9ants pendent comme des paresseux bleus. Ils sont secs, \xE9pais, et moelleux au-del\xE0 du raisonnable.",
    choices: [
      { text: "Dormir dans les rouleaux", risk: "normal", emoji: "\u{1F300}", outcomes: [
        { probability: 0.6, text: "Vous vous lovez entre deux rouleaux comme dans une m\xE9duse en peluche. C'est l'\xE9treinte la plus douce que la ville vous ait offerte depuis des ann\xE9es. On ne juge pas.", statChanges: { sleep: 19, mental: 8 } },
        { probability: 0.4, text: "Le g\xE9rant lance le cycle test \xE0 7h. Vous traversez le programme \xAB Confort Plus \xBB : mousse, rouleaux, s\xE9chage. Vous ressortez titubant, TR\xC8S propre, poursuivi par votre propre \xE9cho savonneux.", statChanges: { sleep: 10, dignity: 10, health: -3, mental: -3 } }
      ] },
      { text: "Dormir dans la cabine de l'aspirateur", risk: "safe", emoji: "\u{1F9F9}", outcomes: [
        { probability: 1, text: "La gu\xE9rite de l'aspirateur \xE0 jetons : un m\xE8tre carr\xE9 vitr\xE9, \xE0 l'abri du vent. Vous dormez en gardien du temple de la propret\xE9 automobile.", statChanges: { sleep: 12 } }
      ] }
    ]
  },
  {
    id: "rest-menuiserie",
    title: "La Menuiserie",
    type: "discovery",
    image: "/assets/rest-menuiserie.webp",
    description: "La menuiserie artisanale laisse sa cour ouverte. Une montagne de sciure fra\xEEche fume doucement dans un coin, ti\xE8de de la journ\xE9e de rabot. \xC7a sent le pin et le travail bien fait.",
    choices: [
      { text: "Dormir dans la sciure ti\xE8de", risk: "safe", emoji: "\u{1FAB5}", outcomes: [
        { probability: 0.7, text: "La sciure \xE9pouse, isole, embaume. Vous dormez dans un nuage de pin des Landes. Au r\xE9veil, vous sentez le chalet. C'est une promotion olfactive consid\xE9rable.", statChanges: { sleep: 18, mental: 7, dignity: 2 } },
        { probability: 0.3, text: "Le menuisier vous d\xE9couvre \xE0 7h, ni surpris ni f\xE2ch\xE9 : \xAB la sciure, c'est le lit du compagnon. \xBB Il vous paie le caf\xE9 et une heure de pon\xE7age. Vos mains sentent la cire d'abeille.", statChanges: { sleep: 13, thirst: 6, mental: 6 }, moneyChange: 3 }
      ] },
      { text: "Dormir dans l'armoire en cours de fabrication", risk: "normal", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.5, text: "L'armoire normande \xE0 peine vernie, couch\xE9e sur des tr\xE9teaux : un lit clos d'artisan. Vous dormez dans un meuble de ma\xEEtre. Peu de gens peuvent en dire autant.", statChanges: { sleep: 16, mental: 6 } },
        { probability: 0.5, text: "Le vernis n'\xE9tait pas sec. Vous vous r\xE9veillez vaguement coll\xE9, avec un motif de ch\xEAne imprim\xE9 sur la joue. Il part en trois jours. Le souvenir, jamais.", statChanges: { sleep: 12, dignity: -4, mental: 2 } }
      ] }
    ]
  },
  {
    id: "rest-gymnase-tapis",
    title: "Les Tapis du Gymnase",
    type: "discovery",
    image: "/assets/rest-gymnase-tapis.webp",
    description: "La fen\xEAtre du gymnase scolaire ferme mal depuis toujours, tout le quartier le sait. \xC0 l'int\xE9rieur : la pile de tapis de gym, deux m\xE8tres de mousse bleue r\xE9glementaire.",
    choices: [
      { text: "Dormir au sommet de la pile", risk: "normal", emoji: "\u{1F938}", outcomes: [
        { probability: 0.7, text: "Deux m\xE8tres de mousse homologu\xE9e \xC9ducation Nationale. Vous dormez \xE0 l'altitude du confort public. Le drapeau du sommeil est plant\xE9.", statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.3, text: "Le cours de gym de 8h entre en trombe. Vous descendez de la pile sous les yeux de trente \xE9l\xE8ves. Le prof, pragmatique : \xAB au moins vous, vous savez faire une roulade avant de partir ? \xBB Vous la faites. Ovation.", statChanges: { sleep: 13, dignity: -3, mental: 8 }, respectChange: 1 }
      ] },
      { text: "Se rouler dans le tapis de judo", risk: "normal", emoji: "\u{1F94B}", outcomes: [
        { probability: 0.6, text: "Enroul\xE9 dans un tatami souple comme une cr\xEApe humaine, vous \xEAtes invisible et isol\xE9. Technique ancestrale. Nuit impeccable.", statChanges: { sleep: 17, mental: 4 } },
        { probability: 0.4, text: "Trop bien roul\xE9 : impossible de sortir seul. Le gardien vous d\xE9roule \xE0 7h comme un standard t\xE9l\xE9phonique des ann\xE9es 50 d\xE9roule un c\xE2ble. Fou rire mutuel obligatoire.", statChanges: { sleep: 12, dignity: -4, mental: 5 } }
      ] }
    ]
  },
  {
    id: "rest-souffle-boulangerie",
    title: "Le Soupirail de la Boulangerie",
    type: "discovery",
    image: "/assets/rest-souffle-boulangerie.webp",
    description: "Le soupirail du fournil souffle un air chaud qui sent le levain d\xE8s 3h du matin. Le meilleur radiateur de la ville est une bouche de trottoir qui embaume le pain.",
    choices: [
      { text: "Dormir sur le soupirail", risk: "safe", emoji: "\u{1F956}", outcomes: [
        { probability: 0.7, text: "La chaleur du four monte \xE0 travers vous comme une mar\xE9e douce. Vous dormez dans l'odeur de la premi\xE8re fourn\xE9e. Le r\xE9veil creuse l'estomac et remplit l'\xE2me.", statChanges: { sleep: 17, health: 3, mental: 7, hunger: -4 } },
        { probability: 0.3, text: "Le boulanger vous conna\xEEt maintenant. Ce matin, la baguette \xAB trop cuite \xBB atterrit \xE0 c\xF4t\xE9 de vous, encore br\xFBlante, sans un mot. Le langage du fournil est silencieux et croustillant.", statChanges: { sleep: 14, hunger: 15, mental: 8 } }
      ] },
      { text: "Proposer un coup de main au fournil", risk: "normal", emoji: "\u{1F468}\u200D\u{1F373}", outcomes: [
        { probability: 0.5, text: "De 4h \xE0 7h, vous enfournez, farinez, portez. Pay\xE9 en pain chaud, chocolatines invendables et sommeil m\xE9rit\xE9 sur les sacs de farine. La nuit la plus utile du mois.", statChanges: { hunger: 22, sleep: 12, mental: 8 }, moneyChange: 4 },
        { probability: 0.5, text: "\xAB Les mains, faut les montrer \xE0 la m\xE9decine du travail. \xBB La r\xE9glementation a le dernier mot, mais il vous laisse le caf\xE9 et le croissant du refus. Un refus tr\xE8s digeste.", statChanges: { hunger: 10, thirst: 6, sleep: 8 } }
      ] }
    ]
  },
  {
    id: "rest-chapelle-famille",
    title: "La Chapelle de Famille",
    type: "narrative",
    image: "/assets/rest-chapelle-famille.webp",
    description: "Au cimeti\xE8re, la chapelle de la famille de Brissac-Montmorency est entrouverte depuis des ann\xE9es. Banc de marbre, vitrail, et des voisins d'un calme absolu. Garanti.",
    choices: [
      { text: "Dormir chez les Brissac-Montmorency", risk: "normal", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 0.7, text: "Le silence des grandes familles. Vous dormez sous un vitrail bleu, invit\xE9 posthume de gens tr\xE8s bien. Au matin, vous \xE9poussetez le banc. Le savoir-vivre n'a pas d'adresse.", statChanges: { sleep: 19, mental: 7 } },
        { probability: 0.3, text: "La derni\xE8re descendante vient fleurir la chapelle \xE0 l'aube. Elle vous trouve, ne crie pas, s'assoit : \xAB au moins quelqu'un leur tient compagnie. \xBB Elle revient chaque semaine. Avec des sandwichs, d\xE9sormais.", statChanges: { sleep: 14, hunger: 10, mental: 10 }, respectChange: 2 }
      ] },
      { text: "Rester dehors, entre les ifs", risk: "safe", emoji: "\u{1F332}", outcomes: [
        { probability: 1, text: "Les ifs coupent le vent, les morts font pas de bruit. On dort bien chez ceux qui n'ont plus rien \xE0 prouver.", statChanges: { sleep: 13, mental: 4 } }
      ] }
    ]
  },
  {
    id: "rest-remorque-couvertures",
    title: "La Remorque de D\xE9m\xE9nagement",
    type: "discovery",
    image: "/assets/rest-remorque-couvertures.webp",
    description: "Une remorque de location dort devant un pavillon, pleine de couvertures de d\xE9m\xE9nagement : ces grosses couvertures grises molletonn\xE9es, par dizaines. Une caverne d'Ali Baba du moelleux.",
    choices: [
      { text: "S'enfouir sous quinze couvertures", risk: "normal", emoji: "\u{1F9E3}", outcomes: [
        { probability: 0.6, text: "Quinze \xE9paisseurs de molleton gris : vous atteignez une temp\xE9rature de fournil et un moelleux de nuage administratif. Sommeil profond, presque g\xE9ologique.", statChanges: { sleep: 21, health: 3, mental: 6 } },
        { probability: 0.4, text: "Les d\xE9m\xE9nageurs attellent la remorque \xE0 7h. Vous toquez de l'int\xE9rieur au premier stop. On vous lib\xE8re \xE0 40 km, mais avec le caf\xE9 du routier et une couverture \xAB cadeau de la bo\xEEte \xBB. Le retour en stop est fourni par le destin.", statChanges: { sleep: 15, mental: -3, thirst: 6 }, itemGain: { id: "couverture-demenagement", name: "Couverture de d\xE9m\xE9nageur", emoji: "\u{1F9E3}", type: "armor", value: 7, defenseBonus: 2 } }
      ] },
      { text: "En emprunter juste une, discr\xE8tement", risk: "safe", emoji: "\u{1F92B}", outcomes: [
        { probability: 1, text: "Une seule, la plus \xE9paisse, pli\xE9e sous le bras. La remorque n'y verra que du feu, et vos nuits prochaines non plus.", statChanges: { sleep: 8, mental: 4 }, itemGain: { id: "couverture-grise", name: "Couverture molletonn\xE9e", emoji: "\u{1F9E3}", type: "armor", value: 6, defenseBonus: 1 } }
      ] }
    ]
  },
  {
    id: "rest-kiosque-musique",
    title: "Le Kiosque \xE0 Musique",
    type: "discovery",
    image: "/assets/rest-kiosque-musique.webp",
    description: "Le kiosque \xE0 musique du parc, vide depuis la derni\xE8re fanfare. Toit en zinc, plancher sur\xE9lev\xE9, rambardes ouvrag\xE9es : une chambre ronde avec vue sur les massifs.",
    choices: [
      { text: "Dormir au centre de la sc\xE8ne", risk: "normal", emoji: "\u{1F3BA}", outcomes: [
        { probability: 0.7, text: "L'acoustique du kiosque amplifie doucement le vent dans les feuilles : la ville vous joue une berceuse en sourdine. Vous dormez en chef d'orchestre du silence.", statChanges: { sleep: 16, mental: 9 } },
        { probability: 0.3, text: "La fanfare municipale r\xE9p\xE8te \xE0 8h. Vous vous r\xE9veillez au centre d'un cercle de cuivres qui attaque \xAB El Bimbo \xBB. Le tuba vous salue d'un pouet compatissant. Vous saluez le public. Il y a un public.", statChanges: { sleep: 10, mental: 6, dignity: -4 } }
      ] },
      { text: "Dormir sous le plancher du kiosque", risk: "safe", emoji: "\u{1F573}\uFE0F", outcomes: [
        { probability: 1, text: "Le vide sanitaire du kiosque : sec, discret, \xE0 l'abri de tout. Vous dormez sous la musique en puissance, comme un secret de la R\xE9publique.", statChanges: { sleep: 13 } }
      ] }
    ]
  },
  {
    id: "rest-tente-expo",
    title: "La Tente d'Exposition",
    type: "discovery",
    image: "/assets/rest-tente-expo.webp",
    description: "Le magasin de sport a mont\xE9 sa tente familiale \xAB 6 places, montage 2 minutes \xBB en d\xE9monstration sur le parvis. Elle est rest\xE9e l\xE0. Mont\xE9e. Vide. Six places.",
    choices: [
      { text: "Occuper la chambre parentale", risk: "normal", emoji: "\u26FA", outcomes: [
        { probability: 0.6, text: "Tapis de sol int\xE9gr\xE9, moustiquaire, double toit. Le camping sauvage en plein centre-ville, homologu\xE9 par la vitrine d'\xE0 c\xF4t\xE9. Vous dormez en famille de d\xE9monstration, section p\xE8re fatigu\xE9.", statChanges: { sleep: 18, mental: 7 } },
        { probability: 0.4, text: "Le vendeur ouvre la tente \xE0 9h pour sa d\xE9mo... et improvise : \xAB et comme vous voyez, elle est si confortable qu'on y dort VRAIMENT. \xBB Vous saluez les clients. Deux tentes vendues. Il vous glisse un billet de \xAB commercial \xBB.", moneyChange: 5, statChanges: { sleep: 14, dignity: -2, mental: 6 } }
      ] },
      { text: "Emprunter juste le tapis de sol", risk: "safe", emoji: "\u{1F9FB}", outcomes: [
        { probability: 1, text: "Le tapis de sol de d\xE9monstration, roul\xE9 sous le bras. La tente en a vu d'autres. Votre dos, lui, d\xE9couvre le confort norv\xE9gien.", statChanges: { sleep: 8, mental: 3 }, itemGain: { id: "tapis-sol", name: "Tapis de sol norv\xE9gien", emoji: "\u{1F9FB}", type: "junk", value: 5 } }
      ] }
    ]
  }
];

// client/src/contexts/data/events2-beg.ts
var BEG_EVENTS_2 = [
  {
    id: "beg-sortie-boite",
    title: "La Sortie de Bo\xEEte",
    type: "social",
    image: "/assets/beg-sortie-boite.webp",
    description: "Cinq heures du matin. Les f\xEAtards sortent de bo\xEEte en titubant, la g\xE9n\xE9rosit\xE9 multipli\xE9e par le taux d'alcool\xE9mie. Fen\xEAtre de tir : quarante minutes.",
    choices: [
      { text: "Tendre la main aux plus joyeux", risk: "normal", emoji: "\u{1F57A}", outcomes: [
        { probability: 0.6, text: "Pluie de pi\xE8ces, accolades non sollicit\xE9es, et un \xAB t'es un vrai toi \xBB r\xE9p\xE9t\xE9 onze fois. L'ivresse des autres est un m\xE9tier d'appoint.", moneyChange: 7, statChanges: { mental: 4, dignity: -2 } },
        { probability: 0.4, text: "Un groupe d\xE9cr\xE8te que vous \xEAtes \xAB le boss \xBB et exige que vous dansiez avec eux. Vous dansez. Sur le trottoir. \xC0 5h. Il y a des vid\xE9os.", moneyChange: 3, statChanges: { mental: 8, sleep: -5, dignity: -4 } }
      ] },
      { text: "Aider les naufrag\xE9s \xE0 trouver un taxi", risk: "safe", emoji: "\u{1F695}", outcomes: [
        { probability: 0.7, text: "Trois clients guid\xE9s, trois pourboires de gratitude vacillante. Le dernier vous serre la main avec une \xE9motion inexplicable et huit pi\xE8ces.", moneyChange: 5, respectChange: 2 },
        { probability: 0.3, text: "L'un d'eux vomit sur vos chaussures et s'excuse en billets. C'est le tarif le plus \xE9trange de votre carri\xE8re, mais c'est le tarif.", moneyChange: 8, statChanges: { dignity: -8, mental: -2 } }
      ] }
    ]
  },
  {
    id: "beg-marathon",
    title: "Le Marathon",
    type: "social",
    image: "/assets/beg-marathon.webp",
    description: "Le marathon traverse le quartier : des milliers de coureurs en souffrance volontaire, et des spectateurs qui distribuent tout ce qui se mange, se boit ou s'encourage.",
    choices: [
      { text: "Se poster pr\xE8s du ravitaillement", risk: "safe", emoji: "\u{1F3C3}", outcomes: [
        { probability: 0.7, text: "Bananes entam\xE9es, gourdes \xE0 moiti\xE9 pleines, barres tomb\xE9es : le ravitaillement d\xE9borde et personne ne compte. Vous mangez comme un athl\xE8te, sans courir. Le g\xE9nie.", statChanges: { hunger: 15, thirst: 15, mental: 4 } },
        { probability: 0.3, text: "Pris pour un b\xE9n\xE9vole, vous tendez des gobelets pendant deux heures. \xC9puisant, hydratant, et le staff partage la caisse de bananes finale avec vous.", statChanges: { hunger: 12, thirst: 8, mental: 8 }, respectChange: 3, moneyChange: 2 }
      ] },
      { text: "Courir les 500 derniers m\xE8tres", risk: "risky", emoji: "\u{1F3C5}", outcomes: [
        { probability: 0.5, text: "La foule vous acclame sans v\xE9rifier le dossard. Quelqu'un vous passe une m\xE9daille \xAB finisher \xBB. Techniquement, vous avez fini. Personne ne demande quoi.", statChanges: { mental: 15, dignity: 10 }, respectChange: 2 },
        { probability: 0.5, text: "Un juge de course vous prend en chasse sur 300 m\xE8tres. Il est plus entra\xEEn\xE9 que vous. Tout le monde est plus entra\xEEn\xE9 que vous.", statChanges: { health: -4, mental: -3, dignity: -4 } }
      ] }
    ]
  },
  {
    id: "beg-marche-noel",
    title: "Le March\xE9 de No\xEBl",
    type: "social",
    image: "/assets/beg-marche-noel.webp",
    description: "Vin chaud, sapins, chorales et culpabilit\xE9 de fin d'ann\xE9e : le march\xE9 de No\xEBl est une mine d'or \xE9motionnelle \xE0 ciel ouvert.",
    choices: [
      { text: "Se poster pr\xE8s de la cr\xE8che", risk: "normal", emoji: "\u{1F384}", outcomes: [
        { probability: 0.6, text: "Entre le petit J\xE9sus et le stand de churros, l'esprit de No\xEBl sort les portefeuilles. Une dame vous offre m\xEAme des chaussettes \xE0 renne. La magie op\xE8re.", moneyChange: 8, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Le P\xE8re No\xEBl officiel du march\xE9 vous fait d\xE9guerpir : \xAB c'est MON spot. \xBB Un P\xE8re No\xEBl syndiqu\xE9. Vous c\xE9dez le terrain avec les pi\xE8ces d\xE9j\xE0 tomb\xE9es.", moneyChange: 2, statChanges: { mental: -4 }, respectChange: -1, addFlag: "ennemi-pere-noel" }
      ] },
      { text: "Chanter des chants de No\xEBl", risk: "normal", emoji: "\u{1F3B5}", outcomes: [
        { probability: 0.5, text: "Votre \xAB Petit Papa No\xEBl \xBB \xE9raill\xE9 \xE9meut aux larmes une g\xE9n\xE9ration enti\xE8re. Le chapeau d\xE9borde. Un enfant vous demande si vous \xEAtes le vrai. Vous ne d\xE9mentez pas.", moneyChange: 9, statChanges: { dignity: 5, mental: 6 } },
        { probability: 0.5, text: "Vous ne connaissez que le premier couplet. En boucle. Vingt fois. Le stand de vin chaud vous paie pour... varier. \xC7a compte comme un cachet.", moneyChange: 3, statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "beg-feu-rouge",
    title: "Le Grand Carrefour",
    type: "social",
    image: "/assets/beg-feu-rouge.webp",
    description: "Le carrefour aux quatre-vingt-dix secondes de feu rouge : une \xE9ternit\xE9 \xE0 l'\xE9chelle d'un pare-brise, un fonds de commerce \xE0 l'\xE9chelle d'un homme.",
    choices: [
      { text: "Laver les pare-brise", risk: "normal", emoji: "\u{1F9FD}", outcomes: [
        { probability: 0.5, text: "Coup de raclette, sourire, pi\xE8ce. La cha\xEEne de production tourne bien : sept voitures, six pi\xE8ces, un pouce lev\xE9. L'industrie automobile vous doit beaucoup.", moneyChange: 6, statChanges: { mental: 3 } },
        { probability: 0.3, text: "Vitres teint\xE9es, essuie-glaces d\xE9clench\xE9s en d\xE9fense anti-a\xE9rienne, et un scooter qui vous fr\xF4le : le carrefour est une jungle avec des clignotants.", moneyChange: 2, statChanges: { mental: -4, dignity: -3 } },
        { probability: 0.2, text: "Un taxi vous fait signe : \xAB le pare-brise ET les r\xE9tros, champion. \xBB Il paie double et vous raconte ses trente ans de carrefour. Une encyclop\xE9die en Renault.", moneyChange: 5, respectChange: 2, statChanges: { mental: 4 } }
      ] },
      { text: "Faire le tour avec une pancarte dr\xF4le", risk: "safe", emoji: "\u{1F4CB}", outcomes: [
        { probability: 0.6, text: "\xAB Pas de QR code, monnaie accept\xE9e. \xBB Les vitres se baissent en riant. L'humour reste la meilleure raclette.", moneyChange: 5, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Tout le monde regarde son t\xE9l\xE9phone. Vous pourriez brandir n'importe quoi. Vous testez : rien. La pancarte prend l'humidit\xE9, vous prenez sur vous.", moneyChange: 1, statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-queue-lancement",
    title: "La Queue du Lancement",
    type: "social",
    image: "/assets/beg-queue-lancement.webp",
    description: "Devant la boutique de t\xE9l\xE9phones, trois cents personnes campent depuis l'aube pour un rectangle \xE0 1400\u20AC. Certains ont des tentes. Vous avez l'expertise.",
    choices: [
      { text: "Vendre vos services de gardien de place", risk: "normal", emoji: "\u{1F4F1}", outcomes: [
        { probability: 0.6, text: "Garder la place 47 pendant les pauses pipi : trois clients, tarif libre, paiement imm\xE9diat. Votre premi\xE8re client\xE8le premium. Ils reviendront l'an prochain.", moneyChange: 8, statChanges: { mental: 4 } },
        { probability: 0.4, text: "Une embrouille de resquille \xE9clate et on vous accuse, vous, l'homme sans t\xE9l\xE9phone. L'ironie est totale, l'expulsion aussi. Un campeur honteux vous glisse deux pi\xE8ces.", moneyChange: 2, statChanges: { mental: -5, dignity: -3 } }
      ] },
      { text: "Mendier avec la pancarte \xAB pas pour un t\xE9l\xE9phone \xBB", risk: "safe", emoji: "\u{1F60F}", outcomes: [
        { probability: 0.7, text: "L'ironie fait mouche : la file enti\xE8re rit jaune et paie. Le vigile lui-m\xEAme met une pi\xE8ce. Vous \xEAtes la meilleure critique sociale du trottoir.", moneyChange: 7, statChanges: { mental: 6 }, respectChange: 1 },
        { probability: 0.3, text: "Un influenceur vous filme \xAB pour d\xE9noncer \xBB, mon\xE9tise la vid\xE9o, et ne donne rien. Vous \xEAtes viral et pauvre. Le monde moderne en une transaction.", statChanges: { mental: -4, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "beg-zoo",
    title: "La Sortie du Zoo",
    type: "social",
    image: "/assets/beg-zoo.webp",
    description: "La sortie du zoo : familles \xE9puis\xE9es, enfants surexcit\xE9s, glaces fondues et bonne humeur solvable. Le meilleur public de la ville sort toujours d'entre les girafes.",
    choices: [
      { text: "Imiter les animaux pour les enfants", risk: "normal", emoji: "\u{1F981}", outcomes: [
        { probability: 0.6, text: "Votre otarie est bluffante, votre lion perfectible, votre flamant rose inoubliable. Les parents paient le spectacle, les enfants exigent un rappel.", moneyChange: 6, statChanges: { mental: 6, dignity: -2 } },
        { probability: 0.4, text: "Vous imitez le paon TROP bien : un vrai paon \xE9chapp\xE9 vous r\xE9pond, roue d\xE9ploy\xE9e, dans un face-\xE0-face que personne n'oubliera. Le zoo vous d\xE9dommage pour la capture.", moneyChange: 4, statChanges: { mental: 4, dignity: -3 }, respectChange: 1 }
      ] },
      { text: "Simplement tendre son chapeau", risk: "safe", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.6, text: "Les pi\xE8ces des familles tombent, arrondies \xE0 l'humeur du dimanche. Un grand-p\xE8re ajoute un billet \xAB parce que vous, au moins, vous \xEAtes en libert\xE9 \xBB. \xC0 m\xE9diter.", moneyChange: 4, statChanges: { mental: 3 } },
        { probability: 0.4, text: "Un enfant d\xE9pose son ticket du zoo dans le chapeau : \xAB pour que tu puisses voir les singes. \xBB Vous encadreriez presque ce ticket.", moneyChange: 1, statChanges: { mental: 10 } }
      ] }
    ]
  },
  {
    id: "beg-terrasse-brunch",
    title: "La Terrasse du Brunch",
    type: "social",
    image: "/assets/beg-terrasse-brunch.webp",
    description: "Le dimanche, la terrasse du brunch d\xE9borde d'avocado toasts \xE0 17\u20AC et de conversations sur l'immobilier. La culpabilit\xE9 y est servie \xE0 volont\xE9.",
    choices: [
      { text: "Passer entre les tables, digne", risk: "normal", emoji: "\u{1F951}", outcomes: [
        { probability: 0.5, text: "La culpabilit\xE9 du dimanche matin paie mieux qu'un travail : quatre tables, quatre dons, dont un billet pli\xE9 \xAB discr\xE8tement \xBB. Merci l'avocat \xE0 17\u20AC.", moneyChange: 8, statChanges: { dignity: -2 } },
        { probability: 0.3, text: "Le patron vous \xE9conduit mais vous rattrape en cuisine : un sac entier \xAB d'invendus du brunch \xBB. Le granola bio, c'est ceux qui l'ont pas pay\xE9 qui en parlent le mieux.", statChanges: { hunger: 18, mental: 4 } },
        { probability: 0.2, text: "Quelqu'un propose de vous prendre en photo \xAB pour sensibiliser \xBB, contre un billet. Vous posez. La sensibilisation a bon dos, le billet est r\xE9el.", moneyChange: 5, statChanges: { dignity: -5 } }
      ] },
      { text: "Attendre la fermeture pour les restes", risk: "safe", emoji: "\u23F3", outcomes: [
        { probability: 0.7, text: "Le serveur vous pr\xE9pare un doggy-bag de restes chics : \u0153ufs b\xE9n\xE9dicte froids et pancakes fatigu\xE9s. Le brunch des braves.", statChanges: { hunger: 20, thirst: 5, mental: 3 } },
        { probability: 0.3, text: "\xAB Tout part au compost, r\xE9glementation. \xBB Vous regardez des pancakes partir au compost. Le compost mange mieux que vous. Dure journ\xE9e philosophique.", statChanges: { mental: -4, hunger: 4 } }
      ] }
    ]
  },
  {
    id: "beg-videur",
    title: "Le Videur Compatissant",
    type: "social",
    image: "/assets/beg-videur.webp",
    description: "Le videur de la bo\xEEte chic s'ennuie ferme entre deux refus. Deux m\xE8tres, cent trente kilos, et un regard qui vous a d\xE9j\xE0 class\xE9 \xAB inoffensif, causant \xBB.",
    choices: [
      { text: "Tenir compagnie au colosse", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.7, text: "Trois heures de philosophie de comptoir debout. Il partage son sandwich, les pi\xE8ces du vestiaire, et sa th\xE9orie sur les gens \xAB qui puent des chaussures mais pas du c\u0153ur \xBB. Vous \xEAtes cit\xE9 en exemple.", statChanges: { hunger: 12, mental: 6 }, moneyChange: 4, respectChange: 2, addFlag: "pote-videur" },
        { probability: 0.3, text: "Il vous apprend deux prises de self-d\xE9fense \xAB pour la rue \xBB sur un lampadaire consentant. Le lampadaire a perdu, vous avez appris.", statChanges: { mental: 6, health: 3 }, respectChange: 2 }
      ] },
      { text: "Trier les recal\xE9s avec lui", risk: "normal", emoji: "\u{1F60E}", outcomes: [
        { probability: 0.6, text: "Votre \u0153il de la rue rep\xE8re les emmerdeurs \xE0 vingt m\xE8tres. Le videur valide chaque pronostic et paie \xAB au bon client \xBB. Une carri\xE8re de physionomiste s'ouvre.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Vous recalez un type en jogging : c'\xE9tait le patron de la bo\xEEte. Le videur pleure de rire. Le patron, moins. La collaboration prend fin, le fou rire reste.", moneyChange: 1, statChanges: { mental: 4 }, respectChange: -1 }
      ] }
    ]
  },
  {
    id: "beg-karaoke",
    title: "La Sortie du Karaok\xE9",
    type: "social",
    image: "/assets/beg-karaoke.webp",
    description: "Le bar karaok\xE9 recrache ses clients \xE0 2h : cordes vocales d\xE9truites, egos gonfl\xE9s \xE0 l'h\xE9lium, et une g\xE9n\xE9rosit\xE9 proportionnelle au nombre de \xAB I Will Survive \xBB chant\xE9s.",
    choices: [
      { text: "Complimenter leurs performances", risk: "safe", emoji: "\u{1F3A4}", outcomes: [
        { probability: 0.7, text: "\xAB Je vous ai entendu de dehors, quelle voix ! \xBB Techniquement vrai : tout le quartier les a entendus. Les artistes flatt\xE9s paient cash. La critique musicale nourrit son homme.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.3, text: "Une bande vous embarque \xE0 l'int\xE9rieur pour \xAB un dernier morceau \xBB. Vous chantez \xAB Les Lacs du Connemara \xBB devant douze inconnus debout. Chapeau plein, gorge morte, l\xE9gende n\xE9e.", moneyChange: 8, statChanges: { mental: 10, sleep: -6, dignity: 3 } }
      ] },
      { text: "Chanter dans la rue, en concurrence", risk: "risky", emoji: "\u{1F3B6}", outcomes: [
        { probability: 0.5, text: "Votre a cappella de trottoir surclasse leur machine \xE0 3000\u20AC. Le patron du karaok\xE9 sort vous \xE9couter, vex\xE9 et admiratif. Il paie \xAB le cachet du rival \xBB.", moneyChange: 7, statChanges: { mental: 8 }, respectChange: 2 },
        { probability: 0.5, text: "Un client \xE9m\xE9ch\xE9 veut un duel de chant. Il gagne. Un homme en chemise hawa\xEFenne vous bat aux points sur du C\xE9line Dion. Il faut savoir perdre.", moneyChange: 2, statChanges: { mental: -3, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "beg-cours-yoga",
    title: "Le Yoga du Parc",
    type: "social",
    image: "/assets/beg-cours-yoga.webp",
    description: "Trente personnes saluent le soleil sur des tapis \xE0 80\u20AC, encadr\xE9es par une prof qui parle d'\xAB abondance \xBB et d'\xAB ouverture au monde \xBB. Le monde, c'est vous. Voyons voir l'ouverture.",
    choices: [
      { text: "S'installer au fond et suivre le cours", risk: "normal", emoji: "\u{1F9D8}", outcomes: [
        { probability: 0.6, text: "La prof vous int\xE8gre d'un geste : \xAB l'accueil, c'est \xC7A le yoga. \xBB \xC0 la fin, elle fait circuler un chapeau \xAB pour notre invit\xE9 \xBB. Trente namast\xE9s et un chapeau lourd. L'abondance, donc.", moneyChange: 6, statChanges: { mental: 8, health: 3 } },
        { probability: 0.4, text: "Vous vous endormez en Savasana, la posture du sommeil. Techniquement, vous \xEAtes le meilleur \xE9l\xE8ve. Vos ronflements guident la m\xE9ditation collective. On vous remercie \xAB pour l'ancrage \xBB.", statChanges: { sleep: 10, mental: 4, dignity: -3 } }
      ] },
      { text: "Garder les sacs pendant la s\xE9ance", risk: "safe", emoji: "\u{1F392}", outcomes: [
        { probability: 0.7, text: "Trente sacs surveill\xE9s, z\xE9ro incident, pourboires d\xE9tendus \xE0 la sortie. Les gens zen paient bien la tranquillit\xE9 d'esprit. C'est m\xEAme tout leur budget.", moneyChange: 5, respectChange: 1 },
        { probability: 0.3, text: "Un corbeau ouvre un sac et vole une barre de c\xE9r\xE9ales sous vos yeux. Vous poursuivez le corbeau. Le cours entier regarde. Le zen a ses limites, le corbeau n'en a pas.", moneyChange: 2, statChanges: { mental: -2, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "beg-chef-etoile",
    title: "Le Chef \xC9toil\xE9",
    type: "social",
    image: "/assets/beg-chef-etoile.webp",
    description: "Le restaurant gastronomique jette ses assiettes \xAB imparfaites \xBB \xE0 23h. Le chef fume dehors, l'\u0153il sombre, en gueulant en cuisine par la porte entrouverte. Un artiste.",
    choices: [
      { text: "Complimenter sa cuisine (de loin)", risk: "safe", emoji: "\u{1F468}\u200D\u{1F373}", outcomes: [
        { probability: 0.6, text: "\xAB Vous en pensez quoi, VOUS, du pigeon en deux fa\xE7ons ? \xBB Il vous fait go\xFBter le plat \xAB rat\xE9 \xBB du soir. C'est le meilleur repas de votre d\xE9cennie. Le pigeon est veng\xE9.", statChanges: { hunger: 30, mental: 15, dignity: 5 } },
        { probability: 0.4, text: "Il grommelle un truc sur les critiques et rentre. Mais son second sort deux minutes plus tard avec un contenant : \xAB le chef dit que c'est pour le connaisseur. \xBB", statChanges: { hunger: 18, thirst: 4, mental: 6 } }
      ] },
      { text: "Proposer d'\xEAtre go\xFBteur-critique", risk: "risky", emoji: "\u{1F37D}\uFE0F", outcomes: [
        { probability: 0.5, text: "\xAB Enfin un palais sans filtre ! \xBB Votre verdict sur la sauce (\xAB \xE7a manque de gras \xBB) le bouleverse. Repas complet, pi\xE8ce, et rendez-vous jeudi pour le nouveau menu.", statChanges: { hunger: 25, mental: 8 }, moneyChange: 4, respectChange: 2 },
        { probability: 0.5, text: "\xAB Tout le monde est critique. TOUT LE MONDE. \xBB La porte claque. Une serveuse vous glisse du pain en s'excusant pour l'artiste. Les grands hommes sont difficiles.", statChanges: { hunger: 8, mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-braderie",
    title: "La Grande Braderie",
    type: "social",
    image: "/assets/beg-braderie.webp",
    description: "La braderie annuelle : la ville enti\xE8re vend son grenier sur le trottoir et boit du blanc \xE0 10h du matin. L'argent liquide circule comme au si\xE8cle dernier.",
    choices: [
      { text: "Porter les cartons des chineurs", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Sherpa officiel de la braderie : quatre commodes, une armoire, dix cartons. Les pourboires tombent, et une dame vous offre le vase que vous venez de porter. Il est affreux. Il est \xE0 vous.", moneyChange: 6, statChanges: { health: -3, mental: 4 }, itemGain: { id: "vase-affreux", name: "Vase affreux (cadeau)", emoji: "\u{1F3FA}", type: "junk", value: 5 } },
        { probability: 0.3, text: "Un carton de vaisselle vous glisse des mains. Le fracas fait se retourner la moiti\xE9 de la braderie. Retenue sur pourboire, mais le client avoue : \xAB elle \xE9tait moche de toute fa\xE7on. \xBB", moneyChange: 2, statChanges: { mental: -3, dignity: -2 } }
      ] },
      { text: "Chiner dans les tas \xAB tout doit dispara\xEEtre \xBB", risk: "normal", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.5, text: "Une veste en velours presque neuve, \xE0 votre taille, \xE0 un prix symbolique que le vendeur arrondit \xE0 z\xE9ro \xAB pour vider \xBB. La braderie a ses miracles.", statChanges: { dignity: 8, mental: 6 }, itemGain: { id: "veste-braderie", name: "Veste de la braderie", emoji: "\u{1F9E5}", type: "armor", value: 6, defenseBonus: 1 } },
        { probability: 0.5, text: "Que des chargeurs de t\xE9l\xE9phones morts et des puzzles incomplets. Vous prenez un puzzle. Il manque 40 pi\xE8ces. Comme \xE0 vous. Solidarit\xE9.", statChanges: { mental: 3 }, itemGain: { id: "puzzle-incomplet", name: "Puzzle (960/1000 pi\xE8ces)", emoji: "\u{1F9E9}", type: "junk", value: 1, effect: { mental: 4 } } }
      ] }
    ]
  },
  {
    id: "beg-food-trucks",
    title: "Le Festival de Food Trucks",
    type: "social",
    image: "/assets/beg-food-trucks.webp",
    description: "Douze camions, mille odeurs, des files d'attente vertigineuses et des assiettes \xE0 moiti\xE9 finies qui partent \xE0 la poubelle. Un scandale logistique. Une opportunit\xE9.",
    choices: [
      { text: "Se poster pr\xE8s du retour des plateaux", risk: "normal", emoji: "\u{1F32E}", outcomes: [
        { probability: 0.6, text: "Les gens pr\xE9f\xE8rent vous tendre leur assiette entam\xE9e que la jeter. En deux heures, vous go\xFBtez la carte enti\xE8re du festival. Le critique gastronomique le mieux nourri de la ville.", statChanges: { hunger: 22, mental: 4, dignity: -4 } },
        { probability: 0.4, text: "Le r\xE9gisseur vous rep\xE8re... et vous embauche au tri des d\xE9chets, pay\xE9 en tacos et en pi\xE8ces. Le seul CDD d'une journ\xE9e dont le ticket-restaurant est un taco.", statChanges: { hunger: 18, mental: 5 }, moneyChange: 4, respectChange: 2 }
      ] },
      { text: "Jouer les guides gastronomiques", risk: "normal", emoji: "\u{1F5FA}\uFE0F", outcomes: [
        { probability: 0.6, text: "\xAB Le cor\xE9en : 40 minutes. Le libanais : 10 minutes et meilleur. \xBB Vos conseils de file d'attente valent pourboire. L'information est la denr\xE9e la plus rentable du festival.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Vous envoyez tout le monde au camion le plus lent par erreur. Une file de quarante personnes vous cherche. Vous d\xE9gustez votre erreur en marchant vite.", moneyChange: 1, statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-averse",
    title: "L'Averse Soudaine",
    type: "social",
    image: "/assets/beg-averse.webp",
    description: "Un orage \xE9clate sans pr\xE9venir sur la place. Vous \xEAtes le seul \xEAtre humain du quartier \xE0 poss\xE9der... un parapluie cass\xE9. La demande explose, l'offre c'est vous.",
    choices: [
      { text: "Escorter les passants \xE0 l'abri", risk: "normal", emoji: "\u2614", outcomes: [
        { probability: 0.6, text: "Le taxi-parapluie fait recette : dix m\xE8tres, une pi\xE8ce, sourire compris. Votre moiti\xE9 de parapluie prot\xE8ge des moiti\xE9s de clients, tout le monde accepte le contrat.", moneyChange: 7, statChanges: { mental: 5, health: -2 } },
        { probability: 0.4, text: "Le parapluie rend l'\xE2me sur une cliente en tailleur, qui finit rinc\xE9e. Elle vous paie quand m\xEAme \xAB pour l'intention \xBB. L'intention \xE9tait s\xE8che.", moneyChange: 2, statChanges: { mental: -3, dignity: -3 } }
      ] },
      { text: "Louer votre porche sec", risk: "safe", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.7, text: "Votre porche devient un abri premium. Les r\xE9fugi\xE9s de l'averse paient le droit d'asile en pi\xE8ces et en conversation. Propri\xE9taire de dix minutes, \xE7a fait quelque chose.", moneyChange: 5, statChanges: { mental: 5 }, respectChange: 1 },
        { probability: 0.3, text: "Quinze personnes s'entassent sous votre porche, ambiance sardines solidaires. Personne ne paie mais quelqu'un partage ses churros. L'\xE9conomie du troc sous la pluie.", statChanges: { hunger: 10, mental: 6 } }
      ] }
    ]
  },
  {
    id: "beg-bingo",
    title: "La Sortie du Loto des Anciens",
    type: "social",
    image: "/assets/beg-bingo.webp",
    description: "La salle des f\xEAtes lib\xE8re le loto du jeudi : quatre-vingts retrait\xE9s, des cabas \xE0 roulettes, et une gagnante du jambon qui rayonne comme un phare.",
    choices: [
      { text: "F\xE9liciter la gagnante du jambon", risk: "safe", emoji: "\u{1F356}", outcomes: [
        { probability: 0.7, text: "\xAB Soixante ans que je joue ! \xBB Elle raconte le quine victorieux en d\xE9tail, puis coupe le jambon EN DEUX : \xAB \xE0 mon \xE2ge, on partage sa chance. \xBB Un demi-jambon. Une reine.", statChanges: { hunger: 25, mental: 10 }, respectChange: 1 },
        { probability: 0.3, text: "Elle vous prend pour l'animateur du loto et vous f\xE9licite pour \xAB la belle soir\xE9e \xBB. Vous acceptez le malentendu et le paquet de madeleines qui va avec.", statChanges: { hunger: 10, mental: 5 } }
      ] },
      { text: "Aider \xE0 porter les cabas \xE0 roulettes", risk: "safe", emoji: "\u{1F6D2}", outcomes: [
        { probability: 0.7, text: "Six cabas raccompagn\xE9s, six pi\xE8ces, trois invitations \xE0 \xAB repasser go\xFBter \xBB et un pronostic m\xE9t\xE9o d\xE9taill\xE9. Les anciens paient en monnaie ET en humanit\xE9. Taux de change imbattable.", moneyChange: 5, statChanges: { mental: 8 }, respectChange: 2 },
        { probability: 0.3, text: "Monsieur Robert, 91 ans, refuse l'aide et vous met au d\xE9fi \xE0 la marche rapide. Il gagne. Devant t\xE9moins. Il vous console avec un caramel : \xAB c'est l'entra\xEEnement, petit. \xBB", statChanges: { mental: 4, dignity: -3, hunger: 2 } }
      ] }
    ]
  }
];

// client/src/contexts/data/events2-steal.ts
var STEAL_EVENTS_2 = [
  {
    id: "steal-distributeur-secoue",
    title: "Le Distributeur R\xE9calcitrant",
    type: "narrative",
    image: "/assets/steal-distributeur-secoue.webp",
    description: "Le distributeur de la gare a gard\xE9 le Twix ET la pi\xE8ce d'un voyageur furieux, parti en jurant. La machine vous nargue, repue.",
    choices: [
      { text: "La secouer m\xE9thodiquement", risk: "risky", emoji: "\u{1FAE8}", outcomes: [
        { probability: 0.5, text: "Trois secousses expertes : le Twix tombe, plus deux canettes en prime de sortie. La machine rend gorge. Justice m\xE9canique.", statChanges: { hunger: 15, thirst: 12, mental: 5 } },
        { probability: 0.3, text: "La machine bascule vers vous. Vous la retenez de justesse, seul, pendant dix secondes d'\xE9ternit\xE9. Un vigile vous aide \xE0 la redresser... puis vous escorte dehors.", statChanges: { health: -6, mental: -4, dignity: -3 } },
        { probability: 0.2, text: "L'alarme se d\xE9clenche. Une alarme. Sur un distributeur. Vous fuyez bredouille, poursuivi par un bip strident et le sentiment que le monde exag\xE8re.", statChanges: { mental: -5 } }
      ] },
      { text: "P\xEAcher la pi\xE8ce au fil de fer", risk: "normal", emoji: "\u{1F3A3}", outcomes: [
        { probability: 0.6, text: "Votre fil de fer remonte la pi\xE8ce, plus deux autres oubli\xE9es dans la trappe. La p\xEAche est bonne.", moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.4, text: "Le fil de fer reste coinc\xE9 dans la machine. Vous laissez votre mat\xE9riel sur place, comme un braqueur qui abandonne sa voiture au feu rouge.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "steal-chantier-cuivre",
    title: "Le Cuivre du Chantier",
    type: "narrative",
    image: "/assets/steal-chantier-cuivre.webp",
    description: "Le chantier est d\xE9sert, le grillage b\xE2ille, et des chutes de c\xE2ble cuivre brillent dans une benne. Le ferrailleur paie comptant, sans biographie.",
    choices: [
      { text: "Remplir un sac de chutes", risk: "risky", emoji: "\u{1F50C}", outcomes: [
        { probability: 0.5, text: "Cinq kilos de cuivre \xAB tomb\xE9s de la benne \xBB. Le ferrailleur p\xE8se, paie, et ne demande rien. C'est toute sa philosophie.", moneyChange: 12, statChanges: { mental: 3, dignity: -4 } },
        { probability: 0.3, text: "Le gardien de nuit surgit avec son chien. Vous passez le grillage en jetant le sac, le pantalon y laisse un morceau. Le chien garde le troph\xE9e.", statChanges: { health: -7, mental: -5, dignity: -5 } },
        { probability: 0.2, text: "Un ouvrier revenu chercher son casque vous surprend... et hausse les \xE9paules : \xAB les chutes, on les jette. Prends. Mais touche pas aux rouleaux neufs. \xBB Un code d'honneur.", moneyChange: 7, respectChange: 1 }
      ] },
      { text: "Ne prendre que ce qui d\xE9passe du grillage", risk: "normal", emoji: "\u{1F90F}", outcomes: [
        { probability: 0.7, text: "Techniquement, ce qui d\xE9passe du grillage est sur le trottoir. Votre avocat int\xE9rieur valide. Petit butin, conscience intacte.", moneyChange: 4, statChanges: { mental: 2 } },
        { probability: 0.3, text: "Ce qui d\xE9passait \xE9tait reli\xE9 \xE0 ce qui ne d\xE9passait pas. Le tout tombe avec fracas. Vous partez sans demander votre reste, ni le sien.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "steal-terrasse-pourboires",
    title: "Les Pourboires de la Terrasse",
    type: "narrative",
    image: "/assets/steal-terrasse-pourboires.webp",
    description: "Service de midi termin\xE9 : les tables de la terrasse sont couvertes de soucoupes \xE0 pourboires que le serveur, d\xE9bord\xE9, n'a pas encore ramass\xE9es.",
    choices: [
      { text: "Faire la moisson des soucoupes", risk: "risky", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.5, text: "Sept soucoupes \xE9cr\xE9m\xE9es en trente secondes, chor\xE9graphie de pickpocket de mobilier. Vous tournez le coin de la rue en millionnaire de la petite monnaie.", moneyChange: 9, statChanges: { dignity: -5, mental: -2 } },
        { probability: 0.5, text: "Le serveur sort PILE \xE0 la quatri\xE8me soucoupe. Il ne court pas : il crie votre description au quartier entier. Votre portrait-robot est tr\xE8s ressemblant.", moneyChange: 3, statChanges: { mental: -6, dignity: -6 }, respectChange: -2 }
      ] },
      { text: "D\xE9barrasser les tables et encaisser \xAB le service \xBB", risk: "normal", emoji: "\u{1F37D}\uFE0F", outcomes: [
        { probability: 0.6, text: "Vous empilez les assiettes comme un pro. Le serveur, soulag\xE9, vous laisse deux soucoupes : \xAB t'es embauch\xE9 officieusement. \xBB L'int\xE9rim de la rue.", moneyChange: 5, statChanges: { mental: 4 }, respectChange: 1 },
        { probability: 0.4, text: "Vous cassez une pile d'assiettes d\xE8s la deuxi\xE8me table. Le fracas annule le contrat verbal. Vous laissez m\xEAme une pi\xE8ce, par remords invers\xE9.", moneyChange: -1, statChanges: { mental: -3, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "steal-buffet-mariage",
    title: "Le Buffet du Mariage",
    type: "narrative",
    image: "/assets/steal-buffet-mariage.webp",
    description: "La salle des f\xEAtes c\xE9l\xE8bre un mariage \xE0 deux cents invit\xE9s. Le buffet est dress\xE9, le vin d'honneur coule, et personne ne conna\xEEt personne. Situation id\xE9ale.",
    choices: [
      { text: "S'inviter c\xF4t\xE9 famille \xE9loign\xE9e", risk: "risky", emoji: "\u{1F942}", outcomes: [
        { probability: 0.5, text: "\xAB Vous \xEAtes de quel c\xF4t\xE9 ? \xBB \xAB Du buffet. \xBB Rire g\xE9n\xE9ral : on vous adopte. Trois assiettes, deux coupes, une part de pi\xE8ce mont\xE9e, et une danse avec la grand-m\xE8re.", statChanges: { hunger: 30, thirst: 15, mental: 12, dignity: 3 } },
        { probability: 0.3, text: "La wedding planner vous rep\xE8re \xE0 l'assiette num\xE9ro deux : liste en main, sourcil lev\xE9. Sortie discr\xE8te par la cuisine, une cuisse de poulet dans chaque poche.", statChanges: { hunger: 12, mental: -3, dignity: -4 } },
        { probability: 0.2, text: "Le mari\xE9 vous prend pour l'oncle Andr\xE9, brouill\xE9 depuis dix ans, venu se r\xE9concilier. Il pleure dans vos bras. Vous \xEAtes d\xE9sormais l'oncle Andr\xE9. Il y a un ch\xE8que.", moneyChange: 10, statChanges: { hunger: 20, mental: 5, dignity: -3 } }
      ] },
      { text: "Viser les restes apr\xE8s la f\xEAte", risk: "normal", emoji: "\u{1F319}", outcomes: [
        { probability: 0.7, text: "\xC0 2h, le traiteur remballe et vous tend trois barquettes : \xAB le mari\xE9 a pay\xE9 pour deux cents, ils \xE9taient cent quatre-vingts. \xBB Les maths de la f\xEAte vous nourrissent trois jours.", statChanges: { hunger: 25, mental: 5 } },
        { probability: 0.3, text: "Les restes partent int\xE9gralement dans le van du traiteur, r\xE9glementation oblige. Il vous laisse les drag\xE9es. Personne ne mange les drag\xE9es. M\xEAme vous.", statChanges: { hunger: 4, mental: -2 } }
      ] }
    ]
  },
  {
    id: "steal-camion-boulangerie",
    title: "La Tourn\xE9e du Boulanger",
    type: "narrative",
    image: "/assets/steal-camion-boulangerie.webp",
    description: "Le camion de livraison de la boulangerie est gar\xE9 moteur tournant, portes arri\xE8re ouvertes sur des \xE9tag\xE8res de pain chaud. Le livreur discute mi-temps de foot \xE0 dix m\xE8tres.",
    choices: [
      { text: "Se servir dans les \xE9tag\xE8res", risk: "risky", emoji: "\u{1F956}", outcomes: [
        { probability: 0.5, text: "Deux baguettes et une couronne sous le bras, d\xE9marche naturelle de livreur. L'odeur de pain chaud rend invisible : ph\xE9nom\xE8ne scientifique m\xE9connu.", statChanges: { hunger: 22, mental: 4, dignity: -3 } },
        { probability: 0.3, text: "Le livreur vous voit dans le r\xE9tro. La course-poursuite est br\xE8ve : il conna\xEEt le quartier, vous connaissez la faim. Match nul, mais il garde le pain et votre fiert\xE9.", statChanges: { health: -4, mental: -5, dignity: -5 } },
        { probability: 0.2, text: "Le livreur vous surprend la main sur la baguette... et soupire : \xAB les invendus d'hier sont dans la caisse rouge. Prends l\xE0-dedans, pas dans la commande. \xBB Il y a une hi\xE9rarchie du pain.", statChanges: { hunger: 16, mental: 2 } }
      ] },
      { text: "Ramasser les miettes de la caisse tomb\xE9e", risk: "safe", emoji: "\u{1F426}", outcomes: [
        { probability: 1, text: "Une caisse a vers\xE9 au dernier virage : croissants caboss\xE9s sur le bitume. La r\xE8gle des cinq secondes s'applique g\xE9n\xE9reusement \xE0 la rue.", statChanges: { hunger: 12, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "steal-casier-vestiaire",
    title: "Le Casier Mal Ferm\xE9",
    type: "narrative",
    image: "/assets/steal-casier-vestiaire.webp",
    description: "Aux vestiaires de la piscine, un casier b\xE2ille, cadenas pos\xE9 dessus sans \xEAtre clips\xE9. Dedans : un jean pli\xE9, une montre, un portefeuille. Le propri\xE9taire nage un 800 m\xE8tres.",
    choices: [
      { text: "Prendre le portefeuille", risk: "risky", emoji: "\u{1F45B}", outcomes: [
        { probability: 0.4, text: "Trente euros et une carte de fid\xE9lit\xE9 kebab tamponn\xE9e neuf fois sur dix. Vous prenez les billets, laissez la carte : il aura besoin de ce kebab gratuit pour se consoler.", moneyChange: 15, statChanges: { mental: -6, dignity: -8 }, respectChange: -2 },
        { probability: 0.6, text: "Le nageur avait fini son 800 m\xE8tres. Il est derri\xE8re vous, en maillot, tr\xE8s grand, tr\xE8s mouill\xE9, tr\xE8s calme. La conversation qui suit est br\xE8ve et d\xE9favorable.", statChanges: { health: -8, mental: -6, dignity: -7 }, respectChange: -2 }
      ] },
      { text: "Clipser le cadenas et pr\xE9venir l'accueil", risk: "safe", emoji: "\u{1F512}", outcomes: [
        { probability: 0.7, text: "Le nageur, pr\xE9venu, sort de l'eau en panique puis vous serre la main trop fort : il y avait sa paie de la semaine. R\xE9compense imm\xE9diate et entr\xE9e piscine offerte.", moneyChange: 6, respectChange: 2, statChanges: { mental: 6, dignity: 5 } },
        { probability: 0.3, text: "L'accueil vous remercie vaguement et vous demande de partir : \xAB les vestiaires sont r\xE9serv\xE9s aux clients. \xBB La vertu a parfois le go\xFBt du chlore.", statChanges: { mental: -2, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "steal-potager-nuit",
    title: "Le Potager sous la Lune",
    type: "narrative",
    image: "/assets/steal-potager-nuit.webp",
    description: "Le potager du pavillon d'angle croule sous les tomates, les courgettes font de la figuration, et la maison dort. Le portillon n'a m\xEAme pas de loquet.",
    choices: [
      { text: "R\xE9colter en silence", risk: "risky", emoji: "\u{1F345}", outcomes: [
        { probability: 0.5, text: "R\xE9colte de minuit : tomates ti\xE8des de la journ\xE9e, courgette d'honneur, trois carottes. Le d\xEEner des rois, \xE0 genoux dans les fraisiers.", statChanges: { hunger: 24, mental: 3, dignity: -3 } },
        { probability: 0.3, text: "Le d\xE9tecteur de mouvement inonde le jardin de lumi\xE8re. Vous vous figez au milieu des tomates, statue coupable, avant de fuir sous les aboiements du quartier entier.", statChanges: { mental: -6, health: -3, dignity: -4 } },
        { probability: 0.2, text: "Le propri\xE9taire, insomniaque \xE0 la fen\xEAtre, vous observe depuis le d\xE9but... et descend en pantoufles avec un cabas : \xAB prenez proprement, \xE7a \xE9vitera que \xE7a pourrisse. Mais demandez, la prochaine fois. \xBB", statChanges: { hunger: 20, mental: 4, dignity: 2 }, respectChange: 1 }
      ] },
      { text: "Glaner juste ce qui est tomb\xE9 au sol", risk: "safe", emoji: "\u{1F952}", outcomes: [
        { probability: 1, text: "Les fruits tomb\xE9s appartiennent au premier courb\xE9, c'est un droit m\xE9di\xE9val que vous venez d'inventer. Deux tomates fendues et une pomme v\xE9reuse. Le Moyen \xC2ge mangeait mal.", statChanges: { hunger: 10 } }
      ] }
    ]
  },
  {
    id: "steal-champagne-vernissage",
    title: "Le Champagne du Vernissage",
    type: "narrative",
    image: "/assets/steal-champagne-vernissage.webp",
    description: "La galerie f\xEAte une expo. Derri\xE8re le rideau du fond, les caisses de champagne attendent leur tour, et le serveur ne sait pas compter jusqu'\xE0 douze.",
    choices: [
      { text: "Exfiltrer une bouteille sous le manteau", risk: "risky", emoji: "\u{1F37E}", outcomes: [
        { probability: 0.5, text: "La bouteille \xE9pouse votre aisselle comme si elle \xE9tait n\xE9e pour \xE7a. Revendue fra\xEEche au bistrot d'\xE0 c\xF4t\xE9, qui ne pose pas de questions aux bonnes affaires.", moneyChange: 11, statChanges: { mental: 3, dignity: -4 } },
        { probability: 0.3, text: "Le bouchon saute TOUT SEUL sous votre manteau, au milieu de la foule. Vous voil\xE0 fontaine humaine devant quarante amateurs d'art. L'\u0153uvre la plus comment\xE9e de la soir\xE9e.", statChanges: { mental: -5, dignity: -8 } },
        { probability: 0.2, text: "L'artiste vous surprend... et trinque : \xAB enfin quelqu'un qui comprend mon travail sur l'appropriation. \xBB Vous repartez avec la bouteille, officiellement \u0153uvre participative.", moneyChange: 8, statChanges: { mental: 6 }, respectChange: 1 }
      ] },
      { text: "Vider les fonds de coupes abandonn\xE9es", risk: "normal", emoji: "\u{1F942}", outcomes: [
        { probability: 0.6, text: "Le champagne ti\xE8de des autres reste du champagne. Douze fonds de coupe plus tard, l'art contemporain vous semble beaucoup plus clair.", statChanges: { thirst: 12, mental: 6, health: -2 } },
        { probability: 0.4, text: "Une coupe contenait un m\xE9got. La d\xE9couverte est buccale. L'art est d\xE9cid\xE9ment une \xE9preuve.", statChanges: { thirst: 4, health: -3, mental: -4 } }
      ] }
    ]
  },
  {
    id: "steal-cageots-aube",
    title: "Les Cageots de l'Aube",
    type: "narrative",
    image: "/assets/steal-cageots-aube.webp",
    description: "Six heures du matin : les primeurs d\xE9chargent, les cageots s'empilent sur le trottoir, et dans la p\xE9nombre, personne ne distingue un livreur d'un homme press\xE9.",
    choices: [
      { text: "Embarquer un cageot d'un pas de livreur", risk: "risky", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.5, text: "Un cageot d'oranges sur l'\xE9paule, d\xE9marche syndiqu\xE9e, personne ne bronche. Vous \xEAtes invisible par exc\xE8s de plausibilit\xE9. Des vitamines pour la semaine.", statChanges: { hunger: 18, mental: 4, dignity: -3 }, moneyChange: 3 },
        { probability: 0.3, text: "\xAB H\xE9, le nouveau ! Les oranges c'est chez Marcel, en face ! \xBB Vous livrez le cageot vol\xE9 chez Marcel. Marcel vous paie la course. Le crime le plus honn\xEAte de votre carri\xE8re.", moneyChange: 4, statChanges: { mental: 3 } },
        { probability: 0.2, text: "Le grossiste tient les comptes de ses cageots comme un usurier. Rattrap\xE9 en vingt m\xE8tres, d\xE9lest\xE9 du cageot et d'un peu d'estime publique.", statChanges: { mental: -5, dignity: -5, health: -2 } }
      ] },
      { text: "Trier les cageots de rebut", risk: "safe", emoji: "\u{1F34A}", outcomes: [
        { probability: 1, text: "Le cageot \xAB \xE0 jeter \xBB regorge de fruits \xE0 peine bronz\xE9s d'un c\xF4t\xE9. Les primeurs ferment les yeux : le rebut, c'est la s\xE9cu de la rue.", statChanges: { hunger: 14 } }
      ] }
    ]
  },
  {
    id: "steal-petit-dej-hotel",
    title: "Le Petit-D\xE9jeuner de l'H\xF4tel",
    type: "narrative",
    image: "/assets/steal-petit-dej-hotel.webp",
    description: "Le buffet petit-d\xE9jeuner de l'h\xF4tel Continental : acc\xE8s par la terrasse, personnel d\xE9bord\xE9, clients en peignoir qui ne se connaissent pas. Le paradis a un horaire : 7h-10h.",
    choices: [
      { text: "Entrer en client de la chambre 12", risk: "risky", emoji: "\u{1F950}", outcomes: [
        { probability: 0.5, text: "\xAB Chambre 12 \xBB l\xE2ch\xE9 avec l'assurance d'un habitu\xE9. \u0152ufs, viennoiseries, jus press\xE9, et le journal offert. Vous petit-d\xE9jeunez comme un VRP en d\xE9placement. Somptueux.", statChanges: { hunger: 28, thirst: 15, mental: 10, dignity: 4 } },
        { probability: 0.3, text: "La chambre 12 descend \xE0 son tour. Confrontation de chambres 12. Le ma\xEEtre d'h\xF4tel tranche \xE0 l'anciennet\xE9 du peignoir. Vous sortez avec deux croissants de d\xE9dommagement moral.", statChanges: { hunger: 10, mental: -4, dignity: -5 } },
        { probability: 0.2, text: "La r\xE9ceptionniste vous d\xE9masque \xE0 l'entr\xE9e... et vous glisse \xE0 l'oreille : \xAB le lundi, on jette les invendus \xE0 10h15, porte de service. \xBB Une informatrice dans la place.", statChanges: { hunger: 6, mental: 6 } }
      ] },
      { text: "Attendre les plateaux abandonn\xE9s de la terrasse", risk: "normal", emoji: "\u{1F373}", outcomes: [
        { probability: 0.7, text: "Les clients press\xE9s laissent des demi-buffets sur les tables de terrasse. Vous consolidez trois plateaux en un festin. La logistique h\xF4teli\xE8re travaille pour vous.", statChanges: { hunger: 20, thirst: 8 } },
        { probability: 0.3, text: "Le serveur d\xE9barrasse plus vite que son ombre ce matin. Il vous reste un demi-jus d'orange et la corbeille de pain dur. La concurrence est rude dans l'h\xF4tellerie.", statChanges: { hunger: 8, thirst: 5 } }
      ] }
    ]
  },
  {
    id: "steal-fontaine-voeux",
    title: "La Fontaine aux V\u0153ux",
    type: "narrative",
    image: "/assets/steal-fontaine-voeux.webp",
    description: "La fontaine du square scintille de pi\xE8ces : des ann\xE9es de v\u0153ux de touristes par dizaines d'euros. Les v\u0153ux des autres, techniquement, sont d\xE9j\xE0 exauc\xE9s ou perdus.",
    choices: [
      { text: "P\xEAcher les pi\xE8ces \xE0 la main", risk: "risky", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.5, text: "Vingt minutes de p\xEAche miraculeuse, manches tremp\xE9es, poches lest\xE9es. Vous videz les v\u0153ux de 2019 \xE0 2022. Les v\u0153ux r\xE9cents, vous les laissez : d\xE9ontologie.", moneyChange: 8, statChanges: { dignity: -6, health: -2, mental: -2 } },
        { probability: 0.3, text: "Une classe de maternelle arrive en plein braquage aquatique. Trente paires d'yeux vous jugent. La ma\xEEtresse improvise une le\xE7on sur \xAB les gens qui prennent les sous des autres \xBB. Vous \xEAtes le support p\xE9dagogique.", moneyChange: 3, statChanges: { dignity: -8, mental: -5 } },
        { probability: 0.2, text: "L'agent d'entretien municipal arrive avec son aspirateur \xE0 pi\xE8ces : c'est SA r\xE9colte trimestrielle. Il partage, en coll\xE8gue : \xAB moiti\xE9-moiti\xE9, et t'as rien vu. \xBB Le service public a ses arrangements.", moneyChange: 6, statChanges: { mental: 3 } }
      ] },
      { text: "Faire un v\u0153u \xE0 cr\xE9dit", risk: "safe", emoji: "\u{1F320}", outcomes: [
        { probability: 1, text: "Vous jetez un caillou (les pi\xE8ces, c'est pour les riches) et souhaitez un toit. Le caillou coule dignement. Le v\u0153u est enregistr\xE9, pr\xE9cise une mouette.", statChanges: { mental: 6 } }
      ] }
    ]
  },
  {
    id: "steal-tirelire-comptoir",
    title: "La Tirelire du Comptoir",
    type: "narrative",
    image: "/assets/steal-tirelire-comptoir.webp",
    description: "Sur le comptoir de la boulangerie, la tirelire \xAB pour les chatons abandonn\xE9s \xBB d\xE9borde de pi\xE8ces. La boulang\xE8re a le dos tourn\xE9. Votre estomac et votre conscience ouvrent les n\xE9gociations.",
    choices: [
      { text: "Piocher dans la tirelire des chatons", risk: "risky", emoji: "\u{1F63F}", outcomes: [
        { probability: 0.4, text: "Une poign\xE9e de pi\xE8ces vol\xE9es \xE0 des chatons hypoth\xE9tiques. L'argent p\xE8se dans la poche comme une enclume morale. Chaque miaulement du quartier vous poursuivra huit jours.", moneyChange: 7, statChanges: { mental: -10, dignity: -10 }, respectChange: -3 },
        { probability: 0.6, text: "La boulang\xE8re se retourne au tintement. Silence. Elle ne crie pas : elle vous regarde avec une d\xE9ception de grand-m\xE8re, ce qui est mille fois pire. Vous reposez tout, plus deux pi\xE8ces \xE0 vous. Les chatons gagnent au change.", moneyChange: -2, statChanges: { mental: -6, dignity: -4 } }
      ] },
      { text: "Demander plut\xF4t un invendu, honn\xEAtement", risk: "safe", emoji: "\u{1F950}", outcomes: [
        { probability: 0.7, text: "La boulang\xE8re vous tend deux croissants de la veille et ajoute une pi\xE8ce DE la tirelire : \xAB les chatons ont bon dos, y a pas que les chats qui tra\xEEnent dehors. \xBB", moneyChange: 1, statChanges: { hunger: 14, mental: 8, dignity: 4 } },
        { probability: 0.3, text: "\xAB Les invendus, c'est pour l'association. \xBB Refus poli. Mais elle vous glisse un quignon quand la cliente suivante ne regarde pas. Le syst\xE8me D a des alli\xE9es.", statChanges: { hunger: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "steal-plaque-egout",
    title: "La Plaque d'\xC9gout",
    type: "narrative",
    image: "/assets/steal-plaque-egout.webp",
    description: "Le ferrailleur paie la fonte au poids et une plaque d'\xE9gout p\xE8se cinquante kilos. Il y en a une, l\xE0, \xE0 moiti\xE9 descell\xE9e. C'est une tr\xE8s mauvaise id\xE9e. Cinquante kilos de mauvaise id\xE9e.",
    choices: [
      { text: "La rouler jusqu'au ferrailleur", risk: "risky", emoji: "\u{1F573}\uFE0F", outcomes: [
        { probability: 0.35, text: "Six cents m\xE8tres de roulage de plaque, un chef-d'\u0153uvre d'endurance et de discr\xE9tion nulle. Le ferrailleur paie sans regarder ni la plaque ni vous. Votre dos d\xE9pose un pr\xE9avis de gr\xE8ve.", moneyChange: 14, statChanges: { health: -9, dignity: -4, mental: 2 } },
        { probability: 0.4, text: "La plaque vous \xE9chappe au premier dos-d'\xE2ne et d\xE9vale la rue en sonnant comme une cloche de cath\xE9drale. Le quartier entier sort. Vous applaudissez avec les autres, l'air de rien.", statChanges: { health: -4, mental: -4, dignity: -3 } },
        { probability: 0.25, text: "L'\xE9goutier \u2014 VOTRE \xE9goutier \u2014 remonte pile de ce trou-l\xE0. Il regarde la plaque, puis vous : \xAB repose \xE7a, ou je raconte au quartier ce qui vit l\xE0-dessous. \xBB Vous reposez tr\xE8s vite.", statChanges: { mental: -3, dignity: -2 } }
      ] },
      { text: "Renoncer : voler l'infrastructure, c'est trop", risk: "safe", emoji: "\u{1F9E0}", outcomes: [
        { probability: 1, text: "Vous laissez la ville enti\xE8re sous vos pieds. Il y a des limites, et cinquante kilos en est une excellente.", statChanges: { mental: 4, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "steal-tarte-fenetre",
    title: "La Tarte sur le Rebord",
    type: "narrative",
    image: "/assets/steal-tarte-fenetre.webp",
    description: "Une tarte aux pommes refroidit sur un rebord de fen\xEAtre du rez-de-chauss\xE9e, comme dans un dessin anim\xE9. Vous v\xE9rifiez : pas de cam\xE9ra, pas de pi\xE8ge, pas de sc\xE9nariste.",
    choices: [
      { text: "Le vol du dessin anim\xE9", risk: "risky", emoji: "\u{1F967}", outcomes: [
        { probability: 0.5, text: "La tarte fume encore entre vos mains au coin de la rue. C'est le meilleur clich\xE9 de l'histoire du vol, et il est d\xE9licieux. Vous laissez le moule bien en \xE9vidence : on rend le contenant.", statChanges: { hunger: 26, mental: 8, dignity: -4 } },
        { probability: 0.3, text: "La propri\xE9taire surgit \xE0 la fen\xEAtre au moment pr\xE9cis de la saisie : \xAB AH BEN ENFIN ! Depuis le temps que je les pose l\xE0, personne n'osait ! \xBB Elle en fait deux par semaine \xAB pour qui passe \xBB. Le folklore existe.", statChanges: { hunger: 22, mental: 10 }, respectChange: 1 },
        { probability: 0.2, text: "Un chien que vous n'aviez pas budg\xE9t\xE9 d\xE9fend la tarte depuis l'int\xE9rieur. Vous gagnez une manche vide et une morsure de rebord. La tarte vous nargue, intacte.", statChanges: { health: -5, mental: -4, hunger: 2 } }
      ] },
      { text: "Sonner et demander une part", risk: "safe", emoji: "\u{1F514}", outcomes: [
        { probability: 0.6, text: "La dame coupe un quart g\xE9n\xE9reux \xAB parce qu'au moins vous avez sonn\xE9 \xBB. La politesse rapporte 90 degr\xE9s de tarte.", statChanges: { hunger: 15, mental: 5, dignity: 3 } },
        { probability: 0.4, text: "Personne ne r\xE9pond. Vous restez plant\xE9 devant une tarte parfaite avec votre honn\xEAtet\xE9 intacte et votre estomac r\xE9volt\xE9. La vertu a un co\xFBt calorique.", statChanges: { mental: -3, hunger: -2 } }
      ] }
    ]
  },
  {
    id: "steal-cave-restaurant",
    title: "La Cave du Restaurant",
    type: "narrative",
    image: "/assets/steal-cave-restaurant.webp",
    description: "La trappe de livraison de la cave du restaurant gastronomique est rest\xE9e ouverte sur le trottoir. En bas : des caisses de vin dont chaque bouteille vaut votre semaine.",
    choices: [
      { text: "Descendre chercher un grand cru", risk: "risky", emoji: "\u{1F377}", outcomes: [
        { probability: 0.4, text: "Vous remontez avec un bourgogne dont l'\xE9tiquette est une \u0153uvre d'art. Le caviste d'occasion l'ach\xE8te en tremblant un peu. Une semaine de vivres dans une bouteille.", moneyChange: 15, statChanges: { mental: 3, dignity: -5 }, respectChange: -1 },
        { probability: 0.35, text: "Le sommelier descend pendant que vous h\xE9sitez entre deux appellations. Il vous coince entre les c\xF4tes-du-rh\xF4ne. N\xE9gociation : vous remontez les caisses de la livraison, il oublie votre visite. Le tarif syndical de la r\xE9demption.", statChanges: { health: -4, mental: -3, dignity: -3 } },
        { probability: 0.25, text: "Dans le noir, vous confondez : vous remontez fi\xE8rement une bouteille... de vinaigre de service. Le caviste rit encore. Vous assaisonnerez vos trouvailles pendant un mois.", statChanges: { mental: -4 }, itemGain: { id: "vinaigre-gastro", name: "Vinaigre gastronomique (vol\xE9)", emoji: "\u{1FAD7}", type: "junk", value: 3 } }
      ] },
      { text: "Refermer la trappe et pr\xE9venir en cuisine", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.7, text: "Le chef, inform\xE9, mesure ce qu'il aurait pu perdre. Il vous fait asseoir en bout de passe : le menu d\xE9gustation des erreurs du service. Sept mini-plats. Le plus beau d\xEEner de votre ann\xE9e.", statChanges: { hunger: 28, mental: 12, dignity: 5 }, respectChange: 2 },
        { probability: 0.3, text: "\xAB Merci, c'est not\xE9. \xBB La porte se referme. La vertu est parfois un pourboire de z\xE9ro euro. Mais la trappe, elle, est ferm\xE9e.", statChanges: { mental: 2, dignity: 3 } }
      ] }
    ]
  },
  {
    id: "steal-outils-echafaudage",
    title: "Les Outils de l'\xC9chafaudage",
    type: "narrative",
    image: "/assets/steal-outils-echafaudage.webp",
    description: "Les fa\xE7adiers sont partis d\xE9jeuner en laissant sur l'\xE9chafaudage une perceuse, deux truelles et une radio de chantier qui chante toute seule.",
    choices: [
      { text: "Monter chercher la perceuse", risk: "risky", emoji: "\u{1FA9C}", outcomes: [
        { probability: 0.4, text: "La perceuse glisse dans le sac comme si elle d\xE9missionnait d'elle-m\xEAme. Le brocanteur la \xAB d\xE9clare d'occasion \xBB avec un tampon imaginaire. Bonne paie, mauvaise conscience.", moneyChange: 12, statChanges: { mental: -4, dignity: -5 }, respectChange: -1 },
        { probability: 0.35, text: "Les fa\xE7adiers reviennent avec leurs sandwichs pendant que vous \xEAtes au deuxi\xE8me niveau. Ils retirent l'\xE9chelle et d\xE9jeunent en dessous, sans se presser. Vous descendez une heure plus tard, par la goutti\xE8re, sous les applaudissements.", statChanges: { health: -5, mental: -5, dignity: -6 } },
        { probability: 0.25, text: "La radio de chantier tombe pendant votre man\u0153uvre et continue de chanter dans le vide, puis au sol, indestructible. Vous ne prenez rien mais vous adoptez la radio. Elle l'a m\xE9rit\xE9.", statChanges: { mental: 4 }, itemGain: { id: "radio-chantier", name: "Radio de chantier immortelle", emoji: "\u{1F4FB}", type: "junk", value: 8, effect: { mental: 6 } } }
      ] },
      { text: "Garder le chantier contre r\xE9mun\xE9ration", risk: "normal", emoji: "\u{1F441}\uFE0F", outcomes: [
        { probability: 0.6, text: "Au retour, le chef d'\xE9quipe appr\xE9cie le gardiennage improvis\xE9 : \xAB au moins avec toi, on sait o\xF9 sont les outils. \xBB Pi\xE8ce, caf\xE9 du thermos, et proposition de revenir demain midi.", moneyChange: 5, statChanges: { thirst: 6, mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: "Le chef d'\xE9quipe compte ses truelles TROIS fois devant vous. La confiance se m\xE9rite, l'humiliation est offerte. Il paie quand m\xEAme \xAB le d\xE9rangement \xBB.", moneyChange: 2, statChanges: { mental: -3, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "steal-jetons-caddies",
    title: "Les Jetons des Caddies",
    type: "narrative",
    image: "/assets/steal-jetons-caddies.webp",
    description: "Une astuce de vieux brigand : certains caddies rendent leur jeton avec un coup sec au bon endroit. Le parking en compte quarante, align\xE9s comme des tirelires.",
    choices: [
      { text: "Traire la rang\xE9e enti\xE8re", risk: "risky", emoji: "\u{1F6D2}", outcomes: [
        { probability: 0.5, text: "Le coup sec fonctionne une fois sur trois : quatorze caddies traits, cinq pi\xE8ces, deux jetons en plastique (la d\xE9ception du m\xE9tier). Un salaire de percussionniste.", moneyChange: 5, statChanges: { mental: 3, dignity: -3 } },
        { probability: 0.3, text: "Le vigile observe votre r\xE9cital de coups secs depuis la cam\xE9ra 4. Il vous laisse finir, par curiosit\xE9 technique, puis vous raccompagne : \xAB la maison garde les pi\xE8ces. \xBB Il note quand m\xEAme la technique.", moneyChange: 1, statChanges: { mental: -3, dignity: -3 } },
        { probability: 0.2, text: "Un caddie rend son jeton, puis un deuxi\xE8me, puis le m\xE9canisme central rend TOUT : une cascade de pi\xE8ces de faux jetons et de vraies pi\xE8ces m\xE9lang\xE9s. Vous triez accroupi, en riant tout seul.", moneyChange: 8, statChanges: { mental: 5 } }
      ] },
      { text: "Rendre les caddies errants, m\xE9thode l\xE9gale", risk: "safe", emoji: "\u21A9\uFE0F", outcomes: [
        { probability: 1, text: "Le grand classique : six caddies abandonn\xE9s ramen\xE9s au bercail, six pi\xE8ces gagn\xE9es \xE0 la sueur du front. L'honn\xEAtet\xE9 paie moins vite mais dort mieux.", moneyChange: 6, statChanges: { dignity: -2 } }
      ] }
    ]
  },
  {
    id: "steal-fleurs-cimetiere",
    title: "Les Fleurs du Cimeti\xE8re",
    type: "narrative",
    image: "/assets/steal-fleurs-cimetiere.webp",
    description: "Le cimeti\xE8re regorge de chrysanth\xE8mes frais d'hier. La fleuriste d'en face les vend douze euros le pot. Le circuit court par excellence, moralement inconfortable.",
    choices: [
      { text: "Pr\xE9lever sur les tombes les mieux fournies", risk: "risky", emoji: "\u{1F940}", outcomes: [
        { probability: 0.4, text: "Trois pots pr\xE9lev\xE9s sur des tombes qui en comptaient dix. La fleuriste rach\xE8te \xAB vos invendus \xBB sans regarder la terre sur les pots. L'argent est r\xE9el, le malaise aussi. Les morts, eux, n'ont rien dit.", moneyChange: 10, statChanges: { mental: -8, dignity: -8 }, respectChange: -2 },
        { probability: 0.35, text: "Le gardien du cimeti\xE8re vous intercepte \xE0 la grille, un pot sous chaque bras. Il ne crie pas : il vous fait replanter les fleurs, une par une, en vous racontant qui sont les occupants. Vous ressortez \xE0 la nuit, chang\xE9.", statChanges: { mental: -4, dignity: -3, sleep: -3 } },
        { probability: 0.25, text: "Une veuve vous surprend la main sur son pot... et vous le donne : \xAB il en aurait ri, lui. Il d\xE9testait les chrysanth\xE8mes. \xBB Vous repartez avec les fleurs et une histoire \xE0 ne raconter \xE0 personne.", moneyChange: 4, statChanges: { mental: 2 } }
      ] },
      { text: "Ramasser les fleurs fan\xE9es jet\xE9es au compost", risk: "safe", emoji: "\u{1F33C}", outcomes: [
        { probability: 1, text: "Le bac \xE0 compost du cimeti\xE8re d\xE9borde de bouquets \xAB presque morts \xBB. Vous triez, recomposez, et obtenez deux bouquets honorables. La seconde vie des fleurs de seconde main.", statChanges: { mental: 4 }, itemGain: { id: "bouquet-compost", name: "Bouquet recompos\xE9", emoji: "\u{1F490}", type: "junk", value: 4, effect: { mental: 5 } } }
      ] }
    ]
  },
  {
    id: "steal-glaciere-pique-nique",
    title: "La Glaci\xE8re du Pique-Nique",
    type: "narrative",
    image: "/assets/steal-glaciere-pique-nique.webp",
    description: "Une famille dispute un match de badminton \xE0 trente m\xE8tres de sa glaci\xE8re. La glaci\xE8re, elle, ne joue pas : elle attend, pleine, \xE0 l'ombre du saule.",
    choices: [
      { text: "D\xE9tourner la glaci\xE8re", risk: "risky", emoji: "\u{1F9CA}", outcomes: [
        { probability: 0.45, text: "La glaci\xE8re contient un festin de famille nombreuse : taboul\xE9, cuisses de poulet, melon, et huit yaourts \xE0 boire. Vous mangez royalement derri\xE8re le talus, en spectateur du badminton. Le p\xE8re perd 21-9.", statChanges: { hunger: 28, thirst: 15, mental: 4, dignity: -6 } },
        { probability: 0.35, text: "Le volant de badminton atterrit \xE0 deux m\xE8tres pendant l'exfiltration. Toute la famille rapplique. Vous rendez la glaci\xE8re en pr\xE9tendant l'avoir \xAB trouv\xE9e qui glissait vers l'\xE9tang \xBB. Personne n'y croit, mais on vous laisse un sandwich pour l'audace.", statChanges: { hunger: 8, mental: -4, dignity: -5 } },
        { probability: 0.2, text: "La glaci\xE8re \xE9tait celle d'une \xE9quipe de rugby amateur, pas de la famille. Treize gaillards vous regardent la soulever. Vous la reposez avec une d\xE9licatesse infinie et improvisez un contr\xF4le qualit\xE9 : \xAB elle ferme bien, RAS. \xBB Ils rient. Vous vivez.", statChanges: { mental: -3, dignity: -3 } }
      ] },
      { text: "Ramasser les restes apr\xE8s leur d\xE9part", risk: "safe", emoji: "\u{1F9FA}", outcomes: [
        { probability: 1, text: "La famille abandonne sur place chips entam\xE9es, pain et un fond de ros\xE9 ti\xE8de. Le service apr\xE8s-pique-nique, c'est vous.", statChanges: { hunger: 12, thirst: 6 } }
      ] }
    ]
  },
  {
    id: "steal-enseigne-neon",
    title: "La Lettre du N\xE9on Mort",
    type: "narrative",
    image: "/assets/steal-enseigne-neon.webp",
    description: "Le magasin \xAB SUPERETTE \xBB a ferm\xE9 il y a deux ans. Son enseigne pend, et le \xAB S \xBB lumineux ne tient plus qu'\xE0 un fil. Le brocanteur adore les lettres g\xE9antes, les d\xE9corateurs aussi.",
    choices: [
      { text: "D\xE9crocher le S g\xE9ant", risk: "risky", emoji: "\u{1F520}", outcomes: [
        { probability: 0.45, text: "Le S se d\xE9tache dans un craquement de fin d'\xE9poque. \xAB UPERETTE \xBB restera. Le brocanteur paie la lettre au prix de la nostalgie industrielle : tr\xE8s bien.", moneyChange: 11, statChanges: { mental: 4, dignity: -2 } },
        { probability: 0.35, text: "Le S vous glisse des mains et explose au sol en confettis de plexiglas. Deux ans \xE0 pendre pour finir comme \xE7a. Vous balayez les morceaux, par respect pour la typographie.", statChanges: { mental: -4, health: -2 } },
        { probability: 0.2, text: "L'ancien g\xE9rant passait justement revoir sa vitrine morte. Il vous regarde faire, puis aide \xE0 d\xE9crocher : \xAB prends-le, petit. Ce magasin m'a bouff\xE9 vingt ans, qu'il serve au moins \xE0 quelqu'un. \xBB Il garde le E, \xAB pour \xC9liane \xBB.", moneyChange: 8, statChanges: { mental: 6 }, respectChange: 1 }
      ] },
      { text: "R\xE9cup\xE9rer juste le c\xE2blage en cuivre", risk: "normal", emoji: "\u{1F50C}", outcomes: [
        { probability: 0.6, text: "Trois m\xE8tres de c\xE2ble d'enseigne, cuivre honn\xEAte. Le ferrailleur paie sans po\xE9sie. La typographie, \xE7a ne se mange pas.", moneyChange: 5, statChanges: { dignity: -2 } },
        { probability: 0.4, text: "Le c\xE2ble \xE9tait encore reli\xE9 \xE0 quelque chose. La ch\xE2taigne vous traverse jusqu'aux chaussettes. Le n\xE9on mort avait un dernier mot \xE0 dire.", statChanges: { health: -7, mental: -4 } }
      ] }
    ]
  },
  {
    id: "steal-panier-velo",
    title: "Le Panier du V\xE9lo Hollandais",
    type: "narrative",
    image: "/assets/steal-panier-velo.webp",
    description: "Un v\xE9lo hollandais impeccable est gar\xE9 devant la librairie, panier avant charg\xE9 : une baguette, un bouquet, un livre neuf et un parapluie. Une nature morte \xE0 ciel ouvert.",
    choices: [
      { text: "Vider le panier", risk: "risky", emoji: "\u{1F9FA}", outcomes: [
        { probability: 0.45, text: "Baguette sous le bras, bouquet offert plus tard \xE0 qui sourira, livre revendu au bouquiniste. Le parapluie, vous le laissez : il faut savoir doser le malheur des gens.", moneyChange: 6, statChanges: { hunger: 12, mental: -3, dignity: -5 } },
        { probability: 0.35, text: "La propri\xE9taire sort de la librairie au moment o\xF9 votre main touche la baguette. Elle vous fixe... et casse la baguette en deux : \xAB la moiti\xE9, et on n'en parle plus. \xBB Le partage le plus sec et le plus juste du mois.", statChanges: { hunger: 8, mental: -2, dignity: -3 } },
        { probability: 0.2, text: "Sous la baguette, une enveloppe : des tickets-restaurant. Le jackpot du travailleur. Votre conscience proteste mollement, votre estomac signe le re\xE7u.", moneyChange: 9, statChanges: { hunger: 4, mental: -5, dignity: -6 }, respectChange: -1 }
      ] },
      { text: "Redresser le v\xE9lo qui penche et attendre", risk: "safe", emoji: "\u{1F6B2}", outcomes: [
        { probability: 0.6, text: "La propri\xE9taire sort, vous voit tenir son v\xE9lo contre le vent, et vous offre la baguette enti\xE8re \xAB pour le service de voirie \xBB. La vertu paie en boulangerie.", statChanges: { hunger: 14, mental: 5, dignity: 4 } },
        { probability: 0.4, text: "Elle sort, m\xE9fiante, vous soup\xE7onne du regard, et repart en p\xE9dalant vite. \xCAtre suspect en rendant service : le grand \xE9cart quotidien.", statChanges: { mental: -3, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "steal-pressing-costume",
    title: "Le Portant du Pressing",
    type: "narrative",
    image: "/assets/steal-pressing-costume.webp",
    description: "Le pressing a sorti son portant de livraison sur le trottoir : douze housses, dont un costume trois-pi\xE8ces \xE9tiquet\xE9 \xAB Ma\xEEtre Bernard, plaidoirie jeudi \xBB. Un costume d'avocat. Votre taille, en plus.",
    choices: [
      { text: "Emprunter le costume de Ma\xEEtre Bernard", risk: "risky", emoji: "\u{1F935}", outcomes: [
        { probability: 0.4, text: "Le costume tombe parfaitement. Pendant une journ\xE9e enti\xE8re, on vous dit \xAB bonjour Ma\xEEtre \xBB. Les terrasses vous servent d'abord, les vigiles vous saluent. Vous le rendez au portant le soir, chang\xE9 \xE0 jamais.", statChanges: { dignity: 15, mental: 12, hunger: 5 }, respectChange: 2 },
        { probability: 0.35, text: "La livreuse du pressing vous rattrape \xE0 cent m\xE8tres, la housse encore sur l'\xE9paule. Elle r\xE9cup\xE8re Ma\xEEtre Bernard sans un mot et vous laisse... le cintre. Le cintre de la honte.", statChanges: { mental: -4, dignity: -5 } },
        { probability: 0.25, text: "Ma\xEEtre Bernard en personne arrive chercher son bien pendant votre rep\xE9rage. Il vous jauge : \xAB vous auriez plaid\xE9 quoi, pour vous d\xE9fendre ? \xBB Votre r\xE9ponse l'amuse tant qu'il vous paie le caf\xE9 et une consultation gratuite de trottoir.", statChanges: { mental: 8, thirst: 6 }, respectChange: 1 }
      ] },
      { text: "Fouiller le bac \xAB non r\xE9clam\xE9s depuis 1 an \xBB", risk: "safe", emoji: "\u{1F9E5}", outcomes: [
        { probability: 1, text: "Le pressing brade les v\xEAtements jamais r\xE9clam\xE9s. Pour trois fois rien, une chemise empes\xE9e qui sent le propre industriel. Le luxe, c'est l'amidon.", moneyChange: -1, statChanges: { dignity: 8, mental: 4 } }
      ] }
    ]
  },
  {
    id: "steal-barbecue-parc",
    title: "Le Barbecue Sans Surveillance",
    type: "narrative",
    image: "/assets/steal-barbecue-parc.webp",
    description: "Un barbecue de parc cr\xE9pite, couvert de merguez et de c\xF4telettes, pendant que ses propri\xE9taires d\xE9battent \xE0 vingt m\xE8tres de politique locale. Le d\xE9bat est vif, la viande est pr\xEAte.",
    choices: [
      { text: "Pr\xE9lever discr\xE8tement au bord de la grille", risk: "risky", emoji: "\u{1F32D}", outcomes: [
        { probability: 0.5, text: "Quatre merguez du p\xE9rim\xE8tre ext\xE9rieur, pr\xE9lev\xE9es au fil des passages. La rotation des stocks, \xE7a s'appelle. Personne ne compte ses merguez pendant un d\xE9bat sur les pistes cyclables.", statChanges: { hunger: 22, mental: 4, dignity: -3 } },
        { probability: 0.3, text: "\xAB ET LES MERGUEZ, ELLES VOTENT POUR QUI ? \xBB Le cuisinier vous a vu. Le d\xE9bat entier se retourne vers vous. Vous voil\xE0 somm\xE9 de donner votre avis sur les pistes cyclables, une merguez vol\xE9e \xE0 la main. Vous votez bien. On vous ressert.", statChanges: { hunger: 15, mental: 5, dignity: -2 } },
        { probability: 0.2, text: "La grille bascule pendant votre pr\xE9l\xE8vement : la moiti\xE9 du barbecue tombe dans les braises. Vous fuyez sous une pluie d'insultes gastronomiques, une demi-c\xF4telette pour tout butin.", statChanges: { hunger: 6, mental: -5, dignity: -5 }, respectChange: -1 }
      ] },
      { text: "S'incruster dans le d\xE9bat politique", risk: "normal", emoji: "\u{1F5E3}\uFE0F", outcomes: [
        { probability: 0.7, text: "Votre analyse de la voirie locale (vous dormez dessus, vous connaissez) cloue le d\xE9bat. On vous tend une assiette pleine : l'expertise de terrain, \xE7a se r\xE9mun\xE8re.", statChanges: { hunger: 20, thirst: 8, mental: 8 }, respectChange: 1 },
        { probability: 0.3, text: "Vous prenez parti pour le mauvais camp : celui qui n'a pas apport\xE9 la viande. Assiette r\xE9duite, ambiance froide, merguez ti\xE8de. La politique a un prix.", statChanges: { hunger: 8, mental: -2 } }
      ] }
    ]
  },
  {
    id: "steal-colis-palier",
    title: "Le Colis du Palier",
    type: "narrative",
    image: "/assets/steal-colis-palier.webp",
    description: "Dans le hall o\xF9 vous vous abritez, un colis attend devant la porte du 3B depuis ce matin. La bo\xEEte est grande, le carton est beau, et le 3B ne rentre visiblement pas.",
    choices: [
      { text: "Adopter le colis", risk: "risky", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.45, text: "Le colis contient un plaid en fausse fourrure et deux coussins \xAB style scandinave \xBB. Le confort nordique vous tend les bras vol\xE9s. Sur le carton, un pr\xE9nom : Lucie. Vous dormirez chaud, avec ce pr\xE9nom sur la conscience.", statChanges: { sleep: 8, mental: -6, dignity: -6 }, addFlag: "colis-lucie", itemGain: { id: "plaid-scandinave", name: "Plaid scandinave (de Lucie)", emoji: "\u{1F9E3}", type: "armor", value: 8, defenseBonus: 1 } },
        { probability: 0.3, text: "Le voisin du 3A ouvre pile \xE0 la saisie : \xAB c'est le colis de Lucie, je lui garde. \xBB Il le prend, vous toise, et referme. Vous venez de perdre un duel moral contre un homme en charentaises.", statChanges: { mental: -4, dignity: -4 } },
        { probability: 0.25, text: "Le colis gargouille. Vous ouvrez : un kit \xAB brassez votre bi\xE8re chez vous \xBB, fuit\xE9 pendant le transport. Ni buvable, ni revendable, mais le carton double \xE9paisseur est somptueux. Le lot de consolation logistique.", statChanges: { mental: 2, sleep: 4 } }
      ] },
      { text: "Le rentrer \xE0 l'abri des regards, pour Lucie", risk: "safe", emoji: "\u{1F6E1}\uFE0F", outcomes: [
        { probability: 0.7, text: "Vous calez le colis dans un angle mort et montez la garde. Lucie rentre \xE0 19h : soulagement, remerciements, et un billet \xAB pour le gardiennage \xBB. Le voisin du 3A n'a rien vu venir.", moneyChange: 5, statChanges: { mental: 6, dignity: 5 }, respectChange: 1 },
        { probability: 0.3, text: "Vous gardez le colis quatre heures. Lucie ne rentre pas. Le gardien de l'immeuble vous d\xE9logera \xE0 22h, colis intact, vertu invisible. Personne ne saura jamais. Vous, si.", statChanges: { mental: 3, sleep: -3, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "steal-sapin-decembre",
    title: "Le Sapin Invendu",
    type: "narrative",
    image: "/assets/steal-sapin-decembre.webp",
    description: "Le vendeur de sapins remballe le 24 au soir. Il reste douze invendus encha\xEEn\xE9s ensemble, condamn\xE9s \xE0 la benne du 26. Ils sentent la for\xEAt et l'occasion.",
    choices: [
      { text: "Lib\xE9rer un sapin cette nuit", risk: "risky", emoji: "\u{1F384}", outcomes: [
        { probability: 0.5, text: "La cha\xEEne glisse, un \xE9pic\xE9a rejoint votre spot. D\xE9cor\xE9 de canettes et d'un gant orphelin, il devient LE sapin du quartier des invisibles. Trois personnes viennent y d\xE9poser un truc. Quelqu'un pleure. No\xEBl op\xE8re.", statChanges: { mental: 14, dignity: 4 }, respectChange: 2 },
        { probability: 0.3, text: "Le vendeur dormait dans sa camionnette. Il sort en pyjama de No\xEBl : \xAB ils sont \xE0 moi jusqu'au 26 ! \xBB Puis il regarde l'heure, la date, votre t\xEAte... et coupe la cha\xEEne lui-m\xEAme : \xAB joyeux No\xEBl, prends le moche. \xBB Le moche est tr\xE8s bien.", statChanges: { mental: 10 }, respectChange: 1 },
        { probability: 0.2, text: "Tra\xEEner un sapin de deux m\xE8tres en pleine nuit fait de vous l'homme le plus identifiable de l'h\xE9misph\xE8re. Une patrouille vous suit au ralenti sur 400 m\xE8tres, hilare, avant de vous aider \xE0 le porter. Le proc\xE8s-verbal se transforme en photo souvenir.", statChanges: { mental: 6, health: -3, dignity: -3 } }
      ] },
      { text: "Ramasser les branches coup\xE9es", risk: "safe", emoji: "\u{1F332}", outcomes: [
        { probability: 1, text: "Le tapis de branches taill\xE9es embaume. De quoi isoler le carton du sol et dormir dans une odeur de montagne. Le sapin des pauvres est horizontal.", statChanges: { sleep: 6, mental: 5 } }
      ] }
    ]
  },
  {
    id: "steal-vestiaire-theatre",
    title: "Le Vestiaire du Th\xE9\xE2tre",
    type: "narrative",
    image: "/assets/steal-vestiaire-theatre.webp",
    description: "Entracte au th\xE9\xE2tre municipal : le vestiaire d\xE9borde de manteaux, la pr\xE9pos\xE9e est partie fumer, et les tickets num\xE9rot\xE9s dorment sur le comptoir. Douze minutes d'entracte.",
    choices: [
      { text: "Emprunter le plus beau manteau", risk: "risky", emoji: "\u{1F9E5}", outcomes: [
        { probability: 0.4, text: "Un cachemire gris qui tombe comme une b\xE9n\xE9diction. Vous sortez par le foyer, salu\xE9 par un ouvreur. Le vol le plus \xE9l\xE9gant de votre carri\xE8re. Le froid, cet hiver, devra prendre rendez-vous.", statChanges: { dignity: 6, mental: -4, health: 4 }, respectChange: -1, itemGain: { id: "manteau-cachemire", name: "Manteau en cachemire (emprunt\xE9)", emoji: "\u{1F9E5}", type: "armor", value: 14, defenseBonus: 3 } },
        { probability: 0.35, text: "La pr\xE9pos\xE9e revient \xE0 la moiti\xE9 de votre rep\xE9rage. Vous improvisez : \xAB le 43, s'il vous pla\xEEt. \xBB Elle vous tend un k-way jaune poussin taille enfant. Vous le prenez, par coh\xE9rence. Vous partez en k-way.", statChanges: { mental: -3, dignity: -6 } },
        { probability: 0.25, text: "Dans la poche du manteau vis\xE9 : des cl\xE9s de voiture et un doudou. L'\xE9quation humaine vous d\xE9sarme. Vous reposez tout et sortez les mains vides, rattrap\xE9 par votre propre code d'honneur. Il choisit toujours mal ses horaires.", statChanges: { mental: 4, dignity: 3 } }
      ] },
      { text: "Regarder la seconde partie, planqu\xE9 au balcon", risk: "normal", emoji: "\u{1F3AD}", outcomes: [
        { probability: 0.7, text: "Le strapontin du fond vous accueille pour une heure de trag\xE9die en alexandrins. Vous pleurez \xE0 la mort du h\xE9ros, plus fort que les abonn\xE9s. Le th\xE9\xE2tre, c'est fait pour \xE7a.", statChanges: { mental: 12, sleep: 4 } },
        { probability: 0.3, text: "Vous vous endormez \xE0 la sc\xE8ne 2 et votre ronflement participe au drame. L'ouvreur vous \xE9vacue pendant les applaudissements, ce qui les fait redoubler. Sortie d'artiste.", statChanges: { sleep: 8, mental: 3, dignity: -4 } }
      ] }
    ]
  },
  {
    id: "steal-miel-toits",
    title: "Le Miel des Toits",
    type: "narrative",
    image: "/assets/steal-miel-toits.webp",
    description: "Les ruches du toit du gymnase produisent un miel urbain vendu une fortune en boutique bio. Les pots de la derni\xE8re r\xE9colte attendent dans la cabane de l'apiculteur, \xE0 peine cadenass\xE9e. Les gardiennes, elles, sont trente mille et arm\xE9es.",
    choices: [
      { text: "Tenter le casse du miel", risk: "risky", emoji: "\u{1F36F}", outcomes: [
        { probability: 0.4, text: "Quatre pots exfiltr\xE9s sous le regard de dix mille ouvri\xE8res qui vous prennent pour un courant d'air. La boutique bio rach\xE8te \xAB votre production familiale \xBB. Le crime le plus sucr\xE9 de l'ann\xE9e.", moneyChange: 13, statChanges: { mental: 3, dignity: -4 }, respectChange: -1 },
        { probability: 0.35, text: "Les abeilles d\xE9cr\xE8tent l'alerte g\xE9n\xE9rale \xE0 mi-chemin. Vous battez le record du monde de descente d'escalier de service, six piq\xFBres au compteur et z\xE9ro pot. La s\xE9curit\xE9 la plus efficace du march\xE9 co\xFBte z\xE9ro euro en salaires.", statChanges: { health: -8, mental: -4, dignity: -4 } },
        { probability: 0.25, text: "L'apiculteur \xE9tait dans la cabane. Silence. Puis : \xAB t'es le gars qui m'a aid\xE9, non ? \xBB Il vous paie la visite en rayon de miel et vous propose de garder les ruches le dimanche, contre un pot par semaine. Embauch\xE9 par la mafia des fleurs.", statChanges: { hunger: 12, mental: 8 }, moneyChange: 3, respectChange: 1 }
      ] },
      { text: "Gratter la cire tomb\xE9e sous les cadres", risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 1, text: "Les r\xE9sidus de cire au pied des ruches font d'excellentes bougies de fortune. Les abeilles tol\xE8rent le glanage : c'est \xE9crit nulle part, mais elles le font savoir.", statChanges: { mental: 3 }, itemGain: { id: "cire-abeille", name: "Boule de cire d'abeille", emoji: "\u{1F56F}\uFE0F", type: "junk", value: 5 } }
      ] }
    ]
  },
  {
    id: "steal-arrosoir-mairie",
    title: "Les Jardini\xE8res de la Mairie",
    type: "narrative",
    image: "/assets/steal-arrosoir-mairie.webp",
    description: "La mairie a plant\xE9 ses jardini\xE8res d'apparat : herbes aromatiques \xAB p\xE9dagogiques \xBB, fraisiers \xAB participatifs \xBB et un panneau \xAB servez-vous raisonnablement \xBB. Personne n'ose jamais. Le raisonnable, c'est votre rayon.",
    choices: [
      { text: "Prendre au mot le panneau, XXL", risk: "risky", emoji: "\u{1F353}", outcomes: [
        { probability: 0.5, text: "Basilic, menthe, quarante fraises et deux pieds de tomates cerises : vous \xAB participez \xBB comme personne n'a jamais particip\xE9. Le panneau couvre tout. Juridiquement, vous \xEAtes un citoyen exemplaire.", statChanges: { hunger: 18, mental: 6 } },
        { probability: 0.3, text: "L'adjointe aux espaces verts vous surprend en pleine r\xE9colte magistrale... et vous prend en photo POUR LE BULLETIN MUNICIPAL : \xAB enfin quelqu'un qui utilise le dispositif ! \xBB Vous \xEAtes la une de \xAB Vivre Ensemble \xBB de novembre.", statChanges: { hunger: 14, mental: 5, dignity: 3 }, respectChange: 2 },
        { probability: 0.2, text: "Un retrait\xE9 vigilant d\xE9fend les fraisiers \xAB pour les enfants des \xE9coles \xBB. Le duel du raisonnable s'engage \xE0 la binette verbale. Il gagne aux points : il a le temps, vous avez faim. Il conc\xE8de la menthe.", statChanges: { hunger: 4, mental: -3 } }
      ] },
      { text: "Cueillir trois brins de menthe, raisonnable", risk: "safe", emoji: "\u{1F33F}", outcomes: [
        { probability: 1, text: "Trois brins pour l'eau de la gourde. La menthe municipale a un go\xFBt de civisme. C'est frais, c'est l\xE9gal, c'est peu.", statChanges: { thirst: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "steal-tombola-lots",
    title: "Les Lots de la Tombola",
    type: "narrative",
    image: "/assets/steal-tombola-lots.webp",
    description: "La kermesse remballe. Sur la table des lots de tombola non r\xE9clam\xE9s : un jambon entier, une cafeti\xE8re, un v\xE9lo d'enfant et un bon d'achat. Le stand est vide, les tickets s'envolent au vent.",
    choices: [
      { text: "R\xE9clamer le jambon avec un ticket ramass\xE9", risk: "risky", emoji: "\u{1F356}", outcomes: [
        { probability: 0.45, text: "Le ticket 347 ramass\xE9 par terre est GAGNANT (personne ne v\xE9rifie un homme s\xFBr de lui). Le jambon entier change de destin. Sept kilos de victoire \xE0 l'os.", statChanges: { hunger: 30, mental: 6, dignity: -3 }, moneyChange: 4 },
        { probability: 0.3, text: "La pr\xE9sidente du comit\xE9 des f\xEAtes conna\xEEt chaque ticket par c\u0153ur, c'est sa fiert\xE9 annuelle. \xAB Le 347, c'est madame Painlev\xE9. \xBB Vous rendez le ticket \xE0 madame Painlev\xE9, qui vous donne une tranche pour la d\xE9marche. L'audit a du bon.", statChanges: { hunger: 8, mental: -2, dignity: -2 } },
        { probability: 0.25, text: "Votre ticket gagne... le v\xE9lo d'enfant. Rose. \xC0 paillettes. Vous le revendez \xE0 un p\xE8re en retard d'anniversaire, qui n\xE9gocie \xE0 peine. Tout le monde y gagne, surtout la petite.", moneyChange: 10, statChanges: { mental: 4 } }
      ] },
      { text: "Aider \xE0 remballer et viser les invendus", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Deux heures de tables pli\xE9es et de guirlandes enroul\xE9es. Le comit\xE9 des f\xEAtes paie en nature : cr\xEApes froides, barbe \xE0 papa fossilis\xE9e et la cafeti\xE8re non r\xE9clam\xE9e. Le contrat du si\xE8cle.", statChanges: { hunger: 12, mental: 5 }, itemGain: { id: "cafetiere-tombola", name: "Cafeti\xE8re de tombola", emoji: "\u2615", type: "junk", value: 7 } },
        { probability: 0.3, text: "On vous remercie avec une poign\xE9e de tickets de tombola... de l'ann\xE9e prochaine. De l'espoir \xE0 \xE9ch\xE9ance douze mois. Le comit\xE9 des f\xEAtes invente le produit financier.", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "steal-recup-chantier-bois",
    title: "Les Palettes Consign\xE9es",
    type: "narrative",
    image: "/assets/steal-recup-chantier-bois.webp",
    description: "Derri\xE8re l'entrep\xF4t, une pile de palettes Europe : les bleues, les consign\xE9es, celles qui valent une vraie pi\xE8ce chacune. Le mur est bas. Le chien, en revanche, est th\xE9orique : le panneau \xAB chien m\xE9chant \xBB est rouill\xE9.",
    choices: [
      { text: "Passer le mur pour les palettes bleues", risk: "risky", emoji: "\u{1FAB5}", outcomes: [
        { probability: 0.45, text: "Quatre palettes bleues bascul\xE9es par-dessus le mur, r\xE9cup\xE9r\xE9es, empil\xE9es, revendues au consignataire qui ne demande jamais l'arbre g\xE9n\xE9alogique du bois. Un salaire de d\xE9m\xE9nageur, sans les horaires.", moneyChange: 10, statChanges: { health: -4, dignity: -3 } },
        { probability: 0.3, text: "Le chien n'\xE9tait pas th\xE9orique. Le panneau \xE9tait rouill\xE9, pas le chien. Vous repassez le mur en un temps homologable aux Jeux, une palette de moins et un fond de pantalon aussi.", statChanges: { health: -7, mental: -5, dignity: -5 } },
        { probability: 0.25, text: "Le magasinier vous surprend \xE0 cheval sur le mur... et vous propose un march\xE9 : vous l'aidez \xE0 charger le camion de 14h, il \xAB perd \xBB deux palettes bleues \xE0 votre profit. Le travail au noir du travail au noir.", moneyChange: 6, statChanges: { health: -3, mental: 3 } }
      ] },
      { text: "Prendre les palettes cass\xE9es du trottoir", risk: "safe", emoji: "\u{1F528}", outcomes: [
        { probability: 1, text: "Les palettes mortes du trottoir sont \xE0 qui les veut : du bois sec pour sur\xE9lever le carton et passer l'hiver hors des flaques. L'immobilier de la rue se joue \xE0 dix centim\xE8tres du sol.", statChanges: { sleep: 5, mental: 4 } }
      ] }
    ]
  },
  {
    id: "steal-buvette-stade",
    title: "La Buvette du Stade",
    type: "narrative",
    image: "/assets/steal-buvette-stade.webp",
    description: "Mi-temps au stade municipal : la buvette est prise d'assaut, le b\xE9n\xE9vole est seul, et la caisse est une bo\xEEte \xE0 chaussures. Le chaos organis\xE9, sauf que personne n'organise.",
    choices: [
      { text: "Profiter du chaos de la mi-temps", risk: "risky", emoji: "\u{1F32D}", outcomes: [
        { probability: 0.45, text: "Dans la cohue, deux hot-dogs et un caf\xE9 quittent le comptoir sans transaction. Le b\xE9n\xE9vole sert quarante personnes \xE0 la fois : la comptabilit\xE9 de la mi-temps est une science approximative.", statChanges: { hunger: 20, thirst: 8, mental: -2, dignity: -4 } },
        { probability: 0.3, text: "Le b\xE9n\xE9vole vous alpague... pour vous embaucher : \xAB toi ! Tu sers les caf\xE9s, je g\xE8re la caisse ! \xBB Quinze minutes de rush, un tablier, et un salaire en sandwichs plus le respect de la tribune B.", statChanges: { hunger: 16, thirst: 6, mental: 8 }, respectChange: 2 },
        { probability: 0.25, text: "La bo\xEEte \xE0 chaussures-caisse se renverse dans la bousculade. Tout le monde vous regarde ramasser les pi\xE8ces. VOUS. Vous rendez tout, compt\xE9 deux fois, sous surveillance. L'innocence est un m\xE9tier \xE9puisant.", statChanges: { mental: -4, dignity: -3 } }
      ] },
      { text: "Ramasser les consignes de gobelets", risk: "safe", emoji: "\u{1F964}", outcomes: [
        { probability: 1, text: "Les supporters abandonnent leurs gobelets consign\xE9s \xE0 un euro pi\xE8ce. Vous en r\xE9coltez une pyramide \xE0 la 90e minute. Le vrai score du match, c'est vous.", moneyChange: 6, statChanges: { dignity: -2 } }
      ] }
    ]
  }
];

// client/src/contexts/data/events2-travel.ts
var TRAVEL_EVENTS_2 = [
  {
    id: "travel-passage-souterrain",
    title: "Le Passage Souterrain",
    type: "narrative",
    image: "/assets/travel-passage-souterrain.webp",
    description: "Le passage souterrain coupe le trajet en deux. Au milieu, un accord\xE9oniste joue pour personne, et l'acoustique lui fait un orchestre.",
    choices: [
      { text: "Traverser en \xE9coutant", risk: "safe", emoji: "\u{1FA97}", outcomes: [
        { probability: 0.7, text: "Trois minutes de valse sous la ville. Il vous salue du menton entre deux mesures. Vous ressortez de l'autre c\xF4t\xE9 avec une chanson dans les jambes.", statChanges: { mental: 8 } },
        { probability: 0.3, text: "Il s'arr\xEAte PILE quand vous passez et vous regarde : \xAB toi, t'as une t\xEAte \xE0 requ\xEAtes. Vas-y, demande. \xBB Vous demandez \xAB Les Champs-\xC9lys\xE9es \xBB. Il la joue. La ville enti\xE8re l'entend.", statChanges: { mental: 10, dignity: 3 } }
      ] },
      { text: "Poser une pi\xE8ce en passant", risk: "safe", emoji: "\u{1FA99}", outcomes: [
        { probability: 1, text: "Une pi\xE8ce de pauvre \xE0 pauvre, c'est une pi\xE8ce double. Il attaque un morceau rien que pour votre dos qui s'\xE9loigne.", moneyChange: -1, statChanges: { mental: 10, dignity: 5 }, respectChange: 1 }
      ] }
    ]
  },
  {
    id: "travel-passerelle",
    title: "La Passerelle des Rails",
    type: "narrative",
    image: "/assets/travel-passerelle.webp",
    description: "La passerelle pi\xE9tonne enjambe douze voies ferr\xE9es. En dessous, les trains partent vers des endroits o\xF9 vous ne dormirez pas ce soir.",
    choices: [
      { text: "S'arr\xEAter regarder les trains", risk: "safe", emoji: "\u{1F686}", outcomes: [
        { probability: 0.6, text: "Vingt minutes \xE0 regarder partir les grandes lignes. Marseille, Bordeaux, Lille. Vous choisissez mentalement votre destination. \xC7a ne co\xFBte rien et \xE7a meuble l'\xE2me.", statChanges: { mental: 7 } },
        { probability: 0.4, text: "Un cheminot en contrebas vous fait un signe de la main. Vous r\xE9pondez. Deux inconnus qui se saluent au-dessus de douze voies : le contrat social tient encore.", statChanges: { mental: 8 } }
      ] },
      { text: "Traverser vite, le vent est mauvais", risk: "normal", emoji: "\u{1F4A8}", outcomes: [
        { probability: 0.7, text: "La passerelle vibre sous les rafales. Vous traversez pli\xE9 en deux, mais vous traversez. Le raccourci vaut ses frissons.", statChanges: { sleep: -2, mental: 3 } },
        { probability: 0.3, text: "Une rafale vous plaque contre le grillage au moment o\xF9 l'InterCit\xE9s passe dessous \xE0 pleine vitesse. Le souffle vous d\xE9coiffe l'existence. Grandiose et terrifiant.", statChanges: { mental: -3, health: -2 } }
      ] }
    ]
  },
  {
    id: "travel-abribus-oublis",
    title: "L'Abribus aux Oublis",
    type: "discovery",
    image: "/assets/travel-abribus-oublis.webp",
    description: "L'abribus du boulevard est un mus\xE9e des choses oubli\xE9es : un parapluie, un sac de sport, et un livre ouvert face contre banc, comme si son lecteur allait revenir.",
    choices: [
      { text: "Inventorier les trouvailles", risk: "normal", emoji: "\u{1F9F3}", outcomes: [
        { probability: 0.5, text: "Le sac de sport contient des affaires de piscine et un gel douche entam\xE9. Le parapluie ferme mal mais ouvre bien.", statChanges: { dignity: 4, mental: 4 }, itemGain: { id: "parapluie-abribus", name: "Parapluie de l'abribus", emoji: "\u2602\uFE0F", type: "tool", value: 3 } },
        { probability: 0.3, text: "Le propri\xE9taire du sac revient en courant, essouffl\xE9. Vous le lui tendez, intact. Il fouille, v\xE9rifie, puis a honte de lui : il vous paie \xAB la consigne \xBB.", moneyChange: 4, respectChange: 1, statChanges: { mental: 4 } },
        { probability: 0.2, text: "Le livre est un roman \xE0 l'eau de rose, corn\xE9 \xE0 la page 147. Vous le finissez sur place. Ils se marient. Vous pleurez un peu, \xE0 l'abri des regards.", statChanges: { mental: 9 } }
      ] },
      { text: "Attendre le bus sans rien toucher", risk: "safe", emoji: "\u{1F68C}", outcomes: [
        { probability: 1, text: "Le bus passe, vous ne montez pas. L'abribus reste le seul endroit o\xF9 attendre est un statut social respectable.", statChanges: { sleep: 4, mental: 2 } }
      ] }
    ]
  },
  {
    id: "travel-zone-travaux",
    title: "La D\xE9viation",
    type: "narrative",
    image: "/assets/travel-zone-travaux.webp",
    description: "La rue est \xE9ventr\xE9e sur cent m\xE8tres : \xAB D\xC9VIATION \xBB pointe vers un labyrinthe de barri\xE8res o\xF9 un ouvrier fait de grands gestes contradictoires.",
    choices: [
      { text: "Suivre les fl\xE8ches officielles", risk: "normal", emoji: "\u{1F6A7}", outcomes: [
        { probability: 0.6, text: "Le circuit officiel fait trois fois le tour du p\xE2t\xE9 de maisons et repasse par le point de d\xE9part. Un chef-d'\u0153uvre administratif. Vous arrivez, tard mais r\xE9glementaire.", statChanges: { sleep: -3, mental: 2 } },
        { probability: 0.4, text: "La d\xE9viation vous fait passer devant une boulangerie inconnue qui brade ses invendus de 16h. La bureaucratie a parfois du go\xFBt.", statChanges: { hunger: 12, mental: 5 } }
      ] },
      { text: "Couper \xE0 travers le chantier", risk: "risky", emoji: "\u{1F9BA}", outcomes: [
        { probability: 0.5, text: "L'ouvrier aux grands gestes vous escorte lui-m\xEAme : \xAB passe, mais marche o\xF9 je marche. \xBB Travers\xE9e VIP entre les tranch\xE9es, plus un conseil : \xAB le bitume ti\xE8de, la nuit, \xE7a tient chaud. \xBB Un sage.", statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.5, text: "Votre pied trouve la seule flaque de b\xE9ton frais du chantier. Vous laissez une empreinte pour la post\xE9rit\xE9 et une chaussure alourdie pour le reste du trajet.", statChanges: { health: -3, mental: -4, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "travel-chien-suiveur",
    title: "Le Chien qui Suit",
    type: "social",
    image: "/assets/travel-chien-suiveur.webp",
    description: "Depuis trois rues, un chien jaune sans collier vous suit \xE0 quatre m\xE8tres, l'air de rien. Quand vous vous arr\xEAtez, il s'arr\xEAte. Quand vous repartez, il repart.",
    choices: [
      { text: "L'adopter pour le trajet", risk: "safe", emoji: "\u{1F415}", outcomes: [
        { probability: 0.6, text: "Vous voyagez \xE0 deux. Il trotte fier, vous marchez droit. Les passants sourient au duo, une dame donne \xAB pour le chien \xBB. Le chien partage.", moneyChange: 3, statChanges: { mental: 12 } },
        { probability: 0.4, text: "Au carrefour, il bifurque vers une autre silhouette solitaire, sans un regard. C'est un chien d'accompagnement freelance. Trois rues de compagnie, c'\xE9tait son forfait.", statChanges: { mental: 6 } }
      ] },
      { text: "Tester sa loyaut\xE9 au premier virage", risk: "normal", emoji: "\u{1F500}", outcomes: [
        { probability: 0.5, text: "Vous tournez sec, il coupe la diagonale et vous attend D\xC9J\xC0 de l'autre c\xF4t\xE9. Ce chien conna\xEEt la ville mieux que le cadastre. Vous le suivez, et il vous fait gagner dix minutes.", statChanges: { mental: 8, sleep: 2 } },
        { probability: 0.5, text: "Il s'assied au milieu du virage et vous regarde partir avec une d\xE9ception de vieux ma\xEEtre d'\xE9cole. Vous vous excusez. \xC0 un chien. En public.", statChanges: { mental: 2, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "travel-porche-facteur",
    title: "L'Averse et le Facteur",
    type: "social",
    image: "/assets/travel-porche-facteur.webp",
    description: "Le ciel se d\xE9chire en pleine travers\xE9e. Vous plongez sous un porche d\xE9j\xE0 occup\xE9 par un facteur, sa sacoche, et un silence de circonstance.",
    choices: [
      { text: "Engager la conversation", risk: "safe", emoji: "\u{1F4AC}", outcomes: [
        { probability: 0.7, text: "Vingt minutes de pluie, une tourn\xE9e de confidences : les bo\xEEtes aux lettres pleines de gens partis, les pr\xE9noms qu'il conna\xEEt par c\u0153ur. Il partage son casse-cro\xFBte. Deux m\xE9tiers de la rue qui se comprennent.", statChanges: { hunger: 10, mental: 8 } },
        { probability: 0.3, text: "Il vous apprend le tri postal des porches : \xAB celui-l\xE0 abrite mal du vent d'ouest, prends celui de la pharmacie. \xBB Une cartographie que m\xEAme l'\xE9goutier n'a pas.", statChanges: { mental: 6, sleep: 3 } }
      ] },
      { text: "Attendre en silence, chacun son coin", risk: "safe", emoji: "\u{1F327}\uFE0F", outcomes: [
        { probability: 1, text: "La pluie fait la conversation. Au moment de partir, il vous tend un prospectus : \xAB c'est pas grand-chose, mais c'est sec. \xBB Le geste le plus postal du monde.", statChanges: { mental: 4 } }
      ] }
    ]
  },
  {
    id: "travel-carrefour-touristes",
    title: "Les Touristes Perdus",
    type: "social",
    image: "/assets/travel-carrefour-touristes.webp",
    description: "Au carrefour, un couple de touristes tourne sa carte dans tous les sens. Ils vous rep\xE8rent : dans cette rue, c'est vous qui avez l'air de savoir o\xF9 vous allez. C'est dire.",
    choices: [
      { text: "Les guider en personne", risk: "safe", emoji: "\u{1F9ED}", outcomes: [
        { probability: 0.7, text: "Quinze minutes de d\xE9tour pour les mener \xE0 leur mus\xE9e, avec commentaire des fa\xE7ades. Ils insistent pour payer \xAB le guide \xBB. Vous acceptez \xAB pour la profession \xBB.", moneyChange: 5, statChanges: { mental: 6, dignity: 4 } },
        { probability: 0.3, text: "Vous les perdez ENCORE PLUS. Le quartier a chang\xE9, pas vous. Vous finissez \xE0 trois devant le plan du bus, unis dans l'\xE9chec. Ils vous offrent un gaufre de consolation mutuelle.", statChanges: { hunger: 8, mental: 4, dignity: -2 } }
      ] },
      { text: "Indiquer le chemin d'un geste s\xFBr", risk: "normal", emoji: "\u{1F449}", outcomes: [
        { probability: 0.6, text: "Votre geste est ample, pr\xE9cis, d\xE9finitif. Ils partent confiants dans la bonne direction. Vous restez plant\xE9 l\xE0, investi d'une autorit\xE9 municipale imaginaire.", statChanges: { mental: 5, dignity: 3 } },
        { probability: 0.4, text: "Vous confondez droite et gauche sous pression. Ils partent vers la zone industrielle en vous remerciant chaleureusement. Vous n'avez pas le courage de crier.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "travel-benne-camion",
    title: "Le Camion Complice",
    type: "narrative",
    image: "/assets/travel-benne-camion.webp",
    description: "Un camion plateau d\xE9marre au feu, charg\xE9 de palettes, pile dans votre direction. La ridelle arri\xE8re est basse. Le chauffeur ne regarde que devant.",
    choices: [
      { text: "Monter \xE0 l'arri\xE8re au feu rouge", risk: "risky", emoji: "\u{1F6FB}", outcomes: [
        { probability: 0.5, text: "Douze rues aval\xE9es assis sur une palette, le vent dans la barbe, la ville qui d\xE9file. Vous descendez au ralenti suivant, jambes fra\xEEches, roi du transport combin\xE9.", statChanges: { sleep: 4, mental: 8 } },
        { probability: 0.3, text: "Le chauffeur vous voit dans le r\xE9tro au deuxi\xE8me feu... et vous fait signe de vous accrocher : \xAB fallait demander ! \xBB Il vous d\xE9pose \xE0 destination, porte \xE0 porte. Le covoiturage a un pionnier.", statChanges: { mental: 8, sleep: 4 }, respectChange: 1 },
        { probability: 0.2, text: "Le camion prend le p\xE9riph\xE9rique. Vous descendez \xE0 la premi\xE8re bretelle, \xE0 deux kilom\xE8tres du mauvais c\xF4t\xE9 de la ville. Le progr\xE8s du transport, mais dans le mauvais sens.", statChanges: { sleep: -5, mental: -4, health: -2 } }
      ] },
      { text: "Continuer \xE0 pied, comme un sage", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "La marche, au moins, ne prend jamais le p\xE9riph\xE9rique. Vous arrivez \xE0 l'heure de ceux qui n'ont pas d'heure.", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "travel-voie-ferree",
    title: "Le Long des Rails",
    type: "narrative",
    image: "/assets/travel-voie-ferree.webp",
    description: "Le raccourci du ballast : longer la voie ferr\xE9e d\xE9saffect\xE9e, entre les orties et les traverses. Interdit, d\xE9sert, et deux fois plus court.",
    choices: [
      { text: "Marcher sur les traverses", risk: "normal", emoji: "\u{1F6E4}\uFE0F", outcomes: [
        { probability: 0.6, text: "Un pas par traverse, le rythme vient tout seul. Vous traversez la ville par sa cicatrice, salu\xE9 par deux lapins et un chat de remblai. Arriv\xE9e express.", statChanges: { mental: 6, sleep: 2 } },
        { probability: 0.4, text: "Entre deux traverses, une plaque de ballast roule. Cheville tordue au milieu de nulle part, il reste la moiti\xE9 du chemin \xE0 boiter. Le raccourci rallonge.", statChanges: { health: -6, mental: -3 } }
      ] },
      { text: "Fouiller le long du remblai", risk: "normal", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.5, text: "Le remblai est un mus\xE9e : boulons anciens, une lanterne de chantier qui marche encore, et une plaque \xAB SNCF \xBB que le brocanteur s'arrachera.", moneyChange: 5, statChanges: { mental: 5 }, itemGain: { id: "lanterne-chantier", name: "Lanterne de chantier", emoji: "\u{1F3EE}", type: "tool", value: 6 } },
        { probability: 0.5, text: "Les orties d\xE9fendent leur territoire avec un z\xE8le de vigile. Vous ressortez les mains vides et les chevilles en feu. La nature aussi a ses videurs.", statChanges: { health: -4, mental: -2 } }
      ] }
    ]
  },
  {
    id: "travel-parking-silo",
    title: "Le Parking en Spirale",
    type: "narrative",
    image: "/assets/travel-parking-silo.webp",
    description: "Le parking silo traverse le p\xE2t\xE9 de maisons de part en part. Sept \xE9tages de spirale en b\xE9ton, ou le tour complet par le boulevard. La rampe vous tend les bras.",
    choices: [
      { text: "Couper par la spirale", risk: "normal", emoji: "\u{1F300}", outcomes: [
        { probability: 0.6, text: "Sept \xE9tages de descente en colima\xE7on, l'\xE9cho de vos pas en fanfare. Vous ressortez de l'autre c\xF4t\xE9, l\xE9g\xE8rement \xE9tourdi, largement vainqueur.", statChanges: { mental: 5, sleep: 2 } },
        { probability: 0.4, text: "Au niveau -2, une voiture vous fr\xF4le en klaxonnant comme si VOUS \xE9tiez l'anomalie. Dans un monde de rampes, le pi\xE9ton est un intrus. Vous ressortez quand m\xEAme.", statChanges: { mental: -2, health: -1 } }
      ] },
      { text: "V\xE9rifier les horodateurs au passage", risk: "normal", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.5, text: "Trois machines, deux oublis de monnaie, un ticket encore valide revendu au conducteur suivant. Le silo est une tirelire verticale.", moneyChange: 5, statChanges: { mental: 4 } },
        { probability: 0.5, text: "Les machines sont pass\xE9es au sans-contact. Le progr\xE8s a vid\xE9 les s\xE9biles m\xE9caniques. Vous ressortez bredouille avec une pens\xE9e pour l'ancien monde.", statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "travel-halles-nuit",
    title: "Les Halles \xE0 la Fermeture",
    type: "discovery",
    image: "/assets/travel-halles-nuit.webp",
    description: "Votre trajet traverse les halles couvertes \xE0 l'heure du rideau : les commer\xE7ants remballent, les invendus h\xE9sitent entre la glaci\xE8re et la benne.",
    choices: [
      { text: "Passer lentement entre les \xE9tals", risk: "safe", emoji: "\u{1F9FA}", outcomes: [
        { probability: 0.7, text: "Le fromager vous h\xE8le : \xAB la coulante, l\xE0, elle tiendra pas la nuit. \xBB Puis le primeur, puis la r\xF4tisseuse. Vous ressortez des halles avec un banquet d'invendus. Le timing est un m\xE9tier.", statChanges: { hunger: 24, mental: 8 } },
        { probability: 0.3, text: "Ce soir, une association passe avant vous avec des cagettes. Vous aidez \xE0 charger leur camionnette, et ils vous laissent une part : \xAB circuit court. \xBB", statChanges: { hunger: 12, mental: 5 }, respectChange: 1 }
      ] },
      { text: "Aider \xE0 remonter les rideaux de fer", risk: "safe", emoji: "\u{1F4AA}", outcomes: [
        { probability: 1, text: "Six rideaux de fer, six poign\xE9es de main, deux pi\xE8ces et un poulet de la veille. Les halles paient toujours leur main-d'\u0153uvre du soir, c'est une loi non \xE9crite.", moneyChange: 2, statChanges: { hunger: 15, health: -2 } }
      ] }
    ]
  },
  {
    id: "travel-cimetiere-raccourci",
    title: "Le Raccourci du Cimeti\xE8re",
    type: "narrative",
    image: "/assets/travel-cimetiere-raccourci.webp",
    description: "Le cimeti\xE8re a deux entr\xE9es oppos\xE9es : le traverser coupe le trajet de moiti\xE9. Les all\xE9es sont droites, les r\xE9sidents discrets, le silence p\xE8se son poids.",
    choices: [
      { text: "Traverser d'un pas respectueux", risk: "safe", emoji: "\u{1F54A}\uFE0F", outcomes: [
        { probability: 0.7, text: "Les all\xE9es de gravier, les noms qui d\xE9filent, les dates qui font compter. Vous ressortez de l'autre c\xF4t\xE9 plus calme et vaguement philosophe. Le raccourci le plus paisible de la ville.", statChanges: { mental: 8 } },
        { probability: 0.3, text: "\xC0 mi-chemin, une vieille dame arrose des fleurs et vous prend \xE0 t\xE9moin : \xAB il d\xE9testait les b\xE9gonias, mais je lui en mets quand m\xEAme. \xBB Vous \xE9coutez trente ans de mariage en cinq minutes. Elle vous donne le pain de son sac.", statChanges: { hunger: 10, mental: 8 } }
      ] },
      { text: "S'arr\xEAter boire au robinet des arrosoirs", risk: "safe", emoji: "\u{1F6B0}", outcomes: [
        { probability: 1, text: "L'eau des arrosoirs est municipale, fra\xEEche et gratuite. Les morts ne diront rien : ils partagent tout, eux.", statChanges: { thirst: 15 } }
      ] }
    ]
  },
  {
    id: "travel-berge-canal",
    title: "Le Chemin de Halage",
    type: "narrative",
    image: "/assets/travel-berge-canal.webp",
    description: "Le chemin de halage longe le canal jusqu'au quartier suivant : plat, calme, bord\xE9 de p\xEAcheurs immobiles et de canards administratifs.",
    choices: [
      { text: "Longer l'eau tranquillement", risk: "safe", emoji: "\u{1F986}", outcomes: [
        { probability: 0.7, text: "Le canal fait la moiti\xE9 du travail : on ne marche pas le long de l'eau, on glisse. Un p\xEAcheur vous tend une canette au passage, sans quitter son bouchon des yeux.", statChanges: { thirst: 8, mental: 7 } },
        { probability: 0.3, text: "Une p\xE9niche remonte le canal \xE0 votre vitesse exacte. Trois kilom\xE8tres de compagnonnage muet avec le marinier, conclus d'un coup de corne de brume en guise d'au revoir. Grandiose.", statChanges: { mental: 10 } }
      ] },
      { text: "Ramasser ce que le canal rejette", risk: "normal", emoji: "\u{1F3A3}", outcomes: [
        { probability: 0.5, text: "La berge est g\xE9n\xE9reuse : une bouteille consign\xE9e, un ballon de foot \xE0 peine d\xE9gonfl\xE9, et une chaise de camping qui ne demande qu'\xE0 croire en elle.", moneyChange: 2, statChanges: { mental: 4 }, itemGain: { id: "chaise-camping", name: "Chaise de camping du canal", emoji: "\u{1FA91}", type: "junk", value: 5 } },
        { probability: 0.5, text: "Ce que vous preniez pour un sac flottant \xE9tait un cygne de mauvais poil. La n\xE9gociation territoriale tourne court. Vous c\xE9dez la berge sur cinquante m\xE8tres.", statChanges: { health: -3, dignity: -3, mental: -2 } }
      ] }
    ]
  },
  {
    id: "travel-dame-pipi",
    title: "La Gardienne des Toilettes",
    type: "social",
    image: "/assets/travel-dame-pipi.webp",
    description: "Les toilettes publiques du square, tenues depuis trente ans par une gardienne en blouse qui a tout vu, tout entendu, et gard\xE9 le meilleur.",
    choices: [
      { text: "Payer les 50 centimes r\xE9glementaires", risk: "safe", emoji: "\u{1F6BB}", outcomes: [
        { probability: 0.7, text: "Elle refuse votre pi\xE8ce d'un geste : \xAB toi, c'est offert par la maison. \xBB Lavabo, savon, miroir, et un \xAB bonne route, mon grand \xBB qui vaut un soin du visage.", statChanges: { dignity: 8, mental: 6 } },
        { probability: 0.3, text: "Elle prend la pi\xE8ce, puis vous rend le double \xAB pour le geste \xBB. Sa caisse fonctionne selon des r\xE8gles connues d'elle seule, et elles sont favorables aux polis.", moneyChange: 1, statChanges: { dignity: 5, mental: 4 } }
      ] },
      { text: "Discuter le bout de gras", risk: "safe", emoji: "\u2615", outcomes: [
        { probability: 1, text: "Trente ans de secrets de quartier en vingt minutes : qui a coul\xE9, qui a trich\xE9, o\xF9 dort le patron du kebab quand sa femme le sort. Elle offre le caf\xE9 du percolateur. Une institution.", statChanges: { thirst: 8, mental: 10 } }
      ] }
    ]
  },
  {
    id: "travel-egout-ouvert",
    title: "La Bouche Ouverte",
    type: "narrative",
    image: "/assets/travel-egout-ouvert.webp",
    description: "En travers du trottoir, une bouche d'\xE9gout ouverte, entour\xE9e de trois plots et d'aucun ouvrier. Le trou respire doucement. Le d\xE9tour, lui, fait cinquante m\xE8tres.",
    choices: [
      { text: "Enjamber prudemment", risk: "normal", emoji: "\u{1F9B5}", outcomes: [
        { probability: 0.7, text: "Un grand pas au-dessus du vide, digne d'un h\xE9ron administratif. Le trou vous regarde passer. Vous gagnez cinquante m\xE8tres et un petit frisson.", statChanges: { mental: 3 } },
        { probability: 0.3, text: "Du fond du trou, une voix : \xAB pendant que t'y es, passe-moi la cl\xE9, sur le plot ! \xBB Vous passez la cl\xE9 \xE0 un bras surgi du sol. \xAB Merci ! \xBB La ville fonctionne gr\xE2ce \xE0 des mains anonymes. La v\xF4tre, l\xE0.", statChanges: { mental: 6 }, respectChange: 1 }
      ] },
      { text: "Crier \xAB \xE7a va l\xE0-dessous ? \xBB", risk: "safe", emoji: "\u{1F4E3}", outcomes: [
        { probability: 0.6, text: "\xAB Non ! \xBB r\xE9pond l'\xE9cho, suivi d'un rire. L'ouvrier remonte, s'\xE9tire, et partage son caf\xE9 en \xE9change \xAB de la seule question sinc\xE8re de la journ\xE9e \xBB.", statChanges: { thirst: 8, mental: 6 } },
        { probability: 0.4, text: "Pas de r\xE9ponse. Vous repartez en vous demandant si vous venez de parler \xE0 un trou. Oui. Vous avez parl\xE9 \xE0 un trou. La journ\xE9e est encore longue.", statChanges: { mental: 1 } }
      ] }
    ]
  },
  {
    id: "travel-escalier-monumental",
    title: "L'Escalier Monumental",
    type: "narrative",
    image: "/assets/travel-escalier-monumental.webp",
    description: "Entre le bas et le haut du quartier : l'escalier monumental, cent quatre-vingts marches de pierre que les joggeurs montent en boucle comme des punitions volontaires.",
    choices: [
      { text: "Grimper \xE0 son rythme", risk: "normal", emoji: "\u{1FA9C}", outcomes: [
        { probability: 0.6, text: "Cent quatre-vingts marches en douze paliers de r\xE9cup\xE9ration. En haut, la ville enti\xE8re s'\xE9tale et le vent vous s\xE8che le front. Les joggeurs vous saluent : ici, monter suffit \xE0 faire partie du club.", statChanges: { health: 2, mental: 8, sleep: -3 } },
        { probability: 0.4, text: "Au palier 9, les jambes votent la gr\xE8ve g\xE9n\xE9rale. Vous finissez assis \xE0 mi-hauteur, ni en haut ni en bas, m\xE9taphore trop \xE9vidente pour \xEAtre savour\xE9e. Un joggeur vous tend sa gourde en passant.", statChanges: { thirst: 8, health: -2, mental: 2 } }
      ] },
      { text: "Faire la manche sur le palier du milieu", risk: "normal", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.5, text: "G\xE9nie logistique : \xE0 mi-escalier, tout le monde s'arr\xEAte pour souffler, et un homme qui souffle est un homme qui donne. Le palier 6 est une mine.", moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.5, text: "Les joggeurs ne s'arr\xEAtent JAMAIS. Ils donnent des encouragements : \xAB courage ! \xBB, \xAB bel effort ! \xBB. Vous n'avez rien demand\xE9 de tel. Le chapeau reste vide, l'ironie d\xE9borde.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "travel-trottinette",
    title: "La Trottinette \xC9chou\xE9e",
    type: "discovery",
    image: "/assets/travel-trottinette.webp",
    description: "Une trottinette \xE9lectrique en libre-service g\xEEt couch\xE9e en travers du chemin, abandonn\xE9e avec 40 % de batterie et z\xE9ro surveillance. La tentation a un guidon.",
    choices: [
      { text: "La d\xE9verrouiller \xE0 l'ancienne (la pousser)", risk: "normal", emoji: "\u{1F6F4}", outcomes: [
        { probability: 0.6, text: "D\xE9brid\xE9e fa\xE7on draisienne : un pied dessus, un pied qui pousse. Pas de moteur, pas de tra\xE7age, pas de facture. Vous traversez le quartier en trottinette Flintstones. Efficace et l\xE9gal-ish.", statChanges: { mental: 7, sleep: 3 } },
        { probability: 0.4, text: "La trottinette hurle \xAB V\xC9HICULE EN D\xC9TRESSE \xBB au bout de cent m\xE8tres. Vous la reposez d\xE9licatement, comme une bombe, et partez en sifflotant sous les regards.", statChanges: { mental: -3, dignity: -3 } }
      ] },
      { text: "La redresser et la ranger proprement", risk: "safe", emoji: "\u{1F17F}\uFE0F", outcomes: [
        { probability: 0.7, text: "Vous la garez droite, hors du passage. Un \xAB juicer \xBB qui passait la recharge et vous tend deux pi\xE8ces : \xAB c'est toi qui me l'as gard\xE9e belle. \xBB L'\xE9conomie des plateformes a des marges de gentillesse.", moneyChange: 2, statChanges: { mental: 4 }, respectChange: 1 },
        { probability: 0.3, text: "Redress\xE9e, elle red\xE9marre son bip de d\xE9tresse toute seule. Vous n'y \xEAtes pour rien mais tout le monde vous regarde. Vous plaidez l'innocence par haussement d'\xE9paules et poursuivez votre route.", statChanges: { mental: 1 } }
      ] }
    ]
  },
  {
    id: "travel-cortege-funeraire",
    title: "Le Cort\xE8ge",
    type: "narrative",
    image: "/assets/travel-cortege-funeraire.webp",
    description: "Un cort\xE8ge fun\xE9raire remonte lentement la rue et coupe votre trajet : corbillard, famille en noir, et un klaxon de scooter impatient que tout le monde foudroie du regard.",
    choices: [
      { text: "S'arr\xEAter et se d\xE9couvrir", risk: "safe", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.7, text: "Vous restez droit, bonnet sur le c\u0153ur, le temps du passage. Un monsieur du cort\xE8ge vous adresse un signe de t\xEAte qui vaut tous les certificats de dignit\xE9. Le mort, quelque part, appr\xE9cie le style.", statChanges: { dignity: 8, mental: 5 }, respectChange: 1 },
        { probability: 0.3, text: "Une dame du cort\xE8ge se d\xE9tache et vous glisse un billet : \xAB il donnait toujours, lui. Continuez la tourn\xE9e. \xBB Vous voil\xE0 ex\xE9cuteur testamentaire officieux d'un inconnu g\xE9n\xE9reux.", moneyChange: 5, statChanges: { mental: 6 } }
      ] },
      { text: "Suivre discr\xE8tement jusqu'au vin d'honneur", risk: "risky", emoji: "\u{1F377}", outcomes: [
        { probability: 0.5, text: "La salle paroissiale accueille tout le monde en noir, et votre manteau est presque noir. Quiches, blanc sec, anecdotes sur le d\xE9funt : \xAB lui, il aurait ri de vous voir l\xE0. \xBB Vous levez votre verre \xE0 sa sant\xE9 posthume.", statChanges: { hunger: 18, thirst: 10, mental: 4, dignity: -3 } },
        { probability: 0.5, text: "La famille est petite et se conna\xEEt par c\u0153ur. On vous demande \xAB vous \xEAtes du c\xF4t\xE9 de qui ? \xBB Votre r\xE9ponse (\xAB du quartier \xBB) jette un froid, puis la veuve tranche : \xAB le quartier, c'\xE9tait toute sa vie. Restez. \xBB Sueurs froides, quiche chaude.", statChanges: { hunger: 12, mental: -2, dignity: -2 } }
      ] }
    ]
  },
  {
    id: "travel-camionnette-glaces",
    title: "La Camionnette \xE0 Glaces",
    type: "narrative",
    image: "/assets/travel-camionnette-glaces.webp",
    description: "La ritournelle d'une camionnette \xE0 glaces flotte quelque part dans le quartier, obs\xE9dante, insaisissable. Elle semble tourner autour de vous depuis dix minutes.",
    choices: [
      { text: "La traquer \xE0 l'oreille", risk: "normal", emoji: "\u{1F366}", outcomes: [
        { probability: 0.5, text: "Trois rues de triangulation sonore et vous la coincez au square. Le glacier applaudit : \xAB t'es le premier adulte \xE0 me courir apr\xE8s depuis 1998. \xBB Cornet offert au m\xE9rite.", statChanges: { hunger: 10, mental: 10 } },
        { probability: 0.3, text: "La ritournelle s'\xE9loigne \xE0 jamais, comme l'enfance. Vous restez au milieu du carrefour avec votre envie de glace et vos \xE9conomies intactes. C'est peut-\xEAtre mieux comme \xE7a. Non, en fait, non.", statChanges: { mental: -3 } },
        { probability: 0.2, text: "Vous la retrouvez... en panne. Le glacier, fataliste, brade son stock qui fond : \xAB deux boules pour rien, aide-moi \xE0 pousser. \xBB Vous poussez une camionnette musicale en mangeant une glace. Journ\xE9e inclassable.", statChanges: { hunger: 12, mental: 8, health: -2 } }
      ] },
      { text: "Ignorer la sir\xE8ne et filer tout droit", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Ulysse s'attachait au m\xE2t ; vous, vous acc\xE9l\xE9rez le pas. La ritournelle vous poursuit deux rues puis abandonne. Victoire morale, d\xE9ficit en sorbet.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "travel-brouillard",
    title: "La Pur\xE9e de Pois",
    type: "narrative",
    image: "/assets/travel-brouillard.webp",
    description: "Le brouillard avale le quartier d'un coup : dix m\xE8tres de visibilit\xE9, les lampadaires en halos, les bruits qui arrivent sans propri\xE9taire. La ville devient une rumeur.",
    choices: [
      { text: "Naviguer aux fa\xE7ades", risk: "normal", emoji: "\u{1F32B}\uFE0F", outcomes: [
        { probability: 0.6, text: "Une main sur les murs, l'autre devant, vous traversez le coton. Vous connaissez cette ville par c\u0153ur : le brouillard ne fait que fermer les yeux des autres. Vous arrivez pile o\xF9 vous vouliez.", statChanges: { mental: 6 } },
        { probability: 0.4, text: "Vous d\xE9bouchez... devant le point de d\xE9part. Le brouillard vous a fait faire une boucle parfaite, \xE0 l'insu de votre plein gr\xE9. Quelque part, un lampadaire se moque en morse.", statChanges: { mental: -3, sleep: -3 } }
      ] },
      { text: "Attendre que \xE7a l\xE8ve sous un porche", risk: "safe", emoji: "\u23F3", outcomes: [
        { probability: 0.7, text: "Le brouillard se d\xE9chire en vingt minutes, d\xE9voilant la rue comme un rideau de th\xE9\xE2tre. Vous repartez dans une ville rinc\xE9e, presque neuve. L'attente avait du panache.", statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.3, text: "Une silhouette \xE9merge du blanc, vous tend un thermos sans un mot, boit apr\xE8s vous, et se dissout dans l'autre sens. Vous ne saurez jamais qui. Le brouillard a ses anges.", statChanges: { thirst: 10, mental: 7 } }
      ] }
    ]
  },
  {
    id: "travel-terrain-vague-diagonale",
    title: "La Diagonale du Terrain Vague",
    type: "discovery",
    image: "/assets/travel-terrain-vague-diagonale.webp",
    description: "Le terrain vague coupe le trajet en diagonale : herbes hautes, carcasses de machines \xE0 laver, et un sentier trac\xE9 par des g\xE9n\xE9rations de gens press\xE9s.",
    choices: [
      { text: "Prendre le sentier des press\xE9s", risk: "normal", emoji: "\u{1F33E}", outcomes: [
        { probability: 0.6, text: "Le sentier conna\xEEt son affaire : il \xE9vite les ronces, salue les carcasses et vous recrache de l'autre c\xF4t\xE9 en cinq minutes chrono. Les chemins de traverse sont une sagesse collective.", statChanges: { mental: 4, sleep: 2 } },
        { probability: 0.4, text: "\xC0 mi-diagonale, un lapin d\xE9boule entre vos jambes, poursuivi par rien. Vous sursautez dans les orties. Le lapin, lui, connaissait le sentier.", statChanges: { health: -3, mental: -2 } }
      ] },
      { text: "Fouiller les carcasses au passage", risk: "normal", emoji: "\u{1F527}", outcomes: [
        { probability: 0.5, text: "Le tambour d'une machine \xE0 laver fait un excellent brasero portatif, et le brocanteur le sait aussi. Vous repartez avec, roul\xE9 comme un tonneau. Le trajet double, le butin aussi.", moneyChange: 6, statChanges: { health: -3, mental: 4 } },
        { probability: 0.5, text: "Les carcasses ont d\xE9j\xE0 \xE9t\xE9 vid\xE9es par plus matinal que vous. Il reste un hublot, que vous prenez par principe : \xE7a fera une fen\xEAtre \xE0 votre carton. L'immobilier avance.", statChanges: { mental: 4 }, itemGain: { id: "hublot-machine", name: "Hublot de machine \xE0 laver", emoji: "\u{1FA9F}", type: "junk", value: 3 } }
      ] }
    ]
  },
  {
    id: "travel-vitrine-teles",
    title: "Le Mur de T\xE9l\xE9s",
    type: "narrative",
    image: "/assets/travel-vitrine-teles.webp",
    description: "La vitrine du magasin d'\xE9lectrom\xE9nager diffuse le m\xEAme match sur douze \xE9crans. Devant, un attroupement de passants qui \xAB ne font que passer \xBB depuis vingt minutes.",
    choices: [
      { text: "Rejoindre le stade de trottoir", risk: "safe", emoji: "\u26BD", outcomes: [
        { probability: 0.6, text: "Le quartier au grand complet vibre en silence derri\xE8re la vitre. But \xE0 la 88e : l'attroupement explose, on s'\xE9treint entre inconnus. Vous \xEAtes dans les bras d'un notaire. Le foot est un service public.", statChanges: { mental: 12 } },
        { probability: 0.4, text: "Match nul, z\xE9ro but, mais un vieux monsieur commente chaque action comme \xE0 la radio des ann\xE9es 60. On n'\xE9coute plus que lui. \xC0 la fin, on l'applaudit lui. Il salue.", statChanges: { mental: 8 } }
      ] },
      { text: "Regarder le documentaire de l'\xE9cran du fond", risk: "safe", emoji: "\u{1F427}", outcomes: [
        { probability: 1, text: "Pendant que la foule vit le match, vous suivez seul un documentaire muet sur les manchots empereurs. Soixante-dix jours sans manger dans le blizzard, debout. Des fr\xE8res. Vous repartez galvanis\xE9.", statChanges: { mental: 9 } }
      ] }
    ]
  },
  {
    id: "travel-place-pigeons",
    title: "La Place aux Mille Pigeons",
    type: "narrative",
    image: "/assets/travel-place-pigeons.webp",
    description: "La place est int\xE9gralement couverte de pigeons. Un tapis gris, roucoulant, qui vous s\xE9pare de l'autre c\xF4t\xE9. Ils vous regardent. Ils savent que vous devez passer.",
    choices: [
      { text: "Traverser lentement, en diplomate", risk: "normal", emoji: "\u{1F54A}\uFE0F", outcomes: [
        { probability: 0.6, text: "La mer grise s'ouvre devant vos pas comme pour un proph\xE8te de quartier. Pas un envol, pas un froissement : les pigeons vous ont class\xE9 \xAB des n\xF4tres \xBB. C'est vexant et majestueux \xE0 la fois.", statChanges: { mental: 7 } },
        { probability: 0.4, text: "Un enfant surgit en courant et fait d\xE9coller la place ENTI\xC8RE. Mille pigeons, un seul manteau : le v\xF4tre. Les statistiques du bombardement sont contre vous.", statChanges: { dignity: -6, mental: -3 } }
      ] },
      { text: "Chercher le pigeon bagu\xE9 (un vieil ami ?)", risk: "safe", emoji: "\u{1F9D0}", outcomes: [
        { probability: 0.5, text: "Il est L\xC0. Le pigeon voyageur, votre cr\xE9ancier ail\xE9, au milieu de la pl\xE8be. Il vous reconna\xEEt, s'approche, et d\xE9pose une pi\xE8ce devant vous. G\xE9rard a peut-\xEAtre rembours\xE9.", moneyChange: 1, statChanges: { mental: 8 } },
        { probability: 0.5, text: "Mille pigeons identiques vous fixent. Chercher UN pigeon dans une place de pigeons restera l'entreprise la plus vaine de votre semaine. Pourtant vous recommencerez.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "travel-bache-envolee",
    title: "La B\xE2che Fugitive",
    type: "narrative",
    image: "/assets/travel-bache-envolee.webp",
    description: "Une b\xE2che de chantier s'est arrach\xE9e dans le vent et remonte la rue en roulant comme un fant\xF4me bleu de quatre m\xE8tres. Les passants s'\xE9cartent. Elle vient vers vous.",
    choices: [
      { text: "La capturer au vol", risk: "risky", emoji: "\u{1FAF4}", outcomes: [
        { probability: 0.6, text: "Vous la plaquez au sol apr\xE8s un corps-\xE0-corps \xE9pique applaudi par la terrasse d'en face. Une b\xE2che de chantier neuve : toit, tapis, poncho. Le vent vient de vous livrer un studio.", statChanges: { mental: 8, sleep: 4 }, respectChange: 1, itemGain: { id: "bache-chantier", name: "B\xE2che de chantier (4m)", emoji: "\u{1F7E6}", type: "armor", value: 8, defenseBonus: 1 } },
        { probability: 0.4, text: "La b\xE2che vous engloutit en plein \xE9lan. Vous traversez le carrefour en fant\xF4me bleu titubant, guid\xE9 par les cris des passants. On vous lib\xE8re hilare et d\xE9coiff\xE9. La b\xE2che repart vers d'autres proies.", statChanges: { mental: -2, dignity: -5, health: -2 } }
      ] },
      { text: "La laisser passer, saluer bas", risk: "safe", emoji: "\u{1F44B}", outcomes: [
        { probability: 1, text: "Elle roule majestueusement vers le boulevard, libre comme aucun de vous deux. Vous la saluez. Un autre l'attrapera, ou pas. Certaines choses m\xE9ritent de s'\xE9chapper.", statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "travel-sosie",
    title: "Le Sosie",
    type: "narrative",
    image: "/assets/travel-sosie.webp",
    description: "Sur le trottoir d'en face marche un homme qui vous ressemble trait pour trait : m\xEAme barbe, m\xEAme manteau, m\xEAme d\xE9marche de fatigue digne. Il vous a vu aussi. Vous ralentissez tous les deux.",
    choices: [
      { text: "Aller lui parler", risk: "normal", emoji: "\u{1FA9E}", outcomes: [
        { probability: 0.5, text: "Dix minutes de comparaison ahurie : m\xEAme pr\xE9nom de p\xE8re, m\xEAme ville d'avant, m\xEAme banc pr\xE9f\xE9r\xE9. Vous partagez un caf\xE9 en vous regardant comme un miroir qui aurait mal tourn\xE9. Ou bien tourn\xE9. Impossible \xE0 dire.", statChanges: { mental: 10, thirst: 6 } },
        { probability: 0.5, text: "De pr\xE8s, la ressemblance s'\xE9vapore : il est plus vieux, plus caboss\xE9, plus seul. \xAB Tu me ressembleras dans dix ans si tu l\xE2ches \xBB, dit-il en partant. Vous d\xE9cidez sur-le-champ de ne pas l\xE2cher.", statChanges: { mental: 6, dignity: 4 } }
      ] },
      { text: "Presser le pas, troubl\xE9", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Vous filez sans vous retourner. Au coin de la rue, vous vous retournez quand m\xEAme. Il a disparu. Le quartier a peut-\xEAtre un stock limit\xE9 de silhouettes, et la v\xF4tre est en double.", statChanges: { mental: 4, sleep: -2 } }
      ] }
    ]
  },
  {
    id: "travel-photographe",
    title: "Le Photographe de Rue",
    type: "social",
    image: "/assets/travel-photographe.webp",
    description: "Un photographe en gilet multipoche vous suit depuis deux rues, bo\xEEtier \xE0 l'aff\xFBt. Il finit par oser : \xAB votre visage, c'est la ville enti\xE8re. Je peux ? \xBB",
    choices: [
      { text: "Poser, mais \xE0 votre prix", risk: "normal", emoji: "\u{1F4F7}", outcomes: [
        { probability: 0.6, text: "S\xE9ance de dix minutes contre billet et tirage promis. Il vous montre l'\xE9cran : un inconnu magnifique et creus\xE9 vous regarde. \xAB C'est moi, \xE7a ? \xBB \xAB C'est vous. \xBB Vous encadreriez presque l'inconnu.", moneyChange: 8, statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.4, text: "Il \xAB ne paie jamais ses sujets, par \xE9thique \xBB. Vous \xAB ne posez jamais gratos, par \xE9conomie \xBB. Impasse d\xE9ontologique. Il vous offre au moins le caf\xE9 du d\xE9bat, et le d\xE9bat \xE9tait bon.", statChanges: { thirst: 6, mental: 5 } }
      ] },
      { text: "Refuser : votre image vous appartient", risk: "safe", emoji: "\u{1F645}", outcomes: [
        { probability: 1, text: "\xAB Respect \xBB, dit-il en baissant son bo\xEEtier, et il vous serre la main. \xCAtre ma\xEEtre de quelque chose, ne serait-ce que de son visage, c'est d\xE9j\xE0 un patrimoine.", statChanges: { dignity: 8, mental: 5 } }
      ] }
    ]
  },
  {
    id: "travel-feu-artifice",
    title: "Le Feu d'Artifice Priv\xE9",
    type: "narrative",
    image: "/assets/travel-feu-artifice.webp",
    description: "Derri\xE8re les toits, un feu d'artifice \xE9clate sans pr\xE9venir : un mariage, un anniversaire, une victoire quelconque. Le ciel du quartier s'offre un luxe qui retombe sur tout le monde.",
    choices: [
      { text: "Trouver le meilleur point de vue", risk: "safe", emoji: "\u{1F386}", outcomes: [
        { probability: 0.7, text: "Le muret du parking offre une loge royale. Dix minutes de bouquets dor\xE9s au-dessus des antennes. Les riches paient le spectacle, le ciel le distribue gratuitement. La redistribution existe, elle est pyrotechnique.", statChanges: { mental: 12 } },
        { probability: 0.3, text: "D'autres spectateurs de fortune vous rejoignent sur le muret : deux \xE9tudiants, un veilleur de nuit, un chien. Le bouquet final arrache un \xAB waouh \xBB collectif. Vous applaudissez des inconnus qui f\xEAtent on ne sait quoi. C'\xE9tait tr\xE8s bien.", statChanges: { mental: 10 } }
      ] },
      { text: "Suivre les retomb\xE9es de fus\xE9es", risk: "normal", emoji: "\u{1F9E8}", outcomes: [
        { probability: 0.5, text: "Les carcasses de fus\xE9es retomb\xE9es sentent la poudre et se revendent aux gamins du quartier comme troph\xE9es. Le lendemain d'un feu d'artifice a son march\xE9 secondaire.", moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.5, text: "Une fus\xE9e non \xE9clat\xE9e g\xEEt dans le caniveau. Vous la laissez SAGEMENT o\xF9 elle est et pr\xE9venez le veilleur de nuit. Certains tr\xE9sors sont des pi\xE8ges. Il vous paie le renseignement.", moneyChange: 2, statChanges: { mental: 3 }, respectChange: 1 }
      ] }
    ]
  },
  {
    id: "travel-arroseuse",
    title: "L'Arroseuse Municipale",
    type: "narrative",
    image: "/assets/travel-arroseuse.webp",
    description: "Au bout de la rue, l'arroseuse municipale remonte lentement le caniveau, ses jets balayant tout le trottoir. Le conducteur porte des lunettes de soleil. Il ne ralentira pas.",
    choices: [
      { text: "Calculer le passage entre deux jets", risk: "risky", emoji: "\u{1F30A}", outcomes: [
        { probability: 0.5, text: "Vous passez dans la fen\xEAtre de tir exacte, sec au millim\xE8tre, sous le regard du conducteur qui l\xE8ve un pouce approbateur. Les professionnels se reconnaissent entre eux.", statChanges: { mental: 7 }, respectChange: 1 },
        { probability: 0.5, text: "Le jet pivote au dernier moment. Douch\xE9 int\xE9gral, des chaussettes au bonnet, devant la terrasse du caf\xE9. Le conducteur articule un \xAB pardon \xBB que ses lunettes de soleil rendent peu cr\xE9dible.", statChanges: { health: -3, dignity: -6, mental: -3 } }
      ] },
      { text: "Profiter du trottoir rinc\xE9 derri\xE8re elle", risk: "safe", emoji: "\u2728", outcomes: [
        { probability: 1, text: "Vous marchez dans son sillage, sur un trottoir neuf, luisant, d\xE9sinfect\xE9. La ville sent le propre pendant dix minutes. Vous \xEAtes le premier \xE0 \xE9trenner la rue lav\xE9e : un privil\xE8ge de personne, donc le v\xF4tre.", statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "travel-gants-grille",
    title: "Les Gants sur les Grilles",
    type: "discovery",
    image: "/assets/travel-gants-grille.webp",
    description: "Tout le long de la grille du square, des gants perdus ont \xE9t\xE9 empal\xE9s sur les piques par des passants : une exposition involontaire de mains vides qui saluent.",
    choices: [
      { text: "Chercher deux gants assortis", risk: "normal", emoji: "\u{1F9E4}", outcomes: [
        { probability: 0.5, text: "Miracle statistique : deux gants de laine, taille proche, couleurs cousines. Une paire recompos\xE9e, comme les familles. Vos mains passeront l'hiver.", statChanges: { mental: 6, health: 3 }, itemGain: { id: "gants-depareilles", name: "Paire de gants recompos\xE9e", emoji: "\u{1F9E4}", type: "armor", value: 4, defenseBonus: 1 } },
        { probability: 0.5, text: "Que des gants gauches. TOUS. Onze gants gauches sur une grille. Il existe quelque part un peuple de droitiers manchots dont vous ne saurez jamais rien. Vous en prenez un, pour la main qui souffre le plus.", statChanges: { mental: 4 } }
      ] },
      { text: "Ajouter votre vieux gant trou\xE9 \xE0 l'expo", risk: "safe", emoji: "\u{1F3A8}", outcomes: [
        { probability: 1, text: "Vous empalez c\xE9r\xE9monieusement votre gant trou\xE9 entre deux moufles d'enfant. Le voil\xE0 expos\xE9, salu\xE9 par les passants, plus utile en art qu'en laine. Vous \xEAtes officiellement un artiste du quartier.", statChanges: { mental: 7, dignity: 3 } }
      ] }
    ]
  },
  {
    id: "travel-jardin-prive",
    title: "Le Jardin Traversant",
    type: "narrative",
    image: "/assets/travel-jardin-prive.webp",
    description: "La r\xE9sidence bourgeoise a un jardin traversant dont les deux portillons ferment mal, tout le monde le sait. All\xE9es ratiss\xE9es, massifs taill\xE9s, silence de coton. Interdit, \xE9videmment.",
    choices: [
      { text: "Traverser en propri\xE9taire", risk: "risky", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.6, text: "Menton haut, mains dans le dos, pas de notaire en promenade. Vous traversez les massifs comme un actionnaire inspecte ses rosiers. Une r\xE9sidente vous salue d'un \xAB bonjour \xBB automatique. Le standing est un d\xE9guisement gratuit.", statChanges: { mental: 8, dignity: 6 } },
        { probability: 0.4, text: "Le gardien de la r\xE9sidence surgit derri\xE8re un hortensia. Vous improvisez : \xAB je visite pour un ami. \xBB \xAB Un ami qui s'appelle ? \xBB \xAB ... G\xE9rard. \xBB Il y a TOUJOURS un G\xE9rard. \xC7a passe. De justesse, mais \xE7a passe.", statChanges: { mental: 3, dignity: -2 } }
      ] },
      { text: "Faire une pause sur le banc du fond", risk: "normal", emoji: "\u{1FA91}", outcomes: [
        { probability: 0.6, text: "Dix minutes assis dans un jardin de riches, entre deux massifs qui sentent le budget. Un merle vient vous inspecter, valide, et repart. Vous repartez aussi, repos\xE9 et vaguement anobli.", statChanges: { mental: 8, sleep: 4 } },
        { probability: 0.4, text: "Une r\xE9sidente en peignoir vous rep\xE8re depuis son balcon et... vous descend un caf\xE9 : \xAB vous avez meilleure mine que mon gendre. \xBB Vous buvez un caf\xE9 de balcon dans un jardin interdit. La vie a de ces trajectoires.", statChanges: { thirst: 8, mental: 8 } }
      ] }
    ]
  }
];

// client/src/contexts/data/events2-suites.ts
var FOLLOW_UP_EVENTS_2 = {
  "suite-chaton-boulangere": {
    id: "suite-chaton-boulangere",
    title: "Le Chat de la Boulang\xE8re",
    type: "social",
    image: "/assets/followup-chaton-boulangere.webp",
    isFollowUp: true,
    requiresFlag: "chaton-boulangere",
    description: "Dans la vitrine de la boulangerie, entre les \xE9clairs et les chouquettes, tr\xF4ne VOTRE chaton pirate, devenu gros comme une brioche. Il vous reconna\xEEt. Il d\xE9tourne le regard, en chat.",
    choices: [
      { text: "Entrer saluer le tra\xEEtre", risk: "safe", emoji: "\u{1F408}", outcomes: [
        { probability: 0.7, text: "\xAB C'est vous, son sauveteur ?! \xBB La boulang\xE8re refuse que vous repartiez les mains vides : sacs de viennoiseries, caf\xE9, et visite officielle au chat, qui consent \xE0 un ronron diplomatique.", statChanges: { hunger: 20, thirst: 8, mental: 12 }, respectChange: 2, removeFlag: "chaton-boulangere" },
        { probability: 0.3, text: "Le chat fait mine de ne pas vous conna\xEEtre, puis vous suit dans la rue sur cent m\xE8tres, l'air de rien, avant de rentrer. Les adieux des chats sont des contrats compliqu\xE9s. La boulang\xE8re vous glisse un pain au chocolat de messager.", statChanges: { hunger: 10, mental: 10 }, removeFlag: "chaton-boulangere" }
      ] },
      { text: "Regarder la vitrine sans entrer", risk: "safe", emoji: "\u{1FA9F}", outcomes: [
        { probability: 1, text: "Il dort sur les baguettes, en s\xE9curit\xE9, au chaud. C'est exactement ce que vous vouliez pour lui. Certaines victoires se regardent \xE0 travers une vitre.", statChanges: { mental: 8 }, removeFlag: "chaton-boulangere" }
      ] }
    ]
  },
  "suite-grille-egoutier": {
    id: "suite-grille-egoutier",
    title: "La Grille de l'\xC9goutier",
    type: "discovery",
    image: "/assets/followup-grille-egoutier.webp",
    isFollowUp: true,
    requiresFlag: "grille-egoutier",
    description: "Vous retrouvez la grille d'a\xE9ration que l'\xE9goutier vous avait indiqu\xE9e. Il n'avait pas menti : un souffle ti\xE8de, r\xE9gulier, et des rats effectivement polis qui laissent la place.",
    choices: [
      { text: "S'installer pour la nuit", risk: "safe", emoji: "\u2668\uFE0F", outcomes: [
        { probability: 0.7, text: "La meilleure nuit d'hiver de votre carri\xE8re de dormeur urbain. Le souffle du sous-sol vous tient chaud jusqu'\xE0 l'aube. Quelque part en dessous, l'\xE9goutier philosophe veille sur son royaume.", statChanges: { sleep: 22, health: 4, mental: 8 }, removeFlag: "grille-egoutier" },
        { probability: 0.3, text: "L'\xE9goutier remonte \xE0 6h par la bouche voisine et vous trouve install\xE9 : \xAB ah, t'as test\xE9 l'adresse ! \xBB Il partage le caf\xE9 du thermos et vous confie une deuxi\xE8me grille \xAB pour les grands froids \xBB. Un r\xE9seau immobilier souterrain.", statChanges: { sleep: 16, thirst: 8, mental: 8 }, respectChange: 1, removeFlag: "grille-egoutier" }
      ] },
      { text: "Garder l'adresse pour une nuit de gel", risk: "safe", emoji: "\u{1F9E0}", outcomes: [
        { probability: 1, text: "Vous m\xE9morisez l'endroit et repartez. Savoir qu'elle existe r\xE9chauffe d\xE9j\xE0 : c'est \xE7a, un patrimoine.", statChanges: { mental: 6, sleep: 4 }, removeFlag: "grille-egoutier" }
      ] }
    ]
  },
  "suite-prophetie-toit": {
    id: "suite-prophetie-toit",
    title: "Le Retour de Madame Esperanza",
    type: "social",
    image: "/assets/followup-prophetie-toit.webp",
    isFollowUp: true,
    requiresFlag: "prophetie-toit",
    description: "La caravane mauve est revenue se garer sur le terrain vague. Madame Esperanza vous fait signe avant m\xEAme que vous approchiez : \xAB je vous attendais. Les cartes ont boug\xE9. \xBB",
    choices: [
      { text: "\xC9couter la suite de la proph\xE9tie", risk: "safe", emoji: "\u{1F52E}", outcomes: [
        { probability: 0.6, text: "\xAB Le toit se rapproche. Je vois... du carton, mais noble. Un carton de roi. \xBB Elle vous offre le th\xE9 et une bougie \xAB pour tenir jusqu'au toit \xBB. Vous y croyez \xE0 30 %, mais ces 30 % tiennent chaud.", statChanges: { mental: 12, thirst: 8 }, itemGain: { id: "bougie-esperanza", name: "Bougie d'Esperanza", emoji: "\u{1F56F}\uFE0F", type: "junk", value: 4, effect: { mental: 6 } }, removeFlag: "prophetie-toit" },
        { probability: 0.4, text: "Elle retourne trois cartes, fronce les sourcils, en retourne une quatri\xE8me : \xAB disons que le toit prend un itin\xE9raire bis. \xBB Elle vous rembourse une consultation que vous n'avez jamais pay\xE9e. La logique mystique a ses largesses.", moneyChange: 3, statChanges: { mental: 6 }, removeFlag: "prophetie-toit" }
      ] },
      { text: "Demander plut\xF4t un num\xE9ro de loto", risk: "normal", emoji: "\u{1F3B0}", outcomes: [
        { probability: 0.5, text: "\xAB Le 12. Mais uniquement mercredi. Et uniquement si vous partagez. \xBB Vous jouez le 12 avec la pi\xE8ce d'un passant mis dans la confidence : trois euros de gain, partag\xE9s religieusement. La proph\xE9tie \xE9tait modeste mais exacte.", moneyChange: 2, statChanges: { mental: 8 }, removeFlag: "prophetie-toit" },
        { probability: 0.5, text: "\xAB Les cartes ne font pas les imp\xF4ts, jeune homme. \xBB Vex\xE9e, elle referme le rideau. Vous avez bris\xE9 le protocole mystique. Le toit attendra.", statChanges: { mental: -3 }, removeFlag: "prophetie-toit" }
      ] }
    ]
  },
  "suite-rival-echecs": {
    id: "suite-rival-echecs",
    title: "La Revanche",
    type: "social",
    image: "/assets/followup-rival-echecs.webp",
    isFollowUp: true,
    requiresFlag: "rival-echecs",
    description: "Le vieux joueur d'\xE9checs vous attend au parc, pendule sortie, thermos plein, regard d'acier : \xAB la revanche. J'ai pr\xE9par\xE9 une ouverture toute la semaine. \xBB Il y a des spectateurs. Il a pr\xE9venu des gens.",
    choices: [
      { text: "Jouer la revanche devant le public", risk: "normal", emoji: "\u265F\uFE0F", outcomes: [
        { probability: 0.5, text: "Il gagne au 34e coup, se l\xE8ve et vous serre la main devant tout le monde : \xAB voil\xE0 un adversaire. \xBB Le public applaudit les DEUX joueurs. Il vous nomme officiellement \xAB la revanche du jeudi \xBB. Vous avez un rendez-vous hebdomadaire, des madeleines \xE0 vie et un titre.", statChanges: { mental: 14, dignity: 6, hunger: 6 }, respectChange: 3, removeFlag: "rival-echecs" },
        { probability: 0.5, text: "Vous gagnez ENCORE, sur une gaffe de sa dame. Long silence. Puis il rit, pour la premi\xE8re fois depuis des ann\xE9es dit un spectateur \xE9mu. Il vous offre sa pendule : \xAB je ne peux plus jouer contre la montre, elle est de votre c\xF4t\xE9. \xBB", statChanges: { mental: 16, dignity: 8 }, respectChange: 3, itemGain: { id: "pendule-echecs", name: "Pendule d'\xE9checs du rival", emoji: "\u23F1\uFE0F", type: "junk", value: 10, effect: { mental: 8 } }, removeFlag: "rival-echecs" }
      ] },
      { text: "D\xE9clarer forfait avec panache", risk: "safe", emoji: "\u{1F3A9}", outcomes: [
        { probability: 1, text: "\xAB On ne rejoue pas un miracle. \xBB Le vieux appr\xE9cie la formule, le public aussi. Match nul diplomatique, madeleines partag\xE9es, honneurs saufs des deux c\xF4t\xE9s de l'\xE9chiquier.", statChanges: { mental: 8, hunger: 6 }, respectChange: 1, removeFlag: "rival-echecs" }
      ] }
    ]
  },
  "suite-pote-videur": {
    id: "suite-pote-videur",
    title: "Le Plan du Videur",
    type: "social",
    image: "/assets/followup-pote-videur.webp",
    isFollowUp: true,
    requiresFlag: "pote-videur",
    description: "Le videur vous intercepte d'un signe de menton : \xAB samedi, mon coll\xE8gue du vestiaire est aux prud'hommes contre sa belle-s\u0153ur, longue histoire. J'ai dit au patron que je connaissais quelqu'un de fiable. C'est toi, le quelqu'un. \xBB",
    choices: [
      { text: "Assurer le vestiaire samedi soir", risk: "normal", emoji: "\u{1F9E5}", outcomes: [
        { probability: 0.7, text: "Deux cents manteaux num\xE9rot\xE9s sans une erreur, des pourboires de gens qui veulent impressionner leur rencard, et le patron qui note votre nom \xAB pour les galas \xBB. Le videur rayonne : son poulain a gagn\xE9.", moneyChange: 14, statChanges: { mental: 10, dignity: 8, sleep: -5 }, respectChange: 3, removeFlag: "pote-videur" },
        { probability: 0.3, text: "Vous inversez les tickets 12 et 21 : une influenceuse repart avec la doudoune d'un notaire. La crise diplomatique dure vingt minutes, le videur \xE9teint l'incendie en riant. Pay\xE9 quand m\xEAme, \xAB pour le divertissement \xBB.", moneyChange: 7, statChanges: { mental: 4, dignity: -3, sleep: -5 }, removeFlag: "pote-videur" }
      ] },
      { text: "Refuser : trop de monde, trop de manteaux", risk: "safe", emoji: "\u{1F645}", outcomes: [
        { probability: 1, text: "Le videur hoche la t\xEAte sans juger : \xAB je garde le tuyau pour une autre fois. \xBB Il vous paie un kebab de consolation. L'amiti\xE9 survit aux refus, c'est m\xEAme \xE0 \xE7a qu'on la reconna\xEEt.", statChanges: { hunger: 18, mental: 5 }, removeFlag: "pote-videur" }
      ] }
    ]
  },
  "suite-carte-biblio": {
    id: "suite-carte-biblio",
    title: "Le Club de Lecture",
    type: "social",
    image: "/assets/followup-carte-biblio.webp",
    isFollowUp: true,
    requiresFlag: "carte-biblio",
    description: "La biblioth\xE9caire du bibliobus vous rep\xE8re de loin et brandit un livre : \xAB je vous l'ai mis de c\xF4t\xE9 ! Et jeudi, c'est le club de lecture. Il y a du caf\xE9 et personne n'ose jamais parler. Vous, vous oseriez. \xBB",
    choices: [
      { text: "Venir au club de lecture", risk: "safe", emoji: "\u{1F4D6}", outcomes: [
        { probability: 0.7, text: "Sept retrait\xE9es, un thermos, un roman norv\xE9gien. Votre lecture du personnage principal (\xAB il dort dehors par choix, \xE7a n'existe pas, madame \xBB) retourne le club. On vous r\xE9invite \xC0 VIE. Avec cake.", statChanges: { mental: 14, hunger: 10, thirst: 8, dignity: 6 }, respectChange: 2, removeFlag: "carte-biblio" },
        { probability: 0.3, text: "Vous n'avez pas fini le livre (il vous a servi d'oreiller au chapitre 9). Vous improvisez brillamment sur la couverture. Deux membres du club font pareil depuis 2015, \xE7a se voit dans leurs yeux. Pacte silencieux, caf\xE9 \xE0 volont\xE9.", statChanges: { mental: 10, thirst: 8 }, removeFlag: "carte-biblio" }
      ] },
      { text: "Prendre juste le livre mis de c\xF4t\xE9", risk: "safe", emoji: "\u{1F381}", outcomes: [
        { probability: 1, text: "Un roman d'aventure avec TOUTES ses pages, r\xE9serv\xE9 \xE0 VOTRE nom sur un post-it. Ce post-it vaut tous les courriers officiels du monde.", statChanges: { mental: 12 }, itemGain: { id: "roman-reserve", name: "Roman r\xE9serv\xE9 \xE0 votre nom", emoji: "\u{1F4D5}", type: "junk", value: 3, effect: { mental: 8 } }, removeFlag: "carte-biblio" }
      ] }
    ]
  },
  "suite-ennemi-pere-noel": {
    id: "suite-ennemi-pere-noel",
    title: "La Vendetta du P\xE8re No\xEBl",
    type: "narrative",
    image: "/assets/followup-ennemi-pere-noel.webp",
    isFollowUp: true,
    requiresFlag: "ennemi-pere-noel",
    description: "Le P\xE8re No\xEBl du march\xE9 vous a retrouv\xE9. Il a fait le tour des commer\xE7ants en racontant que vous \xAB voliez la magie de No\xEBl \xBB. Trois boutiques vous regardent de travers. Il est l\xE0, bras crois\xE9s, la hotte pleine de rancune.",
    choices: [
      { text: "Crever l'abc\xE8s devant les commer\xE7ants", risk: "risky", emoji: "\u{1F385}", outcomes: [
        { probability: 0.5, text: "\xAB Un P\xE8re No\xEBl qui chasse un pauvre en d\xE9cembre, \xE7a se met en sc\xE8ne ? \xBB La formule fait mouche : les commer\xE7ants se marrent, le P\xE8re No\xEBl bat en retraite dans un tintement de grelots vex\xE9s. La boulang\xE8re vous offre un chocolat chaud de d\xE9dommagement.", statChanges: { mental: 8, dignity: 6, thirst: 8 }, respectChange: 2, removeFlag: "ennemi-pere-noel" },
        { probability: 0.5, text: "Il a le sens du th\xE9\xE2tre et trente ans de m\xE9tier : il pleure. UN P\xC8RE NO\xCBL QUI PLEURE. Devant des enfants. Vous \xEAtes officiellement le m\xE9chant du quartier jusqu'en janvier. Le kebabier, seul dissident, vous sert quand m\xEAme.", statChanges: { mental: -6, dignity: -5, hunger: 8 }, respectChange: -2, removeFlag: "ennemi-pere-noel" }
      ] },
      { text: "Faire la paix avec un caf\xE9", risk: "normal", emoji: "\u2615", outcomes: [
        { probability: 0.7, text: "Sous la barbe, un ancien de la rue, lui aussi. Deux caf\xE9s plus tard, l'armistice est sign\xE9 : le parvis pour lui, la sortie du march\xE9 pour vous, et \xAB joyeux No\xEBl, coll\xE8gue \xBB. Les guerres de territoire finissent parfois en g\xE9ographie.", statChanges: { mental: 8, thirst: 6 }, respectChange: 1, removeFlag: "ennemi-pere-noel" },
        { probability: 0.3, text: "Il accepte le caf\xE9, le boit, et maintient la vendetta : \xAB c'est pas personnel, c'est commercial. \xBB Un P\xE8re No\xEBl avec un business plan. Vous c\xE9dez le march\xE9 de No\xEBl, il vous conc\xE8de un hochement de t\xEAte annuel.", statChanges: { mental: -3 }, removeFlag: "ennemi-pere-noel" }
      ] }
    ]
  },
  "suite-bonnet-otage": {
    id: "suite-bonnet-otage",
    title: "Le Bonnet Otage",
    type: "social",
    image: "/assets/followup-bonnet-otage.webp",
    isFollowUp: true,
    requiresFlag: "bonnet-otage",
    description: "Le vendeur de hot-dogs a puni votre larcin en \xE9pinglant votre bonnet EN HAUT DE SON PARASOL, comme un troph\xE9e de guerre. Il vous voit arriver et tapote le manche : \xAB on n\xE9gocie, ou tu hivernes t\xEAte nue ? \xBB",
    choices: [
      { text: "Payer sa dette en plonge", risk: "safe", emoji: "\u{1F9FD}", outcomes: [
        { probability: 0.7, text: "Une heure \xE0 r\xE9curer la plancha en \xE9change du bonnet, descendu avec les honneurs militaires. Il ajoute un hot-dog \xAB de fin de peine \xBB et une poign\xE9e de main : \xAB t'as pay\xE9, on est quittes. La prochaine fois, demande. \xBB", statChanges: { hunger: 18, mental: 6, dignity: 4 }, respectChange: 2, removeFlag: "bonnet-otage" },
        { probability: 0.3, text: "Pendant votre plonge, un client demande \xAB c'est quoi le bonnet l\xE0-haut ? \xBB. Le vendeur raconte TOUTE l'histoire, avec des effets de manche. Vous \xEAtes d\xE9sormais une l\xE9gende locale mineure : \xAB le gars du bonnet \xBB. Le bonnet, lui, est rendu.", statChanges: { hunger: 10, mental: 4, dignity: -3 }, respectChange: 1, removeFlag: "bonnet-otage" }
      ] },
      { text: "Tenter la r\xE9cup\xE9ration nocturne", risk: "risky", emoji: "\u{1F319}", outcomes: [
        { probability: 0.5, text: "Escalade du parasol \xE0 3h du matin, extraction chirurgicale du bonnet, disparition dans la nuit. Le lendemain, le vendeur affiche : \xAB respect. Hot-dog offert au ninja. \xBB Vous venez manger votre troph\xE9e de guerre.", statChanges: { mental: 8, hunger: 15 }, respectChange: 1, removeFlag: "bonnet-otage" },
        { probability: 0.5, text: "Le parasol s'effondre sur le stand avec vous accroch\xE9 dessus. Le vendeur, r\xE9veill\xE9 par le vacarme depuis sa camionnette, contemple le d\xE9sastre : vous l'aiderez \xE0 TOUT remonter, et le bonnet reste otage une semaine de plus, avec des ketchup de guerre dessus.", statChanges: { health: -5, mental: -5, dignity: -6 }, removeFlag: "bonnet-otage" }
      ] }
    ]
  },
  "suite-contractuelle": {
    id: "suite-contractuelle",
    title: "L'\u0152il de la Contractuelle",
    type: "narrative",
    image: "/assets/followup-contractuelle.webp",
    isFollowUp: true,
    requiresFlag: "reperee-contractuelle",
    description: "La contractuelle qui a confisqu\xE9 votre commerce d'horodateur vous a mis \xAB dans son p\xE9rim\xE8tre \xBB. Elle appara\xEEt partout o\xF9 vous posez le chapeau, carnet en main, comme une ombre asserment\xE9e. Les passants n'osent plus donner.",
    choices: [
      { text: "N\xE9gocier un armistice administratif", risk: "normal", emoji: "\u{1F91D}", outcomes: [
        { probability: 0.6, text: "Vous plaidez votre cause entre deux pare-brises : \xAB je vends plus rien, je tends juste la main. \xBB Elle range le carnet : \xAB la main, c'est l\xE9gal. L'horodateur, non. \xBB Armistice sign\xE9 d'un hochement. Elle met m\xEAme une pi\xE8ce, \xAB \xE0 titre priv\xE9 \xBB.", moneyChange: 2, statChanges: { mental: 8 }, respectChange: 1, removeFlag: "reperee-contractuelle" },
        { probability: 0.4, text: "Elle \xE9coute, impassible, et vous verbalise... un avertissement p\xE9dagogique fictif sur papier libre. C'est illisible et sans valeur, mais elle y a mis du c\u0153ur. Vous \xEAtes quitte, sous surveillance all\xE9g\xE9e.", statChanges: { mental: 2, dignity: -2 }, removeFlag: "reperee-contractuelle" }
      ] },
      { text: "Migrer de quartier le temps que \xE7a passe", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Trois rues plus loin, hors de son secteur, la vie reprend. Vous croisez sa coll\xE8gue du secteur 7, qui ne vous conna\xEEt pas. La bureaucratie a des fronti\xE8res, et c'est parfois une b\xE9n\xE9diction.", statChanges: { mental: 5 }, removeFlag: "reperee-contractuelle" }
      ] }
    ]
  },
  "suite-colis-lucie": {
    id: "suite-colis-lucie",
    title: "Le Mot de Lucie",
    type: "narrative",
    image: "/assets/followup-colis-lucie.webp",
    isFollowUp: true,
    requiresFlag: "colis-lucie",
    description: "Sur la porte du hall, un mot manuscrit : \xAB \xC0 la personne qui a pris mon colis : j'esp\xE8re que le plaid vous tient chaud. S\xE9rieusement. Il fait froid. Lucie (3B). PS : les coussins, par contre, j'y tenais. \xBB",
    choices: [
      { text: "Rendre les coussins avec un mot d'excuse", risk: "safe", emoji: "\u{1F4DD}", outcomes: [
        { probability: 0.7, text: "Vous d\xE9posez les coussins et trois lignes d'excuses devant le 3B. Le lendemain, une bo\xEEte vous attend au m\xEAme endroit : des gants, un thermos, et \xAB le plaid est \xE0 vous. Officiellement. Lucie. \xBB Vous dormez chaud et l\xE9ger : les deux en m\xEAme temps, c'est rare.", statChanges: { mental: 14, dignity: 10, sleep: 4 }, respectChange: 2, removeFlag: "colis-lucie" },
        { probability: 0.3, text: "Lucie ouvre pendant le d\xE9p\xF4t. Silence dense. Puis : \xAB au moins vous rendez. Caf\xE9 ? \xBB Vingt minutes de conversation dans l'embrasure, les coussins entre vous comme des otages lib\xE9r\xE9s. Elle garde le mot d'excuse \xAB pour la post\xE9rit\xE9 \xBB.", statChanges: { mental: 10, thirst: 6, dignity: 6 }, removeFlag: "colis-lucie" }
      ] },
      { text: "Garder le butin et changer de hall", risk: "normal", emoji: "\u{1F32B}\uFE0F", outcomes: [
        { probability: 1, text: "Vous emportez plaid et coussins vers un autre quartier. Le confort reste, le mot de Lucie aussi, quelque part entre les c\xF4tes. \xAB S\xE9rieusement. Il fait froid. \xBB Elle avait raison sur toute la ligne, et c'est bien le probl\xE8me.", statChanges: { sleep: 6, mental: -8, dignity: -6 }, removeFlag: "colis-lucie" }
      ] }
    ]
  }
};

// client/src/contexts/data/events.ts
var EXPLORE_EVENTS = [
  {
    id: "exp-jardinier",
    title: "Le Jardinier Clandestin",
    type: "social",
    image: "/assets/exp-jardinier-CR6HfMPJyNzdVNNx5SD2YN.webp",
    description: "Un vieil homme cultive des l\xE9gumes en cachette dans un coin du parc. Il vous rep\xE8re.",
    choices: [
      { text: "Proposer votre aide", risk: "safe", emoji: "\u{1F331}", outcomes: [
        { probability: 0.7, text: 'Il accepte ! Vous passez une heure \xE0 jardiner. Il vous donne une tomate. "Reviens demain, petit."', statChanges: { hunger: 10, mental: 8, dignity: 5 }, addFlag: "ami-jardinier" },
        { probability: 0.3, text: `Il vous regarde avec m\xE9fiance. "D\xE9gage, c'est mon coin." Il ne se remet \xE0 sarcler qu'une fois l'all\xE9e vide.`, statChanges: { mental: -3 } }
      ] },
      { text: "Voler quelques l\xE9gumes discr\xE8tement", risk: "risky", emoji: "\u{1F955}", outcomes: [
        { probability: 0.4, text: "Vous chopez 3 carottes et une courgette. La courgette ne rentre dans aucune poche, vous la portez sous le bras comme un nourrisson.", statChanges: { hunger: 20, dignity: -10 } },
        { probability: 0.6, text: 'Il vous attrape la main. "Voleur !" Il alerte tout le parc.', statChanges: { dignity: -20, mental: -5 }, respectChange: -3 }
      ] },
      { text: "Observer de loin et noter l'emplacement", risk: "safe", emoji: "\u{1F440}", outcomes: [
        { probability: 1, text: "Vous m\xE9morisez l'endroit. \xC7a pourrait servir plus tard.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-enfant-perdu",
    title: "L'Enfant Perdu",
    type: "social",
    image: "/assets/exp-enfant-perdu-A9tLX2MXC6uiVEZLziz2AV.webp",
    description: "Un gamin de 6 ans pleure sur un banc. Il a perdu sa maman dans le parc.",
    choices: [
      { text: "L'aider \xE0 retrouver sa m\xE8re", risk: "safe", emoji: "\u{1F469}\u200D\u{1F466}", outcomes: [
        { probability: 0.7, text: 'Vous retrouvez la m\xE8re en 10 minutes. Elle vous remercie avec 5\u20AC et un sandwich. "Merci infiniment !"', moneyChange: 5, statChanges: { hunger: 15, dignity: 10, mental: 10 }, respectChange: 3, addFlag: "hero-enfant" },
        { probability: 0.3, text: "La m\xE8re arrive en courant. Elle vous regarde avec suspicion et emm\xE8ne l'enfant sans un mot.", statChanges: { dignity: -5, mental: -5 } }
      ] },
      { text: "Appeler la police", risk: "safe", emoji: "\u{1F4DE}", outcomes: [
        { probability: 0.8, text: "La police arrive et retrouve la m\xE8re. Un agent vous remercie discr\xE8tement.", statChanges: { dignity: 5, mental: 5 }, respectChange: 1 },
        { probability: 0.2, text: "La police vous interroge longuement. Vous \xEAtes suspect num\xE9ro 1.", statChanges: { dignity: -10, mental: -8 } }
      ] },
      { text: "Passer votre chemin", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Vous partez. Le gamin pleure de plus belle, et vous l'entendez encore deux rues plus loin.", statChanges: { mental: -8 } }
      ] }
    ]
  },
  {
    id: "exp-skateur",
    title: "Le Skateur Cascadeur",
    type: "narrative",
    image: "/assets/exp-skateur-BRXHRUvw2hTywwb7KYwfjU.webp",
    description: "Un ado fait des figures de skate devant vous. Il rate un trick et son skate roule vers vous.",
    choices: [
      { text: "Lui renvoyer le skate avec style", risk: "normal", emoji: "\u{1F6F9}", outcomes: [
        { probability: 0.5, text: `Vous renvoyez le skate d'un coup de pied parfait. "Trop styl\xE9 le vieux !" Il vous file 3\u20AC.`, moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.5, text: "Le skate vous \xE9chappe et finit dans une flaque. L'ado vous fusille du regard.", statChanges: { dignity: -5 } }
      ] },
      { text: "Garder le skate", risk: "risky", emoji: "\u{1F60F}", outcomes: [
        { probability: 0.3, text: "L'ado part en pleurant. Vous avez un skate, une roue qui grince, et personne \xE0 qui le rendre.", statChanges: { dignity: -15, mental: -5 }, itemGain: { id: "skate", name: "Skateboard vol\xE9", emoji: "\u{1F6F9}", type: "tool", value: 15 } },
        { probability: 0.7, text: "Ses potes arrivent. Vous rendez le skate tr\xE8s vite.", statChanges: { dignity: -10, health: -5 } }
      ] }
    ]
  },
  {
    id: "exp-mariage",
    title: "Le Mariage en Plein Air",
    type: "social",
    image: "/assets/exp-mariage-YCDbQUMdsv52wEtgeLS3bm.webp",
    description: "Un mariage se d\xE9roule dans le parc. Buffet, musique, gens bien habill\xE9s. Vous bavez.",
    choices: [
      { text: "Se faufiler discr\xE8tement au buffet", risk: "risky", emoji: "\u{1F370}", outcomes: [
        { probability: 0.4, text: "Personne ne vous remarque ! Vous mangez comme un roi. Saumon, fromage, petits fours...", statChanges: { hunger: 30, thirst: 15, mental: 10 } },
        { probability: 0.6, text: `Le photographe vous rep\xE8re. "C'est qui celui-l\xE0 ?" Expuls\xE9 manu militari.`, statChanges: { dignity: -15, mental: -5 } }
      ] },
      { text: "Applaudir de loin les mari\xE9s", risk: "safe", emoji: "\u{1F44F}", outcomes: [
        { probability: 0.8, text: "Les mari\xE9s vous voient et vous font porter une part de g\xE2teau par un enfant en n\u0153ud papillon, qui repart en courant.", statChanges: { hunger: 15, mental: 8, dignity: 5 } },
        { probability: 0.2, text: "Personne ne vous remarque. Vous regardez la mari\xE9e danser avec son p\xE8re jusqu'\xE0 la fin de la chanson, puis vous partez.", statChanges: { mental: -5 } }
      ] },
      { text: "Se m\xEAler aux invit\xE9s avec assurance", risk: "normal", emoji: "\u{1F942}", requirements: { stat: "dignity", minValue: 55 }, outcomes: [
        { probability: 0.8, text: "Personne ne doute de vous : champagne, petits fours, et vous portez m\xEAme un toast aux mari\xE9s !", statChanges: { hunger: 25, thirst: 20, mental: 12, dignity: 3 } },
        { probability: 0.2, text: "La grand-m\xE8re de la mari\xE9e vous d\xE9masque\u2026 mais vous trouve charmant. Elle vous remplit une assiette en douce.", statChanges: { hunger: 15, mental: 8 } }
      ] }
    ]
  },
  {
    id: "exp-artiste-rue",
    title: "L'Artiste de Rue",
    type: "social",
    image: "/assets/exp-artiste-rue-8igrUxzSFhRMd2FECQMv7h.webp",
    description: "Un artiste peint votre portrait \xE0 la craie sur le trottoir sans vous demander.",
    choices: [
      { text: "Poser fi\xE8rement", risk: "safe", emoji: "\u{1F3A8}", outcomes: [
        { probability: 0.8, text: "Le portrait est magnifique ! Les passants s'arr\xEAtent. Vous r\xE9coltez 4\u20AC en pourboires.", moneyChange: 4, statChanges: { dignity: 10, mental: 8 }, respectChange: 2 },
        { probability: 0.2, text: "Le portrait est... abstrait. Tr\xE8s abstrait. Vous ne vous reconnaissez pas.", statChanges: { mental: -3, dignity: -2 } }
      ] },
      { text: "Demander une commission", risk: "normal", emoji: "\u{1F4B0}", outcomes: [
        { probability: 0.5, text: "L'artiste partage : 3\u20AC pour vous. Il compte les pi\xE8ces deux fois, \xE0 voix haute, pour que ce soit clair.", moneyChange: 3, statChanges: { dignity: 5 } },
        { probability: 0.5, text: `"C'est de l'art, pas du commerce !" Il efface votre portrait, vex\xE9.`, statChanges: { mental: -5 } }
      ] }
    ]
  },
  {
    id: "exp-chantier",
    title: "Le Chantier Abandonn\xE9",
    type: "discovery",
    image: "/assets/exp-chantier-6FzS2TzBL94xF7YBmdTXUz.webp",
    description: "Un chantier abandonn\xE9. Des mat\xE9riaux tra\xEEnent partout. Mais des bruits suspects viennent du fond.",
    choices: [
      { text: "Explorer prudemment", risk: "normal", emoji: "\u{1F526}", outcomes: [
        { probability: 0.5, text: "Vous trouvez une b\xE2che imperm\xE9able et trois planches encore s\xE8ches, empil\xE9es derri\xE8re la benne.", statChanges: { mental: 5 }, itemGain: { id: "bache", name: "B\xE2che imperm\xE9able", emoji: "\u{1F3D7}\uFE0F", type: "tool", value: 8 } },
        { probability: 0.3, text: "Un chien errant surgit ! Il grogne...", statChanges: { mental: -5 } },
        { probability: 0.2, text: "Vous marchez sur un clou rouill\xE9. A\xEFe !", statChanges: { health: -10, mental: -3 } }
      ] },
      { text: "R\xE9cup\xE9rer du m\xE9tal \xE0 revendre", risk: "risky", emoji: "\u{1F529}", outcomes: [
        { probability: 0.4, text: "Du cuivre ! Le ferrailleur vous en donne 8\u20AC.", moneyChange: 8, statChanges: { dignity: -5 } },
        { probability: 0.6, text: "Le gardien de nuit vous surprend et vous poursuit jusqu'au bout du parking en criant dans sa radio.", statChanges: { health: -5, dignity: -10, sleep: -5 } }
      ] }
    ]
  },
  {
    id: "exp-marche-puces",
    title: "Le March\xE9 aux Puces",
    type: "discovery",
    image: "/assets/exp-marche-puces-HsE9Jibo2Ryfm6oCMCsSB6.webp",
    description: "Le march\xE9 aux puces du dimanche. Des tr\xE9sors cach\xE9s parmi les d\xE9chets.",
    choices: [
      { text: "Fouiller les invendus en fin de march\xE9", risk: "safe", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.6, text: 'Un vendeur vous donne un manteau us\xE9 mais chaud. "Tiens, il me sert plus."', statChanges: { dignity: 5, health: 3 }, itemGain: { id: "manteau", name: "Manteau us\xE9", emoji: "\u{1F9E5}", type: "armor", value: 10, defenseBonus: 2 } },
        { probability: 0.4, text: "Rien d'int\xE9ressant aujourd'hui. Que des vieilles chaussettes d\xE9pareill\xE9es.", statChanges: { mental: -2 } }
      ] },
      { text: "Proposer vos services de porteur", risk: "normal", emoji: "\u{1F4AA}", outcomes: [
        { probability: 0.6, text: "Un antiquaire vous embauche pour 2h. 6\u20AC et un sandwich.", moneyChange: 6, statChanges: { hunger: 15, sleep: -5, dignity: 5 } },
        { probability: 0.4, text: `"On n'a pas besoin de toi." Quatre stands, quatre fois la m\xEAme phrase, sans lever les yeux.`, statChanges: { dignity: -5, mental: -5 } }
      ] }
    ]
  },
  {
    id: "exp-graffiti",
    title: "Le Mur de Graffitis",
    type: "narrative",
    image: "/assets/exp-graffiti-cRcu5Bo3BmUZPkaiCwvrUp.webp",
    description: "Un mur couvert de graffitis color\xE9s. Un tagueur est en pleine action.",
    choices: [
      { text: "Faire le guet pour lui", risk: "normal", emoji: "\u{1F441}\uFE0F", outcomes: [
        { probability: 0.6, text: `Mission accomplie ! Il vous file 4\u20AC et une bombe de peinture. "T'es r\xE9glo."`, moneyChange: 4, statChanges: { mental: 5 }, respectChange: 2 },
        { probability: 0.4, text: "La police arrive ! Vous courez ensemble jusqu'au canal, et il rit tellement qu'il doit s'arr\xEAter pour souffler.", statChanges: { sleep: -5, mental: 3, dignity: -5 } }
      ] },
      { text: "Demander \xE0 essayer", risk: "safe", emoji: "\u{1F3A8}", outcomes: [
        { probability: 0.7, text: `Vous dessinez un chat. C'est moche mais cathartique. "Pas mal pour un d\xE9butant !"`, statChanges: { mental: 10, dignity: 3 } },
        { probability: 0.3, text: "La bombe vous explose au visage. Vous \xEAtes bleu pendant 3 jours.", statChanges: { dignity: -8, health: -3 } }
      ] }
    ]
  },
  {
    id: "exp-bibliotheque",
    title: "La Biblioth\xE8que Municipale",
    type: "narrative",
    image: "/assets/exp-bibliotheque-2De3rMKZBHpbKjGy3dHVbf.webp",
    description: "La biblioth\xE8que est ouverte. Chaleur, silence, et des toilettes gratuites.",
    choices: [
      { text: "Lire tranquillement au chaud", risk: "safe", emoji: "\u{1F4D6}", outcomes: [
        { probability: 0.8, text: "Deux heures de lecture et de chaleur. Vous vous sentez presque normal.", statChanges: { mental: 15, sleep: 5, dignity: 3 } },
        { probability: 0.2, text: "Vous vous endormez et ronflez. Le biblioth\xE9caire vous r\xE9veille d'une main sur l'\xE9paule, tr\xE8s doucement, ce qui est pire.", statChanges: { sleep: 10, dignity: -5 } }
      ] },
      { text: "Utiliser les toilettes et se laver", risk: "safe", emoji: "\u{1F6BF}", outcomes: [
        { probability: 1, text: "Toilette rapide au lavabo. Vous vous sentez humain \xE0 nouveau.", statChanges: { dignity: 10, mental: 5, thirst: 5 } }
      ] },
      { text: "Chercher des livres \xE0 revendre", risk: "risky", emoji: "\u{1F4DA}", outcomes: [
        { probability: 0.3, text: "Vous trouvez un livre rare oubli\xE9. Le bouquiniste vous en donne 5\u20AC.", moneyChange: 5 },
        { probability: 0.7, text: "La biblioth\xE9caire vous surveille depuis son comptoir, sans jamais tourner la page qu'elle fait semblant de lire.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-concert",
    title: "Le Concert Improvis\xE9",
    type: "social",
    image: "/assets/exp-concert-ju77ceA9zWrNxQaKrRPUVF.webp",
    description: "Des musiciens de rue jouent du jazz. La foule s'amasse. L'ambiance est magique.",
    choices: [
      { text: "Danser comme si personne ne regardait", risk: "normal", emoji: "\u{1F483}", outcomes: [
        { probability: 0.6, text: "Votre danse attire les rires et les applaudissements ! On vous jette 3\u20AC.", moneyChange: 3, statChanges: { mental: 12, dignity: 5 }, respectChange: 2 },
        { probability: 0.4, text: "Vous tr\xE9buchez. Les gens rient, mais pas avec vous.", statChanges: { dignity: -8, mental: -3 } }
      ] },
      { text: "\xC9couter tranquillement", risk: "safe", emoji: "\u{1F3B5}", outcomes: [
        { probability: 1, text: "La musique vous transporte. Pendant 20 minutes, vous oubliez tout.", statChanges: { mental: 10 } }
      ] }
    ]
  },
  {
    id: "exp-metro",
    title: "La Station de M\xE9tro",
    type: "discovery",
    image: "/assets/exp-metro-oXzk6PRiafCRXLVLnLSSVq.webp",
    description: "Vous descendez dans la station de m\xE9tro. Il fait chaud, mais c'est le territoire d'autres SDF.",
    choices: [
      { text: "Explorer les couloirs", risk: "normal", emoji: "\u{1F687}", outcomes: [
        { probability: 0.4, text: "Vous trouvez un billet de 10\u20AC par terre, pli\xE9 en quatre, encore chaud d'\xEAtre rest\xE9 dans une poche.", moneyChange: 10, statChanges: { mental: 8 } },
        { probability: 0.3, text: `Un autre SDF vous interpelle. "C'est mon couloir !" Tension.`, statChanges: { mental: -5, dignity: -3 } },
        { probability: 0.3, text: "Un rat g\xE9ant vous barre le passage...", statChanges: { mental: -8 } }
      ] },
      { text: "Rester pr\xE8s des tourniquets et mendier", risk: "safe", emoji: "\u{1F3A9}", outcomes: [
        { probability: 0.6, text: "Les voyageurs press\xE9s l\xE2chent quelques pi\xE8ces. 2\u20AC en 30 minutes.", moneyChange: 2, statChanges: { dignity: -3 } },
        { probability: 0.4, text: "Un agent vous demande de partir : ici c'est une gare, pas un trottoir, et la nuance compte pour lui.", statChanges: { dignity: -5 } }
      ] }
    ]
  },
  {
    id: "exp-eglise",
    title: "L'\xC9glise du Quartier",
    type: "narrative",
    image: "/assets/exp-eglise-2mK4FcdNW7pYwWeFopWXmF.webp",
    description: "L'\xE9glise est ouverte. Un pr\xEAtre balaie l'entr\xE9e.",
    choices: [
      { text: "Entrer et s'asseoir au calme", risk: "safe", emoji: "\u26EA", outcomes: [
        { probability: 0.7, text: 'Le pr\xEAtre vous offre un caf\xE9 et un croissant. "La maison de Dieu est ouverte \xE0 tous."', statChanges: { hunger: 10, thirst: 10, mental: 10, dignity: 5 } },
        { probability: 0.3, text: "Moment de paix int\xE9rieure. Le silence fait du bien.", statChanges: { mental: 8, sleep: 5 } }
      ] },
      { text: "Demander de l'aide au pr\xEAtre", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.6, text: "Il vous donne l'adresse d'un foyer et un bon repas, puis retourne balayer sans rien demander.", statChanges: { hunger: 15, mental: 10, dignity: 8 }, addFlag: "aide-eglise" },
        { probability: 0.4, text: `"Je n'ai pas grand-chose, mais prenez \xE7a." 2\u20AC et une b\xE9n\xE9diction.`, moneyChange: 2, statChanges: { mental: 5 } }
      ] }
    ]
  },
  {
    id: "exp-bagarre-chats",
    title: "La Bagarre de Chats",
    type: "narrative",
    image: "/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp",
    description: "Deux chats se battent f\xE9rocement dans une ruelle. Les miaulements sont terrifiants.",
    choices: [
      { text: "Les s\xE9parer bravement", risk: "risky", emoji: "\u{1F431}", outcomes: [
        { probability: 0.3, text: "Vous les s\xE9parez ! Un des chats vous suit jusqu'au bout de la rue, puis encore jusqu'\xE0 la suivante.", statChanges: { mental: 10, health: -3 }, respectChange: 1, addFlag: "chat-compagnon" },
        { probability: 0.7, text: "Les deux chats se retournent contre vous, se r\xE9concilient sur votre dos, et repartent ensemble.", statChanges: { health: -8, dignity: -5 } }
      ] },
      { text: "Parier sur le vainqueur", risk: "safe", emoji: "\u{1F3B0}", outcomes: [
        { probability: 0.5, text: "Le chat tigr\xE9 gagne ! Vous n'avez rien pari\xE9 mais vous \xEAtes content.", statChanges: { mental: 3 } },
        { probability: 0.5, text: "Match nul. Les deux partent en boitant. Spectacle d\xE9cevant.", statChanges: { mental: -1 } }
      ] }
    ]
  },
  {
    id: "exp-fontaine-parc",
    title: "La Fontaine aux Pi\xE8ces",
    type: "discovery",
    image: "/assets/exp-fontaine-parc-BiqrfcY6htgsTAbKRTaDWN.webp",
    description: "La fontaine du parc brille de pi\xE8ces jet\xE9es par les touristes. Des voeux et de l'argent.",
    choices: [
      { text: "Plonger la main pour r\xE9cup\xE9rer des pi\xE8ces", risk: "risky", emoji: "\u{1F4B0}", outcomes: [
        { probability: 0.4, text: "Vous r\xE9cup\xE9rez 4\u20AC en petite monnaie, le bras tremp\xE9 jusqu'\xE0 l'\xE9paule.", moneyChange: 4, statChanges: { dignity: -10, thirst: 5 } },
        { probability: 0.3, text: `Un gardien vous attrape. "C'est interdit !" Amende morale.`, statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.3, text: "Vous glissez et tombez dans la fontaine. Tremp\xE9 mais riche de 2\u20AC.", moneyChange: 2, statChanges: { health: -5, dignity: -12, thirst: 10 } }
      ] },
      { text: "Faire un voeu avec votre derni\xE8re pi\xE8ce", risk: "safe", emoji: "\u2B50", outcomes: [
        { probability: 0.5, text: "Vous jetez 1 centime. Vous vous sentez \xE9trangement optimiste.", moneyChange: 0, statChanges: { mental: 8 } },
        { probability: 0.5, text: "La pi\xE8ce rebondit et touche un pigeon, qui vous regarde longuement avant de s'envoler.", statChanges: { mental: -2 } }
      ] },
      { text: "Se laver le visage dans l'eau", risk: "safe", emoji: "\u{1F4A7}", outcomes: [
        { probability: 1, text: "L'eau est fra\xEEche. Vous vous sentez revigor\xE9.", statChanges: { dignity: 5, thirst: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-velo-casse",
    title: "Le V\xE9lo Abandonn\xE9",
    type: "discovery",
    image: "/assets/exp-velo-casse-bdxwNqE2XebzwjmU9nEovY.webp",
    description: "Un v\xE9lo cass\xE9 est attach\xE9 \xE0 un poteau. La roue avant est voil\xE9e, mais le reste semble OK.",
    choices: [
      { text: "Tenter de le r\xE9parer", risk: "normal", emoji: "\u{1F527}", outcomes: [
        { probability: 0.4, text: "Avec du fil de fer et de la patience, les deux roues finissent par tourner dans le m\xEAme sens.", statChanges: { mental: 8, dignity: 3 }, addFlag: "a-velo", itemGain: { id: "velo-repare", name: "V\xE9lo rafistol\xE9", emoji: "\u{1F6B2}", type: "tool", value: 20 } },
        { probability: 0.6, text: "Impossible sans outils. Vous r\xE9cup\xE9rez la sonnette au moins.", statChanges: { mental: -2 }, itemGain: { id: "sonnette", name: "Sonnette de v\xE9lo", emoji: "\u{1F514}", type: "junk", value: 1 } }
      ] },
      { text: "R\xE9cup\xE9rer les pi\xE8ces d\xE9tach\xE9es", risk: "safe", emoji: "\u2699\uFE0F", outcomes: [
        { probability: 0.7, text: "Vous d\xE9montez la cha\xEEne et les p\xE9dales. Le ferrailleur en donnera 3\u20AC.", moneyChange: 3, statChanges: { dignity: -3 } },
        { probability: 0.3, text: `Le propri\xE9taire revient ! "H\xE9, c'est mon v\xE9lo !" Vous filez.`, statChanges: { dignity: -8, mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-pharmacie",
    title: "La Pharmacie de Garde",
    type: "social",
    image: "/assets/exp-pharmacie-SW5iVopihwHZPnwrHk4DRV.webp",
    description: "La pharmacie est ouverte. La pharmacienne vous regarde avec un m\xE9lange de piti\xE9 et de m\xE9fiance.",
    choices: [
      { text: "Demander poliment des pansements", risk: "safe", emoji: "\u{1FA79}", outcomes: [
        { probability: 0.7, text: `Elle vous donne un kit de premiers soins p\xE9rim\xE9. "C'est encore bon, hein."`, statChanges: { health: 10, dignity: 3 }, itemGain: { id: "kit-soin", name: "Kit premiers soins", emoji: "\u{1F3E5}", type: "tool", value: 8, effect: { health: 20 } } },
        { probability: 0.3, text: '"D\xE9sol\xE9e, je ne peux pas." Elle baisse les yeux. Vous aussi.', statChanges: { mental: -5 } }
      ] },
      { text: "Proposer de balayer devant la boutique", risk: "safe", emoji: "\u{1F9F9}", outcomes: [
        { probability: 0.8, text: "Elle accepte ! 3\u20AC et un tube de cr\xE8me solaire entam\xE9, p\xE9rim\xE9 depuis deux \xE9t\xE9s.", moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.2, text: `"Non merci, j'ai un employ\xE9." Refus poli.`, statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "exp-terrain-vague",
    title: "Le Terrain Vague",
    type: "discovery",
    image: "/assets/exp-terrain-vague-cuw8m9fnHsQZS3zjSQE96n.webp",
    description: "Un terrain vague entre deux immeubles. Des herbes folles, des d\xE9chets, et... des bruits.",
    choices: [
      { text: "Explorer les d\xE9combres", risk: "risky", emoji: "\u{1F3DA}\uFE0F", outcomes: [
        { probability: 0.3, text: "Vous trouvez une vieille radio qui marche encore, sur une seule station, qui parle d'agriculture toute la nuit.", statChanges: { mental: 8 }, itemGain: { id: "radio", name: "Radio portable", emoji: "\u{1F4FB}", type: "tool", value: 5 } },
        { probability: 0.4, text: "Un raton laveur surgit des buissons ! Il est pas content.", statChanges: { mental: -5, health: -3 } },
        { probability: 0.3, text: "Vous marchez sur du verre bris\xE9. Vos chaussures ne prot\xE8gent plus grand-chose.", statChanges: { health: -8 } }
      ] },
      { text: "Chercher des mat\xE9riaux utiles", risk: "normal", emoji: "\u{1F529}", outcomes: [
        { probability: 0.5, text: "Du carton sec, une couverture oubli\xE9e. De quoi am\xE9liorer votre abri.", statChanges: { mental: 5 }, itemGain: { id: "couverture", name: "Couverture trouv\xE9e", emoji: "\u{1F6CF}\uFE0F", type: "armor", value: 6, defenseBonus: 1 } },
        { probability: 0.5, text: "Rien d'utile. Juste des canettes vides et de la tristesse.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-animalerie",
    title: "L'Animalerie du Coin",
    type: "social",
    image: "/assets/exp-animalerie-f88YtDyyP69PRN9fqoBdd2.webp",
    description: "L'animalerie a mis des chiots en vitrine. Vous vous arr\xEAtez, hypnotis\xE9.",
    choices: [
      { text: "Regarder les chiots et sourire", risk: "safe", emoji: "\u{1F436}", outcomes: [
        { probability: 0.8, text: "Un chiot vous l\xE8che la vitre de l'int\xE9rieur, et deux passants s'arr\xEAtent pour regarder \xE7a avec vous.", statChanges: { mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'Le vendeur sort et vous chasse. "Tu fais fuir les clients !"', statChanges: { dignity: -8, mental: -5 } }
      ] },
      { text: "Proposer de promener les chiens", risk: "normal", emoji: "\u{1F9AE}", outcomes: [
        { probability: 0.5, text: "Le g\xE9rant accepte ! Deux heures avec un labrador qui tire, 5\u20AC, et le bras droit plus long que le gauche.", moneyChange: 5, statChanges: { mental: 15, dignity: 5, sleep: -3 } },
        { probability: 0.5, text: `"On n'a pas besoin d'aide." Refus. Les chiots vous regardent tristement.`, statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-cimetiere",
    title: "Le Cimeti\xE8re Paisible",
    type: "narrative",
    image: "/assets/exp-cimetiere-VKuW5e5DjqSmF5TNCdnKkA.webp",
    description: "Le cimeti\xE8re est calme. Des fleurs fra\xEEches sur certaines tombes. Un robinet coule.",
    choices: [
      { text: "Se recueillir et r\xE9fl\xE9chir", risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 1, text: "Moment de m\xE9ditation. La perspective de la mort remet les choses en place.", statChanges: { mental: 8, dignity: 5 } }
      ] },
      { text: "Boire au robinet et se laver", risk: "safe", emoji: "\u{1F6B0}", outcomes: [
        { probability: 1, text: "Eau potable gratuite. Vous buvez longtemps, puis vous vous d\xE9barbouillez avec les mains en coupe.", statChanges: { thirst: 20, dignity: 8 } }
      ] },
      { text: "R\xE9cup\xE9rer les fleurs fan\xE9es pour les revendre", risk: "risky", emoji: "\u{1F490}", outcomes: [
        { probability: 0.3, text: "Vous recomposez des bouquets. Un fleuriste vous en donne 4\u20AC.", moneyChange: 4, statChanges: { dignity: -8 } },
        { probability: 0.7, text: `Une vieille dame vous surprend. "Vous n'avez pas honte ?!" Regard glacial.`, statChanges: { dignity: -15, mental: -8 } }
      ] }
    ]
  },
  {
    id: "exp-aire-jeux",
    title: "L'Aire de Jeux D\xE9serte",
    type: "narrative",
    image: "/assets/exp-aire-jeux-Q8McpHycnXNkdRnaXA3fDZ.webp",
    description: "L'aire de jeux est vide. Les balan\xE7oires grincent dans le vent, toutes les trois \xE0 des rythmes diff\xE9rents.",
    choices: [
      { text: "Faire de la balan\xE7oire", risk: "safe", emoji: "\u{1F3A0}", outcomes: [
        { probability: 0.8, text: "Le vent dans les cheveux, les pieds en l'air. Vous redevenez enfant 5 minutes.", statChanges: { mental: 12, dignity: -2 } },
        { probability: 0.2, text: "La cha\xEEne casse. Vous atterrissez dans le sable. A\xEFe.", statChanges: { health: -5, mental: -3 } }
      ] },
      { text: "Dormir dans le toboggan", risk: "normal", emoji: "\u{1F634}", outcomes: [
        { probability: 0.6, text: "Le toboggan est \xE9tonnamment confortable. Vous dormez vingt minutes et vous r\xE9veillez \xE0 mi-pente.", statChanges: { sleep: 12 } },
        { probability: 0.4, text: "Des enfants arrivent avec leurs parents. Regard accusateur. Vous partez.", statChanges: { dignity: -10, mental: -5 } }
      ] }
    ]
  },
  {
    id: "exp-brocante",
    title: "La Brocante du Quartier",
    type: "discovery",
    image: "/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp",
    description: "Une brocante de quartier. Des objets h\xE9t\xE9roclites s'entassent sur les tables.",
    choices: [
      { text: "N\xE9gocier un objet utile", risk: "normal", emoji: "\u{1F91D}", outcomes: [
        { probability: 0.5, text: "Vous troquez votre charme contre un thermos. Le vendeur est amus\xE9.", statChanges: { dignity: 3 }, itemGain: { id: "thermos", name: "Thermos caboss\xE9", emoji: "\u2615", type: "tool", value: 5 } },
        { probability: 0.5, text: `"T'as pas d'argent, t'as pas d'objet." Logique implacable.`, statChanges: { mental: -3 } }
      ] },
      { text: "Aider \xE0 ranger en fin de journ\xE9e", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Le brocanteur vous paie 4\u20AC et vous laisse garder un vieux chapeau.", moneyChange: 4, statChanges: { dignity: 5, mental: 5 }, itemGain: { id: "chapeau", name: "Chapeau de brocante", emoji: "\u{1F3A9}", type: "junk", value: 3 }, addFlag: "ami-brocanteur" },
        { probability: 0.3, text: `Il vous remercie mais n'a rien \xE0 donner. "La prochaine fois !"`, statChanges: { mental: 3, dignity: 3 } }
      ] }
    ]
  },
  {
    id: "exp-toit-vue",
    title: "Le Toit avec Vue",
    type: "discovery",
    image: "/assets/exp-toit-vue-TJnJZcBsariLEwBL2R7huu.webp",
    description: "Vous trouvez l'acc\xE8s \xE0 un toit d'immeuble. La vue sur la ville est \xE9poustouflante.",
    choices: [
      { text: "Contempler la vue et m\xE9diter", risk: "safe", emoji: "\u{1F305}", outcomes: [
        { probability: 1, text: "La ville s'\xE9tend sous vos pieds. Vous \xEAtes le roi du monde. Du carton, certes, mais du monde.", statChanges: { mental: 15, dignity: 5 } }
      ] },
      { text: "Installer un campement sur le toit", risk: "normal", emoji: "\u26FA", outcomes: [
        { probability: 0.5, text: "Spot parfait : \xE0 l'abri du vent, avec vue sur les toits et une bouche d'a\xE9ration qui souffle ti\xE8de.", statChanges: { sleep: 15, mental: 10 }, addFlag: "camp-toit" },
        { probability: 0.5, text: 'Le concierge vous rep\xE8re. "Descendez imm\xE9diatement !" Fin du r\xEAve.', statChanges: { dignity: -8, mental: -5 } }
      ] }
    ]
  },
  {
    id: "exp-salon-coiffure",
    title: "Le Salon de Coiffure",
    type: "social",
    image: "/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp",
    description: `Un salon de coiffure cherche un mod\xE8le pour ses apprentis. L'affichette pr\xE9cise "coupe offerte", en plus petit que le reste.`,
    choices: [
      { text: "Se porter volontaire", risk: "normal", emoji: "\u{1F487}", outcomes: [
        { probability: 0.6, text: "Coupe gratuite ! Vous \xEAtes m\xE9connaissable. En bien. Les passants vous regardent diff\xE9remment.", statChanges: { dignity: 20, mental: 10 } },
        { probability: 0.4, text: "L'apprenti est nerveux. R\xE9sultat... cr\xE9atif. Mais c'est propre au moins.", statChanges: { dignity: 5, mental: 3 } }
      ] },
      { text: "Demander juste \xE0 utiliser les toilettes", risk: "safe", emoji: "\u{1F6BB}", outcomes: [
        { probability: 0.7, text: "Ils acceptent. Eau chaude, savon liquide, et une serviette qui sent la lessive de quelqu'un d'autre.", statChanges: { dignity: 8, thirst: 5 } },
        { probability: 0.3, text: '"R\xE9serv\xE9 aux clients." Porte ferm\xE9e.', statChanges: { dignity: -3 } }
      ] }
    ]
  },
  {
    id: "exp-fete-foraine",
    title: "La F\xEAte Foraine",
    type: "narrative",
    image: "/assets/exp-fete-foraine-oFFfjEfH7yPSChUUtdKfFj.webp",
    description: "La f\xEAte foraine est install\xE9e ! Lumi\xE8res, odeurs de barbe \xE0 papa, musique criarde.",
    choices: [
      { text: "Chercher des pi\xE8ces tomb\xE9es par terre", risk: "safe", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.6, text: "Bingo ! 3\u20AC en monnaie trouv\xE9s sous les man\xE8ges.", moneyChange: 3, statChanges: { mental: 5 } },
        { probability: 0.4, text: "Juste des tickets usag\xE9s et un chewing-gum coll\xE9.", statChanges: { mental: -2 } }
      ] },
      { text: "Proposer vos services aux forains", risk: "normal", emoji: "\u{1F3AA}", outcomes: [
        { probability: 0.5, text: "Un forain vous embauche pour la soir\xE9e ! 8\u20AC, une barbe \xE0 papa, et des souvenirs.", moneyChange: 8, statChanges: { hunger: 10, mental: 10, sleep: -8, dignity: 5 } },
        { probability: 0.5, text: `"On est complet." Mais il vous offre une pomme d'amour par piti\xE9.`, statChanges: { hunger: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-pecheur-canal",
    title: "Le P\xEAcheur du Canal",
    type: "social",
    image: "/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp",
    description: "Un vieux p\xEAcheur est assis au bord du canal. Il a l'air de s'ennuyer ferme.",
    choices: [
      { text: "Lui tenir compagnie", risk: "safe", emoji: "\u{1F3A3}", outcomes: [
        { probability: 0.7, text: "Il vous raconte sa vie, vous lui racontez la v\xF4tre, et il coupe son sandwich en deux parts in\xE9gales en vous donnant la grosse.", statChanges: { hunger: 12, thirst: 10, mental: 10 }, respectChange: 2, addFlag: "ami-pecheur" },
        { probability: 0.3, text: '"Chut ! Tu fais fuir les poissons !" Silence radio.', statChanges: { mental: -2 } }
      ] },
      { text: "Demander s'il a attrap\xE9 quelque chose", risk: "safe", emoji: "\u{1F41F}", outcomes: [
        { probability: 0.5, text: '"Rien du tout ! Mais tiens, prends \xE7a." Il vous donne un poisson s\xE9ch\xE9.', statChanges: { hunger: 10 }, itemGain: { id: "poisson", name: "Poisson s\xE9ch\xE9", emoji: "\u{1F41F}", type: "food", value: 3, effect: { hunger: 15 } } },
        { probability: 0.5, text: `"Rien. Comme d'habitude." Vous partagez un moment de d\xE9ception commune.`, statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "exp-cave-vin",
    title: "La Cave \xE0 Vin Oubli\xE9e",
    type: "discovery",
    image: "/assets/exp-cave-vin-k2iibzQsEoFfpyRmaG7X9t.webp",
    description: "Une porte de cave entrouverte dans une ruelle. Des bouteilles poussi\xE9reuses \xE0 l'int\xE9rieur.",
    choices: [
      { text: "Explorer la cave", risk: "risky", emoji: "\u{1F377}", outcomes: [
        { probability: 0.3, text: "Jackpot ! Une bouteille de vin oubli\xE9e. Le sommelier en vous pleure de joie.", statChanges: { thirst: 15, mental: 10 }, itemGain: { id: "vin", name: "Bouteille de vin", emoji: "\u{1F377}", type: "food", value: 15, effect: { mental: 10, thirst: 15 } } },
        { probability: 0.4, text: "La cave est vide. Juste des toiles d'araign\xE9e et de la d\xE9ception.", statChanges: { mental: -3 } },
        { probability: 0.3, text: 'Le propri\xE9taire vous surprend ! "Voleur !" Vous filez.', statChanges: { dignity: -10, mental: -5 } }
      ] },
      { text: "Refermer la porte et partir", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 1, text: "La sagesse l'emporte. Vous repartez la conscience tranquille.", statChanges: { mental: 3, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "exp-magasin-ferme",
    title: "Le Magasin Ferm\xE9",
    type: "discovery",
    image: "/assets/exp-magasin-ferme-6eecqa7F4eaw5q482jWUCU.webp",
    description: "Un magasin a ferm\xE9 d\xE9finitivement. La vitrine est encore pleine de marchandises.",
    choices: [
      { text: "Regarder \xE0 travers la vitrine", risk: "safe", emoji: "\u{1F440}", outcomes: [
        { probability: 0.6, text: "Vous rep\xE9rez une porte arri\xE8re entrouverte, cal\xE9e par une brique que personne n'a pens\xE9 \xE0 retirer.", statChanges: { mental: 3 }, addFlag: "magasin-repere" },
        { probability: 0.4, text: "Juste des mannequins poussi\xE9reux, tous tourn\xE9s vers la porte, comme s'ils attendaient depuis longtemps.", statChanges: { mental: -3 } }
      ] },
      { text: "Dormir sous l'auvent", risk: "safe", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.7, text: "L'auvent prot\xE8ge de la pluie, et le mur derri\xE8re garde encore la chaleur de la journ\xE9e.", statChanges: { sleep: 10 } },
        { probability: 0.3, text: "Le vent s'engouffre par le coin ouvert et repart avec la moiti\xE9 de votre couverture.", statChanges: { sleep: 5, health: -3 } }
      ] }
    ]
  },
  {
    id: "exp-hopital",
    title: "Les Urgences de l'H\xF4pital",
    type: "social",
    image: "/assets/exp-hopital-h7QXk7kd9iu8CG5kPG7P6Y.webp",
    description: "L'h\xF4pital est bond\xE9. La salle d'attente des urgences est chaude et il y a un distributeur d'eau.",
    choices: [
      { text: "S'installer discr\xE8tement en salle d'attente", risk: "normal", emoji: "\u{1F3E5}", outcomes: [
        { probability: 0.6, text: "Personne ne vous remarque. Deux heures au chaud, de l'eau au robinet, des toilettes o\xF9 la porte ferme.", statChanges: { thirst: 15, sleep: 8, dignity: 3 } },
        { probability: 0.4, text: 'Un vigile vous rep\xE8re. "Vous avez un probl\xE8me m\xE9dical ?" Vous improvisez.', statChanges: { mental: -5 } }
      ] },
      { text: "Demander \xE0 voir un m\xE9decin (gratuit)", risk: "safe", emoji: "\u{1F468}\u200D\u2695\uFE0F", outcomes: [
        { probability: 0.5, text: "Apr\xE8s 3h d'attente, un m\xE9decin vous examine, vous donne des pansements et des vitamines, et ne demande pas d'adresse.", statChanges: { health: 15, mental: 5, sleep: -5 } },
        { probability: 0.5, text: `"Les urgences sont pour les urgences." On vous renvoie. Au moins vous avez bu de l'eau.`, statChanges: { thirst: 10, mental: -3 } }
      ] }
    ]
  },
  {
    id: "exp-dechetterie",
    title: "La D\xE9chetterie Municipale",
    type: "discovery",
    image: "/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp",
    description: "La d\xE9chetterie est ouverte. Les gens jettent des choses incroyables.",
    choices: [
      { text: "Fouiller les bennes", risk: "normal", emoji: "\u{1F5D1}\uFE0F", outcomes: [
        { probability: 0.5, text: "Un micro-ondes qui marche, un sac de couchage, des livres ! Les gens sont fous de jeter \xE7a.", statChanges: { mental: 8 }, itemGain: { id: "sac-couchage", name: "Sac de couchage", emoji: "\u{1F6CF}\uFE0F", type: "armor", value: 15, defenseBonus: 3 }, addFlag: "roi-dechetterie" },
        { probability: 0.3, text: "Rien de bon aujourd'hui. Que des gravats et du pl\xE2tre.", statChanges: { mental: -2 } },
        { probability: 0.2, text: "Vous vous coupez sur un morceau de verre. A\xEFe.", statChanges: { health: -8 } }
      ] },
      { text: "Discuter avec le gardien", risk: "safe", emoji: "\u{1F4AC}", outcomes: [
        { probability: 0.6, text: `Le gardien est sympa. "Reviens mardi, y'a toujours du bon matos." Info pr\xE9cieuse.`, statChanges: { mental: 5 }, respectChange: 1, addFlag: "ami-gardien-dechetterie" },
        { probability: 0.4, text: `"C'est interdit de fouiller !" Il vous chasse.`, statChanges: { dignity: -5 } }
      ] }
    ]
  },
  {
    id: "exp-camion-pizza",
    title: "Le Camion Pizza",
    type: "narrative",
    image: "/assets/exp-camion-pizza-gRv6sJgQcz26Svyj68t2oD.webp",
    description: "Un camion pizza est gar\xE9. L'odeur est divine. Le pizzaiolo ferme pour la nuit.",
    choices: [
      { text: "Demander les invendus", risk: "safe", emoji: "\u{1F355}", outcomes: [
        { probability: 0.6, text: '"Tiens, prends \xE7a." Deux parts de margherita, encore assez chaudes pour que le fromage file.', statChanges: { hunger: 25, mental: 10, thirst: 5 } },
        { probability: 0.4, text: `"D\xE9sol\xE9, j'ai tout vendu." Votre estomac gronde de d\xE9ception.`, statChanges: { mental: -3, hunger: -5 } }
      ] },
      { text: "Fouiller les poubelles du camion", risk: "normal", emoji: "\u{1F5D1}\uFE0F", outcomes: [
        { probability: 0.5, text: "Des cro\xFBtes de pizza et un fond de sauce. C'est pas du gastronomique mais \xE7a nourrit.", statChanges: { hunger: 12, dignity: -5 } },
        { probability: 0.3, text: 'Le pizzaiolo vous voit. "H\xE9 ! D\xE9gage de mes poubelles !"', statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.2, text: "Un chat sauvage d\xE9fend les poubelles ! Il griffe !", statChanges: { health: -5, hunger: -3 } }
      ] }
    ]
  }
];
var BEG_EVENTS = [
  {
    id: "beg-couple-riche",
    title: "Le Couple de Riches",
    type: "social",
    image: "/assets/beg-couple-riche-fGABmQHzGdaNfYfNeimiRm.webp",
    description: "Un couple en manteau de fourrure passe devant vous. Ils sentent le parfum cher.",
    choices: [
      { text: "Tendre la main poliment", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.5, text: 'La femme vous donne 5\u20AC. "Prenez soin de vous." Sinc\xE8re.', statChanges: { dignity: 3, mental: 5 }, moneyChange: 5 },
        { probability: 0.3, text: "Ils passent sans vous regarder. Vous \xEAtes invisible.", statChanges: { dignity: -5, mental: -5 } },
        { probability: 0.2, text: `L'homme vous donne 10\u20AC ! "J'ai connu des temps durs aussi."`, statChanges: { dignity: 5, mental: 10 }, moneyChange: 10 }
      ] },
      { text: "Raconter une histoire triste", risk: "normal", emoji: "\u{1F622}", outcomes: [
        { probability: 0.4, text: "Votre histoire les \xE9meut. 8\u20AC et un num\xE9ro d'association.", statChanges: { mental: 5, dignity: -3 }, moneyChange: 8 },
        { probability: 0.6, text: '"On conna\xEEt le truc." Ils acc\xE9l\xE8rent le pas.', statChanges: { dignity: -8, mental: -5 } }
      ] },
      { text: "Engager la conversation d'\xE9gal \xE0 \xE9gal", risk: "normal", emoji: "\u{1F3A9}", requirements: { stat: "dignity", minValue: 50 }, outcomes: [
        { probability: 0.7, text: "Votre prestance les surprend. On parle art, vin, vie. L'homme vous glisse 12\u20AC \xAB pour le plaisir de la conversation \xBB.", moneyChange: 12, statChanges: { mental: 10, dignity: 5 }, respectChange: 2 },
        { probability: 0.3, text: "La conversation est agr\xE9able mais br\xE8ve. Elle vous laisse 4\u20AC et un sourire sinc\xE8re.", moneyChange: 4, statChanges: { mental: 6 } }
      ] }
    ]
  },
  {
    id: "beg-boulangerie",
    title: "La Boulangerie",
    type: "social",
    image: "/assets/beg-boulangerie-UTiJnojsDppWgqBkgPD7iy.webp",
    description: "La boulangerie ferme dans 10 minutes. L'odeur du pain chaud vous torture.",
    choices: [
      { text: "Demander le pain invendu", risk: "safe", emoji: "\u{1F956}", outcomes: [
        { probability: 0.7, text: 'La boulang\xE8re vous donne deux baguettes et un pain au chocolat ! "\xC7a partira \xE0 la poubelle sinon."', statChanges: { hunger: 25, mental: 8, dignity: 3 } },
        { probability: 0.3, text: `"D\xE9sol\xE9e, on a tout vendu aujourd'hui." Votre estomac pleure.`, statChanges: { mental: -3, hunger: -3 } }
      ] },
      { text: "Proposer de balayer en \xE9change", risk: "safe", emoji: "\u{1F9F9}", outcomes: [
        { probability: 0.8, text: "March\xE9 conclu ! Vous balayez 15 minutes et repartez avec un sac de viennoiseries.", statChanges: { hunger: 20, dignity: 8, mental: 5 } },
        { probability: 0.2, text: `"Mon mari s'en occupe." Refus poli mais elle vous donne un croissant quand m\xEAme.`, statChanges: { hunger: 8, mental: 3 } }
      ] }
    ]
  },
  {
    id: "beg-terrasse-cafe",
    title: "La Terrasse de Caf\xE9",
    type: "social",
    image: "/assets/beg-terrasse-cafe-4C6DR278ZzSCErovRVBHdM.webp",
    description: "Un caf\xE9 avec terrasse. Des gens sirotent leur expresso \xE0 4\u20AC. Vous avez soif.",
    choices: [
      { text: "S'asseoir et attendre les restes", risk: "safe", emoji: "\u2615", outcomes: [
        { probability: 0.5, text: "Un client laisse un demi-caf\xE9 et un croissant entam\xE9. Petit d\xE9jeuner !", statChanges: { hunger: 8, thirst: 10, dignity: -5 } },
        { probability: 0.5, text: `Le serveur vous chasse. "C'est r\xE9serv\xE9 aux clients."`, statChanges: { dignity: -8, mental: -5 } }
      ] },
      { text: "Demander un verre d'eau", risk: "safe", emoji: "\u{1F4A7}", outcomes: [
        { probability: 0.8, text: "Le serveur vous apporte un verre d'eau, sur un sous-verre, comme aux autres.", statChanges: { thirst: 15, dignity: 3, mental: 5 } },
        { probability: 0.2, text: `"L'eau c'est pour les clients." Froid.`, statChanges: { mental: -5, dignity: -3 } }
      ] },
      { text: "S'installer et discuter comme un habitu\xE9", risk: "normal", emoji: "\u{1F5DE}\uFE0F", requirements: { stat: "dignity", minValue: 45 }, outcomes: [
        { probability: 0.6, text: "Un retrait\xE9 vous offre le caf\xE9 et une heure de conversation. En partant, il glisse 3\u20AC \xAB pour le prochain \xBB.", moneyChange: 3, statChanges: { thirst: 12, mental: 12, dignity: 3 } },
        { probability: 0.4, text: "Le serveur vous a \xE0 l'\u0153il mais ne dit rien. Vous repartez r\xE9chauff\xE9 et presque respect\xE9.", statChanges: { mental: 6, thirst: 5 } }
      ] }
    ]
  },
  {
    id: "beg-ecole-sortie",
    title: "La Sortie d'\xC9cole",
    type: "social",
    image: "/assets/beg-ecole-sortie-MRgU7z3Vkq86je5Q4bCAvb.webp",
    description: "C'est l'heure de la sortie. Parents et enfants affluent.",
    choices: [
      { text: "Mendier discr\xE8tement", risk: "safe", emoji: "\u{1F392}", outcomes: [
        { probability: 0.5, text: 'Une maman vous donne 2\u20AC et un go\xFBter. "Tenez, pour vous."', statChanges: { hunger: 8, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: "Les parents vous \xE9vitent. Certains changent de trottoir.", statChanges: { dignity: -8, mental: -5 } },
        { probability: 0.2, text: "Un enfant vous donne son go\xFBter en cachette de sa m\xE8re, puis remonte dans la voiture sans se retourner.", statChanges: { hunger: 10, mental: 10 } }
      ] },
      { text: "Proposer d'aider \xE0 traverser", risk: "normal", emoji: "\u{1F6B8}", outcomes: [
        { probability: 0.4, text: "Vous aidez les enfants \xE0 traverser pendant 30 min. Les parents appr\xE9cient. 5\u20AC collect\xE9s.", statChanges: { dignity: 10, mental: 8 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.6, text: "Les parents sont m\xE9fiants. Un p\xE8re vous demande de partir.", statChanges: { dignity: -10, mental: -8 } }
      ] }
    ]
  },
  {
    id: "beg-supermarche",
    title: "Le Supermarch\xE9",
    type: "social",
    image: "/assets/beg-supermarche-4TENQwAV5hiGXPKER2Gy6s.webp",
    description: "Devant le supermarch\xE9, les clients entrent et sortent avec leurs courses.",
    choices: [
      { text: "S'installer \xE0 l'entr\xE9e avec un gobelet", risk: "safe", emoji: "\u{1F964}", outcomes: [
        { probability: 0.4, text: "En 1h, vous r\xE9coltez 6\u20AC, dont une pi\xE8ce \xE9trang\xE8re que personne ne prendra.", statChanges: { dignity: -5, mental: 3 }, moneyChange: 6 },
        { probability: 0.3, text: 'Le vigile vous demande de partir. "Pas de mendicit\xE9 ici."', statChanges: { dignity: -8 } },
        { probability: 0.3, text: "Une dame vous ach\xE8te un sandwich et une bouteille d'eau, puis s'excuse de ne pas avoir de monnaie.", statChanges: { hunger: 15, thirst: 15, mental: 5 } }
      ] },
      { text: "Aider les clients \xE0 porter leurs courses", risk: "normal", emoji: "\u{1F6D2}", outcomes: [
        { probability: 0.5, text: "Plusieurs clients acceptent ! 4\u20AC en pourboires et un pack de yaourts.", statChanges: { hunger: 10, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.5, text: "Personne ne veut de votre aide. Deux personnes changent de trottoir avant m\xEAme que vous ayez parl\xE9.", statChanges: { dignity: -5, mental: -5 } }
      ] }
    ]
  },
  {
    id: "beg-musicien-metro",
    title: "Le Musicien du M\xE9tro",
    type: "social",
    image: "/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp",
    description: "Un musicien joue de l'accord\xE9on dans le m\xE9tro. Il gagne bien sa vie.",
    choices: [
      { text: "Lui demander des conseils", risk: "safe", emoji: "\u{1F3B5}", outcomes: [
        { probability: 0.6, text: `"Le secret c'est le r\xE9pertoire ! Tiens, chante avec moi." Duo improvis\xE9, 3\u20AC partag\xE9s.`, statChanges: { mental: 10, dignity: 5 }, moneyChange: 3, respectChange: 1, addFlag: "ami-musicien" },
        { probability: 0.4, text: '"D\xE9gage de mon spot." Territorial, le musicien.', statChanges: { mental: -5, dignity: -3 } }
      ] },
      { text: "Chanter \xE0 c\xF4t\xE9 de lui", risk: "risky", emoji: "\u{1F3A4}", outcomes: [
        { probability: 0.3, text: "Votre voix est... unique. Les gens donnent vite et repartent plus vite : 4\u20AC.", statChanges: { dignity: -5, mental: 5 }, moneyChange: 4 },
        { probability: 0.7, text: `"Tu me fais perdre des clients !" Il vous chasse \xE0 coups d'accord\xE9on.`, statChanges: { dignity: -10, mental: -5, health: -3 } }
      ] }
    ]
  },
  {
    id: "beg-touriste-asiatique",
    title: "Le Groupe de Touristes",
    type: "social",
    image: "/assets/beg-touriste-asiatique-mKRWQ8vLKuJpHegK2ZAxpm.webp",
    description: "Un groupe de touristes photographie la rue, les poubelles, un pigeon, et le panneau du sens interdit.",
    choices: [
      { text: "Proposer de prendre leur photo", risk: "safe", emoji: "\u{1F4F8}", outcomes: [
        { probability: 0.7, text: "Ils sont ravis ! Selfies, photos de groupe. 5\u20AC de pourboire et des bonbons japonais.", statChanges: { hunger: 5, mental: 8, dignity: 5 }, moneyChange: 5 },
        { probability: 0.3, text: 'Ils vous prennent en photo VOUS. "Very authentic!" G\xEAnant mais 2\u20AC.', statChanges: { dignity: -5, mental: 3 }, moneyChange: 2 }
      ] },
      { text: 'Leur vendre un "guide local"', risk: "normal", emoji: "\u{1F5FA}\uFE0F", outcomes: [
        { probability: 0.5, text: "Vous improvisez un tour du quartier. 10\u20AC et des fous rires.", statChanges: { mental: 10, dignity: 5, sleep: -5 }, moneyChange: 10, respectChange: 3 },
        { probability: 0.5, text: "Ils ont d\xE9j\xE0 un guide. Votre offre est d\xE9clin\xE9e poliment.", statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "beg-mariage-sortie",
    title: "La Sortie de Mariage",
    type: "social",
    image: "/assets/beg-mariage-sortie-63dqzL4mxrcYYsqMVAza6U.webp",
    description: "Un mariage se termine. Les invit\xE9s sortent, \xE9m\xE9ch\xE9s et g\xE9n\xE9reux.",
    choices: [
      { text: "F\xE9liciter les mari\xE9s", risk: "safe", emoji: "\u{1F492}", outcomes: [
        { probability: 0.7, text: "Les mari\xE9s vous invitent \xE0 prendre une part de g\xE2teau, et le serveur vous tend une coupe sans qu'on lui demande.", statChanges: { hunger: 20, thirst: 15, mental: 12, dignity: 5 } },
        { probability: 0.3, text: `Le p\xE8re de la mari\xE9e vous \xE9loigne. "C'est priv\xE9."`, statChanges: { dignity: -5, mental: -3 } }
      ] },
      { text: "Ramasser le riz et les confettis (pour manger le riz)", risk: "risky", emoji: "\u{1F35A}", outcomes: [
        { probability: 0.4, text: "Vous r\xE9cup\xE9rez assez de riz pour un repas, dans un sac qui a d\xE9j\xE0 servi \xE0 autre chose.", statChanges: { hunger: 10, dignity: -8 } },
        { probability: 0.6, text: "C'est du riz d\xE9coratif, pas comestible. Votre estomac proteste.", statChanges: { hunger: -3, mental: -5 } }
      ] }
    ]
  },
  {
    id: "beg-jogger-parc",
    title: "Le Jogger du Parc",
    type: "social",
    image: "/assets/beg-jogger-parc-ek7sxZH6KdbP9SnStbrn8P.webp",
    description: "Un jogger fait sa pause stretching pr\xE8s de vous. Il a l'air sympathique.",
    choices: [
      { text: "Engager la conversation", risk: "safe", emoji: "\u{1F3C3}", outcomes: [
        { probability: 0.6, text: 'Il est coach sportif. "Tu veux que je te montre des exercices ?" S\xE9ance gratuite et 3\u20AC.', statChanges: { health: 5, mental: 8, dignity: 5 }, moneyChange: 3 },
        { probability: 0.4, text: "Il remet ses \xE9couteurs et repart, en montant le volume \xE0 hauteur de vous.", statChanges: { mental: -3 } }
      ] },
      { text: "Lui demander de l'eau", risk: "safe", emoji: "\u{1F4A7}", outcomes: [
        { probability: 0.8, text: 'Il vous passe sa gourde. "Tiens, garde-la." Gourde acquise !', statChanges: { thirst: 15, mental: 5 } },
        { probability: 0.2, text: `"D\xE9sol\xE9, j'ai plus d'eau." Il est sinc\xE8re.`, statChanges: { mental: -1 } }
      ] }
    ]
  },
  {
    id: "beg-restaurant-poubelle",
    title: "Les Poubelles du Restaurant",
    type: "discovery",
    image: "/assets/beg-restaurant-poubelle-HSuTGsFVRJkb2zg2xouMyC.webp",
    description: "Le restaurant gastronomique vient de sortir ses poubelles. \xC7a sent le gourmet.",
    choices: [
      { text: "Fouiller les poubelles", risk: "normal", emoji: "\u{1F5D1}\uFE0F", outcomes: [
        { probability: 0.6, text: "Des restes de foie gras, du pain frais, un fond de sauce dans une barquette encore ti\xE8de.", statChanges: { hunger: 25, mental: 5, dignity: -8 } },
        { probability: 0.4, text: 'Le chef sort fumer. "H\xE9 ! D\xE9gage de mes poubelles !" Vous filez.', statChanges: { dignity: -10, mental: -5 } }
      ] },
      { text: "Attendre que le chef rentre et fouiller apr\xE8s", risk: "safe", emoji: "\u23F0", outcomes: [
        { probability: 0.7, text: "Patience r\xE9compens\xE9e : vous mangez accroupi entre deux poubelles, mieux que toute la semaine.", statChanges: { hunger: 20, dignity: -5 } },
        { probability: 0.3, text: "Les poubelles sont vides. Quelqu'un est pass\xE9 avant vous.", statChanges: { mental: -5 } }
      ] }
    ]
  },
  {
    id: "beg-cinema",
    title: "Le Cin\xE9ma",
    type: "social",
    image: "/assets/beg-cinema-5SKZPaM25U4pgFRPzwkrku.webp",
    description: "Le cin\xE9ma vient de projeter un film. Les spectateurs sortent.",
    choices: [
      { text: "Mendier \xE0 la sortie", risk: "safe", emoji: "\u{1F3AC}", outcomes: [
        { probability: 0.5, text: "Les gens sont de bonne humeur apr\xE8s le film. 4\u20AC r\xE9colt\xE9s.", statChanges: { dignity: -3, mental: 3 }, moneyChange: 4 },
        { probability: 0.5, text: "Tout le monde est sur son t\xE9l\xE9phone. Personne ne vous voit.", statChanges: { dignity: -5, mental: -3 } }
      ] },
      { text: "R\xE9cup\xE9rer les pop-corn restants dans la salle", risk: "risky", emoji: "\u{1F37F}", outcomes: [
        { probability: 0.4, text: "Vous vous faufilez : du pop-corn au fond des seaux, des nachos, et un soda que quelqu'un a oubli\xE9 plein.", statChanges: { hunger: 15, thirst: 8, mental: 5 } },
        { probability: 0.6, text: `L'ouvreuse vous attrape. "Dehors !" Expuls\xE9.`, statChanges: { dignity: -10, mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-eglise-dimanche",
    title: "La Messe du Dimanche",
    type: "social",
    image: "/assets/beg-eglise-dimanche-MT7XJz2j3QPsWbbzddy6W2.webp",
    description: "C'est dimanche. Les fid\xE8les sortent de la messe, l'\xE2me charitable.",
    choices: [
      { text: "Demander l'aum\xF4ne", risk: "safe", emoji: "\u26EA", outcomes: [
        { probability: 0.7, text: "La qu\xEAte vous revient avec 6\u20AC dedans et un sandwich pos\xE9 par-dessus.", statChanges: { hunger: 12, mental: 5, dignity: 3 }, moneyChange: 6 },
        { probability: 0.3, text: `"Dieu vous aide, mon fils." Pas d'argent mais une b\xE9n\xE9diction.`, statChanges: { mental: 3 } }
      ] },
      { text: "Entrer pour le repas paroissial", risk: "normal", emoji: "\u{1F37D}\uFE0F", outcomes: [
        { probability: 0.5, text: "Repas complet : soupe, pain, fromage, caf\xE9, et un voisin de table qui parle tout seul mais partage son sucre.", statChanges: { hunger: 30, thirst: 15, mental: 10, dignity: 5 } },
        { probability: 0.5, text: '"Le repas est r\xE9serv\xE9 aux inscrits." Mais on vous donne du pain.', statChanges: { hunger: 10, mental: 3 } }
      ] }
    ]
  },
  {
    id: "beg-mairie",
    title: "La Mairie",
    type: "social",
    image: "/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp",
    description: "La mairie est ouverte. Des gens font la queue pour des papiers.",
    choices: [
      { text: "Demander des informations sur les aides sociales", risk: "safe", emoji: "\u{1F3DB}\uFE0F", outcomes: [
        { probability: 0.6, text: "L'agent d'accueil est compr\xE9hensif. Il vous donne une liste de foyers et d'aides, et entoure deux adresses au stylo.", statChanges: { mental: 10, dignity: 5 }, addFlag: "aide-mairie" },
        { probability: 0.4, text: `"Prenez un num\xE9ro." Apr\xE8s 2h d'attente, le guichet ferme.`, statChanges: { mental: -5, sleep: -5 } }
      ] },
      { text: "Utiliser les toilettes et l'eau chaude", risk: "safe", emoji: "\u{1F6BB}", outcomes: [
        { probability: 0.8, text: "Toilettes publiques gratuites ! Vous en profitez pour vous laver.", statChanges: { dignity: 10, thirst: 10 } },
        { probability: 0.2, text: '"Les toilettes sont en panne." Pas de chance.', statChanges: { mental: -2 } }
      ] }
    ]
  },
  {
    id: "beg-gare-tgv",
    title: "La Gare TGV",
    type: "social",
    image: "/assets/beg-gare-tgv-GVKJko8WAfiNoRKBN7oVPn.webp",
    description: "La gare TGV est bond\xE9e. Voyageurs press\xE9s, valises \xE0 roulettes, stress ambiant.",
    choices: [
      { text: "Proposer de porter les valises", risk: "normal", emoji: "\u{1F9F3}", outcomes: [
        { probability: 0.5, text: "Une dame \xE2g\xE9e accepte ! 5\u20AC et un merci sinc\xE8re.", statChanges: { dignity: 5, mental: 5, sleep: -3 }, moneyChange: 5 },
        { probability: 0.3, text: '"Non merci." Refus poli mais ferme.', statChanges: { mental: -2 } },
        { probability: 0.2, text: "Un voyageur vous accuse de vol, fouille sa poche int\xE9rieure, retrouve son portefeuille, et ne s'excuse pas.", statChanges: { dignity: -10, mental: -8 } }
      ] },
      { text: "Mendier pr\xE8s du distributeur de billets", risk: "safe", emoji: "\u{1F3AB}", outcomes: [
        { probability: 0.5, text: "Les voyageurs l\xE2chent leur monnaie. 3\u20AC en 30 minutes.", statChanges: { dignity: -5 }, moneyChange: 3 },
        { probability: 0.5, text: "La police ferroviaire vous demande de circuler.", statChanges: { dignity: -5, mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-distributeur-billets",
    title: "Le Distributeur de Billets",
    type: "narrative",
    image: "/assets/beg-distributeur-billets-G85Evn8NyawUD4iF3YYLdL.webp",
    description: "Un distributeur automatique de billets. Des gens retirent de l'argent.",
    choices: [
      { text: "Attendre pr\xE8s du distributeur", risk: "safe", emoji: "\u{1F3E7}", outcomes: [
        { probability: 0.4, text: "Quelqu'un oublie sa monnaie ! 3\u20AC dans le bac.", statChanges: { mental: 5 }, moneyChange: 3 },
        { probability: 0.3, text: "Rien ne se passe. Vous avez l'air suspect.", statChanges: { dignity: -5 } },
        { probability: 0.3, text: 'Un homme vous donne 2\u20AC. "Tiens, ach\xE8te-toi un caf\xE9."', statChanges: { mental: 5, dignity: 3 }, moneyChange: 2 }
      ] },
      { text: "Demander poliment aux gens qui retirent", risk: "normal", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.4, text: `"Tenez." 5\u20AC d'un coup, pli\xE9s en deux, gliss\xE9s sans qu'il ralentisse le pas.`, statChanges: { mental: 8, dignity: -3 }, moneyChange: 5 },
        { probability: 0.6, text: "Les gens acc\xE9l\xE8rent le pas. Vous \xEAtes un \xE9pouvantail.", statChanges: { dignity: -8, mental: -5 } }
      ] }
    ]
  },
  {
    id: "beg-fleuriste",
    title: "Le Fleuriste",
    type: "social",
    image: "/assets/beg-fleuriste-bxNwHDonMVDteRKwkBfphr.webp",
    description: "Le fleuriste jette ses fleurs fan\xE9es. Elles sont encore belles.",
    choices: [
      { text: "Demander les fleurs invendues", risk: "safe", emoji: "\u{1F490}", outcomes: [
        { probability: 0.7, text: '"Prenez, elles vont \xE0 la poubelle." Un bouquet entier, un peu fatigu\xE9 du c\xF4t\xE9 gauche.', statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.3, text: '"Non, elles sont pour le compost." \xC9colo strict.', statChanges: { mental: -2 } }
      ] },
      { text: "Revendre les fleurs aux passants", risk: "normal", emoji: "\u{1F339}", outcomes: [
        { probability: 0.5, text: '"Des fleurs pour madame ?" Vous vendez 3 roses. 6\u20AC !', statChanges: { dignity: 5, mental: 8 }, moneyChange: 6, respectChange: 2 },
        { probability: 0.5, text: "Personne n'ach\xE8te des fleurs \xE0 un SDF. Logique, en fait.", statChanges: { dignity: -5, mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-station-metro",
    title: "La Station de M\xE9tro",
    type: "social",
    image: "/assets/beg-station-metro-7k2mmvWMW6cQbjMKeQ3nba.webp",
    description: "L'entr\xE9e du m\xE9tro. Flux constant de passagers press\xE9s.",
    choices: [
      { text: "Faire la manche avec un panneau", risk: "safe", emoji: "\u{1F4DD}", outcomes: [
        { probability: 0.5, text: `Votre panneau "J'ai faim" touche les coeurs. 5\u20AC en 1h.`, statChanges: { dignity: -5, mental: 3 }, moneyChange: 5 },
        { probability: 0.3, text: "Un passant vous donne un sandwich encore emball\xE9, avec le ticket de caisse dedans.", statChanges: { hunger: 15, mental: 5 } },
        { probability: 0.2, text: "Un agent vous demande de partir, poliment, en d\xE9signant un panneau que vous n'aviez pas vu.", statChanges: { dignity: -5, mental: -3 } }
      ] },
      { text: "Ouvrir les portes aux gens charg\xE9s", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.7, text: "Service appr\xE9ci\xE9 ! Quelques pi\xE8ces en remerciement. 2\u20AC.", statChanges: { dignity: 5, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: "Les gens passent sans un regard, chacun r\xE9gl\xE9 sur son propre couloir invisible.", statChanges: { mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-parc-chien",
    title: "Le Parc \xE0 Chiens",
    type: "social",
    image: "/assets/beg-parc-chien-hP9gE8EtKnSHykQy4QSKpy.webp",
    description: "Le parc \xE0 chiens est anim\xE9. Des propri\xE9taires discutent pendant que leurs chiens jouent.",
    choices: [
      { text: "Proposer de garder les chiens", risk: "normal", emoji: "\u{1F415}", outcomes: [
        { probability: 0.5, text: "Une dame vous confie son caniche 30 min. 4\u20AC et des l\xE9chouilles.", statChanges: { mental: 10, dignity: 5 }, moneyChange: 4 },
        { probability: 0.5, text: '"Mon chien ne va pas avec les inconnus." Refus.', statChanges: { mental: -2 } }
      ] },
      { text: "Jouer avec les chiens", risk: "safe", emoji: "\u{1F3BE}", outcomes: [
        { probability: 0.8, text: "Les chiens vous adorent ! Moment de bonheur pur. Un propri\xE9taire vous offre un caf\xE9.", statChanges: { mental: 12, thirst: 8, dignity: 3 } },
        { probability: 0.2, text: "Un chien vous mord la main. Pas m\xE9chamment, mais quand m\xEAme.", statChanges: { health: -3, mental: -2 } }
      ] }
    ]
  },
  {
    id: "beg-lavage-voiture",
    title: "La Station de Lavage",
    type: "social",
    image: "/assets/beg-lavage-voiture-jio2DxY23xqhxu63ZuyVTv.webp",
    description: "Une station de lavage automatique. Des gens attendent que leur voiture soit propre.",
    choices: [
      { text: "Proposer un lavage \xE0 la main", risk: "normal", emoji: "\u{1F9FD}", outcomes: [
        { probability: 0.5, text: "Un homme accepte : une heure de travail, 8\u20AC, compt\xE9s devant vous avant que vous commenciez.", statChanges: { dignity: 5, mental: 5, sleep: -5 }, moneyChange: 8 },
        { probability: 0.5, text: `"J'ai la machine pour \xE7a." Logique.`, statChanges: { mental: -2 } }
      ] },
      { text: "R\xE9cup\xE9rer la monnaie oubli\xE9e dans les machines", risk: "safe", emoji: "\u{1FA99}", outcomes: [
        { probability: 0.4, text: "2\u20AC oubli\xE9s dans le bac de rendu d'une machine, encore ti\xE8des du distributeur.", statChanges: { mental: 3 }, moneyChange: 2 },
        { probability: 0.6, text: "Rien. Les machines sont vides.", statChanges: { mental: -1 } }
      ] }
    ]
  },
  {
    id: "beg-taxi-arret",
    title: "L'Arr\xEAt de Taxi",
    type: "social",
    image: "/assets/beg-taxi-arret-fGsAqfVEcKEJAiddtE6GrC.webp",
    description: "Une file de taxis attend des clients. Les chauffeurs discutent entre eux.",
    choices: [
      { text: "Demander un petit quelque chose aux chauffeurs", risk: "safe", emoji: "\u{1F695}", outcomes: [
        { probability: 0.5, text: `Un chauffeur vous offre son sandwich. "J'ai plus faim, prends."`, statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: '"D\xE9gage, tu fais fuir les clients."', statChanges: { dignity: -8, mental: -3 } },
        { probability: 0.2, text: "Un chauffeur vous propose un trajet gratuit jusqu'au foyer.", statChanges: { mental: 10, dignity: 5 } }
      ] },
      { text: "Ouvrir les portes des taxis aux clients", risk: "normal", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.4, text: "Les clients appr\xE9cient ! 3\u20AC en pourboires.", statChanges: { dignity: 3, mental: 5 }, moneyChange: 3 },
        { probability: 0.6, text: `Les chauffeurs n'aiment pas \xE7a. "C'est notre boulot !"`, statChanges: { dignity: -5 } }
      ] }
    ]
  },
  {
    id: "beg-concert-sortie",
    title: "La Sortie de Concert",
    type: "social",
    image: "/assets/beg-concert-sortie-VPCD4nBdsydTGMi5TPfd8i.webp",
    description: "Un concert vient de se terminer. Les spectateurs sortent par vagues, encore \xE0 moiti\xE9 sourds.",
    choices: [
      { text: "Mendier dans l'euphorie g\xE9n\xE9rale", risk: "safe", emoji: "\u{1F3B8}", outcomes: [
        { probability: 0.6, text: "Les gens sortent du concert en chantant faux et donnent sans compter : 7\u20AC.", statChanges: { dignity: -3, mental: 5 }, moneyChange: 7 },
        { probability: 0.4, text: "Tout le monde est sur son t\xE9l\xE9phone \xE0 poster des stories.", statChanges: { dignity: -3, mental: -2 } }
      ] },
      { text: "Chanter les chansons du concert", risk: "normal", emoji: "\u{1F3A4}", outcomes: [
        { probability: 0.5, text: "Votre reprise est applaudie, et quelqu'un reprend le refrain avec vous, plus fort que vous.", statChanges: { mental: 10, dignity: 5 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.5, text: "Faux comme une casserole. Un chien du quartier se met \xE0 hurler avec vous.", statChanges: { dignity: -8, mental: -3 } }
      ] }
    ]
  },
  {
    id: "beg-match-foot",
    title: "La Sortie du Match",
    type: "social",
    image: "/assets/beg-match-foot-PvcoeSj4wSQHaeZetgnJEk.webp",
    description: "Le match de foot est fini. Les supporters envahissent les rues.",
    choices: [
      { text: "Mendier aupr\xE8s des supporters", risk: "normal", emoji: "\u26BD", outcomes: [
        { probability: 0.4, text: "L'\xE9quipe locale a gagn\xE9 ! Les supporters sont g\xE9n\xE9reux. 8\u20AC !", statChanges: { mental: 5 }, moneyChange: 8 },
        { probability: 0.3, text: "L'\xE9quipe a perdu. Les supporters sortent en silence, et le premier qui parle se fait rembarrer.", statChanges: { mental: -5, dignity: -5 } },
        { probability: 0.3, text: "Un supporter vous offre une bi\xE8re et vous explique le match pendant vingt minutes, geste par geste.", statChanges: { thirst: 10, mental: 8, dignity: -3 } }
      ] },
      { text: "Vendre des \xE9charpes trouv\xE9es", risk: "risky", emoji: "\u{1F9E3}", outcomes: [
        { probability: 0.3, text: "Vous vendez 2 \xE9charpes \xE0 3\u20AC chacune, dont une \xE0 quelqu'un qui en portait d\xE9j\xE0 une.", statChanges: { dignity: -3, mental: 5 }, moneyChange: 6 },
        { probability: 0.7, text: "Un supporter reconna\xEEt SON \xE9charpe et pose une main sur votre \xE9paule, sans serrer, pour l'instant.", statChanges: { dignity: -10, mental: -8, health: -3 } }
      ] }
    ]
  }
];
var STEAL_EVENTS = [
  {
    id: "steal-etal-marche",
    title: "L'\xC9tal du March\xE9",
    type: "discovery",
    image: "/assets/steal-etal-marche.webp",
    fallbackImage: "/assets/steal-cageots-aube.webp",
    description: "Un primeur a le dos tourn\xE9. Ses fruits sont \xE0 port\xE9e de main. Personne ne regarde... ou presque.",
    choices: [
      { text: "Chiper deux pommes vite fait", risk: "normal", emoji: "\u{1F34E}", outcomes: [
        { probability: 0.6, text: "Mission accomplie : deux belles pommes dans la poche, et le primeur qui hurle toujours ses promos.", statChanges: { hunger: 18, dignity: -6 } },
        { probability: 0.4, text: '"H\xC9 ! Le voleur !" Le primeur vous attrape par le col et vous secoue.', statChanges: { health: -8, dignity: -14, mental: -6 }, respectChange: -2 }
      ] },
      { text: "Rafler toute la caisse de fruits", risk: "risky", emoji: "\u{1F9FA}", outcomes: [
        { probability: 0.3, text: "Jackpot : vous filez avec une caisse enti\xE8re, qui p\xE8se le double de ce que vous pensiez.", statChanges: { hunger: 35, mental: 8, dignity: -10 }, itemGain: { id: "caisse-fruits", name: "Caisse de fruits", emoji: "\u{1F9FA}", type: "food", value: 12, effect: { hunger: 20 } } },
        { probability: 0.7, text: "Trop gourmand. Le march\xE9 entier vous tombe dessus. On vous reprend tout et un peu plus.", statChanges: { health: -15, dignity: -18, mental: -10 }, moneyChange: -3, respectChange: -3 }
      ] }
    ]
  },
  {
    id: "steal-poche-costard",
    title: "La Poche du Costard",
    type: "discovery",
    image: "/assets/steal-poche-costard.webp",
    fallbackImage: "/assets/rest-wagon-train-Nh3WT9QiYunMe4t55bsuDu.webp",
    description: "Un homme d'affaires dort dans le train, portefeuille qui d\xE9passe. La tentation est \xE9norme.",
    choices: [
      { text: "Faire les poches en douceur", risk: "risky", emoji: "\u{1F90F}", outcomes: [
        { probability: 0.45, text: "Vos doigts de f\xE9e font merveille. 15\u20AC et il ronfle toujours.", moneyChange: 15, statChanges: { dignity: -8, mental: 4 }, respectChange: 1 },
        { probability: 0.55, text: 'Il se r\xE9veille en sursaut ! "Au voleur !" Vous courez, le c\u0153ur battant.', statChanges: { health: -6, mental: -10, dignity: -12 }, respectChange: -2 }
      ] },
      { text: "Renoncer, c'est trop risqu\xE9", risk: "safe", emoji: "\u{1F645}", outcomes: [
        { probability: 1, text: "Vous vous \xE9loignez. Votre estomac grogne, mais votre conscience est tranquille.", statChanges: { mental: 3, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "steal-supermarche",
    title: "Le Supermarch\xE9",
    type: "discovery",
    image: "/assets/steal-supermarche.webp",
    fallbackImage: "/assets/steal-jetons-caddies.webp",
    description: "Rayons remplis, vigile \xE0 moiti\xE9 endormi. Une bo\xEEte de conserve glisserait si bien sous la veste.",
    choices: [
      { text: "Glisser de la nourriture sous la veste", risk: "normal", emoji: "\u{1F96B}", outcomes: [
        { probability: 0.55, text: "Vous passez les portiques l'air de rien. Conserves et chocolat : repas assur\xE9.", statChanges: { hunger: 25, thirst: 8, dignity: -8 }, itemGain: { id: "conserve-volee", name: "Conserve vol\xE9e", emoji: "\u{1F96B}", type: "food", value: 5, effect: { hunger: 30 } } },
        { probability: 0.45, text: "Le portique sonne. Le vigile se r\xE9veille enfin. Fouille humiliante devant tout le monde.", statChanges: { dignity: -18, mental: -10, health: -4 }, respectChange: -2 }
      ] },
      { text: "Voler une bouteille d'alcool \xE0 revendre", risk: "risky", emoji: "\u{1F37E}", outcomes: [
        { probability: 0.35, text: "Bouteille de vin sous le bras, vous filez. Revendue au coin de la rue : 8\u20AC.", moneyChange: 8, statChanges: { dignity: -10, mental: 3 } },
        { probability: 0.65, text: "Le vigile \xE9tait bien r\xE9veill\xE9. Il vous plaque au sol et appelle la police.", statChanges: { health: -18, dignity: -20, mental: -12 }, moneyChange: -5, respectChange: -4 }
      ] }
    ]
  },
  {
    id: "steal-velo",
    title: "Le V\xE9lo Mal Attach\xE9",
    type: "discovery",
    image: "/assets/steal-velo.webp",
    fallbackImage: "/assets/steal-panier-velo.webp",
    description: "Un v\xE9lo \xE9lectrique, antivol bon march\xE9 \xE0 peine ferm\xE9. Il vaut une petite fortune \xE0 la revente.",
    choices: [
      { text: "Forcer l'antivol et filer", risk: "risky", emoji: "\u{1F6B2}", outcomes: [
        { probability: 0.4, text: "Clic, l'antivol c\xE8de. Le receleur donne 20\u20AC sans regarder le v\xE9lo, ce qui veut dire qu'il en vaut plus.", moneyChange: 20, statChanges: { dignity: -12, mental: 5 }, respectChange: 2 },
        { probability: 0.6, text: "Le propri\xE9taire surgit du caf\xE9 d'\xE0 c\xF4t\xE9. La poursuite tourne mal pour vous.", statChanges: { health: -20, dignity: -15, mental: -8 }, respectChange: -3 }
      ] },
      { text: "Voler juste la sacoche", risk: "normal", emoji: "\u{1F45C}", outcomes: [
        { probability: 0.55, text: "La sacoche contient un casse-cro\xFBte, 4\u20AC de monnaie et une photo d'identit\xE9 que vous remettez dedans.", moneyChange: 4, statChanges: { hunger: 12, dignity: -6 } },
        { probability: 0.45, text: "Un passant crie pour alerter. Vous l\xE2chez tout et d\xE9talez.", statChanges: { mental: -6, dignity: -10 }, respectChange: -1 }
      ] }
    ]
  },
  {
    id: "steal-tronc-eglise",
    title: "Le Tronc de l'\xC9glise",
    type: "discovery",
    image: "/assets/steal-tronc-eglise.webp",
    fallbackImage: "/assets/exp-eglise-2mK4FcdNW7pYwWeFopWXmF.webp",
    description: "L'\xE9glise est vide. Le tronc des offrandes d\xE9borde de pi\xE8ces. Dieu regarde, para\xEEt-il.",
    choices: [
      { text: "Se servir dans le tronc", risk: "risky", emoji: "\u26EA", outcomes: [
        { probability: 0.5, text: "Vous r\xE9cup\xE9rez 12\u20AC en pi\xE8ces. Personne, sauf peut-\xEAtre le Tout-Puissant.", moneyChange: 12, statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.5, text: 'Le cur\xE9 sort de la sacristie. "Mon fils, que fais-tu ?" La honte vous \xE9crase.', statChanges: { dignity: -20, mental: -12 }, respectChange: -2 }
      ] },
      { text: "Demander l'aum\xF4ne au cur\xE9 \xE0 la place", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.7, text: 'Le cur\xE9 vous offre un repas chaud et 5\u20AC du tronc, de bon c\u0153ur. "Reviens quand tu veux."', moneyChange: 5, statChanges: { hunger: 20, mental: 12, dignity: 8 }, respectChange: 2 },
        { probability: 0.3, text: "Il est absent. Mais une b\xE9n\xE9vole vous donne une soupe.", statChanges: { hunger: 12, mental: 5 } }
      ] }
    ]
  },
  {
    id: "steal-etendage",
    title: "Le Linge qui S\xE8che",
    type: "discovery",
    image: "/assets/steal-etendage.webp",
    fallbackImage: "/assets/steal-pressing-costume.webp",
    description: "Au rez-de-chauss\xE9e, du linge s\xE8che \xE0 une fen\xEAtre ouverte. Un manteau chaud vous ferait du bien.",
    choices: [
      { text: "D\xE9crocher le manteau", risk: "normal", emoji: "\u{1F9E5}", outcomes: [
        { probability: 0.55, text: "Un bon manteau de laine, encore ti\xE8de du soleil. Vos nuits seront moins rudes.", statChanges: { dignity: 4, sleep: 6, health: 4 }, itemGain: { id: "manteau-vole", name: "Manteau vol\xE9", emoji: "\u{1F9E5}", type: "armor", value: 7, defenseBonus: 2 } },
        { probability: 0.45, text: 'Une grand-m\xE8re hurle \xE0 la fen\xEAtre : "Au secours, on me vole !" Tout le quartier se r\xE9veille.', statChanges: { mental: -8, dignity: -14 }, respectChange: -2 }
      ] },
      { text: "Prendre les chaussettes et les sous-v\xEAtements", risk: "safe", emoji: "\u{1F9E6}", outcomes: [
        { probability: 0.8, text: "Pas glorieux, mais des chaussettes s\xE8ches changent une vie dans la rue.", statChanges: { dignity: -4, mental: 4, health: 3 } },
        { probability: 0.2, text: "Un chien de garde aboie. Vous filez avec une seule chaussette, la gauche, encore humide.", statChanges: { dignity: -6, mental: -2 } }
      ] }
    ]
  }
];
var REST_EVENTS = [
  {
    id: "rest-pont-riviere",
    title: "Le Pont sur la Rivi\xE8re",
    type: "narrative",
    image: "/assets/rest-pont-riviere-ZkfvuMX445ho8WdARa8BGq.webp",
    description: "Sous le pont, c'est sec et abrit\xE9. Le bruit de l'eau est apaisant.",
    choices: [
      { text: "S'installer pour la nuit", risk: "safe", emoji: "\u{1F309}", outcomes: [
        { probability: 0.7, text: "Nuit paisible berc\xE9e par le clapotis. Vous dormez comme un b\xE9b\xE9.", statChanges: { sleep: 20, mental: 5 } },
        { probability: 0.3, text: "L'eau monte pendant la nuit et vous r\xE9veille en atteignant les chevilles.", statChanges: { sleep: 8, health: -3 } }
      ] },
      { text: "Explorer sous le pont", risk: "normal", emoji: "\u{1F526}", outcomes: [
        { probability: 0.5, text: "Vous trouvez une couverture laiss\xE9e par quelqu'un d'autre, pli\xE9e en carr\xE9, comme rendue expr\xE8s.", statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.5, text: "Des rats. Beaucoup de rats. Vous changez de spot.", statChanges: { mental: -5, sleep: 5 } }
      ] }
    ]
  },
  {
    id: "rest-lavomatic",
    title: "Le Lavomatic 24h",
    type: "narrative",
    image: "/assets/rest-lavomatic-koaRprcJ9mvGN9vvKFySBu.webp",
    description: "Le lavomatic est ouvert toute la nuit. Chaud, \xE9clair\xE9, avec des chaises.",
    choices: [
      { text: "Dormir sur les chaises", risk: "safe", emoji: "\u{1F9FA}", outcomes: [
        { probability: 0.6, text: "Le ronronnement des machines vous berce, et le cycle d'essorage vous r\xE9veille toutes les heures.", statChanges: { sleep: 18, mental: 3 } },
        { probability: 0.4, text: `Le g\xE9rant passe \xE0 3h. "C'est pas un h\xF4tel !" Dehors.`, statChanges: { sleep: 8, dignity: -5 } }
      ] },
      { text: "Laver vos v\xEAtements (si vous avez de l'argent)", risk: "safe", emoji: "\u{1F455}", outcomes: [
        { probability: 0.7, text: "V\xEAtements propres, encore chauds du s\xE8che-linge. Vous les remettez avant qu'ils refroidissent.", statChanges: { dignity: 15, mental: 8, sleep: 5 } },
        { probability: 0.3, text: "La machine avale votre pi\xE8ce, clignote deux fois, et se rendort.", statChanges: { mental: -5 } }
      ] }
    ]
  },
  {
    id: "rest-parking-souterrain",
    title: "Le Parking Souterrain",
    type: "narrative",
    image: "/assets/rest-parking-souterrain-Rgkuiwyd7ZtiJ3qQzx2dHW.webp",
    description: "Le parking souterrain est presque vide la nuit. Sec, \xE0 l'abri du vent.",
    choices: [
      { text: "Se cacher entre les voitures", risk: "normal", emoji: "\u{1F17F}\uFE0F", outcomes: [
        { probability: 0.5, text: "Nuit tranquille. Le b\xE9ton n'est pas confortable mais c'est sec.", statChanges: { sleep: 15 } },
        { probability: 0.3, text: "Un vigile fait sa ronde. Vous devez bouger toutes les heures.", statChanges: { sleep: 8, mental: -3 } },
        { probability: 0.2, text: "Une alarme de voiture se d\xE9clenche et se coupe toute seule dix secondes apr\xE8s votre d\xE9part.", statChanges: { sleep: -5, mental: -8 } }
      ] },
      { text: "Dormir dans la cage d'escalier", risk: "safe", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.7, text: "Spot discret. Vous dormez sans \xEAtre d\xE9rang\xE9.", statChanges: { sleep: 18 } },
        { probability: 0.3, text: "Un r\xE9sident vous d\xE9couvre au matin, en pyjama, sa poubelle \xE0 la main, aussi surpris que vous.", statChanges: { sleep: 12, dignity: -5 } }
      ] }
    ]
  },
  {
    id: "rest-cabane-carton",
    title: "Le Ch\xE2teau de Carton",
    type: "narrative",
    image: "/assets/rest-cabane-carton-Q65zGixABM5SKqrjKEaS4x.webp",
    description: "Vous avez assez de cartons pour vous b\xE2tir un vrai petit palace.",
    choices: [
      { text: "Construire un abri \xE9labor\xE9", risk: "normal", emoji: "\u{1F3D7}\uFE0F", outcomes: [
        { probability: 0.6, text: "Chef-d'\u0153uvre architectural : quatre \xE9paisseurs, un angle contre le mur, et le vent qui passe \xE0 c\xF4t\xE9.", statChanges: { sleep: 25, dignity: 5, mental: 5 } },
        { probability: 0.4, text: "Le vent emporte votre construction. Retour \xE0 la case d\xE9part.", statChanges: { sleep: 5, mental: -5 } }
      ] },
      { text: "Juste s'enrouler dans un carton", risk: "safe", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.7, text: "Pas le grand luxe, mais \xE7a fait le job.", statChanges: { sleep: 15 } },
        { probability: 0.3, text: "Le carton est mouill\xE9 : il colle au dos et refroidit plus vite que l'air.", statChanges: { sleep: 5, health: -5 } }
      ] }
    ]
  },
  {
    id: "rest-banc-eglise",
    title: "Le Banc de l'\xC9glise",
    type: "narrative",
    image: "/assets/rest-banc-eglise-ZdyDwJEYtPgNBbSofzbiyw.webp",
    description: "Le banc devant l'\xE9glise est large et abrit\xE9 par un auvent.",
    choices: [
      { text: "S'allonger sur le banc", risk: "safe", emoji: "\u26EA", outcomes: [
        { probability: 0.7, text: "Le pr\xEAtre sort, vous couvre d'une couverture, et rentre sans avoir dit un mot.", statChanges: { sleep: 20, mental: 10, dignity: 5 } },
        { probability: 0.3, text: "Le banc est dur comme la pierre. Dos en compote au r\xE9veil.", statChanges: { sleep: 10, health: -3 } }
      ] },
      { text: "Entrer dans l'\xE9glise si elle est ouverte", risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 0.5, text: "L'\xE9glise est ouverte. Vous dormez sur un banc du fond, sous un radiateur qui claque toutes les heures.", statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: "Ferm\xE9e \xE0 cl\xE9. Le banc ext\xE9rieur fera l'affaire.", statChanges: { sleep: 12 } }
      ] }
    ]
  },
  {
    id: "rest-toit-immeuble",
    title: "Le Toit de l'Immeuble",
    type: "narrative",
    image: "/assets/rest-toit-immeuble-6ryUDQFMVD6QoZDFqJj4s7.webp",
    description: "Vous avez trouv\xE9 l'acc\xE8s au toit. On voit trois \xE9toiles et le halo orange de toute la ville.",
    choices: [
      { text: "Dormir \xE0 la belle \xE9toile", risk: "normal", emoji: "\u2B50", outcomes: [
        { probability: 0.5, text: "Nuit magique sous les \xE9toiles. Le vent est doux.", statChanges: { sleep: 20, mental: 10 } },
        { probability: 0.3, text: "Il se met \xE0 pleuvoir. Pas d'abri sur un toit.", statChanges: { sleep: 5, health: -5, mental: -3 } },
        { probability: 0.2, text: "Vous roulez dans votre sommeil. R\xE9veil brutal au bord du vide !", statChanges: { sleep: 8, mental: -10 } }
      ] },
      { text: "Installer un campement", risk: "safe", emoji: "\u{1F3D5}\uFE0F", outcomes: [
        { probability: 0.7, text: "Avec des b\xE2ches et du carton, vous cr\xE9ez un nid douillet.", statChanges: { sleep: 22, mental: 5 } },
        { probability: 0.3, text: "Le vent emporte tout, y compris le carton que vous teniez \xE0 deux mains.", statChanges: { sleep: 10 } }
      ] }
    ]
  },
  {
    id: "rest-abribus",
    title: "L'Abribus",
    type: "narrative",
    image: "/assets/rest-abribus-T6i3s6bQ4qyZfBauUNWeu6.webp",
    description: "L'abribus est vide. Le plexiglas coupe le vent, le banc a trois places et deux accoudoirs.",
    choices: [
      { text: "Dormir assis sur le banc", risk: "safe", emoji: "\u{1F68C}", outcomes: [
        { probability: 0.6, text: "Nuit correcte. Le premier bus vous r\xE9veille \xE0 5h30.", statChanges: { sleep: 15 } },
        { probability: 0.4, text: "Un ivrogne s'installe \xE0 c\xF4t\xE9 et ronfle assez fort pour couvrir les annonces de la gare.", statChanges: { sleep: 8, mental: -3 } }
      ] },
      { text: "S'allonger par terre dans l'abribus", risk: "normal", emoji: "\u{1F634}", outcomes: [
        { probability: 0.5, text: "Plus confortable qu'on ne croit, \xE0 condition de ne pas bouger les jambes.", statChanges: { sleep: 18, dignity: -5 } },
        { probability: 0.5, text: 'La police passe. "Circulez." Pas de repos.', statChanges: { sleep: 3, dignity: -8 } }
      ] }
    ]
  },
  {
    id: "rest-cave-abandonnee",
    title: "La Cave Abandonn\xE9e",
    type: "narrative",
    image: "/assets/rest-cave-abandonnee-PoPAKkfwWsspJhMjvZym9q.webp",
    description: "Une cave d'immeuble dont la porte ne ferme plus. Il fait noir, il fait sec, \xE7a sent la lessive.",
    choices: [
      { text: "S'installer dans la cave", risk: "normal", emoji: "\u{1F3DA}\uFE0F", outcomes: [
        { probability: 0.5, text: "Nuit au sec et au chaud. Les murs \xE9pais isolent bien.", statChanges: { sleep: 22, health: 3 } },
        { probability: 0.3, text: "Des bruits suspects. Vous ne dormez que d'un oeil.", statChanges: { sleep: 10, mental: -5 } },
        { probability: 0.2, text: "Quelqu'un est d\xE9j\xE0 l\xE0. Il ne dit rien, d\xE9place son sac de dix centim\xE8tres, et c'est tout ce que vous aurez.", statChanges: { sleep: 8, mental: -3 } }
      ] },
      { text: "Explorer la cave d'abord", risk: "normal", emoji: "\u{1F526}", outcomes: [
        { probability: 0.4, text: "Vous trouvez des conserves oubli\xE9es et un matelas roul\xE9 debout dans un coin.", statChanges: { sleep: 20, hunger: 10 } },
        { probability: 0.6, text: "Juste des toiles d'araign\xE9e et de l'humidit\xE9.", statChanges: { sleep: 12 } }
      ] }
    ]
  },
  {
    id: "rest-hamac-parc",
    title: "Le Hamac Improvis\xE9",
    type: "narrative",
    image: "/assets/rest-hamac-parc-JKRnP6QzCq5LRVcbHvvA62.webp",
    description: "Deux arbres parfaitement espac\xE9s. Avec une couverture, vous pouvez faire un hamac.",
    choices: [
      { text: "Installer le hamac", risk: "normal", emoji: "\u{1F334}", outcomes: [
        { probability: 0.5, text: "Le hamac tient. Vous vous balancez toute la nuit sans jamais choisir dans quel sens.", statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: "Le noeud l\xE2che \xE0 3h du matin. Chute. A\xEFe.", statChanges: { sleep: 8, health: -5, mental: -3 } }
      ] },
      { text: "Dormir au pied des arbres", risk: "safe", emoji: "\u{1F333}", outcomes: [
        { probability: 0.7, text: "Les racines font un matelas naturel, avec une bosse exactement sous les reins.", statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.3, text: "Les fourmis. Partout. PARTOUT.", statChanges: { sleep: 5, mental: -5, health: -2 } }
      ] }
    ]
  },
  {
    id: "rest-combat-reveil",
    title: "Le R\xE9veil Brutal",
    type: "combat",
    image: "/assets/rest-combat-reveil-nz6rPGatE5MccSSp5M9iMT.webp",
    description: "Vous dormez paisiblement quand un bruit vous r\xE9veille. Quelqu'un fouille vos affaires !",
    choices: [
      { text: "Confronter le voleur", risk: "risky", emoji: "\u{1F624}", outcomes: [
        { probability: 0.4, text: "Vous l'effrayez ! Il fuit. Vos affaires sont intactes.", statChanges: { sleep: 5, mental: 5 } },
        { probability: 0.6, text: "C'est un type costaud. Il vous pousse et prend votre sac.", statChanges: { health: -8, mental: -10, dignity: -5 } }
      ] },
      { text: "Faire semblant de dormir", risk: "safe", emoji: "\u{1F634}", outcomes: [
        { probability: 0.5, text: "Il prend quelques pi\xE8ces et part. Vous perdez 3\u20AC mais gardez votre sant\xE9.", statChanges: { mental: -5 } },
        { probability: 0.5, text: "Il ne trouve rien d'int\xE9ressant, referme mal la porte, et repart en sifflant.", statChanges: { mental: -3, sleep: -5 } }
      ] }
    ]
  },
  {
    id: "rest-jardin-secret",
    title: "Le Jardin Secret",
    type: "discovery",
    image: "/assets/rest-jardin-secret-D3emeTRZCkD6yK6fmxucMr.webp",
    description: "Derri\xE8re un mur, un jardin abandonn\xE9. Herbes folles, banc en pierre, fontaine tarie.",
    choices: [
      { text: "S'installer dans le jardin", risk: "safe", emoji: "\u{1F33F}", outcomes: [
        { probability: 0.8, text: "Paradis cach\xE9 ! Calme absolu, herbe douce, abri du vent.", statChanges: { sleep: 25, mental: 12, dignity: 3 } },
        { probability: 0.2, text: `Le propri\xE9taire revient ! "C'est priv\xE9 !" Vous partez.`, statChanges: { sleep: 5, dignity: -5 } }
      ] },
      { text: "Explorer le jardin", risk: "safe", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.6, text: "Vous trouvez des herbes aromatiques et un robinet qui marche !", statChanges: { thirst: 15, mental: 8 } },
        { probability: 0.4, text: "Juste des orties et des ronces. A\xEFe.", statChanges: { health: -3 } }
      ] }
    ]
  },
  {
    id: "rest-grenier",
    title: "Le Grenier Oubli\xE9",
    type: "discovery",
    image: "/assets/rest-grenier-m7geqfLCEDsNwCuwNMJhXK.webp",
    description: "Un escalier m\xE8ne \xE0 un grenier dont la porte est entrouverte.",
    choices: [
      { text: "Monter explorer", risk: "normal", emoji: "\u{1FA9C}", outcomes: [
        { probability: 0.5, text: "Un grenier plein de vieux meubles, un matelas pos\xE9 sur deux palettes, des couvertures qui grattent.", statChanges: { sleep: 28, mental: 10 } },
        { probability: 0.3, text: "Le plancher craque dangereusement. Vous redescendez vite.", statChanges: { mental: -5, sleep: 5 } },
        { probability: 0.2, text: 'Le propri\xE9taire vous entend ! "Qui est l\xE0 ?!" Fuite.', statChanges: { mental: -8, dignity: -5 } }
      ] },
      { text: "Dormir dans l'escalier", risk: "safe", emoji: "\u{1FA9C}", outcomes: [
        { probability: 0.7, text: "L'escalier est abrit\xE9. Vous dormez sur la troisi\xE8me marche, la seule assez large.", statChanges: { sleep: 15 } },
        { probability: 0.3, text: "Un voisin vous enjambe \xE0 6h en tenant son caf\xE9 \xE0 bout de bras, sans un mot.", statChanges: { sleep: 10, dignity: -5 } }
      ] }
    ]
  },
  {
    id: "rest-fourgon-abandonne",
    title: "Le Fourgon Abandonn\xE9",
    type: "discovery",
    image: "/assets/rest-fourgon-abandonne-XoJDy85GdkXUPTQXiCseeQ.webp",
    description: "Un vieux fourgon de livraison rouill\xE9. La porte arri\xE8re est ouverte.",
    choices: [
      { text: "Dormir dans le fourgon", risk: "normal", emoji: "\u{1F690}", outcomes: [
        { probability: 0.6, text: "Sec, \xE0 l'abri du vent. Le m\xE9tal garde un peu de chaleur.", statChanges: { sleep: 20, mental: 3 } },
        { probability: 0.4, text: "Le fourgon est glacial. La t\xF4le prend le froid de la nuit et vous le rend jusqu'au matin.", statChanges: { sleep: 10, health: -3 } }
      ] },
      { text: "Am\xE9nager le fourgon", risk: "normal", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.5, text: "Avec du carton et des couvertures, c'est presque un studio !", statChanges: { sleep: 25, mental: 8, dignity: 3 } },
        { probability: 0.5, text: "Le propri\xE9taire revient chercher le fourgon \xE0 5h et d\xE9marre avant de vous voir.", statChanges: { sleep: 5, dignity: -8, mental: -5 } }
      ] }
    ]
  },
  {
    id: "rest-wagon-train",
    title: "Le Wagon de Train",
    type: "discovery",
    image: "/assets/rest-wagon-train-Nh3WT9QiYunMe4t55bsuDu.webp",
    description: "Un wagon de marchandises est ouvert sur une voie de garage.",
    choices: [
      { text: "Dormir dans le wagon", risk: "normal", emoji: "\u{1F683}", outcomes: [
        { probability: 0.5, text: "Le wagon est rempli de paille. Elle pique, elle sent l'\xE9table, elle tient chaud.", statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.3, text: "Le train se met en marche, et vous mettez trois secondes \xE0 comprendre pourquoi le sol bouge.", statChanges: { sleep: 5, mental: -10 } },
        { probability: 0.2, text: "Un contr\xF4leur vous trouve, remplit son carnet lentement, et vous colle 5\u20AC d'amende.", statChanges: { sleep: 8, dignity: -10 } }
      ] },
      { text: "Rester sur le quai", risk: "safe", emoji: "\u{1F689}", outcomes: [
        { probability: 0.7, text: "Le quai est abrit\xE9. Un haut-parleur annonce des trains toutes les vingt minutes, m\xEAme la nuit.", statChanges: { sleep: 12 } },
        { probability: 0.3, text: "Le vent trouve l'ouverture et souffle dessus toute la nuit, sans jamais se lasser.", statChanges: { sleep: 8, health: -3 } }
      ] }
    ]
  },
  {
    id: "rest-tente-fortune",
    title: "La Tente de Fortune",
    type: "narrative",
    image: "/assets/rest-tente-fortune-3Wjo7we5oS4ENU5hbyn6xd.webp",
    description: "Avec des sacs poubelle et des b\xE2tons, vous pouvez construire une tente.",
    choices: [
      { text: "Construire la tente", risk: "normal", emoji: "\u26FA", outcomes: [
        { probability: 0.6, text: "Votre tente tient ! Nuit au sec, presque confortable.", statChanges: { sleep: 22, mental: 5, dignity: 3 } },
        { probability: 0.4, text: "La tente s'effondre \xE0 2h du matin. Retour \xE0 la case d\xE9part.", statChanges: { sleep: 8, mental: -5 } }
      ] },
      { text: "Dormir sans tente", risk: "safe", emoji: "\u{1F319}", outcomes: [
        { probability: 0.5, text: "La nuit est douce. Pas besoin de tente finalement.", statChanges: { sleep: 15 } },
        { probability: 0.5, text: "Il pleut. Vous regrettez de ne pas avoir construit la tente.", statChanges: { sleep: 5, health: -5 } }
      ] }
    ]
  },
  {
    id: "rest-musee-nuit",
    title: "Le Mus\xE9e la Nuit",
    type: "narrative",
    image: "/assets/rest-musee-nuit-TRWpZcKL5eRM9F6cUsu5qv.webp",
    description: "Le mus\xE9e ferme ses portes. Mais vous connaissez une entr\xE9e de service...",
    choices: [
      { text: "Se cacher dans le mus\xE9e", risk: "risky", emoji: "\u{1F3DB}\uFE0F", outcomes: [
        { probability: 0.3, text: "Nuit au mus\xE9e : vous dormez devant un Monet, sur une banquette pr\xE9vue pour le regarder.", statChanges: { sleep: 25, mental: 15, dignity: 10 } },
        { probability: 0.4, text: "L'alarme se d\xE9clenche, et le gardien vous poursuit \xE0 travers trois salles d'impressionnistes.", statChanges: { sleep: -5, mental: -8, dignity: -5 } },
        { probability: 0.3, text: "Vous trouvez le vestiaire du personnel : un canap\xE9 d\xE9fonc\xE9 et une cafeti\xE8re encore branch\xE9e.", statChanges: { sleep: 22, thirst: 10, mental: 8 } }
      ] },
      { text: "Dormir devant le mus\xE9e", risk: "safe", emoji: "\u{1F3DB}\uFE0F", outcomes: [
        { probability: 0.7, text: "L'auvent du mus\xE9e prot\xE8ge de la pluie, et l'affiche de l'exposition vous tient lieu de veilleuse.", statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Le gardien vous chasse. "Pas de SDF devant le mus\xE9e !"', statChanges: { sleep: 5, dignity: -8 } }
      ] }
    ]
  },
  {
    id: "rest-bibliotheque-nuit",
    title: "La Biblioth\xE8que la Nuit",
    type: "narrative",
    image: "/assets/rest-bibliotheque-nuit-e4GzMrQe5jEJDeQou4BxEF.webp",
    description: "La biblioth\xE8que ferme. Mais la porte de derri\xE8re ne ferme pas bien...",
    choices: [
      { text: "Se cacher dans la biblioth\xE8que", risk: "risky", emoji: "\u{1F4DA}", outcomes: [
        { probability: 0.4, text: "Nuit parmi les livres. Vous lisez jusqu'\xE0 ce que les lignes se m\xE9langent, page 40.", statChanges: { sleep: 22, mental: 15 } },
        { probability: 0.6, text: "Le syst\xE8me d'alarme vous trahit. Le gardien arrive.", statChanges: { sleep: 5, dignity: -10, mental: -5 } }
      ] },
      { text: "Dormir dans le jardin de la biblioth\xE8que", risk: "safe", emoji: "\u{1F333}", outcomes: [
        { probability: 0.7, text: "Le jardin est calme et abrit\xE9. Vous dormez entre deux massifs, sur de la terre retourn\xE9e.", statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: "Les arroseurs automatiques se d\xE9clenchent \xE0 4h, dans l'ordre, en partant du plus loin.", statChanges: { sleep: 10, health: -3, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "rest-container",
    title: "Le Container Maritime",
    type: "discovery",
    image: "/assets/rest-container-BMckVJDeMBxYKECCiDfLup.webp",
    description: "Un container de chantier est ouvert. Sec, solide, \xE0 l'abri de tout.",
    choices: [
      { text: "Dormir dans le container", risk: "normal", emoji: "\u{1F4E6}", outcomes: [
        { probability: 0.6, text: "Le container est parfait : sec, silencieux, et assez grand pour s'allonger en entier.", statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.2, text: "Quelqu'un ferme le container pendant la nuit. Vous vous r\xE9veillez dans le noir complet, sans savoir l'heure.", statChanges: { sleep: 15, mental: -15 } },
        { probability: 0.2, text: "Le container sent le poisson. Au matin, vos v\xEAtements aussi, et \xE7a restera trois jours.", statChanges: { sleep: 12, mental: -5 } }
      ] },
      { text: "Utiliser le container comme abri de jour", risk: "safe", emoji: "\u2600\uFE0F", outcomes: [
        { probability: 0.8, text: "Parfait pour stocker vos affaires et vous reposer.", statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.2, text: "Le chantier reprend. Ouvriers surpris. Vous partez.", statChanges: { dignity: -5 } }
      ] }
    ]
  },
  {
    id: "rest-cabine-telephone",
    title: "La Cabine T\xE9l\xE9phonique",
    type: "narrative",
    image: "/assets/rest-cabine-telephone-oCcEKE3RxAKWGf5xrjeMLz.webp",
    description: "Une vieille cabine t\xE9l\xE9phonique. \xC9troite mais \xE0 l'abri du vent et de la pluie.",
    choices: [
      { text: "Dormir debout dans la cabine", risk: "safe", emoji: "\u{1F4DE}", outcomes: [
        { probability: 0.5, text: "Vous dormez debout comme un cheval, le front contre la vitre, et \xE7a marche.", statChanges: { sleep: 12, mental: -2 } },
        { probability: 0.5, text: "Impossible de dormir debout. Vous comptez les bus de nuit : il en passe onze.", statChanges: { sleep: 3, mental: -5 } }
      ] },
      { text: "S'asseoir par terre dans la cabine", risk: "safe", emoji: "\u{1FA91}", outcomes: [
        { probability: 0.7, text: "Recroquevill\xE9 mais au sec, les genoux contre la poitrine jusqu'au matin.", statChanges: { sleep: 15 } },
        { probability: 0.3, text: "Un ivrogne essaie d'utiliser le t\xE9l\xE9phone \xE0 3h et compose trois fois le m\xEAme faux num\xE9ro.", statChanges: { sleep: 8, mental: -3 } }
      ] }
    ]
  }
];
var TRAVEL_EVENTS = [
  {
    id: "travel-ruelle-sombre",
    title: "La Ruelle Sombre",
    type: "narrative",
    image: "/assets/travel-ruelle-sombre-kkju3xeeLBCHpbj63J2v27.webp",
    description: "Un raccourci par une ruelle sombre. \xC7a sent le danger... et les poubelles.",
    choices: [
      { text: "Prendre la ruelle", risk: "risky", emoji: "\u{1F311}", outcomes: [
        { probability: 0.4, text: "Raccourci efficace ! Vous trouvez m\xEAme 3\u20AC par terre.", statChanges: { mental: 3 }, moneyChange: 3 },
        { probability: 0.3, text: "Cul-de-sac. Un mur, trois poubelles, et un chat qui vous regarde faire demi-tour.", statChanges: { sleep: -3, mental: -3 } },
        { probability: 0.3, text: 'Un type louche vous barre le passage. "La bourse ou la vie !"', statChanges: { health: -5, dignity: -5, mental: -5 }, moneyChange: -5 }
      ] },
      { text: "Contourner par la rue principale", risk: "safe", emoji: "\u{1F6E4}\uFE0F", outcomes: [
        { probability: 1, text: "Plus long mais plus s\xFBr. Vous profitez des vitrines.", statChanges: { mental: 2 } }
      ] },
      { text: "Traverser t\xEAte haute, on vous conna\xEEt ici", risk: "safe", emoji: "\u{1F451}", requirements: { respect: 30 }, outcomes: [
        { probability: 0.7, text: `Le type louche vous reconna\xEEt et baisse les yeux. "Ah, c'est toi\u2026 passe, passe." On ne touche pas \xE0 une l\xE9gende de la rue.`, statChanges: { mental: 8, dignity: 5 }, respectChange: 1 },
        { probability: 0.3, text: `Un jeune vous salue d'un signe de t\xEAte respectueux et vous glisse 4\u20AC. "Pour la route, chef."`, statChanges: { mental: 6 }, moneyChange: 4 }
      ] }
    ]
  },
  {
    id: "travel-tunnel-metro",
    title: "Le Tunnel de M\xE9tro",
    type: "narrative",
    image: "/assets/travel-tunnel-metro-8zaoahxSXU8Wrt9wxJGRRX.webp",
    description: "Un tunnel de m\xE9tro d\xE9saffect\xE9. Sombre, humide, mais c'est un raccourci.",
    choices: [
      { text: "Traverser le tunnel", risk: "risky", emoji: "\u{1F687}", outcomes: [
        { probability: 0.3, text: "Vous traversez sans encombre, en marchant au milieu, l\xE0 o\xF9 la lumi\xE8re porte encore.", statChanges: { mental: -2 } },
        { probability: 0.4, text: "Des rats ! Des centaines de rats ! Vous courez.", statChanges: { health: -3, mental: -8, sleep: -3 } },
        { probability: 0.3, text: "Vous trouvez un ancien campement avec des conserves.", statChanges: { hunger: 10, mental: 3 } }
      ] },
      { text: "Prendre le m\xE9tro normalement (si vous avez l'argent)", risk: "normal", emoji: "\u{1F3AB}", outcomes: [
        { probability: 0.6, text: "Trajet confortable. Presque comme un citoyen normal.", statChanges: { mental: 5, dignity: 3 } },
        { probability: 0.4, text: "Contr\xF4le. Pas de ticket, pas d'adresse \xE0 donner, 5\u20AC d'amende quand m\xEAme.", statChanges: { dignity: -10, mental: -5 }, moneyChange: -5 }
      ] }
    ]
  },
  {
    id: "travel-parc-nuit",
    title: "Le Parc la Nuit",
    type: "narrative",
    image: "/assets/travel-parc-nuit-HKdnTyPJxjUGL9aq8yv6ym.webp",
    description: "Traverser le parc de nuit. Les lampadaires sont en panne.",
    choices: [
      { text: "Traverser dans le noir", risk: "normal", emoji: "\u{1F319}", outcomes: [
        { probability: 0.5, text: "Travers\xE9e sans encombre. Les \xE9toiles guident vos pas.", statChanges: { mental: 5 } },
        { probability: 0.3, text: "Vous tr\xE9buchez sur une racine et vous relevez avec le genou ouvert et de la terre dans la plaie.", statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: "Un hibou hulule. Vous sursautez et tombez dans un buisson.", statChanges: { health: -2, dignity: -3 } }
      ] },
      { text: "Faire le tour par les rues \xE9clair\xE9es", risk: "safe", emoji: "\u{1F4A1}", outcomes: [
        { probability: 1, text: "Plus long mais vous arrivez entier.", statChanges: { sleep: -3 } }
      ] }
    ]
  },
  {
    id: "travel-pont-autoroute",
    title: "Le Pont de l'Autoroute",
    type: "narrative",
    image: "/assets/travel-pont-autoroute-Kp7ZJJXx5GyopiPDDNjVhC.webp",
    description: "Le pont au-dessus de l'autoroute. Bruyant, venteux, mais c'est le chemin le plus court.",
    choices: [
      { text: "Traverser le pont", risk: "safe", emoji: "\u{1F309}", outcomes: [
        { probability: 0.7, text: "Le vent est violent mais vous tenez bon. D'ici on voit les deux bouts de la ville en m\xEAme temps.", statChanges: { mental: 3 } },
        { probability: 0.3, text: "Le vent emporte votre chapeau (si vous en avez un) et le fait rouler jusqu'au caniveau d'en face.", statChanges: { mental: -3, dignity: -2 } }
      ] },
      { text: "Passer sous le pont", risk: "normal", emoji: "\u{1F3D7}\uFE0F", outcomes: [
        { probability: 0.5, text: "Sous le pont, d'autres SDF ont un feu. Ils partagent leur soupe.", statChanges: { hunger: 10, mental: 8, thirst: 5 } },
        { probability: 0.5, text: `"C'est notre territoire." Pas les bienvenus.`, statChanges: { mental: -5, dignity: -3 } }
      ] }
    ]
  },
  {
    id: "travel-marche-matin",
    title: "Le March\xE9 du Matin",
    type: "discovery",
    image: "/assets/travel-marche-matin-UBjudamtA3vaA6pmwtFA3V.webp",
    description: "Le march\xE9 s'installe. Les commer\xE7ants d\xE9chargent leurs camions.",
    choices: [
      { text: "Aider \xE0 d\xE9charger", risk: "normal", emoji: "\u{1F4AA}", outcomes: [
        { probability: 0.6, text: "Un mara\xEEcher vous paie 4\u20AC et vous donne des fruits ab\xEEm\xE9s.", statChanges: { hunger: 15, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.4, text: `"On n'a pas besoin d'aide." Mais vous chapardez une pomme.`, statChanges: { hunger: 5, dignity: -3 } }
      ] },
      { text: "R\xE9cup\xE9rer les fruits tomb\xE9s", risk: "safe", emoji: "\u{1F34E}", outcomes: [
        { probability: 0.7, text: "Pommes, oranges, une banane. Petit d\xE9jeuner gratuit !", statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: 'Un commer\xE7ant vous crie dessus. "Touche pas \xE0 ma marchandise !"', statChanges: { dignity: -5, mental: -3 } }
      ] }
    ]
  },
  {
    id: "travel-gare-routiere",
    title: "La Gare Routi\xE8re",
    type: "narrative",
    image: "/assets/travel-gare-routiere-DaYuWGLLqaQsSrZHHQEV8Z.webp",
    description: "La gare routi\xE8re est anim\xE9e. Des bus partent vers d'autres villes.",
    choices: [
      { text: "Monter dans un bus sans payer", risk: "risky", emoji: "\u{1F68C}", outcomes: [
        { probability: 0.3, text: "Vous vous faufilez par la porte du milieu et vous asseyez au fond, pr\xE8s du radiateur.", statChanges: { mental: 5, sleep: 5 } },
        { probability: 0.7, text: `Le chauffeur vous rep\xE8re. "Descends ou j'appelle les flics."`, statChanges: { dignity: -10, mental: -5 } }
      ] },
      { text: "Attendre dans la salle d'attente chauff\xE9e", risk: "safe", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.8, text: "Deux heures au chaud, des toilettes gratuites, et un fauteuil dont personne ne veut.", statChanges: { sleep: 8, thirst: 5, dignity: 3 } },
        { probability: 0.2, text: "Un agent vous demande votre billet. Pas de billet, pas de salle.", statChanges: { dignity: -5 } }
      ] }
    ]
  },
  {
    id: "travel-velo-trouve",
    title: "Le V\xE9lo Trouv\xE9",
    type: "discovery",
    image: "/assets/travel-velo-trouve-Rp3Mv8FMSxvhqiT2kp8SeL.webp",
    description: "Un v\xE9lo sans antivol est pos\xE9 contre un mur, la selle encore chaude.",
    choices: [
      { text: "Emprunter le v\xE9lo", risk: "risky", emoji: "\u{1F6B2}", outcomes: [
        { probability: 0.4, text: "Vous p\xE9dalez \xE0 toute vitesse. Le d\xE9railleur saute \xE0 chaque bosse mais la cha\xEEne tient.", statChanges: { mental: 8, sleep: -2 } },
        { probability: 0.6, text: 'Le propri\xE9taire vous court apr\xE8s. "Mon v\xE9lo !" Vous le rendez, essouffl\xE9.', statChanges: { dignity: -10, mental: -5, sleep: -5 } }
      ] },
      { text: "Le laisser et marcher", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "L'honn\xEAtet\xE9, c'est tout ce qui vous reste. Vous marchez la t\xEAte haute.", statChanges: { dignity: 3, mental: 3 } }
      ] }
    ]
  },
  {
    id: "travel-chantier-nuit",
    title: "Le Chantier de Nuit",
    type: "narrative",
    image: "/assets/travel-chantier-nuit-gB3qPEuPg6F49zbknTKjeU.webp",
    description: "Un chantier de construction. La nuit, personne ne surveille.",
    choices: [
      { text: "Traverser le chantier", risk: "normal", emoji: "\u{1F3D7}\uFE0F", outcomes: [
        { probability: 0.5, text: "Raccourci efficace. Vous trouvez un casque de chantier.", statChanges: { mental: 3 } },
        { probability: 0.3, text: "Vous vous prenez les pieds dans un c\xE2ble et vous \xE9talez de tout votre long, devant t\xE9moins.", statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: `Le gardien de nuit ! "H\xE9 ! Qu'est-ce que vous faites l\xE0 ?!"`, statChanges: { dignity: -5, mental: -5 } }
      ] },
      { text: "Contourner le chantier", risk: "safe", emoji: "\u{1F504}", outcomes: [
        { probability: 1, text: "Le d\xE9tour ajoute 15 minutes mais vous \xEAtes en s\xE9curit\xE9.", statChanges: { sleep: -2 } }
      ] }
    ]
  },
  {
    id: "travel-riviere",
    title: "La Rivi\xE8re",
    type: "narrative",
    image: "/assets/travel-riviere-73CPTDVdUhEB8JSCGFD5xk.webp",
    description: "La rivi\xE8re coupe votre chemin. Le pont est \xE0 500m, mais vous pourriez traverser \xE0 gu\xE9.",
    choices: [
      { text: "Traverser \xE0 gu\xE9", risk: "risky", emoji: "\u{1F30A}", outcomes: [
        { probability: 0.3, text: "L'eau est peu profonde ! Vous traversez les pieds mouill\xE9s mais rapidement.", statChanges: { health: -2, mental: 3 } },
        { probability: 0.4, text: "Plus profond que pr\xE9vu ! Vous \xEAtes tremp\xE9 jusqu'\xE0 la taille.", statChanges: { health: -5, dignity: -5 } },
        { probability: 0.3, text: "Le courant est fort. Vous manquez de tomber et vous rattrapez \xE0 une barre couverte de mousse.", statChanges: { health: -8, mental: -8 } }
      ] },
      { text: "Prendre le pont", risk: "safe", emoji: "\u{1F309}", outcomes: [
        { probability: 1, text: "Le pont est s\xFBr. Vous regardez l'eau passer dessous jusqu'\xE0 ne plus savoir depuis combien de temps.", statChanges: { mental: 3 } }
      ] }
    ]
  },
  {
    id: "travel-tramway",
    title: "Le Tramway",
    type: "narrative",
    image: "/assets/travel-tramway-RwMPRjHnfokerBZDaByMA9.webp",
    description: "Le tramway passe. Vous pourriez monter sans payer...",
    choices: [
      { text: "Monter sans ticket", risk: "risky", emoji: "\u{1F68A}", outcomes: [
        { probability: 0.5, text: "Trajet tranquille. Le contr\xF4leur monte \xE0 l'avant, regarde le wagon, et redescend.", statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.5, text: 'Contr\xF4le ! "Votre titre de transport ?" Amende de 5\u20AC.', statChanges: { dignity: -8, mental: -5 }, moneyChange: -5 }
      ] },
      { text: "Marcher le long des rails", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 0.8, text: "Balade agr\xE9able le long des rails. Vous arrivez \xE0 destination.", statChanges: { mental: 3 } },
        { probability: 0.2, text: "Vous vous perdez. Le tramway ne va pas o\xF9 vous pensiez.", statChanges: { mental: -3, sleep: -3 } }
      ] }
    ]
  },
  {
    id: "travel-skateboard",
    title: "Le Skateboard Trouv\xE9",
    type: "discovery",
    image: "/assets/travel-skateboard-jb8FwsquDYya2TAppoZNmo.webp",
    description: "Un skateboard abandonn\xE9 sur le trottoir. Les roues tournent encore.",
    choices: [
      { text: "Utiliser le skateboard", risk: "normal", emoji: "\u{1F6F9}", outcomes: [
        { probability: 0.5, text: "Vous roulez. C'est plus rapide que marcher, et chaque joint de trottoir vous remonte dans les dents.", statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: "Vous tombez apr\xE8s 50 m\xE8tres. Vos genoux s'en souviennent.", statChanges: { health: -5, dignity: -5 } }
      ] },
      { text: "Le vendre", risk: "safe", emoji: "\u{1F4B0}", outcomes: [
        { probability: 0.6, text: "Un ado vous l'ach\xE8te 5\u20AC, en comptant sa monnaie deux fois pour \xEAtre s\xFBr d'avoir assez.", statChanges: { mental: 3 }, moneyChange: 5 },
        { probability: 0.4, text: "Personne n'en veut. Vous le laissez.", statChanges: { mental: -1 } }
      ] }
    ]
  },
  {
    id: "travel-egout",
    title: "Les \xC9gouts",
    type: "narrative",
    image: "/assets/travel-egout-EaEg5VZENML2osawgbXA7E.webp",
    description: "Une bouche d'\xE9gout ouverte. Le raccourci ultime... si vous supportez l'odeur.",
    choices: [
      { text: "Descendre dans les \xE9gouts", risk: "risky", emoji: "\u{1F573}\uFE0F", outcomes: [
        { probability: 0.3, text: "Vous traversez rapidement. L'odeur est atroce mais c'est efficace.", statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.4, text: "Vous vous perdez dans le labyrinthe souterrain. 2h de marche.", statChanges: { sleep: -8, mental: -8, dignity: -5 } },
        { probability: 0.3, text: "Vous trouvez un passage secret vers une cave de restaurant !", statChanges: { hunger: 15, mental: 5 } }
      ] },
      { text: "Rester en surface", risk: "safe", emoji: "\u2600\uFE0F", outcomes: [
        { probability: 1, text: "Vous gardez votre dignit\xE9 et vos narines intactes.", statChanges: { mental: 2, dignity: 2 } }
      ] }
    ]
  },
  {
    id: "travel-bus-nuit",
    title: "Le Bus de Nuit",
    type: "narrative",
    image: "/assets/travel-bus-nuit-QnRsg4teZWjpTKm79GJXx3.webp",
    description: "Le bus de nuit passe, dernier service, avec trois passagers qui dorment tous.",
    choices: [
      { text: "Monter et faire semblant de dormir", risk: "normal", emoji: "\u{1F68C}", outcomes: [
        { probability: 0.6, text: "Le chauffeur ne dit rien. Vous faites l'aller-retour au chaud.", statChanges: { sleep: 10, mental: 5 } },
        { probability: 0.4, text: '"Terminus ! Tout le monde descend !" Trajet trop court.', statChanges: { sleep: 5 } }
      ] },
      { text: "Demander au chauffeur de vous d\xE9poser", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 0.5, text: '"Allez, monte." Le chauffeur ne regarde pas la machine \xE0 tickets et remet le bus en route.', statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: '"Pas de ticket, pas de bus." Strict mais juste.', statChanges: { mental: -3 } }
      ] }
    ]
  }
];
var FOLLOW_UP_EVENTS = {
  "exp-jardin-communautaire-suite": {
    id: "exp-jardin-communautaire-suite",
    title: "Le Retour au Jardin",
    type: "social",
    image: "/assets/exp-jardin-communautaire-3JrXyisaVTMS5u7ATazzZ7.webp",
    isFollowUp: true,
    requiresFlag: "ami-jardinier",
    description: `Le vieux jardinier vous attendait ! "Ah, te revoil\xE0 ! J'ai quelque chose pour toi."`,
    choices: [
      { text: "Accepter son cadeau", risk: "safe", emoji: "\u{1F381}", outcomes: [
        { probability: 0.8, text: 'Il vous donne un panier de l\xE9gumes et vous apprend \xE0 faire pousser des tomates. "Reviens quand tu veux, petit."', statChanges: { hunger: 25, mental: 15, dignity: 8 }, respectChange: 3, addFlag: "jardinier-mentor" },
        { probability: 0.2, text: 'Il vous donne des graines. "Plante \xE7a quelque part. \xC7a te donnera un but."', statChanges: { mental: 10 }, itemGain: { id: "graines-tomate", name: "Graines de tomate", emoji: "\u{1F345}", type: "tool", value: 5 } }
      ] },
      { text: "Proposer de travailler r\xE9guli\xE8rement", risk: "safe", emoji: "\u{1F4AA}", outcomes: [
        { probability: 1, text: "Il accepte : jardinier b\xE9n\xE9vole, sans contrat, avec le repas de midi pris sur la table du fond.", statChanges: { hunger: 20, mental: 12, dignity: 10 }, respectChange: 5, addFlag: "emploi-jardin" }
      ] }
    ]
  },
  "exp-vieille-dame-suite": {
    id: "exp-vieille-dame-suite",
    title: "La Grand-M\xE8re Reconnaissante",
    type: "social",
    image: "/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp",
    isFollowUp: true,
    requiresFlag: "hero-enfant",
    description: `Une vieille dame vous interpelle. "C'est vous qui avez aid\xE9 mon petit-fils ! Je vous ai cherch\xE9 partout !"`,
    choices: [
      { text: "Accepter sa gratitude", risk: "safe", emoji: "\u{1F917}", outcomes: [
        { probability: 0.7, text: "Elle vous invite chez elle pour un repas chaud. Soupe, pain, fromage, et un lit pour la nuit. Vous pleurez de gratitude.", statChanges: { hunger: 30, thirst: 20, sleep: 25, mental: 20, dignity: 10 }, moneyChange: 10, respectChange: 5 },
        { probability: 0.3, text: `Elle vous donne 20\u20AC et l'adresse d'un foyer. "Prenez soin de vous."`, moneyChange: 20, statChanges: { mental: 15, dignity: 8 }, respectChange: 3 }
      ] }
    ]
  },
  "exp-pecheur-suite": {
    id: "exp-pecheur-suite",
    title: "La Partie de P\xEAche",
    type: "social",
    image: "/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp",
    isFollowUp: true,
    requiresFlag: "ami-pecheur",
    description: `Le p\xEAcheur du canal vous fait signe. "H\xE9 ! J'ai apport\xE9 une canne pour toi !"`,
    choices: [
      { text: "P\xEAcher ensemble", risk: "safe", emoji: "\u{1F3A3}", outcomes: [
        { probability: 0.6, text: "Vous attrapez 3 poissons. Le p\xEAcheur vous montre comment les vider avec le pouce, puis les cuire \xE0 m\xEAme la braise.", statChanges: { hunger: 25, mental: 15, dignity: 5 }, respectChange: 3 },
        { probability: 0.4, text: 'Bredouille, mais le p\xEAcheur partage sa prise. "La prochaine fois, tu auras plus de chance."', statChanges: { hunger: 15, mental: 10 }, respectChange: 2 }
      ] }
    ]
  },
  "exp-brocante-suite": {
    id: "exp-brocante-suite",
    title: "Le Tr\xE9sor du Brocanteur",
    type: "discovery",
    image: "/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp",
    isFollowUp: true,
    requiresFlag: "ami-brocanteur",
    description: `Le brocanteur vous appelle. "J'ai trouv\xE9 un truc qui pourrait t'int\xE9resser !"`,
    choices: [
      { text: "Voir ce qu'il a trouv\xE9", risk: "safe", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.5, text: `Un vieux smartphone qui marche encore ! "Cadeau. T'as \xE9t\xE9 r\xE9glo avec moi."`, statChanges: { mental: 15, dignity: 8 }, itemGain: { id: "smartphone", name: "Vieux smartphone", emoji: "\u{1F4F1}", type: "special", value: 25 }, respectChange: 3 },
        { probability: 0.5, text: `Un manteau d'hiver en bon \xE9tat. "\xC7a va te tenir chaud."`, statChanges: { health: 5, mental: 10, dignity: 8 }, itemGain: { id: "manteau-hiver", name: "Manteau d'hiver", emoji: "\u{1F9E5}", type: "armor", value: 20, defenseBonus: 3 } }
      ] }
    ]
  },
  "exp-musicien-suite": {
    id: "exp-musicien-suite",
    title: "Le Duo Musical",
    type: "social",
    image: "/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp",
    isFollowUp: true,
    requiresFlag: "ami-musicien",
    description: `Le musicien du m\xE9tro vous reconna\xEEt ! "H\xE9 ! On refait un duo ? J'ai gagn\xE9 le double la derni\xE8re fois !"`,
    choices: [
      { text: "Former un duo r\xE9gulier", risk: "safe", emoji: "\u{1F3B5}", outcomes: [
        { probability: 0.7, text: "Votre duo fait sensation ! Les passagers adorent. 12\u20AC partag\xE9s et une standing ovation.", moneyChange: 12, statChanges: { mental: 15, dignity: 10 }, respectChange: 5 },
        { probability: 0.3, text: 'Journ\xE9e calme, peu de monde. 4\u20AC quand m\xEAme. "On se refait \xE7a demain ?"', moneyChange: 4, statChanges: { mental: 8, dignity: 5 }, respectChange: 2 }
      ] }
    ]
  },
  "exp-dechetterie-suite": {
    id: "exp-dechetterie-suite",
    title: "Le Roi de la R\xE9cup",
    type: "discovery",
    image: "/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp",
    isFollowUp: true,
    requiresFlag: "roi-dechetterie",
    description: `Vous retournez \xE0 la d\xE9chetterie. Le gardien vous fait signe. "J'ai mis des trucs de c\xF4t\xE9 pour toi !"`,
    choices: [
      { text: "Voir la s\xE9lection", risk: "safe", emoji: "\u{1F381}", outcomes: [
        { probability: 0.6, text: "Un v\xE9lo r\xE9parable, des v\xEAtements propres, et un r\xE9chaud de camping avec une cartouche \xE0 moiti\xE9 pleine.", statChanges: { mental: 15, dignity: 10 }, itemGain: { id: "rechaud", name: "R\xE9chaud de camping", emoji: "\u{1F525}", type: "tool", value: 15 }, respectChange: 3 },
        { probability: 0.4, text: "Des livres, une lampe torche, et un sac \xE0 dos. \xC9quipement de survie !", statChanges: { mental: 10, dignity: 5 }, itemGain: { id: "sac-dos", name: "Sac \xE0 dos", emoji: "\u{1F392}", type: "tool", value: 12 }, respectChange: 2 }
      ] }
    ]
  },
  "exp-chat-revient": {
    id: "exp-chat-revient",
    title: "Le Retour du Chat",
    type: "social",
    image: "/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp",
    isFollowUp: true,
    requiresFlag: "chat-compagnon",
    description: "Le chat que vous avez sauv\xE9 revient ! Il porte quelque chose dans sa gueule...",
    choices: [
      { text: "Voir ce qu'il apporte", risk: "safe", emoji: "\u{1F431}", outcomes: [
        { probability: 0.5, text: "Un billet de 5\u20AC ! Le chat l'a trouv\xE9 quelque part. Meilleur investissement de votre vie.", moneyChange: 5, statChanges: { mental: 12 } },
        { probability: 0.3, text: "Un oiseau mort. C'est... un cadeau ? Le chat ronronne fi\xE8rement.", statChanges: { mental: 5, dignity: -3 } },
        { probability: 0.2, text: "Une souris vivante. Le chat la l\xE2che sur vos genoux et s'assoit pour regarder ce que vous allez en faire.", statChanges: { mental: -3, health: -1 } }
      ] }
    ]
  },
  "exp-foyer-accueil": {
    id: "exp-foyer-accueil",
    title: "Le Foyer d'Accueil",
    type: "social",
    image: "/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp",
    isFollowUp: true,
    requiresFlag: "aide-mairie",
    description: "Gr\xE2ce aux informations de la mairie, vous trouvez un foyer d'accueil. La porte est ouverte.",
    choices: [
      { text: "Entrer et demander de l'aide", risk: "safe", emoji: "\u{1F3E0}", outcomes: [
        { probability: 0.8, text: "Douche chaude, repas complet, lit propre. Vous dormez dix heures et vous r\xE9veillez sans savoir o\xF9 vous \xEAtes.", statChanges: { health: 15, hunger: 30, thirst: 25, sleep: 30, mental: 20, dignity: 15 }, respectChange: 3 },
        { probability: 0.2, text: "Le foyer est complet. Mais ils vous donnent un sandwich et l'adresse d'un autre foyer.", statChanges: { hunger: 12, mental: 5 } }
      ] }
    ]
  },
  // ---- Suites des « graines narratives » longtemps orphelines : chaque flag
  // posé par un événement trouve enfin son « plus tard ». Les one-shot
  // consomment leur flag (removeFlag), les rituels le gardent. ----
  "exp-velo-suite": {
    id: "exp-velo-suite",
    title: "L'Offre pour le V\xE9lo",
    type: "social",
    image: "/assets/followup-velo.webp",
    isFollowUp: true,
    requiresFlag: "a-velo",
    description: 'Un \xE9tudiant lorgne votre v\xE9lo rafistol\xE9 au fil de fer. "Il roule ? Je vous en donne quelque chose !"',
    choices: [
      { text: "Vendre le v\xE9lo", risk: "safe", emoji: "\u{1F4B6}", outcomes: [
        { probability: 0.7, text: "March\xE9 conclu : 8\u20AC. Il repart en zigzaguant, les freins, c'\xE9tait en option.", moneyChange: 8, statChanges: { mental: -3 }, removeFlag: "a-velo" },
        { probability: 0.3, text: "Il n\xE9gocie dur : 5\u20AC. Vous c\xE9dez. Le fil de fer, \xE7a n'a pas de prix. Enfin si : 5\u20AC.", moneyChange: 5, statChanges: { mental: -3 }, removeFlag: "a-velo" }
      ] },
      { text: "Refuser, ce v\xE9lo, c'est la libert\xE9", risk: "safe", emoji: "\u{1F6B2}", outcomes: [
        { probability: 1, text: "Il hausse les \xE9paules et s'en va. Vous caressez le guidon. Vous, au moins, vous vous comprenez.", statChanges: { mental: 6, dignity: 3 } }
      ] }
    ]
  },
  "exp-eglise-suite": {
    id: "exp-eglise-suite",
    title: "La Soupe du Cur\xE9",
    type: "social",
    image: "/assets/followup-eglise.webp",
    isFollowUp: true,
    requiresFlag: "aide-eglise",
    description: 'Le pr\xEAtre vous reconna\xEEt sur le parvis. "Notre ami ! La soupe est chaude, entrez donc."',
    choices: [
      { text: "Accepter la soupe", risk: "safe", emoji: "\u{1F372}", outcomes: [
        { probability: 0.7, text: "Soupe \xE9paisse, pain frais, banc au chaud. Le cur\xE9 ne demande rien en \xE9change. \xC7a repose.", statChanges: { hunger: 18, thirst: 8, mental: 8 } },
        { probability: 0.3, text: "La soupe est claire comme l'eau b\xE9nite, mais la compagnie r\xE9chauffe.", statChanges: { hunger: 8, mental: 6 } }
      ] },
      { text: "Aider \xE0 servir d'abord", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 1, text: "Vous servez les autres avant de vous servir. Le cur\xE9 vous glisse une part double et un clin d'\u0153il.", statChanges: { hunger: 22, mental: 10, dignity: 8 }, respectChange: 2 }
      ] }
    ]
  },
  "exp-gardien-suite": {
    id: "exp-gardien-suite",
    title: "Le Caf\xE9 du Gardien",
    type: "social",
    image: "/assets/followup-gardien.webp",
    isFollowUp: true,
    requiresFlag: "ami-gardien-dechetterie",
    description: `Le gardien de la d\xE9chetterie vous h\xE8le depuis sa gu\xE9rite. "Pause caf\xE9 ? J'ai un truc \xE0 te montrer, aussi."`,
    choices: [
      { text: "Partager le caf\xE9", risk: "safe", emoji: "\u2615", outcomes: [
        { probability: 0.6, text: "Caf\xE9 br\xFBlant, biscuits mous, et une radio en \xE9tat de marche \xAB tomb\xE9e du camion \xBB qui ne capte qu'une station.", statChanges: { thirst: 12, mental: 10 }, itemGain: { id: "radio-guerite", name: "Radio de gu\xE9rite", emoji: "\u{1F4FB}", type: "junk", value: 8 }, removeFlag: "ami-gardien-dechetterie" },
        { probability: 0.4, text: "Le caf\xE9 est infect mais l'amiti\xE9 sinc\xE8re. Il vous garde une place au chaud pour les jours de pluie.", statChanges: { thirst: 8, mental: 12 }, removeFlag: "ami-gardien-dechetterie" }
      ] }
    ]
  },
  "exp-toit-suite": {
    id: "exp-toit-suite",
    title: "Votre Toit",
    type: "discovery",
    image: "/assets/followup-toit.webp",
    isFollowUp: true,
    requiresFlag: "camp-toit",
    description: "Votre planque sur le toit vous attend. La ville scintille en carton, et personne ne sait que vous \xEAtes l\xE0.",
    choices: [
      { text: "Y passer la nuit", risk: "normal", emoji: "\u{1F303}", outcomes: [
        { probability: 0.75, text: "Nuit \xE9toil\xE9e au-dessus du vacarme. Vous dormez comme un roi, du carton, mais un roi.", statChanges: { sleep: 20, mental: 12 } },
        { probability: 0.25, text: "Le concierge fait sa ronde. Vous d\xE9valez l'escalier de service et ressortez par la cour, deux \xE9tages plus bas.", statChanges: { mental: -5, sleep: -3 }, removeFlag: "camp-toit" }
      ] },
      { text: "Juste souffler dix minutes", risk: "safe", emoji: "\u{1F307}", outcomes: [
        { probability: 1, text: "Dix minutes de silence au-dessus de la ville. \xC7a ne r\xE9pare rien, mais \xE7a recolle les morceaux.", statChanges: { mental: 8 } }
      ] }
    ]
  },
  "exp-emploi-jardin-suite": {
    id: "exp-emploi-jardin-suite",
    title: "Journ\xE9e au Jardin",
    type: "social",
    image: "/assets/followup-emploi-jardin.webp",
    isFollowUp: true,
    requiresFlag: "emploi-jardin",
    description: `"T'es en retard," grogne le vieux jardinier en vous tendant une b\xEAche. Votre \xAB emploi \xBB vous attend.`,
    choices: [
      { text: "Travailler dur", risk: "safe", emoji: "\u{1F4AA}", outcomes: [
        { probability: 0.7, text: "Une matin\xE9e \xE0 biner, un repas chaud, et quelques pi\xE8ces \xAB pour le d\xE9rangement \xBB.", statChanges: { hunger: 15, mental: 8, dignity: 6 }, moneyChange: 4 },
        { probability: 0.3, text: "Le dos proteste, mais le potager est superbe. Le jardinier vous paie en l\xE9gumes.", statChanges: { hunger: 18, health: -3, dignity: 5 } }
      ] },
      { text: "Travailler mollement", risk: "normal", emoji: "\u{1F9A5}", outcomes: [
        { probability: 0.6, text: "Il fait semblant de ne pas voir. Repas quand m\xEAme, mais pas de pi\xE8ces.", statChanges: { hunger: 10, mental: 4 } },
        { probability: 0.4, text: `"Si c'est comme \xE7a, reviens quand tu seras motiv\xE9." Vexant. Juste, mais vexant.`, statChanges: { mental: -4, dignity: -3 } }
      ] }
    ]
  },
  "exp-mentor-suite": {
    id: "exp-mentor-suite",
    title: "Vos Tomates",
    type: "discovery",
    image: "/assets/followup-tomates.webp",
    isFollowUp: true,
    requiresFlag: "jardinier-mentor",
    description: "Le coin de terre que le vieux vous a appris \xE0 cultiver a bien travaill\xE9 : des tomates. Des vraies. Les v\xF4tres.",
    choices: [
      { text: "R\xE9colter fi\xE8rement", risk: "safe", emoji: "\u{1F345}", outcomes: [
        { probability: 0.8, text: "Trois tomates parfaites. Vous en mangez une sur place, ti\xE8de de soleil. Vous avez FAIT quelque chose.", statChanges: { hunger: 14, mental: 14, dignity: 6 } },
        { probability: 0.2, text: "Les pigeons sont pass\xE9s avant vous. Il reste une demi-tomate, becquet\xE9e du c\xF4t\xE9 m\xFBr.", statChanges: { hunger: 4, mental: -4 } }
      ] },
      { text: "En offrir au jardinier", risk: "safe", emoji: "\u{1F381}", outcomes: [
        { probability: 1, text: `"Pas mal, gamin." Venant de lui, c'est une m\xE9daille. Vous partagez le d\xE9jeuner.`, statChanges: { hunger: 12, mental: 10 }, respectChange: 3 }
      ] }
    ]
  },
  "exp-magasin-suite": {
    id: "exp-magasin-suite",
    title: "La Porte de Derri\xE8re",
    type: "narrative",
    image: "/assets/followup-magasin.webp",
    isFollowUp: true,
    requiresFlag: "magasin-repere",
    description: "Le magasin abandonn\xE9, la porte arri\xE8re entrouverte. Vous l'aviez not\xE9e \xAB pour plus tard \xBB. Plus tard, c'est maintenant.",
    choices: [
      { text: "Entrer discr\xE8tement", risk: "risky", emoji: "\u{1F6AA}", outcomes: [
        { probability: 0.5, text: "\xC0 l'int\xE9rieur : des invendus oubli\xE9s ! Vous repartez charg\xE9 comme un mulet.", moneyChange: 10, statChanges: { dignity: -4 }, itemGain: { id: "carton-invendus", name: "Carton d'invendus", emoji: "\u{1F4E6}", type: "food", value: 8, effect: { hunger: 20 } }, removeFlag: "magasin-repere" },
        { probability: 0.3, text: "Rien que de la poussi\xE8re et des mannequins qui vous jugent. Vous repartez bredouille et vaguement humili\xE9.", statChanges: { mental: -4 }, removeFlag: "magasin-repere" },
        { probability: 0.2, text: "Une alarme oubli\xE9e hurle ! Vous fuyez ventre \xE0 terre, poursuivi par le fant\xF4me du commerce de proximit\xE9.", statChanges: { mental: -8, dignity: -6, health: -4 }, respectChange: -2, removeFlag: "magasin-repere" }
      ] },
      { text: "Renoncer, trop risqu\xE9", risk: "safe", emoji: "\u{1F6B6}", outcomes: [
        { probability: 1, text: "Vous passez votre chemin. La porte restera un \xAB et si \xBB de plus dans votre collection.", statChanges: { mental: -2 }, removeFlag: "magasin-repere" }
      ] }
    ]
  }
};
var SURSAUT_EVENT = {
  id: "sursaut",
  title: "Le Sursaut",
  type: "narrative",
  image: "/assets/sursaut.webp",
  description: "Au bord du gouffre, quelque chose remonte : un souvenir, un visage, une promesse. Vous vous rappelez pourquoi vous tenez encore debout.",
  choices: [
    { text: "S'accrocher au souvenir", risk: "safe", emoji: "\u{1F4AB}", outcomes: [
      { probability: 1, text: "Le souvenir br\xFBle comme un petit feu int\xE9rieur. Pas aujourd'hui. Pas comme \xE7a.", statChanges: { mental: 18, health: 8, dignity: 5 }, addFlag: "sursaut-vu" }
    ] },
    { text: "Pleurer un bon coup", risk: "safe", emoji: "\u{1F62D}", outcomes: [
      { probability: 1, text: "\xC7a vide, et \xE7a lave. Vous vous relevez plus l\xE9ger, \xE9trangement.", statChanges: { mental: 14, sleep: 6 }, addFlag: "sursaut-vu" }
    ] }
  ]
};
function dueSursaut(c) {
  return (c.stats.health < 12 || c.stats.mental < 12) && c.stats.health > 0 && c.stats.mental > 0 && !c.activeFlags.includes("sursaut-vu");
}
EXPLORE_EVENTS.push(...EXPLORE_EVENTS_2);
REST_EVENTS.push(...REST_EVENTS_2);
BEG_EVENTS.push(...BEG_EVENTS_2);
STEAL_EVENTS.push(...STEAL_EVENTS_2);
TRAVEL_EVENTS.push(...TRAVEL_EVENTS_2);
Object.assign(FOLLOW_UP_EVENTS, FOLLOW_UP_EVENTS_2);
var RECENT_MEMORY = 12;
function freshPool(pool, recent) {
  if (!recent || recent.length === 0) return pool;
  const fresh = pool.filter((e) => !recent.includes(e.id));
  return fresh.length >= Math.min(3, pool.length) ? fresh : pool;
}
function rememberEvent(recent, id) {
  return [...recent || [], id].slice(-RECENT_MEMORY);
}
function makeGhostEvent(grave) {
  const n = grave.name;
  const templates = [
    {
      id: "ghost-banc",
      title: L(`Le Banc de ${n}`, `${n}'s Bench`),
      type: "discovery",
      isFollowUp: true,
      image: "/assets/ghost-banc.webp",
      description: L(`Vous reconnaissez ce banc : c'est l\xE0 que dormait ${n}, avant. Quelqu'un y a grav\xE9 ses initiales.`, `You know this bench: it's where ${n} used to sleep. Someone carved their initials into it.`),
      choices: [
        { text: L("S'y reposer un moment", "Rest there a while"), risk: "safe", emoji: "\u{1FA91}", outcomes: [
          { probability: 0.7, text: L(`Le coin est bon, ${n} savait choisir. Vous repartez apais\xE9, et vous trouvez une pi\xE8ce sous une latte.`, `A good spot, ${n} knew how to pick them. You leave calmer, and find a coin under a slat.`), statChanges: { mental: 8, sleep: 6 }, moneyChange: 1 },
          { probability: 0.3, text: L("Un moment de paix. Les absents veillent, \xE0 leur fa\xE7on.", "A moment of peace. The departed keep watch, in their way."), statChanges: { mental: 10 } }
        ] },
        { text: L("Se recueillir et passer son chemin", "Pay respects and move on"), risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
          { probability: 1, text: L("Vous saluez la m\xE9moire du pr\xE9d\xE9cesseur. La rue respecte ceux qui se souviennent.", "You honor your predecessor's memory. The street respects those who remember."), statChanges: { mental: 5, dignity: 4 }, respectChange: 1 }
        ] }
      ]
    },
    {
      id: "ghost-souvenir",
      title: L("Quelqu'un se souvient", "Someone Remembers"),
      type: "social",
      isFollowUp: true,
      image: "/assets/ghost-souvenir.webp",
      description: L(`Une passante vous d\xE9visage : \xAB Vous connaissiez ${n}, non ? Un brave. Tenez, pour la route. \xBB`, `A passer-by studies you: "You knew ${n}, right? Good soul. Here, for the road."`),
      choices: [
        { text: L("Accepter avec dignit\xE9", "Accept with dignity"), risk: "safe", emoji: "\u{1F91D}", outcomes: [
          { probability: 0.6, text: L(`Elle vous glisse 3\u20AC et un sourire triste. La m\xE9moire de ${n} nourrit encore.`, `She slips you \u20AC3 and a sad smile. ${n}'s memory still provides.`), moneyChange: 3, statChanges: { mental: 6 } },
          { probability: 0.4, text: L("Elle vous tend un sandwich sous cellophane. \xAB Il aimait ceux au thon. \xBB", 'She hands you a wrapped sandwich. "He liked the tuna ones."'), statChanges: { hunger: 14, mental: 5 } }
        ] }
      ]
    },
    {
      id: "ghost-echo",
      title: L("L'\xC9cho de la Rue", "Echo of the Street"),
      type: "discovery",
      isFollowUp: true,
      image: "/assets/ghost-echo.webp",
      description: L(`Sur un mur, au feutre : \xAB ${n} \xE9tait l\xE0. \xBB La rue n'oublie pas ses rois.`, `On a wall, in marker: "${n} was here." The street doesn't forget its kings.`),
      choices: [
        { text: L("Ajouter votre nom dessous", "Add your name below"), risk: "safe", emoji: "\u{1F58A}\uFE0F", outcomes: [
          { probability: 1, text: L("Deux noms sur un mur. Une dynastie de carton. \xC9trangement, \xE7a donne du courage.", "Two names on a wall. A cardboard dynasty. Strangely, it gives you heart."), statChanges: { mental: 9, dignity: 3 }, respectChange: 1 }
        ] }
      ]
    }
  ];
  return randomFromArray(templates);
}
function generateEvents(_location, character) {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(
    (e) => e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  const freshFollowUps = availableFollowUps.filter((e) => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.3) {
    return [randomFromArray(freshFollowUps)];
  }
  const graves = loadGraves().filter((g) => g.name !== character.name);
  if (graves.length > 0 && Math.random() < 0.08) {
    return [makeGhostEvent(randomFromArray(graves))];
  }
  const shuffled = [...freshPool(EXPLORE_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
function generateBegEvents(_location, character) {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(
    (e) => e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  const freshFollowUps = availableFollowUps.filter((e) => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.25) {
    return [randomFromArray(freshFollowUps)];
  }
  const shuffled = [...freshPool(BEG_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
function generateRestEvents(_location, character) {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(
    (e) => e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  const freshFollowUps = availableFollowUps.filter((e) => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.2) {
    return [randomFromArray(freshFollowUps)];
  }
  const shuffled = [...freshPool(REST_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
var flavorCache = /* @__PURE__ */ new Map();
function flavorFrom(events, positive) {
  let pools = flavorCache.get(events);
  if (!pools) {
    pools = { good: [], bad: [] };
    for (const e of events)
      for (const c of e.choices)
        for (const o of c.outcomes) {
          const good = (o.moneyChange || 0) > 0 || Object.values(o.statChanges || {}).reduce((a, b) => a + (b || 0), 0) > 0;
          (good ? pools.good : pools.bad).push(o.text);
        }
    flavorCache.set(events, pools);
  }
  const pool = positive ? pools.good : pools.bad;
  return pool.length ? randomFromArray(pool) : "";
}
var LEGEND_TEMPLATES = [
  {
    id: "legend-graffiti",
    title: "Le mur des l\xE9gendes",
    type: "narrative",
    description: "Sur un mur d\xE9cr\xE9pi, un graffiti trac\xE9 avec soin : \xAB {name}, {days} jours, Roi du Carton \xBB. La rue n'oublie pas les siens.",
    choices: [
      { text: "Graver votre nom juste en dessous", risk: "safe", emoji: "\u270D\uFE0F", outcomes: [
        { probability: 1, text: "Vous inscrivez votre nom sous celui de {name}. Un jour, peut-\xEAtre, on parlera de vous aussi.", statChanges: { mental: 8, dignity: 3 }, respectChange: 1 }
      ] },
      { text: "Rendre hommage en silence", risk: "safe", emoji: "\u{1F64F}", outcomes: [
        { probability: 1, text: "{days} jours\u2026 Vous serrez les dents. Vous ferez mieux.", statChanges: { mental: 6 } }
      ] }
    ]
  },
  {
    id: "legend-ancien",
    title: "Le vieux se souvient",
    type: "social",
    description: "Un ancien du quartier vous jauge. \xAB {name} ? Ah, \xE7a\u2026 {days} jours dans la rue. Personne n'a fait mieux. Toi, t'as encore du chemin. \xBB",
    choices: [
      { text: "Jurer de le d\xE9passer", risk: "safe", emoji: "\u{1F525}", outcomes: [
        { probability: 1, text: "Le vieux sourit. \xAB J'aime \xE7a. \xBB Il vous glisse quelques pi\xE8ces pour la route.", statChanges: { mental: 7 }, moneyChange: 2, respectChange: 1 }
      ] },
      { text: "Hausser les \xE9paules", risk: "safe", emoji: "\u{1F610}", outcomes: [
        { probability: 1, text: "\xAB Comme tu veux. Mais souviens-toi du nom : {name}. \xBB", statChanges: { mental: 2 } }
      ] }
    ]
  },
  {
    id: "legend-carton",
    title: "Le carton du roi",
    type: "discovery",
    description: "Sous un porche, un carton us\xE9 jusqu'\xE0 la corde. Une inscription au marqueur : \xAB Ici a dormi {name}, {days} jours durant. \xBB On dirait un lieu de p\xE8lerinage.",
    choices: [
      { text: "Fouiller le vieux carton", risk: "normal", emoji: "\u{1F50D}", outcomes: [
        { probability: 0.5, text: "Coinc\xE9e dans un pli : une pi\xE8ce oubli\xE9e et un mot : \xAB Tiens bon. \xBB", moneyChange: 4, statChanges: { mental: 5 } },
        { probability: 0.5, text: "Rien, sinon l'odeur d'une l\xE9gende. Vous repartez inspir\xE9.", statChanges: { mental: 6 } }
      ] },
      { text: "Ne pas d\xE9ranger la relique", risk: "safe", emoji: "\u{1F56F}\uFE0F", outcomes: [
        { probability: 1, text: "Vous laissez le carton de {name} intact. Un peu de respect ne co\xFBte rien.", statChanges: { dignity: 4, mental: 4 }, respectChange: 1 }
      ] }
    ]
  },
  {
    id: "legend-pari",
    title: "Le pari de la rue",
    type: "social",
    description: "Deux SDF parient sur votre avenir. \xAB Lui ? Il tiendra jamais {days} jours comme {name}. \xBB \xAB Parie ! \xBB",
    choices: [
      { text: "Leur donner tort", risk: "safe", emoji: "\u{1F4AA}", outcomes: [
        { probability: 1, text: "\xAB On verra bien. \xBB Vous repartez le menton haut, bien d\xE9cid\xE9 \xE0 entrer dans l'histoire.", statChanges: { mental: 8, dignity: 2 } }
      ] },
      { text: "Parier avec eux", risk: "normal", emoji: "\u{1F3B2}", outcomes: [
        { probability: 0.5, text: "Ils misent une pi\xE8ce sur vous. \xAB Fais-nous gagner, gamin. \xBB", moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.5, text: "Ils rigolent et s'en vont. L'ombre de {name} plane toujours.", statChanges: { mental: 2 } }
      ] }
    ]
  }
];
function fillLegend(s, legend) {
  return s.replace(/\{name\}/g, legend.name).replace(/\{days\}/g, String(legend.days));
}
function makeLegendEvent(legend) {
  const t = randomFromArray(LEGEND_TEMPLATES);
  return {
    // id stable (sans le nom du recordman) pour que le chemin des variantes
    // d'images (result-<id>-good/bad.webp) corresponde à un fichier fixe.
    id: t.id,
    title: tc(t.title),
    type: t.type,
    image: `/assets/${t.id}.webp`,
    description: fillLegend(tc(t.description), legend),
    choices: t.choices.map((c) => ({
      ...c,
      text: tc(c.text),
      outcomes: c.outcomes.map((o) => ({ ...o, text: fillLegend(tc(o.text), legend) }))
    }))
  };
}
function generateTravelEvent(_from, _to, character) {
  if (Math.random() > 0.5) return null;
  return randomFromArray(freshPool(TRAVEL_EVENTS, character.recentEvents));
}

// client/src/contexts/data/combat.ts
var SIGNS = {
  strike: {
    id: "strike",
    name: "Ch\xE2taigne",
    nameEn: "Haymaker",
    emoji: "\u{1F44A}",
    beats: "feint",
    tells: ["Il serre le poing\u2026", "Ses \xE9paules se bandent\u2026"],
    tellsEn: ["It clenches a fist\u2026", "Its shoulders coil\u2026"]
  },
  feint: {
    id: "feint",
    name: "Feinte",
    nameEn: "Feint",
    emoji: "\u{1F3AD}",
    beats: "guard",
    tells: ["Son regard glisse de c\xF4t\xE9\u2026", "Il esquisse un pas chaloup\xE9\u2026"],
    tellsEn: ["Its gaze slides sideways\u2026", "It sways, shifting its weight\u2026"]
  },
  guard: {
    id: "guard",
    name: "Garde",
    nameEn: "Block",
    emoji: "\u{1F4E6}",
    beats: "strike",
    tells: ["Il se ramasse derri\xE8re sa garde\u2026", "Il recule d'un pas, bien couvert\u2026"],
    tellsEn: ["It hunkers behind its guard\u2026", "It steps back, covered up\u2026"]
  }
};
var SPECIAL_DEFS = [
  {
    id: "haleine",
    traitId: "haleine",
    name: "Haleine Redoutable",
    nameEn: "Dreadful Breath",
    emoji: "\u{1F4A8}",
    desc: "Bat Ch\xE2taigne et Feinte (il suffoque), mais perd contre Garde. S'il encaisse : sonn\xE9, son prochain signe est t\xE9l\xE9graphi\xE9.",
    descEn: "Beats Haymaker and Feint (the foe gags), but loses to Block. If it lands: stunned, the foe's next sign is telegraphed."
  },
  {
    id: "piege",
    traitId: "bricoleur",
    name: "Pi\xE8ge \xE0 Carton",
    nameEn: "Cardboard Trap",
    emoji: "\u{1FAA4}",
    desc: "Pose un pi\xE8ge pour 2 manches : \xE0 sa prochaine Ch\xE2taigne, l'ennemi se blesse tout seul.",
    descEn: "Sets a trap for 2 rounds: on its next Haymaker, the foe hurts itself."
  },
  {
    id: "pas-de-cote",
    traitId: "agile",
    name: "Pas de C\xF4t\xE9",
    nameEn: "Side Step",
    emoji: "\u{1F300}",
    desc: "Annule la manche et r\xE9v\xE8le \xE0 coup s\xFBr le signe de l'ennemi.",
    descEn: "Cancels the round and reveals the foe's sign for certain."
  },
  {
    id: "desescalade",
    traitId: "charismatique",
    name: "D\xE9sescalade",
    nameEn: "De-escalation",
    emoji: "\u{1F54A}\uFE0F",
    desc: "Conclure en parlant : selon votre dignit\xE9 et votre respect, le combat peut s'arr\xEAter l\xE0, avec le respect en prime.",
    descEn: "Talk it out: with enough dignity and respect the fight may end right here, with extra respect on top."
  }
];
function combatDeathMessage(enemy) {
  const n = enemy.toLowerCase();
  const en = getLang() === "en";
  if (n.includes("chat")) return en ? `Finished off by ${enemy}. A cat. The street will remember this moment of glory.` : `Achev\xE9 par ${enemy}. Un chat. La rue retiendra ce moment de gloire.`;
  if (n.includes("\xE9cureuil")) return en ? `Beaten by ${enemy}. You didn't even have any nuts to give it.` : `Vaincu par ${enemy}. Vous n'aviez m\xEAme pas de noisettes \xE0 lui donner.`;
  if (n.includes("pigeon") || n.includes("mouette") || n.includes("corbeau") || n.includes("cygne") || n.includes("oie") || n.includes("canard") || n.includes("coq")) {
    return en ? `${enemy} got the better of you. Taken down by a bird: the local flock will remember this for a long time.` : `${enemy} a eu votre peau. Terrass\xE9 par un volatile : les oiseaux du quartier s'en souviendront longtemps.`;
  }
  if (n.includes("rat") || n.includes("raton")) return en ? `${enemy} came out on top. Even the rodents look down on you now.` : `${enemy} a eu le dessus. M\xEAme les rongeurs vous regardent de haut d\xE9sormais.`;
  if (n.includes("clown")) return en ? `${enemy} got the last laugh. And nobody was laughing already.` : `${enemy} a eu le dernier rire. Et personne ne riait d\xE9j\xE0.`;
  if (n.includes("ivrogne")) return en ? `${enemy} was staggering. He still swung straighter than you.` : `${enemy} titubait. Il frappait quand m\xEAme plus droit que vous.`;
  if (n.includes("commer\xE7ant") || n.includes("vigile") || n.includes("agent") || n.includes("s\xE9curit\xE9")) {
    return en ? `${enemy} was defending their turf. You're not defending anything anymore.` : `${enemy} d\xE9fendait son territoire. Vous, vous ne d\xE9fendez plus rien.`;
  }
  if (n.includes("voyou") || n.includes("chien")) return en ? `${enemy} wanted your corner. They got it.` : `${enemy} voulait votre coin de rue. Il l'a eu.`;
  return en ? `${enemy} got the better of you. The street carries on, indifferent.` : `${enemy} a eu raison de vous. La rue continue, indiff\xE9rente.`;
}
function unarmedDamage(c, combat) {
  return 7 + (c.job.id === "militaire" ? 3 : 0) + (c.job.id === "boxeur" ? 2 : 0) + combat.atkBuff;
}
function bestWeapon(c) {
  let best;
  for (const i of c.inventory) {
    if (i.type !== "weapon") continue;
    if (!best || (i.attackBonus ?? 4) > (best.attackBonus ?? 4)) best = i;
  }
  return best;
}
function bestWeaponBonus(c) {
  const w = bestWeapon(c);
  return w ? w.attackBonus ?? 4 : 0;
}
function bestArmor(c) {
  let best;
  for (const i of c.inventory) {
    if (!i.defenseBonus) continue;
    if (!best || i.defenseBonus > (best.defenseBonus ?? 0)) best = i;
  }
  return best;
}
function bestArmorBonus(c) {
  return bestArmor(c)?.defenseBonus ?? 0;
}
function soakDamage(c, dmg) {
  const def = bestArmorBonus(c);
  if (def <= 0) return dmg;
  return Math.max(1, Math.round(dmg * (12 / (12 + def))));
}
function hasHealingItem(c) {
  return c.inventory.some((i) => (i.effect?.health ?? 0) > 0);
}
function firstJunk(c) {
  return c.inventory.find((i) => i.type === "junk");
}
var dmgLabel = (n, extra = "") => `\u2248 ${n} ${getLang() === "en" ? "dmg" : "d\xE9g."}${extra}`;
var CARD_DEFS = [
  {
    id: "punch",
    name: "Coup de Poing",
    nameEn: "Punch",
    emoji: "\u{1F44A}",
    kind: "attack",
    desc: "Un direct honn\xEAte. Toujours disponible.",
    descEn: "An honest jab. Always available.",
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k))),
    available: () => true
  },
  {
    id: "bottle",
    name: "Coup d'Arme",
    nameEn: "Weapon Blow",
    emoji: "\u{1F37E}",
    kind: "attack",
    desc: "Frappe avec votre arme la plus solide. Gros d\xE9g\xE2ts.",
    descEn: "Hit with your sturdiest weapon. Big damage.",
    estimate: (c, k) => dmgLabel(
      Math.round((unarmedDamage(c, k) + bestWeaponBonus(c)) * 1.35),
      bestWeapon(c)?.combatStyle === "precise" ? getLang() === "en" ? " \u26A120% crit" : " \u26A120% crit." : ""
    ),
    available: (c) => bestWeaponBonus(c) > 0
  },
  {
    id: "insult",
    name: "Insulte Cibl\xE9e",
    nameEn: "Targeted Insult",
    emoji: "\u{1F5EF}\uFE0F",
    kind: "debuff",
    desc: "Sape le moral de l'ennemi : il frappe moins fort ensuite.",
    descEn: "Saps the foe's morale: it hits softer afterwards.",
    estimate: () => getLang() === "en" ? "\u2212enemy atk" : "\u2212atk ennemi",
    available: (c) => c.stats.dignity > 30 || c.traits.some((t) => t.id === "charismatique")
  },
  {
    id: "combo",
    name: "Feinte + Coup Bas",
    nameEn: "Feint + Low Blow",
    emoji: "\u{1F3AD}",
    kind: "attack",
    desc: "Combo d\xE9vastateur : l'ennemi sonn\xE9 t\xE9l\xE9graphie son prochain signe.",
    descEn: "Devastating combo: the stunned foe telegraphs its next sign.",
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.6), getLang() === "en" ? " + stun" : " + sonn\xE9"),
    available: () => true
  },
  {
    id: "warcry",
    name: "Cri de Guerre",
    nameEn: "War Cry",
    emoji: "\u{1F4E3}",
    kind: "buff",
    desc: "Vous vous galvanisez : votre prochaine attaque frappe plus fort.",
    descEn: "You psych yourself up: your next attack hits harder.",
    estimate: () => getLang() === "en" ? "+attack" : "+attaque",
    available: (c) => c.stats.mental > 15
  },
  {
    id: "fortune",
    name: "Arme de Fortune",
    nameEn: "Makeshift Weapon",
    emoji: "\u{1F527}",
    kind: "attack",
    desc: "Bricole une arme d'un objet du sac. Gros d\xE9g\xE2ts, consomme l'objet.",
    descEn: "Rig a weapon from a bag item. Big damage, consumes the item.",
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.7)),
    available: (c) => c.traits.some((t) => t.id === "bricoleur") && !!firstJunk(c)
  },
  {
    id: "military",
    name: "Coup R\xE9glementaire",
    nameEn: "Regulation Strike",
    emoji: "\u{1F396}\uFE0F",
    kind: "attack",
    desc: "Technique militaire propre et efficace.",
    descEn: "Clean, efficient military technique.",
    estimate: (c, k) => dmgLabel(Math.round(unarmedDamage(c, k) * 1.5)),
    available: (c) => c.job.id === "militaire"
  },
  {
    id: "bandage",
    name: "R\xE9pit",
    nameEn: "Breather",
    emoji: "\u{1FA79}",
    kind: "heal",
    desc: "Utilise un soin du sac au lieu de frapper. Rend de la sant\xE9.",
    descEn: "Use a healing item instead of striking. Restores health.",
    estimate: () => getLang() === "en" ? "+health" : "+sant\xE9",
    available: (c) => hasHealingItem(c)
  },
  {
    id: "flee",
    name: "Fuite",
    nameEn: "Flee",
    emoji: "\u{1F3C3}",
    kind: "flee",
    desc: "Tenter de fuir. Plus l'ennemi est brutal, plus c'est risqu\xE9.",
    descEn: "Try to run. The more brutal the foe, the riskier.",
    estimate: (c) => c.traits.some((t) => t.id === "agile") ? getLang() === "en" ? "flee (agile)" : "fuite (agile)" : getLang() === "en" ? "flee" : "fuite",
    available: () => true
  }
];
function getCard(id) {
  return CARD_DEFS.find((c) => c.id === id);
}
function generateHand(character, combat, count) {
  const armed = bestWeaponBonus(character) > 0;
  if (count <= 1) return [armed ? "bottle" : "punch"];
  const guaranteed = armed ? ["punch", "bottle"] : ["punch"];
  const pool = CARD_DEFS.filter((c) => !guaranteed.includes(c.id) && c.available(character, combat)).filter((c) => c.id !== "combo" || count >= 2).map((c) => c.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...guaranteed, ...pool.slice(0, Math.max(0, count - guaranteed.length))];
}
function makeCombatState(enemy, character) {
  const image = enemy.image || ENEMIES.find((e) => e.name === enemy.name)?.image || COMBAT_IMAGES[enemy.name];
  const special = SPECIAL_DEFS.find((s) => character.traits.some((t) => t.id === s.traitId));
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
    phase: "sign",
    pattern: getPattern(enemy),
    hand: [],
    // L'arme de fortune ne ressemble pas à une arme : personne ne voit venir
    // un tuyau scotché. Le premier coup du combat part avec l'effet de
    // surprise, une fois, et l'avantage s'éteint après (atkBuff est consommé).
    atkBuff: character.inventory.some((i) => i.id === "craft-arme") ? 3 : 0,
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
    dodgePenalty: enemy.name === "Vigile de Choc" ? 1.5 : 1
  };
}

// client/src/contexts/data/heist.ts
var HEIST_TARGETS = [
  // ---- 🌳 Parc ----
  {
    id: "heist-panier-picnic",
    location: "parc",
    difficulty: "petit",
    emoji: "\u{1F9FA}",
    label: "le panier de pique-nique",
    labelEn: "the picnic basket",
    desc: "Une famille joue au badminton \xE0 trente m\xE8tres de son panier. Le badminton, \xE7a absorbe.",
    descEn: "A family plays badminton thirty meters from their basket. Badminton is absorbing.",
    catcher: "commercant",
    moneyMin: 2,
    moneyMax: 5
  },
  {
    id: "heist-glacier-parc",
    location: "parc",
    difficulty: "risque",
    emoji: "\u{1F366}",
    label: "la caisse du glacier",
    labelEn: "the ice cream man's till",
    desc: "Le glacier tourne le dos \xE0 sa caisse \xE0 chaque cornet, et il y a la queue.",
    descEn: "The ice cream man turns his back on the till with every cone. Three seconds per cone.",
    catcher: "commercant",
    moneyMin: 6,
    moneyMax: 12,
    item: { id: "sorbet-artisanal", name: "Sorbet artisanal", emoji: "\u{1F366}", type: "food", value: 4, effect: { hunger: 8, mental: 8, thirst: 6 } }
  },
  {
    id: "heist-buvette-parc",
    location: "parc",
    difficulty: "grand",
    emoji: "\u{1F34B}",
    label: "la recette de la buvette",
    labelEn: "the refreshment stand's takings",
    desc: "La f\xEAte locale bat son plein et la caisse d\xE9borde. La s\xE9curit\xE9 de l'\xE9v\xE9nement aussi.",
    descEn: "The local fair is in full swing and the till is overflowing. So is event security.",
    catcher: "vigile",
    moneyMin: 15,
    moneyMax: 25,
    item: { id: "fut-limonade", name: "F\xFBt de limonade", emoji: "\u{1F34B}", type: "special", value: 15, effect: { thirst: 20, mental: 6 } }
  },
  // ---- 🏙️ Centre-ville ----
  {
    id: "heist-terrasse-centre",
    location: "centre-ville",
    difficulty: "petit",
    emoji: "\u2615",
    label: "les pourboires de la terrasse",
    labelEn: "the terrace tips",
    desc: "Les soucoupes s'accumulent, le serveur est seul et le service bat son plein.",
    descEn: "The saucers pile up, the waiter is alone and service is at its peak.",
    catcher: "commercant",
    moneyMin: 2,
    moneyMax: 5
  },
  {
    id: "heist-superette-centre",
    location: "centre-ville",
    difficulty: "risque",
    emoji: "\u{1F6D2}",
    label: "la sup\xE9rette du coin",
    labelEn: "the corner minimart",
    desc: "Un seul employ\xE9, des rayons hauts, une cam\xE9ra qui pend par son c\xE2ble depuis mars.",
    descEn: "One employee, tall shelves, a camera dangling from its cable since March.",
    catcher: "police",
    moneyMin: 6,
    moneyMax: 12,
    item: { id: "sac-courses", name: "Sac de courses garni", emoji: "\u{1F6D2}", type: "food", value: 5, effect: { hunger: 18, thirst: 6 } }
  },
  {
    id: "heist-boutique-telephones",
    location: "centre-ville",
    difficulty: "grand",
    emoji: "\u{1F4F1}",
    label: "la boutique de t\xE9l\xE9phones",
    labelEn: "the phone store",
    desc: "Des vitrines blind\xE9es, des portiques, et des vigiles qui s'ennuient. S'ennuyaient.",
    descEn: "Armored displays, security gates, and bored guards. Formerly bored.",
    catcher: "vigile",
    moneyMin: 15,
    moneyMax: 25,
    item: { id: "smartphone-blister", name: "Smartphone sous blister", emoji: "\u{1F4F1}", type: "special", value: 30 }
  },
  // ---- 🛒 Marché ----
  {
    id: "heist-etal-marche",
    location: "marche",
    difficulty: "petit",
    emoji: "\u{1F34E}",
    label: "l'\xE9tal du primeur",
    labelEn: "the greengrocer's stall",
    desc: "Le primeur hurle ses promos, dos aux cagettes, la voix couverte par sa propre sono.",
    descEn: "The greengrocer bellows his deals, back to the crates. A classic of the trade.",
    catcher: "commercant",
    moneyMin: 2,
    moneyMax: 5
  },
  {
    id: "heist-fromager-marche",
    location: "marche",
    difficulty: "risque",
    emoji: "\u{1F9C0}",
    label: "le stand du fromager",
    labelEn: "the cheesemonger's stand",
    desc: "Les tommes tr\xF4nent \xE0 port\xE9e de main. Le fromager a des yeux partout et un couteau \xE0 p\xE2te dure.",
    descEn: "The wheels sit within arm's reach. The cheesemonger has eyes everywhere and a hard-cheese knife.",
    catcher: "commercant",
    moneyMin: 6,
    moneyMax: 12,
    item: { id: "tomme-entiere", name: "Tomme enti\xE8re", emoji: "\u{1F9C0}", type: "food", value: 6, effect: { hunger: 22, mental: 4 } }
  },
  {
    id: "heist-caisse-marche",
    location: "marche",
    difficulty: "grand",
    emoji: "\u{1F4B6}",
    label: "la caisse commune du march\xE9",
    labelEn: "the market's common till",
    desc: "Le placier collecte les emplacements en liquide. Sa sacoche p\xE8se lourd, son sifflet alerte tout le march\xE9.",
    descEn: "The market officer collects pitch fees in cash. His satchel is heavy; his whistle alerts the whole market.",
    catcher: "police",
    moneyMin: 15,
    moneyMax: 25,
    item: { id: "balance-placier", name: "Balance du placier", emoji: "\u2696\uFE0F", type: "special", value: 18 }
  },
  // ---- 🚂 Gare ----
  {
    id: "heist-sacoche-gare",
    location: "gare",
    difficulty: "petit",
    emoji: "\u{1F45C}",
    label: "la sacoche oubli\xE9e sur un banc",
    labelEn: "the bag left on a bench",
    desc: "Son propri\xE9taire s'est endormi deux bancs plus loin, berc\xE9 par les annonces de retard.",
    descEn: "Its owner fell asleep two benches away, lulled by the delay announcements.",
    catcher: "police",
    moneyMin: 2,
    moneyMax: 5
  },
  {
    id: "heist-sandwicherie-gare",
    location: "gare",
    difficulty: "risque",
    emoji: "\u{1F96A}",
    label: "la sandwicherie du quai",
    labelEn: "the platform sandwich shop",
    desc: "Le coup de feu de midi : deux employ\xE9s d\xE9bord\xE9s, une vitrine ouverte, un flux continu de press\xE9s.",
    descEn: "The lunch rush: two swamped employees, an open display, a steady stream of people in a hurry.",
    catcher: "commercant",
    moneyMin: 6,
    moneyMax: 12,
    item: { id: "lot-sandwichs", name: "Lot de sandwichs", emoji: "\u{1F96A}", type: "food", value: 5, effect: { hunger: 24 } }
  },
  {
    id: "heist-consigne-gare",
    location: "gare",
    difficulty: "grand",
    emoji: "\u{1F9F3}",
    label: "la consigne \xE0 bagages",
    labelEn: "the left-luggage office",
    desc: "Des valises pleines de vies enti\xE8res, derri\xE8re un rideau de fer et la s\xE9curit\xE9 ferroviaire.",
    descEn: "Suitcases full of entire lives, behind a metal shutter and railway security.",
    catcher: "vigile",
    moneyMin: 15,
    moneyMax: 25,
    item: { id: "valise-oubliee", name: "Valise oubli\xE9e", emoji: "\u{1F9F3}", type: "special", value: 22, effect: { dignity: 5 } }
  },
  // ---- 🏭 Zone industrielle ----
  {
    id: "heist-cuivre-zone",
    location: "zone-industrielle",
    difficulty: "petit",
    emoji: "\u{1F50C}",
    label: "le cuivre qui tra\xEEne",
    labelEn: "the copper lying around",
    desc: "Des chutes de c\xE2ble pr\xE8s de la benne, et un gardien qui fait sa ronde toutes les heures. Il est l'heure moins le quart.",
    descEn: "Cable offcuts by the dumpster, and a watchman doing hourly rounds. It's quarter to the hour.",
    catcher: "police",
    moneyMin: 2,
    moneyMax: 5
  },
  {
    id: "heist-entrepot-zone",
    location: "zone-industrielle",
    difficulty: "risque",
    emoji: "\u{1F37A}",
    label: "l'entrep\xF4t de boissons",
    labelEn: "the beverage warehouse",
    desc: "Des palettes de packs jusqu'au plafond, un cariste distrait, un quai de chargement b\xE9ant.",
    descEn: "Pallets of drink packs to the ceiling, a distracted forklift driver, a gaping loading dock.",
    catcher: "commercant",
    moneyMin: 6,
    moneyMax: 12,
    item: { id: "pack-biere", name: "Pack de bi\xE8re", emoji: "\u{1F37A}", type: "food", value: 6, effect: { thirst: 14, mental: 8, health: -2 } }
  },
  {
    id: "heist-camion-zone",
    location: "zone-industrielle",
    difficulty: "grand",
    emoji: "\u{1F69A}",
    label: "le camion de livraison",
    labelEn: "the delivery truck",
    desc: "Charg\xE9 \xE0 ras bord, moteur tournant, chauffeur au t\xE9l\xE9phone. La soci\xE9t\xE9 de gardiennage patrouille.",
    descEn: "Loaded to the brim, engine running, driver on the phone. The security company is on patrol.",
    catcher: "vigile",
    moneyMin: 15,
    moneyMax: 25,
    item: { id: "carton-marchandises", name: "Carton de marchandises", emoji: "\u{1F4E6}", type: "special", value: 20 }
  }
];
function getHeistTarget(id) {
  return HEIST_TARGETS.find((h) => h.id === id);
}

// client/src/contexts/data/crafting.ts
var RECIPES = [
  {
    id: "rechaud",
    name: "R\xE9chaud de fortune",
    emoji: "\u{1F525}",
    cost: 2,
    hint: "Une bo\xEEte de conserve perc\xE9e, trois clous, du carton pour l'allumage. Le froid s'arr\xEAte \xE0 un m\xE8tre.",
    hintEn: "A punched tin can, three nails, cardboard for kindling. The cold stops one meter out.",
    make: () => ({
      id: "craft-rechaud",
      name: "R\xE9chaud de fortune",
      emoji: "\u{1F525}",
      type: "tool",
      value: 6,
      passive: "Les nuits froides ne vous co\xFBtent plus de sant\xE9.",
      passiveEn: "Cold nights no longer cost you health."
    })
  },
  {
    id: "matelas",
    name: "Matelas de carton",
    emoji: "\u{1F6CF}\uFE0F",
    cost: 3,
    hint: "Trois \xE9paisseurs pli\xE9es \xE0 la main, cal\xE9es contre le mur. Le sol arr\xEAte de vous voler vos nuits.",
    hintEn: "Three layers folded by hand, wedged against the wall. The ground stops stealing your nights.",
    make: () => ({
      id: "craft-matelas",
      name: "Matelas de carton",
      emoji: "\u{1F6CF}\uFE0F",
      type: "tool",
      value: 5,
      passive: "Vous ne perdez plus de sommeil pendant la nuit.",
      passiveEn: "You no longer lose sleep during the night."
    })
  },
  {
    id: "arme-fortune",
    name: "Arme de fortune",
    emoji: "\u{1F529}",
    cost: 2,
    hint: "Un tuyau, du ruban adh\xE9sif, et de quoi cogner. Personne ne voit venir un tuyau.",
    hintEn: "A pipe, some tape, and something to swing. Nobody sees a pipe coming.",
    make: () => ({
      id: "craft-arme",
      name: "Arme de fortune",
      emoji: "\u{1F529}",
      type: "weapon",
      value: 7,
      attackBonus: 5,
      combatStyle: "heavy",
      passive: "L'adversaire ne l'attend pas : votre premier coup du combat frappe plus fort.",
      passiveEn: "Your opponent doesn't expect it: your first blow of the fight hits harder."
    })
  },
  {
    id: "protection",
    name: "Protection de fortune",
    emoji: "\u{1F9BA}",
    cost: 3,
    hint: "Cartons et mousse sangl\xE9s au torse. Ridicule, et parfaitement efficace.",
    hintEn: "Cardboard and foam strapped to your chest. Ridiculous, and perfectly effective.",
    make: () => ({ id: "craft-protection", name: "Protection de fortune", emoji: "\u{1F9BA}", type: "armor", value: 7, defenseBonus: 4 })
  },
  {
    id: "trousse",
    name: "Trousse de secours bricol\xE9e",
    emoji: "\u{1FA79}",
    cost: 3,
    hint: "De quoi recoller les morceaux quand \xE7a saigne pour de vrai.",
    hintEn: "Enough to patch yourself up when you really bleed.",
    make: () => ({ id: "craft-trousse", name: "Trousse de secours bricol\xE9e", emoji: "\u{1FA79}", type: "tool", value: 9, effect: { health: 26 } })
  },
  {
    id: "talisman",
    name: "Talisman de carton",
    emoji: "\u{1F9FF}",
    cost: 4,
    hint: "Une babiole porte-bonheur d\xE9coup\xE9e dans un rabat. On y croit ou on meurt, souvent les deux.",
    hintEn: "A lucky charm cut from a box flap. You believe in it or you die, often both.",
    make: () => ({ id: "craft-talisman", name: "Talisman de carton", emoji: "\u{1F9FF}", type: "special", value: 6, effect: { mental: 22, dignity: 8 } })
  }
];
var USURE_BASE = 0.25;
function usureNuit(c) {
  return hasTrait(c, "bricoleur") ? USURE_BASE / 2 : USURE_BASE;
}
function recipeCost(recipe, c) {
  const discount = hasTrait(c, "bricoleur") ? 1 : 0;
  return Math.max(1, recipe.cost - discount);
}
function pickMaterials(c, count) {
  return c.inventory.map((it, i) => ({ it, i })).filter((x) => x.it.type === "junk").sort((a, b) => a.it.value - b.it.value).slice(0, count).map((x) => x.i);
}

// client/src/contexts/data/npc.ts
function encounterFlag(day2, location) {
  return `rencontre-${day2}-${location}`;
}

// client/src/contexts/GameContext.tsx
function survivesFirstDay(c) {
  return c.day <= 1 && isFirstEverRun(loadHighScores().length, loadGraves().length);
}
function withFirstDayNet(c, stats) {
  if (!survivesFirstDay(c)) return stats;
  return { ...stats, health: Math.max(1, stats.health), mental: Math.max(1, stats.mental) };
}
function stateApresMort(state, cause, logs) {
  const c = state.character;
  saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money, hasTrait(c, "poissard")));
  clearSave();
  return {
    ...state,
    character: { ...c, stats: { ...c.stats, health: 0 }, alive: false },
    screen: "game-over",
    currentCombat: null,
    combatLog: logs ?? state.combatLog,
    deathCause: cause
  };
}
function applyStatDelta(stats, delta) {
  const s = { ...stats };
  Object.entries(delta).forEach(([k, v]) => {
    if (v) s[k] += v;
  });
  return clampStats(s);
}
function removeOne(inv, id) {
  const i = inv.findIndex((it) => it.id === id);
  return i < 0 ? inv : [...inv.slice(0, i), ...inv.slice(i + 1)];
}
var SEUIL_PRESQUE = 0.8;
function clampStats(stats) {
  return {
    health: Math.max(0, Math.min(100, stats.health)),
    mental: Math.max(0, Math.min(100, stats.mental)),
    hunger: Math.max(0, Math.min(100, stats.hunger)),
    thirst: Math.max(0, Math.min(100, stats.thirst)),
    sleep: Math.max(0, Math.min(100, stats.sleep)),
    dignity: Math.max(0, Math.min(100, stats.dignity))
  };
}
function applyDailyDecay(stats) {
  return clampStats({
    health: stats.health - (stats.hunger < 15 ? 12 : 2) - (stats.thirst < 15 ? 14 : 2) - (stats.sleep < 15 ? 6 : 0),
    mental: stats.mental - 5 - (stats.dignity < 25 ? 8 : 0) - (stats.hunger < 20 ? 3 : 0),
    hunger: stats.hunger - 18,
    thirst: stats.thirst - 22,
    sleep: stats.sleep - 15,
    dignity: stats.dignity - 4
  });
}
var SAVE_KEY = "roi-du-carton-save";
var SCORES_KEY = "roi-du-carton-scores";
function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.character && data.character.alive) {
        if (!data.character.activeFlags) data.character.activeFlags = [];
        if (!data.character.seed) data.character.seed = `${data.character.name || "sdf"}-${data.character.job?.id || "x"}`;
        if (!data.character.gender) data.character.gender = genderFromName(data.character.name || "");
        return {
          character: data.character,
          dayActions: data.dayActions || 0,
          screen: "main"
        };
      }
    }
  } catch {
  }
  return null;
}
function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
  }
}
function loadHighScores() {
  try {
    const saved = localStorage.getItem(SCORES_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
  }
  return [];
}
function saveHighScore(name, days, score) {
  try {
    const scores = loadHighScores();
    scores.push({ name, days, score });
    scores.sort((a, b) => b.days - a.days || b.score - a.score);
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
  } catch {
  }
}
function getLegend(scores) {
  if (!scores || scores.length === 0) return null;
  const top = [...scores].sort((a, b) => b.days - a.days || b.score - a.score)[0];
  if (!top || top.days < 4) return null;
  return { name: top.name, days: top.days };
}
function gameReducer(state, action) {
  switch (action.type) {
    case "START_GAME":
      clearSave();
      return { ...state, screen: "character-select", characterChoices: generateCharacterTrio(), deathCause: null };
    case "GENERATE_CHARACTERS":
      return { ...state, characterChoices: generateCharacterTrio(state.characterChoices.map((c) => c.name)) };
    case "PREPARE_SUCCESSOR":
      if (state.characterChoices.length > 0) return state;
      return { ...state, characterChoices: generateCharacterTrio(state.character ? [state.character.name] : []) };
    case "SELECT_CHARACTER": {
      const char = state.characterChoices[action.index];
      const legacy = peekLegacy();
      clearLegacy();
      const kits = takePendingKits();
      const cartons = takePendingGifts();
      const debutant = isFirstEverRun(loadHighScores().length, loadGraves().length);
      const firstContract = { id: randomFromArray(paquetDuPremierMatin(debutant)).id, done: false };
      let inventory = [...char.inventory];
      let money2 = char.money;
      const gifts = [];
      if (legacy && legacy.item?.id !== "sceptre-roi" && inventory.length < bagCapacity({ inventory })) {
        inventory.push(legacy.item);
        gifts.push(L(`${legacy.item.name}, l'h\xE9ritage de ${legacy.from}`, `the ${tc(legacy.item.name)}, ${legacy.from}'s legacy`));
      }
      for (const id of cartons) {
        const def = SALVAGE_JUNK.find((i) => i.id === id) || trouvailleById(id);
        if (!def || inventory.length >= bagCapacity({ inventory })) continue;
        inventory.push({ ...def });
        gifts.push(L(def.name, tc(def.name)));
      }
      for (const kit of kits) {
        const def = HERITAGE_KITS.find((k) => k.id === kit);
        if (!def) continue;
        def.items.forEach((it) => {
          if (inventory.length < bagCapacity({ inventory })) inventory.push({ ...it });
        });
        money2 += def.money;
        gifts.push(L(def.name, def.nameEn));
      }
      if (gifts.length > 0) {
        return {
          ...state,
          screen: "main",
          dayActions: 0,
          contract: firstContract,
          // Le trio est consommé : sans ça, la mort suivante annoncerait comme
          // successeur un personnage de ce trio-ci, déjà joué.
          characterChoices: [],
          character: { ...char, inventory, money: money2 },
          eventResult: {
            text: L(
              `\u{1F381} Sur votre carton, quelqu'un a d\xE9pos\xE9 : ${gifts.join(", ")}. La rue se souvient.`,
              `\u{1F381} Left on your cardboard: ${gifts.join(", ")}. The street remembers.`
            ),
            image: "/assets/result-cadeau-carton.webp"
          }
        };
      }
      return { ...state, screen: "main", character: char, characterChoices: [], dayActions: 0, contract: firstContract };
    }
    case "CONTINUE_SAVE": {
      const saved = loadGame();
      if (saved && saved.character) {
        {
          const meteo = saved.weather || getInitialWeather();
          return {
            ...state,
            ...saved,
            weather: meteo,
            nextWeather: saved.nextWeather || getNextWeather(meteo, saved.character?.day ?? 1),
            contract: { id: randomFromArray(CONTRACTS).id, done: false }
          };
        }
      }
      return state;
    }
    /*
     * UN APPUI, UNE ACTION — le garde-fou des cinq tuiles.
     *
     * `state.screen !== 'main'` n'est pas une précaution de style. Mesuré :
     * deux appuis sur « Explorer » dans le même tick JavaScript consommaient
     * DEUX actions de la journée sur trois, pour un seul événement affiché.
     * Le budget d'actions ne suffisait pas à s'en protéger — après le premier
     * envoi il en restait deux, donc le second passait.
     *
     * Ces cinq actions quittent toutes l'écran principal. En exiger le départ
     * les rend idempotentes le temps d'une image, et ferme au passage un
     * chemin qui n'aurait jamais dû exister : fouiller une benne depuis la
     * boutique.
     */
    case "EXPLORE": {
      if (!state.character || state.dayActions >= state.maxDayActions || state.screen !== "main") return state;
      if (dueSursaut(state.character)) {
        return { ...state, screen: "event", currentEvent: SURSAUT_EVENT, dayActions: state.dayActions + 1 };
      }
      const legend = getLegend(state.highScores);
      if (legend && Math.random() < 0.08) {
        return { ...state, screen: "event", currentEvent: makeLegendEvent(legend), dayActions: state.dayActions + 1 };
      }
      const events = generateEvents(state.character.location, state.character);
      if (events.length === 0) return state;
      const event = randomFromArray(events);
      return {
        ...state,
        screen: "event",
        currentEvent: event,
        dayActions: state.dayActions + 1,
        character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, event.id) }
      };
    }
    case "BEG": {
      if (!state.character || state.dayActions >= state.maxDayActions || state.screen !== "main") return state;
      if (Math.random() < 0.28) {
        const begEvents = generateBegEvents(state.character.location, state.character);
        if (begEvents.length > 0) {
          const begEvt = randomFromArray(begEvents);
          return {
            ...state,
            screen: "event",
            currentEvent: begEvt,
            dayActions: state.dayActions + 1,
            character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, begEvt.id) }
          };
        }
      }
      return { ...state, screen: "beg-game", dayActions: state.dayActions + 1 };
    }
    case "RESOLVE_BEG": {
      if (!state.character) return state;
      const c = state.character;
      const modifier = WEATHER_TYPES[state.weather].actionModifier;
      if (action.copTapped) {
        const amende = Math.min(c.money, 4 + Math.floor(Math.random() * 4));
        const statDelta2 = { dignity: -10, mental: -6 };
        const newStats2 = withFirstDayNet(c, applyStatDelta(c.stats, statDelta2));
        const isAlive2 = newStats2.health > 0 && newStats2.mental > 0;
        if (!isAlive2) {
          saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money - amende, hasTrait(c, "poissard")));
          clearSave();
        }
        return {
          ...state,
          character: { ...c, stats: newStats2, money: c.money - amende, alive: isAlive2 },
          eventResult: {
            text: L(`\u{1F46E} \xAB Mendicit\xE9 sur la voie publique, circulez ! \xBB Le policier confisque votre r\xE9colte${amende > 0 ? ` et vous colle ${amende}\u20AC d'amende` : ", insolvable, vous repartez avec un avertissement"}.`, `\u{1F46E} "Begging in public, move along!" The cop confiscates your takings${amende > 0 ? ` and slaps you with a \u20AC${amende} fine` : ", broke, so you leave with a warning"}.`),
            statChanges: statDelta2,
            moneyChange: -amende,
            image: "/assets/result-beg-police.webp"
          },
          screen: isAlive2 ? "main" : "game-over"
        };
      }
      const dignityMod = 0.7 + c.stats.dignity / 100 * 0.5;
      const money2 = Math.round(action.coins * modifier * dignityMod);
      const insisted = Math.min(BEG_TUNING.maxDignitySpent, Math.max(0, Math.round(action.dignitySpent || 0)));
      const statDelta = money2 >= 6 ? { dignity: -3 - insisted, mental: 6 } : { dignity: -4 - insisted, mental: money2 > 0 ? 2 : -4 };
      const respectDelta = money2 >= 8 ? 1 : 0;
      const newStats = withFirstDayNet(c, applyStatDelta(c.stats, statDelta));
      const isAlive = newStats.health > 0 && newStats.mental > 0;
      const prefix = money2 >= 8 ? L("\u{1F3A9} Manche exceptionnelle ! ", "\u{1F3A9} An exceptional haul! ") : money2 > 0 ? L("\u{1FA99} Quelques pi\xE8ces au fond du chapeau. ", "\u{1FA99} A few coins in the bottom of the hat. ") : L("\u{1F4A8} Pas un sou aujourd'hui. ", "\u{1F4A8} Not a penny today. ");
      const weatherNote = modifier !== 1 ? modifier > 1 ? L(" Le beau temps a rendu les passants g\xE9n\xE9reux.", " The good weather made passers-by generous.") : L(" Le mauvais temps a fait fuir les passants.", " The bad weather scared off passers-by.") : "";
      const dignityNote = c.stats.dignity >= 70 ? L(" Votre allure soign\xE9e a inspir\xE9 confiance.", " Your neat appearance inspired trust.") : c.stats.dignity < 25 ? L(" Votre allure n\xE9glig\xE9e a fait fuir plus d'un passant.", " Your unkempt look scared off more than one passer-by.") : "";
      const insistNote = insisted >= 8 ? L(" Vous avez retenu des manches un peu trop longtemps : \xE7a se paie en fiert\xE9.", " You held on to a few sleeves a bit too long: that costs pride.") : insisted >= 3 ? L(" Vous avez un peu insist\xE9.", " You pushed it a little.") : "";
      if (!isAlive) {
        saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money + money2, hasTrait(c, "poissard")));
        clearSave();
      }
      const begEvt = randomFromArray(BEG_EVENTS);
      if (money2 > 0) progress("euros", money2);
      const cUpd = { ...c, stats: newStats, money: c.money + money2, respect: c.respect + respectDelta, alive: isAlive };
      if (isAlive && action.fightWith) {
        const foe = enemyByName(action.fightWith);
        if (foe) {
          return {
            ...state,
            character: cUpd,
            screen: "combat",
            currentCombat: makeCombatState(foe, cUpd),
            combatLog: [L(
              `${foe.emoji} Vous avez insist\xE9 une seconde de trop. ${foe.name} se retourne : \xAB tu me l\xE2ches, oui ? \xBB`,
              `${foe.emoji} You pushed it one second too far. ${tc(foe.name)} turns around: "will you get off my back?"`
            )]
          };
        }
      }
      return {
        ...state,
        character: cUpd,
        eventResult: { text: prefix + tc(flavorFrom(BEG_EVENTS, money2 > 0)) + weatherNote + dignityNote + insistNote, statChanges: statDelta, moneyChange: money2, respectChange: respectDelta, image: `/assets/result-${begEvt.id}-${money2 > 0 ? "good" : "bad"}.webp`, fallbackImage: begEvt.image },
        screen: isAlive ? "main" : "game-over"
      };
    }
    case "SALVAGE": {
      if (!state.character || state.dayActions >= state.maxDayActions || state.screen !== "main") return state;
      return { ...state, screen: "salvage-game", dayActions: state.dayActions + 1 };
    }
    case "RESOLVE_SALVAGE": {
      if (!state.character) return state;
      const c = state.character;
      const money2 = salvagePayout(action.centimes);
      const wanted = action.bazar + (action.bazar > 0 ? action.extraKept : 0);
      const kept = Math.min(SALVAGE_TUNING.maxKept + action.extraKept, Math.max(0, wanted));
      const inventory = [...c.inventory];
      let added = 0;
      for (let i = 0; i < kept && inventory.length < bagCapacity({ inventory }); i++) {
        inventory.push({ ...randomFromArray(SALVAGE_JUNK) });
        added++;
      }
      const found = [];
      for (const id of action.trouvailles) {
        const item = trouvailleById(id);
        if (!item) continue;
        if (inventory.length >= bagCapacity({ inventory })) {
          const junkIdx = inventory.findIndex((i) => i.type === "junk");
          if (junkIdx === -1) break;
          inventory.splice(junkIdx, 1);
          if (added > 0) added--;
        }
        inventory.push({ ...item });
        found.push(tc(item.name));
      }
      const deep = action.depth;
      const bodily = action.hurts.reduce((acc, id) => {
        const h = piegeHurts(c, id);
        return { health: acc.health + h.health, hunger: acc.hunger + h.hunger };
      }, { health: 0, hunger: 0 });
      const moralMul = hasTrait(c, "optimiste") ? 0.5 : 1;
      const hungerMul = hasTrait(c, "metabolisme") ? 2 : 1;
      const statDelta = action.busted ? {
        dignity: -6 - deep,
        mental: Math.round(-9 * moralMul),
        health: -4 + bodily.health,
        hunger: Math.round(-4 * hungerMul) + bodily.hunger
      } : {
        dignity: -4 - Math.floor(deep / 2),
        mental: money2 > 0 || added > 0 || found.length > 0 ? 3 : Math.round(-3 * moralMul),
        health: bodily.health,
        hunger: Math.round(-3 * hungerMul) + bodily.hunger
      };
      const newStats = withFirstDayNet(c, applyStatDelta(c.stats, statDelta));
      const isAlive = newStats.health > 0 && newStats.mental > 0;
      if (!isAlive) {
        saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money + money2, hasTrait(c, "poissard")));
        clearSave();
      }
      const haul = [
        money2 > 0 ? L(`${money2}\u20AC de consigne`, `\u20AC${money2} of deposit`) : "",
        added > 0 ? L(`${added} bricole${added > 1 ? "s" : ""}`, `${added} part${added > 1 ? "s" : ""}`) : "",
        found.length > 0 ? found.join(", ") : ""
      ].filter(Boolean).join(L(", ", ", "));
      const savedNote = action.busted && (money2 > 0 || added > 0) ? L(" Vous avez quand m\xEAme fil\xE9 avec ce que vous teniez.", " You still legged it with what was in your hands.") : "";
      const text = action.busted ? L(
        `\u{1F400} Le tas a gagn\xE9. Ce que vous aviez sorti est rest\xE9 au fond, avec le reste.${savedNote} ${deep >= 3 ? "Il fallait remonter plus t\xF4t." : "\xC7a arrive."}`,
        `\u{1F400} The pile won. What you'd pulled out stayed down there with the rest.${savedNote} ${deep >= 3 ? "You should have climbed out sooner." : "It happens."}`
      ) : haul === "" ? L(
        "\u{1F5D1}\uFE0F Vingt minutes les bras dans les ordures pour rien. M\xEAme les rats vous ont regard\xE9 avec piti\xE9.",
        "\u{1F5D1}\uFE0F Twenty minutes elbow-deep in rubbish for nothing. Even the rats looked at you with pity."
      ) : L(
        `\u267B\uFE0F Vous ressortez avec ${haul}.${deep >= 3 ? " Vous \xEAtes descendu loin, et vous \xEAtes remont\xE9 \xE0 temps." : ""}`,
        `\u267B\uFE0F You come out with ${haul}.${deep >= 3 ? " You went deep, and you got out in time." : ""}`
      );
      progress("fouilles", 1);
      progress("bricoles", added + found.length);
      if (money2 > 0) progress("euros", money2);
      return {
        ...state,
        character: { ...c, stats: newStats, money: c.money + money2, inventory, alive: isAlive },
        eventResult: { text, statChanges: statDelta, moneyChange: money2, ...salvageResultImage(action.busted, haul === "") },
        screen: isAlive ? "main" : "game-over"
      };
    }
    case "STEAL": {
      if (!state.character || state.dayActions >= state.maxDayActions || state.screen !== "main") return state;
      const stealChar = { ...state.character, stealCount: (state.character.stealCount ?? 0) + 1 };
      if (Math.random() < 0.34) {
        const stealEvt = randomFromArray(freshPool(STEAL_EVENTS, stealChar.recentEvents));
        return {
          ...state,
          character: { ...stealChar, recentEvents: rememberEvent(stealChar.recentEvents, stealEvt.id) },
          screen: "event",
          currentEvent: stealEvt,
          dayActions: state.dayActions + 1
        };
      }
      return {
        ...state,
        character: stealChar,
        screen: "steal-game",
        dayActions: state.dayActions + 1
      };
    }
    case "RESOLVE_STEAL": {
      if (!state.character) return state;
      const c = state.character;
      const target = getHeistTarget(action.targetId) || HEIST_TARGETS[0];
      if (action.tier === "fail") {
        const repercussion = Math.random();
        if (target.catcher === "vigile" && repercussion < 0.7) {
          const enemy = ENEMIES.find((e) => e.name === "Vigile de Choc");
          return {
            ...state,
            screen: "combat",
            currentCombat: makeCombatState(enemy, c),
            combatLog: [
              L(`\u{1F9BA} Pris la main sur ${target.label} ! Une ombre massive bouche la sortie : le Vigile de Choc. Il craque ses cervicales.`, `\u{1F9BA} Caught with your hand on ${target.labelEn}! A massive shadow blocks the exit: the Shock Guard. He cracks his neck.`),
              L("\u26A0\uFE0F Celui-l\xE0 ne plaisante pas. La fuite est peut-\xEAtre la meilleure carte.", "\u26A0\uFE0F This one isn't joking. Fleeing might be your best card.")
            ]
          };
        }
        if (target.catcher === "commercant" && repercussion < 0.5) {
          const enemy = ENEMIES.find((e) => e.name === "Commer\xE7ant Furieux");
          return {
            ...state,
            screen: "combat",
            currentCombat: makeCombatState(enemy, c),
            combatLog: [L(`\u{1F621} Vous \xEAtes surpris la main sur ${target.label} ! Le commer\xE7ant retrousse ses manches...`, `\u{1F621} You're caught with your hand on ${target.labelEn}! The shopkeeper rolls up his sleeves...`)]
          };
        }
        if (target.catcher === "police" && repercussion < 0.5) {
          const amende = Math.min(c.money, target.difficulty === "grand" ? 12 : target.difficulty === "risque" ? 5 : 3);
          const statDelta3 = { dignity: -15, mental: -8 };
          const newStats3 = withFirstDayNet(c, applyStatDelta(c.stats, statDelta3));
          const isAlive2 = newStats3.health > 0 && newStats3.mental > 0;
          if (!isAlive2) {
            saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money - amende, hasTrait(c, "poissard")));
            clearSave();
          }
          return {
            ...state,
            character: { ...c, stats: newStats3, money: c.money - amende, respect: c.respect - 3, alive: isAlive2 },
            dayActions: state.maxDayActions,
            eventResult: {
              // Le bandeau juste dessous annonce la journée perdue : le texte
              // n'a plus à la répéter, il raconte la scène.
              text: L(
                `\u{1F694} Un policier vous cueille la main sur ${target.label}. Banc en bois, fouille, sermon, empreintes${amende > 0 ? `, et ${amende}\u20AC d'amende qu'on prend dans votre poche devant vous` : ". Insolvable, on vous rend vos lacets et un avertissement"}.`,
                `\u{1F694} A cop nabs you with your hand on ${target.labelEn}. Wooden bench, search, lecture, fingerprints${amende > 0 ? `, and a \u20AC${amende} fine taken from your pocket in front of you` : ". Broke, so they hand back your laces and a warning"}.`
              ),
              statChanges: statDelta3,
              moneyChange: -amende,
              respectChange: -3,
              image: "/assets/result-steal-police.webp",
              // Ce que la cellule emporte vraiment : le reste de la journée.
              journeeFinie: Math.max(0, state.maxDayActions - state.dayActions)
            },
            screen: isAlive2 ? "main" : "game-over"
          };
        }
        const rossee = target.catcher === "vigile";
        const statDelta2 = rossee ? { dignity: -14, health: -12, mental: -8 } : { dignity: -12, health: -6, mental: -6 };
        const newStats2 = withFirstDayNet(c, applyStatDelta(c.stats, statDelta2));
        const isAlive = newStats2.health > 0 && newStats2.mental > 0;
        if (!isAlive) {
          saveHighScore(c.name, c.day, computeScore(c.day, c.respect, c.money, hasTrait(c, "poissard")));
          clearSave();
        }
        return {
          ...state,
          character: { ...c, stats: newStats2, respect: c.respect - 2, alive: isAlive },
          eventResult: {
            text: rossee ? L(`\u{1F9BA} Rat\xE9 ! Les vigiles vous \xAB raccompagnent \xBB loin de ${target.label}, r\xE9glementairement mais tr\xE8s fermement. Tout fait mal.`, `\u{1F9BA} Failed! The guards "escort" you away from ${target.labelEn}, by the book but very firmly. Everything hurts.`) : L(`\u{1F6A8} Rat\xE9 ! Rep\xE9r\xE9 en tentant de voler ${target.label}, vous fuyez sous les insultes, un peu amoch\xE9.`, `\u{1F6A8} Failed! Spotted trying to steal ${target.labelEn}, you flee amid insults, a little battered.`),
            statChanges: statDelta2,
            respectChange: -2,
            image: "/assets/result-steal-fail.webp"
          },
          screen: isAlive ? "main" : "game-over"
        };
      }
      const jackpot = action.tier === "jackpot";
      const hot = action.tier === "hot";
      const roll = target.moneyMin + Math.floor(Math.random() * (target.moneyMax - target.moneyMin + 1));
      const moneyDelta = jackpot ? target.item ? target.moneyMin + 2 : target.moneyMax + 3 : hot ? Math.min(target.moneyMax, roll + 2) : roll;
      const respectDelta = hot ? target.difficulty === "grand" ? 3 : 2 : jackpot ? 2 : 0;
      const sacPlein = c.inventory.length >= bagCapacity(c);
      const convoite = target.item && (jackpot || Math.random() < 0.5) ? target.item : void 0;
      const gotItem = convoite && !sacPlein ? convoite : void 0;
      const statDelta = jackpot ? { dignity: -4, mental: 2 } : hot ? { dignity: -5, mental: 5 } : { dignity: -6, mental: 2 };
      const newStats = withFirstDayNet(c, applyStatDelta(c.stats, statDelta));
      const itemNote = gotItem ? L(` Et dans le sac : ${gotItem.name} ${gotItem.emoji}.`, ` And into the bag: ${gotItem.name} ${gotItem.emoji}.`) : convoite ? L(` ${convoite.name} ${convoite.emoji} \xE9tait l\xE0, mais votre sac est plein \xE0 craquer : vous le laissez sur place, la mort dans l'\xE2me.`, ` ${convoite.name} ${convoite.emoji} was right there, but your bag is bursting: you leave it behind, heartbroken.`) : "";
      const text = (jackpot ? L(`\u{1F48E} Coup de ma\xEEtre ! Vous repartez avec ${target.label} sans que personne ne remarque rien : ${moneyDelta}\u20AC.`, `\u{1F48E} Masterstroke! You walk off with ${target.labelEn} without anyone noticing a thing: \u20AC${moneyDelta}.`) : hot ? L(`\u{1F6A8} Sortie en plein bouclage ! Vous filez avec ${target.label} sous le nez des renforts. Le quartier ne parle que de votre culot : ${moneyDelta}\u20AC.`, `\u{1F6A8} Out mid-lockdown! You slip away with ${target.labelEn} right under the reinforcements' noses. The block talks of nothing but your nerve: \u20AC${moneyDelta}.`) : L(`\u{1F92B} Vol r\xE9ussi. Vous filez avec ${target.label}, le c\u0153ur battant. \xC7a vaut bien ${moneyDelta}\u20AC.`, `\u{1F92B} Theft successful. You slip away with ${target.labelEn}, heart pounding. Worth a good \u20AC${moneyDelta}.`)) + itemNote;
      return {
        ...state,
        character: {
          ...c,
          stats: newStats,
          money: c.money + moneyDelta,
          respect: c.respect + respectDelta,
          inventory: gotItem ? [...c.inventory, gotItem] : c.inventory,
          // Un grand coup réussi met toute la ville sur les nerfs pour la
          // journée : plus de grosse cible avant demain, ici comme ailleurs.
          // Le voyage étant gratuit, un quota par quartier ne coûterait rien.
          bigScoreDay: target.difficulty === "grand" ? c.day : c.bigScoreDay
        },
        eventResult: {
          text,
          statChanges: statDelta,
          moneyChange: moneyDelta,
          respectChange: respectDelta,
          image: "/assets/result-steal-success.webp",
          // L'objet laissé sur place parce que le sac débordait : il est nommé
          // dans le texte, il vient de vous échapper, et il peut encore être
          // rattrapé (voir GARDER_OBJET).
          refusedItem: convoite && !gotItem ? convoite : void 0
        },
        screen: "main"
      };
    }
    case "REST": {
      if (!state.character || state.dayActions >= state.maxDayActions || state.screen !== "main") return state;
      if (dueSursaut(state.character)) {
        return { ...state, screen: "event", currentEvent: SURSAUT_EVENT, dayActions: state.dayActions + 1 };
      }
      const restEvents = generateRestEvents(state.character.location, state.character);
      if (restEvents.length === 0) return state;
      const restEvent = randomFromArray(restEvents);
      return {
        ...state,
        screen: "event",
        currentEvent: restEvent,
        dayActions: state.dayActions + 1,
        character: { ...state.character, recentEvents: rememberEvent(state.character.recentEvents, restEvent.id) }
      };
    }
    case "CLAIM_CARTON": {
      if (!state.character) return state;
      const c = state.character;
      if (c.inventory.length >= bagCapacity(c)) return state;
      return { ...state, character: { ...c, inventory: [...c.inventory, { ...action.item }] } };
    }
    case "KEEP_FACE": {
      if (!state.character || !state.eventResult || state.eventResult.faceKept) return state;
      const c = state.character;
      const perdu = Math.abs(state.eventResult.statChanges?.dignity ?? 0);
      const avant = Math.min(100, c.stats.dignity + perdu);
      const cible = DIGNITY_TIERS.find((t) => avant >= t.min);
      if (!cible || c.stats.dignity >= cible.min) return state;
      return {
        ...state,
        character: { ...c, stats: { ...c.stats, dignity: cible.min } },
        eventResult: { ...state.eventResult, faceKept: true }
      };
    }
    case "DOUBLE_REWARD": {
      if (!state.character || !state.eventResult) return state;
      const gain = state.eventResult.moneyChange || 0;
      if (gain <= 0 || state.eventResult.doubled) return state;
      return {
        ...state,
        character: { ...state.character, money: state.character.money + gain },
        eventResult: { ...state.eventResult, doubled: true }
      };
    }
    /*
     * UNE HEURE DE PLUS AU CHAUD — la nuit rendue à moitié.
     *
     * Le bilan vient d'afficher, en chiffres, ce que la nuit a coûté. C'est le
     * seul instant du jeu où la perte est à l'écran, chiffrée, et pas encore
     * digérée : une vidéo récompensée se vend mieux contre une perte fraîche
     * que contre un gain hypothétique.
     *
     * On rend la MOITIÉ de chaque jauge perdue, arrondie au supérieur, et rien
     * d'autre : ni argent, ni objet, ni action. Le bilan n'existe que si le
     * personnage a survécu à la nuit (voir NEXT_DAY), donc cette offre ne
     * ressuscite jamais personne — elle adoucit une nuit traversée.
     */
    case "RECOVER_NIGHT": {
      const bilan = state.daySummary;
      if (!state.character || !bilan || bilan.recovered) return state;
      const c = state.character;
      const rendu = {};
      const stats = { ...c.stats };
      Object.keys(bilan.deltas).forEach((k) => {
        const perdu = bilan.deltas[k] ?? 0;
        if (perdu >= 0) return;
        const gain = Math.min(Math.ceil(-perdu / 2), 100 - stats[k]);
        if (gain <= 0) return;
        stats[k] += gain;
        rendu[k] = gain;
      });
      if (!Object.keys(rendu).length) return state;
      return {
        ...state,
        character: { ...c, stats: clampStats(stats) },
        daySummary: { ...bilan, recovered: rendu }
      };
    }
    /*
     * UNE POCHE DE PLUS — rattraper l'objet que le sac a refusé.
     *
     * Le refus est visuel et immédiat : l'objet a un nom, une image, il était
     * dans la main, et le texte vient d'écrire qu'on le laisse sur place. On
     * ne vend donc pas « deux places de plus », qui est une abstraction, mais
     * cet objet-là.
     *
     * Le sac dépasse d'un cran sa capacité, et c'est assumé : tous les autres
     * chemins vérifient la place AVANT d'ajouter, si bien qu'il ne rentrera
     * plus rien tant que le joueur n'aura pas vendu ou consommé quelque chose.
     * La contrepartie est un objet, jamais une capacité durable.
     */
    /*
     * RATTRAPER LE CONTRAT.
     *
     * Effet du quasi-gain : un joueur qui rate de loin hausse les épaules, un
     * joueur qui rate de deux euros ne le supporte pas. Le bilan ne propose
     * donc l'offre que sur un échec à moins de 20 % du but (voir NEXT_DAY et
     * `SEUIL_PRESQUE`), et la récompense est exactement celle du contrat —
     * rien de plus, sinon la publicité paierait mieux que le jeu.
     */
    case "RATTRAPER_CONTRAT": {
      const bilan = state.daySummary;
      if (!state.character || !bilan?.contratRate || bilan.contratRattrape) return state;
      const def = getContract(bilan.contratRate.id);
      if (!def) return state;
      const c = state.character;
      const stats = { ...c.stats };
      if (def.reward.stats) {
        Object.entries(def.reward.stats).forEach(([k, v]) => {
          if (v) stats[k] += v;
        });
      }
      return {
        ...state,
        character: {
          ...c,
          stats: clampStats(stats),
          money: c.money + (def.reward.money || 0),
          respect: c.respect + (def.reward.respect || 0)
        },
        daySummary: { ...bilan, contratRattrape: true }
      };
    }
    case "GARDER_OBJET": {
      const res = state.eventResult;
      if (!state.character || !res?.refusedItem || res.itemKept) return state;
      return {
        ...state,
        character: { ...state.character, inventory: [...state.character.inventory, { ...res.refusedItem }] },
        eventResult: { ...res, itemKept: true }
      };
    }
    case "TRAVEL": {
      if (!state.character) return state;
      const c = state.character;
      if (action.location === c.location) return state;
      const hasOrientation = c.traits.some((t) => t.id === "orientation");
      const movedStats = hasOrientation ? c.stats : clampStats({ ...c.stats, hunger: c.stats.hunger - 3, sleep: c.stats.sleep - 3 });
      const dejaVus = c.travelsToday ?? [];
      const premiereFois = !dejaVus.includes(action.location);
      const travelEvent = premiereFois ? generateTravelEvent(c.location, action.location, c) : null;
      const newChar = {
        ...c,
        location: action.location,
        stats: movedStats,
        travelsToday: premiereFois ? [...dejaVus, action.location] : dejaVus
      };
      if (travelEvent) {
        return { ...state, character: { ...newChar, recentEvents: rememberEvent(newChar.recentEvents, travelEvent.id) }, screen: "event", currentEvent: travelEvent };
      }
      return { ...state, character: newChar, screen: "main" };
    }
    case "CHOOSE_EVENT": {
      if (!state.currentEvent || !state.character) return state;
      const choice = state.currentEvent.choices[action.choiceIndex];
      let outcome = choice.outcomes[0];
      const outcomeScore = (o) => (o.moneyChange || 0) + (o.respectChange || 0) * 2 + Object.values(o.statChanges || {}).reduce((a, b) => a + (b || 0), 0) + (o.itemGain ? 5 : 0) - (o.itemLoss ? 3 : 0);
      if (action.boosted) {
        outcome = [...choice.outcomes].sort((a, b) => outcomeScore(b) - outcomeScore(a))[0];
      } else {
        const roll = Math.random();
        let cumProb = 0;
        for (const o of choice.outcomes) {
          cumProb += o.probability;
          if (roll <= cumProb) {
            outcome = o;
            break;
          }
        }
        if (choice.outcomes.length > 1 && state.character.traits.some((t) => t.id === "poissard") && Math.random() < 0.25) {
          outcome = [...choice.outcomes].sort((a, b) => outcomeScore(a) - outcomeScore(b))[0];
        }
      }
      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key] += val;
        });
      }
      newStats = withFirstDayNet(state.character, clampStats(newStats));
      let newMoney = Math.max(0, state.character.money + (outcome.moneyChange || 0));
      if (newMoney < 0) newMoney = 0;
      const newRespect = state.character.respect + (outcome.respectChange || 0);
      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < bagCapacity({ inventory: newInventory })) {
        newInventory.push(outcome.itemGain);
      }
      if (outcome.itemLoss) {
        newInventory = newInventory.filter((i) => i.id !== outcome.itemLoss);
      }
      let newFlags = [...state.character.activeFlags];
      if (outcome.addFlag && !newFlags.includes(outcome.addFlag)) {
        newFlags.push(outcome.addFlag);
      }
      if (outcome.removeFlag) {
        newFlags = newFlags.filter((f) => f !== outcome.removeFlag);
      }
      const isAlive = newStats.health > 0 && newStats.mental > 0;
      if (!isAlive) {
        const score = computeScore(state.character.day, newRespect, newMoney, hasTrait(state.character, "poissard"));
        saveHighScore(state.character.name, state.character.day, score);
        clearSave();
      }
      const resultValue = (outcome.moneyChange || 0) + Object.values(outcome.statChanges || {}).reduce((a, b) => a + (b || 0), 0) + (outcome.respectChange || 0);
      const variant = `/assets/result-${state.currentEvent.id}-${resultValue > 0 ? "good" : "bad"}.webp`;
      return {
        ...state,
        screen: isAlive ? "event" : "game-over",
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory, alive: isAlive, activeFlags: newFlags },
        currentEvent: null,
        eventResult: { text: outcome.text, statChanges: outcome.statChanges, moneyChange: outcome.moneyChange, respectChange: outcome.respectChange, image: variant, fallbackImage: state.currentEvent.image }
      };
    }
    case "DISMISS_RESULT":
      return { ...state, eventResult: null, screen: state.character?.alive ? "main" : "game-over" };
    case "DISMISS_DAY_SUMMARY":
      return { ...state, daySummary: null };
    case "NEXT_DAY": {
      if (!state.character || state.daySummary || state.screen !== "main") return state;
      const ch = state.character;
      progress("jours", 1);
      const nextWeather = state.nextWeather ?? getNextWeather(state.weather, ch.day);
      const meteoApres = getNextWeather(nextWeather, ch.day + 1);
      const weatherData = WEATHER_TYPES[state.weather];
      const weatherPenalty = weatherData.dailyPenalty;
      const traits = new Set(ch.traits.map((t) => t.id));
      const cold = state.weather === "snow" || state.weather === "storm" || state.weather === "cloudy";
      const baseDecayed = applyDailyDecay(ch.stats);
      const s = {
        health: baseDecayed.health + (weatherPenalty.health || 0),
        mental: baseDecayed.mental + (weatherPenalty.mental || 0),
        hunger: baseDecayed.hunger + (weatherPenalty.hunger || 0),
        thirst: baseDecayed.thirst + (weatherPenalty.thirst || 0),
        sleep: baseDecayed.sleep + (weatherPenalty.sleep || 0),
        dignity: baseDecayed.dignity + (weatherPenalty.dignity || 0)
      };
      const notes = [];
      const notesEn = [];
      let inventory = ch.inventory;
      let bonusMoney = 0;
      if (traits.has("metabolisme")) s.health += 6;
      if (traits.has("estomac-acier")) s.hunger += 5;
      if (traits.has("optimiste")) s.mental += 5;
      if (traits.has("insomniaque")) s.sleep += 8;
      if (traits.has("sommeil-plomb")) s.sleep += 6;
      if (traits.has("resistant-froid") && cold) {
        s.health += Math.abs(weatherPenalty.health || 0);
        notes.push("\u2744\uFE0F Le froid ne vous atteint pas.");
        notesEn.push("\u2744\uFE0F The cold doesn't touch you.");
      }
      if (traits.has("collectionneur") && new Set(ch.inventory.map((i) => i.id)).size >= 14) {
        s.mental += 6;
        notes.push("\u{1F4E6} Votre collection vous r\xE9conforte.");
        notesEn.push("\u{1F4E6} Your hoard comforts you.");
      }
      if (traits.has("phobie-rats") && ch.location === "zone-industrielle") {
        s.mental -= 8;
        notes.push("\u{1F400} Les rats du coin vous rongent le moral.");
        notesEn.push("\u{1F400} The local rats gnaw at your nerves.");
      }
      if (traits.has("main-verte") && Math.random() < 0.5) {
        s.hunger += 12;
        notes.push("\u{1F33F} Vos plants ont donn\xE9 : un petit repas gratuit.");
        notesEn.push("\u{1F33F} Your plants bore fruit: a small free meal.");
      }
      if (traits.has("ami-pigeons")) {
        const roll = Math.random();
        if (roll < 0.35 && inventory.length < bagCapacity({ inventory })) {
          const gift = STARTING_ITEMS[randomFromArray(["cable-usb", "crayon", "graines", "harmonica-casse"])];
          if (gift) {
            inventory = [...inventory, { ...gift }];
            notes.push(`\u{1F426} Un pigeon vous d\xE9pose : ${gift.name}.`);
            notesEn.push(`\u{1F426} A pigeon drops off: ${tc(gift.name)}.`);
          }
        } else if (roll < 0.6) {
          bonusMoney += 2;
          notes.push("\u{1F426} Vos pigeons vous rapportent 2\u20AC de bricoles brillantes.");
          notesEn.push("\u{1F426} Your pigeons bring you \u20AC2 of shiny trinkets.");
        }
      }
      const usesEtabli = [];
      if (cold && ch.inventory.some((i) => i.id === "craft-rechaud")) {
        const perdu = Math.min(Math.abs(weatherPenalty.health || 0), Math.max(0, ch.stats.health - s.health));
        if (perdu > 0) {
          s.health += perdu;
          notes.push("\u{1F525} Le r\xE9chaud a tenu toute la nuit : le froid ne vous a rien pris.");
          notesEn.push("\u{1F525} The stove burned all night: the cold took nothing from you.");
          usesEtabli.push("craft-rechaud");
        }
      }
      if (ch.inventory.some((i) => i.id === "craft-matelas")) {
        const perdu = Math.max(0, ch.stats.sleep - s.sleep);
        if (perdu > 0) {
          s.sleep += perdu;
          notes.push("\u{1F6CF}\uFE0F Le matelas de carton vous a rendu votre nuit enti\xE8re.");
          notesEn.push("\u{1F6CF}\uFE0F The cardboard mattress gave you your whole night back.");
          usesEtabli.push("craft-matelas");
        }
      }
      for (const id of usesEtabli) {
        if (Math.random() >= usureNuit(ch)) continue;
        const casse = inventory.find((i) => i.id === id);
        if (!casse) continue;
        inventory = removeOne(inventory, id);
        notes.push(`\u{1F494} ${casse.name} n'a pas tenu une nuit de plus. Il faudra en refaire un.`);
        notesEn.push(`\u{1F494} The ${tc(casse.name)} didn't survive another night. You'll have to build a new one.`);
      }
      let respectBonus = 0;
      let contratRate;
      const cDef = state.contract ? getContract(state.contract.id) : void 0;
      if (cDef) {
        const success = cDef.needsFlag ? state.contract.done : !!cDef.check?.(ch);
        if (success) {
          if (cDef.reward.stats) Object.entries(cDef.reward.stats).forEach(([k, v]) => {
            if (v) s[k] += v;
          });
          bonusMoney += cDef.reward.money || 0;
          respectBonus += cDef.reward.respect || 0;
          notes.push(`${cDef.emoji} Contrat rempli (${cDef.rewardLabel}) : ${cDef.label}.`);
          notesEn.push(`${cDef.emoji} Contract fulfilled (${cDef.rewardLabelEn}): ${cDef.labelEn}.`);
        } else {
          notes.push(`${cDef.emoji} Contrat manqu\xE9 : ${cDef.label}. Demain, peut-\xEAtre.`);
          notesEn.push(`${cDef.emoji} Contract missed: ${cDef.labelEn}. Tomorrow, maybe.`);
          const p = cDef.progress?.(ch);
          if (p && p.cible > 0 && p.valeur >= p.cible * SEUIL_PRESQUE) {
            contratRate = { id: cDef.id, valeur: p.valeur, cible: p.cible };
          }
        }
      }
      if (meteoApres === "snow" && nextWeather !== "snow") {
        notes.push("\u2744\uFE0F Le ciel a vir\xE9 au blanc sale. Demain, il neigera : trouvez de quoi tenir.");
        notesEn.push("\u2744\uFE0F The sky has turned dirty white. Tomorrow it will snow: find something to get through it.");
      }
      if (nextWeather === "snow") {
        notes.push("\u2744\uFE0F Il neige. La ville est belle et vous n'\xEAtes pas \xE0 l'abri.");
        notesEn.push("\u2744\uFE0F It's snowing. The city looks lovely and you are outside.");
      }
      const nextContract = { id: randomFromArray(CONTRACTS).id, done: false };
      const nextDef = getContract(nextContract.id);
      notes.push(`\u{1F4CB} Contrat du jour : ${nextDef.label} (${nextDef.rewardLabel}).`);
      notesEn.push(`\u{1F4CB} Today's contract: ${nextDef.labelEn} (${nextDef.rewardLabelEn}).`);
      const crossed = STREET_TITLES.find((t) => t.day === ch.day + 1);
      if (crossed) {
        respectBonus += crossed.respect;
        notes.push(`\u{1F3C5} La rue vous appelle d\xE9sormais \xAB ${crossed.fr} \xBB (+${crossed.respect} respect).`);
        notesEn.push(`\u{1F3C5} The street now calls you "${crossed.en}" (+${crossed.respect} respect).`);
      }
      const newDay = ch.day + 1;
      const prevClosures = ch.shopClosures || [];
      prevClosures.filter((c) => c.untilDay === newDay).forEach((c) => {
        const sh = SHOPS.find((s2) => s2.id === c.shopId);
        if (sh) {
          notes.push(`\u{1F513} ${sh.emoji} ${sh.name} a rouvert. La vie reprend.`);
          notesEn.push(`\u{1F513} ${sh.emoji} ${tc(sh.name)} has reopened. Life goes on.`);
        }
      });
      let shopClosures = prevClosures.filter((c) => c.untilDay > newDay);
      const closureChance = Math.min(0.55, 0.12 + newDay * 0.03);
      if (shopClosures.length < 2 && Math.random() < closureChance) {
        const nc = rollShopClosure(shopClosures, newDay);
        if (nc) {
          shopClosures = [...shopClosures, nc];
          const sh = SHOPS.find((s2) => s2.id === nc.shopId);
          const days = nc.untilDay - newDay;
          notes.push(`\u{1F6AB} ${sh.emoji} ${sh.name} est ferm\xE9 (${days} j) : ${nc.reason}`);
          notesEn.push(`\u{1F6AB} ${sh.emoji} ${tc(sh.name)} is closed (${days}d): ${nc.reasonEn}`);
        }
      }
      let vole = ch.vole;
      if (ch.compagnon?.louche && ch.compagnon.jour === ch.day) {
        const cible = inventory.map((it, i) => ({ it, i })).sort((a, b) => (b.it.value || 0) - (a.it.value || 0))[0];
        const argent = cible ? 0 : Math.min(ch.money, 3 + Math.floor(Math.random() * 5));
        if (cible || argent > 0) {
          if (cible) inventory = [...inventory.slice(0, cible.i), ...inventory.slice(cible.i + 1)];
          else bonusMoney -= argent;
          vole = {
            nom: ch.compagnon.nom,
            seed: ch.compagnon.seed,
            gender: ch.compagnon.gender,
            quartier: ch.location,
            jour: ch.day + 1,
            objet: cible ? { ...cible.it } : void 0,
            argent: cible ? void 0 : argent
          };
          const quoi = cible ? `${cible.it.emoji} ${cible.it.name}` : `${argent}\u20AC`;
          const quoiEn = cible ? `${cible.it.emoji} ${tc(cible.it.name)}` : `\u20AC${argent}`;
          notes.push(`\u{1F6AC} ${ch.compagnon.nom} est parti avant le jour, avec ${quoi}. Il tra\xEEne encore dans le quartier.`);
          notesEn.push(`\u{1F6AC} ${ch.compagnon.nom} left before dawn, with ${quoiEn}. Still around the neighbourhood.`);
        }
      }
      const decayedStats = withFirstDayNet(ch, clampStats(s));
      const isAlive = decayedStats.health > 0 && decayedStats.mental > 0;
      if (!isAlive) {
        const score = computeScore(ch.day, ch.respect, ch.money, hasTrait(ch, "poissard"));
        saveHighScore(ch.name, ch.day, score);
        clearSave();
      }
      const deltas = {};
      Object.keys(decayedStats).forEach((k) => {
        const d = decayedStats[k] - ch.stats[k];
        if (d !== 0) deltas[k] = d;
      });
      return {
        ...state,
        character: { ...ch, stats: decayedStats, day: ch.day + 1, alive: isAlive, inventory, money: ch.money + bonusMoney, respect: ch.respect + respectBonus, shopClosures, travelsToday: [], fountainDay: void 0, fountainToday: 0, vole },
        dayActions: 0,
        screen: isAlive ? "main" : "game-over",
        weather: nextWeather,
        nextWeather: meteoApres,
        contract: isAlive ? nextContract : null,
        daySummary: isAlive ? { day: ch.day + 1, weather: nextWeather, deltas, moneyChange: bonusMoney, notes, notesEn, contratRate } : null
      };
    }
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "USE_ITEM": {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex((i) => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      const gourmand = hasTrait(state.character, "ventre-pattes");
      if (!item.effect && gourmand && item.type === "junk") {
        const newInv2 = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
        const junkDelta = { hunger: 10, dignity: -2 };
        return {
          ...state,
          character: { ...state.character, stats: applyStatDelta(state.character.stats, junkDelta), inventory: newInv2 },
          eventResult: { text: L(`Vous mangez\u2026 ${item.name}. Oui, \xE7a se mange. Enfin, VOUS, vous le mangez.`, `You eat\u2026 the ${tc(item.name)}. Yes, it's edible. Well, YOU eat it.`), statChanges: junkDelta, image: "/assets/result-objet-mange.webp" }
        };
      }
      if (!item.effect) return state;
      const effect = { ...item.effect };
      if (gourmand && (effect.hunger ?? 0) > 0) effect.hunger = Math.round(effect.hunger * 1.25);
      let newStats = { ...state.character.stats };
      Object.entries(effect).forEach(([key, val]) => {
        if (val) newStats[key] += val;
      });
      newStats = clampStats(newStats);
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, stats: newStats, inventory: newInv },
        eventResult: { text: L(`Vous utilisez ${item.name}. \xC7a fait du bien !`, `You use the ${tc(item.name)}. That feels good!`), statChanges: effect, image: "/assets/result-objet-utilise.webp" }
      };
    }
    case "SELL_ITEM": {
      if (!state.character) return state;
      const idx = state.character.inventory.findIndex((i) => i.id === action.itemId);
      if (idx === -1) return state;
      const item = state.character.inventory[idx];
      const price = getSellPrice(item);
      const newInv = [...state.character.inventory.slice(0, idx), ...state.character.inventory.slice(idx + 1)];
      return {
        ...state,
        character: { ...state.character, money: state.character.money + price, inventory: newInv },
        eventResult: { text: L(`Vous revendez ${item.name} pour ${price}\u20AC. Chaque euro compte.`, `You sell the ${tc(item.name)} for \u20AC${price}. Every euro counts.`), moneyChange: price, image: "/assets/result-objet-vendu.webp" }
      };
    }
    case "CRAFT": {
      if (!state.character) return state;
      const c = state.character;
      const recipe = RECIPES.find((r) => r.id === action.recipeId);
      if (!recipe) return state;
      if (recipe.advanced && !hasTrait(c, "bricoleur")) return state;
      const cost = recipeCost(recipe, c);
      const rmIdx = pickMaterials(c, cost);
      if (rmIdx.length < cost) return state;
      const rm = new Set(rmIdx);
      const result = recipe.make();
      const newInv = c.inventory.filter((_, i) => !rm.has(i));
      newInv.push(result);
      return {
        ...state,
        character: { ...c, inventory: newInv },
        eventResult: {
          text: L(
            `Vos mains se souviennent : vous bricolez ${recipe.name} ! Rien ne se perd, tout se transforme.`,
            `Your hands remember: you tinker up ${tc(recipe.name)}! Nothing is lost, everything gets remade.`
          ),
          // L'objet fabriqué (craft-<id>.webp) ; repli scène dessinée si absent.
          image: `/assets/${result.id}.webp`
        }
      };
    }
    case "START_COMBAT": {
      if (!state.character) return state;
      return {
        ...state,
        screen: "combat",
        /*
         * Aller chercher son voleur ne se tente qu'une fois : la trace
         * s'efface au moment où le combat commence, pas à la victoire. Gagner
         * rend ce qu'il avait pris — c'est le butin de l'ennemi, le code de
         * victoire s'en charge déjà. Perdre, c'est perdre pour de bon.
         */
        character: action.contreVoleur ? { ...state.character, vole: void 0 } : state.character,
        currentCombat: makeCombatState(action.enemy, state.character),
        combatLog: [L(`${action.enemy.emoji} ${action.enemy.name} appara\xEEt ! ${action.enemy.description}`, `${action.enemy.emoji} ${tc(action.enemy.name)} appears! ${tc(action.enemy.description)}`)]
      };
    }
    // Duel de signes : résout la manche (triangle, coup spécial, piège) et
    // oriente la suite, riposte (gagnée), esquive (perdue), manche suivante
    // (égalité ou effet neutre).
    case "PLAY_SIGN": {
      if (!state.character || !state.currentCombat || state.currentCombat.phase !== "sign") return state;
      const c = state.character;
      const combat = state.currentCombat;
      const logs = [...state.combatLog];
      const eSign = combat.enemySign;
      const eDef = SIGNS[eSign];
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      const playerSign = action.sign === "special" ? combat.lastPlayerSign ?? null : action.sign;
      const trapAfter = Math.max(0, combat.trapRounds - 1);
      const drawCount = (base, cap) => {
        let d = base;
        if (c.traits.some((t) => t.id === "collectionneur") && new Set(c.inventory.map((i) => i.id)).size >= 14) d += 1;
        if (c.traits.some((t) => t.id === "optimiste") && c.stats.mental < 30) d += 1;
        return Math.min(cap, d);
      };
      const rechargedSpecial = () => combat.specialCharged || combat.specialId != null && combat.specialUses < 2;
      const nextSignCombat = (over, guaranteedTell = false) => ({
        ...combat,
        hand: [],
        phase: "sign",
        round: combat.round + 1,
        signNonce: combat.signNonce + 1,
        enemyStunned: false,
        trapRounds: trapAfter,
        lastPlayerSign: playerSign,
        ...rollSignRound(enemyLike, c, guaranteedTell, playerSign),
        ...over
      });
      const victoryState = (cUpd) => {
        const lootMoney = combat.loot?.money || 0;
        const lootRespect = combat.loot?.respect || 0;
        const drop = combat.loot?.item && cUpd.inventory.length < bagCapacity(cUpd) ? combat.loot.item : void 0;
        const en = tc(combat.enemyName);
        logs.push(L(`\u{1F389} Victoire ! Vous avez vaincu ${combat.enemyName} !`, `\u{1F389} Victory! You defeated ${en}!`));
        if (drop) logs.push(L(`${drop.emoji} Il l\xE2che : ${drop.name} !`, `${drop.emoji} It drops: ${tc(drop.name)}!`));
        const wasKing = combat.enemyEmoji === "\u{1F451}";
        if (wasKing) logs.push(L("\u{1F451} La couronne vous revient : vous \xEAtes le Roi du Carton !", "\u{1F451} The crown is yours: you are the Cardboard King!"));
        return {
          ...state,
          contract: state.contract?.id === "contrat-combatif" ? { id: state.contract.id, done: true } : state.contract,
          character: {
            ...cUpd,
            money: cUpd.money + lootMoney,
            respect: cUpd.respect + lootRespect,
            inventory: drop ? [...cUpd.inventory, drop] : cUpd.inventory,
            ...wasKing ? { crowned: true, kingsBeaten: (cUpd.kingsBeaten ?? 0) + 1 } : {}
          },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `${L(`Victoire contre ${combat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}\u20AC` : ""} ${lootRespect > 0 ? `+${lootRespect} respect` : ""}`.trim(), `Victory over ${en}! ${lootMoney > 0 ? `+\u20AC${lootMoney}` : ""} ${lootRespect > 0 ? `+${lootRespect} respect` : ""}`.trim())}${drop ? L(` Il l\xE2che ${drop.name} ${drop.emoji} !`, ` It drops the ${tc(drop.name)} ${drop.emoji}!`) : ""}`, moneyChange: lootMoney, respectChange: lootRespect, image: combat.image },
          screen: "main"
        };
      };
      if (combat.trapRounds > 0 && eSign === "strike") {
        const trapDmg = 9;
        const hp = Math.max(0, combat.enemyHealth - trapDmg);
        logs.push(L(`\u{1FAA4} CLAC ! ${combat.enemyName} charge et marche en plein dans le pi\xE8ge \xE0 carton : ${trapDmg} d\xE9g\xE2ts, sonn\xE9 !`, `\u{1FAA4} SNAP! ${tc(combat.enemyName)} charges straight into the cardboard trap: ${trapDmg} damage, stunned!`));
        if (hp <= 0) return victoryState(c);
        return {
          ...state,
          currentCombat: { ...combat, enemyHealth: hp, trapRounds: 0, phase: "draw", hand: generateHand(c, combat, drawCount(2, 3)), enemyStunned: true, specialCharged: rechargedSpecial() },
          combatLog: logs
        };
      }
      if (action.sign === "special") {
        const sp = combat.specialId ? SPECIAL_DEFS.find((s) => s.id === combat.specialId) : void 0;
        if (!sp || !combat.specialCharged || combat.specialUses >= 2) return state;
        const spent = { specialCharged: false, specialUses: combat.specialUses + 1 };
        switch (sp.id) {
          case "haleine": {
            if (eSign === "guard") {
              logs.push(L("\u{1F4A8} Il se pince le nez derri\xE8re sa garde : l'haleine se dissipe et il contre-attaque, furieux !", "\u{1F4A8} It pinches its nose behind its guard: the breath disperses and it counter-attacks, furious!"));
              return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: "dodge", hand: [], dodgePenalty: 1.2 }, combatLog: logs };
            }
            logs.push(L("\u{1F4A8} HALEINE REDOUTABLE ! L'ennemi suffoque, sonn\xE9, son prochain coup sera t\xE9l\xE9graphi\xE9.", "\u{1F4A8} DREADFUL BREATH! The foe gags, stunned, its next move will be telegraphed."));
            return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: "draw", hand: generateHand(c, combat, 3), enemyStunned: true }, combatLog: logs };
          }
          case "piege": {
            if (eSign === "strike") {
              const trapDmg = 9;
              const hp = Math.max(0, combat.enemyHealth - trapDmg);
              logs.push(L(`\u{1FAA4} \xC0 peine pos\xE9, CLAC ! ${combat.enemyName} charge dedans : ${trapDmg} d\xE9g\xE2ts, sonn\xE9 !`, `\u{1FAA4} Barely set, SNAP! ${tc(combat.enemyName)} charges right in: ${trapDmg} damage, stunned!`));
              if (hp <= 0) return victoryState(c);
              return { ...state, currentCombat: { ...combat, ...spent, enemyHealth: hp, trapRounds: 0, phase: "draw", hand: generateHand(c, combat, drawCount(2, 3)), enemyStunned: true }, combatLog: logs };
            }
            logs.push(L("\u{1FAA4} Vous restez hors de port\xE9e et tendez un pi\xE8ge \xE0 carton. Deux manches pour qu'il fonce dedans\u2026", "\u{1FAA4} You stay out of reach and set a cardboard trap. Two rounds for the foe to blunder in\u2026"));
            return { ...state, currentCombat: nextSignCombat({ ...spent, trapRounds: 2 }), combatLog: logs };
          }
          case "pas-de-cote": {
            logs.push(L("\u{1F300} Pas de c\xF4t\xE9 ! Vous tournez autour de lui : son jeu est lu \xE0 livre ouvert.", "\u{1F300} Side step! You circle the foe: its game is an open book."));
            return { ...state, currentCombat: { ...combat, ...spent, tellSign: eSign, tellSure: true, signNonce: combat.signNonce + 1, hand: [] }, combatLog: logs };
          }
          case "desescalade": {
            const chance = Math.min(0.85, 0.35 + c.stats.dignity * 4e-3 + c.respect * 0.01);
            if (Math.random() < chance) {
              logs.push(L("\u{1F54A}\uFE0F Vous trouvez les mots justes. L'affaire se r\xE8gle sans un coup de plus.", "\u{1F54A}\uFE0F You find the right words. The matter settles without another blow."));
              return {
                ...state,
                character: { ...c, respect: c.respect + 2 },
                currentCombat: null,
                combatLog: logs,
                eventResult: { text: L(`Vous d\xE9samorcez l'affrontement avec ${combat.enemyName}, \xE0 la parole. La rue appr\xE9cie le style.`, `You talk ${tc(combat.enemyName)} down, word by word. The street appreciates the style.`), respectChange: 2, image: combat.image },
                screen: "main"
              };
            }
            logs.push(L("\u{1F54A}\uFE0F \xAB On peut en discuter, non ? \xBB Apparemment, non. Il charge !", `\u{1F54A}\uFE0F "Can't we talk this over?" Apparently not. It charges!`));
            return { ...state, currentCombat: { ...combat, ...spent, trapRounds: trapAfter, phase: "dodge", hand: [] }, combatLog: logs };
          }
        }
        return state;
      }
      const pDef = SIGNS[action.sign];
      if (pDef.beats === eSign) {
        logs.push(L(`${pDef.emoji} ${pDef.name} bat ${eDef.name} : vous prenez l'initiative !`, `${pDef.emoji} ${pDef.nameEn} beats ${eDef.nameEn}: you seize the initiative!`));
        return {
          ...state,
          currentCombat: { ...combat, trapRounds: trapAfter, phase: "draw", hand: generateHand(c, combat, drawCount(2, 3)), specialCharged: rechargedSpecial() },
          combatLog: logs
        };
      }
      if (action.sign === eSign) {
        const weapon = bestWeapon(c);
        const heavy = weapon?.combatStyle === "heavy";
        const pDmg = heavy ? 0 : soakDamage(c, 2), eDmg = heavy ? 5 : 3;
        const hp = Math.max(0, c.stats.health - pDmg);
        const eHp = Math.max(0, combat.enemyHealth - eDmg);
        if (heavy) logs.push(L(`\u{1F3CF} Accrochage, ${weapon.name} fait la diff\xE9rence : c'est lui qui encaisse ! (\u2212${eDmg} pour lui)`, `\u{1F3CF} Clash, ${tc(weapon.name)} makes the difference: the foe takes the hit! (\u2212${eDmg} foe)`));
        else logs.push(L(`\u26A1 ${pDef.name} contre ${eDef.name} : accrochage ! (\u2212${pDmg} pour vous, \u2212${eDmg} pour lui)`, `\u26A1 ${pDef.nameEn} meets ${eDef.nameEn}: clash! (\u2212${pDmg} you, \u2212${eDmg} foe)`));
        const cUpd = { ...c, stats: clampStats({ ...c.stats, health: hp }) };
        if (eHp <= 0) return victoryState(cUpd);
        if (hp <= 0) {
          return stateApresMort(state, combatDeathMessage(combat.enemyName), [...logs, L("\u{1F480} Vous vous \xE9croulez dans l'accrochage...", "\u{1F480} You collapse in the scuffle...")]);
        }
        return {
          ...state,
          character: cUpd,
          currentCombat: { ...combat, enemyHealth: eHp, trapRounds: trapAfter, signNonce: combat.signNonce + 1, hand: [], ...rollSignRound(enemyLike, c, false, combat.lastPlayerSign) },
          combatLog: logs
        };
      }
      logs.push(L(`${eDef.emoji} Sa ${eDef.name.toLowerCase()} prend votre ${pDef.name.toLowerCase()} de vitesse : esquivez !`, `${eDef.emoji} Its ${eDef.nameEn.toLowerCase()} beats your ${pDef.nameEn.toLowerCase()}: dodge!`));
      return { ...state, currentCombat: { ...combat, trapRounds: trapAfter, phase: "dodge", hand: [] }, combatLog: logs };
    }
    // Fuite tentée depuis le duel de signes (soupape quand tout va mal :
    // pas besoin de gagner une manche pour avoir le droit de renoncer).
    case "FLEE_ATTEMPT": {
      if (!state.character || !state.currentCombat || state.currentCombat.phase !== "sign") return state;
      const c = state.character;
      const combat = state.currentCombat;
      const logs = [...state.combatLog];
      const hasAgile = c.traits.some((t) => t.id === "agile");
      const isCascadeur = c.job.id === "cascadeur";
      const fleeChance = Math.min(0.85, 0.5 - combat.enemyAttack * 0.012 + (hasAgile ? 0.25 : 0) + (isCascadeur ? 0.12 : 0));
      if (Math.random() < fleeChance) {
        const newStats = clampStats({ ...c.stats, dignity: c.stats.dignity - 5 });
        return {
          ...state,
          character: { ...c, stats: newStats },
          currentCombat: null,
          combatLog: [...logs, L("\u{1F3C3} Vous filez avant l'\xE9change ! Fuite r\xE9ussie !", "\u{1F3C3} You bolt before the exchange! Escape successful!")],
          eventResult: { text: L("Vous avez fui le combat. Votre dignit\xE9 en prend un coup...", "You fled the fight. Your dignity takes a hit..."), statChanges: { dignity: -5 }, image: combat.image },
          screen: "main"
        };
      }
      const dmg = soakDamage(c, Math.max(2, Math.round(combat.enemyAttack * (0.5 + Math.random() * 0.4))));
      const hp = Math.max(0, c.stats.health - dmg);
      if (hp <= 0) return stateApresMort(state, combatDeathMessage(combat.enemyName), [...logs, L(`\u274C Fuite rat\xE9e ! ${combat.enemyName} vous rattrape ! ${dmg} d\xE9g\xE2ts.`, `\u274C Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`), L("\u{1F480} Vous succombez \xE0 vos blessures...", "\u{1F480} You succumb to your wounds...")]);
      logs.push(L(`\u274C Fuite rat\xE9e ! ${combat.enemyName} vous rattrape ! ${dmg} d\xE9g\xE2ts.`, `\u274C Escape failed! ${tc(combat.enemyName)} catches you! ${dmg} damage.`));
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      return {
        ...state,
        character: { ...c, stats: clampStats({ ...c.stats, health: hp, dignity: c.stats.dignity - 3 }) },
        currentCombat: { ...combat, phase: "sign", round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], ...rollSignRound(enemyLike, c, false, combat.lastPlayerSign) },
        combatLog: logs
      };
    }
    // Fin de l'esquive de rattrapage (manche perdue au signe) : on encaisse.
    // Parfaite (0 touche) = contre-tempo, une riposte réduite. Sinon, retour
    // au duel de signes.
    case "DODGE_RESULT": {
      if (!state.character || !state.currentCombat) return state;
      const c = state.character;
      const combat = state.currentCombat;
      const hasOsMousse = c.traits.some((t) => t.id === "os-mousse");
      const hasFroid = c.traits.some((t) => t.id === "resistant-froid");
      const effAtk = Math.max(3, combat.enemyAttack - combat.enemyAtkDebuff);
      const brut = Math.max(2, Math.round(effAtk * 0.5 * (hasOsMousse ? 1.5 : 1) * (hasFroid ? 0.8 : 1)));
      const perHit = soakDamage(c, brut);
      const totalDmg = action.hits * perHit;
      const armure = bestArmor(c);
      const amorti = armure && action.hits > 0 && perHit < brut ? L(` ${armure.emoji} ${armure.name} encaisse une partie.`, ` ${armure.emoji} ${tc(armure.name)} takes part of it.`) : "";
      const newHp = Math.max(0, c.stats.health - totalDmg);
      if (newHp <= 0) {
        return stateApresMort(
          state,
          combatDeathMessage(combat.enemyName),
          [...state.combatLog, L(`\u{1F4A5} ${action.hits} coup(s) encaiss\xE9(s)... ${totalDmg} d\xE9g\xE2ts.`, `\u{1F4A5} Took ${action.hits} hit(s)... ${totalDmg} damage.`), L("\u{1F480} Vous succombez \xE0 vos blessures...", "\u{1F480} You succumb to your wounds...")]
        );
      }
      const newStats = clampStats({ ...c.stats, health: newHp });
      const cUpd = { ...c, stats: newStats };
      const logs = [...state.combatLog];
      if (action.hits === 0) {
        let draw = 1;
        if (c.traits.some((t) => t.id === "collectionneur") && new Set(c.inventory.map((i) => i.id)).size >= 14) draw += 1;
        if (c.traits.some((t) => t.id === "optimiste") && c.stats.mental < 30) draw += 1;
        draw = Math.min(2, draw);
        logs.push(L(`\u2728 Esquive parfaite ! Contre-tempo : vous volez une riposte (${draw} carte${draw > 1 ? "s" : ""}).`, `\u2728 Flawless dodge! Counter-tempo: you steal a riposte (${draw} card${draw > 1 ? "s" : ""}).`));
        return {
          ...state,
          character: cUpd,
          currentCombat: { ...combat, phase: "draw", hand: generateHand(cUpd, combat, draw), enemyAtkDebuff: 0, dodgePenalty: 1, enemyStunned: false },
          combatLog: logs
        };
      }
      logs.push(L(`\u{1F4A5} ${action.hits} touche(s) encaiss\xE9e(s), ${totalDmg} d\xE9g\xE2ts.${amorti} Retour au face-\xE0-face.`, `\u{1F4A5} Took ${action.hits} hit(s), ${totalDmg} damage.${amorti} Back to the standoff.`));
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      return {
        ...state,
        character: cUpd,
        currentCombat: { ...combat, phase: "sign", round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], enemyAtkDebuff: 0, dodgePenalty: 1, enemyStunned: false, ...rollSignRound(enemyLike, cUpd, false, combat.lastPlayerSign) },
        combatLog: logs
      };
    }
    // Le joueur joue une carte de riposte : on applique son effet, puis on
    // enchaîne (victoire, fuite, ou manche suivante → nouveau duel de signes).
    case "PLAY_CARD": {
      if (!state.character || !state.currentCombat) return state;
      const c = state.character;
      const combat = state.currentCombat;
      const card = getCard(action.cardId);
      if (!card || !combat.hand.includes(action.cardId)) return state;
      const logs = [...state.combatLog];
      const rnd = (min, range) => min + Math.random() * range;
      const base = unarmedDamage(c, combat);
      const enemyLike = { name: combat.enemyName, emoji: combat.enemyEmoji, attack: combat.enemyAttack, health: combat.enemyMaxHealth };
      if (card.id === "flee") {
        const hasAgile = c.traits.some((t) => t.id === "agile");
        const isCascadeur = c.job.id === "cascadeur";
        const fleeChance = Math.min(0.85, 0.5 - combat.enemyAttack * 0.012 + (hasAgile ? 0.25 : 0) + (isCascadeur ? 0.12 : 0));
        if (Math.random() < fleeChance) {
          const newStats = clampStats({ ...c.stats, dignity: c.stats.dignity - 5 });
          return {
            ...state,
            character: { ...c, stats: newStats },
            currentCombat: null,
            combatLog: [...logs, L("\u{1F3C3} Vous prenez vos jambes \xE0 votre cou ! Fuite r\xE9ussie !", "\u{1F3C3} You take to your heels! Escape successful!")],
            eventResult: { text: L("Vous avez fui le combat. Votre dignit\xE9 en prend un coup...", "You fled the fight. Your dignity takes a hit..."), statChanges: { dignity: -5 }, image: combat.image },
            screen: "main"
          };
        }
        const dmg2 = soakDamage(c, Math.max(2, Math.round(combat.enemyAttack * rnd(0.5, 0.4))));
        const hp = Math.max(0, c.stats.health - dmg2);
        if (hp <= 0) return stateApresMort(state, combatDeathMessage(combat.enemyName), [...logs, L(`\u274C Fuite rat\xE9e ! ${combat.enemyName} vous rattrape ! ${dmg2} d\xE9g\xE2ts.`, `\u274C Escape failed! ${tc(combat.enemyName)} catches you! ${dmg2} damage.`), L("\u{1F480} Vous succombez \xE0 vos blessures...", "\u{1F480} You succumb to your wounds...")]);
        logs.push(L(`\u274C Fuite rat\xE9e ! ${combat.enemyName} vous rattrape ! ${dmg2} d\xE9g\xE2ts.`, `\u274C Escape failed! ${tc(combat.enemyName)} catches you! ${dmg2} damage.`));
        return {
          ...state,
          character: { ...c, stats: clampStats({ ...c.stats, health: hp, dignity: c.stats.dignity - 3 }) },
          currentCombat: { ...combat, phase: "dodge", round: combat.round + 1, hand: [], atkBuff: 0 },
          combatLog: logs
        };
      }
      if (card.id === "bandage") {
        const heal = c.inventory.find((i) => (i.effect?.health ?? 0) > 0);
        if (!heal) return state;
        const gain = heal.effect.health;
        const newInv = c.inventory.filter((i) => i !== heal);
        logs.push(L(`\u{1FA79} Vous utilisez ${heal.name} : +${gain} sant\xE9.`, `\u{1FA79} You use ${tc(heal.name)}: +${gain} health.`));
        return {
          ...state,
          character: { ...c, inventory: newInv, stats: clampStats({ ...c.stats, health: c.stats.health + gain }) },
          currentCombat: { ...combat, phase: "sign", round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], atkBuff: 0, enemyStunned: false, ...rollSignRound(enemyLike, c, combat.enemyStunned, combat.lastPlayerSign) },
          combatLog: logs
        };
      }
      if (card.id === "warcry") {
        logs.push(L("\u{1F4E3} CRI DE GUERRE ! Vous vous galvanisez pour le prochain coup.", "\u{1F4E3} WAR CRY! You psych yourself up for the next blow."));
        return {
          ...state,
          currentCombat: { ...combat, phase: "sign", round: combat.round + 1, signNonce: combat.signNonce + 1, hand: [], atkBuff: combat.atkBuff + 6, enemyStunned: false, ...rollSignRound(enemyLike, c, combat.enemyStunned, combat.lastPlayerSign) },
          combatLog: logs
        };
      }
      let dmg = 0;
      let stun = false;
      let atkDebuff = 0;
      let consumeJunk;
      switch (card.id) {
        case "punch":
          dmg = Math.round(base * rnd(0.85, 0.35));
          logs.push(L(`\u{1F44A} Coup de poing ! ${dmg} d\xE9g\xE2ts.`, `\u{1F44A} Punch! ${dmg} damage.`));
          break;
        case "bottle": {
          const weapon = bestWeapon(c);
          const crit = weapon?.combatStyle === "precise" && Math.random() < 0.2;
          dmg = Math.round((base + bestWeaponBonus(c)) * rnd(1.15, 0.4) * (crit ? 2 : 1));
          if (crit) logs.push(L(`\u{1F52A} COUP CRITIQUE ! ${weapon.name} trouve la faille : ${dmg} d\xE9g\xE2ts !`, `\u{1F52A} CRITICAL HIT! ${tc(weapon.name)} finds the gap: ${dmg} damage!`));
          else logs.push(L(`\u{1F37E} Coup d'arme ! ${dmg} d\xE9g\xE2ts.`, `\u{1F37E} Weapon blow! ${dmg} damage.`));
          break;
        }
        case "military":
          dmg = Math.round(base * rnd(1.4, 0.3));
          logs.push(L(`\u{1F396}\uFE0F Coup r\xE9glementaire ! ${dmg} d\xE9g\xE2ts.`, `\u{1F396}\uFE0F Regulation strike! ${dmg} damage.`));
          break;
        case "combo":
          dmg = Math.round(base * rnd(1.5, 0.4));
          stun = true;
          logs.push(L(`\u{1F3AD} Feinte + coup bas ! ${dmg} d\xE9g\xE2ts, et vous voil\xE0 en position.`, `\u{1F3AD} Feint + low blow! ${dmg} damage, and you're in position.`));
          break;
        case "insult":
          dmg = Math.round(base * rnd(0.4, 0.3));
          atkDebuff = 4;
          logs.push(L(`\u{1F5EF}\uFE0F Insulte cibl\xE9e ! ${dmg} d\xE9g\xE2ts, ${combat.enemyName} perd ses moyens.`, `\u{1F5EF}\uFE0F Targeted insult! ${dmg} damage, ${tc(combat.enemyName)} loses its cool.`));
          break;
        case "fortune": {
          consumeJunk = firstJunk(c);
          dmg = Math.round(base * rnd(1.55, 0.4));
          logs.push(L(`\u{1F527} Arme de fortune${consumeJunk ? ` (${consumeJunk.name})` : ""} ! ${dmg} d\xE9g\xE2ts.`, `\u{1F527} Makeshift weapon${consumeJunk ? ` (${tc(consumeJunk.name)})` : ""}! ${dmg} damage.`));
          break;
        }
        default:
          dmg = Math.round(base);
          break;
      }
      const newEnemyHp = Math.max(0, combat.enemyHealth - dmg);
      if (dmg > 0) progress("coups", 1);
      const inventory = consumeJunk ? c.inventory.filter((i) => i !== consumeJunk) : c.inventory;
      if (newEnemyHp <= 0) {
        const lootMoney = combat.loot?.money || 0;
        const lootRespect = combat.loot?.respect || 0;
        const drop = combat.loot?.item && inventory.length < bagCapacity({ inventory }) ? combat.loot.item : void 0;
        const en = tc(combat.enemyName);
        logs.push(L(`\u{1F389} Victoire ! Vous avez vaincu ${combat.enemyName} !`, `\u{1F389} Victory! You defeated ${en}!`));
        if (drop) logs.push(L(`${drop.emoji} Il l\xE2che : ${drop.name} !`, `${drop.emoji} It drops: ${tc(drop.name)}!`));
        const wonCrown = combat.enemyEmoji === "\u{1F451}";
        if (wonCrown) logs.push(L("\u{1F451} La couronne vous revient : vous \xEAtes le Roi du Carton !", "\u{1F451} The crown is yours: you are the Cardboard King!"));
        return {
          ...state,
          contract: state.contract?.id === "contrat-combatif" ? { id: state.contract.id, done: true } : state.contract,
          character: {
            ...c,
            inventory: drop ? [...inventory, drop] : inventory,
            money: c.money + lootMoney,
            respect: c.respect + lootRespect,
            ...wonCrown ? { crowned: true, kingsBeaten: (c.kingsBeaten ?? 0) + 1 } : {}
          },
          currentCombat: null,
          combatLog: logs,
          eventResult: { text: `${L(`Victoire contre ${combat.enemyName} ! ${lootMoney > 0 ? `+${lootMoney}\u20AC` : ""} ${lootRespect > 0 ? `+${lootRespect} respect` : ""}`.trim(), `Victory over ${en}! ${lootMoney > 0 ? `+\u20AC${lootMoney}` : ""} ${lootRespect > 0 ? `+${lootRespect} respect` : ""}`.trim())}${drop ? L(` Il l\xE2che ${drop.name} ${drop.emoji} !`, ` It drops the ${tc(drop.name)} ${drop.emoji}!`) : ""}`, moneyChange: lootMoney, respectChange: lootRespect, image: combat.image },
          screen: "main"
        };
      }
      return {
        ...state,
        character: { ...c, inventory },
        currentCombat: {
          ...combat,
          enemyHealth: newEnemyHp,
          phase: "sign",
          round: combat.round + 1,
          signNonce: combat.signNonce + 1,
          hand: [],
          atkBuff: 0,
          enemyStunned: false,
          enemyAtkDebuff: combat.enemyAtkDebuff + atkDebuff,
          ...rollSignRound(enemyLike, c, stun || combat.enemyStunned, combat.lastPlayerSign)
        },
        combatLog: logs
      };
    }
    case "REOPEN_SHOP": {
      if (!state.character) return state;
      return {
        ...state,
        character: {
          ...state.character,
          shopClosures: (state.character.shopClosures || []).filter((c) => c.shopId !== action.shopId)
        }
      };
    }
    case "RESOLVE_HAGGLE": {
      if (!state.character) return state;
      const c = state.character;
      const stats = clampStats(
        Object.entries(action.spent).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: acc[k] - (v || 0) }),
          { ...c.stats }
        )
      );
      const closures = [...c.shopClosures || []];
      if (action.broken) {
        const [reason, reasonEn] = shopkeeperFor(action.shopId)?.closure ?? [
          "vous avez trop tir\xE9 sur la corde pendant le marchandage.",
          "you pushed the haggling too far."
        ];
        closures.push({ shopId: action.shopId, untilDay: c.day + 1, reason, reasonEn, fromHaggle: true });
      }
      const gained = !action.broken && action.cut >= HAGGLE_TUNING.goodDealCut ? HAGGLE_TUNING.respectOnGoodDeal : 0;
      if (!action.broken && action.cut > 0) progress("marchandages", 1);
      const haggleFlag = HAGGLED_FLAG(action.shopId, c.day);
      return {
        ...state,
        character: {
          ...c,
          stats,
          shopClosures: closures,
          respect: Math.max(0, c.respect + gained),
          activeFlags: c.activeFlags.includes(haggleFlag) ? c.activeFlags : [...c.activeFlags, haggleFlag],
          inventory: action.tradedItemId ? removeOne(c.inventory, action.tradedItemId) : c.inventory
        }
      };
    }
    case "BUY_ITEM": {
      if (!state.character || !action.shopItem) return state;
      const shopItem = action.shopItem;
      const actualPrice = action.actualPrice;
      if (state.character.money < actualPrice) return state;
      if (shopItem.giveItem && state.character.inventory.length >= bagCapacity(state.character)) return state;
      let newStats = { ...state.character.stats };
      if (shopItem.effect) {
        Object.entries(shopItem.effect).forEach(([key, val]) => {
          if (val) newStats[key] += val;
        });
      }
      newStats = clampStats(newStats);
      let newInventory = [...state.character.inventory];
      if (shopItem.giveItem) {
        newInventory.push(shopItem.giveItem);
      }
      const newMoney = state.character.money - actualPrice;
      const estFontaine = shopItem.id === "eau-fontaine";
      const memeJour = state.character.fountainDay === state.character.day;
      const gorgeesDuJour = memeJour ? state.character.fountainToday || 0 : 0;
      const fountainBump = estFontaine ? {
        fountainUses: (state.character.fountainUses || 0) + 1,
        fountainDay: state.character.day,
        fountainToday: gorgeesDuJour + 1
      } : {};
      if (estFontaine && gorgeesDuJour >= 1) {
        newStats = clampStats({ ...newStats, dignity: newStats.dignity - 2 });
      }
      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, inventory: newInventory, ...fountainBump }
      };
    }
    case "DISMISS_ORIGIN": {
      if (!state.character) return state;
      if (state.character.activeFlags.includes("origin-vu")) return state;
      return {
        ...state,
        character: { ...state.character, activeFlags: [...state.character.activeFlags, "origin-vu"] }
      };
    }
    case "RESOLVE_ENCOUNTER": {
      if (!state.character) return state;
      const c = state.character;
      const flag2 = encounterFlag(c.day, c.location);
      if (c.activeFlags.includes(flag2)) return state;
      let stats = { ...c.stats };
      let money2 = c.money;
      let inventory = [...c.inventory];
      let compagnon = c.compagnon;
      if (action.kind === "share") {
        const foodIdx = inventory.map((it, i) => ({ it, i })).filter((x) => x.it.type === "food").sort((a, b) => (a.it.value || 0) - (b.it.value || 0))[0]?.i;
        if (foodIdx === void 0) return state;
        inventory = [...inventory.slice(0, foodIdx), ...inventory.slice(foodIdx + 1)];
        stats = applyStatDelta(stats, { mental: 6, dignity: 2 });
        const pret = action.npc ? traitPretable(action.npc.traits) : null;
        if (pret) {
          compagnon = {
            nom: action.npc.name,
            seed: action.npc.seed,
            gender: action.npc.gender,
            traitId: pret.id,
            jour: c.day,
            // Celui-ci s'en ira au matin (voir NEXT_DAY). Sa phrase le disait.
            louche: action.npc.louche
          };
        }
      } else if (action.kind === "trade") {
        if (!action.offer || money2 < action.offer.price || inventory.length >= bagCapacity({ inventory })) return state;
        money2 -= action.offer.price;
        inventory = [...inventory, { ...action.offer.item }];
      }
      const respectGain = action.kind === "share" ? 3 : 0;
      return {
        ...state,
        character: {
          ...c,
          stats,
          money: money2,
          inventory,
          respect: c.respect + respectGain,
          compagnon,
          activeFlags: [...c.activeFlags, flag2]
        }
      };
    }
    case "CLAIM_SOLIDARITY": {
      if (!state.character) return state;
      const c = state.character;
      const flag2 = SOLIDARITY_FLAG(c.day);
      if (c.activeFlags.includes(flag2)) return state;
      const newInventory = [...c.inventory];
      for (const gift of SOLIDARITY_GIFT) {
        if (newInventory.length >= bagCapacity({ inventory: newInventory })) break;
        newInventory.push({ ...gift });
      }
      return {
        ...state,
        character: { ...c, inventory: newInventory, activeFlags: [...c.activeFlags, flag2] }
      };
    }
    case "TRIGGER_SHOP_EVENT": {
      if (!state.character) return state;
      const shopEvt = action.event;
      const outcome = shopEvt.outcomes[Math.floor(Math.random() * shopEvt.outcomes.length)];
      let newStats = { ...state.character.stats };
      if (outcome.statChanges) {
        Object.entries(outcome.statChanges).forEach(([key, val]) => {
          if (val) newStats[key] += val;
        });
      }
      newStats = clampStats(newStats);
      const newMoney = state.character.money + (outcome.moneyChange || 0);
      const newRespect = state.character.respect + (outcome.respectChange || 0);
      let newInventory = [...state.character.inventory];
      if (outcome.itemGain && newInventory.length < bagCapacity({ inventory: newInventory })) {
        newInventory.push(outcome.itemGain);
      }
      return {
        ...state,
        character: { ...state.character, stats: newStats, money: newMoney, respect: newRespect, inventory: newInventory },
        eventResult: {
          text: `\u{1F31F} ${shopEvt.text}

${outcome.text}`,
          statChanges: outcome.statChanges,
          moneyChange: outcome.moneyChange,
          respectChange: outcome.respectChange,
          // Une scène de boutique se passe DANS la boutique : sa devanture
          // vaut mieux qu'une scène dessinée en repli.
          image: `/assets/shop-${shopEvt.shopId}.webp`
        }
      };
    }
    case "REVIVE": {
      if (!state.character) return state;
      if (state.character.alive) return state;
      if (state.screen !== "game-over") return state;
      if (state.character.activeFlags.includes("revived")) return state;
      clearLegacy();
      const revivedStats = {
        ...state.character.stats,
        health: Math.max(state.character.stats.health, 50),
        mental: Math.max(state.character.stats.mental, 50),
        hunger: Math.max(state.character.stats.hunger, 40),
        thirst: Math.max(state.character.stats.thirst, 40),
        sleep: Math.max(state.character.stats.sleep, 40)
      };
      return {
        ...state,
        screen: "main",
        currentCombat: null,
        combatLog: [],
        deathCause: null,
        eventResult: { text: "\u{1F305} Une \xE2me charitable vous a port\xE9 secours. Vous reprenez vos esprits. La rue ne vous a pas encore eu...", image: "/assets/result-seconde-chance.webp" },
        character: {
          ...state.character,
          stats: revivedStats,
          alive: true,
          activeFlags: [...state.character.activeFlags, "revived"]
        }
      };
    }
    case "RESET_SCORES": {
      try {
        localStorage.removeItem(SCORES_KEY);
      } catch {
      }
      return { ...state, highScores: [] };
    }
    case "RESTART":
      clearSave();
      return {
        ...initialState,
        highScores: loadHighScores(),
        screen: state.characterChoices.length > 0 ? "character-select" : "title",
        characterChoices: state.characterChoices
      };
    default:
      return state;
  }
}
var initialWeather = getInitialWeather();
var initialState = {
  screen: "title",
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
  weather: initialWeather,
  nextWeather: getNextWeather(initialWeather, 1),
  deathCause: null
};
var GameContext = createContext(void 0);

// ../../../tmp/monet-tlSzE4/cap.js
var Capacitor = { isNativePlatform: () => false, getPlatform: () => "web" };

// client/src/lib/ads.ts
var NOADS_KEY = "roi-du-carton-noads";
var adsRemoved = (() => {
  try {
    return localStorage.getItem(NOADS_KEY) === "1";
  } catch {
    return false;
  }
})();
function setAdsRemoved(v) {
  adsRemoved = v;
  try {
    localStorage.setItem(NOADS_KEY, v ? "1" : "0");
  } catch {
  }
}
var AD_UNITS = {
  android: {
    banner: "ca-app-pub-6336322065829631/1688618582",
    interstitial: "ca-app-pub-6336322065829631/5639366683",
    rewarded: "ca-app-pub-6336322065829631/8014353783"
  },
  ios: {
    banner: "ca-app-pub-3940256099942544/2934735716",
    interstitial: "ca-app-pub-3940256099942544/4411468910",
    rewarded: "ca-app-pub-3940256099942544/1712485313"
  }
};
var USE_TEST_ADS = true;
function platform() {
  const p = Capacitor.getPlatform();
  if (p === "android") return "android";
  if (p === "ios") return "ios";
  return "web";
}
function isNative() {
  return Capacitor.isNativePlatform();
}
function unit(kind) {
  const p = platform();
  if (p === "web") return AD_UNITS.android[kind];
  return AD_UNITS[p][kind];
}
var consentStatus = null;
function personalizedAdsAllowed() {
  return consentStatus === "OBTAINED" || consentStatus === "NOT_REQUIRED";
}
var DELAI_INTERSTITIEL_MS = 9e4;
var PARTIES_DE_GRACE = 3;
var CLE_PARTIES = "roi-du-carton-parties-finies";
var dernierInterstitiel = 0;
var premiereMortDeLaSession = true;
function partiesFinies() {
  try {
    return Number(localStorage.getItem(CLE_PARTIES) || "0");
  } catch {
    return 0;
  }
}
function noterPartieFinie() {
  try {
    localStorage.setItem(CLE_PARTIES, String(partiesFinies() + 1));
  } catch {
  }
}
function partieTerminee() {
  noterPartieFinie();
}
function verdictInterstitiel(maintenant = Date.now()) {
  if (adsRemoved) return { montrer: false, raison: "sans-pub achet\xE9" };
  if (partiesFinies() <= PARTIES_DE_GRACE) {
    return { montrer: false, raison: `p\xE9riode de gr\xE2ce (${partiesFinies()}/${PARTIES_DE_GRACE} parties)` };
  }
  if (premiereMortDeLaSession) return { montrer: false, raison: "premi\xE8re mort de la session" };
  const attente = maintenant - dernierInterstitiel;
  if (attente < DELAI_INTERSTITIEL_MS) {
    return { montrer: false, raison: `trop t\xF4t (${Math.round(attente / 1e3)} s sur ${DELAI_INTERSTITIEL_MS / 1e3})` };
  }
  return { montrer: true, raison: "ok" };
}
function reinitialiserInterstitiel() {
  dernierInterstitiel = 0;
  premiereMortDeLaSession = true;
}
async function showInterstitial() {
  const verdict = verdictInterstitiel();
  premiereMortDeLaSession = false;
  if (!verdict.montrer || !isNative()) return;
  dernierInterstitiel = Date.now();
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.prepareInterstitial({
      adId: unit("interstitial"),
      isTesting: USE_TEST_ADS,
      // Refus, ou consentement inconnu : publicité NON personnalisée.
      // Sans cette ligne, le formulaire de consentement ne servirait à rien.
      npa: !personalizedAdsAllowed()
    });
    await AdMob.showInterstitial();
  } catch (e) {
    console.warn("[ads] showInterstitial:", e);
  }
}
export {
  CONTRACTS,
  gameReducer,
  getContract,
  paquetDuPremierMatin,
  partieTerminee,
  reinitialiserInterstitiel,
  setAdsRemoved,
  showInterstitial,
  verdictInterstitiel
};
