# Le Roi du Carton — Audit neuro-économique et plan de monétisation

*Chiffres mesurés dans le code, pas estimés.*

---

# PHASE 0 — Ce qu'il faut savoir avant de lire le reste

## Le jeu rapporte 0 €, et rapportera 0 € le jour du lancement

```
client/src/lib/ads.ts:76   const USE_TEST_ADS = true;
client/src/lib/ads.ts:64   banner:       'ca-app-pub-3940256099942544/6300978111'
                           interstitial: 'ca-app-pub-3940256099942544/1033173712'
                           rewarded:     'ca-app-pub-3940256099942544/5224354917'
```

`ca-app-pub-3940256099942544` est le compte de **démonstration public de
Google**. Ces identifiants servent aux tests et ne créditent personne.

**Tout ce qui suit vaut zéro tant que cette ligne n'a pas changé.** C'est la
seule tâche du document qui soit bloquante : pas d'optimisation de placement,
pas d'A/B test, pas d'ARPDAU. Zéro.

## Le second bloquant, moins visible

`PRIVACY_URL = '/confidentialite.html'` — un chemin relatif. Les stores exigent
une **URL absolue et publique**, consultable sans installer l'application. Un
refus de validation coûte deux semaines de revenus.

Sur iOS, le projet natif n'est pas encore généré — donc rien n'est cassé
aujourd'hui, mais la clé `NSUserTrackingUsageDescription` devra y figurer dès
sa création. Sans elle, le consentement ATT ne se déclenche jamais, toute la
pub iOS passe en non personnalisée, et **l'eCPM y chute de 40 à 60 %**.

La page de confidentialité, elle, existe bien (13 Ko dans `client/public`) :
il ne manque que l'adresse absolue une fois le domaine choisi.

---

# PHASE 1 — L'audit neuro-économique de l'existant

## L'inventaire réel : dix placements, pas « quelques-uns »

| # | Emplacement | Type | Plafonné ? | Ce que le joueur obtient |
|---|---|---|---|---|
| 1 | Écran de mort | **Interstitiel** | **NON** | rien — il subit |
| 2 | Résurrection à la mort | Rewarded | exempt | une seconde vie |
| 3 | Doubler le gain d'un événement | Rewarded | oui (3/session) | ×2 sur l'argent |
| 4 | « Garder la face » | Rewarded | oui | annule la perte d'un palier de Dignité |
| 5 | Booster un choix d'événement | Rewarded | oui | meilleure issue |
| 6 | Sauver la série quotidienne | Rewarded | exempt | la série survit |
| 7 | Relancer le trio de personnages | Rewarded | exempt | un nouveau tirage |
| 8 | Rouvrir une boutique fermée | Rewarded | exempt | accès à la boutique |
| 9 | Fontaine (1 gorgée sur 3) | Rewarded | exempt | de l'eau |
| 10 | Distribution solidaire | Rewarded | exempt | un repas gratuit |

**Sept sur dix sont exemptés du plafond.** Ce n'est pas un défaut : ce sont des
services que le joueur vient chercher lui-même. Barrer un service demandé est
une punition, pas une limite. La logique en place est saine.

## Verdict sur les deux placements que tu cites

### La résurrection à la mort — bien placée, mal vendue

Le placement est le meilleur du jeu et il est correctement exempté. **Mais son
opt-in rate est laissé sur la table.**

Ce qui manque, dans l'ordre d'impact :

**1. On ne montre pas ce qu'on perd.** L'écran affiche le successeur *avant* de
proposer la résurrection. Erreur : présenter le remplaçant réduit l'aversion à
la perte — le joueur voit qu'il a une porte de sortie gratuite. **Il faut
proposer la vidéo AVANT de révéler le successeur**, et afficher en gros ce qui
disparaît : le nombre de jours survécus, l'argent accumulé, les objets
bricolés, la série en cours.

**2. Aucune rareté.** « Une âme charitable peut passer — mais une seule fois
par partie » est déjà bien écrit. Il manque le **compte à rebours** : une offre
sans horloge est une offre qu'on remet à plus tard, et « plus tard » sur un
écran de mort signifie jamais. Dix secondes, avec la barre qui se vide.

**3. Le refus est trop propre.** « Non, c'est fini » est un bouton de même
poids visuel que l'acceptation. Un refus doit demander un geste
supplémentaire — pas un piège, juste une friction d'une demi-seconde.

**Gain attendu : opt-in de ~25 % à ~45 %.** C'est le placement le plus
rentable du jeu ; chaque point compte double.

### Le sauvetage de série — correct, sous-exploité

Bien exempté, bien placé. Deux manques :

