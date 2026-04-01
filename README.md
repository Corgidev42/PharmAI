# PharmAI

Jeu de plateau local en 2D (React, Tailwind) pour réviser des cours : circuit de **26 cases**, 2 joueurs, propriétés et duels basés sur des questions (QCM / ouvertes). **Chaque joueur importe son propre fichier `deck.json`** : aux tours et duels où une question est tirée, c’est le **paquet du joueur actif** qui est pioché (tu peux réviser deux matières différentes en même temps). Création de decks assistée par **Google Gemini** à partir de PDF, ou génération via **NotebookLM** (voir [Manuel NotebookLM](#manuel--créer-un-deck-avec-notebooklm)).

**Dépôt :** [github.com/Corgidev42/PharmAI](https://github.com/Corgidev42/PharmAI)

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- Une clé API [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

## Installation

```bash
git clone https://github.com/Corgidev42/PharmAI.git
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

## Règles de jeu (résumé)

- **Deux decks** : à l’écran d’accueil, chaque joueur charge **son** JSON. Les questions posées pendant **le tour de Lou** viennent du deck de Lou ; celles du tour de l’autre joueur viennent de l’autre deck. Un duel utilise le deck **du joueur qui attaque** (joueur actif).
- **Decks vides** : la partie peut s’arrêter si une carte est nécessaire alors que le **deck du joueur concerné** est épuisé ; la fin « normale » est aussi quand **les deux** paquets sont épuisés ou après le nombre max de tours. Le gagnant est celui qui possède **le plus de cases** (égalité possible).
- **Retomber sur la même case** : chaque arrêt tire la **prochaine carte** du paquet du joueur actif dans l’ordre.
- **Cases spéciales** : **Départ** (+1 bonus), **Fée** (+1), **Potion** (+2), **Mégaphone** (+1), **Taxe** (−1 bonus, min. 0), **Chance** (carte la plus facile restante dans *ton* paquet ; +2 bonus si bonne réponse, pas de capture), **Nuage** (+1 bonus + rejoue), autres repos sans question, **Serpent** / **Échelle** (glissade ±2 cases). Les bonus ne décident pas la victoire « plus de cases ».

## Format `deck.json`

Même schéma pour chaque joueur. Voir `public/deck.sample.json` : champs `theme`, `cards[]` avec `id`, `type` (`QCM` | `OPEN`), `question`, `answer`, `difficulty` (1–3), et pour les QCM `options` (la réponse doit être une des options). Tu importes **deux fichiers** (ou le même en test pour les deux colonnes « Exemple »).

> **Types supportés par l’import :** `QCM` et `OPEN` uniquement (`src/game/deckLoader.js`).

Les decks versionnés dans le dépôt sont rangés par joueur : **`public/moi/`** (tes fichiers JSON) et **`public/lou/`** (ceux de Lou). L’exemple chargé par défaut à l’écran d’accueil reste **`public/deck.sample.json`** à la racine de `public/`.

## Manuel : créer un deck avec NotebookLM

Méthode pour produire un fichier JSON de révision **à partir de tes documents** (PDF, cours, notes) dans [NotebookLM](https://notebooklm.google.com/), sans passer par Gemini dans l’app.

### Quand l’utiliser

- Tu as déjà des sources structurées dans un notebook NotebookLM.
- Tu veux un **prompt figé** (40 questions + répartition des difficultés) et une sortie JSON **strictement formatée**.

### Prérequis

- Un notebook NotebookLM avec tes **sources** uploadées (documents de cours).
- Un éditeur de texte pour coller le JSON généré dans un fichier `.json` (ex. `public/moi/mon-deck.json` ou `public/lou/...`).

### Déroulé

1. **Créer ou ouvrir** un notebook et ajouter toutes les sources pertinentes (même matière / même examen si possible).
2. **Ouvrir le chat** du notebook (pas seulement les résumés audio).
3. **Coller le prompt ci‑dessous** tel quel (tu peux remplacer « mes documents sources » par une précision : ex. « focus chapitre X »).
4. **Vérifier la sortie** : un seul bloc JSON valide, sans markdown autour, sans texte avant/après.
5. **Enregistrer** le contenu dans un fichier, par exemple `public/moi/mon-deck.json` ou `public/lou/mon-deck.json`.
6. **Importer dans PharmAI** : écran d’accueil → import du deck (ou chargement par URL selon ton flux).

### Prompt à coller dans NotebookLM

```
Tu es un assistant pédagogique. Tu as accès à mes documents sources (cours, PDF, notes) dans ce notebook.

TÂCHE
Analyse cette source et produis UN deck de révision au format JSON strict, sans texte avant ni après le JSON (pas d’introduction, pas de conclusion, pas de markdown).

STRUCTURE DU JSON (obligatoire)
- Racine : un objet avec exactement deux clés : "theme" (string) et "cards" (tableau).
- Chaque élément de "cards" est un objet avec :
  - "id" : entier unique, séquentiel de 1 à 40
  - "type" : "QCM" | "OPEN"
  - "question" : string
  - "options" : tableau de strings UNIQUEMENT si type === "QCM" (exactement 4 options pour chaque QCM)
  - "answer" : string (pour QCM : la bonne option, identique à l’une des 4 options ; pour OPEN : réponse attendue courte)
  - "difficulty" : entier 1, 2 ou 3

VOLUME ET RÉPARTITION
- Total de cartes dans "cards" : 40 (uniquement "QCM" ou "OPEN")

Répartition des DIFFICULTÉS :
- 15 cartes en difficulty 1 (facile)
- 15 cartes en difficulty 2 (moyen)
- 10 cartes en difficulty 3 (difficile)

RÉPARTITION QCM / OPEN
- Environ 60 % QCM et 40 % OPEN (arrondis pour que le total fasse 40).

CONTENU PÉDAGOGIQUE
- Tout le contenu des questions/réponses doit être dérivé des thèmes et faits présents dans mes sources ; ne pas inventer de hors-sujet.
- QCM : les 3 mauvaises réponses (distracteurs) doivent être plausibles et proches du sujet (erreurs classiques, confusions de cours), pas absurdes.
- OPEN : "answer" au plus 2 phrases, style réponse attendue en oral ou à l’examen court.

EXEMPLE DE FORME (à imiter strictement pour la structure, pas le contenu) :
{
  "theme": "Titre du thème",
  "cards": [
    {
      "id": 1,
      "type": "QCM",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": "...",
      "difficulty": 1
    },
    {
      "id": 2,
      "type": "OPEN",
      "question": "...",
      "answer": "...",
      "difficulty": 2
    }
  ]
}

CONTRAINTES FINALES
- Un seul bloc de sortie : le JSON complet, valide, syntaxiquement correct.
- Pas de commentaires JSON, pas de virgule en trop.
- Vérifie avant envoi : exactement 40 cartes (QCM/OPEN) avec la répartition des difficultés indiquée ; ids 1 à 40 sans doublon.
```

### Après génération (contrôle rapide)

- Le fichier doit commencer par `{` et se terminer par `}`.
- Compter les cartes `QCM` + `OPEN` : **40**, avec **15×** `difficulty: 1`, **15×** `difficulty: 2`, **10×** `difficulty: 3` pour ces types.
- Chaque **QCM** : exactement **4** options, et `answer` **égale** l’une des quatre.
- Chaque **OPEN** : pas de clé `options`.

### Dépannage NotebookLM

- **Sortie avec du texte autour du JSON** : demander « Renvoie uniquement le JSON, sans markdown ni explication ».
- **JSON invalide** : demander « Corrige les guillemets et virgules, renvoie le JSON complet valide ».
- **Import PharmAI qui échoue** : retirer les types non reconnus jusqu’à ce que seuls `QCM` et `OPEN` restent.

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
