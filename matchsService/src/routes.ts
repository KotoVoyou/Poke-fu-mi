import * as express from 'express'
import * as MatchController from './matchController'

export const register = (app: express.Application) => {
    // Récupérer des matchs
    // Query param player pour récupérer les matchs d'un joueur
    // Query param current pour récupérer uniquement les matchs en cours
    app.get("/matchs", (req, res) => {    
        if (req.query.player) {
            let current = req.query.current === "true" ? true : false
            return res.status(200).json(
                MatchController.getCurrentMatchPlayer(parseInt(req.query.player.toString()), current)
            )
        }

        res.status(200).json(MatchController.listMatchs())
    })

    app.get('/matchs/:id_match', (req, res) => {
        const match = MatchController.getMatchById(parseInt(req.params.id_match))

        if (match) {
            return res.status(200).json(match)
        }

        return res.status(404).send("No match with this id")
    })


    app.put("/matchs", (req, res) => {
        const newMatch: Match = req.body
        const { idP1, idP2 } = newMatch

        if (MatchController.getCurrentMatchPlayer(idP1, false).length > 2)
    
        if (MatchController.getCurrentMatchPlayer(idP1, false).length > 2) {
            return res.status(400).send("Player 1 is playing too many matches");
        }
    
        if (MatchController.getCurrentMatchPlayer(idP2, false).length > 2) {
            return res.status(400).send("Player 2 is playing too many matches");
        }
    
        res.status(200).send(MatchController.createMatch(newMatch))
    });
}