// ============================================================================
// DONNÉES D'ÉVÉNEMENTS & GÉNÉRATEURS
// ----------------------------------------------------------------------------
// Les grandes listes d'événements (Explorer / Mendier / Voler / Dormir /
// Voyager / suites narratives) et les générateurs qui les tirent. Extrait du
// monolithe GameContext ; ré-exporté par celui-ci pour les composants.
// ============================================================================
import type { GameEvent, Character, StealTarget, LegendTemplate } from '../types';
import { randomFromArray, L } from './util';
import { tc } from '@/lib/lang';
import { loadGraves, type Grave } from '@/lib/necrology';
import { EXPLORE_EVENTS_2 } from './events2-explore';
import { REST_EVENTS_2 } from './events2-rest';
import { BEG_EVENTS_2 } from './events2-beg';


// ============ EXPLORE EVENTS (30) ============
export const EXPLORE_EVENTS: GameEvent[] = [
  {
    id: 'exp-jardinier', title: 'Le Jardinier Clandestin', type: 'social',
    image: '/assets/exp-jardinier-CR6HfMPJyNzdVNNx5SD2YN.webp',
    description: 'Un vieil homme cultive des légumes en cachette dans un coin du parc. Il vous repère.',
    choices: [
      { text: 'Proposer votre aide', risk: 'safe', emoji: '🌱', outcomes: [
        { probability: 0.7, text: 'Il accepte ! Vous passez une heure à jardiner. Il vous donne une tomate. "Reviens demain, petit."', statChanges: { hunger: 10, mental: 8, dignity: 5 }, addFlag: 'ami-jardinier' },
        { probability: 0.3, text: 'Il vous regarde avec méfiance. "Dégage, c\'est mon coin." Ambiance.', statChanges: { mental: -3 } },
      ]},
      { text: 'Voler quelques légumes discrètement', risk: 'risky', emoji: '🥕', outcomes: [
        { probability: 0.4, text: 'Vous chopez 3 carottes et une courgette. Festin !', statChanges: { hunger: 20, dignity: -10 } },
        { probability: 0.6, text: 'Il vous attrape la main. "Voleur !" Il alerte tout le parc.', statChanges: { dignity: -20, mental: -5 }, respectChange: -3 },
      ]},
      { text: 'Observer de loin et noter l\'emplacement', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 1, text: 'Vous mémorisez l\'endroit. Ça pourrait servir plus tard.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-enfant-perdu', title: 'L\'Enfant Perdu', type: 'social',
    image: '/assets/exp-enfant-perdu-A9tLX2MXC6uiVEZLziz2AV.webp',
    description: 'Un gamin de 6 ans pleure sur un banc. Il a perdu sa maman dans le parc.',
    choices: [
      { text: 'L\'aider à retrouver sa mère', risk: 'safe', emoji: '👩‍👦', outcomes: [
        { probability: 0.7, text: 'Vous retrouvez la mère en 10 minutes. Elle vous remercie avec 5€ et un sandwich. "Merci infiniment !"', moneyChange: 5, statChanges: { hunger: 15, dignity: 10, mental: 10 }, respectChange: 3, addFlag: 'hero-enfant' },
        { probability: 0.3, text: 'La mère arrive en courant. Elle vous regarde avec suspicion et emmène l\'enfant sans un mot.', statChanges: { dignity: -5, mental: -5 } },
      ]},
      { text: 'Appeler la police', risk: 'safe', emoji: '📞', outcomes: [
        { probability: 0.8, text: 'La police arrive et retrouve la mère. Un agent vous remercie discrètement.', statChanges: { dignity: 5, mental: 5 }, respectChange: 1 },
        { probability: 0.2, text: 'La police vous interroge longuement. Vous êtes suspect numéro 1.', statChanges: { dignity: -10, mental: -8 } },
      ]},
      { text: 'Passer votre chemin', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous partez. Le gamin pleure de plus belle. Votre conscience aussi.', statChanges: { mental: -8 } },
      ]},
    ],
  },
  {
    id: 'exp-skateur', title: 'Le Skateur Cascadeur', type: 'narrative',
    image: '/assets/exp-skateur-BRXHRUvw2hTywwb7KYwfjU.webp',
    description: 'Un ado fait des figures de skate devant vous. Il rate un trick et son skate roule vers vous.',
    choices: [
      { text: 'Lui renvoyer le skate avec style', risk: 'normal', emoji: '🛹', outcomes: [
        { probability: 0.5, text: 'Vous renvoyez le skate d\'un coup de pied parfait. "Trop stylé le vieux !" Il vous file 3€.', moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.5, text: 'Le skate vous échappe et finit dans une flaque. L\'ado vous fusille du regard.', statChanges: { dignity: -5 } },
      ]},
      { text: 'Garder le skate', risk: 'risky', emoji: '😏', outcomes: [
        { probability: 0.3, text: 'L\'ado part en pleurant. Vous avez un skate. Et des remords.', statChanges: { dignity: -15, mental: -5 }, itemGain: { id: 'skate', name: 'Skateboard volé', emoji: '🛹', type: 'tool', value: 15 } },
        { probability: 0.7, text: 'Ses potes arrivent. Vous rendez le skate très vite.', statChanges: { dignity: -10, health: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-mariage', title: 'Le Mariage en Plein Air', type: 'social',
    image: '/assets/exp-mariage-YCDbQUMdsv52wEtgeLS3bm.webp',
    description: 'Un mariage se déroule dans le parc. Buffet, musique, gens bien habillés. Vous bavez.',
    choices: [
      { text: 'Se faufiler discrètement au buffet', risk: 'risky', emoji: '🍰', outcomes: [
        { probability: 0.4, text: 'Personne ne vous remarque ! Vous mangez comme un roi. Saumon, fromage, petits fours...', statChanges: { hunger: 30, thirst: 15, mental: 10 } },
        { probability: 0.6, text: 'Le photographe vous repère. "C\'est qui celui-là ?" Expulsé manu militari.', statChanges: { dignity: -15, mental: -5 } },
      ]},
      { text: 'Applaudir de loin les mariés', risk: 'safe', emoji: '👏', outcomes: [
        { probability: 0.8, text: 'Les mariés vous voient et vous envoient une part de gâteau ! L\'amour rend généreux.', statChanges: { hunger: 15, mental: 8, dignity: 5 } },
        { probability: 0.2, text: 'Personne ne vous remarque. Vous regardez les gens heureux. Nostalgie.', statChanges: { mental: -5 } },
      ]},
      { text: 'Se mêler aux invités avec assurance', risk: 'normal', emoji: '🥂', requirements: { stat: 'dignity', minValue: 55 }, outcomes: [
        { probability: 0.8, text: 'Personne ne doute de vous : champagne, petits fours, et vous portez même un toast aux mariés !', statChanges: { hunger: 25, thirst: 20, mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'La grand-mère de la mariée vous démasque… mais vous trouve charmant. Elle vous remplit une assiette en douce.', statChanges: { hunger: 15, mental: 8 } },
      ]},
    ],
  },
  {
    id: 'exp-artiste-rue', title: 'L\'Artiste de Rue', type: 'social',
    image: '/assets/exp-artiste-rue-8igrUxzSFhRMd2FECQMv7h.webp',
    description: 'Un artiste peint votre portrait à la craie sur le trottoir sans vous demander.',
    choices: [
      { text: 'Poser fièrement', risk: 'safe', emoji: '🎨', outcomes: [
        { probability: 0.8, text: 'Le portrait est magnifique ! Les passants s\'arrêtent. Vous récoltez 4€ en pourboires.', moneyChange: 4, statChanges: { dignity: 10, mental: 8 }, respectChange: 2 },
        { probability: 0.2, text: 'Le portrait est... abstrait. Très abstrait. Vous ne vous reconnaissez pas.', statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Demander une commission', risk: 'normal', emoji: '💰', outcomes: [
        { probability: 0.5, text: 'L\'artiste partage : 3€ pour vous. Collaboration fructueuse !', moneyChange: 3, statChanges: { dignity: 5 } },
        { probability: 0.5, text: '"C\'est de l\'art, pas du commerce !" Il efface votre portrait, vexé.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-chantier', title: 'Le Chantier Abandonné', type: 'discovery',
    image: '/assets/exp-chantier-6FzS2TzBL94xF7YBmdTXUz.webp',
    description: 'Un chantier abandonné. Des matériaux traînent partout. Mais des bruits suspects viennent du fond.',
    choices: [
      { text: 'Explorer prudemment', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.5, text: 'Vous trouvez une bâche imperméable et des planches. Matériaux de construction !', statChanges: { mental: 5 }, itemGain: { id: 'bache', name: 'Bâche imperméable', emoji: '🏗️', type: 'tool', value: 8 } },
        { probability: 0.3, text: 'Un chien errant surgit ! Il grogne...', statChanges: { mental: -5 } },
        { probability: 0.2, text: 'Vous marchez sur un clou rouillé. Aïe !', statChanges: { health: -10, mental: -3 } },
      ]},
      { text: 'Récupérer du métal à revendre', risk: 'risky', emoji: '🔩', outcomes: [
        { probability: 0.4, text: 'Du cuivre ! Le ferrailleur vous en donne 8€.', moneyChange: 8, statChanges: { dignity: -5 } },
        { probability: 0.6, text: 'Le gardien de nuit vous surprend. Course-poursuite !', statChanges: { health: -5, dignity: -10, sleep: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-marche-puces', title: 'Le Marché aux Puces', type: 'discovery',
    image: '/assets/exp-marche-puces-HsE9Jibo2Ryfm6oCMCsSB6.webp',
    description: 'Le marché aux puces du dimanche. Des trésors cachés parmi les déchets.',
    choices: [
      { text: 'Fouiller les invendus en fin de marché', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Un vendeur vous donne un manteau usé mais chaud. "Tiens, il me sert plus."', statChanges: { dignity: 5, health: 3 }, itemGain: { id: 'manteau', name: 'Manteau usé', emoji: '🧥', type: 'armor', value: 10, defenseBonus: 2 } },
        { probability: 0.4, text: 'Rien d\'intéressant aujourd\'hui. Que des vieilles chaussettes dépareillées.', statChanges: { mental: -2 } },
      ]},
      { text: 'Proposer vos services de porteur', risk: 'normal', emoji: '💪', outcomes: [
        { probability: 0.6, text: 'Un antiquaire vous embauche pour 2h. 6€ et un sandwich.', moneyChange: 6, statChanges: { hunger: 15, sleep: -5, dignity: 5 } },
        { probability: 0.4, text: '"On n\'a pas besoin de toi." Refus général. Dur.', statChanges: { dignity: -5, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-graffiti', title: 'Le Mur de Graffitis', type: 'narrative',
    image: '/assets/exp-graffiti-cRcu5Bo3BmUZPkaiCwvrUp.webp',
    description: 'Un mur couvert de graffitis colorés. Un tagueur est en pleine action.',
    choices: [
      { text: 'Faire le guet pour lui', risk: 'normal', emoji: '👁️', outcomes: [
        { probability: 0.6, text: 'Mission accomplie ! Il vous file 4€ et une bombe de peinture. "T\'es réglo."', moneyChange: 4, statChanges: { mental: 5 }, respectChange: 2 },
        { probability: 0.4, text: 'La police arrive ! Vous courez ensemble. Adrénaline pure.', statChanges: { sleep: -5, mental: 3, dignity: -5 } },
      ]},
      { text: 'Demander à essayer', risk: 'safe', emoji: '🎨', outcomes: [
        { probability: 0.7, text: 'Vous dessinez un chat. C\'est moche mais cathartique. "Pas mal pour un débutant !"', statChanges: { mental: 10, dignity: 3 } },
        { probability: 0.3, text: 'La bombe vous explose au visage. Vous êtes bleu pendant 3 jours.', statChanges: { dignity: -8, health: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-bibliotheque', title: 'La Bibliothèque Municipale', type: 'narrative',
    image: '/assets/exp-bibliotheque-2De3rMKZBHpbKjGy3dHVbf.webp',
    description: 'La bibliothèque est ouverte. Chaleur, silence, et des toilettes gratuites.',
    choices: [
      { text: 'Lire tranquillement au chaud', risk: 'safe', emoji: '📖', outcomes: [
        { probability: 0.8, text: 'Deux heures de lecture et de chaleur. Vous vous sentez presque normal.', statChanges: { mental: 15, sleep: 5, dignity: 3 } },
        { probability: 0.2, text: 'Vous vous endormez et ronflez. Le bibliothécaire vous réveille. Gênant.', statChanges: { sleep: 10, dignity: -5 } },
      ]},
      { text: 'Utiliser les toilettes et se laver', risk: 'safe', emoji: '🚿', outcomes: [
        { probability: 1, text: 'Toilette rapide au lavabo. Vous vous sentez humain à nouveau.', statChanges: { dignity: 10, mental: 5, thirst: 5 } },
      ]},
      { text: 'Chercher des livres à revendre', risk: 'risky', emoji: '📚', outcomes: [
        { probability: 0.3, text: 'Vous trouvez un livre rare oublié. Le bouquiniste vous en donne 5€.', moneyChange: 5 },
        { probability: 0.7, text: 'La bibliothécaire vous surveille. Impossible de rien prendre.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-concert', title: 'Le Concert Improvisé', type: 'social',
    image: '/assets/exp-concert-ju77ceA9zWrNxQaKrRPUVF.webp',
    description: 'Des musiciens de rue jouent du jazz. La foule s\'amasse. L\'ambiance est magique.',
    choices: [
      { text: 'Danser comme si personne ne regardait', risk: 'normal', emoji: '💃', outcomes: [
        { probability: 0.6, text: 'Votre danse attire les rires et les applaudissements ! On vous jette 3€.', moneyChange: 3, statChanges: { mental: 12, dignity: 5 }, respectChange: 2 },
        { probability: 0.4, text: 'Vous trébuchez. Les gens rient, mais pas avec vous.', statChanges: { dignity: -8, mental: -3 } },
      ]},
      { text: 'Écouter tranquillement', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 1, text: 'La musique vous transporte. Pendant 20 minutes, vous oubliez tout.', statChanges: { mental: 10 } },
      ]},
    ],
  },
  {
    id: 'exp-metro', title: 'La Station de Métro', type: 'discovery',
    image: '/assets/exp-metro-oXzk6PRiafCRXLVLnLSSVq.webp',
    description: 'Vous descendez dans la station de métro. Il fait chaud, mais c\'est le territoire d\'autres SDF.',
    choices: [
      { text: 'Explorer les couloirs', risk: 'normal', emoji: '🚇', outcomes: [
        { probability: 0.4, text: 'Vous trouvez un billet de 10€ par terre ! Jour de chance !', moneyChange: 10, statChanges: { mental: 8 } },
        { probability: 0.3, text: 'Un autre SDF vous interpelle. "C\'est mon couloir !" Tension.', statChanges: { mental: -5, dignity: -3 } },
        { probability: 0.3, text: 'Un rat géant vous barre le passage...', statChanges: { mental: -8 } },
      ]},
      { text: 'Rester près des tourniquets et mendier', risk: 'safe', emoji: '🎩', outcomes: [
        { probability: 0.6, text: 'Les voyageurs pressés lâchent quelques pièces. 2€ en 30 minutes.', moneyChange: 2, statChanges: { dignity: -3 } },
        { probability: 0.4, text: 'Un agent vous demande de partir. Pas de mendicité ici.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-eglise', title: 'L\'Église du Quartier', type: 'narrative',
    image: '/assets/exp-eglise-2mK4FcdNW7pYwWeFopWXmF.webp',
    description: 'L\'église est ouverte. Un prêtre balaie l\'entrée.',
    choices: [
      { text: 'Entrer et s\'asseoir au calme', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'Le prêtre vous offre un café et un croissant. "La maison de Dieu est ouverte à tous."', statChanges: { hunger: 10, thirst: 10, mental: 10, dignity: 5 } },
        { probability: 0.3, text: 'Moment de paix intérieure. Le silence fait du bien.', statChanges: { mental: 8, sleep: 5 } },
      ]},
      { text: 'Demander de l\'aide au prêtre', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.6, text: 'Il vous donne l\'adresse d\'un foyer et un bon repas. Humanité.', statChanges: { hunger: 15, mental: 10, dignity: 8 }, addFlag: 'aide-eglise' },
        { probability: 0.4, text: '"Je n\'ai pas grand-chose, mais prenez ça." 2€ et une bénédiction.', moneyChange: 2, statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-bagarre-chats', title: 'La Bagarre de Chats', type: 'narrative',
    image: '/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp',
    description: 'Deux chats se battent férocement dans une ruelle. Les miaulements sont terrifiants.',
    choices: [
      { text: 'Les séparer bravement', risk: 'risky', emoji: '🐱', outcomes: [
        { probability: 0.3, text: 'Vous les séparez ! Un des chats vous adopte. Compagnon de route !', statChanges: { mental: 10, health: -3 }, respectChange: 1, addFlag: 'chat-compagnon' },
        { probability: 0.7, text: 'Les deux chats se retournent contre vous. Griffures partout !', statChanges: { health: -8, dignity: -5 } },
      ]},
      { text: 'Parier sur le vainqueur', risk: 'safe', emoji: '🎰', outcomes: [
        { probability: 0.5, text: 'Le chat tigré gagne ! Vous n\'avez rien parié mais vous êtes content.', statChanges: { mental: 3 } },
        { probability: 0.5, text: 'Match nul. Les deux partent en boitant. Spectacle décevant.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'exp-fontaine-parc', title: 'La Fontaine aux Pièces', type: 'discovery',
    image: '/assets/exp-fontaine-parc-BiqrfcY6htgsTAbKRTaDWN.webp',
    description: 'La fontaine du parc brille de pièces jetées par les touristes. Des voeux et de l\'argent.',
    choices: [
      { text: 'Plonger la main pour récupérer des pièces', risk: 'risky', emoji: '💰', outcomes: [
        { probability: 0.4, text: 'Vous récupérez 4€ en petite monnaie. Jackpot aquatique !', moneyChange: 4, statChanges: { dignity: -10, thirst: 5 } },
        { probability: 0.3, text: 'Un gardien vous attrape. "C\'est interdit !" Amende morale.', statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.3, text: 'Vous glissez et tombez dans la fontaine. Trempé mais riche de 2€.', moneyChange: 2, statChanges: { health: -5, dignity: -12, thirst: 10 } },
      ]},
      { text: 'Faire un voeu avec votre dernière pièce', risk: 'safe', emoji: '⭐', outcomes: [
        { probability: 0.5, text: 'Vous jetez 1 centime. Vous vous sentez étrangement optimiste.', moneyChange: 0, statChanges: { mental: 8 } },
        { probability: 0.5, text: 'La pièce rebondit et touche un pigeon. Mauvais karma.', statChanges: { mental: -2 } },
      ]},
      { text: 'Se laver le visage dans l\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 1, text: 'L\'eau est fraîche. Vous vous sentez revigoré.', statChanges: { dignity: 5, thirst: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-velo-casse', title: 'Le Vélo Abandonné', type: 'discovery',
    image: '/assets/exp-velo-casse-bdxwNqE2XebzwjmU9nEovY.webp',
    description: 'Un vélo cassé est attaché à un poteau. La roue avant est voilée, mais le reste semble OK.',
    choices: [
      { text: 'Tenter de le réparer', risk: 'normal', emoji: '🔧', outcomes: [
        { probability: 0.4, text: 'Avec du fil de fer et de la patience, ça roule ! Moyen de transport acquis.', statChanges: { mental: 8, dignity: 3 }, addFlag: 'a-velo', itemGain: { id: 'velo-repare', name: 'Vélo rafistolé', emoji: '🚲', type: 'tool', value: 20 } },
        { probability: 0.6, text: 'Impossible sans outils. Vous récupérez la sonnette au moins.', statChanges: { mental: -2 }, itemGain: { id: 'sonnette', name: 'Sonnette de vélo', emoji: '🔔', type: 'junk', value: 1 } },
      ]},
      { text: 'Récupérer les pièces détachées', risk: 'safe', emoji: '⚙️', outcomes: [
        { probability: 0.7, text: 'Vous démontez la chaîne et les pédales. Le ferrailleur en donnera 3€.', moneyChange: 3, statChanges: { dignity: -3 } },
        { probability: 0.3, text: 'Le propriétaire revient ! "Hé, c\'est mon vélo !" Vous filez.', statChanges: { dignity: -8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-pharmacie', title: 'La Pharmacie de Garde', type: 'social',
    image: '/assets/exp-pharmacie-SW5iVopihwHZPnwrHk4DRV.webp',
    description: 'La pharmacie est ouverte. La pharmacienne vous regarde avec un mélange de pitié et de méfiance.',
    choices: [
      { text: 'Demander poliment des pansements', risk: 'safe', emoji: '🩹', outcomes: [
        { probability: 0.7, text: 'Elle vous donne un kit de premiers soins périmé. "C\'est encore bon, hein."', statChanges: { health: 10, dignity: 3 }, itemGain: { id: 'kit-soin', name: 'Kit premiers soins', emoji: '🏥', type: 'tool', value: 8, effect: { health: 20 } } },
        { probability: 0.3, text: '"Désolée, je ne peux pas." Elle baisse les yeux. Vous aussi.', statChanges: { mental: -5 } },
      ]},
      { text: 'Proposer de balayer devant la boutique', risk: 'safe', emoji: '🧹', outcomes: [
        { probability: 0.8, text: 'Elle accepte ! 3€ et un tube de crème solaire. Honnête travail.', moneyChange: 3, statChanges: { dignity: 8, mental: 5 } },
        { probability: 0.2, text: '"Non merci, j\'ai un employé." Refus poli.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-terrain-vague', title: 'Le Terrain Vague', type: 'discovery',
    image: '/assets/exp-terrain-vague-cuw8m9fnHsQZS3zjSQE96n.webp',
    description: 'Un terrain vague entre deux immeubles. Des herbes folles, des déchets, et... des bruits.',
    choices: [
      { text: 'Explorer les décombres', risk: 'risky', emoji: '🏚️', outcomes: [
        { probability: 0.3, text: 'Vous trouvez une vieille radio qui marche encore ! Compagnie nocturne.', statChanges: { mental: 8 }, itemGain: { id: 'radio', name: 'Radio portable', emoji: '📻', type: 'tool', value: 5 } },
        { probability: 0.4, text: 'Un raton laveur surgit des buissons ! Il est pas content.', statChanges: { mental: -5, health: -3 } },
        { probability: 0.3, text: 'Vous marchez sur du verre brisé. Vos chaussures ne protègent plus grand-chose.', statChanges: { health: -8 } },
      ]},
      { text: 'Chercher des matériaux utiles', risk: 'normal', emoji: '🔩', outcomes: [
        { probability: 0.5, text: 'Du carton sec, une couverture oubliée. De quoi améliorer votre abri.', statChanges: { mental: 5 }, itemGain: { id: 'couverture', name: 'Couverture trouvée', emoji: '🛏️', type: 'armor', value: 6, defenseBonus: 1 } },
        { probability: 0.5, text: 'Rien d\'utile. Juste des canettes vides et de la tristesse.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-animalerie', title: 'L\'Animalerie du Coin', type: 'social',
    image: '/assets/exp-animalerie-f88YtDyyP69PRN9fqoBdd2.webp',
    description: 'L\'animalerie a mis des chiots en vitrine. Vous vous arrêtez, hypnotisé.',
    choices: [
      { text: 'Regarder les chiots et sourire', risk: 'safe', emoji: '🐶', outcomes: [
        { probability: 0.8, text: 'Un chiot vous lèche la vitre. Moment de bonheur pur. Des passants sourient aussi.', statChanges: { mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'Le vendeur sort et vous chasse. "Tu fais fuir les clients !"', statChanges: { dignity: -8, mental: -5 } },
      ]},
      { text: 'Proposer de promener les chiens', risk: 'normal', emoji: '🦮', outcomes: [
        { probability: 0.5, text: 'Le gérant accepte ! 2h de balade avec un labrador. 5€ et du bonheur.', moneyChange: 5, statChanges: { mental: 15, dignity: 5, sleep: -3 } },
        { probability: 0.5, text: '"On n\'a pas besoin d\'aide." Refus. Les chiots vous regardent tristement.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-cimetiere', title: 'Le Cimetière Paisible', type: 'narrative',
    image: '/assets/exp-cimetiere-VKuW5e5DjqSmF5TNCdnKkA.webp',
    description: 'Le cimetière est calme. Des fleurs fraîches sur certaines tombes. Un robinet coule.',
    choices: [
      { text: 'Se recueillir et réfléchir', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 1, text: 'Moment de méditation. La perspective de la mort remet les choses en place.', statChanges: { mental: 8, dignity: 5 } },
      ]},
      { text: 'Boire au robinet et se laver', risk: 'safe', emoji: '🚰', outcomes: [
        { probability: 1, text: 'Eau potable gratuite ! Vous buvez et vous débarbouiller. Luxe.', statChanges: { thirst: 20, dignity: 8 } },
      ]},
      { text: 'Récupérer les fleurs fanées pour les revendre', risk: 'risky', emoji: '💐', outcomes: [
        { probability: 0.3, text: 'Vous recomposez des bouquets. Un fleuriste vous en donne 4€.', moneyChange: 4, statChanges: { dignity: -8 } },
        { probability: 0.7, text: 'Une vieille dame vous surprend. "Vous n\'avez pas honte ?!" Regard glacial.', statChanges: { dignity: -15, mental: -8 } },
      ]},
    ],
  },
  {
    id: 'exp-aire-jeux', title: 'L\'Aire de Jeux Déserte', type: 'narrative',
    image: '/assets/exp-aire-jeux-Q8McpHycnXNkdRnaXA3fDZ.webp',
    description: 'L\'aire de jeux est vide. Les balançoires grincent dans le vent. Nostalgie.',
    choices: [
      { text: 'Faire de la balançoire', risk: 'safe', emoji: '🎠', outcomes: [
        { probability: 0.8, text: 'Le vent dans les cheveux, les pieds en l\'air. Vous redevenez enfant 5 minutes.', statChanges: { mental: 12, dignity: -2 } },
        { probability: 0.2, text: 'La chaîne casse. Vous atterrissez dans le sable. Aïe.', statChanges: { health: -5, mental: -3 } },
      ]},
      { text: 'Dormir dans le toboggan', risk: 'normal', emoji: '😴', outcomes: [
        { probability: 0.6, text: 'Le toboggan est étonnamment confortable. Sieste express.', statChanges: { sleep: 12 } },
        { probability: 0.4, text: 'Des enfants arrivent avec leurs parents. Regard accusateur. Vous partez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-brocante', title: 'La Brocante du Quartier', type: 'discovery',
    image: '/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp',
    description: 'Une brocante de quartier. Des objets hétéroclites s\'entassent sur les tables.',
    choices: [
      { text: 'Négocier un objet utile', risk: 'normal', emoji: '🤝', outcomes: [
        { probability: 0.5, text: 'Vous troquez votre charme contre un thermos. Le vendeur est amusé.', statChanges: { dignity: 3 }, itemGain: { id: 'thermos', name: 'Thermos cabossé', emoji: '☕', type: 'tool', value: 5 } },
        { probability: 0.5, text: '"T\'as pas d\'argent, t\'as pas d\'objet." Logique implacable.', statChanges: { mental: -3 } },
      ]},
      { text: 'Aider à ranger en fin de journée', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Le brocanteur vous paie 4€ et vous laisse garder un vieux chapeau.', moneyChange: 4, statChanges: { dignity: 5, mental: 5 }, itemGain: { id: 'chapeau', name: 'Chapeau de brocante', emoji: '🎩', type: 'junk', value: 3 }, addFlag: 'ami-brocanteur' },
        { probability: 0.3, text: 'Il vous remercie mais n\'a rien à donner. "La prochaine fois !"', statChanges: { mental: 3, dignity: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-toit-vue', title: 'Le Toit avec Vue', type: 'discovery',
    image: '/assets/exp-toit-vue-TJnJZcBsariLEwBL2R7huu.webp',
    description: 'Vous trouvez l\'accès à un toit d\'immeuble. La vue sur la ville est époustouflante.',
    choices: [
      { text: 'Contempler la vue et méditer', risk: 'safe', emoji: '🌅', outcomes: [
        { probability: 1, text: 'La ville s\'étend sous vos pieds. Vous êtes le roi du monde. Du carton, certes, mais du monde.', statChanges: { mental: 15, dignity: 5 } },
      ]},
      { text: 'Installer un campement sur le toit', risk: 'normal', emoji: '⛺', outcomes: [
        { probability: 0.5, text: 'Spot parfait ! À l\'abri du vent, vue panoramique. Votre palace.', statChanges: { sleep: 15, mental: 10 }, addFlag: 'camp-toit' },
        { probability: 0.5, text: 'Le concierge vous repère. "Descendez immédiatement !" Fin du rêve.', statChanges: { dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-salon-coiffure', title: 'Le Salon de Coiffure', type: 'social',
    image: '/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp',
    description: 'Un salon de coiffure cherche un modèle pour ses apprentis. Gratuit.',
    choices: [
      { text: 'Se porter volontaire', risk: 'normal', emoji: '💇', outcomes: [
        { probability: 0.6, text: 'Coupe gratuite ! Vous êtes méconnaissable. En bien. Les passants vous regardent différemment.', statChanges: { dignity: 20, mental: 10 } },
        { probability: 0.4, text: 'L\'apprenti est nerveux. Résultat... créatif. Mais c\'est propre au moins.', statChanges: { dignity: 5, mental: 3 } },
      ]},
      { text: 'Demander juste à utiliser les toilettes', risk: 'safe', emoji: '🚻', outcomes: [
        { probability: 0.7, text: 'Ils acceptent. Toilette rapide, eau chaude. Le luxe.', statChanges: { dignity: 8, thirst: 5 } },
        { probability: 0.3, text: '"Réservé aux clients." Porte fermée.', statChanges: { dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-fete-foraine', title: 'La Fête Foraine', type: 'narrative',
    image: '/assets/exp-fete-foraine-oFFfjEfH7yPSChUUtdKfFj.webp',
    description: 'La fête foraine est installée ! Lumières, odeurs de barbe à papa, musique criarde.',
    choices: [
      { text: 'Chercher des pièces tombées par terre', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Bingo ! 3€ en monnaie trouvés sous les manèges.', moneyChange: 3, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Juste des tickets usagés et un chewing-gum collé.', statChanges: { mental: -2 } },
      ]},
      { text: 'Proposer vos services aux forains', risk: 'normal', emoji: '🎪', outcomes: [
        { probability: 0.5, text: 'Un forain vous embauche pour la soirée ! 8€, une barbe à papa, et des souvenirs.', moneyChange: 8, statChanges: { hunger: 10, mental: 10, sleep: -8, dignity: 5 } },
        { probability: 0.5, text: '"On est complet." Mais il vous offre une pomme d\'amour par pitié.', statChanges: { hunger: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-pecheur-canal', title: 'Le Pêcheur du Canal', type: 'social',
    image: '/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp',
    description: 'Un vieux pêcheur est assis au bord du canal. Il a l\'air de s\'ennuyer ferme.',
    choices: [
      { text: 'Lui tenir compagnie', risk: 'safe', emoji: '🎣', outcomes: [
        { probability: 0.7, text: 'Il vous raconte sa vie. Vous aussi. Il partage son sandwich et sa bière. Belle rencontre.', statChanges: { hunger: 12, thirst: 10, mental: 10 }, respectChange: 2, addFlag: 'ami-pecheur' },
        { probability: 0.3, text: '"Chut ! Tu fais fuir les poissons !" Silence radio.', statChanges: { mental: -2 } },
      ]},
      { text: 'Demander s\'il a attrapé quelque chose', risk: 'safe', emoji: '🐟', outcomes: [
        { probability: 0.5, text: '"Rien du tout ! Mais tiens, prends ça." Il vous donne un poisson séché.', statChanges: { hunger: 10 }, itemGain: { id: 'poisson', name: 'Poisson séché', emoji: '🐟', type: 'food', value: 3, effect: { hunger: 15 } } },
        { probability: 0.5, text: '"Rien. Comme d\'habitude." Vous partagez un moment de déception commune.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-cave-vin', title: 'La Cave à Vin Oubliée', type: 'discovery',
    image: '/assets/exp-cave-vin-k2iibzQsEoFfpyRmaG7X9t.webp',
    description: 'Une porte de cave entrouverte dans une ruelle. Des bouteilles poussiéreuses à l\'intérieur.',
    choices: [
      { text: 'Explorer la cave', risk: 'risky', emoji: '🍷', outcomes: [
        { probability: 0.3, text: 'Jackpot ! Une bouteille de vin oubliée. Le sommelier en vous pleure de joie.', statChanges: { thirst: 15, mental: 10 }, itemGain: { id: 'vin', name: 'Bouteille de vin', emoji: '🍷', type: 'food', value: 15, effect: { mental: 10, thirst: 15 } } },
        { probability: 0.4, text: 'La cave est vide. Juste des toiles d\'araignée et de la déception.', statChanges: { mental: -3 } },
        { probability: 0.3, text: 'Le propriétaire vous surprend ! "Voleur !" Vous filez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Refermer la porte et partir', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 1, text: 'La sagesse l\'emporte. Vous repartez la conscience tranquille.', statChanges: { mental: 3, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-magasin-ferme', title: 'Le Magasin Fermé', type: 'discovery',
    image: '/assets/exp-magasin-ferme-6eecqa7F4eaw5q482jWUCU.webp',
    description: 'Un magasin a fermé définitivement. La vitrine est encore pleine de marchandises.',
    choices: [
      { text: 'Regarder à travers la vitrine', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 0.6, text: 'Vous repérez une porte arrière entrouverte. Intéressant pour plus tard...', statChanges: { mental: 3 }, addFlag: 'magasin-repere' },
        { probability: 0.4, text: 'Juste des mannequins poussiéreux qui vous fixent. Flippant.', statChanges: { mental: -3 } },
      ]},
      { text: 'Dormir sous l\'auvent', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.7, text: 'L\'auvent protège de la pluie. Pas mal comme spot.', statChanges: { sleep: 10 } },
        { probability: 0.3, text: 'Le vent s\'engouffre. Nuit froide.', statChanges: { sleep: 5, health: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-hopital', title: 'Les Urgences de l\'Hôpital', type: 'social',
    image: '/assets/exp-hopital-h7QXk7kd9iu8CG5kPG7P6Y.webp',
    description: 'L\'hôpital est bondé. La salle d\'attente des urgences est chaude et il y a un distributeur d\'eau.',
    choices: [
      { text: 'S\'installer discrètement en salle d\'attente', risk: 'normal', emoji: '🏥', outcomes: [
        { probability: 0.6, text: 'Personne ne vous remarque. 2h au chaud, eau gratuite, toilettes. Le paradis.', statChanges: { thirst: 15, sleep: 8, dignity: 3 } },
        { probability: 0.4, text: 'Un vigile vous repère. "Vous avez un problème médical ?" Vous improvisez.', statChanges: { mental: -5 } },
      ]},
      { text: 'Demander à voir un médecin (gratuit)', risk: 'safe', emoji: '👨‍⚕️', outcomes: [
        { probability: 0.5, text: 'Après 3h d\'attente, un médecin vous examine. Pansements et vitamines. Merci la sécu.', statChanges: { health: 15, mental: 5, sleep: -5 } },
        { probability: 0.5, text: '"Les urgences sont pour les urgences." On vous renvoie. Au moins vous avez bu de l\'eau.', statChanges: { thirst: 10, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-dechetterie', title: 'La Déchetterie Municipale', type: 'discovery',
    image: '/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp',
    description: 'La déchetterie est ouverte. Les gens jettent des choses incroyables.',
    choices: [
      { text: 'Fouiller les bennes', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.5, text: 'Un micro-ondes qui marche, un sac de couchage, des livres ! Les gens sont fous de jeter ça.', statChanges: { mental: 8 }, itemGain: { id: 'sac-couchage', name: 'Sac de couchage', emoji: '🛏️', type: 'armor', value: 15, defenseBonus: 3 }, addFlag: 'roi-dechetterie' },
        { probability: 0.3, text: 'Rien de bon aujourd\'hui. Que des gravats et du plâtre.', statChanges: { mental: -2 } },
        { probability: 0.2, text: 'Vous vous coupez sur un morceau de verre. Aïe.', statChanges: { health: -8 } },
      ]},
      { text: 'Discuter avec le gardien', risk: 'safe', emoji: '💬', outcomes: [
        { probability: 0.6, text: 'Le gardien est sympa. "Reviens mardi, y\'a toujours du bon matos." Info précieuse.', statChanges: { mental: 5 }, respectChange: 1, addFlag: 'ami-gardien-dechetterie' },
        { probability: 0.4, text: '"C\'est interdit de fouiller !" Il vous chasse.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'exp-camion-pizza', title: 'Le Camion Pizza', type: 'narrative',
    image: '/assets/exp-camion-pizza-gRv6sJgQcz26Svyj68t2oD.webp',
    description: 'Un camion pizza est garé. L\'odeur est divine. Le pizzaiolo ferme pour la nuit.',
    choices: [
      { text: 'Demander les invendus', risk: 'safe', emoji: '🍕', outcomes: [
        { probability: 0.6, text: '"Tiens, prends ça." Deux parts de margherita ! Festin !', statChanges: { hunger: 25, mental: 10, thirst: 5 } },
        { probability: 0.4, text: '"Désolé, j\'ai tout vendu." Votre estomac gronde de déception.', statChanges: { mental: -3, hunger: -5 } },
      ]},
      { text: 'Fouiller les poubelles du camion', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.5, text: 'Des croûtes de pizza et un fond de sauce. C\'est pas du gastronomique mais ça nourrit.', statChanges: { hunger: 12, dignity: -5 } },
        { probability: 0.3, text: 'Le pizzaiolo vous voit. "Hé ! Dégage de mes poubelles !"', statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.2, text: 'Un chat sauvage défend les poubelles ! Il griffe !', statChanges: { health: -5, hunger: -3 } },
      ]},
    ],
  },
];

// ============ BEG EVENTS (30) ============
export const BEG_EVENTS: GameEvent[] = [
  {
    id: 'beg-couple-riche', title: 'Le Couple de Riches', type: 'social',
    image: '/assets/beg-couple-riche-fGABmQHzGdaNfYfNeimiRm.webp',
    description: 'Un couple en manteau de fourrure passe devant vous. Ils sentent le parfum cher.',
    choices: [
      { text: 'Tendre la main poliment', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.5, text: 'La femme vous donne 5€. "Prenez soin de vous." Sincère.', statChanges: { dignity: 3, mental: 5 }, moneyChange: 5 },
        { probability: 0.3, text: 'Ils passent sans vous regarder. Vous êtes invisible.', statChanges: { dignity: -5, mental: -5 } },
        { probability: 0.2, text: 'L\'homme vous donne 10€ ! "J\'ai connu des temps durs aussi."', statChanges: { dignity: 5, mental: 10 }, moneyChange: 10 },
      ]},
      { text: 'Raconter une histoire triste', risk: 'normal', emoji: '😢', outcomes: [
        { probability: 0.4, text: 'Votre histoire les émeut. 8€ et un numéro d\'association.', statChanges: { mental: 5, dignity: -3 }, moneyChange: 8 },
        { probability: 0.6, text: '"On connaît le truc." Ils accélèrent le pas.', statChanges: { dignity: -8, mental: -5 } },
      ]},
      { text: 'Engager la conversation d\'égal à égal', risk: 'normal', emoji: '🎩', requirements: { stat: 'dignity', minValue: 50 }, outcomes: [
        { probability: 0.7, text: 'Votre prestance les surprend. On parle art, vin, vie. L\'homme vous glisse 12€ « pour le plaisir de la conversation ».', moneyChange: 12, statChanges: { mental: 10, dignity: 5 }, respectChange: 2 },
        { probability: 0.3, text: 'La conversation est agréable mais brève. Elle vous laisse 4€ et un sourire sincère.', moneyChange: 4, statChanges: { mental: 6 } },
      ]},
    ],
  },
  {
    id: 'beg-boulangerie', title: 'La Boulangerie', type: 'social',
    image: '/assets/beg-boulangerie-UTiJnojsDppWgqBkgPD7iy.webp',
    description: 'La boulangerie ferme dans 10 minutes. L\'odeur du pain chaud vous torture.',
    choices: [
      { text: 'Demander le pain invendu', risk: 'safe', emoji: '🥖', outcomes: [
        { probability: 0.7, text: 'La boulangère vous donne deux baguettes et un pain au chocolat ! "Ça partira à la poubelle sinon."', statChanges: { hunger: 25, mental: 8, dignity: 3 } },
        { probability: 0.3, text: '"Désolée, on a tout vendu aujourd\'hui." Votre estomac pleure.', statChanges: { mental: -3, hunger: -3 } },
      ]},
      { text: 'Proposer de balayer en échange', risk: 'safe', emoji: '🧹', outcomes: [
        { probability: 0.8, text: 'Marché conclu ! Vous balayez 15 minutes et repartez avec un sac de viennoiseries.', statChanges: { hunger: 20, dignity: 8, mental: 5 } },
        { probability: 0.2, text: '"Mon mari s\'en occupe." Refus poli mais elle vous donne un croissant quand même.', statChanges: { hunger: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'beg-terrasse-cafe', title: 'La Terrasse de Café', type: 'social',
    image: '/assets/beg-terrasse-cafe-4C6DR278ZzSCErovRVBHdM.webp',
    description: 'Un café avec terrasse. Des gens sirotent leur expresso à 4€. Vous avez soif.',
    choices: [
      { text: 'S\'asseoir et attendre les restes', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 0.5, text: 'Un client laisse un demi-café et un croissant entamé. Petit déjeuner !', statChanges: { hunger: 8, thirst: 10, dignity: -5 } },
        { probability: 0.5, text: 'Le serveur vous chasse. "C\'est réservé aux clients."', statChanges: { dignity: -8, mental: -5 } },
      ]},
      { text: 'Demander un verre d\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 0.8, text: 'Le serveur vous apporte un verre d\'eau. Petit geste, grande humanité.', statChanges: { thirst: 15, dignity: 3, mental: 5 } },
        { probability: 0.2, text: '"L\'eau c\'est pour les clients." Froid.', statChanges: { mental: -5, dignity: -3 } },
      ]},
      { text: 'S\'installer et discuter comme un habitué', risk: 'normal', emoji: '🗞️', requirements: { stat: 'dignity', minValue: 45 }, outcomes: [
        { probability: 0.6, text: 'Un retraité vous offre le café et une heure de conversation. En partant, il glisse 3€ « pour le prochain ».', moneyChange: 3, statChanges: { thirst: 12, mental: 12, dignity: 3 } },
        { probability: 0.4, text: 'Le serveur vous a à l\'œil mais ne dit rien. Vous repartez réchauffé et presque respecté.', statChanges: { mental: 6, thirst: 5 } },
      ]},
    ],
  },
  {
    id: 'beg-ecole-sortie', title: 'La Sortie d\'École', type: 'social',
    image: '/assets/beg-ecole-sortie-MRgU7z3Vkq86je5Q4bCAvb.webp',
    description: 'C\'est l\'heure de la sortie. Parents et enfants affluent.',
    choices: [
      { text: 'Mendier discrètement', risk: 'safe', emoji: '🎒', outcomes: [
        { probability: 0.5, text: 'Une maman vous donne 2€ et un goûter. "Tenez, pour vous."', statChanges: { hunger: 8, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: 'Les parents vous évitent. Certains changent de trottoir.', statChanges: { dignity: -8, mental: -5 } },
        { probability: 0.2, text: 'Un enfant vous donne son goûter en cachette de sa mère. Adorable.', statChanges: { hunger: 10, mental: 10 } },
      ]},
      { text: 'Proposer d\'aider à traverser', risk: 'normal', emoji: '🚸', outcomes: [
        { probability: 0.4, text: 'Vous aidez les enfants à traverser pendant 30 min. Les parents apprécient. 5€ collectés.', statChanges: { dignity: 10, mental: 8 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.6, text: 'Les parents sont méfiants. Un père vous demande de partir.', statChanges: { dignity: -10, mental: -8 } },
      ]},
    ],
  },
  {
    id: 'beg-supermarche', title: 'Le Supermarché', type: 'social',
    image: '/assets/beg-supermarche-4TENQwAV5hiGXPKER2Gy6s.webp',
    description: 'Devant le supermarché, les clients entrent et sortent avec leurs courses.',
    choices: [
      { text: 'S\'installer à l\'entrée avec un gobelet', risk: 'safe', emoji: '🥤', outcomes: [
        { probability: 0.4, text: 'En 1h, vous récoltez 6€. Pas mal !', statChanges: { dignity: -5, mental: 3 }, moneyChange: 6 },
        { probability: 0.3, text: 'Le vigile vous demande de partir. "Pas de mendicité ici."', statChanges: { dignity: -8 } },
        { probability: 0.3, text: 'Une dame vous achète un sandwich et une bouteille d\'eau. Merci.', statChanges: { hunger: 15, thirst: 15, mental: 5 } },
      ]},
      { text: 'Aider les clients à porter leurs courses', risk: 'normal', emoji: '🛒', outcomes: [
        { probability: 0.5, text: 'Plusieurs clients acceptent ! 4€ en pourboires et un pack de yaourts.', statChanges: { hunger: 10, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.5, text: 'Personne ne veut de votre aide. Invisible.', statChanges: { dignity: -5, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-musicien-metro', title: 'Le Musicien du Métro', type: 'social',
    image: '/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp',
    description: 'Un musicien joue de l\'accordéon dans le métro. Il gagne bien sa vie.',
    choices: [
      { text: 'Lui demander des conseils', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 0.6, text: '"Le secret c\'est le répertoire ! Tiens, chante avec moi." Duo improvisé, 3€ partagés.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 3, respectChange: 1, addFlag: 'ami-musicien' },
        { probability: 0.4, text: '"Dégage de mon spot." Territorial, le musicien.', statChanges: { mental: -5, dignity: -3 } },
      ]},
      { text: 'Chanter à côté de lui', risk: 'risky', emoji: '🎤', outcomes: [
        { probability: 0.3, text: 'Votre voix est... unique. Les gens donnent par pitié. 4€.', statChanges: { dignity: -5, mental: 5 }, moneyChange: 4 },
        { probability: 0.7, text: '"Tu me fais perdre des clients !" Il vous chasse à coups d\'accordéon.', statChanges: { dignity: -10, mental: -5, health: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-touriste-asiatique', title: 'Le Groupe de Touristes', type: 'social',
    image: '/assets/beg-touriste-asiatique-mKRWQ8vLKuJpHegK2ZAxpm.webp',
    description: 'Un groupe de touristes asiatiques prend des photos de tout. Absolument tout.',
    choices: [
      { text: 'Proposer de prendre leur photo', risk: 'safe', emoji: '📸', outcomes: [
        { probability: 0.7, text: 'Ils sont ravis ! Selfies, photos de groupe. 5€ de pourboire et des bonbons japonais.', statChanges: { hunger: 5, mental: 8, dignity: 5 }, moneyChange: 5 },
        { probability: 0.3, text: 'Ils vous prennent en photo VOUS. "Very authentic!" Gênant mais 2€.', statChanges: { dignity: -5, mental: 3 }, moneyChange: 2 },
      ]},
      { text: 'Leur vendre un "guide local"', risk: 'normal', emoji: '🗺️', outcomes: [
        { probability: 0.5, text: 'Vous improvisez un tour du quartier. 10€ et des fous rires.', statChanges: { mental: 10, dignity: 5, sleep: -5 }, moneyChange: 10, respectChange: 3 },
        { probability: 0.5, text: 'Ils ont déjà un guide. Votre offre est déclinée poliment.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-mariage-sortie', title: 'La Sortie de Mariage', type: 'social',
    image: '/assets/beg-mariage-sortie-63dqzL4mxrcYYsqMVAza6U.webp',
    description: 'Un mariage se termine. Les invités sortent, éméchés et généreux.',
    choices: [
      { text: 'Féliciter les mariés', risk: 'safe', emoji: '💒', outcomes: [
        { probability: 0.7, text: 'Les mariés vous invitent à prendre une part de gâteau ! Champagne inclus.', statChanges: { hunger: 20, thirst: 15, mental: 12, dignity: 5 } },
        { probability: 0.3, text: 'Le père de la mariée vous éloigne. "C\'est privé."', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Ramasser le riz et les confettis (pour manger le riz)', risk: 'risky', emoji: '🍚', outcomes: [
        { probability: 0.4, text: 'Vous récupérez assez de riz pour un repas. Débrouillardise !', statChanges: { hunger: 10, dignity: -8 } },
        { probability: 0.6, text: 'C\'est du riz décoratif, pas comestible. Votre estomac proteste.', statChanges: { hunger: -3, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-jogger-parc', title: 'Le Jogger du Parc', type: 'social',
    image: '/assets/beg-jogger-parc-ek7sxZH6KdbP9SnStbrn8P.webp',
    description: 'Un jogger fait sa pause stretching près de vous. Il a l\'air sympathique.',
    choices: [
      { text: 'Engager la conversation', risk: 'safe', emoji: '🏃', outcomes: [
        { probability: 0.6, text: 'Il est coach sportif. "Tu veux que je te montre des exercices ?" Séance gratuite et 3€.', statChanges: { health: 5, mental: 8, dignity: 5 }, moneyChange: 3 },
        { probability: 0.4, text: 'Il remet ses écouteurs et repart. Message reçu.', statChanges: { mental: -3 } },
      ]},
      { text: 'Lui demander de l\'eau', risk: 'safe', emoji: '💧', outcomes: [
        { probability: 0.8, text: 'Il vous passe sa gourde. "Tiens, garde-la." Gourde acquise !', statChanges: { thirst: 15, mental: 5 } },
        { probability: 0.2, text: '"Désolé, j\'ai plus d\'eau." Il est sincère.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'beg-restaurant-poubelle', title: 'Les Poubelles du Restaurant', type: 'discovery',
    image: '/assets/beg-restaurant-poubelle-HSuTGsFVRJkb2zg2xouMyC.webp',
    description: 'Le restaurant gastronomique vient de sortir ses poubelles. Ça sent le gourmet.',
    choices: [
      { text: 'Fouiller les poubelles', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.6, text: 'Des restes de foie gras, du pain frais, un fond de sauce. Festin 5 étoiles !', statChanges: { hunger: 25, mental: 5, dignity: -8 } },
        { probability: 0.4, text: 'Le chef sort fumer. "Hé ! Dégage de mes poubelles !" Vous filez.', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Attendre que le chef rentre et fouiller après', risk: 'safe', emoji: '⏰', outcomes: [
        { probability: 0.7, text: 'Patience récompensée ! Vous mangez comme un roi. En cachette.', statChanges: { hunger: 20, dignity: -5 } },
        { probability: 0.3, text: 'Les poubelles sont vides. Quelqu\'un est passé avant vous.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-cinema', title: 'Le Cinéma', type: 'social',
    image: '/assets/beg-cinema-5SKZPaM25U4pgFRPzwkrku.webp',
    description: 'Le cinéma vient de projeter un film. Les spectateurs sortent.',
    choices: [
      { text: 'Mendier à la sortie', risk: 'safe', emoji: '🎬', outcomes: [
        { probability: 0.5, text: 'Les gens sont de bonne humeur après le film. 4€ récoltés.', statChanges: { dignity: -3, mental: 3 }, moneyChange: 4 },
        { probability: 0.5, text: 'Tout le monde est sur son téléphone. Personne ne vous voit.', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Récupérer les pop-corn restants dans la salle', risk: 'risky', emoji: '🍿', outcomes: [
        { probability: 0.4, text: 'Vous vous faufilez ! Pop-corn, nachos, un fond de soda. Ciné-repas !', statChanges: { hunger: 15, thirst: 8, mental: 5 } },
        { probability: 0.6, text: 'L\'ouvreuse vous attrape. "Dehors !" Expulsé.', statChanges: { dignity: -10, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-eglise-dimanche', title: 'La Messe du Dimanche', type: 'social',
    image: '/assets/beg-eglise-dimanche-MT7XJz2j3QPsWbbzddy6W2.webp',
    description: 'C\'est dimanche. Les fidèles sortent de la messe, l\'âme charitable.',
    choices: [
      { text: 'Demander l\'aumône', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'La charité chrétienne fonctionne ! 6€ et un sandwich.', statChanges: { hunger: 12, mental: 5, dignity: 3 }, moneyChange: 6 },
        { probability: 0.3, text: '"Dieu vous aide, mon fils." Pas d\'argent mais une bénédiction.', statChanges: { mental: 3 } },
      ]},
      { text: 'Entrer pour le repas paroissial', risk: 'normal', emoji: '🍽️', outcomes: [
        { probability: 0.5, text: 'Repas complet ! Soupe, pain, fromage, café. Et de la compagnie.', statChanges: { hunger: 30, thirst: 15, mental: 10, dignity: 5 } },
        { probability: 0.5, text: '"Le repas est réservé aux inscrits." Mais on vous donne du pain.', statChanges: { hunger: 10, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'beg-mairie', title: 'La Mairie', type: 'social',
    image: '/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp',
    description: 'La mairie est ouverte. Des gens font la queue pour des papiers.',
    choices: [
      { text: 'Demander des informations sur les aides sociales', risk: 'safe', emoji: '🏛️', outcomes: [
        { probability: 0.6, text: 'L\'agent d\'accueil est compréhensif. Il vous donne une liste de foyers et d\'aides. Précieux.', statChanges: { mental: 10, dignity: 5 }, addFlag: 'aide-mairie' },
        { probability: 0.4, text: '"Prenez un numéro." Après 2h d\'attente, le guichet ferme.', statChanges: { mental: -5, sleep: -5 } },
      ]},
      { text: 'Utiliser les toilettes et l\'eau chaude', risk: 'safe', emoji: '🚻', outcomes: [
        { probability: 0.8, text: 'Toilettes publiques gratuites ! Vous en profitez pour vous laver.', statChanges: { dignity: 10, thirst: 10 } },
        { probability: 0.2, text: '"Les toilettes sont en panne." Pas de chance.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-gare-tgv', title: 'La Gare TGV', type: 'social',
    image: '/assets/beg-gare-tgv-GVKJko8WAfiNoRKBN7oVPn.webp',
    description: 'La gare TGV est bondée. Voyageurs pressés, valises à roulettes, stress ambiant.',
    choices: [
      { text: 'Proposer de porter les valises', risk: 'normal', emoji: '🧳', outcomes: [
        { probability: 0.5, text: 'Une dame âgée accepte ! 5€ et un merci sincère.', statChanges: { dignity: 5, mental: 5, sleep: -3 }, moneyChange: 5 },
        { probability: 0.3, text: '"Non merci." Refus poli mais ferme.', statChanges: { mental: -2 } },
        { probability: 0.2, text: 'Un voyageur vous accuse de vol ! Malentendu. Stressant.', statChanges: { dignity: -10, mental: -8 } },
      ]},
      { text: 'Mendier près du distributeur de billets', risk: 'safe', emoji: '🎫', outcomes: [
        { probability: 0.5, text: 'Les voyageurs lâchent leur monnaie. 3€ en 30 minutes.', statChanges: { dignity: -5 }, moneyChange: 3 },
        { probability: 0.5, text: 'La police ferroviaire vous demande de circuler.', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-distributeur-billets', title: 'Le Distributeur de Billets', type: 'narrative',
    image: '/assets/beg-distributeur-billets-G85Evn8NyawUD4iF3YYLdL.webp',
    description: 'Un distributeur automatique de billets. Des gens retirent de l\'argent.',
    choices: [
      { text: 'Attendre près du distributeur', risk: 'safe', emoji: '🏧', outcomes: [
        { probability: 0.4, text: 'Quelqu\'un oublie sa monnaie ! 3€ dans le bac.', statChanges: { mental: 5 }, moneyChange: 3 },
        { probability: 0.3, text: 'Rien ne se passe. Vous avez l\'air suspect.', statChanges: { dignity: -5 } },
        { probability: 0.3, text: 'Un homme vous donne 2€. "Tiens, achète-toi un café."', statChanges: { mental: 5, dignity: 3 }, moneyChange: 2 },
      ]},
      { text: 'Demander poliment aux gens qui retirent', risk: 'normal', emoji: '🙏', outcomes: [
        { probability: 0.4, text: '"Tenez." 5€ d\'un coup ! Généreux.', statChanges: { mental: 8, dignity: -3 }, moneyChange: 5 },
        { probability: 0.6, text: 'Les gens accélèrent le pas. Vous êtes un épouvantail.', statChanges: { dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-fleuriste', title: 'Le Fleuriste', type: 'social',
    image: '/assets/beg-fleuriste-bxNwHDonMVDteRKwkBfphr.webp',
    description: 'Le fleuriste jette ses fleurs fanées. Elles sont encore belles.',
    choices: [
      { text: 'Demander les fleurs invendues', risk: 'safe', emoji: '💐', outcomes: [
        { probability: 0.7, text: '"Prenez, elles vont à la poubelle." Vous avez un bouquet ! Revendable.', statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.3, text: '"Non, elles sont pour le compost." Écolo strict.', statChanges: { mental: -2 } },
      ]},
      { text: 'Revendre les fleurs aux passants', risk: 'normal', emoji: '🌹', outcomes: [
        { probability: 0.5, text: '"Des fleurs pour madame ?" Vous vendez 3 roses. 6€ !', statChanges: { dignity: 5, mental: 8 }, moneyChange: 6, respectChange: 2 },
        { probability: 0.5, text: 'Personne n\'achète des fleurs à un SDF. Logique, en fait.', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-station-metro', title: 'La Station de Métro', type: 'social',
    image: '/assets/beg-station-metro-7k2mmvWMW6cQbjMKeQ3nba.webp',
    description: 'L\'entrée du métro. Flux constant de passagers pressés.',
    choices: [
      { text: 'Faire la manche avec un panneau', risk: 'safe', emoji: '📝', outcomes: [
        { probability: 0.5, text: 'Votre panneau "J\'ai faim" touche les coeurs. 5€ en 1h.', statChanges: { dignity: -5, mental: 3 }, moneyChange: 5 },
        { probability: 0.3, text: 'Un passant vous donne un sandwich. Mieux que de l\'argent.', statChanges: { hunger: 15, mental: 5 } },
        { probability: 0.2, text: 'La RATP vous demande de partir. Spot interdit.', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Ouvrir les portes aux gens chargés', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Service apprécié ! Quelques pièces en remerciement. 2€.', statChanges: { dignity: 5, mental: 5 }, moneyChange: 2 },
        { probability: 0.3, text: 'Les gens passent sans un regard. Automates humains.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-parc-chien', title: 'Le Parc à Chiens', type: 'social',
    image: '/assets/beg-parc-chien-hP9gE8EtKnSHykQy4QSKpy.webp',
    description: 'Le parc à chiens est animé. Des propriétaires discutent pendant que leurs chiens jouent.',
    choices: [
      { text: 'Proposer de garder les chiens', risk: 'normal', emoji: '🐕', outcomes: [
        { probability: 0.5, text: 'Une dame vous confie son caniche 30 min. 4€ et des léchouilles.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 4 },
        { probability: 0.5, text: '"Mon chien ne va pas avec les inconnus." Refus.', statChanges: { mental: -2 } },
      ]},
      { text: 'Jouer avec les chiens', risk: 'safe', emoji: '🎾', outcomes: [
        { probability: 0.8, text: 'Les chiens vous adorent ! Moment de bonheur pur. Un propriétaire vous offre un café.', statChanges: { mental: 12, thirst: 8, dignity: 3 } },
        { probability: 0.2, text: 'Un chien vous mord la main. Pas méchamment, mais quand même.', statChanges: { health: -3, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-lavage-voiture', title: 'La Station de Lavage', type: 'social',
    image: '/assets/beg-lavage-voiture-jio2DxY23xqhxu63ZuyVTv.webp',
    description: 'Une station de lavage automatique. Des gens attendent que leur voiture soit propre.',
    choices: [
      { text: 'Proposer un lavage à la main', risk: 'normal', emoji: '🧽', outcomes: [
        { probability: 0.5, text: 'Un homme accepte ! 1h de travail, 8€. Honnête.', statChanges: { dignity: 5, mental: 5, sleep: -5 }, moneyChange: 8 },
        { probability: 0.5, text: '"J\'ai la machine pour ça." Logique.', statChanges: { mental: -2 } },
      ]},
      { text: 'Récupérer la monnaie oubliée dans les machines', risk: 'safe', emoji: '🪙', outcomes: [
        { probability: 0.4, text: '2€ oubliés dans une machine ! Petit bonus.', statChanges: { mental: 3 }, moneyChange: 2 },
        { probability: 0.6, text: 'Rien. Les machines sont vides.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'beg-taxi-arret', title: 'L\'Arrêt de Taxi', type: 'social',
    image: '/assets/beg-taxi-arret-fGsAqfVEcKEJAiddtE6GrC.webp',
    description: 'Une file de taxis attend des clients. Les chauffeurs discutent entre eux.',
    choices: [
      { text: 'Demander un petit quelque chose aux chauffeurs', risk: 'safe', emoji: '🚕', outcomes: [
        { probability: 0.5, text: 'Un chauffeur vous offre son sandwich. "J\'ai plus faim, prends."', statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: '"Dégage, tu fais fuir les clients."', statChanges: { dignity: -8, mental: -3 } },
        { probability: 0.2, text: 'Un chauffeur vous propose un trajet gratuit jusqu\'au foyer.', statChanges: { mental: 10, dignity: 5 } },
      ]},
      { text: 'Ouvrir les portes des taxis aux clients', risk: 'normal', emoji: '🚪', outcomes: [
        { probability: 0.4, text: 'Les clients apprécient ! 3€ en pourboires.', statChanges: { dignity: 3, mental: 5 }, moneyChange: 3 },
        { probability: 0.6, text: 'Les chauffeurs n\'aiment pas ça. "C\'est notre boulot !"', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'beg-concert-sortie', title: 'La Sortie de Concert', type: 'social',
    image: '/assets/beg-concert-sortie-VPCD4nBdsydTGMi5TPfd8i.webp',
    description: 'Un concert vient de se terminer. Les spectateurs sortent, euphoriques.',
    choices: [
      { text: 'Mendier dans l\'euphorie générale', risk: 'safe', emoji: '🎸', outcomes: [
        { probability: 0.6, text: 'Les gens sont de bonne humeur ! 7€ récoltés facilement.', statChanges: { dignity: -3, mental: 5 }, moneyChange: 7 },
        { probability: 0.4, text: 'Tout le monde est sur son téléphone à poster des stories.', statChanges: { dignity: -3, mental: -2 } },
      ]},
      { text: 'Chanter les chansons du concert', risk: 'normal', emoji: '🎤', outcomes: [
        { probability: 0.5, text: 'Votre reprise est applaudie ! 5€ et des rires.', statChanges: { mental: 10, dignity: 5 }, moneyChange: 5, respectChange: 2 },
        { probability: 0.5, text: 'Faux comme une casserole. Les gens fuient.', statChanges: { dignity: -8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-match-foot', title: 'La Sortie du Match', type: 'social',
    image: '/assets/beg-match-foot-PvcoeSj4wSQHaeZetgnJEk.webp',
    description: 'Le match de foot est fini. Les supporters envahissent les rues.',
    choices: [
      { text: 'Mendier auprès des supporters', risk: 'normal', emoji: '⚽', outcomes: [
        { probability: 0.4, text: 'L\'équipe locale a gagné ! Les supporters sont généreux. 8€ !', statChanges: { mental: 5 }, moneyChange: 8 },
        { probability: 0.3, text: 'L\'équipe a perdu. Les supporters sont furieux. Mauvais timing.', statChanges: { mental: -5, dignity: -5 } },
        { probability: 0.3, text: 'Un supporter vous offre une bière. Pas nutritif mais convivial.', statChanges: { thirst: 10, mental: 8, dignity: -3 } },
      ]},
      { text: 'Vendre des écharpes trouvées', risk: 'risky', emoji: '🧣', outcomes: [
        { probability: 0.3, text: 'Vous vendez 2 écharpes à 3€ chacune. Business !', statChanges: { dignity: -3, mental: 5 }, moneyChange: 6 },
        { probability: 0.7, text: 'Un supporter reconnaît SON écharpe. Tension.', statChanges: { dignity: -10, mental: -8, health: -3 } },
      ]},
    ],
  },
];

// ============ STEAL EVENTS, action "Voler" (haut risque / haute récompense) ============
export const STEAL_EVENTS: GameEvent[] = [
  {
    id: 'steal-etal-marche', title: 'L\'Étal du Marché', type: 'discovery',
    description: 'Un primeur a le dos tourné. Ses fruits sont à portée de main. Personne ne regarde... ou presque.',
    choices: [
      { text: 'Chiper deux pommes vite fait', risk: 'normal', emoji: '🍎', outcomes: [
        { probability: 0.6, text: 'Mission accomplie ! Deux belles pommes dans la poche. Discret comme un chat.', statChanges: { hunger: 18, dignity: -6 } },
        { probability: 0.4, text: '"HÉ ! Le voleur !" Le primeur vous attrape par le col et vous secoue.', statChanges: { health: -8, dignity: -14, mental: -6 }, respectChange: -2 },
      ]},
      { text: 'Rafler toute la caisse de fruits', risk: 'risky', emoji: '🧺', outcomes: [
        { probability: 0.3, text: 'Jackpot ! Vous filez avec une caisse entière. Festin pour des jours.', statChanges: { hunger: 35, mental: 8, dignity: -10 }, itemGain: { id: 'caisse-fruits', name: 'Caisse de fruits', emoji: '🧺', type: 'food', value: 12, effect: { hunger: 20 } } },
        { probability: 0.7, text: 'Trop gourmand. Le marché entier vous tombe dessus. On vous reprend tout et un peu plus.', statChanges: { health: -15, dignity: -18, mental: -10 }, moneyChange: -3, respectChange: -3 },
      ]},
    ],
  },
  {
    id: 'steal-poche-costard', title: 'La Poche du Costard', type: 'discovery',
    description: 'Un homme d\'affaires dort dans le train, portefeuille qui dépasse. La tentation est énorme.',
    choices: [
      { text: 'Faire les poches en douceur', risk: 'risky', emoji: '🤏', outcomes: [
        { probability: 0.45, text: 'Vos doigts de fée font merveille. 15€ et il ronfle toujours.', moneyChange: 15, statChanges: { dignity: -8, mental: 4 }, respectChange: 1 },
        { probability: 0.55, text: 'Il se réveille en sursaut ! "Au voleur !" Vous courez, le cœur battant.', statChanges: { health: -6, mental: -10, dignity: -12 }, respectChange: -2 },
      ]},
      { text: 'Renoncer, c\'est trop risqué', risk: 'safe', emoji: '🙅', outcomes: [
        { probability: 1, text: 'Vous vous éloignez. Votre estomac grogne, mais votre conscience est tranquille.', statChanges: { mental: 3, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-supermarche', title: 'Le Supermarché', type: 'discovery',
    description: 'Rayons remplis, vigile à moitié endormi. Une boîte de conserve glisserait si bien sous la veste.',
    choices: [
      { text: 'Glisser de la nourriture sous la veste', risk: 'normal', emoji: '🥫', outcomes: [
        { probability: 0.55, text: 'Vous passez les portiques l\'air de rien. Conserves et chocolat : repas assuré.', statChanges: { hunger: 25, thirst: 8, dignity: -8 }, itemGain: { id: 'conserve-volee', name: 'Conserve volée', emoji: '🥫', type: 'food', value: 5, effect: { hunger: 30 } } },
        { probability: 0.45, text: 'Le portique sonne. Le vigile se réveille enfin. Fouille humiliante devant tout le monde.', statChanges: { dignity: -18, mental: -10, health: -4 }, respectChange: -2 },
      ]},
      { text: 'Voler une bouteille d\'alcool à revendre', risk: 'risky', emoji: '🍾', outcomes: [
        { probability: 0.35, text: 'Bouteille de vin sous le bras, vous filez. Revendue au coin de la rue : 8€.', moneyChange: 8, statChanges: { dignity: -10, mental: 3 } },
        { probability: 0.65, text: 'Le vigile était bien réveillé. Il vous plaque au sol et appelle la police.', statChanges: { health: -18, dignity: -20, mental: -12 }, moneyChange: -5, respectChange: -4 },
      ]},
    ],
  },
  {
    id: 'steal-velo', title: 'Le Vélo Mal Attaché', type: 'discovery',
    description: 'Un vélo électrique, antivol bon marché à peine fermé. Il vaut une petite fortune à la revente.',
    choices: [
      { text: 'Forcer l\'antivol et filer', risk: 'risky', emoji: '🚲', outcomes: [
        { probability: 0.4, text: 'Clic ! L\'antivol cède. Revendu à un receleur : 20€. Belle prise.', moneyChange: 20, statChanges: { dignity: -12, mental: 5 }, respectChange: 2 },
        { probability: 0.6, text: 'Le propriétaire surgit du café d\'à côté. La poursuite tourne mal pour vous.', statChanges: { health: -20, dignity: -15, mental: -8 }, respectChange: -3 },
      ]},
      { text: 'Voler juste la sacoche', risk: 'normal', emoji: '👜', outcomes: [
        { probability: 0.55, text: 'La sacoche contient un casse-croûte et 4€ de monnaie. Pas mal.', moneyChange: 4, statChanges: { hunger: 12, dignity: -6 } },
        { probability: 0.45, text: 'Un passant crie pour alerter. Vous lâchez tout et détalez.', statChanges: { mental: -6, dignity: -10 }, respectChange: -1 },
      ]},
    ],
  },
  {
    id: 'steal-tronc-eglise', title: 'Le Tronc de l\'Église', type: 'discovery',
    description: 'L\'église est vide. Le tronc des offrandes déborde de pièces. Dieu regarde, paraît-il.',
    choices: [
      { text: 'Se servir dans le tronc', risk: 'risky', emoji: '⛪', outcomes: [
        { probability: 0.5, text: 'Vous récupérez 12€ en pièces. Personne, sauf peut-être le Tout-Puissant.', moneyChange: 12, statChanges: { dignity: -15, mental: -5 } },
        { probability: 0.5, text: 'Le curé sort de la sacristie. "Mon fils, que fais-tu ?" La honte vous écrase.', statChanges: { dignity: -20, mental: -12 }, respectChange: -2 },
      ]},
      { text: 'Demander l\'aumône au curé à la place', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.7, text: 'Le curé vous offre un repas chaud et 5€ du tronc, de bon cœur. "Reviens quand tu veux."', moneyChange: 5, statChanges: { hunger: 20, mental: 12, dignity: 8 }, respectChange: 2 },
        { probability: 0.3, text: 'Il est absent. Mais une bénévole vous donne une soupe.', statChanges: { hunger: 12, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'steal-etendage', title: 'Le Linge qui Sèche', type: 'discovery',
    description: 'Au rez-de-chaussée, du linge sèche à une fenêtre ouverte. Un manteau chaud vous ferait du bien.',
    choices: [
      { text: 'Décrocher le manteau', risk: 'normal', emoji: '🧥', outcomes: [
        { probability: 0.55, text: 'Un bon manteau de laine, encore tiède du soleil. Vos nuits seront moins rudes.', statChanges: { dignity: 4, sleep: 6, health: 4 }, itemGain: { id: 'manteau-vole', name: 'Manteau volé', emoji: '🧥', type: 'armor', value: 7, defenseBonus: 2 } },
        { probability: 0.45, text: 'Une grand-mère hurle à la fenêtre : "Au secours, on me vole !" Tout le quartier se réveille.', statChanges: { mental: -8, dignity: -14 }, respectChange: -2 },
      ]},
      { text: 'Prendre les chaussettes et les sous-vêtements', risk: 'safe', emoji: '🧦', outcomes: [
        { probability: 0.8, text: 'Pas glorieux, mais des chaussettes sèches changent une vie dans la rue.', statChanges: { dignity: -4, mental: 4, health: 3 } },
        { probability: 0.2, text: 'Un chien de garde aboie. Vous filez avec une seule chaussette. Mieux que rien.', statChanges: { dignity: -6, mental: -2 } },
      ]},
    ],
  },
];

// ============ REST EVENTS (30) ============
export const REST_EVENTS: GameEvent[] = [
  {
    id: 'rest-pont-riviere', title: 'Le Pont sur la Rivière', type: 'narrative',
    image: '/assets/rest-pont-riviere-ZkfvuMX445ho8WdARa8BGq.webp',
    description: 'Sous le pont, c\'est sec et abrité. Le bruit de l\'eau est apaisant.',
    choices: [
      { text: 'S\'installer pour la nuit', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 0.7, text: 'Nuit paisible bercée par le clapotis. Vous dormez comme un bébé.', statChanges: { sleep: 20, mental: 5 } },
        { probability: 0.3, text: 'L\'eau monte pendant la nuit. Réveil les pieds mouillés.', statChanges: { sleep: 8, health: -3 } },
      ]},
      { text: 'Explorer sous le pont', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.5, text: 'Vous trouvez une couverture oubliée par un autre SDF. Aubaine !', statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.5, text: 'Des rats. Beaucoup de rats. Vous changez de spot.', statChanges: { mental: -5, sleep: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-lavomatic', title: 'Le Lavomatic 24h', type: 'narrative',
    image: '/assets/rest-lavomatic-koaRprcJ9mvGN9vvKFySBu.webp',
    description: 'Le lavomatic est ouvert toute la nuit. Chaud, éclairé, avec des chaises.',
    choices: [
      { text: 'Dormir sur les chaises', risk: 'safe', emoji: '🧺', outcomes: [
        { probability: 0.6, text: 'Le ronronnement des machines vous berce. Nuit correcte.', statChanges: { sleep: 18, mental: 3 } },
        { probability: 0.4, text: 'Le gérant passe à 3h. "C\'est pas un hôtel !" Dehors.', statChanges: { sleep: 8, dignity: -5 } },
      ]},
      { text: 'Laver vos vêtements (si vous avez de l\'argent)', risk: 'safe', emoji: '👕', outcomes: [
        { probability: 0.7, text: 'Vêtements propres ! Vous vous sentez comme neuf. Dignité restaurée.', statChanges: { dignity: 15, mental: 8, sleep: 5 } },
        { probability: 0.3, text: 'La machine avale votre pièce sans démarrer. Arnaque mécanique.', statChanges: { mental: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-parking-souterrain', title: 'Le Parking Souterrain', type: 'narrative',
    image: '/assets/rest-parking-souterrain-Rgkuiwyd7ZtiJ3qQzx2dHW.webp',
    description: 'Le parking souterrain est presque vide la nuit. Sec, à l\'abri du vent.',
    choices: [
      { text: 'Se cacher entre les voitures', risk: 'normal', emoji: '🅿️', outcomes: [
        { probability: 0.5, text: 'Nuit tranquille. Le béton n\'est pas confortable mais c\'est sec.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un vigile fait sa ronde. Vous devez bouger toutes les heures.', statChanges: { sleep: 8, mental: -3 } },
        { probability: 0.2, text: 'Une alarme de voiture se déclenche ! Panique et fuite.', statChanges: { sleep: -5, mental: -8 } },
      ]},
      { text: 'Dormir dans la cage d\'escalier', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Spot discret. Vous dormez sans être dérangé.', statChanges: { sleep: 18 } },
        { probability: 0.3, text: 'Un résident vous découvre au matin. Gênant.', statChanges: { sleep: 12, dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-cabane-carton', title: 'Le Château de Carton', type: 'narrative',
    image: '/assets/rest-cabane-carton-Q65zGixABM5SKqrjKEaS4x.webp',
    description: 'Vous avez assez de cartons pour vous bâtir un vrai petit palace.',
    choices: [
      { text: 'Construire un abri élaboré', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.6, text: 'Chef-d\'oeuvre architectural ! Chaud, sec, presque confortable.', statChanges: { sleep: 25, dignity: 5, mental: 5 } },
        { probability: 0.4, text: 'Le vent emporte votre construction. Retour à la case départ.', statChanges: { sleep: 5, mental: -5 } },
      ]},
      { text: 'Juste s\'enrouler dans un carton', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Pas le grand luxe, mais ça fait le job.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Le carton est mouillé. Nuit froide et humide.', statChanges: { sleep: 5, health: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-banc-eglise', title: 'Le Banc de l\'Église', type: 'narrative',
    image: '/assets/rest-banc-eglise-ZdyDwJEYtPgNBbSofzbiyw.webp',
    description: 'Le banc devant l\'église est large et abrité par un auvent.',
    choices: [
      { text: 'S\'allonger sur le banc', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 0.7, text: 'Le prêtre sort et vous couvre d\'une couverture. Humanité.', statChanges: { sleep: 20, mental: 10, dignity: 5 } },
        { probability: 0.3, text: 'Le banc est dur comme la pierre. Dos en compote au réveil.', statChanges: { sleep: 10, health: -3 } },
      ]},
      { text: 'Entrer dans l\'église si elle est ouverte', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 0.5, text: 'L\'église est ouverte ! Vous dormez sur un banc intérieur. Chaleur divine.', statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: 'Fermée à clé. Le banc extérieur fera l\'affaire.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-toit-immeuble', title: 'Le Toit de l\'Immeuble', type: 'narrative',
    image: '/assets/rest-toit-immeuble-6ryUDQFMVD6QoZDFqJj4s7.webp',
    description: 'Vous avez trouvé l\'accès au toit. Vue sur les étoiles.',
    choices: [
      { text: 'Dormir à la belle étoile', risk: 'normal', emoji: '⭐', outcomes: [
        { probability: 0.5, text: 'Nuit magique sous les étoiles. Le vent est doux.', statChanges: { sleep: 20, mental: 10 } },
        { probability: 0.3, text: 'Il se met à pleuvoir. Pas d\'abri sur un toit.', statChanges: { sleep: 5, health: -5, mental: -3 } },
        { probability: 0.2, text: 'Vous roulez dans votre sommeil. Réveil brutal au bord du vide !', statChanges: { sleep: 8, mental: -10 } },
      ]},
      { text: 'Installer un campement', risk: 'safe', emoji: '🏕️', outcomes: [
        { probability: 0.7, text: 'Avec des bâches et du carton, vous créez un nid douillet.', statChanges: { sleep: 22, mental: 5 } },
        { probability: 0.3, text: 'Le vent emporte tout. Nuit à la dure.', statChanges: { sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-abribus', title: 'L\'Abribus', type: 'narrative',
    image: '/assets/rest-abribus-T6i3s6bQ4qyZfBauUNWeu6.webp',
    description: 'L\'abribus est vide. Le plexiglas protège du vent. Presque confortable.',
    choices: [
      { text: 'Dormir assis sur le banc', risk: 'safe', emoji: '🚌', outcomes: [
        { probability: 0.6, text: 'Nuit correcte. Le premier bus vous réveille à 5h30.', statChanges: { sleep: 15 } },
        { probability: 0.4, text: 'Un ivrogne s\'installe à côté. Il ronfle. Fort.', statChanges: { sleep: 8, mental: -3 } },
      ]},
      { text: 'S\'allonger par terre dans l\'abribus', risk: 'normal', emoji: '😴', outcomes: [
        { probability: 0.5, text: 'Plus confortable qu\'on ne croit. Nuit passable.', statChanges: { sleep: 18, dignity: -5 } },
        { probability: 0.5, text: 'La police passe. "Circulez." Pas de repos.', statChanges: { sleep: 3, dignity: -8 } },
      ]},
    ],
  },
  {
    id: 'rest-cave-abandonnee', title: 'La Cave Abandonnée', type: 'narrative',
    image: '/assets/rest-cave-abandonnee-PoPAKkfwWsspJhMjvZym9q.webp',
    description: 'Une cave d\'immeuble dont la porte ne ferme plus. Sombre mais sec.',
    choices: [
      { text: 'S\'installer dans la cave', risk: 'normal', emoji: '🏚️', outcomes: [
        { probability: 0.5, text: 'Nuit au sec et au chaud. Les murs épais isolent bien.', statChanges: { sleep: 22, health: 3 } },
        { probability: 0.3, text: 'Des bruits suspects. Vous ne dormez que d\'un oeil.', statChanges: { sleep: 10, mental: -5 } },
        { probability: 0.2, text: 'Un autre SDF est déjà là. Cohabitation tendue.', statChanges: { sleep: 8, mental: -3 } },
      ]},
      { text: 'Explorer la cave d\'abord', risk: 'normal', emoji: '🔦', outcomes: [
        { probability: 0.4, text: 'Vous trouvez des conserves oubliées ! Et un matelas.', statChanges: { sleep: 20, hunger: 10 } },
        { probability: 0.6, text: 'Juste des toiles d\'araignée et de l\'humidité.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-hamac-parc', title: 'Le Hamac Improvisé', type: 'narrative',
    image: '/assets/rest-hamac-parc-JKRnP6QzCq5LRVcbHvvA62.webp',
    description: 'Deux arbres parfaitement espacés. Avec une couverture, vous pouvez faire un hamac.',
    choices: [
      { text: 'Installer le hamac', risk: 'normal', emoji: '🌴', outcomes: [
        { probability: 0.5, text: 'Le hamac tient ! Nuit bercée par le vent. Paradis.', statChanges: { sleep: 25, mental: 8 } },
        { probability: 0.5, text: 'Le noeud lâche à 3h du matin. Chute. Aïe.', statChanges: { sleep: 8, health: -5, mental: -3 } },
      ]},
      { text: 'Dormir au pied des arbres', risk: 'safe', emoji: '🌳', outcomes: [
        { probability: 0.7, text: 'Les racines font un matelas naturel. Pas si mal.', statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.3, text: 'Les fourmis. Partout. PARTOUT.', statChanges: { sleep: 5, mental: -5, health: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-combat-reveil', title: 'Le Réveil Brutal', type: 'combat',
    image: '/assets/rest-combat-reveil-nz6rPGatE5MccSSp5M9iMT.webp',
    description: 'Vous dormez paisiblement quand un bruit vous réveille. Quelqu\'un fouille vos affaires !',
    choices: [
      { text: 'Confronter le voleur', risk: 'risky', emoji: '😤', outcomes: [
        { probability: 0.4, text: 'Vous l\'effrayez ! Il fuit. Vos affaires sont intactes.', statChanges: { sleep: 5, mental: 5 } },
        { probability: 0.6, text: 'C\'est un type costaud. Il vous pousse et prend votre sac.', statChanges: { health: -8, mental: -10, dignity: -5 } },
      ]},
      { text: 'Faire semblant de dormir', risk: 'safe', emoji: '😴', outcomes: [
        { probability: 0.5, text: 'Il prend quelques pièces et part. Vous perdez 3€ mais gardez votre santé.', statChanges: { mental: -5 } },
        { probability: 0.5, text: 'Il ne trouve rien d\'intéressant et part. Ouf.', statChanges: { mental: -3, sleep: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-jardin-secret', title: 'Le Jardin Secret', type: 'discovery',
    image: '/assets/rest-jardin-secret-D3emeTRZCkD6yK6fmxucMr.webp',
    description: 'Derrière un mur, un jardin abandonné. Herbes folles, banc en pierre, fontaine tarie.',
    choices: [
      { text: 'S\'installer dans le jardin', risk: 'safe', emoji: '🌿', outcomes: [
        { probability: 0.8, text: 'Paradis caché ! Calme absolu, herbe douce, abri du vent.', statChanges: { sleep: 25, mental: 12, dignity: 3 } },
        { probability: 0.2, text: 'Le propriétaire revient ! "C\'est privé !" Vous partez.', statChanges: { sleep: 5, dignity: -5 } },
      ]},
      { text: 'Explorer le jardin', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.6, text: 'Vous trouvez des herbes aromatiques et un robinet qui marche !', statChanges: { thirst: 15, mental: 8 } },
        { probability: 0.4, text: 'Juste des orties et des ronces. Aïe.', statChanges: { health: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-grenier', title: 'Le Grenier Oublié', type: 'discovery',
    image: '/assets/rest-grenier-m7geqfLCEDsNwCuwNMJhXK.webp',
    description: 'Un escalier mène à un grenier dont la porte est entrouverte.',
    choices: [
      { text: 'Monter explorer', risk: 'normal', emoji: '🪜', outcomes: [
        { probability: 0.5, text: 'Un grenier plein de vieux meubles ! Un matelas, des couvertures. Palace !', statChanges: { sleep: 28, mental: 10 } },
        { probability: 0.3, text: 'Le plancher craque dangereusement. Vous redescendez vite.', statChanges: { mental: -5, sleep: 5 } },
        { probability: 0.2, text: 'Le propriétaire vous entend ! "Qui est là ?!" Fuite.', statChanges: { mental: -8, dignity: -5 } },
      ]},
      { text: 'Dormir dans l\'escalier', risk: 'safe', emoji: '🪜', outcomes: [
        { probability: 0.7, text: 'L\'escalier est abrité. Nuit correcte.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un voisin vous enjambe à 6h. Gênant.', statChanges: { sleep: 10, dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-fourgon-abandonne', title: 'Le Fourgon Abandonné', type: 'discovery',
    image: '/assets/rest-fourgon-abandonne-XoJDy85GdkXUPTQXiCseeQ.webp',
    description: 'Un vieux fourgon de livraison rouillé. La porte arrière est ouverte.',
    choices: [
      { text: 'Dormir dans le fourgon', risk: 'normal', emoji: '🚐', outcomes: [
        { probability: 0.6, text: 'Sec, à l\'abri du vent. Le métal garde un peu de chaleur.', statChanges: { sleep: 20, mental: 3 } },
        { probability: 0.4, text: 'Le fourgon est glacial. Nuit difficile.', statChanges: { sleep: 10, health: -3 } },
      ]},
      { text: 'Aménager le fourgon', risk: 'normal', emoji: '🏠', outcomes: [
        { probability: 0.5, text: 'Avec du carton et des couvertures, c\'est presque un studio !', statChanges: { sleep: 25, mental: 8, dignity: 3 } },
        { probability: 0.5, text: 'Le propriétaire revient chercher le fourgon. Surprise !', statChanges: { sleep: 5, dignity: -8, mental: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-wagon-train', title: 'Le Wagon de Train', type: 'discovery',
    image: '/assets/rest-wagon-train-Nh3WT9QiYunMe4t55bsuDu.webp',
    description: 'Un wagon de marchandises est ouvert sur une voie de garage.',
    choices: [
      { text: 'Dormir dans le wagon', risk: 'normal', emoji: '🚃', outcomes: [
        { probability: 0.5, text: 'Le wagon est rempli de paille ! Nuit de luxe.', statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.3, text: 'Le train se met en marche ! Réveil en sursaut.', statChanges: { sleep: 5, mental: -10 } },
        { probability: 0.2, text: 'Un contrôleur vous trouve. Amende de 5€.', statChanges: { sleep: 8, dignity: -10 } },
      ]},
      { text: 'Rester sur le quai', risk: 'safe', emoji: '🚉', outcomes: [
        { probability: 0.7, text: 'Le quai est abrité. Nuit passable.', statChanges: { sleep: 12 } },
        { probability: 0.3, text: 'Le vent s\'engouffre. Nuit froide.', statChanges: { sleep: 8, health: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-tente-fortune', title: 'La Tente de Fortune', type: 'narrative',
    image: '/assets/rest-tente-fortune-3Wjo7we5oS4ENU5hbyn6xd.webp',
    description: 'Avec des sacs poubelle et des bâtons, vous pouvez construire une tente.',
    choices: [
      { text: 'Construire la tente', risk: 'normal', emoji: '⛺', outcomes: [
        { probability: 0.6, text: 'Votre tente tient ! Nuit au sec, presque confortable.', statChanges: { sleep: 22, mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'La tente s\'effondre à 2h du matin. Retour à la case départ.', statChanges: { sleep: 8, mental: -5 } },
      ]},
      { text: 'Dormir sans tente', risk: 'safe', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'La nuit est douce. Pas besoin de tente finalement.', statChanges: { sleep: 15 } },
        { probability: 0.5, text: 'Il pleut. Vous regrettez de ne pas avoir construit la tente.', statChanges: { sleep: 5, health: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-musee-nuit', title: 'Le Musée la Nuit', type: 'narrative',
    image: '/assets/rest-musee-nuit-TRWpZcKL5eRM9F6cUsu5qv.webp',
    description: 'Le musée ferme ses portes. Mais vous connaissez une entrée de service...',
    choices: [
      { text: 'Se cacher dans le musée', risk: 'risky', emoji: '🏛️', outcomes: [
        { probability: 0.3, text: 'Nuit au musée ! Vous dormez devant un Monet. Classe.', statChanges: { sleep: 25, mental: 15, dignity: 10 } },
        { probability: 0.4, text: 'L\'alarme se déclenche ! Course-poursuite avec le gardien.', statChanges: { sleep: -5, mental: -8, dignity: -5 } },
        { probability: 0.3, text: 'Vous trouvez le vestiaire du personnel. Canapé et café !', statChanges: { sleep: 22, thirst: 10, mental: 8 } },
      ]},
      { text: 'Dormir devant le musée', risk: 'safe', emoji: '🏛️', outcomes: [
        { probability: 0.7, text: 'L\'auvent du musée protège de la pluie. Nuit correcte.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Le gardien vous chasse. "Pas de SDF devant le musée !"', statChanges: { sleep: 5, dignity: -8 } },
      ]},
    ],
  },
  {
    id: 'rest-bibliotheque-nuit', title: 'La Bibliothèque la Nuit', type: 'narrative',
    image: '/assets/rest-bibliotheque-nuit-e4GzMrQe5jEJDeQou4BxEF.webp',
    description: 'La bibliothèque ferme. Mais la porte de derrière ne ferme pas bien...',
    choices: [
      { text: 'Se cacher dans la bibliothèque', risk: 'risky', emoji: '📚', outcomes: [
        { probability: 0.4, text: 'Nuit parmi les livres ! Vous lisez jusqu\'à vous endormir. Intellectuel.', statChanges: { sleep: 22, mental: 15 } },
        { probability: 0.6, text: 'Le système d\'alarme vous trahit. Le gardien arrive.', statChanges: { sleep: 5, dignity: -10, mental: -5 } },
      ]},
      { text: 'Dormir dans le jardin de la bibliothèque', risk: 'safe', emoji: '🌳', outcomes: [
        { probability: 0.7, text: 'Le jardin est calme et abrité. Bonne nuit.', statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: 'Les arroseurs automatiques se déclenchent à 4h. Douche froide.', statChanges: { sleep: 10, health: -3, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-container', title: 'Le Container Maritime', type: 'discovery',
    image: '/assets/rest-container-BMckVJDeMBxYKECCiDfLup.webp',
    description: 'Un container de chantier est ouvert. Sec, solide, à l\'abri de tout.',
    choices: [
      { text: 'Dormir dans le container', risk: 'normal', emoji: '📦', outcomes: [
        { probability: 0.6, text: 'Le container est parfait ! Insonorisé, sec, spacieux.', statChanges: { sleep: 25, mental: 5 } },
        { probability: 0.2, text: 'Quelqu\'un ferme le container pendant la nuit ! Panique au réveil.', statChanges: { sleep: 15, mental: -15 } },
        { probability: 0.2, text: 'Le container sent le poisson. Nuit nauséabonde.', statChanges: { sleep: 12, mental: -5 } },
      ]},
      { text: 'Utiliser le container comme abri de jour', risk: 'safe', emoji: '☀️', outcomes: [
        { probability: 0.8, text: 'Parfait pour stocker vos affaires et vous reposer.', statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.2, text: 'Le chantier reprend. Ouvriers surpris. Vous partez.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'rest-cabine-telephone', title: 'La Cabine Téléphonique', type: 'narrative',
    image: '/assets/rest-cabine-telephone-oCcEKE3RxAKWGf5xrjeMLz.webp',
    description: 'Une vieille cabine téléphonique. Étroite mais à l\'abri du vent et de la pluie.',
    choices: [
      { text: 'Dormir debout dans la cabine', risk: 'safe', emoji: '📞', outcomes: [
        { probability: 0.5, text: 'Vous dormez debout comme un cheval. Étonnamment reposant.', statChanges: { sleep: 12, mental: -2 } },
        { probability: 0.5, text: 'Impossible de dormir debout. Nuit blanche.', statChanges: { sleep: 3, mental: -5 } },
      ]},
      { text: 'S\'asseoir par terre dans la cabine', risk: 'safe', emoji: '🪑', outcomes: [
        { probability: 0.7, text: 'Recroquevillé mais au sec. Nuit passable.', statChanges: { sleep: 15 } },
        { probability: 0.3, text: 'Un ivrogne essaie d\'utiliser le téléphone. Réveil brutal.', statChanges: { sleep: 8, mental: -3 } },
      ]},
    ],
  },
];

// ============ TRAVEL EVENTS (30) ============
export const TRAVEL_EVENTS: GameEvent[] = [
  {
    id: 'travel-ruelle-sombre', title: 'La Ruelle Sombre', type: 'narrative',
    image: '/assets/travel-ruelle-sombre-kkju3xeeLBCHpbj63J2v27.webp',
    description: 'Un raccourci par une ruelle sombre. Ça sent le danger... et les poubelles.',
    choices: [
      { text: 'Prendre la ruelle', risk: 'risky', emoji: '🌑', outcomes: [
        { probability: 0.4, text: 'Raccourci efficace ! Vous trouvez même 3€ par terre.', statChanges: { mental: 3 }, moneyChange: 3 },
        { probability: 0.3, text: 'Cul-de-sac. Demi-tour obligatoire.', statChanges: { sleep: -3, mental: -3 } },
        { probability: 0.3, text: 'Un type louche vous barre le passage. "La bourse ou la vie !"', statChanges: { health: -5, dignity: -5, mental: -5 }, moneyChange: -5 },
      ]},
      { text: 'Contourner par la rue principale', risk: 'safe', emoji: '🛤️', outcomes: [
        { probability: 1.0, text: 'Plus long mais plus sûr. Vous profitez des vitrines.', statChanges: { mental: 2 } },
      ]},
      { text: 'Traverser tête haute, on vous connaît ici', risk: 'safe', emoji: '👑', requirements: { respect: 30 }, outcomes: [
        { probability: 0.7, text: 'Le type louche vous reconnaît et baisse les yeux. "Ah, c\'est toi… passe, passe." On ne touche pas à une légende de la rue.', statChanges: { mental: 8, dignity: 5 }, respectChange: 1 },
        { probability: 0.3, text: 'Un jeune vous salue d\'un signe de tête respectueux et vous glisse 4€. "Pour la route, chef."', statChanges: { mental: 6 }, moneyChange: 4 },
      ]},
    ],
  },
  {
    id: 'travel-tunnel-metro', title: 'Le Tunnel de Métro', type: 'narrative',
    image: '/assets/travel-tunnel-metro-8zaoahxSXU8Wrt9wxJGRRX.webp',
    description: 'Un tunnel de métro désaffecté. Sombre, humide, mais c\'est un raccourci.',
    choices: [
      { text: 'Traverser le tunnel', risk: 'risky', emoji: '🚇', outcomes: [
        { probability: 0.3, text: 'Vous traversez sans encombre. Frissons mais efficace.', statChanges: { mental: -2 } },
        { probability: 0.4, text: 'Des rats ! Des centaines de rats ! Vous courez.', statChanges: { health: -3, mental: -8, sleep: -3 } },
        { probability: 0.3, text: 'Vous trouvez un ancien campement avec des conserves.', statChanges: { hunger: 10, mental: 3 } },
      ]},
      { text: 'Prendre le métro normalement (si vous avez l\'argent)', risk: 'normal', emoji: '🎫', outcomes: [
        { probability: 0.6, text: 'Trajet confortable. Presque comme un citoyen normal.', statChanges: { mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'Contrôle ! Pas de ticket. Amende de 5€.', statChanges: { dignity: -10, mental: -5 }, moneyChange: -5 },
      ]},
    ],
  },
  {
    id: 'travel-parc-nuit', title: 'Le Parc la Nuit', type: 'narrative',
    image: '/assets/travel-parc-nuit-HKdnTyPJxjUGL9aq8yv6ym.webp',
    description: 'Traverser le parc de nuit. Les lampadaires sont en panne.',
    choices: [
      { text: 'Traverser dans le noir', risk: 'normal', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'Traversée sans encombre. Les étoiles guident vos pas.', statChanges: { mental: 5 } },
        { probability: 0.3, text: 'Vous trébuchez sur une racine. Genou en sang.', statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: 'Un hibou hulule. Vous sursautez et tombez dans un buisson.', statChanges: { health: -2, dignity: -3 } },
      ]},
      { text: 'Faire le tour par les rues éclairées', risk: 'safe', emoji: '💡', outcomes: [
        { probability: 1.0, text: 'Plus long mais vous arrivez entier.', statChanges: { sleep: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-pont-autoroute', title: 'Le Pont de l\'Autoroute', type: 'narrative',
    image: '/assets/travel-pont-autoroute-Kp7ZJJXx5GyopiPDDNjVhC.webp',
    description: 'Le pont au-dessus de l\'autoroute. Bruyant, venteux, mais c\'est le chemin le plus court.',
    choices: [
      { text: 'Traverser le pont', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 0.7, text: 'Le vent est violent mais vous tenez bon. Vue impressionnante.', statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Le vent emporte votre chapeau (si vous en avez un). Adieu.', statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Passer sous le pont', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.5, text: 'Sous le pont, d\'autres SDF ont un feu. Ils partagent leur soupe.', statChanges: { hunger: 10, mental: 8, thirst: 5 } },
        { probability: 0.5, text: '"C\'est notre territoire." Pas les bienvenus.', statChanges: { mental: -5, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-marche-matin', title: 'Le Marché du Matin', type: 'discovery',
    image: '/assets/travel-marche-matin-UBjudamtA3vaA6pmwtFA3V.webp',
    description: 'Le marché s\'installe. Les commerçants déchargent leurs camions.',
    choices: [
      { text: 'Aider à décharger', risk: 'normal', emoji: '💪', outcomes: [
        { probability: 0.6, text: 'Un maraîcher vous paie 4€ et vous donne des fruits abîmés.', statChanges: { hunger: 15, dignity: 5, sleep: -3 }, moneyChange: 4 },
        { probability: 0.4, text: '"On n\'a pas besoin d\'aide." Mais vous chapardez une pomme.', statChanges: { hunger: 5, dignity: -3 } },
      ]},
      { text: 'Récupérer les fruits tombés', risk: 'safe', emoji: '🍎', outcomes: [
        { probability: 0.7, text: 'Pommes, oranges, une banane. Petit déjeuner gratuit !', statChanges: { hunger: 12, mental: 5 } },
        { probability: 0.3, text: 'Un commerçant vous crie dessus. "Touche pas à ma marchandise !"', statChanges: { dignity: -5, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-gare-routiere', title: 'La Gare Routière', type: 'narrative',
    image: '/assets/travel-gare-routiere-DaYuWGLLqaQsSrZHHQEV8Z.webp',
    description: 'La gare routière est animée. Des bus partent vers d\'autres villes.',
    choices: [
      { text: 'Monter dans un bus sans payer', risk: 'risky', emoji: '🚌', outcomes: [
        { probability: 0.3, text: 'Vous vous faufilez ! Trajet gratuit et chauffé.', statChanges: { mental: 5, sleep: 5 } },
        { probability: 0.7, text: 'Le chauffeur vous repère. "Descends ou j\'appelle les flics."', statChanges: { dignity: -10, mental: -5 } },
      ]},
      { text: 'Attendre dans la salle d\'attente chauffée', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.8, text: '2h au chaud. Toilettes gratuites. Pas mal.', statChanges: { sleep: 8, thirst: 5, dignity: 3 } },
        { probability: 0.2, text: 'Un agent vous demande votre billet. Pas de billet, pas de salle.', statChanges: { dignity: -5 } },
      ]},
    ],
  },
  {
    id: 'travel-velo-trouve', title: 'Le Vélo Trouvé', type: 'discovery',
    image: '/assets/travel-velo-trouve-Rp3Mv8FMSxvhqiT2kp8SeL.webp',
    description: 'Un vélo sans antivol est posé contre un mur. Tentant...',
    choices: [
      { text: 'Emprunter le vélo', risk: 'risky', emoji: '🚲', outcomes: [
        { probability: 0.4, text: 'Vous pédalez à toute vitesse ! Trajet rapide et grisant.', statChanges: { mental: 8, sleep: -2 } },
        { probability: 0.6, text: 'Le propriétaire vous court après. "Mon vélo !" Vous le rendez, essoufflé.', statChanges: { dignity: -10, mental: -5, sleep: -5 } },
      ]},
      { text: 'Le laisser et marcher', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1.0, text: 'L\'honnêteté, c\'est tout ce qui vous reste. Vous marchez la tête haute.', statChanges: { dignity: 3, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-chantier-nuit', title: 'Le Chantier de Nuit', type: 'narrative',
    image: '/assets/travel-chantier-nuit-gB3qPEuPg6F49zbknTKjeU.webp',
    description: 'Un chantier de construction. La nuit, personne ne surveille.',
    choices: [
      { text: 'Traverser le chantier', risk: 'normal', emoji: '🏗️', outcomes: [
        { probability: 0.5, text: 'Raccourci efficace. Vous trouvez un casque de chantier.', statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Vous vous prenez les pieds dans un câble. Chute.', statChanges: { health: -5, mental: -3 } },
        { probability: 0.2, text: 'Le gardien de nuit ! "Hé ! Qu\'est-ce que vous faites là ?!"', statChanges: { dignity: -5, mental: -5 } },
      ]},
      { text: 'Contourner le chantier', risk: 'safe', emoji: '🔄', outcomes: [
        { probability: 1.0, text: 'Le détour ajoute 15 minutes mais vous êtes en sécurité.', statChanges: { sleep: -2 } },
      ]},
    ],
  },
  {
    id: 'travel-riviere', title: 'La Rivière', type: 'narrative',
    image: '/assets/travel-riviere-73CPTDVdUhEB8JSCGFD5xk.webp',
    description: 'La rivière coupe votre chemin. Le pont est à 500m, mais vous pourriez traverser à gué.',
    choices: [
      { text: 'Traverser à gué', risk: 'risky', emoji: '🌊', outcomes: [
        { probability: 0.3, text: 'L\'eau est peu profonde ! Vous traversez les pieds mouillés mais rapidement.', statChanges: { health: -2, mental: 3 } },
        { probability: 0.4, text: 'Plus profond que prévu ! Vous êtes trempé jusqu\'à la taille.', statChanges: { health: -5, dignity: -5 } },
        { probability: 0.3, text: 'Le courant est fort ! Vous manquez de tomber. Effrayant.', statChanges: { health: -8, mental: -8 } },
      ]},
      { text: 'Prendre le pont', risk: 'safe', emoji: '🌉', outcomes: [
        { probability: 1.0, text: 'Le pont est sûr. Vous regardez l\'eau couler en dessous. Méditatif.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'travel-tramway', title: 'Le Tramway', type: 'narrative',
    image: '/assets/travel-tramway-RwMPRjHnfokerBZDaByMA9.webp',
    description: 'Le tramway passe. Vous pourriez monter sans payer...',
    choices: [
      { text: 'Monter sans ticket', risk: 'risky', emoji: '🚊', outcomes: [
        { probability: 0.5, text: 'Trajet tranquille. Personne ne contrôle.', statChanges: { mental: 5, sleep: 3 } },
        { probability: 0.5, text: 'Contrôle ! "Votre titre de transport ?" Amende de 5€.', statChanges: { dignity: -8, mental: -5 }, moneyChange: -5 },
      ]},
      { text: 'Marcher le long des rails', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 0.8, text: 'Balade agréable le long des rails. Vous arrivez à destination.', statChanges: { mental: 3 } },
        { probability: 0.2, text: 'Vous vous perdez. Le tramway ne va pas où vous pensiez.', statChanges: { mental: -3, sleep: -3 } },
      ]},
    ],
  },
  {
    id: 'travel-skateboard', title: 'Le Skateboard Trouvé', type: 'discovery',
    image: '/assets/travel-skateboard-jb8FwsquDYya2TAppoZNmo.webp',
    description: 'Un skateboard abandonné sur le trottoir. Les roues tournent encore.',
    choices: [
      { text: 'Utiliser le skateboard', risk: 'normal', emoji: '🛹', outcomes: [
        { probability: 0.5, text: 'Vous roulez ! C\'est plus rapide que marcher. Et plutôt fun.', statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: 'Vous tombez après 50 mètres. Vos genoux s\'en souviennent.', statChanges: { health: -5, dignity: -5 } },
      ]},
      { text: 'Le vendre', risk: 'safe', emoji: '💰', outcomes: [
        { probability: 0.6, text: 'Un ado vous l\'achète 5€. Business.', statChanges: { mental: 3 }, moneyChange: 5 },
        { probability: 0.4, text: 'Personne n\'en veut. Vous le laissez.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'travel-egout', title: 'Les Égouts', type: 'narrative',
    image: '/assets/travel-egout-EaEg5VZENML2osawgbXA7E.webp',
    description: 'Une bouche d\'égout ouverte. Le raccourci ultime... si vous supportez l\'odeur.',
    choices: [
      { text: 'Descendre dans les égouts', risk: 'risky', emoji: '🕳️', outcomes: [
        { probability: 0.3, text: 'Vous traversez rapidement. L\'odeur est atroce mais c\'est efficace.', statChanges: { dignity: -10, mental: -3 } },
        { probability: 0.4, text: 'Vous vous perdez dans le labyrinthe souterrain. 2h de marche.', statChanges: { sleep: -8, mental: -8, dignity: -5 } },
        { probability: 0.3, text: 'Vous trouvez un passage secret vers une cave de restaurant !', statChanges: { hunger: 15, mental: 5 } },
      ]},
      { text: 'Rester en surface', risk: 'safe', emoji: '☀️', outcomes: [
        { probability: 1.0, text: 'Vous gardez votre dignité et vos narines intactes.', statChanges: { mental: 2, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'travel-bus-nuit', title: 'Le Bus de Nuit', type: 'narrative',
    image: '/assets/travel-bus-nuit-QnRsg4teZWjpTKm79GJXx3.webp',
    description: 'Le bus de nuit passe. Dernier service. Presque vide.',
    choices: [
      { text: 'Monter et faire semblant de dormir', risk: 'normal', emoji: '🚌', outcomes: [
        { probability: 0.6, text: 'Le chauffeur ne dit rien. Vous faites l\'aller-retour au chaud.', statChanges: { sleep: 10, mental: 5 } },
        { probability: 0.4, text: '"Terminus ! Tout le monde descend !" Trajet trop court.', statChanges: { sleep: 5 } },
      ]},
      { text: 'Demander au chauffeur de vous déposer', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.5, text: '"Allez, monte." Chauffeur sympa. Trajet gratuit.', statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: '"Pas de ticket, pas de bus." Strict mais juste.', statChanges: { mental: -3 } },
      ]},
    ],
  },
];

// ============ FOLLOW-UP EVENTS (Chaînes Narratives) ============
export const FOLLOW_UP_EVENTS: Record<string, GameEvent> = {
  'exp-jardin-communautaire-suite': {
    id: 'exp-jardin-communautaire-suite', title: 'Le Retour au Jardin', type: 'social',
    image: '/assets/exp-jardin-communautaire-3JrXyisaVTMS5u7ATazzZ7.webp',
    isFollowUp: true, requiresFlag: 'ami-jardinier',
    description: 'Le vieux jardinier vous attendait ! "Ah, te revoilà ! J\'ai quelque chose pour toi."',
    choices: [
      { text: 'Accepter son cadeau', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 0.8, text: 'Il vous donne un panier de légumes et vous apprend à faire pousser des tomates. "Reviens quand tu veux, petit."', statChanges: { hunger: 25, mental: 15, dignity: 8 }, respectChange: 3, addFlag: 'jardinier-mentor' },
        { probability: 0.2, text: 'Il vous donne des graines. "Plante ça quelque part. Ça te donnera un but."', statChanges: { mental: 10 }, itemGain: { id: 'graines-tomate', name: 'Graines de tomate', emoji: '🍅', type: 'tool', value: 5 } },
      ]},
      { text: 'Proposer de travailler régulièrement', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 1, text: 'Il accepte ! Vous avez un "emploi" de jardinier bénévole. Repas inclus.', statChanges: { hunger: 20, mental: 12, dignity: 10 }, respectChange: 5, addFlag: 'emploi-jardin' },
      ]},
    ],
  },
  'exp-vieille-dame-suite': {
    id: 'exp-vieille-dame-suite', title: 'La Grand-Mère Reconnaissante', type: 'social',
    image: '/assets/exp-salon-coiffure-hsCZe2EwRcYAdN4ZmNo9Bf.webp',
    isFollowUp: true, requiresFlag: 'hero-enfant',
    description: 'Une vieille dame vous interpelle. "C\'est vous qui avez aidé mon petit-fils ! Je vous ai cherché partout !"',
    choices: [
      { text: 'Accepter sa gratitude', risk: 'safe', emoji: '🤗', outcomes: [
        { probability: 0.7, text: 'Elle vous invite chez elle pour un repas chaud. Soupe, pain, fromage, et un lit pour la nuit. Vous pleurez de gratitude.', statChanges: { hunger: 30, thirst: 20, sleep: 25, mental: 20, dignity: 10 }, moneyChange: 10, respectChange: 5 },
        { probability: 0.3, text: 'Elle vous donne 20€ et l\'adresse d\'un foyer. "Prenez soin de vous."', moneyChange: 20, statChanges: { mental: 15, dignity: 8 }, respectChange: 3 },
      ]},
    ],
  },
  'exp-pecheur-suite': {
    id: 'exp-pecheur-suite', title: 'La Partie de Pêche', type: 'social',
    image: '/assets/exp-pecheur-canal-Fq76sjmm34RTZJ7qBYMRq5.webp',
    isFollowUp: true, requiresFlag: 'ami-pecheur',
    description: 'Le pêcheur du canal vous fait signe. "Hé ! J\'ai apporté une canne pour toi !"',
    choices: [
      { text: 'Pêcher ensemble', risk: 'safe', emoji: '🎣', outcomes: [
        { probability: 0.6, text: 'Vous attrapez 3 poissons ! Le pêcheur vous apprend à les cuisiner sur un feu de camp. Festin !', statChanges: { hunger: 25, mental: 15, dignity: 5 }, respectChange: 3 },
        { probability: 0.4, text: 'Bredouille, mais le pêcheur partage sa prise. "La prochaine fois, tu auras plus de chance."', statChanges: { hunger: 15, mental: 10 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-brocante-suite': {
    id: 'exp-brocante-suite', title: 'Le Trésor du Brocanteur', type: 'discovery',
    image: '/assets/exp-brocante-m4p7AaRkiCTHLZmNAAEVB6.webp',
    isFollowUp: true, requiresFlag: 'ami-brocanteur',
    description: 'Le brocanteur vous appelle. "J\'ai trouvé un truc qui pourrait t\'intéresser !"',
    choices: [
      { text: 'Voir ce qu\'il a trouvé', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 0.5, text: 'Un vieux smartphone qui marche encore ! "Cadeau. T\'as été réglo avec moi."', statChanges: { mental: 15, dignity: 8 }, itemGain: { id: 'smartphone', name: 'Vieux smartphone', emoji: '📱', type: 'special', value: 25 }, respectChange: 3 },
        { probability: 0.5, text: 'Un manteau d\'hiver en bon état. "Ça va te tenir chaud."', statChanges: { health: 5, mental: 10, dignity: 8 }, itemGain: { id: 'manteau-hiver', name: 'Manteau d\'hiver', emoji: '🧥', type: 'armor', value: 20, defenseBonus: 3 } },
      ]},
    ],
  },
  'exp-musicien-suite': {
    id: 'exp-musicien-suite', title: 'Le Duo Musical', type: 'social',
    image: '/assets/beg-musicien-metro-HSvL64qd5MQEG4Qnsz4oiV.webp',
    isFollowUp: true, requiresFlag: 'ami-musicien',
    description: 'Le musicien du métro vous reconnaît ! "Hé ! On refait un duo ? J\'ai gagné le double la dernière fois !"',
    choices: [
      { text: 'Former un duo régulier', risk: 'safe', emoji: '🎵', outcomes: [
        { probability: 0.7, text: 'Votre duo fait sensation ! Les passagers adorent. 12€ partagés et une standing ovation.', moneyChange: 12, statChanges: { mental: 15, dignity: 10 }, respectChange: 5 },
        { probability: 0.3, text: 'Journée calme, peu de monde. 4€ quand même. "On se refait ça demain ?"', moneyChange: 4, statChanges: { mental: 8, dignity: 5 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-dechetterie-suite': {
    id: 'exp-dechetterie-suite', title: 'Le Roi de la Récup', type: 'discovery',
    image: '/assets/exp-dechetterie-ik2udBVSfScmWvCMJtUpZE.webp',
    isFollowUp: true, requiresFlag: 'roi-dechetterie',
    description: 'Vous retournez à la déchetterie. Le gardien vous fait signe. "J\'ai mis des trucs de côté pour toi !"',
    choices: [
      { text: 'Voir la sélection', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 0.6, text: 'Un vélo réparable, des vêtements propres, et un réchaud de camping ! Jackpot !', statChanges: { mental: 15, dignity: 10 }, itemGain: { id: 'rechaud', name: 'Réchaud de camping', emoji: '🔥', type: 'tool', value: 15 }, respectChange: 3 },
        { probability: 0.4, text: 'Des livres, une lampe torche, et un sac à dos. Équipement de survie !', statChanges: { mental: 10, dignity: 5 }, itemGain: { id: 'sac-dos', name: 'Sac à dos', emoji: '🎒', type: 'tool', value: 12 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-chat-revient': {
    id: 'exp-chat-revient', title: 'Le Retour du Chat', type: 'social',
    image: '/assets/exp-bagarre-chats-Dgd3ncPRiSTGHjXXHy6SUT.webp',
    isFollowUp: true, requiresFlag: 'chat-compagnon',
    description: 'Le chat que vous avez sauvé revient ! Il porte quelque chose dans sa gueule...',
    choices: [
      { text: 'Voir ce qu\'il apporte', risk: 'safe', emoji: '🐱', outcomes: [
        { probability: 0.5, text: 'Un billet de 5€ ! Le chat l\'a trouvé quelque part. Meilleur investissement de votre vie.', moneyChange: 5, statChanges: { mental: 12 } },
        { probability: 0.3, text: 'Un oiseau mort. C\'est... un cadeau ? Le chat ronronne fièrement.', statChanges: { mental: 5, dignity: -3 } },
        { probability: 0.2, text: 'Une souris vivante ! Le chat la lâche sur vos genoux. AAAH !', statChanges: { mental: -3, health: -1 } },
      ]},
    ],
  },
  'exp-foyer-accueil': {
    id: 'exp-foyer-accueil', title: 'Le Foyer d\'Accueil', type: 'social',
    image: '/assets/beg-mairie-eey6rmfrqRvxmw634LjgzZ.webp',
    isFollowUp: true, requiresFlag: 'aide-mairie',
    description: 'Grâce aux informations de la mairie, vous trouvez un foyer d\'accueil. La porte est ouverte.',
    choices: [
      { text: 'Entrer et demander de l\'aide', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.8, text: 'Douche chaude, repas complet, lit propre. Vous dormez 10h d\'affilée. Renaissance.', statChanges: { health: 15, hunger: 30, thirst: 25, sleep: 30, mental: 20, dignity: 15 }, respectChange: 3 },
        { probability: 0.2, text: 'Le foyer est complet. Mais ils vous donnent un sandwich et l\'adresse d\'un autre foyer.', statChanges: { hunger: 12, mental: 5 } },
      ]},
    ],
  },
  // ---- Suites des « graines narratives » longtemps orphelines : chaque flag
  // posé par un événement trouve enfin son « plus tard ». Les one-shot
  // consomment leur flag (removeFlag), les rituels le gardent. ----
  'exp-velo-suite': {
    id: 'exp-velo-suite', title: 'L\'Offre pour le Vélo', type: 'social',
    image: '/assets/followup-velo.webp',
    isFollowUp: true, requiresFlag: 'a-velo',
    description: 'Un étudiant lorgne votre vélo rafistolé au fil de fer. "Il roule ? Je vous en donne quelque chose !"',
    choices: [
      { text: 'Vendre le vélo', risk: 'safe', emoji: '💶', outcomes: [
        { probability: 0.7, text: 'Marché conclu : 8€. Il repart en zigzaguant, les freins, c\'était en option.', moneyChange: 8, statChanges: { mental: -3 }, removeFlag: 'a-velo' },
        { probability: 0.3, text: 'Il négocie dur : 5€. Vous cédez. Le fil de fer, ça n\'a pas de prix. Enfin si : 5€.', moneyChange: 5, statChanges: { mental: -3 }, removeFlag: 'a-velo' },
      ]},
      { text: 'Refuser, ce vélo, c\'est la liberté', risk: 'safe', emoji: '🚲', outcomes: [
        { probability: 1, text: 'Il hausse les épaules et s\'en va. Vous caressez le guidon. Vous, au moins, vous vous comprenez.', statChanges: { mental: 6, dignity: 3 } },
      ]},
    ],
  },
  'exp-eglise-suite': {
    id: 'exp-eglise-suite', title: 'La Soupe du Curé', type: 'social',
    image: '/assets/followup-eglise.webp',
    isFollowUp: true, requiresFlag: 'aide-eglise',
    description: 'Le prêtre vous reconnaît sur le parvis. "Notre ami ! La soupe est chaude, entrez donc."',
    choices: [
      { text: 'Accepter la soupe', risk: 'safe', emoji: '🍲', outcomes: [
        { probability: 0.7, text: 'Soupe épaisse, pain frais, banc au chaud. Le curé ne demande rien en échange. Ça repose.', statChanges: { hunger: 18, thirst: 8, mental: 8 } },
        { probability: 0.3, text: 'La soupe est claire comme l\'eau bénite, mais la compagnie réchauffe.', statChanges: { hunger: 8, mental: 6 } },
      ]},
      { text: 'Aider à servir d\'abord', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 1, text: 'Vous servez les autres avant de vous servir. Le curé vous glisse une part double et un clin d\'œil.', statChanges: { hunger: 22, mental: 10, dignity: 8 }, respectChange: 2 },
      ]},
    ],
  },
  'exp-gardien-suite': {
    id: 'exp-gardien-suite', title: 'Le Café du Gardien', type: 'social',
    image: '/assets/followup-gardien.webp',
    isFollowUp: true, requiresFlag: 'ami-gardien-dechetterie',
    description: 'Le gardien de la déchetterie vous hèle depuis sa guérite. "Pause café ? J\'ai un truc à te montrer, aussi."',
    choices: [
      { text: 'Partager le café', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 0.6, text: 'Café brûlant, biscuits mous, et une radio en état de marche « tombée du camion ». Belle matinée.', statChanges: { thirst: 12, mental: 10 }, itemGain: { id: 'radio-guerite', name: 'Radio de guérite', emoji: '📻', type: 'junk', value: 8 }, removeFlag: 'ami-gardien-dechetterie' },
        { probability: 0.4, text: 'Le café est infect mais l\'amitié sincère. Il vous garde une place au chaud pour les jours de pluie.', statChanges: { thirst: 8, mental: 12 }, removeFlag: 'ami-gardien-dechetterie' },
      ]},
    ],
  },
  'exp-toit-suite': {
    id: 'exp-toit-suite', title: 'Votre Toit', type: 'discovery',
    image: '/assets/followup-toit.webp',
    isFollowUp: true, requiresFlag: 'camp-toit',
    description: 'Votre planque sur le toit vous attend. La ville scintille en carton, et personne ne sait que vous êtes là.',
    choices: [
      { text: 'Y passer la nuit', risk: 'normal', emoji: '🌃', outcomes: [
        { probability: 0.75, text: 'Nuit étoilée au-dessus du vacarme. Vous dormez comme un roi, du carton, mais un roi.', statChanges: { sleep: 20, mental: 12 } },
        { probability: 0.25, text: 'Le concierge fait sa ronde ! Vous dévalez l\'escalier de service, le cœur à 200. Planque grillée.', statChanges: { mental: -5, sleep: -3 }, removeFlag: 'camp-toit' },
      ]},
      { text: 'Juste souffler dix minutes', risk: 'safe', emoji: '🌇', outcomes: [
        { probability: 1, text: 'Dix minutes de silence au-dessus de la ville. Ça ne répare rien, mais ça recolle les morceaux.', statChanges: { mental: 8 } },
      ]},
    ],
  },
  'exp-emploi-jardin-suite': {
    id: 'exp-emploi-jardin-suite', title: 'Journée au Jardin', type: 'social',
    image: '/assets/followup-emploi-jardin.webp',
    isFollowUp: true, requiresFlag: 'emploi-jardin',
    description: '"T\'es en retard," grogne le vieux jardinier en vous tendant une bêche. Votre « emploi » vous attend.',
    choices: [
      { text: 'Travailler dur', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 0.7, text: 'Une matinée à biner, un repas chaud, et quelques pièces « pour le dérangement ».', statChanges: { hunger: 15, mental: 8, dignity: 6 }, moneyChange: 4 },
        { probability: 0.3, text: 'Le dos proteste, mais le potager est superbe. Le jardinier vous paie en légumes.', statChanges: { hunger: 18, health: -3, dignity: 5 } },
      ]},
      { text: 'Travailler mollement', risk: 'normal', emoji: '🦥', outcomes: [
        { probability: 0.6, text: 'Il fait semblant de ne pas voir. Repas quand même, mais pas de pièces.', statChanges: { hunger: 10, mental: 4 } },
        { probability: 0.4, text: '"Si c\'est comme ça, reviens quand tu seras motivé." Vexant. Juste, mais vexant.', statChanges: { mental: -4, dignity: -3 } },
      ]},
    ],
  },
  'exp-mentor-suite': {
    id: 'exp-mentor-suite', title: 'Vos Tomates', type: 'discovery',
    image: '/assets/followup-tomates.webp',
    isFollowUp: true, requiresFlag: 'jardinier-mentor',
    description: 'Le coin de terre que le vieux vous a appris à cultiver a bien travaillé : des tomates. Des vraies. Les vôtres.',
    choices: [
      { text: 'Récolter fièrement', risk: 'safe', emoji: '🍅', outcomes: [
        { probability: 0.8, text: 'Trois tomates parfaites. Vous en mangez une sur place, tiède de soleil. Vous avez FAIT quelque chose.', statChanges: { hunger: 14, mental: 14, dignity: 6 } },
        { probability: 0.2, text: 'Les pigeons sont passés avant vous. Il reste une demi-tomate. La rage.', statChanges: { hunger: 4, mental: -4 } },
      ]},
      { text: 'En offrir au jardinier', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 1, text: '"Pas mal, gamin." Venant de lui, c\'est une médaille. Vous partagez le déjeuner.', statChanges: { hunger: 12, mental: 10 }, respectChange: 3 },
      ]},
    ],
  },
  'exp-magasin-suite': {
    id: 'exp-magasin-suite', title: 'La Porte de Derrière', type: 'narrative',
    image: '/assets/followup-magasin.webp',
    isFollowUp: true, requiresFlag: 'magasin-repere',
    description: 'Le magasin abandonné, la porte arrière entrouverte. Vous l\'aviez notée « pour plus tard ». Plus tard, c\'est maintenant.',
    choices: [
      { text: 'Entrer discrètement', risk: 'risky', emoji: '🚪', outcomes: [
        { probability: 0.5, text: 'À l\'intérieur : des invendus oubliés ! Vous repartez chargé comme un mulet.', moneyChange: 10, statChanges: { dignity: -4 }, itemGain: { id: 'carton-invendus', name: 'Carton d\'invendus', emoji: '📦', type: 'food', value: 8, effect: { hunger: 20 } }, removeFlag: 'magasin-repere' },
        { probability: 0.3, text: 'Rien que de la poussière et des mannequins qui vous jugent. Vous repartez bredouille et vaguement humilié.', statChanges: { mental: -4 }, removeFlag: 'magasin-repere' },
        { probability: 0.2, text: 'Une alarme oubliée hurle ! Vous fuyez ventre à terre, poursuivi par le fantôme du commerce de proximité.', statChanges: { mental: -8, dignity: -6, health: -4 }, respectChange: -2, removeFlag: 'magasin-repere' },
      ]},
      { text: 'Renoncer, trop risqué', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous passez votre chemin. La porte restera un « et si » de plus dans votre collection.', statChanges: { mental: -2 }, removeFlag: 'magasin-repere' },
      ]},
    ],
  },
};

// ============ LE SURSAUT ============
// Une seule fois par run : quand la santé ou le mental frôle le zéro, un
// souvenir remonte. La quasi-mort devient un moment de récit, pas une spirale.
export const SURSAUT_EVENT: GameEvent = {
  id: 'sursaut', title: 'Le Sursaut', type: 'narrative',
  description: 'Au bord du gouffre, quelque chose remonte : un souvenir, un visage, une promesse. Vous vous rappelez pourquoi vous tenez encore debout.',
  choices: [
    { text: 'S\'accrocher au souvenir', risk: 'safe', emoji: '💫', outcomes: [
      { probability: 1, text: 'Le souvenir brûle comme un petit feu intérieur. Pas aujourd\'hui. Pas comme ça.', statChanges: { mental: 18, health: 8, dignity: 5 }, addFlag: 'sursaut-vu' },
    ]},
    { text: 'Pleurer un bon coup', risk: 'safe', emoji: '😭', outcomes: [
      { probability: 1, text: 'Ça vide, et ça lave. Vous vous relevez plus léger, étrangement.', statChanges: { mental: 14, sleep: 6 }, addFlag: 'sursaut-vu' },
    ]},
  ],
};

// Le Sursaut doit-il interrompre l'action ? (une seule fois par run)
export function dueSursaut(c: Character): boolean {
  return (c.stats.health < 12 || c.stats.mental < 12) && c.stats.health > 0 && c.stats.mental > 0 && !c.activeFlags.includes('sursaut-vu');
}

// ============ GÉNÉRATEURS D'ÉVÉNEMENTS ============

// ---- Fusion de la vague 2 ----
// Les gros lots supplémentaires vivent dans events2-*.ts (fichiers dédiés,
// pour ne pas recréer un monolithe ici) et rejoignent les pools au chargement.
EXPLORE_EVENTS.push(...EXPLORE_EVENTS_2);
REST_EVENTS.push(...REST_EVENTS_2);
BEG_EVENTS.push(...BEG_EVENTS_2);

// ---- Mémoire anti-répétition ----
// On retient les N derniers événements vus (toutes actions confondues) et on
// les écarte du tirage, pour que jour après jour ça ne tourne pas en rond.
// Élargie avec la vague 2 : des pools de 70-80 supportent une mémoire longue.
const RECENT_MEMORY = 12;
export function freshPool(pool: GameEvent[], recent: string[] | undefined): GameEvent[] {
  if (!recent || recent.length === 0) return pool;
  const fresh = pool.filter(e => !recent.includes(e.id));
  // Garde-fou petits pools : on n'exclut jamais au point de ne (presque) plus
  // rien laisser (ex. vol = 6 événements).
  return fresh.length >= Math.min(3, pool.length) ? fresh : pool;
}
export function rememberEvent(recent: string[] | undefined, id: string): string[] {
  return [...(recent || []), id].slice(-RECENT_MEMORY);
}

// Les fantômes du Cimetière : un ancien personnage (mort) laisse une trace
// dans la run en cours. Défaites passées → petits coups de main présents.
function makeGhostEvent(grave: Grave): GameEvent {
  const n = grave.name;
  const templates: GameEvent[] = [
    {
      id: 'ghost-banc', title: L(`Le Banc de ${n}`, `${n}'s Bench`), type: 'discovery', isFollowUp: true,
      description: L(`Vous reconnaissez ce banc : c'est là que dormait ${n}, avant. Quelqu'un y a gravé ses initiales.`, `You know this bench: it's where ${n} used to sleep. Someone carved their initials into it.`),
      choices: [
        { text: L('S\'y reposer un moment', 'Rest there a while'), risk: 'safe', emoji: '🪑', outcomes: [
          { probability: 0.7, text: L(`Le coin est bon, ${n} savait choisir. Vous repartez apaisé, et vous trouvez une pièce sous une latte.`, `A good spot, ${n} knew how to pick them. You leave calmer, and find a coin under a slat.`), statChanges: { mental: 8, sleep: 6 }, moneyChange: 1 },
          { probability: 0.3, text: L('Un moment de paix. Les absents veillent, à leur façon.', 'A moment of peace. The departed keep watch, in their way.'), statChanges: { mental: 10 } },
        ]},
        { text: L('Se recueillir et passer son chemin', 'Pay respects and move on'), risk: 'safe', emoji: '🕯️', outcomes: [
          { probability: 1, text: L('Vous saluez la mémoire du prédécesseur. La rue respecte ceux qui se souviennent.', 'You honor your predecessor\'s memory. The street respects those who remember.'), statChanges: { mental: 5, dignity: 4 }, respectChange: 1 },
        ]},
      ],
    },
    {
      id: 'ghost-souvenir', title: L('Quelqu\'un se souvient', 'Someone Remembers'), type: 'social', isFollowUp: true,
      description: L(`Une passante vous dévisage : « Vous connaissiez ${n}, non ? Un brave. Tenez, pour la route. »`, `A passer-by studies you: "You knew ${n}, right? Good soul. Here, for the road."`),
      choices: [
        { text: L('Accepter avec dignité', 'Accept with dignity'), risk: 'safe', emoji: '🤝', outcomes: [
          { probability: 0.6, text: L(`Elle vous glisse 3€ et un sourire triste. La mémoire de ${n} nourrit encore.`, `She slips you €3 and a sad smile. ${n}'s memory still provides.`), moneyChange: 3, statChanges: { mental: 6 } },
          { probability: 0.4, text: L('Elle vous tend un sandwich sous cellophane. « Il aimait ceux au thon. »', 'She hands you a wrapped sandwich. "He liked the tuna ones."'), statChanges: { hunger: 14, mental: 5 } },
        ]},
      ],
    },
    {
      id: 'ghost-echo', title: L('L\'Écho de la Rue', 'Echo of the Street'), type: 'discovery', isFollowUp: true,
      description: L(`Sur un mur, au feutre : « ${n} était là. » La rue n'oublie pas ses rois.`, `On a wall, in marker: "${n} was here." The street doesn't forget its kings.`),
      choices: [
        { text: L('Ajouter votre nom dessous', 'Add your name below'), risk: 'safe', emoji: '🖊️', outcomes: [
          { probability: 1, text: L('Deux noms sur un mur. Une dynastie de carton. Étrangement, ça donne du courage.', 'Two names on a wall. A cardboard dynasty. Strangely, it gives you heart.'), statChanges: { mental: 9, dignity: 3 }, respectChange: 1 },
        ]},
      ],
    },
  ];
  return randomFromArray(templates);
}

export function generateEvents(_location: string, character: Character): GameEvent[] {
  // Check for pending follow-up events first
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e =>
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  // 30% chance to trigger a follow-up if available
  const freshFollowUps = availableFollowUps.filter(e => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.3) {
    return [randomFromArray(freshFollowUps)];
  }
  // Sinon, parfois, un fantôme du Cimetière (8 %), les morts rendent service.
  const graves = loadGraves().filter(g => g.name !== character.name);
  if (graves.length > 0 && Math.random() < 0.08) {
    return [makeGhostEvent(randomFromArray(graves))];
  }
  // Otherwise return random explore events
  const shuffled = [...freshPool(EXPLORE_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export function generateBegEvents(_location: string, character: Character): GameEvent[] {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e =>
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  const freshFollowUps = availableFollowUps.filter(e => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.25) {
    return [randomFromArray(freshFollowUps)];
  }
  const shuffled = [...freshPool(BEG_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

export function generateRestEvents(_location: string, character: Character): GameEvent[] {
  const availableFollowUps = Object.values(FOLLOW_UP_EVENTS).filter(e =>
    e.requiresFlag && character.activeFlags.includes(e.requiresFlag)
  );
  const freshFollowUps = availableFollowUps.filter(e => !character.recentEvents?.includes(e.id));
  if (freshFollowUps.length > 0 && Math.random() < 0.2) {
    return [randomFromArray(freshFollowUps)];
  }
  const shuffled = [...freshPool(REST_EVENTS, character.recentEvents)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// Habillage textuel des mini-jeux : pioche une issue positive/négative
// dans un lot d'événements existants (réutilise le contenu narratif).
// Les pools sont calculés une seule fois par liste (cache module).
const flavorCache = new Map<GameEvent[], { good: string[]; bad: string[] }>();
export function flavorFrom(events: GameEvent[], positive: boolean): string {
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
  return pool.length ? randomFromArray(pool) : '';
}

// ============ CIBLES DU MINI-JEU DE VOL ============
// Chaque tentative de vol a une cible concrète, et qui vous attrape en cas
// d'échec en dépend : un commerçant se bat, la police vous embarque.
export const STEAL_TARGETS: StealTarget[] = [
  { id: 'etal', label: "l'étal du primeur", labelEn: "the greengrocer's stall", emoji: '🍎', catcher: 'commercant' },
  { id: 'baguette', label: 'une baguette à la boulangerie', labelEn: 'a baguette from the bakery', emoji: '🥖', catcher: 'commercant' },
  { id: 'conserves', label: 'des conserves au supermarché', labelEn: 'some cans from the supermarket', emoji: '🥫', catcher: 'commercant' },
  { id: 'kebab', label: 'un kebab sur le comptoir', labelEn: 'a kebab off the counter', emoji: '🥙', catcher: 'commercant' },
  { id: 'portefeuille', label: "le portefeuille d'un passant distrait", labelEn: "a distracted passer-by's wallet", emoji: '👛', catcher: 'police' },
  { id: 'velo', label: 'un vélo mal attaché', labelEn: 'a poorly locked bike', emoji: '🚲', catcher: 'police' },
  { id: 'pourboire', label: 'le pourboire laissé sur une terrasse', labelEn: 'the tip left on a café table', emoji: '☕', catcher: 'police' },
  { id: 'sacoche', label: 'une sacoche oubliée sur un banc', labelEn: 'a bag left on a bench', emoji: '👜', catcher: 'police' },
];

// ============ CLINS D'ŒIL AU RECORDMAN ============
// Événements « légende » : de temps en temps, la rue évoque celui qui a tenu
// le plus longtemps. {name} et {days} sont remplis au moment de l'affichage.
const LEGEND_TEMPLATES: LegendTemplate[] = [
  {
    id: 'legend-graffiti', title: 'Le mur des légendes', type: 'narrative',
    description: 'Sur un mur décrépi, un graffiti tracé avec soin : « {name}, {days} jours, Roi du Carton ». La rue n\'oublie pas les siens.',
    choices: [
      { text: 'Graver votre nom juste en dessous', risk: 'safe', emoji: '✍️', outcomes: [
        { probability: 1, text: 'Vous inscrivez votre nom sous celui de {name}. Un jour, peut-être, on parlera de vous aussi.', statChanges: { mental: 8, dignity: 3 }, respectChange: 1 },
      ]},
      { text: 'Rendre hommage en silence', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 1, text: '{days} jours… Vous serrez les dents. Vous ferez mieux.', statChanges: { mental: 6 } },
      ]},
    ],
  },
  {
    id: 'legend-ancien', title: 'Le vieux se souvient', type: 'social',
    description: 'Un ancien du quartier vous jauge. « {name} ? Ah, ça… {days} jours dans la rue. Personne n\'a fait mieux. Toi, t\'as encore du chemin. »',
    choices: [
      { text: 'Jurer de le dépasser', risk: 'safe', emoji: '🔥', outcomes: [
        { probability: 1, text: 'Le vieux sourit. « J\'aime ça. » Il vous glisse quelques pièces pour la route.', statChanges: { mental: 7 }, moneyChange: 2, respectChange: 1 },
      ]},
      { text: 'Hausser les épaules', risk: 'safe', emoji: '😐', outcomes: [
        { probability: 1, text: '« Comme tu veux. Mais souviens-toi du nom : {name}. »', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'legend-carton', title: 'Le carton du roi', type: 'discovery',
    description: 'Sous un porche, un carton usé jusqu\'à la corde. Une inscription au marqueur : « Ici a dormi {name}, {days} jours durant. » On dirait un lieu de pèlerinage.',
    choices: [
      { text: 'Fouiller le vieux carton', risk: 'normal', emoji: '🔍', outcomes: [
        { probability: 0.5, text: 'Coincée dans un pli : une pièce oubliée et un mot : « Tiens bon. »', moneyChange: 4, statChanges: { mental: 5 } },
        { probability: 0.5, text: 'Rien, sinon l\'odeur d\'une légende. Vous repartez inspiré.', statChanges: { mental: 6 } },
      ]},
      { text: 'Ne pas déranger la relique', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 1, text: 'Vous laissez le carton de {name} intact. Un peu de respect ne coûte rien.', statChanges: { dignity: 4, mental: 4 }, respectChange: 1 },
      ]},
    ],
  },
  {
    id: 'legend-pari', title: 'Le pari de la rue', type: 'social',
    description: 'Deux SDF parient sur votre avenir. « Lui ? Il tiendra jamais {days} jours comme {name}. » « Parie ! »',
    choices: [
      { text: 'Leur donner tort', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 1, text: '« On verra bien. » Vous repartez le menton haut, bien décidé à entrer dans l\'histoire.', statChanges: { mental: 8, dignity: 2 } },
      ]},
      { text: 'Parier avec eux', risk: 'normal', emoji: '🎲', outcomes: [
        { probability: 0.5, text: 'Ils misent une pièce sur vous. « Fais-nous gagner, gamin. »', moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.5, text: 'Ils rigolent et s\'en vont. L\'ombre de {name} plane toujours.', statChanges: { mental: 2 } },
      ]},
    ],
  },
];

function fillLegend(s: string, legend: { name: string; days: number }): string {
  return s.replace(/\{name\}/g, legend.name).replace(/\{days\}/g, String(legend.days));
}

// Construit un événement prêt à afficher pour le recordman donné.
export function makeLegendEvent(legend: { name: string; days: number }): GameEvent {
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
      outcomes: c.outcomes.map((o) => ({ ...o, text: fillLegend(tc(o.text), legend) })),
    })),
  };
}

// Lieux où tendre le chapeau (mini-jeu de mendicité).
export const BEG_SPOTS: string[] = [
  'devant la boulangerie',
  'à la sortie du métro',
  'sur le parvis de la gare',
  'devant le supermarché',
  "à la terrasse d'un café",
  'sous les arcades du centre-ville',
];

export function generateTravelEvent(_from: string, _to: string, character: Character): GameEvent | null {
  if (Math.random() > 0.5) return null;
  return randomFromArray(freshPool(TRAVEL_EVENTS, character.recentEvents));
}
