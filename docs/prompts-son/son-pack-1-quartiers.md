# Pack son 1 · Les quartiers et le ciel (10 fichiers)

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
« vrai », trop cinématographique sonnera faux, même s'il est techniquement
parfait. **Petit, proche, sec, fait main.**

## Le ton : comédie douce-amère

Le jeu est une comédie noire. On rit de la misère avec tendresse. Les sons
peuvent être drôles (un klaxon qui couine, un pigeon très concerné), jamais
sinistres ni grandiloquents. Pas de nappes de synthé dramatiques, pas de
percussion de bande-annonce.

## Trois interdits absolus

1. **Aucune parole intelligible.** Le jeu existe en français et en anglais ;
   un mot compréhensible casserait la traduction. Un brouhaha de foule doit
   rester un brouhaha, des voyelles, du murmure, jamais de phrase.
2. **Aucune mélodie reconnaissable** ni citation d'une musique existante.
3. **Aucune stridence.** Le jeu se joue au casque dans le métro. Rien
   au-dessus de 8 kHz qui pique, pas de sifflement continu.

## Ce qui existe déjà et qu'on ne touche pas

Le thème de l'écran-titre est déjà en place et il plaît. **Ne pas le
remplacer.** Tout le reste du jeu est actuellement synthétisé à la volée par
le navigateur : c'est fonctionnel mais sans matière. C'est ça qu'on remplace.

## Contraintes techniques (les mêmes pour les trois packs)

- **Format : WAV, 48 kHz, 16 bits.** Si ce n'est pas possible, MP3 320 kbps,
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

# 🎯 Ce pack : 10 boucles

Le joueur passe l'essentiel de son temps dans l'un des **cinq quartiers** de la
ville. Chacun a droit à son lit sonore, qui tourne en fond tant qu'il est là.
Par-dessus vient une **couche météo**, qui se superpose au quartier : il peut
pleuvoir au parc comme à la gare.

## Règles communes aux 10 fichiers

- **Durée : 45 à 60 secondes**, en boucle parfaite.
- **Stéréo**, large mais sans effet de spatialisation agressif.
- **Très peu d'événements.** Une ambiance de jeu s'écoute pendant des heures :
  trois ou quatre incidents dans la boucle, pas plus. Un son qui revient toutes
  les huit secondes devient une torture au bout de dix minutes.
- **Rien de mélodique.** Ce sont des lits, pas de la musique.
- Niveau : **−23 LUFS**. Ces fichiers doivent passer sous tout le reste.

---

## Les cinq quartiers

### `amb-parc.wav`
Le parc municipal : pelouse, bancs, pigeons, le paradis des siestes.
Un souffle de feuillage très doux et continu (papier calque froissé lentement,
en boucle). Par-dessus : deux ou trois roucoulements de pigeon (fabriqués à la
bouche, étouffés dans les mains), un grincement de balançoire lointain (une
charnière de boîte en carton), et le froissement d'un sac plastique qui traîne.
**Sensation visée :** calme, un peu vide, dimanche après-midi.

### `amb-centre-ville.wav`
Le centre commerçant : passants, vitrines, police.
Une rumeur de circulation continue et lointaine (souffle grave, filtré), deux
passages de véhicule (glissement de main sur carton ondulé, d'une oreille à
l'autre), un klaxon court et un peu ridicule (un couinement, pas une trompe de
camion), un murmure de foule très en arrière, **sans aucun mot articulé**.
**Sensation visée :** ça bouge, on est un obstacle sur le trottoir.

### `amb-zone-industrielle.wav`
Rouille, rats, trésors cachés.
Un bourdon de machine grave et régulier (une note tenue très sourde, avec un
battement lent), un souffle de vapeur qui lâche une fois, deux clangs
métalliques espacés (une boîte de conserve frappée du bout du doigt, avec
beaucoup de réverbération), un grattement discret quelque part.
**Sensation visée :** grand, vide, on n'est pas censé être là.

### `amb-gare.wav`
Voyageurs, abri, sécurité, un toit temporaire.
Une grande réverbération de halle (tout ce qui se passe ici sonne loin et
haut), un carillon d'annonce à trois notes (le seul élément presque musical du
pack, trois notes de métallophone, douces, jamais la même hauteur qu'un vrai
jingle SNCF), suivi d'un murmure d'annonce **inintelligible et étouffé**, et
un train qui passe au loin (brosse sur carton ondulé, qui accélère puis
s'éloigne).
**Sensation visée :** on est à l'abri, mais on est de passage.

### `amb-marche.wav`
Nourriture, commerçants, vigiles.
Le plus vivant des cinq. Brouhaha de foule proche (plusieurs feuilles de
journal froissées ensemble, en couches), deux appels de marchand, **une
intonation qui monte et redescend, sans mot reconnaissable**, comme entendu de
trop loin, une clochette, des cageots qu'on empile (petites boîtes en carton).
**Sensation visée :** dense, chaud, on pourrait manger.

---

## Les cinq couches météo

Elles se posent **par-dessus** le quartier. Elles doivent donc être **maigres**
et occuper une bande de fréquences bien à elles, pour ne pas boucher le lit du
dessous. Niveau : **−26 LUFS**, encore plus bas que les quartiers.

### `meteo-pluie.wav`
Du riz versé lentement sur une feuille de papier tendue. Régulier, sans
crescendo. Quelques gouttes plus grosses de temps en temps (un doigt sur un
carton tendu). Pas de gargouillis de gouttière.

### `meteo-orage.wav`
La même pluie, un cran plus dense, plus **deux** coups de tonnerre dans la
boucle : une grande plaque de carton fort qu'on gifle et qu'on secoue, avec
une longue traîne. Grave, roulant, jamais claquant.

### `meteo-neige.wav`
Le plus difficile : la neige, c'est le **silence**. Un souffle très grave et
très doux, presque inaudible, qui donne l'impression que les aigus ont été
mangés. Un ou deux craquements de pas dans la poudreuse (de la fécule de maïs
pressée dans un sac).

### `meteo-brouillard.wav`
Un souffle sourd, sans direction, et une réverbération anormalement longue sur
un seul petit son isolé (une goutte, un tintement), comme si le monde était
plus loin qu'il ne devrait.

### `meteo-canicule.wav`
Bourdonnement d'insectes très haut perché mais **doux**, une tôle qui travaille
en se dilatant (un « tonk » de carton fort, isolé, deux fois dans la boucle),
et un souffle chaud immobile. L'air ne bouge pas.

---

## Récapitulatif des noms de fichiers

```
amb-parc.wav
amb-centre-ville.wav
amb-zone-industrielle.wav
amb-gare.wav
amb-marche.wav
meteo-pluie.wav
meteo-orage.wav
meteo-neige.wav
meteo-brouillard.wav
meteo-canicule.wav
```

Dix fichiers. Livraison en un ZIP contenant un dossier `sons/`.
