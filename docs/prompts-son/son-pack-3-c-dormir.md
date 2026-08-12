# Pack son 3.3 — Dormir (69 bruitages)

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

### `sfx-rest-pont-riviere.wav`  · [eau]
**« Le Pont sur la Rivière »**
> Sous le pont, c'est sec et abrité. Le bruit de l'eau est apaisant.

### `sfx-rest-lavomatic.wav`  · [orage]
**« Le Lavomatic 24h »**
> Le lavomatic est ouvert toute la nuit. Chaud, éclairé, avec des chaises.

### `sfx-rest-parking-souterrain.wav`  · [circulation, véhicule]
**« Le Parking Souterrain »**
> Le parking souterrain est presque vide la nuit. Sec, à l'abri du vent.

### `sfx-rest-cabane-carton.wav`  · [papier, pages]
**« Le Château de Carton »**
> Vous avez assez de cartons pour vous bâtir un vrai petit palace.

### `sfx-rest-banc-eglise.wav`  · [lieu de culte]
**« Le Banc de l'Église »**
> Le banc devant l'église est large et abrité par un auvent.

### `sfx-rest-toit-immeuble.wav`  · [végétal, plein air]
**« Le Toit de l'Immeuble »**
> Vous avez trouvé l'accès au toit. Vue sur les étoiles.

### `sfx-rest-abribus.wav`  · [circulation, véhicule]
**« L'Abribus »**
> L'abribus est vide. Le plexiglas protège du vent. Presque confortable.

### `sfx-rest-cave-abandonnee.wav`  · [souterrain, résonance]
**« La Cave Abandonnée »**
> Une cave d'immeuble dont la porte ne ferme plus. Sombre mais sec.

### `sfx-rest-hamac-parc.wav`  · [végétal, plein air]
**« Le Hamac Improvisé »**
> Deux arbres parfaitement espacés. Avec une couverture, vous pouvez faire un hamac.

### `sfx-rest-combat-reveil.wav`  · [découverte]
**« Le Réveil Brutal »**
> Vous dormez paisiblement quand un bruit vous réveille. Quelqu'un fouille vos affaires !

### `sfx-rest-jardin-secret.wav`  · [eau]
**« Le Jardin Secret »**
> Derrière un mur, un jardin abandonné. Herbes folles, banc en pierre, fontaine tarie.

### `sfx-rest-grenier.wav`  · [porte, grille, serrure]
**« Le Grenier Oublié »**
> Un escalier mène à un grenier dont la porte est entrouverte.

### `sfx-rest-fourgon-abandonne.wav`  · [porte, grille, serrure]
**« Le Fourgon Abandonné »**
> Un vieux fourgon de livraison rouillé. La porte arrière est ouverte.

### `sfx-rest-wagon-train.wav`  · [train]
**« Le Wagon de Train »**
> Un wagon de marchandises est ouvert sur une voie de garage.

### `sfx-rest-tente-fortune.wav`  · [tissu]
**« La Tente de Fortune »**
> Avec des sacs poubelle et des bâtons, vous pouvez construire une tente.

### `sfx-rest-musee-nuit.wav`  · [porte, grille, serrure]
**« Le Musée la Nuit »**
> Le musée ferme ses portes. Mais vous connaissez une entrée de service...

### `sfx-rest-bibliotheque-nuit.wav`  · [porte, grille, serrure]
**« La Bibliothèque la Nuit »**
> La bibliothèque ferme. Mais la porte de derrière ne ferme pas bien...

### `sfx-rest-container.wav`  · [chantier]
**« Le Container Maritime »**
> Un container de chantier est ouvert. Sec, solide, à l'abri de tout.

### `sfx-rest-cabine-telephone.wav`  · [pluie]
**« La Cabine Téléphonique »**
> Une vieille cabine téléphonique. Étroite mais à l'abri du vent et de la pluie.

### `sfx-rest-salle-attente.wav`  · [hôpital]
**« La Salle d'Attente »**
> Les urgences sont ouvertes toute la nuit, et personne ne demande rien à celui qui attend. Vous êtes très doué pour attendre.

### `sfx-rest-cinema-permanent.wav`  · [sommeil]
**« La Nuit des Nanars »**
> Le cinéma du quartier programme une nuit « nanars cultes ». Le caissier somnole déjà. Trois films, une salle chauffée, des fauteuils profonds.

