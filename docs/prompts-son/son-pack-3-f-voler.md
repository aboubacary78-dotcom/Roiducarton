# Pack son 3.6 — Voler, les légendes et le Sursaut (42 bruitages)

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

### `sfx-steal-etal-marche.wav`  · [commerce, étal]
**« L'Étal du Marché »**
> Un primeur a le dos tourné. Ses fruits sont à portée de main. Personne ne regarde... ou presque.

### `sfx-steal-poche-costard.wav`  · [train]
**« La Poche du Costard »**
> Un homme d'affaires dort dans le train, portefeuille qui dépasse. La tentation est énorme.

### `sfx-steal-supermarche.wav`  · [commerce, étal]
**« Le Supermarché »**
> Rayons remplis, vigile à moitié endormi. Une boîte de conserve glisserait si bien sous la veste.

### `sfx-steal-velo.wav`  · [vent]
**« Le Vélo Mal Attaché »**
> Un vélo électrique, antivol bon marché à peine fermé. Il vaut une petite fortune à la revente.

### `sfx-steal-tronc-eglise.wav`  · [lieu de culte]
**« Le Tronc de l'Église »**
> L'église est vide. Le tronc des offrandes déborde de pièces. Dieu regarde, paraît-il.

### `sfx-steal-etendage.wav`  · [tissu]
**« Le Linge qui Sèche »**
> Au rez-de-chaussée, du linge sèche à une fenêtre ouverte. Un manteau chaud vous ferait du bien.

### `sfx-steal-distributeur-secoue.wav`  · [mécanique, moteur]
**« Le Distributeur Récalcitrant »**
> Le distributeur de la gare a gardé le Twix ET la pièce d'un voyageur furieux, parti en jurant. La machine vous nargue, repue.

### `sfx-steal-chantier-cuivre.wav`  · [chantier]
**« Le Cuivre du Chantier »**
> Le chantier est désert, le grillage bâille, et des chutes de câble cuivre brillent dans une benne. Le ferrailleur paie comptant, sans biographie.

### `sfx-steal-terrasse-pourboires.wav`  · [monnaie]
**« Les Pourboires de la Terrasse »**
> Service de midi terminé : les tables de la terrasse sont couvertes de soucoupes à pourboires que le serveur, débordé, n'a pas encore ramassées.

### `sfx-steal-buffet-mariage.wav`  · [cérémonie]
**« Le Buffet du Mariage »**
> La salle des fêtes célèbre un mariage à deux cents invités. Le buffet est dressé, le vin d'honneur coule, et personne ne connaît personne. Situation idéale.

### `sfx-steal-camion-boulangerie.wav`  · [circulation, véhicule]
**« La Tournée du Boulanger »**
> Le camion de livraison de la boulangerie est garé moteur tournant, portes arrière ouvertes sur des étagères de pain chaud. Le livreur discute mi-temps de foot à dix mètres.

### `sfx-steal-casier-vestiaire.wav`  · [eau]
**« Le Casier Mal Fermé »**
> Aux vestiaires de la piscine, un casier bâille, cadenas posé dessus sans être clipsé. Dedans : un jean plié, une montre, un portefeuille. Le propriétaire nage un 800 mètres.

### `sfx-steal-potager-nuit.wav`  · [végétal, plein air]
**« Le Potager sous la Lune »**
> Le potager du pavillon d'angle croule sous les tomates, les courgettes font de la figuration, et la maison dort. Le portillon n'a même pas de loquet.

### `sfx-steal-champagne-vernissage.wav`  · [public, spectacle]
**« Le Champagne du Vernissage »**
> La galerie fête une expo. Derrière le rideau du fond, les caisses de champagne attendent leur tour, et le serveur ne sait pas compter jusqu'à douze.

### `sfx-steal-cageots-aube.wav`  · [papier, pages]
**« Les Cageots de l'Aube »**
> Six heures du matin : les primeurs déchargent, les cageots s'empilent sur le trottoir, et dans la pénombre, personne ne distingue un livreur d'un homme pressé.

### `sfx-steal-petit-dej-hotel.wav`  · [brouhaha feutré]
**« Le Petit-Déjeuner de l'Hôtel »**
> Le buffet petit-déjeuner de l'hôtel Continental : accès par la terrasse, personnel débordé, clients en peignoir qui ne se connaissent pas. Le paradis a un horaire : 7h-10h.

### `sfx-steal-fontaine-voeux.wav`  · [eau]
**« La Fontaine aux Vœux »**
> La fontaine du square scintille de pièces : des années de vœux de touristes par dizaines d'euros. Les vœux des autres, techniquement, sont déjà exaucés ou perdus.

