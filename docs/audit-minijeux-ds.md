# Audit — ce qu'on peut voler à la Nintendo DS

But : trouver de quoi (1) remplacer le mini-jeu de la mendicité, devenu trop
maigre, et (2) ouvrir une nouvelle action dans la journée du personnage.

La DS est la bonne référence : écran tactile, sessions courtes, une seule main
disponible, pas de boutons. Exactement nos contraintes.

---

## 1. Ce que nos mini-jeux couvrent déjà

Avant de piocher ailleurs, il faut savoir ce qui est pris, sinon on ajoute un
doublon déguisé.

| Mini-jeu | Verbe | Ce qu'il sollicite |
|---|---|---|
| **Bagarre** (duel de signes + cartes) | choisir | lecture de l'adversaire, bluff |
| **Esquive** (arène de projectiles) | glisser | réflexes, lecture spatiale |
| **Casse** (grille furtive) | avancer d'une case | planification, patience |
| **Manche** (taper les pièces) | taper | vitesse de doigt, rien d'autre |

Trois cases sur quatre sont solides et bien distinctes. La quatrième est le
problème : **taper des pièces qui apparaissent au hasard, ce n'est pas un jeu,
c'est un test de doigt.** Aucune décision, aucune progression, aucun rapport
avec le fait de mendier. Le seul choix est « ne pas taper le policier », et il
est évident. C'est le maillon faible et les testeurs ont raison.

Ce qui manque au tableau : **le rythme et la performance**. C'est justement la
grande spécialité de la DS.

---

## 2. Les mini-jeux DS qui valent le détour

Classés par ce qu'on peut en tirer, pas par nostalgie.

### 🥇 Ouendan / Elite Beat Agents (2005, 2006)

On tape des marqueurs numérotés en rythme sur la musique, on suit des lignes,
on fait tourner une roulette. Entre les manches, une petite histoire : un
personnage a un problème, votre performance décide si sa journée s'arrange.

**Pourquoi ça marchait.** La musique fait tout le travail : elle donne le
tempo, la tension et la récompense. Un raté s'entend avant de se voir. Et la
vignette narrative entre deux manches donne un enjeu à ce qui n'est
mécaniquement qu'un exercice de timing.

**Transférable chez nous** : oui, totalement. On a déjà un moteur de synthèse
audio maison (`lib/sound`, `lib/ambience`) et un thème musical composé. Faire
la manche, c'est littéralement une performance devant un public.

### 🥈 Rhythm Heaven / Rhythm Paradise (2008)

Rythme aussi, mais **à l'oreille** : pas de marqueur qui descend, on écoute le
motif et on répond au bon moment. Chaque tableau a son geste unique.

**Pourquoi ça marchait.** Ça récompense l'écoute, pas la lecture. Beaucoup plus
difficile à réussir du premier coup, beaucoup plus satisfaisant ensuite.

**Transférable** : en partie. Trop exigeant seul, excellent en variante
« expert » d'un système de rythme.

### 🥉 WarioWare: Touched! (2004)

Des micro-jeux de cinq secondes, un verbe chacun (frotter, trancher, souffler,
taper), annoncé par un seul mot à l'écran. La vitesse augmente.

**Pourquoi ça marchait.** Une consigne d'un mot, un geste, cinq secondes. La
lisibilité instantanée est le vrai tour de force.

**Transférable** : la *leçon* oui, le format non. Un chapelet de micro-jeux
absurdes casserait le ton. Mais « un verbe, un geste, une consigne d'un mot »
devrait être la règle de tout ce qu'on ajoute.

### Trauma Center: Under the Knife (2005)

Opérations chirurgicales au stylet : on change d'outil, on découpe le long
d'une ligne, on draine, on suture, pendant que les constantes du patient
descendent.

**Pourquoi ça marchait.** Le stress vient d'une **jauge qui descend pendant
qu'on travaille**, pas d'un chronomètre abstrait. Et l'enchaînement
d'outils donne l'illusion d'un savoir-faire.

**Transférable** : très bien pour tout ce qui est « réparer », « bricoler »,
« soigner ». Une jauge qui fond pendant qu'on s'applique, c'est exactement la
sensation d'une tâche qu'on rate parce qu'on est pressé.

### Cooking Mama (2006)

