import * as express from 'express'
import * as UserController from './userController'

export const register = (app: express.Application) => {
    // Récupérer des jouers
    // Query param id pour 1 seul joueur par utilisateur
    // Query param top pour obtenir les meilleurs joueurs
    app.get("/player", (req, res) => {
        if (req.query.top) {
            return res.status(200).json(UserController.getUsersTop(parseInt(req.query.top.toString())))
        }
    
        if (req.query.id) {
            const id = parseInt(req.query.id.toString())
            const user = UserController.getUserById(id)

            if (user) {
                return res.status(200).json(user)
            }

            return res.status(404).send("No user with this id")
        }
    
        res.status(200).json(UserController.listUsers());
    });

    // Créer un utilisateur
    app.put("/player", (req, res) => {
        const newUser: User = req.body

        if (UserController.listUsers().filter((u) => u.username === newUser.username).length > 0) {
            res.status(400).send("Duplicate username");
        } else {
            // db.addUser({ ...newUser, score: 0 });
            // res.status(200).send("OK");
            res.status(200).send(UserController.addUser(newUser));
        }
    });

    // Connection d'un utilisateur
    // On n'envoie pas de token
    // On vérifie juste le mot de passe
    app.post("/player/connect", (req, res) => {
        const { username, password } = req.body

        const users: UserList = UserController.listUsers().filter((u) => u.username === username)
        if (users.length === 0) {
            return res.status(400).send("No user with this username")
        }

        const user: User = users[0]
        if (user.password !== password) {
            return res.status(400).send("Wrong password")
        }

        res.status(200).send("OK")
    })
}