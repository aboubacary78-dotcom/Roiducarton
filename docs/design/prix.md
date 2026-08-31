# Les prix · et pourquoi ceux-là

Trois produits, tous **non consommables** : achetés une fois, acquis pour
toujours, restaurables sur un nouveau téléphone.

| Produit | Identifiant Play | Prix | Tu touches |
|---|---|---:|---:|
| Sans pub | `noads` | **2,99 €** | 2,12 € |
| L'Atelier | `atelier` | **4,99 €** | 3,53 € |
| Le Pack (les deux) | `pack_complet` | **6,99 €** | 4,95 € |

« Tu touches » = prix TTC moins la TVA française (20 %) moins la commission
Google (15 % sur le premier million de dollars par an, appliquée
automatiquement).

---

## Pourquoi 6,99 € et pas 8 €

C'était la proposition de départ (« le pack à 7 ou 8 ») et **8 € ne peut pas
marcher** :

```
Sans pub 2,99 €  +  Atelier 4,99 €  =  7,98 €
Pack à 8,00 €                       =  2 centimes de PLUS
```

Un lot plus cher que ses parties n'est pas une offre, c'est un piège, et
c'est le genre de détail qui se retrouve dans les commentaires du store.

**6,99 € économise 0,99 €**, soit 12 %. C'est visible sans calculer, et c'est
ce qu'on écrit sur la carte : « 1 € économisé ».

## Pourquoi 4,99 € et pas 5,00 €

Google Play accepte les deux. Mais tout le magasin est en `,99` : un prix rond
au milieu d'une liste de `,99` se lit comme plus cher qu'il n'est, alors qu'il
coûte un centime de moins. On perd un centime et on gagne la comparaison.

## Pourquoi l'Atelier coûte plus cher que Sans pub

Ce n'est pas la quantité de travail, c'est ce que ça change pour le joueur :

- **Sans pub** retire une gêne. La valeur est plafonnée par la gêne elle-même.
- **L'Atelier** ajoute quelque chose qui n'existe pas autrement, et il touche
  au moment le plus investi du jeu, celui où l'on se choisit un personnage.

## La règle d'affichage, et elle compte

**Le Pack ne s'affiche qu'à qui ne possède RIEN.** Le proposer à quelqu'un qui
a déjà « Sans pub » lui ferait racheter ce qu'il a. Google rembourserait, et à
raison. `packUtile()` tranche, et les Options n'affichent alors que la pièce
manquante, à son prix.

## C'est branché · ce qui reste à faire dans la Play Console

La facturation est en place côté application (`client/src/lib/facturation.ts`,
greffon `cordova-plugin-purchase`, Google Play Billing Library 9). Ce qui suit
ne se fait pas dans le code.

### 1. Créer les trois produits

Play Console → **Monétiser** → **Produits** → **Produits intégrés à
l'application** → *Créer un produit*. Un par ligne du tableau ci-dessus.

| Champ | Valeur |
|---|---|
| ID du produit | `noads`, `atelier`, `pack_complet` : **exactement**, en minuscules |
| Nom | « Sans pub », « L'Atelier », « Le Pack » |
| Prix | 2,99 € / 4,99 € / 6,99 €. Google convertit pour les autres pays |
| État | **Actif** (un produit inactif reste invisible du jeu) |

⚠️ **L'ID ne se change jamais.** Il est gravé dans les achats déjà faits :
le renommer ferait perdre son produit à chaque acheteur.

Ces produits sont non consommables par nature, la Play Console ne demande pas
de choisir : tout produit intégré qui n'est pas consommé par l'application
reste acquis. L'application ne les consomme jamais.

### 2. Téléverser un premier paquet · avant de pouvoir tester

**C'est le point qui surprend tout le monde :** on ne peut PAS essayer un achat
avec un build lancé depuis Android Studio. Google Play Billing refuse de
répondre à une application qui ne vient pas du Play Store. Il faut donc :

1. fabriquer un `.aab` **signé** (voir la clé de signature, plus bas) ;
2. le téléverser sur le canal **Test interne** ;
3. s'ajouter soi-même à la liste des testeurs, et **installer le jeu depuis le
   lien Play Store** que la console fournit.

Tant que l'application vient d'ailleurs, les boutons d'achat afficheront
« Boutique indisponible », ce qui est le comportement correct, pas une panne.

### 3. S'inscrire comme testeur de licence

Play Console → **Paramètres** (compte développeur) → **Tests de licence** →
ajouter son adresse Gmail.

Un testeur de licence paie avec une **carte de test** : la fenêtre de paiement
s'ouvre normalement, l'achat aboutit, et rien n'est débité. C'est le seul
moyen d'essayer le parcours complet sans dépenser trois euros à chaque essai.

Pour recommencer un achat déjà fait : Play Store → *Paiements et abonnements* →
*Budget et historique* → annuler la commande de test.

### 4. Ce qu'il faut vérifier une fois installé

| | Pourquoi |
|---|---|
| Le prix s'affiche sur le bouton | Preuve que le magasin a répondu, s'il vient des chaînes de secours, il serait identique mais le magasin serait muet |
| L'achat ouvre bien le produit | Le parcours complet |
| **Désinstaller, réinstaller, puis « ♻️ Restaurer mes achats »** | Le motif de rejet n° 1 des applications à achats non consommables |
| L'achat survit à un simple redémarrage | La possession est relue au lancement |

## Le prix se change, la clé non

Les trois prix se modifient depuis la Play Console, sans nouvelle version et
sans risque. Si au bout d'un mois les installations montent et les achats non,
descendre l'Atelier à 3,99 € est une manipulation de deux minutes.

Ce qui ne se change jamais, c'est la clé de signature.
