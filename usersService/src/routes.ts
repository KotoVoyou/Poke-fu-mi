import * as express from 'express'
import * as UserController from './userController'

export const register = (app: express.Application) => {
    // Récupérer des jouers
    // Query param id pour 1 seul joueur par utilisateur
    // Query param username pour rechercher un joueur par nom
    // Query param top pour obtenir les meilleurs joueurs

    /**
     * @swagger
     * /:
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
     *         name: username
     *         description: The name of player to retrieve.
     *         example: PokemonMaster2005
     *         schema:
     *           type: string
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
     *                    example: 1
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
        if (req.query.id) {
            const id = parseInt(req.query.id.toString())
            return UserController.getUserById(id)
                .then(user => res.status(200).json(user))
                .catch(errorHandler(res))
        }

        if (req.query.username) {
            const username = req.query.username.toString()
            return UserController.getUserByUsername(username)
                .then(user => res.status(200).json(user))
                .catch(errorHandler(res))
        }

        if (req.query.top) {
            const top = parseInt(req.query.top.toString())
            return UserController.getUsersTop(top)
                .then(users => res.status(200).json(users))
                .catch(errorHandler(res))
        }
    
        UserController.listUsers()
            .then(users => res.status(200).json(users))
            .catch(errorHandler(res))
    });

    // Créer un utilisateur
    /**
    * @swagger
    * /:
    *   put:
    *     summary: Register a new player.
    *     description: |
    *       Register a new player in the user database. An username and a password are expected. The username should be unique.
    *       An unique ID is automatically created, and the player's score is initialized at 0.
    *     requestBody:
    *       description: Necessary informations to create an user - an username and a password.
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               username:
    *                 type: string
    *                 description: The username the player registered with.
    *                 example: PokemonMaster2005
    *               password:
    *                 type: string
    *                 description: The password used by the player to log in.
    *                 example: 1234
    *     responses:
    *       200:
    *         description: The updated list of all registered users.
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
    *                    example: 1
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
    *       400:
    *         description: Error. An user already exists with this username.
    */
    app.put("/player", (req, res) => {
        const newUser: User = req.body

        UserController.addUser(newUser)
            .then(idUser => UserController.getUserById(idUser))
            .then(user => res.status(200).json(user))
            .catch(errorHandler(res))
    });

    /**
    * @swagger
    * /connect:
    *   post:
    *     summary: Connect to an account.
    *     description: |
    *       Log into an user account, using an username and a password.
    *       If the connection is successful, the user's ID is returned.
    *     requestBody:
    *       description: Necessary informations to login - an username and a password.
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *               username:
    *                 type: string
    *                 description: The username the player registered with.
    *                 example: PokemonMaster2005
    *               password:
    *                 type: string
    *                 description: The password used by the player to log in.
    *                 example: 1234
    *     responses:
    *       200:
    *         description: The ID linked to the provided username.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 id:
    *                   type: integer
    *                   description: The user ID.
    *                   example: 1
    *       400:
    *         description: Error. The password provided is incorrect.
    *       404:
    *         description: Error. The username provided doesn't exist in the database.
    */
    app.post("/player/connect", (req, res) => {
        const { username, password } = req.body
        UserController.getUserByUsername(username)
            .then(user => UserController.validateUserPassword(user, password))
            .then(user => res.status(200).json(user))
            .catch(errorHandler(res))
    })
}

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}