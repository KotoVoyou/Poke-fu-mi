import Database from "better-sqlite3"
import fs from 'fs'

const dbPromise = (action: any): Promise<any> => new Promise((resolve, reject) => {
    try {
        resolve(action())
    } catch (error) {
        reject(error)
    }
})
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

    getMatchById = (id: Number): Promise<Match> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM matchs WHERE id = ?")
            const match = statement.get(id)
            if (!match)
                return reject({ ...Error(), statusCode: 404 })
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

    createMatch = (newMatch: Match): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("INSERT INTO matchs(idP1, idP2) VALUES (?, ?)")
            return statement.run(newMatch.idP1, newMatch.idP2).lastInsertRowid
        } catch (error) {
            
        }
    }) 

    updateMatch = (idMatch: number, update: UpdateMatch): Promise<Database.RunResult> => dbPromise(() => {
        let sets: Array<String> = []
        let values: Array<number | String> = []

        if (update.idp2) {
            sets.push('idP2 = ?')
            values.push(update.idp2)
        }

        if (update.status) {
            sets.push('status = ?')
            values.push(update.status)
        }

        const set: String = sets.reduce((first, second) => `${first}, ${second}`)

        const statement = this.db.prepare(`UPDATE matchs SET ${set} WHERE id = ?`)
        return statement.run([...values, idMatch]).lastInsertRowid
    })

    deleteMatch = (idMatch: number): Promise<Database.RunResult>  => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("DELETE FROM matchs WHERE id = ?")
            resolve(statement.run(idMatch))
        } catch (error) {
            reject(error)
        }
    })

    getRounds = (idMatch: number): Promise<Rounds> => new Promise((resolve, reject) => {
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

    createRound = (idMatch: number, round: RoundPlayer): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        try {
            let cols: Array<String> = ['matchId', 'roundNumber']
            let placeHolders: Array<String> = ['?', '?']
            let params: Array<number> = [idMatch, round.roundNumber]

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

    updateRound = (idMatch: number, roundInput: RoundPlayer): Promise<Database.RunResult> => new Promise((resolve, reject) => {
        // TODO compute round result and or match winner
        // TODO: add round status
        console.log("update round")
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

            let paramsS = params.reduce((f, s) => `${f}, ${s}`)

            console.log(`UPDATE rounds SET ${paramsS} WHERE matchId = ? AND roundNumber = ?`)

            const statement = this.db.prepare(`UPDATE rounds SET ${paramsS} WHERE matchId = ? AND roundNumber = ?`)
            resolve(statement.run(values, idMatch, roundInput.roundNumber))
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}