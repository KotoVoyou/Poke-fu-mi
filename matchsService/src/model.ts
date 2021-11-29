interface User {
    id: number;
    username: string;
    password: String;
    score: number;
}

type UserList = Array<User>;

type MatchStatus = "CREATED" | "IN_PROGRESS" | "TERMINATED"

type Pokemon = number // Id of the pokemon in the PokeAPI
type PokemonDeck = Array<Pokemon>

interface Match {
    id: number;
    idP1: number;
    idP2 ? : number;
    status: MatchStatus
    pokemonsP1 ? : PokemonDeck
    pokemonsP2 ? : PokemonDeck
    winner ? : number
}

type MatchList = Array<Match>;

interface UpdateMatch {
    idp2 ? : number
    pokemonP1 ? : PokemonDeck
    pokemonP2 ? : PokemonDeck
    status ? : MatchStatus
}

type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6

type RoundStatus = "STARTED" | "TERMINATED"

interface RoundPlayer {
    roundNumber: RoundNumber
    pokemonP1?: Pokemon
    pokemonP2?: Pokemon
    status?: RoundStatus
}

interface Round {
    matchId: number
    roundNumber: RoundNumber
    pokemonP1: Pokemon
    pokemonP2: Pokemon
    status: RoundStatus
    winner: number
}

interface MatchWithRounds extends Match {
    rounds: Rounds
}

type Rounds = Array<Round>