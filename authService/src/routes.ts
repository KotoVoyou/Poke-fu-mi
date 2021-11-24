import * as express from 'express'
import got from 'got'
import jwt from 'jsonwebtoken'

export const register = (app: express.Application) => {
    // Connection d'un utilisateur
    // On n'envoie pas de token
    // On vérifie juste le mot de passe
    app.post("/connect", (req, res) => {
        const { username, password } = req.body

        got.get(`http://users:5000/player?username=${username}`)
            .then(response => response.body)
            .then(body => JSON.parse(body))
            .then(json => {
                if (json.password != password) {
                    return res.status(400).send("Wrong password")
                }

                jwt.sign({
                    id: json.user_id,
                    username: json.name
                }, "SECRET", (err: any, token: String) => {
                    if (err) {
                        return res.status(500).send("Error")
                    }

                    return res.status(200).json(token)
                })
            })
            .catch(error => {
                res.status(404).send("No user with this username")
            })
    })
}