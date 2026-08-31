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
    par le module de l'application est bien défini quelque part, dans le
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
    print(f"{'  ok  ' if ok else ' RATÉ '} {nom}{f' · {detail}' if detail else ''}")


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
"""
L'APP ID ET LES BLOCS DOIVENT VENIR DU MÊME COMPTE.

Le contrôle précédent exigeait que le natif et le web soient « dans le même
mode », test ou réel. C'était une erreur d'analyse : l'état normal du
développement, c'est justement d'avoir ses VRAIS blocs et le mode test
allumé, on éprouve le vrai chemin sans jamais produire d'impression réelle.

La règle qui compte vraiment est ailleurs. Un App ID d'un compte avec des
blocs d'un autre ne diffuse rien, et ne dit rien : pas d'erreur, pas de log,
juste un écran vide. Le préfixe éditeur (ca-app-pub-XXXX) doit donc être le
même des deux côtés.
"""
ads = (RACINE / 'client/src/lib/ads.ts').read_text(encoding='utf-8')
editeur_natif = re.search(r'android:value="(ca-app-pub-\d+)~', manifeste)
bloc_android = re.search(r'android:\s*\{(.*?)\}', ads, re.S)
editeurs_web = set(re.findall(r'(ca-app-pub-\d+)/', bloc_android.group(1) if bloc_android else ''))
verifier("l'App ID natif et les blocs Android sont du même éditeur",
         bool(editeur_natif) and editeurs_web == {editeur_natif.group(1)},
         f"natif {editeur_natif.group(1) if editeur_natif else '?'}, "
         f"blocs {', '.join(sorted(editeurs_web)) or '?'}")

# Le mode test n'est pas un défaut : c'est l'état attendu tant qu'on n'a pas
# fabriqué le paquet à téléverser. On le RAPPELLE, on ne le sanctionne pas.
DEMO = 'ca-app-pub-3940256099942544'
verifier('les blocs Android ne sont plus ceux de démonstration',
         DEMO not in (bloc_android.group(1) if bloc_android else DEMO))
if 'USE_TEST_ADS = true' in ads:
    print('    rappel : USE_TEST_ADS = true, annonces de démonstration servies à '
          'travers les vrais blocs.\n'
          "             À passer à false au moment de fabriquer l'AAB, pas avant : "
          'cliquer\n'
          "             sur ses propres vraies annonces fait fermer le compte AdMob.")

variables = (ANDROID / 'variables.gradle').read_text(encoding='utf-8')
cible = int(re.search(r'targetSdkVersion\s*=\s*(\d+)', variables).group(1))
verifier('le niveau d\'API visé satisfait le Play Store (≥ 35)', cible >= 35, f'API {cible}')

# La facturation impose son propre plancher : la Google Play Billing Library 9,
# embarquée par cordova-plugin-purchase, refuse de compiler sous l'API 23. Le
# gabarit de Capacitor descend à 22, et l'erreur n'apparaît qu'au premier
# Gradle, c'est-à-dire sur une autre machine, une heure plus tard.
plancher = int(re.search(r'minSdkVersion\s*=\s*(\d+)', variables).group(1))
verifier('le niveau d\'API minimal satisfait la facturation (≥ 23)',
         plancher >= 23, f'minSdk {plancher}')

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
