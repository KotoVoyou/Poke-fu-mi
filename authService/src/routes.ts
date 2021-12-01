import * as express from 'express'
import got from 'got'
import * as AuthController from './authController'

export const register = (app: express.Application) => {
    // Connection d'un utilisateur

    /**
    * @swagger
    * /connect:
    *   post:
    *     summary: Log in.
    *     description: |
    *       Try to connect to the user service using an username and a password.
    *       If the connection is successful, a secret token is returned, which may be used in further requests.
    *     requestBody:
    *       description: Necessary informations to log in - an username and a password.
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
    *         description: A secret token, allowing access to other functionalities of the API.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                token:
    *                  type: string
    *                  description: The secret token.
    *                  example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJQYXVsIiwiaWF0IjoxNjM4MzQ1NjM5fQ.2-NjE7x4VyA-Z3uqiqVO419RnKU_qdUC7Jv-oudgRmY
    *       500:
    *         description: Unknown error.
    */
    app.post("/auth/connect", (req, res) => {
        const { username } = req.body

        got.post("http://users:5000/player/connect", {
            json: req.body
        })
            .then(response => response.body)
            .then(body => JSON.parse(body))
            .then(json => AuthController.signJWT({ id: json.id, username }))
            .then(token => res.status(200).json({ token }))
            .catch(error => res.status(error.response.statusCode || 500).send(error.response.body || "Erreur"))
    })

    /**
    * @swagger
    * /verify:
    *   post:
    *     summary: Verify a connection token.
    *     description: |
    *       Check if a given secret connection token is valid and usable.
    *     requestBody:
    *       description: A secret token previously received.
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *              token:
    *                type: string
    *                description: The secret token.
    *                example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJQYXVsIiwiaWF0IjoxNjM4MzQ1NjM5fQ.2-NjE7x4VyA-Z3uqiqVO419RnKU_qdUC7Jv-oudgRmY
    *     responses:
    *       204:
    *         description: The provided token is correct.
    *       500:
    *         description: The provided token is unusable.
    */
    app.post("/auth/verify", (req, res) => {
        const { token } = req.body

        AuthController.verifyJWT(token)
            .then(_ => res.status(204).end())
            .catch(errorHandler(res))
    })
}

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}