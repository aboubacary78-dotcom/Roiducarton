# Pack 1 — Priorité HAUTE : les 58 images manquantes historiques

## 🎬 Message d'amorçage — à coller EN PREMIER dans Gemini (une seule fois par conversation)

> Tu vas générer une série d'illustrations pour mon jeu mobile « Le Roi du Carton ».
> **Style à respecter pour TOUTES les images de cette conversation** :
> diorama miniature en carton kraft fait main, style maquette artisanale ; le héros
> est un SDF en carton découpé (barbe grise, manteau rapiécé, visage dessiné au
> feutre) ; textures carton ondulé et papier kraft bien visibles ; lumière chaude
> d'atelier, petite guirlande lumineuse en fond ; humour noir tendre, jamais glauque.
> **Format paysage 3:2. Aucun texte ni lettre dans l'image.**
> Je vais t'envoyer les scènes une par une : réponds uniquement avec l'image.

💡 **Astuce cohérence** : joins 2-3 images existantes du jeu (n'importe quel .webp
de `client/public/assets/`) à ce premier message comme référence de style.

---

Ensuite, envoie chaque ligne ci-dessous comme un message (la scène, pas le nom de
fichier). **Renomme le fichier téléchargé EXACTEMENT comme indiqué** — une faute
de nom = image ignorée par le jeu. PNG/JPG acceptés : je convertis en .webp.

## A. Les 7 rencontres de suite (followup-*)

- `followup-velo.webp`
  L'Offre pour le Vélo : Un étudiant lorgne votre vélo rafistolé au fil de fer. "Il roule ? Je vous en donne quelque chose !"
- `followup-eglise.webp`
  La Soupe du Curé : Le prêtre vous reconnaît sur le parvis. "Notre ami ! La soupe est chaude, entrez donc."
- `followup-gardien.webp`
  Le Café du Gardien : Le gardien de la déchetterie vous hèle depuis sa guérite. "Pause café ? J'ai un truc à te montrer, aussi."
- `followup-toit.webp`
  Votre Toit : Votre planque sur le toit vous attend. La ville scintille en carton, et personne ne sait que vous êtes là.
- `followup-emploi-jardin.webp`
  Journée au Jardin : "T'es en retard," grogne le vieux jardinier en vous tendant une bêche. Votre « emploi » vous attend.
- `followup-tomates.webp`
  Vos Tomates : Le coin de terre que le vieux vous a appris à cultiver a bien travaillé : des tomates. Des vraies. Les vôtres.
- `followup-magasin.webp`
  La Porte de Derrière : Le magasin abandonné, la porte arrière entrouverte. Vous l'aviez notée « pour plus tard ». Plus tard, c'est maintenant.

## B. Issues des 15 suites narratives (result-*-good/bad, 30 images)

- `result-exp-jardin-communautaire-suite-good.webp`
  Le Retour au Jardin, issue heureuse : Il vous donne un panier de légumes et vous apprend à faire pousser des tomates. "Reviens quand tu veux, petit."
- `result-exp-jardin-communautaire-suite-bad.webp`
  Le Retour au Jardin, issue ratée : Il vous donne des graines. "Plante ça quelque part. Ça te donnera un but."
- `result-exp-vieille-dame-suite-good.webp`
  La Grand-Mère Reconnaissante, issue heureuse : Elle vous invite chez elle pour un repas chaud. Soupe, pain, fromage, et un lit pour la nuit. Vous pleurez de gratitude.
- `result-exp-vieille-dame-suite-bad.webp`
  La Grand-Mère Reconnaissante, issue ratée : Elle vous donne 20€ et l'adresse d'un foyer. "Prenez soin de vous."
- `result-exp-pecheur-suite-good.webp`
  La Partie de Pêche, issue heureuse : Vous attrapez 3 poissons ! Le pêcheur vous apprend à les cuisiner sur un feu de camp. Festin !
- `result-exp-pecheur-suite-bad.webp`
  La Partie de Pêche, issue ratée : Bredouille, mais le pêcheur partage sa prise. "La prochaine fois, tu auras plus de chance."
- `result-exp-brocante-suite-good.webp`
  Le Trésor du Brocanteur, issue heureuse : Un vieux smartphone qui marche encore ! "Cadeau. T'as été réglo avec moi."
