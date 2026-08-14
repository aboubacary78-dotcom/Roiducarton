// ============================================================================
// EXPLORER, VAGUE 2 (50 événements)
// ----------------------------------------------------------------------------
// Second lot d'événements d'exploration : humour noir et loufoque, gains
// modestes, la rue reste la rue. Fusionné dans EXPLORE_EVENTS (voir events.ts).
// Chaque événement référence son image /assets/exp-<id>.webp : tant que le
// fichier n'existe pas, l'écran retombe sur la scène dessinée (fallback).
// ============================================================================
import type { GameEvent } from '../types';

export const EXPLORE_EVENTS_2: GameEvent[] = [
  {
    id: 'exp-piscine-municipale', title: 'La Piscine Municipale', type: 'discovery',
    image: '/assets/exp-piscine-municipale.webp',
    description: 'Le vestiaire de la piscine est mal surveillé. Des douches chaudes à volonté, pour qui marche d\'un pas assuré.',
    choices: [
      { text: 'Entrer comme si de rien n\'était', risk: 'normal', emoji: '🚿', outcomes: [
        { probability: 0.6, text: 'Vingt minutes d\'eau chaude. Vous ressortez rose, propre, et philosophiquement réconcilié avec l\'humanité.', statChanges: { dignity: 15, mental: 10, health: 5 } },
        { probability: 0.4, text: 'Le maître-nageur vous repère à votre absence de bonnet. Expulsé, mais il vous laisse la serviette par pitié.', statChanges: { dignity: -5, mental: -3 }, itemGain: { id: 'serviette-piscine', name: 'Serviette municipale', emoji: '🧻', type: 'junk', value: 3 } },
      ]},
      { text: 'Repartir, l\'eau c\'est surfait', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous passez votre chemin. Votre odeur aussi. Vous formez une belle équipe.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-canard-geant', title: 'Le Canard Géant', type: 'discovery',
    image: '/assets/exp-canard-geant.webp',
    description: 'Un canard gonflable géant, échappé d\'un festival, dérive majestueusement sur le canal. Les passants filment. Personne n\'agit.',
    choices: [
      { text: 'Le récupérer à la perche', risk: 'risky', emoji: '🪝', outcomes: [
        { probability: 0.5, text: 'Capture héroïque sous les applaudissements. Le brocanteur vous le rachète sans poser de questions. Il ne pose jamais de questions.', moneyChange: 8, respectChange: 2, statChanges: { dignity: -5 } },
        { probability: 0.3, text: 'La perche plie, vous plongez. Le canard vous regarde couler avec son sourire de canard.', statChanges: { health: -8, mental: -4, dignity: -6 } },
        { probability: 0.2, text: 'Le canard crève sur un tesson. La foule vous hue comme si vous aviez tué un vrai canard.', statChanges: { mental: -6, dignity: -4 } },
      ]},
      { text: 'Le regarder passer, majestueux', risk: 'safe', emoji: '🦆', outcomes: [
        { probability: 1, text: 'Il glisse vers l\'écluse, immense et serein. Il y a encore de la beauté dans ce monde. Elle est en PVC.', statChanges: { mental: 8 } },
      ]},
    ],
  },
  {
    id: 'exp-vide-grenier', title: 'Le Vide-Grenier', type: 'social',
    image: '/assets/exp-vide-grenier.webp',
    description: 'Un vide-grenier s\'installe sur la place. En fin de journée, les invendus finissent souvent sur le trottoir. Vous connaissez le trottoir.',
    choices: [
      { text: 'Aider à remballer les stands', risk: 'safe', emoji: '💪', outcomes: [
        { probability: 0.7, text: 'Trois heures de cartons. On vous paie en pièces, en quiche froide et en bibelots. L\'économie réelle.', moneyChange: 4, statChanges: { hunger: 10 }, itemGain: { id: 'bibelot-chat', name: 'Chat en porcelaine (ébréché)', emoji: '🐱', type: 'junk', value: 4 } },
        { probability: 0.3, text: 'Beaucoup de merci, zéro pièce. La gratitude ne se mange pas, mais elle tient chaud. Un peu.', statChanges: { mental: 4 }, respectChange: 1 },
      ]},
      { text: 'Attendre les invendus du soir', risk: 'normal', emoji: '⏳', outcomes: [
        { probability: 0.6, text: 'Un carton entier abandonné : vaisselle, lampe, roman de gare. Noël en avance, version poussière.', statChanges: { mental: 6 }, itemGain: { id: 'lampe-chevet', name: 'Lampe de chevet orpheline', emoji: '🛋️', type: 'junk', value: 5 } },
        { probability: 0.4, text: 'Un autre connaisseur est passé avant vous. Il a même pris les cintres, et replié le carton derrière lui.', statChanges: { mental: -4 } },
      ]},
    ],
  },
  {
    id: 'exp-caddies', title: 'Les Caddies Perdus', type: 'discovery',
    image: '/assets/exp-caddies.webp',
    description: 'Le parking du supermarché est constellé de caddies abandonnés. Chacun est lesté d\'une pièce d\'un euro. C\'est presque un verger.',
    choices: [
      { text: 'Les ramener un par un', risk: 'safe', emoji: '🛒', outcomes: [
        { probability: 0.8, text: 'Cinq caddies, cinq pièces. Les clients vous regardent comme un service municipal. Vous êtes un service municipal.', moneyChange: 5, statChanges: { dignity: -3 } },
        { probability: 0.2, text: 'Le vigile trouve ça louche, vérifie, puis vous laisse finir. Il vous doit trois caddies, il le sait.', moneyChange: 3, respectChange: 1 },
      ]},
      { text: 'Construire un train de caddies', risk: 'risky', emoji: '🚂', outcomes: [
        { probability: 0.5, text: 'Huit caddies emboîtés, une seule poussée magistrale. Le rendement industriel appliqué à la misère.', moneyChange: 8, statChanges: { mental: 5 } },
        { probability: 0.5, text: 'Le train déraille dans une Clio. Vous fuyez en abandonnant le convoi. Perte sèche, alarme en prime.', statChanges: { mental: -5, health: -3 }, respectChange: -2 },
      ]},
    ],
  },
  {
    id: 'exp-photomaton', title: 'Le Photomaton', type: 'narrative',
    image: '/assets/exp-photomaton.webp',
    description: 'Un photomaton clignote dans la galerie. Une pièce est coincée dans la fente, et des photos oubliées pendent du bac.',
    choices: [
      { text: 'Récupérer pièce et photos', risk: 'normal', emoji: '🪙', outcomes: [
        { probability: 0.6, text: 'Une pièce, et quatre portraits d\'une inconnue qui rate son sourire quatre fois. Vous la comprenez tellement.', moneyChange: 1, statChanges: { mental: 4 } },
        { probability: 0.4, text: 'La machine flashe toute seule : quatre portraits de vous, pas rasé, surpris. Étrangement, vous êtes photogénique.', statChanges: { mental: 6, dignity: 3 }, itemGain: { id: 'photos-identite', name: 'Photos d\'identité (les vôtres)', emoji: '📷', type: 'junk', value: 2 } },
      ]},
      { text: 'Passer son chemin, les machines vous jugent', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Le photomaton clignote dans votre dos comme un regret. Vous ne vous retournez pas.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-livreur-perdu', title: 'Le Livreur Perdu', type: 'social',
    image: '/assets/exp-livreur-perdu.webp',
    description: 'Un livreur à vélo tourne en rond depuis vingt minutes. Sa sacoche fume doucement. Le GPS a gagné, lui a perdu.',
    choices: [
      { text: 'Le guider dans le quartier', risk: 'safe', emoji: '🧭', outcomes: [
        { probability: 0.7, text: 'Trop tard, commande annulée. Il vous tend la pizza tiède : « c\'est toi le client maintenant », et remonte sur son scooter.', statChanges: { hunger: 22, mental: 6 } },
        { probability: 0.3, text: 'Il arrive à temps grâce à vous et revient partager son pourboire. Un homme d\'honneur, à vélo.', moneyChange: 3, respectChange: 1, statChanges: { mental: 4 } },
      ]},
      { text: 'Racheter la commande en retard', risk: 'normal', emoji: '💶', outcomes: [
        { probability: 0.5, text: 'Deux euros pour un menu complet à peine froid. La meilleure affaire du trimestre.', moneyChange: -2, statChanges: { hunger: 28, thirst: 8, mental: 5 } },
        { probability: 0.5, text: '« Je peux pas, c\'est traçé. » Tracé. Même les kebabs ont un flicage GPS maintenant.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-statue-vivante', title: 'La Statue Vivante', type: 'social',
    image: '/assets/exp-statue-vivante.webp',
    description: 'L\'artiste statue vivante de la place vient de s\'évanouir de chaleur. Son chapeau à pièces reste au sol, très vivant, lui.',
    choices: [
      { text: 'Le secourir', risk: 'safe', emoji: '🚑', outcomes: [
        { probability: 0.7, text: 'Eau, ombre, éventail improvisé. En rouvrant les yeux, il partage la recette : « t\'es le premier à pas m\'avoir volé. »', moneyChange: 5, respectChange: 3, statChanges: { mental: 5 } },
        { probability: 0.3, text: 'Il se relève, s\'époussette, repart poser sans un mot. Les statues, c\'est pas causant, même vivant.', statChanges: { mental: 2, dignity: 2 } },
      ]},
      { text: 'Prendre la pose à sa place', risk: 'risky', emoji: '🗿', outcomes: [
        { probability: 0.5, text: 'Vous tenez la pose quarante minutes. Un touriste dit « lui au moins il est réaliste ». Il ne croit pas si bien dire.', moneyChange: 7, statChanges: { dignity: 5, mental: 8 } },
        { probability: 0.5, text: 'Un enfant vous fait rire au bout de deux minutes. La magie tombe, les pièces aussi, mais pas dans votre sens.', statChanges: { mental: -4, dignity: -4 } },
      ]},
    ],
  },
  {
    id: 'exp-poubelle-bureau', title: 'Les Poubelles du Bureau', type: 'discovery',
    image: '/assets/exp-poubelle-bureau.webp',
    description: 'Une entreprise déménage. Les bennes débordent de matériel décrété « obsolète » par un tableur.',
    choices: [
      { text: 'Fouiller méthodiquement', risk: 'normal', emoji: '🗑️', outcomes: [
        { probability: 0.5, text: 'Un clavier, trois câbles, un téléphone fixe. Le brocanteur appelle ça « du vintage ». Vous appelez ça dîner.', moneyChange: 2, itemGain: { id: 'cables-bureau', name: 'Poignée de câbles', emoji: '🔌', type: 'junk', value: 6 } },
        { probability: 0.3, text: 'Une plante verte de bureau, aussi déprimée que vous. Vous l\'adoptez. Vous vous comprenez.', statChanges: { mental: 6 }, itemGain: { id: 'plante-bureau', name: 'Ficus dépressif', emoji: '🪴', type: 'junk', value: 3 } },
        { probability: 0.2, text: 'Rien que des documents broyés et une agrafeuse sans agrafes. Même leurs déchets sont en burn-out.', statChanges: { mental: -3 } },
      ]},
      { text: 'Demander directement aux déménageurs', risk: 'safe', emoji: '🤝', outcomes: [
        { probability: 0.6, text: '« Sers-toi, ça part à la benne. » Vous revendez une chaise de bureau à roulettes dans l\'heure. Le marché est fluide.', moneyChange: 4, statChanges: { mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: '« Touche pas, c\'est inventorié. » Inventorié pour la destruction. La logistique a ses mystères.', statChanges: { mental: -2, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-casting-sauvage', title: 'Le Casting Sauvage', type: 'social',
    image: '/assets/exp-casting-sauvage.webp',
    description: 'Une réalisatrice arpente le quartier : elle cherche des « gueules authentiques » pour son documentaire sur la ville.',
    choices: [
      { text: 'Raconter votre histoire', risk: 'normal', emoji: '🎬', outcomes: [
        { probability: 0.6, text: 'Elle filme, elle pleure, elle paie. Votre vie fait un excellent scénario. Vous auriez préféré une meilleure vie et un mauvais film.', moneyChange: 6, statChanges: { dignity: 4, mental: 5 } },
        { probability: 0.4, text: 'Elle voulait juste « de l\'ambiance ». Vous êtes un figurant flou derrière un lampadaire. Comme dans la vraie vie.', moneyChange: 1, statChanges: { mental: -2 } },
      ]},
      { text: 'Négocier un cachet d\'abord', risk: 'risky', emoji: '💰', outcomes: [
        { probability: 0.5, text: '« Enfin quelqu\'un qui connaît sa valeur. » Elle paie le tarif syndical. Vous ignoriez avoir un syndicat.', moneyChange: 10, respectChange: 2 },
        { probability: 0.5, text: 'Elle filme finalement quelqu\'un de plus « photogénique ». Le mot poli pour dire avec moins de dents en moins.', statChanges: { mental: -4, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-frigo-solidaire', title: 'Le Frigo Solidaire', type: 'discovery',
    image: '/assets/exp-frigo-solidaire.webp',
    description: 'Un frigo solidaire flambant neuf vient d\'être inauguré, ruban tricolore et tout. Il est encore plein. Ça ne durera pas.',
    choices: [
      { text: 'Se servir raisonnablement', risk: 'safe', emoji: '🥗', outcomes: [
        { probability: 0.8, text: 'Yaourts, pain, une soupe en brique. Vous laissez le reste, geste de gentleman. Le frigo apprécie, sûrement.', statChanges: { hunger: 18, thirst: 6, mental: 4 } },
        { probability: 0.2, text: 'Tout est au soja. Absolument tout. Même le jambon. La solidarité a un goût, et c\'est celui du soja.', statChanges: { hunger: 10, mental: -2 } },
      ]},
      { text: 'Faire des réserves', risk: 'normal', emoji: '🎒', outcomes: [
        { probability: 0.5, text: 'Sac plein pour deux jours. La fourmi et la cigale, version bac à légumes.', statChanges: { hunger: 15 }, itemGain: { id: 'soupe-brique', name: 'Soupe en brique', emoji: '🥫', type: 'food', value: 3, effect: { hunger: 12 } } },
        { probability: 0.5, text: 'Une bénévole vous sermonne devant tout le monde sur le « partage équitable ». Vous repartez avec un yaourt et une leçon.', statChanges: { dignity: -6, hunger: 8 } },
      ]},
    ],
  },
  {
    id: 'exp-toilettes-payantes', title: 'La Sanisette Détraquée', type: 'discovery',
    image: '/assets/exp-toilettes-payantes.webp',
    description: 'La sanisette municipale est en panne : porte grande ouverte, monnayeur qui clignote comme une machine à sous.',
    choices: [
      { text: 'Secouer le monnayeur', risk: 'risky', emoji: '🪙', outcomes: [
        { probability: 0.5, text: 'Une pluie de pièces jaunes. La machine rend dix ans de monnaie d\'un coup, avec un râle de soulagement.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.3, text: 'La porte se referme et le cycle de lavage se déclenche AVEC VOUS DEDANS. Traumatisant. Mais vous n\'avez jamais été aussi propre.', statChanges: { health: -3, mental: -6, dignity: 12 } },
        { probability: 0.2, text: 'Rien. La machine clignote, nargue, et se rendort. Même les sanisettes vous font des promesses.', statChanges: { mental: -2 } },
      ]},
      { text: 'Profiter des toilettes gratuites', risk: 'safe', emoji: '🚽', outcomes: [
        { probability: 1, text: 'Un moment d\'intimité avec verrou. Le grand luxe ne se raconte pas.', statChanges: { mental: 6, dignity: 4 } },
      ]},
    ],
  },
  {
    id: 'exp-magicien-rate', title: 'Le Magicien Raté', type: 'social',
    image: '/assets/exp-magicien-rate.webp',
    description: 'Un magicien de rue vient de rater son grand final : sa colombe s\'est enfuie avec l\'alliance d\'une spectatrice, et il continue de sourire au public.',
    choices: [
      { text: 'Traquer la colombe', risk: 'normal', emoji: '🕊️', outcomes: [
        { probability: 0.6, text: 'Vous la coincez sous votre veste au troisième essai. Le couple vous récompense, le magicien vous embauche presque.', moneyChange: 8, respectChange: 3 },
        { probability: 0.4, text: 'La colombe vous échappe et vous bombarde en représailles. Vous gagnez trois plumes et une réputation.', statChanges: { dignity: -5, mental: -3 } },
      ]},
      { text: 'Proposer d\'être son assistant', risk: 'risky', emoji: '🎩', outcomes: [
        { probability: 0.5, text: 'Le duo fonctionne : vous « disparaissez » derrière un rideau, le public adore. Recette partagée moitié-moitié, enfin presque.', moneyChange: 5, statChanges: { mental: 8, dignity: 3 } },
        { probability: 0.5, text: 'Il vous « scie en deux ». Le tour rate à moitié. Vous ne saurez jamais quelle moitié. Le public s\'en va.', statChanges: { mental: -4 } },
      ]},
    ],
  },
  {
    id: 'exp-demenageurs', title: 'Le Piano du Sixième', type: 'social',
    image: '/assets/exp-demenageurs.webp',
    description: 'Deux déménageurs contemplent un piano droit au pied d\'un immeuble sans ascenseur. Sixième étage. Aucun des deux ne parle en premier.',
    choices: [
      { text: 'Proposer vos bras', risk: 'normal', emoji: '💪', outcomes: [
        { probability: 0.6, text: 'Six étages, quarante marches de blasphèmes, un billet à l\'arrivée. Votre dos déposera plainte plus tard.', moneyChange: 10, respectChange: 2, statChanges: { health: -6 } },
        { probability: 0.4, text: 'Au quatrième, le piano gagne. Il redescend deux étages tout seul, vous aussi. On vous paie quand même « pour le courage ».', moneyChange: 4, statChanges: { health: -10, mental: -3 } },
      ]},
      { text: 'Superviser depuis le trottoir', risk: 'safe', emoji: '🗣️', outcomes: [
        { probability: 0.7, text: '« Plus à gauche. Non, l\'autre gauche. » Vos conseils valent un café et un pain au chocolat. Le management, c\'est un don.', statChanges: { thirst: 8, hunger: 8, mental: 5 } },
        { probability: 0.3, text: '« Tu aides ou tu dégages. » Le monde du travail n\'est pas prêt pour les consultants bénévoles.', statChanges: { mental: -3, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-jardins-ouvriers', title: 'Les Jardins Ouvriers', type: 'discovery',
    image: '/assets/exp-jardins-ouvriers.webp',
    description: 'Derrière un grillage, des potagers en parcelles. Sur l\'une d\'elles, un écriteau : « Récoltez-moi, je pars en maison de retraite. »',
    choices: [
      { text: 'Récolter avec soin', risk: 'safe', emoji: '🥕', outcomes: [
        { probability: 0.7, text: 'Carottes, poireaux, et un mot scotché sous une pierre : « prenez soin des tomates, elles sont timides. » Vous promettez.', statChanges: { hunger: 20, mental: 10 } },
        { probability: 0.3, text: 'Les voisins de parcelle vous prennent pour un voleur. L\'écriteau les fait taire, mais les regards restent.', statChanges: { hunger: 10, mental: -4 }, respectChange: -1 },
      ]},
      { text: 'Récolter et laisser un poème', risk: 'safe', emoji: '✍️', outcomes: [
        { probability: 1, text: 'Vous récoltez, et laissez trois vers sur les tomates timides. Quelque part en maison de retraite, quelqu\'un sourira.', statChanges: { hunger: 15, mental: 12, dignity: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-boite-livres', title: 'La Boîte à Livres', type: 'discovery',
    image: '/assets/exp-boite-livres.webp',
    description: 'Une boîte à livres déborde sur la place. Entre deux romans de gare, une enveloppe kraft dépasse, ni timbrée ni fermée.',
    choices: [
      { text: 'Ouvrir l\'enveloppe', risk: 'normal', emoji: '✉️', outcomes: [
        { probability: 0.5, text: 'Un billet plié dans un mot : « pour celui qui lit encore. » Vous lisez encore. Techniquement, vous venez de lire.', moneyChange: 5, statChanges: { mental: 8 } },
        { probability: 0.3, text: 'Une liste de courses de 1997. « Beurre, piles, cadeau Sylvie. » Vous espérez que Sylvie a eu son cadeau.', statChanges: { mental: 4 } },
        { probability: 0.2, text: 'Des photos de vacances d\'inconnus. Vous vous inventez leur vie entière sur un banc. Belle vie, au demeurant.', statChanges: { mental: 6 } },
      ]},
      { text: 'Prendre un livre pour la nuit', risk: 'safe', emoji: '📖', outcomes: [
        { probability: 1, text: 'Un polar auquel il manque les dix dernières pages. Le suspense restera entier pour toujours. C\'est peut-être mieux.', statChanges: { mental: 8 }, itemGain: { id: 'polar-ampute', name: 'Polar sans fin', emoji: '📕', type: 'junk', value: 2, effect: { mental: 5 } } },
      ]},
    ],
  },
  {
    id: 'exp-manif', title: 'La Manifestation', type: 'narrative',
    image: '/assets/exp-manif.webp',
    description: 'Un cortège traverse le quartier, banderoles au vent. Vous ne savez pas pour quoi ils manifestent, mais il y a un stand de merguez.',
    choices: [
      { text: 'Suivre le cortège', risk: 'normal', emoji: '✊', outcomes: [
        { probability: 0.6, text: 'Merguez solidaire, slogans entraînants, sentiment d\'appartenance. Vous ne savez toujours pas pour quoi vous marchez. Peu importe.', statChanges: { hunger: 16, mental: 8 } },
        { probability: 0.3, text: 'Ça dégénère juste quand vous arrivez à la merguez. Vous fuyez avec la moitié d\'un sandwich et des yeux qui piquent.', statChanges: { health: -6, mental: -5, hunger: 8 } },
        { probability: 0.1, text: 'Une journaliste vous interviewe comme « figure du mouvement ». Vous improvisez. Vous passez au 20h, flou mais digne.', respectChange: 4, statChanges: { mental: 6, dignity: 5 } },
      ]},
      { text: 'Regarder passer, en spectateur', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 1, text: 'Les gens crient pour leur avenir. Vous, vous n\'avez plus que du présent. C\'est déjà de l\'organisation.', statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-tournage', title: 'Le Tournage', type: 'social',
    image: '/assets/exp-tournage.webp',
    description: 'Une équipe de cinéma a envahi votre rue. Câbles, projecteurs, et surtout : un buffet régie momentanément sans surveillance.',
    choices: [
      { text: 'S\'incruster au buffet', risk: 'risky', emoji: '🥐', outcomes: [
        { probability: 0.5, text: 'Vous passez pour un machino. Vous mangez comme un machino. Vous repartez avant la question fatale : « t\'es sur quel poste ? »', statChanges: { hunger: 25, thirst: 10, mental: 6 } },
        { probability: 0.5, text: 'La régisseuse vous démasque à la troisième chouquette. Expulsion publique, mais elle vous laisse le croissant entamé.', statChanges: { dignity: -6, mental: -4, hunger: 6 } },
      ]},
      { text: 'Proposer d\'être figurant', risk: 'normal', emoji: '🎭', outcomes: [
        { probability: 0.6, text: 'Ils cherchaient justement « quelqu\'un de vrai ». Vous traversez le champ douze fois, payé à la traversée, nourri entre deux prises.', moneyChange: 8, statChanges: { dignity: 6, mental: 8 } },
        { probability: 0.4, text: '« On a déjà nos SDF, merci. » Ils ont des SDF de casting. Maquillés pour faire vrai. Le cinéma est un monde étrange.', statChanges: { mental: -6, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-distributeur-fleurs', title: 'Le Distributeur de Fleurs', type: 'discovery',
    image: '/assets/exp-distributeur-fleurs.webp',
    description: 'Un distributeur automatique de bouquets est détraqué : il distribue une rose toutes les trois minutes, gratuitement, imperturbablement.',
    choices: [
      { text: 'Faire la récolte et revendre', risk: 'safe', emoji: '🌹', outcomes: [
        { probability: 0.6, text: 'Douze roses vendues à l\'unité aux amoureux du parc. La machine produit, vous distribuez. Le capitalisme, enfin de votre côté.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Les roses fanent plus vite que vous ne vendez. Il vous reste un bouquet triste et des épines dans les poches.', statChanges: { mental: 3 }, itemGain: { id: 'bouquet-fane', name: 'Bouquet en fin de vie', emoji: '🥀', type: 'junk', value: 2, effect: { mental: 4 } } },
      ]},
      { text: 'Offrir les roses aux passants tristes', risk: 'safe', emoji: '💐', outcomes: [
        { probability: 1, text: 'Des sourires, deux merci émus, une pièce spontanée. Le luxe suprême : donner quelque chose, pour une fois.', statChanges: { mental: 12, dignity: 8 }, respectChange: 2, moneyChange: 1 },
      ]},
    ],
  },
  {
    id: 'exp-pigeon-bague', title: 'Le Pigeon Voyageur', type: 'discovery',
    image: '/assets/exp-pigeon-bague.webp',
    description: 'Un pigeon bagué picore près de vous. Le petit tube fixé à sa patte contient visiblement un message. Le mystère à portée de main.',
    choices: [
      { text: 'Attraper le pigeon', risk: 'normal', emoji: '🐦', outcomes: [
        { probability: 0.5, text: 'Le message dit : « Gérard, rends l\'argent. » C\'est tout. Vous relâchez le pigeon vers son destin de créancier ailé.', moneyChange: 2, statChanges: { mental: 6 } },
        { probability: 0.3, text: 'Le pigeon se débat comme un catcheur. Vous récoltez trois plumes, zéro message et le regard des passants.', statChanges: { dignity: -3, mental: -2 } },
        { probability: 0.2, text: 'Son propriétaire surgit, colombophile en larmes : « Maurice ! » Il vous récompense. Maurice, lui, ne vous remercie pas.', moneyChange: 7, respectChange: 2 },
      ]},
      { text: 'Le laisser à sa mission', risk: 'safe', emoji: '🕊️', outcomes: [
        { probability: 1, text: 'Chacun son fardeau. Lui, au moins, il sait où il va.', statChanges: { mental: 4 } },
      ]},
    ],
  },
  {
    id: 'exp-egoutier', title: 'L\'Égoutier Philosophe', type: 'social',
    image: '/assets/exp-egoutier.webp',
    description: 'Un égoutier en pause remonte de sa bouche d\'égout, s\'assoit sur le rebord et vous tend un gobelet de thermos, comme si c\'était prévu.',
    choices: [
      { text: 'Partager le café et la causerie', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 0.7, text: 'Il connaît la ville par en dessous. Il vous indique une grille d\'aération tiède « où même les rats sont polis », et vous fait répéter la rue deux fois.', statChanges: { thirst: 8, mental: 8, sleep: 5 }, addFlag: 'grille-egoutier' },
        { probability: 0.3, text: 'Son café a un léger goût de tuyau. Sa philosophie aussi. Les deux réchauffent quand même.', statChanges: { thirst: 5, health: -2, mental: 4 } },
      ]},
      { text: 'Demander ce qu\'on trouve en bas', risk: 'normal', emoji: '🐊', outcomes: [
        { probability: 0.6, text: '« Des alliances, surtout. Les gens jettent leur mariage aux toilettes. » Il vous en donne une : « porte-bonheur. »', statChanges: { mental: 5 }, itemGain: { id: 'alliance-egout', name: 'Alliance repêchée', emoji: '💍', type: 'junk', value: 8 } },
        { probability: 0.4, text: '« Des choses qui remontent. » Il n\'en dira pas plus. Il redescend. Vous dormirez un peu moins bien.', statChanges: { mental: -4, sleep: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-cabine-ecoute', title: 'La Cabine qui Sonne', type: 'narrative',
    image: '/assets/exp-cabine-ecoute.webp',
    description: 'La dernière cabine téléphonique du quartier se met à sonner pile quand vous passez devant. Personne d\'autre dans la rue.',
    choices: [
      { text: 'Décrocher', risk: 'normal', emoji: '📞', outcomes: [
        { probability: 0.5, text: '« Papi ? » Une petite voix. Vous expliquez gentiment. Elle raconte sa journée quand même, jusqu\'à ce que quelqu\'un lui reprenne le téléphone.', statChanges: { mental: 10 } },
        { probability: 0.3, text: 'Un démarchage pour des panneaux solaires. Même ici. Même vous. Vous négociez par principe, pour rien.', statChanges: { mental: 3 } },
        { probability: 0.2, text: 'Une voix : « la consigne de la gare, casier 12. » Puis bip. Vous n\'irez jamais. Ou si ?', statChanges: { mental: 5, sleep: -2 } },
      ]},
      { text: 'Laisser sonner, par prudence', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'La sonnerie s\'éteint derrière vous. Certains mystères font de meilleures histoires quand on ne les résout pas.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-drone-crash', title: 'Le Drone Écrasé', type: 'discovery',
    image: '/assets/exp-drone-crash.webp',
    description: 'Un drone de livraison gît dans un buisson, hélices tordues, colis intact accroché au ventre. Il clignote faiblement, comme un animal blessé.',
    choices: [
      { text: 'Récupérer le colis', risk: 'risky', emoji: '📦', outcomes: [
        { probability: 0.5, text: 'Des chaussettes de luxe et une bougie parfumée « Soir d\'Automne ». Le confort moderne tombé du ciel, littéralement.', statChanges: { mental: 6, dignity: 4 }, itemGain: { id: 'bougie-luxe', name: 'Bougie « Soir d\'Automne »', emoji: '🕯️', type: 'junk', value: 7 } },
        { probability: 0.3, text: 'Le drone hurle « TENTATIVE DE VOL DÉTECTÉE » d\'une voix synthétique. Tout le quartier regarde. Vous détalez.', statChanges: { mental: -5, dignity: -4 } },
        { probability: 0.2, text: 'Le colis contient un autre drone, plus petit. C\'est des poupées russes volantes. Vous le revendez sans chercher à comprendre.', moneyChange: 8 },
      ]},
      { text: 'Signaler l\'épave au numéro affiché', risk: 'safe', emoji: '📱', outcomes: [
        { probability: 0.6, text: 'Le service client vous remercie et vous crédite un bon d\'achat que vous ne pourrez jamais utiliser. On vous paie en pièces à la place.', moneyChange: 4, respectChange: 1 },
        { probability: 0.4, text: 'Vous restez 40 minutes en attente sur le téléphone d\'un passant compatissant. La musique d\'attente vous hante encore.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-caravane-voyante', title: 'La Caravane de la Voyante', type: 'social',
    image: '/assets/exp-caravane-voyante.webp',
    description: 'Une caravane mauve s\'est garée sur le terrain vague. « Madame Esperanza, avenir, passé, objets perdus. » Elle vous fait signe d\'entrer, gratuitement.',
    choices: [
      { text: 'Se faire lire l\'avenir', risk: 'normal', emoji: '🔮', outcomes: [
        { probability: 0.6, text: '« Je vois... un toit. Pas tout de suite, mais je le vois. » Elle vous offre le thé. Un toit. Vous y pensez toute la journée.', statChanges: { mental: 10, thirst: 6 }, addFlag: 'prophetie-toit' },
        { probability: 0.4, text: 'Elle pâlit en regardant les cartes, les range, et vous donne un billet : « revenez jamais. » Elle ne dit pas ce qu\'elle a vu.', moneyChange: 5, statChanges: { mental: -5, sleep: -3 } },
      ]},
      { text: 'Lui proposer de rabattre des clients', risk: 'normal', emoji: '📣', outcomes: [
        { probability: 0.6, text: 'Votre bagou attire trois curieux dans l\'après-midi. Commission honnête, thé à volonté, et une chaise pliante rien que pour vous.', moneyChange: 6, statChanges: { thirst: 8, mental: 4 } },
        { probability: 0.4, text: 'Vous promettez trop : un client furieux réclame son « grand amour » sous 48h. Madame Esperanza vous congédie diplomatiquement.', statChanges: { mental: -3 }, respectChange: -1 },
      ]},
    ],
  },
  {
    id: 'exp-atelier-velo', title: 'L\'Atelier Vélo Associatif', type: 'social',
    image: '/assets/exp-atelier-velo.webp',
    description: 'Un atelier associatif répare des vélos dans une arrière-cour. Ça sent la graisse, le métal et le café. Quelqu\'un jure contre un dérailleur.',
    choices: [
      { text: 'Donner un coup de main', risk: 'safe', emoji: '🔧', outcomes: [
        { probability: 0.7, text: 'Vous tenez, vous vissez, vous apprenez. On vous paie en café, en sandwich, et on vous demande si vous revenez demain.', statChanges: { hunger: 12, thirst: 8, mental: 8, dignity: 5 } },
        { probability: 0.3, text: 'Le dérailleur gagne contre tout le monde. Défaite collective, mais fraternelle. On vous garde une place pour la prochaine.', statChanges: { mental: 6 }, respectChange: 2 },
      ]},
      { text: 'Négocier une roue pour votre caddie', risk: 'normal', emoji: '🛞', outcomes: [
        { probability: 0.6, text: 'On vous équipe gratuitement. Votre caddie roule maintenant comme une berline allemande. Enfin, presque.', statChanges: { mental: 8 }, itemGain: { id: 'roue-velo', name: 'Roue de vélo neuve', emoji: '🛞', type: 'junk', value: 6 } },
        { probability: 0.4, text: '« On répare des vélos, pas des caddies. » Le sectarisme existe partout, même chez les gens bien.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-vernissage', title: 'Le Vernissage', type: 'social',
    image: '/assets/exp-vernissage.webp',
    description: 'Une galerie inaugure une expo d\'art contemporain. Porte ouverte, vin blanc à volonté, et des œuvres que personne ne comprend. Vous êtes habillé pareil que l\'artiste.',
    choices: [
      { text: 'Entrer et se fondre dans la masse', risk: 'normal', emoji: '🍷', outcomes: [
        { probability: 0.6, text: 'Trois verres, six petits-fours, deux conversations sur « la matérialité du vide ». Vous improvisez. On vous trouve « rafraîchissant ».', statChanges: { hunger: 12, thirst: 12, mental: 8, dignity: 5 } },
        { probability: 0.4, text: 'On vous prend pour l\'artiste. Vous signez deux catalogues avant que le vrai arrive. Sortie discrète, mais le vin était bon.', statChanges: { thirst: 10, mental: 10, dignity: -2 } },
      ]},
      { text: 'Critiquer les œuvres depuis la vitrine', risk: 'safe', emoji: '🧐', outcomes: [
        { probability: 0.7, text: 'Un collectionneur sort fumer et vous demande votre avis. Votre franchise le ravit. Il vous paie « la consultation ».', moneyChange: 6, statChanges: { mental: 6 }, respectChange: 1 },
        { probability: 0.3, text: 'Vous réalisez que l\'œuvre que vous critiquez est un extincteur. L\'extincteur, lui, ne juge pas.', statChanges: { mental: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-colleur-affiches', title: 'Le Colleur d\'Affiches', type: 'social',
    image: '/assets/exp-colleur-affiches.webp',
    description: 'Un colleur d\'affiches se bat seul contre le vent avec une affiche de cirque de quatre mètres. Le vent gagne, avec panache.',
    choices: [
      { text: 'Tenir l\'affiche', risk: 'safe', emoji: '🤲', outcomes: [
        { probability: 0.7, text: 'À deux, le vent perd. Le colleur partage son casse-croûte et deux invendues : des places de cirque périmées « pour le souvenir ».', moneyChange: 3, statChanges: { hunger: 10, mental: 5 } },
        { probability: 0.3, text: 'Une bourrasque vous emballe tous les deux dans l\'affiche. Vous voilà collés au lion du cirque Zavatta. On vous décolle en riant.', statChanges: { mental: 4, dignity: -4 } },
      ]},
      { text: 'Récupérer les vieilles affiches arrachées', risk: 'safe', emoji: '📜', outcomes: [
        { probability: 1, text: 'Le papier d\'affiche, épais et enduit : deux couches sous le dos valent une couverture.', statChanges: { mental: 3, sleep: 5 }, itemGain: { id: 'affiches-epaisses', name: 'Liasse d\'affiches (isolant)', emoji: '📜', type: 'junk', value: 3 } },
      ]},
    ],
  },
  {
    id: 'exp-stand-hotdog', title: 'Le Stand de Hot-Dogs Abandonné', type: 'discovery',
    image: '/assets/exp-stand-hotdog.webp',
    description: 'Un stand de hot-dogs fume tout seul au coin de la rue. Le vendeur est parti en courant vers une contractuelle, au loin. Les saucisses grésillent, orphelines.',
    choices: [
      { text: 'Surveiller le stand en attendant', risk: 'safe', emoji: '🌭', outcomes: [
        { probability: 0.7, text: 'Le vendeur revient, PV à la main. Il vous offre le hot-dog du siècle : « t\'es le seul qui a rien volé. » La barre était basse.', statChanges: { hunger: 25, mental: 6 }, respectChange: 2 },
        { probability: 0.3, text: 'Vous servez deux clients pendant l\'absence, tarif exact, monnaie rendue. Le vendeur, bluffé, partage la recette.', moneyChange: 5, statChanges: { hunger: 15, mental: 5 } },
      ]},
      { text: 'Se servir, vite', risk: 'risky', emoji: '🏃', outcomes: [
        { probability: 0.5, text: 'Deux hot-dogs engloutis en marchant vite. La moutarde vous coule sur les doigts comme un remords tiède.', statChanges: { hunger: 22, mental: -3, dignity: -4 } },
        { probability: 0.5, text: 'Le vendeur revient PILE à la saucisse. La poursuite est brève, la honte durable. Il garde votre bonnet en otage.', statChanges: { health: -4, dignity: -6, mental: -4 }, addFlag: 'bonnet-otage' },
      ]},
    ],
  },
  {
    id: 'exp-cle-perdue', title: 'Le Trousseau Perdu', type: 'discovery',
    image: '/assets/exp-cle-perdue.webp',
    description: 'Un trousseau de clés gît sur le trottoir : sept clés, une patte de lapin usée, et une étiquette « si perdu, récompense ». Sans adresse.',
    choices: [
      { text: 'Le déposer au commissariat', risk: 'normal', emoji: '👮', outcomes: [
        { probability: 0.6, text: 'L\'agent note tout, vous remercie, et le propriétaire vous retrouve le soir même : la récompense existe vraiment, en billets.', moneyChange: 10, respectChange: 3, statChanges: { mental: 6 } },
        { probability: 0.4, text: 'On vous fait attendre une heure, puis on vous demande VOS papiers. Vous ressortez sans clés, sans récompense, avec un doute.', statChanges: { mental: -4, dignity: -3 } },
      ]},
      { text: 'Garder la patte de lapin', risk: 'normal', emoji: '🐰', outcomes: [
        { probability: 0.5, text: 'Vous accrochez les clés bien en vue sur la grille et gardez le porte-bonheur. Le lapin a assez servi les autres.', statChanges: { mental: 5 }, itemGain: { id: 'patte-lapin', name: 'Patte de lapin usée', emoji: '🐰', type: 'junk', value: 4, effect: { mental: 6 } } },
        { probability: 0.5, text: 'La propriétaire arrive pendant votre hésitation. Regard appuyé sur la patte de lapin dans votre main. Récompense : divisée par deux.', moneyChange: 4, statChanges: { dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-consigne-verre', title: 'La Consigne du Verre', type: 'discovery',
    image: '/assets/exp-consigne-verre.webp',
    description: 'Le nouveau supermarché a installé une machine à consigne : chaque bouteille rapporte des centimes. Le quartier entier jette ses bouteilles n\'importe où. Une mine à ciel ouvert.',
    choices: [
      { text: 'Faire la tournée des recoins', risk: 'safe', emoji: '🍾', outcomes: [
        { probability: 0.7, text: 'Vingt-trois bouteilles, un sac qui tinte comme un carillon. La machine avale tout et crache un vrai billet. L\'écologie paie enfin quelqu\'un.', moneyChange: 6, statChanges: { mental: 5, dignity: -2 } },
        { probability: 0.3, text: 'La machine refuse une bouteille sur deux avec un bip méprisant. « CONTENANT NON RECONNU. » Vous non plus, vous n\'êtes pas reconnu.', moneyChange: 3, statChanges: { mental: -2 } },
      ]},
      { text: 'S\'associer avec le clochard du parking', risk: 'normal', emoji: '🤝', outcomes: [
        { probability: 0.6, text: 'Lui les bars, vous les parcs. L\'accord est scellé d\'une poignée de main collante. Premier jour de la coopérative : bénéfice net.', moneyChange: 5, respectChange: 2, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Il connaît déjà TOUS les spots et vous le fait savoir. Vous héritez de la zone industrielle. Deux bouteilles, dont une cassée.', moneyChange: 1, statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-ruche-urbaine', title: 'Les Ruches du Toit', type: 'discovery',
    image: '/assets/exp-ruche-urbaine.webp',
    description: 'Sur le toit du gymnase, un apiculteur urbain en combinaison blanche s\'agite entre ses ruches. Il vous aperçoit et crie quelque chose d\'inaudible.',
    choices: [
      { text: 'Monter voir (prudemment)', risk: 'risky', emoji: '🐝', outcomes: [
        { probability: 0.5, text: '« Tenez ça ! » Vous voilà assistant apicole. Une heure plus tard : deux piqûres, un pot de miel, et une passion naissante.', statChanges: { health: -3, hunger: 10, mental: 8 }, itemGain: { id: 'pot-miel', name: 'Pot de miel urbain', emoji: '🍯', type: 'food', value: 8, effect: { hunger: 15, health: 5 } } },
        { probability: 0.5, text: 'Les abeilles décrètent que vous êtes une menace. La descente d\'escalier restera dans les annales du gymnase.', statChanges: { health: -8, mental: -4, dignity: -5 } },
      ]},
      { text: 'Crier « ça va ? » et attendre en bas', risk: 'safe', emoji: '📣', outcomes: [
        { probability: 1, text: 'Il redescend une heure après et vous offre un rayon de miel « pour la compagnie morale ». Les gens seuls se reconnaissent.', statChanges: { hunger: 12, mental: 6 } },
      ]},
    ],
  },
  {
    id: 'exp-machine-pince', title: 'La Machine à Pince', type: 'discovery',
    image: '/assets/exp-machine-pince.webp',
    description: 'Dans le hall de la laverie, une machine à pince pleine de peluches délavées. Un mot scotché : « pince déréglée, jouez à vos risques. » Déréglée dans quel sens ?',
    choices: [
      { text: 'Tenter le coup avec votre dernière pièce', risk: 'risky', emoji: '🕹️', outcomes: [
        { probability: 0.4, text: 'La pince, effectivement déréglée, attrape TROIS peluches d\'un coup. Le patron de la laverie applaudit. Vous êtes une légende locale.', statChanges: { mental: 12 }, respectChange: 2, itemGain: { id: 'peluche-lapin', name: 'Lapin en peluche délavé', emoji: '🧸', type: 'junk', value: 5, effect: { mental: 8 } } },
        { probability: 0.6, text: 'La pince attrape le vide avec une précision remarquable. Trois fois. Elle est déréglée dans le mauvais sens. Le vôtre.', moneyChange: -1, statChanges: { mental: -4 } },
      ]},
      { text: 'Secouer discrètement la machine', risk: 'normal', emoji: '🫨', outcomes: [
        { probability: 0.5, text: 'Une peluche bascule dans la trappe. Le crime parfait. La girafe borgne est à vous.', statChanges: { mental: 6 }, itemGain: { id: 'girafe-borgne', name: 'Girafe borgne', emoji: '🦒', type: 'junk', value: 4, effect: { mental: 6 } } },
        { probability: 0.5, text: 'L\'alarme antivol de la machine hurle. Une machine à peluches avec une alarme. Le monde n\'a plus confiance en personne.', statChanges: { mental: -4, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-cinema-sauvage', title: 'Le Cinéma Sauvage', type: 'social',
    image: '/assets/exp-cinema-sauvage.webp',
    description: 'Quelqu\'un projette un vieux film sur le mur aveugle de l\'immeuble d\'en face. Des transats, un drap tendu, un chapeau pour la monnaie. Le quartier s\'assoit.',
    choices: [
      { text: 'S\'installer et regarder', risk: 'safe', emoji: '🎬', outcomes: [
        { probability: 0.7, text: 'Un western en noir et blanc, du popcorn qui circule, la nuit douce. Pendant deux heures, tout le monde a le même toit : aucun.', statChanges: { mental: 14, hunger: 6 } },
        { probability: 0.3, text: 'La police fait éteindre au moment du duel final. Le projectionniste promet la suite demain. Tout le quartier connaît désormais votre frustration.', statChanges: { mental: 6 } },
      ]},
      { text: 'Aider à tenir le drap-écran', risk: 'safe', emoji: '🎪', outcomes: [
        { probability: 1, text: 'Deux heures à tenir un coin de drap. Bras morts, mais place d\'honneur et part du chapeau. Technicien du rêve, c\'est un métier.', moneyChange: 3, statChanges: { mental: 10 }, respectChange: 2 },
      ]},
    ],
  },
  {
    id: 'exp-carton-chatons', title: 'Le Carton qui Miaule', type: 'discovery',
    image: '/assets/exp-carton-chatons.webp',
    description: 'Un carton scotché miaule près des poubelles. À l\'intérieur : trois chatons et un mot immonde : « débrouillez-vous. » Le monde, parfois.',
    choices: [
      { text: 'Les porter à l\'animalerie du coin', risk: 'safe', emoji: '🏪', outcomes: [
        { probability: 0.7, text: 'La gérante fond en larmes, adopte les trois, et vous remplit un sac de conserves « pour le dérangement ». Les héros mangent des raviolis.', statChanges: { mental: 10, hunger: 15 }, respectChange: 3 },
        { probability: 0.3, text: 'L\'animalerie est complète, mais la vieille dame du troisième prend tout le monde. Vous, elle vous prend en affection. Ça compte double.', statChanges: { mental: 8 }, respectChange: 2 },
      ]},
      { text: 'En garder un, donner les autres', risk: 'normal', emoji: '🐈', outcomes: [
        { probability: 0.6, text: 'Le plus teigneux reste avec vous une journée entière, perché sur votre épaule comme un pirate. Puis il choisit une boulangère. Traître, mais bon goût.', statChanges: { mental: 12 }, addFlag: 'chaton-boulangere' },
        { probability: 0.4, text: 'Le chaton pleure toute la nuit. Vous ne dormez pas, mais vous êtes deux à ne pas dormir. C\'est déjà de la compagnie.', statChanges: { mental: 6, sleep: -8 } },
      ]},
    ],
  },
  {
    id: 'exp-escalator-panne', title: 'L\'Escalator en Panne', type: 'narrative',
    image: '/assets/exp-escalator-panne.webp',
    description: 'L\'escalator du centre commercial est en panne. Une foule attend devant, immobile, que quelqu\'un répare des marches. Qui fonctionnent. En tant qu\'escalier.',
    choices: [
      { text: 'Montrer l\'exemple en montant à pied', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 0.7, text: 'Vous gravissez l\'escalator figé sous les regards médusés. Un à un, ils suivent. Vous venez de réinventer l\'escalier. Un ancien vous glisse une pièce.', moneyChange: 2, statChanges: { mental: 8, dignity: 5 } },
        { probability: 0.3, text: 'Arrivé en haut, un vigile vous demande ce que vous « comptez faire là ». Redescendre, du coup. Par l\'escalator d\'à côté. En panne aussi.', statChanges: { mental: 3, dignity: -2 } },
      ]},
      { text: 'Proposer un « service de portage »', risk: 'normal', emoji: '🛍️', outcomes: [
        { probability: 0.6, text: 'Trois cabas de courses montés pour trois dames. Pourboires, remerciements, et un cake offert. L\'économie de l\'escalator cassé.', moneyChange: 5, statChanges: { hunger: 8, mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: 'La sécurité estime que vous « exploitez la situation ». Vous, vous appelez ça de l\'initiative. Débat écourté, sortie accompagnée.', statChanges: { mental: -3, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-billet-envole', title: 'Le Billet dans le Vent', type: 'discovery',
    image: '/assets/exp-billet-envole.webp',
    description: 'Un billet de dix euros danse dans le vent, à deux mètres du sol, ivre de liberté. Toute la rue l\'a vu. Toute la rue s\'est arrêtée.',
    choices: [
      { text: 'Le prendre en chasse', risk: 'normal', emoji: '🏃', outcomes: [
        { probability: 0.5, text: 'Trois cents mètres de course, un plongeon dans un massif de lavande, mais il est à VOUS. La rue applaudit. Vous saluez.', moneyChange: 10, statChanges: { mental: 8, health: -3 } },
        { probability: 0.3, text: 'Un gamin en trottinette vous double au sprint final. La jeunesse. Il partage quand même : « t\'as bien couru, papy. »', moneyChange: 3, statChanges: { mental: -2, dignity: -3 } },
        { probability: 0.2, text: 'Le billet finit dans une bouche d\'égout, avec un dernier frétillement narquois. L\'égout, décidément, gagne toujours.', statChanges: { mental: -5, health: -2 } },
      ]},
      { text: 'Calculer sa trajectoire, en stratège', risk: 'normal', emoji: '🧠', outcomes: [
        { probability: 0.5, text: 'Vous l\'attendez au coin, bras tendu. Il se pose dans votre main comme un oiseau dressé. Les badauds sont sidérés. Vous aussi, mais chut.', moneyChange: 10, statChanges: { mental: 10 }, respectChange: 2 },
        { probability: 0.5, text: 'Le vent tourne. Le billet aussi. Votre embuscade est un échec tactique complet, observé par au moins douze personnes.', statChanges: { mental: -4, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-camion-invendus', title: 'Le Camion des Invendus', type: 'discovery',
    image: '/assets/exp-camion-invendus.webp',
    description: 'Derrière le supermarché, un camion charge les invendus « pour destruction ». Des palettes entières de nourriture à peine périmée, condamnées par des dates.',
    choices: [
      { text: 'Négocier avec le chauffeur', risk: 'normal', emoji: '🤝', outcomes: [
        { probability: 0.6, text: '« De toute façon ça part au broyeur... » Il détourne le regard le temps que vous remplissiez un sac. Un juste, ce chauffeur.', statChanges: { hunger: 25, mental: 6 }, itemGain: { id: 'yaourts-condamnes', name: 'Pack de yaourts graciés', emoji: '🥛', type: 'food', value: 4, effect: { hunger: 12 } } },
        { probability: 0.4, text: '« Interdit. Traçabilité. » Il jette des tonnes de nourriture devant vous en s\'excusant du regard. Le système a des yeux tristes.', statChanges: { mental: -6 } },
      ]},
      { text: 'Noter les horaires du camion', risk: 'safe', emoji: '📝', outcomes: [
        { probability: 1, text: 'Mardi et vendredi, 7h40. Une information qui vaut de l\'or, gravée dans votre mémoire à côté des choses importantes.', statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-cirque-installation', title: 'Le Cirque s\'Installe', type: 'social',
    image: '/assets/exp-cirque-installation.webp',
    description: 'Un petit cirque familial monte son chapiteau sur le terrain vague. Ça manque de bras, ça crie en trois langues, et un lama observe la scène, blasé.',
    choices: [
      { text: 'Aider au montage', risk: 'normal', emoji: '🎪', outcomes: [
        { probability: 0.6, text: 'Une journée à tirer des câbles et planter des pieux. Payé en espèces, nourri à la roulotte, adoubé par le lama. Une grande journée.', moneyChange: 8, statChanges: { hunger: 18, mental: 8, health: -4 } },
        { probability: 0.4, text: 'Le chapiteau s\'effondre une fois, doucement, comme un soufflé. Personne ne sait si c\'est votre pieu. Le doute vous ronge, le dîner vous console.', statChanges: { hunger: 12, mental: -2 } },
      ]},
      { text: 'Divertir la file d\'attente le soir', risk: 'normal', emoji: '🤹', outcomes: [
        { probability: 0.5, text: 'Vos jongleries avec trois canettes chauffent le public mieux que le clown officiel. Le directeur vous glisse un billet « d\'artiste ».', moneyChange: 6, statChanges: { mental: 8, dignity: 4 } },
        { probability: 0.5, text: 'Le clown officiel défend son territoire. Une dispute entre un clown et vous, devant des enfants. Personne n\'en sort grandi.', statChanges: { mental: -4, dignity: -4 } },
      ]},
    ],
  },
  {
    id: 'exp-horodateur', title: 'L\'Horodateur Fou', type: 'discovery',
    image: '/assets/exp-horodateur.webp',
    description: 'Un horodateur imprime des tickets en continu, dans le vide, avec un petit bruit joyeux. Un automobiliste vient d\'y renoncer, furieux.',
    choices: [
      { text: 'Revendre des tickets aux automobilistes', risk: 'risky', emoji: '🎫', outcomes: [
        { probability: 0.5, text: 'Les tickets sont VALIDES. Vous les vendez à moitié prix aux conducteurs ravis. L\'horodateur imprime, vous encaissez. Une fintech est née.', moneyChange: 8, statChanges: { mental: 6 } },
        { probability: 0.5, text: 'Une contractuelle vous observe depuis dix minutes. Les tickets sont valides, votre commerce beaucoup moins. Elle confisque le fonds de caisse.', moneyChange: 1, statChanges: { mental: -4, dignity: -3 }, addFlag: 'reperee-contractuelle' },
      ]},
      { text: 'Prévenir la mairie, en bon citoyen', risk: 'safe', emoji: '📞', outcomes: [
        { probability: 0.6, text: 'L\'agent municipal arrive, constate, rigole, et vous laisse « les tickets du sinistre » : le rouleau entier. Ça fera de l\'allume-feu de luxe.', statChanges: { mental: 4 }, itemGain: { id: 'rouleau-tickets', name: 'Rouleau de tickets', emoji: '🧾', type: 'junk', value: 2 } },
        { probability: 0.4, text: 'Le standard vous fait répéter trois fois « l\'horodateur rit tout seul ». On vous raccroche au nez. La République doute de vous.', statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-depot-vente', title: 'Les Bacs du Dépôt-Vente', type: 'discovery',
    image: '/assets/exp-depot-vente.webp',
    description: 'Le dépôt-vente sort ses bacs « tout à 1€ » sur le trottoir. La gérante précise : « et ce qui reste ce soir, c\'est gratuit. » Le soir, c\'est dans dix heures.',
    choices: [
      { text: 'Fouiller les bacs maintenant', risk: 'normal', emoji: '🧥', outcomes: [
        { probability: 0.6, text: 'Une veste en velours côtelé, à peine élimée, exactement votre taille. Le destin a parfois du goût.', moneyChange: -1, statChanges: { dignity: 8, mental: 6 }, itemGain: { id: 'veste-velours', name: 'Veste en velours', emoji: '🧥', type: 'armor', value: 6, defenseBonus: 1 } },
        { probability: 0.4, text: 'Que des chargeurs Nokia et des VHS de fitness. Vous prenez une VHS. On ne sait jamais. Si, on sait. Mais quand même.', moneyChange: -1, statChanges: { mental: 2 }, itemGain: { id: 'vhs-fitness', name: 'VHS « Gym Tonic »', emoji: '📼', type: 'junk', value: 1 } },
      ]},
      { text: 'Revenir ce soir pour le gratuit', risk: 'normal', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'Il reste l\'essentiel : un pull, une casserole, un parapluie qui s\'ouvre presque. Le tout gratuit, comme promis. Parole de gérante.', statChanges: { mental: 6, dignity: 3 }, itemGain: { id: 'casserole-depot', name: 'Casserole vaillante', emoji: '🍳', type: 'tool', value: 4 } },
        { probability: 0.5, text: 'Tout est parti. Le quartier entier avait entendu « gratuit ». Il reste un cintre. Vous prenez le cintre. Par principe.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-serrurier', title: 'Le Serrurier Pédagogue', type: 'social',
    image: '/assets/exp-serrurier.webp',
    description: 'Un serrurier forme son apprenti sur une porte cochère. L\'apprenti transpire. Le serrurier soupire. La serrure, elle, résiste aux deux.',
    choices: [
      { text: 'Observer et apprendre', risk: 'safe', emoji: '👀', outcomes: [
        { probability: 0.7, text: 'Deux heures de masterclass gratuite sur les gorges et les pênes. Une compétence discrète mais précieuse s\'installe dans un coin de votre tête.', statChanges: { mental: 8 } },
        { probability: 0.3, text: 'Le serrurier vous repère : « toi, t\'as des yeux qui apprennent trop vite. » Compliment ou accusation, il vous offre le café dans le doute.', statChanges: { thirst: 8, mental: 5 } },
      ]},
      { text: 'Suggérer un truc de la rue', risk: 'normal', emoji: '💡', outcomes: [
        { probability: 0.5, text: 'Votre astuce à la radio médicale fonctionne. Le serrurier, vexé et admiratif, vous paie « la consultation ». L\'apprenti vous vénère.', moneyChange: 6, respectChange: 2, statChanges: { mental: 6 } },
        { probability: 0.5, text: '« Et tu sais ça d\'où, toi ? » Question piège. Votre silence est éloquent. Ils changent la serrure entière, en vous surveillant.', statChanges: { mental: -3, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-joueur-echecs', title: 'Le Joueur d\'Échecs', type: 'social',
    image: '/assets/exp-joueur-echecs.webp',
    description: 'Dans le parc, un vieux monsieur joue aux échecs contre personne depuis des années. Aujourd\'hui, il a sorti deux chaises.',
    choices: [
      { text: 'S\'asseoir et jouer', risk: 'safe', emoji: '♟️', outcomes: [
        { probability: 0.6, text: 'Il vous bat en douze coups, trois parties de suite, avec une joie féroce. Puis il partage son thermos et ses madeleines. Rituel adopté.', statChanges: { mental: 12, thirst: 6, hunger: 6 } },
        { probability: 0.4, text: 'Vous gagnez une partie. Le silence dure une minute entière. Puis : « revenez demain. » C\'est la plus belle victoire de votre année.', statChanges: { mental: 15, dignity: 5 }, respectChange: 2, addFlag: 'rival-echecs' },
      ]},
      { text: 'Parier une pièce sur la partie', risk: 'risky', emoji: '🪙', outcomes: [
        { probability: 0.4, text: 'Défaite héroïque mais honorable. Il refuse votre pièce : « on ne prend pas l\'argent d\'un joueur courageux. » Et double la mise en madeleines.', statChanges: { hunger: 10, mental: 8 } },
        { probability: 0.6, text: 'Massacre en huit coups. Il empoche votre pièce avec une élégance de croupier. « Les échecs, c\'est la vie. » Merci, ça vous saviez.', moneyChange: -1, statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'exp-poissonnier', title: 'La Fin du Marché aux Poissons', type: 'discovery',
    image: '/assets/exp-poissonnier.webp',
    description: 'Le poissonnier remballe en gueulant contre la marée, la mairie et le mois d\'août. Sur l\'étal fondent les dernières glaces, et trois maquereaux invendus.',
    choices: [
      { text: 'Proposer d\'aider à remballer', risk: 'safe', emoji: '🐟', outcomes: [
        { probability: 0.7, text: 'Une heure de caisses et d\'eau glacée. Salaire : les trois maquereaux et un cours magistral sur la fraîcheur. Vous puez, mais vous dînez.', statChanges: { hunger: 20, dignity: -3, mental: 5 } },
        { probability: 0.3, text: 'Il gueule aussi sur vous, par habitude, puis s\'excuse avec une barquette de crevettes. Le cœur des poissonniers est un mystère iodé.', statChanges: { hunger: 14, mental: 4 } },
      ]},
      { text: 'Demander juste la glace pilée', risk: 'normal', emoji: '🧊', outcomes: [
        { probability: 0.6, text: '« La glace ? Prends tout. » Un sac entier de fraîcheur : de quoi garder vos trouvailles au frais deux jours. Le luxe logistique.', statChanges: { mental: 4, thirst: 8 } },
        { probability: 0.4, text: '« La glace, elle est à la marée. » Réponse mystérieuse et définitive. Le folklore maritime a ses règles.', statChanges: { mental: -1 } },
      ]},
    ],
  },
  {
    id: 'exp-bus-touristique', title: 'Le Bus de Touristes Égaré', type: 'social',
    image: '/assets/exp-bus-touristique.webp',
    description: 'Un bus à impériale plein de touristes s\'est égaré dans la zone industrielle. Le guide, paniqué, improvise : « ... et ici, le quartier authentique ! »',
    choices: [
      { text: 'Jouer l\'attraction locale', risk: 'normal', emoji: '🎭', outcomes: [
        { probability: 0.6, text: 'Vous racontez trois anecdotes inventées sur « l\'usine hantée ». Les appareils photo crépitent, les pièces pleuvent du deuxième étage.', moneyChange: 7, statChanges: { mental: 8, dignity: -2 } },
        { probability: 0.4, text: 'Un touriste vous demande un selfie « avec le vrai local ». Vous posez. Vous êtes désormais sur douze réseaux sociaux, légendé « authentic ».', moneyChange: 3, statChanges: { dignity: -5, mental: 3 } },
      ]},
      { text: 'Remettre le chauffeur sur la bonne route', risk: 'safe', emoji: '🗺️', outcomes: [
        { probability: 0.7, text: 'Le guide, sauvé, fait la quête dans le bus « pour le guide local ». Un chapeau qui redescend plein. Le tourisme, ça paie.', moneyChange: 6, respectChange: 2 },
        { probability: 0.3, text: 'Le chauffeur suit vos indications... et se perd davantage. Vous montez à bord pour guider en direct. Visite improvisée, pourboire mérité.', moneyChange: 4, statChanges: { mental: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-antiquaire-cave', title: 'La Cave de l\'Antiquaire', type: 'discovery',
    image: '/assets/exp-antiquaire-cave.webp',
    description: 'L\'antiquaire vide sa cave sur le trottoir : « je prends ma retraite, tout doit disparaître. » Il y a un scaphandre. Personne ne demande pourquoi.',
    choices: [
      { text: 'Aider au tri contre rémunération', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Vous remontez quarante ans de brocante. Il vous paie, vous raconte chaque objet, et vous offre une boussole « pour retrouver votre nord ».', moneyChange: 7, statChanges: { mental: 8 }, itemGain: { id: 'boussole-laiton', name: 'Boussole en laiton', emoji: '🧭', type: 'junk', value: 7, effect: { mental: 5 } } },
        { probability: 0.3, text: 'La cave n\'a pas de fin. À 18h, vous êtes toujours dedans. Il vous paie double et jure qu\'il ne descendra plus jamais. Vous non plus.', moneyChange: 10, statChanges: { health: -4, mental: 3 } },
      ]},
      { text: 'Marchander le scaphandre', risk: 'risky', emoji: '🤿', outcomes: [
        { probability: 0.4, text: 'Il vous le DONNE, les larmes aux yeux : « il attendait quelqu\'un comme vous. » Le brocanteur louche vous le rachète une fortune le soir même.', moneyChange: 12, statChanges: { mental: 6 } },
        { probability: 0.6, text: '« Le scaphandre ? Jamais. » Il le remporte chez lui, sous le bras. Certains liens ne s\'expliquent pas.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-arbres-fruitiers', title: 'Les Arbres de la Ville', type: 'discovery',
    image: '/assets/exp-arbres-fruitiers.webp',
    description: 'Les pommiers « décoratifs » plantés par la mairie croulent sous les fruits. Personne n\'y touche : les gens croient que c\'est du plastique. C\'est des pommes.',
    choices: [
      { text: 'Faire la récolte à mains nues', risk: 'safe', emoji: '🍎', outcomes: [
        { probability: 0.8, text: 'Deux kilos de pommes municipales, sucrées comme un secret bien gardé. Vous croquez la première devant un passant sidéré : « ah, c\'est des vraies ?! »', statChanges: { hunger: 20, mental: 6 }, itemGain: { id: 'pommes-mairie', name: 'Pommes municipales', emoji: '🍎', type: 'food', value: 3, effect: { hunger: 12 } } },
        { probability: 0.2, text: 'Un agent des espaces verts vous observe... puis vous tend un sac : « au moins toi tu gaspilles pas. » La complicité des gens de terrain.', statChanges: { hunger: 22, mental: 5 }, respectChange: 1 },
      ]},
      { text: 'Grimper pour les plus hautes', risk: 'risky', emoji: '🧗', outcomes: [
        { probability: 0.5, text: 'Les pommes du sommet, gorgées de soleil, valent l\'escalade. Vous redescendez en héros du verger urbain, les poches pleines.', statChanges: { hunger: 25, mental: 8 } },
        { probability: 0.5, text: 'La branche décorative cède. Vous atterrissez dans le massif décoratif. Douleur non décorative.', statChanges: { health: -8, dignity: -4, hunger: 5 } },
      ]},
    ],
  },
  {
    id: 'exp-etudiants-sociologie', title: 'Les Étudiants en Sociologie', type: 'social',
    image: '/assets/exp-etudiants-sociologie.webp',
    description: 'Deux étudiants en sociologie vous abordent avec un dictaphone et des mots compliqués : ils font un mémoire sur « l\'habiter précaire ». C\'est vous, l\'habiter précaire.',
    choices: [
      { text: 'Répondre à l\'entretien', risk: 'safe', emoji: '🎙️', outcomes: [
        { probability: 0.6, text: 'Deux heures d\'entretien « semi-directif ». Ils paient en sandwich, café et gêne polie. Votre vie devient une note de bas de page. Elle méritait mieux.', statChanges: { hunger: 12, thirst: 8, mental: 5 }, moneyChange: 2 },
        { probability: 0.4, text: 'Vous inventez la moitié de vos réponses pour voir. Ils notent tout avec gravité. La science sociale encaisse le choc sans broncher.', statChanges: { mental: 8 } },
      ]},
      { text: 'Renverser l\'entretien', risk: 'normal', emoji: '🔄', outcomes: [
        { probability: 0.6, text: 'Vous les interrogez sur LEUR précarité : loyers, stages, avenir. À la fin, l\'un des deux pleure presque. Ils vous laissent leurs viennoiseries.', statChanges: { hunger: 10, mental: 8 }, respectChange: 1 },
        { probability: 0.4, text: '« C\'est pas le protocole. » Le protocole. Vous êtes face au protocole. L\'entretien s\'arrête, la viennoiserie reste. Victoire partielle.', statChanges: { hunger: 6, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-chien-perdu', title: 'Le Chien à Récompense', type: 'discovery',
    image: '/assets/exp-chien-perdu.webp',
    description: 'Un carlin asthmatique erre, médaille au cou : « Je m\'appelle Churchill. Si perdu, GROSSE récompense. » Churchill vous regarde. Vous regardez Churchill.',
    choices: [
      { text: 'Ramener Churchill chez lui', risk: 'safe', emoji: '🐶', outcomes: [
        { probability: 0.7, text: 'La propriétaire pleure sur son paillasson en marbre. La « grosse récompense » est réelle. Churchill, lui, semble déçu de rentrer.', moneyChange: 15, respectChange: 2, statChanges: { mental: 6 } },
        { probability: 0.3, text: 'Adresse introuvable, mais le vétérinaire scanne sa puce et prévient la famille. On vous remet « la commission du samaritain ». Churchill ronfle déjà.', moneyChange: 6, statChanges: { mental: 5 } },
      ]},
      { text: 'Passer d\'abord une journée avec lui', risk: 'normal', emoji: '🌭', outcomes: [
        { probability: 0.6, text: 'Churchill et vous partagez un hot-dog et un banc. Les passants donnent plus à un duo. Le soir, vous le ramenez, riches tous les deux.', moneyChange: 9, statChanges: { mental: 12 } },
        { probability: 0.4, text: 'Churchill fugue AUSSI de chez vous. Ce chien fuit tout le monde. Vous le retrouvez chez la propriétaire, qui vous soupçonne vaguement.', moneyChange: 3, statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'exp-recycleur-metaux', title: 'Le Roi du Cuivre', type: 'social',
    image: '/assets/exp-recycleur-metaux.webp',
    description: 'Un ferrailleur charge sa camionnette de métaux glanés. Il soupèse chaque pièce comme un bijoutier. « Le cuivre, petit, c\'est l\'or du pauvre. »',
    choices: [
      { text: 'Écouter la leçon de ferraille', risk: 'safe', emoji: '🎓', outcomes: [
        { probability: 0.7, text: 'Une heure de masterclass : où chercher, quoi laisser, qui paie comptant. Il vous offre votre premier kilo de cuivre « pour démarrer ».', moneyChange: 4, statChanges: { mental: 8 } },
        { probability: 0.3, text: 'La leçon dérive sur sa belle-sœur, la CAF et un différend de 1998. Passionnant autrement. Il vous paie le café de la digression.', statChanges: { thirst: 8, mental: 4 } },
      ]},
      { text: 'Lui vendre vos trouvailles en vrac', risk: 'normal', emoji: '⚖️', outcomes: [
        { probability: 0.6, text: 'Sa balance est honnête, chose rare. Vos fonds de sac deviennent des pièces sonnantes. Il ajoute un « bonus fidélité ». Vous reviendrez.', moneyChange: 7, respectChange: 1 },
        { probability: 0.4, text: '« Ça, c\'est de l\'alu peint, pas du cuivre. » Il a l\'œil, vous avez la naïveté. Il paie quand même le tarif alu, sans se moquer. Un seigneur.', moneyChange: 2, statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-buffet-seminaire', title: 'Le Buffet du Séminaire', type: 'discovery',
    image: '/assets/exp-buffet-seminaire.webp',
    description: 'Par la baie vitrée de l\'hôtel d\'affaires : un séminaire « Excellence & Leadership » vient de finir. Le buffet, intact, attend les serveurs. Les leaders n\'avaient pas faim.',
    choices: [
      { text: 'Entrer d\'un pas de consultant', risk: 'risky', emoji: '💼', outcomes: [
        { probability: 0.5, text: 'Badge imaginaire, regard occupé, assiette pleine. Vous mangez des mini-quiches d\'excellence en hochant la tête devant un paperboard. Personne ne doute.', statChanges: { hunger: 28, thirst: 12, mental: 8, dignity: 4 } },
        { probability: 0.5, text: 'Le responsable séminaire vous demande votre société. « Consulting indépendant » ne suffit pas. Sortie escortée, mais avec un wrap dans la manche.', statChanges: { hunger: 8, dignity: -5, mental: -3 } },
      ]},
      { text: 'Attendre les serveurs et demander poliment', risk: 'safe', emoji: '🙏', outcomes: [
        { probability: 0.7, text: 'Le maître d\'hôtel remplit deux barquettes : « de toute façon, la direction jette tout. » L\'excellence finit dans votre sac. Le leadership aussi.', statChanges: { hunger: 22, thirst: 8, mental: 5 } },
        { probability: 0.3, text: '« C\'est contre les normes. » Les mini-quiches partent à la benne sous vos yeux. Vous et le serveur partagez un long regard de défaite.', statChanges: { mental: -4, hunger: 2 } },
      ]},
    ],
  },
  {
    id: 'exp-lampadaire-morse', title: 'Le Lampadaire qui Clignote', type: 'narrative',
    image: '/assets/exp-lampadaire-morse.webp',
    description: 'Le lampadaire du coin clignote depuis des semaines. Cette nuit, vous en êtes sûr : c\'est du morse. Court-court-long. Quelqu\'un doute de votre santé mentale. Vous, un peu.',
    choices: [
      { text: 'Décoder le message', risk: 'normal', emoji: '💡', outcomes: [
        { probability: 0.5, text: 'Trois heures d\'observation : ça épelle « U-N-T-O-I-T ». Un toit. Le lampadaire vous promet un toit, ou l\'électricité municipale a de l\'humour. Vous choisissez d\'y croire.', statChanges: { mental: 10, sleep: -4 } },
        { probability: 0.3, text: 'Ça n\'épelle rien. C\'est un condensateur fatigué, comme vous. Mais vous avez passé la nuit avec une énigme, et c\'est mieux que sans.', statChanges: { mental: 4, sleep: -5 } },
        { probability: 0.2, text: 'Un électricien de nuit s\'arrête : « vous aussi vous l\'avez remarqué ?! » Vous n\'êtes pas fou, ou alors à deux. Il paie le café de la confrérie.', statChanges: { thirst: 8, mental: 8 } },
      ]},
      { text: 'Répondre en morse avec votre briquet', risk: 'safe', emoji: '🔦', outcomes: [
        { probability: 1, text: 'Vous clignotez « MERCI » vers le lampadaire. Il clignote toujours pareil. Les grandes amitiés sont souvent à sens unique.', statChanges: { mental: 6 } },
      ]},
    ],
  },
];
