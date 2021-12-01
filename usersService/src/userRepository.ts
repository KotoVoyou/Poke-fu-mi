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

    getAllUsers = (): Promise<UserList> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM users")
            resolve(statement.all())
        } catch (error) {
            reject(error)
        }
    })

    getUserById = (id: Number | bigint): Promise<User> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM users WHERE id = ?")
            const user:User = statement.get(id)
            if (!user)
                return reject({ message: "no user with this id", statusCode: 404})
            resolve(user)
        } catch (error) {
            reject(error)
        }
    })

    getUserByUsername = (username: String): Promise<User> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM users WHERE name = ?")
            const user:User = statement.get(username)
            if (!user)
                return reject({ message: "no user with this username", statusCode: 404})
            resolve(user)
        } catch (error) {
            reject(error)
        }
    }) 

    getUserTop = (top: Number): Promise<UserList> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("SELECT * FROM users ORDER BY score DESC LIMIT ?")
            resolve(statement.all(top))
        } catch (error) {
            reject(error)
        }
    })

    createUser = (newUser: User): Promise<number | bigint> => new Promise((resolve, reject) => {
        try {
            const statement = this.db.prepare("INSERT INTO users(name, password) VALUES (?, ?)")
            resolve(statement.run(newUser.username, newUser.password).lastInsertRowid)
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                error.statusCode = 400
                error.message = 'duplicate username'
            }
            reject(error)
        }
    })
}