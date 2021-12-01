import Database from 'better-sqlite3'
import MatchRepository from './matchRepository'

const repository = new MatchRepository()

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}

const listMatchs = () => repository.getAllMatchs()

const getMatchById = (id: Number | bigint) => repository.getMatchById(id)

const getCurrentMatchPlayer = (idPlayer: Number, current: boolean) => repository.getCurrentMatchPlayer(idPlayer, current)

const createMatch = (newMatch: Match) => repository.createMatch(newMatch)

export const updateMatch = (idMatch: number, update: UpdateMatch) => repository.updateMatch(idMatch, update)

export const getMatchWithRounds = (idMatch: DBId): Promise<MatchWithRounds> => new Promise((resolve, reject) => {
    getMatchById(idMatch)
        .then(match => {
            getRounds(idMatch)
                .then(rounds => resolve({
                    ...match,
                    rounds
                }))
        })
        .catch(reject) 
})

export const deleteMatch = (idMatch : number) => repository.deleteMatch(idMatch)

export const getRounds = (idMatch: number | bigint): Promise<Rounds> => repository.getRounds(idMatch)

export const getRound = (idMatch: number, roundNumber: RoundNumber): Promise<Round> => repository.getRound(idMatch, roundNumber)

export const createRound = (idMatch: number, round: RoundPlayer): Promise<Database.RunResult> => repository.createRound(idMatch, round)

export const updateRound = (idMatch: number, round: RoundPlayer): Promise<Database.RunResult> => repository.updateRound(idMatch, round)

export const computeRoundInput = (idMatch: number, round: Round, roundInput: RoundPlayer): Promise<void> => new Promise((resolve, reject) => {
    if (round) {
        if (round.status === 'TERMINATED') 
            reject({ ...Error('This round is terminated'), statusCode: 400 })

        if ((round.pokemonP1 && roundInput.pokemonP2) || (round.pokemonP2 && roundInput.pokemonP1))
            roundInput.status = 'TERMINATED'
            // TODO: set winner of round
            // TODO: if 6 set winner of match

        return updateRound(idMatch, roundInput)
            .then(_ => resolve())
    }
    return createRound(idMatch, roundInput)
        .then(_ => resolve())
})

export { listMatchs, getMatchById, getCurrentMatchPlayer, createMatch }