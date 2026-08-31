# À lire avant de publier · deux points trouvés dans le code

En relevant ce que l'application fait réellement pour rédiger le prompt de la
politique de confidentialité, deux manques sont apparus. **Ils ne concernent
pas la page à écrire, mais le code**, et ils bloqueraient une publication.

## 1. Le consentement publicitaire européen n'est jamais demandé

Le module `@capacitor-community/admob` fournit l'API de consentement (UMP), et
`client/src/lib/ads.ts` ne l'appelle nulle part. Google exige depuis janvier
2024 une plateforme de consentement certifiée pour diffuser des publicités aux
utilisateurs de l'Espace économique européen et du Royaume-Uni.

Conséquence : tel quel, la politique de confidentialité ne peut pas annoncer
qu'un consentement est recueilli, puisqu'il ne l'est pas.

## 2. iOS ne demande pas l'autorisation de suivi

Le même module expose `trackingAuthorizationStatus()`, jamais appelé non plus.
Sur iOS, la publicité personnalisée suppose l'accord préalable de l'utilisateur
via App Tracking Transparency. Sans cette demande, Apple peut refuser
l'application au moment de la revue.

## Ce que ça implique

Ce sont des points à trancher avant publication, pas des bugs. Deux chemins :

- **le plus simple** : ne diffuser que de la publicité non personnalisée, ce
  qui allège les obligations, mais rapporte moins ;
- **le plus complet** : brancher la demande de consentement UMP et la demande
  iOS, puis n'activer la personnalisation que si l'utilisateur accepte.

Dans les deux cas, la politique de confidentialité devra décrire ce qui est
réellement mis en place. Il vaut donc mieux décider d'abord, écrire ensuite.

**Je ne suis pas juriste** : ces deux points viennent de la documentation de
Google et d'Apple, pas d'un avis juridique. Une relecture par quelqu'un dont
c'est le métier reste souhaitable avant mise en ligne.

## Rappel du troisième blocage, déjà connu

`USE_TEST_ADS = true` dans `client/src/lib/ads.ts` : les publicités sont en
mode test. Publier ainsi ne rapporte rien, et publier de vrais identifiants en
mode test peut faire bannir le compte AdMob.
