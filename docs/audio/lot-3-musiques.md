# Troisième lot — les musiques
## Une mort, six mini-jeux

---

## Pourquoi refaire les six lits de mini-jeu

Ils existent déjà. Je les ai mesurés avant de proposer de les remplacer, et
voici ce que ça donne :

| | |
|---|---|
| Durée | **36,0 s** — les six, à la décimale près |
| Poids | **422 ko** — les six, à l'octet près |
| Profil spectral | écart de **0,13 à 0,79 dB** entre voisins, sur huit bandes |
| Corrélation croisée | **≈ 0** — ce sont bien six enregistrements différents |

La dernière ligne compte : ce n'est **pas** un copier-coller, je l'ai vérifié.
Ce sont six tirages du même style, avec la même densité, le même équilibre
grave-aigu, la même durée.

D'où la conséquence, qui est le vrai problème : **la bagarre, le casse, la
manche, la récup' et le marchandage se ressemblent à l'oreille.** Cinq
mécaniques qui n'ont rien à voir partagent le même fond. Le joueur ne sait
jamais, au son, dans quel mini-jeu il est.

Six musiques distinctes règlent ça — pas six musiques « meilleures ».

---

## L'outil : Stable Audio, pas ElevenLabs

Ce lot n'a rien à voir avec le premier. Les 49 bruitages étaient des one-shots
de moins d'une seconde — le terrain d'ElevenLabs Sound Effects. Ici, ce sont
**sept boucles musicales de 45 à 60 secondes**, et il faut un modèle qui sache
boucler.

