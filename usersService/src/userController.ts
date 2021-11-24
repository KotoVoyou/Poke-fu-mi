import UserRepository from './userRepository'

const userRepository = new UserRepository()

const listUsers = () => userRepository.getAllUsers()

const getUserById = (id: Number) => userRepository.getUserById(id)

const getUserByUsername = (username: String) => userRepository.getUserByUsername(username)

const getUsersTop = (top: Number) => userRepository.getUserTop(top)

const addUser = (newUser: User) => {
    userRepository.createUser(newUser)
    return userRepository.getAllUsers()
}

export { listUsers, getUserById, getUserByUsername, getUsersTop, addUser }