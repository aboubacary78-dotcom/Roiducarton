# Six idées de rupture

*Le premier jeu de propositions était correct et convenu : dette à échéance,
appui long, « juice », compagnon à nourrir. Ce sont des patrons de jeu mobile.
Ils marcheraient sur n'importe quel jeu — donc ils ne viennent pas de
celui-ci.*

*Ces six-là partent de ce que **Le Roi du Carton** possède et qu'aucun autre
n'a : une jauge sociale, un mental qui ne sert qu'à mourir, un cimetière qui
garde les morts, et du carton qui n'est encore que de la peinture.*

---

# ① La Dignité devient un cadran, pas une barre

## Le constat, dans le code

`GameContext.tsx` traite la Dignité en **pure pénalité** :

| Seuil | Effet actuel |
|---|---|
| < 25 | −8 mental chaque nuit, les passants fuient |
| ≥ 70 | « votre allure soignée a inspiré confiance » |

**Personne ne gagne jamais rien à être bas.** C'est donc une barre qu'on
défend, et défendre une barre, c'est une corvée. Le joueur n'y fait pas des
choix, il fait de l'entretien.

## La rupture

**Sous 15, on devient invisible.** Non pas « méprisé » : *invisible*. Personne
ne vous regarde, et c'est un pouvoir.

| | 👔 **Le Présentable** (dignité ≥ 70) | 👻 **L'Invisible** (dignité < 15) |
|---|---|---|
| Mendier | rapporte le maximum | **ne rapporte plus rien** |
| Boutiques | prix réduits, on vous sert | **la porte est fermée** |
| Le casse — jauge d'alerte | normale | **monte deux fois moins vite** : un gardien ne signale pas ce qu'il n'a pas vu |
| La ronde de la manche | vous cueille | **passe sans s'arrêter** |
| Rencontres | les branches « on vous fait confiance » | les branches « personne ne témoignera » |
| Le mental | intact | **−8 par nuit, et ça ne s'arrête jamais** |

**Deux stratégies gagnantes sur la même jauge.** L'une fait de l'argent avec
les gens, l'autre avec les choses. Et la pénalité mentale reste : disparaître
aux yeux des autres coûte la tête, ce qui est très exactement le sujet du jeu.

## Pourquoi c'est la plus importante des six

Elle transforme la jauge la plus thématique du jeu — celle qui *est* le sujet —
d'un ménage en une **position à tenir**. Et le milieu, entre 15 et 70, devient
la zone morte qu'il n'a jamais été : ni vu ni servi.

**Coût :** aucun art. Un seuil de plus, quatre `if` dans des endroits qui
existent déjà (`raiseAlert` du casse, la ronde de la manche, l'entrée des
boutiques, la manche).

---

# ② Le jeu vous ment quand le Mental baisse

## Le constat, dans le code

Le Mental ne fait que **deux** choses : il descend, et à zéro on meurt
(`isAlive = newStats.health > 0 && newStats.mental > 0`). C'est une seconde
barre de vie déguisée. Aucune mécanique ne le rend *intéressant* à perdre.

## La rupture

**Le Mental devient la fiabilité de l'interface.**

| Mental | Ce que l'écran affiche |
|---|---|
| ≥ 60 | la vérité |
| 40–59 | les jauges dérivent de **± 5** — on croit avoir 40 de faim, on en a 35 |
| 20–39 | dérive de **± 12**, et **la météo annoncée peut être fausse** |
| < 20 | dérive de **± 20**, et **un objet du sac peut ne pas y être** quand on le cherche |

Rien ne clignote, rien ne dit « attention ». Les chiffres sont simplement
faux, et ils le sont **de façon stable** — la même graine donne le même
mensonge, sinon on verrait les chiffres danser et on comprendrait le truc.

## Pourquoi c'est la plus innovante

Une comédie noire sur la survie où **votre propre tête cesse d'être un
narrateur fiable**. Ce n'est pas une pénalité de plus : c'est un changement de
nature du jeu quand on va mal. Le joueur ne perd pas des points, il perd la
**confiance dans ce qu'il voit** — et il n'existe pas d'angoisse plus efficace
ni moins chère à produire.

