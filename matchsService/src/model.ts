interface User {
    id: number;
    username: string;
    password: String;
    score: number;
}

type UserList = Array<User>;

type MatchStatus = "CREATED" | "IN_PROGRESS" | "TERMINATED"

type Pokemon = number
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