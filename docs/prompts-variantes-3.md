# 🎨 Manus — Images VAGUE 3 à générer (Le Roi du Carton)

## ⚠️ À LIRE EN PREMIER — ce qui n'a pas marché

Les derniers envois contenaient les variantes **exploration (`result-exp-*`)** et
**repos (`result-rest-*`)** : elles sont **déjà dans le jeu depuis début juillet**.
Les régénérer ne sert à rien.

**Aucune** des images ci-dessous n'existe encore. Ce sont celles-là, et
**seulement celles-là**, qu'il faut générer : **voyage, mendicité, suites,
légendes, vol, + 7 rencontres de suite.**

Avant de livrer, vérifie dans ton projet :
```
ls client/public/assets | grep -E "result-travel-|followup-"
```
- Si c'est **vide** → tu n'as pas encore généré la vague 3 (c'est normal, fais-la).
- Le zip que tu m'envoies **doit** contenir des fichiers commençant par
  `result-travel-`, `followup-`, `result-legend-`. S'il n'en a aucun, c'est le
  mauvais dossier.

## Convention (identique aux images déjà livrées)

- **DA habituelle** : diorama carton kraft, personnage SDF découpé (barbe,
  manteau rapiécé), visage feutre, guirlande lumineuse, lumière chaude, humour noir.
- **Format paysage 3:2**, export **vrai `.webp`** (pas un PNG renommé — sinon je
  le ré-encode, mais autant éviter).
- **Noms de fichiers EXACTS** (le code cherche `result-<id>-good.webp` /
  `result-<id>-bad.webp`). Une faute de nom = image ignorée.
- Livrable **par lots** : chaque image s'active dès qu'elle arrive ; en
  attendant, le jeu affiche la scène de base. Rien ne casse.

---

## Manquant isolé (1)
| Fichier | Scène |
|---|---|
| `result-rest-parking-souterrain-good.webp` | ✅ Nuit tranquille dans un parking souterrain en carton, béton sec, le SDF dort adossé à un pilier. |

## A. Voyage (26 images)

| Fichier | Scène (issue) |
|---|---|
| `result-travel-ruelle-sombre-good.webp` | ✅ Raccourci efficace ! Vous trouvez même 3€ par terre. |
| `result-travel-ruelle-sombre-bad.webp` | ❌ Cul-de-sac. Demi-tour obligatoire. |
| `result-travel-tunnel-metro-good.webp` | ✅ Vous trouvez un ancien campement avec des conserves. |
| `result-travel-tunnel-metro-bad.webp` | ❌ Vous traversez sans encombre. Frissons mais efficace. |
| `result-travel-parc-nuit-good.webp` | ✅ Traversée sans encombre. Les étoiles guident vos pas. |
| `result-travel-parc-nuit-bad.webp` | ❌ Vous trébuchez sur une racine. Genou en sang. |
| `result-travel-pont-autoroute-good.webp` | ✅ Le vent est violent mais vous tenez bon. Vue impressionnante. |
| `result-travel-pont-autoroute-bad.webp` | ❌ Le vent emporte votre chapeau (si vous en avez un). Adieu. |
| `result-travel-marche-matin-good.webp` | ✅ Un maraîcher vous paie 4€ et vous donne des fruits abîmés. |
| `result-travel-marche-matin-bad.webp` | ❌ Un commerçant vous crie dessus. "Touche pas à ma marchandise !" |
| `result-travel-gare-routiere-good.webp` | ✅ Vous vous faufilez ! Trajet gratuit et chauffé. |
| `result-travel-gare-routiere-bad.webp` | ❌ Le chauffeur vous repère. "Descends ou j'appelle les flics." |
| `result-travel-velo-trouve-good.webp` | ✅ Vous pédalez à toute vitesse ! Trajet rapide et grisant. |
| `result-travel-velo-trouve-bad.webp` | ❌ Le propriétaire vous court après. "Mon vélo !" Vous le rendez, essoufflé. |
| `result-travel-chantier-nuit-good.webp` | ✅ Raccourci efficace. Vous trouvez un casque de chantier. |
| `result-travel-chantier-nuit-bad.webp` | ❌ Vous vous prenez les pieds dans un câble. Chute. |
| `result-travel-riviere-good.webp` | ✅ L'eau est peu profonde ! Vous traversez les pieds mouillés mais rapidement. |
| `result-travel-riviere-bad.webp` | ❌ Plus profond que prévu ! Vous êtes trempé jusqu'à la taille. |
| `result-travel-tramway-good.webp` | ✅ Trajet tranquille. Personne ne contrôle. |
| `result-travel-tramway-bad.webp` | ❌ Contrôle ! "Votre titre de transport ?" Amende de 5€. |
| `result-travel-skateboard-good.webp` | ✅ Vous roulez ! C'est plus rapide que marcher. Et plutôt fun. |
| `result-travel-skateboard-bad.webp` | ❌ Vous tombez après 50 mètres. Vos genoux s'en souviennent. |
| `result-travel-egout-good.webp` | ✅ Vous trouvez un passage secret vers une cave de restaurant ! |
| `result-travel-egout-bad.webp` | ❌ Vous traversez rapidement. L'odeur est atroce mais c'est efficace. |
| `result-travel-bus-nuit-good.webp` | ✅ Le chauffeur ne dit rien. Vous faites l'aller-retour au chaud. |
| `result-travel-bus-nuit-bad.webp` | ❌ "Pas de ticket, pas de bus." Strict mais juste. |

## B. Mendicité (43 images)

| Fichier | Scène (issue) |
|---|---|
| `result-beg-couple-riche-good.webp` | ✅ La femme vous donne 5€. "Prenez soin de vous." Sincère. |
| `result-beg-couple-riche-bad.webp` | ❌ Ils passent sans vous regarder. Vous êtes invisible. |
| `result-beg-boulangerie-good.webp` | ✅ La boulangère vous donne deux baguettes et un pain au chocolat ! "Ça partira à la poubelle sinon." |
| `result-beg-boulangerie-bad.webp` | ❌ "Désolée, on a tout vendu aujourd'hui." Votre estomac pleure. |
| `result-beg-terrasse-cafe-good.webp` | ✅ Un client laisse un demi-café et un croissant entamé. Petit déjeuner ! |
| `result-beg-terrasse-cafe-bad.webp` | ❌ Le serveur vous chasse. "C'est réservé aux clients." |
| `result-beg-ecole-sortie-good.webp` | ✅ Une maman vous donne 2€ et un goûter. "Tenez, pour vous." |
| `result-beg-ecole-sortie-bad.webp` | ❌ Les parents vous évitent. Certains changent de trottoir. |
| `result-beg-supermarche-good.webp` | ✅ Une dame vous achète un sandwich et une bouteille d'eau. Merci. |
| `result-beg-supermarche-bad.webp` | ❌ En 1h, vous récoltez 6€. Pas mal ! |
| `result-beg-musicien-metro-good.webp` | ✅ "Le secret c'est le répertoire ! Tiens, chante avec moi." Duo improvisé, 3€ partagés. |
| `result-beg-musicien-metro-bad.webp` | ❌ "Dégage de mon spot." Territorial, le musicien. |
| `result-beg-touriste-asiatique-good.webp` | ✅ Ils sont ravis ! Selfies, photos de groupe. 5€ de pourboire et des bonbons japonais. |
| `result-beg-touriste-asiatique-bad.webp` | ❌ Ils vous prennent en photo VOUS. "Very authentic!" Gênant mais 2€. |
| `result-beg-mariage-sortie-good.webp` | ✅ Les mariés vous invitent à prendre une part de gâteau ! Champagne inclus. |
| `result-beg-mariage-sortie-bad.webp` | ❌ Le père de la mariée vous éloigne. "C'est privé." |
| `result-beg-jogger-parc-good.webp` | ✅ Il est coach sportif. "Tu veux que je te montre des exercices ?" Séance gratuite et 3€. |
| `result-beg-jogger-parc-bad.webp` | ❌ Il remet ses écouteurs et repart. Message reçu. |
| `result-beg-restaurant-poubelle-good.webp` | ✅ Des restes de foie gras, du pain frais, un fond de sauce. Festin 5 étoiles ! |
| `result-beg-restaurant-poubelle-bad.webp` | ❌ Le chef sort fumer. "Hé ! Dégage de mes poubelles !" Vous filez. |
| `result-beg-cinema-good.webp` | ✅ Les gens sont de bonne humeur après le film. 4€ récoltés. |
| `result-beg-cinema-bad.webp` | ❌ Tout le monde est sur son téléphone. Personne ne vous voit. |
| `result-beg-eglise-dimanche-good.webp` | ✅ La charité chrétienne fonctionne ! 6€ et un sandwich. |
| `result-beg-mairie-good.webp` | ✅ L'agent d'accueil est compréhensif. Il vous donne une liste de foyers et d'aides. Précieux. |
| `result-beg-mairie-bad.webp` | ❌ "Prenez un numéro." Après 2h d'attente, le guichet ferme. |
| `result-beg-gare-tgv-good.webp` | ✅ Une dame âgée accepte ! 5€ et un merci sincère. |
| `result-beg-gare-tgv-bad.webp` | ❌ "Non merci." Refus poli mais ferme. |
| `result-beg-distributeur-billets-good.webp` | ✅ Quelqu'un oublie sa monnaie ! 3€ dans le bac. |
| `result-beg-distributeur-billets-bad.webp` | ❌ Rien ne se passe. Vous avez l'air suspect. |
| `result-beg-fleuriste-good.webp` | ✅ "Prenez, elles vont à la poubelle." Vous avez un bouquet ! Revendable. |
| `result-beg-fleuriste-bad.webp` | ❌ "Non, elles sont pour le compost." Écolo strict. |
| `result-beg-station-metro-good.webp` | ✅ Un passant vous donne un sandwich. Mieux que de l'argent. |
| `result-beg-station-metro-bad.webp` | ❌ Votre panneau "J'ai faim" touche les coeurs. 5€ en 1h. |
| `result-beg-parc-chien-good.webp` | ✅ Une dame vous confie son caniche 30 min. 4€ et des léchouilles. |
| `result-beg-parc-chien-bad.webp` | ❌ "Mon chien ne va pas avec les inconnus." Refus. |
| `result-beg-lavage-voiture-good.webp` | ✅ Un homme accepte ! 1h de travail, 8€. Honnête. |
| `result-beg-lavage-voiture-bad.webp` | ❌ "J'ai la machine pour ça." Logique. |
| `result-beg-taxi-arret-good.webp` | ✅ Un chauffeur vous offre son sandwich. "J'ai plus faim, prends." |
| `result-beg-taxi-arret-bad.webp` | ❌ "Dégage, tu fais fuir les clients." |
| `result-beg-concert-sortie-good.webp` | ✅ Les gens sont de bonne humeur ! 7€ récoltés facilement. |
| `result-beg-concert-sortie-bad.webp` | ❌ Tout le monde est sur son téléphone à poster des stories. |
| `result-beg-match-foot-good.webp` | ✅ L'équipe locale a gagné ! Les supporters sont généreux. 8€ ! |
| `result-beg-match-foot-bad.webp` | ❌ L'équipe a perdu. Les supporters sont furieux. Mauvais timing. |

## C. Suites d'événements (9 images)

| Fichier | Scène (issue) |
|---|---|
| `result-exp-jardin-communautaire-suite-good.webp` | ✅ Il vous donne un panier de légumes et vous apprend à faire pousser des tomates. "Reviens quand tu veux, petit." |
| `result-exp-vieille-dame-suite-good.webp` | ✅ Elle vous invite chez elle pour un repas chaud. Soupe, pain, fromage, et un lit pour la nuit. Vous pleurez de gratitude. |
| `result-exp-pecheur-suite-good.webp` | ✅ Vous attrapez 3 poissons ! Le pêcheur vous apprend à les cuisiner sur un feu de camp. Festin ! |
| `result-exp-brocante-suite-good.webp` | ✅ Un vieux smartphone qui marche encore ! "Cadeau. T'as été réglo avec moi." |
| `result-exp-musicien-suite-good.webp` | ✅ Votre duo fait sensation ! Les passagers adorent. 12€ partagés et une standing ovation. |
| `result-exp-dechetterie-suite-good.webp` | ✅ Un vélo réparable, des vêtements propres, et un réchaud de camping ! Jackpot ! |
| `result-exp-chat-revient-good.webp` | ✅ Un billet de 5€ ! Le chat l'a trouvé quelque part. Meilleur investissement de votre vie. |
| `result-exp-chat-revient-bad.webp` | ❌ Une souris vivante ! Le chat la lâche sur vos genoux. AAAH ! |
| `result-exp-foyer-accueil-good.webp` | ✅ Douche chaude, repas complet, lit propre. Vous dormez 10h d'affilée. Renaissance. |

## D. Légendes (4 images)

| Fichier | Scène |
|---|---|
| `result-legend-graffiti-good.webp` | ✅ Le SDF grave son nom au feutre sous « Roi du Carton » sur le mur des légendes, solennel, espoir. |
| `result-legend-ancien-good.webp` | ✅ Le vieux SDF sourit et glisse quelques pièces au personnage, transmission, bienveillance. |
| `result-legend-carton-good.webp` | ✅ Le SDF découvre une pièce et un mot « Tiens bon » dans un pli du vieux carton-relique, émotion. |
| `result-legend-pari-good.webp` | ✅ Le SDF repart le menton haut, deux vieux SDF qui pariaient sur lui en fond, détermination. |

## E. Vol « à texte » (12 images)

| Fichier | Scène (issue) |
|---|---|
| `result-steal-etal-marche-good.webp` | ✅ Mission accomplie ! Deux belles pommes dans la poche. Discret comme un chat. |
| `result-steal-etal-marche-bad.webp` | ❌ "HÉ ! Le voleur !" Le primeur vous attrape par le col et vous secoue. |
| `result-steal-poche-costard-good.webp` | ✅ Vos doigts de fée font merveille. 15€ et il ronfle toujours. |
| `result-steal-poche-costard-bad.webp` | ❌ Il se réveille en sursaut ! "Au voleur !" Vous courez, le cœur battant. |
| `result-steal-supermarche-good.webp` | ✅ Vous passez les portiques l'air de rien. Conserves et chocolat : repas assuré. |
| `result-steal-supermarche-bad.webp` | ❌ Le portique sonne. Le vigile se réveille enfin. Fouille humiliante devant tout le monde. |
| `result-steal-velo-good.webp` | ✅ Clic ! L'antivol cède. Revendu à un receleur : 20€. Belle prise. |
| `result-steal-velo-bad.webp` | ❌ Le propriétaire surgit du café d'à côté. La poursuite tourne mal pour vous. |
| `result-steal-tronc-eglise-good.webp` | ✅ Le curé vous offre un repas chaud et 5€ du tronc, de bon cœur. "Reviens quand tu veux." |
| `result-steal-tronc-eglise-bad.webp` | ❌ Vous récupérez 12€ en pièces. Personne, sauf peut-être le Tout-Puissant. |
| `result-steal-etendage-good.webp` | ✅ Un bon manteau de laine, encore tiède du soleil. Vos nuits seront moins rudes. |
| `result-steal-etendage-bad.webp` | ❌ Une grand-mère hurle à la fenêtre : "Au secours, on me vole !" Tout le quartier se réveille. |

## F. Nouvelles suites narratives (18 images : 7 rencontres + 11 variantes)

Sept événements « suite » ont été ajoutés au jeu. Ils n'ont **aucune** image :
d'abord la rencontre (`followup-<nom>.webp`), puis les variantes.

### Rencontres (7 images)
| Fichier | Scène |
|---|---|
| `followup-velo.webp` | Un étudiant en carton lorgne le vélo rafistolé au fil de fer du SDF, billet à la main, l'air très intéressé. |
| `followup-eglise.webp` | Le prêtre accueille le SDF sur le parvis, porte ouverte, vapeur de soupe au fond, lumière chaude. |
| `followup-gardien.webp` | Le gardien de la déchetterie hèle le SDF depuis sa guérite, thermos levé, montagnes de récup en fond. |
| `followup-toit.webp` | Le SDF sur son campement discret de toit, ville en carton illuminée en contrebas, nuit étoilée. |
| `followup-emploi-jardin.webp` | Le vieux jardinier bougon tend une bêche au SDF dans le potager caché, complicité rugueuse. |
| `followup-tomates.webp` | Le petit carré de terre du SDF avec trois tomates rouges éclatantes, lumière de matin, fierté. |
| `followup-magasin.webp` | Le SDF devant la porte arrière entrouverte du magasin abandonné, nuit, hésitation, lampadaire lointain. |

### Variantes réussite/échec (11 images)
| Fichier | Scène (issue) |
|---|---|
| `result-exp-velo-suite-good.webp` | ✅ L'étudiant repart en zigzaguant sur le vélo, le SDF compte ses billets, mi-figue mi-raisin. |
| `result-exp-eglise-suite-good.webp` | ✅ Le SDF attablé devant une soupe fumante, le curé sert, banc au chaud dans l'église. |
| `result-exp-gardien-suite-good.webp` | ✅ Café partagé dans la guérite, le gardien tend une vieille radio, biscuits mous, complicité. |
| `result-exp-toit-suite-good.webp` | ✅ Le SDF endormi comme un roi sous les étoiles sur son toit, ville qui scintille. |
| `result-exp-toit-suite-bad.webp` | ❌ Le SDF dévale l'escalier de service, faisceau de lampe du concierge derrière lui, panique. |
| `result-exp-emploi-jardin-suite-good.webp` | ✅ Le SDF bêche fièrement, repas chaud posé sur une caisse, jardinier approbateur. |
| `result-exp-emploi-jardin-suite-bad.webp` | ❌ Le jardinier renvoie le SDF d'un geste sec, bêche plantée là, mine penaude. |
| `result-exp-mentor-suite-good.webp` | ✅ Le SDF croque une tomate tiède de soleil devant son carré de terre, triomphe simple. |
| `result-exp-mentor-suite-bad.webp` | ❌ Des pigeons repus autour d'une demi-tomate massacrée, le SDF les fusille du regard. |
| `result-exp-magasin-suite-good.webp` | ✅ Le SDF ressort du magasin abandonné chargé d'un carton d'invendus, sourire de contrebandier. |
| `result-exp-magasin-suite-bad.webp` | ❌ Le SDF fuit ventre à terre, gyrophare d'alarme rouge sur la façade, mannequins en silhouette. |

---

## ✅ Checklist avant de livrer

1. Chaque fichier commence par `result-` ou `followup-` **et** finit par `.webp`.
2. Le zip contient bien des `result-travel-…`, `result-beg-…`, `followup-…`
   (s'il n'a que des `result-exp-…` ou `result-rest-…`, **c'est le mauvais lot**).
3. Vraies images WebP paysage 3:2, même DA carton kraft que les précédentes.

**Total : 114 images.** Livrable par petits lots — chacune s'active dès son arrivée.
