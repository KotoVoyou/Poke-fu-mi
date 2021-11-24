import * as express from 'express'
import * as UserController from './userController'

export const register = (app: express.Application) => {
    // Récupérer des jouers
    // Query param id pour 1 seul joueur par utilisateur
    // Query param username pour rechercher un joueur par nom
    // Query param top pour obtenir les meilleurs joueurs

    /**
     * @swagger
     * /player:
     *   get:
     *     summary: Retrieve a list of players.
     *     description: |
     *       Retrieve a list of all unique registered players. 
     *       A query parameter can also be used, in order to retrieve either:
     *       - a single player via his id,
     *       - a list of the top n players.
     *     parameters:
     *       - in: query
     *         name: id
     *         description: The unique ID of the player to lookup.
     *         example: 12345
     *         schema:
     *           type: integer
     *       - in: query
     *         name: top
     *         description: The number of players to retrieve from the top players list.
     *         example: 100
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: A list of users.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                  id:
     *                    type: integer
     *                    description: The user ID.
     *                    example: 0
     *                  username:
     *                    type: string
     *                    description: The username the player registered with.
     *                    example: PokemonMaster2005
     *                  password:
     *                    type: string
     *                    description: The password used by the player to log in.
     *                    example: 1234
     *                  score:
     *                    type: integer
     *                    description: An indicator of the player's performances over the past matchs (TODO).
     *                    example: 100
     *       404:
     *         description: Bad request. The ID is invalid, or no user exists with this ID.
    */
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

        if (req.query.username) {
            const username = req.query.username.toString()
            const user = UserController.getUserByUsername(username)

            if (user) {
                return res.status(200).json(user)
            }

            return res.status(404).send("No user with this username")
        }

        if (req.query.top) {
            return res.status(200).json(UserController.getUsersTop(parseInt(req.query.top.toString())))
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

    app.post("/player/connect", (req, res) => {
        const { username, password } = req.body
        const user = UserController.getUserByUsername(username)

        if (!user) {
            return res.status(404).send("No user with this name")
        }

        if (user.password != password) {
            return res.status(400).send("Wrong password")
        }

        res.status(200).json({
            id: user.id
        })
    })
}