**Le garde-fou qui rend ça jouable :** le coach le dit **une fois**, la
première fois que le mental passe sous 60 : *« En dessous, ne faites plus
confiance aux chiffres. »* Puis plus jamais. Sans cette phrase, c'est un bug ;
avec elle, c'est une règle.

**Coût :** une fonction `afficher(valeur, mental, graine)` traversée par
`StatBars`. **Le modèle de jeu n'est jamais touché** — seul l'affichage ment.
C'est important : le réducteur, les tests et l'équilibrage continuent de
travailler sur des chiffres vrais.

---

# ③ Le carton : une ressource, quatre usages qui s'excluent

## Le constat

Le carton est la direction artistique du jeu, son titre, son identité — **et il
n'existe pas en tant que ressource**. Le personnage ramasse des objets
génériques dans une benne.

## La rupture

Le carton devient la seule matière du jeu, et **chaque nuit on choisit ce
qu'on en fait**. Quatre usages, exclusifs :

| Usage | Ce que ça donne | Ce que ça coûte |
|---|---|---|
| 🛏️ **Dormir dessus** | sommeil plein | il s'abîme d'un cran |
| 🔥 **Le brûler** | santé par temps froid — le seul remède au froid | il disparaît |
| 💰 **Le vendre** | de l'argent immédiat | il disparaît |
| 🔨 **Construire** | alimente l'établi qui existe déjà | il disparaît |

Et il ne se ramasse pas partout : la **zone industrielle** en regorge, le
**parc** n'en a aucun. Les quartiers cessent d'être des décors interchangeables
avec un tirage différent — ils ont une **économie**.

## Pourquoi c'est spécifique à ce jeu

C'est l'arbitrage de la rue, littéralement : *dormir dessus, ou le brûler ?* On
ne peut pas faire les deux, on doit choisir chaque soir, et le bon choix dépend
de la météo, du quartier et de ce qu'on prévoit demain.

**Coût :** un entier dans le personnage, quatre boutons sur l'écran de nuit,
une table de rendement par quartier. **Aucun art nouveau** — le carton est déjà
dans toutes les images.

---

# ④ Le surnom que vous n'avez pas choisi

## Le constat

Le joueur nomme son personnage. **La rue, elle, ne l'appelle jamais.** Les 296
rencontres disent « vous ». Aucun PNJ ne sait qui vous êtes, même après vingt
jours au même endroit.

## La rupture

Au bout de six actions dans un même quartier, **les gens du coin vous donnent
un nom** — tiré non pas d'une liste, mais de **ce que vous avez fait là**.

| Ce que vos compteurs disent | Le nom que la rue vous donne |
|---|---|
| surtout de la Récup' | *le Fouineur* |
| surtout dormir au même endroit | *celui du banc* |
| surtout des vols | *la Main Leste* |
| surtout la manche, dignité haute | *le Monsieur* |
| surtout des bagarres | *la Teigne* |
| dignité < 15 | *le Fantôme* |

Et ensuite :

- les rencontres de ce quartier vous **appellent par lui** ;
- les boutiques du quartier **ajustent leur prix** dessus ;
- **il est gravé sur votre tombe**, à la place du nom que vous aviez choisi.

## Pourquoi c'est spécifique à ce jeu

Le sujet du jeu est d'être vu ou non par la société. **Un nom qu'on n'a pas
choisi, mérité par son comportement, c'est l'identité comme conséquence.** Et
le voir remplacer, sur la pierre, le nom qu'on s'était donné, c'est la
meilleure phrase de fin que le jeu puisse écrire — sans l'écrire.

**Coût :** cinq compteurs par quartier (le jeu compte déjà les actions), une
table de seuils, une substitution de chaîne. **Pas une ligne d'art, pas un
écran.**

---

# ⑤ Vos morts sont encore dans la rue

## Le constat, dans le code

`necrology.ts` garde déjà beaucoup : les **tombes** (nom, jour, cause, métier,
tenue), le **karma**, la **couronne**, et un **héritage** — un objet que le
mourant lègue au suivant (`setLegacy`).