### `sfx-rest-confessionnal.wav`  · [lieu de culte]
**« Le Confessionnal »**
> L'église reste ouverte. Le confessionnal est capitonné, à taille humaine, et étonnamment douillet. Dieu ne ronfle pas, lui.

### `sfx-rest-bus-nuit.wav`  · [circulation, véhicule]
**« Le Bus de Nuit »**
> La ligne N12 tourne en boucle jusqu'à l'aube. Chauffage poussif, ronron du moteur, banquette du fond libre. Le grand tour de la ville pour le prix d'un regard entendu.

### `sfx-rest-showroom-matelas.wav`  · [commerce, étal]
**« Le Magasin de Literie »**
> « Essayez nos matelas, sans engagement ! » claironne le vendeur. Sans engagement. Il ne sait pas à qui il parle.

### `sfx-rest-carton-frigo.wav`  · [porte, grille, serrure]
**« Le Carton du Frigo Américain »**
> La boutique d'électroménager jette LE carton : celui d'un frigo américain double porte. Double épaisseur, taille XXL, à peine humide. Le penthouse du carton.

### `sfx-rest-hall-code.wav`  · [porte, grille, serrure]
**« Le Hall au Code Prévisible »**
> Le code de l'immeuble est écrit au feutre sur le mur d'à côté : « 1234 ». Les gens sont prévisibles. Le radiateur du hall, lui, est une valeur sûre.

### `sfx-rest-serre-tropicale.wav`  · [oiseau]
**« La Serre Tropicale »**
> La serre du jardin botanique ferme mal. À l'intérieur : 26 degrés toute l'année, hygrométrie parfaite, et un perroquet qui a tout vu.

### `sfx-rest-peniche.wav`  · [train]
**« La Péniche Amarrée »**
> Une péniche de chantier hiverne le long du quai. Pont bâché, cale sèche, clapotis en fond sonore. L'appel du large, version canal.

### `sfx-rest-tube-toboggan.wav`  · [vent]
**« Le Tube du Toboggan »**
> Le toboggan tubulaire du square : abrité du vent, incliné juste ce qu'il faut, interdit aux plus de douze ans. Vous en avez quelques-uns de trop.

### `sfx-rest-copyshop.wav`  · [mécanique, moteur]
**« La Boutique de Photocopies »**
> Le copy-shop étudiant reste ouvert toute la nuit en période de partiels. Des fauteuils, le ronron chaud des machines, et des gens trop paniqués pour poser des questions.

### `sfx-rest-ascenseur-condamne.wav`  · [circulation, véhicule]
**« L'Ascenseur Condamné »**
> Dans le parking, un ascenseur « en panne depuis 2019 ». Propre, éclairé, avec un miroir pour se dire bonjour. Un studio d'un mètre carré, sans les charges.

### `sfx-rest-champignonniere.wav`  · [souterrain, résonance]
**« La Cave à Champignons »**
> Une ancienne champignonnière, tiède, sombre et silencieuse. Odeur de terre riche, noir absolu, et quelques champignons nostalgiques qui poussent encore par habitude.

### `sfx-rest-bache-piscine.wav`  · [cold]
**« Sous la Bâche de la Piscine »**
> La piscine extérieure est bâchée pour l'hiver. Entre la bâche tendue et les transats empilés : une poche d'air tiède, à l'abri du monde.

### `sfx-rest-loge-theatre.wav`  · [oiseau]
**« La Loge du Théâtre »**
> La porte de service du théâtre est calée avec un extincteur. Au bout du couloir : les loges. Canapés de velours, miroirs à ampoules, gloire en pointillés.

### `sfx-rest-bibliobus.wav`  · [circulation, véhicule]
**« Le Bibliobus »**
> Le bibliobus municipal dort sur son parking, mal verrouillé. À l'intérieur : moquette, coussins de l'heure du conte, et deux mille histoires qui ne demandent que ça.

### `sfx-rest-cabine-grue.wav`  · [chantier]
**« La Cabine de la Grue »**
> Trente mètres au-dessus du chantier endormi, la cabine de la grue. La clé du grillage pend à un clou. Le vertige, lui, est fourni sans supplément.