- `result-exp-brocante-suite-bad.webp`
  Le Trésor du Brocanteur, issue ratée : Un manteau d'hiver en bon état. "Ça va te tenir chaud."
- `result-exp-musicien-suite-good.webp`
  Le Duo Musical, issue heureuse : Votre duo fait sensation ! Les passagers adorent. 12€ partagés et une standing ovation.
- `result-exp-musicien-suite-bad.webp`
  Le Duo Musical, issue ratée : Journée calme, peu de monde. 4€ quand même. "On se refait ça demain ?"
- `result-exp-dechetterie-suite-good.webp`
  Le Roi de la Récup, issue heureuse : Un vélo réparable, des vêtements propres, et un réchaud de camping ! Jackpot !
- `result-exp-dechetterie-suite-bad.webp`
  Le Roi de la Récup, issue ratée : Des livres, une lampe torche, et un sac à dos. Équipement de survie !
- `result-exp-chat-revient-good.webp`
  Le Retour du Chat, issue heureuse : Un billet de 5€ ! Le chat l'a trouvé quelque part. Meilleur investissement de votre vie.
- `result-exp-chat-revient-bad.webp`
  Le Retour du Chat, issue ratée : Une souris vivante ! Le chat la lâche sur vos genoux. AAAH !
- `result-exp-foyer-accueil-good.webp`
  Le Foyer d'Accueil, issue heureuse : Douche chaude, repas complet, lit propre. Vous dormez 10h d'affilée. Renaissance.
- `result-exp-foyer-accueil-bad.webp`
  Le Foyer d'Accueil, issue ratée : Le foyer est complet. Mais ils vous donnent un sandwich et l'adresse d'un autre foyer.
- `result-exp-velo-suite-good.webp`
  L'Offre pour le Vélo, issue heureuse : Il hausse les épaules et s'en va. Vous caressez le guidon. Vous, au moins, vous vous comprenez.
- `result-exp-velo-suite-bad.webp`
  L'Offre pour le Vélo, issue ratée : Il négocie dur : 5€. Vous cédez. Le fil de fer, ça n'a pas de prix. Enfin si : 5€.
- `result-exp-eglise-suite-good.webp`
  La Soupe du Curé, issue heureuse : Vous servez les autres avant de vous servir. Le curé vous glisse une part double et un clin d'œil.
- `result-exp-eglise-suite-bad.webp`
  La Soupe du Curé, issue ratée : La soupe est claire comme l'eau bénite, mais la compagnie réchauffe.
- `result-exp-gardien-suite-good.webp`
  Le Café du Gardien, issue heureuse : Café brûlant, biscuits mous, et une radio en état de marche « tombée du camion ». Belle matinée.
- `result-exp-gardien-suite-bad.webp`
  Le Café du Gardien, issue ratée : Le café est infect mais l'amitié sincère. Il vous garde une place au chaud pour les jours de pluie.
- `result-exp-toit-suite-good.webp`
  Votre Toit, issue heureuse : Nuit étoilée au-dessus du vacarme. Vous dormez comme un roi, du carton, mais un roi.
- `result-exp-toit-suite-bad.webp`
  Votre Toit, issue ratée : Le concierge fait sa ronde ! Vous dévalez l'escalier de service, le cœur à 200. Planque grillée.
- `result-exp-emploi-jardin-suite-good.webp`
  Journée au Jardin, issue heureuse : Une matinée à biner, un repas chaud, et quelques pièces « pour le dérangement ».
- `result-exp-emploi-jardin-suite-bad.webp`
  Journée au Jardin, issue ratée : "Si c'est comme ça, reviens quand tu seras motivé." Vexant. Juste, mais vexant.
- `result-exp-mentor-suite-good.webp`
  Vos Tomates, issue heureuse : Trois tomates parfaites. Vous en mangez une sur place, tiède de soleil. Vous avez FAIT quelque chose.
- `result-exp-mentor-suite-bad.webp`
  Vos Tomates, issue ratée : Les pigeons sont passés avant vous. Il reste une demi-tomate. La rage.
- `result-exp-magasin-suite-good.webp`
  La Porte de Derrière, issue heureuse : À l'intérieur : des invendus oubliés ! Vous repartez chargé comme un mulet.
