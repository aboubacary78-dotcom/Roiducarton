# Pack son 6 — Les quartiers et les mini-jeux

**60 sons. 30 pour le hub, 30 pour les mini-jeux.**
Foley intégral, matières précaires : carton kraft, scotch, tôle rouillée, eau.

---

# ÉTAPE 1 — Le diagnostic

## Ce que la bande-son fait déjà, en chiffres

| | |
|---|---:|
| Fichiers livrés | **405** |
| … dont des sons qui **durent** (boucles et lits) | **17** |
| Bruitages de rencontre | 296 |
| Cris d'ennemis | 27 |
| Gestes du joueur | 29 |

**388 fichiers sur 405 sont de la ponctuation.** Ils marquent un instant déjà
passé. Les dix-sept autres sont des lits plats : ils tiennent une atmosphère,
ils ne montent jamais.

C'est le trou, et il est structurel : **le jeu sonne quand on le touche, et se
tait quand il nous fait quelque chose.** Un roguelite de survie se joue
pourtant dans l'autre sens — ce qui fait peur, c'est ce qui arrive sans qu'on
l'ait demandé.

## Le trou dans le trou : dix-huit sons déjà spécifiés, jamais livrés

Le lot 2 avait identifié exactement ce manque et écrit dix-neuf briefs. **Un
seul est arrivé** (`musique-mort.mp3`). Les dix-huit autres n'ont jamais été
fabriqués, dont la totalité du paquet de tension : les paliers d'alerte du
casse, le compte à rebours de la manche, la montée de risque de la Récup', et
les quatre signaux du corps.

Ce pack-ci ne les remplace pas. **Il vient après eux**, et l'ordre compte :
soixante sons d'ambiance posés sur un jeu dont les mécaniques centrales sont
muettes, c'est de la décoration sur une maison sans porte.

## Comment le son va diriger l'attention

Sur un téléphone tenu à une main, **l'œil du joueur est sur le bouton d'action,
jamais sur les jauges.** Il n'y a pas de place pour un regard périphérique :
l'écran fait dix centimètres et le pouce en masque le tiers. Le son est donc le
seul canal capable de désigner une jauge sans ouvrir une fenêtre par-dessus le
jeu — et une fenêtre, ici, c'est une interruption de plus dans un jeu qui en
compte déjà beaucoup.

D'où la règle de ce pack : **un son qui dure désigne, un son bref confirme.**
La faim ne fait pas « ding » quand elle passe sous le seuil ; elle installe un
gargouillis lent qui revient toutes les vingt secondes et que rien ne fait
taire sauf manger. Le joueur n'a pas besoin de comprendre : il devient
inconfortable, il cherche, il trouve la jauge. L'attention se dirige toute
seule.

## Comment le son va désamorcer la frustration de la mort

Mourir dans un roguelite est acceptable **à une condition : avoir été
prévenu.** La colère ne vient pas de la mort, elle vient de la surprise — de
l'impression que le jeu a triché pendant qu'on regardait ailleurs.

Aujourd'hui, le jeu passe de « ça va » à l'écran de fin sans que le corps ait
dit un mot. La mort est donc lue comme arbitraire, alors qu'elle était
parfaitement lisible dans les chiffres.

La réponse est **le corps qui parle avant**, et de plus en plus fort :
respiration courte, gargouillis, claquement de dents, jambes qui lâchent. Trois
minutes de signaux avant la fin, et le joueur qui meurt ne dit plus « c'est
injuste », il dit **« j'aurais dû dormir »**. C'est la même mort, et ce n'est
pas la même partie.

Et la comédie noire tient à un seul principe technique : **l'échec doit
dégonfler, jamais punir.** Un carton qui s'affaisse, un couinement de scotch,
un objet qui roule bêtement hors champ. Aucun buzzer, aucun accord mineur
appuyé — le jeu se moque de la situation, jamais du joueur. C'est la différence
entre rire de sa misère et se sentir sanctionné par une machine.

---

## Réglages de sortie

Identiques aux lots précédents : **mono, 48 kHz, MP3 40 kbit/s**, normalisé sur
la partie sonnante, crête à −1,5 dB, moins de 10 ms de silence en tête.
**Exception : les boucles** (`amb-sig-*`) sortent en **stéréo 96 kbit/s**, 30 à
45 s, raccord sans couture.

Suffixe de style à coller à la fin de **chaque** description :

> Close-miked handmade foley, dry room, no reverb, no music, no digital
> processing, cardboard and paper materials, lo-fi domestic recording.

