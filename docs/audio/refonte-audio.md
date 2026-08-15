# Refonte audio — Le Roi du Carton
## 49 bruitages, prêts à générer

---

## Comment se servir de ce document

Chaque son est une ligne autonome : **un nom de fichier, une durée cible, une
description à coller telle quelle** dans l'outil de génération.

Les descriptions sont **en anglais** : ces modèles sont entraînés dessus et
comprennent bien mieux « crumpled kraft paper » que « papier kraft froissé ».
La colonne française dit l'intention, elle ne se colle pas.

**Outil recommandé : ElevenLabs Sound Effects** pour les 49 one-shots.
**Stable Audio** pour les ambiances et boucles longues (elles ne sont pas dans
ce lot). Vérifier que l'offre souscrite couvre l'usage commercial.

### Réglages de sortie, valables pour les 49

| | |
|---|---|
| Format de travail | WAV ou MP3, peu importe : tout sera réencodé |
| **Mono obligatoire** | Ces modèles sortent en stéréo large, ce qui sonne creux sur un haut-parleur de téléphone |
| Fréquence | 48 kHz |
| Niveau | Normaliser à **−16 LUFS**, crête à −1 dBTP |
| Format final | **MP3 40 kbit/s mono** (c'est le format du reste du jeu) |
| Silence | Couper le silence de tête à **moins de 10 ms** — sinon le son arrive après le geste |

### La limite qui change tout

Ces modèles sont **mauvais en dessous de 200 ms**. Pour les sons courts, la
durée indiquée est celle du fichier FINAL, après montage : demande un son de
1 à 2 secondes, garde l'attaque, jette la queue.

### Le style, en une phrase à répéter à l'outil

> Close-miked handmade foley, dry room, no reverb, no music, no digital
> processing, cardboard and paper materials, lo-fi domestic recording.

À coller **en suffixe de chaque description**. C'est ce qui empêche l'outil de
livrer un bruitage de film d'action.

---

## Ce que le jeu doit entendre

Cinq familles. La règle interne à chacune : **la matière change avec l'ampleur,
jamais le volume seul.**

- **① L'argent** — l'entrée et la sortie doivent être opposées à l'oreille.
- **② L'effort** — creuser, ramasser, bricoler : que du frottement, jamais de percussion.
- **③ Le corps** — la seule famille percussive du jeu, donc immédiatement lisible.
- **④ Les autres** — rare, donc marquant.
- **⑤ La perte** — plus c'est irréversible, plus le son est mou.

Plus l'interface, qui doit disparaître : du carton manipulé, rien d'autre.

---

# ① L'ARGENT (5)

L'erreur actuelle du jeu : **un seul son sert à l'argent qui entre ET à
l'argent qui sort.** Vendre son manteau et l'acheter s'entendent pareil.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `argent-piece-entree.mp3` | 0,5 s | `Two small coins dropped into a soft empty plastic cup held in the hand, the cup flexing, close-miked handmade foley, dry room, no reverb` | 1 à 3 € reçus. Le gobelet doit sonner **presque vide** — jamais une caisse enregistreuse |
| `argent-poignee-entree.mp3` | 0,8 s | `A handful of loose coins poured into a soft plastic cup, dull and cheap, no ring or shimmer, close-miked handmade foley, dry room` | 4 à 15 € reçus |
| `argent-liasse.mp3` | 1,1 s | `Four crumpled paper banknotes counted quickly with a thumb, dry paper friction, close-miked handmade foley, no reverb` | Plus de 15 €. **Un billet ne tinte jamais** |
| `argent-sortie.mp3` | 0,6 s | `Coins scraped off a wooden counter and taken away by a hand, dragging then lifting, close-miked handmade foley, dry room` | Acheter, payer une amende, donner. Timbre **descendant** — l'inverse de l'entrée |
| `moment-piece.mp3` *(existe)* | 0,35 s | `A single coin landing in a soft plastic cup, single hit, close-miked handmade foley, dry, no reverb` | La pièce attrapée dans le mini-jeu de la manche |

---

# ② L'EFFORT (8)

Aucun de ces sons ne doit ressembler à un coup. Aujourd'hui creuser dans une
poubelle joue un bruit de **poing**.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `geste-fouille.mp3` | 0,7 s | `Hands pushing aside damp cardboard and crumpled paper inside a bin, wet dragging friction, close-miked handmade foley, dry room` | Creuser d'un cran dans la benne |
| `geste-ramasse.mp3` | 0,4 s | `A small metal object peeled off a cardboard surface and lifted, light scrape then a soft clink, close-miked handmade foley` | Ramasser le butin |
| `geste-bricole.mp3` *(existe)* | 0,9 s | `Packing tape unrolled and bitten off with teeth, then two flat palm taps to smooth it down, close-miked handmade foley, dry room` | Fabriquer à l'établi |
| `moment-trouvaille.mp3` *(existe)* | 0,8 s | `A hand rummaging in a bag of marbles and bolts, then one object pulled out and set on cardboard, dull not sparkly, close-miked handmade foley` | Une trouvaille. **Terne, pas cristallin** : c'est de la récup', pas un trésor |
| `geste-usure.mp3` | 1,0 s | `Wet cardboard tearing slowly and steadily, fibres separating, no snap, close-miked handmade foley, dry room` | Un objet bricolé qui cède (matelas, réchaud) |
| `geste-sac.mp3` | 0,6 s | `A tired zipper pulled open, catching and stuttering halfway, close-miked handmade foley, dry room` | Ouvrir le sac |
| `moment-carton-matin.mp3` | 1,2 s | `A damp cardboard flap peeled open slowly with a soft suction sound, then silence, close-miked handmade foley, dry room` | Ouvrir le carton du matin. **Le silence final fait partie du son** |
| `moment-trajet.mp3` | 1,3 s | `Six footsteps walking away on wet gravel, fading slightly, a plastic bag rustling against a leg in rhythm, close-miked handmade foley, dry room` | Changer de quartier. **Six pas, pas plus** : le trajet coûte cher, il ne doit pas s'entendre comme une promenade |

---

# ③ LE CORPS (5)

La seule famille percussive. Si tout le reste est du frottement, ces cinq-là
deviennent lisibles instantanément.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `geste-coup.mp3` *(existe)* | 0,3 s | `A closed fist hitting a thick phone book, dull thud with a paper crumple layered on the impact, close-miked handmade foley, dry room` | Coup donné |
| `geste-coup-fort.mp3` *(existe)* | 0,45 s | `A fist hitting a stack of paper followed 30ms later by a wooden slat slapping a wall, two layers, close-miked handmade foley, dry room` | Coup critique |
| `geste-encaisse.mp3` *(existe)* | 0,4 s | `A wooden crate kicked hard, recorded from inside the crate, boomy and enveloping, with a short breath through the nose underneath, close-miked handmade foley` | Coup reçu. **Le son vient d'autour, pas de devant** |
| `geste-pas.mp3` *(existe)* | 0,2 s | `One footstep on wet gravel, single step, close-miked handmade foley, dry room` | Un pas |
| `moment-ko.mp3` *(existe)* | 0,9 s | `A body-sized cardboard box collapsing flat onto a tiled floor, one heavy soft impact, close-miked handmade foley, no reverb` | Mise hors combat |

---

# ④ LES AUTRES (4)

Quatre sons dans toute la partie. Ils doivent être reconnaissables du premier
coup — c'est le seul lien social du jeu.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `social-partage.mp3` | 0,7 s | `A crusty bread loaf torn in half by hand, crust cracking then crumb tearing, close-miked handmade foley, dry room` | Partager à manger. **Le geste le plus digne du jeu** — le son doit être généreux |
| `moment-poignee-main.mp3` *(existe)* | 0,6 s | `Two dry hands clapping together once then gripping, with sleeve fabric rustling, close-miked handmade foley, dry room` | Serrer la main, conclure un troc |
| `social-econduit.mp3` | 0,8 s | `Three footsteps walking away on gravel, cut off abruptly on the third, close-miked handmade foley, dry room` | On vous éconduit, ou vous passez votre chemin |
| `geste-troc.mp3` *(existe)* | 0,5 s | `An object passed from one hand to another over a cardboard surface, brief slide and settle, close-miked handmade foley` | Troquer un objet |

---

# ⑤ LA PERTE (5)

L'échelle. **Plus la perte est irréversible, plus le son est mou** : l'échec
léger claque, l'échec grave s'affaisse.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `perte-rate.mp3` | 0,25 s | `A rubber band snapping loose with nothing at the end of it, short dry twang, close-miked handmade foley` | **Degré 1** — le raté sans conséquence. Entendu cent fois par partie : ne doit jamais faire sursauter |
| `moment-attrape.mp3` *(existe)* | 0,5 s | `A metal chair scraped once across a tiled floor behind you, single sharp drag, close-miked handmade foley, dry room` | **Degré 2** — repéré. Le moment où quelqu'un a levé la tête |
| `moment-craquement.mp3` *(existe)* | 1,4 s | `A stack of empty cardboard boxes toppling onto a tiled floor, ending with one box rolling two turns and stopping, single take, close-miked handmade foley` | **Degré 3** — l'écroulement. **Le petit rebond final fait toute la blague** |
| `perte-dignite.mp3` | 0,9 s | `Packing tape peeled slowly off damp cardboard, tearing the top layer away with it, soft and gritty, no snap, close-miked handmade foley` | **Degré 4** — l'humiliation. Aucun impact, que de l'arrachement. Le son le plus important du jeu |
| `perte-palier.mp3` | 1,3 s | `Damp cardboard tearing then a layer giving way at once, followed by a faint metallic object hitting the ground far behind, close-miked handmade foley, dry room` | **Degré 5** — un palier de Dignité franchi. Jamais joué autrement : c'est la signature de la chute |

---

# ⑥ L'IDENTITÉ (8)

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `moment-choix-perso.mp3` | 0,5 s | `A stiff ID photograph placed flat on a formica table, single dry slap, close-miked handmade foley, dry room` | Choisir son personnage. Le geste de l'état civil : sec, définitif |
| `moment-relance.mp3` | 0,8 s | `Three thick cardboard cards shuffled clumsily by hand, close-miked handmade foley, dry room` | Relancer le trio de personnages |
| `moment-legs.mp3` | 1,2 s | `An object slid into a kraft paper envelope, then the flap licked and pressed shut, close-miked handmade foley, dry room` | Choisir ce qu'on lègue au suivant |
| `moment-page.mp3` | 0,6 s | `A folded sheet of paper unfolded once and smoothed flat with the palm, dry paper friction, close-miked handmade foley, dry room` | L'histoire du personnage s'ouvre, une page de texte apparaît. **Doit passer inaperçu** : c'est le son de la lecture qui commence |
| `moment-registre.mp3` | 0,7 s | `A lever arch file binder snapped open, metal mechanism clacking, close-miked handmade foley, dry room` | Ouvrir le Registre ou le Cimetière |
| `moment-fin-inedite.mp3` | 0,9 s | `A rubber stamp pressed hard onto paper on a wooden desk, single firm hit, close-miked handmade foley, dry room` | Une fin de mort découverte. Le son de la collection qui avance |
| `moment-mort.mp3` *(existe)* | 1,6 s | `A large cardboard box slowly collapsing in on itself, no crash, ending in complete silence, close-miked handmade foley, dry room, no music` | La mort. **Un son trop petit pour l'événement** — c'est là qu'est la comédie noire |
| `moment-sacre.mp3` *(existe)* | 1,8 s | `A cardboard crown set on a head, then a broom handle tapped twice on a concrete floor like a sceptre, close-miked handmade foley, dry room` | Sacré Roi du Carton |

---

# ⑦ LE RYTHME DU JOUR (6)

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `moment-reveil.mp3` | 1,0 s | `A coarse woollen blanket pushed off, fabric dragging, followed by one long breath in through the nose, close-miked handmade foley, dry room` | Le réveil, à l'ouverture du bilan de nuit |
| `moment-jour-nouveau.mp3` *(existe)* | 2,0 s | `A plastic tarp pulled aside in one motion, then two sparrows and a distant metal shop shutter rolling up, close-miked handmade foley, light outdoor space` | Le jour nouveau. **Le seul son du jeu qui a le droit d'être large** |
| `moment-resultat-bon.mp3` | 0,6 s | `A cardboard flap pushed shut and a hand patting it flat twice, satisfied and quiet, close-miked handmade foley, dry room` | Un événement tourne bien. Le pendant exact de `perte-rate` : **même petitesse, sens inverse**. Surtout pas une fanfare |
| `moment-victoire.mp3` *(existe)* | 1,2 s | `Two palms slapped together once in triumph, then a cardboard box kicked lightly aside, close-miked handmade foley, dry room` | Victoire en combat |
| `geste-gong.mp3` *(existe)* | 0,7 s | `A dented metal bin lid struck once with a stick, dull cracked ring, close-miked handmade foley, dry room` | Début de combat. **Un métal creux et fêlé, jamais un gong de studio** |
| `moment-souvenir.mp3` *(existe)* | 1,4 s | `An old photograph slid out from between paper pages, slow paper friction, close-miked handmade foley, dry room` | Un souvenir, un fantôme du cimetière |

---

# ⑧ L'INTERFACE (6)

Elle doit disparaître. **Que du carton manipulé.** Et surtout pas le même clic
pour toucher « Voler » et pour changer d'onglet — c'est le défaut actuel.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `geste-clic.mp3` *(existe)* | 0,12 s | `A fingernail pushing a corrugated cardboard flap until the flute clicks, very close-miked, dry, no reverb` | Toucher une action. **Le son le plus entendu du jeu** — livrer 3 variantes |
| `geste-retour.mp3` | 0,2 s | `A cardboard card dropped back onto a stack, low and soft, close-miked handmade foley, dry room` | Retour, fermer. Plus grave que le clic d'action |
| `geste-onglet.mp3` | 0,15 s | `A stiff paper tab flicked with a fingernail, single light tick, close-miked handmade foley, dry` | Changer d'onglet, sélectionner sur la carte |
| `geste-reglage.mp3` | 0,2 s | `A metal toggle switch on an electrical panel flipped once, dry mechanical clack, close-miked, no reverb` | Basculer un réglage |
| `geste-carte.mp3` | 0,15 s | `A cardboard card slid across a wooden table and stopped, short dry slide, close-miked handmade foley` | Changement d'écran. **Remplace le « woosh »**, qui disparaît du jeu |
| `geste-succes.mp3` *(existe)* | 0,25 s | `A desk stapler pressed once, single sharp mechanical punch, close-miked, dry room` | Succès débloqué. Un coup, net, et c'est tout |

---

# ⑨ LES JAUGES (2)

Le jeu demande de surveiller six jauges et n'en signale aucune à l'oreille.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `jauge-rouge.mp3` | 0,6 s | `A rubber band stretched slowly until it creaks under tension, single creak, close-miked handmade foley, dry room` | Une jauge passe sous 25. **Ne se rejoue pas tant qu'on n'est pas remonté** — sinon c'est une alarme, et on coupe le son |
| `jauge-remplie.mp3` | 0,7 s | `A long gulp drunk from a plastic bottle, ending with the bottle popping back into shape, close-miked handmade foley, dry room` | Manger, boire, se soigner |

---

## Les cinq sons qui disparaissent

Le jeu compte aujourd'hui 25 sons. Vingt sont repris ci-dessus sous leur nom
actuel. **Les cinq derniers sont supprimés**, leur rôle étant repris par un son
plus précis — rien à générer pour eux, c'est du travail de code :

| Son actuel | Ce qui le remplace | Pourquoi |
|---|---|---|
| `geste-souffle` (« woosh ») | `geste-carte` en interface, `moment-trajet` au voyage | Un souffle de synthé dans un jeu en carton : c'est le son le plus faux du lot |
| `geste-echec` | `perte-rate` | Même rôle, mais rangé dans l'échelle de la perte au lieu de flotter seul |
| `geste-reussite` | `moment-resultat-bon` (événement), `jauge-remplie` (utiliser un objet) | Un seul son servait deux choses très différentes |
| `geste-papier` | `moment-page` | Le nom restait, l'intention se précise |
| `moment-porte-claque` | `social-econduit` | La négociation qui échoue, c'est quelqu'un qui s'en va — pas une porte |

---

## Variantes

Les huit sons ci-dessous sont entendus des dizaines de fois par partie. Sans
variantes, ils deviennent un métronome. **Générer 3 versions de chacun**,
nommées `-1`, `-2`, `-3` (ex. `geste-clic-1.mp3`) :

`geste-clic` · `geste-pas` · `geste-coup` · `geste-fouille` ·
`argent-piece-entree` · `perte-rate` · `geste-onglet` · `geste-carte`

Total livrable : **49 sons + 16 fichiers de variante = 65 fichiers.**

---

## Contrôle avant livraison

1. **Mono**, 48 kHz, −16 LUFS, crête à −1 dBTP.
2. Silence de tête **sous 10 ms**.
3. Aucune réverbération ajoutée, aucun traitement « cinéma ».
4. Écouter chaque son **sur un haut-parleur de téléphone**, pas au casque : la
   moitié des défauts ne s'entendent que là.
5. Vérifier qu'aucun son ne dure plus longtemps que sa durée cible : dans un
   jeu où l'on touche l'écran trois fois par seconde, un son de 2 secondes se
   superpose au suivant.

## Livraison

Un dossier `audio/` contenant les 65 fichiers `.mp3`, **noms exacts de ce
document**. Les fichiers marqués *(existe)* remplacent les actuels sans autre
changement ; les 29 nouveaux seront branchés côté code à l'intégration.
