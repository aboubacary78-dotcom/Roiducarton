# Troisième lot — les musiques à thème
## Une mort, six mini-jeux, un seul thème

---

## Le thème existe déjà

Il n'est pas dans un fichier : il est **écrit en code**, dans le générateur de
l'écran-titre. C'est la seule musique que tu as voulu garder, et elle définit
déjà tout le reste :

| | |
|---|---|
| Tonalité | **la mineur** |
| Mesure | **3/4 — une valse**, ≈ 143 à la noire |
| Progression | `Am · Am · Dm · E7 · Am · F · E7 · Am` |
| Motif mélodique | **la – do – mi**, la triade mineure qui monte |
| Couleur | accordéon pincé, basse ronde, oum-pah-pah, chaleur de vinyle par-dessous |

Ce motif de trois notes — **la, do, mi** — est la signature du jeu. Le
commentaire dans le code dit ce qu'elle raconte : *« il était une fois un type
sur un carton »*.

## Ce que ça change pour ce lot

Une bande-son, ce n'est pas sept jolis morceaux : c'est **un thème et ses
métamorphoses**. Le joueur doit reconnaître, sans savoir pourquoi, que la
musique de la bagarre et celle de la mort sont la même histoire.

Les sept morceaux ci-dessous sont donc **sept états du même thème**. Même
tonalité, même motif, même petit orchestre — ce qui change, c'est le tempo, la
mesure, l'instrument qui porte la mélodie, et ce qu'on choisit de retirer.

---

## Comment obtenir ça d'un générateur — la partie honnête

Aucun modèle texte-vers-musique ne saura reproduire un motif précis parce qu'on
le lui décrit. Ce qu'il sait faire, en revanche, et plutôt bien :

- tenir une **tonalité** et une **mesure** si on les nomme ;
- suivre une **progression d'accords** écrite en toutes lettres ;
- respecter une **instrumentation** courte et précise.

D'où la méthode qui marche vraiment :

**1. Génère `musique-mort` en premier.** C'est l'énoncé le plus nu du thème :
un accordéon seul. Écoute-en dix, garde celle qui te semble être *la* musique
du jeu.

**2. Sers-t'en comme référence.** Stable Audio accepte un fichier d'entrée
(audio-to-audio) : les six autres partent de celle-là. C'est ce qui les rendra
parentes, bien mieux que n'importe quelle description.

**3. Juge par familles, pas morceau par morceau.** Écoute les sept d'affilée.
La question n'est pas « est-ce beau » mais « est-ce le même monde ».

**Outil : Stable Audio** — il boucle nativement et va jusqu'à trois minutes.
ElevenLabs Sound Effects, qui servait au premier lot, ne fait pas de musique.

### Réglages, valables pour les sept

| | |
|---|---|
| Durée | **60 s**, bouclable sans couture |
| Format | stéréo, 44,1 kHz, MP3 96 kbit/s |
| Niveau | −20 LUFS |
| À ajouter à chaque description | `lo-fi, recorded in a small room, vinyl warmth, no vocals, no drum machine, seamless loop` |

---

# ⓪ LA MORT — `musique-mort.mp3`

**Le thème, nu, et qui ne se résout pas.**

C'est le morceau qu'on écoute vraiment : on reste sur cet écran le temps de lire
le bilan. C'est aussi celui qui doit t'apprendre le thème, pour que tu le
reconnaisses partout ailleurs.

> `Solo accordion waltz in A minor, 3/4 time, very slow, around 70 BPM, chord progression Am Dm E7 Am F E7, one simple melody rising A C E, no percussion, no bass, sparse and patient, ends unresolved on the dominant, lo-fi, recorded in a small room, vinyl warmth, seamless loop`

**Un accordéon seul, jamais un orchestre.** Le jeu est une comédie noire, pas
un mélodrame — et un orchestre sur la mort d'un SDF serait de mauvais goût.

**La dernière mesure ne revient pas au la mineur.** Elle reste sur le E7, en
suspens. On ne referme pas une vie ratée sur un bel accord.

---

# ① LA BAGARRE — `mg-bagarre.mp3`

**Le thème à toute vitesse, et en 2/4.**

La valse devient une bagarre : même mélodie, mesure cassée, tempo doublé. C'est
la métamorphose la plus violente du lot, et la plus reconnaissable.

> `Fast klezmer clarinet in A minor, 2/4 time, 150 BPM, frantic melody based on rising A C E, upright bass walking underneath, percussion played on cardboard boxes and a cardboard tube, no cymbals, comic and breathless, lo-fi, small room, seamless loop`

**La clarinette klezmer, pas la trompette héroïque.** Une bagarre entre deux
types au bout du rouleau est ridicule avant d'être épique — la musique doit le
savoir.

---

# ② L'ESQUIVE — `mg-esquive.mp3`

**Le thème dont on a retiré la mélodie.**

Ici on ne frappe pas, on encaisse. Il reste la basse du thème, tenue, et le
souvenir de ce qui devrait se poser dessus.

