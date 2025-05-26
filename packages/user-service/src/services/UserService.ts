import { User } from '../schemas/User'
import { UserRepository } from '../repositories/UserRepository'
import { UserNotFoundError } from '../errors/UserErrors'
import logger from '@auction/common/logger'

export interface UserService {
  getUsers(): Promise<User[]>

  getUserById(id: string): Promise<User | null>

  createUser(userData: User): Promise<User>

  updateUser(id: string, updateData: Partial<User>): Promise<User>

  deleteUser(id: string): Promise<void>

  getUserByEmail(email: string): Promise<User>
}

export class UserServiceImpl implements UserService {
  private userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.findAll()
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      logger.warn(`User with ID ${id} not found.`)
      throw new UserNotFoundError('id', id)
    }
    return user
  }

  async createUser(userData: User): Promise<User> {
    const newUser = await this.userRepository.create(userData)
    if (!newUser) {
      logger.error('Failed to create user.')
      throw new Error('Failed to create user.')
    }
    return newUser
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userRepository.update(id, updateData)
    if (!updatedUser) {
      logger.warn(`Failed to update user with ID ${id}`)
      throw new UserNotFoundError('id', id)
    }
    return updatedUser
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id)
    if (!deleted) {
      logger.warn(`Failed to delete user with ID ${id}`)
      throw new UserNotFoundError('id', id)
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      logger.warn(`User with email ${email} not found.`)
      throw new UserNotFoundError('email', email)
    }
    return user
  }
}
