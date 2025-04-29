import { User } from '../schemas/User'
import { IUser, UserModel } from '../models/MongoUser' // Mongoose model and interface
import { UserRepository } from './UserRepository'
import { Converters } from '../utils/Converters'
import { EmailAlreadyExistsError, ValidationError } from '../errors/UserErrors'
import { Error } from 'mongoose'
import { MongoError } from 'mongodb'

export class MongooseUserRepository implements UserRepository {
  private userConverter: Converters<User, IUser>
  private reverseUserConverter: Converters<IUser, User>

  constructor(userConverter: Converters<User, IUser>, reverseUserConverter: Converters<IUser, User>) {
    this.userConverter = userConverter
    this.reverseUserConverter = reverseUserConverter
  }

  // Find all users
  async findAll(): Promise<User[]> {
    const users = await UserModel.find()
    return users.map(user => this.reverseUserConverter.convert(user.toObject()))
  }

  // Find a user by ID
  async findById(id: string): Promise<User | null> {
    const user = (await UserModel.findById(id).lean()) as IUser | null
    return user ? this.reverseUserConverter.convert(user) : null
  }

  // Create a new user
  async create(userData: User): Promise<User> {
    try {
      const userToInsert = this.userConverter.convert(userData)
      const createdUser = await UserModel.create(userToInsert)
      return this.reverseUserConverter.convert(createdUser.toObject())
    } catch (error) {
      if (error instanceof Error.ValidationError) {
        throw new ValidationError(error.message)
      } else if ((error as MongoError).code === 11000) {
        throw new EmailAlreadyExistsError(userData.email!)
      } else {
        throw error
      }
    }
  }

  // Update a user by ID
  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
    })
    const plainObject = updatedUser?.toObject()
    return plainObject ? this.reverseUserConverter.convert(plainObject) : null
  }

  // Delete a user by ID
  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id)
    return result !== null // Return true if a user was deleted
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = (await UserModel.findOne({
      email: email,
    }).lean()) as IUser | null
    return user ? this.reverseUserConverter.convert(user) : null
  }
}
