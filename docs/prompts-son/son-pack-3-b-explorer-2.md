# Pack son 3.2 — Explorer — seconde moitié (47 bruitages)

*Ce document est le socle. Chaque pack le répète en tête, pour être remis seul
à qui fabrique les sons.*

## L'idée directrice : le son doit être en carton, lui aussi

Tout le jeu est un **diorama miniature en carton kraft** photographié : les
voitures sont en carton, les pigeons sont en carton, la ville entière tient sur
une table d'atelier. **La bande-son doit obéir à la même règle.**

Ce n'est donc **pas** une banque de sons de ville. On ne veut pas
l'enregistrement d'un vrai boulevard, ni une vraie pluie, ni un vrai train.
On veut le **bruitage de cinéma** qu'un bricoleur ferait avec ce qu'il a sur
son établi, micro à vingt centimètres :

| Ce qu'on entend | Comment on le fabrique |
|---|---|
| une voiture qui passe | une main qui glisse sur du carton ondulé |
| la pluie | du riz qu'on verse sur du papier tendu |
| le tonnerre | une grande plaque de carton qu'on secoue |
| un train | une brosse sur du carton ondulé, en accélérant |
| une foule | plusieurs personnes qui froissent du papier journal |
| des pas | des doigts sur une boîte à chaussures |
| le vent | un souffle contre une feuille de papier calque |

C'est cette matière-là qui donne son unité au jeu. Un son trop propre, trop
« vrai », trop cinématographique sonnera faux — même s'il est techniquement
parfait. **Petit, proche, sec, fait main.**

## Le ton : comédie douce-amère

Le jeu est une comédie noire. On rit de la misère avec tendresse. Les sons
peuvent être drôles (un klaxon qui couine, un pigeon très concerné), jamais
sinistres ni grandiloquents. Pas de nappes de synthé dramatiques, pas de
percussion de bande-annonce.

## Trois interdits absolus

1. **Aucune parole intelligible.** Le jeu existe en français et en anglais ;
   un mot compréhensible casserait la traduction. Un brouhaha de foule doit
   rester un brouhaha — des voyelles, du murmure, jamais de phrase.
2. **Aucune mélodie reconnaissable** ni citation d'une musique existante.
3. **Aucune stridence.** Le jeu se joue au casque dans le métro. Rien
   au-dessus de 8 kHz qui pique, pas de sifflement continu.

## Ce qui existe déjà et qu'on ne touche pas

Le thème de l'écran-titre est déjà en place et il plaît. **Ne pas le
remplacer.** Tout le reste du jeu est actuellement synthétisé à la volée par
le navigateur : c'est fonctionnel mais sans matière. C'est ça qu'on remplace.

## Contraintes techniques (les mêmes pour les trois packs)

- **Format : WAV, 48 kHz, 16 bits.** Si ce n'est pas possible, MP3 320 kbps —
  la conversion finale sera faite à l'intégration.
- **Boucles : stéréo. Bruitages courts : mono.**
- **Les boucles doivent boucler.** La dernière milliseconde doit s'enchaîner
  sur la première sans clic ni trou. C'est le point le plus important du pack 1,
  et le plus souvent raté : vérifie en bouclant trois fois d'affilée.
- **Niveaux :** boucles d'ambiance à **−23 LUFS** (elles passent SOUS le reste),
  bruitages à **−16 LUFS**, crête à **−6 dBFS** maximum. Aucun son ne doit
  saturer.
- **Pas de silence en tête** des bruitages courts : ils se déclenchent sur une
  action, tout retard s'entend.
- **Noms de fichiers exacts**, copiés depuis les listes. Une faute = fichier
  inutilisable.
- **Livraison : un ZIP par pack**, contenant un dossier `sons/`.

---

# 🎯 Ce pack : un bruitage par rencontre

Le jeu compte **296 rencontres**, et chacune a maintenant droit à SON bruitage.
Jusqu'ici elles se partageaient 58 sons rangés par thème — ce qui donnait 30
rencontres différentes sur le même bruit de voiture, et quelques absurdités
(une laverie qui déclenchait le tonnerre, parce que le mot « éclairé » ressemble
à « éclair »).

Le bruitage se déclenche **à l'ouverture de la carte de rencontre**, une fois,
puis se tait.

