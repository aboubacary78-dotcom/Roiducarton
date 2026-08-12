# Pack son 3.5 — Mendier et les suites (47 bruitages)

*Ce document est le socle. Chaque pack le répète en tête, pour être remis seul
à qui fabrique les sons.*

## L'idée directrice : le son doit être en carton, lui aussi

Tout le jeu est un **diorama miniature en carton kraft** photographié : les
voitures sont en carton, les pigeons sont en carton, la ville entière tient sur
une table d'atelier. **La bande-son doit obéir à la même règle.**

Ce n'est donc **pas** une banque de sons de ville. On ne veut pas
l'enregistrement d'un vrai boulevard, ni une vraie pluie, ni un vrai train.
On veut le **bruitage de cinéma** qu'un bricoleur ferait avec ce qu'il a sur
son établi, micro à vingt centimètres :

| Ce qu'on entend | Comment on le fabrique |
|---|---|
| une voiture qui passe | une main qui glisse sur du carton ondulé |
| la pluie | du riz qu'on verse sur du papier tendu |
| le tonnerre | une grande plaque de carton qu'on secoue |
| un train | une brosse sur du carton ondulé, en accélérant |
| une foule | plusieurs personnes qui froissent du papier journal |
| des pas | des doigts sur une boîte à chaussures |
| le vent | un souffle contre une feuille de papier calque |

C'est cette matière-là qui donne son unité au jeu. Un son trop propre, trop
« vrai », trop cinématographique sonnera faux — même s'il est techniquement
parfait. **Petit, proche, sec, fait main.**

## Le ton : comédie douce-amère

Le jeu est une comédie noire. On rit de la misère avec tendresse. Les sons
peuvent être drôles (un klaxon qui couine, un pigeon très concerné), jamais
sinistres ni grandiloquents. Pas de nappes de synthé dramatiques, pas de
percussion de bande-annonce.

## Trois interdits absolus

1. **Aucune parole intelligible.** Le jeu existe en français et en anglais ;
   un mot compréhensible casserait la traduction. Un brouhaha de foule doit
   rester un brouhaha — des voyelles, du murmure, jamais de phrase.
2. **Aucune mélodie reconnaissable** ni citation d'une musique existante.
3. **Aucune stridence.** Le jeu se joue au casque dans le métro. Rien
   au-dessus de 8 kHz qui pique, pas de sifflement continu.

## Ce qui existe déjà et qu'on ne touche pas

Le thème de l'écran-titre est déjà en place et il plaît. **Ne pas le
remplacer.** Tout le reste du jeu est actuellement synthétisé à la volée par
le navigateur : c'est fonctionnel mais sans matière. C'est ça qu'on remplace.

## Contraintes techniques (les mêmes pour les trois packs)

- **Format : WAV, 48 kHz, 16 bits.** Si ce n'est pas possible, MP3 320 kbps —
  la conversion finale sera faite à l'intégration.
- **Boucles : stéréo. Bruitages courts : mono.**
- **Les boucles doivent boucler.** La dernière milliseconde doit s'enchaîner
  sur la première sans clic ni trou. C'est le point le plus important du pack 1,
  et le plus souvent raté : vérifie en bouclant trois fois d'affilée.
- **Niveaux :** boucles d'ambiance à **−23 LUFS** (elles passent SOUS le reste),
  bruitages à **−16 LUFS**, crête à **−6 dBFS** maximum. Aucun son ne doit
  saturer.
- **Pas de silence en tête** des bruitages courts : ils se déclenchent sur une
  action, tout retard s'entend.
- **Noms de fichiers exacts**, copiés depuis les listes. Une faute = fichier
  inutilisable.
- **Livraison : un ZIP par pack**, contenant un dossier `sons/`.

---

# 🎯 Ce pack : un bruitage par rencontre

Le jeu compte **296 rencontres**, et chacune a maintenant droit à SON bruitage.
Jusqu'ici elles se partageaient 58 sons rangés par thème — ce qui donnait 30
rencontres différentes sur le même bruit de voiture, et quelques absurdités
(une laverie qui déclenchait le tonnerre, parce que le mot « éclairé » ressemble
à « éclair »).

Le bruitage se déclenche **à l'ouverture de la carte de rencontre**, une fois,
puis se tait.

## La règle qui décide de tout

