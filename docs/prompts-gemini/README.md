# Prompts Gemini — Le Roi du Carton

244 images à générer, découpées en 6 packs. **Chaque pack = une conversation
Gemini** : colle le message d'amorçage (en tête de chaque pack) une seule fois,
joins 2-3 .webp existants du jeu comme référence de style, puis envoie les
scènes une par une.

## Ordre conseillé

| Pack | Contenu | Images | Priorité |
|---|---|---|---|
| `pack-1-priorite-haute-58.md` | Les manquants historiques (suites, légendes, mendicité) | 58 | 🔥 D'abord |
| `pack-2-explorer-50.md` | Illustrations des nouveaux événements Explorer | 50 | Ensuite |
| `pack-3-dormir-50.md` | Illustrations des nouveaux événements Dormir | 50 | Ensuite |
| `pack-4-mendier-voler-46.md` | Mendier (15) + Voler (31) | 46 | Ensuite |
| `pack-5-suites-10.md` | Les 10 nouvelles suites narratives | 10 | Ensuite |
| `pack-6-voyager-30.md` | Illustrations des nouveaux événements Voyager | 30 | Ensuite |

## Règles d'or

1. **Nom de fichier EXACT** (copier-coller depuis le pack). Une faute = image
   ignorée par le jeu, sans erreur visible.
2. **Paysage 3:2**, pas de texte dans l'image.
3. PNG/JPG acceptés : la conversion .webp + l'optimisation se font au moment de
   l'intégration. Livre par lots (zip), même incomplets — chaque image s'active
   dès qu'elle arrive, le jeu affiche la scène dessinée en attendant.

## Phase 2 (plus tard, optionnel)

Les variantes d'issue `result-<id>-good/bad.webp` des 156 nouveaux événements
(~300 images) ne sont **pas** dans ces packs : en leur absence, le jeu retombe
proprement sur l'illustration de l'événement. On les fera quand tout le reste
sera en place.
