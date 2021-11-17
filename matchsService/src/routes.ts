import * as express from 'express'
import * as MatchController from './matchController'

export const register = (app: express.Application) => {
    // // Récupérer des jouers
    // // Query param id pour 1 seul joueur par utilisateur
    // // Query param top pour obtenir les meilleurs joueurs
    app.get("/matchs", (req, res) => {    
        res.status(200).json(MatchController.listMatchs())
    })

    app.put("/matchs", (req, res) => {
        const newMatch: Match = req.body
        // const { idP1, idP2 } = newMatch
    
        // if (db.getMatchs().filter((m) => m.idP1 === idP1 || m.idP2 === idP1).length > 2) {
        //     res.status(400).write("Player 1 is playing too many matches");
        //     return res.end();
        // }
    
        // if (db.getMatchs().filter((m) => m.idP1 === idP2 || m.idP2 === idP2).length > 2) {
        //     res.status(400).write("Player 2 is playing too many matches");
        //     return res.end();
        // }
    
        res.status(200).send(MatchController.createMatch(newMatch))
    });

    // // Créer un utilisateur
    // app.put("/player", (req, res) => {
    //     const newUser: User = req.body

    //     if (UserController.listUsers().filter((u) => u.username === newUser.username).length > 0) {
    //         res.status(400).send("Duplicate username");
    //     } else {
    //         // db.addUser({ ...newUser, score: 0 });
    //         // res.status(200).send("OK");
    //         res.status(200).send(UserController.addUser(newUser));
    //     }
    // });

    // // Connection d'un utilisateur
    // // On n'envoie pas de token
    // // On vérifie juste le mot de passe
    // app.post("/player/connect", (req, res) => {
    //     const { username, password } = req.body

    //     const users: UserList = UserController.listUsers().filter((u) => u.username === username)
    //     if (users.length === 0) {
    //         return res.status(400).send("No user with this username")
    //     }

    //     const user: User = users[0]
    //     if (user.password !== password) {
    //         return res.status(400).send("Wrong password")
    //     }

    //     res.status(200).send("OK")
    // })
}