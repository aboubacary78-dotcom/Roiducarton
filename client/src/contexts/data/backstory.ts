// ============ LE RÉCIT D'ORIGINE : « LA CHUTE DE… » ============
// Chaque personnage arrive avec une mini-histoire, générée depuis son MÉTIER
// (comment il a fini à la rue) et pimentée par l'un de ses TRAITS (la
// circonstance aggravante). Humour noir et bête, à la sauce Roi du Carton.
//
// La génération est DÉTERMINISTE (seedée par char.seed) : le même personnage
// raconte toujours la même chute, donc l'écran d'intro ne « change » pas à
// chaque rendu et rien n'a besoin d'être sauvegardé.
import type { Character } from '../types';

export interface OriginStory {
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
}

type Bilingual = { fr: string; en: string };

// Deux chutes par métier ({name} = prénom du personnage).
const JOB_DOWNFALLS: Record<string, Bilingual[]> = {
  comptable: [
    { fr: "{name} a passé vingt ans à équilibrer les comptes des autres. Le jour où il a voulu équilibrer les siens, une virgule s'était enfuie avec ses économies.", en: "{name} spent twenty years balancing everyone else's books. The day he balanced his own, a decimal point had run off with his savings." },
    { fr: "{name} a détourné 4,50€ par erreur d'arrondi, s'est dénoncé lui-même par honnêteté maladive, puis a perdu le procès qu'il tenait à plaider seul.", en: "{name} embezzled €4.50 through a rounding error, turned himself in out of pathological honesty, then lost the trial he insisted on arguing alone." },
  ],
  ouvrier: [
    { fr: "{name} a tenu la même usine trente ans. L'usine, elle, n'a pas tenu : délocalisée un lundi matin, pendant qu'il faisait le café.", en: "{name} held down the same factory for thirty years. The factory didn't hold: offshored one Monday morning, while he was making coffee." },
    { fr: "{name} a réparé de ses mains la machine censée le remplacer. Elle a très bien marché. Trop bien.", en: "{name} fixed, with his own hands, the machine meant to replace him. It worked beautifully. Too beautifully." },
  ],
  professeur: [
    { fr: "{name} a corrigé la faute d'orthographe sur sa propre lettre de licenciement, puis l'a renvoyée notée. Ce fut sa dernière correction.", en: "{name} corrected the spelling mistake on his own dismissal letter, then sent it back graded. It was his last correction." },
    { fr: "{name} a fait grève pour un seul élève. Pendant huit mois. L'administration a fini par oublier de le repayer.", en: "{name} went on strike for a single student. For eight months. The administration eventually forgot to pay him again." },
  ],
  sommelier: [
    { fr: "{name} a confondu le grand cru du patron avec le vinaigre de la cuisine, au dîner le plus important de sa carrière. « Ils avaient le même nez », jura-t-il.", en: "{name} mixed up the boss's vintage with the kitchen vinegar at the most important dinner of his career. \"They had the same nose,\" he swore." },
    { fr: "{name} a goûté toute la cave « pour vérifier ». Il a vérifié. Toute la cave.", en: "{name} tasted the entire cellar \"just to check.\" He checked. The entire cellar." },
  ],
  cascadeur: [
    { fr: "{name} a réussi mille cascades impossibles. Il a glissé sur un savon dans sa propre salle de bain. L'assurance a refusé.", en: "{name} pulled off a thousand impossible stunts. He slipped on a bar of soap in his own bathroom. Insurance said no." },
    { fr: "{name} a doublé une star sur un pont en flammes. La production a fait faillite le lendemain, pont compris.", en: "{name} doubled a star on a burning bridge. The production went bankrupt the next day, bridge included." },
  ],
  informaticien: [
    { fr: "{name} a supprimé le mauvais dossier. Celui de l'entreprise entière. Et la sauvegarde. Et la sauvegarde de la sauvegarde.", en: "{name} deleted the wrong folder. The whole company's. And the backup. And the backup of the backup." },
    { fr: "{name} cherche encore le mot de passe qui l'aurait sauvé. Il était sur un post-it. Le post-it a pris feu.", en: "{name} is still looking for the password that would've saved him. It was on a sticky note. The sticky note caught fire." },
  ],
  cuisinier: [
    { fr: "{name} a servi son plat signature à un critique allergique à absolument tout. Le restaurant n'a pas survécu à l'article.", en: "{name} served his signature dish to a critic allergic to absolutely everything. The restaurant didn't survive the review." },
    { fr: "{name} a transformé un rat en ratatouille cinq étoiles. Un inspecteur l'a vu attraper le rat.", en: "{name} turned a rat into a five-star ratatouille. An inspector saw him catch the rat." },
  ],
  infirmier: [
    { fr: "{name} a soigné tout le monde, sauf lui-même. Il l'a compris trop tard, devant sa propre porte, les clés à l'intérieur.", en: "{name} took care of everyone but himself. He realized too late, outside his own door, keys locked inside." },
    { fr: "{name} a donné son dernier billet à un patient pour un taxi. Le taxi, c'était pour rentrer. Chez {name}.", en: "{name} gave his last bill to a patient for a cab. The cab was meant to get him home. {name}'s home." },
  ],
  artiste: [
    { fr: "{name} a vendu toute sa collection pour financer son chef-d'œuvre : une toile entièrement blanche, jamais comprise. Même par lui.", en: "{name} sold his whole collection to fund his masterpiece: an entirely blank canvas, never understood. Not even by him." },
    { fr: "{name} a peint la fresque de sa vie sur un mur. Le mur a été démoli le lendemain pour un parking.", en: "{name} painted the fresco of his life on a wall. The wall was demolished the next day for a parking lot." },
  ],
  militaire: [
    { fr: "{name} a survécu à tout. Sauf à la paperasse de la retraite, perdue entre deux bureaux, comme lui.", en: "{name} survived everything. Except the retirement paperwork, lost between two offices, like him." },
    { fr: "{name} a monté la garde si longtemps qu'il a oublié pourquoi. Quand il a demandé, plus personne ne s'en souvenait non plus.", en: "{name} stood guard so long he forgot why. When he asked, nobody else remembered either." },
  ],
  bibliothecaire: [
    { fr: "{name} connaissait chaque livre par cœur. La bibliothèque a fermé pour « manque de public ». Il en était le seul.", en: "{name} knew every book by heart. The library closed for \"lack of visitors.\" He was the only one." },
    { fr: "{name} a gardé un livre en retard. Quarante ans. L'amende a fini par valoir son appartement.", en: "{name} kept a book overdue. Forty years. The fine eventually cost him his apartment." },
  ],
  vendeur: [
    { fr: "{name} pouvait vendre n'importe quoi. Il s'est vendu à lui-même une voiture qu'il n'avait pas. Le remboursement l'a ruiné.", en: "{name} could sell anything. He sold himself a car he didn't own. The repayments ruined him." },
    { fr: "{name} a promis « satisfait ou remboursé » à toute la ville. Toute la ville est revenue le même jour.", en: "{name} promised \"satisfied or refunded\" to the whole town. The whole town came back the same day." },
  ],
  jardinier: [
    { fr: "{name} a fait pousser un potager magnifique sur le toit de l'immeuble. Le toit n'était pas prévu pour. L'immeuble non plus.", en: "{name} grew a magnificent vegetable garden on the building's roof. The roof wasn't built for it. Neither was the building." },
    { fr: "{name} a parlé à ses plantes vingt ans. Le jour où elles ont « répondu », le voisinage a appelé quelqu'un.", en: "{name} talked to his plants for twenty years. The day they \"answered,\" the neighbors called someone." },
  ],
  avocat: [
    { fr: "{name} a gagné tous ses procès sauf le sien : il s'était choisi comme adversaire, par excès de confiance.", en: "{name} won every case but his own: he'd picked himself as the opponent, out of overconfidence." },
    { fr: "{name} a défendu un pigeon « par principe ». Le principe lui a coûté le cabinet.", en: "{name} defended a pigeon \"on principle.\" The principle cost him the firm." },
  ],
  musicien: [
    { fr: "{name} attendait le grand concert depuis trente ans. Le soir venu, l'harmonica s'est cassé sur la première note. Il joue encore ce trou.", en: "{name} had awaited the big concert for thirty years. Come the night, the harmonica broke on the first note. He still plays that gap." },
    { fr: "{name} a tout misé sur un seul disque, sorti le jour d'un tube inoubliable. Personne n'a inoublié le sien.", en: "{name} bet everything on a single record, released the day of an unforgettable hit. Nobody un-forgot his." },
  ],
  boxeur: [
    { fr: "{name} n'a jamais touché le tapis sur un ring. Il l'a touché en glissant sur sa ceinture de champion, posée par terre.", en: "{name} never hit the canvas in the ring. He hit it slipping on his champion's belt, left on the floor." },
    { fr: "{name} a encaissé mille coups. Le seul qui l'a mis à terre, c'est un huissier. Très poli.", en: "{name} took a thousand punches. The only one that floored him was a bailiff. Very polite." },
  ],
  poete: [
    { fr: "{name} a écrit le plus beau vers de sa vie au dos d'un ticket de caisse. Il l'a rendu à la caissière par erreur. Le vers est parti à la benne.", en: "{name} wrote the finest line of his life on the back of a receipt. He handed it back to the cashier by mistake. The line went to the dumpster." },
    { fr: "{name} a refusé de « vendre son âme » pour un emploi. Son âme est intacte. Le reste, un peu moins.", en: "{name} refused to \"sell his soul\" for a job. His soul is intact. The rest, less so." },
  ],
  _default: [
    { fr: "{name} avait une vie bien rangée. Une petite erreur, une grosse malchance, et la voilà rangée dehors.", en: "{name} had a tidy little life. One small mistake, one big stroke of bad luck, and it got tidied out onto the street." },
  ],
};

