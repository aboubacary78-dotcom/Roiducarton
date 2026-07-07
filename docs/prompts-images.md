# Prompts d'images — Le Roi du Carton (pour Manus)

Manus connaît déjà la **DA** (diorama miniature en carton kraft, personnages en
carton découpé à visage feutre, guirlande lumineuse, lumière chaude, humour noir
de la rue). Donc ci-dessous : surtout les **scènes**, avec le **nom de fichier
exact** attendu par le code.

## Règles
- Format **paysage 3:2**, export **`.webp`** de préférence (sinon png/jpg, je
  convertis).
- Garde le **même personnage SDF** (barbe, manteau rapiécé) que sur les images
  existantes, et le même éclairage/guirlande.
- Nomme les fichiers **exactement** comme la colonne « Fichier ».
- Dépose tout dans `client/public/assets/`. Le code affiche automatiquement dès
  que le fichier est là (repli sur dessin tant qu'il manque).

Rappel de style à préfixer si besoin :
> Handmade miniature cardboard diorama, brown kraft & corrugated cardboard,
> cut-out puppet characters with hand-drawn marker faces, warm tungsten light,
> tiny fairy-light string, shallow depth of field, photorealistic, gentle dark
> humor, 3:2 landscape.

---

## A. Résultats d'action (8)

| Fichier | Scène |
|---------|-------|
| `result-steal-success.webp` | Le SDF en carton s'éloigne, l'objet volé (pomme/baguette) planqué sous son manteau rapiécé, petit sourire malin, regard en coin, ruelle en carton. Fier mais discret. |
| `result-steal-fail.webp` | Le SDF pris en flagrant délit s'enfuit, un commerçant en carton furieux et des passants qui crient et pointent du doigt ; une pomme en carton qui tombe. Chaos, honte. |
| `result-steal-police.webp` | Un policier en carton sévère tient le SDF par le bras, menottes en fil de fer, une petite voiture de police en carton avec un gyrophare rouge lumineux au fond. Garde à vue. |
| `result-beg-police.webp` | Un policier en carton fait « circulez » au mendiant assis, un chapeau renversé avec quelques pièces qui s'échappent. Déception. |
| `legend-graffiti.webp` | Un mur de carton décrépi avec un graffiti au feutre « ROI DU CARTON » + une petite couronne dessinée ; le SDF le contemple, respectueux. Nostalgique. |
| `legend-ancien.webp` | Un vieux SDF en carton à la longue barbe effilochée, assis sur une caisse, raconte une histoire en gesticulant ; le personnage l'écoute. Ambiance de mentor. |
| `legend-carton.webp` | Une vieille boîte en carton usée en guise d'autel sous un porche en carton, une inscription au feutre, une bougie et une pièce à côté. Relique de rue, solennel. |
| `legend-pari.webp` | Deux SDF en carton se serrent la main sur un pari, une pièce entre eux, sourires au feutre, ruelle avec guirlande. Complice, malin. |

## B. Ennemis de la Bagarre (12)

Chaque ennemi = version **en carton découpé**, en posture de menace/combat face
au joueur, dans une ruelle/coin de rue en carton.

| Fichier | Ennemi |
|---------|--------|
| `combat-commercant.webp` | Commerçant furieux en carton, tablier, manches retroussées, poing levé. |
| `combat-rat-geant.webp` | Rat géant en carton (taille d'un petit chien), dents visibles, agressif. |
| `combat-mouette-furibonde.webp` | Mouette furibonde en carton, ailes déployées, bec ouvert, veut le sandwich. |
| `combat-chien-errant.webp` | Chien errant molosse en carton sans collier, crocs, babines retroussées. |
| `combat-pigeon-alpha.webp` | Pigeon « chef de gang » en carton, air menaçant, roucoule (petit mais fier). |
| `combat-voyou.webp` | Voyou de rue en carton, capuche, air louche, veut le spot. |
| `combat-agent-securite.webp` | Agent de sécurité en carton zélé, badge, gilet, lampe torche. |
| `combat-chat-gouttiere.webp` | Chat de gouttière en carton, petit mais vicieux, griffes sorties. |
| `combat-raton.webp` | Raton laveur en carton, masque naturel, fouille une poubelle, effronté. |
| `combat-concurrent.webp` | Autre SDF concurrent agressif en carton qui veut ton coin de rue. |
| `combat-pickpocket.webp` | Pickpocket en carton, agile, main tendue vers une poche. |
| `combat-squatteur.webp` | Squatteur territorial en carton dans un hangar, l'air possessif et menaçant. |

## C. Morts personnalisées (7) — « la mort »

Écran de fin. Le **personnage SDF en carton** mort/effondré, selon la cause,
ambiance **mélancolique**, lumière froide/tamisée, poignante mais sobre.

| Fichier | Cause | Scène |
|---------|-------|-------|
| `death-combat.webp` | Bagarre | Le SDF à terre après une bagarre, bleus au feutre, K.O., un adversaire en carton qui s'éloigne dans l'ombre. |
| `death-hunger.webp` | Faim | Le SDF effondré, joues creuses, une boîte de conserve vide roulée à côté, ventre vide. |
| `death-thirst.webp` | Soif | Le SDF affaissé près d'une fontaine en carton à sec, une bouteille vide, soleil dur. |
| `death-exhaustion.webp` | Épuisement | Le SDF endormi pour toujours sur son carton-lit, corps épuisé, paisible. |
| `death-cold.webp` | Froid | Le SDF figé sous la neige/le gel, guirlande givrée, souffle glacé, carton blanchi. |
| `death-despair.webp` | Moral (mental) | Le SDF prostré, tête dans les mains, ombre lourde, ambiance très sombre, esprit brisé. |
| `death-injury.webp` | Générique | Le SDF qui s'effondre doucement contre un mur de carton, le corps qui lâche. |

---

## Total : 27 images
- A. Résultats : 8
- B. Ennemis : 12
- C. Morts : 7

Renvoie-les moi (même par lots), je les place et je vérifie le rendu en jeu.

## Optionnel (plus tard)
Variantes réussite/échec **par événement** (≈ 2 images × rencontre) : gros lot,
à faire par vagues si tu veux que chaque issue ait sa propre image. Dis-moi les
événements prioritaires.
