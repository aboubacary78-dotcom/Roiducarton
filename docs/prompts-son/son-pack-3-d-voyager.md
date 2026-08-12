# Pack son 3.4 — Voyager (43 bruitages)

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

## ⚠️ Le contrôle qui compte : ils doivent différer ENTRE EUX

Le premier lot livré était bon sur ce point ; le deuxième nettement moins —
mesuré, pas ressenti : ses sons se ressemblaient sensiblement plus entre eux,
alors qu'ils couvraient des scènes tout aussi variées. C'est le piège d'une
commande en nombre, et c'est ce qui ruinerait l'intérêt d'avoir un son par
rencontre plutôt qu'un son par catégorie.

**Le test, à faire avant de livrer : jouez tout le lot à la suite, les yeux
fermés.** Si deux bruitages sont difficiles à distinguer, l'un des deux est à
refaire — même si chacun, pris seul, est réussi.

Trois leviers pour varier, quand deux scènes se ressemblent :

- **changer la matière** : le même geste sur du carton, sur du métal, sur du
  papier journal ne donne pas le même son ;
- **changer le rythme** : un coup sec, deux coups espacés, un frottement
  continu — la silhouette temporelle se reconnaît mieux que le timbre ;
- **changer ce qu'on écoute** : dans une scène il y a souvent trois sons
  possibles. Si la précédente a pris le plus évident, prenez-en un autre.

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

### `sfx-travel-ruelle-sombre.wav`  · [végétal, plein air]
**« La Ruelle Sombre »**
> Un raccourci par une ruelle sombre. Ça sent le danger... et les poubelles.

### `sfx-travel-tunnel-metro.wav`  · [métro]
**« Le Tunnel de Métro »**
> Un tunnel de métro désaffecté. Sombre, humide, mais c'est un raccourci.

### `sfx-travel-parc-nuit.wav`  · [pluie]
**« Le Parc la Nuit »**
> Traverser le parc de nuit. Les lampadaires sont en panne.

### `sfx-travel-pont-autoroute.wav`  · [circulation, véhicule]
**« Le Pont de l'Autoroute »**
> Le pont au-dessus de l'autoroute. Bruyant, venteux, mais c'est le chemin le plus court.

### `sfx-travel-marche-matin.wav`  · [circulation, véhicule]
**« Le Marché du Matin »**
> Le marché s'installe. Les commerçants déchargent leurs camions.

### `sfx-travel-gare-routiere.wav`  · [circulation, véhicule]
**« La Gare Routière »**
> La gare routière est animée. Des bus partent vers d'autres villes.

### `sfx-travel-velo-trouve.wav`  · [vélo, roulettes]
**« Le Vélo Trouvé »**
> Un vélo sans antivol est posé contre un mur. Tentant...

### `sfx-travel-chantier-nuit.wav`  · [chantier]
**« Le Chantier de Nuit »**
> Un chantier de construction. La nuit, personne ne surveille.

### `sfx-travel-riviere.wav`  · [pluie]
**« La Rivière »**
> La rivière coupe votre chemin. Le pont est à 500m, mais vous pourriez traverser à gué.

### `sfx-travel-tramway.wav`  · [métro]
**« Le Tramway »**
> Le tramway passe. Vous pourriez monter sans payer...

### `sfx-travel-skateboard.wav`  · [vélo, roulettes]
**« Le Skateboard Trouvé »**
> Un skateboard abandonné sur le trottoir. Les roues tournent encore.

### `sfx-travel-egout.wav`  · [souterrain, résonance]
**« Les Égouts »**
> Une bouche d'égout ouverte. Le raccourci ultime... si vous supportez l'odeur.

### `sfx-travel-bus-nuit.wav`  · [circulation, véhicule]
**« Le Bus de Nuit »**
> Le bus de nuit passe. Dernier service. Presque vide.

### `sfx-travel-passage-souterrain.wav`  · [souterrain, résonance]
**« Le Passage Souterrain »**
> Le passage souterrain coupe le trajet en deux. Au milieu, un accordéoniste joue pour personne, et l'acoustique lui fait un orchestre.

### `sfx-travel-passerelle.wav`  · [train]
**« La Passerelle des Rails »**
> La passerelle piétonne enjambe douze voies ferrées. En dessous, les trains partent vers des endroits où vous ne dormirez pas ce soir.

### `sfx-travel-abribus-oublis.wav`  · [circulation, véhicule]
**« L'Abribus aux Oublis »**
> L'abribus du boulevard est un musée des choses oubliées : un parapluie, un sac de sport, et un livre ouvert face contre banc, comme si son lecteur allait revenir.

