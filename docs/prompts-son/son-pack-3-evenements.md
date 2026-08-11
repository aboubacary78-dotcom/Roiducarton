# Pack son 3 — Les bruitages d'événements (58 fichiers)

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

# 🎯 Ce pack : 58 petits bruitages

Le jeu contient près de **300 rencontres** — un chien errant, un mariage qui
passe, une contractuelle, un feu d'artifice… Écrire 300 sons serait absurde, et
inutile : les rencontres se rangent en **58 familles**, et chaque rencontre est
aiguillée automatiquement vers le bruitage de sa famille. Un mariage et un
baptême sonnent les mêmes cloches.

Ce sont les 58 fichiers ci-dessous. Chacun se déclenche **à l'ouverture de la
carte d'événement**, une fois, et se tait.

## Règles communes aux 58 fichiers

- **Durée : 0,4 à 1,2 seconde.** Pas plus. Ce sont des ponctuations, pas des
  scènes. Un son d'une seconde et demie paraîtra interminable.
- **Mono.**
- **Aucun silence en tête.**
- **Discrets.** Ils accompagnent l'apparition d'une image, ils ne la couvrent
  pas. Niveau **−16 LUFS**, crête −6 dBFS.
- **Reconnaissables en une écoute.** Un joueur doit savoir de quoi il s'agit
  avant même d'avoir lu le titre. C'est le seul critère qui compte.
- Et toujours : **fabriqués à la main, en carton et en papier** (voir la
  direction sonore ci-dessus).

---

## Les animaux (6)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-dog.wav` | Un aboiement. Pas un molosse : un chien de rue, un peu enroué. |
| `sfx-cat.wav` | Un miaulement de gouttière, traînant, insolent. |
| `sfx-pigeon.wav` | Un roucoulement, puis un battement d'ailes (papier battu). Le son signature du jeu. |
| `sfx-bird.wav` | Un cri d'oiseau générique (mouette, corbeau, coq) — bref et sec. |
| `sfx-rat.wav` | Un couinement de rongeur et des petites griffes qui grattent. |
| `sfx-bee.wav` | Un bourdonnement d'abeille qui passe d'une oreille à l'autre. |
| `sfx-horse.wav` | Un hennissement doux et un sabot. Sert aussi pour le manège. |

## Les cérémonies et les lieux de culte (4)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-wedding.wav` | Volée de cloches joyeuse, très courte, et un grain de riz jeté. |
| `sfx-funeral.wav` | Un glas : une seule cloche grave, espacée. Digne, pas lugubre. |
| `sfx-church.wav` | Une porte d'église qui résonne et un écho de voûte. |
| `sfx-bell.wav` | Une clochette claire et unique (sonnette de comptoir). |

## Les transports (6)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-train.wav` | Un sifflet et un roulement qui passe (brosse sur carton ondulé). |
| `sfx-metro.wav` | Un crissement de rame et le « ding-dong » des portes. Sert aussi pour le tram. |
| `sfx-car.wav` | Une voiture qui passe : glissement de main sur carton, d'une oreille à l'autre. |
| `sfx-horn.wav` | Un klaxon **volontairement ridicule**. Un couinement, pas une trompe. |
| `sfx-siren.wav` | Deux notes de sirène de pompier, lointaines et étouffées. |
| `sfx-bike.wav` | Un timbre de vélo et un cliquetis de roue libre. |

## Le ciel et les éléments (7)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-rain.wav` | Une averse qui démarre : riz sur papier tendu, en crescendo court. |
| `sfx-thunder.wav` | Un coup de tonnerre roulant (plaque de carton secouée). |
| `sfx-wind.wav` | Une bourrasque, un souffle qui monte et retombe. |
| `sfx-cold.wav` | Le froid : un craquement de givre et un silence ouaté. |
| `sfx-fire.wav` | Un feu qui prend : craquements de brindilles (cellophane froissée). |
| `sfx-fireworks.wav` | Une fusée qui monte et deux petites détonations sèches. |
| `sfx-water.wav` | Un clapotis de fontaine, court et frais. |

## La ville qui travaille (7)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-construction.wav` | Trois coups de marteau-piqueur, courts, et un sifflet de chantier. |
| `sfx-machine.wav` | Une machine qui se met en route : moteur, cliquetis, chute d'un jeton. Sert pour la laverie, l'ascenseur, le distributeur, la benne. |
| `sfx-robot.wav` | Trois bips de borne automatique, polis et un peu bêtes. |
| `sfx-drone.wav` | Un bourdonnement d'hélices qui approche et s'éloigne. |
| `sfx-sewer.wav` | Une goutte dans un souterrain, avec une réverbération beaucoup trop longue. |
| `sfx-wood.wav` | Un coup de rabot et de la sciure. Sert pour la menuiserie et l'atelier. |
| `sfx-glass.wav` | Des bouteilles qui s'entrechoquent dans un cageot. Pas de bris. |