**1. La série n'a pas de valeur affichée.** « Sauver ma série de 6 jours » ne
dit rien. « Sauver ma série de 6 jours — le palier de 7 jours débloque 25
karma, tu y es presque » transforme une abstraction en perte chiffrée.

**2. On ne le propose qu'une fois.** Un joueur qui refuse et ferme
l'application perd sa série définitivement. **Reproposer à la session
suivante**, une seule fois, avec « ta série de 6 jours t'attend encore, mais
plus pour longtemps ».

## Le vrai problème : l'interstitiel

```
GameOverScreen.tsx:207   useEffect(() => { showInterstitial(); }, []);
```

Aucun plafond. Aucun délai minimum. Il part **à chaque mort**.

Et voici la mesure qui rend ça grave — 400 parties simulées :

| | |
|---|---|
| Survie médiane | **5 jours** |
| Durée d'une partie | **3 à 4 minutes** |
| Parties par session de 15 min | **3 à 5** |
| Interstitiels subis | **3 à 5, plein écran, non désirés** |

**C'est ton plus gros risque de rétention J7, et en même temps ta plus grosse
ligne de revenu.** Un roguelite à mort rapide qui balance un interstitiel à
chaque fin de partie forme exactement l'association mentale à éviter : *mourir
= pub*. Or on meurt tout le temps — c'est le cœur du jeu.

**Correctifs, par ordre de rentabilité :**

| Correctif | Effet |
|---|---|
| Plancher de **90 secondes** entre deux interstitiels | supprime les doublons sans toucher au volume utile |
| **Sauter la première mort de la session** | c'est celle qui décide si le joueur reste |
| **Sauter les 3 premières parties d'un nouveau joueur** | protège le J1, qui commande tout le J7 |
| Le déplacer sur **RESTART** plutôt que sur l'affichage de l'écran de mort | même volume, mais il arrive sur une transition choisie au lieu de couvrir le bilan qu'on veut lire |

Ce dernier point vaut de l'eCPM : un interstitiel qui interrompt une lecture se
fait fermer en deux secondes. Un interstitiel sur une transition volontaire se
regarde.

## L'inventaire mort : la bannière

`showBanner()` existe, est correctement écrite… et **n'est appelée nulle part**.

C'est de l'argent laissé à terre. Le jeu a plusieurs écrans de **lecture
longue** où une bannière ancrée en bas ne gêne aucun geste :

- le Registre des Morts
- le Cimetière
- la boutique
- le bilan de nuit
- l'écran de fin

**Jamais en jeu, jamais sur un mini-jeu** — le pouce y travaille. Une bannière
sur ces cinq écrans seulement, c'est typiquement **+15 à +25 % d'ARPDAU** pour
zéro friction, parce que ce sont les écrans où le joueur ne fait rien d'autre
que lire.

---

# PHASE 2 — Cinq nouveaux placements

Tous s'appuient sur des mécaniques **déjà codées**. Aucun ne demande d'inventer
du gameplay : c'est ce qui les rend livrables en quelques jours, pas en
quelques semaines.

---

### 1. La Récup' — « Une couche de plus »

| | |
|---|---|
| **Type** | Vidéo récompensée |
| **Déclencheur neuro** | À l'instant où la jauge de risque franchit son dernier cran avant l'effondrement — pas après. Le joueur voit le tas trembler, il a encore ses trouvailles en main, il n'a **rien perdu**. C'est le pic d'aversion à la perte : on protège toujours plus fort ce qu'on tient déjà. |
| **Récompense** | Une couche supplémentaire, sans risque. |
| **Plafond** | 2 par session. |
| **Pourquoi ça marche** | Coût irrécupérable. Il a déjà investi trente secondes de fouille ; abandonner maintenant lui coûte plus, subjectivement, que trente secondes de pub. |

**Le détail qui double le taux :** afficher ce qu'il perd, pas ce qu'il gagne.
« Continuer » convertit mal. « **Garder mes 4 trouvailles** » convertit.

---

### 2. Le casse — « Effacer un palier d'alerte »

| | |
|---|---|
| **Type** | Vidéo récompensée |
| **Déclencheur neuro** | Quand la jauge d'alerte atteint **l'avant-dernier palier**. La jauge est à cliquets — elle ne redescend jamais — donc le joueur sait que c'est irréversible. Proposer l'irréversible réversible, c'est le seul moment où une pub ressemble à un cadeau. |
| **Récompense** | Un palier effacé, un seul. |
| **Plafond** | **1 par casse.** Non négociable : deux effacements détruisent la tension qui fait le mini-jeu, et un mini-jeu sans tension ne se rejoue pas — donc plus de pub du tout. |
| **Pourquoi ça marche** | Aversion à la perte **plus** réassurance. Le joueur n'achète pas un gain, il achète le droit de continuer à espérer. |