### `sfx-rest-aire-autoroute.wav`  · [circulation, véhicule]
**« L'Aire d'Autoroute »**
> À la lisière de la ville, une aire d'autoroute : douches à jeton, machine à café, et des routiers qui ont le cœur proportionnel au tonnage.

### `sfx-rest-carrousel.wav`  · [cheval]
**« Le Manège Bâché »**
> Le carrousel du parc est bâché pour la nuit. Sous la toile : des chevaux de bois figés en plein galop, et le carrosse de Cendrillon, libre jusqu'à minuit. Et même après.

### `sfx-rest-casse-limousine.wav`  · [mécanique, moteur]
**« La Limousine de la Casse »**
> La casse auto déborde d'épaves ordinaires. Mais au milieu trône une limousine des années 80, sièges cuir intacts, mini-bar vide, gloire fanée.

### `sfx-rest-chapiteau-cirque.wav`  · [étrange, glacé]
**« Sous les Gradins du Cirque »**
> Le cirque dort. Sous les gradins du chapiteau : de la paille propre, la chaleur des projecteurs éteints, et une odeur de pop-corn fantôme.

### `sfx-rest-showroom-cuisine.wav`  · [caisse, billets]
**« La Cuisine d'Exposition »**
> Le magasin de cuisines expose un « appartement témoin » complet. Faux fruits, vraie banquette, lumière d'ambiance. Une vie de catalogue, inoccupée.

### `sfx-rest-salle-sport.wav`  · [sport]
**« La Salle de Sport 24h/24 »**
> La salle de sport « ouverte 24h/24 » est déserte à 3h. La porte battante bat. Au fond, le coin étirements : des tapis épais et personne pour s'étirer.

### `sfx-rest-parc-expo.wav`  · [porte, grille, serrure]
**« Le Parc des Expositions »**
> Entre le « Salon de l'Habitat » démonté hier et la « Foire du Camping » montée demain, le hall 3 du parc des expos est un désert de moquette chauffée.

### `sfx-rest-jacuzzi-expo.wav`  · [circulation, véhicule]
**« Le Jacuzzi d'Exposition »**
> La jardinerie expose un jacuzzi dernier cri sur le parking, sous un barnum. Il est vide, sec, et exactement de la taille d'un lit rond.

### `sfx-rest-escalier-hopital.wav`  · [hôpital]
**« La Cage d'Escalier de l'Hôpital »**
> L'escalier de service de l'hôpital : chauffé, silencieux, et personne ne prend jamais l'escalier dans un hôpital. Les paliers du 4e sont réputés.

### `sfx-rest-consigne-gare.wav`  · [souterrain, résonance]
**« La Consigne de la Gare »**
> La salle des consignes automatiques, au sous-sol de la gare : tiède, oubliée des caméras, meublée de casiers qui gardent les secrets des autres.

### `sfx-rest-atelier-poterie.wav`  · [monnaie]
**« L'Atelier de Poterie »**
> L'atelier de poterie associatif a laissé son four allumé pour la cuisson de nuit. La pièce entière est un radiateur qui sent l'argile et la patience.

### `sfx-rest-amphi-fac.wav`  · [public, spectacle]
**« L'Amphi de la Fac »**
> L'amphithéâtre B reste ouvert pour les « révisions libres ». Au dernier rang, dans la pénombre, des générations d'étudiants ont dormi avant vous. Tradition sacrée.

### `sfx-rest-foodtruck-tiede.wav`  · [circulation, véhicule]
**« Le Food-Truck Endormi »**
> Le food-truck à burgers a fermé à minuit. Sa plancha met des heures à refroidir : tout le flanc du camion est un mur tiède qui sent l'oignon grillé.

### `sfx-rest-abri-jardin.wav`  · [clés]
**« L'Abri de Jardin »**
> Au fond des jardins ouvriers, un abri à outils au cadenas symbolique. Dedans : des sacs de terreau moelleux, des outils propres, et une odeur de tomate séchée.

### `sfx-rest-tracteur-foire.wav`  · [mécanique, moteur]
**« Le Tracteur de la Foire Agricole »**
> La foire agricole s'installe demain. Les machines dorment déjà sur l'esplanade, dont un tracteur dernier cri : cabine suspendue, siège pneumatique, GPS des champs.

