# Le compagnon de journée

*Partager son repas, c'est repartir à deux.*

---

## Ce qu'on n'a pas eu à inventer

La proposition reçue créait trois PNJ fixes — Robert le Parano, Paulette la
Voix Douce, Gégé le Fouilleur — chacun avec un trait passif écrit pour
l'occasion : moins d'alerte au vol, manche doublée, fouille garantie.

Trois faits l'ont rendue caduque, et tous les trois se lisent dans le code.

**Les PNJ ne sont pas un casting.** Ils sont générés : nom, métier, chute
personnelle, et **deux traits tirés dans la table du joueur** (`npc.ts:91`).
Il n'y a ni Robert ni Paulette à qui accrocher quoi que ce soit.

**Les traits demandés existent déjà.** « Surveiller vos arrières » au combat,
c'est `paranoiaque` et `nez-sensible`. « Attirer la pitié » à la manche, c'est
`charismatique`. « Connaître les bonnes bennes », c'est `bricoleur`. Ils sont
écrits, équilibrés, et interrogés à trente endroits du jeu.

**Les PNJ portent déjà ces traits.** Ils étaient simplement décoratifs.

D'où la version retenue : **le compagnon prête un de ses traits**. Aucun effet
nouveau, aucun équilibrage à refaire — une porte ouverte sur ce qui existait.

## Le prix : un repas

Pas de bouton « Faire équipe ». C'est **partager à manger** qui recrute — le
geste altruiste qui existait déjà et ne rapportait qu'un peu de moral. On
n'obtient pas un coup de main gratuitement dans la rue, et le partage cesse
d'être un choix purement sentimental.

Le bouton dit ce qu'il apporte avant qu'on le touche : *« Paulette vous suit
aujourd'hui · 🔨 Bricoleur du Dimanche »*.

## Ce qui se prête, et ce qui ne se prête pas

Sept traits sur vingt. Deux filtres, et les deux comptent.

**Positif seulement.** Le Poissard double le score : prêté le jour de la mort,
il vaudrait double sans rien coûter. Les Os en Mousse et la Phobie des Rats ne
feraient qu'abîmer celui qui vient de donner à manger.

**Et branché quelque part.** La moitié des traits positifs ne sont qu'un bonus
de jauge appliqué à la création du personnage. Les prêter ne ferait
rigoureusement rien, et le joueur croirait avoir gagné quelque chose.

| Trait prêtable | Ce qu'il change dans la journée |
|---|---|
| 🔨 Bricoleur du Dimanche | une arme de fortune au combat |
| ✨ Charismatique | les passants donnent plus |
| 🧭 Sens de l'Orientation | voyager remonte le moral |
| 👃 Nez Sensible | les projectiles sont annoncés |
| 🐦 Ami des Pigeons | les oiseaux rapportent des objets |
| ❄️ Résistant au Froid | la nuit dehors coûte moins cher |
| 🏃 Agile | on s'échappe mieux |

Le compagnon prête le **comportement** du trait, jamais son bonus de jauge :
celui-ci n'est appliqué qu'à la création d'un personnage, et le prêt ne passe
pas par là. Vérifié au chiffre près par le test.

## On ne choisit pas le trait. On choisit la personne.

C'est la limite à connaître, et elle est structurelle : **les PNJ et leurs
traits sont tirés au sort.** On ne décide pas de croiser un bricoleur.

Ce que l'on décide, c'est **où aller**. Le tirage est stable — même jour, même
quartier, même joueur donne toujours la même personne, ce n'est pas une machine
à sous — et le voyage ne coûte aucune action. Trois quartiers reçoivent du
monde : le centre-ville, la gare et le marché.

Mesuré sur **24 000 visites simulées** :

| | |
|---|---:|
| Quelqu'un est là (par quartier social) | **54 %** |
| … et il a un trait à prêter | **59 %** |
| **Un jour donné, au moins un compagnon accessible** | **68,8 %** |
| Compagnons possibles par jour, sur les trois quartiers | **0,96** |
| Écart entre les sept traits prêtés | 13,5 % à 14,9 % — aucun ne domine |

Deux jours sur trois, quelqu'un quelque part peut vous accompagner. Il faut
aller voir.

## Une journée, et pas une de plus

Le jour du partage est inscrit dans la fiche du compagnon. La nuit passée, le
compteur des jours avance et la comparaison cesse d'être vraie : le prêt expire
tout seul. Rien à nettoyer, donc rien à oublier de nettoyer.

Un seul compagnon à la fois — le dernier repas partagé remplace le précédent.

## Ce qui le rend visible

Le visage du compagnon s'ancre à côté de celui du joueur, en haut de l'écran,
avec le nom et le trait prêté en toutes lettres. **Un effet actif qu'on ne voit
pas n'existe pas.**

---

# Celui qui regarde vos poches

**Un compagnon sur quatre s'en va avant le jour**, avec ce qu'il a pu prendre.
Mesuré : 24,9 % des rencontres, sur 8 855.

