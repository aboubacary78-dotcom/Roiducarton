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

## 2. Préparer le projet Capacitor (à faire une seule fois)

Depuis la racine du projet :

```bash
# 1. Installer les dépendances
pnpm install

# 2. Construire le site web (génère dist/public)
pnpm build

# 3. Ajouter les plateformes natives (crée les dossiers android/ et ios/)
pnpm cap:add:android      # nécessite Android Studio
pnpm cap:add:ios          # nécessite un Mac + Xcode
```

À chaque fois que tu modifies le jeu, refais :

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

**Android** — dans `android/app/src/main/AndroidManifest.xml`, à l'intérieur de `<application>` :

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

**iOS** — dans `ios/App/App/Info.plist` :

```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

(iOS 14+) Ajoute aussi la demande de suivi `NSUserTrackingUsageDescription` si tu
actives les pubs personnalisées.

---

## 4. Où les pubs apparaissent dans le jeu

| Type de pub | Déclenchement | Code |
|---|---|---|
| Interstitiel | À l'écran de fin de partie (Game Over) | `GameOverScreen.tsx` |
| Récompensée | Bouton « Seconde chance » pour ressusciter (1×/partie) | `GameOverScreen.tsx` → action `REVIVE` |
| Bannière | Disponible via `showBanner()` (non activée par défaut) | `client/src/lib/ads.ts` |

Toute la logique est centralisée dans **`client/src/lib/ads.ts`**. Pour ajouter
une pub ailleurs, importe `showInterstitial`, `showRewarded` ou `showBanner`.

**Bonnes pratiques de monétisation** (pour ne pas faire fuir les joueurs) :
- Pas d'interstitiel trop fréquent : 1 toutes les 2-3 parties suffit. On peut
  ajouter un compteur si besoin.
- La pub récompensée doit toujours être un **choix** du joueur (ce qui est le cas
  ici avec « Seconde chance »).
- Jamais de pub pendant une action de jeu en cours.

---

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

- [ ] Icône et écran de démarrage (splash) personnalisés
- [ ] Vrais ID AdMob en place, `USE_TEST_ADS = false`
- [ ] App ID AdMob déclaré dans les fichiers natifs
- [ ] Politique de confidentialité en ligne (obligatoire avec des pubs)
- [ ] Captures d'écran pour chaque taille demandée
- [ ] Numéro de version incrémenté (`package.json` + projets natifs)
- [ ] Testé sur un vrai appareil

---

## Scripts utiles

```bash
pnpm build              # construit le jeu web
pnpm cap:sync           # synchronise web → natif
pnpm cap:add:android    # ajoute la plateforme Android
pnpm cap:add:ios        # ajoute la plateforme iOS
pnpm cap:open:android   # ouvre Android Studio
pnpm cap:open:ios       # ouvre Xcode
```
