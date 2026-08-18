# Second lot audio — Le Roi du Carton
## Une musique, 18 sons, et pourquoi ceux-là

---

## Ce que l'audit a trouvé

Le jeu compte **404 fichiers audio**. Sur ce qu'on peut compter, la couverture
est déjà complète :

| | |
|---|---:|
| Rencontres avec leur bruitage écrit | **254 / 254** |
| Ennemis avec leur cri | **26 / 26** |
| Quartiers avec leur ambiance | **5 / 5** |
| Temps avec leur lit sonore | **5 / 5** |
| Gestes du joueur qui déclenchent un son | **115 / 115** |

Le manque n'est donc pas une question de quantité. Il est ailleurs, et il est
net : **le jeu sonne quand on le touche, et se tait quand il vous fait quelque
chose.**

Trois mécaniques centrales montent en tension pendant qu'on joue — la jauge
d'alerte du casse, le risque de la Récup', le minuteur de la manche — et les
trois sont **entièrement muettes**. Vérifié dans le code : zéro appel de son.
C'est ce vide-là qu'on entend, plus que l'absence d'un bruitage de plus.

---

## Réglages de sortie

Identiques au premier lot : **mono, 48 kHz, MP3 40 kbit/s**, normalisé sur la
partie sonnante, crête à −1,5 dB, moins de 10 ms de silence en tête.

Suffixe de style à coller à la fin de **chaque** description :

> Close-miked handmade foley, dry room, no reverb, no music, no digital
> processing, cardboard and paper materials, lo-fi domestic recording.

---

# ⓪ LA MUSIQUE DE MORT (1)

L'écran de fin n'a jamais eu de musique. Ce n'était pas un choix : la
résonance du carton qui s'affaisse tenait la place, et rien ne venait après.

Elle entre **en fondu de quatre secondes**, derrière cette résonance : surgir
couperait le seul silence que le jeu s'accorde. Elle boucle, elle reste basse —
on lit le bilan par-dessus.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `musique-mort.mp3` | 45–60 s, **bouclable** | `Slow melancholic solo accordion, single sustained melody, no percussion, no bass, French street music feel, sparse and unresolved, recorded in a small dry room, lo-fi, seamless loop` | La mort. **Un accordéon seul, jamais un orchestre** : le jeu se moque des grands sentiments. La mélodie ne doit pas se résoudre — on ne referme pas une vie ratée sur un bel accord |

Deux consignes qui comptent plus que le reste :

- **Elle doit boucler sans couture.** On reste sur cet écran le temps de lire,
  parfois deux minutes. Un raccord audible ruinerait le moment.
- **Pas de montée, pas de fin.** Ce n'est pas une musique de générique : c'est
  un fond. Si elle attire l'attention, elle a raté.

Le format diffère du reste du lot : **stéréo, 96 kbit/s**. C'est le seul
fichier musical, il a le droit d'être large — les bruitages, eux, restent mono.

---

# ① LA TENSION (5) — le manque le plus lourd

Ces cinq-là ne ponctuent pas : ils **durent**. C'est ce qui change le plus la
sensation de jeu, parce qu'aujourd'hui on regarde une jauge monter sans rien
entendre.

La règle de la famille : **le matériau se resserre quand le danger monte.** Du
carton qui plie, puis qui craque, puis qui déchire. Jamais un synthé, jamais une
sirène.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `tension-alerte-1.mp3` | 0,5 s | `A sheet of corrugated cardboard bent slowly until the flutes creak once, single soft creak, close-miked handmade foley, dry room` | Premier palier d'alerte. **À peine audible** — on doit le sentir plus que l'entendre |
| `tension-alerte-2.mp3` | 0,7 s | `Thick cardboard bent further, fibres popping in a short irregular sequence, close-miked handmade foley, dry room` | Deuxième palier. Le même geste, plus serré |
| `tension-alerte-3.mp3` | 1,1 s | `Cardboard tearing along a fold, then a metal shutter dropping shut once in the distance, close-miked handmade foley, dry room` | Bouclage. **Le rideau au loin dit que c'est fini** |
| `tension-risque.mp3` | 0,8 s | `A leaning stack of cardboard boxes shifting and settling, one box sliding a few centimetres, no collapse, close-miked handmade foley` | Le tas de la Récup' qui prévient. Se rejoue à chaque cran — **il ne doit jamais faire sursauter** |
| `tension-compte.mp3` | 0,25 s | `A wind-up kitchen timer ticking one single tick, dry mechanical click, close-miked, no reverb` | Un tic par seconde sur les dernières. **Un seul tic dans le fichier**, le jeu le répète |

---

