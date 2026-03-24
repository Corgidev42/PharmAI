# PharmAI

Jeu de plateau local en 2D (React, Tailwind) pour réviser des cours : circuit de 24 cases, 2 joueurs, propriétés et duels basés sur des questions (QCM / ouvertes) chargées depuis un fichier `deck.json`. Création de decks assistée par **Google Gemini** à partir de PDF.

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- Une clé API [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

## Installation

```bash
git clone https://github.com/<votre-compte>/PharmAI.git
cd PharmAI
npm install
```

## Configuration de la clé API (recommandé)

1. Copiez l’exemple d’environnement :

   ```bash
   cp .env.example .env
   ```

2. Éditez `.env` et collez votre clé :

   ```env
   VITE_GOOGLE_AI_API_KEY=votre_cle_ici
   ```

3. Redémarrez le serveur de dev après toute modification de `.env`.

En développement, la clé du `.env` préremplit le champ dans **Créer via Gemini (PDF)**. Vous pouvez aussi la saisir à la main (stockage `localStorage`).

**Sécurité :** avec Vite, les variables `VITE_*` sont incluses dans le bundle côté client. Ne publiez pas de build de production contenant une clé secrète sur un site public sans proxy serveur. Pour un usage local ou entre amis, le `.env` reste pratique.

## Lancer le projet

```bash
npm run dev
```

Ouvrez l’URL indiquée (souvent `http://localhost:5173`).

## Build production

```bash
npm run build
npm run preview
```

## Format `deck.json`

Voir `public/deck.sample.json` : champs `theme`, `cards[]` avec `id`, `type` (`QCM` | `OPEN`), `question`, `answer`, `difficulty` (1–3), et pour les QCM `options` (la réponse doit être une des options).

## Dépannage génération Gemini

- **PDF sans texte** : les PDF scannés (images) ne donnent souvent aucun texte ; utilisez un PDF avec texte sélectionnable ou un outil OCR.
- **Clé API** : vérifiez la clé sur AI Studio, les quotas et que le modèle choisi est disponible.
- **Clé restreinte aux applications web** : ajoutez l’origine exacte du dev server (ex. `http://localhost:5173`) dans la configuration de la clé.
- Les messages d’erreur détaillés s’affichent dans l’interface en cas d’échec (JSON invalide, blocage safety, etc.).

## Structure utile

- `src/game/` — logique pure (moteur, chargement deck, PDF, génération Gemini)
- `src/store/` — état Zustand
- `src/components/` — UI (plateau, modales, import, créateur de deck)

## Licence

Projet fourni tel quel pour usage personnel et pédagogique.