> `Bowed double bass holding the bass notes of an A minor waltz progression, one note per bar, extremely slow, no melody, no percussion, faint cardboard creaks between notes, tense and suspended, lo-fi, small room, seamless loop`

**Aucun rythme, et c'est essentiel.** Le rythme, c'est toi qui le donnes en
esquivant. Un fond qui pulse pendant une phase d'esquive te fait esquiver à
contretemps.

---

# ③ LE CASSE — `mg-casse.mp3`

**Le motif, note à note, sur la pointe des pieds.**

Trois notes — la, do, mi — jouées une par une, avec du silence entre chacune.
Le thème avance à pas de loup.

> `Muted pizzicato double bass playing three separate notes A C E with long silences between them, very slow, one note every two seconds, a toy piano echoing the same notes far away, almost silent, extremely sparse, lo-fi, small room, seamless loop`

**Le plus vide des sept, et c'est voulu.** La jauge d'alerte du casse reçoit
ses trois crans sonores au second lot : plus le fond est nu, plus le moindre
craquement fait sursauter.

---

# ④ LA MANCHE — `mg-manche.mp3`

**Le thème en majeur — la seule éclaircie du jeu.**

Le même air, en la **majeur**. C'est la seule scène où quelqu'un vous regarde
en face, et la seule musique qui espère.

> `Warm harmonica melody in A major, 3/4 waltz time, 100 BPM, simple tune rising A C# E, played by a street busker heard from across a square, slight open-air reverb, imperfect timing, pauses to breathe, gentle guitar strumming underneath, lo-fi, seamless loop`

**Elle vient d'ailleurs.** Les six autres sont dans ta tête ; celle-là est
vraiment dans la rue, quelqu'un d'autre en joue. Les respirations et les
hésitations du musicien ne sont pas des défauts — c'est ce qui la rend vraie.

---

# ⑤ LA RÉCUP' — `mg-recup.mp3`

**Les trois premières notes, indéfiniment.**

Creuser dans une benne, c'est refaire le même geste. La musique refait la même
mesure.

> `Hand-cranked music box playing only three notes A C E over and over, slightly out of tune, mechanical and patient, 80 BPM, a faint accordion holding one long chord far underneath, metallic and repetitive, lo-fi, small room, seamless loop`

**Le thème réduit à son os.** Une boîte à musique désaccordée dit à la fois
l'enfance et l'objet abandonné — exactement ce qu'on déterre d'une benne.

---

# ⑥ LE MARCHANDAGE — `mg-marchandage.mp3`

**Le thème coupé en deux, qui se répond.**

Une négociation, c'est un aller-retour. La basse pose la question — la, do, mi
— et la clarinette répond à l'envers : mi, do, la.

> `Playful call and response in A minor, pizzicato double bass asking a three-note phrase A C E, clarinet answering the same phrase reversed E C A, light and conversational, 110 BPM, no drums, jaunty and a bit cheeky, lo-fi, small room, seamless loop`

**Le seul morceau du lot qui ait de l'humour**, parce que c'est la seule scène
où l'on discute d'égal à égal.

---

## Le tableau qui résume tout

| Morceau | Ce qu'on fait | Ce qu'on fait au thème |
|---|---|---|
| **Mort** | on encaisse la fin | il est joué nu, et ne se résout pas |
| **Bagarre** | on frappe | doublé de tempo, cassé en 2/4 |
| **Esquive** | on évite | la mélodie retirée, la basse seule |
| **Casse** | on se cache | trois notes, une par une, dans le silence |
| **Manche** | on demande | passé en **majeur** |
| **Récup'** | on creuse | réduit à ses trois premières notes |
| **Marchandage** | on discute | coupé en question et réponse |

## Contrôle avant livraison

1. **Le test de la parenté.** Écoute les sept d'affilée. Si un morceau ne
   semble pas appartenir à la même bande-son, il est à refaire — même s'il est
   beau.
2. **Le test des yeux fermés.** Un testeur doit pouvoir dire dans quel
   mini-jeu il est, sans regarder.
3. **La boucle.** Laisse tourner trois minutes. Aucun raccord ne doit
   s'entendre.
4. **Sur haut-parleur de téléphone**, et à faible volume : le jeu les joue
   sous les bruitages.
5. **Rien qui pique.** Ces morceaux tournent en boucle pendant qu'on se
   concentre. Une fréquence agressive qu'on ne remarque pas au premier passage
   devient insupportable au dixième.

## Deux choses à régler quand les fichiers seront là

**Le volume.** Le jeu joue les lits de mini-jeu à 34 % et la mort à 30 %.
C'était calibré pour des ambiances de fond ; une vraie mélodie s'entend
autrement. Il faudra sans doute remonter — je le ferai à l'oreille, une fois
les morceaux livrés.

**La licence.** Vérifier que l'offre souscrite couvre l'**usage commercial**.
Les 65 bruitages actuels viennent d'un compte gratuit en licence non
commerciale et devront être régénérés avant publication : autant ne pas refaire
la même erreur sur les musiques.
