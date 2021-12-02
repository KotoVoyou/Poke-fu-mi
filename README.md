# Poke-fu-mi

## Architecture des services

![](./schema_architecture.png)

## Explication des services

-   Un service User, gérant une base de données d’utilisateurs, la création d’utilisateurs, la connexion.
-   Un service Match, gérant une base de données de matchs, la création/modification de matchs. Pour chaque match, ce service effectue aussi la gestion des rounds.
    Il se connecte au service User pour définir les joueurs participant à un match.
    Il se connecte à la PokeAPI pour définir le déroulement du round selon les pokémons choisis.
-   Un service Auth pour l’authentification. Une fois authentifié, un jeton secret est généré et envoyé, qui permet d’accéder aux autres fonctionnalités de l’API.
-   Un service proxy qui fournit un point d’accès unique aux différents services créés.

## Documentation

Les documentations des services sont accessibles aux adresses suivantes :

-   localhost:5000/docs : UserAPI
-   localhost:5001/docs : MatchAPI
-   localhost:5002/docs : AuthAPI

## Choix techniques

-   Nous avons choisi de conserver les matchs et les rounds en un seul service, en raison du lien fort entre les deux. Les séparer aurait nécessité un nombre trop conséquent d’appels d’un service à l’autre, et n’aurait donc pas eu d’impact positif notable.

## Amélioration possible

Il reste cependant quelques points qui aurait pus être améliorés avec plus de temps

-   Même si le service d'authentification permet de générer un token pour un certain utilisateur
    et offre une route pour vérifier ce token, le proxi ne vérifie pas ces tokens et permet donc
    des appels non sécurisé
-   Les mots de passes sont enregistrés non chiffrés
-   Lors d'un round, si un pokémon posséde plusieurs type, seul le premier renvoyé par PokeAPI est utilisé
    pour déterminer le gagnant
-   Lors d'un round si les types des deux pokémons sont mutuellements gagnant (par exemple le type dragon),
    le joueur 1 est favorisé et gagne alors qu'on aurait du avoir une égalité
-   Les pokémons ne sont pas fixés au début du match, on les choisis seulement au moment de joueur le round