### `sfx-rest-chateau-gonflable.wav`  · [lieu de culte]
**« Le Château Gonflable Dégonflé »**
> Après la kermesse, le château gonflable dégonflé attend son camion sous une sangle. Trois cents mètres carrés de matelas plié. Les enfants partis, le royaume est vacant.

### `sfx-rest-pompes-funebres.wav`  · [commerce, étal]
**« Le Magasin de Pompes Funèbres »**
> L'arrière-boutique des pompes funèbres est entrouverte. À l'intérieur, le showroom : des cercueils d'exposition, capitonnés, soyeux, terriblement confortables. Personne n'ose jamais y entrer. Justement.

### `sfx-rest-cabane-arbre.wav`  · [enfants]
**« La Cabane dans l'Arbre »**
> Au fond du parc, une cabane d'enfants dans un platane : planches de guingois, échelle à moitié pourrie, panneau « INTERDI AU ADULTE ». L'orthographe est jeune, la cabane est solide.

### `sfx-rest-sas-banque.wav`  · [orage]
**« Le Sas de la Banque »**
> Le sas des distributeurs de la banque : chauffé, éclairé, vitré. Le grand classique. Ce soir, il est libre, et la caméra a l'air de dormir aussi.

### `sfx-rest-box-velo.wav`  · [orage]
**« Le Box à Vélos Sécurisé »**
> La résidence neuve a un box à vélos dernier cri : badge, toit, éclairage doux. Un vélo cargo y dort sous une housse. La housse est grande. Le cargo aussi.

### `sfx-rest-quai-chargement.wav`  · [train]
**« Le Quai de Chargement »**
> Derrière le grand magasin, le quai de chargement est désert jusqu'à 6h. Des balles de carton compressé y font des murailles moelleuses, tièdes de la journée.

### `sfx-rest-terrasse-chauffee.wav`  · [caisse, billets]
**« La Terrasse au Chauffage Oublié »**
> Le café a fermé en oubliant d'éteindre un parasol chauffant. Une colonne de chaleur ronronne au-dessus des banquettes de la terrasse, pour personne.

### `sfx-rest-bus-scolaire.wav`  · [circulation, véhicule]
**« Le Bus Scolaire au Dépôt »**
> Le bus scolaire dort sur son parking, porte arrière mal fermée. À l'intérieur flotte une odeur de goûter et de mercredi. La banquette du fond vous tend les bras.

### `sfx-rest-clocher.wav`  · [lieu de culte]
**« Le Clocher »**
> L'escalier du clocher est ouvert pour cause de « travaux campanaires ». Cent vingt marches plus haut : les cloches, les poutres centenaires, et la ville en contrebas.

### `sfx-rest-couloir-hotel.wav`  · [porte, grille, serrure]
**« Le Couloir de l'Hôtel »**
> La porte de service de l'hôtel trois étoiles bâille. Au deuxième, un couloir moquetté, des plateaux room-service à moitié pleins devant les portes, et un silence luxueux.

### `sfx-rest-tunnel-lavage.wav`  · [étrange, glacé]
**« Le Tunnel de Lavage »**
> La station de lavage auto est fermée. Dans le tunnel, les rouleaux géants pendent comme des paresseux bleus. Ils sont secs, épais, et moelleux au-delà du raisonnable.

### `sfx-rest-menuiserie.wav`  · [bois, atelier]
**« La Menuiserie »**
> La menuiserie artisanale laisse sa cour ouverte. Une montagne de sciure fraîche fume doucement dans un coin, tiède de la journée de rabot. Ça sent le pin et le travail bien fait.

### `sfx-rest-gymnase-tapis.wav`  · [sport]
**« Les Tapis du Gymnase »**
> La fenêtre du gymnase scolaire ferme mal depuis toujours, tout le quartier le sait. À l'intérieur : la pile de tapis de gym, deux mètres de mousse bleue réglementaire.

### `sfx-rest-souffle-boulangerie.wav`  · [nourriture]
**« Le Soupirail de la Boulangerie »**
> Le soupirail du fournil souffle un air chaud qui sent le levain dès 3h du matin. Le meilleur radiateur de la ville est une bouche de trottoir qui embaume le pain.

