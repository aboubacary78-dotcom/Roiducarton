# Le Roi du Carton : Une Épopée Urbaine

Jeu de survie urbaine en français, développé avec React 19 + TypeScript + Vite + Tailwind CSS 4.

## Gameplay

Incarnez un SDF dans une ville française et survivez en gérant vos stats vitales :
- ❤️ Santé, 🧠 Mental, 🍞 Faim, 💧 Soif, 😴 Sommeil, 🎭 Dignité

## Fonctionnalités

- **120+ événements narratifs** avec chaînes à suite logique (système de flags)
- **Système de météo** : 7 types (Ensoleillé, Nuageux, Pluie, Orage, Canicule, Brouillard, Neige) avec effets visuels animés
- **10 boutiques** avec système de marchandage basé sur le respect
- **Combat au tour par tour** contre 8 types d'ennemis
- **3 personnages jouables** : Colette Artiste, Albert Bibliothécaire, Jean-Claude Militaire
- **5 zones de la ville** à explorer
- **Difficulté élevée** — aucune condition de victoire, seulement la survie

## Stack technique

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui
- Framer Motion
- Wouter (routing)

## Lancer le projet

```bash
pnpm install
pnpm dev
```

## Mobile & publication (Play Store / App Store)

Le jeu est emballé en app native Android + iOS avec **Capacitor**, et monétisé
avec **Google AdMob** :

- Pub interstitielle à la fin de partie.
- Pub récompensée « Seconde chance » pour ressusciter une fois par partie.
- Toute la logique pub est centralisée dans `client/src/lib/ads.ts` (no-op sur le web).

👉 Guide complet pas à pas : **[STORE_PUBLISHING.md](./STORE_PUBLISHING.md)**

```bash
pnpm build            # construit le jeu web
pnpm cap:add:android  # ajoute la plateforme Android (Android Studio requis)
pnpm cap:add:ios      # ajoute la plateforme iOS (Mac + Xcode requis)
pnpm cap:sync         # synchronise le web vers les projets natifs
```