Il n'a pas triché pour autant : il a tenu sa part toute la journée, le trait
prêté a servi. Il part simplement avec le plus cher du sac — ou, si le sac est
vide, avec trois à sept euros de la poche.

## L'indice est toujours donné

C'est ce qui sépare un piège d'une punition. Un compagnon louche a **forcément**
une phrase de sa propre banque, et un compagnon honnête n'en a **jamais**.
Vérifié sur les 8 855 rencontres : zéro manquant, zéro fausse alerte.

Ces phrases ne disent jamais « attention ». Elles décrivent un geste :

> *« Il regarde votre sac plus souvent que votre visage. »*
> *« Elle vous appelle "mon amie" avant même de savoir votre nom. »*
> *« Il se tient toujours du côté de votre poche. »*
> *« Elle a trois montres au poignet et l'heure d'aucune. »*

Assez proches des autres pour qu'on s'y laisse prendre une fois. Assez marquées
pour qu'on ne s'y laisse plus prendre deux. C'est exactement ce qu'on apprend
dans la rue : lire les gens.

## Et on peut aller le chercher

Une perte sans recours n'enseigne rien. Le vol laisse donc une trace — qui, où,
quoi — et **le voleur traîne encore dans le quartier où vous l'avez nourri**,
deux jours durant. Au-delà, il a revendu et disparu.

Le retrouver ouvre le seul combat du jeu contre quelqu'un qui dort dehors comme
vous. **Son butin est exactement ce qu'il avait pris** : le code de victoire du
combat rend le butin, il n'y a rien de particulier à écrire pour récupérer son
bien.

### Ce qu'il vaut, et pourquoi

La première version lui donnait 34 PV et 11 d'attaque, « par cohérence de
catalogue ». Elle était molle, et deux faits le montraient.

Le catalogue contenait **déjà un « Concurrent Agressif » à 38/13** : le voleur
était plus faible que l'ennemi générique qui porte son nom.

Et il ne se retrouve que dans les trois quartiers sociaux — centre-ville, gare,
marché — dont les rosters comptent les humains les plus durs du jeu, de moyenne
405. À 374, il passait en dessous.

Mesuré sur **400 combats simulés par jour de partie** (joueur volontairement
médiocre : signes au hasard, deux touches encaissées à chaque esquive, première
carte jouée systématiquement — les taux absolus sont donc pessimistes, c'est le
classement qui compte) :

| Adversaire | Jour 2 | Jour 6 | Jour 12 |
|---|---:|---:|---:|
| Pickpocket | 96 % | 87 % | 71 % |
| Commerçant Furieux | 78 % | 61 % | 46 % |
| **Le voleur, ancienne version (34/11)** | **75 %** | **65 %** | **47 %** |
| Concurrent Agressif | 62 % | 45 % | 34 % |
| **Le voleur, désormais (42/14)** | **61 %** | **42 %** | **24 %** |
| Voyou du Coin | 54 % | 35 % | 30 % |

Il se gagnait plus facilement que le Commerçant Furieux, qu'on croise en
appuyant sur « Bagarre » sans raison. Or ce combat-ci se **choisit**, il a un
motif, et il rend quelque chose.

**42 PV, 14 d'attaque.** Juste au-dessus du Concurrent Agressif, sous le Voyou
du Coin : le plus dur des humains ordinaires, la brute du quartier exceptée. Et
la fiction le dit — il a mangé à vos frais et dormi avec vos affaires, c'est
très précisément la personne la mieux nourrie que vous croiserez dehors.

Le test ne fige pas 42 et 14, il tient le **rang** : plus fort que le
Concurrent Agressif, pas plus que le Voyou, et au-dessus de la moyenne des
humains de ces quartiers. Rééquilibrer le catalogue déplacera le seuil sans
casser le test.

La trace s'efface au moment où le combat **commence**, pas à la victoire. On ne
retente pas sa chance jusqu'à gagner.

## Ce qui protège tout ça

`scripts/test-compagnon.mjs`, trente vérifications. La plus importante ne teste
pas le réducteur : elle **relit tout le code source** à la recherche des appels
`hasTrait`, et vérifie que chacun des sept traits prêtables est réellement
interrogé quelque part. Si l'un d'eux perd son branchement un jour, le test
tombe — sans quoi le joueur donnerait son repas contre une ligne de texte, et
rien ne le lui dirait.

La deuxième plus importante balaie 8 855 rencontres pour vérifier que **l'indice
du louche est toujours donné et jamais donné à tort**. Le jour où cette
propriété casse, le piège devient une punition arbitraire.

`scripts/test-compagnon-ecran.mjs` fait le reste dans un vrai navigateur :
le bouton qui annonce la contrepartie avant le geste, le visage ancré en haut
de l'écran avec le trait en toutes lettres, le concurrent qu'on retrouve dans
son quartier — et pas dans un autre.
