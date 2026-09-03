"""
DÉTOURER LE LOGO DU STUDIO, SANS RIEN MANGER DEDANS.

    python3 scripts/detourer-logo.py

Le logo arrive sur un fond crème uniforme (243, 245, 235). Le museau du raton,
son masque clair et le blanc de ses yeux sont EUX AUSSI crème, et à quelques
unités près : une suppression « toutes les couleurs proches du fond » les
trouerait. On part donc des BORDS et on ne retire que ce qui leur est relié,
par diffusion. Tout ce qui est enfermé dans un trait noir survit.

RESTE LE CAS DES CONTRE-POINÇONS. Le trou du A, celui du D de DEUX et celui du
A de MAIN sont eux aussi enfermés dans du noir, et eux doivent bien être
ajourés : un logo dont les lettres sont bouchées de crème se lit comme un
autocollant posé sur une carte, pas comme une marque imprimée sur le carton.

On a cherché une règle générale pour les distinguer du dessin, et on n'en a pas
gardé : « entouré de noir » désigne aussi le blanc des yeux, et les ajourer
rendrait le raton aveugle. Trois boîtes nommées valent mieux qu'une heuristique
qui crève un œil. Elles décrivent CE fichier-ci ; un logo redessiné demandera
de relire la liste, et le script le dit s'il ne les retrouve pas.

Sortie : trois WebP à canal alpha dans client/public/assets.
  · studio-logo.webp     le logo entier, pour les usages statiques
  · studio-embleme.webp  le raton et ses deux lettres
  · studio-mot.webp      « DEUX MAIN » seul
L'ouverture se sert des deux derniers : ils tombent l'un après l'autre.
"""
from PIL import Image, ImageFilter
from collections import deque
import os, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, 'docs/prompts-images/logo-atdeuxmain-source.jpg')
DEST = os.path.join(RACINE, 'client/public/assets')
TOL = 26

# Les trois contre-poinçons, en coordonnées de l'image source, repérés en
# énumérant les poches fermées puis en les identifiant une à une.
CONTRE_POINCONS = [
    ('le trou du A',        (600, 630, 657, 735)),
    ('le trou du D de DEUX', (403, 1401, 466, 1495)),
    ('le trou du A de MAIN', (1346, 1413, 1380, 1469)),
]

im = Image.open(SRC).convert('RGB')
w, h = im.size
data = im.tobytes()
coins = [(3, 3), (w - 4, 3), (3, h - 4), (w - 4, h - 4)]
fr = sum(data[(y * w + x) * 3] for x, y in coins) // 4
fg = sum(data[(y * w + x) * 3 + 1] for x, y in coins) // 4
fb = sum(data[(y * w + x) * 3 + 2] for x, y in coins) // 4
print(f'source {w}×{h}, fond mesuré ({fr}, {fg}, {fb})')


def est_fond(i):
    o = i * 3
    return (abs(data[o] - fr) <= TOL and abs(data[o + 1] - fg) <= TOL
            and abs(data[o + 2] - fb) <= TOL)


def diffuser(depart, dehors):
    """Étend une zone de fond par lignes de balayage, à partir de graines."""
    pile = deque(depart)
    while pile:
        x, y = pile.pop()
        gx = x
        while gx > 0 and not dehors[y * w + gx - 1] and est_fond(y * w + gx - 1):
            gx -= 1; dehors[y * w + gx] = 1
        dx = x
        while dx < w - 1 and not dehors[y * w + dx + 1] and est_fond(y * w + dx + 1):
            dx += 1; dehors[y * w + dx] = 1
        for vy in (y - 1, y + 1):
            if 0 <= vy < h:
                base = vy * w
                for vx in range(gx, dx + 1):
                    if not dehors[base + vx] and est_fond(base + vx):
                        dehors[base + vx] = 1; pile.append((vx, vy))


# ── ① Le fond extérieur ────────────────────────────────────────────────────
dehors = bytearray(w * h)
graines = []
for x in range(w):
    for y in (0, h - 1):
        if not dehors[y * w + x] and est_fond(y * w + x):
            dehors[y * w + x] = 1; graines.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if not dehors[y * w + x] and est_fond(y * w + x):
            dehors[y * w + x] = 1; graines.append((x, y))
