# Checklist de tests manuels — SUPCONTENT

Cette checklist sert à valider le projet avant rendu. Elle doit être exécutée après :

```bash
docker compose up --build
```

## 1. Démarrage

- [ ] Le service PostgreSQL démarre.
- [ ] Le backend démarre sans erreur.
- [ ] Le web démarre via Nginx.
- [ ] `http://localhost:4000/api/health` retourne `status: ok`.
- [ ] `http://localhost:8080` affiche l’application web.

## 2. Sécurité des variables

- [ ] Le fichier `.env` n’est pas dans l’archive finale.
- [ ] `.env.example` ne contient que des valeurs factices.
- [ ] Aucune clé TMDB réelle n’est dans le code.
- [ ] Aucun secret JWT réel n’est dans le code.
- [ ] Aucun mot de passe réel n’est dans le code.

## 3. Authentification

- [ ] Inscription avec email valide.
- [ ] Rejet d’un email invalide.
- [ ] Rejet d’un mot de passe faible.
- [ ] Connexion avec bons identifiants.
- [ ] Message d’erreur avec mauvais identifiants.
- [ ] Déconnexion web.
- [ ] Déconnexion mobile.
- [ ] Ancien token invalidé après déconnexion.
- [ ] OAuth GitHub fonctionne si les variables sont configurées.

## 4. Recherche et API TMDB

- [ ] Recherche d’un film.
- [ ] Recherche d’une série.
- [ ] Filtre par type film/série.
- [ ] Filtre par année.
- [ ] Tri par popularité.
- [ ] Tri par date.
- [ ] Pagination ou bouton Charger plus.
- [ ] Les clients n’appellent jamais TMDB directement.
- [ ] Message clair si `TMDB_API_TOKEN` est absent.

## 5. Fiche média et cache

- [ ] Ouverture d’une fiche média.
- [ ] Affichage titre, affiche, résumé, date, genres.
- [ ] Affichage du casting.
- [ ] Affichage de la note moyenne SUPCONTENT.
- [ ] Affichage des critiques.
- [ ] L’œuvre est créée dans la table `Media`.
- [ ] Un second affichage récent réutilise le cache local.

## 6. Bibliothèque

- [ ] Ajouter une œuvre en `À voir`.
- [ ] Ajouter une œuvre en `En cours`.
- [ ] Ajouter une œuvre en `Terminé`.
- [ ] Ajouter une œuvre en `Abandonné`.
- [ ] Filtrer la bibliothèque par statut.
- [ ] Retirer une œuvre de la bibliothèque.
- [ ] Même parcours sur mobile.

## 7. Listes personnalisées

- [ ] Créer une liste privée.
- [ ] Créer une liste publique.
- [ ] Renommer une liste.
- [ ] Supprimer une liste.
- [ ] Ajouter une œuvre dans une liste.
- [ ] Retirer une œuvre d’une liste.
- [ ] Une liste publique apparaît sur le profil.
- [ ] Une liste privée n’apparaît pas sur le profil public.
- [ ] Même parcours sur mobile.

## 8. Critiques

- [ ] Publier une note et une critique.
- [ ] Modifier sa propre critique.
- [ ] Supprimer sa propre critique.
- [ ] Impossible de modifier la critique d’un autre utilisateur.
- [ ] Les critiques apparaissent sur la fiche média.
- [ ] Même parcours sur mobile.

## 9. Likes et commentaires

- [ ] Liker la critique d’un autre utilisateur.
- [ ] Retirer son like.
- [ ] Commenter une critique.
- [ ] Supprimer son propre commentaire.
- [ ] Notification reçue lors d’un like.
- [ ] Notification reçue lors d’un commentaire.
- [ ] Même parcours sur mobile.

## 10. Social

- [ ] Rechercher un utilisateur.
- [ ] Ouvrir un profil public.
- [ ] Suivre un utilisateur.
- [ ] Ne plus suivre un utilisateur.
- [ ] Afficher abonnés et abonnements.
- [ ] Empêcher l’auto-follow.
- [ ] Notification reçue lors d’un nouvel abonné.
- [ ] Même parcours sur mobile.

## 11. Fil d’actualité

- [ ] Le fil affiche les activités des utilisateurs suivis.
- [ ] Les activités sont triées de la plus récente à la plus ancienne.
- [ ] Les nouvelles critiques apparaissent.
- [ ] Les ajouts à la bibliothèque apparaissent.
- [ ] Les créations de listes apparaissent.
- [ ] État vide propre si aucun abonnement.
- [ ] Même parcours sur mobile.

## 12. Notifications

- [ ] Affichage des notifications.
- [ ] Compteur non lu correct.
- [ ] Marquage tout lu.
- [ ] Différence visuelle lu/non lu.
- [ ] Rafraîchissement automatique par polling.
- [ ] Même parcours sur mobile.

## 13. Paramètres et export

- [ ] Modifier le nom public.
- [ ] Modifier l’avatar.
- [ ] Modifier la biographie.
- [ ] Modifier le site web.
- [ ] Modifier le thème.
- [ ] Modifier la langue.
- [ ] Export JSON.
- [ ] Export CSV.
- [ ] Même parcours sur mobile quand applicable.

## 14. Modération admin

- [ ] Un utilisateur signale une critique.
- [ ] L’admin voit le signalement.
- [ ] L’admin marque le signalement résolu.
- [ ] L’admin rejette le signalement.
- [ ] L’admin supprime une critique.
- [ ] L’admin bannit un utilisateur.
- [ ] Un utilisateur banni ne peut plus interagir.

## 15. Messagerie privée

- [ ] Conversation impossible sans follow mutuel.
- [ ] Conversation possible avec follow mutuel.
- [ ] Envoi de message.
- [ ] Affichage du fil de messages.
- [ ] Même parcours sur mobile.
