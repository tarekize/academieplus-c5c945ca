# AcadémiePlus — Application mobile (Capacitor)

Ce dossier contient la configuration Capacitor qui transforme l'application web
(React + Vite, à la racine du repo) en application mobile native Android / iOS.
Capacitor ne réécrit rien : il embarque le build web (`dist/`) dans une coquille
native et donne accès aux API du téléphone (status bar, splash screen, etc.).

**Important** : toutes les commandes `npx cap ...` doivent être lancées **depuis
ce dossier** (`application_mobile/`), pas depuis la racine du repo — c'est ici
que se trouve `capacitor.config.ts`, et les dossiers natifs `android/`/`ios/`
seront créés ici.

Ces commandes doivent être exécutées **sur ta machine locale** (pas dans cet
environnement cloud) puisqu'elles ont besoin d'accéder à ton registre npm, à
Android Studio / Xcode, et à ton téléphone branché en USB.

## 1. Prérequis

- **Node.js** 18+ et npm installés.
- **Pour Android** : [Android Studio](https://developer.android.com/studio)
  installé (il installe le SDK Android et les Platform Tools / `adb` dont on a
  besoin pour le USB).
- **Pour iOS** : un Mac avec Xcode installé (obligatoire, Apple ne permet pas de
  builder iOS ailleurs) + un compte développeur Apple pour signer l'app sur un
  vrai iPhone.
- Ton téléphone Android : active le **mode développeur** puis le **débogage
  USB** (Paramètres → À propos du téléphone → tape 7 fois sur "Numéro de
  build", puis Paramètres → Options pour développeurs → Débogage USB).

## 2. Installation (une seule fois)

Depuis la **racine du repo** :

```bash
npm install
```

Cela installe aussi `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`,
`@capacitor/ios` (déjà ajoutés à `package.json`).

## 3. Créer le projet natif (une seule fois par plateforme)

```bash
npm run cap:add:android
# et/ou
npm run cap:add:ios
```

Ça build l'app web puis crée `application_mobile/android` (et/ou `ios/`) — le
vrai projet Android Studio / Xcode. Ce dossier est volumineux (projet natif
complet) : commite-le si tu veux versionner l'app native, ou ajoute-le à
`.gitignore` si tu préfères le régénérer à chaque poste.

## 4. Lancer sur ton téléphone via câble USB (Android)

1. Branche le téléphone en USB, autorise le débogage USB si une popup
   apparaît sur l'écran du téléphone (case à cocher "toujours autoriser").
2. Vérifie que ton téléphone est bien détecté :
   ```bash
   adb devices
   ```
   Tu dois voir ton appareil listé avec le statut `device` (pas `unauthorized`).
3. Depuis la racine du repo :
   ```bash
   npm run cap:run:android
   ```
   Cette commande : build le web (`vite build`) → copie le build dans le
   projet natif (`cap sync`) → compile l'APK → l'installe et la lance
   directement sur ton téléphone branché.

Alternative si tu préfères passer par l'IDE (utile pour voir les logs /
déboguer) :
```bash
npm run cap:open:android
```
Ça ouvre Android Studio sur le projet ; choisis ton téléphone dans la liste des
appareils en haut puis clique sur ▶️ Run.

## 5. Lancer sur iPhone via câble USB (Mac uniquement)

```bash
npm run cap:run:ios
```
ou
```bash
npm run cap:open:ios
```
(ouvre Xcode — sélectionne ton iPhone comme device cible, signe l'app avec ton
compte développeur dans l'onglet "Signing & Capabilities", puis ▶️ Run.)

## 6. Après chaque modification du code

Chaque fois que tu modifies le code web et veux revoir le résultat sur le
téléphone :
```bash
npm run cap:sync
```
puis relance `npm run cap:run:android` (ou rebuild depuis Android
Studio/Xcode).

## 7. Rechargement à chaud pendant le développement (optionnel)

Pour éviter de reconstruire à chaque changement, tu peux pointer l'app mobile
vers ton serveur Vite local (ton téléphone et ton ordinateur doivent être sur
le même réseau Wi-Fi) :

1. Lance `npm run dev` à la racine (note l'IP locale affichée, ex.
   `192.168.1.50:8081`).
2. Dans `application_mobile/capacitor.config.ts`, décommente et renseigne :
   ```ts
   server: {
     url: "http://192.168.1.50:8081",
     cleartext: true,
   },
   ```
3. `npm run cap:sync` puis relance l'app — elle chargera en direct depuis ton
   serveur Vite (hot reload inclus). Repasse en commentaire avant de builder
   une version de production.

## Dépannage

- `adb devices` n'affiche rien : câble USB de données (pas juste charge),
  pilotes USB du téléphone installés, débogage USB bien activé.
- Erreur Gradle au build Android : ouvre `application_mobile/android` dans
  Android Studio une première fois pour qu'il télécharge les dépendances
  Gradle manquantes.
- Écran blanc au lancement : vérifie que `npm run build` a bien été exécuté
  avant `npx cap sync` (le dossier `dist/` à la racine doit exister et être à
  jour).