## La règle qui décide de tout

**Le son doit sortir de CETTE scène-là, pas de sa catégorie.** Chaque entrée
ci-dessous vous donne le titre et le texte exact que le joueur lit à l'écran.
Lisez-le, et cherchez **le bruit que fait précisément ce moment** — pas le bruit
que fait la catégorie à laquelle il appartient.

Un « registre » est indiqué entre crochets : c'est une simple indication de
famille sonore, un point de départ. **Si la scène dit autre chose, la scène a
raison.**

### Six exemples, pour fixer le niveau attendu

| La scène | ❌ le son de la catégorie | ✔ le son de la scène |
|---|---|---|
| *Un ado rate un trick, son skate roule vers vous* | un vélo qui passe | la planche qui claque au sol, puis les roulettes qui roulent seules vers l'auditeur et s'arrêtent |
| *Un couple en fourrure passe, ils sentent le parfum cher* | du tissu | le froissement lourd de la fourrure et deux talons qui s'éloignent sans ralentir |
| *La boulangerie ferme dans 10 minutes, l'odeur vous torture* | de la nourriture | le rideau métallique qui commence à descendre, et un sac en papier qu'on plie |
| *Un gamin de 6 ans pleure sur un banc* | des enfants qui jouent | un seul reniflement, tout petit, et un banc en bois qui grince |
| *Un vieil homme cultive des légumes en cachette. Il vous repère* | un jardin | une bêche qui s'arrête net en pleine terre. Le silence qui suit est le son. |
| *Le lavomatic est ouvert toute la nuit. Chaud, éclairé* | le tonnerre | un tambour de machine qui tourne, et le bourdonnement d'un néon |

Le troisième colonne est ce qu'on attend. À chaque fois : **un geste concret,
une matière, et si possible un silence bien placé.**

## Règles communes à tous les fichiers

- **Durée : 0,4 à 1,2 seconde.** Pas plus. C'est une ponctuation, pas une scène.
- **Mono**, aucun silence en tête.
- Niveau **−16 LUFS**, crête −6 dBFS.
- **Discrets** : ils accompagnent l'apparition d'une image, ils ne la couvrent
  pas.
- Toujours **fabriqués à la main, en carton et en papier** (voir la direction
  sonore ci-dessus).
- **Aucune parole intelligible** : le jeu est bilingue.
- Les lots partiels sont bienvenus. Chaque bruitage s'active dès son
  intégration.

---

### `sfx-exp-pigeon-bague.wav`  · [pigeon]
**« Le Pigeon Voyageur »**
> Un pigeon bagué picore près de vous. Le petit tube fixé à sa patte contient visiblement un message. Le mystère à portée de main.

### `sfx-exp-egoutier.wav`  · [souterrain, résonance]
**« L'Égoutier Philosophe »**
> Un égoutier en pause remonte de sa bouche d'égout, s'assoit sur le rebord et vous tend un gobelet de thermos, comme si c'était prévu.

### `sfx-exp-cabine-ecoute.wav`  · [téléphone]
**« La Cabine qui Sonne »**
> La dernière cabine téléphonique du quartier se met à sonner pile quand vous passez devant. Personne d'autre dans la rue.

### `sfx-exp-drone-crash.wav`  · [vent]
**« Le Drone Écrasé »**
> Un drone de livraison gît dans un buisson, hélices tordues, colis intact accroché au ventre. Il clignote faiblement, comme un animal blessé.

### `sfx-exp-caravane-voyante.wav`  · [brouhaha feutré]
**« La Caravane de la Voyante »**
> Une caravane mauve s'est garée sur le terrain vague. « Madame Esperanza, avenir, passé, objets perdus. » Elle vous fait signe d'entrer, gratuitement.

### `sfx-exp-atelier-velo.wav`  · [nourriture]
**« L'Atelier Vélo Associatif »**
> Un atelier associatif répare des vélos dans une arrière-cour. Ça sent la graisse, le métal et le café. Quelqu'un jure contre un dérailleur.

### `sfx-exp-vernissage.wav`  · [public, spectacle]
**« Le Vernissage »**
> Une galerie inaugure une expo d'art contemporain. Porte ouverte, vin blanc à volonté, et des œuvres que personne ne comprend. Vous êtes habillé pareil que l'artiste.

