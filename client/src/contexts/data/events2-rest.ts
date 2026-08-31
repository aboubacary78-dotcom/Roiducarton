// ============================================================================
// DORMIR, VAGUE 2 (50 événements)
// ----------------------------------------------------------------------------
// Second lot d'endroits où fermer l'œil : du confessionnal au château
// gonflable dégonflé. Fusionné dans REST_EVENTS (voir events.ts).
// Images /assets/rest-<id>.webp avec repli automatique tant qu'absentes.
// ============================================================================
import type { GameEvent } from '../types';

export const REST_EVENTS_2: GameEvent[] = [
  {
    id: 'rest-salle-attente', title: 'La Salle d\'Attente', type: 'narrative',
    image: '/assets/rest-salle-attente.webp',
    description: 'Les urgences sont ouvertes toute la nuit, et personne ne demande rien à celui qui attend. Vous êtes très doué pour attendre.',
    choices: [
      { text: 'S\'installer avec un vieux magazine', risk: 'safe', emoji: '🪑', outcomes: [
        { probability: 0.7, text: 'Chauffage, distributeur, paix. Vous dormez assis, un « Paris Match » de 2016 sur les genoux. Personne ne vous réveille : vous avez l\'air d\'attendre des nouvelles.', statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: 'À 4h, un infirmier vous secoue doucement : « on ferme pas, mais bougez un peu. » Il glisse une brique de jus dans votre poche. Le personnel de nuit sait.', statChanges: { sleep: 12, thirst: 8, mental: 4 } },
      ]},
      { text: 'Simuler une entorse pour un lit', risk: 'risky', emoji: '🛏️', outcomes: [
        { probability: 0.4, text: 'Un brancard dans un couloir tiède. Techniquement un lit, techniquement un mensonge, mais quel sommeil.', statChanges: { sleep: 30, health: 5 } },
        { probability: 0.6, text: 'L\'interne de garde vous ausculte trente secondes : « les lits, c\'est pour les cassés. Le café, c\'est offert. » Diagnostic sans appel, café correct.', statChanges: { dignity: -6, sleep: 6, thirst: 6, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-cinema-permanent', title: 'La Nuit des Nanars', type: 'narrative',
    image: '/assets/rest-cinema-permanent.webp',
    description: 'Le cinéma du quartier programme une nuit « nanars cultes ». Le caissier somnole déjà. Trois films, une salle chauffée, des fauteuils profonds.',
    choices: [
      { text: 'Se glisser dans la salle', risk: 'normal', emoji: '🎬', outcomes: [
        { probability: 0.6, text: 'Vous dormez à travers trois chefs-d\'œuvre du mauvais goût. Les explosions font office de berceuse. Réveil au générique, reposé et culturellement enrichi.', statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.4, text: 'Expulsé au deuxième film, mais QUEL film. Un requin-tornade contre des cosmonautes. Ça valait la sortie escortée.', statChanges: { sleep: 8, mental: 3, dignity: -3 } },
      ]},
      { text: 'Fouiller sous les sièges d\'abord', risk: 'normal', emoji: '🍿', outcomes: [
        { probability: 0.5, text: 'Récolte : un demi-paquet de popcorn, de la monnaie tombée et un gant. Puis dodo au fond de la salle. La totale.', statChanges: { hunger: 10, sleep: 10 }, moneyChange: 3 },
        { probability: 0.5, text: 'Un chewing-gum millésimé s\'attache à votre manche pour la vie. Vous dormez quand même. Lui aussi.', statChanges: { dignity: -3, sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-confessionnal', title: 'Le Confessionnal', type: 'narrative',
    image: '/assets/rest-confessionnal.webp',
    description: 'L\'église reste ouverte. Le confessionnal est capitonné, à taille humaine, et étonnamment douillet. Dieu ne ronfle pas, lui.',
    choices: [
      { text: 'Y dormir humblement', risk: 'normal', emoji: '🙏', outcomes: [
        { probability: 0.6, text: 'Nuit de velours et d\'encens. Vous dormez comme un secret bien gardé. Au réveil, quelqu\'un a laissé un cierge allumé pour vous. Ou pour quelqu\'un. Pour vous, décidons.', statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.4, text: 'Le curé du matin ouvre la grille et attend. À moitié endormi, vous confessez des choses. Notamment le sandwich de mardi. Il vous absout et vous paie un café.', statChanges: { sleep: 15, mental: -2, dignity: -3, thirst: 6 }, respectChange: 1 },
      ]},
      { text: 'Rester sur un banc, plus honnête', risk: 'safe', emoji: '⛪', outcomes: [
        { probability: 1, text: 'Le bois est dur mais le silence est doux. Les vitraux vous fabriquent des rêves colorés.', statChanges: { sleep: 12, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-bus-nuit', title: 'Le Bus de Nuit', type: 'narrative',
    image: '/assets/rest-bus-nuit.webp',
    description: 'La ligne N12 tourne en boucle jusqu\'à l\'aube. Chauffage poussif, ronron du moteur, banquette du fond libre. Le grand tour de la ville pour le prix d\'un regard entendu.',
    choices: [
      { text: 'Faire la boucle complète', risk: 'safe', emoji: '🚌', outcomes: [
        { probability: 0.7, text: 'Le chauffeur vous a vu, a hoché la tête, et n\'a rien dit. Quatre boucles plus tard, il annonce « terminus, l\'ami » avec une douceur de réveil-matin humain.', statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.3, text: 'Un contrôleur monte à 3h. Vous n\'avez pas de titre de transport. Il regarde vos chaussures, soupire : « cette nuit c\'est gratuit, mais rêve ailleurs demain. » Un poète.', statChanges: { sleep: 12, mental: 6 } },
      ]},
      { text: 'S\'endormir sans se fixer de terminus', risk: 'risky', emoji: '😴', outcomes: [
        { probability: 0.5, text: 'Vous vous réveillez au dépôt, à huit kilomètres, frais comme un gardon. Un gardon à huit kilomètres de son carton, mais frais.', statChanges: { sleep: 25, mental: -4 } },
        { probability: 0.5, text: 'Un enterrement de vie de garçon envahit le bus à 2h. Ils chantent faux, mais ils paient votre « péage de banquette » en pièces et en chips.', statChanges: { sleep: 6, hunger: 8 }, moneyChange: 2 },
      ]},
    ],
  },
  {
    id: 'rest-showroom-matelas', title: 'Le Magasin de Literie', type: 'narrative',
    image: '/assets/rest-showroom-matelas.webp',
    description: '« Essayez nos matelas, sans engagement ! » claironne le vendeur. Sans engagement. Il ne sait pas à qui il parle.',
    choices: [
      { text: 'Essayer TRÈS consciencieusement', risk: 'normal', emoji: '🛏️', outcomes: [
        { probability: 0.5, text: 'Vingt minutes de mémoire de forme avant le toussotement poli du vendeur. Votre dos se souviendra de ce matelas toute sa vie. C\'est ça, la mémoire de forme.', statChanges: { sleep: 16, mental: 8, dignity: -2 } },
        { probability: 0.5, text: 'Vous sombrez pour de bon. Un enfant vous prend en photo, le vendeur appelle son manager, le manager n\'ose pas vous réveiller. Vous partez seul, reposé, mythique.', statChanges: { sleep: 18, dignity: -6, mental: 4 } },
      ]},
      { text: 'Demander le modèle d\'expo déclassé', risk: 'risky', emoji: '💬', outcomes: [
        { probability: 0.4, text: 'Le vendeur, un ancien de la rue lui aussi, vous donne un surmatelas « taché invendable ». La tache est une légende. Le confort est réel.', statChanges: { sleep: 10, mental: 10 }, respectChange: 1 },
        { probability: 0.6, text: '« Monsieur, ici on VEND du sommeil. » Vous, vous en cherchez juste. Vous sortez avant qu\'il appelle quelqu\'un.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-carton-frigo', title: 'Le Carton du Frigo Américain', type: 'discovery',
    image: '/assets/rest-carton-frigo.webp',
    description: 'La boutique d\'électroménager jette LE carton : celui d\'un frigo américain double porte. Double épaisseur, taille XXL, à peine humide. Le penthouse du carton.',
    choices: [
      { text: 'L\'aménager en suite royale', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.8, text: 'Porte découpée, rabats en auvent, journal en isolation. La meilleure nuit du mois, dans un palace qui sent le polystyrène neuf.', statChanges: { sleep: 22, mental: 10, dignity: 4 } },
        { probability: 0.2, text: 'Un autre connaisseur arrive avec les mêmes intentions. Négociation d\'experts : il prend le carton du lave-linge, vous gardez le frigo. La hiérarchie est respectée.', statChanges: { sleep: 14, mental: 4 }, respectChange: 2 },
      ]},
      { text: 'Le revendre à un étudiant qui déménage', risk: 'normal', emoji: '💶', outcomes: [
        { probability: 0.6, text: 'L\'étudiant paie cash pour « le carton parfait ». Vous dormez à la dure, avec des pièces qui tintent à chaque fois que vous vous retournez.', moneyChange: 5, statChanges: { sleep: 4, mental: 3 } },
        { probability: 0.4, text: 'Il paie en pièces rouges et en gratitude. Compter les centimes prend plus de temps que la vente. La nuit est courte et le carton est parti.', moneyChange: 2, statChanges: { sleep: 4, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-hall-code', title: 'Le Hall au Code Prévisible', type: 'narrative',
    image: '/assets/rest-hall-code.webp',
    description: 'Le code de l\'immeuble est écrit au feutre sur le mur d\'à côté : « 1234 ». Les gens sont prévisibles. Le radiateur du hall, lui, est une valeur sûre.',
    choices: [
      { text: 'Dormir sous les boîtes aux lettres', risk: 'normal', emoji: '🏢', outcomes: [
        { probability: 0.6, text: 'Radiateur, moquette, veilleuse. Le luxe discret d\'un trois étoiles vertical. Vous partez avant le premier travailleur, comme un gentleman cambrioleur du sommeil.', statChanges: { sleep: 18, health: 3 } },
        { probability: 0.4, text: 'La femme de ménage de 6h vous déloge à la serpillière, gentiment mais fermement. Elle vous laisse finir votre rêve debout, dans l\'encadrement.', statChanges: { sleep: 10, dignity: -3 } },
      ]},
      { text: 'Monter au dernier palier', risk: 'risky', emoji: '⬆️', outcomes: [
        { probability: 0.5, text: 'Sixième étage, personne n\'y passe jamais. Une lucarne, les étoiles, le silence. La chambre avec vue la moins chère de la ville.', statChanges: { sleep: 24, mental: 5 } },
        { probability: 0.5, text: 'Un locataire insomniaque appelle « la sécurité » : son beau-frère, qui descend en pyjama. La discussion en pyjama à 3h a une dignité très relative, pour tout le monde.', statChanges: { sleep: 6, mental: -4, health: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-serre-tropicale', title: 'La Serre Tropicale', type: 'discovery',
    image: '/assets/rest-serre-tropicale.webp',
    description: 'La serre du jardin botanique ferme mal. À l\'intérieur : 26 degrés toute l\'année, hygrométrie parfaite, et un perroquet qui a tout vu.',
    choices: [
      { text: 'Nuit sous les palmiers', risk: 'normal', emoji: '🌴', outcomes: [
        { probability: 0.6, text: 'Vous dormez dans un climat de carte postale, bercé par le goutte-à-goutte automatique. Vous rêvez de plage. Le réveil est rude mais bronzé de l\'âme.', statChanges: { sleep: 22, mental: 10, health: 3 } },
        { probability: 0.4, text: 'Le perroquet répète vos paroles de sommeil au gardien du matin : « ENCORE CINQ MINUTES. ENCORE CINQ MINUTES. » Trahison à plumes. Le gardien rit trop pour sévir.', statChanges: { sleep: 15, dignity: -4, mental: 4 } },
      ]},
      { text: 'Trop beau pour être vrai, repartir', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Vous refermez la porte sur l\'été perpétuel. Certains paradis sont des pièges. D\'autres ont juste un perroquet.', statChanges: { sleep: 6, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-peniche', title: 'La Péniche Amarrée', type: 'discovery',
    image: '/assets/rest-peniche.webp',
    description: 'Une péniche de chantier hiverne le long du quai. Pont bâché, cale sèche, clapotis en fond sonore. L\'appel du large, version canal.',
    choices: [
      { text: 'Dormir dans la cale', risk: 'risky', emoji: '⚓', outcomes: [
        { probability: 0.5, text: 'Bercé par le clapotis, vous dormez comme un vieux loup de mer d\'eau douce. Au matin, vous saluez les canards en capitaine.', statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.3, text: 'Le batelier rentre à l\'aube. Mais il a connu la galère : café brûlant, sermon tiède, et « la prochaine fois, demande ». Il y aura une prochaine fois.', statChanges: { sleep: 14, thirst: 8 }, respectChange: 1 },
        { probability: 0.2, text: 'Le mal de mer. À QUAI. Vous ignoriez que c\'était physiquement possible. Votre estomac confirme que si.', statChanges: { sleep: 8, health: -4, mental: -3 } },
      ]},
      { text: 'Dormir sur le quai, en terrien', risk: 'safe', emoji: '🌊', outcomes: [
        { probability: 1, text: 'Le clapotis fait le travail même depuis la rive. La mer, c\'est bien aussi de loin. Surtout de loin.', statChanges: { sleep: 10, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'rest-tube-toboggan', title: 'Le Tube du Toboggan', type: 'narrative',
    image: '/assets/rest-tube-toboggan.webp',
    description: 'Le toboggan tubulaire du square : abrité du vent, incliné juste ce qu\'il faut, interdit aux plus de douze ans. Vous en avez quelques-uns de trop.',
    choices: [
      { text: 'S\'y glisser pour la nuit', risk: 'normal', emoji: '🛝', outcomes: [
        { probability: 0.6, text: 'Un cocon de plastique rouge qui amplifie les ronflements en écho industriel. Nuit correcte, réveil en douceur par glissade involontaire.', statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.4, text: 'À 7h précises, un enfant vous glisse DESSUS. Collision, cris, parents. Vous présentez des excuses depuis l\'intérieur d\'un tube. Point bas de la semaine.', statChanges: { sleep: 8, mental: -3, dignity: -6 } },
      ]},
      { text: 'Le banc d\'à côté, réglementaire', risk: 'safe', emoji: '🪑', outcomes: [
        { probability: 1, text: 'Le banc est dur, légal et venteux. Vous rêvez du tube. On rêve toujours du tube.', statChanges: { sleep: 8, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-copyshop', title: 'La Boutique de Photocopies', type: 'narrative',
    image: '/assets/rest-copyshop.webp',
    description: 'Le copy-shop étudiant reste ouvert toute la nuit en période de partiels. Des fauteuils, le ronron chaud des machines, et des gens trop paniqués pour poser des questions.',
    choices: [
      { text: 'Dormir entre deux étudiants en crise', risk: 'safe', emoji: '🖨️', outcomes: [
        { probability: 0.7, text: 'Les photocopieuses ronronnent comme des chats de bureau. Autour de vous, on surligne frénétiquement. Vous dormez pour eux tous. Quelqu\'un devait le faire.', statChanges: { sleep: 14, mental: 4 } },
        { probability: 0.3, text: 'Un étudiant vous paie pour surveiller ses affaires pendant sa pause kebab. Vous dormez dessus : sécurité maximale. Il approuve la méthode.', moneyChange: 3, statChanges: { sleep: 10 } },
      ]},
      { text: 'Aider à agrafer des mémoires', risk: 'normal', emoji: '📎', outcomes: [
        { probability: 0.6, text: 'Cent vingt pages sur « l\'habitat modulaire », agrafées droit. Payé en cafés et en pièces par des gens aux yeux rouges. La nuit la plus productive du mois.', moneyChange: 4, statChanges: { thirst: 6, sleep: 6, mental: 4 } },
        { probability: 0.4, text: 'Vous agrafez un chapitre à l\'envers. Le propriétaire du mémoire prend ça pour un « geste dada ». Il garde. Vous dormez, absous par l\'art.', statChanges: { sleep: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'rest-ascenseur-condamne', title: 'L\'Ascenseur Condamné', type: 'discovery',
    image: '/assets/rest-ascenseur-condamne.webp',
    description: 'Dans le parking, un ascenseur « en panne depuis 2019 ». Propre, éclairé, avec un miroir pour se dire bonjour. Un studio d\'un mètre carré, sans les charges.',
    choices: [
      { text: 'Emménager pour la nuit', risk: 'normal', emoji: '🛗', outcomes: [
        { probability: 0.6, text: 'Une chambre d\'un mètre carré, mais UNE CHAMBRE. Porte qui ferme, lumière qui marche, miroir qui ne juge pas. Le studio parisien, en mieux placé.', statChanges: { sleep: 18, mental: 6, dignity: 3 } },
        { probability: 0.4, text: 'Le technicien vient ENFIN le réparer. À 5h du matin. Après six ans. Le timing de la maintenance française est une arme de précision.', statChanges: { sleep: 8, mental: -4 } },
      ]},
      { text: 'Méfiance : dormir devant', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 1, text: 'Vous dormez sur le seuil, comme un chien de garde de votre propre prudence. L\'ascenseur ne bouge pas de la nuit. Évidemment.', statChanges: { sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-champignonniere', title: 'La Cave à Champignons', type: 'discovery',
    image: '/assets/rest-champignonniere.webp',
    description: 'Une ancienne champignonnière, tiède, sombre et silencieuse. Odeur de terre riche, noir absolu, et quelques champignons nostalgiques qui poussent encore par habitude.',
    choices: [
      { text: 'Dormir dans le noir absolu', risk: 'normal', emoji: '🍄', outcomes: [
        { probability: 0.6, text: 'Le meilleur noir de votre vie. Pas une lueur, pas un bruit, pas un jugement. Vous dormez comme une graine qui aurait renoncé à germer. C\'est un compliment.', statChanges: { sleep: 24, mental: 4 } },
        { probability: 0.4, text: 'Vous rêvez que les champignons parlent. Ils donnent d\'excellents conseils de placement immobilier. Au réveil, vous avez tout oublié sauf « creuse ».', statChanges: { sleep: 18, mental: 7 } },
      ]},
      { text: 'Cueillir de quoi dîner d\'abord', risk: 'risky', emoji: '🍽️', outcomes: [
        { probability: 0.5, text: 'Poêlée improvisée sur boîte de conserve : un dîner de bistrot dans une cave. Puis douze heures de sommeil, et de la terre dans les cheveux.', statChanges: { hunger: 18, sleep: 15 } },
        { probability: 0.5, text: 'Ceux-là n\'étaient PAS des champignons de Paris. La nuit est peuplée de couleurs inédites et de conversations avec le plafond. Mais QUELLES couleurs.', statChanges: { health: -8, mental: 8, sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-bache-piscine', title: 'Sous la Bâche de la Piscine', type: 'discovery',
    image: '/assets/rest-bache-piscine.webp',
    description: 'La piscine extérieure est bâchée pour l\'hiver. Entre la bâche tendue et les transats empilés : une poche d\'air tiède, à l\'abri du monde.',
    choices: [
      { text: 'Se faufiler dessous', risk: 'risky', emoji: '🏊', outcomes: [
        { probability: 0.5, text: 'Un hamac géant qui sent le chlore et l\'été mort. Vous dormez suspendu, et la bâche ne prend pas l\'eau.', statChanges: { sleep: 18, mental: 5 } },
        { probability: 0.5, text: 'La bâche cède à 3h. Baignade de novembre, tout habillé, dans le petit bain. Le maître-nageur aurait au moins ri.', statChanges: { health: -8, sleep: -4, dignity: -5, mental: -4 } },
      ]},
      { text: 'Bâtir une cabane de transats', risk: 'normal', emoji: '🪑', outcomes: [
        { probability: 0.7, text: 'Douze transats, une architecture douteuse, un abri réel. L\'urbanisme sauvage a ses chefs-d\'œuvre éphémères.', statChanges: { sleep: 14, mental: 6 } },
        { probability: 0.3, text: 'Effondrement à 3h. Un domino de transats dans le silence municipal, et vous dessous. Personne n\'a entendu. Votre coccyx, si.', statChanges: { sleep: 6, health: -3, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-loge-theatre', title: 'La Loge du Théâtre', type: 'discovery',
    image: '/assets/rest-loge-theatre.webp',
    description: 'La porte de service du théâtre est calée avec un extincteur. Au bout du couloir : les loges. Canapés de velours, miroirs à ampoules, gloire en pointillés.',
    choices: [
      { text: 'Dormir en vedette', risk: 'risky', emoji: '🎭', outcomes: [
        { probability: 0.5, text: 'Canapé de velours rouge, ampoules en veilleuse. Vous saluez un public imaginaire avant de sombrer. Standing ovation dans vos rêves. Trois rappels.', statChanges: { sleep: 22, mental: 10, dignity: 5 } },
        { probability: 0.5, text: 'La troupe répète jusqu\'à 4h une pièce expérimentale où le décor « respire ». Vous êtes le décor. Vous respirez. La critique salue votre naturel.', statChanges: { sleep: 8, mental: 2 }, respectChange: 2 },
      ]},
      { text: 'Rester dans le couloir chauffé', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 1, text: 'Le couloir sent la poussière noble et le trac ancien. Vous dormez adossé à cent ans de premières. Ça tient chaud autrement.', statChanges: { sleep: 12, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'rest-bibliobus', title: 'Le Bibliobus', type: 'discovery',
    image: '/assets/rest-bibliobus.webp',
    description: 'Le bibliobus municipal dort sur son parking, mal verrouillé. À l\'intérieur : moquette, coussins de l\'heure du conte, et deux mille histoires qui ne demandent que ça.',
    choices: [
      { text: 'Nuit au rayon jeunesse', risk: 'normal', emoji: '📚', outcomes: [
        { probability: 0.7, text: 'Endormi sur les coussins du conte, un album ouvert sur le ventre. Vous rêvez en illustrations. Le réveil sent le papier et l\'enfance des autres.', statChanges: { sleep: 18, mental: 9 } },
        { probability: 0.3, text: 'La bibliothécaire vous trouve au matin. Au lieu d\'appeler qui que ce soit, elle vous inscrit : « ça vous fera une adresse. » Une carte de bibliothèque. Votre premier document officiel depuis longtemps.', statChanges: { sleep: 12, mental: 8, dignity: 4 }, respectChange: 2, addFlag: 'carte-biblio' },
      ]},
      { text: 'Lire jusqu\'à l\'aube', risk: 'safe', emoji: '📖', outcomes: [
        { probability: 1, text: 'Vous dévorez un roman d\'aventure entier, genoux repliés sous la veilleuse. Dormir peut attendre : vous étiez en mer de Chine.', statChanges: { sleep: 6, mental: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-cabine-grue', title: 'La Cabine de la Grue', type: 'discovery',
    image: '/assets/rest-cabine-grue.webp',
    description: 'Trente mètres au-dessus du chantier endormi, la cabine de la grue. La clé du grillage pend à un clou. Le vertige, lui, est fourni sans supplément.',
    choices: [
      { text: 'Grimper dormir là-haut', risk: 'risky', emoji: '🏗️', outcomes: [
        { probability: 0.5, text: 'La ville entière à vos pieds, en silence, en lumières. Vous dormez en roi du monde dans un fauteuil d\'ouvrier. La plus belle chambre de la ville, sans exception.', statChanges: { sleep: 20, mental: 14, dignity: 6 } },
        { probability: 0.3, text: 'À mi-échelle, les bras déclarent forfait. Redescente piteuse, échelon par échelon, en négociant avec vos biceps. Le sol a du bon aussi.', statChanges: { sleep: 6, health: -4, mental: -4 } },
        { probability: 0.2, text: 'Le gardien vous cueille à la descente, plus admiratif que fâché : « même moi j\'ose pas monter. » Il partage son thermos en échange du récit.', statChanges: { sleep: 10, thirst: 8, mental: 3 }, respectChange: 3 },
      ]},
      { text: 'Dormir dans la bétonnière (vide)', risk: 'normal', emoji: '🌀', outcomes: [
        { probability: 0.6, text: 'Un cocon d\'acier étrangement ergonomique. Vous dormez en position fœtale industrielle. Le progrès a parfois des usages imprévus.', statChanges: { sleep: 15, mental: 3 } },
        { probability: 0.4, text: 'Un ouvrier matinal la met en route « pour vérifier ». Trois rotations avant vos hurlements. Vous sortez essoré, au sens propre. Il paie le petit-déjeuner, traumatisé aussi.', statChanges: { health: -5, mental: -6, sleep: 4, hunger: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-aire-autoroute', title: 'L\'Aire d\'Autoroute', type: 'narrative',
    image: '/assets/rest-aire-autoroute.webp',
    description: 'À la lisière de la ville, une aire d\'autoroute : douches à jeton, machine à café, et des routiers qui ont le cœur proportionnel au tonnage.',
    choices: [
      { text: 'Dormir entre deux poids lourds', risk: 'normal', emoji: '🚛', outcomes: [
        { probability: 0.6, text: 'Les moteurs au ralenti ronronnent comme des chats de quarante tonnes. À l\'abri du vent entre deux remorques, vous dormez en convoi exceptionnel.', statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.4, text: 'Un routier vous secoue à l\'aube... pour vous offrir jeton de douche et café : « j\'ai dormi dehors deux ans, moi. » La confrérie des anciens du bitume existe, et elle a des jetons.', statChanges: { sleep: 14, dignity: 8, thirst: 8, mental: 8 } },
      ]},
      { text: 'Squatter la salle des machines à café', risk: 'safe', emoji: '☕', outcomes: [
        { probability: 1, text: 'Néons, chaleur, gobelet oublié encore à moitié plein. Le confort moderne dans sa version distributeur. Vous dormez assis entre deux « expresso court ».', statChanges: { sleep: 10, thirst: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-carrousel', title: 'Le Manège Bâché', type: 'discovery',
    image: '/assets/rest-carrousel.webp',
    description: 'Le carrousel du parc est bâché pour la nuit. Sous la toile : des chevaux de bois figés en plein galop, et le carrosse de Cendrillon, libre jusqu\'à minuit. Et même après.',
    choices: [
      { text: 'Dormir dans le carrosse', risk: 'normal', emoji: '🎠', outcomes: [
        { probability: 0.7, text: 'Nuit féerique dans un carrosse de contreplaqué doré. Vous vous réveillez prince d\'un royaume de chevaux immobiles. Le royaume est petit mais le sommeil fut royal.', statChanges: { sleep: 18, mental: 10, dignity: 3 } },
        { probability: 0.3, text: 'Le forain lance le manège à 7h SANS regarder sous la bâche. Réveil rotatif, musique de limonaire à plein volume. Vous descendez en marche, dignité centrifugée.', statChanges: { sleep: 10, health: -3, mental: -4, dignity: -4 } },
      ]},
      { text: 'S\'adosser à un cheval de bois', risk: 'safe', emoji: '🐴', outcomes: [
        { probability: 1, text: 'Vous dormez contre un cheval cabré qui ne bronche pas. Le seul cheval du monde qui ne vous jugera jamais.', statChanges: { sleep: 12, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-casse-limousine', title: 'La Limousine de la Casse', type: 'discovery',
    image: '/assets/rest-casse-limousine.webp',
    description: 'La casse auto déborde d\'épaves ordinaires. Mais au milieu trône une limousine des années 80, sièges cuir intacts, mini-bar vide, gloire fanée.',
    choices: [
      { text: 'Nuit en limousine', risk: 'normal', emoji: '🚗', outcomes: [
        { probability: 0.7, text: 'Cuir craquelé, suspension morte, classe éternelle. Vous dormez en magnat déchu, ce qui est exactement votre situation. Le costume tombe parfaitement.', statChanges: { sleep: 18, mental: 8, dignity: 5 } },
        { probability: 0.3, text: 'Le chien de la casse dort DÉJÀ dedans. Négociation territoriale : il garde l\'avant, vous prenez l\'arrière. Il ronfle. Vous aussi. L\'accord tient.', statChanges: { sleep: 10, mental: 3, health: -2 } },
      ]},
      { text: 'Choisir une modeste berline', risk: 'safe', emoji: '🚙', outcomes: [
        { probability: 0.8, text: 'Une familiale défoncée mais honnête. Les sièges se rabattent presque à plat. Presque. Votre colonne vertébrale valide à 80 %.', statChanges: { sleep: 14 } },
        { probability: 0.2, text: 'Le siège se rabat d\'un coup en pleine nuit : vous dormez en position « coffre ». Réveil origami.', statChanges: { sleep: 8, health: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-chapiteau-cirque', title: 'Sous les Gradins du Cirque', type: 'discovery',
    image: '/assets/rest-chapiteau-cirque.webp',
    description: 'Le cirque dort. Sous les gradins du chapiteau : de la paille propre, la chaleur des projecteurs éteints, et une odeur de pop-corn fantôme.',
    choices: [
      { text: 'Se faire un nid de paille', risk: 'normal', emoji: '🎪', outcomes: [
        { probability: 0.6, text: 'La paille des artistes vaut mieux que le duvet des honnêtes gens. Vous dormez dans les coulisses du rêve, bercé par le ronflement lointain du lama.', statChanges: { sleep: 18, mental: 7 } },
        { probability: 0.4, text: 'Le lama vous découvre à l\'aube et vous fixe pendant une heure. Vous vous réveillez sous surveillance camélidée. Il ne dira rien. Les lamas ne disent jamais rien.', statChanges: { sleep: 14, mental: 4 } },
      ]},
      { text: 'Dormir dans le canon (du numéro)', risk: 'risky', emoji: '💣', outcomes: [
        { probability: 0.5, text: 'Le canon de l\'homme-canon est capitonné de l\'intérieur. Évidemment : c\'est fait pour contenir un homme. Nuit balistique parfaite.', statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.5, text: 'Répétition matinale. On charge le ressort AVANT de vérifier le canon. Le filet vous rattrape, l\'équipe vous applaudit. Embauche refusée, petit-déjeuner offert.', statChanges: { sleep: 6, health: -5, mental: 5, hunger: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-showroom-cuisine', title: 'La Cuisine d\'Exposition', type: 'narrative',
    image: '/assets/rest-showroom-cuisine.webp',
    description: 'Le magasin de cuisines expose un « appartement témoin » complet. Faux fruits, vraie banquette, lumière d\'ambiance. Une vie de catalogue, inoccupée.',
    choices: [
      { text: 'Habiter le témoin pour une nuit', risk: 'risky', emoji: '🏠', outcomes: [
        { probability: 0.5, text: 'Vous dînez de vos provisions à la table en marbre reconstitué, puis dormez sur la banquette « conviviale ». Pendant huit heures, vous avez une vie de catalogue. Elle est reposante.', statChanges: { sleep: 20, mental: 12, dignity: 6 } },
        { probability: 0.5, text: 'Le vigile de nuit vous trouve endormi, la tête sur un set de table. Il vous fait sortir... par la cafétéria du personnel, avec un chocolat chaud. Les vigiles de nuit comprennent la nuit.', statChanges: { sleep: 12, thirst: 8, mental: 4, dignity: -2 } },
      ]},
      { text: 'Juste s\'asseoir dans « son » salon', risk: 'safe', emoji: '🛋️', outcomes: [
        { probability: 1, text: 'Une heure assis dans une vie qui pourrait être la vôtre, à un crédit près. Vous remettez le coussin droit en partant. On est chez soi ou on ne l\'est pas.', statChanges: { mental: 8, sleep: 6 } },
      ]},
    ],
  },
  {
    id: 'rest-salle-sport', title: 'La Salle de Sport 24h/24', type: 'narrative',
    image: '/assets/rest-salle-sport.webp',
    description: 'La salle de sport « ouverte 24h/24 » est déserte à 3h. La porte battante bat. Au fond, le coin étirements : des tapis épais et personne pour s\'étirer.',
    choices: [
      { text: 'Dormir au coin étirements', risk: 'normal', emoji: '🧘', outcomes: [
        { probability: 0.6, text: 'Tapis de sol épais, musique motivante en sourdine, climat contrôlé. Vous dormez « en récupération active ». C\'est le nom technique.', statChanges: { sleep: 17, health: 3 } },
        { probability: 0.4, text: 'Un bodybuilder insomniaque s\'entraîne à côté de vous toute la nuit en comptant à voix haute. Vous savez désormais compter jusqu\'à douze en grognant.', statChanges: { sleep: 10, mental: 2 } },
      ]},
      { text: 'Douche d\'abord, sommeil ensuite', risk: 'risky', emoji: '🚿', outcomes: [
        { probability: 0.5, text: 'Douche chaude illimitée + tapis moelleux : la nuit spa. Vous ressortez à l\'aube, propre et reposé, en saluant la caméra. Elle a rien dit, elle non plus.', statChanges: { sleep: 15, dignity: 12, health: 4 } },
        { probability: 0.5, text: 'Le gérant débarque pour son cardio de 5h. Explication en peignoir de fortune (une serviette de la salle). Il vous laisse finir la douche. Pas la nuit.', statChanges: { sleep: 5, dignity: 4, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-parc-expo', title: 'Le Parc des Expositions', type: 'discovery',
    image: '/assets/rest-parc-expo.webp',
    description: 'Entre le « Salon de l\'Habitat » démonté hier et la « Foire du Camping » montée demain, le hall 3 du parc des expos est un désert de moquette chauffée.',
    choices: [
      { text: 'Dormir au milieu du hall 3', risk: 'normal', emoji: '🏟️', outcomes: [
        { probability: 0.6, text: 'Dix mille mètres carrés pour vous seul. Vous dormez au centre exact, par principe. L\'écho de vos ronflements remplit l\'espace comme une œuvre sonore.', statChanges: { sleep: 18, mental: 8 } },
        { probability: 0.4, text: 'Les monteurs de la Foire du Camping arrivent à 5h et montent une tente AUTOUR de vous, pour rire. Vous vous réveillez en démonstration. Vous jouez le jeu. Pourboire du chef d\'équipe.', moneyChange: 4, statChanges: { sleep: 12, mental: 6, dignity: -2 } },
      ]},
      { text: 'Chercher les restes du Salon de l\'Habitat', risk: 'safe', emoji: '🔍', outcomes: [
        { probability: 1, text: 'Butin : moquette de stand découpée (isolant cinq étoiles), flyers « votre maison de demain » (allume-feu d\'aujourd\'hui) et un stylo publicitaire qui marche.', statChanges: { sleep: 8, mental: 4 }, itemGain: { id: 'moquette-stand', name: 'Carré de moquette de stand', emoji: '🟩', type: 'junk', value: 3 } },
      ]},
    ],
  },
  {
    id: 'rest-jacuzzi-expo', title: 'Le Jacuzzi d\'Exposition', type: 'discovery',
    image: '/assets/rest-jacuzzi-expo.webp',
    description: 'La jardinerie expose un jacuzzi dernier cri sur le parking, sous un barnum. Il est vide, sec, et exactement de la taille d\'un lit rond.',
    choices: [
      { text: 'Dormir dans le jacuzzi (vide)', risk: 'normal', emoji: '🛁', outcomes: [
        { probability: 0.7, text: 'Coque ergonomique, appuie-têtes intégrés, parois anti-vent. Les ingénieurs du bien-être ont conçu votre chambre sans le savoir. Nuit cinq étoiles, zéro bulle.', statChanges: { sleep: 19, mental: 8 } },
        { probability: 0.3, text: 'Le commercial fait sa démo à 9h et lance les jets... d\'air. Vous émergez d\'un typhon sec devant deux clients ravis. « Et il est vendu avec l\'occupant ? » Tout le monde rit. Vous aussi, à retardement.', statChanges: { sleep: 12, dignity: -5, mental: 3 } },
      ]},
      { text: 'Dormir dessous, entre les palettes', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 1, text: 'Sous le jacuzzi, entre deux palettes : moins glamour, plus discret. Le luxe au-dessus, vous en dessous. Une métaphore confortable.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-escalier-hopital', title: 'La Cage d\'Escalier de l\'Hôpital', type: 'narrative',
    image: '/assets/rest-escalier-hopital.webp',
    description: 'L\'escalier de service de l\'hôpital : chauffé, silencieux, et personne ne prend jamais l\'escalier dans un hôpital. Les paliers du 4e sont réputés.',
    choices: [
      { text: 'S\'installer au 4e palier', risk: 'safe', emoji: '🏥', outcomes: [
        { probability: 0.7, text: 'Chaleur d\'hôpital, silence de linoléum. Vous dormez adossé au radiateur, bercé par les annonces lointaines. Personne n\'est monté. Personne ne monte jamais.', statChanges: { sleep: 16, health: 2, mental: 4 } },
        { probability: 0.3, text: 'Une aide-soignante en pause pleure doucement au 3e. Vous descendez, vous écoutez, elle partage ses biscuits. Deux fatigues qui se tiennent compagnie, ça repose autrement.', statChanges: { sleep: 10, mental: 8, hunger: 8 } },
      ]},
      { text: 'Viser le toit-terrasse du personnel', risk: 'risky', emoji: '🌃', outcomes: [
        { probability: 0.5, text: 'Transats du personnel, plaid oublié, ville en contrebas. Les soignants ont le meilleur spot de la ville et le savent. Cette nuit, il est à vous.', statChanges: { sleep: 18, mental: 10 } },
        { probability: 0.5, text: 'La porte du toit claque derrière vous. Verrouillée. Vous dormez sur le paillasson du ciel et attendez l\'équipe de 6h, qui vous libère en riant.', statChanges: { sleep: 8, mental: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-consigne-gare', title: 'La Consigne de la Gare', type: 'discovery',
    image: '/assets/rest-consigne-gare.webp',
    description: 'La salle des consignes automatiques, au sous-sol de la gare : tiède, oubliée des caméras, meublée de casiers qui gardent les secrets des autres.',
    choices: [
      { text: 'Dormir entre les casiers', risk: 'normal', emoji: '🔐', outcomes: [
        { probability: 0.6, text: 'Le ronron des ventilations, la chaleur des machines. Vous dormez gardé par cent casiers verrouillés, comme un lingot parmi les lingots.', statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.4, text: 'Un voyageur vient récupérer sa valise à 2h et hurle en vous découvrant. Vous hurlez aussi, par politesse. Il s\'excuse, vous vous excusez, il vous laisse ses sandwichs de train.', statChanges: { sleep: 10, hunger: 12, mental: 2 } },
      ]},
      { text: 'Vérifier le casier 12 (l\'appel de la cabine…)', risk: 'risky', emoji: '🗝️', outcomes: [
        { probability: 0.3, text: 'Le casier 12 est... entrouvert. Dedans : une couverture pliée et un mot : « pour le suivant. » La ville a des anges bizarres, mais elle en a.', statChanges: { sleep: 12, mental: 10 }, itemGain: { id: 'couverture-casier', name: 'Couverture du casier 12', emoji: '🧣', type: 'armor', value: 6, defenseBonus: 1 } },
        { probability: 0.7, text: 'Le casier 12 est verrouillé, comme les casiers. Vous avez fixé une porte en métal pendant dix minutes. Le mystère reste entier, votre sommeil aussi.', statChanges: { sleep: 10, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-atelier-poterie', title: 'L\'Atelier de Poterie', type: 'discovery',
    image: '/assets/rest-atelier-poterie.webp',
    description: 'L\'atelier de poterie associatif a laissé son four allumé pour la cuisson de nuit. La pièce entière est un radiateur qui sent l\'argile et la patience.',
    choices: [
      { text: 'Dormir contre le four', risk: 'safe', emoji: '🏺', outcomes: [
        { probability: 0.7, text: 'Une chaleur de four à pain, un sol propre, l\'odeur de la terre cuite. Vous dormez comme une poterie en cours : doucement solidifié par la nuit.', statChanges: { sleep: 19, health: 3, mental: 5 } },
        { probability: 0.3, text: 'La potière de l\'aube vous trouve lové contre son four. Elle vous met un tablier d\'office : « tant qu\'à être là, tournez. » Votre bol est difforme. Elle le garde « pour l\'expo ».', statChanges: { sleep: 12, mental: 9, dignity: 3 } },
      ]},
      { text: 'Essayer le tour de potier d\'abord', risk: 'normal', emoji: '🌀', outcomes: [
        { probability: 0.5, text: 'À 2h du matin, seul au monde, vous tournez un bol presque rond. Il y a une paix étrange à faire naître un objet. Vous dormez les mains sales et l\'âme propre.', statChanges: { sleep: 14, mental: 12 } },
        { probability: 0.5, text: 'L\'argile gicle partout. PARTOUT. Vous passez une heure à nettoyer et dormez d\'un sommeil coupable mais chaud.', statChanges: { sleep: 12, mental: 2, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-amphi-fac', title: 'L\'Amphi de la Fac', type: 'narrative',
    image: '/assets/rest-amphi-fac.webp',
    description: 'L\'amphithéâtre B reste ouvert pour les « révisions libres ». Au dernier rang, dans la pénombre, des générations d\'étudiants ont dormi avant vous, et le velours s\'en souvient.',
    choices: [
      { text: 'Dormir au dernier rang', risk: 'safe', emoji: '🎓', outcomes: [
        { probability: 0.7, text: 'Les sièges rabattables ont l\'inclinaison exacte de la sieste académique. Vous dormez au milieu d\'étudiants qui dorment sur leurs cours, et personne ne réveille personne.', statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.3, text: 'Un cours de philo de 8h commence autour de vous. Thème : « l\'habiter ». Vous levez la main sans réfléchir. Votre témoignage improvisé arrache des applaudissements. Le prof vous paie le café.', statChanges: { sleep: 8, mental: 10, dignity: 6, thirst: 6 } },
      ]},
      { text: 'Squatter le local des assos étudiantes', risk: 'normal', emoji: '🛋️', outcomes: [
        { probability: 0.6, text: 'Canapé défoncé, affiches de soirées mortes, paquet de gâteaux entamé. Le luxe étudiant dans toute sa splendeur. Vous vous y fondez parfaitement.', statChanges: { sleep: 14, hunger: 8, mental: 4 } },
        { probability: 0.4, text: 'L\'asso « Nuit du Jeu » débarque à minuit pour un Loup-Garou marathon. Vous êtes enrôlé d\'office. Vous gagnez deux parties. On vous surnomme « le Vétéran ».', statChanges: { sleep: 4, mental: 12 }, respectChange: 2 },
      ]},
    ],
  },
  {
    id: 'rest-foodtruck-tiede', title: 'Le Food-Truck Endormi', type: 'discovery',
    image: '/assets/rest-foodtruck-tiede.webp',
    description: 'Le food-truck à burgers a fermé à minuit. Sa plancha met des heures à refroidir : tout le flanc du camion est un mur tiède qui sent l\'oignon grillé.',
    choices: [
      { text: 'Dormir collé au flanc tiède', risk: 'safe', emoji: '🍔', outcomes: [
        { probability: 0.7, text: 'Le camion vous rend sa chaleur toute la nuit, avec supplément odeur de frites. Vous rêvez de menus XL. Le réveil a un goût de faim heureuse.', statChanges: { sleep: 15, mental: 5, hunger: -3 } },
        { probability: 0.3, text: 'Le patron revient à 6h préparer ses oignons. Il vous enjambe deux fois avant de vous tendre le « burger du personnel » : les chutes de la veille en sandwich. Somptueux.', statChanges: { sleep: 12, hunger: 20, mental: 5 } },
      ]},
      { text: 'Vérifier la trappe à pain', risk: 'risky', emoji: '🥖', outcomes: [
        { probability: 0.5, text: 'La trappe extérieure contient les buns de la veille, « bons pour les canards ». Les canards vous pardonneront. Vous dormez le ventre plein contre le métal tiède.', statChanges: { hunger: 16, sleep: 13 } },
        { probability: 0.5, text: 'L\'alarme du camion se déclenche. Le quartier entier sait maintenant qu\'un homme voulait du pain à 3h. Vous dormez ailleurs, poursuivi par la sirène et le principe.', statChanges: { sleep: 6, mental: -4, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-abri-jardin', title: 'L\'Abri de Jardin', type: 'discovery',
    image: '/assets/rest-abri-jardin.webp',
    description: 'Au fond des jardins ouvriers, un abri à outils au cadenas symbolique. Dedans : des sacs de terreau moelleux, des outils propres, et une odeur de tomate séchée.',
    choices: [
      { text: 'Dormir sur les sacs de terreau', risk: 'normal', emoji: '🌱', outcomes: [
        { probability: 0.7, text: 'Les sacs de terreau épousent le dos mieux qu\'un matelas suédois. Vous dormez comme un semis sous serre : à l\'abri, au chaud, plein d\'avenir.', statChanges: { sleep: 18, mental: 6 } },
        { probability: 0.3, text: 'Le jardinier du dimanche débarque tôt. Silence. Puis : « vous savez biner ? » Matinée de binage contre panier de légumes. L\'économie du potager est rude mais juste.', statChanges: { sleep: 10, hunger: 18, health: -2 }, respectChange: 1 },
      ]},
      { text: 'Emprunter la brouette comme lit', risk: 'normal', emoji: '🛞', outcomes: [
        { probability: 0.5, text: 'La brouette, calée contre le mur, se révèle un transat rustique acceptable. Vous dormez en équilibre, comme votre vie. La métaphore ne vous échappe pas.', statChanges: { sleep: 12, mental: 4 } },
        { probability: 0.5, text: 'La brouette bascule à 4h. Vous roulez dans les courgettes. Les courgettes n\'avaient rien demandé. Vous non plus.', statChanges: { sleep: 6, health: -2, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'rest-tracteur-foire', title: 'Le Tracteur de la Foire Agricole', type: 'discovery',
    image: '/assets/rest-tracteur-foire.webp',
    description: 'La foire agricole s\'installe demain. Les machines dorment déjà sur l\'esplanade, dont un tracteur dernier cri : cabine suspendue, siège pneumatique, GPS des champs.',
    choices: [
      { text: 'Dormir dans la cabine high-tech', risk: 'normal', emoji: '🚜', outcomes: [
        { probability: 0.6, text: 'Le siège pneumatique du tracteur coûte plus cher qu\'une année de loyer. Vous comprenez pourquoi : c\'est un nuage avec un volant. Meilleure nuit de l\'année, catégorie machines.', statChanges: { sleep: 22, mental: 8 } },
        { probability: 0.4, text: 'Le concessionnaire arrive à l\'aube avec un client. Vous descendez du tracteur en saluant : « suspension remarquable. » Le client, convaincu par votre expertise, achète. On vous glisse un billet de démonstrateur.', moneyChange: 6, statChanges: { sleep: 15, dignity: 2 } },
      ]},
      { text: 'Se contenter de la remorque à paille', risk: 'safe', emoji: '🌾', outcomes: [
        { probability: 1, text: 'La paille de démonstration est aussi confortable que la vraie. Vous dormez en produit du terroir, AOC fatigue de la rue.', statChanges: { sleep: 15, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'rest-chateau-gonflable', title: 'Le Château Gonflable Dégonflé', type: 'discovery',
    image: '/assets/rest-chateau-gonflable.webp',
    description: 'Après la kermesse, le château gonflable dégonflé attend son camion sous une sangle. Trois cents mètres carrés de matelas plié. Les enfants partis, le royaume est vacant.',
    choices: [
      { text: 'Se glisser dans les plis', risk: 'normal', emoji: '🏰', outcomes: [
        { probability: 0.7, text: 'Le PVC molletonné plié en douze épaisseurs : le plus grand matelas du monde, rien que pour vous. Vous dormez en monarque d\'un château couché.', statChanges: { sleep: 21, mental: 9 } },
        { probability: 0.3, text: 'Le forain le regonfle à 7h SANS vérifier. Vous êtes soulevé, ballotté, puis expulsé par la tourelle sud devant l\'équipe hilare. Sortie de château la plus mémorable de l\'histoire locale.', statChanges: { sleep: 12, dignity: -6, mental: 3, health: -2 }, respectChange: 1 },
      ]},
      { text: 'Dormir dessus, en surface', risk: 'safe', emoji: '🛌', outcomes: [
        { probability: 1, text: 'Même dégonflé et en surface, ça reste mieux que le carton. Le luxe est relatif, votre dos est absolu.', statChanges: { sleep: 14 } },
      ]},
    ],
  },
  {
    id: 'rest-pompes-funebres', title: 'Le Magasin de Pompes Funèbres', type: 'narrative',
    image: '/assets/rest-pompes-funebres.webp',
    description: 'L\'arrière-boutique des pompes funèbres est entrouverte. À l\'intérieur, le showroom : des cercueils d\'exposition, capitonnés, soyeux, terriblement confortables. Personne n\'ose jamais y entrer. Justement.',
    choices: [
      { text: 'Dormir dans le modèle « Grand Repos »', risk: 'risky', emoji: '⚰️', outcomes: [
        { probability: 0.5, text: 'Capitonnage en satin, calme absolu, isolation parfaite. Vous comprenez enfin le marketing : c\'est vraiment le grand repos. Vous laissez le couvercle OUVERT, tout de même. Il y a des limites.', statChanges: { sleep: 25, mental: 6 } },
        { probability: 0.5, text: 'Le thanatopracteur vous découvre à 7h et frôle l\'infarctus quand vous vous redressez en le saluant. Une fois remis, il rit aux larmes et vous offre le café « pour fêter votre résurrection ».', statChanges: { sleep: 18, thirst: 6, mental: 8, dignity: -3 }, respectChange: 2 },
      ]},
      { text: 'Dormir sur les coussins de présentation', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 1, text: 'Les coussins d\'exposition, moelleux et solennels, font un lit très digne. Vous dormez entouré de silence professionnel. Le métier sait recevoir.', statChanges: { sleep: 16, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'rest-cabane-arbre', title: 'La Cabane dans l\'Arbre', type: 'discovery',
    image: '/assets/rest-cabane-arbre.webp',
    description: 'Au fond du parc, une cabane d\'enfants dans un platane : planches de guingois, échelle à moitié pourrie, panneau « INTERDI AU ADULTE ». L\'orthographe est jeune, la cabane est solide.',
    choices: [
      { text: 'Monter dormir là-haut', risk: 'normal', emoji: '🌳', outcomes: [
        { probability: 0.6, text: 'La cabane tient bon. Vous dormez dans les feuilles, bercé par le vent, redevenu un enfant de dix ans qui aurait beaucoup, beaucoup vieilli.', statChanges: { sleep: 17, mental: 11 } },
        { probability: 0.4, text: 'Les propriétaires (8 et 10 ans) vous découvrent au matin. Conseil de guerre. Verdict : vous pouvez rester si vous êtes « le gardien du fort ». Vous êtes nommé. Salaire : deux BN et un Capri-Sun.', statChanges: { sleep: 12, hunger: 8, thirst: 6, mental: 12 }, respectChange: 1 },
      ]},
      { text: 'Respecter le panneau, dormir au pied', risk: 'safe', emoji: '🛡️', outcomes: [
        { probability: 1, text: 'Vous dormez au pied de l\'arbre, en sentinelle du royaume d\'en haut. Le panneau a parlé. Un homme d\'honneur respecte l\'orthographe approximative.', statChanges: { sleep: 11, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-sas-banque', title: 'Le Sas de la Banque', type: 'narrative',
    image: '/assets/rest-sas-banque.webp',
    description: 'Le sas des distributeurs de la banque : chauffé, éclairé, vitré. Le grand classique. Ce soir, il est libre, et la caméra a l\'air de dormir aussi.',
    choices: [
      { text: 'S\'installer pour la nuit', risk: 'normal', emoji: '🏦', outcomes: [
        { probability: 0.6, text: 'Le radiateur au sol, la lumière tamisée par vos cartons : le studio bancaire dans toute sa gloire. Vous dormez sous l\'œil des distributeurs, gardien bénévole de l\'argent des autres.', statChanges: { sleep: 16, mental: 4 } },
        { probability: 0.4, text: 'Un client nocturne enjambe vos jambes pour retirer 50€, s\'excuse, puis revient sur ses pas et vous en tend 5 : « frais de dérangement. » La banque n\'a jamais aussi bien redistribué.', moneyChange: 5, statChanges: { sleep: 12, mental: 5 } },
      ]},
      { text: 'Dormir dehors, contre la vitre', risk: 'safe', emoji: '🪟', outcomes: [
        { probability: 1, text: 'La vitre diffuse un peu de la chaleur du sas, comme une aumône thermique. Dedans, dehors : toute votre vie tient dans cette épaisseur de verre.', statChanges: { sleep: 10, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-box-velo', title: 'Le Box à Vélos Sécurisé', type: 'discovery',
    image: '/assets/rest-box-velo.webp',
    description: 'La résidence neuve a un box à vélos dernier cri : badge, toit, éclairage doux. Un vélo cargo y dort sous une housse. La housse est grande. Le cargo aussi.',
    choices: [
      { text: 'Dormir dans la caisse du vélo cargo', risk: 'normal', emoji: '🚲', outcomes: [
        { probability: 0.6, text: 'La caisse en bois du cargo, sous la housse imperméable : un berceau pour adulte fatigué. Vous dormez plié mais sec, comme une baguette bien rangée.', statChanges: { sleep: 15, mental: 5 } },
        { probability: 0.4, text: 'La propriétaire part au marché à 6h SANS soulever la housse. Vous vous réveillez en mouvement, place du marché. Elle crie, vous criez, puis elle vous paie un café « pour l\'histoire à raconter ».', statChanges: { sleep: 10, thirst: 6, mental: 4, dignity: -4 } },
      ]},
      { text: 'Dormir sur le banc du box', risk: 'safe', emoji: '🪑', outcomes: [
        { probability: 1, text: 'Le banc du box, sous le néon doux, à l\'abri du vent. Les vélos ne ronflent pas, et le badge de la porte fait clic toutes les deux heures.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-quai-chargement', title: 'Le Quai de Chargement', type: 'discovery',
    image: '/assets/rest-quai-chargement.webp',
    description: 'Derrière le grand magasin, le quai de chargement est désert jusqu\'à 6h. Des balles de carton compressé y font des murailles moelleuses, tièdes de la journée.',
    choices: [
      { text: 'Se creuser un nid dans les balles', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Une alcôve de carton compressé : isolation record, odeur de papier neuf. Le carton vous a toujours porté. Cette nuit, littéralement.', statChanges: { sleep: 17, mental: 6 } },
        { probability: 0.3, text: 'Le cariste de 6h vous trouve encastré dans sa matière première. Il vous extrait à la main, mort de rire : « t\'es le meilleur truc que j\'aie trouvé dans le carton. » Café offert au local.', statChanges: { sleep: 12, thirst: 6, mental: 5 } },
      ]},
      { text: 'Dormir sur le monte-charge', risk: 'risky', emoji: '⬆️', outcomes: [
        { probability: 0.5, text: 'La plateforme du monte-charge, à mi-hauteur : imprenable, invisible, aérée. Le donjon du quai. Vous dormez en châtelain logistique.', statChanges: { sleep: 16, mental: 5 } },
        { probability: 0.5, text: 'Quelqu\'un appelle le monte-charge à 5h. Vous descendez, majestueux et horizontal, devant trois manutentionnaires. L\'un applaudit. Les deux autres aussi, finalement.', statChanges: { sleep: 10, dignity: -4, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'rest-terrasse-chauffee', title: 'La Terrasse au Chauffage Oublié', type: 'discovery',
    image: '/assets/rest-terrasse-chauffee.webp',
    description: 'Le café a fermé en oubliant d\'éteindre un parasol chauffant. Une colonne de chaleur ronronne au-dessus des banquettes de la terrasse, pour personne.',
    choices: [
      { text: 'S\'allonger sous le champignon chauffant', risk: 'normal', emoji: '🍄', outcomes: [
        { probability: 0.6, text: 'La banquette, le plaid publicitaire oublié, et 2000 watts de bienveillance au gaz. Vous dormez comme un client qui aurait payé. Mieux, même : eux se plaignent toujours.', statChanges: { sleep: 18, health: 3, mental: 6 } },
        { probability: 0.4, text: 'Le patron rouvre à 6h30, vous découvre, et coupe le chauffage... après vous avoir servi un express. « T\'as gardé la terrasse, c\'est un service. » La comptabilité du cœur.', statChanges: { sleep: 14, thirst: 5, mental: 5 }, respectChange: 1 },
      ]},
      { text: 'Profiter juste une heure puis filer', risk: 'safe', emoji: '⏱️', outcomes: [
        { probability: 1, text: 'Une heure de chaleur volée, puis la nuit normale. Il faut savoir quitter la table quand la chance vous chauffe.', statChanges: { sleep: 8, health: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-bus-scolaire', title: 'Le Bus Scolaire au Dépôt', type: 'discovery',
    image: '/assets/rest-bus-scolaire.webp',
    description: 'Le bus scolaire dort sur son parking, porte arrière mal fermée. À l\'intérieur flotte une odeur de goûter et de mercredi. La banquette du fond vous tend les bras.',
    choices: [
      { text: 'La banquette du fond, évidemment', risk: 'normal', emoji: '🚌', outcomes: [
        { probability: 0.7, text: 'La place mythique. Vous dormez là où trois générations de gamins ont régné. Sous le siège : un paquet de gâteaux entamé et un Pokémon holographique. Le trésor de guerre.', statChanges: { sleep: 16, hunger: 6, mental: 8 } },
        { probability: 0.3, text: 'Le chauffeur monte à 6h45 et démarre. Vous vous réveillez au premier arrêt, entouré d\'enfants hilares qui vous adoptent immédiatement. La maîtresse, moins. Descente au deuxième arrêt, escorté par des « au revoir monsieur ! »', statChanges: { sleep: 11, mental: 8, dignity: -5 } },
      ]},
      { text: 'Dormir sur les marches, prêt à filer', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 1, text: 'Les marches en caoutchouc, tièdes et discrètes. Sortie garantie en deux secondes. La prudence est un oreiller dur mais fiable.', statChanges: { sleep: 10 } },
      ]},
    ],
  },
  {
    id: 'rest-clocher', title: 'Le Clocher', type: 'discovery',
    image: '/assets/rest-clocher.webp',
    description: 'L\'escalier du clocher est ouvert pour cause de « travaux campanaires ». Cent vingt marches plus haut : les cloches, les poutres centenaires, et la ville en contrebas.',
    choices: [
      { text: 'Dormir sous les cloches', risk: 'risky', emoji: '🔔', outcomes: [
        { probability: 0.5, text: 'Les poutres, la pierre, les étoiles par les abat-sons. Vous dormez dans le grenier de Dieu. Les cloches sont débranchées pour les travaux : le destin a coupé le réveil.', statChanges: { sleep: 20, mental: 12 } },
        { probability: 0.5, text: 'Les cloches n\'étaient PAS débranchées. L\'angélus de 7h vous traverse le squelette. Vous descendez les 120 marches en vibrant encore, sourd d\'une oreille et mystique de l\'autre.', statChanges: { sleep: 10, health: -4, mental: -5 } },
      ]},
      { text: 'S\'arrêter à mi-hauteur, petite salle', risk: 'safe', emoji: '🪜', outcomes: [
        { probability: 1, text: 'La salle du sonneur, à mi-clocher : un banc, une chaise, un calme d\'avant les horloges. Vous dormez dans l\'épaisseur du temps.', statChanges: { sleep: 14, mental: 6 } },
      ]},
    ],
  },
  {
    id: 'rest-couloir-hotel', title: 'Le Couloir de l\'Hôtel', type: 'narrative',
    image: '/assets/rest-couloir-hotel.webp',
    description: 'La porte de service de l\'hôtel trois étoiles bâille. Au deuxième, un couloir moquetté, des plateaux room-service à moitié pleins devant les portes, et un silence luxueux.',
    choices: [
      { text: 'Dîner des plateaux, dormir au bout du couloir', risk: 'risky', emoji: '🍽️', outcomes: [
        { probability: 0.5, text: 'Un demi-club sandwich, des frites tièdes, une crème brûlée intacte (les gens sont fous). Puis dodo dans l\'alcôve de la fenêtre. Trois étoiles au mérite.', statChanges: { hunger: 22, sleep: 15, mental: 8 } },
        { probability: 0.5, text: 'Le veilleur de nuit vous surprend à la crème brûlée. Moment de flottement. « ... Prenez au moins la cuillère propre. » Il vous laisse finir dans l\'escalier de service. Palace clandestin.', statChanges: { hunger: 15, sleep: 8, dignity: -3, mental: 4 } },
      ]},
      { text: 'Viser la lingerie et ses piles de draps', risk: 'normal', emoji: '🛏️', outcomes: [
        { probability: 0.6, text: 'La lingerie : des tours de draps propres jusqu\'au plafond. Vous dormez SUR une pile, comme une princesse au petit pois qui aurait tout perdu sauf le sens du confort.', statChanges: { sleep: 20, dignity: 4, mental: 6 } },
        { probability: 0.4, text: 'La gouvernante de 5h30 vous trouve enroulé dans un drap-housse. Elle vous fait plier quinze parures en échange de son silence. Vous savez maintenant faire les coins carrés. Compétence hôtelière acquise.', statChanges: { sleep: 12, mental: 4, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'rest-tunnel-lavage', title: 'Le Tunnel de Lavage', type: 'discovery',
    image: '/assets/rest-tunnel-lavage.webp',
    description: 'La station de lavage auto est fermée. Dans le tunnel, les rouleaux géants pendent comme des paresseux bleus. Ils sont secs, épais, et moelleux au-delà du raisonnable.',
    choices: [
      { text: 'Dormir dans les rouleaux', risk: 'normal', emoji: '🌀', outcomes: [
        { probability: 0.6, text: 'Vous vous lovez entre deux rouleaux comme dans une méduse en peluche. C\'est l\'étreinte la plus douce que la ville vous ait offerte depuis des années. On ne juge pas.', statChanges: { sleep: 19, mental: 8 } },
        { probability: 0.4, text: 'Le gérant lance le cycle test à 7h. Vous traversez le programme « Confort Plus » : mousse, rouleaux, séchage. Vous ressortez titubant, TRÈS propre, poursuivi par votre propre écho savonneux.', statChanges: { sleep: 10, dignity: 10, health: -3, mental: -3 } },
      ]},
      { text: 'Dormir dans la cabine de l\'aspirateur', risk: 'safe', emoji: '🧹', outcomes: [
        { probability: 1, text: 'La guérite de l\'aspirateur à jetons : un mètre carré vitré, à l\'abri du vent. Vous dormez en gardien du temple de la propreté automobile.', statChanges: { sleep: 12 } },
      ]},
    ],
  },
  {
    id: 'rest-menuiserie', title: 'La Menuiserie', type: 'discovery',
    image: '/assets/rest-menuiserie.webp',
    description: 'La menuiserie artisanale laisse sa cour ouverte. Une montagne de sciure fraîche fume doucement dans un coin, tiède de la journée de rabot. Ça sent le pin et le travail bien fait.',
    choices: [
      { text: 'Dormir dans la sciure tiède', risk: 'safe', emoji: '🪵', outcomes: [
        { probability: 0.7, text: 'La sciure épouse, isole, embaume. Vous dormez dans un nuage de pin des Landes. Au réveil, vous sentez le chalet. C\'est une promotion olfactive considérable.', statChanges: { sleep: 18, mental: 7, dignity: 2 } },
        { probability: 0.3, text: 'Le menuisier vous découvre à 7h, ni surpris ni fâché : « la sciure, c\'est le lit du compagnon. » Il vous paie le café et une heure de ponçage. Vos mains sentent la cire d\'abeille.', statChanges: { sleep: 13, thirst: 6, mental: 6 }, moneyChange: 3 },
      ]},
      { text: 'Dormir dans l\'armoire en cours de fabrication', risk: 'normal', emoji: '🚪', outcomes: [
        { probability: 0.5, text: 'L\'armoire normande à peine vernie, couchée sur des tréteaux : un lit clos d\'artisan. Vous dormez dans un meuble de maître. Peu de gens peuvent en dire autant.', statChanges: { sleep: 16, mental: 6 } },
        { probability: 0.5, text: 'Le vernis n\'était pas sec. Vous vous réveillez vaguement collé, avec un motif de chêne imprimé sur la joue. Il part en trois jours. Le souvenir, jamais.', statChanges: { sleep: 12, dignity: -4, mental: 2 } },
      ]},
    ],
  },
  {
    id: 'rest-gymnase-tapis', title: 'Les Tapis du Gymnase', type: 'discovery',
    image: '/assets/rest-gymnase-tapis.webp',
    description: 'La fenêtre du gymnase scolaire ferme mal depuis toujours, tout le quartier le sait. À l\'intérieur : la pile de tapis de gym, deux mètres de mousse bleue réglementaire.',
    choices: [
      { text: 'Dormir au sommet de la pile', risk: 'normal', emoji: '🤸', outcomes: [
        { probability: 0.7, text: 'Deux mètres de mousse homologuée Éducation Nationale. Vous dormez à l\'altitude du confort public. Le drapeau du sommeil est planté.', statChanges: { sleep: 20, mental: 6 } },
        { probability: 0.3, text: 'Le cours de gym de 8h entre en trombe. Vous descendez de la pile sous les yeux de trente élèves. Le prof, pragmatique : « au moins vous, vous savez faire une roulade avant de partir ? » Vous la faites. Ovation.', statChanges: { sleep: 13, dignity: -3, mental: 8 }, respectChange: 1 },
      ]},
      { text: 'Se rouler dans le tapis de judo', risk: 'normal', emoji: '🥋', outcomes: [
        { probability: 0.6, text: 'Enroulé dans un tatami souple comme une crêpe humaine, vous êtes invisible et isolé. Technique ancestrale. Nuit impeccable.', statChanges: { sleep: 17, mental: 4 } },
        { probability: 0.4, text: 'Trop bien roulé : impossible de sortir seul. Le gardien vous déroule à 7h comme un standard téléphonique des années 50 déroule un câble. Fou rire mutuel obligatoire.', statChanges: { sleep: 12, dignity: -4, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'rest-souffle-boulangerie', title: 'Le Soupirail de la Boulangerie', type: 'discovery',
    image: '/assets/rest-souffle-boulangerie.webp',
    description: 'Le soupirail du fournil souffle un air chaud qui sent le levain dès 3h du matin. Le meilleur radiateur de la ville est une bouche de trottoir qui embaume le pain.',
    choices: [
      { text: 'Dormir sur le soupirail', risk: 'safe', emoji: '🥖', outcomes: [
        { probability: 0.7, text: 'La chaleur du four monte à travers vous comme une marée douce. Vous dormez dans l\'odeur de la première fournée. Le réveil creuse l\'estomac et remplit l\'âme.', statChanges: { sleep: 17, health: 3, mental: 7, hunger: -4 } },
        { probability: 0.3, text: 'Le boulanger vous connaît maintenant. Ce matin, la baguette « trop cuite » atterrit à côté de vous, encore brûlante, sans un mot. Le langage du fournil est silencieux et croustillant.', statChanges: { sleep: 14, hunger: 15, mental: 8 } },
      ]},
      { text: 'Proposer un coup de main au fournil', risk: 'normal', emoji: '👨‍🍳', outcomes: [
        { probability: 0.5, text: 'De 4h à 7h, vous enfournez, farinez, portez. Payé en pain chaud, chocolatines invendables et sommeil mérité sur les sacs de farine. La nuit la plus utile du mois.', statChanges: { hunger: 22, sleep: 12, mental: 8 }, moneyChange: 4 },
        { probability: 0.5, text: '« Les mains, faut les montrer à la médecine du travail. » La réglementation a le dernier mot, mais il vous laisse le café et le croissant du refus. Un refus très digeste.', statChanges: { hunger: 10, thirst: 6, sleep: 8 } },
      ]},
    ],
  },
  {
    id: 'rest-chapelle-famille', title: 'La Chapelle de Famille', type: 'narrative',
    image: '/assets/rest-chapelle-famille.webp',
    description: 'Au cimetière, la chapelle de la famille de Brissac-Montmorency est entrouverte depuis des années. Banc de marbre, vitrail, et des voisins d\'un calme absolu. Garanti.',
    choices: [
      { text: 'Dormir chez les Brissac-Montmorency', risk: 'normal', emoji: '🕯️', outcomes: [
        { probability: 0.7, text: 'Le silence des grandes familles. Vous dormez sous un vitrail bleu, invité posthume de gens très bien. Au matin, vous époussetez le banc. Le savoir-vivre n\'a pas d\'adresse.', statChanges: { sleep: 19, mental: 7 } },
        { probability: 0.3, text: 'La dernière descendante vient fleurir la chapelle à l\'aube. Elle vous trouve, ne crie pas, s\'assoit : « au moins quelqu\'un leur tient compagnie. » Elle revient chaque semaine. Avec des sandwichs, désormais.', statChanges: { sleep: 14, hunger: 10, mental: 10 }, respectChange: 2 },
      ]},
      { text: 'Rester dehors, entre les ifs', risk: 'safe', emoji: '🌲', outcomes: [
        { probability: 1, text: 'Les ifs coupent le vent, les morts font pas de bruit. On dort bien chez ceux qui n\'ont plus rien à prouver.', statChanges: { sleep: 13, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'rest-remorque-couvertures', title: 'La Remorque de Déménagement', type: 'discovery',
    image: '/assets/rest-remorque-couvertures.webp',
    description: 'Une remorque de location dort devant un pavillon, pleine de couvertures de déménagement : ces grosses couvertures grises molletonnées, par dizaines. Une caverne d\'Ali Baba du moelleux.',
    choices: [
      { text: 'S\'enfouir sous quinze couvertures', risk: 'normal', emoji: '🧣', outcomes: [
        { probability: 0.6, text: 'Quinze épaisseurs de molleton gris : vous atteignez une température de fournil et un moelleux de nuage administratif. Sommeil profond, presque géologique.', statChanges: { sleep: 21, health: 3, mental: 6 } },
        { probability: 0.4, text: 'Les déménageurs attellent la remorque à 7h. Vous toquez de l\'intérieur au premier stop. On vous libère à 40 km, mais avec le café du routier et une couverture « cadeau de la boîte ». Le retour en stop est fourni par le destin.', statChanges: { sleep: 15, mental: -3, thirst: 6 }, itemGain: { id: 'couverture-demenagement', name: 'Couverture de déménageur', emoji: '🧣', type: 'armor', value: 7, defenseBonus: 2 } },
      ]},
      { text: 'En emprunter juste une, discrètement', risk: 'safe', emoji: '🤫', outcomes: [
        { probability: 1, text: 'Une seule, la plus épaisse, pliée sous le bras. La remorque n\'y verra que du feu, et vos nuits prochaines non plus.', statChanges: { sleep: 8, mental: 4 }, itemGain: { id: 'couverture-grise', name: 'Couverture molletonnée', emoji: '🧣', type: 'armor', value: 6, defenseBonus: 1 } },
      ]},
    ],
  },
  {
    id: 'rest-kiosque-musique', title: 'Le Kiosque à Musique', type: 'discovery',
    image: '/assets/rest-kiosque-musique.webp',
    description: 'Le kiosque à musique du parc, vide depuis la dernière fanfare. Toit en zinc, plancher surélevé, rambardes ouvragées : une chambre ronde avec vue sur les massifs.',
    choices: [
      { text: 'Dormir au centre de la scène', risk: 'normal', emoji: '🎺', outcomes: [
        { probability: 0.7, text: 'L\'acoustique du kiosque amplifie doucement le vent dans les feuilles : la ville vous joue une berceuse en sourdine. Vous dormez en chef d\'orchestre du silence.', statChanges: { sleep: 16, mental: 9 } },
        { probability: 0.3, text: 'La fanfare municipale répète à 8h. Vous vous réveillez au centre d\'un cercle de cuivres qui attaque « El Bimbo ». Le tuba vous salue d\'un pouet compatissant. Vous saluez le public. Il y a un public.', statChanges: { sleep: 10, mental: 6, dignity: -4 } },
      ]},
      { text: 'Dormir sous le plancher du kiosque', risk: 'safe', emoji: '🕳️', outcomes: [
        { probability: 1, text: 'Le vide sanitaire du kiosque : sec, discret, à l\'abri de tout. Vous dormez sous la musique en puissance, comme un secret de la République.', statChanges: { sleep: 13 } },
      ]},
    ],
  },
  {
    id: 'rest-tente-expo', title: 'La Tente d\'Exposition', type: 'discovery',
    image: '/assets/rest-tente-expo.webp',
    description: 'Le magasin de sport a monté sa tente familiale « 6 places, montage 2 minutes » en démonstration sur le parvis. Elle est restée là. Montée. Vide. Six places.',
    choices: [
      { text: 'Occuper la chambre parentale', risk: 'normal', emoji: '⛺', outcomes: [
        { probability: 0.6, text: 'Tapis de sol intégré, moustiquaire, double toit. Le camping sauvage en plein centre-ville, homologué par la vitrine d\'à côté. Vous dormez en famille de démonstration, section père fatigué.', statChanges: { sleep: 18, mental: 7 } },
        { probability: 0.4, text: 'Le vendeur ouvre la tente à 9h pour sa démo... et improvise : « et comme vous voyez, elle est si confortable qu\'on y dort VRAIMENT. » Vous saluez les clients. Deux tentes vendues. Il vous glisse un billet de « commercial ».', moneyChange: 5, statChanges: { sleep: 14, dignity: -2, mental: 6 } },
      ]},
      { text: 'Emprunter juste le tapis de sol', risk: 'safe', emoji: '🧻', outcomes: [
        { probability: 1, text: 'Le tapis de sol de démonstration, roulé sous le bras. La tente en a vu d\'autres. Votre dos, lui, découvre le confort norvégien.', statChanges: { sleep: 8, mental: 3 }, itemGain: { id: 'tapis-sol', name: 'Tapis de sol norvégien', emoji: '🧻', type: 'junk', value: 5 } },
      ]},
    ],
  },
];
