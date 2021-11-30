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

        MatchController.getCurrentMatchPlayer(idP1, true)
            .then(matchs => {
                if (matchs.length > 2)
                    throw {...Error("Player 1 is playing too many matches"), statusCode: 400}
            })
            .then(() => MatchController.getCurrentMatchPlayer(idP2, true))
            .then(matchs => {
                if (matchs.length > 2)
                    throw {...Error("Player 2 is playing too many matches"), statusCode: 400}
            })
            .then(() => MatchController.createMatch(newMatch))
            .then(matchs => res.status(200).json(matchs))
            .catch(errorHandler(res))
    })

    app.get('/matchs/:id_match', (req, res) => {
        MatchController.getMatchWithRounds(parseInt(req.params.id_match))
            .then(match => res.status(200).json(match))
            .catch(errorHandler(res))        
    })

    // Update match
    app.put("/matchs/:id_match", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const update: UpdateMatch = req.body

        res.status(200).send(MatchController.updateMatch(idMatch, update))
    })

    app.delete('/matchs/:id_match', (req, res) => {
        const idMatch = parseInt(req.params.id_match)

        MatchController.deleteMatch(idMatch)
            .then(_ => res.status(204).end())
            .catch(errorHandler(res))
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