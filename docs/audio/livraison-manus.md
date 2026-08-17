# Livraison — Refonte audio

Le dossier `audio/` contient les **65 fichiers MP3** attendus : 49 sons de base et 16 fichiers de variante pour les huit sons répétitifs. Les fichiers ont été générés avec ElevenLabs Sound Effects à partir des prompts du cahier des charges, puis postproduits automatiquement.

## Conformité technique automatisée

| Critère | Résultat |
|---|---:|
| Fichiers attendus | 65 |
| Fichiers présents | 65 |
| Noms de fichiers attendus | 65/65 |
| Format final | MP3 |
| Canaux | Mono |
| Fréquence d’échantillonnage | 48 kHz |
| Débit cible | 40 kbit/s (mesuré dans la plage 36–45 kbit/s) |
| Durée | Limitée à la durée cible, avec la tolérance liée à l’encodage MP3 |
| Silence de tête | Contrôlé sous 10 ms |
| Fichiers bit-à-bit identiques | Aucun |

La synthèse détaillée est disponible dans `audio_qa_report.md`. Le manifeste des prompts est fourni dans `elevenlabs_manifest.md` et `elevenlabs_manifest.csv`.

## Contrôle humain restant

> Le contrôle automatique ne peut pas remplacer l’écoute du résultat. Avant intégration, écouter chaque fichier sur le haut-parleur d’un téléphone pour confirmer la lisibilité de l’attaque, l’absence d’artefacts et la conformité sensible au brief : foley proche, sec, sans musique ni réverbération.

Les sources ont été produites sous le compte ElevenLabs Free avec l’accord d’usage **non commercial** indiqué pour ce projet. Si le jeu devient commercial, les sorties devront être régénérées sous une formule dotée de la licence commerciale appropriée.

## Contenu de l’archive

| Élément | Description |
|---|---|
| `audio/` | Les 65 MP3 finals prêts à intégrer |
| `audio_qa_report.md` | Résultats des contrôles techniques automatisés |
| `elevenlabs_manifest.md` | Tableau complet des 49 prompts et du plan de variantes |
| `elevenlabs_manifest.csv` | Manifeste exploitable en tableur ou script |
| `README_livraison_audio.md` | Cette note de livraison |
