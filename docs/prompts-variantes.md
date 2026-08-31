# Prompts · Variantes réussite/échec par événement (pour Manus)

**Vague 1 : les 30 événements d'exploration** = **60 images**.

Le code est déjà câblé : à la fin d'un événement, le jeu cherche
`result-<id>-good.webp` (issue heureuse) ou `result-<id>-bad.webp` (issue
ratée) dans `client/public/assets/`. Si le fichier manque, il retombe sur
l'image de la rencontre, donc tu peux livrer par petits lots, rien ne casse.

## Règles (identiques aux 27 précédentes)
- DA habituelle : diorama carton kraft, personnages découpés à visage feutre,
  guirlande lumineuse, lumière chaude, humour noir.
- **Paysage 3:2**, export **WebP** (⚠️ un vrai `.webp`, pas un PNG renommé,
  sinon je ré-encoderai comme la dernière fois, pas grave).
- Même personnage SDF (barbe, manteau rapiécé) que sur les images existantes.
- Noms de fichiers **exacts** : `result-<id>-good.webp` et `result-<id>-bad.webp`.

Chaque scène ci-dessous découle du **texte réel** de l'issue dans le jeu.

---

| id | ✅ good, scène | ❌ bad, scène |
|----|----------------|---------------|
| `exp-jardinier` | Le SDF jardine avec le vieux jardinier clandestin, sourires, il reçoit une tomate en carton rouge. Complicité. | Le vieux jardinier méfiant le chasse d'un geste, bras croisés devant son potager caché. « Dégage. » |
| `exp-enfant-perdu` | La mère serre son enfant retrouvé, tend 5€ et un sandwich au SDF héros, reconnaissance. | La mère récupère l'enfant en fusillant le SDF du regard, l'écarte, suspicion glaciale. |
| `exp-skateur` | Le SDF renvoie le skate d'un coup de pied stylé, l'ado impressionné applaudit (« trop stylé le vieux ! »). | Le skate finit dans une flaque, l'ado furieux, le SDF penaud. |
| `exp-mariage` | Le SDF se régale incognito au buffet de mariage (saumon, petits fours), mariés flous en fond. | Expulsé manu militari du mariage par un photographe outré qui le pointe du doigt, invités choqués. |
| `exp-artiste-rue` | Portrait à la craie magnifique du SDF sur le trottoir, passants admiratifs, pièces de pourboire. | Portrait à la craie « très abstrait », le SDF perplexe penche la tête devant le gribouillage. |
| `exp-chantier` | Le SDF repart du chantier abandonné avec une bâche et des planches, butin de matériaux. | Un chien errant en carton surgit du fond du chantier, crocs dehors, le SDF recule. |
| `exp-marche-puces` | Un vendeur du marché aux puces lui offre un manteau usé mais chaud, geste généreux. | Étals du marché aux puces décevants : chaussettes dépareillées, le SDF bredouille. |
| `exp-graffiti` | Le tagueur donne 4€ et une bombe de peinture au SDF guetteur, mur coloré, complicité de rue. | Le SDF et le tagueur détalent ensemble, gyrophare de police au loin, adrénaline. |
| `exp-bibliotheque` | Le SDF au chaud dans la bibliothèque, plongé dans un livre, presque « normal », lumière douce. | La bibliothécaire le surveille par-dessus ses lunettes, il n'ose toucher à rien. |
| `exp-concert` | Le SDF danse au milieu du concert de jazz de rue, rires et applaudissements, pièces jetées. | Il trébuche devant la foule qui rit DE lui, honte, musiciens gênés. |
| `exp-metro` | Le SDF ramasse un billet de 10€ sur le quai du métro, incrédule et ravi. | Un autre SDF territorial l'interpelle dans le couloir du métro (« c'est MON couloir ! »), tension. |
| `exp-eglise` | Le prêtre offre café et croissant au SDF sur le parvis (« la maison de Dieu est ouverte à tous »). | Le SDF seul devant l'église fermée à double tour, lumière froide. |
| `exp-bagarre-chats` | Les deux chats séparés et calmés, l'un ronronne dans les bras du SDF : adopté ! | Les deux chats se retournent contre lui : griffures partout, il protège son visage. |
| `exp-fontaine-parc` | Le SDF jette 1 centime dans la fontaine aux pièces, vœu, étrangement optimiste, reflets dorés. | Le SDF les manches retroussées repêche la monnaie de la fontaine, un peu honteux, regards des passants. |
| `exp-velo-casse` | Le SDF fier sur le vélo réparé au fil de fer, roue droite, en route ! | Le vélo toujours voilé au poteau, le SDF repart avec juste la sonnette à la main. |
| `exp-pharmacie` | La pharmacienne tend un kit de premiers soins (« c'est encore bon, hein »), gêne bienveillante. | « Désolée, je ne peux pas » : la pharmacienne baisse les yeux, le SDF aussi, vitrine entre eux. |
| `exp-terrain-vague` | Le SDF trouve une vieille radio qui grésille encore dans le terrain vague, joie simple. | Un raton laveur pas content surgit des buissons du terrain vague, face-à-face. |
| `exp-animalerie` | Un chiot lèche la vitrine devant le SDF attendri, passants qui sourient, moment suspendu. | Le vendeur de l'animalerie le chasse (« tu fais fuir les clients ! »), chiots tristes en vitrine. |
| `exp-cimetiere` | Le SDF médite paisiblement dans le cimetière, fleurs fraîches, sérénité inattendue. | Le SDF recompose des bouquets volés sur les tombes, un fleuriste lui tend 4€, malaise moral. |
| `exp-aire-jeux` | Le SDF sur la balançoire, pieds en l'air, redevenu enfant 5 minutes, guirlande au vent. | La chaîne de la balançoire casse, le SDF atterrit dans le sable, « aïe ». |
| `exp-brocante` | Le SDF troque son bagou contre un thermos à la brocante, vendeur amusé, poignée de main. | Le brocanteur inflexible (« pas d'argent, pas d'objet »), le SDF repart les mains vides. |
| `exp-toit-vue` | Le SDF sur le toit, bras ouverts devant la ville en carton illuminée : roi du monde. | Le concierge furieux le fait redescendre de l'immeuble, doigt pointé vers l'escalier. |
| `exp-salon-coiffure` | Le SDF méconnaissable après sa coupe gratuite, miroir, apprentis fiers, il se redécouvre. | Porte du salon fermée (« réservé aux clients »), le SDF se recoiffe dans le reflet de la vitrine. |
| `exp-fete-foraine` | Le SDF ramasse 3€ sous les manèges de la fête foraine, lumières multicolores. | Sous le manège : tickets usagés et chewing-gum collé aux doigts, grimace. |
| `exp-pecheur-canal` | Le SDF et le vieux pêcheur partagent sandwich et bière au bord du canal, belle rencontre. | « Chut ! Tu fais fuir les poissons ! » : le pêcheur agacé, le SDF s'éloigne sur la pointe des pieds. |
| `exp-cave-vin` | Le SDF brandit une bouteille de vin poussiéreuse trouvée dans la cave, larme de sommelier. | Cave vide : toiles d'araignée et déception, le SDF ressort bredouille. |
| `exp-magasin-ferme` | Le SDF repère une porte arrière entrouverte du magasin fermé, regard malin, « pour plus tard ». | Vitrine du magasin fermé : des mannequins poussiéreux le fixent, ambiance flippante. |
| `exp-hopital` | Le SDF incognito dans la salle d'attente des urgences : chaleur, gobelet d'eau, paradis discret. | Un vigile de l'hôpital l'interpelle (« vous avez un problème médical ? »), il improvise mal. |
| `exp-dechetterie` | Le SDF triomphant à la déchetterie : micro-ondes, sac de couchage, livres ! Caddie de trésors. | Déchetterie décevante : que des gravats et du plâtre, poussière. |
| `exp-camion-pizza` | Le pizzaiolo tend deux parts de margherita au SDF depuis son camion, vapeur, festin ! | « Désolé, j'ai tout vendu » : rideau du camion pizza qui se baisse, estomac qui gronde. |

---

## Total : 60 images
Livre par lots si tu veux (ex. 10 par 10) : chaque image s'active dès qu'elle
arrive, le reste garde l'image de la rencontre en attendant.

## Vague 2 (sur demande)
Les événements de **repos** (19), **voyage** et **boutique** suivent la même
convention `result-<id>-good/bad.webp` : le code les gère déjà. Dis-moi quand
tu veux les prompts.
