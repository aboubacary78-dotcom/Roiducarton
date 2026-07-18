# Pack 5 — Suites narratives, vague 2 (10 images)

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

- `followup-chaton-boulangere.webp`
  Le Chat de la Boulangère : Dans la vitrine de la boulangerie, entre les éclairs et les chouquettes, trône VOTRE chaton pirate, devenu gros comme une brioche. Il vous reconnaît. Il détourne le regard, en chat.
- `followup-grille-egoutier.webp`
  La Grille de l'Égoutier : Vous retrouvez la grille d'aération que l'égoutier vous avait indiquée. Il n'avait pas menti : un souffle tiède, régulier, et des rats effectivement polis qui laissent la place.
- `followup-prophetie-toit.webp`
  Le Retour de Madame Esperanza : La caravane mauve est revenue se garer sur le terrain vague. Madame Esperanza vous fait signe avant même que vous approchiez : « je vous attendais. Les cartes ont bougé. »
- `followup-rival-echecs.webp`
  La Revanche : Le vieux joueur d'échecs vous attend au parc, pendule sortie, thermos plein, regard d'acier : « la revanche. J'ai préparé une ouverture toute la semaine. » Il y a des spectateurs. Il a prévenu des gens.
- `followup-pote-videur.webp`
  Le Plan du Videur : Le videur vous intercepte d'un signe de menton : « samedi, mon collègue du vestiaire est aux prud'hommes contre sa belle-sœur, longue histoire. J'ai dit au patron que je connaissais quelqu'un de fiable. C'est toi, le quelqu'un. »
- `followup-carte-biblio.webp`
  Le Club de Lecture : La bibliothécaire du bibliobus vous repère de loin et brandit un livre : « je vous l'ai mis de côté ! Et jeudi, c'est le club de lecture. Il y a du café et personne n'ose jamais parler. Vous, vous oseriez. »
- `followup-ennemi-pere-noel.webp`
  La Vendetta du Père Noël : Le Père Noël du marché vous a retrouvé. Il a fait le tour des commerçants en racontant que vous « voliez la magie de Noël ». Trois boutiques vous regardent de travers. Il est là, bras croisés, la hotte pleine de rancune.
- `followup-bonnet-otage.webp`
  Le Bonnet Otage : Le vendeur de hot-dogs a puni votre larcin en épinglant votre bonnet EN HAUT DE SON PARASOL, comme un trophée de guerre. Il vous voit arriver et tapote le manche : « on négocie, ou tu hivernes tête nue ? »
- `followup-contractuelle.webp`
  L'Œil de la Contractuelle : La contractuelle qui a confisqué votre commerce d'horodateur vous a mis « dans son périmètre ». Elle apparaît partout où vous posez le chapeau, carnet en main, comme une ombre assermentée. Les passants n'osent plus donner.
- `followup-colis-lucie.webp`
  Le Mot de Lucie : Sur la porte du hall, un mot manuscrit : « À la personne qui a pris mon colis : j'espère que le plaid vous tient chaud. Sérieusement. Il fait froid. Lucie (3B). PS : les coussins, par contre, j'y tenais. »