diffuser(graines, dehors)
print(f'fond extérieur : {sum(dehors)} pixels retirés')

# ── ② Les trois contre-poinçons, chacun nommé ──────────────────────────────
for nom, (x0, y0, x1, y1) in CONTRE_POINCONS:
    g = [(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1)
         if est_fond(y * w + x) and not dehors[y * w + x]]
    if not g:
        print(f'  ARRÊT : {nom} est introuvable dans {(x0, y0, x1, y1)}.')
        print('  Le logo source a changé : relire la liste CONTRE_POINCONS.')
        sys.exit(1)
    avant = sum(dehors)
    for x, y in g: dehors[y * w + x] = 1
    diffuser(g, dehors)
    print(f'  ajouré {nom} : {sum(dehors) - avant} pixels')

# ── ③ Ce qui doit avoir SURVÉCU ────────────────────────────────────────────
# Sans ce contrôle, un élargissement de TOL passerait inaperçu jusqu'à ce que
# quelqu'un remarque, des semaines plus tard, que le raton a le regard vide.
temoins = [('museau', 1010, 800), ('masque gauche', 855, 700),
           ('œil gauche', 945, 705), ('œil droit', 1109, 705), ('ventre', 1010, 1120)]
for nom, x, y in temoins:
    if dehors[y * w + x]:
        print(f'  ARRÊT : {nom} a été retiré. Le détourage mange le dessin.')
        sys.exit(1)
print(f'  intacts : {", ".join(n for n, _, _ in temoins)}')

masque = Image.frombytes('L', (w, h), bytes(0 if d else 255 for d in dehors))

# ── ④ La couleur qui saigne sur le bord ────────────────────────────────────
# En réduisant l'image, les pixels transparents se mélangent aux opaques. Les
# laisser crème donnerait à chaque contour un liseré clair, très visible sur le
# carton sombre. On les repeint de la couleur MOYENNE du contour réel.
bord = masque.filter(ImageFilter.FIND_EDGES).tobytes()
sr = sg = sb = n = 0
for i in range(0, w * h, 7):
    if bord[i] and not dehors[i]:
        o = i * 3
        sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; n += 1
contour = (sr // n, sg // n, sb // n) if n else (24, 26, 30)
print(f'couleur du contour : {contour}')

plat = Image.new('RGB', (w, h), contour)
plat.paste(im, (0, 0), masque)
logo = plat.convert('RGBA')
logo.putalpha(masque)
logo = logo.crop(masque.getbbox())

# ── ⑤ Où couper entre l'emblème et le mot ──────────────────────────────────
lw, lh = logo.size
lignes = logo.getchannel('A').tobytes()
vides = [y for y in range(lh) if not any(lignes[y * lw:(y + 1) * lw])]
suites, courante = [], []
for y in vides:
    if courante and y == courante[-1] + 1: courante.append(y)
    else:
        if courante: suites.append(courante)
        courante = [y]
if courante: suites.append(courante)
basses = [s for s in suites if s[0] > lh * 0.45]
if not basses:
    print('ARRÊT : aucune ligne vide sous le raton, rien à découper.'); sys.exit(1)
fente = max(basses, key=len)
print(f'fente de {len(fente)} px à y={fente[0]}–{fente[-1]} sur {lh}')


def serrer(img):
    return img.crop(img.getchannel('A').getbbox())


morceaux = [
    ('studio-logo', logo, 900),
    ('studio-embleme', serrer(logo.crop((0, 0, lw, fente[0]))), 760),
    ('studio-mot', serrer(logo.crop((0, fente[-1] + 1, lw, lh))), 760),
]
os.makedirs(DEST, exist_ok=True)
for nom, img, largeur in morceaux:
    r = img.resize((largeur, max(1, round(img.height * largeur / img.width))), Image.LANCZOS)
    chemin = os.path.join(DEST, f'{nom}.webp')
    r.save(chemin, 'WEBP', quality=92, method=6)
    print(f'  {nom}.webp  {r.width}×{r.height}  {os.path.getsize(chemin) // 1024} ko')
