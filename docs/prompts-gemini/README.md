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
| `pack-2-explorer-50.md` | Nouveaux événements Explorer | 50 | Ensuite |
| ~~pack-3~~ | ✅ TERMINÉ (livré et intégré) | 50 | Fait |
| `pack-4-mendier-voler-47.md` | Mendier (15) + Voler (31) + Vigile de Choc | 47 | Ensuite |
| `pack-5-suites-10.md` | Les 10 nouvelles suites narratives | 10 | Ensuite |
| `pack-6-voyager-30.md` | Nouveaux événements Voyager | 30 | Ensuite |

## Leçons des livraisons précédentes (intégrées au protocole)

✅ Respecté : noms exacts, uniquement les manquants.
❌ Raté : « vrais .webp » (98 PNG renommés, 5 Mo pièce, ré-encodés à
l'intégration) ; 1 fichier corrompu. D'où : webp réel OU png honnête ≤ 1600 px,
< 200 Ko visé, et livraison zip uniquement.

## Phase 2 (plus tard, optionnel)

Les variantes d'issue `result-<id>-good/bad.webp` des 186 nouveaux événements
(~370 images) ne sont pas dans ces packs : en leur absence, le jeu retombe
proprement sur l'illustration de l'événement.
