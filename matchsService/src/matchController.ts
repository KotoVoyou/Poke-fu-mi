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

export const createRound = (match: MatchWithRounds, round: RoundPlayer): Promise<Database.RunResult> => repository.createRound(match, round)

export const updateRound = (idMatch: number, round: RoundPlayer): Promise<Database.RunResult> => repository.updateRound(idMatch, round)

export const computeRoundInput = (match: MatchWithRounds, roundInput: RoundPlayer): Promise<void> => new Promise((resolve, reject) => {
    let isMatchEnded = false

    const fRounds = match.rounds.filter(r => r.roundNumber === roundInput.roundNumber)
    if (fRounds.length > 0) {
        const round = fRounds[0]
        if (round.status === 'TERMINATED') 
            reject({ message: 'this round is terminated', statusCode: 400 })

        if ((round.pokemonP1 && roundInput.pokemonP2) || (round.pokemonP2 && roundInput.pokemonP1)) {
            roundInput.status = 'TERMINATED'
            roundInput.winner = match.idP1 // TODO: Set winner of the round
            if (roundInput.roundNumber === 1)
                isMatchEnded = true
        }

        return updateRound(match.id, roundInput)
            .then(_ => {
                if (isMatchEnded)
                    return computeMatchWinner(match.id)
            })
            .then(_ => resolve())
            .catch(reject)
    }

    return createRound(match, roundInput)
        .then(_ => resolve())
        .catch(reject)
})

const computeMatchWinner = (idMatch: DBId): Promise<void> => new Promise((resolve, reject) => {
    getMatchWithRounds(idMatch)
        .then(match => {
            let cP1: number = 0, cP2: number = 0, winner: number = 0
            console.log(cP1, cP2, winner)
            match.rounds.forEach(round => {
                if (round.winner === match.idP1) {
                    cP1++
                } else if (round.winner === match.idP2) {
                    cP2++
                }
            })

            if (cP1 > cP2) {
                winner = cP1
            } else if (cP2 > cP1) {
                winner = cP2
            }

            return repository.updateWinner(idMatch, winner)
        })
        .then(_ => resolve())
        .catch(reject)
})

export { listMatchs, getMatchById, getCurrentMatchPlayer, createMatch }