### `sfx-exp-colleur-affiches.wav`  · [vent]
**« Le Colleur d'Affiches »**
> Un colleur d'affiches se bat seul contre le vent avec une affiche de cirque de quatre mètres. Le vent gagne, avec panache.

### `sfx-exp-stand-hotdog.wav`  · [police]
**« Le Stand de Hot-Dogs Abandonné »**
> Un stand de hot-dogs fume tout seul au coin de la rue. Le vendeur est parti en courant vers une contractuelle, au loin. Les saucisses grésillent, orphelines.

### `sfx-exp-cle-perdue.wav`  · [clés]
**« Le Trousseau Perdu »**
> Un trousseau de clés gît sur le trottoir : sept clés, une patte de lapin usée, et une étiquette « si perdu, récompense ». Sans adresse.

### `sfx-exp-consigne-verre.wav`  · [mécanique, moteur]
**« La Consigne du Verre »**
> Le nouveau supermarché a installé une machine à consigne : chaque bouteille rapporte des centimes. Le quartier entier jette ses bouteilles n'importe où. Une mine à ciel ouvert.

### `sfx-exp-ruche-urbaine.wav`  · [insectes]
**« Les Ruches du Toit »**
> Sur le toit du gymnase, un apiculteur urbain en combinaison blanche s'agite entre ses ruches. Il vous aperçoit et crie quelque chose d'inaudible.

### `sfx-exp-machine-pince.wav`  · [mécanique, moteur]
**« La Machine à Pince »**
> Dans le hall de la laverie, une machine à pince pleine de peluches délavées. Un mot scotché : « pince déréglée, jouez à vos risques. » Déréglée dans quel sens ?

### `sfx-exp-cinema-sauvage.wav`  · [monnaie]
**« Le Cinéma Sauvage »**
> Quelqu'un projette un vieux film sur le mur aveugle de l'immeuble d'en face. Des transats, un drap tendu, un chapeau pour la monnaie. Le quartier s'assoit.

### `sfx-exp-carton-chatons.wav`  · [chat]
**« Le Carton qui Miaule »**
> Un carton scotché miaule près des poubelles. À l'intérieur : trois chatons et un mot immonde : « débrouillez-vous. » Le monde, parfois.

### `sfx-exp-escalator-panne.wav`  · [foule]
**« L'Escalator en Panne »**
> L'escalator du centre commercial est en panne. Une foule attend devant, immobile, que quelqu'un répare des marches. Qui fonctionnent. En tant qu'escalier.

### `sfx-exp-billet-envole.wav`  · [vent]
**« Le Billet dans le Vent »**
> Un billet de dix euros danse dans le vent, à deux mètres du sol, ivre de liberté. Toute la rue l'a vu. Toute la rue s'est arrêtée.

### `sfx-exp-camion-invendus.wav`  · [circulation, véhicule]
**« Le Camion des Invendus »**
> Derrière le supermarché, un camion charge les invendus « pour destruction ». Des palettes entières de nourriture à peine périmée, condamnées par des dates.

### `sfx-exp-cirque-installation.wav`  · [public, spectacle]
**« Le Cirque s'Installe »**
> Un petit cirque familial monte son chapiteau sur le terrain vague. Ça manque de bras, ça crie en trois langues, et un lama observe la scène, blasé.

### `sfx-exp-horodateur.wav`  · [mécanique, moteur]
**« L'Horodateur Fou »**
> Un horodateur imprime des tickets en continu, dans le vide, avec un petit bruit joyeux. Un automobiliste vient d'y renoncer, furieux.

### `sfx-exp-depot-vente.wav`  · [vent]
**« Les Bacs du Dépôt-Vente »**
> Le dépôt-vente sort ses bacs « tout à 1€ » sur le trottoir. La gérante précise : « et ce qui reste ce soir, c'est gratuit. » Le soir, c'est dans dix heures.

### `sfx-exp-serrurier.wav`  · [clés]
**« Le Serrurier Pédagogue »**
> Un serrurier forme son apprenti sur une porte cochère. L'apprenti transpire. Le serrurier soupire. La serrure, elle, résiste aux deux.

