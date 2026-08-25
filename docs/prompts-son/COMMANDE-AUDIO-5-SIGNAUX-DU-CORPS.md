# Commande audio — « Le Roi du Carton » — 5 signaux du corps (à refaire)

> ## ✅ LIVRÉ — lot Stable Audio 3, intégré en 3.45.0
>
> Les cinq fichiers sont dans `client/public/audio/` et branchés dans la table
> `VOIX_DU_CORPS` de `client/src/lib/sound.ts`. Chaque jauge a retrouvé son
> bruit propre ; l'alerte neutre `jauge-rouge` ne sert plus que pour la
> dignité, qui n'a pas de corps.
>
> **Ce qui a été mesuré.** Une seule mesure sépare ce lot du précédent, et elle
> tombe sur la plainte d'origine : la part d'énergie au-dessus de 500 Hz, sous
> laquelle un baffle de téléphone ne restitue plus rien. Sur les 528 sons déjà
> embarqués et jamais renvoyés, le 10ᵉ centile est à 24,6 %. Les deux seuls
> fichiers du lot refusé sous ce plancher étaient `corps-faim` (22 %) et
> `corps-epuise` (24 %) — **exactement les deux nommés à l'écoute**. Le nouveau
> lot les remonte à 35 % et 39 %, et les cinq passent.
>
> **Ce qui n'a pas pu être mesuré, et il faut le dire.** Le lot refusé avait de
> MEILLEURS écarts spectraux entre fichiers que celui-ci (0,794 contre 0,325) et
> un facteur de crête dans la même fourchette. Aucune mesure automatique ne
> distingue un bruitage réussi d'un bruitage raté ; le détail de ce qui a été
> essayé puis écarté est en tête de `scripts/controle-signaux-corps.mjs`.
> **L'écoute reste le seul juge.**
>
> **Licence — action ouverte.** Les sources viennent d'un compte Stable Audio 3
> et aucun justificatif de licence n'accompagne les exports. Avant publication
> du jeu monétisé par publicité, vérifier dans les conditions de l'abonnement,
> à la date de génération, que l'usage commercial est couvert — et en garder
> une capture avec les archives du projet.

**Ce document est la commande complète. Tout ce qu'il faut est dedans : aucun
autre fichier n'est nécessaire.**

---

## Pourquoi cette commande existe

Ces cinq signaux ont déjà été livrés une fois, **en voix humaine de synthèse**.
Testés au casque sur téléphone, ils sont inaudibles : « un cri bouillie ».

Le problème n'est pas technique — vérifié : 64 kbit/s, durées de 0,4 à 0,8 s,
niveau correct. **Le problème est que je les avais demandés en voix.** C'était
une erreur de commande, et elle se corrige ici.

---

# La règle qui commande tout le reste

**Ce jeu n'a pas de voix humaines. Sa bande-son est du carton manipulé.**

Roguelite de survie mobile, comédie noire, sur quelqu'un qui dort dehors.
Direction artistique : **dioramas en carton kraft photographiés**. Les 480
autres sons du jeu suivent tous la même règle — la pluie est du riz sur du
papier tendu, un train est une brosse sur du carton ondulé, des pas sont des
doigts sur une boîte à chaussures.

Ces cinq-ci n'y échappent pas, et c'est là que je m'étais trompé : **un
gargouillis d'estomac, une déglutition à sec, un claquement de dents sont du
BRUITAGE, pas du jeu d'acteur.** On les fabrique avec une bouteille d'eau et
une boîte de dominos, pas dans une cabine.

## ⚠️ La consigne qui compte le plus

**Aucun de ces cinq sons ne doit contenir de voix humaine.** Ni souffle, ni
grognement, ni soupir, ni respiration. Si on entend quelqu'un, c'est raté —
c'est très exactement ce qui a été livré la première fois.

Le corps se signale par **ce qu'il fait**, pas par ce qu'il dit.

---

## Où ces sons se jouent, et pourquoi ils sont durs

Ils partent **seuls, dans le silence**, quand une jauge de survie passe dans le
rouge. Aucun autre son ne les accompagne — pas de musique, pas de bruitage
d'action par-dessus. C'est ce qui les rend impitoyables : le moindre défaut
s'entend, alors que les autres sons du jeu sont toujours masqués par autre
chose.

Ils doivent donc être **très propres, très courts, et immédiatement
reconnaissables** — le joueur a le pouce sur un bouton et les yeux ailleurs.

---

## Réglages de sortie

| | |
|---|---|
| Format | **MP3, mono, 48 kHz, 64 kbit/s minimum** |
| Durée | **0,4 s à 0,9 s** |
| Niveau | normalisé, crête à **−1,5 dBFS** |
| Silence de tête | **moins de 10 ms** |
| Noms de fichiers | **exactement** ceux du tableau |
| Dépôt | `client/public/audio/` |

**Suffixe de style à ajouter à la fin de chaque prompt :**

```
Close-miked handmade foley, dry room, no reverb, no music, no human voice
whatsoever, lo-fi domestic recording.
```