- `result-exp-magasin-suite-bad.webp`
  La Porte de Derrière, issue ratée : Une alarme oubliée hurle ! Vous fuyez ventre à terre, poursuivi par le fantôme du commerce de proximité.

## C. Issues des 4 événements « légende » (8 images)

- `result-legend-graffiti-good.webp`
  Le mur des légendes : un graffiti soigné honore un ancien roi de la rue. Issue heureuse : Le SDF grave fièrement son nom sous celui de la légende, moment solennel.
- `result-legend-graffiti-bad.webp`
  Le mur des légendes : un graffiti soigné honore un ancien roi de la rue. Issue ratée : Seul devant le mur immense, le SDF se sent tout petit face à la légende.
- `result-legend-ancien-good.webp`
  Un ancien du quartier, assis sur une caisse, évoque le recordman de la rue. Issue heureuse : Le vieux sourit et glisse des pièces au SDF qui jure de battre le record.
- `result-legend-ancien-bad.webp`
  Un ancien du quartier, assis sur une caisse, évoque le recordman de la rue. Issue ratée : Le vieux hausse les épaules, le SDF repart songeur sous la pluie.
- `result-legend-carton-good.webp`
  Un vieux carton usé, relique d'une légende de la rue, sous un porche comme un lieu de pèlerinage. Issue heureuse : Le SDF trouve une pièce et un mot d'encouragement caché dans le carton-relique.
- `result-legend-carton-bad.webp`
  Un vieux carton usé, relique d'une légende de la rue, sous un porche comme un lieu de pèlerinage. Issue ratée : Le carton est vide mais le SDF repart inspiré, silhouette digne au soleil couchant.
- `result-legend-pari-good.webp`
  Deux SDF parient bruyamment sur l'avenir du héros devant leur campement. Issue heureuse : Ils misent une pièce sur lui, poignées de main et sourires édentés.
- `result-legend-pari-bad.webp`
  Deux SDF parient bruyamment sur l'avenir du héros devant leur campement. Issue ratée : Ils rigolent et s'en vont, le héros reste seul avec l'ombre de la légende.

## D. Issues mendicité restantes (12 images)

- `result-beg-concert-sortie-good.webp`
  La Sortie de Concert, issue heureuse : Votre reprise est applaudie ! 5€ et des rires.
- `result-beg-concert-sortie-bad.webp`
  La Sortie de Concert, issue ratée : Faux comme une casserole. Les gens fuient.
- `result-beg-lavage-voiture-good.webp`
  La Station de Lavage, issue heureuse : Un homme accepte ! 1h de travail, 8€. Honnête.
- `result-beg-lavage-voiture-bad.webp`
  La Station de Lavage, issue ratée : "J'ai la machine pour ça." Logique.
- `result-beg-match-foot-good.webp`
  La Sortie du Match, issue heureuse : Un supporter vous offre une bière. Pas nutritif mais convivial.
- `result-beg-match-foot-bad.webp`
  La Sortie du Match, issue ratée : Un supporter reconnaît SON écharpe. Tension.
- `result-beg-parc-chien-good.webp`
  Le Parc à Chiens, issue heureuse : Les chiens vous adorent ! Moment de bonheur pur. Un propriétaire vous offre un café.
- `result-beg-parc-chien-bad.webp`
  Le Parc à Chiens, issue ratée : Un chien vous mord la main. Pas méchamment, mais quand même.
- `result-beg-taxi-arret-good.webp`
  L'Arrêt de Taxi, issue heureuse : Un chauffeur vous offre son sandwich. "J'ai plus faim, prends."
- `result-beg-taxi-arret-bad.webp`
  L'Arrêt de Taxi, issue ratée : "Dégage, tu fais fuir les clients."
- `result-beg-eglise-dimanche-bad.webp`
  La Messe du Dimanche, issue ratée : "Dieu vous aide, mon fils." Pas d'argent mais une bénédiction.
- `result-beg-restaurant-poubelle-bad.webp`
  Les Poubelles du Restaurant, issue ratée : Le chef sort fumer. "Hé ! Dégage de mes poubelles !" Vous filez.
- `result-rest-parking-souterrain-good.webp`
  Nuit tranquille dans un parking souterrain en carton, béton sec, le SDF dort paisiblement adossé à un pilier.