**Le son doit sortir de CETTE scène-là, pas de sa catégorie.** Chaque entrée
ci-dessous vous donne le titre et le texte exact que le joueur lit à l'écran.
Lisez-le, et cherchez **le bruit que fait précisément ce moment** — pas le bruit
que fait la catégorie à laquelle il appartient.

Un « registre » est indiqué entre crochets : c'est une simple indication de
famille sonore, un point de départ. **Si la scène dit autre chose, la scène a
raison.**

### Six exemples, pour fixer le niveau attendu

| La scène | ❌ le son de la catégorie | ✔ le son de la scène |
|---|---|---|
| *Un ado rate un trick, son skate roule vers vous* | un vélo qui passe | la planche qui claque au sol, puis les roulettes qui roulent seules vers l'auditeur et s'arrêtent |
| *Un couple en fourrure passe, ils sentent le parfum cher* | du tissu | le froissement lourd de la fourrure et deux talons qui s'éloignent sans ralentir |
| *La boulangerie ferme dans 10 minutes, l'odeur vous torture* | de la nourriture | le rideau métallique qui commence à descendre, et un sac en papier qu'on plie |
| *Un gamin de 6 ans pleure sur un banc* | des enfants qui jouent | un seul reniflement, tout petit, et un banc en bois qui grince |
| *Un vieil homme cultive des légumes en cachette. Il vous repère* | un jardin | une bêche qui s'arrête net en pleine terre. Le silence qui suit est le son. |
| *Le lavomatic est ouvert toute la nuit. Chaud, éclairé* | le tonnerre | un tambour de machine qui tourne, et le bourdonnement d'un néon |

Le troisième colonne est ce qu'on attend. À chaque fois : **un geste concret,
une matière, et si possible un silence bien placé.**

## ⚠️ Le contrôle qui compte : ils doivent différer ENTRE EUX

Le premier lot livré était bon sur ce point ; le deuxième nettement moins —
mesuré, pas ressenti : ses sons se ressemblaient sensiblement plus entre eux,
alors qu'ils couvraient des scènes tout aussi variées. C'est le piège d'une
commande en nombre, et c'est ce qui ruinerait l'intérêt d'avoir un son par
rencontre plutôt qu'un son par catégorie.

**Le test, à faire avant de livrer : jouez tout le lot à la suite, les yeux
fermés.** Si deux bruitages sont difficiles à distinguer, l'un des deux est à
refaire — même si chacun, pris seul, est réussi.

Trois leviers pour varier, quand deux scènes se ressemblent :

- **changer la matière** : le même geste sur du carton, sur du métal, sur du
  papier journal ne donne pas le même son ;
- **changer le rythme** : un coup sec, deux coups espacés, un frottement
  continu — la silhouette temporelle se reconnaît mieux que le timbre ;
- **changer ce qu'on écoute** : dans une scène il y a souvent trois sons
  possibles. Si la précédente a pris le plus évident, prenez-en un autre.

## Règles communes à tous les fichiers

- **Durée : 0,4 à 1,2 seconde.** Pas plus. C'est une ponctuation, pas une scène.
- **Mono**, aucun silence en tête.
- Niveau **−16 LUFS**, crête −6 dBFS.
- **Discrets** : ils accompagnent l'apparition d'une image, ils ne la couvrent
  pas.
- Toujours **fabriqués à la main, en carton et en papier** (voir la direction
  sonore ci-dessus).
- **Aucune parole intelligible** : le jeu est bilingue.
- Les lots partiels sont bienvenus. Chaque bruitage s'active dès son
  intégration.

---

### `sfx-beg-couple-riche.wav`  · [tissu]
**« Le Couple de Riches »**
> Un couple en manteau de fourrure passe devant vous. Ils sentent le parfum cher.

### `sfx-beg-boulangerie.wav`  · [nourriture]
**« La Boulangerie »**
> La boulangerie ferme dans 10 minutes. L'odeur du pain chaud vous torture.

### `sfx-beg-terrasse-cafe.wav`  · [nourriture]
**« La Terrasse de Café »**
> Un café avec terrasse. Des gens sirotent leur expresso à 4€. Vous avez soif.

### `sfx-beg-ecole-sortie.wav`  · [enfants]
**« La Sortie d'École »**
> C'est l'heure de la sortie. Parents et enfants affluent.

