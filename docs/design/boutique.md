# La Boutique — conception, textes, plan d'intégration

Les trois produits vivent aujourd'hui au fond de l'écran des Options, entre le
volume sonore et le formulaire de consentement. C'est l'endroit où l'on va
quand quelque chose ne va pas, pas quand on a envie de quelque chose.

Ce document décrit l'onglet Boutique : ce qu'on active chez le joueur, comment
l'écran le guide, et le texte exact.

---

## 0. Trois garde-fous, posés d'abord

Ils ne sont pas des précautions de principe : chacun coûte plus cher que ce
qu'il rapporterait.

### Pas de fausse promotion — c'est illégal et c'est un motif de retrait

La demande initiale parlait de « fausses promos au marqueur baveux ». Un prix
barré qui n'a jamais été pratiqué tombe sous la directive Omnibus, transposée
en France à l'article L.112-1-1 du code de la consommation : **le prix de
référence affiché doit être le prix le plus bas pratiqué dans les trente jours
précédents.** La DGCCRF sanctionne, et Google Play retire au titre de
*Deceptive Behavior*.

Le remède ne coûte rien, parce que l'économie du Pack est **réelle** :
`noads` + `atelier` pris séparément coûtent bel et bien un euro de plus, et ce
prix-là est pratiqué **dans le même écran, au même instant**. Le barré est donc
licite, vérifiable par le joueur en trois secondes — et c'est précisément ce
qui le rend crédible. On garde l'esthétique du marqueur, on jette le mensonge.

### Pas de compte à rebours

Un minuteur sur un produit permanent qui sera au même prix demain est une
fausse rareté. Le joueur qui revient le lendemain et retrouve l'offre apprend
deux choses d'un coup : que le prix ne bougeait pas, et qu'on lui a menti. Le
gain d'un jour se paie sur toute la durée de vie du jeu.

L'urgence honnête existe et elle est meilleure : **elle est diégétique**. Ce
n'est pas « plus que 2 h », c'est « ce personnage-ci va mourir, et le suivant
sera tiré au sort comme celui-là ». La pression vient du jeu, pas d'une
horloge.

### Aucun prix écrit en dur dans un texte

Google convertit dans la monnaie du joueur, taxes locales comprises. Toute
chaîne contenant « 2,99 € » ment à quiconque n'est pas dans la zone euro.
Tous les prix passent par `prixAffiche()` de `lib/facturation.ts`, y compris
le total barré du Pack, qui se **calcule** — voir §2.

---

## 1. Stratégie : ce qu'on active, produit par produit

### « Sans Pub » — le recadrage vaut plus que tout l'habillage

Le levier principal n'est pas un biais, c'est une **erreur de perception à
corriger**, et elle est dans le nom du produit.

« Supprimer les pubs » est un produit **soustractif** : le joueur croit acheter
une absence. Or dans ce jeu, l'achat **ajoute** — tous les coups de pouce du jeu
(seconde chance, gains doublés, extincteur, vol tranquille, secours de nuit…)
lui viennent alors sans rien avoir à regarder. Il achète en réalité un jeu
*plus riche*, et le libellé lui vend un jeu *amputé d'un désagrément*.

Un produit additif se vend mieux qu'un produit soustractif, à contenu
identique. Le recadrage est le premier levier, avant toute typographie.

Ensuite, dans l'ordre d'efficacité :

