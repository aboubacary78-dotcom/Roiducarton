# Commande audio — « Le Roi du Carton » — 78 sons

**Ce document est la commande complète. Tout ce qu'il faut est dedans : aucun
autre fichier n'est nécessaire.**

---

## Le jeu

Roguelite de survie mobile, comédie noire. On y joue quelqu'un qui dort dehors
et qui essaie de tenir un jour de plus. Direction artistique : **dioramas en
carton kraft photographiés** — les voitures sont en carton, les pigeons sont en
carton, la ville entière tient sur une table d'atelier.

## La règle qui commande tout le reste

**La bande-son doit être en carton, elle aussi.**

Ce n'est **pas** une banque de sons de ville. On ne veut pas l'enregistrement
d'un vrai boulevard, ni une vraie pluie, ni un vrai train. On veut le
**bruitage de cinéma qu'un bricoleur ferait avec ce qu'il a sur son établi**,
micro à vingt centimètres.

| Ce qu'on entend | Comment on le fabrique |
|---|---|
| une voiture qui passe | une main qui glisse sur du carton ondulé |
| la pluie | du riz qu'on verse sur du papier tendu |
| le tonnerre | une grande plaque de carton qu'on secoue |
| un train | une brosse sur du carton ondulé, en accélérant |
| une foule | plusieurs personnes qui froissent du papier journal |
| des pas | des doigts sur une boîte à chaussures |
| le vent | un souffle contre une feuille de papier calque |

Un son trop propre, trop « vrai », trop cinématographique sonnera faux — même
s'il est techniquement parfait. **Petit, proche, sec, fait main.**

## Deux principes de conception

**1. Un son qui dure désigne, un son bref confirme.** Le joueur tient un
téléphone à une main : son œil est sur le bouton d'action, jamais sur les
jauges. Le son est le seul canal qui puisse désigner un danger sans ouvrir une
fenêtre par-dessus le jeu.

**2. L'échec doit dégonfler, jamais punir.** Un carton qui s'affaisse, un objet
qui roule bêtement hors champ. **Aucun buzzer, aucun accord mineur appuyé.** Le
jeu se moque de la situation, jamais du joueur.

---

## Réglages de sortie

| | |
|---|---|
| Format | **MP3, mono, 48 kHz, 40 kbit/s** |
| Exception : les boucles marquées 🔁 | **stéréo, 96 kbit/s** |
| Niveau | normalisé sur la partie sonnante, crête à **−1,5 dB** |
| Silence de tête | **moins de 10 ms** |
| Boucles 🔁 | raccord **sans couture audible**, testé en lecture continue |
| Noms de fichiers | **exactement** ceux du tableau, à la lettre près |

**Suffixe de style à ajouter à la fin de CHAQUE prompt :**

```
Close-miked handmade foley, dry room, no reverb, no music, no digital
processing, cardboard and paper materials, lo-fi domestic recording.
```

---

# PARTIE A — Les 18 sons en retard ⚠️ PRIORITÉ ABSOLUE

Ces dix-huit ont été spécifiés dans un lot précédent et **n'ont jamais été
livrés**. Ils couvrent les mécaniques centrales du jeu, aujourd'hui totalement
muettes : la jauge d'alerte du casse, le compte à rebours, la montée de risque,
et les quatre signaux du corps qui préviennent de la mort.

**Sans eux, le reste est de la décoration sur une maison sans porte.**

## A1 · La tension (5) — le manque le plus lourd