Mais la tombe ne retient **pas où il est mort**. Le mort est une ligne dans un
registre, pas un endroit.

## La rupture

La tombe gagne un **quartier** et un **jour**. Et le personnage suivant peut
**aller sur place**.

- Un marqueur discret apparaît dans le quartier où le précédent est tombé.
- Y aller coûte un voyage et une action.
- On y trouve **ce qu'il portait encore** — pas l'objet légué, qu'on a déjà :
  le reste. Son carton, sa monnaie, sa gamelle.
- Et si on n'y va pas dans les cinq jours, **quelqu'un d'autre est passé avant**.

Au bout de plusieurs vies, la ville se couvre de vos propres coins. Le
cinquième personnage passe devant l'angle du quatrième.

## Pourquoi c'est spécifique à ce jeu

Dans un roguelite, la mort est une remise à zéro. Ici, **la mort devient de la
géographie**. Le jeu a déjà tout : les tombes, l'héritage, les quartiers, le
voyage. Il ne manque qu'un champ et un marqueur.

**Coût :** deux champs dans `Grave`, un bouton conditionnel dans le Hub, une
branche de butin.

---

# ⑥ La journée a trois moments, pas trois actions

## Le constat

Trois actions par jour, et **leur ordre n'a aucune importance**. C'est
exactement pourquoi le Hub s'épuise : au quatrième jour, l'arbitrage est résolu
une fois pour toutes, et l'écran ne fait plus que le rappeler.

## La rupture

La journée se découpe en **matin / après-midi / soir**. Toujours trois actions
— mais **chaque action rend différemment selon le moment**.

| | 🌅 Matin | ☀️ Après-midi | 🌆 Soir |
|---|---|---|---|
| 🙏 Mendier | **×1,4** (on part travailler) | ×0,6 | **×1,3** (on rentre) |
| ♻️ Récup' | ×0,8 | ×1,0 | **×1,5** (le marché ferme) |
| 🗝️ Voler | ×0,7 | ×1,0 | **×1,4**, mais **le sommeil coûte double** |
| 😴 Dormir | ×0,5 | ×0,7 | **×1,0** |
| 🔍 Explorer | inchangé | inchangé | inchangé |

L'ordre devient le casse-tête. Mendier le matin puis fouiller le soir n'est pas
la même journée que l'inverse — et **la bonne réponse change trois fois par
jour** au lieu d'être figée pour la partie.

## Pourquoi ça règle la zone morte n°3

Le Hub ne demandait plus rien parce que la réponse était stable. Là, elle
dépend d'une variable qui bouge à chaque action. **Le même écran redevient une
question**, sans un bouton de plus.

**Coût :** un compteur `moment` (0, 1, 2) dans l'état, une table de
multiplicateurs, et un mot dans l'en-tête. La rareté du soir donne en prime au
casse le nocturne qu'il n'a jamais eu.

---

# L'ordre, et pourquoi

| Rang | Idée | Effort | Ce qu'elle débloque |
|---:|---|---|---|
| 1 | **⑥ Les trois moments** | 1 j | Le Hub redevient une question. Rien d'autre ne règle la zone morte n°3 |
| 2 | **① La Dignité en cadran** | 2 j | Deux façons de jouer au lieu d'une corvée. C'est le cœur thématique |
| 3 | **② Le jeu vous ment** | 1 j | La plus mémorable, et la moins chère. Sans elle le mental reste une 2ᵉ barre de vie |
| 4 | **④ Le surnom** | 1 j | Le meilleur retour sur investissement en écriture du projet |
| 5 | **③ Le carton ressource** | 3 j | La plus profonde, mais elle touche à l'équilibrage — après les autres |
| 6 | **⑤ Vos morts** | 1 j | Superbe, mais elle ne parle qu'aux joueurs déjà accrochés |

## Ce que je garde du premier jeu de propositions

Une seule chose, et elle reste au rang zéro : **la physique du carton** — snap
à 60 ms, jauges qui dépassent, deux pixels de secousse. Ce n'est pas une idée,
c'est une réparation. Aucune des six ci-dessus ne se sentira nerveuse tant que
la tuile reviendra mollement sous le doigt.
