# Publier « Le Roi du Carton » sur le Play Store et l'App Store

Ton jeu est une application web React. On la transforme en vraie app mobile
Android + iOS grâce à **Capacitor**, et on monétise avec **Google AdMob**.
Ce guide explique chaque étape, de zéro jusqu'à la mise en ligne.

> Tu n'as pas besoin de réécrire le jeu. Capacitor emballe le site web existant
> dans une coquille native qui peut être publiée sur les stores.

---

## 1. Prérequis (à installer sur ton ordinateur)

| Pour... | Il te faut |
|---|---|
| Android | [Android Studio](https://developer.android.com/studio) (inclut le SDK Android et Java) |
| iOS | Un Mac avec [Xcode](https://developer.apple.com/xcode/) |
| Les deux | [Node.js 20+](https://nodejs.org) et `pnpm` (`npm i -g pnpm`) |

Comptes nécessaires :
- **Compte développeur Google Play** : 25 $ une fois, https://play.google.com/console
- **Compte développeur Apple** : 99 $/an, https://developer.apple.com/programs/
- **Compte AdMob** (gratuit) : https://admob.google.com

---

## 2. Préparer le projet Capacitor

### Android : c'est déjà fait, et c'est dans le dépôt ✅

Le dossier `android/` est **suivi par git**. Il n'est plus à générer, et il ne
faut plus le régénérer : `cap add android` écraserait des réglages qu'il ne
sait pas reproduire.

Ce qui y a été posé à la main, et qu'un dossier régénéré n'aurait pas :

| Réglage | Où | Pourquoi |
|---|---|---|
| App ID AdMob | `AndroidManifest.xml` | **Sans lui, l'application se ferme au lancement** : le SDK de Google lève une exception fatale s'il ne le trouve pas. |
| API 35 | `variables.gradle` | Le Play Store refuse tout envoi visant moins que l'API 35. Le gabarit de Capacitor 6 en vise 34, donc rejet au téléversement. |
| Version tirée de `package.json` | `app/build.gradle` | Le gabarit fige « 1.0 / versionCode 1 ». On aurait publié la 3.31 sous l'étiquette 1.0, et la mise à jour suivante aurait été refusée. |
| Palette du jeu | `res/values/colors.xml` | Sans elle, Android emprunte l'indigo et le rose de Capacitor pour la barre d'état et les poignées de sélection. |
| Icônes et écrans de démarrage | `res/mipmap-*`, `res/drawable-*` | Sinon le jeu s'installe sous le logo de Capacitor. |

Ce qui est réellement jetable, le site copié (94 Mo), les sorties de
compilation, `local.properties` : est exclu par `android/.gitignore`.

Pour vérifier que tout cela tient toujours, sans avoir à compiler :

```bash
python3 scripts/verifie-android.py
```

Et pour refabriquer les icônes après un changement de `resources/icon.png` ou
`resources/splash.png` :

```bash
pnpm cap:icones
```

### iOS : reste à générer sur un Mac

```bash
pnpm cap:add:ios          # nécessite un Mac + Xcode
```

⚠️ Les mêmes réglages manuels seront à refaire côté iOS, voir §3.3, et pense
à commiter `ios/` une fois généré, pour la même raison qu'Android.

### À chaque modification du jeu

```bash
pnpm build       # reconstruit le web
pnpm cap:sync    # copie le web dans les projets natifs
```

---

## 3. Configurer AdMob (les publicités)

### 3.1 Créer tes blocs d'annonces

Il faut **une application AdMob par plate-forme**, les blocs ne se partagent
pas entre Android et iOS.

**Android : fait** (« Le Roi du Carton », compte `ca-app-pub-6336322065829631`),
avec ses trois blocs : bannière, interstitiel, avec récompense.

**iOS : à faire** le jour où la plate-forme existera, en répétant :

1. Sur https://admob.google.com, ajouter l'application.
   « L'application est-elle disponible sur une plate-forme de téléchargement ? »
   → **Non** tant qu'elle n'est pas publiée ; le rattachement au store se fait
   après, et l'App ID ne change pas.
2. Créer les 3 blocs : **Bannière**, **Interstitiel**, **Avec récompense**.
   - Sur « Avec récompense », le montant et l'élément de récompense n'ont
     aucune importance : le jeu ne les lit pas, il vérifie seulement que la
     vidéo a été regardée puis applique sa propre récompense.
   - ⚠️ Laisser **« Enchères partenaires » décochée**. Ce réglage est
     **irréversible** et réserve le bloc à une plate-forme de médiation tierce.
3. AdMob donne un **App ID** (`ca-app-pub-XXXX` **~** `YYYY`, tilde) et un
   **Ad Unit ID** par bloc (`ca-app-pub-XXXX` **/** `ZZZZ`, slash). Le tilde
   contre le slash est le seul piège de forme, et l'inversion est muette.

### 3.2 Mettre tes vrais ID dans le code

**Android : c'est fait.** Compte `ca-app-pub-6336322065829631`, App ID
`~8445598624`, et les trois blocs (bannière, interstitiel, avec récompense)
sont dans `AD_UNITS.android` (`client/src/lib/ads.ts`).

**iOS : à faire le jour où la plateforme existera.** Les blocs y sont encore
ceux de démonstration. Il faudra créer une **seconde application** dans
AdMob, les blocs ne se partagent pas entre plates-formes.

> Ces identifiants ne sont pas des secrets : ils partent dans chaque APK
> distribué et s'en extraient en une commande. Google les écrit lui-même en
> clair dans ses exemples.

#### `USE_TEST_ADS` reste à `true`, et c'est voulu

On pourrait croire qu'installer ses vrais identifiants veut dire couper le
mode test. C'est le contraire : la bonne façon de se relire, c'est de demander
des annonces de **démonstration** à travers ses **vrais blocs**. On éprouve le
vrai chemin (le bon compte, le bon bloc, le bon format) sans jamais produire
d'impression réelle.

> ⚠️ Voir une vraie annonce dans sa propre application, c'est finir par
> cliquer dessus. C'est le motif de fermeture de compte le plus courant chez
> les nouveaux éditeurs.

À passer à `false` **au moment de fabriquer l'AAB qu'on téléverse**, pas
avant. De toute façon rien ne serait diffusé d'ici là : AdMob n'ouvre les
annonces réelles qu'après avoir examiné l'application, ce qui suppose qu'elle
soit d'abord sur le Play Store.

### 3.3 Déclarer ton App ID AdMob côté natif

**Android : fait.** La ligne est en place dans
`android/app/src/main/AndroidManifest.xml`, avec le vrai App ID :

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-6336322065829631~8445598624"/>
```

Rappel de ce qui est en jeu ici : **sans cette ligne, l'application se ferme au
lancement**. Le SDK Google Mobile Ads la vérifie au démarrage et lève une
exception fatale s'il ne la trouve pas.

⚠️ L'App ID et les blocs de `ads.ts` doivent venir du **même éditeur**
(`ca-app-pub-6336322065829631`). Mélanger les comptes ne produit aucune erreur
visible : simplement, plus rien ne se diffuse.
`scripts/verifie-android.py` compare les deux préfixes.

**iOS** : dans `ios/App/App/Info.plist` :

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

**iOS 14+, la demande de suivi est OBLIGATOIRE**, elle n'est plus facultative
depuis que le consentement est implémenté (`client/src/lib/ads.ts`). Sans ce
texte, l'application plante à l'ouverture du formulaire, ou Apple la refuse en
revue :

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Cette autorisation permet de vous proposer des publicités adaptées. Vous pouvez refuser : le jeu reste identique, les publicités seront simplement moins pertinentes.</string>
```

Le texte doit dire ce qu'on y gagne, sans culpabiliser ni promettre quoi que
ce soit en échange : Apple refuse les formulations qui conditionnent l'accès au
jeu à l'acceptation.

### 3.4 Configurer les messages de consentement dans la console AdMob

Le code appelle le SDK UMP de Google, mais **c'est la console AdMob qui décide
de ce qui s'affiche**. Sans ces deux messages, le formulaire ne s'ouvrira jamais
et le consentement restera « inconnu », donc publicité non personnalisée
partout, y compris là où elle serait permise.

Dans **Confidentialité et messages** :

1. **Message de consentement RGPD** : à créer et publier pour l'EEE, le
   Royaume-Uni et la Suisse. C'est lui que Google exige depuis janvier 2024.
2. **Message ATT** (iOS uniquement) : c'est lui qui déclenche la demande
   d'autorisation de suivi d'Apple, avant le message RGPD.

Publie les deux **pour chacune des deux applications** (Android et iOS)
séparément.

### Comment tester le consentement sans être en Europe

`AdMob.requestConsentInfo()` accepte `debugGeography: AdmobConsentDebugGeography.EEA`
et une liste d'identifiants d'appareils de test. C'est le seul moyen de voir le
formulaire depuis un pays non concerné. À retirer avant publication.

---

## 4. Où les pubs apparaissent dans le jeu

| Type de pub | Déclenchement | Code |
|---|---|---|
| Interstitiel | À l'écran de fin de partie (Game Over) | `GameOverScreen.tsx` |
| Récompensée | Bouton « Seconde chance » pour ressusciter (1×/partie) | `GameOverScreen.tsx` → action `REVIVE` |
| Récompensée | Bouton « Doubler mes gains » quand on gagne de l'argent | `EventResultOverlay.tsx` → action `DOUBLE_REWARD` |
| Récompensée | « Coup de pouce » dans un événement : garantit la meilleure issue du choix | `EventScreen.tsx` (option `boosted` de `CHOOSE_EVENT`) |
| Bannière | **Active**, mais uniquement sur les écrans de LECTURE : registre, cimetière, boutique, écran de fin | `pages/Home.tsx` |

La bannière ne s'affiche jamais pendant une journée de jeu ni pendant un
mini-jeu, et c'est délibéré : le pouce y travaille en bas de l'écran, et une
bannière sous le pouce ne produit pas de l'agacement mais des **clics
accidentels** : que les régies sanctionnent et qui font désinstaller.

⚠️ Un point à éprouver sur appareil : à la mort, le joueur reçoit
l'interstitiel plein écran **puis** arrive sur l'écran de fin qui porte la
bannière. Deux publicités dans le même moment. Si c'est trop lourd à l'usage,
retirer `'game-over'` de `ECRANS_DE_LECTURE` dans `pages/Home.tsx` suffit.

### Les achats intégrés · branchés

Trois produits non consommables, tous décrits dans **`docs/design/prix.md`** :
`noads` (2,99 €), `atelier` (4,99 €), `pack_complet` (6,99 €).

La facturation passe par **`cordova-plugin-purchase` 13.18**, qui embarque la
Google Play Billing Library 9. Elle vit dans **`client/src/lib/facturation.ts`**
et n'est appelée que par `ads.ts` : aucun écran ne parle au magasin
directement.

Ce qui a changé, et pourquoi c'était sérieux : jusqu'à la version 3.63,
`purchaseRemoveAds()` ouvrait le produit GRATUITEMENT, partout. C'était un
marqueur de développement assumé tant qu'aucun magasin n'existait, mais le
défaut ne se voyait pas, l'écran est identique, le bouton répond, le produit
s'ouvre, et personne ne paie. `scripts/test-facturation.mjs` appuie
maintenant sur les trois boutons d'achat **sur le build de production** et
vérifie que rien ne s'ouvre.

Deux conséquences pour la compilation :

- **`minSdkVersion` passe à 23** (`android/variables.gradle`). La Billing
  Library 9 l'exige ; en dessous, Gradle refuse. On abandonne Android 5.1.
- **Les achats ne se testent pas depuis Android Studio.** Google Play Billing
  ne répond qu'à une application installée depuis le Play Store. Il faut donc
  un `.aab` signé, téléversé sur le canal *Test interne*, installé par le lien
  Play, et son compte inscrit en **testeur de licence** pour payer avec une
  carte de test. La marche à suivre complète est dans `docs/design/prix.md`.

Avant l'application, les boutons affichent « Boutique indisponible » : c'est
le comportement correct, pas une panne.

Toute la logique est centralisée dans **`client/src/lib/ads.ts`**. Pour ajouter
une pub ailleurs, importe `showInterstitial`, `showRewarded` ou `showBanner`.

**Bonnes pratiques de monétisation** (pour ne pas faire fuir les joueurs) :
- Pas d'interstitiel trop fréquent : 1 toutes les 2-3 parties suffit. On peut
  ajouter un compteur si besoin.
- La pub récompensée doit toujours être un **choix** du joueur (ce qui est le cas
  ici avec « Seconde chance »).
- Jamais de pub pendant une action de jeu en cours.

---

## 4 bis. Icône et écran de démarrage (déjà dessinés ✅)

Les sources sont dans le projet, dans la DA du jeu (carton couronné) :
- `resources/icon.png` (1024×1024) : icône pour les deux stores
- `resources/splash.png` (2732×2732) : écran de démarrage
- `client/public/favicon.png` + `apple-touch-icon.png`, versions web

Pour régénérer après modification du design : `node scripts/generate-assets.mjs`.

Une fois les plateformes ajoutées (`pnpm cap:add:android` / `cap:add:ios`),
génère toutes les déclinaisons natives (icônes rondes Android, tailles iOS,
splash sombres…) en une commande :

```bash
pnpm add -D @capacitor/assets
npx capacitor-assets generate --android --ios
```

## 5. Construire et publier

### Android (Play Store)

```bash
pnpm build && pnpm cap:sync
pnpm cap:open:android      # ouvre Android Studio
```

Dans Android Studio :
1. `Build > Generate Signed Bundle / APK` → choisis **Android App Bundle (.aab)**.
2. Crée une **clé de signature** (garde-la précieusement, elle est irremplaçable).
3. Téléverse le `.aab` sur https://play.google.com/console.
4. Remplis la fiche : titre, description, captures d'écran, icône 512×512,
   politique de confidentialité (obligatoire), classification de contenu.
5. Soumets pour examen.

### iOS (App Store)

```bash
pnpm build && pnpm cap:sync
pnpm cap:open:ios          # ouvre Xcode
```

Dans Xcode :
1. Configure ton **Team** (compte développeur Apple) et le **Bundle Identifier**
   (`com.roiducarton.game`).
2. `Product > Archive`, puis distribue vers **App Store Connect**.
3. Sur https://appstoreconnect.apple.com, remplis la fiche et soumets pour examen.

---

## 6. Checklist avant soumission

- [x] Icône et écran de démarrage personnalisés · Android (`pnpm cap:icones`)
- [x] App ID AdMob déclaré côté natif · Android
- [x] Niveau d'API exigé par le Play Store · Android (API 35)
- [x] Numéro de version natif tiré de `package.json` · Android
- [x] Vrais blocs AdMob Android en place (compte `ca-app-pub-6336322065829631`)
- [ ] `USE_TEST_ADS = false` · **au moment de fabriquer l'AAB, pas avant**
- [ ] Messages de consentement RGPD publiés dans la console AdMob (§3.4)
- [x] Politique de confidentialité en ligne, à une URL **absolue** · 
      https://beautiful-chaja-c8af8f.netlify.app/confidentialite.html
      (dans `PRIVACY_URL`, `client/src/components/game/SettingsScreen.tsx`).
      La même adresse sert au message de consentement AdMob et à la fiche Play.
- [ ] Licence audio · **à confirmer par l'auteur, pas un blocage établi**.
      `docs/audio/livraison-manus.md` affirme que les bruitages viennent d'un
      compte ElevenLabs *Free*, donc en usage non commercial. Cette note vient
      du prestataire qui a livré le lot, et l'auteur du jeu la considère comme
      erronée. La restriction du palier gratuit existe bel et bien chez
      ElevenLabs ; c'est la **provenance** des fichiers qui est en cause, et
      elle ne se vérifie que depuis le compte qui les a produits.
      Si régénération il faut : les consignes de fabrication de 382 des 405
      fichiers sont conservées dans `docs/prompts-son/`, et les noms de
      fichiers ne changeraient pas, donc aucune ligne de code à toucher.
- [x] Achat « Sans pub » réellement branché (voir §4) · `lib/facturation.ts`
      sur cordova-plugin-purchase, les trois produits déclarés côté code. Il
      reste à les **créer dans la Play Console** sous les mêmes identifiants
      (`noads`, `atelier`, `pack_complet`), sans quoi le magasin répondra
      « produit inconnu » et l'écran affichera ses prix de secours.
- [ ] Captures d'écran pour chaque taille demandée
- [ ] Compilé et testé sur un vrai appareil
- [ ] iOS : plateforme générée sur un Mac, puis les mêmes réglages qu'Android

---

## Scripts utiles

```bash
pnpm build              # construit le jeu web
pnpm cap:sync           # synchronise web → natif
pnpm cap:icones         # refabrique icônes et écrans de démarrage Android
pnpm cap:open:android   # ouvre Android Studio
pnpm cap:add:ios        # ajoute la plateforme iOS (Mac uniquement)
pnpm cap:open:ios       # ouvre Xcode

python3 scripts/verifie-android.py   # contrôle le projet natif sans compiler
```

⚠️ `pnpm cap:add:android` a disparu de cette liste **volontairement** : le
dossier `android/` est dans le dépôt, et le régénérer effacerait les réglages
listés au §2.
