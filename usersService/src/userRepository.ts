import Database from "better-sqlite3"
import fs from 'fs'

export default class UserRepository {
    db: Database.Database

    constructor() {
        this.db = new Database('db/users.db', { verbose: (message) => console.debug("\x1b[32mUsers >", message, "\x1b[0m") })
        this.applyMigrations()
    }

    applyMigrations() {
        const applyMigration = (path: string) => {
            const migration = fs.readFileSync(path, 'utf-8')
            this.db.exec(migration)
        }

        const testRow = this.db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = 'users'").get()

        if (!testRow) {
            console.log('Applying migrations on DB users...')
            const migrations = ['db/migrations/init.sql']      
            migrations.forEach(applyMigration)
        }
    }

    getAllUsers(): UserList {
        const statement = this.db.prepare("SELECT * FROM users")
        const rows: UserList = statement.all()
        return rows
    }

    getUserById(id: Number): User {
        const statement = this.db.prepare("SELECT * FROM users WHERE id = ?")
        return statement.get(id)
    }

    getUserByUsername(username: String): User {
        const statement = this.db.prepare("SELECT * FROM users WHERE name = ?")
        return statement.get(username)
    }

    getUserTop(top: Number): UserList {
        const statement = this.db.prepare("SELECT * FROM users ORDER BY score DESC LIMIT ?")
        return statement.all(top)
    }

    createUser(newUser: User) {
        const statement = this.db.prepare("INSERT INTO users(name, password) VALUES (?, ?)")
        return statement.run(newUser.username, newUser.password).lastInsertRowid
    }
}