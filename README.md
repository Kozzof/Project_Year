# SUPCONTENT

SUPCONTENT est un réseau social consacré aux films et séries. Il permet de rechercher des œuvres via TMDB, gérer une bibliothèque personnelle, créer des listes, publier des critiques, suivre d’autres utilisateurs et recevoir des notifications.

## Architecture

```text
supcontent/
├── backend/   API REST Express + Prisma
├── web/       Client React + Vite
├── mobile/    Client Expo React Native
├── docs/      Documentation technique et manuel utilisateur
└── docker-compose.yml
```

Les clients web et mobile consomment uniquement le backend. Ils ne contactent jamais directement TMDB.

## Prérequis

- Docker ;
- Docker Compose ;
- une clé API TMDB v4 Read Access Token.

## Configuration

Copier le fichier d’exemple :

```bash
cp .env.example .env
```

Renseigner au minimum :

```env
POSTGRES_PASSWORD=replace_me_database_password
DATABASE_URL=postgresql://supcontent:replace_me_database_password@db:5432/supcontent?schema=public
JWT_SECRET=replace_me_with_a_long_random_secret
TMDB_API_TOKEN=replace_me_with_tmdb_v4_read_access_token
```

Aucun secret réel ne doit être commité ou placé en clair dans le code.

## Lancement Docker

Depuis la racine du projet :

```bash
docker compose up --build
```

Accès :

```text
Web      : http://localhost:8080
Backend  : http://localhost:4000/api/health
Database : localhost:5432
```

## Développement local

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Pour le développement local hors Docker, adapter `DATABASE_URL` avec `localhost` au lieu de `db`.

### Web

```bash
cd web
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Sur téléphone physique, utiliser l’adresse IP locale de la machine dans `EXPO_PUBLIC_API_URL`.

## Fonctionnalités principales

- inscription et connexion email/mot de passe ;
- OAuth GitHub côté web ;
- déconnexion sécurisée avec invalidation de token ;
- recherche TMDB via backend ;
- filtres type, année et tri ;
- recherche unifiée médias/utilisateurs/listes publiques ;
- cache local des fiches médias ;
- bibliothèque avec statuts ;
- listes personnalisées publiques ou privées ;
- notes et critiques ;
- modification/suppression de ses critiques ;
- likes et commentaires ;
- signalements ;
- follow/unfollow ;
- fil d’actualité ;
- notifications avec polling ;
- paramètres utilisateur ;
- export JSON/CSV ;
- modération admin ;
- messagerie privée entre utilisateurs qui se suivent mutuellement.

## Documentation

- `docs/documentation-technique.md`
- `docs/manuel-utilisateur.md`
- `docs/checklist-tests-manuels.md`

## Sécurité

- mots de passe hashés avec bcrypt ;
- JWT signé ;
- invalidation de session via `tokenVersion` ;
- routes protégées par middleware ;
- rôles utilisateur/admin ;
- `.env` ignoré par Git ;
- aucun secret réel dans le dépôt.
