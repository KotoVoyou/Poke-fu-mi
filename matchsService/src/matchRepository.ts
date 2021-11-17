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

    createMatch(newMatch: Match) {
        const statement = this.db.prepare("INSERT INTO matchs(idP1, idP2) VALUES (?, ?)")
        return statement.run(newMatch.idP1, newMatch.idP2).lastInsertRowid
    }
}