### `sfx-exp-joueur-echecs.wav`  · [végétal, plein air]
**« Le Joueur d'Échecs »**
> Dans le parc, un vieux monsieur joue aux échecs contre personne depuis des années. Aujourd'hui, il a sorti deux chaises.

### `sfx-exp-poissonnier.wav`  · [nourriture]
**« La Fin du Marché aux Poissons »**
> Le poissonnier remballe en gueulant contre la marée, la mairie et le mois d'août. Sur l'étal fondent les dernières glaces, et trois maquereaux invendus.

### `sfx-exp-bus-touristique.wav`  · [circulation, véhicule]
**« Le Bus de Touristes Égaré »**
> Un bus à impériale plein de touristes s'est égaré dans la zone industrielle. Le guide, paniqué, improvise : « ... et ici, le quartier authentique ! »

### `sfx-exp-antiquaire-cave.wav`  · [train]
**« La Cave de l'Antiquaire »**
> L'antiquaire vide sa cave sur le trottoir : « je prends ma retraite, tout doit disparaître. » Il y a un scaphandre. Personne ne demande pourquoi.

### `sfx-exp-arbres-fruitiers.wav`  · [végétal, plein air]
**« Les Arbres de la Ville »**
> Les pommiers « décoratifs » plantés par la mairie croulent sous les fruits. Personne n'y touche : les gens croient que c'est du plastique. C'est des pommes.

### `sfx-exp-etudiants-sociologie.wav`  · [brouhaha feutré]
**« Les Étudiants en Sociologie »**
> Deux étudiants en sociologie vous abordent avec un dictaphone et des mots compliqués : ils font un mémoire sur « l'habiter précaire ». C'est vous, l'habiter précaire.

### `sfx-exp-chien-perdu.wav`  · [chien]
**« Le Chien à Récompense »**
> Un carlin asthmatique erre, médaille au cou : « Je m'appelle Churchill. Si perdu, GROSSE récompense. » Churchill vous regarde. Vous regardez Churchill.

### `sfx-exp-recycleur-metaux.wav`  · [circulation, véhicule]
**« Le Roi du Cuivre »**
> Un ferrailleur charge sa camionnette de métaux glanés. Il soupèse chaque pièce comme un bijoutier. « Le cuivre, petit, c'est l'or du pauvre. »

### `sfx-exp-buffet-seminaire.wav`  · [brouhaha feutré]
**« Le Buffet du Séminaire »**
> Par la baie vitrée de l'hôtel d'affaires : un séminaire « Excellence & Leadership » vient de finir. Le buffet, intact, attend les serveurs. Les leaders n'avaient pas faim.

### `sfx-exp-lampadaire-morse.wav`  · [sommeil]
**« Le Lampadaire qui Clignote »**
> Le lampadaire du coin clignote depuis des semaines. Cette nuit, vous en êtes sûr : c'est du morse. Court-court-long. Quelqu'un doute de votre santé mentale. Vous, un peu.

### `sfx-exp-jardin-communautaire-suite.wav`  · [végétal, plein air]
**« Le Retour au Jardin »**
> Le vieux jardinier vous attendait ! "Ah, te revoilà ! J'ai quelque chose pour toi."

### `sfx-exp-vieille-dame-suite.wav`  · [végétal, plein air]
**« La Grand-Mère Reconnaissante »**
> Une vieille dame vous interpelle. "C'est vous qui avez aidé mon petit-fils ! Je vous ai cherché partout !"

### `sfx-exp-pecheur-suite.wav`  · [eau]
**« La Partie de Pêche »**
> Le pêcheur du canal vous fait signe. "Hé ! J'ai apporté une canne pour toi !"

### `sfx-exp-brocante-suite.wav`  · [téléphone]
**« Le Trésor du Brocanteur »**
> Le brocanteur vous appelle. "J'ai trouvé un truc qui pourrait t'intéresser !"

### `sfx-exp-musicien-suite.wav`  · [métro]
**« Le Duo Musical »**
> Le musicien du métro vous reconnaît ! "Hé ! On refait un duo ? J'ai gagné le double la dernière fois !"

### `sfx-exp-dechetterie-suite.wav`  · [mécanique, moteur]
**« Le Roi de la Récup »**
> Vous retournez à la déchetterie. Le gardien vous fait signe. "J'ai mis des trucs de côté pour toi !"