### `sfx-beg-supermarche.wav`  · [commerce, étal]
**« Le Supermarché »**
> Devant le supermarché, les clients entrent et sortent avec leurs courses.

### `sfx-beg-musicien-metro.wav`  · [métro]
**« Le Musicien du Métro »**
> Un musicien joue de l'accordéon dans le métro. Il gagne bien sa vie.

### `sfx-beg-touriste-asiatique.wav`  · [photo]
**« Le Groupe de Touristes »**
> Un groupe de touristes asiatiques prend des photos de tout. Absolument tout.

### `sfx-beg-mariage-sortie.wav`  · [cérémonie]
**« La Sortie de Mariage »**
> Un mariage se termine. Les invités sortent, éméchés et généreux.

### `sfx-beg-jogger-parc.wav`  · [végétal, plein air]
**« Le Jogger du Parc »**
> Un jogger fait sa pause stretching près de vous. Il a l'air sympathique.

### `sfx-beg-restaurant-poubelle.wav`  · [nourriture]
**« Les Poubelles du Restaurant »**
> Le restaurant gastronomique vient de sortir ses poubelles. Ça sent le gourmet.

### `sfx-beg-cinema.wav`  · [cinéma]
**« Le Cinéma »**
> Le cinéma vient de projeter un film. Les spectateurs sortent.

### `sfx-beg-eglise-dimanche.wav`  · [lieu de culte]
**« La Messe du Dimanche »**
> C'est dimanche. Les fidèles sortent de la messe, l'âme charitable.

### `sfx-beg-mairie.wav`  · [papier, pages]
**« La Mairie »**
> La mairie est ouverte. Des gens font la queue pour des papiers.

### `sfx-beg-gare-tgv.wav`  · [vélo, roulettes]
**« La Gare TGV »**
> La gare TGV est bondée. Voyageurs pressés, valises à roulettes, stress ambiant.

### `sfx-beg-distributeur-billets.wav`  · [mécanique, moteur]
**« Le Distributeur de Billets »**
> Un distributeur automatique de billets. Des gens retirent de l'argent.

### `sfx-beg-fleuriste.wav`  · [végétal, plein air]
**« Le Fleuriste »**
> Le fleuriste jette ses fleurs fanées. Elles sont encore belles.

### `sfx-beg-station-metro.wav`  · [métro]
**« La Station de Métro »**
> L'entrée du métro. Flux constant de passagers pressés.

### `sfx-beg-parc-chien.wav`  · [chien]
**« Le Parc à Chiens »**
> Le parc à chiens est animé. Des propriétaires discutent pendant que leurs chiens jouent.

### `sfx-beg-lavage-voiture.wav`  · [circulation, véhicule]
**« La Station de Lavage »**
> Une station de lavage automatique. Des gens attendent que leur voiture soit propre.

### `sfx-beg-taxi-arret.wav`  · [circulation, véhicule]
**« L'Arrêt de Taxi »**
> Une file de taxis attend des clients. Les chauffeurs discutent entre eux.

### `sfx-beg-concert-sortie.wav`  · [musique]
**« La Sortie de Concert »**
> Un concert vient de se terminer. Les spectateurs sortent, euphoriques.

### `sfx-beg-match-foot.wav`  · [sport]
**« La Sortie du Match »**
> Le match de foot est fini. Les supporters envahissent les rues.

### `sfx-beg-sortie-boite.wav`  · [foule]
**« La Sortie de Boîte »**
> Cinq heures du matin. Les fêtards sortent de boîte en titubant, la générosité multipliée par le taux d'alcoolémie. Fenêtre de tir : quarante minutes.

### `sfx-beg-marathon.wav`  · [pluie]
**« Le Marathon »**
> Le marathon traverse le quartier : des milliers de coureurs en souffrance volontaire, et des spectateurs qui distribuent tout ce qui se mange, se boit ou s'encourage.

### `sfx-beg-marche-noel.wav`  · [musique]
**« Le Marché de Noël »**
> Vin chaud, sapins, chorales et culpabilité de fin d'année : le marché de Noël est une mine d'or émotionnelle à ciel ouvert.

### `sfx-beg-feu-rouge.wav`  · [klaxon]
**« Le Grand Carrefour »**
> Le carrefour aux quatre-vingt-dix secondes de feu rouge : une éternité à l'échelle d'un pare-brise, un fonds de commerce à l'échelle d'un homme.