### `sfx-travel-zone-travaux.wav`  · [circulation, véhicule]
**« La Déviation »**
> La rue est éventrée sur cent mètres : « DÉVIATION » pointe vers un labyrinthe de barrières où un ouvrier fait de grands gestes contradictoires.

### `sfx-travel-chien-suiveur.wav`  · [chien]
**« Le Chien qui Suit »**
> Depuis trois rues, un chien jaune sans collier vous suit à quatre mètres, l'air de rien. Quand vous vous arrêtez, il s'arrête. Quand vous repartez, il repart.

### `sfx-travel-porche-facteur.wav`  · [pluie]
**« L'Averse et le Facteur »**
> Le ciel se déchire en pleine traversée. Vous plongez sous un porche déjà occupé par un facteur, sa sacoche, et un silence de circonstance.

### `sfx-travel-carrefour-touristes.wav`  · [klaxon]
**« Les Touristes Perdus »**
> Au carrefour, un couple de touristes tourne sa carte dans tous les sens. Ils vous repèrent : dans cette rue, c'est vous qui avez l'air de savoir où vous allez. C'est dire.

### `sfx-travel-benne-camion.wav`  · [circulation, véhicule]
**« Le Camion Complice »**
> Un camion plateau démarre au feu, chargé de palettes, pile dans votre direction. La ridelle arrière est basse. Le chauffeur ne regarde que devant.

### `sfx-travel-voie-ferree.wav`  · [train]
**« Le Long des Rails »**
> Le raccourci du ballast : longer la voie ferrée désaffectée, entre les orties et les traverses. Interdit, désert, et deux fois plus court.

### `sfx-travel-parking-silo.wav`  · [circulation, véhicule]
**« Le Parking en Spirale »**
> Le parking silo traverse le pâté de maisons de part en part. Sept étages de spirale en béton, ou le tour complet par le boulevard. La rampe vous tend les bras.

### `sfx-travel-halles-nuit.wav`  · [pluie]
**« Les Halles à la Fermeture »**
> Votre trajet traverse les halles couvertes à l'heure du rideau : les commerçants remballent, les invendus hésitent entre la glacière et la benne.

### `sfx-travel-cimetiere-raccourci.wav`  · [pluie]
**« Le Raccourci du Cimetière »**
> Le cimetière a deux entrées opposées : le traverser coupe le trajet de moitié. Les allées sont droites, les résidents discrets, le silence pèse son poids.

### `sfx-travel-berge-canal.wav`  · [eau]
**« Le Chemin de Halage »**
> Le chemin de halage longe le canal jusqu'au quartier suivant : plat, calme, bordé de pêcheurs immobiles et de canards administratifs.

### `sfx-travel-dame-pipi.wav`  · [végétal, plein air]
**« La Gardienne des Toilettes »**
> Les toilettes publiques du square, tenues depuis trente ans par une gardienne en blouse qui a tout vu, tout entendu, et gardé le meilleur.

### `sfx-travel-egout-ouvert.wav`  · [souterrain, résonance]
**« La Bouche Ouverte »**
> En travers du trottoir, une bouche d'égout ouverte, entourée de trois plots et d'aucun ouvrier. Le trou respire doucement. Le détour, lui, fait cinquante mètres.

### `sfx-travel-escalier-monumental.wav`  · [commerce, étal]
**« L'Escalier Monumental »**
> Entre le bas et le haut du quartier : l'escalier monumental, cent quatre-vingts marches de pierre que les joggeurs montent en boucle comme des punitions volontaires.

### `sfx-travel-trottinette.wav`  · [circulation, véhicule]
**« La Trottinette Échouée »**
> Une trottinette électrique en libre-service gît couchée en travers du chemin, abandonnée avec 40 % de batterie et zéro surveillance. La tentation a un guidon.

### `sfx-travel-cortege-funeraire.wav`  · [deuil]
**« Le Cortège »**
> Un cortège funéraire remonte lentement la rue et coupe votre trajet : corbillard, famille en noir, et un klaxon de scooter impatient que tout le monde foudroie du regard.

### `sfx-travel-camionnette-glaces.wav`  · [circulation, véhicule]
**« La Camionnette à Glaces »**
> La ritournelle d'une camionnette à glaces flotte quelque part dans le quartier, obsédante, insaisissable. Elle semble tourner autour de vous depuis dix minutes.

### `sfx-travel-brouillard.wav`  · [vent]
**« La Purée de Pois »**
> Le brouillard avale le quartier d'un coup : dix mètres de visibilité, les lampadaires en halos, les bruits qui arrivent sans propriétaire. La ville devient une rumeur.

### `sfx-travel-terrain-vague-diagonale.wav`  · [mécanique, moteur]
**« La Diagonale du Terrain Vague »**
> Le terrain vague coupe le trajet en diagonale : herbes hautes, carcasses de machines à laver, et un sentier tracé par des générations de gens pressés.