### `sfx-exp-chat-revient.wav`  · [chat]
**« Le Retour du Chat »**
> Le chat que vous avez sauvé revient ! Il porte quelque chose dans sa gueule...

### `sfx-exp-foyer-accueil.wav`  · [porte, grille, serrure]
**« Le Foyer d'Accueil »**
> Grâce aux informations de la mairie, vous trouvez un foyer d'accueil. La porte est ouverte.

### `sfx-exp-velo-suite.wav`  · [vélo, roulettes]
**« L'Offre pour le Vélo »**
> Un étudiant lorgne votre vélo rafistolé au fil de fer. "Il roule ? Je vous en donne quelque chose !"

### `sfx-exp-eglise-suite.wav`  · [lieu de culte]
**« La Soupe du Curé »**
> Le prêtre vous reconnaît sur le parvis. "Notre ami ! La soupe est chaude, entrez donc."

### `sfx-exp-gardien-suite.wav`  · [nourriture]
**« Le Café du Gardien »**
> Le gardien de la déchetterie vous hèle depuis sa guérite. "Pause café ? J'ai un truc à te montrer, aussi."

### `sfx-exp-toit-suite.wav`  · [végétal, plein air]
**« Votre Toit »**
> Votre planque sur le toit vous attend. La ville scintille en carton, et personne ne sait que vous êtes là.

### `sfx-exp-emploi-jardin-suite.wav`  · [végétal, plein air]
**« Journée au Jardin »**
> "T'es en retard," grogne le vieux jardinier en vous tendant une bêche. Votre « emploi » vous attend.

### `sfx-exp-mentor-suite.wav`  · [végétal, plein air]
**« Vos Tomates »**
> Le coin de terre que le vieux vous a appris à cultiver a bien travaillé : des tomates. Des vraies. Les vôtres.

### `sfx-exp-magasin-suite.wav`  · [porte, grille, serrure]
**« La Porte de Derrière »**
> Le magasin abandonné, la porte arrière entrouverte. Vous l'aviez notée « pour plus tard ». Plus tard, c'est maintenant.

---

## Récapitulatif des noms de fichiers

```
sfx-exp-pigeon-bague.wav
sfx-exp-egoutier.wav
sfx-exp-cabine-ecoute.wav
sfx-exp-drone-crash.wav
sfx-exp-caravane-voyante.wav
sfx-exp-atelier-velo.wav
sfx-exp-vernissage.wav
sfx-exp-colleur-affiches.wav
sfx-exp-stand-hotdog.wav
sfx-exp-cle-perdue.wav
sfx-exp-consigne-verre.wav
sfx-exp-ruche-urbaine.wav
sfx-exp-machine-pince.wav
sfx-exp-cinema-sauvage.wav
sfx-exp-carton-chatons.wav
sfx-exp-escalator-panne.wav
sfx-exp-billet-envole.wav
sfx-exp-camion-invendus.wav
sfx-exp-cirque-installation.wav
sfx-exp-horodateur.wav
sfx-exp-depot-vente.wav
sfx-exp-serrurier.wav
sfx-exp-joueur-echecs.wav
sfx-exp-poissonnier.wav
sfx-exp-bus-touristique.wav
sfx-exp-antiquaire-cave.wav
sfx-exp-arbres-fruitiers.wav
sfx-exp-etudiants-sociologie.wav
sfx-exp-chien-perdu.wav
sfx-exp-recycleur-metaux.wav
sfx-exp-buffet-seminaire.wav
sfx-exp-lampadaire-morse.wav
sfx-exp-jardin-communautaire-suite.wav
sfx-exp-vieille-dame-suite.wav
sfx-exp-pecheur-suite.wav
sfx-exp-brocante-suite.wav
sfx-exp-musicien-suite.wav
sfx-exp-dechetterie-suite.wav
sfx-exp-chat-revient.wav
sfx-exp-foyer-accueil.wav
sfx-exp-velo-suite.wav
sfx-exp-eglise-suite.wav
sfx-exp-gardien-suite.wav
sfx-exp-toit-suite.wav
sfx-exp-emploi-jardin-suite.wav
sfx-exp-mentor-suite.wav
sfx-exp-magasin-suite.wav
```

**47 fichiers.** Livraison en ZIP, dossier `sons/`.