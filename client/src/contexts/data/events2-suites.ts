// ============================================================================
// SUITES NARRATIVES, VAGUE 2 (10 fils conducteurs)
// ----------------------------------------------------------------------------
// Des événements de la vague 2 posent un drapeau (addFlag) ; ces suites le
// consomment (removeFlag) quelques jours plus tard, en bien ou en mal :
// conducteurs POSITIFS (le chaton, la grille chaude, la prophétie, la
// revanche aux échecs, le videur, la bibliothécaire) et NÉGATIFS (le Père
// Noël rancunier, le bonnet otage, la contractuelle, le colis de Lucie).
// Fusionné dans FOLLOW_UP_EVENTS (voir events.ts).
// ============================================================================
import type { GameEvent } from '../types';

export const FOLLOW_UP_EVENTS_2: Record<string, GameEvent> = {
  'suite-chaton-boulangere': {
    id: 'suite-chaton-boulangere', title: 'Le Chat de la Boulangère', type: 'social',
    image: '/assets/followup-chaton-boulangere.webp',
    isFollowUp: true, requiresFlag: 'chaton-boulangere',
    description: 'Dans la vitrine de la boulangerie, entre les éclairs et les chouquettes, trône VOTRE chaton pirate, devenu gros comme une brioche. Il vous reconnaît. Il détourne le regard, en chat.',
    choices: [
      { text: 'Entrer saluer le traître', risk: 'safe', emoji: '🐈', outcomes: [
        { probability: 0.7, text: '« C\'est vous, son sauveteur ?! » La boulangère refuse que vous repartiez les mains vides : sacs de viennoiseries, café, et visite officielle au chat, qui consent à un ronron diplomatique.', statChanges: { hunger: 20, thirst: 8, mental: 12 }, respectChange: 2, removeFlag: 'chaton-boulangere' },
        { probability: 0.3, text: 'Le chat fait mine de ne pas vous connaître, puis vous suit dans la rue sur cent mètres, l\'air de rien, avant de rentrer. Les adieux des chats sont des contrats compliqués. La boulangère vous glisse un pain au chocolat de messager.', statChanges: { hunger: 10, mental: 10 }, removeFlag: 'chaton-boulangere' },
      ]},
      { text: 'Regarder la vitrine sans entrer', risk: 'safe', emoji: '🪟', outcomes: [
        { probability: 1, text: 'Il dort sur les baguettes, en sécurité, au chaud. C\'est exactement ce que vous vouliez pour lui. Certaines victoires se regardent à travers une vitre.', statChanges: { mental: 8 }, removeFlag: 'chaton-boulangere' },
      ]},
    ],
  },
  'suite-grille-egoutier': {
    id: 'suite-grille-egoutier', title: 'La Grille de l\'Égoutier', type: 'discovery',
    image: '/assets/followup-grille-egoutier.webp',
    isFollowUp: true, requiresFlag: 'grille-egoutier',
    description: 'Vous retrouvez la grille d\'aération que l\'égoutier vous avait indiquée. Il n\'avait pas menti : un souffle tiède, régulier, et des rats effectivement polis qui laissent la place.',
    choices: [
      { text: 'S\'installer pour la nuit', risk: 'safe', emoji: '♨️', outcomes: [
        { probability: 0.7, text: 'La meilleure nuit d\'hiver de votre carrière de dormeur urbain. Le souffle du sous-sol vous tient chaud jusqu\'à l\'aube. Quelque part en dessous, l\'égoutier philosophe veille sur son royaume.', statChanges: { sleep: 22, health: 4, mental: 8 }, removeFlag: 'grille-egoutier' },
        { probability: 0.3, text: 'L\'égoutier remonte à 6h par la bouche voisine et vous trouve installé : « ah, t\'as testé l\'adresse ! » Il partage le café du thermos et vous confie une deuxième grille « pour les grands froids ». Un réseau immobilier souterrain.', statChanges: { sleep: 16, thirst: 8, mental: 8 }, respectChange: 1, removeFlag: 'grille-egoutier' },
      ]},
      { text: 'Garder l\'adresse pour une nuit de gel', risk: 'safe', emoji: '🧠', outcomes: [
        { probability: 1, text: 'Vous mémorisez l\'endroit et repartez. Savoir qu\'elle existe réchauffe déjà : c\'est ça, un patrimoine.', statChanges: { mental: 6, sleep: 4 }, removeFlag: 'grille-egoutier' },
      ]},
    ],
  },
  'suite-prophetie-toit': {
    id: 'suite-prophetie-toit', title: 'Le Retour de Madame Esperanza', type: 'social',
    image: '/assets/followup-prophetie-toit.webp',
    isFollowUp: true, requiresFlag: 'prophetie-toit',
    description: 'La caravane mauve est revenue se garer sur le terrain vague. Madame Esperanza vous fait signe avant même que vous approchiez : « je vous attendais. Les cartes ont bougé. »',
    choices: [
      { text: 'Écouter la suite de la prophétie', risk: 'safe', emoji: '🔮', outcomes: [
        { probability: 0.6, text: '« Le toit se rapproche. Je vois... du carton, mais noble. Un carton de roi. » Elle vous offre le thé et une bougie « pour tenir jusqu\'au toit ». Vous y croyez à 30 %, mais ces 30 % tiennent chaud.', statChanges: { mental: 12, thirst: 8 }, itemGain: { id: 'bougie-esperanza', name: 'Bougie d\'Esperanza', emoji: '🕯️', type: 'junk', value: 4, effect: { mental: 6 } }, removeFlag: 'prophetie-toit' },
        { probability: 0.4, text: 'Elle retourne trois cartes, fronce les sourcils, en retourne une quatrième : « disons que le toit prend un itinéraire bis. » Elle vous rembourse une consultation que vous n\'avez jamais payée. La logique mystique a ses largesses.', moneyChange: 3, statChanges: { mental: 6 }, removeFlag: 'prophetie-toit' },
      ]},
      { text: 'Demander plutôt un numéro de loto', risk: 'normal', emoji: '🎰', outcomes: [
        { probability: 0.5, text: '« Le 12. Mais uniquement mercredi. Et uniquement si vous partagez. » Vous jouez le 12 avec la pièce d\'un passant mis dans la confidence : trois euros de gain, partagés religieusement. La prophétie était modeste mais exacte.', moneyChange: 2, statChanges: { mental: 8 }, removeFlag: 'prophetie-toit' },
        { probability: 0.5, text: '« Les cartes ne font pas les impôts, jeune homme. » Vexée, elle referme le rideau. Vous avez brisé le protocole mystique. Le toit attendra.', statChanges: { mental: -3 }, removeFlag: 'prophetie-toit' },
      ]},
    ],
  },
  'suite-rival-echecs': {
    id: 'suite-rival-echecs', title: 'La Revanche', type: 'social',
    image: '/assets/followup-rival-echecs.webp',
    isFollowUp: true, requiresFlag: 'rival-echecs',
    description: 'Le vieux joueur d\'échecs vous attend au parc, pendule sortie, thermos plein, regard d\'acier : « la revanche. J\'ai préparé une ouverture toute la semaine. » Il y a des spectateurs. Il a prévenu des gens.',
    choices: [
      { text: 'Jouer la revanche devant le public', risk: 'normal', emoji: '♟️', outcomes: [
        { probability: 0.5, text: 'Il gagne au 34e coup, se lève et vous serre la main devant tout le monde : « voilà un adversaire. » Le public applaudit les DEUX joueurs. Il vous nomme officiellement « la revanche du jeudi ». Vous avez un rendez-vous hebdomadaire, des madeleines à vie et un titre.', statChanges: { mental: 14, dignity: 6, hunger: 6 }, respectChange: 3, removeFlag: 'rival-echecs' },
        { probability: 0.5, text: 'Vous gagnez ENCORE, sur une gaffe de sa dame. Long silence. Puis il rit, pour la première fois depuis des années dit un spectateur ému. Il vous offre sa pendule : « je ne peux plus jouer contre la montre, elle est de votre côté. »', statChanges: { mental: 16, dignity: 8 }, respectChange: 3, itemGain: { id: 'pendule-echecs', name: 'Pendule d\'échecs du rival', emoji: '⏱️', type: 'junk', value: 10, effect: { mental: 8 } }, removeFlag: 'rival-echecs' },
      ]},
      { text: 'Déclarer forfait avec panache', risk: 'safe', emoji: '🎩', outcomes: [
        { probability: 1, text: '« On ne rejoue pas un miracle. » Le vieux apprécie la formule, le public aussi. Match nul diplomatique, madeleines partagées, honneurs saufs des deux côtés de l\'échiquier.', statChanges: { mental: 8, hunger: 6 }, respectChange: 1, removeFlag: 'rival-echecs' },
      ]},
    ],
  },
  'suite-pote-videur': {
    id: 'suite-pote-videur', title: 'Le Plan du Videur', type: 'social',
    image: '/assets/followup-pote-videur.webp',
    isFollowUp: true, requiresFlag: 'pote-videur',
    description: 'Le videur vous intercepte d\'un signe de menton : « samedi, mon collègue du vestiaire est aux prud\'hommes contre sa belle-sœur, longue histoire. J\'ai dit au patron que je connaissais quelqu\'un de fiable. C\'est toi, le quelqu\'un. »',
    choices: [
      { text: 'Assurer le vestiaire samedi soir', risk: 'normal', emoji: '🧥', outcomes: [
        { probability: 0.7, text: 'Deux cents manteaux numérotés sans une erreur, des pourboires de gens qui veulent impressionner leur rencard, et le patron qui note votre nom « pour les galas ». Le videur rayonne : son poulain a gagné.', moneyChange: 14, statChanges: { mental: 10, dignity: 8, sleep: -5 }, respectChange: 3, removeFlag: 'pote-videur' },
        { probability: 0.3, text: 'Vous inversez les tickets 12 et 21 : une influenceuse repart avec la doudoune d\'un notaire. La crise diplomatique dure vingt minutes, le videur éteint l\'incendie en riant. Payé quand même, « pour le divertissement ».', moneyChange: 7, statChanges: { mental: 4, dignity: -3, sleep: -5 }, removeFlag: 'pote-videur' },
      ]},
      { text: 'Refuser : trop de monde, trop de manteaux', risk: 'safe', emoji: '🙅', outcomes: [
        { probability: 1, text: 'Le videur hoche la tête sans juger : « je garde le tuyau pour une autre fois. » Il vous paie un kebab de consolation. L\'amitié survit aux refus, c\'est même à ça qu\'on la reconnaît.', statChanges: { hunger: 18, mental: 5 }, removeFlag: 'pote-videur' },
      ]},
    ],
  },
  'suite-carte-biblio': {
    id: 'suite-carte-biblio', title: 'Le Club de Lecture', type: 'social',
    image: '/assets/followup-carte-biblio.webp',
    isFollowUp: true, requiresFlag: 'carte-biblio',
    description: 'La bibliothécaire du bibliobus vous repère de loin et brandit un livre : « je vous l\'ai mis de côté ! Et jeudi, c\'est le club de lecture. Il y a du café et personne n\'ose jamais parler. Vous, vous oseriez. »',
    choices: [
      { text: 'Venir au club de lecture', risk: 'safe', emoji: '📖', outcomes: [
        { probability: 0.7, text: 'Sept retraitées, un thermos, un roman norvégien. Votre lecture du personnage principal (« il dort dehors par choix, ça n\'existe pas, madame ») retourne le club. On vous réinvite À VIE. Avec cake.', statChanges: { mental: 14, hunger: 10, thirst: 8, dignity: 6 }, respectChange: 2, removeFlag: 'carte-biblio' },
        { probability: 0.3, text: 'Vous n\'avez pas fini le livre (il vous a servi d\'oreiller au chapitre 9). Vous improvisez brillamment sur la couverture. Deux membres du club font pareil depuis 2015, ça se voit dans leurs yeux. Pacte silencieux, café à volonté.', statChanges: { mental: 10, thirst: 8 }, removeFlag: 'carte-biblio' },
      ]},
      { text: 'Prendre juste le livre mis de côté', risk: 'safe', emoji: '🎁', outcomes: [
        { probability: 1, text: 'Un roman d\'aventure avec TOUTES ses pages, réservé à VOTRE nom sur un post-it. Ce post-it vaut tous les courriers officiels du monde.', statChanges: { mental: 12 }, itemGain: { id: 'roman-reserve', name: 'Roman réservé à votre nom', emoji: '📕', type: 'junk', value: 3, effect: { mental: 8 } }, removeFlag: 'carte-biblio' },
      ]},
    ],
  },
  'suite-ennemi-pere-noel': {
    id: 'suite-ennemi-pere-noel', title: 'La Vendetta du Père Noël', type: 'narrative',
    image: '/assets/followup-ennemi-pere-noel.webp',
    isFollowUp: true, requiresFlag: 'ennemi-pere-noel',
    description: 'Le Père Noël du marché vous a retrouvé. Il a fait le tour des commerçants en racontant que vous « voliez la magie de Noël ». Trois boutiques vous regardent de travers. Il est là, bras croisés, la hotte pleine de rancune.',
    choices: [
      { text: 'Crever l\'abcès devant les commerçants', risk: 'risky', emoji: '🎅', outcomes: [
        { probability: 0.5, text: '« Un Père Noël qui chasse un pauvre en décembre, ça se met en scène ? » La formule fait mouche : les commerçants se marrent, le Père Noël bat en retraite dans un tintement de grelots vexés. La boulangère vous offre un chocolat chaud de dédommagement.', statChanges: { mental: 8, dignity: 6, thirst: 8 }, respectChange: 2, removeFlag: 'ennemi-pere-noel' },
        { probability: 0.5, text: 'Il a le sens du théâtre et trente ans de métier : il pleure. UN PÈRE NOËL QUI PLEURE. Devant des enfants. Vous êtes officiellement le méchant du quartier jusqu\'en janvier. Le kebabier, seul dissident, vous sert quand même.', statChanges: { mental: -6, dignity: -5, hunger: 8 }, respectChange: -2, removeFlag: 'ennemi-pere-noel' },
      ]},
      { text: 'Faire la paix avec un café', risk: 'normal', emoji: '☕', outcomes: [
        { probability: 0.7, text: 'Sous la barbe, un ancien de la rue, lui aussi. Deux cafés plus tard, l\'armistice est signé : le parvis pour lui, la sortie du marché pour vous, et « joyeux Noël, collègue ». Les guerres de territoire finissent parfois en géographie.', statChanges: { mental: 8, thirst: 6 }, respectChange: 1, removeFlag: 'ennemi-pere-noel' },
        { probability: 0.3, text: 'Il accepte le café, le boit, et maintient la vendetta : « c\'est pas personnel, c\'est commercial. » Un Père Noël avec un business plan. Vous cédez le marché de Noël, il vous concède un hochement de tête annuel.', statChanges: { mental: -3 }, removeFlag: 'ennemi-pere-noel' },
      ]},
    ],
  },
  'suite-bonnet-otage': {
    id: 'suite-bonnet-otage', title: 'Le Bonnet Otage', type: 'social',
    image: '/assets/followup-bonnet-otage.webp',
    isFollowUp: true, requiresFlag: 'bonnet-otage',
    description: 'Le vendeur de hot-dogs a puni votre larcin en épinglant votre bonnet EN HAUT DE SON PARASOL, comme un trophée de guerre. Il vous voit arriver et tapote le manche : « on négocie, ou tu hivernes tête nue ? »',
    choices: [
      { text: 'Payer sa dette en plonge', risk: 'safe', emoji: '🧽', outcomes: [
        { probability: 0.7, text: 'Une heure à récurer la plancha en échange du bonnet, descendu avec les honneurs militaires. Il ajoute un hot-dog « de fin de peine » et une poignée de main : « t\'as payé, on est quittes. La prochaine fois, demande. »', statChanges: { hunger: 18, mental: 6, dignity: 4 }, respectChange: 2, removeFlag: 'bonnet-otage' },
        { probability: 0.3, text: 'Pendant votre plonge, un client demande « c\'est quoi le bonnet là-haut ? ». Le vendeur raconte TOUTE l\'histoire, avec des effets de manche. Vous êtes désormais une légende locale mineure : « le gars du bonnet ». Le bonnet, lui, est rendu.', statChanges: { hunger: 10, mental: 4, dignity: -3 }, respectChange: 1, removeFlag: 'bonnet-otage' },
      ]},
      { text: 'Tenter la récupération nocturne', risk: 'risky', emoji: '🌙', outcomes: [
        { probability: 0.5, text: 'Escalade du parasol à 3h du matin, extraction chirurgicale du bonnet, disparition dans la nuit. Le lendemain, le vendeur affiche : « respect. Hot-dog offert au ninja. » Vous venez manger votre trophée de guerre.', statChanges: { mental: 8, hunger: 15 }, respectChange: 1, removeFlag: 'bonnet-otage' },
        { probability: 0.5, text: 'Le parasol s\'effondre sur le stand avec vous accroché dessus. Le vendeur, réveillé par le vacarme depuis sa camionnette, contemple le désastre : vous l\'aiderez à TOUT remonter, et le bonnet reste otage une semaine de plus, avec des ketchup de guerre dessus.', statChanges: { health: -5, mental: -5, dignity: -6 }, removeFlag: 'bonnet-otage' },
      ]},
    ],
  },
  'suite-contractuelle': {
    id: 'suite-contractuelle', title: 'L\'Œil de la Contractuelle', type: 'narrative',
    image: '/assets/followup-contractuelle.webp',
    isFollowUp: true, requiresFlag: 'reperee-contractuelle',
    description: 'La contractuelle qui a confisqué votre commerce d\'horodateur vous a mis « dans son périmètre ». Elle apparaît partout où vous posez le chapeau, carnet en main, comme une ombre assermentée. Les passants n\'osent plus donner.',
    choices: [
      { text: 'Négocier un armistice administratif', risk: 'normal', emoji: '🤝', outcomes: [
        { probability: 0.6, text: 'Vous plaidez votre cause entre deux pare-brises : « je vends plus rien, je tends juste la main. » Elle range le carnet : « la main, c\'est légal. L\'horodateur, non. » Armistice signé d\'un hochement. Elle met même une pièce, « à titre privé ».', moneyChange: 2, statChanges: { mental: 8 }, respectChange: 1, removeFlag: 'reperee-contractuelle' },
        { probability: 0.4, text: 'Elle écoute, impassible, et vous verbalise... un avertissement pédagogique fictif sur papier libre. C\'est illisible et sans valeur, mais elle y a mis du cœur. Vous êtes quitte, sous surveillance allégée.', statChanges: { mental: 2, dignity: -2 }, removeFlag: 'reperee-contractuelle' },
      ]},
      { text: 'Migrer de quartier le temps que ça passe', risk: 'safe', emoji: '🚶', outcomes: [
        { probability: 1, text: 'Trois rues plus loin, hors de son secteur, la vie reprend. Vous croisez sa collègue du secteur 7, qui ne vous connaît pas. La bureaucratie a des frontières, et c\'est parfois une bénédiction.', statChanges: { mental: 5 }, removeFlag: 'reperee-contractuelle' },
      ]},
    ],
  },
  'suite-colis-lucie': {
    id: 'suite-colis-lucie', title: 'Le Mot de Lucie', type: 'narrative',
    image: '/assets/followup-colis-lucie.webp',
    isFollowUp: true, requiresFlag: 'colis-lucie',
    description: 'Sur la porte du hall, un mot manuscrit : « À la personne qui a pris mon colis : j\'espère que le plaid vous tient chaud. Sérieusement. Il fait froid. Lucie (3B). PS : les coussins, par contre, j\'y tenais. »',
    choices: [
      { text: 'Rendre les coussins avec un mot d\'excuse', risk: 'safe', emoji: '📝', outcomes: [
        { probability: 0.7, text: 'Vous déposez les coussins et trois lignes d\'excuses devant le 3B. Le lendemain, une boîte vous attend au même endroit : des gants, un thermos, et « le plaid est à vous. Officiellement. Lucie. » Vous dormez chaud et léger : les deux en même temps, c\'est rare.', statChanges: { mental: 14, dignity: 10, sleep: 4 }, respectChange: 2, removeFlag: 'colis-lucie' },
        { probability: 0.3, text: 'Lucie ouvre pendant le dépôt. Silence dense. Puis : « au moins vous rendez. Café ? » Vingt minutes de conversation dans l\'embrasure, les coussins entre vous comme des otages libérés. Elle garde le mot d\'excuse « pour la postérité ».', statChanges: { mental: 10, thirst: 6, dignity: 6 }, removeFlag: 'colis-lucie' },
      ]},
      { text: 'Garder le butin et changer de hall', risk: 'normal', emoji: '🌫️', outcomes: [
        { probability: 1, text: 'Vous emportez plaid et coussins vers un autre quartier. Le confort reste, le mot de Lucie aussi, quelque part entre les côtes. « Sérieusement. Il fait froid. » Elle avait raison sur toute la ligne, et c\'est bien le problème.', statChanges: { sleep: 6, mental: -8, dignity: -6 }, removeFlag: 'colis-lucie' },
      ]},
    ],
  },
};
