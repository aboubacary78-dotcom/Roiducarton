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
