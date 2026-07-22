// ============ LE RÉCIT D'ORIGINE : « LA CHUTE DE… » ============
// Chaque personnage arrive avec une mini-histoire de sa chute, façonnée par le
// MÉTIER (comment il a fini à la rue) et le CARACTÈRE (un de ses traits, qui
// OUVRE le récit). Humour noir, phrases qui s'enchaînent, jamais de jeu de mots
// obscur ni de bouts collés bout à bout.
//
// ACCORD MASCULIN/FÉMININ : le français est tokenisé avec {masculin|féminin}.
// generateOrigin résout selon char.gender. Un « il » de PERSONNAGE s'écrit donc
// {il|elle} ; un « il » impersonnel (« il n'y avait ») reste un « il » littéral.
// L'anglais ne s'accorde pas, il reste tel quel.
//
// La génération est DÉTERMINISTE (seedée par char.seed) : le même personnage
// raconte toujours la même chute.
import type { Character } from '../types';

export interface OriginStory {
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
}

type Bilingual = { fr: string; en: string };

// Trois chutes par métier, chacune auto-portante ({name} = prénom).
const JOB_DOWNFALLS: Record<string, Bilingual[]> = {
  comptable: [
    { fr: "{name} a passé vingt ans à équilibrer les comptes des autres. Le jour où {il|elle} a regardé les siens, il n'y avait plus rien à équilibrer.", en: "{name} spent twenty years balancing other people's books. The day he looked at his own, there was nothing left to balance." },
    { fr: "{name} a repéré une erreur de deux centimes dans un bilan et a exigé de la corriger. La vérification a duré six mois et lui a coûté sa place.", en: "{name} spotted a two-cent error in a report and insisted on fixing it. The audit took six months and cost him his job." },
    { fr: "{name} tenait les comptes d'une entreprise qui, elle, ne tenait plus rien. Elle a fermé un vendredi soir, sans prévenir son comptable.", en: "{name} kept the books for a company that could no longer keep anything. It shut down one Friday night, without telling its accountant." },
  ],
  ouvrier: [
    { fr: "{name} a donné trente ans à la même usine. Elle est partie à l'étranger un lundi matin, sans laisser d'adresse.", en: "{name} gave thirty years to the same factory. It moved abroad one Monday morning without leaving a forwarding address." },
    { fr: "{name} a réparé {lui-même|elle-même} la machine censée {le|la} remplacer. Elle marche toujours ; {lui|elle}, beaucoup moins.", en: "{name} personally repaired the machine that was meant to replace him. It still runs; he doesn't, so much." },
    { fr: "{name} a manqué trois jours pour un dos bloqué. À son retour, son badge n'ouvrait plus aucune porte.", en: "{name} missed three days with a locked back. When he came back, his badge no longer opened any door." },
  ],
  professeur: [
    { fr: "{name} a corrigé les fautes de sa propre lettre de licenciement avant de la rendre. On ne la lui a pas reprise.", en: "{name} corrected the mistakes in his own dismissal letter before handing it back. Nobody asked for it again." },
    { fr: "{name} a fait cours à une salle vide pendant tout un trimestre. Personne n'a osé lui dire que l'école avait fermé.", en: "{name} taught an empty classroom for a whole term. No one dared tell him the school had closed." },
    { fr: "{name} a donné ses derniers billets à un élève dans le besoin. {Il|Elle} a oublié d'en garder pour {lui-même|elle-même}.", en: "{name} gave his last few bills to a student in need. He forgot to keep any for himself." },
  ],
  sommelier: [
    { fr: "{name} a servi du vinaigre à la place du grand cru, au dîner le plus important de sa carrière. {Il|Elle} jure encore que les deux avaient le même nez.", en: "{name} served vinegar instead of the fine vintage at the most important dinner of his career. He still swears the two smelled the same." },
    { fr: "{name} a goûté toute la cave, bouteille après bouteille, pour être bien sûr{|e}. {Il|Elle} en était sûr{|e}, et sans emploi.", en: "{name} tasted the whole cellar, bottle by bottle, just to be sure. He was sure, and out of a job." },
    { fr: "{name} a recraché le vin d'un critique en pleine dégustation. Le critique n'a pas trouvé ça drôle du tout.", en: "{name} spat out a critic's wine mid-tasting. The critic did not find it funny at all." },
  ],
  cascadeur: [
    { fr: "{name} a survécu à mille cascades impossibles. {Il|Elle} s'est brisé le poignet en glissant sur un savon dans sa salle de bain.", en: "{name} survived a thousand impossible stunts. He broke his wrist slipping on a bar of soap in his own bathroom." },
    { fr: "{name} a doublé une star sur un pont en flammes. La production a fait faillite le lendemain, et {lui|elle} avec.", en: "{name} doubled a star on a burning bridge. The production went bankrupt the next day, and he went with it." },
    { fr: "{name} a refusé une doublure pour un dernier saut de trop. Son dos, lui, a refusé de continuer.", en: "{name} turned down a stand-in for one last jump too many. His back, in turn, refused to go on." },
  ],
  informaticien: [
    { fr: "{name} a supprimé le mauvais dossier. C'était celui de toute l'entreprise, sauvegardes comprises.", en: "{name} deleted the wrong folder. It was the whole company's, backups included." },
    { fr: "{name} a oublié le seul mot de passe qui comptait vraiment. {Il|Elle} le cherche encore.", en: "{name} forgot the one password that actually mattered. He is still looking for it." },
    { fr: "{name} a débranché le mauvais câble pour aller plus vite. Tout un étage s'est éteint d'un coup.", en: "{name} unplugged the wrong cable to save time. A whole floor went dark at once." },
  ],
  cuisinier: [
    { fr: "{name} a servi son plat signature à un critique allergique à peu près à tout. Le restaurant n'a pas survécu à l'article.", en: "{name} served his signature dish to a critic allergic to nearly everything. The restaurant did not survive the review." },
    { fr: "{name} a transformé un rat en plat du jour cinq étoiles. Un inspecteur l'a vu{|e} attraper le rat.", en: "{name} turned a rat into a five-star special. An inspector saw him catch the rat." },
    { fr: "{name} a goûté sa propre sauce jusqu'à la dernière goutte. Il ne restait plus rien à servir aux clients.", en: "{name} tasted his own sauce down to the last drop. There was nothing left to serve the customers." },
  ],
  infirmier: [
    { fr: "{name} a soigné toute la ville, sauf {lui-même|elle-même}. {Il|Elle} l'a compris trop tard, devant sa porte, les clés restées à l'intérieur.", en: "{name} cared for the whole town, except himself. He realized too late, at his own door, keys still inside." },
    { fr: "{name} a donné son dernier billet à un patient pour un taxi. {Il|Elle} a fait tout le chemin du retour à pied.", en: "{name} gave his last bill to a patient for a cab. He walked the whole way home himself." },
    { fr: "{name} a couvert les gardes de tout le monde pendant des années. Le jour où {il|elle} est tomb{é|ée} malade, il n'y avait personne pour {lui|elle}.", en: "{name} covered everyone's shifts for years. The day he fell ill, there was no one for him." },
  ],
  artiste: [
    { fr: "{name} a tout vendu pour financer une toile entièrement blanche. Personne ne l'a comprise, {lui|elle} non plus.", en: "{name} sold everything to fund an entirely blank canvas. Nobody understood it, himself included." },
    { fr: "{name} a peint la fresque de sa vie sur un mur. Le mur a été démoli le lendemain pour un parking.", en: "{name} painted the fresco of his life on a wall. The wall was torn down the next day for a parking lot." },
    { fr: "{name} a refusé de vendre une seule de ses œuvres, par principe. Le principe ne payait pas le loyer.", en: "{name} refused to sell a single one of his works, on principle. The principle did not cover the rent." },
  ],
  militaire: [
    { fr: "{name} a survécu à tout, sauf à la paperasse de sa retraite. Le dossier s'est perdu entre deux bureaux, et {lui|elle} aussi.", en: "{name} survived everything but his own retirement paperwork. The file got lost between two offices, and so did he." },
    { fr: "{name} a monté la garde si longtemps qu'{il|elle} en a oublié la raison. Quand {il|elle} a demandé, plus personne ne s'en souvenait.", en: "{name} stood guard so long he forgot the reason. When he asked, no one else remembered either." },
    { fr: "{name} a suivi les ordres jusqu'au tout dernier. Le dernier ordre était de rentrer chez {lui|elle}, mais {il|elle} n'en avait plus.", en: "{name} followed orders down to the very last. The last order was to go home, but he no longer had one." },
  ],
  bibliothecaire: [
    { fr: "{name} connaissait chaque livre par cœur. La bibliothèque a fermé faute de lecteurs, et {il|elle} en était le {dernier|dernière}.", en: "{name} knew every book by heart. The library closed for lack of readers, and he was the last one." },
    { fr: "{name} a gardé un livre en retard pendant quarante ans. L'amende a fini par valoir son appartement.", en: "{name} kept a book overdue for forty years. The fine eventually came to the price of his flat." },
    { fr: "{name} a rangé le dernier rayon avant de partir, comme chaque soir. On avait oublié de lui dire qu'{il|elle} était licenci{é|ée}.", en: "{name} shelved the last row before leaving, like every night. They had forgotten to tell him he was let go." },
  ],
  vendeur: [
    { fr: "{name} pouvait vendre n'importe quoi à n'importe qui. {Il|Elle} s'est vendu à {lui-même|elle-même} une voiture qu'{il|elle} n'avait pas, et l'a payée.", en: "{name} could sell anything to anyone. He sold himself a car he didn't own, and paid for it." },
    { fr: "{name} a promis « satisfait ou remboursé » à toute la ville. Toute la ville est revenue le même jour.", en: "{name} promised the whole town \"satisfied or refunded.\" The whole town came back the same day." },
    { fr: "{name} a conclu la meilleure affaire de sa vie. C'est l'acheteur, malheureusement, qui la raconte encore.", en: "{name} closed the best deal of his life. Sadly, it's the buyer who still tells the story." },
  ],
  jardinier: [
    { fr: "{name} a fait pousser un potager superbe sur le toit de l'immeuble. Le toit n'était pas prévu pour, l'immeuble non plus.", en: "{name} grew a gorgeous garden on the building's roof. The roof wasn't built for it, and neither was the building." },
    { fr: "{name} a parlé à ses plantes pendant vingt ans. Le jour où elles ont semblé répondre, on est venu {le|la} chercher.", en: "{name} talked to his plants for twenty years. The day they seemed to answer, someone came to take him away." },
    { fr: "{name} a tout misé sur une récolte parfaite. Une gelée d'avril a tout emporté en une seule nuit.", en: "{name} bet everything on a perfect harvest. An April frost took it all in a single night." },
  ],
  avocat: [
    { fr: "{name} a gagné tous ses procès, sauf le sien. {Il|Elle} s'était chois{i|ie} comme adversaire, par excès de confiance.", en: "{name} won every case but his own. He'd chosen himself as the opponent, out of overconfidence." },
    { fr: "{name} a défendu un pigeon devant le tribunal, par principe. Le principe lui a coûté le cabinet.", en: "{name} defended a pigeon in court, on principle. The principle cost him the firm." },
    { fr: "{name} a plaidé si bien qu'{il|elle} en a oublié de se faire payer. Ses clients, eux, n'ont rien oublié.", en: "{name} argued so well he forgot to get paid. His clients, however, forgot nothing." },
  ],
  musicien: [
    { fr: "{name} a attendu le grand concert pendant trente ans. Le soir venu, son harmonica s'est brisé sur la première note, et {il|elle} n'a jamais rejoué depuis.", en: "{name} waited thirty years for the big concert. When the night came, his harmonica snapped on the first note, and he never played again." },
    { fr: "{name} a tout misé sur un seul disque. Il est sorti le jour d'un tube que tout le monde a retenu, sauf le sien.", en: "{name} bet everything on a single record. It came out the day of a hit everyone remembers, except his." },
    { fr: "{name} a joué dans le métro jusqu'au dernier train, chaque soir. Un jour, le dernier train n'a plus voulu de {lui|elle}.", en: "{name} played in the metro until the last train, every night. One day, the last train had no more room for him." },
  ],
  boxeur: [
    { fr: "{name} n'a jamais touché le tapis sur un ring. {Il|Elle} l'a touché en glissant sur sa ceinture de champion, posée par terre.", en: "{name} never hit the canvas in the ring. He hit it slipping on his champion's belt, left on the floor." },
    { fr: "{name} a encaissé mille coups sans broncher. Le seul qui l'a {mis|mise} à terre, c'était un huissier, très poli.", en: "{name} took a thousand punches without flinching. The only one who put him down was a bailiff, very polite." },
    { fr: "{name} a livré un dernier combat de trop. Ses poings s'en souviennent, sa tête un peu moins.", en: "{name} fought one last bout too many. His fists remember it, his head a little less." },
  ],
  poete: [
    { fr: "{name} a écrit le plus beau vers de sa vie au dos d'un ticket. {Il|Elle} l'a rendu à la caissière par erreur, et le vers est parti avec la monnaie.", en: "{name} wrote the finest line of his life on the back of a receipt. He handed it to the cashier by mistake, and the line left with the change." },
    { fr: "{name} a refusé de vendre son âme pour un vrai métier. Son âme est intacte ; le reste, beaucoup moins.", en: "{name} refused to sell his soul for a real job. His soul is intact; the rest, far less so." },
    { fr: "{name} a attendu que le monde comprenne enfin sa poésie. Le monde était occupé ailleurs.", en: "{name} waited for the world to finally understand his poetry. The world was busy elsewhere." },
  ],
  _default: [
    { fr: "{name} avait une petite vie bien rangée. Une erreur, un coup de malchance, et elle s'est retrouvée rangée dehors.", en: "{name} had a tidy little life. One mistake, one stroke of bad luck, and it got tidied out onto the street." },
  ],
};

