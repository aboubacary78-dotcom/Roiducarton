# Commande images — « Le Roi du Carton » — La Boutique (7 images)

**Ce document est la commande complète. Tout ce qu'il faut est dedans : aucun
autre fichier n'est nécessaire.**

---

## Le jeu, en trois lignes

Roguelite de survie mobile, comédie noire. On y joue quelqu'un qui dort dehors
et qui essaie de tenir un jour de plus. Direction artistique : **dioramas
miniatures en carton kraft, photographiés** — les voitures sont en carton, les
pigeons sont en carton, la ville entière tient sur une table d'atelier.

## Ce que ces images racontent

Le jeu ouvre une **boutique**. Deux choses à vendre, une fois pour toutes :

- **la paix** — plus d'écrans de publicité imposés ;
- **l'atelier** — le joueur compose le visage de son personnage et choisit ses
  atouts de départ, au lieu de les subir au tirage.

La boutique n'est pas un magasin d'application. C'est **un étal de marché noir
sur un trottoir** : des cageots retournés, une ampoule nue, un type qui vend
deux choses et qui vous regarde.

---

## Réglages de sortie

| | |
|---|---|
| Format | **WebP** (sinon PNG/JPG, je convertis) |
| Poids | viser **80 ko**, ne pas dépasser 150 ko |
| Noms de fichiers | **exactement** ceux des titres, à la lettre près |
| Dépôt | `client/public/assets/` |

Les dimensions changent d'une image à l'autre — elles sont indiquées à chaque
fois, et elles comptent : ces images sont posées dans des cadres fixes.

## Préfixe de style à coller devant CHAQUE prompt

```
Handmade miniature cardboard diorama, brown kraft and corrugated cardboard,
cut-out puppet characters with hand-drawn marker faces, warm tungsten light,
tiny fairy-light string, shallow depth of field, photorealistic macro
photography of a tabletop set, gentle dark humor.
```

---

# Les trois règles qui comptent plus que les prompts

## ① AUCUN TEXTE LISIBLE DANS AUCUNE IMAGE

Le jeu existe en **français et en anglais**. Un mot peint dans une image ne se
traduit jamais : il resterait en français pour la moitié des joueurs, et sur
la boutique — le seul écran qui doit être compris — ce serait le pire endroit.

L'application écrit elle-même tous ses titres par-dessus, dans sa propre
police. Donc :

- **une pancarte : oui.** Des gribouillis de marqueur illisibles dessus : oui.
  Un mot qu'on peut lire : **non** ;
- pas d'étiquette de prix chiffrée, pas d'enseigne écrite, pas de tampon avec
  une mention ;
- une croix, une flèche, un trait de marqueur : parfaits.

## ② LE VENDEUR EST LE MÊME PARTOUT

Il apparaît sur deux images (`boutique-vendeur`, `boutique-recu`) — la seconde
n'est qu'une de ses mains, et il faut qu'on la reconnaisse : **même manche de
manteau, même gant coupé aux doigts**.

Qui il est : pas un truand, pas un mascotte souriante. **Quelqu'un de la rue
qui a monté un étal.** Manteau trop grand, lunettes rafistolées au scotch, un
sourire au feutre légèrement trop commercial pour être honnête. Il est
sympathique et on sait qu'il se sert au passage. C'est exactement le ton du
jeu.

## ③ RIEN DE NEUF, RIEN DE BRILLANT

Aucun coffre au trésor, aucune pièce d'or, aucune gemme, aucune lueur
« premium », aucun rayon de lumière divine sur la marchandise. Ce sont les
codes des boutiques de jeux mobiles, et à la seconde où la boutique leur
ressemble, le jeu perd le droit d'être cynique — c'est-à-dire tout ce qu'il a.

Du carton, du scotch, une ampoule qui pend, de la ficelle. La marchandise doit
avoir l'air **d'occasion**.

---

# Les sept images

## 1. `boutique-enseigne.webp` — l'enseigne

**1080 × 360 px, panoramique 3:1.**

> **Prompt.** A hand-cut cardboard signboard taped crookedly onto a corrugated
> cardboard wall, held by four strips of bright fluorescent yellow tape at the
> corners. The sign is blank except for a few **illegible scrawled marker
> strokes and a small hand-drawn crown doodle** — no readable words, no
> letters. A bare lightbulb hangs above it on a twisted wire, casting warm
> tungsten light and a hard shadow. Nobody in frame. Wide panoramic framing,
> the sign centred with generous empty cardboard on both sides.

**L'intention.** C'est le bandeau de l'écran, et l'application écrit son titre
par-dessus. **Il faut donc de l'air au centre** : la pancarte porte le regard,
elle ne remplit pas le cadre. Le scotch fluo est la seule couleur vive de tout
l'écran — c'est lui qui doit sauter aux yeux.

## 2. `boutique-vendeur.webp` — le vendeur

**720 × 720 px, carré.**

> **Prompt.** A cardboard cut-out street vendor standing behind a makeshift
> stall built from upturned wooden-look cardboard crates. He wears an
> oversized patched coat and eyeglasses visibly repaired with tape. His
> marker-drawn face wears a slightly-too-commercial smile. One hand is open,
> presenting the goods on the crate in front of him. **He looks straight at
> the viewer.** Warm tungsten light from a bare bulb above, dark cardboard
> street behind. Square framing, subject centred, waist-up.

**L'intention.** Un visage vend mieux qu'un objet, et **le regard caméra est
tout le levier** : on n'achète pas à un étal, on achète à quelqu'un. Le sourire
doit être d'un cran trop appuyé. On l'aime bien, et on sait qu'il prend sa
marge.

