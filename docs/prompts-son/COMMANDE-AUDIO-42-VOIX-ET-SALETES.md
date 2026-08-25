# Commande audio — « Le Roi du Carton » — 42 sons : la voix et les saletés

**Ce document est la commande complète. Tout ce qu'il faut est dedans : aucun
autre fichier n'est nécessaire.**

---

## Le jeu

Roguelite de survie mobile, comédie noire. On y joue quelqu'un qui dort dehors
et qui essaie de tenir un jour de plus. Direction artistique : **dioramas en
carton kraft photographiés** — les voitures sont en carton, les pigeons sont en
carton, la ville entière tient sur une table d'atelier.

Les lots précédents ont posé toute la bande-son en **bruitage de carton** : la
pluie est du riz sur du papier tendu, un train est une brosse sur du carton
ondulé, des pas sont des doigts sur une boîte à chaussures. **Cette règle-là ne
change pas** et elle vaut encore pour les huit derniers sons de ce lot.

---

# Ce lot fait une exception, et c'est tout son sujet

Les trente-quatre premiers sons de cette commande sont **des sons qui sortent
d'un corps humain**. C'est la première fois dans ce jeu, et c'est délibéré.

Le carton dit très bien les objets, les lieux et les gestes. Il ne sait pas
dire **la grimace de celui qui vient de se couper**, ni le haut-le-cœur devant
ce qu'on vient de sortir d'une poubelle, ni le grognement de quelqu'un qu'on
retient par la manche depuis trop longtemps. Aucun froissement de papier ne
remplace ça, et le jeu en avait besoin : c'est un jeu sur un corps qui tient
debout de moins en moins bien.

## Les quatre règles de ce lot

### ① AUCUN MOT. JAMAIS. DANS AUCUNE LANGUE.

Ce sont des **souffles, des sifflements entre les dents, des grognements, des
inspirations**. Pas un mot, pas une syllabe reconnaissable, même marmonnée.

Trois raisons, et elles sont toutes rédhibitoires : le jeu existe en français
et en anglais et ne doublera pas ses voix ; un mot enregistré s'use en trois
écoutes alors que ces sons se rejouent des dizaines de fois par partie ; et un
« aïe » articulé casserait le carton d'un coup. Un « tsss » entre les dents ne
se traduit pas — c'est exactement pour ça qu'il tient.

### ② PETIT. TRÈS PETIT.

On ne joue pas un héros d'action qui encaisse un coup d'épée. On joue quelqu'un
qui **se retient de faire du bruit** parce qu'il est dans la rue et qu'on le
regarde. La performance juste est **rentrée, courte, presque gênée**.

Un cri de douleur de jeu vidéo serait le pire résultat possible ici. La
référence, c'est quelqu'un qui se pince le doigt dans une porte **au bureau** :
il ne crie pas, il inspire vite et il se tait.

### ③ DEUX TIMBRES, VRAIMENT DEUX PERSONNES

Chaque son existe en version `h` (homme) et `f` (femme), parce que le
personnage est tiré au sort à chaque partie. Il faut **deux interprètes
différents**, pas un seul traité au pitch : une voix transposée s'entend
immédiatement et donnerait l'impression d'un bug.

Les deux ne doivent pas jouer la même chose plus grave ou plus aiguë. Ce sont
deux personnes différentes qui réagissent à leur manière — l'une souffle,
l'autre siffle entre ses dents. C'est ce qui rendra deux parties différentes.

### ④ LA COMÉDIE EST DANS LA RETENUE

C'est une comédie noire. Le rire ne vient jamais d'une exagération, il vient de
la **disproportion entre ce qui arrive et la petitesse de la réaction**. Un
haut-le-cœur poli devant un yaourt devenu autonome est drôle ; un vomissement
appuyé ne l'est pas, il est juste désagréable.

---

## Réglages de sortie

| | |
|---|---|
| Format | **MP3, mono, 48 kHz, 40 kbit/s** |
| Durée | **0,3 s à 1,2 s** — ce sont des réactions, pas des performances |
| Niveau | normalisé sur la partie sonnante, crête à **−1,5 dB** |
| Silence de tête | **moins de 10 ms** — le son doit tomber pile sur le geste |
| Noms de fichiers | **exactement** ceux des tableaux, à la lettre près |
| Dépôt | `client/public/assets/audio/` |

