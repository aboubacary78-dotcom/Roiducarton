# Audit de rythme · dynamisme et captivation

*Mesuré dans le jeu construit, pas estimé. Chaque chiffre est reproductible.*

---

# ÉTAPE 1 · Les trois zones mortes

## ① La nuit coûte quatre appuis pour zéro décision

**Mesuré :** passer du jour 1 au jour 2 demande **4 appuis, 4 écrans, 3,6
secondes**, et le bilan de nuit affiche **217 mots**.

| Écran | Ce qu'on y décide |
|---|---|
| Bilan de la nuit | rien |
| Suite du bilan | rien |
| Carton du matin | rien |
| Écran principal | *enfin* |

Quatre fois « Continuer ». **Le joueur paie le prix d'une action pour un
moment où il ne choisit rien**, et il le paie *tous les jours*, c'est la
séquence la plus répétée du jeu. Au jour 20, il l'a traversée vingt fois.

Le problème n'est pas la longueur : c'est que **la nuit est racontée au lieu
d'être jouée**. Un bilan de 217 mots est une page de rapport là où il faudrait
une sensation.

## ② L'action par défaut est la moins interactive du jeu

Sept actions, dont **quatre sont des mini-jeux** où les mains travaillent, la
Récup', le Vol, la Manche, la Bagarre. Et **la première tuile, celle que tout
le monde touche en premier, est Explorer** : la seule qui soit intégralement
du texte.

Ce qu'Explorer produit, mesuré sur les 296 rencontres :

| | |
|---|---:|
| Description à lire | **138 caractères** (médiane) |
| Libellés de choix | **80 caractères** (médiane) |
| Écrans traversés | **3** : carte, choix, résultat |

Un tiers de la journée part donc en lecture, **par défaut**. Les mini-jeux,
eux, sont plus bas dans la page ou demandent une condition. Le jeu met en
avant sa mécanique la plus passive et cache les nerveuses.

> Ce n'est pas un problème de qualité d'écriture, les textes sont bons. C'est
> un problème de **placement** : la porte d'entrée du jeu donne sur sa pièce la
> plus calme.

## ③ Le Hub demande une décision que le joueur a déjà prise

**Mesuré :** l'écran principal fait **1035 px pour un écran de 844** (1,23
écran à défiler), affiche **126 mots** et **14 boutons**, dont 13 atteignables
sans défiler.

Ce n'est pas trop chargé. Le problème est ailleurs, et il est plus grave :
**après trois ou quatre jours, l'arbitrage est résolu**. On mange quand la
faim est basse, on dort quand le sommeil est bas, on fait la Récup' pour
l'argent. Quatorze boutons présentent un choix, mais il n'y en a qu'un ou deux
de raisonnables à un instant donné.

L'ennui du Hub n'est donc pas visuel, le décor bouge, la météo change, le PNJ
est dans la rue. **C'est l'absence de dilemme.** Un écran qui pose une question
dont on connaît la réponse est un écran d'attente, quelle que soit sa beauté.

---

# ÉTAPE 2 · Dynamisme : créer de l'urgence avec du carton

## ④ La carte qui s'affaisse · le compte à rebours qu'on ne voit pas

**Le constat :** un choix d'événement attend indéfiniment. Le joueur peut
poser le téléphone, réfléchir, revenir. Or **hésiter dans la rue coûte
quelque chose**, et le jeu ne le dit jamais.

**La mécanique :** au bout de 6 secondes sans réponse, la carte de l'événement
commence à **gondoler** : une rotation de 1,5° et une translation de 3 px, en
boucle lente, comme du carton qui prend l'humidité. À 10 secondes, **une des
options se barre** : la situation a évolué sans vous.

**Pourquoi c'est élégant ici :**

- **Zéro barre de progression.** Un compte à rebours affiché est laid, stressant
  et générique. Le carton qui fatigue *est* le compte à rebours, et il est dans
  la direction artistique.
