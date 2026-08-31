# Rapport de contrôle qualité · lot 3 musical

Les sept exports Stable Audio ont été préparés en masters WAV de 60 secondes avec une amorce silencieuse de 200 ms et une queue en fondu vers le silence, puis encodés en MP3 à **gain constant**. Aucun compresseur ni limiteur dynamique n’a été appliqué. Les mesures réelles (`input_i` et `input_tp`) reposent sur l’analyse intégrée EBU R128 de FFmpeg et sur la comparaison RMS des fenêtres de 200 ms placées en tête et en queue de chaque **master WAV**.

| Fichier | Durée | Niveau intégré | True peak | Écart master tête/queue | Statut |
|---|---:|---:|---:|---:|---|
| `musique-mort.mp3` | 60.029 s | -19.99 LUFS | -7.68 dBTP | 0.00 dB | VALIDÉ |
| `mg-bagarre.mp3` | 60.029 s | -20.00 LUFS | -9.06 dBTP | 0.00 dB | VALIDÉ |
| `mg-esquive.mp3` | 60.029 s | -19.99 LUFS | -10.01 dBTP | 0.00 dB | VALIDÉ |
| `mg-casse.mp3` | 60.029 s | -20.00 LUFS | -7.05 dBTP | 0.00 dB | VALIDÉ |
| `mg-manche.mp3` | 60.029 s | -20.01 LUFS | -5.68 dBTP | 0.00 dB | VALIDÉ |
| `mg-recup.mp3` | 60.029 s | -19.99 LUFS | -8.15 dBTP | 0.00 dB | VALIDÉ |
| `mg-marchandage.mp3` | 60.029 s | -20.02 LUFS | -9.59 dBTP | 0.00 dB | VALIDÉ |

## Critères de conformité

| Critère | Seuil |
|---|---|
| Conteneur et codec | MP3, stéréo, 44 100 Hz, 96 kbit/s nominal |
| Durée | 60,000 s avec une tolérance de trame MP3 de ±0,050 s |
| Niveau intégré | −20,0 LUFS ±0,2 LU |
| True peak | Ne dépasse pas −1,5 dBTP |
| Continuité de niveau du master WAV | Écart RMS tête/queue sur 200 ms inférieur à 1 dB |

> Le raccord musical complet doit également être écouté dans le moteur du jeu en répétition continue. La mesure de niveau ne remplace pas l’écoute d’éventuels transitoires, de changements harmoniques ou de fins de phrase audibles au passage de la queue vers la tête.

## Résultat global

**VALIDÉ**. Tous les contrôles automatisés sont conformes.
