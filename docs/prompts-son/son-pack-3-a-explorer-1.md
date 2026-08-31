# Pack son 3.1 · Explorer · première moitié (48 bruitages)

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
« vrai », trop cinématographique sonnera faux, même s'il est techniquement
parfait. **Petit, proche, sec, fait main.**

## Le ton : comédie douce-amère

Le jeu est une comédie noire. On rit de la misère avec tendresse. Les sons
peuvent être drôles (un klaxon qui couine, un pigeon très concerné), jamais
sinistres ni grandiloquents. Pas de nappes de synthé dramatiques, pas de
percussion de bande-annonce.

## Trois interdits absolus

1. **Aucune parole intelligible.** Le jeu existe en français et en anglais ;
   un mot compréhensible casserait la traduction. Un brouhaha de foule doit
   rester un brouhaha, des voyelles, du murmure, jamais de phrase.
2. **Aucune mélodie reconnaissable** ni citation d'une musique existante.
3. **Aucune stridence.** Le jeu se joue au casque dans le métro. Rien
   au-dessus de 8 kHz qui pique, pas de sifflement continu.

## Ce qui existe déjà et qu'on ne touche pas

Le thème de l'écran-titre est déjà en place et il plaît. **Ne pas le
remplacer.** Tout le reste du jeu est actuellement synthétisé à la volée par
le navigateur : c'est fonctionnel mais sans matière. C'est ça qu'on remplace.

## Contraintes techniques (les mêmes pour les trois packs)

- **Format : WAV, 48 kHz, 16 bits.** Si ce n'est pas possible, MP3 320 kbps,
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
Jusqu'ici elles se partageaient 58 sons rangés par thème, ce qui donnait 30
rencontres différentes sur le même bruit de voiture, et quelques absurdités
(une laverie qui déclenchait le tonnerre, parce que le mot « éclairé » ressemble
à « éclair »).

Le bruitage se déclenche **à l'ouverture de la carte de rencontre**, une fois,
puis se tait.

## La règle qui décide de tout

**Le son doit sortir de CETTE scène-là, pas de sa catégorie.** Chaque entrée
ci-dessous vous donne le titre et le texte exact que le joueur lit à l'écran.
Lisez-le, et cherchez **le bruit que fait précisément ce moment**, pas le bruit
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

### `sfx-exp-jardinier.wav`  · [végétal, plein air]
**« Le Jardinier Clandestin »**
> Un vieil homme cultive des légumes en cachette dans un coin du parc. Il vous repère.

### `sfx-exp-enfant-perdu.wav`  · [enfants]
**« L'Enfant Perdu »**
> Un gamin de 6 ans pleure sur un banc. Il a perdu sa maman dans le parc.

### `sfx-exp-skateur.wav`  · [vélo, roulettes]
**« Le Skateur Cascadeur »**
> Un ado fait des figures de skate devant vous. Il rate un trick et son skate roule vers vous.

### `sfx-exp-mariage.wav`  · [cérémonie]
**« Le Mariage en Plein Air »**
> Un mariage se déroule dans le parc. Buffet, musique, gens bien habillés. Vous bavez.

### `sfx-exp-artiste-rue.wav`  · [découverte]
**« L'Artiste de Rue »**
> Un artiste peint votre portrait à la craie sur le trottoir sans vous demander.

### `sfx-exp-chantier.wav`  · [chantier]
**« Le Chantier Abandonné »**
> Un chantier abandonné. Des matériaux traînent partout. Mais des bruits suspects viennent du fond.

### `sfx-exp-marche-puces.wav`  · [commerce, étal]
**« Le Marché aux Puces »**
> Le marché aux puces du dimanche. Des trésors cachés parmi les déchets.

### `sfx-exp-graffiti.wav`  · [nourriture]
**« Le Mur de Graffitis »**
> Un mur couvert de graffitis colorés. Un tagueur est en pleine action.

### `sfx-exp-bibliotheque.wav`  · [papier, pages]
**« La Bibliothèque Municipale »**
> La bibliothèque est ouverte. Chaleur, silence, et des toilettes gratuites.

### `sfx-exp-concert.wav`  · [musique]
**« Le Concert Improvisé »**
> Des musiciens de rue jouent du jazz. La foule s'amasse. L'ambiance est magique.

### `sfx-exp-metro.wav`  · [métro]
**« La Station de Métro »**
> Vous descendez dans la station de métro. Il fait chaud, mais c'est le territoire d'autres SDF.

### `sfx-exp-eglise.wav`  · [lieu de culte]
**« L'Église du Quartier »**
> L'église est ouverte. Un prêtre balaie l'entrée.

### `sfx-exp-bagarre-chats.wav`  · [végétal, plein air]
**« La Bagarre de Chats »**
> Deux chats se battent férocement dans une ruelle. Les miaulements sont terrifiants.

### `sfx-exp-fontaine-parc.wav`  · [eau]
**« La Fontaine aux Pièces »**
> La fontaine du parc brille de pièces jetées par les touristes. Des voeux et de l'argent.