### `sfx-beg-queue-lancement.wav`  · [téléphone]
**« La Queue du Lancement »**
> Devant la boutique de téléphones, trois cents personnes campent depuis l'aube pour un rectangle à 1400€. Certains ont des tentes. Vous avez l'expertise.

### `sfx-beg-zoo.wav`  · [public, spectacle]
**« La Sortie du Zoo »**
> La sortie du zoo : familles épuisées, enfants surexcités, glaces fondues et bonne humeur solvable. Le meilleur public de la ville sort toujours d'entre les girafes.

### `sfx-beg-terrasse-brunch.wav`  · [sommeil]
**« La Terrasse du Brunch »**
> Le dimanche, la terrasse du brunch déborde d'avocado toasts à 17€ et de conversations sur l'immobilier. La culpabilité y est servie à volonté.

### `sfx-beg-videur.wav`  · [foule]
**« Le Videur Compatissant »**
> Le videur de la boîte chic s'ennuie ferme entre deux refus. Deux mètres, cent trente kilos, et un regard qui vous a déjà classé « inoffensif, causant ».

### `sfx-beg-karaoke.wav`  · [musique]
**« La Sortie du Karaoké »**
> Le bar karaoké recrache ses clients à 2h : cordes vocales détruites, egos gonflés à l'hélium, et une générosité proportionnelle au nombre de « I Will Survive » chantés.

### `sfx-beg-cours-yoga.wav`  · [végétal, plein air]
**« Le Yoga du Parc »**
> Trente personnes saluent le soleil sur des tapis à 80€, encadrées par une prof qui parle d'« abondance » et d'« ouverture au monde ». Le monde, c'est vous. Voyons voir l'ouverture.

### `sfx-beg-chef-etoile.wav`  · [porte, grille, serrure]
**« Le Chef Étoilé »**
> Le restaurant gastronomique jette ses assiettes « imparfaites » à 23h. Le chef fume dehors, l'œil sombre, en gueulant en cuisine par la porte entrouverte. Un artiste.

### `sfx-beg-braderie.wav`  · [foule]
**« La Grande Braderie »**
> La braderie annuelle : la ville entière vend son grenier sur le trottoir et boit du blanc à 10h du matin. L'argent liquide circule comme au siècle dernier.

### `sfx-beg-food-trucks.wav`  · [circulation, véhicule]
**« Le Festival de Food Trucks »**
> Douze camions, mille odeurs, des files d'attente vertigineuses et des assiettes à moitié finies qui partent à la poubelle. Un scandale logistique. Une opportunité.

### `sfx-beg-averse.wav`  · [orage]
**« L'Averse Soudaine »**
> Un orage éclate sans prévenir sur la place. Vous êtes le seul être humain du quartier à posséder... un parapluie cassé. La demande explose, l'offre c'est vous.

### `sfx-beg-bingo.wav`  · [caisse, billets]
**« La Sortie du Loto des Anciens »**
> La salle des fêtes libère le loto du jeudi : quatre-vingts retraités, des cabas à roulettes, et une gagnante du jambon qui rayonne comme un phare.

### `sfx-suite-chaton-boulangere.wav`  · [orage]
**« Le Chat de la Boulangère »**
> Dans la vitrine de la boulangerie, entre les éclairs et les chouquettes, trône VOTRE chaton pirate, devenu gros comme une brioche. Il vous reconnaît. Il détourne le regard, en chat.

### `sfx-suite-grille-egoutier.wav`  · [souterrain, résonance]
**« La Grille de l'Égoutier »**
> Vous retrouvez la grille d'aération que l'égoutier vous avait indiquée. Il n'avait pas menti : un souffle tiède, régulier, et des rats effectivement polis qui laissent la place.

### `sfx-suite-prophetie-toit.wav`  · [brouhaha feutré]
**« Le Retour de Madame Esperanza »**
> La caravane mauve est revenue se garer sur le terrain vague. Madame Esperanza vous fait signe avant même que vous approchiez : « je vous attendais. Les cartes ont bougé. »

### `sfx-suite-rival-echecs.wav`  · [végétal, plein air]
**« La Revanche »**
> Le vieux joueur d'échecs vous attend au parc, pendule sortie, thermos plein, regard d'acier : « la revanche. J'ai préparé une ouverture toute la semaine. » Il y a des spectateurs. Il a prévenu des gens.