### `sfx-travel-vitrine-teles.wav`  · [radio]
**« Le Mur de Télés »**
> La vitrine du magasin d'électroménager diffuse le même match sur douze écrans. Devant, un attroupement de passants qui « ne font que passer » depuis vingt minutes.

### `sfx-travel-place-pigeons.wav`  · [vent]
**« La Place aux Mille Pigeons »**
> La place est intégralement couverte de pigeons. Un tapis gris, roucoulant, qui vous sépare de l'autre côté. Ils vous regardent. Ils savent que vous devez passer.

### `sfx-travel-bache-envolee.wav`  · [étrange, glacé]
**« La Bâche Fugitive »**
> Une bâche de chantier s'est arrachée dans le vent et remonte la rue en roulant comme un fantôme bleu de quatre mètres. Les passants s'écartent. Elle vient vers vous.

### `sfx-travel-sosie.wav`  · [commerce, étal]
**« Le Sosie »**
> Sur le trottoir d'en face marche un homme qui vous ressemble trait pour trait : même barbe, même manteau, même démarche de fatigue digne. Il vous a vu aussi. Vous ralentissez tous les deux.

### `sfx-travel-photographe.wav`  · [photo]
**« Le Photographe de Rue »**
> Un photographe en gilet multipoche vous suit depuis deux rues, boîtier à l'affût. Il finit par oser : « votre visage, c'est la ville entière. Je peux ? »

### `sfx-travel-feu-artifice.wav`  · [cérémonie]
**« Le Feu d'Artifice Privé »**
> Derrière les toits, un feu d'artifice éclate sans prévenir : un mariage, un anniversaire, une victoire quelconque. Le ciel du quartier s'offre un luxe qui retombe sur tout le monde.

### `sfx-travel-arroseuse.wav`  · [eau]
**« L'Arroseuse Municipale »**
> Au bout de la rue, l'arroseuse municipale remonte lentement le caniveau, ses jets balayant tout le trottoir. Le conducteur porte des lunettes de soleil. Il ne ralentira pas.

### `sfx-travel-gants-grille.wav`  · [porte, grille, serrure]
**« Les Gants sur les Grilles »**
> Tout le long de la grille du square, des gants perdus ont été empalés sur les piques par des passants : une exposition involontaire de mains vides qui saluent.

### `sfx-travel-jardin-prive.wav`  · [végétal, plein air]
**« Le Jardin Traversant »**
> La résidence bourgeoise a un jardin traversant dont les deux portillons ferment mal, tout le monde le sait. Allées ratissées, massifs taillés, silence de coton. Interdit, évidemment.

---

## Récapitulatif des noms de fichiers

```
sfx-travel-ruelle-sombre.wav
sfx-travel-tunnel-metro.wav
sfx-travel-parc-nuit.wav
sfx-travel-pont-autoroute.wav
sfx-travel-marche-matin.wav
sfx-travel-gare-routiere.wav
sfx-travel-velo-trouve.wav
sfx-travel-chantier-nuit.wav
sfx-travel-riviere.wav
sfx-travel-tramway.wav
sfx-travel-skateboard.wav
sfx-travel-egout.wav
sfx-travel-bus-nuit.wav
sfx-travel-passage-souterrain.wav
sfx-travel-passerelle.wav
sfx-travel-abribus-oublis.wav
sfx-travel-zone-travaux.wav
sfx-travel-chien-suiveur.wav
sfx-travel-porche-facteur.wav
sfx-travel-carrefour-touristes.wav
sfx-travel-benne-camion.wav
sfx-travel-voie-ferree.wav
sfx-travel-parking-silo.wav
sfx-travel-halles-nuit.wav
sfx-travel-cimetiere-raccourci.wav
sfx-travel-berge-canal.wav
sfx-travel-dame-pipi.wav
sfx-travel-egout-ouvert.wav
sfx-travel-escalier-monumental.wav
sfx-travel-trottinette.wav
sfx-travel-cortege-funeraire.wav
sfx-travel-camionnette-glaces.wav
sfx-travel-brouillard.wav
sfx-travel-terrain-vague-diagonale.wav
sfx-travel-vitrine-teles.wav
sfx-travel-place-pigeons.wav
sfx-travel-bache-envolee.wav
sfx-travel-sosie.wav
sfx-travel-photographe.wav
sfx-travel-feu-artifice.wav
sfx-travel-arroseuse.wav
sfx-travel-gants-grille.wav
sfx-travel-jardin-prive.wav
```

**43 fichiers.** Livraison en ZIP, dossier `sons/`.