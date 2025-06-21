# Assistant Frontend Ionic

Ce projet est une application frontend développée avec [Ionic Framework](https://ionicframework.com/) et [Angular](https://angular.io/), intégrant la reconnaissance vocale (web et mobile via Capacitor) pour interagir avec un assistant Orange Money. L'application permet d'afficher le solde, l'historique, de recharger du crédit, de gérer les forfaits internet, et d'utiliser des commandes vocales ou textuelles.

## Fonctionnalités principales

- **Affichage des comptes** : solde principal, crédit communication, internet, bonus fidélité.
- **Chat avec l'assistant** : historique des messages, réponses textuelles et audio.
- **Reconnaissance vocale** : support web (SpeechRecognition) et mobile (Capacitor SpeechRecognition).
- **Actions rapides** : boutons pour les requêtes fréquentes.
- **Lecture audio** : les réponses de l'assistant peuvent être écoutées.
- **Design responsive** : adapté mobile et desktop, avec support du mode sombre.

## Structure du projet

```
src/
  app/
    home/
      home.page.ts        // Logique principale de la page d'accueil
      home.page.html      // Template de la page d'accueil
      home.page.scss      // Styles de la page d'accueil
      ...
    services/
      speech/
        speech.service.ts // Service de reconnaissance vocale (web & mobile)
    app.module.ts         // Module principal Angular
    app-routing.module.ts // Routing principal
    ...
  assets/                 // Images, icônes, etc.
  environments/           // Fichiers d'environnement Angular
  theme/variables.scss    // Variables de thème (couleurs, etc.)
  global.scss             // Styles globaux
```

## Installation

1. **Cloner le dépôt**

```sh
git clone <url-du-repo>
cd assistant-frontend-ionic
```

2. **Installer les dépendances**

```sh
npm install
```

3. **Lancer l'application en développement**

```sh
npm start
```

L'application sera accessible sur [http://localhost:4200](http://localhost:4200).

## Tests

Pour lancer les tests unitaires :

```sh
npm test
```

## Configuration Capacitor (mobile)

Pour utiliser la reconnaissance vocale sur mobile :

1. Installer les plateformes nécessaires :

```sh
npx cap add android
npx cap add ios
```

2. Synchroniser les plugins Capacitor :

```sh
npx cap sync
```

3. Ouvrir le projet dans Android Studio ou Xcode :

```sh
npx cap open android
npx cap open ios
```

## API Backend

L'application attend un backend accessible sur `http://localhost:5000` avec les endpoints suivants :

- `GET /solde` : retourne les informations de solde.
- `POST /process` : traite une requête utilisateur et retourne la réponse de l'assistant (texte + audio_id).
- `GET /audio/:audioId` : retourne le fichier audio correspondant à la réponse.

## Personnalisation

- **Thème** : modifiez `src/theme/variables.scss` pour adapter les couleurs.
- **Actions rapides** : modifiez le tableau `quickActions` dans [`HomePage`](src/app/home/home.page.ts) pour ajouter/retirer des actions.

## Dépendances principales

- `@ionic/angular`
- `@capacitor/core`
- `@capacitor-community/speech-recognition`
- `@angular/*`
- `rxjs`

## Licence

Projet sous licence MIT (à adapter selon votre besoin).

---

> \_Ce projet a été généré avec Ionic et Angular. Pour plus d'informations, consultez la documentation
