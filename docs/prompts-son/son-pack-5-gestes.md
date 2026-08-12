# Pack son 5 — Les gestes (13 fichiers)

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

# 🎯 Ce pack : les bruits de manipulation

Tout le contenu narratif du jeu a désormais son son : les 296 rencontres, les
27 ennemis, les cinq quartiers, les douze grands moments. **Il ne reste que les
gestes** — cliquer, frapper, marcher, encaisser. Ce sont les seuls sons encore
fabriqués à la volée par le navigateur, et ce sont paradoxalement **les plus
entendus de tout le jeu** : un joueur entend le clic d'interface plusieurs
centaines de fois par partie, le son de pas des dizaines de fois par mini-jeu.

D'où une exigence particulière ici : **ils doivent supporter la répétition.**
Un bruitage de rencontre s'entend une fois ; ceux-là s'entendent en rafale. Le
critère n'est donc pas « est-ce que c'est joli », mais **« est-ce que c'est
encore supportable à la centième fois »**.

Trois conséquences directes :

1. **Courts.** 0,08 à 0,5 seconde selon les cas — voir chaque entrée. Un son de
   manipulation qui traîne devient vite insupportable.
2. **Doux dans les aigus.** Aucun pic strident : c'est ce qui fatigue en
   premier. Rien d'agressif au-dessus de 6 kHz.
3. **Sans queue.** Pas de réverbération, pas de traîne. Ils doivent pouvoir se
   déclencher deux fois en un quart de seconde sans se marcher dessus.

## Règles communes

- **Mono**, aucun silence en tête — ils répondent à une action, tout retard
  s'entend comme une latence.
- Niveau **−18 LUFS**, crête −6 dBFS. Plus bas que les bruitages de rencontre :
  ils accompagnent, ils ne commentent pas.
- Toujours **fabriqués à la main, en carton et en papier** (voir la direction
  sonore ci-dessus). C'est ici que ça compte le plus : ces sons sont le toucher
  du jeu.
- **Aucune parole**, aucune mélodie.

---

## A. Ce qu'on entend le plus (à soigner en priorité)

### `geste-clic.mp3` — 0,08 s
Le clic d'interface, sur tous les boutons du jeu. **Le son le plus entendu, de
très loin.** Un doigt qui tape une fois sur une boîte en carton vide : mat,
court, un rien creux. Surtout pas un « bip » ni un claquement sec de plastique.
S'il agace au bout de vingt clics, il est raté.

### `geste-pas.mp3` — 0,15 s
Un pas, dans les mini-jeux de déplacement. Une semelle qui se pose sur du
gravier fin — ou, en carton : une poignée de riz pressée dans un sac en papier.
Feutré. Il se répète vite quand le joueur avance, donc pas de claquement.

### `geste-coup.mp3` — 0,2 s
Un coup qui porte. Un poing dans du carton plein : sourd, avec du corps, sans
aucun métal. C'est le retour le plus important d'une bagarre — il doit être
**satisfaisant** sans être violent.

### `geste-coup-fort.mp3` — 0,3 s
Le coup décisif. Le même geste, mais dans quelque chose de plus gros et de plus
creux : un grand carton qui résonne, plus un léger craquement de fibres. Il doit
s'entendre comme le grand frère du précédent, pas comme un son étranger.

### `geste-encaisse.mp3` — 0,3 s
Le joueur prend le coup. Vu de l'intérieur : un choc mat, une inspiration
coupée (soufflée, **sans voix**), et le carton qui se froisse. Doit faire un
peu mal à entendre, sans être désagréable.

### `geste-souffle.mp3` — 0,25 s
Le souffle d'un départ : une carte qu'on lance au combat, un voyage qui
commence. Une feuille de papier qu'on fait passer vite devant le micro. Léger,
filant, sans sifflement.

---

## B. Les résultats

### `geste-reussite.mp3` — 0,4 s
Une issue positive. Deux ou trois notes qui montent, jouées sur quelque chose de
fragile et fait main — verre frotté, élastique pincé, petit métallophone
étouffé. **Modeste** : dans ce jeu, une réussite reste une petite victoire.

### `geste-echec.mp3` — 0,4 s
Une issue négative. Deux notes qui descendent, et un froissement de papier à la
fin. Résigné plutôt que dramatique — on hausse les épaules, on continue.

### `geste-gong.mp3` — 0,5 s
L'ouverture d'une bagarre. Un couvercle de poubelle frappé une fois, avec une
courte résonance. Ridicule et solennel à la fois : c'est le gong du pauvre.

---

## C. Les rares

### `geste-bricole.mp3` — 0,5 s
On vient de fabriquer un objet. Trois gestes enchaînés très vite : un coup de
scie, un tour de vis, et une petite tape de vérification. Ça tient.

### `geste-succes.mp3` — 0,5 s
Un succès débloqué. Une cascade brève et scintillante — des petits objets en
carton qu'on laisse tomber en cascade sur une table. Pas de carillon céleste.

### `geste-papier.mp3` — 0,45 s
Le récit d'origine s'ouvre. Un vieux papier plié en quatre qu'on déplie
lentement. Un peu solennel : c'est le passé du personnage.

### `geste-troc.mp3` — 0,4 s
Un échange conclu avec quelqu'un de la rue. Deux mains en carton qui se
frottent puis se serrent, et un petit objet qui change de main. Chaleureux.

---

## Récapitulatif des noms de fichiers

```
geste-clic.mp3
geste-pas.mp3
geste-coup.mp3
geste-coup-fort.mp3
geste-encaisse.mp3
geste-souffle.mp3
geste-reussite.mp3
geste-echec.mp3
geste-gong.mp3
geste-bricole.mp3
geste-succes.mp3
geste-papier.mp3
geste-troc.mp3
```

**13 fichiers.** Livraison en un ZIP contenant un dossier `sons/`.

## Le contrôle avant de livrer

1. **Jouez chaque son vingt fois de suite, vite.** S'il devient agaçant, il est
   à refaire. C'est le seul pack où ce test compte plus que la variété.
2. `geste-coup` et `geste-coup-fort` doivent s'entendre comme **deux forces du
   même geste**, pas comme deux sons différents.
3. Aucun ne doit dépasser sa durée indiquée.
