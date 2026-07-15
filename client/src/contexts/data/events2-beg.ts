// ============================================================================
// MENDIER, VAGUE 2 (15 événements)
// ----------------------------------------------------------------------------
// Lot volontairement plus court : l'action Mendier privilégie le MINI-JEU
// (attraper les pièces), les événements narratifs restent l'exception.
// Ces textes nourrissent aussi les phrases de résultat du mini-jeu
// (voir flavorFrom). Fusionné dans BEG_EVENTS (voir events.ts).
// ============================================================================
import type { GameEvent } from '../types';

export const BEG_EVENTS_2: GameEvent[] = [
  {
    id: 'beg-sortie-boite', title: 'La Sortie de Boîte', type: 'social',
    image: '/assets/beg-sortie-boite.webp',
    description: 'Cinq heures du matin. Les fêtards sortent de boîte en titubant, la générosité multipliée par le taux d\'alcoolémie. Fenêtre de tir : quarante minutes.',
    choices: [
      { text: 'Tendre la main aux plus joyeux', risk: 'normal', emoji: '🕺', outcomes: [
        { probability: 0.6, text: 'Pluie de pièces, accolades non sollicitées, et un « t\'es un vrai toi » répété onze fois. L\'ivresse des autres est un métier d\'appoint.', moneyChange: 7, statChanges: { mental: 4, dignity: -2 } },
        { probability: 0.4, text: 'Un groupe décrète que vous êtes « le boss » et exige que vous dansiez avec eux. Vous dansez. Sur le trottoir. À 5h. Il y a des vidéos.', moneyChange: 3, statChanges: { mental: 8, sleep: -5, dignity: -4 } },
      ]},
      { text: 'Aider les naufragés à trouver un taxi', risk: 'safe', emoji: '🚕', outcomes: [
        { probability: 0.7, text: 'Trois clients guidés, trois pourboires de gratitude vacillante. Le dernier vous serre la main avec une émotion inexplicable et huit pièces.', moneyChange: 5, respectChange: 2 },
        { probability: 0.3, text: 'L\'un d\'eux vomit sur vos chaussures et s\'excuse en billets. C\'est le tarif le plus étrange de votre carrière, mais c\'est le tarif.', moneyChange: 8, statChanges: { dignity: -8, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-marathon', title: 'Le Marathon', type: 'social',
    image: '/assets/beg-marathon.webp',
    description: 'Le marathon traverse le quartier : des milliers de coureurs en souffrance volontaire, et des spectateurs qui distribuent tout ce qui se mange, se boit ou s\'encourage.',
    choices: [
      { text: 'Se poster près du ravitaillement', risk: 'safe', emoji: '🏃', outcomes: [
        { probability: 0.7, text: 'Bananes entamées, gourdes à moitié pleines, barres tombées : le ravitaillement déborde et personne ne compte. Vous mangez comme un athlète, sans courir. Le génie.', statChanges: { hunger: 15, thirst: 15, mental: 4 } },
        { probability: 0.3, text: 'Pris pour un bénévole, vous tendez des gobelets pendant deux heures. Épuisant, hydratant, et le staff partage la caisse de bananes finale avec vous.', statChanges: { hunger: 12, thirst: 8, mental: 8 }, respectChange: 3, moneyChange: 2 },
      ]},
      { text: 'Courir les 500 derniers mètres', risk: 'risky', emoji: '🏅', outcomes: [
        { probability: 0.5, text: 'La foule vous acclame sans vérifier le dossard. Quelqu\'un vous passe une médaille « finisher ». Techniquement, vous avez fini. Personne ne demande quoi.', statChanges: { mental: 15, dignity: 10 }, respectChange: 2 },
        { probability: 0.5, text: 'Un juge de course vous prend en chasse sur 300 mètres. Il est plus entraîné que vous. Tout le monde est plus entraîné que vous.', statChanges: { health: -4, mental: -3, dignity: -4 } },
      ]},
    ],
  },
  {
    id: 'beg-marche-noel', title: 'Le Marché de Noël', type: 'social',
    image: '/assets/beg-marche-noel.webp',
    description: 'Vin chaud, sapins, chorales et culpabilité de fin d\'année : le marché de Noël est une mine d\'or émotionnelle à ciel ouvert.',
    choices: [
      { text: 'Se poster près de la crèche', risk: 'normal', emoji: '🎄', outcomes: [
        { probability: 0.6, text: 'Entre le petit Jésus et le stand de churros, l\'esprit de Noël sort les portefeuilles. Une dame vous offre même des chaussettes à renne. La magie opère.', moneyChange: 8, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Le Père Noël officiel du marché vous fait déguerpir : « c\'est MON spot. » Un Père Noël syndiqué. Vous cédez le terrain avec les pièces déjà tombées.', moneyChange: 2, statChanges: { mental: -4 }, respectChange: -1, addFlag: 'ennemi-pere-noel' },
      ]},
      { text: 'Chanter des chants de Noël', risk: 'normal', emoji: '🎵', outcomes: [
        { probability: 0.5, text: 'Votre « Petit Papa Noël » éraillé émeut aux larmes une génération entière. Le chapeau déborde. Un enfant vous demande si vous êtes le vrai. Vous ne démentez pas.', moneyChange: 9, statChanges: { dignity: 5, mental: 6 } },
        { probability: 0.5, text: 'Vous ne connaissez que le premier couplet. En boucle. Vingt fois. Le stand de vin chaud vous paie pour... varier. Ça compte comme un cachet.', moneyChange: 3, statChanges: { mental: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-feu-rouge', title: 'Le Grand Carrefour', type: 'social',
    image: '/assets/beg-feu-rouge.webp',
    description: 'Le carrefour aux quatre-vingt-dix secondes de feu rouge : une éternité à l\'échelle d\'un pare-brise, un fonds de commerce à l\'échelle d\'un homme.',
    choices: [
      { text: 'Laver les pare-brise', risk: 'normal', emoji: '🧽', outcomes: [
        { probability: 0.5, text: 'Coup de raclette, sourire, pièce. La chaîne de production tourne bien : sept voitures, six pièces, un pouce levé. L\'industrie automobile vous doit beaucoup.', moneyChange: 6, statChanges: { mental: 3 } },
        { probability: 0.3, text: 'Vitres teintées, essuie-glaces déclenchés en défense anti-aérienne, et un scooter qui vous frôle : le carrefour est une jungle avec des clignotants.', moneyChange: 2, statChanges: { mental: -4, dignity: -3 } },
        { probability: 0.2, text: 'Un taxi vous fait signe : « le pare-brise ET les rétros, champion. » Il paie double et vous raconte ses trente ans de carrefour. Une encyclopédie en Renault.', moneyChange: 5, respectChange: 2, statChanges: { mental: 4 } },
      ]},
      { text: 'Faire le tour avec une pancarte drôle', risk: 'safe', emoji: '📋', outcomes: [
        { probability: 0.6, text: '« Pas de QR code, monnaie acceptée. » Les vitres se baissent en riant. L\'humour reste la meilleure raclette.', moneyChange: 5, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Tout le monde regarde son téléphone. Vous pourriez brandir n\'importe quoi. Vous testez : rien. La pancarte prend l\'humidité, vous prenez sur vous.', moneyChange: 1, statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-queue-lancement', title: 'La Queue du Lancement', type: 'social',
    image: '/assets/beg-queue-lancement.webp',
    description: 'Devant la boutique de téléphones, trois cents personnes campent depuis l\'aube pour un rectangle à 1400€. Certains ont des tentes. Vous avez l\'expertise.',
    choices: [
      { text: 'Vendre vos services de gardien de place', risk: 'normal', emoji: '📱', outcomes: [
        { probability: 0.6, text: 'Garder la place 47 pendant les pauses pipi : trois clients, tarif libre, paiement immédiat. Votre première clientèle premium. Ils reviendront l\'an prochain.', moneyChange: 8, statChanges: { mental: 4 } },
        { probability: 0.4, text: 'Une embrouille de resquille éclate et on vous accuse, vous, l\'homme sans téléphone. L\'ironie est totale, l\'expulsion aussi. Un campeur honteux vous glisse deux pièces.', moneyChange: 2, statChanges: { mental: -5, dignity: -3 } },
      ]},
      { text: 'Mendier avec la pancarte « pas pour un téléphone »', risk: 'safe', emoji: '😏', outcomes: [
        { probability: 0.7, text: 'L\'ironie fait mouche : la file entière rit jaune et paie. Le vigile lui-même met une pièce. Vous êtes la meilleure critique sociale du trottoir.', moneyChange: 7, statChanges: { mental: 6 }, respectChange: 1 },
        { probability: 0.3, text: 'Un influenceur vous filme « pour dénoncer », monétise la vidéo, et ne donne rien. Vous êtes viral et pauvre. Le monde moderne en une transaction.', statChanges: { mental: -4, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'beg-zoo', title: 'La Sortie du Zoo', type: 'social',
    image: '/assets/beg-zoo.webp',
    description: 'La sortie du zoo : familles épuisées, enfants surexcités, glaces fondues et bonne humeur solvable. Le meilleur public de la ville sort toujours d\'entre les girafes.',
    choices: [
      { text: 'Imiter les animaux pour les enfants', risk: 'normal', emoji: '🦁', outcomes: [
        { probability: 0.6, text: 'Votre otarie est bluffante, votre lion perfectible, votre flamant rose inoubliable. Les parents paient le spectacle, les enfants exigent un rappel.', moneyChange: 6, statChanges: { mental: 6, dignity: -2 } },
        { probability: 0.4, text: 'Vous imitez le paon TROP bien : un vrai paon échappé vous répond, roue déployée, dans un face-à-face que personne n\'oubliera. Le zoo vous dédommage pour la capture.', moneyChange: 4, statChanges: { mental: 4, dignity: -3 }, respectChange: 1 },
      ]},
      { text: 'Simplement tendre son chapeau', risk: 'safe', emoji: '🎩', outcomes: [
        { probability: 0.6, text: 'Les pièces des familles tombent, arrondies à l\'humeur du dimanche. Un grand-père ajoute un billet « parce que vous, au moins, vous êtes en liberté ». À méditer.', moneyChange: 4, statChanges: { mental: 3 } },
        { probability: 0.4, text: 'Un enfant dépose son ticket du zoo dans le chapeau : « pour que tu puisses voir les singes. » Vous encadreriez presque ce ticket.', moneyChange: 1, statChanges: { mental: 10 } },
      ]},
    ],
  },
  {
    id: 'beg-terrasse-brunch', title: 'La Terrasse du Brunch', type: 'social',
    image: '/assets/beg-terrasse-brunch.webp',
    description: 'Le dimanche, la terrasse du brunch déborde d\'avocado toasts à 17€ et de conversations sur l\'immobilier. La culpabilité y est servie à volonté.',
    choices: [
      { text: 'Passer entre les tables, digne', risk: 'normal', emoji: '🥑', outcomes: [
        { probability: 0.5, text: 'La culpabilité du dimanche matin paie mieux qu\'un travail : quatre tables, quatre dons, dont un billet plié « discrètement ». Merci l\'avocat à 17€.', moneyChange: 8, statChanges: { dignity: -2 } },
        { probability: 0.3, text: 'Le patron vous éconduit mais vous rattrape en cuisine : un sac entier « d\'invendus du brunch ». Le granola bio, c\'est ceux qui l\'ont pas payé qui en parlent le mieux.', statChanges: { hunger: 18, mental: 4 } },
        { probability: 0.2, text: 'Quelqu\'un propose de vous prendre en photo « pour sensibiliser », contre un billet. Vous posez. La sensibilisation a bon dos, le billet est réel.', moneyChange: 5, statChanges: { dignity: -5 } },
      ]},
      { text: 'Attendre la fermeture pour les restes', risk: 'safe', emoji: '⏳', outcomes: [
        { probability: 0.7, text: 'Le serveur vous prépare un doggy-bag de restes chics : œufs bénédicte froids et pancakes fatigués. Le brunch des braves.', statChanges: { hunger: 20, thirst: 5, mental: 3 } },
        { probability: 0.3, text: '« Tout part au compost, réglementation. » Vous regardez des pancakes partir au compost. Le compost mange mieux que vous. Dure journée philosophique.', statChanges: { mental: -4, hunger: 4 } },
      ]},
    ],
  },
  {
    id: 'beg-videur', title: 'Le Videur Compatissant', type: 'social',
    image: '/assets/beg-videur.webp',
    description: 'Le videur de la boîte chic s\'ennuie ferme entre deux refus. Deux mètres, cent trente kilos, et un regard qui vous a déjà classé « inoffensif, causant ».',
    choices: [
      { text: 'Tenir compagnie au colosse', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Trois heures de philosophie de comptoir debout. Il partage son sandwich, les pièces du vestiaire, et sa théorie sur les gens « qui puent des chaussures mais pas du cœur ». Vous êtes cité en exemple.', statChanges: { hunger: 12, mental: 6 }, moneyChange: 4, respectChange: 2, addFlag: 'pote-videur' },
        { probability: 0.3, text: 'Il vous apprend deux prises de self-défense « pour la rue » sur un lampadaire consentant. Le lampadaire a perdu, vous avez appris.', statChanges: { mental: 6, health: 3 }, respectChange: 2 },
      ]},
      { text: 'Trier les recalés avec lui', risk: 'normal', emoji: '😎', outcomes: [
        { probability: 0.6, text: 'Votre œil de la rue repère les emmerdeurs à vingt mètres. Le videur valide chaque pronostic et paie « au bon client ». Une carrière de physionomiste s\'ouvre.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Vous recalez un type en jogging : c\'était le patron de la boîte. Le videur pleure de rire. Le patron, moins. La collaboration prend fin, le fou rire reste.', moneyChange: 1, statChanges: { mental: 4 }, respectChange: -1 },
      ]},
    ],
  },
  {
    id: 'beg-karaoke', title: 'La Sortie du Karaoké', type: 'social',
    image: '/assets/beg-karaoke.webp',
    description: 'Le bar karaoké recrache ses clients à 2h : cordes vocales détruites, egos gonflés à l\'hélium, et une générosité proportionnelle au nombre de « I Will Survive » chantés.',
    choices: [
      { text: 'Complimenter leurs performances', risk: 'safe', emoji: '🎤', outcomes: [
        { probability: 0.7, text: '« Je vous ai entendu de dehors, quelle voix ! » Techniquement vrai : tout le quartier les a entendus. Les artistes flattés paient cash. La critique musicale nourrit son homme.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.3, text: 'Une bande vous embarque à l\'intérieur pour « un dernier morceau ». Vous chantez « Les Lacs du Connemara » devant douze inconnus debout. Chapeau plein, gorge morte, légende née.', moneyChange: 8, statChanges: { mental: 10, sleep: -6, dignity: 3 } },
      ]},
      { text: 'Chanter dans la rue, en concurrence', risk: 'risky', emoji: '🎶', outcomes: [
        { probability: 0.5, text: 'Votre a cappella de trottoir surclasse leur machine à 3000€. Le patron du karaoké sort vous écouter, vexé et admiratif. Il paie « le cachet du rival ».', moneyChange: 7, statChanges: { mental: 8 }, respectChange: 2 },
        { probability: 0.5, text: 'Un client éméché veut un duel de chant. Il gagne. Un homme en chemise hawaïenne vous bat aux points sur du Céline Dion. Il faut savoir perdre.', moneyChange: 2, statChanges: { mental: -3, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-cours-yoga', title: 'Le Yoga du Parc', type: 'social',
    image: '/assets/beg-cours-yoga.webp',
    description: 'Trente personnes saluent le soleil sur des tapis à 80€, encadrées par une prof qui parle d\'« abondance » et d\'« ouverture au monde ». Le monde, c\'est vous. Voyons voir l\'ouverture.',
    choices: [
      { text: 'S\'installer au fond et suivre le cours', risk: 'normal', emoji: '🧘', outcomes: [
        { probability: 0.6, text: 'La prof vous intègre d\'un geste : « l\'accueil, c\'est ÇA le yoga. » À la fin, elle fait circuler un chapeau « pour notre invité ». Trente namastés et un chapeau lourd. L\'abondance, donc.', moneyChange: 6, statChanges: { mental: 8, health: 3 } },
        { probability: 0.4, text: 'Vous vous endormez en Savasana, la posture du sommeil. Techniquement, vous êtes le meilleur élève. Vos ronflements guident la méditation collective. On vous remercie « pour l\'ancrage ».', statChanges: { sleep: 10, mental: 4, dignity: -3 } },
      ]},
      { text: 'Garder les sacs pendant la séance', risk: 'safe', emoji: '🎒', outcomes: [
        { probability: 0.7, text: 'Trente sacs surveillés, zéro incident, pourboires détendus à la sortie. Les gens zen paient bien la tranquillité d\'esprit. C\'est même tout leur budget.', moneyChange: 5, respectChange: 1 },
        { probability: 0.3, text: 'Un corbeau ouvre un sac et vole une barre de céréales sous vos yeux. Vous poursuivez le corbeau. Le cours entier regarde. Le zen a ses limites, le corbeau n\'en a pas.', moneyChange: 2, statChanges: { mental: -2, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-chef-etoile', title: 'Le Chef Étoilé', type: 'social',
    image: '/assets/beg-chef-etoile.webp',
    description: 'Le restaurant gastronomique jette ses assiettes « imparfaites » à 23h. Le chef fume dehors, l\'œil sombre, en gueulant en cuisine par la porte entrouverte. Un artiste.',
    choices: [
      { text: 'Complimenter sa cuisine (de loin)', risk: 'safe', emoji: '👨‍🍳', outcomes: [
        { probability: 0.6, text: '« Vous en pensez quoi, VOUS, du pigeon en deux façons ? » Il vous fait goûter le plat « raté » du soir. C\'est le meilleur repas de votre décennie. Le pigeon est vengé.', statChanges: { hunger: 30, mental: 15, dignity: 5 } },
        { probability: 0.4, text: 'Il grommelle un truc sur les critiques et rentre. Mais son second sort deux minutes plus tard avec un contenant : « le chef dit que c\'est pour le connaisseur. »', statChanges: { hunger: 18, thirst: 4, mental: 6 } },
      ]},
      { text: 'Proposer d\'être goûteur-critique', risk: 'risky', emoji: '🍽️', outcomes: [
        { probability: 0.5, text: '« Enfin un palais sans filtre ! » Votre verdict sur la sauce (« ça manque de gras ») le bouleverse. Repas complet, pièce, et rendez-vous jeudi pour le nouveau menu.', statChanges: { hunger: 25, mental: 8 }, moneyChange: 4, respectChange: 2 },
        { probability: 0.5, text: '« Tout le monde est critique. TOUT LE MONDE. » La porte claque. Une serveuse vous glisse du pain en s\'excusant pour l\'artiste. Les grands hommes sont difficiles.', statChanges: { hunger: 8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-braderie', title: 'La Grande Braderie', type: 'social',
    image: '/assets/beg-braderie.webp',
    description: 'La braderie annuelle : la ville entière vend son grenier sur le trottoir et boit du blanc à 10h du matin. L\'argent liquide circule comme au siècle dernier.',
    choices: [
      { text: 'Porter les cartons des chineurs', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Sherpa officiel de la braderie : quatre commodes, une armoire, dix cartons. Les pourboires tombent, et une dame vous offre le vase que vous venez de porter. Il est affreux. Il est à vous.', moneyChange: 6, statChanges: { health: -3, mental: 4 }, itemGain: { id: 'vase-affreux', name: 'Vase affreux (cadeau)', emoji: '🏺', type: 'junk', value: 5 } },
        { probability: 0.3, text: 'Un carton de vaisselle vous glisse des mains. Le fracas fait se retourner la moitié de la braderie. Retenue sur pourboire, mais le client avoue : « elle était moche de toute façon. »', moneyChange: 2, statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Chiner dans les tas « tout doit disparaître »', risk: 'normal', emoji: '🔍', outcomes: [
        { probability: 0.5, text: 'Une veste en velours presque neuve, à votre taille, à un prix symbolique que le vendeur arrondit à zéro « pour vider ». La braderie a ses miracles.', statChanges: { dignity: 8, mental: 6 }, itemGain: { id: 'veste-braderie', name: 'Veste de la braderie', emoji: '🧥', type: 'armor', value: 6, defenseBonus: 1 } },
        { probability: 0.5, text: 'Que des chargeurs de téléphones morts et des puzzles incomplets. Vous prenez un puzzle. Il manque 40 pièces. Comme à vous. Solidarité.', statChanges: { mental: 3 }, itemGain: { id: 'puzzle-incomplet', name: 'Puzzle (960/1000 pièces)', emoji: '🧩', type: 'junk', value: 1, effect: { mental: 4 } } },
      ]},
    ],
  },
  {
    id: 'beg-food-trucks', title: 'Le Festival de Food Trucks', type: 'social',
    image: '/assets/beg-food-trucks.webp',
    description: 'Douze camions, mille odeurs, des files d\'attente vertigineuses et des assiettes à moitié finies qui partent à la poubelle. Un scandale logistique. Une opportunité.',
    choices: [
      { text: 'Se poster près du retour des plateaux', risk: 'normal', emoji: '🌮', outcomes: [
        { probability: 0.6, text: 'Les gens préfèrent vous tendre leur assiette entamée que la jeter. En deux heures, vous goûtez la carte entière du festival. Le critique gastronomique le mieux nourri de la ville.', statChanges: { hunger: 22, mental: 4, dignity: -4 } },
        { probability: 0.4, text: 'Le régisseur vous repère... et vous embauche au tri des déchets, payé en tacos et en pièces. Le seul CDD d\'une journée dont le ticket-restaurant est un taco.', statChanges: { hunger: 18, mental: 5 }, moneyChange: 4, respectChange: 2 },
      ]},
      { text: 'Jouer les guides gastronomiques', risk: 'normal', emoji: '🗺️', outcomes: [
        { probability: 0.6, text: '« Le coréen : 40 minutes. Le libanais : 10 minutes et meilleur. » Vos conseils de file d\'attente valent pourboire. L\'information est la denrée la plus rentable du festival.', moneyChange: 6, statChanges: { mental: 5 } },
        { probability: 0.4, text: 'Vous envoyez tout le monde au camion le plus lent par erreur. Une file de quarante personnes vous cherche. Vous dégustez votre erreur en marchant vite.', moneyChange: 1, statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'beg-averse', title: 'L\'Averse Soudaine', type: 'social',
    image: '/assets/beg-averse.webp',
    description: 'Un orage éclate sans prévenir sur la place. Vous êtes le seul être humain du quartier à posséder... un parapluie cassé. La demande explose, l\'offre c\'est vous.',
    choices: [
      { text: 'Escorter les passants à l\'abri', risk: 'normal', emoji: '☔', outcomes: [
        { probability: 0.6, text: 'Le taxi-parapluie fait recette : dix mètres, une pièce, sourire compris. Votre moitié de parapluie protège des moitiés de clients, tout le monde accepte le contrat.', moneyChange: 7, statChanges: { mental: 5, health: -2 } },
        { probability: 0.4, text: 'Le parapluie rend l\'âme sur une cliente en tailleur, qui finit rincée. Elle vous paie quand même « pour l\'intention ». L\'intention était sèche.', moneyChange: 2, statChanges: { mental: -3, dignity: -3 } },
      ]},
      { text: 'Louer votre porche sec', risk: 'safe', emoji: '🏠', outcomes: [
        { probability: 0.7, text: 'Votre porche devient un abri premium. Les réfugiés de l\'averse paient le droit d\'asile en pièces et en conversation. Propriétaire de dix minutes, ça fait quelque chose.', moneyChange: 5, statChanges: { mental: 5 }, respectChange: 1 },
        { probability: 0.3, text: 'Quinze personnes s\'entassent sous votre porche, ambiance sardines solidaires. Personne ne paie mais quelqu\'un partage ses churros. L\'économie du troc sous la pluie.', statChanges: { hunger: 10, mental: 6 } },
      ]},
    ],
  },
  {
    id: 'beg-bingo', title: 'La Sortie du Loto des Anciens', type: 'social',
    image: '/assets/beg-bingo.webp',
    description: 'La salle des fêtes libère le loto du jeudi : quatre-vingts retraités, des cabas à roulettes, et une gagnante du jambon qui rayonne comme un phare.',
    choices: [
      { text: 'Féliciter la gagnante du jambon', risk: 'safe', emoji: '🍖', outcomes: [
        { probability: 0.7, text: '« Soixante ans que je joue ! » Elle raconte le quine victorieux en détail, puis coupe le jambon EN DEUX : « à mon âge, on partage sa chance. » Un demi-jambon. Une reine.', statChanges: { hunger: 25, mental: 10 }, respectChange: 1 },
        { probability: 0.3, text: 'Elle vous prend pour l\'animateur du loto et vous félicite pour « la belle soirée ». Vous acceptez le malentendu et le paquet de madeleines qui va avec.', statChanges: { hunger: 10, mental: 5 } },
      ]},
      { text: 'Aider à porter les cabas à roulettes', risk: 'safe', emoji: '🛒', outcomes: [
        { probability: 0.7, text: 'Six cabas raccompagnés, six pièces, trois invitations à « repasser goûter » et un pronostic météo détaillé. Les anciens paient en monnaie ET en humanité. Taux de change imbattable.', moneyChange: 5, statChanges: { mental: 8 }, respectChange: 2 },
        { probability: 0.3, text: 'Monsieur Robert, 91 ans, refuse l\'aide et vous met au défi à la marche rapide. Il gagne. Devant témoins. Il vous console avec un caramel : « c\'est l\'entraînement, petit. »', statChanges: { mental: 4, dignity: -3, hunger: 2 } },
      ]},
    ],
  },
];