Ces cinq-là ne ponctuent pas : ils **durent** et se **répètent**, de plus en
plus vite. C'est ce qui change le plus la sensation de jeu.

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `tension-alerte-1.mp3` | 0,5 s | `A sheet of corrugated cardboard bent slowly until the flutes creak once, single soft creak` | Premier palier d'alerte. **À peine audible** — on doit le sentir plus que l'entendre |
| `tension-alerte-2.mp3` | 0,7 s | `Thick cardboard bent further, fibres popping in a short irregular sequence` | Deuxième palier. Le même geste, plus serré |
| `tension-alerte-3.mp3` | 1,1 s | `Cardboard tearing along a fold, then a metal shutter dropping shut once in the distance` | Bouclage. **Le rideau au loin dit que c'est fini** |
| `tension-risque.mp3` | 0,8 s | `A leaning stack of cardboard boxes shifting and settling, one box sliding a few centimetres, no collapse` | Le tas de la Récup' qui prévient. **Il ne doit jamais faire sursauter** |
| `tension-compte.mp3` | 0,25 s | `A wind-up kitchen timer ticking one single tick, dry mechanical click` | **Un seul tic dans le fichier** — le jeu le répète lui-même, de plus en plus vite |

## A2 · Le corps (4) — ce qui désamorce la frustration de la mort

Mourir est acceptable **à une condition : avoir été prévenu.** Aujourd'hui le
jeu passe de « ça va » à l'écran de fin sans que le corps ait dit un mot. Ces
quatre sons transforment « c'est injuste » en « j'aurais dû dormir ».

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `corps-faim.mp3` | 0,9 s | `A human stomach growling, low and wet, recorded very close to the belly, single growl` | La faim sous 25. **Gênant, pas comique** |
| `corps-soif.mp3` | 0,6 s | `A dry throat swallowing with effort, single swallow, recorded very close` | La soif sous 25 |
| `corps-froid.mp3` | 0,8 s | `Teeth chattering briefly and an unsteady breath in through the nose` | Le froid sous 25. **C'est lui qui tue le plus souvent** |
| `corps-epuise.mp3` | 1,2 s | `A long tired yawn that trails off into a sigh` | Le sommeil sous 25 |

## A3 · Le combat (3)

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `combat-charge.mp3` | 0,7 s | `Two heavy scuffing steps forward on grit and a sharp breath in` | L'ennemi prend son élan. **Se joue AVANT le coup**, pour qu'on puisse réagir |
| `combat-esquive.mp3` | 0,35 s | `A fist brushing past a fabric coat, light friction, no impact` | Un coup qui frôle |
| `combat-esquive-parfaite.mp3` | 0,4 s | `A coat sleeve whipping through the air fast, passing close by, hitting nothing` | Zéro coup encaissé. **Le silence de l'impact EST la récompense** |

## A4 · Les objets (3)

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `objet-equipe.mp3` | 0,6 s | `A coat pulled on and a belt buckle tightened one notch, fabric and metal` | S'équiper |
| `objet-casse.mp3` | 0,7 s | `Dry cardboard snapping in two along a crease, one clean break` | Un objet perdu pour de bon. **Sec — c'est fini, pas triste** |
| `objet-plein.mp3` | 0,5 s | `A stuffed canvas bag pressed down, seams straining, zip refusing to close` | Le sac est plein, on refuse l'objet |

## A5 · L'interface (3)

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `ui-toast-bon.mp3` | 0,2 s | `A fingernail tapped twice on thin cardboard, two light taps close together` | Bonne nouvelle. **Deux fois plus discret que le clic d'action** |
| `ui-toast-mauvais.mp3` | 0,25 s | `A single dull tap on damp cardboard, soft and short` | Mauvaise nouvelle. Même geste, matière molle |
| `ui-verrou.mp3` | 0,2 s | `A small metal latch pushed and refusing to open, single dry resistance click` | Action indisponible |

---

# PARTIE B — Le hub des cinq quartiers (30)

Chaque quartier reçoit **une couche de signature 🔁, deux respirations, trois
retours d'action**.

> ⚠️ **Les couches `amb-sig-*` ne remplacent rien.** Cinq lits d'ambiance
> existent déjà (`amb-parc.mp3` etc.) et restent en place. Ces nouvelles
> couches se **mixent par-dessus** : plus creuses, plus rares, elles donnent au
> quartier un caractère reconnaissable en deux secondes. Elles doivent donc
> être **peu denses** — beaucoup de vide entre les événements.