- **Le coût est une option, pas des dégâts.** On ne punit pas, on *réduit*. Le
  joueur qui traîne joue toujours, avec moins de latitude.
- **Coût technique : nul.** Deux `transform` en CSS et un `setTimeout`. La DA
  reste strictement statique.

**Réglage :** jamais sur le tout premier jour, ni sur les événements marqués
narratifs. On presse les décisions ordinaires, pas les moments d'écriture.

## ⑤ L'appui long · un deuxième verbe sans un écran de plus

**Le constat :** les sept actions du Hub ont toutes le même geste, l'appui
bref. Un jeu où tout se fait pareil se sent pareil.

**La mécanique :** chaque tuile gagne une lecture **maintenue**.

| Tuile | Appui bref | **Appui maintenu** |
|---|---|---|
| 🙏 Mendier | la manche normale | **insister** : plus d'argent, la dignité paie |
| 😴 Dormir | la nuit normale | **faire la grasse matinée** : récupération pleine, une action de moins |
| 🔍 Explorer | une rencontre | **fouiller à fond** : meilleure issue, du temps en plus |
| ♻️ Récup' | le mini-jeu | **descendre direct d'une couche** : plus riche, plus risqué |

**Pourquoi c'est élégant ici :**

- **Le nombre d'actions double sans un seul écran de plus.** Pas de menu, pas
  de sous-choix : le doigt décide.
- **L'haptique devient le retour d'information.** La vibration monte en
  intensité pendant l'appui, le téléphone dit « tu forces », et c'est
  exactement le sujet du jeu. Le module `haptics` existe déjà.
- **Ça se découvre tout seul.** Un joueur appuie toujours trop longtemps une
  fois par accident. Ce jour-là, il apprend une moitié de jeu.

## ⑥ La physique du carton · la viscéralité par la micro-motion

**Le constat :** l'interface est belle et **immobile**. Sur un écran statique,
la sensation ne peut pas venir de l'animation : elle vient du **délai de
réponse** et de la **masse**.

Trois réglages, tous en `framer-motion` qui est déjà dans le projet :

**a. Les tuiles ont un poids.** À l'appui : `scale 0.96` en 60 ms, retour en
ressort amorti. Pas de fondu, du **snap**. Une tuile qui revient lentement se
sent molle ; c'est littéralement le mot que tu as employé.

**b. Les jauges dépassent puis se posent.** Une jauge qui perd 8 points descend
à 10 puis remonte à 8. Le dépassement est ce qui fait *sentir* le coup. Coût :
un `type: 'spring'` au lieu d'un `tween`.

**c. L'écran encaisse.** Une perte de santé ou de dignité secoue toute la page
de **2 px pendant 120 ms**. Deux pixels, invisible consciemment, ressenti
totalement. C'est le seul moment où le jeu doit bouger.

> **La règle qui tient les trois :** sur une direction artistique statique, on
> ne gagne pas en ajoutant du mouvement partout. On gagne en rendant *rare* et
> *brutal* le peu qui bouge.

---

# ÉTAPE 3 · Captivation : le « un jour de plus »

## ⑦ La dette · le seul minuteur que le joueur emporte dans sa tête

**Le constat :** le jeu a déjà des suites d'événements (`isFollowUp`), mais
elles *arrivent*. Rien ne fait qu'un joueur **attende** un jour précis.

**La mécanique :** au jour 2 ou 3, quelqu'un vous prête 10 €. Le jeu affiche
alors, en permanence dans l'en-tête du Hub, une ligne :

> ⏳ **Roger, dans 3 jours, 15 €**

Le compteur descend chaque nuit. À échéance :

- **On paie** → respect, et Roger reviendra, en mieux.
- **On ne peut pas** → il prend l'objet le plus cher du sac. S'il n'y a rien,
  c'est une bagarre, et il est nourri, lui.
- **On l'évite en changeant de quartier** → il vous trouve au jour suivant, et
  la note a monté.

