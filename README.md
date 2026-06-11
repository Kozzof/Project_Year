# Project_Year

 - Contexte du projet

La startup "Culture Connect", spécialisée dans l'agrégation de contenus culturels, souhaite lancer un nouveau réseau social de niche. Elle a pour cela lancé un appel d'offres pour confier le projet SUPCONTENT à un sous-traitant. Votre équipe est ainsi en compétition pour remporter ce contrat.

Le choix de la thématique est laissé à l'appréciation de l'équipe de développement. Vous devez choisir UN type de média unique autour duquel s'articulera tout le réseau social :
Cinéma/Séries (API suggérée : TMDB)
Livres (API suggérée : Open Library, Google Books)
Jeux Vidéo (API suggérée : RAWG, IGDB)
Musique (API suggérée : Discogs, Spotify, Last.fm)
etc.

Vous devrez développer une application web et une application mobile afin de satisfaire les deux types d'usages (consultation rapide vs rédaction de critiques). La charte graphique est également à définir.

2 - Description du projet

2.1 - Généralités

Le but principal de SUPCONTENT est de permettre aux passionnés de découvrir des œuvres, de gérer leur collection personnelle (ce qu'ils ont vu/lu/joué) et d'échanger des avis avec la communauté. Chaque utilisateur dispose de son profil public et peut suivre d'autres utilisateurs.

Le cœur de l'application repose sur la consommation d'une API tierce publique (correspondant au média choisi) pour récupérer les métadonnées des œuvres (titres, affiches, auteurs, descriptions). 
Les utilisateurs ne créent pas les fiches des œuvres, ils interagissent avec des fiches existantes issues de l'API.

L'accent est mis sur l'ergonomie, la découverte sociale et la fluidité de la navigation entre les données locales (avis, notes) et les données distantes (API média).

2.2 - Fonctionnalités de l'application à implémenter

2.2.1 - Connexion

Un utilisateur pourra se connecter à l'application via un compte créé spécifiquement (email/mot de passe) ou en utilisant un compte OAuth2 (Google, Facebook, GitHub, etc.).

Un utilisateur ne souhaitant pas créer de compte peut consulter tous les éléments publics de l'application (sans la possibilité d'avoir des interactions) sans créer de compte.

