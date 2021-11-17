import * as express from 'express'
import * as MatchController from './matchController'

export const register = (app: express.Application) => {
    // // Récupérer des jouers
    // // Query param id pour 1 seul joueur par utilisateur
    // // Query param top pour obtenir les meilleurs joueurs
    app.get("/matchs", (req, res) => {    
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
    
        if (MatchController.listMatchs().filter((m) => m.idP1 === idP1 || m.idP2 === idP1).length > 2) {
            return res.status(400).send("Player 1 is playing too many matches");
        }
    
        if (MatchController.listMatchs().filter((m) => m.idP1 === idP2 || m.idP2 === idP2).length > 2) {
            return res.status(400).send("Player 2 is playing too many matches");
        }
    
        res.status(200).send(MatchController.createMatch(newMatch))
    });
}