---

# Les cinq sons

## 1. `corps-faim.mp3` — le ventre vide

> **Recette foley.** Une bouteille d'eau **à moitié pleine**, inclinée
> lentement d'avant en arrière à cinq centimètres du micro. Le glouglou grave
> et irrégulier qui en sort EST un gargouillis d'estomac. Ajouter, dessous, une
> paille qui aspire le fond d'un verre presque vide.
>
> **Prompt.** A low irregular gurgle of liquid shifting inside a half-empty
> plastic bottle, close-miked, with a thin straw sucking the last of a drink
> underneath. Wet, hollow, slightly comical. No voice.

**L'intention.** Ça doit faire rire jaune, pas inquiéter. Un ventre qui
gargouille est un son de comédie ; c'est ce qui empêche la scène de virer au
misérabilisme.

## 2. `corps-soif.mp3` — la gorge sèche

> **Recette foley.** Un bouchon de liège **tourné à sec** dans un goulot de
> bouteille vide, un quart de tour, lentement. Le grincement râpeux est la
> déglutition. Doubler avec une éponge sèche compressée d'un coup dans le
> poing.
>
> **Prompt.** A dry cork twisting a quarter turn in an empty bottle neck,
> close-miked, rasping and reluctant, with a dry sponge crushed in a fist
> underneath. Arid, tight, uncomfortable. No voice.

**L'intention.** Un son qui donne soif à l'écoute. C'est le seul du lot qui
doive être physiquement désagréable.

## 3. `corps-epuise.mp3` — les jambes qui lâchent

> **Recette foley.** Un grand carton ondulé qu'on laisse **s'affaisser tout
> seul** contre un mur, lentement, jusqu'au contact. Enregistrer la chute
> entière, y compris le petit rebond final. Un sac en papier qu'on dégonfle
> d'une main par-dessus.
>
> **Prompt.** A large sheet of corrugated cardboard slowly collapsing against a
> wall until it settles, including the small final bounce, with a paper bag
> being deflated by hand over the top. Heavy, giving up, slightly funny in how
> undramatic it is. No voice.

**L'intention.** C'est un soupir **sans personne pour le pousser**. Le carton
qui s'affaisse dit l'épuisement mieux qu'un bâillement enregistré, et il reste
dans le monde du jeu.

## 4. `corps-froid.mp3` — le froid qui s'installe

> **Recette foley.** Six ou huit **dominos (ou dés) secoués vite dans les mains
> en coupe**, très près du micro, deux secousses courtes espacées d'un souffle
> — ce sont les dents qui claquent. Dessous, une feuille de papier calque tenue
> à bout de doigts qui tremble.
>
> **Prompt.** Six wooden dominoes rattled fast in cupped hands, two short
> bursts, very close to the microphone, with a sheet of tracing paper
> trembling underneath. Dry, brittle, involuntary. No voice.

**L'intention.** Le seul son du lot qui doive être **rapide**. Le froid ne
s'installe pas lentement dans ce jeu : il attrape.

## 5. `corps-tete.mp3` — la tête qui lâche ⚠️ le plus important

> **Recette foley.** Un doigt mouillé qui tourne sur le **bord d'un verre**,
> pour obtenir une note très fine et très haute, gardée TRÈS BASSE au mixage —
> presque à la limite de l'audible. Par-dessus, un papier journal froissé
> lentement, qui entre et sort du champ comme si l'attention décrochait.
>
> **Prompt.** A very faint high glass-rim tone, barely audible, with newspaper
> being crumpled slowly and unevenly over it, fading in and out as if attention
> keeps slipping. Disorienting, quiet, nothing dramatic. No voice.

**L'intention.** C'est le seul qui accompagne un effet visuel : quand le mental
tombe, **le texte des rencontres se met à se brouiller**, les mots se
mélangent. Sans un son pour dire « c'est votre tête », le joueur croit à un bug
d'affichage. Ce son est donc là pour **désigner une cause**, pas pour faire
peur.

---

# Livraison attendue

1. **Cinq fichiers MP3**, nommés exactement comme ci-dessus.
2. Confirmation qu'**aucun ne contient de voix humaine** — ni souffle, ni
   grognement, ni respiration. C'est le point qui a fait rater la première
   livraison.
3. ⚠️ **La licence d'usage commercial** de l'outil ou de la banque employée,
   nommément. Le jeu est monétisé par la publicité.

## Ce qui se passe si un son manque

Le jeu tourne exactement pareil : les cinq signaux retombent aujourd'hui sur
l'alerte de jauge générique, qui fonctionne. On peut donc livrer les cinq d'un
coup ou un par un.

## Comment les rallumer une fois livrés

Dans `client/src/lib/sound.ts`, la table `VOIX_DU_CORPS` : remplacer les cinq
`playGaugeLowFile` par les `withFile(...)` mis en commentaire juste à côté.
Cinq lignes, et le commentaire au-dessus explique tout le contexte.
