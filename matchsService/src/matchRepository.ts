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

        const testRow = this.db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'matchs'").get()

        if (!testRow) {
            console.log('Applying migrations on DB users...')
            const migrations = ['db/migrations/init.sql']      
            migrations.forEach(applyMigration)
        }
    }

    getAllMatchs(): MatchList {
        const statement = this.db.prepare("SELECT * FROM matchs")
        const rows: MatchList = statement.all()
        return rows
    }

    getMatchById(id: Number): Match {
        const statement = this.db.prepare("SELECT * FROM matchs WHERE id = ?")
        return statement.get(id)
    }

    getCurrentMatchPlayer(idPlayer: Number, current: boolean): MatchList {
        let statusStatement = current ? " AND status != 'TERMINATED'" : ""
        const statement = this.db.prepare("SELECT * FROM matchs WHERE (idP1 = ? OR idP2 = ?)" + statusStatement)
        return statement.all(idPlayer, idPlayer)
    }

    createMatch(newMatch: Match) {
        const statement = this.db.prepare("INSERT INTO matchs(idP1, idP2) VALUES (?, ?)")
        return statement.run(newMatch.idP1, newMatch.idP2).lastInsertRowid
    }

    updateMatch(idMatch: number, update: UpdateMatch) {
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
    }
}