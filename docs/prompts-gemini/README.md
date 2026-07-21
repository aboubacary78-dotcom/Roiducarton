# Prompts d'images — Le Roi du Carton

**216 images** à générer, découpées en 6 packs. Conçus pour être donnés tels
quels à un générateur d'images **sans accès au dépôt** (compte Manus vierge,
Gemini Pro...) : chaque pack contient tout le contexte, la DA et le protocole.

## Mode d'emploi

1. Ouvre une conversation par pack.
2. Colle le contenu du pack en premier message et **joins les images du zip
   `references-style.zip`** comme référence visuelle (indispensable : le
   générateur n'a pas accès aux 300 images existantes du jeu).
3. Récupère les images, **noms exacts**, et livre un **ZIP** (dossier
   `assets/` à l'intérieur). Lots partiels bienvenus.
4. Transmets le zip pour intégration (vérification, conversion webp si besoin,
   optimisation, mise en jeu).

## Ordre conseillé

| Pack | Contenu | Images | Priorité |
|---|---|---|---|
| ~~pack-1~~ | ✅ TERMINÉ (livré et intégré) | 30 | Fait |
| ~~pack-2~~ | ✅ TERMINÉ (livré et intégré) | 50 | Fait |
| ~~pack-3~~ | ✅ TERMINÉ (livré et intégré) | 50 | Fait |
| ~~pack-4~~ | ✅ TERMINÉ (livré et intégré) | 47 | Fait |
| ~~pack-5~~ | ✅ TERMINÉ (livré et intégré) | 10 | Fait |
| ~~pack-6~~ | ✅ TERMINÉ (livré et intégré) | 30 | Fait |

## Leçons des livraisons précédentes (intégrées au protocole)

✅ Respecté : noms exacts, uniquement les manquants.
❌ Raté : « vrais .webp » (98 PNG renommés, 5 Mo pièce, ré-encodés à
l'intégration) ; 1 fichier corrompu. D'où : webp réel OU png honnête ≤ 1600 px,
< 200 Ko visé, et livraison zip uniquement.

## Phase 2 (plus tard, optionnel)

Les variantes d'issue `result-<id>-good/bad.webp` des 186 nouveaux événements
(~370 images) ne sont pas dans ces packs : en leur absence, le jeu retombe
proprement sur l'illustration de l'événement.

## Phase 2 — EN COURS : les variantes d'issue (372 images, 7 packs)

Dossier `phase2/` : pour chaque nouvel événement, l'issue heureuse
(`result-<id>-good.webp`) et l'issue ratée (`result-<id>-bad.webp`), même
décor, ambiance opposée. Même protocole que les packs précédents.

| Pack | Images |
|---|---|
| `phase2-pack-1-explorer-A.md` | 50 |
| `phase2-pack-2-explorer-B.md` | 50 |
| `phase2-pack-3-dormir-A.md` | 50 |
| `phase2-pack-4-dormir-B.md` | 50 |
| `phase2-pack-5-mendier-suites.md` | 50 |
| `phase2-pack-6-voler.md` | 62 |
| `phase2-pack-7-voyager.md` | 60 |

## Pack Écrans (36 images) — les décors du jeu

`pack-ecrans-36.md` : panoramas de quartier, boutiques, cartes du Repérage,
Sursaut/fantômes, bannières Cimetière/Registre. Presque tous SANS le héros
(voir l'avertissement en tête du pack). Les emplacements sont déjà câblés dans
le code : chaque image s'affiche dès qu'elle arrive.

### Phase 2 — suivi
- ✅ `phase2-pack-1-explorer-A.md` : 50/50 intégrées.