### `sfx-steal-tirelire-comptoir.wav`  · [chat]
**« La Tirelire du Comptoir »**
> Sur le comptoir de la boulangerie, la tirelire « pour les chatons abandonnés » déborde de pièces. La boulangère a le dos tourné. Votre estomac et votre conscience ouvrent les négociations.

### `sfx-steal-plaque-egout.wav`  · [souterrain, résonance]
**« La Plaque d'Égout »**
> Le ferrailleur paie la fonte au poids et une plaque d'égout pèse cinquante kilos. Il y en a une, là, à moitié descellée. C'est une très mauvaise idée. Cinquante kilos de mauvaise idée.

### `sfx-steal-tarte-fenetre.wav`  · [nourriture]
**« La Tarte sur le Rebord »**
> Une tarte aux pommes refroidit sur un rebord de fenêtre du rez-de-chaussée, comme dans un dessin animé. Vous vérifiez : pas de caméra, pas de piège, pas de scénariste.

### `sfx-steal-cave-restaurant.wav`  · [souterrain, résonance]
**« La Cave du Restaurant »**
> La trappe de livraison de la cave du restaurant gastronomique est restée ouverte sur le trottoir. En bas : des caisses de vin dont chaque bouteille vaut votre semaine.

### `sfx-steal-outils-echafaudage.wav`  · [radio]
**« Les Outils de l'Échafaudage »**
> Les façadiers sont partis déjeuner en laissant sur l'échafaudage une perceuse, deux truelles et une radio de chantier qui chante toute seule.

### `sfx-steal-jetons-caddies.wav`  · [circulation, véhicule]
**« Les Jetons des Caddies »**
> Une astuce de vieux brigand : certains caddies rendent leur jeton avec un coup sec au bon endroit. Le parking en compte quarante, alignés comme des tirelires.

### `sfx-steal-fleurs-cimetiere.wav`  · [végétal, plein air]
**« Les Fleurs du Cimetière »**
> Le cimetière regorge de chrysanthèmes frais d'hier. La fleuriste d'en face les vend douze euros le pot. Le circuit court par excellence, moralement inconfortable.

### `sfx-steal-glaciere-pique-nique.wav`  · [sport]
**« La Glacière du Pique-Nique »**
> Une famille dispute un match de badminton à trente mètres de sa glacière. La glacière, elle, ne joue pas : elle attend, pleine, à l'ombre du saule.

### `sfx-steal-enseigne-neon.wav`  · [papier, pages]
**« La Lettre du Néon Mort »**
> Le magasin « SUPERETTE » a fermé il y a deux ans. Son enseigne pend, et le « S » lumineux ne tient plus qu'à un fil. Le brocanteur adore les lettres géantes, les décorateurs aussi.

### `sfx-steal-panier-velo.wav`  · [pluie]
**« Le Panier du Vélo Hollandais »**
> Un vélo hollandais impeccable est garé devant la librairie, panier avant chargé : une baguette, un bouquet, un livre neuf et un parapluie. Une nature morte à ciel ouvert.

### `sfx-steal-pressing-costume.wav`  · [monnaie]
**« Le Portant du Pressing »**
> Le pressing a sorti son portant de livraison sur le trottoir : douze housses, dont un costume trois-pièces étiqueté « Maître Bernard, plaidoirie jeudi ». Un costume d'avocat. Votre taille, en plus.

### `sfx-steal-barbecue-parc.wav`  · [feu]
**« Le Barbecue Sans Surveillance »**
> Un barbecue de parc crépite, couvert de merguez et de côtelettes, pendant que ses propriétaires débattent à vingt mètres de politique locale. Le débat est vif, la viande est prête.

### `sfx-steal-colis-palier.wav`  · [porte, grille, serrure]
**« Le Colis du Palier »**
> Dans le hall où vous vous abritez, un colis attend devant la porte du 3B depuis ce matin. La boîte est grande, le carton est beau, et le 3B ne rentre visiblement pas.

### `sfx-steal-sapin-decembre.wav`  · [végétal, plein air]
**« Le Sapin Invendu »**
> Le vendeur de sapins remballe le 24 au soir. Il reste douze invendus enchaînés ensemble, condamnés à la benne du 26. Ils sentent la forêt et l'occasion.

### `sfx-steal-vestiaire-theatre.wav`  · [public, spectacle]
**« Le Vestiaire du Théâtre »**
> Entracte au théâtre municipal : le vestiaire déborde de manteaux, la préposée est partie fumer, et les tickets numérotés dorment sur le comptoir. Douze minutes d'entracte.

### `sfx-steal-miel-toits.wav`  · [insectes]
**« Le Miel des Toits »**
> Les ruches du toit du gymnase produisent un miel urbain vendu une fortune en boutique bio. Les pots de la dernière récolte attendent dans la cabane de l'apiculteur, à peine cadenassée. Les gardiennes, elles, sont trente mille et armées.

