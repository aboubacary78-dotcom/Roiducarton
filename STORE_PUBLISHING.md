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
- **Compte développeur Google Play** : 25 $ une fois — https://play.google.com/console
- **Compte développeur Apple** : 99 $/an — https://developer.apple.com/programs/
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
| API 35 | `variables.gradle` | Le Play Store refuse tout envoi visant moins que l'API 35. Le gabarit de Capacitor 6 en vise 34 — donc rejet au téléversement. |
| Version tirée de `package.json` | `app/build.gradle` | Le gabarit fige « 1.0 / versionCode 1 ». On aurait publié la 3.31 sous l'étiquette 1.0, et la mise à jour suivante aurait été refusée. |
| Palette du jeu | `res/values/colors.xml` | Sans elle, Android emprunte l'indigo et le rose de Capacitor pour la barre d'état et les poignées de sélection. |
| Icônes et écrans de démarrage | `res/mipmap-*`, `res/drawable-*` | Sinon le jeu s'installe sous le logo de Capacitor. |

Ce qui est réellement jetable — le site copié (94 Mo), les sorties de
compilation, `local.properties` — est exclu par `android/.gitignore`.

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

⚠️ Les mêmes réglages manuels seront à refaire côté iOS — voir §3.3, et pense
à commiter `ios/` une fois généré, pour la même raison qu'Android.

### À chaque modification du jeu

```bash
pnpm build       # reconstruit le web
pnpm cap:sync    # copie le web dans les projets natifs
```

---

## 3. Configurer AdMob (les publicités)

### 3.1 Créer tes blocs d'annonces

1. Sur https://admob.google.com, crée **deux applications** : une Android, une iOS.
2. Pour chaque app, crée 3 **blocs d'annonces** :
   - Bannière
   - Interstitiel (plein écran)
   - Avec récompense (vidéo récompensée — utilisé pour la « Seconde chance »)
3. AdMob te donne, pour chaque app, un **App ID** (format `ca-app-pub-XXXX~YYYY`)
   et, pour chaque bloc, un **Ad Unit ID** (format `ca-app-pub-XXXX/ZZZZ`).

### 3.2 Mettre tes vrais ID dans le code

Ouvre **`client/src/lib/ads.ts`** et :
- Remplace les ID de test dans `AD_UNITS` par tes vrais Ad Unit IDs (Android + iOS).
- Passe `USE_TEST_ADS` à `false`.

> ⚠️ Tant que `USE_TEST_ADS = true`, seules des pubs de démonstration s'affichent.
> Ne clique JAMAIS sur tes propres pubs en production : Google peut bannir ton compte.

### 3.3 Déclarer ton App ID AdMob côté natif

**Android** — la ligne est **déjà en place** dans
`android/app/src/main/AndroidManifest.xml`, avec l'App ID de démonstration de
Google. Il n'y a qu'à en remplacer la valeur :

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

⚠️ Cette valeur et `USE_TEST_ADS` changent **en même temps**. Un App ID réel
avec des blocs de test ne rapporte rien ; des blocs réels sur lesquels on
clique en développement peuvent faire fermer le compte AdMob.
`scripts/verifie-android.py` vérifie que les deux sont dans le même mode.

**iOS** — dans `ios/App/App/Info.plist` :

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

**iOS 14+ — la demande de suivi est OBLIGATOIRE**, elle n'est plus facultative
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
et le consentement restera « inconnu » — donc publicité non personnalisée
partout, y compris là où elle serait permise.

Dans **Confidentialité et messages** :

1. **Message de consentement RGPD** — à créer et publier pour l'EEE, le
   Royaume-Uni et la Suisse. C'est lui que Google exige depuis janvier 2024.
2. **Message ATT** (iOS uniquement) — c'est lui qui déclenche la demande
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
| Bannière | Disponible via `showBanner()` (non activée par défaut) | `client/src/lib/ads.ts` |

### Achat « Sans pub » (in-app)

Un bouton « Supprimer les pubs » existe dans l'écran Options : il désactive
les pubs imposées (interstitielles + bannière) mais garde les bonus vidéo
facultatifs. **Avant publication**, remplace le placeholder
`purchaseRemoveAds()` dans `client/src/lib/ads.ts` par un vrai achat in-app :

1. Crée un produit **non consommable** `remove_ads` dans Google Play Console
   et App Store Connect.
2. Intègre un SDK de facturation — le plus simple : [RevenueCat](https://www.revenuecat.com)
   (`@revenuecat/purchases-capacitor`), sinon `cordova-plugin-purchase`.
3. Dans `purchaseRemoveAds()`, lance l'achat, attends la confirmation du
   store, puis appelle `setAdsRemoved(true)` **seulement si l'achat réussit**.
   Prévois aussi la **restauration d'achat** (obligatoire chez Apple).

⚠️ Tant que ce n'est pas fait, le bouton active le mode sans pub gratuitement
(placeholder de démonstration).

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
- `resources/icon.png` (1024×1024) — icône pour les deux stores
- `resources/splash.png` (2732×2732) — écran de démarrage
- `client/public/favicon.png` + `apple-touch-icon.png` — versions web

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

- [x] Icône et écran de démarrage personnalisés — Android (`pnpm cap:icones`)
- [x] App ID AdMob déclaré côté natif — Android
- [x] Niveau d'API exigé par le Play Store — Android (API 35)
- [x] Numéro de version natif tiré de `package.json` — Android
- [ ] Vrais ID AdMob en place, `USE_TEST_ADS = false` (les deux ensemble)
- [ ] Politique de confidentialité en ligne (obligatoire avec des pubs) — mets
      son URL **absolue** dans `PRIVACY_URL`
      (`client/src/components/game/SettingsScreen.tsx`). Une URL relative
      comme `/confidentialite.html` ne mène nulle part depuis l'application
      empaquetée.
- [ ] Licence commerciale de la bibliothèque audio (405 fichiers)
- [ ] Achat « Sans pub » réellement branché (voir §4)
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
