import Database from "better-sqlite3"
import fs from 'fs'

export default class MatchRepository {
    db: Database.Database

    constructor() {
        this.db = new Database('db/matchs.db', { verbose: (message) => console.debug("\x1b[32mMatchs >", message, "\x1b[0m") })
        this.applyMigrations()
    }

    applyMigrations() {
        const applyMigration = (path: string) => {
            const migration = fs.readFileSync(path, 'utf-8')
            this.db.exec(migration)
        }

        let testRow = this.db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'matchs'").get()

        if (!testRow) {
            console.log('Applying migrations on DB matchs...')
            const migrations = ['db/migrations/init.sql']      
            migrations.forEach(applyMigration)
        }

        testRow = this.db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'rounds'").get()
        if (!testRow) {
            console.log("Create table rounds")
            applyMigration("db/migrations/rounds_init.sql")
        }
    }

    getAllMatchs = (): Promise<MatchList> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM matchs")
            resolve(statement.all())
        } catch (error) {
            reject(error)
        }
    })

    getMatchById = (id: Number |bigint): Promise<Match> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM matchs WHERE id = ?")
            const match = statement.get(id)
            if (!match)
                return reject({ ...Error('No match with this id'), statusCode: 404 })
            resolve(match)
        } catch (error) {
            reject(error)
        }
    })

    getCurrentMatchPlayer = (idPlayer: Number, current: boolean): Promise<MatchList> => new Promise((resolve, reject) => {
        try {
            let statusStatement = current ? " AND status != 'TERMINATED'" : ""
            const statement = this.db.prepare("SELECT * FROM matchs WHERE (idP1 = ? OR idP2 = ?)" + statusStatement)
            resolve(statement.all(idPlayer, idPlayer))
        } catch (error) {
            reject(error)
        }
    })

    createMatch = (newMatch: Match): Promise<number | bigint> => new Promise((resolve, reject) => {

        let rows: Array<string> = ['idp1']
        let phs: Array<string> = ['?']
        let values: Array<number | MatchStatus> = [newMatch.idP1]

        if (newMatch.idP2) {
            rows.push('idP2', 'status')
            phs.push('?', '?')
            values.push(newMatch.idP2, 'IN_PROGRESS')
        }

        const rowsS: string = rows.reduce((f, s) => `${f}, ${s}`)
        const phsS: string = phs.reduce((f, s) => `${f}, ${s}`)

        try {

            const statement = this.db.prepare(`INSERT INTO matchs(${rows}) VALUES (${phs})`)
            resolve(statement.run(values).lastInsertRowid)
        } catch (error) {
            reject(error)
        }
    }) 

    updateMatch = (idMatch: DBId, update: UpdateMatch): Promise<DBId> => new Promise((resolve, reject) => {
        let sets: Array<String> = []
        let values: Array<number | MatchStatus> = []

        if (update.idP2) {
            sets.push('idP2 = ?', 'status = ?')
            values.push(update.idP2, 'IN_PROGRESS')
        }

        const set: String = sets.reduce((first, second) => `${first}, ${second}`)

        try {
            const statement = this.db.prepare(`UPDATE matchs SET ${set} WHERE id = ?`)
            resolve(statement.run([...values, idMatch]).lastInsertRowid)
        } catch (error) {
            reject(error)
        }
    })

    deleteMatch = (idMatch: DBId): Promise<Database.RunResult>  => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("DELETE FROM matchs WHERE id = ?")
            resolve(statement.run(idMatch))
        } catch (error) {
            reject(error)
        }
    })

    getRounds = (idMatch: DBId): Promise<Rounds> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare('SELECT * FROM rounds WHERE matchId = ?')
            resolve(statement.all(idMatch))
        } catch (err) {
            reject(err)
        }
    })

    getRound = (idMatch: number, roundNumber: RoundNumber): Promise<Round> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare('SELECT * FROM rounds WHERE matchId = ? AND roundNumber = ?')
            resolve(statement.get(idMatch, roundNumber))
        } catch (err) {
            reject(err)
        }
    })

    createRound = (match: MatchWithRounds, round: RoundPlayer): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        if (round.roundNumber > 6) {
            return reject({ message: 'round number must be lesser than 7', statusCode: 400 })
        }

        if (round.roundNumber !== match.rounds.filter(r => r.status === 'TERMINATED').length + 1)
            return reject({ message: 'wait for previous round end', statusCode: 400 })

        try {
            let cols: Array<String> = ['matchId', 'roundNumber']
            let placeHolders: Array<String> = ['?', '?']
            let params: Array<number> = [match.id, round.roundNumber]

            if (round.pokemonP1) {
                cols.push('pokemonP1')
                placeHolders.push('?')
                params.push(round.pokemonP1)
            } else if (round.pokemonP2) {
                cols.push('pokemonP2')
                placeHolders.push('?')
                params.push(round.pokemonP2)
            }

            const colsS = cols.reduce((f, s) => `${f}, ${s}`)
            const placeHoldersS = placeHolders.reduce((f, s) => `${f}, ${s}`)

            const statement = this.db.prepare(`INSERT INTO rounds (${colsS}) VALUES (${placeHoldersS})`)
            resolve(statement.run(params))
        } catch (error) {
            reject(error)
        }
    })

    updateRound = (match: MatchWithRounds, roundInput: RoundPlayer): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        try {
            let params: Array<String> = []
            let values: Array<number  | string> = []

            if (roundInput.pokemonP1) {
                params.push('pokemonP1 = ?')
                values.push(roundInput.pokemonP1)
            } else if (roundInput.pokemonP2) {
                params.push('pokemonP2 = ?')
                values.push(roundInput.pokemonP2)
            }

            if (roundInput.status) {
                params.push('status = ?')
                values.push(roundInput.status)
            }

            if (roundInput.winner) {
                params.push('winner = ?')
                values.push(roundInput.winner)
            }

            let paramsS = params.reduce((f, s) => `${f}, ${s}`)

            const statement = this.db.prepare(`UPDATE rounds SET ${paramsS} WHERE matchId = ? AND roundNumber = ?`)
            resolve(statement.run(values, match.id, roundInput.roundNumber))
        } catch (error) {
            reject(error)
        }
    })

    updateRoundWinner = (matchId: DBId, roundNumber: RoundNumber, idWinner: DBId): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("UPDATE rounds set status = 'TERMINATED', winner = ? WHERE matchId = ? AND roundNumber = ?")
            resolve(statement.run(idWinner, matchId, roundNumber))
        } catch (error) {
            reject(error)
        }
    })

    updateWinner = (idMatch: DBId, idWinner: DBId): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("UPDATE matchs SET winner = ?, status = 'TERMINATED' WHERE id = ?")
            resolve(statement.run(idWinner, idMatch))
        } catch (error) {
            reject(error)
        }
    })
}