### `sfx-rest-chapelle-famille.wav`  · [lieu de culte]
**« La Chapelle de Famille »**
> Au cimetière, la chapelle de la famille de Brissac-Montmorency est entrouverte depuis des années. Banc de marbre, vitrail, et des voisins d'un calme absolu. Garanti.

### `sfx-rest-remorque-couvertures.wav`  · [souterrain, résonance]
**« La Remorque de Déménagement »**
> Une remorque de location dort devant un pavillon, pleine de couvertures de déménagement : ces grosses couvertures grises molletonnées, par dizaines. Une caverne d'Ali Baba du moelleux.

### `sfx-rest-kiosque-musique.wav`  · [musique]
**« Le Kiosque à Musique »**
> Le kiosque à musique du parc, vide depuis la dernière fanfare. Toit en zinc, plancher surélevé, rambardes ouvragées : une chambre ronde avec vue sur les massifs.

### `sfx-rest-tente-expo.wav`  · [commerce, étal]
**« La Tente d'Exposition »**
> Le magasin de sport a monté sa tente familiale « 6 places, montage 2 minutes » en démonstration sur le parvis. Elle est restée là. Montée. Vide. Six places.

---

## Récapitulatif des noms de fichiers

```
sfx-rest-pont-riviere.wav
sfx-rest-lavomatic.wav
sfx-rest-parking-souterrain.wav
sfx-rest-cabane-carton.wav
sfx-rest-banc-eglise.wav
sfx-rest-toit-immeuble.wav
sfx-rest-abribus.wav
sfx-rest-cave-abandonnee.wav
sfx-rest-hamac-parc.wav
sfx-rest-combat-reveil.wav
sfx-rest-jardin-secret.wav
sfx-rest-grenier.wav
sfx-rest-fourgon-abandonne.wav
sfx-rest-wagon-train.wav
sfx-rest-tente-fortune.wav
sfx-rest-musee-nuit.wav
sfx-rest-bibliotheque-nuit.wav
sfx-rest-container.wav
sfx-rest-cabine-telephone.wav
sfx-rest-salle-attente.wav
sfx-rest-cinema-permanent.wav
sfx-rest-confessionnal.wav
sfx-rest-bus-nuit.wav
sfx-rest-showroom-matelas.wav
sfx-rest-carton-frigo.wav
sfx-rest-hall-code.wav
sfx-rest-serre-tropicale.wav
sfx-rest-peniche.wav
sfx-rest-tube-toboggan.wav
sfx-rest-copyshop.wav
sfx-rest-ascenseur-condamne.wav
sfx-rest-champignonniere.wav
sfx-rest-bache-piscine.wav
sfx-rest-loge-theatre.wav
sfx-rest-bibliobus.wav
sfx-rest-cabine-grue.wav
sfx-rest-aire-autoroute.wav
sfx-rest-carrousel.wav
sfx-rest-casse-limousine.wav
sfx-rest-chapiteau-cirque.wav
sfx-rest-showroom-cuisine.wav
sfx-rest-salle-sport.wav
sfx-rest-parc-expo.wav
sfx-rest-jacuzzi-expo.wav
sfx-rest-escalier-hopital.wav
sfx-rest-consigne-gare.wav
sfx-rest-atelier-poterie.wav
sfx-rest-amphi-fac.wav
sfx-rest-foodtruck-tiede.wav
sfx-rest-abri-jardin.wav
sfx-rest-tracteur-foire.wav
sfx-rest-chateau-gonflable.wav
sfx-rest-pompes-funebres.wav
sfx-rest-cabane-arbre.wav
sfx-rest-sas-banque.wav
sfx-rest-box-velo.wav
sfx-rest-quai-chargement.wav
sfx-rest-terrasse-chauffee.wav
sfx-rest-bus-scolaire.wav
sfx-rest-clocher.wav
sfx-rest-couloir-hotel.wav
sfx-rest-tunnel-lavage.wav
sfx-rest-menuiserie.wav
sfx-rest-gymnase-tapis.wav
sfx-rest-souffle-boulangerie.wav
sfx-rest-chapelle-famille.wav
sfx-rest-remorque-couvertures.wav
sfx-rest-kiosque-musique.wav
sfx-rest-tente-expo.wav
```

**69 fichiers.** Livraison en ZIP, dossier `sons/`.