import * as express from 'express'
import got from 'got'
import jwt from 'jsonwebtoken'

export const register = (app: express.Application) => {
    // Connection d'un utilisateur
    app.post("/auth/connect", (req, res) => {
        const { username, password } = req.body

        got.post("http://users:5000/player/connect", {
            json: req.body
        })
            .then(response => response.body)
            .then(body => JSON.parse(body))
            .then(json => {
                jwt.sign({
                    id: json.id,
                    username
                }, "SECRET", (err: any, token: String) => {
                    if (err) {
                        return res.status(500).send("Error")
                    }

                    return res.status(200).json(token)
                })
            })
            .catch(error => {
                res.status(error.response.statusCode || 500).send(error.response.body || "Erreur")
            })
    })
}