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

## Ce qui protège tout ça

`scripts/test-compagnon.mjs`, dix-huit vérifications. La plus importante ne
teste pas le réducteur : elle **relit tout le code source** à la recherche des
appels `hasTrait`, et vérifie que chacun des sept traits prêtables est
réellement interrogé quelque part. Si l'un d'eux perd son branchement un jour,
le test tombe — sans quoi le joueur donnerait son repas contre une ligne de
texte, et rien ne le lui dirait.
