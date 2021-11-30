import jwt from 'jsonwebtoken'

const JWT_SECRET = "SECRET"

export const signJWT = (payload: any): Promise<string> => new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, (err: any, token: string) => {
        if (err) {
            return reject(err)
        }

        resolve(token)
    })
})

export const verifyJWT = (token: string): Promise<void> => new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, _) => {
        if (err) {
            return reject(err)
        }

        resolve()
    })
})