## 🌳 Le Parc — papier, souffle, plumes

Le seul quartier où l'on peut respirer. Matières les plus fines de la boîte à
outils : tout y est **sec et léger**.

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `amb-sig-parc.mp3` 🔁 | 30–45 s | `Continuous distant breath against a stretched sheet of tracing paper, slow irregular tissue-paper rustling layered on top, and every 8 to 10 seconds two fingers tapping the hollow of a cardboard egg carton, sparse, seamless loop` | Le vent dans des arbres en carton, et les pigeons. Le tapotement est la signature |
| `vie-parc-envol.mp3` | 0,6 s | `A phone book riffled fast with the thumb, two dry bursts separated by half a breath` | Un pigeon décolle. Franc, jamais menaçant |
| `vie-parc-banc.mp3` | 0,9 s | `A thick spiral notebook coil twisted slowly and released in two stages, single long creak` | Le banc qui grince. Bruit de vieillesse, pas de danger |
| `act-dormir-parc.mp3` | 1,4 s | `A rolled jacket packed down against cardboard, then a long nasal breath releasing` | Le seul son du jeu où quelqu'un se détend vraiment |
| `act-mendier-parc.mp3` | 1,0 s | `Two coins stirred slowly at the bottom of a plastic cup, never ringing loudly` | Des promeneurs, pas des pressés. Le geste est patient |
| `act-fouiller-parc.mp3` | 1,2 s | `A hand plunging into a thin plastic bag half full of crumpled paper, three sweeps, one light object knocked` | La corbeille du parc. Rien de lourd n'y traîne |

## 🏙️ Le Centre-Ville — frottement, foule, verre

Du monde, des vitrines, une patrouille. Matière dominante : le **carton ondulé
frotté**.

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `amb-sig-centre-ville.mp3` 🔁 | 30–45 s | `Two palms sliding alternately on corrugated cardboard, off-beat, never stopping; every 6 seconds three people crumpling newspaper together then falling silent, seamless loop` | Le trafic et la foule. **Le contretemps empêche l'oreille de s'installer : la ville fatigue** |
| `vie-cv-klaxon.mp3` | 0,4 s | `A short pinched breath blown across the neck of an empty glass bottle, cut off sharply` | Un klaxon. Ridicule et agressif |
| `vie-cv-vitrine.mp3` | 0,3 s | `A fingernail tapping twice on a water glass, very close to the mic` | C'est le son du regard qu'on sent sur soi |
| `act-mendier-cv.mp3` | 1,3 s | `A plastic cup shaken fast, coins clattering, then footsteps passing without slowing down` | **Le pas qui continue est la moitié du son** |
| `act-voler-cv.mp3` | 0,8 s | `Fabric pulled sharply off a cardboard surface, followed immediately by a shoe sole pivoting` | On prend et on tourne les talons. Aucune hésitation entre les deux |
| `act-fouiller-cv.mp3` | 1,4 s | `A metal bin lid lifted five centimetres and set back down, then quick nervous paper rummaging` | Rythme pressé, pas curieux : on surveille autour |

## 🚂 La Gare — résonance, métal, annonce

Un toit, du chauffage jusqu'à minuit, des vigiles. **Le seul lieu qui résonne.**

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `amb-sig-gare.mp3` 🔁 | 30–45 s | `A large sheet of cardboard waved very slowly one metre from the mic, continuous; every 12 seconds a scrubbing brush dragged across corrugated cardboard, accelerating then slowing down, seamless loop` | La halle et les trains. L'accélération de la brosse **est** le train |
| `vie-gare-annonce.mp3` | 1,6 s | `Two notes blown into a cardboard tube, the second one lower, then a voice mumbling into a closed fist, words completely unintelligible` | **Ne jamais rendre les mots compréhensibles** |
| `vie-gare-valise.mp3` | 2,5 s | `Small office-chair castors rolling across a cardboard sheet, moving away from the mic` | Le son des gens qui partent quelque part |
| `act-dormir-gare.mp3` | 2,0 s | `A body settling against cardboard, then held breath, then distant footsteps that make the breathing freeze` | Dormir à la gare, c'est dormir à moitié. **Le pas au loin est obligatoire** |
| `act-voler-gare.mp3` | 3,0 s | `A zip opened very slowly tooth by tooth over three seconds, stopping twice` | **Les deux arrêts sont le cœur du son** |
| `act-mendier-gare.mp3` | 3,0 s | `A plastic cup set down on tiles, then two full seconds of silence, then a single coin dropping in` | Le silence entre les deux est ce qui fait mal |

