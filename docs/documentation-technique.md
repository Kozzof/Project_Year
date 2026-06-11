# Documentation technique — SUPCONTENT

## 1. Présentation

SUPCONTENT est un réseau social de niche consacré aux films et séries. L’application permet de découvrir des œuvres via l’API TMDB, de gérer une bibliothèque personnelle, de rédiger des critiques, de suivre d’autres utilisateurs, de consulter un fil d’actualité et de recevoir des notifications.

Le projet est composé de trois briques principales :

- une API REST backend ;
- une application web ;
- une application mobile ;
- une base de données PostgreSQL.

Les clients web et mobile ne contactent jamais directement TMDB. Toute interaction avec TMDB passe par le backend, qui joue le rôle d’interface, de couche métier et de cache.

## 2. Choix technologiques

### 2.1 Backend

- **Node.js** : environnement JavaScript/TypeScript mature et adapté aux API REST.
- **Express** : framework léger pour exposer rapidement des routes HTTP.
- **TypeScript** : typage statique pour améliorer la maintenabilité.
- **Prisma** : ORM moderne, lisible, avec schéma de base de données centralisé.
- **PostgreSQL** : base relationnelle robuste, adaptée aux relations utilisateurs, follows, critiques et collections.
- **JWT** : authentification stateless côté API.
- **bcryptjs** : hash sécurisé des mots de passe.
- **Zod** : validation des entrées côté serveur.

### 2.2 Client web

- **React** : bibliothèque adaptée aux interfaces interactives.
- **Vite** : environnement de développement rapide et build simple.
- **React Router** : navigation entre pages.
- **CSS natif** : charte graphique légère, sans dépendance UI lourde.

### 2.3 Client mobile

- **React Native** : mutualisation des concepts React côté mobile.
- **Expo** : simplifie le lancement et les tests sur Android/iOS.
- **expo-secure-store** : stockage local sécurisé du token JWT.

### 2.4 API tierce

- **TMDB** : API riche pour les films et séries : recherche, synopsis, affiches, genres, casting, dates et métadonnées détaillées.

## 3. Architecture générale

```mermaid
flowchart LR
    Web[Client Web React] --> API[Backend Express REST]
    Mobile[Client Mobile Expo] --> API
    API --> DB[(PostgreSQL)]
    API --> TMDB[API TMDB]
```

Le backend centralise :

- l’authentification ;
- la logique métier ;
- les règles de sécurité ;
- l’accès à la base locale ;
- les appels à TMDB ;
- la stratégie de cache.

## 4. Structure du projet

