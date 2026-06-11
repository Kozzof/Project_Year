# Manuel utilisateur — SUPCONTENT

## 1. Présentation

SUPCONTENT est un réseau social dédié aux films et séries. Il permet de rechercher des œuvres, gérer sa bibliothèque, créer des listes, publier des critiques, suivre d’autres utilisateurs et recevoir des notifications.

## 2. Accéder à l’application

### Web

Après lancement Docker, l’application web est disponible à l’adresse :

```text
http://localhost:8080
```

### Mobile

L’application mobile se lance depuis le dossier `mobile` avec :

```bash
npx expo start
```

## 3. Utilisation sans compte

Un visiteur peut :

- accéder à l’accueil ;
- rechercher des films et séries ;
- consulter les fiches médias ;
- lire les critiques publiques ;
- consulter les profils publics ;
- voir les listes publiques.

Un visiteur ne peut pas :

- noter une œuvre ;
- publier une critique ;
- liker ou commenter ;
- ajouter une œuvre à sa bibliothèque ;
- suivre un utilisateur ;
- accéder aux notifications.

## 4. Créer un compte

1. Cliquer sur **Connexion** ou **Login**.
2. Choisir le mode **Créer un compte**.
3. Renseigner :
   - nom public ;
   - email ;
   - mot de passe.
4. Valider le formulaire.

Le mot de passe doit contenir au minimum :

- 8 caractères ;
- une majuscule ;
- une minuscule ;
- un chiffre.

Le premier compte créé devient administrateur.

## 5. Connexion et déconnexion

### Connexion standard

1. Ouvrir la page de connexion.
2. Renseigner email et mot de passe.
3. Valider.

En cas d’erreur, un message indique si les identifiants sont incorrects.

### Connexion GitHub

Sur le web, le bouton **Continuer avec GitHub** redirige vers GitHub si l’OAuth a été configuré côté serveur.

### Déconnexion

Cliquer sur **Déconnexion**, **Quitter** ou **Logout** selon le client utilisé.

La déconnexion invalide la session côté serveur.

## 6. Rechercher une œuvre

Depuis la page **Recherche** :

1. Saisir un titre, une saga ou une série.
2. Choisir éventuellement :
   - films + séries ;
   - films uniquement ;
   - séries uniquement ;
   - année ;
   - tri par popularité, date ou titre.
3. Cliquer sur **Rechercher**.
4. Utiliser **Charger plus** pour afficher la page suivante.

Les résultats affichent :

- l’affiche ;
- le titre ;
- le type ;
- l’année ;
- un résumé court.

La recherche unifiée affiche aussi :

- des utilisateurs ;
- des listes publiques.

## 7. Consulter une fiche média

Une fiche média contient :

- affiche ;
- titre ;
- synopsis ;
- genres ;
- casting principal ;
- note moyenne SUPCONTENT ;
- critiques de la communauté.

Les données de l’œuvre proviennent de TMDB, enrichies avec les données sociales de SUPCONTENT.

## 8. Ajouter une œuvre à la bibliothèque

Sur une fiche média, un utilisateur connecté peut choisir un statut :

- **À voir** ;
- **En cours** ;
- **Terminé** ;
- **Abandonné**.

L’œuvre apparaît ensuite dans la page **Bibliothèque**.

## 9. Gérer la bibliothèque

La page **Bibliothèque** permet de :

- consulter toutes les œuvres enregistrées ;
- filtrer par statut ;
- retirer une œuvre de sa bibliothèque ;
- consulter ses statistiques de base, comme le nombre de critiques publiées.

## 10. Créer et gérer des listes personnalisées

La page **Listes** permet de :

- créer une liste ;
- choisir si elle est publique ou privée ;
- modifier son nom ;
- modifier sa confidentialité ;
- supprimer une liste ;
- ajouter une œuvre à une liste ;
- retirer une œuvre d’une liste.

Une liste publique est visible sur le profil et peut apparaître dans la recherche. Une liste privée reste réservée à son propriétaire.

## 11. Publier une critique

Sur une fiche média :