### `sfx-exp-velo-casse.wav`  · [vélo, roulettes]
**« Le Vélo Abandonné »**
> Un vélo cassé est attaché à un poteau. La roue avant est voilée, mais le reste semble OK.

### `sfx-exp-pharmacie.wav`  · [hôpital]
**« La Pharmacie de Garde »**
> La pharmacie est ouverte. La pharmacienne vous regarde avec un mélange de pitié et de méfiance.

### `sfx-exp-terrain-vague.wav`  · [végétal, plein air]
**« Le Terrain Vague »**
> Un terrain vague entre deux immeubles. Des herbes folles, des déchets, et... des bruits.

### `sfx-exp-animalerie.wav`  · [chien]
**« L'Animalerie du Coin »**
> L'animalerie a mis des chiots en vitrine. Vous vous arrêtez, hypnotisé.

### `sfx-exp-cimetiere.wav`  · [eau]
**« Le Cimetière Paisible »**
> Le cimetière est calme. Des fleurs fraîches sur certaines tombes. Un robinet coule.

### `sfx-exp-aire-jeux.wav`  · [vent]
**« L'Aire de Jeux Déserte »**
> L'aire de jeux est vide. Les balançoires grincent dans le vent. Nostalgie.

### `sfx-exp-brocante.wav`  · [commerce, étal]
**« La Brocante du Quartier »**
> Une brocante de quartier. Des objets hétéroclites s'entassent sur les tables.

### `sfx-exp-toit-vue.wav`  · [végétal, plein air]
**« Le Toit avec Vue »**
> Vous trouvez l'accès à un toit d'immeuble. La vue sur la ville est époustouflante.

### `sfx-exp-salon-coiffure.wav`  · [nourriture]
**« Le Salon de Coiffure »**
> Un salon de coiffure cherche un modèle pour ses apprentis. Gratuit.

### `sfx-exp-fete-foraine.wav`  · [musique]
**« La Fête Foraine »**
> La fête foraine est installée ! Lumières, odeurs de barbe à papa, musique criarde.

### `sfx-exp-pecheur-canal.wav`  · [eau]
**« Le Pêcheur du Canal »**
> Un vieux pêcheur est assis au bord du canal. Il a l'air de s'ennuyer ferme.

### `sfx-exp-cave-vin.wav`  · [souterrain, résonance]
**« La Cave à Vin Oubliée »**
> Une porte de cave entrouverte dans une ruelle. Des bouteilles poussiéreuses à l'intérieur.

### `sfx-exp-magasin-ferme.wav`  · [commerce, étal]
**« Le Magasin Fermé »**
> Un magasin a fermé définitivement. La vitrine est encore pleine de marchandises.

### `sfx-exp-hopital.wav`  · [hôpital]
**« Les Urgences de l'Hôpital »**
> L'hôpital est bondé. La salle d'attente des urgences est chaude et il y a un distributeur d'eau.

### `sfx-exp-dechetterie.wav`  · [mécanique, moteur]
**« La Déchetterie Municipale »**
> La déchetterie est ouverte. Les gens jettent des choses incroyables.

### `sfx-exp-camion-pizza.wav`  · [circulation, véhicule]
**« Le Camion Pizza »**
> Un camion pizza est garé. L'odeur est divine. Le pizzaiolo ferme pour la nuit.

### `sfx-exp-piscine-municipale.wav`  · [eau]
**« La Piscine Municipale »**
> Le vestiaire de la piscine est mal surveillé. Des douches chaudes à volonté, pour qui marche d'un pas assuré.

### `sfx-exp-canard-geant.wav`  · [eau]
**« Le Canard Géant »**
> Un canard gonflable géant, échappé d'un festival, dérive majestueusement sur le canal. Les passants filment. Personne n'agit.

### `sfx-exp-vide-grenier.wav`  · [vent]
**« Le Vide-Grenier »**
> Un vide-grenier s'installe sur la place. En fin de journée, les invendus finissent souvent sur le trottoir. Vous connaissez le trottoir.

### `sfx-exp-caddies.wav`  · [circulation, véhicule]
**« Les Caddies Perdus »**
> Le parking du supermarché est constellé de caddies abandonnés. Chacun est lesté d'une pièce d'un euro. C'est presque un verger.

### `sfx-exp-photomaton.wav`  · [mécanique, moteur]
**« Le Photomaton »**
> Un photomaton clignote dans la galerie. Une pièce est coincée dans la fente, et des photos oubliées pendent du bac.

### `sfx-exp-livreur-perdu.wav`  · [papier, pages]
**« Le Livreur Perdu »**
> Un livreur à vélo tourne en rond depuis vingt minutes. Sa sacoche fume doucement. Le GPS a gagné, lui a perdu.

