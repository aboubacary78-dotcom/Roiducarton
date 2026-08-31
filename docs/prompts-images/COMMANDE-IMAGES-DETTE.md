# Commande images · « Le Roi du Carton » · La dette (6 images)

> ## ✅ LIVRÉ ET INSTALLÉ, 25 août 2026
>
> Les six images sont dans `client/public/assets/` et s'affichent en jeu.
> Contrôles : 6/6 présentes, toutes en 1080 × 720 WebP, aucun doublon,
> de 34 à 58 ko (plafond : 150 ko).
>
> **Les deux règles sont tenues.** Le prêteur est bien le même personnage sur
> ses deux portraits, même bonnet, même moustache, même pièce grise au coude,
> même reprise rouge au genou, jusqu'au même pigeon. Et aucune des quatre
> images de dénouement ne montre de sang, de coup ni de visage de douleur : la
> raclée cache le visage sous un seau et laisse deux passants contourner le
> corps sans le regarder, ce qui était exactement la demande.
>
> **Un défaut de cadrage, corrigé côté code.** La commande demandait de garder
> les 20 % du haut et du bas dégagés sur `death-dette.webp`, parce que la une
> du journal n'en montre qu'un bandeau central. Le sujet, une chaussure
> abandonnée et une pièce par terre, est posé au sol, donc à 68–84 % de la
> hauteur. Mesuré : la une ne montre que la bande 18 %–82 %. La chaussure était
> coupée en deux au bord inférieur et la pièce hors champ ; il ne restait qu'un
> trottoir vide. La photo est désormais cadrée par le bas (`object-position`),
> et l'image est gardée telle quelle.
>
> **Licence :** génération d'images Manus, l'utilisateur possède les sorties
> et peut en faire un usage commercial.

**Ce document est la commande complète. Tout ce qu'il faut est dedans : aucun
autre fichier n'est nécessaire.**

---

## Le jeu, en trois lignes

Roguelite de survie mobile, comédie noire. On y joue quelqu'un qui dort dehors
et qui essaie de tenir un jour de plus. Direction artistique : **dioramas
miniatures en carton kraft, photographiés** : les voitures sont en carton, les
pigeons sont en carton, la ville entière tient sur une table d'atelier.

## Ce que ces cinq images racontent

Une nouvelle mécanique : **un prêteur sur gages aborde le personnage au moment
où il est fauché**. Dix euros tout de suite, quinze à rendre sous trois jours.
Le jour venu, il vous trouve, changer de quartier n'y fait rien.

Trois dénouements : on paie, il saisit un objet, ou **il se paie sur votre
peau**. Et ce dernier peut **tuer le personnage** : c'est la sixième image, la
une du journal du lendemain.

---

## Réglages de sortie

| | |
|---|---|
| Format | **WebP** (sinon PNG/JPG, je convertis) |
| Dimensions | **1080 × 720 px**, paysage 3:2, comme toutes les images du jeu |
| Poids | viser **80 ko**, ne pas dépasser 150 ko |
| Noms de fichiers | **exactement** ceux du tableau, à la lettre près |
| Dépôt | `client/public/assets/` |

## Préfixe de style à coller devant CHAQUE prompt

```
Handmade miniature cardboard diorama, brown kraft and corrugated cardboard,
cut-out puppet characters with hand-drawn marker faces, warm tungsten light,
tiny fairy-light string, shallow depth of field, photorealistic macro
photography of a tabletop set, gentle dark humor, 3:2 landscape.
```

---

# Les deux règles qui comptent plus que les prompts

## ① Le prêteur est LE MÊME sur ses deux portraits

C'est tout le principe de la mécanique : **le visage qu'on voit en empruntant
est celui qu'on redoute de revoir**. S'il change entre les deux images, le
rendez-vous ne fonctionne plus.

Qui il est : ni un voyou, ni un mafieux. **Quelqu'un de la rue qui s'en sort
un peu mieux que vous** : manteau moins rapiécé, chaussures entières, un
bonnet propre. L'air fatigué de quelqu'un qui a déjà entendu toutes les
excuses. Il n'a pas besoin de faire peur : il a besoin d'avoir l'air fiable la
première fois, et inévitable la seconde.

## ② On ne montre jamais le geste

Les trois images de dénouement sont des moments durs. Le jeu est une **comédie
noire**, pas un jeu de brutalité. On montre **les conséquences et
l'indifférence des passants**, jamais le coup.

Aucun sang, aucun poing levé, aucun visage de douleur. Un carton qui a pris un
coup dit la chose mieux qu'une violence explicite, et c'est aussi ce que cette
direction artistique sait faire de mieux.

---

# Les cinq images

## 1. `npc-preteur.webp` · il propose

> **Prompt.** Close-up on a cardboard cut-out street character offering two
> folded banknotes held between two fingers, extended toward the viewer.
> He wears a patched but decent coat, a clean woollen hat, intact shoes,
> visibly better off than a homeless man, but still of the street. His
> marker-drawn face is neutral: not smiling, not threatening. Behind him, a
> miniature cardboard train-station entrance, warm tungsten light, a tiny
> fairy-light string overhead. Shallow depth of field on the banknotes.

