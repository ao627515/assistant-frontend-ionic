# Assistant Orange Money – Frontend Ionic

Ce projet est une application mobile/web hybride développée avec **Ionic Framework** (Angular) pour interagir avec l’assistant Orange Money. Il intègre la reconnaissance vocale sur le web et le mobile (Capacitor), ainsi que l’interfaçage avec un backend Flask qui simule les opérations.

## Contexte

> Ce projet s’inscrit dans un **MVP de démonstration**. Les traitements Orange Money sont **simulés dans le backend**, aucun appel réel n’est effectué.  
> Il communique avec un backend dédié disponible ici :  
> 👉 [assistant-backend (Flask)](https://github.com/ao627515/assistant-backend)

L’objectif est d’explorer la faisabilité d’une interface vocale intuitive pour l’USSD Orange Money au Burkina Faso. L’assistant intègre également un LLM local (via Ollama) pour des interactions plus générales.

## Fonctionnalités

- Affichage des comptes : solde, crédit, internet, bonus
- Chat vocal/texte avec historique
- Lecture audio automatique des réponses (gTTS)
- Reconnaissance vocale : web (SpeechRecognition) et mobile (Capacitor SpeechRecognition)
- Thème responsive (mobile & desktop) avec mode sombre
- Actions rapides via boutons

## Installation

```bash
git clone https://github.com/ao627515/assistant-frontend-ionic.git
cd assistant-frontend-ionic
npm install
```

````

### Lancer en développement

```bash
npm start
```

Accès : [http://localhost:4200](http://localhost:4200)

## Capacitor (mobile)

```bash
npx cap add android
npx cap sync
npx cap open android
```

## Structure

```
src/
├── app/
│   ├── home/            # Page principale
│   ├── services/speech/ # Reconnaissance vocale
│   └── ...
├── assets/
├── theme/
└── environments/
```

## API attendue

L’application communique avec un backend Flask attendu à l’adresse `http://localhost:5000` :

- `GET /solde`
- `POST /process`
- `GET /audio/:audioId`

## Personnalisation

- Modifier `theme/variables.scss` pour les couleurs
- Modifier `quickActions` dans `home.page.ts`

## Dépendances clés

- `@ionic/angular`, `@capacitor/core`, `@capacitor-community/speech-recognition`
- `rxjs`, `@angular/*`

## Licence

MIT

````