Une recette = une chaîne de gestes courts, chacun différent (hacher, remuer,
retourner), notés séparément puis additionnés.

**Pourquoi ça marchait.** La variété des gestes fait croire à une activité
complète alors que chaque étape dure six secondes. Et on est noté sur chaque
étape, donc on peut rater le début et se rattraper.

**Transférable** : oui, c'est le meilleur modèle pour une action « métier »
(un petit boulot, un tri, une réparation).

### New Super Mario Bros. DS — le mode « Wanted! »

On voit un portrait, puis une foule qui bouge : il faut retrouver le bon
visage avant la fin du temps.

**Pourquoi ça marchait.** Bête et immédiatement compréhensible. La difficulté
vient de la densité de la foule, pas de règles ajoutées.

**Transférable** : parfait pour un jeu de rue. Retrouver quelqu'un dans une
foule, c'est notre décor par défaut — et on a déjà un générateur de visages
en carton (`CardboardAvatar`) qui produit des têtes toutes différentes.

### Kirby : Le Pinceau du Pouvoir (2005)

On ne contrôle pas le personnage : on **dessine** des lignes qui le guident.

**Pourquoi ça marchait.** Le contrôle indirect crée une complicité étrange
avec le personnage. Et le dessin comme entrée est un geste que seul le tactile
permet.

**Transférable** : joli mais coûteux, et on vient de tout convertir au glissé
direct dans l'esquive. Deux grammaires de glissé différentes se
concurrenceraient. À garder pour un DLC.

### Phoenix Wright: Ace Attorney (DS, 2005)

On écoute un témoignage, on repère la contradiction, on présente la bonne
preuve.

**Pourquoi ça marchait.** Le dialogue devient une énigme. Le joueur a
l'impression d'être malin, pas rapide.

**Transférable** : oui, mais **attention au doublon** : notre duel de signes
en combat est déjà un jeu de lecture de l'adversaire. Ça ferait deux fois la
même sensation.

### Picross DS (2007), Polarium (2005), Meteos (2005)

Puzzles purs : logique, tracé de lignes, propulsion de blocs.

**Pourquoi ça marchait.** Des règles minuscules, une profondeur énorme,
rejouables à l'infini.

**Transférable** : mal. Ce sont des jeux de salon, hors-sol. Rien dans un
Picross ne raconte la rue. À écarter, malgré leur qualité.

### Programme d'entraînement cérébral (2005)

Tests courts et quotidiens, notés, avec une courbe de progression.

**Pourquoi ça marchait.** La **répétition quotidienne notée**. On revient
pour battre son score d'hier.

**Transférable** : l'idée de garder un record par mini-jeu, à afficher dans le
Registre. Petit, mais ça donne une raison de rejouer une action « ennuyeuse ».

### Ghost Trick (2010)

On possède des objets pour déclencher une réaction en chaîne et sauver
quelqu'un dans les quatre secondes précédant sa mort.

**Pourquoi ça marchait.** Chaque tableau est une horlogerie à résoudre par
essais, avec un redémarrage instantané.

**Transférable** : magnifique mais c'est un jeu entier, pas un mini-jeu. Hors
budget.

---

## 3. Ce que je recommande pour la mendicité

**Remplacer « taper les pièces » par une performance en rythme**, dans la
lignée d'Ouendan.

Le principe : le personnage fait son numéro (harmonica cassé, gobelet, chant
faux). Un motif se joue, il faut taper dessus en mesure. Les passants
s'arrêtent quand la mesure tient, repartent quand elle se casse.

Ce que ça apporte, précisément :

- **Ça parle du sujet.** Mendier, c'est tenir une prestation devant des gens
  qui décident en trois secondes. Taper des pièces qui tombent du ciel ne
  raconte rien.
- **Ça se marie aux statistiques existantes.** La dignité fixe le nombre de
  passants qui s'arrêtent, le charisme élargit la fenêtre de frappe, le mental
  bas fait trembler la mesure. Tout est déjà là.
- **Ça a une progression naturelle.** Trois mesures de plus en plus rapides ;
  finir la troisième sans faute = le « chapeau plein », avec un bonus.
- **On a déjà l'outillage.** Le moteur audio maison joue des notes, la valse
  du menu prouve qu'on sait composer. Aucune dépendance nouvelle.
- **Ça ne double rien.** Rythme = quatrième sensation, à côté du bluff, des
  réflexes et de la planification.