**L'intention.** On doit avoir *envie* de dire oui, et savoir que c'est une
mauvaise idée. Rien dans l'image ne doit crier au piège : c'est un service
qu'on rend, dit son visage. Le tout est dans le fait qu'il ne sourit pas.

## 2. `npc-preteur-echeance.webp` · il attend

> **Prompt.** **The exact same cardboard character as the previous image**,
> same patched coat, same woollen hat, same marker-drawn face, three days
> later. He leans against a cardboard wall, arms crossed, waiting. Nothing
> aggressive in the pose. Colder late-afternoon light, longer shadows, the
> fairy lights unlit. Empty street behind him.

**L'intention.** **C'est l'immobilité qui inquiète**, pas la menace. Il ne fait
rien. Il est simplement là, et il était là avant que vous arriviez.

## 3. `result-dette-payee.webp` · on paie

> **Prompt.** Tight macro shot on two cardboard cut-out hands, one giving,
> one receiving folded banknotes. The faces are out of frame or blurred
> beyond the depth of field. Neutral warm light, a miniature cardboard street
> in soft focus behind. No expression visible, no celebration.

**L'intention.** C'est le seul dénouement propre des trois, et il ne doit
provoquer **ni joie ni soulagement**. Une transaction. On paie ce qu'on doit,
c'est tout, et c'est déjà beaucoup.

## 4. `result-dette-saisie.webp` · il se sert

> **Prompt.** A cardboard cut-out lender walking away, a cardboard coat slung
> over his shoulder. In the foreground, the homeless character sits on a flat
> piece of cardboard, an open and visibly empty bag between his legs, watching
> him leave. Warm low light. Nobody is shouting. Both figures are calm.

**L'intention.** **Personne ne crie dans cette image.** Le personnage n'a rien
dit, parce qu'il n'y avait rien à dire, il savait en prenant l'argent. C'est
le silence qui doit être insupportable.

## 5. `result-dette-raclee.webp` · il se paie autrement

> **Prompt.** The aftermath. A cardboard cut-out homeless character on the
> ground against a cardboard wall, coat rucked up, one shoe fallen a metre
> away. The lender is **no longer in frame** : only his blurred silhouette
> walking off in the far background. Two cardboard passers-by step around him
> without looking down. Cold end-of-day light. **No blood, no visible injury,
> no raised fist.**

**L'intention.** C'est **l'indifférence des passants** qui doit faire mal, pas
la violence. Deux personnes contournent un corps au sol et continuent leur
chemin : c'est exactement ce que le jeu raconte depuis le début, et cette
image en est le point le plus dur.

## 6. `death-dette.webp` · la une du lendemain

> **Prompt.** Morning after. A cardboard cut-out street corner, empty. On the
> ground, a flattened cardboard sheet where someone slept, one abandoned shoe,
> and a single small cardboard coin catching the light. **No body, no figure
> at all.** Grey early-morning light, the fairy lights dead. A miniature
> cardboard street-sweeper's cart passes in the blurred background, not
> stopping. Cold, wide, documentary framing.

**L'intention.** C'est **la seule mort du jeu que le joueur ait signée
lui-même**, trois jours plus tôt, en acceptant dix euros. Le journal titre
« QUINZE EUROS, ET PERSONNE N'A RIEN VU ».

Les cinq autres morts du jeu arrivent, la faim, le froid, un coup de trop.
Celle-là, on l'a acceptée. L'image doit donc être **la plus vide des six** :
pas de corps, pas de coupable, juste l'endroit et une pièce par terre. C'est
le lendemain matin, et la rue a déjà tourné la page.

⚠️ Cette image s'affiche **dans une une de journal, en grand format paysage**.
Prévoir de l'air : elle est recadrée en bandeau, donc **rien d'important dans
les vingt pour cent du haut ni du bas**.

---

# Livraison attendue

1. **Six fichiers WebP**, nommés exactement comme ci-dessus, en 1080 × 720.
2. Les deux portraits du prêteur **côte à côte** dans le rapport, pour qu'on
   vérifie d'un coup d'œil que c'est bien le même personnage.
3. Confirmation qu'**aucune des quatre images de dénouement ne montre de sang,
   de coup porté ni de visage de douleur**, et que la sixième ne montre
   **aucun corps**.
4. ⚠️ **La licence d'usage commercial** de l'outil employé, nommément. Le jeu
   est monétisé par la publicité : une licence non commerciale rendrait les
   cinq images inutilisables.

## Ce qui se passe si une image manque

Rien de grave, et c'est voulu :

- les **trois images de dénouement** retombent sur une image existante
  (`result-steal-success.webp` / `result-steal-fail.webp`) ;
- la **une de la mort** retombe sur le tampon 💀 de l'écran de fin ;
- les **deux portraits** disparaissent simplement, et la carte du prêteur
  s'affiche sans visage.

On peut donc livrer les six d'un coup ou une par une, chacune s'active toute
seule à l'arrivée, sans rien changer au code.