## 3. `boutique-paix.webp` — la paix

**1080 × 720 px, paysage 3:2.**

> **Prompt.** A cardboard cut-out homeless character sitting peacefully under a
> cardboard porch, eyes closed or half-closed, a small cardboard cup steaming
> in his hands, a lit fairy-light string above him. Stacked against the wall
> all around him, **several miniature cardboard advertising billboards turned
> face to the wall**, their blank backs showing. Warm, quiet, generous light.
> Nothing is happening. Nobody else in frame.

**L'intention.** C'est le produit « plus de publicité », et il ne faut surtout
pas montrer une publicité barrée d'une croix rouge — ce serait montrer la
gêne au lieu de montrer le bénéfice. **Les panneaux sont retournés face au
mur : ils sont là, ils se taisent.** L'image doit donner envie de s'asseoir.

## 4. `boutique-atelier.webp` — l'atelier

**1080 × 720 px, paysage 3:2.**

> **Prompt.** Top-down view of a craft workbench: four or five **blank
> cardboard head shapes** laid out in a row, plus loose scraps with separate
> hand-drawn eyes, mouths and eyebrows cut out and waiting beside them.
> Scissors, an open black marker, a glue stick, pencil shavings. In the centre,
> **one head half-finished — two eyes drawn, no mouth yet.** Warm workshop
> lamp light from the upper left, shallow depth of field on the centre head.

**L'intention.** ⚠️ **Les têtes doivent être VIDES ou inachevées.** Aucun
visage fini et attachant : le jeu dessine en direct celui du joueur juste à
côté de cette image, et un beau visage de catalogue ici contredirait la
promesse — « votre tête, pas celle du catalogue ». Ce qu'on vend, c'est
**l'établi**, pas un personnage.

## 5. `boutique-lot.webp` — le lot

**1080 × 720 px, paysage 3:2.**

> **Prompt.** A cardboard parcel tied shut with thick rough twine, sitting on
> the crate stall. A blank cardboard tag hangs from the knot by a small metal
> eyelet — **the tag is empty, no writing**. Two things poke out of the top of
> the parcel: **a cut-out cardboard head shape** and **a tiny blank cardboard
> placard**. Warm tungsten light, dark background, shallow depth of field on
> the tag.

**L'intention.** Le lot réunit les deux autres produits : la tête pour
l'atelier, la pancarte muette pour la paix. **L'étiquette vide n'est pas un
oubli** — l'application y écrit le prix par-dessus, et il change selon le pays.

## 6. `boutique-recu.webp` — le reçu

**720 × 720 px, carré.**

> **Prompt.** Macro close-up: a torn scrap of brown cardboard held out toward
> the viewer by a cardboard cut-out hand — **the same oversized patched coat
> sleeve and fingerless glove as the vendor**. The scrap bears a single thick
> **inked X stamped in the middle, no words, no numbers**. Very shallow depth
> of field, the scrap sharp, the sleeve and background falling away. Warm low
> light.

**L'intention.** Elle s'affiche **une seule fois**, juste après un achat
réussi, pendant huit dixièmes de seconde. C'est le dernier souvenir que le
joueur gardera de la transaction : un bout de carton déchiré tendu par une
main, tamponné d'une croix. Un reçu de marché noir. **Ça doit faire sourire.**

## 7. `boutique-degustation.webp` — les dix minutes offertes

**1080 × 720 px, paysage 3:2.**

> **Prompt.** A cardboard cut-out homeless character sitting on the ground,
> back against a cardboard wall, eyes closed, face relaxed and calm. In the
> foreground, slightly out of focus, **a small cardboard alarm clock with its
> hands drawn in marker**. The fairy lights are lit but dim. Soft, low, warm
> end-of-day light. A quiet stolen moment, faintly melancholy.

**L'intention.** Le jeu offre dix minutes sans publicité, sans rien demander.
Cette image accompagne le cadeau — et surtout le moment, dix minutes plus
tard, où il s'arrête. **Il faut donc qu'elle soit un peu triste**, parce que
c'est ce qu'on ressent quand ça se termine. Le réveil est au premier plan pour
qu'on sache que c'est compté.

---

# Livraison attendue

1. **Sept fichiers WebP**, nommés exactement comme ci-dessus, aux dimensions
   indiquées **image par image** (elles ne sont pas toutes identiques).
2. Confirmation qu'**aucune image ne contient un mot lisible** — c'est la
   règle ① et c'est celle qui casse la version anglaise si elle saute.
3. `boutique-vendeur` et `boutique-recu` **côte à côte** dans le rapport, pour
   qu'on vérifie d'un coup d'œil que la manche et le gant sont les mêmes.
4. Confirmation que **les têtes de `boutique-atelier` sont vides ou
   inachevées**, sans visage fini.
5. ⚠️ **La licence d'usage commercial** de l'outil employé, nommément. Le jeu
   est monétisé : une licence non commerciale rendrait les sept images
   inutilisables.

## Ce qui se passe si une image manque

Rien de grave, et c'est voulu. Les tuiles de la boutique s'affichent en kraft
uni avec leur texte, exactement comme aujourd'hui dans l'écran des Options.
Chaque image s'active toute seule à l'arrivée, sans rien changer au code — on
peut donc livrer les sept d'un coup, ou une par une.

Ordre d'utilité si l'on doit choisir : **`boutique-vendeur`**, puis
**`boutique-paix`**, puis **`boutique-atelier`**. Ce sont les trois qui portent
la vente. Les quatre autres sont du confort.