Le policier reste, mais devient intéressant : il passe pendant la
performance, et **il faut s'arrêter de jouer le temps qu'il passe**. Se taire
au bon moment, c'est une décision, contrairement à « ne tape pas l'icône ».

Variante d'objet : l'harmonica cassé (déjà dans le jeu) change l'instrument et
donne un motif différent.

## 4. Ce que je recommande comme nouvelle action

**« La Récup' »** — fouiller les poubelles et les containers pour revendre.

Mécanique : une chaîne de gestes courts façon Cooking Mama, sur trois
containers. On soulève, on trie ce qui tombe (consigne / ferraille /
immangeable) dans le bon bac, avec une jauge de dégoût qui monte façon Trauma
Center. Plus on trie vite et juste, plus on sort de matière.

Pourquoi celle-là plutôt qu'une autre :

- **Elle bouche un vrai trou du jeu.** Le bricolage consomme du « bazar »
  (objets de type `junk`) et **aucune action n'en produit** aujourd'hui : on en
  trouve seulement au hasard des événements. Un système de fabrication sans
  source de matière première, c'est une pièce détachée qui ne sert à rien.
- **Elle a son propre verbe.** Trier, c'est ni taper, ni glisser, ni avancer.
- **Elle porte l'humour noir de la DA** sans effort : le contenu des
  containers écrit les gags tout seul.
- **Elle coûte peu.** Pas de moteur physique, pas d'IA : des objets qui
  tombent, trois bacs, un score.

**Second choix, si tu préfères le récit à la matière : « Les Papiers ».** La
course au tampon dans une administration, façon Trauma Center bureaucratique —
un guichet, un formulaire, une jauge de patience du guichetier. Excellent pour
l'humour, très fort thématiquement, mais ça produit un statut (une adresse,
des droits) plutôt qu'une ressource. C'est une action à conséquences longues,
plus difficile à équilibrer.

## 5. Ce que je déconseille explicitement

- **Un chapelet de micro-jeux façon WarioWare.** Le ton du jeu ne s'en
  remettrait pas.
- **Un puzzle abstrait (Picross, Polarium).** Excellent jeu, hors sujet ici.
- **Un deuxième jeu de déduction façon Ace Attorney.** Le duel de signes
  occupe déjà cette place.
- **Le dessin de trajectoire façon Kirby.** Entrerait en conflit avec le
  glissé de l'esquive, qu'on vient tout juste de poser.

## 6. Règles à respecter pour tout ajout

Tirées de ce qui marchait sur DS, et de nos propres ratés :

1. **Un verbe, un geste.** Si l'explication demande deux phrases, c'est raté.
2. **Jouable au pouce, une main.** Rien dans les coins hauts.
3. **Moins de dix secondes par manche.** Le jeu se joue debout, dans le bus.
4. **Une décision au moins, sinon ce n'est pas un jeu.** C'est précisément ce
   qui manquait à la manche.
5. **Rester immobile ne doit jamais être une stratégie gagnante.** La leçon de
   l'esquive.
6. **Le son fait la moitié du travail.** Il porte le rythme, la réussite et
   l'échec avant que l'œil ne suive.

---

# Second passage — spécial mendicité

Les trois pistes du premier tour (rythme, rythme à l'oreille, retrouver un
visage) ont été jugées trop faibles. À raison : le rythme était surtout
séduisant parce qu'on avait déjà le moteur audio, ce qui est un argument de
production, pas de game design. Reprenons par le bon bout.

## Qu'est-ce qu'on essaie de simuler, au juste ?

Mendier, ce n'est pas recevoir. C'est :

1. **être invisible et devoir se faire voir** ;
2. **choisir qui solliciter**, parce qu'on ne peut pas tous les arrêter ;
3. **tenir l'attention quelques secondes**, le temps que la personne décide ;
4. **payer en dignité** ce qu'on gagne en pièces ;
5. **savoir s'arrêter** quand la mauvaise personne arrive.

Aucun de ces cinq points n'est dans le mini-jeu actuel. Le rythme pur n'en
couvrait que le troisième. Voilà pourquoi ça ne suffisait pas.

Point de systémique important : **la dignité est une jauge centrale que rien
ne fait dépenser de façon interactive**. Elle monte et descend par effets de
bord. Un bon mini-jeu de mendicité devrait en faire une monnaie qu'on décide
de dépenser, au coup par coup.

