# Fabriquer l'application Android — guide pas à pas (Windows)

*Écrit pour quelqu'un qui n'a jamais rien installé de tout ça. Aucune étape
n'est sous-entendue. Si une ligne te paraît évidente, saute-la ; si une ligne
ne marche pas, c'est normal et c'est prévu — chaque étape a sa section
« si ça coince ».*

---

## Ce qu'on fabrique, et pourquoi il faut tout ça

Ton jeu est un **site web**. Il tourne dans un navigateur, il est fini, il
marche. Ce qu'on veut, c'est une **application** — une icône sur l'écran
d'accueil, installable depuis le Play Store.

Trois pièces, et chacune a un rôle précis :

| Pièce | À quoi ça sert |
|---|---|
| **Node.js** | Fabrique le site web à partir du code source. Le code que tu vois sur GitHub n'est pas directement jouable : il faut le « construire ». |
| **Git** | Va chercher le code sur GitHub et le pose sur ton PC. |
| **Android Studio** | L'atelier. Prend le site construit, l'emballe, et sort le fichier que Google Play accepte. |

Le dossier `android/` du projet est déjà prêt — icône, publicités, numéro de
version, tout est dedans. **Il ne manque que l'atelier pour fermer la boîte.**

## Avant de commencer : ce que ça demande

| | |
|---|---|
| **Temps** | 1 h à 1 h 30, dont la plus grande partie à attendre des téléchargements |
| **Espace disque** | Prévois **20 Go libres**. Android Studio et ses outils sont gros. |
| **Connexion** | Plusieurs Go à télécharger |

> Tu peux t'arrêter entre deux étapes et reprendre plus tard. Rien ne se perd.

---

# Étape 1 — Node.js

## Installer

1. Va sur **https://nodejs.org**
2. Prends le bouton **LTS** (à gauche, marqué « Recommandé »). Pas le
   « Current » : on veut la version stable.
3. Lance le fichier `.msi` téléchargé.
4. Clique **Next** partout, accepte la licence, **Install**.

> ⚠️ **Une seule case à surveiller.** Vers la fin, une page propose
> « *Automatically install the necessary tools…* » avec une case à cocher.
> **Laisse-la DÉCOCHÉE.** Cochée, elle lance une installation annexe de
> plusieurs gigaoctets dont ton projet n'a aucun besoin, et qui peut durer une
> demi-heure.

## Vérifier

Ouvre **PowerShell** : touche `Windows`, tape `powershell`, `Entrée`.

Une fenêtre bleu foncé s'ouvre. Tape :

```powershell
node -v
```

Tu dois voir quelque chose comme `v22.x.x`. **Le numéro doit commencer par
22.** S'il n'y a rien, ou une erreur, ferme PowerShell et rouvre-le — les
programmes fraîchement installés n'apparaissent qu'au démarrage suivant.

## Activer pnpm

`pnpm` est le gestionnaire que ce projet utilise. Il est déjà prévu dans le
code, il suffit de l'allumer.

**Ferme PowerShell.** Rouvre-le **en administrateur** : touche `Windows`, tape
`powershell`, puis **clic droit** sur « Windows PowerShell » →
**Exécuter en tant qu'administrateur**. Puis :

```powershell
corepack enable
```

Aucun message ne s'affiche si ça marche. C'est bon signe.

> **Si ça coince :** `corepack : le terme n'est pas reconnu` → Node.js n'est
> pas installé ou la fenêtre est trop ancienne. Ferme tout, rouvre.

---

# Étape 2 — Git

## Installer

1. Va sur **https://git-scm.com/download/win**
2. Le téléchargement démarre tout seul (« 64-bit Git for Windows Setup »).
3. Lance le fichier.
4. **Clique Next sur toutes les pages.** L'installateur pose beaucoup de
   questions ; les réponses par défaut conviennent toutes à ce qu'on fait.
   Ne cherche pas à comprendre les options, elles ne comptent pas ici.

## Vérifier

