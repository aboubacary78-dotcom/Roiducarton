#!/usr/bin/env python3
"""
L'ICÔNE DU JEU À LA PLACE DE CELLE DE CAPACITOR.

`npx cap add android` pose son propre logo bleu partout : sans ce passage,
« Le Roi du Carton » se serait installé sur les téléphones sous le logo de
l'outil qui a servi à l'emballer.

Le nécessaire officiel (`@capacitor/assets`) s'appuie sur `sharp`, dont le
binaire natif ne peut pas être récupéré ici. Pillow fait exactement le même
travail, et il est déjà là.

Trois familles à produire, et elles n'obéissent pas aux mêmes règles :

  · ic_launcher, l'icône carrée classique, pour les téléphones anciens.
  · ic_launcher_round, la même, découpée en rond, pour les lanceurs ronds.
  · ic_launcher_foreground, l'icône ADAPTATIVE (Android 8+). Le système la
    recadre lui-même en rond, en carré, en goutte… selon le téléphone. Le
    dessin ne doit donc occuper que les deux tiers centraux du fichier : ce
    qui déborde de cette « zone sûre » peut être rogné. C'est le piège
    classique, livrer l'icône pleine cadre revient à se faire couper la
    couronne.

Les fichiers écrasés gardent EXACTEMENT les dimensions posées par Capacitor :
on remplace le dessin, jamais la structure.

    python3 scripts/icones-android.py
"""
from PIL import Image, ImageDraw
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
RES = RACINE / 'android/app/src/main/res'
ICONE = Image.open(RACINE / 'resources/icon.png').convert('RGBA')
SPLASH = Image.open(RACINE / 'resources/splash.png').convert('RGBA')

# La zone sûre de l'icône adaptative : 66 dp de dessin sur 108 dp de toile.
PART_SURE = 66 / 108

DENSITES = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}

ecrits = []


def ecrire(chemin: Path, image: Image.Image) -> None:
    attendu = Image.open(chemin).size if chemin.exists() else None
    if attendu and image.size != attendu:
        raise SystemExit(f'{chemin} : {image.size} au lieu de {attendu}')
    image.save(chemin)
    ecrits.append(chemin.relative_to(RACINE))


def rond(image: Image.Image) -> Image.Image:
    """Découpe un disque, bords lissés (le masque est tiré 4× puis réduit)."""
    n = image.size[0]
    masque = Image.new('L', (n * 4, n * 4), 0)
    ImageDraw.Draw(masque).ellipse((0, 0, n * 4 - 1, n * 4 - 1), fill=255)
    sortie = image.copy()
    sortie.putalpha(masque.resize((n, n), Image.LANCZOS))
    return sortie


def deborder(source: Image.Image, largeur: int, hauteur: int, part: float) -> Image.Image:
    """
    Centre `source` sur une toile, puis PROLONGE ses pixels de bord jusqu'aux
    coins.

    Poser le carré source sur un aplat laissait une couture nette : les deux
    dessins portent un dégradé beige, et deux dégradés ne se raccordent
    jamais. Étirer la dernière rangée de pixels prolonge le dégradé par
    lui-même, il n'y a plus de seconde couleur, donc plus rien à raccorder.

    `part` est la fraction du plus petit côté qu'occupe le dessin : ce qui est
    dedans est garanti visible, ce qui est autour n'est que du beige.
    """
    cote = round(min(largeur, hauteur) * part)
    gx, gy = (largeur - cote) // 2, (hauteur - cote) // 2
    dx, dy = largeur - cote - gx, hauteur - cote - gy
    dessin = source.resize((cote, cote), Image.LANCZOS)

    toile = Image.new('RGBA', (largeur, hauteur), (0, 0, 0, 0))
    toile.paste(dessin, (gx, gy))
    if gy:
        toile.paste(dessin.crop((0, 0, cote, 1)).resize((cote, gy)), (gx, 0))
    if dy:
        toile.paste(dessin.crop((0, cote - 1, cote, cote)).resize((cote, dy)), (gx, gy + cote))
    # Les colonnes se tirent APRÈS les lignes : elles emportent ainsi les
    # coins avec elles, et il ne reste aucun angle transparent.
    if gx:
        toile.paste(toile.crop((gx, 0, gx + 1, hauteur)).resize((gx, hauteur)), (0, 0))
    if dx:
        toile.paste(toile.crop((gx + cote - 1, 0, gx + cote, hauteur)).resize((dx, hauteur)), (gx + cote, 0))
    return toile


for densite, taille in DENSITES.items():
    dossier = RES / f'mipmap-{densite}'
    carree = ICONE.resize((taille, taille), Image.LANCZOS)
    ecrire(dossier / 'ic_launcher.png', carree)
    ecrire(dossier / 'ic_launcher_round.png', rond(carree))

    # L'icône adaptative : le système la recadre lui-même, donc le dessin
    # entier tient dans la zone sûre et le beige va jusqu'aux coins.
    cote = round(taille * 108 / 48)
    ecrire(dossier / 'ic_launcher_foreground.png', deborder(ICONE, cote, cote, PART_SURE))

# Écrans de démarrage : le titre et le logo au centre, le beige jusqu'aux
# bords de l'écran quelle que soit sa forme.
for chemin in sorted(RES.glob('drawable*/splash.png')):
    largeur, hauteur = Image.open(chemin).size
    ecrire(chemin, deborder(SPLASH, largeur, hauteur, 0.92))

print(f'{len(ecrits)} fichiers réécrits aux dimensions de Capacitor.')
for c in ecrits:
    print(f'  {c}')
