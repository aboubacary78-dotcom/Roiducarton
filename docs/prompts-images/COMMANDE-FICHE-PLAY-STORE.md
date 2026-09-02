# Commande · la fiche Google Play

Document à remettre au prestataire. Il contient les spécifications, la
direction artistique, et les pièges qui coûtent une deuxième facture.

> **Origine des chiffres.** La page officielle de Google (`support.google.com`)
> est inaccessible depuis l'environnement où ce document a été écrit. Les
> spécifications ci-dessous viennent de sources secondaires concordantes,
> vérifiées en septembre 2026. **À recouper une fois dans la Play Console**,
> qui refuse de toute façon un fichier hors norme au téléversement : ça ne
> coûte rien de vérifier, et beaucoup de le découvrir après paiement.

---

## 1. Ce qu'il faut livrer

| Pièce | Format | Contrainte |
|---|---|---|
| **Icône** | 512 × 512, PNG 32 bits | ≤ 1 Mo. Elle existe déjà (`resources/icon.png`, 1024 × 1024) : à retoucher, pas à réinventer. |
| **Visuel de mise en avant** | 1024 × 500, JPEG ou PNG 24 bits | **Aucune transparence.** Texte important dans la zone sûre de 924 × 400. |
| **Captures d'écran téléphone** | 2 à 8 | 320 à 3840 px de côté. **Le côté long ≤ 2 × le côté court.** |
| **Titre** | 30 caractères | « Le Roi du Carton » en fait 16, il reste de la place. |
| **Description courte** | 80 caractères | C'est elle qu'on lit dans les résultats de recherche. |
| **Description longue** | 4000 caractères | Peu lue en entier, mais elle nourrit la recherche. |

### Le piège du rapport d'aspect

**C'est celui qui coûte une deuxième facture.** Le côté le plus long ne doit
pas dépasser deux fois le plus court. L'écran de référence du jeu est en
390 × 844, soit **2,16** : une capture prise à la taille naturelle du
téléphone est **refusée**, et l'erreur n'apparaît qu'au téléversement, une
fois le travail livré et payé.

Les captures brutes fournies sont donc déjà en **1080 × 2160**, rapport
exactement 2:1. **Le prestataire doit conserver ce rapport.** S'il ajoute un
cadre de téléphone ou un bandeau de titre autour de l'image, la composition
finale doit rester dans la règle, pas la capture d'origine.

---

## 2. La matière première fournie

Neuf captures du jeu réel, en 1080 × 2160, produites par `pnpm captures-store`
(dossier `captures-store/`). **Le Play Store en accepte huit au plus : il y en
a une de trop, à choisir.**

| Fichier | Ce qu'il montre | Pourquoi il est là |
|---|---|---|
| `01-titre` | L'écran d'accueil | L'identité. Le plus dispensable des neuf : la page du store dit déjà le nom |
| `02-choix-personnage` | Les trois candidats | On comprend le jeu sans un mot : on choisit quelqu'un |
| `03-origine` | « La Chute de Patrick » | Le ton, la comédie noire, la promesse narrative |
| `04-hub` | Le contrat, la météo, les jauges | La boucle de jeu |
| `05-mendier` | La manche, un passant suivi du doigt | Le décor de carton, et un geste en cours |
| `06-recup` | Le tas fouillé, trois trouvailles | Un mini-jeu vraiment joué, pas un écran de départ |
| `07-rencontre` | « Le Roi du Cuivre » et ses choix | La plus belle image du lot, et une décision à prendre |
| `08-bagarre` | Chat Sauvage, châtaigne / feinte / garde | L'action, et la règle lisible d'un coup d'œil |
| `09-garde-robe` | Les accessoires et le portrait | La collection, ce qui fait revenir |

**Elles viennent du jeu, pas d'une maquette.** Une fiche qui promet autre chose
que ce qui s'installe est le premier motif de désinstallation dans l'heure, et
ça se paie ensuite en note moyenne, longtemps.

### Ce qui n'est PAS montré, et pourquoi

**La boutique.** Une fiche de store qui montre un écran de paiement apprend au
visiteur qu'il devra payer avant même de lui avoir donné une raison
d'installer. On montre ce qui se joue ; la boutique se découvre dans le jeu.

### Deux réserves sur les fichiers livrés

- `05-mendier` a ses compteurs à zéro : la partie vient de commencer, l'anneau
  de progression est en train de se remplir autour du passant. C'est honnête,
  mais ce n'est pas un moment de gloire.
