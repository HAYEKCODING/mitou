# Déploiement — Render (backend) et Vercel (frontend)

Ce dépôt contient une API Node/Express dans `backend/` et une application React/Vite dans `Frontend/`.

**Résumé rapide**
- Backend (Node) : déployez sur Render (Web Service) — ou en Docker.
- Frontend (Vite) : déployez sur Vercel (Project pointé sur `Frontend/`).

**Variables d'environnement requises (backend)**
- `DB_HOST` `DB_USER` `DB_PASSWORD` `DB_NAME`
- `JWT_SECRET`

-- Backend (Render) --

Option A — utiliser le Dockerfile (recommandé si vous voulez conserver l'image):
1. Créez un nouveau service Web sur Render.
2. Choisissez « Docker » et pointez sur le Dockerfile dans `backend/Dockerfile`.
3. Définissez les variables d'environnement listées ci-dessus dans le dashboard Render.
4. Render construira l'image et exécutera le conteneur. Le serveur écoute sur `process.env.PORT`.

Option B — utiliser l'environnement Node (sans Docker):
1. Créez un nouveau service Web sur Render.
2. Pour le root du service, choisissez le dossier `backend` du repo.
3. Build command: `npm ci` (ou vide si Render détecte automatiquement).
4. Start command: `npm start` (le script `start` lance `node server.js`).
5. Ajoutez les variables d'environnement dans le dashboard.

Remarques:
- Si vous devez initialiser la base (schéma), exécutez `npm run init-db` localement ou via un job ponctuel sur Render en fournissant un accès MySQL.

-- Frontend (Vercel) --

1. Créez un nouveau projet sur Vercel en liant votre dépôt, choisissez le répertoire `Frontend/` comme racine du projet.
2. Build command: `npm run build`.
3. Output Directory: `dist`.
4. Ajoutez la variable d'environnement `VITE_API_URL` (par ex. `https://mon-backend.onrender.com/api`) dans les Settings de Vercel — cela sera accessible dans le frontend via `import.meta.env.VITE_API_URL`.

Fichier `Frontend/vercel.json` inclus: il configure la build statique et propose une réécriture pour `/api/*` vers votre backend Render — remplacez `<RENDER_BACKEND_URL>` par l'URL de votre service Render.

-- Tester localement --

Backend:

```bash
cd backend
npm ci
# (optionnel) initialiser la DB
npm run init-db
npm start
```

Frontend:

```bash
cd Frontend
npm ci
# définir VITE_API_URL si besoin:
# Windows PowerShell
$env:VITE_API_URL = "http://localhost:5000/api"
npm run dev
# ou build pour tester la production
npm run build
npm run preview
```

-- Notes finales --
- Le backend utilise `process.env.PORT` (déjà en place) — nécessaire pour Render.
- Configurez correctement les variables d'environnement et la base MySQL (Render propose des services DB ou vous pouvez utiliser un service externe).
- Si vous souhaitez que Vercel serve également l'API (fonctions serverless), il faudrait refactoriser le backend en fonctions compatibles Vercel — ici la séparation frontend/backend est recommandée (Vercel front, Render API).

Si vous voulez, j'ajoute un `render.yaml` prêt à l'emploi ou j'automatise la CI/CD pour ces déploiements.