## 🛒 Le Marché — bois, plastique, kraft

De la nourriture partout, des cagettes pleines à la fermeture.

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `amb-sig-marche.mp3` 🔁 | 30–45 s | `Five people continuously crumpling thin plastic bags at varying distances; every 7 seconds a hand slapping the rim of a wooden crate twice, seamless loop` | La cagette frappée est le geste de vendeur : ça claque, ça appelle |
| `vie-marche-cagette.mp3` | 0,9 s | `An empty wooden crate set down on another and slid twenty centimetres` | On range, on empile |
| `vie-marche-kraft.mp3` | 1,5 s | `A large sheet of kraft paper torn from a roll in one motion, then crumpled into a ball` | On emballe. **C'est le son de ce qu'on ne peut pas s'offrir** |
| `act-voler-marche.mp3` | 1,0 s | `An apple lifted from a pile, the neighbouring fruit rolling slightly, then slipped into cloth` | **Le roulement des autres fruits est ce qui trahit** |
| `act-fouiller-marche.mp3` | 2,2 s | `Wooden crates turned over one after another on gravel, three times, with a pause on the second` | La fin de marché. L'arrêt à la deuxième est celui où l'on trouve |
| `act-marchander-marche.mp3` | 1,8 s | `A throat cleared, then four coins counted one by one into a palm` | Le raclement de gorge avant les pièces raconte le rapport de force |

## 🏭 La Zone Industrielle — tôle, rouille, vapeur

Le quartier le plus dangereux, et le seul où la matière est **lourde**.

| Fichier | Durée | Prompt | Intention |
|---|---|---|---|
| `amb-sig-zone-industrielle.mp3` 🔁 | 30–45 s | `A drone made by blowing continuously across the neck of a large plastic bottle, doubled one octave lower; every 9 seconds one clang: an empty tin can struck with the tip of a key and left to ring out, seamless loop` | Le clang irrégulier est ce qui empêche de s'endormir ici |
| `vie-zi-tole.mp3` | 1,0 s | `A thin metal sheet flexed slowly then released sharply` | La tôle qui travaille. **Un son laid, et c'est voulu** |
| `vie-zi-rat.mp3` | 0,7 s | `Fingernails scratching the bottom of a cardboard box, four quick strokes, then scurrying away` | Un frisson, **pas un jump scare** |
| `act-recup-zi.mp3` | 1,6 s | `Scrap stirred in a crate — keys, bolts, a tin lid — then a heavy object lifted with both hands` | Le poids se sent |
| `act-fouiller-zi.mp3` | 1,5 s | `A wooden pallet lifted, moved aside, and gravel scraping underneath` | Le gravier dit qu'on est dehors, sur du sol qui n'est à personne |
| `act-dormir-zi.mp3` | 2,0 s | `Cardboard unfolded flat on the ground, a body lying down, and the machine drone continuing unchanged underneath` | **Le refus du silence est le sens du son** |

---

# PARTIE C — Les cinq mini-jeux (30)

Six rôles chacun : **amorce, manipulation, validation, avertissement, échec,
clôture.**

## ♻️ La Récup' — fouiller une benne

