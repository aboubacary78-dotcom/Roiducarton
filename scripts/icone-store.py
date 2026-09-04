"""
L'ICÔNE DE LA FICHE PLAY — 512 × 512, PNG 32 BITS, UN MÉGAOCTET AU PLUS.

    python3 scripts/icone-store.py

Il n'y a rien à inventer : l'icône du jeu existe en 1024 × 1024 dans
`resources/`, c'est celle que Capacitor décline déjà pour l'application. La
fiche en veut une copie en 512, et une seule chose peut mal tourner.

LE PIÈGE, ET IL EST BÊTE. Google demande un PNG 32 bits, c'est-à-dire AVEC un
canal alpha — l'inverse exact du visuel de mise en avant, qui le refuse. La
source est en RVB sans alpha : enregistrée telle quelle, elle sort en PNG 24
bits et le téléversement la rejette. On ajoute donc un canal alpha entièrement
opaque, ce qui ne change pas un pixel visible et change le format déclaré.

On réduit en LANCZOS : une icône est faite de traits fins, et un rééchantillon-
nage grossier les fait baver exactement là où elle sera regardée le plus petit.
"""
from PIL import Image
import os

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'resources/icon.png')
DEST = os.path.join(RACINE, 'visuels-store/icone-512.png')

src = Image.open(SRC)
print(f'source : {src.size[0]} × {src.size[1]}, mode {src.mode}')
if src.size[0] != src.size[1]:
    raise SystemExit('ARRÊT : l\'icône source n\'est pas carrée, la fiche la refusera.')

icone = src.convert('RGBA').resize((512, 512), Image.LANCZOS)
os.makedirs(os.path.dirname(DEST), exist_ok=True)
icone.save(DEST, 'PNG', optimize=True)

poids = os.path.getsize(DEST)
verif = Image.open(DEST)
print(f'  {DEST}')
print(f'  {verif.size[0]} × {verif.size[1]}, mode {verif.mode} '
      f'({"32 bits, conforme" if verif.mode == "RGBA" else "PAS 32 BITS — sera refusée"})')
print(f'  {poids // 1024} ko {"· conforme" if poids <= 1024 * 1024 else "· AU-DESSUS DU MÉGAOCTET"}')