### `sfx-suite-pote-videur.wav`  · [foule]
**« Le Plan du Videur »**
> Le videur vous intercepte d'un signe de menton : « samedi, mon collègue du vestiaire est aux prud'hommes contre sa belle-sœur, longue histoire. J'ai dit au patron que je connaissais quelqu'un de fiable. C'est toi, le quelqu'un. »

### `sfx-suite-carte-biblio.wav`  · [circulation, véhicule]
**« Le Club de Lecture »**
> La bibliothécaire du bibliobus vous repère de loin et brandit un livre : « je vous l'ai mis de côté ! Et jeudi, c'est le club de lecture. Il y a du café et personne n'ose jamais parler. Vous, vous oseriez. »

### `sfx-suite-ennemi-pere-noel.wav`  · [enfants]
**« La Vendetta du Père Noël »**
> Le Père Noël du marché vous a retrouvé. Il a fait le tour des commerçants en racontant que vous « voliez la magie de Noël ». Trois boutiques vous regardent de travers. Il est là, bras croisés, la hotte pleine de rancune.

### `sfx-suite-bonnet-otage.wav`  · [cold]
**« Le Bonnet Otage »**
> Le vendeur de hot-dogs a puni votre larcin en épinglant votre bonnet EN HAUT DE SON PARASOL, comme un trophée de guerre. Il vous voit arriver et tapote le manche : « on négocie, ou tu hivernes tête nue ? »

### `sfx-suite-contractuelle.wav`  · [police]
**« L'Œil de la Contractuelle »**
> La contractuelle qui a confisqué votre commerce d'horodateur vous a mis « dans son périmètre ». Elle apparaît partout où vous posez le chapeau, carnet en main, comme une ombre assermentée. Les passants n'osent plus donner.

### `sfx-suite-colis-lucie.wav`  · [porte, grille, serrure]
**« Le Mot de Lucie »**
> Sur la porte du hall, un mot manuscrit : « À la personne qui a pris mon colis : j'espère que le plaid vous tient chaud. Sérieusement. Il fait froid. Lucie (3B). PS : les coussins, par contre, j'y tenais. »

---

## Récapitulatif des noms de fichiers

```
sfx-beg-couple-riche.wav
sfx-beg-boulangerie.wav
sfx-beg-terrasse-cafe.wav
sfx-beg-ecole-sortie.wav
sfx-beg-supermarche.wav
sfx-beg-musicien-metro.wav
sfx-beg-touriste-asiatique.wav
sfx-beg-mariage-sortie.wav
sfx-beg-jogger-parc.wav
sfx-beg-restaurant-poubelle.wav
sfx-beg-cinema.wav
sfx-beg-eglise-dimanche.wav
sfx-beg-mairie.wav
sfx-beg-gare-tgv.wav
sfx-beg-distributeur-billets.wav
sfx-beg-fleuriste.wav
sfx-beg-station-metro.wav
sfx-beg-parc-chien.wav
sfx-beg-lavage-voiture.wav
sfx-beg-taxi-arret.wav
sfx-beg-concert-sortie.wav
sfx-beg-match-foot.wav
sfx-beg-sortie-boite.wav
sfx-beg-marathon.wav
sfx-beg-marche-noel.wav
sfx-beg-feu-rouge.wav
sfx-beg-queue-lancement.wav
sfx-beg-zoo.wav
sfx-beg-terrasse-brunch.wav
sfx-beg-videur.wav
sfx-beg-karaoke.wav
sfx-beg-cours-yoga.wav
sfx-beg-chef-etoile.wav
sfx-beg-braderie.wav
sfx-beg-food-trucks.wav
sfx-beg-averse.wav
sfx-beg-bingo.wav
sfx-suite-chaton-boulangere.wav
sfx-suite-grille-egoutier.wav
sfx-suite-prophetie-toit.wav
sfx-suite-rival-echecs.wav
sfx-suite-pote-videur.wav
sfx-suite-carte-biblio.wav
sfx-suite-ennemi-pere-noel.wav
sfx-suite-bonnet-otage.wav
sfx-suite-contractuelle.wav
sfx-suite-colis-lucie.wav
```

**47 fichiers.** Livraison en ZIP, dossier `sons/`.