| Rôle | Fichier | Durée | Prompt |
|---|---|---|---|
| Amorce | `mg-recup-amorce.mp3` | 4,0 s | `A large rigid cardboard lid lifted over four seconds, hinge creak made by twisting a notebook coil, and escaping air` |
| Manipulation | `mg-recup-manip.mp3` 🔁 | 4,0 s | `Slow continuous rummaging in a refuse bag: crumpled paper, plastic, a tin can rolling inside, seamless loop` |
| Validation | `mg-recup-trouve.mp3` | 1,0 s | `A hard object pulled free from a soft pile, resisting for half a second, then coming loose and knocking a metal rim` |
| Avertissement | `mg-recup-mou.mp3` | 1,2 s | `A hand sinking into something soft and wet, a water-soaked sponge squeezed slowly, very close to the mic` |
| Échec | `mg-recup-bascule.mp3` | 4,0 s | `A skip tipping over: scrap and cardboard cascading for two seconds, then one single object rolling on alone for two more seconds` |
| Clôture | `mg-recup-fin.mp3` | 1,2 s | `A heavy lid dropping shut in one motion, then silence` |

> Le mou est le meilleur avertissement du jeu : **il ne menace de rien, il
> dégoûte.** Et toute la comédie de l'échec tient dans l'objet qui roule seul
> après la cascade — le temps de trop.

## 🕵️ Le Vol — le casse

| Rôle | Fichier | Durée | Prompt |
|---|---|---|---|
| Amorce | `mg-vol-amorce.mp3` | 3,5 s | `Heavy packing tape peeled very slowly over three seconds and stopped dead, with a held breath over it` |
| Manipulation | `mg-vol-pas.mp3` 🔁 | 2,0 s | `Muffled footsteps on cardboard: two fingers pressing and releasing a shoebox, four steps, seamless loop` |
| Validation | `mg-vol-poche.mp3` | 0,7 s | `A zip closed in one short sharp motion, followed by a pat on fabric` |
| Avertissement | `mg-vol-alerte.mp3` | 0,35 s | `A fingernail dragged once across a single comb tooth, very high, very brief, one sharp peak and no body` |
| Échec | `mg-vol-repere.mp3` | 2,5 s | `A shrill breath through a whistle blocked with paper, then cardboard boxes falling over` |
| Clôture | `mg-vol-sortie.mp3` | 1,5 s | `A cardboard door pushed shut, then two footsteps hurrying away` |

> ⚠️ **`mg-vol-alerte.mp3` est le son le plus important des soixante.** C'est
> lui qui porte la jauge d'alerte du casse. Il doit être **pauvre en fréquences
> — un seul pic aigu, aucun corps** — pour pouvoir être répété vingt fois en
> dix secondes sans devenir insupportable.

## 🥊 La Bagarre

| Rôle | Fichier | Durée | Prompt |
|---|---|---|---|
| Amorce | `mg-bagarre-amorce.mp3` | 1,2 s | `Knuckles cracking: a handful of dry pasta squeezed once in a fist, then a breath out through the nose` |
| Manipulation | `mg-bagarre-esquive.mp3` | 0,4 s | `A short sharp breath in front of the mic, doubled with a tea towel whipped through the air` |
| Validation | `mg-bagarre-touche.mp3` | 0,5 s | `A fist into a cardboard box half full of rags: dull, with a slight wall slap` |
| Avertissement | `mg-bagarre-charge.mp3` | 0,9 s | `Three heavy accelerating steps on cardboard and a loud breath in, then silence` |
| Échec | `mg-bagarre-chute.mp3` | 3,0 s | `A body falling onto empty cardboard boxes, cascading collapse, then a lid spinning on itself and coming to rest` |
| Clôture | `mg-bagarre-souffle.mp3` | 3,0 s | `Two heavy breaths gradually settling down, nothing else` |

> Le couvercle qui tourne sur lui-même après la chute, c'est toute la comédie
> noire du jeu en une seconde et demie : **la dignité met plus longtemps à
> tomber que le corps.**

## 🤝 Le Marchandage

