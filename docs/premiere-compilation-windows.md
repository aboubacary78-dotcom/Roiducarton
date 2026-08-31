# Fabriquer l'application Android · guide pas à pas (Windows)

*Écrit pour quelqu'un qui n'a jamais rien installé de tout ça. Aucune étape
n'est sous-entendue. Si une ligne te paraît évidente, saute-la ; si une ligne
ne marche pas, c'est normal et c'est prévu, chaque étape a sa section
« si ça coince ».*

---

## Ce qu'on fabrique, et pourquoi il faut tout ça

Ton jeu est un **site web**. Il tourne dans un navigateur, il est fini, il
marche. Ce qu'on veut, c'est une **application** : une icône sur l'écran
d'accueil, installable depuis le Play Store.

Trois pièces, et chacune a un rôle précis :

| Pièce | À quoi ça sert |
|---|---|
| **Node.js** | Fabrique le site web à partir du code source. Le code que tu vois sur GitHub n'est pas directement jouable : il faut le « construire ». |
| **Git** | Va chercher le code sur GitHub et le pose sur ton PC. |
| **Android Studio** | L'atelier. Prend le site construit, l'emballe, et sort le fichier que Google Play accepte. |

Le dossier `android/` du projet est déjà prêt, icône, publicités, numéro de
version, tout est dedans. **Il ne manque que l'atelier pour fermer la boîte.**

## Avant de commencer : ce que ça demande

| | |
|---|---|
| **Temps** | 1 h à 1 h 30, dont la plus grande partie à attendre des téléchargements |
| **Espace disque** | Prévois **20 Go libres**. Android Studio et ses outils sont gros. |
| **Connexion** | Plusieurs Go à télécharger |

> Tu peux t'arrêter entre deux étapes et reprendre plus tard. Rien ne se perd.

---

# Étape 1 · Node.js

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

Tu dois voir un numéro, par exemple `v24.19.0`. **N'importe quelle version
donnée par le bouton LTS convient** : le projet demande 22.12 au minimum, et
le bouton LTS ne descend jamais en dessous. Ne cherche pas à obtenir un
numéro précis.

S'il n'y a rien, ou une erreur, ferme PowerShell et rouvre-le : les
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

# Étape 2 · Git

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

# Étape 3 · Récupérer le projet

Toujours dans PowerShell :

```powershell
cd ~\Documents
git clone https://github.com/aboubacary78-dotcom/Roiducarton.git
cd Roiducarton
git checkout claude/game-improvement-review-qpa9u1
```

Ce que font ces quatre lignes, dans l'ordre :

1. se placer dans ton dossier **Documents** ;
2. **télécharger** tout le projet depuis GitHub. ⚠️ **Compte 1,2 Go**, et
   quelques minutes. Le projet ne pèse que 103 Mo une fois posé sur le
   disque : le reste, c'est l'**historique**, c'est-à-dire toutes les
   versions successives de chaque image et de chaque son depuis le début.
   Git les rapporte toutes. Ce n'est pas une anomalie ;
3. **entrer** dans le dossier fraîchement créé ;
4. se placer sur la **branche de travail** : celle où se trouve tout ce qu'on
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

# Étape 4 · Construire le jeu

C'est ici qu'on transforme le code source en site jouable, puis qu'on le
glisse dans la boîte Android.

```powershell
pnpm install
```

### ⚠️ Si tu vois « l'exécution de scripts est désactivée sur ce système »

```
pnpm : Impossible de charger le fichier C:\Program Files\nodejs\pnpm.ps1,
car l'exécution de scripts est désactivée sur ce système.
    + FullyQualifiedErrorId : UnauthorizedAccess
```

C'est le blocage Windows le plus courant, et il n'a rien à voir avec le
projet : **Windows interdit d'origine l'exécution de tout script PowerShell**,
et `pnpm` en est un. N'importe quel outil de développement s'y heurte sur une
machine neuve.

Dans la même fenêtre, sans droits administrateur :

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Réponds **`O`** à la confirmation, puis relance `pnpm install`.

Ce que ça change exactement, parce qu'il vaut mieux le savoir que taper à
l'aveugle :

| | |
|---|---|
| `-Scope CurrentUser` | ton compte seulement, pas tout le PC |
| `RemoteSigned` | les scripts **déjà sur la machine** s'exécutent ; ceux **téléchargés d'Internet** restent bloqués s'ils ne sont pas signés |

C'est le réglage que Microsoft recommande pour développer, et il reste plus
strict que `Unrestricted`.

> **Pour ne rien modifier du tout :** taper `pnpm.cmd install` au lieu de
> `pnpm install` contourne le script PowerShell. Mais il faut alors penser au
> `.cmd` à chaque commande, `pnpm build` compris.

