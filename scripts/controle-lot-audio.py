#!/usr/bin/env python3
"""
CONTRÔLE INDÉPENDANT D'UN LOT AUDIO LIVRÉ.

Un prestataire livre toujours son propre rapport, et il dit toujours que tout
va bien. Ce script ne le lit pas : il rouvre les fichiers et remesure.

Ce qu'il vérifie, et pourquoi chaque point a déjà causé un incident dans ce
projet :

  · LES NOMS, à la lettre près. Le jeu charge `/audio/<nom>.mp3` en dur ; un
    tiret de travers et le son n'existe pas, sans erreur visible — le repli
    prend la main et personne ne s'en aperçoit.
  · LE FORMAT. Un lot livré en AAC s'était déjà chargé sans se décoder sur les
    navigateurs sans codecs propriétaires : « se charger » n'est pas « se
    décoder ». MP3 obligatoire, et on relit l'en-tête plutôt que l'extension.
  · LES DOUBLONS BIT-À-BIT. Deux fichiers identiques veulent dire qu'une
    génération a échoué en silence et qu'on a recopié le voisin.
  · LES FICHIERS VIDES OU MINUSCULES. Un MP3 de 200 octets est un fichier
    valide qui ne contient rien.
  · LA DURÉE, comparée à la commande. Un son d'alerte de 3 s là où on en
    demandait 0,35 rend la mécanique injouable.

Ce qu'il ne peut PAS vérifier, et qu'il faut écouter : que le son ressemble à
ce qu'on a demandé, et que les boucles bouclent sans couture.

    python3 scripts/controle-lot-audio.py <dossier-mp3> [commande.md]
"""
import hashlib
import re
import sys
from collections import defaultdict
from pathlib import Path

from mutagen.mp3 import MP3

dossier = Path(sys.argv[1])
commande = Path(sys.argv[2]) if len(sys.argv) > 2 else None

fichiers = sorted(dossier.glob('*.mp3'))
if not fichiers:
    raise SystemExit(f'aucun MP3 dans {dossier}')

echecs, avertis = [], []


def rate(quoi, detail=''):
    echecs.append(f'{quoi}{f" — {detail}" if detail else ""}')


def note(quoi, detail=''):
    avertis.append(f'{quoi}{f" — {detail}" if detail else ""}')


# ── Mesures ────────────────────────────────────────────────────────────────
mesures = {}
empreintes = defaultdict(list)
for f in fichiers:
    octets = f.read_bytes()
    empreintes[hashlib.sha256(octets).hexdigest()].append(f.name)
    try:
        m = MP3(f)
        mesures[f.name] = {
            'duree': m.info.length,
            'hz': m.info.sample_rate,
            'canaux': m.info.channels,
            'kbps': round(m.info.bitrate / 1000),
            'octets': len(octets),
        }
    except Exception as e:
        rate(f'{f.name} : illisible', str(e)[:60])

print(f'{len(fichiers)} fichiers MP3 dans {dossier}\n')

# ── Le format ──────────────────────────────────────────────────────────────
mauvais_hz = [n for n, m in mesures.items() if m['hz'] != 48000]
print(f"  {'ok  ' if not mauvais_hz else 'RATÉ'}  48 kHz partout"
      + (f" — {len(mauvais_hz)} écart(s) : {mauvais_hz[:3]}" if mauvais_hz else ''))
if mauvais_hz:
    rate('fréquence', f'{len(mauvais_hz)} fichier(s)')

# Un seuil en octets ABSOLU ne veut rien dire : un son de 0,2 s à 40 kbit/s
# pèse mille octets et c'est normal. On compare donc chaque fichier à la taille
# que sa durée et son débit impliquent — ce qui attrape le vrai défaut, un
# fichier tronqué à l'export.
minus = []
for n, m in mesures.items():
    theorique = m['duree'] * m['kbps'] * 1000 / 8
    if m['octets'] < 300 or (theorique and m['octets'] < theorique * 0.6):
        minus.append(f"{n} ({m['octets']} o pour {theorique:.0f} attendus)")
print(f"  {'ok  ' if not minus else 'RATÉ'}  aucun fichier tronqué"
      + (f' — {minus}' if minus else ''))
if minus:
    rate('fichiers tronqués', str(minus))

# ── Les doublons ───────────────────────────────────────────────────────────
paires = [v for v in empreintes.values() if len(v) > 1]
print(f"  {'ok  ' if not paires else 'RATÉ'}  aucun doublon bit-à-bit"
      + (f' — {paires}' if paires else ''))
if paires:
    rate('doublons', str(paires))

# ── Mono / stéréo : les boucles sont stéréo, le reste mono ─────────────────
stereo = sorted(n for n, m in mesures.items() if m['canaux'] == 2)
mono = sorted(n for n, m in mesures.items() if m['canaux'] == 1)
print(f'  ok    {len(mono)} en mono, {len(stereo)} en stéréo')
print(f'        stéréo : {", ".join(s[:-4] for s in stereo) or "—"}')

# ── Comparaison à la commande ──────────────────────────────────────────────
if commande and commande.exists():
    texte = commande.read_text()
    attendus = {}
    for ligne in texte.splitlines():
        m = re.search(r'`([a-z0-9-]+\.mp3)`(?: 🔁)?\s*\|\s*([0-9,–\-\s]+)s', ligne)
        if m:
            attendus[m.group(1)] = m.group(2).strip()
    livres = {f.name for f in fichiers}
    manquants = sorted(set(attendus) - livres)
    en_plus = sorted(livres - set(attendus))

    print()
    print(f'  {"ok  " if not manquants else "RATÉ"}  {len(attendus)} commandés, '
          f'{len(attendus) - len(manquants)} livrés'
          + (f' — MANQUE : {manquants}' if manquants else ''))
    if manquants:
        rate('fichiers manquants', str(manquants))
    if en_plus:
        note(f'{len(en_plus)} fichier(s) hors commande', ', '.join(en_plus))
        print(f'  note  {len(en_plus)} hors commande : {", ".join(x[:-4] for x in en_plus)}')

    # Durées : on tolère largement, on ne cherche que les écarts grossiers
    ecarts = []
    for nom, spec in attendus.items():
        if nom not in mesures:
            continue
        bornes = [float(x.replace(',', '.')) for x in re.findall(r'[\d,]+', spec)]
        if not bornes:
            continue
        lo, hi = min(bornes), max(bornes)
        d = mesures[nom]['duree']
        if d < lo * 0.5 or d > hi * 2.5 + 1:
            ecarts.append(f'{nom[:-4]} : {d:.1f}s pour {spec}s')
    print(f'  {"ok  " if not ecarts else "note"}  durées dans l\'ordre de grandeur demandé'
          + (f' — {len(ecarts)} écart(s)' if ecarts else ''))
    for e in ecarts[:8]:
        print(f'        {e}')
    if ecarts:
        note('durées', f'{len(ecarts)} écart(s) marqué(s)')

# ── Verdict ────────────────────────────────────────────────────────────────
print()
if echecs:
    print(f'{len(echecs)} PROBLÈME(S) BLOQUANT(S) :')
    for e in echecs:
        print(f'  · {e}')
else:
    print('Aucun problème bloquant.')
if avertis:
    print(f'{len(avertis)} point(s) à regarder :')
    for a in avertis:
        print(f'  · {a}')
print('\nCe contrôle ne remplace pas l\'écoute : il dit que les fichiers sont '
      'sains,\npas qu\'ils sonnent juste ni que les boucles bouclent.')
sys.exit(1 if echecs else 0)
