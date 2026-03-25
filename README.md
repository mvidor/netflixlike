# Netflixlike

Qui je suis ?
Mattéo Vidor G5a

Comprehension du projet : 
Une application web est un logiciel accessible via un navigateur, sans installation.
Elle fonctionne grâce à un échange entre le client (front-end), le serveur (back-end) et une base de données.
Son architecture et sa pile technologique déterminent ses performances, sa sécurité et son évolutivité.

Comment applique ce cours au projet Netflix ? 

Faire une application web avec un front-end (HTML/CSS/JS) pour afficher les films/séries, une page de connexion.

Quelles sont les 3 couches :
Front-end (client)
    Pages web, interface (HTML/CSS)
    Boutons, navigation , etc
    Interactions (JavaScript)
Back-end (serveur)
    Logique de l’application
    Gestion des utilisateurs (connexion, droits)
    Traitement des requêtes et règles métier
Base de données
    Comptes utilisateurs
    Contenus (films, séries, catégories)
    Historique, préférences, données enregistrées

Page d'acceuil : 

-Une barre de recherche au milieur haut 
-Un onglet haut gauche mon compte 
-Plusieurs film qui apparaissent 
-Premiere ligne "reprendre la lecture "
-Deuxieme ligne "ma liste"
-Onglet ma liste

Requetes envoyé par le front (page d'acceuil)
-Récupérer les contenus
-Reprendre la lecture (si utilisateur connecté)
-Informations utilisateur
-Vérifier si l’utilisateur est connecté
-Charger Ma liste
-Recherche
-Envoyer le texte tapé dans la barre de recherche
-Recevoir les résultats filtrés
-Actions utilisateur
-Ajouter / retirer un film de Ma liste
-Cliquer sur un film 

GET /films/populaires
GET /user/me
GET /user/ma-liste
GET /search=action
POST /ma-liste/add

## Difficultes rencontrees

Plusieurs petites difficultes ont ete rencontrees pendant le projet, surtout au niveau de l'integration entre les differentes parties de l'application.

### 1. Configuration locale

Il a fallu bien aligner :

- le port du frontend
- le port du backend
- la variable `VITE_API_URL`
- la configuration CORS

Ce sont des details simples, mais une petite erreur a ce niveau empeche rapidement le frontend de communiquer avec l'API.

### 2. Installation et environnement

Le lancement du projet a demande quelques ajustements :

- installation des dependances manquantes
- verification des scripts npm
- controle des fichiers `.env`

Ce n'etait pas un gros blocage, mais cela a pris un peu de temps pour stabiliser l'environnement.

### 3. Connexion avec MongoDB Atlas

La partie base de donnees a demande plusieurs verifications :

- acces au cluster
- droits du compte MongoDB
- bonne lecture des collections depuis le backend

Quand la configuration Atlas n'est pas correcte, plusieurs fonctionnalites peuvent sembler cassees alors que le frontend fonctionne correctement.

### 4. Gestion des locations

La logique de location a demande un peu d'attention, car il fallait verifier plusieurs choses a la suite :

- la creation de la location
- la mise a jour des informations du film
- la relecture correcte des locations utilisateur

Ce parcours depend de plusieurs traitements backend, donc il fallait corriger progressivement les points qui bloquaient.

### 5. Accueil dynamique

Le hero de la page d'accueil devait etre alimente par l'API et adapter son contenu selon l'etat de connexion de l'utilisateur.

Il fallait donc gerer :

- les recommandations si l'utilisateur est connecte
- les films aleatoires sinon
- un fallback propre en cas d'erreur API

### 6. Petits problemes d'affichage

Comme dans beaucoup de projets frontend, quelques petits problemes ont du etre ajustes :

- affichage de certaines images
- rendu de composants
- encodage de certains fichiers
- details de style sur quelques ecrans

Ce ne sont pas de gros blocages, mais ce sont des corrections normales dans un projet de ce type.