**Suffixe de style à ajouter à la fin de CHAQUE prompt de voix :**

```
Close-miked human non-verbal vocalisation, dry room, no reverb, no music, no
words in any language, restrained and quiet, lo-fi domestic recording.
```

**Et pour les huit sons de saleté (partie D), le suffixe des lots précédents :**

```
Close-miked handmade foley, dry room, no reverb, no music, no digital
processing, cardboard and paper materials, lo-fi domestic recording.
```

---

# PARTIE A — La tête qui lâche (4 sons)

Le Mental est la jauge la plus abstraite du jeu. Depuis peu, quand il tombe
bas, **le texte des rencontres se met à se brouiller** : les mots se mélangent
sous les yeux du joueur, de plus en plus, jusqu'à devenir du charabia.

Le problème : sans un son, **ça passe pour un bug d'affichage**. Ces quatre
prises sont ce qui dit au joueur « ce n'est pas le jeu qui déraille, c'est
votre tête », et donc ce qui lui fait comprendre qu'il doit aller dormir.

| Fichier | Prompt |
|---|---|
| `voix-h-tete-1` | A man's shallow, slightly panicked breathing, three quick inhales through the nose, very quiet, as if trying not to be noticed. Underneath, an extremely faint high-pitched tinnitus tone that fades in and out. |
| `voix-h-tete-2` | A man swallowing dryly, then one long unsteady exhale that catches halfway through. Faint low ringing underneath. Exhausted, not dramatic. |
| `voix-f-tete-1` | A woman's shallow, slightly panicked breathing, three quick inhales through the nose, very quiet, as if trying not to be noticed. Underneath, an extremely faint high-pitched tinnitus tone that fades in and out. |
| `voix-f-tete-2` | A woman swallowing dryly, then one long unsteady exhale that catches halfway through. Faint low ringing underneath. Exhausted, not dramatic. |

⚠️ **Ces quatre-là sont les plus importants du lot.** Ils se déclenchent quand
le personnage est à deux doigts de mourir de sa tête, et c'est le seul
avertissement qu'il reçoit.

---

# PARTIE B — Ce que le corps répond (18 sons)

Trois réactions, trois prises chacune, deux timbres. Les trois prises servent à
casser la répétition : **elles doivent être audiblement différentes entre
elles**, pas trois fois la même avec un léger décalage.

## B1 · La douleur (6) — on se coupe, une guêpe pique, un coup passe

Bref, rentré, **jamais un cri**. Le son de quelqu'un qui se fait mal et qui
préfère que ça ne se voie pas.

| Fichier | Prompt |
|---|---|
| `voix-h-douleur-1` | A man's sharp inhale through clenched teeth, a short "tsss", cut off immediately. |
| `voix-h-douleur-2` | A short low grunt from a man, mouth closed, more surprise than pain, followed by a quick breath out. |
| `voix-h-douleur-3` | A man's quiet hiss through the nose, one syllable of held-back sound, then silence. |
| `voix-f-douleur-1` | A woman's sharp inhale through clenched teeth, a short "tsss", cut off immediately. |
| `voix-f-douleur-2` | A short low grunt from a woman, mouth closed, more surprise than pain, followed by a quick breath out. |
| `voix-f-douleur-3` | A woman's quiet hiss through the nose, one syllable of held-back sound, then silence. |

## B2 · Le dégoût (6) — ce qu'on vient de sortir du tas

Le haut-le-cœur, **pas le vomissement**. Une personne polie qui vient de mettre
la main dans quelque chose de tiède et de mou, et qui se retient parce qu'il y
a du monde autour.

| Fichier | Prompt |
|---|---|
| `voix-h-degout-1` | A man's disgusted exhale through the nose, short, mouth closed, one small involuntary throat sound. |
| `voix-h-degout-2` | A man's suppressed gag, one beat only, immediately swallowed back down. Not a retch. |
| `voix-h-degout-3` | A man breathing out sharply through pursed lips, turning his head away, a small "hff" of revulsion. |
| `voix-f-degout-1` | A woman's disgusted exhale through the nose, short, mouth closed, one small involuntary throat sound. |
| `voix-f-degout-2` | A woman's suppressed gag, one beat only, immediately swallowed back down. Not a retch. |
| `voix-f-degout-3` | A woman breathing out sharply through pursed lips, turning her head away, a small "hff" of revulsion. |

