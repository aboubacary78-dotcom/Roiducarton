# Prompts d'images — dioramas carton (Le Roi du Carton)

Ces images manquent encore pour certains **résultats** (vol, mendicité-police,
événements-légende). Le code les référence déjà : dès que tu déposes le fichier
au bon nom dans `client/public/assets/`, il s'affiche automatiquement. Tant
qu'un fichier est absent, le jeu retombe proprement sur une scène dessinée.

## Comment procéder
1. Génère chaque image avec ton outil (Midjourney, DALL·E, SDXL…), en
   **collant le préambule de style + la description de la scène**.
2. Format conseillé : **paysage 3:2**, exporté en **`.webp`** (ou `.png`/`.jpg`,
   je convertirai).
3. Nomme le fichier **exactement** comme indiqué (colonne « Fichier »).
4. Renvoie-moi les fichiers : je les place dans `client/public/assets/` et je
   vérifie le rendu en jeu.

## Préambule de style (à mettre au début de CHAQUE prompt)
> Handmade miniature diorama, everything built entirely from brown corrugated
> cardboard and kraft paper. Characters are cardboard cut-out puppets with
> hand-drawn black marker faces, frayed edges, visible cardboard corrugation,
> bits of twine, masking tape and staples. Warm tungsten lighting with a string
> of tiny glowing fairy lights, cozy but gritty homeless-street mood, gentle
> dark humor. Macro product photography, shallow depth of field, soft warm
> shadows, slightly desaturated warm brown palette, photorealistic. 3:2 landscape.

*(Astuce cohérence : garde les mêmes réglages/seed d'une image à l'autre, et le
même « personnage SDF » en carton — barbe, manteau rapiécé — que sur les images
déjà présentes `exp-*` / `combat-*`.)*

---

## Images à générer (8)

| # | Fichier | Scène (à ajouter après le préambule) |
|---|---------|--------------------------------------|
| 1 | `result-steal-success.webp` | A cardboard homeless man sneaking away with a stolen item (an apple / a baguette) hidden under his patched coat, a sly satisfied grin on his marker face, glancing over his shoulder in a cardboard alley. Triumphant but sneaky. |
| 2 | `result-steal-fail.webp` | The cardboard homeless man caught stealing, fleeing in panic while an angry cardboard shopkeeper and passers-by shout and point; a dropped cardboard apple mid-air. Chaos, shame, motion. |
| 3 | `result-steal-police.webp` | A stern cardboard police officer gripping the cardboard homeless man by the arm, handcuffs of twisted wire, a tiny cardboard police car with a glowing red light in the background. Custody, resignation. |
| 4 | `result-beg-police.webp` | A cardboard police officer waving the cardboard beggar away from a cardboard sidewalk, an overturned cardboard hat with a few coins spilling out, "MOVE ALONG" mood. Disappointment. |
| 5 | `legend-graffiti.webp` | A crumbling cardboard wall with graffiti drawn in marker: "ROI DU CARTON", a small cardboard crown doodle, the cardboard homeless man standing before it in quiet respect. Reverent, nostalgic. |
| 6 | `legend-ancien.webp` | An old wise cardboard homeless man with a long frayed beard sitting on a cardboard crate, telling a story, gesturing; the player's cardboard character listening. Warm, mentor mood. |
| 7 | `legend-carton.webp` | A worn-out cardboard box shrine under a cardboard porch, a marker inscription on it, a tiny cardboard candle and coin beside it, like a street relic / pilgrimage spot. Solemn, tender. |
| 8 | `legend-pari.webp` | Two cardboard homeless men shaking hands over a bet, one coin between them, grinning marker faces, a cardboard alley with fairy lights. Playful, streetwise. |

---

## Optionnel (plus tard) — variantes réussite/échec par événement
Si tu veux VRAIMENT une image différente selon l'issue de chaque rencontre
(ex. « les chats se calment » vs « les chats t'attaquent »), c'est faisable mais
c'est un gros lot (≈ 2 images × chaque événement). On peut le faire par vagues :
dis-moi les événements prioritaires et je te sortirai les prompts correspondants
sur le même modèle.
