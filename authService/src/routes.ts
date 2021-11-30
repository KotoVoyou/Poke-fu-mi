import * as express from 'express'
import got from 'got'
import * as AuthController from './authController'

export const register = (app: express.Application) => {
    // Connection d'un utilisateur
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