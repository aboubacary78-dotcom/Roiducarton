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
une absence. Or dans ce jeu, l'achat **ajoute** — les seize bonus vidéo du jeu
(seconde chance, gains doublés, extincteur, vol tranquille, secours de nuit…)
deviennent instantanés, à cadence. Il achète en réalité un jeu *plus riche*,
et le libellé lui vend un jeu *amputé de quelque chose de désagréable*.

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
| **Rareté vérifiable** | 15 réglages, **3 612 672 000 combinaisons**. Chiffre réel, calculé sur le catalogue, spectaculaire, gratuit. |
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
│  ▚  LE MARCHÉ NOIR DU CARTON     ▚  │  pancarte, rotation −1.5°
│     Tout est d'occasion. Les prix,  │
│     non.                            │
├─────────────────────────────────────┤
│ ╔═══════════════════════════════╗   │  ← ZONE 1 · 0–38 %
│ ║ TOUT LE BAZAR      ⟋LES DEUX⟍ ║   │    kraft FONCÉ (contraste de valeur)
│ ║ ✦ ✦ ✦                         ║   │    ruban d'angle 45°, coin haut droit
│ ║  ~7,98~   6,99 €              ║   │    barré au marqueur (SVG tremblé)
│ ║ ┌───────────────────────────┐ ║   │
│ ║ │  TOUT PRENDRE — 6,99 €    │ ║   │    ← FLUO
│ ║ └───────────────────────────┘ ║   │
│ ╚═══════════════════════════════╝   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │  ← ZONE 2 · 38–70 %
│ │ [avatar vivant]  L'ATELIER   ⌸│   │    étiquette percée, pendue, inclinée
│ │       ↻          ✦ ✦ ✦        │   │    ↻ = « et si on retirait un trait ? »
│ │ ┌───────────────────────────┐ │   │
│ │ │ COMPOSER LE PROCHAIN — …  │ │   │    ← FLUO
│ │ └───────────────────────────┘ │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │  ← ZONE 3 · 70–92 %
│ │ SANS PUB          (ton FROID) │   │    violet #7B68EE, pas kraft
│ │ ✦ ✦ ✦                         │   │
│ │ ┌───────────────────────────┐ │   │
│ │ │ RACHETER VOTRE TEMPS — …  │ │   │    ← FLUO
│ │ └───────────────────────────┘ │   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│  ♻️ J'ai déjà payé sur un autre     │  texte seul, gris, jamais mis en avant
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

Interdits : « Achetez maintenant », « Offre limitée », « Meilleure valeur »,
« Le plus populaire », toute forme de « ne ratez pas ».

### En-tête

> **LE MARCHÉ NOIR DU CARTON**
> *Tout est d'occasion. Les prix, non.*

### Tuile 1 — Le Pack

> ### TOUT LE BAZAR
> *Le fond du carton, retourné sur la table.*
>
> ✦ **L'Atelier** — votre tête et vos deux atouts, dès le premier réveil.
> ✦ **Sans Pub** — plus un seul écran forcé, et les bonus qui tombent seuls.
> ✦ **Un euro de moins** que les deux pris séparément. C'est écrit au-dessus,
>   vérifiez.
>
> ~~{noads + atelier}~~  **{pack_complet}**
>
> **[ TOUT PRENDRE — {pack_complet} ]**
>
> <sub>Le prix barré, c'est le total des deux pièces vendues juste en
> dessous. On ne vous invente pas de réduction.</sub>

La dernière ligne n'est pas de la modestie : dans un écran qui joue le
marché noir, **dire qu'on ne triche pas est un argument**. Elle fait aussi le
travail légal.

### Tuile 2 — L'Atelier

> ### L'ATELIER
> *La rue vous a fait une tête. Reprenez-la.*
>
> 🎯 **Deux traits choisis, pas subis.** Fini le Poissard qu'on vous colle au
>    réveil sans rien demander.
> 🪪 **Quinze réglages, 3 612 672 000 visages.** Le vôtre est là-dedans.
> ⚰️ **Ça survit à vos morts.** Le personnage, non.
>
> **[ COMPOSER LE PROCHAIN — {atelier} ]**

Note d'ordre : le trait choisi passe **avant** le visage. C'est l'argument de
maîtrise, et il vaut plus cher que l'argument cosmétique — un joueur paie plus
volontiers pour décider que pour décorer.

Variante du bouton sur l'écran de mort :
> **[ LE SUIVANT, VOUS LE CHOISISSEZ — {atelier} ]**

### Tuile 3 — Sans Pub

> ### SANS PUB
> *Vous mourez cinq fois par quart d'heure. Ça fait beaucoup de salles
> d'attente.*
>
> 🚫 **Plus un seul plein écran imposé.** Jamais.
> ✨ **Les seize bonus du jeu tombent tout seuls.** Un combat sur trois, un
>    casse sur trois, une nuit sur deux — sans rien regarder.
> 🤝 **On ne vous retire rien.** C'est le même jeu, sans le sas.
>
> **[ RACHETER VOTRE TEMPS — {noads} ]**
>
> <sub>Les bonus restent. C'est l'attente qui saute.</sub>

La deuxième puce est **le** point du produit et elle n'apparaît nulle part
aujourd'hui. Elle transforme un produit soustractif en produit additif.

### Micro-textes

| Où | Aujourd'hui | À la place |
|---|---|---|
| Produit possédé | « ✅ Actif, merci ! » | « **✅ Payé. On ne vous le redemandera pas.** » |
| Restauration | « ♻️ Restaurer mes achats » | « **♻️ J'ai déjà payé sur un autre téléphone** » |
| Achat échoué | « Achat non abouti. » | « **La boutique fait la sourde. Réessayez.** » |
| Magasin injoignable | « Boutique indisponible pour l'instant. » | « **Le vendeur n'est pas à son carton. Réessayez plus tard.** » |
| Achat réussi | *(rien)* | « **Ça y est. Le carton est à vous.** » |

Le libellé de restauration mérite un mot : « Restaurer mes achats » est le
vocabulaire de l'éditeur. « J'ai déjà payé sur un autre téléphone » est la
phrase que le joueur a réellement dans la tête au moment où il cherche ce
bouton. On écrit sa phrase, pas la nôtre.

---

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

## 6. Ordre de mise en œuvre

Par rapport rendement / effort, et chaque étape se mesure seule :

1. **La dégustation** (§4). Aucun écran à dessiner, effet le plus fort.
2. **L'Atelier en essai libre** avec paywall à la validation. Une garde à
   déplacer.
3. **Les textes** (§3) dans les cartes existantes des Options. Une heure, et
   ça teste le recadrage « additif » de Sans Pub sans rien redessiner.
4. **Les points d'entrée** 2 et 3.
5. **L'écran Boutique** lui-même (§2), en dernier — c'est le plus long à faire
   et le moins déterminant.

Un désaccord assumé avec l'intuition habituelle : le bel écran arrive en
dernier. Il rend l'offre présentable ; ce sont les quatre premières étapes qui
la rendent achetée.