**Pourquoi ça retient :** c'est un rendez-vous. Un joueur ferme une
application quand rien ne l'attend ; il ne la ferme pas à un jour d'une
échéance. Et l'échéance **n'est pas un bonus qu'on rate**, c'est une menace
qu'on doit désamorcer, ce qui est deux fois plus tenace.

**Coût technique :** un objet dans le personnage (`{ qui, jour, montant }`),
une ligne d'interface, trois branches dans le réducteur. Aucun art nouveau.

## ⑧ Le Karma qui se dépense de son vivant

**Le constat :** le Karma de Rue s'accumule pendant la partie et se dépense au
Cimetière **entre** les parties. C'est de la rétention *inter*-session. Il n'en
existe aucune *intra*-session.

**La mécanique :** une partie du karma devient un **service**, utilisable une
seule fois par partie, depuis n'importe quel écran :

> 🤝 **Appeler un service** : quelqu'un vous doit quelque chose. *(1 fois)*

Ce que ça fait dépend d'où on l'appelle : un repas au Hub, un gardien qui
regarde ailleurs pendant un casse, un adversaire qui renonce en pleine bagarre,
un commerçant qui accepte le prix.

**Pourquoi ça retient :** c'est une **ressource qu'on ne veut pas gâcher**. Un
joueur qui possède un joker unique joue un jour de plus pour trouver le bon
moment de s'en servir, et le jour où il le crame trop tôt, il rejoue pour
faire mieux. C'est le même ressort que la Seconde Chance, mais gratuit et
décidé par lui.

## ⑨ Le compagnon qui dépend de vous

**Le constat :** le système de compagnon existe et fonctionne bien, mais il
**expire à la nuit**. Rien ne se construit, donc rien ne se perd.

**La mécanique :** un compagnon nourri **trois jours de suite** ne repart plus.
Il vous suit. Et à partir de là :

- il **prête son trait en permanence** : un vrai gain, durable ;
- il **mange tous les jours**, sur votre nourriture ;
- si on ne le nourrit pas, **son visage se dégrade** dans l'en-tête, jour après
  jour, avec le système de condition qui existe déjà pour le joueur ;
- au bout de quelques jours de faim, **il s'en va**. Et le jeu ne dit pas
  « compagnon perdu » : il dit qu'un matin, il n'est plus là.

**Pourquoi ça retient :** c'est le seul dilemme du jeu dont **les deux branches
font mal**. Manger, ou le nourrir. Il n'y a pas de bonne réponse, et c'est
précisément ce qu'on emporte en fermant l'application.

Et c'est **la comédie noire au bon endroit** : le jeu ne fait pas la leçon, il
pose une gamelle et s'en va.

---

# Ce que je ferais en premier, et pourquoi

| Rang | Mesure | Effort | Ce que ça change |
|---:|---|---|---|
| 1 | **⑥ La physique du carton** | ½ journée | Le « mou sous le doigt » disparaît. C'est le retour que tu as fait, et il se règle en trois réglages de ressort |
| 2 | **① La nuit en un appui** | 1 journée | Supprime la séquence la plus répétée et la plus vide du jeu |
| 3 | **⑤ L'appui long** | 1 journée | Double le nombre de décisions sans un écran de plus |
| 4 | **⑦ La dette** | 2 journées | Premier vrai rendez-vous. C'est lui qui fabrique le « un jour de plus » |
| 5 | **⑨ Le compagnon durable** | 2 journées | Le poids moral. À faire APRÈS la dette : les deux se répondent |
| 6 | **④ La carte qui s'affaisse** | ½ journée | À régler en dernier, parce qu'il faut le sentir en jouant |
| 7 | **⑧ Le service** | 1 journée | Le moins urgent : il ajoute du confort là où le reste ajoute de la tension |

**Le rang 1 avant tout le reste.** Le dynamisme est un problème de
millisecondes, pas de mécaniques : tant que la tuile revient mollement sous le
doigt, aucune dette et aucun compagnon ne rendront le jeu nerveux.