2.2.2 - Bibliothèque personnelle (Collections)
Les utilisateurs peuvent organiser les œuvres dans leur bibliothèque via des statuts prédéfinis.
Listes par défaut : "À voir/lire/jouer/etc.", "En cours", "Terminé", "Abandonné".
Listes personnalisées : L'utilisateur peut créer des listes thématiques (ex: "Mes films d'horreur préférés", "Lectures d'été 2025") et les rendre publiques ou privées.
Un tableau de bord permet de visualiser les statistiques de sa collection (nombre d'œuvres terminées, temps passé, etc.).

2.2.3 - Fiches média & critiques
Chaque œuvre dispose d'une page dédiée générée à partir des données de l'API externe combinées aux données de SUPCONTENT.
Informations générales : Résumé, date de sortie, auteur/réalisateur (données API tierce).
Espace communautaire : Moyenne des notes des utilisateurs de SUPCONTENT, liste des critiques, discussions associées.
Action utilisateur : Possibilité de noter (étoiles), de rédiger une critique détaillée (texte avec formatage) et d'ajouter l'œuvre à une liste.

2.2.4 - Interaction sociale & Fil d'actualité
Un système de "Follow" (abonnement) permet de suivre d'autres utilisateurs.
Fil d'actualité : Agrégation chronologique des activités des amis (Notes attribuées, critiques publiées, entrées dans une collection).
Interactions : Possibilité de "Liker" une critique ou de la commenter.
Messagerie privée : Système de chat simple entre deux utilisateurs qui se suivent mutuellement.

2.2.5 - Modération et rôles
Administrateurs : Peuvent modérer les critiques signalées (suppression de contenu inapproprié), bannir des utilisateurs, et mettre en avant certaines critiques ("Coups de cœur").
Utilisateurs : Peuvent signaler un contenu (spoilers non marqués, insultes).

2.2.6 - Notifications
Notifications en temps réel :
Nouveau "J'aime" ou commentaire sur une critique.
Nouvel abonné.
Recommandation automatique basée sur les goûts (ex: "Un nouveau livre de votre auteur favori est sorti").
Options de personnalisation (Push ou Email).

2.2.7 - Intégration API tierce
L'application ne doit pas stocker la totalité des données des œuvres en base de données, mais doit agir comme un cache ou un enrichisseur.
Recherche : La barre de recherche interroge l'API tierce en temps réel.
Synchronisation : Importation intelligente des données nécessaires à l'affichage (Images, Titres) pour limiter les appels API redondants.

2.2.8 - Recherche avancée
Recherche unifiée permettant de trouver :
Des œuvres (via l'API externe) avec filtres (genre, année, auteur).
Des utilisateurs de la plateforme.
Des listes publiques créées par la communauté.

2.2.9 - Paramètres utilisateurs
Gestion de profil : Avatar, biographie, lien vers site web.
Préférences : Thème (Clair/Sombre), langue de l'interface.
Exportation des données personnelles (Liste des œuvres notées au format CSV/JSON - conformité RGPD).

2.3 - Déploiement

2.3.1 - Architecture
Votre application doit comporter trois briques distinctes :
Un serveur (API REST ou GraphQL) implémentant la logique métier et faisant l'interface entre la base de données locale et l'API externe (Média).
Deux clients (web et mobile distincts) interagissant uniquement avec votre serveur.
Une base de données (choix libre : SQL ou NoSQL).
Aucune logique métier critique ne doit avoir lieu sur les clients. Les clients ne doivent jamais interroger l'API tierce (TMDB/IGDB/etc.) directement ; tout doit passer par votre serveur backend.

2.3.2 - Containérisation
Le projet doit comporter un fichier docker-compose.yml à la racine permettant de déployer au moins 3 services : le serveur, le client web et la base de données. 

L'application doit être fonctionnelle via une simple commande docker compose up.

3 - Le rendu

Il se fera sous la forme d'une archive au format "zip" contenant le code source, les assets, la documentation technique et le manuel utilisateur.

La documentation technique contiendra au moins :
La procédure d'installation et les pré-requis (notamment comment obtenir une clé API pour le service tiers choisi).
Guide de déploiement.
Justification des choix technologiques (Langages, Frameworks, API tierce choisie).
Diagrammes UML (Cas d'utilisation, Séquence d'une interaction avec l'API tierce).
Schéma de la base de données.
Le manuel utilisateur présente les fonctionnalités et guide un nouvel arrivant.

Attention : Aucun secret (Clé API tierce, mots de passe BDD, secrets JWT) ne doit être présent en clair dans le code. Un secret en clair entraînera un malus ou l’ajournement du projet selon la criticité.

Un dépôt Git comprenant un historique de commits cohérent devra être présent et rendu dans la documentation. En cas d’absence de dépôt Git accessible dans le rendu, le projet ne sera pas corrigé.

Votre dépôt Git devra être privé jusqu'à la fin du rendu. Vous pourrez le rendre public uniquement après la date d'échéance du projet sur Moodle.
Si cela n'est pas respecté et qu'un autre groupe plagie votre code, les deux groupes seront sanctionnés.

4 - Le barème

Ce projet est noté sur 500 points avec possibilité d'obtenir 50 points en bonus.

Documentations : 50 points
(Note < 30 points = ajournement)
Documentation technique : 30 points
Manuel utilisateur : 20 points
Qualité de l’interface et UX : 20 points
Design, ergonomie et fluidité (Web & Mobile) : 20 points
Déploiement : 50 points
(Note < 25 points = ajournement)
Architecture et abstraction : 30 points
Containérisation : 20 points
Fonctionnalités : 190 points
(Note < 100 points = ajournement)
Une fonctionnalité est considérée comme fonctionnelle si elle est implémentée sur le serveur et sur les deux clients.

1. Inscription et connexion (30 points)
Connexion standard (10 points)
Inscription avec validation des champs (format email, complexité mot de passe).
Connexion avec email/mot de passe et gestion des erreurs (mauvais identifiants).
Déconnexion sécurisée (invalidation du token/session).
Connexion OAuth2 (20 points)
Implémentation fonctionnelle d’un provider tiers (Google, Facebook, GitHub, ou autre).
Création automatique du compte utilisateur local lors de la première connexion via OAuth.
2. Intégration API tierce & recherche (50 points)
Recherche globale (20 points)
Barre de recherche interrogeant l'API tierce avec autocomplétion ou résultats dynamiques.
Affichage des résultats sous forme de liste/grille avec visuels (affiches/couvertures) et informations clés.
Gestion de la pagination ou du "scroll infini" sur les résultats.
Fiche détaillée d'une œuvre (20 points)
Affichage complet des métadonnées issues de l'API (Synopsis, Auteurs, Dates, Casting/Genre, etc.).
Mise en cache ou stockage intelligent : l'application ne doit pas refaire un appel à l'API tierce si la donnée a été chargée très récemment mais doit afficher les données sans latence excessive.
Filtrage et tri (10 points)
Possibilité de filtrer les résultats de recherche (par année, genre, auteur, etc.) ou de trier (popularité, date de sortie, etc.).
3. Bibliothèque & listes (40 points)
Gestion des statuts d'œuvres (15 points)
Boutons d'action rapide sur une fiche : "À voir/lire", "En cours", "Terminé".
Visualisation de sa propre bibliothèque filtrée par ces statuts (ex: voir tous mes livres "En cours").
Listes personnalisées (15 points)
Création de listes thématiques (ex: "Films d'horreur pour Halloween").
Ajout et suppression d'œuvres dans ces listes.
Édition (renommer) et suppression de la liste elle-même.
Confidentialité des listes (10 points)
Gestion du flag "Privé" (visible uniquement par moi) ou "Public" (visible sur mon profil par les autres).
4. Social & Critiques (40 points)
Notation et critiques (15 points)
Possibilité de noter une œuvre (ex: étoiles de 1 à 5).
Rédaction d'un avis textuel (critique) associé à la note.
Possibilité de modifier ou supprimer sa propre critique.
Interactions communautaires (15 points)
Affichage des critiques des autres utilisateurs sur la fiche d'une œuvre.
Possibilité de mettre un "J'aime" sur une critique.
Espace commentaires sous une critique (fil de discussion).
Abonnements (Follow) (10 points)
Bouton "Suivre" / "Ne plus suivre" sur le profil d'un autre utilisateur.
Liste des abonnés (followers) et abonnements (following) visible sur le profil.
5. Fil d'actualité & Notifications (30 points)
Fil d'actualité (15 points)
Page d'accueil présentant les actions récentes des personnes suivies (ex: "Utilisateur X a noté Star Wars 5/5", "Utilisateur Y a ajouté Z à sa liste").
Tri chronologique inverse (du plus récent au plus ancien).
Notifications (15 points)
Liste des notifications non lues (ex: "On a aimé votre critique", "Nouvel abonné").
Marquage visuel lu/non lu.
Mise à jour en temps réel (via Polling régulier, Server-Sent Events ou WebSockets).
Qualité du code : 190 points
(Note < 100 points = ajournement) 
Le barème item par item est identique à celui des fonctionnalités. Pour un item non réalisé ou complètement dysfonctionnel, la note de qualité de code correspondante sera automatiquement égale à zéro.
Les critères appréciés ici sont essentiellement :
Structures de données adaptées.
Absence de duplication de code inadaptée.
Lisibilité du code (cela inclut la cohérence et le sens du nommage des variables et sous-programmes).
Facilité de maintenance.
Abstraction du code
Bonus : jusqu’à 50 points
Quelques exemples :
Mise en production réelle.
Fonctionnalités avancées : "Import depuis un concurrent" (ex: import CSV Letterboxd/Goodreads), application Progressive Web App (PWA), gamification (badges).
Malus : jusqu'à l'ajournement
Quelques exemples :
Secrets en clair (Clés API, Mots de passe) : De l'invalidation de la partie code jusqu'à l'ajournement selon la criticité.
Mot de passe non chiffrés en base de données