## Les mécaniques DS que j'avais laissées de côté

### The World Ends With You (2007)

Dans Shibuya, on **scanne la foule** pour lire les pensées des passants, et on
« imprime » une idée chez quelqu'un pour changer son comportement. En combat,
chaque badge équipé a **son propre geste** (trancher, tapoter, gratter,
maintenir) : l'équipement ne change pas des chiffres, il change ce que fait
votre pouce.

**À retenir :** une foule où chaque tête a une pensée lisible, et un
inventaire qui redéfinit les gestes plutôt que les statistiques.

### Pokémon Ranger (2006)

On ne lance pas de balle : on **encercle** la créature avec le stylet, en
traçant des boucles sans lâcher, pendant qu'elle bouge et attaque. Le contact
maintenu *est* la mécanique.

**À retenir :** maintenir le contact avec une cible mobile est un geste
physique riche, ludique, et faisable au pouce. C'est aussi la meilleure
métaphore tactile de « capter l'attention de quelqu'un » que je connaisse.

### Henry Hatsworth in the Puzzling Adventure (2009)

Un jeu de plateforme sur l'écran du haut **et** un match-3 sur celui du bas,
en même temps. Les deux se nourrissent l'un l'autre, et l'attention devient la
vraie ressource.

**À retenir :** deux tâches qui se disputent le joueur, ça crée une tension
qu'aucune difficulté brute n'égale.

### Big Bang Mini (2009)

On lance des feux d'artifice vers le haut d'un doigt tout en esquivant les
retombées en bas. Une action offensive et une action défensive, un seul doigt.

**À retenir :** le même doigt sert à gagner et à se protéger. Chaque geste est
un arbitrage.

### Yoshi Touch & Go (2005)

Deux verbes simultanés : dessiner des nuages pour guider, tapoter pour lancer
des œufs.

**À retenir :** deux verbes, oui, mais seulement s'ils sont physiquement
distincts (tracer / tapoter). Sinon le pouce s'emmêle.

### Puzzle Quest (2007)

Un seul plateau de match-3 alimente **plusieurs monnaies** : dégâts, mana, or.
Le même geste sert des objectifs différents selon ce qu'on aligne.

**À retenir :** un mini-jeu peut produire plusieurs ressources et laisser le
joueur choisir laquelle poursuivre. Chez nous : pièces contre dignité.

### Mario Party DS (2007) et Zelda: Phantom Hourglass (2007)

Le premier pour son bloc de mini-jeux tactiles, le second pour les gestes hors
écran (souffler dans le micro pour éteindre des bougies, crier).

**À retenir :** rien pour nous côté micro — permission navigateur, jouabilité
en public, silence obligatoire dans le bus. À écarter, mais méritait d'être
tranché plutôt que passé sous silence.

## Ma nouvelle recommandation : « Tenir le regard »

Un seul geste, qui coche les cinq points du départ.

**Le principe.** Les passants traversent l'écran, chacun avec sa tête (on a
déjà le générateur de visages en carton, ils seront tous différents) et sa
démarche. On pose le pouce sur quelqu'un et **on le suit**, sans lâcher : un
anneau se remplit autour de lui. Rempli avant qu'il ne sorte de l'écran, il
s'arrête et donne. Lâché en route, tout est perdu pour celui-là.

**Ce que ça produit, mécaniquement.**

- *Se faire voir* : le remplissage de l'anneau, c'est le regard qu'on
  accroche. La vitesse dépend de la **dignité** — bien tenu, on est vu plus
  vite.
- *Choisir qui* : ils sont plusieurs à l'écran, on ne peut en suivre qu'un.
  Abandonner quelqu'un à mi-anneau pour un meilleur passant qui arrive, c'est
  la décision qui fait le sel du jeu.
- *Tenir* : la poursuite au pouce est une vraie compétence physique, celle de
  Pokémon Ranger. Les gens accélèrent, s'arrêtent, changent de file.
- *Payer en dignité* : certains passants ne cèdent qu'en **insistant** —
  maintenir au-delà de l'anneau plein donne plus, mais entame la dignité. On
  décide, personne par personne, ce qu'on est prêt à laisser.
