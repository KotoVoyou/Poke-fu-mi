import * as express from 'express'
import * as MatchController from './matchController'

export const register = (app: express.Application) => {
    // Récupérer des matchs
    // Query param player pour récupérer les matchs d'un joueur
    // Query param current pour récupérer uniquement les matchs en cours
    app.get("/matchs", (req, res) => {    
        if (req.query.player) {
            const player = parseInt(req.query.player.toString())
            const current = req.query.current === "true" ? true : false
            return MatchController.getCurrentMatchPlayer(player, current)
                .then(matchs => res.status(200).json(matchs))
                .catch(errorHandler(res))
        }

        MatchController.listMatchs()
            .then(matchs => res.status(200).json(matchs))
            .catch(errorHandler(res))
    })

    app.get('/matchs/:id_match', (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        MatchController.getMatchWithRounds(idMatch)
            .then(match => res.status(200).json(match))
            .catch(errorHandler(res))        
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
            .then(_ => MatchController.getCurrentMatchPlayer(idP2, true))
            .then(matchs => {
                if (matchs.length > 2)
                    throw {...Error("Player 2 is playing too many matches"), statusCode: 400}
            })
            .then(() => MatchController.createMatch(newMatch))
            .then(idMatch => MatchController.getMatchWithRounds(idMatch))
            .then(matchs => res.status(200).json(matchs))
            .catch(errorHandler(res))
    })

    // Update match
    app.put("/matchs/:id_match", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const update: UpdateMatch = req.body

        MatchController.updateMatch(idMatch, update)
            .then(_ => MatchController.getMatchWithRounds(idMatch))
            .then(match => res.status(200).json(match))
            .catch(errorHandler(res))
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
            .catch(errorHandler(res))
    })

    app.get('/matchs/:id_match/round/:round_number([1-6])', (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const roundNumber: RoundNumber = parseInt(req.params.round_number) as RoundNumber

        MatchController.getRound(idMatch, roundNumber)
            .then(round => res.status(200).json(round))
            .catch(errorHandler(res))
    }) 

    app.put("/matchs/:id_match/round", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const roundInput: RoundPlayer = req.body

        MatchController.getRound(idMatch, roundInput.roundNumber)
            .then(round => MatchController.computeRoundInput(idMatch, round, roundInput))
            .then(_ => MatchController.getMatchWithRounds(idMatch))
            .then(match => res.status(200).json(match))
            .catch(errorHandler(res))
    })
}

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}