1. Choisir une note de 1 à 5.
2. Rédiger une critique.
3. Indiquer si elle contient des spoilers si nécessaire.
4. Publier.

Un utilisateur peut ensuite :

- modifier sa critique ;
- supprimer sa critique.

Un utilisateur ne peut pas modifier la critique d’un autre utilisateur.

## 12. Liker et commenter

Sous une critique, un utilisateur connecté peut :

- mettre un **J’aime** ;
- retirer son **J’aime** ;
- écrire un commentaire ;
- supprimer ses propres commentaires.

L’auteur de la critique reçoit une notification lors d’un like ou d’un commentaire.

## 13. Signaler une critique

Si une critique contient un contenu inapproprié, un spoiler non marqué ou une insulte, cliquer sur **Signaler**.

Le signalement sera visible par les administrateurs.

## 14. Suivre des utilisateurs

Depuis un profil utilisateur :

- cliquer sur **Suivre / Ne plus suivre** ;
- consulter le nombre d’abonnés ;
- consulter le nombre d’abonnements ;
- voir les listes publiques et critiques récentes.

Lorsqu’un utilisateur vous suit, vous recevez une notification.

## 15. Fil d’actualité

La page d’accueil affiche les activités récentes des personnes suivies :

- nouvelles critiques ;
- œuvres ajoutées à une bibliothèque ;
- listes créées ;
- nouveaux abonnements.

Les activités sont affichées de la plus récente à la plus ancienne.

Si le fil est vide, il faut suivre d’autres utilisateurs pour l’alimenter.

## 16. Notifications

La page **Notifications** affiche :

- les notifications non lues ;
- les notifications déjà lues ;
- le nombre de notifications non lues.

Les notifications se mettent à jour régulièrement par polling.

Il est possible de cliquer sur **Tout marquer comme lu**.

## 17. Messagerie privée

La page **Messages** permet d’échanger avec un autre utilisateur.

Condition importante : les deux utilisateurs doivent se suivre mutuellement.

Pour ouvrir une conversation :

1. Renseigner l’identifiant de l’utilisateur.
2. Cliquer sur **Ouvrir**.
3. Écrire un message.
4. Envoyer.

## 18. Paramètres du compte

La page **Paramètres** permet de modifier :

- nom public ;
- avatar ;
- biographie ;
- site web ;
- thème clair/sombre ;
- langue préférée.

## 19. Export des données personnelles

Depuis les paramètres, l’utilisateur peut exporter ses données personnelles :

- au format JSON ;
- au format CSV.

L’export contient notamment les œuvres notées et les critiques publiées.

## 20. Administration

Les administrateurs ont accès à la page **Admin**.

Ils peuvent :

- voir les critiques signalées ;
- marquer un signalement comme résolu ;
- rejeter un signalement ;
- supprimer une critique ;
- bannir un utilisateur ;
- mettre une critique en avant comme coup de cœur.

## 21. Conseils d’utilisation mobile

Sur mobile :

- utiliser l’onglet **Recherche** pour trouver des œuvres ;
- ouvrir une fiche pour noter, critiquer ou ajouter à la bibliothèque ;
- utiliser **Biblio** pour filtrer ses statuts ;
- utiliser **Listes** pour gérer ses sélections ;
- utiliser **Profils** pour chercher et suivre des utilisateurs ;
- utiliser **Notif** pour consulter les notifications ;
- utiliser **Compte** pour modifier son profil.

## 22. Résolution des problèmes fréquents

### La recherche ne fonctionne pas

Vérifier que `TMDB_API_TOKEN` est correctement renseigné dans `.env`.

### Impossible de se connecter

Vérifier :

- l’email ;
- le mot de passe ;
- que le compte n’est pas banni.

### Les notifications ne changent pas immédiatement

Les notifications sont rafraîchies régulièrement. Attendre quelques secondes ou recharger la page.

### L’application mobile ne joint pas le backend

Sur téléphone physique, utiliser l’adresse IP locale de l’ordinateur dans `EXPO_PUBLIC_API_URL` au lieu de `localhost`.