- *Savoir s'arrêter* : le policier traverse. Tant qu'il est là, **il faut
  lâcher tout le monde**. Le jeu consiste alors à ne rien faire, ce qui est
  bien plus intéressant que « ne tape pas cette icône ».

**Les têtes se lisent**, façon World Ends With You : le costume-cravate au
téléphone ne s'arrêtera jamais et s'agace si on insiste ; la dame au cabas
donne peu mais vite ; le touriste donne gros mais marche vite ; l'ado en
groupe se moque et fait perdre de la dignité ; l'habitué du quartier donne
plus si votre **respect** est haut. On apprend la faune du quartier en jouant,
ce qui donne une raison de rejouer.

**Pourquoi c'est mieux que le rythme.** Le rythme n'avait qu'une compétence
(le timing) et aucune décision. Là, il y a un geste continu *et* un flux de
choix, c'est la structure des bons jeux de pouce. Et surtout, ça parle du
sujet : mendier, c'est retenir l'attention de quelqu'un juste assez longtemps.

**Coût.** Modéré. Pas de moteur physique : des passants qui glissent, un
anneau qui se remplit, un suivi de pointeur. On réutilise `CardboardAvatar`,
les traits (Charismatique élargit la tolérance, Poissard fait fuir), la météo
(foule plus clairsemée sous la pluie) et les lieux (BEG_SPOTS existe déjà).

## Deux solutions de repli, si celle-là ne te parle pas

**« Le Numéro »** — le tour de chant en chaîne de gestes, façon Cooking Mama :
sortir l'instrument, jouer, saluer, tendre le gobelet, chacun avec son geste
propre, noté séparément. Sympathique, lisible, mais c'est une suite d'épreuves
sans décision : le même défaut que la version actuelle, mieux habillé.

**« La Foule »** — retrouver, façon *Wanted!*, la seule personne de la foule
qui vous regarde vraiment, avant qu'elle ne se ravise. Très simple à faire et
à comprendre, joli avec nos visages générés, mais mince à long terme : c'est
un jeu d'observation pure, il s'épuise en quelques parties.

---

# Troisième passage — la DS *et* la 3DS, et pourquoi La Récup' ne tient pas

## Le constat, sans complaisance

La Récup' souffre exactement du défaut que je reprochais à l'ancienne manche.
J'avais écrit que sa décision était « est-ce que ça vaut le geste ». C'est
faux. Ignorer un déchet **ne coûte rien** : il n'y a donc pas d'arbitrage, il
y a une bonne réponse évidente (prendre ce qui vaut, laisser le reste) et une
exécution au doigt. C'est un test de reconnaissance plus un test de vitesse.
Exactement la même famille que « taper les pièces ».

Ma propre grille de l'audit le disait déjà, je ne l'ai pas appliquée à moi-même :

> **Une décision au moins, sinon ce n'est pas un jeu.**

Une décision, ce n'est pas « choisir la bonne case ». C'est **renoncer à
quelque chose**. Tant qu'aucun choix ne ferme une porte, il n'y a pas de jeu.

## Ce que la 3DS ajoute au tableau

### 🥇 SteamWorld Dig (2013)

On creuse vers le bas. Plus on descend, plus le minerai vaut cher — mais la
lanterne s'épuise, les poches se remplissent, et il faut **remonter pour
vendre**. Chaque coup de pioche est la même question : encore un, ou je rentre ?

**La leçon :** le *press your luck*. Une récolte non sécurisée, un risque qui
monte, et un bouton « je rentre » disponible à tout moment. Le joueur se fait
son propre malheur, et c'est pour ça qu'il recommence.

### 🥈 Rusty's Real Deal Baseball (2014)

On **marchande** le prix des jeux avec un chien criblé de dettes, qui pleure,
argumente et culpabilise. Le marchandage est le jeu.

**La leçon :** une négociation peut être un mini-jeu à part entière. Et chez
nous, il existe un endroit tout désigné où l'on discute un prix : la boutique.

### 🥉 The Legend of Zelda: A Link Between Worlds (2013)

On **loue** les objets au lieu de les gagner. C'est bon marché, on a tout tout
de suite — mais à la mort, le loueur récupère tout d'un coup.

**La leçon :** un système d'équipement peut être un pari permanent. Louer une
arme pour la journée en sachant qu'on la perd si on meurt, c'est notre jeu.