// Le CARACTÈRE ouvre le récit : une amorce qui pose la personnalité juste avant
// le prénom. Elle s'enchaîne naturellement avec n'importe quelle chute.
const TRAIT_OPENERS: Record<string, Bilingual> = {
  'estomac-acier': { fr: "L'estomac blindé,", en: "With a cast-iron stomach," },
  optimiste: { fr: "Incorrigible optimiste,", en: "An incurable optimist," },
  poissard: { fr: "{Poissard|Poissarde} depuis toujours,", en: "Cursed with bad luck from birth," },
  'ami-pigeons': { fr: "Plus proche des pigeons que des gens,", en: "Closer to pigeons than to people," },
  'sommeil-plomb': { fr: "{Dormeur|Dormeuse} de plomb,", en: "A dead-to-the-world sleeper," },
  'nez-sensible': { fr: "Le nez qui flaire tout,", en: "With a nose for trouble," },
  insomniaque: { fr: "Insomniaque de longue date,", en: "A lifelong insomniac," },
  paranoiaque: { fr: "Méfiant{|e} de tout et de tous,", en: "Suspicious of everyone," },
  'main-verte': { fr: "La main verte jusqu'au bout,", en: "Green-thumbed to a fault," },
  charismatique: { fr: "{Charmeur|Charmeuse} invétéré{|e},", en: "A born charmer," },
  'os-mousse': { fr: "Les os en mousse,", en: "With bones made of foam," },
  metabolisme: { fr: "Affamé{|e} en permanence,", en: "Forever hungry," },
  collectionneur: { fr: "Incapable de rien jeter,", en: "Unable to throw anything away," },
  'phobie-rats': { fr: "Terrorisé{|e} par les rats,", en: "Terrified of rats," },
  haleine: { fr: "L'haleine redoutable,", en: "With breath that could stop a clock," },
  agile: { fr: "Agile comme un chat,", en: "Quick on his feet," },
  'resistant-froid': { fr: "Insensible au froid,", en: "Immune to the cold," },
  bricoleur: { fr: "{Bricoleur|Bricoleuse} dans l'âme,", en: "A tinkerer to the core," },
  orientation: { fr: "Jamais perdu{|e} nulle part,", en: "Never once lost," },
  'ventre-pattes': { fr: "Prêt{|e} à manger n'importe quoi,", en: "Willing to eat anything," },
};