---

# ÉTAPE 2 — Le hub des cinq quartiers (30)

Chaque quartier reçoit **une couche de signature, deux respirations, trois
retours d'action**.

> **La couche de signature ne remplace pas `amb-<lieu>.mp3`, elle se pose
> dessus.** Les cinq lits existants tiennent le fond correctement ; ce qui leur
> manque, c'est un caractère reconnaissable en deux secondes. Une couche
> séparée, plus creuse et plus rare, se mixe au-dessus sans qu'on jette
> quatorze méga-octets déjà en place — et se coupe indépendamment si elle fatigue.

## 🌳 Le Parc — papier, souffle, plumes

Le seul quartier où l'on peut respirer. Tout y est **sec et léger** : ce sont
les matières les plus fines de la boîte à outils.

| Fichier | Recette Foley | Intention |
|---|---|---|
| `amb-sig-parc.mp3` | Souffle continu et lointain contre une feuille de papier calque tendue sur un cadre. Par-dessus, froissement très lent de papier de soie, irrégulier. Toutes les 8–10 s, deux doigts qui tapotent le creux d'une boîte à œufs en carton | Le vent dans des arbres en carton, et les pigeons. Le tapotement est la signature : on le reconnaît avant de lire le nom du quartier |
| `vie-parc-envol.mp3` | Un annuaire feuilleté très vite au pouce, deux salves sèches séparées d'un demi-souffle | Un pigeon décolle. Court, franc, jamais menaçant |
| `vie-parc-banc.mp3` | Torsion lente d'un gros ressort de cahier à spirale, relâchée en deux temps | Le banc qui grince sous un poids. C'est un bruit de vieillesse, pas de danger |
| `act-dormir-parc.mp3` | Un blouson roulé qu'on tasse contre du carton, puis un long souffle nasal qui se relâche | Dormir sur le banc. Le seul son du jeu où quelqu'un se détend vraiment |
| `act-mendier-parc.mp3` | Deux pièces jaunes remuées **lentement** au fond d'un gobelet en plastique, sans les faire sonner fort | La manche au parc : des promeneurs, pas des pressés. Le geste est patient |
| `act-fouiller-parc.mp3` | Main qui plonge dans un sac plastique fin à moitié rempli de papier froissé, trois brassages, un objet léger heurté | La corbeille du parc. Rien de lourd n'y traîne jamais |

## 🏙️ Le Centre-Ville — frottement, foule, verre

Du monde, des vitrines, une patrouille. La matière dominante est le **carton
ondulé frotté** : c'est la voiture, la ville, le mouvement continu.

| Fichier | Recette Foley | Intention |
|---|---|---|
| `amb-sig-centre-ville.mp3` | Deux paumes qui glissent en alternance sur du carton ondulé, à contretemps, sans jamais s'arrêter. Toutes les 6 s, trois personnes qui froissent du papier journal ensemble puis se taisent | Le trafic et la foule. Le contretemps empêche l'oreille de s'installer : la ville fatigue |
| `vie-cv-klaxon.mp3` | Souffle bref et pincé dans le goulot d'une bouteille en verre vide, coupé net | Un klaxon. Ridicule et agressif, exactement le bon dosage |
| `vie-cv-vitrine.mp3` | Ongle qui tapote deux fois un verre à eau, très près du micro | Quelqu'un derrière une vitrine. C'est le son du regard qu'on sent sur soi |
| `act-mendier-cv.mp3` | Gobelet plastique secoué **vite**, pièces qui claquent, puis des pas qui passent sans ralentir | La manche en ville : on insiste parce que personne ne s'arrête. Le pas qui continue est la moitié du son |
| `act-voler-cv.mp3` | Tissu tiré d'un coup sec sur un plan de carton, suivi d'un frottement de semelle qui pivote | On prend et on tourne les talons. Deux gestes, aucune hésitation entre les deux |
| `act-fouiller-cv.mp3` | Couvercle de corbeille métallique soulevé de 5 cm et reposé, puis brassage rapide et nerveux de papiers | On fouille en ville en surveillant autour. Le rythme est pressé, pas curieux |

## 🚂 La Gare — résonance, métal, annonce

Un toit, du chauffage jusqu'à minuit, des vigiles. C'est le seul lieu qui
**résonne** : la grande plaque de carton agitée à distance du micro donne le
volume de la halle.