### La question de corepack

**Une question va probablement s'afficher :**

```
! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-10.4.1.tgz
? Do you want to continue? [Y/n]
```

Tape **`Y`** puis `Entrée`. C'est corepack qui va chercher la version exacte
de pnpm que le projet demande (elle est inscrite dans `package.json`, pour que
tout le monde construise avec la même). Ça n'arrive qu'une fois.

Ensuite, compte 2 à 5 minutes. Beaucoup de texte défile, ce sont les
bibliothèques qui se téléchargent.

> **Des lignes jaunes `WARN` sont normales** et ne demandent aucune action.
> Seul du rouge portant `ERR_` mérite qu'on s'arrête.

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

**Une dernière question s'affiche après :**

```
? Share anonymous usage data? » (Y/n)
```

Capacitor demande s'il peut collecter des statistiques d'usage anonymes. Ça
ne change **rien** au projet, ni à la compilation, ni au jeu. Réponds ce que
tu veux, `n` si tu préfères ne rien partager. Ça se change plus tard avec
`npx cap telemetry`.

## Vérifier que la configuration est intacte

```powershell
python scripts\verifie-android.py
```

Tu dois lire **8 vérifications au vert**. Si Windows te répond que `python`
n'existe pas, saute cette vérification, elle est utile, pas indispensable,
et installer Python juste pour ça n'en vaut pas la peine.

---

# Étape 5 · Android Studio

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

### ⚠️ « Please Select Gradle JVM to Import Project »

Une fenêtre apparaît presque à coup sûr sur un Android Studio récent :

```
The project's Gradle version Gradle 8.2.1 is incompatible with the
Gradle JVM version 25. To fix this, select a JVM version that is at
least 8 and at most 19.
                                    [Use JVM 17]  [Open JVM settings]
```

**Clique « Use JVM 17 ».** C'est la bonne réponse, et Android Studio la
propose lui-même.

Android Studio est livré avec un Java tout neuf (25), mais Gradle 8.2.1, la
version que Capacitor 6 emploie, ne sait travailler qu'avec Java 8 à 19.
Java 17 est la seule valeur qui satisfait les deux bouts de la chaîne :

| Contrainte | Exige |
|---|---|
| Gradle 8.2.1 | Java ≤ 19 |
| Greffon Android 8.2.1 | Java ≥ 17 |
| **→ Java 17** | les deux |

C'est aussi la version standard pour compiler sous Android, et elle est déjà
incluse dans Android Studio : rien à télécharger.

### La longue attente

En bas de la fenêtre, une barre annonce **« Gradle sync in progress »**.
Compte 5 à 20 minutes la première fois. **Attends qu'elle disparaisse**
avant de toucher à quoi que ce soit.

---

# Étape 6 · Lancer sur ton téléphone

## Préparer le téléphone

Ces réglages sont cachés exprès, c'est normal de ne pas les connaître :

1. **Paramètres** → **À propos du téléphone**
2. Trouve **Numéro de build** et **tape dessus 7 fois de suite**
3. Un message apparaît : *« Vous êtes maintenant développeur »*
4. Retourne dans **Paramètres** → **Système** → **Options pour les
   développeurs**
5. Active **Débogage USB**

### Sur un Samsung (One UI), deux différences

**Le numéro de version est un cran plus bas.** C'est
**Paramètres → À propos du téléphone → Informations sur le logiciel →
Numéro de version**. Ce sous-menu manque sur tous les tutos génériques.

**Les options de développement ne sont pas dans « Système ».** Elles
apparaissent directement **tout en bas de la liste principale** des
Paramètres.

### ⚠️ « Débogage USB · Bloqué(e) par le bloqueur automatique »

Sur Samsung, l'interrupteur peut être **grisé**, avec cette mention. Ce n'est
pas le projet : c'est **Auto Blocker**, une sécurité Samsung qui interdit à un
ordinateur branché en USB d'envoyer des commandes au téléphone.

**Paramètres → Sécurité et confidentialité → Bloqueur automatique**, puis
désactive-le. S'il propose une liste plutôt qu'un simple interrupteur, cherche
l'option qui parle de **commandes USB** : elle seule suffit.

L'interrupteur du débogage redevient alors actif.

> **Remets Auto Blocker en marche** une fois les tests finis. Il protège
> contre les commandes envoyées par un ordinateur inconnu, le risque des
> bornes de recharge publiques. Tu n'as besoin de le couper que pendant le
> développement.

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
| Le téléphone n'apparaît pas | Débranche/rebranche ; vérifie « Débogage USB » ; certains câbles ne servent qu'à charger, essaies-en un autre |
| `pnpm : n'est pas reconnu` | `corepack enable` n'a pas été fait, ou pas en administrateur (étape 1) |
| Gradle tourne sans fin | Laisse finir la première fois. Si ça dépasse 30 min, **File → Invalidate Caches → Restart** |

