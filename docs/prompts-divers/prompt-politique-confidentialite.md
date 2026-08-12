# Rédiger la politique de confidentialité du « Roi du Carton »

## Ce qu'on te demande

Rédiger une **politique de confidentialité** pour un jeu mobile, en **français
et en anglais**, livrée sous forme d'**une page HTML autonome** prête à être
hébergée (aucun script externe, aucune police distante, un seul fichier).

Elle doit satisfaire les exigences de publication de l'**App Store d'Apple** et
du **Google Play Store**, qui réclament tous deux une URL publique de politique
de confidentialité, consultable **sans installer l'application**.

## ⚠️ La règle la plus importante

**N'invente RIEN.** L'inventaire ci-dessous a été relevé directement dans le
code de l'application. Une politique qui annonce une collecte de données qui
n'existe pas est aussi fautive qu'une politique qui en cache une. Si un point
te paraît manquer, **signale-le en commentaire à la fin** plutôt que de combler
le trou par une formule passe-partout.

En particulier : **ne parle pas de comptes utilisateurs, de serveurs, de
newsletters, de cookies analytiques ni de partage avec des partenaires** — il
n'y en a aucun.

---

## L'application

**Le Roi du Carton** — jeu de survie en solo. Le joueur incarne un sans-abri
qui survit jour après jour dans une ville française. Humour noir, direction
artistique en carton découpé.

- Éditeur : *(à compléter par le propriétaire de l'application)*
- Contact : *(adresse e-mail à compléter)*
- Identifiant de l'application : `com.roiducarton.game`
- Plateformes : **Android**, **iOS**, et une **version web** dans le navigateur
- Public visé : adolescents et adultes. **Le jeu n'est pas destiné aux enfants**
  et ne leur est pas commercialisé.

---

## Inventaire EXACT des données (relevé dans le code)

### 1. Ce qui est stocké sur l'appareil

Tout tient dans le **stockage local du navigateur** (`localStorage`). **Rien
n'est envoyé nulle part.** Aucun serveur n'appartient à l'éditeur : le jeu
fonctionne entièrement hors ligne une fois chargé.

Quinze entrées, toutes créées par le joueur en jouant :

| Ce qui est gardé | À quoi ça sert |
|---|---|
| La partie en cours | reprendre là où on s'était arrêté |
| Les meilleurs scores | le tableau des scores, local |
| Le cimetière et le registre des morts | l'historique des personnages perdus |
| Le karma et l'héritage | les bonus débloqués pour la partie suivante |
| La couronne | le personnage sacré devient le boss des parties suivantes |
| L'apparence choisie (chapeaux, accessoires) | personnalisation |
| La langue, le son coupé ou non | préférences |
| Les tutoriels et règles déjà lus | ne pas les réafficher |
| L'option « sans publicité » | préférence |

**Aucune de ces données ne contient d'information personnelle** : pas de nom
réel, pas d'adresse e-mail, pas de numéro de téléphone, pas de position
géographique, pas de contacts, pas de photos, pas de micro, pas de caméra.
Les prénoms des personnages sont tirés au sort par le jeu.

Le joueur peut **tout effacer** en vidant les données de l'application depuis
les réglages de son téléphone, ou les données du site depuis son navigateur.
Aucune copie n'existe ailleurs, donc l'effacement est définitif et total.

### 2. Ce qui sort de l'appareil

**Rien**, à une exception près : la publicité.

- Aucun outil de mesure d'audience, aucun traceur, aucun service d'analyse.
  Vérifié : ni Google Analytics, ni Firebase, ni Sentry, ni réseau social.
- Aucun appel réseau vers un serveur de l'éditeur — il n'en existe pas.
- Le jeu ne télécharge que ses propres images et sons, depuis l'endroit d'où il
  a été installé.

### 3. La publicité

Le jeu affiche des publicités **Google AdMob**, et **uniquement dans les
applications Android et iOS**. **La version web n'affiche aucune publicité** :
il faut le dire explicitement, c'est une différence réelle entre les versions.

Trois formats : une bannière, des interstitiels entre deux écrans, et des
vidéos facultatives que le joueur choisit de regarder pour obtenir un avantage
en jeu.

Google AdMob est un service tiers qui peut, pour son propre compte, collecter
et traiter des identifiants publicitaires et des données d'usage. **L'éditeur
n'a accès à aucune de ces données** et n'en reçoit aucune copie. La politique
de confidentialité de Google doit être liée depuis la page :
https://policies.google.com/privacy

Explique aussi, simplement, comment le joueur peut limiter la publicité ciblée
depuis les réglages de son téléphone (identifiant publicitaire Android,
« Suivi » sur iOS).

---

## Ce que la page doit contenir

1. **La date de dernière mise à jour**, en haut.
2. **Un résumé de trois lignes** avant tout le reste, en langage ordinaire :
   ce jeu ne collecte rien, tout reste sur le téléphone, seule la publicité
   fait intervenir un tiers. C'est la partie que les gens lisent réellement.
3. Les données stockées, et pourquoi.
4. Ce qui sort de l'appareil, et vers qui.
5. La publicité, avec le lien vers la politique de Google.
6. Les droits du joueur (accès, effacement) et **comment les exercer
   concrètement** — ici, en vidant les données de l'application, sans avoir à
   écrire à qui que ce soit.
7. Les enfants : le jeu ne leur est pas destiné, aucune donnée n'est
   sciemment collectée les concernant.
8. Comment les changements de politique sont signalés.
9. Un contact.
10. **Les deux langues sur la même page**, français d'abord, anglais ensuite,
    séparés par un titre clair. Pas deux fichiers.

## Le ton

Clair, court, sans jargon juridique inutile. Le jeu est une comédie, mais
**cette page ne fait pas de blagues** : c'est le seul endroit du produit où
l'on parle sérieusement. Des phrases simples, des titres qui disent ce qu'ils
contiennent.

Évite les tournures creuses du genre « nous prenons votre vie privée très au
sérieux ». Dis plutôt ce qui est vrai et vérifiable : **il n'y a rien à
prendre au sérieux, parce qu'il n'y a rien à collecter.**

## Contraintes techniques de la page

- **Un seul fichier `.html`**, autonome. CSS dans une balise `<style>`.
- Aucune police, aucune image, aucun script venus d'ailleurs.
- Lisible sur téléphone : texte d'au moins 16 px, marges confortables,
  largeur de ligne limitée.
- `<title>` renseigné, `lang="fr"` sur la balise racine.
- Sobre. Fond clair, texte sombre, pas de décor.
- Nom du fichier : **`confidentialite.html`**

## Pour finir

Termine ta réponse par une courte liste des **points que le propriétaire doit
compléter ou vérifier lui-même** (nom de l'éditeur, adresse de contact, et tout
ce qui te semblerait douteux). Cette page est un projet à relire, pas un
document juridique définitif.