```text
supcontent/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/app.ts
│   ├── src/server.ts
│   ├── src/routes/
│   ├── src/services/
│   ├── src/middlewares/
│   └── Dockerfile
├── web/
│   ├── src/pages/
│   ├── src/components/
│   ├── src/context/
│   └── Dockerfile
├── mobile/
│   ├── App.tsx
│   └── src/screens/
├── docs/
│   ├── documentation-technique.md
│   └── manuel-utilisateur.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. Prérequis

Pour le déploiement Docker :

- Docker ;
- Docker Compose ;
- une clé API TMDB v4.

Pour le développement local hors Docker :

- Node.js 20 ou supérieur ;
- npm ;
- PostgreSQL ;
- Expo CLI ou `npx expo` pour le mobile.

## 6. Obtenir une clé API TMDB

1. Créer un compte sur TMDB.
2. Aller dans les paramètres du compte.
3. Ouvrir la section API.
4. Demander une clé API.
5. Copier le **Read Access Token v4**.
6. Renseigner cette valeur dans `.env` :

```env
TMDB_API_TOKEN=replace_me_with_tmdb_v4_read_access_token
```

Aucune clé réelle ne doit être écrite directement dans le code source.

## 7. Variables d’environnement

Le fichier `.env.example` sert de modèle. Le fichier `.env` réel ne doit pas être versionné.

Variables principales :

```env
NODE_ENV=development
PORT=4000
API_PUBLIC_URL=http://localhost:4000
WEB_PUBLIC_URL=http://localhost:8080
POSTGRES_DB=supcontent
POSTGRES_USER=supcontent
POSTGRES_PASSWORD=replace_me_database_password
DATABASE_URL=postgresql://supcontent:replace_me_database_password@db:5432/supcontent?schema=public
JWT_SECRET=replace_me_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
TMDB_API_TOKEN=replace_me_with_tmdb_v4_read_access_token
TMDB_CACHE_TTL_MINUTES=1440
```

Les secrets obligatoires sont :

- `POSTGRES_PASSWORD` ;
- `DATABASE_URL` ;
- `JWT_SECRET` ;
- `TMDB_API_TOKEN`.

## 8. Installation et lancement avec Docker

Depuis la racine du projet :

```bash
cp .env.example .env
```

Modifier ensuite `.env` avec des valeurs locales valides.

Lancer l’application :

```bash
docker compose up --build
```

Services exposés :

```text
Web       : http://localhost:8080
Backend   : http://localhost:4000/api/health
PostgreSQL: localhost:5432
```

Le `docker-compose.yml` lance :

- `db` : PostgreSQL ;
- `backend` : API Express ;
- `web` : build React servi par Nginx.

Au démarrage du backend, Prisma applique le schéma avec :

```bash
npx prisma db push
```

## 9. Installation en développement local

### 9.1 Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Pour un lancement local hors Docker, `DATABASE_URL` doit pointer vers `localhost` au lieu du nom de service Docker `db`.

Exemple :

```env
DATABASE_URL=postgresql://supcontent:motdepasse@localhost:5432/supcontent?schema=public
```

### 9.2 Web

```bash
cd web
npm install
npm run dev
```

L’application web est disponible par défaut sur :

```text
http://localhost:5173
```

### 9.3 Mobile

```bash
cd mobile
npm install
npx expo start
```

Pour tester sur un téléphone physique, définir :

```env
EXPO_PUBLIC_API_URL=http://ADRESSE_IP_LOCALE:4000/api
```

## 10. Modèle de données

```mermaid
erDiagram
    User ||--o{ CollectionEntry : owns
    User ||--o{ CustomList : creates
    User ||--o{ Review : writes
    User ||--o{ ReviewLike : likes
    User ||--o{ ReviewComment : comments
    User ||--o{ Notification : receives
    User ||--o{ Activity : creates
    User ||--o{ Report : sends
    User ||--o{ DirectMessage : sends
    User ||--o{ DirectMessage : receives
    User ||--o{ Follow : follower
    User ||--o{ Follow : following

    Media ||--o{ CollectionEntry : appears_in
    Media ||--o{ CustomListItem : appears_in
    Media ||--o{ Review : reviewed_by
    Media ||--o{ Activity : referenced_by

    CustomList ||--o{ CustomListItem : contains
    Review ||--o{ ReviewLike : has
    Review ||--o{ ReviewComment : has
    Review ||--o{ Report : reported_by
    Review ||--o{ Activity : referenced_by
```

### Tables principales

| Table | Rôle |
|---|---|
| `User` | comptes utilisateurs, rôle, profil, préférences |
| `Media` | cache local des métadonnées TMDB |
| `CollectionEntry` | bibliothèque personnelle avec statut |
| `CustomList` | listes personnalisées publiques ou privées |
| `CustomListItem` | œuvres présentes dans une liste |
| `Review` | critique et note d’un utilisateur |
| `ReviewLike` | likes sur les critiques |
| `ReviewComment` | commentaires sous les critiques |
| `Follow` | relation d’abonnement entre utilisateurs |
| `Notification` | notifications utilisateur |
| `Activity` | événements du fil d’actualité |
| `Report` | signalements de critiques |
| `DirectMessage` | messages privés |

## 11. Authentification et sécurité

### 11.1 Inscription

L’inscription vérifie :

- format email ;
- nom public de taille minimale ;
- mot de passe de 8 caractères minimum ;
- présence d’une majuscule ;
- présence d’une minuscule ;
- présence d’un chiffre.

Le mot de passe n’est jamais stocké en clair. Il est hashé avec bcrypt.

### 11.2 Connexion

La connexion retourne :

- les informations publiques de l’utilisateur ;
- un token JWT signé.

Le token contient :

- l’identifiant utilisateur ;
- la version de session `tokenVersion`.

### 11.3 Déconnexion sécurisée

La déconnexion incrémente `tokenVersion`. Les anciens tokens deviennent invalides côté backend.

### 11.4 Comptes bannis

Un utilisateur banni ne peut plus se connecter ni utiliser les routes protégées.

### 11.5 OAuth GitHub

Le backend fournit :

- une route générant l’URL OAuth GitHub ;
- une route callback ;
- la création automatique du compte local à la première connexion OAuth.

Variables nécessaires :

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/oauth/github/callback
```

## 12. Routes API principales

### Authentification

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | inscription |
| POST | `/api/auth/login` | connexion |
| GET | `/api/auth/me` | utilisateur connecté |
| POST | `/api/auth/logout` | déconnexion avec invalidation |
| GET | `/api/auth/oauth/github/url` | URL OAuth GitHub |
| GET | `/api/auth/oauth/github/callback` | callback OAuth GitHub |

### Médias et recherche

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/media/search` | recherche TMDB avec filtres |
| GET | `/api/media/global` | recherche unifiée : médias, utilisateurs, listes publiques |
| GET | `/api/media/:type/:tmdbId` | fiche détaillée avec cache local |

### Collections et listes

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/collections/me/library` | bibliothèque de l’utilisateur |
| POST | `/api/collections/me/library` | ajout ou changement de statut |
| DELETE | `/api/collections/me/library/:mediaId` | retrait de la bibliothèque |
| GET | `/api/collections/me/stats` | statistiques personnelles |
| GET | `/api/collections/me/lists` | listes personnelles |
| POST | `/api/collections/me/lists` | création de liste |
| PATCH | `/api/collections/me/lists/:id` | modification de liste |
| DELETE | `/api/collections/me/lists/:id` | suppression de liste |
| POST | `/api/collections/me/lists/:id/items` | ajout d’œuvre dans une liste |
| DELETE | `/api/collections/me/lists/:id/items/:mediaId` | retrait d’œuvre d’une liste |

### Critiques

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/reviews` | créer ou modifier sa critique pour une œuvre |
| PATCH | `/api/reviews/:id` | modifier sa critique |
| DELETE | `/api/reviews/:id` | supprimer sa critique |
| POST | `/api/reviews/:id/like` | liker ou retirer son like |
| POST | `/api/reviews/:id/comments` | commenter une critique |
| DELETE | `/api/reviews/comments/:commentId` | supprimer son commentaire |
| POST | `/api/reviews/:id/report` | signaler une critique |

### Social

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users/search` | recherche d’utilisateurs |
| GET | `/api/users/:id` | profil public |
| POST | `/api/users/:id/follow` | suivre ou ne plus suivre |
| GET | `/api/feed` | fil d’actualité des abonnements |

### Notifications

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/notifications` | liste et compteur non-lu |
| PATCH | `/api/notifications/:id/read` | marquer une notification comme lue |
| PATCH | `/api/notifications/read/all` | tout marquer comme lu |
| GET | `/api/notifications/events` | flux SSE simple |

### Modération

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/reports` | liste des signalements |
| PATCH | `/api/admin/reports/:id` | changer le statut d’un signalement |
| PATCH | `/api/admin/reviews/:id/highlight` | mettre une critique en avant |
| DELETE | `/api/admin/reviews/:id` | supprimer une critique |
| PATCH | `/api/admin/users/:id/ban` | bannir ou débannir un utilisateur |

### Messagerie

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/messages/:userId` | conversation avec un utilisateur |
| POST | `/api/messages/:userId` | envoyer un message |

## 13. Stratégie de cache TMDB

La table `Media` contient les métadonnées utiles récupérées depuis TMDB :

- identifiant TMDB ;
- type film ou série ;
- titre ;
- synopsis ;
- affiche ;
- fond ;
- genres ;
- date de sortie ;
- durée ;
- données brutes TMDB ;
- date de cache `cachedAt`.

Lorsqu’une fiche média est demandée :

1. Le backend cherche l’œuvre en base avec `(tmdbId, type)`.
2. Si l’œuvre existe et que le cache est encore valide, le backend utilise la base locale.
3. Si le cache est expiré ou absent, le backend appelle TMDB.
4. Les données sont mises à jour en base.
5. Le backend retourne les données enrichies avec les notes et critiques SUPCONTENT.

La durée de cache est configurable :

```env
TMDB_CACHE_TTL_MINUTES=1440
```

## 14. Diagramme de cas d’utilisation

```mermaid
flowchart TD
    Guest[Visiteur] --> Search[Rechercher une œuvre]
    Guest --> ViewMedia[Consulter une fiche média]
    Guest --> ViewProfile[Consulter un profil public]

    User[Utilisateur connecté] --> Search
    User --> ViewMedia
    User --> Library[Ajouter à sa bibliothèque]
    User --> Lists[Créer et gérer des listes]
    User --> Review[Noter et rédiger une critique]
    User --> Like[Like et commentaires]
    User --> Follow[Suivre un utilisateur]
    User --> Feed[Consulter le fil d’actualité]
    User --> Notifications[Lire ses notifications]
    User --> Messages[Envoyer des messages privés]
    User --> Settings[Modifier profil et préférences]
    User --> Export[Exporter ses données]
    User --> Report[Signaler une critique]

    Admin[Administrateur] --> Moderate[Modérer les signalements]
    Admin --> Ban[Bannir un utilisateur]
    Admin --> Highlight[Mettre une critique en avant]
```

## 15. Diagramme de séquence — interaction avec TMDB

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant C as Client Web/Mobile
    participant B as Backend SUPCONTENT
    participant D as PostgreSQL
    participant T as TMDB

    U->>C: Recherche une œuvre
    C->>B: GET /api/media/search?q=...
    B->>T: GET /search/multi
    T-->>B: Résultats TMDB
    B-->>C: Résultats normalisés
    C-->>U: Affichage liste/grille

    U->>C: Ouvre une fiche média
    C->>B: GET /api/media/movie/550
    B->>D: Cherche Media tmdbId=550
    alt Cache valide
        D-->>B: Données média locales
    else Cache absent ou expiré
        B->>T: GET /movie/550?append_to_response=credits
        T-->>B: Métadonnées détaillées
        B->>D: Upsert Media
    end
    B->>D: Récupère critiques, notes, commentaires
    B-->>C: Fiche enrichie
    C-->>U: Affichage fiche complète
```

## 16. Règles métier importantes

- Un utilisateur peut consulter les contenus publics sans compte.
- Les interactions nécessitent un compte connecté.
- Une œuvre est identifiée par `(tmdbId, type)`.
- Un utilisateur ne peut avoir qu’une critique par œuvre.
- Un utilisateur ne peut pas se suivre lui-même.
- Les messages privés nécessitent un follow mutuel.
- Les listes privées ne sont visibles que par leur propriétaire.
- Les listes publiques peuvent apparaître dans la recherche et sur les profils.
- Les routes d’administration nécessitent le rôle `ADMIN`.
- Le premier utilisateur inscrit devient automatiquement administrateur.

## 17. Notifications

Les notifications sont créées lors des événements suivants :

- like sur une critique ;
- commentaire sur une critique ;
- nouvel abonné.

Les clients utilisent un polling régulier. Le backend expose aussi une route SSE `/api/notifications/events` pour fournir un compteur non lu en temps réel.

## 18. Qualité et maintenabilité

La logique est organisée par couches :

- `routes/` : routes HTTP et validation des entrées ;
- `services/` : logique réutilisable, activités, notifications, TMDB ;
- `middlewares/` : authentification, droits admin, erreurs ;
- `utils/` : JWT et mots de passe ;
- `prisma/schema.prisma` : modèle de données central.

Les clients consomment uniquement le backend via des helpers API :

- `web/src/api/client.ts` ;
- `mobile/src/api/client.ts`.

## 19. Sécurité

Mesures présentes :

- hash des mots de passe avec bcrypt ;
- validation Zod côté backend ;
- JWT signé avec secret fort ;
- invalidation des tokens par `tokenVersion` ;
- routes protégées par middleware ;
- routes admin séparées ;
- aucun secret en dur dans le code ;
- `.env` ignoré par Git ;
- usage d’un fichier `.env.example` sans valeur réelle ;
- contrôle propriétaire pour modification/suppression des critiques et commentaires ;
- bannissement utilisateur avec invalidation de session.

## 20. Points de vérification avant rendu

Avant de rendre l’archive :

```bash
docker compose up --build
```

Puis vérifier :

- `http://localhost:4000/api/health` retourne `status: ok` ;
- `http://localhost:8080` affiche le client web ;
- l’inscription fonctionne ;
- la recherche TMDB fonctionne avec une clé valide ;
- l’ouverture d’une fiche média remplit le cache ;
- la bibliothèque fonctionne ;
- les listes fonctionnent ;
- les critiques, likes et commentaires fonctionnent ;
- le follow alimente le fil d’actualité ;
- les notifications apparaissent ;
- les signalements sont visibles côté admin ;
- aucun secret réel n’est présent dans l’archive.
