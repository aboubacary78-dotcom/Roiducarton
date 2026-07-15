// ============================================================================
// VOLER, VAGUE 2 (30 événements)
// ----------------------------------------------------------------------------
// Le vol « à texte » : haut risque, haute récompense, conscience en option.
// Les gains sont plus gros qu'ailleurs, les échecs plus cuisants (santé,
// dignité, respect). Fusionné dans STEAL_EVENTS (voir events.ts).
// ============================================================================
import type { GameEvent } from '../types';

export const STEAL_EVENTS_2: GameEvent[] = [
  {
    id: 'steal-distributeur-secoue', title: 'Le Distributeur Récalcitrant', type: 'narrative',
    image: '/assets/steal-distributeur-secoue.webp',
    description: 'Le distributeur de la gare a gardé le Twix ET la pièce d\'un voyageur furieux, parti en jurant. La machine vous nargue, repue.',
    choices: [
      { text: 'La secouer méthodiquement', risk: 'risky', emoji: '🫨', outcomes: [
        { probability: 0.5, text: 'Trois secousses expertes : le Twix tombe, plus deux canettes en prime de sortie. La machine rend gorge. Justice mécanique.', statChanges: { hunger: 15, thirst: 12, mental: 5 } },
        { probability: 0.3, text: 'La machine bascule vers vous. Vous la retenez de justesse, seul, pendant dix secondes d\'éternité. Un vigile vous aide à la redresser... puis vous escorte dehors.', statChanges: { health: -6, mental: -4, dignity: -3 } },
        { probability: 0.2, text: 'L\'alarme se déclenche. Une alarme. Sur un distributeur. Vous fuyez bredouille, poursuivi par un bip strident et le sentiment que le monde exagère.', statChanges: { mental: -5 } },
      ]},
      { text: 'Pêcher la pièce au fil de fer', risk: 'normal', emoji: '🎣', outcomes: [
        { probability: 0.6, text: 'Votre fil de fer remonte la pièce, plus deux autres oubliées dans la trappe. La pêche est bonne.', moneyChange: 3, statChanges: { mental: 4 } },
        { probability: 0.4, text: 'Le fil de fer reste coincé dans la machine. Vous laissez votre matériel sur place, comme un braqueur qui abandonne sa voiture au feu rouge.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'steal-chantier-cuivre', title: 'Le Cuivre du Chantier', type: 'narrative',
    image: '/assets/steal-chantier-cuivre.webp',
    description: 'Le chantier est désert, le grillage bâille, et des chutes de câble cuivre brillent dans une benne. Le ferrailleur paie comptant, sans biographie.',
    choices: [
      { text: 'Remplir un sac de chutes', risk: 'risky', emoji: '🔌', outcomes: [
        { probability: 0.5, text: 'Cinq kilos de cuivre « tombés de la benne ». Le ferrailleur pèse, paie, et ne demande rien. C\'est toute sa philosophie.', moneyChange: 12, statChanges: { mental: 3, dignity: -4 } },
        { probability: 0.3, text: 'Le gardien de nuit surgit avec son chien. Vous passez le grillage en jetant le sac, le pantalon y laisse un morceau. Le chien garde le trophée.', statChanges: { health: -7, mental: -5, dignity: -5 } },
        { probability: 0.2, text: 'Un ouvrier revenu chercher son casque vous surprend... et hausse les épaules : « les chutes, on les jette. Prends. Mais touche pas aux rouleaux neufs. » Un code d\'honneur.', moneyChange: 7, respectChange: 1 },
      ]},
      { text: 'Ne prendre que ce qui dépasse du grillage', risk: 'normal', emoji: '🤏', outcomes: [
        { probability: 0.7, text: 'Techniquement, ce qui dépasse du grillage est sur le trottoir. Votre avocat intérieur valide. Petit butin, conscience intacte.', moneyChange: 4, statChanges: { mental: 2 } },
        { probability: 0.3, text: 'Ce qui dépassait était relié à ce qui ne dépassait pas. Le tout tombe avec fracas. Vous partez sans demander votre reste, ni le sien.', statChanges: { mental: -3 } },
      ]},
    ],
  },
  {
    id: 'steal-terrasse-pourboires', title: 'Les Pourboires de la Terrasse', type: 'narrative',
    image: '/assets/steal-terrasse-pourboires.webp',
    description: 'Service de midi terminé : les tables de la terrasse sont couvertes de soucoupes à pourboires que le serveur, débordé, n\'a pas encore ramassées.',
    choices: [
      { text: 'Faire la moisson des soucoupes', risk: 'risky', emoji: '🪙', outcomes: [
        { probability: 0.5, text: 'Sept soucoupes écrémées en trente secondes, chorégraphie de pickpocket de mobilier. Vous tournez le coin de la rue en millionnaire de la petite monnaie.', moneyChange: 9, statChanges: { dignity: -5, mental: -2 } },
        { probability: 0.5, text: 'Le serveur sort PILE à la quatrième soucoupe. Il ne court pas : il crie votre description au quartier entier. Votre portrait-robot est très ressemblant.', moneyChange: 3, statChanges: { mental: -6, dignity: -6 }, respectChange: -2 },
      ]},
      { text: 'Débarrasser les tables et encaisser « le service »', risk: 'normal', emoji: '🍽️', outcomes: [
        { probability: 0.6, text: 'Vous empilez les assiettes comme un pro. Le serveur, soulagé, vous laisse deux soucoupes : « t\'es embauché officieusement. » L\'intérim de la rue.', moneyChange: 5, statChanges: { mental: 4 }, respectChange: 1 },
        { probability: 0.4, text: 'Vous cassez une pile d\'assiettes dès la deuxième table. Le fracas annule le contrat verbal. Vous laissez même une pièce, par remords inversé.', moneyChange: -1, statChanges: { mental: -3, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-buffet-mariage', title: 'Le Buffet du Mariage', type: 'narrative',
    image: '/assets/steal-buffet-mariage.webp',
    description: 'La salle des fêtes célèbre un mariage à deux cents invités. Le buffet est dressé, le vin d\'honneur coule, et personne ne connaît personne. Situation idéale.',
    choices: [
      { text: 'S\'inviter côté famille éloignée', risk: 'risky', emoji: '🥂', outcomes: [
        { probability: 0.5, text: '« Vous êtes de quel côté ? » « Du buffet. » Rire général : on vous adopte. Trois assiettes, deux coupes, une part de pièce montée, et une danse avec la grand-mère.', statChanges: { hunger: 30, thirst: 15, mental: 12, dignity: 3 } },
        { probability: 0.3, text: 'La wedding planner vous repère à l\'assiette numéro deux : liste en main, sourcil levé. Sortie discrète par la cuisine, une cuisse de poulet dans chaque poche.', statChanges: { hunger: 12, mental: -3, dignity: -4 } },
        { probability: 0.2, text: 'Le marié vous prend pour l\'oncle André, brouillé depuis dix ans, venu se réconcilier. Il pleure dans vos bras. Vous êtes désormais l\'oncle André. Il y a un chèque.', moneyChange: 10, statChanges: { hunger: 20, mental: 5, dignity: -3 } },
      ]},
      { text: 'Viser les restes après la fête', risk: 'normal', emoji: '🌙', outcomes: [
        { probability: 0.7, text: 'À 2h, le traiteur remballe et vous tend trois barquettes : « le marié a payé pour deux cents, ils étaient cent quatre-vingts. » Les maths de la fête vous nourrissent trois jours.', statChanges: { hunger: 25, mental: 5 } },
        { probability: 0.3, text: 'Les restes partent intégralement dans le van du traiteur, réglementation oblige. Il vous laisse les dragées. Personne ne mange les dragées. Même vous.', statChanges: { hunger: 4, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-camion-boulangerie', title: 'La Tournée du Boulanger', type: 'narrative',
    image: '/assets/steal-camion-boulangerie.webp',
    description: 'Le camion de livraison de la boulangerie est garé moteur tournant, portes arrière ouvertes sur des étagères de pain chaud. Le livreur discute mi-temps de foot à dix mètres.',
    choices: [
      { text: 'Se servir dans les étagères', risk: 'risky', emoji: '🥖', outcomes: [
        { probability: 0.5, text: 'Deux baguettes et une couronne sous le bras, démarche naturelle de livreur. L\'odeur de pain chaud rend invisible : phénomène scientifique méconnu.', statChanges: { hunger: 22, mental: 4, dignity: -3 } },
        { probability: 0.3, text: 'Le livreur vous voit dans le rétro. La course-poursuite est brève : il connaît le quartier, vous connaissez la faim. Match nul, mais il garde le pain et votre fierté.', statChanges: { health: -4, mental: -5, dignity: -5 } },
        { probability: 0.2, text: 'Le livreur vous surprend la main sur la baguette... et soupire : « les invendus d\'hier sont dans la caisse rouge. Prends là-dedans, pas dans la commande. » Il y a une hiérarchie du pain.', statChanges: { hunger: 16, mental: 2 } },
      ]},
      { text: 'Ramasser les miettes de la caisse tombée', risk: 'safe', emoji: '🐦', outcomes: [
        { probability: 1, text: 'Une caisse a versé au dernier virage : croissants cabossés sur le bitume. La règle des cinq secondes s\'applique généreusement à la rue.', statChanges: { hunger: 12, dignity: -3 } },
      ]},
    ],
  },
  {
    id: 'steal-casier-vestiaire', title: 'Le Casier Mal Fermé', type: 'narrative',
    image: '/assets/steal-casier-vestiaire.webp',
    description: 'Aux vestiaires de la piscine, un casier bâille, cadenas posé dessus sans être clipsé. Dedans : un jean plié, une montre, un portefeuille. Le propriétaire nage un 800 mètres.',
    choices: [
      { text: 'Prendre le portefeuille', risk: 'risky', emoji: '👛', outcomes: [
        { probability: 0.4, text: 'Trente euros et une carte de fidélité kebab tamponnée neuf fois sur dix. Vous prenez les billets, laissez la carte : il aura besoin de ce kebab gratuit pour se consoler.', moneyChange: 15, statChanges: { mental: -6, dignity: -8 }, respectChange: -2 },
        { probability: 0.6, text: 'Le nageur avait fini son 800 mètres. Il est derrière vous, en maillot, très grand, très mouillé, très calme. La conversation qui suit est brève et défavorable.', statChanges: { health: -8, mental: -6, dignity: -7 }, respectChange: -2 },
      ]},
      { text: 'Clipser le cadenas et prévenir l\'accueil', risk: 'safe', emoji: '🔒', outcomes: [
        { probability: 0.7, text: 'Le nageur, prévenu, sort de l\'eau en panique puis vous serre la main trop fort : il y avait sa paie de la semaine. Récompense immédiate et entrée piscine offerte.', moneyChange: 6, respectChange: 2, statChanges: { mental: 6, dignity: 5 } },
        { probability: 0.3, text: 'L\'accueil vous remercie vaguement et vous demande de partir : « les vestiaires sont réservés aux clients. » La vertu a parfois le goût du chlore.', statChanges: { mental: -2, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-potager-nuit', title: 'Le Potager sous la Lune', type: 'narrative',
    image: '/assets/steal-potager-nuit.webp',
    description: 'Le potager du pavillon d\'angle croule sous les tomates, les courgettes font de la figuration, et la maison dort. Le portillon n\'a même pas de loquet.',
    choices: [
      { text: 'Récolter en silence', risk: 'risky', emoji: '🍅', outcomes: [
        { probability: 0.5, text: 'Récolte de minuit : tomates tièdes de la journée, courgette d\'honneur, trois carottes. Le dîner des rois, à genoux dans les fraisiers.', statChanges: { hunger: 24, mental: 3, dignity: -3 } },
        { probability: 0.3, text: 'Le détecteur de mouvement inonde le jardin de lumière. Vous vous figez au milieu des tomates, statue coupable, avant de fuir sous les aboiements du quartier entier.', statChanges: { mental: -6, health: -3, dignity: -4 } },
        { probability: 0.2, text: 'Le propriétaire, insomniaque à la fenêtre, vous observe depuis le début... et descend en pantoufles avec un cabas : « prenez proprement, ça évitera que ça pourrisse. Mais demandez, la prochaine fois. »', statChanges: { hunger: 20, mental: 4, dignity: 2 }, respectChange: 1 },
      ]},
      { text: 'Glaner juste ce qui est tombé au sol', risk: 'safe', emoji: '🥒', outcomes: [
        { probability: 1, text: 'Les fruits tombés appartiennent au premier courbé, c\'est un droit médiéval que vous venez d\'inventer. Deux tomates fendues et une pomme véreuse. Le Moyen Âge mangeait mal.', statChanges: { hunger: 10 } },
      ]},
    ],
  },
  {
    id: 'steal-champagne-vernissage', title: 'Le Champagne du Vernissage', type: 'narrative',
    image: '/assets/steal-champagne-vernissage.webp',
    description: 'La galerie fête une expo. Derrière le rideau du fond, les caisses de champagne attendent leur tour, et le serveur ne sait pas compter jusqu\'à douze.',
    choices: [
      { text: 'Exfiltrer une bouteille sous le manteau', risk: 'risky', emoji: '🍾', outcomes: [
        { probability: 0.5, text: 'La bouteille épouse votre aisselle comme si elle était née pour ça. Revendue fraîche au bistrot d\'à côté, qui ne pose pas de questions aux bonnes affaires.', moneyChange: 11, statChanges: { mental: 3, dignity: -4 } },
        { probability: 0.3, text: 'Le bouchon saute TOUT SEUL sous votre manteau, au milieu de la foule. Vous voilà fontaine humaine devant quarante amateurs d\'art. L\'œuvre la plus commentée de la soirée.', statChanges: { mental: -5, dignity: -8 } },
        { probability: 0.2, text: 'L\'artiste vous surprend... et trinque : « enfin quelqu\'un qui comprend mon travail sur l\'appropriation. » Vous repartez avec la bouteille, officiellement œuvre participative.', moneyChange: 8, statChanges: { mental: 6 }, respectChange: 1 },
      ]},
      { text: 'Vider les fonds de coupes abandonnées', risk: 'normal', emoji: '🥂', outcomes: [
        { probability: 0.6, text: 'Le champagne tiède des autres reste du champagne. Douze fonds de coupe plus tard, l\'art contemporain vous semble beaucoup plus clair.', statChanges: { thirst: 12, mental: 6, health: -2 } },
        { probability: 0.4, text: 'Une coupe contenait un mégot. La découverte est buccale. L\'art est décidément une épreuve.', statChanges: { thirst: 4, health: -3, mental: -4 } },
      ]},
    ],
  },
  {
    id: 'steal-cageots-aube', title: 'Les Cageots de l\'Aube', type: 'narrative',
    image: '/assets/steal-cageots-aube.webp',
    description: 'Six heures du matin : les primeurs déchargent, les cageots s\'empilent sur le trottoir, et dans la pénombre, personne ne distingue un livreur d\'un homme pressé.',
    choices: [
      { text: 'Embarquer un cageot d\'un pas de livreur', risk: 'risky', emoji: '📦', outcomes: [
        { probability: 0.5, text: 'Un cageot d\'oranges sur l\'épaule, démarche syndiquée, personne ne bronche. Vous êtes invisible par excès de plausibilité. Des vitamines pour la semaine.', statChanges: { hunger: 18, mental: 4, dignity: -3 }, moneyChange: 3 },
        { probability: 0.3, text: '« Hé, le nouveau ! Les oranges c\'est chez Marcel, en face ! » Vous livrez le cageot volé chez Marcel. Marcel vous paie la course. Le crime le plus honnête de votre carrière.', moneyChange: 4, statChanges: { mental: 3 } },
        { probability: 0.2, text: 'Le grossiste tient les comptes de ses cageots comme un usurier. Rattrapé en vingt mètres, délesté du cageot et d\'un peu d\'estime publique.', statChanges: { mental: -5, dignity: -5, health: -2 } },
      ]},
      { text: 'Trier les cageots de rebut', risk: 'safe', emoji: '🍊', outcomes: [
        { probability: 1, text: 'Le cageot « à jeter » regorge de fruits à peine bronzés d\'un côté. Les primeurs ferment les yeux : le rebut, c\'est la sécu de la rue.', statChanges: { hunger: 14 } },
      ]},
    ],
  },
  {
    id: 'steal-petit-dej-hotel', title: 'Le Petit-Déjeuner de l\'Hôtel', type: 'narrative',
    image: '/assets/steal-petit-dej-hotel.webp',
    description: 'Le buffet petit-déjeuner de l\'hôtel Continental : accès par la terrasse, personnel débordé, clients en peignoir qui ne se connaissent pas. Le paradis a un horaire : 7h-10h.',
    choices: [
      { text: 'Entrer en client de la chambre 12', risk: 'risky', emoji: '🥐', outcomes: [
        { probability: 0.5, text: '« Chambre 12 » lâché avec l\'assurance d\'un habitué. Œufs, viennoiseries, jus pressé, et le journal offert. Vous petit-déjeunez comme un VRP en déplacement. Somptueux.', statChanges: { hunger: 28, thirst: 15, mental: 10, dignity: 4 } },
        { probability: 0.3, text: 'La chambre 12 descend à son tour. Confrontation de chambres 12. Le maître d\'hôtel tranche à l\'ancienneté du peignoir. Vous sortez avec deux croissants de dédommagement moral.', statChanges: { hunger: 10, mental: -4, dignity: -5 } },
        { probability: 0.2, text: 'La réceptionniste vous démasque à l\'entrée... et vous glisse à l\'oreille : « le lundi, on jette les invendus à 10h15, porte de service. » Une informatrice dans la place.', statChanges: { hunger: 6, mental: 6 } },
      ]},
      { text: 'Attendre les plateaux abandonnés de la terrasse', risk: 'normal', emoji: '🍳', outcomes: [
        { probability: 0.7, text: 'Les clients pressés laissent des demi-buffets sur les tables de terrasse. Vous consolidez trois plateaux en un festin. La logistique hôtelière travaille pour vous.', statChanges: { hunger: 20, thirst: 8 } },
        { probability: 0.3, text: 'Le serveur débarrasse plus vite que son ombre ce matin. Il vous reste un demi-jus d\'orange et la corbeille de pain dur. La concurrence est rude dans l\'hôtellerie.', statChanges: { hunger: 8, thirst: 5 } },
      ]},
    ],
  },
  {
    id: 'steal-fontaine-voeux', title: 'La Fontaine aux Vœux', type: 'narrative',
    image: '/assets/steal-fontaine-voeux.webp',
    description: 'La fontaine du square scintille de pièces : des années de vœux de touristes par dizaines d\'euros. Les vœux des autres, techniquement, sont déjà exaucés ou perdus.',
    choices: [
      { text: 'Pêcher les pièces à la main', risk: 'risky', emoji: '🪙', outcomes: [
        { probability: 0.5, text: 'Vingt minutes de pêche miraculeuse, manches trempées, poches lestées. Vous videz les vœux de 2019 à 2022. Les vœux récents, vous les laissez : déontologie.', moneyChange: 8, statChanges: { dignity: -6, health: -2, mental: -2 } },
        { probability: 0.3, text: 'Une classe de maternelle arrive en plein braquage aquatique. Trente paires d\'yeux vous jugent. La maîtresse improvise une leçon sur « les gens qui prennent les sous des autres ». Vous êtes le support pédagogique.', moneyChange: 3, statChanges: { dignity: -8, mental: -5 } },
        { probability: 0.2, text: 'L\'agent d\'entretien municipal arrive avec son aspirateur à pièces : c\'est SA récolte trimestrielle. Il partage, en collègue : « moitié-moitié, et t\'as rien vu. » Le service public a ses arrangements.', moneyChange: 6, statChanges: { mental: 3 } },
      ]},
      { text: 'Faire un vœu à crédit', risk: 'safe', emoji: '🌠', outcomes: [
        { probability: 1, text: 'Vous jetez un caillou (les pièces, c\'est pour les riches) et souhaitez un toit. Le caillou coule dignement. Le vœu est enregistré, précise une mouette.', statChanges: { mental: 6 } },
      ]},
    ],
  },
  {
    id: 'steal-tirelire-comptoir', title: 'La Tirelire du Comptoir', type: 'narrative',
    image: '/assets/steal-tirelire-comptoir.webp',
    description: 'Sur le comptoir de la boulangerie, la tirelire « pour les chatons abandonnés » déborde de pièces. La boulangère a le dos tourné. Votre estomac et votre conscience ouvrent les négociations.',
    choices: [
      { text: 'Piocher dans la tirelire des chatons', risk: 'risky', emoji: '😿', outcomes: [
        { probability: 0.4, text: 'Une poignée de pièces volées à des chatons hypothétiques. L\'argent pèse dans la poche comme une enclume morale. Chaque miaulement du quartier vous poursuivra huit jours.', moneyChange: 7, statChanges: { mental: -10, dignity: -10 }, respectChange: -3 },
        { probability: 0.6, text: 'La boulangère se retourne au tintement. Silence. Elle ne crie pas : elle vous regarde avec une déception de grand-mère, ce qui est mille fois pire. Vous reposez tout, plus deux pièces à vous. Les chatons gagnent au change.', moneyChange: -2, statChanges: { mental: -6, dignity: -4 } },
      ]},
      { text: 'Demander plutôt un invendu, honnêtement', risk: 'safe', emoji: '🥐', outcomes: [
        { probability: 0.7, text: 'La boulangère vous tend deux croissants de la veille et ajoute une pièce DE la tirelire : « les chatons ont bon dos, y a pas que les chats qui traînent dehors. »', moneyChange: 1, statChanges: { hunger: 14, mental: 8, dignity: 4 } },
        { probability: 0.3, text: '« Les invendus, c\'est pour l\'association. » Refus poli. Mais elle vous glisse un quignon quand la cliente suivante ne regarde pas. Le système D a des alliées.', statChanges: { hunger: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'steal-plaque-egout', title: 'La Plaque d\'Égout', type: 'narrative',
    image: '/assets/steal-plaque-egout.webp',
    description: 'Le ferrailleur paie la fonte au poids et une plaque d\'égout pèse cinquante kilos. Il y en a une, là, à moitié descellée. C\'est une très mauvaise idée. Cinquante kilos de mauvaise idée.',
    choices: [
      { text: 'La rouler jusqu\'au ferrailleur', risk: 'risky', emoji: '🕳️', outcomes: [
        { probability: 0.35, text: 'Six cents mètres de roulage de plaque, un chef-d\'œuvre d\'endurance et de discrétion nulle. Le ferrailleur paie sans regarder ni la plaque ni vous. Votre dos dépose un préavis de grève.', moneyChange: 14, statChanges: { health: -9, dignity: -4, mental: 2 } },
        { probability: 0.4, text: 'La plaque vous échappe au premier dos-d\'âne et dévale la rue en sonnant comme une cloche de cathédrale. Le quartier entier sort. Vous applaudissez avec les autres, l\'air de rien.', statChanges: { health: -4, mental: -4, dignity: -3 } },
        { probability: 0.25, text: 'L\'égoutier — VOTRE égoutier — remonte pile de ce trou-là. Il regarde la plaque, puis vous : « repose ça, ou je raconte au quartier ce qui vit là-dessous. » Vous reposez très vite.', statChanges: { mental: -3, dignity: -2 } },
      ]},
      { text: 'Renoncer : voler l\'infrastructure, c\'est trop', risk: 'safe', emoji: '🧠', outcomes: [
        { probability: 1, text: 'Vous laissez la ville entière sous vos pieds. Il y a des limites, et cinquante kilos en est une excellente.', statChanges: { mental: 4, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-tarte-fenetre', title: 'La Tarte sur le Rebord', type: 'narrative',
    image: '/assets/steal-tarte-fenetre.webp',
    description: 'Une tarte aux pommes refroidit sur un rebord de fenêtre du rez-de-chaussée, comme dans un dessin animé. Vous vérifiez : pas de caméra, pas de piège, pas de scénariste.',
    choices: [
      { text: 'Le vol du dessin animé', risk: 'risky', emoji: '🥧', outcomes: [
        { probability: 0.5, text: 'La tarte fume encore entre vos mains au coin de la rue. C\'est le meilleur cliché de l\'histoire du vol, et il est délicieux. Vous laissez le moule bien en évidence : on rend le contenant.', statChanges: { hunger: 26, mental: 8, dignity: -4 } },
        { probability: 0.3, text: 'La propriétaire surgit à la fenêtre au moment précis de la saisie : « AH BEN ENFIN ! Depuis le temps que je les pose là, personne n\'osait ! » Elle en fait deux par semaine « pour qui passe ». Le folklore existe.', statChanges: { hunger: 22, mental: 10 }, respectChange: 1 },
        { probability: 0.2, text: 'Un chien que vous n\'aviez pas budgété défend la tarte depuis l\'intérieur. Vous gagnez une manche vide et une morsure de rebord. La tarte vous nargue, intacte.', statChanges: { health: -5, mental: -4, hunger: 2 } },
      ]},
      { text: 'Sonner et demander une part', risk: 'safe', emoji: '🔔', outcomes: [
        { probability: 0.6, text: 'La dame coupe un quart généreux « parce qu\'au moins vous avez sonné ». La politesse rapporte 90 degrés de tarte.', statChanges: { hunger: 15, mental: 5, dignity: 3 } },
        { probability: 0.4, text: 'Personne ne répond. Vous restez planté devant une tarte parfaite avec votre honnêteté intacte et votre estomac révolté. La vertu a un coût calorique.', statChanges: { mental: -3, hunger: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-cave-restaurant', title: 'La Cave du Restaurant', type: 'narrative',
    image: '/assets/steal-cave-restaurant.webp',
    description: 'La trappe de livraison de la cave du restaurant gastronomique est restée ouverte sur le trottoir. En bas : des caisses de vin dont chaque bouteille vaut votre semaine.',
    choices: [
      { text: 'Descendre chercher un grand cru', risk: 'risky', emoji: '🍷', outcomes: [
        { probability: 0.4, text: 'Vous remontez avec un bourgogne dont l\'étiquette est une œuvre d\'art. Le caviste d\'occasion l\'achète en tremblant un peu. Une semaine de vivres dans une bouteille.', moneyChange: 15, statChanges: { mental: 3, dignity: -5 }, respectChange: -1 },
        { probability: 0.35, text: 'Le sommelier descend pendant que vous hésitez entre deux appellations. Il vous coince entre les côtes-du-rhône. Négociation : vous remontez les caisses de la livraison, il oublie votre visite. Le tarif syndical de la rédemption.', statChanges: { health: -4, mental: -3, dignity: -3 } },
        { probability: 0.25, text: 'Dans le noir, vous confondez : vous remontez fièrement une bouteille... de vinaigre de service. Le caviste rit encore. Vous assaisonnerez vos trouvailles pendant un mois.', statChanges: { mental: -4 }, itemGain: { id: 'vinaigre-gastro', name: 'Vinaigre gastronomique (volé)', emoji: '🫗', type: 'junk', value: 3 } },
      ]},
      { text: 'Refermer la trappe et prévenir en cuisine', risk: 'safe', emoji: '🚪', outcomes: [
        { probability: 0.7, text: 'Le chef, informé, mesure ce qu\'il aurait pu perdre. Il vous fait asseoir en bout de passe : le menu dégustation des erreurs du service. Sept mini-plats. Le plus beau dîner de votre année.', statChanges: { hunger: 28, mental: 12, dignity: 5 }, respectChange: 2 },
        { probability: 0.3, text: '« Merci, c\'est noté. » La porte se referme. La vertu est parfois un pourboire de zéro euro. Mais la trappe, elle, est fermée.', statChanges: { mental: 2, dignity: 3 } },
      ]},
    ],
  },
  {
    id: 'steal-outils-echafaudage', title: 'Les Outils de l\'Échafaudage', type: 'narrative',
    image: '/assets/steal-outils-echafaudage.webp',
    description: 'Les façadiers sont partis déjeuner en laissant sur l\'échafaudage une perceuse, deux truelles et une radio de chantier qui chante toute seule.',
    choices: [
      { text: 'Monter chercher la perceuse', risk: 'risky', emoji: '🪜', outcomes: [
        { probability: 0.4, text: 'La perceuse glisse dans le sac comme si elle démissionnait d\'elle-même. Le brocanteur la « déclare d\'occasion » avec un tampon imaginaire. Bonne paie, mauvaise conscience.', moneyChange: 12, statChanges: { mental: -4, dignity: -5 }, respectChange: -1 },
        { probability: 0.35, text: 'Les façadiers reviennent avec leurs sandwichs pendant que vous êtes au deuxième niveau. Ils retirent l\'échelle et déjeunent en dessous, sans se presser. Vous descendez une heure plus tard, par la gouttière, sous les applaudissements.', statChanges: { health: -5, mental: -5, dignity: -6 } },
        { probability: 0.25, text: 'La radio de chantier tombe pendant votre manœuvre et continue de chanter dans le vide, puis au sol, indestructible. Vous ne prenez rien mais vous adoptez la radio. Elle l\'a mérité.', statChanges: { mental: 4 }, itemGain: { id: 'radio-chantier', name: 'Radio de chantier immortelle', emoji: '📻', type: 'junk', value: 8, effect: { mental: 6 } } },
      ]},
      { text: 'Garder le chantier contre rémunération', risk: 'normal', emoji: '👁️', outcomes: [
        { probability: 0.6, text: 'Au retour, le chef d\'équipe apprécie le gardiennage improvisé : « au moins avec toi, on sait où sont les outils. » Pièce, café du thermos, et proposition de revenir demain midi.', moneyChange: 5, statChanges: { thirst: 6, mental: 5 }, respectChange: 1 },
        { probability: 0.4, text: 'Le chef d\'équipe compte ses truelles TROIS fois devant vous. La confiance se mérite, l\'humiliation est offerte. Il paie quand même « le dérangement ».', moneyChange: 2, statChanges: { mental: -3, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-jetons-caddies', title: 'Les Jetons des Caddies', type: 'narrative',
    image: '/assets/steal-jetons-caddies.webp',
    description: 'Une astuce de vieux brigand : certains caddies rendent leur jeton avec un coup sec au bon endroit. Le parking en compte quarante, alignés comme des tirelires.',
    choices: [
      { text: 'Traire la rangée entière', risk: 'risky', emoji: '🛒', outcomes: [
        { probability: 0.5, text: 'Le coup sec fonctionne une fois sur trois : quatorze caddies traits, cinq pièces, deux jetons en plastique (la déception du métier). Un salaire de percussionniste.', moneyChange: 5, statChanges: { mental: 3, dignity: -3 } },
        { probability: 0.3, text: 'Le vigile observe votre récital de coups secs depuis la caméra 4. Il vous laisse finir, par curiosité technique, puis vous raccompagne : « la maison garde les pièces. » Il note quand même la technique.', moneyChange: 1, statChanges: { mental: -3, dignity: -3 } },
        { probability: 0.2, text: 'Un caddie rend son jeton, puis un deuxième, puis le mécanisme central rend TOUT : une cascade de pièces de faux jetons et de vraies pièces mélangés. Vous triez accroupi, en riant tout seul.', moneyChange: 8, statChanges: { mental: 5 } },
      ]},
      { text: 'Rendre les caddies errants, méthode légale', risk: 'safe', emoji: '↩️', outcomes: [
        { probability: 1, text: 'Le grand classique : six caddies abandonnés ramenés au bercail, six pièces gagnées à la sueur du front. L\'honnêteté paie moins vite mais dort mieux.', moneyChange: 6, statChanges: { dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-fleurs-cimetiere', title: 'Les Fleurs du Cimetière', type: 'narrative',
    image: '/assets/steal-fleurs-cimetiere.webp',
    description: 'Le cimetière regorge de chrysanthèmes frais d\'hier. La fleuriste d\'en face les vend douze euros le pot. Le circuit court par excellence, moralement inconfortable.',
    choices: [
      { text: 'Prélever sur les tombes les mieux fournies', risk: 'risky', emoji: '🥀', outcomes: [
        { probability: 0.4, text: 'Trois pots prélevés sur des tombes qui en comptaient dix. La fleuriste rachète « vos invendus » sans regarder la terre sur les pots. L\'argent est réel, le malaise aussi. Les morts, eux, n\'ont rien dit.', moneyChange: 10, statChanges: { mental: -8, dignity: -8 }, respectChange: -2 },
        { probability: 0.35, text: 'Le gardien du cimetière vous intercepte à la grille, un pot sous chaque bras. Il ne crie pas : il vous fait replanter les fleurs, une par une, en vous racontant qui sont les occupants. Vous ressortez à la nuit, changé.', statChanges: { mental: -4, dignity: -3, sleep: -3 } },
        { probability: 0.25, text: 'Une veuve vous surprend la main sur son pot... et vous le donne : « il en aurait ri, lui. Il détestait les chrysanthèmes. » Vous repartez avec les fleurs et une histoire à ne raconter à personne.', moneyChange: 4, statChanges: { mental: 2 } },
      ]},
      { text: 'Ramasser les fleurs fanées jetées au compost', risk: 'safe', emoji: '🌼', outcomes: [
        { probability: 1, text: 'Le bac à compost du cimetière déborde de bouquets « presque morts ». Vous triez, recomposez, et obtenez deux bouquets honorables. La seconde vie des fleurs de seconde main.', statChanges: { mental: 4 }, itemGain: { id: 'bouquet-compost', name: 'Bouquet recomposé', emoji: '💐', type: 'junk', value: 4, effect: { mental: 5 } } },
      ]},
    ],
  },
  {
    id: 'steal-glaciere-pique-nique', title: 'La Glacière du Pique-Nique', type: 'narrative',
    image: '/assets/steal-glaciere-pique-nique.webp',
    description: 'Une famille dispute un match de badminton à trente mètres de sa glacière. La glacière, elle, ne joue pas : elle attend, pleine, à l\'ombre du saule.',
    choices: [
      { text: 'Détourner la glacière', risk: 'risky', emoji: '🧊', outcomes: [
        { probability: 0.45, text: 'La glacière contient un festin de famille nombreuse : taboulé, cuisses de poulet, melon, et huit yaourts à boire. Vous mangez royalement derrière le talus, en spectateur du badminton. Le père perd 21-9.', statChanges: { hunger: 28, thirst: 15, mental: 4, dignity: -6 } },
        { probability: 0.35, text: 'Le volant de badminton atterrit à deux mètres pendant l\'exfiltration. Toute la famille rapplique. Vous rendez la glacière en prétendant l\'avoir « trouvée qui glissait vers l\'étang ». Personne n\'y croit, mais on vous laisse un sandwich pour l\'audace.', statChanges: { hunger: 8, mental: -4, dignity: -5 } },
        { probability: 0.2, text: 'La glacière était celle d\'une équipe de rugby amateur, pas de la famille. Treize gaillards vous regardent la soulever. Vous la reposez avec une délicatesse infinie et improvisez un contrôle qualité : « elle ferme bien, RAS. » Ils rient. Vous vivez.', statChanges: { mental: -3, dignity: -3 } },
      ]},
      { text: 'Ramasser les restes après leur départ', risk: 'safe', emoji: '🧺', outcomes: [
        { probability: 1, text: 'La famille abandonne sur place chips entamées, pain et un fond de rosé tiède. Le service après-pique-nique, c\'est vous.', statChanges: { hunger: 12, thirst: 6 } },
      ]},
    ],
  },
  {
    id: 'steal-enseigne-neon', title: 'La Lettre du Néon Mort', type: 'narrative',
    image: '/assets/steal-enseigne-neon.webp',
    description: 'Le magasin « SUPERETTE » a fermé il y a deux ans. Son enseigne pend, et le « S » lumineux ne tient plus qu\'à un fil. Le brocanteur adore les lettres géantes, les décorateurs aussi.',
    choices: [
      { text: 'Décrocher le S géant', risk: 'risky', emoji: '🔠', outcomes: [
        { probability: 0.45, text: 'Le S se détache dans un craquement de fin d\'époque. « UPERETTE » restera. Le brocanteur paie la lettre au prix de la nostalgie industrielle : très bien.', moneyChange: 11, statChanges: { mental: 4, dignity: -2 } },
        { probability: 0.35, text: 'Le S vous glisse des mains et explose au sol en confettis de plexiglas. Deux ans à pendre pour finir comme ça. Vous balayez les morceaux, par respect pour la typographie.', statChanges: { mental: -4, health: -2 } },
        { probability: 0.2, text: 'L\'ancien gérant passait justement revoir sa vitrine morte. Il vous regarde faire, puis aide à décrocher : « prends-le, petit. Ce magasin m\'a bouffé vingt ans, qu\'il serve au moins à quelqu\'un. » Il garde le E, « pour Éliane ».', moneyChange: 8, statChanges: { mental: 6 }, respectChange: 1 },
      ]},
      { text: 'Récupérer juste le câblage en cuivre', risk: 'normal', emoji: '🔌', outcomes: [
        { probability: 0.6, text: 'Trois mètres de câble d\'enseigne, cuivre honnête. Le ferrailleur paie sans poésie. La typographie, ça ne se mange pas.', moneyChange: 5, statChanges: { dignity: -2 } },
        { probability: 0.4, text: 'Le câble était encore relié à quelque chose. La châtaigne vous traverse jusqu\'aux chaussettes. Le néon mort avait un dernier mot à dire.', statChanges: { health: -7, mental: -4 } },
      ]},
    ],
  },
  {
    id: 'steal-panier-velo', title: 'Le Panier du Vélo Hollandais', type: 'narrative',
    image: '/assets/steal-panier-velo.webp',
    description: 'Un vélo hollandais impeccable est garé devant la librairie, panier avant chargé : une baguette, un bouquet, un livre neuf et un parapluie. Une nature morte à ciel ouvert.',
    choices: [
      { text: 'Vider le panier', risk: 'risky', emoji: '🧺', outcomes: [
        { probability: 0.45, text: 'Baguette sous le bras, bouquet offert plus tard à qui sourira, livre revendu au bouquiniste. Le parapluie, vous le laissez : il faut savoir doser le malheur des gens.', moneyChange: 6, statChanges: { hunger: 12, mental: -3, dignity: -5 } },
        { probability: 0.35, text: 'La propriétaire sort de la librairie au moment où votre main touche la baguette. Elle vous fixe... et casse la baguette en deux : « la moitié, et on n\'en parle plus. » Le partage le plus sec et le plus juste du mois.', statChanges: { hunger: 8, mental: -2, dignity: -3 } },
        { probability: 0.2, text: 'Sous la baguette, une enveloppe : des tickets-restaurant. Le jackpot du travailleur. Votre conscience proteste mollement, votre estomac signe le reçu.', moneyChange: 9, statChanges: { hunger: 4, mental: -5, dignity: -6 }, respectChange: -1 },
      ]},
      { text: 'Redresser le vélo qui penche et attendre', risk: 'safe', emoji: '🚲', outcomes: [
        { probability: 0.6, text: 'La propriétaire sort, vous voit tenir son vélo contre le vent, et vous offre la baguette entière « pour le service de voirie ». La vertu paie en boulangerie.', statChanges: { hunger: 14, mental: 5, dignity: 4 } },
        { probability: 0.4, text: 'Elle sort, méfiante, vous soupçonne du regard, et repart en pédalant vite. Être suspect en rendant service : le grand écart quotidien.', statChanges: { mental: -3, dignity: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-pressing-costume', title: 'Le Portant du Pressing', type: 'narrative',
    image: '/assets/steal-pressing-costume.webp',
    description: 'Le pressing a sorti son portant de livraison sur le trottoir : douze housses, dont un costume trois-pièces étiqueté « Maître Bernard, plaidoirie jeudi ». Un costume d\'avocat. Votre taille, en plus.',
    choices: [
      { text: 'Emprunter le costume de Maître Bernard', risk: 'risky', emoji: '🤵', outcomes: [
        { probability: 0.4, text: 'Le costume tombe parfaitement. Pendant une journée entière, on vous dit « bonjour Maître ». Les terrasses vous servent d\'abord, les vigiles vous saluent. Vous le rendez au portant le soir, changé à jamais.', statChanges: { dignity: 15, mental: 12, hunger: 5 }, respectChange: 2 },
        { probability: 0.35, text: 'La livreuse du pressing vous rattrape à cent mètres, la housse encore sur l\'épaule. Elle récupère Maître Bernard sans un mot et vous laisse... le cintre. Le cintre de la honte.', statChanges: { mental: -4, dignity: -5 } },
        { probability: 0.25, text: 'Maître Bernard en personne arrive chercher son bien pendant votre repérage. Il vous jauge : « vous auriez plaidé quoi, pour vous défendre ? » Votre réponse l\'amuse tant qu\'il vous paie le café et une consultation gratuite de trottoir.', statChanges: { mental: 8, thirst: 6 }, respectChange: 1 },
      ]},
      { text: 'Fouiller le bac « non réclamés depuis 1 an »', risk: 'safe', emoji: '🧥', outcomes: [
        { probability: 1, text: 'Le pressing brade les vêtements jamais réclamés. Pour trois fois rien, une chemise empesée qui sent le propre industriel. Le luxe, c\'est l\'amidon.', moneyChange: -1, statChanges: { dignity: 8, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'steal-barbecue-parc', title: 'Le Barbecue Sans Surveillance', type: 'narrative',
    image: '/assets/steal-barbecue-parc.webp',
    description: 'Un barbecue de parc crépite, couvert de merguez et de côtelettes, pendant que ses propriétaires débattent à vingt mètres de politique locale. Le débat est vif, la viande est prête.',
    choices: [
      { text: 'Prélever discrètement au bord de la grille', risk: 'risky', emoji: '🌭', outcomes: [
        { probability: 0.5, text: 'Quatre merguez du périmètre extérieur, prélevées au fil des passages. La rotation des stocks, ça s\'appelle. Personne ne compte ses merguez pendant un débat sur les pistes cyclables.', statChanges: { hunger: 22, mental: 4, dignity: -3 } },
        { probability: 0.3, text: '« ET LES MERGUEZ, ELLES VOTENT POUR QUI ? » Le cuisinier vous a vu. Le débat entier se retourne vers vous. Vous voilà sommé de donner votre avis sur les pistes cyclables, une merguez volée à la main. Vous votez bien. On vous ressert.', statChanges: { hunger: 15, mental: 5, dignity: -2 } },
        { probability: 0.2, text: 'La grille bascule pendant votre prélèvement : la moitié du barbecue tombe dans les braises. Vous fuyez sous une pluie d\'insultes gastronomiques, une demi-côtelette pour tout butin.', statChanges: { hunger: 6, mental: -5, dignity: -5 }, respectChange: -1 },
      ]},
      { text: 'S\'incruster dans le débat politique', risk: 'normal', emoji: '🗣️', outcomes: [
        { probability: 0.7, text: 'Votre analyse de la voirie locale (vous dormez dessus, vous connaissez) cloue le débat. On vous tend une assiette pleine : l\'expertise de terrain, ça se rémunère.', statChanges: { hunger: 20, thirst: 8, mental: 8 }, respectChange: 1 },
        { probability: 0.3, text: 'Vous prenez parti pour le mauvais camp : celui qui n\'a pas apporté la viande. Assiette réduite, ambiance froide, merguez tiède. La politique a un prix.', statChanges: { hunger: 8, mental: -2 } },
      ]},
    ],
  },
  {
    id: 'steal-colis-palier', title: 'Le Colis du Palier', type: 'narrative',
    image: '/assets/steal-colis-palier.webp',
    description: 'Dans le hall où vous vous abritez, un colis attend devant la porte du 3B depuis ce matin. La boîte est grande, le carton est beau, et le 3B ne rentre visiblement pas.',
    choices: [
      { text: 'Adopter le colis', risk: 'risky', emoji: '📦', outcomes: [
        { probability: 0.45, text: 'Le colis contient un plaid en fausse fourrure et deux coussins « style scandinave ». Le confort nordique vous tend les bras volés. Sur le carton, un prénom : Lucie. Vous dormirez chaud, avec ce prénom sur la conscience.', statChanges: { sleep: 8, mental: -6, dignity: -6 }, addFlag: 'colis-lucie', itemGain: { id: 'plaid-scandinave', name: 'Plaid scandinave (de Lucie)', emoji: '🧣', type: 'armor', value: 8, defenseBonus: 1 } },
        { probability: 0.3, text: 'Le voisin du 3A ouvre pile à la saisie : « c\'est le colis de Lucie, je lui garde. » Il le prend, vous toise, et referme. Vous venez de perdre un duel moral contre un homme en charentaises.', statChanges: { mental: -4, dignity: -4 } },
        { probability: 0.25, text: 'Le colis gargouille. Vous ouvrez : un kit « brassez votre bière chez vous », fuité pendant le transport. Ni buvable, ni revendable, mais le carton double épaisseur est somptueux. Le lot de consolation logistique.', statChanges: { mental: 2, sleep: 4 } },
      ]},
      { text: 'Le rentrer à l\'abri des regards, pour Lucie', risk: 'safe', emoji: '🛡️', outcomes: [
        { probability: 0.7, text: 'Vous calez le colis dans un angle mort et montez la garde. Lucie rentre à 19h : soulagement, remerciements, et un billet « pour le gardiennage ». Le voisin du 3A n\'a rien vu venir.', moneyChange: 5, statChanges: { mental: 6, dignity: 5 }, respectChange: 1 },
        { probability: 0.3, text: 'Vous gardez le colis quatre heures. Lucie ne rentre pas. Le gardien de l\'immeuble vous délogera à 22h, colis intact, vertu invisible. Personne ne saura jamais. Vous, si.', statChanges: { mental: 3, sleep: -3, dignity: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-sapin-decembre', title: 'Le Sapin Invendu', type: 'narrative',
    image: '/assets/steal-sapin-decembre.webp',
    description: 'Le vendeur de sapins remballe le 24 au soir. Il reste douze invendus enchaînés ensemble, condamnés à la benne du 26. Ils sentent la forêt et l\'occasion.',
    choices: [
      { text: 'Libérer un sapin cette nuit', risk: 'risky', emoji: '🎄', outcomes: [
        { probability: 0.5, text: 'La chaîne glisse, un épicéa rejoint votre spot. Décoré de canettes et d\'un gant orphelin, il devient LE sapin du quartier des invisibles. Trois personnes viennent y déposer un truc. Quelqu\'un pleure. Noël opère.', statChanges: { mental: 14, dignity: 4 }, respectChange: 2 },
        { probability: 0.3, text: 'Le vendeur dormait dans sa camionnette. Il sort en pyjama de Noël : « ils sont à moi jusqu\'au 26 ! » Puis il regarde l\'heure, la date, votre tête... et coupe la chaîne lui-même : « joyeux Noël, prends le moche. » Le moche est très bien.', statChanges: { mental: 10 }, respectChange: 1 },
        { probability: 0.2, text: 'Traîner un sapin de deux mètres en pleine nuit fait de vous l\'homme le plus identifiable de l\'hémisphère. Une patrouille vous suit au ralenti sur 400 mètres, hilare, avant de vous aider à le porter. Le procès-verbal se transforme en photo souvenir.', statChanges: { mental: 6, health: -3, dignity: -3 } },
      ]},
      { text: 'Ramasser les branches coupées', risk: 'safe', emoji: '🌲', outcomes: [
        { probability: 1, text: 'Le tapis de branches taillées embaume. De quoi isoler le carton du sol et dormir dans une odeur de montagne. Le sapin des pauvres est horizontal.', statChanges: { sleep: 6, mental: 5 } },
      ]},
    ],
  },
  {
    id: 'steal-vestiaire-theatre', title: 'Le Vestiaire du Théâtre', type: 'narrative',
    image: '/assets/steal-vestiaire-theatre.webp',
    description: 'Entracte au théâtre municipal : le vestiaire déborde de manteaux, la préposée est partie fumer, et les tickets numérotés dorment sur le comptoir. Douze minutes d\'entracte.',
    choices: [
      { text: 'Emprunter le plus beau manteau', risk: 'risky', emoji: '🧥', outcomes: [
        { probability: 0.4, text: 'Un cachemire gris qui tombe comme une bénédiction. Vous sortez par le foyer, salué par un ouvreur. Le vol le plus élégant de votre carrière. Le froid, cet hiver, devra prendre rendez-vous.', statChanges: { dignity: 6, mental: -4, health: 4 }, respectChange: -1, itemGain: { id: 'manteau-cachemire', name: 'Manteau en cachemire (emprunté)', emoji: '🧥', type: 'armor', value: 14, defenseBonus: 3 } },
        { probability: 0.35, text: 'La préposée revient à la moitié de votre repérage. Vous improvisez : « le 43, s\'il vous plaît. » Elle vous tend un k-way jaune poussin taille enfant. Vous le prenez, par cohérence. Vous partez en k-way.', statChanges: { mental: -3, dignity: -6 } },
        { probability: 0.25, text: 'Dans la poche du manteau visé : des clés de voiture et un doudou. L\'équation humaine vous désarme. Vous reposez tout et sortez les mains vides, rattrapé par votre propre code d\'honneur. Il choisit toujours mal ses horaires.', statChanges: { mental: 4, dignity: 3 } },
      ]},
      { text: 'Regarder la seconde partie, planqué au balcon', risk: 'normal', emoji: '🎭', outcomes: [
        { probability: 0.7, text: 'Le strapontin du fond vous accueille pour une heure de tragédie en alexandrins. Vous pleurez à la mort du héros, plus fort que les abonnés. Le théâtre, c\'est fait pour ça.', statChanges: { mental: 12, sleep: 4 } },
        { probability: 0.3, text: 'Vous vous endormez à la scène 2 et votre ronflement participe au drame. L\'ouvreur vous évacue pendant les applaudissements, ce qui les fait redoubler. Sortie d\'artiste.', statChanges: { sleep: 8, mental: 3, dignity: -4 } },
      ]},
    ],
  },
  {
    id: 'steal-miel-toits', title: 'Le Miel des Toits', type: 'narrative',
    image: '/assets/steal-miel-toits.webp',
    description: 'Les ruches du toit du gymnase produisent un miel urbain vendu une fortune en boutique bio. Les pots de la dernière récolte attendent dans la cabane de l\'apiculteur, à peine cadenassée. Les gardiennes, elles, sont trente mille et armées.',
    choices: [
      { text: 'Tenter le casse du miel', risk: 'risky', emoji: '🍯', outcomes: [
        { probability: 0.4, text: 'Quatre pots exfiltrés sous le regard de dix mille ouvrières qui vous prennent pour un courant d\'air. La boutique bio rachète « votre production familiale ». Le crime le plus sucré de l\'année.', moneyChange: 13, statChanges: { mental: 3, dignity: -4 }, respectChange: -1 },
        { probability: 0.35, text: 'Les abeilles décrètent l\'alerte générale à mi-chemin. Vous battez le record du monde de descente d\'escalier de service, six piqûres au compteur et zéro pot. La sécurité la plus efficace du marché coûte zéro euro en salaires.', statChanges: { health: -8, mental: -4, dignity: -4 } },
        { probability: 0.25, text: 'L\'apiculteur était dans la cabane. Silence. Puis : « t\'es le gars qui m\'a aidé, non ? » Il vous paie la visite en rayon de miel et vous propose de garder les ruches le dimanche, contre un pot par semaine. Embauché par la mafia des fleurs.', statChanges: { hunger: 12, mental: 8 }, moneyChange: 3, respectChange: 1 },
      ]},
      { text: 'Gratter la cire tombée sous les cadres', risk: 'safe', emoji: '🕯️', outcomes: [
        { probability: 1, text: 'Les résidus de cire au pied des ruches font d\'excellentes bougies de fortune. Les abeilles tolèrent le glanage : c\'est écrit nulle part, mais elles le font savoir.', statChanges: { mental: 3 }, itemGain: { id: 'cire-abeille', name: 'Boule de cire d\'abeille', emoji: '🕯️', type: 'junk', value: 5 } },
      ]},
    ],
  },
  {
    id: 'steal-arrosoir-mairie', title: 'Les Jardinières de la Mairie', type: 'narrative',
    image: '/assets/steal-arrosoir-mairie.webp',
    description: 'La mairie a planté ses jardinières d\'apparat : herbes aromatiques « pédagogiques », fraisiers « participatifs » et un panneau « servez-vous raisonnablement ». Personne n\'ose jamais. Le raisonnable, c\'est votre rayon.',
    choices: [
      { text: 'Prendre au mot le panneau, XXL', risk: 'risky', emoji: '🍓', outcomes: [
        { probability: 0.5, text: 'Basilic, menthe, quarante fraises et deux pieds de tomates cerises : vous « participez » comme personne n\'a jamais participé. Le panneau couvre tout. Juridiquement, vous êtes un citoyen exemplaire.', statChanges: { hunger: 18, mental: 6 } },
        { probability: 0.3, text: 'L\'adjointe aux espaces verts vous surprend en pleine récolte magistrale... et vous prend en photo POUR LE BULLETIN MUNICIPAL : « enfin quelqu\'un qui utilise le dispositif ! » Vous êtes la une de « Vivre Ensemble » de novembre.', statChanges: { hunger: 14, mental: 5, dignity: 3 }, respectChange: 2 },
        { probability: 0.2, text: 'Un retraité vigilant défend les fraisiers « pour les enfants des écoles ». Le duel du raisonnable s\'engage à la binette verbale. Il gagne aux points : il a le temps, vous avez faim. Il concède la menthe.', statChanges: { hunger: 4, mental: -3 } },
      ]},
      { text: 'Cueillir trois brins de menthe, raisonnable', risk: 'safe', emoji: '🌿', outcomes: [
        { probability: 1, text: 'Trois brins pour l\'eau de la gourde. La menthe municipale a un goût de civisme. C\'est frais, c\'est légal, c\'est peu.', statChanges: { thirst: 8, mental: 3 } },
      ]},
    ],
  },
  {
    id: 'steal-tombola-lots', title: 'Les Lots de la Tombola', type: 'narrative',
    image: '/assets/steal-tombola-lots.webp',
    description: 'La kermesse remballe. Sur la table des lots de tombola non réclamés : un jambon entier, une cafetière, un vélo d\'enfant et un bon d\'achat. Le stand est vide, les tickets s\'envolent au vent.',
    choices: [
      { text: 'Réclamer le jambon avec un ticket ramassé', risk: 'risky', emoji: '🍖', outcomes: [
        { probability: 0.45, text: 'Le ticket 347 ramassé par terre est GAGNANT (personne ne vérifie un homme sûr de lui). Le jambon entier change de destin. Sept kilos de victoire à l\'os.', statChanges: { hunger: 30, mental: 6, dignity: -3 }, moneyChange: 4 },
        { probability: 0.3, text: 'La présidente du comité des fêtes connaît chaque ticket par cœur, c\'est sa fierté annuelle. « Le 347, c\'est madame Painlevé. » Vous rendez le ticket à madame Painlevé, qui vous donne une tranche pour la démarche. L\'audit a du bon.', statChanges: { hunger: 8, mental: -2, dignity: -2 } },
        { probability: 0.25, text: 'Votre ticket gagne... le vélo d\'enfant. Rose. À paillettes. Vous le revendez à un père en retard d\'anniversaire, qui négocie à peine. Tout le monde y gagne, surtout la petite.', moneyChange: 10, statChanges: { mental: 4 } },
      ]},
      { text: 'Aider à remballer et viser les invendus', risk: 'safe', emoji: '📦', outcomes: [
        { probability: 0.7, text: 'Deux heures de tables pliées et de guirlandes enroulées. Le comité des fêtes paie en nature : crêpes froides, barbe à papa fossilisée et la cafetière non réclamée. Le contrat du siècle.', statChanges: { hunger: 12, mental: 5 }, itemGain: { id: 'cafetiere-tombola', name: 'Cafetière de tombola', emoji: '☕', type: 'junk', value: 7 } },
        { probability: 0.3, text: 'On vous remercie avec une poignée de tickets de tombola... de l\'année prochaine. De l\'espoir à échéance douze mois. Le comité des fêtes invente le produit financier.', statChanges: { mental: 2 } },
      ]},
    ],
  },
  {
    id: 'steal-recup-chantier-bois', title: 'Les Palettes Consignées', type: 'narrative',
    image: '/assets/steal-recup-chantier-bois.webp',
    description: 'Derrière l\'entrepôt, une pile de palettes Europe : les bleues, les consignées, celles qui valent une vraie pièce chacune. Le mur est bas. Le chien, en revanche, est théorique : le panneau « chien méchant » est rouillé.',
    choices: [
      { text: 'Passer le mur pour les palettes bleues', risk: 'risky', emoji: '🪵', outcomes: [
        { probability: 0.45, text: 'Quatre palettes bleues basculées par-dessus le mur, récupérées, empilées, revendues au consignataire qui ne demande jamais l\'arbre généalogique du bois. Un salaire de déménageur, sans les horaires.', moneyChange: 10, statChanges: { health: -4, dignity: -3 } },
        { probability: 0.3, text: 'Le chien n\'était pas théorique. Le panneau était rouillé, pas le chien. Vous repassez le mur en un temps homologable aux Jeux, une palette de moins et un fond de pantalon aussi.', statChanges: { health: -7, mental: -5, dignity: -5 } },
        { probability: 0.25, text: 'Le magasinier vous surprend à cheval sur le mur... et vous propose un marché : vous l\'aidez à charger le camion de 14h, il « perd » deux palettes bleues à votre profit. Le travail au noir du travail au noir.', moneyChange: 6, statChanges: { health: -3, mental: 3 } },
      ]},
      { text: 'Prendre les palettes cassées du trottoir', risk: 'safe', emoji: '🔨', outcomes: [
        { probability: 1, text: 'Les palettes mortes du trottoir sont à qui les veut : du bois sec pour surélever le carton et passer l\'hiver hors des flaques. L\'immobilier de la rue se joue à dix centimètres du sol.', statChanges: { sleep: 5, mental: 4 } },
      ]},
    ],
  },
  {
    id: 'steal-buvette-stade', title: 'La Buvette du Stade', type: 'narrative',
    image: '/assets/steal-buvette-stade.webp',
    description: 'Mi-temps au stade municipal : la buvette est prise d\'assaut, le bénévole est seul, et la caisse est une boîte à chaussures. Le chaos organisé, sauf que personne n\'organise.',
    choices: [
      { text: 'Profiter du chaos de la mi-temps', risk: 'risky', emoji: '🌭', outcomes: [
        { probability: 0.45, text: 'Dans la cohue, deux hot-dogs et un café quittent le comptoir sans transaction. Le bénévole sert quarante personnes à la fois : la comptabilité de la mi-temps est une science approximative.', statChanges: { hunger: 20, thirst: 8, mental: -2, dignity: -4 } },
        { probability: 0.3, text: 'Le bénévole vous alpague... pour vous embaucher : « toi ! Tu sers les cafés, je gère la caisse ! » Quinze minutes de rush, un tablier, et un salaire en sandwichs plus le respect de la tribune B.', statChanges: { hunger: 16, thirst: 6, mental: 8 }, respectChange: 2 },
        { probability: 0.25, text: 'La boîte à chaussures-caisse se renverse dans la bousculade. Tout le monde vous regarde ramasser les pièces. VOUS. Vous rendez tout, compté deux fois, sous surveillance. L\'innocence est un métier épuisant.', statChanges: { mental: -4, dignity: -3 } },
      ]},
      { text: 'Ramasser les consignes de gobelets', risk: 'safe', emoji: '🥤', outcomes: [
        { probability: 1, text: 'Les supporters abandonnent leurs gobelets consignés à un euro pièce. Vous en récoltez une pyramide à la 90e minute. Le vrai score du match, c\'est vous.', moneyChange: 6, statChanges: { dignity: -2 } },
      ]},
    ],
  },
];
