// ============================================================================
// VOYAGER, VAGUE 2 (30 événements)
// ----------------------------------------------------------------------------
// Ce qui arrive EN CHEMIN entre deux quartiers : raccourcis douteux, rencontres
// de trottoir, la ville qui se met en travers. Fusionné dans TRAVEL_EVENTS
// (voir events.ts). Images /assets/travel-<id>.webp, repli dessiné si absentes.
// ============================================================================
import type { GameEvent } from '../types';

export const TRAVEL_EVENTS_2: GameEvent[] = [
  {
    id: 'travel-passage-souterrain', title: 'Le Passage Souterrain', type: 'narrative',
    image: '/assets/travel-passage-souterrain.webp',
    description: 'Le passage souterrain coupe le trajet en deux. Au milieu, un accordéoniste joue pour personne, et l\'acoustique lui fait un orchestre.',
    choices: [
      { text: 'Traverser en écoutant', risk: 'safe', emoji: '🪗', outcomes: [
        { probability: 0.7, text: 'Trois minutes de valse sous la ville. Il vous salue du menton entre deux mesures. Vous ressortez de l\'autre côté avec une chanson dans les jambes.', statChanges: { mental: 8 } },
        { probability: 0.3, text: 'Il s\'arrête PILE quand vous passez et vous regarde : « toi, t\'as une tête à requêtes. Vas-y, demande. » Vous demandez « Les Champs-Élysées ». Il la joue. La ville entière l\'entend.', statChanges: { mental: 10, dignity: 3 } },
      ]},
      { text: 'Poser une pièce en passant', risk: 'safe', emoji: '🪙', outcomes: [
        { probability: 1, text: 'Une pièce de pauvre à pauvre, c\'est une pièce double. Il attaque un morceau rien que pour votre dos qui s\'éloigne.', moneyChange: -1, statChanges: { mental: 10, dignity: 5 }, respectChange: 1 },
      ]},
    ],
  },
  {
    id: 'travel-passerelle', title: 'La Passerelle des Rails', type: 'narrative',
    image: '/assets/travel-passerelle.webp',
    description: 'La passerelle piétonne enjambe douze voies ferrées. En dessous, les trains partent vers des endroits où vous ne dormirez pas ce soir.',
    choices: [
      { text: 'S\'arrêter regarder les trains', risk: 'safe', emoji: '🚆', outcomes: [
        { probability: 0.6, text: 'Vingt minutes à regarder partir les grandes lignes. Marseille, Bordeaux, Lille. Vous choisissez mentalement votre destination. Ça ne coûte rien et ça meuble l\'âme.', statChanges: { mental: 7 } },
        { probability: 0.4, text: 'Un cheminot en contrebas vous fait un signe de la main. Vous répondez. Deux inconnus qui se saluent au-dessus de douze voies : le contrat social tient encore.', statChanges: { mental: 8 } },
      ]},
      { text: 'Traverser vite, le vent est mauvais', risk: 'normal', emoji: '💨', outcomes: [
        { probability: 0.7, text: 'La passerelle vibre sous les rafales. Vous traversez plié en deux, mais vous traversez. Le raccourci vaut ses frissons.', statChanges: { sleep: -2, mental: 3 } },
        { probability: 0.3, text: 'Une rafale vous plaque contre le grillage au moment où l\'InterCités passe dessous à pleine vitesse. Le souffle vous décoiffe l\'existence. Grandiose et terrifiant.', statChanges: { mental: -3, health: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-abribus-oublis', title: 'L\'Abribus aux Oublis', type: 'discovery',
    image: '/assets/travel-abribus-oublis.webp',
    description: 'L\'abribus du boulevard est un musée des choses oubliées : un parapluie, un sac de sport, et un livre ouvert face contre banc, comme si son lecteur allait revenir.',
    choices: [
      { text: 'Inventorier les trouvailles', risk: 'normal', emoji: '🧳', outcomes: [
        { probability: 0.5, text: 'Le sac de sport contient des affaires de piscine et un gel douche entamé. Le parapluie ferme mal mais ouvre bien. Butin de voyageur.', statChanges: { dignity: 4, mental: 4 }, itemGain: { id: 'parapluie-abribus', name: 'Parapluie de l\'abribus', emoji: '☂️', type: 'tool', value: 3 } },
        { probability: 0.3, text: 'Le propriétaire du sac revient en courant, essoufflé. Vous le lui tendez, intact. Il fouille, vérifie, puis a honte de lui : il vous paie « la consigne ».', moneyChange: 4, respectChange: 1, statChanges: { mental: 4 } },
        { probability: 0.2, text: 'Le livre est un roman à l\'eau de rose, corné à la page 147. Vous le finissez sur place. Ils se marient. Vous pleurez un peu, à l\'abri des regards.', statChanges: { mental: 9 } },
      ]},
      { text: 'Attendre le bus sans rien toucher', risk: 'safe', emoji: '🚌', outcomes: [
        { probability: 1, text: 'Le bus passe, vous ne montez pas. L\'abribus reste le seul endroit où attendre est un statut social respectable.', statChanges: { sleep: 4, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'travel-zone-travaux', title: 'La Déviation', type: 'narrative',
    image: '/assets/travel-zone-travaux.webp',
    description: 'La rue est éventrée sur cent mètres : « DÉVIATION » pointe vers un labyrinthe de barrières où un ouvrier fait de grands gestes contradictoires.',
    choices: [
      { text: 'Suivre les flèches officielles', risk: 'normal', emoji: '🚧', outcomes: [
        { probability: 0.6, text: 'Le circuit officiel fait trois fois le tour du pâté de maisons et repasse par le point de départ. Un chef-d\'œuvre administratif. Vous arrivez, tard mais réglementaire.', statChanges: { sleep: -3, mental: 2 } },
        { probability: 0.4, text: 'La déviation vous fait passer devant une boulangerie inconnue qui brade ses invendus de 16h. La bureaucratie a parfois du goût.', statChanges: { hunger: 12, mental: 5 } },
      ]},
      { text: 'Couper à travers le chantier', risk: 'risky', emoji: '🦺', outcomes: [
        { probability: 0.5, text: 'L\'ouvrier aux grands gestes vous escorte lui-même : « passe, mais marche où je marche. » Traversée VIP entre les tranchées, plus un conseil : « le bitume tiède, la nuit, ça tient chaud. » Un sage.', statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.5, text: 'Votre pied trouve la seule flaque de béton frais du chantier. Vous laissez une empreinte pour la postérité et une chaussure alourdie pour le reste du trajet.', statChanges: { health: -3, mental: -4, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-chien-suiveur', title: 'Le Chien qui Suit', type: 'social',
    image: '/assets/travel-chien-suiveur.webp',
    description: 'Depuis trois rues, un chien jaune sans collier vous suit à quatre mètres, l\'air de rien. Quand vous vous arrêtez, il s\'arrête. Quand vous repartez, il repart.',
    choices: [
      { text: 'L\'adopter pour le trajet', risk: 'safe', emoji: '🐕', outcomes: [
        { probability: 0.6, text: 'Vous voyagez à deux. Il trotte fier, vous marchez droit. Les passants sourient au duo, une dame donne « pour le chien ». Le chien partage.', moneyChange: 3, statChanges: { mental: 12 } },
        { probability: 0.4, text: 'Au carrefour, il bifurque vers une autre silhouette solitaire, sans un regard. C\'est un chien d\'accompagnement freelance. Trois rues de compagnie, c\'était son forfait.', statChanges: { mental: 6 } },
      ]},
      { text: 'Tester sa loyauté au premier virage', risk: 'normal', emoji: '🔀', outcomes: [
        { probability: 0.5, text: 'Vous tournez sec, il coupe la diagonale et vous attend DÉJÀ de l\'autre côté. Ce chien connaît la ville mieux que le cadastre. Vous le suivez, et il vous fait gagner dix minutes.', statChanges: { mental: 8, sleep: 2 } },
        { probability: 0.5, text: 'Il s\'assied au milieu du virage et vous regarde partir avec une déception de vieux maître d\'école. Vous vous excusez. À un chien. En public.', statChanges: { mental: 2, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-porche-facteur', title: 'L\'Averse et le Facteur', type: 'social',
    image: '/assets/travel-porche-facteur.webp',
    description: 'Le ciel se déchire en pleine traversée. Vous plongez sous un porche déjà occupé par un facteur, sa sacoche, et un silence de circonstance.',
    choices: [
      { text: 'Engager la conversation', risk: 'safe', emoji: '💬', outcomes: [
        { probability: 0.7, text: 'Vingt minutes de pluie, une tournée de confidences : les boîtes aux lettres pleines de gens partis, les prénoms qu\'il connaît par cœur. Il partage son casse-croûte. Deux métiers de la rue qui se comprennent.', statChanges: { hunger: 10, mental: 8 } },
        { probability: 0.3, text: 'Il vous apprend le tri postal des porches : « celui-là abrite mal du vent d\'ouest, prends celui de la pharmacie. » Une cartographie que même l\'égoutier n\'a pas.', statChanges: { mental: 6, sleep: 3 } },
      ]},
      { text: 'Attendre en silence, chacun son coin', risk: 'safe', emoji: '🌧️', outcomes: [
        { probability: 1, text: 'La pluie fait la conversation. Au moment de partir, il vous tend un prospectus : « c\'est pas grand-chose, mais c\'est sec. » Le geste le plus postal du monde.', statChanges: { mental: 4 } },
      ]},
    ],
  },
  {
    id: 'travel-carrefour-touristes', title: 'Les Touristes Perdus', type: 'social',
    image: '/assets/travel-carrefour-touristes.webp',
    description: 'Au carrefour, un couple de touristes tourne sa carte dans tous les sens. Ils vous repèrent : dans cette rue, c\'est vous qui avez l\'air de savoir où vous allez. C\'est dire.',
    choices: [
      { text: 'Les guider en personne', risk: 'safe', emoji: '🧭', outcomes: [
        { probability: 0.7, text: 'Quinze minutes de détour pour les mener à leur musée, avec commentaire des façades. Ils insistent pour payer « le guide ». Vous acceptez « pour la profession ».', moneyChange: 5, statChanges: { mental: 6, dignity: 4 } },
        { probability: 0.3, text: 'Vous les perdez ENCORE PLUS. Le quartier a changé, pas vous. Vous finissez à trois devant le plan du bus, unis dans l\'échec. Ils vous offrent un gaufre de consolation mutuelle.', statChanges: { hunger: 8, mental: 4, dignity: -2 } },
      ]},
      { text: 'Indiquer le chemin d\'un geste sûr', risk: 'normal', emoji: '👉', outcomes: [
        { probability: 0.6, text: 'Votre geste est ample, précis, définitif. Ils partent confiants dans la bonne direction. Vous restez planté là, investi d\'une autorité municipale imaginaire.', statChanges: { mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'Vous confondez droite et gauche sous pression. Ils partent vers la zone industrielle en vous remerciant chaleureusement. Vous n\'avez pas le courage de crier.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-benne-camion', title: 'Le Camion Complice', type: 'narrative',
    image: '/assets/travel-benne-camion.webp',
    description: 'Un camion plateau démarre au feu, chargé de palettes, pile dans votre direction. La ridelle arrière est basse. Le chauffeur ne regarde que devant.',
    choices: [
      { text: 'Monter à l\'arrière au feu rouge', risk: 'risky', emoji: '🛻', outcomes: [
        { probability: 0.5, text: 'Douze rues avalées assis sur une palette, le vent dans la barbe, la ville qui défile. Vous descendez au ralenti suivant, jambes fraîches, roi du transport combiné.', statChanges: { sleep: 4, mental: 8 } },
        { probability: 0.3, text: 'Le chauffeur vous voit dans le rétro au deuxième feu... et vous fait signe de vous accrocher : « fallait demander ! » Il vous dépose à destination, porte à porte. Le covoiturage a un pionnier.', statChanges: { mental: 8, sleep: 4 }, respectChange: 1 },
        { probability: 0.2, text: 'Le camion prend le périphérique. Vous descendez à la première bretelle, à deux kilomètres du mauvais côté de la ville. Le progrès du transport, mais dans le mauvais sens.', statChanges: { sleep: -5, mental: -4, health: -2 } },
      ]},
      { text: 'Continuer à pied, comme un sage', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'La marche, au moins, ne prend jamais le périphérique. Vous arrivez à l\'heure de ceux qui n\'ont pas d\'heure.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'travel-voie-ferree', title: 'Le Long des Rails', type: 'narrative',
    image: '/assets/travel-voie-ferree.webp',
    description: 'Le raccourci du ballast : longer la voie ferrée désaffectée, entre les orties et les traverses. Interdit, désert, et deux fois plus court.',
    choices: [
      { text: 'Marcher sur les traverses', risk: 'normal', emoji: '🛤️', outcomes: [
        { probability: 0.6, text: 'Un pas par traverse, le rythme vient tout seul. Vous traversez la ville par sa cicatrice, salué par deux lapins et un chat de remblai. Arrivée express.', statChanges: { mental: 6, sleep: 2 } },
        { probability: 0.4, text: 'Entre deux traverses, une plaque de ballast roule. Cheville tordue au milieu de nulle part, il reste la moitié du chemin à boiter. Le raccourci rallonge.', statChanges: { health: -6, mental: -3 } },
      ]},
      { text: 'Fouiller le long du remblai', risk: 'normal', emoji: '🔍', outcomes: [
        { probability: 0.5, text: 'Le remblai est un musée : boulons anciens, une lanterne de chantier qui marche encore, et une plaque « SNCF » que le brocanteur s\'arrachera.', moneyChange: 5, statChanges: { mental: 5 }, itemGain: { id: 'lanterne-chantier', name: 'Lanterne de chantier', emoji: '🏮', type: 'tool', value: 6 } },
        { probability: 0.5, text: 'Les orties défendent leur territoire avec un zèle de vigile. Vous ressortez les mains vides et les chevilles en feu. La nature aussi a ses videurs.', statChanges: { health: -4, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-parking-silo', title: 'Le Parking en Spirale', type: 'narrative',
    image: '/assets/travel-parking-silo.webp',
    description: 'Le parking silo traverse le pâté de maisons de part en part. Sept étages de spirale en béton, ou le tour complet par le boulevard. La rampe vous tend les bras.',
    choices: [
      { text: 'Couper par la spirale', risk: 'normal', emoji: '🌀', outcomes: [
        { probability: 0.6, text: 'Sept étages de descente en colimaçon, l\'écho de vos pas en fanfare. Vous ressortez de l\'autre côté, légèrement étourdi, largement vainqueur.', statChanges: { mental: 5, sleep: 2 } },
        { probability: 0.4, text: 'Au niveau -2, une voiture vous frôle en klaxonnant comme si VOUS étiez l\'anomalie. Dans un monde de rampes, le piéton est un intrus. Vous ressortez quand même.', statChanges: { mental: -2, health: -1 } },
      ]},
      { text: 'Vérifier les horodateurs au passage', risk: 'normal', emoji: '🪙', outcomes: [
        { probability: 0.5, text: 'Trois machines, deux oublis de monnaie, un ticket encore valide revendu au conducteur suivant. Le silo est une tirelire verticale.', moneyChange: 5, statChanges: { mental: 4 } },
        { probability: 0.5, text: 'Les machines sont passées au sans-contact. Le progrès a vidé les sébiles mécaniques. Vous ressortez bredouille avec une pensée pour l\'ancien monde.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-halles-nuit', title: 'Les Halles à la Fermeture', type: 'discovery',
    image: '/assets/travel-halles-nuit.webp',
    description: 'Votre trajet traverse les halles couvertes à l\'heure du rideau : les commerçants remballent, les invendus hésitent entre la glacière et la benne.',
    choices: [
      { text: 'Passer lentement entre les étals', risk: 'safe', emoji: '🧺', outcomes: [
        { probability: 0.7, text: 'Le fromager vous hèle : « la coulante, là, elle tiendra pas la nuit. » Puis le primeur, puis la rôtisseuse. Vous ressortez des halles avec un banquet d\'invendus. Le timing est un métier.', statChanges: { hunger: 24, mental: 8 } },
        { probability: 0.3, text: 'Ce soir, une association passe avant vous avec des cagettes. Vous aidez à charger leur camionnette, et ils vous laissent une part : « circuit court. »', statChanges: { hunger: 12, mental: 5 }, respectChange: 1 },
      ]},
      { text: 'Aider à remonter les rideaux de fer', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 1, text: 'Six rideaux de fer, six poignées de main, deux pièces et un poulet de la veille. Les halles paient toujours leur main-d\'œuvre du soir, c\'est une loi non écrite.', moneyChange: 2, statChanges: { hunger: 15, health: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-cimetiere-raccourci', title: 'Le Raccourci du Cimetière', type: 'narrative',
    image: '/assets/travel-cimetiere-raccourci.webp',
    description: 'Le cimetière a deux entrées opposées : le traverser coupe le trajet de moitié. Les allées sont droites, les résidents discrets, le silence pèse son poids.',
    choices: [
      { text: 'Traverser d\'un pas respectueux', risk: 'safe', emoji: '🕊️', outcomes: [
        { probability: 0.7, text: 'Les allées de gravier, les noms qui défilent, les dates qui font compter. Vous ressortez de l\'autre côté plus calme et vaguement philosophe. Le raccourci le plus paisible de la ville.', statChanges: { mental: 8 } },
        { probability: 0.3, text: 'À mi-chemin, une vieille dame arrose des fleurs et vous prend à témoin : « il détestait les bégonias, mais je lui en mets quand même. » Vous écoutez trente ans de mariage en cinq minutes. Elle vous donne le pain de son sac.', statChanges: { hunger: 10, mental: 8 } },
      ]},
      { text: 'S\'arrêter boire au robinet des arrosoirs', risk: 'safe', emoji: '🚰', outcomes: [
        { probability: 1, text: 'L\'eau des arrosoirs est municipale, fraîche et gratuite. Les morts ne diront rien : ils partagent tout, eux.', statChanges: { thirst: 15 } },
      ]},
    ],
  },
  {
    id: 'travel-berge-canal', title: 'Le Chemin de Halage', type: 'narrative',
    image: '/assets/travel-berge-canal.webp',
    description: 'Le chemin de halage longe le canal jusqu\'au quartier suivant : plat, calme, bordé de pêcheurs immobiles et de canards administratifs.',
    choices: [
      { text: 'Longer l\'eau tranquillement', risk: 'safe', emoji: '🦆', outcomes: [
        { probability: 0.7, text: 'Le canal fait la moitié du travail : on ne marche pas le long de l\'eau, on glisse. Un pêcheur vous tend une canette au passage, sans quitter son bouchon des yeux.', statChanges: { thirst: 8, mental: 7 } },
        { probability: 0.3, text: 'Une péniche remonte le canal à votre vitesse exacte. Trois kilomètres de compagnonnage muet avec le marinier, conclus d\'un coup de corne de brume en guise d\'au revoir. Grandiose.', statChanges: { mental: 10 } },
      ]},
      { text: 'Ramasser ce que le canal rejette', risk: 'normal', emoji: '🎣', outcomes: [
        { probability: 0.5, text: 'La berge est généreuse : une bouteille consignée, un ballon de foot à peine dégonflé, et une chaise de camping qui ne demande qu\'à croire en elle.', moneyChange: 2, statChanges: { mental: 4 }, itemGain: { id: 'chaise-camping', name: 'Chaise de camping du canal', emoji: '🪑', type: 'junk', value: 5 } },
        { probability: 0.5, text: 'Ce que vous preniez pour un sac flottant était un cygne de mauvais poil. La négociation territoriale tourne court. Vous cédez la berge sur cinquante mètres.', statChanges: { health: -3, dignity: -3, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-dame-pipi', title: 'La Gardienne des Toilettes', type: 'social',
    image: '/assets/travel-dame-pipi.webp',
    description: 'Les toilettes publiques du square, tenues depuis trente ans par une gardienne en blouse qui a tout vu, tout entendu, et gardé le meilleur.',
    choices: [
      { text: 'Payer les 50 centimes réglementaires', risk: 'safe', emoji: '🚻', outcomes: [
        { probability: 0.7, text: 'Elle refuse votre pièce d\'un geste : « toi, c\'est offert par la maison. » Lavabo, savon, miroir, et un « bonne route, mon grand » qui vaut un soin du visage.', statChanges: { dignity: 8, mental: 6 } },
        { probability: 0.3, text: 'Elle prend la pièce, puis vous rend le double « pour le geste ». Sa caisse fonctionne selon des règles connues d\'elle seule, et elles sont favorables aux polis.', moneyChange: 1, statChanges: { dignity: 5, mental: 4 } },
      ]},
      { text: 'Discuter le bout de gras', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 1, text: 'Trente ans de secrets de quartier en vingt minutes : qui a coulé, qui a triché, où dort le patron du kebab quand sa femme le sort. Elle offre le café du percolateur. Une institution.', statChanges: { thirst: 8, mental: 10 } },
      ]},
    ],
  },
  {
    id: 'travel-egout-ouvert', title: 'La Bouche Ouverte', type: 'narrative',
    image: '/assets/travel-egout-ouvert.webp',
    description: 'En travers du trottoir, une bouche d\'égout ouverte, entourée de trois plots et d\'aucun ouvrier. Le trou respire doucement. Le détour, lui, fait cinquante mètres.',
    choices: [
      { text: 'Enjamber prudemment', risk: 'normal', emoji: '🦵', outcomes: [
        { probability: 0.7, text: 'Un grand pas au-dessus du vide, digne d\'un héron administratif. Le trou vous regarde passer. Vous gagnez cinquante mètres et un petit frisson.', statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Du fond du trou, une voix : « pendant que t\'y es, passe-moi la clé, sur le plot ! » Vous passez la clé à un bras surgi du sol. « Merci ! » La ville fonctionne grâce à des mains anonymes. La vôtre, là.', statChanges: { mental: 6 }, respectChange: 1 },
      ]},
      { text: 'Crier « ça va là-dessous ? »', risk: 'safe', emoji: '📣', outcomes: [
        { probability: 0.6, text: '« Non ! » répond l\'écho, suivi d\'un rire. L\'ouvrier remonte, s\'étire, et partage son café en échange « de la seule question sincère de la journée ».', statChanges: { thirst: 8, mental: 6 } },
        { probability: 0.4, text: 'Pas de réponse. Vous repartez en vous demandant si vous venez de parler à un trou. Oui. Vous avez parlé à un trou. La journée est encore longue.', statChanges: { mental: 1 } },
      ]},
    ],
  },
  {
    id: 'travel-escalier-monumental', title: 'L\'Escalier Monumental', type: 'narrative',
    image: '/assets/travel-escalier-monumental.webp',
    description: 'Entre le bas et le haut du quartier : l\'escalier monumental, cent quatre-vingts marches de pierre que les joggeurs montent en boucle comme des punitions volontaires.',
    choices: [
      { text: 'Grimper à son rythme', risk: 'normal', emoji: '🪜', outcomes: [
        { probability: 0.6, text: 'Cent quatre-vingts marches en douze paliers de récupération. En haut, la ville entière s\'étale et le vent vous sèche le front. Les joggeurs vous saluent : ici, monter suffit à faire partie du club.', statChanges: { health: 2, mental: 8, sleep: -3 } },
        { probability: 0.4, text: 'Au palier 9, les jambes votent la grève générale. Vous finissez assis à mi-hauteur, ni en haut ni en bas, métaphore trop évidente pour être savourée. Un joggeur vous tend sa gourde en passant.', statChanges: { thirst: 8, health: -2, mental: 2 } },
      ]},
      { text: 'Faire la manche sur le palier du milieu', risk: 'normal', emoji: '🎩', outcomes: [
        { probability: 0.5, text: 'Génie logistique : à mi-escalier, tout le monde s\'arrête pour souffler, et un homme qui souffle est un homme qui donne. Le palier 6 est une mine.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.5, text: 'Les joggeurs ne s\'arrêtent JAMAIS. Ils donnent des encouragements : « courage ! », « bel effort ! ». Vous n\'avez rien demandé de tel. Le chapeau reste vide, l\'ironie déborde.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-trottinette', title: 'La Trottinette Échouée', type: 'discovery',
    image: '/assets/travel-trottinette.webp',
    description: 'Une trottinette électrique en libre-service gît couchée en travers du chemin, abandonnée avec 40 % de batterie et zéro surveillance. La tentation a un guidon.',
    choices: [
      { text: 'La déverrouiller à l\'ancienne (la pousser)', risk: 'normal', emoji: '🛴', outcomes: [
        { probability: 0.6, text: 'Débridée façon draisienne : un pied dessus, un pied qui pousse. Pas de moteur, pas de traçage, pas de facture. Vous traversez le quartier en trottinette Flintstones. Efficace et légal-ish.', statChanges: { mental: 7, sleep: 3 } },
        { probability: 0.4, text: 'La trottinette hurle « VÉHICULE EN DÉTRESSE » au bout de cent mètres. Vous la reposez délicatement, comme une bombe, et partez en sifflotant sous les regards.', statChanges: { mental: -3, dignity: -3 } },
      ]},
      { text: 'La redresser et la ranger proprement', risk: 'safe', emoji: '🅿️', outcomes: [
        { probability: 0.7, text: 'Vous la garez droite, hors du passage. Un « juicer » qui passait la recharge et vous tend deux pièces : « c\'est toi qui me l\'as gardée belle. » L\'économie des plateformes a des marges de gentillesse.', moneyChange: 2, statChanges: { mental: 4 }, respectChange: 1 },
        { probability: 0.3, text: 'Redressée, elle redémarre son bip de détresse toute seule. Vous n\'y êtes pour rien mais tout le monde vous regarde. Vous plaidez l\'innocence par haussement d\'épaules et poursuivez votre route.', statChanges: { mental: 1 } },
      ]},
    ],
  },
  {
    id: 'travel-cortege-funeraire', title: 'Le Cortège', type: 'narrative',
    image: '/assets/travel-cortege-funeraire.webp',
    description: 'Un cortège funéraire remonte lentement la rue et coupe votre trajet : corbillard, famille en noir, et un klaxon de scooter impatient que tout le monde foudroie du regard.',
    choices: [
      { text: 'S\'arrêter et se découvrir', risk: 'safe', emoji: '🎩', outcomes: [
        { probability: 0.7, text: 'Vous restez droit, bonnet sur le cœur, le temps du passage. Un monsieur du cortège vous adresse un signe de tête qui vaut tous les certificats de dignité. Le mort, quelque part, apprécie le style.', statChanges: { dignity: 8, mental: 5 }, respectChange: 1 },
        { probability: 0.3, text: 'Une dame du cortège se détache et vous glisse un billet : « il donnait toujours, lui. Continuez la tournée. » Vous voilà exécuteur testamentaire officieux d\'un inconnu généreux.', moneyChange: 5, statChanges: { mental: 6 } },
      ]},
      { text: 'Suivre discrètement jusqu\'au vin d\'honneur', risk: 'risky', emoji: '🍷', outcomes: [
        { probability: 0.5, text: 'La salle paroissiale accueille tout le monde en noir, et votre manteau est presque noir. Quiches, blanc sec, anecdotes sur le défunt : « lui, il aurait ri de vous voir là. » Vous levez votre verre à sa santé posthume.', statChanges: { hunger: 18, thirst: 10, mental: 4, dignity: -3 } },
        { probability: 0.5, text: 'La famille est petite et se connaît par cœur. On vous demande « vous êtes du côté de qui ? » Votre réponse (« du quartier ») jette un froid, puis la veuve tranche : « le quartier, c\'était toute sa vie. Restez. » Sueurs froides, quiche chaude.', statChanges: { hunger: 12, mental: -2, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-camionnette-glaces', title: 'La Camionnette à Glaces', type: 'narrative',
    image: '/assets/travel-camionnette-glaces.webp',
    description: 'La ritournelle d\'une camionnette à glaces flotte quelque part dans le quartier, obsédante, insaisissable. Elle semble tourner autour de vous depuis dix minutes.',
    choices: [
      { text: 'La traquer à l\'oreille', risk: 'normal', emoji: '🍦', outcomes: [
        { probability: 0.5, text: 'Trois rues de triangulation sonore et vous la coincez au square. Le glacier applaudit : « t\'es le premier adulte à me courir après depuis 1998. » Cornet offert au mérite.', statChanges: { hunger: 10, mental: 10 } },
        { probability: 0.3, text: 'La ritournelle s\'éloigne à jamais, comme l\'enfance. Vous restez au milieu du carrefour avec votre envie de glace et vos économies intactes. C\'est peut-être mieux comme ça. Non, en fait, non.', statChanges: { mental: -3 } },
        { probability: 0.2, text: 'Vous la retrouvez... en panne. Le glacier, fataliste, brade son stock qui fond : « deux boules pour rien, aide-moi à pousser. » Vous poussez une camionnette musicale en mangeant une glace. Journée inclassable.', statChanges: { hunger: 12, mental: 8, health: -2 } },
      ]},
      { text: 'Ignorer la sirène et filer tout droit', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Ulysse s\'attachait au mât ; vous, vous accélérez le pas. La ritournelle vous poursuit deux rues puis abandonne. Victoire morale, déficit en sorbet.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-brouillard', title: 'La Purée de Pois', type: 'narrative',
    image: '/assets/travel-brouillard.webp',
    description: 'Le brouillard avale le quartier d\'un coup : dix mètres de visibilité, les lampadaires en halos, les bruits qui arrivent sans propriétaire. La ville devient une rumeur.',
    choices: [
      { text: 'Naviguer aux façades', risk: 'normal', emoji: '🌫️', outcomes: [
        { probability: 0.6, text: 'Une main sur les murs, l\'autre devant, vous traversez le coton. Vous connaissez cette ville par cœur : le brouillard ne fait que fermer les yeux des autres. Vous arrivez pile où vous vouliez.', statChanges: { mental: 6 } },
        { probability: 0.4, text: 'Vous débouchez... devant le point de départ. Le brouillard vous a fait faire une boucle parfaite, à l\'insu de votre plein gré. Quelque part, un lampadaire se moque en morse.', statChanges: { mental: -3, sleep: -3 } },
      ]},
      { text: 'Attendre que ça lève sous un porche', risk: 'safe', emoji: '⏳', outcomes: [
        { probability: 0.7, text: 'Le brouillard se déchire en vingt minutes, dévoilant la rue comme un rideau de théâtre. Vous repartez dans une ville rincée, presque neuve. L\'attente avait du panache.', statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.3, text: 'Une silhouette émerge du blanc, vous tend un thermos sans un mot, boit après vous, et se dissout dans l\'autre sens. Vous ne saurez jamais qui. Le brouillard a ses anges.', statChanges: { thirst: 10, mental: 7 } },
      ]},
    ],
  },
  {
    id: 'travel-terrain-vague-diagonale', title: 'La Diagonale du Terrain Vague', type: 'discovery',
    image: '/assets/travel-terrain-vague-diagonale.webp',
    description: 'Le terrain vague coupe le trajet en diagonale : herbes hautes, carcasses de machines à laver, et un sentier tracé par des générations de gens pressés.',
    choices: [
      { text: 'Prendre le sentier des pressés', risk: 'normal', emoji: '🌾', outcomes: [
        { probability: 0.6, text: 'Le sentier connaît son affaire : il évite les ronces, salue les carcasses et vous recrache de l\'autre côté en cinq minutes chrono. Les chemins de traverse sont une sagesse collective.', statChanges: { mental: 4, sleep: 2 } },
        { probability: 0.4, text: 'À mi-diagonale, un lapin déboule entre vos jambes, poursuivi par rien. Vous sursautez dans les orties. Le lapin, lui, connaissait le sentier.', statChanges: { health: -3, mental: -2 } },
      ]},
      { text: 'Fouiller les carcasses au passage', risk: 'normal', emoji: '🔧', outcomes: [
        { probability: 0.5, text: 'Le tambour d\'une machine à laver fait un excellent brasero portatif, et le brocanteur le sait aussi. Vous repartez avec, roulé comme un tonneau. Le trajet double, le butin aussi.', moneyChange: 6, statChanges: { health: -3, mental: 4 } },
        { probability: 0.5, text: 'Les carcasses ont déjà été vidées par plus matinal que vous. Il reste un hublot, que vous prenez par principe : ça fera une fenêtre à votre carton. L\'immobilier avance.', statChanges: { mental: 4 }, itemGain: { id: 'hublot-machine', name: 'Hublot de machine à laver', emoji: '🪟', type: 'junk', value: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-vitrine-teles', title: 'Le Mur de Télés', type: 'narrative',
    image: '/assets/travel-vitrine-teles.webp',
    description: 'La vitrine du magasin d\'électroménager diffuse le même match sur douze écrans. Devant, un attroupement de passants qui « ne font que passer » depuis vingt minutes.',
    choices: [
      { text: 'Rejoindre le stade de trottoir', risk: 'safe', emoji: '⚽', outcomes: [
        { probability: 0.6, text: 'Le quartier au grand complet vibre en silence derrière la vitre. But à la 88e : l\'attroupement explose, on s\'étreint entre inconnus. Vous êtes dans les bras d\'un notaire. Le foot est un service public.', statChanges: { mental: 12 } },
        { probability: 0.4, text: 'Match nul, zéro but, mais un vieux monsieur commente chaque action comme à la radio des années 60. On n\'écoute plus que lui. À la fin, on l\'applaudit lui. Il salue.', statChanges: { mental: 8 } },
      ]},
      { text: 'Regarder le documentaire de l\'écran du fond', risk: 'safe', emoji: '🐧', outcomes: [
        { probability: 1, text: 'Pendant que la foule vit le match, vous suivez seul un documentaire muet sur les manchots empereurs. Soixante-dix jours sans manger dans le blizzard, debout. Des frères. Vous repartez galvanisé.', statChanges: { mental: 9 } },
      ]},
    ],
  },
  {
    id: 'travel-place-pigeons', title: 'La Place aux Mille Pigeons', type: 'narrative',
    image: '/assets/travel-place-pigeons.webp',
    description: 'La place est intégralement couverte de pigeons. Un tapis gris, roucoulant, qui vous sépare de l\'autre côté. Ils vous regardent. Ils savent que vous devez passer.',
    choices: [
      { text: 'Traverser lentement, en diplomate', risk: 'normal', emoji: '🕊️', outcomes: [
        { probability: 0.6, text: 'La mer grise s\'ouvre devant vos pas comme pour un prophète de quartier. Pas un envol, pas un froissement : les pigeons vous ont classé « des nôtres ». C\'est vexant et majestueux à la fois.', statChanges: { mental: 7 } },
        { probability: 0.4, text: 'Un enfant surgit en courant et fait décoller la place ENTIÈRE. Mille pigeons, un seul manteau : le vôtre. Les statistiques du bombardement sont contre vous.', statChanges: { dignity: -6, mental: -3 } },
      ]},
      { text: 'Chercher le pigeon bagué (un vieil ami ?)', risk: 'safe', emoji: '🧐', outcomes: [
        { probability: 0.5, text: 'Il est LÀ. Le pigeon voyageur, votre créancier ailé, au milieu de la plèbe. Il vous reconnaît, s\'approche, et dépose une pièce devant vous. Gérard a peut-être remboursé.', moneyChange: 1, statChanges: { mental: 8 } },
        { probability: 0.5, text: 'Mille pigeons identiques vous fixent. Chercher UN pigeon dans une place de pigeons restera l\'entreprise la plus vaine de votre semaine. Pourtant vous recommencerez.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-bache-envolee', title: 'La Bâche Fugitive', type: 'narrative',
    image: '/assets/travel-bache-envolee.webp',
    description: 'Une bâche de chantier s\'est arrachée dans le vent et remonte la rue en roulant comme un fantôme bleu de quatre mètres. Les passants s\'écartent. Elle vient vers vous.',
    choices: [
      { text: 'La capturer au vol', risk: 'risky', emoji: '🫴', outcomes: [
        { probability: 0.6, text: 'Vous la plaquez au sol après un corps-à-corps épique applaudi par la terrasse d\'en face. Une bâche de chantier neuve : toit, tapis, poncho. Le vent vient de vous livrer un studio.', statChanges: { mental: 8, sleep: 4 }, respectChange: 1, itemGain: { id: 'bache-chantier', name: 'Bâche de chantier (4m)', emoji: '🟦', type: 'armor', value: 8, defenseBonus: 1 } },
        { probability: 0.4, text: 'La bâche vous engloutit en plein élan. Vous traversez le carrefour en fantôme bleu titubant, guidé par les cris des passants. On vous libère hilare et décoiffé. La bâche repart vers d\'autres proies.', statChanges: { mental: -2, dignity: -5, health: -2 } },
      ]},
      { text: 'La laisser passer, saluer bas', risk: 'safe', emoji: '👋', outcomes: [
        { probability: 1, text: 'Elle roule majestueusement vers le boulevard, libre comme aucun de vous deux. Vous la saluez. Un autre l\'attrapera, ou pas. Certaines choses méritent de s\'échapper.', statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'travel-sosie', title: 'Le Sosie', type: 'narrative',
    image: '/assets/travel-sosie.webp',
    description: 'Sur le trottoir d\'en face marche un homme qui vous ressemble trait pour trait : même barbe, même manteau, même démarche de fatigue digne. Il vous a vu aussi. Vous ralentissez tous les deux.',
    choices: [
      { text: 'Aller lui parler', risk: 'normal', emoji: '🪞', outcomes: [
        { probability: 0.5, text: 'Dix minutes de comparaison ahurie : même prénom de père, même ville d\'avant, même banc préféré. Vous partagez un café en vous regardant comme un miroir qui aurait mal tourné. Ou bien tourné. Impossible à dire.', statChanges: { mental: 10, thirst: 6 } },
        { probability: 0.5, text: 'De près, la ressemblance s\'évapore : il est plus vieux, plus cabossé, plus seul. « Tu me ressembleras dans dix ans si tu lâches », dit-il en partant. Vous décidez sur-le-champ de ne pas lâcher.', statChanges: { mental: 6, dignity: 4 } },
      ]},
      { text: 'Presser le pas, troublé', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous filez sans vous retourner. Au coin de la rue, vous vous retournez quand même. Il a disparu. Le quartier a peut-être un stock limité de silhouettes, et la vôtre est en double.', statChanges: { mental: 4, sleep: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-photographe', title: 'Le Photographe de Rue', type: 'social',
    image: '/assets/travel-photographe.webp',
    description: 'Un photographe en gilet multipoche vous suit depuis deux rues, boîtier à l\'affût. Il finit par oser : « votre visage, c\'est la ville entière. Je peux ? »',
    choices: [
      { text: 'Poser, mais à votre prix', risk: 'normal', emoji: '📷', outcomes: [
        { probability: 0.6, text: 'Séance de dix minutes contre billet et tirage promis. Il vous montre l\'écran : un inconnu magnifique et creusé vous regarde. « C\'est moi, ça ? » « C\'est vous. » Vous encadreriez presque l\'inconnu.', moneyChange: 8, statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.4, text: 'Il « ne paie jamais ses sujets, par éthique ». Vous « ne posez jamais gratos, par économie ». Impasse déontologique. Il vous offre au moins le café du débat, et le débat était bon.', statChanges: { thirst: 6, mental: 5 } },
      ]},
      { text: 'Refuser : votre image vous appartient', risk: 'safe', emoji: '🙅', outcomes: [
        { probability: 1, text: '« Respect », dit-il en baissant son boîtier, et il vous serre la main. Être maître de quelque chose, ne serait-ce que de son visage, c\'est déjà un patrimoine.', statChanges: { dignity: 8, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'travel-feu-artifice', title: 'Le Feu d\'Artifice Privé', type: 'narrative',
    image: '/assets/travel-feu-artifice.webp',
    description: 'Derrière les toits, un feu d\'artifice éclate sans prévenir : un mariage, un anniversaire, une victoire quelconque. Le ciel du quartier s\'offre un luxe qui retombe sur tout le monde.',
    choices: [
      { text: 'Trouver le meilleur point de vue', risk: 'safe', emoji: '🎆', outcomes: [
        { probability: 0.7, text: 'Le muret du parking offre une loge royale. Dix minutes de bouquets dorés au-dessus des antennes. Les riches paient le spectacle, le ciel le distribue gratuitement. La redistribution existe, elle est pyrotechnique.', statChanges: { mental: 12 } },
        { probability: 0.3, text: 'D\'autres spectateurs de fortune vous rejoignent sur le muret : deux étudiants, un veilleur de nuit, un chien. Le bouquet final arrache un « waouh » collectif. Vous applaudissez des inconnus qui fêtent on ne sait quoi. C\'était très bien.', statChanges: { mental: 10 } },
      ]},
      { text: 'Suivre les retombées de fusées', risk: 'normal', emoji: '🧨', outcomes: [
        { probability: 0.5, text: 'Les carcasses de fusées retombées sentent la poudre et se revendent aux gamins du quartier comme trophées. Le lendemain d\'un feu d\'artifice a son marché secondaire.', moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.5, text: 'Une fusée non éclatée gît dans le caniveau. Vous la laissez SAGEMENT où elle est et prévenez le veilleur de nuit. Certains trésors sont des pièges. Il vous paie le renseignement.', moneyChange: 2, statChanges: { mental: 3 }, respectChange: 1 },
      ]},
    ],
  },
  {
    id: 'travel-arroseuse', title: 'L\'Arroseuse Municipale', type: 'narrative',
    image: '/assets/travel-arroseuse.webp',
    description: 'Au bout de la rue, l\'arroseuse municipale remonte lentement le caniveau, ses jets balayant tout le trottoir. Le conducteur porte des lunettes de soleil. Il ne ralentira pas.',
    choices: [
      { text: 'Calculer le passage entre deux jets', risk: 'risky', emoji: '🌊', outcomes: [
        { probability: 0.5, text: 'Vous passez dans la fenêtre de tir exacte, sec au millimètre, sous le regard du conducteur qui lève un pouce approbateur. Les professionnels se reconnaissent entre eux.', statChanges: { mental: 7 }, respectChange: 1 },
        { probability: 0.5, text: 'Le jet pivote au dernier moment. Douché intégral, des chaussettes au bonnet, devant la terrasse du café. Le conducteur articule un « pardon » que ses lunettes de soleil rendent peu crédible.', statChanges: { health: -3, dignity: -6, mental: -3 } },
      ]},
      { text: 'Profiter du trottoir rincé derrière elle', risk: 'safe', emoji: '✨', outcomes: [
        { probability: 1, text: 'Vous marchez dans son sillage, sur un trottoir neuf, luisant, désinfecté. La ville sent le propre pendant dix minutes. Vous êtes le premier à étrenner la rue lavée : un privilège de personne, donc le vôtre.', statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'travel-gants-grille', title: 'Les Gants sur les Grilles', type: 'discovery',
    image: '/assets/travel-gants-grille.webp',
    description: 'Tout le long de la grille du square, des gants perdus ont été empalés sur les piques par des passants : une exposition involontaire de mains vides qui saluent.',
    choices: [
      { text: 'Chercher deux gants assortis', risk: 'normal', emoji: '🧤', outcomes: [
        { probability: 0.5, text: 'Miracle statistique : deux gants de laine, taille proche, couleurs cousines. Une paire recomposée, comme les familles. Vos mains passeront l\'hiver.', statChanges: { mental: 6, health: 3 }, itemGain: { id: 'gants-depareilles', name: 'Paire de gants recomposée', emoji: '🧤', type: 'armor', value: 4, defenseBonus: 1 } },
        { probability: 0.5, text: 'Que des gants gauches. TOUS. Onze gants gauches sur une grille. Il existe quelque part un peuple de droitiers manchots dont vous ne saurez jamais rien. Vous en prenez un, pour la main qui souffre le plus.', statChanges: { mental: 4 } },
      ]},
      { text: 'Ajouter votre vieux gant troué à l\'expo', risk: 'safe', emoji: '🎨', outcomes: [
        { probability: 1, text: 'Vous empalez cérémonieusement votre gant troué entre deux moufles d\'enfant. Le voilà exposé, salué par les passants, plus utile en art qu\'en laine. Vous êtes officiellement un artiste du quartier.', statChanges: { mental: 7, dignity: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-jardin-prive', title: 'Le Jardin Traversant', type: 'narrative',
    image: '/assets/travel-jardin-prive.webp',
    description: 'La résidence bourgeoise a un jardin traversant dont les deux portillons ferment mal, tout le monde le sait. Allées ratissées, massifs taillés, silence de coton. Interdit, évidemment.',
    choices: [
      { text: 'Traverser en propriétaire', risk: 'risky', emoji: '🎩', outcomes: [
        { probability: 0.6, text: 'Menton haut, mains dans le dos, pas de notaire en promenade. Vous traversez les massifs comme un actionnaire inspecte ses rosiers. Une résidente vous salue d\'un « bonjour » automatique. Le standing est un déguisement gratuit.', statChanges: { mental: 8, dignity: 6 } },
        { probability: 0.4, text: 'Le gardien de la résidence surgit derrière un hortensia. Vous improvisez : « je visite pour un ami. » « Un ami qui s\'appelle ? » « ... Gérard. » Il y a TOUJOURS un Gérard. Ça passe. De justesse, mais ça passe.', statChanges: { mental: 3, dignity: -2 } },
      ]},
      { text: 'Faire une pause sur le banc du fond', risk: 'normal', emoji: '🪑', outcomes: [
        { probability: 0.6, text: 'Dix minutes assis dans un jardin de riches, entre deux massifs qui sentent le budget. Un merle vient vous inspecter, valide, et repart. Vous repartez aussi, reposé et vaguement anobli.', statChanges: { mental: 8, sleep: 4 } },
        { probability: 0.4, text: 'Une résidente en peignoir vous repère depuis son balcon et... vous descend un café : « vous avez meilleure mine que mon gendre. » Vous buvez un café de balcon dans un jardin interdit. La vie a de ces trajectoires.', statChanges: { thirst: 8, mental: 8 } },
      ]},
    ],
  },
];