// La circonstance aggravante liée à un trait ({name} disponible aussi).
const TRAIT_TWISTS: Record<string, Bilingual> = {
  poissard: { fr: "La poisse, fidèle au poste, a fait le reste.", en: "Rotten luck, ever loyal, did the rest." },
  optimiste: { fr: "Il a souri jusqu'au bout, persuadé que « ça allait le faire ».", en: "He smiled through it all, sure it would \"work out fine.\"" },
  'estomac-acier': { fr: "Au moins, il digère désormais n'importe quoi. Et il le prouve chaque jour.", en: "At least he can now digest anything. And he proves it daily." },
  'ami-pigeons': { fr: "Seuls les pigeons sont restés. Ils ne jugent pas ; ils réclament, c'est tout.", en: "Only the pigeons stayed. They don't judge; they just beg, that's all." },
  'sommeil-plomb': { fr: "Il a dormi si profondément qu'il a raté les trois préavis.", en: "He slept so deeply he missed all three eviction notices." },
  'nez-sensible': { fr: "Il a senti venir la catastrophe. De bien trop loin pour l'éviter.", en: "He smelled the disaster coming. Far too far off to dodge it." },
  insomniaque: { fr: "Depuis, il compte les étoiles au lieu des moutons. Il y en a plus.", en: "Now he counts stars instead of sheep. There are more of them." },
  paranoiaque: { fr: "Il l'avait vu venir. Tout le monde lui répétait que non.", en: "He'd seen it coming. Everyone kept telling him he hadn't." },
  'main-verte': { fr: "Il fait encore pousser des tomates. Dans une chaussure, désormais.", en: "He still grows tomatoes. In a shoe, these days." },
  charismatique: { fr: "Il a charmé tout le monde. Personne n'a pensé à l'embaucher.", en: "He charmed everyone. Nobody thought to hire him." },
  'os-mousse': { fr: "La chute a été douce. L'atterrissage, beaucoup moins.", en: "The fall was soft. The landing, far less so." },
  metabolisme: { fr: "Il brûle tout ce qu'il avale. Il n'avale plus grand-chose.", en: "He burns everything he eats. He doesn't eat much anymore." },
  collectionneur: { fr: "Il avait tout gardé. Il a fallu tout laisser sur le trottoir.", en: "He'd kept everything. He had to leave it all on the curb." },
  'phobie-rats': { fr: "La rue lui a gardé une dernière blague, à quatre pattes et à moustaches.", en: "The street saved him one last joke, four-legged and whiskered." },
  haleine: { fr: "Les négociations de la dernière chance ont tourné court, faute d'air.", en: "The last-chance negotiations fell through, for lack of air." },
  agile: { fr: "Il a esquivé les créanciers. Pas les loyers.", en: "He dodged the creditors. Not the rent." },
  'resistant-froid': { fr: "Bonne nouvelle : il supporte le froid. Il allait en avoir besoin.", en: "Good news: he handles the cold. He was going to need to." },
  bricoleur: { fr: "Il a tout réparé chez les autres. Chez lui, il ne restait rien à réparer.", en: "He fixed everything at other people's places. At his, nothing was left to fix." },
  orientation: { fr: "Il connaît tous les raccourcis. Aucun ne ramenait à la maison.", en: "He knows every shortcut. None led back home." },
  'ventre-pattes': { fr: "Il mange n'importe quoi. Un talent devenu, disons, très pratique.", en: "He eats anything. A talent that's become, let's say, very handy." },
};

// Hachage simple et stable d'une chaîne (seed déterministe).
function seedNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function generateOrigin(char: Character): OriginStory {
  const downfalls = JOB_DOWNFALLS[char.job.id] || JOB_DOWNFALLS._default;
  const h = seedNum(char.seed || char.name || 'sdf');
  const pick = downfalls[h % downfalls.length];
  const twists = char.traits.map((t) => TRAIT_TWISTS[t.id]).filter(Boolean) as Bilingual[];
  const twist = twists.length ? twists[h % twists.length] : null;
  const fill = (s: string) => s.replace(/\{name\}/g, char.name);
  return {
    titleFr: `La Chute de ${char.name}`,
    titleEn: `The Fall of ${char.name}`,
    textFr: fill(pick.fr) + (twist ? ' ' + fill(twist.fr) : ''),
    textEn: fill(pick.en) + (twist ? ' ' + fill(twist.en) : ''),
  };
}