### `sfx-steal-arrosoir-mairie.wav`  · [végétal, plein air]
**« Les Jardinières de la Mairie »**
> La mairie a planté ses jardinières d'apparat : herbes aromatiques « pédagogiques », fraisiers « participatifs » et un panneau « servez-vous raisonnablement ». Personne n'ose jamais. Le raisonnable, c'est votre rayon.

### `sfx-steal-tombola-lots.wav`  · [lieu de culte]
**« Les Lots de la Tombola »**
> La kermesse remballe. Sur la table des lots de tombola non réclamés : un jambon entier, une cafetière, un vélo d'enfant et un bon d'achat. Le stand est vide, les tickets s'envolent au vent.

### `sfx-steal-recup-chantier-bois.wav`  · [chien]
**« Les Palettes Consignées »**
> Derrière l'entrepôt, une pile de palettes Europe : les bleues, les consignées, celles qui valent une vraie pièce chacune. Le mur est bas. Le chien, en revanche, est théorique : le panneau « chien méchant » est rouillé.

### `sfx-steal-buvette-stade.wav`  · [sport]
**« La Buvette du Stade »**
> Mi-temps au stade municipal : la buvette est prise d'assaut, le bénévole est seul, et la caisse est une boîte à chaussures. Le chaos organisé, sauf que personne n'organise.

### `sfx-sursaut.wav`  · [lieu de culte]
**« Le Sursaut »**
> Au bord du gouffre, quelque chose remonte : un souvenir, un visage, une promesse. Vous vous rappelez pourquoi vous tenez encore debout.

### `sfx-legend-graffiti.wav`  · [nourriture]
**« Le mur des légendes »**
> Sur un mur décrépi, un graffiti tracé avec soin : « {name}, {days} jours, Roi du Carton ». La rue n\'oublie pas les siens.

### `sfx-legend-ancien.wav`  · [papier, pages]
**« Le vieux se souvient »**
> Un ancien du quartier vous jauge. « {name} ? Ah, ça… {days} jours dans la rue. Personne n\'a fait mieux. Toi, t\'as encore du chemin. »

### `sfx-legend-carton.wav`  · [papier, pages]
**« Le carton du roi »**
> Sous un porche, un carton usé jusqu\'à la corde. Une inscription au marqueur : « Ici a dormi {name}, {days} jours durant. » On dirait un lieu de pèlerinage.

### `sfx-legend-pari.wav`  · [foule]
**« Le pari de la rue »**
> Deux SDF parient sur votre avenir. « Lui ? Il tiendra jamais {days} jours comme {name}. » « Parie ! »

---

## Récapitulatif des noms de fichiers

```
sfx-steal-etal-marche.wav
sfx-steal-poche-costard.wav
sfx-steal-supermarche.wav
sfx-steal-velo.wav
sfx-steal-tronc-eglise.wav
sfx-steal-etendage.wav
sfx-steal-distributeur-secoue.wav
sfx-steal-chantier-cuivre.wav
sfx-steal-terrasse-pourboires.wav
sfx-steal-buffet-mariage.wav
sfx-steal-camion-boulangerie.wav
sfx-steal-casier-vestiaire.wav
sfx-steal-potager-nuit.wav
sfx-steal-champagne-vernissage.wav
sfx-steal-cageots-aube.wav
sfx-steal-petit-dej-hotel.wav
sfx-steal-fontaine-voeux.wav
sfx-steal-tirelire-comptoir.wav
sfx-steal-plaque-egout.wav
sfx-steal-tarte-fenetre.wav
sfx-steal-cave-restaurant.wav
sfx-steal-outils-echafaudage.wav
sfx-steal-jetons-caddies.wav
sfx-steal-fleurs-cimetiere.wav
sfx-steal-glaciere-pique-nique.wav
sfx-steal-enseigne-neon.wav
sfx-steal-panier-velo.wav
sfx-steal-pressing-costume.wav
sfx-steal-barbecue-parc.wav
sfx-steal-colis-palier.wav
sfx-steal-sapin-decembre.wav
sfx-steal-vestiaire-theatre.wav
sfx-steal-miel-toits.wav
sfx-steal-arrosoir-mairie.wav
sfx-steal-tombola-lots.wav
sfx-steal-recup-chantier-bois.wav
sfx-steal-buvette-stade.wav
sfx-sursaut.wav
sfx-legend-graffiti.wav
sfx-legend-ancien.wav
sfx-legend-carton.wav
sfx-legend-pari.wav
```

**42 fichiers.** Livraison en ZIP, dossier `sons/`.