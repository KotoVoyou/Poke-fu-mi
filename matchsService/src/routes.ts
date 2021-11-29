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

    // Create match
    app.post("/matchs", (req, res) => {
        const newMatch: Match = req.body
        const { idP1, idP2 } = newMatch
    
        if (MatchController.getCurrentMatchPlayer(idP1, true).length > 2) {
            return res.status(400).send("Player 1 is playing too many matches");
        }
    
        if (MatchController.getCurrentMatchPlayer(idP2, true).length > 2) {
            return res.status(400).send("Player 2 is playing too many matches");
        }
    
        res.status(200).send(MatchController.createMatch(newMatch))
    });

    app.get('/matchs/:id_match', (req, res) => {
        const match = MatchController.getMatchById(parseInt(req.params.id_match))

        if (match) {
            return res.status(200).json(match)
        }

        return res.status(404).send("No match with this id")
    })

    // Update match
    app.put("/matchs/:id_match", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const update: UpdateMatch = req.body

        res.status(200).send(MatchController.updateMatch(idMatch, update))
    })

    app.get("/matchs/:id_match/round", (req, res) => {
        const idMatch = parseInt(req.params.id_match)

        MatchController.getRounds(idMatch)
            .then(rounds => res.status(200).json(rounds))
            .catch(err => res.status(500).send(err.message || "Error"))
    })

    app.get('/matchs/:id_match/round/:round_number([1-6])', (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const roundNumber: RoundNumber = parseInt(req.params.round_number) as RoundNumber

        MatchController.getRound(idMatch, roundNumber)
            .then(round => res.status(200).json(round))
            .catch(err => res.status(err.statusCode || 500).send(err.message || 'Error'))
    }) 

    app.put("/matchs/:id_match/round", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const roundInput: RoundPlayer = req.body

        MatchController.getRound(idMatch, roundInput.roundNumber)
            .then(round => {
                if (round) {
                    if (round.status === 'TERMINATED') 
                        throw { ...Error(), statusCode: 400 }
                    

                    if ((round.pokemonP1 && roundInput.pokemonP2) || (round.pokemonP2 && roundInput.pokemonP1))
                        roundInput.status = 'TERMINATED'

                    return MatchController.updateRound(idMatch, roundInput)
                }
                return MatchController.createRound(idMatch, roundInput)
            })
            .then(_ => MatchController.getRound(idMatch, roundInput.roundNumber))
            .then(round => res.status(200).json(round))
            .catch(errorHandler(res))
    })
}

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}