### Luigi's Mansion 2 (2013)

L'aspirateur : on accroche, le fantôme résiste, on tire à contre-sens. Un
bras de fer tactile où la résistance se sent.

**La leçon :** extraire quelque chose de coincé peut être un geste à part
entière, physique et lisible. Parfait pour sortir une grosse pièce d'un
container.

### Pocket Card Jockey (2016)

Un solitaire de golf, mais chaque partie pilote un cheval de course. Deux
univers sans rapport, collés, et ça marche.

**La leçon :** une mécanique connue et simple devient neuve quand la fiction
qui l'entoure change les enjeux.

### Sakura Samurai (2011), Kid Icarus: Uprising (2012), Theatrhythm (2012)

Le premier : des duels au contre-temps, on tourne autour de l'adversaire et on
frappe à l'instant exact. Le deuxième : la visée au stylet. Le troisième : le
rythme en tapé / maintenu / glissé.

**La leçon :** trois grammaires tactiles distinctes et lisibles. Nous en avons
déjà trois occupées (choisir, glisser, avancer d'une case) ; ce sont les
suivantes disponibles.

### Pushmo (2011), BoxBoy! (2015), Picross 3D (2009)

Puzzles spatiaux excellents — et hors-sol, comme les Picross du premier
passage. Même verdict : rien là-dedans ne raconte la rue.

### Etrian Odyssey IV (2012)

On dessine sa propre carte sur l'écran du bas en explorant.

**La leçon :** faire produire au joueur une trace persistante de ce qu'il a
vécu. Le Cimetière et le Registre jouent déjà ce rôle chez nous.

### Fantasy Life (2012), Animal Crossing: New Leaf (2012)

Des boucles quotidiennes courtes, un métier avec sa mini-mécanique propre, et
la satisfaction de revenir demain.

**La leçon :** nos actions journalières sont la bonne structure. Ce qui
manque, ce n'est pas le cadre, c'est la tension à l'intérieur.

### StreetPass — Find Mii (2011)

Les inconnus croisés dans la vraie vie viennent se battre pour vous.

**La leçon :** la foule comme ressource plutôt que comme décor. La nouvelle
manche s'en approche déjà.

## La Récup' v2 : le fond du container

Garder la fiction, jeter la mécanique. On ne trie plus une pluie d'objets : on
**fouille en profondeur**, et on décide quand s'arrêter.

**Le geste.** Le container est plein. On frotte le doigt sur les détritus pour
déblayer — le tas s'écarte là où on passe, et ce qu'il y a dessous apparaît.
C'est un geste continu, sale, et physiquement juste.

**La couche.** Ce qu'on trouve dépend de la profondeur atteinte :
surface = consigne (petit et sûr), milieu = ferraille et bricoles, fond = la
trouvaille (un vrai objet, parfois une arme).

**La décision, toutes les quelques secondes.** Deux boutons permanents :

- **Remonter** — tout ce qu'on a est acquis, définitivement.
- **Creuser encore** — la couche suivante paie mieux, et le risque monte.

**Le risque.** Une jauge unique qui grimpe à chaque couche : l'odeur, le bruit,
le gardien de la déchetterie qui fait sa ronde, le rat qu'on finit par
réveiller. Si elle éclate, on perd **tout ce qu'on n'a pas sécurisé** — pas la
partie, juste la fouille. La punition doit rester du domaine du « zut »,
jamais du « j'arrête de jouer ».

**Pourquoi c'est mieux.** Renoncer devient l'action principale. Chaque couche
supplémentaire est un pari que le joueur prend seul, contre son propre butin.
Et ça se raconte : « j'avais trois bricoles, j'ai voulu la quatrième ».

## Deux autres chantiers que la 3DS a mis en évidence

Ils ne concernent pas La Récup' mais valent d'être posés :

**Marchander en boutique** (Rusty's Real Deal). Le commerçant annonce son
prix, on propose le sien. Il accepte, refuse, se vexe. Le respect et la
dignité pèsent sur sa patience. Ça donnerait enfin un jeu à un écran qui n'est
aujourd'hui qu'une liste de prix.

**Louer plutôt qu'acheter** (A Link Between Worlds). Une arme correcte pour la
journée, à petit prix — perdue si le personnage meurt. Un pari qui colle
parfaitement à un jeu où l'on meurt souvent.
