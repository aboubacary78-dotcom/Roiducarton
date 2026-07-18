# Pack 6 — Voyager, vague 2 (30 images)

## 📦 Contexte projet (à lire en entier — tu pars de zéro)

Tu travailles sur **« Le Roi du Carton »**, un jeu mobile de survie (un SDF
survit jour après jour dans une ville française). Direction artistique
**« Carton Craft »** : chaque illustration est un **diorama miniature en carton
kraft fait main**, comme une maquette artisanale photographiée.

**Style OBLIGATOIRE pour chaque image :**
- diorama en carton kraft, textures carton ondulé et papier découpé visibles ;
- le héros : SDF en carton découpé, barbe grise, manteau rapiécé, visage
  dessiné au feutre ;
- lumière chaude d'atelier, petite guirlande lumineuse en fond ;
- humour noir tendre, jamais glauque ni misérabiliste ;
- **format paysage 3:2, AUCUN texte ni lettre dans l'image.**

Le dépôt GitHub contient déjà 300+ images de référence dans
`client/public/assets/` : **regarde-en quelques-unes avant de commencer** et
imite-les.

## 🚚 Protocole de livraison (points déjà ratés par le passé, à respecter)

1. **Noms de fichiers EXACTS**, copiés depuis la liste ci-dessous. Une faute
   de nom = image ignorée par le jeu, silencieusement.
2. **VRAIS fichiers .webp** : un PNG renommé en .webp ne compte pas (la
   dernière livraison contenait 98 PNG déguisés de 5 Mo pièce, il a fallu tout
   ré-encoder). Vérifie avant de livrer :
   ```
   file client/public/assets/*.webp | grep -v RIFF   # doit être VIDE
   ```
   Si tu ne sais pas encoder en webp, livre des **.png honnêtes** (extension
   .png), max 1600 px de large : la conversion sera faite à l'intégration.