| Rôle | Fichier | Durée | Prompt |
|---|---|---|---|
| Amorce | `mg-marchandage-amorce.mp3` | 1,2 s | `A throat cleared, then a coin set down firmly on a wooden counter` |
| Manipulation | `mg-marchandage-compte.mp3` 🔁 | 3,0 s | `Six coins counted one by one into a palm, steady rhythm, seamless loop` |
| Validation | `mg-marchandage-accord.mp3` | 0,8 s | `Two hands clapping together once, then cloth being handed over` |
| Avertissement | `mg-marchandage-agace.mp3` | 1,2 s | `A sigh through the nose, and fingers drumming three times on wood` |
| Échec | `mg-marchandage-refus.mp3` | 2,5 s | `A metal shutter pulled down in one motion — a steel ruler dragged along a grille — and a coin falling to the floor and rolling` |
| Clôture | `mg-marchandage-sac.mp3` | 1,0 s | `A kraft paper bag snapped open and set down on a counter` |

> L'avertissement ne dit pas « attention », il dit **« tu m'ennuies »**. C'est
> la seule mécanique du jeu où le danger est social : le son doit être poli et
> glaçant.

## 🎻 La Manche

| Rôle | Fichier | Durée | Prompt |
|---|---|---|---|
| Amorce | `mg-manche-amorce.mp3` | 2,5 s | `A plastic cup set down on the ground, cloth spread out, and someone sitting down` |
| Manipulation | `mg-manche-gobelet.mp3` 🔁 | 2,0 s | `Three copper coins shaken in a plastic cup, two bursts, never cheerful, seamless loop` |
| Validation | `mg-manche-piece.mp3` | 0,7 s | `A single coin dropped thirty centimetres into a plastic cup, the bounce as audible as the impact` |
| Avertissement | `mg-manche-uniforme.mp3` | 2,5 s | `Steady slow footsteps in hard soles, approaching without ever changing rhythm` |
| Échec | `mg-manche-renverse.mp3` | 3,5 s | `A cup kicked over, coins scattering across the ground for three seconds, one of them rolling far away` |
| Clôture | `mg-manche-ramasse.mp3` | 3,0 s | `Four coins picked up one by one, and the cup set upright again` |

> Le pas de l'uniforme **qui ne ralentit pas** est plus inquiétant qu'un pas
> qui accélère : il dit que la personne sait déjà ce qu'elle vient faire.

---

# Ordre de fabrication

Si le lot doit être livré en plusieurs fois, **cet ordre-là** :

| Rang | Quoi | Pourquoi |
|---:|---|---|
| 1 | **A1 + A2** (9 sons) | La tension et le corps. Ce sont eux qui rendent la mort juste et le danger lisible |
| 2 | **A3 + A4 + A5** (9 sons) | Le reste du retard |
| 3 | Les 30 mini-jeux (partie C) | Ils font exister les cinq boucles de jeu |
| 4 | Les 30 du hub (partie B) | Ils enrichissent — ils ne réparent rien |

---

# Livraison attendue

1. **78 fichiers MP3**, nommés exactement comme dans les tableaux.
2. Un **rapport de contrôle** : durée mesurée, niveau intégré, crête, silence
   de tête, pour chaque fichier.
3. Pour les **9 boucles** 🔁 — les 5 couches de quartier et les 4 lits de
   manipulation des mini-jeux — confirmation que le raccord a été **écouté en
   lecture continue**, pas seulement mesuré.
4. **Aucun fichier bit-à-bit identique** à un autre.
5. ⚠️ **La licence d'usage commercial** de l'outil ou de la banque employée,
   nommément. Le jeu est monétisé par la publicité : une licence non
   commerciale rendrait la totalité du lot inutilisable.

## Le contrôle qui compte plus que les mesures

Aucun contrôle automatique ne remplace l'écoute. **Écouter chaque fichier sur
le haut-parleur d'un téléphone**, pas au casque : c'est là que le jeu se joue.
On y vérifie la lisibilité de l'attaque, l'absence d'artefacts, et surtout la
conformité au brief — **foley proche, sec, sans musique ni réverbération.**
