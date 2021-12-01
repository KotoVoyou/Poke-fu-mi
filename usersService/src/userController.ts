import UserRepository from './userRepository'

const userRepository = new UserRepository()

export const listUsers = () => userRepository.getAllUsers()

export const getUserById = (id: Number | bigint) => userRepository.getUserById(id)

export const getUserByUsername = (username: String) => userRepository.getUserByUsername(username)

export const getUsersTop = (top: Number) => userRepository.getUserTop(top)

export const addUser = (newUser: User) => userRepository.createUser(newUser)

export const updateUser = (idUser: number, update: UserUpdate) => userRepository.updateUser(idUser, update)

export const validateUserPassword = (user: User, password: String): Promise<User> => new Promise((resolve, reject) => {
    if (password !== user.password)
        return reject({...Error('Wrong password'), statusCode: 400})

    resolve(user)
})