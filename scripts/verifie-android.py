#!/usr/bin/env python3
"""
CE QU'ON PEUT VÉRIFIER DU PROJET ANDROID SANS LE COMPILER.

Le SDK Android ne peut pas être installé dans cet environnement
(dl.google.com est hors d'atteinte), donc Gradle ne tourne pas ici. Une bonne
part des erreurs qui font échouer une compilation Android ne sont pourtant pas
des erreurs de code : ce sont des fichiers XML mal formés et des renvois vers
une ressource qui n'existe pas. Celles-là se trouvent sans compilateur.

Ce script contrôle donc :
  · que chaque XML du projet natif est bien formé ;
  · que chaque @color / @string / @drawable / @mipmap / @style / @xml cité
    par le module de l'application est bien défini quelque part — dans le
    module lui-même, dans une bibliothèque, ou dans Android ;
  · que les points de configuration qu'on a posés à la main sont toujours là :
    l'App ID AdMob sans lequel l'application se ferme au lancement, le niveau
    d'API exigé par le Play Store, et le numéro de version tiré de
    package.json.

Ce qu'il ne remplace pas : la compilation elle-même. Le premier
`pnpm cap:open:android` sur une machine équipée du SDK reste le juge.

    python3 scripts/verifie-android.py
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
ANDROID = RACINE / 'android'
APP = ANDROID / 'app/src/main'

echecs: list[str] = []
oks: list[str] = []


def verifier(nom: str, ok: bool, detail: str = '') -> None:
    (oks if ok else echecs).append(nom)
    print(f"{'  ok  ' if ok else ' RATÉ '} {nom}{f' — {detail}' if detail else ''}")


# ── 1. Tous les XML sont-ils bien formés ? ──────────────────────────────────
xmls = [p for p in ANDROID.rglob('*.xml')
        if 'build/' not in str(p) and 'assets/public' not in str(p)]
casses = []
for p in xmls:
    try:
        ET.parse(p)
    except ET.ParseError as e:
        casses.append(f'{p.relative_to(RACINE)} : {e}')
verifier(f'{len(xmls)} fichiers XML bien formés', not casses, casses[0] if casses else '')

# ── 2. Les ressources citées existent-elles ? ───────────────────────────────
# Ce que le module définit lui-même : <color name=…>, <string name=…>, et les
# fichiers de res/<type>/<nom>.<ext>.
definies: set[str] = set()
for p in (APP / 'res').rglob('*'):
    if p.is_dir():
        continue
    type_res = p.parent.name.split('-')[0]
    definies.add(f'{type_res}/{p.stem}')
    if p.suffix == '.xml' and p.parent.name.startswith('values'):
        try:
            for e in ET.parse(p).getroot():
                if 'name' in e.attrib:
                    definies.add(f'{e.tag}/{e.attrib["name"]}')
        except ET.ParseError:
            pass

# Fournies par les bibliothèques (capacitor-android, AppCompat, AdMob) ou par
# Android lui-même : elles ne sont pas dans res/, et c'est normal.
AILLEURS = {
    'color/colorPrimary', 'color/colorPrimaryDark', 'color/colorAccent',
    'style/AppTheme', 'style/AppTheme.NoActionBar', 'style/AppTheme.NoActionBarLaunch',
    'style/Theme.SplashScreen',
}

manquantes = []
for p in (APP / 'res').rglob('*.xml'), [APP / 'AndroidManifest.xml']:
    for fichier in p:
        texte = fichier.read_text(encoding='utf-8')
        for type_res, nom in re.findall(r'"@(color|string|drawable|mipmap|style|xml|layout)/([\w.]+)"', texte):
            ref = f'{type_res}/{nom}'
            if ref in definies or ref in AILLEURS:
                continue
            # <style name="A.B"> se cite @style/A.B mais se définit "A.B"
            if type_res == 'style' and f'style/{nom.split(".")[0]}' in definies:
                continue
            manquantes.append(f'{ref} (cité par {fichier.relative_to(RACINE)})')
verifier('aucune ressource citée sans être définie', not manquantes,
         '; '.join(sorted(set(manquantes))[:3]))

# ── 3. Les réglages posés à la main tiennent-ils toujours ? ─────────────────
manifeste = (APP / 'AndroidManifest.xml').read_text(encoding='utf-8')
verifier("l'App ID AdMob est déclaré (sans lui, fermeture au lancement)",
         'com.google.android.gms.ads.APPLICATION_ID' in manifeste)
# Le côté natif et le côté web doivent basculer ENSEMBLE : un App ID réel avec
# des blocs de test ne rapporte rien, et l'inverse peut faire fermer le compte.
natif_en_test = 'ca-app-pub-3940256099942544~3347511713' in manifeste
web_en_test = 'USE_TEST_ADS = true' in (RACINE / 'client/src/lib/ads.ts').read_text(encoding='utf-8')
verifier("l'App ID natif et les blocs web sont dans le même mode",
         natif_en_test == web_en_test,
         f"natif {'test' if natif_en_test else 'réel'}, web {'test' if web_en_test else 'réel'}")

variables = (ANDROID / 'variables.gradle').read_text(encoding='utf-8')
cible = int(re.search(r'targetSdkVersion\s*=\s*(\d+)', variables).group(1))
verifier('le niveau d\'API visé satisfait le Play Store (≥ 35)', cible >= 35, f'API {cible}')

gradle = (ANDROID / 'app/build.gradle').read_text(encoding='utf-8')
verifier('le numéro de version vient de package.json', 'pkg.version' in gradle
         and 'versionCode 1\n' not in gradle)

version = json.loads((RACINE / 'package.json').read_text(encoding='utf-8'))['version']
majeur, mineur, correctif = (int(x) for x in version.split('.'))
print(f"    version : {version} → versionCode {majeur * 10000 + mineur * 100 + correctif}")

# ── 4. Le copiage du site est-il hors du dépôt ? ────────────────────────────
ignore = (ANDROID / '.gitignore').read_text(encoding='utf-8')
verifier('les 94 Mo de site copié restent hors du dépôt',
         'app/src/main/assets/public' in ignore)

print(f"\n{len(oks)} vérification(s) au vert" + (f", {len(echecs)} en échec." if echecs else '.'))
print('La compilation reste à faire sur une machine équipée du SDK Android.')
sys.exit(1 if echecs else 0)