- `07-rencontre` et `08-bagarre` portent un bouton qui contient le mot
  « (pub) ». Rien ne l'interdit, mais un cadrage un peu plus haut l'évite.

Le prestataire habille ces images : légendes, cadres, fonds. **Il ne redessine
pas l'interface**, et il ne retire pas de la capture une mention qui existe
dans le jeu.

## 3. La direction artistique, en une page

Le jeu s'appelle « Le Roi du Carton ». C'est un jeu de survie dans la rue,
drôle et noir, dont **tout est fabriqué en carton** : les décors sont des
dioramas de carton photographiés, les personnages des figurines de carton.

### Les couleurs

Kraft, du clair au foncé. Les valeurs exactes vivent dans
`client/src/index.css`, et une planche de démonstration existe :
`docs/design/palette-diegetique.html`.

Six objets, et **chacun a un rôle, jamais un autre** :

| Objet | Sert à |
|---|---|
| Marqueur qui bave | Le danger, la santé critique |
| Scotch d'électricien | Ce qui est rafistolé, cassé |
| Tampon encreur | Ce qui est validé, acquis |
| Post-it fluo | La trouvaille à ne pas manquer |
| Gaffer mat arraché | Ce qui est indisponible |
| Ruban de chantier rayé | Le temps qui s'épuise |

### Trois règles, et elles ne sont pas négociables

1. **UN SEUL accent chaud par composition.** Le jaune fluo n'est pas une
   couleur de décoration, c'est un pointeur. Dilué sur six éléments, il ne
   guide plus rien.
2. **Aucun vocabulaire free-to-play.** Pas de ruban « BEST VALUE », pas de
   badge doré, pas de dégradé brillant, pas d'explosion de particules, pas de
   compte à rebours. Le jeu se moque de ce registre : il perdrait le droit de
   le faire s'il y ressemblait.
3. **Le carton est une matière, pas un filtre sépia.** On doit voir la
   cannelure, les bords coupés de travers, la colle. Un dégradé marron n'est
   pas du carton.

### Le ton

Comédie noire, jamais misérabiliste, jamais moqueuse envers le personnage. Le
jeu rit des institutions et de l'absurde, pas de la pauvreté. Exemple de son
écriture, tirée du jeu :

> « Jamais perdu nulle part, Patrick a survécu à tout, sauf à la paperasse de
> sa retraite. Le dossier s'est perdu entre deux bureaux, et lui aussi. »

**Ce qu'on ne veut pas** : « Survivez dans la rue ! », « Le meilleur jeu de
survie ! », points d'exclamation en série, superlatifs.

---

## 4. Le visuel de mise en avant (1024 × 500)

C'est la pièce la plus visible et la plus difficile.

- Il apparaît **rogné** selon les surfaces : rien d'important au bord.
- Beaucoup de surfaces l'affichent **sans le titre du jeu par-dessus**, et
  d'autres le superposent : le visuel doit tenir dans les deux cas.
- Proposition de départ : le personnage principal en carton, de trois quarts,
  sur un fond de rue en carton, avec le titre en typographie du jeu. Un seul
  point jaune fluo dans toute l'image.

---

## 5. Ce que le prestataire NE fait pas

- Il ne touche pas à l'interface du jeu.
- Il n'invente aucune fonctionnalité qui n'existe pas dans les captures.
- Il n'écrit pas de chiffre invérifiable (« 1000 niveaux », « 50 000
  joueurs »). Google retire les fiches trompeuses, et le jeu a fait le choix
  inverse jusque dans sa boutique.
- Il ne met pas de prix ni de mention d'achat dans les images : ils changent,
  et une image ne se met pas à jour.

---

## 6. À vérifier à la réception

- [ ] Chaque capture : côté long ≤ 2 × côté court, entre 320 et 3840 px
- [ ] Visuel de mise en avant exactement 1024 × 500, **sans canal alpha**
- [ ] Icône 512 × 512 PNG 32 bits, ≤ 1 Mo
- [ ] Un seul accent chaud par image
- [ ] Aucune fonctionnalité montrée qui n'existe pas dans le jeu
- [ ] Les fichiers sources (PSD, Figma, AI), pas seulement les exports
- [ ] Le droit d'usage commercial, écrit, sur les polices et éléments ajoutés

Ce dernier point est celui qu'on oublie. La question de la licence audio de ce
projet a coûté une inquiétude entière pour une note de livraison erronée : on
demande l'écrit à la commande, pas six mois plus tard.
