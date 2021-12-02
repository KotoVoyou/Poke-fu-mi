import Database from 'better-sqlite3'
import MatchRepository from './matchRepository'

import got from 'got'

const VICTORY_SCORE = 100

const repository = new MatchRepository()

const errorHandler = (res: any) => {
    return (error: any) => res.status(error.statusCode || 500).send(error.message || 'Error')
}

const listMatchs = () => repository.getAllMatchs()

const getMatchById = (id: Number | bigint) => repository.getMatchById(id)

const getCurrentMatchPlayer = (idPlayer: Number, current: boolean) => repository.getCurrentMatchPlayer(idPlayer, current)

const createMatch = (newMatch: Match) => repository.createMatch(newMatch)

export const validateMatchInProgressNumber = (idP?: number): Promise<void> => new Promise((resolve, reject) => {
    if (idP) {
        getCurrentMatchPlayer(idP, true)
            .then(matchs => {
                if (matchs.length > 2) {
                    return reject({ message: `Player ${idP} is playing too many matches`, statusCode: 400})
                }

                resolve()
            })
    } else {
        resolve()
    }
})

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

export const validateMatchInProgress = (match: MatchWithRounds): Promise<MatchWithRounds> => new Promise((resolve, reject) => {
    if (match.status == 'IN_PROGRESS'){
        return resolve(match)
    }

    reject({ message: 'the match is not started', statusCode: 400 })
})

export const createRound = (match: MatchWithRounds, round: RoundPlayer): Promise<Database.RunResult> => repository.createRound(match, round)

export const updateRound = (match: MatchWithRounds, round: RoundPlayer): Promise<Database.RunResult> => repository.updateRound(match, round)

export const computeRoundInput = (match: MatchWithRounds, roundInput: RoundPlayer): Promise<void> => new Promise((resolve, reject) => {
    let isMatchEnded = false, isRoundEnded = false

    const fRounds = match.rounds.filter(r => r.roundNumber === roundInput.roundNumber)
    if (fRounds.length > 0) {
        const round = fRounds[0]
        if (round.status === 'TERMINATED') 
            reject({ message: 'this round is terminated', statusCode: 400 })

        if ((round.pokemonP1 && roundInput.pokemonP2) || (round.pokemonP2 && roundInput.pokemonP1)) {
            isRoundEnded = true
            if (roundInput.roundNumber === 2)
                isMatchEnded = true
        }

        return updateRound(match, roundInput)
            .then(_ => {
                if (isRoundEnded)
                    return getRound(match.id, roundInput.roundNumber)
                        .then(r => computeRoundWinner(match.idP1, match.idP2, r))
            })
            .then(_ => {
                if (isMatchEnded)
                    return computeMatchWinner(match.id)
                        .then(winner => {
                            if (winner != 0) {
                                return getUser(winner)
                                    .then(user => updateUserScore(user.id, user.score + VICTORY_SCORE))
                            }
                        })
            })
            .then(_ => resolve())
            .catch(reject)
    }

    return createRound(match, roundInput)
        .then(_ => resolve())
        .catch(reject)
})

const pokemonRoundWinner = (pokemon1: Pokemon, pokemon2: Pokemon): Promise<PokemonDuelWinner> => new Promise((resolve, reject) => {
    getPokemonType(pokemon1)
        .then(typeP1 => getPokemonType(pokemon2)
            .then(typeP2 => pokemonTypeWinner(typeP1, typeP2)
                .then(r => {
                    if (r.winner === 1) {
                        resolve({ winner: pokemon1 })
                    } else if (r.winner === 2) {
                        resolve({ winner: pokemon2 })
                    } else {
                        resolve({ winner: 0 })
                    }
                })))
        .catch(reject)
})

const getPokemonType = (pokemon: Pokemon): Promise<PokemonType> => new Promise((resolve, reject) => {
    got.get('https://pokeapi.co/api/v2/pokemon/' + pokemon)
        .then(response => response.body)
        .then(body => JSON.parse(body))
        .then(json => json.types[0].type)
        .then(type => resolve(type))
        .catch(reject)
})

const pokemonTypeWinner = (typeP1: PokemonType, typeP2: PokemonType): Promise<PokemonDuelWinner> => new Promise((resolve, reject) => {
    getTypeDoubleDamageTo(typeP1)
        .then(doubleDamageP1 => getTypeDoubleDamageTo(typeP2)
            .then(doubleDamageP2 => {
                if (doubleDamageP1.findIndex(t => t.name === typeP2.name) > -1 ) {
                    resolve({ winner: 1 })
                } else if (doubleDamageP2.findIndex(t => t.name === typeP1.name) > -1) {
                    resolve({ winner: 2 })
                } else {
                    resolve({ winner: 0 })
                }                
            }))
        .catch(reject)
})

const getTypeDoubleDamageTo = (type: PokemonType): Promise<Array<PokemonType>> => new Promise((resolve, reject) => {
    got.get(type.url)
        .then(response => JSON.parse(response.body))
        .then(json => json.damage_relations.double_damage_to)
        .then(doubleDamage => resolve(doubleDamage))
        .catch(reject)
})

const computeRoundWinner = (idP1: number, idP2: number, round: Round): Promise<void> => new Promise((resolve, reject) => {
    pokemonRoundWinner(round.pokemonP1, round.pokemonP2)
        .then(r => {
            let idWinner = 0
            if (r.winner === round.pokemonP1) {
                idWinner = idP1
            } else if (r.winner === round.pokemonP2) {
                idWinner = idP2
            }

            return repository.updateRoundWinner(round.matchId, round.roundNumber, idWinner)
        })
        .then(_ => resolve())
        .catch(reject)
})

const computeMatchWinner = (idMatch: DBId): Promise<number> => new Promise((resolve, reject) => {
    getMatchWithRounds(idMatch)
        .then(match => {
            let cP1: number = 0, cP2: number = 0, winner: number = 0
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
                .then(_ => winner)
        })
        .then(winner => resolve(winner))
        .catch(reject)
})

const getUser = (idUser: DBId): Promise<User> => new Promise((resolve, reject) => {
    got.get(`http://users:5000/player?id=${idUser}`)
        .then(response => JSON.parse(response.body))
        .then(user => resolve(user))
        .catch(reject)
})

const updateUserScore = (idUser: DBId, newScore: number): Promise<void> => new Promise((resolve, reject) => {
    got.put(`http://users:5000/player/${idUser}`, {
        json: { score: newScore }
    })
        .then(_ => resolve())
        .catch(reject)
})

export { listMatchs, getMatchById, getCurrentMatchPlayer, createMatch }