| Fichier | Recette Foley | Intention |
|---|---|---|
| `amb-sig-gare.mp3` | Grande plaque de carton (60 × 80 cm) agitée très lentement à un mètre du micro, en continu. Toutes les 12 s, une brosse à récurer passée sur du carton ondulé en accélérant puis ralentissant | La halle et les trains. L'accélération de la brosse est le train : personne ne s'y trompe |
| `vie-gare-annonce.mp3` | Deux notes soufflées dans un tube en carton d'essuie-tout, la seconde plus basse, puis une voix marmonnée dans le poing fermé | Le carillon d'annonce et la voix inintelligible. Ne jamais rendre les mots compréhensibles |
| `vie-gare-valise.mp3` | Petites roulettes de chaise de bureau roulées sur une plaque de carton, six secondes, qui s'éloignent | Une valise qui passe. Le son des gens qui partent quelque part |
| `act-dormir-gare.mp3` | Corps qui se cale contre du carton, puis souffle retenu, puis un bruit de pas au loin qui fait se figer la respiration | Dormir à la gare, c'est dormir à moitié. Le pas au loin est obligatoire |
| `act-voler-gare.mp3` | Fermeture éclair ouverte **lentement**, dent par dent, sur 3 secondes, arrêtée deux fois | Ouvrir un sac qui n'est pas le sien. Les deux arrêts sont le cœur du son |
| `act-mendier-gare.mp3` | Gobelet posé sur du carrelage (une assiette retournée), puis silence de 2 s, puis une seule pièce qui tombe | La manche assise. Le silence entre les deux est ce qui fait mal |

## 🛒 Le Marché — bois, plastique, kraft

De la nourriture partout, des cagettes pleines à la fermeture. Matières :
**cagette en bois, sac plastique, papier kraft**.

| Fichier | Recette Foley | Intention |
|---|---|---|
| `amb-sig-marche.mp3` | Cinq personnes qui froissent des sacs plastique fins en continu, à distances variées. Toutes les 7 s, une main frappe deux fois le bord d'une cagette en bois | Le brouhaha et les marchands. La cagette frappée est le geste de vendeur : ça claque, ça appelle |
| `vie-marche-cagette.mp3` | Une cagette en bois vide posée sur une autre, puis glissée de 20 cm | On range, on empile. Le marché vit de ce bruit-là |
| `vie-marche-kraft.mp3` | Grande feuille de papier kraft arrachée d'un rouleau d'un geste, puis froissée en boule en 2 s | On emballe. C'est le son de ce qu'on ne peut pas s'offrir |
| `act-voler-marche.mp3` | Un fruit (pomme) soulevé d'une pile — léger roulement des voisins — puis glissé dans un tissu | Le larcin le plus simple du jeu. Le roulement des autres fruits est ce qui trahit |
| `act-fouiller-marche.mp3` | Cagettes retournées l'une après l'autre sur du gravier, trois fois, avec un temps d'arrêt à la deuxième | La fin de marché. L'arrêt à la deuxième cagette est celui où l'on trouve |
| `act-marchander-marche.mp3` | Raclement de gorge, puis pièces comptées une à une dans une paume, quatre pièces | On négocie. Le raclement de gorge avant les pièces raconte tout du rapport de force |

## 🏭 La Zone Industrielle — tôle, rouille, vapeur

De la rouille, des rats, ce que les entreprises jettent. C'est le quartier le
plus dangereux, et le seul où la matière est **lourde**.

| Fichier | Recette Foley | Intention |
|---|---|---|
| `amb-sig-zone-industrielle.mp3` | Bourdon obtenu en soufflant en continu dans le goulot d'une grande bouteille en plastique, doublé une octave plus bas. Toutes les 9 s, un clang : une boîte de conserve vide frappée du bout d'une clé, laissée résonner | Les machines et le métal. Le clang irrégulier est ce qui empêche de s'endormir ici |
| `vie-zi-tole.mp3` | Feuille de tôle fine (ou plaque à pâtisserie) fléchie lentement puis relâchée d'un coup | La tôle qui travaille. Un son laid, et c'est voulu |
| `vie-zi-rat.mp3` | Ongles qui grattent le fond d'une boîte en carton, quatre coups rapides, puis fuite | Un rat. Court, jamais appuyé : c'est un frisson, pas un jump scare |
| `act-recup-zi.mp3` | Ferraille remuée dans une caisse — clés, boulons, couvercle de conserve — puis un objet lourd soulevé à deux mains | La Récup' dans son quartier de prédilection. Le poids se sent |
| `act-fouiller-zi.mp3` | Palette en bois soulevée, écartée, et un raclement de gravier dessous | On cherche sous les choses. Le gravier dit qu'on est dehors, sur du sol qui n'est à personne |
| `act-dormir-zi.mp3` | Carton déplié à même le sol, corps qui s'allonge, puis le bourdon de fond qui **ne s'arrête pas** | Dormir ici, c'est dormir dans le bruit. Le refus du silence est le sens du son |

