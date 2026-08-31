# Troisième lot · les musiques à thème
## Sept morceaux, sept identités

---

## Le périmètre, pour qu'il n'y ait pas d'ambiguïté

**On ne touche pas au thème de l'écran-titre.** Il n'est d'ailleurs pas dans un
fichier : il est écrit en code, une valse en la mineur, jouée en Web Audio. Il
reste exactement tel qu'il est.

Ce lot concerne **sept morceaux, et eux seuls** :

| Fichier | Où on l'entend |
|---|---|
| `musique-mort.mp3` | l'écran de fin |
| `mg-bagarre.mp3` | le combat |
| `mg-esquive.mp3` | la phase d'esquive |
| `mg-casse.mp3` | le casse |
| `mg-manche.mp3` | la manche |
| `mg-recup.mp3` | la récup' |
| `mg-marchandage.mp3` | le marchandage |

---

## Pourquoi refaire les six lits existants

Ils existent déjà. Je les ai mesurés avant de proposer de les remplacer :

| | |
|---|---|
| Durée | **36,0 s** : les six, à la décimale près |
| Poids | **422 ko** : les six, à l'octet près |
| Profil spectral | écart de **0,13 à 0,79 dB** entre voisins, sur huit bandes |
| Corrélation croisée | **≈ 0** : ce sont bien six enregistrements distincts |

La dernière ligne compte, et j'ai failli me tromper dessus : ce n'est **pas**
un copier-coller. Ce sont six tirages du même style, avec la même densité et le
même équilibre grave-aigu.

Conséquence : **cinq mécaniques qui n'ont rien à voir partagent la même
couleur.** Le joueur ne sait jamais, au son, dans quel mini-jeu il est.

**C'est le problème à résoudre, et c'est le seul.** Pas « des musiques plus
belles » : des musiques qu'on ne confond pas.

---

## La règle qui commande tout le lot

Chaque morceau change **quatre choses** par rapport aux autres : la tonalité,
le tempo, la mesure, et l'instrument qui porte la mélodie. Deux morceaux qui
partageraient trois de ces quatre paramètres se ressembleraient, c'est
exactement ce qui est arrivé aux six fichiers actuels.

Ce qui les relie n'est pas une mélodie commune, mais **une même façon
d'enregistrer** : de vrais instruments, une petite pièce, pas de synthétiseur,
une chaleur de vinyle. Le même petit orchestre fauché joue sept airs qui n'ont
rien à voir.

| Morceau | Tonalité | Tempo | Mesure | Instrument principal |
|---|---|---|---|---|
| Mort | **la mineur** | 70 | 3/4 | accordéon seul |
| Bagarre | **ré mineur** | 150 | 2/4 | clarinette klezmer |
| Esquive | **mi mineur** |, | sans mesure | contrebasse à l'archet |
| Casse | **chromatique** | 50 | 4/4 très lent | pizzicato + vibraphone |
| Manche | **sol majeur** | 100 | 3/4 | harmonica |
| Récup' | **do majeur** | 80 | 4/4 | boîte à musique |
| Marchandage | **fa majeur** | 110 | swing | contrebasse + clarinette |

Sept tonalités, sept tempos, six mesures différentes, sept instruments. **Aucune
paire ne peut se confondre.**

---

## L'outil et les réglages

