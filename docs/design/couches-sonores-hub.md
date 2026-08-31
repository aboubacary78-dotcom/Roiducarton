# Ce que j'avais ajouté au fond sonore du hub, et pourquoi je l'ai retiré

Retour du test sur téléphone, 3.45.0 :

> « Il y a des sons genre… c'est notamment dans le hub, tantôt des grattements,
> des bruits bizarres. On va laisser le son qu'on a mis de base pour le hub, et
> tout ce que tu as ajouté en trop, tu m'analyses ce que tu voulais faire et je
> vais voir si c'était pertinent ou pas. »

Voici l'analyse. Tout est retiré du jeu ; **rien n'est supprimé du disque**, et
tout revient d'un `git revert` si tu juges qu'une des deux couches valait le
coup.

---

## Ce qui joue dans le hub, avant et après

| Couche | Fichiers | Depuis | État |
|---|---|---|---|
| Lit du quartier `amb-<lieu>` | 5 | 12 août, **d'origine** | ✅ gardé |
| Météo `meteo-<temps>` | 5 | 12 août, **d'origine** | ✅ gardé |
| Signature `amb-sig-<lieu>` | 5 | 25 août, **ajouté par moi** | ❌ retiré |
| Respirations `vie-*` | 10 | 25 août, **ajouté par moi** | ❌ retiré |

---

## Couche 1 · la signature du quartier

**Ce que c'était.** Une **deuxième boucle continue**, différente du lit, qui
tournait par-dessus lui en permanence. Une par quartier.

**Ce que je voulais.** Les cinq lits `amb-<lieu>` tiennent le fond
correctement, mais ils se ressemblent : les yeux fermés, on ne reconnaît pas la
gare du marché. Je cherchais à donner un caractère à chaque quartier sans
toucher aux lits livrés.

**Pourquoi c'était raté.** J'avais écrit dans le code, en toutes lettres :
« sous le lit du quartier, jamais devant ». **La mesure dit le contraire.**

| | niveau moyen une fois le gain appliqué |
|---|---|
| `amb-parc` (le lit) | −30,7 dBFS |
| `amb-sig-parc` (ma signature) | **−28,6 dBFS** |

La signature jouait **2 dB au-dessus** du lit qu'elle était censée soutenir.
J'avais réglé son gain à 0,38 en supposant que les fichiers arrivaient au même
niveau ; ils n'y arrivaient pas, et je n'avais pas vérifié. Ce n'était donc pas
une couche discrète : c'était une deuxième ambiance en concurrence avec la
première.

---

## Couche 2 · les respirations

**Ce que c'était.** Dix sons ponctuels, pigeon qui décolle, klaxon, tôle,
**rat**, cagette, **papier kraft** : tirés au hasard **toutes les 22 à 48
secondes**, sans aucune cause dans le jeu.

**Ce que je voulais.** Je pariais que « dans un endroit, il arrive des choses
qu'on n'a pas demandées ». C'est vrai au cinéma.

**Pourquoi c'était raté, et c'est la vraie leçon.** Partout ailleurs dans « Le
Roi du Carton », **tout son a une cause visible** : tu touches, ça répond. Le
joueur apprend cette règle en trois minutes. Un grattement qui tombe tout seul
sur un hub immobile ne se lit donc pas comme de l'atmosphère : il se lit comme
un bug. C'est exactement le retour reçu, « des grattements, des bruits
bizarres ».

Et ils n'étaient pas discrets non plus :

| | niveau moyen | crête |
|---|---|---|
| `amb-parc` (le lit) | −30,7 dBFS | −16,7 |
| `vie-zi-rat` (le rat) | **−24,0 dBFS** | **−9,1** |
| `corps-faim` (une alerte de survie) | −23,2 dBFS | −2,9 |

Le rat jouait **presque au niveau d'une alerte de survie**, et 7 dB au-dessus
du fond. Sur les deux couches, la même erreur : j'ai réglé des gains sans
mesurer ce qu'ils donnaient une fois posés l'un sur l'autre.

---

## Le fond était-il trop fort ? Oui, et voici le calcul

Trois boucles tournaient en même temps dans le hub :

```
lit du quartier   0,55
signature         0,38     ← retirée
météo             0,42
                  ────
                  1,35 de somme de gains
```

Une fois la signature retirée, il reste **une ambiance et la météo**, et la
météo est très en dessous (−38,8 dBFS, soit 8 dB sous le lit, elle n'ajoute
que 0,4 dB au total). Le fond se retrouve donc **environ 15 dB sous les
alertes** et 7 dB sous les bruitages d'action.

**C'est un écart sain, et c'est pourquoi je n'ai pas baissé le lit d'origine
en plus.** Le problème de volume venait des couches ajoutées, pas du lit. Si
après écoute tu le trouves encore trop fort, c'est une ligne à changer, dis-le
et je le baisse.

À noter : **il n'y a pas de réglage de volume dans les Options**, seulement un
bouton sourdine. Si le niveau général doit se régler au cas par cas, c'est un
curseur qu'il faut, pas une nouvelle valeur écrite en dur.

---

## Si tu veux en rappeler une

Les vingt fichiers sont toujours dans `client/public/audio/`. Ils ne coûtent
rien tant qu'aucun code ne les demande.

- **Les respirations `vie-*`** : je déconseille de les rebrancher telles
  quelles. Le problème n'est pas leur niveau, il est qu'aucune cause ne les
  explique. Elles auraient un sens **attachées à un geste**, la tôle quand on
  fouille en zone industrielle, le klaxon quand on traverse le centre-ville,
  et ça, c'est un travail de branchement, pas de réglage.
- **La signature `amb-sig-*`** : rebranchable, mais il faudrait d'abord la
  remettre **sous** le lit pour de bon, c'est-à-dire régler son gain sur une
  mesure et non au jugé. Le gain juste serait autour de 0,20, pas 0,38.

Le contrôle `scripts/test-sons-branches.mjs` les liste maintenant comme
dormants assumés. Les rebrancher sans les sortir de cette liste fera échouer le
test, c'est voulu.
