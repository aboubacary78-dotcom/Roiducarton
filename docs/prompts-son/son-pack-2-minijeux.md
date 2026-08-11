# Pack son 2 — Les mini-jeux et les grands moments (18 fichiers)

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

# 🎯 Ce pack : 6 lits de mini-jeu + 12 moments

Le jeu a six situations où le joueur agit vraiment, et une poignée de moments
qui doivent marquer. Aujourd'hui tout est synthétisé par le navigateur : ça
fonctionne, mais ça n'a aucune matière.

---

## A. Les six lits de mini-jeu (boucles de 30 à 40 s)

Mêmes règles que le pack 1 : boucle parfaite, stéréo, **−23 LUFS**, très peu
d'événements. Ce sont des lits de tension, pas de la musique de combat.

### `mg-bagarre.wav` — La Bagarre
Duel au corps à corps dans une ruelle. Une pulsation sourde et régulière, un
peu trop lente pour être rassurante (un poing sur une boîte en carton, avec de
la réverbération). Par-dessus, un frottement de semelles sur le gravier. Rien
d'héroïque : c'est une bagarre minable, pas un boss de jeu vidéo.

### `mg-esquive.wav` — La phase d'esquive
Le joueur déplace son personnage au doigt pour éviter des projectiles. Plus
nerveux : un tic-tac irrégulier très discret, un souffle qui monte et
redescend. Doit donner envie de bouger sans épuiser.

### `mg-casse.wav` — Le Casse
Vol en grille, avec des gardiens qui font leur ronde. **Le plus silencieux des
six.** Un bourdon très grave, un tic-tac lent, et beaucoup de vide entre les
deux. Le silence est l'outil : c'est lui qui rend les pas du gardien terrifiants.

### `mg-manche.wav` — La Manche
On tient le regard d'un passant dans la rue. Rumeur de trottoir légère,
pas de passants qui vont et viennent, un souffle de circulation lointain.
Doit rester supportable : le joueur y passe 24 secondes d'affilée, souvent.

### `mg-recup.wav` — La Récup'
On fouille le fond d'un container à ordures. Résonance de tôle (on est DANS une
grande boîte métallique), froissements de plastique et de carton mouillé,
et — de temps en temps, très loin — un petit grattement de rongeur qui rappelle
qu'on n'est pas seul.

### `mg-marchandage.wav` — Le Culot
On négocie un prix face à un commerçant. Ambiance de boutique, calme :
un frigo qui ronronne, une horloge, un très léger froissement de sac. **Aucune
tension musicale** — toute la tension doit venir du silence entre deux
répliques. Le plus discret du pack.

---

## B. Les douze moments (bruitages courts, mono)

Ceux-là se déclenchent sur une action précise. Durée indiquée pour chacun.
**Aucun silence en tête du fichier.** Niveau **−16 LUFS**, crête −6 dBFS.

### `moment-jour-nouveau.wav` — 1,5 s
Le lever d'un nouveau jour de survie. Trois notes qui montent, jouées sur
quelque chose de fragile (verre frotté, métallophone étouffé), plus un souffle
d'air frais. Doux, un peu fatigué, jamais triomphal : c'est juste un jour de
plus.

### `moment-victoire.wav` — 2 s
On vient de gagner une bagarre. Une petite fanfare **ridicule** — deux ou trois
notes sur un mirliton ou un kazoo, un tambour de boîte à chaussures. Le gag
est essentiel : on a gagné, mais contre un pigeon.

### `moment-ko.wav` — 1,2 s
On encaisse le coup de trop. Un impact mat sur du carton, puis un affaissement
(du papier qui se froisse en s'écroulant), et un tintement métallique isolé qui
roule au sol.

### `moment-mort.wav` — 4 s
L'écran de mort. Le seul son grave du jeu. Une résonance longue et unique —
une grande plaque de carton frappée une fois, laissée mourir jusqu'au bout —
puis un silence, puis un dernier tout petit bruit dérisoire : une pièce de
monnaie qui tombe et tourne sur elle-même avant de s'immobiliser.
**Aucun violon. Aucune nappe.** La retenue fait tout le travail ici.

### `moment-sacre.wav` — 3 s
Le personnage devient le Roi du Carton. **Le moment le plus important du jeu.**
Une fanfare de pacotille, mais sincère : plusieurs kazoos, un tambour de boîte,
des pigeons qui s'envolent en applaudissement (papier battu), et une couronne
en carton qu'on pose (un tout petit « toc »). Grandiose et pitoyable à la fois.

### `moment-piece.wav` — 0,4 s
Une pièce tombe dans le chapeau. Une vraie pièce sur du carton — sec, court,
satisfaisant. Ce son sera entendu des milliers de fois : il doit rester
agréable à la centième écoute. **C'est le son le plus important du pack.**

### `moment-poignee-main.wav` — 0,8 s
Le marchandage aboutit. Deux mains en carton qui se serrent (deux morceaux de
carton frottés puis pressés), et un froissement de billet.

### `moment-porte-claque.wav` — 1 s
Le commerçant se braque et ferme boutique. Un rideau de fer qui descend, en
carton : une brosse rapide sur du carton ondulé, terminée par un « clac » sec.
Définitif.

### `moment-trouvaille.wav` — 1,2 s
On déterre un objet précieux au fond du container. Un frottement qui dégage,
puis trois notes claires qui montent (verres frottés), et un petit souffle
d'émerveillement. Le seul son franchement joyeux du pack.

### `moment-attrape.wav` — 1 s
Un gardien vous repère pendant le casse. Un sursaut : inspiration brusque
(soufflée dans le micro, sans voix), un « clac » de lampe torche, et un début
de pas précipités qui se coupe net.

### `moment-craquement.wav` — 1,5 s
Le tas d'ordures se réveille et vous perdez tout. Un effondrement de matière :
carton, plastique, ferraille qui glissent les uns sur les autres, et un
couinement de rat à la toute fin. Désagréable exprès, mais bref.

### `moment-souvenir.wav` — 3 s
« Le Sursaut » : une fois par partie, au bord du gouffre, un souvenir remonte
et le personnage se relève. Le seul son tendre du jeu. Une note tenue très
douce, une boîte à musique fatiguée qui joue trois notes et s'arrête, et un
souffle. Pas de tristesse appuyée : de la chaleur.

---

## Récapitulatif des noms de fichiers

```
mg-bagarre.wav
mg-esquive.wav
mg-casse.wav
mg-manche.wav
mg-recup.wav
mg-marchandage.wav
moment-jour-nouveau.wav
moment-victoire.wav
moment-ko.wav
moment-mort.wav
moment-sacre.wav
moment-piece.wav
moment-poignee-main.wav
moment-porte-claque.wav
moment-trouvaille.wav
moment-attrape.wav
moment-craquement.wav
moment-souvenir.wav
```

Dix-huit fichiers. Livraison en un ZIP contenant un dossier `sons/`.