**Stable Audio** ([stableaudio.com](https://stableaudio.com)) : il boucle
nativement et va jusqu'à trois minutes. ElevenLabs Sound Effects, qui servait
au premier lot, ne fait pas de musique.

| | |
|---|---|
| Durée | **60 s** (les fichiers actuels font 36 s : on entend la reprise) |
| Boucle | **activer « seamless loop »** : non négociable |
| Format | stéréo, 44,1 kHz, MP3 96 kbit/s |
| Niveau | −20 LUFS |

À ajouter à la fin de **chaque** description :

> `lo-fi, real acoustic instruments, recorded in a small room, vinyl warmth, no synthesizer, no drum machine, no vocals, seamless loop`

---

# ⓪ LA MORT · `musique-mort.mp3`

**Un accordéon seul, une valse lente, qui ne se résout pas.**

> `Solo accordion waltz in A minor, 3/4 time, very slow at 70 BPM, one simple melancholic melody, no percussion, no bass, long held notes, ends unresolved on the dominant chord, sparse and patient`

Le jeu est une comédie noire, pas un mélodrame : **un orchestre sur la mort
d'un SDF serait de mauvais goût.** Un seul instrument, et il hésite.

La dernière mesure ne revient pas à la tonique. On ne referme pas une vie ratée
sur un bel accord.

*C'est le seul morceau qu'on écoute vraiment, on reste sur cet écran le temps
de lire le bilan. Il a le droit d'être le plus beau des sept.*

---

# ① LA BAGARRE · `mg-bagarre.mp3`

**Une clarinette klezmer essoufflée, et des cartons frappés.**

> `Fast klezmer clarinet in D minor, 2/4 time, 150 BPM, frantic tumbling melody, upright bass walking underneath, percussion played on cardboard boxes and a cardboard tube as bass drum, no cymbals, comic and breathless`

**La clarinette, pas la trompette héroïque.** Une bagarre entre deux types au
bout du rouleau est ridicule avant d'être épique, la musique doit le savoir.

Et la percussion est en carton : dans ce jeu, même la castagne se joue avec ce
qu'on a trouvé.

---

# ② L'ESQUIVE · `mg-esquive.mp3`

**Une contrebasse à l'archet, un souffle retenu, aucun rythme.**

> `Bowed double bass drone in E minor, no time signature, no pulse, one long note slowly swelling and fading, faint cardboard creaks in the gaps, tense and suspended, almost no movement`

**Aucun rythme, et c'est la consigne la plus importante du lot.** Le rythme,
c'est toi qui le donnes en esquivant. Un fond qui pulse pendant une phase
d'esquive te fait esquiver à contretemps, c'est un défaut de jouabilité, pas
de goût.

C'est le seul morceau sans mesure : impossible de le confondre avec un autre.

---

# ③ LE CASSE · `mg-casse.mp3`

**Sur la pointe des pieds. Presque rien.**

> `Muted pizzicato double bass playing single chromatic notes with two seconds of silence between each one, a vibraphone echoing far away, extremely slow at 50 BPM, almost silent, no melody line, creeping`

**Le plus vide des sept, délibérément.** La jauge d'alerte du casse reçoit ses
trois crans sonores au second lot : plus le fond est nu, plus le moindre
craquement fait sursauter.

Le chromatisme (des notes qui ne s'installent dans aucune tonalité) donne
cette impression de ne jamais être en sécurité.

---

# ④ LA MANCHE · `mg-manche.mp3`

**Un musicien de rue, entendu d'un peu plus loin. La seule éclaircie.**

> `Warm harmonica melody in G major, 3/4 waltz time, 100 BPM, played by a street busker heard from across a square, slight open-air reverb, imperfect timing, pauses to breathe, gentle acoustic guitar strumming underneath, hopeful`

**C'est le seul morceau en majeur, et le seul qui vienne d'ailleurs.** Les six
autres sont dans ta tête ; celui-là est vraiment dans la rue, quelqu'un d'autre
en joue.

Les respirations et les hésitations du musicien ne sont pas des défauts, c'est
ce qui la rend vraie. La manche est la seule scène où quelqu'un vous regarde en
face ; c'est la seule musique qui espère.

---

# ⑤ LA RÉCUP' · `mg-recup.mp3`

**Une boîte à musique désaccordée, qui refait la même mesure.**

> `Hand-cranked music box in C major playing a short four-note phrase over and over, slightly out of tune, mechanical and patient, 80 BPM, faint metallic rattles and paper rustling underneath, hypnotic and repetitive`

Creuser dans une benne, c'est refaire le même geste, la musique refait la même
mesure.

**Une boîte à musique désaccordée dit à la fois l'enfance et l'objet
abandonné.** Exactement ce qu'on déterre d'une benne.

---

# ⑥ LE MARCHANDAGE · `mg-marchandage.mp3`

**Une question, une réponse. La forme même d'une négociation.**

> `Playful call and response in F major, light swing feel, 110 BPM, pizzicato double bass asking a short phrase, clarinet answering it, back and forth, conversational and a bit cheeky, brushed snare very light, no melody on top`

**Le seul morceau du lot qui ait de l'humour**, parce que c'est la seule scène
où l'on discute d'égal à égal. Le seul aussi qui swingue, encore un paramètre
que personne d'autre n'utilise.

---

## Contrôle avant livraison

**1. Le test des yeux fermés.** Fais écouter les six mini-jeux à quelqu'un, en
désordre, sans lui dire lesquels. S'il ne peut pas nommer chaque scène, le lot
a raté sa cible. **C'est le seul contrôle qui compte vraiment**, plus que la
beauté de chaque morceau pris à part.

**2. Le test des paires.** Écoute-les deux par deux. Si deux morceaux
pourraient être échangés sans que ça choque, l'un des deux est à refaire.

**3. La boucle.** Laisse tourner trois minutes. Aucun raccord ne doit
s'entendre.

**4. Sur haut-parleur de téléphone**, et à faible volume : le jeu les joue sous
les bruitages.

**5. Rien qui pique.** Ces morceaux tournent en boucle pendant qu'on se
concentre. Une fréquence agressive qu'on ne remarque pas au premier passage
devient insupportable au dixième.

## Deux choses à régler quand les fichiers seront là

**Le volume.** Le jeu joue les mini-jeux à 34 % et la mort à 30 %. C'était
calibré pour des ambiances de fond ; une vraie mélodie s'entend autrement. Il
faudra sans doute remonter, je le ferai à l'oreille, une fois les morceaux
livrés.

**La licence.** Vérifier que l'offre souscrite couvre l'**usage commercial**.
Les 65 bruitages actuels viennent d'un compte gratuit en licence non
commerciale et devront être régénérés avant publication : autant ne pas refaire
la même erreur sur les musiques.