---

# ÉTAPE 3 — Les cinq mini-jeux (30)

> **Correction de brief, et elle compte.** La commande listait « La Fouille »
> comme cinquième mini-jeu. **Elle n'existe pas** : la fouille est un *geste*
> (`geste-fouille-1..3.mp3`), joué à l'intérieur de La Récup'. Le cinquième
> mini-jeu réellement présent dans le jeu — écran dédié, lit sonore déjà livré
> (`mg-manche.mp3`), boucle de jeu complète — est **La Manche**. C'est donc
> elle qui est traitée ici. Écrire six sons pour un écran qui n'existe pas
> aurait coûté six sons.

Chaque mini-jeu reçoit les six rôles demandés. Le nommage suit le lit existant :
`mg-<jeu>-<rôle>`.

## ♻️ La Récup' — fouiller une benne

| Rôle | Fichier | Recette Foley |
|---|---|---|
| **Amorce** | `mg-recup-amorce.mp3` | Couvercle de benne (grand carton rigide) soulevé sur 4 s, grincement de charnière obtenu en tordant un ressort de cahier, et le souffle d'air qui sort |
| **Manipulation** | `mg-recup-manip.mp3` | Brassage lent et continu d'un sac de déchets : papier froissé, plastique, une boîte de conserve qui roule dedans. **Bouclable sur 4 s** |
| **Validation** | `mg-recup-trouve.mp3` | Un objet dur dégagé d'un tas mou : on tire, ça résiste une demi-seconde, ça vient, et ça heurte le bord métallique |
| **Avertissement** | `mg-recup-mou.mp3` | La main s'enfonce dans quelque chose de mou et humide : éponge gorgée d'eau pressée lentement, près du micro |
| **Échec** | `mg-recup-bascule.mp3` | La benne bascule : cascade de ferraille et de carton pendant 2 s, puis **un seul objet qui roule tout seul** deux secondes de plus |
| **Clôture** | `mg-recup-fin.mp3` | Le couvercle qui retombe d'un coup, et le silence juste après |

*Le mou est le meilleur avertissement du jeu : il ne menace de rien, il dégoûte.
Et la comédie de l'échec est entière dans l'objet qui roule tout seul après la
cascade — le temps de trop.*

## 🕵️ Le Vol — le casse

| Rôle | Fichier | Recette Foley |
|---|---|---|
| **Amorce** | `mg-vol-amorce.mp3` | Gros scotch de déménagement décollé **très lentement** sur 3 s, arrêté net. Par-dessus, une inspiration retenue |
| **Manipulation** | `mg-vol-pas.mp3` | Pas feutrés sur du carton : deux doigts qui pressent et relâchent une boîte à chaussures. **Bouclable**, quatre pas |
| **Validation** | `mg-vol-poche.mp3` | Fermeture éclair fermée d'un geste court et sec, suivie d'un tapotement sur le tissu |
| **Avertissement** | `mg-vol-alerte.mp3` | Un ongle raclé une fois sur une dent de peigne, très haut, très bref. **Doit pouvoir se répéter de plus en plus vite sans fatiguer** |
| **Échec** | `mg-vol-repere.mp3` | Souffle strident dans un sifflet bouché de papier — un sifflet qui ne marche pas bien — puis une chute de cartons |
| **Clôture** | `mg-vol-sortie.mp3` | Une porte de carton refermée, et deux pas qui s'éloignent vite |

*L'avertissement est le son le plus important des trente : c'est lui qui porte
la jauge d'alerte, aujourd'hui muette. Il doit être **pauvre en fréquences** —
un seul pic aigu — pour pouvoir être répété vingt fois en dix secondes sans
devenir insupportable.*

## 🥊 La Bagarre