## Les gens (7)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-crowd.wav` | Une foule proche qui gronde. Voyelles uniquement, **aucun mot**. |
| `sfx-crowdlow.wav` | Un brouhaha feutré d'intérieur (amphi, buffet, réunion). |
| `sfx-applause.wav` | Des applaudissements clairsemés, un peu gênants. |
| `sfx-laugh.wav` | Deux ou trois rires courts, francs et bienveillants. |
| `sfx-kids.wav` | Des cris d'enfants qui jouent, lointains et joyeux. |
| `sfx-gym.wav` | Un coup de sifflet et un rebond de ballon sur du parquet. |
| `sfx-police.wav` | Un talkie-walkie qui grésille et une portière. Menaçant sans être violent. |

## L'argent et le commerce (4)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-coins.wav` | Des pièces qui tombent dans un chapeau. Chaud, satisfaisant. |
| `sfx-cash.wav` | Un tiroir-caisse qui s'ouvre et un ticket qui s'imprime. |
| `sfx-market.wav` | Un étal : cageots, monnaie, un appel de marchand sans mot. |
| `sfx-food.wav` | Un sac en papier, une friture qui grésille, un croquant. Donne faim. |

## Les objets et les gestes (8)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-paper.wav` | Des pages qu'on tourne et une feuille qu'on déplie. |
| `sfx-door.wav` | Une porte ou une grille : gonds et fermeture nette. |
| `sfx-keys.wav` | Un trousseau de clés secoué, puis une serrure. |
| `sfx-phone.wav` | Une sonnerie de vieux téléphone, deux tons, coupée net. |
| `sfx-camera.wav` | Un déclencheur d'appareil photo et un moteur de bobine. |
| `sfx-cloth.wav` | Du tissu qu'on secoue et qu'on plie. Sert pour le linge et les vêtements. |
| `sfx-clock.wav` | Un tic-tac d'horloge, quatre battements, et un déclic. |
| `sfx-piano.wav` | Trois notes de piano désaccordé, jouées d'un doigt hésitant. |

## Les lieux (5)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-garden.wav` | Des feuilles, un sécateur, une brouette. Vert et paisible. |
| `sfx-sleep.wav` | Un froissement de couverture et une respiration qui ralentit. |
| `sfx-hospital.wav` | Un bip de moniteur, lent, et un chariot qui roule. |
| `sfx-cinema.wav` | Un projecteur qui démarre et un fauteuil qui claque. |
| `sfx-music.wav` | Quatre notes d'harmonica fatigué. **Aucune mélodie connue.** |

## Le reste (3)

| Fichier | Ce qu'on doit entendre |
|---|---|
| `sfx-radio.wav` | Une radio qu'on cherche entre deux stations : grésillement et bribes. |
| `sfx-ghost.wav` | Un souffle glacé et un tintement lointain. Le seul son inquiétant du pack — et encore, à peine. |
| `sfx-discover.wav` | Le son par défaut, joué quand rien d'autre ne correspond. Trois notes claires qui montent, neutres et positives. **À soigner : c'est le plus souvent entendu des 58.** |

---

## Récapitulatif des noms de fichiers

```
sfx-dog.wav          sfx-cat.wav          sfx-pigeon.wav       sfx-bird.wav
sfx-rat.wav          sfx-bee.wav          sfx-horse.wav        sfx-wedding.wav
sfx-funeral.wav      sfx-church.wav       sfx-bell.wav         sfx-train.wav
sfx-metro.wav        sfx-car.wav          sfx-horn.wav         sfx-siren.wav
sfx-bike.wav         sfx-rain.wav         sfx-thunder.wav      sfx-wind.wav
sfx-cold.wav         sfx-fire.wav         sfx-fireworks.wav    sfx-water.wav
sfx-construction.wav sfx-machine.wav      sfx-robot.wav        sfx-drone.wav
sfx-sewer.wav        sfx-wood.wav         sfx-glass.wav        sfx-crowd.wav
sfx-crowdlow.wav     sfx-applause.wav     sfx-laugh.wav        sfx-kids.wav
sfx-gym.wav          sfx-police.wav       sfx-coins.wav        sfx-cash.wav
sfx-market.wav       sfx-food.wav         sfx-paper.wav        sfx-door.wav
sfx-keys.wav         sfx-phone.wav        sfx-camera.wav       sfx-cloth.wav
sfx-clock.wav        sfx-piano.wav        sfx-garden.wav       sfx-sleep.wav
sfx-hospital.wav     sfx-cinema.wav       sfx-music.wav        sfx-radio.wav
sfx-ghost.wav        sfx-discover.wav
```

**58 fichiers.** Les lots partiels sont bienvenus : chaque bruitage livré
s'active dès son intégration. Livraison en ZIP, dossier `sons/`.