// Hachage simple et stable d'une chaîne (seed déterministe).
function seedNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Résout les tokens d'accord {masculin|féminin} selon le genre. Un {name} (sans
// barre verticale) n'est jamais touché ici.
function genderize(s: string, feminine: boolean): string {
  return s.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_m, masc, fem) => (feminine ? fem : masc));
}

export function generateOrigin(char: Character): OriginStory {
  const downfalls = JOB_DOWNFALLS[char.job.id] || JOB_DOWNFALLS._default;
  const h = seedNum(char.seed || char.name || 'sdf');
  const fall = downfalls[h % downfalls.length];
  // Le caractère (un des deux traits) OUVRE l'histoire : la chute est ainsi
  // façonnée par le métier ET la personnalité, sans phrase plaquée à la fin.
  const openers = char.traits.map((t) => TRAIT_OPENERS[t.id]).filter(Boolean) as Bilingual[];
  const opener = openers.length ? openers[Math.floor(h / 7) % openers.length] : null;
  const feminine = char.gender === 'f';
  const nameFill = (s: string) => s.replace(/\{name\}/g, char.name);
  return {
    titleFr: `La Chute de ${char.name}`,
    titleEn: `The Fall of ${char.name}`,
    textFr: nameFill(genderize((opener ? opener.fr + ' ' : '') + fall.fr, feminine)),
    textEn: nameFill((opener ? opener.en + ' ' : '') + fall.en),
  };
}
