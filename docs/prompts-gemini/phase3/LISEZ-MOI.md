# Phase 3 — trois packs d'images

## `pack-10-fins.md` — 4 images

Quand un personnage meurt, le jeu affiche une une de journal avec une photo
choisie selon ce qui l'a tué. Six causes ont la leur, plus une pour la mort au
combat.

Mais le jeu reconnaît **quatre fins particulières** — mort le premier jour,
mort riche, cuit par la canicule, tombé après dix jours de règne — qui n'ont
pas d'image et retombent sur la photo générique. Ce sont pourtant les plus
savoureuses, et celles qu'on a envie de montrer.

Ces quatre-là sont demandées ici. **Le travail de code suit à l'intégration** :
aujourd'hui l'image est choisie sur la cause de mort, il faudra qu'elle
préfère la fin particulière quand il y en a une.

## `pack-11-trouvailles.md` — 29 vignettes

Dans La Récup', les objets qu'on déterre sont affichés avec de simples emoji.
Tout le reste du jeu est illustré ; eux détonnent, et ce sont pourtant les
objets qu'on regarde le plus longtemps.

**Ce pack ne ressemble pas aux autres** : pas des scènes en paysage, mais des
**vignettes d'objet carrées à fond transparent**, faites pour être vues à
40 pixels de côté dans la grille de fouille. Le brief insiste là-dessus, avec
un test simple : réduire l'image à 40 px et vérifier qu'on reconnaît encore
l'objet.

**Le travail de code suit aussi** : le mini-jeu affiche actuellement
`{find.emoji}` dans une balise texte ; il faudra passer à une image, avec repli
sur l'emoji tant qu'une vignette manque — le même principe que pour les sons.

## `pack-12-derniers-svg.md` — 8 images

Quand le jeu n'a pas d'illustration pour un écran, il en dessine une à la
volée. Ce filet de sécurité se voit : c'est un tracé vectoriel gris au milieu
de dioramas photographiés.

Après audit, il ne restait que **huit endroits** où il se déclenchait encore.
Trois sont l'écran de fin de La Récup' — le plus visible, celui qui a motivé
ce pack. Les cinq autres sont de petites cartes de résultat très fréquentes :
utiliser un objet, en manger un, en revendre un, le cadeau laissé sur le
carton, la seconde chance.

**Le code est déjà prêt** : il réclame ces huit images dès maintenant. En
attendant, les trois fins de La Récup' retombent sur des dioramas de
déchetterie déjà livrés — plus aucun tracé vectoriel sur cet écran. Les cinq
autres cartes basculeront dès que les fichiers seront déposés dans `assets/`.

---

## Ordre conseillé

Le pack 12 d'abord : c'est celui qui supprime les derniers écrans dessinés du
jeu, et le pack 10 en dépend un peu (même famille de cartes de résultat). Le
pack 10 est court et se voit tout de suite. Le pack 11 est plus long mais
c'est lui qui change le plus l'allure du jeu : La Récup' est le seul écran où
il reste des emoji à la place d'illustrations.