3. **Poids raisonnable** : ≤ 1200 px de large, objectif < 200 Ko par image.
4. **Ne régénère JAMAIS un fichier déjà présent** dans
   `client/public/assets/` (des vagues entières ont déjà été perdues à
   régénérer de l'existant). Seuls les fichiers listés ci-dessous manquent.
5. Livraison : pousse sur la branche **`manus-assets`**, fichiers dans
   `client/public/assets/`. Lots partiels bienvenus.

---

- `travel-passage-souterrain.webp`
  Le Passage Souterrain : Le passage souterrain coupe le trajet en deux. Au milieu, un accordéoniste joue pour personne, et l'acoustique lui fait un orchestre.
- `travel-passerelle.webp`
  La Passerelle des Rails : La passerelle piétonne enjambe douze voies ferrées. En dessous, les trains partent vers des endroits où vous ne dormirez pas ce soir.
- `travel-abribus-oublis.webp`
  L'Abribus aux Oublis : L'abribus du boulevard est un musée des choses oubliées : un parapluie, un sac de sport, et un livre ouvert face contre banc, comme si son lecteur allait revenir.
- `travel-zone-travaux.webp`
  La Déviation : La rue est éventrée sur cent mètres : « DÉVIATION » pointe vers un labyrinthe de barrières où un ouvrier fait de grands gestes contradictoires.
- `travel-chien-suiveur.webp`
  Le Chien qui Suit : Depuis trois rues, un chien jaune sans collier vous suit à quatre mètres, l'air de rien. Quand vous vous arrêtez, il s'arrête. Quand vous repartez, il repart.
- `travel-porche-facteur.webp`
  L'Averse et le Facteur : Le ciel se déchire en pleine traversée. Vous plongez sous un porche déjà occupé par un facteur, sa sacoche, et un silence de circonstance.
- `travel-carrefour-touristes.webp`
  Les Touristes Perdus : Au carrefour, un couple de touristes tourne sa carte dans tous les sens. Ils vous repèrent : dans cette rue, c'est vous qui avez l'air de savoir où vous allez. C'est dire.
- `travel-benne-camion.webp`
  Le Camion Complice : Un camion plateau démarre au feu, chargé de palettes, pile dans votre direction. La ridelle arrière est basse. Le chauffeur ne regarde que devant.
- `travel-voie-ferree.webp`
  Le Long des Rails : Le raccourci du ballast : longer la voie ferrée désaffectée, entre les orties et les traverses. Interdit, désert, et deux fois plus court.
- `travel-parking-silo.webp`
  Le Parking en Spirale : Le parking silo traverse le pâté de maisons de part en part. Sept étages de spirale en béton, ou le tour complet par le boulevard. La rampe vous tend les bras.
- `travel-halles-nuit.webp`
  Les Halles à la Fermeture : Votre trajet traverse les halles couvertes à l'heure du rideau : les commerçants remballent, les invendus hésitent entre la glacière et la benne.
- `travel-cimetiere-raccourci.webp`
  Le Raccourci du Cimetière : Le cimetière a deux entrées opposées : le traverser coupe le trajet de moitié. Les allées sont droites, les résidents discrets, le silence pèse son poids.
- `travel-berge-canal.webp`
  Le Chemin de Halage : Le chemin de halage longe le canal jusqu'au quartier suivant : plat, calme, bordé de pêcheurs immobiles et de canards administratifs.
- `travel-dame-pipi.webp`
  La Gardienne des Toilettes : Les toilettes publiques du square, tenues depuis trente ans par une gardienne en blouse qui a tout vu, tout entendu, et gardé le meilleur.
- `travel-egout-ouvert.webp`
  La Bouche Ouverte : En travers du trottoir, une bouche d'égout ouverte, entourée de trois plots et d'aucun ouvrier. Le trou respire doucement. Le détour, lui, fait cinquante mètres.
- `travel-escalier-monumental.webp`
  L'Escalier Monumental : Entre le bas et le haut du quartier : l'escalier monumental, cent quatre-vingts marches de pierre que les joggeurs montent en boucle comme des punitions volontaires.
- `travel-trottinette.webp`
  La Trottinette Échouée : Une trottinette électrique en libre-service gît couchée en travers du chemin, abandonnée avec 40 % de batterie et zéro surveillance. La tentation a un guidon.
- `travel-cortege-funeraire.webp`
  Le Cortège : Un cortège funéraire remonte lentement la rue et coupe votre trajet : corbillard, famille en noir, et un klaxon de scooter impatient que tout le monde foudroie du regard.
- `travel-camionnette-glaces.webp`
  La Camionnette à Glaces : La ritournelle d'une camionnette à glaces flotte quelque part dans le quartier, obsédante, insaisissable. Elle semble tourner autour de vous depuis dix minutes.
- `travel-brouillard.webp`
  La Purée de Pois : Le brouillard avale le quartier d'un coup : dix mètres de visibilité, les lampadaires en halos, les bruits qui arrivent sans propriétaire. La ville devient une rumeur.
- `travel-terrain-vague-diagonale.webp`
  La Diagonale du Terrain Vague : Le terrain vague coupe le trajet en diagonale : herbes hautes, carcasses de machines à laver, et un sentier tracé par des générations de gens pressés.
- `travel-vitrine-teles.webp`
  Le Mur de Télés : La vitrine du magasin d'électroménager diffuse le même match sur douze écrans. Devant, un attroupement de passants qui « ne font que passer » depuis vingt minutes.
- `travel-place-pigeons.webp`
  La Place aux Mille Pigeons : La place est intégralement couverte de pigeons. Un tapis gris, roucoulant, qui vous sépare de l'autre côté. Ils vous regardent. Ils savent que vous devez passer.
- `travel-bache-envolee.webp`
  La Bâche Fugitive : Une bâche de chantier s'est arrachée dans le vent et remonte la rue en roulant comme un fantôme bleu de quatre mètres. Les passants s'écartent. Elle vient vers vous.
- `travel-sosie.webp`
  Le Sosie : Sur le trottoir d'en face marche un homme qui vous ressemble trait pour trait : même barbe, même manteau, même démarche de fatigue digne. Il vous a vu aussi. Vous ralentissez tous les deux.
- `travel-photographe.webp`
  Le Photographe de Rue : Un photographe en gilet multipoche vous suit depuis deux rues, boîtier à l'affût. Il finit par oser : « votre visage, c'est la ville entière. Je peux ? »
- `travel-feu-artifice.webp`
  Le Feu d'Artifice Privé : Derrière les toits, un feu d'artifice éclate sans prévenir : un mariage, un anniversaire, une victoire quelconque. Le ciel du quartier s'offre un luxe qui retombe sur tout le monde.
- `travel-arroseuse.webp`
  L'Arroseuse Municipale : Au bout de la rue, l'arroseuse municipale remonte lentement le caniveau, ses jets balayant tout le trottoir. Le conducteur porte des lunettes de soleil. Il ne ralentira pas.
- `travel-gants-grille.webp`
  Les Gants sur les Grilles : Tout le long de la grille du square, des gants perdus ont été empalés sur les piques par des passants : une exposition involontaire de mains vides qui saluent.
- `travel-jardin-prive.webp`
  Le Jardin Traversant : La résidence bourgeoise a un jardin traversant dont les deux portillons ferment mal, tout le monde le sait. Allées ratissées, massifs taillés, silence de coton. Interdit, évidemment.