Rouvre PowerShell (normal, plus besoin d'administrateur) :

```powershell
git --version
```

Tu dois voir `git version 2.x.x`.

---

# Étape 3 — Récupérer le projet

Toujours dans PowerShell :

```powershell
cd ~\Documents
git clone https://github.com/aboubacary78-dotcom/Roiducarton.git
cd Roiducarton
git checkout claude/game-improvement-review-qpa9u1
```

Ce que font ces quatre lignes, dans l'ordre :

1. se placer dans ton dossier **Documents** ;
2. **télécharger** tout le projet depuis GitHub (compte quelques minutes,
   il y a 78 Mo d'images et 14 Mo de sons) ;
3. **entrer** dans le dossier fraîchement créé ;
4. se placer sur la **branche de travail** — celle où se trouve tout ce qu'on
   a fait ensemble. Sans cette ligne, tu aurais une version plus ancienne,
   sans le dossier Android.

> **Si une fenêtre de connexion GitHub s'ouvre** : c'est normal si le dépôt
> est privé. Connecte-toi avec ton compte, Windows retiendra l'autorisation.

## Vérifier

```powershell
git branch --show-current
```

Doit afficher : `claude/game-improvement-review-qpa9u1`

---

# Étape 4 — Construire le jeu

C'est ici qu'on transforme le code source en site jouable, puis qu'on le
glisse dans la boîte Android.

```powershell
pnpm install
```

La première fois, compte 2 à 5 minutes. Beaucoup de texte défile — c'est
normal, ce sont les bibliothèques qui se téléchargent.

```powershell
pnpm build
```

Quelques secondes. Tu dois voir une liste de fichiers et, à la fin,
`✓ built in ...`.

```powershell
npx cap sync android
```

Cette ligne **copie le site construit dans le dossier Android**. Sans elle,
l'application serait vide. Tu dois voir `Sync finished`.

## Vérifier que la configuration est intacte

```powershell
python scripts\verifie-android.py
```

Tu dois lire **8 vérifications au vert**. Si Windows te répond que `python`
n'existe pas, saute cette vérification — elle est utile, pas indispensable,
et installer Python juste pour ça n'en vaut pas la peine.

---

# Étape 5 — Android Studio

## Installer

1. Va sur **https://developer.android.com/studio**
2. Gros bouton **Download Android Studio**. Accepte les conditions.
3. Lance le `.exe` (environ 1 Go).
4. **Next** partout, puis **Install**, puis **Finish**.

## Premier démarrage

Android Studio s'ouvre et lance un assistant :

- « Import settings » → **Do not import settings**
- Type d'installation → **Standard**
- Thème → celui que tu veux
- Écran de résumé → **Next**, puis **Finish**

**Il télécharge alors le SDK Android : 5 à 10 Go.** C'est la plus longue
attente du guide. Laisse tourner, va faire autre chose.

## Ouvrir TON projet

⚠️ **Le piège le plus courant est ici.** Sur l'écran d'accueil :

1. Clique **Open** (pas « New Project »)
2. Navigue vers `Documents` → `Roiducarton`
3. **Sélectionne le sous-dossier `android`, pas `Roiducarton` lui-même.**

> Si tu ouvres `Roiducarton`, Android Studio ne comprend pas ce qu'il regarde
> et n'affiche aucun bouton pour lancer. C'est bien le dossier **`android`**
> qu'il attend.

En bas de la fenêtre, une barre annonce **« Gradle sync in progress »**.
Compte 5 à 20 minutes la première fois. **Attends qu'elle disparaisse**
avant de toucher à quoi que ce soit.

---

# Étape 6 — Lancer sur ton téléphone

## Préparer le téléphone

Ces réglages sont cachés exprès, c'est normal de ne pas les connaître :

1. **Paramètres** → **À propos du téléphone**
2. Trouve **Numéro de build** et **tape dessus 7 fois de suite**
3. Un message apparaît : *« Vous êtes maintenant développeur »*
4. Retourne dans **Paramètres** → **Système** → **Options pour les
   développeurs**
5. Active **Débogage USB**

## Brancher et lancer

1. Branche le téléphone au PC en USB.
2. Sur le téléphone, une fenêtre demande d'autoriser le débogage →
   **Autoriser**.
3. Dans Android Studio, en haut, le menu déroulant doit afficher **le nom de
   ton téléphone**.
4. Clique le bouton **▶️ Run** vert.

Première compilation : 2 à 5 minutes.

## Ce que tu dois voir

| Ce que tu vérifies | Pourquoi ça compte |
|---|---|
| L'icône **carton couronné** | Preuve que les icônes ont bien remplacé celles de Capacitor |
| L'écran de démarrage beige | Idem |
| **L'application ne se ferme PAS au lancement** | **C'est le test décisif.** Une fermeture immédiate signifierait que l'App ID AdMob manque. |
| Des publicités marquées **« Test Ad »** | C'est voulu. On garde le mode test jusqu'à la publication. |
| Le jeu se joue normalement | Sons, images, sauvegarde |

---

# Si ça coince

| Message | Ce qu'il faut faire |
|---|---|
| `SDK Platform 35 not found` | Android Studio → menu **Tools** → **SDK Manager** → coche **Android 15 (API 35)** → **Apply** |
| `compileSdk 35 not tested` | Normalement déjà neutralisé dans `android/gradle.properties`. Si le message revient quand même, signale-le. |
| Le téléphone n'apparaît pas | Débranche/rebranche ; vérifie « Débogage USB » ; certains câbles ne servent qu'à charger — essaies-en un autre |
| `pnpm : n'est pas reconnu` | `corepack enable` n'a pas été fait, ou pas en administrateur (étape 1) |
| Gradle tourne sans fin | Laisse finir la première fois. Si ça dépasse 30 min, **File → Invalidate Caches → Restart** |

**Et surtout :** copie-colle le message d'erreur complet et envoie-le. Un
message d'erreur Android Studio est long et effrayant, mais il dit
précisément ce qui manque — c'est une information, pas un échec.

---

# Ce qui vient après

Une fois que le jeu tourne sur ton téléphone, il restera :

1. **Créer une clé de signature** — l'empreinte qui prouve que l'application
   vient de toi. ⚠️ Elle est **irremplaçable** : perdue, tu ne peux plus
   jamais mettre à jour ton jeu sur le Play Store. On la fabriquera ensemble,
   et je te dirai où la garder.
2. **Fabriquer le fichier `.aab`** — le colis pour Google Play.
3. **Compte développeur Google Play** — 25 $, une seule fois.
4. **La fiche du store** — captures d'écran, description, classification.

Rien de tout ça n'est aussi long que ce guide. Le plus dur, c'est
l'installation ; elle ne se fait qu'une fois.