# ② LE CORPS (4)

Le jeu parle de survie, et le corps n'a aucune voix. Les six jauges partagent
aujourd'hui **un seul son de franchissement** : on sait qu'une jauge est passée
au rouge, jamais laquelle.

La règle : **ce sont des sons humains, les seuls du jeu.** Pas de carton ici.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `corps-faim.mp3` | 0,9 s | `A human stomach growling, low and wet, recorded very close to the belly, single growl, no music` | La faim sous 25. **Gênant, pas comique** |
| `corps-soif.mp3` | 0,6 s | `A dry throat swallowing with effort, single swallow, recorded very close, no music` | La soif sous 25 |
| `corps-froid.mp3` | 0,8 s | `Teeth chattering briefly and an unsteady breath in through the nose, close-miked, no music` | Le froid sous 25. **C'est lui qui tue le plus souvent** |
| `corps-epuise.mp3` | 1,2 s | `A long tired yawn that trails off into a sigh, close-miked, no music` | Le sommeil sous 25 |

---

# ③ LE COMBAT (3)

On entend frapper et encaisser. Tout ce qui se joue **entre** les coups est
muet : esquiver parfaitement n'affiche qu'un message.

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `combat-esquive-parfaite.mp3` | 0,4 s | `A coat sleeve whipping through the air fast, passing close by, hitting nothing, close-miked handmade foley, dry room` | Zéro coup encaissé. **Le silence de l'impact EST la récompense** |
| `combat-esquive.mp3` | 0,35 s | `A fist brushing past a fabric coat, light friction, no impact, close-miked handmade foley` | Un coup qui frôle |
| `combat-charge.mp3` | 0,7 s | `Two heavy scuffing steps forward on grit and a sharp breath in, close-miked handmade foley, dry room` | L'ennemi prend son élan. **Se joue AVANT le coup**, pour qu'on puisse réagir |

---

# ④ LES OBJETS (3)

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `objet-equipe.mp3` | 0,6 s | `A coat pulled on and a belt buckle tightened one notch, fabric and metal, close-miked handmade foley, dry room` | S'équiper |
| `objet-casse.mp3` | 0,7 s | `Dry cardboard snapping in two along a crease, one clean break, close-miked handmade foley, no reverb` | Un objet perdu pour de bon. **Sec — c'est fini, pas triste** |
| `objet-plein.mp3` | 0,5 s | `A stuffed canvas bag pressed down, seams straining, zip refusing to close, close-miked handmade foley` | Le sac est plein, on refuse l'objet |

---

# ⑤ L'INTERFACE (3)

| Fichier | Durée | Prompt à coller | Intention |
|---|---|---|---|
| `ui-toast-bon.mp3` | 0,2 s | `A fingernail tapped twice on thin cardboard, two light taps close together, close-miked, dry` | Bonne nouvelle. **Deux fois plus discret que le clic d'action** |
| `ui-toast-mauvais.mp3` | 0,25 s | `A single dull tap on damp cardboard, soft and short, close-miked, dry room` | Mauvaise nouvelle. Même geste, matière molle |
| `ui-verrou.mp3` | 0,2 s | `A small metal latch pushed and refusing to open, single dry resistance click, close-miked, no reverb` | Action indisponible |

---

## Variantes

Trois de ces sons se répètent beaucoup dans une même session. **Trois prises
chacun**, nommées `-1`, `-2`, `-3` :

`tension-compte` · `combat-esquive` · `ui-toast-bon`

**Total livrable : 1 musique + 18 sons + 6 fichiers de variante = 25 fichiers.**

---

## Ce que ça demandera côté code

Douze de ces sons se branchent comme les précédents. **Six demandent un vrai
travail**, et il vaut mieux le savoir avant de les générer :

- **Les trois paliers d'alerte** : la jauge du casse est à cliquets, elle ne
  redescend jamais sous le palier atteint. Le son doit suivre le cliquet, pas
  la valeur — sinon il se rejoue à chaque frôlement.
- **Le risque de la Récup'** monte en continu. Il faudra le découper en crans,
  comme l'alerte, sinon c'est un grincement permanent.
- **Le tic du minuteur** doit être cadencé par le jeu, pas par le fichier.
- **Les quatre sons du corps** remplacent l'alerte commune de jauge : chaque
  jauge garde sa mémoire de franchissement, comme aujourd'hui, mais joue le
  sien.

## Contrôle avant livraison

Le même que le premier lot, plus une chose propre à celui-ci : **écouter les
cinq sons de tension à la suite, dans l'ordre.** Ils forment une montée. Si le
troisième palier ne fait pas plus peur que le premier, le lot a raté sa cible.
