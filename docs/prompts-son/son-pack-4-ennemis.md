# Pack son 4 — Le cri de chaque ennemi (27 fichiers)

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

# 🎯 Ce pack : un cri par ennemi

Le jeu a **27 adversaires**, et aujourd'hui ils partagent cinq cris synthétisés
selon leur famille : tous les oiseaux crient pareil, toutes les brutes grognent
pareil. On veut le contraire : **chaque ennemi doit avoir SON cri**, et on doit
savoir qui vient d'apparaître sans regarder l'écran.

Le cri se déclenche **à l'apparition de l'ennemi**, une fois, juste avant que
le combat commence.

## Règles communes aux 27 fichiers

- **Durée : 0,5 à 1,2 seconde.** Court. C'est une entrée en scène, pas un solo.
- **Mono**, aucun silence en tête.
- Niveau **−16 LUFS**, crête −6 dBFS.
- **Le test qui décide de tout :** joue les 27 à la suite, les yeux fermés. Si
  deux se confondent, l'un des deux est à refaire.
- **Toujours en carton** (voir la direction sonore) : bouche, papier, boîtes.
  Un vrai enregistrement animalier de documentaire sonnerait faux à côté du
  reste — trop propre, trop grand, trop loin.
- **Comique avant tout.** Ces bestioles sont ridicules et le jeu en rit avec
  tendresse. Un cri terrifiant est hors sujet, même réussi.

## ⚠️ Le point le plus important : les humains

Onze des vingt-sept adversaires sont des êtres humains. Pour eux on veut **une
vraie voix** — quelqu'un qui gueule, qui grogne, qui ricane — mais **aucun mot
compréhensible**. Le jeu est bilingue français/anglais : un mot articulé
casserait la traduction. Des onomatopées, du souffle, de la gorge. Un « hé ! »
ou un « oh ! » passent ; une phrase, jamais.

Et ils doivent être **franchement différents entre eux** : le commerçant qu'on
vient de voler ne crie pas comme le videur de cent kilos, qui ne crie pas comme
l'ivrogne, qui ne crie pas comme l'autre sans-abri qui veut votre coin de
trottoir. C'est là que le pack se joue.

---

## A. Les seize bêtes