### `sfx-exp-statue-vivante.wav`  · [public, spectacle]
**« La Statue Vivante »**
> L'artiste statue vivante de la place vient de s'évanouir de chaleur. Son chapeau à pièces reste au sol, très vivant, lui.

### `sfx-exp-poubelle-bureau.wav`  · [mécanique, moteur]
**« Les Poubelles du Bureau »**
> Une entreprise déménage. Les bennes débordent de matériel décrété « obsolète » par un tableur.

### `sfx-exp-casting-sauvage.wav`  · [public, spectacle]
**« Le Casting Sauvage »**
> Une réalisatrice arpente le quartier : elle cherche des « gueules authentiques » pour son documentaire sur la ville.

### `sfx-exp-frigo-solidaire.wav`  · [mécanique, moteur]
**« Le Frigo Solidaire »**
> Un frigo solidaire flambant neuf vient d'être inauguré, ruban tricolore et tout. Il est encore plein. Ça ne durera pas.

### `sfx-exp-toilettes-payantes.wav`  · [mécanique, moteur]
**« La Sanisette Détraquée »**
> La sanisette municipale est en panne : porte grande ouverte, monnayeur qui clignote comme une machine à sous.

### `sfx-exp-magicien-rate.wav`  · [pigeon]
**« Le Magicien Raté »**
> Un magicien de rue vient de rater son grand final : sa colombe s'est enfuie avec l'alliance d'une spectatrice. Panique élégante.

### `sfx-exp-demenageurs.wav`  · [mécanique, moteur]
**« Le Piano du Sixième »**
> Deux déménageurs contemplent un piano droit au pied d'un immeuble sans ascenseur. Sixième étage. Silence religieux.

### `sfx-exp-jardins-ouvriers.wav`  · [végétal, plein air]
**« Les Jardins Ouvriers »**
> Derrière un grillage, des potagers en parcelles. Sur l'une d'elles, un écriteau : « Récoltez-moi, je pars en maison de retraite. »

### `sfx-exp-boite-livres.wav`  · [papier, pages]
**« La Boîte à Livres »**
> Une boîte à livres déborde sur la place. Entre deux romans de gare, une enveloppe kraft dépasse, ni timbrée ni fermée.

### `sfx-exp-manif.wav`  · [deuil]
**« La Manifestation »**
> Un cortège traverse le quartier, banderoles au vent. Vous ne savez pas pour quoi ils manifestent, mais il y a un stand de merguez.

### `sfx-exp-tournage.wav`  · [public, spectacle]
**« Le Tournage »**
> Une équipe de cinéma a envahi votre rue. Câbles, projecteurs, et surtout : un buffet régie momentanément sans surveillance.

### `sfx-exp-distributeur-fleurs.wav`  · [mécanique, moteur]
**« Le Distributeur de Fleurs »**
> Un distributeur automatique de bouquets est détraqué : il distribue une rose toutes les trois minutes, gratuitement, imperturbablement.

---

## Récapitulatif des noms de fichiers

```
sfx-exp-jardinier.wav
sfx-exp-enfant-perdu.wav
sfx-exp-skateur.wav
sfx-exp-mariage.wav
sfx-exp-artiste-rue.wav
sfx-exp-chantier.wav
sfx-exp-marche-puces.wav
sfx-exp-graffiti.wav
sfx-exp-bibliotheque.wav
sfx-exp-concert.wav
sfx-exp-metro.wav
sfx-exp-eglise.wav
sfx-exp-bagarre-chats.wav
sfx-exp-fontaine-parc.wav
sfx-exp-velo-casse.wav
sfx-exp-pharmacie.wav
sfx-exp-terrain-vague.wav
sfx-exp-animalerie.wav
sfx-exp-cimetiere.wav
sfx-exp-aire-jeux.wav
sfx-exp-brocante.wav
sfx-exp-toit-vue.wav
sfx-exp-salon-coiffure.wav
sfx-exp-fete-foraine.wav
sfx-exp-pecheur-canal.wav
sfx-exp-cave-vin.wav
sfx-exp-magasin-ferme.wav
sfx-exp-hopital.wav
sfx-exp-dechetterie.wav
sfx-exp-camion-pizza.wav
sfx-exp-piscine-municipale.wav
sfx-exp-canard-geant.wav
sfx-exp-vide-grenier.wav
sfx-exp-caddies.wav
sfx-exp-photomaton.wav
sfx-exp-livreur-perdu.wav
sfx-exp-statue-vivante.wav
sfx-exp-poubelle-bureau.wav
sfx-exp-casting-sauvage.wav
sfx-exp-frigo-solidaire.wav
sfx-exp-toilettes-payantes.wav
sfx-exp-magicien-rate.wav
sfx-exp-demenageurs.wav
sfx-exp-jardins-ouvriers.wav
sfx-exp-boite-livres.wav
sfx-exp-manif.wav
sfx-exp-tournage.wav
sfx-exp-distributeur-fleurs.wav
```

**48 fichiers.** Livraison en ZIP, dossier `sons/`.