**Et surtout :** copie-colle le message d'erreur complet et envoie-le. Un
message d'erreur Android Studio est long et effrayant, mais il dit
précisément ce qui manque, c'est une information, pas un échec.

---

# Remettre une NOUVELLE version sur ton téléphone

Tout ce qui précède, c'est l'installation : elle ne se fait qu'une fois. Pour
récupérer les changements, il n'y a plus que **quatre lignes**, et deux d'entre
elles sont des vérifications.

### 0. Se mettre dans le bon dossier · la moitié des ratés viennent de là

Le projet est ici :

```
C:\Users\aboub\Documents\Roiducarton
```

PowerShell s'ouvre par défaut dans `C:\Users\aboub`, où il n'y a rien. Toutes
les commandes qui suivent échouent alors avec `not a git repository` ou
`ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` : c'est le même problème dit deux fois,
et il ne veut pas dire que quelque chose est cassé.

```powershell
cd $HOME\Documents\Roiducarton
```

Si le dossier a été déplacé un jour, cette ligne-ci le retrouve et y va :

```powershell
cd (gci $HOME capacitor.config.ts -r -ea 0 | % Directory | select -f 1)
```

`pwd` doit répondre un chemin qui finit par **`Roiducarton`**.

### 1. Vérifier que tu n'as rien modifié par accident

```powershell
git status
```

Si ça répond **`nothing to commit, working tree clean`**, parfait, continue.

Si ça liste des fichiers en rouge, c'est qu'Android Studio a touché quelque
chose. Range-les avant de continuer, cette commande met tes modifications de
côté sans les perdre :

```powershell
git stash
```

### 2. Récupérer la nouvelle version

```powershell
git pull origin claude/game-improvement-review-qpa9u1
```

Tu verras défiler la liste des fichiers modifiés. C'est normal, c'est bon signe.

### 3. Refabriquer le jeu et le recopier dans le projet Android

```powershell
pnpm build
npx cap sync android
```

`pnpm build` refabrique le jeu, `cap sync` le recopie dans le dossier Android.
Les deux prennent quelques secondes.

⚠️ **Ne saute jamais `cap sync`.** Sans lui, Android Studio recompile
l'ANCIENNE version : tu vas croire que rien n'a changé, alors que tout est
prêt à côté. C'est l'erreur numéro un, et elle ne produit aucun message.

### 4. Envoyer sur le téléphone

Branche le S21 en USB, puis dans **Android Studio** : le bouton **▶ Run**
(triangle vert, en haut). Il détecte le téléphone, compile et installe.

Tu n'as **pas** besoin de désinstaller l'ancienne version : elle est remplacée,
et ta partie en cours est conservée.

## Faut-il refaire `pnpm install` ?

**Seulement si les dépendances ont changé** : c'est-à-dire si le fichier
`package.json` a bougé ailleurs que sur son numéro de version. Dans le doute,
le faire ne casse rien, ça prend juste deux minutes de plus :

```powershell
pnpm install
```

Si tu vois une erreur du genre `Cannot find module`, c'est exactement ça qu'il
fallait faire.

## Ça ne marche pas ?

| Ce que tu vois | Ce que ça veut dire |
|---|---|
| `Your local changes would be overwritten` | Tu as modifié des fichiers. Fais `git stash` puis recommence le `git pull`. |
| Le jeu tourne mais **rien n'a changé** | `cap sync` a été oublié, ou Android Studio a réinstallé un ancien build. Refais l'étape 3, puis **Build → Clean Project** avant de relancer. |
| `Cannot find module` | Fais `pnpm install`, puis reprends à l'étape 3. |
| Android Studio ne voit plus le téléphone | Débranche/rebranche, et vérifie que l'écran du S21 est déverrouillé. |

---

# Ce qui vient après

Une fois que le jeu tourne sur ton téléphone, il restera :

1. **Créer une clé de signature** : l'empreinte qui prouve que l'application
   vient de toi. ⚠️ Elle est **irremplaçable** : perdue, tu ne peux plus
   jamais mettre à jour ton jeu sur le Play Store. On la fabriquera ensemble,
   et je te dirai où la garder.
2. **Fabriquer le fichier `.aab`** : le colis pour Google Play.
3. **Compte développeur Google Play** : 25 $, une seule fois.
4. **La fiche du store** : captures d'écran, description, classification.

Rien de tout ça n'est aussi long que ce guide. Le plus dur, c'est
l'installation ; elle ne se fait qu'une fois.