## B3 · L'effort (6) — le souffle qui sort tout seul en frappant

Se déclenche sur les **gros coups** en combat, pas sur tous. C'est l'expiration
involontaire de quelqu'un qui met du poids dans un geste.

| Fichier | Prompt |
|---|---|
| `voix-h-effort-1` | A man's short explosive breath out through the mouth as he swings, a plain "hnn", no vowel. |
| `voix-h-effort-2` | A man's low compressed grunt of exertion, mouth closed, half a second. |
| `voix-h-effort-3` | A man forcing air out through the nose in one hard push, the sound of lifting something heavy. |
| `voix-f-effort-1` | A woman's short explosive breath out through the mouth as she swings, a plain "hnn", no vowel. |
| `voix-f-effort-2` | A woman's low compressed grunt of exertion, mouth closed, half a second. |
| `voix-f-effort-3` | A woman forcing air out through the nose in one hard push, the sound of lifting something heavy. |

---

# PARTIE C — Les passants qu'on retient (12 sons)

Le mini-jeu de la manche a **une seule vraie décision** : lâcher quelqu'un, ou
continuer à le retenir. Continuer rapporte davantage et coûte de la dignité —
et jusqu'ici cette bascule ne s'entendait pas du tout.

Ces douze prises sont la voix **du passant**, pas du personnage joué. C'est la
seule voix du jeu qui ne suit pas le joueur : la rue est pleine de gens, et
ils n'ont pas tous le même timbre.

## C1 · L'agacement (6) — pendant qu'on le retient

Se rejoue **toutes les 0,9 seconde** tant que le joueur insiste. Ce sont donc
les sons les plus répétés du lot, et le piège est là : **au troisième
enchaînement, ils doivent encore être supportables**. Rien de théâtral, rien
qui monte. Quelqu'un qui voudrait juste s'en aller.

| Fichier | Prompt |
|---|---|
| `passant-h-agace-1` | A man's short irritated sigh through the nose, the sound of someone who wants to leave. |
| `passant-h-agace-2` | A man clicking his tongue once, dismissive, followed by a small exhale. |
| `passant-h-agace-3` | A man's low uncomfortable throat-clear, embarrassed rather than angry. |
| `passant-f-agace-1` | A woman's short irritated sigh through the nose, the sound of someone who wants to leave. |
| `passant-f-agace-2` | A woman clicking her tongue once, dismissive, followed by a small exhale. |
| `passant-f-agace-3` | A woman's low uncomfortable throat-clear, embarrassed rather than angry. |

## C2 · Le refus (6) — sa patience est finie

Une seule fois, quand le passant se braque et s'en va — ou se retourne pour
cogner. Plus net que l'agacement, **mais toujours sans un mot** : le jeu écrit
« Lâchez-moi ! » à l'écran, le son ne doit pas le dire aussi.

| Fichier | Prompt |
|---|---|
| `passant-h-refus-1` | A man's sharp annoyed exhale, abrupt, the sound of someone pulling their arm away. |
| `passant-h-refus-2` | A man's short guttural sound of refusal, mouth closed, one beat, final. |
| `passant-h-refus-3` | A man's loud impatient tut followed by a hard breath out through the nose. |
| `passant-f-refus-1` | A woman's sharp annoyed exhale, abrupt, the sound of someone pulling their arm away. |
| `passant-f-refus-2` | A woman's short guttural sound of refusal, mouth closed, one beat, final. |
| `passant-f-refus-3` | A woman's loud impatient tut followed by a hard breath out through the nose. |

---

# PARTIE D — Ce qu'on réveille au fond du tas (8 sons)

⚠️ **Ces huit-là repassent en carton.** Ce sont des objets et des bêtes, pas
des gens : le suffixe de style à utiliser est celui du bruitage, pas celui des
voix.

Le mini-jeu de la Récup' cache six saletés sous les détritus. Elles sonnaient
**toutes pareil** — un coup encaissé, alors que personne ne vous frappe. Un rat
qui détale et un yaourt devenu autonome ne font pas le même bruit, et surtout
ils ne font pas le même effet : l'un fait sursauter, l'autre soulève le cœur.