| Levier | Mise en œuvre concrète |
|---|---|
| **Aversion à la perte** (une perte pèse ~2× un gain) | Ne pas parler de ce qu'on gagne — parler de ce qu'on perd aujourd'hui. Chiffré, avec les vraies données du jeu : survie médiane de cinq jours, trois à cinq morts par quart d'heure. |
| **Coût d'interruption** | Ce n'est pas la durée de la pub qui fait mal, c'est la rupture. Le texte doit nommer l'interruption, pas les secondes. |
| **Effet de dotation** (on surévalue ×2 ce qu'on possède déjà) | Voir §4 : la dégustation. C'est le levier le plus puissant du lot et il n'est pas dans la boutique. |

### « L'Atelier » — faire fabriquer avant de faire payer

L'effet IKEA (Norton, Mochon & Ariely, 2011) : on surévalue nettement ce qu'on
a assemblé soi-même. Il ne se déclenche pas en décrivant l'Atelier — il se
déclenche en **le faisant utiliser**.

**Recommandation principale : l'Atelier s'ouvre en essai libre.** Le joueur
compose son visage, choisit ses deux traits, voit le résultat — et le paywall
tombe au moment de **valider**. À cet instant, on ne lui vend plus une
fonctionnalité, on lui vend *ce personnage-là*, qu'il vient de faire et qui
attend sur l'écran. C'est un changement d'implémentation modeste
(`AtelierOverlay` existe déjà, il suffit d'inverser la garde) pour le plus gros
écart de conversion attendu du document.

| Levier | Mise en œuvre concrète |
|---|---|
| **Effet IKEA** | Essai libre, paywall au clic de validation. |
| **Agentivité vs hasard subi** | L'Atelier n'est PAS cosmétique : il choisit deux traits de départ sur douze positifs, et supprime le Poissard imposé. C'est de la maîtrise, ça se vend plus cher qu'une couleur de peau. Le texte doit le dire en premier. |
| **Rareté** | Le catalogue permet 3 612 672 000 visages. Le chiffre sert à NOUS, pas au joueur : dans le texte il devient « Votre tête. Pas celle du tirage. » Un nombre à dix chiffres impressionne un tableur, pas quelqu'un qui veut une tête. |
| **Aversion à la perte, version roguelite** | Ce jeu tue le personnage. L'Atelier est le seul achat dont la valeur *augmente* à chaque mort — et la mort est donc son meilleur moment de vente. Voir §4. |

### Le Pack — il est là pour ancrer, pas seulement pour se vendre

Effet d'ancrage : le premier prix lu sert de référence à tous les suivants.
Placé **en haut**, le Pack fait lire l'Atelier seul comme un repli raisonnable,
et non comme une dépense. Une part de ce qu'il rapporte, il le rapporte en
vendant autre chose que lui-même.

Il disparaît pour qui possède déjà une moitié — `packUtile()` s'en occupe
déjà, et lui vendre le lot lui ferait racheter ce qu'il a.

---

## 2. Architecture visuelle

Écran dédié, `BoutiqueScreen.tsx`, 390 × 844 de référence.

### Le squelette

```
┌─────────────────────────────────────┐  scotch fluo aux deux coins
│  ▚      LE MARCHÉ NOIR           ▚  │  pancarte, rotation −1.5°
│    Deux choses à vendre. Prenez,    │
│    ou passez votre chemin.          │
├─────────────────────────────────────┤
│ ╔═══════════════════════════════╗   │  ← ZONE 1 · 0–38 %
│ ║ TOUT LE CARTON     ⟋LES DEUX⟍ ║   │    kraft FONCÉ (contraste de valeur)
│ ║ La paix, et une tête à vous.  ║   │    ruban d'angle 45°, coin haut droit
│ ║ ✦                             ║   │
│ ║  ~7,98~   6,99 €              ║   │    barré au marqueur (SVG tremblé)
│ ║ ┌───────────────────────────┐ ║   │
│ ║ │  JE PRENDS TOUT — 6,99 €  │ ║   │    ← FLUO
│ ║ └───────────────────────────┘ ║   │
│ ╚═══════════════════════════════╝   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │  ← ZONE 2 · 38–70 %
│ │ [avatar vivant]  L'ATELIER   ⌸│   │    étiquette percée, pendue, inclinée
│ │       ↻          ✦ ✦ ✦        │   │    ↻ = « et si on retirait un trait ? »
│ │ ┌───────────────────────────┐ │   │
│ │ │  ME FAIRE UNE TÊTE — …    │ │   │    ← FLUO
│ │ └───────────────────────────┘ │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │  ← ZONE 3 · 70–92 %
│ │ LA PAIX           (ton FROID) │   │    violet #7B68EE, pas kraft
│ │ ✦ ✦                           │   │
│ │ ┌───────────────────────────┐ │   │
│ │ │ QU'ON ME FICHE LA PAIX —… │ │   │    ← FLUO
│ │ └───────────────────────────┘ │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│  ♻️ J'ai déjà payé, sur un autre    │  texte seul, gris, jamais mis en avant
│     téléphone                       │
└─────────────────────────────────────┘
```

### Les quatre règles qui font le travail

**① Un seul accent chaud sur tout l'écran.** Le fluo `#F2E14C` n'apparaît QUE
sur les trois boutons d'achat et sur le scotch du titre. Nulle part ailleurs.
Un accent dilué sur six éléments ne guide plus rien : c'est la règle qui
compte, pas la couleur choisie.

**② Le bouton est le point le plus contrasté de sa tuile.** Contrainte
mesurable : ratio ≥ 7:1 contre le fond de la tuile. Ça se vérifie, donc ça se
tient dans le temps.

**③ Le contraste de valeur porte la hiérarchie, pas la taille seule.** La tuile
du Pack est sur un kraft plus foncé (`melanger(bg, '#3A2A1E', 0.18)`) que les
deux autres. L'œil va au contraste avant d'aller au grand.

**④ Le froid sépare l'outil du plaisir.** Les deux tuiles du haut sont kraft et
chaudes — on y achète de l'identité. « Sans Pub » est violet et froid : c'est
un outil. La séparation chromatique évite que trois offres se lisent comme une
bouillie de trois cartes identiques.

### Le chemin de l'œil (Z)

Pancarte (haut G) → prix barré du Pack (haut D) → aperçu de l'Atelier
(milieu G) → boutons (bas D de chaque tuile). Les prix sont **alignés à
droite**, les titres à gauche : c'est ce décalage qui crée le Z, pas une
disposition savante.

### Textures — ce qu'il faut écrire

| Classe | Effet | Mise en œuvre |
|---|---|---|
| `.scotch` | Ruban adhésif fluo translucide | `background: #F2E14C; opacity: .82; clip-path` aux bords déchirés ; rotation aléatoire ±2° tirée de la graine, pas de `Math.random` au rendu |
| `.marqueur-barre` | Le trait sur l'ancien prix | **SVG path tremblé**, jamais `text-decoration: line-through`. Le barré CSS est parfaitement droit et se lit comme un tableur. `M2 11 Q22 7 44 12 T88 9` sur un `<svg>` en position absolue |
| `.etiquette` | Étiquette cartonnée percée | Rectangle kraft, coin supérieur gauche coupé à 45°, `<circle>` blanc pour l'œillet, `transform-origin` sur l'œillet |
| `.ruban-angle` | « LES DEUX » en diagonale | `rotate(45deg)` dans un conteneur `overflow: hidden`, coin haut droit |

Réemployer `bg-texture`, `craft-card` et la palette existante : la boutique ne
doit pas ressembler à un autre jeu greffé dans celui-ci.

### Une seule animation, à l'apparition

L'étiquette de l'Atelier se balance une fois (framer-motion, `spring`,
`rotate: [-2, 1.5, 0]`, 600 ms), puis plus rien. **Aucune boucle.** Le
clignotement permanent est le marqueur numéro un du free-to-play prédateur, et
c'est exactement ce qu'un jeu à l'humour cynique ne peut pas se permettre de
paraître : il perdrait le droit de se moquer.

---

## 3. Les textes

### La règle qui gouverne tout le reste

**Rien de ce que le joueur lit ne décrit la mécanique.**

Une première version de ces textes annonçait « les seize bonus du jeu tombent
tout seuls — un combat sur trois, une nuit sur deux ». C'était juste, c'était
vérifiable, et c'était à jeter : on y expliquait la cadence, on y comptait les
points d'appel, on y montrait la salle des machines. Le joueur n'achète pas un
système, il achète ce qu'il va ressentir. Un argument qui a besoin d'un nombre
pour tenir n'est pas un argument, c'est une fiche technique.

Bannis des textes visibles : *bonus*, *vidéo récompensée*, *interstitiel*,
*cadence*, *toutes les X actions*, tout dénombrement de contenu, et toute
formule qui suppose de savoir comment c'est branché. Bannis aussi : « Achetez
maintenant », « Offre limitée », « Meilleure valeur », « Le plus populaire ».

Et une contrainte de longueur, parce que c'est elle qui empêche la rechute :
**trois puces au maximum, huit mots par puce au maximum.** Dès qu'une puce
dépasse, c'est qu'elle explique.

### En-tête

> **LE MARCHÉ NOIR**
> *Deux choses à vendre. Prenez, ou passez votre chemin.*

### Tuile 1 — Le Pack

> ### TOUT LE CARTON
> *La paix, et une tête à vous.*
>
> ✦ Moins cher que les deux séparément. Regardez en dessous.
>
> ~~{noads + atelier}~~  **{pack_complet}**
>
> **[ JE PRENDS TOUT — {pack_complet} ]**

### Tuile 2 — L'Atelier

> ### L'ATELIER
> *On ne choisit pas où on tombe. On peut choisir avec quoi.*
>
> ✦ Votre tête. Pas celle du tirage.
> ✦ Deux atouts dans la poche avant de vous lever.
> ✦ Vous mourrez quand même. Mais vous saurez qui.
>
> **[ ME FAIRE UNE TÊTE — {atelier} ]**

La troisième puce fait le travail que trois paragraphes ne feraient pas : elle
ne promet pas de gagner — ce jeu tue — elle promet que la perte sera la
vôtre. C'est le seul argument que ce genre de jeu peut tenir sans mentir.

Variante du bouton sur l'écran de mort :
> **[ LE PROCHAIN, C'EST MOI QUI LE FAIS — {atelier} ]**

### Tuile 3 — Sans Pub

> ### LA PAIX
> *Tout le monde vous prend quelque chose. Eux aussi.*
>
> ✦ Plus rien qui se met en travers.
> ✦ Les coups de main viennent tout seuls.
>
> **[ QU'ON ME FICHE LA PAIX — {noads} ]**

Le titre ne dit plus ce qu'on retire, il dit ce qu'on obtient : « Sans Pub »
vend une absence, « La paix » vend un état. Et la seconde puce dit tout le
bénéfice additif du produit **sans nommer une seule pièce du moteur** — c'est
exactement le même contenu que l'ancienne liste chiffrée, en six mots.

Les trois boutons parlent à la **première personne**, au présent : le joueur
lit sa propre phrase, pas une injonction. « Achetez » place le vendeur devant ;
« Je prends tout » place le joueur dedans.

### §3bis — L'étiquette de la tête inachevée

Elle n'a rien à voir avec les tuiles : elle apparaît sur le **hub**, quand un
visage a été composé dans l'Atelier sans être payé.

> **Quelqu'un sèche sur l'établi.**
> *Il ne lui manque que vous.*
>
> **[ ALLER LE CHERCHER ]**

« Une tête vous attend à l'atelier » — la première version — ne pouvait pas
fonctionner : c'est du vocabulaire de gestionnaire, ça décrit un état, et une
tête n'attend personne. Il faut **quelqu'un**, pas un objet ; et il faut qu'il
lui manque quelque chose, sinon rien ne tire.

« Sèche » fait tout le travail de fabrication en un mot — la colle, le feutre,
le carton posé à plat — sans avoir à dire « en cours ». Et « il ne lui manque
que vous » est la seule chose vraie de la phrase : le visage existe, la
personne non.

Le bouton s'accorde en genre, comme partout ailleurs dans le jeu — « aller la
chercher » quand c'est une femme qui sèche sur l'établi.

### Micro-textes

| Où | Aujourd'hui | À la place |
|---|---|---|
| Produit possédé | « ✅ Actif, merci ! » | « **✅ Payé. On ne vous embêtera plus.** » |
| Restauration | « ♻️ Restaurer mes achats » | « **♻️ J'ai déjà payé, sur un autre téléphone** » |
| Achat échoué | « Achat non abouti. » | « **Le vendeur regarde ailleurs. Réessayez.** » |
| Magasin injoignable | « Boutique indisponible pour l'instant. » | « **Personne au carton. Repassez plus tard.** » |
| Achat réussi | *(rien)* | « **C'est à vous.** » |

« Restaurer mes achats » est le vocabulaire de l'éditeur ; « J'ai déjà payé,
sur un autre téléphone » est la phrase que le joueur a réellement en tête au
moment où il cherche ce bouton. On écrit la sienne.

## 4. Les points d'entrée — c'est là que se joue la conversion

Un onglet Boutique ne convertit presque personne : on n'y va que si on a déjà
décidé. Ce qui convertit, c'est de proposer la chose **au moment où elle
manque**.

| # | Moment | Produit | Règle |
|---|---|---|---|
| 1 | Hub, carte permanente | Boutique | Discrète. C'est la porte, pas l'argument. |
| 2 | **Écran de mort**, sous le bouton de succession | Atelier | Le seul moment où « je recommence » est actif. L'invitation à composer y existe déjà — elle devient l'entrée principale de l'Atelier. |
| 3 | **Juste après un interstitiel** | Sans Pub | Douleur fraîche. **Une fois par session au maximum**, et jamais après le premier interstitiel de la partie. |
| 4 | Garde-robe | Atelier | Contexte d'identité : on y est déjà en train de se regarder. |

### La dégustation — le levier le plus rentable du document

Après le **deuxième** interstitiel d'une session, offrir dix minutes sans
publicité, annoncées : « *Dix minutes tranquilles. Cadeau.* » À l'expiration,
une carte : « *C'était ça, tout le temps.* » avec le bouton.

L'effet de dotation est le biais le mieux établi de la liste et le seul qui se
déclenche par l'expérience plutôt que par le texte : une chose possédée puis
retirée pèse environ le double d'une chose jamais eue. Coût pour le joueur qui
n'achètera jamais : deux publicités en moins. Coût pour nous : deux
impressions.

C'est aussi le seul point du document que je recommanderais d'essayer **avant**
de redessiner quoi que ce soit, parce qu'il est mesurable seul.

---

## 5. Plan d'intégration

### Fichiers

| Fichier | Nature |
|---|---|
| `client/src/components/game/BoutiqueScreen.tsx` | nouveau — l'écran |
| `client/src/components/game/boutique/Tuile.tsx` | nouveau — la tuile générique (titre, puces, prix, bouton) |
| `client/src/components/game/boutique/textures.tsx` | nouveau — `Scotch`, `Barre`, `Etiquette`, `RubanAngle` en SVG |
| `client/src/contexts/types.ts` | `Screen` += `'boutique'` |
| `client/src/pages/Home.tsx` | route de l'écran |
| `client/src/components/game/MainScreen.tsx` | carte d'entrée sur le hub |
| `client/src/components/game/GameOverScreen.tsx` | entrée contextuelle Atelier |
| `client/src/components/game/AtelierOverlay.tsx` | essai libre + paywall à la validation |
| `client/src/components/game/SettingsScreen.tsx` | les trois cartes d'achat déménagent ; ne restent que la restauration et le consentement |

### Ce qui existe déjà et ne doit pas être réécrit

- `prixAffiche(p)` et `surMagasinChange(cb)` — `lib/facturation.ts`
- `packUtile()`, `isAdsRemoved()`, `isAtelierOwned()` — `lib/ads.ts`
- `CardboardAvatar` avec `visage` — pour l'aperçu vivant de la tuile Atelier
- `craft-card`, `bg-texture` — la matière

### Le total barré, calculé et jamais écrit

```ts
// Deux prix localisés ne s'additionnent pas comme des chaînes. On additionne
// les MICRO-UNITÉS rendues par le magasin, puis on formate dans la même
// devise — sans quoi « 2,99 € + 4,99 € » deviendrait « 2,994,99 € », ou pire,
// un total juste dans la mauvaise monnaie.
const total = micros('noads') + micros('atelier');
const barre = new Intl.NumberFormat(navigator.language, {
  style: 'currency', currency: devise('noads'),
}).format(total / 1e6);
```

`Product.pricing` expose `priceMicros` et `currency` : `facturation.ts` doit
les exposer à côté de `prixAffiche()`. Sur le web, où le magasin est muet, la
tuile du Pack **n'affiche pas de barré du tout** plutôt qu'un barré faux.

### Ce qu'il faut instrumenter

Sans mesure, tout ce document n'est qu'une opinion bien écrite.

| Événement | Ce qu'il tranche |
|---|---|
| `boutique_vue` (+ provenance : hub / mort / interstitiel / garde-robe) | Quelle porte travaille |
| `tuile_vue` par produit | Ce qui est regardé sans être acheté |
| `achat_lance` / `achat_abouti` par produit | L'abandon dans la feuille Google |
| `atelier_essai_valide` | Si l'effet IKEA fonctionne |
| `degustation_offerte` / `achat_dans_les_10_min` | Le seul chiffre qui vaut pour la dégustation |

---

## 6. Les biais, un par un, et où ils sont branchés

Passe complète. Chaque ligne dit **où** ça se joue dans le jeu — un biais qui
n'a pas de point d'ancrage dans l'interface n'est pas activé, c'est une
intention.

### Ceux qui portent le plus

| Biais | Où, concrètement |
|---|---|
| **Effet de dotation** — une chose possédée puis retirée pèse ~2× une chose jamais eue | La dégustation, §4. Dix minutes de paix offertes, puis la carte « c'était ça, tout le temps ». Le seul levier du document qui se déclenche par l'expérience et pas par le texte. |
| **Effet IKEA** — on surévalue ce qu'on a fabriqué | Atelier en essai libre, paywall au clic de **valider**. On ne vend plus une fonction, on vend ce personnage-là, déjà fait, qui attend. |
| **Engagement et cohérence** (pied dans la porte) | Le même essai libre fait passer le joueur de « je regarde » à « j'ai composé quarante secondes ». Il a déjà investi avant qu'on parle d'argent. |
| **Aversion à la perte** | Le point de vente n° 2 est l'**écran de mort**, pas le hub : c'est le seul moment où « je recommence » est actif et où ce qu'on vient de perdre est encore chaud. |
| **Effet Zeigarnik** — une tâche inachevée occupe l'esprit | Un visage composé mais non payé reste en attente. L'étiquette du hub est écrite au §3bis : elle apparaît **une fois**, et ne revient pas si on l'écarte — au-delà, ce n'est plus un rappel, c'est du harcèlement. |
| **Ancrage** | Le Pack en haut. Le premier prix lu sert de référence à tous les suivants, et fait lire l'Atelier seul comme un repli raisonnable. |
| **Réciprocité** | À la première ouverture de la boutique, le vendeur donne un accessoire de garde-robe. Gratuitement, sans condition, sans le rappeler ensuite. Ce qui déclenche la réciprocité, c'est le don sans contrepartie — un « cadeau » conditionné à un achat n'en est pas un et se lit immédiatement. |
| **Effet von Restorff** — ce qui tranche se retient | Un seul accent chaud sur tout l'écran, §2. C'est la même règle vue sous un autre nom : le fluo n'existe que sur les boutons. |
| **Effet d'unité / complétion** | Qui possède une moitié voit l'autre présentée comme un manque, pas comme un produit : « **Il vous manque encore la paix.** » `packUtile()` masque déjà le lot dans ce cas. |
| **Règle du pic et de la fin** | L'achat réussi n'a aujourd'hui aucun moment. Le vendeur tend un **reçu en carton** — petite animation, 800 ms, une fois. C'est le souvenir qui restera de la transaction, et il ne coûte rien. |

### Les trois objections, qui valent la moitié des biais réunis

C'est le levier le plus négligé et le moins cher : personne n'achète en ayant
une question sans réponse. Les trois vraies objections d'un joueur devant cet
écran, et le texte qui les tue — **court, sous le bouton, en petit** :

| Ce qu'il pense | Ce qu'il lit |
|---|---|
| « C'est un abonnement déguisé ? » | **Une fois. Jamais deux.** |
| « Et si je change de téléphone ? » | **Ça suit votre compte, pas l'appareil.** |

Les deux sont **vraies** : les produits sont non consommables, et la
possession est relue depuis le compte Google au lancement (`facturation.ts`).
Les énoncer ne concède rien — ça enlève deux raisons de ne pas cliquer.

**Une troisième objection existe — « et si je regrette ? » — et on n'y répond
pas.** Le Play Store accorde son délai de rétractation qu'on le mentionne ou
non ; celui qui se pose la question trouve la réponse seul, en dix secondes.
L'écrire n'apporterait donc rien, et introduirait le mot « regret » à
l'endroit précis où l'on veut qu'il n'y pense pas. On laisse Google le dire.

### La preuve sociale — sans inventer personne

Un compteur « 12 483 joueurs ont acheté » est un mensonge s'il est faux, et
une donnée qu'on n'a pas. Mais le jeu détient une preuve bien meilleure, parce
qu'elle est **personnelle et vérifiable par le joueur lui-même** : son
cimetière.

> *« Onze morts. Onze visages tirés au sort. »*

Le nombre vient de `profile.records` / de l'écran Cimetière. Il ne prouve rien
sur les autres, il rappelle au joueur ce que **lui** a subi — et c'est
strictement plus fort qu'une statistique inventée sur des inconnus.

### Ce qu'on n'active pas, et ce que ça coûterait

| Levier | Pourquoi non |
|---|---|
| Fausse promotion, prix barré fictif | Directive Omnibus / L.112-1-1, et *Deceptive Behavior* chez Google. Retrait possible. §0. |
| Compte à rebours sur un produit permanent | Le joueur qui revient demain apprend qu'on lui a menti. Le gain d'un jour se paie sur la durée de vie du jeu. |
| Compteur d'acheteurs inventé | Donnée fausse, et remplaçable par le cimetière, qui est vrai. |
| Rappel répété du panier abandonné | Un rappel est utile, trois sont du harcèlement — et la note du Play Store s'en souvient plus longtemps que la conversion. |
| Nerf du jeu gratuit pour vendre l'achat | La seule ligne rouge absolue. On vend un confort et une maîtrise, jamais la fin d'une gêne qu'on aurait ajoutée exprès. |

---

## 7. Les images à générer

Convention du projet (voir `docs/prompts-images.md`) : dépôt dans
`client/public/assets/`, nom de fichier **exact**, `.webp`, repli sur le dessin
tant que le fichier manque.

Préfixe de style à coller devant chaque prompt :

> Handmade miniature cardboard diorama, brown kraft & corrugated cardboard,
> cut-out puppet characters with hand-drawn marker faces, warm tungsten light,
> tiny fairy-light string, shallow depth of field, photorealistic, gentle dark
> humor.

| Fichier | Format | Scène |
|---|---|---|
| `boutique-enseigne.webp` | 3:1 | Une pancarte en carton scotchée de travers sur un mur de carton, ruban adhésif jaune fluo aux quatre coins, « LE MARCHÉ NOIR » écrit au gros marqueur noir baveux, une ampoule nue qui pend au-dessus. Personne. Juste l'enseigne. |
| `boutique-vendeur.webp` | 1:1 | Un vendeur en carton derrière un étal fait de cageots retournés, manteau trop grand, lunettes rafistolées au scotch, sourire au feutre un peu trop commercial, une main qui présente la marchandise. Il vous regarde droit dans les yeux. |
| `boutique-paix.webp` | 3:2 | Le SDF en carton, enfin assis tranquille sous son porche, guirlande allumée, une tasse fumante. Autour de lui, empilés dos tourné contre le mur, des panneaux publicitaires en carton retournés face au mur. Silence. Chaleur. |
| `boutique-atelier.webp` | 3:2 | Un établi en carton vu de dessus : quatre ou cinq têtes en carton découpé alignées, des yeux et des bouches au feutre sur des chutes, une paire de ciseaux, un marqueur ouvert, de la colle. Une tête à moitié finie au centre. Lumière d'atelier. |
| `boutique-lot.webp` | 3:2 | Un paquet en carton ficelé avec de la grosse ficelle, une étiquette cartonnée pendue à l'œillet, deux objets qui dépassent : une tête en carton découpé et une petite pancarte « SILENCE ». Posé sur l'étal. |
| `boutique-recu.webp` | 1:1 | Un bout de carton déchiré tendu par une main, tamponné d'une croix au feutre en guise de tampon. Un reçu de marché noir. Gros plan, faible profondeur de champ. |
| `boutique-degustation.webp` | 3:2 | Le SDF en carton assis, les yeux fermés, visage détendu, et au premier plan un petit réveil en carton dont les aiguilles sont dessinées au feutre. Un moment volé. Doux, un peu triste. |

**Ce qu'il ne faut PAS générer**, et c'est important : aucune image de visage
de personnage pour la tuile Atelier. Le jeu en dessine un **vrai, vivant, celui
du joueur** avec `CardboardAvatar` — une illustration figée à côté serait
moins convaincante que la démonstration en direct, et contredirait la
promesse (« votre tête », pas une tête de catalogue).

---

## 8. Ordre de mise en œuvre

Par rapport rendement / effort. Chaque étape se mesure seule, ce qui est la
seule façon de savoir laquelle a marché.

| # | Quoi | Effort | Pourquoi là |
|---|---|---|---|
| 1 | **Les trois réponses aux objections** sous les boutons actuels | 20 min | Trois phrases vraies qui retirent trois raisons de ne pas cliquer. Rien à dessiner. |
| 2 | **Les textes** du §3 dans les cartes existantes des Options | 1 h | Teste le recadrage « La paix » sans redessiner quoi que ce soit. |
| 3 | **La dégustation** (§4) | ½ journée | L'effet de dotation, le levier le plus fort du document. |
| 4 | **L'Atelier en essai libre**, paywall à la validation | ½ journée | Une garde à déplacer dans `AtelierOverlay`. Effet IKEA + engagement. |
| 5 | **Les points d'entrée** 2 et 3 (mort, après-interstitiel) | ½ journée | On propose la chose au moment où elle manque. |
| 6 | **Le reçu en carton** et la ligne du cimetière | 2 h | Le pic de fin, et la seule preuve sociale honnête. |
| 7 | **L'écran Boutique** lui-même (§2) + les images (§7) | 2 jours | Le plus long, et le moins déterminant. |

Un désaccord assumé avec l'intuition habituelle : le bel écran arrive en
dernier. Il rend l'offre présentable ; ce sont les six premières lignes qui la
rendent achetée. Les images du §7 peuvent être générées en parallèle — elles
ne bloquent rien, le code affiche un repli tant qu'un fichier manque.
