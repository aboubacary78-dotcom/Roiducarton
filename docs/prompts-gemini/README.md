# Prompts d'images — Le Roi du Carton

**216 images** à générer, découpées en 6 packs. Conçus pour être donnés tels
quels à un générateur d'images (Gemini Pro, ou un compte Manus vierge) : chaque
pack contient tout le contexte nécessaire, DA et protocole de livraison inclus.

## Ordre conseillé

| Pack | Contenu | Images | Priorité |
|---|---|---|---|
| `pack-1-priorite-haute-30.md` | Les 30 dernières variantes d'issue de la vague 1 | 30 | 🔥 D'abord |
| `pack-2-explorer-50.md` | Illustrations des nouveaux événements Explorer | 50 | Ensuite |
| `pack-3-dormir-50.md` | Illustrations des nouveaux événements Dormir | 50 | Ensuite |
| `pack-4-mendier-voler-46.md` | Mendier (15) + Voler (31) | 46 | Ensuite |
| `pack-5-suites-10.md` | Les 10 nouvelles suites narratives | 10 | Ensuite |
| `pack-6-voyager-30.md` | Illustrations des nouveaux événements Voyager | 30 | Ensuite |

## Bilan de la livraison Manus du 15/07 (pour mémoire)

✅ Respecté : noms de fichiers exacts, uniquement les manquants, livraison par
la branche `manus-assets`. Les 7 `followup-*` historiques et 38 variantes sont
intégrés.
❌ Pas respecté : « vrais .webp » — 98 PNG renommés en .webp (5 Mo pièce,
485 Mo au total), ré-encodés à l'intégration (33 Mo). 1 fichier corrompu
(`result-beg-fleuriste-good.webp`), remis dans le pack 1.
➡️ D'où le protocole de livraison durci en tête de chaque pack.

## Phase 2 (plus tard, optionnel)

Les variantes d'issue `result-<id>-good/bad.webp` des 186 nouveaux événements
(~370 images) ne sont pas dans ces packs : en leur absence, le jeu retombe
proprement sur l'illustration de l'événement.
