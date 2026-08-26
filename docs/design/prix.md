# Les prix — et pourquoi ceux-là

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

C'était la proposition de départ — « le pack à 7 ou 8 » — et **8 € ne peut pas
marcher** :

```
Sans pub 2,99 €  +  Atelier 4,99 €  =  7,98 €
Pack à 8,00 €                       =  2 centimes de PLUS
```

Un lot plus cher que ses parties n'est pas une offre, c'est un piège — et
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
  au moment le plus investi du jeu — celui où l'on se choisit un personnage.

## La règle d'affichage, et elle compte

**Le Pack ne s'affiche qu'à qui ne possède RIEN.** Le proposer à quelqu'un qui
a déjà « Sans pub » lui ferait racheter ce qu'il a — Google rembourserait, et à
raison. `packUtile()` tranche, et les Options n'affichent alors que la pièce
manquante, à son prix.

## Avant publication

1. Créer les trois produits dans la Play Console avec les identifiants
   ci-dessus, en **non consommables**.
2. Brancher `purchaseRemoveAds`, `purchaseAtelier` et `purchasePack` sur le
   vrai achat — elles ouvrent l'accès directement aujourd'hui, ce qui est un
   marqueur de développement, pas un oubli.
3. **La restauration des achats** : le bouton existe déjà dans les Options —
   « ♻️ Restaurer mes achats » — et il reste visible même pour qui possède
   tout, parce que sur un nouveau téléphone le jeu ne sait justement plus rien.
   Il ne lui manque que d'interroger la facturation : `restaurerAchats()` dans
   `lib/ads.ts` répond aujourd'hui « rien retrouvé », honnêtement, faute
   d'historique à consulter. Y brancher `queryPurchases()` et rouvrir chaque
   produit trouvé.
4. Ne PAS écrire les prix en dur dans l'application. Google renvoie le prix
   localisé — un joueur canadien doit lire des dollars canadiens, pas des
   euros convertis de travers. Les cartes des Options n'affichent donc aucun
   montant tant que le vrai achat n'est pas branché.

## Le prix se change, la clé non

Les trois prix se modifient depuis la Play Console, sans nouvelle version et
sans risque. Si au bout d'un mois les installations montent et les achats non,
descendre l'Atelier à 3,99 € est une manipulation de deux minutes.

Ce qui ne se change jamais, c'est la clé de signature.