| Fichier | Qui | Ce qu'on doit entendre |
|---|---|---|
| `cry-ecureuil-enrage.wav` | 🐿️ **Écureuil Enragé** — *Petit, rapide, et il veut vos noisettes. Vous avez pas de noisettes.* | Un crissement suraigu et hystérique, très court, suivi d'un grattement de griffes. Ridicule et menaçant à la fois. |
| `cry-pigeon-alpha.wav` | 🐦 **Pigeon Alpha** — *Le chef du gang de pigeons. Il roucoule avec menace.* | Un roucoulement grave et lent — celui d'un chef —, puis un battement d'ailes sec. Il ne fuit pas, il s'avance. |
| `cry-chat-de-gouttiere.wav` | 🐱 **Chat de Gouttière** — *Petit mais vicieux. Ses griffes sont des rasoirs.* | Un feulement bref, cassé, qui monte. Le cri d'un petit qui sait qu'il est petit. |
| `cry-canard-psychopathe.wav` | 🦆 **Canard Psychopathe** — *Coin coin... COIN COIN ! Il charge !* | Deux « coin » posés et normaux, puis un troisième complètement dérangé. Le gag est dans le troisième. |
| `cry-mouette-furibonde.wav` | 🦅 **Mouette Furibonde** — *Elle veut votre sandwich. Elle aura votre sandwich.* | Un criaillement de mouette qui descend, insistant, avec un souffle d'ailes. Elle a déjà décidé. |
| `cry-chat-territorial.wav` | 😾 **Chat Territorial** — *Ce coin est à LUI. Et il va vous le prouver.* | Un miaulement long et grave qui se termine en grognement. Un avertissement, pas une plainte. |
| `cry-oie-territoriale.wav` | 🪿 **Oie Territoriale** — *HONK. Elle défend son territoire avec une rage ancestrale.* | Un HONK. Un seul, énorme, avec un sifflement de bec derrière. Le plus fort du pack. |
| `cry-corbeau-geant.wav` | 🐦‍⬛ **Corbeau Géant** — *Noir comme la nuit, méchant comme le jour.* | Trois croassements graves et espacés, avec beaucoup de réverbération. Solennel et sinistre. |
| `cry-chat-sauvage.wav` | 🐈 **Chat Sauvage** — *Pas de collier, pas de maître, pas de pitié.* | Un crachement sec, sans miaulement du tout. Direct, sans négociation. |
| `cry-rat-geant.wav` | 🐀 **Rat Géant** — *Un rat de la taille d'un chihuahua. Il n'a pas peur.* | Un couinement grave — trop grave pour un rat de cette taille — et des griffes sur du métal. |
| `cry-coq-de-combat.wav` | 🐓 **Coq de Combat** — *Réveillé à 4h du matin. Et il est furieux.* | Un cocorico agressif, coupé net à la fin, comme un cri de guerre. Pas un réveil de ferme. |
| `cry-cygne-furieux.wav` | 🦢 **Cygne Furieux** — *Élégant mais mortel. Ne jamais sous-estimer un cygne.* | Un sifflement long, serpentin, et un grand battement d'ailes. Élégant et absolument terrifiant. |
| `cry-mouette-geante.wav` | 🦅 **Mouette Géante** — *La mère de toutes les mouettes. Envergure impressionnante.* | La mouette furibonde, mais une octave plus bas et deux fois plus long. On sent l'envergure. |
| `cry-raton-laveur.wav` | 🦝 **Raton Laveur** — *Il fouille VOTRE poubelle. L'affront.* | Un gazouillis-grognement nasal, curieux et vexé, et un couvercle de poubelle qui bascule. |
| `cry-chien-errant.wav` | 🐕 **Chien Errant** — *Un molosse sans collier. Ses crocs brillent au clair de lune.* | Deux aboiements rauques et un grondement de gorge qui reste. Sans collier, sans maître. |
| `cry-raton-laveur-alpha.wav` | 🦝 **Raton Laveur Alpha** — *Le boss des ratons. Il porte un masque naturel de bandit.* | Le raton, mais plus grave, plus posé, et suivi d'un silence. C'est lui le chef, il n'insiste pas. |

## B. Les onze humains

Ceux-là sont le cœur de la demande : **une vraie voix humaine**, mais
**jamais un mot**. Un grognement, un cri, un rire, un souffle, un raclement
de gorge. Le jeu existe en français et en anglais : le moindre mot
reconnaissable casserait la traduction. Un « hé ! » ou un « oh ! » passent,
une phrase non.

Et surtout : **ils doivent tous sonner différemment les uns des autres**.
Âge, corpulence, état d'esprit — on doit reconnaître lequel arrive les yeux
fermés. C'est le seul critère qui compte.

