# PharmAI

Jeu de plateau local en 2D (React, Tailwind) pour réviser des cours : plateau **100 cases** (parcours serpentin), 2 joueurs, propriétés et duels basés sur des questions (QCM / ouvertes). **Chaque joueur importe son propre fichier `deck.json`** : aux tours et duels où une question est tirée, c’est le **paquet du joueur actif** qui est pioché (tu peux réviser deux matières différentes en même temps). Création de decks assistée par **Google Gemini** à partir de PDF, ou génération via **NotebookLM** (voir [Manuel NotebookLM](#manuel--créer-un-deck-avec-notebooklm)).

Sur **téléphone**, l’interface est pensée pour le **portrait** (plateau en haut) et le **paysage** (panneau scores + dé à gauche, plateau à droite, comme sur un grand écran).

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

### Accès depuis un autre appareil (même Wi‑Fi)

Le fichier `vite.config.js` configure **`server.host: true`** : un simple `npm run dev` expose déjà l’app sur le réseau local. Ouvre **`http://<IP_DE_TON_PC>:5173`** (le port **5173** est celui de Vite, pas 8080).

La variante explicite reste disponible :

```bash
npm run dev:host
```

**Docker** sert la même app sur le port défini par **`PHARMAI_PORT`** (souvent **8080**) : `http://<IP>:8080` après `make up`. Ce n’est **pas** le même port que le dev Vite — si tu testes 8080 alors que seul `npm run dev` tourne, rien ne répond (ou autre service).

- **macOS / Linux :** `ip a` ou `ifconfig` pour voir l’IP (souvent `192.168.x.x` ou `10.x.x.x`).
- **Windows :** `ipconfig` (carte Wi‑Fi ou Ethernet active).
- **Pare-feu :** autorise le port **5173** (TCP) entrant pour Node/Vite si la page ne charge pas.
- **Clé API Gemini** : si tu restreins la clé par origine HTTP, ajoute aussi `http://192.168.x.x:5173` dans Google AI Studio.

## Build production

```bash
npm run build
npm run preview
```

Prévisualisation accessible sur le réseau local :

```bash
npm run preview:host
```

## Docker (nginx + accès téléphone sur le port du PC)

Image multi‑étapes : build **Vite** puis fichiers statiques servis par **nginx** sur le port **80** du conteneur, mappé sur un port de ta machine (par défaut **8080**).

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose v2

### Construire et lancer

```bash
docker compose up --build
```

L’app est disponible sur **ce PC** : [http://localhost:8080](http://localhost:8080) (ou le port défini par `PHARMAI_PORT`).

Depuis le **téléphone** (même Wi‑Fi) : `http://<IP_DE_TON_PC>:8080`.

Variables utiles (fichier **`.env`** à la racine du projet, lu par Compose, **ne pas commiter**) :

```env
PHARMAI_PORT=8080
VITE_GOOGLE_AI_API_KEY=ta_cle_optionnelle
```

- **`PHARMAI_PORT`** : port sur **ton ordinateur** (hôte). Dans `docker-compose.yml`, le mapping est `0.0.0.0:PHARMAI_PORT:80` : **80** = nginx **dans** le conteneur ; **PHARMAI_PORT** = ce que tu ouvres en local et sur le téléphone (souvent **8080**). Le préfixe **`0.0.0.0`** force l’écoute sur **toutes les interfaces** du PC (LAN), pas seulement localhost.

La clé `VITE_GOOGLE_AI_API_KEY` est passée **au moment du build** de l’image ; sans elle, tu peux toujours saisir la clé dans l’interface. Pour reconstruire après changement de clé :

```bash
docker compose build --no-cache
docker compose up
```

### Où « exposer » le port pour le téléphone ?

1. **Choisir le port** : dans `.env`, `PHARMAI_PORT=8080` (ou autre, ex. `3000`). Redémarre : `docker compose up -d --build` si tu changes le mapping.
2. **Même réseau** : le téléphone et le PC doivent être sur le **même Wi‑Fi** (pas le réseau invité isolé).
3. **Adresse à saisir sur le téléphone** : `http://` + **IP locale du PC** + `:` + **port**  
   Ex. `http://192.168.1.42:8080` — l’IP se trouve avec `ipconfig` (Windows), **Réglages système → Réseau → Wi‑Fi → Détails** (macOS), ou `ip a` / `hostname -I` (Linux).
4. **Pare-feu sur le PC** : autoriser le trafic **TCP entrant** sur ce port (ex. **8080**).
   - **Windows** : Panneau de configuration → Pare-feu → Règles de trafic entrant → Nouvelle règle → TCP → port 8080 → Autoriser.
   - **macOS** : si le pare-feu bloque, autorise **Docker** ou **docker-proxy**, ou ajoute une règle pour le port utilisé.
   - **Linux** : `sudo ufw allow 8080/tcp` puis `sudo ufw reload` (si UFW est actif).
5. **Docker Desktop** : en général le `ports:` de Compose suffit ; si rien n’écoute de l’extérieur, vérifie surtout le pare-feu **OS** et que tu utilises l’**IP du PC sur le LAN**, pas `127.0.0.1` depuis le téléphone.

### IP « publique » : pourquoi ça ne marche souvent pas comme le Wi‑Fi

Sur le **même réseau local** (Wi‑Fi), `http://192.168.x.x:8080` fonctionne car tout est dans ton LAN.

Pour ouvrir l’app depuis **Internet** avec ton **IP publique** (`http://x.x.x.x:8080`), il faut en plus :

1. **Redirection de ports (NAT)** sur ta **box** : règle du type « port WAN 8080 → IP LAN du PC:8080 » (TCP). Sans ça, le routeur ne sait pas à quel appareil envoyer le trafic.
2. **Pare-feu** du PC (et parfois de la box) ouvert sur ce port.
3. **CGNAT** : beaucoup de FAI n’attribuent **pas** d’IPv4 publique joignable en entrée (adresse « partagée »). Dans ce cas, **aucun port forwarding ne suffit** pour l’IPv4 ; il faudrait une **IPv6** exposée, ou un **tunnel**.

**Alternatives simples** sans gérer la box :

- **[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)** (gratuit) ou **[ngrok](https://ngrok.com/)** : tu obtiens une URL HTTPS temporaire qui pointe vers ton `localhost:8080`.
- **VPN** (Tailscale, ZeroTier, WireGuard) : tes appareils ont des IP virtuelles stables sur un réseau privé — pratique pour jouer sans exposer un service sur Internet.

**Sécurité** : exposer nginx + l’app React sur Internet ouvre ta machine aux scans ; préfère un tunnel ou un VPN pour un usage perso.

### Arrêter

```bash
docker compose down
```

### Makefile (raccourcis Docker)

Le fichier `Makefile` pilote **uniquement** Docker Compose : `make up` (démarre en arrière-plan), `make down`, `make logs`, `make rebuild`, etc. — voir `make help`.

## Règles de jeu (résumé)

- **Deux decks** : à l’écran d’accueil, chaque joueur charge **son** JSON. Les questions du tour viennent du **deck du joueur actif** ; un duel utilise le deck **de l’attaquant** (joueur actif).
- **Plateau** : parcours **1 → 100** en serpentin (jeu de l’oie) ; **échelles** et **serpents** déplacent selon les liaisons du plateau.
- **Decks vides / fin** : la partie peut s’arrêter si une carte est nécessaire alors que le deck concerné est épuisé ; fin aussi quand **les deux** paquets sont épuisés ou après le **nombre max de tours**. Le gagnant est celui qui possède **le plus de cases** (égalité possible).
- **Cases spéciales** : **Départ** et **Arrivée** (100) avec bonus ; **Serpents** / **Échelles** avec animation le long du ruban. Les bonus ne décident pas seuls la victoire (priorité au nombre de cases possédées).

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
  - "explanation" : string (recommandé — 1 à 3 phrases : pourquoi la bonne réponse est correcte ; affichée après une mauvaise réponse)
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
      "explanation": "...",
      "difficulty": 1
    },
    {
      "id": 2,
      "type": "OPEN",
      "question": "...",
      "answer": "...",
      "explanation": "...",
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
- `Dockerfile` / `docker-compose.yml` / `nginx.conf` — image statique + reverse minimal pour jeu sur le réseau local

## Fonctionnalités récentes (révision)

- Après une **mauvaise réponse**, la modale affiche la **réponse attendue** et, si le deck la contient, une **explication** (`explanation` dans le JSON).
- Les **options QCM** sont **mélangées** à l’affichage (ordre déterministe par carte, pas toujours la même case « correcte »).
- Génération **Gemini** / prompts **NotebookLM** : inclure systématiquement `"explanation"` sur chaque carte (voir `prompt.txt` et `prompt copy.txt`).
- Script : `node scripts/fill-deck-explanations.mjs` — complète les cartes sans `explanation` avec un texte générique (à affiner à la main ou via une nouvelle génération).


## Licence

Projet fourni tel quel pour usage personnel et pédagogique.
