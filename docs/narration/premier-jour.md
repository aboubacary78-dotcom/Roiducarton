# Le premier jour · quatre temps

*Ce que le jeu retire au débutant, et ce qu'il lui dit à la place.*

---

## Le seul défaut réel de l'écran d'accueil

Mesuré sur l'écran, pas estimé : **quinze éléments interactifs visibles au jour
un**, dont **neuf actions**. La page fait 1,30 écran de haut.

Deux de ces neuf actions sont la Bagarre et le Vol. Ce sont les deux qu'un
joueur qui vient d'arriver ne peut pas évaluer, et ce sont celles qui le tuent.
Elles quittent donc le tout premier écran, et reviennent dès la première
action faite.

**Rien d'autre n'est masqué.** Pas les jauges, pas le contrat, pas la météo.

## Pourquoi rien d'autre

Deux propositions revenaient dans les plans reçus. Les deux étaient déjà en
place, ce qui se vérifie en trois lignes de code :

| Proposition | État réel |
|---|---|
| « Remplacer les valeurs numériques des jauges par des barres, garder les chiffres pour un menu détaillé » | `StatBars.tsx:184`, barres et emoji, **aucun chiffre** ; le chiffre n'apparaît que sous le seuil de danger, la Dignité affiche son palier en toutes lettres, et le détail chiffré est derrière un appui |
| « Remplacer les info-bulles bloquantes par des notifications éphémères en bas d'écran » | `CoachTip.tsx` : une barre en bas, sans fond, non bloquante, un conseil à la fois, déclenché sur une condition réelle du jeu |

Et une troisième, à écarter : masquer la jauge de Sommeil au jour un en
repoussant l'action « Dormir » au jour deux. Le sommeil perd **quinze points
chaque nuit**. Le joueur se réveillerait au jour deux avec un déficit qu'il
n'avait aucun moyen de voir venir ni de traiter.

---

## Les quatre temps

Une option qui manque sans raison est un bug, pas une intention. Ces quatre
textes donnent au masquage une cause qui appartient au personnage : il ne
« débloque » rien, il se met à voir.

### ① L'arrivée · sous la scène, avant la première action

> Personne ne vous attend nulle part, et ça laisse la journée entière. Regardez
> comment le quartier tourne avant de faire un faux pas.

Il remplace la ligne d'ambiance du lieu, et lui rend sa place dès la première
action faite.

### ② La révélation · au retour de la première action

> Fin du tour d'observation. Vous voyez les poches qui dépassent, et les
> mâchoires qui cherchent un poing.

Elle tombe à l'instant où la Bagarre et le Vol réapparaissent dans la grille.
Ce n'est pas un déblocage de niveau : c'est une perte d'innocence.

### ③ Le crépuscule · au-dessus de « Jour Suivant », le premier soir

> Le béton refroidit plus vite que vous. Il n'y a plus rien à faire aujourd'hui
> qu'attendre demain.

La nuit n'est pas un écran de chargement, c'est une épreuve qu'on subit sans
rien pouvoir faire. Autant le dire avant, pas après.

### ④ Le réveil · au matin du jour deux

> Le carton ondulé n'est pas un matelas, quelle surprise. Dormir ne répare
> rien, ça permet juste de tenir debout.

Après la perte, jamais avant : dire la veille « pensez à dormir » n'apprend
rien à personne.

---

## Les deux règles d'écriture

**On vouvoie.** Comme partout ailleurs dans le jeu. Les versions reçues
tutoyaient ; le jeu ne tutoie nulle part, et une voix qui change de registre au
premier jour s'entend tout de suite.

**Aucun texte ne nomme le lieu.** Les trois versions reçues situaient la scène
à la gare. Le quartier de départ est tiré au sort entre la gare, le marché, le
parc et le centre-ville : une phrase qui parle de la gare est **fausse trois
fois sur quatre**. C'est vérifié par le test, sur la phrase elle-même.

## Une seule voix à la fois

Le conseil mécanique du soir, « Plus d'action. La nuit consomme vos jauges »,
se tait le premier soir : le crépuscule a déjà sa phrase, au même endroit.
Deux textes qui disent la même chose au même moment, c'est un texte de trop.

Il ne perd rien à attendre le lendemain : la première nuit ne peut pas tuer
(`withFirstDayNet`), et il servira vraiment au deuxième soir.

## Le trou qu'on a fermé en passant

Le contrat du matin se tirait au hasard parmi cinq. Une fois sur cinq, il
tombait sur **« Gagner un combat aujourd'hui »** : pendant que le bouton
Bagarre n'était pas à l'écran. Le paquet du premier matin écarte donc les
contrats qui exigent une action masquée, et pour cette seule partie
(`paquetDuPremierMatin`).

## Ce qui protège tout ça

`scripts/test-premier-jour.mjs`, quinze vérifications dans un vrai navigateur :
les deux actions absentes puis présentes, les quatre textes à leur place, la
phrase d'arrivée qui ne nomme aucun lieu, et, c'est le plus important, **la
deuxième partie qui n'y a pas droit**. Éprouvé sur le code d'avant : il y
relève cinq échecs.

## Ce qui n'est pas mesurable aujourd'hui

Les plans reçus proposaient de juger la refonte sur le taux de complétion du
jour 1, le taux de survie au jour 3 et le temps passé sur le premier écran.

**Le jeu n'embarque aucune analytique.** Aucune de ces trois métriques n'existe
ni ne peut être calculée. Il faudrait d'abord poser une couche de mesure, ce
qui est un travail à part entière, et un choix à faire en connaissance de
cause.
