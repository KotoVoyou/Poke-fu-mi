import MatchRepository from './matchRepository'

const repository = new MatchRepository()

const listMatchs = () => repository.getAllMatchs()

const getMatchById = (id: Number) => repository.getMatchById(id)

const getCurrentMatchPlayer = (idPlayer: Number, current: boolean) => repository.getCurrentMatchPlayer(idPlayer, current)

const createMatch = (newMatch: Match) => {
    repository.createMatch(newMatch)
    return repository.getAllMatchs()
}

export { listMatchs, getMatchById, getCurrentMatchPlayer, createMatch }