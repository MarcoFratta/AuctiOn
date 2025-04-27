import { User } from '../schemas/User'

export interface UserRepository {
  findAll(): Promise<User[]>

  findById(id: string): Promise<User | null>

  create(userData: User): Promise<User>

  update(id: string, updateData: Partial<User>): Promise<User | null>

  delete(id: string): Promise<boolean>

  findByEmail(email: string): Promise<User | null>
}