| Fichier | Qui | Ce qu'on doit entendre |
|---|---|---|
| `cry-pickpocket.wav` | 🤏 **Pickpocket** — *Il veut vos poches. Vous n'avez que des poches.* | Un petit rire aigu, complice, presque amical — puis un souffle rapide en s'éloignant. Il ne veut pas se battre, il veut vos poches. |
| `cry-clown-sinistre.wav` | 🤡 **Clown Sinistre** — *Son rire résonne dans la nuit. Personne ne rit avec lui.* | Un rire. LE rire. Trois notes descendantes, très lentes, avec un pouet de nez à la fin qui arrive une seconde trop tard. |
| `cry-commercant-furieux.wav` | 😡 **Commerçant Furieux** — *Il vous a pris la main dans le sac. Et il a de la poigne.* | Un cri d'indignation étranglé, aigu — quelqu'un qu'on vient de voler et qui n'y croit pas. Un « hé » sans être un mot. Beaucoup de souffle. |
| `cry-agent-de-securite.wav` | 👮 **Agent de Sécurité** — *Il fait du zèle. Beaucoup de zèle.* | Une inspiration autoritaire et un grognement de gorge sec, très maîtrisé. Il ne crie pas, il sait qu'il a raison. |
| `cry-ivrogne-agressif.wav` | 🍺 **Ivrogne Agressif** — *Il titube mais frappe fort. Très fort.* | Un beuglement pâteux, qui part trop haut, dérape, et se termine en toux. Un tintement de bouteille juste avant. |
| `cry-vigile-zele.wav` | 🔦 **Vigile Zélé** — *Badge, lampe torche, ego surdimensionné.* | Un raclement de gorge et un grognement bref, monté d'un cran de trop. Il en fait un peu beaucoup. |
| `cry-concurrent-agressif.wav` | 💢 **Concurrent Agressif** — *Un autre sans-abri qui veut votre coin. La rue est petite.* | Un cri fatigué, sans conviction, presque triste. C'est un autre sans-abri : il ne veut pas se battre non plus. Le seul cri du pack qui doit serrer un peu le cœur. |
| `cry-voyou-du-coin.wav` | 🧔 **Voyou du Coin** — *Un type louche qui veut votre spot. Négociation impossible.* | Un claquement de langue méprisant, puis un grognement bas. Détendu, sûr de lui. |
| `cry-squatteur-territorial.wav` | 😠 **Squatteur Territorial** — *Ce hangar est à lui. Il l'a décidé tout seul.* | Un rugissement enroué et long, la voix de quelqu'un qui n'a pas parlé depuis trois jours. |
| `cry-vigile-de-choc.wav` | 🦺 **Vigile de Choc** — *Ancien videur, actuel mur. Il ne court pas : il n'en a pas besoin.* | Le plus grave et le plus court : une seule expiration de gorge, comme un mur qui se racle. Puis rien. Il ne court pas, il n'en a pas besoin. |
| `cry-le-roi-dechu.wav` | 👑 **Le Roi Déchu** — *Le précédent Roi du Carton. Il n'a jamais rendu la couronne.* | Le boss. Un rire royal et cassé, deux notes, qui se termine en quinte de toux — puis un tintement de couronne en carton qui s'ajuste. Grandiose et pitoyable, c'est tout le jeu en une seconde. |

---

## Récapitulatif des noms de fichiers

```
cry-ecureuil-enrage.wav
cry-pigeon-alpha.wav
cry-chat-de-gouttiere.wav
cry-canard-psychopathe.wav
cry-mouette-furibonde.wav
cry-chat-territorial.wav
cry-oie-territoriale.wav
cry-corbeau-geant.wav
cry-chat-sauvage.wav
cry-rat-geant.wav
cry-coq-de-combat.wav
cry-cygne-furieux.wav
cry-mouette-geante.wav
cry-raton-laveur.wav
cry-chien-errant.wav
cry-raton-laveur-alpha.wav
cry-pickpocket.wav
cry-clown-sinistre.wav
cry-commercant-furieux.wav
cry-agent-de-securite.wav
cry-ivrogne-agressif.wav
cry-vigile-zele.wav
cry-concurrent-agressif.wav
cry-voyou-du-coin.wav
cry-squatteur-territorial.wav
cry-vigile-de-choc.wav
cry-le-roi-dechu.wav
```

**27 fichiers.** Livraison en un ZIP contenant un dossier `sons/`.

---

## Note sur le Roi

`cry-le-roi-dechu.wav` sert aussi pour un cas particulier : quand le joueur a
été sacré Roi du Carton dans une partie précédente et qu'il est mort, **son
ancien personnage devient le boss** des parties suivantes. Ce roi hérité porte
le nom du personnage mort, mais il réutilise ce cri. Un seul fichier suffit.

## Et plus tard, peut-être

Si ce pack fonctionne, la suite naturelle serait un **deuxième cri par ennemi**,
joué au moment où il frappe (un cri d'effort, plus court, 0,3 s). Mais on ne le
demande pas maintenant : mieux vaut vingt-sept cris d'entrée réussis que
cinquante-quatre bâclés.