Le joueur a le doigt sur la grille et l'œil sur la case qu'il vient d'ouvrir.
**L'oreille est le canal le plus rapide pour lui dire ce qu'il a touché.**

| Fichier | Ce que c'est | Prompt |
|---|---|---|
| `recup-rat-1` | 🐀 il détale | Small fast claws scrabbling across corrugated cardboard, away from the mic, then a thin sheet of metal wobbling once. Startling, over in half a second. |
| `recup-rat-2` | 🐀 il détale | Quick scurrying of tiny feet over crumpled paper, a light metallic can tipping over and rolling briefly. |
| `recup-rat-3` | 🐀 il détale | A sudden rustle deep inside a pile of paper, then something small knocking against a tin lid. |
| `recup-guepes` | 🐝 le nid, occupé | A low buzzing that swells sharply from nothing in a quarter of a second, dozens of paper-dry wings, then stays. Made with a comb against stiff paper. |
| `recup-verre` | 🔪 le tesson | A single sharp glass crack under pressure, close and dry, followed by two small fragments settling. No shattering, no long tail. |
| `recup-pourri-1` | 🐟 🩲 🦠 mou et tiède | A wet squelch of something soft giving way under a hand, close-miked. Made with a damp sponge in a plastic bag. Short and horrible. |
| `recup-pourri-2` | 🐟 🩲 🦠 mou et tiède | A thick sucking sound as something is pulled out of something else, wet paper peeling off wet paper. |
| `recup-pourri-3` | 🐟 🩲 🦠 mou et tiède | A soft heavy sludge shifting, a low wet slump, one small bubble popping at the end. |

⚠️ **`recup-guepes` est le seul son de tout le jeu qui a le droit de faire
sursauter.** Tous les autres — y compris le rat — doivent inquiéter sans
provoquer de sursaut : un joueur qui sursaute lâche le téléphone et perd pour
la mauvaise raison.

---

# Récapitulatif

| Partie | Sons | Ce que ça débloque |
|---|---|---|
| A — la tête qui lâche | 4 | Le brouillage du texte cesse de passer pour un bug |
| B — ce que le corps répond | 18 | Se couper, se dégoûter, forcer : trois réactions × 2 timbres |
| C — les passants | 12 | La seule décision de la manche s'entend enfin |
| D — les saletés | 8 | Six pièges qui sonnaient tous pareil |
| **Total** | **42** | |

# Livraison attendue

1. **42 fichiers MP3**, nommés exactement comme dans les tableaux.
2. Confirmation qu'**aucun fichier ne contient de mot, dans aucune langue**.
3. Confirmation que **deux interprètes différents** ont enregistré les voix
   `h` et `f` — et non un seul transposé.
4. ⚠️ **La licence d'usage commercial** de l'outil ou de la banque employée,
   nommément. Le jeu est monétisé par la publicité : une licence non
   commerciale rendrait le lot inutilisable.

## Ce qui se passe si un son manque

Rien de grave, et c'est voulu :

- les **saletés** retombent sur le son de coup encaissé qu'elles avaient déjà ;
- la **tête qui lâche** retombe sur l'alerte de jauge générique ;
- le **refus d'un passant** retombe sur le son d'échec du jeu ;
- l'**agacement**, la **douleur**, le **dégoût** et l'**effort** ne jouent rien
  du tout — une voix humaine fabriquée à l'oscillateur ne ressemblerait à rien
  d'autre qu'à une erreur, et le geste qui les accompagne a déjà son son.

On peut donc livrer les 42 d'un coup, partie par partie, ou fichier par
fichier — **chacun s'active tout seul à l'arrivée**, sans rien changer au code.

## Dans quel ordre livrer, si le lot doit être découpé

1. **Partie A** (4) — la mécanique la plus récente et la moins lisible.
2. **Partie D** (8) — huit fichiers, et six pièges qui redeviennent distincts.
3. **Partie C** (12) — la manche est le mini-jeu le plus joué.
4. **Partie B** (18) — le plus gros volume, et celui qui supporte le mieux
   l'attente : le jeu reste parfaitement jouable sans lui.
