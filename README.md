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