**Stable Audio** ([stableaudio.com](https://stableaudio.com)) : il génère
jusqu'à 3 minutes et propose une option de boucle sans couture. C'est le bon
outil pour ce lot.

### Réglages, valables pour les sept

| | |
|---|---|
| Durée | **60 s** (les fichiers actuels font 36 s : trop court, on entend la reprise) |
| Boucle | **activer « seamless loop »** — c'est non négociable |
| Format | **stéréo, 44,1 kHz** — ce sont des musiques, elles ont droit à la largeur |
| Débit final | **96 kbit/s** |
| Niveau | normaliser à **−20 LUFS** |

Le jeu les joue déjà à 34 % du volume, sous les bruitages : elles sont un
**lit**, pas une bande-son. Une musique qui attire l'attention pendant un
mini-jeu a raté sa cible.

### Ce qu'il faut ajouter à chaque description

> Lo-fi, small room recording, no vocals, no drum machine, no synthesizer pads,
> seamless loop, sparse arrangement, leaves room for sound effects on top.

---

# ⓪ LA MORT

Le seul morceau qu'on écoute vraiment : on reste sur cet écran le temps de lire
le bilan, parfois deux minutes.

| Fichier | Durée | Prompt à coller |
|---|---|---|
| `musique-mort.mp3` | 60 s | `Slow melancholic solo accordion, one sustained unresolved melody, no percussion, no bass, French street music, sparse and patient, recorded in a small dry room, lo-fi, seamless loop` |

**Un accordéon seul, jamais un orchestre.** Le jeu se moque des grands
sentiments : c'est une comédie noire, pas un mélodrame. Et la mélodie **ne doit
pas se résoudre** — on ne referme pas une vie ratée sur un bel accord.

Elle entre en fondu de quatre secondes, derrière la résonance du carton qui
s'affaisse. Le créneau est déjà branché côté code : dès que le fichier arrive,
elle joue.

---

# ① LA BAGARRE — `mg-bagarre.mp3`

Le seul mini-jeu où **vous frappez**. C'est le seul qui a droit à une pulsation.

| Durée | Prompt à coller |
|---|---|
| 60 s | `Slow tribal groove played on cardboard boxes and a cardboard tube as bass drum, around 100 BPM, no melody, no cymbals, dry and close, lo-fi, seamless loop` |

**Une pulsation, aucune mélodie.** La mélodie occuperait la place des coups.
Et la percussion est en carton — dans ce jeu, même la bagarre se joue avec ce
qu'on a trouvé.

---

# ② L'ESQUIVE — `mg-esquive.mp3`

Le pendant exact du précédent : ici **vous ne frappez pas**, vous encaissez ou
vous évitez. Même monde sonore, **pulsation retirée**.

| Durée | Prompt à coller |
|---|---|
| 60 s | `Held low drone on a bowed double bass, one note, no rhythm, faint irregular creaks of cardboard underneath, tense and static, lo-fi, seamless loop` |

**Aucun rythme.** Le rythme, c'est vous qui le donnez en esquivant. Un fond
qui pulse pendant une phase d'esquive vous fait esquiver à contretemps.

---

# ③ LE CASSE — `mg-casse.mp3`

Le mini-jeu de l'infiltration. La jauge d'alerte y monte par paliers, et le
second lot lui donne ses trois crans sonores. **Le lit doit leur laisser toute
la place.**

| Durée | Prompt à coller |
|---|---|
| 60 s | `Almost silent ambience, one very low sustained note fading in and out slowly, a distant electrical hum, long gaps of near silence, extremely sparse, lo-fi, seamless loop` |

**C'est le plus vide des six, et c'est voulu.** Dans une infiltration, le
silence est la matière : plus le fond est nu, plus le moindre craquement de
l'alerte fait sursauter.

---

# ④ LA MANCHE — `mg-manche.mp3`

Le seul mini-jeu **social** : on tient le regard des passants. C'est aussi le
seul endroit où la musique peut être **diégétique** — quelqu'un d'autre joue,
un peu plus loin dans la rue.

| Durée | Prompt à coller |
|---|---|
| 60 s | `Distant street busker playing a simple harmonica melody, heard from across a square with faint reverb of open air, imperfect and human, occasional pause for breath, lo-fi, seamless loop` |

**Elle vient d'ailleurs.** Les cinq autres lits sont dans votre tête ; celui-ci
est dans la rue. Les respirations et les hésitations du musicien ne sont pas des
défauts — c'est ce qui la rend vraie.

---

# ⑤ LA RÉCUP' — `mg-recup.mp3`

Creuser dans une benne. Un travail : **répétitif, patient, mécanique**.

| Durée | Prompt à coller |
|---|---|
| 60 s | `Repetitive mechanical loop of a hand-cranked music box playing three notes over and over, slightly out of tune, metallic and patient, faint rustling underneath, lo-fi, seamless loop` |

**Trois notes, indéfiniment.** C'est la musique du geste qu'on refait. Une
boîte à musique désaccordée dit à la fois l'enfance et l'objet abandonné —
exactement ce qu'on déterre dans une benne.

---

# ⑥ LE MARCHANDAGE — `mg-marchandage.mp3`

Une négociation, c'est **un aller-retour**. La musique doit en avoir la forme.

| Durée | Prompt à coller |
|---|---|
| 60 s | `Playful walking bassline on pizzicato double bass, call and response between two low notes, light and conversational, no drums, no melody on top, lo-fi, seamless loop` |

**Question, réponse, question, réponse.** C'est le seul lit qui ait de
l'humour, parce que c'est la seule scène où l'on discute d'égal à égal.

---

## Ce qui distingue les six, en une ligne chacun

| Mini-jeu | Ce qu'on fait | Ce qu'on entend |
|---|---|---|
| Bagarre | on frappe | une pulsation en carton |
| Esquive | on encaisse | un bourdon tendu, sans rythme |
| Casse | on se cache | presque rien |
| Manche | on demande | un musicien, plus loin dans la rue |
| Récup' | on creuse | trois notes qui reviennent |
| Marchandage | on discute | une basse qui se répond |

Si un testeur, les yeux fermés, ne peut pas dire dans lequel il est, le lot a
raté sa cible. **C'est le seul contrôle qui compte** — bien plus que la beauté
de chaque morceau pris à part.

## Contrôle avant livraison

1. **La boucle.** Laisser tourner trois minutes. Aucun raccord ne doit
   s'entendre.
2. **Le test des yeux fermés**, ci-dessus, sur les six d'affilée.
3. **Sur haut-parleur de téléphone**, comme le reste — et à 34 % du volume,
   puisque c'est ainsi que le jeu les joue.
4. **Rien qui pique.** Ces musiques tournent en boucle pendant qu'on se
   concentre. Une fréquence agressive qu'on ne remarque pas au premier passage
   devient insupportable au dixième.

## Licence

Même point de vigilance que le premier lot : vérifier que l'offre souscrite
couvre l'**usage commercial**. Les 65 bruitages actuels viennent d'un compte
gratuit en licence non commerciale et devront être régénérés avant publication.
Autant ne pas refaire la même chose ici.