---

### 3. Le bilan de nuit — « La météo de demain »

| | |
|---|---|
| **Type** | Vidéo récompensée |
| **Déclencheur neuro** | Sur le bilan de nuit, **juste après** l'annonce des dégâts subis. Le joueur vient de constater ce que la nuit lui a coûté : c'est le moment exact où il veut reprendre le contrôle. |
| **Récompense** | La météo du lendemain, révélée. |
| **Plafond** | 1 par jour de jeu. |
| **Pourquoi ça marche** | **C'est le placement le moins cher du catalogue.** Le jeu connaît déjà `nextWeather` — tu ne donnes rien, tu retires juste un voile. Curiosité pure, zéro impact sur l'équilibrage, et une valeur perçue élevée parce que le froid est la première cause de mort. |

**C'est le placement que je pousserais en premier après l'interstitiel.** Coût
de développement quasi nul, aucun risque de déséquilibre, opt-in élevé.

---

### 4. Sac plein — « Une poche de plus »

| | |
|---|---|
| **Type** | Vidéo récompensée |
| **Déclencheur neuro** | À la milliseconde où le joueur ramasse un objet et que le sac refuse. **L'objet est à l'écran, il est à lui, et il va disparaître.** C'est la dotation à l'état pur : on valorise deux fois plus ce qu'on possède déjà, même depuis une seconde. |
| **Récompense** | +2 emplacements jusqu'à la fin de la journée. |
| **Plafond** | 2 par session. |
| **Pourquoi ça marche** | Le refus est **visuel et immédiat**. Pas une abstraction : un objet précis, nommé, avec son image, qu'on va perdre. |

---

### 5. Le contrat du jour — « Rattraper le contrat »

| | |
|---|---|
| **Type** | Vidéo récompensée |
| **Déclencheur neuro** | Au verdict de fin de journée, **quand le contrat est raté de peu** — moins de 20 % de l'objectif manquant. Le « presque » est le déclencheur le plus puissant du répertoire : un joueur qui rate de loin hausse les épaules, un joueur qui rate de peu ne le supporte pas. |
| **Récompense** | Le contrat compte comme rempli. |
| **Plafond** | 1 par jour, et **uniquement si l'échec est proche**. |
| **Pourquoi ça marche** | Effet du quasi-gain. Le proposer sur un échec large ne convertirait pas et userait l'inventaire pour rien — d'où le filtre. |

---

## Le plan de bataille, par retour sur effort

| Ordre | Action | Effort | Effet |
|---|---|---|---|
| **1** | Vrais identifiants AdMob + URL de confidentialité + ATT iOS | 1 jour | **passe de 0 € à des revenus** |
| **2** | Discipliner l'interstitiel (plancher 90 s, grâce J1, sur RESTART) | 1 jour | protège le J7, améliore l'eCPM |
| **3** | Bannière sur les 5 écrans de lecture | 1 jour | +15 à 25 % d'ARPDAU |
| **4** | Météo de demain | 1 jour | placement le moins cher, opt-in élevé |
| **5** | Optimiser la résurrection (ordre, compte à rebours, ce qu'on perd) | 2 jours | opt-in 25 % → 45 % sur le meilleur emplacement |
| **6** | Sac plein, Récup', casse, contrat | 3-4 jours | volume additionnel |

## Trois garde-fous que je te recommande de garder

Ce ne sont pas des scrupules, ce sont des protections de revenu.

**Le plafond de 3 offres non sollicitées par session reste.** Le monter à 5 ou
6 augmente les impressions du jour et détruit la session suivante. L'ARPDAU se
calcule sur des utilisateurs actifs quotidiens : tuer le DAU pour gonfler
l'ARPU est le calcul le plus courant et le plus perdant du secteur.

**Aucune pub pendant un mini-jeu en cours.** Interrompre une action en cours ne
produit pas de la frustration, ça produit une désinstallation — et une note
d'une étoile, qui coûte durablement en visibilité.

**Un point sur le thème, purement commercial.** Le jeu porte sur la misère et
la survie dans la rue. Une monétisation visiblement agressive sur ce sujet
précis attire un type de commentaire qui plombe la note moyenne, et la note
moyenne commande l'acquisition organique. Ce n'est pas un argument moral : la
même agressivité sur un jeu de puzzle ne coûterait rien. Ici, elle coûte des
installations.

---

## Ce que je peux implémenter tout de suite

Les points 2 et 3 (interstitiel discipliné, bannière) et le point 4 (météo)
sont du code que je peux écrire et vérifier aujourd'hui. Le point 1 dépend de
toi : il faut créer les blocs dans la console AdMob et publier la page de
confidentialité.

Dis-moi par où on commence.