| Rôle | Fichier | Recette Foley |
|---|---|---|
| **Amorce** | `mg-bagarre-amorce.mp3` | Craquement d'articulations : une poignée de pâtes sèches serrée dans le poing, une seule fois, puis un souffle par le nez |
| **Manipulation** | `mg-bagarre-esquive.mp3` | Souffle court et net devant le micro, doublé d'un tissu qui fend l'air (torchon fouetté) |
| **Validation** | `mg-bagarre-touche.mp3` | Poing dans une boîte en carton à moitié pleine de chiffons : sourd, avec un léger claquement de paroi |
| **Avertissement** | `mg-bagarre-charge.mp3` | Trois pas lourds qui accélèrent sur du carton, et une inspiration bruyante juste avant le silence |
| **Échec** | `mg-bagarre-chute.mp3` | Corps qui tombe sur des cartons vides, effondrement en cascade, puis **un couvercle qui tourne sur lui-même** et s'arrête |
| **Clôture** | `mg-bagarre-souffle.mp3` | Deux respirations lourdes qui se calment, et rien d'autre |

*Le couvercle qui tourne sur lui-même après la chute, c'est toute la comédie
noire du jeu en une seconde et demie : la dignité met plus longtemps à tomber
que le corps.*

## 🤝 Le Marchandage

| Rôle | Fichier | Recette Foley |
|---|---|---|
| **Amorce** | `mg-marchandage-amorce.mp3` | Raclement de gorge, puis une pièce posée sur un comptoir en bois, franchement |
| **Manipulation** | `mg-marchandage-compte.mp3` | Pièces comptées une à une dans une paume, six pièces, rythme régulier. **Bouclable** |
| **Validation** | `mg-marchandage-accord.mp3` | Deux mains qui se tapent une fois, puis un tissu qu'on tend |
| **Avertissement** | `mg-marchandage-agace.mp3` | Un soupir par le nez, et des doigts qui tambourinent trois fois sur du bois |
| **Échec** | `mg-marchandage-refus.mp3` | Rideau métallique tiré d'un coup — règle en métal glissée le long d'une grille — et une pièce qui tombe au sol et roule |
| **Clôture** | `mg-marchandage-sac.mp3` | Sac en papier kraft ouvert d'un geste et posé sur le comptoir |

*L'avertissement ne dit pas « attention », il dit **« tu m'ennuies »**. C'est
la seule mécanique du jeu où le danger est social et pas physique : le son doit
être poli et glaçant.*

## 🎻 La Manche

| Rôle | Fichier | Recette Foley |
|---|---|---|
| **Amorce** | `mg-manche-amorce.mp3` | Gobelet en plastique posé sur le sol, puis un tissu qu'on étale, puis on s'assoit |
| **Manipulation** | `mg-manche-gobelet.mp3` | Trois pièces jaunes secouées dans un gobelet en plastique, deux salves. **Bouclable**, ne doit jamais sonner joyeux |
| **Validation** | `mg-manche-piece.mp3` | Une pièce lâchée de 30 cm dans le gobelet — le rebond compte autant que l'impact |
| **Avertissement** | `mg-manche-uniforme.mp3` | Pas réguliers et lents en semelle dure, qui **ne changent pas de rythme** en approchant |
| **Échec** | `mg-manche-renverse.mp3` | Gobelet renversé d'un coup de pied, pièces éparpillées sur le sol pendant 3 s, et une qui roule loin |
| **Clôture** | `mg-manche-ramasse.mp3` | Pièces ramassées une à une, quatre, et le gobelet remis debout |

*Le pas de l'uniforme qui ne ralentit pas est plus inquiétant qu'un pas qui
accélère : il dit que la personne sait déjà ce qu'elle vient faire.*

---

# Ce qu'il faut fabriquer en premier

Six sons sur les soixante changent la sensation de jeu à eux seuls. Les autres
enrichissent, ceux-ci **réparent** :

| Ordre | Fichier | Ce qu'il débloque |
|---:|---|---|
| 1 | `mg-vol-alerte.mp3` | La jauge d'alerte du casse, muette depuis toujours |
| 2 | `mg-manche-uniforme.mp3` | Le minuteur de la manche |
| 3 | `mg-recup-mou.mp3` | La montée de risque de la Récup' |
| 4 | `mg-bagarre-charge.mp3` | L'attaque adverse qu'on ne voit pas venir |
| 5 | `mg-recup-bascule.mp3` | Le premier échec comique du jeu |
| 6 | `mg-bagarre-chute.mp3` | Le second |

Et **avant même ceux-là** : les quatre signaux du corps du lot 2
(`corps-faim`, `corps-soif`, `corps-froid`, `corps-epuise`), toujours pas
fabriqués. Sans eux, la mort reste une surprise, et une mort surprise est une
mort qu'on reproche au jeu.
